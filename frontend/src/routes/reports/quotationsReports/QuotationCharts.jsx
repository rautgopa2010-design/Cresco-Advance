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

import { useDispatch, useSelector } from "react-redux";
import { getProduct } from "../../../redux/actions/product";

const COLORS = ["#053054", "#0E7490", "#4B5563", "#F59E0B", "#84CC16", "#DC2626", "#7C3AED", "#EC4899"];

const QuotationCharts = ({ quotations }) => {
    const dispatch = useDispatch();
    const { product: productList } = useSelector((state) => state.product);

    const [filters, setFilters] = useState({
        companyName: "",
        customerPerson: "",
        productName: "",
        fromDate: "",
        toDate: "",
    });

    // ----------------- FETCH PRODUCT LIST FROM REDUX ------------------
    useEffect(() => {
        dispatch(getProduct());
    }, [dispatch]);

    // ----------------- FLATTENED PRODUCT LIST ------------------
    const allProducts = useMemo(
        () =>
            productList.flatMap((p) =>
                (p.product || []).map((prodName) => ({
                    id: p.id,
                    brand: p.brand,
                    category: p.category,
                    subCategory: p.productSubCategoryName,
                    name: prodName,
                }))
            ),
        [productList]
    );

    // ----------------- RESPONSIVE PIE CHART SIZE ------------------
    const [pieRadius, setPieRadius] = useState(120);
    useEffect(() => {
        const updateRadius = () => setPieRadius(window.innerWidth < 768 ? 70 : 100);
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // ----------------- CUSTOMER LIST ------------------
    const customerList = useMemo(
        () => quotations.map((q) => q.customerPerson),
        [quotations]
    );

    // ----------------- FILTER QUOTATIONS ------------------
    const filtered = useMemo(() => {
        return quotations.filter((q) => {
            const createdAtDate = new Date(q.createdAt);
            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;
            const dateMatch =
                (!from || createdAtDate >= from) && (!to || createdAtDate <= to);

            const allProductsInQuotation = [
                ...(q.productQuotationDetails?.intrastate || []),
                ...(q.productQuotationDetails?.interstate || []),
            ];

            const productMatch =
                !filters.productName ||
                allProductsInQuotation.some((p) =>
                    p.product.toLowerCase().includes(
                        filters.productName.name
                            ? filters.productName.name.toLowerCase()
                            : filters.productName.toLowerCase()
                    )
                );

            return (
                (!filters.companyName ||
                    q.companyName
                        ?.toLowerCase()
                        .includes(filters.companyName.toLowerCase())) &&
                (!filters.customerPerson ||
                    (q.customerPerson || "")
                        .toLowerCase()
                        .includes(filters.customerPerson.toLowerCase())) &&
                productMatch &&
                dateMatch
            );
        });
    }, [filters, quotations]);

    // ----------------- CITY PIE DATA ------------------
    const cityData = useMemo(() => {
        const cityCounts = {};
        filtered.forEach((q) => {
            const key = q.billingAddress?.city || "Unknown";
            cityCounts[key] = (cityCounts[key] || 0) + 1;
        });
        return Object.entries(cityCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- COMPANY PIE DATA ------------------
    const companyData = useMemo(() => {
        const companyCounts = {};
        filtered.forEach((q) => {
            const key = q.companyName || "Unknown";
            companyCounts[key] = (companyCounts[key] || 0) + 1;
        });
        return Object.entries(companyCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- MONTHLY BAR DATA ------------------
    const monthData = useMemo(() => {
        const monthCounts = {};
        filtered.forEach((q) => {
            if (!q.createdAt) return;
            const month = new Date(q.createdAt).toLocaleString("en-US", { month: "short" });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });
        return Object.entries(monthCounts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- PRODUCT-WISE PIE DATA (NEW) ------------------
    const productWiseData = useMemo(() => {
        const counts = {};

        filtered.forEach((q) => {
            const allProductsInQuotation = [
                ...(q.productQuotationDetails?.intrastate || []),
                ...(q.productQuotationDetails?.interstate || []),
            ];

            allProductsInQuotation.forEach((p) => {
                counts[p.product] = (counts[p.product] || 0) + 1;
            });
        });

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
        }));
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
                        options={[
                            "All Companies",
                            ...new Set(quotations.map((q) => q.companyName).filter(Boolean)),
                        ]}
                        value={filters.companyName || null}
                        onChange={(e, val) =>
                            setFilters({
                                ...filters,
                                companyName: val === "All Companies" ? "" : val || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Select Company" size="small" />
                        )}
                        className="w-full lg:w-60"
                    />

                    {/* Customer */}
                    <Autocomplete
                        freeSolo
                        disablePortal
                        options={customerList}
                        value={filters.customerPerson || ""}
                        onChange={(e, val) =>
                            setFilters({ ...filters, customerPerson: val || "" })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Customer" size="small" />
                        )}
                        className="w-full lg:w-60"
                    />

                    {/* Product Filter */}
                    <Autocomplete
                        disablePortal
                        options={allProducts}
                        getOptionLabel={(option) => option.name}
                        value={filters.productName || null}
                        onChange={(_, newValue) =>
                            setFilters({ ...filters, productName: newValue || "" })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Select Product" size="small" />
                        )}
                        className="w-full lg:w-60"
                    />

                    {/* Reset */}
                    <Button
                        variant="text"
                        className="flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-white"
                        onClick={() =>
                            setFilters({
                                companyName: "",
                                customerPerson: "",
                                productName: "",
                                fromDate: "",
                                toDate: "",
                            })
                        }
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* CHARTS */}
            <div id="quotationChart" className="grid gap-6 grid-cols-1 lg:grid-cols-2">

                {/* City Pie Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">City Wise Quotations</h3>
                    {cityData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
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

                {/* Company Pie Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Company Wise Quotations</h3>
                    {companyData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={companyData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {companyData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Monthly Bar Chart */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Monthly Quotations</h3>
                    {monthData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
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

                {/* Product Wise Pie Chart (NEW) */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Product Wise Quotations</h3>
                    {productWiseData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={productWiseData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {productWiseData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuotationCharts;
