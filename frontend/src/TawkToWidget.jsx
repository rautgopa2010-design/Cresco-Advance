import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TawkToWidget = () => {
    const location = useLocation();
    const tawkLoaded = useRef(false);
    
    // Only show on marketing and landing pages
    const shouldShowWidget = location.pathname.startsWith('/marketing-website') || 
                            location.pathname.startsWith('/landing/');

    useEffect(() => {
        if (!shouldShowWidget) {
            // Hide widget if it exists
            if (window.Tawk_API && window.Tawk_API.hideWidget) {
                window.Tawk_API.hideWidget();
            }
            return;
        }

        // Show and load widget only if not already loaded
        if (tawkLoaded.current) {
            if (window.Tawk_API && window.Tawk_API.showWidget) {
                window.Tawk_API.showWidget();
            }
            return;
        }

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
        document.body.appendChild(script);
        
        tawkLoaded.current = true;
    }, [shouldShowWidget]);

    return null;
};

export default TawkToWidget;