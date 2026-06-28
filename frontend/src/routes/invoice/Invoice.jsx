// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash, Printer } from "lucide-react";
// import { LiaFileInvoiceSolid } from "react-icons/lia";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Invoice = () => {
//     const navigate = useNavigate();
//     const [invoice, setInvoice] = useState([]);

//     useEffect(() => {
//         const storedInvoice = JSON.parse(localStorage.getItem("invoice")) || [];
//         setInvoice(storedInvoice);
//     }, []);

//     const handleDelete = (index) => {
//         const updatedInvoice = invoice.filter((_, i) => i !== index);
//         setInvoice(updatedInvoice);
//         localStorage.setItem("invoice", JSON.stringify(updatedInvoice));
//     };

//     const handleCreateClick = () => {
//         navigate("/invoice/generate-invoice");
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Invoice List :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <LiaFileInvoiceSolid size={20} />
//                         Create New Invoice
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Invoice No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Invoice Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Final Amount</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {invoice.length === 0 ? (
//                                     <tr>
//                                         <td
//                                             colSpan="8"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Invoice
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     invoice.map((invoice, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{invoice.date}</td>
//                                             <td className="table-cell border border-gray-300">{invoice.selectedCompany}</td>
//                                             <td className="table-cell border border-gray-300">{invoice.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300">{invoice.mobile}</td>
//                                             <td className="table-cell border border-gray-300">{invoice.finalAmt}</td>
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
//                                                     <button className="text-orange-500">
//                                                         <Printer size={20} />
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

// export default Invoice;

import { Button } from "@material-tailwind/react";
import { File, PencilLine, Trash, Printer, X, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from "lucide-react";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getInvoices, deleteInvoice } from "../../redux/actions/invoice";
import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField } from "@mui/material";
import { clearSnackbar } from "../../redux/actions/commonActions";
import InvoicePrint from "./InvoicePrint";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getPrefix } from "../../redux/actions/prefix";
import { getBanks } from "../../redux/actions/bankDetails";
import { useSessionToggle } from "../../hooks/use-session-toggle";

const Invoice = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { invoices, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.invoice);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { prefix } = useSelector((state) => state.prefix);
    const printRef = useRef();
    const [printInvoice, setPrintInvoice] = useState(null);
    const { banks } = useSelector((state) => state.bankDetails);

    useEffect(() => {
        dispatch(getInvoices());
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
        navigate("/invoice/generate-invoice");
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

    const handleEditClick = (id) => {
        navigate(`/invoice/edit-invoice/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/invoice/view-invoice/${id}`);
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteInvoice(selectedDeleteId));
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

    // ================= Filters =================
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        email: "",
    });
    const [filtersOpen, setFiltersOpen] = useSessionToggle("crm:invoice-filters-open", false);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredInvoices = invoices.filter((inv) => {
        // Convert "dd-mm-yyyy" or "yyyy-mm-dd" safely into Date
        let leadDate = null;
        if (inv.date) {
            if (inv.date.includes("-")) {
                const parts = inv.date.split("-");
                if (parts[0].length === 4) {
                    // yyyy-mm-dd format
                    leadDate = new Date(inv.date);
                } else {
                    // dd-mm-yyyy format
                    const [day, month, year] = parts;
                    leadDate = new Date(`${year}-${month}-${day}`);
                }
            }
        }

        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchesFromDate = fromDate && leadDate ? leadDate >= fromDate : true;
        const matchesToDate = toDate && leadDate ? leadDate <= toDate : true;

        const matchesCompany = filters.company ? inv.selectedCompany?.toLowerCase().includes(filters.company.toLowerCase()) : true;
        const matchesCustomer = filters.customer ? inv.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;
        const matchesMobile = filters.mobile ? inv.mobile?.includes(filters.mobile) : true;
        const matchesEmail = filters.email ? inv.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail;
    });

    // ================= Pagination =================
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentInvoices = filteredInvoices.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredInvoices.length);
            setCurrentPage(1);
        } else {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
        }
    };

    return (
        <>
            <InvoicePrint
                ref={printRef}
                companyName={companySetup?.companyName || ""}
                companyLogo={companySetup?.companyLogo || ""}
                companyEmail={companySetup?.email || ""}
                companyMobile={companySetup?.mobile || ""}
                companyGstin={companySetup?.gstinNumber || ""}
                companyAddress={formatCompanyAddress(companySetup)}
                invoice={printInvoice}
                prefix={prefix}
                banks={banks}
            />

            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    {/* Header */}
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Invoice List :</div>
                        <Button
                            onClick={handleCreateClick}
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <LiaFileInvoiceSolid size={20} />
                            Create New Invoice
                        </Button>
                    </div>

                    {/* ===== Filters Box ===== */}
                    <div className="mt-3 rounded-lg border border-gray-300 bg-gray-50 p-3 shadow-sm">
                        <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="flex w-full items-center justify-between text-sm font-semibold text-slate-700" aria-expanded={filtersOpen}>
                            <span className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-indigo-600" />{filtersOpen ? "Hide Filters" : "Show Filters"}</span>
                            <ChevronDown size={18} className={`transition ${filtersOpen ? "rotate-180" : ""}`} />
                        </button>
                        {filtersOpen && <div className="crm-filter-panel mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* ✅ From Date */}
                            <TextField
                                label="From Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={filters.fromDate}
                                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                            />

                            {/* ✅ To Date */}
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
                        </div>}
                    </div>

                    {/* ===== Table + Pagination ===== */}
                    <div className="card-body p-0">
                        {/* Show Entries Dropdown */}
                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Show</span>
                                <select
                                    value={rowsPerPage === filteredInvoices.length ? "All" : rowsPerPage}
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
                                Page {currentPage} of {Math.ceil(filteredInvoices.length / rowsPerPage) || 1}
                            </span>
                        </div>

                        {/* Table */}
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table
                                id="invoiceTable"
                                className="table"
                            >
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Invoice No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Company Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Customer Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Mobile No</th>
                                        <th className="table-head border border-gray-300 capitalize">Email Id</th>
                                        <th className="table-head border border-gray-300 capitalize">Products</th>
                                        <th className="table-head border border-gray-300 capitalize">Quantity</th>
                                        <th className="table-head border border-gray-300 capitalize">Total</th>
                                        <th className="table-head border border-gray-300 capitalize">Final Amount</th>
                                        <th className="table-head border border-gray-300 capitalize">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {currentInvoices.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Invoices added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentInvoices.map((invoice, index) => {
                                            const intrastateList = invoice.productInvoiceDetails?.intrastate || [];
                                            const interstateList = invoice.productInvoiceDetails?.interstate || [];
                                            const allProducts = [...intrastateList, ...interstateList];

                                            return (
                                                <tr
                                                    key={invoice.id || index}
                                                    className="table-row"
                                                >
                                                    <td className="table-cell border border-gray-300">
                                                        {prefix?.invoicePrefix}-{invoice.invoiceNo}
                                                    </td>
                                                    <td className="table-cell border border-gray-300">{invoice.date}</td>
                                                    <td className="table-cell border border-gray-300">{invoice.selectedCompany || "---"}</td>
                                                    <td className="table-cell border border-gray-300">{invoice.customerPerson}</td>
                                                    <td className="table-cell border border-gray-300">{invoice.mobile}</td>
                                                    <td className="table-cell border border-gray-300">{invoice.email}</td>

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

                                                    <td className="table-cell border border-gray-300">{invoice.finalAmt}</td>
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-x-4">
                                                            <button
                                                                className="text-blue-500"
                                                                onClick={() => handleEditClick(invoice.id)}
                                                            >
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button
                                                                className="text-red-500"
                                                                onClick={() => handleDeleteClick(invoice.id)}
                                                            >
                                                                <Trash size={20} />
                                                            </button>
                                                            <button
                                                                className="text-purple-500"
                                                                onClick={() => handleViewClick(invoice.id)}
                                                            >
                                                                <File size={20} />
                                                            </button>
                                                            <button
                                                                className="text-orange-500"
                                                                onClick={() => {
                                                                    setPrintInvoice(invoice);
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
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ✅ Pagination Controls */}
                        {filteredInvoices.length > rowsPerPage && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredInvoices.length)} of{" "}
                                    {filteredInvoices.length}
                                </span>
                                <div className="flex items-center gap-3">
                                    <IconButton
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                    >
                                        <ChevronLeft />
                                    </IconButton>

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#053054] font-semibold text-white">
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

                    <Typography className="mb-6 text-[#433C50]">Are you sure, you want to delete this invoice?</Typography>

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

export default Invoice;
