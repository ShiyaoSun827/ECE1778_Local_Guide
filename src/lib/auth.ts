// src/lib/auth.ts（只看 emailVerification 这一块）
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    async sendVerificationEmail({ user, url }) {
      console.log(
        "[BetterAuth] sendVerificationEmail for:",
        user.email,
        url
      );

      await sendEmail({
        to: user.email,
        subject: "Verify your Local Guide account",
        html: `
          <p>Hi ${user.name ?? "Local Guide User"},</p>
          <p>Please click the link below to verify your email for <b>Local Guide</b>:</p>
          <p><a href="${url}" target="_blank" rel="noreferrer">Verify Email</a></p>
          <p>If you did not sign up, you can safely ignore this email.</p>
        `,
      });
    },
  },

  trustedOrigins: [
    "localguide://*",
    process.env.EXPO_DEV_ORIGIN || "exp://192.168.0.10:8081",
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000",
  ],

  plugins: [
    admin({ adminRoles: ["admin", "superadmin"] }),
    expo(),
    nextCookies(),
  ],
});
