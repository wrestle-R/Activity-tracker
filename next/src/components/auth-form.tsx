"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const email = String(form.get("email")).trim(); const password = String(form.get("password")); const username = String(form.get("username") ?? "").trim(); const confirmPassword = String(form.get("confirmPassword") ?? ""); const client = getSupabaseBrowserClient();
    if (!client) return setError("Supabase is not configured. Add the workspace .env values before running the app.");
    if (mode === "register" && !/^[a-zA-Z0-9_]{3,24}$/.test(username)) return setError("Choose a username with 3–24 letters, numbers, or underscores.");
    if (mode === "register" && password !== confirmPassword) return setError("Passwords do not match.");
    setPending(true); const result = mode === "login" ? await client.auth.signInWithPassword({ email, password }) : await client.auth.signUp({ email, password, options: { data: { username } } }); setPending(false);
    if (result.error) return setError(result.error.message);
    toast.success(mode === "login" ? "Welcome back." : "Account created."); router.push("/dashboard"); router.refresh();
  };
  return <form onSubmit={submit} className="flex flex-col gap-6"><FieldGroup>{mode === "register" && <Field><FieldLabel htmlFor="username">Username</FieldLabel><Input id="username" name="username" autoComplete="username" minLength={3} maxLength={24} required /><FieldDescription>Letters, numbers, and underscores only.</FieldDescription></Field>}<Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" required /></Field><Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /><FieldDescription>At least 8 characters.</FieldDescription></Field>{mode === "register" && <Field><FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></Field>}</FieldGroup>{error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button type="submit" size="lg" disabled={pending}>{pending ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</Button>{mode === "login" && <Link className="text-center text-sm font-semibold text-muted-foreground underline underline-offset-4" href="/forgot-password">Forgot password?</Link>}<p className="text-center text-sm text-muted-foreground">{mode === "login" ? "New to Sweatline?" : "Already have an account?"} <Link className="font-semibold text-foreground underline underline-offset-4" href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create account" : "Sign in"}</Link></p></form>;
}
