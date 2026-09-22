/**
 * Teste BDD do fluxo de execução (Execution Service).
 * Estilo Given/When/Then — requisito do Tech Challenge Fase 4.
 * Usa mock do Mongoose para rodar em qualquer ambiente sem binário externo.
 */
import { IniciarExecucaoUseCase } from "../src/useCases/IniciarExecucaoUseCase";
import { FinalizarExecucaoUseCase } from "../src/useCases/FinalizarExecucaoUseCase";
import { FalharExecucaoUseCase } from "../src/useCases/FalharExecucaoUseCase";
import { ExecutionModel } from "../src/models/Execution";
import * as rabbit from "../src/messaging/rabbitmq";

jest.mock("../src/messaging/rabbitmq");
jest.mock("../src/models/Execution");

describe("FEATURE: Execução de reparos de uma OS", () => {
  let store: Record<number, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = {};
    (rabbit.publishEvent as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (ExecutionModel.create as jest.Mock) = jest.fn().mockImplementation((doc) => {
      const rec = { ...doc, save: jest.fn().mockResolvedValue(undefined) };
      store[doc.orderId] = rec;
      return Promise.resolve(rec);
    });
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockImplementation((q) => Promise.resolve(store[q.orderId] || null));
  });

  describe("CENÁRIO: Execução concluída com sucesso", () => {
    it("DADO um comando de início, QUANDO executa, ENTÃO cria execução e avisa o orquestrador", async () => {
      await new IniciarExecucaoUseCase().execute({ sagaId: "s1", orderId: 100 });
      expect(store[100].status).toBe("EM_EXECUCAO");
      expect(rabbit.publishEvent).toHaveBeenCalledWith("os.execucao-iniciada", expect.anything());
    });

    it("DADO uma execução em andamento, QUANDO finaliza, ENTÃO conclui e avisa o orquestrador", async () => {
      await new IniciarExecucaoUseCase().execute({ sagaId: "s1", orderId: 100 });
      await new FinalizarExecucaoUseCase().execute(100);
      expect(store[100].status).toBe("FINALIZADA");
      expect(rabbit.publishEvent).toHaveBeenCalledWith("os.execucao-finalizada", expect.anything());
    });
  });

  describe("CENÁRIO: Falha na execução dispara compensação", () => {
    it("DADO uma execução em andamento, QUANDO falha, ENTÃO dispara os.execucao-falhou", async () => {
      await new IniciarExecucaoUseCase().execute({ sagaId: "s1", orderId: 200 });
      await new FalharExecucaoUseCase().execute(200, "sem peça");
      expect(store[200].status).toBe("FALHOU");
      expect(rabbit.publishEvent).toHaveBeenCalledWith("os.execucao-falhou", expect.objectContaining({ reason: "sem peça" }));
    });
  });
});
