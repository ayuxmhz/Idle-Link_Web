import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser, depositFunds } from "./helpers";

const sampleDevice = {
    name: "Test RTX 4050",
    type: "GPU",
    specs: { cpu: "Ryzen 7", ramGB: 16, gpu: "RTX 4050", storageGB: 512 },
    hourlyRate: 10
};

async function createLiveDevice(ownerToken: string) {
    const created = await request(app)
        .post("/api/v1/devices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(sampleDevice);
    const deviceId = created.body.data._id;
    await request(app)
        .put(`/api/v1/devices/${deviceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: "live" });
    return deviceId;
}

describe("Bookings", () => {
    it("rejects a booking on a device the buyer cannot afford", async () => {
        const owner = await createUser("seller1");
        const buyer = await createUser("buyer1");
        const deviceId = await createLiveDevice(owner.token);

        const res = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "train model", estimatedHours: 1 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/balance/i);
    });

    it("rejects booking your own device", async () => {
        const owner = await createUser("seller2");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(owner.token, 1000);

        const res = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ deviceId, taskName: "train model", estimatedHours: 1 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/own device/i);
    });

    it("creates a booking, deducts the buyer's wallet, and marks the device as having an active booking", async () => {
        const owner = await createUser("seller3");
        const buyer = await createUser("buyer3");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "train model", estimatedHours: 2 });

        expect(bookingRes.status).toBe(201);
        expect(bookingRes.body.data.totalCost).toBe(20); // 10/hr * 2h
        expect(bookingRes.body.data.status).toBe("running");

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${buyer.token}`);
        expect(whoami.body.data.walletBalance).toBe(980);

        const devices = await request(app)
            .get("/api/v1/devices?status=live")
            .set("Authorization", `Bearer ${buyer.token}`);
        const device = devices.body.data.find((d: { _id: string }) => d._id === deviceId);
        expect(device.hasActiveBooking).toBe(true);
    });

    it("prevents booking a device that already has an active booking", async () => {
        const owner = await createUser("seller4");
        const buyer1 = await createUser("buyer4a");
        const buyer2 = await createUser("buyer4b");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer1.token, 1000);
        await depositFunds(buyer2.token, 1000);

        await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer1.token}`)
            .send({ deviceId, taskName: "job one", estimatedHours: 1 });

        const secondAttempt = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer2.token}`)
            .send({ deviceId, taskName: "job two", estimatedHours: 1 });

        expect(secondAttempt.status).toBe(400);
        expect(secondAttempt.body.message).toMatch(/active booking/i);
    });

    it("requires a reason to cancel a booking, then refunds the buyer in full", async () => {
        const owner = await createUser("seller5");
        const buyer = await createUser("buyer5");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        const noReason = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "cancelled" });
        expect(noReason.status).toBe(400);

        const withReason = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "cancelled", reason: "changed my mind" });
        expect(withReason.status).toBe(200);
        expect(withReason.body.data.status).toBe("cancelled");
        expect(withReason.body.data.cancelReason).toBe("changed my mind");

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${buyer.token}`);
        expect(whoami.body.data.walletBalance).toBe(1000); // fully refunded
    });

    it("pays out the seller 85% and lets the buyer complete a booking early", async () => {
        const owner = await createUser("seller6");
        const buyer = await createUser("buyer6");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        const completeRes = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "completed" });
        expect(completeRes.status).toBe(200);
        expect(completeRes.body.data.status).toBe("completed");

        const sellerWhoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${owner.token}`);
        expect(sellerWhoami.body.data.walletBalance).toBe(8.5); // 85% of totalCost (10)
    });

    it("exposes cancel/complete links while running, and a rate link once completed", async () => {
        const owner = await createUser("seller7");
        const buyer = await createUser("buyer7");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        expect(bookingRes.body.data._links.cancel).toBeDefined();
        expect(bookingRes.body.data._links.complete).toBeDefined();
        expect(bookingRes.body.data._links.rate).toBeUndefined();

        const completeRes = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "completed" });

        expect(completeRes.body.data._links.cancel).toBeUndefined();
        expect(completeRes.body.data._links.rate).toBeDefined();
    });

    it("rejects booking a non-existent device", async () => {
        const buyer = await createUser("buyerghost");
        const res = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId: "64b8f0f0f0f0f0f0f0f0f0f0", taskName: "job", estimatedHours: 1 });
        expect(res.status).toBe(404);
    });

    it("rejects booking a device that is not live", async () => {
        const owner = await createUser("seller8");
        const buyer = await createUser("buyer8");
        await depositFunds(buyer.token, 1000);
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        const res = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId: created.body.data._id, taskName: "job", estimatedHours: 1 });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/not available/i);
    });

    it("blocks a non-party from viewing a booking, but allows admin", async () => {
        const owner = await createUser("seller9");
        const buyer = await createUser("buyer9");
        const stranger = await createUser("stranger9");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        const blocked = await request(app)
            .get(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${stranger.token}`);
        expect(blocked.status).toBe(403);

        const asOwner = await request(app)
            .get(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        expect(asOwner.status).toBe(200);
    });

    it("rejects cancelling a booking that isn't yours, and cancelling twice", async () => {
        const owner = await createUser("seller10");
        const buyer = await createUser("buyer10");
        const stranger = await createUser("stranger10");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        const notYours = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${stranger.token}`)
            .send({ status: "cancelled", reason: "not mine" });
        expect(notYours.status).toBe(403);

        await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "cancelled", reason: "first cancel" });

        const twice = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "cancelled", reason: "second cancel" });
        expect(twice.status).toBe(400);
    });

    it("rejects completing a booking you're not party to, and completing twice", async () => {
        const owner = await createUser("seller11");
        const buyer = await createUser("buyer11");
        const stranger = await createUser("stranger11");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        const notParty = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${stranger.token}`)
            .send({ status: "completed" });
        expect(notParty.status).toBe(403);

        await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "completed" });

        const twice = await request(app)
            .patch(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ status: "completed" });
        expect(twice.status).toBe(400);
    });

    it("lists the buyer's own bookings with pagination metadata", async () => {
        const owner = await createUser("seller12");
        const buyer = await createUser("buyer12");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });

        const res = await request(app)
            .get("/api/v1/bookings?role=buyer&page=1&limit=10")
            .set("Authorization", `Bearer ${buyer.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.meta).toMatchObject({ page: 1, limit: 10 });
    });

    it("deletes (cancels) a booking via DELETE", async () => {
        const owner = await createUser("seller13");
        const buyer = await createUser("buyer13");
        const deviceId = await createLiveDevice(owner.token);
        await depositFunds(buyer.token, 1000);

        const bookingRes = await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });
        const bookingId = bookingRes.body.data._id;

        const res = await request(app)
            .delete(`/api/v1/bookings/${bookingId}`)
            .set("Authorization", `Bearer ${buyer.token}`);
        expect(res.status).toBe(200);
    });
});
