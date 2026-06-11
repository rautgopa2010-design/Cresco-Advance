// import { Button } from "@material-tailwind/react";
// import { Alert, Box, Snackbar, TextField } from "@mui/material";
// import React, { useState } from "react";
// import { AiOutlineBank } from "react-icons/ai";
// import { useNavigate } from "react-router-dom";

// const AddBankAccount = () => {
//     const navigate = useNavigate();

//     const [form, setForm] = useState({
//         bankName: "",
//         branchName: "",
//         customerName: "",
//         accountNumber: "",
//         cifNumber: "",
//         ifsc: "",
//         micr: "",
//         accountType: "",
//         customerPan: "",
//         address: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");

//     const handleChange = (field) => (e) => {
//         setForm({ ...form, [field]: e.target.value });
//         setErrors({ ...errors, [field]: false });
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const validateFields = () => {
//         const requiredFields = [
//             "bankName",
//             "branchName",
//             "customerName",
//             "accountNumber",
//             "ifsc",
//             "accountType",
//             "address",
//         ];

//         let tempErrors = {};
//         let hasError = false;

//         requiredFields.forEach((field) => {
//             if (!form[field]) {
//                 tempErrors[field] = true;
//                 hasError = true;
//             }
//         });

//         setErrors(tempErrors);
//         return !hasError;
//     };

//     const handleSubmit = () => {
//         if (!validateFields()) {
//             setSnackbarMessage("Please fill all required fields.");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const existingBankList =
//             JSON.parse(localStorage.getItem("bankList")) || [];

//         existingBankList.push(form);

//         localStorage.setItem("bankList", JSON.stringify(existingBankList));

//         setSnackbarMessage("Bank account added successfully!");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);

//         setForm({
//             bankName: "",
//             branchName: "",
//             customerName: "",
//             accountNumber: "",
//             cifNumber: "",
//             ifsc: "",
//             micr: "",
//             accountType: "",
//             customerPan: "",
//             address: "",
//         });

//         setErrors({});

//         setTimeout(() => {
//             navigate("/settings/bank-setup");
//         }, 500);
//     };

//     return (
//         <>
//             <div className="card space-y-2">
//                 <div className="flex items-center justify-between">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg">
//                         Add Bank Detail's :
//                     </div>
//                     <Button
//                         onClick={() => navigate(-1)}
//                         variant="gradient"
//                         className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                     >
//                         Back
//                     </Button>
//                 </div>

//                 <Box className="flex flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Bank Name *"
//                         value={form.bankName}
//                         onChange={handleChange("bankName")}
//                         error={errors.bankName}
//                         fullWidth
//                         size="small"
//                     />
//                     <TextField
//                         label="Branch Name *"
//                         value={form.branchName}
//                         onChange={handleChange("branchName")}
//                         error={errors.branchName}
//                         fullWidth
//                         size="small"
//                     />
//                 </Box>

//                 <Box className="flex flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Customer Name *"
//                         value={form.customerName}
//                         onChange={handleChange("customerName")}
//                         error={errors.customerName}
//                         fullWidth
//                         size="small"
//                     />
//                     <TextField
//                         label="Account Number *"
//                         type="number"
//                         inputProps={{
//                             min: 0,
//                             onWheel: (e) => e.target.blur(),
//                         }}
//                         value={form.accountNumber}
//                         onChange={handleChange("accountNumber")}
//                         error={errors.accountNumber}
//                         fullWidth
//                         size="small"
//                     />
//                 </Box>

//                 <Box className="flex flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="CIF Number"
//                         value={form.cifNumber}
//                         onChange={handleChange("cifNumber")}
//                         fullWidth
//                         size="small"
//                     />
//                     <TextField
//                         label="IFSC *"
//                         value={form.ifsc}
//                         onChange={handleChange("ifsc")}
//                         error={errors.ifsc}
//                         fullWidth
//                         size="small"
//                     />
//                     <TextField
//                         label="MICR"
//                         value={form.micr}
//                         onChange={handleChange("micr")}
//                         fullWidth
//                         size="small"
//                     />
//                 </Box>

//                 <Box className="flex flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Account Type *"
//                         value={form.accountType}
//                         onChange={handleChange("accountType")}
//                         error={errors.accountType}
//                         fullWidth
//                         size="small"
//                     />
//                     <TextField
//                         label="Customer PAN"
//                         value={form.customerPan}
//                         onChange={handleChange("customerPan")}
//                         fullWidth
//                         size="small"
//                     />
//                 </Box>

//                 <Box className="flex flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Address *"
//                         value={form.address}
//                         onChange={handleChange("address")}
//                         error={errors.address}
//                         fullWidth
//                         size="small"
//                     />
//                 </Box>

//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleSubmit}
//                         variant="gradient"
//                         className="mt-4 flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-sm capitalize text-white"
//                     >
//                         <AiOutlineBank size={20} />
//                         Save
//                     </Button>
//                 </div>
//             </div>

//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={snackbarSeverity}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default AddBankAccount;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { ArrowLeft, Save, X } from "lucide-react";
import { TextField, Snackbar, Alert, CircularProgress, MenuItem } from "@mui/material";
import { addBank, clearBankSuccess } from "../../../redux/actions/bankDetails";

const AddBankDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [validationSnackbar, setValidationSnackbar] = useState({ open: false, message: "" });

    const { loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.bankDetails);

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
        address: "",
    });

    const [errors, setErrors] = useState({});

    const accountTypes = ["Saving", "Current", "Salary", "NRI", "Other"];

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
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            const result = await dispatch(addBank(formData));
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

    return (
        <>
            <div className="card rounded-md border p-4 shadow-md">
                <div className="mb-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#053054]"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Add Bank Details</div>
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
                        size="small"
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
                            <MenuItem
                                key={type}
                                value={type}
                            >
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
                        {loading ? "Saving..." : "Save Bank"}
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

export default AddBankDetails;