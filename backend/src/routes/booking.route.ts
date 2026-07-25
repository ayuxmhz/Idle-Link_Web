import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { etagMiddleware } from "../middlewares/etag.middleware";

const bookingRouter = Router();
const bookingController = new BookingController();

bookingRouter.use(authorizedMiddleware);

bookingRouter.post("/", bookingController.createBooking);
bookingRouter.get("/", etagMiddleware, bookingController.listMine);
bookingRouter.get("/:id", etagMiddleware, bookingController.getBooking);
bookingRouter.patch("/:id", bookingController.updateStatus);
bookingRouter.delete("/:id", bookingController.deleteBooking);

export default bookingRouter;
