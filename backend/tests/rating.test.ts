import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser, depositFunds } from "./helpers";

const sampleDevice = {
    name: "Test RTX 4090 Rating",
    type: "GPU",
    specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
    hourlyRate: 5
};

async function bookAndComplete(ownerToken: string, buyerToken: string) {
    const created = await request(app)
        .post("/api/v1/devices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(sampleDevice);
    const deviceId = created.body.data._id;
    await request(app)
        .put(`/api/v1/devices/${deviceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: "live" });

    await depositFunds(buyerToken, 1000);

    const bookingRes = await request(app)
        .post("/api/v1/bookings")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ deviceId, taskName: "job", estimatedHours: 1 });
    const bookingId = bookingRes.body.data._id;

    await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ status: "completed" });

    return { deviceId, bookingId };
}

describe("Ratings", () => {
    it("lets the buyer rate a completed booking", async () => {
        const owner = await createUser("ratedowner");
        const buyer = await createUser("ratedbuyer");
        const { deviceId, bookingId } = await bookAndComplete(owner.token, buyer.token);

        const res = await request(app)
            .post("/api/v1/ratings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ bookingId, stars: 5, review: "Excellent GPU" });

        expect(res.status).toBe(201);
        expect(res.body.data.stars).toBe(5);

        const summary = await request(app).get(`/api/v1/ratings/device/${deviceId}`);
        expect(summary.body.data.summary.avgRating).toBe(5);
        expect(summary.body.data.summary.count).toBe(1);
    });

    it("rejects a second rating on the same booking", async () => {
        const owner = await createUser("ratedowner2");
        const buyer = await createUser("ratedbuyer2");
        const { bookingId } = await bookAndComplete(owner.token, buyer.token);

        await request(app)
            .post("/api/v1/ratings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ bookingId, stars: 4 });

        const secondAttempt = await request(app)
            .post("/api/v1/ratings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ bookingId, stars: 2 });

        expect(secondAttempt.status).toBe(400);
        expect(secondAttempt.body.message).toMatch(/already been rated/i);
    });

    it("rejects a rating from someone who wasn't the buyer", async () => {
        const owner = await createUser("ratedowner3");
        const buyer = await createUser("ratedbuyer3");
        const stranger = await createUser("stranger3");
        const { bookingId } = await bookAndComplete(owner.token, buyer.token);

        const res = await request(app)
            .post("/api/v1/ratings")
            .set("Authorization", `Bearer ${stranger.token}`)
            .send({ bookingId, stars: 3 });

        expect(res.status).toBe(403);
    });

    it("rejects a star rating outside the 1-5 range", async () => {
        const owner = await createUser("ratedowner4");
        const buyer = await createUser("ratedbuyer4");
        const { bookingId } = await bookAndComplete(owner.token, buyer.token);

        const res = await request(app)
            .post("/api/v1/ratings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ bookingId, stars: 7 });

        expect(res.status).toBe(400);
    });
});
