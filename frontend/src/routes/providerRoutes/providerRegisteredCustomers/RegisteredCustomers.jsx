import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress, TextField, IconButton, Typography, Modal, Box, useMediaQuery, Snackbar, Alert } from "@mui/material";
import { ChevronLeft, ChevronRight, File, X } from "lucide-react";
import { getOrganizationInfo, toggleAccountActivity } from "@/redux/actions/auth";
import { Button } from "@material-tailwind/react";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { useNavigate } from "react-router-dom";

const RegisteredCustomers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { organizationInfo, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.auth);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const payments = organizationInfo?.payments || [];

    useEffect(() => {
        dispatch(getOrganizationInfo());
        dispatch(clearSnackbar());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) setSnackbarOpen(true);
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            dispatch(clearSnackbar());
        }, 100);
    };

    // Filters state
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        regDate: "",
        expiryDate: "",
        status: "",
        email: "",
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredData.length || 5);
        } else {
            setRowsPerPage(Number(value));
        }
        setCurrentPage(1);
    };

    // Format date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleToggleClick = (org) => {
        if (org.accountActivity === "Activate") {
            setSelectedOrg(org);
            setConfirmModalOpen(true);
        } else {
            dispatch(toggleAccountActivity(org.id, "Deactivate"));
        }
    };

    const isMobile = useMediaQuery("(max-width:600px)");

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

    const handlePackageAction = (org, action) => {
        navigate("/choose-package", {
            state: {
                targetOrgId: org.id,
                targetOrg: org,
                mode: action === "add" ? "assign" : "renew", // assign = add, renew = renew
                from: "provider",
            },
        });
    };

    const confirmDeactivation = () => {
        if (selectedOrg) {
            dispatch(toggleAccountActivity(selectedOrg.id, "Activate"));
        }
        setConfirmModalOpen(false);
        setSelectedOrg(null);
    };

    // Filter logic
    const filteredData = (organizationInfo?.organizations || []).filter((org) => {
        const createdAt = org.createdAt ? new Date(org.createdAt) : null;
        const startDate = org.startDate ? new Date(org.startDate) : null;
        const expiryDate = org.expiryDate ? new Date(org.expiryDate) : null;

        // From Date
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;

        // To Date → FIX: End of day
        const toDate = filters.toDate ? new Date(filters.toDate + "T23:59:59.999") : null;

        const matchesFromDate = fromDate ? createdAt >= fromDate : true;
        const matchesToDate = toDate ? createdAt <= toDate : true;

        // Registration Date (keep exactly as your requirement)
        const matchesRegDate = filters.regDate ? startDate && formatDate(org.startDate) === formatDate(filters.regDate) : true;

        // Expiry Date (keep exactly as your requirement)
        const matchesExpiryDate = filters.expiryDate ? expiryDate && formatDate(org.expiryDate) === formatDate(filters.expiryDate) : true;

        const matchesCompany = filters.company ? org.company?.toLowerCase().includes(filters.company.toLowerCase()) : true;

        const matchesCustomer = filters.customer ? org.customerName?.toLowerCase().includes(filters.customer.toLowerCase()) : true;

        const matchesMobile = filters.mobile ? org.mobile?.includes(filters.mobile) : true;

        const matchesEmail = filters.email ? org.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        const matchesStatus = filters.status ? org.status?.toLowerCase().includes(filters.status.toLowerCase()) : true;

        return (
            matchesFromDate &&
            matchesToDate &&
            matchesRegDate &&
            matchesExpiryDate &&
            matchesCompany &&
            matchesCustomer &&
            matchesMobile &&
            matchesEmail &&
            matchesStatus
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="card">
            <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Registered Customer's List :</div>
            {/* Filter Box */}
            <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-sm">
                <Typography
                    variant="subtitle1"
                    className="font-semibold text-[#053054]"
                >
                    Filters
                </Typography>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                        label="Mobile"
                        size="small"
                        value={filters.mobile}
                        onChange={(e) => handleFilterChange("mobile", e.target.value)}
                    />
                    <TextField
                        label="Registration Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.regDate}
                        onChange={(e) => handleFilterChange("regDate", e.target.value)}
                    />
                    <TextField
                        label="Expiry Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.expiryDate}
                        onChange={(e) => handleFilterChange("expiryDate", e.target.value)}
                    />
                    <TextField
                        label="Status"
                        size="small"
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                    />
                    <TextField
                        label="Email"
                        size="small"
                        value={filters.email}
                        onChange={(e) => handleFilterChange("email", e.target.value)}
                    />
                </div>
            </div>

            {/* Show Entries & Page Info */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select
                        value={rowsPerPage === filteredData.length ? "All" : rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        className="rounded border border-gray-300 bg-white px-3 py-1 text-sm outline-none focus:border-[#053054]"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value="All">All</option>
                    </select>
                    <span className="text-sm text-gray-700">entries</span>
                </div>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <CircularProgress size={40} />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="relative w-full overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table w-full">
                            <thead className="table-header text-nowrap bg-[#053054] text-white">
                                <tr className="table-row">
                                    <th className="table-head border border-gray-300">Sr. No.</th>
                                    <th className="table-head border border-gray-300">Date</th>
                                    <th className="table-head border border-gray-300">Reg. Date</th>
                                    <th className="table-head border border-gray-300">Company Name</th>
                                    <th className="table-head border border-gray-300">Customer Name</th>
                                    <th className="table-head border border-gray-300">Mobile</th>
                                    <th className="table-head border border-gray-300">Expiry Date</th>
                                    <th className="table-head border border-gray-300">Package</th>
                                    <th className="table-head border border-gray-300">Payment Status</th>
                                    <th className="table-head border border-gray-300">Email</th>
                                    <th className="table-head border border-gray-300">Package Action</th>
                                    <th className="table-head border border-gray-300">Payment Method</th>
                                    <th className="table-head border border-gray-300">View Payment</th>
                                    <th className="table-head border border-gray-300">Account Activity</th>
                                </tr>
                            </thead>
                            <tbody className="table-body text-[#433C50]">
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="14"
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No Registered Data Found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((org, index) => (
                                        <tr
                                            key={org.id}
                                            className="table-row"
                                        >
                                            <td className="table-cell border border-gray-300 text-center">{startIndex + index + 1}</td>
                                            <td className="table-cell border border-gray-300">
                                                {new Date(org.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                            </td>
                                            <td className="table-cell border border-gray-300 bg-green-200">{formatDate(org.startDate)}</td>
                                            <td className="table-cell border border-gray-300">{org.company || "-"}</td>
                                            <td className="table-cell border border-gray-300">{org.customerName || "-"}</td>
                                            <td className="table-cell border border-gray-300">{org.mobile || "-"}</td>
                                            <td className="table-cell border border-gray-300 bg-red-200">{formatDate(org.expiryDate)}</td>
                                            <td className="table-cell border border-gray-300">{org.package || "-"}</td>
                                            <td
                                                className={`table-cell border border-gray-300 ${
                                                    org.status?.toLowerCase() === "active"
                                                        ? "bg-green-200"
                                                        : org.status?.toLowerCase() === "expired"
                                                          ? "bg-red-200"
                                                          : org.status?.toLowerCase() === "pending_payment"
                                                            ? "bg-orange-200"
                                                            : ""
                                                }`}
                                            >
                                                {org.status || "-"}
                                            </td>
                                            <td className="table-cell border border-gray-300">{org.email || "-"}</td>
                                            <td className="table-cell border border-gray-300 text-center">
                                                {org.package ? (
                                                    <Button
                                                        onClick={() => handlePackageAction(org, "renew")}
                                                        className="bg-orange-300 px-3 py-2 text-xs capitalize text-gray-700"
                                                    >
                                                        Renew Package
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handlePackageAction(org, "add")}
                                                        className="bg-blue-300 px-3 py-2 text-xs capitalize text-gray-700"
                                                    >
                                                        Add Package
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="table-cell border border-gray-300 text-center">
                                                {org.paymentMethod ? (
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                                            org.paymentMethod === "Free"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : org.paymentMethod === "Cash"
                                                                  ? "bg-yellow-100 text-yellow-800"
                                                                  : org.paymentMethod === "Online"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {org.paymentMethod}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs italic text-gray-500">Not Specified</span>
                                                )}
                                            </td>
                                            <td className="table-cell border border-gray-300 text-center">
                                                {payments.some((p) => p.org_id === org.id) ? (
                                                    <button
                                                        onClick={() => navigate(`/provider/settings/master/payment/details/${org.id}`)}
                                                        className="rounded p-1 text-purple-600 transition-colors hover:bg-purple-50 hover:text-purple-800"
                                                        title="View Payment History"
                                                    >
                                                        <File size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="cursor-not-allowed text-gray-400"
                                                        title="No payments recorded yet"
                                                    >
                                                        <File size={20} />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="table-cell border border-gray-300 text-center">
                                                <label className="relative inline-flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer sr-only"
                                                        checked={org.accountActivity === "Activate"}
                                                        onChange={() => handleToggleClick(org)}
                                                    />
                                                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-5"></div>
                                                </label>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredData.length > rowsPerPage && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {filteredData.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredData.length)}{" "}
                                of {filteredData.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <IconButton
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="rounded-full border"
                                >
                                    <ChevronLeft size={20} />
                                </IconButton>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#053054] text-sm font-semibold text-white">
                                    {currentPage}
                                </div>
                                <IconButton
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="rounded-full border"
                                >
                                    <ChevronRight size={20} />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Modal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Confirm Deactivation
                        </Typography>
                        <IconButton
                            onClick={() => setConfirmModalOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure you want to deactivate this account?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 text-white"
                            onClick={confirmDeactivation}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 text-white"
                            onClick={() => setConfirmModalOpen(false)}
                        >
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default RegisteredCustomers;
