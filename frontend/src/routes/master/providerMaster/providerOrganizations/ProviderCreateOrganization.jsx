import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Eye, EyeOff } from "lucide-react";
import { GoOrganization } from "react-icons/go";
import { Button } from "@material-tailwind/react";
import logo from "@/assets/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { registerUserByProvider } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

const ProviderCreateOrganization = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        company: "",
        gstin: "",
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
        
        if (
            !hasError &&
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)
        ) {
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
            dispatch(registerUserByProvider(formToSend, navigate));
        }
    };

    useEffect(() => {
      if (snackbarMessage && snackbarMessage.trim() !== "") {
          let finalMessage = snackbarMessage;
          let finalSeverity = snackbarSeverity || "success";
  
          // Force frontend success message
          if ((snackbarSeverity || "").toLowerCase() === "success") {
              finalMessage = "Organization Registered Successfully";
              finalSeverity = "success";
          }
  
          setLocalSnackbarMessage(finalMessage);
          setLocalSnackbarSeverity(finalSeverity);
          setSnackbarOpen(true);
  
          if (finalSeverity === "success") {
              setTimeout(() => {
                  navigate("/provider/settings/master/organization", {
                      state: { snackbarMessage: finalMessage, snackbarSeverity: finalSeverity },
                  });
                  // 🔹 Clear redux snackbar after navigation
                  dispatch(clearSnackbar());
              }, 1000);
          } else {
              // 🔹 Clear redux snackbar for error after showing once
              setTimeout(() => {
                  dispatch(clearSnackbar());
              }, 2000);
          }
      }
  }, [snackbarMessage, snackbarSeverity, navigate, dispatch]);  

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

            <Box className="relative -mt-10 flex h-screen items-center justify-center bg-gray-100">
                <img
                    src={logo}
                    alt="Logo"
                    className="absolute top-6 mx-auto w-44 md:w-60"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                />

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className="mt-72 w-full max-w-sm rounded bg-white p-6 shadow-md md:mt-1 md:max-w-xl lg:mt-10 lg:max-w-3xl"
                    sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}
                >
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        textAlign="center"
                        mb={3}
                        color="#053054"
                    >
                        Register
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

                    <Box className="mb-4">
                        <TextField
                            label="GSTIN No"
                            fullWidth
                            size="small"
                            value={form.gstin}
                            onChange={handleChange("gstin")}
                        />
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
                            <GoOrganization size={20} />
                            <span className="font-medium">Register Organization</span>
                        </Button>
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

export default ProviderCreateOrganization;
