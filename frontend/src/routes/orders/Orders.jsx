// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash } from "lucide-react";
// import { FaJediOrder } from "react-icons/fa6";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { BsThreeDotsVertical } from "react-icons/bs";

// const Orders = () => {
//     const navigate = useNavigate();
//     const [orders, setOrders] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);

//     useEffect(() => {
//         const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
//         setOrders(storedOrders);
//     }, []);

//     const handleDelete = (index) => {
//         const updatedOrders = orders.filter((_, i) => i !== index);
//         setOrders(updatedOrders);
//         localStorage.setItem("orders", JSON.stringify(updatedOrders));
//     };

//     const handleCreateClick = () => {
//         navigate("/orders/generate-order");
//     };

//     const openModal = (index) => {
//         setSelectedOrderIndex(index);
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//     };

//     const handleStatusChange = (status) => {
//         const updatedOrders = [...orders];
//         updatedOrders[selectedOrderIndex].status = status;
//         setOrders(updatedOrders);
//         localStorage.setItem("orders", JSON.stringify(updatedOrders));
//         closeModal();
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Order's List :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <FaJediOrder size={20} />
//                         Generate Order
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Order No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Order Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Products</th>
//                                     <th className="table-head border border-gray-300 capitalize">HSN Code</th>
//                                     <th className="table-head border border-gray-300 capitalize">Quantity</th>
//                                     <th className="table-head border border-gray-300 capitalize">Total</th>
//                                     <th className="table-head border border-gray-300 capitalize">Status</th>
//                                     <th className="table-head border border-gray-300 capitalize">Final Amount</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {orders.length === 0 ? (
//                                     <tr>
//                                         <td
//                                             colSpan="14"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Orders
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     orders.map((order, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{order.date}</td>
//                                             <td className="table-cell border border-gray-300">{order.selectedCompany}</td>
//                                             <td className="table-cell border border-gray-300">{order.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300">{order.mobile}</td>
//                                             <td className="table-cell border border-gray-300">{order.email}</td>
//                                             {(() => {
//                                                 const intrastateList = order.productOrderDetails?.intrastate || [];
//                                                 const interstateList = order.productOrderDetails?.interstate || [];
//                                                 const allProducts = [...intrastateList, ...interstateList];

//                                                 return (
//                                                     <>
//                                                         <td className="table-cell border border-gray-300 text-nowrap">
//                                                             {allProducts.map((item) => item.product).join(", ")}
//                                                         </td>
//                                                         <td className="table-cell border border-gray-300 text-nowrap">
//                                                             {allProducts.map((item) => item.hsnCode).join(", ")}
//                                                         </td>
//                                                         <td className="table-cell border border-gray-300 text-nowrap">
//                                                             {allProducts.map((item) => item.quantity).join(", ")}
//                                                         </td>
//                                                         <td className="table-cell border border-gray-300 text-nowrap">{allProducts.map((item) => item.total).join(", ")}</td>
//                                                     </>
//                                                 );
//                                             })()}

//                                             <td className="table-cell border border-gray-300">{order.status || "Pending"}</td>
//                                             <td className="table-cell border border-gray-300">{order.finalAmt}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         title="Status"
//                                                         className="text-[#433C50] duration-300 hover:scale-110"
//                                                         onClick={(e) => openModal(index, e)}
//                                                     >
//                                                         <BsThreeDotsVertical size={20} />
//                                                     </button>
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

//             {/* Modal for Status Selection */}
//             {showModal && (
//                 <div
//                     className="fixed inset-0 z-40"
//                     onClick={closeModal}
//                 >
//                     <div
//                         className="absolute left-[45%] top-[250px] z-50 w-48 rounded-md bg-white shadow-lg md:left-[73%] lg:left-[86%]"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <h3 className="px-4 py-2 font-semibold text-gray-700">Select Status</h3>
//                         <button
//                             onClick={() => handleStatusChange("Pending")}
//                             className="w-full px-4 py-2 text-left hover:bg-gray-100"
//                         >
//                             Pending
//                         </button>
//                         <button
//                             onClick={() => handleStatusChange("Completed")}
//                             className="w-full px-4 py-2 text-left hover:bg-gray-100"
//                         >
//                             Completed
//                         </button>
//                         <button
//                             onClick={() => handleStatusChange("Canceled")}
//                             className="w-full px-4 py-2 text-left hover:bg-gray-100"
//                         >
//                             Canceled
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default Orders;

// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash, X, ChevronLeft, ChevronRight, Printer } from "lucide-react";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { FaJediOrder } from "react-icons/fa6";
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { getOrders, deleteOrder, updateOrderStatus } from "../../redux/actions/order";
// import { RiSecurePaymentFill } from "react-icons/ri";
// import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField, MenuItem, Menu } from "@mui/material";
// import { clearSnackbar } from "../../redux/actions/commonActions";
// import { getOrderStatus } from "../../redux/actions/orderStatus";
// import OrderPrint from "./OrderPrint";
// import { getCompanySetup } from "../../redux/actions/companySetup";
// import { getPrefix } from "../../redux/actions/prefix";

// const Orders = () => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//     const [selectedDeleteId, setSelectedDeleteId] = useState(null);
//     const { snackbarMessage, snackbarSeverity, orders, loading } = useSelector((state) => state.order);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const { companySetup } = useSelector((state) => state.companySetup);
//     const { prefix } = useSelector((state) => state.prefix);
//     const printRef = useRef();
//     const [printOrder, setPrintOrder] = useState(null);

//     useEffect(() => {
//         dispatch(getOrders());
//         dispatch(getPrefix());
//         dispatch(getOrderStatus());
//         dispatch(clearSnackbar());
//     }, [dispatch]);

//     const user = JSON.parse(localStorage.getItem("user") || "{}");

//     useEffect(() => {
//         if (user.org_id) {
//             dispatch(getCompanySetup(user.org_id));
//         }
//     }, [dispatch, user.org_id]);

//     useEffect(() => {
//         if (snackbarMessage) {
//             setSnackbarOpen(true);
//         }
//     }, [snackbarMessage]);

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//         setTimeout(() => {
//             dispatch(clearSnackbar());
//         }, 100);
//     };

//     const handleCreateClick = () => {
//         navigate("/orders/generate-order");
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

//     const handleEditClick = (id) => {
//         navigate(`/orders/edit-order/${id}`);
//     };

//     const handleViewClick = (id) => {
//         navigate(`/orders/view-order/${id}`);
//     };

//     const handleDeleteClick = (id) => {
//         setSelectedDeleteId(id);
//         setDeleteConfirmOpen(true);
//     };

//     const confirmDelete = () => {
//         dispatch(deleteOrder(selectedDeleteId));
//         setSnackbarOpen(true);
//         setDeleteConfirmOpen(false);
//         setSelectedDeleteId(null);
//     };

//     const orderStatusList = useSelector((state) => state.orderStatus.orderStatus || []);
//     const defaultStatuses = ["Pending", "Completed", "Canceled"];
//     const allStatuses = Array.from(new Set([...defaultStatuses, ...orderStatusList.map((item) => item.orderStatus.trim())])).filter(
//         (status) => status,
//     );
//     const sortedStatuses = [...defaultStatuses, ...allStatuses.filter((s) => !defaultStatuses.includes(s)).sort()];

//     const [filters, setFilters] = useState({
//         fromDate: "",
//         toDate: "",
//         company: "",
//         customer: "",
//         mobile: "",
//         email: "",
//         status: "",
//     });

//     const handleFilterChange = (key, value) => {
//         setFilters((prev) => ({ ...prev, [key]: value }));
//     };

//     const filteredOrders = orders.filter((order) => {
//         // Convert order.date ("31-10-2025") → JS date
//         const [day, month, year] = (order.date || "").split("-");
//         const orderDate = new Date(`${year}-${month}-${day}`);

//         const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
//         const toDate = filters.toDate ? new Date(filters.toDate) : null;

//         const matchesFromDate = fromDate ? orderDate >= fromDate : true;
//         const matchesToDate = toDate ? orderDate <= toDate : true;

//         const matchesCompany = filters.company ? order.selectedCompany?.toLowerCase().includes(filters.company.toLowerCase()) : true;

//         const matchesCustomer = filters.customer ? order.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;

//         const matchesMobile = filters.mobile ? order.mobile?.includes(filters.mobile) : true;

//         const matchesEmail = filters.email ? order.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

//         const matchesStatus = filters.status ? order.status === filters.status : true;

//         return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail && matchesStatus;
//     });

//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(5);

//     const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const currentOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

//     const handleRowsPerPageChange = (e) => {
//         const value = e.target.value;
//         if (value === "All") {
//             setRowsPerPage(filteredOrders.length);
//             setCurrentPage(1);
//         } else {
//             setRowsPerPage(Number(value));
//             setCurrentPage(1);
//         }
//     };

//     const [anchorEl, setAnchorEl] = useState(null);
//     const [selectedOrderId, setSelectedOrderId] = useState(null);

//     const handleMenuOpen = (event, orderId) => {
//         setAnchorEl(event.currentTarget);
//         setSelectedOrderId(orderId);
//     };

//     const handleMenuClose = () => {
//         setAnchorEl(null);
//         setSelectedOrderId(null);
//     };

//     const handleStatusChange = (status) => {
//         if (selectedOrderId) {
//             dispatch(updateOrderStatus(selectedOrderId, status));
//         }
//         handleMenuClose();
//         setSnackbarOpen(true);
//     };

//     return (
//         <>
//             {loading ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <>
//                     <OrderPrint
//                         ref={printRef}
//                         companyName={companySetup?.companyName || ""}
//                         companyLogo={companySetup?.companyLogo || ""}
//                         order={printOrder}
//                         prefix={prefix}
//                     />
//                     <div className="card">
//                         <div className="flex items-center justify-between text-nowrap">
//                             <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Order's List :</div>
//                             <Button
//                                 onClick={handleCreateClick}
//                                 variant="gradient"
//                                 className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                             >
//                                 <FaJediOrder size={20} />
//                                 Generate Order
//                             </Button>
//                         </div>

//                         {/* ===== Filter Box ===== */}
//                         <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
//                             <Typography
//                                 variant="subtitle1"
//                                 className="mb-2 font-semibold text-[#053054]"
//                             >
//                                 Filters
//                             </Typography>
//                             <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                                 <TextField
//                                     label="From Date"
//                                     type="date"
//                                     size="small"
//                                     InputLabelProps={{ shrink: true }}
//                                     value={filters.fromDate}
//                                     onChange={(e) => handleFilterChange("fromDate", e.target.value)}
//                                 />
//                                 <TextField
//                                     label="To Date"
//                                     type="date"
//                                     size="small"
//                                     InputLabelProps={{ shrink: true }}
//                                     value={filters.toDate}
//                                     onChange={(e) => handleFilterChange("toDate", e.target.value)}
//                                 />
//                                 <TextField
//                                     label="Company Name"
//                                     size="small"
//                                     value={filters.company}
//                                     onChange={(e) => handleFilterChange("company", e.target.value)}
//                                 />
//                                 <TextField
//                                     label="Customer Name"
//                                     size="small"
//                                     value={filters.customer}
//                                     onChange={(e) => handleFilterChange("customer", e.target.value)}
//                                 />
//                                 <TextField
//                                     label="Mobile No"
//                                     size="small"
//                                     value={filters.mobile}
//                                     onChange={(e) => handleFilterChange("mobile", e.target.value)}
//                                 />
//                                 <TextField
//                                     label="Email Id"
//                                     size="small"
//                                     value={filters.email}
//                                     onChange={(e) => handleFilterChange("email", e.target.value)}
//                                 />
//                                 <TextField
//                                     label="Status"
//                                     size="small"
//                                     select
//                                     value={filters.status}
//                                     onChange={(e) => handleFilterChange("status", e.target.value)}
//                                 >
//                                     <MenuItem value="">All</MenuItem>
//                                     {sortedStatuses.map((status) => (
//                                         <MenuItem
//                                             key={status}
//                                             value={status}
//                                         >
//                                             {status}
//                                         </MenuItem>
//                                     ))}
//                                 </TextField>
//                             </div>
//                         </div>

//                         <div className="card-body p-0">
//                             {/* Show Entries Dropdown */}
//                             <div className="flex items-center justify-between px-2 py-2">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm text-gray-700">Show</span>
//                                     <select
//                                         value={rowsPerPage === filteredOrders.length ? "All" : rowsPerPage}
//                                         onChange={handleRowsPerPageChange}
//                                         className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#053054]"
//                                     >
//                                         <option value={5}>5</option>
//                                         <option value={20}>20</option>
//                                         <option value={50}>50</option>
//                                         <option value={100}>100</option>
//                                         <option value="All">All</option>
//                                     </select>
//                                     <span className="text-sm text-gray-700">entries</span>
//                                 </div>
//                                 <span className="text-xs text-gray-500">
//                                     Page {currentPage} of {Math.ceil(filteredOrders.length / rowsPerPage) || 1}
//                                 </span>
//                             </div>

//                             {/* Table */}
//                             <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                                 <table className="table">
//                                     <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                         <tr className="table-row">
//                                             <th className="table-head border border-gray-300 capitalize">Order No.</th>
//                                             <th className="table-head border border-gray-300 capitalize">Date</th>
//                                             <th className="table-head border border-gray-300 capitalize">Payment Due Date</th>
//                                             <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                             <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                             <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                             <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                             <th className="table-head border border-gray-300 capitalize">Status</th>
//                                             <th className="table-head border border-gray-300 capitalize">Final Amount</th>
//                                             <th className="table-head border border-gray-300 capitalize">Payment</th>
//                                             <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="table-body text-[#433C50]">
//                                         {currentOrders.length === 0 ? (
//                                             <tr>
//                                                 <td
//                                                     colSpan="11"
//                                                     className="py-4 text-center text-gray-400"
//                                                 >
//                                                     No Orders found.
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             currentOrders.map((order, index) => (
//                                                 <tr
//                                                     key={index}
//                                                     className="table-row"
//                                                 >
//                                                     <td className="table-cell border border-gray-300">
//                                                         {prefix?.orderPrefix}-{order.orderNo}
//                                                     </td>
//                                                     <td className="table-cell border border-gray-300">{order.date}</td>
//                                                     <td
//                                                         className={`table-cell border border-gray-300 ${
//                                                             order.status === "Completed"
//                                                                 ? "bg-green-200"
//                                                                 : order.status === "Canceled"
//                                                                   ? "bg-red-200"
//                                                                   : order.status === "Pending"
//                                                                     ? "bg-gray-200"
//                                                                     : "bg-orange-200"
//                                                         }`}
//                                                     >
//                                                         {order.orderPaymentDetails && order.orderPaymentDetails.length > 0
//                                                             ? order.orderPaymentDetails.map((payment, idx) => (
//                                                                   <div key={payment.id}>
//                                                                       {idx + 1}) {payment.dueDate}
//                                                                   </div>
//                                                               ))
//                                                             : "N/A"}
//                                                     </td>
//                                                     <td className="table-cell border border-gray-300">{order.selectedCompany || "---"}</td>
//                                                     <td className="table-cell border border-gray-300">{order.customerPerson}</td>
//                                                     <td className="table-cell border border-gray-300">{order.mobile}</td>
//                                                     <td className="table-cell border border-gray-300">{order.email}</td>
//                                                     <td
//                                                         className={`table-cell border border-gray-300 font-semibold ${
//                                                             order.status === "Completed"
//                                                                 ? "text-green-600"
//                                                                 : order.status === "Canceled"
//                                                                   ? "text-red-600"
//                                                                   : order.status === "Pending"
//                                                                     ? "text-gray-600"
//                                                                     : "text-orange-600"
//                                                         }`}
//                                                     >
//                                                         {order.status || "Pending"}
//                                                     </td>

//                                                     <td className="table-cell border border-gray-300">{order.finalAmt}</td>
//                                                     <td className="table-cell border border-gray-300">
//                                                         <Button
//                                                             variant="gradient"
//                                                             className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-xs capitalize text-white hover:bg-green-700"
//                                                             onClick={() => navigate(`/orders/${order.id}/payments`)}
//                                                         >
//                                                             <RiSecurePaymentFill
//                                                                 size={16}
//                                                                 className="text-white"
//                                                             />
//                                                             Pay
//                                                         </Button>
//                                                     </td>
//                                                     <td className="table-cell border border-gray-300">
//                                                         <div className="flex items-center gap-x-4">
//                                                             {user?.role_name === "Super Admin" && (
//                                                                 <button
//                                                                     className="text-gray-700"
//                                                                     onClick={(e) => handleMenuOpen(e, order.id)}
//                                                                 >
//                                                                     <BsThreeDotsVertical size={20} />
//                                                                 </button>
//                                                             )}
//                                                             <button
//                                                                 className="text-blue-500"
//                                                                 onClick={() => handleEditClick(order.id)}
//                                                             >
//                                                                 <PencilLine size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-red-500"
//                                                                 onClick={() => handleDeleteClick(order.id)}
//                                                             >
//                                                                 <Trash size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-purple-500"
//                                                                 onClick={() => handleViewClick(order.id)}
//                                                             >
//                                                                 <File size={20} />
//                                                             </button>
//                                                             <button
//                                                                 className="text-orange-500"
//                                                                 onClick={() => {
//                                                                     setPrintOrder(order);
//                                                                     setTimeout(() => printRef.current?.print(), 300);
//                                                                 }}
//                                                             >
//                                                                 <Printer size={20} />
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         {/* ✅ Pagination Controls */}
//                         {filteredOrders.length > rowsPerPage && (
//                             <div className="mt-4 flex items-center justify-between">
//                                 <span className="text-sm text-gray-500">
//                                     Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredOrders.length)} of {filteredOrders.length}
//                                 </span>
//                                 <div className="flex items-center gap-3">
//                                     <IconButton
//                                         variant="text"
//                                         disabled={currentPage === 1}
//                                         onClick={() => setCurrentPage((prev) => prev - 1)}
//                                         className="flex items-center rounded-full"
//                                     >
//                                         <ChevronLeft />
//                                     </IconButton>

//                                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
//                                         {currentPage}
//                                     </div>

//                                     <IconButton
//                                         variant="text"
//                                         disabled={currentPage === totalPages}
//                                         onClick={() => setCurrentPage((prev) => prev + 1)}
//                                         className="flex items-center rounded-full"
//                                     >
//                                         <ChevronRight />
//                                     </IconButton>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </>
//             )}

//             <Menu
//                 anchorEl={anchorEl}
//                 open={user?.role_name === "Super Admin" && Boolean(anchorEl)}
//                 onClose={handleMenuClose}
//                 PaperProps={{
//                     elevation: 3,
//                     sx: { borderRadius: 2, mt: 1, minWidth: 200 },
//                 }}
//             >
//                 {sortedStatuses.map((status) => (
//                     <MenuItem
//                         key={status}
//                         onClick={() => handleStatusChange(status)}
//                         sx={{
//                             fontSize: "0.9rem",
//                             color: "#053054",
//                             "&:hover": { bgcolor: "#f5f5f5", color: "#000" },
//                         }}
//                     >
//                         {status}
//                         {/* Optional: Visual indicator for custom statuses */}
//                         {!defaultStatuses.includes(status) && <span className="ml-2 text-xs text-gray-500"></span>}
//                     </MenuItem>
//                 ))}
//             </Menu>

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

//                     <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this order?</Typography>

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

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={snackbarMessage ? snackbarSeverity : ""}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default Orders;


import { Button } from "@material-tailwind/react";
import { File, PencilLine, Trash, X, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaJediOrder } from "react-icons/fa6";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrders, deleteOrder, updateOrderStatus } from "../../redux/actions/order";
import { RiSecurePaymentFill } from "react-icons/ri";
import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField, MenuItem, Menu } from "@mui/material";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { getOrderStatus } from "../../redux/actions/orderStatus";
import OrderPrint from "./OrderPrint";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getPrefix } from "../../redux/actions/prefix";

const Orders = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const { snackbarMessage, snackbarSeverity, orders, loading } = useSelector((state) => state.order);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { prefix } = useSelector((state) => state.prefix);
    const printRef = useRef();
    const [printOrder, setPrintOrder] = useState(null);

    useEffect(() => {
        dispatch(getOrders());
        dispatch(getPrefix());
        dispatch(getOrderStatus());
        dispatch(clearSnackbar());
    }, [dispatch]);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (user.org_id) {
            dispatch(getCompanySetup(user.org_id));
        }
    }, [dispatch, user.org_id]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleCreateClick = () => {
        navigate("/orders/generate-order");
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

    const handleEditClick = (id) => {
        navigate(`/orders/edit-order/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/orders/view-order/${id}`);
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteOrder(selectedDeleteId));
        setSnackbarOpen(true);
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const orderStatusList = useSelector((state) => state.orderStatus.orderStatus || []);
    const defaultStatuses = ["Pending", "Completed", "Canceled"];
    const allStatuses = Array.from(new Set([...defaultStatuses, ...orderStatusList.map((item) => item.orderStatus.trim())])).filter(
        (status) => status,
    );
    const sortedStatuses = [...defaultStatuses, ...allStatuses.filter((s) => !defaultStatuses.includes(s)).sort()];

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        email: "",
        status: "",
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredOrders = orders.filter((order) => {
        // Convert order.date ("31-10-2025") → JS date
        const [day, month, year] = (order.date || "").split("-");
        const orderDate = new Date(`${year}-${month}-${day}`);

        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchesFromDate = fromDate ? orderDate >= fromDate : true;
        const matchesToDate = toDate ? orderDate <= toDate : true;

        const matchesCompany = filters.company ? order.selectedCompany?.toLowerCase().includes(filters.company.toLowerCase()) : true;

        const matchesCustomer = filters.customer ? order.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;

        const matchesMobile = filters.mobile ? order.mobile?.includes(filters.mobile) : true;

        const matchesEmail = filters.email ? order.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        const matchesStatus = filters.status ? order.status === filters.status : true;

        return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail && matchesStatus;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredOrders.length);
            setCurrentPage(1);
        } else {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
        }
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const handleMenuOpen = (event, orderId) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrderId(orderId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedOrderId(null);
    };

    const handleStatusChange = (status) => {
        if (selectedOrderId) {
            dispatch(updateOrderStatus(selectedOrderId, status));
        }
        handleMenuClose();
        setSnackbarOpen(true);
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <>
                    <OrderPrint
                        ref={printRef}
                        companyName={companySetup?.companyName || ""}
                        companyLogo={companySetup?.companyLogo || ""}
                        order={printOrder}
                        prefix={prefix}
                    />
                    <div className="card">
                        <div className="flex items-center justify-between text-nowrap">
                            <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Order's List :</div>
                            <Button
                                onClick={handleCreateClick}
                                variant="gradient"
                                className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                            >
                                <FaJediOrder size={20} />
                                Generate Order
                            </Button>
                        </div>

                        {/* ===== Filter Box ===== */}
                        <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
                            <Typography
                                variant="subtitle1"
                                className="mb-2 font-semibold text-[#053054]"
                            >
                                Filters
                            </Typography>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                                <TextField
                                    label="Status"
                                    size="small"
                                    select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {sortedStatuses.map((status) => (
                                        <MenuItem
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {/* Show Entries Dropdown */}
                            <div className="flex items-center justify-between px-2 py-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Show</span>
                                    <select
                                        value={rowsPerPage === filteredOrders.length ? "All" : rowsPerPage}
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
                                    Page {currentPage} of {Math.ceil(filteredOrders.length / rowsPerPage) || 1}
                                </span>
                            </div>

                            {/* Table */}
                            <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                                <table className="table">
                                    <thead className="table-header text-nowrap bg-[#053054] text-white">
                                        <tr className="table-row">
                                            <th className="table-head border border-gray-300 capitalize">Order No.</th>
                                            <th className="table-head border border-gray-300 capitalize">Date</th>
                                            <th className="table-head border border-gray-300 capitalize">Payment Due Date</th>
                                            <th className="table-head border border-gray-300 capitalize">Company Name</th>
                                            <th className="table-head border border-gray-300 capitalize">Customer Name</th>
                                            <th className="table-head border border-gray-300 capitalize">Mobile No</th>
                                            <th className="table-head border border-gray-300 capitalize">Email Id</th>
                                            <th className="table-head border border-gray-300 capitalize">Status</th>
                                            <th className="table-head border border-gray-300 capitalize">Final Amount</th>
                                            <th className="table-head border border-gray-300 capitalize">Payment</th>
                                            <th className="table-head border border-gray-300 capitalize">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-body text-[#433C50]">
                                        {currentOrders.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="11"
                                                    className="py-4 text-center text-gray-400"
                                                >
                                                    No Orders found.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentOrders.map((order, index) => (
                                                <tr
                                                    key={index}
                                                    className="table-row"
                                                >
                                                    <td className="table-cell border border-gray-300">
                                                        {prefix?.orderPrefix}-{order.orderNo}
                                                    </td>
                                                    <td className="table-cell border border-gray-300">{order.date}</td>
                                                    <td
                                                        className={`table-cell border border-gray-300 ${
                                                            order.status === "Completed"
                                                                ? "bg-green-200"
                                                                : order.status === "Canceled"
                                                                  ? "bg-red-200"
                                                                  : order.status === "Pending"
                                                                    ? "bg-gray-200"
                                                                    : "bg-orange-200"
                                                        }`}
                                                    >
                                                        {order.orderPaymentDetails && order.orderPaymentDetails.length > 0
                                                            ? order.orderPaymentDetails.map((payment, idx) => (
                                                                  <div key={payment.id}>
                                                                      {idx + 1}) {payment.dueDate}
                                                                  </div>
                                                              ))
                                                            : "N/A"}
                                                    </td>
                                                    <td className="table-cell border border-gray-300">{order.selectedCompany || "---"}</td>
                                                    <td className="table-cell border border-gray-300">{order.customerPerson}</td>
                                                    <td className="table-cell border border-gray-300">{order.mobile}</td>
                                                    <td className="table-cell border border-gray-300">{order.email}</td>
                                                    <td
                                                        className={`table-cell border border-gray-300 font-semibold ${
                                                            order.status === "Completed"
                                                                ? "text-green-600"
                                                                : order.status === "Canceled"
                                                                  ? "text-red-600"
                                                                  : order.status === "Pending"
                                                                    ? "text-gray-600"
                                                                    : "text-orange-600"
                                                        }`}
                                                    >
                                                        {order.status || "Pending"}
                                                    </td>

                                                    <td className="table-cell border border-gray-300">{order.finalAmt}</td>
                                                    <td className="table-cell border border-gray-300">
                                                        <Button
                                                            variant="gradient"
                                                            className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-xs capitalize text-white hover:bg-green-700"
                                                            onClick={() => navigate(`/orders/${order.id}/payments`)}
                                                        >
                                                            <RiSecurePaymentFill
                                                                size={16}
                                                                className="text-white"
                                                            />
                                                            Pay
                                                        </Button>
                                                    </td>
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-x-4">
                                                            {user?.role_name === "Super Admin" && (
                                                                <button
                                                                    className="text-gray-700"
                                                                    onClick={(e) => handleMenuOpen(e, order.id)}
                                                                >
                                                                    <BsThreeDotsVertical size={20} />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="text-blue-500"
                                                                onClick={() => handleEditClick(order.id)}
                                                            >
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button
                                                                className="text-red-500"
                                                                onClick={() => handleDeleteClick(order.id)}
                                                            >
                                                                <Trash size={20} />
                                                            </button>
                                                            <button
                                                                className="text-purple-500"
                                                                onClick={() => handleViewClick(order.id)}
                                                            >
                                                                <File size={20} />
                                                            </button>
                                                            <button
                                                                className="text-orange-500"
                                                                onClick={() => {
                                                                    setPrintOrder(order);
                                                                    setTimeout(() => printRef.current?.print(), 300);
                                                                }}
                                                            >
                                                                <Printer size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ✅ Pagination Controls */}
                        {filteredOrders.length > rowsPerPage && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredOrders.length)} of {filteredOrders.length}
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
                </>
            )}

            <Menu
                anchorEl={anchorEl}
                open={user?.role_name === "Super Admin" && Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2, mt: 1, minWidth: 200 },
                }}
            >
                {sortedStatuses.map((status) => (
                    <MenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        sx={{
                            fontSize: "0.9rem",
                            color: "#053054",
                            "&:hover": { bgcolor: "#f5f5f5", color: "#000" },
                        }}
                    >
                        {status}
                        {/* Optional: Visual indicator for custom statuses */}
                        {!defaultStatuses.includes(status) && <span className="ml-2 text-xs text-gray-500"></span>}
                    </MenuItem>
                ))}
            </Menu>

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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this order?</Typography>

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

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : ""}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Orders;