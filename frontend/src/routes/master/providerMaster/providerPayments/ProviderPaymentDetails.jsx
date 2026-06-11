import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { getOrganizationInfo } from "@/redux/actions/auth";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBackCircle } from "react-icons/io5";
import { Printer } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { getCompanySetup } from "../../../../redux/actions/companySetup";
import ProviderPaymentReceiptPrint from "./ProviderPaymentReceiptPrint";

const ProviderPaymentDetails = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { organizationInfo, loading } = useSelector((state) => state.auth);
    const { companySetup } = useSelector((state) => state.companySetup);

    const printRef = useRef();
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        if (!organizationInfo) {
            dispatch(getOrganizationInfo());
        }
    }, [dispatch, organizationInfo]);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (user.org_id) {
            dispatch(getCompanySetup(user.org_id));
        }
    }, [dispatch, user.org_id]);

    if (loading || !organizationInfo) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    const orgs = organizationInfo.organizations || [];
    const payments = organizationInfo.payments || [];

    const org = orgs.find((o) => o.id === Number(orgId));
    const orgPayments = payments.filter((p) => p.org_id === Number(orgId));

    const buildFullName = (...parts) => parts.filter((p) => p && p.trim()).join(" ");

    const handlePrint = (payment) => {
        if (!companySetup || !org) {
            console.warn("Missing companySetup or org data");
            return;
        }
    
        const providerFullName = buildFullName(
            companySetup?.salutation,
            companySetup?.firstName,
            companySetup?.middleName,
            companySetup?.lastName
        );
    
        const receiptData = {
            company: {
                name: companySetup?.companyName,
                logo: companySetup?.companyLogo,
                providerName: providerFullName,
                email: companySetup?.email,
                mobile: companySetup?.mobile,
            },
            customer: {
                companyName: org?.company,
                fullName: org?.customerName,
                email: org?.email,
                mobile: org?.mobile,
            },
            payment: {
                amount: payment.amount,
                currency: payment.currency || "₹",
                orderId: payment.orderId,
                paymentId: payment.paymentId || "Not Completed",
                status: payment.status,
                createdAt: payment.createdAt,
            },
        };
    
        setSelectedPayment(receiptData);
        // Give React time to render the print component
        setTimeout(() => {
            printRef.current?.print();
        }, 300);
    };

    return (
        <div className="px-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-5 flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-gray-700 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl md:gap-2 md:px-3 md:py-2"
            >
                <IoArrowBackCircle size={24} />
                Back
            </button>

            {/* Header */}
            <h1 className="mb-6 text-lg font-extrabold tracking-tight text-[#053054] md:text-xl lg:text-3xl">{org?.company} – Payment History</h1>

            {selectedPayment && (
                <ProviderPaymentReceiptPrint
                    ref={printRef}
                    companyName={companySetup?.companyName || ""}
                    companyLogo={companySetup?.companyLogo || ""}
                    receipt={selectedPayment}
                />
            )}

            {orgPayments.length === 0 ? (
                <div className="mt-10 text-center text-lg text-gray-600">No payments found for this organization.</div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {orgPayments.map((payment) => (
                        <div
                            key={payment.id}
                            className="group relative rounded-3xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 p-[2px] shadow-xl transition-all duration-500 hover:from-blue-500 hover:via-purple-600 hover:to-pink-600 hover:shadow-2xl"
                        >
                            {/* Inner Frosted Glass Card */}
                            <div className="h-full rounded-3xl bg-white/60 p-6 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/80 group-hover:shadow-xl">
                                {/* Title */}
                                <h3 className="mb-3 text-lg font-bold text-[#053054]">{payment.orderId}</h3>

                                {/* Grid Info */}
                                <div className="space-y-2 text-sm text-gray-700">
                                    <p>
                                        <span className="font-semibold">Payment ID:</span>{" "}
                                        {payment.paymentId || <span className="font-medium text-red-500">Not Completed</span>}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Email:</span> {payment.userEmail}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Amount:</span>{" "}
                                        <span className="font-bold text-green-700">₹{payment.amount}</span>
                                    </p>

                                    <p className="pb-2">
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                payment.status === "completed"
                                                    ? "bg-green-200 text-green-900"
                                                    : payment.status === "created"
                                                      ? "bg-yellow-200 text-yellow-900"
                                                      : "bg-red-200 text-red-900"
                                            }`}
                                        >
                                            {payment.status.toUpperCase()}
                                        </span>
                                    </p>

                                    {/* Printer Button – top right */}
                                    <Button
                                        onClick={() => handlePrint(payment)}
                                        className="flex items-center gap-2 bg-gray-700 px-4 py-2 capitalize"
                                        size="small"
                                        title="Print Receipt"
                                    >
                                        <Printer size={20} /> Get Receipt
                                    </Button>

                                    <p className="pt-2 text-xs text-gray-500">{new Date(payment.createdAt).toLocaleString()}</p>
                                </div>

                                {/* Bottom Accent Line */}
                                <div className="mt-4 h-[3px] w-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-700 group-hover:w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProviderPaymentDetails;
