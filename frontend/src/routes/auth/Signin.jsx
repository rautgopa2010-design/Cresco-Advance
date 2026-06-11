// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { TextField, Snackbar, Alert, Box, Typography, IconButton, InputAdornment } from "@mui/material";
// import { Eye, EyeOff, LogIn } from "lucide-react";
// import { Button } from "@material-tailwind/react";
// import logo from "@/assets/logo.jpg";

// const Signin = () => {
//     const navigate = useNavigate();
//     const [form, setForm] = useState({ email: "", password: "" });
//     const [errors, setErrors] = useState({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");

//     const handleChange = (field) => (e) => {
//         setForm({ ...form, [field]: e.target.value });
//         setErrors({ ...errors, [field]: false });
//     };

//     const validateFields = () => {
//         let tempErrors = {};
//         let hasError = false;

//         const fieldNames = {
//             email: "Email Address",
//             password: "Password",
//         };

//         for (const field of Object.keys(fieldNames)) {
//             if (!form[field].trim()) {
//                 tempErrors[field] = true;
//                 setSnackbarMessage(`${fieldNames[field]} is required`);
//                 setSnackbarSeverity("error");
//                 hasError = true;
//                 break;
//             }

//             // Extra email validation
//             if (field === "email" && !/\S+@\S+\.\S+/.test(form.email)) {
//                 tempErrors.email = true;
//                 setSnackbarMessage("Enter a valid email");
//                 setSnackbarSeverity("error");
//                 hasError = true;
//                 break;
//             }
//         }

//         setErrors(tempErrors);
//         if (hasError) setSnackbarOpen(true);
//         return !hasError;
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (validateFields()) {
//             localStorage.setItem("isAuthenticated", "true");
//             setSnackbarMessage("Login Successful!");
//             setSnackbarSeverity("success");
//             setSnackbarOpen(true);

//             setTimeout(() => {
//                 navigate("/");
//             }, 500);
//         }
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     return (
//         <Box
//             className="relative flex h-screen items-center justify-center bg-gray-100"
//             sx={{ backgroundColor: "#f3f4f6" }}
//         >
//             <img
//                 src={logo}
//                 alt="Logo"
//                 className="absolute lg:top-10 md:top-44 top-6 mx-auto w-44 md:w-60 lg:w-60"
//                 style={{ left: "50%", transform: "translateX(-50%)" }}
//             />
//             <Box
//                 component="form"
//                 onSubmit={handleSubmit}
//                 className="w-full max-w-sm rounded bg-white p-6 shadow-md"
//                 sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}
//             >
//                 <Typography
//                     variant="h5"
//                     fontWeight="bold"
//                     textAlign="center"
//                     mb={3}
//                     color="#053054"
//                 >
//                     Login
//                 </Typography>

//                 <TextField
//                     label="Email Id *"
//                     type="email"
//                     placeholder="Enter Email address"
//                     fullWidth
//                     margin="normal"
//                     value={form.email}
//                     onChange={handleChange("email")}
//                     error={errors.email}
//                     size="small"
//                 />

//                 <TextField
//                     label="Password *"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter password"
//                     fullWidth
//                     margin="normal"
//                     value={form.password}
//                     onChange={handleChange("password")}
//                     error={errors.password}
//                     size="small"
//                     InputProps={{
//                         endAdornment: (
//                             <InputAdornment position="end">
//                                 <IconButton onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff /> : <Eye />}</IconButton>
//                             </InputAdornment>
//                         ),
//                     }}
//                 />

//                 <Button
//                     type="submit"
//                     variant="gradient"
//                     className="mt-2 flex w-full items-center justify-center gap-5 rounded bg-[#053054] py-2 text-base capitalize"
//                 >
//                     <LogIn size={20} />
//                     <span className="font-medium">Login</span>
//                 </Button>

//                 <Box
//                     mt={1}
//                     textAlign="end"
//                 >
//                     <Link to="/forgot-password">
//                         <div className="text-sm text-[#433C50] hover:text-blue-700 delay-100 duration-200">Forgot Password ?</div>
//                     </Link>
//                 </Box>

//                 <Box
//                     mt={1}
//                     className="flex items-center justify-center text-sm"
//                 >
//                     <div className="flex-grow border-t border-gray-300"></div>
//                     <span className="mx-2 text-gray-500">OR</span>
//                     <div className="flex-grow border-t border-gray-300"></div>
//                 </Box>

//                 <Box
//                     mt={1}
//                     textAlign="center"
//                 >
//                     <span className="text-[#433C50]">Don't have an account ?</span>{" "}
//                     <Link to="/signup">
//                         <span className="text-blue-700">Signup</span>
//                     </Link>
//                 </Box>
//             </Box>

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     onClose={handleSnackbarClose}
//                     severity={snackbarSeverity}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </Box>
//     );
// };

// export default Signin;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Snackbar, Alert, Box, Typography, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { Eye, EyeOff, LogIn } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@material-tailwind/react";
import logo from "@/assets/logo.jpg";
import { loginUser } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

const Signin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [submitted, setSubmitted] = useState(false);

    const recaptchaRef = useRef();

    const { snackbarMessage, snackbarSeverity, isAuthenticated, loading } = useSelector((state) => state.auth);

    // Clear form on mount (prevent autofill memory)
    useEffect(() => {
        setForm({ email: "", password: "" });
        setErrors({});
    }, []);

    // Handle snackbar messages (from signup success or login error)
    useEffect(() => {
        if (location.state?.snackbarMessage) {
            setLocalSnackbarMessage(location.state.snackbarMessage);
            setLocalSnackbarSeverity(location.state.snackbarSeverity || "success");
            setSnackbarOpen(true);

            navigate(location.pathname, { replace: true, state: {} });
        } else if (snackbarMessage?.trim()) {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity(snackbarSeverity || "success");
            setSnackbarOpen(true);
        }
    }, [location, snackbarMessage, snackbarSeverity, navigate]);

    useEffect(() => {
        if (isAuthenticated && submitted) {
          setTimeout(() => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
      
            if (
              user?.user_type === "company" &&
              user?.role_name === "Super Admin" &&
              !user?.packageId
            ) {
              navigate("/choose-package");
            } else {
              // provider or other roles → dashboard
              navigate("/");
            }
          }, 500);
      
          setTimeout(() => {
            dispatch(clearSnackbar());
          }, 500);
        }
      }, [isAuthenticated, submitted, navigate, dispatch]);
      
    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    const validateFields = () => {
        const fieldNames = { email: "Email Address", password: "Password" };
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
            const token = recaptchaRef.current?.getValue();
            // if (!token) {
            //     setLocalSnackbarMessage("Please complete the reCAPTCHA verification");
            //     setLocalSnackbarSeverity("error");
            //     setSnackbarOpen(true);
            //     return;
            // }
            setSubmitted(true);
            dispatch(loginUser({ ...form, recaptchaToken: token }));
            recaptchaRef.current?.reset();
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
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-6 mx-auto w-44 md:top-44 md:w-60 xl:top-10 lg:top-0 xl:w-60 lg:w-52"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                />

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    autoComplete="off"
                    className="w-full max-w-sm rounded bg-white p-6 shadow-md"
                    sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3, marginTop: {lg:10, xs: 5} }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        mb={3}
                        color="#053054"
                    >
                        Login
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

                    <TextField
                        label="Password *"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        fullWidth
                        margin="normal"
                        value={form.password}
                        onChange={handleChange("password")}
                        error={errors.password}
                        size="small"
                        autoComplete="new-password"
                        inputProps={{ autoComplete: "new-password" }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff /> : <Eye />}</IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/*<Box mt={2}>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6LcUNeIrAAAAALf8dM--QE9YXQPx0cKBLHcymx-e" // Replace with your actual reCAPTCHA site key
                        />
                    </Box>*/}

                    <Button
                        type="submit"
                        variant="gradient"
                        className="mt-2 flex w-full items-center justify-center gap-5 rounded bg-[#053054] py-2 text-base capitalize"
                    >
                        <LogIn size={20} />
                        <span className="font-medium">Login</span>
                    </Button>

                    <Box
                        mt={1}
                        textAlign="end"
                    >
                        <Link to="/forgot-password">
                            <div className="text-sm text-[#433C50] hover:text-blue-700">Forgot Password ?</div>
                        </Link>
                    </Box>

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
                        <span className="text-[#433C50]">Don't have an account ? </span>
                        <Link to="/signup">
                            <span className="text-blue-700">Signup</span>
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

export default Signin;