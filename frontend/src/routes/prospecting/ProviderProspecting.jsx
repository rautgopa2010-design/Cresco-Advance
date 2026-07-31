import React, { useEffect, useState } from "react";
import { Activity, Bot, Building2, Database, HeartPulse, Plus, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";

const getError = (error, fallback) => error?.response?.data?.errors?.[0]?.msg || fallback;

const defaultPlan = {
    name: "AI Prospecting Trial",
    description: "Controlled Phase 2 trial plan",
    researchLimit: 5,
    verifiedProspectLimit: 15,
    providerCreditLimit: 15,
    aiTokenLimit: 0,
    supportedProviders: ["phase2-test-provider"],
    allowOrgOwnedProviderAccounts: false,
};

const ProviderProspecting = () => {
    const [overview, setOverview] = useState({ plans: [], entitlements: [], providers: [], aggregateUsage: {} });
    const [planForm, setPlanForm] = useState(defaultPlan);
    const [entitlementForm, setEntitlementForm] = useState({
        orgId: 2,
        status: "trial",
        researchLimit: 5,
        verifiedProspectLimit: 15,
        providerCreditLimit: 15,
        aiTokenLimit: 0,
        extraCreditPacks: 0,
        supportedProviders: ["phase2-test-provider"],
        allowOrgOwnedProviderAccounts: false,
    });
    const [providerForm, setProviderForm] = useState({
        providerCode: "phase2-test-provider",
        displayName: "Phase 2 Test Provider",
        credentialStatus: "configured",
        healthStatus: "healthy",
        isEnabled: true,
    });

    const loadOverview = async () => {
        const res = await api.get("/provider/prospecting/overview");
        setOverview(res.data);
    };

    useEffect(() => {
        loadOverview().catch((error) => toast.error(getError(error, "Could not load AI Prospecting overview.")));
    }, []);

    const savePlan = async () => {
        try {
            await api.post("/provider/prospecting/plans", planForm);
            toast.success("AI Prospecting plan created.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not create plan."));
        }
    };

    const saveEntitlement = async () => {
        try {
            const payload = { ...entitlementForm };
            delete payload.orgId;
            await api.put(`/provider/prospecting/orgs/${entitlementForm.orgId}/entitlement`, payload);
            toast.success("Organization entitlement saved.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not save entitlement."));
        }
    };

    const saveProviderConnection = async () => {
        try {
            await api.post("/provider/prospecting/provider-connections", providerForm);
            toast.success("Provider connection saved.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not save provider connection."));
        }
    };

    const suspendOrg = async (orgId) => {
        try {
            await api.post(`/provider/prospecting/orgs/${orgId}/suspend`, { reason: "Suspended from Super Master" });
            toast.success("Organization suspended.");
            loadOverview();
        } catch (error) {
            toast.error(getError(error, "Could not suspend organization."));
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

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                    <Bot size={14} /> Super Master
                </div>
                <h1 className="mt-3 text-3xl font-black">AI Prospecting Control Center</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">Manage plans, organization entitlements, provider health and aggregate usage. Complete organization prospect data stays inside each tenant.</p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Activity className="mb-3 text-blue-600" /><p className="text-sm font-semibold text-slate-500">Research used</p><p className="text-2xl font-black">{overview.aggregateUsage?.research || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><ShieldCheck className="mb-3 text-emerald-600" /><p className="text-sm font-semibold text-slate-500">Verified used</p><p className="text-2xl font-black">{overview.aggregateUsage?.verified_prospect || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Database className="mb-3 text-violet-600" /><p className="text-sm font-semibold text-slate-500">Provider credits</p><p className="text-2xl font-black">{overview.aggregateUsage?.provider_credit || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><HeartPulse className="mb-3 text-rose-600" /><p className="text-sm font-semibold text-slate-500">Providers</p><p className="text-2xl font-black">{overview.providers?.length || 0}</p></div>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Plus size={18} /> Create Plan</h2>
                    <div className="space-y-3">
                        {field(planForm, setPlanForm, "name")}
                        {field(planForm, setPlanForm, "researchLimit", "number")}
                        {field(planForm, setPlanForm, "verifiedProspectLimit", "number")}
                        {field(planForm, setPlanForm, "providerCreditLimit", "number")}
                        {field(planForm, setPlanForm, "aiTokenLimit", "number")}
                    </div>
                    <button type="button" onClick={savePlan} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Plan</button>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Building2 size={18} /> Organization Entitlement</h2>
                    <div className="space-y-3">
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
                        {field(entitlementForm, setEntitlementForm, "researchLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "verifiedProspectLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "providerCreditLimit", "number")}
                        {field(entitlementForm, setEntitlementForm, "extraCreditPacks", "number")}
                    </div>
                    <button type="button" onClick={saveEntitlement} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Entitlement</button>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Database size={18} /> Provider Connection</h2>
                    <div className="space-y-3">
                        {field(providerForm, setProviderForm, "providerCode")}
                        {field(providerForm, setProviderForm, "displayName")}
                        <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <input type="checkbox" checked={providerForm.isEnabled} onChange={(event) => setProviderForm((prev) => ({ ...prev, isEnabled: event.target.checked }))} />
                            Enabled for plans
                        </label>
                    </div>
                    <button type="button" onClick={saveProviderConnection} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Provider</button>
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
                                <th className="px-4 py-3">Expiry</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {overview.entitlements?.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-bold text-slate-950">{item.organization?.company || `Org ${item.org_id}`}</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{item.status}</span></td>
                                    <td className="px-4 py-3 text-slate-600">{item.researchLimit} research / {item.verifiedProspectLimit} verified</td>
                                    <td className="px-4 py-3 text-slate-600">{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "No expiry"}</td>
                                    <td className="px-4 py-3"><button type="button" onClick={() => suspendOrg(item.org_id)} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">Suspend</button></td>
                                </tr>
                            ))}
                            {!overview.entitlements?.length && (
                                <tr><td className="px-4 py-8 text-center text-sm font-semibold text-slate-500" colSpan={5}>No organization entitlements configured.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default ProviderProspecting;
