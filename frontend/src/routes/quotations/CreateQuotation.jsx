// import React, { useEffect, useState } from "react";
// import { Button } from "@material-tailwind/react";
// import { useNavigate } from "react-router-dom";
// import { Alert, Box, Chip, FormControlLabel, MenuItem, Radio, RadioGroup, Snackbar, TextField } from "@mui/material";
// import { Search, PencilLine, Trash } from "lucide-react";
// import { SiWikiquote } from "react-icons/si";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// const CreateQuotation = () => {
//     const navigate = useNavigate();
//     const [form, setForm] = useState({
//         assignedTo: [],
//         selectedCustomer: "",
//         date: "",
//         productCategory: "",
//         product: "",
//         hsnCode: "",
//         quantity: "",
//         pricePerUnit: "",
//         subTotal: "",
//         gstinType: "Intrastate",
//         cgst: "",
//         sgst: "",
//         igst: "",
//         cgstAmt: "",
//         sgstAmt: "",
//         igstAmt: "",
//         total: "",
//         finalAmt: "",
//         termsAndConditions: "",
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
//         },
//         shippingAddress: {
//             street: "",
//             city: "",
//             state: "",
//             pincode: "",
//             country: "",
//         },
//     });
//     const [employeesList, setEmployeesList] = useState([]);
//     const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({ mobile: "", email: "" });
//     const [productList, setProductList] = useState([]);

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

//     const [intrastateProducts, setIntrastateProducts] = useState([]);
//     const [interstateProducts, setInterstateProducts] = useState([]);

//     useEffect(() => {
//         const saved = JSON.parse(localStorage.getItem("productQuotationDetails"));
//         if (saved) {
//             setIntrastateProducts(saved.intrastate || []);
//             setInterstateProducts(saved.interstate || []);
//         }
//     }, []);

//     useEffect(() => {
//         const quantity = parseFloat(form.quantity);
//         const price = parseFloat(form.pricePerUnit);

//         if (!isNaN(quantity) && !isNaN(price)) {
//             const subTotal = quantity * price;
//             setForm((prev) => ({ ...prev, subTotal: subTotal.toFixed(2) }));
//         } else {
//             setForm((prev) => ({ ...prev, subTotal: "" }));
//         }
//     }, [form.quantity, form.pricePerUnit]);

//     useEffect(() => {
//         const subTotal = parseFloat(form.subTotal) || 0;
//         const cgst = parseFloat(form.cgst) || 0;
//         const sgst = parseFloat(form.sgst) || 0;
//         const igst = parseFloat(form.igst) || 0;

//         if (form.gstinType === "Intrastate") {
//             const cgstAmt = (subTotal * cgst) / 100;
//             const sgstAmt = (subTotal * sgst) / 100;
//             setForm((prev) => ({
//                 ...prev,
//                 cgstAmt: cgstAmt.toFixed(2),
//                 sgstAmt: sgstAmt.toFixed(2),
//                 total: (subTotal + cgstAmt + sgstAmt).toFixed(2),
//             }));
//         } else if (form.gstinType === "Interstate") {
//             const igstAmt = (subTotal * igst) / 100;
//             setForm((prev) => ({
//                 ...prev,
//                 igstAmt: igstAmt.toFixed(2),
//                 total: (subTotal + igstAmt).toFixed(2),
//             }));
//         } else {
//             setForm((prev) => ({
//                 ...prev,
//                 cgstAmt: "",
//                 sgstAmt: "",
//                 igstAmt: "",
//                 total: subTotal.toFixed(2),
//             }));
//         }
//     }, [form.subTotal, form.cgst, form.sgst, form.igst, form.gstinType]);

//     useEffect(() => {
//         const totalIntrastate = intrastateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
//         const totalInterstate = interstateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
//         const finalAmt = totalIntrastate + totalInterstate;

//         setForm((prev) => ({
//             ...prev,
//             finalAmt: finalAmt.toFixed(2),
//         }));
//     }, [intrastateProducts, interstateProducts]);

//     const [filteredProducts, setFilteredProducts] = useState([]);

//     const handleChange = (field) => (e) => {
//         const value = e.target.value;

//         setForm((prevForm) => {
//             const updatedForm = { ...prevForm, [field]: value };

//             if (field === "productCategory") {
//                 const productsInCategory = productList.filter((item) => item.Category === value);
//                 setFilteredProducts(productsInCategory);
//                 updatedForm.product = "";
//                 updatedForm.hsnCode = "";
//             }

//             if (field === "product") {
//                 const selectedProduct = filteredProducts.find((item) => (Array.isArray(item.name) ? item.name.includes(value) : item.name === value));

//                 updatedForm.hsnCode = selectedProduct?.hsnCode || "";
//             }

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

//     const handleChipDelete = (value) => {
//         setForm((prev) => ({
//             ...prev,
//             assignedTo: prev.assignedTo.filter((v) => v !== value),
//         }));
//     };

//     const handleDateChange = (e) => {
//         setForm({ ...form, date: e.target.value });
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

//     const validateFieldsForAddHandler = () => {
//         let tempErrors = {};
//         let hasError = false;

//         if (!form.productCategory) {
//             tempErrors.productCategory = true;
//             hasError = true;
//         }
//         if (!form.product) {
//             tempErrors.product = true;
//             hasError = true;
//         }
//         if (!form.quantity) {
//             tempErrors.quantity = true;
//             hasError = true;
//         }
//         if (!form.pricePerUnit) {
//             tempErrors.pricePerUnit = true;
//             hasError = true;
//         }
//         if (form.gstinType === "Intrastate") {
//             if (!form.cgst) {
//                 tempErrors.cgst = true;
//                 hasError = true;
//             }
//             if (!form.sgst) {
//                 tempErrors.sgst = true;
//                 hasError = true;
//             }
//         } else if (form.gstinType === "Interstate") {
//             if (!form.igst) {
//                 tempErrors.igst = true;
//                 hasError = true;
//             }
//         }

//         setErrors(tempErrors);
//         return !hasError;
//     };

//     const handleAdd = () => {
//         if (!validateFieldsForAddHandler()) return;

//         // Create a clean object for Intrastate
//         let newEntry;
//         if (form.gstinType === "Intrastate") {
//             newEntry = {
//                 productCategory: form.productCategory,
//                 product: form.product,
//                 hsnCode: form.hsnCode,
//                 quantity: form.quantity,
//                 pricePerUnit: form.pricePerUnit,
//                 subTotal: form.subTotal,
//                 gstinType: form.gstinType,
//                 cgst: form.cgst,
//                 sgst: form.sgst,
//                 cgstAmt: form.cgstAmt,
//                 sgstAmt: form.sgstAmt,
//                 total: form.total,
//             };

//             const updatedIntrastate = [...intrastateProducts, newEntry];
//             setIntrastateProducts(updatedIntrastate);
//             console.log("Intrastate :", updatedIntrastate);
//             localStorage.setItem(
//                 "productQuotationDetails",
//                 JSON.stringify({
//                     intrastate: updatedIntrastate,
//                     interstate: interstateProducts,
//                 }),
//             );
//         } else if (form.gstinType === "Interstate") {
//             // Manually construct the clean object for Interstate
//             newEntry = {
//                 productCategory: form.productCategory,
//                 product: form.product,
//                 hsnCode: form.hsnCode,
//                 quantity: form.quantity,
//                 pricePerUnit: form.pricePerUnit,
//                 subTotal: form.subTotal,
//                 gstinType: form.gstinType,
//                 igst: form.igst,
//                 igstAmt: form.igstAmt,
//                 total: form.total,
//             };

//             const updatedInterstate = [...interstateProducts, newEntry];
//             setInterstateProducts(updatedInterstate);
//             console.log("Interstate :", updatedInterstate);
//             localStorage.setItem(
//                 "productQuotationDetails",
//                 JSON.stringify({
//                     intrastate: intrastateProducts,
//                     interstate: updatedInterstate,
//                 }),
//             );
//         }
//         setForm((prevForm) => ({
//             ...prevForm,
//             productCategory: "",
//             product: "",
//             hsnCode: "",
//             quantity: "",
//             pricePerUnit: "",
//             subTotal: "",
//             cgst: "",
//             sgst: "",
//             igst: "",
//             cgstAmt: "",
//             sgstAmt: "",
//             igstAmt: "",
//             total: "",
//         }));
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

//         setErrors(tempErrors);
//         return !hasError;
//     };

//     const handleSubmit = () => {
//         if (!validateFields()) {
//             setSnackbarMessage("Please fill all required fields.");
//             setSnackbarOpen(true);
//             return;
//         }

//         // ✅ Get productQuotationDetails from localStorage
//         const productQuotationDetails = JSON.parse(localStorage.getItem("productQuotationDetails")) || {
//             intrastate: [],
//             interstate: [],
//         };

//         // ✅ Check if at least one product is added
//         if (productQuotationDetails.intrastate.length === 0 && productQuotationDetails.interstate.length === 0) {
//             setSnackbarMessage("No product added yet, Please do add!");
//             setSnackbarOpen(true);
//             return;
//         }

//         const formattedDate = form.date.split("-").reverse().join("-");

//         const selectedCustomer = companyDetails.customers.find((cust) => {
//             const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//             return fullName === form.selectedCustomer;
//         });

//         const result = {
//             assignedTo: form.assignedTo,
//             selectedCompany: selectedCompany,
//             date: formattedDate,
//             companyName: companyDetails.companyName,
//             gstinNo: companyDetails.gstinNo,
//             customerPerson: form.selectedCustomer,
//             mobile: selectedCustomer?.mobile || "",
//             email: selectedCustomer?.email || "",
//             termsAndConditions: form.termsAndConditions,
//             billingAddress: companyDetails.billingAddress,
//             shippingAddress: companyDetails.shippingAddress,
//             productQuotationDetails,
//             finalAmt: form.finalAmt,
//         };

//         // Save to quotation
//         const existingQuotations = JSON.parse(localStorage.getItem("quotation")) || [];
//         existingQuotations.push(result);
//         localStorage.setItem("quotation", JSON.stringify(existingQuotations));

//         // ✅ Clear productQuotationDetails from localStorage
//         localStorage.removeItem("productQuotationDetails");

//         console.log("Quotation generated:", result);
//         setSnackbarMessage("Quotation generated successfully!");
//         setSnackbarOpen(true);

//         // Reset form
//         setForm({
//             assignedTo: [],
//             selectedCustomer: "",
//             date: "",
//             termsAndConditions: "",
//         });
//         setSelectedCompany("");
//         setCompanyDetails({
//             companyName: "",
//             gstinNo: "",
//             customers: [],
//             billingAddress: { street: "", city: "", state: "", pincode: "", country: "" },
//             shippingAddress: { street: "", city: "", state: "", pincode: "", country: "" },
//         });
//         setSelectedCustomerDetails({ mobile: "", email: "" });

//         setTimeout(() => {
//             navigate("/quotations");
//         }, 500);
//     };

//     return (
//         <>
//             <div className="card space-y-4">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg">Create New Quotation :</div>
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
//                         </Box>
//                     </div>
//                 </div>

//                 {/* Product Details */}
//                 <div className="space-y-4">
//                     <p className="font-semibold text-[#433C50]">Product Details</p>
//                     <Box className="flex items-center gap-10 text-nowrap md:gap-5 lg:gap-5">
//                         <span className="-mt-1 text-sm font-semibold text-[#433C50] md:-mt-1.5 lg:-mt-1.5">GSTIN Type :</span>
//                         <RadioGroup
//                             row
//                             value={form.gstinType}
//                             onChange={handleChange("gstinType")}
//                         >
//                             <FormControlLabel
//                                 value="Intrastate"
//                                 control={<Radio size="small" />}
//                                 label="For Intrastate"
//                             />
//                             <FormControlLabel
//                                 value="Interstate"
//                                 control={<Radio size="small" />}
//                                 label="For Interstate"
//                             />
//                         </RadioGroup>
//                     </Box>

//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             select
//                             label="Product Category *"
//                             placeholder="Product Category"
//                             value={form.productCategory}
//                             error={errors.productCategory}
//                             onChange={handleChange("productCategory")}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 1 }}
//                         >
//                             {productList.map((option, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={option.Category}
//                                 >
//                                     {option.Category}
//                                 </MenuItem>
//                             ))}
//                         </TextField>

//                         <TextField
//                             select
//                             label="Product *"
//                             placeholder="Select Product"
//                             value={form.product}
//                             onChange={handleChange("product")}
//                             fullWidth
//                             size="small"
//                             error={errors.product}
//                             sx={{ flex: 1 }}
//                             disabled={!form.productCategory}
//                         >
//                             {filteredProducts.flatMap((prod, index) =>
//                                 Array.isArray(prod.name)
//                                     ? prod.name.map((name, idx) => (
//                                           <MenuItem
//                                               key={`${index}-${idx}`}
//                                               value={name}
//                                           >
//                                               {name}
//                                           </MenuItem>
//                                       ))
//                                     : [
//                                           <MenuItem
//                                               key={index}
//                                               value={prod.name}
//                                           >
//                                               {prod.name}
//                                           </MenuItem>,
//                                       ],
//                             )}
//                         </TextField>

//                         <TextField
//                             label="HSN Code"
//                             value={form.hsnCode}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 1 }}
//                             InputProps={{ readOnly: true }}
//                         />
//                     </Box>

//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Quantity *"
//                             placeholder="Quantity"
//                             type="number"
//                             value={form.quantity}
//                             error={errors.quantity}
//                             onChange={handleChange("quantity")}
//                             onWheel={(e) => e.target.blur()}
//                             inputProps={{ min: 0 }}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 1 }}
//                         />

//                         <TextField
//                             label="Price Per Unit *"
//                             placeholder="Price Per Unit"
//                             type="number"
//                             value={form.pricePerUnit}
//                             error={errors.pricePerUnit}
//                             onChange={handleChange("pricePerUnit")}
//                             onWheel={(e) => e.target.blur()}
//                             inputProps={{ min: 0 }}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 1 }}
//                         />

//                         <TextField
//                             label="Sub Total"
//                             placeholder="Sub Total"
//                             value={form.subTotal}
//                             InputProps={{ readOnly: true }}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 1 }}
//                         />
//                     </Box>
//                     {form.gstinType === "Intrastate" && (
//                         <div className="space-y-4">
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="CGST (%) *"
//                                     placeholder="CGST (%)"
//                                     type="number"
//                                     value={form.cgst}
//                                     onChange={handleChange("cgst")}
//                                     onWheel={(e) => e.target.blur()}
//                                     inputProps={{ min: 0 }}
//                                     error={errors.cgst}
//                                     size="small"
//                                     fullWidth
//                                 />
//                                 <TextField
//                                     label="CGST Amt"
//                                     placeholder="CGST Amount"
//                                     value={form.cgstAmt}
//                                     InputProps={{ readOnly: true }}
//                                     size="small"
//                                     fullWidth
//                                 />
//                             </Box>
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="SGST (%) *"
//                                     placeholder="SGST (%)"
//                                     type="number"
//                                     value={form.sgst}
//                                     onChange={handleChange("sgst")}
//                                     onWheel={(e) => e.target.blur()}
//                                     inputProps={{ min: 0 }}
//                                     error={errors.sgst}
//                                     size="small"
//                                     fullWidth
//                                 />
//                                 <TextField
//                                     label="SGST Amt"
//                                     placeholder="SGST Amount"
//                                     value={form.sgstAmt}
//                                     InputProps={{ readOnly: true }}
//                                     size="small"
//                                     fullWidth
//                                 />
//                             </Box>
//                             <TextField
//                                 label="Total"
//                                 value={form.total}
//                                 InputProps={{ readOnly: true }}
//                                 fullWidth
//                                 size="small"
//                             />
//                             <div className="flex gap-5">
//                                 <Button
//                                     variant="gradient"
//                                     className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
//                                     onClick={() =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             cgst: "",
//                                             sgst: "",
//                                             cgstAmt: "",
//                                             sgstAmt: "",
//                                             total: prev.subTotal,
//                                         }))
//                                     }
//                                 >
//                                     Reset
//                                 </Button>
//                                 <Button
//                                     variant="gradient"
//                                     className="rounded bg-blue-500 px-6 py-2 capitalize text-white md:text-base"
//                                     onClick={handleAdd}
//                                 >
//                                     Add
//                                 </Button>
//                             </div>
//                         </div>
//                     )}

//                     {form.gstinType === "Interstate" && (
//                         <div className="space-y-4">
//                             <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                                 <TextField
//                                     label="IGST (%) *"
//                                     placeholder="IGST (%)"
//                                     type="number"
//                                     value={form.igst}
//                                     onChange={handleChange("igst")}
//                                     onWheel={(e) => e.target.blur()}
//                                     inputProps={{ min: 0 }}
//                                     error={errors.igst}
//                                     size="small"
//                                     fullWidth
//                                 />
//                                 <TextField
//                                     label="IGST Amt"
//                                     placeholder="IGST Amount"
//                                     value={form.igstAmt}
//                                     InputProps={{ readOnly: true }}
//                                     size="small"
//                                     fullWidth
//                                 />
//                             </Box>
//                             <TextField
//                                 label="Total"
//                                 value={form.total}
//                                 InputProps={{ readOnly: true }}
//                                 fullWidth
//                                 size="small"
//                             />
//                             <div className="flex gap-5">
//                                 <Button
//                                     variant="gradient"
//                                     className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
//                                     onClick={() =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             igst: "",
//                                             igstAmt: "",
//                                             total: prev.subTotal,
//                                         }))
//                                     }
//                                 >
//                                     Reset
//                                 </Button>
//                                 <Button
//                                     variant="gradient"
//                                     className="rounded bg-blue-500 px-6 py-2 capitalize text-white md:text-base"
//                                     onClick={handleAdd}
//                                 >
//                                     Add
//                                 </Button>
//                             </div>
//                         </div>
//                     )}

//                     <div className="card-body p-0">
//                         <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                             <table className="table">
//                                 <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                     <tr className="table-row">
//                                         <th className="border border-gray-300 px-2 py-1">Sr No.</th>
//                                         <th className="border border-gray-300 px-2 py-1">Product</th>
//                                         <th className="border border-gray-300 px-2 py-1">HSN</th>
//                                         <th className="border border-gray-300 px-2 py-1">Price</th>

//                                         {form.gstinType === "Intrastate" ? (
//                                             <>
//                                                 <th className="border border-gray-300 px-2 py-1">CGST (%)</th>
//                                                 <th className="border border-gray-300 px-2 py-1">CGST Amt</th>
//                                                 <th className="border border-gray-300 px-2 py-1">SGST (%)</th>
//                                                 <th className="border border-gray-300 px-2 py-1">SGST Amt</th>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <th className="border border-gray-300 px-2 py-1">IGST (%)</th>
//                                                 <th className="border border-gray-300 px-2 py-1">IGST Amt</th>
//                                             </>
//                                         )}

//                                         <th className="border border-gray-300 px-2 py-1">Total</th>
//                                         <th className="border border-gray-300 px-2 py-1">Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {(form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).length > 0 ? (
//                                         (form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).map((item, index) => (
//                                             <tr
//                                                 key={index}
//                                                 className="text-center"
//                                             >
//                                                 <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
//                                                 <td className="border border-gray-300 text-nowrap px-2 py-1">{item.product}</td>
//                                                 <td className="border border-gray-300 px-2 py-1">{item.hsnCode}</td>
//                                                 <td className="border border-gray-300 px-2 py-1">{item.pricePerUnit}</td>

//                                                 {form.gstinType === "Intrastate" ? (
//                                                     <>
//                                                         <td className="border border-gray-300 px-2 py-1">{item.cgst}</td>
//                                                         <td className="border border-gray-300 px-2 py-1">{item.cgstAmt}</td>
//                                                         <td className="border border-gray-300 px-2 py-1">{item.sgst}</td>
//                                                         <td className="border border-gray-300 px-2 py-1">{item.sgstAmt}</td>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <td className="border border-gray-300 px-2 py-1">{item.igst}</td>
//                                                         <td className="border border-gray-300 px-2 py-1">{item.igstAmt}</td>
//                                                     </>
//                                                 )}

//                                                 <td className="border border-gray-300 px-2 py-1">{item.total}</td>
//                                                 <td className="border border-gray-300 space-x-2 px-2 py-1">
//                                                     <button className="text-blue-500">
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => {
//                                                             if (form.gstinType === "Intrastate") {
//                                                                 const updated = intrastateProducts.filter((_, i) => i !== index);
//                                                                 setIntrastateProducts(updated);
//                                                                 localStorage.setItem(
//                                                                     "productQuotationDetails",
//                                                                     JSON.stringify({ intrastate: updated, interstate: interstateProducts }),
//                                                                 );
//                                                             } else {
//                                                                 const updated = interstateProducts.filter((_, i) => i !== index);
//                                                                 setInterstateProducts(updated);
//                                                                 localStorage.setItem(
//                                                                     "productQuotationDetails",
//                                                                     JSON.stringify({ intrastate: intrastateProducts, interstate: updated }),
//                                                                 );
//                                                             }
//                                                         }}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td
//                                                 colSpan={form.gstinType === "Intrastate" ? 11 : 9}
//                                                 className="py-3 text-center text-gray-500"
//                                             >
//                                                 No product added yet
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                     <TextField
//                         label="Final Amount"
//                         value={form.finalAmt}
//                         InputProps={{ readOnly: true }}
//                         fullWidth
//                         size="small"
//                     />
//                 </div>

//                 {/* Terms And Conditions */}
//                 <Box>
//                     <div className="mb-2 text-sm font-medium text-gray-700">Terms and Conditions</div>
//                     <ReactQuill
//                         value={form.termsAndConditions}
//                         onChange={(value) => {
//                             setForm((prev) => ({ ...prev, termsAndConditions: value }));
//                         }}
//                         theme="snow"
//                         placeholder="Enter quotation terms and conditions..."
//                         className={`bg-white`}
//                     />
//                 </Box>

//                 {/* Submit Button */}
//                 <div className="flex justify-end">
//                     <Button
//                     onClick={handleSubmit}
//                     variant="gradient"
//                     className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                 >
//                     <SiWikiquote size={20} />
//                     Generate Quotation
//                 </Button>
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

// export default CreateQuotation;

import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCustomers } from "../../redux/actions/customer";
import { getRoles } from "../../redux/actions/rbac";
import { getEmployees } from "../../redux/actions/employee";
import { getCountry } from "../../redux/actions/country";
import { getZones } from "../../redux/actions/zones";
import { getProductBrand } from "../../redux/actions/productBrand";
import { getProductCategory } from "../../redux/actions/productCategory";
import { getProductSubCategory } from "../../redux/actions/productSubCategory";
import { getProduct } from "../../redux/actions/product";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { createQuotation } from "../../redux/actions/quotation";
import { Alert, Box, Chip, FormControlLabel, Radio, RadioGroup, Snackbar, TextField, CircularProgress, Autocomplete, Checkbox } from "@mui/material";
import { PencilLine, Trash } from "lucide-react";
import { SiWikiquote } from "react-icons/si";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getDefaultTAndCAndDec } from "../../redux/actions/tAndCAndDec";

const CreateQuotation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [form, setForm] = useState({
        assignedTo: user?.id ? [user] : [],
        selectedCustomer: "",
        date: "",
        productBrand: "",
        productCategory: "",
        productSubCategory: "",
        product: "",
        hsnCode: "",
        quantity: "1",
        unit: "",
        productDescription: "",
        pricePerUnit: "",
        purchaseCost: "",
        vendorName: "",
        subTotal: "",
        gstinType: "Intrastate",
        cgst: "",
        sgst: "",
        igst: "",
        cgstAmt: "",
        sgstAmt: "",
        igstAmt: "",
        discount: "",
        total: "",
        finalAmt: "",
        quotationDescription: "",
        termsAndConditions: "",
    });
    const { customers } = useSelector((state) => state.customer);
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);
    const { country } = useSelector((state) => state.country);
    const { zones } = useSelector((state) => state.zones);
    const { productBrand } = useSelector((state) => state.productBrand);
    const { productCategory } = useSelector((state) => state.productCategory);
    const { productSubCategory } = useSelector((state) => state.productSubCategory);
    const { product } = useSelector((state) => state.product);
    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.quotation);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
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
    const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
    const [selectedCompanyRecord, setSelectedCompanyRecord] = useState(null);
    const [businessMode, setBusinessMode] = useState("B2B"); // "B2B" or "B2C"

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(getCustomers()),
                    dispatch(getRoles()),
                    dispatch(getEmployees()),
                    dispatch(getCountry()),
                    dispatch(getZones()),
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
        if (snackbarMessage) {
            setSnackbarOpen(true);

            // If it's a success message, trigger the button blur + loader
            if (snackbarSeverity === "success") {
                setIsSubmittingSuccessfully(true);
            }
        } else {
            // When snackbar is cleared (after navigation), reset the state
            setIsSubmittingSuccessfully(false);
        }
    }, [snackbarMessage, snackbarSeverity]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

const { defaultEntries } = useSelector((state) => state.tAndCAndDec);

useEffect(() => {
    // Fetch default quotation description and terms
    dispatch(getDefaultTAndCAndDec("quotation_description"));
    dispatch(getDefaultTAndCAndDec("quotation_terms"));
}, [dispatch]);

useEffect(() => {
    if (defaultEntries?.quotation_description?.content) {
        setForm(prev => ({
            ...prev,
            quotationDescription: defaultEntries.quotation_description.content
        }));
    }
    if (defaultEntries?.quotation_terms?.content) {
        setForm(prev => ({
            ...prev,
            termsAndConditions: defaultEntries.quotation_terms.content
        }));
    }
}, [defaultEntries]);

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        setForm((prev) => ({ ...prev, date: formattedDate }));
        setForm((prev) => ({ ...prev, followupDate: formattedDate }));
    }, []);

    useEffect(() => {
        // Remove stored productQuotationDetails on page reload
        localStorage.removeItem("productQuotationDetails");
    }, []);

    const [intrastateProducts, setIntrastateProducts] = useState([]);
    const [interstateProducts, setInterstateProducts] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("productQuotationDetails"));
        if (saved) {
            setIntrastateProducts(saved.intrastate || []);
            setInterstateProducts(saved.interstate || []);
        }
    }, []);

    useEffect(() => {
        const quantity = parseFloat(form.quantity);
        const price = parseFloat(form.pricePerUnit);

        if (!isNaN(quantity) && !isNaN(price)) {
            const subTotal = quantity * price;
            setForm((prev) => ({ ...prev, subTotal: subTotal.toFixed(2) }));
        } else {
            setForm((prev) => ({ ...prev, subTotal: "" }));
        }
    }, [form.quantity, form.pricePerUnit]);

    useEffect(() => {
        const subTotal = parseFloat(form.subTotal) || 0;
        const cgst = parseFloat(form.cgst) || 0;
        const sgst = parseFloat(form.sgst) || 0;
        const igst = parseFloat(form.igst) || 0;
        const discount = parseFloat(form.discount) || 0;

        let totalBeforeDiscount = subTotal;

        if (form.gstinType === "Intrastate") {
            const cgstAmt = (subTotal * cgst) / 100;
            const sgstAmt = (subTotal * sgst) / 100;
            totalBeforeDiscount = subTotal + cgstAmt + sgstAmt;
            const discountedTotal = discount ? totalBeforeDiscount - (totalBeforeDiscount * discount) / 100 : totalBeforeDiscount;
            setForm((prev) => ({
                ...prev,
                cgstAmt: cgstAmt.toFixed(2),
                sgstAmt: sgstAmt.toFixed(2),
                total: discountedTotal.toFixed(2),
            }));
        } else if (form.gstinType === "Interstate") {
            const igstAmt = (subTotal * igst) / 100;
            totalBeforeDiscount = subTotal + igstAmt;
            const discountedTotal = discount ? totalBeforeDiscount - (totalBeforeDiscount * discount) / 100 : totalBeforeDiscount;
            setForm((prev) => ({
                ...prev,
                igstAmt: igstAmt.toFixed(2),
                total: discountedTotal.toFixed(2),
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                cgstAmt: "",
                sgstAmt: "",
                igstAmt: "",
                total: subTotal.toFixed(2),
            }));
        }
    }, [form.subTotal, form.cgst, form.sgst, form.igst, form.gstinType, form.discount]);

    useEffect(() => {
        const totalIntrastate = intrastateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        const totalInterstate = interstateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        const finalAmt = totalIntrastate + totalInterstate;

        setForm((prev) => ({
            ...prev,
            finalAmt: finalAmt.toFixed(2),
        }));
    }, [intrastateProducts, interstateProducts]);

    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");

    const stripHtmlTags = (html) => {
        if (!html) return "";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    const buildProductSuggestions = (rows = product) =>
        rows.flatMap((prod) =>
            Array.isArray(prod.product)
                ? prod.product.map((pName) => ({
                      name: pName,
                      label: [pName, prod.brand, prod.productCategoryName, prod.productSubCategoryName].filter(Boolean).join(" / "),
                      productBrand: prod.brand || "",
                      productCategory: prod.productCategoryName || "",
                      productSubCategory: prod.productSubCategoryName || "",
                      hsnCode: prod.hsnCode,
                      description: prod.description,
                      unit: prod.productUnitName,
                      productPrice: prod.productPrice,
                  }))
                : [],
        );

    const getProductOptions = () => {
        const base =
            form.productBrand || form.productCategory || form.productSubCategory
                ? product.filter(
                      (item) =>
                          (!form.productBrand || item.brand === form.productBrand) &&
                          (!form.productCategory || item.productCategoryName === form.productCategory) &&
                          (!form.productSubCategory || item.productSubCategoryName === form.productSubCategory),
                  )
                : product;
        return buildProductSuggestions(base);
    };

    const filterProductSuggestions = (options, { inputValue }) => {
        const search = String(inputValue || "").trim().toLowerCase();
        if (!search) return options.slice(0, 20);
        return options
            .filter((option) => `${option?.name || ""} ${option?.label || ""}`.toLowerCase().includes(search))
            .slice(0, 20);
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;

        setForm((prevForm) => {
            const updatedForm = { ...prevForm, [field]: value };

            if (field === "productBrand") {
                // Filter categories for selected brand
                const matchedBrand = productCategory.find((item) => item.brand === value);
                setFilteredCategories(matchedBrand?.categories || []);

                // Reset dependent fields
                updatedForm.productCategory = "";
                updatedForm.productSubCategory = "";
                updatedForm.product = "";
                updatedForm.hsnCode = "";
                setFilteredSubCategories([]);
                setFilteredProducts([]);
            }

            if (field === "productCategory") {
                // Filter subcategories for selected brand + category
                const matchedSubCat = productSubCategory.find((item) => item.brand === form.productBrand && item.productCategoryName === value);
                setFilteredSubCategories(matchedSubCat?.subCategories || []);

                updatedForm.productSubCategory = "";
                updatedForm.product = "";
                updatedForm.hsnCode = "";
                setFilteredProducts([]);
            }

            if (field === "productSubCategory") {
                // Filter products for selected brand + category + subcategory
                const matchedProducts = product.filter(
                    (item) =>
                        item.brand === form.productBrand &&
                        item.productCategoryName === form.productCategory &&
                        item.productSubCategoryName === value,
                );

                const formatted = matchedProducts.flatMap((prod) =>
                    Array.isArray(prod.product)
                        ? prod.product.map((pName) => ({
                              name: pName,
                              productBrand: prod.brand || "",
                              productCategory: prod.productCategoryName || "",
                              productSubCategory: prod.productSubCategoryName || "",
                              hsnCode: prod.hsnCode,
                              description: prod.description,
                              unit: prod.productUnitName,
                              productPrice: prod.productPrice,
                          }))
                        : [],
                );

                setFilteredProducts(formatted);
                updatedForm.product = "";
                updatedForm.hsnCode = "";
                updatedForm.description = "";
                updatedForm.unit = "";
            }

            if (field === "product") {
                const selected = e.target.option || filteredProducts.find((p) => p.name === value) || buildProductSuggestions().find((p) => p.name === value);
                if (selected?.productBrand) updatedForm.productBrand = selected.productBrand;
                if (selected?.productCategory) updatedForm.productCategory = selected.productCategory;
                if (selected?.productSubCategory) updatedForm.productSubCategory = selected.productSubCategory;
                updatedForm.hsnCode = selected?.hsnCode || "";
                updatedForm.productDescription = selected?.description || "";
                updatedForm.unit = selected?.unit || "";
                updatedForm.pricePerUnit = selected?.productPrice || "";
                setProductSearch(value || "");
            }

            return updatedForm;
        });

        setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    };

    const handleDateChange = (e) => {
        setForm({ ...form, date: e.target.value });
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
                    setForm((prev) => ({ ...prev, selectedCustomer: defaultCustomer }));
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
                setForm((prev) => ({ ...prev, selectedCustomer: option.label }));

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

    const validateFieldsForAddHandler = () => {
        let tempErrors = {};
        let hasError = false;

        if (!form.product) {
            tempErrors.product = true;
            hasError = true;
        }
        if (!form.quantity) {
            tempErrors.quantity = true;
            hasError = true;
        }
        if (!form.unit) {
            tempErrors.unit = true;
            hasError = true;
        }
        if (!form.pricePerUnit) {
            tempErrors.pricePerUnit = true;
            hasError = true;
        }
        if (form.gstinType === "Intrastate") {
            if (!form.cgst) {
                tempErrors.cgst = true;
                hasError = true;
            }
            if (!form.sgst) {
                tempErrors.sgst = true;
                hasError = true;
            }
        } else if (form.gstinType === "Interstate") {
            if (!form.igst) {
                tempErrors.igst = true;
                hasError = true;
            }
        }

        setErrors(tempErrors);
        return !hasError;
    };

    const [editProductDetailsIndex, setEditProductDetailsIndex] = useState(null);
    const [editProductDetailsType, setEditProductDetailsType] = useState("");

    const handleSaveProductDetails = () => {
        if (!validateFieldsForAddHandler()) return;

        const newEntry = {
            productBrand: form.productBrand,
            productCategory: form.productCategory,
            productSubCategory: form.productSubCategory,
            product: form.product,
            hsnCode: form.hsnCode,
            quantity: form.quantity,
            unit: form.unit,
            description: form.productDescription,
            pricePerUnit: form.pricePerUnit,
            purchaseCost: form.purchaseCost,
            vendorName: form.vendorName,
            subTotal: form.subTotal,
            gstinType: form.gstinType,
            cgst: form.cgst,
            sgst: form.sgst,
            igst: form.igst,
            cgstAmt: form.cgstAmt,
            sgstAmt: form.sgstAmt,
            igstAmt: form.igstAmt,
            discount: form.discount,
            total: form.total,
        };

        if (editProductDetailsIndex !== null) {
            // Update logic
            if (editProductDetailsType === "Intrastate") {
                const updated = [...intrastateProducts];
                updated[editProductDetailsIndex] = newEntry;
                setIntrastateProducts(updated);
                localStorage.setItem("productQuotationDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts];
                updated[editProductDetailsIndex] = newEntry;
                setInterstateProducts(updated);
                localStorage.setItem("productQuotationDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
            }

            setEditProductDetailsIndex(null);
            setEditProductDetailsType("");
        } else {
            // Add logic
            if (form.gstinType === "Intrastate") {
                const updated = [...intrastateProducts, newEntry];
                setIntrastateProducts(updated);
                localStorage.setItem("productQuotationDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts, newEntry];
                setInterstateProducts(updated);
                localStorage.setItem("productQuotationDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
            }
        }

        // Reset fields after Add or Update
        setForm((prevForm) => ({
            ...prevForm,
            productBrand: "",
            productCategory: "",
            productSubCategory: "",
            product: "",
            hsnCode: "",
            quantity: "",
            unit: "",
            productDescription: "",
            pricePerUnit: "",
            purchaseCost: "",
            vendorName: "",
            subTotal: "",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
            discount: "",
            total: "",
        }));
    };

    const handleResetProductDetails = () => {
        setForm((prevForm) => ({
            ...prevForm,
            productBrand: "",
            productCategory: "",
            productSubCategory: "",
            product: "",
            hsnCode: "",
            quantity: "",
            unit: "",
            quotationDescription: "",
            pricePerUnit: "",
            purchaseCost: "",
            vendorName: "",
            subTotal: "",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
            total: "",
            discount: "",
        }));
        setProductSearch("");
        setEditProductDetailsIndex(null);
        setEditProductDetailsType("");
    };

    const handleEditProductDetails = (index, gstinType) => {
        const isIntrastate = gstinType === "Intrastate";
        const item = isIntrastate ? intrastateProducts[index] : interstateProducts[index];

        setEditProductDetailsIndex(index);
        setEditProductDetailsType(item.gstinType);
        setProductSearch(item.product || "");

        // Step 1: Filter categories for the brand
        const matchedBrand = productCategory.find((cat) => cat.brand === item.productBrand);
        setFilteredCategories(matchedBrand?.categories || []);

        // Step 2: Filter subcategories for the brand + category
        const matchedSubCat = productSubCategory.find((sub) => sub.brand === item.productBrand && sub.productCategoryName === item.productCategory);
        setFilteredSubCategories(matchedSubCat?.subCategories || []);

        // Step 3: Filter products for brand + category + subcategory
        const matchedProducts = product.filter(
            (p) =>
                p.brand === item.productBrand &&
                p.productCategoryName === item.productCategory &&
                p.productSubCategoryName === item.productSubCategory,
        );

        const formattedProducts = matchedProducts.flatMap((prod) =>
            Array.isArray(prod.product) // 🔥 FIX → use `prod.product` (same as in handleChange)
                ? prod.product.map((pName) => ({
                      name: pName,
                      hsnCode: prod.hsnCode,
                      description: prod.description, // ✅ include description
                      unit: prod.productUnitName, // ✅ include unit
                      productPrice: prod.productPrice,
                  }))
                : [],
        );
        setFilteredProducts(formattedProducts);

        // Step 4: Find product details for the currently selected product
        const selectedProduct = formattedProducts.find((p) => p.name === item.product);

        // Step 5: Populate form
        setForm((prev) => ({
            ...prev,
            productBrand: item.productBrand,
            productCategory: item.productCategory,
            productSubCategory: item.productSubCategory,
            product: item.product, // ✅ product restored
            hsnCode: selectedProduct?.hsnCode || item.hsnCode || "",
            productDescription: selectedProduct?.description || item.description || "",
            unit: selectedProduct?.unit || item.unit || "",
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            purchaseCost: item.purchaseCost || "",
            vendorName: item.vendorName || "",
            subTotal: item.subTotal,
            gstinType: item.gstinType,
            cgst: item.cgst,
            sgst: item.sgst,
            igst: item.igst,
            cgstAmt: item.cgstAmt,
            sgstAmt: item.sgstAmt,
            igstAmt: item.igstAmt,
            discount: item.discount,
            total: item.total,
        }));
    };

    const handleDeleteProductDetails = (index, gstinType) => {
        if (gstinType === "Intrastate") {
            const updated = intrastateProducts.filter((_, i) => i !== index);
            setIntrastateProducts(updated);
            localStorage.setItem("productQuotationDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
        } else {
            const updated = interstateProducts.filter((_, i) => i !== index);
            setInterstateProducts(updated);
            localStorage.setItem("productQuotationDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
        }
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

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSubmit = () => {
        if (!validateFields()) {
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const productQuotationDetails = JSON.parse(localStorage.getItem("productQuotationDetails")) || {
            intrastate: [],
            interstate: [],
        };

        if (productQuotationDetails.intrastate.length === 0 && productQuotationDetails.interstate.length === 0) {
            setLocalSnackbarMessage("No product added yet, Please do add!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const formattedDate = form.date.split("-").reverse().join("-");

        const selectedCustomer = companyDetails.customers.find((cust) => {
            const fullName = cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
            return fullName === form.selectedCustomer;
        });

        const getCountryNameById = (id) => {
            const match = country.find((c) => c.id === id);
            return match?.country || "";
        };

        const result = {
            assignedTo: form.assignedTo.map((emp) => emp.id),
            companyName: selectedCompany,
            date: formattedDate,
            gstinNo: companyDetails.gstinNo,
            customerPerson: form.selectedCustomer,
            mobile: selectedCustomer?.mobile || "",
            email: selectedCustomer?.email || "",
            description: form.quotationDescription,
            termsAndConditions: form.termsAndConditions,
            billingAddress: {
                ...companyDetails.billingAddress,
                country: getCountryNameById(companyDetails.billingAddress.country),
            },
            shippingAddress: {
                ...companyDetails.shippingAddress,
                country: getCountryNameById(companyDetails.shippingAddress.country),
            },
            productQuotationDetails,
            finalAmt: form.finalAmt,
        };

        dispatch(createQuotation(result));

        // Reset form
        setForm({
            assignedTo: [],
            selectedCustomer: "",
            date: "",
            description: "",
            termsAndConditions: "",
        });
        setSelectedCompany("");
        setCompanyDetails({
            companyName: "",
            gstinNo: "",
            customers: [],
            billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
        });
        setSelectedCustomerDetails({ code: "", mobile: "", email: "" });

        localStorage.removeItem("productQuotationDetails");

        setTimeout(() => {
            navigate("/quotations");
        }, 1000);
    };

    return (
        <>
            {initialLoad ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-4">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg">Create New Quotation :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>

                    {/* Business Type Selector */}
                    <div className="mb-6 flex items-center gap-8">
                        <div className="flex items-center gap-2">
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
                                className="cursor-pointer text-sm font-medium text-[#433C50]"
                            >
                                B2B (Business to Business)
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
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
                                className="cursor-pointer text-sm font-medium text-[#433C50]"
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
                                {/* <div className="flex-none items-center gap-2 space-y-3 md:flex-none lg:flex lg:space-y-0">
                                    <div className="text-nowrap text-xs font-medium text-[#433C50] md:text-sm lg:text-base">Search by Customer</div>
                                    <Autocomplete
                                        disablePortal
                                        options={allCustomerNames}
                                        value={form.selectedCustomer || ""}
                                        onChange={(e, newValue) => {
                                            if (newValue) {
                                                setForm((prev) => ({ ...prev, selectedCustomer: newValue }));
                                                handleSearch("customer", newValue);
                                            } else {
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
                                </div> */}

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
                        {/* <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={employees}
                            getOptionLabel={(option) => formatEmployeeName(option)}
                            value={form.assignedTo}
                            onChange={(e, newValue) => {
                                setForm((prev) => ({
                                    ...prev,
                                    assignedTo: newValue,
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    assignedTo: false,
                                }));
                            }}
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
                                    error={errors.assignedTo}
                                    size="small"
                                />
                            )}
                            className="w-full md:w-64 lg:w-96"
                        /> */}
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

                    {/* Company Info */}
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
                            InputProps={{ readOnly: true }}
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

                    {/* Address Info */}
                    <div className="flex-none gap-4 md:flex lg:flex">
                        {/* Billing Address */}
                        <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
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
                        <div className="mt-3 w-full space-y-4 md:mt-0 md:w-1/2 lg:mt-0 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
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
                    <div className="mt-4">
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

                    {/* Product Details */}
                    <div className="space-y-4">
                        <p className="font-semibold text-[#433C50]">Product Details</p>
                        <Box className="flex items-center gap-10 text-nowrap md:gap-5 lg:gap-5">
                            <span className="-mt-1 text-sm font-semibold text-[#433C50] md:-mt-1.5 lg:-mt-1.5">GSTIN Type :</span>
                            <RadioGroup
                                row
                                value={form.gstinType}
                                onChange={handleChange("gstinType")}
                            >
                                <FormControlLabel
                                    value="Intrastate"
                                    control={<Radio size="small" />}
                                    label="For Intrastate"
                                />
                                <FormControlLabel
                                    value="Interstate"
                                    control={<Radio size="small" />}
                                    label="For Interstate"
                                />
                            </RadioGroup>
                        </Box>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <Autocomplete
                                disablePortal
                                options={productBrand.map((brand) => brand.productBrand)}
                                value={form.productBrand || ""}
                                onChange={(e, newValue) => handleChange("productBrand")({ target: { value: newValue } })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Brand *"
                                        size="small"
                                        error={!!errors.productBrand}
                                    />
                                )}
                                className="flex-1"
                            />
                            <Autocomplete
                                disablePortal
                                options={filteredCategories || []}
                                value={form.productCategory || ""}
                                onChange={(e, newValue) => handleChange("productCategory")({ target: { value: newValue } })}
                                disabled={!form.productBrand}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Category *"
                                        size="small"
                                        error={!!errors.productCategory}
                                    />
                                )}
                                className="flex-1"
                            />
                            <Autocomplete
                                disablePortal
                                options={filteredSubCategories || []}
                                value={form.productSubCategory || ""}
                                onChange={(e, newValue) => handleChange("productSubCategory")({ target: { value: newValue } })}
                                disabled={!form.productCategory}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Subcategory *"
                                        size="small"
                                        error={!!errors.productSubCategory}
                                    />
                                )}
                                className="flex-1"
                            />
                            <Autocomplete
                                disablePortal
                                options={getProductOptions()}
                                filterOptions={filterProductSuggestions}
                                autoHighlight
                                open={productSearch.trim().length > 0 && productSearch !== form.product}
                                inputValue={productSearch}
                                onInputChange={(event, newInputValue, reason) => {
                                    if (reason === "input") setProductSearch(newInputValue);
                                    if (reason === "clear") setProductSearch("");
                                }}
                                noOptionsText="No matching product found"
                                getOptionLabel={(option) => (typeof option === "string" ? option : option?.name || "")}
                                isOptionEqualToValue={(option, value) => option?.name === value?.name}
                                value={getProductOptions().find((prod) => prod.name === form.product) || null}
                                onChange={(e, newValue) => handleChange("product")({ target: { value: newValue?.name || "", option: newValue } })}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <div>
                                            <div className="font-medium">{option.name}</div>
                                            <div className="text-xs text-gray-500">{[option.productBrand, option.productCategory, option.productSubCategory].filter(Boolean).join(" > ")}</div>
                                        </div>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product *"
                                        size="small"
                                        error={!!errors.product}
                                    />
                                )}
                                className="flex-1"
                            />
                            <TextField
                                label="HSN Code"
                                value={form.hsnCode}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <TextField
                                label="Quantity *"
                                placeholder="Quantity"
                                type="number"
                                value={form.quantity}
                                error={errors.quantity}
                                onChange={handleChange("quantity")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />

                            <TextField
                                label="Unit *"
                                placeholder="Unit"
                                value={form.unit}
                                error={errors.unit}
                                onChange={handleChange("unit")}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />

                            <TextField
                                label="Price Per Unit *"
                                placeholder="Price Per Unit"
                                type="number"
                                value={form.pricePerUnit}
                                error={errors.pricePerUnit}
                                onChange={handleChange("pricePerUnit")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Purchase Cost"
                                placeholder="Purchase Cost"
                                type="number"
                                value={form.purchaseCost}
                                onChange={handleChange("purchaseCost")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />

                            <TextField
                                label="Sub Total"
                                placeholder="Sub Total"
                                value={form.subTotal}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <Box>
                            <TextField
                                label="Vendor Name"
                                placeholder="Vendor Name"
                                value={form.vendorName}
                                onChange={handleChange("vendorName")}
                                fullWidth
                                size="small"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Description"
                                // value={form.description}
                                value={stripHtmlTags(form.productDescription)}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                        {form.gstinType === "Intrastate" && (
                            <div className="space-y-4">
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="CGST (%) *"
                                        placeholder="CGST (%)"
                                        type="number"
                                        value={form.cgst}
                                        onChange={handleChange("cgst")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0 }}
                                        error={errors.cgst}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="CGST Amt"
                                        placeholder="CGST Amount"
                                        value={form.cgstAmt}
                                        InputProps={{ readOnly: true }}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="SGST (%) *"
                                        placeholder="SGST (%)"
                                        type="number"
                                        value={form.sgst}
                                        onChange={handleChange("sgst")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0 }}
                                        error={errors.sgst}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="SGST Amt"
                                        placeholder="SGST Amount"
                                        value={form.sgstAmt}
                                        InputProps={{ readOnly: true }}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Discount (%)"
                                        placeholder="Discount (%)"
                                        type="number"
                                        value={form.discount}
                                        onChange={handleChange("discount")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0, max: 100 }}
                                        error={errors.discount}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Total"
                                        value={form.total}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>

                                <div className="flex gap-5">
                                    <Button
                                        variant="gradient"
                                        className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
                                        onClick={handleResetProductDetails}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        className={`rounded px-6 py-2 capitalize text-white md:text-base ${editProductDetailsIndex !== null ? "bg-green-500" : "bg-blue-500"}`}
                                        onClick={handleSaveProductDetails}
                                    >
                                        {editProductDetailsIndex !== null ? "Update" : "Add"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {form.gstinType === "Interstate" && (
                            <div className="space-y-4">
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="IGST (%) *"
                                        placeholder="IGST (%)"
                                        type="number"
                                        value={form.igst}
                                        onChange={handleChange("igst")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0 }}
                                        error={errors.igst}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="IGST Amt"
                                        placeholder="IGST Amount"
                                        value={form.igstAmt}
                                        InputProps={{ readOnly: true }}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Discount (%)"
                                        placeholder="Discount (%)"
                                        type="number"
                                        value={form.discount}
                                        onChange={handleChange("discount")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0, max: 100 }}
                                        error={errors.discount}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Total"
                                        value={form.total}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>

                                <div className="flex gap-5">
                                    <Button
                                        variant="gradient"
                                        className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
                                        onClick={handleResetProductDetails}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        className={`rounded px-6 py-2 capitalize text-white md:text-base ${editProductDetailsIndex !== null ? "bg-green-500" : "bg-blue-500"}`}
                                        onClick={handleSaveProductDetails}
                                    >
                                        {editProductDetailsIndex !== null ? "Update" : "Add"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="card-body p-0">
                            <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                                <table className="table">
                                    <thead className="table-header text-nowrap bg-[#053054] text-white">
                                        <tr className="table-row">
                                            <th className="border border-gray-300 px-2 py-1">Sr No.</th>
                                            <th className="border border-gray-300 px-2 py-1">Product</th>
                                            <th className="border border-gray-300 px-2 py-1">HSN</th>
                                            <th className="border border-gray-300 px-2 py-1">Price</th>

                                            {form.gstinType === "Intrastate" ? (
                                                <>
                                                    <th className="border border-gray-300 px-2 py-1">CGST (%)</th>
                                                    <th className="border border-gray-300 px-2 py-1">CGST Amt</th>
                                                    <th className="border border-gray-300 px-2 py-1">SGST (%)</th>
                                                    <th className="border border-gray-300 px-2 py-1">SGST Amt</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="border border-gray-300 px-2 py-1">IGST (%)</th>
                                                    <th className="border border-gray-300 px-2 py-1">IGST Amt</th>
                                                </>
                                            )}

                                            <th className="border border-gray-300 px-2 py-1">Total</th>
                                            <th className="border border-gray-300 px-2 py-1">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).length > 0 ? (
                                            (form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="text-center"
                                                >
                                                    <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                                                    <td className="text-nowrap border border-gray-300 px-2 py-1">{item.product}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.hsnCode}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.pricePerUnit}</td>

                                                    {form.gstinType === "Intrastate" ? (
                                                        <>
                                                            <td className="border border-gray-300 px-2 py-1">{item.cgst}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.cgstAmt}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.sgst}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.sgstAmt}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="border border-gray-300 px-2 py-1">{item.igst}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.igstAmt}</td>
                                                        </>
                                                    )}

                                                    <td className="border border-gray-300 px-2 py-1">{item.total}</td>
                                                    <td className="space-x-2 border border-gray-300 px-2 py-1">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEditProductDetails(index, form.gstinType)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteProductDetails(index, form.gstinType)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={form.gstinType === "Intrastate" ? 11 : 9}
                                                    className="py-3 text-center text-gray-500"
                                                >
                                                    No product added yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <TextField
                            label="Final Amount"
                            value={form.finalAmt}
                            InputProps={{ readOnly: true }}
                            fullWidth
                            size="small"
                        />
                    </div>

                    {/* Description */}
                    <Box>
                        <div className="mb-2 text-sm font-medium text-gray-700">Description</div>
                        <ReactQuill
                            value={form.quotationDescription}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, quotationDescription: value }));
                            }}
                            theme="snow"
                            placeholder="Enter quotation description..."
                            className={`bg-white`}
                        />
                    </Box>

                    {/* Terms And Conditions */}
                    <Box>
                        <div className="mb-2 text-sm font-medium text-gray-700">Terms and Conditions</div>
                        <ReactQuill
                            value={form.termsAndConditions}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, termsAndConditions: value }));
                            }}
                            theme="snow"
                            placeholder="Enter quotation terms and conditions..."
                            className={`bg-white`}
                        />
                    </Box>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        {/* <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <SiWikiquote size={20} />
                            Generate Quotation
                        </Button> */}
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            disabled={isSubmittingSuccessfully || loading} // optional: also disable if globally loading
                            className={`flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base ${isSubmittingSuccessfully ? "cursor-not-allowed bg-[#053054]/70 opacity-70" : "bg-[#053054] hover:bg-[#053054]/90"} transition-all`}
                        >
                            {isSubmittingSuccessfully ? (
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
                                    <SiWikiquote size={20} />
                                    Generate Quotation
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
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

export default CreateQuotation;
