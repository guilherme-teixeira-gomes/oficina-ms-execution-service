import { FinalizarExecucaoUseCase } from "../src/useCases/FinalizarExecucaoUseCase";
import { ExecutionModel } from "../src/models/Execution";
import * as rabbit from "../src/messaging/rabbitmq";

jest.mock("../src/messaging/rabbitmq");
jest.mock("../src/models/Execution");

describe("FinalizarExecucaoUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rabbit.publishEvent as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  it("deve finalizar execução e concluir itens", async () => {
    const doc: any = {
      orderId: 1, sagaId: "s1", status: "EM_EXECUCAO",
      items: [{ descricao: "X", status: "EM_ANDAMENTO" }],
      save: jest.fn().mockResolvedValue(undefined),
    };
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(doc);

    const exec = await new FinalizarExecucaoUseCase().execute(1);
    expect(exec.status).toBe("FINALIZADA");
    expect(exec.items[0].status).toBe("CONCLUIDO");
    expect(doc.save).toHaveBeenCalled();
    expect(rabbit.publishEvent).toHaveBeenCalledWith("os.execucao-finalizada", expect.objectContaining({ orderId: 1 }));
  });

  it("deve lançar erro se execução não existe", async () => {
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
    await expect(new FinalizarExecucaoUseCase().execute(999)).rejects.toThrow("não encontrada");
  });
});
