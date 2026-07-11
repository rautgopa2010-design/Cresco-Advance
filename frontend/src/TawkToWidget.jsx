import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const hideTawkWidget = () => {
    if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
    }

    document.querySelectorAll("iframe[src*='tawk.to'], iframe[title*='chat'], #tawkchat-container").forEach((element) => {
        element.style.display = "none";
        element.style.visibility = "hidden";
    });
};

const showTawkWidget = () => {
    document.querySelectorAll("iframe[src*='tawk.to'], iframe[title*='chat'], #tawkchat-container").forEach((element) => {
        element.style.display = "";
        element.style.visibility = "";
    });

    if (window.Tawk_API?.showWidget) {
        window.Tawk_API.showWidget();
    }
};

const TawkToWidget = () => {
    const location = useLocation();
    const tawkLoaded = useRef(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));
    
    useEffect(() => {
        const syncAuthState = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));

        window.addEventListener("storage", syncAuthState);
        window.addEventListener("sessionUserUpdated", syncAuthState);
        window.addEventListener("authStateChanged", syncAuthState);

        return () => {
            window.removeEventListener("storage", syncAuthState);
            window.removeEventListener("sessionUserUpdated", syncAuthState);
            window.removeEventListener("authStateChanged", syncAuthState);
        };
    }, []);

    const isPublicMarketingRoute = location.pathname.startsWith("/marketing-website") || location.pathname.startsWith("/landing/");
    const shouldShowWidget = isPublicMarketingRoute && !isLoggedIn;

    useEffect(() => {
        if (!shouldShowWidget) {
            hideTawkWidget();
            return;
        }

        // Show and load widget only if not already loaded
        if (tawkLoaded.current) {
            showTawkWidget();
            return;
        }

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        window.Tawk_API.onLoad = () => {
            if (localStorage.getItem("token")) {
                hideTawkWidget();
                return;
            }

            showTawkWidget();
        };

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
        document.body.appendChild(script);
        
        tawkLoaded.current = true;
    }, [shouldShowWidget]);

    return null;
};

export default TawkToWidget;
