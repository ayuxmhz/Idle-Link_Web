import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/google", userController.googleAuth);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password", userController.resetPassword);
userRouter.get("/whoami", authorizedMiddleware, userController.whoami);
userRouter.put(
    "/update",
    authorizedMiddleware,
    upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    userController.updateProfile
);
userRouter.put("/update-password", authorizedMiddleware, userController.updatePassword);
userRouter.post("/send-verification-email", authorizedMiddleware, userController.sendEmailOtp);
userRouter.post("/send-verification-phone", authorizedMiddleware, userController.sendPhoneOtp);
userRouter.post("/verify-email", authorizedMiddleware, userController.verifyEmailOtp);
userRouter.post("/verify-phone", authorizedMiddleware, userController.verifyPhoneOtp);

export default userRouter;