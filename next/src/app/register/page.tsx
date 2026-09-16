import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() { return <main className="grain grid min-h-dvh place-items-center p-5"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Brand /></div><Card><CardHeader><CardTitle className="display text-4xl uppercase">Start your line.</CardTitle><CardDescription>Your account owns every workout and run row through Supabase RLS.</CardDescription></CardHeader><CardContent><AuthForm mode="register" /></CardContent></Card></div></main>; }

