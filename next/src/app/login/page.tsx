import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() { return <main className="grain grid min-h-dvh place-items-center p-5"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Brand /></div><Card><CardHeader><CardTitle className="display text-4xl uppercase">Pick up the line.</CardTitle><CardDescription>Sign in to connect your private Supabase data. Offline preview remains available.</CardDescription></CardHeader><CardContent><AuthForm mode="login" /></CardContent></Card></div></main>; }

