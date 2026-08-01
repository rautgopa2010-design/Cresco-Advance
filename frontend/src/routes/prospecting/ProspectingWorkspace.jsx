import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Bot,
    CheckCircle2,
    Database,
    FileSearch,
    Plus,
    RefreshCw,
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

const reviewableVerificationStatuses = ["Verified", "Partially Verified"];

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
                AI Prospecting is active. Phase 4 verifies evidence, checks duplicates, scores prospects, and sends only verified records to approval.
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
        researchName: "Phase 3 test research",
        targetLocation: "India",
        industry: "CRM Services",
        companySize: "10-200 employees",
        revenueRange: "Not specified",
        productFocus: "CRM",
        numberOfProspects: 3,
        jobRoles: "Founder, Sales Head, Operations Head",
        seniority: "Senior",
        keywords: "CRM automation, lead management",
        technologies: "CRM, HRMS",
        buyingSignals: "Hiring sales team, evaluating CRM",
        hiringSignals: "Sales hiring",
        excludedIndustries: "Gambling, Adult",
        excludedCompanies: "",
        minimumScore: 70,
        preferredProvider: "phase3-mock-provider",
        naturalLanguageInstructions: "Find Indian B2B companies likely to need CRM or HRMS software. Keep only high-fit decision makers.",
    });
    const [pendingEstimate, setPendingEstimate] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        idealCustomerProfile: {
            industries: "CRM, HRMS, SaaS",
            regions: "India",
            companySize: "10-200 employees",
            buyerRoles: "Founder, Sales Head, Operations Head",
        },
        selectedProviders: ["phase3-mock-provider"],
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
                        selectedProviders: nextSummary.settings.selectedProviders || ["phase3-mock-provider"],
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

    const estimateResearch = async () => {
        try {
            const res = await api.post("/prospecting/research/estimate", {
                ...researchForm,
                jobRoles: researchForm.jobRoles,
                technologies: researchForm.technologies,
                buyingSignals: researchForm.buyingSignals,
                excludedIndustries: researchForm.excludedIndustries,
                excludedCompanies: researchForm.excludedCompanies,
            });
            setPendingEstimate(res.data);
            toast.success("Cost estimated. Confirm before credits are consumed.");
        } catch (error) {
            toast.error(getError(error, "Could not estimate research."));
        }
    };

    const confirmResearch = async () => {
        if (!pendingEstimate?.request?.id) return;
        setConfirming(true);
        try {
            await api.post(`/prospecting/research/${pendingEstimate.request.id}/confirm`);
            toast.success("Research confirmed and sent for review.");
            setPendingEstimate(null);
            setActiveTab("Results");
            loadData();
        } catch (error) {
            toast.error(getError(error, "Could not confirm research."));
        } finally {
            setConfirming(false);
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
                            <th className="px-4 py-3">Verification</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Workflow</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((prospect) => (
                            <tr key={prospect.id}>
                                <td className="px-4 py-3">
                                    <p className="font-bold text-slate-950">{prospect.companyName}</p>
                                    <p className="text-xs text-slate-500">{prospect.sourceProvider}</p>
                                    {prospect.suggestedNextAction && (
                                        <p className="mt-1 max-w-xs text-xs font-semibold text-slate-500">{prospect.suggestedNextAction}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    <p>{prospect.contactName || "-"}</p>
                                    <p className="text-xs">{prospect.email || prospect.mobile || "-"}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="space-y-1">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${reviewableVerificationStatuses.includes(prospect.verificationStatus) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                            {prospect.verificationStatus || "Unverified"}
                                        </span>
                                        <p className="text-xs font-semibold text-slate-600">{prospect.classification || "Potential Prospect"}</p>
                                        <p className="text-xs text-slate-500">{prospect.priority || "Warm"} priority • {prospect.crmRecommendation || "CRM"}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-black text-slate-950">{prospect.score}</p>
                                    <p className="text-xs text-slate-500">
                                        Fit {prospect.prospectFitScore ?? 0} • Intent {prospect.intentScore ?? 0} • Quality {prospect.dataQualityScore ?? 0}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{prospect.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {prospect.status === "review" && reviewableVerificationStatuses.includes(prospect.verificationStatus) && (
                                            <>
                                                <button type="button" onClick={() => actOnProspect(prospect.id, "approve")} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Approve</button>
                                                <button type="button" onClick={() => actOnProspect(prospect.id, "reject")} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">Reject</button>
                                            </>
                                        )}
                                        {prospect.status === "approved" && (
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
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {[
                            ["researchName", "Research name"],
                            ["targetLocation", "Target location"],
                            ["industry", "Industry"],
                            ["companySize", "Company size"],
                            ["revenueRange", "Revenue range"],
                            ["numberOfProspects", "Number of prospects"],
                            ["jobRoles", "Job roles"],
                            ["seniority", "Seniority"],
                            ["keywords", "Keywords"],
                            ["technologies", "Technologies"],
                            ["buyingSignals", "Buying signals"],
                            ["hiringSignals", "Hiring signals"],
                            ["excludedIndustries", "Excluded industries"],
                            ["excludedCompanies", "Excluded companies"],
                            ["minimumScore", "Minimum score"],
                            ["preferredProvider", "Preferred provider"],
                        ].map(([field, label]) => (
                            <label key={field} className="text-sm font-bold text-slate-700">
                                {label}
                                <input
                                    type={["numberOfProspects", "minimumScore"].includes(field) ? "number" : "text"}
                                    value={researchForm[field]}
                                    onChange={(event) => setResearchForm((prev) => ({ ...prev, [field]: event.target.value }))}
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}
                        <label className="text-sm font-bold text-slate-700">
                            CRM, HRMS or Both
                            <select
                                value={researchForm.productFocus}
                                onChange={(event) => setResearchForm((prev) => ({ ...prev, productFocus: event.target.value }))}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                            >
                                <option value="CRM">CRM</option>
                                <option value="HRMS">HRMS</option>
                                <option value="Both">Both</option>
                            </select>
                        </label>
                        <label className="md:col-span-3 text-sm font-bold text-slate-700">
                            Natural-language instructions
                            <textarea
                                value={researchForm.naturalLanguageInstructions}
                                onChange={(event) => setResearchForm((prev) => ({ ...prev, naturalLanguageInstructions: event.target.value }))}
                                rows={3}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </label>
                    </div>
                    <button type="button" disabled={!summary.canResearch} onClick={estimateResearch} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                        <RefreshCw size={16} /> Estimate Cost
                    </button>
                    {pendingEstimate && (
                        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-blue-600">Cost Confirmation</p>
                                    <h3 className="mt-1 text-xl font-black text-slate-950">{pendingEstimate.request?.title}</h3>
                                    <div className="mt-3 grid gap-3 text-sm font-semibold text-slate-700 md:grid-cols-2">
                                        <p>Provider: <span className="font-black">{pendingEstimate.estimate?.provider}</span></p>
                                        <p>Requested records: <span className="font-black">{pendingEstimate.estimate?.requestedRecords}</span></p>
                                        <p>Estimated provider credits: <span className="font-black">{pendingEstimate.estimate?.estimatedProviderCredits}</span></p>
                                        <p>Estimated Crescosoft credits: <span className="font-black">{pendingEstimate.estimate?.estimatedCrescoCredits}</span></p>
                                        <p>Maximum estimated charge: <span className="font-black">{pendingEstimate.estimate?.maximumEstimatedCharge}</span></p>
                                        <p>Remaining provider balance: <span className="font-black">{pendingEstimate.estimate?.remainingBalance?.providerCredits}</span></p>
                                    </div>
                                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                                        {(pendingEstimate.plan?.explanation || []).map((line) => <p key={line}>{line}</p>)}
                                    </div>
                                </div>
                                <button type="button" disabled={confirming} onClick={confirmResearch} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300">
                                    <Plus size={16} /> Confirm and Reserve Credits
                                </button>
                            </div>
                        </div>
                    )}
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
                        <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">Provider-gated research, cost confirmation, review, approval, usage and audit foundation. Mock/Test Provider is clearly labelled when no live credentials exist.</p>
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
