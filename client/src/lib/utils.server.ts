"use server";

import { cookies } from "next/headers";
import { HTTPMethod } from "./utils";

export async function api(endpoint: string, method: HTTPMethod, body?: object) {
  const token = (await cookies()).get("session") ?? { value: "" };

  try {
    return await fetch(`${process.env.API_URL}${endpoint}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Authorization": `Bearer ${token.value}`,
        ...(method === HTTPMethod.GET
          ? {}
          : { "Content-Type": "application/json" }),
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(null, {
      status: 418,
      statusText: "I'm a teapot",
    });
  }
}
