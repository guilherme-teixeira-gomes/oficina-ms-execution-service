import { subscribe } from "./rabbitmq";
import { IniciarExecucaoUseCase } from "../useCases/IniciarExecucaoUseCase";

/**
 * Registra os consumidores dos comandos que o Execution Service recebe
 * do orquestrador via RabbitMQ.
 */
export async function registerConsumers(): Promise<void> {
  await subscribe("execution.iniciar", "execution.iniciar", async (msg) => {
    await new IniciarExecucaoUseCase().execute(msg);
  });
}
