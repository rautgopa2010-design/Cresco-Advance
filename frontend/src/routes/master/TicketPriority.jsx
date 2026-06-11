import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, UserPlus, X } from "lucide-react";
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

    const ticketPriorityList = useSelector((state) => state.ticketPriority.ticketPriority);

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
                <div className="card">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Ticket Priority :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create Ticket Priority
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Ticket Priority</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {ticketPriorityList.map((ticketPriority, index) => (
                                        <tr
                                            className="table-row"
                                            key={index}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{ticketPriority.ticketPriority}</td>
                                            <td className="table-cell border border-gray-300">{ticketPriority.date}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(ticketPriority)}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => handleDeleteClick(ticketPriority.id)}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {ticketPriorityList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Ticket Priority Added Yet.
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
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
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

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outlined"
                            className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        {isEditMode ? (
                            <Button
                                className="rounded bg-green-900 px-4 py-2 capitalize text-white"
                                onClick={handleUpdate}
                            >
                                Update
                            </Button>
                        ) : (
                            <Button
                                className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
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