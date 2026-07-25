import { Router } from "express";
import { EsewaController } from "../controllers/esewa.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const esewaRouter = Router();
const esewaController = new EsewaController();

esewaRouter.use(authorizedMiddleware);

esewaRouter.post("/initiate", esewaController.initiate);
esewaRouter.post("/verify", esewaController.verify);

export default esewaRouter;
