// src/app/api/auth/[...better-auth]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";


export const { GET, POST } = toNextJsHandler(auth);
