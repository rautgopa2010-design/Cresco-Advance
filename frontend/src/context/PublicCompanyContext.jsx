// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";
// import { IMAGE_BASE_URL } from "../utils/api";
// import { useParams } from "react-router-dom";

// const PublicCompanyContext = createContext();

// export const usePublicCompany = () => useContext(PublicCompanyContext);

// export const PublicCompanyProvider = ({ children }) => {
//     const { companySlug } = useParams();
    
//     const [companyData, setCompanyData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         if (!companySlug) return;

//         const fetchPublicData = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get(`${IMAGE_BASE_URL}/api/company-setup/public/${companySlug}`);
//                 setCompanyData(response.data);
//             } catch (err) {
//                 console.error("Failed to fetch public company data:", err);
//                 setError("Company not found or invalid slug");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPublicData();
//     }, [companySlug]);

//     return <PublicCompanyContext.Provider value={{ companyData, loading, error }}>{children}</PublicCompanyContext.Provider>;
// };

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useParams } from "react-router-dom";

const PublicCompanyContext = createContext();

export const usePublicCompany = () => useContext(PublicCompanyContext);

export const PublicCompanyProvider = ({ children }) => {
    const { companySlug } = useParams();
    const [companyData, setCompanyData] = useState(null);       
    const [landingPageSetup, setLandingPageSetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to extract org_id from slug like "suraj-agro-3"
    const extractOrgId = (slug) => {
        if (!slug) return null;
        const parts = slug.split("-");
        const lastPart = parts[parts.length - 1];
        return /^\d+$/.test(lastPart) ? lastPart : null;
    };

    useEffect(() => {
        if (!companySlug) {
            setError("No company slug provided");
            setLoading(false);
            return;
        }

        const org_id = extractOrgId(companySlug);

        if (!org_id) {
            setError("Invalid company slug: org_id not found");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch basic public company data (your original endpoint)
                const companyResponse = await axios.get(
                    `${API_BASE_URL}/company-setup/public/${companySlug}`
                );
                setCompanyData(companyResponse.data);

                // Fetch landing page setup using org_id (public endpoint)
                const landingResponse = await axios.get(
                    `${API_BASE_URL}/landing-page-setup?org_id=${org_id}`
                );
                setLandingPageSetup(landingResponse.data);
            } catch (err) {
                console.error("Failed to fetch public data:", err);
                const msg =
                    err.response?.data?.message ||
                    "Company not found or invalid slug";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companySlug]);

    return (
        <PublicCompanyContext.Provider
            value={{
                companyData,
                landingPageSetup,   // Now available in context
                loading,
                error,
            }}
        >
            {children}
        </PublicCompanyContext.Provider>
    );
};