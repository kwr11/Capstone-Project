"use server";

import {
  formAction,
  handleResponse,
  HTTPMethod,
  serverAction,
} from "@/lib/utils";
import { api } from "@/lib/utils.server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

async function _getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session");
  if (!token) {
    return null;
  }

  const decoded = jwt.decode(token.value) as unknown as IUser & { exp: number };

  if (decoded["exp"] * 1000 < Date.now()) {
    return null;
  }

  return decoded as IUser;
}

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(6, "Password must be 6 characters")
    .refine(
      (password) => {
        return /[0-9]/.test(password);
      },
      {
        error: "Password must contain at least one number",
      }
    )
    .refine(
      (password) => {
        return /[^A-Za-z0-9]/.test(password);
      },
      {
        error: "Password must contain at least one special character",
      }
    ),
});

async function _login(data: z.output<typeof loginSchema>) {
  const response = await api("/login", HTTPMethod.POST, data);

  return handleResponse<{ access_token: string }>(
    "_login",
    response,
    async (data) => {
      (await cookies()).set("session", data.access_token);
      redirect("/");
    },
    {
      401: () => {
        throw new Error("Invalid username or password");
      },
    }
  );
}

async function _register(data: z.output<typeof registerSchema>) {
  const response = await api("/register", HTTPMethod.POST, data);

  return handleResponse(
    "_register",
    response,
    () => {
      redirect("/login");
    },
    {
      409: () => {
        throw new Error("This email is already in use");
      },
    }
  );
}

async function _logout() {
  (await cookies()).delete("session");
  redirect("/login");
}

export const getCurrentUser = serverAction(_getCurrentUser);
export const login = formAction(loginSchema, _login);
export const register = formAction(registerSchema, _register);
export const logout = serverAction(_logout);
