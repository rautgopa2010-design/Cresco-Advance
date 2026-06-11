import React, { useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Home from "./home/Home";
import OurServices from "./OurServices";
import Features from "./Features";
import Pricing from "./Pricing";
import Blogs from "./Blogs";
import Testimonials from "./Testimonials";
import Industrie from "./Industrie";
import ContactUs from "./ContactUs";

// Floating Scroll to Top Button (unchanged)
const ScrollToTopButton = () => {
    const [visible, setVisible] = React.useState(false);
    useEffect(() => {
        const toggleVisible = () => {
            setVisible(window.scrollY > 300);
        };
        window.addEventListener("scroll", toggleVisible);
        return () => window.removeEventListener("scroll", toggleVisible);
    }, []);
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 rounded-full bg-primary p-4 text-white shadow-lg transition-all hover:scale-110 hover:bg-purple-600 ${
                visible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    );
};

const MarketingHome = () => {
    const { section } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const sectionRefs = {
        home: useRef(null),
        "our-services": useRef(null),
        features: useRef(null),
        pricing: useRef(null),
        blogs: useRef(null),
        testimonials: useRef(null),
        industry: useRef(null),
        "contact-us": useRef(null),
    };

    useEffect(() => {
        const scrollToSection = () => {
            // Check if navigation state requests a scroll (for same-URL cases)
            const scrollTarget = location.state?.scrollTo || section || "home";
            const targetRef = sectionRefs[scrollTarget];

            if (targetRef?.current) {
                // Dynamically set navbar height based on current route
                const isHome = location.pathname === "/marketing-website";
                const navbarHeight = isHome ? 110 : 20;
                const extraOffset = 0;
                const elementPosition = targetRef.current.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - extraOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });

                // Clear state to prevent re-triggering on subsequent renders
                navigate(location.pathname, { replace: true, state: null });
            } else if (!section && !location.state?.scrollTo) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(scrollToSection, 100);
        return () => clearTimeout(timer);
    }, [section, location.state, location.pathname, navigate]); // Add location.state as dependency

    return (
        <div className="relative">
            <section
                ref={sectionRefs.home}
                id="home"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Home />
            </section>
            <section
                ref={sectionRefs["our-services"]}
                id="our-services"
                className="min-h-screen bg-gray-50 dark:bg-gray-900 md:max-h-screen md:min-h-0"
            >
                <OurServices />
            </section>
            <section
                ref={sectionRefs.features}
                id="features"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Features />
            </section>
            <section
                ref={sectionRefs.pricing}
                id="pricing"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Pricing />
            </section>
            {/* <section
                ref={sectionRefs.blogs}
                id="blogs"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Blogs />
            </section> */}
            <section
                ref={sectionRefs.testimonials}
                id="testimonials"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Testimonials />
            </section>
            <section
                ref={sectionRefs.industry}
                id="industry"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Industrie />
            </section>
            <section
                ref={sectionRefs["contact-us"]}
                id="contact-us"
                className="max-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <ContactUs />
            </section>
            <ScrollToTopButton />
        </div>
    );
};

export default MarketingHome;
