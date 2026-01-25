import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      base: "/Examensarbete-SowSmart/",
      manifestFilename: "manifest.json",
      manifest: {
        name: "SåSmart – Din digitala såkalender",
        short_name: "SåSmart",
        start_url: "/Examensarbete-SowSmart/",
        scope: "/Examensarbete-SowSmart/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4f7f52",
        icons: [
          {
            src: "/Examensarbete-SowSmart/assets/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/Examensarbete-SowSmart/assets/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  base: "/Examensarbete-SowSmart/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
