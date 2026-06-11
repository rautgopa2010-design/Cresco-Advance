import { Outlet } from "react-router-dom";
import Navbar from "../landing/navbar/Navbar";
import Footer from "../landing/footer/Footer";
import { useState, useEffect } from "react";
import { PublicCompanyProvider } from "../../context/PublicCompanyContext";

export default function LandingLayout() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = theme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <PublicCompanyProvider>
    <div className="flex min-h-screen flex-col bg-white/50 text-gray-700 transition-colors dark:bg-black dark:text-white">
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer theme={theme} />
    </div>
    </PublicCompanyProvider>
  );
}