import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { TextField, Autocomplete, MenuItem, Box, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getRoles } from "../../../redux/actions/rbac";
import { getEmployees } from "../../../redux/actions/employee";
import api from "../../../utils/api";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const quarters = ["First Quarter (Jan-Mar)", "Second Quarter (Apr-Jun)", "Third Quarter (Jul-Sep)", "Fourth Quarter (Oct-Dec)"];
const halfYears = ["First Half (Jan-Jun)", "Second Half (Jul-Dec)"];
const COLORS = ["#053054", "#0E7490", "#4B5563", "#F59E0B", "#84CC16", "#10B981", "#DC2626"];

const IncentiveCharts = () => {
    const dispatch = useDispatch();
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [type, setType] = useState("");
    const [period, setPeriod] = useState("");
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getRoles());
        dispatch(getEmployees());
    }, [dispatch]);

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter(Boolean).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown";
        return `${fullName} (${roleName})`;
    };

    const employeeOptions = employees
        ? [{ id: "all", firstName: "All Employees" }, ...employees.filter((emp) => roles.find((r) => r.id === emp.role_id)?.name !== "Super Admin")]
        : [];

    const handleSearch = async () => {
        setLoading(true);
        setChartData([]);
        const result = [];

        const year = new Date().getFullYear();
        const periodValue = type === "Yearly" ? year.toString() : period;

        if (selectedEmployee?.id === "all") {
            const filteredEmps = employees.filter((emp) => roles.find((r) => r.id === emp.role_id)?.name !== "Super Admin");
            for (const emp of filteredEmps) {
                const params = new URLSearchParams({ employee_id: emp.id, type: type.toLowerCase(), period: periodValue });
                try {
                    const res = await api.get(`/incentives?${params}`);
                    if (Array.isArray(res.data)) {
                        result.push(...res.data.map((item) => ({ ...item, employee: emp })));
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        } else if (selectedEmployee) {
            const params = new URLSearchParams({ employee_id: selectedEmployee.id, type: type.toLowerCase(), period: periodValue });
            try {
                const res = await api.get(`/incentives?${params}`);
                if (Array.isArray(res.data)) {
                    result.push(...res.data.map((item) => ({ ...item, employee: selectedEmployee })));
                }
            } catch (err) {
                console.error(err);
            }
        }

        setChartData(result);
        setLoading(false);
    };

    const handleReset = () => {
        setSelectedEmployee(null);
        setType("");
        setPeriod("");
        setChartData([]);
    };

    // Prepare data for charts - Always use full formatted employee name
    const employeeIncentiveData = useMemo(() => {
        const map = {};
        chartData.forEach((item) => {
            const empName = formatEmployeeName(item.employee);
            if (!map[empName]) map[empName] = { name: empName, targeted: 0, achieved: 0, incentive: 0 };
            map[empName].targeted += item.targeted_amount ?? item.assignedIncentive?.targeted_amount ?? 0;
            map[empName].achieved += item.achieved_sales ?? 0;
            map[empName].incentive += item.calculated_incentive ?? 0;
        });
        return Object.values(map);
    }, [chartData]);

    const productPieData = useMemo(() => {
        const map = {};
        chartData.forEach((item) => {
            const prod = item.selectedProductName || item.assignedIncentive?.selectedProductName || "Unknown";
            map[prod] = (map[prod] || 0) + (item.calculated_incentive ?? 0);
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [chartData]);

    const useWindowWidth = () => {
        const [width, setWidth] = useState(0);

        useEffect(() => {
            const handleResize = () => setWidth(window.innerWidth);
            setWidth(window.innerWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        return width;
    };

    const windowWidth = useWindowWidth();

    const pieRadius = windowWidth >= 1024 ? 130 : windowWidth >= 768 ? 100 : 80;

    return (
        <div className="space-y-6 p-6">
            {/* Filters */}
            <div className="rounded-xl border bg-white p-5 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-[#053054]">🔎 Filters</h2>
                <Box className="flex flex-wrap items-center gap-4">
                    <Autocomplete
                        options={employeeOptions}
                        getOptionLabel={(opt) => (opt.id === "all" ? "All Employees" : formatEmployeeName(opt))}
                        value={selectedEmployee}
                        onChange={(_, v) => setSelectedEmployee(v)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Employee"
                                size="small"
                            />
                        )}
                        className="w-full lg:w-60"
                    />
                    <TextField
                        select
                        label="Type"
                        size="small"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setPeriod("");
                        }}
                        className="w-full lg:w-60"
                    >
                        <MenuItem value="Monthly">Monthly</MenuItem>
                        <MenuItem value="Quarterly">Quarterly</MenuItem>
                        <MenuItem value="Half Yearly">Half Yearly</MenuItem>
                        <MenuItem value="Yearly">Yearly</MenuItem>
                    </TextField>
                    {type && type !== "Yearly" && (
                        <TextField
                            select
                            label="Period"
                            size="small"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full lg:w-60"
                        >
                            {type === "Monthly" &&
                                months.map((m) => (
                                    <MenuItem
                                        key={m}
                                        value={m}
                                    >
                                        {m}
                                    </MenuItem>
                                ))}
                            {type === "Quarterly" &&
                                quarters.map((q, i) => (
                                    <MenuItem
                                        key={i}
                                        value={`Q${i + 1}`}
                                    >
                                        {q}
                                    </MenuItem>
                                ))}
                            {type === "Half Yearly" &&
                                halfYears.map((h, i) => (
                                    <MenuItem
                                        key={i}
                                        value={`H${i + 1}`}
                                    >
                                        {h}
                                    </MenuItem>
                                ))}
                        </TextField>
                    )}
                    <div className="flex items-center justify-center gap-5 md:gap-3">
                        <Button
                            variant="gradient"
                            onClick={handleSearch}
                            className="flex items-center gap-2 rounded bg-[#053054] px-3 py-2 text-xs capitalize md:text-sm"
                        >
                            <Search size={18} /> Search
                        </Button>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#666666] px-3 py-2 text-xs capitalize md:text-sm"
                            onClick={handleReset}
                        >
                            <RefreshCw size={20} />
                            Reset
                        </Button>
                    </div>
                </Box>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <CircularProgress />
                </div>
            ) : chartData.length === 0 ? (
                <div className="py-10 text-center text-gray-500">No data available. Apply filters and search.</div>
            ) : (
                <div
                    id="incentiveChart"
                    className="grid grid-cols-1 gap-8"
                >
                    {/* Bar Chart - Employee wise */}
                    <div className="rounded-xl border bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-lg font-medium text-[#053054]">Employee-wise Incentive Summary</h3>
                        <ResponsiveContainer
                            width="100%"
                            height={500}
                        >
                            <BarChart
                                data={employeeIncentiveData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={120}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                <Legend />
                                <Bar
                                    dataKey="targeted"
                                    fill="#053054"
                                    name="Targeted"
                                />
                                <Bar
                                    dataKey="achieved"
                                    fill="#0E7490"
                                    name="Achieved"
                                />
                                <Bar
                                    dataKey="incentive"
                                    fill="#10B981"
                                    name="Incentive Earned"
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart - Product wise Incentive */}
                    <div className="rounded-xl border bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-lg font-medium text-[#053054]">Product-wise Incentive Distribution</h3>
                        <ResponsiveContainer
                            width="100%"
                            height={500}
                        >
                            <PieChart>
                                <Pie
                                    data={productPieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={pieRadius}
                                    label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                                >
                                    {productPieData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncentiveCharts;
