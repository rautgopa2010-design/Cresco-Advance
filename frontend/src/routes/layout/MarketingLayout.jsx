// import { Outlet, useLocation } from "react-router-dom";
// import Navbar from "../marketing/navbar/Navbar";
// import Footer from "../marketing/footer/Footer";
// import { useState, useEffect } from "react";

// export default function MarketingLayout() {
//     const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");
//     const location = useLocation(); // ← This is important

//     // 1. Load gtag script only once
//     useEffect(() => {
//         if (window.gtag) return; // prevent loading multiple times

//         const script1 = document.createElement("script");
//         script1.async = true;
//         script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-18027859516";
//         document.head.appendChild(script1);

//         const script2 = document.createElement("script");
//         script2.innerHTML = `
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'AW-18027859516', {
//                 'send_page_view': false   // Important for SPA
//             });
//         `;
//         document.head.appendChild(script2);
//     }, []);

//     // 2. Track page views whenever route changes
//     useEffect(() => {
//         if (typeof window.gtag === "function") {
//             window.gtag("config", "AW-18027859516", {
//                 page_path: location.pathname + location.search,
//                 page_title: document.title || "CRESCO Marketing",
//             });
//         }
//     }, [location]);

//     // 3. Load Tawk.to chat widget (only once)
//     useEffect(() => {
//         if (window.Tawk_API) return;

//         window.Tawk_API = window.Tawk_API || {};
//         window.Tawk_LoadStart = new Date();

//         // ✅ Set position to LEFT
//         window.Tawk_API.customStyle = {
//             visibility: {
//                 desktop: {
//                     position: "bl", // bottom-left
//                 },
//                 mobile: {
//                     position: "bl", // bottom-left
//                 },
//             },
//         };

//         const script = document.createElement("script");
//         script.async = true;
//         script.src = "https://embed.tawk.to/69d00d197231721c37fdd5ed/1jlab6bsl";
//         script.charset = "UTF-8";
//         script.setAttribute("crossorigin", "*");

//         document.body.appendChild(script);
//     }, []);

//     // Theme code (your existing code)
//     useEffect(() => {
//         const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//         setTheme(theme || (prefersDark ? "dark" : "light"));
//     }, []);

//     useEffect(() => {
//         if (theme === "dark") {
//             document.documentElement.classList.add("dark");
//         } else {
//             document.documentElement.classList.remove("dark");
//         }
//         localStorage.setItem("theme", theme);
//     }, [theme]);

//     return (
//         <div className="flex min-h-screen flex-col bg-white/50 text-gray-700 transition-colors dark:bg-black dark:text-white">
//             <Navbar
//                 theme={theme}
//                 setTheme={setTheme}
//             />
//             <main className="-mb-32 flex-1">
//                 <Outlet />
//             </main>
//             <Footer theme={theme} />
//         </div>
//     );
// }

// import { Outlet, useLocation } from "react-router-dom";
// import Navbar from "../marketing/navbar/Navbar";
// import Footer from "../marketing/footer/Footer";
// import { useState, useEffect, useRef } from "react";

// export default function MarketingLayout() {
//     const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");
//     const location = useLocation();
//     const gtagLoaded = useRef(false);
//     const tawkLoaded = useRef(false);

//     // Check if current path is marketing website
//     const isMarketingRoute = location.pathname.startsWith("/marketing-website") || location.pathname.startsWith("/landing/");

//     // 1. Load gtag script only once and only for marketing routes
//     useEffect(() => {
//         if (!isMarketingRoute) return;
//         if (gtagLoaded.current) return;

//         const script1 = document.createElement("script");
//         script1.async = true;
//         script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-18027859516";
//         document.head.appendChild(script1);

//         const script2 = document.createElement("script");
//         script2.innerHTML = `
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'AW-18027859516', {
//                 'send_page_view': false
//             });
//         `;
//         document.head.appendChild(script2);

//         gtagLoaded.current = true;

//         // Don't try to delete gtag - just remove scripts on cleanup
//         return () => {
//             if (!isMarketingRoute) {
//                 const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
//                 scripts.forEach((script) => script.remove());
//                 const inlineScripts = document.querySelectorAll("script:not([src])");
//                 inlineScripts.forEach((script) => {
//                     if (script.innerHTML.includes("gtag")) {
//                         script.remove();
//                     }
//                 });
//                 // Reset the loaded flag
//                 gtagLoaded.current = false;
//             }
//         };
//     }, [isMarketingRoute]);

//     // 2. Track page views only on marketing routes
//     useEffect(() => {
//         if (isMarketingRoute && typeof window.gtag === "function") {
//             window.gtag("config", "AW-18027859516", {
//                 page_path: location.pathname + location.search,
//                 page_title: document.title || "CRESCO Marketing",
//             });
//         }
//     }, [location, isMarketingRoute]);

//     // 3. Load/Unload Tawk.to widget based on route
//     useEffect(() => {
//         if (!isMarketingRoute) {
//             // Remove Tawk.to widget when not on marketing routes
//             if (window.Tawk_API) {
//                 // Hide widget instead of destroying it
//                 if (window.Tawk_API.hideWidget) {
//                     window.Tawk_API.hideWidget();
//                 }
//             }
//             // Remove Tawk.to container
//             const tawkContainer = document.getElementById("tawkchat-container");
//             if (tawkContainer) {
//                 tawkContainer.remove();
//             }
//             // Remove the script but don't delete the API object
//             const tawkScript = document.querySelector('script[src*="tawk.to"]');
//             if (tawkScript) {
//                 tawkScript.remove();
//             }
//             tawkLoaded.current = false;
//             return;
//         }

//         // Load Tawk.to only for marketing routes and if not already loaded
//         if (tawkLoaded.current) return;
//         if (window.Tawk_API) return;

//         window.Tawk_API = window.Tawk_API || {};
//         window.Tawk_LoadStart = new Date();

//         // Set position to LEFT
//         window.Tawk_API.customStyle = {
//             visibility: {
//                 desktop: {
//                     position: "bl", // bottom-left
//                 },
//                 mobile: {
//                     position: "bl", // bottom-left
//                 },
//             },
//         };

//         const script = document.createElement("script");
//         script.async = true;
//         script.src = "https://embed.tawk.to/69d00d197231721c37fdd5ed/1jlab6bsl";
//         script.charset = "UTF-8";
//         script.setAttribute("crossorigin", "*");
//         script.id = "tawk-widget-script";

//         document.body.appendChild(script);
//         tawkLoaded.current = true;
//     }, [isMarketingRoute]);

//     // Theme code (your existing code)
//     useEffect(() => {
//         const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//         setTheme(theme || (prefersDark ? "dark" : "light"));
//     }, []);

//     useEffect(() => {
//         if (theme === "dark") {
//             document.documentElement.classList.add("dark");
//         } else {
//             document.documentElement.classList.remove("dark");
//         }
//         localStorage.setItem("theme", theme);
//     }, [theme]);

//     return (
//         <div className="flex min-h-screen flex-col bg-white/50 text-gray-700 transition-colors dark:bg-black dark:text-white">
//             <Navbar
//                 theme={theme}
//                 setTheme={setTheme}
//             />
//             <main className="-mb-32 flex-1">
//                 <Outlet />
//             </main>
//             <Footer theme={theme} />
//         </div>
//     );
// }

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../marketing/navbar/Navbar";
import Footer from "../marketing/footer/Footer";
import { useState, useEffect, useRef } from "react";

export default function MarketingLayout() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");
    const location = useLocation();
    const gtagLoaded = useRef(false);
    const tawkLoaded = useRef(false);
    const conversionTracked = useRef(false); // Track if conversion already fired

    // Check if current path is marketing website
    const isMarketingRoute = location.pathname.startsWith("/marketing-website") || location.pathname.startsWith("/landing/");

    // Check if this is a conversion page (adjust based on your actual conversion URL)
    const isConversionPage =
        location.pathname.includes("/thank-you") || location.pathname.includes("/success") || location.search.includes("conversion=success");

    // 1. Load gtag script (keep it simple - don't remove on route change)
    useEffect(() => {
        if (!isMarketingRoute) return;
        if (gtagLoaded.current) return;

        // Load the Google tag as per documentation
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-18027859516";
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18027859516');
        `;
        document.head.appendChild(script2);

        gtagLoaded.current = true;
    }, [isMarketingRoute]);

    // 2. Track page views (keep it simple, don't disable send_page_view)
    useEffect(() => {
        if (isMarketingRoute && typeof window.gtag === "function") {
            window.gtag("event", "page_view", {
                page_path: location.pathname + location.search,
                page_title: document.title || "CRESCO Marketing",
            });
        }
    }, [location, isMarketingRoute]);

    // 3. Track conversion on conversion page (NEW - This is what was missing)
    useEffect(() => {
        if (!isMarketingRoute) return;
        if (!isConversionPage) return;
        if (conversionTracked.current) return; // Prevent duplicate tracking
        if (typeof window.gtag !== "function") return;

        // Fire the conversion event as specified in documentation
        window.gtag("event", "conversion", {
            send_to: "AW-18027859516/WW8sCMmI94scELycrZRD",
            value: 1.0,
            currency: "INR",
        });

        conversionTracked.current = true;

        // Optional: Log for debugging
        console.log("Conversion tracked for AW-18027859516/WW8sCMmI94scELycrZRD");
    }, [isMarketingRoute, isConversionPage]);

    // 4. Tawk.to implementation (keep as is, but remove the script removal logic)
    useEffect(() => {
        if (!isMarketingRoute) {
            // Just hide the widget, don't remove scripts
            if (window.Tawk_API && window.Tawk_API.hideWidget) {
                window.Tawk_API.hideWidget();
            }
            return;
        }

        if (tawkLoaded.current) return;
        if (window.Tawk_API) return;

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        window.Tawk_API.customStyle = {
            visibility: {
                desktop: { position: "bl" },
                mobile: { position: "bl" },
            },
        };

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://embed.tawk.to/69d00d197231721c37fdd5ed/1jlab6bsl";
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        script.id = "tawk-widget-script";

        document.body.appendChild(script);
        tawkLoaded.current = true;
    }, [isMarketingRoute]);

    // Theme code (keep as is)
    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(theme || (prefersDark ? "dark" : "light"));
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
        <div className="flex min-h-screen flex-col bg-white/50 text-gray-700 transition-colors dark:bg-black dark:text-white">
            <Navbar
                theme={theme}
                setTheme={setTheme}
            />
            <main className="-mb-32 flex-1">
                <Outlet />
            </main>
            <Footer theme={theme} />
        </div>
    );
}
