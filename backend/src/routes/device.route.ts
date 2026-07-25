import { Router } from "express";
import { DeviceController } from "../controllers/device.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { etagMiddleware } from "../middlewares/etag.middleware";

const deviceRouter = Router();
const deviceController = new DeviceController();

deviceRouter.use(authorizedMiddleware);

deviceRouter.get("/", etagMiddleware, deviceController.listDevices);
deviceRouter.get("/:id", etagMiddleware, deviceController.getDevice);
deviceRouter.post("/", deviceController.createDevice);
deviceRouter.put("/:id", deviceController.updateDevice);
deviceRouter.patch("/:id", deviceController.updateDevice);
deviceRouter.delete("/:id", deviceController.deleteDevice);

export default deviceRouter;
