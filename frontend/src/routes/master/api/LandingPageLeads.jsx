import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton } from "@material-tailwind/react";
import { getLandingLeads, updateLandingLeadStatus } from "../../../redux/actions/landingPageLeadActions";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiConvertio } from "react-icons/si";
import { FaShare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LandingPageLeads = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { leads, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.landingPageLead);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        dispatch(getLandingLeads());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleStatusChange = (id) => {
        dispatch(updateLandingLeadStatus(id, "Converted"));
    };

    const handleConvertLead = (lead) => {
        if (lead.status === "Pending") {
            console.warn("Cannot convert: Status is still Pending");
            setSnackbarOpen(true);
            return;
        }

        console.log("Navigating with Landing Page Lead data:", lead);

        // Decide mode based on whether company name actually exists and is meaningful
        const hasCompany = !!lead.SENDER_COMPANY && lead.SENDER_COMPANY.trim().length >= 2; // adjust threshold if needed

        console.log("Expected fields:", {
            name: lead.SENDER_NAME,
            company: lead.SENDER_COMPANY,
            mobile: lead.SENDER_MOBILE,
            email: lead.SENDER_EMAIL,
            address: lead.SENDER_ADDRESS,
            message: lead.QUERY_MESSAGE,
        });

        navigate("/leads/create-leads", {
            state: {
                lead: lead,
                landingPageLeadId: lead.id,
                initialBusinessMode: hasCompany ? "B2B" : "B2C",
            },
        });
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    // Pagination
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
                    <div className="mb-6 text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Landing Page Leads</div>
                    </div>

                    {/* Table */}
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
                                        currentLeads.map((lead, index) => (
                                            <tr
                                                key={lead.id}
                                                className="transition-colors hover:bg-gray-50"
                                            >
                                                <td className="sticky left-0 z-10 border border-gray-200 bg-white px-4 py-2">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="sticky left-[4.5rem] z-10 border border-gray-200 bg-white px-4 py-2">{lead.date}</td>
                                                <td className="sticky left-[10rem] z-10 border border-gray-200 bg-white px-4 py-2">
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                                            lead.status === "Converted"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.SENDER_COMPANY || "-"}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.SENDER_NAME}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.SENDER_MOBILE}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.SENDER_PHONE || "-"}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.SENDER_EMAIL}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.LEAD_SOURCE}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.SENDER_ADDRESS || "-"}</td>
                                                <td className="border border-gray-100 px-4 py-2">{lead.QUERY_MESSAGE || "-"}</td>
                                                <td className="sticky right-0 z-10 flex items-center justify-center gap-4 border border-gray-200 bg-white px-4 py-2">
                                                    {lead.status === "Pending" && (
                                                        <SiConvertio
                                                            title="Mark as Converted"
                                                            className="cursor-pointer text-xl text-green-600 hover:text-green-700"
                                                            onClick={() => handleStatusChange(lead.id)}
                                                        />
                                                    )}
                                                    <FaShare
                                                        title="Convert to Lead"
                                                        className={`cursor-pointer text-xl ${
                                                            lead.status === "Converted" ? "text-blue-600 hover:text-blue-700" : "text-gray-400"
                                                        }`}
                                                        onClick={() => lead.status === "Converted" && handleConvertLead(lead)}
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
                                                No landing page leads found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {leads.length > rowsPerPage && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, leads.length)} of {leads.length}
                                </span>
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        <ChevronLeft />
                                    </IconButton>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
                                        {currentPage}
                                    </div>
                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
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
                    severity={snackbarSeverity || "info"}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage || (snackbarSeverity === "error" ? "Please mark as Converted first" : "")}
                </Alert>
            </Snackbar>
        </>
    );
};

export default LandingPageLeads;
