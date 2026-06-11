import React, { useState } from "react";
import assets from "../../../assets/assets";
// import ThemeToggleButton from "../themeToggleButton/ThemeToggleButton";
import { Link } from "react-router-dom";

const Navbar = ({ theme, setTheme }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    return (
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/20 bg-white/60 px-4 py-4 font-medium backdrop-blur-lg backdrop-saturate-150 dark:border-gray-700/20 dark:bg-gray-900/60 md:px-10 lg:px-20">
            {/* LOGO */}
            <Link
                to="/marketing-website"
                state={{ scrollTo: "home" }}
            >
                <img
                    src={theme === "dark" ? assets.logo_dark : assets.logo}
                    alt=""
                    className="w-24 md:w-28 lg:w-32"
                />
            </Link>
            {/* NAV LINKS (DESKTOP + TABLET SIDEBAR) */}
            <div
                className={`bottom-0 right-0 top-0 flex gap-5 text-gray-700 transition-all dark:text-white max-lg:fixed max-lg:h-full max-lg:min-h-screen max-lg:bg-primary md:right-0 ${!sidebarOpen ? "max-lg:w-0 max-lg:overflow-hidden" : "max-lg:w-60 max-lg:flex-col max-lg:pl-10"} text-sm max-lg:pt-20 max-lg:text-white lg:flex lg:items-center`}
            >
                <img
                    src={assets.close_icon}
                    alt=""
                    className="absolute right-11 top-7 w-5 cursor-pointer md:right-10 md:top-9 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
                {/* MENU ITEMS */}
                <Link
                    to="/marketing-website"
                    state={{ scrollTo: "home" }} // Added state for scroll intent
                >
                    <div
                        className="border-primary hover:border-b dark:border-white text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Home
                    </div>
                </Link>
                <Link
                    to="/marketing-website/our-services"
                    state={{ scrollTo: "our-services" }} // Added state
                >
                    <div
                        className="border-primary hover:border-b dark:border-white text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Our Services
                    </div>
                </Link>
                <Link
                    to="/marketing-website/features"
                    state={{ scrollTo: "features" }} // Added state
                >
                    <div
                        className="border-primary hover:border-b dark:border-white text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Features
                    </div>
                </Link>
                <Link
                    to="/marketing-website/pricing"
                    state={{ scrollTo: "pricing" }} // Added state
                >
                    <div
                        className="border-primary hover:border-b dark:border-white text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Pricing
                    </div>
                </Link>
                {/* ABOUT US DROPDOWN (unchanged for brevity; add state to its Links if needed) */}
                <div
                    className="relative"
                    onMouseEnter={() => {
                        if (!sidebarOpen) {
                            clearTimeout(window.aboutLeaveTimer);
                            window.aboutEnterTimer = setTimeout(() => setAboutOpen(true), 50);
                        }
                    }}
                    onMouseLeave={() => {
                        if (!sidebarOpen) {
                            clearTimeout(window.aboutEnterTimer);
                            window.aboutLeaveTimer = setTimeout(() => setAboutOpen(false), 200);
                        }
                    }}
                >
                    <div
                        className="flex cursor-pointer items-center gap-1 border-primary dark:border-white lg:hover:border-b text-base"
                        onClick={() => sidebarOpen && setAboutOpen(!aboutOpen)}
                    >
                        About Us
                        <span className="ml-2 text-sm lg:hidden">{aboutOpen ? "▼" : "▲"}</span>
                    </div>
                    {/* DESKTOP DROPDOWN */}
                    <div
                        className={`absolute left-0 mt-2 hidden h-[140px] w-56 rounded-xl border border-gray-200/40 bg-white/90 shadow-xl transition-all duration-300 dark:border-gray-700/40 dark:bg-gray-900/90 lg:block ${
                            aboutOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
                        }`}
                    >
                        <Link
                            to="/marketing-website/about-us/history"
                            onClick={() => setAboutOpen(false)}
                            className="block px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            History
                        </Link>
                        <Link
                            to="/marketing-website/about-us/why-us"
                            onClick={() => setAboutOpen(false)}
                            className="block px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Why Us?
                        </Link>
                        <Link
                            to="/marketing-website/about-us/team"
                            onClick={() => setAboutOpen(false)}
                            className="block px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Team
                        </Link>
                    </div>
                    {/* MOBILE DROPDOWN */}
                    {sidebarOpen && (
                        <div className={`overflow-hidden transition-all duration-300 lg:hidden ${aboutOpen ? "max-h-40" : "max-h-0"}`}>
                            <Link
                                to="/marketing-website/about-us/history"
                                className="block py-2 pl-4 text-sm"
                                onClick={() => {
                                    setSidebarOpen(false);
                                    setAboutOpen(false);
                                }}
                            >
                                History
                            </Link>
                            <Link
                                to="/marketing-website/about-us/why-us"
                                className="block py-2 pl-4 text-sm"
                                onClick={() => {
                                    setSidebarOpen(false);
                                    setAboutOpen(false);
                                }}
                            >
                                Why Us?
                            </Link>
                            <Link
                                to="/marketing-website/about-us/team"
                                className="block py-2 pl-4 text-sm"
                                onClick={() => {
                                    setSidebarOpen(false);
                                    setAboutOpen(false);
                                }}
                            >
                                Team
                            </Link>
                        </div>
                    )}
                </div>
                <Link
                    to="/marketing-website/blogs"
                    state={{ scrollTo: "blogs" }} // Added state
                >
                    <div
                        className="border-primary dark:border-white sm:hover:border-b text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Blogs
                    </div>
                </Link>
                <Link
                    to="/marketing-website/testimonials"
                    state={{ scrollTo: "testimonials" }} // Added state
                >
                    <div
                        className="border-primary dark:border-white sm:hover:border-b text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Testimonials
                    </div>
                </Link>
                <Link
                    to="/marketing-website/industry"
                    state={{ scrollTo: "industry" }} // Added state
                >
                    <div
                        className="border-primary dark:border-white sm:hover:border-b text-base"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Industry
                    </div>
                </Link>
                {/* MOBILE — CONTACT + SIGNIN + SIGNUP */}
                <div className="mt-2 flex flex-col gap-3 pr-10 md:hidden lg:hidden">
                    <Link
                        to="/marketing-website/contact-us"
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
                    <Link to="/signin">
                        <div className="rounded-lg bg-gradient-to-r from-primary to-purple-500 px-4 py-2 text-center font-semibold text-white">
                            Sign In
                        </div>
                    </Link>
                    <Link to="/signup">
                        <div className="rounded-lg bg-gradient-to-r from-purple-500 to-primary px-4 py-2 text-center font-semibold text-white">
                            Sign Up
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
                    to="/marketing-website/contact-us"
                    state={{ scrollTo: "contact-us" }}
                >
                    <div className="hidden cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-primary px-6 py-2 text-sm text-white transition-all hover:scale-105 dark:from-primary dark:to-purple-600 md:flex lg:flex">
                        Contact Us{" "}
                        <img
                            src={assets.arrow_icon}
                            width={14}
                            alt=""
                        />
                    </div>
                </Link>

                {/* SIGN IN BUTTON (DESKTOP + TABLET) */}
                <Link to="/signin">
                    <button className="hidden rounded-full border border-primary/40 bg-gradient-to-r px-5 py-2 text-sm font-medium text-primary transition-all hover:border-none hover:from-pink-500 hover:to-purple-600 hover:text-white dark:border-white/30 dark:text-white dark:hover:border-none dark:hover:bg-white/20 md:flex lg:flex">
                        Sign In
                    </button>
                </Link>

                {/* SIGN UP BUTTON (DESKTOP + TABLET) */}
                <Link to="/signup">
                    <button className="hidden rounded-full bg-gradient-to-r from-primary to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg dark:from-purple-500 dark:to-primary md:flex lg:flex">
                        Sign Up
                    </button>
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
