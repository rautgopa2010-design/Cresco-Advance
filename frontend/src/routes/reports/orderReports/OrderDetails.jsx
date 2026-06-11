import React, { useState, forwardRef, useImperativeHandle } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";

const OrderDetails = forwardRef(({ orders }, ref) => {
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        companyName: "",
        customerName: "",
        mobile: "",
        email: "",
        status: "",
        paymentDueDate: "",
    });

    // Extract unique values for autocomplete
    const companyNames = [...new Set(orders.map((o) => o.selectedCompany).filter(Boolean))];
    const customerNames = [...new Set(orders.map((o) => o.customerPerson).filter(Boolean))];
    const statuses = [...new Set(orders.map((o) => o.status).filter(Boolean))];

    // Filter logic
    const filtered = orders.filter((order) => {
        // Parse order date: assuming order.date is in "DD-MM-YYYY"
        const [day, month, year] = (order.date || "").split("-");
        const orderDate = year ? new Date(`${year}-${month}-${day}`) : null;

        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;

        const dateInRange = (!from || (orderDate && orderDate >= from)) && (!to || (orderDate && orderDate <= to));

        // Payment Due Date Match (check all payment entries)
        const dueDateMatch =
        !filters.paymentDueDate ||
        (order.orderPaymentDetails &&
            order.orderPaymentDetails.some((p) => {
                if (!p.dueDate) return false;
    
                // convert dd-mm-yyyy → yyyy-mm-dd
                const [dd, mm, yyyy] = p.dueDate.split("-");
                const formatted = `${yyyy}-${mm}-${dd}`;
    
                return formatted === filters.paymentDueDate;
            })
        );

        return (
            dateInRange &&
            dueDateMatch &&
            (!filters.companyName || order.selectedCompany?.toLowerCase().includes(filters.companyName.toLowerCase())) &&
            (!filters.customerName || order.customerPerson?.toLowerCase().includes(filters.customerName.toLowerCase())) &&
            (!filters.mobile || order.mobile?.includes(filters.mobile)) &&
            (!filters.email || order.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
            (!filters.status || order.status === filters.status)
        );
    });

    // Expose filtered data to parent (for Excel export)
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
                    {/* Company Name */}
                    <Autocomplete
                        disablePortal
                        options={["All Companies", ...companyNames]}
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
                                label="Company Name"
                                size="small"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-48"
                    />
                    {/* Customer Name */}
                    <TextField
                        label="Customer Name"
                        size="small"
                        value={filters.customerName}
                        onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />
                    {/* Mobile */}
                    <TextField
                        label="Mobile No"
                        size="small"
                        value={filters.mobile}
                        onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />
                    {/* Email */}
                    <TextField
                        label="Email Id"
                        size="small"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />
                    {/* Status */}
                    <Autocomplete
                        disablePortal
                        options={["All Status", ...statuses]}
                        value={filters.status || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                status: newValue === "All Status" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Status"
                                size="small"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-44"
                    />
                    {/* Payment Due Date */}
                    <TextField
                        label="Payment Due Date"
                        type="date"
                        size="small"
                        value={filters.paymentDueDate}
                        onChange={(e) => setFilters({ ...filters, paymentDueDate: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                        InputLabelProps={{ shrink: true }}
                    />
                    {/* Reset Button */}
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                        onClick={() =>
                            setFilters({
                                fromDate: "",
                                toDate: "",
                                companyName: "",
                                customerName: "",
                                mobile: "",
                                email: "",
                                status: "",
                                paymentDueDate: "",
                            })
                        }
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <table id="orderTable" className="w-full border-collapse text-xs sm:text-sm lg:text-base">
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {[
                                "Sr. No.",
                                "Date",
                                "Payment Due Date",
                                "Company Name",
                                "Customer Name",
                                "Mobile No",
                                "Email Id",
                                "Status",
                                "Final Amount",
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
                                    colSpan="9"
                                    className="border py-6 text-center text-gray-400"
                                >
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((order, index) => {
                                // Get first due date or show "N/A"
                                const dueDate =
                                    order.orderPaymentDetails && order.orderPaymentDetails.length > 0 ? order.orderPaymentDetails[0].dueDate : "N/A";

                                return (
                                    <tr
                                        key={order.id}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap border px-4 py-2">{index + 1}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{order.date || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{dueDate}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{order.selectedCompany || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{order.customerPerson || " Gigi"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{order.mobile || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">{order.email || "N/A"}</td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            <span
                                                className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                                                    order.status === "Completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : order.status === "Canceled"
                                                          ? "bg-red-100 text-red-800"
                                                          : order.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {order.status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap border px-4 py-2">
                                            {order.finalAmt?.toLocaleString("en-IN") || "0"}
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

OrderDetails.displayName = "OrderDetails";

export default OrderDetails;
