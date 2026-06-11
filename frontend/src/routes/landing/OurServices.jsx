import React from "react";
import assets from "../../assets/assets";
import { usePublicCompany } from "../../context/PublicCompanyContext";
import { IMAGE_BASE_URL } from "../../utils/api";

const OurServices = () => {
    const { landingPageSetup } = usePublicCompany();

    const workData = [
        {
            title: "Lead Management System",
            description: "Capture, track, and nurture leads from first contact to conversion.",
            image: assets.work_mobile_app,
        },
        {
            title: "Business Intelligence Dashboard",
            description: "Visualize performance metrics and optimize every customer interaction.",
            image: assets.work_dashboard_management,
        },
        {
            title: "Omnichannel Engagement",
            description: "Connect with customers across email, calls, and messaging from one platform.",
            image: assets.work_fitness_app,
        },
    ];

    return (
        <div className="px-4 pt-16 md:px-20 md:pt-32 lg:px-28 lg:pt-36">
            <div className="flex flex-col items-center space-y-6">
                <div className="text-3xl sm:text-5xl font-semibold text-black">{landingPageSetup?.works_title || ""}</div>
                <p className="max-w-lg text-center text-sm text-gray-700 dark:text-white/75 sm:text-base">{landingPageSetup?.works_desc || ""}</p>

                <div className="grid w-full max-w-5xl gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-3 text-black">
                    {(landingPageSetup?.works && landingPageSetup.works.length > 0
                        ? landingPageSetup.works.map((work) => ({
                              title: work.title,
                              description: work.description,
                              image: `${IMAGE_BASE_URL}${work.image}`,
                          }))
                        : workData
                    ).map((work, index) => (
                        <div
                            key={index}
                            className="cursor-pointer transition-all duration-500 hover:scale-105"
                        >
                            <img
                                src={work.image}
                                alt={work.title}
                                className="w-full rounded-xl"
                            />
                            <h3 className="mb-2 mt-3 text-lg font-semibold px-2">{work.title}</h3>
                            <p className="w-5/6 text-sm opacity-60 px-2">{work.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OurServices;
