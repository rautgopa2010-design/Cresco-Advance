import React from "react";
import { teamData } from "../../../assets/assets";
import ScrollAdjust from "./ScrollAdjust";

const Team = () => {
    return (
        <>
            <ScrollAdjust />
            <div className="px-4 md:px-20 lg:px-28 pt-0 lg:pt-10 md:pt-10 mb-10 md:mb-5">
                <div className="flex flex-col items-center gap-7 text-gray-700 dark:text-white">
                    <div className="text-3xl md:text-5xl">Meet the team</div>
                    <div className="text-center text-sm md:text-lg">
                        Innovators, problem-solvers, and creators committed to delivering seamless customer experiences for your business.
                    </div>
                    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                        {teamData.map((team, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-5 rounded-xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-100 transition-all duration-300 hover:scale-105 dark:border-gray-700 dark:bg-gray-900 dark:shadow-white/5 max-sm:flex-col"
                                >
                                    <img
                                        src={team.image}
                                        alt=""
                                        className="h-12 w-12 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold">{team.name}</h3>
                                        <p className="text-xs opacity-60">{team.title}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Team;
