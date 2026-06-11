import React, { useRef, useState } from "react";
import assets from "../../assets/assets";
import { Link } from "react-router-dom";

const industries = [
    {
        title: "Real Estate",
        description: "Manage property leads, automate follow-ups, and close deals faster with centralized client communication.",
        icon: assets.work_dashboard_management,
    },
    {
        title: "Healthcare",
        description: "Streamline patient engagement, appointment tracking, and care coordination with secure CRM workflows.",
        icon: assets.work_fitness_app,
    },
    {
        title: "E-Commerce",
        description: "Track customer journeys, recover abandoned carts, and boost repeat sales with smart automation.",
        icon: assets.work_mobile_app,
    },
    {
        title: "Finance & Insurance",
        description: "Manage prospects, policies, and renewals while maintaining compliance and data security.",
        icon: assets.security_icon || assets.work_dashboard_management,
    },
    {
        title: "Education",
        description: "Convert inquiries into enrollments and maintain long-term student relationships effortlessly.",
        icon: assets.content_icon,
    },
    {
        title: "IT & SaaS",
        description: "Handle subscriptions, onboarding, and customer success with a scalable CRM platform.",
        icon: assets.ads_icon,
    },
];

const Industrie = () => {
    return (
        <div className="relative overflow-hidden px-4 md:px-20 lg:px-28 lg:pt-5 md:pt-10 pt-0">
            {/* BACKGROUND GLOW */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute right-0 top-20 h-[400px] w-[400px] rounded-full bg-[#5044e5]/20 blur-[120px]" />
                <div className="absolute bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-[#4d8cea]/20 blur-[120px]" />
            </div>

            {/* HERO */}
            <div className="flex flex-col items-center gap-6 py-20 text-center text-gray-700 dark:text-white">
                <h1 className="max-w-4xl text-4xl font-medium sm:text-5xl md:text-6xl">
                    Tailored CRM solutions for{" "}
                    <span className="bg-gradient-to-r from-[#5044e5] to-[#4d8cea] bg-clip-text text-transparent">every industry</span>
                </h1>

                <p className="max-w-2xl text-sm text-gray-600 dark:text-white/75 sm:text-lg">
                    From startups to enterprises, our CRM adapts to your industry’s workflows, customers, and growth goals.
                </p>
            </div>

            {/* INDUSTRY GRID */}
            <div className="grid gap-8 pb-16 sm:grid-cols-2 lg:grid-cols-3">
                {industries.map((industry, index) => {
                    const cardRef = useRef(null);
                    const [visible, setVisible] = useState(false);
                    const [position, setPosition] = useState({ x: 0, y: 0 });

                    const handleMouseMove = (e) => {
                        const bounds = cardRef.current.getBoundingClientRect();
                        setPosition({
                            x: e.clientX - bounds.left,
                            y: e.clientY - bounds.top,
                        });
                    };

                    return (
                        <div
                            key={index}
                            ref={cardRef}
                            onMouseEnter={() => setVisible(true)}
                            onMouseLeave={() => setVisible(false)}
                            onMouseMove={handleMouseMove}
                            className="group relative rounded-3xl p-[1.5px] transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* MOVING GRADIENT BORDER */}
                            <div
                                className={`pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                                    visible ? "opacity-100" : "opacity-0"
                                }`}
                                style={{
                                    background: `radial-gradient(
                        320px circle at ${position.x}px ${position.y}px,
                        #5044e5,
                        #4d8cea,
                        #9333ea,
                        transparent 65%
                    )`,
                                }}
                            />

                            {/* CARD CONTENT */}
                            <div className="relative z-10 h-full rounded-[22px] border border-gray-200 bg-white p-8 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900">
                                {/* ICON */}
                                <div className="mb-6 inline-flex rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
                                    <img
                                        src={industry.icon}
                                        alt=""
                                        className="w-10"
                                    />
                                </div>

                                {/* CONTENT */}
                                <h3 className="mb-3 text-xl font-semibold">{industry.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-white/70">{industry.description}</p>

                                {/* HOVER GRADIENT */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    style={{
                                        background: "linear-gradient(120deg, rgba(80,68,229,0.12), rgba(77,140,234,0.08), transparent)",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* HIGHLIGHT SECTION */}
            <div className="flex flex-col-reverse items-center gap-12 rounded-3xl bg-gray-50 p-12 text-center dark:bg-gray-900 lg:flex-row-reverse lg:justify-between lg:text-left">
                <div className="max-w-xl">
                    <h2 className="text-3xl font-medium md:text-4xl">One CRM. Unlimited possibilities.</h2>
                    <p className="mt-5 text-gray-600 dark:text-white/75">
                        Customize workflows, automate processes, and gain insights tailored specifically for your industry.
                    </p>

                    <Link to="/signup">
                        <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-10 py-3 text-sm text-white transition-all hover:scale-105">
                            Get Started
                            <img
                                src={assets.arrow_icon}
                                alt=""
                                className="w-4"
                            />
                        </button>
                    </Link>
                </div>

                <div className="w-full max-w-xl">
                    <img
                        src={assets.work_dashboard_management}
                        alt=""
                        className="w-full rounded-2xl shadow-xl"
                    />
                </div>
            </div>
        </div>
    );
};

export default Industrie;
