import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { getProduct } from "../../../redux/actions/product";

const QuotationDetails = forwardRef(({ quotations }, ref) => {
    const dispatch = useDispatch();
    const { product: productList } = useSelector((state) => state.product);

    const [filters, setFilters] = useState({
        companyName: "",
        customerName: "",
        mobileNo: "",
        productName: "",
        fromDate: "",
        toDate: "",
    });

    // Fetch products from Redux on mount
    useEffect(() => {
        dispatch(getProduct());
    }, [dispatch]);

    // Flatten products for Autocomplete
    const allProducts = productList.flatMap((p) =>
        (p.product || []).map((prodName) => ({
            id: p.id,
            brand: p.brand,
            category: p.category,
            subCategory: p.productSubCategoryName,
            name: prodName,
        })),
    );

    // Filter logic
    const filtered = quotations.filter((q) => {
        const createdAtDate = new Date(q.createdAt);
        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;
        const dateMatch = (!from || createdAtDate >= from) && (!to || createdAtDate <= to);

        const allProductsInQuotation = [...(q.productQuotationDetails?.intrastate || []), ...(q.productQuotationDetails?.interstate || [])];

        const productMatch =
            !filters.productName ||
            allProductsInQuotation.some((p) =>
                p.product
                    .toLowerCase()
                    .includes(filters.productName.name ? filters.productName.name.toLowerCase() : filters.productName.toLowerCase()),
            );

        return (
            (!filters.companyName || q.companyName?.toLowerCase().includes(filters.companyName.toLowerCase())) &&
            (!filters.customerName || q.customerPerson?.toLowerCase().includes(filters.customerName.toLowerCase())) &&
            (!filters.mobileNo || q.mobile?.toString().includes(filters.mobileNo)) &&
            productMatch &&
            dateMatch
        );
    });

    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

    return (
        <div className="space-y-6 p-4">
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
                        options={["All Companies", ...new Set(quotations.map((q) => q.companyName).filter(Boolean))]}
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

                    {/* Mobile No */}
                    <TextField
                        label="Mobile No."
                        size="small"
                        value={filters.mobileNo}
                        onChange={(e) => setFilters({ ...filters, mobileNo: e.target.value })}
                        className="w-32 md:w-40 lg:w-44"
                    />

                    {/* Products */}
                    <Autocomplete
                        disablePortal
                        options={allProducts}
                        getOptionLabel={(option) => option.name}
                        value={filters.productName || null}
                        onChange={(_, newValue) => setFilters({ ...filters, productName: newValue || "" })}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Product"
                                size="small"
                            />
                        )}
                        className="w-32 md:w-40 lg:w-48"
                    />

                    {/* Reset Button */}
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                        onClick={() =>
                            setFilters({
                                companyName: "",
                                customerName: "",
                                mobileNo: "",
                                productName: "",
                                fromDate: "",
                                toDate: "",
                            })
                        }
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* ---------------------- TABLE ---------------------- */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <table
                    id="quotationTable"
                    className="w-full border-collapse text-xs sm:text-sm lg:text-base"
                >
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {[
                                "Sr. No.",
                                "Date",
                                "Company Name",
                                "Customer Name",
                                "Mobile No",
                                "Products",
                                "Units",
                                "Quantity",
                                "Total",
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
                                    colSpan="10"
                                    className="border py-6 text-center text-gray-400"
                                >
                                    No quotations found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((q, index) => {
                                const allProductsInQuotation = [
                                    ...(q.productQuotationDetails?.intrastate || []),
                                    ...(q.productQuotationDetails?.interstate || []),
                                ];

                                return (
                                    <tr
                                        key={q.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="border px-4 py-2">{index + 1}</td>
                                        <td className="border px-4 py-2">
                                            {q.date || new Date(q.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                                        </td>
                                        <td className="border px-4 py-2">{q.companyName}</td>
                                        <td className="border px-4 py-2">{q.customerPerson}</td>
                                        <td className="border px-4 py-2">{q.mobile}</td>

                                        {/* Products */}
                                        <td className="border px-4 py-2">
                                            {allProductsInQuotation.length > 0
                                                ? allProductsInQuotation.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {p.product}
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        {/* Units */}
                                        <td className="border px-4 py-2">
                                            {allProductsInQuotation.length > 0
                                                ? allProductsInQuotation.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {p.unit}
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        {/* Quantity */}
                                        <td className="border px-4 py-2">
                                            {allProductsInQuotation.length > 0
                                                ? allProductsInQuotation.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {p.quantity}
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        {/* Total */}
                                        <td className="border px-4 py-2">
                                            {allProductsInQuotation.length > 0
                                                ? allProductsInQuotation.map((p, i) => (
                                                      <div key={i}>
                                                          {i + 1}) {p.total}
                                                      </div>
                                                  ))
                                                : "-"}
                                        </td>

                                        <td className="border px-4 py-2">{q.finalAmt}</td>
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

export default QuotationDetails;
