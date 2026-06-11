import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getLeadSource } from "../../../redux/actions/leadSource";
import { getLeadStage } from "../../../redux/actions/leadStage";
import { getLeadStatus } from "../../../redux/actions/leadStatus";
import { Button } from "@material-tailwind/react";

const LeadDetails = forwardRef(({ leads }, ref) => {
    const dispatch = useDispatch();
    const { leadSource } = useSelector((state) => state.leadSource);
    const { leadStage } = useSelector((state) => state.leadStage);
    const { leadStatus } = useSelector((state) => state.leadStatus);

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        stage: "",
        status: "",
        source: "",
    });

    useEffect(() => {
        dispatch(getLeadSource());
        dispatch(getLeadStage());
        dispatch(getLeadStatus());
    }, [dispatch]);

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const filtered = leads.filter((l) => {
        const leadDate = parseDate(l.date);
        const from = filters.fromDate ? new Date(filters.fromDate) : null;
        const to = filters.toDate ? new Date(filters.toDate) : null;
        return (
            (!from || (leadDate && leadDate >= from)) &&
            (!to || (leadDate && leadDate <= to)) &&
            (!filters.stage || l.leadStage?.toLowerCase() === filters.stage.toLowerCase()) &&
            (!filters.status || l.leadStatus?.toLowerCase() === filters.status.toLowerCase()) &&
            (!filters.source || l.leadSource?.toLowerCase() === filters.source.toLowerCase())
        );
    });

    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

    return (
        <div className="space-y-6 p-4">
            {/* Filter Box */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <h2 className="mb-3 text-lg font-semibold text-[#053054]">🔎 Filters</h2>
                <div className="flex flex-wrap gap-3">
                    <TextField
                        type="date"
                        label="From Date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="w-36 md:w-40 lg:w-44"
                    />
                    <TextField
                        type="date"
                        label="To Date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="w-36 md:w-40 lg:w-44"
                    />
                    <Autocomplete
                        disablePortal
                        options={["All Stages", ...leadStage?.map((item) => item.leadStage)]}
                        value={filters.stage || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                stage: newValue === "All Stages" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Stage"
                                size="small"
                                placeholder="Stage"
                            />
                        )}
                        className="w-36 md:w-40 lg:w-44"
                    />
                    <Autocomplete
                        disablePortal
                        options={["All Status", ...leadStatus?.map((item) => item.leadStatus)]}
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
                                placeholder="Status"
                            />
                        )}
                        className="w-36 md:w-40 lg:w-44"
                    />
                    <Autocomplete
                        disablePortal
                        options={["All Sources", ...leadSource?.map((item) => item.leadSource)]}
                        value={filters.source || null}
                        onChange={(e, newValue) =>
                            setFilters({
                                ...filters,
                                source: newValue === "All Sources" ? "" : newValue || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Source"
                                size="small"
                                placeholder="Source"
                            />
                        )}
                        className="w-36 md:w-40 lg:w-44"
                    />

                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        onClick={() => setFilters({ fromDate: "", toDate: "", stage: "", status: "", source: "" })}
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table Box */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <table
                    id="leadTable"
                    className="w-full border-collapse text-xs sm:text-sm lg:text-base"
                >
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {[
                                "Sr. No.",
                                "Date",
                                "Company Name",
                                "Customer Name",
                                "Source",
                                "Status",
                                "Stage",
                                "Follow-up Date",
                                "Products",
                                "Assigned To",
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
                                    No leads found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((l, index) => (
                                <tr
                                    key={l.id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap border px-4 py-2">{index + 1}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.date}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.companyName}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.customerPerson}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.leadSource}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.leadStatus}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.leadStage}</td>
                                    <td className="whitespace-nowrap border px-4 py-2">{l.followups?.[0]?.followup_date || "-"}</td>
                                    <td className="whitespace-nowrap border px-4 py-2 align-top">
                                        {Array.isArray(l.products) && l.products.length > 0 ? (
                                            <ol className="list-inside list-decimal">
                                                {l.products.map((p, i) => (
                                                    <li key={i}>{p.product}</li>
                                                ))}
                                            </ol>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap border px-4 py-2 align-top">
                                        {Array.isArray(l.assignedTo) && l.assignedTo.length > 0 ? (
                                            <ol className="list-inside list-decimal">
                                                {l.assignedTo.map((person, i) => (
                                                    <li key={i}>{person}</li>
                                                ))}
                                            </ol>
                                        ) : (
                                            "-"
                                        )}
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

export default LeadDetails;
