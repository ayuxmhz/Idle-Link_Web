import { TransactionMongoRepository } from "../repositories/transaction.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { NotificationService } from "./notification.service";
import { DepositDTO, WithdrawDTO } from "../dtos/transaction.dto";
import { ITransaction } from "../models/transaction.model";
import { HttpException } from "../exceptions/http-exception";

const transactionRepository = new TransactionMongoRepository();
const userRepository = new UserMongoRepository();
const notificationService = new NotificationService();

export interface RecordTransactionInput {
    user: string;
    booking?: string;
    type: "job_payment" | "commission" | "deposit" | "withdrawal";
    amount: number;
    description: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export class TransactionService {
    async record(data: RecordTransactionInput): Promise<ITransaction> {
        return transactionRepository.createTransaction(data as unknown as Partial<ITransaction>);
    }

    async deposit(userId: string, dto: DepositDTO): Promise<ITransaction> {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        await userRepository.update(userId, { walletBalance: (user.walletBalance ?? 0) + dto.amount });
        const transaction = await this.record({
            user: userId,
            type: "deposit",
            amount: dto.amount,
            description: "Wallet top-up"
        });
        await notificationService.notify(userId, "wallet_deposit", `NPR ${dto.amount} was added to your wallet`);
        return transaction;
    }

    async withdraw(userId: string, dto: WithdrawDTO): Promise<ITransaction> {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if ((user.walletBalance ?? 0) < dto.amount) {
            throw new HttpException(400, "Insufficient balance");
        }
        await userRepository.update(userId, { walletBalance: (user.walletBalance ?? 0) - dto.amount });
        const transaction = await this.record({
            user: userId,
            type: "withdrawal",
            amount: -dto.amount,
            description: `Withdrawal to ${dto.destination}`
        });
        await notificationService.notify(userId, "wallet_withdrawal", `NPR ${dto.amount} withdrawal to ${dto.destination} was processed`);
        return transaction;
    }

    async listMine(userId: string, page: number, limit: number) {
        const { data, total } = await transactionRepository.getAllPaginated(page, limit, userId);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // --- Admin operations below ---
    async adminListAll(page: number, limit: number, filters: { type?: string }) {
        const { data, total } = await transactionRepository.getAllPaginatedAdmin(page, limit, filters);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getSummary(userId: string) {
        const { monday, nextMonday } = this.getWeekBounds();
        const totals = await transactionRepository.getJobPaymentTotalsByDay(userId, monday, nextMonday);
        const totalsMap = new Map(totals.map((t) => [t.date, t.total]));

        const todayStr = this.formatDate(new Date());
        const dailyBreakdown: { day: string; total: number }[] = [];
        let weekTotal = 0;
        let todayTotal = 0;

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setUTCDate(monday.getUTCDate() + i);
            const dateStr = this.formatDate(d);
            const total = totalsMap.get(dateStr) ?? 0;
            weekTotal += total;
            if (dateStr === todayStr) todayTotal = total;
            dailyBreakdown.push({ day: DAY_LABELS[i], total: Math.round(total * 100) / 100 });
        }

        return {
            todayTotal: Math.round(todayTotal * 100) / 100,
            weekTotal: Math.round(weekTotal * 100) / 100,
            dailyBreakdown
        };
    }

    // MongoDB's $dateToString (used in the aggregation this feeds) buckets by
    // UTC calendar day by default. These helpers must use UTC too — mixing
    // the server process's local timezone in here caused "today"/"this week"
    // to disagree with each other whenever local time and UTC fall on
    // different calendar days (e.g. after midnight UTC but still evening
    // locally, or vice versa).
    private getWeekBounds(): { monday: Date; nextMonday: Date } {
        const now = new Date();
        const day = now.getUTCDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday));
        const nextMonday = new Date(monday);
        nextMonday.setUTCDate(monday.getUTCDate() + 7);
        return { monday, nextMonday };
    }

    private formatDate(d: Date): string {
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }
}
