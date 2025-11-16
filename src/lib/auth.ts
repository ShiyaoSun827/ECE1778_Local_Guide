// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { expo } from "@better-auth/expo";  

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
    async sendVerificationEmail({ user, url, token }, request) {
      await sendEmail({
        to: user.email,
        subject: "Verify your Local Guide account",
        html: `
          <p>Hi ${user.name ?? "Local Guide User"},</p>
          <p>Please click the link below to verify your email:</p>
          <p><a href="${url}" target="_blank" rel="noreferrer">Verify Email</a></p>
          <p>If you did not sign up, you can ignore this email.</p>
        `,
      });
    },
  },


  trustedOrigins: ["localguide://*"],

  plugins: [
    nextCookies(),
    admin({
      adminRoles: ["admin", "superadmin"],
    }),
    expo(),  
  ],
});
