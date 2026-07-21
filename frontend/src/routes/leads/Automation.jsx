import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowRight,
    BellRing,
    Bot,
    CalendarClock,
    CheckCircle2,
    Loader2,
    Play,
    RefreshCcw,
    Sparkles,
    Target,
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

const AutomationCard = ({ icon: Icon, label, value, caption, tone }) => (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur sm:p-5">
        <div className="flex items-start justify-between gap-3">
            <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={22} />
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">Live</span>
        </div>
        <p className="mt-5 text-[13px] font-bold text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black leading-none text-slate-950 sm:text-[32px]">{value}</p>
        <p className="mt-2 text-sm font-semibold text-slate-400">{caption}</p>
    </div>
);

const EmptyPanel = ({ icon: Icon, title, message }) => (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <Icon size={26} />
        </span>
        <p className="mt-4 text-sm font-black text-slate-800">{title}</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">{message}</p>
    </div>
);

const Automation = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    const loadSummary = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/automation/sales-summary");
            setSummary(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load automation summary");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    const runAutomation = async () => {
        setRunning(true);
        setError("");
        try {
            const res = await api.post("/automation/run");
            setSummary(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to run automation checks");
        } finally {
            setRunning(false);
        }
    };

    const automationCards = useMemo(
        () => [
            {
                label: "Follow-up reminders",
                value: numberValue(summary?.summary?.followupReminders),
                caption: "Due today or tomorrow",
                icon: CalendarClock,
                tone: "bg-blue-50 text-blue-600",
            },
            {
                label: "Stale deal alerts",
                value: numberValue(summary?.summary?.staleDeals),
                caption: `No activity for ${summary?.rules?.staleDealDays || 7}+ days`,
                icon: AlertTriangle,
                tone: "bg-amber-50 text-amber-600",
            },
            {
                label: "Auto-stage suggestions",
                value: numberValue(summary?.summary?.stageSuggestions),
                caption: "Based on quotation/order signals",
                icon: WandSparkles,
                tone: "bg-violet-50 text-violet-600",
            },
            {
                label: "Automation rules",
                value: numberValue(summary?.summary?.activeAutomations),
                caption: "Notifications and smart checks",
                icon: Bot,
                tone: "bg-emerald-50 text-emerald-600",
            },
        ],
        [summary],
    );

    return (
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-4 pb-8 font-['Inter'] text-slate-900 sm:gap-6">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-5 text-white shadow-[0_28px_80px_rgba(37,99,235,0.24)] sm:rounded-[2rem] sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100 ring-1 ring-white/15">
                            <Sparkles size={15} />
                            CRM Automation
                        </span>
                        <h1 className="mt-4 text-2xl font-black leading-tight sm:text-[34px]">Automation Center</h1>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
                            Follow-up reminders, stale deal alerts, smart stage suggestions, and notification triggers for your sales team.
                        </p>
                        <p className="mt-4 text-xs font-bold text-blue-100">Last checked: {formatDateTime(summary?.generatedAt)}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <button
                            type="button"
                            onClick={loadSummary}
                            disabled={loading || running}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-60"
                        >
                            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={runAutomation}
                            disabled={running || loading}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg shadow-blue-950/10 transition hover:bg-blue-50 disabled:opacity-60"
                        >
                            {running ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                            Run Checks Now
                        </button>
                    </div>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                    {error}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {automationCards.map((card) => (
                    <AutomationCard key={card.label} {...card} />
                ))}
            </section>

            {loading ? (
                <div className="grid gap-6 xl:grid-cols-2">
                    {[1, 2].map((item) => (
                        <div key={item} className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
                    ))}
                </div>
            ) : (
                <>
                    <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
                        <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Stale Deal Alerts</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Deals that need attention before they go cold.</p>
                                </div>
                                <BellRing className="text-amber-500" size={24} />
                            </div>
                            {summary?.staleDeals?.length ? (
                                <div className="space-y-3">
                                    {summary.staleDeals.slice(0, 6).map((deal) => (
                                        <button
                                            key={deal.leadId}
                                            type="button"
                                            onClick={() => navigate(`/leads/view-leads/${deal.leadId}`)}
                                            className="flex w-full flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{deal.companyName}</p>
                                                <p className="mt-1 text-xs font-bold text-amber-700">{deal.leadStage} stage • stale for {deal.staleForDays} days</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-sm font-black text-slate-950">{formatCurrency(deal.expectedAmount)}</p>
                                                <ArrowRight size={17} className="ml-auto mt-1 text-amber-600" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <EmptyPanel icon={CheckCircle2} title="No stale deals right now." message="Automation will alert assigned users when open deals have no activity for several days." />
                            )}
                        </div>

                        <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Auto-stage Suggestions</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Smart recommendations from quotations and orders.</p>
                                </div>
                                <WandSparkles className="text-violet-600" size={24} />
                            </div>
                            {summary?.stageSuggestions?.length ? (
                                <div className="space-y-3">
                                    {summary.stageSuggestions.slice(0, 6).map((suggestion) => (
                                        <button
                                            key={`${suggestion.leadId}-${suggestion.suggestedStage}`}
                                            type="button"
                                            onClick={() => navigate(`/leads/opportunities`)}
                                            className="w-full rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                <p className="truncate text-sm font-black text-slate-900">{suggestion.companyName}</p>
                                                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700">{suggestion.suggestedStage}</span>
                                            </div>
                                            <p className="mt-2 text-xs font-bold text-violet-700">{suggestion.currentStage} → {suggestion.suggestedStage}</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-500">{suggestion.reason}</p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <EmptyPanel icon={Target} title="No stage suggestions yet." message="When quotations or orders are created, CRM will suggest the next best pipeline stage." />
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-950">Follow-up Reminder Queue</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Upcoming touchpoints that automation will remind assigned users about.</p>
                            </div>
                            <CalendarClock className="text-blue-600" size={24} />
                        </div>
                        {summary?.followupReminders?.length ? (
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {summary.followupReminders.slice(0, 9).map((followup) => (
                                    <button
                                        key={followup.followupId}
                                        type="button"
                                        onClick={() => navigate("/followup")}
                                        className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                                    >
                                        <p className="truncate text-sm font-black text-slate-900">{followup.companyName}</p>
                                        <p className="mt-2 text-xs font-black uppercase tracking-wide text-blue-700">{followup.urgency}</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">{followup.dueDate}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <EmptyPanel icon={CalendarClock} title="No reminders due." message="Follow-up reminders appear here for today and tomorrow." />
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default Automation;
