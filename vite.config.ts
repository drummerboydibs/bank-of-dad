import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// In production we serve from https://<user>.github.io/bank-of-dad/, but in dev
// we serve from the root so local URLs stay simple. The app uses hash-based
// routing, so this base only affects asset URLs.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/bank-of-dad/" : "/",
  plugins: [react(), tailwindcss()],
}));
