import React from "react";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendingUp, Users, Building2, AlertCircle, IndianRupee, Ticket, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProviderCards = ({ providerDashData }) => {
    const navigate = useNavigate();
    console.log(providerDashData);

    // const formatCurrency = (value) => {
    //     if (typeof value === "string" && value.startsWith("₹")) {
    //         value = parseInt(value.replace(/[^0-9]/g, ""), 10);
    //     }
    //     return new Intl.NumberFormat("en-IN", {
    //         style: "currency",
    //         currency: "INR",
    //         minimumFractionDigits: 0,
    //         maximumFractionDigits: 0,
    //     }).format(value);
    // };

    const formatCurrency = (value) => {
        // If value is already a string with ₹ symbol, return it as is
        if (typeof value === "string" && value.startsWith("₹")) {
            return value;
        }
        // If it's a number, format it
        if (typeof value === "number") {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        }
        // If it's a string without ₹, try to parse it
        if (typeof value === "string") {
            const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(numValue)) {
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(numValue);
            }
        }
        return "₹0";
    };

    const handleCardClick = (route) => {
        navigate(route);
    };

    // Safely extract and default all potentially undefined arrays/objects
    const summaryCards = [
        {
            title: "Total Organizations",
            value: providerDashData?.summaryCards?.totalOrganizations?.toString() || "0",
            color: "from-indigo-500 to-blue-600",
            icon: Building2,
            route: "/provider/settings/master/organization",
        },
        {
            title: "Active / Activate Organizations",
            value: providerDashData?.summaryCards?.activeOrganizations?.toString() || "0",
            color: "from-emerald-500 to-teal-600",
            icon: Users,
            route: "/provider/registered-customers",
        },
        {
            title: "Expired",
            value: providerDashData?.summaryCards?.expired?.toString() || "0",
            color: "from-rose-500 to-pink-600",
            icon: AlertCircle,
            route: "/provider/registered-customers",
        },
        {
            title: "Total Revenue",
            value: providerDashData?.summaryCards?.totalRevenue || "₹0",
            color: "from-violet-500 to-purple-600",
            icon: IndianRupee,
            route: "/provider/registered-customers",
        },
        {
            title: "Deactivate",
            value: providerDashData?.summaryCards?.deactivate?.toString() || "0",
            color: "from-amber-500 to-orange-600",
            icon: AlertCircle,
            route: "/provider/registered-customers",
        },
        {
            title: "Escalated Tickets",
            value: providerDashData?.summaryCards?.escalatedTickets?.toString() || "0",
            color: "from-fuchsia-500 to-pink-600",
            icon: Ticket,
            route: "/provider/escalated-tickets",
        },
    ];

    const monthlyRevenue = [...(providerDashData?.monthlyRevenueTrend ?? [])]
        .sort((a, b) => {
            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        })
        .map((item) => ({
            month: item.month || "",
            revenue: item.revenue || 0,
        }));

    const revenueByPackage = providerDashData?.revenueByPackage ?? [];
    const activePackages = providerDashData?.activePackages ?? [];
    const escalatedTicketsStatus = providerDashData?.escalatedTicketsStatus ?? [];

    const expiries = (providerDashData?.upcomingExpiries ?? []).map((item) => ({
        label: item.label || "",
        value: item.value || 0,
        color: item.label?.includes("7 Days") ? "bg-rose-500" : item.label?.includes("30 Days") ? "bg-amber-500" : "bg-indigo-500",
    }));

    const recentRegistrations = providerDashData?.recentRegistrations ?? [];
    const recentPayments = providerDashData?.recentPayments ?? [];
    const recentEscalatedTickets = providerDashData?.recentEscalatedTickets ?? [];

    const COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];
    const PIE_COLORS = ["#C4B5FD", "#6EE7B7", "#FCD34D", "#FCA5A5"];

    // For upcoming expiries progress bar (avoid division by zero)
    const maxExpiryValue = expiries.length > 0 ? Math.max(...expiries.map((e) => e.value)) : 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-0 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 md:p-2 lg:p-6">
            <div className="animate-fadeIn mx-auto max-w-7xl space-y-12">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {summaryCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={i}
                                onClick={() => handleCardClick(card.route)}
                                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl dark:bg-gray-800/80"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90`} />
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                <div className="relative p-6 text-white">
                                    <div className="mb-4 flex items-center justify-between">
                                        <Icon className="h-10 w-10 opacity-90 drop-shadow-md" />
                                    </div>
                                    <p className="text-sm font-medium tracking-wide opacity-95">{card.title}</p>
                                    <h2 className="mt-3 text-4xl font-extrabold drop-shadow-lg">
                                        {card.title.includes("Revenue") ? formatCurrency(card.value) : card.value}
                                    </h2>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 transition-all duration-500 group-hover:h-2" />
                            </div>
                        );
                    })}
                </div>

                {/* Revenue & Package Breakdown */}
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                    <div className="hover:shadow-3xl rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl transition-all dark:bg-gray-800/90 xl:col-span-2">
                        <h3 className="mb-8 flex items-center gap-3 text-3xl font-bold text-gray-800 dark:text-white">
                            <TrendingUp className="h-8 w-8 text-indigo-600" />
                            Monthly Revenue Trend
                        </h3>
                        <ResponsiveContainer
                            width="100%"
                            height={360}
                        >
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient
                                        id="revGlow"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#818CF8"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="50%"
                                            stopColor="#6366F1"
                                            stopOpacity={0.4}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#4F46E5"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748B"
                                    fontSize={14}
                                />
                                <YAxis
                                    stroke="#64748B"
                                    fontSize={14}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => `Month: ${label}`}
                                    contentStyle={{ borderRadius: "12px", background: "rgba(0,0,0,0.8)", border: "none" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366F1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#revGlow)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
                        <h3 className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">Revenue by Package</h3>
                        <ResponsiveContainer
                            width="100%"
                            height={360}
                        >
                            <PieChart>
                                <Pie
                                    data={revenueByPackage}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={80}
                                    outerRadius={130}
                                    paddingAngle={6}
                                    stroke="none"
                                >
                                    {revenueByPackage.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                                            className="drop-shadow-lg"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: "12px", background: "rgba(0,0,0,0.8)" }} />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    formatter={(v) => <span className="font-semibold">{v}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Packages, Expiries, Tickets */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Active Packages */}
                    <div className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
                        <h3 className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">Active Packages</h3>
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <PieChart>
                                <defs>
                                    {/* Medium-vibrant radial gradients – balanced between dark and faint */}
                                    <radialGradient id="grad1">
                                        <stop
                                            offset="0%"
                                            stopColor="#C4B5FD"
                                            stopOpacity={1}
                                        />{" "}
                                        {/* Soft violet */}
                                        <stop
                                            offset="60%"
                                            stopColor="#A78BFA"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#8B5CF6"
                                            stopOpacity={0.7}
                                        />
                                    </radialGradient>
                                    <radialGradient id="grad2">
                                        <stop
                                            offset="0%"
                                            stopColor="#6EE7B7"
                                            stopOpacity={1}
                                        />{" "}
                                        {/* Fresh emerald */}
                                        <stop
                                            offset="60%"
                                            stopColor="#34D399"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#10B981"
                                            stopOpacity={0.7}
                                        />
                                    </radialGradient>
                                    <radialGradient id="grad3">
                                        <stop
                                            offset="0%"
                                            stopColor="#FDE68A"
                                            stopOpacity={1}
                                        />{" "}
                                        {/* Warm amber */}
                                        <stop
                                            offset="60%"
                                            stopColor="#FBBF24"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#F59E0B"
                                            stopOpacity={0.7}
                                        />
                                    </radialGradient>
                                    <radialGradient id="grad4">
                                        <stop
                                            offset="0%"
                                            stopColor="#FCA5A5"
                                            stopOpacity={1}
                                        />{" "}
                                        {/* Soft coral */}
                                        <stop
                                            offset="60%"
                                            stopColor="#F87171"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#EC4899"
                                            stopOpacity={0.7}
                                        />
                                    </radialGradient>
                                    <radialGradient id="grad5">
                                        <stop
                                            offset="0%"
                                            stopColor="#C7D2FE"
                                            stopOpacity={1}
                                        />{" "}
                                        {/* Light indigo */}
                                        <stop
                                            offset="60%"
                                            stopColor="#A5B4FC"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#818CF8"
                                            stopOpacity={0.7}
                                        />
                                    </radialGradient>
                                    <radialGradient id="grad6">
                                        <stop
                                            offset="0%"
                                            stopColor="#A7F3D0"
                                            stopOpacity={1}
                                        />{" "}
                                        {/* Mint green */}
                                        <stop
                                            offset="60%"
                                            stopColor="#6EE7B7"
                                            stopOpacity={0.9}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#10B981"
                                            stopOpacity={0.7}
                                        />
                                    </radialGradient>
                                </defs>

                                <Pie
                                    data={activePackages}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={110}
                                    stroke="#ffffff"
                                    strokeWidth={4}
                                >
                                    {activePackages.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={`url(#grad${(i % 6) + 1})`}
                                            className="drop-shadow-md transition-all duration-300 hover:brightness-105"
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        background: "rgba(0,0,0,0.85)",
                                        border: "none",
                                        color: "#fff",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                    }}
                                    formatter={(value) => `${value} organizations`}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    formatter={(value) => <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Upcoming Expiries */}
                    <div className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
                        <div className="mb-8 flex items-center gap-4">
                            <Calendar className="h-10 w-10 text-indigo-600" />
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Upcoming Expiries</h3>
                        </div>
                        <div className="space-y-8">
                            {expiries.map((e, i) => (
                                <div
                                    key={i}
                                    className="group"
                                >
                                    <div className="mb-3 flex justify-between">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{e.label}</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{e.value}</span>
                                    </div>
                                    <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
                                        <div
                                            className={`h-5 rounded-full ${e.color} shadow-lg transition-all duration-1000 ease-out group-hover:brightness-110`}
                                            style={{ width: `${(e.value / maxExpiryValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Escalated Tickets */}
                    <div className="rounded-3xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
                        <div className="mb-8 flex items-center gap-4">
                            <Ticket className="h-10 w-10 text-pink-600" />
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Escalated Tickets</h3>
                        </div>
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <PieChart>
                                <Pie
                                    data={escalatedTicketsStatus}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={70}
                                    outerRadius={100}
                                    stroke="none"
                                >
                                    {escalatedTicketsStatus.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card gap-7">
                    <div className="text-lg font-semibold text-[#433C50] md:text-xl lg:text-2xl">Recent Activitie's :</div>
                    {/* Top 5 Registered Organization's  */}
                    <div className="card">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Top 5 Registered Organization's :</div>
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300">Sr. No.</th>
                                        <th className="table-head border border-gray-300">Date</th>
                                        <th className="table-head border border-gray-300">Company Name</th>
                                        <th className="table-head border border-gray-300">Customer Name</th>
                                        <th className="table-head border border-gray-300">Package</th>
                                        <th className="table-head border border-gray-300">Mobile</th>
                                        <th className="table-head border border-gray-300">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {recentRegistrations.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-8 text-center text-gray-400"
                                            >
                                                No organization Registered Yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentRegistrations.map((org, index) => (
                                            <tr
                                                key={index}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{org.date || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.company || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.customerName || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.package || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.mobile || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.email || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Top 5 Payment's */}
                    <div className="card">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Top 5 Payment's :</div>
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300">Sr. No.</th>
                                        <th className="table-head border border-gray-300">Date</th>
                                        <th className="table-head border border-gray-300">Company Name</th>
                                        <th className="table-head border border-gray-300">Payment Id</th>
                                        <th className="table-head border border-gray-300">Order Id</th>
                                        <th className="table-head border border-gray-300">Email</th>
                                        <th className="table-head border border-gray-300">Amount</th>
                                        <th className="table-head border border-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {recentPayments.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="py-8 text-center text-gray-400"
                                            >
                                                No Payments Added Yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentPayments.map((payment, index) => (
                                            <tr
                                                key={index}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{payment.date || "-"}</td>
                                                <td className="table-cell border border-gray-300">{payment.company || "-"}</td>
                                                <td className="table-cell border border-gray-300">{payment.paymentId || "-"}</td>
                                                <td className="table-cell border border-gray-300">{payment.orderId || "-"}</td>
                                                <td className="table-cell border border-gray-300">{payment.email || "-"}</td>
                                                <td className="table-cell border border-gray-300 bg-green-200">{payment.amount || "-"}</td>
                                                <td className="table-cell border border-gray-300">{payment.status || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Top 5 Escalated Ticket's */}
                    <div className="card">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Top 5 Escalated Ticket's :</div>
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300">Sr. No.</th>
                                        <th className="table-head border border-gray-300">Date</th>
                                        <th className="table-head border border-gray-300">Company Name</th>
                                        <th className="table-head border border-gray-300">Ticket Id</th>
                                        <th className="table-head border border-gray-300">Title</th>
                                        <th className="table-head border border-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {recentEscalatedTickets.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="py-8 text-center text-gray-400"
                                            >
                                                No Escalated Ticket's Found Yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentEscalatedTickets.map((ticket, index) => (
                                            <tr
                                                key={index}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{ticket.date || "-"}</td>
                                                <td className="table-cell border border-gray-300">{ticket.company || "-"}</td>
                                                <td className="table-cell border border-gray-300">{ticket.ticketId || "-"}</td>
                                                <td className="table-cell border border-gray-300">{ticket.title || "-"}</td>
                                                <td className="table-cell border border-gray-300">{ticket.status || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderCards;
