import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig, loadEnv, UserConfig } from "vite";

// https://vitejs.dev/config/
export default ({ mode }: UserConfig) => {
  if (mode) process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/v1": {
          target: process.env.VITE_API_HOST,
          changeOrigin: true,
        },
      },
    },
  });
};
