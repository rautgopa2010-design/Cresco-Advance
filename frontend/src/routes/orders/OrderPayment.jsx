// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { getOrders } from "../../redux/actions/order";
// import { Button } from "@material-tailwind/react";
// import { CircularProgress, Alert, Snackbar, Modal, Box, Typography, IconButton, MenuItem, TextField } from "@mui/material";
// import { RiSecurePaymentFill } from "react-icons/ri";
// import { File, X, Search } from "lucide-react";
// import { addOrderPayment, getOrderPayments } from "../../redux/actions/orderPayment";

// const OrderPayment = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { orders, loading: orderLoading } = useSelector((state) => state.order);
//     const { payments, loading: paymentLoading, snackbarMessage } = useSelector((state) => state.orderPayment);
//     const [order, setOrder] = useState(null);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarInfo, setSnackbarInfo] = useState({ message: "", severity: "info" });

//     // Add Payment Modal states
//     const [addOpen, setAddOpen] = useState(false);
//     const [form, setForm] = useState({
//         paymentId: "",
//         date: "",
//         narration: "",
//         totalAmount: "",
//         dueAmount: "",
//         mode: "",
//         amount: "",
//         transactionRef: "",
//         bankName: "",
//         branch: "",
//         chequeNo: "",
//         chequeDate: "",
//     });

//     const [formErrors, setFormErrors] = useState({});

//     useEffect(() => {
//         dispatch(getOrders());
//         dispatch(getOrderPayments(id));
//     }, [dispatch, id]);

//     useEffect(() => {
//         if (orders.length > 0) {
//             const foundOrder = orders.find((o) => o.id === parseInt(id));
//             if (foundOrder) {
//                 // Initialize received amounts and dueAmount correctly
//                 const updatedOrder = {
//                     ...foundOrder,
//                     orderPaymentDetails: foundOrder.orderPaymentDetails.map((p) => {
//                         const totalAmount = Number(p.totalAmount || p.amount || 0);
//                         const receivedAmount = Number(p.receivedAmount || 0);
//                         return {
//                             ...p,
//                             receivedAmount,
//                             dueAmount: totalAmount - receivedAmount,
//                             amount: totalAmount,
//                             status: p.status || "Pending",
//                         };
//                     }),
//                     paymentRecords: foundOrder.paymentRecords || [],
//                 };
//                 setOrder(updatedOrder);
//             } else {
//                 setOrder(null);
//             }
//         }
//     }, [orders, id]);

//     useEffect(() => {
//         if (snackbarMessage) {
//             setSnackbarInfo({
//                 message: snackbarMessage,
//                 severity: snackbarMessage.includes("successfully") ? "success" : "error",
//             });
//             setSnackbarOpen(true);
//         }
//     }, [snackbarMessage]);

//     const handleSnackbarClose = () => setSnackbarOpen(false);

//     // Add Payment Modal
//     const handleAddOpen = () => {
//         const today = new Date();
//         const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
//         setForm((prev) => ({ ...prev, date: formattedDate }));
//         setAddOpen(true);
//     };

//     const handleAddClose = () => {
//         setAddOpen(false);
//         setForm({
//             paymentId: "",
//             date: "",
//             narration: "",
//             totalAmount: "",
//             dueAmount: "",
//             mode: "",
//             amount: "",
//             transactionRef: "",
//             bankName: "",
//             branch: "",
//             chequeNo: "",
//             chequeDate: "",
//         });
//         setFormErrors({});
//     };

//     const handleSearchPayment = () => {
//         if (!form.paymentId) {
//             setSnackbarInfo({ message: "Please enter Payment ID", severity: "error" });
//             setSnackbarOpen(true);
//             return;
//         }

//         const foundPayment = order?.orderPaymentDetails?.find((p) => String(p.id) === String(form.paymentId));

//         if (foundPayment) {
//             setForm((prev) => ({
//                 ...prev,
//                 narration: foundPayment.narration || "",
//                 totalAmount: foundPayment.amount || 0,
//                 dueAmount: foundPayment.dueAmount || 0,
//             }));
//             setSnackbarInfo({ message: "Payment ID found!", severity: "success" });
//             setSnackbarOpen(true);
//         } else {
//             setSnackbarInfo({ message: "Payment not found for entered ID", severity: "error" });
//             setSnackbarOpen(true);
//         }
//     };

//     const handleFormChange = (field, value) => {
//         setForm((prev) => ({ ...prev, [field]: value }));
//         if (value.trim() !== "") {
//             setFormErrors((prev) => ({ ...prev, [field]: false }));
//         }
//     };

//     const validateForm = () => {
//         let requiredFields = ["paymentId", "mode", "amount"];

//         // Add conditional required fields
//         if (form.mode === "Online") {
//             requiredFields = [...requiredFields, "transactionRef"];
//         } else if (form.mode === "Cheque") {
//             requiredFields = [...requiredFields, "bankName", "branch", "chequeNo", "chequeDate"];
//         }

//         const newErrors = {};
//         requiredFields.forEach((field) => {
//             if (!form[field] || form[field].toString().trim() === "") {
//                 newErrors[field] = true;
//             }
//         });

//         setFormErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const formatDateDDMMYYYY = (dateStr) => {
//         if (!dateStr) return "-";
//         const date = new Date(dateStr);
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//     };

//     const handleSubmitPayment = async () => {
//         if (!validateForm()) {
//             setSnackbarInfo({ message: "Please fill all required fields", severity: "error" });
//             setSnackbarOpen(true);
//             return;
//         }

//         const enteredAmount = parseFloat(form.amount);
//         if (enteredAmount <= 0) {
//             setSnackbarInfo({ message: "Amount must be greater than 0", severity: "error" });
//             setSnackbarOpen(true);
//             return;
//         }

//         // Find the target payment schedule
//         const targetPayment = order.orderPaymentDetails.find((p) => String(p.id) === String(form.paymentId));

//         if (!targetPayment) {
//             setSnackbarInfo({ message: "Invalid Payment ID", severity: "error" });
//             setSnackbarOpen(true);
//             return;
//         }

//         // Prevent overpayment
//         if (enteredAmount > targetPayment.dueAmount) {
//             setSnackbarInfo({
//                 message: "You are paying extra money, please check due amount.",
//                 severity: "error",
//             });
//             setSnackbarOpen(true);
//             return;
//         }

//         const paymentData = {
//             paymentId: form.paymentId,
//             payMode: form.mode,
//             payDate: form.date,
//             amount: enteredAmount,
//             transactionRef: form.transactionRef || "-",
//             bankName: form.bankName || "-",
//             branch: form.branch || "-",
//             chequeNo: form.chequeNo || "-",
//             chequeDate: form.mode === "Cheque" ? formatDateDDMMYYYY(form.chequeDate) : "-",
//         };

//         try {
//             await dispatch(addOrderPayment(order.id, paymentData));
//             await dispatch(getOrders());
//             await dispatch(getOrderPayments(order.id));

//             setSnackbarInfo({ message: "Payment added successfully!", severity: "success" });
//             setSnackbarOpen(true);
//             handleAddClose();
//         } catch (error) {
//             console.error("Add Payment Error:", error);
//             setSnackbarInfo({ message: "Failed to add payment", severity: "error" });
//             setSnackbarOpen(true);
//         }
//     };

//     const modalStyle = {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: 450,
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         borderRadius: "12px",
//         p: 3,
//     };

//     if (orderLoading || paymentLoading) {
//         return (
//             <div className="flex h-screen w-full items-center justify-center">
//                 <CircularProgress />
//             </div>
//         );
//     }

//     if (!order) {
//         return (
//             <div className="flex h-screen flex-col items-center justify-center text-gray-600">
//                 <p className="mb-4 text-lg">No order found with ID: {id}</p>
//                 <Button
//                     onClick={() => navigate("/orders")}
//                     className="rounded-full bg-[#053054] px-4 py-2 text-white"
//                 >
//                     Back to Orders
//                 </Button>
//             </div>
//         );
//     }

//     return (
//         <div className="card">
//             {/* Header */}
//             <div className="flex items-center justify-between text-nowrap">
//                 <div className="text-base font-semibold text-[#433C50] md:text-lg">Order Payment :</div>
//                 <Button
//                     onClick={() => navigate(-1)}
//                     variant="gradient"
//                     className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                 >
//                     Back
//                 </Button>
//             </div>

//             {/* Order Summary */}
//             <div className="card">
//                 <div className="flex items-center justify-between">
//                     <h3 className="text-base font-semibold text-[#433C50] md:text-lg">Order Details</h3>
//                     <div>
//                         <Button
//                             onClick={handleAddOpen}
//                             variant="gradient"
//                             className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                         >
//                             <RiSecurePaymentFill size={20} />
//                             Add Payment
//                         </Button>
//                     </div>
//                 </div>
//                 <div className="space-y-1 text-sm">
//                     <p>
//                         <b>Company Name :</b> {order.selectedCompany}
//                     </p>
//                     <p>
//                         <b>Customer Name :</b> {order.customerPerson}
//                     </p>
//                 </div>
//             </div>

//             {/* Payment Schedule */}
//             <div className="card">
//                 <h3 className="mb-3 text-lg font-medium text-gray-700">Payment Schedule</h3>
//                 <div className="overflow-auto">
//                     <table className="w-full border border-gray-300 text-sm">
//                         <thead className="text-nowrap bg-[#053054] text-white">
//                             <tr>
//                                 <th className="border border-gray-300 p-2">Payment Id</th>
//                                 <th className="border border-gray-300 p-2">Payment Due Date</th>
//                                 <th className="border border-gray-300 p-2">Order Id</th>
//                                 <th className="border border-gray-300 p-2">Payment %</th>
//                                 <th className="border border-gray-300 p-2">Total Amount</th>
//                                 <th className="border border-gray-300 p-2">Due Amount</th>
//                                 <th className="border border-gray-300 p-2">Received Amount</th>
//                                 <th className="border border-gray-300 p-2">Narration</th>
//                                 <th className="border border-gray-300 p-2">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="text-nowrap">
//                             {order.orderPaymentDetails?.length > 0 ? (
//                                 order.orderPaymentDetails.map((p, i) => (
//                                     <tr
//                                         key={i}
//                                         className="text-center text-gray-700"
//                                     >
//                                         <td className="border border-gray-300 p-2">{p.id}</td>
//                                         <td className="border border-gray-300 p-2">{p.dueDate}</td>
//                                         <td className="border border-gray-300 p-2">{order.id}</td>
//                                         <td className="border border-gray-300 p-2">{p.paymentPercent}%</td>
//                                         <td className="border border-gray-300 p-2">₹{p.amount}</td>
//                                         <td className="border border-gray-300 p-2">₹{p.dueAmount}</td>
//                                         <td className="border border-gray-300 p-2">₹{p.receivedAmount}</td>
//                                         <td className="border border-gray-300 p-2">{p.narration || "-"}</td>
//                                         <td
//                                             className={`border border-gray-300 p-2 ${
//                                                 p.status === "Completed"
//                                                     ? "bg-green-200"
//                                                     : p.status === "Partially Paid"
//                                                       ? "bg-orange-200"
//                                                       : "bg-gray-200"
//                                             }`}
//                                         >
//                                             {p.status || "Pending"}
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td
//                                         colSpan="9"
//                                         className="p-3 text-center text-gray-400"
//                                     >
//                                         No payment schedule found.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="mt-3 flex flex-col justify-center gap-2 text-nowrap text-center md:flex-col md:gap-2 lg:flex-row lg:gap-10">
//                     <p className="text-base font-medium text-gray-700">
//                         Total Amount:&nbsp; ₹{order.orderPaymentDetails.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString("en-IN")}
//                     </p>
//                     <p className="text-base font-medium text-gray-700">
//                         Total Outstanding:&nbsp; ₹
//                         {order.orderPaymentDetails.reduce((sum, p) => sum + Number(p.dueAmount || 0), 0).toLocaleString("en-IN")}
//                     </p>
//                 </div>
//             </div>

//             {/* Add Payment Modal */}
//             <Modal
//                 open={addOpen}
//                 onClose={handleAddClose}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             Add Payment
//                         </Typography>
//                         <IconButton onClick={handleAddClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     {/* Payment ID with Search */}
//                     <div className="flex items-center gap-2">
//                         <TextField
//                             label="Payment ID *"
//                             fullWidth
//                             size="small"
//                             value={form.paymentId}
//                             onChange={(e) => handleFormChange("paymentId", e.target.value)}
//                             error={!!formErrors.paymentId}
//                             sx={{
//                                 width: "200px",
//                             }}
//                         />
//                         <IconButton
//                             onClick={handleSearchPayment}
//                             sx={{
//                                 bgcolor: "#053054",
//                                 color: "white",
//                                 "&:hover": { bgcolor: "#032336" },
//                                 marginLeft: "10px",
//                             }}
//                         >
//                             <Search size={18} />
//                         </IconButton>
//                     </div>

//                     {/* Date & Narration */}
//                     <div className="mt-3 flex gap-2">
//                         <TextField
//                             label="Date"
//                             fullWidth
//                             size="small"
//                             value={form.date}
//                             InputProps={{ readOnly: true }}
//                         />
//                         <TextField
//                             label="Narration"
//                             fullWidth
//                             size="small"
//                             value={form.narration}
//                             onChange={(e) => handleFormChange("narration", e.target.value)}
//                         />
//                     </div>

//                     {/* Total & Due Amount */}
//                     <div className="mt-3 flex gap-2">
//                         <TextField
//                             label="Total Amount"
//                             fullWidth
//                             size="small"
//                             value={form.totalAmount}
//                             InputProps={{ readOnly: true }}
//                         />
//                         <TextField
//                             label="Due Amount"
//                             fullWidth
//                             size="small"
//                             value={form.dueAmount}
//                             InputProps={{ readOnly: true }}
//                         />
//                     </div>

//                     {/* Payment Mode */}
//                     <div className="mt-3">
//                         <TextField
//                             select
//                             label="Payment Mode *"
//                             fullWidth
//                             size="small"
//                             value={form.mode}
//                             onChange={(e) => handleFormChange("mode", e.target.value)}
//                             error={!!formErrors.mode}
//                         >
//                             <MenuItem value="Cash">Cash</MenuItem>
//                             <MenuItem value="Online">Online</MenuItem>
//                             <MenuItem value="Cheque">Cheque</MenuItem>
//                         </TextField>
//                     </div>

//                     {/* Conditional Fields */}
//                     {["Cash", "Online", "Cheque"].includes(form.mode) && (
//                         <div className="mt-3 flex flex-col gap-3">
//                             <TextField
//                                 label="Amount *"
//                                 fullWidth
//                                 size="small"
//                                 value={form.amount}
//                                 onChange={(e) => handleFormChange("amount", e.target.value)}
//                                 error={!!formErrors.amount}
//                             />
//                             {form.mode === "Online" && (
//                                 <TextField
//                                     label="Transaction Reference No. *"
//                                     fullWidth
//                                     size="small"
//                                     value={form.transactionRef}
//                                     onChange={(e) => handleFormChange("transactionRef", e.target.value)}
//                                     error={!!formErrors.transactionRef}
//                                 />
//                             )}
//                             {form.mode === "Cheque" && (
//                                 <>
//                                     <TextField
//                                         label="Bank Name *"
//                                         fullWidth
//                                         size="small"
//                                         value={form.bankName}
//                                         onChange={(e) => handleFormChange("bankName", e.target.value)}
//                                         error={!!formErrors.bankName}
//                                     />
//                                     <TextField
//                                         label="Cheque No. *"
//                                         fullWidth
//                                         size="small"
//                                         value={form.chequeNo}
//                                         onChange={(e) => handleFormChange("chequeNo", e.target.value)}
//                                         error={!!formErrors.chequeNo}
//                                     />
//                                     <TextField
//                                         label="Cheque Date *"
//                                         type="date"
//                                         InputLabelProps={{ shrink: true }}
//                                         fullWidth
//                                         size="small"
//                                         value={form.chequeDate}
//                                         onChange={(e) => handleFormChange("chequeDate", e.target.value)}
//                                         error={!!formErrors.chequeDate}
//                                     />

//                                     <TextField
//                                         label="Branch Name *"
//                                         fullWidth
//                                         size="small"
//                                         value={form.branch}
//                                         onChange={(e) => handleFormChange("branch", e.target.value)}
//                                         error={!!formErrors.branch}
//                                     />
//                                 </>
//                             )}
//                         </div>
//                     )}

//                     {/* Buttons */}
//                     <div className="mt-5 flex justify-end gap-2">
//                         <Button
//                             variant="outlined"
//                             className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
//                             onClick={handleAddClose}
//                         >
//                             Close
//                         </Button>
//                         <Button
//                             className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
//                             onClick={handleSubmitPayment}
//                         >
//                             Submit
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Payment Details */}
//             <div className="card">
//                 <h3 className="mb-3 text-lg font-medium text-gray-700">Payment Details</h3>
//                 <div className="overflow-auto">
//                     <table className="w-full border border-gray-300 text-sm">
//                         <thead className="text-nowrap bg-[#053054] text-white">
//                             <tr>
//                                 <th className="border border-gray-300 p-2">Payment Id</th>
//                                 <th className="border border-gray-300 p-2">Order Id</th>
//                                 <th className="border border-gray-300 p-2">Pay Mode</th>
//                                 <th className="border border-gray-300 p-2">Pay Date</th>
//                                 <th className="border border-gray-300 p-2">Amount</th>
//                                 <th className="border border-gray-300 p-2">Bank Name</th>
//                                 <th className="border border-gray-300 p-2">Branch</th>
//                                 <th className="border border-gray-300 p-2">Cheque No.</th>
//                                 <th className="border border-gray-300 p-2">Cheque Date</th>
//                                 <th className="border border-gray-300 p-2">Transaction ref no.</th>
//                                 <th className="border border-gray-300 p-2">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="text-nowrap">
//                             {payments?.length > 0 ? (
//                                 payments.map((p, i) => (
//                                     <tr
//                                         key={i}
//                                         className="text-center text-gray-700"
//                                     >
//                                         <td className="border border-gray-300 p-2">{p.paymentId}</td>
//                                         <td className="border border-gray-300 p-2">{p.order_id}</td>
//                                         <td className="border border-gray-300 p-2">{p.payMode}</td>
//                                         <td className="border border-gray-300 p-2">{p.payDate}</td>
//                                         <td className="border border-gray-300 p-2">₹{p.amount}</td>
//                                         <td className="border border-gray-300 p-2">{p.bankName}</td>
//                                         <td className="border border-gray-300 p-2">{p.branch}</td>
//                                         <td className="border border-gray-300 p-2">{p.chequeNo}</td>
//                                         <td className="border border-gray-300 p-2">{p.chequeDate}</td>
//                                         <td className="border border-gray-300 p-2">{p.transactionRef}</td>
//                                         <td className="border border-gray-300 p-2">
//                                             <button
//                                                 onClick={() => navigate(`/orders/${p.order_id}/payments/details/${p.paymentId}`)}
//                                                 className="text-purple-600 transition-transform hover:scale-110"
//                                             >
//                                                 <File size={18} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td
//                                         colSpan="11"
//                                         className="p-3 text-center text-gray-400"
//                                     >
//                                         No payment details found.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
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
//                     severity={snackbarInfo.severity}
//                     variant="filled"
//                 >
//                     {snackbarInfo.message}
//                 </Alert>
//             </Snackbar>
//         </div>
//     );
// };

// export default OrderPayment;


import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOrders } from "../../redux/actions/order";
import { Button } from "@material-tailwind/react";
import { CircularProgress, Alert, Snackbar, Modal, Box, Typography, IconButton, MenuItem, TextField } from "@mui/material";
import { RiSecurePaymentFill } from "react-icons/ri";
import { File, X, Search, Printer, Download, Mail } from "lucide-react";
import { addOrderPayment, getOrderPayments } from "../../redux/actions/orderPayment";
import OrderPaymentPrint from "./OrderPaymentPrint";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getPrefix } from "../../redux/actions/prefix";

const OrderPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { orders, loading: orderLoading } = useSelector((state) => state.order);
    const { payments, loading: paymentLoading, snackbarMessage } = useSelector((state) => state.orderPayment);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { prefix } = useSelector((state) => state.prefix);
    const [order, setOrder] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarInfo, setSnackbarInfo] = useState({ message: "", severity: "info" });
    
    // Print ref
    const paymentPrintRef = useRef();
    const [printPayment, setPrintPayment] = useState(null);

    // Add Payment Modal states
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({
        paymentId: "",
        date: "",
        narration: "",
        totalAmount: "",
        dueAmount: "",
        mode: "",
        amount: "",
        transactionRef: "",
        bankName: "",
        branch: "",
        chequeNo: "",
        chequeDate: "",
    });

    const [formErrors, setFormErrors] = useState({});

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        dispatch(getOrders());
        dispatch(getOrderPayments(id));
        if (user.org_id) {
            dispatch(getCompanySetup(user.org_id));
        }
        dispatch(getPrefix());
    }, [dispatch, id, user.org_id]);

    useEffect(() => {
        if (orders.length > 0) {
            const foundOrder = orders.find((o) => o.id === parseInt(id));
            if (foundOrder) {
                // Initialize received amounts and dueAmount correctly
                const updatedOrder = {
                    ...foundOrder,
                    orderPaymentDetails: foundOrder.orderPaymentDetails.map((p) => {
                        const totalAmount = Number(p.totalAmount || p.amount || 0);
                        const receivedAmount = Number(p.receivedAmount || 0);
                        return {
                            ...p,
                            receivedAmount,
                            dueAmount: totalAmount - receivedAmount,
                            amount: totalAmount,
                            status: p.status || "Pending",
                        };
                    }),
                    paymentRecords: foundOrder.paymentRecords || [],
                };
                setOrder(updatedOrder);
            } else {
                setOrder(null);
            }
        }
    }, [orders, id]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarInfo({
                message: snackbarMessage,
                severity: snackbarMessage.includes("successfully") ? "success" : "error",
            });
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = () => setSnackbarOpen(false);

    // Add Payment Modal
    const handleAddOpen = () => {
        // Set default date as empty so user can choose
        setForm((prev) => ({ ...prev, date: "" }));
        setAddOpen(true);
    };

    const handleAddClose = () => {
        setAddOpen(false);
        setForm({
            paymentId: "",
            date: "",
            narration: "",
            totalAmount: "",
            dueAmount: "",
            mode: "",
            amount: "",
            transactionRef: "",
            bankName: "",
            branch: "",
            chequeNo: "",
            chequeDate: "",
        });
        setFormErrors({});
    };

    const handleSearchPayment = () => {
        if (!form.paymentId) {
            setSnackbarInfo({ message: "Please enter Payment ID", severity: "error" });
            setSnackbarOpen(true);
            return;
        }

        const foundPayment = order?.orderPaymentDetails?.find((p) => String(p.id) === String(form.paymentId));

        if (foundPayment) {
            setForm((prev) => ({
                ...prev,
                narration: foundPayment.narration || "",
                totalAmount: foundPayment.amount || 0,
                dueAmount: foundPayment.dueAmount || 0,
            }));
            setSnackbarInfo({ message: "Payment ID found!", severity: "success" });
            setSnackbarOpen(true);
        } else {
            setSnackbarInfo({ message: "Payment not found for entered ID", severity: "error" });
            setSnackbarOpen(true);
        }
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (value && value.toString().trim() !== "") {
            setFormErrors((prev) => ({ ...prev, [field]: false }));
        }
    };

    const validateForm = () => {
        let requiredFields = ["paymentId", "mode", "amount", "date"]; // Added date as required

        // Add conditional required fields
        if (form.mode === "Online") {
            requiredFields = [...requiredFields, "transactionRef"];
        } else if (form.mode === "Cheque") {
            requiredFields = [...requiredFields, "bankName", "branch", "chequeNo", "chequeDate"];
        }

        const newErrors = {};
        requiredFields.forEach((field) => {
            if (!form[field] || form[field].toString().trim() === "") {
                newErrors[field] = true;
            }
        });

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatDateDDMMYYYY = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        // If date is already in DD-MM-YYYY format
        if (dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                return dateStr;
            }
        }
        // Convert from YYYY-MM-DD to DD-MM-YYYY
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleSubmitPayment = async () => {
        if (!validateForm()) {
            setSnackbarInfo({ message: "Please fill all required fields", severity: "error" });
            setSnackbarOpen(true);
            return;
        }

        const enteredAmount = parseFloat(form.amount);
        if (enteredAmount <= 0) {
            setSnackbarInfo({ message: "Amount must be greater than 0", severity: "error" });
            setSnackbarOpen(true);
            return;
        }

        // Find the target payment schedule
        const targetPayment = order.orderPaymentDetails.find((p) => String(p.id) === String(form.paymentId));

        if (!targetPayment) {
            setSnackbarInfo({ message: "Invalid Payment ID", severity: "error" });
            setSnackbarOpen(true);
            return;
        }

        // Prevent overpayment
        if (enteredAmount > targetPayment.dueAmount) {
            setSnackbarInfo({
                message: "You are paying extra money, please check due amount.",
                severity: "error",
            });
            setSnackbarOpen(true);
            return;
        }

        // Format the date from YYYY-MM-DD to DD-MM-YYYY for API
        const formattedDate = formatDateToDDMMYYYY(form.date);

        const paymentData = {
            paymentId: form.paymentId,
            payMode: form.mode,
            payDate: formattedDate,
            amount: enteredAmount,
            transactionRef: form.transactionRef || "-",
            bankName: form.bankName || "-",
            branch: form.branch || "-",
            chequeNo: form.chequeNo || "-",
            chequeDate: form.mode === "Cheque" ? formatDateToDDMMYYYY(form.chequeDate) : "-",
        };

        try {
            await dispatch(addOrderPayment(order.id, paymentData));
            await dispatch(getOrders());
            await dispatch(getOrderPayments(order.id));

            setSnackbarInfo({ message: "Payment added successfully!", severity: "success" });
            setSnackbarOpen(true);
            handleAddClose();
        } catch (error) {
            console.error("Add Payment Error:", error);
            setSnackbarInfo({ message: "Failed to add payment", severity: "error" });
            setSnackbarOpen(true);
        }
    };

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 450,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
        maxHeight: "90vh",
        overflowY: "auto",
    };

    if (orderLoading || paymentLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex h-screen flex-col items-center justify-center text-gray-600">
                <p className="mb-4 text-lg">No order found with ID: {id}</p>
                <Button
                    onClick={() => navigate("/orders")}
                    className="rounded-full bg-[#053054] px-4 py-2 text-white"
                >
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="card">
            {/* Payment Print Component */}
            <OrderPaymentPrint
                ref={paymentPrintRef}
                companyName={companySetup?.companyName || ""}
                companyLogo={companySetup?.companyLogo || ""}
                order={order}
                payment={printPayment}
                prefix={prefix}
            />

            {/* Header */}
            <div className="flex items-center justify-between text-nowrap">
                <div className="text-base font-semibold text-[#433C50] md:text-lg">Order Payment :</div>
                <Button
                    onClick={() => navigate(-1)}
                    variant="gradient"
                    className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                >
                    Back
                </Button>
            </div>

            {/* Order Summary */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#433C50] md:text-lg">Order Details</h3>
                    <div>
                        <Button
                            onClick={handleAddOpen}
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <RiSecurePaymentFill size={20} />
                            Receive Payment
                        </Button>
                    </div>
                </div>
                <div className="space-y-1 text-sm">
                    <p>
                        <b>Company Name :</b> {order.selectedCompany}
                    </p>
                    <p>
                        <b>Customer Name :</b> {order.customerPerson}
                    </p>
                </div>
            </div>

            {/* Payment Schedule */}
            <div className="card">
                <h3 className="mb-3 text-lg font-medium text-gray-700">Payment Schedule</h3>
                <div className="overflow-auto">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="text-nowrap bg-[#053054] text-white">
                            <tr>
                                <th className="border border-gray-300 p-2">Payment Id</th>
                                <th className="border border-gray-300 p-2">Payment Due Date</th>
                                <th className="border border-gray-300 p-2">Order Id</th>
                                <th className="border border-gray-300 p-2">Payment %</th>
                                <th className="border border-gray-300 p-2">Total Amount</th>
                                <th className="border border-gray-300 p-2">Due Amount</th>
                                <th className="border border-gray-300 p-2">Received Amount</th>
                                <th className="border border-gray-300 p-2">Narration</th>
                                <th className="border border-gray-300 p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-nowrap">
                            {order.orderPaymentDetails?.length > 0 ? (
                                order.orderPaymentDetails.map((p, i) => (
                                    <tr
                                        key={i}
                                        className="text-center text-gray-700"
                                    >
                                        <td className="border border-gray-300 p-2">{p.id}</td>
                                        <td className="border border-gray-300 p-2">{p.dueDate}</td>
                                        <td className="border border-gray-300 p-2">{order.id}</td>
                                        <td className="border border-gray-300 p-2">{p.paymentPercent}%</td>
                                        <td className="border border-gray-300 p-2">₹{p.amount}</td>
                                        <td className="border border-gray-300 p-2">₹{p.dueAmount}</td>
                                        <td className="border border-gray-300 p-2">₹{p.receivedAmount}</td>
                                        <td className="border border-gray-300 p-2">{p.narration || "-"}</td>
                                        <td
                                            className={`border border-gray-300 p-2 ${
                                                p.status === "Completed"
                                                    ? "bg-green-200"
                                                    : p.status === "Partially Paid"
                                                      ? "bg-orange-200"
                                                      : "bg-gray-200"
                                            }`}
                                        >
                                            {p.status || "Pending"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="p-3 text-center text-gray-400"
                                    >
                                        No payment schedule found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 flex flex-col justify-center gap-2 text-nowrap text-center md:flex-col md:gap-2 lg:flex-row lg:gap-10">
                    <p className="text-base font-medium text-gray-700">
                        Total Amount:&nbsp; ₹{order.orderPaymentDetails.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-base font-medium text-gray-700">
                        Total Outstanding:&nbsp; ₹
                        {order.orderPaymentDetails.reduce((sum, p) => sum + Number(p.dueAmount || 0), 0).toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            {/* Add Payment Modal */}
            <Modal
                open={addOpen}
                onClose={handleAddClose}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Add Payment
                        </Typography>
                        <IconButton onClick={handleAddClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    {/* Payment ID with Search */}
                    <div className="flex items-center gap-2">
                        <TextField
                            label="Payment ID *"
                            fullWidth
                            size="small"
                            value={form.paymentId}
                            onChange={(e) => handleFormChange("paymentId", e.target.value)}
                            error={!!formErrors.paymentId}
                            sx={{
                                width: "200px",
                            }}
                        />
                        <IconButton
                            onClick={handleSearchPayment}
                            sx={{
                                bgcolor: "#053054",
                                color: "white",
                                "&:hover": { bgcolor: "#032336" },
                                marginLeft: "10px",
                            }}
                        >
                            <Search size={18} />
                        </IconButton>
                    </div>

                    {/* Date (Now Editable) & Narration */}
                    <div className="mt-3 flex gap-2">
                        <TextField
                            label="Date *"
                            type="date"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={form.date}
                            onChange={(e) => handleFormChange("date", e.target.value)}
                            error={!!formErrors.date}
                        />
                        <TextField
                            label="Narration"
                            fullWidth
                            size="small"
                            value={form.narration}
                            onChange={(e) => handleFormChange("narration", e.target.value)}
                        />
                    </div>

                    {/* Total & Due Amount */}
                    <div className="mt-3 flex gap-2">
                        <TextField
                            label="Total Amount"
                            fullWidth
                            size="small"
                            value={form.totalAmount}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Due Amount"
                            fullWidth
                            size="small"
                            value={form.dueAmount}
                            InputProps={{ readOnly: true }}
                        />
                    </div>

                    {/* Payment Mode */}
                    <div className="mt-3">
                        <TextField
                            select
                            label="Payment Mode *"
                            fullWidth
                            size="small"
                            value={form.mode}
                            onChange={(e) => handleFormChange("mode", e.target.value)}
                            error={!!formErrors.mode}
                        >
                            <MenuItem value="Cash">Cash</MenuItem>
                            <MenuItem value="Online">Online</MenuItem>
                            <MenuItem value="Cheque">Cheque</MenuItem>
                        </TextField>
                    </div>

                    {/* Conditional Fields */}
                    {["Cash", "Online", "Cheque"].includes(form.mode) && (
                        <div className="mt-3 flex flex-col gap-3">
                            <TextField
                                label="Amount *"
                                fullWidth
                                size="small"
                                type="number"
                                value={form.amount}
                                onChange={(e) => handleFormChange("amount", e.target.value)}
                                error={!!formErrors.amount}
                            />
                            {form.mode === "Online" && (
                                <TextField
                                    label="Transaction Reference No. *"
                                    fullWidth
                                    size="small"
                                    value={form.transactionRef}
                                    onChange={(e) => handleFormChange("transactionRef", e.target.value)}
                                    error={!!formErrors.transactionRef}
                                />
                            )}
                            {form.mode === "Cheque" && (
                                <>
                                    <TextField
                                        label="Bank Name *"
                                        fullWidth
                                        size="small"
                                        value={form.bankName}
                                        onChange={(e) => handleFormChange("bankName", e.target.value)}
                                        error={!!formErrors.bankName}
                                    />
                                    <TextField
                                        label="Cheque No. *"
                                        fullWidth
                                        size="small"
                                        value={form.chequeNo}
                                        onChange={(e) => handleFormChange("chequeNo", e.target.value)}
                                        error={!!formErrors.chequeNo}
                                    />
                                    <TextField
                                        label="Cheque Date *"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        size="small"
                                        value={form.chequeDate}
                                        onChange={(e) => handleFormChange("chequeDate", e.target.value)}
                                        error={!!formErrors.chequeDate}
                                    />
                                    <TextField
                                        label="Branch Name *"
                                        fullWidth
                                        size="small"
                                        value={form.branch}
                                        onChange={(e) => handleFormChange("branch", e.target.value)}
                                        error={!!formErrors.branch}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-5 flex justify-end gap-2">
                        <Button
                            variant="outlined"
                            className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
                            onClick={handleAddClose}
                        >
                            Close
                        </Button>
                        <Button
                            className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                            onClick={handleSubmitPayment}
                        >
                            Submit
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Payment Details */}
            <div className="card">
                <h3 className="mb-3 text-lg font-medium text-gray-700">Payment Details</h3>
                <div className="overflow-auto">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="text-nowrap bg-[#053054] text-white">
                            <tr>
                                <th className="border border-gray-300 p-2">Payment Id</th>
                                <th className="border border-gray-300 p-2">Order Id</th>
                                <th className="border border-gray-300 p-2">Pay Mode</th>
                                <th className="border border-gray-300 p-2">Pay Date</th>
                                <th className="border border-gray-300 p-2">Amount</th>
                                <th className="border border-gray-300 p-2">Bank Name</th>
                                <th className="border border-gray-300 p-2">Branch</th>
                                <th className="border border-gray-300 p-2">Cheque No.</th>
                                <th className="border border-gray-300 p-2">Cheque Date</th>
                                <th className="border border-gray-300 p-2">Transaction ref no.</th>
                                <th className="border border-gray-300 p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-nowrap">
                            {payments?.length > 0 ? (
                                payments.map((p, i) => (
                                    <tr
                                        key={i}
                                        className="text-center text-gray-700"
                                    >
                                        <td className="border border-gray-300 p-2">{p.paymentId}</td>
                                        <td className="border border-gray-300 p-2">{p.order_id}</td>
                                        <td className="border border-gray-300 p-2">{p.payMode}</td>
                                        <td className="border border-gray-300 p-2">{p.payDate}</td>
                                        <td className="border border-gray-300 p-2">₹{p.amount}</td>
                                        <td className="border border-gray-300 p-2">{p.bankName}</td>
                                        <td className="border border-gray-300 p-2">{p.branch}</td>
                                        <td className="border border-gray-300 p-2">{p.chequeNo}</td>
                                        <td className="border border-gray-300 p-2">{p.chequeDate}</td>
                                        <td className="border border-gray-300 p-2">{p.transactionRef}</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/orders/${p.order_id}/payments/details/${p.paymentId}`)}
                                                    className="text-purple-600 transition-transform hover:scale-110"
                                                >
                                                    <File size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPrintPayment(p);
                                                        setTimeout(() => paymentPrintRef.current?.print(), 300);
                                                    }}
                                                    className="text-orange-500 transition-transform hover:scale-110"
                                                    title="Print receipt"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPrintPayment(p);
                                                        setTimeout(() => paymentPrintRef.current?.print(), 300);
                                                    }}
                                                    className="text-blue-600 transition-transform hover:scale-110"
                                                    title="Download receipt as PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <a
                                                    href={`mailto:${order.email || ""}?subject=${encodeURIComponent(`Payment receipt for order ${order.orderNo}`)}&body=${encodeURIComponent(`Dear ${order.customerPerson},\n\nPayment of ₹${p.amount} was received on ${p.payDate}. Receipt reference: RCP-${order.orderNo}-${p.id}.\n\nRegards,\n${companySetup?.companyName || "Accounts Team"}`)}`}
                                                    className="text-indigo-600 transition-transform hover:scale-110"
                                                    title="Email receipt"
                                                >
                                                    <Mail size={18} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="11"
                                        className="p-3 text-center text-gray-400"
                                    >
                                        No payment details found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarInfo.severity}
                    variant="filled"
                >
                    {snackbarInfo.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default OrderPayment;
