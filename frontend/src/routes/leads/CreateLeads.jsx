// import React, { useEffect, useRef, useState } from "react";
// import { Button } from "@material-tailwind/react";
// import { useNavigate } from "react-router-dom";
// import { Alert, Box, Chip, MenuItem, Snackbar, TextField } from "@mui/material";
// import { Search, CirclePlus, CircleMinus, File, Trash, X } from "lucide-react";
// import { MdOutlineLeaderboard } from "react-icons/md";

// const CreateLeads = () => {
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null);
//     const [form, setForm] = useState({
//         assignedTo: [],
//         selectedCustomer: "",
//         date: "",
//         productDetails: [{ productCategory: "", productSubCategory: "", product: "", filteredSubCategories: [], filteredProducts: [] }],
//         leadSource: "",
//         leadStage: "",
//         leadStatus: "",
//         followupDate: "",
//         expectedAmount: "",
//         expectedClosingDate: "",
//         description: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [assignedToOpen, setAssignedToOpen] = useState(false);
//     const [customerCompanyList, setCustomerCompanyList] = useState([]);
//     const [selectedCompany, setSelectedCompany] = useState("");
//     const [companyDetails, setCompanyDetails] = useState({
//         companyName: "",
//         gstinNo: "",
//         customers: [],
//         billingAddress: {
//             street: "",
//             city: "",
//             state: "",
//             pincode: "",
//             country: "",
//             zone: "",
//         },
//         shippingAddress: {
//             street: "",
//             city: "",
//             state: "",
//             pincode: "",
//             country: "",
//             zone: "",
//         },
//     });
//     const [employeesList, setEmployeesList] = useState([]);
//     const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({ mobile: "", email: "" });
//     const [productList, setProductList] = useState([]);
//     const [leadSourceList, setLeadSourceList] = useState([]);
//     const [leadStageList, setLeadStageList] = useState([]);
//     const [leadStatusList, setLeadStatusList] = useState([]);

//     useEffect(() => {
//         const storedCustomers = JSON.parse(localStorage.getItem("customer")) || [];
//         const companyNames = storedCustomers.map((customer) => customer.companyName);
//         setCustomerCompanyList(companyNames);

//         const today = new Date();
//         const dd = String(today.getDate()).padStart(2, "0");
//         const mm = String(today.getMonth() + 1).padStart(2, "0");
//         const yyyy = today.getFullYear();
//         const formattedDate = `${yyyy}-${mm}-${dd}`;
//         setForm((prev) => ({ ...prev, date: formattedDate }));
//         setForm((prev) => ({ ...prev, followupDate: formattedDate }));
//         setForm((prev) => ({ ...prev, expectedClosingDate: formattedDate }));
//     }, []);

//     useEffect(() => {
//         const storedEmployees = JSON.parse(localStorage.getItem("employee")) || [];
//         const formattedEmployees = storedEmployees.map((emp) => ({
//             ...emp,
//             fullName: `${emp.salutation || ""} ${emp.firstName || ""} ${emp.middleName || ""} ${emp.lastName || ""}`.trim().replace(/\s+/g, " "),
//         }));
//         setEmployeesList(formattedEmployees);
//     }, []);

//     useEffect(() => {
//         const storedProduct = JSON.parse(localStorage.getItem("productsList")) || [];
//         setProductList(storedProduct);
//     }, []);

//     useEffect(() => {
//         const storedLeadSource = JSON.parse(localStorage.getItem("leadSourceList")) || [];
//         setLeadSourceList(storedLeadSource);
//     }, []);

//     useEffect(() => {
//         const storedLeadStage = JSON.parse(localStorage.getItem("leadStageList")) || [];
//         setLeadStageList(storedLeadStage);
//     }, []);

//     useEffect(() => {
//         const storedLeadStatus = JSON.parse(localStorage.getItem("leadStatusList")) || [];
//         setLeadStatusList(storedLeadStatus);
//     }, []);

//     const handleChange = (field) => (e) => {
//         const value = e.target.value;

//         setForm((prevForm) => {
//             const updatedForm = { ...prevForm, [field]: value };
//             return updatedForm;
//         });

//         setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));

//         if (field === "selectedCustomer") {
//             const selected = companyDetails.customers.find((cust) => {
//                 const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//                 return fullName === value;
//             });

//             if (selected) {
//                 setSelectedCustomerDetails({
//                     mobile: selected.mobile,
//                     email: selected.email,
//                 });
//             } else {
//                 setSelectedCustomerDetails({ mobile: "", email: "" });
//             }
//         }
//     };

//     const handleProductFieldChange = (index, field) => (e) => {
//         const value = e.target.value;
//         const updatedProducts = [...form.productDetails];
//         const productEntry = { ...updatedProducts[index], [field]: value };

//         if (field === "productCategory") {
//             const categoryObj = productList.find((p) => p.Category === value);
//             const subCategories = categoryObj ? categoryObj.Products.map((prod) => prod.SubCategory) : [];

//             productEntry.productSubCategory = "";
//             productEntry.product = "";
//             productEntry.filteredSubCategories = subCategories;
//             productEntry.filteredProducts = [];
//         }

//         if (field === "productSubCategory") {
//             const categoryObj = productList.find((p) => p.Category === productEntry.productCategory);
//             const products = categoryObj ? categoryObj.Products.find((prod) => prod.SubCategory === value)?.Items.map((item) => item.name) || [] : [];

//             productEntry.product = "";
//             productEntry.filteredProducts = products;
//         }

//         updatedProducts[index] = productEntry;
//         setForm({ ...form, productDetails: updatedProducts });

//         // Clear any specific errors
//         setErrors((prevErrors) => {
//             const updatedErrors = { ...prevErrors };
//             if (updatedErrors[`productDetails_${index}_${field}`]) {
//                 delete updatedErrors[`productDetails_${index}_${field}`];
//             }
//             return updatedErrors;
//         });
//     };

//     const handleAddProduct = () => {
//         setForm((prev) => ({
//             ...prev,
//             productDetails: [
//                 ...prev.productDetails,
//                 { productCategory: "", productSubCategory: "", product: "", filteredSubCategories: [], filteredProducts: [] },
//             ],
//         }));
//     };

//     const handleRemoveProduct = (index) => {
//         const updated = [...form.productDetails];
//         updated.splice(index, 1);
//         setForm({ ...form, productDetails: updated });
//     };

//     const handleChipDelete = (value) => {
//         setForm((prev) => ({
//             ...prev,
//             assignedTo: prev.assignedTo.filter((v) => v !== value),
//         }));
//     };

//     const handleDateChange = (e) => {
//         setForm({ ...form, date: e.target.value });
//     };

//     const handleFollowupDateChange = (e) => {
//         setForm({ ...form, followupDate: e.target.value });
//     };

//     const handleExpectedClosingDateChange = (e) => {
//         setForm({ ...form, expectedClosingDate: e.target.value });
//     };

//     const handleSearchClick = () => {
//         if (!selectedCompany) {
//             setErrors((prev) => ({ ...prev, selectedCompany: true }));
//             setSnackbarMessage("Please select an Customer.");
//             setSnackbarOpen(true);
//             return;
//         }

//         const customers = JSON.parse(localStorage.getItem("customer")) || [];
//         const found = customers.find((cust) => cust.companyName === selectedCompany);
//         if (found) {
//             setCompanyDetails({
//                 ...found,
//                 billingAddress: found.billingAddress || {
//                     street: "",
//                     city: "",
//                     state: "",
//                     pincode: "",
//                     country: "",
//                 },
//                 shippingAddress: found.shippingAddress || {
//                     street: "",
//                     city: "",
//                     state: "",
//                     pincode: "",
//                     country: "",
//                 },
//             });
//         }
//     };

//     const handleAddressChange = (type, field) => (e) => {
//         const value = e.target.value;
//         setCompanyDetails((prev) => ({
//             ...prev,
//             [type]: {
//                 ...prev[type],
//                 [field]: value,
//             },
//         }));
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const [uploadLeadFiles, setUploadLeadFiles] = useState([]);
//     const [selectedFileIndex, setSelectedFileIndex] = useState(null);
//     const [fileMenuOpen, setFileMenuOpen] = useState(false);
//     const [previewFile, setPreviewFile] = useState(null);

//     // Load uploaded files from localStorage on mount
//     useEffect(() => {
//         const storedFiles = JSON.parse(localStorage.getItem("uploadLeadFiles")) || [];
//         setUploadLeadFiles(storedFiles);
//     }, []);

//     const toBase64 = (file) =>
//         new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result);
//             reader.onerror = reject;
//             reader.readAsDataURL(file);
//         });

//     const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "application/vnd.ms-excel",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     ];

//     const handleFileUpload = async (e) => {
//         const files = Array.from(e.target.files);
//         const validFiles = [];
//         let invalidFileSelected = false;

//         for (const file of files) {
//             if (allowedTypes.includes(file.type)) {
//                 const base64 = await toBase64(file);
//                 validFiles.push({
//                     name: file.name,
//                     type: file.type,
//                     size: file.size,
//                     base64: base64,
//                 });
//             } else {
//                 invalidFileSelected = true;
//             }
//         }

//         if (invalidFileSelected) {
//             setSnackbarMessage("This file type is not allowed");
//             setSnackbarOpen(true);
//         }

//         if (validFiles.length > 0) {
//             const updatedFiles = [...uploadLeadFiles, ...validFiles];
//             setUploadLeadFiles(updatedFiles);
//             localStorage.setItem("uploadLeadFiles", JSON.stringify(updatedFiles));
//         }

//         // Reset the input value so user can upload the same file again if needed
//         e.target.value = null;
//     };

//     const validateFields = () => {
//         let tempErrors = {};
//         let hasError = false;

//         if (!selectedCompany) {
//             tempErrors.selectedCompany = true;
//             hasError = true;
//         }
//         if (form.assignedTo.length === 0) {
//             tempErrors.assignedTo = true;
//             hasError = true;
//         }
//         if (!form.selectedCustomer) {
//             tempErrors.selectedCustomer = true;
//             hasError = true;
//         }
//         form.productDetails.forEach((entry, idx) => {
//             if (!entry.productCategory) {
//                 tempErrors[`productDetails_${idx}_productCategory`] = true;
//                 hasError = true;
//             }
//             if (!entry.productSubCategory) {
//                 tempErrors[`productDetails_${idx}_productSubCategory`] = true;
//                 hasError = true;
//             }
//             if (!entry.product) {
//                 tempErrors[`productDetails_${idx}_product`] = true;
//                 hasError = true;
//             }
//         });
//         if (!form.leadSource) {
//             tempErrors.leadSource = true;
//             hasError = true;
//         }
//         if (!form.leadStage) {
//             tempErrors.leadStage = true;
//             hasError = true;
//         }
//         if (!form.leadStatus) {
//             tempErrors.leadStatus = true;
//             hasError = true;
//         }
//         if (!form.expectedAmount) {
//             tempErrors.expectedAmount = true;
//             hasError = true;
//         }
//         if (!form.description) {
//             tempErrors.description = true;
//             hasError = true;
//         }

//         setErrors(tempErrors);
//         return !hasError;
//     };

//     const handleSubmit = () => {
//         // First validate form fields
//         if (!validateFields()) {
//             setSnackbarMessage("Please fill all required fields.");
//             setSnackbarOpen(true);
//             return;
//         }

//         const formattedDate = form.date.split("-").reverse().join("-");
//         const formattedfollowupDate = form.followupDate.split("-").reverse().join("-");
//         const formattedexpectedClosingDate = form.expectedClosingDate.split("-").reverse().join("-");

//         const selectedCustomer = companyDetails.customers.find((cust) => {
//             const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//             return fullName === form.selectedCustomer;
//         });

//         const result = {
//             assignedTo: form.assignedTo,
//             selectedCompany: selectedCompany,
//             date: formattedDate,
//             followupDate: formattedfollowupDate,
//             expectedClosingDate: formattedexpectedClosingDate,
//             companyName: companyDetails.companyName,
//             gstinNo: companyDetails.gstinNo,
//             customerPerson: form.selectedCustomer,
//             mobile: selectedCustomer?.mobile || "",
//             email: selectedCustomer?.email || "",
//             productDetails: form.productDetails.map((p) => ({
//                 productCategory: p.productCategory,
//                 productSubCategory: p.productSubCategory,
//                 product: p.product,
//             })),
//             leadSource: form.leadSource,
//             leadStage: form.leadStage,
//             leadStatus: form.leadStatus,
//             expectedAmount: form.expectedAmount,
//             description: form.description,
//             billingAddress: companyDetails.billingAddress,
//             shippingAddress: companyDetails.shippingAddress,
//             uploadedFiles: uploadLeadFiles,
//         };

//         // ✅ Save to leads
//         const existingLeads = JSON.parse(localStorage.getItem("leads")) || [];
//         existingLeads.push(result);
//         localStorage.setItem("leads", JSON.stringify(existingLeads));

//         // ✅ Save to followups
//         const existingFollowups = JSON.parse(localStorage.getItem("followups")) || [];
//         existingFollowups.push(result);
//         localStorage.setItem("followups", JSON.stringify(existingFollowups));

//         console.log("Lead generated:", result);
//         setSnackbarMessage("Lead generated successfully!");
//         setSnackbarOpen(true);

//         // ✅ Reset form
//         setForm({
//             assignedTo: [],
//             selectedCustomer: "",
//             date: "",
//             followupDate: "",
//             expectedClosingDate: "",
//             productDetails: [
//                 {
//                     productCategory: "",
//                     productSubCategory: "",
//                     product: "",
//                     filteredSubCategories: [],
//                     filteredProducts: [],
//                 },
//             ],
//             leadSource: "",
//             leadStage: "",
//             leadStatus: "",
//             expectedAmount: "",
//             description: "",
//         });
//         setSelectedCompany("");
//         setCompanyDetails({
//             companyName: "",
//             gstinNo: "",
//             customers: [],
//             billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
//             shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
//         });
//         setSelectedCustomerDetails({ mobile: "", email: "" });
//         setUploadLeadFiles([]);
//         localStorage.removeItem("uploadLeadFiles");

//         setTimeout(() => {
//             navigate("/leads");
//         }, 500);
//     };

//     return (
//         <>
//             <div className="card space-y-4">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg">Create New Lead :</div>
//                     <Button
//                         onClick={() => navigate(-1)}
//                         variant="gradient"
//                         className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                     >
//                         Back
//                     </Button>
//                 </div>

//                 {/* Search Section */}
//                 <div className="flex-none items-center gap-2 space-y-3 md:flex-none md:space-y-3 lg:flex lg:space-y-0">
//                     <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Customer :</div>
//                     <div className="flex gap-5">
//                         <div>
//                             <TextField
//                                 select
//                                 label="Select Customer *"
//                                 size="small"
//                                 value={selectedCompany}
//                                 onChange={(e) => setSelectedCompany(e.target.value)}
//                                 error={errors.selectedCompany}
//                                 className="w-56 md:w-72 lg:w-64"
//                             >
//                                 <MenuItem value="">Select Customer</MenuItem>
//                                 {customerCompanyList.map((company, index) => (
//                                     <MenuItem
//                                         key={index}
//                                         value={company}
//                                     >
//                                         {company}
//                                     </MenuItem>
//                                 ))}
//                             </TextField>
//                         </div>
//                         <Button
//                             onClick={handleSearchClick}
//                             className="bg-green-500 px-1.5 py-1.5 text-white md:px-2 md:py-0 lg:px-2 lg:py-0"
//                         >
//                             <Search size={20} />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Date and Assign */}
//                 <div className="items-center justify-between space-y-5 md:flex md:space-y-0 lg:flex lg:space-y-0">
//                     <TextField
//                         type="date"
//                         size="small"
//                         label="Date"
//                         value={form.date}
//                         onChange={handleDateChange}
//                     />
//                     <TextField
//                         select
//                         label="Assigned To *"
//                         size="small"
//                         value={form.assignedTo}
//                         onChange={(e) => {
//                             const {
//                                 target: { value },
//                             } = e;
//                             setForm({ ...form, assignedTo: typeof value === "string" ? value.split(",") : value });
//                             setErrors({ ...errors, assignedTo: false });
//                             setAssignedToOpen(false);
//                         }}
//                         error={errors.assignedTo}
//                         className="w-full md:w-64 lg:w-96"
//                         SelectProps={{
//                             multiple: true,
//                             open: assignedToOpen,
//                             onOpen: () => setAssignedToOpen(true),
//                             onClose: () => setAssignedToOpen(false),
//                             renderValue: (selected) => (
//                                 <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                                     {selected.map((value) => (
//                                         <Chip
//                                             key={value}
//                                             label={value}
//                                             onMouseDown={(event) => event.stopPropagation()}
//                                             onDelete={() => handleChipDelete(value)}
//                                         />
//                                     ))}
//                                 </Box>
//                             ),
//                         }}
//                     >
//                         {employeesList.map((option, index) => (
//                             <MenuItem
//                                 key={index}
//                                 value={option.fullName}
//                             >
//                                 {option.fullName}
//                             </MenuItem>
//                         ))}
//                     </TextField>
//                 </div>

//                 {/* Company Info */}
//                 <div className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Company Name"
//                         fullWidth
//                         value={companyDetails.companyName}
//                         InputProps={{ readOnly: true }}
//                         size="small"
//                     />
//                     <TextField
//                         label="GSTIN No"
//                         fullWidth
//                         value={companyDetails.gstinNo}
//                         InputProps={{ readOnly: true }}
//                         size="small"
//                     />
//                 </div>

//                 {/* Customer Person */}
//                 <div className="flex w-full gap-2 md:gap-4 lg:gap-4">
//                     <TextField
//                         select
//                         label="Customer Person *"
//                         size="small"
//                         value={form.selectedCustomer}
//                         onChange={handleChange("selectedCustomer")}
//                         error={errors.selectedCustomer}
//                         fullWidth
//                     >
//                         {companyDetails.customers.map((cust, i) => {
//                             const fullName =
//                                 cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//                             return (
//                                 <MenuItem
//                                     key={i}
//                                     value={fullName}
//                                 >
//                                     {fullName}
//                                 </MenuItem>
//                             );
//                         })}
//                     </TextField>
//                 </div>
//                 <div className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Mobile"
//                         fullWidth
//                         value={selectedCustomerDetails.mobile}
//                         InputProps={{ readOnly: true }}
//                         size="small"
//                     />
//                     <TextField
//                         label="Email"
//                         fullWidth
//                         value={selectedCustomerDetails.email}
//                         InputProps={{ readOnly: true }}
//                         size="small"
//                     />
//                 </div>

//                 {/* Address Info */}
//                 <div className="flex-none gap-4 md:flex lg:flex">
//                     {/* Billing Address */}
//                     <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                         <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Street"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.billingAddress.street}
//                                 onChange={handleAddressChange("billingAddress", "street")}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="City"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.billingAddress.city}
//                                 onChange={handleAddressChange("billingAddress", "city")}
//                             />
//                             <TextField
//                                 label="State"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.billingAddress.state}
//                                 onChange={handleAddressChange("billingAddress", "state")}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Pincode"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.billingAddress.pincode}
//                                 onChange={handleAddressChange("billingAddress", "pincode")}
//                             />
//                             <TextField
//                                 label="Country"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.billingAddress.country}
//                                 onChange={handleAddressChange("billingAddress", "country")}
//                             />
//                             <TextField
//                                 label="Zone"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.billingAddress.zone}
//                                 onChange={handleAddressChange("billingAddress", "zone")}
//                             />
//                         </Box>
//                     </div>

//                     {/* Shipping Address */}
//                     <div className="mt-3 w-full space-y-4 md:mt-0 md:w-1/2 lg:mt-0 lg:w-1/2">
//                         <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Street"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.shippingAddress.street}
//                                 onChange={handleAddressChange("shippingAddress", "street")}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="City"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.shippingAddress.city}
//                                 onChange={handleAddressChange("shippingAddress", "city")}
//                             />
//                             <TextField
//                                 label="State"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.shippingAddress.state}
//                                 onChange={handleAddressChange("shippingAddress", "state")}
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="Pincode"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.shippingAddress.pincode}
//                                 onChange={handleAddressChange("shippingAddress", "pincode")}
//                             />
//                             <TextField
//                                 label="Country"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.shippingAddress.country}
//                                 onChange={handleAddressChange("shippingAddress", "country")}
//                             />
//                             <TextField
//                                 label="Zone"
//                                 fullWidth
//                                 size="small"
//                                 value={companyDetails.shippingAddress.zone}
//                                 onChange={handleAddressChange("shippingAddress", "zone")}
//                             />
//                         </Box>
//                     </div>
//                 </div>

//                 {/* Product Details */}
//                 <div className="space-y-4">
//                     <div className="flex items-center gap-2">
//                         <p className="font-semibold text-[#433C50]">Product Details</p>
//                         <CirclePlus
//                             size={20}
//                             className="cursor-pointer text-blue-500"
//                             onClick={handleAddProduct}
//                         />
//                     </div>

//                     {form.productDetails.map((entry, index) => (
//                         <Box
//                             key={index}
//                             className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center"
//                         >
//                             {/* Minus Icon on the left */}
//                             {form.productDetails.length > 1 && (
//                                 <div className="self-start lg:self-center">
//                                     <CircleMinus
//                                         size={20}
//                                         className="cursor-pointer text-red-500"
//                                         onClick={() => handleRemoveProduct(index)}
//                                     />
//                                 </div>
//                             )}
//                             <div className="flex w-full flex-1 flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     select
//                                     label="Product Category *"
//                                     value={entry.productCategory}
//                                     onChange={handleProductFieldChange(index, "productCategory")}
//                                     error={errors[`productDetails_${index}_productCategory`] || false}
//                                     fullWidth
//                                     size="small"
//                                     sx={{ flex: 1 }}
//                                 >
//                                     {productList.map((cat, idx) => (
//                                         <MenuItem
//                                             key={idx}
//                                             value={cat.Category}
//                                         >
//                                             {cat.Category}
//                                         </MenuItem>
//                                     ))}
//                                 </TextField>

//                                 <TextField
//                                     select
//                                     label="Product Sub-Category *"
//                                     value={entry.productSubCategory}
//                                     onChange={handleProductFieldChange(index, "productSubCategory")}
//                                     error={errors[`productDetails_${index}_productSubCategory`] || false}
//                                     fullWidth
//                                     size="small"
//                                     disabled={!entry.productCategory}
//                                     sx={{ flex: 1 }}
//                                 >
//                                     {entry.filteredSubCategories.map((subCat, idx) => (
//                                         <MenuItem
//                                             key={idx}
//                                             value={subCat}
//                                         >
//                                             {subCat}
//                                         </MenuItem>
//                                     ))}
//                                 </TextField>

//                                 <TextField
//                                     select
//                                     label="Product *"
//                                     value={entry.product}
//                                     onChange={handleProductFieldChange(index, "product")}
//                                     error={errors[`productDetails_${index}_product`] || false}
//                                     fullWidth
//                                     size="small"
//                                     disabled={!entry.productSubCategory}
//                                     sx={{ flex: 1 }}
//                                 >
//                                     {entry.filteredProducts.map((prod, idx) => (
//                                         <MenuItem
//                                             key={idx}
//                                             value={prod}
//                                         >
//                                             {prod}
//                                         </MenuItem>
//                                     ))}
//                                 </TextField>
//                             </div>
//                         </Box>
//                     ))}
//                 </div>

//                 {/* Leads */}
//                 <div className="space-y-4">
//                     <p className="font-semibold text-[#433C50]">Lead Details</p>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             select
//                             label="Lead Source *"
//                             placeholder="Lead Source"
//                             value={form.leadSource}
//                             error={errors.leadSource}
//                             onChange={handleChange("leadSource")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         >
//                             {leadSourceList.map((option, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={option.name}
//                                 >
//                                     {option.name}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                         <TextField
//                             select
//                             label="Lead Stage *"
//                             placeholder="Lead Stage"
//                             value={form.leadStage}
//                             error={errors.leadStage}
//                             onChange={handleChange("leadStage")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         >
//                             {leadStageList.map((option, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={option.name}
//                                 >
//                                     {option.name}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                         <TextField
//                             select
//                             label="Lead Status *"
//                             placeholder="Lead Status"
//                             value={form.leadStatus}
//                             error={errors.leadStatus}
//                             onChange={handleChange("leadStatus")}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         >
//                             {leadStatusList.map((option, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={option.name}
//                                 >
//                                     {option.name}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             type="date"
//                             size="small"
//                             label="Followup Date"
//                             value={form.followupDate}
//                             onChange={handleFollowupDateChange}
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                         <TextField
//                             label="Expected Amount *"
//                             placeholder="Expected Amount"
//                             type="number"
//                             value={form.expectedAmount}
//                             error={errors.expectedAmount}
//                             onChange={handleChange("expectedAmount")}
//                             onWheel={(e) => e.target.blur()}
//                             inputProps={{ min: 0 }}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 2 }}
//                         />
//                         <TextField
//                             type="date"
//                             size="small"
//                             label="Expected Closing Date"
//                             value={form.expectedClosingDate}
//                             onChange={handleExpectedClosingDateChange}
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                     </Box>
//                 </div>

//                 {/* Description */}
//                 <Box>
//                     <TextField
//                         label="Description *"
//                         placeholder="Description"
//                         value={form.description}
//                         onChange={handleChange("description")}
//                         error={errors.description}
//                         multiline
//                         minRows={2}
//                         fullWidth
//                         size="small"
//                         sx={{
//                             flex: 2,
//                         }}
//                     />
//                 </Box>

//                 {/* File Upload Section */}
//                 <Box mt={2}>
//                     <input
//                         type="file"
//                         accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//                         multiple
//                         ref={fileInputRef}
//                         onChange={handleFileUpload}
//                         style={{ display: "none" }}
//                     />
//                     <Button
//                         variant="gradient"
//                         className="bg-green-500"
//                         onClick={() => fileInputRef.current.click()}
//                     >
//                         Upload Files
//                     </Button>

//                     <Box
//                         mt={2}
//                         className="grid grid-cols-4 gap-4 md:grid-cols-7 lg:grid-cols-10"
//                     >
//                         {uploadLeadFiles.map((file, index) => (
//                             <div
//                                 key={index}
//                                 className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded border bg-gray-100 p-2"
//                             >
//                                 {/* File Preview */}
//                                 {file.type.startsWith("image/") ? (
//                                     <img
//                                         src={file.base64}
//                                         alt="Uploaded"
//                                         className="lg:h-20 md:h-full h-full w-full rounded object-cover"
//                                     />
//                                 ) : (
//                                     <div className="p-1 text-center text-xs font-medium text-gray-700">{file.name}</div>
//                                 )}

//                                 {/* Three Dots */}
//                                 <div
//                                     className="absolute right-1 top-1 hidden cursor-pointer group-hover:block"
//                                     onClick={() => {
//                                         setSelectedFileIndex(index);
//                                         setFileMenuOpen(true);
//                                     }}
//                                 >
//                                     <span className="text-xl font-bold">⋮</span>
//                                 </div>
//                             </div>
//                         ))}
//                     </Box>
//                     {fileMenuOpen && selectedFileIndex !== null && (
//                         <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30">
//                             <div className="relative w-52 rounded bg-white p-2 shadow-lg">
//                                 <div className="mb-2 flex items-center justify-between">
//                                     <div>Option</div>
//                                     {/* Close Icon */}
//                                     <div
//                                         className="cursor-pointer"
//                                         onClick={() => setFileMenuOpen(false)}
//                                     >
//                                         <X className="h-5 w-5" />
//                                     </div>
//                                 </div>
//                                 <div className="flex justify-center gap-4">
//                                     {/* File Icon (click to preview) */}
//                                     <div
//                                         className="cursor-pointer text-blue-600 hover:text-blue-800"
//                                         onClick={() => {
//                                             setPreviewFile(uploadLeadFiles[selectedFileIndex]);
//                                             setFileMenuOpen(false);
//                                         }}
//                                     >
//                                         <File className="h-6 w-6" />
//                                     </div>

//                                     {/* Trash Icon Only */}
//                                     <div
//                                         className="cursor-pointer text-red-500 hover:text-red-700"
//                                         onClick={() => {
//                                             const updated = [...uploadLeadFiles];
//                                             updated.splice(selectedFileIndex, 1);
//                                             setUploadLeadFiles(updated);
//                                             localStorage.setItem("uploadLeadFiles", JSON.stringify(updated));
//                                             setFileMenuOpen(false);
//                                         }}
//                                     >
//                                         <Trash className="h-6 w-6" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                     {previewFile && (
//                         <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
//                             <div className="relative h-[80vh] w-[80vw] overflow-hidden rounded bg-white p-4 shadow-lg">
//                                 {/* Close Icon */}
//                                 <div
//                                     className="cursor-pointer justify-self-end"
//                                     onClick={() => setPreviewFile(null)}
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </div>

//                                 <div className="mt-7 flex h-full w-full items-center justify-center">
//                                     {previewFile.type.startsWith("image/") ? (
//                                         <img
//                                             src={previewFile.base64}
//                                             alt="Preview"
//                                             className="max-h-full max-w-full object-contain"
//                                         />
//                                     ) : (
//                                         <iframe
//                                             src={previewFile.base64}
//                                             title="Preview File"
//                                             className="h-full w-full border"
//                                         />
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </Box>

//                 {/* Submit Button */}
//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleSubmit}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <MdOutlineLeaderboard size={20} />
//                         Generate Lead
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
//                     severity={snackbarMessage.includes("successfully") ? "success" : "error"}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default CreateLeads;

// import React, { useEffect, useRef, useState } from "react";
// import { Button } from "@material-tailwind/react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { getCustomers } from "../../redux/actions/customer";
// import { getRoles } from "../../redux/actions/rbac";
// import { getEmployees } from "../../redux/actions/employee";
// import { getCountry } from "../../redux/actions/country";
// import { getZones } from "../../redux/actions/zones";
// import { getLeadSource } from "../../redux/actions/leadSource";
// import { getLeadStage } from "../../redux/actions/leadStage";
// import { getLeadStatus } from "../../redux/actions/leadStatus";
// import { getProductBrand } from "../../redux/actions/productBrand";
// import { getProductCategory } from "../../redux/actions/productCategory";
// import { getProductSubCategory } from "../../redux/actions/productSubCategory";
// import { getProduct } from "../../redux/actions/product";
// import { createLead } from "../../redux/actions/leadAndFollowup";
// import { clearSnackbar } from "../../redux/actions/commonActions";
// import { Alert, Autocomplete, Box, Chip, Snackbar, TextField, CircularProgress, FormControlLabel, Checkbox } from "@mui/material";
// import { CirclePlus, CircleMinus, File, Trash, X } from "lucide-react";
// import { MdOutlineLeaderboard } from "react-icons/md";
// import { useLocation } from "react-router-dom";
// import { FaFilePdf, FaFileExcel } from "react-icons/fa";

// const CreateLeads = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const location = useLocation();
//     const apiLead = location.state?.lead;
//     const initialModeFromLanding = location.state?.initialBusinessMode;
//     const fileInputRef = useRef(null);
//     const [form, setForm] = useState({
//         assignedTo: user?.id ? [user] : [],
//         selectedCustomer: "",
//         date: "",
//         productDetails: [
//             {
//                 productBrand: "",
//                 productCategory: "",
//                 productSubCategory: "",
//                 product: "",
//                 filteredCategories: [],
//                 filteredSubCategories: [],
//                 filteredProducts: [],
//             },
//         ],
//         leadSource: "",
//         leadStage: "",
//         leadStatus: "",
//         followupDate: "",
//         expectedAmount: "",
//         expectedClosingDate: "",
//         description: "",
//     });
//     const { customers } = useSelector((state) => state.customer);
//     const { roles } = useSelector((state) => state.rbac);
//     const { employees } = useSelector((state) => state.employee);
//     const { country } = useSelector((state) => state.country);
//     const { zones } = useSelector((state) => state.zones);
//     const { leadSource } = useSelector((state) => state.leadSource);
//     const { leadStage } = useSelector((state) => state.leadStage);
//     const { leadStatus } = useSelector((state) => state.leadStatus);
//     const { productBrand } = useSelector((state) => state.productBrand);
//     const { productCategory } = useSelector((state) => state.productCategory);
//     const { productSubCategory } = useSelector((state) => state.productSubCategory);
//     const { product } = useSelector((state) => state.product);
//     const [errors, setErrors] = useState({});
//     const { snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.leadAndFollowup);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
//     const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
//     const [selectedCompany, setSelectedCompany] = useState("");
//     const [companyDetails, setCompanyDetails] = useState({
//         companyName: "",
//         gstinNo: "",
//         customers: [],
//         billingAddress: {
//             street: "",
//             city: "",
//             state: "",
//             pincode: "",
//             country: "",
//             zone: "",
//         },
//         shippingAddress: {
//             street: "",
//             city: "",
//             state: "",
//             pincode: "",
//             country: "",
//             zone: "",
//         },
//     });
//     const [copyShippingSameAsBilling, setCopyShippingSameAsBilling] = useState(false);
//     const [filteredBillingZones, setFilteredBillingZones] = useState([]);
//     const [filteredShippingZones, setFilteredShippingZones] = useState([]);
//     const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({ code: "", mobile: "", email: "" });
//     const [isSuccessProcessing, setIsSuccessProcessing] = useState(false);
//     const [initialLoad, setInitialLoad] = useState(true);
//     const [companyOptions, setCompanyOptions] = useState([]);
//     const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
//     const [selectedCompanyRecord, setSelectedCompanyRecord] = useState(null);
//     // const [businessMode, setBusinessMode] = useState("B2B"); // "B2B" or "B2C"
//     const [businessMode, setBusinessMode] = useState(() => {
//         // Priority: value coming from landing page lead → fallback to B2B
//         if (initialModeFromLanding === "B2B" || initialModeFromLanding === "B2C") {
//             return initialModeFromLanding;
//         }
//         return "B2B"; // default for normal creation (not from landing)
//     });

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             try {
//                 await Promise.all([
//                     dispatch(getCustomers()),
//                     dispatch(getRoles()),
//                     dispatch(getEmployees()),
//                     dispatch(getCountry()),
//                     dispatch(getZones()),
//                     dispatch(getLeadSource()),
//                     dispatch(getLeadStage()),
//                     dispatch(getLeadStatus()),
//                     dispatch(getProductBrand()),
//                     dispatch(getProductCategory()),
//                     dispatch(getProductSubCategory()),
//                     dispatch(getProduct()),
//                 ]);
//             } finally {
//                 setInitialLoad(false);
//             }
//         };

//         dispatch(clearSnackbar());
//         fetchInitialData();
//     }, [dispatch]);

//     useEffect(() => {
//         if (snackbarSeverity === "success" && snackbarMessage === "Lead and follow-up created successfully") {
//             setIsSuccessProcessing(true);
//             setForm({
//                 assignedTo: [],
//                 selectedCustomer: "",
//                 date: "",
//                 followupDate: "",
//                 expectedClosingDate: "",
//                 productDetails: [
//                     {
//                         productBrand: "",
//                         productCategory: "",
//                         productSubCategory: "",
//                         product: "",
//                         filteredCategories: [],
//                         filteredSubCategories: [],
//                         filteredProducts: [],
//                     },
//                 ],
//                 leadSource: "",
//                 leadStage: "",
//                 leadStatus: "",
//                 expectedAmount: "",
//                 description: "",
//             });

//             setSelectedCompany("");
//             setCompanyDetails({
//                 companyName: "",
//                 gstinNo: "",
//                 customers: [],
//                 billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
//                 shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
//             });

//             setSelectedCustomerDetails({ mobile: "", email: "" });
//             setUploadLeadFiles([]);
//             localStorage.removeItem("uploadLeadFiles");

//             setTimeout(() => {
//                 setIsSuccessProcessing(false);
//                 dispatch(clearSnackbar());
//                 navigate("/leads");
//             }, 1000);
//         }
//     }, [snackbarMessage, snackbarSeverity, dispatch, navigate]);

//     useEffect(() => {
//         if (snackbarMessage) {
//             setSnackbarOpen(true);
//         }
//     }, [snackbarMessage]);

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//         setTimeout(() => {
//             setLocalSnackbarMessage("");
//             dispatch(clearSnackbar());
//         }, 100);
//     };

//     useEffect(() => {
//         if (apiLead) {
//             // ✅ Split mobile number into code + number
//             let code = "";
//             let mobile = "";
//             if (apiLead.SENDER_MOBILE) {
//                 const parts = apiLead.SENDER_MOBILE.split(" ");
//                 code = parts[0] || "";
//                 mobile = parts[1] || "";
//             }

//             setSelectedCompany(apiLead.SENDER_COMPANY || "");
//             setCompanyDetails((prev) => ({
//                 ...prev,
//                 companyName: apiLead.SENDER_COMPANY || "",
//                 billingAddress: {
//                     street: apiLead.SENDER_ADDRESS || "",
//                     city: apiLead.SENDER_CITY || "",
//                     state: apiLead.SENDER_STATE || "",
//                     pincode: apiLead.SENDER_PINCODE || "",
//                     country: apiLead.SENDER_COUNTRY || "",
//                     zone: "",
//                 },
//             }));

//             setForm((prev) => ({
//                 ...prev,
//                 selectedCustomer: apiLead.SENDER_NAME || "",
//                 date: apiLead.date || "",
//                 code,
//                 mobile,
//                 email: apiLead.SENDER_EMAIL || "",
//                 leadSource: apiLead.LEAD_SOURCE || "",
//                 description: apiLead.QUERY_MESSAGE || "",
//             }));

//             setSelectedCustomerDetails({
//                 code,
//                 mobile,
//                 email: apiLead.SENDER_EMAIL || "",
//             });
//         }
//     }, [apiLead]);

//     const formatEmployeeName = (emp) => {
//         const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
//         const fullName = parts.filter((part) => part && part.trim()).join(" ");
//         const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
//         return `${fullName} (${roleName})`;
//     };

//     useEffect(() => {
//         const today = new Date();
//         const dd = String(today.getDate()).padStart(2, "0");
//         const mm = String(today.getMonth() + 1).padStart(2, "0");
//         const yyyy = today.getFullYear();
//         const formattedDate = `${yyyy}-${mm}-${dd}`;
//         setForm((prev) => ({ ...prev, date: formattedDate }));
//         setForm((prev) => ({ ...prev, followupDate: formattedDate }));
//         setForm((prev) => ({ ...prev, expectedClosingDate: formattedDate }));
//     }, []);

//     const handleChange = (field) => (e) => {
//         const value = e.target.value;

//         setForm((prevForm) => {
//             const updatedForm = { ...prevForm, [field]: value };
//             return updatedForm;
//         });

//         setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));

//         if (field === "selectedCustomer") {
//             const selected = companyDetails.customers.find((cust) => {
//                 const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//                 return fullName === value;
//             });

//             if (selected) {
//                 setSelectedCustomerDetails({
//                     mobile: selected.mobile,
//                     email: selected.email,
//                 });
//             } else {
//                 setSelectedCustomerDetails({ mobile: "", email: "" });
//             }
//         }
//     };

//     const handleCompanyDetailsChange = (field) => (e) => {
//         const value = e.target.value;
//         setCompanyDetails((prev) => ({
//             ...prev,
//             [field]: value,
//         }));
//     };

//     const handleProductFieldChange = (index, field) => (e) => {
//         const value = e.target.value;
//         const updatedProducts = [...form.productDetails];
//         const productEntry = { ...updatedProducts[index], [field]: value };

//         if (field === "productBrand") {
//             // Filter categories for selected brand
//             const brandCatObj = productCategory.find((cat) => cat.brand === value);
//             const filteredCategories = brandCatObj ? brandCatObj.categories : [];

//             productEntry.productCategory = "";
//             productEntry.productSubCategory = "";
//             productEntry.product = "";
//             productEntry.filteredCategories = filteredCategories;
//             productEntry.filteredSubCategories = [];
//             productEntry.filteredProducts = [];
//             productEntry.hsnCode = "";
//         }

//         if (field === "productCategory") {
//             // Filter sub-categories for selected brand & category
//             const subCatObj = productSubCategory.find((sub) => sub.brand === productEntry.productBrand && sub.productCategoryName === value);
//             const filteredSubCategories = subCatObj ? subCatObj.subCategories : [];

//             productEntry.productSubCategory = "";
//             productEntry.product = "";
//             productEntry.filteredSubCategories = filteredSubCategories;
//             productEntry.filteredProducts = [];
//             productEntry.hsnCode = "";
//         }

//         if (field === "productSubCategory") {
//             // Get all products for brand + category + sub-category
//             const filteredProducts = product
//                 .filter(
//                     (p) =>
//                         p.brand === productEntry.productBrand &&
//                         p.productCategoryName === productEntry.productCategory &&
//                         p.productSubCategoryName === value,
//                 )
//                 .map((p) => ({
//                     name: p.product,
//                     hsnCode: p.hsnCode,
//                     unit: p.productUnitName,
//                     description: p.description,
//                 }));

//             productEntry.product = "";
//             productEntry.filteredProducts = filteredProducts;
//             productEntry.hsnCode = "";
//         }

//         if (field === "product") {
//             const selectedProd = productEntry.filteredProducts.find((p) => p.name === value);
//             if (selectedProd) {
//                 productEntry.product = selectedProd.name;
//                 productEntry.hsnCode = selectedProd.hsnCode || "";
//                 productEntry.unit = selectedProd.unit || "";
//                 productEntry.description = selectedProd.description || "";
//             }
//         }

//         updatedProducts[index] = productEntry;
//         setForm({ ...form, productDetails: updatedProducts });

//         setErrors((prevErrors) => {
//             const updatedErrors = { ...prevErrors };
//             delete updatedErrors[`productDetails_${index}_${field}`];
//             return updatedErrors;
//         });
//     };

//     const handleAddProduct = () => {
//         setForm((prev) => ({
//             ...prev,
//             productDetails: [
//                 ...prev.productDetails,
//                 {
//                     productBrand: "",
//                     productCategory: "",
//                     productSubCategory: "",
//                     product: "",
//                     filteredCategories: [],
//                     filteredSubCategories: [],
//                     filteredProducts: [],
//                 },
//             ],
//         }));
//     };

//     const handleRemoveProduct = (index) => {
//         const updated = [...form.productDetails];
//         updated.splice(index, 1);
//         setForm({ ...form, productDetails: updated });
//     };

//     const handleDateChange = (e) => {
//         setForm({ ...form, date: e.target.value });
//     };

//     const handleFollowupDateChange = (e) => {
//         setForm({ ...form, followupDate: e.target.value });
//     };

//     const handleExpectedClosingDateChange = (e) => {
//         setForm({ ...form, expectedClosingDate: e.target.value });
//     };

//     const clearSearchData = () => {
//         setCompanyDetails({
//             companyName: "",
//             gstinNo: "",
//             customers: [],
//             billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
//             shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
//         });
//         setSelectedCompany("");
//         setForm((prev) => ({ ...prev, selectedCustomer: "" }));
//         setSelectedCustomerDetails({ code: "", mobile: "", email: "" });
//         setFilteredBillingZones([]);
//         setFilteredShippingZones([]);
//     };

//     useEffect(() => {
//         if (customers.length > 0) {
//             const options = customers
//                 .filter((cust) => {
//                     // Only include customers who have a valid company name (for B2B)
//                     return cust.companyName && cust.companyName.trim() !== "";
//                 })
//                 .map((cust) => {
//                     const industryPart = cust.industry ? ` (${cust.industry})` : "";
//                     const cleanLabel = `${cust.companyName.trim()}${industryPart}`;

//                     // Collect all contact full names
//                     const contactNames = new Set();
//                     const mainFullName = [cust.salutation || "", cust.firstName || "", cust.middleName || "", cust.lastName || ""]
//                         .join(" ")
//                         .replace(/\s+/g, " ")
//                         .trim();
//                     if (mainFullName) contactNames.add(mainFullName);

//                     (cust.contacts || []).forEach((contact) => {
//                         const full = [contact.salutation || "", contact.firstName || "", contact.middleName || "", contact.lastName || ""]
//                             .join(" ")
//                             .replace(/\s+/g, " ")
//                             .trim();
//                         if (full) contactNames.add(full);
//                     });

//                     return {
//                         label: cleanLabel,
//                         value: cust.id,
//                         recordId: cust.id,
//                         companyName: cust.companyName.trim(),
//                         industry: cust.industry || "",
//                         mainContactName: mainFullName,
//                         contactList: Array.from(contactNames),
//                         fullRecord: cust,
//                     };
//                 });

//             // Handle duplicates (same company name + industry)
//             const seen = new Set();
//             const uniqueOptions = [];
//             const duplicateMap = {};

//             options.forEach((opt) => {
//                 if (seen.has(opt.label)) {
//                     duplicateMap[opt.label] = (duplicateMap[opt.label] || 0) + 1;
//                 } else {
//                     seen.add(opt.label);
//                 }
//                 uniqueOptions.push(opt);
//             });

//             const finalOptions = uniqueOptions.map((opt) => {
//                 if (duplicateMap[opt.label] > 1) {
//                     const count = options.filter((o) => o.label === opt.label).indexOf(opt) + 1;
//                     return { ...opt, label: `${opt.label} (${count})` };
//                 }
//                 return opt;
//             });

//             finalOptions.sort((a, b) => a.label.localeCompare(b.label));
//             setCompanyOptions(finalOptions);
//         } else {
//             setCompanyOptions([]);
//         }
//     }, [customers]);

//     const [customerNameOptions, setCustomerNameOptions] = useState([]);
//     const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);

//     useEffect(() => {
//         if (customers.length > 0) {
//             const options = [];
//             let optionIdCounter = 0;

//             customers.forEach((cust) => {
//                 // Helper to add a person (main or additional contact)
//                 const addPerson = (person, isMain = false) => {
//                     const fullName = [person.salutation || "", person.firstName || "", person.middleName || "", person.lastName || ""]
//                         .join(" ")
//                         .replace(/\s+/g, " ")
//                         .trim();

//                     if (!fullName) return;

//                     options.push({
//                         id: optionIdCounter++, // unique internal id
//                         label: fullName, // what user sees
//                         value: fullName, // for comparison
//                         record: cust, // full customer record
//                         contactPerson: isMain ? null : person,
//                         isMainContact: isMain,
//                         mobile: isMain ? cust.mobile : person.mobile || cust.mobile || "",
//                         email: isMain ? cust.email : person.email || cust.email || "",
//                     });
//                 };

//                 // Main contact
//                 addPerson(cust, true);

//                 // Additional contacts
//                 (cust.contacts || []).forEach((contact) => {
//                     addPerson(contact, false);
//                 });
//             });

//             // Sort by name
//             options.sort((a, b) => a.label.localeCompare(b.label));
//             setCustomerNameOptions(options);
//         } else {
//             setCustomerNameOptions([]);
//         }
//     }, [customers]);

//     const handleSearch = (type, selectedOptionOrName) => {
//         if (businessMode === "B2B") {
//             if (type === "company" && selectedOptionOrName) {
//                 const cust = selectedOptionOrName.fullRecord;
//                 setSelectedCompanyRecord(selectedOptionOrName);
//                 setSelectedCompany(cust.companyName || "");
//                 // ... rest of existing B2B company logic (same as before)
//                 const getCountryIdByName = (name) => (!name ? "" : country.find((c) => c.country === name)?.id || "");
//                 const getZonesByCountryId = (countryId) => (!countryId ? [] : zones.find((z) => z.countryId === countryId)?.zones || []);

//                 const billingCountryId = getCountryIdByName(cust.billingCountry);
//                 const shippingCountryId = getCountryIdByName(cust.shippingCountry);

//                 setFilteredBillingZones(getZonesByCountryId(billingCountryId));
//                 setFilteredShippingZones(getZonesByCountryId(shippingCountryId));

//                 setCompanyDetails({
//                     companyName: cust.companyName || "",
//                     gstinNo: cust.gstinNo || "",
//                     customers: [cust],
//                     billingAddress: {
//                         street: cust.billingStreet || "",
//                         city: cust.billingCity || "",
//                         state: cust.billingState || "",
//                         pincode: cust.billingPincode || "",
//                         country: billingCountryId,
//                         zone: cust.billingZone || "",
//                     },
//                     shippingAddress: {
//                         street: cust.shippingStreet || "",
//                         city: cust.shippingCity || "",
//                         state: cust.shippingState || "",
//                         pincode: cust.shippingPincode || "",
//                         country: shippingCountryId,
//                         zone: cust.shippingZone || "",
//                     },
//                 });

//                 setAvailableCustomerNames(selectedOptionOrName.contactList);

//                 if (selectedOptionOrName.contactList.length > 0) {
//                     const defaultCustomer = selectedOptionOrName.mainContactName;
//                     setForm((prev) => ({ ...prev, selectedCustomer: defaultCustomer, leadSource: cust.leadSource || prev.leadSource || "" }));
//                     const [code = "", ...mobileParts] = (cust.mobile || "").split(" ");
//                     setSelectedCustomerDetails({
//                         code,
//                         mobile: mobileParts.join(" "),
//                         email: cust.email || "",
//                     });
//                 }
//             }
//         } else {
//             // === B2C Mode: Search by Customer ===
//             if (type === "customer" && selectedOptionOrName) {
//                 const option = selectedOptionOrName; // full rich option
//                 const cust = option.record;
//                 const isMain = option.isMainContact;
//                 const contactPerson = option.contactPerson;

//                 // Set the displayed name
//                 setForm((prev) => ({ ...prev, selectedCustomer: option.label, leadSource: cust.leadSource || prev.leadSource || "" }));

//                 // Mobile & Email from correct source
//                 const mobileSource = contactPerson?.mobile || cust.mobile || option.mobile || "";
//                 const emailSource = contactPerson?.email || cust.email || option.email || "";

//                 const [code = "", ...mobileParts] = mobileSource.split(" ");
//                 setSelectedCustomerDetails({
//                     code,
//                     mobile: mobileParts.join(" "),
//                     email: emailSource,
//                 });

//                 // Fill addresses and company
//                 const getCountryIdByName = (name) => (!name ? "" : country.find((c) => c.country === name)?.id || "");
//                 const billingCountryId = getCountryIdByName(cust.billingCountry);
//                 const shippingCountryId = getCountryIdByName(cust.shippingCountry);

//                 setFilteredBillingZones(zones.find((z) => z.countryId === billingCountryId)?.zones || []);
//                 setFilteredShippingZones(zones.find((z) => z.countryId === shippingCountryId)?.zones || []);

//                 setSelectedCompany(cust.companyName || "");
//                 setCompanyDetails({
//                     companyName: cust.companyName || "",
//                     gstinNo: cust.gstinNo || "",
//                     customers: [cust],
//                     billingAddress: {
//                         street: cust.billingStreet || "",
//                         city: cust.billingCity || "",
//                         state: cust.billingState || "",
//                         pincode: cust.billingPincode || "",
//                         country: billingCountryId,
//                         zone: cust.billingZone || "",
//                     },
//                     shippingAddress: {
//                         street: cust.shippingStreet || "",
//                         city: cust.shippingCity || "",
//                         state: cust.shippingState || "",
//                         pincode: cust.shippingPincode || "",
//                         country: shippingCountryId,
//                         zone: cust.shippingZone || "",
//                     },
//                 });
//             }
//         }
//     };

//     const handleAddressChange = (type, field) => (e, value) => {
//         if (field === "country") {
//             const selectedCountry = value;
//             const countryId = selectedCountry?.id;

//             setCompanyDetails((prev) => ({
//                 ...prev,
//                 [type]: {
//                     ...prev[type],
//                     [field]: countryId,
//                     zone: "", // reset zone when country changes
//                 },
//             }));

//             const zoneData = zones.find((z) => z.countryId === countryId);

//             if (type === "billingAddress") {
//                 setFilteredBillingZones(zoneData ? zoneData.zones : []);
//             } else {
//                 setFilteredShippingZones(zoneData ? zoneData.zones : []);
//             }
//         } else {
//             const valueToUse = e.target.value;
//             setCompanyDetails((prev) => ({
//                 ...prev,
//                 [type]: {
//                     ...prev[type],
//                     [field]: valueToUse,
//                 },
//             }));
//         }
//     };

//     const [uploadLeadFiles, setUploadLeadFiles] = useState([]);
//     const [selectedFileIndex, setSelectedFileIndex] = useState(null);
//     const [fileMenuOpen, setFileMenuOpen] = useState(false);
//     const [previewFile, setPreviewFile] = useState(null);

//     // Load uploaded files from localStorage on mount
//     useEffect(() => {
//         const storedFiles = JSON.parse(localStorage.getItem("uploadLeadFiles")) || [];
//         setUploadLeadFiles(storedFiles);
//     }, []);

//     const toBase64 = (file) =>
//         new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result);
//             reader.onerror = reject;
//             reader.readAsDataURL(file);
//         });

//     const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "application/vnd.ms-excel",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     ];

//     const handleFileUpload = async (e) => {
//         const files = Array.from(e.target.files);
//         const validFiles = [];
//         let invalidFileSelected = false;

//         for (const file of files) {
//             if (allowedTypes.includes(file.type)) {
//                 const base64 = await toBase64(file);
//                 validFiles.push({
//                     name: file.name,
//                     type: file.type,
//                     size: file.size,
//                     base64: base64,
//                 });
//             } else {
//                 invalidFileSelected = true;
//             }
//         }

//         if (invalidFileSelected) {
//             setLocalSnackbarMessage("This file type is not allowed");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//         }

//         if (validFiles.length > 0) {
//             const updatedFiles = [...uploadLeadFiles, ...validFiles];
//             setUploadLeadFiles(updatedFiles);
//             localStorage.setItem("uploadLeadFiles", JSON.stringify(updatedFiles));
//         }

//         // Reset the input value so user can upload the same file again if needed
//         e.target.value = null;
//     };

//     const validateFields = () => {
//         let tempErrors = {};
//         let hasError = false;

//         if (businessMode === "B2B" && !selectedCompany) {
//             tempErrors.selectedCompany = true;
//             hasError = true;
//         }
//         if (form.assignedTo.length === 0) {
//             tempErrors.assignedTo = true;
//             hasError = true;
//         }
//         if (!form.selectedCustomer) {
//             tempErrors.selectedCustomer = true;
//             hasError = true;
//         }
//         form.productDetails.forEach((entry, idx) => {
//             if (!entry.productBrand) {
//                 tempErrors[`productDetails_${idx}_productBrand`] = true;
//                 hasError = true;
//             }
//             if (!entry.productCategory) {
//                 tempErrors[`productDetails_${idx}_productCategory`] = true;
//                 hasError = true;
//             }
//             if (!entry.productSubCategory) {
//                 tempErrors[`productDetails_${idx}_productSubCategory`] = true;
//                 hasError = true;
//             }
//             if (!entry.product) {
//                 tempErrors[`productDetails_${idx}_product`] = true;
//                 hasError = true;
//             }
//         });
//         if (!form.leadSource) {
//             tempErrors.leadSource = true;
//             hasError = true;
//         }
//         if (!form.leadStage) {
//             tempErrors.leadStage = true;
//             hasError = true;
//         }
//         if (!form.leadStatus) {
//             tempErrors.leadStatus = true;
//             hasError = true;
//         }
//         if (!form.description) {
//             tempErrors.description = true;
//             hasError = true;
//         }

//         setErrors(tempErrors);
//         return !hasError;
//     };

//     const convertBase64ToFile = (base64, filename, mimeType) => {
//         const arr = base64.split(",");
//         const byteString = atob(arr[1]);
//         const ab = new ArrayBuffer(byteString.length);
//         const ia = new Uint8Array(ab);
//         for (let i = 0; i < byteString.length; i++) {
//             ia[i] = byteString.charCodeAt(i);
//         }
//         return new window.File([ia], filename, { type: mimeType }); // ✅ safe usage
//     };

//     const handleSubmit = async () => {
//         if (!validateFields()) {
//             dispatch({ type: "ERROR", payload: "Please fill all required fields." });
//             // Show snackbar
//             setLocalSnackbarMessage("Please fill all required fields.");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const formattedDate = (dateStr) => dateStr.split("-").reverse().join("-");

//         const selectedCustomer = companyDetails.customers.find((cust) => {
//             const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//             return fullName === form.selectedCustomer;
//         });

//         const mobileWithCode = selectedCustomer?.mobile
//             ? selectedCustomer.mobile
//             : `${selectedCustomerDetails.code || ""} ${selectedCustomerDetails.mobile || ""}`.trim();

//         const result = {
//             date: formattedDate(form.date),
//             assignedTo: form.assignedTo,
//             companyName: selectedCompany,
//             gstinNo: companyDetails.gstinNo,
//             customerPerson: form.selectedCustomer,
//             mobile: mobileWithCode,
//             email: selectedCustomer?.email || selectedCustomerDetails.email || "",
//             leadSource: form.leadSource,
//             leadStage: form.leadStage,
//             leadStatus: form.leadStatus,
//             expectedAmount: form.expectedAmount,
//             description: form.description,
//             expectedClosingDate: formattedDate(form.expectedClosingDate),
//             followupDate: formattedDate(form.followupDate),
//             billingAddress: companyDetails.billingAddress,
//             shippingAddress: companyDetails.shippingAddress,
//             productDetails: form.productDetails.map((p) => ({
//                 productBrand: p.productBrand,
//                 productCategory: p.productCategory,
//                 productSubCategory: p.productSubCategory,
//                 product: p.product,
//                 hsnCode: p.hsnCode,
//                 unit: p.unit,
//                 description: p.description,
//             })),
//             apiLeadId: location.state?.apiLeadId || null,
//         };

//         const formData = new FormData();

//         formData.append("data", JSON.stringify(result));

//         uploadLeadFiles.forEach((file) => {
//             const convertedFile = convertBase64ToFile(file.base64, file.name, file.type);
//             formData.append("leadFiles", convertedFile);
//         });

//         dispatch(createLead(formData));
//     };

//     return (
//         <>
//             {initialLoad ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="card space-y-4">
//                     <div className="flex items-center justify-between text-nowrap">
//                         <div className="text-base font-semibold text-[#433C50] md:text-lg">Create New Lead :</div>
//                         <Button
//                             onClick={() => navigate(-1)}
//                             variant="gradient"
//                             className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                         >
//                             Back
//                         </Button>
//                     </div>

//                     {/* Business Type Selector */}
//                     <div className="mb-6 flex items-center gap-8">
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="radio"
//                                 id="b2b"
//                                 name="businessMode"
//                                 value="B2B"
//                                 checked={businessMode === "B2B"}
//                                 onChange={(e) => {
//                                     setBusinessMode(e.target.value);
//                                     if (e.target.value === "B2B") {
//                                         clearSearchData();
//                                     }
//                                 }}
//                             />
//                             <label
//                                 htmlFor="b2b"
//                                 className="cursor-pointer text-sm font-medium text-[#433C50]"
//                             >
//                                 B2B (Business to Business)
//                             </label>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="radio"
//                                 id="b2c"
//                                 name="businessMode"
//                                 value="B2C"
//                                 checked={businessMode === "B2C"}
//                                 onChange={(e) => {
//                                     setBusinessMode(e.target.value);
//                                     clearSearchData();
//                                 }}
//                             />
//                             <label
//                                 htmlFor="b2c"
//                                 className="cursor-pointer text-sm font-medium text-[#433C50]"
//                             >
//                                 B2C (Business to Consumer)
//                             </label>
//                         </div>
//                     </div>

//                     {/* Search Section */}
//                     <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
//                         {businessMode === "B2B" ? (
//                             <>
//                                 {/* Search by Company */}
//                                 <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
//                                     <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Company</div>
//                                     <Autocomplete
//                                         disablePortal
//                                         options={companyOptions}
//                                         getOptionLabel={(option) => option.label}
//                                         isOptionEqualToValue={(option, value) => option?.value === value?.value}
//                                         value={selectedCompanyRecord || null}
//                                         onChange={(e, newValue) => {
//                                             if (newValue) {
//                                                 setSelectedCompanyRecord(newValue);
//                                                 handleSearch("company", newValue);
//                                             } else {
//                                                 setSelectedCompanyRecord(null);
//                                                 clearSearchData();
//                                                 setAvailableCustomerNames([]);
//                                             }
//                                         }}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Select Company *"
//                                                 size="small"
//                                                 error={businessMode === "B2B" && errors.selectedCompany}
//                                             />
//                                         )}
//                                         className="w-56 md:w-72 lg:w-80"
//                                     />
//                                 </div>

//                                 {/* Select Customer */}
//                                 <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
//                                     <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Select Customer</div>
//                                     <Autocomplete
//                                         disablePortal
//                                         options={availableCustomerNames}
//                                         value={form.selectedCustomer || ""}
//                                         onChange={(e, newValue) => {
//                                             setForm((prev) => ({ ...prev, selectedCustomer: newValue || "" }));
//                                             // Optional: update mobile/email if needed
//                                         }}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Select Customer *"
//                                                 size="small"
//                                                 error={errors.selectedCustomer}
//                                                 disabled={availableCustomerNames.length === 0}
//                                             />
//                                         )}
//                                         className="w-56 md:w-72 lg:w-64"
//                                     />
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 {/* B2C: Search by Customer */}
//                                 {/* <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
//                                     <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Customer</div>
//                                     <Autocomplete
//                                         disablePortal
//                                         options={allCustomerNames}
//                                         value={form.selectedCustomer || ""}
//                                         onChange={(e, newValue) => {
//                                             if (newValue) {
//                                                 setForm((prev) => ({ ...prev, selectedCustomer: newValue }));
//                                                 handleSearch("customer", newValue);
//                                             } else {
//                                                 setForm((prev) => ({ ...prev, selectedCustomer: "" }));
//                                                 clearSearchData();
//                                             }
//                                         }}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Select Customer *"
//                                                 size="small"
//                                                 error={errors.selectedCustomer}
//                                             />
//                                         )}
//                                         className="w-56 md:w-72 lg:w-80"
//                                     />
//                                 </div> */}

//                                 {/* B2C: Search by Customer */}
//                                 <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
//                                     <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Customer</div>
//                                     <Autocomplete
//                                         disablePortal
//                                         options={customerNameOptions}
//                                         getOptionLabel={(option) => option.label}
//                                         isOptionEqualToValue={(option, value) => option?.id === value?.id}
//                                         value={selectedCustomerOption || null}
//                                         onChange={(e, newValue) => {
//                                             if (newValue) {
//                                                 setSelectedCustomerOption(newValue);
//                                                 setForm((prev) => ({ ...prev, selectedCustomer: newValue.label }));
//                                                 handleSearch("customer", newValue);
//                                             } else {
//                                                 setSelectedCustomerOption(null);
//                                                 setForm((prev) => ({ ...prev, selectedCustomer: "" }));
//                                                 clearSearchData();
//                                             }
//                                         }}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Select Customer *"
//                                                 size="small"
//                                                 error={errors.selectedCustomer}
//                                             />
//                                         )}
//                                         className="w-56 md:w-72 lg:w-80"
//                                     />
//                                 </div>

//                                 {/* B2C: Company Name (optional) */}
//                                 <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
//                                     <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Company Name</div>
//                                     <TextField
//                                         label="Company Name"
//                                         size="small"
//                                         value={selectedCompany}
//                                         onChange={(e) => setSelectedCompany(e.target.value)}
//                                         fullWidth
//                                         className="w-56 md:w-72 lg:w-64"
//                                     />
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     {/* Date and Assign */}
//                     <div className="items-center justify-between space-y-5 md:flex md:space-y-0 lg:flex lg:space-y-0">
//                         <TextField
//                             type="date"
//                             size="small"
//                             label="Date"
//                             value={form.date}
//                             onChange={handleDateChange}
//                         />
//                         <Autocomplete
//                             multiple
//                             disableCloseOnSelect
//                             options={employees.filter((emp) => !form.assignedTo.some((selected) => selected.id === emp.id))}
//                             getOptionLabel={(option) => formatEmployeeName(option)}
//                             value={form.assignedTo}
//                             onChange={(e, newValue) => {
//                                 setForm((prev) => ({
//                                     ...prev,
//                                     assignedTo: newValue || [], // newValue can be null sometimes
//                                 }));
//                                 setErrors((prev) => ({
//                                     ...prev,
//                                     assignedTo: false,
//                                 }));
//                             }}
//                             isOptionEqualToValue={(option, value) => option.id === value.id}
//                             renderTags={(value, getTagProps) =>
//                                 value.map((option, index) => {
//                                     const label = formatEmployeeName(option);
//                                     const { key, ...tagProps } = getTagProps({ index });

//                                     return (
//                                         <Chip
//                                             key={key}
//                                             variant="outlined"
//                                             label={label}
//                                             {...tagProps}
//                                         />
//                                     );
//                                 })
//                             }
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Assigned To *"
//                                     error={!!errors.assignedTo}
//                                     size="small"
//                                 />
//                             )}
//                             className="w-full md:w-64 lg:w-96"
//                             loading={loading} // optional: if employees are loading
//                             LoadingIndicator={
//                                 <CircularProgress
//                                     color="inherit"
//                                     size={20}
//                                 />
//                             }
//                         />
//                     </div>

//                     {/* Company Info */}
//                     <div className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Company Name"
//                             fullWidth
//                             value={companyDetails.companyName}
//                             InputProps={{ readOnly: true }}
//                             size="small"
//                         />
//                         <TextField
//                             label="GSTIN No"
//                             fullWidth
//                             value={companyDetails.gstinNo}
//                             onChange={handleCompanyDetailsChange("gstinNo")}
//                             size="small"
//                         />
//                     </div>

//                     {/* Customer Person */}
//                     <div className="flex w-full gap-2 md:gap-4 lg:gap-4">
//                         <TextField
//                             label="Customer Person *"
//                             size="small"
//                             value={form.selectedCustomer}
//                             onChange={handleChange("selectedCustomer")}
//                             error={errors.selectedCustomer}
//                             fullWidth
//                             InputProps={{ readOnly: true }}
//                         />
//                     </div>
//                     <div className="flex w-full flex-col gap-4 lg:flex-row">
//                         {/* Code + Mobile group (always in a row) */}
//                         <Box className="flex w-full flex-row gap-4 lg:flex-1">
//                             <TextField
//                                 label="Code"
//                                 value={selectedCustomerDetails.code}
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                                 sx={{ flex: 0.4 }}
//                             />
//                             <TextField
//                                 label="Mobile"
//                                 value={selectedCustomerDetails.mobile}
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                                 sx={{ flex: 1 }}
//                             />
//                         </Box>

//                         <TextField
//                             label="Email"
//                             value={selectedCustomerDetails.email}
//                             InputProps={{ readOnly: true }}
//                             size="small"
//                             sx={{
//                                 flex: 1,
//                             }}
//                         />
//                     </div>

//                     {/* Address Info */}
//                     <div className="flex-none gap-4 md:flex lg:flex">
//                         {/* Billing Address */}
//                         <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                             <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Street"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.billingAddress.street}
//                                     onChange={handleAddressChange("billingAddress", "street")}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="City"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.billingAddress.city}
//                                     onChange={handleAddressChange("billingAddress", "city")}
//                                 />
//                                 <TextField
//                                     label="State"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.billingAddress.state}
//                                     onChange={handleAddressChange("billingAddress", "state")}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Pincode"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.billingAddress.pincode}
//                                     onChange={handleAddressChange("billingAddress", "pincode")}
//                                 />
//                                 <Autocomplete
//                                     options={country}
//                                     getOptionLabel={(option) => option?.country || ""}
//                                     value={country.find((c) => c.id === companyDetails.billingAddress.country) || null}
//                                     onChange={handleAddressChange("billingAddress", "country")}
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Country"
//                                             size="small"
//                                         />
//                                     )}
//                                     fullWidth
//                                 />

//                                 <Autocomplete
//                                     options={filteredBillingZones}
//                                     getOptionLabel={(option) => option || ""}
//                                     value={companyDetails.billingAddress.zone || null}
//                                     onChange={(e, value) => handleAddressChange("billingAddress", "zone")({ target: { value } })}
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Zone"
//                                             size="small"
//                                         />
//                                     )}
//                                     fullWidth
//                                 />
//                             </Box>
//                         </div>

//                         {/* Shipping Address */}
//                         <div className="mt-3 w-full space-y-4 md:mt-0 md:w-1/2 lg:mt-0 lg:w-1/2">
//                             <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Street"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.shippingAddress.street}
//                                     onChange={handleAddressChange("shippingAddress", "street")}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="City"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.shippingAddress.city}
//                                     onChange={handleAddressChange("shippingAddress", "city")}
//                                 />
//                                 <TextField
//                                     label="State"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.shippingAddress.state}
//                                     onChange={handleAddressChange("shippingAddress", "state")}
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="Pincode"
//                                     fullWidth
//                                     size="small"
//                                     value={companyDetails.shippingAddress.pincode}
//                                     onChange={handleAddressChange("shippingAddress", "pincode")}
//                                 />
//                                 <Autocomplete
//                                     options={country}
//                                     getOptionLabel={(option) => option?.country || ""}
//                                     value={country.find((c) => c.id === companyDetails.shippingAddress.country) || null}
//                                     onChange={handleAddressChange("shippingAddress", "country")}
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Country"
//                                             size="small"
//                                         />
//                                     )}
//                                     fullWidth
//                                 />

//                                 <Autocomplete
//                                     options={filteredShippingZones}
//                                     getOptionLabel={(option) => option || ""}
//                                     value={companyDetails.shippingAddress.zone || null}
//                                     onChange={(e, value) => handleAddressChange("shippingAddress", "zone")({ target: { value } })}
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Zone"
//                                             size="small"
//                                         />
//                                     )}
//                                     fullWidth
//                                 />
//                             </Box>
//                         </div>
//                     </div>
//                     {/* Checkbox to copy billing address */}
//                     <div className="mt-4">
//                         <FormControlLabel
//                             control={
//                                 <Checkbox
//                                     size="small"
//                                     checked={copyShippingSameAsBilling}
//                                     onChange={(e) => {
//                                         const checked = e.target.checked;
//                                         setCopyShippingSameAsBilling(checked);
//                                         if (checked) {
//                                             // Copy billing to shipping
//                                             setCompanyDetails((prev) => ({
//                                                 ...prev,
//                                                 shippingAddress: { ...prev.billingAddress },
//                                             }));
//                                             // Copy zones too
//                                             setFilteredShippingZones([...filteredBillingZones]);
//                                         }
//                                     }}
//                                 />
//                             }
//                             label="Shipping address is same as billing address"
//                         />
//                     </div>

//                     {/* Product Details */}
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-2">
//                             <p className="font-semibold text-[#433C50]">Product Details</p>
//                             <CirclePlus
//                                 size={20}
//                                 className="cursor-pointer text-blue-500"
//                                 onClick={handleAddProduct}
//                             />
//                         </div>

//                         {form.productDetails.map((entry, index) => (
//                             <Box
//                                 key={index}
//                                 className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center"
//                             >
//                                 {form.productDetails.length > 1 && (
//                                     <div className="self-start lg:self-center">
//                                         <CircleMinus
//                                             size={20}
//                                             className="cursor-pointer text-red-500"
//                                             onClick={() => handleRemoveProduct(index)}
//                                         />
//                                     </div>
//                                 )}
//                                 <div className="flex w-full flex-1 flex-col gap-4 lg:flex-row">
//                                     {/* Product Brand */}
//                                     <Autocomplete
//                                         disablePortal
//                                         options={productBrand.map((brand) => brand.productBrand)}
//                                         value={entry.productBrand || ""}
//                                         onChange={(e, newValue) =>
//                                             handleProductFieldChange(
//                                                 index,
//                                                 "productBrand",
//                                             )({
//                                                 target: { value: newValue },
//                                             })
//                                         }
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Product Brand *"
//                                                 size="small"
//                                                 error={!!errors[`productDetails_${index}_productBrand`]}
//                                             />
//                                         )}
//                                         className="flex-1"
//                                     />
//                                     {/* Product Category */}
//                                     <Autocomplete
//                                         disablePortal
//                                         options={entry.filteredCategories || []}
//                                         value={entry.productCategory || ""}
//                                         onChange={(e, newValue) =>
//                                             handleProductFieldChange(
//                                                 index,
//                                                 "productCategory",
//                                             )({
//                                                 target: { value: newValue },
//                                             })
//                                         }
//                                         disabled={!entry.productBrand}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Product Category *"
//                                                 size="small"
//                                                 error={!!errors[`productDetails_${index}_productCategory`]}
//                                             />
//                                         )}
//                                         className="flex-1"
//                                     />
//                                     {/* Product Sub-Category */}
//                                     <Autocomplete
//                                         disablePortal
//                                         options={entry.filteredSubCategories || []}
//                                         value={entry.productSubCategory || ""}
//                                         onChange={(e, newValue) =>
//                                             handleProductFieldChange(
//                                                 index,
//                                                 "productSubCategory",
//                                             )({
//                                                 target: { value: newValue },
//                                             })
//                                         }
//                                         disabled={!entry.productCategory}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Product Sub-Category *"
//                                                 size="small"
//                                                 error={!!errors[`productDetails_${index}_productSubCategory`]}
//                                             />
//                                         )}
//                                         className="flex-1"
//                                     />
//                                     {/* Product */}
//                                     <Autocomplete
//                                         disablePortal
//                                         options={(entry.filteredProducts || []).map((prod) => prod.name)}
//                                         value={entry.product || ""}
//                                         onChange={(e, newValue) =>
//                                             handleProductFieldChange(
//                                                 index,
//                                                 "product",
//                                             )({
//                                                 target: { value: newValue },
//                                             })
//                                         }
//                                         disabled={!entry.productSubCategory}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="Product *"
//                                                 size="small"
//                                                 error={!!errors[`productDetails_${index}_product`]}
//                                             />
//                                         )}
//                                         className="flex-1"
//                                     />
//                                 </div>
//                             </Box>
//                         ))}
//                     </div>

//                     {/* Lead Details */}
//                     <div className="space-y-4">
//                         <p className="font-semibold text-[#433C50]">Lead Details</p>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             {/* Lead Source */}
//                             <Autocomplete
//                                 disablePortal
//                                 options={leadSource.map((option) => option.leadSource)}
//                                 value={form.leadSource || ""}
//                                 onChange={(e, newValue) => handleChange("leadSource")({ target: { value: newValue } })}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Lead Source *"
//                                         size="small"
//                                         error={!!errors.leadSource}
//                                     />
//                                 )}
//                                 className="flex-1"
//                             />

//                             {/* Lead Stage */}
//                             <Autocomplete
//                                 disablePortal
//                                 options={leadStage.map((option) => option.leadStage)}
//                                 value={form.leadStage || ""}
//                                 onChange={(e, newValue) => handleChange("leadStage")({ target: { value: newValue } })}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Lead Stage *"
//                                         size="small"
//                                         error={!!errors.leadStage}
//                                     />
//                                 )}
//                                 className="flex-1"
//                             />

//                             {/* Lead Status */}
//                             <Autocomplete
//                                 disablePortal
//                                 options={leadStatus.map((option) => option.leadStatus)}
//                                 value={form.leadStatus || ""}
//                                 onChange={(e, newValue) => handleChange("leadStatus")({ target: { value: newValue } })}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Lead Status *"
//                                         size="small"
//                                         error={!!errors.leadStatus}
//                                     />
//                                 )}
//                                 className="flex-1"
//                             />
//                         </Box>

//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 type="date"
//                                 size="small"
//                                 label="Followup Date"
//                                 value={form.followupDate}
//                                 onChange={handleFollowupDateChange}
//                                 sx={{ flex: 2 }}
//                             />
//                             <TextField
//                                 label="Expected Amount"
//                                 placeholder="Expected Amount"
//                                 type="number"
//                                 value={form.expectedAmount}
//                                 onChange={handleChange("expectedAmount")}
//                                 onWheel={(e) => e.target.blur()}
//                                 inputProps={{ min: 0 }}
//                                 fullWidth
//                                 size="small"
//                                 sx={{ flex: 2 }}
//                             />
//                             <TextField
//                                 type="date"
//                                 size="small"
//                                 label="Expected Closing Date"
//                                 value={form.expectedClosingDate}
//                                 onChange={handleExpectedClosingDateChange}
//                                 sx={{ flex: 2 }}
//                             />
//                         </Box>
//                     </div>

//                     {/* Description */}
//                     <Box>
//                         <TextField
//                             label="Description *"
//                             placeholder="Description"
//                             value={form.description}
//                             onChange={handleChange("description")}
//                             error={errors.description}
//                             multiline
//                             minRows={2}
//                             fullWidth
//                             size="small"
//                             sx={{
//                                 flex: 2,
//                             }}
//                         />
//                     </Box>

//                     {/* File Upload Section */}
//                     <Box mt={2}>
//                         <input
//                             type="file"
//                             accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//                             multiple
//                             ref={fileInputRef}
//                             onChange={handleFileUpload}
//                             style={{ display: "none" }}
//                         />
//                         <Button
//                             variant="gradient"
//                             className="bg-green-500"
//                             onClick={() => fileInputRef.current.click()}
//                         >
//                             Upload Files
//                         </Button>

//                         <Box
//                             mt={2}
//                             className="grid grid-cols-4 gap-4 md:grid-cols-7 lg:grid-cols-10"
//                         >
//                             {uploadLeadFiles.map((file, index) => (
//                                 <div
//                                     key={index}
//                                     className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded border bg-gray-100 p-2"
//                                 >
//                                     {/* File Preview */}
//                                     {file.type.startsWith("image/") ? (
//                                         <img
//                                             src={file.base64}
//                                             alt="Uploaded"
//                                             className="h-full w-full rounded object-cover md:h-full lg:h-20"
//                                         />
//                                     ) : (
//                                         <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center text-xs font-medium text-gray-700 md:h-full lg:h-20">
//                                             {file.type === "application/pdf" ? (
//                                                 <FaFilePdf className="h-10 w-10 text-red-500" />
//                                             ) : file.type === "application/vnd.ms-excel" ||
//                                               file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
//                                                 <FaFileExcel className="h-10 w-10 text-green-500" />
//                                             ) : (
//                                                 // fallback: show filename for other docs (like Word, etc.)
//                                                 <span className="break-words">{file.name}</span>
//                                             )}
//                                         </div>
//                                     )}

//                                     {/* Three Dots */}
//                                     <div
//                                         className="absolute right-1 top-1 hidden cursor-pointer group-hover:block"
//                                         onClick={() => {
//                                             setSelectedFileIndex(index);
//                                             setFileMenuOpen(true);
//                                         }}
//                                     >
//                                         <span className="text-xl font-bold">⋮</span>
//                                     </div>
//                                 </div>
//                             ))}
//                         </Box>
//                         {fileMenuOpen && selectedFileIndex !== null && (
//                             <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30">
//                                 <div className="relative w-52 rounded bg-white p-2 shadow-lg">
//                                     <div className="mb-2 flex items-center justify-between">
//                                         <div>Option</div>
//                                         {/* Close Icon */}
//                                         <div
//                                             className="cursor-pointer"
//                                             onClick={() => setFileMenuOpen(false)}
//                                         >
//                                             <X className="h-5 w-5" />
//                                         </div>
//                                     </div>
//                                     <div className="flex justify-center gap-4">
//                                         {/* File Icon (click to preview) */}
//                                         <div
//                                             className="cursor-pointer text-blue-600 hover:text-blue-800"
//                                             onClick={() => {
//                                                 setPreviewFile(uploadLeadFiles[selectedFileIndex]);
//                                                 setFileMenuOpen(false);
//                                             }}
//                                         >
//                                             <File className="h-6 w-6" />
//                                         </div>

//                                         {/* Trash Icon Only */}
//                                         <div
//                                             className="cursor-pointer text-red-500 hover:text-red-700"
//                                             onClick={() => {
//                                                 const updated = [...uploadLeadFiles];
//                                                 updated.splice(selectedFileIndex, 1);
//                                                 setUploadLeadFiles(updated);
//                                                 localStorage.setItem("uploadLeadFiles", JSON.stringify(updated));
//                                                 setFileMenuOpen(false);
//                                             }}
//                                         >
//                                             <Trash className="h-6 w-6" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                         {previewFile && (
//                             <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
//                                 <div className="relative h-[80vh] w-[80vw] overflow-hidden rounded bg-white p-4 shadow-lg">
//                                     {/* Close Icon */}
//                                     <div
//                                         className="cursor-pointer justify-self-end"
//                                         onClick={() => setPreviewFile(null)}
//                                     >
//                                         <X className="h-5 w-5" />
//                                     </div>

//                                     <div className="mt-2 flex h-full w-full items-center justify-center">
//                                         {previewFile.type.startsWith("image/") ? (
//                                             <img
//                                                 src={previewFile.base64}
//                                                 alt="Preview"
//                                                 className="max-h-full max-w-full object-contain"
//                                             />
//                                         ) : (
//                                             <iframe
//                                                 src={previewFile.base64}
//                                                 title="Preview File"
//                                                 className="h-full w-full border"
//                                             />
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </Box>

//                     {/* Submit Button */}
//                     <div className="flex justify-end">
//                         <Button
//                             onClick={handleSubmit}
//                             disabled={loading || isSuccessProcessing} // Disable during API call or success processing
//                             variant="gradient"
//                             className={`flex items-center gap-2 rounded px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base ${
//                                 isSuccessProcessing
//                                     ? "cursor-not-allowed bg-[#053054]/70 opacity-70" // Blurred look on success
//                                     : "bg-[#053054] hover:bg-[#053054]/90"
//                             } transition-all`}
//                         >
//                             {isSuccessProcessing ? (
//                                 <>
//                                     <CircularProgress
//                                         size={18}
//                                         thickness={5}
//                                         className="text-white"
//                                     />
//                                     <span>Generating...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <MdOutlineLeaderboard size={20} />
//                                     Generate Lead
//                                 </>
//                             )}
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
//                     onClose={handleSnackbarClose}
//                     severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
//                     variant="filled"
//                 >
//                     {snackbarMessage || localSnackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default CreateLeads;


import React, { useEffect, useRef, useState } from "react";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCustomers } from "../../redux/actions/customer";
import { getRoles } from "../../redux/actions/rbac";
import { getEmployees } from "../../redux/actions/employee";
import { getCountry } from "../../redux/actions/country";
import { getZones } from "../../redux/actions/zones";
import { getLeadSource } from "../../redux/actions/leadSource";
import { getLeadStage } from "../../redux/actions/leadStage";
import { getLeadStatus } from "../../redux/actions/leadStatus";
import { getProductBrand } from "../../redux/actions/productBrand";
import { getProductCategory } from "../../redux/actions/productCategory";
import { getProductSubCategory } from "../../redux/actions/productSubCategory";
import { getProduct } from "../../redux/actions/product";
import { createLead } from "../../redux/actions/leadAndFollowup";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { Alert, Autocomplete, Box, Chip, Snackbar, TextField, CircularProgress, FormControlLabel, Checkbox } from "@mui/material";
import { ArrowLeft, Building2, CheckCircle2, CircleMinus, CirclePlus, File, MapPin, PackageSearch, Search, Sparkles, Trash, TrendingUp, UploadCloud, UserCheck, X } from "lucide-react";
import { MdOutlineLeaderboard } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { LEAD_ERROR } from "../../redux/types";

const CreateLeads = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const location = useLocation();
    const apiLead = location.state?.lead;
    const initialModeFromLanding = location.state?.initialBusinessMode;
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        assignedTo: user?.id ? [user] : [],
        selectedCustomer: "",
        date: "",
        productDetails: [
            {
                productBrand: "",
                productCategory: "",
                productSubCategory: "",
                product: "",
                filteredCategories: [],
                filteredSubCategories: [],
                filteredProducts: [],
            },
        ],
        leadSource: "",
        leadStage: "",
        leadStatus: "",
        followupDate: "",
        expectedAmount: "",
        expectedClosingDate: "",
        description: "",
    });
    const { customers } = useSelector((state) => state.customer);
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);
    const { country } = useSelector((state) => state.country);
    const { zones } = useSelector((state) => state.zones);
    const { leadSource } = useSelector((state) => state.leadSource);
    const { leadStage } = useSelector((state) => state.leadStage);
    const { leadStatus } = useSelector((state) => state.leadStatus);
    const { productBrand } = useSelector((state) => state.productBrand);
    const { productCategory } = useSelector((state) => state.productCategory);
    const { productSubCategory } = useSelector((state) => state.productSubCategory);
    const { product } = useSelector((state) => state.product);
    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.leadAndFollowup);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [companyDetails, setCompanyDetails] = useState({
        companyName: "",
        gstinNo: "",
        customers: [],
        billingAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
            zone: "",
        },
        shippingAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
            zone: "",
        },
    });
    const [copyShippingSameAsBilling, setCopyShippingSameAsBilling] = useState(false);
    const [filteredBillingZones, setFilteredBillingZones] = useState([]);
    const [filteredShippingZones, setFilteredShippingZones] = useState([]);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({ code: "", mobile: "", email: "" });
    const [isSuccessProcessing, setIsSuccessProcessing] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
    const [selectedCompanyRecord, setSelectedCompanyRecord] = useState(null);
    // const [businessMode, setBusinessMode] = useState("B2B"); // "B2B" or "B2C"
    const [businessMode, setBusinessMode] = useState(() => {
        // Priority: value coming from landing page lead → fallback to B2B
        if (initialModeFromLanding === "B2B" || initialModeFromLanding === "B2C") {
            return initialModeFromLanding;
        }
        return "B2B"; // default for normal creation (not from landing)
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(getCustomers()),
                    dispatch(getRoles()),
                    dispatch(getEmployees()),
                    dispatch(getCountry()),
                    dispatch(getZones()),
                    dispatch(getLeadSource()),
                    dispatch(getLeadStage()),
                    dispatch(getLeadStatus()),
                    dispatch(getProductBrand()),
                    dispatch(getProductCategory()),
                    dispatch(getProductSubCategory()),
                    dispatch(getProduct()),
                ]);
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    useEffect(() => {
        if (snackbarSeverity === "success" && snackbarMessage === "Lead and follow-up created successfully") {
            setIsSuccessProcessing(true);
            setForm({
                assignedTo: [],
                selectedCustomer: "",
                date: "",
                followupDate: "",
                expectedClosingDate: "",
                productDetails: [
                    {
                        productBrand: "",
                        productCategory: "",
                        productSubCategory: "",
                        product: "",
                        filteredCategories: [],
                        filteredSubCategories: [],
                        filteredProducts: [],
                    },
                ],
                leadSource: "",
                leadStage: "",
                leadStatus: "",
                expectedAmount: "",
                description: "",
            });

            setSelectedCompany("");
            setCompanyDetails({
                companyName: "",
                gstinNo: "",
                customers: [],
                billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
                shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            });

            setSelectedCustomerDetails({ mobile: "", email: "" });
            setUploadLeadFiles([]);
            localStorage.removeItem("uploadLeadFiles");

            setTimeout(() => {
                setIsSuccessProcessing(false);
                dispatch(clearSnackbar());
                navigate("/leads");
            }, 1000);
        }
    }, [snackbarMessage, snackbarSeverity, dispatch, navigate]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
            dispatch(clearSnackbar());
    };

    useEffect(() => {
        if (apiLead) {
            // ✅ Split mobile number into code + number
            let code = "";
            let mobile = "";
            if (apiLead.SENDER_MOBILE) {
                const parts = apiLead.SENDER_MOBILE.split(" ");
                code = parts[0] || "";
                mobile = parts[1] || "";
            }

            setSelectedCompany(apiLead.SENDER_COMPANY || "");
            setCompanyDetails((prev) => ({
                ...prev,
                companyName: apiLead.SENDER_COMPANY || "",
                billingAddress: {
                    street: apiLead.SENDER_ADDRESS || "",
                    city: apiLead.SENDER_CITY || "",
                    state: apiLead.SENDER_STATE || "",
                    pincode: apiLead.SENDER_PINCODE || "",
                    country: apiLead.SENDER_COUNTRY || "",
                    zone: "",
                },
            }));

            setForm((prev) => ({
                ...prev,
                selectedCustomer: apiLead.SENDER_NAME || "",
                date: apiLead.date || "",
                code,
                mobile,
                email: apiLead.SENDER_EMAIL || "",
                leadSource: apiLead.LEAD_SOURCE || "",
                description: apiLead.QUERY_MESSAGE || "",
            }));

            setSelectedCustomerDetails({
                code,
                mobile,
                email: apiLead.SENDER_EMAIL || "",
            });
        }
    }, [apiLead]);

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        setForm((prev) => ({ ...prev, date: formattedDate }));
        setForm((prev) => ({ ...prev, followupDate: formattedDate }));
        setForm((prev) => ({ ...prev, expectedClosingDate: formattedDate }));
    }, []);

    const handleChange = (field) => (e) => {
        const value = e.target.value;

        setForm((prevForm) => {
            const updatedForm = { ...prevForm, [field]: value };
            return updatedForm;
        });

        setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));

        if (field === "selectedCustomer") {
            const selected = companyDetails.customers.find((cust) => {
                const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
                return fullName === value;
            });

            if (selected) {
                setSelectedCustomerDetails({
                    mobile: selected.mobile,
                    email: selected.email,
                });
            } else {
                setSelectedCustomerDetails({ mobile: "", email: "" });
            }
        }
    };

    const handleCompanyDetailsChange = (field) => (e) => {
        const value = e.target.value;
        setCompanyDetails((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleProductFieldChange = (index, field) => (e) => {
        const value = e.target.value;
        const updatedProducts = [...form.productDetails];
        const productEntry = { ...updatedProducts[index], [field]: value };

        if (field === "productBrand") {
            // Filter categories for selected brand
            const brandCatObj = productCategory.find((cat) => cat.brand === value);
            const filteredCategories = brandCatObj ? brandCatObj.categories : [];

            productEntry.productCategory = "";
            productEntry.productSubCategory = "";
            productEntry.product = "";
            productEntry.filteredCategories = filteredCategories;
            productEntry.filteredSubCategories = [];
            productEntry.filteredProducts = [];
            productEntry.hsnCode = "";
        }

        if (field === "productCategory") {
            // Filter sub-categories for selected brand & category
            const subCatObj = productSubCategory.find((sub) => sub.brand === productEntry.productBrand && sub.productCategoryName === value);
            const filteredSubCategories = subCatObj ? subCatObj.subCategories : [];

            productEntry.productSubCategory = "";
            productEntry.product = "";
            productEntry.filteredSubCategories = filteredSubCategories;
            productEntry.filteredProducts = [];
            productEntry.hsnCode = "";
        }

        if (field === "productSubCategory") {
            // Get all products for brand + category + sub-category
            const filteredProducts = product
                .filter(
                    (p) =>
                        p.brand === productEntry.productBrand &&
                        p.productCategoryName === productEntry.productCategory &&
                        p.productSubCategoryName === value,
                )
                .map((p) => ({
                    name: p.product,
                    hsnCode: p.hsnCode,
                    unit: p.productUnitName,
                    description: p.description,
                }));

            productEntry.product = "";
            productEntry.filteredProducts = filteredProducts;
            productEntry.hsnCode = "";
        }

        if (field === "product") {
            const selectedProd = productEntry.filteredProducts.find((p) => p.name === value);
            if (selectedProd) {
                productEntry.product = selectedProd.name;
                productEntry.hsnCode = selectedProd.hsnCode || "";
                productEntry.unit = selectedProd.unit || "";
                productEntry.description = selectedProd.description || "";
            }
        }

        updatedProducts[index] = productEntry;
        setForm({ ...form, productDetails: updatedProducts });

        setErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            delete updatedErrors[`productDetails_${index}_${field}`];
            return updatedErrors;
        });
    };

    const handleAddProduct = () => {
        setForm((prev) => ({
            ...prev,
            productDetails: [
                ...prev.productDetails,
                {
                    productBrand: "",
                    productCategory: "",
                    productSubCategory: "",
                    product: "",
                    filteredCategories: [],
                    filteredSubCategories: [],
                    filteredProducts: [],
                },
            ],
        }));
    };

    const handleRemoveProduct = (index) => {
        const updated = [...form.productDetails];
        updated.splice(index, 1);
        setForm({ ...form, productDetails: updated });
    };

    const handleDateChange = (e) => {
        setForm({ ...form, date: e.target.value });
    };

    const handleFollowupDateChange = (e) => {
        setForm({ ...form, followupDate: e.target.value });
    };

    const handleExpectedClosingDateChange = (e) => {
        setForm({ ...form, expectedClosingDate: e.target.value });
    };

    const clearSearchData = () => {
        setCompanyDetails({
            companyName: "",
            gstinNo: "",
            customers: [],
            billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
        });
        setSelectedCompany("");
        setForm((prev) => ({ ...prev, selectedCustomer: "" }));
        setSelectedCustomerDetails({ code: "", mobile: "", email: "" });
        setFilteredBillingZones([]);
        setFilteredShippingZones([]);
    };

    useEffect(() => {
        if (customers.length > 0) {
            const options = customers
                .filter((cust) => {
                    // Only include customers who have a valid company name (for B2B)
                    return cust.companyName && cust.companyName.trim() !== "";
                })
                .map((cust) => {
                    const industryPart = cust.industry ? ` (${cust.industry})` : "";
                    const cleanLabel = `${cust.companyName.trim()}${industryPart}`;

                    // Collect all contact full names
                    const contactNames = new Set();
                    const mainFullName = [cust.salutation || "", cust.firstName || "", cust.middleName || "", cust.lastName || ""]
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (mainFullName) contactNames.add(mainFullName);

                    (cust.contacts || []).forEach((contact) => {
                        const full = [contact.salutation || "", contact.firstName || "", contact.middleName || "", contact.lastName || ""]
                            .join(" ")
                            .replace(/\s+/g, " ")
                            .trim();
                        if (full) contactNames.add(full);
                    });

                    return {
                        label: cleanLabel,
                        value: cust.id,
                        recordId: cust.id,
                        companyName: cust.companyName.trim(),
                        industry: cust.industry || "",
                        mainContactName: mainFullName,
                        contactList: Array.from(contactNames),
                        fullRecord: cust,
                    };
                });

            // Handle duplicates (same company name + industry)
            const seen = new Set();
            const uniqueOptions = [];
            const duplicateMap = {};

            options.forEach((opt) => {
                if (seen.has(opt.label)) {
                    duplicateMap[opt.label] = (duplicateMap[opt.label] || 0) + 1;
                } else {
                    seen.add(opt.label);
                }
                uniqueOptions.push(opt);
            });

            const finalOptions = uniqueOptions.map((opt) => {
                if (duplicateMap[opt.label] > 1) {
                    const count = options.filter((o) => o.label === opt.label).indexOf(opt) + 1;
                    return { ...opt, label: `${opt.label} (${count})` };
                }
                return opt;
            });

            finalOptions.sort((a, b) => a.label.localeCompare(b.label));
            setCompanyOptions(finalOptions);
        } else {
            setCompanyOptions([]);
        }
    }, [customers]);

    const [customerNameOptions, setCustomerNameOptions] = useState([]);
    const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);

    useEffect(() => {
        if (customers.length > 0) {
            const options = [];
            let optionIdCounter = 0;

            customers.forEach((cust) => {
                // Helper to add a person (main or additional contact)
                const addPerson = (person, isMain = false) => {
                    const fullName = [person.salutation || "", person.firstName || "", person.middleName || "", person.lastName || ""]
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();

                    if (!fullName) return;

                    options.push({
                        id: optionIdCounter++, // unique internal id
                        label: fullName, // what user sees
                        value: fullName, // for comparison
                        record: cust, // full customer record
                        contactPerson: isMain ? null : person,
                        isMainContact: isMain,
                        mobile: isMain ? cust.mobile : person.mobile || cust.mobile || "",
                        email: isMain ? cust.email : person.email || cust.email || "",
                    });
                };

                // Main contact
                addPerson(cust, true);

                // Additional contacts
                (cust.contacts || []).forEach((contact) => {
                    addPerson(contact, false);
                });
            });

            // Sort by name
            options.sort((a, b) => a.label.localeCompare(b.label));
            setCustomerNameOptions(options);
        } else {
            setCustomerNameOptions([]);
        }
    }, [customers]);

    const handleSearch = (type, selectedOptionOrName) => {
        if (businessMode === "B2B") {
            if (type === "company" && selectedOptionOrName) {
                const cust = selectedOptionOrName.fullRecord;
                setSelectedCompanyRecord(selectedOptionOrName);
                setSelectedCompany(cust.companyName || "");
                // ... rest of existing B2B company logic (same as before)
                const getCountryIdByName = (name) => (!name ? "" : country.find((c) => c.country === name)?.id || "");
                const getZonesByCountryId = (countryId) => (!countryId ? [] : zones.find((z) => z.countryId === countryId)?.zones || []);

                const billingCountryId = getCountryIdByName(cust.billingCountry);
                const shippingCountryId = getCountryIdByName(cust.shippingCountry);

                setFilteredBillingZones(getZonesByCountryId(billingCountryId));
                setFilteredShippingZones(getZonesByCountryId(shippingCountryId));

                setCompanyDetails({
                    companyName: cust.companyName || "",
                    gstinNo: cust.gstinNo || "",
                    customers: [cust],
                    billingAddress: {
                        street: cust.billingStreet || "",
                        city: cust.billingCity || "",
                        state: cust.billingState || "",
                        pincode: cust.billingPincode || "",
                        country: billingCountryId,
                        zone: cust.billingZone || "",
                    },
                    shippingAddress: {
                        street: cust.shippingStreet || "",
                        city: cust.shippingCity || "",
                        state: cust.shippingState || "",
                        pincode: cust.shippingPincode || "",
                        country: shippingCountryId,
                        zone: cust.shippingZone || "",
                    },
                });

                setAvailableCustomerNames(selectedOptionOrName.contactList);

                if (selectedOptionOrName.contactList.length > 0) {
                    const defaultCustomer = selectedOptionOrName.mainContactName;
                    setForm((prev) => ({ ...prev, selectedCustomer: defaultCustomer, leadSource: cust.leadSource || prev.leadSource || "" }));
                    const [code = "", ...mobileParts] = (cust.mobile || "").split(" ");
                    setSelectedCustomerDetails({
                        code,
                        mobile: mobileParts.join(" "),
                        email: cust.email || "",
                    });
                }
            }
        } else {
            // === B2C Mode: Search by Customer ===
            if (type === "customer" && selectedOptionOrName) {
                const option = selectedOptionOrName; // full rich option
                const cust = option.record;
                const isMain = option.isMainContact;
                const contactPerson = option.contactPerson;

                // Set the displayed name
                setForm((prev) => ({ ...prev, selectedCustomer: option.label, leadSource: cust.leadSource || prev.leadSource || "" }));

                // Mobile & Email from correct source
                const mobileSource = contactPerson?.mobile || cust.mobile || option.mobile || "";
                const emailSource = contactPerson?.email || cust.email || option.email || "";

                const [code = "", ...mobileParts] = mobileSource.split(" ");
                setSelectedCustomerDetails({
                    code,
                    mobile: mobileParts.join(" "),
                    email: emailSource,
                });

                // Fill addresses and company
                const getCountryIdByName = (name) => (!name ? "" : country.find((c) => c.country === name)?.id || "");
                const billingCountryId = getCountryIdByName(cust.billingCountry);
                const shippingCountryId = getCountryIdByName(cust.shippingCountry);

                setFilteredBillingZones(zones.find((z) => z.countryId === billingCountryId)?.zones || []);
                setFilteredShippingZones(zones.find((z) => z.countryId === shippingCountryId)?.zones || []);

                setSelectedCompany(cust.companyName || "");
                setCompanyDetails({
                    companyName: cust.companyName || "",
                    gstinNo: cust.gstinNo || "",
                    customers: [cust],
                    billingAddress: {
                        street: cust.billingStreet || "",
                        city: cust.billingCity || "",
                        state: cust.billingState || "",
                        pincode: cust.billingPincode || "",
                        country: billingCountryId,
                        zone: cust.billingZone || "",
                    },
                    shippingAddress: {
                        street: cust.shippingStreet || "",
                        city: cust.shippingCity || "",
                        state: cust.shippingState || "",
                        pincode: cust.shippingPincode || "",
                        country: shippingCountryId,
                        zone: cust.shippingZone || "",
                    },
                });
            }
        }
    };

    const handleAddressChange = (type, field) => (e, value) => {
        if (field === "country") {
            const selectedCountry = value;
            const countryId = selectedCountry?.id;

            setCompanyDetails((prev) => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: countryId,
                    zone: "", // reset zone when country changes
                },
            }));

            const zoneData = zones.find((z) => z.countryId === countryId);

            if (type === "billingAddress") {
                setFilteredBillingZones(zoneData ? zoneData.zones : []);
            } else {
                setFilteredShippingZones(zoneData ? zoneData.zones : []);
            }
        } else {
            const valueToUse = e.target.value;
            setCompanyDetails((prev) => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: valueToUse,
                },
            }));
        }
    };

    const [uploadLeadFiles, setUploadLeadFiles] = useState([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState(null);
    const [fileMenuOpen, setFileMenuOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    // Load uploaded files from localStorage on mount
    useEffect(() => {
        const storedFiles = JSON.parse(localStorage.getItem("uploadLeadFiles")) || [];
        setUploadLeadFiles(storedFiles);
    }, []);

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        let invalidFileSelected = false;

        for (const file of files) {
            if (allowedTypes.includes(file.type)) {
                const base64 = await toBase64(file);
                validFiles.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    base64: base64,
                });
            } else {
                invalidFileSelected = true;
            }
        }

        if (invalidFileSelected) {
            dispatch({
                type: LEAD_ERROR,
                payload: "This file type is not allowed",
            });
        }

        if (validFiles.length > 0) {
            const updatedFiles = [...uploadLeadFiles, ...validFiles];
            setUploadLeadFiles(updatedFiles);
            localStorage.setItem("uploadLeadFiles", JSON.stringify(updatedFiles));
        }

        // Reset the input value so user can upload the same file again if needed
        e.target.value = null;
    };

    const validateFields = () => {
        let tempErrors = {};
        let hasError = false;

        if (businessMode === "B2B" && !selectedCompany) {
            tempErrors.selectedCompany = true;
            hasError = true;
        }
        if (form.assignedTo.length === 0) {
            tempErrors.assignedTo = true;
            hasError = true;
        }
        if (!form.selectedCustomer) {
            tempErrors.selectedCustomer = true;
            hasError = true;
        }
        form.productDetails.forEach((entry, idx) => {
            if (!entry.productBrand) {
                tempErrors[`productDetails_${idx}_productBrand`] = true;
                hasError = true;
            }
            if (!entry.productCategory) {
                tempErrors[`productDetails_${idx}_productCategory`] = true;
                hasError = true;
            }
            if (!entry.productSubCategory) {
                tempErrors[`productDetails_${idx}_productSubCategory`] = true;
                hasError = true;
            }
            if (!entry.product) {
                tempErrors[`productDetails_${idx}_product`] = true;
                hasError = true;
            }
        });
        if (!form.leadSource) {
            tempErrors.leadSource = true;
            hasError = true;
        }
        if (!form.leadStage) {
            tempErrors.leadStage = true;
            hasError = true;
        }
        if (!form.leadStatus) {
            tempErrors.leadStatus = true;
            hasError = true;
        }
        if (!form.description) {
            tempErrors.description = true;
            hasError = true;
        }

        setErrors(tempErrors);
        return !hasError;
    };

    const convertBase64ToFile = (base64, filename, mimeType) => {
        const arr = base64.split(",");
        const byteString = atob(arr[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new window.File([ia], filename, { type: mimeType }); // ✅ safe usage
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            dispatch({ type: "ERROR", payload: "Please fill all required fields." });
            dispatch({
                type: LEAD_ERROR,
                payload: "Please fill all required fields.",
            });
            return;
        }

        const formattedDate = (dateStr) => dateStr.split("-").reverse().join("-");

        const selectedCustomer = companyDetails.customers.find((cust) => {
            const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
            return fullName === form.selectedCustomer;
        });

        const mobileWithCode = selectedCustomer?.mobile
            ? selectedCustomer.mobile
            : `${selectedCustomerDetails.code || ""} ${selectedCustomerDetails.mobile || ""}`.trim();

        const result = {
            date: formattedDate(form.date),
            assignedTo: form.assignedTo,
            companyName: selectedCompany,
            gstinNo: companyDetails.gstinNo,
            customerPerson: form.selectedCustomer,
            mobile: mobileWithCode,
            email: selectedCustomer?.email || selectedCustomerDetails.email || "",
            leadSource: form.leadSource,
            leadStage: form.leadStage,
            leadStatus: form.leadStatus,
            expectedAmount: form.expectedAmount,
            description: form.description,
            expectedClosingDate: formattedDate(form.expectedClosingDate),
            followupDate: formattedDate(form.followupDate),
            billingAddress: companyDetails.billingAddress,
            shippingAddress: companyDetails.shippingAddress,
            productDetails: form.productDetails.map((p) => ({
                productBrand: p.productBrand,
                productCategory: p.productCategory,
                productSubCategory: p.productSubCategory,
                product: p.product,
                hsnCode: p.hsnCode,
                unit: p.unit,
                description: p.description,
            })),
            apiLeadId: location.state?.apiLeadId || null,
        };

        const formData = new FormData();

        formData.append("data", JSON.stringify(result));

        uploadLeadFiles.forEach((file) => {
            const convertedFile = convertBase64ToFile(file.base64, file.name, file.type);
            formData.append("leadFiles", convertedFile);
        });

        dispatch(createLead(formData));
    };

    return (
        <>
            {initialLoad ? (
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
                                    CRM Leads
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Create New Lead</h1>
                                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Convert customer interest into a managed opportunity with product details, follow-up planning, and expected revenue.
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

                    {/* Business Type Selector */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition ${businessMode === "B2B" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                            <input
                                type="radio"
                                id="b2b"
                                name="businessMode"
                                value="B2B"
                                checked={businessMode === "B2B"}
                                onChange={(e) => {
                                    setBusinessMode(e.target.value);
                                    if (e.target.value === "B2B") {
                                        clearSearchData();
                                    }
                                }}
                            />
                            <label
                                htmlFor="b2b"
                                className="cursor-pointer text-sm font-black"
                            >
                                B2B (Business to Business)
                            </label>
                        </div>
                        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition ${businessMode === "B2C" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                            <input
                                type="radio"
                                id="b2c"
                                name="businessMode"
                                value="B2C"
                                checked={businessMode === "B2C"}
                                onChange={(e) => {
                                    setBusinessMode(e.target.value);
                                    clearSearchData();
                                }}
                            />
                            <label
                                htmlFor="b2c"
                                className="cursor-pointer text-sm font-black"
                            >
                                B2C (Business to Consumer)
                            </label>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
                        {businessMode === "B2B" ? (
                            <>
                                {/* Search by Company */}
                                <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
                                    <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Company</div>
                                    <Autocomplete
                                        disablePortal
                                        options={companyOptions}
                                        getOptionLabel={(option) => option.label}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        value={selectedCompanyRecord || null}
                                        onChange={(e, newValue) => {
                                            if (newValue) {
                                                setSelectedCompanyRecord(newValue);
                                                handleSearch("company", newValue);
                                            } else {
                                                setSelectedCompanyRecord(null);
                                                clearSearchData();
                                                setAvailableCustomerNames([]);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Company *"
                                                size="small"
                                                error={businessMode === "B2B" && errors.selectedCompany}
                                            />
                                        )}
                                        className="w-56 md:w-72 lg:w-80"
                                    />
                                </div>

                                {/* Select Customer */}
                                <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
                                    <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Select Customer</div>
                                    <Autocomplete
                                        disablePortal
                                        options={availableCustomerNames}
                                        value={form.selectedCustomer || ""}
                                        onChange={(e, newValue) => {
                                            setForm((prev) => ({ ...prev, selectedCustomer: newValue || "" }));
                                            // Optional: update mobile/email if needed
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Customer *"
                                                size="small"
                                                error={errors.selectedCustomer}
                                                disabled={availableCustomerNames.length === 0}
                                            />
                                        )}
                                        className="w-56 md:w-72 lg:w-64"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* B2C: Search by Customer */}
                                <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
                                    <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Customer</div>
                                    <Autocomplete
                                        disablePortal
                                        options={customerNameOptions}
                                        getOptionLabel={(option) => option.label}
                                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                        value={selectedCustomerOption || null}
                                        onChange={(e, newValue) => {
                                            if (newValue) {
                                                setSelectedCustomerOption(newValue);
                                                setForm((prev) => ({ ...prev, selectedCustomer: newValue.label }));
                                                handleSearch("customer", newValue);
                                            } else {
                                                setSelectedCustomerOption(null);
                                                setForm((prev) => ({ ...prev, selectedCustomer: "" }));
                                                clearSearchData();
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Customer *"
                                                size="small"
                                                error={errors.selectedCustomer}
                                            />
                                        )}
                                        className="w-56 md:w-72 lg:w-80"
                                    />
                                </div>

                                {/* B2C: Company Name (optional) */}
                                <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
                                    <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Company Name</div>
                                    <TextField
                                        label="Company Name"
                                        size="small"
                                        value={selectedCompany}
                                        onChange={(e) => setSelectedCompany(e.target.value)}
                                        fullWidth
                                        className="w-56 md:w-72 lg:w-64"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Date and Assign */}
                    <div className="items-center justify-between space-y-5 md:flex md:space-y-0 lg:flex lg:space-y-0">
                        <TextField
                            type="date"
                            size="small"
                            label="Date"
                            value={form.date}
                            onChange={handleDateChange}
                        />
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
                    </div>
                    </section>

                    {/* Company Info */}
                    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Building2 size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Customer Information</h2>
                                <p className="text-sm font-medium text-slate-500">Company, customer person, contact and assignment details.</p>
                            </div>
                        </div>
                    <div className="flex w-full flex-col gap-4 lg:flex-row">
                        <TextField
                            label="Company Name"
                            fullWidth
                            value={companyDetails.companyName}
                            InputProps={{ readOnly: true }}
                            size="small"
                        />
                        <TextField
                            label="GSTIN No"
                            fullWidth
                            value={companyDetails.gstinNo}
                            onChange={handleCompanyDetailsChange("gstinNo")}
                            size="small"
                        />
                    </div>

                    {/* Customer Person */}
                    <div className="flex w-full gap-2 md:gap-4 lg:gap-4">
                        <TextField
                            label="Customer Person *"
                            size="small"
                            value={form.selectedCustomer}
                            onChange={handleChange("selectedCustomer")}
                            error={errors.selectedCustomer}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-4 lg:flex-row">
                        {/* Code + Mobile group (always in a row) */}
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <TextField
                                label="Code"
                                value={selectedCustomerDetails.code}
                                InputProps={{ readOnly: true }}
                                size="small"
                                sx={{ flex: 0.4 }}
                            />
                            <TextField
                                label="Mobile"
                                value={selectedCustomerDetails.mobile}
                                InputProps={{ readOnly: true }}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                        </Box>

                        <TextField
                            label="Email"
                            value={selectedCustomerDetails.email}
                            InputProps={{ readOnly: true }}
                            size="small"
                            sx={{
                                flex: 1,
                            }}
                        />
                    </div>
                    </section>

                    {/* Address Info */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Address Details</h2>
                                <p className="text-sm font-medium text-slate-500">Billing and shipping information for this lead.</p>
                            </div>
                        </div>
                    <div className="flex-none gap-5 md:flex lg:flex">
                        {/* Billing Address */}
                        <div className="w-full space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:w-1/2 lg:w-1/2">
                            <p className="flex items-center gap-2 font-black text-slate-800">
                                <Building2 size={18} className="text-blue-600" />
                                Billing Address
                            </p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.billingAddress.street}
                                    onChange={handleAddressChange("billingAddress", "street")}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.billingAddress.city}
                                    onChange={handleAddressChange("billingAddress", "city")}
                                />
                                <TextField
                                    label="State"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.billingAddress.state}
                                    onChange={handleAddressChange("billingAddress", "state")}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.billingAddress.pincode}
                                    onChange={handleAddressChange("billingAddress", "pincode")}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option?.country || ""}
                                    value={country.find((c) => c.id === companyDetails.billingAddress.country) || null}
                                    onChange={handleAddressChange("billingAddress", "country")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country"
                                            size="small"
                                        />
                                    )}
                                    fullWidth
                                />

                                <Autocomplete
                                    options={filteredBillingZones}
                                    getOptionLabel={(option) => option || ""}
                                    value={companyDetails.billingAddress.zone || null}
                                    onChange={(e, value) => handleAddressChange("billingAddress", "zone")({ target: { value } })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Zone"
                                            size="small"
                                        />
                                    )}
                                    fullWidth
                                />
                            </Box>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-5 w-full space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:mt-0 md:w-1/2 lg:mt-0 lg:w-1/2">
                            <p className="flex items-center gap-2 font-black text-slate-800">
                                <MapPin size={18} className="text-emerald-600" />
                                Shipping Address
                            </p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.shippingAddress.street}
                                    onChange={handleAddressChange("shippingAddress", "street")}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.shippingAddress.city}
                                    onChange={handleAddressChange("shippingAddress", "city")}
                                />
                                <TextField
                                    label="State"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.shippingAddress.state}
                                    onChange={handleAddressChange("shippingAddress", "state")}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode"
                                    fullWidth
                                    size="small"
                                    value={companyDetails.shippingAddress.pincode}
                                    onChange={handleAddressChange("shippingAddress", "pincode")}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option?.country || ""}
                                    value={country.find((c) => c.id === companyDetails.shippingAddress.country) || null}
                                    onChange={handleAddressChange("shippingAddress", "country")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country"
                                            size="small"
                                        />
                                    )}
                                    fullWidth
                                />

                                <Autocomplete
                                    options={filteredShippingZones}
                                    getOptionLabel={(option) => option || ""}
                                    value={companyDetails.shippingAddress.zone || null}
                                    onChange={(e, value) => handleAddressChange("shippingAddress", "zone")({ target: { value } })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Zone"
                                            size="small"
                                        />
                                    )}
                                    fullWidth
                                />
                            </Box>
                        </div>
                    </div>
                    {/* Checkbox to copy billing address */}
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={copyShippingSameAsBilling}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCopyShippingSameAsBilling(checked);
                                        if (checked) {
                                            // Copy billing to shipping
                                            setCompanyDetails((prev) => ({
                                                ...prev,
                                                shippingAddress: { ...prev.billingAddress },
                                            }));
                                            // Copy zones too
                                            setFilteredShippingZones([...filteredBillingZones]);
                                        }
                                    }}
                                />
                            }
                            label="Shipping address is same as billing address"
                        />
                    </div>

                    </section>

                    {/* Product Details */}
                    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                <PackageSearch size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Product Details</h2>
                                <p className="text-sm font-medium text-slate-500">Select product interest for this lead.</p>
                            </div>
                        </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-bold text-slate-500">Add product</span>
                            <CirclePlus
                                size={22}
                                className="cursor-pointer rounded-full bg-blue-50 p-0.5 text-blue-600 transition hover:scale-110 hover:bg-blue-100"
                                onClick={handleAddProduct}
                            />
                        </div>

                        {form.productDetails.map((entry, index) => (
                            <Box
                                key={index}
                                className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center"
                            >
                                {form.productDetails.length > 1 && (
                                    <div className="self-start lg:self-center">
                                        <CircleMinus
                                            size={20}
                                            className="cursor-pointer text-red-500"
                                            onClick={() => handleRemoveProduct(index)}
                                        />
                                    </div>
                                )}
                                <div className="flex w-full flex-1 flex-col gap-4 lg:flex-row">
                                    {/* Product Brand */}
                                    <Autocomplete
                                        disablePortal
                                        options={productBrand.map((brand) => brand.productBrand)}
                                        value={entry.productBrand || ""}
                                        onChange={(e, newValue) =>
                                            handleProductFieldChange(
                                                index,
                                                "productBrand",
                                            )({
                                                target: { value: newValue },
                                            })
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Product Brand *"
                                                size="small"
                                                error={!!errors[`productDetails_${index}_productBrand`]}
                                            />
                                        )}
                                        className="flex-1"
                                    />
                                    {/* Product Category */}
                                    <Autocomplete
                                        disablePortal
                                        options={entry.filteredCategories || []}
                                        value={entry.productCategory || ""}
                                        onChange={(e, newValue) =>
                                            handleProductFieldChange(
                                                index,
                                                "productCategory",
                                            )({
                                                target: { value: newValue },
                                            })
                                        }
                                        disabled={!entry.productBrand}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Product Category *"
                                                size="small"
                                                error={!!errors[`productDetails_${index}_productCategory`]}
                                            />
                                        )}
                                        className="flex-1"
                                    />
                                    {/* Product Sub-Category */}
                                    <Autocomplete
                                        disablePortal
                                        options={entry.filteredSubCategories || []}
                                        value={entry.productSubCategory || ""}
                                        onChange={(e, newValue) =>
                                            handleProductFieldChange(
                                                index,
                                                "productSubCategory",
                                            )({
                                                target: { value: newValue },
                                            })
                                        }
                                        disabled={!entry.productCategory}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Product Sub-Category *"
                                                size="small"
                                                error={!!errors[`productDetails_${index}_productSubCategory`]}
                                            />
                                        )}
                                        className="flex-1"
                                    />
                                    {/* Product */}
                                    <Autocomplete
                                        disablePortal
                                        options={(entry.filteredProducts || []).map((prod) => prod.name)}
                                        value={entry.product || ""}
                                        onChange={(e, newValue) =>
                                            handleProductFieldChange(
                                                index,
                                                "product",
                                            )({
                                                target: { value: newValue },
                                            })
                                        }
                                        disabled={!entry.productSubCategory}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Product *"
                                                size="small"
                                                error={!!errors[`productDetails_${index}_product`]}
                                            />
                                        )}
                                        className="flex-1"
                                    />
                                </div>
                            </Box>
                        ))}
                    </div>
                    </section>

                    {/* Lead Details */}
                    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                <TrendingUp size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Lead Details</h2>
                                <p className="text-sm font-medium text-slate-500">Pipeline stage, source, follow-up, expected amount and closing plan.</p>
                            </div>
                        </div>
                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            {/* Lead Source */}
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
                                className="flex-1"
                            />

                            {/* Lead Stage */}
                            <Autocomplete
                                disablePortal
                                options={leadStage.map((option) => option.leadStage)}
                                value={form.leadStage || ""}
                                onChange={(e, newValue) => handleChange("leadStage")({ target: { value: newValue } })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Lead Stage *"
                                        size="small"
                                        error={!!errors.leadStage}
                                    />
                                )}
                                className="flex-1"
                            />

                            {/* Lead Status */}
                            <Autocomplete
                                disablePortal
                                options={leadStatus.map((option) => option.leadStatus)}
                                value={form.leadStatus || ""}
                                onChange={(e, newValue) => handleChange("leadStatus")({ target: { value: newValue } })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Lead Status *"
                                        size="small"
                                        error={!!errors.leadStatus}
                                    />
                                )}
                                className="flex-1"
                            />
                        </Box>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <TextField
                                type="date"
                                size="small"
                                label="Followup Date"
                                value={form.followupDate}
                                onChange={handleFollowupDateChange}
                                sx={{ flex: 2 }}
                            />
                            <TextField
                                label="Expected Amount"
                                placeholder="Expected Amount"
                                type="number"
                                value={form.expectedAmount}
                                onChange={handleChange("expectedAmount")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 2 }}
                            />
                            <TextField
                                type="date"
                                size="small"
                                label="Expected Closing Date"
                                value={form.expectedClosingDate}
                                onChange={handleExpectedClosingDateChange}
                                sx={{ flex: 2 }}
                            />
                        </Box>
                    {/* Description */}
                    <Box>
                        <TextField
                            label="Description *"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange("description")}
                            error={errors.description}
                            multiline
                            minRows={2}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                    </Box>
                    </section>

                    {/* File Upload Section */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <UploadCloud size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Lead Attachments</h2>
                                <p className="text-sm font-medium text-slate-500">Upload supporting documents, images, PDFs or sheets.</p>
                            </div>
                        </div>
                    <Box mt={2}>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                        <Button
                            variant="filled"
                            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black capitalize text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Upload Files
                        </Button>

                        <Box
                            mt={2}
                            className="grid grid-cols-4 gap-4 md:grid-cols-7 lg:grid-cols-10"
                        >
                            {uploadLeadFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded border bg-gray-100 p-2"
                                >
                                    {/* File Preview */}
                                    {file.type.startsWith("image/") ? (
                                        <img
                                            src={file.base64}
                                            alt="Uploaded"
                                            className="h-full w-full rounded object-cover md:h-full lg:h-20"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center text-xs font-medium text-gray-700 md:h-full lg:h-20">
                                            {file.type === "application/pdf" ? (
                                                <FaFilePdf className="h-10 w-10 text-red-500" />
                                            ) : file.type === "application/vnd.ms-excel" ||
                                              file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                                                <FaFileExcel className="h-10 w-10 text-green-500" />
                                            ) : (
                                                // fallback: show filename for other docs (like Word, etc.)
                                                <span className="break-words">{file.name}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Three Dots */}
                                    <div
                                        className="absolute right-1 top-1 hidden cursor-pointer group-hover:block"
                                        onClick={() => {
                                            setSelectedFileIndex(index);
                                            setFileMenuOpen(true);
                                        }}
                                    >
                                        <span className="text-xl font-bold">⋮</span>
                                    </div>
                                </div>
                            ))}
                        </Box>
                        {fileMenuOpen && selectedFileIndex !== null && (
                            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30">
                                <div className="relative w-52 rounded bg-white p-2 shadow-lg">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div>Option</div>
                                        {/* Close Icon */}
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => setFileMenuOpen(false)}
                                        >
                                            <X className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        {/* File Icon (click to preview) */}
                                        <div
                                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                                            onClick={() => {
                                                setPreviewFile(uploadLeadFiles[selectedFileIndex]);
                                                setFileMenuOpen(false);
                                            }}
                                        >
                                            <File className="h-6 w-6" />
                                        </div>

                                        {/* Trash Icon Only */}
                                        <div
                                            className="cursor-pointer text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                const updated = [...uploadLeadFiles];
                                                updated.splice(selectedFileIndex, 1);
                                                setUploadLeadFiles(updated);
                                                localStorage.setItem("uploadLeadFiles", JSON.stringify(updated));
                                                setFileMenuOpen(false);
                                            }}
                                        >
                                            <Trash className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {previewFile && (
                            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
                                <div className="relative h-[80vh] w-[80vw] overflow-hidden rounded bg-white p-4 shadow-lg">
                                    {/* Close Icon */}
                                    <div
                                        className="cursor-pointer justify-self-end"
                                        onClick={() => setPreviewFile(null)}
                                    >
                                        <X className="h-5 w-5" />
                                    </div>

                                    <div className="mt-2 flex h-full w-full items-center justify-center">
                                        {previewFile.type.startsWith("image/") ? (
                                            <img
                                                src={previewFile.base64}
                                                alt="Preview"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <iframe
                                                src={previewFile.base64}
                                                title="Preview File"
                                                className="h-full w-full border"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Box>
                    </section>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-xl shadow-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Ready to generate lead</p>
                                <p className="text-xs font-semibold text-slate-500">Please verify required fields before generating the lead.</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || isSuccessProcessing} // Disable during API call or success processing
                            variant="gradient"
                            className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black capitalize text-white shadow-lg shadow-slate-300/80 transition md:text-base ${
                                isSuccessProcessing
                                    ? "cursor-not-allowed bg-[#053054]/70 opacity-70" // Blurred look on success
                                    : "bg-[#053054] hover:bg-[#053054]/90"
                            } transition-all`}
                        >
                            {isSuccessProcessing ? (
                                <>
                                    <CircularProgress
                                        size={18}
                                        thickness={5}
                                        className="text-white"
                                    />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <MdOutlineLeaderboard size={20} />
                                    Generate Lead
                                </>
                            )}
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

export default CreateLeads;
