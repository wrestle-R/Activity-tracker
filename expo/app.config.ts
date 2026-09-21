import "dotenv/config";
import path from "node:path";
import { config } from "dotenv";
import type { ExpoConfig } from "expo/config";

// Expo config is evaluated by Node, so it does not automatically load the
// app's local development file. Loading this explicitly keeps the mobile
// client aligned with the documented EXPO_PUBLIC_* variables.
config({ path: path.resolve(__dirname, ".env.local") });
config({ path: path.resolve(__dirname, ".env") });

const app: ExpoConfig = {
  name: "Sweatline", slug: "sweatline", owner: "russeldp", version: "1.0.0", orientation: "portrait", icon: "./assets/images/icon.png", scheme: "sweatline", userInterfaceStyle: "automatic",
  ios: { icon: "./assets/images/icon.png" }, android: { package: "com.russeldp.sweatline", adaptiveIcon: { backgroundColor: "#11130F", foregroundImage: "./assets/images/android-icon-foreground.png", monochromeImage: "./assets/images/android-icon-monochrome.png" }, predictiveBackGestureEnabled: false },
  web: { output: "static", favicon: "./assets/images/favicon.png" }, plugins: ["expo-router", ["expo-splash-screen", { backgroundColor: "#11130F", image: "./assets/images/splash-icon.png", imageWidth: 120 }], "expo-sqlite", "expo-secure-store"],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? process.env.APP_URL,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY,
    // This is an optional, server-owned endpoint. Never put a Strava secret
    // or long-lived access token into an Expo public environment variable.
    stravaImportUrl: process.env.EXPO_PUBLIC_STRAVA_IMPORT_URL,
    router: {}, eas: { projectId: "73c97f6a-2adf-493b-8d7e-61c6cbbb298c" },
  },
};

export default app;
