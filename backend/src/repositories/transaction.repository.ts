import mongoose from "mongoose";
import { TransactionModel, ITransaction } from "../models/transaction.model";

export interface DailyTotal {
    date: string; // "YYYY-MM-DD"
    total: number;
}

export interface ITransactionRepository {
    createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction>;
    getById(id: string): Promise<ITransaction | null>;
    getAll(): Promise<ITransaction[]>;
    update(id: string, transaction: Partial<ITransaction>): Promise<ITransaction | null>;
    delete(id: string): Promise<boolean>;
    getAllPaginated(page: number, limit: number, userId: string): Promise<{ data: ITransaction[], total: number }>;
    getJobPaymentTotalsByDay(userId: string, startDate: Date, endDate: Date): Promise<DailyTotal[]>;
    getAllPaginatedAdmin(page: number, limit: number, filters: { type?: string }): Promise<{ data: ITransaction[], total: number }>;
    getPlatformTypeTotalsByDay(type: string, startDate: Date, endDate: Date): Promise<DailyTotal[]>;
    getPlatformTypeTotal(type: string): Promise<number>;
    getTopEarningDevices(limit: number): Promise<{ deviceId: string, totalEarnings: number }[]>;
}

export class TransactionMongoRepository implements ITransactionRepository {
    async createTransaction(transaction: Partial<ITransaction>): Promise<ITransaction> {
        const created = await TransactionModel.create(transaction);
        return created;
    }
    async getById(id: string): Promise<ITransaction | null> {
        const found = await TransactionModel.findOne({ _id: id });
        return found;
    }
    async getAll(): Promise<ITransaction[]> {
        const found = await TransactionModel.find();
        return found;
    }
    async update(id: string, transaction: Partial<ITransaction>): Promise<ITransaction | null> {
        const updated = await TransactionModel.findByIdAndUpdate(id, transaction, { returnDocument: "after" });
        return updated;
    }
    async delete(id: string): Promise<boolean> {
        const deleted = await TransactionModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getAllPaginated(page: number, limit: number, userId: string): Promise<{ data: ITransaction[], total: number }> {
        const query = { user: userId };
        const total = await TransactionModel.countDocuments(query);
        const data = await TransactionModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("-createdAt");

        return { data, total };
    }

    async getAllPaginatedAdmin(page: number, limit: number, filters: { type?: string }): Promise<{ data: ITransaction[], total: number }> {
        const query: any = {};
        if (filters.type) query.type = filters.type;

        const total = await TransactionModel.countDocuments(query);
        const data = await TransactionModel.find(query)
            .populate("user", "username firstName lastName")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("-createdAt");

        return { data, total };
    }

    async getJobPaymentTotalsByDay(userId: string, startDate: Date, endDate: Date): Promise<DailyTotal[]> {
        const results = await TransactionModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    type: "job_payment",
                    amount: { $gt: 0 },
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$amount" }
                }
            }
        ]);
        return results.map((r) => ({ date: r._id as string, total: r.total as number }));
    }

    async getPlatformTypeTotalsByDay(type: string, startDate: Date, endDate: Date): Promise<DailyTotal[]> {
        const results = await TransactionModel.aggregate([
            {
                $match: {
                    type,
                    amount: { $gt: 0 },
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$amount" }
                }
            }
        ]);
        return results.map((r) => ({ date: r._id as string, total: r.total as number }));
    }

    async getPlatformTypeTotal(type: string): Promise<number> {
        const results = await TransactionModel.aggregate([
            { $match: { type, amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        return results[0]?.total ?? 0;
    }

    async getTopEarningDevices(limit: number): Promise<{ deviceId: string, totalEarnings: number }[]> {
        const results = await TransactionModel.aggregate([
            { $match: { type: "job_payment", amount: { $gt: 0 }, booking: { $ne: null } } },
            { $lookup: { from: "bookings", localField: "booking", foreignField: "_id", as: "bookingDoc" } },
            { $unwind: "$bookingDoc" },
            { $group: { _id: "$bookingDoc.device", totalEarnings: { $sum: "$amount" } } },
            { $sort: { totalEarnings: -1 } },
            { $limit: limit }
        ]);
        return results.map((r) => ({ deviceId: String(r._id), totalEarnings: r.totalEarnings as number }));
    }
}
