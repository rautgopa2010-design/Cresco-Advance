import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { ArrowLeft, Save, X } from "lucide-react";
import { TextField, Snackbar, Alert, CircularProgress, MenuItem } from "@mui/material";
import { updateBank, clearBankSuccess } from "../../../redux/actions/bankDetails";

const EditBankDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [validationSnackbar, setValidationSnackbar] = useState({ open: false, message: "" });
    
    const { loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.bankDetails);
    const bankData = location.state?.bank;
    
    const [formData, setFormData] = useState({
        bankName: "",
        branchName: "",
        customerName: "",
        accountNumber: "",
        cifNumber: "",
        ifsc: "",
        micr: "",
        accountType: "Saving",
        customerPan: "",
        address: ""
    });
    
    const [errors, setErrors] = useState({});
    
    const accountTypes = ["Saving", "Current", "Salary", "NRI", "Other"];

    useEffect(() => {
        if (!bankData) {
            navigate("/settings/bank-setup");
            return;
        }
        setFormData({
            bankName: bankData.bankName || "",
            branchName: bankData.branchName || "",
            customerName: bankData.customerName || "",
            accountNumber: bankData.accountNumber || "",
            cifNumber: bankData.cifNumber || "",
            ifsc: bankData.ifsc || "",
            micr: bankData.micr || "",
            accountType: bankData.accountType || "Saving",
            customerPan: bankData.customerPan || "",
            address: bankData.address || ""
        });
    }, [bankData, navigate]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
            if (snackbarSeverity === "success") {
                setTimeout(() => {
                    navigate("/settings/bank-setup");
                }, 1500);
            }
        }
    }, [snackbarMessage, snackbarSeverity, navigate, dispatch]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearBankSuccess());
        }, 100);
    };

    const handleValidationSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setValidationSnackbar({ open: false, message: "" });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.bankName.trim()) {
            newErrors.bankName = "Bank name is required";
        }
        if (!formData.branchName.trim()) {
            newErrors.branchName = "Branch name is required";
        }
        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer name is required";
        }
        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = "Account number is required";
        } else if (!/^\d+$/.test(formData.accountNumber)) {
            newErrors.accountNumber = "Account number must contain only digits";
        }
        if (!formData.ifsc.trim()) {
            newErrors.ifsc = "IFSC code is required";
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
            newErrors.ifsc = "Invalid IFSC code format";
        }
        if (!formData.accountType) {
            newErrors.accountType = "Account type is required";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }
        if (formData.customerPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.customerPan.toUpperCase())) {
            newErrors.customerPan = "Invalid PAN card format";
        }
        
        setErrors(newErrors);
        
        // Show validation error in snackbar
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            setValidationSnackbar({ open: true, message: firstError });
        }
        
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            const result = await dispatch(updateBank(bankData.id, formData));
            if (!result.success && result.message) {
                setSnackbarOpen(true);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!bankData) {
        return null;
    }

    return (
        <>
            <div className="card rounded-md border p-4 shadow-md">
                <div className="mb-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-[#053054]">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">
                        Edit Bank Details
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField
                        fullWidth
                        label="Bank Name"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        error={!!errors.bankName}
                        required
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Branch Name"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleChange}
                        error={!!errors.branchName}
                        required
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Customer Name"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        error={!!errors.customerName}
                        required
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Account Number"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        error={!!errors.accountNumber}
                        required
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="CIF Number"
                        name="cifNumber"
                        value={formData.cifNumber}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        label="IFSC Code"
                        name="ifsc"
                        value={formData.ifsc}
                        onChange={handleChange}
                        error={!!errors.ifsc}
                        required
                        placeholder="SBIN0001234"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="MICR Code"
                        name="micr"
                        value={formData.micr}
                        onChange={handleChange}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        select
                        label="Account Type"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        error={!!errors.accountType}
                        required
                        size="small"
                    >
                        {accountTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Customer PAN"
                        name="customerPan"
                        value={formData.customerPan}
                        onChange={handleChange}
                        error={!!errors.customerPan}
                        placeholder="ABCDE1234F"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={!!errors.address}
                        required
                        multiline
                        rows={3}
                        className="md:col-span-2"
                        size="small"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outlined"
                        className="rounded border border-gray-300 px-6 py-2 capitalize text-gray-700"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#053054] px-6 py-2 capitalize text-white"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? "Updating..." : "Update Bank"}
                    </Button>
                </div>
            </div>

            {/* Validation Error Snackbar */}
            <Snackbar
                open={validationSnackbar.open}
                autoHideDuration={3000}
                onClose={handleValidationSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={handleValidationSnackbarClose}
                >
                    {validationSnackbar.message}
                </Alert>
            </Snackbar>

            {/* API Response Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarSeverity || "error"}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EditBankDetails;