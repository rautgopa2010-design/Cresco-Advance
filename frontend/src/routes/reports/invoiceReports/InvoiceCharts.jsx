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

const COLORS = ["#053054", "#0E7490", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const InvoiceCharts = ({ invoices }) => {
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        companyName: "",
    });

    // Responsive Pie Radius
    const [pieRadius, setPieRadius] = useState(110);
    useEffect(() => {
        const updateRadius = () => setPieRadius(window.innerWidth < 768 ? 80 : 110);
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // Extract unique values for filters
    const companies = useMemo(() => [...new Set(invoices.map(inv => inv.selectedCompany).filter(Boolean))], [invoices]);

    // Helper: Parse invoice date (format: "DD-MM-YYYY")
    const parseInvoiceDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-");
        return new Date(`${year}-${month}-${day}`);
    };

    // Filtered Invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const invoiceDate = parseInvoiceDate(invoice.date);
            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;

            const dateInRange = (!from || (invoiceDate && invoiceDate >= from)) && (!to || (invoiceDate && invoiceDate <= to));

            return (
                dateInRange &&
                (!filters.companyName || invoice.selectedCompany === filters.companyName) &&
                (!filters.paymentStatus || invoice.paymentStatus === filters.paymentStatus)
            );
        });
    }, [invoices, filters]);

    // 1. Company-wise Invoice Count
    const companyWiseData = useMemo(() => {
        const counts = {};
        filteredInvoices.forEach(inv => {
            const company = inv.selectedCompany || "Unknown";
            counts[company] = (counts[company] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [filteredInvoices]);

    // 2. Interstate vs Intrastate Invoices
    const gstTypeData = useMemo(() => {
        const counts = { Interstate: 0, Intrastate: 0 };
        filteredInvoices.forEach(inv => {
            const hasInter = inv.productInvoiceDetails?.interstate?.length > 0;
            const hasIntra = inv.productInvoiceDetails?.intrastate?.length > 0;

            if (hasInter && !hasIntra) counts.Interstate++;
            else if (hasIntra && !hasInter) counts.Intrastate++;
            else if (hasInter && hasIntra) counts.Interstate++; // prioritize interstate if mixed
        });

        return Object.entries(counts)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [filteredInvoices]);

    // 3. Monthly Invoice Trend
    const monthlyData = useMemo(() => {
        const counts = {};
        filteredInvoices.forEach(inv => {
            const date = parseInvoiceDate(inv.date);
            if (date) {
                const key = date.toLocaleString("en-US", { month: "short", year: "numeric" });
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => new Date(a.name + ", 1") - new Date(b.name + ", 1"));
    }, [filteredInvoices]);

    // 4. Top Products by Quantity
    const topProductsData = useMemo(() => {
        const productCount = {};
        filteredInvoices.forEach(inv => {
            const intrastate = inv.productInvoiceDetails?.intrastate || [];
            const interstate = inv.productInvoiceDetails?.interstate || [];
            [...intrastate, ...interstate].forEach(item => {
                const productName = item.product || "Unknown Product";
                const qty = Number(item.quantity || 0);
                productCount[productName] = (productCount[productName] || 0) + qty;
            });
        });

        return Object.entries(productCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [filteredInvoices]);

    // 5. Total Revenue Trend (Monthly)
    const revenueData = useMemo(() => {
        const revenue = {};
        filteredInvoices.forEach(inv => {
            const date = parseInvoiceDate(inv.date);
            if (date) {
                const key = date.toLocaleString("en-US", { month: "short", year: "numeric" });
                const amount = parseFloat(inv.finalAmt) || 0;
                revenue[key] = (revenue[key] || 0) + amount;
            }
        });
        return Object.entries(revenue)
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .sort((a, b) => new Date(a.name + ", 1") - new Date(b.name + ", 1"));
    }, [filteredInvoices]);

    return (
        <div className="space-y-6 p-6">
            {/* Filters */}
            <div className="rounded-xl border bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-[#053054]">🔎 Filters</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={filters.fromDate}
                        onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        className="w-full lg:w-60"
                    />
                    <TextField
                        label="To Date"
                        type="date"
                        size="small"
                        value={filters.toDate}
                        onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        className="w-full lg:w-60"
                    />
                    <Autocomplete
                        options={["All Companies", ...companies]}
                        value={filters.companyName || "All Companies"}
                        onChange={(e, val) => setFilters({ ...filters, companyName: val === "All Companies" ? "" : val })}
                        renderInput={params => <TextField {...params} label="Company" size="small" />}
                        className="w-full lg:w-60"
                    />
                    <Button
                        variant="text"
                        className="flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-white"
                        onClick={() => setFilters({ fromDate: "", toDate: "", companyName: "", paymentStatus: "" })}
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* Charts Grid */}
            <div id="invoiceChart" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Company-wise Invoices */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Companies by Invoice Count</h3>
                    {companyWiseData.length === 0 ? <p className="text-gray-400">No data</p> :
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={companyWiseData} margin={{ bottom: 80 }}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#053054" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* GST Type (Interstate vs Intrastate) */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">GST Type Distribution</h3>
                    {gstTypeData.length === 0 ? <p className="text-gray-400">No data</p> :
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={gstTypeData} dataKey="value" nameKey="name" outerRadius={pieRadius} label>
                                    {gstTypeData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* Monthly Invoice Trend */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Monthly Invoice Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products by Quantity */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Top 10 Products (by Quantity)</h3>
                    {topProductsData.length === 0 ? <p className="text-gray-400">No product data</p> :
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topProductsData} margin={{ bottom: 100 }}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={120} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* Monthly Revenue Trend */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Monthly Revenue (₹)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                            <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default InvoiceCharts;