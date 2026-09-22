import { FalharExecucaoUseCase } from "../src/useCases/FalharExecucaoUseCase";
import { ExecutionModel } from "../src/models/Execution";
import * as rabbit from "../src/messaging/rabbitmq";

jest.mock("../src/messaging/rabbitmq");
jest.mock("../src/models/Execution");

describe("FalharExecucaoUseCase (compensação do Saga)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rabbit.publishEvent as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  it("deve marcar como FALHOU e publicar os.execucao-falhou", async () => {
    const doc: any = { orderId: 1, sagaId: "s1", status: "EM_EXECUCAO", items: [], save: jest.fn().mockResolvedValue(undefined) };
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(doc);

    const exec = await new FalharExecucaoUseCase().execute(1, "peça quebrou");
    expect(exec.status).toBe("FALHOU");
    expect(rabbit.publishEvent).toHaveBeenCalledWith("os.execucao-falhou", expect.objectContaining({ orderId: 1, reason: "peça quebrou" }));
  });

  it("deve lançar erro se execução não existe", async () => {
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
    await expect(new FalharExecucaoUseCase().execute(999, "x")).rejects.toThrow("não encontrada");
  });
});
