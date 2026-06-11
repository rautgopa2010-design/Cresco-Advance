import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

export const Footer = () => {
    const manualYear = 2025;
    const currentYear = new Date().getFullYear();
    const displayYear = manualYear === currentYear ? `${manualYear}` : `${manualYear}-${currentYear}`;

    return (
        <footer className="flex flex-wrap items-center justify-around gap-0 bg-white px-0 py-3 shadow-[0_-4px_4px_-1px_rgba(0,0,0,0.1)] transition-colors md:justify-around md:gap-0 md:px-0 lg:justify-between lg:gap-4 lg:px-10">
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#7A6777] md:mt-2 md:text-sm lg:mt-3 lg:text-balance">
                <div>&copy; {displayYear}</div>
                <div>Provided by</div>
                <div>
                    <a
                        href="http://168.231.69.34:8200/marketing-website"
                        className="link"
                    >
                        <div className="text-xs font-semibold text-indigo-900 md:text-sm lg:text-balance"> Cresco Software Solutions</div>
                    </a>
                </div>
                <div>
                    <img
                        src={logo}
                        alt="logo"
                        className="mt-0.5 w-10 md:mt-0.5 lg:mt-1"
                    />
                </div>
            </p>
            <div className="mt-1 flex flex-wrap gap-x-2 text-xs md:mt-2 md:text-sm lg:mt-3 lg:text-balance">
                <Link
                    to="/marketing-website/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-xs text-[#7A6777] hover:text-primary hover:underline dark:text-slate-50 md:text-sm lg:text-balance"
                >
                    Privacy Policy
                </Link>

                <Link
                    to="/marketing-website/terms-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-xs text-[#7A6777] hover:text-primary hover:underline dark:text-slate-50 md:text-sm lg:text-balance"
                >
                    Terms of Service
                </Link>
            </div>
        </footer>
    );
};
