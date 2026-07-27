import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { uniqueEmail, createUser } from "./helpers";

describe("Auth", () => {
    it("registers a new user with a valid password", async () => {
        const email = uniqueEmail("register");
        const res = await request(app).post("/api/v1/auth/register").send({
            firstName: "Ada",
            lastName: "Lovelace",
            email,
            username: `ada_${Date.now()}`,
            password: "Test1234!"
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(email);
        expect(res.body.data.password).not.toBe("Test1234!"); // stored hashed, never plain
    });

    it("rejects registration with a weak password", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            firstName: "Weak",
            lastName: "Pass",
            email: uniqueEmail("weak"),
            username: `weak_${Date.now()}`,
            password: "aaaaaaaa" // no digit, no special char
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("rejects registration with a duplicate email", async () => {
        const user = await createUser("dup");

        const res = await request(app).post("/api/v1/auth/register").send({
            firstName: "Dup",
            lastName: "Licate",
            email: user.email,
            username: `another_${Date.now()}`,
            password: "Test1234!"
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/email/i);
    });

    it("logs in with correct credentials and returns a token", async () => {
        const email = uniqueEmail("login");
        await request(app).post("/api/v1/auth/register").send({
            firstName: "Login",
            lastName: "Test",
            email,
            username: `login_${Date.now()}`,
            password: "Test1234!"
        });

        const res = await request(app).post("/api/v1/auth/login").send({ email, password: "Test1234!" });

        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeTruthy();
        expect(res.body.data.user.email).toBe(email);
    });

    it("rejects login with the wrong password", async () => {
        const user = await createUser("badpass");
        const res = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "WrongPass1!" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("returns the current user on /whoami with a valid token", async () => {
        const user = await createUser("whoami");
        const res = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(user.email);
    });

    it("rejects /whoami without a token", async () => {
        const res = await request(app).get("/api/v1/auth/whoami");
        expect(res.status).toBe(401);
    });
});
