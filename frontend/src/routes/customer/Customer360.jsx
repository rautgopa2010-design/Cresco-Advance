import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowRight,
    Building2,
    CalendarClock,
    FileCheck2,
    FileText,
    Mail,
    PackageCheck,
    Phone,
    ReceiptText,
    Search,
    Sparkles,
    UserRound,
    WalletCards,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { getCustomers } from "../../redux/actions/customer";
import { getLeads } from "../../redux/actions/leadAndFollowup";
import { getQuotations } from "../../redux/actions/quotation";
import { getOrders } from "../../redux/actions/order";
import { getInvoices } from "../../redux/actions/invoice";

const text = (value) => `${value || ""}`.trim();
const lower = (value) => text(value).toLowerCase();
const numberValue = (value) => Number(String(value || 0).replace(/,/g, "")) || 0;

const formatMoney = (amount) => {
    const value = numberValue(amount);
    if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(value % 10000000 ? 1 : 0)}Cr`;
    if (value >= 100000) return `Rs ${(value / 100000).toFixed(value % 100000 ? 1 : 0)}L`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(value % 1000 ? 1 : 0)}K`;
    return `Rs ${value.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return text(value) || "-";
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const displayName = (record) =>
    text(record?.companyName) ||
    text(record?.selectedCompany) ||
    [record?.firstName, record?.lastName].map(text).filter(Boolean).join(" ") ||
    text(record?.customerPerson) ||
    "Unnamed customer";

const contactName = (record) =>
    [record?.firstName, record?.lastName].map(text).filter(Boolean).join(" ") ||
    text(record?.customerPerson) ||
    text(record?.contactPerson) ||
    "-";

const getAmount = (record) => numberValue(record?.finalAmt ?? record?.totalAmount ?? record?.grandTotal ?? record?.amount);

const normalizePhone = (value) => lower(value).replace(/[^0-9]/g, "");

const getRecordIdentity = (record) => ({
    company: lower(record.companyName || record.selectedCompany),
    person: lower(record.customerPerson || [record.firstName, record.lastName].filter(Boolean).join(" ")),
    email: lower(record.email),
    mobile: normalizePhone(record.mobile || record.phone),
});

const isRelated = (record, selected) => {
    if (!record || !selected) return false;
    const a = getRecordIdentity(record);
    const b = getRecordIdentity(selected);
    return (
        (b.company && a.company && a.company === b.company) ||
        (b.email && a.email && a.email === b.email) ||
        (b.mobile && a.mobile && a.mobile === b.mobile) ||
        (b.person && a.person && a.person === b.person)
    );
};

const statusTone = (status = "") => {
    const value = lower(status);
    if (["completed", "paid", "won", "converted"].some((item) => value.includes(item))) return "bg-emerald-50 text-emerald-700";
    if (["cancel", "lost", "dropped", "overdue"].some((item) => value.includes(item))) return "bg-rose-50 text-rose-700";
    if (["partial", "pending", "hold"].some((item) => value.includes(item))) return "bg-amber-50 text-amber-700";
    return "bg-blue-50 text-blue-700";
};

const Section = ({ title, subtitle, icon: Icon, children, action }) => (
    <section className="rounded-[8px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-[8px] bg-blue-50 text-blue-700">
                    <Icon size={20} />
                </span>
                <div>
                    <h2 className="text-base font-black text-slate-950">{title}</h2>
                    <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
                </div>
            </div>
            {action}
        </div>
        {children}
    </section>
);

const Metric = ({ label, value, helper, icon: Icon, tone }) => (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
            </div>
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-[8px] ${tone}`}>
                <Icon size={20} />
            </span>
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-400">{helper}</p>
    </div>
);

const CompactList = ({ rows, empty, render }) => (
    <div className="divide-y divide-slate-100">
        {rows.length ? rows.map(render) : <div className="px-5 py-8 text-center text-sm font-semibold text-slate-400">{empty}</div>}
    </div>
);

const Customer360 = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const { customers = [], loading: customerLoading } = useSelector((state) => state.customer || {});
    const { leads = [], leadLoading } = useSelector((state) => state.leadAndFollowup || {});
    const { quotations = [], loading: quotationLoading } = useSelector((state) => state.quotation || {});
    const { orders = [], loading: orderLoading } = useSelector((state) => state.order || {});
    const { invoices = [], loading: invoiceLoading } = useSelector((state) => state.invoice || {});

    useEffect(() => {
        dispatch(getCustomers());
        dispatch(getLeads());
        dispatch(getQuotations());
        dispatch(getOrders());
        dispatch(getInvoices());
    }, [dispatch]);

    const loading = customerLoading || leadLoading || quotationLoading || orderLoading || invoiceLoading;

    const customerOptions = useMemo(() => {
        const map = new Map();

        customers.forEach((customer) => {
            const key = `customer-${customer.id}`;
            map.set(key, { ...customer, source: "Customer", key });
        });

        [...orders, ...quotations, ...leads].forEach((record, index) => {
            const identity = getRecordIdentity(record);
            const signature = identity.company || identity.email || identity.mobile || identity.person;
            if (!signature) return;
            const existing = [...map.values()].some((item) => isRelated(record, item));
            if (!existing) {
                const key = `activity-${record.id || index}-${signature}`;
                map.set(key, {
                    id: key,
                    key,
                    source: "Activity",
                    companyName: record.companyName || record.selectedCompany,
                    customerPerson: record.customerPerson,
                    email: record.email,
                    mobile: record.mobile,
                });
            }
        });

        return [...map.values()].sort((a, b) => displayName(a).localeCompare(displayName(b)));
    }, [customers, leads, orders, quotations]);

    useEffect(() => {
        if (!selectedId && customerOptions.length) {
            setSelectedId(customerOptions[0].key);
        }
    }, [customerOptions, selectedId]);

    const filteredCustomers = useMemo(() => {
        const query = lower(search);
        if (!query) return customerOptions;
        return customerOptions.filter((customer) =>
            [displayName(customer), contactName(customer), customer.email, customer.mobile].some((field) => lower(field).includes(query)),
        );
    }, [customerOptions, search]);

    const selectedCustomer = customerOptions.find((customer) => customer.key === selectedId) || filteredCustomers[0] || customerOptions[0];

    const related = useMemo(() => {
        if (!selectedCustomer) return { leads: [], quotations: [], orders: [], invoices: [] };
        return {
            leads: leads.filter((item) => isRelated(item, selectedCustomer)),
            quotations: quotations.filter((item) => isRelated(item, selectedCustomer)),
            orders: orders.filter((item) => isRelated(item, selectedCustomer)),
            invoices: invoices.filter((item) => isRelated(item, selectedCustomer)),
        };
    }, [invoices, leads, orders, quotations, selectedCustomer]);

    const summary = useMemo(() => {
        const revenue = related.orders.reduce((sum, order) => sum + getAmount(order), 0);
        const invoiceValue = related.invoices.reduce((sum, invoice) => sum + getAmount(invoice), 0);
        const activeLeads = related.leads.filter((lead) => !["lost", "dropped", "closed"].some((item) => lower(lead.leadStage || lead.status).includes(item))).length;
        const openInvoices = related.invoices.filter((invoice) => !["paid", "completed", "cancel"].some((item) => lower(invoice.status).includes(item))).length;
        return { revenue, invoiceValue, activeLeads, openInvoices };
    }, [related]);

    const timeline = useMemo(() => {
        const rows = [
            ...related.leads.map((item) => ({ type: "Lead", label: item.companyName || item.customerPerson, status: item.leadStage || item.status || "Open", amount: item.expectedAmount, date: item.updatedAt || item.createdAt, path: `/leads/view-leads/${item.id}` })),
            ...related.quotations.map((item) => ({ type: "Quotation", label: item.quotationNo ? `QMS-${item.quotationNo}` : item.customerPerson, status: item.status || "Created", amount: item.finalAmt, date: item.updatedAt || item.date || item.createdAt, path: `/quotations/view-quotation/${item.id}` })),
            ...related.orders.map((item) => ({ type: "Order", label: item.orderNo ? `OMS-${item.orderNo}` : item.customerPerson, status: item.status || "Pending", amount: item.finalAmt, date: item.updatedAt || item.date || item.createdAt, path: `/orders/view-order/${item.id}` })),
            ...related.invoices.map((item) => ({ type: "Invoice", label: item.invoiceNo ? `INV-${item.invoiceNo}` : item.customerPerson, status: item.status || "Pending", amount: item.finalAmt, date: item.updatedAt || item.date || item.createdAt, path: `/invoice/view-invoice/${item.id}` })),
        ];
        return rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 10);
    }, [related]);

    if (loading && !customerOptions.length) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="rounded-[8px] bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-800 p-6 text-white shadow-xl shadow-blue-950/10">
                <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
                            <Sparkles size={14} />
                            Customer Intelligence
                        </div>
                        <h1 className="mt-4 text-3xl font-black">Customer 360</h1>
                        <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">
                            One professional view of account profile, sales movement, orders, invoices, and relationship activity.
                        </p>
                    </div>
                    <div className="w-full max-w-md rounded-[8px] border border-white/15 bg-white/10 p-3">
                        <div className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-slate-700">
                            <Search size={18} />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customer, company, email or mobile"
                                className="w-full bg-transparent text-sm font-semibold outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
                <section className="rounded-[8px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-base font-black text-slate-950">Accounts</h2>
                        <p className="text-sm font-semibold text-slate-500">{filteredCustomers.length} matching customers</p>
                    </div>
                    <div className="max-h-[680px] overflow-y-auto p-3">
                        {filteredCustomers.length ? (
                            filteredCustomers.map((customer) => {
                                const active = selectedCustomer?.key === customer.key;
                                return (
                                    <button
                                        key={customer.key}
                                        type="button"
                                        onClick={() => setSelectedId(customer.key)}
                                        className={`mb-2 w-full rounded-[8px] border p-3 text-left transition ${active ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-slate-900 text-sm font-black text-white">
                                                {displayName(customer).charAt(0).toUpperCase()}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-black text-slate-950">{displayName(customer)}</span>
                                                <span className="block truncate text-xs font-semibold text-slate-500">{contactName(customer)}</span>
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center text-sm font-semibold text-slate-400">No customers found.</div>
                        )}
                    </div>
                </section>

                <div className="space-y-5">
                    {selectedCustomer && (
                        <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <span className="flex size-16 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white">
                                        {displayName(selectedCustomer).charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-950">{displayName(selectedCustomer)}</h2>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">{contactName(selectedCustomer)}</p>
                                        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><Mail size={15} />{selectedCustomer.email || "No email"}</span>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><Phone size={15} />{selectedCustomer.mobile || "No mobile"}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/customer")}
                                    className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                                >
                                    Customer list <ArrowRight size={16} />
                                </button>
                            </div>
                        </section>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric label="Lifetime revenue" value={formatMoney(summary.revenue)} helper="From related orders" icon={WalletCards} tone="bg-emerald-50 text-emerald-700" />
                        <Metric label="Invoice value" value={formatMoney(summary.invoiceValue)} helper={`${summary.openInvoices} open invoice(s)`} icon={ReceiptText} tone="bg-amber-50 text-amber-700" />
                        <Metric label="Active leads" value={summary.activeLeads} helper={`${related.leads.length} total lead(s)`} icon={Activity} tone="bg-blue-50 text-blue-700" />
                        <Metric label="Completed orders" value={related.orders.filter((order) => lower(order.status).includes("completed")).length} helper={`${related.orders.length} total order(s)`} icon={PackageCheck} tone="bg-violet-50 text-violet-700" />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <Section title="Commercial Snapshot" subtitle="Quotations, orders and invoices tied to this customer." icon={FileCheck2}>
                            <div className="grid gap-3 p-5 sm:grid-cols-3">
                                <div className="rounded-[8px] bg-slate-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Quotations</p>
                                    <p className="mt-2 text-2xl font-black text-slate-950">{related.quotations.length}</p>
                                    <p className="text-sm font-semibold text-slate-500">{formatMoney(related.quotations.reduce((sum, item) => sum + getAmount(item), 0))}</p>
                                </div>
                                <div className="rounded-[8px] bg-slate-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Orders</p>
                                    <p className="mt-2 text-2xl font-black text-slate-950">{related.orders.length}</p>
                                    <p className="text-sm font-semibold text-slate-500">{formatMoney(summary.revenue)}</p>
                                </div>
                                <div className="rounded-[8px] bg-slate-50 p-4">
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Invoices</p>
                                    <p className="mt-2 text-2xl font-black text-slate-950">{related.invoices.length}</p>
                                    <p className="text-sm font-semibold text-slate-500">{formatMoney(summary.invoiceValue)}</p>
                                </div>
                            </div>
                        </Section>

                        <Section title="Relationship Health" subtitle="Current movement across pipeline and engagement." icon={UserRound}>
                            <div className="grid gap-3 p-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-blue-50 p-4">
                                    <p className="text-sm font-black text-blue-950">Latest status</p>
                                    <p className="mt-2 text-xl font-black text-blue-700">{timeline[0]?.status || "No activity"}</p>
                                </div>
                                <div className="rounded-[8px] bg-emerald-50 p-4">
                                    <p className="text-sm font-black text-emerald-950">Last touchpoint</p>
                                    <p className="mt-2 text-xl font-black text-emerald-700">{formatDate(timeline[0]?.date)}</p>
                                </div>
                            </div>
                        </Section>
                    </div>

                    <Section title="Customer Timeline" subtitle="Latest CRM activity across lead to collection." icon={CalendarClock}>
                        <CompactList
                            rows={timeline}
                            empty="No linked activity yet."
                            render={(item, index) => (
                                <button
                                    key={`${item.type}-${index}-${item.label}`}
                                    type="button"
                                    onClick={() => item.path && navigate(item.path)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-slate-100 text-slate-700">
                                            {item.type === "Invoice" ? <ReceiptText size={18} /> : item.type === "Order" ? <PackageCheck size={18} /> : item.type === "Quotation" ? <FileText size={18} /> : <Activity size={18} />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-black text-slate-950">{item.label || item.type}</span>
                                            <span className="block text-xs font-semibold text-slate-500">{item.type} - {formatDate(item.date)}</span>
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusTone(item.status)}`}>{item.status}</span>
                                        <span className="hidden min-w-[86px] text-right text-sm font-black text-slate-900 sm:block">{formatMoney(item.amount)}</span>
                                    </div>
                                </button>
                            )}
                        />
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default Customer360;
