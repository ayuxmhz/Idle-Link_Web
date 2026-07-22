import { Router } from "express";
import { AdminDeviceController } from "../../controllers/admin/device.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminDeviceController = new AdminDeviceController();

router.use(authorizedMiddleware, adminMiddleware);

router.get("/", adminDeviceController.getDevices);
router.delete("/:id", adminDeviceController.deleteDevice);

export default router;
