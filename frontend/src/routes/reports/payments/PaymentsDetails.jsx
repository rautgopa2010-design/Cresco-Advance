import React, { useState, forwardRef, useImperativeHandle } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";

const PaymentsDetails = forwardRef(({ organizationInfo }, ref) => {
    const [filters, setFilters] = useState({
        company: "",
        customerName: "",
        mobile: "",
        package: "",
        paymentMethod: "",
        paymentStatus: "",
        fromDate: "",
        toDate: "",
    });

    // Extract all organizations from the main object
    const organizations = organizationInfo?.organizations || [];
    
    // Combine main customer with organizations for complete list
    const allCustomers = organizationInfo?.id 
        ? [organizationInfo, ...organizations] 
        : organizations;

    const filtered = allCustomers.filter((c) => {
        const fullName = c.customerName || 
            `${c.firstName || ""} ${c.middleName || ""} ${c.lastName || ""}`.trim();

        const createdAtDate = c.createdAt ? new Date(c.createdAt) : null;
        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;

        const dateMatch = (!createdAtDate) || 
            (!from || createdAtDate >= from) && 
            (!to || createdAtDate <= to);

        const paymentStatus = c.paymentStatus || c.accountActivity || "";

        return (
            (!filters.company || c.company?.toLowerCase().includes(filters.company.toLowerCase())) &&
            (!filters.customerName || fullName.toLowerCase().includes(filters.customerName.toLowerCase())) &&
            (!filters.mobile || c.mobile?.includes(filters.mobile)) &&
            (!filters.package || c.package?.toLowerCase().includes(filters.package.toLowerCase())) &&
            (!filters.paymentMethod || c.paymentMethod?.toLowerCase().includes(filters.paymentMethod.toLowerCase())) &&
            (!filters.paymentStatus || paymentStatus.toLowerCase().includes(filters.paymentStatus.toLowerCase())) &&
            dateMatch
        );
    });

    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

    // Get unique values for autocomplete
    const uniqueCompanies = [...new Set(allCustomers.map(c => c.company).filter(Boolean))];
    const uniquePackages = [...new Set(allCustomers.map(c => c.package).filter(Boolean))];
    const uniquePaymentMethods = [...new Set(allCustomers.map(c => c.paymentMethod).filter(Boolean))];
    const uniquePaymentStatuses = [...new Set(allCustomers.map(c => c.paymentStatus || c.accountActivity).filter(Boolean))];

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB").replace(/\//g, "-");
    };

    const formatCurrency = (amount, currency = "₹") => {
        if (!amount && amount !== 0) return "N/A";
        return `${currency} ${amount.toFixed(2)}`;
    };

    return (
        <div className="space-y-6 p-4">
            {/* Filters */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <h2 className="mb-3 text-lg font-semibold text-[#053054]">🔎 Filters</h2>
                <div className="flex flex-wrap gap-3">
                    {/* From Date */}
                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* To Date */}
                    <TextField
                        label="To Date"
                        type="date"
                        size="small"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                        InputLabelProps={{ shrink: true }}
                    />

                    <Autocomplete
                        disablePortal
                        options={["All Companies", ...uniqueCompanies]}
                        value={filters.company || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                company: newValue === "All Companies" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Company"
                                size="small"
                                placeholder="Select Company"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-48"
                    />

                    <TextField
                        label="Customer Name"
                        size="small"
                        value={filters.customerName}
                        onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <TextField
                        label="Mobile"
                        size="small"
                        value={filters.mobile}
                        onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <Autocomplete
                        disablePortal
                        options={["All Packages", ...uniquePackages]}
                        value={filters.package || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                package: newValue === "All Packages" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Package"
                                size="small"
                                placeholder="Select Package"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <Autocomplete
                        disablePortal
                        options={["All Methods", ...uniquePaymentMethods]}
                        value={filters.paymentMethod || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                paymentMethod: newValue === "All Methods" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Payment Method"
                                size="small"
                                placeholder="Select Method"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <Autocomplete
                        disablePortal
                        options={["All Statuses", ...uniquePaymentStatuses]}
                        value={filters.paymentStatus || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                paymentStatus: newValue === "All Statuses" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Payment Status"
                                size="small"
                                placeholder="Select Status"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                        onClick={() => setFilters({ 
                            company: "", 
                            customerName: "", 
                            mobile: "", 
                            package: "",
                            paymentMethod: "",
                            paymentStatus: "",
                            fromDate: "", 
                            toDate: "" 
                        })}
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-xl border bg-white p-4 shadow">
                <table
                    id="paymentsTable"
                    className="w-full border-collapse text-xs sm:text-sm lg:text-base"
                >
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {[
                                "Sr. No.", 
                                "Date", 
                                "Company Name", 
                                "Customer Name", 
                                "Mobile", 
                                "Email",
                                "Package",
                                "Price",
                                "Duration",
                                "Max Users",
                                "Payment Method",
                                "Payment Status",
                                "Start Date",
                                "Expiry Date",
                                "Status"
                            ].map((head) => (
                                <th
                                    key={head}
                                    className="whitespace-nowrap border px-4 py-3 text-left"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="15"
                                    className="border py-6 text-center text-gray-400"
                                >
                                    No payments found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c, index) => {
                                const fullName = c.customerName || 
                                    `${c.firstName || ""} ${c.middleName || ""} ${c.lastName || ""}`.trim();
                                const packageDetails = c.packageDetails || {};
                                const paymentStatus = c.paymentStatus || c.accountActivity || "N/A";
                                
                                return (
                                    <tr
                                        key={c.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap border px-4 py-2">{index + 1}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {formatDate(c.createdAt)}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.company || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{fullName}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.mobile || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.email || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.package || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {formatCurrency(packageDetails.price, packageDetails.symbol)}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {packageDetails.durationType || "N/A"}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {c.pkgUsers || packageDetails.maxUsers || "N/A"}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.paymentMethod || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                paymentStatus.toLowerCase() === 'active' || paymentStatus.toLowerCase() === 'activate' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : paymentStatus.toLowerCase() === 'pending_payment'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : paymentStatus.toLowerCase() === 'expired'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {paymentStatus}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {formatDate(c.startDate || c.packageStartDate)}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {formatDate(c.expiryDate || c.packageExpiryDate)}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                c.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : c.status === 'inactive'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {c.status || "N/A"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default PaymentsDetails;