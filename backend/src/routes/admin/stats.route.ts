import { Router } from "express";
import { AdminStatsController } from "../../controllers/admin/stats.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminStatsController = new AdminStatsController();

router.use(authorizedMiddleware, adminMiddleware);

router.get("/overview", adminStatsController.getOverview);

export default router;
