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
import { ChevronDown, ChevronLeft, ChevronRight, File, Inbox, IndianRupee, PencilLine, Printer, ReceiptText, SlidersHorizontal, Trash, TrendingUp, X } from "lucide-react";
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
import { useSessionToggle } from "../../hooks/use-session-toggle";

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
    const [filtersOpen, setFiltersOpen] = useSessionToggle("crm:order-filters-open", false);

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
    const totalOrderValue = orders.reduce((sum, order) => sum + Number(order.finalAmt || 0), 0);
    const filteredOrderValue = filteredOrders.reduce((sum, order) => sum + Number(order.finalAmt || 0), 0);
    const visibleStart = filteredOrders.length === 0 ? 0 : startIndex + 1;
    const visibleEnd = Math.min(startIndex + rowsPerPage, filteredOrders.length);

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
                    <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8">
                        <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#053054] p-6 text-white shadow-2xl shadow-blue-200/70 md:p-8">
                            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                        <ReceiptText size={14} />
                                        CRM Orders
                                    </div>
                                    <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Order's List</h1>
                                    <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                        Track confirmed orders, payment due dates, status, order value, and customer activity from one workspace.
                                    </p>
                                </div>
                            <Button
                                onClick={handleCreateClick}
                                    variant="filled"
                                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black capitalize text-[#053054] shadow-xl shadow-slate-950/10 transition hover:scale-[1.02]"
                            >
                                <FaJediOrder size={20} />
                                Generate Order
                            </Button>
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: "Total orders", value: orders.length, icon: ReceiptText, tone: "from-blue-500 to-blue-700", helper: "All order records" },
                                { label: "Visible after filters", value: filteredOrders.length, icon: SlidersHorizontal, tone: "from-cyan-500 to-blue-600", helper: "Current list result" },
                                { label: "Total value", value: `₹${totalOrderValue}`, icon: IndianRupee, tone: "from-emerald-500 to-teal-600", helper: "All order value" },
                                { label: "Filtered value", value: `₹${filteredOrderValue}`, icon: TrendingUp, tone: "from-violet-500 to-indigo-600", helper: "Visible order value" },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100">
                                        <div className="mb-5 flex items-start justify-between">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg shadow-blue-100`}>
                                                <Icon size={22} />
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">Live</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">{item.label}</p>
                                        <div className="mt-2 text-3xl font-black tracking-normal text-slate-950">{item.value}</div>
                                        <p className="mt-2 text-xs font-semibold text-slate-400">{item.helper}</p>
                                    </div>
                                );
                            })}
                        </section>

                        {/* ===== Filter Box ===== */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
                            <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-blue-50" aria-expanded={filtersOpen}>
                                <span className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-blue-600" />{filtersOpen ? "Hide Filters" : "Show Filters"}</span>
                                <ChevronDown size={18} className={`transition ${filtersOpen ? "rotate-180" : ""}`} />
                            </button>
                            {filtersOpen && <div className="crm-filter-panel mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
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
                            </div>}
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                            {/* Show Entries Dropdown */}
                            <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-600">Show</span>
                                    <select
                                        value={rowsPerPage === filteredOrders.length ? "All" : rowsPerPage}
                                        onChange={handleRowsPerPageChange}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2563EB] focus:bg-white"
                                    >
                                        <option value={5}>5</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value="All">All</option>
                                    </select>
                                    <span className="text-sm font-bold text-slate-600">entries</span>
                                </div>
                                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                    Page {currentPage} of {Math.ceil(filteredOrders.length / rowsPerPage) || 1}
                                </span>
                            </div>

                            {/* Table */}
                            <div className="relative w-full flex-shrink-0 overflow-auto [scrollbar-width:_thin]">
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
                                                    className="px-4 py-14 text-center"
                                                >
                                                    <div className="mx-auto flex max-w-md flex-col items-center">
                                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                            <Inbox size={30} />
                                                        </div>
                                                        <div className="text-xl font-black text-slate-900">No orders found.</div>
                                                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                                            Generate your first order to start tracking payments, due dates, and status.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentOrders.map((order, index) => (
                                                <tr
                                                    key={index}
                                                    className="table-row transition hover:bg-blue-50/60"
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
                                                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black capitalize text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
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
                                                        <div className="flex items-center gap-x-2">
                                                            {user?.role_name === "Super Admin" && (
                                                                <button
                                                                    className="rounded-xl bg-slate-50 p-2 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                                                                    onClick={(e) => handleMenuOpen(e, order.id)}
                                                                >
                                                                    <BsThreeDotsVertical size={20} />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="rounded-xl bg-blue-50 p-2 text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100"
                                                                onClick={() => handleEditClick(order.id)}
                                                            >
                                                                <PencilLine size={18} />
                                                            </button>
                                                            <button
                                                                className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
                                                                onClick={() => handleDeleteClick(order.id)}
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                            <button
                                                                className="rounded-xl bg-violet-50 p-2 text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-100"
                                                                onClick={() => handleViewClick(order.id)}
                                                            >
                                                                <File size={18} />
                                                            </button>
                                                            <button
                                                                className="rounded-xl bg-orange-50 p-2 text-orange-600 transition hover:-translate-y-0.5 hover:bg-orange-100"
                                                                onClick={() => {
                                                                    setPrintOrder(order);
                                                                    setTimeout(() => printRef.current?.print(), 300);
                                                                }}
                                                            >
                                                                <Printer size={18} />
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
                            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm font-bold text-slate-500">
                                    Showing {visibleStart} - {visibleEnd} of {filteredOrders.length}
                                </span>
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                        className="flex items-center rounded-full border border-slate-200"
                                    >
                                        <ChevronLeft />
                                    </IconButton>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#053054] font-black text-white shadow-lg shadow-slate-300">
                                        {currentPage}
                                    </div>

                                    <IconButton
                                        variant="text"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                        className="flex items-center rounded-full border border-slate-200"
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
