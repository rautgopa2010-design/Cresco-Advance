import React, { useState, useMemo, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { TextField, Autocomplete } from "@mui/material";

const COLORS = ["#053054", "#0E7490", "#4B5563", "#F59E0B", "#84CC16", "#DC2626"];

const PaymentsCharts = ({ organizationInfo }) => {
    const [filters, setFilters] = useState({
        company: "",
        customerName: "",
        mobile: "",
        package: "",
        paymentMethod: "",
        paymentStatus: "",
        fromDate: "",
        toDate: "",
    });

    // ----------------- RESPONSIVE PIE CHART SIZE ------------------
    const [pieRadius, setPieRadius] = useState(120);
    useEffect(() => {
        const updateRadius = () => setPieRadius(window.innerWidth < 768 ? 90 : 120);
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // Extract all organizations from the main object
    const organizations = organizationInfo?.organizations || [];
    const allCustomers = organizationInfo?.id 
        ? [organizationInfo, ...organizations] 
        : organizations;

    // ----------------- FULL NAME LIST ------------------
    const fullNameList = useMemo(
        () => allCustomers.map(c => c.customerName || 
            `${c.firstName || ""} ${c.middleName || ""} ${c.lastName || ""}`.trim()),
        [allCustomers]
    );

    // ----------------- FILTER DATA ------------------
    const filtered = useMemo(() => {
        return allCustomers.filter((c, i) => {
            const fullName = fullNameList[i].toLowerCase();

            const createdAtDate = c.createdAt ? new Date(c.createdAt) : null;
            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;
            const dateMatch = (!createdAtDate) || 
                (!from || createdAtDate >= from) && 
                (!to || createdAtDate <= to);

            const paymentStatus = c.paymentStatus || c.accountActivity || "";

            return (
                (!filters.company || c.company?.toLowerCase().includes(filters.company.toLowerCase())) &&
                (!filters.customerName || fullName.includes(filters.customerName.toLowerCase())) &&
                (!filters.mobile || c.mobile?.includes(filters.mobile)) &&
                (!filters.package || c.package?.toLowerCase().includes(filters.package.toLowerCase())) &&
                (!filters.paymentMethod || c.paymentMethod?.toLowerCase().includes(filters.paymentMethod.toLowerCase())) &&
                (!filters.paymentStatus || paymentStatus.toLowerCase().includes(filters.paymentStatus.toLowerCase())) &&
                dateMatch
            );
        });
    }, [filters, allCustomers, fullNameList]);

    // ----------------- PACKAGE DISTRIBUTION PIE DATA ------------------
    const packageData = useMemo(() => {
        const packageCounts = {};
        filtered.forEach((c) => {
            const key = c.package || "No Package";
            packageCounts[key] = (packageCounts[key] || 0) + 1;
        });
        return Object.entries(packageCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- PAYMENT STATUS PIE DATA ------------------
    const paymentStatusData = useMemo(() => {
        const statusCounts = {};
        filtered.forEach((c) => {
            const key = c.paymentStatus || c.accountActivity || "Unknown";
            statusCounts[key] = (statusCounts[key] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- PAYMENT METHOD PIE DATA ------------------
    const paymentMethodData = useMemo(() => {
        const methodCounts = {};
        filtered.forEach((c) => {
            const key = c.paymentMethod || "Not Specified";
            methodCounts[key] = (methodCounts[key] || 0) + 1;
        });
        return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- MONTHLY REVENUE BAR DATA ------------------
    const monthlyRevenueData = useMemo(() => {
        const monthRevenue = {};
        filtered.forEach((c) => {
            if (!c.createdAt) return;
            const month = new Date(c.createdAt).toLocaleString("en-US", { month: "short" });
            const price = c.packageDetails?.price || 0;
            monthRevenue[month] = (monthRevenue[month] || 0) + price;
        });
        return Object.entries(monthRevenue).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // Get unique values for autocomplete
    const uniqueCompanies = [...new Set(allCustomers.map(c => c.company).filter(Boolean))];
    const uniquePackages = [...new Set(allCustomers.map(c => c.package).filter(Boolean))];
    const uniquePaymentMethods = [...new Set(allCustomers.map(c => c.paymentMethod).filter(Boolean))];
    const uniquePaymentStatuses = [...new Set(allCustomers.map(c => c.paymentStatus || c.accountActivity).filter(Boolean))];

    return (
        <div className="space-y-6 p-6">
            {/* FILTERS */}
            <div className="rounded-xl border bg-white p-5 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-[#053054]">🔎 Filters</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    
                    {/* From Date */}
                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="w-full lg:w-60"
                        InputLabelProps={{ shrink: true }}
                    />
                    {/* To Date */}
                    <TextField
                        label="To Date"
                        type="date"
                        size="small"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="w-full lg:w-60"
                        InputLabelProps={{ shrink: true }}
                    />
                    {/* Company */}
                    <Autocomplete
                        disablePortal
                        options={["All Companies", ...uniqueCompanies]}
                        value={filters.company || null}
                        onChange={(e, val) => setFilters({ ...filters, company: val === "All Companies" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Select Company" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Customer Name */}
                    <Autocomplete
                        freeSolo
                        disablePortal
                        options={fullNameList}
                        value={filters.customerName || ""}
                        onChange={(e, val) => setFilters({ ...filters, customerName: val || "" })}
                        renderInput={(params) => <TextField {...params} label="Customer Name" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Mobile */}
                    <TextField
                        label="Mobile"
                        size="small"
                        value={filters.mobile}
                        onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                        className="w-full lg:w-60"
                    />
                    {/* Package */}
                    <Autocomplete
                        disablePortal
                        options={["All Packages", ...uniquePackages]}
                        value={filters.package || null}
                        onChange={(e, val) => setFilters({ ...filters, package: val === "All Packages" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Package" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Payment Method */}
                    <Autocomplete
                        disablePortal
                        options={["All Methods", ...uniquePaymentMethods]}
                        value={filters.paymentMethod || null}
                        onChange={(e, val) => setFilters({ ...filters, paymentMethod: val === "All Methods" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Payment Method" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Payment Status */}
                    <Autocomplete
                        disablePortal
                        options={["All Statuses", ...uniquePaymentStatuses]}
                        value={filters.paymentStatus || null}
                        onChange={(e, val) => setFilters({ ...filters, paymentStatus: val === "All Statuses" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Payment Status" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Reset */}
                    <Button
                        variant="text"
                        className="flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-white"
                        onClick={() => setFilters({ 
                            company: "", 
                            customerName: "", 
                            mobile: "", 
                            package: "",
                            paymentMethod: "",
                            paymentStatus: "",
                            fromDate: "", 
                            toDate: "" 
                        })}
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* CHARTS */}
            <div id="paymentsChart" className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Package Distribution Pie Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Package Distribution</h3>
                    {packageData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={packageData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {packageData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Payment Status Pie Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Payment Status</h3>
                    {paymentStatusData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={paymentStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {paymentStatusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Payment Method Pie Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Payment Methods</h3>
                    {paymentMethodData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={paymentMethodData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {paymentMethodData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Monthly Revenue Bar Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Monthly Revenue (₹)</h3>
                    {monthlyRevenueData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyRevenueData} barCategoryGap={25}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip formatter={(value) => [`₹ ${value}`, "Revenue"]} />
                                <Legend />
                                <Bar dataKey="value" fill="#053054" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentsCharts;