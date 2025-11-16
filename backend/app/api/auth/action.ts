// src/app/api/auth/actions.ts
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";


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

  const res = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
 
      callbackURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/verify-complete`,
    },
    headers: await headers(),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status >= 400) {
    return {
      success: false,
      message: data.error || "Registration failed, please try again later.",
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

  const res = await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(), // Let Better Auth write cookies/session
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 403) {
    return {
      success: false,
      message: data.error || "Please verify your email before logging in.",
    };
  }

  if (res.status >= 400) {
    return {
      success: false,
      message: data.error || "Login failed, please check your email and password.",
    };
  }

  // data.user contains user information, we determine the redirect path based on the role
  const userId = data.user?.id as string | undefined;

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
  const res = await auth.api.signOut({
    headers: await headers(),
  });

  if (res.status >= 400) {
    const data = await res.json().catch(() => ({}));
    return {
      success: false,
      message: data.error || "Logout failed, please try again later.",
    };
  }

  return {
    success: true,
    message: "Logged out successfully.",
    redirectTo: "/signin", // Your own sign-in page path
  };
}
