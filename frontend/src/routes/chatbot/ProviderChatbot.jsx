import React, { useEffect, useState } from "react";
import { Activity, Bot, Building2, FileText, MessageSquare, Plus, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";

const getError = (error, fallback) => error?.response?.data?.errors?.[0]?.msg || fallback;

const defaultPlan = {
    name: "Website AI Chatbot Trial",
    description: "Phase 2 foundation trial plan",
    monthlyConversationLimit: 100,
    monthlyAiMessageLimit: 500,
    knowledgeSourceLimit: 10,
    documentStorageMbLimit: 100,
    domainLimit: 1,
    agentLimit: 2,
    trialDays: 14,
    humanHandoverEnabled: true,
    analyticsEnabled: true,
    supportedAiProviders: ["mock-chatbot-provider"],
};

const ProviderChatbot = () => {
    const [overview, setOverview] = useState({ plans: [], entitlements: [], aggregateUsage: {}, auditLogs: [] });
    const [planForm, setPlanForm] = useState(defaultPlan);
    const [entitlementForm, setEntitlementForm] = useState({
        orgId: 2,
        status: "trial",
        monthlyConversationLimit: 100,
        monthlyAiMessageLimit: 500,
        knowledgeSourceLimit: 10,
        documentStorageMbLimit: 100,
        domainLimit: 1,
        agentLimit: 2,
        extraConversationPacks: 0,
        extraAiMessagePacks: 0,
        humanHandoverEnabled: true,
        analyticsEnabled: true,
        supportedAiProviders: ["mock-chatbot-provider"],
    });

    const loadOverview = async () => {
        const res = await api.get("/provider/chatbot/overview");
        setOverview(res.data);
    };

    useEffect(() => {
        loadOverview().catch((error) => toast.error(getError(error, "Could not load Website AI Chatbot overview.")));
    }, []);

    const savePlan = async () => {
        try {
            await api.post("/provider/chatbot/plans", planForm);
            toast.success("Website AI Chatbot plan created.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not create chatbot plan."));
        }
    };

    const saveEntitlement = async () => {
        try {
            const payload = { ...entitlementForm };
            delete payload.orgId;
            await api.put(`/provider/chatbot/orgs/${entitlementForm.orgId}/entitlement`, payload);
            toast.success("Organization chatbot entitlement saved.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not save chatbot entitlement."));
        }
    };

    const seedPermissions = async (orgId) => {
        try {
            await api.post(`/provider/chatbot/orgs/${orgId}/permissions`);
            toast.success("Chatbot permissions are ready.");
        } catch (error) {
            toast.error(getError(error, "Could not prepare chatbot permissions."));
        }
    };

    const suspendOrg = async (orgId) => {
        try {
            await api.post(`/provider/chatbot/orgs/${orgId}/suspend`, { reason: "Suspended from Super Master" });
            toast.success("Organization chatbot access suspended.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not suspend organization chatbot access."));
        }
    };

    const field = (form, setForm, name, type = "text") => (
        <label className="text-sm font-bold text-slate-700">
            {name}
            <input
                type={type}
                value={form[name]}
                onChange={(event) => setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(event.target.value) : event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
            />
        </label>
    );

    const toggle = (form, setForm, name, label) => (
        <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={!!form[name]} onChange={(event) => setForm((prev) => ({ ...prev, [name]: event.target.checked }))} />
            {label}
        </label>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                    <Bot size={14} /> Super Master
                </div>
                <h1 className="mt-3 text-3xl font-black">Website AI Chatbot Control Center</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">Create plans, assign organizations, control usage limits and monitor aggregate chatbot usage without opening tenant conversations.</p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><MessageSquare className="mb-3 text-blue-600" /><p className="text-sm font-semibold text-slate-500">Conversations</p><p className="text-2xl font-black">{overview.aggregateUsage?.conversation || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Bot className="mb-3 text-violet-600" /><p className="text-sm font-semibold text-slate-500">AI messages</p><p className="text-2xl font-black">{overview.aggregateUsage?.ai_message || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><FileText className="mb-3 text-emerald-600" /><p className="text-sm font-semibold text-slate-500">Knowledge sources</p><p className="text-2xl font-black">{overview.aggregateUsage?.knowledge_source || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><ShieldCheck className="mb-3 text-rose-600" /><p className="text-sm font-semibold text-slate-500">Entitled orgs</p><p className="text-2xl font-black">{overview.entitlements?.length || 0}</p></div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Plus size={18} /> Create Plan</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {field(planForm, setPlanForm, "name")}
                        {field(planForm, setPlanForm, "trialDays", "number")}
                        {field(planForm, setPlanForm, "monthlyConversationLimit", "number")}
                        {field(planForm, setPlanForm, "monthlyAiMessageLimit", "number")}
                        {field(planForm, setPlanForm, "knowledgeSourceLimit", "number")}
                        {field(planForm, setPlanForm, "documentStorageMbLimit", "number")}
                        {field(planForm, setPlanForm, "domainLimit", "number")}
                        {field(planForm, setPlanForm, "agentLimit", "number")}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4">
                        {toggle(planForm, setPlanForm, "humanHandoverEnabled", "Human handover")}
                        {toggle(planForm, setPlanForm, "analyticsEnabled", "Analytics")}
                    </div>
                    <button type="button" onClick={savePlan} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Plan</button>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Building2 size={18} /> Organization Entitlement</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {field(entitlementForm, setEntitlementForm, "orgId", "number")}
                        <label className="text-sm font-bold text-slate-700">
                            status
                            <select value={entitlementForm.status} onChange={(event) => setEntitlementForm((prev) => ({ ...prev, status: event.target.value }))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2">
                                <option value="trial">trial</option>
                                <option value="active">active</option>
                                <option value="expired">expired</option>
                                <option value="suspended">suspended</option>
                            </select>
                        </label>
                        {field(entitlementForm, setEntitlementForm, "monthlyConversationLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "monthlyAiMessageLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "knowledgeSourceLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "documentStorageMbLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "domainLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "agentLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "extraConversationPacks", "number")}
                        {field(entitlementForm, setEntitlementForm, "extraAiMessagePacks", "number")}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4">
                        {toggle(entitlementForm, setEntitlementForm, "humanHandoverEnabled", "Human handover")}
                        {toggle(entitlementForm, setEntitlementForm, "analyticsEnabled", "Analytics")}
                    </div>
                    <button type="button" onClick={saveEntitlement} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Entitlement</button>
                </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-4">
                    <h2 className="text-lg font-black text-slate-950">Organization Entitlements</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Organization</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Limits</th>
                                <th className="px-4 py-3">Features</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {overview.entitlements?.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-bold text-slate-950">{item.organization?.company || `Org ${item.org_id}`}</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{item.status}</span></td>
                                    <td className="px-4 py-3 text-slate-600">{item.monthlyConversationLimit} conversations / {item.monthlyAiMessageLimit} AI messages</td>
                                    <td className="px-4 py-3 text-slate-600">{item.knowledgeSourceLimit} sources / {item.domainLimit} domains</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => seedPermissions(item.org_id)} className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Permissions</button>
                                            <button type="button" onClick={() => suspendOrg(item.org_id)} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">Suspend</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!overview.entitlements?.length && (
                                <tr><td className="px-4 py-8 text-center text-sm font-semibold text-slate-500" colSpan={5}>No organization entitlements configured.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Activity size={18} /> Recent Audit Records</h2>
                <div className="space-y-2">
                    {overview.auditLogs?.map((item) => (
                        <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                            {item.action} {item.org_id ? `for org ${item.org_id}` : ""} <span className="text-slate-400">#{item.id}</span>
                        </div>
                    ))}
                    {!overview.auditLogs?.length && <p className="text-sm font-semibold text-slate-500">No chatbot audit records yet.</p>}
                </div>
            </section>
        </div>
    );
};

export default ProviderChatbot;
