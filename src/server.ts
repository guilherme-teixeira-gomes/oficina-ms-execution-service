import "express-async-errors";
import express from "express";
import cors from "cors";
import { connectMongo } from "./database/connection";
import { routes } from "./routes/routes";
import { connectRabbitMQ } from "./messaging/rabbitmq";
import { registerConsumers } from "./messaging/consumers";

export const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "execution-service" }));

const PORT = Number(process.env.PORT || 3000);

async function bootstrap() {
  await connectMongo();
  await connectRabbitMQ();
  await registerConsumers();
  app.listen(PORT, () => {
    console.log(JSON.stringify({ level: "info", message: "execution-service iniciado", port: PORT }));
  });
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error(JSON.stringify({ level: "error", message: "falha ao iniciar", error: err.message }));
    process.exit(1);
  });
}
