import React, { useEffect, useRef, useState } from "react";
import assets from "../../assets/assets";
import { Link } from "react-router-dom";

const Features = () => {
    const features = [
        {
            title: "Smart Lead Management",
            description: "Capture, qualify, and track leads from multiple channels with complete visibility and zero data loss.",
            icon: assets.ads_icon,
        },
        {
            title: "Automated Sales Pipeline",
            description: "Move deals faster with intelligent workflows, reminders, and stage-based automation.",
            icon: assets.marketing_icon,
        },
        {
            title: "360° Customer View",
            description: "Access complete customer history including calls, emails, notes, and transactions in one place.",
            icon: assets.content_icon,
        },
        {
            title: "Advanced Analytics",
            description: "Track performance with real-time dashboards and actionable business insights.",
            icon: assets.social_icon,
        },
        {
            title: "Omnichannel Communication",
            description: "Engage customers seamlessly across email, phone, chat, and messaging platforms.",
            icon: assets.support_icon || assets.content_icon,
        },
        {
            title: "Enterprise-Grade Security",
            description: "Your data is protected with role-based access, encryption, and secure cloud infrastructure.",
            icon: assets.security_icon || assets.marketing_icon,
        },
    ];

    /* ===== STATS COUNT LOGIC ===== */
    const statsRef = useRef(null);
    const animationRef = useRef(null);

    const [stats, setStats] = useState({
        speed: 0,
        satisfaction: 0,
        users: 0,
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    startAnimation();
                } else {
                    resetStats();
                }
            },
            { threshold: 0.4 },
        );

        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    const resetStats = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setStats({
            speed: 0,
            satisfaction: 0,
            users: 0,
        });
    };

    const startAnimation = () => {
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setStats({
                speed: Math.floor(progress * 10),
                satisfaction: Math.floor(progress * 98),
                users: Math.floor(progress * 50000),
            });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    return (
        <div className="overflow-hidden px-4 md:px-20 lg:px-28 lg:pt-5 md:pt-5 pt-10">
            {/* HERO */}
            <div className="relative flex flex-col items-center gap-6 py-10 text-center text-gray-700 dark:text-white md:py-24">
                <h1 className="max-w-4xl text-4xl font-medium sm:text-5xl md:text-6xl">
                    Powerful features built for{" "}
                    <span className="bg-gradient-to-r from-[#5044e5] to-[#4d8cea] bg-clip-text text-transparent">modern CRM teams</span>
                </h1>
                <p className="max-w-2xl text-sm text-gray-600 dark:text-white/75 sm:text-lg">
                    Everything you need to manage leads, close deals, and grow long-term customer relationships.
                </p>
            </div>

            {/* FEATURES GRID */}
            <div className="-mt-10 grid gap-8 py-10 sm:grid-cols-2 md:-mt-20 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
                    >
                        <div className="mb-4 inline-flex rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                            <img
                                src={feature.icon}
                                alt=""
                                className="w-8"
                            />
                        </div>

                        <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-white/70">{feature.description}</p>

                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{
                                background: "linear-gradient(120deg, rgba(80,68,229,0.12), rgba(77,140,234,0.08), transparent)",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* HIGHLIGHT */}
            <div className="mt-0 md:mt-10 flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
                <div className="max-w-xl text-center lg:text-left">
                    <h2 className="text-3xl font-medium md:text-4xl">Designed to scale as your business grows</h2>
                    <p className="mt-5 text-gray-600 dark:text-white/75">
                        Whether you're a startup or an enterprise, our CRM adapts to your workflows and growth goals.
                    </p>

                    <Link to="/signup">
                        <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-10 py-3 text-sm text-white transition-all hover:scale-105">
                            Start Free Trial
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

            {/* STATS SECTION */}
            <div
                ref={statsRef}
                className="mt-5 md:mt-10 grid gap-10 rounded-2xl bg-gray-50 p-10 text-center dark:bg-gray-900 sm:grid-cols-3"
            >
                <div>
                    <h3 className="text-4xl font-semibold text-primary">{stats.speed}x</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">Faster lead response time</p>
                </div>

                <div>
                    <h3 className="text-4xl font-semibold text-primary">{stats.satisfaction}%</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">Customer satisfaction rate</p>
                </div>

                <div>
                    <h3 className="text-4xl font-semibold text-primary">{stats.users.toLocaleString()}+</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">Businesses powered globally</p>
                </div>
            </div>
        </div>
    );
};

export default Features;
