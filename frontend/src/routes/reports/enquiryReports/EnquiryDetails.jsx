import React, { useState, forwardRef, useImperativeHandle } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";

const EnquiryDetails = forwardRef(({ customers }, ref) => {
    const [filters, setFilters] = useState({
        companyName: "",
        contactPerson: "",
        mobile: "",
        fromDate: "",
        toDate: "",
    });

    const filtered = customers.filter((c) => {
        const fullName = `${c.salutation || ""} ${c.firstName || ""} ${c.middleName || ""} ${c.lastName || ""}`.trim();

        const createdAtDate = new Date(c.createdAt);
        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;

        const dateMatch = (!from || createdAtDate >= from) && (!to || createdAtDate <= to);

        return (
            (!filters.companyName || c.companyName?.toLowerCase().includes(filters.companyName.toLowerCase())) &&
            (!filters.contactPerson || fullName.toLowerCase().includes(filters.contactPerson.toLowerCase())) &&
            (!filters.mobile || c.mobile?.includes(filters.mobile)) &&
            dateMatch
        );
    });

    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

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
                        options={["All Companies", ...new Set(customers.map((c) => c.companyName).filter(Boolean))]}
                        value={filters.companyName || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                companyName: newValue === "All Companies" ? "" : newValue || "",
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
                        label="Contact Person"
                        size="small"
                        value={filters.contactPerson}
                        onChange={(e) => setFilters({ ...filters, contactPerson: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <TextField
                        label="Mobile"
                        size="small"
                        value={filters.mobile}
                        onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                        onClick={() => setFilters({ companyName: "", contactPerson: "", mobile: "", fromDate: "", toDate: "" })}
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <table
                    id="customerTable"
                    className="w-full border-collapse text-xs sm:text-sm lg:text-base"
                >
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {["Sr. No.", "Date", "Company Name", "GSTIN No.", "Customer Name", "City", "Country", "Pincode", "Mobile"].map((head) => (
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
                                    colSpan="9"
                                    className="border py-6 text-center text-gray-400"
                                >
                                    No customers found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c, index) => {
                                const fullName = `${c.salutation || ""} ${c.firstName || ""} ${c.middleName || ""} ${c.lastName || ""}`.trim();
                                return (
                                    <tr
                                        key={c.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap border px-4 py-2">{index + 1}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {new Date(c.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.companyName}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.gstinNo || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{fullName}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.billingCity}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.billingCountry}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.billingPincode}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{c.mobile}</td>
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

export default EnquiryDetails;
