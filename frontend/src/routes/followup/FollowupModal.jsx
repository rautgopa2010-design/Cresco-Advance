// import React, { useState } from "react";
// import { Box, Modal, TextField, IconButton, MenuItem, Snackbar, Alert } from "@mui/material";
// import { X } from "lucide-react";
// import { Button } from "@material-tailwind/react";
// import { RiUserFollowLine } from "react-icons/ri";
// import FollowupModalTable from "./FollowupModalTable";

// const FollowupModal = ({ open, onClose, followup }) => {
//     const formatDate = (dateStr) => {
//         return dateStr;
//     };

//     const [leadStage, setLeadStage] = useState("");
//     const [leadStatus, setLeadStatus] = useState("");
//     const [nextFollowUpDate, setNextFollowUpDate] = useState("");
//     const [description, setDescription] = useState("");
//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const handleSubmit = () => {
//         const newErrors = {};

//         if (!leadStage) newErrors.leadStage = true;
//         if (!leadStatus) newErrors.leadStatus = true;
//         if (!nextFollowUpDate) newErrors.nextFollowUpDate = true;
//         if (!description) newErrors.description = true;

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             setSnackbarMessage("Please fill all required fields");
//             setSnackbarOpen(true);
//             return;
//         }

//         const today = new Date();
//         const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

//         const followupModalData = {
//             date: formattedDate,
//             assignedTo: Array.isArray(followup?.assignedTo) ? followup.assignedTo.join(", ") : followup?.assignedTo || "",
//             leadNo: followup?.leadNo || "",
//             customerName: followup?.customerPerson || "",
//             leadStage,
//             leadStatus,
//             nextFollowUpDate,
//             description,
//             products: productList.map((product) => ({
//                 hsnCode: product.hsnCode || "",
//                 product: product.product || "",
//                 quantity: product.quantity || "",
//                 total: product.total || ""
//             }))
//         };

//         console.log("Submitted Follow-Up:", followupModalData);

//         const leadNoKey = `followupModal_${followupModalData.leadNo}`;
//         const existingFollowups = JSON.parse(localStorage.getItem(leadNoKey)) || [];
//         existingFollowups.push(followupModalData);
//         localStorage.setItem(leadNoKey, JSON.stringify(existingFollowups));

//         setSnackbarMessage("Follow-Up added successfully");
//         setSnackbarOpen(true);
//         setErrors({});

//         // Clear fields
//         setLeadStage("");
//         setLeadStatus("");
//         setNextFollowUpDate("");
//         setDescription("");

//         // Close modal after 1 second
//         setTimeout(() => {
//             onClose();
//         }, 1000);
//     };

//     const productList =
//         followup?.productDetails?.intrastate?.length > 0 ? followup.productDetails.intrastate : followup?.productDetails?.interstate || [];

//     return (
//         <>
//             <Modal
//                 open={open}
//                 onClose={onClose}
//             >
//                 <Box
//                     className="relative max-h-[90vh] w-[90%] overflow-y-auto rounded-lg bg-white p-5 shadow-lg outline-none md:w-[600px] lg:w-[800px]"
//                     sx={{
//                         position: "absolute",
//                         top: "50%",
//                         left: "50%",
//                         transform: "translate(-50%, -50%)",
//                         boxShadow: 24,
//                     }}
//                 >
//                     <div className="mb-4 flex items-center justify-between border-b pb-2">
//                         <h2 className="text-lg font-semibold text-[#433C50]">Lead Details :</h2>
//                         <IconButton onClick={onClose}>
//                             <X size={22} />
//                         </IconButton>
//                     </div>

//                     <div>
//                         <div className="flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <TextField
//                                 label="Date"
//                                 value={formatDate(followup?.followupDate || "")}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                             <TextField
//                                 label="Assigned To"
//                                 value={Array.isArray(followup?.assignedTo) ? followup.assignedTo.join(", ") : followup?.assignedTo || ""}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                         </div>

//                         <div className="mt-4 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <TextField
//                                 label="Lead No"
//                                 value={followup?.leadNo || ""}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                             <TextField
//                                 label="Customer Name"
//                                 value={followup?.customerPerson || ""}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                         </div>

//                         {/* Product List Rendering */}
//                         {productList.length > 0 &&
//                             productList.map((item, index) => (
//                                 <div
//                                     className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
//                                     key={index}
//                                 >
//                                     <TextField
//                                         label="Product"
//                                         value={item.product || ""}
//                                         fullWidth
//                                         InputProps={{ readOnly: true }}
//                                         size="small"
//                                     />
//                                     <TextField
//                                         label="HSN Code"
//                                         value={item.hsnCode || ""}
//                                         fullWidth
//                                         InputProps={{ readOnly: true }}
//                                         size="small"
//                                     />
//                                     <TextField
//                                         label="Quantity"
//                                         value={item.quantity || ""}
//                                         fullWidth
//                                         InputProps={{ readOnly: true }}
//                                         size="small"
//                                     />
//                                     <TextField
//                                         label="Total Cost"
//                                         value={item.total || ""}
//                                         fullWidth
//                                         InputProps={{ readOnly: true }}
//                                         size="small"
//                                     />
//                                 </div>
//                             ))}
//                     </div>

//                     {/* Follow-Up Fields */}
//                     <div className="mt-4">
//                         <div className="text-lg font-semibold text-[#433C50]">Follow-Up Details :</div>
//                         <div className="mt-2 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <TextField
//                                 select
//                                 label="Lead Stage *"
//                                 fullWidth
//                                 size="small"
//                                 value={leadStage}
//                                 onChange={(e) => setLeadStage(e.target.value)}
//                                 error={errors.leadStage}
//                             >
//                                 <MenuItem value="Quotation Send">Quotation Send</MenuItem>
//                             </TextField>

//                             <TextField
//                                 select
//                                 label="Lead Status *"
//                                 fullWidth
//                                 size="small"
//                                 value={leadStatus}
//                                 onChange={(e) => setLeadStatus(e.target.value)}
//                                 error={errors.leadStatus}
//                             >
//                                 <MenuItem value="Prospect">Prospect</MenuItem>
//                             </TextField>
//                         </div>

//                         <div className="mt-4">
//                             <p className="text-sm text-[#433C50]">Next Follow-Up Date :</p>
//                             <TextField
//                                 size="small"
//                                 type="date"
//                                 className="w-48 md:w-56 lg:w-60"
//                                 value={nextFollowUpDate ? nextFollowUpDate.split("-").reverse().join("-") : ""}
//                                 onChange={(e) => {
//                                     const inputDate = e.target.value; // YYYY-MM-DD
//                                     if (inputDate) {
//                                         const [year, month, day] = inputDate.split("-");
//                                         setNextFollowUpDate(`${day}-${month}-${year}`); // Store as dd-mm-yyyy
//                                     } else {
//                                         setNextFollowUpDate("");
//                                     }
//                                 }}
//                                 error={errors.nextFollowUpDate}
//                             />
//                         </div>

//                         <div className="mt-4">
//                             <TextField
//                                 label="Description *"
//                                 placeholder="Description"
//                                 multiline
//                                 minRows={2}
//                                 fullWidth
//                                 size="small"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                                 error={errors.description}
//                             />
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="mt-4 flex justify-start">
//                         <Button
//                     onClick={handleSubmit}
//                     variant="gradient"
//                     className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                 >
//                     <RiUserFollowLine size={20} />
//                     Add Follow Up
//                 </Button>
//                     </div>

//                     <FollowupModalTable leadNo={followup?.leadNo} />

//                     <div className="mt-10 flex justify-end">
//                         <Button
//                             onClick={onClose}
//                             className="rounded bg-[#4B4B4B] px-6 py-2 capitalize text-white md:text-base"
//                         >
//                             Close
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

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

// export default FollowupModal;


// import React, { useEffect, useState } from "react";
// import { Modal, Box, TextField, Snackbar, Alert, IconButton, CircularProgress, Autocomplete, Chip } from "@mui/material";
// import { Button } from "@material-tailwind/react";
// import { useDispatch, useSelector } from "react-redux";
// import { X } from "lucide-react";
// import { RiUserFollowLine } from "react-icons/ri";
// import { clearSnackbar } from "../../redux/actions/commonActions";
// import { addFollowup, deleteFollowup, updateFollowup } from "../../redux/actions/leadAndFollowup";
// import { getLeadStage } from "../../redux/actions/leadStage";
// import { getLeadStatus } from "../../redux/actions/leadStatus";
// import { getRoles } from "../../redux/actions/rbac";
// import { getEmployees } from "../../redux/actions/employee";
// import FollowupModalTable from "./FollowupModalTable";
// import { FOLLOWUP_ERROR, FOLLOWUP_SUCCESS } from "../../redux/types";

// const FollowupModal = ({ open, onClose, followup, onFollowupAdded }) => {
//     const dispatch = useDispatch();

//     const getTodayDate = () => {
//         const today = new Date();
//         const dd = String(today.getDate()).padStart(2, "0");
//         const mm = String(today.getMonth() + 1).padStart(2, "0");
//         const yyyy = today.getFullYear();
//         return `${dd}-${mm}-${yyyy}`;
//     };

//     const { leadStage } = useSelector((state) => state.leadStage);
//     const { leadStatus } = useSelector((state) => state.leadStatus);
//     const { roles } = useSelector((state) => state.rbac);
//     const { employees } = useSelector((state) => state.employee);
//     const { snackbarMessage, snackbarSeverity, followupLoading, leads } = useSelector((state) => state.leadAndFollowup);

//     const [leadStageValue, setLeadStageValue] = useState("");
//     const [leadStatusValue, setLeadStatusValue] = useState("");
//     const [nextFollowUpDate, setNextFollowUpDate] = useState(getTodayDate());
//     const [description, setDescription] = useState("");
//     const [assignedTo, setAssignedTo] = useState([]);
//     const [communicatedWith, setCommunicatedWith] = useState("");
//     const [additionalProducts, setAdditionalProducts] = useState("");
//     const [editingFollowup, setEditingFollowup] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [justSubmitted, setJustSubmitted] = useState(false);

//     useEffect(() => {
//         dispatch(clearSnackbar());
//         dispatch(getLeadStage());
//         dispatch(getLeadStatus());
//         dispatch(getRoles());
//         dispatch(getEmployees());
//     }, [dispatch]);

//     useEffect(() => {
//         if (justSubmitted && snackbarMessage) {
//             if (snackbarSeverity === "success" && snackbarMessage.includes("successfully")) {
//                 resetForm();
//                 setTimeout(() => {
//                     setJustSubmitted(false);
//                     dispatch(clearSnackbar());
//                     if (onFollowupAdded) onFollowupAdded();
//                     onClose();
//                 }, 1000);
//             } else {
//                 setJustSubmitted(false);
//             }
//         }
//     }, [snackbarMessage, snackbarSeverity, justSubmitted, dispatch, onClose, onFollowupAdded]);

//     useEffect(() => {
//         if (open) {
//             const thisLead = leads?.find(l => String(l.id || l.leadId) === String(followup?.leadId));
//             console.log("→ This lead from Redux leads:", thisLead);
//         }
//     }, [open, leads, followup?.leadId]);

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         dispatch(clearSnackbar());
//     };

//     const formatEmployeeName = (emp) => {
//         const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
//         const fullName = parts.filter((part) => part && part.trim()).join(" ");
//         const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
//         return `${fullName} (${roleName})`;
//     };

//     // Prefill Assigned To
//     useEffect(() => {
//         if (followup?.assignedTo && employees?.length) {
//             const prefilledAssigned = followup.assignedTo
//                 .map((name) => {
//                     return employees.find((emp) => {
//                         const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
//                         return fullName === name;
//                     });
//                 })
//                 .filter(Boolean);
//             setAssignedTo(prefilledAssigned);
//         }
//     }, [followup, employees]);

//     // ✅ Reset Form Function
//     const resetForm = () => {
//         setLeadStageValue("");
//         setLeadStatusValue("");
//         setNextFollowUpDate(getTodayDate());
//         setDescription("");
//         setEditingFollowup(null);
//         setCommunicatedWith("");
//         setAdditionalProducts("");
//         setErrors({});
//     };

//     // ✅ Submit (Add or Update)
//     const handleSubmit = () => {
//         const newErrors = {};
//         if (!leadStageValue) newErrors.leadStage = true;
//         if (!leadStatusValue) newErrors.leadStatus = true;
//         if (!nextFollowUpDate) newErrors.nextFollowUpDate = true;
//         if (!description) newErrors.description = true;

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             dispatch({
//                 type: FOLLOWUP_ERROR,
//                 payload: "Please fill all required fields.",
//             });
//             return;
//         }

//         const dataToSend = {
//             leadStage: leadStageValue,
//             leadStatus: leadStatusValue,
//             nextFollowUpDate,
//             followup_desc: description,
//             lead_id: followup?.leadId,
//             assignedTo: assignedTo.map((emp) => emp.id),
//             communicatedWith,
//             additionalProducts,
//         };

//         setJustSubmitted(true);

//         if (editingFollowup) {
//             // ✅ Update existing follow-up
//             dispatch(updateFollowup(editingFollowup.id, dataToSend));
//         } else {
//             // ✅ Add new follow-up
//             dispatch(addFollowup(dataToSend));
//         }
//     };

//     // ✅ Called when clicking Edit icon from table
//     const handleEditFollowup = (item) => {
//         setEditingFollowup(item);
//         setLeadStageValue(item.leadStage || "");
//         setLeadStatusValue(item.leadStatus || "");
//         setDescription(item.followup_desc || "");
//         setNextFollowUpDate(item.nextFollowUpDate || getTodayDate());
//         setCommunicatedWith(item.communicatedWith || "");
//         setAdditionalProducts(item.additionalProducts || "");

//         if (employees?.length) {
//             prefillAssignedTo(item);
//         } else {
//             // Wait for employees to load
//             const interval = setInterval(() => {
//                 if (employees?.length) {
//                     prefillAssignedTo(item);
//                     clearInterval(interval);
//                 }
//             }, 200);
//             setTimeout(() => clearInterval(interval), 3000); // safety clear
//         }
//     };

//     // Helper to prefill assignedTo list
//     const prefillAssignedTo = (item) => {
//         const assignedNames = Array.isArray(item.assignedTo) ? item.assignedTo : item.assignedTo?.split(",") || [];

//         const prefilled = assignedNames
//             .map((name) => {
//                 const trimmedName = name.trim();
//                 return employees.find((emp) => {
//                     const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
//                     return fullName === trimmedName;
//                 });
//             })
//             .filter(Boolean);

//         setAssignedTo(prefilled);
//     };

//     useEffect(() => {
//         if (editingFollowup && employees?.length) {
//             prefillAssignedTo(editingFollowup);
//         }
//     }, [employees, editingFollowup]);

//     const handleDeleteFollowup = (followupId) => {
//         dispatch(deleteFollowup(followupId))
//             .then(() => {
//                 dispatch({
//                     type: FOLLOWUP_SUCCESS,
//                     payload: "Follow-up deleted successfully",
//                 });

//                 setTimeout(() => {
//                     if (onFollowupAdded) onFollowupAdded();
//                     onClose();
//                 }, 1200);
//             })
//             .catch(() => {
//                 dispatch({
//                     type: FOLLOWUP_ERROR,
//                     payload: "Failed to delete follow-up",
//                 });
//             });
//     };

//     const formatDate = (dateStr) => dateStr;

//     return (
//         <>
//             <Modal
//                 open={open}
//                 onClose={onClose}
//             >
//                 <Box
//                     className="relative max-h-[90vh] w-[90%] overflow-y-auto rounded-lg bg-white p-5 shadow-lg outline-none md:w-[600px] lg:w-[800px]"
//                     sx={{
//                         position: "absolute",
//                         top: "50%",
//                         left: "50%",
//                         transform: "translate(-50%, -50%)",
//                         boxShadow: 24,
//                     }}
//                 >
//                     <div className="mb-4 flex items-center justify-between border-b pb-2">
//                         <h2 className="text-lg font-semibold text-[#433C50]">{editingFollowup ? "Edit Follow-Up" : "Lead Details :"}</h2>
//                         <IconButton onClick={onClose}>
//                             <X size={22} />
//                         </IconButton>
//                     </div>

//                     {/* ===== FORM ===== */}
//                     <div>
//                         <div className="flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <TextField
//                                 label="Followup Date"
//                                 value={formatDate(followup?.followup_date || "")}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                             <Autocomplete
//                                 multiple
//                                 disableCloseOnSelect
//                                 options={employees.filter((emp) => !assignedTo.some((selected) => selected.id === emp.id))}
//                                 getOptionLabel={(option) => formatEmployeeName(option)}
//                                 isOptionEqualToValue={(option, value) => option.id === value.id}
//                                 value={assignedTo}
//                                 onChange={(e, newValue) => {
//                                     setAssignedTo(newValue || []); // newValue can be null
//                                     setErrors((prev) => ({
//                                         ...prev,
//                                         assignedTo: false,
//                                     }));
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
//                                         label="Assigned To *"
//                                         error={!!errors.assignedTo}
//                                         size="small"
//                                     />
//                                 )}
//                                 className="w-full"
//                                 loading={!employees?.length}
//                                 loadingIndicator={
//                                     <CircularProgress
//                                         color="inherit"
//                                         size={20}
//                                     />
//                                 }
//                             />
//                         </div>

//                         <div className="mt-4 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <TextField
//                                 label="Lead No"
//                                 value={followup?.leadId || ""}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                             <TextField
//                                 label="Customer Name"
//                                 value={followup?.customerPerson || ""}
//                                 fullWidth
//                                 InputProps={{ readOnly: true }}
//                                 size="small"
//                             />
//                         </div>
//                     </div>

//                     {/* ===== Follow-Up Form Fields ===== */}
//                     <div className="mt-4">
//                         <div className="text-lg font-semibold text-[#433C50]">Follow-Up Details :</div>
//                         <div className="mt-2 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <Autocomplete
//                                 disablePortal
//                                 options={leadStage?.map((option) => option.leadStage) || []}
//                                 value={leadStageValue || ""}
//                                 onChange={(e, newValue) => {
//                                     setLeadStageValue(newValue || "");
//                                     setErrors((prev) => ({ ...prev, leadStage: false }));
//                                 }}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Lead Stage *"
//                                         size="small"
//                                         error={!!errors.leadStage}
//                                     />
//                                 )}
//                                 className="w-full md:w-1/2"
//                                 clearOnEscape
//                             />

//                             <Autocomplete
//                                 disablePortal
//                                 options={leadStatus?.map((option) => option.leadStatus) || []}
//                                 value={leadStatusValue || ""}
//                                 onChange={(e, newValue) => {
//                                     setLeadStatusValue(newValue || "");
//                                     setErrors((prev) => ({ ...prev, leadStatus: false }));
//                                 }}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Lead Status *"
//                                         size="small"
//                                         error={!!errors.leadStatus}
//                                     />
//                                 )}
//                                 className="w-full md:w-1/2"
//                                 clearOnEscape
//                             />
//                         </div>

//                         <div className="mt-4 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
//                             <TextField
//                                 label="Communicated With"
//                                 size="small"
//                                 fullWidth
//                                 value={communicatedWith || ""}
//                                 onChange={(e) => setCommunicatedWith(e.target.value)}
//                                 placeholder="e.g. Mr. Rajesh, Purchase Manager"
//                             />

//                             <TextField
//                                 label="Additional Products"
//                                 size="small"
//                                 fullWidth
//                                 multiline
//                                 minRows={2}
//                                 value={additionalProducts || ""}
//                                 onChange={(e) => setAdditionalProducts(e.target.value)}
//                                 placeholder="e.g. Wooden pallets, Bubble wrap, Tape 2 inch"
//                             />
//                         </div>

//                         <div className="mt-4">
//                             <p className="text-sm text-[#433C50]">Next Follow-Up Date :</p>
//                             <TextField
//                                 size="small"
//                                 type="date"
//                                 className="w-48 md:w-56 lg:w-60"
//                                 value={
//                                     nextFollowUpDate
//                                         ? `${nextFollowUpDate.split("-")[2]}-${nextFollowUpDate.split("-")[1]}-${nextFollowUpDate.split("-")[0]}`
//                                         : ""
//                                 }
//                                 onChange={(e) => {
//                                     const [year, month, day] = e.target.value.split("-");
//                                     setNextFollowUpDate(`${day}-${month}-${year}`);
//                                 }}
//                                 error={errors.nextFollowUpDate}
//                             />
//                         </div>

//                         <div className="mt-4">
//                             <TextField
//                                 label="Description *"
//                                 multiline
//                                 minRows={2}
//                                 fullWidth
//                                 size="small"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                                 error={errors.description}
//                             />
//                         </div>
//                     </div>

//                     {/* ===== Buttons ===== */}
//                     <div className="mt-4 flex gap-3">
//                         <Button
//                             onClick={handleSubmit}
//                             disabled={followupLoading}
//                             variant="gradient"
//                             className={`flex items-center gap-2 rounded px-3 py-2 text-sm capitalize text-white ${editingFollowup ? "bg-green-600" : "bg-[#053054]"}`}
//                         >
//                             {followupLoading ? (
//                                 <CircularProgress
//                                     size={20}
//                                     color="inherit"
//                                 />
//                             ) : editingFollowup ? (
//                                 <>
//                                     <RiUserFollowLine size={20} />
//                                     Update Follow-Up
//                                 </>
//                             ) : (
//                                 <>
//                                     <RiUserFollowLine size={20} />
//                                     Add Follow-Up
//                                 </>
//                             )}
//                         </Button>

//                         {editingFollowup && (
//                             <Button
//                                 onClick={resetForm}
//                                 className="rounded bg-gray-500 px-3 py-2 text-sm capitalize text-white"
//                             >
//                                 Reset
//                             </Button>
//                         )}
//                     </div>

//                     {/* ===== Table ===== */}
//                     <FollowupModalTable
//                         leadNo={followup?.leadId}
//                         onDeleteFollowup={handleDeleteFollowup}
//                         onEditFollowup={handleEditFollowup}
//                     />

//                     <div className="mt-10 flex justify-end">
//                         <Button
//                             onClick={onClose}
//                             className="rounded bg-[#4B4B4B] px-6 py-2 capitalize text-white"
//                         >
//                             Close
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Snackbar */}
//             <Snackbar
//                 open={!!snackbarMessage}
//                 autoHideDuration={4000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={snackbarSeverity}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default FollowupModal;

import React, { useEffect, useState } from "react";
import { Modal, Box, TextField, Snackbar, Alert, IconButton, CircularProgress, Autocomplete, Chip } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { RiUserFollowLine } from "react-icons/ri";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { addFollowup, deleteFollowup, updateFollowup } from "../../redux/actions/leadAndFollowup";
import { getLeadStage } from "../../redux/actions/leadStage";
import { getLeadStatus } from "../../redux/actions/leadStatus";
import { getRoles } from "../../redux/actions/rbac";
import { getEmployees } from "../../redux/actions/employee";
import FollowupModalTable from "./FollowupModalTable";
import { FOLLOWUP_ERROR, FOLLOWUP_SUCCESS } from "../../redux/types";

const FollowupModal = ({ open, onClose, followup, onFollowupAdded }) => {
    const dispatch = useDispatch();

    const getTodayDate = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };

    const { leadStage } = useSelector((state) => state.leadStage);
    const { leadStatus } = useSelector((state) => state.leadStatus);
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);
    const { snackbarMessage, snackbarSeverity, followupLoading, leads } = useSelector((state) => state.leadAndFollowup);

    const [leadStageValue, setLeadStageValue] = useState("");
    const [leadStatusValue, setLeadStatusValue] = useState("");
    const [nextFollowUpDate, setNextFollowUpDate] = useState(getTodayDate());
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState([]);
    const [communicatedWith, setCommunicatedWith] = useState("");
    const [additionalProducts, setAdditionalProducts] = useState("");
    const [editingFollowup, setEditingFollowup] = useState(null);
    const [errors, setErrors] = useState({});
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [contactOptions, setContactOptions] = useState([]);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getLeadStage());
        dispatch(getLeadStatus());
        dispatch(getRoles());
        dispatch(getEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (justSubmitted && snackbarMessage) {
            if (snackbarSeverity === "success" && snackbarMessage.includes("successfully")) {
                resetForm();
                setTimeout(() => {
                    setJustSubmitted(false);
                    dispatch(clearSnackbar());
                    if (onFollowupAdded) onFollowupAdded();
                    onClose();
                }, 1000);
            } else {
                setJustSubmitted(false);
            }
        }
    }, [snackbarMessage, snackbarSeverity, justSubmitted, dispatch, onClose, onFollowupAdded]);

    useEffect(() => {
        if (open) {
            const thisLead = leads?.find(l => String(l.id || l.leadId) === String(followup?.leadId));
            console.log("→ This lead from Redux leads:", thisLead);
            
            // Generate contact options from customerPerson and customerContacts
            if (thisLead) {
                const options = [];
                
                // Add customerPerson if exists
                if (thisLead.customerPerson) {
                    options.push(thisLead.customerPerson);
                }
                
                // Add customerContacts
                if (thisLead.customerContacts && Array.isArray(thisLead.customerContacts)) {
                    thisLead.customerContacts.forEach(contact => {
                        // Format contact name with salutation
                        const nameParts = [
                            contact.salutation,
                            contact.firstName,
                            contact.middleName, // Include middleName if present
                            contact.lastName
                        ];
                        const fullName = nameParts.filter(part => part && part.trim()).join(" ");
                        
                        // Add designation if available
                        let contactDisplay = fullName;
                        if (contact.designation) {
                            contactDisplay += ` (${contact.designation})`;
                        }
                        
                        options.push(contactDisplay);
                    });
                }
                
                // Remove duplicates
                const uniqueOptions = [...new Set(options)];
                setContactOptions(uniqueOptions);
            }
        }
    }, [open, leads, followup?.leadId]);

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

    // Prefill Assigned To
    useEffect(() => {
        if (followup?.assignedTo && employees?.length) {
            const prefilledAssigned = followup.assignedTo
                .map((name) => {
                    return employees.find((emp) => {
                        const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
                        return fullName === name;
                    });
                })
                .filter(Boolean);
            setAssignedTo(prefilledAssigned);
        }
    }, [followup, employees]);

    // ✅ Reset Form Function
    const resetForm = () => {
        setLeadStageValue("");
        setLeadStatusValue("");
        setNextFollowUpDate(getTodayDate());
        setDescription("");
        setEditingFollowup(null);
        setCommunicatedWith("");
        setAdditionalProducts("");
        setErrors({});
    };

    // ✅ Submit (Add or Update)
    const handleSubmit = () => {
        const newErrors = {};
        if (!leadStageValue) newErrors.leadStage = true;
        if (!leadStatusValue) newErrors.leadStatus = true;
        if (!nextFollowUpDate) newErrors.nextFollowUpDate = true;
        if (!description) newErrors.description = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            dispatch({
                type: FOLLOWUP_ERROR,
                payload: "Please fill all required fields.",
            });
            return;
        }

        const dataToSend = {
            leadStage: leadStageValue,
            leadStatus: leadStatusValue,
            nextFollowUpDate,
            followup_desc: description,
            lead_id: followup?.leadId,
            assignedTo: assignedTo.map((emp) => emp.id),
            communicatedWith,
            additionalProducts,
        };

        setJustSubmitted(true);

        if (editingFollowup) {
            // ✅ Update existing follow-up
            dispatch(updateFollowup(editingFollowup.id, dataToSend));
        } else {
            // ✅ Add new follow-up
            dispatch(addFollowup(dataToSend));
        }
    };

    // ✅ Called when clicking Edit icon from table
    const handleEditFollowup = (item) => {
        setEditingFollowup(item);
        setLeadStageValue(item.leadStage || "");
        setLeadStatusValue(item.leadStatus || "");
        setDescription(item.followup_desc || "");
        setNextFollowUpDate(item.nextFollowUpDate || getTodayDate());
        setCommunicatedWith(item.communicatedWith || "");
        setAdditionalProducts(item.additionalProducts || "");

        if (employees?.length) {
            prefillAssignedTo(item);
        } else {
            // Wait for employees to load
            const interval = setInterval(() => {
                if (employees?.length) {
                    prefillAssignedTo(item);
                    clearInterval(interval);
                }
            }, 200);
            setTimeout(() => clearInterval(interval), 3000); // safety clear
        }
    };

    // Helper to prefill assignedTo list
    const prefillAssignedTo = (item) => {
        const assignedNames = Array.isArray(item.assignedTo) ? item.assignedTo : item.assignedTo?.split(",") || [];

        const prefilled = assignedNames
            .map((name) => {
                const trimmedName = name.trim();
                return employees.find((emp) => {
                    const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
                    return fullName === trimmedName;
                });
            })
            .filter(Boolean);

        setAssignedTo(prefilled);
    };

    useEffect(() => {
        if (editingFollowup && employees?.length) {
            prefillAssignedTo(editingFollowup);
        }
    }, [employees, editingFollowup]);

    const handleDeleteFollowup = (followupId) => {
        dispatch(deleteFollowup(followupId))
            .then(() => {
                dispatch({
                    type: FOLLOWUP_SUCCESS,
                    payload: "Follow-up deleted successfully",
                });

                setTimeout(() => {
                    if (onFollowupAdded) onFollowupAdded();
                    onClose();
                }, 1200);
            })
            .catch(() => {
                dispatch({
                    type: FOLLOWUP_ERROR,
                    payload: "Failed to delete follow-up",
                });
            });
    };

    const formatDate = (dateStr) => dateStr;

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
            >
                <Box
                    className="relative max-h-[90vh] w-[90%] overflow-y-auto rounded-lg bg-white p-5 shadow-lg outline-none md:w-[600px] lg:w-[800px]"
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        boxShadow: 24,
                    }}
                >
                    <div className="mb-4 flex items-center justify-between border-b pb-2">
                        <h2 className="text-lg font-semibold text-[#433C50]">{editingFollowup ? "Edit Follow-Up" : "Lead Details :"}</h2>
                        <IconButton onClick={onClose}>
                            <X size={22} />
                        </IconButton>
                    </div>

                    {/* ===== FORM ===== */}
                    <div>
                        <div className="flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
                            <TextField
                                label="Followup Date"
                                value={formatDate(followup?.followup_date || "")}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                size="small"
                            />
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                options={employees.filter((emp) => !assignedTo.some((selected) => selected.id === emp.id))}
                                getOptionLabel={(option) => formatEmployeeName(option)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={assignedTo}
                                onChange={(e, newValue) => {
                                    setAssignedTo(newValue || []); // newValue can be null
                                    setErrors((prev) => ({
                                        ...prev,
                                        assignedTo: false,
                                    }));
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
                                        label="Assigned To *"
                                        error={!!errors.assignedTo}
                                        size="small"
                                    />
                                )}
                                className="w-full"
                                loading={!employees?.length}
                                loadingIndicator={
                                    <CircularProgress
                                        color="inherit"
                                        size={20}
                                    />
                                }
                            />
                        </div>

                        <div className="mt-4 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
                            <TextField
                                label="Lead No"
                                value={followup?.leadId || ""}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                size="small"
                            />
                            <TextField
                                label="Customer Name"
                                value={followup?.customerPerson || ""}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                size="small"
                            />
                        </div>
                    </div>

                    {/* ===== Follow-Up Form Fields ===== */}
                    <div className="mt-4">
                        <div className="text-lg font-semibold text-[#433C50]">Follow-Up Details :</div>
                        <div className="mt-2 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
                            <Autocomplete
                                disablePortal
                                options={leadStage?.map((option) => option.leadStage) || []}
                                value={leadStageValue || ""}
                                onChange={(e, newValue) => {
                                    setLeadStageValue(newValue || "");
                                    setErrors((prev) => ({ ...prev, leadStage: false }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Lead Stage *"
                                        size="small"
                                        error={!!errors.leadStage}
                                    />
                                )}
                                className="w-full md:w-1/2"
                                clearOnEscape
                            />

                            <Autocomplete
                                disablePortal
                                options={leadStatus?.map((option) => option.leadStatus) || []}
                                value={leadStatusValue || ""}
                                onChange={(e, newValue) => {
                                    setLeadStatusValue(newValue || "");
                                    setErrors((prev) => ({ ...prev, leadStatus: false }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Lead Status *"
                                        size="small"
                                        error={!!errors.leadStatus}
                                    />
                                )}
                                className="w-full md:w-1/2"
                                clearOnEscape
                            />
                        </div>

                        <div className="mt-4 flex-none gap-0 space-y-4 md:flex md:gap-4 md:space-y-0">
                            <Autocomplete
                                disablePortal
                                options={contactOptions}
                                value={communicatedWith || ""}
                                onChange={(e, newValue) => {
                                    setCommunicatedWith(newValue || "");
                                }}
                                onInputChange={(e, newInputValue) => {
                                    setCommunicatedWith(newInputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Contacted With"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                                className="w-full"
                                clearOnEscape
                            />

                            <TextField
                                label="Additional Products"
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                                value={additionalProducts || ""}
                                onChange={(e) => setAdditionalProducts(e.target.value)}
                                placeholder="e.g. Wooden pallets, Bubble wrap, Tape 2 inch"
                            />
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-[#433C50]">Next Follow-Up Date :</p>
                            <TextField
                                size="small"
                                type="date"
                                className="w-48 md:w-56 lg:w-60"
                                value={
                                    nextFollowUpDate
                                        ? `${nextFollowUpDate.split("-")[2]}-${nextFollowUpDate.split("-")[1]}-${nextFollowUpDate.split("-")[0]}`
                                        : ""
                                }
                                onChange={(e) => {
                                    const [year, month, day] = e.target.value.split("-");
                                    setNextFollowUpDate(`${day}-${month}-${year}`);
                                }}
                                error={errors.nextFollowUpDate}
                            />
                        </div>

                        <div className="mt-4">
                            <TextField
                                label="Description *"
                                multiline
                                minRows={2}
                                fullWidth
                                size="small"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                error={errors.description}
                            />
                        </div>
                    </div>

                    {/* ===== Buttons ===== */}
                    <div className="mt-4 flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={followupLoading}
                            variant="gradient"
                            className={`flex items-center gap-2 rounded px-3 py-2 text-sm capitalize text-white ${editingFollowup ? "bg-green-600" : "bg-[#053054]"}`}
                        >
                            {followupLoading ? (
                                <CircularProgress
                                    size={20}
                                    color="inherit"
                                />
                            ) : editingFollowup ? (
                                <>
                                    <RiUserFollowLine size={20} />
                                    Update Follow-Up
                                </>
                            ) : (
                                <>
                                    <RiUserFollowLine size={20} />
                                    Add Follow-Up
                                </>
                            )}
                        </Button>

                        {editingFollowup && (
                            <Button
                                onClick={resetForm}
                                className="rounded bg-gray-500 px-3 py-2 text-sm capitalize text-white"
                            >
                                Reset
                            </Button>
                        )}
                    </div>

                    {/* ===== Table ===== */}
                    <FollowupModalTable
                        leadNo={followup?.leadId}
                        onDeleteFollowup={handleDeleteFollowup}
                        onEditFollowup={handleEditFollowup}
                    />

                    <div className="mt-10 flex justify-end">
                        <Button
                            onClick={onClose}
                            className="rounded bg-[#4B4B4B] px-6 py-2 capitalize text-white"
                        >
                            Close
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

export default FollowupModal;