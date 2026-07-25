import { Router } from "express";
import { MatcherController } from "../controllers/matcher.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const matcherRouter = Router();
const matcherController = new MatcherController();

matcherRouter.use(authorizedMiddleware);

matcherRouter.post("/", matcherController.findMatches);

export default matcherRouter;
