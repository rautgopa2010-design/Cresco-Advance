import React, { useState } from "react";
import assets from "../../../assets/assets";
// import ThemeToggleButton from "../themeToggleButton/ThemeToggleButton";
import { Link, useParams } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../../utils/api";
import { usePublicCompany } from "../../../context/PublicCompanyContext";

const Navbar = ({ theme, setTheme }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { companyData, loading } = usePublicCompany();
    const { companySlug } = useParams();

    const logoUrl = companyData?.companyLogo ? `${IMAGE_BASE_URL}${companyData.companyLogo}` : theme === "dark" ? assets.logo_dark : assets.logo;

    return (
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/20 bg-white/60 px-4 py-4 font-medium backdrop-blur-lg backdrop-saturate-150 dark:border-gray-700/20 dark:bg-gray-900/60 md:px-10 lg:px-20">
            {/* LOGO */}
            <Link
                to={`/landing/${companySlug}`}
                state={{ scrollTo: "home" }}
            >
                <img
                    src={loading ? assets.logo : logoUrl}
                    alt=""
                    className="w-28 md:w-32 lg:w-40"
                />
            </Link>
            {/* NAV LINKS (DESKTOP + TABLET SIDEBAR) */}
            <div
                className={`bottom-0 right-0 top-0 flex gap-10 bg-gradient-to-r text-gray-700 transition-all dark:text-white max-lg:fixed max-lg:h-full max-lg:min-h-screen max-lg:from-[#40403f] max-lg:to-[#000000] md:right-0 ${!sidebarOpen ? "max-lg:w-0 max-lg:overflow-hidden" : "max-lg:w-60 max-lg:flex-col max-lg:pl-10"} text-sm max-lg:pt-20 max-lg:text-white lg:flex lg:items-center`}
            >
                <img
                    src={assets.close_icon}
                    alt=""
                    className="absolute right-11 top-7 w-5 cursor-pointer md:right-10 md:top-9 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
                {/* MENU ITEMS */}
                <Link
                    to={`/landing/${companySlug}`}
                    state={{ scrollTo: "home" }} // Added state for scroll intent
                >
                    <div
                        className="border-[#000000] hover:border-b dark:border-white text-lg text-blac"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Home
                    </div>
                </Link>
                <Link
                    to={`/landing/${companySlug}/about-us`}
                    state={{ scrollTo: "about-us" }} // Added state
                >
                    <div
                        className="border-[#000000] hover:border-b dark:border-white text-lg text-blac"
                        onClick={() => setSidebarOpen(false)}
                    >
                        About Us
                    </div>
                </Link>
                <Link
                    to={`/landing/${companySlug}/our-services`}
                    state={{ scrollTo: "our-services" }} // Added state
                >
                    <div
                        className="border-[#000000] hover:border-b dark:border-white text-lg text-blac"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Our Services
                    </div>
                </Link>
                <Link
                    to={`/landing/${companySlug}/testimonials`}
                    state={{ scrollTo: "testimonials" }} // Added state
                >
                    <div
                        className="border-[#000000] dark:border-white sm:hover:border-b text-lg text-blac"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Testimonials
                    </div>
                </Link>
                {/* MOBILE — CONTACT + SIGNIN + SIGNUP */}
                <div className="mt-2 flex flex-col gap-3 pr-10 md:hidden lg:hidden">
                    <Link
                        to={`/landing/${companySlug}/contact-us`}
                        state={{ scrollTo: "contact-us" }} // Added state
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="mb-10 flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-center font-medium text-white backdrop-blur-md">
                            Contact Us{" "}
                            <img
                                src={assets.arrow_icon}
                                width={14}
                                alt=""
                            />
                        </div>
                    </Link>
                    <Link
                        to={`/landing/${companySlug}/enquiry-now`}
                        state={{ scrollTo: "enquiry-now" }} // Added state
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className="mb-10 flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-center font-medium text-white backdrop-blur-md">
                            Enquiry Now{" "}
                            <img
                                src={assets.arrow_icon}
                                width={14}
                                alt=""
                            />
                        </div>
                    </Link>
                </div>
            </div>
            {/* RIGHT SIDE BUTTONS */}
            <div className="flex items-center gap-2 md:gap-4 lg:gap-4">
                {/* THEME TOGGLE (unchanged) */}
                {/* <div className="mt-1 md:mt-1 md:hidden lg:block">
                    <ThemeToggleButton
                        theme={theme}
                        setTheme={setTheme}
                    />
                </div> */}

                {/* MENU ICON - MOBILE + TABLET (unchanged) */}
                <img
                    src={theme === "dark" ? assets.menu_icon_dark : assets.menu_icon}
                    alt=""
                    onClick={() => setSidebarOpen(true)}
                    className="right-20 w-8 cursor-pointer md:right-4 md:hidden lg:hidden"
                />

                {/* CONTACT BUTTON (DESKTOP ONLY + TABLET ONLY) */}
                <Link
                    to={`/landing/${companySlug}/contact-us`}
                    state={{ scrollTo: "contact-us" }}
                >
                    <div className="hidden cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#000000] to-[#40403f] px-6 py-2 text-sm text-white transition-all hover:scale-105 dark:from-[#40403f] dark:to-[#000000] md:flex lg:flex">
                        Contact Us{" "}
                        <img
                            src={assets.arrow_icon}
                            width={14}
                            alt=""
                        />
                    </div>
                </Link>
                <Link
                    to={`/landing/${companySlug}/enquiry-now`}
                    state={{ scrollTo: "enquiry-now" }}
                >
                    <div className="hidden cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#40403f] to-[#000000] px-6 py-2 text-sm text-white transition-all hover:scale-105 dark:from-[#000000] dark:to-[#40403f] md:flex lg:flex">
                        Enquiry Now{" "}
                        <img
                            src={assets.arrow_icon}
                            width={14}
                            alt=""
                        />
                    </div>
                </Link>

                {/* THEME TOGGLE */}
                {/* <div className="hidden md:mt-1 md:block lg:hidden">
                    <ThemeToggleButton
                        theme={theme}
                        setTheme={setTheme}
                    />
                </div> */}

                {/* MENU ICON - MOBILE + TABLET */}
                <img
                    src={theme === "dark" ? assets.menu_icon_dark : assets.menu_icon}
                    alt=""
                    onClick={() => setSidebarOpen(true)}
                    className="right-20 hidden w-8 cursor-pointer md:right-4 md:block lg:hidden"
                />
            </div>
        </div>
    );
};

export default Navbar;
