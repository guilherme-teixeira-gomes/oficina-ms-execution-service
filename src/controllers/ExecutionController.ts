import { Request, Response } from "express";
import { ExecutionModel } from "../models/Execution";
import { FinalizarExecucaoUseCase } from "../useCases/FinalizarExecucaoUseCase";
import { FalharExecucaoUseCase } from "../useCases/FalharExecucaoUseCase";

export class ExecutionController {
  async list(_req: Request, res: Response) {
    const execucoes = await ExecutionModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: execucoes });
  }

  async getByOrder(req: Request, res: Response) {
    const execution = await ExecutionModel.findOne({ orderId: Number(req.params.orderId) });
    if (!execution) return res.status(404).json({ success: false, error: "Execução não encontrada" });
    return res.json({ success: true, data: execution });
  }

  async finish(req: Request, res: Response) {
    const execution = await new FinalizarExecucaoUseCase().execute(Number(req.params.orderId));
    return res.json({ success: true, message: "Execução finalizada", data: execution });
  }

  async fail(req: Request, res: Response) {
    const reason = req.body?.reason || "falha manual";
    const execution = await new FalharExecucaoUseCase().execute(Number(req.params.orderId), reason);
    return res.json({ success: true, message: "Execução marcada como falha (compensação disparada)", data: execution });
  }
}
