import { IniciarExecucaoUseCase } from "../src/useCases/IniciarExecucaoUseCase";
import { ExecutionModel } from "../src/models/Execution";
import * as rabbit from "../src/messaging/rabbitmq";

jest.mock("../src/messaging/rabbitmq");
jest.mock("../src/models/Execution");

describe("IniciarExecucaoUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rabbit.publishEvent as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (ExecutionModel.create as jest.Mock) = jest.fn().mockImplementation((doc) => Promise.resolve(doc));
  });

  it("deve criar execução EM_EXECUCAO", async () => {
    const exec = await new IniciarExecucaoUseCase().execute({ sagaId: "s1", orderId: 1 });
    expect(exec.status).toBe("EM_EXECUCAO");
    expect(exec.orderId).toBe(1);
    expect(ExecutionModel.create).toHaveBeenCalled();
  });

  it("deve publicar os.execucao-iniciada", async () => {
    await new IniciarExecucaoUseCase().execute({ sagaId: "s1", orderId: 1 });
    expect(rabbit.publishEvent).toHaveBeenCalledWith("os.execucao-iniciada", expect.objectContaining({ orderId: 1 }));
  });

  it("deve usar item padrão quando não informado", async () => {
    const exec = await new IniciarExecucaoUseCase().execute({ sagaId: "s1", orderId: 2 });
    expect(exec.items.length).toBe(1);
    expect(exec.items[0].descricao).toBe("Reparo geral");
  });

  it("deve mapear itens informados", async () => {
    const exec = await new IniciarExecucaoUseCase().execute({
      sagaId: "s1", orderId: 3, items: [{ descricao: "Freio" }, { descricao: "Óleo" }],
    });
    expect(exec.items.length).toBe(2);
    expect(exec.items[0].status).toBe("EM_ANDAMENTO");
  });
});
