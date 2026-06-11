import React from "react";
import assets from "../../assets/assets";

const OurServices = () => {
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
        <div className="px-4 md:px-20 lg:px-28 lg:pt-20 md:pt-20 pt-16">
            <div className="flex flex-col items-center space-y-6">
                <div className="text-3xl sm:text-5xl">Our Latest Work</div>
                <p className="max-w-lg text-center text-sm text-gray-500 dark:text-white/75 sm:text-base">
                    Explore how our CRM solutions help businesses streamline workflows, strengthen customer relationships, and achieve measurable
                    growth.
                </p>
                <div className="grid w-full max-w-5xl gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-3">
                    {workData.map((work, index) => {
                        return (
                            <div
                                key={index}
                                className="cursor-pointer transition-all duration-500 hover:scale-105"
                            >
                                <img
                                    src={work.image}
                                    alt=""
                                    className="w-full rounded-xl"
                                />
                                <h3 className="mb-2 mt-3 text-lg font-semibold">{work.title}</h3>
                                <p className="w-5/6 text-sm opacity-60">{work.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OurServices;
