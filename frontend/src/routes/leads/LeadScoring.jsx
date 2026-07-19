import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BadgeIndianRupee,
    Brain,
    CalendarClock,
    CheckCircle2,
    Flame,
    Mail,
    PhoneCall,
    Search,
    SlidersHorizontal,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react";
import { getLeads } from "../../redux/actions/leadAndFollowup";

const EMAIL_STORAGE_KEY = "crescosoft_email_inbox_records";
const CALL_STORAGE_KEY = "crescosoft_call_center_logs";

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

const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const loadStoredList = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        return [];
    }
};

const getLeadName = (lead) =>
    lead?.customerPerson ||
    [lead?.salutation, lead?.firstName, lead?.middleName, lead?.lastName].filter(Boolean).join(" ") ||
    "Unknown contact";

const daysUntil = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    return Math.round((parsed - today) / 86400000);
};

const sourceScore = (source = "") => {
    const text = String(source).toLowerCase();
    if (/(referral|website|inbound|partner|campaign|linkedin|google)/.test(text)) return 18;
    if (/(facebook|instagram|social|api|landing)/.test(text)) return 14;
    if (/(cold|manual|walk)/.test(text)) return 8;
    return text ? 10 : 4;
};

const stageScore = (lead) => {
    const stage = String(lead?.leadStage || lead?.leadStatus || "").toLowerCase();
    if (/won/.test(stage)) return 22;
    if (/negotiation/.test(stage)) return 20;
    if (/proposal|quotation/.test(stage)) return 17;
    if (/qualified/.test(stage)) return 14;
    if (/lost/.test(stage)) return 0;
    return 8;
};

const followupScore = (lead) => {
    const followups = Array.isArray(lead?.followups) ? lead.followups.length : 0;
    const dueIn = daysUntil(lead?.followupDate || lead?.nextFollowUpDate);
    let score = Math.min(followups * 4, 12);
    if (dueIn !== null) {
        if (dueIn >= 0 && dueIn <= 2) score += 10;
        else if (dueIn > 2 && dueIn <= 7) score += 7;
        else if (dueIn < 0) score += 2;
        else score += 4;
    }
    return Math.min(score || 4, 20);
};

const amountScore = (amount) => {
    const value = numberValue(amount);
    if (value >= 500000) return 20;
    if (value >= 100000) return 16;
    if (value >= 50000) return 12;
    if (value > 0) return 8;
    return 3;
};

const engagementScore = (lead, emailLogs, callLogs) => {
    const id = String(lead?.id);
    const email = String(lead?.email || "").toLowerCase();
    const name = getLeadName(lead).toLowerCase();
    const company = String(lead?.companyName || "").toLowerCase();
    const mobile = String(lead?.mobile || "");

    const matchingEmails = emailLogs.filter((item) => {
        const contactId = String(item.contactId || item.recipientId || "");
        return contactId.includes(id) || String(item.email || "").toLowerCase() === email || String(item.to || "").toLowerCase() === email;
    }).length;

    const matchingCalls = callLogs.filter((item) => {
        const contactId = String(item.contactId || "");
        return (
            contactId.includes(id) ||
            String(item.phone || "").includes(mobile) ||
            String(item.name || "").toLowerCase() === name ||
            String(item.companyName || "").toLowerCase() === company
        );
    }).length;

    return Math.min(matchingEmails * 5 + matchingCalls * 6 + (lead?.email ? 2 : 0) + (lead?.mobile ? 2 : 0), 20);
};

const getScoreBand = (score) => {
    if (score >= 75) return { label: "Hot", tone: "bg-rose-50 text-rose-700 border-rose-100", bar: "bg-rose-500" };
    if (score >= 50) return { label: "Warm", tone: "bg-amber-50 text-amber-700 border-amber-100", bar: "bg-amber-500" };
    return { label: "Cold", tone: "bg-sky-50 text-sky-700 border-sky-100", bar: "bg-sky-500" };
};

const buildSuggestion = (lead, score) => {
    if (score >= 75) return "Prioritize today. Strong engagement and deal value indicate high conversion potential.";
    if (!lead?.followupDate && !lead?.nextFollowUpDate) return "Add a follow-up date to improve sales tracking.";
    if (!numberValue(lead?.expectedAmount)) return "Add expected amount so forecast and score become more accurate.";
    if (!lead?.email && !lead?.mobile) return "Add contact details before moving this lead forward.";
    return "Nurture with call or email and move to next stage after customer response.";
};

const MetricCard = ({ icon: Icon, label, value, caption, tone }) => (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
            <Icon size={22} />
        </div>
        <p className="mt-5 text-sm font-black text-slate-500">{label}</p>
        <p className="mt-2 text-[34px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-3 text-xs font-bold text-slate-400">{caption}</p>
    </div>
);

const LeadScoring = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { leads = [], leadLoading } = useSelector((state) => state.leadAndFollowup);
    const [query, setQuery] = useState("");
    const [bandFilter, setBandFilter] = useState("All");
    const [emailLogs, setEmailLogs] = useState([]);
    const [callLogs, setCallLogs] = useState([]);

    useEffect(() => {
        dispatch(getLeads());
        setEmailLogs(loadStoredList(EMAIL_STORAGE_KEY));
        setCallLogs(loadStoredList(CALL_STORAGE_KEY));
    }, [dispatch]);

    const scoredLeads = useMemo(
        () =>
            leads
                .map((lead) => {
                    const parts = {
                        source: sourceScore(lead.leadSource),
                        activity: followupScore(lead),
                        amount: amountScore(lead.expectedAmount),
                        engagement: engagementScore(lead, emailLogs, callLogs),
                        stage: stageScore(lead),
                    };
                    const score = Math.min(Object.values(parts).reduce((sum, value) => sum + value, 0), 100);
                    const band = getScoreBand(score);
                    return {
                        ...lead,
                        score,
                        parts,
                        band,
                        suggestion: buildSuggestion(lead, score),
                    };
                })
                .sort((a, b) => b.score - a.score),
        [leads, emailLogs, callLogs],
    );

    const filteredLeads = useMemo(() => {
        const term = query.trim().toLowerCase();
        return scoredLeads.filter((lead) => {
            const matchesBand = bandFilter === "All" || lead.band.label === bandFilter;
            const matchesQuery =
                !term ||
                [lead.companyName, getLeadName(lead), lead.mobile, lead.email, lead.leadSource, lead.leadStage, lead.leadStatus]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(term));
            return matchesBand && matchesQuery;
        });
    }, [scoredLeads, query, bandFilter]);

    const summary = useMemo(() => {
        const total = scoredLeads.length;
        const average = total ? Math.round(scoredLeads.reduce((sum, lead) => sum + lead.score, 0) / total) : 0;
        return {
            total,
            hot: scoredLeads.filter((lead) => lead.band.label === "Hot").length,
            warm: scoredLeads.filter((lead) => lead.band.label === "Warm").length,
            average,
        };
    }, [scoredLeads]);

    return (
        <div className="space-y-7 bg-slate-50 px-5 py-6 md:px-8">
            <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-7 text-white shadow-[0_28px_70px_rgba(37,99,235,0.22)] md:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-50">
                            <Sparkles size={15} />
                            Deal Intelligence
                        </span>
                        <h1 className="mt-4 text-[34px] font-black leading-tight md:text-[42px]">Lead Scoring</h1>
                        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
                            Automatically prioritize leads using source quality, follow-up activity, deal amount, stage progress, calls, and email engagement.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/leads/pipeline")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5"
                    >
                        View Pipeline
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={Brain} label="Scored leads" value={summary.total} caption="All available lead records" tone="bg-blue-50 text-blue-600" />
                <MetricCard icon={Flame} label="Hot leads" value={summary.hot} caption="Score 75 and above" tone="bg-rose-50 text-rose-600" />
                <MetricCard icon={Target} label="Warm leads" value={summary.warm} caption="Score 50 to 74" tone="bg-amber-50 text-amber-600" />
                <MetricCard icon={TrendingUp} label="Average score" value={summary.average} caption="Overall lead quality" tone="bg-emerald-50 text-emerald-600" />
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Scoring Queue</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Highest-priority leads are shown first for sales follow-up.</p>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative min-w-[280px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search lead, company, source..."
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={bandFilter}
                                onChange={(event) => setBandFilter(event.target.value)}
                                className="h-12 min-w-[170px] rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            >
                                <option>All</option>
                                <option>Hot</option>
                                <option>Warm</option>
                                <option>Cold</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                    {leadLoading && !filteredLeads.length ? (
                        <div className="p-6">
                            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
                        </div>
                    ) : filteredLeads.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1080px] text-left text-sm">
                                <thead className="bg-slate-950 text-xs uppercase tracking-[0.12em] text-white">
                                    <tr>
                                        <th className="px-4 py-4">Lead</th>
                                        <th className="px-4 py-4">Score</th>
                                        <th className="px-4 py-4">Source</th>
                                        <th className="px-4 py-4">Activity</th>
                                        <th className="px-4 py-4">Deal Amount</th>
                                        <th className="px-4 py-4">Engagement</th>
                                        <th className="px-4 py-4">Suggestion</th>
                                        <th className="px-4 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="align-top transition hover:bg-blue-50/40">
                                            <td className="px-4 py-4">
                                                <p className="font-black text-slate-950">{lead.companyName || "Untitled lead"}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">{getLeadName(lead)}</p>
                                                <p className="mt-2 text-xs font-bold text-slate-400">{lead.leadStage || lead.leadStatus || "No stage"}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-black text-slate-950">{lead.score}</span>
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${lead.band.tone}`}>{lead.band.label}</span>
                                                </div>
                                                <div className="mt-3 h-2 w-36 rounded-full bg-slate-100">
                                                    <div className={`h-full rounded-full ${lead.band.bar}`} style={{ width: `${lead.score}%` }} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-bold text-slate-700">{lead.leadSource || "-"}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">+{lead.parts.source} pts</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="flex items-center gap-2 font-bold text-slate-700">
                                                    <CalendarClock size={15} className="text-blue-600" />
                                                    {formatDate(lead.followupDate || lead.nextFollowUpDate)}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">+{lead.parts.activity} pts</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="flex items-center gap-2 font-black text-slate-800">
                                                    <BadgeIndianRupee size={15} className="text-emerald-600" />
                                                    {formatCurrency(lead.expectedAmount)}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">+{lead.parts.amount} pts</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2 text-xs font-black">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                                        <Mail size={13} />
                                                        Email
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                                        <PhoneCall size={13} />
                                                        Call
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs font-semibold text-slate-400">+{lead.parts.engagement} pts</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="max-w-xs text-xs font-semibold leading-5 text-slate-600">{lead.suggestion}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/leads/view-leads/${lead.id}`)}
                                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                                                >
                                                    View
                                                    <ArrowRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex min-h-[260px] flex-col items-center justify-center bg-slate-50/70 p-8 text-center">
                            <span className="flex size-16 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
                                <CheckCircle2 size={30} />
                            </span>
                            <p className="mt-4 text-base font-black text-slate-900">No leads found for this score filter.</p>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Change the filter or create a lead with source, follow-up, expected amount, call, or email activity.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LeadScoring;
