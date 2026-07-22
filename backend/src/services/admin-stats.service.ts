import { UserModel } from "../models/user.model";
import { DeviceModel } from "../models/device.model";
import { TransactionMongoRepository, DailyTotal } from "../repositories/transaction.repository";

const transactionRepository = new TransactionMongoRepository();

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// MongoDB's $dateToString (used in the aggregations these feed) buckets by
// UTC calendar day by default, so every date computed here must use UTC too
// — mixing in the server process's local timezone caused day buckets to
// disagree with Mongo's, e.g. showing a transaction under the wrong weekday.
function getWeekBounds(weeksAgo: number = 0): { start: Date; end: Date } {
    const now = new Date();
    const day = now.getUTCDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const thisMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday));
    const start = new Date(thisMonday);
    start.setUTCDate(thisMonday.getUTCDate() - weeksAgo * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return { start, end };
}

function formatDate(d: Date): string {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function buildWeekBreakdown(monday: Date, totals: DailyTotal[]): { day: string; total: number }[] {
    const totalsMap = new Map(totals.map((t) => [t.date, t.total]));
    const breakdown: { day: string; total: number }[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setUTCDate(monday.getUTCDate() + i);
        breakdown.push({ day: DAY_LABELS[i], total: Math.round((totalsMap.get(formatDate(d)) ?? 0) * 100) / 100 });
    }
    return breakdown;
}

export type StatsRange = "day" | "week" | "month";

// Re-buckets a flat daily-totals series (already fetched once, covering the
// widest window any range needs) into the granularity the "Day / Week /
// Month" toggle asks for — day: last 14 days, week: last 8 weeks, month:
// last 6 months — mirroring the same semantics used for the Reports page's
// signup chart, so the admin panel's range toggles behave consistently.
function bucketRevenue(dailyTotals: DailyTotal[], range: StatsRange): { day: string; total: number }[] {
    const totalsMap = new Map(dailyTotals.map((t) => [t.date, t.total]));
    const now = new Date();

    if (range === "day") {
        return Array.from({ length: 14 }, (_, i) => {
            const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (13 - i)));
            const total = totalsMap.get(formatDate(d)) ?? 0;
            return {
                day: d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }),
                total: Math.round(total * 100) / 100
            };
        });
    }

    if (range === "week") {
        return Array.from({ length: 8 }, (_, i) => {
            const weekStart = getWeekBounds(7 - i).start;
            let total = 0;
            for (let day = 0; day < 7; day++) {
                const d = new Date(weekStart);
                d.setUTCDate(weekStart.getUTCDate() + day);
                total += totalsMap.get(formatDate(d)) ?? 0;
            }
            return {
                day: weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }),
                total: Math.round(total * 100) / 100
            };
        });
    }

    return Array.from({ length: 6 }, (_, i) => {
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1));
        const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i) + 1, 1));
        let total = 0;
        for (const [dateStr, value] of totalsMap) {
            const d = new Date(`${dateStr}T00:00:00Z`);
            if (d >= monthStart && d < monthEnd) total += value;
        }
        return {
            day: monthStart.toLocaleDateString(undefined, { month: "short", year: "2-digit", timeZone: "UTC" }),
            total: Math.round(total * 100) / 100
        };
    });
}

function sumBreakdown(breakdown: { total: number }[]): number {
    return Math.round(breakdown.reduce((sum, d) => sum + d.total, 0) * 100) / 100;
}

function percentChange(current: number, previous: number): number {
    if (previous <= 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export class AdminStatsService {
    async getOverview(range: StatsRange = "week") {
        const thisWeek = getWeekBounds(0);
        const lastWeek = getWeekBounds(1);

        // The revenue chart's own window depends on the selected granularity
        // (day: 14d, week: 8wk, month: 6mo) — independent of the "this week
        // vs last week" comparison the stat-card badges below still use.
        const chartWindowDays = range === "day" ? 14 : range === "week" ? 8 * 7 : 6 * 31;
        const chartWindowStart = new Date(thisWeek.end);
        chartWindowStart.setUTCDate(chartWindowStart.getUTCDate() - chartWindowDays);

        const [revenueThisWeekRaw, revenueLastWeekRaw, commissionThisWeekRaw, commissionLastWeekRaw, revenueWindowRaw] = await Promise.all([
            transactionRepository.getPlatformTypeTotalsByDay("job_payment", thisWeek.start, thisWeek.end),
            transactionRepository.getPlatformTypeTotalsByDay("job_payment", lastWeek.start, lastWeek.end),
            transactionRepository.getPlatformTypeTotalsByDay("commission", thisWeek.start, thisWeek.end),
            transactionRepository.getPlatformTypeTotalsByDay("commission", lastWeek.start, lastWeek.end),
            transactionRepository.getPlatformTypeTotalsByDay("job_payment", chartWindowStart, thisWeek.end)
        ]);

        const revenueChart = bucketRevenue(revenueWindowRaw, range);
        const revenueThisWeekTotal = sumBreakdown(buildWeekBreakdown(thisWeek.start, revenueThisWeekRaw));
        const revenueLastWeekTotal = sumBreakdown(buildWeekBreakdown(lastWeek.start, revenueLastWeekRaw));

        const commissionThisWeekTotal = sumBreakdown(buildWeekBreakdown(thisWeek.start, commissionThisWeekRaw));
        const commissionLastWeekTotal = sumBreakdown(buildWeekBreakdown(lastWeek.start, commissionLastWeekRaw));

        const [totalRevenue, commissionEarned] = await Promise.all([
            transactionRepository.getPlatformTypeTotal("job_payment"),
            transactionRepository.getPlatformTypeTotal("commission")
        ]);

        const [activeUsers, activeUsersWeekAgo, liveNodes, liveNodesWeekAgo] = await Promise.all([
            UserModel.countDocuments({ role: "user" }),
            UserModel.countDocuments({ role: "user", createdAt: { $lt: thisWeek.start } }),
            DeviceModel.countDocuments({ status: "live" }),
            DeviceModel.countDocuments({ status: "live", createdAt: { $lt: thisWeek.start } })
        ]);

        const topEarners = await transactionRepository.getTopEarningDevices(4);
        const topDeviceIds = topEarners.map((t) => t.deviceId);
        const topDevices = await DeviceModel.find({ _id: { $in: topDeviceIds } });
        const topNodes = topEarners.map((earner) => {
            const device = topDevices.find((d) => d._id.toString() === earner.deviceId);
            return {
                name: device?.name ?? "Unknown Device",
                uptimePercent: device?.uptimePercent ?? 0,
                earnings: earner.totalEarnings
            };
        });

        const recentTransactionsResult = await transactionRepository.getAllPaginatedAdmin(1, 5, {});

        return {
            totalRevenue,
            revenueChangePercent: percentChange(revenueThisWeekTotal, revenueLastWeekTotal),
            activeUsers,
            activeUsersChangePercent: percentChange(activeUsers, activeUsersWeekAgo),
            liveNodes,
            liveNodesChangePercent: percentChange(liveNodes, liveNodesWeekAgo),
            commissionEarned,
            commissionChangePercent: percentChange(commissionThisWeekTotal, commissionLastWeekTotal),
            revenueChart,
            topNodes,
            recentTransactions: recentTransactionsResult.data
        };
    }
}
