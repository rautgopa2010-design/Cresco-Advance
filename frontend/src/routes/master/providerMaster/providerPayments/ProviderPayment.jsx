import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { getOrganizationInfo } from "@/redux/actions/auth";
import { useNavigate } from "react-router-dom";

const ProviderPayment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { organizationInfo, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getOrganizationInfo());
    }, [dispatch]);

    if (loading || !organizationInfo) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    const orgs = organizationInfo.organizations || [];
    const payments = organizationInfo.payments || [];

    // Group payments by org_id
    const groupedPayments = payments.reduce((acc, payment) => {
        if (!acc[payment.org_id]) acc[payment.org_id] = [];
        acc[payment.org_id].push(payment);
        return acc;
    }, {});

    return (
        <div className="card">
            <h1 className="text-base md:text-xl lg:text-2xl font-bold text-[#053054] mb-6">
                Provider Payments Summary
            </h1>

            {Object.keys(groupedPayments).length === 0 ? (
                <div className="text-gray-500 text-center mt-10">
                    No Payments Found.
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
                    {Object.entries(groupedPayments).map(([orgId, orgPayments]) => {
                        const org = orgs.find((o) => o.id === Number(orgId));

                        if (!org) return null;

                        return (
                            <div
                                key={orgId}
                                onClick={() =>
                                    navigate(`/provider/settings/master/payment/details/${orgId}`)
                                }
                                className="relative cursor-pointer bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.03] p-5 overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-lg md:text-xl font-semibold text-[#053054] group-hover:text-blue-700 transition-colors duration-300">
                                            {org.company}
                                        </h2>

                                        <span className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium shadow-sm">
                                            {orgPayments.length} Payments
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                        View all payments made by{" "}
                                        <span className="font-medium text-[#053054] group-hover:text-blue-600 transition-colors duration-300">
                                            {org.company}
                                        </span>.
                                    </p>

                                    <div className="mt-3 h-[2px] w-0 bg-blue-600 rounded-full group-hover:w-full transition-all duration-500"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProviderPayment;
