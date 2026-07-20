import express, { Application, NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";

// routes
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import deviceRoutes from "./routes/device.route";
import bookingRoutes from "./routes/booking.route";
import transactionRoutes from "./routes/transaction.route";
import adminDeviceRoutes from "./routes/admin/device.route";
import adminTransactionRoutes from "./routes/admin/transaction.route";
import adminStatsRoutes from "./routes/admin/stats.route";
import esewaRoutes from "./routes/esewa.route";
import matcherRoutes from "./routes/matcher.route";

const app: Application = express();
const corsOptions = {
    origin: ["*"], // ["http://localhost:3000", "http://example.com"]
    successStatus: 200
}
app.use(cors(corsOptions)); // enable CORS for all routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(morgan("combined")); // log all requests

app.use("/api/v1/auth", userRoutes); // user related routes
app.use("/api/v1/admin/users", adminUserRoutes); // admin user routes
app.use("/api/v1/devices", deviceRoutes); // device listing routes
app.use("/api/v1/bookings", bookingRoutes); // booking / job routes
app.use("/api/v1/transactions", transactionRoutes); // wallet transaction routes
app.use("/api/v1/admin/devices", adminDeviceRoutes); // admin device management routes
app.use("/api/v1/admin/transactions", adminTransactionRoutes); // admin transaction routes
app.use("/api/v1/admin/stats", adminStatsRoutes); // admin dashboard stats routes
app.use("/api/v1/transactions/esewa", esewaRoutes); // eSewa payment routes
app.use("/api/v1/matcher", matcherRoutes); // AI job matcher routes

// Serve static files from public directory
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// global api handler (at the last)
app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "API not found" });
    }
)
// global error handler (at the last)
app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
        if (err instanceof HttpException) {
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }
        return ApiResponseHelper.error(
            res, err?.message || "Internal Server Error", 500
        );
    }
)

export default app;
export { PORT, DUMMY } from "./configs/constant";