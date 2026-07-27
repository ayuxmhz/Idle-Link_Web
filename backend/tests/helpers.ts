import request from "supertest";
import app from "../src/app";
import { UserModel } from "../src/models/user.model";

let counter = 0;

export function uniqueEmail(prefix: string): string {
    counter += 1;
    return `${prefix}_${Date.now()}_${counter}@example.com`;
}

interface RegisteredUser {
    token: string;
    userId: string;
    email: string;
    username: string;
}

// Registers + logs in a fresh user for a test, returning a ready-to-use auth
// token. Every test that needs an authenticated actor goes through this
// instead of hand-rolling the request pair each time.
export async function createUser(prefix = "user", password = "Test1234!"): Promise<RegisteredUser> {
    const email = uniqueEmail(prefix);
    const username = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const registerRes = await request(app).post("/api/v1/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email,
        username,
        password
    });
    if (!registerRes.body.success) {
        throw new Error(`Failed to register test user: ${JSON.stringify(registerRes.body)}`);
    }

    const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password });
    if (!loginRes.body.success) {
        throw new Error(`Failed to login test user: ${JSON.stringify(loginRes.body)}`);
    }

    return {
        token: loginRes.body.data.token,
        userId: loginRes.body.data.user._id,
        email,
        username
    };
}

// Registers a normal user then promotes them to admin directly in the DB
// (there's no public "become admin" endpoint, by design) and logs back in
// so the returned token carries the admin role claim.
export async function createAdminUser(prefix = "admin"): Promise<RegisteredUser> {
    const user = await createUser(prefix);
    await UserModel.updateOne({ _id: user.userId }, { role: "admin" });

    const loginRes = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "Test1234!" });
    return { ...user, token: loginRes.body.data.token };
}

export async function depositFunds(token: string, amount: number) {
    return request(app)
        .post("/api/v1/transactions/deposit")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount });
}
