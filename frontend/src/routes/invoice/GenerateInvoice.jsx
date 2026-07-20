// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Alert, Box, FormControlLabel, MenuItem, Radio, RadioGroup, Snackbar, TextField } from "@mui/material";
// import { Button } from "@material-tailwind/react";
// import { Search, PencilLine, Trash } from "lucide-react";
// import { LiaFileInvoiceSolid } from "react-icons/lia";

// const GenerateInvoice = () => {
//     const navigate = useNavigate();
//     const [invoiceType, setInvoiceType] = useState("order");
//     const [orderNo, setOrderNo] = useState("");
//     const [customers, setCustomers] = useState([]);
//     const [manualCustomerDetails, setManualCustomerDetails] = useState({ email: "", mobile: "" });
//     const [form, setForm] = useState({
//         selectedCompany: "",
//         date: "",
//         customerPerson: "",
//         email: "",
//         mobile: "",
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

//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");

//     useEffect(() => {
//         // Remove stored productInvoiceDetails on page reload
//         localStorage.removeItem("productInvoiceDetails");
//     }, []);

//     useEffect(() => {
//         const storedCustomers = JSON.parse(localStorage.getItem("customer")) || [];
//         setCustomers(storedCustomers);
//         console.log(storedCustomers);
//     }, []);

//     const filteredCompany = customers.find((comp) => comp.companyName === form.selectedCompany);
//     const filteredCustomers = filteredCompany ? filteredCompany.customers : [];

//     const handleOrderSearch = () => {
//         if (!orderNo.trim()) {
//             setErrors((prev) => ({ ...prev, orderNo: true }));
//             setSnackbarMessage("Order number is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const orders = JSON.parse(localStorage.getItem("orders")) || [];
//         const orderIndex = parseInt(orderNo, 10) - 1;

//         if (!isNaN(orderIndex) && orderIndex >= 0 && orderIndex < orders.length) {
//             const orderData = orders[orderIndex];

//             // Extract productOrderDetails
//             const { productOrderDetails } = orderData || {};
//             const intrastate = productOrderDetails?.intrastate || [];
//             const interstate = productOrderDetails?.interstate || [];

//             // ✅ Save product details to localStorage for invoice submission
//             localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate, interstate }));

//             // Update the state
//             setIntrastateProducts(intrastate);
//             setInterstateProducts(interstate);

//             setForm((prevForm) => ({
//                 ...prevForm,
//                 selectedCompany: orderData.selectedCompany || "",
//                 date: prevForm.date || orderData.date || "",
//                 companyName: prevForm.companyName || "",
//                 customerPerson: orderData.customerPerson || "",
//                 email: orderData.email || "",
//                 mobile: orderData.mobile || "",
//                 billingAddress: {
//                     ...prevForm.billingAddress,
//                     ...orderData.billingAddress,
//                 },
//                 shippingAddress: {
//                     ...prevForm.shippingAddress,
//                     ...orderData.shippingAddress,
//                 },
//                 productCategory: "", // Reset if needed
//                 product: "", // Reset if needed
//                 quantity: "", // Reset if needed
//                 pricePerUnit: "", // Reset if needed
//             }));

//             setErrors({});
//         } else {
//             setSnackbarMessage("Order not found!");
//             setSnackbarOpen(true);
//         }
//     };

//     useEffect(() => {
//         const today = new Date();
//         const dd = String(today.getDate()).padStart(2, "0");
//         const mm = String(today.getMonth() + 1).padStart(2, "0");
//         const yyyy = today.getFullYear();
//         const formattedDate = `${yyyy}-${mm}-${dd}`;

//         setForm((prev) => ({ ...prev, date: formattedDate }));
//     }, []);

//     const [productList, setProductList] = useState([]);

//     useEffect(() => {
//         const storedProduct = JSON.parse(localStorage.getItem("productsList")) || [];
//         setProductList(storedProduct);
//     }, []);

//     const [intrastateProducts, setIntrastateProducts] = useState([]);
//     const [interstateProducts, setInterstateProducts] = useState([]);

//     useEffect(() => {
//         const saved = JSON.parse(localStorage.getItem("productInvoiceDetails"));
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

//     const handleChange = (field, subfield) => (e) => {
//         const value = e.target.value;

//         setForm((prevForm) => {
//             const updatedForm = { ...prevForm };

//             if (subfield) {
//                 updatedForm[field] = {
//                     ...prevForm[field],
//                     [subfield]: value,
//                 };
//             } else {
//                 updatedForm[field] = value;

//                 if (field === "productCategory") {
//                     const productsInCategory = productList.filter((item) => item.Category === value);
//                     setFilteredProducts(productsInCategory);
//                     updatedForm.product = ""; // Reset product
//                     updatedForm.hsnCode = ""; // Clear HSN
//                 }

//                 if (field === "product") {
//                     const selectedProduct = filteredProducts.find((item) =>
//                         Array.isArray(item.name) ? item.name.includes(value) : item.name === value,
//                     );
//                     updatedForm.hsnCode = selectedProduct?.hsnCode || "";
//                 }

//                 if (field === "selectedCustomer") {
//                     const selected = companyDetails.customers.find((cust) => {
//                         const fullName =
//                             cust.fullName || `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.replace(/\s+/g, " ");
//                         return fullName === value;
//                     });

//                     if (selected) {
//                         setSelectedCustomerDetails({
//                             mobile: selected.mobile,
//                             email: selected.email,
//                         });
//                     } else {
//                         setSelectedCustomerDetails({ mobile: "", email: "" });
//                     }
//                 }
//             }

//             return updatedForm;
//         });

//         setErrors((prevErrors) => ({
//             ...prevErrors,
//             [field]: false,
//         }));
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
//                 "productInvoiceDetails",
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
//                 "productInvoiceDetails",
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

//         const requiredFields = ["selectedCompany", "customerPerson", "email", "mobile"];

//         requiredFields.forEach((field) => {
//             if (!form[field]) {
//                 tempErrors[field] = true;
//                 hasError = true;
//             }
//         });

//         const addressFields = ["street", "city", "state", "pincode", "country"];

//         addressFields.forEach((field) => {
//             if (!form.billingAddress[field]) {
//                 tempErrors[`billingAddress.${field}`] = true;
//                 hasError = true;
//             }
//         });

//         addressFields.forEach((field) => {
//             if (!form.shippingAddress[field]) {
//                 tempErrors[`shippingAddress.${field}`] = true;
//                 hasError = true;
//             }
//         });

//         setErrors(tempErrors);
//         return !hasError;
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const handleSubmit = () => {
//         // First validate form fields
//         if (!validateFields()) {
//             setSnackbarMessage("Please fill all required fields.");
//             setSnackbarOpen(true);
//             return;
//         }

//         // ✅ Get productInvoiceDetails from localStorage
//         const productInvoiceDetails = JSON.parse(localStorage.getItem("productInvoiceDetails")) || {
//             intrastate: [],
//             interstate: [],
//         };

//         // ✅ Check if at least one product is added
//         if (productInvoiceDetails.intrastate.length === 0 && productInvoiceDetails.interstate.length === 0) {
//             setSnackbarMessage("No product added yet, Please do add!");
//             setSnackbarOpen(true);
//             return;
//         }

//         // ✅ Format date
//         const [yyyy, mm, dd] = form.date.split("-");
//         const formattedDisplayDate = `${dd}-${mm}-${yyyy}`;

//         // ✅ Create invoice object with the structured data you want to log
//         const invoice = {
//             billingAddress: form.billingAddress,
//             customerPerson: form.customerPerson,
//             date: formattedDisplayDate,
//             email: form.email,
//             finalAmt: form.finalAmt,
//             mobile: form.mobile,
//             invoiceDate: new Date().toISOString(),
//             productInvoiceDetails,
//             selectedCompany: form.selectedCompany,
//             shippingAddress: form.shippingAddress,
//         };

//         // ✅ Save to localStorage
//         const existingInvoice = JSON.parse(localStorage.getItem("invoice")) || [];
//         existingInvoice.push(invoice);
//         localStorage.setItem("invoice", JSON.stringify(existingInvoice));

//         // ✅ Clear productInvoiceDetails from localStorage
//         localStorage.removeItem("productInvoiceDetails");

//         // ✅ Log the invoice object for confirmation
//         console.log("Invoice Generated:", invoice);

//         setSnackbarMessage("Invoice Generated successfully!");
//         setSnackbarOpen(true);

//         setTimeout(() => {
//             navigate("/invoice");
//         }, 500);
//     };

//     return (
//         <div className="card space-y-1">
//             <div className="flex items-center justify-between text-nowrap">
//                 <div className="text-base font-semibold text-[#433C50] md:text-lg">Generate Invoice :</div>
//                 <Button
//                     onClick={() => navigate(-1)}
//                     variant="gradient"
//                     className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                 >
//                     Back
//                 </Button>
//             </div>
//             {/* search by order for Invoice Generate or manually Invoice Generate */}
//             <div>
//                 <RadioGroup
//                     value={invoiceType}
//                     onChange={(e) => setInvoiceType(e.target.value)}
//                 >
//                     <div className="flex-none gap-0 space-y-3 md:flex-none md:gap-0 md:space-y-3 lg:flex lg:gap-20 lg:space-y-0">
//                         <div className="flex-none items-center gap-2 space-y-1 md:flex-none md:space-y-1 lg:flex lg:space-y-0">
//                             <FormControlLabel
//                                 value="order"
//                                 control={<Radio size="small" />}
//                                 label="Search by Order No :"
//                             />
//                             {invoiceType === "order" && (
//                                 <div className="flex gap-5">
//                                     <TextField
//                                         label="Order Number *"
//                                         type="number"
//                                         placeholder="Enter Order Number"
//                                         size="small"
//                                         value={orderNo}
//                                         onChange={(e) => {
//                                             const value = e.target.value;
//                                             if (value === "" || /^[0-9]*$/.test(value)) {
//                                                 setOrderNo(value);
//                                                 setErrors((prev) => ({ ...prev, orderNo: false }));
//                                             }
//                                         }}
//                                         onWheel={(e) => e.target.blur()}
//                                         inputProps={{
//                                             min: 0,
//                                             onKeyDown: (e) => {
//                                                 if (e.key === "-" || e.key === "e") e.preventDefault();
//                                             },
//                                         }}
//                                         error={errors.orderNo}
//                                         className="w-56 md:w-72 lg:w-64"
//                                     />
//                                     <Button
//                                         onClick={handleOrderSearch}
//                                         className="bg-green-500 px-1.5 py-1.5 text-white md:px-2 md:py-0 lg:px-2 lg:py-0"
//                                     >
//                                         <Search size={20} />
//                                     </Button>
//                                 </div>
//                             )}
//                         </div>

//                         <div>
//                             <FormControlLabel
//                                 value="manual"
//                                 control={<Radio size="small" />}
//                                 label="Manually Generate Invoice"
//                             />
//                         </div>
//                     </div>
//                 </RadioGroup>
//             </div>
//             <div>
//                 <TextField
//                     type="date"
//                     size="small"
//                     label="Date"
//                     value={form.date}
//                     onChange={handleChange("date")}
//                     InputLabelProps={{ shrink: true }}
//                 />
//             </div>

//             {invoiceType === "order" ? (
//                 <div className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Company Name *"
//                         fullWidth
//                         value={form.selectedCompany}
//                         error={!!errors.selectedCompany}
//                         onChange={handleChange("selectedCompany")}
//                         size="small"
//                     />
//                     <TextField
//                         label="Customer Name *"
//                         fullWidth
//                         value={form.customerPerson}
//                         error={!!errors.customerPerson}
//                         onChange={handleChange("customerPerson")}
//                         size="small"
//                     />
//                 </div>
//             ) : (
//                 <div className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         select
//                         label="Company Name *"
//                         fullWidth
//                         value={form.selectedCompany}
//                         onChange={(e) => {
//                             const value = e.target.value;
//                             setForm((prev) => ({
//                                 ...prev,
//                                 selectedCompany: value,
//                                 customerPerson: "", // reset customer
//                             }));
//                             setManualCustomerDetails({ email: "", mobile: "" });
//                         }}
//                         error={!!errors.selectedCompany}
//                         size="small"
//                     >
//                         {[...new Set(customers.map((cust) => cust.companyName))].map((company, index) => (
//                             <MenuItem
//                                 key={index}
//                                 value={company}
//                             >
//                                 {company}
//                             </MenuItem>
//                         ))}
//                     </TextField>

//                     <TextField
//                         select
//                         label="Customer Name *"
//                         fullWidth
//                         value={form.customerPerson}
//                         onChange={(e) => {
//                             const value = e.target.value;
//                             const selectedCust = filteredCustomers.find((cust) => {
//                                 const fullName = `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.trim();
//                                 return fullName === value;
//                             });

//                             setForm((prev) => ({
//                                 ...prev,
//                                 customerPerson: value,
//                             }));

//                             if (selectedCust) {
//                                 setManualCustomerDetails({
//                                     email: selectedCust.email || "",
//                                     mobile: selectedCust.mobile || "",
//                                 });
//                                 setForm((prev) => ({
//                                     ...prev,
//                                     email: selectedCust.email || "",
//                                     mobile: selectedCust.mobile || "",
//                                 }));
//                             } else {
//                                 setManualCustomerDetails({ email: "", mobile: "" });
//                                 setForm((prev) => ({
//                                     ...prev,
//                                     email: "",
//                                     mobile: "",
//                                 }));
//                             }
//                         }}
//                         error={!!errors.customerPerson}
//                         size="small"
//                         disabled={!form.selectedCompany}
//                     >
//                         {filteredCustomers.map((cust, index) => {
//                             const fullName = `${cust.salutation} ${cust.firstName} ${cust.middleName} ${cust.lastName}`.trim();
//                             return (
//                                 <MenuItem
//                                     key={index}
//                                     value={fullName}
//                                 >
//                                     {fullName}
//                                 </MenuItem>
//                             );
//                         })}
//                     </TextField>
//                 </div>
//             )}

//             <div className="flex w-full flex-col gap-4 lg:flex-row">
//                 <TextField
//                     label="Email *"
//                     fullWidth
//                     value={form.email}
//                     error={!!errors.email}
//                     onChange={handleChange("email")}
//                     size="small"
//                 />
//                 <TextField
//                     label="Mobile *"
//                     fullWidth
//                     value={form.mobile}
//                     error={!!errors.mobile}
//                     onChange={handleChange("mobile")}
//                     size="small"
//                 />
//             </div>

//             {/* Product Details */}
//             <div className="space-y-4">
//                 <p className="font-semibold text-[#433C50]">Product Details</p>
//                 <Box className="flex items-center gap-10 text-nowrap md:gap-5 lg:gap-5">
//                     <span className="-mt-1 text-sm font-semibold text-[#433C50] md:-mt-1.5 lg:-mt-1.5">GSTIN Type :</span>
//                     <RadioGroup
//                         row
//                         value={form.gstinType}
//                         onChange={handleChange("gstinType")}
//                     >
//                         <FormControlLabel
//                             value="Intrastate"
//                             control={<Radio size="small" />}
//                             label="For Intrastate"
//                         />
//                         <FormControlLabel
//                             value="Interstate"
//                             control={<Radio size="small" />}
//                             label="For Interstate"
//                         />
//                     </RadioGroup>
//                 </Box>

//                 <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         select
//                         label="Product Category *"
//                         placeholder="Product Category"
//                         value={form.productCategory}
//                         error={errors.productCategory}
//                         onChange={handleChange("productCategory")}
//                         fullWidth
//                         size="small"
//                         sx={{ flex: 1 }}
//                     >
//                         {productList.map((option, index) => (
//                             <MenuItem
//                                 key={index}
//                                 value={option.Category}
//                             >
//                                 {option.Category}
//                             </MenuItem>
//                         ))}
//                     </TextField>

//                     <TextField
//                         select
//                         label="Product *"
//                         placeholder="Select Product"
//                         value={form.product}
//                         onChange={handleChange("product")}
//                         fullWidth
//                         size="small"
//                         error={errors.product}
//                         sx={{ flex: 1 }}
//                         disabled={!form.productCategory}
//                     >
//                         {filteredProducts.flatMap((prod, index) =>
//                             Array.isArray(prod.name)
//                                 ? prod.name.map((name, idx) => (
//                                       <MenuItem
//                                           key={`${index}-${idx}`}
//                                           value={name}
//                                       >
//                                           {name}
//                                       </MenuItem>
//                                   ))
//                                 : [
//                                       <MenuItem
//                                           key={index}
//                                           value={prod.name}
//                                       >
//                                           {prod.name}
//                                       </MenuItem>,
//                                   ],
//                         )}
//                     </TextField>

//                     <TextField
//                         label="HSN Code"
//                         value={form.hsnCode}
//                         fullWidth
//                         size="small"
//                         sx={{ flex: 1 }}
//                         InputProps={{ readOnly: true }}
//                     />
//                 </Box>

//                 <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                     <TextField
//                         label="Quantity *"
//                         placeholder="Quantity"
//                         type="number"
//                         value={form.quantity}
//                         error={errors.quantity}
//                         onChange={handleChange("quantity")}
//                         onWheel={(e) => e.target.blur()}
//                         inputProps={{ min: 0 }}
//                         fullWidth
//                         size="small"
//                         sx={{ flex: 1 }}
//                     />

//                     <TextField
//                         label="Price Per Unit *"
//                         placeholder="Price Per Unit"
//                         type="number"
//                         value={form.pricePerUnit}
//                         error={errors.pricePerUnit}
//                         onChange={handleChange("pricePerUnit")}
//                         onWheel={(e) => e.target.blur()}
//                         inputProps={{ min: 0 }}
//                         fullWidth
//                         size="small"
//                         sx={{ flex: 1 }}
//                     />

//                     <TextField
//                         label="Sub Total"
//                         placeholder="Sub Total"
//                         value={form.subTotal}
//                         InputProps={{ readOnly: true }}
//                         fullWidth
//                         size="small"
//                         sx={{ flex: 1 }}
//                     />
//                 </Box>
//                 {form.gstinType === "Intrastate" && (
//                     <div className="space-y-4">
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="CGST (%) *"
//                                 placeholder="CGST (%)"
//                                 type="number"
//                                 value={form.cgst}
//                                 onChange={handleChange("cgst")}
//                                 onWheel={(e) => e.target.blur()}
//                                 inputProps={{ min: 0 }}
//                                 error={errors.cgst}
//                                 size="small"
//                                 fullWidth
//                             />
//                             <TextField
//                                 label="CGST Amt"
//                                 placeholder="CGST Amount"
//                                 value={form.cgstAmt}
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                                 fullWidth
//                             />
//                         </Box>
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="SGST (%) *"
//                                 placeholder="SGST (%)"
//                                 type="number"
//                                 value={form.sgst}
//                                 onChange={handleChange("sgst")}
//                                 onWheel={(e) => e.target.blur()}
//                                 inputProps={{ min: 0 }}
//                                 error={errors.sgst}
//                                 size="small"
//                                 fullWidth
//                             />
//                             <TextField
//                                 label="SGST Amt"
//                                 placeholder="SGST Amount"
//                                 value={form.sgstAmt}
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                                 fullWidth
//                             />
//                         </Box>
//                         <TextField
//                             label="Total"
//                             value={form.total}
//                             InputProps={{ readOnly: true }}
//                             fullWidth
//                             size="small"
//                         />
//                         <div className="flex gap-5">
//                             <Button
//                                 variant="gradient"
//                                 className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
//                                 onClick={() =>
//                                     setForm((prev) => ({
//                                         ...prev,
//                                         cgst: "",
//                                         sgst: "",
//                                         cgstAmt: "",
//                                         sgstAmt: "",
//                                         total: prev.subTotal,
//                                     }))
//                                 }
//                             >
//                                 Reset
//                             </Button>
//                             <Button
//                                 variant="gradient"
//                                 className="rounded bg-blue-500 px-6 py-2 capitalize text-white md:text-base"
//                                 onClick={handleAdd}
//                             >
//                                 Add
//                             </Button>
//                         </div>
//                     </div>
//                 )}

//                 {form.gstinType === "Interstate" && (
//                     <div className="space-y-4">
//                         <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                             <TextField
//                                 label="IGST (%) *"
//                                 placeholder="IGST (%)"
//                                 type="number"
//                                 value={form.igst}
//                                 onChange={handleChange("igst")}
//                                 onWheel={(e) => e.target.blur()}
//                                 inputProps={{ min: 0 }}
//                                 error={errors.igst}
//                                 size="small"
//                                 fullWidth
//                             />
//                             <TextField
//                                 label="IGST Amt"
//                                 placeholder="IGST Amount"
//                                 value={form.igstAmt}
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                                 fullWidth
//                             />
//                         </Box>
//                         <TextField
//                             label="Total"
//                             value={form.total}
//                             InputProps={{ readOnly: true }}
//                             fullWidth
//                             size="small"
//                         />
//                         <div className="flex gap-5">
//                             <Button
//                                 variant="gradient"
//                                 className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
//                                 onClick={() =>
//                                     setForm((prev) => ({
//                                         ...prev,
//                                         igst: "",
//                                         igstAmt: "",
//                                         total: prev.subTotal,
//                                     }))
//                                 }
//                             >
//                                 Reset
//                             </Button>
//                             <Button
//                                 variant="gradient"
//                                 className="rounded bg-blue-500 px-6 py-2 capitalize text-white md:text-base"
//                                 onClick={handleAdd}
//                             >
//                                 Add
//                             </Button>
//                         </div>
//                     </div>
//                 )}

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="border border-gray-300 px-2 py-1">Sr No.</th>
//                                     <th className="border border-gray-300 px-2 py-1">Product</th>
//                                     <th className="border border-gray-300 px-2 py-1">HSN</th>
//                                     <th className="border border-gray-300 px-2 py-1">Price</th>

//                                     {form.gstinType === "Intrastate" ? (
//                                         <>
//                                             <th className="border border-gray-300 px-2 py-1">CGST (%)</th>
//                                             <th className="border border-gray-300 px-2 py-1">CGST Amt</th>
//                                             <th className="border border-gray-300 px-2 py-1">SGST (%)</th>
//                                             <th className="border border-gray-300 px-2 py-1">SGST Amt</th>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <th className="border border-gray-300 px-2 py-1">IGST (%)</th>
//                                             <th className="border border-gray-300 px-2 py-1">IGST Amt</th>
//                                         </>
//                                     )}

//                                     <th className="border border-gray-300 px-2 py-1">Total</th>
//                                     <th className="border border-gray-300 px-2 py-1">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {(form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).length > 0 ? (
//                                     (form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).map((item, index) => (
//                                         <tr
//                                             key={index}
//                                             className="text-center"
//                                         >
//                                             <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
//                                             <td className="border border-gray-300 text-nowrap px-2 py-1">{item.product}</td>
//                                             <td className="border border-gray-300 px-2 py-1">{item.hsnCode}</td>
//                                             <td className="border border-gray-300 px-2 py-1">{item.pricePerUnit}</td>

//                                             {form.gstinType === "Intrastate" ? (
//                                                 <>
//                                                     <td className="border border-gray-300 px-2 py-1">{item.cgst}</td>
//                                                     <td className="border border-gray-300 px-2 py-1">{item.cgstAmt}</td>
//                                                     <td className="border border-gray-300 px-2 py-1">{item.sgst}</td>
//                                                     <td className="border border-gray-300 px-2 py-1">{item.sgstAmt}</td>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <td className="border border-gray-300 px-2 py-1">{item.igst}</td>
//                                                     <td className="border border-gray-300 px-2 py-1">{item.igstAmt}</td>
//                                                 </>
//                                             )}

//                                             <td className="border border-gray-300 px-2 py-1">{item.total}</td>
//                                             <td className="border border-gray-300 space-x-2 px-2 py-1">
//                                                 <button className="text-blue-500">
//                                                     <PencilLine size={20} />
//                                                 </button>
//                                                 <button
//                                                     className="text-red-500"
//                                                     onClick={() => {
//                                                         if (form.gstinType === "Intrastate") {
//                                                             const updated = intrastateProducts.filter((_, i) => i !== index);
//                                                             setIntrastateProducts(updated);
//                                                             localStorage.setItem(
//                                                                 "productInvoiceDetails",
//                                                                 JSON.stringify({ intrastate: updated, interstate: interstateProducts }),
//                                                             );
//                                                         } else {
//                                                             const updated = interstateProducts.filter((_, i) => i !== index);
//                                                             setInterstateProducts(updated);
//                                                             localStorage.setItem(
//                                                                 "productInvoiceDetails",
//                                                                 JSON.stringify({ intrastate: intrastateProducts, interstate: updated }),
//                                                             );
//                                                         }
//                                                     }}
//                                                 >
//                                                     <Trash size={20} />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             colSpan={form.gstinType === "Intrastate" ? 11 : 9}
//                                             className="py-3 text-center text-gray-500"
//                                         >
//                                             No product added yet
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <TextField
//                     label="Final Amount"
//                     value={form.finalAmt}
//                     InputProps={{ readOnly: true }}
//                     fullWidth
//                     size="small"
//                 />
//             </div>

//             {/* Address Info */}
//             <div className="flex-none gap-4 md:flex lg:flex">
//                 {/* Billing Address */}
//                 <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
//                     <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Street *"
//                             fullWidth
//                             size="small"
//                             value={form.billingAddress.street}
//                             onChange={handleChange("billingAddress", "street")}
//                             error={!!errors["billingAddress.street"]}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="City *"
//                             fullWidth
//                             size="small"
//                             value={form.billingAddress.city}
//                             onChange={handleChange("billingAddress", "city")}
//                             error={!!errors["billingAddress.city"]}
//                         />
//                         <TextField
//                             label="State *"
//                             fullWidth
//                             size="small"
//                             value={form.billingAddress.state}
//                             onChange={handleChange("billingAddress", "state")}
//                             error={!!errors["billingAddress.state"]}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Pincode *"
//                             fullWidth
//                             size="small"
//                             value={form.billingAddress.pincode}
//                             onChange={handleChange("billingAddress", "pincode")}
//                             error={!!errors["billingAddress.pincode"]}
//                         />
//                         <TextField
//                             label="Country *"
//                             fullWidth
//                             size="small"
//                             value={form.billingAddress.country}
//                             onChange={handleChange("billingAddress", "country")}
//                             error={!!errors["billingAddress.country"]}
//                         />
//                     </Box>
//                 </div>

//                 {/* Shipping Address */}
//                 <div className="mt-3 w-full space-y-4 md:mt-0 md:w-1/2 lg:mt-0 lg:w-1/2">
//                     <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Street *"
//                             fullWidth
//                             size="small"
//                             value={form.shippingAddress.street}
//                             onChange={handleChange("shippingAddress", "street")}
//                             error={!!errors["shippingAddress.street"]}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="City *"
//                             fullWidth
//                             size="small"
//                             value={form.shippingAddress.city}
//                             onChange={handleChange("shippingAddress", "city")}
//                             error={!!errors["shippingAddress.city"]}
//                         />
//                         <TextField
//                             label="State *"
//                             fullWidth
//                             size="small"
//                             value={form.shippingAddress.state}
//                             onChange={handleChange("shippingAddress", "state")}
//                             error={!!errors["shippingAddress.state"]}
//                         />
//                     </Box>
//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             label="Pincode *"
//                             fullWidth
//                             size="small"
//                             value={form.shippingAddress.pincode}
//                             onChange={handleChange("shippingAddress", "pincode")}
//                             error={!!errors["shippingAddress.pincode"]}
//                         />
//                         <TextField
//                             label="Country *"
//                             fullWidth
//                             size="small"
//                             value={form.shippingAddress.country}
//                             onChange={handleChange("shippingAddress", "country")}
//                             error={!!errors["shippingAddress.country"]}
//                         />
//                     </Box>
//                 </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-end">
//                 <Button
//                     onClick={handleSubmit}
//                     variant="gradient"
//                     className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                 >
//                     <LiaFileInvoiceSolid size={20} />
//                     Generate Invoice
//                 </Button>
//             </div>

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
//         </div>
//     );
// };

// export default GenerateInvoice;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCustomers } from "../../redux/actions/customer";
import { getCountry } from "../../redux/actions/country";
import { getZones } from "../../redux/actions/zones";
import { getProductBrand } from "../../redux/actions/productBrand";
import { getProductCategory } from "../../redux/actions/productCategory";
import { getProductSubCategory } from "../../redux/actions/productSubCategory";
import { getProduct } from "../../redux/actions/product";
import { getOrders } from "../../redux/actions/order";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { createInvoice, getInvoices } from "../../redux/actions/invoice";
import { Alert, Box, FormControlLabel, Radio, RadioGroup, Snackbar, TextField, CircularProgress, Autocomplete, Checkbox } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { ArrowLeft, Building2, CalendarDays, FileText, Mail, MapPin, PencilLine, Phone, ReceiptText, Search, Trash, UserRound } from "lucide-react";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { getPrefix } from "../../redux/actions/prefix";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getDefaultTAndCAndDec } from "../../redux/actions/tAndCAndDec";

const GenerateInvoice = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        selectedCompany: "",
        date: "",
        customerPerson: "",
        email: "",
        code: "",
        mobile: "",
        productBrand: "",
        productCategory: "",
        productSubCategory: "",
        product: "",
        hsnCode: "",
        quantity: "1",
        unit: "",
        description: "",
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
        termsAndConditions: "",
    });
    const [invoiceType, setInvoiceType] = useState("order");
    const [orderNo, setOrderNo] = useState("");
    const { customers } = useSelector((state) => state.customer);
    const { country } = useSelector((state) => state.country);
    const { zones } = useSelector((state) => state.zones);
    const { productBrand } = useSelector((state) => state.productBrand);
    const { productCategory } = useSelector((state) => state.productCategory);
    const { productSubCategory } = useSelector((state) => state.productSubCategory);
    const { product } = useSelector((state) => state.product);
    const { orders } = useSelector((state) => state.order);
    const [errors, setErrors] = useState({});
    const [loadedOrderData, setLoadedOrderData] = useState(null);
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.invoice);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [filteredBillingZones, setFilteredBillingZones] = useState([]);
    const [filteredShippingZones, setFilteredShippingZones] = useState([]);
    const [manualCustomerDetails, setManualCustomerDetails] = useState({ email: "", code: "", mobile: "" });
    const [copyShippingSameAsBilling, setCopyShippingSameAsBilling] = useState(false);
    const [filteredPersons, setFilteredPersons] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [selectedCompanyOption, setSelectedCompanyOption] = useState(null);
    const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
    const [businessMode, setBusinessMode] = useState("B2B"); // "B2B" or "B2C"
    const [customerNameOptions, setCustomerNameOptions] = useState([]);
    const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
    const { prefix } = useSelector((state) => state.prefix);
    const { invoices } = useSelector((state) => state.invoice);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(getCustomers()),
                    dispatch(getCountry()),
                    dispatch(getZones()),
                    dispatch(getProductBrand()),
                    dispatch(getProductCategory()),
                    dispatch(getProductSubCategory()),
                    dispatch(getProduct()),
                    dispatch(getOrders()),
                    dispatch(getPrefix()),
                    dispatch(getInvoices()),
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

    const { defaultEntries } = useSelector((state) => state.tAndCAndDec);

    useEffect(() => {
        dispatch(getDefaultTAndCAndDec("invoice_terms"));
    }, [dispatch]);

    useEffect(() => {
        if (defaultEntries?.invoice_terms?.content && !form.termsAndConditions) {
            setForm((prev) => ({
                ...prev,
                termsAndConditions: defaultEntries.invoice_terms.content,
            }));
        }
    }, [defaultEntries]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        setForm((prev) => ({ ...prev, date: formattedDate }));
    }, []);

    useEffect(() => {
        // Remove stored productInvoiceDetails on page reload
        localStorage.removeItem("productInvoiceDetails");
    }, []);

    useEffect(() => {
        if (copyShippingSameAsBilling) {
            setForm((prev) => ({
                ...prev,
                shippingAddress: { ...prev.billingAddress },
            }));
            setFilteredShippingZones([...filteredBillingZones]);
        }
    }, [copyShippingSameAsBilling, form.billingAddress, filteredBillingZones]);

    const [intrastateProducts, setIntrastateProducts] = useState([]);
    const [interstateProducts, setInterstateProducts] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("productInvoiceDetails"));
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
                updatedForm.description = selected?.description || "";
                updatedForm.unit = selected?.unit || "";
                updatedForm.pricePerUnit = selected?.productPrice || "";
                setProductSearch(value || "");
            }

            return updatedForm;
        });

        setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    };

    const clearCustomerData = () => {
        setSelectedCompanyOption(null);
        setAvailableCustomerNames([]);
        setFilteredPersons([]);
        setForm((prev) => ({
            ...prev,
            selectedCompany: "",
            customerPerson: "",
            email: "",
            code: "",
            mobile: "",
            billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
        }));
        setManualCustomerDetails({ email: "", code: "", mobile: "" });
        setFilteredBillingZones([]);
        setFilteredShippingZones([]);
        setCopyShippingSameAsBilling(false);
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

    useEffect(() => {
        if (customers.length > 0) {
            const options = [];
            let optionIdCounter = 0;

            customers.forEach((cust) => {
                const addPerson = (person, isMain = false) => {
                    const fullName = [person.salutation || "", person.firstName || "", person.middleName || "", person.lastName || ""]
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (!fullName) return;

                    options.push({
                        id: optionIdCounter++, // unique id for Autocomplete comparison
                        label: fullName,
                        value: fullName,
                        record: cust, // full customer record
                        contactPerson: isMain ? null : person,
                        isMainContact: isMain,
                        mobile: isMain ? cust.mobile || "" : person.mobile || cust.mobile || "",
                        email: isMain ? cust.email || "" : person.email || cust.email || "",
                    });
                };

                // Main contact
                addPerson(cust, true);

                // Additional contacts
                (cust.contacts || []).forEach((contact) => {
                    addPerson(contact, false);
                });
            });

            options.sort((a, b) => a.label.localeCompare(b.label));
            setCustomerNameOptions(options);
        } else {
            setCustomerNameOptions([]);
        }
    }, [customers]);

    const handleCompanySelect = (newValue) => {
        if (!newValue) {
            // Clear everything
            setSelectedCompanyOption(null);
            setAvailableCustomerNames([]);
            setFilteredPersons([]);
            setForm((prev) => ({
                ...prev,
                selectedCompany: "",
                customerPerson: "",
                email: "",
                code: "",
                mobile: "",
                billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
                shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            }));
            setManualCustomerDetails({ email: "", code: "", mobile: "" });
            setFilteredBillingZones([]);
            setFilteredShippingZones([]);
            return;
        }

        const cust = newValue.fullRecord;
        setSelectedCompanyOption(newValue);
        setForm((prev) => ({ ...prev, selectedCompany: cust.companyName }));

        // Set available customer names
        setAvailableCustomerNames(newValue.contactList);

        // Find country IDs
        const getCountryId = (name) => country.find((c) => c.country === name)?.id || "";
        const billingCountryId = getCountryId(cust.billingCountry);
        const shippingCountryId = getCountryId(cust.shippingCountry);

        // Set zones
        const billingZoneData = zones.find((z) => z.countryId === billingCountryId);
        const shippingZoneData = zones.find((z) => z.countryId === shippingCountryId);
        setFilteredBillingZones(billingZoneData?.zones || []);
        setFilteredShippingZones(shippingZoneData?.zones || []);

        // Set addresses
        setForm((prev) => ({
            ...prev,
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
        }));

        // Auto-select main contact if exists
        if (newValue.contactList.length > 0) {
            const defaultName = newValue.mainContactName || newValue.contactList[0];
            handleCustomerSelect(defaultName, cust); // We'll define this next
        }
    };

    const handleCustomerSelect = (customerName, companyRecord = selectedCompanyOption?.fullRecord) => {
        if (!customerName || !companyRecord) {
            setForm((prev) => ({ ...prev, customerPerson: "", email: "", code: "", mobile: "" }));
            setManualCustomerDetails({ email: "", code: "", mobile: "" });
            return;
        }

        let matchedContact = null;

        // First check main record
        const mainFullName = [
            companyRecord.salutation || "",
            companyRecord.firstName || "",
            companyRecord.middleName || "",
            companyRecord.lastName || "",
        ]
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        if (mainFullName === customerName) {
            matchedContact = companyRecord;
        } else {
            // Search in contacts array
            matchedContact = companyRecord.contacts?.find((contact) => {
                const full = [contact.salutation || "", contact.firstName || "", contact.middleName || "", contact.lastName || ""]
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();
                return full === customerName;
            });
            if (matchedContact) {
                // Use contact's own email/mobile if available, fallback to main
                matchedContact = {
                    ...matchedContact,
                    email: matchedContact.email || companyRecord.email || "",
                    mobile: matchedContact.mobile || companyRecord.mobile || "",
                };
            }
        }

        if (matchedContact) {
            const rawMobile = matchedContact.mobile || "";
            const [code = "", ...mobileParts] = rawMobile.split(" ");
            const mobileNumber = mobileParts.join(" ");

            setForm((prev) => ({
                ...prev,
                customerPerson: customerName,
                email: matchedContact.email || "",
                code,
                mobile: mobileNumber,
            }));

            setManualCustomerDetails({
                email: matchedContact.email || "",
                code,
                mobile: mobileNumber,
            });
        }

        setErrors((prev) => ({ ...prev, customerPerson: false }));
    };

    const orderPrefix = prefix?.orderPrefix || "";
    const orderPrefixLabel = orderPrefix ? `${orderPrefix}-` : "";
    const usedOrderKeys = useMemo(
        () =>
            new Set(
                invoices
                    .flatMap((invoice) => [invoice.orderId && String(invoice.orderId), invoice.orderNo && String(invoice.orderNo)])
                    .filter(Boolean),
            ),
        [invoices],
    );
    const invoiceOrderOptions = useMemo(
        () =>
            orders
                .filter((order) => order.status === "Completed")
                .filter((order) => !usedOrderKeys.has(String(order.id)) && !usedOrderKeys.has(String(order.orderNo)))
                .map((order) => {
                    const displayNo = `${orderPrefixLabel}${order.orderNo || order.id}`;
                    return {
                        ...order,
                        label: displayNo,
                        value: displayNo,
                    };
                }),
        [orders, orderPrefixLabel, usedOrderKeys],
    );

    // // old
    // const handleOrderSearch = () => {
    //     if (!orderNo.trim()) {
    //         setErrors((prev) => ({ ...prev, orderNo: true }));
    //         setLocalSnackbarMessage("Order number is required");
    //         setLocalSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //         return;
    //     }

    //     const fullOrderNo = orderNo.trim().toUpperCase().split("-").pop();

    //     const orderData = orders.find((o) => o.orderNo === fullOrderNo);

    //     if (!orderData) {
    //         setLocalSnackbarMessage("Order not found!");
    //         setLocalSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //         return;
    //     }

    //     // Check if order is Canceled
    //     if (orderData.status === "Canceled" || orderData.status === "cancelled") {
    //         setLocalSnackbarMessage("This order is Canceled. Invoice cannot be generated.");
    //         setLocalSnackbarSeverity("warning");
    //         setSnackbarOpen(true);
    //         setOrderNo(""); // Optional: clear input
    //         return;
    //     }

    //     // Proceed only if order is NOT canceled
    //     const { productOrderDetails } = orderData || {};
    //     const intrastate = productOrderDetails?.intrastate || [];
    //     const interstate = productOrderDetails?.interstate || [];

    //     localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate, interstate }));
    //     setIntrastateProducts(intrastate);
    //     setInterstateProducts(interstate);

    //     // Split mobile into code and number
    //     const rawMobile = orderData.mobile || "";
    //     const [code, ...mobileParts] = rawMobile.split(" ");
    //     const mobileNumber = mobileParts.join(" ");

    //     const selectedBillingCountry = country.find((c) => c.country === orderData.billingAddress?.country);
    //     const selectedShippingCountry = country.find((c) => c.country === orderData.shippingAddress?.country);
    //     const billingZoneData = zones.find((z) => z.countryId === selectedBillingCountry?.id);
    //     const shippingZoneData = zones.find((z) => z.countryId === selectedShippingCountry?.id);

    //     setFilteredBillingZones(billingZoneData?.zones || []);
    //     setFilteredShippingZones(shippingZoneData?.zones || []);

    //     setForm((prevForm) => ({
    //         ...prevForm,
    //         selectedCompany: orderData.selectedCompany || "",
    //         date: prevForm.date || orderData.date || "",
    //         customerPerson: orderData.customerPerson || "",
    //         email: orderData.email || "",
    //         code: code || "",
    //         mobile: mobileNumber || "",
    //         billingAddress: {
    //             street: orderData.billingAddress?.street || "",
    //             city: orderData.billingAddress?.city || "",
    //             state: orderData.billingAddress?.state || "",
    //             pincode: orderData.billingAddress?.pincode || "",
    //             country: selectedBillingCountry?.id || "",
    //             zone: billingZoneData?.zones?.includes(orderData.billingAddress?.zone) ? orderData.billingAddress.zone : "",
    //         },
    //         shippingAddress: {
    //             street: orderData.shippingAddress?.street || "",
    //             city: orderData.shippingAddress?.city || "",
    //             state: orderData.shippingAddress?.state || "",
    //             pincode: orderData.shippingAddress?.pincode || "",
    //             country: selectedShippingCountry?.id || "",
    //             zone: shippingZoneData?.zones?.includes(orderData.shippingAddress?.zone) ? orderData.shippingAddress.zone : "",
    //         },
    //         productCategory: "",
    //         productSubCategory: "",
    //         product: "",
    //         quantity: "",
    //         pricePerUnit: "",
    //     }));

    //     setErrors({});
    //     setLocalSnackbarMessage("Order loaded successfully!");
    //     setLocalSnackbarSeverity("success");
    //     setSnackbarOpen(true);
    // };

    const handleOrderSearch = () => {
        if (!orderNo.trim()) {
            setErrors((prev) => ({ ...prev, orderNo: true }));
            setLocalSnackbarMessage("Order number is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
    
        const fullOrderNo = orderNo.trim().toUpperCase().split("-").pop();
        const orderData = orders.find((o) => o.orderNo === fullOrderNo);
    
        if (!orderData) {
            setLocalSnackbarMessage("Order not found!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
    
        // ✅ Check 1: Only allow if order status is "Completed"
        if (orderData.status !== "Completed") {
            setLocalSnackbarMessage(`This order is ${orderData.status}. Invoice cannot be generated. Only "Completed" orders can generate invoices.`);
            setLocalSnackbarSeverity("warning");
            setSnackbarOpen(true);
            setOrderNo(`${orderPrefix}-`);
            return;
        }
    
        // ✅ Check 2: Check if invoice already exists for this order
        const existingInvoice = invoices.find((inv) => inv.orderId === orderData.id || (inv.orderNo && inv.orderNo === orderData.orderNo));
    
        if (existingInvoice) {
            setLocalSnackbarMessage(`Invoice already generated for this order! You can only edit the existing invoice.`);
            setLocalSnackbarSeverity("warning");
            setSnackbarOpen(true);
            setOrderNo(`${orderPrefix}-`);
            return;
        }
    
        // ✅ STORE THE ORDER DATA IN STATE
        setLoadedOrderData(orderData);
    
        // Proceed with invoice generation
        const { productOrderDetails } = orderData || {};
        const intrastate = productOrderDetails?.intrastate || [];
        const interstate = productOrderDetails?.interstate || [];
    
        localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate, interstate }));
        setIntrastateProducts(intrastate);
        setInterstateProducts(interstate);
    
        // Rest of your existing code...
        const rawMobile = orderData.mobile || "";
        const [code, ...mobileParts] = rawMobile.split(" ");
        const mobileNumber = mobileParts.join(" ");
    
        const selectedBillingCountry = country.find((c) => c.country === orderData.billingAddress?.country);
        const selectedShippingCountry = country.find((c) => c.country === orderData.shippingAddress?.country);
        const billingZoneData = zones.find((z) => z.countryId === selectedBillingCountry?.id);
        const shippingZoneData = zones.find((z) => z.countryId === selectedShippingCountry?.id);
    
        setFilteredBillingZones(billingZoneData?.zones || []);
        setFilteredShippingZones(shippingZoneData?.zones || []);
    
        setForm((prevForm) => ({
            ...prevForm,
            selectedCompany: orderData.selectedCompany || "",
            date: prevForm.date || orderData.date || "",
            customerPerson: orderData.customerPerson || "",
            email: orderData.email || "",
            code: code || "",
            mobile: mobileNumber || "",
            billingAddress: {
                street: orderData.billingAddress?.street || "",
                city: orderData.billingAddress?.city || "",
                state: orderData.billingAddress?.state || "",
                pincode: orderData.billingAddress?.pincode || "",
                country: selectedBillingCountry?.id || "",
                zone: billingZoneData?.zones?.includes(orderData.billingAddress?.zone) ? orderData.billingAddress.zone : "",
            },
            shippingAddress: {
                street: orderData.shippingAddress?.street || "",
                city: orderData.shippingAddress?.city || "",
                state: orderData.shippingAddress?.state || "",
                pincode: orderData.shippingAddress?.pincode || "",
                country: selectedShippingCountry?.id || "",
                zone: shippingZoneData?.zones?.includes(orderData.shippingAddress?.zone) ? orderData.shippingAddress.zone : "",
            },
            productCategory: "",
            productSubCategory: "",
            product: "",
            quantity: "",
            pricePerUnit: "",
        }));
    
        setErrors({});
        setLocalSnackbarMessage("Order loaded successfully!");
        setLocalSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    useEffect(() => {
        setOrderNo(orderPrefixLabel);
    }, [orderPrefixLabel]);

    const handleAddressChange = (type, field) => (e, value) => {
        if (field === "country") {
            const selectedCountry = value;
            const countryId = selectedCountry?.id;

            setForm((prev) => ({
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
            const valueToUse = e?.target?.value || value;
            setForm((prev) => ({
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
            description: form.description,
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
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts];
                updated[editProductDetailsIndex] = newEntry;
                setInterstateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
            }

            setEditProductDetailsIndex(null);
            setEditProductDetailsType("");
        } else {
            // Add logic
            if (form.gstinType === "Intrastate") {
                const updated = [...intrastateProducts, newEntry];
                setIntrastateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts, newEntry];
                setInterstateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
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
            description: "",
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
            description: "",
            pricePerUnit: "",
            purchaseCost: "",
            vendorName: "",
            subTotal: "",
            discount: "",
            total: "",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
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
            description: selectedProduct?.description || item.description || "",
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
            localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
        } else {
            const updated = interstateProducts.filter((_, i) => i !== index);
            setInterstateProducts(updated);
            localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
        }
    };

    const validateFields = () => {
        let tempErrors = {};
        let hasError = false;

        if (!form.customerPerson) {
            tempErrors.customerPerson = true;
            hasError = true;
        }
        if (!form.email || !form.code || !form.mobile) {
            tempErrors.email = !form.email;
            tempErrors.code = !form.code;
            tempErrors.mobile = !form.mobile;
            hasError = true;
        }

        // Only require company name in manual mode AND when B2B is selected
        if (invoiceType === "manual" && businessMode === "B2B" && !form.selectedCompany) {
            tempErrors.selectedCompany = true;
            hasError = true;
        }

        // Address validation...
        const addressFields = ["street", "city", "state", "pincode", "country", "zone"];
        addressFields.forEach((field) => {
            if (!form.billingAddress[field]) {
                tempErrors[`billingAddress.${field}`] = true;
                hasError = true;
            }
            if (!form.shippingAddress[field]) {
                tempErrors[`shippingAddress.${field}`] = true;
                hasError = true;
            }
        });

        setErrors(tempErrors);
        return !hasError;
    };

    // // old
    // const handleSubmit = () => {
    //     // First validate form fields
    //     if (!validateFields()) {
    //         setLocalSnackbarMessage("Please fill all required fields.");
    //         setLocalSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //         return;
    //     }

    //     // ✅ Get productInvoiceDetails from localStorage
    //     const productInvoiceDetails = JSON.parse(localStorage.getItem("productInvoiceDetails")) || {
    //         intrastate: [],
    //         interstate: [],
    //     };

    //     // ✅ Check if at least one product is added
    //     if (productInvoiceDetails.intrastate.length === 0 && productInvoiceDetails.interstate.length === 0) {
    //         setLocalSnackbarMessage("No product added yet, Please do add!");
    //         setLocalSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //         return;
    //     }

    //     // ✅ Format date
    //     const [yyyy, mm, dd] = form.date.split("-");
    //     const formattedDisplayDate = `${dd}-${mm}-${yyyy}`;

    //     // 4️⃣ Helper to convert country id → country name
    //     const getCountryNameById = (id) => {
    //         const match = country.find((c) => c.id === id);
    //         return match?.country || "";
    //     };

    //     // ✅ Create invoice object to match backend
    //     const invoice = {
    //         selectedCompany: form.selectedCompany,
    //         customerPerson: form.customerPerson,
    //         email: form.email,
    //         mobile: `${form.code} ${form.mobile}`.trim(),
    //         date: formattedDisplayDate,
    //         termsAndConditions: form.termsAndConditions,
    //         billingAddress: {
    //             ...form.billingAddress,
    //             country: getCountryNameById(form.billingAddress.country),
    //         },
    //         shippingAddress: {
    //             ...form.shippingAddress,
    //             country: getCountryNameById(form.shippingAddress.country),
    //         },
    //         productInvoiceDetails,
    //         finalAmt: form.finalAmt,
    //     };

    //     // 6️⃣ Dispatch createInvoice action
    //     dispatch(createInvoice(invoice));

    //     // 7️⃣ Reset form after submission
    //     setForm({
    //         selectedCompany: "",
    //         date: "",
    //         customerPerson: "",
    //         email: "",
    //         code: "",
    //         mobile: "",
    //         productBrand: "",
    //         productCategory: "",
    //         productSubCategory: "",
    //         product: "",
    //         hsnCode: "",
    //         quantity: "",
    //         unit: "",
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
    //         billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
    //         shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
    //         termsAndConditions: "",
    //     });

    //     setManualCustomerDetails({ email: "", code: "", mobile: "" });

    //     // ✅ Clear productInvoiceDetails from localStorage
    //     localStorage.removeItem("productInvoiceDetails");

    //     setTimeout(() => {
    //         navigate("/invoice");
    //     }, 1000);
    // };

    const handleSubmit = () => {
        // First validate form fields
        if (!validateFields()) {
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
    
        // ✅ Get productInvoiceDetails from localStorage
        const productInvoiceDetails = JSON.parse(localStorage.getItem("productInvoiceDetails")) || {
            intrastate: [],
            interstate: [],
        };
    
        // ✅ Check if at least one product is added
        if (productInvoiceDetails.intrastate.length === 0 && productInvoiceDetails.interstate.length === 0) {
            setLocalSnackbarMessage("No product added yet, Please do add!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
    
        // ✅ Format date
        const [yyyy, mm, dd] = form.date.split("-");
        const formattedDisplayDate = `${dd}-${mm}-${yyyy}`;
    
        // Helper to convert country id → country name
        const getCountryNameById = (id) => {
            const match = country.find((c) => c.id === id);
            return match?.country || "";
        };
    
        // ✅ Create invoice object to match backend
        const invoice = {
            selectedCompany: form.selectedCompany,
            customerPerson: form.customerPerson,
            email: form.email,
            mobile: `${form.code} ${form.mobile}`.trim(),
            date: formattedDisplayDate,
            termsAndConditions: form.termsAndConditions,
            billingAddress: {
                ...form.billingAddress,
                country: getCountryNameById(form.billingAddress.country),
            },
            shippingAddress: {
                ...form.shippingAddress,
                country: getCountryNameById(form.shippingAddress.country),
            },
            productInvoiceDetails,
            finalAmt: form.finalAmt,
            orderId: loadedOrderData?.id, // ✅ USE THE STORED ORDER DATA
        };
    
        // Dispatch createInvoice action
        dispatch(createInvoice(invoice));
    
        // Reset form after submission
        setForm({
            selectedCompany: "",
            date: "",
            customerPerson: "",
            email: "",
            code: "",
            mobile: "",
            productBrand: "",
            productCategory: "",
            productSubCategory: "",
            product: "",
            hsnCode: "",
            quantity: "",
            unit: "",
            pricePerUnit: "",
            subTotal: "",
            gstinType: "Intrastate",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
            total: "",
            finalAmt: "",
            billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            termsAndConditions: "",
        });
    
        setManualCustomerDetails({ email: "", code: "", mobile: "" });
        setLoadedOrderData(null); // ✅ Clear the stored order data
    
        // Clear productInvoiceDetails from localStorage
        localStorage.removeItem("productInvoiceDetails");
    
        setTimeout(() => {
            navigate("/invoice");
        }, 1000);
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
                        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                    <ReceiptText size={14} />
                                    CRM Invoice
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Generate Invoice</h1>
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Create an invoice from an order, review customer details, confirm billing and shipping address, then generate the invoice.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate(-1)}
                                variant="filled"
                                className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black capitalize text-white shadow-xl shadow-slate-950/10 transition hover:scale-[1.02] hover:bg-white/20"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </Button>
                        </div>
                    </section>

                    {/* search by order for Invoice Generate or manually Invoice Generate */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 md:p-5">
                        <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Search size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-950">Invoice Source</h2>
                                <p className="mt-0.5 text-sm font-semibold text-slate-500">Search an existing order and pull customer details.</p>
                            </div>
                        </div>
                        <RadioGroup
                            value={invoiceType}
                            onChange={(e) => setInvoiceType(e.target.value)}
                        >
                            <div className="grid gap-4 lg:grid-cols-[220px_minmax(280px,360px)_120px_minmax(190px,240px)] lg:items-start">
                                <div className="flex h-10 items-center rounded-2xl bg-slate-50 px-3">
                                    <FormControlLabel
                                        value="order"
                                        control={<Radio size="small" />}
                                        label="Search by Order No"
                                        sx={{ margin: 0, "& .MuiFormControlLabel-label": { fontWeight: 700, color: "#0f172a" } }}
                                    />
                                </div>
                                {invoiceType === "order" && (
                                    <>
                                            {/* <TextField
                                                label="Order Number *"
                                                type="text"
                                                placeholder="Enter number (e.g. 1001)"
                                                size="small"
                                                value={orderNo}
                                                onChange={(e) => {
                                                    let inputValue = e.target.value.toUpperCase();
                                            
                                                    if (inputValue === "" || inputValue === "O") {
                                                        setOrderNo("O-");
                                                        return;
                                                    }
                                            
                                                    if (!inputValue.startsWith("O-")) {
                                                        inputValue = "O-" + inputValue.replace(/[^A-Z0-9-]/g, "");
                                                    } else {
                                                        const afterPrefix = inputValue.slice(2).replace(/[^A-Z0-9-]/g, "");
                                                        inputValue = "O-" + afterPrefix;
                                                    }
                                            
                                                    setOrderNo(inputValue);
                                                }}
                                                onKeyDown={(e) => {
                                                    const cursorPos = e.target.selectionStart;
                                                    if ((e.key === "Backspace" || e.key === "Delete") && cursorPos <= 2) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                error={errors.orderNo}
                                                className="w-56 md:w-72 lg:w-64"
                                                inputProps={{
                                                    style: { textTransform: "uppercase" },
                                                }}
                                            /> */}
                                            <Autocomplete
                                                freeSolo
                                                options={invoiceOrderOptions}
                                                value={invoiceOrderOptions.find((option) => option.value === orderNo) || null}
                                                inputValue={orderNo}
                                                getOptionLabel={(option) => (typeof option === "string" ? option : option.label || "")}
                                                isOptionEqualToValue={(option, value) => option.value === value?.value}
                                                onChange={(event, newValue) => {
                                                    const value = typeof newValue === "string" ? newValue : newValue?.value || orderPrefixLabel;
                                                    setOrderNo(value.toUpperCase());
                                                    setErrors((prev) => ({ ...prev, orderNo: false }));
                                                }}
                                                onInputChange={(event, newInputValue, reason) => {
                                                    if (reason === "reset") return;
                                                    const upperValue = newInputValue.toUpperCase();
                                                    if (!upperValue) {
                                                        setOrderNo(orderPrefixLabel);
                                                        return;
                                                    }
                                                    setOrderNo(upperValue.startsWith(orderPrefixLabel.toUpperCase()) ? upperValue : `${orderPrefixLabel}${upperValue.replace(/[^0-9]/g, "")}`);
                                                    setErrors((prev) => ({ ...prev, orderNo: false }));
                                                }}
                                                renderOption={(props, option) => (
                                                    <li {...props} key={option.id}>
                                                        <div className="flex w-full flex-col">
                                                            <span className="text-sm font-bold text-slate-800">{option.label}</span>
                                                            <span className="truncate text-xs text-slate-500">{option.selectedCompany || option.customerPerson || "Completed order"}</span>
                                                        </div>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Order Number *"
                                                        placeholder={invoiceOrderOptions.length ? "Select order number" : "No completed orders available"}
                                                        size="small"
                                                        error={!!errors.orderNo}
                                                        fullWidth
                                                    />
                                                )}
                                                fullWidth
                                            />
                                            <Button
                                                onClick={handleOrderSearch}
                                                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black capitalize text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-600"
                                            >
                                                <Search size={20} />
                                                Search
                                            </Button>
                                    </>
                                )}
                                <TextField
                                    type="date"
                                    size="small"
                                    label="Date"
                                    value={form.date}
                                    onChange={handleChange("date")}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />

                                {/* <div>
                                    <FormControlLabel
                                        value="manual"
                                        control={<Radio size="small" />}
                                        label="Manually Generate Invoice"
                                    />
                                </div> */}
                            </div>
                        </RadioGroup>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <Building2 size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950">Customer Information</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Company, contact, email and mobile details for the invoice.</p>
                            </div>
                        </div>

                    {invoiceType === "order" ? (
                        <div className="grid w-full gap-4 lg:grid-cols-2">
                            <TextField
                                label="Company Name"
                                fullWidth
                                value={form.selectedCompany}
                                onChange={handleChange("selectedCompany")}
                                size="small"
                            />
                            <TextField
                                label="Customer Name *"
                                fullWidth
                                value={form.customerPerson}
                                error={!!errors.customerPerson}
                                onChange={handleChange("customerPerson")}
                                size="small"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center gap-12">
                                <FormControlLabel
                                    control={
                                        <Radio
                                            size="small"
                                            checked={businessMode === "B2B"}
                                            onChange={(e) => {
                                                setBusinessMode(e.target.value);
                                                clearCustomerData();
                                            }}
                                            value="B2B"
                                        />
                                    }
                                    label="B2B (Business to Business)"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            size="small"
                                            checked={businessMode === "B2C"}
                                            onChange={(e) => {
                                                setBusinessMode(e.target.value);
                                                clearCustomerData();
                                            }}
                                            value="B2C"
                                        />
                                    }
                                    label="B2C (Business to Consumer)"
                                />
                            </div>
                            {/* Customer / Company Fields */}
                            <div className="flex w-full flex-col gap-6 lg:flex-row">
                                {businessMode === "B2B" ? (
                                    <>
                                        <Autocomplete
                                            disablePortal
                                            options={companyOptions}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                            value={selectedCompanyOption || null}
                                            onChange={(e, newValue) => {
                                                handleCompanySelect(newValue);
                                                setErrors((prev) => ({ ...prev, selectedCompany: false }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Company Name *"
                                                    size="small"
                                                    error={!!errors.selectedCompany}
                                                    fullWidth
                                                    placeholder="Search company..."
                                                />
                                            )}
                                            className="flex-1"
                                        />
                                        <Autocomplete
                                            disablePortal
                                            options={availableCustomerNames}
                                            value={form.customerPerson || ""}
                                            onChange={(e, newValue) => {
                                                handleCustomerSelect(newValue);
                                            }}
                                            disabled={availableCustomerNames.length === 0}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Customer Name *"
                                                    size="small"
                                                    error={!!errors.customerPerson}
                                                    fullWidth
                                                    placeholder={availableCustomerNames.length === 0 ? "First select company" : "Select contact"}
                                                />
                                            )}
                                            className="flex-1"
                                        />
                                    </>
                                ) : (
                                    <>
                                        {/* B2C: Search by Customer Name */}
                                        {/* <Autocomplete
                                            disablePortal
                                            options={allCustomerNames}
                                            value={form.customerPerson || ""}
                                            onChange={(e, newValue) => {
                                                if (newValue) {
                                                    // Find matching customer record
                                                    let matchedCust = null;
                                                    let matchedContact = null;
                                                    let isMain = false;

                                                    for (const cust of customers) {
                                                        const mainFull = [
                                                            cust.salutation || "",
                                                            cust.firstName || "",
                                                            cust.middleName || "",
                                                            cust.lastName || "",
                                                        ]
                                                            .join(" ")
                                                            .replace(/\s+/g, " ")
                                                            .trim();
                                                        if (mainFull === newValue) {
                                                            matchedCust = cust;
                                                            isMain = true;
                                                            break;
                                                        }
                                                        matchedContact = cust.contacts?.find((c) => {
                                                            const full = [c.salutation || "", c.firstName || "", c.middleName || "", c.lastName || ""]
                                                                .join(" ")
                                                                .replace(/\s+/g, " ")
                                                                .trim();
                                                            return full === newValue;
                                                        });
                                                        if (matchedContact) {
                                                            matchedCust = cust;
                                                            break;
                                                        }
                                                    }

                                                    if (matchedCust) {
                                                        const getCountryId = (name) => country.find((c) => c.country === name)?.id || "";
                                                        const billingCountryId = getCountryId(matchedCust.billingCountry);
                                                        const shippingCountryId = getCountryId(matchedCust.shippingCountry);
                                                        const billingZones = zones.find((z) => z.countryId === billingCountryId)?.zones || [];
                                                        const shippingZones = zones.find((z) => z.countryId === shippingCountryId)?.zones || [];

                                                        setFilteredBillingZones(billingZones);
                                                        setFilteredShippingZones(shippingZones);

                                                        setForm((prev) => ({
                                                            ...prev,
                                                            customerPerson: newValue,
                                                            selectedCompany: matchedCust.companyName || "", // optional, pre-fill
                                                            billingAddress: {
                                                                street: matchedCust.billingStreet || "",
                                                                city: matchedCust.billingCity || "",
                                                                state: matchedCust.billingState || "",
                                                                pincode: matchedCust.billingPincode || "",
                                                                country: billingCountryId,
                                                                zone: matchedCust.billingZone || "",
                                                            },
                                                            shippingAddress: {
                                                                street: matchedCust.shippingStreet || "",
                                                                city: matchedCust.shippingState || "",
                                                                state: matchedCust.shippingState || "",
                                                                pincode: matchedCust.shippingPincode || "",
                                                                country: shippingCountryId,
                                                                zone: matchedCust.shippingZone || "",
                                                            },
                                                        }));

                                                        const mobileSource = matchedContact?.mobile || matchedCust.mobile || "";
                                                        const emailSource = matchedContact?.email || matchedCust.email || "";
                                                        const [code = "", ...mobileParts] = mobileSource.split(" ");
                                                        const mobileNumber = mobileParts.join(" ");

                                                        setForm((prev) => ({
                                                            ...prev,
                                                            email: emailSource,
                                                            code,
                                                            mobile: mobileNumber,
                                                        }));
                                                        setManualCustomerDetails({ email: emailSource, code, mobile: mobileNumber });
                                                    }
                                                } else {
                                                    clearCustomerData();
                                                    setForm((prev) => ({ ...prev, customerPerson: "" }));
                                                }
                                                setErrors((prev) => ({ ...prev, customerPerson: false }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Customer Name *"
                                                    size="small"
                                                    error={!!errors.customerPerson}
                                                    fullWidth
                                                    placeholder="Search customer name..."
                                                />
                                            )}
                                            className="flex-1"
                                        /> */}
                                        {/* Optional Company Name in B2C */}
                                        {/* <TextField
                                            label="Company Name"
                                            value={form.selectedCompany}
                                            onChange={handleChange("selectedCompany")}
                                            size="small"
                                            fullWidth
                                            className="flex-1"
                                        /> */}
                                        {/* B2C: Search by Customer Name */}
                                        <Autocomplete
                                            disablePortal
                                            options={customerNameOptions}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                            value={selectedCustomerOption || null}
                                            onChange={(e, newValue) => {
                                                if (newValue) {
                                                    setSelectedCustomerOption(newValue);
                                                    const cust = newValue.record;
                                                    const isMain = newValue.isMainContact;
                                                    const contactPerson = newValue.contactPerson;

                                                    // Set customer name
                                                    setForm((prev) => ({ ...prev, customerPerson: newValue.label }));

                                                    // Mobile & Email (prefer contact-specific, fallback to main)
                                                    const mobileSource = contactPerson?.mobile || cust.mobile || newValue.mobile || "";
                                                    const emailSource = contactPerson?.email || cust.email || newValue.email || "";
                                                    const [code = "", ...mobileParts] = mobileSource.split(" ");
                                                    const mobileNumber = mobileParts.join(" ");

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        email: emailSource,
                                                        code,
                                                        mobile: mobileNumber,
                                                    }));
                                                    setManualCustomerDetails({ email: emailSource, code, mobile: mobileNumber });

                                                    // Addresses & Zones
                                                    const getCountryId = (name) => country.find((c) => c.country === name)?.id || "";
                                                    const billingCountryId = getCountryId(cust.billingCountry);
                                                    const shippingCountryId = getCountryId(cust.shippingCountry);

                                                    const billingZones = zones.find((z) => z.countryId === billingCountryId)?.zones || [];
                                                    const shippingZones = zones.find((z) => z.countryId === shippingCountryId)?.zones || [];

                                                    setFilteredBillingZones(billingZones);
                                                    setFilteredShippingZones(shippingZones);

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        selectedCompany: cust.companyName || "", // pre-fill, still editable
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
                                                    }));
                                                } else {
                                                    // Cleared selection
                                                    setSelectedCustomerOption(null);
                                                    clearCustomerData();
                                                    setForm((prev) => ({ ...prev, customerPerson: "" }));
                                                }
                                                setErrors((prev) => ({ ...prev, customerPerson: false }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Customer Name *"
                                                    size="small"
                                                    error={!!errors.customerPerson}
                                                    fullWidth
                                                    placeholder="Search customer name..."
                                                />
                                            )}
                                            className="flex-1"
                                        />

                                        {/* B2C: Company Name (optional, editable) */}
                                        <TextField
                                            label="Company Name"
                                            value={form.selectedCompany}
                                            onChange={handleChange("selectedCompany")}
                                            size="small"
                                            fullWidth
                                            className="flex-1"
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    <div className="mt-4 grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)]">
                        <Box className="min-w-0">
                            <TextField
                                label="Email *"
                                fullWidth
                                value={form.email}
                                error={!!errors.email}
                                onChange={handleChange("email")}
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                        <Box className="min-w-0">
                            <TextField
                                label="Code *"
                                fullWidth
                                value={form.code}
                                error={!!errors.code}
                                onChange={handleChange("code")}
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                        <Box className="min-w-0">
                            <TextField
                                label="Mobile *"
                                fullWidth
                                value={form.mobile}
                                error={!!errors.mobile}
                                onChange={handleChange("mobile")}
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                    </div>
                    </section>

                    {/* Product Details */}
                    {/* <div className="space-y-4">
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
                                value={form.description}
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
                    </div> */}

                    {/* Address Info */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950">Billing & Shipping Address</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Confirm address information before generating the invoice.</p>
                            </div>
                        </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        {/* Billing Address */}
                        <div className="w-full space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="-mb-1 flex items-center gap-2 font-black text-slate-800">
                                <MapPin size={17} className="text-blue-600" />
                                Billing Address
                            </p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.street}
                                    onChange={handleAddressChange("billingAddress", "street")}
                                    error={!!errors["billingAddress.street"]}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.city}
                                    onChange={handleAddressChange("billingAddress", "city")}
                                    error={!!errors["billingAddress.city"]}
                                />
                                <TextField
                                    label="State *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.state}
                                    onChange={handleAddressChange("billingAddress", "state")}
                                    error={!!errors["billingAddress.state"]}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.pincode}
                                    onChange={handleAddressChange("billingAddress", "pincode")}
                                    error={!!errors["billingAddress.pincode"]}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option?.country || ""}
                                    value={country.find((c) => c.id === form.billingAddress.country) || null}
                                    onChange={handleAddressChange("billingAddress", "country")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country *"
                                            size="small"
                                            error={!!errors["billingAddress.country"]}
                                        />
                                    )}
                                    fullWidth
                                />

                                <Autocomplete
                                    options={filteredBillingZones}
                                    getOptionLabel={(option) => option || ""}
                                    value={form.billingAddress.zone || null}
                                    onChange={(e, value) => handleAddressChange("billingAddress", "zone")({ target: { value } })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Zone *"
                                            size="small"
                                            error={!!errors["billingAddress.zone"]}
                                        />
                                    )}
                                    fullWidth
                                />
                            </Box>
                        </div>

                        {/* Shipping Address */}
                        <div className="w-full space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="-mb-1 flex items-center gap-2 font-black text-slate-800">
                                <MapPin size={17} className="text-emerald-600" />
                                Shipping Address
                            </p>

                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.street}
                                    onChange={handleAddressChange("shippingAddress", "street")}
                                    error={!!errors["shippingAddress.street"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.city}
                                    onChange={handleAddressChange("shippingAddress", "city")}
                                    error={!!errors["shippingAddress.city"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                                <TextField
                                    label="State *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.state}
                                    onChange={handleAddressChange("shippingAddress", "state")}
                                    error={!!errors["shippingAddress.state"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.pincode}
                                    onChange={handleAddressChange("shippingAddress", "pincode")}
                                    error={!!errors["shippingAddress.pincode"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option?.country || ""}
                                    value={country.find((c) => c.id === form.shippingAddress.country) || null}
                                    onChange={handleAddressChange("shippingAddress", "country")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country *"
                                            size="small"
                                            error={!!errors["shippingAddress.country"]}
                                        />
                                    )}
                                    fullWidth
                                    disabled={copyShippingSameAsBilling}
                                />
                                <Autocomplete
                                    options={filteredShippingZones}
                                    getOptionLabel={(option) => option || ""}
                                    value={form.shippingAddress.zone || null}
                                    onChange={(e, value) => handleAddressChange("shippingAddress", "zone")({ target: { value } })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Zone *"
                                            size="small"
                                            error={!!errors["shippingAddress.zone"]}
                                        />
                                    )}
                                    fullWidth
                                    disabled={copyShippingSameAsBilling}
                                />
                            </Box>
                        </div>
                    </div>

                    {/* Checkbox to copy billing address */}
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
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

                    {/* Terms And Conditions */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950">Terms and Conditions</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Add invoice terms, payment conditions or delivery notes.</p>
                            </div>
                        </div>
                        <ReactQuill
                            value={form.termsAndConditions}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, termsAndConditions: value }));
                            }}
                            theme="snow"
                            placeholder="Enter invoice terms and conditions..."
                            className="rounded-2xl bg-white"
                        />
                    </section>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-black text-slate-900">Ready to generate invoice?</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">Review customer and address details before submitting.</p>
                        </div>
                        {/* <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <LiaFileInvoiceSolid size={20} />
                            Generate Invoice
                        </Button> */}
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            disabled={isSubmittingSuccessfully || initialLoad} // optional: also disable if globally loading
                            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black capitalize text-white shadow-lg shadow-slate-300 md:text-base ${isSubmittingSuccessfully ? "cursor-not-allowed bg-[#053054]/70 opacity-70" : "bg-[#053054] hover:-translate-y-0.5 hover:bg-[#053054]/90"} transition-all`}
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
                                    <LiaFileInvoiceSolid size={20} />
                                    Generate Invoice
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

export default GenerateInvoice;
