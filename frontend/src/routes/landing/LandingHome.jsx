import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Home from "./home/Home";
import AboutUs from "./aboutUs/AboutUs";
import EnquiryNow from "./EnquiryNow";
import OurServices from "./OurServices";
import Testimonials from "./Testimonials";
import ContactUs from "./ContactUs";
import EnquiryFloatingModal from "./EnquiryFloatingModal";

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
            className={`fixed bottom-8 right-8 z-50 rounded-full bg-[#40403f] p-4 text-white shadow-lg transition-all hover:scale-110 hover:bg-[#000000] ${
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

const LandingHome = () => {
    const { section } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const sectionRefs = {
        home: useRef(null),
        "about-us": useRef(null),
        "enquiry-now": useRef(null),
        "our-services": useRef(null),
        testimonials: useRef(null),
        "contact-us": useRef(null),
    };

    const [showFloatingEnquiry, setShowFloatingEnquiry] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFloatingEnquiry(true);
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, []); // Runs once when component mounts

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
                ref={sectionRefs["about-us"]}
                id="about-us"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <AboutUs />
            </section>
            <section
                ref={sectionRefs["enquiry-now"]}
                id="enquiry-now"
                className="min-h-screen bg-gray-50 dark:bg-gray-900 md:max-h-screen md:min-h-0"
            >
                <EnquiryNow />
            </section>
            <section
                ref={sectionRefs["our-services"]}
                id="our-services"
                className="min-h-screen bg-gray-50 dark:bg-gray-900 md:max-h-screen md:min-h-0"
            >
                <OurServices />
            </section>
            <section
                ref={sectionRefs.testimonials}
                id="testimonials"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <Testimonials />
            </section>
            <section
                ref={sectionRefs["contact-us"]}
                id="contact-us"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                <ContactUs />
            </section>
            <ScrollToTopButton />
            {showFloatingEnquiry && (
                <EnquiryFloatingModal onClose={() => setShowFloatingEnquiry(false)} />
            )}
        </div>
    );
};

export default LandingHome;
