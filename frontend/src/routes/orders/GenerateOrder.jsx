// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Alert, Box, FormControlLabel, MenuItem, Radio, RadioGroup, Snackbar, TextField } from "@mui/material";
// import { Button } from "@material-tailwind/react";
// import { Search, PencilLine, Trash } from "lucide-react";
// import { FaJediOrder } from "react-icons/fa6";

// const GenerateOrder = () => {
//     const navigate = useNavigate();
//     const [orderType, setOrderType] = useState("quotation");
//     const [quotationNo, setQuotationNo] = useState("");
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
//         // Remove stored productOrderDetails on page reload
//         localStorage.removeItem("productOrderDetails");
//     }, []);

//     useEffect(() => {
//         const storedCustomers = JSON.parse(localStorage.getItem("customer")) || [];
//         setCustomers(storedCustomers);
//         console.log(storedCustomers);
//     }, []);

//     const filteredCompany = customers.find((comp) => comp.companyName === form.selectedCompany);
//     const filteredCustomers = filteredCompany ? filteredCompany.customers : [];

//     const handleQuotationSearch = () => {
//         if (!quotationNo.trim()) {
//             setErrors((prev) => ({ ...prev, quotationNo: true }));
//             setSnackbarMessage("Quotation number is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const quotations = JSON.parse(localStorage.getItem("quotation")) || [];
//         const quotationIndex = parseInt(quotationNo, 10) - 1;

//         if (!isNaN(quotationIndex) && quotationIndex >= 0 && quotationIndex < quotations.length) {
//             const quotationData = quotations[quotationIndex];

//             // Extract productQuotationDetails
//             const { productQuotationDetails } = quotationData || {};
//             const intrastate = productQuotationDetails?.intrastate || [];
//             const interstate = productQuotationDetails?.interstate || [];

//             // ✅ Save product details to localStorage for order submission
//             localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate, interstate }));

//             // Update the state
//             setIntrastateProducts(intrastate);
//             setInterstateProducts(interstate);

//             setForm((prevForm) => ({
//                 ...prevForm,
//                 selectedCompany: quotationData.selectedCompany || "",
//                 date: prevForm.date || quotationData.date || "",
//                 companyName: prevForm.companyName || "",
//                 customerPerson: quotationData.customerPerson || "",
//                 email: quotationData.email || "",
//                 mobile: quotationData.mobile || "",
//                 billingAddress: {
//                     ...prevForm.billingAddress,
//                     ...quotationData.billingAddress,
//                 },
//                 shippingAddress: {
//                     ...prevForm.shippingAddress,
//                     ...quotationData.shippingAddress,
//                 },
//                 productCategory: "", // Reset if needed
//                 product: "", // Reset if needed
//                 quantity: "", // Reset if needed
//                 pricePerUnit: "", // Reset if needed
//             }));

//             setErrors({});
//         } else {
//             setSnackbarMessage("Quotation not found!");
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
//         const saved = JSON.parse(localStorage.getItem("productOrderDetails"));
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
//                 "productOrderDetails",
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
//                 "productOrderDetails",
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

//     const handlePlacedOrder = () => {
//         // First validate form fields
//         if (!validateFields()) {
//             setSnackbarMessage("Please fill all required fields.");
//             setSnackbarOpen(true);
//             return;
//         }

//         // ✅ Get productOrderDetails from localStorage
//         const productOrderDetails = JSON.parse(localStorage.getItem("productOrderDetails")) || {
//             intrastate: [],
//             interstate: [],
//         };

//         // ✅ Check if at least one product is added
//         if (productOrderDetails.intrastate.length === 0 && productOrderDetails.interstate.length === 0) {
//             setSnackbarMessage("No product added yet, Please do add!");
//             setSnackbarOpen(true);
//             return;
//         }

//         // ✅ Format date
//         const [yyyy, mm, dd] = form.date.split("-");
//         const formattedDisplayDate = `${dd}-${mm}-${yyyy}`;

//         // ✅ Create order object with the structured data you want to log
//         const order = {
//             billingAddress: form.billingAddress,
//             customerPerson: form.customerPerson,
//             date: formattedDisplayDate,
//             email: form.email,
//             finalAmt: form.finalAmt,
//             mobile: form.mobile,
//             orderDate: new Date().toISOString(),
//             productOrderDetails,
//             selectedCompany: form.selectedCompany,
//             shippingAddress: form.shippingAddress,
//         };

//         // ✅ Save to localStorage
//         const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
//         existingOrders.push(order);
//         localStorage.setItem("orders", JSON.stringify(existingOrders));

//         // ✅ Clear productOrderDetails from localStorage
//         localStorage.removeItem("productOrderDetails");

//         // ✅ Log the order object for confirmation
//         console.log("Order Placed:", order);

//         setSnackbarMessage("Order placed successfully!");
//         setSnackbarOpen(true);

//         setTimeout(() => {
//             navigate("/orders");
//         }, 500);
//     };

//     return (
//         <div className="card space-y-1">
//             <div className="flex items-center justify-between text-nowrap">
//                 <div className="text-base font-semibold text-[#433C50] md:text-lg">Generate Order :</div>
//                 <Button
//                     onClick={() => navigate(-1)}
//                     variant="gradient"
//                     className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                 >
//                     Back
//                 </Button>
//             </div>
//             {/* search by quotation for placed order or manually placed order */}
//             <div>
//                 <RadioGroup
//                     value={orderType}
//                     onChange={(e) => setOrderType(e.target.value)}
//                 >
//                     <div className="flex-none gap-0 space-y-3 md:flex-none md:gap-0 md:space-y-3 lg:flex lg:gap-20 lg:space-y-0">
//                         <div className="flex-none items-center gap-2 space-y-1 md:flex-none md:space-y-1 lg:flex lg:space-y-0">
//                             <FormControlLabel
//                                 value="quotation"
//                                 control={<Radio size="small" />}
//                                 label="Search by Quotation No :"
//                             />
//                             {orderType === "quotation" && (
//                                 <div className="flex gap-5">
//                                     <TextField
//                                         label="Quotation Number *"
//                                         type="number"
//                                         placeholder="Enter Quotation Number"
//                                         size="small"
//                                         value={quotationNo}
//                                         onChange={(e) => {
//                                             const value = e.target.value;
//                                             if (value === "" || /^[0-9]*$/.test(value)) {
//                                                 setQuotationNo(value);
//                                                 setErrors((prev) => ({ ...prev, quotationNo: false }));
//                                             }
//                                         }}
//                                         onWheel={(e) => e.target.blur()}
//                                         inputProps={{
//                                             min: 0,
//                                             onKeyDown: (e) => {
//                                                 if (e.key === "-" || e.key === "e") e.preventDefault();
//                                             },
//                                         }}
//                                         error={errors.quotationNo}
//                                         className="w-56 md:w-72 lg:w-64"
//                                     />
//                                     <Button
//                                         onClick={handleQuotationSearch}
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
//                                 label="Manually Placed Order"
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

//             {orderType === "quotation" ? (
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

//                                             <td className="border border-gray-300  px-2 py-1">{item.total}</td>
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
//                                                                 "productOrderDetails",
//                                                                 JSON.stringify({ intrastate: updated, interstate: interstateProducts }),
//                                                             );
//                                                         } else {
//                                                             const updated = interstateProducts.filter((_, i) => i !== index);
//                                                             setInterstateProducts(updated);
//                                                             localStorage.setItem(
//                                                                 "productOrderDetails",
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
//                     onClick={handlePlacedOrder}
//                     variant="gradient"
//                     className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                 >
//                     <FaJediOrder size={20} />
//                     Placed Order
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

// export default GenerateOrder;

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
import { getQuotations } from "../../redux/actions/quotation";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { createOrder } from "../../redux/actions/order";
import { Alert, Box, FormControlLabel, Radio, RadioGroup, Snackbar, TextField, CircularProgress, Autocomplete, Checkbox } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { ArrowLeft, Building2, CalendarDays, CreditCard, FileText, MapPin, PencilLine, ReceiptText, Search, Trash } from "lucide-react";
import { FaJediOrder } from "react-icons/fa6";
import { getPrefix } from "../../redux/actions/prefix";

const GenerateOrder = () => {
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
    });
    const [orderType, setOrderType] = useState("quotation");
    const [quotationNo, setQuotationNo] = useState("");
    const { customers } = useSelector((state) => state.customer);
    const { country } = useSelector((state) => state.country);
    const { zones } = useSelector((state) => state.zones);
    const { productBrand } = useSelector((state) => state.productBrand);
    const { productCategory } = useSelector((state) => state.productCategory);
    const { productSubCategory } = useSelector((state) => state.productSubCategory);
    const { product } = useSelector((state) => state.product);
    const { quotations } = useSelector((state) => state.quotation);
    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.order);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [filteredBillingZones, setFilteredBillingZones] = useState([]);
    const [filteredShippingZones, setFilteredShippingZones] = useState([]);
    const [manualCustomerDetails, setManualCustomerDetails] = useState({ email: "", code: "", mobile: "" });
    const [copyShippingSameAsBilling, setCopyShippingSameAsBilling] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [filteredPersons, setFilteredPersons] = useState([]);
    const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [selectedCompanyOption, setSelectedCompanyOption] = useState(null);
    const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
    const [businessMode, setBusinessMode] = useState("B2B"); // "B2B" or "B2C"
    const [customerNameOptions, setCustomerNameOptions] = useState([]);
    const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
    const { prefix } = useSelector((state) => state.prefix);

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
                    dispatch(getQuotations()),
                    dispatch(getPrefix()),
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

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        setForm((prev) => ({ ...prev, date: formattedDate }));
    }, []);

    useEffect(() => {
        // Remove stored productOrderDetails on page reload
        localStorage.removeItem("productOrderDetails");
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
        const saved = JSON.parse(localStorage.getItem("productOrderDetails"));
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
            setForm((prev) => ({ ...prev, subTotal: subTotal }));
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
                cgstAmt: cgstAmt,
                sgstAmt: sgstAmt,
                total: discountedTotal,
            }));
        } else if (form.gstinType === "Interstate") {
            const igstAmt = (subTotal * igst) / 100;
            totalBeforeDiscount = subTotal + igstAmt;
            const discountedTotal = discount ? totalBeforeDiscount - (totalBeforeDiscount * discount) / 100 : totalBeforeDiscount;
            setForm((prev) => ({
                ...prev,
                igstAmt: igstAmt,
                total: discountedTotal,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                cgstAmt: "",
                sgstAmt: "",
                igstAmt: "",
                total: subTotal,
            }));
        }
    }, [form.subTotal, form.cgst, form.sgst, form.igst, form.gstinType, form.discount]);

    useEffect(() => {
        const totalIntrastate = intrastateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        const totalInterstate = interstateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        const finalAmt = totalIntrastate + totalInterstate;

        setForm((prev) => ({
            ...prev,
            finalAmt: finalAmt,
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

    const quotationPrefix = prefix?.quotationPrefix || "";
    const quotationPrefixLabel = quotationPrefix ? `${quotationPrefix}-` : "";
    const quotationOptions = useMemo(
        () =>
            quotations.map((quotation) => {
                const displayNo = `${quotationPrefixLabel}${quotation.quotationNo || quotation.id}`;
                return {
                    ...quotation,
                    label: displayNo,
                    value: displayNo,
                };
            }),
        [quotations, quotationPrefixLabel],
    );

    const handleQuotationSearch = () => {
        if (!quotationNo.trim()) {
            setErrors((prev) => ({ ...prev, quotationNo: true }));
            setLocalSnackbarMessage("Quotation number is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const fullQuotationNo = quotationNo.trim().toUpperCase().split("-").pop();

        const quotationData = quotations.find((q) => q.quotationNo === fullQuotationNo);

        if (quotationData) {
            const { productQuotationDetails } = quotationData;
            const intrastate = productQuotationDetails?.intrastate || [];
            const interstate = productQuotationDetails?.interstate || [];

            localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate, interstate }));

            setIntrastateProducts(intrastate);
            setInterstateProducts(interstate);

            // ✅ Split mobile into code and number
            const rawMobile = quotationData.mobile || "";
            const [code, ...mobileParts] = rawMobile.split(" ");
            const mobileNumber = mobileParts.join(" ");

            const selectedBillingCountry = country.find((c) => c.country === quotationData.billingAddress?.country);
            const selectedShippingCountry = country.find((c) => c.country === quotationData.shippingAddress?.country);

            const billingZoneData = zones.find((z) => z.countryId === selectedBillingCountry?.id);
            const shippingZoneData = zones.find((z) => z.countryId === selectedShippingCountry?.id);

            setFilteredBillingZones(billingZoneData?.zones || []);
            setFilteredShippingZones(shippingZoneData?.zones || []);

            setForm((prevForm) => ({
                ...prevForm,
                selectedCompany: quotationData.companyName || "",
                date: prevForm.date || quotationData.date || "",
                customerPerson: quotationData.customerPerson || "",
                email: quotationData.email || "",
                code: code || "",
                mobile: mobileNumber || "",
                billingAddress: {
                    street: quotationData.billingAddress?.street || "",
                    city: quotationData.billingAddress?.city || "",
                    state: quotationData.billingAddress?.state || "",
                    pincode: quotationData.billingAddress?.pincode || "",
                    country: selectedBillingCountry?.id || "",
                    zone: billingZoneData?.zones?.includes(quotationData.billingAddress?.zone) ? quotationData.billingAddress.zone : "",
                },
                shippingAddress: {
                    street: quotationData.shippingAddress?.street || "",
                    city: quotationData.shippingAddress?.city || "",
                    state: quotationData.shippingAddress?.state || "",
                    pincode: quotationData.shippingAddress?.pincode || "",
                    country: selectedShippingCountry?.id || "",
                    zone: shippingZoneData?.zones?.includes(quotationData.shippingAddress?.zone) ? quotationData.shippingAddress.zone : "",
                },
                productCategory: "",
                productSubCategory: "",
                product: "",
                quantity: "",
                pricePerUnit: "",
            }));

            setErrors({});
        } else {
            setLocalSnackbarMessage("Quotation not found!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        setQuotationNo(quotationPrefixLabel);
    }, [quotationPrefixLabel]);

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
                localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts];
                updated[editProductDetailsIndex] = newEntry;
                setInterstateProducts(updated);
                localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
            }

            setEditProductDetailsIndex(null);
            setEditProductDetailsType("");
        } else {
            // Add logic
            if (form.gstinType === "Intrastate") {
                const updated = [...intrastateProducts, newEntry];
                setIntrastateProducts(updated);
                localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts, newEntry];
                setInterstateProducts(updated);
                localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
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
            localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
        } else {
            const updated = interstateProducts.filter((_, i) => i !== index);
            setInterstateProducts(updated);
            localStorage.setItem("productOrderDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
        }
    };

    // PAYMENT SCHEDULE STATES
    const [paymentSchedules, setPaymentSchedules] = useState([]);
    const [editPaymentIndex, setEditPaymentIndex] = useState(null);

    // PAYMENT SCHEDULE HANDLERS
    const validatePaymentFields = () => {
        let tempErrors = {};
        let hasError = false;

        if (!form.dueDate) {
            tempErrors.dueDate = true;
            hasError = true;
        }
        if (!form.percentage) {
            tempErrors.percentage = true;
            hasError = true;
        }
        if (!form.amount) {
            tempErrors.amount = true;
            hasError = true;
        }

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSavePaymentSchedule = () => {
        // Calculate remaining percentage
        const currentTotal = paymentSchedules.reduce((sum, item, idx) => {
            if (editPaymentIndex !== null && idx === editPaymentIndex) return sum; // exclude editing item
            return sum + parseFloat(item.percentage || 0);
        }, 0);

        const remainingPercentage = 100 - currentTotal;
        const enteredPercentage = parseFloat(form.percentage || 0);

        if (enteredPercentage > remainingPercentage) {
            setLocalSnackbarMessage(`Only ${remainingPercentage}% remaining in schedule, please enter a valid percentage.`);
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!validatePaymentFields()) return;

        // ✅ Format dueDate as dd-mm-yyyy before saving
        let formattedDueDate = "";
        if (form.dueDate) {
            const [yyyy, mm, dd] = form.dueDate.split("-");
            formattedDueDate = `${dd}-${mm}-${yyyy}`;
        }

        const newEntry = {
            dueDate: formattedDueDate, // ✅ Send as dd-mm-yyyy
            percentage: form.percentage,
            amount: form.amount,
            narration: form.narration,
        };

        if (editPaymentIndex !== null) {
            const updated = [...paymentSchedules];
            updated[editPaymentIndex] = newEntry;
            setPaymentSchedules(updated);
            setEditPaymentIndex(null);
        } else {
            setPaymentSchedules((prev) => [...prev, newEntry]);
        }

        // Reset fields
        setForm((prev) => ({
            ...prev,
            dueDate: "",
            percentage: "",
            amount: "",
            narration: "",
        }));
    };

    const handleEditPaymentSchedule = (index) => {
        const item = paymentSchedules[index];
        setEditPaymentIndex(index);
        setForm((prev) => ({
            ...prev,
            dueDate: item.dueDate,
            percentage: item.percentage,
            amount: item.amount,
            narration: item.narration,
        }));
    };

    const handleDeletePaymentSchedule = (index) => {
        const updated = paymentSchedules.filter((_, i) => i !== index);
        setPaymentSchedules(updated);
    };

    const handleResetPaymentSchedule = () => {
        setForm((prev) => ({
            ...prev,
            dueDate: "",
            percentage: "",
            amount: "",
            narration: "",
        }));
        setEditPaymentIndex(null);
    };

    useEffect(() => {
        localStorage.setItem("paymentSchedules", JSON.stringify(paymentSchedules));
    }, [paymentSchedules]);

    useEffect(() => {
        const savedPayments = JSON.parse(localStorage.getItem("paymentSchedules"));
        if (savedPayments) setPaymentSchedules(savedPayments);
    }, []);

    useEffect(() => {
        if (form.percentage && form.finalAmt) {
            const amount = (parseFloat(form.finalAmt) * parseFloat(form.percentage)) / 100;
            setForm((prev) => ({ ...prev, amount: amount }));
        }
    }, [form.percentage, form.finalAmt]);

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
        if (orderType === "manual" && businessMode === "B2B" && !form.selectedCompany) {
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

    const handlePlacedOrder = () => {
        // 1️⃣ Validate form fields
        if (!validateFields()) {
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // 2️⃣ Get productOrderDetails from localStorage
        const productOrderDetails = JSON.parse(localStorage.getItem("productOrderDetails")) || {
            intrastate: [],
            interstate: [],
        };
        if (productOrderDetails.intrastate.length === 0 && productOrderDetails.interstate.length === 0) {
            setLocalSnackbarMessage("No product added yet, Please do add!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // 3️⃣ Get paymentSchedules from localStorage
        const paymentSchedules = JSON.parse(localStorage.getItem("paymentSchedules")) || [];
        if (paymentSchedules.length === 0) {
            setLocalSnackbarMessage("Please schedule full payment for the final amount.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const totalPercentage = paymentSchedules.reduce((sum, item) => sum + parseFloat(item.percentage || 0), 0);
        const totalAmount = paymentSchedules.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        const finalAmt = parseFloat(form.finalAmt || 0);

        if (totalPercentage !== 100) {
            setLocalSnackbarMessage(`Please complete the payment schedule to cover 100%. Currently it's ${totalPercentage}%`);
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        if (Math.abs(totalAmount - finalAmt) > 0.01) {
            setLocalSnackbarMessage(`Scheduled total amount (${totalAmount}) does not match final amount (${finalAmt}).`);
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const [yyyy, mm, dd] = form.date.split("-");
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        const getCountryNameById = (id) => {
            const match = country.find((c) => c.id === id);
            return match?.country || "";
        };

        // ✅ Send paymentSchedules array directly
        const orderData = {
            selectedCompany: form.selectedCompany,
            customerPerson: form.customerPerson,
            email: form.email,
            mobile: `${form.code} ${form.mobile}`.trim(),
            date: formattedDate,
            billingAddress: { ...form.billingAddress, country: getCountryNameById(form.billingAddress.country) },
            shippingAddress: { ...form.shippingAddress, country: getCountryNameById(form.shippingAddress.country) },
            productOrderDetails,
            orderPaymentDetails: paymentSchedules,
            finalAmt: form.finalAmt,
        };

        dispatch(createOrder(orderData));

        // Reset after submission
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
        });
        setManualCustomerDetails({ email: "", code: "", mobile: "" });
        localStorage.removeItem("productOrderDetails");
        localStorage.removeItem("paymentSchedules");

        setTimeout(() => navigate("/orders"), 1000);
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
                                    CRM Orders
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Generate Order</h1>
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Create an order from a quotation or manually, add product details, schedule payments, and confirm customer addresses.
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

                    {/* search by quotation for placed order or manually placed order */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 md:p-5">
                        <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Search size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-950">Order Source</h2>
                                <p className="mt-0.5 text-sm font-semibold text-slate-500">Search an existing quotation or place the order manually.</p>
                            </div>
                        </div>
                        <RadioGroup
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                        >
                            <div className="grid gap-4 xl:grid-cols-[250px_minmax(280px,360px)_120px_230px_minmax(190px,240px)] xl:items-start">
                                <div className="flex h-10 items-center rounded-2xl bg-slate-50 px-3">
                                    <FormControlLabel
                                        value="quotation"
                                        control={<Radio size="small" />}
                                        label="Search by Quotation No"
                                        sx={{ margin: 0, "& .MuiFormControlLabel-label": { fontWeight: 700, color: "#0f172a" } }}
                                    />
                                </div>
                                    {orderType === "quotation" && (
                                        <>
                                            <Autocomplete
                                                freeSolo
                                                options={quotationOptions}
                                                value={quotationOptions.find((option) => option.value === quotationNo) || null}
                                                inputValue={quotationNo}
                                                getOptionLabel={(option) => (typeof option === "string" ? option : option.label || "")}
                                                isOptionEqualToValue={(option, value) => option.value === value?.value}
                                                onChange={(event, newValue) => {
                                                    const value = typeof newValue === "string" ? newValue : newValue?.value || quotationPrefixLabel;
                                                    setQuotationNo(value.toUpperCase());
                                                    setErrors((prev) => ({ ...prev, quotationNo: false }));
                                                }}
                                                onInputChange={(event, newInputValue, reason) => {
                                                    if (reason === "reset") return;
                                                    const upperValue = newInputValue.toUpperCase();
                                                    if (!upperValue) {
                                                        setQuotationNo(quotationPrefixLabel);
                                                        return;
                                                    }
                                                    setQuotationNo(
                                                        upperValue.startsWith(quotationPrefixLabel.toUpperCase())
                                                            ? upperValue
                                                            : `${quotationPrefixLabel}${upperValue.replace(/[^0-9]/g, "")}`,
                                                    );
                                                    setErrors((prev) => ({ ...prev, quotationNo: false }));
                                                }}
                                                renderOption={(props, option) => (
                                                    <li {...props} key={option.id}>
                                                        <div className="flex w-full flex-col">
                                                            <span className="text-sm font-bold text-slate-800">{option.label}</span>
                                                            <span className="truncate text-xs text-slate-500">{option.companyName || option.selectedCompany || option.customerPerson || "Quotation"}</span>
                                                        </div>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Quotation Number *"
                                                        placeholder={quotationOptions.length ? "Select quotation number" : "No quotations available"}
                                                        size="small"
                                                        error={!!errors.quotationNo}
                                                        fullWidth
                                                    />
                                                )}
                                                fullWidth
                                            />
                                            <Button
                                                onClick={handleQuotationSearch}
                                                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black capitalize text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-600"
                                            >
                                                <Search size={20} />
                                                Search
                                            </Button>
                                        </>
                                    )}

                                <div className="flex h-10 items-center rounded-2xl bg-slate-50 px-3">
                                    <FormControlLabel
                                        value="manual"
                                        control={<Radio size="small" />}
                                        label="Manually Placed Order"
                                        sx={{ margin: 0, "& .MuiFormControlLabel-label": { fontWeight: 700, color: "#0f172a" } }}
                                    />
                                </div>
                                <TextField
                                    type="date"
                                    size="small"
                                    label="Date"
                                    value={form.date}
                                    onChange={handleChange("date")}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
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
                                <p className="mt-1 text-sm font-semibold text-slate-500">Company, contact, email and mobile details for this order.</p>
                            </div>
                        </div>
                    {orderType === "quotation" ? (
                        <div className="grid w-full gap-4 lg:grid-cols-2">
                            <TextField
                                label="Company Name"
                                fullWidth
                                value={form.selectedCompany}
                                onChange={handleChange("selectedCompany")}
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Customer Name *"
                                fullWidth
                                value={form.customerPerson}
                                error={!!errors.customerPerson}
                                onChange={handleChange("customerPerson")}
                                size="small"
                                InputProps={{ readOnly: true }}
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
                    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950">Product Details</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Add product, GST, discount and order value details.</p>
                            </div>
                        </div>
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
                                        className="rounded-xl bg-slate-500 px-6 py-2 font-black capitalize text-white shadow-sm transition hover:-translate-y-0.5 md:text-base"
                                        onClick={handleResetProductDetails}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        className={`rounded-xl px-6 py-2 font-black capitalize text-white shadow-sm transition hover:-translate-y-0.5 md:text-base ${editProductDetailsIndex !== null ? "bg-emerald-500" : "bg-blue-500"}`}
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

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="relative w-full flex-shrink-0 overflow-auto [scrollbar-width:_thin]">
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
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <TextField
                                label="Final Amount"
                                value={form.finalAmt}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                            />
                        </div>
                    </section>

                    {/* PAYMENT SCHEDULE SECTION */}
                    <section className="space-y-5 rounded-3xl border border-violet-100 bg-violet-50/70 p-5 shadow-xl shadow-slate-200/70 md:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                                <CreditCard size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950">Payment Schedule</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Add due dates, percentage splits, amount and narration.</p>
                            </div>
                        </div>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <TextField
                                label="Due Date *"
                                type="date"
                                value={form.dueDate || ""}
                                error={errors.dueDate}
                                onChange={handleChange("dueDate")}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Percentage *"
                                placeholder="Enter Percentage"
                                type="number"
                                value={form.percentage || ""}
                                error={errors.percentage}
                                onChange={handleChange("percentage")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Amount *"
                                placeholder="Enter Amount"
                                type="number"
                                value={form.amount || ""}
                                error={errors.amount}
                                onChange={handleChange("amount")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                        </Box>

                        <TextField
                            label="Narration"
                            placeholder="Enter narration or remarks"
                            value={form.narration || ""}
                            onChange={handleChange("narration")}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                        />

                        <div className="flex gap-5">
                            <Button
                                variant="gradient"
                                className="rounded-xl bg-slate-500 px-6 py-2 font-black capitalize text-white shadow-sm transition hover:-translate-y-0.5 md:text-base"
                                onClick={handleResetPaymentSchedule}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="gradient"
                                className={`rounded-xl px-6 py-2 font-black capitalize text-white shadow-sm transition hover:-translate-y-0.5 md:text-base ${editPaymentIndex !== null ? "bg-emerald-500" : "bg-blue-500"}`}
                                onClick={handleSavePaymentSchedule}
                            >
                                {editPaymentIndex !== null ? "Update" : "Add"}
                            </Button>
                        </div>

                        {/* TABLE */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="relative w-full flex-shrink-0 overflow-auto text-nowrap [scrollbar-width:_thin]">
                                <table className="table">
                                    <thead className="table-header text-nowrap bg-[#053054] text-white">
                                        <tr className="table-row">
                                            <th className="border border-gray-300 px-2 py-1">Sr No.</th>
                                            <th className="border border-gray-300 px-2 py-1">Due Date</th>
                                            <th className="border border-gray-300 px-2 py-1">Percentage</th>
                                            <th className="border border-gray-300 px-2 py-1">Amount</th>
                                            <th className="border border-gray-300 px-2 py-1">Narration</th>
                                            <th className="border border-gray-300 px-2 py-1">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentSchedules.length > 0 ? (
                                            paymentSchedules.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="text-center"
                                                >
                                                    <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.dueDate}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.percentage}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.amount}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.narration}</td>
                                                    <td className="space-x-2 border border-gray-300 px-2 py-1">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEditPaymentSchedule(index)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeletePaymentSchedule(index)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-3 text-center text-gray-500"
                                                >
                                                    No payment schedule added yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Address Info */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 md:p-6">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950">Billing & Shipping Address</h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500">Confirm address information before placing the order.</p>
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

                    {/* Submit Button */}
                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-black text-slate-900">Ready to place order?</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">Review products, payment schedule and addresses before submitting.</p>
                        </div>
                        {/* <Button
                            onClick={handlePlacedOrder}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <FaJediOrder size={20} />
                            Placed Order
                        </Button> */}
                        <Button
                            onClick={handlePlacedOrder}
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
                                    <FaJediOrder size={20} />
                                    Placed Order
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

export default GenerateOrder;
