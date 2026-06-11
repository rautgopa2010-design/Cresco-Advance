import React, { useState, forwardRef, useImperativeHandle } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";

const RegisteredCustomersDetails = forwardRef(({ organizationInfo }, ref) => {
    const [filters, setFilters] = useState({
        company: "",
        customerName: "",
        mobile: "",
        email: "",
        package: "",
        fromDate: "",
        toDate: "",
    });

    // Flatten the organizations array from the main organizationInfo
    const customers = organizationInfo?.organizations || [];

    const filtered = customers.filter((c) => {
        const fullName = c.customerName?.toLowerCase() || "";
        const createdAtDate = new Date(c.createdAt);
        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;

        const dateMatch = (!from || createdAtDate >= from) && (!to || createdAtDate <= to);

        return (
            (!filters.company || c.company?.toLowerCase().includes(filters.company.toLowerCase())) &&
            (!filters.customerName || fullName.includes(filters.customerName.toLowerCase())) &&
            (!filters.mobile || c.mobile?.includes(filters.mobile)) &&
            (!filters.email || c.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
            (!filters.package || c.package?.toLowerCase().includes(filters.package.toLowerCase())) &&
            dateMatch
        );
    });

    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

    // Get unique packages for filter dropdown
    const uniquePackages = [...new Set(customers.map(c => c.package).filter(Boolean))];

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
                        options={["All Companies", ...new Set(customers.map((c) => c.company).filter(Boolean))]}
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

                    <TextField
                        label="Email"
                        size="small"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
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
                                label="Select Package"
                                size="small"
                                placeholder="Select Package"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-48"
                    />

                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                        onClick={() => setFilters({ 
                            company: "", 
                            customerName: "", 
                            mobile: "", 
                            email: "",
                            package: "",
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
            <div className="w-full rounded-xl border bg-white p-4 shadow overflow-x-auto">
                <table
                    id="registeredCustomersTable"
                    className="w-full border-collapse text-xs sm:text-sm lg:text-base"
                >
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {[
                                "Sr. No.", 
                                "Registration Date", 
                                "Company Name", 
                                "Customer Name", 
                                "Email", 
                                "Mobile", 
                                "Package", 
                                "Payment Status",
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
                                    colSpan="10"
                                    className="border py-6 text-center text-gray-400"
                                >
                                    No registered customers found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c, index) => (
                                <tr
                                    key={c.id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap border px-4 py-2">{index + 1}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">
                                        {new Date(c.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                    </td>
                                    <td className="whitespace-nowrap border px-4 py-2">{c.company}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{c.customerName}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{c.email}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{c.mobile}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{c.package || "N/A"}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            c.paymentStatus === 'active' ? 'bg-green-100 text-green-800' : 
                                            c.paymentStatus === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {c.paymentStatus || "N/A"}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap border px-4 py-2">
                                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap border px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            c.status === 'active' ? 'bg-green-100 text-green-800' : 
                                            c.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {c.status || "N/A"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default RegisteredCustomersDetails;