import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser } from "./helpers";
import { OtpModel } from "../src/models/otp.model";

describe("User profile management", () => {
    it("updates first/last name and phone number", async () => {
        const user = await createUser("editprofile");
        const res = await request(app)
            .put("/api/v1/auth/update")
            .set("Authorization", `Bearer ${user.token}`)
            .field("firstName", "Updated")
            .field("lastName", "Name")
            .field("phoneNumber", "9800000000");

        expect(res.status).toBe(200);
        expect(res.body.data.firstName).toBe("Updated");
        expect(res.body.data.phoneNumber).toBe("9800000000");
        expect(res.body.data.isPhoneVerified).toBe(false); // changing phone resets verification
    });

    it("rejects an email change to one already in use", async () => {
        const userA = await createUser("emaila");
        const userB = await createUser("emailb");

        const res = await request(app)
            .put("/api/v1/auth/update")
            .set("Authorization", `Bearer ${userB.token}`)
            .field("email", userA.email);

        expect(res.status).toBe(400);
    });

    it("changes the password when the current password is correct", async () => {
        const user = await createUser("changepass", "Original1!");
        const res = await request(app)
            .put("/api/v1/auth/update-password")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ currentPassword: "Original1!", newPassword: "NewPass1!" });

        expect(res.status).toBe(200);

        const loginWithNew = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "NewPass1!" });
        expect(loginWithNew.body.success).toBe(true);
    });

    it("rejects a password change with the wrong current password", async () => {
        const user = await createUser("wrongcurrent");
        const res = await request(app)
            .put("/api/v1/auth/update-password")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ currentPassword: "WrongOne1!", newPassword: "NewPass1!" });

        expect(res.status).toBe(400);
    });

    it("completes a full forgot-password -> reset-password cycle", async () => {
        const user = await createUser("forgotflow");

        const forgotRes = await request(app).post("/api/v1/auth/forgot-password").send({ email: user.email });
        expect(forgotRes.status).toBe(200);

        const otp = await OtpModel.findOne({ userId: user.userId, type: "password_reset" });
        expect(otp).toBeTruthy();

        const resetRes = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ email: user.email, code: otp!.code, newPassword: "ResetPass1!" });
        expect(resetRes.status).toBe(200);

        const loginWithReset = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "ResetPass1!" });
        expect(loginWithReset.body.success).toBe(true);
    });

    it("rejects reset-password with an invalid code", async () => {
        const user = await createUser("badresetcode");
        const res = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ email: user.email, code: "000000", newPassword: "ResetPass1!" });

        expect(res.status).toBe(400);
    });

    it("sends and verifies an email OTP", async () => {
        const user = await createUser("emailotp");

        const sendRes = await request(app)
            .post("/api/v1/auth/send-verification-email")
            .set("Authorization", `Bearer ${user.token}`);
        expect(sendRes.status).toBe(200);
        const code = sendRes.body.data.devCode;
        expect(code).toBeTruthy();

        const verifyRes = await request(app)
            .post("/api/v1/auth/verify-email")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ code });
        expect(verifyRes.status).toBe(200);

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
        expect(whoami.body.data.isEmailVerified).toBe(true);
    });

    it("rejects email verification with a wrong code", async () => {
        const user = await createUser("emailotpbad");
        await request(app).post("/api/v1/auth/send-verification-email").set("Authorization", `Bearer ${user.token}`);

        const res = await request(app)
            .post("/api/v1/auth/verify-email")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ code: "999999" });
        expect(res.status).toBe(400);
    });

    it("sends and verifies a phone OTP once a phone number is set", async () => {
        const user = await createUser("phoneotp");
        await request(app)
            .put("/api/v1/auth/update")
            .set("Authorization", `Bearer ${user.token}`)
            .field("phoneNumber", "9811111111");

        const sendRes = await request(app)
            .post("/api/v1/auth/send-verification-phone")
            .set("Authorization", `Bearer ${user.token}`);
        expect(sendRes.status).toBe(200);
        const code = sendRes.body.data.devCode;

        const verifyRes = await request(app)
            .post("/api/v1/auth/verify-phone")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ code });
        expect(verifyRes.status).toBe(200);

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
        expect(whoami.body.data.isPhoneVerified).toBe(true);
    });

    it("rejects sending a phone OTP when no phone number is on file", async () => {
        const user = await createUser("nophone");
        const res = await request(app)
            .post("/api/v1/auth/send-verification-phone")
            .set("Authorization", `Bearer ${user.token}`);
        expect(res.status).toBe(400);
    });
});
