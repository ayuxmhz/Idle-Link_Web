import nodemailer from "nodemailer";

const getTransporter = async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        // Use custom SMTP server configured in .env
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user,
                pass
            }
        });
    } else {
        // Fallback: Dynamically create an Ethereal test SMTP account (zero-config, real inbox url)
        console.log("No SMTP credentials configured. Creating dynamic Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }
};

export const sendVerificationEmail = async (to: string, code: string) => {
    try {
        const transporter = await getTransporter();
        const info = await transporter.sendMail({
            from: '"IdleLink Support" <no-reply@idlelink.com>',
            to,
            subject: "Verify Your IdleLink Account",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e2e6; rounded: 8px;">
                    <h2 style="color: #2c2057; text-align: center;">Verify Your Email Address</h2>
                    <p>Hello,</p>
                    <p>Thank you for using IdleLink. Please verify your email address by using the 6-digit verification code below:</p>
                    <div style="background-color: #f1f2f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2c2057; margin: 20px 0; border-radius: 6px;">
                        ${code}
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        This code is valid for 5 minutes. If you did not request this, please ignore this email.
                    </p>
                </div>
            `
        });

        console.log(`[Email Sent] Message ID: ${info.messageId}`);
        const testUrl = nodemailer.getTestMessageUrl(info);
        if (testUrl) {
            console.log(`\n======================================================`);
            console.log(`[Ethereal Email] View sent email inbox here:`);
            console.log(`${testUrl}`);
            console.log(`======================================================\n`);
        }
        return { success: true, testUrl };
    } catch (error) {
        console.error("Error sending email via Nodemailer:", error);
        throw error;
    }
};
