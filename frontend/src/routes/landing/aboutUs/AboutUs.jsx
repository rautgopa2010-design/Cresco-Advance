import React from "react";
import { Link, useParams } from "react-router-dom";
import assets from "../../../assets/assets";
import { usePublicCompany } from "../../../context/PublicCompanyContext";
import { IMAGE_BASE_URL } from "../../../utils/api";

const AboutUs = () => {
    const { companySlug } = useParams();
    const { landingPageSetup } = usePublicCompany();

    return (
        <>
            {/* PAGE WRAPPER */}
            <div className="relative mb-0 overflow-hidden px-4 pt-20 text-gray-700 dark:text-white md:mb-5 md:px-20 md:pt-0 lg:px-28">
                {/* ================= FOREGROUND IMAGES (LG ONLY) ================= */}
                <div className="pointer-events-none absolute right-[70px] top-[160px] z-10 hidden lg:block">
                    <img
                        src={landingPageSetup?.about_image1 ? `${IMAGE_BASE_URL}${landingPageSetup.about_image1}` : assets.work_dashboard_management}
                        alt="about_image1"
                        className="w-[420px] rounded-2xl shadow-2xl"
                    />
                </div>

                {/* ================= CONTENT ================= */}

                {/* HERO */}
                <section className="z-1 relative max-w-4xl md:pt-20">
                    <h1
                        className="text-3xl font-bold leading-tight text-black md:text-5xl"
                        dangerouslySetInnerHTML={{
                            __html: landingPageSetup?.about_hero_title || "",
                        }}
                    />

                    <p className="mt-6 text-base text-gray-700 dark:text-white/75 md:text-lg">{landingPageSetup?.about_hero_desc || ""}</p>
                </section>

                {/* IMAGE 1 - VISIBLE ON MD AND MOBILE ONLY (above Problem Statement) */}
                <div className="mt-12 block lg:hidden">
                    <img
                        src={landingPageSetup?.about_image1 ? `${IMAGE_BASE_URL}${landingPageSetup.about_image1}` : assets.work_dashboard_management}
                        alt="about_image1"
                        className="w-full rounded-2xl shadow-2xl"
                    />
                </div>

                {/* PROBLEM STATEMENT */}
                <section className="z-1 relative pt-10 md:pt-14">
                    <div className="max-w-5xl space-y-10">
                        <h2 className="text-2xl font-bold text-black md:text-3xl">{landingPageSetup?.problems_title || ""}</h2>

                        {landingPageSetup?.problems_list && landingPageSetup?.problems_list.length > 0 && (
                            <ul className="space-y-4 text-lg text-gray-700 dark:text-white/70">
                                {landingPageSetup?.problems_list?.map((problem, index) => (
                                    <li key={index}>• {problem}</li>
                                ))}
                            </ul>
                        )}

                        <p className="text-lg text-gray-700">
                            We didn’t try to fix these problems with more features. We fixed them by rethinking the foundation.
                        </p>
                    </div>
                </section>

                {/* IMAGE 2 - VISIBLE ON MD AND MOBILE ONLY (above Our approach) */}
                <div className="mt-12 block lg:hidden">
                    <img
                        src={landingPageSetup?.about_image2 ? `${IMAGE_BASE_URL}${landingPageSetup.about_image2}` : assets.work_mobile_app}
                        alt="about_image2"
                        className="w-full rounded-2xl shadow-2xl"
                    />
                </div>

                {/* OUR APPROACH */}
                <section className="z-1 relative pt-10 md:pt-16">
                    {/* ================= FOREGROUND IMAGES (LG ONLY) ================= */}
                    <div className="pointer-events-none absolute -right-[40px] top-[160px] z-10 hidden lg:block">
                        <img
                            src={landingPageSetup?.about_image2 ? `${IMAGE_BASE_URL}${landingPageSetup.about_image2}` : assets.work_mobile_app}
                            alt="about_image2"
                            className="w-[420px] rounded-2xl shadow-2xl"
                        />
                    </div>
                    <h2 className="mb-10 text-2xl font-bold text-black md:text-3xl">Our approach</h2>

                    {landingPageSetup?.approach_steps && landingPageSetup?.approach_steps.length > 0 && (
                        <div className="space-y-14">
                            {landingPageSetup?.approach_steps.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-8"
                                >
                                    <div className="text-4xl font-semibold text-[#5044e5]/60">{item.step}</div>

                                    <div className="max-w-3xl">
                                        <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                                        <p className="text-gray-700 dark:text-white/70">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* IMAGE 3 - VISIBLE ON MD AND MOBILE ONLY (above What clients notice) */}
                <div className="mt-12 block lg:hidden">
                    <img
                        src={landingPageSetup?.about_image3 ? `${IMAGE_BASE_URL}${landingPageSetup.about_image3}` : assets.work_fitness_app}
                        alt="about_image3"
                        className="w-full rounded-2xl shadow-2xl"
                    />
                </div>

                {/* WHAT CLIENTS NOTICE */}
                <section className="z-1 relative pt-10 md:pt-16">
                    {/* ================= FOREGROUND IMAGES (LG ONLY) ================= */}
                    <div className="pointer-events-none absolute -right-[40px] top-[160px] z-10 hidden lg:block">
                        <img
                            src={landingPageSetup?.about_image3 ? `${IMAGE_BASE_URL}${landingPageSetup.about_image3}` : assets.work_fitness_app}
                            alt="about_image3"
                            className="w-[420px] rounded-2xl shadow-2xl"
                        />
                    </div>
                    <div className="max-w-5xl">
                        <h2 className="mb-5 text-2xl font-bold text-black md:text-3xl">{landingPageSetup?.customer_notice_title || ""}</h2>

                        {landingPageSetup?.customer_notice_list && landingPageSetup?.customer_notice_list.length > 0 && (
                            <div className="grid gap-3 text-lg text-gray-700 dark:text-white/75">
                                {landingPageSetup?.customer_notice_list.map((notice, index) => (
                                    <p key={index}>→ {notice}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* QUIET PROOF */}
                <section className="z-1 relative pt-10 md:pt-16">
                    <div className="max-w-4xl space-y-4">
                        <h2 className="text-2xl font-bold text-black md:text-3xl">{landingPageSetup?.trust_title || ""}</h2>

                        <p className="text-lg text-gray-700 dark:text-white/75">{landingPageSetup?.trust_text || ""}</p>

                        {landingPageSetup?.trust_points && landingPageSetup?.trust_points.length > 0 && (
                            <div className="flex gap-10 pt-4 text-xs uppercase tracking-wider text-gray-700 dark:text-white/50 md:pt-8 md:text-sm">
                                {landingPageSetup?.trust_points.map((point, index) => (
                                    <span key={index}>{point}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="z-1 relative mb-28 pt-6 md:mb-0 md:pt-10">
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-medium text-black md:text-3xl">{landingPageSetup?.about_cta_text || ""}</h2>

                        <p className="mt-4 text-gray-700 dark:text-white/75">{landingPageSetup?.about_cta_subtext || ""}</p>

                        <Link
                            to={`/landing/${companySlug}/contact-us`}
                            state={{ scrollTo: "contact-us" }}
                        >
                            <div className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#000000] to-[#40403f] px-10 py-3 text-sm text-white transition-all hover:scale-105 dark:from-[#40403f] dark:to-[#000000]">
                                Contact Us{" "}
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

export default AboutUs;