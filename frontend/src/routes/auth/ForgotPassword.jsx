import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Snackbar, Alert, Box, Typography, CircularProgress } from "@mui/material";
import { LogIn } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@material-tailwind/react";
import logo from "@/assets/logo.jpg";
import { forgotPasswordSendMail } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";
import { IoArrowBackCircle } from "react-icons/io5";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const prefillEmail = location.state?.emailPrefill || "";
    const cameFromChangePassword = location.state?.cameFrom === "changePassword";

    const [form, setForm] = useState({ email: "" });
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [submitted, setSubmitted] = useState(false);

    const recaptchaRef = useRef();

    const { snackbarMessage, snackbarSeverity, isAuthenticated, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        setForm({ email: prefillEmail });
        setErrors({});
    }, [prefillEmail]);

    useEffect(() => {
        if (snackbarMessage) {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity(snackbarSeverity || "error");
            setSnackbarOpen(true);
    
            // clear after showing
            dispatch(clearSnackbar());
        }
    }, [snackbarMessage, snackbarSeverity, dispatch]);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    const validateFields = () => {
        const fieldNames = { email: "Email Address" };
        let tempErrors = {};
        let hasError = false;

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

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateFields()) {
            setSubmitted(true);
            dispatch(forgotPasswordSendMail({ ...form }));
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
                {cameFromChangePassword && (
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-2 top-12 z-10 flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-gray-700 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl md:left-10 md:top-16 md:gap-2 md:px-4 md:py-3 lg:left-[40px] lg:top-16"
                    >
                        <IoArrowBackCircle size={24} />
                        Back
                    </button>
                )}
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
                    sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        mb={3}
                        color="#053054"
                    >
                        Forgot Password
                    </Typography>

                    <TextField
                        label="Email Id *"
                        type="email"
                        name="email"
                        placeholder="Enter Email address"
                        fullWidth
                        margin="normal"
                        value={form.email}
                        onChange={handleChange("email")}
                        error={errors.email}
                        size="small"
                        autoComplete="new-email"
                        inputProps={{ autoComplete: "new-email" }}
                    />

                    <Button
                        type="submit"
                        variant="gradient"
                        className="mt-2 flex w-full items-center justify-center gap-5 rounded bg-[#053054] py-2 text-base capitalize"
                    >
                        <LogIn size={20} />
                        <span className="font-medium">Submit</span>
                    </Button>

                    <Box
                        mt={1}
                        className="flex items-center justify-center text-sm"
                    >
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-2 text-gray-500">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </Box>

                    <Box
                        mt={1}
                        textAlign="center"
                    >
                        <Link to="/signin">
                            <span className="text-blue-700">Signin</span>
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

export default ForgotPassword;
