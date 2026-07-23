import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Compass, ExternalLink, Loader2, MapPinned, Navigation, RefreshCcw, Search, UserRound } from "lucide-react";
import api from "../../utils/api";

const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const compactAddress = (...parts) => parts.filter(Boolean).join(", ");

const customerName = (customer) => customer.companyName || [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer";
const leadName = (lead) => lead.companyName || lead.customerPerson || "Lead";

const FieldVisits = ({ mode = "check-in" }) => {
    const [visitFor, setVisitFor] = useState("Customer");
    const [customers, setCustomers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [visits, setVisits] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [manualClientName, setManualClientName] = useState("");
    const [notes, setNotes] = useState("");
    const [location, setLocation] = useState(null);
    const [currentAddress, setCurrentAddress] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [query, setQuery] = useState("");

    const isCheckIn = mode === "check-in";
    const pageTitle = mode === "map" ? "Visit Map" : mode === "history" ? "Visit History" : "Visit Check-in";

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [visitsRes, customersRes, leadsRes] = await Promise.allSettled([
                api.get("/field-visits"),
                isCheckIn ? api.get("/customer") : Promise.resolve({ data: [] }),
                isCheckIn ? api.get("/lead") : Promise.resolve({ data: [] }),
            ]);

            if (visitsRes.status === "fulfilled") setVisits(visitsRes.value.data || []);
            else throw visitsRes.reason;

            setCustomers(customersRes.status === "fulfilled" ? customersRes.value.data || [] : []);
            setLeads(leadsRes.status === "fulfilled" ? leadsRes.value.data || [] : []);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || "Failed to load field visit data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [mode]);

    const targetOptions = useMemo(() => {
        if (visitFor === "Lead") {
            return leads.map((lead) => ({
                id: lead.id,
                label: leadName(lead),
                contactPerson: lead.customerPerson,
                mobile: lead.mobile,
                address: compactAddress(lead.shippingStreet || lead.billingStreet, lead.shippingCity || lead.billingCity, lead.shippingState || lead.billingState, lead.shippingPincode || lead.billingPincode, lead.shippingCountry || lead.billingCountry),
            }));
        }

        return customers.map((customer) => ({
            id: customer.id,
            label: customerName(customer),
            contactPerson: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
            mobile: customer.mobile,
            address: compactAddress(customer.shippingStreet || customer.billingStreet, customer.shippingCity || customer.billingCity, customer.shippingState || customer.billingState, customer.shippingPincode || customer.billingPincode, customer.shippingCountry || customer.billingCountry),
        }));
    }, [customers, leads, visitFor]);

    const selectedTarget = targetOptions.find((item) => String(item.id) === String(selectedId));

    const filteredVisits = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return visits;
        return visits.filter((visit) =>
            [visit.clientName, visit.contactPerson, visit.mobile, visit.employeeName, visit.visitFor, visit.address]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(search)),
        );
    }, [query, visits]);

    const resolveCurrentAddress = async (latitude, longitude) => {
        try {
            const params = new URLSearchParams({
                format: "jsonv2",
                lat: String(latitude),
                lon: String(longitude),
            });
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
                headers: { Accept: "application/json" },
            });
            if (!response.ok) throw new Error("Reverse geocode failed");
            const data = await response.json();
            return data.display_name || "";
        } catch {
            return "";
        }
    };

    const getCurrentLocation = () => {
        setError("");
        setMessage("");
        setCurrentAddress("");
        if (!navigator.geolocation) {
            setError("Geolocation is not supported on this device/browser.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const capturedLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: Math.round(position.coords.accuracy || 0),
                };
                const resolvedAddress = await resolveCurrentAddress(capturedLocation.latitude, capturedLocation.longitude);
                setLocation(capturedLocation);
                setCurrentAddress(resolvedAddress || `Lat ${capturedLocation.latitude.toFixed(6)}, Long ${capturedLocation.longitude.toFixed(6)}`);
                setMessage("Current location captured. You can save the visit now.");
                setLoading(false);
            },
            (err) => {
                setError(err.message || "Unable to capture current location. Please allow location permission.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    const saveVisit = async () => {
        setError("");
        setMessage("");
        if (!location) {
            setError("Please capture current location first.");
            return;
        }
        if (!selectedTarget && !manualClientName.trim()) {
            setError("Please select a customer/lead or enter a client name.");
            return;
        }

        setSaving(true);
        try {
            await api.post("/field-visits/check-in", {
                visitFor,
                customer_id: visitFor === "Customer" && selectedTarget ? selectedTarget.id : null,
                lead_id: visitFor === "Lead" && selectedTarget ? selectedTarget.id : null,
                clientName: selectedTarget?.label || manualClientName.trim(),
                contactPerson: selectedTarget?.contactPerson || "",
                mobile: selectedTarget?.mobile || "",
                address: currentAddress || `Lat ${location.latitude.toFixed(6)}, Long ${location.longitude.toFixed(6)}`,
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                notes,
            });
            setMessage("Visit check-in saved successfully.");
            setSelectedId("");
            setManualClientName("");
            setNotes("");
            setLocation(null);
            setCurrentAddress("");
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || "Failed to save visit check-in");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 pb-8 text-slate-900">
            <section className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6 text-white shadow-xl shadow-blue-900/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-50">
                            <MapPinned size={15} />
                            Field Visits
                        </span>
                        <h1 className="mt-4 text-3xl font-black leading-tight">{pageTitle}</h1>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-50">
                            Capture employee client visits with GPS check-ins, timestamps, and visit notes.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-60"
                    >
                        <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </section>

            {(message || error) && (
                <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${error ? "border border-red-100 bg-red-50 text-red-700" : "border border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
                    {error || message}
                </div>
            )}

            {isCheckIn && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {["Customer", "Lead"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setVisitFor(type);
                                            setSelectedId("");
                                        }}
                                        className={`rounded-2xl px-5 py-3 text-sm font-black transition ${visitFor === type ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-700"}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <select
                                value={selectedId}
                                onChange={(event) => setSelectedId(event.target.value)}
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="">Select {visitFor.toLowerCase()} or enter manually</option>
                                {targetOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={manualClientName}
                                onChange={(event) => setManualClientName(event.target.value)}
                                disabled={Boolean(selectedId)}
                                placeholder="Manual client name"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                            />
                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Visit notes"
                                rows={4}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
                            <div className="flex items-start gap-3">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                    <Compass size={22} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Current location</h2>
                                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                        Browser will ask location permission. Save only when salesperson is at the client place.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600">
                                {location ? (
                                    <div className="space-y-1">
                                        <p>Latitude: {location.latitude.toFixed(6)}</p>
                                        <p>Longitude: {location.longitude.toFixed(6)}</p>
                                        <p>Accuracy: {location.accuracy || "-"} meters</p>
                                        {currentAddress && <p>Current address: {currentAddress}</p>}
                                    </div>
                                ) : (
                                    <p>No location captured yet.</p>
                                )}
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                                >
                                    {loading ? <Loader2 size={17} className="animate-spin" /> : <Navigation size={17} />}
                                    Get Location
                                </button>
                                <button
                                    type="button"
                                    onClick={saveVisit}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {saving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                                    Save Visit
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">{mode === "map" ? "Location Review" : "Visit Records"}</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Org-wise visit records with salesperson, client, GPS, and timestamp.</p>
                    </div>
                    <div className="relative w-full lg:w-80">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search visits..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredVisits.length ? (
                        filteredVisits.map((visit) => (
                            <article key={visit.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate text-base font-black text-slate-950">{visit.clientName}</h3>
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{visit.visitFor}</span>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                                            <p className="flex items-center gap-2"><UserRound size={15} />{visit.employeeName}</p>
                                            <p>{visit.contactPerson || "-"}</p>
                                            <p>{visit.mobile || "-"}</p>
                                            <p className="flex items-center gap-2"><CalendarDays size={15} />{formatDateTime(visit.checkedInAt)}</p>
                                        </div>
                                        {visit.address && <p className="mt-3 text-sm font-semibold text-slate-500">{visit.address}</p>}
                                        {visit.notes && <p className="mt-2 text-sm text-slate-500">{visit.notes}</p>}
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                                    >
                                        Open Map
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                            <MapPinned size={32} className="mx-auto text-slate-300" />
                            <p className="mt-3 text-sm font-black text-slate-500">No field visits found.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default FieldVisits;
