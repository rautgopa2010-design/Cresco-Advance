import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    ArrowRight,
    BadgeIndianRupee,
    Bell,
    CalendarClock,
    CalendarDays,
    CalendarX2,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    ClipboardList,
    FileText,
    Goal,
    IndianRupee,
    ListChecks,
    MoveDownRight,
    MoveUpRight,
    Plus,
    ReceiptIndianRupee,
    ShoppingBag,
    Sparkles,
    Target,
    TrendingUp,
    TriangleAlert,
    UserPlus,
    UsersRound,
    Zap,
} from "lucide-react";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.toLocaleString("en-US", { month: "short" });
const palette = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#14B8A6", "#F97316"];

const numberValue = (value) => Number(value) || 0;

const AnimatedCounter = ({ value = 0, formatter }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const target = numberValue(value);
        const duration = 850;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };

        const frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return formatter ? formatter(displayValue) : new Intl.NumberFormat("en-IN").format(Math.round(displayValue));
};

AnimatedCounter.propTypes = {
    value: PropTypes.number,
    formatter: PropTypes.func,
};

const EmptyState = ({ icon: Icon = Sparkles, title, message, actionLabel, onAction, compact = false }) => (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 text-center ${compact ? "min-h-[150px] py-5" : "min-h-[240px] py-8"}`}>
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm">
            <Icon size={28} />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 max-w-xs text-[13px] leading-5 text-slate-500">{message}</p>
        {actionLabel && (
            <button
                onClick={onAction}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md active:scale-95"
            >
                {actionLabel}
            </button>
        )}
    </div>
);

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string,
    message: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
    compact: PropTypes.bool,
};

const Widget = ({ title, subtitle, icon: Icon, children, className = "" }) => (
    <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className={`rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.1)] ${className}`}
    >
        <div className="mb-5 flex items-start justify-between gap-4">
            <div>
                <h2 className="text-[18px] font-extrabold text-slate-900">{title}</h2>
                {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
            </div>
            {Icon && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={20} />
                </span>
            )}
        </div>
        {children}
    </motion.section>
);

Widget.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    icon: PropTypes.elementType,
    children: PropTypes.node,
    className: PropTypes.string,
};

const AdminDashboardCards = ({ dashData = {} }) => {
    const navigate = useNavigate();
    const [quickOpen, setQuickOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currencyCode = user.currencyCode || "INR";
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
    const greeting = today.getHours() < 12 ? "Good Morning" : today.getHours() < 17 ? "Good Afternoon" : "Good Evening";
    const dateLabel = today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const formatCurrency = (amount = 0) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 0,
        }).format(numberValue(amount));

    const formatCompactCurrency = (amount = 0) => {
        const value = numberValue(amount);
        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";
        const currencySymbol = currencyCode === "INR" ? "₹" : `${currencyCode} `;

        const compact = (divisor, suffix, digits = 1) => {
            const result = absValue / divisor;
            const maximumFractionDigits = result >= 10 ? 1 : digits;
            return `${sign}${currencySymbol}${Number(result.toFixed(maximumFractionDigits)).toLocaleString("en-IN")}${suffix}`;
        };

        if (absValue >= 10000000) return compact(10000000, "Cr", 2);
        if (absValue >= 100000) return compact(100000, "L", 2);
        if (absValue >= 1000) return compact(1000, "K", 1);
        return `${sign}${currencySymbol}${Math.round(absValue).toLocaleString("en-IN")}`;
    };

    const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(numberValue(value));

    const monthlyData = useMemo(() => {
        const source = dashData.monthlyChartData || [];
        return source.map((item) => ({
            month: item.month,
            revenue: numberValue(item.revenue),
            quotations: numberValue(item.quotations),
            orders: numberValue(item.orders),
        }));
    }, [dashData.monthlyChartData]);

    const monthLabels = monthlyData.map((item) => item.month);
    const revenueSeries = monthlyData.map((item) => item.revenue);
    const quotationSeries = monthlyData.map((item) => item.quotations);
    const orderSeries = monthlyData.map((item) => item.orders);
    const hasRevenueData = revenueSeries.some((value) => value > 0);
    const hasPipelineData = quotationSeries.some((value) => value > 0) || orderSeries.some((value) => value > 0);

    const leadSources = useMemo(
        () =>
            (dashData.leadSource || [])
                .map((item) => ({ ...item, count_leads: numberValue(item.count_leads) }))
                .filter((item) => item.count_leads > 0),
        [dashData.leadSource],
    );

    const totalBusiness = numberValue(dashData.totalBusiness);
    const totalEnquiries = numberValue(dashData.totalCustomers);
    const totalCustomers = numberValue(dashData.totalConvertedCustomers);
    const totalLeads = numberValue(dashData.totalLeads);
    const totalQuotations = numberValue(dashData.totalQuotations);
    const totalOrders = numberValue(dashData.totalOrders);
    const followupDueToday = numberValue(dashData.followupDueToday);
    const missedFollowups = numberValue(dashData.missedFollowups);
    const overdueInvoices = numberValue(dashData.overdueInvoices);
    const currentMonthRevenue = numberValue(dashData.currentMonthRevenue);
    const currentMonthPayment = numberValue(dashData.currentMonthPaymentReceived);
    const outstandingBalance = numberValue(dashData.totalOutstandingBalance);
    const incentiveData = dashData.employeeIncentives || [];
    const incentiveTotal = incentiveData.reduce((sum, item) => sum + numberValue(item.incentive), 0);

    const trendFrom = (series) => {
        const values = series.filter((value) => value > 0);
        if (values.length < 2) return values.length ? "+100%" : "0%";
        const previous = values[values.length - 2];
        const latest = values[values.length - 1];
        if (!previous) return "+100%";
        const trend = ((latest - previous) / previous) * 100;
        return `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`;
    };

    const sparkOptions = (color) => ({
        chart: { type: "area", sparkline: { enabled: true }, animations: { enabled: true, speed: 650 }, toolbar: { show: false } },
        stroke: { curve: "smooth", width: 2.5 },
        fill: { type: "gradient", gradient: { shadeIntensity: 0.9, opacityFrom: 0.32, opacityTo: 0.02 } },
        colors: [color],
        tooltip: { enabled: false },
    });

    const chartBase = {
        chart: { toolbar: { show: false }, animations: { enabled: true, easing: "easeinout", speed: 750 } },
        grid: { borderColor: "#E2E8F0", strokeDashArray: 5 },
        dataLabels: { enabled: false },
        legend: { position: "top", horizontalAlign: "right", fontSize: "13px", labels: { colors: "#475569" } },
        tooltip: { theme: "light", style: { fontSize: "13px" } },
        xaxis: { categories: monthLabels, labels: { style: { colors: "#64748B", fontSize: "12px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: "#94A3B8", fontSize: "12px" } } },
    };

    const statsCards = [
        {
            label: "Total business",
            value: formatCompactCurrency(totalBusiness),
            detail: "Lifetime order value",
            amount: totalBusiness,
            formatter: formatCompactCurrency,
            icon: ShoppingBag,
            path: "/orders",
            color: "#22C55E",
            bg: "bg-green-50 text-green-600",
            series: revenueSeries,
            growth: trendFrom(revenueSeries),
        },
        {
            label: "Total enquiries",
            value: formatNumber(totalEnquiries),
            detail: "Customer conversations",
            amount: totalEnquiries,
            formatter: formatNumber,
            icon: UsersRound,
            path: "/enquiries",
            color: "#2563EB",
            bg: "bg-blue-50 text-blue-600",
            series: monthlyData.map((item) => item.quotations + item.orders),
            growth: trendFrom(monthlyData.map((item) => item.quotations + item.orders)),
        },
        {
            label: "Total customers",
            value: formatNumber(totalCustomers),
            detail: "Customers with converted orders",
            amount: totalCustomers,
            formatter: formatNumber,
            icon: UserPlus,
            path: "/customer",
            color: "#06B6D4",
            bg: "bg-cyan-50 text-cyan-600",
            series: orderSeries,
            growth: trendFrom(orderSeries),
        },
        {
            label: "Total active leads",
            value: formatNumber(totalLeads),
            detail: "Opportunities in pipeline",
            amount: totalLeads,
            formatter: formatNumber,
            icon: Target,
            path: "/leads/pipeline",
            color: "#8B5CF6",
            bg: "bg-violet-50 text-violet-600",
            series: quotationSeries,
            growth: trendFrom(quotationSeries),
        },
        {
            label: "Payment received this month",
            value: formatCompactCurrency(currentMonthPayment),
            detail: `${currentMonth} ${currentYear} collections`,
            amount: currentMonthPayment,
            formatter: formatCompactCurrency,
            icon: CircleDollarSign,
            path: "/reports",
            color: "#8B5CF6",
            bg: "bg-purple-50 text-purple-600",
            series: revenueSeries,
            growth: trendFrom(revenueSeries),
        },
        {
            label: "Outstanding balance",
            value: formatCompactCurrency(outstandingBalance),
            detail: "Pending scheduled payments",
            amount: outstandingBalance,
            formatter: formatCompactCurrency,
            icon: ReceiptIndianRupee,
            path: "/reports",
            color: "#F59E0B",
            bg: "bg-amber-50 text-amber-600",
            series: [0, outstandingBalance * 0.25, outstandingBalance * 0.5, outstandingBalance],
            growth: outstandingBalance > 0 ? "+Needs action" : "0%",
        },
    ];

    const quickActions = [
        { label: "New enquiry", icon: UserPlus, path: "/enquiries/new" },
        { label: "Create lead", icon: Plus, path: "/leads" },
        { label: "New Customer", icon: UsersRound, path: "/customer" },
        { label: "Quotation", icon: FileText, path: "/quotations" },
        { label: "Invoice", icon: ReceiptIndianRupee, path: "/invoice" },
        { label: "Order", icon: ShoppingBag, path: "/orders" },
        { label: "Followup", icon: CalendarClock, path: "/followup" },
    ];

    const attentionItems = [
        { label: "Due Today", value: followupDueToday, icon: CalendarClock, path: "/followup", tone: "border-amber-100 bg-amber-50 text-amber-700" },
        { label: "Missed Followups", value: missedFollowups, icon: CalendarX2, path: "/followup", tone: "border-red-100 bg-red-50 text-red-700" },
        { label: "Pending Quotations", value: totalQuotations, icon: FileText, path: "/quotations", tone: "border-violet-100 bg-violet-50 text-violet-700" },
        { label: "Overdue Payments", value: overdueInvoices, icon: TriangleAlert, path: "/invoice", tone: "border-orange-100 bg-orange-50 text-orange-700" },
        { label: "Pending Orders", value: totalOrders, icon: ShoppingBag, path: "/orders", tone: "border-blue-100 bg-blue-50 text-blue-700" },
    ];

    const heroOverview = [
        { label: "Pending followups", value: followupDueToday + missedFollowups, formatter: formatNumber, icon: CalendarClock },
        { label: "Today's meetings", value: 0, formatter: formatNumber, icon: CalendarDays },
        { label: "Today's enquiries", value: totalEnquiries, formatter: formatNumber, icon: UsersRound },
        { label: "Expected revenue", value: outstandingBalance || currentMonthRevenue, formatter: formatCompactCurrency, icon: IndianRupee },
    ];

    const activityItems = [
        totalLeads > 0 && { label: "Lead Created", meta: `${formatNumber(totalLeads)} active leads`, icon: Target, color: "bg-blue-50 text-blue-600" },
        totalQuotations > 0 && { label: "Quotation Sent", meta: `${formatNumber(totalQuotations)} quotations`, icon: FileText, color: "bg-violet-50 text-violet-600" },
        currentMonthPayment > 0 && { label: "Payment Received", meta: `${formatCompactCurrency(currentMonthPayment)} this month`, icon: BadgeIndianRupee, color: "bg-green-50 text-green-600" },
        overdueInvoices > 0 && { label: "Invoice Generated", meta: `${formatNumber(overdueInvoices)} overdue invoices`, icon: ReceiptIndianRupee, color: "bg-red-50 text-red-600" },
        totalCustomers > 0 && { label: "Customer Added", meta: `${formatNumber(totalCustomers)} converted customers`, icon: UsersRound, color: "bg-cyan-50 text-cyan-600" },
    ].filter(Boolean);

    const funnelData = [
        { label: "Enquiries", value: totalEnquiries, color: "bg-blue-500" },
        { label: "Leads", value: totalLeads, color: "bg-violet-500" },
        { label: "Quotations", value: totalQuotations, color: "bg-amber-500" },
        { label: "Orders", value: totalOrders, color: "bg-green-500" },
    ];
    const maxFunnel = Math.max(...funnelData.map((item) => item.value), 1);
    const goalTarget = Math.max(totalBusiness + outstandingBalance, 1);
    const goalProgress = Math.min(Math.round((currentMonthRevenue / goalTarget) * 100), 100);
    const totalLeadSourceCount = leadSources.reduce((sum, item) => sum + item.count_leads, 0);
    const pipelineValue = Math.max(outstandingBalance, currentMonthRevenue, totalBusiness);
    const pipelineForecast = pipelineValue ? Math.round(pipelineValue * 0.45) : 0;

    const weekData = [
        followupDueToday,
        missedFollowups,
        totalQuotations,
        totalOrders,
        overdueInvoices,
        totalLeads,
        totalCustomers,
    ];

    const calendarDays = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return date;
    });

    const notifications = [
        { label: "Due Today", value: followupDueToday, path: "/followup", icon: CalendarClock },
        { label: "Missed Followups", value: missedFollowups, path: "/followup", icon: CalendarX2 },
        { label: "Pending Quotations", value: totalQuotations, path: "/quotations", icon: FileText },
        { label: "Overdue Payments", value: overdueInvoices, path: "/invoice", icon: TriangleAlert },
    ];
    const notificationCount = notifications.reduce((sum, item) => sum + item.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="mx-auto flex w-full max-w-[1520px] flex-col gap-7 pb-8 font-['Inter'] text-slate-900"
        >
            <motion.section
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative overflow-visible rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-5 text-white shadow-[0_24px_60px_rgba(37,99,235,0.22)] md:p-6"
            >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-blue-100">
                            <span className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/15">
                                <CalendarDays size={15} />
                                {dateLabel}
                            </span>
                            <span className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/15">Today's overview</span>
                        </div>
                        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight md:text-[30px]">{greeting}, {displayName}</h1>
                        <p className="mt-1.5 max-w-2xl text-sm leading-5 text-blue-100">
                            Track pipeline health, pending work, revenue movement, and customer activity from one premium CRM workspace.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {quickActions.slice(0, 2).map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.button
                                    key={action.label}
                                    whileTap={{ scale: 0.97 }}
                                    whileHover={{ y: -2 }}
                                    onClick={() => navigate(action.path)}
                                    className={index === 0
                                        ? "relative flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-blue-700 shadow-lg shadow-blue-950/10 transition hover:bg-blue-50"
                                        : "relative flex items-center gap-2 overflow-hidden rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/15"}
                                >
                                    <Icon size={18} />
                                    {action.label}
                                </motion.button>
                            );
                        })}
                        <div className="relative">
                            <button
                                onClick={() => setQuickOpen((prev) => !prev)}
                                className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/15 active:scale-95"
                            >
                                Quick Action
                                <ChevronDown size={17} className={`transition ${quickOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {quickOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    className="absolute right-0 z-30 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-2xl backdrop-blur-xl"
                                >
                                    {quickActions.slice(2).map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.label}
                                                onClick={() => {
                                                    setQuickOpen(false);
                                                    navigate(action.path);
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <Icon size={17} />
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setNotificationOpen((prev) => !prev);
                                }}
                                className="relative flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
                            >
                                <Bell size={20} />
                                {notificationCount > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white">{notificationCount > 9 ? "9+" : notificationCount}</span>}
                            </button>
                            <AnimatePresence>
                                {notificationOpen && (
                                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="absolute right-0 z-30 mt-3 w-80 rounded-2xl border border-slate-200 bg-white/95 p-3 text-slate-800 shadow-2xl backdrop-blur-xl">
                                        <div className="mb-2 flex items-center justify-between px-1">
                                            <p className="text-sm font-extrabold">Notification center</p>
                                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">{formatNumber(notificationCount)} pending</span>
                                        </div>
                                        <div className="space-y-2">
                                            {notifications.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <button key={item.label} onClick={() => navigate(item.path)} className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-left transition hover:bg-blue-50">
                                                        <span className="flex items-center gap-2 text-sm font-bold">
                                                            <Icon size={17} className="text-blue-600" />
                                                            {item.label}
                                                        </span>
                                                        <span className="text-sm font-extrabold text-slate-900">{formatNumber(item.value)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {heroOverview.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.div key={item.label} whileHover={{ y: -3 }} className="rounded-2xl border border-white/15 bg-white/12 p-3.5 shadow-lg shadow-blue-950/5 backdrop-blur-xl">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[13px] font-semibold text-blue-100">{item.label}</p>
                                    <Icon size={18} className="text-blue-100" />
                                </div>
                                <p className="mt-1.5 truncate text-[22px] font-extrabold text-white"><AnimatedCounter value={item.value} formatter={item.formatter} /></p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-6">
                {statsCards.map((card) => {
                    const Icon = card.icon;
                    const series = card.series.some((value) => value > 0) ? card.series : [0, 1, 0, 1, 0, 1];
                    return (
                        <motion.button
                            key={card.label}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -6 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => navigate(card.path)}
                            className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                        >
                            <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: card.color }} />
                            <div className="flex items-start justify-between">
                                <span className={`flex size-12 items-center justify-center rounded-2xl ${card.bg}`}>
                                    <Icon size={22} />
                                </span>
                                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${String(card.growth).startsWith("-") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                                    {String(card.growth).startsWith("-") ? <MoveDownRight size={13} /> : <MoveUpRight size={13} />}
                                    {card.growth}
                                </span>
                            </div>
                            <p className="mt-5 text-[13px] font-bold text-slate-500">{card.label}</p>
                            <p className="mt-1 truncate text-[32px] font-extrabold leading-tight text-slate-950">
                                <AnimatedCounter value={card.amount} formatter={card.formatter} />
                            </p>
                            <p className="mt-1 text-[13px] text-slate-400">{card.detail}</p>
                            <div className="mt-4 h-12">
                                <Chart options={sparkOptions(card.color)} series={[{ data: series }]} type="area" height={52} />
                            </div>
                            <ArrowRight size={18} className="absolute bottom-5 right-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                        </motion.button>
                    );
                })}
            </section>

            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {[
                    {
                        title: "Pipeline Health",
                        subtitle: "Track open deals by stage",
                        value: formatNumber(totalLeads),
                        label: "Open deals",
                        detail: `${formatCompactCurrency(pipelineValue)} total pipeline`,
                        icon: Target,
                        path: "/leads/pipeline",
                        tone: "from-blue-600 to-indigo-700",
                    },
                    {
                        title: "Opportunity Focus",
                        subtitle: "Manage deal owners and next steps",
                        value: formatNumber(totalLeads + totalQuotations),
                        label: "Active opportunities",
                        detail: "Review deal status and follow-up priority",
                        icon: ClipboardList,
                        path: "/leads/opportunities",
                        tone: "from-violet-600 to-purple-700",
                    },
                    {
                        title: "Revenue Forecast",
                        subtitle: "Weighted forecast by pipeline stage",
                        value: formatCompactCurrency(pipelineForecast),
                        label: "Expected revenue",
                        detail: `${formatCompactCurrency(currentMonthRevenue)} achieved this month`,
                        icon: TrendingUp,
                        path: "/leads/revenue-forecast",
                        tone: "from-emerald-500 to-teal-700",
                    },
                    {
                        title: "Automation",
                        subtitle: "Smart reminders and alerts",
                        value: formatNumber(followupDueToday + missedFollowups + totalLeads),
                        label: "Signals monitored",
                        detail: "Follow-up reminders, stale deals, and stage suggestions",
                        icon: Zap,
                        path: "/leads/automation",
                        tone: "from-amber-500 to-orange-700",
                    },
                    {
                        title: "AI Suggestions",
                        subtitle: "Risk and next actions",
                        value: formatNumber(totalLeads),
                        label: "Deals analyzed",
                        detail: "Deal risk, next action, follow-up, and probability guidance",
                        icon: Sparkles,
                        path: "/leads/ai-suggestions",
                        tone: "from-fuchsia-600 to-violet-700",
                    },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <motion.button
                            key={item.title}
                            type="button"
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(item.path)}
                            className="group overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur transition hover:shadow-[0_24px_60px_rgba(15,23,42,0.13)]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}>
                                    <Icon size={24} />
                                </span>
                                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                                    Open
                                    <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                                </span>
                            </div>
                            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.subtitle}</p>
                            <h2 className="mt-1 text-xl font-black text-slate-950">{item.title}</h2>
                            <p className="mt-4 text-[34px] font-black leading-none text-slate-950">{item.value}</p>
                            <p className="mt-1 text-sm font-bold text-slate-500">{item.label}</p>
                            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">{item.detail}</p>
                        </motion.button>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
                <Widget title="Revenue Snapshot" subtitle={`Monthly revenue performance for ${currentYear}`} icon={Activity}>
                    {hasRevenueData ? (
                        <Chart
                            options={{
                                ...chartBase,
                                colors: ["#2563EB"],
                                stroke: { curve: "smooth", width: 4 },
                                fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.04 } },
                                tooltip: { y: { formatter: (value) => formatCurrency(value) } },
                            }}
                            series={[{ name: "Revenue", data: revenueSeries }]}
                            type="area"
                            height={255}
                        />
                    ) : (
                        <EmptyState compact icon={IndianRupee} title="Revenue chart will appear after first order." message="Once an order is created, monthly revenue trends and forecasting will appear here." actionLabel="Create order" onAction={() => navigate("/orders")} />
                    )}
                </Widget>

                <Widget title="Needs Attention" subtitle="Only items that require action" icon={TriangleAlert}>
                    <div className="space-y-3">
                        {attentionItems.slice(0, 4).map((item) => {
                            const Icon = item.icon;
                            return (
                                <button key={item.label} onClick={() => navigate(item.path)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}>
                                    <span className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                                            <Icon size={19} />
                                        </span>
                                        <span className="text-sm font-extrabold">{item.label}</span>
                                    </span>
                                    <span className="text-2xl font-extrabold">{formatNumber(item.value)}</span>
                                </button>
                            );
                        })}
                    </div>
                </Widget>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <Widget title="Sales Funnel" subtitle="Enquiries to orders" icon={Target}>
                    <div className="space-y-4">
                        {funnelData.map((item) => (
                            <div key={item.label}>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-700">{item.label}</span>
                                    <span className="font-extrabold text-slate-900">{formatNumber(item.value)}</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${Math.max((item.value / maxFunnel) * 100, item.value ? 12 : 4)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Widget>

                <Widget title="Lead Sources" subtitle="Where opportunities are coming from" icon={UsersRound}>
                    {leadSources.length ? (
                        <Chart
                            options={{
                                chart: { toolbar: { show: false }, animations: { enabled: true } },
                                labels: leadSources.map((item) => item.leadSource || "Other"),
                                colors: palette,
                                legend: { position: "bottom", fontSize: "13px" },
                                dataLabels: { enabled: false },
                                plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Leads", formatter: () => formatNumber(totalLeadSourceCount) } } } } },
                            }}
                            series={leadSources.map((item) => item.count_leads)}
                            type="donut"
                            height={230}
                        />
                    ) : (
                        <EmptyState compact icon={UsersRound} title="No lead-source data yet." message="Create your first lead to begin tracking acquisition channels." actionLabel="Go to leads" onAction={() => navigate("/leads")} />
                    )}
                </Widget>

                <Widget title="Weekly Performance" subtitle="Current CRM activity pulse" icon={CheckCircle2}>
                    {weekData.some((value) => value > 0) ? (
                        <Chart
                            options={{
                                chart: { type: "area", toolbar: { show: false }, animations: { enabled: true } },
                                colors: ["#8B5CF6"],
                                stroke: { curve: "smooth", width: 3 },
                                fill: { type: "gradient", gradient: { opacityFrom: 0.28, opacityTo: 0.04 } },
                                xaxis: { categories: ["Due", "Missed", "Quotes", "Orders", "Overdue", "Leads", "Customers"] },
                                dataLabels: { enabled: false },
                                grid: { borderColor: "#E2E8F0", strokeDashArray: 5 },
                            }}
                            series={[{ name: "Activity", data: weekData }]}
                            type="area"
                            height={230}
                        />
                    ) : (
                        <EmptyState compact icon={CheckCircle2} title="No weekly activity yet." message="This summary will appear after leads, quotations, orders, or followups are created." actionLabel="Open reports" onAction={() => navigate("/reports")} />
                    )}
                </Widget>
            </section>

            {false && (
            <>
            <motion.button
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/leads/pipeline")}
                className="group overflow-hidden rounded-3xl border border-blue-100 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur transition hover:border-blue-200 hover:shadow-[0_24px_60px_rgba(37,99,235,0.14)]"
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/25">
                            <Target size={25} />
                        </span>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Sales Pipeline</p>
                            <h2 className="mt-1 text-2xl font-black text-slate-950">Open Pipeline Board</h2>
                            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                                Click here to view and drag deals across New, Qualified, Proposal, Negotiation, Won and Lost stages.
                            </p>
                            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-700">
                                Open Pipeline Board
                                <ArrowRight size={17} />
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                        {[
                            { label: "Open deals", value: formatNumber(totalLeads) },
                            { label: "Pipeline value", value: formatCurrency(pipelineValue) },
                            { label: "Forecast", value: formatCurrency(pipelineForecast) },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                <p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
                                <p className="mt-1 truncate text-xl font-black text-slate-950">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <span className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:translate-x-1 lg:flex">
                        <ArrowRight size={21} />
                    </span>
                </div>
            </motion.button>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
                <Widget title="Monthly Revenue" subtitle={`Monthly revenue performance for ${currentYear}`} icon={Activity}>
                    {hasRevenueData ? (
                        <Chart
                            options={{
                                ...chartBase,
                                colors: ["#2563EB"],
                                stroke: { curve: "smooth", width: 4 },
                                fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.04 } },
                                tooltip: { y: { formatter: (value) => formatCurrency(value) } },
                            }}
                            series={[{ name: "Revenue", data: revenueSeries }]}
                            type="area"
                            height={280}
                        />
                    ) : (
                        <EmptyState icon={IndianRupee} title="Revenue chart will appear after first order." message="Once an order is created, monthly revenue trends and forecasting will appear here." actionLabel="Create order" onAction={() => navigate("/orders")} />
                    )}
                </Widget>

                <Widget title="Needs attention" subtitle="Priorities for your team today" icon={TriangleAlert}>
                    <div className="space-y-3">
                        {attentionItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button key={item.label} onClick={() => navigate(item.path)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}>
                                    <span className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                                            <Icon size={19} />
                                        </span>
                                        <span className="text-sm font-extrabold">{item.label}</span>
                                    </span>
                                    <span className="text-2xl font-extrabold">{formatNumber(item.value)}</span>
                                </button>
                            );
                        })}
                    </div>
                </Widget>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <Widget title="Sales Funnel" subtitle="Enquiries to orders" icon={Target}>
                    <div className="space-y-4">
                        {funnelData.map((item) => (
                            <div key={item.label}>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-700">{item.label}</span>
                                    <span className="font-extrabold text-slate-900">{formatNumber(item.value)}</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${Math.max((item.value / maxFunnel) * 100, item.value ? 12 : 4)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Widget>

                <Widget title="Lead Conversion Funnel" subtitle="Lead quality and conversion pulse" icon={TrendingUp}>
                    {totalEnquiries || totalLeads || totalOrders ? (
                        <Chart
                            options={{
                                chart: { toolbar: { show: false }, animations: { enabled: true } },
                                colors: ["#2563EB", "#8B5CF6", "#22C55E"],
                                labels: ["Enquiries", "Leads", "Orders"],
                                legend: { position: "bottom" },
                                dataLabels: { enabled: true },
                                plotOptions: { pie: { donut: { size: "68%" } } },
                            }}
                            series={[totalEnquiries, totalLeads, totalOrders]}
                            type="donut"
                            height={245}
                        />
                    ) : (
                        <EmptyState compact icon={Target} title="Create your first lead." message="Lead conversion will appear when enquiries and orders start moving." actionLabel="Create lead" onAction={() => navigate("/leads")} />
                    )}
                </Widget>

                <Widget title="Goal Progress Card" subtitle="Current month revenue progress" icon={Goal}>
                    <div className="flex flex-col items-center justify-center">
                        <Chart
                            options={{
                                chart: { sparkline: { enabled: true }, animations: { enabled: true } },
                                colors: ["#22C55E"],
                                plotOptions: { radialBar: { hollow: { size: "64%" }, dataLabels: { name: { show: false }, value: { fontSize: "30px", fontWeight: 800, color: "#0F172A", formatter: (value) => `${Math.round(value)}%` } } } },
                                stroke: { lineCap: "round" },
                            }}
                            series={[goalProgress]}
                            type="radialBar"
                            height={230}
                        />
                        <p className="text-center text-[13px] text-slate-500">{formatCurrency(currentMonthRevenue)} achieved from visible revenue.</p>
                    </div>
                </Widget>
            </section>

            <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr_1fr]">
                <Widget title="Recent Activities Timeline" subtitle="Latest CRM movement" icon={Activity}>
                    {activityItems.length ? (
                        <div className="space-y-4">
                            {activityItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex gap-3">
                                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                                            <Icon size={18} />
                                        </span>
                                        <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-none">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="truncate text-sm font-extrabold text-slate-800">{item.label}</p>
                                                <span className="text-xs font-semibold text-slate-400">{index === 0 ? "Now" : "Today"}</span>
                                            </div>
                                            <p className="mt-1 text-[13px] text-slate-500">{item.meta}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState compact icon={Activity} title="No activities yet." message="Lead, quotation, payment, invoice, and customer activity will appear here." actionLabel="New enquiry" onAction={() => navigate("/enquiries/new")} />
                    )}
                </Widget>

                <Widget title="Pipeline movement" subtitle="Quotations compared with converted orders" icon={ClipboardList}>
                    {hasPipelineData ? (
                        <Chart
                            options={{
                                ...chartBase,
                                colors: ["#93C5FD", "#2563EB"],
                                plotOptions: { bar: { borderRadius: 8, columnWidth: "45%" } },
                                stroke: { show: true, width: 3, colors: ["transparent"] },
                            }}
                            series={[
                                { name: "Quotations", data: quotationSeries },
                                { name: "Orders", data: orderSeries },
                            ]}
                            type="bar"
                            height={280}
                        />
                    ) : (
                        <EmptyState icon={FileText} title="No enquiries yet." message="Pipeline movement will show after quotations and orders are created." actionLabel="Create your first lead" onAction={() => navigate("/leads")} />
                    )}
                </Widget>

                <Widget title="Lead Sources Donut Chart" subtitle="Where opportunities are coming from" icon={UsersRound}>
                    {leadSources.length ? (
                        <Chart
                            options={{
                                chart: { toolbar: { show: false }, animations: { enabled: true } },
                                labels: leadSources.map((item) => item.leadSource || "Other"),
                                colors: palette,
                                legend: { position: "bottom", fontSize: "13px" },
                                dataLabels: { enabled: false },
                                plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Leads", formatter: () => formatNumber(totalLeadSourceCount) } } } } },
                            }}
                            series={leadSources.map((item) => item.count_leads)}
                            type="donut"
                            height={280}
                        />
                    ) : (
                        <EmptyState icon={UsersRound} title="No lead-source data yet." message="Create your first lead to begin tracking acquisition channels." actionLabel="Go to leads" onAction={() => navigate("/leads")} />
                    )}
                </Widget>
            </section>

            <section className="grid gap-6 xl:grid-cols-4">
                <Widget title="Upcoming Followups" subtitle="Scheduled customer touchpoints" icon={CalendarClock}>
                    <EmptyState compact icon={CalendarClock} title={followupDueToday ? `${formatNumber(followupDueToday)} followups due today.` : "No upcoming followups."} message="Detailed followup items will appear here when available." actionLabel="Open followups" onAction={() => navigate("/followup")} />
                </Widget>
                <Widget title="Today's Tasks" subtitle="Work queue for today" icon={ListChecks}>
                    <div className="space-y-3">
                        {attentionItems.slice(0, 4).map((item) => (
                            <button key={item.label} onClick={() => navigate(item.path)} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition hover:border-blue-100 hover:bg-blue-50">
                                <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-slate-700">{formatNumber(item.value)}</span>
                            </button>
                        ))}
                    </div>
                </Widget>
                <Widget title="Top Performing Sales Executive" subtitle="Incentive leaderboard" icon={Sparkles}>
                    {incentiveData.length ? (
                        <div className="space-y-3">
                            {incentiveData.slice(0, 4).map((item, index) => (
                                <div key={item.employeeName || index} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                                    <span className="text-sm font-bold text-slate-700">{item.employeeName || `Executive ${index + 1}`}</span>
                                    <span className="text-sm font-extrabold text-green-600">{formatCurrency(item.incentive)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState compact icon={Sparkles} title="No incentive data yet." message="Top performers will show once incentives are recorded." />
                    )}
                </Widget>
                <Widget title="Calendar Widget" subtitle="Next 14 days" icon={CalendarDays}>
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date) => {
                            const isToday = date.toDateString() === today.toDateString();
                            return (
                                <div key={date.toISOString()} className={`rounded-xl p-2 text-center ${isToday ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-600"}`}>
                                    <p className="text-[11px] font-bold">{date.toLocaleDateString("en-US", { weekday: "short" })}</p>
                                    <p className="mt-1 text-sm font-extrabold">{date.getDate()}</p>
                                </div>
                            );
                        })}
                    </div>
                </Widget>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                {[
                    { title: "Recent Customers Table", icon: UsersRound, message: "Recent customers will appear after customer activity is available.", path: "/customer", action: "Open customers" },
                    { title: "Recent Quotations", icon: FileText, message: "Recent quotations will appear after your team sends quotations.", path: "/quotations", action: "Open quotations" },
                    { title: "Recent Orders", icon: ShoppingBag, message: "Recent orders will appear after the first order is recorded.", path: "/orders", action: "Open orders" },
                    { title: "Recent Payments", icon: BadgeIndianRupee, message: "Recent payments will appear after payment entries are recorded.", path: "/reports", action: "Open reports" },
                    { title: "Outstanding Invoices", icon: ReceiptIndianRupee, message: "Outstanding invoices and overdue payments will appear here.", path: "/invoice", action: "Open invoices" },
                    { title: "Weekly Performance", icon: CheckCircle2, message: "Weekly performance is summarized from the current dashboard activity.", path: "/reports", action: "Open reports" },
                ].map((item, index) => (
                    <Widget key={item.title} title={item.title} subtitle="CRM records" icon={item.icon}>
                        {item.title === "Weekly Performance" && weekData.some((value) => value > 0) ? (
                            <Chart
                                options={{
                                    chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: false }, animations: { enabled: true } },
                                    colors: ["#8B5CF6"],
                                    stroke: { curve: "smooth", width: 3 },
                                    fill: { type: "gradient", gradient: { opacityFrom: 0.28, opacityTo: 0.04 } },
                                    xaxis: { categories: ["Due", "Missed", "Quotes", "Orders", "Overdue", "Leads", "Customers"] },
                                    dataLabels: { enabled: false },
                                    grid: { borderColor: "#E2E8F0", strokeDashArray: 5 },
                                }}
                                series={[{ name: "Activity", data: weekData }]}
                                type="area"
                                height={190}
                            />
                        ) : (
                            <EmptyState compact icon={item.icon} title={index === 0 ? "No enquiries yet." : item.title} message={item.message} actionLabel={item.action} onAction={() => navigate(item.path)} />
                        )}
                    </Widget>
                ))}
            </section>

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-700 p-6 text-white shadow-[0_24px_70px_rgba(139,92,246,0.22)]">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-bold text-violet-100">Team incentive overview</p>
                        <p className="mt-2 text-[36px] font-extrabold leading-none">{formatCurrency(incentiveTotal)}</p>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                            Total incentives recorded for {currentYear}. Keep the pipeline moving and turn followups into completed orders.
                        </p>
                    </div>
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20">
                        <Sparkles size={42} />
                    </div>
                </div>
            </section>
            </>
            )}
            <div className="fixed bottom-6 right-6 z-40">
                <div className="group relative">
                    <button className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)] transition hover:-translate-y-1 hover:bg-blue-700 active:scale-95">
                        <Zap size={24} />
                    </button>
                    <div className="pointer-events-none absolute bottom-16 right-0 w-52 translate-y-2 rounded-2xl border border-slate-200 bg-white/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                        {quickActions.slice(0, 5).map((action) => {
                            const Icon = action.icon;
                            return (
                                <button key={action.label} onClick={() => navigate(action.path)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                                    <Icon size={16} />
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

AdminDashboardCards.propTypes = {
    dashData: PropTypes.object,
};

export default AdminDashboardCards;
