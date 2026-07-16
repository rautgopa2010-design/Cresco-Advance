import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowRight,
    Brain,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    Loader2,
    RefreshCcw,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingUp,
    WandSparkles,
} from "lucide-react";
import api from "../../utils/api";

const numberValue = (value) => Number(value) || 0;

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(numberValue(value));

const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const riskTone = {
    High: "border-red-100 bg-red-50 text-red-700",
    Medium: "border-amber-100 bg-amber-50 text-amber-700",
    Low: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const SummaryCard = ({ icon: Icon, label, value, caption, tone }) => (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
        <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}>
            <Icon size={22} />
        </span>
        <p className="mt-5 text-[13px] font-bold text-slate-500">{label}</p>
        <p className="mt-1 text-[32px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-2 text-sm font-semibold text-slate-400">{caption}</p>
    </div>
);

const EmptyState = () => (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
            <CheckCircle2 size={30} />
        </span>
        <p className="mt-4 text-base font-black text-slate-900">No AI suggestions yet.</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Suggestions will appear when leads have activity, follow-ups, quotations, orders, expected amounts, or stale deal signals.
        </p>
    </div>
);

const AiSuggestions = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    const loadSuggestions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/ai-suggestions");
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load AI suggestions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, []);

    const filteredSuggestions = useMemo(() => {
        const suggestions = data?.suggestions || [];
        if (filter === "All") return suggestions;
        return suggestions.filter((item) => item.riskLevel === filter);
    }, [data, filter]);

    const topRisks = filteredSuggestions.slice(0, 6);
    const nextActions = filteredSuggestions.filter((item) => item.nextBestAction).slice(0, 6);
    const probabilitySuggestions = filteredSuggestions
        .filter((item) => item.suggestedProbability >= 0)
        .slice(0, 6);

    const summaryCards = [
        {
            label: "Deals analyzed",
            value: numberValue(data?.summary?.totalDeals),
            caption: "Open and closed lead records",
            icon: Brain,
            tone: "bg-blue-50 text-blue-600",
        },
        {
            label: "High risk deals",
            value: numberValue(data?.summary?.highRisk),
            caption: "Need attention first",
            icon: ShieldAlert,
            tone: "bg-red-50 text-red-600",
        },
        {
            label: "Next actions",
            value: numberValue(data?.summary?.nextActions),
            caption: "Recommended sales steps",
            icon: WandSparkles,
            tone: "bg-violet-50 text-violet-600",
        },
        {
            label: "Probability changes",
            value: numberValue(data?.summary?.probabilityChanges),
            caption: "Suggested forecast adjustments",
            icon: TrendingUp,
            tone: "bg-emerald-50 text-emerald-600",
        },
    ];

    return (
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8 font-['Inter'] text-slate-900">
            <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-900 p-8 text-white shadow-[0_28px_80px_rgba(37,99,235,0.24)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100 ring-1 ring-white/15">
                            <Sparkles size={15} />
                            CRM Intelligence
                        </span>
                        <h1 className="mt-4 text-[34px] font-black leading-tight">AI Suggestions</h1>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
                            Deal risk, next best action, follow-up guidance, and probability suggestions from your CRM signals.
                        </p>
                        <p className="mt-4 text-xs font-bold text-blue-100">Last analyzed: {formatDateTime(data?.generatedAt)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadSuggestions}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg shadow-blue-950/10 transition hover:bg-blue-50 disabled:opacity-60"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                        Refresh Suggestions
                    </button>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                    {error}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <SummaryCard key={card.label} {...card} />
                ))}
            </section>

            <div className="flex flex-wrap items-center gap-2">
                {["All", "High", "Medium", "Low"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setFilter(item)}
                        className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                            filter === item ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                    >
                        {item} Risk
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid gap-6 xl:grid-cols-2">
                    {[1, 2].map((item) => (
                        <div key={item} className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
                    ))}
                </div>
            ) : filteredSuggestions.length ? (
                <>
                    <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
                        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Deal Risk</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Prioritized deals that need sales attention.</p>
                                </div>
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>
                            <div className="space-y-3">
                                {topRisks.map((deal) => (
                                    <button
                                        key={deal.leadId}
                                        type="button"
                                        onClick={() => navigate(`/leads/view-leads/${deal.leadId}`)}
                                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{deal.companyName}</p>
                                                <p className="mt-1 text-xs font-bold text-slate-500">{deal.currentStage} • {formatCurrency(deal.expectedAmount)}</p>
                                            </div>
                                            <span className={`rounded-full border px-3 py-1 text-xs font-black ${riskTone[deal.riskLevel]}`}>
                                                {deal.riskLevel} {deal.riskScore}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {deal.riskReasons.slice(0, 3).map((reason) => (
                                                <span key={reason} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Next Best Action</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Recommended action for each deal.</p>
                                </div>
                                <Target className="text-blue-600" size={24} />
                            </div>
                            <div className="space-y-3">
                                {nextActions.map((deal) => (
                                    <button
                                        key={deal.leadId}
                                        type="button"
                                        onClick={() => navigate("/leads/opportunities")}
                                        className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{deal.companyName}</p>
                                                <p className="mt-2 text-sm font-bold text-blue-700">{deal.nextBestAction}</p>
                                            </div>
                                            <ArrowRight size={18} className="mt-1 shrink-0 text-blue-600" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
                        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Follow-up Suggestions</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Suggested customer touchpoints.</p>
                                </div>
                                <CalendarClock className="text-violet-600" size={24} />
                            </div>
                            <div className="space-y-3">
                                {filteredSuggestions.slice(0, 6).map((deal) => (
                                    <button
                                        key={deal.leadId}
                                        type="button"
                                        onClick={() => navigate("/followup")}
                                        className="w-full rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                                    >
                                        <p className="truncate text-sm font-black text-slate-900">{deal.companyName}</p>
                                        <p className="mt-2 text-sm font-bold text-violet-700">{deal.followupSuggestion}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Probability Suggestions</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Forecast probability based on CRM signals.</p>
                                </div>
                                <CircleDollarSign className="text-emerald-600" size={24} />
                            </div>
                            <div className="space-y-3">
                                {probabilitySuggestions.map((deal) => (
                                    <div key={deal.leadId} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{deal.companyName}</p>
                                                <p className="mt-1 text-xs font-bold text-slate-500">{deal.currentStage} → {deal.suggestedStage}</p>
                                            </div>
                                            <span className="text-2xl font-black text-emerald-700">{deal.suggestedProbability}%</span>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${deal.suggestedProbability}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <EmptyState />
            )}
        </div>
    );
};

export default AiSuggestions;
