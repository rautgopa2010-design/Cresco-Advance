import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import PropTypes from "prop-types";
import assets from "../../../assets/assets";

const navItems = [
    { label: "Home", to: "/marketing-website", scrollTo: "home" },
    { label: "Services", to: "/marketing-website/our-services", scrollTo: "our-services" },
    { label: "Features", to: "/marketing-website/features", scrollTo: "features" },
    { label: "Pricing", to: "/marketing-website/pricing", scrollTo: "pricing" },
    { label: "Blogs", to: "/marketing-website/blogs", scrollTo: "blogs" },
    { label: "Testimonials", to: "/marketing-website/testimonials", scrollTo: "testimonials" },
    { label: "Industry", to: "/marketing-website/industry", scrollTo: "industry" },
];

const aboutItems = [
    { label: "Our History", to: "/marketing-website/about-us/history" },
    { label: "Why Crescosoft", to: "/marketing-website/about-us/why-us" },
    { label: "Our Team", to: "/marketing-website/about-us/team" },
];

const Navbar = ({ theme }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
        setAboutOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                <Link to="/marketing-website" state={{ scrollTo: "home" }} className="shrink-0" onClick={closeMenu}>
                    <img
                        src={theme === "dark" ? assets.logo_dark : assets.logo}
                        alt="Crescosoft"
                        className="h-12 w-auto object-contain"
                    />
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    {navItems.slice(0, 4).map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            state={{ scrollTo: item.scrollTo }}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div
                        className="relative"
                        onMouseEnter={() => setAboutOpen(true)}
                        onMouseLeave={() => setAboutOpen(false)}
                    >
                        <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-900">
                            About
                            <ChevronDown size={15} className={`transition ${aboutOpen ? "rotate-180" : ""}`} />
                        </button>
                        <div
                            className={`absolute left-0 top-full w-52 pt-2 transition ${
                                aboutOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
                            }`}
                        >
                            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
                                {aboutItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {navItems.slice(4).map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            state={{ scrollTo: item.scrollTo }}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        to="/marketing-website/contact-us"
                        state={{ scrollTo: "contact-us" }}
                        className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        Contact
                    </Link>
                    <Link to="/signin" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-900">
                        Sign in
                    </Link>
                    <Link
                        to="/signup"
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 dark:shadow-none"
                    >
                        Start free
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-slate-700 dark:text-white"
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {menuOpen && (
                <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden dark:border-slate-800 dark:bg-slate-950">
                    <nav className="mx-auto flex max-w-[1440px] flex-col gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.to}
                                state={{ scrollTo: item.scrollTo }}
                                onClick={closeMenu}
                                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={() => setAboutOpen((open) => !open)}
                            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200"
                        >
                            About
                            <ChevronDown size={16} className={`transition ${aboutOpen ? "rotate-180" : ""}`} />
                        </button>
                        {aboutOpen && (
                            <div className="ml-3 border-l border-slate-200 pl-3 dark:border-slate-700">
                                {aboutItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        onClick={closeMenu}
                                        className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                            <Link
                                to="/marketing-website/contact-us"
                                state={{ scrollTo: "contact-us" }}
                                onClick={closeMenu}
                                className="col-span-2 rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                Contact us
                            </Link>
                            <Link to="/signin" onClick={closeMenu} className="rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-white">
                                Sign in
                            </Link>
                            <Link to="/signup" onClick={closeMenu} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                                Start free
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

Navbar.propTypes = {
    theme: PropTypes.string,
};

export default Navbar;
