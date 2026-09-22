import { ExecutionModel } from "../models/Execution";
import { publishEvent } from "../messaging/rabbitmq";

interface IniciarInput {
  sagaId: string;
  orderId: number;
  items?: Array<{ descricao: string }>;
}

/**
 * Recebe o comando execution.iniciar do orquestrador (OS Service),
 * cria o documento de execução no MongoDB, coloca na fila e imediatamente
 * inicia. Publica os.execucao-iniciada de volta.
 */
export class IniciarExecucaoUseCase {
  async execute(input: IniciarInput) {
    const execution = await ExecutionModel.create({
      orderId: input.orderId,
      sagaId: input.sagaId,
      status: "EM_EXECUCAO",
      startedAt: new Date(),
      items: (input.items || [{ descricao: "Reparo geral" }]).map((i) => ({
        descricao: i.descricao, status: "EM_ANDAMENTO",
      })),
    });

    await publishEvent("os.execucao-iniciada", {
      sagaId: input.sagaId, orderId: input.orderId,
    });

    return execution;
  }
}
