// import { File, Trash } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import FollowupModal from "./FollowupModal";

// const Followup = () => {
//     const [followupList, setFollowupList] = useState([]);
//     const [selectedFollowup, setSelectedFollowup] = useState(null);

//     useEffect(() => {
//         const storedFollowupList = JSON.parse(localStorage.getItem("followups")) || [];
//         setFollowupList(storedFollowupList);
//     }, []);

//     const handleDelete = (indexToDelete) => {
//         const updatedFollowups = followupList.filter((_, index) => index !== indexToDelete);
//         setFollowupList(updatedFollowups);
//         localStorage.setItem("followups", JSON.stringify(updatedFollowups));
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="text-nowrap text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Follow-Up List :</div>
//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Follow Up No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Follow up Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product</th>
//                                     <th className="table-head border border-gray-300 capitalize">HSN Code</th>
//                                     <th className="table-head border border-gray-300 capitalize">Quantity</th>
//                                     <th className="table-head border border-gray-300 capitalize">Total</th>
//                                     <th className="table-head border border-gray-300 capitalize">Final Amount</th>
//                                     <th className="table-head border border-gray-300 capitalize">Assigned To</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {followupList.length > 0 ? (
//                                     followupList.map((followup, index) => (
//                                         <tr
//                                             className="table-row"
//                                             key={index}
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{followup.followupDate}</td>
//                                             <td className="table-cell border border-gray-300">{followup.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300">{followup.mobile}</td>
//                                             <td className="table-cell border border-gray-300">{followup.email}</td>
//                                             {(() => {
//                                                 const intrastateList = followup.productDetails?.intrastate || [];
//                                                 const interstateList = followup.productDetails?.interstate || [];
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
//                                             <td className="table-cell border border-gray-300">{followup.finalAmt}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {Array.isArray(followup.assignedTo) ? followup.assignedTo.join(", ") : followup.assignedTo}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         title="View"
//                                                         className="text-purple-500"
//                                                         onClick={() => setSelectedFollowup({ ...followup, leadNo: index + 1 })}
//                                                     >
//                                                         <File size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDelete(index)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             className="table-cell text-center"
//                                             colSpan="9"
//                                         >
//                                             No Follow-Up Data found.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//             {/* Imported Modal Component */}
//             <FollowupModal
//                 open={Boolean(selectedFollowup)}
//                 onClose={() => setSelectedFollowup(null)}
//                 followup={selectedFollowup}
//             />
//         </>
//     );
// };

// export default Followup;

// import { File, ChevronLeft, ChevronRight, PhoneCall } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import FollowupModal from "./FollowupModal";
// import { useDispatch, useSelector } from "react-redux";
// import { getLeads } from "../../redux/actions/leadAndFollowup";
// import { getEmployees } from "../../redux/actions/employee";
// import { CircularProgress, TextField, Autocomplete, Chip, Typography, IconButton } from "@mui/material";
// import { FaWhatsapp } from "react-icons/fa";

// const Followup = () => {
//     const dispatch = useDispatch();
//     const [selectedFollowup, setSelectedFollowup] = useState(null);

//     const { leads, leadLoading } = useSelector((state) => state.leadAndFollowup);
//     const { employees } = useSelector((state) => state.employee);

//     const fetchLeads = () => {
//         dispatch(getLeads());
//     };

//     useEffect(() => {
//         fetchLeads();
//         dispatch(getEmployees());
//     }, [dispatch]);

//     // Flatten followups from all leads
//     const followupList = leads.flatMap(
//         (lead) =>
//             lead.followups?.map((followup) => ({
//                 ...followup,
//                 leadId: lead.id,
//                 companyName: lead.companyName,
//                 customerPerson: lead.customerPerson,
//                 mobile: lead.mobile,
//                 email: lead.email,
//                 productDetails: lead.products,
//                 assignedTo: lead.assignedTo,
//             })) || [],
//     );

//     const getFollowupDateClass = (dateStr) => {
//         if (!dateStr) return "bg-blue-200"; // default

//         // Convert "DD-MM-YYYY" → Date object
//         const [day, month, year] = dateStr.split("-");
//         const followupDate = new Date(`${year}-${month}-${day}`);

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         followupDate.setHours(0, 0, 0, 0);

//         if (followupDate.getTime() === today.getTime()) {
//             return "bg-green-200"; // TODAY
//         } else if (followupDate < today) {
//             return "bg-red-200"; // PAST DATE
//         } else {
//             return "bg-blue-200"; // FUTURE DATE
//         }
//     };

//     // ================= Filters =================
//     const [filters, setFilters] = useState({
//         fromDate: "",
//         toDate: "",
//         company: "",
//         customer: "",
//         mobile: "",
//         email: "",
//         assignedTo: [],
//     });

//     const handleFilterChange = (key, value) => {
//         setFilters((prev) => ({ ...prev, [key]: value }));
//     };

//     const formatEmployeeName = (emp) => {
//         if (!emp) return "";
//         const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
//         return `${fullName}`;
//     };

//     // ✅ Filter Followups with all filters including date range
//     const filteredFollowups = followupList.filter((f) => {
//         // Convert followup_date "DD-MM-YYYY" safely to Date
//         const [day, month, year] = (f.followup_date || "").split("-");
//         const followupDate = year && month && day ? new Date(`${year}-${month}-${day}`) : null;

//         const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
//         const toDate = filters.toDate ? new Date(filters.toDate) : null;

//         const matchesFromDate = fromDate ? followupDate >= fromDate : true;
//         const matchesToDate = toDate ? followupDate <= toDate : true;

//         const matchesCompany = filters.company ? f.companyName?.toLowerCase().includes(filters.company.toLowerCase()) : true;
//         const matchesCustomer = filters.customer ? f.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;
//         const matchesMobile = filters.mobile ? f.mobile?.toLowerCase().includes(filters.mobile.toLowerCase()) : true;
//         const matchesEmail = filters.email ? f.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

//         const matchesAssignedTo =
//             filters.assignedTo.length > 0
//                 ? filters.assignedTo.some((selectedEmp) => {
//                       const empName = formatEmployeeName(selectedEmp);
//                       if (Array.isArray(f.assignedTo)) {
//                           return f.assignedTo.some((name) => name.toLowerCase().includes(empName.toLowerCase()));
//                       }
//                       return (f.assignedTo || "").toLowerCase().includes(empName.toLowerCase());
//                   })
//                 : true;

//         return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail && matchesAssignedTo;
//     });

//     // ================= Pagination =================
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(5);

//     const totalPages = Math.ceil(filteredFollowups.length / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const currentFollowups = filteredFollowups.slice(startIndex, startIndex + rowsPerPage);

//     const handleRowsPerPageChange = (e) => {
//         const value = e.target.value;
//         if (value === "All") {
//             setRowsPerPage(filteredFollowups.length);
//             setCurrentPage(1);
//         } else {
//             setRowsPerPage(Number(value));
//             setCurrentPage(1);
//         }
//     };

//     // const handleCallClick = (mobile) => {
//     //     if (!mobile) return;

//     //     const cleanedMobile = mobile.replace(/\D/g, ""); // removes spaces/symbols
//     //     window.location.href = `tel:${cleanedMobile}`;
//     // };

//     const handleCallClick = (mobile) => {
//         if (!mobile?.trim()) return;

//         // Remove only whitespace — keep + and digits
//         const cleaned = mobile.replace(/\s+/g, '');

//         // Very basic validation
//         if (!cleaned.match(/^\+\d{8,15}$/)) {
//             console.warn("Possibly invalid number for tel: URI →", cleaned);
//             // You can still proceed, most dialers are forgiving
//         }

//         window.location.href = `tel:${cleaned}`;
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

//     return (
//         <>
//             {leadLoading ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="card">
//                     {/* Header */}
//                     <div className="text-nowrap text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Follow-Up List :</div>

//                     {/* ===== Filter Box ===== */}
//                     <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
//                         <Typography
//                             variant="subtitle1"
//                             className="mb-2 font-semibold text-[#053054]"
//                         >
//                             Filters
//                         </Typography>
//                         <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                             {/* ✅ From Date / To Date Filters */}
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

//                     {/* ===== Show Entries ===== */}
//                     <div className="flex items-center justify-between px-2 py-2">
//                         <div className="flex items-center gap-2">
//                             <span className="text-sm text-gray-700">Show</span>
//                             <select
//                                 value={rowsPerPage === filteredFollowups.length ? "All" : rowsPerPage}
//                                 onChange={handleRowsPerPageChange}
//                                 className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#053054]"
//                             >
//                                 <option value={5}>5</option>
//                                 <option value={20}>20</option>
//                                 <option value={50}>50</option>
//                                 <option value={100}>100</option>
//                                 <option value="All">All</option>
//                             </select>
//                             <span className="text-sm text-gray-700">entries</span>
//                         </div>
//                         <span className="text-xs text-gray-500">
//                             Page {currentPage} of {Math.ceil(filteredFollowups.length / rowsPerPage) || 1}
//                         </span>
//                     </div>

//                     {/* ===== Table ===== */}
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Follow up Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product</th>
//                                     <th className="table-head border border-gray-300 capitalize">Assigned To</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {currentFollowups.length > 0 ? (
//                                     currentFollowups.map((followup, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{startIndex + index + 1}</td>
//                                             <td className={`table-cell border border-gray-300 ${getFollowupDateClass(followup.followup_date)}`}>
//                                                 {followup.followup_date || "-"}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{followup.companyName || "---"}</td>
//                                             <td className="table-cell border border-gray-300">{followup.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300">{followup.mobile || "-"}</td>
//                                             <td className="table-cell border border-gray-300">{followup.email || "-"}</td>
//                                             <td className="table-cell text-nowrap border border-gray-300">
//                                                 {Array.isArray(followup.productDetails)
//                                                     ? followup.productDetails.map((item, i) => (
//                                                           <div key={i}>
//                                                               {i + 1}) {item.product}
//                                                           </div>
//                                                       ))
//                                                     : "-"}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {Array.isArray(followup.assignedTo) && followup.assignedTo.length > 0
//                                                     ? followup.assignedTo.map((a, i) => (
//                                                           <div key={i}>
//                                                               {i + 1}) {a}
//                                                           </div>
//                                                       ))
//                                                     : "-"}
//                                             </td>
//                                             <td className="table-cell border border-gray-300 text-center">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         title="View"
//                                                         className="text-purple-500"
//                                                         onClick={() => setSelectedFollowup({ ...followup })}
//                                                     >
//                                                         <File size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-blue-600"
//                                                         onClick={() => handleCallClick(followup.mobile)}
//                                                     >
//                                                         <PhoneCall size={22} />
//                                                     </button>
//                                                     <button
//                                                         className="text-green-600"
//                                                         onClick={() =>
//                                                             handleWhatsAppClick(followup.mobile, `${followup.customerPerson || ""}`.trim())
//                                                         }
//                                                     >
//                                                         <FaWhatsapp size={22} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             colSpan="9"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Follow-Up Data found.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* ===== Pagination Controls ===== */}
//                     {filteredFollowups.length > rowsPerPage && (
//                         <div className="mt-4 flex items-center justify-between">
//                             <span className="text-sm text-gray-500">
//                                 Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredFollowups.length)} of{" "}
//                                 {filteredFollowups.length}
//                             </span>
//                             <div className="flex items-center gap-3">
//                                 <IconButton
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage((prev) => prev - 1)}
//                                 >
//                                     <ChevronLeft />
//                                 </IconButton>
//                                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
//                                     {currentPage}
//                                 </div>
//                                 <IconButton
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage((prev) => prev + 1)}
//                                 >
//                                     <ChevronRight />
//                                 </IconButton>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Modal */}
//             <FollowupModal
//                 open={Boolean(selectedFollowup)}
//                 onClose={() => setSelectedFollowup(null)}
//                 followup={selectedFollowup}
//                 onFollowupAdded={fetchLeads}
//             />
//         </>
//     );
// };

// export default Followup;

import { AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, File, Inbox, PhoneCall, Search, SlidersHorizontal, Target, UserCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import FollowupModal from "./FollowupModal";
import { useDispatch, useSelector } from "react-redux";
import { getLeads, markFollowupCompleted } from "../../redux/actions/leadAndFollowup";
import { getEmployees } from "../../redux/actions/employee";
import { CircularProgress, TextField, Autocomplete, Chip, Typography, IconButton } from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";
import { useSessionToggle } from "../../hooks/use-session-toggle";

const Followup = () => {
    const dispatch = useDispatch();
    const [selectedFollowup, setSelectedFollowup] = useState(null);

    const { leads, leadLoading } = useSelector((state) => state.leadAndFollowup);
    const { employees } = useSelector((state) => state.employee);
    const [completingFollowups, setCompletingFollowups] = useState({});
    const [activeBucket, setActiveBucket] = useState("all");

    const fetchLeads = () => {
        dispatch(getLeads());
    };

    useEffect(() => {
        fetchLeads();
        dispatch(getEmployees());
    }, [dispatch]);

    // Flatten followups from all leads
    const followupList = leads.flatMap(
        (lead) =>
            lead.followups?.map((followup) => ({
                ...followup,
                leadId: lead.id,
                companyName: lead.companyName,
                customerPerson: lead.customerPerson,
                mobile: lead.mobile,
                email: lead.email,
                productDetails: lead.products,
                assignedTo: lead.assignedTo,
            })) || [],
    );

    const getFollowupDateClass = (dateStr) => {
        if (!dateStr) return "bg-blue-200"; // default

        // Convert "DD-MM-YYYY" → Date object
        const [day, month, year] = dateStr.split("-");
        const followupDate = new Date(`${year}-${month}-${day}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        followupDate.setHours(0, 0, 0, 0);

        if (followupDate.getTime() === today.getTime()) {
            return "bg-blue-100 text-blue-800"; // TODAY
        } else if (followupDate < today) {
            return "bg-orange-100 text-orange-800"; // PAST DATE
        } else {
            return "bg-purple-100 text-purple-800"; // FUTURE DATE
        }
    };

    const getFollowupDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-");
        if (!day || !month || !year) return null;
        const date = new Date(`${year}-${month}-${day}`);
        date.setHours(0, 0, 0, 0);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const getDueBucket = (followup) => {
        if (followup?.isCompleted) return "completed";
        const date = getFollowupDate(followup?.followup_date);
        if (!date) return "unscheduled";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) return "today";
        if (date < today) return "overdue";
        return "upcoming";
    };

    // ================= Filters =================
    const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem("crm:followup-filters") || "null") || ({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        email: "",
        assignedTo: [],
    }));
    const [filtersOpen, setFiltersOpen] = useSessionToggle("crm:followup-filters-open", false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        localStorage.setItem("crm:followup-filters", JSON.stringify(filters));
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const formatEmployeeName = (emp) => {
        if (!emp) return "";
        const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
        return `${fullName}`;
    };

    const handleMarkCompleted = async (followup) => {
        if (!followup || !followup.id) return;

        // Prevent double-clicking
        if (completingFollowups[followup.id]) return;

        try {
            setCompletingFollowups((prev) => ({ ...prev, [followup.id]: true }));

            // Dispatch action to mark followup as completed
            await dispatch(markFollowupCompleted(followup.id));

            // Refresh the leads to get updated data
            fetchLeads();
        } catch (error) {
            console.error("Error marking followup as completed:", error);
        } finally {
            setCompletingFollowups((prev) => ({ ...prev, [followup.id]: false }));
        }
    };

    const bucketCounts = followupList.reduce(
        (acc, followup) => {
            const bucket = getDueBucket(followup);
            acc[bucket] = (acc[bucket] || 0) + 1;
            acc.all += 1;
            return acc;
        },
        { all: 0, overdue: 0, today: 0, upcoming: 0, completed: 0, unscheduled: 0 },
    );

    const topPriorityFollowups = followupList
        .filter((followup) => ["overdue", "today"].includes(getDueBucket(followup)))
        .sort((a, b) => (getFollowupDate(a.followup_date)?.getTime() || 0) - (getFollowupDate(b.followup_date)?.getTime() || 0))
        .slice(0, 5);

    // ✅ Filter Followups with all filters including date range
    const filteredFollowups = followupList.filter((f) => {
        // Convert followup_date "DD-MM-YYYY" safely to Date
        const followupDate = getFollowupDate(f.followup_date);

        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchesFromDate = fromDate ? followupDate >= fromDate : true;
        const matchesToDate = toDate ? followupDate <= toDate : true;

        const matchesCompany = filters.company ? f.companyName?.toLowerCase().includes(filters.company.toLowerCase()) : true;
        const matchesCustomer = filters.customer ? f.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;
        const matchesMobile = filters.mobile ? f.mobile?.toLowerCase().includes(filters.mobile.toLowerCase()) : true;
        const matchesEmail = filters.email ? f.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        const matchesAssignedTo =
            filters.assignedTo.length > 0
                ? filters.assignedTo.some((selectedEmp) => {
                      const empName = formatEmployeeName(selectedEmp);
                      if (Array.isArray(f.assignedTo)) {
                          return f.assignedTo.some((name) => name.toLowerCase().includes(empName.toLowerCase()));
                      }
                      return (f.assignedTo || "").toLowerCase().includes(empName.toLowerCase());
                  })
                : true;

        const matchesBucket = activeBucket === "all" ? true : getDueBucket(f) === activeBucket;

        return matchesBucket && matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail && matchesAssignedTo;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [activeBucket, filters]);

    // ================= Pagination =================
    const totalPages = Math.ceil(filteredFollowups.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentFollowups = filteredFollowups.slice(startIndex, startIndex + rowsPerPage);
    const completedFollowups = bucketCounts.completed;
    const pendingFollowups = Math.max(followupList.length - completedFollowups, 0);
    const assignedCount = followupList.filter((f) => Array.isArray(f.assignedTo) ? f.assignedTo.length > 0 : Boolean(f.assignedTo)).length;
    const visibleStart = filteredFollowups.length === 0 ? 0 : startIndex + 1;
    const visibleEnd = Math.min(startIndex + rowsPerPage, filteredFollowups.length);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredFollowups.length);
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

    return (
        <>
            {leadLoading ? (
                <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-10 py-8 shadow-xl shadow-slate-200/70">
                        <CircularProgress />
                        <p className="mt-4 text-sm font-bold text-slate-500">Preparing follow-up center...</p>
                    </div>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8">
                    <section className="relative overflow-hidden rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#053054] p-5 text-white shadow-2xl shadow-blue-200/70 md:p-6">
                        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                    <Target size={14} />
                                    Follow-up Center
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Today&apos;s Follow-up Workbench</h1>
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Focus on overdue conversations, calls due today, upcoming commitments, and completed customer touchpoints.
                                </p>
                            </div>
                            <div className="grid min-w-full grid-cols-2 gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur xl:min-w-[420px]">
                                <div className="rounded-2xl bg-white/10 p-4">
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Overdue</p>
                                    <p className="mt-2 text-3xl font-black">{bucketCounts.overdue}</p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-4">
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Due Today</p>
                                    <p className="mt-2 text-3xl font-black">{bucketCounts.today}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: "Total follow-ups", value: followupList.length, icon: CalendarClock, tone: "bg-blue-50 text-blue-600", helper: "All scheduled work" },
                            { label: "Due today", value: bucketCounts.today, icon: Target, tone: "bg-cyan-50 text-cyan-600", helper: "Needs action now" },
                            { label: "Completed", value: completedFollowups, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600", helper: "Marked done" },
                            { label: "Pending", value: pendingFollowups, icon: UserCheck, tone: "bg-orange-50 text-orange-600", helper: `${assignedCount} assigned` },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
                                    <div className="mb-5 flex items-start justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">Live</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">{item.label}</p>
                                    <div className="mt-2 text-4xl font-black tracking-normal text-slate-950">{item.value}</div>
                                    <p className="mt-2 text-xs font-semibold text-slate-400">{item.helper}</p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
                            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">Follow-up Queue</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Switch between due buckets before using detailed filters.</p>
                                </div>
                                <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-800 transition hover:border-blue-200 hover:bg-blue-50" aria-expanded={filtersOpen}>
                                    <SlidersHorizontal size={17} className="text-blue-600" />
                                    {filtersOpen ? "Hide Filters" : "Advanced Filters"}
                                    <ChevronDown size={18} className={`transition ${filtersOpen ? "rotate-180" : ""}`} />
                                </button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                {[
                                    { key: "all", label: "All", value: bucketCounts.all, tone: "border-slate-200 text-slate-700" },
                                    { key: "overdue", label: "Overdue", value: bucketCounts.overdue, tone: "border-orange-200 text-orange-700" },
                                    { key: "today", label: "Today", value: bucketCounts.today, tone: "border-blue-200 text-blue-700" },
                                    { key: "upcoming", label: "Upcoming", value: bucketCounts.upcoming, tone: "border-violet-200 text-violet-700" },
                                    { key: "completed", label: "Completed", value: bucketCounts.completed, tone: "border-emerald-200 text-emerald-700" },
                                ].map((bucket) => (
                                    <button
                                        key={bucket.key}
                                        type="button"
                                        onClick={() => setActiveBucket(bucket.key)}
                                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${bucket.tone} ${activeBucket === bucket.key ? "bg-slate-950 text-white shadow-lg shadow-slate-200" : "bg-white hover:bg-slate-50"}`}
                                    >
                                        <span className="text-sm font-black">{bucket.label}</span>
                                        <span className="text-lg font-black">{bucket.value}</span>
                                    </button>
                                ))}
                            </div>

                            {filtersOpen && <div className="crm-filter-panel mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* ✅ From Date / To Date Filters */}
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
                        </div>}
                        </div>

                        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-950">Priority Focus</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Overdue and today&apos;s conversations.</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                    <AlertTriangle size={21} />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {topPriorityFollowups.length ? (
                                    topPriorityFollowups.map((followup) => (
                                        <button
                                            key={followup.id}
                                            type="button"
                                            onClick={() => setSelectedFollowup({ ...followup })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-black text-slate-950">{followup.companyName || "---"}</p>
                                                    <p className="mt-1 truncate text-xs font-bold text-slate-500">{followup.customerPerson || "Customer not set"}</p>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${getDueBucket(followup) === "overdue" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                                    {getDueBucket(followup)}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">{followup.followup_date || "No date"}</p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                                        <Inbox className="mx-auto text-slate-300" size={28} />
                                        <p className="mt-3 text-sm font-black text-slate-700">No urgent follow-ups</p>
                                        <p className="mt-1 text-xs font-semibold text-slate-500">Overdue and today items will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </section>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                    {/* ===== Show Entries ===== */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Search size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-950">Follow-up Details</h2>
                                <p className="text-sm font-semibold text-slate-500">Showing {visibleStart} - {visibleEnd} of {filteredFollowups.length} follow-ups</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">Rows</span>
                            <select
                                value={rowsPerPage === filteredFollowups.length ? "All" : rowsPerPage}
                                onChange={handleRowsPerPageChange}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2563EB] focus:bg-white"
                            >
                                <option value={5}>5</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="All">All</option>
                            </select>
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                Page {currentPage} of {Math.ceil(filteredFollowups.length / rowsPerPage) || 1}
                            </span>
                        </div>
                    </div>

                    {/* ===== Table ===== */}
                    <div className="relative w-full flex-shrink-0 overflow-auto [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header text-nowrap bg-[#053054] text-white">
                                <tr className="table-row">
                                    <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                    <th className="table-head border border-gray-300 capitalize">Follow up Date</th>
                                    <th className="table-head border border-gray-300 capitalize">Company Name</th>
                                    <th className="table-head border border-gray-300 capitalize">Customer Name</th>
                                    <th className="table-head border border-gray-300 capitalize">Mobile No</th>
                                    <th className="table-head border border-gray-300 capitalize">Email Id</th>
                                    <th className="table-head border border-gray-300 capitalize">Product</th>
                                    <th className="table-head border border-gray-300 capitalize">Assigned To</th>
                                    <th className="table-head border border-gray-300 capitalize">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body text-[#433C50]">
                                {currentFollowups.length > 0 ? (
                                    currentFollowups.map((followup, index) => (
                                        <tr
                                            key={index}
                                            className="table-row transition hover:bg-blue-50/60"
                                        >
                                            <td className="table-cell border border-gray-300">{startIndex + index + 1}</td>
                                            <td className={`table-cell border border-gray-300 ${getFollowupDateClass(followup.followup_date)}`}>
                                                {followup.followup_date || "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300">{followup.companyName || "---"}</td>
                                            <td className="table-cell border border-gray-300">{followup.customerPerson}</td>
                                            <td className="table-cell border border-gray-300">{followup.mobile || "-"}</td>
                                            <td className="table-cell border border-gray-300">{followup.email || "-"}</td>
                                            <td className="table-cell text-nowrap border border-gray-300">
                                                {Array.isArray(followup.productDetails)
                                                    ? followup.productDetails.map((item, i) => (
                                                          <div key={i}>
                                                              {i + 1}) {item.product}
                                                          </div>
                                                      ))
                                                    : "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300">
                                                {Array.isArray(followup.assignedTo) && followup.assignedTo.length > 0
                                                    ? followup.assignedTo.map((a, i) => (
                                                          <div key={i}>
                                                              {i + 1}) {a}
                                                          </div>
                                                      ))
                                                    : "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300 text-center">
                                                <div className="flex items-center gap-x-2">
                                                    <button
                                                        title="View"
                                                        className="rounded-xl bg-violet-50 p-2 text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-100"
                                                        onClick={() => setSelectedFollowup({ ...followup })}
                                                    >
                                                        <File size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl bg-cyan-50 p-2 text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                                                        onClick={() => handleCallClick(followup.mobile)}
                                                    >
                                                        <PhoneCall size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                                        onClick={() =>
                                                            handleWhatsAppClick(followup.mobile, `${followup.customerPerson || ""}`.trim())
                                                        }
                                                    >
                                                        <FaWhatsapp size={18} />
                                                    </button>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-[#053054] focus:ring-[#053054]"
                                                            checked={followup.isCompleted || false}
                                                            onChange={() => handleMarkCompleted(followup)}
                                                            disabled={followup.isCompleted || completingFollowups[followup.id]}
                                                            title={followup.isCompleted ? "Already completed" : "Mark as completed"}
                                                        />
                                                        {completingFollowups[followup.id] && (
                                                            <CircularProgress
                                                                size={16}
                                                                className="ml-1"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="px-4 py-14 text-center"
                                        >
                                            <div className="mx-auto flex max-w-md flex-col items-center">
                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Inbox size={30} />
                                                </div>
                                                <div className="text-xl font-black text-slate-900">No follow-ups found.</div>
                                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                                    Follow-up tasks will appear here once leads have scheduled follow-up dates.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ===== Pagination Controls ===== */}
                    {filteredFollowups.length > rowsPerPage && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-bold text-slate-500">
                                Showing {visibleStart} - {visibleEnd} of{" "}
                                {filteredFollowups.length}
                            </span>
                            <div className="flex items-center gap-3">
                                <IconButton
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    <ChevronLeft />
                                </IconButton>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#053054] font-black text-white shadow-lg shadow-slate-300">
                                    {currentPage}
                                </div>
                                <IconButton
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    <ChevronRight />
                                </IconButton>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            )}

            {/* Modal */}
            <FollowupModal
                open={Boolean(selectedFollowup)}
                onClose={() => setSelectedFollowup(null)}
                followup={selectedFollowup}
                onFollowupAdded={fetchLeads}
            />
        </>
    );
};

export default Followup;
