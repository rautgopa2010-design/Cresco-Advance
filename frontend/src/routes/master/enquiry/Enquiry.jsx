// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash, UserRound } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Customer = () => {
//     const navigate = useNavigate();
//     const [customers, setCustomers] = useState([]);

//     useEffect(() => {
//         const storedCustomers = JSON.parse(localStorage.getItem("customer")) || [];
//         setCustomers(storedCustomers);
//     }, []);

//     const handleCreateClick = () => {
//         navigate("/customer/create-customer");
//     };

//     const handleDelete = (index) => {
//         const updatedCustomers = customers.filter((_, i) => i !== index);
//         setCustomers(updatedCustomers);
//         localStorage.setItem("customer", JSON.stringify(updatedCustomers));
//     };

//     const groupedCustomers = customers.reduce((acc, curr) => {
//         const existingCompany = acc.find((item) => item.companyName === curr.companyName);
//         if (existingCompany) {
//             existingCompany.customers = [...existingCompany.customers, ...curr.customers];
//         } else {
//             acc.push({ ...curr });
//         }
//         return acc;
//     }, []);

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Customer Detail's :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <UserRound size={20} />
//                         Create New Customer
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Customers No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customers Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Assigned To</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {groupedCustomers.length === 0 ? (
//                                     <tr>
//                                         <td
//                                             colSpan="8"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No customers data added yet.
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     customers.map((cus, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{cus.companyName}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {cus.customers
//                                                     .map((c) => `${c.salutation} ${c.firstName} ${c.middleName} ${c.lastName}`.trim())
//                                                     .join(", ")}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{cus.customers.map((c) => c.mobile).join(", ")}</td>
//                                             <td className="table-cell border border-gray-300">{cus.customers.map((c) => c.email).join(", ")}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {Array.isArray(cus.assignedTo) ? cus.assignedTo.join(", ") : cus.assignedTo}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button className="text-blue-500">
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDelete(index)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                     <button className="text-purple-500">
//                                                         <File size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Customer;

// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash, UserRound, X, ChevronLeft, ChevronRight, BadgePlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { getCustomers, deleteCustomer, addCustomerContact, importCustomers, bulkAssignCustomers } from "../../../redux/actions/customer";
// import { getEmployees } from "../../../redux/actions/employee";
// import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField, Autocomplete, Chip } from "@mui/material";
// import { clearSnackbar } from "../../../redux/actions/commonActions";
// import { getSalutations } from "../../../redux/actions/salutation";
// import { getCountryCode } from "../../../redux/actions/countryCode";
// import { FaWhatsapp } from "react-icons/fa";
// import { PhoneCall } from "lucide-react";
// import * as XLSX from "xlsx";
// import { CUSTOMER_ERROR } from "../../../redux/types";

// const Enquiry = () => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { customers, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.customer);
//     const { employees } = useSelector((state) => state.employee);
//     const { salutations } = useSelector((state) => state.salutation);
//     const { countryCode } = useSelector((state) => state.countryCode);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//     const [selectedDeleteId, setSelectedDeleteId] = useState(null);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
//     const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
//     const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
//     const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
//     const [selectedEmployees, setSelectedEmployees] = useState([]);

//     useEffect(() => {
//         dispatch(getCustomers());
//         dispatch(getSalutations());
//         dispatch(getCountryCode());
//         dispatch(getEmployees());
//         dispatch(clearSnackbar());
//     }, [dispatch]);

//     useEffect(() => {
//         if (snackbarMessage) {
//             setSnackbarOpen(true);
//         }
//     }, [snackbarMessage]);

//     const handleCreateClick = () => {
//         navigate("/enquiry/create-enquiry");
//     };

//     const handleEditClick = (id) => {
//         navigate(`/enquiry/edit-enquiry/${id}`);
//     };

//     const handleViewClick = (id) => {
//         navigate(`/enquiry/view-enquiry/${id}`);
//     };

//     const modalStyle = {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: isMobile ? 330 : 500,
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         borderRadius: "12px",
//         p: 3,
//     };

//     const handleDeleteClick = (id) => {
//         setSelectedDeleteId(id);
//         setDeleteConfirmOpen(true);
//     };

//     const confirmDelete = () => {
//         dispatch(deleteCustomer(selectedDeleteId));
//         setSnackbarOpen(true);
//         setDeleteConfirmOpen(false);
//         setSelectedDeleteId(null);
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//         setTimeout(() => {
//             dispatch(clearSnackbar());
//         }, 100);
//     };

//     // Download template
//     const handleDownloadTemplate = () => {
//         const templateData = [
//             // Row 1 – Instructions / Reference (will be skipped during import)
//             {
//                 Salutation: "Mr. / Mrs. / Ms. (example)",
//                 "First Name": "a (required)",
//                 "Middle Name": "c (optional)",
//                 "Last Name": "b (required)",
//                 Mobile: "91 1111111111 (10 digits only)",
//                 Email: "ab@gmail.com (required)",
//                 "Company Name": "Clsoft",
//                 "Customer Category": "FMCG",
//                 Industry: "Automobile",
//                 Designation: "",
//                 "Lead Source": "",
//                 "GSTIN No": "98789",
//                 "Billing Street": "wwq",
//                 "Billing City": "Nagpur",
//                 "Billing State": "Maharashtra",
//                 "Billing Pincode": "444405",
//                 "Billing Country": "India",
//                 "Shipping Street": "wwq",
//                 "Shipping City": "Nagpur",
//                 "Shipping State": "Maharashtra",
//                 "Shipping Pincode": "444405",
//                 "Shipping Country": "India",
//             },
//             // Row 2 – empty row so user knows where to start
//             {
//                 Salutation: "",
//                 "First Name": "",
//                 "Middle Name": "",
//                 "Last Name": "",
//                 Mobile: "",
//                 Email: "",
//                 "Company Name": "",
//                 "Customer Category": "",
//                 Industry: "",
//                 Designation: "",
//                 "Lead Source": "",
//                 "GSTIN No": "",
//                 "Billing Street": "",
//                 "Billing City": "",
//                 "Billing State": "",
//                 "Billing Pincode": "",
//                 "Billing Country": "",
//                 "Shipping Street": "",
//                 "Shipping City": "",
//                 "Shipping State": "",
//                 "Shipping Pincode": "",
//                 "Shipping Country": "",
//             },
//         ];

//         const ws = XLSX.utils.json_to_sheet(templateData);

//         // Make first row bold / gray background (visual hint)
//         const range = XLSX.utils.decode_range(ws["!ref"]);
//         for (let C = range.s.c; C <= range.e.c; ++C) {
//             const cell_address = XLSX.utils.encode_cell({ c: C, r: 0 });
//             if (!ws[cell_address]) continue;
//             ws[cell_address].s = {
//                 font: { bold: true },
//                 fill: { fgColor: { rgb: "DDDDDD" } },
//             };
//         }

//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Customers");

//         ws["!cols"] = [
//             { wch: 12 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 28 },
//             { wch: 20 },
//             { wch: 18 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 18 },
//             { wch: 25 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 12 },
//             { wch: 15 },
//             { wch: 25 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 12 },
//             { wch: 15 },
//             { wch: 20 },
//         ];

//         XLSX.writeFile(wb, "Customer_Import_Template.xlsx");
//     };

//     const formatMobileForDb = (raw) => {
//         if (!raw) return "";

//         const cleaned = raw.toString().trim();

//         // Pattern: 1–5 digits + exactly ONE space + exactly 10 digits
//         const match = cleaned.match(/^(\d{1,5})\s(\d{10})$/);

//         if (match) {
//             const countryCode = match[1];
//             const number = match[2];
//             return `+${countryCode} ${number}`;
//         }

//         // No match → return original trimmed value
//         return cleaned;
//     };

//     // Handle file upload
//     const handleFileUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         if (!file.name.match(/\.(xlsx|xls)$/)) {
//             dispatch({
//                 type: CUSTOMER_ERROR,
//                 payload: "Please upload a valid Excel file (.xlsx or .xls)",
//             });
//             return;
//         }

//         const reader = new FileReader();
//         reader.onload = async (evt) => {
//             try {
//                 const data = evt.target.result;
//                 const workbook = XLSX.read(data, { type: "binary" });
//                 const sheetName = workbook.SheetNames[0];
//                 const sheet = workbook.Sheets[sheetName];

//                 // Read as array of arrays (raw rows)
//                 const jsonData = XLSX.utils.sheet_to_json(sheet, {
//                     defval: "",
//                     header: 1, // get as array of arrays
//                     blankrows: false,
//                 });

//                 if (jsonData.length <= 1) {
//                     dispatch({ type: CUSTOMER_ERROR, payload: "Excel file contains no data rows" });
//                     return;
//                 }

//                 // Filter out rows that look like the sample/reference row
//                 const dataRows = jsonData.slice(1).filter((row) => {
//                     if (!row || row.length < 6) return false; // too short to be valid

//                     const firstName = (row[1] || "").toString().trim().toLowerCase();
//                     const lastName = (row[3] || "").toString().trim().toLowerCase();
//                     const mobileRaw = (row[4] || "").toString().trim().replace(/\D/g, ""); // digits only
//                     const email = (row[5] || "").toString().trim().toLowerCase();

//                     // Characteristics of your sample row
//                     const isLikelySample =
//                         firstName === "a" ||
//                         firstName.includes("example") ||
//                         firstName === "" ||
//                         lastName === "b" ||
//                         lastName.includes("example") ||
//                         mobileRaw.includes("1111111111") ||
//                         mobileRaw === "911111111111" ||
//                         mobileRaw === "1111111111" ||
//                         email === "ab@gmail.com" ||
//                         email.includes("example") ||
//                         (email.includes("@gmail.com") && firstName === ""); // very generic catch

//                     return !isLikelySample;
//                 });

//                 if (dataRows.length === 0) {
//                     dispatch({ type: CUSTOMER_ERROR, payload: "No valid data rows found (only sample/example row detected)" });
//                     return;
//                 }

//                 // Convert filtered rows to your object format
//                 const formattedData = dataRows.map((row) => ({
//                     Salutation: row[0] || "",
//                     "First Name": row[1] || "",
//                     "Middle Name": row[2] || "",
//                     "Last Name": row[3] || "",
//                     Mobile: formatMobileForDb(row[4]), // ← CHANGED HERE
//                     Email: row[5] || "",
//                     "Company Name": row[6] || "",
//                     "Customer Category": row[7] || "",
//                     Industry: row[8] || "",
//                     Designation: row[9] || "",
//                     "Lead Source": row[10] || "",
//                     "GSTIN No": row[11] || "",
//                     "Billing Street": row[12] || "",
//                     "Billing City": row[13] || "",
//                     "Billing State": row[14] || "",
//                     "Billing Pincode": row[15]?.toString() || "",
//                     "Billing Country": row[16] || "",
//                     "Shipping Street": row[17] || "",
//                     "Shipping City": row[18] || "",
//                     "Shipping State": row[19] || "",
//                     "Shipping Pincode": row[20]?.toString() || "",
//                     "Shipping Country": row[21] || "",
//                 }));

//                 // Dispatch to backend
//                 dispatch(importCustomers(formattedData));
//             } catch (err) {
//                 console.error("Excel parse error:", err);
//                 dispatch({
//                     type: CUSTOMER_ERROR,
//                     payload: "Failed to read Excel file. Please check format.",
//                 });
//             }
//         };

//         reader.readAsBinaryString(file);
//     };

//     const formatEmployeeName = (emp) => {
//         if (!emp) return "";
//         const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
//         return `${fullName}`;
//     };

//     // ✅ Added fromDate & toDate
//     const [filters, setFilters] = useState({
//         fromDate: "",
//         toDate: "",
//         company: "",
//         customer: "",
//         mobile: "",
//         email: "",
//         assignedTo: [],
//     });

//     const [addContactOpen, setAddContactOpen] = useState(false);
//     const [selectedCustomerId, setSelectedCustomerId] = useState(null);

//     const [contactForm, setContactForm] = useState({
//         salutation: "",
//         firstName: "",
//         middleName: "",
//         lastName: "",
//         selectedPhoneCode: "+91",
//         mobile: "",
//         email: "",
//         tag: "",
//         designation: "",
//     });

//     const [contactErrors, setContactErrors] = useState({});

//     const handleFilterChange = (key, value) => {
//         setFilters((prev) => ({ ...prev, [key]: value }));
//     };

//     // ✅ Apply date range filter using createdAt
//     const filteredCustomers = customers.filter((cus) => {
//         const createdAt = cus.createdAt ? new Date(cus.createdAt) : null;
//         if (!createdAt) return false;

//         // Normalize createdAt to start-of-day in local time
//         const cusDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());

//         // From Date → start of the day
//         const fromDate = filters.fromDate
//             ? new Date(new Date(filters.fromDate).getFullYear(), new Date(filters.fromDate).getMonth(), new Date(filters.fromDate).getDate())
//             : null;

//         // To Date → end of the day (23:59:59.999)
//         const toDate = filters.toDate
//             ? new Date(
//                   new Date(filters.toDate).getFullYear(),
//                   new Date(filters.toDate).getMonth(),
//                   new Date(filters.toDate).getDate(),
//                   23,
//                   59,
//                   59,
//                   999,
//               )
//             : null;

//         const matchesFromDate = fromDate ? cusDate >= fromDate : true;
//         const matchesToDate = toDate ? cusDate <= toDate : true;

//         const fullName = `${cus.salutation || ""} ${cus.firstName || ""} ${cus.middleName || ""} ${cus.lastName || ""}`.trim();

//         const matchesCompany = filters.company ? cus.companyName?.toLowerCase().includes(filters.company.toLowerCase()) : true;

//         const matchesCustomer = filters.customer ? fullName.toLowerCase().includes(filters.customer.toLowerCase()) : true;

//         const matchesMobile = filters.mobile ? cus.mobile?.includes(filters.mobile) : true;
//         const matchesEmail = filters.email ? cus.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

//         const matchesAssignedTo =
//             filters.assignedTo.length > 0
//                 ? filters.assignedTo.some((selectedEmp) => {
//                       const empName = formatEmployeeName(selectedEmp);
//                       if (Array.isArray(cus.assignedTo)) {
//                           return cus.assignedTo.some((name) => name.toLowerCase().includes(empName.toLowerCase()));
//                       }
//                       return (cus.assignedTo || "").toLowerCase().includes(empName.toLowerCase());
//                   })
//                 : true;

//         return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail && matchesAssignedTo;
//     });

//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(5);

//     const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const currentCustomers = filteredCustomers.slice(startIndex, startIndex + rowsPerPage);

//     const handleRowsPerPageChange = (e) => {
//         const value = e.target.value;
//         if (value === "All") {
//             setRowsPerPage(filteredCustomers.length);
//             setCurrentPage(1);
//         } else {
//             setRowsPerPage(Number(value));
//             setCurrentPage(1);
//         }
//     };

//     const handleCallClick = (mobile) => {
//         if (!mobile) return;

//         const cleanedMobile = mobile.replace(/\D/g, ""); // removes spaces/symbols
//         window.location.href = `tel:${cleanedMobile}`;
//     };

//     const handleWhatsAppClick = (mobile, name) => {
//         if (!mobile) return;

//         const message = `Hello ${name},`; // default message
//         const encodedMessage = encodeURIComponent(message);

//         // Remove spaces or extra characters from number
//         const cleanedMobile = mobile.replace(/\D/g, "");

//         // WhatsApp API URL
//         const whatsappURL = `https://wa.me/${cleanedMobile}?text=${encodedMessage}`;

//         window.open(whatsappURL, "_blank");
//     };

//     const handleAddContacts = (customerId) => {
//         setSelectedCustomerId(customerId);
//         setAddContactOpen(true);
//         // Reset form
//         setContactForm({
//             salutation: "",
//             firstName: "",
//             middleName: "",
//             lastName: "",
//             selectedPhoneCode: "+91",
//             mobile: "",
//             email: "",
//             tag: "",
//             designation: "",
//         });
//         setContactErrors({});
//     };

//     const handleContactChange = (field) => (e) => {
//         const value = e.target.value;
//         setContactForm((prev) => ({ ...prev, [field]: value }));
//         setContactErrors((prev) => ({ ...prev, [field]: false }));
//     };

//     const validateContact = () => {
//         let tempErrors = {};
//         let hasError = false;

//         const required = {
//             salutation: "Salutation",
//             firstName: "First Name",
//             lastName: "Last Name",
//             selectedPhoneCode: "Phone Code",
//             mobile: "Mobile",
//             email: "Email",
//         };

//         for (const [key, label] of Object.entries(required)) {
//             if (!contactForm[key]?.trim()) {
//                 tempErrors[key] = true;
//                 hasError = true;
//             }
//         }

//         if (hasError) {
//             setContactErrors(tempErrors);
//             // Use local snackbar instead of Redux
//             setLocalSnackbarMessage("Please fill all required fields.");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         // Mobile: exactly 10 digits
//         if (!/^[0-9]{10}$/.test(contactForm.mobile)) {
//             tempErrors.mobile = true;
//             setContactErrors(tempErrors);
//             setLocalSnackbarMessage("Mobile number must be exactly 10 digits");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         // Email format
//         if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contactForm.email)) {
//             tempErrors.email = true;
//             setContactErrors(tempErrors);
//             setLocalSnackbarMessage("Enter a valid email address");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         return true;
//     };

//     const handleAddContactSubmit = () => {
//         if (!validateContact()) return;

//         const data = {
//             salutation: contactForm.salutation,
//             firstName: contactForm.firstName,
//             middleName: contactForm.middleName,
//             lastName: contactForm.lastName,
//             mobile: `${contactForm.selectedPhoneCode} ${contactForm.mobile}`.trim(),
//             email: contactForm.email,
//             tag: contactForm.tag,
//             designation: contactForm.designation,
//         };

//         dispatch(addCustomerContact(selectedCustomerId, data));
//     };

//     useEffect(() => {
//         if (snackbarMessage) {
//             setSnackbarOpen(true);

//             // Close modal ONLY on success for contact addition
//             if (snackbarSeverity === "success" && snackbarMessage.includes("Contact added successfully")) {
//                 setAddContactOpen(false);
//                 // Reset form on success
//                 setContactForm({
//                     salutation: "",
//                     firstName: "",
//                     middleName: "",
//                     lastName: "",
//                     selectedPhoneCode: "",
//                     mobile: "",
//                     email: "",
//                     tag: "",
//                     designation: "",
//                 });
//                 setContactErrors({});
//             }
//         }
//     }, [snackbarMessage, snackbarSeverity]);

//     const handleSelectAll = (e) => {
//         if (e.target.checked) {
//             const allIds = currentCustomers.map((c) => c.id);
//             setSelectedCustomerIds(allIds);
//         } else {
//             setSelectedCustomerIds([]);
//         }
//     };

//     const handleSelectOne = (id) => (e) => {
//         if (e.target.checked) {
//             setSelectedCustomerIds((prev) => [...prev, id]);
//         } else {
//             setSelectedCustomerIds((prev) => prev.filter((cid) => cid !== id));
//         }
//     };

//     const handleBulkAssignOpen = () => {
//         setSelectedEmployees([]);
//         setBulkAssignModalOpen(true);
//     };

//     const handleBulkAssignSubmit = () => {
//         if (selectedEmployees.length === 0) {
//             setLocalSnackbarMessage("Please select at least one employee");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const employeeIds = selectedEmployees.map((emp) => emp.id);
//         dispatch(bulkAssignCustomers(selectedCustomerIds, employeeIds));

//         // Reset
//         setBulkAssignModalOpen(false);
//         setSelectedCustomerIds([]);
//         setSelectedEmployees([]);
//     };

//     return (
//         <>
//             {loading ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="card">
//                     {/* HEADER */}
//                     <div className="flex items-center justify-between text-nowrap">
//                         <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Enquiry Detail's :</div>
//                         <Button
//                             onClick={handleCreateClick}
//                             variant="gradient"
//                             className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                         >
//                             <UserRound size={20} />
//                             Create New Enquiry
//                         </Button>
//                     </div>

//                     <div className="mt-4 rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 p-6 text-center">
//                         <div className="mb-4 text-lg font-medium text-gray-700">Import Customers from Excel</div>

//                         <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
//                             {/* Download Template */}
//                             <button
//                                 onClick={handleDownloadTemplate}
//                                 className="flex items-center gap-2 text-nowrap rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm text-blue-700 hover:bg-blue-50 md:text-sm lg:text-base"
//                             >
//                                 <File size={18} />
//                                 Download Sample Excel
//                             </button>

//                             {/* Upload File */}
//                             <label className="flex cursor-pointer items-center gap-2 text-nowrap rounded-lg bg-[#053054] px-5 py-2.5 text-sm text-white hover:bg-[#04243f] md:text-sm lg:text-base">
//                                 <File size={18} />
//                                 Import Excel File
//                                 <input
//                                     type="file"
//                                     accept=".xlsx, .xls"
//                                     className="hidden"
//                                     onChange={handleFileUpload}
//                                 />
//                             </label>
//                         </div>

//                         <p className="mt-3 text-sm text-gray-500">Supported format: .xlsx, .xls • Max size: 5MB</p>
//                     </div>

//                     <div className="flex items-center justify-between px-2 py-3">
//                         <div className="flex items-center gap-4">
//                             {selectedCustomerIds.length > 0 && (
//                                 <Button
//                                     variant="gradient"
//                                     className="bg-[#2563EB] px-4 py-2 text-sm capitalize"
//                                     onClick={handleBulkAssignOpen}
//                                 >
//                                     Bulk Assign ({selectedCustomerIds.length})
//                                 </Button>
//                             )}
//                         </div>
//                         <span className="text-xs text-gray-500">...</span>
//                     </div>

//                     {/* ===== Filter Box ===== */}
//                     <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
//                         <Typography
//                             variant="subtitle1"
//                             className="mb-2 font-semibold text-[#053054]"
//                         >
//                             Filters
//                         </Typography>

//                         <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                             {/* ✅ Date Filters */}
//                             <TextField
//                                 label="From Date"
//                                 type="date"
//                                 size="small"
//                                 InputLabelProps={{ shrink: true }}
//                                 value={filters.fromDate}
//                                 onChange={(e) => handleFilterChange("fromDate", e.target.value)}
//                             />
//                             <TextField
//                                 label="To Date"
//                                 type="date"
//                                 size="small"
//                                 InputLabelProps={{ shrink: true }}
//                                 value={filters.toDate}
//                                 onChange={(e) => handleFilterChange("toDate", e.target.value)}
//                             />

//                             {/* Existing Filters */}
//                             <TextField
//                                 label="Company Name"
//                                 size="small"
//                                 value={filters.company}
//                                 onChange={(e) => handleFilterChange("company", e.target.value)}
//                             />
//                             <TextField
//                                 label="Customer Name"
//                                 size="small"
//                                 value={filters.customer}
//                                 onChange={(e) => handleFilterChange("customer", e.target.value)}
//                             />
//                             <TextField
//                                 label="Mobile No"
//                                 size="small"
//                                 value={filters.mobile}
//                                 onChange={(e) => handleFilterChange("mobile", e.target.value)}
//                             />
//                             <TextField
//                                 label="Email Id"
//                                 size="small"
//                                 value={filters.email}
//                                 onChange={(e) => handleFilterChange("email", e.target.value)}
//                             />

//                             {/* ✅ Assigned To Filter */}
//                             {/* <Autocomplete
//                                 multiple
//                                 disableCloseOnSelect
//                                 options={employees}
//                                 getOptionLabel={(option) => formatEmployeeName(option)}
//                                 value={filters.assignedTo}
//                                 onChange={(e, newValue) => handleFilterChange("assignedTo", newValue)}
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
//                                         label="Assigned To"
//                                         size="small"
//                                     />
//                                 )}
//                                 className="w-full"
//                             /> */}
//                             <Autocomplete
//                                 multiple
//                                 disableCloseOnSelect
//                                 options={employees.filter((emp) => !filters.assignedTo.some((selected) => selected.id === emp.id))}
//                                 getOptionLabel={(option) => formatEmployeeName(option)}
//                                 isOptionEqualToValue={(option, value) => option.id === value.id}
//                                 value={filters.assignedTo}
//                                 onChange={(e, newValue) => {
//                                     handleFilterChange("assignedTo", newValue || []);
//                                 }}
//                                 renderTags={(value, getTagProps) =>
//                                     value.map((option, index) => {
//                                         const { key, ...tagProps } = getTagProps({ index });
//                                         return (
//                                             <Chip
//                                                 key={key}
//                                                 variant="outlined"
//                                                 label={formatEmployeeName(option)}
//                                                 {...tagProps}
//                                             />
//                                         );
//                                     })
//                                 }
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Assigned To"
//                                         size="small"
//                                         placeholder={filters.assignedTo.length === 0 ? "Select employees" : ""}
//                                     />
//                                 )}
//                                 className="w-full"
//                                 loading={!employees?.length}
//                             />
//                         </div>
//                     </div>

//                     <div className="card-body p-0">
//                         {/* Show Entries Dropdown */}
//                         <div className="flex items-center justify-between px-2 py-2">
//                             <div className="flex items-center gap-2">
//                                 <span className="text-sm text-gray-700">Show</span>
//                                 <select
//                                     value={rowsPerPage === filteredCustomers.length ? "All" : rowsPerPage}
//                                     onChange={handleRowsPerPageChange}
//                                     className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#053054]"
//                                 >
//                                     <option value={5}>5</option>
//                                     <option value={20}>20</option>
//                                     <option value={50}>50</option>
//                                     <option value={100}>100</option>
//                                     <option value="All">All</option>
//                                 </select>
//                                 <span className="text-sm text-gray-700">entries</span>
//                             </div>
//                             <span className="text-xs text-gray-500">
//                                 Page {currentPage} of {Math.ceil(filteredCustomers.length / rowsPerPage) || 1}
//                             </span>
//                         </div>

//                         {/* Table */}
//                         <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                             <table className="table">
//                                 <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                     <tr className="table-row">
//                                         {/* <th className="table-head border border-gray-300 capitalize">Sr. No.</th> */}
//                                         <th className="table-head w-24 border border-gray-300">
//                                             <div className="flex items-center gap-2 pl-2">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={currentCustomers.length > 0 && selectedCustomerIds.length === currentCustomers.length}
//                                                     onChange={handleSelectAll}
//                                                     className="h-3 w-3 rounded border-gray-300 text-[#053054] focus:ring-[#053054]"
//                                                 />
//                                                 <span className="font-semibold">Sr. No.</span>
//                                             </div>
//                                         </th>
//                                         <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                         <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                         <th className="table-head border border-gray-300 capitalize">Mobile</th>
//                                         <th className="table-head border border-gray-300 capitalize">Email</th>
//                                         <th className="table-head border border-gray-300 capitalize">Assigned To</th>
//                                         <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="table-body text-[#433C50]">
//                                     {currentCustomers.length === 0 ? (
//                                         <tr>
//                                             <td
//                                                 colSpan="7"
//                                                 className="py-4 text-center text-gray-400"
//                                             >
//                                                 No customers data added yet.
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         currentCustomers.map((cus, index) => {
//                                             const fullName =
//                                                 `${cus.salutation || ""} ${cus.firstName || ""} ${cus.middleName || ""} ${cus.lastName || ""}`.trim();
//                                             return (
//                                                 <tr
//                                                     key={cus.id}
//                                                     className="table-row"
//                                                 >
//                                                     {/* <td className="table-cell border border-gray-300">{startIndex + index + 1}</td> */}
//                                                     <td className="table-cell border border-gray-300">
//                                                         <div className="flex items-center gap-3 pl-2">
//                                                             <input
//                                                                 type="checkbox"
//                                                                 checked={selectedCustomerIds.includes(cus.id)}
//                                                                 onChange={handleSelectOne(cus.id)}
//                                                                 className="h-3 w-3 rounded border-gray-300 text-[#053054] focus:ring-[#053054]"
//                                                             />
//                                                             <span>{startIndex + index + 1}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="table-cell border border-gray-300">{cus.companyName || "-----"}</td>
//                                                     <td className="table-cell border border-gray-300">{fullName}</td>
//                                                     <td className="table-cell border border-gray-300">{cus.mobile}</td>
//                                                     <td className="table-cell border border-gray-300">{cus.email}</td>
//                                                     <td className="table-cell border border-gray-300">
//                                                         {Array.isArray(cus.assignedTo) && cus.assignedTo.length > 0
//                                                             ? cus.assignedTo.map((a, i) => (
//                                                                   <div key={i}>
//                                                                       {i + 1}) {a}
//                                                                   </div>
//                                                               ))
//                                                             : "-"}
//                                                     </td>
//                                                     <td className="table-cell border border-gray-300">
//                                                         <div className="flex items-center gap-x-4">
//                                                             <button
//                                                                 className="text-orange-500"
//                                                                 onClick={() => handleAddContacts(cus.id)}
//                                                                 title="Add Contacts"
//                                                             >
//                                                                 <BadgePlus size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-blue-500"
//                                                                 onClick={() => handleEditClick(cus.id)}
//                                                             >
//                                                                 <PencilLine size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-red-500"
//                                                                 onClick={() => handleDeleteClick(cus.id)}
//                                                             >
//                                                                 <Trash size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-purple-500"
//                                                                 onClick={() => handleViewClick(cus.id)}
//                                                             >
//                                                                 <File size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-blue-600"
//                                                                 onClick={() => handleCallClick(cus.mobile)}
//                                                             >
//                                                                 <PhoneCall size={22} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-green-600"
//                                                                 onClick={() =>
//                                                                     handleWhatsAppClick(
//                                                                         cus.mobile,
//                                                                         `${cus.salutation || ""} ${cus.firstName || ""} ${cus.middleName || ""} ${cus.lastName || ""}`.trim(),
//                                                                     )
//                                                                 }
//                                                             >
//                                                                 <FaWhatsapp size={22} />
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* ✅ Pagination Controls */}
//                     {filteredCustomers.length > rowsPerPage && (
//                         <div className="mt-4 flex items-center justify-between">
//                             <span className="text-sm text-gray-500">
//                                 Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredCustomers.length)} of{" "}
//                                 {filteredCustomers.length}
//                             </span>
//                             <div className="flex items-center gap-3">
//                                 <IconButton
//                                     variant="text"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage((prev) => prev - 1)}
//                                     className="flex items-center rounded-full"
//                                 >
//                                     <ChevronLeft />
//                                 </IconButton>

//                                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
//                                     {currentPage}
//                                 </div>

//                                 <IconButton
//                                     variant="text"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage((prev) => prev + 1)}
//                                     className="flex items-center rounded-full"
//                                 >
//                                     <ChevronRight />
//                                 </IconButton>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Delete Modal */}
//             <Modal
//                 open={deleteConfirmOpen}
//                 onClose={() => setDeleteConfirmOpen(false)}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             Confirm Delete
//                         </Typography>
//                         <IconButton
//                             onClick={() => setDeleteConfirmOpen(false)}
//                             className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
//                         >
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this enquiry?</Typography>

//                     <div className="mt-4 flex justify-center gap-4">
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-red-700 px-4 py-2 capitalize text-white"
//                             onClick={confirmDelete}
//                         >
//                             Yes
//                         </Button>
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
//                             onClick={() => setDeleteConfirmOpen(false)}
//                         >
//                             No
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Add Contact Modal */}
//             <Modal
//                 open={addContactOpen}
//                 onClose={() => setAddContactOpen(false)}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             Add New Contact
//                         </Typography>
//                         <IconButton
//                             onClick={() => setAddContactOpen(false)}
//                             className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
//                         >
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                         <Autocomplete
//                             options={salutations.map((s) => s.salutation)}
//                             value={contactForm.salutation || null}
//                             onChange={(e, newValue) => {
//                                 setContactForm((prev) => ({ ...prev, salutation: newValue || "" }));
//                                 setContactErrors((prev) => ({ ...prev, salutation: false }));
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Salutation *"
//                                     error={contactErrors.salutation}
//                                     size="small"
//                                 />
//                             )}
//                         />

//                         <TextField
//                             label="First Name *"
//                             value={contactForm.firstName}
//                             onChange={handleContactChange("firstName")}
//                             error={contactErrors.firstName}
//                             size="small"
//                             fullWidth
//                         />

//                         <TextField
//                             label="Middle Name"
//                             value={contactForm.middleName}
//                             onChange={handleContactChange("middleName")}
//                             size="small"
//                             fullWidth
//                         />

//                         <TextField
//                             label="Last Name *"
//                             value={contactForm.lastName}
//                             onChange={handleContactChange("lastName")}
//                             error={contactErrors.lastName}
//                             size="small"
//                             fullWidth
//                         />

//                         {/* Phone Code + Mobile */}
//                         <Autocomplete
//                             options={countryCode.map((c) => c.phoneCode)}
//                             value={contactForm.selectedPhoneCode || null}
//                             onChange={(e, newValue) => {
//                                 setContactForm((prev) => ({ ...prev, selectedPhoneCode: newValue || "" }));
//                                 setContactErrors((prev) => ({ ...prev, selectedPhoneCode: false }));
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Code *"
//                                     error={contactErrors.selectedPhoneCode}
//                                     size="small"
//                                 />
//                             )}
//                         />

//                         <TextField
//                             label="Mobile *"
//                             placeholder="7385363401"
//                             value={contactForm.mobile}
//                             onChange={handleContactChange("mobile")}
//                             error={contactErrors.mobile}
//                             size="small"
//                             fullWidth
//                         />

//                         <TextField
//                             label="Email *"
//                             value={contactForm.email}
//                             onChange={handleContactChange("email")}
//                             error={contactErrors.email}
//                             size="small"
//                             fullWidth
//                         />

//                         <TextField
//                             label="Tag"
//                             value={contactForm.tag}
//                             onChange={handleContactChange("tag")}
//                             size="small"
//                             fullWidth
//                         />
//                         <TextField
//                             label="Designation"
//                             value={contactForm.designation}
//                             onChange={handleContactChange("designation")}
//                             size="small"
//                             fullWidth
//                         />
//                     </div>

//                     <div className="mt-6 flex justify-end gap-4">
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
//                             onClick={() => setAddContactOpen(false)}
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
//                             onClick={handleAddContactSubmit}
//                         >
//                             Add Contact
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

//             <Modal
//                 open={bulkAssignModalOpen}
//                 onClose={() => setBulkAssignModalOpen(false)}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             Bulk Assign Employees
//                         </Typography>
//                         <IconButton onClick={() => setBulkAssignModalOpen(false)}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <Typography className="text-sm text-gray-600">Selected enquiries: {selectedCustomerIds.length}</Typography>

//                     <Autocomplete
//                         multiple
//                         options={employees}
//                         getOptionLabel={formatEmployeeName}
//                         value={selectedEmployees}
//                         onChange={(e, newValue) => setSelectedEmployees(newValue)}
//                         isOptionEqualToValue={(option, value) => option.id === value.id}
//                         renderTags={(value, getTagProps) =>
//                             value.map((option, index) => (
//                                 <Chip
//                                     key={option.id}
//                                     label={formatEmployeeName(option)}
//                                     {...getTagProps({ index })}
//                                 />
//                             ))
//                         }
//                         renderInput={(params) => (
//                             <TextField
//                                 {...params}
//                                 label="Assign to employees"
//                                 placeholder="Select employees"
//                                 size="small"
//                             />
//                         )}
//                         className="mt-5"
//                     />

//                     <div className="mt-6 flex justify-end gap-4">
//                         <Button
//                             variant="gradient"
//                             className="bg-gray-500 px-4 py-2 capitalize text-white"
//                             onClick={() => setBulkAssignModalOpen(false)}
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             variant="gradient"
//                             className="bg-[#053054] px-4 py-2 capitalize text-white"
//                             onClick={handleBulkAssignSubmit}
//                             disabled={selectedEmployees.length === 0}
//                         >
//                             Assign
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={4000}
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

// export default Enquiry;

import { Button } from "@material-tailwind/react";
import { File, PencilLine, Trash, UserRound, X, ChevronLeft, ChevronRight, BadgePlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCustomers, deleteCustomer, addCustomerContact, importCustomers, bulkAssignCustomers } from "../../../redux/actions/customer";
import { getEmployees } from "../../../redux/actions/employee";
import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField, Autocomplete, Chip } from "@mui/material";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { getSalutations } from "../../../redux/actions/salutation";
import { getCountryCode } from "../../../redux/actions/countryCode";
import { FaWhatsapp } from "react-icons/fa";
import { PhoneCall } from "lucide-react";
import * as XLSX from "xlsx";
import { CUSTOMER_ERROR } from "../../../redux/types";

const Enquiry = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { customers, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.customer);
    const { employees } = useSelector((state) => state.employee);
    const { salutations } = useSelector((state) => state.salutation);
    const { countryCode } = useSelector((state) => state.countryCode);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    useEffect(() => {
        dispatch(getCustomers());
        dispatch(getSalutations());
        dispatch(getCountryCode());
        dispatch(getEmployees());
        dispatch(clearSnackbar());
    }, [dispatch]);

    const handleCreateClick = () => {
        navigate("/enquiry/create-enquiry");
    };

    const handleEditClick = (id) => {
        navigate(`/enquiry/edit-enquiry/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/enquiry/view-enquiry/${id}`);
    };

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 330 : 500,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteCustomer(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        dispatch(clearSnackbar());
    };

    // Download template
    const handleDownloadTemplate = () => {
        const templateData = [
            // Row 1 – Instructions / Reference (will be skipped during import)
            {
                Salutation: "Mr. / Mrs. / Ms. (example)",
                "First Name": "a (required)",
                "Middle Name": "c (optional)",
                "Last Name": "b (required)",
                Mobile: "91 1111111111 (10 digits only)",
                Email: "ab@gmail.com (required)",
                "Company Name": "Clsoft",
                "Customer Category": "FMCG",
                Industry: "Automobile",
                Designation: "",
                "Lead Source": "",
                "GSTIN No": "98789",
                "Billing Street": "wwq",
                "Billing City": "Nagpur",
                "Billing State": "Maharashtra",
                "Billing Pincode": "444405",
                "Billing Country": "India",
                "Shipping Street": "wwq",
                "Shipping City": "Nagpur",
                "Shipping State": "Maharashtra",
                "Shipping Pincode": "444405",
                "Shipping Country": "India",
            },
            // Row 2 – empty row so user knows where to start
            {
                Salutation: "",
                "First Name": "",
                "Middle Name": "",
                "Last Name": "",
                Mobile: "",
                Email: "",
                "Company Name": "",
                "Customer Category": "",
                Industry: "",
                Designation: "",
                "Lead Source": "",
                "GSTIN No": "",
                "Billing Street": "",
                "Billing City": "",
                "Billing State": "",
                "Billing Pincode": "",
                "Billing Country": "",
                "Shipping Street": "",
                "Shipping City": "",
                "Shipping State": "",
                "Shipping Pincode": "",
                "Shipping Country": "",
            },
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);

        // Make first row bold / gray background (visual hint)
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ c: C, r: 0 });
            if (!ws[cell_address]) continue;
            ws[cell_address].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "DDDDDD" } },
            };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");

        ws["!cols"] = [
            { wch: 12 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 28 },
            { wch: 20 },
            { wch: 18 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 18 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 },
            { wch: 20 },
        ];

        XLSX.writeFile(wb, "Customer_Import_Template.xlsx");
    };

    const formatMobileForDb = (raw) => {
        if (!raw) return "";

        const cleaned = raw.toString().trim();

        // Pattern: 1–5 digits + exactly ONE space + exactly 10 digits
        const match = cleaned.match(/^(\d{1,5})\s(\d{10})$/);

        if (match) {
            const countryCode = match[1];
            const number = match[2];
            return `+${countryCode} ${number}`;
        }

        // No match → return original trimmed value
        return cleaned;
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            dispatch({
                type: CUSTOMER_ERROR,
                payload: "Please upload a valid Excel file (.xlsx or .xls)",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Read as array of arrays (raw rows)
                const jsonData = XLSX.utils.sheet_to_json(sheet, {
                    defval: "",
                    header: 1, // get as array of arrays
                    blankrows: false,
                });

                if (jsonData.length <= 1) {
                    dispatch({ type: CUSTOMER_ERROR, payload: "Excel file contains no data rows" });
                    return;
                }

                // Filter out rows that look like the sample/reference row
                const dataRows = jsonData.slice(1).filter((row) => {
                    if (!row || row.length < 6) return false; // too short to be valid

                    const firstName = (row[1] || "").toString().trim().toLowerCase();
                    const lastName = (row[3] || "").toString().trim().toLowerCase();
                    const mobileRaw = (row[4] || "").toString().trim().replace(/\D/g, ""); // digits only
                    const email = (row[5] || "").toString().trim().toLowerCase();

                    // Characteristics of your sample row
                    const isLikelySample =
                        firstName === "a" ||
                        firstName.includes("example") ||
                        firstName === "" ||
                        lastName === "b" ||
                        lastName.includes("example") ||
                        mobileRaw.includes("1111111111") ||
                        mobileRaw === "911111111111" ||
                        mobileRaw === "1111111111" ||
                        email === "ab@gmail.com" ||
                        email.includes("example") ||
                        (email.includes("@gmail.com") && firstName === ""); // very generic catch

                    return !isLikelySample;
                });

                if (dataRows.length === 0) {
                    dispatch({ type: CUSTOMER_ERROR, payload: "No valid data rows found (only sample/example row detected)" });
                    return;
                }

                // Convert filtered rows to your object format
                const formattedData = dataRows.map((row) => ({
                    Salutation: row[0] || "",
                    "First Name": row[1] || "",
                    "Middle Name": row[2] || "",
                    "Last Name": row[3] || "",
                    Mobile: formatMobileForDb(row[4]), // ← CHANGED HERE
                    Email: row[5] || "",
                    "Company Name": row[6] || "",
                    "Customer Category": row[7] || "",
                    Industry: row[8] || "",
                    Designation: row[9] || "",
                    "Lead Source": row[10] || "",
                    "GSTIN No": row[11] || "",
                    "Billing Street": row[12] || "",
                    "Billing City": row[13] || "",
                    "Billing State": row[14] || "",
                    "Billing Pincode": row[15]?.toString() || "",
                    "Billing Country": row[16] || "",
                    "Shipping Street": row[17] || "",
                    "Shipping City": row[18] || "",
                    "Shipping State": row[19] || "",
                    "Shipping Pincode": row[20]?.toString() || "",
                    "Shipping Country": row[21] || "",
                }));

                // Dispatch to backend
                dispatch(importCustomers(formattedData));
            } catch (err) {
                console.error("Excel parse error:", err);
                dispatch({
                    type: CUSTOMER_ERROR,
                    payload: "Failed to read Excel file. Please check format.",
                });
            }
        };

        reader.readAsBinaryString(file);
    };

    const formatEmployeeName = (emp) => {
        if (!emp) return "";
        const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
        return `${fullName}`;
    };

    // ✅ Added fromDate & toDate
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        email: "",
        assignedTo: [],
    });

    const [addContactOpen, setAddContactOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const [contactForm, setContactForm] = useState({
        salutation: "",
        firstName: "",
        middleName: "",
        lastName: "",
        selectedPhoneCode: "+91",
        mobile: "",
        email: "",
        tag: "",
        designation: "",
    });

    const [contactErrors, setContactErrors] = useState({});

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // ✅ Apply date range filter using createdAt
    const filteredCustomers = customers.filter((cus) => {
        const createdAt = cus.createdAt ? new Date(cus.createdAt) : null;
        if (!createdAt) return false;

        // Normalize createdAt to start-of-day in local time
        const cusDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());

        // From Date → start of the day
        const fromDate = filters.fromDate
            ? new Date(new Date(filters.fromDate).getFullYear(), new Date(filters.fromDate).getMonth(), new Date(filters.fromDate).getDate())
            : null;

        // To Date → end of the day (23:59:59.999)
        const toDate = filters.toDate
            ? new Date(
                  new Date(filters.toDate).getFullYear(),
                  new Date(filters.toDate).getMonth(),
                  new Date(filters.toDate).getDate(),
                  23,
                  59,
                  59,
                  999,
              )
            : null;

        const matchesFromDate = fromDate ? cusDate >= fromDate : true;
        const matchesToDate = toDate ? cusDate <= toDate : true;

        const fullName = `${cus.salutation || ""} ${cus.firstName || ""} ${cus.middleName || ""} ${cus.lastName || ""}`.trim();

        const matchesCompany = filters.company ? cus.companyName?.toLowerCase().includes(filters.company.toLowerCase()) : true;

        const matchesCustomer = filters.customer ? fullName.toLowerCase().includes(filters.customer.toLowerCase()) : true;

        const matchesMobile = filters.mobile ? cus.mobile?.includes(filters.mobile) : true;
        const matchesEmail = filters.email ? cus.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        const matchesAssignedTo =
            filters.assignedTo.length > 0
                ? filters.assignedTo.some((selectedEmp) => {
                      const empName = formatEmployeeName(selectedEmp);
                      if (Array.isArray(cus.assignedTo)) {
                          return cus.assignedTo.some((name) => name.toLowerCase().includes(empName.toLowerCase()));
                      }
                      return (cus.assignedTo || "").toLowerCase().includes(empName.toLowerCase());
                  })
                : true;

        return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail && matchesAssignedTo;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredCustomers.length);
            setCurrentPage(1);
        } else {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
        }
    };

    // const handleCallClick = (mobile) => {
    //     if (!mobile) return;

    //     const cleanedMobile = mobile.replace(/\D/g, ""); // removes spaces/symbols
    //     window.location.href = `tel:${cleanedMobile}`;
    // };
    const handleCallClick = (mobile) => {
        if (!mobile?.trim()) return;

        // Remove only whitespace — keep + and digits
        const cleaned = mobile.replace(/\s+/g, "");

        // Very basic validation
        if (!cleaned.match(/^\+\d{8,15}$/)) {
            console.warn("Possibly invalid number for tel: URI →", cleaned);
            // You can still proceed, most dialers are forgiving
        }

        window.location.href = `tel:${cleaned}`;
    };

    const handleWhatsAppClick = (mobile, name) => {
        if (!mobile) return;

        const message = `Hello ${name},`; // default message
        const encodedMessage = encodeURIComponent(message);

        // Remove spaces or extra characters from number
        const cleanedMobile = mobile.replace(/\D/g, "");

        // WhatsApp API URL
        const whatsappURL = `https://wa.me/${cleanedMobile}?text=${encodedMessage}`;

        window.open(whatsappURL, "_blank");
    };

    const handleAddContacts = (customerId) => {
        setSelectedCustomerId(customerId);
        setAddContactOpen(true);
        // Reset form
        setContactForm({
            salutation: "",
            firstName: "",
            middleName: "",
            lastName: "",
            selectedPhoneCode: "+91",
            mobile: "",
            email: "",
            tag: "",
            designation: "",
        });
        setContactErrors({});
    };

    const handleContactChange = (field) => (e) => {
        const value = e.target.value;
        setContactForm((prev) => ({ ...prev, [field]: value }));
        setContactErrors((prev) => ({ ...prev, [field]: false }));
    };

    const validateContact = () => {
        let tempErrors = {};
        let hasError = false;

        const required = {
            salutation: "Salutation",
            firstName: "First Name",
            lastName: "Last Name",
            selectedPhoneCode: "Phone Code",
            mobile: "Mobile",
            email: "Email",
        };

        for (const [key, label] of Object.entries(required)) {
            if (!contactForm[key]?.trim()) {
                tempErrors[key] = true;
                hasError = true;
            }
        }

        if (hasError) {
            setContactErrors(tempErrors);
            dispatch({
                type: CUSTOMER_ERROR,
                payload: "Please fill all required fields.",
            });
            return false;
        }

        // Mobile: exactly 10 digits
        if (!/^[0-9]{10}$/.test(contactForm.mobile)) {
            tempErrors.mobile = true;
            setContactErrors(tempErrors);
            dispatch({
                type: CUSTOMER_ERROR,
                payload: "Mobile number must be exactly 10 digits",
            });
            return false;
        }

        // Email format
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contactForm.email)) {
            tempErrors.email = true;
            setContactErrors(tempErrors);
            dispatch({
                type: CUSTOMER_ERROR,
                payload: "Enter a valid email address",
            });
            return false;
        }

        return true;
    };

    const handleAddContactSubmit = () => {
        if (!validateContact()) return;

        const data = {
            salutation: contactForm.salutation,
            firstName: contactForm.firstName,
            middleName: contactForm.middleName,
            lastName: contactForm.lastName,
            mobile: `${contactForm.selectedPhoneCode} ${contactForm.mobile}`.trim(),
            email: contactForm.email,
            tag: contactForm.tag,
            designation: contactForm.designation,
        };

        dispatch(addCustomerContact(selectedCustomerId, data));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentCustomers.map((c) => c.id);
            setSelectedCustomerIds(allIds);
        } else {
            setSelectedCustomerIds([]);
        }
    };

    const handleSelectOne = (id) => (e) => {
        if (e.target.checked) {
            setSelectedCustomerIds((prev) => [...prev, id]);
        } else {
            setSelectedCustomerIds((prev) => prev.filter((cid) => cid !== id));
        }
    };

    const handleBulkAssignOpen = () => {
        setSelectedEmployees([]);
        setBulkAssignModalOpen(true);
    };

    const handleBulkAssignSubmit = () => {
        if (selectedEmployees.length === 0) {
            dispatch({
                type: CUSTOMER_ERROR,
                payload: "Please select at least one employee",
            });
            return;
        }

        const employeeIds = selectedEmployees.map((emp) => emp.id);
        dispatch(bulkAssignCustomers(selectedCustomerIds, employeeIds));

        // Reset
        setBulkAssignModalOpen(false);
        setSelectedCustomerIds([]);
        setSelectedEmployees([]);
    };

    useEffect(() => {
        if (snackbarMessage) {
            // Close modal ONLY on success for contact addition
            if (snackbarSeverity === "success" && snackbarMessage.includes("Contact added successfully")) {
                setAddContactOpen(false);
                // Reset form on success
                setContactForm({
                    salutation: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    selectedPhoneCode: "",
                    mobile: "",
                    email: "",
                    tag: "",
                    designation: "",
                });
                setContactErrors({});
            }
        }
    }, [snackbarMessage, snackbarSeverity]);

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    {/* HEADER */}
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Enquiry Detail's :</div>
                        <Button
                            onClick={handleCreateClick}
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <UserRound size={20} />
                            Create New Enquiry
                        </Button>
                    </div>

                    <div className="mt-4 rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 p-6 text-center">
                        <div className="mb-4 text-lg font-medium text-gray-700">Import Customers from Excel</div>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {/* Download Template */}
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 text-nowrap rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm text-blue-700 hover:bg-blue-50 md:text-sm lg:text-base"
                            >
                                <File size={18} />
                                Download Sample Excel
                            </button>

                            {/* Upload File */}
                            <label className="flex cursor-pointer items-center gap-2 text-nowrap rounded-lg bg-[#053054] px-5 py-2.5 text-sm text-white hover:bg-[#04243f] md:text-sm lg:text-base">
                                <File size={18} />
                                Import Excel File
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>

                        <p className="mt-3 text-sm text-gray-500">Supported format: .xlsx, .xls • Max size: 5MB</p>
                    </div>

                    <div className="flex items-center justify-between px-2 py-3">
                        <div className="flex items-center gap-4">
                            {selectedCustomerIds.length > 0 && (
                                <Button
                                    variant="gradient"
                                    className="bg-[#2563EB] px-4 py-2 text-sm capitalize"
                                    onClick={handleBulkAssignOpen}
                                >
                                    Bulk Assign ({selectedCustomerIds.length})
                                </Button>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">...</span>
                    </div>

                    {/* ===== Filter Box ===== */}
                    <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
                        <Typography
                            variant="subtitle1"
                            className="mb-2 font-semibold text-[#053054]"
                        >
                            Filters
                        </Typography>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {/* ✅ Date Filters */}
                            <TextField
                                label="From Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={filters.fromDate}
                                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                            />
                            <TextField
                                label="To Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={filters.toDate}
                                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                            />

                            {/* Existing Filters */}
                            <TextField
                                label="Company Name"
                                size="small"
                                value={filters.company}
                                onChange={(e) => handleFilterChange("company", e.target.value)}
                            />
                            <TextField
                                label="Customer Name"
                                size="small"
                                value={filters.customer}
                                onChange={(e) => handleFilterChange("customer", e.target.value)}
                            />
                            <TextField
                                label="Mobile No"
                                size="small"
                                value={filters.mobile}
                                onChange={(e) => handleFilterChange("mobile", e.target.value)}
                            />
                            <TextField
                                label="Email Id"
                                size="small"
                                value={filters.email}
                                onChange={(e) => handleFilterChange("email", e.target.value)}
                            />
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={employees.filter((emp) => !filters.assignedTo.some((selected) => selected.id === emp.id))}
                                getOptionLabel={(option) => formatEmployeeName(option)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={filters.assignedTo}
                                onChange={(e, newValue) => {
                                    handleFilterChange("assignedTo", newValue || []);
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip
                                                key={key}
                                                variant="outlined"
                                                label={formatEmployeeName(option)}
                                                {...tagProps}
                                            />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Assigned To"
                                        size="small"
                                        placeholder={filters.assignedTo.length === 0 ? "Select employees" : ""}
                                    />
                                )}
                                className="w-full"
                                loading={!employees?.length}
                            />
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {/* Show Entries Dropdown */}
                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Show</span>
                                <select
                                    value={rowsPerPage === filteredCustomers.length ? "All" : rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#053054]"
                                >
                                    <option value={5}>5</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value="All">All</option>
                                </select>
                                <span className="text-sm text-gray-700">entries</span>
                            </div>
                            <span className="text-xs text-gray-500">
                                Page {currentPage} of {Math.ceil(filteredCustomers.length / rowsPerPage) || 1}
                            </span>
                        </div>

                        {/* Table */}
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        {/* <th className="table-head border border-gray-300 capitalize">Sr. No.</th> */}
                                        <th className="table-head w-24 border border-gray-300">
                                            <div className="flex items-center gap-2 pl-2">
                                                <input
                                                    type="checkbox"
                                                    checked={currentCustomers.length > 0 && selectedCustomerIds.length === currentCustomers.length}
                                                    onChange={handleSelectAll}
                                                    className="h-3 w-3 rounded border-gray-300 text-[#053054] focus:ring-[#053054]"
                                                />
                                                <span className="font-semibold">Sr. No.</span>
                                            </div>
                                        </th>
                                        <th className="table-head border border-gray-300 capitalize">Company Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Customer Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Mobile</th>
                                        <th className="table-head border border-gray-300 capitalize">Email</th>
                                        <th className="table-head border border-gray-300 capitalize">Assigned To</th>
                                        <th className="table-head border border-gray-300 capitalize">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {currentCustomers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No customers data added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentCustomers.map((cus, index) => {
                                            const fullName =
                                                `${cus.salutation || ""} ${cus.firstName || ""} ${cus.middleName || ""} ${cus.lastName || ""}`.trim();
                                            return (
                                                <tr
                                                    key={cus.id}
                                                    className="table-row"
                                                >
                                                    {/* <td className="table-cell border border-gray-300">{startIndex + index + 1}</td> */}
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-3 pl-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCustomerIds.includes(cus.id)}
                                                                onChange={handleSelectOne(cus.id)}
                                                                className="h-3 w-3 rounded border-gray-300 text-[#053054] focus:ring-[#053054]"
                                                            />
                                                            <span>{startIndex + index + 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="table-cell border border-gray-300">{cus.companyName || "-----"}</td>
                                                    <td className="table-cell border border-gray-300">{fullName}</td>
                                                    <td className="table-cell border border-gray-300">{cus.mobile}</td>
                                                    <td className="table-cell border border-gray-300">{cus.email}</td>
                                                    <td className="table-cell border border-gray-300">
                                                        {Array.isArray(cus.assignedTo) && cus.assignedTo.length > 0
                                                            ? cus.assignedTo.map((a, i) => (
                                                                  <div key={i}>
                                                                      {i + 1}) {a}
                                                                  </div>
                                                              ))
                                                            : "-"}
                                                    </td>
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-x-4">
                                                            <button
                                                                className="text-orange-500"
                                                                onClick={() => handleAddContacts(cus.id)}
                                                                title="Add Contacts"
                                                            >
                                                                <BadgePlus size={20} />
                                                            </button>
                                                            <button
                                                                className="text-blue-500"
                                                                onClick={() => handleEditClick(cus.id)}
                                                            >
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button
                                                                className="text-red-500"
                                                                onClick={() => handleDeleteClick(cus.id)}
                                                            >
                                                                <Trash size={20} />
                                                            </button>
                                                            <button
                                                                className="text-purple-500"
                                                                onClick={() => handleViewClick(cus.id)}
                                                            >
                                                                <File size={20} />
                                                            </button>
                                                            <button
                                                                className="text-blue-600"
                                                                onClick={() => handleCallClick(cus.mobile)}
                                                            >
                                                                <PhoneCall size={22} />
                                                            </button>
                                                            <button
                                                                className="text-green-600"
                                                                onClick={() =>
                                                                    handleWhatsAppClick(
                                                                        cus.mobile,
                                                                        `${cus.salutation || ""} ${cus.firstName || ""} ${cus.middleName || ""} ${cus.lastName || ""}`.trim(),
                                                                    )
                                                                }
                                                            >
                                                                <FaWhatsapp size={22} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ✅ Pagination Controls */}
                    {filteredCustomers.length > rowsPerPage && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredCustomers.length)} of{" "}
                                {filteredCustomers.length}
                            </span>
                            <div className="flex items-center gap-3">
                                <IconButton
                                    variant="text"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                    className="flex items-center rounded-full"
                                >
                                    <ChevronLeft />
                                </IconButton>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
                                    {currentPage}
                                </div>

                                <IconButton
                                    variant="text"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    className="flex items-center rounded-full"
                                >
                                    <ChevronRight />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Confirm Delete
                        </Typography>
                        <IconButton
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this enquiry?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={confirmDelete}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Add Contact Modal */}
            <Modal
                open={addContactOpen}
                onClose={() => setAddContactOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Add New Contact
                        </Typography>
                        <IconButton
                            onClick={() => setAddContactOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Autocomplete
                            options={salutations.map((s) => s.salutation)}
                            value={contactForm.salutation || null}
                            onChange={(e, newValue) => {
                                setContactForm((prev) => ({ ...prev, salutation: newValue || "" }));
                                setContactErrors((prev) => ({ ...prev, salutation: false }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Salutation *"
                                    error={contactErrors.salutation}
                                    size="small"
                                />
                            )}
                        />

                        <TextField
                            label="First Name *"
                            value={contactForm.firstName}
                            onChange={handleContactChange("firstName")}
                            error={contactErrors.firstName}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Middle Name"
                            value={contactForm.middleName}
                            onChange={handleContactChange("middleName")}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Last Name *"
                            value={contactForm.lastName}
                            onChange={handleContactChange("lastName")}
                            error={contactErrors.lastName}
                            size="small"
                            fullWidth
                        />

                        {/* Phone Code + Mobile */}
                        <Autocomplete
                            options={countryCode.map((c) => c.phoneCode)}
                            value={contactForm.selectedPhoneCode || null}
                            onChange={(e, newValue) => {
                                setContactForm((prev) => ({ ...prev, selectedPhoneCode: newValue || "" }));
                                setContactErrors((prev) => ({ ...prev, selectedPhoneCode: false }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Code *"
                                    error={contactErrors.selectedPhoneCode}
                                    size="small"
                                />
                            )}
                        />

                        <TextField
                            label="Mobile *"
                            placeholder="7385363401"
                            value={contactForm.mobile}
                            onChange={handleContactChange("mobile")}
                            error={contactErrors.mobile}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Email *"
                            value={contactForm.email}
                            onChange={handleContactChange("email")}
                            error={contactErrors.email}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Tag"
                            value={contactForm.tag}
                            onChange={handleContactChange("tag")}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Designation"
                            value={contactForm.designation}
                            onChange={handleContactChange("designation")}
                            size="small"
                            fullWidth
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setAddContactOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                            onClick={handleAddContactSubmit}
                        >
                            Add Contact
                        </Button>
                    </div>
                </Box>
            </Modal>

            <Modal
                open={bulkAssignModalOpen}
                onClose={() => setBulkAssignModalOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Bulk Assign Employees
                        </Typography>
                        <IconButton onClick={() => setBulkAssignModalOpen(false)}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="text-sm text-gray-600">Selected enquiries: {selectedCustomerIds.length}</Typography>

                    <Autocomplete
                        multiple
                        options={employees}
                        getOptionLabel={formatEmployeeName}
                        value={selectedEmployees}
                        onChange={(e, newValue) => setSelectedEmployees(newValue)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    key={option.id}
                                    label={formatEmployeeName(option)}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Assign to employees"
                                placeholder="Select employees"
                                size="small"
                            />
                        )}
                        className="mt-5"
                    />

                    <div className="mt-6 flex justify-end gap-4">
                        <Button
                            variant="gradient"
                            className="bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setBulkAssignModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            className="bg-[#053054] px-4 py-2 capitalize text-white"
                            onClick={handleBulkAssignSubmit}
                            disabled={selectedEmployees.length === 0}
                        >
                            Assign
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Snackbar */}
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

export default Enquiry;
