import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom", "react-router-dom", "react-redux", "redux", "redux-thunk"],
                    mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
                    charts: ["recharts"],
                    documents: ["xlsx", "exceljs", "file-saver"],
                    editor: ["quill", "react-quill"],
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
