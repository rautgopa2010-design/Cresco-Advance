// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { TextField, Snackbar, Alert, Box, IconButton, InputAdornment, Typography } from "@mui/material";
// import { Eye, EyeOff, LogIn } from "lucide-react";
// import { Button } from "@material-tailwind/react";
// import logo from "@/assets/logo.jpg";

// const Signup = () => {
//     const navigate = useNavigate();
//     const formatDate = (date) => {
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const year = date.getFullYear();
//         return `${year}-${month}-${day}`;
//     };

//     const [form, setForm] = useState({
//         company: "",
//         gstin: "",
//         firstName: "",
//         middleName: "",
//         lastName: "",
//         mobile: "",
//         email: "",
//         expiry: formatDate(new Date()),
//         packageDetails: "",
//         password: "",
//         confirmPassword: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

//         const requiredFields = {
//             company: "Company Name",
//             gstin: "GSTIN No",
//             firstName: "First Name",
//             lastName: "Last Name",
//             mobile: "Mobile",
//             email: "Email",
//             expiry: "Expiry Date",
//             packageDetails: "Package Details",
//             password: "Password",
//             confirmPassword: "Confirm Password",
//         };

//         for (const field in requiredFields) {
//             if (!form[field]?.trim()) {
//                 tempErrors[field] = true;
//                 setSnackbarMessage(`${requiredFields[field]} is required`);
//                 setSnackbarSeverity("error");
//                 hasError = true;
//                 break;
//             }
//         }

//         if (!hasError && !/\S+@\S+\.\S+/.test(form.email)) {
//             tempErrors.email = true;
//             setSnackbarMessage("Enter a valid email");
//             setSnackbarSeverity("error");
//             hasError = true;
//         }

//         if (!hasError && form.password !== form.confirmPassword) {
//             tempErrors.confirmPassword = true;
//             setSnackbarMessage("Passwords do not match");
//             setSnackbarSeverity("error");
//             hasError = true;
//         }

//         setErrors(tempErrors);
//         if (hasError) setSnackbarOpen(true);
//         return !hasError;
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (validateFields()) {
//             setSnackbarMessage("Signup Successfully");
//             setSnackbarSeverity("success");
//             setSnackbarOpen(true);
//             setTimeout(() => {
//                 navigate("/signin");
//             }, 800);
//         }
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const inputStyle = { flex: 1 };

//     return (
//         <Box className="relative flex h-screen items-center justify-center bg-gray-100">
//             <img
//                 src={logo}
//                 alt="Logo"
//                 className="absolute top-1 mx-auto w-44 md:w-60"
//                 style={{ left: "50%", transform: "translateX(-50%)" }}
//             />
//             <Box
//                 component="form"
//                 onSubmit={handleSubmit}
//                 className="mt-[420px] w-full max-w-sm rounded bg-white p-6 shadow-md md:mt-28 md:max-w-xl lg:mt-14 lg:max-w-3xl"
//                 sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}
//             >
//                 <Typography
//                     variant="h5"
//                     fontWeight="bold"
//                     textAlign="center"
//                     mb={3}
//                     color="#053054"
//                 >
//                     Signup
//                 </Typography>

//                 {/* Company & GSTIN */}
//                 <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
//                     <TextField
//                         label="Company Name *"
//                         placeholder="Company Name"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.company}
//                         onChange={handleChange("company")}
//                         error={errors.company}
//                     />
//                     <TextField
//                         label="GSTIN No *"
//                         placeholder="GSTIN Number"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.gstin}
//                         onChange={handleChange("gstin")}
//                         error={errors.gstin}
//                     />
//                 </Box>

//                 {/* Name Fields */}
//                 <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
//                     <TextField
//                         label="First Name *"
//                         placeholder="First Name"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.firstName}
//                         onChange={handleChange("firstName")}
//                         error={errors.firstName}
//                     />
//                     <TextField
//                         label="Middle Name"
//                         placeholder="Middle Name"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.middleName}
//                         onChange={handleChange("middleName")}
//                     />
//                     <TextField
//                         label="Last Name *"
//                         placeholder="Last Name"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.lastName}
//                         onChange={handleChange("lastName")}
//                         error={errors.lastName}
//                     />
//                 </Box>

//                 {/* Mobile & Email */}
//                 <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
//                     <TextField
//                         label="Mobile *"
//                         placeholder="Mobile"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.mobile}
//                         onChange={handleChange("mobile")}
//                         error={errors.mobile}
//                     />
//                     <TextField
//                         label="Email *"
//                         placeholder="Email"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.email}
//                         onChange={handleChange("email")}
//                         error={errors.email}
//                     />
//                 </Box>

//                 {/* Expiry Date & Package */}
//                 <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
//                     <TextField
//                         label="Expiry Date *"
//                         type="date"
//                         fullWidth
//                         size="small"
//                         InputLabelProps={{ shrink: true }}
//                         sx={inputStyle}
//                         value={form.expiry}
//                         onChange={handleChange("expiry")}
//                         error={errors.expiry}
//                     />
//                     <TextField
//                         label="Package Details *"
//                         placeholder="Package Details"
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.packageDetails}
//                         onChange={handleChange("packageDetails")}
//                         error={errors.packageDetails}
//                     />
//                 </Box>

//                 {/* Password Fields */}
//                 <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
//                     <TextField
//                         label="Password *"
//                         type={showPassword ? "text" : "password"}
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.password}
//                         onChange={handleChange("password")}
//                         error={errors.password}
//                         InputProps={{
//                             endAdornment: (
//                                 <InputAdornment position="end">
//                                     <IconButton onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff /> : <Eye />}</IconButton>
//                                 </InputAdornment>
//                             ),
//                         }}
//                     />
//                     <TextField
//                         label="Confirm Password *"
//                         type={showConfirmPassword ? "text" : "password"}
//                         fullWidth
//                         size="small"
//                         sx={inputStyle}
//                         value={form.confirmPassword}
//                         onChange={handleChange("confirmPassword")}
//                         error={errors.confirmPassword}
//                         InputProps={{
//                             endAdornment: (
//                                 <InputAdornment position="end">
//                                     <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
//                                         {showConfirmPassword ? <EyeOff /> : <Eye />}
//                                     </IconButton>
//                                 </InputAdornment>
//                             ),
//                         }}
//                     />
//                 </Box>

//                 {/* Submit Button */}
//                 <Box className="mt-6 flex justify-center">
//                     <Button
//                         type="submit"
//                         variant="gradient"
//                         className="flex w-full items-center justify-center gap-5 rounded bg-[#053054] px-6 py-2 text-base capitalize md:w-[384px] lg:w-[384px]"
//                     >
//                         <LogIn size={20} />
//                         <span className="font-medium">Signup</span>
//                     </Button>
//                 </Box>

//                 {/* OR Divider */}
//                 <Box
//                     mt={2}
//                     className="flex items-center justify-center text-sm"
//                 >
//                     <div className="flex-grow border-t border-gray-300" />
//                     <span className="mx-2 text-gray-500">OR</span>
//                     <div className="flex-grow border-t border-gray-300" />
//                 </Box>

//                 <Box
//                     mt={1}
//                     textAlign="center"
//                 >
//                     <span className="text-[#433C50]">Already have an account?</span>{" "}
//                     <Link
//                         to="/signin"
//                         className="text-blue-700"
//                     >
//                         Signin
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

// export default Signup;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { countries } from "country-data";
import {
    TextField,
    Snackbar,
    Alert,
    Box,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
    Autocomplete,
    createFilterOptions,
} from "@mui/material";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@material-tailwind/react";
import logo from "@/assets/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

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

    // Prepare your country list
    const countryOptions = countries.all
        .filter((country) => country.countryCallingCodes.length > 0)
        .map((country) => ({
            label: `${country.name} ${country.alpha2} ${country.countryCallingCodes[0]}`,
            code: country.countryCallingCodes[0],
            name: country.name,
            alpha2: country.alpha2,
        }));

    // Use strict matching
    const filter = createFilterOptions({
        stringify: (option) => `${option.name} ${option.alpha2} ${option.code}`,
        trim: true,
        matchFrom: "any",
    });

    // Handle form field change
    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    // Validation
    const validateFields = () => {
        let tempErrors = {};
        let hasError = false;

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
                tempErrors[field] = true;
                setLocalSnackbarMessage(`${requiredFields[field]} is required`);
                setLocalSnackbarSeverity("error");
                setSnackbarOpen(true);
                hasError = true;
                break;
            }
        }

        if (!hasError && form.mobile.length !== 10) {
            tempErrors.mobile = true;
            setLocalSnackbarMessage("Mobile number must be exactly 10 digits");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            hasError = true;
        }

        if (!hasError && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
            tempErrors.email = true;
            setLocalSnackbarMessage("Enter a valid email address");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            hasError = true;
        }

        if (!hasError && form.password !== form.confirmPassword) {
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
            const formToSend = {
                ...form,
                mobile: `${form.code} ${form.mobile}`.trim(),
            };
            dispatch(registerUser(formToSend, navigate));
        }
    };

    useEffect(() => {
        if (snackbarMessage && snackbarSeverity?.toLowerCase() === "error") {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage, snackbarSeverity]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Only run after signup when snackbar success appears
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

        // Normal login flow
        if (user?.id && user?.packageId) {
            navigate("/");
        }
    }, [isAuthenticated, snackbarMessage, snackbarSeverity]);

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
                    sx={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                >
                    <CircularProgress />
                </Box>
            )}

            <Box className="relative flex h-screen items-center justify-center bg-gray-100">
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-20 mx-auto w-44 md:top-20 md:w-60 lg:top-0 lg:w-52 xl:top-10 xl:w-60"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                />

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className="mt-[460px] w-full max-w-sm rounded bg-white p-6 shadow-md md:mt-36 md:max-w-xl lg:mt-24 lg:max-w-3xl"
                    sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3, marginTop: { lg: 20, md: 18, sm: 20 } }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        mb={3}
                        color="#053054"
                    >
                        Signup
                    </Typography>

                    <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
                        <TextField
                            label="Company Name *"
                            fullWidth
                            size="small"
                            value={form.company}
                            onChange={handleChange("company")}
                            error={errors.company}
                        />
                    </Box>

                    <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
                        <TextField
                            label="First Name *"
                            fullWidth
                            size="small"
                            value={form.firstName}
                            onChange={handleChange("firstName")}
                            error={errors.firstName}
                        />
                        <TextField
                            label="Middle Name"
                            fullWidth
                            size="small"
                            value={form.middleName}
                            onChange={handleChange("middleName")}
                        />
                        <TextField
                            label="Last Name *"
                            fullWidth
                            size="small"
                            value={form.lastName}
                            onChange={handleChange("lastName")}
                            error={errors.lastName}
                        />
                    </Box>

                    <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <Autocomplete
                                options={countryOptions}
                                filterOptions={(options, state) =>
                                    filter(options, state).filter(
                                        (opt, index, self) =>
                                            // prevent duplicates based on code (e.g., some countries share codes)
                                            index === self.findIndex((o) => o.code === opt.code),
                                    )
                                }
                                getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
                                value={countryOptions.find((option) => option.code === form.code) || null}
                                onChange={(e, newValue) => {
                                    setForm({ ...form, code: newValue?.code || "" });
                                    setErrors({ ...errors, code: false });
                                }}
                                renderOption={(props, option) => <li {...props}>{option.code}</li>}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Code *"
                                        fullWidth
                                        size="small"
                                        error={errors.code}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                sx={{ flex: 0.4 }}
                            />
                            <TextField
                                label="Mobile *"
                                fullWidth
                                size="small"
                                value={form.mobile}
                                onChange={handleChange("mobile")}
                                error={errors.mobile}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <TextField
                                label="Email *"
                                fullWidth
                                size="small"
                                value={form.email}
                                onChange={handleChange("email")}
                                error={errors.email}
                            />
                        </Box>
                    </Box>

                    <Box className="mb-4 flex flex-col gap-4 lg:flex-row lg:gap-8">
                        <TextField
                            label="Password *"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            size="small"
                            value={form.password}
                            onChange={handleChange("password")}
                            error={errors.password}
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
                    <Box className="mt-6 flex justify-center">
                        <Button
                            type="submit"
                            variant="gradient"
                            className="mt-2 flex w-full items-center justify-center gap-5 rounded bg-[#053054] py-2 text-base capitalize md:w-[384px] lg:w-[384px]"
                        >
                            <LogIn size={20} />
                            <span className="font-medium">Signup</span>
                        </Button>
                    </Box>

                    <Box
                        mt={2}
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
                        <span className="text-[#433C50]">Already have an account?</span>{" "}
                        <Link
                            to="/signin"
                            className="text-blue-700"
                        >
                            Signin
                        </Link>
                    </Box>
                </Box>

                {/* Snackbar */}
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
