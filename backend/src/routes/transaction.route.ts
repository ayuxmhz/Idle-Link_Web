import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const transactionRouter = Router();
const transactionController = new TransactionController();

transactionRouter.use(authorizedMiddleware);

// /summary must stay above any future "/:id" route to avoid Express matching
// "summary" as an :id param.
transactionRouter.get("/summary", transactionController.getSummary);
transactionRouter.get("/", transactionController.listMine);
transactionRouter.post("/deposit", transactionController.deposit);
transactionRouter.post("/withdraw", transactionController.withdraw);

export default transactionRouter;
