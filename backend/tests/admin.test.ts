import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser, createAdminUser, uniqueEmail } from "./helpers";

describe("Admin", () => {
    it("rejects a non-admin from listing users", async () => {
        const user = await createUser("plain");
        const res = await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${user.token}`);
        expect(res.status).toBe(403);
    });

    it("lets an admin list, fetch, update, and delete a user", async () => {
        const admin = await createAdminUser("admin1");
        const target = await createUser("target1");

        const listRes = await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${admin.token}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.data.find((u: { _id: string }) => u._id === target.userId)).toBeTruthy();

        const getRes = await request(app).get(`/api/v1/admin/users/${target.userId}`).set("Authorization", `Bearer ${admin.token}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.data.email).toBe(target.email);

        const updateRes = await request(app)
            .put(`/api/v1/admin/users/${target.userId}`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ firstName: "Updated" });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.data.firstName).toBe("Updated");

        const deleteRes = await request(app).delete(`/api/v1/admin/users/${target.userId}`).set("Authorization", `Bearer ${admin.token}`);
        expect(deleteRes.status).toBe(200);

        const getAfterDelete = await request(app).get(`/api/v1/admin/users/${target.userId}`).set("Authorization", `Bearer ${admin.token}`);
        expect(getAfterDelete.status).toBe(404);
    });

    it("lets an admin create a new user directly", async () => {
        const admin = await createAdminUser("admin2");
        const email = uniqueEmail("created_by_admin");

        const res = await request(app)
            .post("/api/v1/admin/users")
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ firstName: "Made", lastName: "ByAdmin", email, username: `madebyadmin_${Date.now()}`, password: "Test1234!" });

        expect(res.status).toBe(201);
        expect(res.body.data.email).toBe(email);
    });

    it("lets an admin list all devices across every user", async () => {
        const admin = await createAdminUser("admin3");
        const owner = await createUser("deviceowner");
        await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({
                name: "Admin-visible device",
                type: "GPU",
                specs: { cpu: "Ryzen 7", ramGB: 16, gpu: "RTX 4050", storageGB: 512 },
                hourlyRate: 5
            });

        const res = await request(app).get("/api/v1/admin/devices").set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.find((d: { name: string }) => d.name === "Admin-visible device")).toBeTruthy();
    });

    it("lets an admin list all transactions across every user", async () => {
        const admin = await createAdminUser("admin4");
        const user = await createUser("txnowner");
        await request(app)
            .post("/api/v1/transactions/deposit")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 250 });

        const res = await request(app).get("/api/v1/admin/transactions").set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.some((t: { amount: number }) => t.amount === 250)).toBe(true);
    });

    it("returns a dashboard overview with revenue chart, top nodes, and recent transactions", async () => {
        const admin = await createAdminUser("admin5");
        const res = await request(app).get("/api/v1/admin/stats/overview").set("Authorization", `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("totalRevenue");
        expect(res.body.data).toHaveProperty("activeUsers");
        expect(res.body.data).toHaveProperty("liveNodes");
        expect(Array.isArray(res.body.data.revenueChart)).toBe(true);
        expect(Array.isArray(res.body.data.topNodes)).toBe(true);
        expect(Array.isArray(res.body.data.recentTransactions)).toBe(true);
    });

    it("supports day/week/month range on the overview's revenue chart", async () => {
        const admin = await createAdminUser("admin6");

        const day = await request(app).get("/api/v1/admin/stats/overview?range=day").set("Authorization", `Bearer ${admin.token}`);
        expect(day.body.data.revenueChart).toHaveLength(14);

        const week = await request(app).get("/api/v1/admin/stats/overview?range=week").set("Authorization", `Bearer ${admin.token}`);
        expect(week.body.data.revenueChart).toHaveLength(8);

        const month = await request(app).get("/api/v1/admin/stats/overview?range=month").set("Authorization", `Bearer ${admin.token}`);
        expect(month.body.data.revenueChart).toHaveLength(6);
    });
});
