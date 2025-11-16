// src/lib/email.ts
import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                       
  auth: {
    user: process.env.SMTP_USER,        
    pass: process.env.SMTP_PASS,        
  },
});

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SMTP_USER) {
    console.warn("[sendEmail] SMTP_USER not set. Email not sent.");
    console.log({ to, subject, html });
    return;
  }

  await transporter.sendMail({
    from: `"Local Guide" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
