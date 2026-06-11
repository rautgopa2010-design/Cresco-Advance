// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getSalutations } from "../../../redux/actions/salutation";
// import { getCustomerCategory } from "../../../redux/actions/customerCategory";
// import { getIndustry } from "../../../redux/actions/industry";
// import { getEmployees } from "../../../redux/actions/employee";
// import { getCountry } from "../../../redux/actions/country";
// import { getCountryCode } from "../../../redux/actions/countryCode";
// import { getRoles } from "../../../redux/actions/rbac";
// import { getLeadSource } from "../../../redux/actions/leadSource";
// import { updateCustomer, getCustomers } from "../../../redux/actions/customer";
// import { clearSnackbar } from "../../../redux/actions/commonActions";
// import { TextField, InputAdornment, Box, Snackbar, Alert, Chip, Checkbox, FormControlLabel, Autocomplete, CircularProgress } from "@mui/material";
// import { Button } from "@material-tailwind/react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Search, UserRound } from "lucide-react";

// const EditEnquiry = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { id } = useParams();

//     const [form, setForm] = useState({
//         assignedTo: [],
//         salutation: "",
//         firstName: "",
//         middleName: "",
//         lastName: "",
//         companyName: "",
//         gstinNo: "",
//         selectedPhoneCode: "",
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
//     const { loading, snackbarMessage, snackbarSeverity, customers } = useSelector((state) => state.customer);
//     const { salutations } = useSelector((state) => state.salutation);
//     const { customerCategory } = useSelector((state) => state.customerCategory);
//     const { industry } = useSelector((state) => state.industry);
//     const { employees } = useSelector((state) => state.employee);
//     const { country } = useSelector((state) => state.country);
//     const { countryCode } = useSelector((state) => state.countryCode);
//     const { roles } = useSelector((state) => state.rbac);
//     const { leadSource } = useSelector((state) => state.leadSource);

//     // ✅ Fetch all necessary data
//     useEffect(() => {
//         dispatch(clearSnackbar());
//         dispatch(getSalutations());
//         dispatch(getCustomerCategory());
//         dispatch(getIndustry());
//         dispatch(getEmployees());
//         dispatch(getCountry());
//         dispatch(getLeadSource());
//         dispatch(getCountryCode());
//         dispatch(getCustomers());
//         dispatch(getRoles());
//     }, [dispatch]);

//     // ✅ Prefill data once customers are fetched
//     useEffect(() => {
//         if (customers && customers.length > 0 && id) {
//             const existingCustomer = customers.find((cus) => String(cus.id) === String(id));
//             if (existingCustomer) {
//                 // Find employee(s) based on name stored in assignedTo array
//                 const matchedEmployees = employees.filter((emp) => {
//                     const fullName = `${emp.salutation} ${emp.firstName} ${emp.middleName || ""} ${emp.lastName}`.trim();
//                     return existingCustomer.assignedTo?.includes(fullName);
//                 });

//                 setForm({
//                     assignedTo: matchedEmployees || [],
//                     salutation: existingCustomer.salutation || "",
//                     firstName: existingCustomer.firstName || "",
//                     middleName: existingCustomer.middleName || "",
//                     lastName: existingCustomer.lastName || "",
//                     companyName: existingCustomer.companyName || "",
//                     gstinNo: existingCustomer.gstinNo || "",
//                     selectedPhoneCode: existingCustomer.mobile?.split(" ")[0] || "",
//                     mobile: existingCustomer.mobile?.split(" ")[1] || "",
//                     email: existingCustomer.email || "",
//                     customerCategory: existingCustomer.customerCategory || "",
//                     industry: existingCustomer.industry || "",
//                     designation: existingCustomer.designation || "",
//                     leadSource: existingCustomer.leadSource || "",
//                     billingStreet: existingCustomer.billingStreet || "",
//                     billingCity: existingCustomer.billingCity || "",
//                     billingState: existingCustomer.billingState || "",
//                     billingPincode: existingCustomer.billingPincode || "",
//                     selectedBillingCountryId: country.find((c) => c.country === existingCustomer.billingCountry)?.id || "",
//                     billingCountry: existingCustomer.billingCountry || "",
//                     shippingStreet: existingCustomer.shippingStreet || "",
//                     shippingCity: existingCustomer.shippingCity || "",
//                     shippingState: existingCustomer.shippingState || "",
//                     shippingPincode: existingCustomer.shippingPincode || "",
//                     selectedShippingCountryId: country.find((c) => c.country === existingCustomer.shippingCountry)?.id || "",
//                     shippingCountry: existingCustomer.shippingCountry || "",
//                 });
//             }
//         }
//     }, [customers, id, employees, country]);

//     useEffect(() => {
//         if (justSubmitted && snackbarMessage) {
//             setSnackbarOpen(true);

//             if (snackbarSeverity === "success" && snackbarMessage === "Enquiry updated successfully") {
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

//         setJustSubmitted(true);

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

//         // Only update
//         dispatch(updateCustomer(id, dataToSend));
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
//                         <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Update Enquiry :</div>
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
//                             className="flex items-center gap-2 rounded bg-green-600 px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                         >
//                             <UserRound size={20} />
//                             Update Enquiry
//                         </Button>
//                     </div>
//                 </div>
//             )}

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

// export default EditEnquiry;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSalutations } from "../../../redux/actions/salutation";
import { getCustomerCategory } from "../../../redux/actions/customerCategory";
import { getIndustry } from "../../../redux/actions/industry";
import { getEmployees } from "../../../redux/actions/employee";
import { getCountry } from "../../../redux/actions/country";
import { getCountryCode } from "../../../redux/actions/countryCode";
import { getRoles } from "../../../redux/actions/rbac";
import { getLeadSource } from "../../../redux/actions/leadSource";
import { updateCustomer, getCustomers } from "../../../redux/actions/customer";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { TextField, InputAdornment, Box, Snackbar, Alert, Chip, Checkbox, FormControlLabel, Autocomplete, CircularProgress } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, UserRound } from "lucide-react";
import { CUSTOMER_ERROR } from "../../../redux/types";

const EditEnquiry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
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
    const { loading, snackbarMessage, snackbarSeverity, customers } = useSelector((state) => state.customer);
    const { salutations } = useSelector((state) => state.salutation);
    const { customerCategory } = useSelector((state) => state.customerCategory);
    const { industry } = useSelector((state) => state.industry);
    const { employees } = useSelector((state) => state.employee);
    const { country } = useSelector((state) => state.country);
    const { countryCode } = useSelector((state) => state.countryCode);
    const { roles } = useSelector((state) => state.rbac);
    const { leadSource } = useSelector((state) => state.leadSource);

    // ✅ Fetch all necessary data
    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getSalutations());
        dispatch(getCustomerCategory());
        dispatch(getIndustry());
        dispatch(getEmployees());
        dispatch(getCountry());
        dispatch(getLeadSource());
        dispatch(getCountryCode());
        dispatch(getCustomers());
        dispatch(getRoles());
    }, [dispatch]);

    // ✅ Prefill data once customers are fetched
    useEffect(() => {
        if (customers && customers.length > 0 && id) {
            const existingCustomer = customers.find((cus) => String(cus.id) === String(id));
            if (existingCustomer) {
                // Find employee(s) based on name stored in assignedTo array
                const matchedEmployees = employees.filter((emp) => {
                    const fullName = `${emp.salutation} ${emp.firstName} ${emp.middleName || ""} ${emp.lastName}`.trim();
                    return existingCustomer.assignedTo?.includes(fullName);
                });

                setForm({
                    assignedTo: matchedEmployees || [],
                    salutation: existingCustomer.salutation || "",
                    firstName: existingCustomer.firstName || "",
                    middleName: existingCustomer.middleName || "",
                    lastName: existingCustomer.lastName || "",
                    companyName: existingCustomer.companyName || "",
                    gstinNo: existingCustomer.gstinNo || "",
                    selectedPhoneCode: existingCustomer.mobile?.split(" ")[0] || "",
                    mobile: existingCustomer.mobile?.split(" ")[1] || "",
                    email: existingCustomer.email || "",
                    customerCategory: existingCustomer.customerCategory || "",
                    industry: existingCustomer.industry || "",
                    designation: existingCustomer.designation || "",
                    leadSource: existingCustomer.leadSource || "",
                    billingStreet: existingCustomer.billingStreet || "",
                    billingCity: existingCustomer.billingCity || "",
                    billingState: existingCustomer.billingState || "",
                    billingPincode: existingCustomer.billingPincode || "",
                    selectedBillingCountryId: country.find((c) => c.country === existingCustomer.billingCountry)?.id || "",
                    billingCountry: existingCustomer.billingCountry || "",
                    shippingStreet: existingCustomer.shippingStreet || "",
                    shippingCity: existingCustomer.shippingCity || "",
                    shippingState: existingCustomer.shippingState || "",
                    shippingPincode: existingCustomer.shippingPincode || "",
                    selectedShippingCountryId: country.find((c) => c.country === existingCustomer.shippingCountry)?.id || "",
                    shippingCountry: existingCustomer.shippingCountry || "",
                });
            }
        }
    }, [customers, id, employees, country]);

    useEffect(() => {
        if (justSubmitted && snackbarMessage) {
            if (snackbarSeverity === "success" && snackbarMessage === "Enquiry updated successfully") {
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
                    navigate("/enquiry");
                }, 1000);
            } else {
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

        setJustSubmitted(true);

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

        // Only update
        dispatch(updateCustomer(id, dataToSend));
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-2">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Update Enquiry :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        {/* Search Label and Field */}
                        <div className="flex items-center gap-2">
                            <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Mobile No :</div>
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
                    <div className="gap-4 md:flex lg:flex">
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
                        <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
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
                                    onChange={handleChange("billingPincode")}
                                    error={!!errors.billingPincode}
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
                        <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
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
                                    onChange={handleChange("shippingPincode")}
                                    error={!!errors.shippingPincode}
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
                    <span>
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
                    </span>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-green-600 px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <UserRound size={20} />
                            Update Enquiry
                        </Button>
                    </div>
                </div>
            )}

            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={4000}
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

export default EditEnquiry;
