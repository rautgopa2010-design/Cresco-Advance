import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, IconButton } from "@material-tailwind/react";
import { getAPIs, hitAPI, getAPILeads, updateLeadStatus } from "../../../redux/actions/apiMaster";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card p-4">
                    {/* Heading */}
                    <div className="mb-4 text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">API Leads :</div>
                    </div>

                    {/* All APIs Section */}
                    <div className="card mb-6 p-4">
                        <h2 className="mb-3 text-base font-semibold text-[#433C50] md:text-lg">All APIs</h2>
                        <div className="flex flex-wrap gap-3">
                            {apis.length > 0 ? (
                                apis.map((api) => (
                                    <Button
                                        key={api.id}
                                        variant="gradient"
                                        onClick={() => handleHitAPI(api.id)}
                                        className="rounded-full bg-[#053054] px-4 py-2 text-sm capitalize text-white md:text-base"
                                    >
                                        {"Hit "}
                                        {api.api_name}
                                        {" API"}
                                    </Button>
                                ))
                            ) : (
                                <p className="text-gray-400">No APIs available.</p>
                            )}
                            <Button
                                variant="gradient"
                                onClick={() => navigate("/api-leads/landing-page-leads")}
                                className="rounded-full bg-[#053054] px-4 py-2 text-sm capitalize text-white md:text-base"
                            >
                                Landing Page Leads
                            </Button>
                        </div>
                    </div>

                    {/* API Leads Data Section */}
                    <div className="card p-4">
                        <h2 className="mb-3 text-base font-semibold text-[#433C50] md:text-lg">API Leads Data</h2>

                        <div className="card-body p-0">
                            <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-md">
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
                                                    className="transition-colors hover:bg-gray-50"
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
                                                            className="cursor-pointer text-xl text-green-600 hover:text-green-700"
                                                            onClick={() => handleStatusChange(lead.id, "Converted")}
                                                        />

                                                        {/* Convert into Leads Icon */}
                                                        <FaShare
                                                            title="Convert into leads"
                                                            className="cursor-pointer text-xl text-blue-600 hover:text-blue-700"
                                                            onClick={() => handleConvertLead(lead)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="12"
                                                    className="py-6 text-center text-gray-400"
                                                >
                                                    No API Leads Data Added Yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ✅ Pagination Controls */}
                        {leads.length > rowsPerPage && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, leads.length)} of {leads.length}
                                </span>
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                        className="mt-5 flex items-center rounded-full"
                                    >
                                        <ChevronLeft />
                                    </IconButton>

                                    {/* ✅ Only one circle with current page */}
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
                                        {currentPage}
                                    </div>

                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                        className="mt-5 flex items-center rounded-full"
                                    >
                                        <ChevronRight />
                                    </IconButton>
                                </div>
                            </div>
                        )}
                    </div>
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
