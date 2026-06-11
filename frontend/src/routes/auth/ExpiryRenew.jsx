import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

const ExpiryRenew = () => {
    const navigate = useNavigate();
    const handleRenewClick = () => {
        navigate("/choose-package", { state: { from: "expired" } });
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md transform rounded-lg bg-white p-8 shadow-xl transition-all hover:scale-105">
                <div className="text-center">
                    <div className="mb-6 justify-self-center">
                        <img
                            src={logo}
                            alt="logo"
                            className="h-24 md:h-32 lg:h-32"
                        />
                    </div>
                    <h2 className="mb-2 md:text-2xl text-lg font-bold text-gray-900">Package Expired!</h2>
                    <p className="mb-6 text-gray-600 md:text-balance text-sm">Your subscription has expired. Renew now to continue enjoying unlimited access.</p>
                    <button
                        onClick={handleRenewClick}
                        className="w-full transform rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        Renew Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpiryRenew;
