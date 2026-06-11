import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTickets, updateEscalatedTicketStatus } from "../../../redux/actions/ticket";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { Alert, Box, Modal, Snackbar, TextField, Typography, useMediaQuery } from "@mui/material";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { Button } from "@material-tailwind/react";

const EscalatedTickets = () => {
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");
    const { ticket: tickets, loading, snackbarMessage } = useSelector((state) => state.ticket);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [remark, setRemark] = useState("");
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);

    // Card → Table toggle
    const [selectedCompany, setSelectedCompany] = React.useState(null);

    useEffect(() => {
        dispatch(getTickets());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) setSnackbarOpen(true);
    }, [snackbarMessage]);

    // Filter escalated tickets only
    const escalatedTickets = tickets.filter((t) => t.escalatedToProvider);

    const handleStatusChange = (id, status) => {
        dispatch(updateEscalatedTicketStatus(id, status));
    };

    const openRemarkModal = (ticketId, status) => {
        setSelectedTicketId(ticketId);
        setSelectedStatus(status);
        setRemark(""); // clear previous remark
        setRemarkModalOpen(true);
    };

    const closeRemarkModal = () => {
        setRemarkModalOpen(false);
        setSelectedTicketId(null);
        setSelectedStatus("");
        setRemark("");
    };

    const submitStatusWithRemark = () => {
        if (!selectedTicketId || !selectedStatus) return;

        dispatch(updateEscalatedTicketStatus(selectedTicketId, selectedStatus, remark));
        closeRemarkModal();
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearSnackbar());
        }, 100);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Canceled":
                return "bg-red-100 text-red-800";
            case "Escalated":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Group by company
    const groupedCompanies = escalatedTickets.reduce((acc, t) => {
        if (!acc[t.organization.company]) acc[t.organization.company] = [];
        acc[t.organization.company].push(t);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-[#053054]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {!selectedCompany && (
                <>
                    <div className="mb-8 text-center">
                        <h1 className="flex items-center justify-center gap-1 text-base font-bold text-[#053054] md:gap-3 md:text-2xl lg:text-3xl">
                            <Clock className="h-4 w-4 md:h-7 md:w-7 lg:h-9 lg:w-9" />
                            Escalated Tickets (Cresco Panel)
                        </h1>
                        <p className="mt-2 text-xs text-gray-600 md:text-base lg:text-lg">Manage tickets escalated from client organizations</p>
                    </div>
                    {Object.keys(groupedCompanies).length === 0 ? (
                        <div className="text-center md:py-5 lg:py-16">
                            <div className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-dashed border-gray-400 bg-gray-200 md:h-32 md:w-32 lg:h-32 lg:w-32"></div>
                            <p className="text-base font-medium text-gray-500 md:text-xl lg:text-2xl">No escalated tickets yet</p>
                            <p className="mt-2 text-sm text-gray-400 md:text-base">Tickets from clients will appear here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
                            {Object.entries(groupedCompanies).map(([company, list]) => {
                                const latest = list[list.length - 1];

                                return (
                                    <div
                                        key={company}
                                        onClick={() => setSelectedCompany(company)}
                                        className="group relative cursor-pointer rounded-2xl border border-gray-200 bg-white bg-opacity-60 p-6 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl"
                                    >
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#053054]/10 via-transparent to-blue-200/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                                        <div className="relative z-10">
                                            <h2 className="text-base font-semibold text-[#053054] transition-colors group-hover:text-blue-700 md:text-xl">
                                                {company}
                                            </h2>

                                            <div className="mt-3 flex flex-col gap-3 text-center md:flex-row md:items-center">
                                                <span className="rounded-full bg-blue-100 px-4 py-1 font-semibold text-blue-700 shadow">
                                                    {list.length} Tickets
                                                </span>

                                                <span className="rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-700">
                                                    Latest: {latest.createdDate}
                                                </span>
                                            </div>

                                            <p className="mt-4 text-sm text-gray-500 group-hover:text-gray-700">
                                                Tap to view escalated tickets from
                                                <span className="font-medium text-[#053054] group-hover:text-blue-600"> {company}</span>.
                                            </p>

                                            {/* Animated underline */}
                                            <div className="mt-4 h-[2px] w-0 bg-[#053054] transition-all duration-500 group-hover:w-full"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {selectedCompany && (
                <div>
                    <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-lg">
                        <div className="flex gap-2 bg-gradient-to-r from-[#053054] to-[#0a4466] p-6 text-white">
                            <div>
                                <Button
                                    onClick={() => setSelectedCompany(null)}
                                    className="rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:bg-gray-100"
                                >
                                    <ArrowLeft
                                        size={22}
                                        className="text-[#053054]"
                                    />
                                </Button>
                            </div>
                            <h1 className="flex items-center gap-3 text-sm font-bold md:text-lg lg:text-3xl">
                                Escalated Tickets - {selectedCompany}
                            </h1>
                        </div>

                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none p-6 [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 px-6 py-4 font-semibold capitalize">Ticket ID</th>
                                        <th className="table-head border border-gray-300 px-6 py-4 font-semibold capitalize">Title</th>
                                        <th className="table-head border border-gray-300 px-6 py-4 font-semibold capitalize">Created</th>
                                        <th className="table-head border border-gray-300 px-6 py-4 font-semibold capitalize">Current Status</th>
                                        <th className="table-head border border-gray-300 px-6 py-4 capitalize">Description</th>
                                        <th className="table-head border border-gray-300 px-6 py-4 font-semibold capitalize">Updated Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedCompanies[selectedCompany].map((t, index) => (
                                        <tr
                                            key={t.id}
                                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} table-row`}
                                        >
                                            <td className="table-cell border border-gray-300 px-6 py-4">ID - {t.id}</td>
                                            <td className="table-cell border border-gray-300 px-6 py-4 font-semibold">{t.title}</td>
                                            <td className="table-cell border border-gray-300 px-6 py-4 text-gray-700">{t.createdDate}</td>
                                            <td className="table-cell border border-gray-300 px-6 py-4">
                                                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(t.status)}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="border-gray-300px-6 table-cell border py-4 text-gray-700">
                                                <div className="w-[300px] whitespace-normal break-words text-justify"> {t.description || "-"}</div>
                                            </td>
                                            {/* <td className="table-cell border border-gray-300 px-6 py-4 text-center">
                                                {t.status !== "Completed" && t.status !== "Canceled" ? (
                                                    <select
                                                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                                        defaultValue=""
                                                        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#053054]"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select Action
                                                        </option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Canceled">Canceled</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 font-medium text-green-600">
                                                        <CheckCircle size={20} />
                                                        <span>Resolved</span>
                                                    </div>
                                                )}
                                            </td> */}
                                            <td className="table-cell border border-gray-300 px-6 py-4 text-center">
                                                {t.status !== "Completed" && t.status !== "Canceled" ? (
                                                    <select
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                openRemarkModal(t.id, e.target.value);
                                                                e.target.value = ""; // reset select so it stays "Select Action"
                                                            }
                                                        }}
                                                        defaultValue=""
                                                        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#053054]"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select Action
                                                        </option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Canceled">Canceled</option>
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 font-medium text-green-600">
                                                        <CheckCircle size={20} />
                                                        <span>Resolved</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Remark Modal */}
            <Modal
                open={remarkModalOpen}
                onClose={closeRemarkModal}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isMobile ? 320 : 500,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        borderRadius: "12px",
                        p: 4,
                    }}
                >
                    <Typography
                        variant="h6"
                        className="font-semibold"
                        sx={{mb: 2}}
                    >
                        Add Remark for Status Change
                    </Typography>

                    <TextField
                        label="Remark (optional)"
                        multiline
                        rows={4}
                        fullWidth
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        variant="outlined"
                        placeholder="Explain what was done or any additional information..."
                        className="mb-6"
                    />

                    <div className="flex justify-end gap-4 mt-4">
                        <Button
                            variant="gradient"
                            className="bg-gray-500 px-6 py-2 capitalize text-white"
                            onClick={closeRemarkModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            className="bg-[#053054] px-6 py-2 capitalize text-white"
                            onClick={submitStatusWithRemark}
                        >
                            Save & Update Status
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? (snackbarMessage.toLowerCase().includes("success") ? "success" : "error") : "error"}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EscalatedTickets;
