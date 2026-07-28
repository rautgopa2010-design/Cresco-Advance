import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { countries } from "country-data";
import {
    Alert,
    Autocomplete,
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    Snackbar,
    TextField,
    Typography,
    createFilterOptions,
} from "@mui/material";
import { Button } from "@material-tailwind/react";
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import logo from "@/assets/logo.jpg";
import { registerUser } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "14px",
        backgroundColor: "#fff",
        transition: "box-shadow 180ms ease, border-color 180ms ease",
        "&:hover fieldset": {
            borderColor: "#2563eb",
        },
        "&.Mui-focused": {
            boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.10)",
        },
    },
    "& .MuiInputLabel-root": {
        color: "#64748b",
        fontWeight: 600,
    },
};

const filter = createFilterOptions({
    stringify: (option) => `${option.name} ${option.alpha2} ${option.code}`,
    trim: true,
    matchFrom: "any",
});

const countryOptions = countries.all
    .filter((country) => country.countryCallingCodes.length > 0)
    .map((country) => ({
        label: `${country.name} ${country.alpha2} ${country.countryCallingCodes[0]}`,
        code: country.countryCallingCodes[0],
        name: country.name,
        alpha2: country.alpha2,
    }));

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { snackbarMessage, snackbarSeverity, isAuthenticated, loading } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        company: "",
        firstName: "",
        middleName: "",
        lastName: "",
        code: "+91",
        mobile: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        setErrors((prev) => ({ ...prev, [field]: false }));
    };

    const handleMobileChange = (event) => {
        setForm((prev) => ({ ...prev, mobile: event.target.value.replace(/\D/g, "").slice(0, 10) }));
        setErrors((prev) => ({ ...prev, mobile: false }));
    };

    const showValidationError = (field, message) => {
        setErrors((prev) => ({ ...prev, [field]: true }));
        setLocalSnackbarMessage(message);
        setLocalSnackbarSeverity("error");
        setSnackbarOpen(true);
    };

    const validateFields = () => {
        const requiredFields = {
            company: "Company Name",
            firstName: "First Name",
            lastName: "Last Name",
            code: "Code",
            mobile: "Mobile",
            email: "Email",
            password: "Password",
            confirmPassword: "Confirm Password",
        };

        for (const field in requiredFields) {
            if (!form[field]?.trim()) {
                showValidationError(field, `${requiredFields[field]} is required`);
                return false;
            }
        }

        if (form.mobile.length !== 10) {
            showValidationError("mobile", "Mobile number must be exactly 10 digits");
            return false;
        }

        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
            showValidationError("email", "Enter a valid email address");
            return false;
        }

        if (form.password !== form.confirmPassword) {
            showValidationError("confirmPassword", "Passwords do not match");
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateFields()) return;

        dispatch(
            registerUser(
                {
                    ...form,
                    mobile: `${form.code} ${form.mobile}`.trim(),
                },
                navigate,
            ),
        );
    };

    useEffect(() => {
        const hadDarkClass = document.documentElement.classList.contains("dark");
        document.documentElement.classList.remove("dark");

        return () => {
            if (hadDarkClass) document.documentElement.classList.add("dark");
        };
    }, []);

    useEffect(() => {
        if (snackbarMessage && snackbarSeverity?.toLowerCase() === "error") {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage, snackbarSeverity]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (
            snackbarMessage &&
            snackbarSeverity?.toLowerCase() === "success" &&
            user?.user_type === "company" &&
            user?.role_name === "Super Admin" &&
            !user?.packageId
        ) {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity(snackbarSeverity || "success");
            setSnackbarOpen(true);

            const timer = setTimeout(() => {
                navigate("/choose-package");
            }, 1200);

            return () => clearTimeout(timer);
        }

        if (user?.id && user?.packageId) {
            navigate("/");
        }
    }, [isAuthenticated, navigate, snackbarMessage, snackbarSeverity]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    return (
        <>
            {loading && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={50}
                    sx={{ backgroundColor: "rgba(255,255,255,0.72)", backdropFilter: "blur(4px)" }}
                >
                    <CircularProgress />
                </Box>
            )}

            <Box className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_34%),linear-gradient(135deg,_#f8fafc_0%,_#eef4ff_46%,_#f8fafc_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
                <Box className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-7xl items-center">
                    <Box className="grid w-full overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
                        <Box className="relative hidden min-h-[680px] overflow-hidden bg-[#f8fafc] p-10 text-slate-950 lg:flex lg:flex-col lg:justify-between">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(79,70,229,0.16),_transparent_30%),radial-gradient(circle_at_78%_12%,_rgba(37,99,235,0.14),_transparent_28%),linear-gradient(145deg,_#ffffff,_#eef4ff)]" />
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="Crescosoft"
                                    className="h-20 w-auto object-contain"
                                />
                                <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
                                    <Sparkles size={16} />
                                    CRM onboarding
                                </div>
                                <Typography
                                    component="h1"
                                    className="mt-6 max-w-md !text-4xl !font-black !leading-tight text-slate-950"
                                >
                                    Start your workspace with a clean company profile.
                                </Typography>
                                <p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-600">
                                    Create the Super Admin account, choose a package, and continue into your CRM workspace.
                                </p>
                            </div>

                            <div className="relative grid gap-4">
                                {["Secure Super Admin account", "Company workspace setup", "Package selection after signup"].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </Box>

                        <Box className="p-5 sm:p-8 lg:p-12">
                            <Box className="mb-8 flex items-center justify-between gap-4 lg:hidden">
                                <img
                                    src={logo}
                                    alt="Crescosoft"
                                    className="h-16 w-auto object-contain"
                                />
                                <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                                    Signup
                                </div>
                            </Box>

                            <Box className="mb-8">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                                    <Building2 size={17} />
                                    New organization
                                </div>
                                <Typography
                                    component="h2"
                                    className="mt-5 !text-3xl !font-black !tracking-tight text-slate-950"
                                >
                                    Create your account
                                </Typography>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                    Enter company and admin details to create your CRM workspace.
                                </p>
                            </Box>

                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                                className="grid gap-5"
                            >
                                <TextField
                                    label="Company Name *"
                                    fullWidth
                                    size="small"
                                    value={form.company}
                                    onChange={handleChange("company")}
                                    error={errors.company}
                                    sx={fieldSx}
                                />

                                <Box className="grid gap-5 md:grid-cols-3">
                                    <TextField
                                        label="First Name *"
                                        fullWidth
                                        size="small"
                                        value={form.firstName}
                                        onChange={handleChange("firstName")}
                                        error={errors.firstName}
                                        sx={fieldSx}
                                    />
                                    <TextField
                                        label="Middle Name"
                                        fullWidth
                                        size="small"
                                        value={form.middleName}
                                        onChange={handleChange("middleName")}
                                        sx={fieldSx}
                                    />
                                    <TextField
                                        label="Last Name *"
                                        fullWidth
                                        size="small"
                                        value={form.lastName}
                                        onChange={handleChange("lastName")}
                                        error={errors.lastName}
                                        sx={fieldSx}
                                    />
                                </Box>

                                <Box className="grid gap-5 lg:grid-cols-2">
                                    <Box className="grid grid-cols-[132px_1fr] gap-4">
                                        <Autocomplete
                                            options={countryOptions}
                                            filterOptions={(options, state) =>
                                                filter(options, state).filter(
                                                    (option, index, self) => index === self.findIndex((item) => item.code === option.code),
                                                )
                                            }
                                            getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
                                            value={countryOptions.find((option) => option.code === form.code) || null}
                                            onChange={(_, newValue) => {
                                                setForm((prev) => ({ ...prev, code: newValue?.code || "" }));
                                                setErrors((prev) => ({ ...prev, code: false }));
                                            }}
                                            renderOption={(props, option) => <li {...props}>{option.code}</li>}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Code *"
                                                    fullWidth
                                                    size="small"
                                                    error={errors.code}
                                                    sx={fieldSx}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.code === value.code}
                                            sx={fieldSx}
                                        />
                                        <TextField
                                            label="Mobile *"
                                            fullWidth
                                            size="small"
                                            value={form.mobile}
                                            onChange={handleMobileChange}
                                            error={errors.mobile}
                                            inputProps={{ inputMode: "numeric", maxLength: 10 }}
                                            sx={fieldSx}
                                        />
                                    </Box>
                                    <TextField
                                        label="Email *"
                                        fullWidth
                                        size="small"
                                        value={form.email}
                                        onChange={handleChange("email")}
                                        error={errors.email}
                                        sx={fieldSx}
                                    />
                                </Box>

                                <Box className="grid gap-5 lg:grid-cols-2">
                                    <TextField
                                        label="Password *"
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        size="small"
                                        value={form.password}
                                        onChange={handleChange("password")}
                                        error={errors.password}
                                        sx={fieldSx}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                                        {showPassword ? <EyeOff /> : <Eye />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        label="Confirm Password *"
                                        type={showConfirmPassword ? "text" : "password"}
                                        fullWidth
                                        size="small"
                                        value={form.confirmPassword}
                                        onChange={handleChange("confirmPassword")}
                                        error={errors.confirmPassword}
                                        sx={fieldSx}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-600">
                                        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                        Your account will be created as the organization Super Admin. Package selection opens immediately after signup.
                                    </div>
                                </Box>

                                <Button
                                    type="submit"
                                    variant="gradient"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#053054] py-3 text-base font-bold capitalize shadow-lg shadow-sky-950/20 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <span>Create account</span>
                                    <ArrowRight size={20} />
                                </Button>

                                <Box className="flex items-center justify-center text-sm">
                                    <div className="flex-grow border-t border-gray-300" />
                                    <span className="mx-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">or</span>
                                    <div className="flex-grow border-t border-gray-300" />
                                </Box>

                                <Box
                                    textAlign="center"
                                    className="text-sm"
                                >
                                    <span className="font-medium text-slate-500">Already have an account?</span>{" "}
                                    <Link
                                        to="/signin"
                                        className="font-bold text-blue-700 hover:text-blue-900"
                                    >
                                        Sign in
                                    </Link>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={localSnackbarSeverity}
                        variant="filled"
                    >
                        {localSnackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
};

export default Signup;
