"use client";

import { login } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "../form-field";
import { Button } from "../ui/button";
import { AuthBackgroundSVG } from "./background";

export function LoginForm() {
  const [formState, formAction, isPending] = useActionState(login, null);

  return (
    <>
      <AuthBackgroundSVG />
      <form
        action={formAction}
        className="grid gap-3 w-full max-w-[45ch] z-2 bg-background py-10 px-8 border border-border rounded-lg shadow-2xl"
      >
        <h1 className="text-3xl font-semibold">Log in to FALAFEL</h1>
        <p className="mb-4 text-muted-foreground">
          You have to log in to use FALAFEL and its services.
        </p>
        <FormField name="email" errors={formState?.fieldErrors?.email}>
          <FormField.Label>Email</FormField.Label>
          <FormField.Input
            defaultValue={formState?.fields?.email}
            type="email"
          />
        </FormField>
        <FormField name="password" errors={formState?.fieldErrors?.password}>
          <FormField.Label>Password</FormField.Label>
          <FormField.Input type="password" />
        </FormField>
        {formState?.error && (
          <p className="text-destructive">{formState.error.message}</p>
        )}
        <Button size="lg" type="submit" className="my-2" disabled={isPending}>
          {isPending ? "Logging in..." : "Log in"}
        </Button>
        <p className="text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="falafel-link">
            Create one now.
          </Link>
        </p>
      </form>
    </>
  );
}
