import React, { useState, forwardRef, useImperativeHandle } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";

const InvoiceDetails = forwardRef(({ invoices }, ref) => {
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        companyName: "",
        customerName: "",
        mobile: "",
        email: "",
    });

    // Extract unique values for autocomplete suggestions
    const companyNames = [...new Set(invoices.map((inv) => inv.selectedCompany).filter(Boolean))];

    // Filtering logic
    const filtered = invoices.filter((invoice) => {
        // Parse invoice date (format: "DD-MM-YYYY")
        let invoiceDate = null;
        if (invoice.date) {
            const [day, month, year] = invoice.date.split("-");
            if (day && month && year) {
                invoiceDate = new Date(`${year}-${month}-${day}`);
            }
        }

        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;

        const dateInRange = (!from || (invoiceDate && invoiceDate >= from)) && (!to || (invoiceDate && invoiceDate <= to));

        const matchesCompany = !filters.companyName || invoice.selectedCompany?.toLowerCase().includes(filters.companyName.toLowerCase());

        const matchesCustomer = !filters.customerName || invoice.customerPerson?.toLowerCase().includes(filters.customerName.toLowerCase());

        const matchesMobile = !filters.mobile || invoice.mobile?.includes(filters.mobile);

        const matchesEmail = !filters.email || invoice.email?.toLowerCase().includes(filters.email.toLowerCase());

        return dateInRange && matchesCompany && matchesCustomer && matchesMobile && matchesEmail;
    });

    // Expose filtered data for Excel export in parent (Reports.jsx)
    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

    return (
        <div className="space-y-6 p-4">
            {/* Filters Section */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <h2 className="mb-3 text-lg font-semibold text-[#053054]">🔎 Filters</h2>
                <div className="flex flex-wrap gap-3">
                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        className="w-40"
                    />
                    <TextField
                        label="To Date"
                        type="date"
                        size="small"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        className="w-40"
                    />
                    <Autocomplete
                        disablePortal
                        options={["All Companies", ...companyNames]}
                        value={filters.companyName || null}
                        onChange={(_, val) => setFilters({ ...filters, companyName: val === "All Companies" ? "" : val || "" })}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Company Name"
                                size="small"
                            />
                        )}
                        className="w-48"
                    />
                    <TextField
                        label="Customer Name"
                        size="small"
                        value={filters.customerName}
                        onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                        className="w-44"
                    />
                    <TextField
                        label="Mobile No"
                        size="small"
                        value={filters.mobile}
                        onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                        className="w-44"
                    />
                    <TextField
                        label="Email Id"
                        size="small"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                        className="w-44"
                    />
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-sm capitalize"
                        onClick={() =>
                            setFilters({
                                fromDate: "",
                                toDate: "",
                                companyName: "",
                                customerName: "",
                                mobile: "",
                                email: "",
                            })
                        }
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-max overflow-x-auto rounded-xl border bg-white p-4 shadow">
                <table id="invoiceTable" className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {[
                                "Sr. No.",
                                "Date",
                                "Company Name",
                                "Customer Name",
                                "Mobile No",
                                "Email Id",
                                "Products",
                                "Quantity",
                                "Total",
                                "Final Amount",
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="whitespace-nowrap border px-4 py-3 text-left"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="border py-8 text-center text-gray-400"
                                >
                                    No invoices found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((invoice, index) => {
                                const intrastate = invoice.productInvoiceDetails?.intrastate || [];
                                const interstate = invoice.productInvoiceDetails?.interstate || [];
                                const allProducts = [...intrastate, ...interstate];

                                return (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="border px-4 py-2 text-center">{index + 1}</td>
                                        <td className="border px-4 py-2">{invoice.date || "N/A"}</td>
                                        <td className="border px-4 py-2">{invoice.selectedCompany || "N/A"}</td>
                                        <td className="border px-4 py-2">{invoice.customerPerson || "N/A"}</td>
                                        <td className="border px-4 py-2">{invoice.mobile || "N/A"}</td>
                                        <td className="border px-4 py-2">{invoice.email || "N/A"}</td>

                                        {/* PRODUCTS */}
                                        <td className="border px-4 py-2">
                                            {allProducts.length > 0
                                                ? allProducts.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {p.product} <br />
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        {/* QUANTITY */}
                                        <td className="border px-4 py-2 text-center">
                                            {allProducts.length > 0
                                                ? allProducts.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {p.quantity}
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        {/* TOTAL */}
                                        <td className="border px-4 py-2 text-right">
                                            {allProducts.length > 0
                                                ? allProducts.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {parseFloat(p.total || 0).toLocaleString("en-IN")}
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        {/* FINAL AMOUNT */}
                                        <td className="border px-4 py-2 text-right">
                                            {parseFloat(invoice.finalAmt || 0).toLocaleString("en-IN")}
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

InvoiceDetails.displayName = "InvoiceDetails";

export default InvoiceDetails;
