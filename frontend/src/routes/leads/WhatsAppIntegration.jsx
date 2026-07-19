import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowUpRight,
    BadgeIndianRupee,
    CheckCircle2,
    Clock3,
    FileText,
    MessageCircle,
    ReceiptText,
    RefreshCcw,
    Search,
    Send,
    Sparkles,
    UsersRound,
} from "lucide-react";
import { getLeads } from "../../redux/actions/leadAndFollowup";
import { getCustomers } from "../../redux/actions/customer";
import { getQuotations } from "../../redux/actions/quotation";
import { getInvoices } from "../../redux/actions/invoice";

const STORAGE_KEY = "crescosoft_whatsapp_logs";

const loadLogs = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
};

const saveLogs = (logs) => localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

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

const getContactName = (record) =>
    record?.customerPerson ||
    record?.customerName ||
    [record?.salutation, record?.firstName, record?.middleName, record?.lastName].filter(Boolean).join(" ") ||
    "Customer";

const normalizePhone = (value) => String(value || "").replace(/[^\d]/g, "");

const getPhone = (record) => normalizePhone([record?.code, record?.mobile || record?.phone].filter(Boolean).join(""));

const buildRecipients = (leads = [], customers = [], quotations = [], invoices = []) => {
    const map = new Map();
    const add = (record, type, extra = {}) => {
        const phone = getPhone(record);
        if (!phone) return;
        const key = `${phone}-${record.companyName || record.selectedCompany || getContactName(record)}`;
        const existing = map.get(key) || {};
        map.set(key, {
            id: key,
            type: existing.type || type,
            name: existing.name || getContactName(record),
            companyName: existing.companyName || record.companyName || record.selectedCompany || "No company",
            phone,
            email: existing.email || record.email || "",
            source: existing.source || record.leadSource || "",
            stage: existing.stage || record.leadStage || record.leadStatus || "",
            quotationNo: existing.quotationNo || record.quotationNo || extra.quotationNo || "",
            quotationAmount: existing.quotationAmount || record.finalAmt || extra.quotationAmount || "",
            invoiceNo: existing.invoiceNo || record.invoiceNo || extra.invoiceNo || "",
            invoiceAmount: existing.invoiceAmount || record.finalAmt || extra.invoiceAmount || "",
        });
    };

    leads.forEach((lead) => add(lead, "Lead"));
    customers.forEach((customer) => add(customer, "Customer"));
    quotations.forEach((quotation) => add(quotation, "Quotation", { quotationNo: quotation.quotationNo, quotationAmount: quotation.finalAmt }));
    invoices.forEach((invoice) => add(invoice, "Invoice", { invoiceNo: invoice.invoiceNo, invoiceAmount: invoice.finalAmt }));

    return Array.from(map.values());
};

const templates = {
    quotation: {
        label: "Quotation Follow-up",
        icon: FileText,
        build: (recipient) =>
            `Hello ${recipient.name},\n\nWe have shared the quotation${recipient.quotationNo ? ` #${recipient.quotationNo}` : ""}${recipient.quotationAmount ? ` of ${formatCurrency(recipient.quotationAmount)}` : ""} for ${recipient.companyName}.\n\nPlease review it and let us know if you need any changes.\n\nRegards,\nCresco Software Solutions`,
    },
    followup: {
        label: "Lead Follow-up",
        icon: RefreshCcw,
        build: (recipient) =>
            `Hello ${recipient.name},\n\nThis is a quick follow-up from Cresco Software Solutions regarding your enquiry${recipient.companyName ? ` for ${recipient.companyName}` : ""}.\n\nPlease let us know a convenient time to discuss next steps.\n\nRegards,\nCresco Software Solutions`,
    },
    payment: {
        label: "Payment Reminder",
        icon: ReceiptText,
        build: (recipient) =>
            `Hello ${recipient.name},\n\nThis is a gentle payment reminder${recipient.invoiceNo ? ` for invoice #${recipient.invoiceNo}` : ""}${recipient.invoiceAmount ? ` of ${formatCurrency(recipient.invoiceAmount)}` : ""}.\n\nPlease confirm once the payment is processed.\n\nRegards,\nCresco Software Solutions`,
    },
};

const formatDateTime = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
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

const EmptyState = ({ title, message }) => (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={30} />
        </span>
        <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">{message}</p>
    </div>
);

const WhatsAppIntegration = () => {
    const dispatch = useDispatch();
    const { leads = [] } = useSelector((state) => state.leadAndFollowup || {});
    const { customers = [] } = useSelector((state) => state.customer || {});
    const { quotations = [] } = useSelector((state) => state.quotation || {});
    const { invoices = [] } = useSelector((state) => state.invoice || {});

    const [templateKey, setTemplateKey] = useState("followup");
    const [selectedRecipientId, setSelectedRecipientId] = useState("");
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState("");
    const [logs, setLogs] = useState(loadLogs);

    useEffect(() => {
        dispatch(getLeads());
        dispatch(getCustomers());
        dispatch(getQuotations());
        dispatch(getInvoices());
    }, [dispatch]);

    useEffect(() => {
        saveLogs(logs);
    }, [logs]);

    const recipients = useMemo(() => buildRecipients(leads, customers, quotations, invoices), [leads, customers, quotations, invoices]);
    const selectedRecipient = recipients.find((recipient) => recipient.id === selectedRecipientId) || recipients[0];

    useEffect(() => {
        if (!selectedRecipientId && recipients.length) {
            setSelectedRecipientId(recipients[0].id);
        }
    }, [recipients, selectedRecipientId]);

    useEffect(() => {
        if (selectedRecipient) {
            setMessage(templates[templateKey].build(selectedRecipient));
        }
    }, [selectedRecipient, templateKey]);

    const filteredRecipients = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return recipients;
        return recipients.filter((recipient) =>
            [recipient.name, recipient.companyName, recipient.phone, recipient.email, recipient.type]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [recipients, query]);

    const sendWhatsApp = () => {
        if (!selectedRecipient?.phone || !message.trim()) return;
        const url = `https://wa.me/${selectedRecipient.phone}?text=${encodeURIComponent(message.trim())}`;
        window.open(url, "_blank", "noopener,noreferrer");
        setLogs((current) =>
            [
                {
                    id: Date.now(),
                    recipientId: selectedRecipient.id,
                    name: selectedRecipient.name,
                    companyName: selectedRecipient.companyName,
                    phone: selectedRecipient.phone,
                    template: templates[templateKey].label,
                    message: message.trim(),
                    createdAt: new Date().toISOString(),
                },
                ...current,
            ].slice(0, 60),
        );
    };

    const summary = {
        recipients: recipients.length,
        quotations: quotations.filter((item) => getPhone(item)).length,
        invoices: invoices.filter((item) => getPhone(item)).length,
        sent: logs.length,
    };

    return (
        <div className="space-y-7 bg-slate-50 px-5 py-6 md:px-8">
            <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-500 via-blue-600 to-slate-900 p-7 text-white shadow-[0_28px_70px_rgba(16,185,129,0.22)] md:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-50">
                            <MessageCircle size={15} />
                            CRM Messaging
                        </span>
                        <h1 className="mt-4 text-[34px] font-black leading-tight md:text-[42px]">WhatsApp Integration</h1>
                        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-emerald-50">
                            Send quotation follow-ups, lead follow-ups, and payment reminders directly through WhatsApp Web or WhatsApp Desktop.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={sendWhatsApp}
                        disabled={!selectedRecipient?.phone || !message.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-emerald-700 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send size={18} />
                        Open WhatsApp
                    </button>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={UsersRound} label="WhatsApp contacts" value={summary.recipients} caption="Leads, customers and billing contacts" tone="bg-emerald-50 text-emerald-600" />
                <MetricCard icon={FileText} label="Quotation contacts" value={summary.quotations} caption="Ready for quotation follow-up" tone="bg-blue-50 text-blue-600" />
                <MetricCard icon={BadgeIndianRupee} label="Payment reminders" value={summary.invoices} caption="Invoice contacts with mobile" tone="bg-amber-50 text-amber-600" />
                <MetricCard icon={MessageCircle} label="Messages prepared" value={summary.sent} caption="Local CRM WhatsApp history" tone="bg-purple-50 text-purple-600" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Recipients</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Choose the CRM contact you want to message.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search name, company, mobile..."
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div className="mt-5 max-h-[520px] overflow-y-auto rounded-3xl border border-slate-200">
                        {filteredRecipients.length ? (
                            <div className="divide-y divide-slate-100">
                                {filteredRecipients.map((recipient) => (
                                    <button
                                        key={recipient.id}
                                        type="button"
                                        onClick={() => setSelectedRecipientId(recipient.id)}
                                        className={`w-full px-5 py-4 text-left transition hover:bg-emerald-50/60 ${selectedRecipient?.id === recipient.id ? "bg-emerald-50" : "bg-white"}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-black text-slate-950">{recipient.name}</h3>
                                                <p className="mt-1 text-sm font-semibold text-slate-500">{recipient.companyName}</p>
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{recipient.type}</span>
                                        </div>
                                        <p className="mt-3 text-sm font-black text-emerald-700">+{recipient.phone}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="No WhatsApp-ready contacts" message="Add mobile numbers to leads, customers, quotations or invoices to send WhatsApp reminders." />
                        )}
                    </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Message Composer</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Select a template, edit the text, and send through WhatsApp.</p>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {Object.entries(templates).map(([key, template]) => {
                            const Icon = template.icon;
                            const active = templateKey === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTemplateKey(key)}
                                    className={`rounded-2xl border p-4 text-left transition ${
                                        active ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/60"
                                    }`}
                                >
                                    <Icon size={20} />
                                    <p className="mt-3 text-sm font-black">{template.label}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Selected recipient</p>
                        <h3 className="mt-2 text-lg font-black text-slate-950">{selectedRecipient?.name || "No recipient selected"}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{selectedRecipient?.companyName || "Select a contact to compose message."}</p>
                    </div>

                    <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={10}
                        placeholder="Write WhatsApp message..."
                        className="mt-5 w-full resize-none rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />

                    <div className="mt-5 flex flex-col gap-3 rounded-3xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800 md:flex-row md:items-center md:justify-between">
                        <p>WhatsApp Web/Desktop will open with this message prefilled. Final sending is done by the logged-in WhatsApp user.</p>
                        <button
                            type="button"
                            onClick={sendWhatsApp}
                            disabled={!selectedRecipient?.phone || !message.trim()}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <ArrowUpRight size={17} />
                            Open WhatsApp
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">WhatsApp History</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Prepared messages are logged locally for CRM context.</p>
                    </div>
                    <Clock3 className="text-emerald-600" size={24} />
                </div>

                {logs.length ? (
                    <div className="overflow-hidden rounded-3xl border border-slate-200">
                        <table className="w-full min-w-[860px] text-left text-sm">
                            <thead className="bg-slate-950 text-xs uppercase tracking-[0.12em] text-white">
                                <tr>
                                    <th className="px-4 py-4">Contact</th>
                                    <th className="px-4 py-4">Template</th>
                                    <th className="px-4 py-4">Phone</th>
                                    <th className="px-4 py-4">Message</th>
                                    <th className="px-4 py-4">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {logs.slice(0, 8).map((log) => (
                                    <tr key={log.id} className="align-top">
                                        <td className="px-4 py-4">
                                            <p className="font-black text-slate-950">{log.name}</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-500">{log.companyName}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{log.template}</span>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-slate-600">+{log.phone}</td>
                                        <td className="px-4 py-4">
                                            <p className="line-clamp-2 max-w-sm text-xs font-semibold leading-5 text-slate-500">{log.message}</p>
                                        </td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-500">{formatDateTime(log.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState title="No WhatsApp history yet" message="Prepare and open your first WhatsApp reminder to start tracking communication context here." />
                )}

                <div className="mt-5 flex items-start gap-3 rounded-3xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
                    <Sparkles className="mt-0.5 shrink-0" size={18} />
                    <p>For automatic sending, delivery status, template approvals and click tracking, connect the official WhatsApp Business API in the backend later.</p>
                </div>
            </section>
        </div>
    );
};

export default WhatsAppIntegration;
