import type { NextConfig } from "next";
import { config } from "dotenv";
import path from "node:path";

// Local development uses the workspace-level .env. Hosting providers can set
// the same variables directly, in which case dotenv leaves them untouched.
config({ path: path.resolve(process.cwd(), "..", ".env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.APP_URL,
  },
};

export default nextConfig;
