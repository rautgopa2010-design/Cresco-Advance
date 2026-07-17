import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { ListChecks, PencilLine, Plus, ShieldCheck, Tags, Trash, X } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import { getTicketService, createTicketService, updateTicketService, deleteTicketService } from "../../redux/actions/ticketService";
import { clearSnackbar } from "../../redux/actions/commonActions";

const TicketService = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [ticketService, setTicketService] = useState("");
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.ticketService.loading);

    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.ticketService);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const ticketServiceList = useSelector((state) => state.ticketService.ticketService) || [];

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getTicketService());
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
        setTicketService("");
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (ticketService) => {
        setTicketService(ticketService.ticketService);
        setEditId(ticketService.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleUpdate = async () => {
        if (!ticketService.trim()) {
            setError(true);
            setLocalSnackbarMessage("Ticket Service is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            updateTicketService(editId, {
                ticketService: ticketService.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleAdd = async () => {
        if (!ticketService.trim()) {
            setError(true);
            setLocalSnackbarMessage("Ticket Service is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            createTicketService({
                ticketService: ticketService.trim(),
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
        dispatch(deleteTicketService(selectedDeleteId));
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
                    <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 md:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                                    <Tags size={26} />
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                                        <ShieldCheck size={13} />
                                        Help Desk Master
                                    </div>
                                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">Ticket Service</h2>
                                    <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                        Manage the service categories used while creating and organizing support tickets.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Services</p>
                                    <p className="text-2xl font-black text-blue-700">{ticketServiceList.length}</p>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#053054] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#07436f] hover:shadow-xl md:text-base"
                                    onClick={handleOpen}
                                >
                                    <Plus size={20} />
                                    Create Ticket Service
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-slate-900">Service Catalogue</p>
                                <p className="text-sm text-slate-500">Create, update, or remove ticket service labels.</p>
                            </div>
                        </div>

                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm [scrollbar-width:_thin]">
                            <table className="min-w-full">
                                <thead className="bg-[#053054] text-white">
                                    <tr>
                                        <th className="border-r border-white/10 px-5 py-4 text-left text-sm font-bold">Sr. No.</th>
                                        <th className="border-r border-white/10 px-5 py-4 text-left text-sm font-bold">Ticket Service</th>
                                        <th className="border-r border-white/10 px-5 py-4 text-left text-sm font-bold">Date</th>
                                        <th className="px-5 py-4 text-left text-sm font-bold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {ticketServiceList.map((ticketService, index) => (
                                        <tr
                                            className="transition-colors hover:bg-blue-50/50"
                                            key={index}
                                        >
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-500">{index + 1}</td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                                                    <ListChecks size={15} />
                                                    {ticketService.ticketService}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-500">{ticketService.date}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-x-2">
                                                    <button
                                                        className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-600 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
                                                        onClick={() => handleEdit(ticketService)}
                                                    >
                                                        <PencilLine size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:text-white"
                                                        onClick={() => handleDeleteClick(ticketService.id)}
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {ticketServiceList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                        <Tags size={28} />
                                                    </div>
                                                    <p className="text-base font-bold text-slate-900">No ticket service added yet</p>
                                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                                        Add services like Technical Support, Billing, Implementation, or Customer Success.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handleOpen}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#053054] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-300/70"
                                                    >
                                                        <Plus size={16} />
                                                        Add service
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
                            {isEditMode ? "Update Ticket Service" : "Add Ticket Service"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <TextField
                        fullWidth
                        label="Ticket Service"
                        placeholder="Enter Ticket Service"
                        variant="outlined"
                        error={error}
                        value={ticketService}
                        onChange={(e) => {
                            setTicketService(e.target.value);
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this ticket service?</Typography>

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

export default TicketService;
