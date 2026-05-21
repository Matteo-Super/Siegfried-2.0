import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static build → output to dist/ which Firebase Hosting serves.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
