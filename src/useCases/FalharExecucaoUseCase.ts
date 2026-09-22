import { ExecutionModel } from "../models/Execution";
import { publishEvent } from "../messaging/rabbitmq";

/**
 * Marca a execução como falha e dispara a compensação do Saga
 * (os.execucao-falhou), que fará o OS Service estornar o pagamento
 * e cancelar a OS.
 */
export class FalharExecucaoUseCase {
  async execute(orderId: number, reason: string) {
    const execution = await ExecutionModel.findOne({ orderId });
    if (!execution) throw new Error("Execução não encontrada");

    execution.status = "FALHOU";
    execution.finishedAt = new Date();
    await execution.save();

    await publishEvent("os.execucao-falhou", {
      sagaId: execution.sagaId, orderId, reason,
    });

    return execution;
  }
}
