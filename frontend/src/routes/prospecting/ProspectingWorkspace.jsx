import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Bot,
    CheckCircle2,
    Database,
    FileSearch,
    Plus,
    ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";

const tabs = ["Dashboard", "New Research", "Results", "Approval Queue", "Created Enquiries", "History", "Usage", "Settings"];

const emptySummary = {
    active: false,
    canResearch: false,
    exhausted: false,
    reason: "unsubscribed",
    usage: {},
    limits: {},
    entitlement: null,
    settings: null,
};

const getError = (error, fallback) => error?.response?.data?.errors?.[0]?.msg || fallback;

const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
};

const StatCard = ({ label, value, icon: Icon, tone = "blue" }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone] || toneClasses.blue}`}>
            <Icon size={20} />
        </div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-950">{value ?? 0}</p>
    </div>
);

const StatusBanner = ({ summary }) => {
    if (summary.active && !summary.exhausted) {
        return (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                AI Prospecting is active. Live provider integration is disabled in Phase 2; new research creates TEST DATA only.
            </div>
        );
    }

    const copy = {
        unsubscribed: "Upgrade required: AI Prospecting is not subscribed for this organization.",
        expired: "AI Prospecting is expired. Historical records remain viewable, but new research is blocked.",
        suspended: "AI Prospecting is suspended by Super Master. Historical records remain viewable.",
        exhausted: "AI Prospecting usage is exhausted. Historical records remain viewable.",
    };

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            {copy[summary.reason] || copy.exhausted}
        </div>
    );
};

const ProspectingWorkspace = () => {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [summary, setSummary] = useState(emptySummary);
    const [requests, setRequests] = useState([]);
    const [prospects, setProspects] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [researchForm, setResearchForm] = useState({
        title: "Phase 2 test research",
        industry: "CRM Services",
        region: "India",
        companySize: "10-200 employees",
    });
    const [settingsForm, setSettingsForm] = useState({
        idealCustomerProfile: {
            industries: "CRM, HRMS, SaaS",
            regions: "India",
            companySize: "10-200 employees",
            buyerRoles: "Founder, Sales Head, Operations Head",
        },
        selectedProviders: ["phase2-test-provider"],
        defaultReviewMode: "manual",
    });

    const remaining = useMemo(
        () => ({
            research: Math.max(Number(summary.limits?.research || 0) - Number(summary.usage?.research || 0), 0),
            verified: Math.max(Number(summary.limits?.verified_prospect || 0) - Number(summary.usage?.verified_prospect || 0), 0),
            credits: Math.max(Number(summary.limits?.provider_credit || 0) - Number(summary.usage?.provider_credit || 0), 0),
            tokens: Math.max(Number(summary.limits?.ai_token || 0) - Number(summary.usage?.ai_token || 0), 0),
        }),
        [summary],
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, requestsRes, prospectsRes, auditRes] = await Promise.allSettled([
                api.get("/prospecting/summary"),
                api.get("/prospecting/requests"),
                api.get("/prospecting/prospects"),
                api.get("/prospecting/audit"),
            ]);

            if (summaryRes.status === "fulfilled") {
                const nextSummary = { ...emptySummary, ...summaryRes.value.data };
                setSummary(nextSummary);
                if (nextSummary.settings) {
                    setSettingsForm({
                        idealCustomerProfile: nextSummary.settings.idealCustomerProfile || settingsForm.idealCustomerProfile,
                        selectedProviders: nextSummary.settings.selectedProviders || ["phase2-test-provider"],
                        defaultReviewMode: nextSummary.settings.defaultReviewMode || "manual",
                    });
                }
            } else {
                setSummary({ ...emptySummary, reason: summaryRes.reason?.response?.status === 402 ? "unsubscribed" : "blocked" });
            }

            if (requestsRes.status === "fulfilled") setRequests(requestsRes.value.data.requests || []);
            if (prospectsRes.status === "fulfilled") setProspects(prospectsRes.value.data.prospects || []);
            if (auditRes.status === "fulfilled") setAuditLogs(auditRes.value.data.auditLogs || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runResearch = async () => {
        try {
            await api.post("/prospecting/research", {
                title: researchForm.title,
                criteria: {
                    industry: researchForm.industry,
                    region: researchForm.region,
                    companySize: researchForm.companySize,
                },
                providers: settingsForm.selectedProviders,
            });
            toast.success("Phase 2 test research created.");
            setActiveTab("Results");
            loadData();
        } catch (error) {
            toast.error(getError(error, "Could not create research."));
        }
    };

    const saveSettings = async () => {
        try {
            await api.put("/prospecting/settings", settingsForm);
            toast.success("AI Prospecting settings saved.");
            loadData();
        } catch (error) {
            toast.error(getError(error, "Could not save settings."));
        }
    };

    const actOnProspect = async (id, action) => {
        try {
            await api.post(`/prospecting/prospects/${id}/${action}`);
            toast.success(action === "create-enquiry" ? "Enquiry created." : `Prospect ${action}d.`);
            loadData();
        } catch (error) {
            toast.error(getError(error, "Action failed."));
        }
    };

    const renderProspectTable = (rows) => (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((prospect) => (
                            <tr key={prospect.id}>
                                <td className="px-4 py-3">
                                    <p className="font-bold text-slate-950">{prospect.companyName}</p>
                                    <p className="text-xs text-slate-500">{prospect.sourceProvider}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    <p>{prospect.contactName || "-"}</p>
                                    <p className="text-xs">{prospect.email || prospect.mobile || "-"}</p>
                                </td>
                                <td className="px-4 py-3 font-black text-slate-950">{prospect.score}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{prospect.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {prospect.status === "review" && (
                                            <>
                                                <button type="button" onClick={() => actOnProspect(prospect.id, "approve")} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Approve</button>
                                                <button type="button" onClick={() => actOnProspect(prospect.id, "reject")} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">Reject</button>
                                            </>
                                        )}
                                        {["review", "approved"].includes(prospect.status) && (
                                            <button type="button" onClick={() => actOnProspect(prospect.id, "create-enquiry")} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">Create Enquiry</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && (
                            <tr>
                                <td className="px-4 py-8 text-center text-sm font-semibold text-slate-500" colSpan={5}>No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTab = () => {
        if (activeTab === "Dashboard") {
            return (
                <div className="space-y-5">
                    <StatusBanner summary={summary} />
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard label="Research left" value={remaining.research} icon={FileSearch} />
                        <StatCard label="Verified left" value={remaining.verified} icon={ShieldCheck} tone="emerald" />
                        <StatCard label="Provider credits" value={remaining.credits} icon={Database} tone="violet" />
                        <StatCard label="AI tokens" value={remaining.tokens} icon={Activity} tone="amber" />
                    </div>
                </div>
            );
        }

        if (activeTab === "New Research") {
            return (
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <StatusBanner summary={summary} />
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {["title", "industry", "region", "companySize"].map((field) => (
                            <label key={field} className="text-sm font-bold text-slate-700">
                                {field === "companySize" ? "Company Size" : field.charAt(0).toUpperCase() + field.slice(1)}
                                <input
                                    value={researchForm[field]}
                                    onChange={(event) => setResearchForm((prev) => ({ ...prev, [field]: event.target.value }))}
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}
                    </div>
                    <button type="button" disabled={!summary.canResearch} onClick={runResearch} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                        <Plus size={16} /> Run Phase 2 Test Research
                    </button>
                </div>
            );
        }

        if (activeTab === "Results") return renderProspectTable(prospects);
        if (activeTab === "Approval Queue") return renderProspectTable(prospects.filter((item) => item.status === "review"));
        if (activeTab === "Created Enquiries") return renderProspectTable(prospects.filter((item) => item.status === "enquiry_created"));

        if (activeTab === "History") {
            return (
                <div className="space-y-3">
                    {requests.map((request) => (
                        <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
                            <p className="font-black text-slate-950">{request.title}</p>
                            <p className="text-sm text-slate-500">{request.status} • {request.verifiedProspectCount} verified prospects • {new Date(request.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                    {!requests.length && <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">No research history yet.</p>}
                </div>
            );
        }

        if (activeTab === "Usage") {
            return (
                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard label="Research used" value={summary.usage?.research || 0} icon={FileSearch} />
                    <StatCard label="Verified prospects used" value={summary.usage?.verified_prospect || 0} icon={ShieldCheck} tone="emerald" />
                    <StatCard label="Provider credits used" value={summary.usage?.provider_credit || 0} icon={Database} tone="violet" />
                    <StatCard label="AI tokens used" value={summary.usage?.ai_token || 0} icon={Activity} tone="amber" />
                </div>
            );
        }

        if (activeTab === "Settings") {
            return (
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.keys(settingsForm.idealCustomerProfile).map((field) => (
                            <label key={field} className="text-sm font-bold text-slate-700">
                                {field}
                                <input
                                    value={settingsForm.idealCustomerProfile[field] || ""}
                                    onChange={(event) =>
                                        setSettingsForm((prev) => ({
                                            ...prev,
                                            idealCustomerProfile: { ...prev.idealCustomerProfile, [field]: event.target.value },
                                        }))
                                    }
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}
                    </div>
                    <button type="button" onClick={saveSettings} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Settings</button>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="font-black text-slate-950">{log.action}</p>
                        <p className="text-sm text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                ))}
                {!auditLogs.length && <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">No audit entries yet.</p>}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                            <Bot size={14} /> Controlled Agent
                        </div>
                        <h1 className="mt-3 text-3xl font-black">AI Prospecting</h1>
                        <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">Entitlement-gated research, review, approval, usage and audit foundation. Phase 2 uses test data only.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">
                        {summary.active ? <CheckCircle2 className="text-emerald-300" size={18} /> : <AlertTriangle className="text-amber-300" size={18} />}
                        {summary.status || summary.reason || "not enabled"}
                    </div>
                </div>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">Loading AI Prospecting...</div> : renderTab()}
        </div>
    );
};

export default ProspectingWorkspace;
