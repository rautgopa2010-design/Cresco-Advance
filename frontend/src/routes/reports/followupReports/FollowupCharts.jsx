import React, { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { TextField, Autocomplete, Chip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getFollowupsByLead } from "../../../redux/actions/leadAndFollowup";
import { getLeadStage } from "../../../redux/actions/leadStage";
import { getLeadStatus } from "../../../redux/actions/leadStatus";
import { getEmployees } from "../../../redux/actions/employee";

const COLORS = ["#053054", "#0284C7", "#0E7490", "#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];
const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FollowupCharts = ({ followups = [], leads = [] }) => {
    const dispatch = useDispatch();
    const { leadStage, leadStatus, employees = [] } = useSelector((state) => ({
        leadStage: state.leadStage?.leadStage || [],
        leadStatus: state.leadStatus?.leadStatus || [],
        employees: state.employee?.employees || [],
    }));

    useEffect(() => {
        dispatch(getLeadStage());
        dispatch(getLeadStatus());
        dispatch(getEmployees());
    }, [dispatch]);

    const [filters, setFilters] = useState({
        companyName: "",
        leadId: "",
        followupDate: "",
        stage: "",
        status: "",
        assignedTo: [],
    });

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

    useEffect(() => {
        if (filters.leadId) {
            dispatch(getFollowupsByLead(filters.leadId));
        }
    }, [filters.leadId, dispatch]);

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const trimmed = dateStr.trim();
        if (!trimmed) return null;

        // Case 1: YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const date = new Date(trimmed);
            if (!isNaN(date)) return date;
        }

        // Case 2: DD-MM-YYYY
        if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
            const [d, m, y] = trimmed.split("-");
            const date = new Date(`${y}-${m}-${d}`);
            if (!isNaN(date)) return date;
        }

        return null;
    };

    const formatEmployeeName = (emp) => {
        if (!emp) return "";
        if (typeof emp === "string") return emp.trim();
        return `${emp.salutation || ""} ${emp.firstName || ""} ${emp.middleName || ""} ${emp.lastName || ""}`
            .trim()
            .replace(/\s+/g, " ");
    };

    const enrichedFollowups = useMemo(() => {
        return followups.map((fup) => {
            const lead = leads.find((l) => l.id === fup.lead_id);
            const date = parseDate(fup.nextFollowUpDate || fup.followup_date);

            return {
                ...fup,
                lead_no: lead?.lead_no || fup.lead_no || "N/A",
                companyName: lead?.companyName || fup.companyName || "Unknown",
                parsedDate: date,
                month: date ? date.toLocaleString("en-US", { month: "short" }) : null,
            };
        });
    }, [followups, leads]);

    const filtered = useMemo(() => {
        return enrichedFollowups.filter((fup) => {
            const matchesCompany = !filters.companyName || fup.companyName === filters.companyName;
            const matchesLead = !filters.leadId || fup.lead_id === filters.leadId;
            const matchesDate = !filters.followupDate || 
                (fup.parsedDate && fup.parsedDate.toISOString().slice(0, 10) === filters.followupDate);
            const matchesStage = !filters.stage || (fup.leadStage || "").toLowerCase() === filters.stage.toLowerCase();
            const matchesStatus = !filters.status || (fup.leadStatus || "").toLowerCase() === filters.status.toLowerCase();

            const matchesAssigned = filters.assignedTo.length === 0 || filters.assignedTo.some((selectedEmp) => {
                const selectedName = formatEmployeeName(selectedEmp).toLowerCase();
                const assigned = fup.assignedTo;

                if (Array.isArray(assigned)) {
                    return assigned.some((name) => formatEmployeeName(name).toLowerCase().includes(selectedName));
                }
                return formatEmployeeName(assigned).toLowerCase().includes(selectedName);
            });

            return matchesCompany && matchesLead && matchesDate && matchesStage && matchesStatus && matchesAssigned;
        });
    }, [enrichedFollowups, filters]);

    // 1. Stage Wise
    const stageData = useMemo(() => {
        const counts = {};
        filtered.forEach((f) => {
            const key = f.leadStage || "Unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // 2. Status Wise
    const statusData = useMemo(() => {
        const counts = {};
        filtered.forEach((f) => {
            const key = f.leadStatus || "Unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // 3. Monthly Follow-ups (UPDATED: Matching your desired style)
    const monthlyData = useMemo(() => {
        const counts = {};
        filtered.forEach((f) => {
            if (f.month) {
                counts[f.month] = (counts[f.month] || 0) + 1;
            }
        });
        return monthOrder
            .map((m) => ({
                name: m,
                value: counts[m] || 0,
            }))
            .filter((item) => item.value > 0);
    }, [filtered]);

    // 4. Top 10 Employees (UPDATED: Horizontal + Rotated Labels + Style Match)
    const employeeData = useMemo(() => {
        const counts = {};

        filtered.forEach((f) => {
            let assignedList = [];

            if (Array.isArray(f.assignedTo)) {
                assignedList = f.assignedTo;
            } else if (f.assignedTo) {
                assignedList = [f.assignedTo];
            }

            assignedList.forEach((item) => {
                const name = formatEmployeeName(item);
                if (name) {
                    counts[name] = (counts[name] || 0) + 1;
                }
            });
        });

        return Object.entries(counts)
            .map(([name, value]) => ({
                name: name.length > 22 ? name.substring(0, 19) + "..." : name,
                value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [filtered]);

    const [pieRadius, setPieRadius] = useState(120);
    useEffect(() => {
        const update = () => setPieRadius(window.innerWidth < 768 ? 90 : 120);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return (
        <div className="space-y-6 p-6">
            {/* Filters */}
            <div className="rounded-xl border bg-white p-5 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-[#053054]">🔎 Follow-up Filters</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <Autocomplete
                        disablePortal
                        options={companyOptions}
                        value={filters.companyName || null}
                        onChange={(_, v) => setFilters({ ...filters, companyName: v || "", leadId: "" })}
                        renderInput={(params) => <TextField {...params} label="Company Name" size="small" />}
                        className="w-full md:w-64"
                    />
                    <Autocomplete
                        disablePortal
                        disabled={!filters.companyName}
                        options={leadOptions}
                        value={leadOptions.find((l) => l.value === filters.leadId) || null}
                        onChange={(_, v) => setFilters({ ...filters, leadId: v?.value || "" })}
                        renderInput={(params) => <TextField {...params} label="Lead Number" size="small" />}
                        className="w-full md:w-64"
                    />
                    <TextField
                        label="Follow-up Date"
                        type="date"
                        size="small"
                        value={filters.followupDate}
                        onChange={(e) => setFilters({ ...filters, followupDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        className="w-full md:w-56"
                    />
                    <Autocomplete
                        disablePortal
                        options={["All Stages", ...(leadStage || []).map((s) => s.leadStage)]}
                        value={filters.stage || null}
                        onChange={(_, v) => setFilters({ ...filters, stage: v === "All Stages" ? "" : v || "" })}
                        renderInput={(params) => <TextField {...params} label="Stage" size="small" />}
                        className="w-full md:w-56"
                    />
                    <Autocomplete
                        disablePortal
                        options={["All Status", ...(leadStatus || []).map((s) => s.leadStatus)]}
                        value={filters.status || null}
                        onChange={(_, v) => setFilters({ ...filters, status: v === "All Status" ? "" : v || "" })}
                        renderInput={(params) => <TextField {...params} label="Status" size="small" />}
                        className="w-full md:w-56"
                    />
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={employees || []}
                        getOptionLabel={(opt) => formatEmployeeName(opt)}
                        value={filters.assignedTo}
                        onChange={(_, v) => setFilters({ ...filters, assignedTo: v })}
                        renderTags={(value, getTagProps) =>
                            value.map((opt, i) => (
                                <Chip key={i} label={formatEmployeeName(opt)} {...getTagProps({ i })} />
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Assigned To" size="small" />}
                        className="w-full md:w-64"
                    />
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 bg-[#053054] px-4 py-2 text-white"
                        onClick={() => setFilters({
                            companyName: "", leadId: "", followupDate: "", stage: "", status: "", assignedTo: []
                        })}
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* Charts Grid */}
            <div id="followupChart" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Stage Wise */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Stage Wise Follow-ups</h3>
                    {stageData.length === 0 ? (
                        <p className="text-center text-gray-500">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={stageData} dataKey="value" nameKey="name" outerRadius={pieRadius} label>
                                    {stageData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Status Wise */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Status Wise Follow-ups</h3>
                    {statusData.length === 0 ? (
                        <p className="text-center text-gray-500">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={pieRadius} label>
                                    {statusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Monthly Follow-ups - NOW MATCHES YOUR DESIRED STYLE */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Monthly Follow-ups</h3>
                    {monthlyData.length === 0 ? (
                        <p className="text-center text-gray-500">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyData} barCategoryGap={20}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#053054" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top 10 Employees - NOW WITH ROTATED LABELS & SAME STYLE */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Top 10 Employees by Follow-ups</h3>
                    {employeeData.length === 0 ? (
                        <p className="text-center text-gray-500">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={employeeData} barCategoryGap={20}>
                                <XAxis 
                                    dataKey="name" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={100} 
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#0E7490" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowupCharts;