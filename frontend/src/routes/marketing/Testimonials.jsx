import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import assets from "../../assets/assets";

const testimonials = [
    {
        name: "Prof. (Dr.) Rohan P. Dahivale",
        role: "Director",
        company: "RIMRD Pune",
        quote: "Cresco Software Solutions delivered a CRM that perfectly matched our sales process. Lead tracking, follow-ups, and reports are now much easier and faster.",
        metric: "↑ 52% deal conversion",
        image: "https://rimrd.org/images/logo1.PNG",
    },
    {
        name: "Mr. Nasir Basha",
        role: "Business Owner",
        company: "TN PINNACLE MARKETING",
        quote: "Their team understood our requirements clearly and built a customized CRM that improved our customer management and team productivity.",
        metric: "↑ 75% response time",
        image: "https://mypinnacle.co.in/images/logo.png",
    },
    {
        name: "Kailash Pawar",
        role: " IT Head",
        company: "Poona People's Bank",
        quote: "We were looking for a scalable CRM with integrations, and Cresco delivered exactly that. The system is user-friendly and well supported.",
        metric: "↓ 45% response time",
        image: "",
    },
    {
        name: "Hajira Muskan",
        role: "Marketing Lead",
        company: "HWS Marketing",
        quote: "Excellent support and timely delivery. The CRM helped us organize leads and improve conversion rates significantly.",
        metric: "↑ 3x team adoption",
        image: "https://hwsfortune.com/storage/app/public/company/2024-09-28-66f80ccc4f948.webp",
    },
    {
        name: "Balasaheb Thombare",
        role: "Founder and Director",
        company: "Agrixpert Agro Mall",
        quote: "Cresco’s CRM solution reduced manual work and gave us better visibility into our sales pipeline. Highly recommended.",
        metric: "↑ 28% repeat sales",
        image: "",
    },
];

const Testimonials = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const statsRef = useRef(null);
    const animationRef = useRef(null);

    const [stats, setStats] = useState({
        satisfaction: 0,
        worldwide: 0,
        adoption: 0,
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) startAnimation();
                else resetStats();
            },
            { threshold: 0.4 },
        );

        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    const resetStats = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setStats({ satisfaction: 0, worldwide: 0, adoption: 0 });
    };

    const startAnimation = () => {
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setStats({
                satisfaction: Math.floor(progress * 98),
                worldwide: Math.floor(progress * 50),
                adoption: Math.floor(progress * 3),
            });

            if (progress < 1) animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    return (
        <div className="relative overflow-hidden px-4 pt-10 md:px-20 md:pt-10 lg:px-28 lg:pt-10">
            {/* BACKGROUND GLOW */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#5044e5]/20 blur-[140px]" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#4d8cea]/20 blur-[140px]" />
            </div>

            {/* HERO */}
            <section className="flex flex-col items-center gap-6 pt-10 text-center text-gray-700 dark:text-white md:pt-20">
                <h1 className="max-w-4xl text-4xl font-medium sm:text-5xl md:text-6xl">
                    Trusted by teams who care about{" "}
                    <span className="bg-gradient-to-r from-[#5044e5] to-[#4d8cea] bg-clip-text text-transparent">real relationships</span>
                </h1>

                <p className="max-w-2xl text-sm text-gray-600 dark:text-white/75 sm:text-lg">
                    Real stories from businesses using our CRM to close deals faster, support customers better, and scale with confidence.
                </p>
            </section>

            <section className="mt-16 grid gap-14 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((item, index) => {
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

                    const shouldBlur = hoveredIndex !== null && hoveredIndex !== index;

                    return (
                        <div
                            key={index}
                            ref={cardRef}
                            onMouseEnter={() => {
                                setHoveredIndex(index);
                                setVisible(true);
                            }}
                            onMouseLeave={() => {
                                setHoveredIndex(null);
                                setVisible(false);
                            }}
                            onMouseMove={handleMouseMove}
                            className="group relative rounded-3xl p-[1.5px] transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Gradient Border */}
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

                            {/* Card */}
                            <div
                                className={`relative z-10 flex h-full flex-col rounded-[22px] bg-white shadow-xl transition-all delay-75 duration-500 dark:bg-gray-900 ${shouldBlur ? "scale-[0.98] blur-[6px]" : "blur-0"} `}
                            >
                                {/* Avatar */}
                                <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5044e5] to-[#4d8cea] p-[3px]">
                                            <div className="h-full w-full rounded-full bg-white dark:bg-gray-900" />
                                        </div>
                                        <img
                                            src={
                                                item.image ||
                                                "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                                            }
                                            alt={item.name}
                                            className="relative z-10 h-24 w-24 rounded-full border-4 border-white object-cover dark:border-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-grow flex-col px-8 pb-8 pt-16">
                                    <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-white/75">“{item.quote}”</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold">{item.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-white/60">
                                                {item.role}, {item.company}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-gradient-to-r from-[#5044e5]/10 to-[#4d8cea]/10 px-4 py-1 text-xs font-semibold text-[#5044e5]">
                                            {item.metric}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* TRUST STATS */}
            <section
                ref={statsRef}
                className="mt-10 grid gap-10 rounded-3xl bg-gray-50 p-12 text-center dark:bg-gray-900 sm:grid-cols-3"
            >
                <div>
                    <h3 className="text-4xl font-semibold text-primary">{stats.satisfaction}%</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">Customer satisfaction</p>
                </div>

                <div>
                    <h3 className="text-4xl font-semibold text-primary">{stats.worldwide}k+</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">Active users worldwide</p>
                </div>

                <div>
                    <h3 className="text-4xl font-semibold text-primary">{stats.adoption}x</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">Faster CRM adoption</p>
                </div>
            </section>

            {/* CTA */}
            <section className="mt-10 flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-[#5044e5] to-[#4d8cea] p-14 text-center text-white shadow-[0_40px_100px_-25px_rgba(80,68,229,0.6)] md:p-20">
                <h2 className="text-2xl font-medium md:text-3xl">Ready to see why teams trust us?</h2>

                <p className="max-w-xl text-sm text-white/90 md:text-base">
                    Start your free trial today and experience a CRM built for real-world teams.
                </p>

                <Link to="/signup">
                    <button className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-12 py-3 text-sm font-semibold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                        Start Free Trial
                        <img
                            src={assets.arrow_icon}
                            alt=""
                            className="w-4"
                        />
                    </button>
                </Link>
            </section>
        </div>
    );
};

export default Testimonials;
