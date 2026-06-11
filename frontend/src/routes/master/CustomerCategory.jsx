import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, UserPlus, X } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import { getCustomerCategory, createCustomerCategory, updateCustomerCategory, deleteCustomerCategory } from "../../redux/actions/customerCategory";
import { clearSnackbar } from "../../redux/actions/commonActions";

const CustomerCategory = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [customerCategory, setCustomerCategory] = useState("");
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.customerCategory.loading);

    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.customerCategory);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const customerCategoryList = useSelector((state) => state.customerCategory.customerCategory);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getCustomerCategory());
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
        setCustomerCategory("");
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (customerCategory) => {
        setCustomerCategory(customerCategory.customerCategory);
        setEditId(customerCategory.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleUpdate = () => {
        if (!customerCategory.trim()) {
            setError(true);
            setLocalSnackbarMessage("Customer Category is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            updateCustomerCategory(editId, {
              customerCategory: customerCategory.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleAdd = () => {
        if (!customerCategory.trim()) {
            setError(true);
            setLocalSnackbarMessage("Customer Category is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            createCustomerCategory({
              customerCategory: customerCategory.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteCustomerCategory(selectedDeleteId));
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
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Customer Category :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Customer Category</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {customerCategoryList.map((customerCategory, index) => (
                                        <tr
                                            className="table-row"
                                            key={customerCategory.id}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{customerCategory.customerCategory}</td>
                                            <td className="table-cell border border-gray-300">{customerCategory.date}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(customerCategory)}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => handleDeleteClick(customerCategory.id)}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {customerCategoryList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Customer Category Added Yet.
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
                            {isEditMode ? "Update Customer Category" : "Add Customer Category"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <TextField
                        fullWidth
                        label="Customer Category"
                        placeholder="Enter Customer Category"
                        variant="outlined"
                        error={error}
                        value={customerCategory}
                        onChange={(e) => {
                            setCustomerCategory(e.target.value);
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this customer category?</Typography>

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

export default CustomerCategory;