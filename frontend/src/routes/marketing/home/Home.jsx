import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { clearSnackbar } from "@/redux/actions/commonActions";
import assets, { company_logos } from "../../../assets/assets";
import ServiceCard from "./ServiceCard";
import { useDispatch } from "react-redux";

const Home = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        if (location.state?.snackbarMessage) {
            setSnackbarMessage(location.state.snackbarMessage);
            setSnackbarSeverity(location.state.snackbarSeverity || "success");
            setSnackbarOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const serviceData = [
        {
            name: "Lead & Contact Management",
            description: "Capture, organize, and track every lead in one place so no opportunity ever slips through the cracks.",
            icon: assets.ads_icon,
        },
        {
            name: "Sales Pipeline Automation",
            description: "Visualize your sales pipeline, automate follow-ups, and close deals faster with smart workflows.",
            icon: assets.marketing_icon,
        },
        {
            name: "Customer Support & Engagement",
            description: "Deliver timely, personalized support and build lasting customer relationships across every touchpoint.",
            icon: assets.content_icon,
        },
        {
            name: "Analytics & Business Insights",
            description: "Turn real-time customer data into actionable insights that drive smarter decisions and sustainable growth.",
            icon: assets.social_icon,
        },
    ];

    return (
        <>
            {/* WRAPPER WITH OVERFLOW-HIDDEN */}
            <div className="relative overflow-hidden px-4 md:px-20 lg:px-28">
                {/* ABSOLUTE BG IMAGE (MOVABLE) */}
                <div className="pointer-events-none absolute -right-[550px] -top-[100px] opacity-100 dark:hidden md:-right-[550px] md:-top-[200px] lg:-right-[550px] lg:-top-[200px]">
                    <img
                        src={assets.bgImage1}
                        alt=""
                        className="w-full select-none"
                    />
                </div>

                {/* FOREGROUND CONTENT */}
                <div className="-z-1 relative flex w-full flex-col items-center gap-6 overflow-hidden py-10 text-center text-gray-700 dark:text-white md:py-20">
                    <h1 className="max-w-5xl text-4xl font-medium sm:text-5xl md:text-6xl xl:text-[84px] xl:leading-[95px]">
                        Turning relationships into{" "}
                        <span className="bg-gradient-to-r from-[#5044e5] to-[#4d8cea] bg-clip-text text-transparent">business</span> growth.
                    </h1>

                    <p className="max-w-4/5 pb-3 text-sm font-medium text-gray-700 dark:text-white/75 sm:max-w-lg sm:text-lg">
                        Uniting your sales, support, and marketing to deliver simple, smart, and connected customer experiences.
                    </p>
                </div>

                {/* HERO IMAGE */}
                <div className="-z-1 relative flex justify-center">
                    <img
                        src={assets.hero_img}
                        alt=""
                        className="w-full max-w-6xl"
                    />
                </div>
            </div>

            <div className="relative overflow-hidden px-4 md:px-20 lg:px-28">
                {/* ABSOLUTE BG IMAGE (MOVABLE) */}
                <div className="pointer-events-none absolute -left-[400px] top-[100px] opacity-100 dark:hidden md:-left-[600px] md:-top-[300px] lg:-left-[800px] lg:-top-[400px]">
                    <img
                        src={assets.bgImage2}
                        alt=""
                        className="w-full select-none"
                    />
                </div>

                {/* FOREGROUND CONTENT */}
                <div className="-z-1 relative mt-16 px-4 text-gray-700 dark:text-white/80 md:mt-20 md:px-20 lg:mt-20 lg:px-28">
                    <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
                        {/* LEFT CONTENT */}
                        <div className="flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-start">
                            <h3 className="text-3xl font-medium sm:text-3xl md:text-4xl xl:text-[60px] xl:leading-[75px]">
                                Your customer relationships, powered by our CRM expertise
                            </h3>

                            <p className="mt-6 max-w-2xl text-base text-gray-700 dark:text-white/75 md:text-2xl">
                                A powerful, easy-to-use CRM platform designed to help you manage leads, close deals, and build lasting customer
                                relationships securely and at scale.
                            </p>

                            <Link to="/signup">
                                <button className="mt-8 flex items-center gap-2 rounded-full bg-primary px-10 py-3 text-sm text-white transition-all hover:scale-105">
                                    Get Started For Free
                                    <img
                                        src={assets.arrow_icon}
                                        alt=""
                                        className="w-4"
                                    />
                                </button>
                            </Link>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="w-[400px] md:w-[700px] lg:h-[400px] lg:w-[900px]">
                            <img
                                src={assets.get_statrted_free}
                                alt="Get Started"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="-z-1 relative mt-16 flex flex-col items-center gap-10 px-4 text-gray-700 dark:text-white/80 md:mt-20 md:px-20 lg:mt-20 lg:px-28">
                    <h3>Trusted By Leading Companies</h3>
                    <div className="m-4 flex flex-wrap items-center justify-center gap-10">
                        {company_logos.map((logo, index) => {
                            return (
                                <img
                                    key={index}
                                    src={logo}
                                    alt=""
                                    className="max-h-36 dark:drop-shadow-xl sm:max-h-40"
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="-z-1 relative flex w-full flex-col items-center gap-6 overflow-hidden py-10 text-center text-gray-700 dark:text-white md:py-20">
                    <h1 className="text-3xl sm:text-5xl">How can we help?</h1>

                    <p className="mb-6 max-w-lg text-center text-sm text-gray-500 dark:text-white/75 sm:text-base">
                        From lead management to customer success, we empower your business with smarter CRM solutions.
                    </p>
                </div>

                <div className="-mt-16 flex flex-col justify-self-center md:grid md:grid-cols-1 lg:grid-cols-2">
                    {serviceData.map((service, index) => (
                        <ServiceCard
                            key={index}
                            service={service}
                        />
                    ))}
                </div>
            </div>

            {/* SNACKBAR */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Home;
