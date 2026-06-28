// import React, { useEffect, useState } from "react";
// import { Button } from "@material-tailwind/react";
// import { Box, TextField, MenuItem, Snackbar, Alert, IconButton, InputAdornment, FormControlLabel, Checkbox } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff, UserPlus } from "lucide-react";

// const CreateEmployee = () => {
//     const navigate = useNavigate();
//     const [salutationsList, setSalutationsList] = useState([]);
//     const [roleList, setRoleList] = useState([]);
//     const [form, setForm] = useState({
//         salutation: "",
//         firstName: "",
//         middleName: "",
//         lastName: "",
//         mobile: "",
//         email: "",
//         password: "",
//         street: "",
//         state: "",
//         country: "",
//         city: "",
//         pincode: "",
//         reportTo: "",
//         role: "",
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [alternateAddress, setAlternateAddress] = useState({
//         street: "",
//         state: "",
//         country: "",
//         city: "",
//         pincode: "",
//     });

//     const [isSameAddress, setIsSameAddress] = useState(false);

//     useEffect(() => {
//         const storedSalutations = JSON.parse(localStorage.getItem("salutationsList")) || [];
//         setSalutationsList(storedSalutations);
//     }, []);

//     useEffect(() => {
//         const storedRole = JSON.parse(localStorage.getItem("roleList")) || [];
//         setRoleList(storedRole);
//     }, []);

//     const handleChange = (field) => (e) => {
//         setForm({ ...form, [field]: e.target.value });
//         setErrors({ ...errors, [field]: false });
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const handleSameAddressToggle = (event) => {
//         const checked = event.target.checked;
//         setIsSameAddress(checked);

//         if (checked) {
//             setAlternateAddress({
//                 street: form.street,
//                 state: form.state,
//                 country: form.country,
//                 city: form.city,
//                 pincode: form.pincode,
//             });
//         } else {
//             setAlternateAddress({
//                 street: "",
//                 state: "",
//                 country: "",
//                 city: "",
//                 pincode: "",
//             });
//         }
//     };

//     const validateFields = () => {
//         let tempErrors = {};
//         let hasError = false;

//         const fieldNames = {
//             salutation: "Salutation",
//             firstName: "First Name",
//             middleName: "Middle Name",
//             lastName: "Last Name",
//             mobile: "Mobile",
//             email: "Email",
//             password: "Password",
//             reportTo: "Report To",
//             role: "Role",
//             street: "Street",
//             state: "State",
//             country: "Country",
//             city: "City",
//             pincode: "Pincode",
//         };

//         for (const field of Object.keys(fieldNames)) {
//             if (!form[field].trim()) {
//                 tempErrors[field] = true;
//                 setErrors(tempErrors);
//                 setSnackbarMessage(`${fieldNames[field]} is required`);
//                 setSnackbarOpen(true);
//                 hasError = true;
//                 break;
//             }
//         }

//         return !hasError;
//     };

//     const handleSubmit = () => {
//         if (validateFields()) {
//             const employeeData = {
//                 salutation: form.salutation,
//                 firstName: form.firstName,
//                 middleName: form.middleName,
//                 lastName: form.lastName,
//                 mobile: form.mobile,
//                 email: form.email,
//                 password: form.password,
//                 reportTo: form.reportTo,
//                 role: form.role,
//                 permanentAddress: {
//                     street: form.street,
//                     state: form.state,
//                     country: form.country,
//                     city: form.city,
//                     pincode: form.pincode,
//                 },
//                 alternateAddress: { ...alternateAddress },
//             };

//             console.log("Submitted:", employeeData);

//             // Retrieve existing employees from localStorage
//             const existingEmployees = JSON.parse(localStorage.getItem("employee")) || [];

//             // Add new employee data to the list
//             const updatedEmployees = [...existingEmployees, employeeData];

//             // Save updated list back to localStorage
//             localStorage.setItem("employee", JSON.stringify(updatedEmployees));

//             setSnackbarMessage("Employee Created Successfully");
//             setSnackbarOpen(true);

//             setTimeout(() => {
//                 setForm({
//                     salutation: "",
//                     firstName: "",
//                     middleName: "",
//                     lastName: "",
//                     mobile: "",
//                     email: "",
//                     password: "",
//                     street: "",
//                     state: "",
//                     country: "",
//                     city: "",
//                     pincode: "",
//                     reportTo: "",
//                     role: "",
//                 });
//                 setAlternateAddress({
//                     street: "",
//                     state: "",
//                     country: "",
//                     city: "",
//                     pincode: "",
//                 });
//                 navigate("/master/employee");
//             }, 500);
//         }
//     };

//     return (
//         <>
//             <div className="card space-y-4">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Create New Employee :</div>
//                     <Button
//                         onClick={() => navigate(-1)}
//                         variant="gradient"
//                         className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                     >
//                         Back
//                     </Button>
//                 </div>

//                 <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         select
//                         label="Salutation *"
//                         value={form.salutation}
//                         onChange={handleChange("salutation")}
//                         error={errors.salutation}
//                         size="small"
//                         sx={{
//                             flex: 1,
//                         }}
//                     >
//                         {salutationsList.map((option, index) => (
//                             <MenuItem
//                                 key={index}
//                                 value={option.name}
//                             >
//                                 {option.name}
//                             </MenuItem>
//                         ))}
//                     </TextField>

//                     <TextField
//                         label="First Name *"
//                         placeholder="First Name"
//                         value={form.firstName}
//                         onChange={handleChange("firstName")}
//                         error={errors.firstName}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                     <TextField
//                         label="Middle Name *"
//                         placeholder="Middle Name"
//                         value={form.middleName}
//                         onChange={handleChange("middleName")}
//                         error={errors.middleName}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                     <TextField
//                         label="Last Name *"
//                         placeholder="Last Name"
//                         value={form.lastName}
//                         onChange={handleChange("lastName")}
//                         error={errors.lastName}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                 </Box>
//                 <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Mobile *"
//                         placeholder="+91 7385363401"
//                         value={form.mobile}
//                         onChange={handleChange("mobile")}
//                         error={errors.mobile}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 1,
//                         }}
//                     />

//                     <TextField
//                         label="Email *"
//                         placeholder="divyanshu@khodapesoftware.com"
//                         value={form.email}
//                         onChange={handleChange("email")}
//                         error={errors.email}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 1,
//                         }}
//                     />

//                     <TextField
//                         label="Password *"
//                         type={showPassword ? "text" : "password"}
//                         value={form.password}
//                         onChange={handleChange("password")}
//                         error={errors.password}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 1,
//                         }}
//                         InputProps={{
//                             endAdornment: (
//                                 <InputAdornment position="end">
//                                     <IconButton onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff /> : <Eye />}</IconButton>
//                                 </InputAdornment>
//                             ),
//                         }}
//                     />
//                 </Box>

//                 <div>
//                     <div className="gap-4 md:flex lg:flex">
//                         <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                             <p className="-mb-1 font-semibold text-[#433C50]">
//                                 Permenant Address <span className="text-red-500">*</span>
//                             </p>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Street *"
//                                     placeholder="Street"
//                                     value={form.street}
//                                     onChange={handleChange("street")}
//                                     error={errors.street}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="City *"
//                                     placeholder="City"
//                                     value={form.city}
//                                     onChange={handleChange("city")}
//                                     error={errors.city}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                                 <TextField
//                                     label="State *"
//                                     placeholder="State"
//                                     value={form.state}
//                                     onChange={handleChange("state")}
//                                     error={errors.state}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Pincode *"
//                                     placeholder="Pincode"
//                                     value={form.pincode}
//                                     onChange={handleChange("pincode")}
//                                     error={errors.pincode}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                                 <TextField
//                                     label="Country *"
//                                     placeholder="Country"
//                                     value={form.country}
//                                     onChange={handleChange("country")}
//                                     error={errors.country}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                         </div>
//                         <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                             <p className="-mb-1 mt-3 font-semibold text-[#433C50] md:mt-0 lg:mt-0">Alternate Address</p>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Street"
//                                     placeholder="Street"
//                                     value={alternateAddress.street}
//                                     onChange={(e) => setAlternateAddress({ ...alternateAddress, street: e.target.value })}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                     disabled={isSameAddress}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="City"
//                                     placeholder="City"
//                                     value={alternateAddress.city}
//                                     onChange={(e) => setAlternateAddress({ ...alternateAddress, city: e.target.value })}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                     disabled={isSameAddress}
//                                 />
//                                 <TextField
//                                     label="State"
//                                     placeholder="State"
//                                     value={alternateAddress.state}
//                                     onChange={(e) => setAlternateAddress({ ...alternateAddress, state: e.target.value })}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                     disabled={isSameAddress}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Pincode"
//                                     placeholder="Pincode"
//                                     value={alternateAddress.pincode}
//                                     onChange={(e) => setAlternateAddress({ ...alternateAddress, pincode: e.target.value })}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                     disabled={isSameAddress}
//                                 />
//                                 <TextField
//                                     label="Country"
//                                     placeholder="Country"
//                                     value={alternateAddress.country}
//                                     onChange={(e) => setAlternateAddress({ ...alternateAddress, country: e.target.value })}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                     disabled={isSameAddress}
//                                 />
//                             </Box>
//                         </div>
//                     </div>
//                     <div>
//                         <div>
//                             <FormControlLabel
//                                 control={
//                                     <Checkbox
//                                         size="small"
//                                         checked={isSameAddress}
//                                         onChange={handleSameAddressToggle}
//                                     />
//                                 }
//                                 label="Same as Alternate Address"
//                                 sx={{ color: "#433C50" }}
//                             />
//                         </div>
//                         <p className="text-xs text-[#87848d] md:text-sm lg:text-sm">
//                             Check if your permanant address is same as your alternate address
//                         </p>
//                     </div>
//                 </div>

//                 <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         select
//                         label="Role *"
//                         value={form.role}
//                         onChange={handleChange("role")}
//                         error={errors.role}
//                         size="small"
//                         sx={{
//                             flex: 1,
//                         }}
//                     >
//                         {roleList.map((option, index) => (
//                             <MenuItem
//                                 key={index}
//                                 value={option.name}
//                             >
//                                 {option.name}
//                             </MenuItem>
//                         ))}
//                     </TextField>
//                     <TextField
//                         select
//                         label="Report To *"
//                         value={form.reportTo}
//                         onChange={handleChange("reportTo")}
//                         error={errors.reportTo}
//                         size="small"
//                         sx={{
//                             flex: 1,
//                         }}
//                     >
//                         {roleList.map((option, index) => (
//                             <MenuItem
//                                 key={index}
//                                 value={option.name}
//                             >
//                                 {option.name}
//                             </MenuItem>
//                         ))}
//                     </TextField>
//                 </Box>
//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleSubmit}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <UserPlus size={20} />
//                         Create Employee
//                     </Button>
//                 </div>
//             </div>

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     onClose={handleSnackbarClose}
//                     severity={Object.values(errors).some((val) => val) ? "error" : "success"}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default CreateEmployee;

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSalutations } from "../../../redux/actions/salutation";
import { getRoles } from "../../../redux/actions/rbac";
import { getEmployees } from "../../../redux/actions/employee";
import { createEmployee } from "../../../redux/actions/employee";
import { getCountry } from "../../../redux/actions/country";
import { getCountryCode } from "../../../redux/actions/countryCode";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { Button } from "@material-tailwind/react";
import {
    Box,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    IconButton,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { usePincodeLookup } from "../../../hooks/use-pincode-lookup";

const CreateEmployee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { salutations } = useSelector((state) => state.salutation);
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);
    const { country } = useSelector((state) => state.country);
    const { countryCode } = useSelector((state) => state.countryCode);
    const [form, setForm] = useState({
        salutation: "",
        firstName: "",
        middleName: "",
        lastName: "",
        selectedPhoneCode: "+91",
        mobile: "",
        email: "",
        password: "",
        street: "",
        state: "",
        selectedCountryId: "",
        country: "",
        city: "",
        pincode: "",
        reportTo: "",
        targetAmount: "",
        role: {
            id: "",
            name: "",
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const { loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.employee);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alternateAddress, setAlternateAddress] = useState({
        street: "",
        state: "",
        country: "",
        city: "",
        pincode: "",
        selectedCountryId: "",
    });

    const [isSameAddress, setIsSameAddress] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

    const applyPermanentLocation = useCallback(
        ({ city, state, country: countryName }) => {
            const countryRecord = country.find((item) => item.country?.toLowerCase() === countryName.toLowerCase());
            setForm((prev) => ({
                ...prev,
                city,
                state,
                country: countryName,
                selectedCountryId: countryRecord?.id || prev.selectedCountryId,
            }));
            setErrors((prev) => ({ ...prev, city: false, state: false, country: false }));
        },
        [country],
    );

    const applyAlternateLocation = useCallback(
        ({ city, state, country: countryName }) => {
            const countryRecord = country.find((item) => item.country?.toLowerCase() === countryName.toLowerCase());
            setAlternateAddress((prev) => ({
                ...prev,
                city,
                state,
                country: countryName,
                selectedCountryId: countryRecord?.id || prev.selectedCountryId,
            }));
        },
        [country],
    );

    const permanentLookup = usePincodeLookup(applyPermanentLocation);
    const alternateLookup = usePincodeLookup(applyAlternateLocation);

    const { isMaxUsersError } = useSelector((state) => ({
        isMaxUsersError: state.employee.isMaxUsersError,
    }));

    useEffect(() => {
        dispatch(getSalutations());
        dispatch(getRoles());
        dispatch(getEmployees());
        dispatch(getCountry());
        dispatch(getCountryCode());
        dispatch(clearSnackbar());
    }, [dispatch]);

    useEffect(() => {
        if (form.pincode.length !== 6) return undefined;
        const timeout = setTimeout(() => permanentLookup.lookup(form.pincode), 350);
        return () => clearTimeout(timeout);
    }, [form.pincode, permanentLookup.lookup]);

    useEffect(() => {
        if (isSameAddress || alternateAddress.pincode.length !== 6) return undefined;
        const timeout = setTimeout(() => alternateLookup.lookup(alternateAddress.pincode), 350);
        return () => clearTimeout(timeout);
    }, [alternateAddress.pincode, alternateLookup.lookup, isSameAddress]);

    useEffect(() => {
        if (justSubmitted && snackbarMessage) {
            if (snackbarMessage) {
                setSnackbarOpen(true);
            }
            if (snackbarSeverity === "success") {
                setForm({
                    salutation: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    selectedPhoneCode: "",
                    mobile: "",
                    email: "",
                    password: "",
                    street: "",
                    state: "",
                    selectedCountryId: "",
                    country: "",
                    city: "",
                    pincode: "",
                    reportTo: "",
                    targetAmount: "",
                    role: {
                        id: "",
                        name: "",
                    },
                });
                setAlternateAddress({
                    street: "",
                    state: "",
                    country: "",
                    city: "",
                    pincode: "",
                });

                if (snackbarSeverity === "success") {
                    setTimeout(() => {
                        setJustSubmitted(false);
                        dispatch(clearSnackbar());
                        navigate("/settings/master/employee");
                    }, 800);
                }
            } else {
                setJustSubmitted(false);
            }
        }
    }, [snackbarMessage, snackbarSeverity, justSubmitted, navigate, dispatch]);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    const getRoleAncestors = (roleId, allRoles) => {
        let ancestors = [];
        let currentRole = allRoles.find((r) => r.id === roleId);

        while (currentRole && currentRole.parentRoleId) {
            const parent = allRoles.find((r) => r.id === currentRole.parentRoleId);
            if (parent) {
                ancestors.push(parent);
                currentRole = parent;
            } else {
                break;
            }
        }

        return ancestors;
    };

    const getReportToOptions = () => {
        const selectedRole = roles.find((r) => r.name === form.role?.name);
        if (!selectedRole) return [];

        const ancestors = getRoleAncestors(selectedRole.id, roles);

        // Get employees whose role is in any ancestor role
        return employees.filter((emp) => ancestors.some((a) => a.id === emp.role_id));
    };

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");

        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    useEffect(() => {
        if (isMaxUsersError && snackbarMessage) {
            // Close the snackbar first
            setSnackbarOpen(false);
            // Open confirmation modal
            setConfirmationModalOpen(true);
            // Clear the error from reducer
            dispatch(clearSnackbar());
        }
    }, [isMaxUsersError, snackbarMessage, dispatch]);

    const handleUpgradeConfirm = () => {
        setConfirmationModalOpen(false);
        navigate("/choose-package");
    };

    const handleUpgradeCancel = () => {
        setConfirmationModalOpen(false);
        // Optional: Reset form or show a message
        setLocalSnackbarMessage("You can continue working with existing employees");
        setLocalSnackbarSeverity("info");
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleSameAddressToggle = (event) => {
        const checked = event.target.checked;
        setIsSameAddress(checked);

        if (checked) {
            setAlternateAddress({
                street: form.street,
                state: form.state,
                country: form.country,
                city: form.city,
                pincode: form.pincode,
                selectedCountryId: form.selectedCountryId,
            });
        } else {
            setAlternateAddress({
                street: "",
                state: "",
                country: "",
                city: "",
                pincode: "",
                selectedCountryId: "",
            });
        }
    };

    const validateFields = () => {
        const fieldNames = {
            salutation: "Salutation",
            firstName: "First Name",
            middleName: "Middle Name",
            lastName: "Last Name",
            mobile: "Mobile",
            email: "Email",
            password: "Password",
            street: "Street",
            city: "City",
            state: "State",
            pincode: "Pincode",
            country: "Country",
            role: "Role",
            reportTo: "Report To",
        };

        let tempErrors = {};
        for (const field of Object.keys(fieldNames)) {
            const value = form[field];

            const isInvalid = value === undefined || value === null || value === "" || (typeof value === "object" && Object.keys(value).length === 0);

            if (isInvalid) {
                tempErrors[field] = true;
                setErrors(tempErrors);
                setLocalSnackbarMessage(`${fieldNames[field]} is required`);
                setLocalSnackbarSeverity("error");
                setSnackbarOpen(true);
                return false;
            }
        }

        // ---------- MOBILE VALIDATION ----------
        if (!/^[0-9]{10}$/.test(form.mobile)) {
            tempErrors.mobile = true;
            setErrors(tempErrors);
            setLocalSnackbarMessage("Mobile number must be exactly 10 digits");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        // ---------- EMAIL VALIDATION ----------
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
            tempErrors.email = true;
            setErrors(tempErrors);
            setLocalSnackbarMessage("Enter a valid email address");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateFields()) {
            setJustSubmitted(true);
            const employeeData = {
                salutation: form.salutation,
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                mobile: `${form.selectedPhoneCode} ${form.mobile}`.trim(),
                email: form.email,
                password: form.password,
                reportTo: form.reportTo,
                role: form.role,
                permanentAddress: {
                    street: form.street,
                    state: form.state,
                    country: form.country,
                    city: form.city,
                    pincode: form.pincode,
                },
                alternateAddress: { ...alternateAddress },
                targetAmount: form.targetAmount,
            };
            const employeeTargetKey = form.email ? `crm:employee-target:${form.email.toLowerCase()}` : "";
            if (employeeTargetKey) {
                localStorage.setItem(employeeTargetKey, String(form.targetAmount || 0));
            }

            dispatch(createEmployee(employeeData));
        }
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-4">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Create New Employee :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>

                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <TextField
                            select
                            label="Salutation *"
                            value={form.salutation}
                            onChange={handleChange("salutation")}
                            error={errors.salutation}
                            size="small"
                            sx={{ flex: 1 }}
                        >
                            {salutations.map((option) => (
                                <MenuItem
                                    key={option.id}
                                    value={option.salutation}
                                >
                                    {option.salutation}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="First Name *"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange("firstName")}
                            error={errors.firstName}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                        <TextField
                            label="Middle Name *"
                            placeholder="Middle Name"
                            value={form.middleName}
                            onChange={handleChange("middleName")}
                            error={errors.middleName}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                        <TextField
                            label="Last Name *"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange("lastName")}
                            error={errors.lastName}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                    </Box>
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        {/* Code + Mobile group (always in a row) */}
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <Autocomplete
                                options={countryCode.map((item) => item.phoneCode)}
                                value={form.selectedPhoneCode || ""}
                                onChange={(_, newValue) => {
                                    const selectedCode = countryCode.find((c) => c.phoneCode === newValue);
                                    const matchedCountry = country.find((c) => c.id === selectedCode?.countryId);

                                    setForm({
                                        ...form,
                                        selectedPhoneCode: newValue || "",
                                        selectedCountryId: matchedCountry?.id || "",
                                        country: matchedCountry?.country || "",
                                    });
                                    setErrors({ ...errors, country: false });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Code"
                                        size="small"
                                    />
                                )}
                                sx={{ flex: 0.4 }}
                            />

                            <TextField
                                label="Mobile *"
                                placeholder="7385363401"
                                value={form.mobile}
                                onChange={handleChange("mobile")}
                                error={errors.mobile}
                                fullWidth
                                size="small"
                                sx={{
                                    flex: 1,
                                }}
                            />
                        </Box>

                        {/* Email + Password group (stacked on mobile/md, side by side on lg) */}
                        <Box className="flex w-full flex-col gap-4 lg:flex-1 lg:flex-row">
                            <TextField
                                label="Email *"
                                placeholder="divyanshu@khodapesoftware.com"
                                value={form.email}
                                onChange={handleChange("email")}
                                error={errors.email}
                                fullWidth
                                size="small"
                                sx={{
                                    flex: 1,
                                }}
                            />
                            <TextField
                                label="Password *"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange("password")}
                                error={errors.password}
                                fullWidth
                                size="small"
                                sx={{
                                    flex: 1,
                                }}
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
                        </Box>
                    </Box>

                    <div>
                        <div className="gap-4 md:flex lg:flex">
                            <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                                <p className="-mb-1 font-semibold text-[#433C50]">
                                    Permenant Address <span className="text-red-500">*</span>
                                </p>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Street *"
                                        placeholder="Street"
                                        value={form.street}
                                        onChange={handleChange("street")}
                                        error={errors.street}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="City *"
                                        placeholder="City"
                                        value={form.city}
                                        onChange={handleChange("city")}
                                        error={errors.city}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                    <TextField
                                        label="State *"
                                        placeholder="State"
                                        value={form.state}
                                        onChange={handleChange("state")}
                                        error={errors.state}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Pincode *"
                                        placeholder="Pincode"
                                        value={form.pincode}
                                        onChange={(event) => handleChange("pincode")({ target: { value: event.target.value.replace(/\D/g, "").slice(0, 6) } })}
                                        error={errors.pincode}
                                        helperText={permanentLookup.error || (permanentLookup.loading ? "Finding city, state and country..." : "Location fills automatically at 6 digits")}
                                        InputProps={{
                                            endAdornment: permanentLookup.loading ? <CircularProgress size={18} /> : null,
                                        }}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                    <Autocomplete
                                        options={country}
                                        getOptionLabel={(option) => option.country}
                                        value={country.find((c) => c.id === form.selectedCountryId) || null}
                                        onChange={(_, newValue) => {
                                            if (!newValue) return;
                                            const matchedCode = countryCode.find((c) => c.countryId === newValue.id);
                                            setForm({
                                                ...form,
                                                selectedCountryId: newValue.id,
                                                country: newValue.country,
                                                selectedPhoneCode: matchedCode?.phoneCode || "",
                                            });
                                            setErrors({ ...errors, country: false });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Country *"
                                                size="small"
                                                error={errors.country}
                                            />
                                        )}
                                        sx={{ flex: 2 }}
                                    />
                                </Box>
                            </div>
                            <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                                <p className="-mb-1 mt-3 font-semibold text-[#433C50] md:mt-0 lg:mt-0">Alternate Address</p>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Street"
                                        placeholder="Street"
                                        value={alternateAddress.street}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, street: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="City"
                                        placeholder="City"
                                        value={alternateAddress.city}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, city: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                    <TextField
                                        label="State"
                                        placeholder="State"
                                        value={alternateAddress.state}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, state: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Pincode"
                                        placeholder="Pincode"
                                        value={alternateAddress.pincode}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                                        helperText={alternateLookup.error || (alternateLookup.loading ? "Finding city, state and country..." : "Location fills automatically at 6 digits")}
                                        InputProps={{
                                            endAdornment: alternateLookup.loading ? <CircularProgress size={18} /> : null,
                                        }}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                    <Autocomplete
                                        options={country}
                                        getOptionLabel={(option) => option.country}
                                        value={country.find((c) => c.id === alternateAddress.selectedCountryId) || null}
                                        onChange={(_, newValue) => {
                                            setAlternateAddress((prev) => ({
                                                ...prev,
                                                selectedCountryId: newValue?.id || "",
                                                country: newValue?.country || "",
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Country"
                                                size="small"
                                            />
                                        )}
                                        sx={{ flex: 2 }}
                                        disabled={isSameAddress}
                                    />
                                </Box>
                            </div>
                        </div>
                        <div>
                            <div>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={isSameAddress}
                                            onChange={handleSameAddressToggle}
                                        />
                                    }
                                    label="Same as Permanant Address"
                                    sx={{ color: "#433C50" }}
                                />
                            </div>
                            <p className="text-xs text-[#87848d] md:text-sm lg:text-sm">
                                Check if your permanant address is same as your alternate address
                            </p>
                        </div>
                    </div>

                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <Autocomplete
                            options={roles.filter((r) => r.name !== "Super Admin")}
                            getOptionLabel={(option) => option.name}
                            value={roles.find((r) => r.name === form.role.name) || null}
                            onChange={(_, newValue) => {
                                setForm({
                                    ...form,
                                    role: {
                                        id: newValue?.id || "",
                                        name: newValue?.name || "",
                                    },
                                });
                                setErrors({ ...errors, role: false });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Role *"
                                    size="small"
                                    error={errors.role}
                                />
                            )}
                            sx={{ flex: 1 }}
                        />

                        <Autocomplete
                            options={getReportToOptions()}
                            getOptionLabel={(option) => formatEmployeeName(option)}
                            value={getReportToOptions().find((emp) => emp.id === form.reportTo) || null}
                            onChange={(_, newValue) => {
                                setForm({ ...form, reportTo: newValue?.id || "" });
                                setErrors({ ...errors, reportTo: false });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Report To *"
                                    size="small"
                                    error={errors.reportTo}
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
                    </Box>
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <TextField
                            label="Target Amount"
                            placeholder="Set employee target"
                            type="number"
                            value={form.targetAmount}
                            onChange={handleChange("targetAmount")}
                            fullWidth
                            size="small"
                            helperText="This target will be used for target achievement analytics."
                            sx={{ flex: 1 }}
                        />
                    </Box>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <UserPlus size={20} />
                            Create Employee
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                open={confirmationModalOpen}
                onClose={handleUpgradeCancel}
                onConfirm={handleUpgradeConfirm}
                title="Upgrade Required"
                message="You've reached the maximum number of users for your current package. Would you like to upgrade to add more users?"
                confirmText="Yes, Upgrade Now"
                cancelText="Cancel"
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
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

export default CreateEmployee;
