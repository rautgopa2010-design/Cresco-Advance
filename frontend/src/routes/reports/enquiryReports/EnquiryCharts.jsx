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

const EnquiryCharts = ({ customers }) => {
    const [filters, setFilters] = useState({
        companyName: "",
        contactPerson: "",
        mobile: "",
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

    // ----------------- FULL NAME LIST ------------------
    const fullNameList = useMemo(
        () => customers.map(c => `${c.salutation || ""} ${c.firstName || ""} ${c.middleName || ""} ${c.lastName || ""}`.trim()),
        [customers]
    );

    // ----------------- FILTER DATA ------------------
    const filtered = useMemo(() => {
        return customers.filter((c, i) => {
            const fullName = fullNameList[i].toLowerCase();

            const createdAtDate = new Date(c.createdAt);
            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;
            const dateMatch = (!from || createdAtDate >= from) && (!to || createdAtDate <= to);

            return (
                (!filters.companyName || c.companyName?.toLowerCase().includes(filters.companyName.toLowerCase())) &&
                (!filters.contactPerson || fullName.includes(filters.contactPerson.toLowerCase())) &&
                (!filters.mobile || c.mobile?.includes(filters.mobile)) &&
                dateMatch
            );
        });
    }, [filters, customers, fullNameList]);

    // ----------------- CITY PIE DATA ------------------
    const cityData = useMemo(() => {
        const cityCounts = {};
        filtered.forEach((c) => {
            const key = c.billingCity || "Unknown";
            cityCounts[key] = (cityCounts[key] || 0) + 1;
        });
        return Object.entries(cityCounts).map(([name, value]) => ({ name, value }));
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
                        options={["All Companies", ...new Set(customers.map(c => c.companyName).filter(Boolean))]}
                        value={filters.companyName || null}
                        onChange={(e, val) => setFilters({ ...filters, companyName: val === "All Companies" ? "" : val || "" })}
                        renderInput={(params) => <TextField {...params} label="Select Company" size="small" />}
                        className="w-full lg:w-60"
                    />
                    {/* Contact Person */}
                    <Autocomplete
                        freeSolo
                        disablePortal
                        options={fullNameList}
                        value={filters.contactPerson || ""}
                        onChange={(e, val) => setFilters({ ...filters, contactPerson: val || "" })}
                        renderInput={(params) => <TextField {...params} label="Contact Person" size="small" />}
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
                    {/* Reset */}
                    <Button
                        variant="text"
                        className="flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-white"
                        onClick={() => setFilters({ companyName: "", contactPerson: "", mobile: "", fromDate: "", toDate: "" })}
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* CHARTS */}
            <div id="enquiryChart" className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Pie Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">City Wise Enquiries</h3>
                    {cityData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={cityData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {cityData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                {/* Bar Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Monthly Enquiries</h3>
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

export default EnquiryCharts;
