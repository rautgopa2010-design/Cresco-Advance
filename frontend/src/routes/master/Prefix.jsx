import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Snackbar, Alert, CircularProgress, Box, Typography, IconButton, useMediaQuery } from "@mui/material";
import { Modal } from "@mui/material";
import { Trash, X, Plus } from "lucide-react";
import { Button } from "@material-tailwind/react";

import { getPrefix, createOrUpdatePrefix, deletePrefix } from "../../redux/actions/prefix";
import { clearSnackbar } from "../../redux/actions/commonActions";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 480,
    maxWidth: "92%",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "12px",
    p: 4,
};

const Prefix = () => {
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");

    const { prefix, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.prefix);

    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        orderPrefix: "",
        quotationPrefix: "",
        invoicePrefix: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [localMsg, setLocalMsg] = useState("");
    const [localSeverity, setLocalSeverity] = useState("error");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(getPrefix());
    }, [dispatch]);

    useEffect(() => {
        if (prefix) {
            setFormData({
                orderPrefix: prefix.orderPrefix || "O-",
                quotationPrefix: prefix.quotationPrefix || "Q-",
                invoicePrefix: prefix.invoicePrefix || "I-",
            });
        }
    }, [prefix]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleOpen = () => {
        setIsEdit(!!prefix);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setLocalMsg("");
    };

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.orderPrefix.trim() || !formData.quotationPrefix.trim() || !formData.invoicePrefix.trim()) {
            setLocalMsg("All prefix fields are required");
            setLocalSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(createOrUpdatePrefix(formData));
        setOpenModal(false);
    };

    const handleDelete = () => {
        dispatch(deletePrefix());
        setDeleteConfirmOpen(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearSnackbar());
            setLocalMsg("");
        }, 400);
    };

    return (
        <div className="card">
            <div className="mb-4 flex flex-col items-start justify-between space-y-5 lg:flex-row lg:items-center">
                <Typography
                    variant="h6"
                    className="font-semibold text-[#433C50]"
                >
                    Document Number Prefix Settings
                </Typography>

                <div className="flex gap-3">
                    {prefix && (
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-4 py-2 capitalize"
                            onClick={() => setDeleteConfirmOpen(true)}
                        >
                            <Trash size={18} />
                            Reset to Default
                        </Button>
                    )}

                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded-full bg-[#053054] px-4 py-2 capitalize"
                        onClick={handleOpen}
                    >
                        <Plus size={18} />
                        {prefix ? "Edit Prefix" : "Set Prefix"}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <CircularProgress />
                </div>
            ) : (
                <div className="mt-2 grid gap-6 md:mt-3 lg:mt-6 lg:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                        >
                            Order Prefix
                        </Typography>
                        <Typography
                            variant="h5"
                            className="mt-1 font-bold"
                        >
                            {prefix?.orderPrefix || "O"}
                        </Typography>
                    </div>

                    <div className="rounded-lg border p-4">
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                        >
                            Quotation Prefix
                        </Typography>
                        <Typography
                            variant="h5"
                            className="mt-1 font-bold"
                        >
                            {prefix?.quotationPrefix || "Q"}
                        </Typography>
                    </div>

                    <div className="rounded-lg border p-4">
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                        >
                            Invoice Prefix
                        </Typography>
                        <Typography
                            variant="h5"
                            className="mt-1 font-bold"
                        >
                            {prefix?.invoicePrefix || "I"}
                        </Typography>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            <Modal
                open={openModal}
                onClose={handleClose}
            >
                <Box sx={modalStyle}>
                    <div className="mb-5 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            {isEdit ? "Update Document Prefixes" : "Set Document Prefixes"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            label="Order Prefix (e.g. ORD, SO)"
                            name="orderPrefix"
                            value={formData.orderPrefix}
                            onChange={handleChange}
                            placeholder="O-"
                            // inputProps={{ maxLength: 6, style: { textTransform: "uppercase" } }}
                        />

                        <TextField
                            fullWidth
                            label="Quotation Prefix (e.g. QT, QUO)"
                            name="quotationPrefix"
                            value={formData.quotationPrefix}
                            onChange={handleChange}
                            placeholder="Q-"
                            // inputProps={{ maxLength: 6, style: { textTransform: "uppercase" } }}
                        />

                        <TextField
                            fullWidth
                            label="Invoice Prefix (e.g. INV, BILL)"
                            name="invoicePrefix"
                            value={formData.invoicePrefix}
                            onChange={handleChange}
                            placeholder="I-"
                            // inputProps={{ maxLength: 6, style: { textTransform: "uppercase" } }}
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="gradient"
                            onClick={handleClose}
                            className="flex items-center gap-2 bg-gray-500 px-4 py-2 capitalize"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 bg-[#053054] px-4 py-2 capitalize"
                            onClick={handleSave}
                        >
                            {isEdit ? "Update Prefixes" : "Save Prefixes"}
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
                    <Typography
                        variant="h6"
                        className="mb-4"
                    >
                        Reset Prefix Settings?
                    </Typography>
                    <Typography
                        color="textSecondary"
                        className="mb-6"
                    >
                        This will remove custom prefixes. System will use default values (O, Q, I).
                    </Typography>
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="flex items-center gap-2 bg-gray-500 px-4 py-2 capitalize"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="error"
                            variant="gradient"
                            className="flex items-center gap-2 bg-[#053054] px-4 py-2 capitalize"
                            onClick={handleDelete}
                        >
                            Reset to Default
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : localSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage || localMsg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Prefix;
