import React, { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Search } from "lucide-react";
import api from "@/utils/api";

const statuses = ["New", "Contacted", "Qualified", "Converted", "Rejected", "Paid"];
const rewardStatuses = ["Not Eligible", "Eligible", "Processing", "Paid"];

const initialFilters = {
    search: "",
    status: "",
    rewardStatus: "",
    fromDate: "",
    toDate: "",
};

const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const ProviderReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [summary, setSummary] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState("");

    const totalReferrals = referrals.length;
    const convertedCount = summary.find((item) => item.status === "Converted")?.count || 0;
    const paidCount = summary.find((item) => item.status === "Paid")?.count || 0;
    const newCount = summary.find((item) => item.status === "New")?.count || 0;

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        return params.toString();
    }, [filters]);

    const fetchReferrals = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/referrals${queryParams ? `?${queryParams}` : ""}`);
            setReferrals(res.data?.referrals || []);
            setSummary(res.data?.summary || []);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to load referrals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [queryParams]);

    const handleFilter = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const updateReferral = async (id, payload) => {
        setSavingId(id);
        setError("");
        try {
            const res = await api.put(`/referrals/${id}`, payload);
            const updated = res.data?.referral;
            if (updated) {
                setReferrals((prev) => prev.map((item) => (item.id === id ? updated : item)));
            }
            fetchReferrals();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update referral.");
        } finally {
            setSavingId(null);
        }
    };

    const exportCsv = () => {
        const headers = [
            "Date",
            "Status",
            "Reward Status",
            "Referrer Name",
            "Referrer Phone",
            "Referrer Email",
            "Friend Name",
            "Friend Phone",
            "Friend Email",
            "Company",
            "Notes",
        ];
        const rows = referrals.map((item) => [
            formatDate(item.createdAt),
            item.status,
            item.rewardStatus,
            item.referrerName,
            item.referrerPhone,
            item.referrerEmail,
            item.refereeName,
            item.refereePhone,
            item.refereeEmail,
            item.refereeCompany || "",
            item.notes || "",
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "cresco-referrals.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-r from-[#053054] to-blue-700 p-6 text-white shadow-lg">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">Cresco Super Master</p>
                        <h1 className="mt-2 text-2xl font-black md:text-3xl">Refer & Earn Management</h1>
                        <p className="mt-2 max-w-3xl text-sm font-medium text-blue-100">
                            Track website referral submissions, qualify prospects, and manage reward payout status.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={fetchReferrals}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={exportCsv}
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#053054] hover:bg-blue-50"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {[
                    ["Visible referrals", totalReferrals],
                    ["New", newCount],
                    ["Converted", convertedCount],
                    ["Paid", paidCount],
                ].map(([label, value]) => (
                    <div
                        key={label}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-bold text-slate-500">{label}</p>
                        <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-5">
                    <label className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={filters.search}
                            onChange={(event) => handleFilter("search", event.target.value)}
                            placeholder="Search name, email, phone, company"
                            className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm font-semibold outline-none focus:border-blue-500"
                        />
                    </label>
                    <select
                        value={filters.status}
                        onChange={(event) => handleFilter("status", event.target.value)}
                        className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500"
                    >
                        <option value="">All Status</option>
                        {statuses.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.rewardStatus}
                        onChange={(event) => handleFilter("rewardStatus", event.target.value)}
                        className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500"
                    >
                        <option value="">All Rewards</option>
                        {rewardStatuses.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setFilters(initialFilters)}
                        className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Clear Filters
                    </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(event) => handleFilter("fromDate", event.target.value)}
                        className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500"
                    />
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(event) => handleFilter("toDate", event.target.value)}
                        className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-auto">
                    <table className="min-w-[1200px] w-full text-left text-sm">
                        <thead className="bg-[#053054] text-white">
                            <tr>
                                {["Date", "Referrer", "Referred Business", "Status", "Reward", "Notes"].map((head) => (
                                    <th
                                        key={head}
                                        className="px-4 py-3 font-bold"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-10 text-center font-bold text-slate-500"
                                    >
                                        Loading referrals...
                                    </td>
                                </tr>
                            ) : referrals.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-10 text-center font-bold text-slate-500"
                                    >
                                        No referral submissions found.
                                    </td>
                                </tr>
                            ) : (
                                referrals.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="align-top hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 font-semibold text-slate-600">{formatDate(item.createdAt)}</td>
                                        <td className="px-4 py-4">
                                            <div className="font-black text-slate-950">{item.referrerName}</div>
                                            <div className="mt-1 text-slate-500">{item.referrerPhone}</div>
                                            <div className="text-slate-500">{item.referrerEmail}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-black text-slate-950">{item.refereeName}</div>
                                            <div className="mt-1 text-slate-500">{item.refereePhone}</div>
                                            <div className="text-slate-500">{item.refereeEmail}</div>
                                            <div className="mt-1 font-bold text-blue-700">{item.refereeCompany || "-"}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={item.status}
                                                disabled={savingId === item.id}
                                                onChange={(event) => updateReferral(item.id, { status: event.target.value })}
                                                className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-500"
                                            >
                                                {statuses.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={item.rewardStatus}
                                                disabled={savingId === item.id}
                                                onChange={(event) => updateReferral(item.id, { rewardStatus: event.target.value })}
                                                className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-500"
                                            >
                                                {rewardStatuses.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <textarea
                                                defaultValue={item.notes || ""}
                                                rows={2}
                                                onBlur={(event) => updateReferral(item.id, { notes: event.target.value })}
                                                placeholder="Add internal note"
                                                className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProviderReferrals;
