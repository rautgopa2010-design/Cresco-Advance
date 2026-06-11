import React from "react";
import { Link } from "react-router-dom";
import ScrollAdjust from "./ScrollAdjust";
import assets from "../../../assets/assets";

const approachSteps = [
    {
        step: "01",
        title: "Understand your workflow",
        desc: "We study how your teams actually work — sales, support, and operations — before forcing any structure.",
    },
    {
        step: "02",
        title: "Remove friction",
        desc: "Every unnecessary click, field, and step is eliminated so your team focuses on customers, not software.",
    },
    {
        step: "03",
        title: "Automate with intent",
        desc: "Automation is applied only where it adds speed and clarity — never confusion.",
    },
    {
        step: "04",
        title: "Scale without rewrites",
        desc: "As your business grows, the CRM grows with you — no migrations, no rebuilds.",
    },
];

const WhyUs = () => {
    return (
        <>
            <ScrollAdjust />

            {/* PAGE WRAPPER */}
            <div className="relative overflow-hidden px-4 text-gray-700 dark:text-white md:px-20 lg:px-28 md:mb-5 mb-0">
                {/* ================= BACKGROUND VISUALS (LG ONLY) ================= */}
                <div className="pointer-events-none absolute right-[-420px] top-[80px] z-0">
                    <img
                        src={assets.bgImage1}
                        alt=""
                        className="w-[900px] opacity-100 dark:hidden"
                    />
                </div>

                <div className="pointer-events-none absolute right-[-520px] top-[520px] z-0">
                    <img
                        src={assets.bgImage2}
                        alt=""
                        className="w-[1200px] opacity-90 dark:hidden"
                    />
                </div>

                {/* ================= FOREGROUND IMAGES (LG ONLY) ================= */}
                <div className="z-1 pointer-events-none absolute right-[40px] top-[160px] z-10 hidden lg:block">
                    <img
                        src={assets.work_dashboard_management}
                        alt="CRM Dashboard"
                        className="w-[420px] rounded-2xl shadow-2xl"
                    />
                </div>

                <div className="z-1 pointer-events-none absolute right-[260px] top-[360px] z-0 hidden lg:block">
                    <img
                        src={assets.work_mobile_app}
                        alt="CRM Feature"
                        className="w-[260px] rounded-xl shadow-xl"
                    />
                </div>

                {/* ================= CONTENT ================= */}

                {/* HERO */}
                <section className="z-1 relative max-w-4xl md:pt-20">
                    <h1 className="text-3xl font-medium leading-tight md:text-6xl">
                        CRM should feel like an <span className="underline decoration-[#5044e5]/40 underline-offset-8">advantage</span>, not a burden.
                    </h1>

                    <p className="mt-6 text-base text-gray-600 dark:text-white/75 md:text-lg">
                        Most CRMs promise productivity — but deliver complexity. We built ours differently, with clarity and long-term trust at the
                        core.
                    </p>
                </section>

                {/* PROBLEM STATEMENT */}
                <section className="z-1 relative border-t border-gray-200 pt-10 dark:border-gray-800 md:pt-16">
                    <div className="max-w-5xl space-y-10">
                        <h2 className="text-2xl font-medium md:text-3xl">Where traditional CRMs go wrong</h2>

                        <ul className="space-y-6 text-lg text-gray-600 dark:text-white/70">
                            <li>• Built for reports, not real conversations</li>
                            <li>• Too many fields, too little clarity</li>
                            <li>• Automation without context</li>
                            <li>• Hard to scale, harder to trust</li>
                        </ul>

                        <p className="pt-6 text-lg">
                            We didn’t try to fix these problems with more features. We fixed them by rethinking the foundation.
                        </p>
                    </div>
                </section>

                {/* OUR APPROACH */}
                <section className="z-1 relative pt-10 md:pt-16">
                    {/* ================= BACKGROUND VISUALS (LG ONLY) ================= */}
                    <div className="pointer-events-none absolute right-[-420px] top-[80px] z-0">
                        <img
                            src={assets.bgImage1}
                            alt=""
                            className="w-[900px] opacity-100 dark:hidden"
                        />
                    </div>

                    <div className="pointer-events-none absolute right-[-520px] top-[520px] z-0">
                        <img
                            src={assets.bgImage2}
                            alt=""
                            className="w-[1200px] opacity-90 dark:hidden"
                        />
                    </div>

                    {/* ================= FOREGROUND IMAGES (LG ONLY) ================= */}
                    <div className="z-1 pointer-events-none absolute right-[40px] top-[160px] hidden lg:block">
                        <img
                            src={assets.work_dashboard_management}
                            alt="CRM Dashboard"
                            className="w-[420px] rounded-2xl shadow-2xl"
                        />
                    </div>

                    <div className="z-1 pointer-events-none absolute right-[260px] top-[360px] hidden lg:block">
                        <img
                            src={assets.work_mobile_app}
                            alt="CRM Feature"
                            className="w-[260px] rounded-xl shadow-xl"
                        />
                    </div>
                    <h2 className="mb-16 text-2xl font-medium md:text-3xl">Our approach</h2>

                    <div className="space-y-14">
                        {approachSteps.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-8"
                            >
                                <div className="text-4xl font-semibold text-[#5044e5]/60">{item.step}</div>

                                <div className="max-w-3xl">
                                    <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-white/70">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* WHAT CLIENTS NOTICE */}
                <section className="z-1 relative border-t border-gray-200 pt-10 dark:border-gray-800 md:pt-16">
                    {/* ================= BACKGROUND VISUALS (LG ONLY) ================= */}
                    <div className="pointer-events-none absolute right-[-420px] top-[80px] z-0">
                        <img
                            src={assets.bgImage1}
                            alt=""
                            className="w-[900px] opacity-100 dark:hidden"
                        />
                    </div>

                    <div className="pointer-events-none absolute right-[-520px] top-[520px] z-0">
                        <img
                            src={assets.bgImage2}
                            alt=""
                            className="w-[1200px] opacity-90 dark:hidden"
                        />
                    </div>

                    {/* ================= FOREGROUND IMAGES (LG ONLY) ================= */}
                    <div className="pointer-events-none absolute right-[40px] top-[160px] z-10 hidden lg:block">
                        <img
                            src={assets.work_fitness_app}
                            alt="CRM Dashboard"
                            className="w-[420px] rounded-2xl shadow-2xl"
                        />
                    </div>
                    <div className="max-w-5xl">
                        <h2 className="mb-10 text-2xl font-medium md:text-3xl">What our customers notice first</h2>

                        <div className="grid gap-6 text-lg text-gray-600 dark:text-white/75">
                            <p>→ Teams adopt it faster, with less training</p>
                            <p>→ Sales follow-ups actually happen on time</p>
                            <p>→ Customer history is always complete</p>
                            <p>→ Management sees clarity, not chaos</p>
                        </div>
                    </div>
                </section>

                {/* QUIET PROOF */}
                <section className="z-1 relative pt-10 md:pt-16">
                    <div className="max-w-4xl space-y-8">
                        <h2 className="text-2xl font-medium md:text-3xl">Built for long-term trust</h2>

                        <p className="text-lg text-gray-600 dark:text-white/75">
                            We don’t optimize for short-term growth metrics. We optimize for reliability, security, and partnerships that last for
                            years.
                        </p>

                        <div className="flex gap-10 md:pt-8 pt-4 md:text-sm text-xs uppercase tracking-wider text-gray-500 dark:text-white/50">
                            <span>99.9% uptime</span>
                            <span>Role-based security</span>
                            <span>Scalable architecture</span>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="z-1 relative border-t border-gray-200 dark:border-gray-800 md:pt-16 pt-10 md:mb-0 mb-28">
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-medium md:text-3xl">If you’re serious about customer relationships, we should talk.</h2>

                        <p className="mt-4 text-gray-600 dark:text-white/75">Start with a free trial. No pressure. No hard sell.</p>

                        <Link to="/signup">
                            <div className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-primary px-10 py-3 text-sm text-white transition-all hover:scale-105 dark:from-primary dark:to-purple-600">
                                Start Free Trial{" "}
                                <img
                                    src={assets.arrow_icon}
                                    width={14}
                                    alt=""
                                />
                            </div>
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
};

export default WhyUs;
