// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash } from "lucide-react";
// import { MdOutlineLeaderboard } from "react-icons/md";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Leads = () => {
//     const navigate = useNavigate();
//     const [leads, setLeads] = useState([]);

//     useEffect(() => {
//         const storedLeads = JSON.parse(localStorage.getItem("leads")) || [];
//         setLeads(storedLeads);
//     }, []);

//     const handleDelete = (index) => {
//         const updatedLeads = leads.filter((_, i) => i !== index);
//         setLeads(updatedLeads);
//         localStorage.setItem("leads", JSON.stringify(updatedLeads));
//     };

//     const handleCreateClick = () => {
//         navigate("/leads/create-leads");
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Lead List :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <MdOutlineLeaderboard size={20} />
//                         Create New Lead
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Lead No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Customer Person</th>
//                                     <th className="table-head border border-gray-300 capitalize">Source</th>
//                                     <th className="table-head border border-gray-300 capitalize">Assigned To</th>
//                                     <th className="table-head border border-gray-300 capitalize">Status</th>
//                                     <th className="table-head border border-gray-300 capitalize">Stage</th>
//                                     <th className="table-head border border-gray-300 capitalize">Follow up Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {leads.length > 0 ? (
//                                     leads.map((lead, index) => (
//                                         <tr
//                                             className="table-row"
//                                             key={index}
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{lead.date}</td>
//                                             <td className="table-cell border border-gray-300">{lead.companyName}</td>
//                                             <td className="table-cell border border-gray-300">{lead.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300">{lead.leadSource}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {Array.isArray(lead.assignedTo) ? lead.assignedTo.join(", ") : lead.assignedTo}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{lead.leadStatus}</td>
//                                             <td className="table-cell border border-gray-300">{lead.leadStage}</td>
//                                             <td className="table-cell border border-gray-300">{lead.followupDate}</td>
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
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             className="table-cell text-center"
//                                             colSpan="9"
//                                         >
//                                             No leads found.
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

// export default Leads;

import { Button } from "@material-tailwind/react";
import { Building2, CalendarClock, ChevronDown, ChevronLeft, ChevronRight, File, Flame, Mail, PencilLine, SlidersHorizontal, Trash, TrendingUp, UserCheck, X } from "lucide-react";
import { MdOutlineLeaderboard } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Modal,
    Snackbar,
    Typography,
    useMediaQuery,
    TextField,
    Autocomplete,
    Chip,
    MenuItem,
} from "@mui/material";
import { getLeads, deleteLead } from "../../redux/actions/leadAndFollowup";
import { getEmployees } from "../../redux/actions/employee";
import { getLeadSource } from "../../redux/actions/leadSource";
import { getLeadStage } from "../../redux/actions/leadStage";
import { getLeadStatus } from "../../redux/actions/leadStatus";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { FaWhatsapp } from "react-icons/fa";
import { PhoneCall } from "lucide-react";
import { useSessionToggle } from "../../hooks/use-session-toggle";

const Leads = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { leads, leadLoading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.leadAndFollowup);
    const { employees } = useSelector((state) => state.employee);
    const { leadSource } = useSelector((state) => state.leadSource);
    const { leadStage } = useSelector((state) => state.leadStage);
    const { leadStatus } = useSelector((state) => state.leadStatus);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(getLeads());
        dispatch(getEmployees());
        dispatch(getLeadSource());
        dispatch(getLeadStage());
        dispatch(getLeadStatus());
        dispatch(clearSnackbar());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleCreateClick = () => {
        navigate("/leads/create-leads");
    };

    const handleEditClick = (id) => {
        navigate(`/leads/edit-leads/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/leads/view-leads/${id}`);
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
        dispatch(deleteLead(selectedDeleteId));
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

    // ===== FILTERS =====
    const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem("crm:lead-filters") || "null") || ({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        source: "",
        assignedTo: [],
        status: "",
        stage: "",
    }));
    const [filtersOpen, setFiltersOpen] = useSessionToggle("crm:lead-filters-open", false);

    useEffect(() => {
        localStorage.setItem("crm:lead-filters", JSON.stringify(filters));
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const formatEmployeeName = (emp) => {
        if (!emp) return "";
        const fullName = [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");
        return `${fullName}`;
    };

    const filteredLeads = leads.filter((lead) => {
        // Convert lead.date ("31-10-2025") safely into a comparable date
        const [day, month, year] = (lead.date || "").split("-");
        const leadDate = new Date(`${year}-${month}-${day}`);

        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchesFromDate = fromDate ? leadDate >= fromDate : true;
        const matchesToDate = toDate ? leadDate <= toDate : true;

        const matchesCompany = filters.company ? lead.companyName?.toLowerCase().includes(filters.company.toLowerCase()) : true;
        const matchesCustomer = filters.customer ? lead.customerPerson?.toLowerCase().includes(filters.customer.toLowerCase()) : true;
        const matchesSource = filters.source ? lead.leadSource?.toLowerCase() === filters.source.toLowerCase() : true;
        const matchesStatus = filters.status ? lead.leadStatus?.toLowerCase() === filters.status.toLowerCase() : true;
        const matchesStage = filters.stage ? lead.leadStage?.toLowerCase() === filters.stage.toLowerCase() : true;

        const matchesAssignedTo =
            filters.assignedTo.length > 0
                ? filters.assignedTo.some((selectedEmp) => {
                      const empName = formatEmployeeName(selectedEmp);
                      if (Array.isArray(lead.assignedTo)) {
                          return lead.assignedTo.some((name) => name.toLowerCase().includes(empName.toLowerCase()));
                      }
                      return (lead.assignedTo || "").toLowerCase().includes(empName.toLowerCase());
                  })
                : true;

        return (
            matchesFromDate &&
            matchesToDate &&
            matchesCompany &&
            matchesCustomer &&
            matchesSource &&
            matchesStatus &&
            matchesStage &&
            matchesAssignedTo
        );
    });

    // ===== PAGINATION =====
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentLeads = filteredLeads.slice(startIndex, startIndex + rowsPerPage);
    const assignedCount = leads.filter((lead) => Array.isArray(lead.assignedTo) ? lead.assignedTo.length > 0 : Boolean(lead.assignedTo)).length;
    const hotLeadCount = leads.filter((lead) => ["hot", "open"].includes((lead.leadStatus || "").toLowerCase())).length;
    const uniqueCompanies = new Set(leads.map((lead) => (lead.companyName || "").trim()).filter(Boolean)).size;
    const visibleStart = filteredLeads.length === 0 ? 0 : startIndex + 1;
    const visibleEnd = Math.min(startIndex + rowsPerPage, filteredLeads.length);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredLeads.length);
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
        const cleaned = mobile.replace(/\s+/g, '');
    
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
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 pb-8">
                    <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#053054] p-6 text-white shadow-2xl shadow-blue-200/70 md:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
                                    <TrendingUp size={14} />
                                    CRM Leads
                                </div>
                                <h1 className="text-3xl font-black leading-tight tracking-normal md:text-[34px]">Lead List</h1>
                                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-blue-50/90 md:text-base">
                                    Track qualified opportunities, ownership, lead stage, follow-up dates, and customer communication in one focused workspace.
                                </p>
                            </div>
                        <Button
                            onClick={handleCreateClick}
                                variant="filled"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black capitalize text-[#053054] shadow-xl shadow-slate-950/10 transition hover:scale-[1.02]"
                        >
                            <MdOutlineLeaderboard size={20} />
                            Create New Lead
                        </Button>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: "Total leads", value: leads.length, icon: TrendingUp, tone: "from-blue-500 to-blue-700", helper: "All lead records" },
                            { label: "Visible after filters", value: filteredLeads.length, icon: SlidersHorizontal, tone: "from-cyan-500 to-blue-600", helper: "Current list result" },
                            { label: "Assigned leads", value: assignedCount, icon: UserCheck, tone: "from-emerald-500 to-teal-600", helper: "Owned by team members" },
                            { label: "Active pipeline", value: hotLeadCount, icon: Flame, tone: "from-orange-500 to-red-500", helper: `${uniqueCompanies} companies` },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100"
                                >
                                    <div className="mb-5 flex items-start justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg shadow-blue-100`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">Live</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">{item.label}</p>
                                    <div className="mt-2 text-4xl font-black tracking-normal text-slate-950">{item.value}</div>
                                    <p className="mt-2 text-xs font-semibold text-slate-400">{item.helper}</p>
                                </div>
                            );
                        })}
                    </section>

                    {/* ===== FILTER BOX ===== */}
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
                                label="Customer Person"
                                size="small"
                                value={filters.customer}
                                onChange={(e) => handleFilterChange("customer", e.target.value)}
                            />

                            {/* ✅ Lead Source Dropdown */}
                            <TextField
                                select
                                label="Source"
                                size="small"
                                value={filters.source}
                                onChange={(e) => handleFilterChange("source", e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {leadSource.map((option, index) => (
                                    <MenuItem
                                        key={index}
                                        value={option.leadSource}
                                    >
                                        {option.leadSource}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* ✅ Lead Status Dropdown */}
                            <TextField
                                select
                                label="Status"
                                size="small"
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {leadStatus.map((option, index) => (
                                    <MenuItem
                                        key={index}
                                        value={option.leadStatus}
                                    >
                                        {option.leadStatus}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* ✅ Lead Stage Dropdown */}
                            <TextField
                                select
                                label="Stage"
                                size="small"
                                value={filters.stage}
                                onChange={(e) => handleFilterChange("stage", e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {leadStage.map((option, index) => (
                                    <MenuItem
                                        key={index}
                                        value={option.leadStage}
                                    >
                                        {option.leadStage}
                                    </MenuItem>
                                ))}
                            </TextField>

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

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                    {/* Show Entries Dropdown */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">Show</span>
                            <select
                                value={rowsPerPage === filteredLeads.length ? "All" : rowsPerPage}
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
                            Page {currentPage} of {Math.ceil(filteredLeads.length / rowsPerPage) || 1}
                        </span>
                    </div>

                    {/* TABLE */}
                    <div className="relative w-full flex-shrink-0 overflow-auto [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header text-nowrap bg-[#053054] text-white">
                                <tr className="table-row">
                                    <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                    <th className="table-head border border-gray-300 capitalize">Date</th>
                                    <th className="table-head border border-gray-300 capitalize">Company Name</th>
                                    <th className="table-head border border-gray-300 capitalize">Customer Person</th>
                                    <th className="table-head border border-gray-300 capitalize">Source</th>
                                    <th className="table-head border border-gray-300 capitalize">Assigned To</th>
                                    <th className="table-head border border-gray-300 capitalize">Status</th>
                                    <th className="table-head border border-gray-300 capitalize">Stage</th>
                                    <th className="table-head border border-gray-300 capitalize">Follow up Date</th>
                                    <th className="table-head border border-gray-300 capitalize">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body text-[#433C50]">
                                {currentLeads.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-4 py-14 text-center"
                                        >
                                            <div className="mx-auto flex max-w-md flex-col items-center">
                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Mail size={30} />
                                                </div>
                                                <div className="text-xl font-black text-slate-900">No leads found.</div>
                                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                                    Create your first lead or adjust filters to see pipeline opportunities here.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleCreateClick}
                                                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#053054] px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300/80 transition hover:-translate-y-0.5 hover:bg-[#04243f]"
                                                >
                                                    <MdOutlineLeaderboard size={18} />
                                                    Create New Lead
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentLeads.map((lead, index) => (
                                        <tr
                                            key={lead.id}
                                            className="table-row transition hover:bg-blue-50/60"
                                        >
                                            <td className="table-cell border border-gray-300">{startIndex + index + 1}</td>
                                            <td className="table-cell border border-gray-300">{lead.date}</td>
                                            <td className="table-cell border border-gray-300">{lead.companyName || "---"}</td>
                                            <td className="table-cell border border-gray-300">{lead.customerPerson}</td>
                                            <td className="table-cell border border-gray-300">{lead.leadSource}</td>
                                            <td className="table-cell border border-gray-300">
                                                {Array.isArray(lead.assignedTo) && lead.assignedTo.length > 0
                                                    ? lead.assignedTo.map((a, i) => (
                                                          <div key={i}>
                                                              {i + 1}) {a}
                                                          </div>
                                                      ))
                                                    : "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300">{lead.leadStatus}</td>
                                            <td className="table-cell border border-gray-300">{lead.leadStage}</td>
                                            <td className="table-cell border border-gray-300">{lead.followups?.[0]?.followup_date || "-"}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-2">
                                                    <button
                                                        className="rounded-xl bg-blue-50 p-2 text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-100"
                                                        onClick={() => handleEditClick(lead.id)}
                                                        title="Edit"
                                                    >
                                                        <PencilLine size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
                                                        onClick={() => handleDeleteClick(lead.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl bg-violet-50 p-2 text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-100"
                                                        onClick={() => handleViewClick(lead.id)}
                                                        title="View"
                                                    >
                                                        <File size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl bg-cyan-50 p-2 text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                                                        onClick={() => handleCallClick(lead.mobile)}
                                                        title="Call"
                                                    >
                                                        <PhoneCall size={18} />
                                                    </button>
                                                    <button
                                                        className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                                        onClick={() => handleWhatsAppClick(lead.mobile, `${lead.customerPerson || ""}`.trim())}
                                                        title="WhatsApp"
                                                    >
                                                        <FaWhatsapp size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Pagination Controls */}
                    {filteredLeads.length > rowsPerPage && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-bold text-slate-500">
                                Showing {visibleStart} - {visibleEnd} of {filteredLeads.length}
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this lead?</Typography>

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

export default Leads;
