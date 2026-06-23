import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/whoami", authorizedMiddleware, userController.whoami);
userRouter.put("/update", authorizedMiddleware, upload.single("profilePicture"), userController.updateProfile);
userRouter.put("/update-password", authorizedMiddleware, userController.updatePassword);

export default userRouter;