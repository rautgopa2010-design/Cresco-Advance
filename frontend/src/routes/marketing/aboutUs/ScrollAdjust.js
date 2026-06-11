import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollAdjust() {
    const location = useLocation();

    useEffect(() => {
        const navbarHeight = 2;

        // Scroll top but keep navbar offset
        window.scrollTo({
            top: navbarHeight,
            behavior: "smooth",
        });
    }, [location.pathname]);

    return null;
}
