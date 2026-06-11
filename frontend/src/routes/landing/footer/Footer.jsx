import React from "react";
import assets from "../../../assets/assets";
import { Link, useParams } from "react-router-dom";
import { usePublicCompany } from "../../../context/PublicCompanyContext";
import { IMAGE_BASE_URL } from "../../../utils/api";

const Footer = ({ theme }) => {
    const { companyData, loading } = usePublicCompany();
    const { companySlug } = useParams();

    const logoUrl = companyData?.companyLogo ? `${IMAGE_BASE_URL}${companyData.companyLogo}` : theme === "dark" ? assets.logo_dark : assets.logo;

    const manualYear = 2025;
    const currentYear = new Date().getFullYear();
    const displayYear = manualYear === currentYear ? `${manualYear}` : `${manualYear}-${currentYear}`;

    // Helper to format address from companyData
    const formatAddress = ({ street, city, state, pincode, country }) => {
        if (!street && !city && !state && !pincode && !country) return "Address not available";
        return (
            <>
                {street && (
                    <span>
                        {street}
                        <br />
                    </span>
                )}
                {city && (
                    <span>
                        {city}, {state} {pincode}
                        <br />
                    </span>
                )}
                {country && <span>{country}</span>}
            </>
        );
    };

    const headquartersAddress = formatAddress({
        street: companyData?.permanantStreet,
        city: companyData?.permanantCity,
        state: companyData?.permanantState,
        pincode: companyData?.permanantPincode,
        country: companyData?.permanantCountry,
    });

    const salesOfficeAddress = formatAddress({
        street: companyData?.alternateStreet,
        city: companyData?.alternateCity,
        state: companyData?.alternateState,
        pincode: companyData?.alternatePincode,
        country: companyData?.alternateCountry,
    });

    return (
        <div className="mt-16 bg-slate-50 px-4 pt-10 shadow-[0_-4px_4px_-1px_rgba(0,0,0,0.1)] transition-colors dark:bg-gray-900 md:mt-10 md:px-10 lg:px-20">
            {/* Footer Top */}
            <div className="mb-3 lg:-mt-16 md:mt-10 mt-6 flex justify-between gap-10 max-lg:flex-col lg:items-center">
                <div className="-mt-5 text-sm text-gray-700 dark:text-gray-400">
                    <Link
                        to={`/landing/${companySlug}`}
                        state={{ scrollTo: "home" }}
                    >
                        <img
                            src={loading ? assets.logo : logoUrl}
                            alt=""
                            className="-mt-7 w-10 md:w-16 lg:w-24"
                        />
                    </Link>
                    <p className="max-w-md">From lead to lifetime value, we empower customer journeys that drive your business forward.</p>

                    <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-3">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to={`/landing/${companySlug}`}
                                    state={{ scrollTo: "home" }}
                                    className="hover:text-primary"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={`/landing/${companySlug}/about-us`}
                                    state={{ scrollTo: "about-us" }}
                                    className="hover:text-primary"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>

                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to={`/landing/${companySlug}/our-services`}
                                    state={{ scrollTo: "our-services" }}
                                    className="hover:text-primary"
                                >
                                    Our Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={`/landing/${companySlug}/testimonials`}
                                    state={{ scrollTo: "testimonials" }}
                                    className="hover:text-primary"
                                >
                                    Testimonials
                                </Link>
                            </li>
                        </ul>

                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to={`/landing/${companySlug}/contact-us`}
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
                        <div className="text-sm">{companyData?.mobile || companyData?.supportedMobile}</div>
                        <p className="mt-2 text-sm font-semibold">Email</p>
                        <div className="text-sm">{companyData?.email || companyData?.supportedEmail}</div>
                    </div>

                    <div className="mt-8 text-gray-600 dark:text-gray-400 md:mt-0 lg:mt-[70px]">
                        <h3 className="font-bold">Address</h3>
                        <p className="mt-2 text-sm font-semibold">Headquarters</p>
                        <div className="max-w-xs text-sm">{loading ? "Loading..." : headquartersAddress}</div>

                        <p className="mt-4 text-sm font-semibold">Sales Office</p>
                        <div className="max-w-xs text-sm">{loading ? "Loading..." : salesOfficeAddress}</div>
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
                        <button className="rounded-full bg-gradient-to-r from-[#000000] to-[#40403f] dark:from-[#40403f] dark:to-[#000000] px-6 py-2 text-white">Subscribe</button>
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
                            href={`${IMAGE_BASE_URL}/landing/${companySlug}`}
                            className="link"
                        >
                            <div className="text-xs font-semibold text-indigo-900 md:text-sm lg:text-balance">
                                {companyData?.companyName || "Company"}
                            </div>
                        </a>
                    </div>
                    <div>
                        <img
                            src={loading ? assets.logo : logoUrl}
                            alt="logo"
                            className="mt-0.5 w-10 md:mt-0.5 lg:mt-0.5"
                        />
                    </div>
                </p>
                <div className="mt-1 flex flex-wrap gap-x-2 text-xs md:mt-2 md:text-sm lg:mt-3 lg:text-balance">
                    <p className="link cursor-pointer text-xs text-[#7A6777] dark:text-slate-50 md:text-sm lg:text-balance">Privacy Policy</p>
                    <p className="link cursor-pointer text-xs text-[#7A6777] dark:text-slate-50 md:text-sm lg:text-balance">Terms of Service</p>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
