import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getQuotations } from "../../redux/actions/quotation";
import { CircularProgress, IconButton, Divider, Card, CardContent } from "@mui/material";
import { ArrowLeft, Building2, User, Phone, Mail, Calendar, MapPin, IndianRupee, FileText } from "lucide-react";

const ViewQuotation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { quotations, loading } = useSelector((state) => state.quotation);

    useEffect(() => {
        dispatch(getQuotations());
    }, [dispatch]);

    const quotation = quotations.find((q) => String(q.id) === String(id));

    if (loading || !quotation) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <CircularProgress />
            </div>
        );
    }

    const intrastate = quotation.productQuotationDetails?.intrastate || [];
    const interstate = quotation.productQuotationDetails?.interstate || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8f1ff] via-white to-[#f0e8ff] px-0 md:px-0 lg:px-8">
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
                    Quotation Details
                </h1>
            </div>

            {/* MAIN CARD */}
            <Card className="rounded-3xl border border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
                <CardContent>
                    {/* TOP GRID */}
                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <Building2 className="text-orange-700" />,
                                label: "Company",
                                value: quotation.companyName,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <User className="text-green-700" />,
                                label: "Customer Person",
                                value: quotation.customerPerson,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <Phone className="text-sky-700" />,
                                label: "Mobile",
                                value: quotation.mobile,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },
                            {
                                icon: <Mail className="text-orange-700" />,
                                label: "Email",
                                value: quotation.email,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Quotation Date",
                                value: quotation.date,
                                gradient: "from-[#f3e8ff] to-[#ede9fe]",
                            },
                            {
                                icon: <IndianRupee className="text-green-700" />,
                                label: "Final Amount",
                                value: `₹ ${quotation.finalAmt}`,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <FileText className="text-sky-700" />,
                                label: "GSTIN No.",
                                value: quotation.gstinNo,
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

                    <Divider className="my-10" />

                    {/* ADDRESS */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Address Details
                    </h2>

                    <div className="grid gap-7 md:grid-cols-2">
                        {/* Billing Address */}
                        <div className="rounded-2xl border bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-md transition-all hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-red-700" />
                                <h3 className="text-lg font-semibold text-red-900">Billing Address</h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {quotation.billingAddress.street || "-"}, {quotation.billingAddress.city || "-"},{" "}
                                {quotation.billingAddress.zone || "-"}, {quotation.billingAddress.state || "-"},{" "}
                                {quotation.billingAddress.country || "-"} – {quotation.billingAddress.pincode || "-"}
                            </p>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-2xl border bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-md transition-all hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-green-700" />
                                <h3 className="text-lg font-semibold text-green-900">Shipping Address</h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {quotation.shippingAddress.street || "-"}, {quotation.shippingAddress.city || "-"},{" "}
                                {quotation.shippingAddress.zone || "-"}, {quotation.shippingAddress.state || "-"},{" "}
                                {quotation.shippingAddress.country || "-"} – {quotation.shippingAddress.pincode || "-"}
                            </p>
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* PRODUCT DETAILS */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Product Quotation Details
                    </h2>

                    {/* ---------- INTRASTATE ---------- */}
                    {intrastate.length > 0 && (
                        <>
                            <h3 className="my-4 whitespace-nowrap text-xl font-bold text-green-700">Intrastate Products</h3>

                            <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 overflow-x-auto rounded-2xl border bg-white shadow-lg">
                                <table className="w-full whitespace-nowrap text-left">
                                    <thead className="bg-[#eef2ff] text-gray-700">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Brand</th>
                                            <th className="p-4">HSN</th>
                                            <th className="p-4">Qty</th>
                                            <th className="p-4">Unit</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">GST</th>
                                            <th className="p-4">Subtotal</th>
                                            <th className="p-4">Total</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {intrastate.map((item, i) => (
                                            <tr
                                                key={i}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-4">{item.product}</td>
                                                <td className="p-4">{item.productBrand}</td>
                                                <td className="p-4">{item.hsnCode}</td>
                                                <td className="p-4">{item.quantity}</td>
                                                <td className="p-4">{item.unit}</td>
                                                <td className="p-4">₹ {item.pricePerUnit}</td>
                                                <td className="p-4">
                                                    CGST {item.cgst}% + SGST {item.sgst}%
                                                </td>
                                                <td className="p-4">₹ {item.subTotal}</td>
                                                <td className="p-4">₹ {item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Divider className="my-10" />
                        </>
                    )}

                    {/* ---------- INTERSTATE ---------- */}
                    {interstate.length > 0 && (
                        <>
                            <h3 className="my-4 whitespace-nowrap text-xl font-bold text-blue-700">Interstate Products</h3>

                            <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 overflow-x-auto rounded-2xl border bg-white shadow-lg">
                                <table className="w-full whitespace-nowrap text-left">
                                    <thead className="bg-[#eef2ff] text-gray-700">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Brand</th>
                                            <th className="p-4">HSN</th>
                                            <th className="p-4">Qty</th>
                                            <th className="p-4">Unit</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">GST</th>
                                            <th className="p-4">Subtotal</th>
                                            <th className="p-4">Total</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {interstate.map((item, i) => (
                                            <tr
                                                key={i}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-4">{item.product}</td>
                                                <td className="p-4">{item.productBrand}</td>
                                                <td className="p-4">{item.hsnCode}</td>
                                                <td className="p-4">{item.quantity}</td>
                                                <td className="p-4">{item.unit}</td>
                                                <td className="p-4">₹ {item.pricePerUnit}</td>
                                                <td className="p-4">IGST {item.igst}%</td>
                                                <td className="p-4">₹ {item.subTotal}</td>
                                                <td className="p-4">₹ {item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Divider className="my-10" />
                        </>
                    )}

                    {/* Assigned To */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Assigned To
                    </h2>

                    <div className="rounded-xl border bg-gradient-to-r from-[#f3f4f6] to-[#e5e7eb] p-5 shadow-md backdrop-blur-xl transition-all hover:shadow-xl">
                        <div className="flex flex-wrap gap-2">
                            {quotation.assignedTo.map((name, i) => (
                                <span
                                    key={i}
                                    className="rounded-full bg-gradient-to-r from-[#053054] to-[#4a28ce] px-4 py-1 text-sm text-white shadow-md"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* Terms and Conditions */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-2xl font-bold text-transparent">
                        Terms & Conditions
                    </h2>

                    <div
                        className="rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-md"
                        dangerouslySetInnerHTML={{ __html: quotation.termsAndConditions }}
                    />

                    <Divider className="my-10" />

                    {/* Description */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-2xl font-bold text-transparent">
                        Description
                    </h2>

                    <div
                        className="rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-md"
                        dangerouslySetInnerHTML={{ __html: quotation.description }}
                    />

                    <Divider className="my-10" />

                    {/* Timestamp Section */}
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                        {[
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Created At",
                                value: new Date(quotation.createdAt).toLocaleString(),
                            },
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Updated At",
                                value: new Date(quotation.updatedAt).toLocaleString(),
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-md backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl"
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

export default ViewQuotation;
