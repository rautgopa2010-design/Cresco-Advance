import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTickets } from "../../redux/actions/ticket";
import { CircularProgress, IconButton, Divider, Card, CardContent } from "@mui/material";
import { ArrowLeft, User, Calendar, ClipboardList, MapPin, FileText } from "lucide-react";

// Safe JSON parser
const safeParse = (val) => {
    try {
        return val ? JSON.parse(val) : null;
    } catch {
        return null;
    }
};

const ViewTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { ticket: tickets, loading } = useSelector((state) => state.ticket);

    useEffect(() => {
        dispatch(getTickets());
    }, [dispatch]);

    const ticket = tickets?.find((t) => String(t.id) === String(id));

    if (loading || !ticket) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <CircularProgress />
            </div>
        );
    }

    const order = ticket.orderData;
    const billing = safeParse(order?.billingAddress);
    const shipping = safeParse(order?.shippingAddress);
    const productDetails = safeParse(order?.productOrderDetails);
    const intrastate = productDetails?.intrastate || [];
    const interstate = productDetails?.interstate || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8f1ff] via-white to-[#f0e8ff] px-0 lg:px-8">
            {/* HEADER */}
            <div className="mb-7 flex items-center gap-4 pt-6">
                <IconButton
                    onClick={() => navigate(-1)}
                    className="rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:bg-gray-100"
                >
                    <ArrowLeft
                        size={22}
                        className="text-[#053054]"
                    />
                </IconButton>

                <h1 className="bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
                    Ticket Details
                </h1>
            </div>

            {/* MAIN CARD */}
            <Card className="rounded-3xl border border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
                <CardContent>
                    {/* TOP GRID (Ticket Info) */}
                    <div className="mb-5 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <ClipboardList className="text-orange-700" />,
                                label: "Title",
                                value: ticket.title,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <User className="text-green-700" />,
                                label: "Service",
                                value: ticket.service,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <FileText className="text-sky-700" />,
                                label: "Priority",
                                value: ticket.priority,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },
                            {
                                icon: <User className="text-purple-700" />,
                                label: "Status",
                                value: ticket.status,
                                gradient: "from-purple-50 to-purple-100",
                            },
                            {
                                icon: <Calendar className="text-green-700" />,
                                label: "Created Date",
                                value: ticket.createdDate,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <Calendar className="text-sky-700" />,
                                label: "Due Date",
                                value: ticket.dueDate,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border border-white/60 bg-gradient-to-br ${item.gradient} p-5 shadow-md backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-2xl`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h2 className="text-[15px] font-semibold text-gray-800">{item.label}</h2>
                                </div>
                                <p className="mt-2 text-[15px] text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Assigned To */}
                    <h2 className="mb-4 bg-gradient-to-r from-[#5b2be3] to-[#053054] bg-clip-text text-2xl font-bold text-transparent">
                        Assigned To
                    </h2>

                    <div className="mb-5 rounded-xl border bg-gradient-to-r from-[#f3f4f6] to-[#e5e7eb] p-5 shadow-md">
                        <div className="flex flex-wrap gap-2">
                            {ticket.assignedTo?.map((name, i) => (
                                <span
                                    key={i}
                                    className="rounded-full bg-gradient-to-r from-[#053054] to-[#4a28ce] px-4 py-1 text-sm text-white shadow-md"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* STOP HERE IF NO ORDER DATA */}
                    <div className="card">
                        {!order ? (
                            <>
                                <h2 className="mb-5 mt-5 text-center text-xl font-semibold text-gray-700">No Order Attached to this Ticket</h2>
                            </>
                        ) : (
                            <>
                                {/* ORDER DETAILS */}
                                <h2 className="mb-4 bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-2xl font-bold text-transparent">
                                    Order Details
                                </h2>

                                <div className="mb-5 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                                    {[
                                        { label: "Order ID", value: order.id },
                                        { label: "Company", value: order.selectedCompany },
                                        { label: "Customer Person", value: order.customerPerson },
                                        { label: "Email", value: order.email },
                                        { label: "Mobile", value: order.mobile },
                                        { label: "Order Date", value: order.date },
                                        { label: "Status", value: order.status },
                                        { label: "Final Amount", value: order.finalAmt },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl border bg-gradient-to-br from-[#f9fafb] to-[#eef2ff] p-5 shadow-md hover:scale-[1.02]"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
                                            <p className="mt-1 text-[15px] text-gray-800">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* BILLING & SHIPPING */}
                                <h2 className="mb-4 bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-2xl font-bold text-transparent">
                                    Address Details
                                </h2>

                                <div className="mb-5 grid gap-7 md:grid-cols-1 lg:grid-cols-2">
                                    {/* Billing Address */}
                                    <div className="rounded-2xl border bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-md hover:scale-[1.01]">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="text-red-700" />
                                            <h3 className="text-lg font-semibold text-red-900">Billing Address</h3>
                                        </div>

                                        {billing ? (
                                            <p className="mt-4 leading-relaxed text-gray-700">
                                                {billing.street}, {billing.city}, {billing.state}, {billing.country} - {billing.pincode}
                                            </p>
                                        ) : (
                                            <p className="mt-4 text-gray-600">No billing address</p>
                                        )}
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="rounded-2xl border bg-gradient-to-br from-lime-50 to-lime-100 p-6 shadow-md hover:scale-[1.01]">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="text-lime-700" />
                                            <h3 className="text-lg font-semibold text-lime-900">Shipping Address</h3>
                                        </div>

                                        {shipping ? (
                                            <p className="mt-4 leading-relaxed text-gray-700">
                                                {shipping.street}, {shipping.city}, {shipping.state}, {shipping.country} - {shipping.pincode}
                                            </p>
                                        ) : (
                                            <p className="mt-4 text-gray-600">No shipping address</p>
                                        )}
                                    </div>
                                </div>

                                {/* PRODUCT TABLES */}
                                <h2 className="mb-5 bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-2xl font-bold text-transparent">
                                    Product Details
                                </h2>

                                {/* Intrastate Table */}
                                <h3 className="mb-2 text-lg font-semibold text-gray-700">Intrastate Products</h3>
                                {intrastate.length ? (
                                    <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
                                        <table className="min-w-full text-nowrap text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    {["Brand", "Category", "SubCategory", "Product", "Qty", "Price", "CGST", "SGST", "Total"].map(
                                                        (h) => (
                                                            <th
                                                                key={h}
                                                                className="border px-3 py-2 text-left"
                                                            >
                                                                {h}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {intrastate.map((p, i) => (
                                                    <tr key={i}>
                                                        <td className="border px-3 py-2">{p.productBrand}</td>
                                                        <td className="border px-3 py-2">{p.productCategory}</td>
                                                        <td className="border px-3 py-2">{p.productSubCategory}</td>
                                                        <td className="border px-3 py-2">{p.product}</td>
                                                        <td className="border px-3 py-2">{p.quantity}</td>
                                                        <td className="border px-3 py-2">{p.pricePerUnit}</td>
                                                        <td className="border px-3 py-2">{p.cgstAmt}</td>
                                                        <td className="border px-3 py-2">{p.sgstAmt}</td>
                                                        <td className="border px-3 py-2">{p.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="mb-6 text-gray-600">No intrastate products</p>
                                )}

                                {/* Interstate Table */}
                                <h3 className="mb-2 mt-10 text-lg font-semibold text-gray-700">Interstate Products</h3>
                                {interstate.length ? (
                                    <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
                                        <table className="min-w-full text-nowrap text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    {["Brand", "Category", "SubCategory", "Product", "Qty", "Price", "IGST", "Total"].map((h) => (
                                                        <th
                                                            key={h}
                                                            className="border px-3 py-2 text-left"
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {interstate.map((p, i) => (
                                                    <tr key={i}>
                                                        <td classname="border px-3 py-2">{p.productBrand}</td>
                                                        <td className="border px-3 py-2">{p.productCategory}</td>
                                                        <td className="border px-3 py-2">{p.productSubCategory}</td>
                                                        <td className="border px-3 py-2">{p.product}</td>
                                                        <td className="border px-3 py-2">{p.quantity}</td>
                                                        <td className="border px-3 py-2">{p.pricePerUnit}</td>
                                                        <td className="border px-3 py-2">{p.igstAmt}</td>
                                                        <td className="border px-3 py-2">{p.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No interstate products</p>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* TIMESTAMPS */}
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                        {[
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Created At",
                                value: new Date(ticket.createdAt).toLocaleString(),
                            },
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Updated At",
                                value: new Date(ticket.updatedAt).toLocaleString(),
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h3 className="text-lg font-semibold text-purple-800">{item.label}</h3>
                                </div>
                                <p className="mt-4 text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ViewTicket;
