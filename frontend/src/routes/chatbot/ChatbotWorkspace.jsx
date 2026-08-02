import React, { useEffect, useMemo, useState } from "react";
import { Activity, Bot, CheckCircle2, Clipboard, FileText, Globe2, KeyRound, MessageSquare, Palette, Plus, Settings, ShieldAlert, Trash2, Upload, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";

const tabs = ["Dashboard", "Knowledge Base", "FAQs", "Appearance", "Lead Form", "Install Widget", "Analytics", "Settings"];
const getError = (error, fallback) => error?.response?.data?.errors?.[0]?.msg || fallback;

const defaultFaq = { question: "", answer: "", category: "", language: "English", status: "Active" };
const defaultTextSource = { title: "", contentText: "", language: "English" };
const defaultUrlSource = { title: "", url: "", language: "English" };

const Pill = ({ children, tone = "slate" }) => (
    <span className={`rounded-full px-2 py-1 text-xs font-black ${tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "red" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{children}</span>
);

const ChatbotWorkspace = () => {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [summary, setSummary] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [configForm, setConfigForm] = useState(null);
    const [leadForm, setLeadForm] = useState(null);
    const [faqForm, setFaqForm] = useState(defaultFaq);
    const [textSource, setTextSource] = useState(defaultTextSource);
    const [urlSource, setUrlSource] = useState(defaultUrlSource);
    const [domain, setDomain] = useState("");
    const [documentFile, setDocumentFile] = useState(null);
    const [documentTitle, setDocumentTitle] = useState("");

    const load = async () => {
        const res = await api.get("/chatbot/summary");
        setSummary(res.data);
        setConfigForm(res.data.configuration);
        setLeadForm(res.data.leadForm);
        setErrorMessage("");
    };

    useEffect(() => {
        load().catch((error) => {
            const message = getError(error, "Could not load Website AI Chatbot.");
            setErrorMessage(message);
            toast.error(message);
        });
    }, []);

    const stats = useMemo(() => {
        const sources = summary?.knowledgeSources || [];
        const faqs = summary?.faqs || [];
        return {
            activeSources: sources.filter((item) => item.status === "Active").length,
            failedSources: sources.filter((item) => item.status === "Failed").length,
            activeFaqs: faqs.filter((item) => item.status === "Active").length,
            activeDomains: (summary?.domains || []).filter((item) => item.isActive).length,
        };
    }, [summary]);

    const saveConfig = async () => {
        try {
            await api.put("/chatbot/configuration", configForm);
            toast.success("Chatbot configuration saved.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not save configuration."));
        }
    };

    const saveLeadForm = async () => {
        try {
            await api.put("/chatbot/lead-form", leadForm);
            toast.success("Lead form saved.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not save lead form."));
        }
    };

    const createFaq = async () => {
        try {
            await api.post("/chatbot/faqs", faqForm);
            setFaqForm(defaultFaq);
            toast.success("FAQ saved.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not save FAQ."));
        }
    };

    const addTextSource = async () => {
        try {
            await api.post("/chatbot/knowledge/text", textSource);
            setTextSource(defaultTextSource);
            toast.success("Knowledge text saved.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not save knowledge text."));
        }
    };

    const addUrlSource = async () => {
        try {
            await api.post("/chatbot/knowledge/url", urlSource);
            setUrlSource(defaultUrlSource);
            toast.success("URL processed.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not process URL."));
        }
    };

    const uploadDocument = async () => {
        if (!documentFile) return toast.error("Choose a document first.");
        try {
            const form = new FormData();
            form.append("document", documentFile);
            form.append("title", documentTitle || documentFile.name);
            await api.post("/chatbot/knowledge/document", form, { headers: { "Content-Type": "multipart/form-data" } });
            setDocumentFile(null);
            setDocumentTitle("");
            toast.success("Document uploaded.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not upload document."));
        }
    };

    const addDomain = async () => {
        try {
            await api.post("/chatbot/domains", { domain });
            setDomain("");
            toast.success("Domain saved.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not save domain."));
        }
    };

    const rotateWidget = async () => {
        try {
            await api.post("/chatbot/widget/rotate");
            toast.success("Widget key rotated.");
            load();
        } catch (error) {
            toast.error(getError(error, "Could not rotate widget key."));
        }
    };

    const copyInstallScript = async () => {
        try {
            await navigator.clipboard.writeText(summary?.installScript || "");
            toast.success("Install script copied.");
        } catch {
            toast.error("Could not copy install script.");
        }
    };

    const removeItem = async (url, success) => {
        try {
            await api.delete(url);
            toast.success(success);
            load();
        } catch (error) {
            toast.error(getError(error, "Could not remove item."));
        }
    };

    const updateActionCard = (index, patch) => {
        setConfigForm((prev) => {
            const actionCards = [...(prev.actionCards || [])];
            actionCards[index] = { ...actionCards[index], ...patch };
            return { ...prev, actionCards };
        });
    };

    const updateLeadField = (index, patch) => {
        setLeadForm((prev) => {
            const fields = [...(prev.fields || [])];
            fields[index] = { ...fields[index], ...patch };
            return { ...prev, fields };
        });
    };

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
                    <h1 className="text-2xl font-black text-amber-950">Upgrade Required</h1>
                    <p className="mt-2 max-w-2xl text-sm font-semibold text-amber-800">{errorMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mb-5 rounded-lg bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                    <Bot size={14} /> Organization Admin
                </div>
                <h1 className="mt-3 text-3xl font-black">Website AI Chatbot</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">Configure knowledge, FAQs, branding, lead capture and installation readiness for your website chatbot.</p>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === "Dashboard" && (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Stat icon={MessageSquare} label="Conversations" value={`${summary?.usage?.conversation || 0} / ${summary?.limits?.conversation || 0}`} />
                        <Stat icon={Bot} label="AI messages" value={`${summary?.usage?.ai_message || 0} / ${summary?.limits?.ai_message || 0}`} />
                        <Stat icon={UserCheck} label="Enquiries" value={summary?.usage?.enquiry || 0} />
                        <Stat icon={Activity} label="Handovers" value={summary?.usage?.handover || 0} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Stat icon={FileText} label="Knowledge sources" value={`${stats.activeSources} / ${summary?.limits?.knowledge_source || 0}`} />
                        <Stat icon={Globe2} label="Allowed domains" value={`${stats.activeDomains} / ${summary?.limits?.domain || 0}`} />
                        <Stat icon={Bot} label="Avg AI confidence" value={`${summary?.analytics?.totals?.averageConfidence || 0}%`} />
                        <Stat icon={MessageSquare} label="Open handovers" value={summary?.analytics?.totals?.handovers || 0} />
                    </div>
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-black text-slate-950">Setup Health</h2>
                        <div className="mt-4 space-y-2">
                            {(summary?.validationIssues || []).length ? (
                                summary.validationIssues.map((issue) => (
                                    <div key={issue} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800"><ShieldAlert size={16} /> {issue}</div>
                                ))
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={16} /> Chatbot setup is valid for staging use.</div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === "Knowledge Base" && (
                <div className="grid gap-5 xl:grid-cols-3">
                    <Panel title="Manual Text" icon={Plus}>
                        <Input label="Title" value={textSource.title} onChange={(value) => setTextSource((prev) => ({ ...prev, title: value }))} />
                        <Textarea label="Knowledge content" rows={8} value={textSource.contentText} onChange={(value) => setTextSource((prev) => ({ ...prev, contentText: value }))} />
                        <button type="button" onClick={addTextSource} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Text</button>
                    </Panel>
                    <Panel title="Website URL" icon={Globe2}>
                        <Input label="Title" value={urlSource.title} onChange={(value) => setUrlSource((prev) => ({ ...prev, title: value }))} />
                        <Input label="Public URL" value={urlSource.url} onChange={(value) => setUrlSource((prev) => ({ ...prev, url: value }))} placeholder="https://example.com/services" />
                        <button type="button" onClick={addUrlSource} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Process URL</button>
                    </Panel>
                    <Panel title="Document" icon={Upload}>
                        <Input label="Title" value={documentTitle} onChange={setDocumentTitle} placeholder="Optional title" />
                        <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
                        <p className="text-xs font-semibold text-slate-500">Allowed: TXT, PDF, DOC, DOCX up to 10MB.</p>
                        <button type="button" onClick={uploadDocument} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Upload Document</button>
                    </Panel>
                    <section className="xl:col-span-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-4"><h2 className="text-lg font-black text-slate-950">Knowledge Sources</h2></div>
                        <Rows items={summary?.knowledgeSources || []} empty="No knowledge sources yet." columns={(item) => (
                            <>
                                <td className="px-4 py-3 font-bold text-slate-950">{item.title}</td>
                                <td className="px-4 py-3 text-slate-600">{item.sourceType}</td>
                                <td className="px-4 py-3"><Pill tone={item.status === "Active" ? "green" : item.status === "Failed" ? "red" : "slate"}>{item.status}</Pill></td>
                                <td className="px-4 py-3 text-slate-600">{item.processedSummary || item.errorDetails || "Not indexed yet"}</td>
                                <td className="px-4 py-3"><IconButton onClick={() => removeItem(`/chatbot/knowledge/${item.id}`, "Knowledge source archived.")} /></td>
                            </>
                        )} />
                    </section>
                </div>
            )}

            {activeTab === "FAQs" && (
                <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
                    <Panel title="Add FAQ" icon={Plus}>
                        <Input label="Question" value={faqForm.question} onChange={(value) => setFaqForm((prev) => ({ ...prev, question: value }))} />
                        <Textarea label="Answer" rows={6} value={faqForm.answer} onChange={(value) => setFaqForm((prev) => ({ ...prev, answer: value }))} />
                        <Input label="Category" value={faqForm.category} onChange={(value) => setFaqForm((prev) => ({ ...prev, category: value }))} />
                        <button type="button" onClick={createFaq} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save FAQ</button>
                    </Panel>
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-4"><h2 className="text-lg font-black text-slate-950">FAQs</h2></div>
                        <Rows items={summary?.faqs || []} empty="No FAQs yet." columns={(item) => (
                            <>
                                <td className="px-4 py-3 font-bold text-slate-950">{item.question}</td>
                                <td className="px-4 py-3 text-slate-600">{item.answer}</td>
                                <td className="px-4 py-3"><Pill tone={item.status === "Active" ? "green" : "slate"}>{item.status}</Pill></td>
                                <td className="px-4 py-3"><IconButton onClick={() => removeItem(`/chatbot/faqs/${item.id}`, "FAQ archived.")} /></td>
                            </>
                        )} />
                    </section>
                </div>
            )}

            {activeTab === "Appearance" && configForm && (
                <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                    <Panel title="Appearance" icon={Palette}>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Input label="Chatbot name" value={configForm.chatbotName} onChange={(value) => setConfigForm((prev) => ({ ...prev, chatbotName: value }))} />
                            <Input label="Greeting" value={configForm.greeting} onChange={(value) => setConfigForm((prev) => ({ ...prev, greeting: value }))} />
                            <Input label="Subtitle" value={configForm.subtitle} onChange={(value) => setConfigForm((prev) => ({ ...prev, subtitle: value }))} />
                            <Select label="Position" value={configForm.widgetPosition} onChange={(value) => setConfigForm((prev) => ({ ...prev, widgetPosition: value }))} options={["right", "left"]} />
                            {["primaryColor", "secondaryColor", "headerBackground", "textColor", "buttonColor"].map((key) => (
                                <Input key={key} label={key} type="color" value={configForm[key]} onChange={(value) => setConfigForm((prev) => ({ ...prev, [key]: value }))} />
                            ))}
                            <Input label="Contact business name" value={configForm.contactInfo?.businessName || ""} onChange={(value) => setConfigForm((prev) => ({ ...prev, contactInfo: { ...(prev.contactInfo || {}), businessName: value } }))} />
                            <Input label="Contact phone" value={configForm.contactInfo?.phone || ""} onChange={(value) => setConfigForm((prev) => ({ ...prev, contactInfo: { ...(prev.contactInfo || {}), phone: value } }))} />
                            <Input label="Contact email" value={configForm.contactInfo?.email || ""} onChange={(value) => setConfigForm((prev) => ({ ...prev, contactInfo: { ...(prev.contactInfo || {}), email: value } }))} />
                            <Input label="Business hours" value={configForm.contactInfo?.businessHours || ""} onChange={(value) => setConfigForm((prev) => ({ ...prev, contactInfo: { ...(prev.contactInfo || {}), businessHours: value } }))} />
                        </div>
                        <div className="mt-4 space-y-3">
                            <h3 className="text-sm font-black text-slate-700">Home action cards</h3>
                            {(configForm.actionCards || []).map((card, index) => (
                                <div key={card.id || index} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[auto_1fr]">
                                    <input type="checkbox" checked={!!card.enabled} onChange={(event) => updateActionCard(index, { enabled: event.target.checked })} />
                                    <input value={card.label || ""} onChange={(event) => updateActionCard(index, { label: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold" />
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={saveConfig} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Appearance</button>
                    </Panel>
                    <WidgetPreview config={configForm} />
                </div>
            )}

            {activeTab === "Lead Form" && leadForm && (
                <Panel title="Lead Form" icon={FileText}>
                    <div className="grid gap-3 md:grid-cols-2">
                        {(leadForm.fields || []).map((field, index) => (
                            <div key={field.key} className="rounded-lg border border-slate-200 p-3">
                                <Input label="Label" value={field.label} onChange={(value) => updateLeadField(index, { label: value })} />
                                <div className="mt-3 flex gap-4 text-sm font-bold text-slate-700">
                                    <label><input type="checkbox" checked={!!field.enabled} onChange={(event) => updateLeadField(index, { enabled: event.target.checked })} /> Enabled</label>
                                    <label><input type="checkbox" checked={!!field.required} onChange={(event) => updateLeadField(index, { required: event.target.checked })} /> Required</label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={!!leadForm.requireConsent} onChange={(event) => setLeadForm((prev) => ({ ...prev, requireConsent: event.target.checked }))} /> Require consent</label>
                    <Textarea label="Consent text" rows={3} value={leadForm.consentText} onChange={(value) => setLeadForm((prev) => ({ ...prev, consentText: value }))} />
                    <button type="button" onClick={saveLeadForm} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Lead Form</button>
                </Panel>
            )}

            {activeTab === "Install Widget" && (
                <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                    <Panel title="Secure Installation" icon={Clipboard}>
                        <div className="rounded-lg bg-slate-950 p-4 text-sm font-bold text-slate-100">
                            <code className="break-all">{summary?.installScript || "Create setup first to generate script."}</code>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={copyInstallScript} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Copy Code</button>
                            <button type="button" onClick={rotateWidget} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"><KeyRound size={16} /> Rotate Key</button>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 text-sm font-semibold text-blue-900">
                            Add this script before the closing body tag of the approved website. The widget key is public but revocable, and the backend still checks the website domain before returning chatbot configuration.
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                            Current widget id: <span className="font-black">{summary?.widget?.widgetIdentifier || "Not generated"}</span>
                        </div>
                    </Panel>
                    <Panel title="Domain Validation" icon={Globe2}>
                        {(summary?.domains || []).filter((item) => item.isActive).map((item) => (
                            <div key={item.id} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{item.domain}</div>
                        ))}
                        {!summary?.domains?.filter((item) => item.isActive).length && (
                            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">Add at least one allowed domain in Settings before installing.</div>
                        )}
                    </Panel>
                </div>
            )}

            {activeTab === "Analytics" && (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Stat icon={MessageSquare} label="Recent conversations" value={summary?.analytics?.totals?.recentConversations || 0} />
                        <Stat icon={UserCheck} label="Chatbot enquiries" value={summary?.analytics?.totals?.chatbotEnquiries || 0} />
                        <Stat icon={Activity} label="Support requests" value={summary?.analytics?.totals?.supportRequests || 0} />
                        <Stat icon={Bot} label="Average confidence" value={`${summary?.analytics?.totals?.averageConfidence || 0}%`} />
                    </div>
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-4"><h2 className="text-lg font-black text-slate-950">Recent Conversations</h2></div>
                        <Rows items={summary?.analytics?.recentConversations || []} empty="No conversations yet." columns={(item) => (
                            <>
                                <td className="px-4 py-3 font-bold text-slate-950">#{item.id}</td>
                                <td className="px-4 py-3 text-slate-600">{item.visitorName || "Visitor"}</td>
                                <td className="px-4 py-3"><Pill tone={item.status === "Assigned" ? "green" : "slate"}>{item.status}</Pill></td>
                                <td className="px-4 py-3 text-slate-600">{item.enquiryId ? `Enquiry #${item.enquiryId}` : item.sourceDomain}</td>
                            </>
                        )} />
                    </section>
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-4"><h2 className="text-lg font-black text-slate-950">Recent Enquiries</h2></div>
                        <Rows items={summary?.analytics?.recentEnquiries || []} empty="No chatbot enquiries yet." columns={(item) => (
                            <>
                                <td className="px-4 py-3 font-bold text-slate-950">#{item.id}</td>
                                <td className="px-4 py-3 text-slate-600">{[item.firstName, item.lastName].filter(Boolean).join(" ")}</td>
                                <td className="px-4 py-3 text-slate-600">{item.companyName || item.mobile}</td>
                                <td className="px-4 py-3 text-slate-600">{item.chatbotConversationId ? `Conversation #${item.chatbotConversationId}` : "-"}</td>
                            </>
                        )} />
                    </section>
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-4"><h2 className="text-lg font-black text-slate-950">Usage Ledger</h2></div>
                        <Rows items={summary?.analytics?.recentUsage || []} empty="No usage recorded yet." columns={(item) => (
                            <>
                                <td className="px-4 py-3 font-bold text-slate-950">{item.entryType}</td>
                                <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                                <td className="px-4 py-3 text-slate-600">{item.reason || "-"}</td>
                                <td className="px-4 py-3 text-slate-600">{item.lifecycle}</td>
                            </>
                        )} />
                    </section>
                </div>
            )}

            {activeTab === "Settings" && (
                <div className="grid gap-5 xl:grid-cols-2">
                    <Panel title="Allowed Domains" icon={Globe2}>
                        <Input label="Domain" value={domain} onChange={setDomain} placeholder="example.com" />
                        <button type="button" onClick={addDomain} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">Add Domain</button>
                        <div className="mt-4 space-y-2">
                            {(summary?.domains || []).map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                                    {item.domain}
                                    <IconButton onClick={() => removeItem(`/chatbot/domains/${item.id}`, "Domain removed.")} />
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Configuration Validation" icon={Settings}>
                        {(summary?.validationIssues || []).length ? (
                            summary.validationIssues.map((issue) => <div key={issue} className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">{issue}</div>)
                        ) : (
                            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">Ready for widget installation.</div>
                        )}
                    </Panel>
                </div>
            )}
        </div>
    );
};

const Stat = ({ icon: Icon, label, value }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Icon className="mb-3 text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-2xl font-black text-slate-950">{value}</p>
    </div>
);

const Panel = ({ title, icon: Icon, children }) => (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Icon size={18} /> {title}</h2>
        <div className="space-y-3">{children}</div>
    </section>
);

const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
    <label className="block text-sm font-bold text-slate-700">
        {label}
        <input type={type} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500" />
    </label>
);

const Textarea = ({ label, value, onChange, rows = 4 }) => (
    <label className="block text-sm font-bold text-slate-700">
        {label}
        <textarea value={value || ""} rows={rows} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500" />
    </label>
);

const Select = ({ label, value, onChange, options }) => (
    <label className="block text-sm font-bold text-slate-700">
        {label}
        <select value={value || options[0]} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2">
            {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
    </label>
);

const Rows = ({ items, empty, columns }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
                {items.map((item) => <tr key={item.id}>{columns(item)}</tr>)}
                {!items.length && <tr><td className="px-4 py-8 text-center text-sm font-semibold text-slate-500">{empty}</td></tr>}
            </tbody>
        </table>
    </div>
);

const IconButton = ({ onClick }) => (
    <button type="button" onClick={onClick} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Remove">
        <Trash2 size={16} />
    </button>
);

const WidgetPreview = ({ config }) => (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-slate-950">Live Preview</h2>
        <div className="rounded-[20px] border border-slate-200 bg-slate-100 p-4">
            <div className="ml-auto max-w-sm overflow-hidden border border-slate-200 bg-white shadow-lg" style={{ borderRadius: `${config.borderRadius || 16}px` }}>
                <div className="p-4" style={{ background: config.headerBackground, color: config.textColor }}>
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: config.primaryColor }}><Bot size={20} /></div>
                        <div>
                            <p className="font-black">{config.chatbotName}</p>
                            <p className="text-xs font-bold opacity-70">{config.onlineText}</p>
                        </div>
                    </div>
                    <h3 className="mt-4 text-xl font-black">{config.greeting}</h3>
                    <p className="mt-1 text-sm font-semibold opacity-80">{config.subtitle}</p>
                </div>
                <div className="space-y-2 p-4">
                    {(config.actionCards || []).filter((item) => item.enabled).map((card) => (
                        <button key={card.id || card.label} type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm font-black text-white" style={{ background: config.buttonColor }}>{card.label}</button>
                    ))}
                    <div className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">Ask a question about this organization...</div>
                </div>
            </div>
        </div>
    </section>
);

export default ChatbotWorkspace;
