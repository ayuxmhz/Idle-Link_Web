import { Router } from "express";
import { AdminTransactionController } from "../../controllers/admin/transaction.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminTransactionController = new AdminTransactionController();

router.use(authorizedMiddleware, adminMiddleware);

router.get("/", adminTransactionController.getTransactions);

export default router;
