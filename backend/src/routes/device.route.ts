import { Router } from "express";
import { DeviceController } from "../controllers/device.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const deviceRouter = Router();
const deviceController = new DeviceController();

deviceRouter.use(authorizedMiddleware);

deviceRouter.get("/", deviceController.listDevices);
deviceRouter.get("/:id", deviceController.getDevice);
deviceRouter.post("/", deviceController.createDevice);
deviceRouter.put("/:id", deviceController.updateDevice);
deviceRouter.patch("/:id", deviceController.updateDevice);
deviceRouter.delete("/:id", deviceController.deleteDevice);

export default deviceRouter;
