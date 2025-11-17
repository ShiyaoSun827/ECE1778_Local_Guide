// src/app/api/auth/actions.ts
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again later.";

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const maybeError =
      (error as { error?: string }).error ??
      (error as { message?: string }).message;
    if (typeof maybeError === "string" && maybeError.trim().length > 0) {
      return maybeError;
    }
    if ("body" in error) {
      const body = (error as { body?: any }).body;
      if (body && typeof body.error === "string") {
        return body.error;
      }
    }
  }
  return DEFAULT_ERROR_MESSAGE;
}

export async function signUpWithEmail(formData: FormData) {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const name = (formData.get("name") ?? "").toString().trim();

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password cannot be empty",
    };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
        }/verify-complete`,
      },
      headers: await headers(),
    });
  } catch (error) {
    return {
      success: false,
      message: extractErrorMessage(error),
    };
  }

  return {
    success: true,
    message: "Registration successful! Please check your email to verify your account before logging in.",
  };
}


export async function signInWithEmail(formData: FormData) {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password cannot be empty",
    };
  }

  let userId: string | undefined;
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    userId = result.user?.id;
  } catch (error) {
    const message = extractErrorMessage(error);
    const needsVerification =
      typeof message === "string" &&
      message.toLowerCase().includes("verify your email");
    return {
      success: false,
      message: needsVerification
        ? "Please verify your email before logging in."
        : message || "Login failed, please check your email and password.",
    };
  }

  let role = "user";
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role) {
      role = user.role;
    }
  }

  let redirectTo = "/"; // Regular users → Local Guide main interface
  if (role === "admin" || role === "superadmin") {
    redirectTo = "/admin"; // You can change this to your own Admin Dashboard route
  }

  return {
    success: true,
    message: "Login successful!",
    redirectTo,
  };
}

// 3) Logout
export async function logout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    return {
      success: false,
      message: extractErrorMessage(error),
    };
  }

  return {
    success: true,
    message: "Logged out successfully.",
    redirectTo: "/signin", // Your own sign-in page path
  };
}
