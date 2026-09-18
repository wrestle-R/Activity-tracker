"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get("password")); if (password !== String(form.get("confirmPassword"))) return setError("Passwords do not match."); const client = getSupabaseBrowserClient(); if (!client) return setError("Supabase is not configured."); setPending(true); const { error: updateError } = await client.auth.updateUser({ password }); setPending(false); if (updateError) return setError(updateError.message); router.replace("/dashboard"); router.refresh(); }
  return <main className="grain grid min-h-dvh place-items-center p-5"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Brand /></div><Card><CardHeader><CardTitle className="display text-4xl uppercase">Set a new lock.</CardTitle><CardDescription>Choose a password you have not used here before.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="grid gap-5"><Field><FieldLabel htmlFor="password">New password</FieldLabel><Input id="password" name="password" type="password" minLength={8} required /></Field><Field><FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel><Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required /></Field>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button size="lg" disabled={pending}>{pending ? "Saving…" : "Save password"}</Button></form></CardContent></Card></div></main>;
}
