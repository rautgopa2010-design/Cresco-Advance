import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, IconButton } from "@material-tailwind/react";
import { getAPIs, hitAPI, getAPILeads, updateLeadStatus } from "../../../redux/actions/apiMaster";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { ChevronLeft, ChevronRight, DatabaseZap, ExternalLink, Globe2, Inbox, PlugZap, Sparkles, TrendingUp } from "lucide-react";
import { SiConvertio } from "react-icons/si";
import { FaShare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ApiLeads = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { apis, leads, loading } = useSelector((state) => state.apiMaster);
    const [selectedApi, setSelectedApi] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // ✅ Fetch APIs on load
    useEffect(() => {
        const fetchInitial = async () => {
            await dispatch(getAPIs());
        };
        fetchInitial();
    }, [dispatch]);

    // ✅ Auto fetch leads of first API when APIs are loaded
    useEffect(() => {
        if (apis.length > 0) {
            const firstApiId = apis[0].id;
            setSelectedApi(firstApiId);
            dispatch(getAPILeads(firstApiId));
        }
    }, [apis, dispatch]);

    const handleHitAPI = async (id) => {
        setSelectedApi(id);
        await dispatch(hitAPI(id)); // redux already refreshes leads
        setCurrentPage(1); // reset to first page after new fetch
    };

    const handleStatusChange = async (id, status) => {
        await dispatch(updateLeadStatus(id, status));
        setSnackbarMessage("Lead API status changed successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    const handleConvertLead = (lead) => {
        if (lead.status === "Pending") {
            setSnackbarMessage("Please change Lead API status first.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } else if (lead.status === "Converted") {
            // ✅ redirect with lead data
            //   navigate("/leads/create-leads", { state: { lead } });
            navigate("/leads/create-leads", { state: { lead, apiLeadId: lead.id } });
        }
    };

    // ✅ Pagination logic
    const totalPages = Math.ceil(leads.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + rowsPerPage);
    const convertedLeads = leads.filter((lead) => lead.status === "Converted").length;
    const pendingLeads = leads.filter((lead) => lead.status === "Pending").length;
    const visibleStart = leads.length === 0 ? 0 : startIndex + 1;
    const visibleEnd = Math.min(startIndex + rowsPerPage, leads.length);

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8">
                    <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#053054] p-6 text-white shadow-2xl shadow-blue-200/70 md:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
                        <div className="relative">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                <Sparkles size={14} />
                                CRM API Leads
                            </div>
                            <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">API Leads</h1>
                            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                Review incoming leads from integrations and landing pages, update their status, and convert qualified enquiries into CRM leads.
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: "Connected APIs", value: apis.length, icon: PlugZap, tone: "from-blue-500 to-blue-700", helper: "Available lead sources" },
                            { label: "Total API leads", value: leads.length, icon: DatabaseZap, tone: "from-cyan-500 to-blue-600", helper: "Fetched records" },
                            { label: "Converted", value: convertedLeads, icon: TrendingUp, tone: "from-emerald-500 to-teal-600", helper: "Ready for CRM lead flow" },
                            { label: "Pending", value: pendingLeads, icon: Inbox, tone: "from-orange-500 to-red-500", helper: "Needs action" },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100"
                                >
                                    <div className="mb-5 flex items-start justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg shadow-blue-100`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">Live</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">{item.label}</p>
                                    <div className="mt-2 text-4xl font-black tracking-normal text-slate-950">{item.value}</div>
                                    <p className="mt-2 text-xs font-semibold text-slate-400">{item.helper}</p>
                                </div>
                            );
                        })}
                    </section>

                    {/* All APIs Section */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Globe2 size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">All APIs</h2>
                                <p className="text-sm font-medium text-slate-500">Fetch integration leads or open landing page leads.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {apis.length > 0 ? (
                                apis.map((api) => (
                                    <Button
                                        key={api.id}
                                        variant="filled"
                                        onClick={() => handleHitAPI(api.id)}
                                        className={`rounded-2xl px-4 py-3 text-sm font-black capitalize shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 md:text-base ${selectedApi === api.id ? "bg-[#2563EB]" : "bg-[#053054]"}`}
                                    >
                                        <PlugZap className="mr-2 inline h-4 w-4" />
                                        {api.api_name}
                                    </Button>
                                ))
                            ) : (
                                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                                    <Inbox size={18} />
                                    No APIs available.
                                </div>
                            )}
                            <Button
                                variant="filled"
                                onClick={() => navigate("/api-leads/landing-page-leads")}
                                className="rounded-2xl bg-[#053054] px-4 py-3 text-sm font-black capitalize text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 md:text-base"
                            >
                                <ExternalLink className="mr-2 inline h-4 w-4" />
                                Landing Page Leads
                            </Button>
                        </div>
                    </section>

                    {/* API Leads Data Section */}
                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">API Leads Data</h2>
                                <p className="text-sm font-medium text-slate-500">Incoming lead records from the selected API source.</p>
                            </div>
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                {leads.length} records
                            </span>
                        </div>

                        <div className="card-body p-0">
                            <div className="relative w-full overflow-auto [scrollbar-width:_thin]">
                                <table className="w-full min-w-max border-collapse text-sm">
                                    <thead className="bg-[#053054] text-left text-white">
                                        <tr>
                                            <th className="sticky left-0 z-20 border border-gray-200 bg-[#053054] px-4 py-3">Sr. No.</th>
                                            <th className="sticky left-[4.5rem] z-20 border border-gray-200 bg-[#053054] px-4 py-3">Date</th>
                                            <th className="sticky left-[10rem] z-20 border border-gray-200 bg-[#053054] px-4 py-3">Status</th>

                                            <th className="border border-gray-200 px-4 py-3">Company</th>
                                            <th className="border border-gray-200 px-4 py-3">Contact Person</th>
                                            <th className="border border-gray-200 px-4 py-3">Mobile</th>
                                            <th className="border border-gray-200 px-4 py-3">Phone</th>
                                            <th className="border border-gray-200 px-4 py-3">Email</th>
                                            <th className="border border-gray-200 px-4 py-3">Lead Source</th>
                                            <th className="border border-gray-200 px-4 py-3">Address</th>
                                            <th className="border border-gray-200 px-4 py-3">Description</th>

                                            <th className="sticky right-0 z-20 border border-gray-200 bg-[#053054] px-4 py-3">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                                        {currentLeads.length > 0 ? (
                                            currentLeads.map((lead) => (
                                                <tr
                                                    key={lead.id}
                                                    className="transition-colors hover:bg-blue-50/60"
                                                >
                                                    <td className="sticky left-0 z-10 border border-gray-200 bg-white px-4 py-2">{lead.id}</td>
                                                    <td className="sticky left-[4.5rem] z-10 border border-gray-200 bg-white px-4 py-2">
                                                        {lead.date}
                                                    </td>
                                                    <td className="sticky left-[10rem] z-10 border border-gray-200 bg-white px-4 py-2">
                                                        {lead.status}
                                                    </td>

                                                    <td className="border border-gray-100 px-4 py-2">{lead.SENDER_COMPANY}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.SENDER_NAME}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.SENDER_MOBILE}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.SENDER_PHONE}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.SENDER_EMAIL}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.LEAD_SOURCE}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.SENDER_ADDRESS}</td>
                                                    <td className="border border-gray-100 px-4 py-2">{lead.QUERY_MESSAGE}</td>
                                                    <td className="sticky right-0 z-10 flex items-center justify-center gap-4 border border-gray-200 bg-white px-4 py-2 text-center">
                                                        {/* Change Status Icon */}
                                                        <SiConvertio
                                                            title="Change Status"
                                                            className="cursor-pointer rounded-xl bg-emerald-50 p-2 text-4xl text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                                            onClick={() => handleStatusChange(lead.id, "Converted")}
                                                        />

                                                        {/* Convert into Leads Icon */}
                                                        <FaShare
                                                            title="Convert into leads"
                                                            className="cursor-pointer rounded-xl bg-blue-50 p-2 text-4xl text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100"
                                                            onClick={() => handleConvertLead(lead)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="12"
                                                    className="px-4 py-14 text-center"
                                                >
                                                    <div className="mx-auto flex max-w-md flex-col items-center">
                                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                            <Inbox size={30} />
                                                        </div>
                                                        <div className="text-xl font-black text-slate-900">No API leads yet.</div>
                                                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                                            Hit an API source or check landing page leads to bring new enquiries into this workspace.
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate("/api-leads/landing-page-leads")}
                                                            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#053054] px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300/80 transition hover:-translate-y-0.5 hover:bg-[#04243f]"
                                                        >
                                                            <ExternalLink size={18} />
                                                            Landing Page Leads
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ✅ Pagination Controls */}
                        {leads.length > rowsPerPage && (
                            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm font-bold text-slate-500">
                                    Showing {visibleStart} - {visibleEnd} of {leads.length}
                                </span>
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                        className="flex items-center rounded-full border border-slate-200"
                                    >
                                        <ChevronLeft />
                                    </IconButton>

                                    {/* ✅ Only one circle with current page */}
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#053054] font-black text-white shadow-lg shadow-slate-300">
                                        {currentPage}
                                    </div>

                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                        className="flex items-center rounded-full border border-slate-200"
                                    >
                                        <ChevronRight />
                                    </IconButton>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ApiLeads;
