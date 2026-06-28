import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@material-tailwind/react";
import { TextField } from "@mui/material";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../redux/actions/order";

const PaymentLookup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders = [] } = useSelector((state) => state.order);
    const [query, setQuery] = useState("");

    useEffect(() => {
        dispatch(getOrders());
    }, [dispatch]);

    const matches = useMemo(() => {
        const text = query.trim().toLowerCase();
        if (!text) return [];
        return orders
            .flatMap((order) =>
                (order.orderPaymentDetails || []).map((payment) => ({
                    order,
                    payment,
                    haystack: [payment.id, payment.paymentId, order.id, order.orderNo, order.customerPerson, order.selectedCompany].join(" ").toLowerCase(),
                })),
            )
            .filter((row) => row.haystack.includes(text))
            .slice(0, 20);
    }, [orders, query]);

    const openPayment = (orderId) => {
        navigate(`/orders/${orderId}/payments`);
    };

    return (
        <div className="space-y-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-500">Payment</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Find Payment ID</h1>
                <p className="mt-1 text-sm text-slate-500">Type payment ID, order number, or customer name and open the existing receive payment screen.</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row">
                    <TextField label="Payment ID / Order ID / Customer" size="small" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
                    <Button className="flex items-center gap-2 rounded bg-[#053054] px-5 py-2 capitalize text-white">
                        <Search size={18} /> Search
                    </Button>
                </div>

                <div className="mt-5 overflow-auto">
                    <table className="table">
                        <thead className="table-header bg-[#053054] text-white">
                            <tr>
                                <th className="table-head">Payment ID</th>
                                <th className="table-head">Order No</th>
                                <th className="table-head">Customer</th>
                                <th className="table-head">Due Amount</th>
                                <th className="table-head">Status</th>
                                <th className="table-head">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length ? (
                                matches.map(({ order, payment }) => (
                                    <tr key={`${order.id}-${payment.id}`} className="table-row">
                                        <td className="table-cell">{payment.id || payment.paymentId}</td>
                                        <td className="table-cell">{order.orderNo || order.id}</td>
                                        <td className="table-cell">{order.customerPerson || order.selectedCompany || "-"}</td>
                                        <td className="table-cell">{payment.dueAmount || payment.amount || "0"}</td>
                                        <td className="table-cell">{payment.status || "Pending"}</td>
                                        <td className="table-cell">
                                            <button className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white" onClick={() => openPayment(order.id)}>
                                                Pay
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="py-5 text-center text-slate-500">{query ? "No matching payment found." : "Start typing to search payment records."}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentLookup;
