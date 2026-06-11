import React from "react";
import { Link, useParams } from "react-router-dom";
import assets, { company_logos } from "../../../assets/assets";
import ServiceCard from "./ServiceCard";
import { usePublicCompany } from "../../../context/PublicCompanyContext";
import { IMAGE_BASE_URL } from "../../../utils/api";

const Home = () => {
    const { companySlug } = useParams();
    const { landingPageSetup } = usePublicCompany();

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
            <div className="px-4 md:px-20 lg:px-28">
                {/* Hero Section Container - Column on <lg, Row on lg+ */}
                <div className="flex flex-col items-center py-16 md:py-24 lg:flex-row lg:items-center lg:gap-12">
                    {/* Text Content - Left on lg, centered below image on smaller */}
                    <div className="flex flex-col items-center text-center text-black dark:text-white lg:flex-1 lg:items-start lg:text-left">
                        <h1
                            className="max-w-5xl text-4xl font-bold md:text-6xl"
                            dangerouslySetInnerHTML={{
                                __html: landingPageSetup?.hero_headline || "",
                            }}
                        />

                        <p className="max-w-4/5 mt-6 text-sm font-medium text-gray-700 dark:text-white/75 sm:max-w-lg sm:text-lg">
                            {landingPageSetup?.hero_subtext || ""}
                        </p>

                        <Link
                            to={`/landing/${companySlug}/contact-us`}
                            state={{ scrollTo: "contact-us" }}
                        >
                            <button className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#000000] to-[#40403f] px-10 py-3 text-sm text-white transition-all hover:scale-105 dark:from-[#40403f] dark:to-[#000000]">
                                Contact Us
                                <img
                                    src={assets.arrow_icon}
                                    alt=""
                                    className="w-4"
                                />
                            </button>
                        </Link>
                    </div>

                    {/* Hero Image - Right on lg, full-width above text on smaller */}
                    <div className="mt-10 w-full max-w-6xl lg:mt-0 lg:w-1/2 lg:flex-1">
                        <img
                            src={landingPageSetup?.hero_image ? `${IMAGE_BASE_URL}${landingPageSetup.hero_image}` : assets.hero_landing_img}
                            alt="Hero background"
                            className="w-full rounded-[50px] object-cover"
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-20 lg:px-28">
                <div className="-z-1 flex flex-col items-center gap-5 px-4 text-gray-900 dark:text-white/80 md:px-20 lg:mt-16 lg:px-28">
                    <h3>{landingPageSetup?.trusted_title || ""}</h3>
                    <div className="m-4 flex flex-wrap items-center justify-center gap-10">
                        {(landingPageSetup?.trusted_logos && landingPageSetup.trusted_logos.length > 0
                            ? landingPageSetup.trusted_logos.map((logo) => `${IMAGE_BASE_URL}${logo}`)
                            : company_logos
                        ).map((src, index) => (
                            <img
                                key={index}
                                src={src}
                                alt="Trusted company logo"
                                className="max-h-7 dark:drop-shadow-xl sm:max-h-7"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-20 lg:px-28">
                {/* Hero Section Container - Column on <lg, Row on lg+ */}
                <div className="flex flex-col items-center py-16 md:py-20 lg:flex-row-reverse lg:items-center lg:gap-12">
                    {/* Text Content - Left on lg, centered below image on smaller */}
                    <div className="flex flex-col items-center text-center text-black dark:text-white lg:flex-1 lg:items-start lg:text-left">
                        <h1 className="max-w-5xl text-4xl font-bold md:text-5xl">{landingPageSetup?.expertise_title || ""}</h1>

                        <p className="max-w-4/5 mt-6 text-sm font-medium text-gray-700 dark:text-white/75 sm:max-w-lg sm:text-lg">
                            {landingPageSetup?.expertise_description || ""}
                        </p>

                        <Link
                            to={`/landing/${companySlug}/enquiry-now`}
                            state={{ scrollTo: "enquiry-now" }}
                        >
                            <button className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#000000] to-[#40403f] px-10 py-3 text-sm text-white transition-all hover:scale-105 dark:from-[#40403f] dark:to-[#000000]">
                                Enquiry Now
                                <img
                                    src={assets.arrow_icon}
                                    alt=""
                                    className="w-4"
                                />
                            </button>
                        </Link>
                    </div>

                    {/* Hero Image - Right on lg, full-width above text on smaller */}
                    <div className="mt-10 w-full max-w-6xl lg:mt-0 lg:w-1/2 lg:flex-1">
                        <img
                            src={landingPageSetup?.expertise_image ? `${IMAGE_BASE_URL}${landingPageSetup.expertise_image}` : assets.hero_img}
                            alt="Hero background"
                            className="w-full rounded-[50px] object-cover"
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-20 lg:px-28 md:-mt-10 -mt-5">
                <div className="-z-1 flex w-full flex-col items-center gap-6 overflow-hidden py-10 text-center text-black dark:text-white md:py-20">
                    <h1 className="text-3xl sm:text-5xl font-medium">{landingPageSetup?.services_title || ""}</h1>

                    <p className="mb-6 max-w-lg text-center text-sm text-gray-700 dark:text-white/75 sm:text-base">
                        {landingPageSetup?.services_desc || ""}
                    </p>
                </div>

                <div className="-mt-16 flex flex-col justify-self-center md:grid md:grid-cols-1 lg:grid-cols-2 text-black">
                    {(landingPageSetup?.services && landingPageSetup.services.length > 0
                        ? landingPageSetup.services.map((service) => ({
                              // Transform DB service to match ServiceCard props
                              name: service.title,
                              description: service.description,
                              icon: `${IMAGE_BASE_URL}${service.icon}`, // prepend base URL
                          }))
                        : serviceData
                    ) // fallback to your static data
                        .map((service, index) => (
                            <ServiceCard
                                key={index}
                                service={service}
                            />
                        ))}
                </div>
            </div>
        </>
    );
};

export default Home;
