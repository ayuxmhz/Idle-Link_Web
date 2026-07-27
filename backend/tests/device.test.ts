import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser, createAdminUser } from "./helpers";

const sampleDevice = {
    name: "Test RTX 4090",
    type: "GPU",
    specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
    hourlyRate: 10
};

describe("Devices", () => {
    it("rejects device creation without auth", async () => {
        const res = await request(app).post("/api/v1/devices").send(sampleDevice);
        expect(res.status).toBe(401);
    });

    it("creates a device for the authenticated user, defaulting to offline with 100% uptime", async () => {
        const owner = await createUser("owner");
        const res = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe("offline");
        expect(res.body.data.uptimePercent).toBe(100);
        expect(res.body.data.owner).toBe(owner.userId);
    });

    it("includes HATEOAS links, granting update/delete to the owner", async () => {
        const owner = await createUser("hateoas_owner");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        expect(created.body.data._links.self.href).toBe(`/api/v1/devices/${created.body.data._id}`);
        expect(created.body.data._links.update).toBeDefined();
        expect(created.body.data._links.delete).toBeDefined();
        expect(created.body.data._links.book).toBeUndefined(); // owner can't book their own device
    });

    it("offers a book link to non-owners on a live device, but not to the owner", async () => {
        const owner = await createUser("hateoas_owner2");
        const stranger = await createUser("hateoas_stranger");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        await request(app)
            .put(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });

        const res = await request(app)
            .get(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${stranger.token}`);

        expect(res.body.data._links.book).toBeDefined();
        expect(res.body.data._links.update).toBeUndefined();
    });

    it("supports conditional GET — returns an ETag and a 304 when it's unchanged", async () => {
        const owner = await createUser("etag_owner");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        const deviceId = created.body.data._id;

        const first = await request(app)
            .get(`/api/v1/devices/${deviceId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        const etag = first.headers.etag;
        expect(etag).toBeTruthy();

        const second = await request(app)
            .get(`/api/v1/devices/${deviceId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .set("If-None-Match", etag);
        expect(second.status).toBe(304);
    });

    it("lists only live devices when filtering by status=live", async () => {
        const owner = await createUser("lister");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        const deviceId = created.body.data._id;

        // still offline — should not show up yet
        const beforeLive = await request(app)
            .get("/api/v1/devices?status=live")
            .set("Authorization", `Bearer ${owner.token}`);
        expect(beforeLive.body.data.find((d: { _id: string }) => d._id === deviceId)).toBeUndefined();

        await request(app)
            .put(`/api/v1/devices/${deviceId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });

        const afterLive = await request(app)
            .get("/api/v1/devices?status=live")
            .set("Authorization", `Bearer ${owner.token}`);
        expect(afterLive.body.data.find((d: { _id: string }) => d._id === deviceId)).toBeTruthy();
    });

    it("prevents a non-owner from updating someone else's device", async () => {
        const owner = await createUser("realowner");
        const intruder = await createUser("intruder");

        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        const res = await request(app)
            .put(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${intruder.token}`)
            .send({ hourlyRate: 999 });

        expect(res.status).toBe(403);
    });

    it("prevents a non-owner from deleting someone else's device", async () => {
        const owner = await createUser("realowner2");
        const intruder = await createUser("intruder2");

        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        const res = await request(app)
            .delete(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${intruder.token}`);

        expect(res.status).toBe(403);
    });

    it("allows the owner to delete their own device", async () => {
        const owner = await createUser("deleter");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        const res = await request(app)
            .delete(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`);

        expect(res.status).toBe(200);

        const getRes = await request(app)
            .get(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`);
        expect(getRes.status).toBe(404);
    });

    it("404s for a non-existent device id", async () => {
        const user = await createUser("devicenotfound");
        const res = await request(app)
            .get("/api/v1/devices/64b8f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${user.token}`);
        expect(res.status).toBe(404);
    });

    it("prevents deleting a device with an active booking", async () => {
        const owner = await createUser("activedeleteowner");
        const buyer = await createUser("activedeletebuyer");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);
        const deviceId = created.body.data._id;
        await request(app)
            .put(`/api/v1/devices/${deviceId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });
        await request(app)
            .post("/api/v1/transactions/deposit")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ amount: 1000 });
        await request(app)
            .post("/api/v1/bookings")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ deviceId, taskName: "job", estimatedHours: 1 });

        const res = await request(app)
            .delete(`/api/v1/devices/${deviceId}`)
            .set("Authorization", `Bearer ${owner.token}`);
        expect(res.status).toBe(400);
    });

    it("lets an admin delete another user's device", async () => {
        const owner = await createUser("adminDeleteTargetOwner");
        const admin = await createAdminUser("devadmin");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send(sampleDevice);

        const res = await request(app)
            .delete(`/api/v1/admin/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        expect(res.status).toBe(200);
    });
});
