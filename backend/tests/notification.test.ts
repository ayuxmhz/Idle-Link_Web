import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser, depositFunds } from "./helpers";

const sampleDevice = {
    name: "Notif Test Device",
    type: "GPU",
    specs: { cpu: "Ryzen 7", ramGB: 16, gpu: "RTX 4050", storageGB: 512 },
    hourlyRate: 5
};

describe("Notifications", () => {
    it("notifies the seller when their device gets booked", async () => {
        const owner = await createUser("notifowner");
        const buyer = await createUser("notifbuyer");

        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        await request(app)
            .put(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });
        await depositFunds(buyer.token, 1000);

        await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId: created.body.data._id, taskName: "notify me", estimatedHours: 1 });

        const list = await request(app).get("/api/v1/notifications").set("Authorization", `Bearer ${owner.token}`);
        expect(list.status).toBe(200);
        expect(list.body.data.some((n: { message: string }) => n.message.includes("notify me"))).toBe(true);

        const unread = await request(app).get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${owner.token}`);
        expect(unread.body.data.count).toBeGreaterThan(0);
    });

    it("marks a single notification as read", async () => {
        const owner = await createUser("notifowner2");
        const buyer = await createUser("notifbuyer2");
        await depositFunds(buyer.token, 1000);

        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        await request(app)
            .put(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });
        await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId: created.body.data._id, taskName: "job", estimatedHours: 1 });

        const list = await request(app).get("/api/v1/notifications").set("Authorization", `Bearer ${owner.token}`);
        const notificationId = list.body.data[0]._id;

        const markRes = await request(app)
            .patch(`/api/v1/notifications/${notificationId}/read`)
            .set("Authorization", `Bearer ${owner.token}`);
        expect(markRes.status).toBe(200);
        expect(markRes.body.data.read).toBe(true);
    });

    it("marks all notifications as read at once", async () => {
        const owner = await createUser("notifowner3");
        const buyer = await createUser("notifbuyer3");
        await depositFunds(buyer.token, 1000);

        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        await request(app)
            .put(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });
        await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId: created.body.data._id, taskName: "job", estimatedHours: 1 });

        const markAllRes = await request(app)
            .post("/api/v1/notifications/mark-all-read")
            .set("Authorization", `Bearer ${owner.token}`);
        expect(markAllRes.status).toBe(200);

        const unread = await request(app).get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${owner.token}`);
        expect(unread.body.data.count).toBe(0);
    });
});
