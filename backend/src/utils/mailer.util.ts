import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from "../configs/constant";

const getClient = () => {
    if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }
    return new Resend(RESEND_API_KEY);
};

const sendOtpEmail = async (to: string, code: string, subject: string, heading: string, body: string) => {
    const resend = getClient();
    const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e2e6; rounded: 8px;">
                <h2 style="color: #2c2057; text-align: center;">${heading}</h2>
                <p>Hello,</p>
                <p>${body}</p>
                <div style="background-color: #f1f2f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2c2057; margin: 20px 0; border-radius: 6px;">
                    ${code}
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This code is valid for 5 minutes. If you did not request this, please ignore this email.
                </p>
            </div>
        `
    });

    if (error) {
        console.error("Error sending email via Resend:", error);
        throw new Error(error.message || "Failed to send email");
    }

    console.log(`[Email Sent via Resend] ID: ${data?.id}`);
    return { success: true };
};

export const sendVerificationEmail = async (to: string, code: string) => {
    return sendOtpEmail(
        to,
        code,
        "Verify Your IdleLink Account",
        "Verify Your Email Address",
        "Thank you for using IdleLink. Please verify your email address by using the 6-digit verification code below:"
    );
};

export const sendPasswordResetEmail = async (to: string, code: string) => {
    return sendOtpEmail(
        to,
        code,
        "Reset Your IdleLink Password",
        "Reset Your Password",
        "We received a request to reset your IdleLink password. Use the 6-digit code below to reset it:"
    );
};
