import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { TbPackages } from "react-icons/tb";
import { Alert, Box, Checkbox, FormControlLabel, MenuItem, Snackbar, TextField, CircularProgress, Button as MuiButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getCurrency } from "../../../../redux/actions/currency";
import { clearSnackbar } from "../../../../redux/actions/commonActions";
import { createPackage } from "../../../../redux/actions/package";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ProviderCreatePackage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currency } = useSelector((state) => state.currency);

    // Hardcoded modules for demonstration; in a real app, fetch these dynamically via Redux action
    const availableModules = [
        { id: 1, name: "Enquiry" },
        { id: 2, name: "Leads" },
        { id: 3, name: "API Leads" },
        { id: 4, name: "Followup" },
        { id: 5, name: "Quotations" },
        { id: 6, name: "Orders" },
        { id: 7, name: "Customer" },
        { id: 8, name: "Invoice" },
        { id: 9, name: "Reports" },
        { id: 10, name: "Incentive" },
        { id: 11, name: "Master" },
        { id: 12, name: "Tickets" },
    ];

    const [form, setForm] = useState({
        packageName: "",
        maxUsers: "",
        durationType: "",
        durationValue: "",
        price: "",
        currency: "",
        symbol: "",
        description: "",
        isActive: true,
        modules: [], // New field for selected modules
    });

    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.package);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [totalPackageAmount, setTotalPackageAmount] = useState(0);
    const [totalPriceAmount, setPriceAmount] = useState(0);
    const [totalMinUsers, setTotalMinUsers] = useState(0);

    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([dispatch(getCurrency())]);
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;

        if (field === "durationType") {
            let durationValue = "";
            if (value === "1 Month") durationValue = 30;
            else if (value === "6 Months") durationValue = 180;
            else if (value === "1 Year") durationValue = 365;
            setForm({ ...form, durationType: value, durationValue });
            return;
        }

        if (field === "currency") {
            const selected = currency.find((c) => c.currencyCode === value);
            setForm({
                ...form,
                currency: value,
                symbol: selected ? selected.symbol : "",
            });
            return;
        }

        if (field === "maxUsers") {
            const newMinUsers = Number(value) || 0;
            setTotalMinUsers(newMinUsers);
            if (totalPriceAmount > 0) {
                setTotalPackageAmount(totalPriceAmount * newMinUsers);
            }
            setForm({ ...form, [field]: value });
            setErrors({ ...errors, [field]: false });
            return;
        }

        if (field === "price") {
            const newPrice = Number(value) || 0;
            setPriceAmount(newPrice);
            if (totalMinUsers > 0) {
                setTotalPackageAmount(newPrice * totalMinUsers);
            }
            setForm({ ...form, [field]: value });
            setErrors({ ...errors, [field]: false });
            return;
        }

        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: false });
    };

    // New handler for modules toggle
    const handleModuleToggle = (moduleName) => () => {
        setForm((prev) => {
            const current = prev.modules;
            const index = current.indexOf(moduleName);
            if (index > -1) {
                return { ...prev, modules: current.filter((m) => m !== moduleName) };
            } else {
                return { ...prev, modules: [...current, moduleName] };
            }
        });
        setErrors({ ...errors, modules: false });
    };

    // Select all modules
    const handleSelectAll = () => {
        setForm((prev) => ({ ...prev, modules: availableModules.map((m) => m.name) }));
        setErrors({ ...errors, modules: false });
    };

    // Deselect all modules
    const handleDeselectAll = () => {
        setForm((prev) => ({ ...prev, modules: [] }));
    };

    const handleCheckboxChange = (e) => {
        setForm({ ...form, isActive: e.target.checked });
    };

    const validateFields = () => {
        const requiredFields = ["packageName", "maxUsers", "durationType", "durationValue", "price", "currency", "modules"];
        let tempErrors = {};
        let hasError = false;

        requiredFields.forEach((field) => {
            if (!form[field] || (Array.isArray(form[field]) && form[field].length === 0)) {
                tempErrors[field] = true;
                hasError = true;
            }
        });

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSubmit = () => {
        if (!validateFields()) {
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const payload = { ...form, totalPackageAmount};

        // console.log(payload);
        // return;

        // ✅ Dispatch create action (modules will be included in payload)
        dispatch(createPackage(payload));

        // ✅ Navigate after short delay
        setTimeout(() => {
            navigate("/provider/settings/master/package");
        }, 1000);
    };

    return (
        <>
            {initialLoad ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg">Add Package Detail's :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>

                    {/* Package Name + Max Users */}
                    <Box className="flex flex-col gap-4 lg:flex-row">
                        <TextField
                            label="Package Name *"
                            placeholder="Package Name"
                            value={form.packageName}
                            onChange={handleChange("packageName")}
                            error={errors.packageName}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Minimum Users *"
                            type="number"
                            placeholder="Minimum Users"
                            value={form.maxUsers}
                            onChange={handleChange("maxUsers")}
                            onWheel={(e) => e.target.blur()}
                            inputProps={{
                                min: 0,
                                onKeyDown: (e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                },
                            }}
                            error={errors.maxUsers}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    {/* Duration Type + Value */}
                    <Box className="flex flex-col gap-4 lg:flex-row">
                        <TextField
                            select
                            label="Duration Type *"
                            value={form.durationType}
                            onChange={handleChange("durationType")}
                            error={errors.durationType}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="1 Month">1 Month</MenuItem>
                            <MenuItem value="6 Months">6 Months</MenuItem>
                            <MenuItem value="1 Year">1 Year</MenuItem>
                            <MenuItem value="Custom">Custom</MenuItem>
                        </TextField>

                        <TextField
                            label="Duration Value *"
                            placeholder="Duration Value"
                            type="number"
                            value={form.durationValue}
                            onChange={handleChange("durationValue")}
                            onWheel={(e) => e.target.blur()}
                            inputProps={{
                                min: 0,
                                onKeyDown: (e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                },
                            }}
                            error={errors.durationValue}
                            fullWidth
                            size="small"
                            disabled={form.durationType !== "Custom"}
                        />
                    </Box>

                    {/* Price + Currency + Symbol */}
                    <Box className="flex flex-col gap-4 lg:flex-row">
                        <TextField
                            label="Price *"
                            placeholder="Price"
                            type="number"
                            value={form.price}
                            onChange={handleChange("price")}
                            onWheel={(e) => e.target.blur()}
                            inputProps={{
                                min: 0,
                                onKeyDown: (e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                },
                            }}
                            error={errors.price}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            select
                            label="Currency *"
                            value={form.currency}
                            onChange={handleChange("currency")}
                            error={errors.currency}
                            fullWidth
                            size="small"
                        >
                            {currency.map((option) => (
                                <MenuItem
                                    key={option.id}
                                    value={option.currencyCode}
                                >
                                    {option.currencyCode} - {option.country?.country || option.country}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Currency Symbol"
                            value={form.symbol}
                            fullWidth
                            size="small"
                            disabled
                        />
                    </Box>
                    <Box>
                        <div className="mb-2 text-sm font-medium text-black-700">Total Package : {form.symbol} {totalPackageAmount}</div>
                    </Box>

                    {/* New: Modules Selection with Checkboxes */}
                    <Box>
                        <div className="mb-2 text-sm font-medium text-gray-700">Modules * (Select accessible modules for this package)</div>
                        <Box className="flex gap-2 mb-2">
                            <MuiButton size="small" variant="outlined" onClick={handleSelectAll}>
                                Select All
                            </MuiButton>
                            <MuiButton size="small" variant="outlined" onClick={handleDeselectAll}>
                                Deselect All
                            </MuiButton>
                        </Box>
                        <Box className="max-h-40 overflow-y-auto space-y-1">
                            {availableModules.map((module) => (
                                <FormControlLabel
                                    key={module.id}
                                    control={
                                        <Checkbox
                                            checked={form.modules.includes(module.name)}
                                            onChange={handleModuleToggle(module.name)}
                                            size="small"
                                        />
                                    }
                                    label={module.name}
                                />
                            ))}
                        </Box>
                        {errors.modules && <div className="text-red-500 text-sm mt-1">Please select at least one module.</div>}
                    </Box>

                    {/* Description */}
                    <Box>
                        <div className="mb-2 text-sm font-medium text-gray-700">Description</div>
                        <ReactQuill
                            value={form.description}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, description: value }));
                            }}
                            theme="snow"
                            className={`bg-white`}
                        />
                    </Box>

                    <span>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={form.isActive}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Activate this package"
                        />
                    </span>

                    {/* Submit */}
                    <div>
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="mt-4 flex items-center gap-2 justify-self-end rounded bg-[#053054] px-4 py-2 text-sm capitalize text-white"
                        >
                            <TbPackages size={20} />
                            Generate
                        </Button>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProviderCreatePackage;