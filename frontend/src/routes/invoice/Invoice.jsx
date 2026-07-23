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
import { Ban, ChevronDown, ChevronLeft, ChevronRight, File, Inbox, IndianRupee, PencilLine, Printer, ReceiptText, SlidersHorizontal, Trash, TrendingUp, X } from "lucide-react";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cancelInvoice, getInvoices, deleteInvoice } from "../../redux/actions/invoice";
import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery, TextField } from "@mui/material";
import { clearSnackbar } from "../../redux/actions/commonActions";
import InvoicePrint from "./InvoicePrint";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getPrefix } from "../../redux/actions/prefix";
import { getBanks } from "../../redux/actions/bankDetails";
import { useSessionToggle } from "../../hooks/use-session-toggle";

const Invoice = ({ documentType = "final" }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isProforma = documentType === "proforma";
    const basePath = isProforma ? "/proforma-invoice" : "/invoice";
    const documentLabel = isProforma ? "Proforma Invoice" : "Invoice";
    const documentLabelPlural = isProforma ? "Proforma Invoices" : "Invoices";
    const { invoices, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.invoice);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [selectedCancelId, setSelectedCancelId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { prefix } = useSelector((state) => state.prefix);
    const printRef = useRef();
    const [printInvoice, setPrintInvoice] = useState(null);
    const { banks } = useSelector((state) => state.bankDetails);

    useEffect(() => {
        dispatch(getInvoices(documentType));
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
        navigate(`${basePath}/generate-invoice`);
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
        navigate(`${basePath}/edit-invoice/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`${basePath}/view-invoice/${id}`);
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const handleCancelClick = (id) => {
        setSelectedCancelId(id);
        setCancelConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteInvoice(selectedDeleteId, documentType));
        setSnackbarOpen(true);
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const confirmCancel = () => {
        dispatch(cancelInvoice(selectedCancelId, documentType));
        setSnackbarOpen(true);
        setCancelConfirmOpen(false);
        setSelectedCancelId(null);
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
    const totalInvoiceValue = invoices.reduce((sum, inv) => sum + Number(inv.finalAmt || 0), 0);
    const filteredInvoiceValue = filteredInvoices.reduce((sum, inv) => sum + Number(inv.finalAmt || 0), 0);
    const visibleStart = filteredInvoices.length === 0 ? 0 : startIndex + 1;
    const visibleEnd = Math.min(startIndex + rowsPerPage, filteredInvoices.length);

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
                <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8">
                    <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#053054] p-6 text-white shadow-2xl shadow-blue-200/70 md:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                    <ReceiptText size={14} />
                                    CRM {documentLabelPlural}
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">{documentLabel} List</h1>
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Review generated {documentLabelPlural.toLowerCase()}, products, billing value, customer details, and document actions.
                                </p>
                            </div>
                        <Button
                            onClick={handleCreateClick}
                                variant="filled"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black capitalize text-[#053054] shadow-xl shadow-slate-950/10 transition hover:scale-[1.02]"
                        >
                            <LiaFileInvoiceSolid size={20} />
                            Create New {documentLabel}
                        </Button>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: `Total ${documentLabelPlural.toLowerCase()}`, value: invoices.length, icon: ReceiptText, tone: "from-blue-500 to-blue-700", helper: `All ${documentLabel.toLowerCase()} records` },
                            { label: "Visible after filters", value: filteredInvoices.length, icon: SlidersHorizontal, tone: "from-cyan-500 to-blue-600", helper: "Current list result" },
                            { label: "Total value", value: `₹${totalInvoiceValue}`, icon: IndianRupee, tone: "from-emerald-500 to-teal-600", helper: "All invoice value" },
                            { label: "Filtered value", value: `₹${filteredInvoiceValue}`, icon: TrendingUp, tone: "from-violet-500 to-indigo-600", helper: "Visible invoice value" },
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

                    {/* ===== Filters Box ===== */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
                        <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-blue-50" aria-expanded={filtersOpen}>
                            <span className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-blue-600" />{filtersOpen ? "Hide Filters" : "Show Filters"}</span>
                            <ChevronDown size={18} className={`transition ${filtersOpen ? "rotate-180" : ""}`} />
                        </button>
                        {filtersOpen && <div className="crm-filter-panel mt-4 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                        {/* Show Entries Dropdown */}
                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-600">Show</span>
                                <select
                                    value={rowsPerPage === filteredInvoices.length ? "All" : rowsPerPage}
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
                                Page {currentPage} of {Math.ceil(filteredInvoices.length / rowsPerPage) || 1}
                            </span>
                        </div>

                        {/* Table */}
                        <div className="relative w-full flex-shrink-0 overflow-auto [scrollbar-width:_thin]">
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
                                        <th className="table-head border border-gray-300 capitalize">Status</th>
                                        <th className="table-head border border-gray-300 capitalize">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {currentInvoices.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="12"
                                                className="px-4 py-14 text-center"
                                            >
                                                <div className="mx-auto flex max-w-md flex-col items-center">
                                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                        <Inbox size={30} />
                                                    </div>
                                                    <div className="text-xl font-black text-slate-900">No {documentLabelPlural.toLowerCase()} added yet.</div>
                                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                                        Create your first {documentLabel.toLowerCase()} to start tracking billed products and customer value.
                                                    </p>
                                                </div>
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
                                                    className="table-row transition hover:bg-blue-50/60"
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
                                                        <span className={`rounded-full px-3 py-1 text-xs font-black ${invoice.status === "Cancelled" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                                                            {invoice.status || "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-x-2">
                                                            <button
                                                                className="rounded-xl bg-blue-50 p-2 text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100"
                                                                onClick={() => handleEditClick(invoice.id)}
                                                            >
                                                                <PencilLine size={18} />
                                                            </button>
                                                            <button
                                                                className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
                                                                onClick={() => handleDeleteClick(invoice.id)}
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                            <button
                                                                className="rounded-xl bg-violet-50 p-2 text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-100"
                                                                onClick={() => handleViewClick(invoice.id)}
                                                            >
                                                                <File size={18} />
                                                            </button>
                                                            <button
                                                                className="rounded-xl bg-orange-50 p-2 text-orange-600 transition hover:-translate-y-0.5 hover:bg-orange-100"
                                                                onClick={() => {
                                                                    setPrintInvoice(invoice);
                                                                    setTimeout(() => printRef.current?.print(), 300);
                                                                }}
                                                            >
                                                                <Printer size={18} />
                                                            </button>
                                                            {invoice.status !== "Cancelled" && (
                                                                <button
                                                                    className="rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100"
                                                                    onClick={() => handleCancelClick(invoice.id)}
                                                                    title={`Cancel ${documentLabel.toLowerCase()}`}
                                                                >
                                                                    <Ban size={18} />
                                                                </button>
                                                            )}
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
                            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm font-bold text-slate-500">
                                    Showing {visibleStart} - {visibleEnd} of {filteredInvoices.length}
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

            {/* Cancel Modal */}
            <Modal
                open={cancelConfirmOpen}
                onClose={() => setCancelConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Confirm Cancel
                        </Typography>
                        <IconButton
                            onClick={() => setCancelConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 text-[#433C50]">Are you sure, you want to cancel this {documentLabel.toLowerCase()}?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={confirmCancel}
                        >
                            Yes, Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setCancelConfirmOpen(false)}
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
