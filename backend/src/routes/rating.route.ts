import { Router } from "express";
import { RatingController } from "../controllers/rating.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const ratingRouter = Router();
const ratingController = new RatingController();

ratingRouter.get("/device/:deviceId", ratingController.getDeviceRatings);
ratingRouter.post("/", authorizedMiddleware, ratingController.createRating);

export default ratingRouter;
