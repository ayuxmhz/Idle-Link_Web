import { TransactionMongoRepository } from "../repositories/transaction.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { DepositDTO, WithdrawDTO } from "../dtos/transaction.dto";
import { ITransaction } from "../models/transaction.model";
import { HttpException } from "../exceptions/http-exception";

const transactionRepository = new TransactionMongoRepository();
const userRepository = new UserMongoRepository();

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
        return this.record({
            user: userId,
            type: "deposit",
            amount: dto.amount,
            description: "Wallet top-up"
        });
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
        return this.record({
            user: userId,
            type: "withdrawal",
            amount: -dto.amount,
            description: "Withdrawal to bank account"
        });
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

    async getSummary(userId: string, range: string = "week") {
        const { monday, nextMonday } = this.getWeekBounds();
        const totals = await transactionRepository.getJobPaymentTotalsByDay(userId, monday, nextMonday);
        const totalsMap = new Map(totals.map((t) => [t.date, t.total]));

        const todayStr = this.formatDate(new Date());
        const dailyBreakdown: { day: string; total: number }[] = [];
        let weekTotal = 0;
        let todayTotal = 0;

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
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

    private getWeekBounds(): { monday: Date; nextMonday: Date } {
        const now = new Date();
        const day = now.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        return { monday, nextMonday };
    }

    private formatDate(d: Date): string {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }
}
