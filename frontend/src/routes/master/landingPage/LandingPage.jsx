import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCompanySetup } from "../../../redux/actions/companySetup";
import { IMAGE_BASE_URL } from "../../../utils/api";
import defaultLogo from "@/assets/logo.jpg";

const LandingPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [companySetup, setCompanySetup] = useState(null);
    const [logoUrl, setLogoUrl] = useState(defaultLogo);
    const [loading, setLoading] = useState(true);

    console.log(companySetup);

    const user = useMemo(() => {
        return JSON.parse(localStorage.getItem("user") || "{}");
    }, []);

    // Use the companySlug directly from the API response
    const companySlug = companySetup?.companySlug || "";

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const response = await dispatch(getCompanySetup());
                const data = response?.payload || response;
                setCompanySetup(data);
            } catch (error) {
                console.error("Failed to fetch company setup:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [dispatch]);

    useEffect(() => {
        const orgId = user?.org_id || "default";
        const logoKey = `companyLogo_${orgId}`;
        const storedLogo = localStorage.getItem(logoKey);

        const updateLogo = () => {
            if (companySetup?.companyLogo || storedLogo) {
                const logoPath = companySetup?.companyLogo || storedLogo;
                setLogoUrl(`${IMAGE_BASE_URL}${logoPath}`);
            } else {
                setLogoUrl(defaultLogo);
            }
        };

        updateLogo();

        const handleLogoUpdate = (event) => {
            const { orgId: updatedOrgId, logo } = event.detail || {};
            if (updatedOrgId === orgId) {
                if (logo) {
                    setLogoUrl(`${IMAGE_BASE_URL}${logo}`);
                } else {
                    setLogoUrl(defaultLogo);
                }
            }
        };

        window.addEventListener("companyLogoUpdated", handleLogoUpdate);

        return () => {
            window.removeEventListener("companyLogoUpdated", handleLogoUpdate);
        };
    }, [companySetup, user?.org_id]);

    // const handlePreviewClick = () => {
    //     if (companySlug) {
    //         navigate(`/landing/${companySlug}`);
    //     }
    // };

    const handlePreviewClick = () => {
        if (companySlug) {
            const previewUrl = `/landing/${companySlug}`;
            // Open in a new tab
            window.open(previewUrl, "_blank", "noopener,noreferrer");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-lg text-gray-600">Loading company info...</div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-2xl md:p-10">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <img
                        src={logoUrl}
                        alt={`${companySetup?.companyName || "Company"} Logo`}
                        className="h-32 w-auto rounded-lg object-contain shadow-lg"
                        onError={() => setLogoUrl(defaultLogo)}
                    />
                </div>

                {/* Company Name */}
                <h1 className="mb-4 text-center font-bold text-gray-800 md:text-3xl lg:text-4xl">{companySetup?.companyName || "Welcome"}</h1>

                {/* Company Slug */}
                {companySlug && (
                    <p className="mb-6 flex flex-col items-center justify-center gap-2 text-center text-lg text-indigo-600 md:flex-row">
                        <div className="font-medium">Your Public Slug:</div>{" "}
                        <div className="rounded bg-indigo-100 px-3 py-1 font-mono text-sm">{companySlug}</div>
                    </p>
                )}

                {/* Preview Button */}
                <div className="mt-10 text-center">
                    <button
                        onClick={handlePreviewClick}
                        disabled={!companySlug}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-4 text-xs font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400 md:px-8 md:text-lg"
                    >
                        <svg
                            className="mr-3 h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        Preview Landing Page
                    </button>

                    {companySlug && (
                        <p className="mt-4 text-sm text-gray-600">
                            This will open:{" "}
                            <strong>
                                {window.location.origin}/landing/{companySlug}
                            </strong>
                        </p>
                    )}
                </div>

                {/* Welcome Message */}
                <div className="mt-5 text-center text-gray-600 md:mt-7 lg:mt-12">
                    <p className="md:text-lg lg:text-xl">This is how your public landing page will look</p>
                    <p className="mt-2">
                        Public URL will be:{" "}
                        <strong className="">
                            {window.location.origin}/landing/{companySlug || "..."}
                        </strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
