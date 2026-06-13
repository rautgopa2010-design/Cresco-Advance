import assets from "../../../assets/assets";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const Footer = ({ theme }) => {
    const manualYear = 2025;
    const currentYear = new Date().getFullYear();
    const displayYear = manualYear === currentYear ? `${manualYear}` : `${manualYear}-${currentYear}`;

    return (
        <div className="mt-0 border-t border-slate-200 bg-slate-50 px-4 pt-14 transition-colors dark:border-slate-800 dark:bg-gray-900 md:px-10 lg:px-20">
            {/* Footer Top */}
            <div className="mx-auto mb-8 flex max-w-[1380px] justify-between gap-10 max-lg:flex-col lg:items-center">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                    <Link
                        to="/marketing-website"
                        state={{ scrollTo: "home" }}
                    >
                        <img
                            src={theme === "dark" ? assets.logo_dark : assets.logo}
                            alt=""
                            className="w-10 md:w-16 lg:w-20"
                        />
                    </Link>
                    <p className="max-w-md">From lead to lifetime value, we empower customer journeys that drive your business forward.</p>

                    <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-3">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/marketing-website"
                                    state={{ scrollTo: "home" }}
                                    className="hover:text-primary"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/marketing-website/our-services"
                                    state={{ scrollTo: "our-services" }}
                                    className="hover:text-primary"
                                >
                                    Our Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/marketing-website/features"
                                    state={{ scrollTo: "features" }}
                                    className="hover:text-primary"
                                >
                                    Features
                                </Link>
                            </li>
                        </ul>

                        <ul className="relative space-y-2">
                            <li>
                                <Link
                                    to="/marketing-website/pricing"
                                    state={{ scrollTo: "pricing" }}
                                    className="hover:text-primary"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li className="group relative">
                                <span className="cursor-pointer hover:text-primary">About Us</span>

                                <div className="absolute -top-12 left-10 z-30 mt-2 hidden rounded-lg bg-white p-3 shadow-lg group-hover:block dark:bg-gray-800">
                                    <ul className="w-32 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li>
                                            <Link
                                                to="/marketing-website/about-us/history"
                                                className="hover:text-primary"
                                            >
                                                History
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/marketing-website/about-us/why-us"
                                                className="hover:text-primary"
                                            >
                                                Why Us?
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/marketing-website/about-us/team"
                                                className="hover:text-primary"
                                            >
                                                Team
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            <li>
                                <Link
                                    to="/marketing-website/blogs"
                                    state={{ scrollTo: "blogs" }}
                                    className="hover:text-primary"
                                >
                                    Blogs
                                </Link>
                            </li>
                        </ul>

                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/marketing-website/testimonials"
                                    state={{ scrollTo: "testimonials" }}
                                    className="hover:text-primary"
                                >
                                    Testimonials
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/marketing-website/industry"
                                    state={{ scrollTo: "industry" }}
                                    className="hover:text-primary"
                                >
                                    Industry
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/marketing-website/contact-us"
                                    state={{ scrollTo: "contact-us" }}
                                    className="hover:text-primary"
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="md:flex md:gap-20 lg:items-start lg:gap-10">
                    <div className="text-gray-600 dark:text-gray-400 md:mt-0 lg:mt-[70px]">
                        <h3 className="font-bold">Contact Us</h3>
                        <p className="mt-2 text-sm font-semibold">Phone</p>
                        <div className="text-sm">8080288194</div>
                        <p className="mt-2 text-sm font-semibold">Email</p>
                        <div className="text-sm">support@crescosoft.com</div>
                    </div>

                    <div className="mt-8 text-gray-600 dark:text-gray-400 md:mt-0 lg:mt-[70px]">
                        <h3 className="font-bold">Address</h3>
                        <p className="mt-2 text-sm font-semibold">Headquarters</p>
                        <div className="text-sm">
                            Office No k1B 1503,Godrej Elements <br /> Main road Hinjewadi Phase 1 Pune 411057
                        </div>
                        <p className="mt-2 text-sm font-semibold">Sales Office</p>
                        <div className="text-sm">
                            Office no 8, Satyaprakash Cornor Near <br /> Barbeque Misal, Nawale Bridge Pune 411041
                        </div>
                    </div>
                </div>
                <div className="mt-0 text-gray-600 dark:text-gray-400 md:mt-0 lg:mt-2.5">
                    <h3 className="font-semibold">Subscribe to our newsletter</h3>
                    <p className="mb-6 mt-2 text-sm">The latest news, articles and resources, sent to your inbox weekly.</p>
                    <div className="flex items-center gap-2 text-sm">
                        <input
                            type="email"
                            placeholder="Enter Your email"
                            className="w-full rounded-full border border-gray-300 bg-transparent p-3 text-sm outline-none dark:border-gray-500 dark:text-gray-200"
                        />
                        <button className="rounded-full bg-primary px-6 py-2 text-white">Subscribe</button>
                    </div>
                </div>
            </div>
            {/* Footer Bottom */}
            <footer className="flex flex-wrap items-center justify-around gap-0 bg-slate-50 px-0 py-2 shadow-[0_-4px_4px_-1px_rgba(0,0,0,0.1)] transition-colors dark:bg-gray-900 md:justify-around md:gap-0 md:px-0 lg:justify-between lg:gap-4 lg:px-10">
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#7A6777] md:mt-2 md:text-sm lg:mt-3 lg:text-balance">
                    <div>&copy; {displayYear}</div>
                    <div>Provided by</div>
                    <div>
                        <a
                            href="https://crescosoft.com/marketing-website"
                            className="link"
                        >
                            <div className="text-xs font-semibold text-indigo-900 md:text-sm lg:text-balance"> Cresco Software Solutions</div>
                        </a>
                    </div>
                    <div>
                        <img
                            src={theme === "dark" ? assets.logo_dark : assets.logo}
                            alt="logo"
                            className="mt-0.5 w-10 md:mt-0.5 lg:mt-0.5"
                        />
                    </div>
                </p>
                <div className="mt-1 flex flex-wrap gap-x-2 text-xs md:mt-2 md:text-sm lg:mt-3 lg:text-balance">
                    <Link
                        to="/marketing-website/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-xs lg:text-balance text-[#7A6777] hover:text-primary hover:underline dark:text-slate-50 md:text-sm"
                    >
                        Privacy Policy
                    </Link>

                    <Link
                        to="/marketing-website/terms-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-xs lg:text-balance text-[#7A6777] hover:text-primary hover:underline dark:text-slate-50 md:text-sm"
                    >
                        Terms of Service
                    </Link>
                </div>
            </footer>
        </div>
    );
};

Footer.propTypes = {
    theme: PropTypes.string,
};

export default Footer;
