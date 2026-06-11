import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Snackbar, Alert, Box, Typography, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { Eye, EyeOff, LogIn, KeyRound } from "lucide-react";
import { Button } from "@material-tailwind/react";
import logo from "@/assets/logo.jpg";
import { resetPassword } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", token: "", newPassword: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [missingParams, setMissingParams] = useState(false);

    const { snackbarMessage, snackbarSeverity, isAuthenticated, loading, resetSuccess } = useSelector((state) => state.auth);

    // Get email and token from location state on mount
    useEffect(() => {
        const { email, token } = location.state || {};
        console.log(email, token);
        if (email && token) {
            setForm({ ...form, email, token });
        } else {
            setMissingParams(true);
        }
        setErrors({});
    }, [location.state]);

    useEffect(() => {
        if (resetSuccess) {
            setLocalSnackbarMessage("Password reset successfully. Redirecting to login...");
            setLocalSnackbarSeverity("success");
            setSnackbarOpen(true);
            // Navigate to login after a brief delay
            const timer = setTimeout(() => {
                navigate('/signin');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [resetSuccess]);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const validateFields = () => {
        const fieldNames = { newPassword: "New Password", confirmPassword: "Confirm Password" };
        let tempErrors = {};
        let hasError = false;

        // Check required fields
        for (const field of Object.keys(fieldNames)) {
            if (!form[field]?.trim()) {
                tempErrors[field] = true;
                setLocalSnackbarMessage(`${fieldNames[field]} is required`);
                setLocalSnackbarSeverity("error");
                setSnackbarOpen(true);
                hasError = true;
                break;
            }
        }

        // Check if passwords match
        if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
            tempErrors.confirmPassword = true;
            setLocalSnackbarMessage("Passwords do not match");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            hasError = true;
        }

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateFields()) {
            setSubmitted(true);
            dispatch(resetPassword({ ...form }));
        }
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    if (missingParams) {
        return (
            <Box className="relative flex h-screen items-center justify-center bg-gray-100">
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-6 mx-auto w-44 md:top-44 md:w-60 lg:top-10 lg:w-60"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                />

                <Box className="w-full max-w-sm rounded bg-white p-6 shadow-md" sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3} color="#053054">
                        Session Expired
                    </Typography>
                    <Typography textAlign="center" mb={4} color="text.secondary">
                        Your reset session is no longer valid. Please request a new password reset.
                    </Typography>
                    <Link to="/forgot-password">
                        <Button
                            variant="gradient"
                            className="w-full rounded bg-[#053054] py-2 text-base capitalize"
                        >
                            <LogIn size={20} className="inline mr-2" />
                            Request New Reset
                        </Button>
                    </Link>
                </Box>
            </Box>
        );
    }

    return (
        <>
            {loading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={50}
                >
                    <CircularProgress />
                </Box>
            )}

            <Box className="relative flex h-screen items-center justify-center bg-gray-100">
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-6 mx-auto w-44 md:top-44 md:w-60 lg:top-10 lg:w-60"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                />

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    autoComplete="off"
                    className="w-full max-w-sm rounded bg-white p-6 shadow-md"
                    sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3, marginTop: 4 }}
                >
                    <Box className="flex flex-col items-center mb-4">
                        <KeyRound className="text-blue-500 mb-2" size={48} />
                    </Box>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        mb={3}
                        color="#053054"
                    >
                        Reset Your Password
                    </Typography>

                    <TextField
                        label="New Password *"
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Enter new password"
                        fullWidth
                        margin="normal"
                        value={form.newPassword}
                        onChange={handleChange("newPassword")}
                        error={errors.newPassword}
                        size="small"
                        autoComplete="new-password"
                        inputProps={{ autoComplete: "new-password" }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={togglePasswordVisibility} edge="end">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Confirm New Password *"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        fullWidth
                        margin="normal"
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        error={errors.confirmPassword}
                        size="small"
                        autoComplete="new-password"
                        inputProps={{ autoComplete: "new-password" }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        variant="gradient"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[#053054] py-2 text-base capitalize"
                        disabled={submitted || loading}
                    >
                        <LogIn size={20} />
                        <span className="font-medium">{loading ? "Resetting..." : "Reset Password"}</span>
                    </Button>

                    <Box mt={2} textAlign="center">
                        <Link to="/login">
                            <span className="text-blue-700 hover:underline">Sign In</span>
                        </Link>
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

export default ResetPassword;