"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const email = String(new FormData(event.currentTarget).get("email")); const client = getSupabaseBrowserClient(); if (!client) return setMessage("Supabase is not configured."); setPending(true); const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); setPending(false); setMessage(error ? error.message : "If an account exists, a password-reset link is on its way."); }
  return <main className="grain grid min-h-dvh place-items-center p-5"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Brand /></div><Card><CardHeader><CardTitle className="display text-4xl uppercase">Reset your line.</CardTitle><CardDescription>We will email a secure reset link.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="grid gap-5"><Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" required /></Field><Button size="lg" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}<Link className="text-center text-sm underline underline-offset-4" href="/login">Back to sign in</Link></form></CardContent></Card></div></main>;
}
