import request from "supertest";
import express from "express";
import "express-async-errors";
import { ExecutionModel } from "../src/models/Execution";
import * as rabbit from "../src/messaging/rabbitmq";

jest.mock("../src/messaging/rabbitmq");
jest.mock("../src/models/Execution");

import { routes } from "../src/routes/routes";

const app = express();
app.use(express.json());
app.use(routes);

describe("Rotas HTTP do Execution Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (rabbit.publishEvent as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  it("GET /execution lista execuções", async () => {
    (ExecutionModel.find as jest.Mock) = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ orderId: 1 }]) });
    const res = await request(app).get("/execution");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("GET /execution/:orderId retorna 404 se não existe", async () => {
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
    const res = await request(app).get("/execution/999");
    expect(res.status).toBe(404);
  });

  it("POST /execution/:orderId/finish finaliza", async () => {
    const doc: any = { orderId: 1, status: "EM_EXECUCAO", items: [], save: jest.fn().mockResolvedValue(undefined) };
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(doc);
    const res = await request(app).post("/execution/1/finish");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("FINALIZADA");
  });

  it("POST /execution/:orderId/fail dispara compensação", async () => {
    const doc: any = { orderId: 1, status: "EM_EXECUCAO", items: [], save: jest.fn().mockResolvedValue(undefined) };
    (ExecutionModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(doc);
    const res = await request(app).post("/execution/1/fail").send({ reason: "teste" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("FALHOU");
  });
});
