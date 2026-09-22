import swaggerUi from "swagger-ui-express";
import { Express } from "express";

/**
 * Documentação OpenAPI do Execution Service.
 * Acessível em /api-docs quando o serviço está rodando.
 */
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Execution Service — Oficina",
    version: "1.0.0",
    description:
      "Microsserviço de Execução e Produção (Tech Challenge Fase 4). " +
      "Gerencia a fila de execução dos reparos usando MongoDB (banco NoSQL). Participa do Saga " +
      "consumindo execution.iniciar por RabbitMQ e publicando os.execucao-iniciada, " +
      "os.execucao-finalizada e os.execucao-falhou (compensação).",
  },
  tags: [{ name: "Execução" }],
  paths: {
    "/execution": {
      get: {
        tags: ["Execução"],
        summary: "Lista todas as execuções",
        responses: { "200": { description: "Lista de execuções" } },
      },
    },
    "/execution/{orderId}": {
      get: {
        tags: ["Execução"],
        summary: "Consulta a execução de uma OS",
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Execução encontrada" },
          "404": { description: "Execução não encontrada" },
        },
      },
    },
    "/execution/{orderId}/finish": {
      post: {
        tags: ["Execução"],
        summary: "Finaliza a execução (publica os.execucao-finalizada)",
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Execução finalizada" } },
      },
    },
    "/execution/{orderId}/fail": {
      post: {
        tags: ["Execução"],
        summary: "Marca falha na execução (dispara compensação do Saga)",
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { reason: { type: "string" } } },
              example: { reason: "peça indisponível" },
            },
          },
        },
        responses: { "200": { description: "Falha registrada, compensação disparada" } },
      },
    },
    "/health": {
      get: { tags: ["Execução"], summary: "Healthcheck", responses: { "200": { description: "ok" } } },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
