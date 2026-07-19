import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CalendarClock,
    CheckCircle2,
    Clock3,
    Headphones,
    Mic,
    PhoneCall,
    PhoneForwarded,
    PhoneMissed,
    Plus,
    Search,
    StickyNote,
    UsersRound,
} from "lucide-react";
import { getLeads } from "../../redux/actions/leadAndFollowup";
import { getCustomers } from "../../redux/actions/customer";

const STORAGE_KEY = "crescosoft_call_center_logs";

const loadLogs = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
};

const saveLogs = (logs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

const getContactName = (record) =>
    record?.customerPerson ||
    [record?.salutation, record?.firstName, record?.middleName, record?.lastName].filter(Boolean).join(" ") ||
    record?.customerName ||
    "Unknown contact";

const normalizePhone = (record) => [record?.code, record?.mobile || record?.phone].filter(Boolean).join(" ").trim();

const buildCallContacts = (leads = [], customers = []) => {
    const leadContacts = leads
        .filter((lead) => lead.mobile || lead.phone)
        .map((lead) => ({
            id: `lead-${lead.id}`,
            sourceId: lead.id,
            type: "Lead",
            name: getContactName(lead),
            companyName: lead.companyName || "No company",
            phone: normalizePhone(lead),
            stage: lead.leadStage || "No stage",
            status: lead.leadStatus || "Open",
            assignedTo: Array.isArray(lead.assignedTo) ? lead.assignedTo.join(", ") : lead.assignedTo || "Unassigned",
            followupDate: lead.followupDate || lead.nextFollowUpDate,
        }));

    const customerContacts = customers
        .filter((customer) => customer.mobile || customer.phone)
        .map((customer) => ({
            id: `customer-${customer.id}`,
            sourceId: customer.id,
            type: "Customer",
            name: getContactName(customer),
            companyName: customer.companyName || "No company",
            phone: normalizePhone(customer),
            stage: "Customer",
            status: customer.status || "Active",
            assignedTo: Array.isArray(customer.assignedTo) ? customer.assignedTo.join(", ") : customer.assignedTo || "Unassigned",
            followupDate: customer.followupDate || customer.nextFollowUpDate,
        }));

    return [...leadContacts, ...customerContacts];
};

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const MetricCard = ({ icon: Icon, label, value, caption, tone }) => (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={22} />
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-600">Live</span>
        </div>
        <p className="mt-5 text-sm font-black text-slate-500">{label}</p>
        <p className="mt-2 text-[34px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-3 text-xs font-bold text-slate-400">{caption}</p>
    </div>
);

const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Icon size={25} />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{message}</p>
    </div>
);

const CallIntegration = () => {
    const dispatch = useDispatch();
    const { leads = [] } = useSelector((state) => state.leadAndFollowup || {});
    const { customers = [] } = useSelector((state) => state.customer || {});

    const [query, setQuery] = useState("");
    const [logs, setLogs] = useState(loadLogs);
    const [selectedContactId, setSelectedContactId] = useState("");
    const [outcome, setOutcome] = useState("Connected");
    const [note, setNote] = useState("");

    useEffect(() => {
        dispatch(getLeads());
        dispatch(getCustomers());
    }, [dispatch]);

    useEffect(() => {
        saveLogs(logs);
    }, [logs]);

    const contacts = useMemo(() => buildCallContacts(leads, customers), [leads, customers]);
    const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || contacts[0];

    useEffect(() => {
        if (!selectedContactId && contacts.length) {
            setSelectedContactId(contacts[0].id);
        }
    }, [contacts, selectedContactId]);

    const filteredContacts = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return contacts;
        return contacts.filter((contact) =>
            [contact.name, contact.companyName, contact.phone, contact.type, contact.stage, contact.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [contacts, query]);

    const summary = useMemo(() => {
        const today = new Date().toDateString();
        const todaysLogs = logs.filter((log) => new Date(log.createdAt).toDateString() === today);
        return {
            callReady: contacts.length,
            todaysCalls: todaysLogs.length,
            missedCalls: logs.filter((log) => log.outcome === "Missed").length,
            recordings: logs.filter((log) => log.recordingStatus === "Available").length,
        };
    }, [contacts.length, logs]);

    const startCall = (contact = selectedContact) => {
        if (!contact?.phone) return;
        window.location.href = `tel:${contact.phone.replace(/\s+/g, "")}`;
        const callLog = {
            id: Date.now(),
            contactId: contact.id,
            name: contact.name,
            companyName: contact.companyName,
            phone: contact.phone,
            type: contact.type,
            outcome: "Dialed",
            note: "Call started from CRM.",
            recordingStatus: "Provider pending",
            createdAt: new Date().toISOString(),
        };
        setLogs((current) => [callLog, ...current].slice(0, 50));
    };

    const addManualLog = () => {
        if (!selectedContact) return;
        const callLog = {
            id: Date.now(),
            contactId: selectedContact.id,
            name: selectedContact.name,
            companyName: selectedContact.companyName,
            phone: selectedContact.phone,
            type: selectedContact.type,
            outcome,
            note: note.trim() || "No note added.",
            recordingStatus: outcome === "Connected" ? "Available" : "Not available",
            createdAt: new Date().toISOString(),
        };
        setLogs((current) => [callLog, ...current].slice(0, 50));
        setNote("");
    };

    const missedFollowups = logs.filter((log) => log.outcome === "Missed").slice(0, 5);

    return (
        <div className="space-y-7 bg-slate-50 px-5 py-6 md:px-8">
            <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-7 text-white shadow-[0_28px_70px_rgba(37,99,235,0.22)] md:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-50">
                            <PhoneCall size={15} />
                            CRM Calls
                        </span>
                        <h1 className="mt-4 text-[34px] font-black leading-tight md:text-[42px]">Call Integration</h1>
                        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
                            Call leads and customers from CRM, keep call logs, add notes, track recordings, and follow up missed calls from one workspace.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => startCall()}
                        disabled={!selectedContact?.phone}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <PhoneCall size={18} />
                        Call Selected
                    </button>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={UsersRound} label="Call-ready contacts" value={summary.callReady} caption="Leads and customers with mobile" tone="bg-blue-50 text-blue-600" />
                <MetricCard icon={PhoneForwarded} label="Today's calls" value={summary.todaysCalls} caption="Dialed and logged today" tone="bg-emerald-50 text-emerald-600" />
                <MetricCard icon={PhoneMissed} label="Missed follow-ups" value={summary.missedCalls} caption="Needs callback attention" tone="bg-rose-50 text-rose-600" />
                <MetricCard icon={Mic} label="Recordings" value={summary.recordings} caption="Ready after provider sync" tone="bg-purple-50 text-purple-600" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Call From CRM</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Search a lead or customer and start a phone call.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search contact, company, mobile..."
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
                        {filteredContacts.length ? (
                            <div className="divide-y divide-slate-100">
                                {filteredContacts.slice(0, 8).map((contact) => (
                                    <button
                                        key={contact.id}
                                        type="button"
                                        onClick={() => setSelectedContactId(contact.id)}
                                        className={`flex w-full flex-col gap-4 px-5 py-4 text-left transition hover:bg-blue-50/60 md:flex-row md:items-center md:justify-between ${
                                            selectedContactId === contact.id ? "bg-blue-50" : "bg-white"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                                <Headphones size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-950">{contact.name}</h3>
                                                <p className="mt-1 text-sm font-semibold text-slate-500">{contact.companyName}</p>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{contact.type}</span>
                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">{contact.stage}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-700">{contact.phone}</span>
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    startCall(contact);
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        startCall(contact);
                                                    }
                                                }}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
                                            >
                                                <PhoneCall size={18} />
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={PhoneCall} title="No call-ready contacts" message="Add mobile numbers to leads or customers to start calling from CRM." />
                        )}
                    </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Log Call Notes</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Capture outcome, notes, and recording status for the selected contact.</p>
                    </div>

                    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Selected contact</p>
                        <h3 className="mt-2 text-lg font-black text-slate-950">{selectedContact?.name || "No contact selected"}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{selectedContact?.companyName || "Select a contact to add call logs."}</p>
                    </div>

                    <div className="mt-5 grid gap-4">
                        <select
                            value={outcome}
                            onChange={(event) => setOutcome(event.target.value)}
                            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option>Connected</option>
                            <option>Missed</option>
                            <option>Busy</option>
                            <option>Voicemail</option>
                            <option>Follow-up Required</option>
                        </select>
                        <textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Add call note, customer response, next action..."
                            rows={5}
                            className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                            type="button"
                            onClick={addManualLog}
                            disabled={!selectedContact}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus size={18} />
                            Add Call Log
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Call History</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Recent dialed calls, notes, outcomes, and recording status.</p>
                        </div>
                        <Clock3 className="text-blue-600" size={24} />
                    </div>
                    {logs.length ? (
                        <div className="overflow-hidden rounded-3xl border border-slate-200">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-950 text-xs uppercase tracking-[0.12em] text-white">
                                    <tr>
                                        <th className="px-4 py-4">Contact</th>
                                        <th className="px-4 py-4">Phone</th>
                                        <th className="px-4 py-4">Outcome</th>
                                        <th className="px-4 py-4">Recording</th>
                                        <th className="px-4 py-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {logs.slice(0, 8).map((log) => (
                                        <tr key={log.id} className="align-top">
                                            <td className="px-4 py-4">
                                                <p className="font-black text-slate-950">{log.name}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">{log.companyName}</p>
                                                <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500">
                                                    <StickyNote size={14} className="mt-0.5 shrink-0" />
                                                    {log.note}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-slate-600">{log.phone}</td>
                                            <td className="px-4 py-4">
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{log.outcome}</span>
                                            </td>
                                            <td className="px-4 py-4 text-xs font-black text-slate-500">{log.recordingStatus}</td>
                                            <td className="px-4 py-4 text-xs font-black text-slate-500">{formatDateTime(log.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState icon={PhoneCall} title="No call history yet" message="Start a call or add a call note to build communication history for every lead and customer." />
                    )}
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-black text-slate-950">Missed-call Follow-up</h2>
                            <p className="mt-1 text-sm font-semibold text-slate-500">Calls marked missed appear here for quick callback action.</p>
                        </div>
                        <PhoneMissed className="text-rose-500" size={24} />
                    </div>
                    {missedFollowups.length ? (
                        <div className="space-y-3">
                            {missedFollowups.map((log) => (
                                <div key={log.id} className="rounded-3xl border border-rose-100 bg-rose-50/70 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-black text-slate-950">{log.name}</h3>
                                            <p className="mt-1 text-sm font-semibold text-slate-500">{log.companyName}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => startCall({ ...log, id: log.contactId })}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white"
                                        >
                                            <PhoneCall size={18} />
                                        </button>
                                    </div>
                                    <p className="mt-3 flex items-center gap-2 text-xs font-black text-rose-700">
                                        <CalendarClock size={14} />
                                        Follow up from missed call at {formatDateTime(log.createdAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={CheckCircle2} title="No missed calls pending" message="When a call is marked missed, it will appear here as a callback task." />
                    )}
                </div>
            </section>
        </div>
    );
};

export default CallIntegration;
