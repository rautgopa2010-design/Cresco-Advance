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

const RegisteredCustomersCharts = ({ organizationInfo }) => {
    const [filters, setFilters] = useState({
        company: "",
        customerName: "",
        mobile: "",
        email: "",
        package: "",
        fromDate: "",
        toDate: "",
    });

    const customers = organizationInfo?.organizations || [];

    // ----------------- RESPONSIVE PIE CHART SIZE ------------------
    const [pieRadius, setPieRadius] = useState(120);
    useEffect(() => {
        const updateRadius = () => setPieRadius(window.innerWidth < 768 ? 90 : 120);
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // ----------------- FULL NAME LIST ------------------
    const customerNameList = useMemo(
        () => customers.map(c => c.customerName || ""),
        [customers]
    );

    // ----------------- FILTER DATA ------------------
    const filtered = useMemo(() => {
        return customers.filter((c, i) => {
            const customerName = customerNameList[i].toLowerCase();
            const createdAtDate = new Date(c.createdAt);
            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;
            const dateMatch = (!from || createdAtDate >= from) && (!to || createdAtDate <= to);

            return (
                (!filters.company || c.company?.toLowerCase().includes(filters.company.toLowerCase())) &&
                (!filters.customerName || customerName.includes(filters.customerName.toLowerCase())) &&
                (!filters.mobile || c.mobile?.includes(filters.mobile)) &&
                (!filters.email || c.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
                (!filters.package || c.package?.toLowerCase().includes(filters.package.toLowerCase())) &&
                dateMatch
            );
        });
    }, [filters, customers, customerNameList]);

    // ----------------- PACKAGE PIE DATA ------------------
    const packageData = useMemo(() => {
        const packageCounts = {};
        filtered.forEach((c) => {
            const key = c.package || "Unknown";
            packageCounts[key] = (packageCounts[key] || 0) + 1;
        });
        return Object.entries(packageCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- PAYMENT STATUS PIE DATA ------------------
    const paymentStatusData = useMemo(() => {
        const statusCounts = {};
        filtered.forEach((c) => {
            const key = c.paymentStatus || "Unknown";
            statusCounts[key] = (statusCounts[key] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- MONTH BAR DATA ------------------
    const monthData = useMemo(() => {
        const monthCounts = {};
        filtered.forEach((c) => {
            if (!c.createdAt) return;
            const month = new Date(c.createdAt).toLocaleString("en-US", { month: "short" });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });
        return Object.entries(monthCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // Get unique packages for filter dropdown
    const uniquePackages = [...new Set(customers.map(c => c.package).filter(Boolean))];

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
                        options={["All Companies", ...new Set(customers.map(c => c.company).filter(Boolean))]}
                        value={filters.company || null}
                        onChange={(e, val) => setFilters({ ...filters, company: val === "All Companies" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Select Company" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Customer Name */}
                    <Autocomplete
                        freeSolo
                        disablePortal
                        options={customerNameList}
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
                    {/* Email */}
                    <TextField
                        label="Email"
                        size="small"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                        className="w-full lg:w-60"
                    />
                    {/* Package */}
                    <Autocomplete
                        disablePortal
                        options={["All Packages", ...uniquePackages]}
                        value={filters.package || null}
                        onChange={(e, val) => setFilters({ ...filters, package: val === "All Packages" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Select Package" size="small" />}
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
                            email: "",
                            package: "",
                            fromDate: "", 
                            toDate: "" 
                        })}
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* CHARTS */}
            <div id="registeredCustomersChart" className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Package Pie Chart */}
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
                    <h3 className="mb-4 text-lg font-medium">Payment Status Distribution</h3>
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

                {/* Bar Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg lg:col-span-2">
                    <h3 className="mb-4 text-lg font-medium">Monthly Registrations</h3>
                    {monthData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthData} barCategoryGap={25}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
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

export default RegisteredCustomersCharts;