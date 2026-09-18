"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() { await getSupabaseBrowserClient()?.auth.signOut(); router.replace("/"); router.refresh(); }
  return <Button variant="ghost" size="sm" onClick={signOut}><LogOutIcon data-icon="inline-start" />Sign out</Button>;
}
