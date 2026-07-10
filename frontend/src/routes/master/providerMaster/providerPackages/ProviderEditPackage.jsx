import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router-dom";
import { TbPackages } from "react-icons/tb";
import {
    Alert,
    Box,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Snackbar,
    TextField,
    CircularProgress,
    Button as MuiButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getCurrency } from "../../../../redux/actions/currency";
import { getPackageById, updatePackage } from "../../../../redux/actions/package";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { availablePackageModules, packageModuleGroups } from "./packageModules";

const ProviderEditPackage = () => {
    const { id } = useParams(); // Package ID from URL
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currency } = useSelector((state) => state.currency);
    const { currentPackage, snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.package);

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
        modules: [],
    });

    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [totalPackageAmount, setTotalPackageAmount] = useState(0);
    const [totalPriceAmount, setPriceAmount] = useState(0);
    const [totalMinUsers, setTotalMinUsers] = useState(0);

    const [initialLoad, setInitialLoad] = useState(true);

    // Fetch package and currencies
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    dispatch(getCurrency()),
                    dispatch(getPackageById(id)),
                ]);
            } finally {
                setInitialLoad(false);
            }
        };

        // dispatch(clearSnackbar());
        fetchData();
    }, [dispatch, id]);

    // Populate form when currentPackage is loaded
    useEffect(() => {
        if (currentPackage) {
            const selectedModules = currentPackage.modules
                ? currentPackage.modules.map((m) => (typeof m === "object" ? m.module : m))
                : [];

            setForm({
                packageName: currentPackage.packageName || "",
                maxUsers: currentPackage.maxUsers || "",
                durationType: currentPackage.durationType || "",
                durationValue: currentPackage.durationValue || "",
                price: currentPackage.price || "",
                currency: currentPackage.currency || "",
                symbol: currentPackage.symbol || "",
                description: currentPackage.description || "",
                isActive: currentPackage.isActive || false,
                modules: selectedModules,
            });

            // Calculate initial total
            const users = Number(currentPackage.maxUsers) || 0;
            const price = Number(currentPackage.price) || 0;
            setTotalMinUsers(users);
            setPriceAmount(price);
            setTotalPackageAmount(users * price);
        }
    }, [currentPackage]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            // dispatch(clearSnackbar());
        }, 100);
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;

        if (field === "durationType") {
            let durationValue = form.durationValue;
            if (value === "1 Month") durationValue = 30;
            else if (value === "6 Months") durationValue = 180;
            else if (value === "1 Year") durationValue = 365;
            else if (value === "Custom") durationValue = form.durationValue || "";
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
        }

        if (field === "price") {
            const newPrice = Number(value) || 0;
            setPriceAmount(newPrice);
            if (totalMinUsers > 0) {
                setTotalPackageAmount(newPrice * totalMinUsers);
            }
        }

        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: false });
    };

    const handleModuleToggle = (moduleName) => () => {
        setForm((prev) => {
            const current = prev.modules;
            if (current.includes(moduleName)) {
                return { ...prev, modules: current.filter((m) => m !== moduleName) };
            } else {
                return { ...prev, modules: [...current, moduleName] };
            }
        });
        setErrors({ ...errors, modules: false });
    };

    const handleSelectGroup = (modules) => () => {
        setForm((prev) => {
            const moduleNames = modules.map((module) => module.name);
            const merged = Array.from(new Set([...prev.modules, ...moduleNames]));
            return { ...prev, modules: merged };
        });
        setErrors({ ...errors, modules: false });
    };

    const handleSelectAll = () => {
        setForm((prev) => ({ ...prev, modules: availablePackageModules.map((m) => m.name) }));
        setErrors({ ...errors, modules: false });
    };

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

        const payload = {
            id, // Important: include ID for update
            ...form,
            totalPackageAmount,
        };

        dispatch(updatePackage(payload));

        setTimeout(() => {
            navigate("/provider/settings/master/package");
        }, 1000);
    };

    if (initialLoad || loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <div className="card space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-base font-semibold text-[#433C50] md:text-lg">Edit Package Details :</div>
                    <Button
                        onClick={() => navigate(-1)}
                        variant="gradient"
                        className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                    >
                        Back
                    </Button>
                </div>

                {/* Same form layout as Create */}
                <Box className="flex flex-col gap-4 lg:flex-row">
                    <TextField
                        label="Package Name *"
                        value={form.packageName}
                        onChange={handleChange("packageName")}
                        error={errors.packageName}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Minimum Users *"
                        type="number"
                        value={form.maxUsers}
                        onChange={handleChange("maxUsers")}
                        onWheel={(e) => e.target.blur()}
                        inputProps={{
                            min: 0,
                            onKeyDown: (e) => ["-", "e"].includes(e.key) && e.preventDefault(),
                        }}
                        error={errors.maxUsers}
                        fullWidth
                        size="small"
                    />
                </Box>

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
                        type="number"
                        value={form.durationValue}
                        onChange={handleChange("durationValue")}
                        onWheel={(e) => e.target.blur()}
                        inputProps={{
                            min: 0,
                            onKeyDown: (e) => ["-", "e"].includes(e.key) && e.preventDefault(),
                        }}
                        error={errors.durationValue}
                        fullWidth
                        size="small"
                        disabled={form.durationType !== "Custom"}
                    />
                </Box>

                <Box className="flex flex-col gap-4 lg:flex-row">
                    <TextField
                        label="Price *"
                        type="number"
                        value={form.price}
                        onChange={handleChange("price")}
                        onWheel={(e) => e.target.blur()}
                        inputProps={{
                            min: 0,
                            onKeyDown: (e) => ["-", "e"].includes(e.key) && e.preventDefault(),
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
                            <MenuItem key={option.id} value={option.currencyCode}>
                                {option.currencyCode} - {option.country?.country || option.country}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Currency Symbol" value={form.symbol} fullWidth size="small" disabled />
                </Box>

                <Box>
                    <div className="mb-2 text-sm font-medium text-black-700">
                        Total Package : {form.symbol} {totalPackageAmount}
                    </div>
                </Box>

                {/* Modules Selection */}
                <Box>
                    <div className="mb-1 text-sm font-semibold text-gray-800">
                        Product Modules *
                    </div>
                    <div className="mb-3 text-xs text-gray-500">
                        Select CRM, HRMS, or Support modules to create CRM-only, HRMS-only, or combined packages.
                    </div>
                    <Box className="mb-3 flex flex-wrap gap-2">
                        <MuiButton size="small" variant="outlined" onClick={handleSelectAll}>
                            Select All
                        </MuiButton>
                        <MuiButton size="small" variant="outlined" onClick={handleDeselectAll}>
                            Deselect All
                        </MuiButton>
                    </Box>
                    <Box className="grid gap-4 lg:grid-cols-3">
                        {packageModuleGroups.map((group) => (
                            <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-bold text-[#053054]">{group.title}</div>
                                        <div className="mt-1 text-xs leading-5 text-slate-500">{group.description}</div>
                                    </div>
                                    <MuiButton size="small" variant="text" onClick={handleSelectGroup(group.modules)}>
                                        Select
                                    </MuiButton>
                                </div>
                                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                                    {group.modules.map((module) => (
                                        <FormControlLabel
                                            key={module.id}
                                            className="w-full rounded-lg px-1 hover:bg-white"
                                            control={
                                                <Checkbox
                                                    checked={form.modules.includes(module.name)}
                                                    onChange={handleModuleToggle(module.name)}
                                                    size="small"
                                                />
                                            }
                                            label={<span className="text-sm text-slate-700">{module.name}</span>}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </Box>
                    {errors.modules && <div className="text-red-500 text-sm mt-1">Please select at least one module.</div>}
                </Box>

                {/* Description */}
                <Box>
                    <div className="mb-2 text-sm font-medium text-gray-700">Description</div>
                    <ReactQuill
                        value={form.description}
                        onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                        theme="snow"
                        className="bg-white"
                    />
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox size="small" checked={form.isActive} onChange={handleCheckboxChange} />
                    }
                    label="Activate this package"
                />

                <div>
                    <Button
                        onClick={handleSubmit}
                        variant="gradient"
                        className="mt-4 flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-sm capitalize text-white"
                    >
                        <TbPackages size={20} />
                        Update Package
                    </Button>
                </div>
            </div>

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

export default ProviderEditPackage;
