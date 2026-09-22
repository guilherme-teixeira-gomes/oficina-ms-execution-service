import { Router } from "express";
import { ExecutionController } from "../controllers/ExecutionController";

const routes = Router();
const controller = new ExecutionController();

routes.get("/execution", (req, res) => controller.list(req, res));
routes.get("/execution/:orderId", (req, res) => controller.getByOrder(req, res));
routes.post("/execution/:orderId/finish", (req, res) => controller.finish(req, res));
routes.post("/execution/:orderId/fail", (req, res) => controller.fail(req, res));

export { routes };
