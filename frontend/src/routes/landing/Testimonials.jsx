import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import assets from "../../assets/assets";
import { usePublicCompany } from "../../context/PublicCompanyContext";
import { IMAGE_BASE_URL } from "../../utils/api";

const hardcodedTestimonials = [
    {
        name: "Sachin Khodape",
        role: "CEO & founder",
        company: "Khodape Software Pvt. Ltd.",
        quote: "This CRM completely changed how our sales team works. Follow-ups actually happen now, and our close rate improved within weeks.",
        image: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
        name: "Amit Sharma",
        role: "Head of Sales",
        company: "UrbanNest Realty",
        quote: "This CRM completely changed how our sales team works. Follow-ups actually happen now, and our close rate improved within weeks.",
        image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    },
    {
        name: "Neha Kapoor",
        role: "Customer Success Manager",
        company: "HealthBridge Clinics",
        quote: "Having a 360° customer view helped our team deliver faster and more personal support. Onboarding time dropped significantly.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
    },
    {
        name: "Divyanshu Bansod",
        role: "Founder",
        company: "SaaSFlow",
        quote: "Most CRMs slow you down. This one quietly adapts to how your team already works. That’s the biggest win for us.",
        image: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    {
        name: "Ankita Rokade",
        role: "Performance manager",
        company: "ShopEase",
        quote: "The automation feels intentional, not overwhelming. We finally understand our customers instead of just tracking them.",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    {
        name: "Amol Khade",
        role: "Senior writer",
        company: "SaaSFlow",
        quote: "Most CRMs slow you down. This one quietly adapts to how your team already works. That’s the biggest win for us.",
        image: "https://randomuser.me/api/portraits/men/14.jpg",
    },
];

const Testimonials = () => {
    const { companySlug } = useParams();
    const { landingPageSetup } = usePublicCompany();

    const [hoveredIndex, setHoveredIndex] = useState(null);

    const sliderRef = useRef(null);
    const animationRef = useRef(null);

    const [translateX, setTranslateX] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const sliderSpeed = 0.35;

    const statsRef = useRef(null);
    const statsAnimationRef = useRef(null);

    const [stats, setStats] = useState({
        satisfaction: 0,
        worldwide: 0,
        adoption: 0,
    });
    
    const testimonials =
        landingPageSetup?.testimonials && landingPageSetup.testimonials.length > 0
            ? landingPageSetup.testimonials.map((item) => ({
                  name: item.name,
                  role: item.role,
                  company: item.company,
                  quote: item.quote,
                  image: item.image.startsWith("/uploads/")
                      ? `${IMAGE_BASE_URL}${item.image}`
                      : item.image,
              }))
            : hardcodedTestimonials;

    const sliderTestimonials = [...testimonials, ...testimonials];

    useEffect(() => {
        if (isPaused) return;

        const animate = () => {
            setTranslateX((prev) => {
                const sliderWidth = sliderRef.current?.scrollWidth / 2 || 0;
                return Math.abs(prev) >= sliderWidth ? 0 : prev - sliderSpeed;
            });
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationRef.current);
    }, [isPaused]);

    const slideLeft = () => setTranslateX((prev) => prev + 300);
    const slideRight = () => setTranslateX((prev) => prev - 300);

    const targetStats = useMemo(() => {
        if (!landingPageSetup) return null;
    
        return {
            satisfaction: landingPageSetup.stats_satisfaction ?? 0,
            worldwide: landingPageSetup.stats_worldwide ?? 0,
            adoption: landingPageSetup.stats_adoption ?? 0,
        };
    }, [landingPageSetup]);

    const resetStats = () => {
        cancelAnimationFrame(statsAnimationRef.current);
        setStats({ satisfaction: 0, worldwide: 0, adoption: 0 });
    };    

    const startStatsAnimation = () => {
        if (!targetStats) return;
    
        cancelAnimationFrame(statsAnimationRef.current);
    
        const duration = 1500;
        const startTime = performance.now();
    
        const animate = (time) => {
            const progress = Math.min((time - startTime) / duration, 1);
    
            setStats({
                satisfaction: Math.floor(progress * targetStats.satisfaction),
                worldwide: Math.floor(progress * targetStats.worldwide),
                adoption: Math.floor(progress * targetStats.adoption),
            });
    
            if (progress < 1) {
                statsAnimationRef.current = requestAnimationFrame(animate);
            }
        };
    
        statsAnimationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!targetStats) return;
    
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    startStatsAnimation();
                } else {
                    resetStats();
                }
            },
            { threshold: 0.4 }
        );
    
        if (statsRef.current) observer.observe(statsRef.current);
    
        return () => observer.disconnect();
    }, [targetStats]);    

    return (
        <div className="relative overflow-hidden px-4 pt-10 md:px-20 lg:px-28">
            {/* BACKGROUND GLOW */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#5044e5]/20 blur-[140px]" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#4d8cea]/20 blur-[140px]" />
            </div>

            {/* HERO */}
            <section className="flex flex-col items-center gap-6 pt-10 text-center">
                <h1
                    className="max-w-4xl text-4xl font-medium sm:text-5xl md:text-6xl text-black"
                    dangerouslySetInnerHTML={{
                        __html: landingPageSetup?.testimonials_title || "",
                    }}
                />
                <p className="max-w-2xl text-sm text-gray-700 sm:text-lg">
                    {landingPageSetup?.testimonials_subtext || ""}
                </p>
            </section>

            {/* TESTIMONIALS SLIDER */}
            <section className="relative mt-20 overflow-hidden">
                <button
                    onClick={slideLeft}
                    className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg hover:scale-110"
                >
                    ◀
                </button>

                <button
                    onClick={slideRight}
                    className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg hover:scale-110"
                >
                    ▶
                </button>

                <div
                    ref={sliderRef}
                    className="flex gap-10"
                    style={{
                        transform: `translateX(${translateX}px)`,
                        transition: "transform 0.01s linear",
                        width: "max-content",
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => {
                        setIsPaused(false);
                        setHoveredIndex(null);
                    }}
                >
                    {sliderTestimonials.map((item, index) => {
                        const shouldBlur =
                            hoveredIndex !== null && hoveredIndex !== index;

                        return (
                            <div
                                key={index}
                                onMouseEnter={() => {
                                    setHoveredIndex(index);
                                    setIsPaused(true);
                                }}
                                onMouseLeave={() => {
                                    setHoveredIndex(null);
                                    setIsPaused(false);
                                }}
                                className={`w-[340px] py-5 flex-shrink-0 transition-all duration-500 ${
                                    shouldBlur ? "scale-[0.96] blur-[6px]" : ""
                                }`}
                            >
                                <div className="relative rounded-3xl bg-white p-8 shadow-xl">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover"
                                    />

                                    <p className="mt-6 text-sm text-gray-700">
                                        “{item.quote}”
                                    </p>

                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-black">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-gray-700">
                                            {item.role}, {item.company}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* TRUST STATS */}
            <section
                ref={statsRef}
                className="mt-16 grid gap-10 rounded-3xl bg-gray-50 p-12 text-center sm:grid-cols-3"
            >
                <div>
                    <h3 className="text-4xl font-semibold text-black">{stats.satisfaction}%</h3>
                    <p className="mt-2 text-sm text-gray-700">Customer satisfaction</p>
                </div>

                <div>
                    <h3 className="text-4xl font-semibold text-black">{stats.worldwide}k+</h3>
                    <p className="mt-2 text-sm text-gray-700">Active users worldwide</p>
                </div>

                <div>
                    <h3 className="text-4xl font-semibold text-black">{stats.adoption}x</h3>
                    <p className="mt-2 text-sm text-gray-700">Faster CRM adoption</p>
                </div>
            </section>

            {/* CTA */}
            <section className="mt-16 flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-black to-gray-700 p-14 text-center text-white md:p-20">
                <h2 className="text-2xl font-medium md:text-3xl">
                    Ready to see why teams trust us?
                </h2>

                <p className="max-w-xl text-sm text-white/90">
                    Get Enquiry today and experience a CRM built for real-world teams.
                </p>

                <Link to={`/landing/${companySlug}/enquiry-now`}>
                    <button className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-12 py-3 text-sm font-semibold text-black shadow-lg transition-all hover:scale-105">
                        Enquiry Now
                        <img src={assets.arrow_icon} alt="" className="w-4" />
                    </button>
                </Link>
            </section>
        </div>
    );
};

export default Testimonials;
