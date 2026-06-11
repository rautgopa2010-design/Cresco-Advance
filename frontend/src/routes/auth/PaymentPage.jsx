import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert, CircularProgress, Fade } from "@mui/material";
import { createPaymentOrder, verifyPaymentOrder } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";
import logo from "../../assets/logo.jpg";
import { assignPackageCashByProvider, getOrganizationInfo } from "@/redux/actions/auth";
import api from "@/utils/api";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isProviderAssigning = location.state?.targetOrgId && location.state?.from === "provider";
    const { snackbarMessage, snackbarSeverity, user } = useSelector((state) => state.auth);

    const {
        packageId,
        numUsers,
        totalAmount,
        packageName,
        targetOrgId,
    } = location.state || {};

    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    useEffect(() => {
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            setError("Payment configuration missing");
        }
        if (!window.Razorpay) {
            setError("Razorpay not loaded");
        }
    }, []);

    const handlePayment = async () => {
        if (!packageId || !numUsers || totalAmount === undefined || !user) {
            setError("Missing payment details.");
            return;
        }

        setLoading(true);
        setError(null);
        setPaymentStatus(null);

        try {
            const orderData = { packageId, numUsers, totalAmount };
            const orderRes = await dispatch(createPaymentOrder(orderData));

            if (!orderRes) throw new Error("Failed to create order");

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: Math.round(totalAmount * 100),
                currency: orderRes.currency,
                name: "Cresco Payments",
                description: `Payment for ${orderRes.packageName || packageName} - ${numUsers} users`,
                order_id: orderRes.orderId,
                // handler: async (response) => {
                //     try {
                //         const payload = {
                //             razorpay_order_id: response.razorpay_order_id,
                //             razorpay_payment_id: response.razorpay_payment_id,
                //             razorpay_signature: response.razorpay_signature,
                //             planId: packageId,
                //             userId: user.user_id,
                //             numUsers,
                //             totalAmount,
                //         };
                //         const verifyRes = await dispatch(verifyPaymentOrder(payload));
                //         if (verifyRes?.success) {
                //             setPaymentStatus("Payment successful!");
                //             setTimeout(() => navigate("/", { replace: true }), 2000);
                //         } else {
                //             setError("Verification failed");
                //         }
                //     } catch (err) {
                //         setError("Verification error");
                //     } finally {
                //         setLoading(false);
                //     }
                // },
                handler: async (response) => {
                    try {
                        const payload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: packageId,
                            userId: user.user_id,
                            numUsers,
                            totalAmount,
                        };
                        
                        const verifyRes = await dispatch(verifyPaymentOrder(payload));
                        
                        // ✅ Better response handling
                        if (verifyRes && verifyRes.success === true) {
                            setPaymentStatus("Payment successful!");
                            setTimeout(() => navigate("/", { replace: true }), 2000);
                        } else {
                            // If the action returned a specific error message, use it
                            const errorMsg = verifyRes?.message || "Verification failed";
                            setError(errorMsg);
                            setPaymentStatus(null);
                        }
                    } catch (err) {
                        console.error("Payment verification error:", err);
                        setError("Verification error: " + (err.message || "Unknown error"));
                        setPaymentStatus(null);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.sa_role_name || user.firstName,
                    email: user.email,
                    contact: user.mobile,
                },
                theme: { color: "#10b981" },
                modal: { ondismiss: () => setLoading(false) },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", () => {
                setError("Payment failed");
                setLoading(false);
            });
            razorpay.open();
        } catch (err) {
            setError("Failed to initiate payment");
            setLoading(false);
        }
    };

    const handleProviderCashPayment = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);

        const data = {
            targetOrgId,
            packageId,
            numUsers,
            totalAmount,
            paymentMethod: "Cash",
        };

        const result = await dispatch(assignPackageCashByProvider(data));
        if (result?.success) {
            setPaymentStatus("Package assigned (Cash payment recorded)");
            dispatch(getOrganizationInfo());
            setTimeout(() => navigate("/provider/registered-customers"), 2000);
        } else {
            setError("Cash payment failed");
        }
        setLoading(false);
    };

    const handleProviderOnlinePayment = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const orderData = { packageId, numUsers, totalAmount };
            const orderRes = await dispatch(createPaymentOrder(orderData));

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderRes.amount,
                currency: orderRes.currency,
                name: "Cresco Payments",
                description: "Provider assigning package",
                order_id: orderRes.orderId,
                handler: async (response) => {
                    try {
                        await api.post("/auth/assign-package-by-provider", {
                            targetOrgId,
                            packageId,
                            numUsers,
                            totalAmount,
                            paymentMethod: "Online",
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        dispatch(getOrganizationInfo());
                        setPaymentStatus("Package assigned (Online payment)");
                        setTimeout(() => navigate("/provider/registered-customers"), 2000);
                    } catch (err) {
                        setError("Payment verification failed");
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.sa_role_name || user.firstName,
                    email: user.email,
                    contact: user.mobile,
                },
                theme: { color: "#10b981" },
                modal: { ondismiss: () => setLoading(false) },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", () => {
                setError("Payment failed");
                setLoading(false);
            });
            razorpay.open();
        } catch (err) {
            setError("Failed to initiate online payment");
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        dispatch(clearSnackbar());
    };

    if (!packageId || !numUsers || totalAmount === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Alert severity="error" className="max-w-md">
                        No payment details found. Please select a package first.
                    </Alert>
                    <Button onClick={() => navigate("/choose-package")} variant="outlined" className="mt-4">
                        Choose Package
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <CircularProgress size={60} thickness={4} sx={{ color: "#10b981" }} />
                    <p className="mt-4 text-lg font-medium text-gray-600">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Fade in timeout={600}>
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-200">
                    <div className="mb-6">
                        <img src={logo} alt="logo" className="h-24 md:h-32 mx-auto" />
                    </div>
                    <h1 className="mb-2 text-lg font-bold text-gray-900 md:text-2xl">Complete Your Payment</h1>

                    <div className="mb-6 space-y-2 text-left">
                        <p className="text-sm text-gray-600">Package: {packageName}</p>
                        <p className="text-sm text-gray-600">Number of Users: {numUsers}</p>
                        <p className="text-base font-semibold text-gray-900">Total Amount: ₹{totalAmount?.toFixed(2)}</p>
                    </div>

                    {isProviderAssigning ? (
                        <div className="mt-6 flex flex-col gap-4">
                            <Button
                                onClick={handleProviderCashPayment}
                                disabled={loading}
                                className="w-full rounded-xl bg-orange-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700"
                            >
                                {loading ? "Processing..." : "Cash Payment (Assign Package)"}
                            </Button>
                            <Button
                                onClick={handleProviderOnlinePayment}
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:from-green-600 hover:to-green-700"
                            >
                                {loading ? "Processing..." : `Pay ₹${totalAmount?.toFixed(0)} Online`}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:from-green-600 hover:to-green-700"
                        >
                            {loading ? "Processing..." : `Pay ₹${totalAmount?.toFixed(0)} Now`}
                        </Button>
                    )}

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    {paymentStatus && (
                        <div className="mt-4 rounded-lg p-3 text-sm bg-green-50 text-green-700">
                            {paymentStatus}
                        </div>
                    )}
                </div>
            </Fade>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity || "success"} variant="filled">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PaymentPage;