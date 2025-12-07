// src/lib/email.ts
import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error(
      "[sendEmail] GMAIL_USER or GMAIL_APP_PASSWORD not set. Email not sent."
    );
    console.error({ to, subject });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  console.log("[sendEmail] Sending email:", { to, subject });

  await transporter.sendMail({
    from: `"Local Guide" <${user}>`,
    to,
    subject,
    html,
  });
}
