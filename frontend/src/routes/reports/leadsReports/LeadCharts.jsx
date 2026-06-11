import React, { useState, useMemo, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { TextField, Autocomplete } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getLeadSource } from "../../../redux/actions/leadSource";
import { getLeadStage } from "../../../redux/actions/leadStage";
import { getLeadStatus } from "../../../redux/actions/leadStatus";

const COLORS = ["#053054", "#0284C7", "#0E7490", "#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];
const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LeadCharts = ({ leads = [] }) => {

    const dispatch = useDispatch();
    const { leadSource } = useSelector((s) => s.leadSource);
    const { leadStage } = useSelector((s) => s.leadStage);
    const { leadStatus } = useSelector((s) => s.leadStatus);

    useEffect(() => {
        dispatch(getLeadSource());
        dispatch(getLeadStage());
        dispatch(getLeadStatus());
    }, [dispatch]);

    // ----------------- RESPONSIVE PIE CHART SIZE ------------------
    const [pieRadius, setPieRadius] = useState(120);

    useEffect(() => {
        const updateRadius = () => setPieRadius(window.innerWidth < 768 ? 90 : 120);
        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    // ----------------- FILTERS ------------------
    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        stage: "",
        status: "",
        source: "",
    });

    const parseDate = (d) => {
        if (!d) return null;
        if (d.includes("-")) {
            const [day, month, year] = d.split("-");
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(d);
    };

    // ----------------- FILTERED LEADS ------------------
    const filtered = useMemo(() => {
        return leads.filter((l) => {
            const leadDate = parseDate(l.date || l.createdAt || l.followup_date);

            const from = filters.fromDate ? new Date(filters.fromDate) : null;
            const to = filters.toDate ? new Date(filters.toDate) : null;

            const matchesDate =
                (!from || (leadDate && leadDate >= from)) &&
                (!to || (leadDate && leadDate <= to));

            const matchesStage =
                !filters.stage ||
                (l.leadStage && l.leadStage.toLowerCase() === filters.stage.toLowerCase());

            const matchesStatus =
                !filters.status ||
                (l.leadStatus && l.leadStatus.toLowerCase() === filters.status.toLowerCase());

            const matchesSource =
                !filters.source ||
                (l.leadSource && l.leadSource.toLowerCase() === filters.source.toLowerCase());

            return matchesDate && matchesStage && matchesStatus && matchesSource;
        });
    }, [filters, leads]);

    // ----------------- STAGE PIE DATA ------------------
    const stageData = useMemo(() => {
        const counts = {};
        filtered.forEach((l) => {
            const key = l.leadStage || "Unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- STATUS PIE DATA ------------------
    const statusData = useMemo(() => {
        const counts = {};
        filtered.forEach((l) => {
            const key = l.leadStatus || "Unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // ----------------- MONTH BAR DATA ------------------
    const monthData = useMemo(() => {
        const counts = {};
        filtered.forEach((l) => {
            const d = parseDate(l.date || l.createdAt || l.followup_date);
            if (!d) return;
            const month = d.toLocaleString("en-US", { month: "short" });
            counts[month] = (counts[month] || 0) + 1;
        });

        return monthOrder
            .map((m) => ({
                name: m,
                value: counts[m] || 0,
            }))
            .filter((m) => m.value > 0);
    }, [filtered]);

    // ----------------- SOURCE BAR DATA ------------------
    const sourceData = useMemo(() => {
        const counts = {};
        filtered.forEach((l) => {
            const key = l.leadSource || "Unknown";
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    return (
        <div className="space-y-6 p-6">

            {/* ------------------ FILTERS ------------------ */}
            <div className="rounded-xl border bg-white p-5 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-[#053054]">🔎 Lead Filters</h2>

                <div className="flex flex-wrap gap-4 items-center">

                    {/* FROM DATE */}
                    <TextField
                        type="date"
                        label="From Date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="w-full lg:w-56"
                    />

                    {/* TO DATE */}
                    <TextField
                        type="date"
                        label="To Date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="w-full lg:w-56"
                    />

                    {/* STAGE */}
                    <Autocomplete
                        disablePortal
                        options={[
                            "All Stages",
                            ...(leadStage?.map((s) => s.leadStage) || []),
                        ]}
                        value={filters.stage || null}
                        onChange={(e, val) =>
                            setFilters({ ...filters, stage: val === "All Stages" ? "" : val || "" })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Stage" size="small" />
                        )}
                        className="w-full lg:w-56"
                    />

                    {/* STATUS */}
                    <Autocomplete
                        disablePortal
                        options={[
                            "All Status",
                            ...(leadStatus?.map((s) => s.leadStatus) || []),
                        ]}
                        value={filters.status || null}
                        onChange={(e, val) =>
                            setFilters({ ...filters, status: val === "All Status" ? "" : val || "" })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Status" size="small" />
                        )}
                        className="w-full lg:w-56"
                    />

                    {/* SOURCE */}
                    <Autocomplete
                        disablePortal
                        options={[
                            "All Sources",
                            ...(leadSource?.map((s) => s.leadSource) || []),
                        ]}
                        value={filters.source || null}
                        onChange={(e, val) =>
                            setFilters({ ...filters, source: val === "All Sources" ? "" : val || "" })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Source" size="small" />
                        )}
                        className="w-full lg:w-56"
                    />

                    {/* RESET */}
                    <Button
                        variant="text"
                        className="flex items-center gap-2 rounded bg-[#053054] px-4 py-2 text-white"
                        onClick={() =>
                            setFilters({ fromDate: "", toDate: "", stage: "", status: "", source: "" })
                        }
                    >
                        <RefreshCw size={18} /> Reset
                    </Button>
                </div>
            </div>

            {/* ------------------ CHARTS (RESPONSIVE) ------------------ */}
            <div
                id="leadChart"
                className="grid gap-6 grid-cols-1 lg:grid-cols-2"
            >
                {/* ------ STAGE PIE CHART ------ */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Stage Wise Leads</h3>

                    {stageData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={stageData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {stageData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ------ STATUS PIE CHART ------ */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Status Wise Leads</h3>

                    {statusData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Legend />
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {statusData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ------ MONTHLY BAR CHART ------ */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Monthly Leads</h3>

                    {monthData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthData} barCategoryGap={20}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#053054" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ------ SOURCE BAR CHART ------ */}
                <div className="rounded-xl border bg-white p-5 shadow-lg">
                    <h3 className="mb-4 text-lg font-medium">Source Wise Leads</h3>

                    {sourceData.length === 0 ? (
                        <p className="text-gray-500 text-sm">No data available…</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={sourceData} barCategoryGap={20}>
                                <XAxis dataKey="name" />
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

export default LeadCharts;
