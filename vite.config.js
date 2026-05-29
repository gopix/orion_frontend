


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 9000,
//   },
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 9000,

    // ─── Proxy ───────────────────────────────────────────────────
    // All requests from the frontend that start with /api are
    // forwarded to the backend at localhost:8000.
    // This means the browser always talks to localhost:9000 (same
    // origin) so CORS is never triggered — no backend change needed.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,   // sets Host header to match target
        secure: false,        // allow self-signed certs if any
      },
    },
  },
});