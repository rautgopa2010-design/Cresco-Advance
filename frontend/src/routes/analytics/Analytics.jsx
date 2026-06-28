import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { BarChart3, CalendarDays, CircleDollarSign, Package, Target, Trophy } from "lucide-react";
import { CircularProgress, TextField } from "@mui/material";
import { getOrders } from "../../redux/actions/order";
import { getAssignedIncentives } from "../../redux/actions/assignedIncentives";

const COLORS = ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#64748b"];

const toNumber = (value) => {
    const amount = Number(String(value ?? 0).replace(/,/g, ""));
    return Number.isFinite(amount) ? amount : 0;
};

const parseDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const text = String(value);
    const ddmmyyyy = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatMonth = (date) => date.toLocaleString("en-IN", { month: "short", year: "2-digit" });

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(toNumber(value));

const getDateInputValue = (date) => date.toISOString().slice(0, 10);

const getOrderDate = (order) => parseDate(order.date) || parseDate(order.createdAt);

const getOrderProducts = (order) => {
    const details = order.productOrderDetails || {};
    return [...(details.intrastate || []), ...(details.interstate || [])];
};

const isWithinRange = (date, fromDate, toDate) => {
    if (!date) return false;
    if (fromDate && date < fromDate) return false;
    if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (date > endOfDay) return false;
    }
    return true;
};

const monthFromAssignedIncentive = (item) => {
    if (item.date) {
        const parsed = parseDate(item.date);
        if (parsed) return formatMonth(parsed);
    }
    if (item.month) return String(item.month).slice(0, 3);
    return "Unmapped";
};

const EmptyChart = ({ message = "No analytics data found for selected dates." }) => (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm font-medium text-slate-500">
        {message}
    </div>
);

const ChartCard = ({ title, subtitle, icon: Icon, children }) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="mb-5 flex items-start justify-between gap-3">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-500">{subtitle}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Icon size={22} />
            </div>
        </div>
        {children}
    </section>
);

const MetricCard = ({ label, value, detail, icon: Icon, tone }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
            <div className={`rounded-2xl p-3 ${tone}`}>
                <Icon size={22} />
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{detail}</span>
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
);

const Analytics = () => {
    const dispatch = useDispatch();
    const { orders = [], loading: orderLoading } = useSelector((state) => state.order);
    const { assignedIncentives = [], loading: incentiveLoading } = useSelector((state) => state.assignedIncentives);

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const [dateRange, setDateRange] = useState({
        from: getDateInputValue(firstDay),
        to: getDateInputValue(today),
    });

    useEffect(() => {
        dispatch(getOrders());
        dispatch(getAssignedIncentives());
    }, [dispatch]);

    const fromDate = useMemo(() => parseDate(dateRange.from), [dateRange.from]);
    const toDate = useMemo(() => parseDate(dateRange.to), [dateRange.to]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => order.status !== "Canceled" && isWithinRange(getOrderDate(order), fromDate, toDate));
    }, [orders, fromDate, toDate]);

    const filteredIncentives = useMemo(() => {
        return assignedIncentives.filter((item) => {
            const date = parseDate(item.date || item.createdAt);
            return date ? isWithinRange(date, fromDate, toDate) : true;
        });
    }, [assignedIncentives, fromDate, toDate]);

    const productRows = useMemo(() => {
        return filteredOrders.flatMap((order) =>
            getOrderProducts(order).map((product) => ({
                orderDate: getOrderDate(order),
                product: product.product || product.productName || "Unknown Product",
                category: product.productCategory || product.productCategoryName || "Uncategorized",
                amount: toNumber(product.subTotal || product.total || product.finalAmt),
            })),
        );
    }, [filteredOrders]);

    const targetAchievementByMonth = useMemo(() => {
        const map = new Map();
        filteredIncentives.forEach((item) => {
            const key = monthFromAssignedIncentive(item);
            const row = map.get(key) || { name: key, target: 0, achievement: 0 };
            row.target += toNumber(item.targeted_amount ?? item.assignedIncentive?.targeted_amount);
            map.set(key, row);
        });

        filteredOrders.forEach((order) => {
            const date = getOrderDate(order);
            const key = date ? formatMonth(date) : "Unmapped";
            const row = map.get(key) || { name: key, target: 0, achievement: 0 };
            row.achievement += toNumber(order.finalAmt);
            map.set(key, row);
        });

        return Array.from(map.values());
    }, [filteredIncentives, filteredOrders]);

    const targetAchievementByProduct = useMemo(() => {
        const map = new Map();
        filteredIncentives.forEach((item) => {
            const key = item.selectedProductName || item.assignedIncentive?.selectedProductName || "General";
            const row = map.get(key) || { name: key, target: 0, achievement: 0 };
            row.target += toNumber(item.targeted_amount ?? item.assignedIncentive?.targeted_amount);
            map.set(key, row);
        });

        productRows.forEach((item) => {
            const row = map.get(item.product) || { name: item.product, target: 0, achievement: 0 };
            row.achievement += item.amount;
            map.set(item.product, row);
        });

        return Array.from(map.values()).sort((a, b) => b.achievement - a.achievement).slice(0, 8);
    }, [filteredIncentives, productRows]);

    const revenueData = useMemo(() => {
        const map = new Map();
        filteredOrders.forEach((order) => {
            const date = getOrderDate(order);
            const key = date ? formatMonth(date) : "Unmapped";
            const row = map.get(key) || { name: key, revenue: 0, orders: 0 };
            row.revenue += toNumber(order.finalAmt);
            row.orders += 1;
            map.set(key, row);
        });
        return Array.from(map.values());
    }, [filteredOrders]);

    const productData = useMemo(() => {
        const map = new Map();
        productRows.forEach((item) => {
            const row = map.get(item.product) || { name: item.product, value: 0 };
            row.value += item.amount;
            map.set(item.product, row);
        });
        return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 10);
    }, [productRows]);

    const categoryData = useMemo(() => {
        const map = new Map();
        productRows.forEach((item) => {
            const row = map.get(item.category) || { name: item.category, value: 0 };
            row.value += item.amount;
            map.set(item.category, row);
        });
        return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 8);
    }, [productRows]);

    const totals = useMemo(() => {
        const revenue = filteredOrders.reduce((sum, order) => sum + toNumber(order.finalAmt), 0);
        const assignedTarget = filteredIncentives.reduce((sum, item) => sum + toNumber(item.targeted_amount ?? item.assignedIncentive?.targeted_amount), 0);
        const employeeTargets = Object.keys(localStorage)
            .filter((key) => key.startsWith("crm:employee-target:"))
            .reduce((sum, key) => sum + toNumber(localStorage.getItem(key)), 0);
        const target = employeeTargets || assignedTarget;
        const achievementPercent = target > 0 ? Math.round((revenue / target) * 100) : 0;
        return { revenue, target, assignedTarget, achievementPercent, orders: filteredOrders.length, targetSource: employeeTargets ? "Employee target" : "Assigned target" };
    }, [filteredIncentives, filteredOrders]);

    const effectiveTargetAchievementByMonth = useMemo(() => {
        if (!totals.target || !targetAchievementByMonth.length) return targetAchievementByMonth;
        const totalRevenue = targetAchievementByMonth.reduce((sum, item) => sum + toNumber(item.achievement), 0);
        return targetAchievementByMonth.map((item) => ({
            ...item,
            target: totalRevenue > 0 ? Math.round((toNumber(item.achievement) / totalRevenue) * totals.target) : totals.target / targetAchievementByMonth.length,
        }));
    }, [totals.target, targetAchievementByMonth]);

    if (orderLoading || incentiveLoading) {
        return (
            <div className="flex h-full min-h-[480px] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">CRM Analytics</p>
                        <h1 className="mt-2 text-3xl font-black">Business Performance Dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm text-blue-100">
                            Track target vs achievement, revenue movement, product performance and category contribution with custom calendar filters.
                        </p>
                    </div>
                    <div className="grid gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur sm:grid-cols-2">
                        <TextField
                            label="From Date"
                            type="date"
                            size="small"
                            value={dateRange.from}
                            onChange={(event) => setDateRange((prev) => ({ ...prev, from: event.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={{ background: "white", borderRadius: "12px" }}
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            size="small"
                            value={dateRange.to}
                            onChange={(event) => setDateRange((prev) => ({ ...prev, to: event.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={{ background: "white", borderRadius: "12px" }}
                        />
                    </div>
                </div>
            </div>

            {totals.target > 0 && (
                <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Target Achievement Progress</p>
                            <p className="text-sm text-slate-500">
                                {formatCurrency(totals.revenue)} achieved out of {formatCurrency(totals.target)}
                            </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-4 py-2 text-lg font-black text-blue-700">{totals.achievementPercent}%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 transition-all"
                            style={{ width: `${Math.min(totals.achievementPercent, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Revenue" value={formatCurrency(totals.revenue)} detail="Selected range" icon={CircleDollarSign} tone="bg-emerald-50 text-emerald-600" />
                <MetricCard label="Total Target" value={formatCurrency(totals.target)} detail={totals.targetSource} icon={Target} tone="bg-blue-50 text-blue-600" />
                <MetricCard label="Achievement" value={`${totals.achievementPercent}%`} detail="Revenue / target" icon={Trophy} tone="bg-violet-50 text-violet-600" />
                <MetricCard label="Orders" value={totals.orders} detail="Completed sales" icon={CalendarDays} tone="bg-amber-50 text-amber-600" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard title="Target vs Achievement by Month" subtitle="Chart 1" icon={Target}>
                    {effectiveTargetAchievementByMonth.length ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={effectiveTargetAchievementByMonth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="target" name="Target" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="achievement" name="Achievement" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart />
                    )}
                </ChartCard>

                <ChartCard title="Target vs Achievement by Product" subtitle="Chart 2" icon={Trophy}>
                    {targetAchievementByProduct.length ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={targetAchievementByProduct} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                                <YAxis type="category" dataKey="name" width={120} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="target" name="Target" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                                <Bar dataKey="achievement" name="Achievement" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart />
                    )}
                </ChartCard>
            </div>

            <ChartCard title="Total Revenue" subtitle="Custom calendar wise" icon={CircleDollarSign}>
                {revenueData.length ? (
                    <ResponsiveContainer width="100%" height={330}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" fill="url(#revenueGradient)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart />
                )}
            </ChartCard>

            <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard title="Productwise Revenue" subtitle="Calendar filtered" icon={Package}>
                    {productData.length ? (
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={productData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                                <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="value" name="Revenue" radius={[10, 10, 0, 0]}>
                                    {productData.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart />
                    )}
                </ChartCard>

                <ChartCard title="Categorywise Revenue" subtitle="Calendar filtered" icon={BarChart3}>
                    {categoryData.length ? (
                        <ResponsiveContainer width="100%" height={340}>
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={118} paddingAngle={4}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart />
                    )}
                </ChartCard>
            </div>
        </div>
    );
};

export default Analytics;
