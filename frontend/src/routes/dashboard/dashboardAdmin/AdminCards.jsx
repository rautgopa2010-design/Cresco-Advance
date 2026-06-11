import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
    Activity,
    ArrowRight,
    CalendarClock,
    CalendarX2,
    CircleDollarSign,
    FileText,
    Plus,
    ReceiptIndianRupee,
    ShoppingBag,
    Sparkles,
    Target,
    TriangleAlert,
    UserPlus,
    UsersRound,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.toLocaleString("en-US", { month: "short" });

const palette = ["#4f46e5", "#0891b2", "#f59e0b", "#e11d48", "#7c3aed", "#059669", "#ea580c", "#2563eb"];

const AdminDashboardCards = ({ dashData = {} }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currencyCode = user.currencyCode || "INR";
    const isSuperAdmin = user?.role_name === "Super Admin";

    const formatCurrency = (amount = 0) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 0,
        }).format(Number(amount) || 0);

    const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value) || 0);

    const primaryMetrics = [
        {
            label: "Enquiries",
            value: formatNumber(dashData.totalCustomers),
            detail: "Customer conversations",
            icon: UsersRound,
            path: "/enquiry",
            accent: "from-blue-500 to-indigo-600",
            iconBg: "bg-blue-50 text-blue-600",
        },
        {
            label: "Active leads",
            value: formatNumber(dashData.totalLeads),
            detail: "Opportunities in pipeline",
            icon: Target,
            path: "/leads",
            accent: "from-violet-500 to-fuchsia-600",
            iconBg: "bg-violet-50 text-violet-600",
        },
        {
            label: "Orders",
            value: formatNumber(dashData.totalOrders),
            detail: `${formatNumber(dashData.totalQuotations)} quotations created`,
            icon: ShoppingBag,
            path: "/orders",
            accent: "from-emerald-500 to-teal-600",
            iconBg: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Revenue this month",
            value: formatCurrency(dashData.currentMonthRevenue),
            detail: `${currentMonth} ${currentYear} performance`,
            icon: CircleDollarSign,
            path: "/orders",
            accent: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-50 text-amber-600",
        },
    ];

    const attentionItems = [
        {
            label: "Due today",
            value: formatNumber(dashData.followupDueToday),
            icon: CalendarClock,
            path: "/followup",
            tone: "text-amber-700 bg-amber-50 border-amber-100",
        },
        {
            label: "Missed follow-ups",
            value: formatNumber(dashData.missedFollowups),
            icon: CalendarX2,
            path: "/followup",
            tone: "text-rose-700 bg-rose-50 border-rose-100",
        },
        {
            label: "Overdue invoices",
            value: formatNumber(dashData.overdueInvoices),
            icon: TriangleAlert,
            path: "/invoice",
            tone: "text-orange-700 bg-orange-50 border-orange-100",
        },
        {
            label: "Quotations",
            value: formatNumber(dashData.totalQuotations),
            icon: FileText,
            path: "/quotations",
            tone: "text-indigo-700 bg-indigo-50 border-indigo-100",
        },
    ];

    const quickActions = [
        { label: "New enquiry", icon: UserPlus, path: "/enquiry" },
        { label: "Create lead", icon: Plus, path: "/leads" },
        { label: "New quotation", icon: FileText, path: "/quotations" },
        { label: "Record order", icon: ReceiptIndianRupee, path: "/orders" },
    ];

    const monthlyData = useMemo(() => {
        const source = dashData.monthlyChartData || [];
        return source.map((item) => ({
            ...item,
            revenue: Number(item.revenue) || 0,
            quotations: Number(item.quotations) || 0,
            orders: Number(item.orders) || 0,
        }));
    }, [dashData.monthlyChartData]);

    const leadSources = useMemo(
        () =>
            (dashData.leadSource || [])
                .map((item) => ({ ...item, count_leads: Number(item.count_leads) || 0 }))
                .filter((item) => item.count_leads > 0),
        [dashData.leadSource],
    );

    const incentiveData = dashData.employeeIncentives || [];
    const incentiveTotal = incentiveData.reduce((sum, item) => sum + (Number(item.incentive) || 0), 0);
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "there";
    const dateLabel = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 pb-8">
            <section className="relative overflow-hidden rounded-3xl bg-[#101828] px-6 py-7 text-white shadow-xl shadow-slate-300/40 md:px-8 md:py-8">
                <div className="absolute -right-20 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 size-40 rounded-full bg-cyan-400/10 blur-2xl" />
                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-200">
                            <Sparkles size={16} />
                            <span>{dateLabel}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {displayName}</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                            Here is a clear view of your pipeline, customer activity, and the work that needs attention today.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {quickActions.slice(0, 2).map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.label}
                                    onClick={() => navigate(action.path)}
                                    className={
                                        index === 0
                                            ? "flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
                                            : "flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                                    }
                                >
                                    <Icon size={17} />
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {primaryMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <button
                            key={metric.label}
                            onClick={() => navigate(metric.path)}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70"
                        >
                            <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`} />
                            <div className="flex items-start justify-between">
                                <span className={`flex size-11 items-center justify-center rounded-xl ${metric.iconBg}`}>
                                    <Icon size={21} />
                                </span>
                                <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                            </div>
                            <p className="mt-5 text-sm font-medium text-slate-500">{metric.label}</p>
                            <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">{metric.value}</p>
                            <p className="mt-2 text-xs text-slate-400">{metric.detail}</p>
                        </button>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <Activity size={19} className="text-indigo-600" />
                                <h2 className="text-lg font-bold text-slate-900">Revenue overview</h2>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Monthly revenue performance for {currentYear}</p>
                        </div>
                        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {formatCurrency(dashData.currentMonthRevenue)} this month
                        </span>
                    </div>
                    <div className="h-[290px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28} />
                                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                                    contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 12px 30px rgba(15,23,42,.12)" }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#dashboardRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Needs attention</h2>
                        <p className="mt-1 text-sm text-slate-500">Priorities for your team today</p>
                    </div>
                    <div className="space-y-3">
                        {attentionItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-lg bg-white/80">
                                            <Icon size={18} />
                                        </span>
                                        <span className="text-sm font-semibold">{item.label}</span>
                                    </span>
                                    <span className="text-xl font-bold">{item.value}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Pipeline movement</h2>
                        <p className="mt-1 text-sm text-slate-500">Quotations compared with converted orders</p>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} barGap={5} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0" }} />
                                <Bar dataKey="quotations" name="Quotations" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="orders" name="Orders" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-5 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-indigo-200" /> Quotations</span>
                        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-indigo-600" /> Orders</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Lead sources</h2>
                        <p className="mt-1 text-sm text-slate-500">Where your opportunities are coming from</p>
                    </div>
                    {leadSources.length > 0 ? (
                        <div className="grid items-center gap-4 sm:grid-cols-[1fr_190px]">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={leadSources}
                                            dataKey="count_leads"
                                            nameKey="leadSource"
                                            innerRadius={68}
                                            outerRadius={105}
                                            paddingAngle={4}
                                            stroke="none"
                                        >
                                            {leadSources.map((item, index) => (
                                                <Cell key={item.leadSource || index} fill={palette[index % palette.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {leadSources.slice(0, 6).map((item, index) => (
                                    <div key={item.leadSource || index} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex min-w-0 items-center gap-2 text-slate-600">
                                            <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                                            <span className="truncate">{item.leadSource || "Other"}</span>
                                        </span>
                                        <strong className="text-slate-900">{item.count_leads}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                            <Target size={34} className="text-slate-300" />
                            <p className="mt-3 font-semibold text-slate-700">No lead-source data yet</p>
                            <p className="mt-1 max-w-xs text-sm text-slate-400">Create your first lead to begin tracking acquisition channels.</p>
                            <button onClick={() => navigate("/leads")} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                Go to leads
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
                    <p className="mt-1 text-sm text-slate-500">Jump straight into everyday CRM tasks</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.label}
                                    onClick={() => navigate(action.path)}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                                        <Icon size={18} />
                                    </span>
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-lg shadow-indigo-200">
                    <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-indigo-100">{isSuperAdmin ? "Team incentive overview" : "Your incentive overview"}</p>
                            <p className="mt-2 text-3xl font-bold">{formatCurrency(incentiveTotal)}</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100">
                                Total incentives recorded for {currentYear}. Keep your pipeline moving and turn follow-ups into completed orders.
                            </p>
                        </div>
                        <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20">
                            <Sparkles size={42} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

AdminDashboardCards.propTypes = {
    dashData: PropTypes.object,
};

export default AdminDashboardCards;
