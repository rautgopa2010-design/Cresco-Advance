import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import {
    ArrowRight,
    BadgeIndianRupee,
    CalendarDays,
    CircleDollarSign,
    Filter,
    LineChart,
    PieChart,
    Search,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react";
import { getLeads } from "../../redux/actions/leadAndFollowup";

const STAGES = [
    { key: "New", status: "Open", probability: 10, color: "#0EA5E9", badge: "bg-sky-50 text-sky-700 border-sky-100" },
    { key: "Qualified", status: "In Progress", probability: 30, color: "#4F46E5", badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { key: "Proposal", status: "Quotation Sent", probability: 50, color: "#8B5CF6", badge: "bg-violet-50 text-violet-700 border-violet-100" },
    { key: "Negotiation", status: "Waiting for Customer", probability: 75, color: "#F59E0B", badge: "bg-amber-50 text-amber-700 border-amber-100" },
    { key: "Won", status: "Won", probability: 100, color: "#22C55E", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { key: "Lost", status: "Lost", probability: 0, color: "#EF4444", badge: "bg-rose-50 text-rose-700 border-rose-100" },
];

const stageByKey = Object.fromEntries(STAGES.map((stage) => [stage.key, stage]));

const numberValue = (value) => {
    const parsed = Number(String(value || 0).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(numberValue(value));

const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const normalizeStage = (lead) => {
    const stage = String(lead?.leadStage || "").trim().toLowerCase();
    const status = String(lead?.leadStatus || "").trim().toLowerCase();
    const match = STAGES.find((item) => item.key.toLowerCase() === stage || item.key.toLowerCase() === status || item.status.toLowerCase() === status);
    return match?.key || "New";
};

const monthKey = (date) => {
    const parsed = date ? new Date(date) : new Date();
    const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key) => {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const getAssignedName = (lead) => {
    if (Array.isArray(lead?.assignedTo)) return lead.assignedTo.join(", ") || "Unassigned";
    return lead?.assignedTo || "Unassigned";
};

const RevenueForecasting = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { leads = [], leadLoading } = useSelector((state) => state.leadAndFollowup);
    const [query, setQuery] = useState("");
    const [stageFilter, setStageFilter] = useState("All");
    const [monthFilter, setMonthFilter] = useState("All");

    useEffect(() => {
        dispatch(getLeads());
    }, [dispatch]);

    const forecastRows = useMemo(
        () =>
            leads.map((lead) => {
                const stageKey = normalizeStage(lead);
                const stage = stageByKey[stageKey] || stageByKey.New;
                const amount = numberValue(lead.expectedAmount);
                const forecast = (amount * stage.probability) / 100;
                const closeMonth = monthKey(lead.expectedClosingDate);
                return {
                    ...lead,
                    stageKey,
                    stage,
                    amount,
                    forecast,
                    closeMonth,
                };
            }),
        [leads],
    );

    const monthOptions = useMemo(() => {
        const keys = [...new Set(forecastRows.map((row) => row.closeMonth))].sort();
        return keys;
    }, [forecastRows]);

    const filteredRows = useMemo(() => {
        const search = query.trim().toLowerCase();
        return forecastRows.filter((row) => {
            const matchesStage = stageFilter === "All" || row.stageKey === stageFilter;
            const matchesMonth = monthFilter === "All" || row.closeMonth === monthFilter;
            const matchesSearch =
                !search ||
                [row.companyName, row.customerPerson, row.mobile, row.email, row.leadSource, row.leadStatus, row.leadStage, getAssignedName(row)]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(search));
            return matchesStage && matchesMonth && matchesSearch;
        });
    }, [forecastRows, query, stageFilter, monthFilter]);

    const metrics = useMemo(() => {
        const pipelineValue = filteredRows.reduce((sum, row) => sum + row.amount, 0);
        const weightedForecast = filteredRows.reduce((sum, row) => sum + row.forecast, 0);
        const wonForecast = filteredRows.filter((row) => row.stageKey === "Won").reduce((sum, row) => sum + row.amount, 0);
        const openForecast = filteredRows.filter((row) => !["Won", "Lost"].includes(row.stageKey)).reduce((sum, row) => sum + row.forecast, 0);
        return { pipelineValue, weightedForecast, wonForecast, openForecast, deals: filteredRows.length };
    }, [filteredRows]);

    const monthlyForecast = useMemo(() => {
        const grouped = filteredRows.reduce((acc, row) => {
            if (!acc[row.closeMonth]) acc[row.closeMonth] = { month: row.closeMonth, pipeline: 0, forecast: 0, won: 0 };
            acc[row.closeMonth].pipeline += row.amount;
            acc[row.closeMonth].forecast += row.forecast;
            if (row.stageKey === "Won") acc[row.closeMonth].won += row.amount;
            return acc;
        }, {});
        return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
    }, [filteredRows]);

    const stageBreakdown = useMemo(
        () =>
            STAGES.map((stage) => {
                const rows = filteredRows.filter((row) => row.stageKey === stage.key);
                const value = rows.reduce((sum, row) => sum + row.amount, 0);
                const forecast = rows.reduce((sum, row) => sum + row.forecast, 0);
                return { ...stage, count: rows.length, value, forecast };
            }),
        [filteredRows],
    );

    const chartLabels = monthlyForecast.map((item) => monthLabel(item.month));
    const chartOptions = {
        chart: { toolbar: { show: false }, animations: { enabled: true, easing: "easeinout", speed: 800 } },
        colors: ["#2563EB", "#22C55E", "#8B5CF6"],
        stroke: { curve: "smooth", width: 4 },
        fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        grid: { borderColor: "#E2E8F0", strokeDashArray: 5 },
        xaxis: { categories: chartLabels, labels: { style: { colors: "#64748B", fontWeight: 700 } } },
        yaxis: { labels: { formatter: (value) => formatCurrency(value), style: { colors: "#64748B", fontWeight: 700 } } },
        legend: { position: "top", horizontalAlign: "right", labels: { colors: "#334155" } },
        tooltip: { y: { formatter: (value) => formatCurrency(value) } },
    };

    return (
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 pb-8">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-[#073763] p-8 text-white shadow-2xl shadow-blue-900/20">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em]">
                            <Sparkles size={15} />
                            Revenue Intelligence
                        </div>
                        <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[42px]">Revenue Forecasting</h1>
                        <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-blue-50">
                            Forecast expected revenue using deal value, close date, pipeline stage and stage-wise probability.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => navigate("/leads/pipeline")} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5">
                            Open Pipeline
                            <ArrowRight size={17} />
                        </button>
                        <button onClick={() => navigate("/leads/opportunities")} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">
                            Manage Opportunities
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                    { label: "Deals forecasted", value: metrics.deals, icon: Target, formatter: (value) => value },
                    { label: "Pipeline value", value: metrics.pipelineValue, icon: CircleDollarSign, formatter: formatCurrency },
                    { label: "Weighted forecast", value: metrics.weightedForecast, icon: TrendingUp, formatter: formatCurrency },
                    { label: "Open forecast", value: metrics.openForecast, icon: LineChart, formatter: formatCurrency },
                    { label: "Won revenue", value: metrics.wonForecast, icon: BadgeIndianRupee, formatter: formatCurrency },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Icon size={22} />
                            </span>
                            <p className="mt-5 text-[13px] font-bold text-slate-500">{item.label}</p>
                            <p className="mt-1 truncate text-[28px] font-black text-slate-950">{item.formatter(item.value)}</p>
                        </div>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Monthly forecast</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Pipeline value vs weighted forecast by expected closing month.</p>
                        </div>
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <LineChart size={21} />
                        </span>
                    </div>
                    {monthlyForecast.length ? (
                        <Chart
                            options={chartOptions}
                            series={[
                                { name: "Pipeline value", data: monthlyForecast.map((item) => item.pipeline) },
                                { name: "Weighted forecast", data: monthlyForecast.map((item) => item.forecast) },
                                { name: "Won revenue", data: monthlyForecast.map((item) => item.won) },
                            ]}
                            type="area"
                            height={330}
                        />
                    ) : (
                        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                            <div>
                                <LineChart className="mx-auto text-slate-300" size={42} />
                                <p className="mt-3 text-lg font-black text-slate-700">No forecast data yet</p>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Add expected amount and closing date on leads to forecast revenue.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Stage probability</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Forecast is calculated using these stage probabilities.</p>
                        </div>
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                            <PieChart size={21} />
                        </span>
                    </div>
                    <div className="space-y-3">
                        {stageBreakdown.map((stage) => (
                            <div key={stage.key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${stage.badge}`}>{stage.key}</span>
                                    <span className="text-sm font-black text-slate-900">{stage.probability}%</span>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <p className="font-bold text-slate-400">Deals</p>
                                        <p className="mt-1 font-black text-slate-900">{stage.count}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-400">Value</p>
                                        <p className="mt-1 font-black text-slate-900">{formatCurrency(stage.value)}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-400">Forecast</p>
                                        <p className="mt-1 font-black text-blue-700">{formatCurrency(stage.forecast)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Forecast detail</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Review every opportunity contributing to the forecast.</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                        <div className="relative min-w-0 flex-1 xl:w-[320px]">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search forecast..." className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                        </div>
                        <div className="relative">
                            <Filter size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                                <option value="All">All stages</option>
                                {STAGES.map((stage) => <option key={stage.key} value={stage.key}>{stage.key}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <CalendarDays size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                                <option value="All">All months</option>
                                {monthOptions.map((key) => <option key={key} value={key}>{monthLabel(key)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                <div className="overflow-x-auto">
                    <table className="min-w-[1120px] w-full text-left">
                        <thead className="bg-[#053054] text-white">
                            <tr>
                                {["Opportunity", "Close Month", "Stage", "Probability", "Pipeline Value", "Forecast Value", "Close Date", "Owner"].map((head) => (
                                    <th key={head} className="px-5 py-4 text-sm font-black">{head}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leadLoading && !filteredRows.length ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={8} className="px-5 py-4"><div className="h-12 animate-pulse rounded-2xl bg-slate-100" /></td>
                                    </tr>
                                ))
                            ) : filteredRows.length ? (
                                filteredRows.map((row) => (
                                    <tr key={row.id} className="transition hover:bg-blue-50/50">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-black text-slate-950">{row.companyName || "Untitled opportunity"}</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-500">{row.customerPerson || "No customer person"}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-700">{monthLabel(row.closeMonth)}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full border px-3 py-1.5 text-xs font-black ${row.stage.badge}`}>{row.stageKey}</span></td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-700">{row.stage.probability}%</td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-950">{formatCurrency(row.amount)}</td>
                                        <td className="px-5 py-4 text-sm font-black text-blue-700">{formatCurrency(row.forecast)}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-600">{formatDate(row.expectedClosingDate)}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-600">{getAssignedName(row)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center">
                                        <TrendingUp size={40} className="mx-auto text-slate-300" />
                                        <p className="mt-4 text-lg font-black text-slate-700">No matching forecast records</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">Clear filters or create opportunities with expected amount and close date.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default RevenueForecasting;
