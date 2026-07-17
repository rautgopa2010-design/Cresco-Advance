import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { AlertCircle, ListChecks, PencilLine, Plus, ShieldCheck, Trash, X, Zap } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import { getTicketPriority, createTicketPriority, updateTicketPriority, deleteTicketPriority } from "../../redux/actions/ticketPriority";
import { clearSnackbar } from "../../redux/actions/commonActions";

const TicketPriority = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [ticketPriority, setTicketPriority] = useState("");
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.ticketPriority.loading);

    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.ticketPriority);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const ticketPriorityList = useSelector((state) => state.ticketPriority.ticketPriority) || [];

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getTicketPriority());
    }, [dispatch]);

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 330 : 500,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
    };

    const getCurrentISTDateTime = () => {
        const now = new Date();
        const options = {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        };
        const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
        return formatted.replace(/\//g, "-").replace(",", "");
    };

    const handleOpen = () => {
        setOpen(true);
        setError(false);
    };

    const handleClose = () => {
        setOpen(false);
        setTicketPriority("");
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (ticketPriority) => {
        setTicketPriority(ticketPriority.ticketPriority);
        setEditId(ticketPriority.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleUpdate = async () => {
        if (!ticketPriority.trim()) {
            setError(true);
            setLocalSnackbarMessage("Ticket Priority is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            updateTicketPriority(editId, {
                ticketPriority: ticketPriority.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleAdd = async () => {
        if (!ticketPriority.trim()) {
            setError(true);
            setLocalSnackbarMessage("Ticket Priority is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            createTicketPriority({
                ticketPriority: ticketPriority.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        dispatch(deleteTicketPriority(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    useEffect(() => {
        if (snackbarMessage) {
            setLocalSnackbarMessage("");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-gradient-to-br from-rose-50 via-white to-slate-50 p-5 md:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
                                    <Zap size={26} />
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
                                        <ShieldCheck size={13} />
                                        Help Desk Master
                                    </div>
                                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">Ticket Priority</h2>
                                    <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                        Manage priority labels used to highlight urgency, SLA pressure and critical support requests.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priorities</p>
                                    <p className="text-2xl font-black text-rose-700">{ticketPriorityList.length}</p>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#053054] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#07436f] hover:shadow-xl md:text-base"
                                    onClick={handleOpen}
                                >
                                    <Plus size={20} />
                                    Create Ticket Priority
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-slate-900">Priority Catalogue</p>
                                <p className="text-sm text-slate-500">Create, update, or remove ticket priority labels.</p>
                            </div>
                        </div>

                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm [scrollbar-width:_thin]">
                            <table className="min-w-full">
                                <thead className="bg-[#053054] text-white">
                                    <tr>
                                        <th className="border-r border-white/10 px-5 py-4 text-left text-sm font-bold">Sr. No.</th>
                                        <th className="border-r border-white/10 px-5 py-4 text-left text-sm font-bold">Ticket Priority</th>
                                        <th className="border-r border-white/10 px-5 py-4 text-left text-sm font-bold">Date</th>
                                        <th className="px-5 py-4 text-left text-sm font-bold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {ticketPriorityList.map((ticketPriority, index) => (
                                        <tr
                                            className="transition-colors hover:bg-rose-50/50"
                                            key={index}
                                        >
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-500">{index + 1}</td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-700">
                                                    <AlertCircle size={15} />
                                                    {ticketPriority.ticketPriority}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-500">{ticketPriority.date}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-x-2">
                                                    <button
                                                        className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-600 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
                                                        onClick={() => handleEdit(ticketPriority)}
                                                    >
                                                        <PencilLine size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:text-white"
                                                        onClick={() => handleDeleteClick(ticketPriority.id)}
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {ticketPriorityList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                                        <ListChecks size={28} />
                                                    </div>
                                                    <p className="text-base font-bold text-slate-900">No ticket priority added yet</p>
                                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                                        Add priorities like Low, Medium, High, Urgent, or Critical.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handleOpen}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#053054] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-300/70"
                                                    >
                                                        <Plus size={16} />
                                                        Add priority
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={modalStyle}>
                    <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                        <Typography
                            variant="h6"
                            className="font-bold text-slate-900"
                        >
                            {isEditMode ? "Update Ticket Priority" : "Add Ticket Priority"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <TextField
                        fullWidth
                        label="Ticket Priority"
                        placeholder="Enter Ticket Priority"
                        variant="outlined"
                        error={error}
                        value={ticketPriority}
                        onChange={(e) => {
                            setTicketPriority(e.target.value);
                            setError(false);
                        }}
                    />

                    <div className="mt-5 flex justify-end gap-2">
                        <Button
                            variant="outlined"
                            className="rounded-lg border border-slate-300 px-4 py-2 capitalize text-slate-700"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        {isEditMode ? (
                            <Button
                                className="rounded-lg bg-green-700 px-4 py-2 capitalize text-white"
                                onClick={handleUpdate}
                            >
                                Update
                            </Button>
                        ) : (
                            <Button
                                className="rounded-lg bg-[#053054] px-4 py-2 capitalize text-white"
                                onClick={handleAdd}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                </Box>
            </Modal>

            {/* Delete Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this ticket priority?</Typography>

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

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={1000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TicketPriority;
