// import { Button } from "@material-tailwind/react";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { TextField, InputAdornment, Box, MenuItem, Snackbar, Alert, Chip, Checkbox, FormControlLabel } from "@mui/material";
// import { Search, UserRound } from "lucide-react";

// const CreateCustomer = () => {
//     const navigate = useNavigate();

//     const [salutationsList, setSalutationsList] = useState([]);
//     const [employeesList, setEmployeesList] = useState([]);
//     const [assignedToOpen, setAssignedToOpen] = useState(false);
//     const [form, setForm] = useState({
//         assignedTo: [],
//         salutation: "",
//         firstName: "",
//         middleName: "",
//         lastName: "",
//         companyName: "",
//         gstinNo: "",
//         mobile: "",
//         email: "",
//         customerCategory: "",
//         industry: "",
//         billingStreet: "",
//         billingCity: "",
//         billingState: "",
//         billingPincode: "",
//         billingCountry: "",
//         shippingStreet: "",
//         shippingCity: "",
//         shippingState: "",
//         shippingPincode: "",
//         shippingCountry: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");

//     useEffect(() => {
//         const storedSalutations = JSON.parse(localStorage.getItem("salutationsList")) || [];
//         setSalutationsList(storedSalutations);
//     }, []);

//     useEffect(() => {
//         const storedEmployees = JSON.parse(localStorage.getItem("employee")) || [];

//         const formattedEmployees = storedEmployees.map((emp) => ({
//             ...emp,
//             fullName: `${emp.salutation || ""} ${emp.firstName || ""} ${emp.middleName || ""} ${emp.lastName || ""}`.trim().replace(/\s+/g, " "),
//         }));

//         setEmployeesList(formattedEmployees);
//     }, []);

//     const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

//     const handleChange = (field) => (e) => {
//         const value = field === "assignedTo" ? e.target.value : e.target.value;
//         setForm({ ...form, [field]: value });
//         setErrors({ ...errors, [field]: false });
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const validateFields = () => {
//         let tempErrors = {};
//         let hasError = false;

//         const fieldNames = {
//             assignedTo: "Assigned To",
//             salutation: "Salutation",
//             firstName: "First Name",
//             lastName: "Last Name",
//             companyName: "Company Name",
//             gstinNo: "GSTIN No",
//             email: "Email",
//             mobile: "Mobile",
//             customerCategory: "Customer Category",
//             industry: "Industry",
//         };

//         for (const field of Object.keys(fieldNames)) {
//             const value = form[field];

//             // Separate validation for array vs string fields
//             if ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && !value?.trim())) {
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
//             const customerCoreData = {
//                 salutation: form.salutation,
//                 firstName: form.firstName,
//                 middleName: form.middleName,
//                 lastName: form.lastName,
//                 mobile: form.mobile,
//                 email: form.email,
//                 customerCategory: form.customerCategory,
//                 industry: form.industry,
//             };

//             const companyName = form.companyName.trim();

//             const companyWrapper = {
//                 companyName: companyName,
//                 gstinNo: form.gstinNo,
//                 assignedTo: form.assignedTo,
//                 billingAddress: {
//                     street: form.billingStreet,
//                     city: form.billingCity,
//                     state: form.billingState,
//                     pincode: form.billingPincode,
//                     country: form.billingCountry,
//                 },
//                 shippingAddress: {
//                     street: form.shippingStreet,
//                     city: form.shippingCity,
//                     state: form.shippingState,
//                     pincode: form.shippingPincode,
//                     country: form.shippingCountry,
//                 },
//                 customers: [customerCoreData],
//             };

//             const existingData = JSON.parse(localStorage.getItem("customer")) || [];

//             const existingCompanyIndex = existingData.findIndex((c) => c.companyName === companyName);

//             if (existingCompanyIndex !== -1) {
//                 // Company already exists: push new customer to existing company's customer array
//                 existingData[existingCompanyIndex].customers.push(customerCoreData);
//             } else {
//                 // New company: push new company data
//                 existingData.push(companyWrapper);
//             }

//             localStorage.setItem("customer", JSON.stringify(existingData));

//             // Show only the latest saved company structure in console
//             const latestCompany = existingData.find((c) => c.companyName === companyName);
//             console.log(latestCompany);

//             setSnackbarMessage("Customer Created Successfully");
//             setSnackbarOpen(true);

//             setTimeout(() => {
//                 setForm({
//                     assignedTo: [],
//                     salutation: "",
//                     firstName: "",
//                     middleName: "",
//                     lastName: "",
//                     companyName: "",
//                     gstinNo: "",
//                     mobile: "",
//                     email: "",
//                     customerCategory: "",
//                     industry: "",
//                     billingStreet: "",
//                     billingCity: "",
//                     billingState: "",
//                     billingPincode: "",
//                     billingCountry: "",
//                     shippingStreet: "",
//                     shippingCity: "",
//                     shippingState: "",
//                     shippingPincode: "",
//                     shippingCountry: "",
//                 });
//                 navigate("/customer");
//             }, 500);
//         }
//     };

//     const handleChipDelete = (chipToDelete) => {
//         setForm((prevForm) => ({
//             ...prevForm,
//             assignedTo: prevForm.assignedTo.filter((name) => name !== chipToDelete),
//         }));
//     };

//     const handleAssignedToChange = (e) => {
//         const value = e.target.value;

//         // Update the form
//         setForm((prev) => ({
//             ...prev,
//             assignedTo: value,
//         }));

//         // Clear any error
//         setErrors((prev) => ({
//             ...prev,
//             assignedTo: false,
//         }));

//         // Close the dropdown
//         setAssignedToOpen(false);
//     };

//     return (
//         <>
//             <div className="card space-y-2">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Create New Customer :</div>
//                     <Button
//                         onClick={() => navigate(-1)}
//                         variant="gradient"
//                         className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                     >
//                         Back
//                     </Button>
//                 </div>
//                 <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
//                     {/* Search Label and Field */}
//                     <div className="flex items-center gap-2">
//                         <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Mobile No :</div>
//                         <TextField
//                             variant="outlined"
//                             placeholder="Search..."
//                             size="small"
//                             InputProps={{
//                                 endAdornment: (
//                                     <InputAdornment position="end">
//                                         <Search className="cursor-pointer text-gray-500" />
//                                     </InputAdornment>
//                                 ),
//                             }}
//                             className="w-64"
//                         />
//                     </div>
//                     <Box className="flex w-full flex-col gap-4 md:w-full lg:w-[27.5%] lg:flex-row">
//                         <TextField
//                             select
//                             SelectProps={{
//                                 multiple: true,
//                                 open: assignedToOpen,
//                                 onOpen: () => setAssignedToOpen(true),
//                                 onClose: () => setAssignedToOpen(false),
//                                 renderValue: (selected) => (
//                                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                                         {selected.map((value) => (
//                                             <Chip
//                                                 key={value}
//                                                 label={value}
//                                                 onMouseDown={(e) => e.stopPropagation()}
//                                                 onDelete={() => handleChipDelete(value)}
//                                                 clickable
//                                             />
//                                         ))}
//                                     </Box>
//                                 ),
//                             }}
//                             label="Assigned To *"
//                             value={form.assignedTo}
//                             onChange={handleAssignedToChange}
//                             error={errors.assignedTo}
//                             size="small"
//                             sx={{ flex: 2 }}
//                         >
//                             {employeesList.map((option, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={option.fullName}
//                                 >
//                                     {option.fullName}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </Box>
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
//                         label="Middle Name "
//                         placeholder="Middle Name"
//                         value={form.middleName}
//                         onChange={handleChange("middleName")}
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
//                         label="Company Name *"
//                         placeholder="Company Name"
//                         value={form.companyName}
//                         onChange={handleChange("companyName")}
//                         error={errors.companyName}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                     <TextField
//                         label="GSTIN No *"
//                         placeholder="GSTIN Number"
//                         value={form.gstinNo}
//                         onChange={handleChange("gstinNo")}
//                         error={errors.gstinNo}
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
//                         placeholder="Mobile"
//                         value={form.mobile}
//                         onChange={handleChange("mobile")}
//                         error={errors.mobile}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                     <TextField
//                         label="Email *"
//                         placeholder="Email"
//                         value={form.email}
//                         onChange={handleChange("email")}
//                         error={errors.email}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                 </Box>
//                 <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Customer Category *"
//                         placeholder="Customer Category"
//                         value={form.customerCategory}
//                         onChange={handleChange("customerCategory")}
//                         error={errors.customerCategory}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                     <TextField
//                         label="Industry *"
//                         placeholder="Industry"
//                         value={form.industry}
//                         onChange={handleChange("industry")}
//                         error={errors.industry}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                 </Box>
//                 <div className="gap-4 md:flex lg:flex">
//                     <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                         <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Street"
//                                 placeholder="Street"
//                                 value={form.billingStreet}
//                                 onChange={handleChange("billingStreet")}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="City"
//                                 placeholder="City"
//                                 value={form.billingCity}
//                                 onChange={handleChange("billingCity")}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                             <TextField
//                                 label="State"
//                                 placeholder="State"
//                                 value={form.billingState}
//                                 onChange={handleChange("billingState")}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Pincode"
//                                 placeholder="Pincode"
//                                 value={form.billingPincode}
//                                 onChange={handleChange("billingPincode")}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                             <TextField
//                                 label="Country"
//                                 placeholder="Country"
//                                 value={form.billingCountry}
//                                 onChange={handleChange("billingCountry")}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                         </Box>
//                     </div>
//                     <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                         <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Street"
//                                 placeholder="Street"
//                                 value={form.shippingStreet}
//                                 onChange={handleChange("shippingStreet")}
//                                 fullWidth
//                                 size="small"
//                                 disabled={copyBillingToShipping}
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="City"
//                                 placeholder="City"
//                                 value={form.shippingCity}
//                                 onChange={handleChange("shippingCity")}
//                                 fullWidth
//                                 size="small"
//                                 disabled={copyBillingToShipping}
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                             <TextField
//                                 label="State"
//                                 placeholder="State"
//                                 value={form.shippingState}
//                                 onChange={handleChange("shippingState")}
//                                 fullWidth
//                                 size="small"
//                                 disabled={copyBillingToShipping}
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Pincode"
//                                 placeholder="Pincode"
//                                 value={form.shippingPincode}
//                                 onChange={handleChange("shippingPincode")}
//                                 fullWidth
//                                 size="small"
//                                 disabled={copyBillingToShipping}
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                             <TextField
//                                 label="Country"
//                                 placeholder="Country"
//                                 value={form.shippingCountry}
//                                 onChange={handleChange("shippingCountry")}
//                                 fullWidth
//                                 size="small"
//                                 disabled={copyBillingToShipping}
//                                 sx={{
//                                     flex: 2,
//                                 }}
//                             />
//                         </Box>
//                     </div>
//                 </div>
//                     <FormControlLabel
//                         control={
//                             <Checkbox
//                                 checked={copyBillingToShipping}
//                                 onChange={(e) => {
//                                     const checked = e.target.checked;
//                                     setCopyBillingToShipping(checked);

//                                     if (checked) {
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             shippingStreet: prev.billingStreet,
//                                             shippingCity: prev.billingCity,
//                                             shippingState: prev.billingState,
//                                             shippingPincode: prev.billingPincode,
//                                             shippingCountry: prev.billingCountry,
//                                         }));
//                                     } else {
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             shippingStreet: "",
//                                             shippingCity: "",
//                                             shippingState: "",
//                                             shippingPincode: "",
//                                             shippingCountry: "",
//                                         }));
//                                     }
//                                 }}
//                             />
//                         }
//                         label="Shipping address is same as billing address"
//                     />
//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleSubmit}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <UserRound size={20} />
//                         Create Customer
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

// export default CreateCustomer;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getSalutations } from "../../../redux/actions/salutation";
// import { getCustomerCategory } from "../../../redux/actions/customerCategory";
// import { getIndustry } from "../../../redux/actions/industry";
// import { getEmployees } from "../../../redux/actions/employee";
// import { getCountry } from "../../../redux/actions/country";
// import { getCountryCode } from "../../../redux/actions/countryCode";
// import { getLeadSource } from "../../../redux/actions/leadSource";
// import { getRoles } from "../../../redux/actions/rbac";
// import { createCustomer, getCustomers } from "../../../redux/actions/customer";
// import { clearSnackbar } from "../../../redux/actions/commonActions";
// import { TextField, InputAdornment, Box, Snackbar, Alert, Chip, Checkbox, FormControlLabel, Autocomplete, CircularProgress } from "@mui/material";
// import { Button } from "@material-tailwind/react";
// import { useNavigate } from "react-router-dom";
// import { Search, UserRound } from "lucide-react";

// const CreateEnquiry = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const user = JSON.parse(localStorage.getItem("user") || "{}");

//     const [form, setForm] = useState({
//         assignedTo: user?.id ? [user] : [],
//         salutation: "",
//         firstName: "",
//         middleName: "",
//         lastName: "",
//         companyName: "",
//         gstinNo: "",
//         selectedPhoneCode: "+91",
//         mobile: "",
//         email: "",
//         customerCategory: "",
//         industry: "",
//         designation: "",
//         leadSource: "",
//         billingStreet: "",
//         billingCity: "",
//         billingState: "",
//         billingPincode: "",
//         selectedBillingCountryId: "",
//         billingCountry: "",
//         shippingStreet: "",
//         shippingCity: "",
//         shippingState: "",
//         shippingPincode: "",
//         selectedShippingCountryId: "",
//         shippingCountry: "",
//     });
//     const [justSubmitted, setJustSubmitted] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
//     const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
//     const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);
//     const { loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.customer);
//     const { salutations } = useSelector((state) => state.salutation);
//     const { customerCategory } = useSelector((state) => state.customerCategory);
//     const { industry } = useSelector((state) => state.industry);
//     const { employees } = useSelector((state) => state.employee);
//     const { country } = useSelector((state) => state.country);
//     const { countryCode } = useSelector((state) => state.countryCode);
//     const { roles } = useSelector((state) => state.rbac);
//     const { leadSource } = useSelector((state) => state.leadSource);

//     useEffect(() => {
//         dispatch(clearSnackbar());
//         dispatch(getSalutations());
//         dispatch(getCustomerCategory());
//         dispatch(getIndustry());
//         dispatch(getLeadSource());
//         dispatch(getEmployees());
//         dispatch(getCountry());
//         dispatch(getCountryCode());
//         dispatch(getCustomers());
//         dispatch(getRoles());
//     }, [dispatch]);

//     useEffect(() => {
//         if (justSubmitted && snackbarMessage) {
//             setSnackbarOpen(true);

//             if (snackbarSeverity === "success" && snackbarMessage === "Enquiry created successfully") {
//                 // ✅ Reset the form
//                 setForm({
//                     assignedTo: [],
//                     salutation: "",
//                     firstName: "",
//                     middleName: "",
//                     lastName: "",
//                     companyName: "",
//                     gstinNo: "",
//                     selectedPhoneCode: "",
//                     mobile: "",
//                     email: "",
//                     customerCategory: "",
//                     industry: "",
//                     designation: "",
//                     billingStreet: "",
//                     billingCity: "",
//                     billingState: "",
//                     billingPincode: "",
//                     selectedBillingCountryId: "",
//                     billingCountry: "",
//                     shippingStreet: "",
//                     shippingCity: "",
//                     shippingState: "",
//                     shippingPincode: "",
//                     selectedShippingCountryId: "",
//                     shippingCountry: "",
//                 });

//                 setTimeout(() => {
//                     setJustSubmitted(false);
//                     dispatch(clearSnackbar());
//                     navigate("/enquiry");
//                 }, 1000);
//             } else {
//                 // For error case, just reset the flag
//                 setJustSubmitted(false);
//             }
//         }
//     }, [snackbarMessage, snackbarSeverity, justSubmitted, dispatch, navigate]);

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//         setTimeout(() => {
//             setLocalSnackbarMessage("");
//             dispatch(clearSnackbar());
//         }, 100);
//     };

//     const formatEmployeeName = (emp) => {
//         const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
//         const fullName = parts.filter((part) => part && part.trim()).join(" ");
//         const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
//         return `${fullName} (${roleName})`;
//     };

//     const handleChange = (field) => (e) => {
//         const value = e.target.value;
//         setForm({ ...form, [field]: value });
//         setErrors({ ...errors, [field]: false });
//     };

//     const validateFields = () => {
//         let tempErrors = {};
//         let hasError = false;

//         const fieldNames = {
//             assignedTo: "Assigned To",
//             salutation: "Salutation",
//             firstName: "First Name",
//             lastName: "Last Name",
//             selectedPhoneCode: "Phone Code",
//             mobile: "Mobile",
//             email: "Email",
//             customerCategory: "Customer Category",
//             industry: "Industry",
//             leadSource: "Lead Source",
//         };

//         // ---------- REQUIRED FIELDS CHECK ----------
//         for (const field of Object.keys(fieldNames)) {
//             const value = form[field];
//             if ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && !value?.trim())) {
//                 tempErrors[field] = true;
//                 setErrors(tempErrors);
//                 setLocalSnackbarMessage(`${fieldNames[field]} is required`);
//                 setLocalSnackbarSeverity("error");
//                 setSnackbarOpen(true);
//                 hasError = true;
//                 break;
//             }
//         }

//         // Stop further checks if required fields failed
//         if (hasError) return false;

//         // ---------- MOBILE VALIDATION ----------
//         if (!/^[0-9]{10}$/.test(form.mobile)) {
//             tempErrors.mobile = true;
//             setErrors(tempErrors);
//             setLocalSnackbarMessage("Mobile number must be exactly 10 digits");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         // ---------- EMAIL VALIDATION ----------
//         if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
//             tempErrors.email = true;
//             setErrors(tempErrors);
//             setLocalSnackbarMessage("Enter a valid email address");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         return true;
//     };

//     const handleSubmit = () => {
//         if (!validateFields()) return;

//         setJustSubmitted(true); // ✅ Important

//         const dataToSend = {
//             salutation: form.salutation,
//             firstName: form.firstName,
//             middleName: form.middleName,
//             lastName: form.lastName,
//             mobile: `${form.selectedPhoneCode} ${form.mobile}`.trim(),
//             email: form.email,
//             customerCategory: form.customerCategory,
//             industry: form.industry,
//             designation: form.designation,
//             leadSource: form.leadSource,
//             companyName: form.companyName.trim(),
//             gstinNo: form.gstinNo,
//             assignedTo: form.assignedTo.map((emp) => emp.id),
//             billingStreet: form.billingStreet,
//             billingCity: form.billingCity,
//             billingState: form.billingState,
//             billingPincode: form.billingPincode,
//             billingCountry: form.billingCountry,
//             shippingStreet: form.shippingStreet,
//             shippingCity: form.shippingCity,
//             shippingState: form.shippingState,
//             shippingPincode: form.shippingPincode,
//             shippingCountry: form.shippingCountry,
//         };

//         dispatch(createCustomer(dataToSend));
//     };

//     return (
//         <>
//             {loading ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="card space-y-2">
//                     <div className="flex items-center justify-between text-nowrap">
//                         <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Create New Enquiry :</div>
//                         <Button
//                             onClick={() => navigate(-1)}
//                             variant="gradient"
//                             className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                         >
//                             Back
//                         </Button>
//                     </div>
//                     <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
//                         {/* Search Label and Field */}
//                         <div className="flex items-center gap-2">
//                             <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Mobile No :</div>
//                             <TextField
//                                 variant="outlined"
//                                 placeholder="Search..."
//                                 size="small"
//                                 InputProps={{
//                                     endAdornment: (
//                                         <InputAdornment position="end">
//                                             <Search className="cursor-pointer text-gray-500" />
//                                         </InputAdornment>
//                                     ),
//                                 }}
//                                 className="w-64"
//                             />
//                         </div>
//                         <Box className="flex flex-col gap-4 lg:flex-row">
//                             {/* <Autocomplete
//                                 multiple
//                                 disableCloseOnSelect
//                                 options={employees}
//                                 getOptionLabel={(option) => formatEmployeeName(option)}
//                                 value={form.assignedTo}
//                                 onChange={(e, newValue) => {
//                                     setForm((prev) => ({
//                                         ...prev,
//                                         assignedTo: newValue,
//                                     }));
//                                     setErrors((prev) => ({
//                                         ...prev,
//                                         assignedTo: false,
//                                     }));
//                                 }}
//                                 renderTags={(value, getTagProps) =>
//                                     value.map((option, index) => {
//                                         const label = formatEmployeeName(option);
//                                         const { key, ...tagProps } = getTagProps({ index });

//                                         return (
//                                             <Chip
//                                                 key={key}
//                                                 variant="outlined"
//                                                 label={label}
//                                                 {...tagProps}
//                                             />
//                                         );
//                                     })
//                                 }
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Assigned To *"
//                                         error={errors.assignedTo}
//                                         size="small"
//                                     />
//                                 )}
//                                 className="w-full md:w-64 lg:w-96"
//                             /> */}
//                             <Autocomplete
//                                 multiple
//                                 disableCloseOnSelect
//                                 options={employees.filter((emp) => !form.assignedTo.some((selected) => selected.id === emp.id))}
//                                 getOptionLabel={(option) => formatEmployeeName(option)}
//                                 value={form.assignedTo}
//                                 onChange={(e, newValue) => {
//                                     setForm((prev) => ({
//                                         ...prev,
//                                         assignedTo: newValue || [], // newValue can be null sometimes
//                                     }));
//                                     setErrors((prev) => ({
//                                         ...prev,
//                                         assignedTo: false,
//                                     }));
//                                 }}
//                                 isOptionEqualToValue={(option, value) => option.id === value.id}
//                                 renderTags={(value, getTagProps) =>
//                                     value.map((option, index) => {
//                                         const label = formatEmployeeName(option);
//                                         const { key, ...tagProps } = getTagProps({ index });

//                                         return (
//                                             <Chip
//                                                 key={key}
//                                                 variant="outlined"
//                                                 label={label}
//                                                 {...tagProps}
//                                             />
//                                         );
//                                     })
//                                 }
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Assigned To *"
//                                         error={!!errors.assignedTo}
//                                         size="small"
//                                     />
//                                 )}
//                                 className="w-full md:w-64 lg:w-96"
//                                 loading={loading} // optional: if employees are loading
//                                 LoadingIndicator={
//                                     <CircularProgress
//                                         color="inherit"
//                                         size={20}
//                                     />
//                                 }
//                             />
//                         </Box>
//                     </div>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <Autocomplete
//                             options={salutations.map((option) => option.salutation)}
//                             value={form.salutation || null}
//                             onChange={(e, newValue) => {
//                                 setForm((prev) => ({
//                                     ...prev,
//                                     salutation: newValue || "",
//                                 }));
//                                 setErrors((prev) => ({
//                                     ...prev,
//                                     salutation: false,
//                                 }));
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Salutation *"
//                                     error={errors.salutation}
//                                     size="small"
//                                 />
//                             )}
//                             sx={{ flex: 1 }}
//                         />
//                         <TextField
//                             label="First Name *"
//                             placeholder="First Name"
//                             value={form.firstName}
//                             onChange={handleChange("firstName")}
//                             error={errors.firstName}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                         <TextField
//                             label="Middle Name "
//                             placeholder="Middle Name"
//                             value={form.middleName}
//                             onChange={handleChange("middleName")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                         <TextField
//                             label="Last Name *"
//                             placeholder="Last Name"
//                             value={form.lastName}
//                             onChange={handleChange("lastName")}
//                             error={errors.lastName}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Company Name"
//                             placeholder="Company Name"
//                             value={form.companyName}
//                             onChange={handleChange("companyName")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                         <TextField
//                             label="GSTIN No"
//                             placeholder="GSTIN Number"
//                             value={form.gstinNo}
//                             onChange={handleChange("gstinNo")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         {/* Code + Mobile group (always in a row) */}
//                         <Box className="flex w-full flex-row gap-4 lg:flex-1">
//                             <Autocomplete
//                                 options={countryCode.map((c) => c.phoneCode)}
//                                 value={form.selectedPhoneCode || null}
//                                 onChange={(e, newValue) => {
//                                     setForm((prev) => ({
//                                         ...prev,
//                                         selectedPhoneCode: newValue,
//                                     }));
//                                     setErrors((prev) => ({
//                                         ...prev,
//                                         selectedPhoneCode: false,
//                                     }));
//                                 }}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Code *"
//                                         error={errors.selectedPhoneCode}
//                                         size="small"
//                                     />
//                                 )}
//                                 sx={{ flex: 0.5 }}
//                             />

//                             <TextField
//                                 label="Mobile *"
//                                 placeholder="7385363401"
//                                 value={form.mobile}
//                                 onChange={handleChange("mobile")}
//                                 error={errors.mobile}
//                                 fullWidth
//                                 size="small"
//                                 sx={{
//                                     flex: 1,
//                                 }}
//                             />
//                         </Box>
//                         <TextField
//                             label="Email *"
//                             placeholder="Email"
//                             value={form.email}
//                             onChange={handleChange("email")}
//                             error={errors.email}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 1,
//                             }}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <Autocomplete
//                             options={customerCategory.map((option) => option.customerCategory)}
//                             value={form.customerCategory || null}
//                             onChange={(e, newValue) => {
//                                 setForm((prev) => ({
//                                     ...prev,
//                                     customerCategory: newValue || "",
//                                 }));
//                                 setErrors((prev) => ({
//                                     ...prev,
//                                     customerCategory: false,
//                                 }));
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Customer Category *"
//                                     error={errors.customerCategory}
//                                     size="small"
//                                 />
//                             )}
//                             sx={{ flex: 2 }}
//                         />
//                         <Autocomplete
//                             options={industry.map((option) => option.industry)}
//                             value={form.industry || null}
//                             onChange={(e, newValue) => {
//                                 setForm((prev) => ({
//                                     ...prev,
//                                     industry: newValue || "",
//                                 }));
//                                 setErrors((prev) => ({
//                                     ...prev,
//                                     industry: false,
//                                 }));
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Industry *"
//                                     error={errors.industry}
//                                     size="small"
//                                 />
//                             )}
//                             sx={{ flex: 2 }}
//                         />
//                         <Autocomplete
//                             disablePortal
//                             options={leadSource.map((option) => option.leadSource)}
//                             value={form.leadSource || ""}
//                             onChange={(e, newValue) => handleChange("leadSource")({ target: { value: newValue } })}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Lead Source *"
//                                     size="small"
//                                     error={!!errors.leadSource}
//                                 />
//                             )}
//                             sx={{ flex: 2 }}
//                         />
//                         <TextField
//                             label="Designation"
//                             placeholder="Designation"
//                             value={form.designation}
//                             onChange={handleChange("designation")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                     </Box>
//                     <div className="gap-4 md:flex lg:flex">
//                         <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                             <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Street"
//                                     placeholder="Street"
//                                     value={form.billingStreet}
//                                     onChange={handleChange("billingStreet")}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="City"
//                                     placeholder="City"
//                                     value={form.billingCity}
//                                     onChange={handleChange("billingCity")}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                                 <TextField
//                                     label="State"
//                                     placeholder="State"
//                                     value={form.billingState}
//                                     onChange={handleChange("billingState")}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Pincode"
//                                     placeholder="Pincode"
//                                     value={form.billingPincode}
//                                     onChange={handleChange("billingPincode")}
//                                     fullWidth
//                                     size="small"
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                                 <Autocomplete
//                                     options={country}
//                                     getOptionLabel={(option) => option.country}
//                                     value={country.find((c) => c.id === form.selectedBillingCountryId) || null}
//                                     onChange={(e, newValue) => {
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             selectedBillingCountryId: newValue?.id || "",
//                                             billingCountry: newValue?.country || "",
//                                         }));
//                                     }}
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Country"
//                                             size="small"
//                                         />
//                                     )}
//                                     sx={{ flex: 2 }}
//                                 />
//                             </Box>
//                         </div>
//                         <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                             <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Street"
//                                     placeholder="Street"
//                                     value={form.shippingStreet}
//                                     onChange={handleChange("shippingStreet")}
//                                     fullWidth
//                                     size="small"
//                                     disabled={copyBillingToShipping}
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="City"
//                                     placeholder="City"
//                                     value={form.shippingCity}
//                                     onChange={handleChange("shippingCity")}
//                                     fullWidth
//                                     size="small"
//                                     disabled={copyBillingToShipping}
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                                 <TextField
//                                     label="State"
//                                     placeholder="State"
//                                     value={form.shippingState}
//                                     onChange={handleChange("shippingState")}
//                                     fullWidth
//                                     size="small"
//                                     disabled={copyBillingToShipping}
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Pincode"
//                                     placeholder="Pincode"
//                                     value={form.shippingPincode}
//                                     onChange={handleChange("shippingPincode")}
//                                     fullWidth
//                                     size="small"
//                                     disabled={copyBillingToShipping}
//                                     sx={{
//                                         flex: 2,
//                                     }}
//                                 />
//                                 <Autocomplete
//                                     options={country}
//                                     getOptionLabel={(option) => option.country}
//                                     value={country.find((c) => c.id === form.selectedShippingCountryId) || null}
//                                     onChange={(e, newValue) => {
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             selectedShippingCountryId: newValue?.id || "",
//                                             shippingCountry: newValue?.country || "",
//                                         }));
//                                     }}
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Country"
//                                             size="small"
//                                         />
//                                     )}
//                                     sx={{ flex: 2 }}
//                                     disabled={copyBillingToShipping}
//                                 />
//                             </Box>
//                         </div>
//                     </div>
//                     <span>
//                         <FormControlLabel
//                             control={
//                                 <Checkbox
//                                     size="small"
//                                     checked={copyBillingToShipping}
//                                     onChange={(e) => {
//                                         const checked = e.target.checked;
//                                         setCopyBillingToShipping(checked);

//                                         if (checked) {
//                                             const selectedBillingCountry = country.find((c) => c.id === Number(form.selectedBillingCountryId));

//                                             setForm((prev) => ({
//                                                 ...prev,
//                                                 shippingStreet: prev.billingStreet,
//                                                 shippingCity: prev.billingCity,
//                                                 shippingState: prev.billingState,
//                                                 shippingPincode: prev.billingPincode,
//                                                 selectedShippingCountryId: prev.selectedBillingCountryId,
//                                                 shippingCountry: selectedBillingCountry?.country || "",
//                                             }));
//                                         } else {
//                                             setForm((prev) => ({
//                                                 ...prev,
//                                                 shippingStreet: "",
//                                                 shippingCity: "",
//                                                 shippingState: "",
//                                                 shippingPincode: "",
//                                                 selectedShippingCountryId: "",
//                                                 shippingCountry: "",
//                                             }));
//                                         }
//                                     }}
//                                 />
//                             }
//                             label="Shipping address is same as billing address"
//                         />
//                     </span>
//                     <div className="flex justify-end">
//                         <Button
//                             onClick={handleSubmit}
//                             variant="gradient"
//                             className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                         >
//                             <UserRound size={20} />
//                             Create Enquiry
//                         </Button>
//                     </div>
//                 </div>
//             )}

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={2500}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage || localSnackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default CreateEnquiry;

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSalutations } from "../../../redux/actions/salutation";
import { getCustomerCategory } from "../../../redux/actions/customerCategory";
import { getIndustry } from "../../../redux/actions/industry";
import { getEmployees } from "../../../redux/actions/employee";
import { getCountry } from "../../../redux/actions/country";
import { getCountryCode } from "../../../redux/actions/countryCode";
import { getLeadSource } from "../../../redux/actions/leadSource";
import { getRoles } from "../../../redux/actions/rbac";
import { createCustomer, getCustomers } from "../../../redux/actions/customer";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { TextField, InputAdornment, Box, Snackbar, Alert, Chip, Checkbox, FormControlLabel, Autocomplete, CircularProgress } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle2, MapPin, Phone, Search, Sparkles, UserCheck, UserRound } from "lucide-react";
import { CUSTOMER_ERROR } from "../../../redux/types";
import { usePincodeLookup } from "../../../hooks/use-pincode-lookup";

const CreateEnquiry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [form, setForm] = useState({
        assignedTo: user?.id ? [user] : [],
        salutation: "",
        firstName: "",
        middleName: "",
        lastName: "",
        companyName: "",
        gstinNo: "",
        selectedPhoneCode: "+91",
        mobile: "",
        email: "",
        customerCategory: "",
        industry: "",
        designation: "",
        leadSource: "",
        billingStreet: "",
        billingCity: "",
        billingState: "",
        billingPincode: "",
        selectedBillingCountryId: "",
        billingCountry: "",
        shippingStreet: "",
        shippingCity: "",
        shippingState: "",
        shippingPincode: "",
        selectedShippingCountryId: "",
        shippingCountry: "",
    });
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);
    const { loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.customer);
    const { salutations } = useSelector((state) => state.salutation);
    const { customerCategory } = useSelector((state) => state.customerCategory);
    const { industry } = useSelector((state) => state.industry);
    const { employees } = useSelector((state) => state.employee);
    const { country } = useSelector((state) => state.country);
    const { countryCode } = useSelector((state) => state.countryCode);
    const { roles } = useSelector((state) => state.rbac);
    const { leadSource } = useSelector((state) => state.leadSource);

    const applyBillingLocation = useCallback(
        ({ city, state, country: countryName }) => {
            const countryRecord = country.find((item) => item.country?.toLowerCase() === countryName.toLowerCase());
            setForm((prev) => ({
                ...prev,
                billingCity: city,
                billingState: state,
                billingCountry: countryName,
                selectedBillingCountryId: countryRecord?.id || prev.selectedBillingCountryId,
            }));
            setErrors((prev) => ({ ...prev, billingCity: false, billingState: false, billingCountry: false }));
        },
        [country],
    );

    const applyShippingLocation = useCallback(
        ({ city, state, country: countryName }) => {
            const countryRecord = country.find((item) => item.country?.toLowerCase() === countryName.toLowerCase());
            setForm((prev) => ({
                ...prev,
                shippingCity: city,
                shippingState: state,
                shippingCountry: countryName,
                selectedShippingCountryId: countryRecord?.id || prev.selectedShippingCountryId,
            }));
            setErrors((prev) => ({ ...prev, shippingCity: false, shippingState: false, shippingCountry: false }));
        },
        [country],
    );

    const billingLookup = usePincodeLookup(applyBillingLocation);
    const shippingLookup = usePincodeLookup(applyShippingLocation);

    useEffect(() => {
        if (form.billingPincode.length !== 6) return undefined;
        const timeout = setTimeout(() => billingLookup.lookup(form.billingPincode), 350);
        return () => clearTimeout(timeout);
    }, [form.billingPincode, billingLookup.lookup]);

    useEffect(() => {
        if (copyBillingToShipping || form.shippingPincode.length !== 6) return undefined;
        const timeout = setTimeout(() => shippingLookup.lookup(form.shippingPincode), 350);
        return () => clearTimeout(timeout);
    }, [copyBillingToShipping, form.shippingPincode, shippingLookup.lookup]);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getSalutations());
        dispatch(getCustomerCategory());
        dispatch(getIndustry());
        dispatch(getLeadSource());
        dispatch(getEmployees());
        dispatch(getCountry());
        dispatch(getCountryCode());
        dispatch(getCustomers());
        dispatch(getRoles());
    }, [dispatch]);

    useEffect(() => {
        if (justSubmitted && snackbarMessage) {
            if (snackbarSeverity === "success" && snackbarMessage === "Enquiry created successfully") {
                // ✅ Reset the form
                setForm({
                    assignedTo: [],
                    salutation: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    companyName: "",
                    gstinNo: "",
                    selectedPhoneCode: "",
                    mobile: "",
                    email: "",
                    customerCategory: "",
                    industry: "",
                    designation: "",
                    billingStreet: "",
                    billingCity: "",
                    billingState: "",
                    billingPincode: "",
                    selectedBillingCountryId: "",
                    billingCountry: "",
                    shippingStreet: "",
                    shippingCity: "",
                    shippingState: "",
                    shippingPincode: "",
                    selectedShippingCountryId: "",
                    shippingCountry: "",
                });

                setTimeout(() => {
                    setJustSubmitted(false);
                    dispatch(clearSnackbar());
                    navigate("/enquiries");
                }, 1000);
            } else {
                // For error case, just reset the flag
                setJustSubmitted(false);
            }
        }
    }, [snackbarMessage, snackbarSeverity, justSubmitted, dispatch, navigate]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        dispatch(clearSnackbar());
    };

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: false });
    };

    const showValidationError = (message) => {
        dispatch({
            type: CUSTOMER_ERROR,
            payload: message,
        });
    };

    const validateFields = () => {
        let tempErrors = {};
        let hasError = false;

        const fieldNames = {
            assignedTo: "Assigned To",
            salutation: "Salutation",
            firstName: "First Name",
            lastName: "Last Name",
            selectedPhoneCode: "Phone Code",
            mobile: "Mobile",
            email: "Email",
            customerCategory: "Customer Category",
            industry: "Industry",
            leadSource: "Lead Source",
            // Billing Address Fields
            billingStreet: "Billing Street",
            billingCity: "Billing City",
            billingState: "Billing State",
            billingPincode: "Billing Pincode",
            billingCountry: "Billing Country",
            // Shipping Address Fields
            shippingStreet: "Shipping Street",
            shippingCity: "Shipping City",
            shippingState: "Shipping State",
            shippingPincode: "Shipping Pincode",
            shippingCountry: "Shipping Country",
        };

        // ---------- REQUIRED FIELDS CHECK ----------
        for (const field of Object.keys(fieldNames)) {
            const value = form[field];
            if ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && !value?.trim())) {
                tempErrors[field] = true;
                setErrors(tempErrors);
                showValidationError(`${fieldNames[field]} is required`);
                hasError = true;
                break;
            }
        }

        // Stop further checks if required fields failed
        if (hasError) return false;

        // ---------- MOBILE VALIDATION ----------
        if (!/^[0-9]{10}$/.test(form.mobile)) {
            tempErrors.mobile = true;
            setErrors(tempErrors);
            showValidationError("Mobile number must be exactly 10 digits");
            return false;
        }

        // ---------- EMAIL VALIDATION ----------
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
            tempErrors.email = true;
            setErrors(tempErrors);
            showValidationError("Enter a valid email address");
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validateFields()) return;

        setJustSubmitted(true); // ✅ Important

        const dataToSend = {
            salutation: form.salutation,
            firstName: form.firstName,
            middleName: form.middleName,
            lastName: form.lastName,
            mobile: `${form.selectedPhoneCode} ${form.mobile}`.trim(),
            email: form.email,
            customerCategory: form.customerCategory,
            industry: form.industry,
            designation: form.designation,
            leadSource: form.leadSource,
            companyName: form.companyName.trim(),
            gstinNo: form.gstinNo,
            assignedTo: form.assignedTo.map((emp) => emp.id),
            billingStreet: form.billingStreet,
            billingCity: form.billingCity,
            billingState: form.billingState,
            billingPincode: form.billingPincode,
            billingCountry: form.billingCountry,
            shippingStreet: form.shippingStreet,
            shippingCity: form.shippingCity,
            shippingState: form.shippingState,
            shippingPincode: form.shippingPincode,
            shippingCountry: form.shippingCountry,
        };

        dispatch(createCustomer(dataToSend));
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8">
                    <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#053054] p-6 text-white shadow-2xl shadow-blue-200/70 md:p-8">
                        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                    <Sparkles size={14} />
                                    CRM Enquiries
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Create New Enquiry</h1>
                                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Capture customer details, assign ownership, and prepare the enquiry for follow-up in a clean step-by-step form.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate(-1)}
                                variant="filled"
                                className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-5 py-3 text-sm font-black capitalize text-white shadow-none backdrop-blur transition hover:bg-white/20"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </Button>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        {/* Search Label and Field */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2 text-nowrap text-sm font-black text-slate-700 md:text-base">
                                <Phone size={18} className="text-blue-600" />
                                Search by Mobile No
                            </div>
                            <TextField
                                variant="outlined"
                                placeholder="Search..."
                                size="small"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Search className="cursor-pointer text-gray-500" />
                                        </InputAdornment>
                                    ),
                                }}
                                className="w-64"
                            />
                        </div>
                        <Box className="flex flex-col gap-4 lg:flex-row">
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={employees.filter((emp) => !form.assignedTo.some((selected) => selected.id === emp.id))}
                                getOptionLabel={(option) => formatEmployeeName(option)}
                                value={form.assignedTo}
                                onChange={(e, newValue) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        assignedTo: newValue || [], // newValue can be null sometimes
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        assignedTo: false,
                                    }));
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const label = formatEmployeeName(option);
                                        const { key, ...tagProps } = getTagProps({ index });

                                        return (
                                            <Chip
                                                key={key}
                                                variant="outlined"
                                                label={label}
                                                {...tagProps}
                                            />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Assigned To *"
                                        error={!!errors.assignedTo}
                                        size="small"
                                    />
                                )}
                                className="w-full md:w-64 lg:w-96"
                                loading={loading} // optional: if employees are loading
                                LoadingIndicator={
                                    <CircularProgress
                                        color="inherit"
                                        size={20}
                                    />
                                }
                            />
                        </Box>
                        </div>
                    </section>

                    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <UserRound size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Customer Information</h2>
                                <p className="text-sm font-medium text-slate-500">Basic identity, contact, company and source details.</p>
                            </div>
                        </div>
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <Autocomplete
                            options={salutations.map((option) => option.salutation)}
                            value={form.salutation || null}
                            onChange={(e, newValue) => {
                                setForm((prev) => ({
                                    ...prev,
                                    salutation: newValue || "",
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    salutation: false,
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Salutation *"
                                    error={errors.salutation}
                                    size="small"
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
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
                            label="Middle Name "
                            placeholder="Middle Name"
                            value={form.middleName}
                            onChange={handleChange("middleName")}
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
                        <TextField
                            label="Company Name"
                            placeholder="Company Name"
                            value={form.companyName}
                            onChange={handleChange("companyName")}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                        <TextField
                            label="GSTIN No"
                            placeholder="GSTIN Number"
                            value={form.gstinNo}
                            onChange={handleChange("gstinNo")}
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
                                options={countryCode.map((c) => c.phoneCode)}
                                value={form.selectedPhoneCode || null}
                                onChange={(e, newValue) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        selectedPhoneCode: newValue,
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        selectedPhoneCode: false,
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Code *"
                                        error={errors.selectedPhoneCode}
                                        size="small"
                                    />
                                )}
                                sx={{ flex: 0.5 }}
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
                        <TextField
                            label="Email *"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange("email")}
                            error={errors.email}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 1,
                            }}
                        />
                    </Box>
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <Autocomplete
                            options={customerCategory.map((option) => option.customerCategory)}
                            value={form.customerCategory || null}
                            onChange={(e, newValue) => {
                                setForm((prev) => ({
                                    ...prev,
                                    customerCategory: newValue || "",
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    customerCategory: false,
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Customer Category *"
                                    error={errors.customerCategory}
                                    size="small"
                                />
                            )}
                            sx={{ flex: 2 }}
                        />
                        <Autocomplete
                            options={industry.map((option) => option.industry)}
                            value={form.industry || null}
                            onChange={(e, newValue) => {
                                setForm((prev) => ({
                                    ...prev,
                                    industry: newValue || "",
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    industry: false,
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Industry *"
                                    error={errors.industry}
                                    size="small"
                                />
                            )}
                            sx={{ flex: 2 }}
                        />
                        <Autocomplete
                            disablePortal
                            options={leadSource.map((option) => option.leadSource)}
                            value={form.leadSource || ""}
                            onChange={(e, newValue) => handleChange("leadSource")({ target: { value: newValue } })}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Lead Source *"
                                    size="small"
                                    error={!!errors.leadSource}
                                />
                            )}
                            sx={{ flex: 2 }}
                        />
                        <TextField
                            label="Designation"
                            placeholder="Designation"
                            value={form.designation}
                            onChange={handleChange("designation")}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                    </Box>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Address Details</h2>
                                <p className="text-sm font-medium text-slate-500">Billing and shipping information with pincode-based location lookup.</p>
                            </div>
                        </div>
                    <div className="gap-5 md:flex lg:flex">
                        {/* <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street"
                                    placeholder="Street"
                                    value={form.billingStreet}
                                    onChange={handleChange("billingStreet")}
                                    fullWidth
                                    size="small"
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City"
                                    placeholder="City"
                                    value={form.billingCity}
                                    onChange={handleChange("billingCity")}
                                    fullWidth
                                    size="small"
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <TextField
                                    label="State"
                                    placeholder="State"
                                    value={form.billingState}
                                    onChange={handleChange("billingState")}
                                    fullWidth
                                    size="small"
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode"
                                    placeholder="Pincode"
                                    value={form.billingPincode}
                                    onChange={handleChange("billingPincode")}
                                    fullWidth
                                    size="small"
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option.country}
                                    value={country.find((c) => c.id === form.selectedBillingCountryId) || null}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            selectedBillingCountryId: newValue?.id || "",
                                            billingCountry: newValue?.country || "",
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
                                />
                            </Box>
                        </div> */}
                        <div className="w-full space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:w-1/2 lg:w-1/2">
                            <p className="flex items-center gap-2 font-black text-slate-800">
                                <Building2 size={18} className="text-blue-600" />
                                Billing Address
                            </p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street *"
                                    placeholder="Street"
                                    value={form.billingStreet}
                                    onChange={handleChange("billingStreet")}
                                    error={!!errors.billingStreet}
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
                                    value={form.billingCity}
                                    onChange={handleChange("billingCity")}
                                    error={!!errors.billingCity}
                                    fullWidth
                                    size="small"
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <TextField
                                    label="State *"
                                    placeholder="State"
                                    value={form.billingState}
                                    onChange={handleChange("billingState")}
                                    error={!!errors.billingState}
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
                                    value={form.billingPincode}
                                    onChange={(event) => handleChange("billingPincode")({ target: { value: event.target.value.replace(/\D/g, "").slice(0, 6) } })}
                                    error={!!errors.billingPincode}
                                    helperText={billingLookup.error || (billingLookup.loading ? "Finding city, state and country..." : "Location fills automatically at 6 digits")}
                                    InputProps={{
                                        endAdornment: billingLookup.loading ? <CircularProgress size={18} /> : null,
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
                                    value={country.find((c) => c.id === form.selectedBillingCountryId) || null}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            selectedBillingCountryId: newValue?.id || "",
                                            billingCountry: newValue?.country || "",
                                        }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            billingCountry: false,
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country *"
                                            error={!!errors.billingCountry}
                                            size="small"
                                        />
                                    )}
                                    sx={{ flex: 2 }}
                                />
                            </Box>
                        </div>
                        {/* <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street"
                                    placeholder="Street"
                                    value={form.shippingStreet}
                                    onChange={handleChange("shippingStreet")}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City"
                                    placeholder="City"
                                    value={form.shippingCity}
                                    onChange={handleChange("shippingCity")}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <TextField
                                    label="State"
                                    placeholder="State"
                                    value={form.shippingState}
                                    onChange={handleChange("shippingState")}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode"
                                    placeholder="Pincode"
                                    value={form.shippingPincode}
                                    onChange={handleChange("shippingPincode")}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option.country}
                                    value={country.find((c) => c.id === form.selectedShippingCountryId) || null}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            selectedShippingCountryId: newValue?.id || "",
                                            shippingCountry: newValue?.country || "",
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
                                    disabled={copyBillingToShipping}
                                />
                            </Box>
                        </div> */}
                        <div className="mt-5 w-full space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:mt-0 md:w-1/2 lg:w-1/2">
                            <p className="flex items-center gap-2 font-black text-slate-800">
                                <MapPin size={18} className="text-emerald-600" />
                                Shipping Address
                            </p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street *"
                                    placeholder="Street"
                                    value={form.shippingStreet}
                                    onChange={handleChange("shippingStreet")}
                                    error={!!errors.shippingStreet}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City *"
                                    placeholder="City"
                                    value={form.shippingCity}
                                    onChange={handleChange("shippingCity")}
                                    error={!!errors.shippingCity}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <TextField
                                    label="State *"
                                    placeholder="State"
                                    value={form.shippingState}
                                    onChange={handleChange("shippingState")}
                                    error={!!errors.shippingState}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode *"
                                    placeholder="Pincode"
                                    value={form.shippingPincode}
                                    onChange={(event) => handleChange("shippingPincode")({ target: { value: event.target.value.replace(/\D/g, "").slice(0, 6) } })}
                                    error={!!errors.shippingPincode}
                                    helperText={shippingLookup.error || (shippingLookup.loading ? "Finding city, state and country..." : "Location fills automatically at 6 digits")}
                                    InputProps={{
                                        endAdornment: shippingLookup.loading ? <CircularProgress size={18} /> : null,
                                    }}
                                    fullWidth
                                    size="small"
                                    disabled={copyBillingToShipping}
                                    sx={{
                                        flex: 2,
                                    }}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option.country}
                                    value={country.find((c) => c.id === form.selectedShippingCountryId) || null}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            selectedShippingCountryId: newValue?.id || "",
                                            shippingCountry: newValue?.country || "",
                                        }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            shippingCountry: false,
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country *"
                                            error={!!errors.shippingCountry}
                                            size="small"
                                        />
                                    )}
                                    sx={{ flex: 2 }}
                                    disabled={copyBillingToShipping}
                                />
                            </Box>
                        </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={copyBillingToShipping}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCopyBillingToShipping(checked);

                                        if (checked) {
                                            const selectedBillingCountry = country.find((c) => c.id === Number(form.selectedBillingCountryId));

                                            setForm((prev) => ({
                                                ...prev,
                                                shippingStreet: prev.billingStreet,
                                                shippingCity: prev.billingCity,
                                                shippingState: prev.billingState,
                                                shippingPincode: prev.billingPincode,
                                                selectedShippingCountryId: prev.selectedBillingCountryId,
                                                shippingCountry: selectedBillingCountry?.country || "",
                                            }));
                                        } else {
                                            setForm((prev) => ({
                                                ...prev,
                                                shippingStreet: "",
                                                shippingCity: "",
                                                shippingState: "",
                                                shippingPincode: "",
                                                selectedShippingCountryId: "",
                                                shippingCountry: "",
                                            }));
                                        }
                                    }}
                                />
                            }
                            label="Shipping address is same as billing address"
                        />
                    </div>
                    </section>

                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-xl shadow-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Ready to save enquiry</p>
                                <p className="text-xs font-semibold text-slate-500">Please verify required fields before creating the enquiry.</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            variant="filled"
                            className="flex items-center justify-center gap-2 rounded-2xl bg-[#053054] px-6 py-3 text-sm font-black capitalize text-white shadow-lg shadow-slate-300/80 transition hover:-translate-y-0.5 hover:bg-[#04243f] md:text-base"
                        >
                            <UserRound size={20} />
                            Create Enquiry
                        </Button>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CreateEnquiry;
