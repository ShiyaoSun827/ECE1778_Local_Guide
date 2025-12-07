import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
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

  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000",
  
  trustedOrigins: [
    "localguide://*",
    process.env.EXPO_DEV_ORIGIN || "exp://192.168.0.10:8081",
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000",
    process.env.BETTER_AUTH_URL,
    process.env.FLY_APP_NAME ? `https://${process.env.FLY_APP_NAME}.fly.dev` : undefined,
  ].filter((origin): origin is string => Boolean(origin)),

  advanced: {
    disableOriginCheck: true,
  },

  plugins: [
    admin({ adminRoles: ["admin", "superadmin"] }),
    expo(),
    nextCookies(),
  ],
});
