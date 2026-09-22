import { ExecutionModel } from "../models/Execution";
import { publishEvent } from "../messaging/rabbitmq";

/**
 * Finaliza a execução de uma OS. Marca todos os itens como concluídos,
 * atualiza o documento e avisa o orquestrador (os.execucao-finalizada).
 */
export class FinalizarExecucaoUseCase {
  async execute(orderId: number) {
    const execution = await ExecutionModel.findOne({ orderId });
    if (!execution) throw new Error("Execução não encontrada");

    execution.status = "FINALIZADA";
    execution.finishedAt = new Date();
    execution.items.forEach((i) => (i.status = "CONCLUIDO"));
    await execution.save();

    await publishEvent("os.execucao-finalizada", {
      sagaId: execution.sagaId, orderId,
    });

    return execution;
  }
}
