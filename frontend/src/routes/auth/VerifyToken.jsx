import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert, Box, Typography, CircularProgress } from "@mui/material";
import { AlertCircle, Mail, Key } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { verifyResetToken } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

const VerifyToken = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);

    const { snackbarMessage, snackbarSeverity, loading, verifySuccess } = useSelector((state) => state.auth);

    // Extract email and token from URL params on mount
    useEffect(() => {
        const emailFromUrl = searchParams.get('email');
        const tokenFromUrl = searchParams.get('token');
        if (emailFromUrl && tokenFromUrl) {
            dispatch(verifyResetToken({ email: emailFromUrl, token: tokenFromUrl }));
        } else {
            setError(true);
            // No snackbar/toast, just show attractive message on page
        }
    }, [searchParams]);

    useEffect(() => {
        if (verifySuccess) {
            setVerified(true);
            setLocalSnackbarMessage("Token verified successfully. You can now reset your password.");
            setLocalSnackbarSeverity("success");
            setSnackbarOpen(true);
            // Navigate to reset password page after a brief delay
            const timer = setTimeout(() => {
                navigate('/reset-password', { state: { email: searchParams.get('email'), token: searchParams.get('token') } });
            }, 1500);
            return () => clearTimeout(timer);
        } else if (snackbarSeverity === 'error' && !error) {
            setError(true);
            setLocalSnackbarMessage(snackbarMessage || "Token verification failed.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }, [verifySuccess, snackbarSeverity, snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    if (verified) {
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

                    <Box className="w-full max-w-sm rounded bg-white p-6 shadow-md" sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3} color="#053054">
                            Token Verified Successfully!
                        </Typography>
                        <Box className="flex flex-col items-center mb-4">
                            <AlertCircle className="text-green-500 mb-2" size={48} />
                            <Typography textAlign="center" color="text.secondary">
                                Your reset token has been verified. Redirecting you to reset your password...
                            </Typography>
                        </Box>
                        <CircularProgress />
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
    }

    if (error) {
        return (
            <Box className="relative flex h-screen items-center justify-center bg-gray-100">
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-6 mx-auto w-44 md:top-44 md:w-60 lg:top-10 lg:w-60"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                />

                <Box className="w-full max-w-sm rounded bg-white p-6 shadow-md" sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}>
                    <Box className="flex flex-col items-center mb-4">
                        <AlertCircle className="text-red-500 mb-2" size={48} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3} color="#053054">
                        Verification Required
                    </Typography>
                    <Typography textAlign="center" mb={4} color="text.secondary" className="leading-relaxed">
                        It looks like you need to click on the link sent to your email to verify your reset token. 
                        <br />
                        No worries! You can request a new one below.
                    </Typography>
                    <Link to="/forgot-password">
                        <Box 
                            component="button" 
                            className="flex items-center justify-center w-full gap-2 rounded bg-[#053054] py-3 text-base capitalize text-white hover:bg-[#042743] transition-colors"
                        >
                            <Mail size={20} />
                            <span className="font-medium">Request New Password Reset</span>
                        </Box>
                    </Link>
                </Box>
            </Box>
        );
    }

    // Default loading state
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

                <Box className="w-full max-w-sm rounded bg-white p-6 shadow-md" sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}>
                    <Box className="flex flex-col items-center mb-4">
                        <Key className="text-blue-500 mb-2" size={48} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3} color="#053054">
                        Verifying Your Reset Token
                    </Typography>
                    <Typography textAlign="center" color="text.secondary">
                        Please wait while we confirm your password reset request. This should only take a moment.
                    </Typography>
                    <CircularProgress className="mt-4" />
                </Box>
            </Box>
        </>
    );
};

export default VerifyToken;