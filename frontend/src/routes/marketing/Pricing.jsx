import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import assets from "../../assets/assets";
import axios from "axios";
import { IMAGE_BASE_URL } from "../../utils/api";

const PricingCard = ({ plan }) => {
    const cardRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (plan.highlighted) return;

        const bounds = cardRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        });
    };

    // Helper function to extract numeric price
    const extractPrice = (priceStr) => {
        if (!priceStr || priceStr === "Custom") return 0;
        return parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
    };

    // Helper function to extract numeric user count
    const extractUserCount = (userStr) => {
        if (!userStr) return 1;
        return parseInt(userStr.replace(/[^0-9.-]+/g, "")) || 1;
    };

    // Helper function to calculate months from period string
    const calculateMonths = (periodStr) => {
        if (!periodStr) return 1;

        const period = periodStr.toLowerCase();
        const value = parseInt(period.replace(/[^0-9.-]+/g, "")) || 1;

        if (period.includes("year") || period.includes("yr")) {
            return value * 12;
        } else if (period.includes("month")) {
            return value;
        } else if (period.includes("day")) {
            return value / 30;
        }
        return 1;
    };

    // Calculate total amount based on price, users, and duration
    const calculateTotalAmount = () => {
        const price = extractPrice(plan.price);
        const users = extractUserCount(plan.user);
        const months = calculateMonths(plan.period);

        // If price is 0, total is 0
        if (price === 0) return 0;

        // Calculate based on duration type
        const period = plan.period?.toLowerCase() || "";
        let baseMonths = 1;

        if (period.includes("year")) {
            // For yearly, use 12.17 months (365/30)
            baseMonths = 12.17;
        } else if (period.includes("month")) {
            // For monthly, use exact months
            baseMonths = months;
        } else if (period.includes("day")) {
            // For days, convert to months
            baseMonths = months;
        }

        const total = users * price * baseMonths;
        return Math.round(total);
    };

    // Format period without slash
    const formatPeriod = (periodStr) => {
        if (!periodStr) return "";
        return periodStr.replace("/", "").trim();
    };

    const getPeriodDisplayText = () => {
        const period = plan.period?.toLowerCase() || "";
        const customPeriod = plan.customPeriod;

        // Check if period is "custom"
        if (period === "custom" && customPeriod) {
            return `${customPeriod} Day's`;
        }

        // For non-custom periods, just return the formatted period without "Day's"
        return formatPeriod(plan.period);
    };

    const price = extractPrice(plan.price);
    const totalAmount = calculateTotalAmount();
    const formattedPeriod = formatPeriod(plan.period);
    const userCount = extractUserCount(plan.user);

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => !plan.highlighted && setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onMouseMove={handleMouseMove}
            className="group relative h-full rounded-3xl p-[1.5px] transition-all duration-500 hover:-translate-y-2"
        >
            {/* GRADIENT BORDER */}
            {!plan.highlighted && (
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
            )}

            {/* STATIC BORDER FOR HIGHLIGHTED */}
            {plan.highlighted && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#5044e5] via-[#4d8cea] to-[#9333ea] opacity-90" />
            )}

            {/* CARD CONTENT */}
            <div className="relative z-10 h-full rounded-[22px] bg-white/90 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:bg-gray-900/90">
                <div
                    className={`relative z-10 flex h-full flex-col rounded-[22px] bg-white/70 p-8 backdrop-blur-xl dark:bg-gray-900/70 ${
                        plan.highlighted
                            ? "scale-[1.02] shadow-[0_30px_80px_-20px_rgba(80,68,229,0.45)]"
                            : "transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
                    }`}
                >
                    {plan.highlighted && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5044e5] to-[#4d8cea] px-5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg">
                            Most Popular
                        </div>
                    )}

                    <h3 className="text-xl font-semibold tracking-wide">{plan.name}</h3>

                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">{plan.description}</p>

                    <div className="mt-8 flex items-end gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                            {plan.price}
                            {/* Show /User/month only for paid plans (price > 0) */}
                            {price > 0 && (
                                <>
                                    <span className="text-lg font-thin"> /User</span>
                                    <span className="text-sm text-gray-500 dark:text-white/60">/month</span>
                                </>
                            )}
                        </span>
                    </div>

                    {/* User Count and Duration Display */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#5044e5] to-[#4d8cea]" />
                            <span className="text-gray-600 dark:text-white/70">
                                <span className="font-semibold">{userCount}</span> Users
                            </span>
                        </div>
                        {formattedPeriod && (
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#5044e5] to-[#4d8cea]" />
                                <span className="text-gray-600 dark:text-white/70">
                                    Duration: <span className="font-semibold">{getPeriodDisplayText()}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Total Amount Display */}
                    <div className="mt-4 text-xs text-gray-500 dark:text-white/60">
                        Total Amount of this Package according to Price & Users for Complete Duration:{" "}
                        <span className="font-semibold">₹{totalAmount.toLocaleString("en-IN")}</span>
                    </div>

                    <ul className="mt-8 grid flex-1 grid-cols-2 gap-x-12 gap-y-4 text-xs lg:text-sm">
                        {plan.features.map((feature, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-gray-700 dark:text-white/80"
                            >
                                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gradient-to-r from-[#5044e5] to-[#4d8cea]" />
                                <span className="text-nowrap">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link to="/signup">
                        <button
                            className={`mt-10 w-full rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
                                plan.highlighted
                                    ? "bg-gradient-to-r from-[#5044e5] to-[#4d8cea] text-white shadow-lg hover:scale-105 hover:shadow-xl"
                                    : "border border-gray-300 bg-white/70 hover:bg-gray-100 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/70 dark:hover:bg-gray-800"
                            }`}
                        >
                            {plan.name === "Enterprises" ? "Contact Sales" : "Get Started"}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const Pricing = () => {
    const dummyPlans = [
        {
            name: "Starter (Dummy)",
            price: "₹999",
            description: "Perfect for small teams getting started with CRM",
            features: ["Lead & Contact Management", "Basic Sales Pipeline", "Email Integration", "Standard Reports", "Email Support"],
            highlighted: false,
            period: "/1 month",
            user: "3",
        },
        {
            name: "Growth (Dummy)",
            price: "₹2,499",
            description: "Best for growing businesses that need automation",
            features: [
                "Everything in Starter",
                "Sales Automation",
                "Advanced Analytics",
                "Omnichannel Support",
                "Custom Workflows",
                "Priority Support",
            ],
            highlighted: true,
            period: "/6 months",
            user: "7",
        },
        {
            name: "Enterprise (Dummy)",
            price: "Custom",
            description: "For large teams with advanced security & scale needs",
            features: [
                "Everything in Growth",
                "Dedicated Account Manager",
                "Enterprise Security",
                "Role-Based Access Control",
                "Custom Integrations",
                "SLA & 24/7 Support",
            ],
            highlighted: false,
            period: "/1 year",
            user: "12",
        },
    ];

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${IMAGE_BASE_URL}/api/package/public`);
                let fetchedPlans = response.data;
                console.log(fetchedPlans);

                // If API returns empty or invalid data, fall back to dummy
                if (!Array.isArray(fetchedPlans) || fetchedPlans.length === 0) {
                    console.warn("No plans from API, using dummy data");
                    setPlans(dummyPlans);
                    return;
                }

                // Helper function to extract numeric price for comparison
                const getPriceValue = (priceStr) => {
                    if (priceStr === "Custom" || !priceStr) return 0;
                    return parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
                };

                // Find the maximum price to highlight
                const maxPrice = Math.max(...fetchedPlans.map((p) => getPriceValue(p.price)));

                // Map and normalize the plans
                fetchedPlans = fetchedPlans.map((plan) => ({
                    ...plan,
                    highlighted: getPriceValue(plan.price) === maxPrice && maxPrice > 0,
                    price: plan.price || "₹0",
                    period: plan.period || "/1 month",
                    user: plan.user || "1",
                    features: plan.features || [],
                }));

                setPlans(fetchedPlans);
            } catch (err) {
                console.error("Failed to load pricing plans:", err);
                // On error, use dummy data with proper highlighting
                setPlans(dummyPlans);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return <div className="py-32 text-center text-xl">Loading pricing plans...</div>;
    }

    return (
        <div className="relative overflow-hidden px-4 md:px-20 lg:px-28">
            {/* BACKGROUND GLOW */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#5044e5]/20 blur-[140px]" />
            </div>

            {/* HERO */}
            <div className="flex flex-col items-center gap-6 py-20 text-center">
                <h1 className="max-w-4xl text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
                    Simple, transparent <span className="bg-gradient-to-r from-[#5044e5] to-[#4d8cea] bg-clip-text text-transparent">pricing</span>
                </h1>

                <p className="max-w-2xl text-sm text-gray-600 dark:text-white/75 sm:text-lg">
                    Choose a plan that fits your business today and scales with you tomorrow.
                </p>
            </div>

            {/* CARDS */}
            <div className="grid items-stretch gap-10 pb-28 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, index) => (
                    <PricingCard
                        key={index}
                        plan={plan}
                    />
                ))}
            </div>

            {/* CTA */}
            <div className="mb-24 flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-[#5044e5] to-[#4d8cea] p-14 text-center text-white shadow-[0_40px_100px_-25px_rgba(80,68,229,0.6)] md:p-20">
                <h2 className="text-2xl font-medium md:text-3xl">Ready to grow your customer relationships?</h2>

                <p className="max-w-xl text-sm text-white/90 md:text-base">Start your free trial today. No credit card required.</p>

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
            </div>
        </div>
    );
};

export default Pricing;
