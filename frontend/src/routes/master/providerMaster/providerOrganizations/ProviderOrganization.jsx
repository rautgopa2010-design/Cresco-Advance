// import { Button } from "@material-tailwind/react";
// import { GoOrganization } from "react-icons/go";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const ProviderOrganization = () => {
//     const navigate = useNavigate();
//     const [customers, setCustomers] = useState([]);

//     useEffect(() => {
//         const storedCustomers = JSON.parse(localStorage.getItem("customer")) || [];
//         setCustomers(storedCustomers);
//     }, []);

//     const handleCreateClick = () => {
//         navigate("/provider/settings/master/organization/create-organization");
//     };

//     const handleDelete = (index) => {
//         const updatedCustomers = customers.filter((_, i) => i !== index);
//         setCustomers(updatedCustomers);
//         localStorage.setItem("customer", JSON.stringify(updatedCustomers));
//     };

//     const groupedCustomers = customers.reduce((acc, curr) => {
//         const existingCompany = acc.find((item) => item.companyName === curr.companyName);
//         if (existingCompany) {
//             existingCompany.customers = [...existingCompany.customers, ...curr.customers];
//         } else {
//             acc.push({ ...curr });
//         }
//         return acc;
//     }, []);

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Organization Detail's :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <GoOrganization size={20} />
//                         Register Organization
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Org. No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Company Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">customer Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">GSTIN No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {groupedCustomers.length === 0 ? (
//                                     <tr>
//                                         <td
//                                             colSpan="6"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No organization registered yet.
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     customers.map((cus, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{cus.companyName}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {cus.customers
//                                                     .map((c) => `${c.salutation} ${c.firstName} ${c.middleName} ${c.lastName}`.trim())
//                                                     .join(", ")}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{cus.customers.map((c) => c.mobile).join(", ")}</td>
//                                             <td className="table-cell border border-gray-300">{cus.customers.map((c) => c.email).join(", ")}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {Array.isArray(cus.assignedTo) ? cus.assignedTo.join(", ") : cus.assignedTo}
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

// export default ProviderOrganization;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import { GoOrganization } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { getOrganizationInfo } from "@/redux/actions/auth";
import { Button } from "@material-tailwind/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProviderOrganization = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { organizationInfo, loading } = useSelector((state) => state.auth);

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        company: "",
        customer: "",
        mobile: "",
        email: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        dispatch(getOrganizationInfo());
    }, [dispatch]);

    const handleCreateClick = () => {
        navigate("/provider/settings/master/organization/create-organization");
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Filter logic based on createdAt and other fields
    const filteredOrganizations = (organizationInfo?.organizations || []).filter((org) => {
        const createdAt = org.createdAt ? new Date(org.createdAt) : null;

        // Handle From Date
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;

        // Handle To Date → FIXED: Set time to end of day
        const toDate = filters.toDate ? new Date(filters.toDate + "T23:59:59.999") : null;

        const matchesFromDate = fromDate ? createdAt >= fromDate : true;
        const matchesToDate = toDate ? createdAt <= toDate : true;

        const matchesCompany = filters.company ? org.company?.toLowerCase().includes(filters.company.toLowerCase()) : true;

        const matchesCustomer = filters.customer ? org.customerName?.toLowerCase().includes(filters.customer.toLowerCase()) : true;

        const matchesMobile = filters.mobile ? org.mobile?.includes(filters.mobile) : true;

        const matchesEmail = filters.email ? org.email?.toLowerCase().includes(filters.email.toLowerCase()) : true;

        return matchesFromDate && matchesToDate && matchesCompany && matchesCustomer && matchesMobile && matchesEmail;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredOrganizations.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentOrganizations = filteredOrganizations.slice(startIndex, startIndex + rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const value = e.target.value;
        if (value === "All") {
            setRowsPerPage(filteredOrganizations.length);
            setCurrentPage(1);
        } else {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
        }
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress size={28} />
                </div>
            ) : (
                <div className="card">
                    {/* HEADER */}
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Organization Detail's :</div>
                        <Button
                            onClick={handleCreateClick}
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <GoOrganization size={20} />
                            Register Organization
                        </Button>
                    </div>

                    {/* FILTER BOX */}
                    <div className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4 shadow-sm">
                        <Typography
                            variant="subtitle1"
                            className="mb-3 font-semibold text-[#053054]"
                        >
                            Filters
                        </Typography>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                    {/* TABLE CARD BODY */}
                    <div className="card-body p-0">
                        {/* Show Entries & Page Info */}
                        <div className="flex items-center justify-between px-2 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Show</span>
                                <select
                                    value={rowsPerPage === filteredOrganizations.length ? "All" : rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    className="rounded border border-gray-300 bg-white px-3 py-1 text-sm outline-none focus:border-[#053054]"
                                >
                                    <option value={5}>5</option>
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

                        {/* TABLE */}
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300">Sr. No.</th>
                                        <th className="table-head border border-gray-300">Date</th>
                                        <th className="table-head border border-gray-300">Company Name</th>
                                        <th className="table-head border border-gray-300">Customer Name</th>
                                        <th className="table-head border border-gray-300">GSTIN</th>
                                        <th className="table-head border border-gray-300">Mobile</th>
                                        <th className="table-head border border-gray-300">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {currentOrganizations.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-8 text-center text-gray-400"
                                            >
                                                No organization found matching the filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentOrganizations.map((org, index) => (
                                            <tr
                                                key={org.id}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{startIndex + index + 1}</td>
                                                <td className="table-cell border border-gray-300">
                                                    {new Date(org.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                                </td>
                                                <td className="table-cell border border-gray-300">{org.company || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.customerName || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.gstin || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.mobile || "-"}</td>
                                                <td className="table-cell border border-gray-300">{org.email || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAGINATION */}
                    {filteredOrganizations.length > rowsPerPage && (
                        <div className="mt-5 flex items-center justify-between px-2">
                            <span className="text-sm text-gray-500">
                                Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredOrganizations.length)} of{" "}
                                {filteredOrganizations.length}
                            </span>
                            <div className="flex items-center gap-3">
                                <IconButton
                                    variant="text"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className="rounded-full"
                                >
                                    <ChevronLeft size={20} />
                                </IconButton>

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#053054] text-sm font-semibold text-white">
                                    {currentPage}
                                </div>

                                <IconButton
                                    variant="text"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="rounded-full"
                                >
                                    <ChevronRight size={20} />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ProviderOrganization;
