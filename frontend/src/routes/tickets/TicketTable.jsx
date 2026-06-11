import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTickets, updateTicketStatus, deleteTicket, escalateTicket } from "../../redux/actions/ticket";
import { PencilLine, Trash, X, ChevronLeft, ChevronRight, File } from "lucide-react";
import { GiRapidshareArrow } from "react-icons/gi";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Modal,
    Snackbar,
    Typography,
    useMediaQuery,
    TextField,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { Button } from "@material-tailwind/react";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { getTicketService } from "../../redux/actions/ticketService";
import { getTicketPriority } from "../../redux/actions/ticketPriority";
import { useNavigate } from "react-router-dom";

const TicketTable = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { snackbarMessage, ticket: tickets = [], loading } = useSelector((state) => state.ticket);
    const user = useSelector((state) => state.auth.user);
    const isSuperAdmin = user?.role_name === "Super Admin";
    const { ticketService = [] } = useSelector((state) => state.ticketService);
    const { ticketPriority = [] } = useSelector((state) => state.ticketPriority);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const [escalateConfirmOpen, setEscalateConfirmOpen] = useState(false);
    const [selectedEscalateId, setSelectedEscalateId] = useState(null);

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        service: null,
        priority: null,
        status: "",
        dueDate: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const isMobile = useMediaQuery("(max-width:600px)");

    useEffect(() => {
        dispatch(getTickets());
        dispatch(getTicketService());
        dispatch(getTicketPriority());
        dispatch(clearSnackbar());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) setSnackbarOpen(true);
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const parseDateSafe = (dateStr) => {
        if (!dateStr) return null;

        const [d, m, y] = dateStr.split("-");
        const dt = new Date(`${y}-${m}-${d}`);

        return isNaN(dt.getTime()) ? null : dt;
    };

    const filteredTickets = tickets.filter((t) => {
        // Convert table dates (DD-MM-YYYY → Date object)
        const created = parseDateSafe(t.createdDate);
        const due = parseDateSafe(t.dueDate);

        // Convert filters (YYYY-MM-DD → Date object)
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;
        const dueDateFilter = filters.dueDate ? new Date(filters.dueDate) : null;

        // ---- DATE FILTERS ----
        const matchFromDate = fromDate ? created >= fromDate : true;
        const matchToDate = toDate ? created <= toDate : true;
        const matchDueDate = dueDateFilter ? (due ? due.toDateString() === dueDateFilter.toDateString() : false) : true;

        // ---- SERVICE FILTER ----
        const matchService = filters.service ? t.service?.toLowerCase() === filters.service.ticketService?.toLowerCase() : true;

        // ---- PRIORITY FILTER ----
        const matchPriority = filters.priority ? t.priority?.toLowerCase() === filters.priority.ticketPriority?.toLowerCase() : true;

        // ---- STATUS FILTER ----
        const matchStatus = filters.status ? t.status?.toLowerCase() === filters.status.toLowerCase() : true;

        return matchFromDate && matchToDate && matchDueDate && matchService && matchPriority && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage || 1));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentTickets = filteredTickets.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredTickets.length || 1);
            setCurrentPage(1);
        } else {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
        }
    };

    const openStatusModal = (ticket) => {
        setSelectedTicket(ticket);
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setSelectedTicket(null);
    };

    const handleStatusChange = (status) => {
        if (!selectedTicket) return;
        dispatch(updateTicketStatus(selectedTicket.id, status));
        closeStatusModal();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (selectedDeleteId) dispatch(deleteTicket(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleEditClick = (id) => {
        navigate(`/tickets/edit-ticket/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/tickets/view-ticket/${id}`);
    };

    const handleEscalateClick = (id) => {
        setSelectedEscalateId(id);
        setEscalateConfirmOpen(true);
    };

    const confirmEscalate = () => {
        if (selectedEscalateId) {
            dispatch(escalateTicket(selectedEscalateId));
        }
        setEscalateConfirmOpen(false);
        setSelectedEscalateId(null);
    };

    // --------------- Render ---------------
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <div>
                {/* ===== Filters Box ===== */}
                <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-sm">
                    <Typography
                        variant="subtitle1"
                        className="mb-3 font-semibold text-[#053054]"
                    >
                        Filters
                    </Typography>

                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <TextField
                            label="From Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.fromDate}
                            onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                        />

                        <TextField
                            label="To Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.toDate}
                            onChange={(e) => handleFilterChange("toDate", e.target.value)}
                        />

                        <Autocomplete
                            options={ticketService}
                            getOptionLabel={(option) => option.ticketService || ""}
                            value={filters.service}
                            onChange={(_, newValue) => handleFilterChange("service", newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Service"
                                    size="small"
                                />
                            )}
                        />

                        <Autocomplete
                            options={ticketPriority}
                            getOptionLabel={(option) => option.ticketPriority || ""}
                            value={filters.priority}
                            onChange={(_, newValue) => handleFilterChange("priority", newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Priority"
                                    size="small"
                                />
                            )}
                        />

                        <FormControl size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Canceled">Canceled</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Due Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.dueDate}
                            onChange={(e) => handleFilterChange("dueDate", e.target.value)}
                        />
                    </div>
                </div>

                {/* ===== Table and Pagination ===== */}
                <div className="mt-4">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                                value={rowsPerPage === (filteredTickets.length || 1) ? "All" : rowsPerPage}
                                onChange={handleRowsPerPageChange}
                                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#053054]"
                            >
                                <option value={5}>5</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="All">All</option>
                            </select>
                            <span className="text-sm text-gray-700">entries</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                    </div>

                    <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header text-nowrap bg-[#053054] text-white">
                                <tr className="table-row">
                                    <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                    <th className="table-head border border-gray-300 capitalize">Created Date</th>
                                    <th className="table-head border border-gray-300 capitalize">Due Date</th>
                                    <th className="table-head border border-gray-300 capitalize">Delay</th>
                                    <th className="table-head border border-gray-300 capitalize">Ticket Title</th>
                                    <th className="table-head border border-gray-300 capitalize">Assigned To</th>
                                    <th className="table-head border border-gray-300 capitalize">Service</th>
                                    <th className="table-head border border-gray-300 capitalize">Priority</th>
                                    <th className="table-head border border-gray-300 capitalize">Status</th>
                                    <th className="table-head border border-gray-300 capitalize">Order Id</th>
                                    <th className="table-head border border-gray-300 capitalize">Description</th>
                                    <th className="table-head border border-gray-300 capitalize">Remark (From Provider Only)</th>
                                    <th className="table-head border border-gray-300 capitalize">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body text-[#433C50]">
                                {currentTickets.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="13"
                                            className="py-4 text-center text-gray-400"
                                        >
                                            No Tickets Added Yet.
                                        </td>
                                    </tr>
                                ) : (
                                    currentTickets.map((t, index) => (
                                        <tr
                                            key={t.id || index}
                                            className="table-row"
                                        >
                                            <td className="table-cell border border-gray-300">{startIndex + index + 1}</td>
                                            <td className="table-cell border border-gray-300">{t.createdDate || "-"}</td>
                                            <td className="table-cell border border-gray-300">{t.dueDate || "-"}</td>
                                            <td className="table-cell border border-gray-300">
                                                {typeof t.delay !== "undefined" ? `${t.delay} Day` : "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300">{t.title || "-"}</td>
                                            <td className="table-cell border border-gray-300">
                                                {Array.isArray(t.assignedTo) && t.assignedTo.length > 0
                                                    ? t.assignedTo.map((a, i) => (
                                                          <div key={i}>
                                                              {i + 1}) {a}
                                                          </div>
                                                      ))
                                                    : "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300">{t.service || "-"}</td>
                                            <td className="table-cell border border-gray-300">{t.priority || "-"}</td>
                                            <td className="table-cell border border-gray-300">{t.status || "-"}</td>
                                            <td className="table-cell border border-gray-300">{t.orderId || "Null"}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="w-[300px] whitespace-normal break-words text-justify"> {t.description || "-"}</div>
                                            </td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="w-[300px] whitespace-normal break-words text-justify"> {t.remark || "-"}</div>
                                            </td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="flex w-10 justify-center">
                                                        {isSuperAdmin && t.status !== "Escalated" && t.status !== "Completed" ? (
                                                            <button
                                                                title="Change Status"
                                                                className="text-[#433C50] duration-300 hover:scale-110"
                                                                onClick={() => openStatusModal(t)}
                                                            >
                                                                <BsThreeDotsVertical size={20} />
                                                            </button>
                                                        ) : (
                                                            <span className="invisible">
                                                                <BsThreeDotsVertical size={20} />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className={`duration-200 ${t.status === "Completed" ? "cursor-not-allowed text-gray-300" : "text-blue-500 hover:text-blue-700"}`}
                                                        onClick={() => t.status !== "Completed" && handleEditClick(t.id)}
                                                        disabled={t.status === "Completed"}
                                                        title={t.status === "Completed" ? "Cannot edit completed ticket" : "Edit"}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className={`duration-200 ${t.status === "Completed" ? "cursor-not-allowed text-gray-300" : "text-red-500 hover:text-red-700"}`}
                                                        onClick={() => t.status !== "Completed" && handleDeleteClick(t.id)}
                                                        disabled={t.status === "Completed"}
                                                        title={t.status === "Completed" ? "Cannot delete completed ticket" : "Delete"}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                    <button
                                                        className="text-purple-500"
                                                        onClick={() => handleViewClick(t.id)}
                                                    >
                                                        <File size={20} />
                                                    </button>
                                                    {isSuperAdmin && t.status !== "Completed" && (
                                                        <button
                                                            className="text-[#053054]"
                                                            title="Escalate to Cresco"
                                                            onClick={() => handleEscalateClick(t.id)}
                                                        >
                                                            <GiRapidshareArrow size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredTickets.length > rowsPerPage && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredTickets.length)} of {filteredTickets.length}
                            </span>
                            <div className="flex items-center gap-3">
                                <IconButton
                                    variant="text"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="flex items-center rounded-full"
                                >
                                    <ChevronLeft />
                                </IconButton>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
                                    {currentPage}
                                </div>

                                <IconButton
                                    variant="text"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="flex items-center rounded-full"
                                >
                                    <ChevronRight />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Selection Modal */}
            {showStatusModal && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeStatusModal}
                >
                    <div
                        className="absolute left-[45%] top-[250px] z-50 w-48 rounded-md bg-white shadow-lg md:left-[73%] lg:left-[86%]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="px-4 py-2 font-semibold text-gray-700">Select Status</h3>
                        <button
                            onClick={() => handleStatusChange("Pending")}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => handleStatusChange("Completed")}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => handleStatusChange("Canceled")}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                            Canceled
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isMobile ? 320 : 480,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        borderRadius: "12px",
                        p: 3,
                    }}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Confirm Delete
                        </Typography>
                        <IconButton
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, you want to delete this ticket?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={confirmDelete}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Escalate Confirmation Modal */}
            <Modal
                open={escalateConfirmOpen}
                onClose={() => setEscalateConfirmOpen(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isMobile ? 320 : 480,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        borderRadius: "12px",
                        p: 3,
                    }}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Escalate Ticket
                        </Typography>
                        <IconButton
                            onClick={() => setEscalateConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 text-[#433C50]">
                        Are you sure you want to escalate this ticket to <b>Cresco</b>?
                    </Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                            onClick={confirmEscalate}
                        >
                            Yes, Escalate
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setEscalateConfirmOpen(false)}
                        >
                            No
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
                    severity={snackbarMessage ? (snackbarMessage.toLowerCase().includes("success") ? "success" : "error") : ""}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TicketTable;
