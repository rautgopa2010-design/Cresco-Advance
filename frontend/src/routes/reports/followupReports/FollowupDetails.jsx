import React, { useState, forwardRef, useImperativeHandle, useMemo, useEffect } from "react";
import { TextField, Autocomplete, Chip } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { getFollowupsByLead } from "../../../redux/actions/leadAndFollowup";
import { getLeadStage } from "../../../redux/actions/leadStage";
import { getLeadStatus } from "../../../redux/actions/leadStatus";
import { getEmployees } from "../../../redux/actions/employee";

const FollowupDetails = forwardRef(({ followups = [], leads = [] }, ref) => {
    const dispatch = useDispatch();

    const { leadStage } = useSelector((state) => state.leadStage);
    const { leadStatus } = useSelector((state) => state.leadStatus);
    const { employees } = useSelector((state) => state.employee);

    // -------------------- FILTERS --------------------
    const [filters, setFilters] = useState({
        companyName: "",
        leadId: "",
        followupDate: "",
        stage: "",
        status: "",
        assignedTo: [],
    });

    // Fetch Stage, Status, Employees
    useEffect(() => {
        dispatch(getLeadStage());
        dispatch(getLeadStatus());
        dispatch(getEmployees());
    }, [dispatch]);

    // -------------------- COMPANY OPTIONS --------------------
    const companyOptions = useMemo(() => {
        const companies = leads.map((l) => l.companyName).filter(Boolean);
        return [...new Set(companies)];
    }, [leads]);

    const leadOptions = useMemo(() => {
        if (!filters.companyName) return [];

        return leads
            .filter((l) => l.companyName === filters.companyName)
            .map((l) => ({
                label: `Lead id${l.lead_no || l.id}`,
                value: l.id,
            }));
    }, [filters.companyName, leads]);

    // ----------- Fetch followups when lead selected -----------
    useEffect(() => {
        if (filters.leadId) {
            dispatch(getFollowupsByLead(filters.leadId));
        }
    }, [filters.leadId, dispatch]);

    // Normalize date to YYYY-MM-DD
    const normalizeDate = (dateString) => {
        if (!dateString) return "";
        return dateString.slice(0, 10);
    };

    // -------------------- ENRICH FOLLOWUPS --------------------
    const enrichedFollowups = useMemo(() => {
        return followups.map((fup) => {
            const lead = leads.find((l) => l.id === fup.lead_id);

            return {
                ...fup,
                lead_no: lead?.lead_no || fup.lead_no || "N/A",
                companyName: lead?.companyName || fup.companyName || "Unknown",
                normalizedDate: normalizeDate(fup.nextFollowUpDate || fup.followup_date),
            };
        });
    }, [followups, leads]);

    const formatEmployeeName = (emp) => {
        if (!emp) return "";
        return `${emp.salutation || ""} ${emp.firstName || ""} ${emp.middleName || ""} ${emp.lastName || ""}`.trim();
    };

    const convertDDMMYYYYtoYYYYMMDD = (d) => {
        if (!d) return "";
        const parts = d.split("-");
        if (parts.length !== 3) return d;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const filtered = enrichedFollowups.filter((fup) => {
        const matchesCompany = !filters.companyName || fup.companyName === filters.companyName;

        const matchesLead = !filters.leadId || fup.lead_id === filters.leadId;

        const matchesFollowupdate = (() => {
            if (!filters.followupDate) return true;

            const formatted = convertDDMMYYYYtoYYYYMMDD(fup.nextFollowUpDate) || convertDDMMYYYYtoYYYYMMDD(fup.followup_date);

            return formatted === filters.followupDate;
        })();

        const matchesStage = !filters.stage || fup.leadStage?.toLowerCase() === filters.stage.toLowerCase();

        const matchesStatus = !filters.status || fup.leadStatus?.toLowerCase() === filters.status.toLowerCase();

        const matchesAssigned =
            filters.assignedTo.length === 0 ||
            filters.assignedTo.some((empObj) => {
                const selectedName = formatEmployeeName(empObj).toLowerCase();
                if (Array.isArray(fup.assignedTo)) {
                    return fup.assignedTo.some((n) => n.toLowerCase().includes(selectedName));
                }
                return (fup.assignedTo || "").toLowerCase().includes(selectedName);
            });

        return matchesCompany && matchesLead && matchesFollowupdate && matchesStage && matchesStatus && matchesAssigned;
    });

    // Expose filtered data to parent
    useImperativeHandle(ref, () => ({
        getFilteredData: () => filtered,
    }));

    // -------------------- HANDLERS --------------------
    const handleCompanyChange = (newValue) => {
        setFilters({
            ...filters,
            companyName: newValue || "",
            leadId: "",
        });
    };

    const handleLeadChange = (newValue) => {
        setFilters({ ...filters, leadId: newValue?.value || "" });
    };

    return (
        <div className="space-y-6 p-4">
            {/* -------------------- FILTER BOX -------------------- */}
            <div className="w-max rounded-xl border bg-white p-4 shadow">
                <h2 className="mb-3 text-lg font-semibold text-[#053054]">🔎 Filters</h2>

                <div className="flex flex-wrap gap-3">
                    {/* Company Name */}
                    <Autocomplete
                        disablePortal
                        options={companyOptions}
                        value={filters.companyName || null}
                        onChange={(e, newValue) => handleCompanyChange(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Company Name"
                                size="small"
                            />
                        )}
                        className="w-40 md:w-52"
                    />

                    {/* Lead Number */}
                    <Autocomplete
                        disablePortal
                        disabled={!filters.companyName}
                        options={leadOptions}
                        value={leadOptions.find((l) => l.value === filters.leadId) || null}
                        onChange={(e, newValue) => handleLeadChange(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Lead Number"
                                size="small"
                            />
                        )}
                        className="w-40 md:w-52"
                    />

                    {/* Followup Date */}
                    <TextField
                        label="Follow-up Date"
                        type="date"
                        size="small"
                        value={filters.followupDate}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                followupDate: e.target.value,
                            })
                        }
                        className="w-40"
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Stage */}
                    <Autocomplete
                        disablePortal
                        options={["All Stages", ...(leadStage || []).map((s) => s.leadStage)]}
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
                            />
                        )}
                        className="w-40 md:w-52"
                    />

                    {/* Status */}
                    <Autocomplete
                        disablePortal
                        options={["All Status", ...(leadStatus || []).map((s) => s.leadStatus)]}
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
                        className="w-40 md:w-52"
                    />

                    {/* Assigned To */}
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={employees || []}
                        getOptionLabel={(option) => formatEmployeeName(option)}
                        value={filters.assignedTo}
                        onChange={(e, newValue) => setFilters({ ...filters, assignedTo: newValue })}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip
                                        key={key}
                                        label={formatEmployeeName(option)}
                                        variant="outlined"
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
                            />
                        )}
                        className="w-40 md:w-52"
                    />

                    {/* Reset Button */}
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                        onClick={() =>
                            setFilters({
                                companyName: "",
                                leadId: "",
                                followupDate: "",
                                stage: "",
                                status: "",
                                assignedTo: [],
                            })
                        }
                    >
                        <RefreshCw size={20} />
                        Reset
                    </Button>
                </div>
            </div>

            {/* -------------------- TABLE -------------------- */}
            <div className="w-max overflow-x-auto rounded-xl border bg-white p-4 shadow">
                <table
                    id="followupTable"
                    className="w-full min-w-[900px] border-collapse text-xs sm:text-sm lg:text-base"
                >
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            {["Sr. No.", "Followup Date", "Company Name", "Stage", "Assigned To", "Status", "Description"].map((head) => (
                                <th
                                    key={head}
                                    className="border px-4 py-3 text-left"
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
                                    colSpan="7"
                                    className="border py-10 text-center text-gray-500"
                                >
                                    {filters.leadId ? "No followups found." : "Select a company and lead."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((f, index) => (
                                <tr
                                    key={f.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="border px-4 py-2">{index + 1}</td>

                                    <td className="border px-4 py-2">{f.normalizedDate || "-"}</td>

                                    <td className="border px-4 py-2">{f.companyName}</td>

                                    <td className="border px-4 py-2">{f.leadStage || "-"}</td>

                                    <td className="whitespace-nowrap border px-4 py-2">
                                        {Array.isArray(f.assignedTo)
                                            ? f.assignedTo.map((val, idx) => (
                                                  <div key={idx}>
                                                      {idx + 1}) {val}
                                                  </div>
                                              ))
                                            : f.assignedTo || "-"}
                                    </td>

                                    <td className="border px-4 py-2">{f.leadStatus || "-"}</td>

                                    <td className="border px-4 py-2">
                                        <div className="w-[300px] whitespace-normal break-words text-justify">{f.followup_desc || "-"}</div>
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

FollowupDetails.displayName = "FollowupDetails";

export default FollowupDetails;
