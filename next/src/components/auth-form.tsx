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
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget); const email = String(form.get("email")); const password = String(form.get("password")); const displayName = String(form.get("displayName") ?? ""); const client = getSupabaseBrowserClient();
    if (!client) return setError("Add the Personal Supabase public URL and publishable key to enable sign-in. The dashboards remain available in local preview mode.");
    setPending(true); const result = mode === "login" ? await client.auth.signInWithPassword({ email, password }) : await client.auth.signUp({ email, password, options: { data: { display_name: displayName } } }); setPending(false);
    if (result.error) return setError(result.error.message);
    toast.success(mode === "login" ? "Welcome back." : "Account created. Check your email if confirmation is enabled."); router.push("/dashboard"); router.refresh();
  };
  return <form onSubmit={submit} className="flex flex-col gap-6"><FieldGroup>{mode === "register" && <Field><FieldLabel htmlFor="displayName">Display name</FieldLabel><Input id="displayName" name="displayName" autoComplete="name" required /></Field>}<Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" required /></Field><Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /><FieldDescription>At least 8 characters.</FieldDescription></Field></FieldGroup>{error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button type="submit" size="lg" disabled={pending}>{pending ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</Button><p className="text-center text-sm text-muted-foreground">{mode === "login" ? "New to Sweatline?" : "Already have an account?"} <Link className="font-semibold text-foreground underline underline-offset-4" href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create account" : "Sign in"}</Link></p></form>;
}

