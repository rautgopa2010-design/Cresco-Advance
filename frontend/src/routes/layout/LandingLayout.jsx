import { Outlet } from "react-router-dom";
import Navbar from "../landing/navbar/Navbar";
import Footer from "../landing/footer/Footer";
import { useState, useEffect } from "react";
import { PublicCompanyProvider, usePublicCompany } from "../../context/PublicCompanyContext";

const LandingShell = ({ theme, setTheme }) => {
  const { landingPageSetup } = usePublicCompany();
  const queryTemplate = new URLSearchParams(window.location.search).get("template");
  const selectedTemplate = queryTemplate || landingPageSetup?.template_key || "classic";
  const useClassicShell = selectedTemplate === "classic";

  return (
    <div className="flex min-h-screen flex-col bg-white/50 text-gray-700 transition-colors dark:bg-black dark:text-white">
      {useClassicShell && <Navbar theme={theme} setTheme={setTheme} />}
      <main className="flex-1">
        <Outlet />
      </main>
      {useClassicShell && <Footer theme={theme} />}
    </div>
  );
};

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
      <LandingShell theme={theme} setTheme={setTheme} />
    </PublicCompanyProvider>
  );
}
