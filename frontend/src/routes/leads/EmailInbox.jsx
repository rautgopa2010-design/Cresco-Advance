import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Activity,
    ArrowUpRight,
    AtSign,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Eye,
    Inbox,
    Link2,
    Mail,
    MailCheck,
    Plus,
    RefreshCcw,
    Search,
    Send,
    Sparkles,
    UsersRound,
} from "lucide-react";
import { getLeads } from "../../redux/actions/leadAndFollowup";
import { getCustomers } from "../../redux/actions/customer";

const STORAGE_KEY = "crescosoft_email_inbox_records";
const PROVIDER_KEY = "crescosoft_email_provider";

const defaultTemplates = [
    {
        name: "Follow-up after enquiry",
        subject: "Following up on your enquiry",
        body: "Hi, thank you for your interest. I wanted to check if you need any further details from our side.",
    },
    {
        name: "Quotation shared",
        subject: "Quotation details for your review",
        body: "Hi, I have shared the quotation details. Please review and let me know if you would like any changes.",
    },
    {
        name: "Meeting reminder",
        subject: "Reminder for our discussion",
        body: "Hi, this is a quick reminder for our scheduled discussion. Looking forward to speaking with you.",
    },
];

const numberValue = (value) => Number(value) || 0;

const getContactName = (record) =>
    record?.customerPerson ||
    record?.contactPerson ||
    [record?.salutation, record?.firstName, record?.middleName, record?.lastName].filter(Boolean).join(" ").trim() ||
    "Contact";

const getRecordLabel = (record, type) => `${type === "lead" ? "Lead" : "Customer"} - ${record.companyName || getContactName(record)}`;

const buildRecipients = (leads = [], customers = []) => {
    const leadRecipients = leads
        .filter((lead) => lead.email)
        .map((lead) => ({
            id: `lead-${lead.id}`,
            sourceId: lead.id,
            type: "lead",
            email: lead.email,
            name: getContactName(lead),
            companyName: lead.companyName || "",
            meta: [lead.leadStage, lead.leadStatus].filter(Boolean).join(" / "),
        }));

    const customerRecipients = customers
        .filter((customer) => customer.email)
        .map((customer) => ({
            id: `customer-${customer.id}`,
            sourceId: customer.id,
            type: "customer",
            email: customer.email,
            name: getContactName(customer),
            companyName: customer.companyName || "",
            meta: customer.industry || "Customer",
        }));

    return [...leadRecipients, ...customerRecipients];
};

const loadRecords = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
};

const saveRecords = (records) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const loadProvider = () => {
    try {
        return JSON.parse(localStorage.getItem(PROVIDER_KEY) || "null");
    } catch {
        return null;
    }
};

const MetricCard = ({ icon: Icon, label, value, caption, tone }) => (
    <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
            <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={22} />
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">Email</span>
        </div>
        <p className="mt-5 text-[13px] font-bold text-slate-500">{label}</p>
        <p className="mt-1 text-[32px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-2 text-sm font-semibold text-slate-400">{caption}</p>
    </div>
);

const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
            <Icon size={30} />
        </span>
        <p className="mt-4 text-base font-black text-slate-900">{title}</p>
        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{message}</p>
    </div>
);

const EmailInbox = () => {
    const dispatch = useDispatch();
    const { leads = [] } = useSelector((state) => state.lead || {});
    const { customers = [] } = useSelector((state) => state.customer || {});
    const [provider, setProvider] = useState(loadProvider());
    const [records, setRecords] = useState(loadRecords());
    const [search, setSearch] = useState("");
    const [selectedRecipientId, setSelectedRecipientId] = useState("");
    const [form, setForm] = useState({ subject: "", body: "" });
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        dispatch(getLeads());
        dispatch(getCustomers());
    }, [dispatch]);

    useEffect(() => {
        saveRecords(records);
    }, [records]);

    const recipients = useMemo(() => buildRecipients(leads, customers), [leads, customers]);
    const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId);

    const filteredRecords = useMemo(() => {
        const text = search.trim().toLowerCase();
        return records.filter((email) => {
            const matchesFilter = activeFilter === "all" || email.recipientType === activeFilter;
            const matchesText =
                !text ||
                [email.to, email.recipientName, email.companyName, email.subject, email.status].join(" ").toLowerCase().includes(text);
            return matchesFilter && matchesText;
        });
    }, [records, search, activeFilter]);

    const metrics = useMemo(() => {
        const sent = records.length;
        const opened = records.filter((email) => numberValue(email.opens) > 0).length;
        const clicked = records.filter((email) => numberValue(email.clicks) > 0).length;
        return {
            sent,
            opened,
            clicked,
            openRate: sent ? Math.round((opened / sent) * 100) : 0,
            clickRate: sent ? Math.round((clicked / sent) * 100) : 0,
        };
    }, [records]);

    const connectProvider = (name) => {
        const nextProvider = {
            name,
            connectedEmail: name === "Gmail" ? "sales@crescosoft.com" : "crm@crescosoft.com",
            connectedAt: new Date().toISOString(),
            mode: "CRM ready",
        };
        localStorage.setItem(PROVIDER_KEY, JSON.stringify(nextProvider));
        setProvider(nextProvider);
    };

    const disconnectProvider = () => {
        localStorage.removeItem(PROVIDER_KEY);
        setProvider(null);
    };

    const applyTemplate = (template) => {
        setForm({ subject: template.subject, body: template.body });
    };

    const sendEmail = () => {
        if (!selectedRecipient || !form.subject.trim() || !form.body.trim()) return;

        const newRecord = {
            id: `email-${Date.now()}`,
            provider: provider?.name || "CRM Mail",
            to: selectedRecipient.email,
            recipientName: selectedRecipient.name,
            recipientType: selectedRecipient.type,
            sourceId: selectedRecipient.sourceId,
            companyName: selectedRecipient.companyName,
            subject: form.subject.trim(),
            body: form.body.trim(),
            status: "Sent",
            sentAt: new Date().toISOString(),
            opens: 0,
            clicks: 0,
        };

        setRecords((prev) => [newRecord, ...prev]);
        setForm({ subject: "", body: "" });
        setSelectedRecipientId("");
    };

    const updateTracking = (id, field) => {
        setRecords((prev) =>
            prev.map((email) =>
                email.id === id
                    ? {
                          ...email,
                          [field]: numberValue(email[field]) + 1,
                          status: field === "opens" ? "Opened" : "Clicked",
                      }
                    : email,
            ),
        );
    };

    return (
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8 font-['Inter'] text-slate-900">
            <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 p-8 text-white shadow-[0_28px_80px_rgba(37,99,235,0.24)]">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100 ring-1 ring-white/15">
                            <Sparkles size={15} />
                            Email Inbox Integration
                        </span>
                        <h1 className="mt-4 text-[34px] font-black leading-tight md:text-[42px]">CRM Email Center</h1>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
                            Connect Gmail or Outlook, send emails from CRM, track opens/clicks, and keep email history linked with leads and customers.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">Connection</p>
                        {provider ? (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700">
                                    <CheckCircle2 size={18} />
                                    {provider.name} connected
                                </span>
                                <button
                                    type="button"
                                    onClick={disconnectProvider}
                                    className="rounded-2xl border border-white/25 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => connectProvider("Gmail")}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-lg shadow-blue-950/10"
                                >
                                    <Mail size={18} />
                                    Connect Gmail
                                </button>
                                <button
                                    type="button"
                                    onClick={() => connectProvider("Outlook")}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
                                >
                                    <AtSign size={18} />
                                    Connect Outlook
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={Send} label="Emails sent" value={metrics.sent} caption="CRM email history" tone="bg-blue-50 text-blue-600" />
                <MetricCard icon={Eye} label="Open rate" value={`${metrics.openRate}%`} caption={`${metrics.opened} opened emails`} tone="bg-emerald-50 text-emerald-600" />
                <MetricCard icon={Link2} label="Click rate" value={`${metrics.clickRate}%`} caption={`${metrics.clicked} clicked emails`} tone="bg-violet-50 text-violet-600" />
                <MetricCard icon={UsersRound} label="Recipients" value={recipients.length} caption="Leads and customers with email" tone="bg-amber-50 text-amber-600" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
                <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Compose Email</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Send from CRM and attach history to the selected lead or customer.</p>
                        </div>
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <MailCheck size={23} />
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-slate-500">Recipient</label>
                            <select
                                value={selectedRecipientId}
                                onChange={(e) => setSelectedRecipientId(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="">Select lead or customer</option>
                                {recipients.map((recipient) => (
                                    <option key={recipient.id} value={recipient.id}>
                                        {getRecordLabel(recipient, recipient.type)} - {recipient.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                            {defaultTemplates.map((template) => (
                                <button
                                    key={template.name}
                                    type="button"
                                    onClick={() => applyTemplate(template)}
                                    className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-left text-xs font-black text-blue-700 transition hover:bg-blue-100"
                                >
                                    {template.name}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                            placeholder="Email subject"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                        <textarea
                            value={form.body}
                            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                            placeholder="Write your email..."
                            rows={8}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                            type="button"
                            onClick={sendEmail}
                            disabled={!selectedRecipient || !form.subject.trim() || !form.body.trim()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#053054] px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300/60 transition hover:-translate-y-0.5 hover:bg-[#07436f] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send size={18} />
                            Send Email from CRM
                        </button>
                        {!provider && (
                            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-700">
                                Gmail/Outlook is not connected yet. Emails will be stored as CRM draft/send history until real OAuth credentials are configured.
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Email History</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Every sent email is grouped by lead/customer and ready for backend sync.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["all", "lead", "customer"].map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setActiveFilter(filter)}
                                    className={`rounded-full px-4 py-2 text-xs font-black capitalize transition ${
                                        activeFilter === filter ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <Search size={18} className="text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by company, contact, email or subject"
                            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                        />
                        <RefreshCcw size={17} className="text-slate-400" />
                    </div>

                    {filteredRecords.length ? (
                        <div className="space-y-3">
                            {filteredRecords.map((email) => (
                                <div key={email.id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black capitalize text-blue-700">{email.recipientType}</span>
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{email.status}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{email.provider}</span>
                                            </div>
                                            <p className="mt-3 truncate text-base font-black text-slate-950">{email.subject}</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                                {email.recipientName} - {email.companyName || email.to}
                                            </p>
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{email.body}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateTracking(email.id, "opens")}
                                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
                                            >
                                                <Eye size={15} />
                                                {email.opens}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateTracking(email.id, "clicks")}
                                                className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-2 text-xs font-black text-violet-700"
                                            >
                                                <ExternalLink size={15} />
                                                {email.clicks}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <Clock3 size={14} />
                                            {new Date(email.sentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <span className="inline-flex items-center gap-2 text-xs font-black text-blue-600">
                                            <Activity size={14} />
                                            Open/click tracking ready
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={Inbox} title="No email history yet" message="Send your first CRM email to a lead or customer. Open and click tracking will appear in this timeline." />
                    )}
                </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50/80 p-5">
                <div className="flex items-start gap-3">
                    <ArrowUpRight className="mt-1 text-blue-600" size={20} />
                    <div>
                        <p className="text-sm font-black text-blue-900">Production integration note</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-blue-700">
                            To send real Gmail/Outlook email, add OAuth credentials in backend, save connected mailbox tokens per user, and replace this CRM-side send history with email API calls.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EmailInbox;
