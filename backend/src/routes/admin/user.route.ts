import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authorizedMiddleware, adminMiddleware);

// api endpoints for admin user management
router.get("/", adminUserController.getUsers);
router.get("/:id", adminUserController.getUser);
router.post("/", adminUserController.createUser);
router.put("/:id", adminUserController.updateUser);
router.patch("/:id", adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);

export default router;
