import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CalendarDays, CircleDollarSign, Filter, GripVertical, Search, Sparkles, Target, TrendingUp, UserRound } from "lucide-react";
import { getLeads, updateLeadPipeline } from "../../redux/actions/leadAndFollowup";

const PIPELINE_STAGES = [
    { key: "New", probability: 10, color: "from-sky-500 to-blue-600", border: "border-sky-300" },
    { key: "Qualified", probability: 30, color: "from-indigo-500 to-blue-700", border: "border-indigo-300" },
    { key: "Proposal", probability: 50, color: "from-violet-500 to-purple-700", border: "border-violet-300" },
    { key: "Negotiation", probability: 75, color: "from-amber-500 to-orange-600", border: "border-amber-300" },
    { key: "Won", probability: 100, color: "from-emerald-500 to-green-700", border: "border-emerald-300" },
    { key: "Lost", probability: 0, color: "from-rose-500 to-red-700", border: "border-rose-300" },
];

const normalizeStage = (lead) => {
    const rawStage = String(lead?.leadStage || "").trim().toLowerCase();
    const rawStatus = String(lead?.leadStatus || "").trim().toLowerCase();
    const match = PIPELINE_STAGES.find((stage) => stage.key.toLowerCase() === rawStage || stage.key.toLowerCase() === rawStatus);
    return match?.key || "New";
};

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

const getAssignedName = (lead) => {
    if (Array.isArray(lead?.assignedTo)) return lead.assignedTo.join(", ") || "Unassigned";
    return lead?.assignedTo || "Unassigned";
};

const LeadPipeline = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { leads = [], leadLoading } = useSelector((state) => state.leadAndFollowup);
    const [draggedLeadId, setDraggedLeadId] = useState(null);
    const [query, setQuery] = useState("");
    const [updatingLeadId, setUpdatingLeadId] = useState(null);

    useEffect(() => {
        dispatch(getLeads());
    }, [dispatch]);

    const filteredLeads = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return leads;
        return leads.filter((lead) =>
            [lead.companyName, lead.customerPerson, lead.mobile, lead.email, lead.leadSource, lead.leadStatus, lead.leadStage]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(search)),
        );
    }, [leads, query]);

    const leadsByStage = useMemo(() => {
        const groups = PIPELINE_STAGES.reduce((acc, stage) => ({ ...acc, [stage.key]: [] }), {});
        filteredLeads.forEach((lead) => {
            groups[normalizeStage(lead)].push(lead);
        });
        return groups;
    }, [filteredLeads]);

    const totals = useMemo(() => {
        const totalValue = filteredLeads.reduce((sum, lead) => sum + numberValue(lead.expectedAmount), 0);
        const forecastValue = PIPELINE_STAGES.reduce((sum, stage) => {
            const stageValue = (leadsByStage[stage.key] || []).reduce((innerSum, lead) => innerSum + numberValue(lead.expectedAmount), 0);
            return sum + (stageValue * stage.probability) / 100;
        }, 0);
        return { totalValue, forecastValue, totalDeals: filteredLeads.length };
    }, [filteredLeads, leadsByStage]);

    const handleDrop = async (stageKey) => {
        if (!draggedLeadId) return;
        const lead = leads.find((item) => String(item.id) === String(draggedLeadId));
        setDraggedLeadId(null);
        if (!lead || normalizeStage(lead) === stageKey) return;

        const leadStatus = ["Won", "Lost"].includes(stageKey) ? stageKey : lead.leadStatus || "Open";
        setUpdatingLeadId(lead.id);
        try {
            await dispatch(updateLeadPipeline(lead.id, { leadStage: stageKey, leadStatus }));
            await dispatch(getLeads());
        } finally {
            setUpdatingLeadId(null);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 pb-8">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-[#073763] p-8 text-white shadow-2xl shadow-blue-900/20">
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em]">
                            <Sparkles size={15} />
                            Cresco Advance
                        </div>
                        <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[42px]">Deal / Opportunity Pipeline</h1>
                        <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-blue-50">
                            Manage sales opportunities from new interest to won revenue with drag-and-drop stages and stage-wise forecasting.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                        {[
                            { label: "Total deals", value: totals.totalDeals, icon: Target },
                            { label: "Pipeline value", value: formatCurrency(totals.totalValue), icon: CircleDollarSign },
                            { label: "Forecast revenue", value: formatCurrency(totals.forecastValue), icon: TrendingUp },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg shadow-slate-950/10 backdrop-blur"
                                >
                                    <Icon
                                        size={20}
                                        className="mb-3 text-blue-100"
                                    />
                                    <p className="text-xs font-bold uppercase tracking-wide text-blue-100">{item.label}</p>
                                    <p className="mt-1 text-2xl font-black">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Pipeline board</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Drag a deal card to update its opportunity stage.</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        <button
                            type="button"
                            onClick={() => navigate("/leads/opportunities")}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                            Manage Opportunities
                            <ArrowRight size={17} />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/leads/revenue-forecast")}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                            Revenue Forecast
                        </button>
                        <div className="relative min-w-0 flex-1 lg:w-[360px]">
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
                        <button
                            type="button"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm"
                        >
                            <Filter size={17} />
                            {filteredLeads.length} deals
                        </button>
                    </div>
                </div>
            </section>

            {leadLoading && !leads.length ? (
                <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    {PIPELINE_STAGES.map((stage) => (
                        <div
                            key={stage.key}
                            className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-3 xl:grid-cols-6">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageLeads = leadsByStage[stage.key] || [];
                        const stageValue = stageLeads.reduce((sum, lead) => sum + numberValue(lead.expectedAmount), 0);
                        const forecastValue = (stageValue * stage.probability) / 100;

                        return (
                            <section
                                key={stage.key}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => handleDrop(stage.key)}
                                className={`flex min-h-[560px] min-w-[260px] flex-col rounded-3xl border ${stage.border} bg-slate-50/80 p-3 shadow-lg shadow-slate-200/70`}
                            >
                                <div className={`rounded-2xl bg-gradient-to-r ${stage.color} p-4 text-white shadow-lg`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-black">{stage.key}</h3>
                                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">{stage.probability}%</span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-white/85">
                                        <div>
                                            <p>Deals</p>
                                            <p className="text-xl font-black text-white">{stageLeads.length}</p>
                                        </div>
                                        <div>
                                            <p>Forecast</p>
                                            <p className="text-xl font-black text-white">{formatCurrency(forecastValue)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-1 flex-col gap-3">
                                    {stageLeads.length ? (
                                        stageLeads.map((lead) => {
                                            const latestFollowup = Array.isArray(lead.followups) && lead.followups.length ? lead.followups[0] : null;
                                            return (
                                                <article
                                                    key={lead.id}
                                                    draggable
                                                    onDragStart={() => setDraggedLeadId(lead.id)}
                                                    onDragEnd={() => setDraggedLeadId(null)}
                                                    className={`group cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/70 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl active:cursor-grabbing ${
                                                        updatingLeadId === lead.id ? "opacity-60" : ""
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="truncate text-sm font-black text-slate-950">{lead.companyName || "Untitled deal"}</h4>
                                                            <p className="mt-1 truncate text-xs font-semibold text-slate-500">{lead.customerPerson || "No customer person"}</p>
                                                        </div>
                                                        <GripVertical
                                                            size={18}
                                                            className="shrink-0 text-slate-300 transition group-hover:text-blue-500"
                                                        />
                                                    </div>

                                                    <div className="mt-4 rounded-2xl bg-blue-50 p-3">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-blue-500">Expected amount</p>
                                                        <p className="mt-1 text-xl font-black text-slate-950">{formatCurrency(lead.expectedAmount)}</p>
                                                    </div>

                                                    <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600">
                                                        <p className="flex items-center gap-2">
                                                            <UserRound size={14} />
                                                            {getAssignedName(lead)}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <CalendarDays size={14} />
                                                            Close: {formatDate(lead.expectedClosingDate)}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <AlertCircle size={14} />
                                                            Followup: {formatDate(latestFollowup?.nextFollowUpDate || lead.followupDate)}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/leads/view-leads/${lead.id}`)}
                                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                                                    >
                                                        View deal
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </article>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center">
                                            <div>
                                                <Target
                                                    size={28}
                                                    className="mx-auto text-slate-300"
                                                />
                                                <p className="mt-3 text-sm font-black text-slate-500">No deals here</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">Drop a card to move it into {stage.key}.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LeadPipeline;
