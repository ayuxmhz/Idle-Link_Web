import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.use(authorizedMiddleware);

notificationRouter.get("/", notificationController.listMine);
notificationRouter.get("/unread-count", notificationController.getUnreadCount);
notificationRouter.post("/mark-all-read", notificationController.markAllAsRead);
notificationRouter.patch("/:id/read", notificationController.markAsRead);

export default notificationRouter;
