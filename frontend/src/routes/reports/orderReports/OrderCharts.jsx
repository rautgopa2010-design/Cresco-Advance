import React, { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { TextField, Autocomplete } from "@mui/material";

const COLORS = ["#053054", "#0E7490", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const OrderCharts = ({ orders }) => {
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        companyName: "",
        status: "",
        zone: "",
    });

    // Responsive Pie Radius
    const [pieRadius, setPieRadius] = useState(110);
    useEffect(() => {
        const updateRadius = () => setPieRadius(window.innerWidth < 768 ? 80 : 110);
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // Extract unique values
    const companies = useMemo(() => [...new Set(orders.map(o => o.selectedCompany).filter(Boolean))], [orders]);
    const zones = useMemo(() => [...new Set(orders.map(o => o.billingAddress?.zone).filter(Boolean))], [orders]);
    const statuses = useMemo(() => [...new Set(orders.map(o => o.status).filter(Boolean))], [orders]);

    // Filtered Orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;

            const dateInRange = (!from || orderDate >= from) && (!to || orderDate <= to);

            return (
                dateInRange &&
                (!filters.companyName || order.selectedCompany === filters.companyName) &&
                (!filters.status || order.status === filters.status) &&
                (!filters.zone || order.billingAddress?.zone === filters.zone)
            );
        });
    }, [orders, filters]);

    // 1. Zone-wise Orders
    const zoneData = useMemo(() => {
        const counts = {};
        filteredOrders.forEach(o => {
            const zone = o.billingAddress?.zone || "Unknown";
            counts[zone] = (counts[zone] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredOrders]);

    // 2. Interstate vs Intrastate (Fixed: One order = one type only)
    const gstTypeData = useMemo(() => {
        const counts = { Interstate: 0, Intrastate: 0 };

        filteredOrders.forEach(order => {
            const hasInter = order.productOrderDetails?.interstate?.length > 0;
            const hasIntra = order.productOrderDetails?.intrastate?.length > 0;

            if (hasInter && !hasIntra) counts.Interstate++;
            else if (hasIntra && !hasInter) counts.Intrastate++;
            else if (hasInter && hasIntra) {
                // If both exist → consider as Interstate (common practice) or split logic
                counts.Interstate++;
            }
        });

        return Object.entries(counts)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);

    // 3. Monthly Orders Trend
    const monthlyData = useMemo(() => {
        const counts = {};
        filteredOrders.forEach(o => {
            const date = new Date(o.createdAt);
            const key = date.toLocaleString("en-US", { month: "short", year: "numeric" });
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => new Date(a.name + ", 1") - new Date(b.name + ", 1"));
    }, [filteredOrders]);

    // 4. Order Status Distribution (Replaced Payment Status)
    const orderStatusData = useMemo(() => {
        const counts = {};
        filteredOrders.forEach(o => {
            const status = o.status || "Unknown";
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredOrders]);

    // 5. Top Products Ordered (by Quantity) - NEW REPLACEMENT
    const topProductsData = useMemo(() => {
        const productCount = {};
        filteredOrders.forEach((order) => {
            const interstate = order.productOrderDetails?.interstate || [];
            const intrastate = order.productOrderDetails?.intrastate || [];
            [...interstate, ...intrastate].forEach((item) => {
                const productName = item.product || "Unknown Product";
                const qty = Number(item.quantity || 1);
                productCount[productName] = (productCount[productName] || 0) + qty;
            });
        });

        return Object.entries(productCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [filteredOrders]);  

    return (
        <div className="space-y-6 p-6">
            {/* Filters */}
            <div className="rounded-xl border bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-[#053054]">🔎 Filters</h2>
            <div className="flex flex-wrap items-center gap-4">
                    <TextField label="From Date" type="date" size="small" value={filters.fromDate}
                        onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                        InputLabelProps={{ shrink: true }} className="w-full lg:w-60" />

                    <TextField label="To Date" type="date" size="small" value={filters.toDate}
                        onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                        InputLabelProps={{ shrink: true }} className="w-full lg:w-60" />

                    <Autocomplete options={["All Companies", ...companies]}
                        value={filters.companyName || "All Companies"}
                        onChange={(e, val) => setFilters({ ...filters, companyName: val === "All Companies" ? "" : val })}
                        renderInput={params => <TextField {...params} label="Company" size="small" />}
                        className="w-full lg:w-60" />

                    <Autocomplete options={["All Status", ...statuses]}
                        value={filters.status || "All Status"}
                        onChange={(e, val) => setFilters({ ...filters, status: val === "All Status" ? "" : val })}
                        renderInput={params => <TextField {...params} label="Order Status" size="small" />}
                        className="w-full lg:w-60" />

                    <Autocomplete options={["All Zones", ...zones]}
                        value={filters.zone || "All Zones"}
                        onChange={(e, val) => setFilters({ ...filters, zone: val === "All Zones" ? "" : val })}
                        renderInput={params => <TextField {...params} label="Zone" size="small" />}
                        className="w-full lg:w-60" />

                    <Button variant="text" className="flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-white"
                        onClick={() => setFilters({ fromDate: "", toDate: "", companyName: "", status: "", zone: "" })}>
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* Charts Grid */}
            <div id="orderChart" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Zone-wise Orders */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Zone-wise Orders</h3>
                    {zoneData.length === 0 ? <p className="text-gray-400">No data</p> :
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={zoneData} dataKey="value" nameKey="name" outerRadius={pieRadius} label>
                                    {zoneData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* GST Type Distribution */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">GST Type (Interstate vs Intrastate)</h3>
                    {gstTypeData.length === 0 ? <p className="text-gray-400">No data</p> :
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={gstTypeData} dataKey="value" nameKey="name" outerRadius={pieRadius} label>
                                    {gstTypeData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* Order Status Distribution */}
                <div className="rounded-xl border bg-white p-5 shadow-lg lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Order Status Distribution</h3>
                    {orderStatusData.length === 0 ? <p className="text-gray-400">No data</p> :
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={orderStatusData} dataKey="value" nameKey="name" outerRadius={pieRadius} label>
                                    {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>

                {/* Monthly Orders Trend */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Monthly Orders Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#053054" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products Ordered (by Quantity) */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Products Ordered (by Quantity)</h3>

                    {topProductsData.length === 0 ? (
                        <p className="text-gray-400">No product data available</p>
                    ) : (
                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >
                            <BarChart
                                data={topProductsData}
                                margin={{ left: 20, right: 20, bottom: 80 }}
                            >
                                {/* X-axis will show product names */}
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                />

                                {/* Y-axis will be quantities */}
                                <YAxis allowDecimals={false} />

                                <Tooltip />

                                <Bar
                                    dataKey="value"
                                    fill="#0E7490"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCharts;