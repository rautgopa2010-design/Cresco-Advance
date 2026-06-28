// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { CircularProgress } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";
// import { getOrderPayments } from "../../redux/actions/orderPayment";
// import { IoArrowBackCircle } from "react-icons/io5";

// const OrderPaymentDetails = () => {
//     const { orderId, paymentId } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const { payments, loading } = useSelector((state) => state.orderPayment);

//     useEffect(() => {
//         dispatch(getOrderPayments(orderId));
//     }, [dispatch, orderId]);

//     if (loading) {
//         return (
//             <div className="flex h-screen w-full items-center justify-center">
//                 <CircularProgress />
//             </div>
//         );
//     }

//     const orderPayments = payments || [];

//     return (
//         <div className="px-6 py-4">
//             {/* Back Button */}
//             <button
//                 onClick={() => navigate(-1)}
//                 className="mb-5 flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-gray-700 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl md:gap-2 md:px-3 md:py-2"
//             >
//                 <IoArrowBackCircle size={24} />
//                 Back
//             </button>

//             <h1 className="mb-6 text-xl font-extrabold tracking-tight text-[#053054]">
//                 Order #{orderId} – Payment Details
//             </h1>

//             {orderPayments.length === 0 ? (
//                 <div className="mt-10 text-center text-lg text-gray-600">
//                     No payments found for this order.
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//                     {orderPayments.map((p) => (
//                         <div
//                             key={p.id}
//                             className={`group relative rounded-3xl p-[2px] shadow-xl bg-gradient-to-r 
//                                 ${String(p.paymentId) === String(paymentId)
//                                     ? "from-green-500/50 via-green-600/50 to-green-700/50"
//                                     : "from-blue-500/50 via-purple-500/50 to-pink-500/50"
//                                 }
//                                 hover:from-blue-500 hover:via-purple-600 hover:to-pink-600 transition-all duration-500`}
//                         >
//                             <div className="h-full rounded-3xl bg-white/70 p-6 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/80">
//                                 <h3 className="mb-3 text-lg font-bold text-[#053054]">
//                                     Payment ID: {p.paymentId}
//                                 </h3>

//                                 <div className="space-y-2 text-sm text-gray-700">
//                                     <p>
//                                         <span className="font-semibold">Payment Mode:</span> {p.payMode}
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Amount:</span>{" "}
//                                         <span className="font-bold text-green-700">₹{p.amount}</span>
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Pay Date:</span> {p.payDate}
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Bank:</span> {p.bankName}
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Branch:</span> {p.branch}
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Transaction Ref:</span>{" "}
//                                         {p.transactionRef}
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Cheque No:</span> {p.chequeNo}
//                                     </p>

//                                     <p>
//                                         <span className="font-semibold">Cheque Date:</span> {p.chequeDate}
//                                     </p>

//                                     <p className="mt-4 text-xs text-gray-500">
//                                         {new Date(p.createdAt).toLocaleString()}
//                                     </p>
//                                 </div>

//                                 <div className="mt-4 h-[3px] w-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-700 group-hover:w-full"></div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default OrderPaymentDetails;

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderPayments } from "../../redux/actions/orderPayment";
import { IoArrowBackCircle } from "react-icons/io5";
import { Printer, Download, Mail } from "lucide-react";
import OrderPaymentPrint from "./OrderPaymentPrint";
import { getOrders } from "../../redux/actions/order";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getPrefix } from "../../redux/actions/prefix";

const OrderPaymentDetails = () => {
    const { orderId, paymentId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { payments, loading } = useSelector((state) => state.orderPayment);
    const { orders } = useSelector((state) => state.order);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { prefix } = useSelector((state) => state.prefix);
    
    const paymentPrintRef = useRef();
    const [printPayment, setPrintPayment] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        dispatch(getOrderPayments(orderId));
        dispatch(getOrders());
        if (user.org_id) {
            dispatch(getCompanySetup(user.org_id));
        }
        dispatch(getPrefix());
    }, [dispatch, orderId]);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (orders.length > 0 && orderId) {
            const foundOrder = orders.find((o) => String(o.id) === String(orderId));
            setSelectedOrder(foundOrder);
        }
    }, [orders, orderId]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    const orderPayments = payments || [];

    return (
        <div className="px-6 py-4">
            {/* Payment Print Component */}
            <OrderPaymentPrint
                ref={paymentPrintRef}
                companyName={companySetup?.companyName || ""}
                companyLogo={companySetup?.companyLogo || ""}
                order={selectedOrder}
                payment={printPayment}
                prefix={prefix}
            />

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-5 flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-gray-700 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl md:gap-2 md:px-3 md:py-2"
            >
                <IoArrowBackCircle size={24} />
                Back
            </button>

            <h1 className="mb-6 text-xl font-extrabold tracking-tight text-[#053054]">
                Order #{orderId} – Payment Details
            </h1>

            {orderPayments.length === 0 ? (
                <div className="mt-10 text-center text-lg text-gray-600">
                    No payments found for this order.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {orderPayments.map((p) => (
                        <div
                            key={p.id}
                            className={`group relative rounded-3xl p-[2px] shadow-xl bg-gradient-to-r 
                                ${String(p.paymentId) === String(paymentId)
                                    ? "from-green-500/50 via-green-600/50 to-green-700/50"
                                    : "from-blue-500/50 via-purple-500/50 to-pink-500/50"
                                }
                                hover:from-blue-500 hover:via-purple-600 hover:to-pink-600 transition-all duration-500`}
                        >
                            <div className="h-full rounded-3xl bg-white/70 p-6 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/80">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-[#053054]">
                                        Payment ID: {p.paymentId}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => { setPrintPayment(p); setTimeout(() => paymentPrintRef.current?.print(), 300); }} className="text-orange-500 transition-transform hover:scale-110" title="Print receipt">
                                            <Printer size={20} />
                                        </button>
                                        <button onClick={() => { setPrintPayment(p); setTimeout(() => paymentPrintRef.current?.print(), 300); }} className="text-blue-600 transition-transform hover:scale-110" title="Download receipt as PDF">
                                            <Download size={20} />
                                        </button>
                                        <a href={`mailto:${selectedOrder?.email || ""}?subject=${encodeURIComponent(`Payment receipt for order ${selectedOrder?.orderNo || orderId}`)}&body=${encodeURIComponent(`Payment of ₹${p.amount} was received on ${p.payDate}. Receipt reference: RCP-${selectedOrder?.orderNo || orderId}-${p.id}.`)}`} className="text-indigo-600 transition-transform hover:scale-110" title="Email receipt">
                                            <Mail size={20} />
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-700">
                                    <p>
                                        <span className="font-semibold">Payment Mode:</span> {p.payMode}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Amount:</span>{" "}
                                        <span className="font-bold text-green-700">₹{p.amount}</span>
                                    </p>

                                    <p>
                                        <span className="font-semibold">Pay Date:</span> {p.payDate}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Bank:</span> {p.bankName}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Branch:</span> {p.branch}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Transaction Ref:</span>{" "}
                                        {p.transactionRef}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Cheque No:</span> {p.chequeNo}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Cheque Date:</span> {p.chequeDate}
                                    </p>

                                    <p className="mt-4 text-xs text-gray-500">
                                        {new Date(p.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="mt-4 h-[3px] w-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-700 group-hover:w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderPaymentDetails;
