// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash, Printer } from "lucide-react";
// import { SiWikiquote } from "react-icons/si";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Quotations = () => {
//     const navigate = useNavigate();
//     const [quotations, setQuotations] = useState([]);

//     useEffect(() => {
//         const storedQuotations = JSON.parse(localStorage.getItem("quotation")) || [];
//         setQuotations(storedQuotations);
//     }, []);

//     const handleDelete = (index) => {
//         const updatedQuotations = quotations.filter((_, i) => i !== index);
//         setQuotations(updatedQuotations);
//         localStorage.setItem("quotation", JSON.stringify(updatedQuotations));
//     };

//     const handleCreateClick = () => {
//         navigate("/quotations/create-quotation");
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Quotation's List :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <SiWikiquote size={20} />
//                         Create New Quotation
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Quotation No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Quotation Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Products</th>
//                                     <th className="table-head border border-gray-300 capitalize">HSN Code</th>
//                                     <th className="table-head border border-gray-300 capitalize">Quantity</th>
//                                     <th className="table-head border border-gray-300 capitalize">Total</th>
//                                     <th className="table-head border border-gray-300 capitalize">Final Amount</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {quotations.length > 0 ? (
//                                     quotations.map((q, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300 text-nowrap">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">{q.date}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">{q.companyName}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">{q.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">{q.mobile}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">{q.email}</td>
//                                             {(() => {
//                                                 const intrastateList = q.productQuotationDetails?.intrastate || [];
//                                                 const interstateList = q.productQuotationDetails?.interstate || [];
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
//                                             <td className="table-cell border border-gray-300">{q.finalAmt}</td>
//                                             <td className="table-cell border border-gray-300 text-nowrap">
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
//                                                     <button className="text-orange-500">
//                                                         <Printer size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             colSpan="13"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No quotations available
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Quotations;

import { Button } from "@material-tailwind/react";
import { File, PencilLine, Trash, Printer, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiWikiquote } from "react-icons/si";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getQuotations, deleteQuotation } from "../../redux/actions/quotation";
import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField } from "@mui/material";
import { clearSnackbar } from "../../redux/actions/commonActions";
import QuotationPrint from "./QuotationPrint";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getPrefix } from "../../redux/actions/prefix";
import { getBanks } from "../../redux/actions/bankDetails";

const Quotations = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { quotations, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.quotation);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { prefix } = useSelector((state) => state.prefix);
    const printRef = useRef();
    const [printQuotation, setPrintQuotation] = useState(null);
    const { banks } = useSelector((state) => state.bankDetails);

    useEffect(() => {
        dispatch(getQuotations());
        dispatch(getPrefix());
        dispatch(getBanks());
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

    const handleCreateClick = () => {
        navigate("/quotations/create-quotation");
    };

    const formatCompanyAddress = (company) => {
        if (!company) return "";

        const addressParts = [];

        if (company.permanantStreet) addressParts.push(company.permanantStreet);
        if (company.permanantCity) addressParts.push(company.permanantCity);
        if (company.permanantState) addressParts.push(company.permanantState);
        if (company.permanantPincode) addressParts.push(company.permanantPincode);
        if (company.permanantCountry) addressParts.push(company.permanantCountry);

        return addressParts.join(", ");
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
        dispatch(deleteQuotation(selectedDeleteId));
        setSnackbarOpen(true);
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleEditClick = (id) => {
        navigate(`/quotations/edit-quotation/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/quotations/view-quotation/${id}`);
    };

    // ================= Filters =================
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        email: "",
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredQuotations = quotations.filter((q) => {
        // convert date like "31-10-2025" into comparable format
        const [day, month, year] = (q.date || "").split("-");
        const quotationDate = new Date(`${year}-${month}-${day}`);

        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchesFromDate = fromDate ? quotationDate >= fromDate : true;
        const matchesToDate = toDate ? quotationDate <= toDate : true;

        const matchesCompany = filters.company ? q.companyName?.toLowerCase().includes(filters.company.toLowerCase()) : true;
        const matchesCustomer = filters.customer ? q.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;
        const matchesMobile = filters.mobile ? q.mobile?.includes(filters.mobile) : true;
        const matchesEmail = filters.email ? q.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail;
    });

    // ================= Pagination =================
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const totalPages = Math.ceil(filteredQuotations.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentQuotations = filteredQuotations.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredQuotations.length);
            setCurrentPage(1);
        } else {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
        }
    };

    return loading ? (
        <div className="flex h-screen w-full items-center justify-center">
            <CircularProgress />
        </div>
    ) : (
        <>
            <QuotationPrint
                ref={printRef}
                companyName={companySetup?.companyName || ""}
                companyLogo={companySetup?.companyLogo || ""}
                companyEmail={companySetup?.email || ""}
                companyMobile={companySetup?.mobile || ""}
                companyGstin={companySetup?.gstinNumber || ""}
                companyAddress={formatCompanyAddress(companySetup)}
                quotation={printQuotation}
                prefix={prefix}
                banks={banks}
            />

            <div className="card">
                {/* Header */}
                <div className="flex items-center justify-between text-nowrap">
                    <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Quotation's List :</div>
                    <Button
                        onClick={handleCreateClick}
                        variant="gradient"
                        className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                    >
                        <SiWikiquote size={20} />
                        Create New Quotation
                    </Button>
                </div>

                {/* ===== Filters Box ===== */}
                <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
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
                    </div>
                </div>

                {/* ===== Table and Pagination (unchanged) ===== */}
                <div className="card-body p-0">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                                value={rowsPerPage === filteredQuotations.length ? "All" : rowsPerPage}
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
                            Page {currentPage} of {Math.ceil(filteredQuotations.length / rowsPerPage) || 1}
                        </span>
                    </div>

                    <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table
                            id="quotationTable"
                            className="table"
                        >
                            <thead className="table-header text-nowrap bg-[#053054] text-white">
                                <tr className="table-row">
                                    <th className="table-head border border-gray-300">Quotation No.</th>
                                    <th className="table-head border border-gray-300">Date</th>
                                    <th className="table-head border border-gray-300">Company Name</th>
                                    <th className="table-head border border-gray-300">Customer Name</th>
                                    <th className="table-head border border-gray-300">Mobile No</th>
                                    <th className="table-head border border-gray-300">Email Id</th>
                                    <th className="table-head border border-gray-300">Products</th>
                                    <th className="table-head border border-gray-300">Units</th>
                                    <th className="table-head border border-gray-300">Quantity</th>
                                    <th className="table-head border border-gray-300">Total</th>
                                    <th className="table-head border border-gray-300">Final Amount</th>
                                    <th className="table-head border border-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body text-[#433C50]">
                                {currentQuotations.length > 0 ? (
                                    currentQuotations.map((q, index) => {
                                        const allProducts = [
                                            ...(q?.productQuotationDetails?.intrastate || []),
                                            ...(q?.productQuotationDetails?.interstate || []),
                                        ];

                                        return (
                                            <tr
                                                key={q.id}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">
                                                    {prefix?.quotationPrefix}-{q.quotationNo}
                                                </td>
                                                <td className="table-cell border border-gray-300">{q.date}</td>
                                                <td className="table-cell border border-gray-300">{q.companyName || "---"}</td>
                                                <td className="table-cell border border-gray-300">{q.customerPerson}</td>
                                                <td className="table-cell border border-gray-300">{q.mobile}</td>
                                                <td className="table-cell border border-gray-300">{q.email}</td>
                                                <td className="table-cell border border-gray-300">
                                                    {Array.isArray(allProducts) && allProducts.length > 0
                                                        ? allProducts.map((p, i) => (
                                                              <div key={i}>
                                                                  {i + 1}) {p.product}
                                                              </div>
                                                          ))
                                                        : "-"}
                                                </td>
                                                <td className="table-cell border border-gray-300">
                                                    {Array.isArray(allProducts) && allProducts.length > 0
                                                        ? allProducts.map((p, i) => (
                                                              <div key={i}>
                                                                  {i + 1}) {p.unit}
                                                              </div>
                                                          ))
                                                        : "-"}
                                                </td>
                                                <td className="table-cell border border-gray-300">
                                                    {Array.isArray(allProducts) && allProducts.length > 0
                                                        ? allProducts.map((p, i) => (
                                                              <div key={i}>
                                                                  {i + 1}) {p.quantity}
                                                              </div>
                                                          ))
                                                        : "-"}
                                                </td>
                                                <td className="table-cell border border-gray-300">
                                                    {Array.isArray(allProducts) && allProducts.length > 0
                                                        ? allProducts.map((p, i) => (
                                                              <div key={i}>
                                                                  {i + 1}) {p.total}
                                                              </div>
                                                          ))
                                                        : "-"}
                                                </td>
                                                <td className="table-cell border border-gray-300">{q.finalAmt}</td>
                                                <td className="table-cell border border-gray-300">
                                                    <div className="flex items-center gap-x-4">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEditClick(q.id)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(q.id)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                        <button
                                                            className="text-purple-500"
                                                            onClick={() => handleViewClick(q.id)}
                                                        >
                                                            <File size={20} />
                                                        </button>
                                                        <button
                                                            className="text-orange-500"
                                                            onClick={() => {
                                                                setPrintQuotation(q);
                                                                setTimeout(() => printRef.current?.print(), 300);
                                                            }}
                                                        >
                                                            <Printer size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="12"
                                            className="py-4 text-center text-gray-400"
                                        >
                                            No quotations available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Pagination Controls */}
                    {filteredQuotations.length > rowsPerPage && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredQuotations.length)} of{" "}
                                {filteredQuotations.length}
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
            </div>
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this quotation?</Typography>

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

export default Quotations;
