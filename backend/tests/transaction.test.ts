import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser } from "./helpers";

describe("Transactions", () => {
    it("deposits funds and updates the wallet balance", async () => {
        const user = await createUser("depositor");

        const res = await request(app)
            .post("/api/v1/transactions/deposit")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 500 });

        expect(res.status).toBe(201);
        expect(res.body.data.type).toBe("deposit");
        expect(res.body.data.amount).toBe(500);

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
        expect(whoami.body.data.walletBalance).toBe(500);
    });

    it("withdraws funds when a destination is provided and balance is sufficient", async () => {
        const user = await createUser("withdrawer");
        await request(app)
            .post("/api/v1/transactions/deposit")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 500 });

        const res = await request(app)
            .post("/api/v1/transactions/withdraw")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 200, destination: "9800000000" });

        expect(res.status).toBe(201);
        expect(res.body.data.amount).toBe(-200);

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
        expect(whoami.body.data.walletBalance).toBe(300);
    });

    it("rejects a withdrawal without a destination", async () => {
        const user = await createUser("nodest");
        await request(app)
            .post("/api/v1/transactions/deposit")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 500 });

        const res = await request(app)
            .post("/api/v1/transactions/withdraw")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 200 });

        expect(res.status).toBe(400);
    });

    it("rejects a withdrawal that exceeds the wallet balance", async () => {
        const user = await createUser("poor");
        await request(app)
            .post("/api/v1/transactions/deposit")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 50 });

        const res = await request(app)
            .post("/api/v1/transactions/withdraw")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 500, destination: "9800000000" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/insufficient/i);
    });

    it("returns a weekly earnings summary shaped for the dashboard chart", async () => {
        const user = await createUser("summary");
        const res = await request(app)
            .get("/api/v1/transactions/summary")
            .set("Authorization", `Bearer ${user.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.dailyBreakdown).toHaveLength(7);
        expect(typeof res.body.data.weekTotal).toBe("number");
    });
});
