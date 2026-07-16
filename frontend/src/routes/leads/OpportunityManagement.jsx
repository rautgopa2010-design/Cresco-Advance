import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BadgeIndianRupee,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Edit3,
    Eye,
    Filter,
    Search,
    Sparkles,
    Target,
    TrendingUp,
    UserRound,
} from "lucide-react";
import { getLeads, updateLeadPipeline } from "../../redux/actions/leadAndFollowup";

const STAGES = [
    { key: "New", status: "Open", probability: 10, badge: "bg-sky-50 text-sky-700 border-sky-100" },
    { key: "Qualified", status: "In Progress", probability: 30, badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { key: "Proposal", status: "Quotation Sent", probability: 50, badge: "bg-violet-50 text-violet-700 border-violet-100" },
    { key: "Negotiation", status: "Waiting for Customer", probability: 75, badge: "bg-amber-50 text-amber-700 border-amber-100" },
    { key: "Won", status: "Won", probability: 100, badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { key: "Lost", status: "Lost", probability: 0, badge: "bg-rose-50 text-rose-700 border-rose-100" },
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

const getAssignedName = (lead) => {
    if (Array.isArray(lead?.assignedTo)) return lead.assignedTo.join(", ") || "Unassigned";
    return lead?.assignedTo || "Unassigned";
};

const OpportunityManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { leads = [], leadLoading } = useSelector((state) => state.leadAndFollowup);
    const [query, setQuery] = useState("");
    const [stageFilter, setStageFilter] = useState("All");
    const [updatingLeadId, setUpdatingLeadId] = useState(null);

    useEffect(() => {
        dispatch(getLeads());
    }, [dispatch]);

    const enrichedDeals = useMemo(
        () =>
            leads.map((lead) => {
                const stageKey = normalizeStage(lead);
                const stage = stageByKey[stageKey] || stageByKey.New;
                const amount = numberValue(lead.expectedAmount);
                return {
                    ...lead,
                    stageKey,
                    stage,
                    amount,
                    forecast: (amount * stage.probability) / 100,
                };
            }),
        [leads],
    );

    const filteredDeals = useMemo(() => {
        const search = query.trim().toLowerCase();
        return enrichedDeals.filter((deal) => {
            const matchesStage = stageFilter === "All" || deal.stageKey === stageFilter;
            const matchesSearch =
                !search ||
                [deal.companyName, deal.customerPerson, deal.mobile, deal.email, deal.leadSource, deal.leadStatus, deal.leadStage, getAssignedName(deal)]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(search));
            return matchesStage && matchesSearch;
        });
    }, [enrichedDeals, query, stageFilter]);

    const metrics = useMemo(() => {
        const openDeals = filteredDeals.filter((deal) => !["Won", "Lost"].includes(deal.stageKey)).length;
        const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0);
        const forecastValue = filteredDeals.reduce((sum, deal) => sum + deal.forecast, 0);
        const wonValue = filteredDeals.filter((deal) => deal.stageKey === "Won").reduce((sum, deal) => sum + deal.amount, 0);
        return { openDeals, totalValue, forecastValue, wonValue };
    }, [filteredDeals]);

    const handleStageChange = async (leadId, nextStageKey) => {
        const stage = stageByKey[nextStageKey];
        if (!stage) return;
        setUpdatingLeadId(leadId);
        try {
            await dispatch(updateLeadPipeline(leadId, { leadStage: stage.key, leadStatus: stage.status }));
            await dispatch(getLeads());
        } finally {
            setUpdatingLeadId(null);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 pb-8">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-[#073763] p-8 text-white shadow-2xl shadow-blue-900/20">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em]">
                            <Sparkles size={15} />
                            Deal Management
                        </div>
                        <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[42px]">Opportunities</h1>
                        <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-blue-50">
                            Manage deal ownership, stage, status, expected amount, close date and forecast value from one focused workspace.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/leads/pipeline")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5"
                        >
                            Open Pipeline Board
                            <ArrowRight size={17} />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/leads/revenue-forecast")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
                        >
                            Revenue Forecast
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/leads/create-leads")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
                        >
                            Create Lead
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "Open opportunities", value: metrics.openDeals, icon: BriefcaseBusiness, formatter: (value) => value },
                    { label: "Pipeline value", value: metrics.totalValue, icon: CircleDollarSign, formatter: formatCurrency },
                    { label: "Forecast value", value: metrics.forecastValue, icon: TrendingUp, formatter: formatCurrency },
                    { label: "Won value", value: metrics.wonValue, icon: BadgeIndianRupee, formatter: formatCurrency },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur"
                        >
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Icon size={22} />
                            </span>
                            <p className="mt-5 text-[13px] font-bold text-slate-500">{item.label}</p>
                            <p className="mt-1 truncate text-[30px] font-black text-slate-950">{item.formatter(item.value)}</p>
                        </div>
                    );
                })}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Opportunity control</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Search deals, filter by stage, and update deal progress without opening the full edit form.</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                        <div className="relative min-w-0 flex-1 xl:w-[360px]">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search company, customer, mobile..."
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="relative">
                            <Filter
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <select
                                value={stageFilter}
                                onChange={(event) => setStageFilter(event.target.value)}
                                className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="All">All stages</option>
                                {STAGES.map((stage) => (
                                    <option
                                        key={stage.key}
                                        value={stage.key}
                                    >
                                        {stage.key}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                <div className="overflow-x-auto">
                    <table className="min-w-[1180px] w-full text-left">
                        <thead className="bg-[#053054] text-white">
                            <tr>
                                {["Opportunity", "Owner", "Stage", "Status", "Expected", "Forecast", "Close Date", "Actions"].map((head) => (
                                    <th
                                        key={head}
                                        className="px-5 py-4 text-sm font-black"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leadLoading && !filteredDeals.length ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-4"
                                        >
                                            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredDeals.length ? (
                                filteredDeals.map((deal) => (
                                    <tr
                                        key={deal.id}
                                        className="transition hover:bg-blue-50/50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                    <Target size={20} />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-black text-slate-950">{deal.companyName || "Untitled opportunity"}</p>
                                                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{deal.customerPerson || "No customer person"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                                            <span className="inline-flex items-center gap-2">
                                                <UserRound size={15} />
                                                {getAssignedName(deal)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <select
                                                value={deal.stageKey}
                                                disabled={updatingLeadId === deal.id}
                                                onChange={(event) => handleStageChange(deal.id, event.target.value)}
                                                className={`h-10 rounded-xl border px-3 text-sm font-black outline-none transition focus:ring-4 focus:ring-blue-100 ${deal.stage.badge}`}
                                            >
                                                {STAGES.map((stage) => (
                                                    <option
                                                        key={stage.key}
                                                        value={stage.key}
                                                    >
                                                        {stage.key} ({stage.probability}%)
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${deal.stage.badge}`}>
                                                <CheckCircle2 size={14} />
                                                {deal.stage.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-950">{formatCurrency(deal.amount)}</td>
                                        <td className="px-5 py-4 text-sm font-black text-blue-700">{formatCurrency(deal.forecast)}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays size={15} />
                                                {formatDate(deal.expectedClosingDate)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/leads/view-leads/${deal.id}`)}
                                                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    title="View"
                                                >
                                                    <Eye size={17} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/leads/edit-leads/${deal.id}`)}
                                                    className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-16 text-center"
                                    >
                                        <Target
                                            size={38}
                                            className="mx-auto text-slate-300"
                                        />
                                        <p className="mt-4 text-lg font-black text-slate-700">No opportunities found</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">Create a lead or clear filters to see opportunities here.</p>
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

export default OpportunityManagement;
