import { Box, CircularProgress, TextField, Autocomplete, MenuItem, Snackbar, Alert } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRoles } from "../redux/actions/rbac";
import { getEmployees } from "../redux/actions/employee";
import { clearSnackbar } from "../redux/actions/commonActions";
import { Button } from "@material-tailwind/react";
import { getIncentives } from "../redux/actions/incentive";
import { Target, Trophy, Users } from "lucide-react";
import { PiTargetBold } from "react-icons/pi";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../utils/api";

const Incentive = () => {
    const dispatch = useDispatch();
    const { roles } = useSelector((state) => state.rbac);
    const { employees, loading } = useSelector((state) => state.employee);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [type, setType] = useState("");
    const [period, setPeriod] = useState("");
    const { incentives } = useSelector((state) => state.incentive);
    const [error, setError] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    // State for totals
    const [totals, setTotals] = useState({
        targeted: 0,
        eligible: 0,
        achieved: 0,
        employeeName: "Employee Name",
    });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const quarters = ["First Quarter (Jan-Mar)", "Second Quarter (Apr-Jun)", "Third Quarter (Jul-Sep)", "Fourth Quarter (Oct-Dec)"];
    const halfYears = ["First Half (Jan-Jun)", "Second Half (Jul-Dec)"];

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getRoles());
        dispatch(getEmployees());
    }, [dispatch]);

    const [hasSearched, setHasSearched] = useState(false);
    const [allIncentives, setAllIncentives] = useState([]);

    const handleSearch = async () => {
        let newError = {};
        if (!selectedEmployee) newError.employee = true;
        if (!type) newError.type = true;
        if (type && type !== "Yearly" && !period) newError.period = true;

        if (Object.keys(newError).length > 0) {
            setError(newError);
            setSnackbarMessage("Please fill all required fields");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setError({});
        setHasSearched(true);
        dispatch(clearSnackbar());

        if (selectedEmployee.id === "all") {
            // ✅ All employees case
            console.log("Searching incentives for ALL employees...");

            const filteredEmps = employees.filter((emp) => {
                const roleName = roles.find((r) => r.id === emp.role_id)?.name;
                return roleName !== "Super Admin";
            });

            let allIncentives = [];

            for (const emp of filteredEmps) {
                const params = new URLSearchParams();
                params.append("employee_id", emp.id);
                params.append("type", type.toLowerCase());
                params.append("period", type === "Yearly" ? new Date().getFullYear().toString() : period);

                console.log("Fetching incentive for employee:", emp.firstName, Object.fromEntries(params));

                try {
                    const res = await api.get(`/incentives?${params.toString()}`);
                    if (res.data && Array.isArray(res.data)) {
                        allIncentives = [...allIncentives, ...res.data];
                    }
                } catch (err) {
                    console.error(`Error fetching for ${emp.firstName}:`, err);
                }
            }

            console.log("✅ Combined incentives for all employees:", allIncentives);
            setTotals((prev) => ({ ...prev })); // Trigger UI update
            setSnackbarMessage("Incentive data loaded for all employees");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setAllIncentives(allIncentives); // 👈 store in local state for rendering
        } else {
            // ✅ Single employee case (use Redux)
            const payload = {
                employee_id: selectedEmployee.id,
                type: type.toLowerCase(),
                period: type === "Yearly" ? new Date().getFullYear().toString() : period,
            };
            console.log("Searching single employee with:", payload);
            dispatch(getIncentives(payload.employee_id, payload.type, payload.period));
        }
    };

    useEffect(() => {
        if (!hasSearched) return; // Only run after clicking search

        if (incentives && incentives.length > 0) {
            // Determine month range for current type/period
            const getMonthRange = () => {
                if (!type || (type !== "Yearly" && !period)) return [];
                if (type === "Monthly") return [months.indexOf(period) + 1];
                if (type === "Quarterly") {
                    const q = parseInt(period.replace("Q", "")) - 1;
                    return [q * 3 + 1, q * 3 + 2, q * 3 + 3];
                }
                if (type === "Half Yearly") {
                    const h = parseInt(period.replace("H", "")) - 1;
                    return [h * 6 + 1, h * 6 + 2, h * 6 + 3, h * 6 + 4, h * 6 + 5, h * 6 + 6];
                }
                if (type === "Yearly") return [...Array(12).keys()].map((i) => i + 1);
                return [];
            };

            const monthRange = getMonthRange();

            // Filter incentives that match the selected month(s)
            const filteredIncentives = incentives.filter((item) => {
                const itemMonth = item.month ? parseInt(item.month) : item.createdAt ? new Date(item.createdAt).getMonth() + 1 : null;
                return monthRange.includes(itemMonth);
            });

            if (filteredIncentives.length === 0) {
                // Only show message after search
                setTotals({
                    targeted: 0,
                    eligible: 0,
                    achieved: 0,
                    employeeName: "Employee Name",
                });
                setSnackbarMessage("No incentive data found for this employee");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }

            // Calculate totals from filtered data
            const totalTargeted = filteredIncentives.reduce(
                (sum, item) => sum + (item.targeted_amount ?? item.assignedIncentive?.targeted_amount ?? 0),
                0,
            );
            const totalEligible = filteredIncentives.reduce(
                (sum, item) => sum + (item.eligible_amount ?? item.assignedIncentive?.eligible_amount ?? 0),
                0,
            );
            const totalAchieved = filteredIncentives.reduce((sum, item) => sum + (item.achieved_sales ?? 0), 0);
            const totalIncentive = filteredIncentives.reduce((sum, item) => sum + (item.calculated_incentive ?? 0), 0);

            const empName = filteredIncentives[0]?.employee
                ? `${filteredIncentives[0].employee.salutation || ""} ${filteredIncentives[0].employee.firstName || ""} ${filteredIncentives[0].employee.middleName || ""} ${filteredIncentives[0].employee.lastName || ""}`.trim()
                : "Employee Name";

            setTotals({
                targeted: totalTargeted,
                eligible: totalEligible,
                achieved: totalAchieved,
                totalIncentive: totalIncentive,
                employeeName: empName,
            });

            setSnackbarMessage("Incentive data loaded successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } else {
            // Only show message after search
            setTotals({
                targeted: 0,
                eligible: 0,
                achieved: 0,
                totalIncentive: 0,
                employeeName: "Employee Name",
            });
            setSnackbarMessage("No incentive data found for this employee");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    }, [incentives, hasSearched]);

    const handleReset = () => {
        setSelectedEmployee(null);
        setType("");
        setPeriod("");
        setError({});
        setTotals({
            targeted: 0,
            eligible: 0,
            achieved: 0,
            employeeName: "Employee Name",
        });
        setHasSearched(false);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const overviewData = [
        { name: "Targeted", total: totals.targeted },
        { name: "Achieved", total: totals.achieved },
    ];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        return (
            <text
                x={x}
                y={y}
                fill="black"
                textAnchor="middle"
                dominantBaseline="central"
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card p-4">
                    <div className="mb-4 text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Achieved Incentive's :</div>
                    </div>

                    {/* Selection Section */}
                    <Box className="flex flex-col gap-4 md:flex-col lg:flex-row">
                        {/* Employee */}
                        <Autocomplete
                            options={
                                employees
                                    ? [
                                          { id: "all", firstName: "All Employees" },
                                          ...employees.filter((emp) => {
                                              const roleName = roles.find((r) => r.id === emp.role_id)?.name;
                                              return roleName !== "Super Admin";
                                          }),
                                      ]
                                    : []
                            }
                            getOptionLabel={(option) => (option.id === "all" ? "All Employees" : formatEmployeeName(option))}
                            value={selectedEmployee}
                            onChange={(_, newValue) => setSelectedEmployee(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Employee"
                                    size="small"
                                    error={error.employee}
                                />
                            )}
                            sx={{ flex: 1 }}
                        />

                        {/* Type */}
                        <TextField
                            select
                            label="Select Type"
                            size="small"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                setPeriod("");
                            }}
                            error={error.type}
                            sx={{ flex: 1 }}
                        >
                            <MenuItem value="Monthly">Monthly</MenuItem>
                            <MenuItem value="Quarterly">Quarterly</MenuItem>
                            <MenuItem value="Half Yearly">Half Yearly</MenuItem>
                            <MenuItem value="Yearly">Yearly</MenuItem>
                        </TextField>

                        {/* Period */}
                        {type && type !== "Yearly" && (
                            <TextField
                                select
                                label="Select Period"
                                size="small"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                error={error.period}
                                sx={{ flex: 1 }}
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
                    </Box>

                    {/* Buttons */}
                    <Box className="flex flex-col gap-2 md:flex-row lg:flex-row">
                        <Button
                            variant="gradient"
                            className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                            onClick={handleSearch}
                            sx={{ flex: 1 }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={handleReset}
                            sx={{ flex: 1 }}
                        >
                            Reset
                        </Button>
                    </Box>

                    {/* 🔹 Show all employees incentive summary */}
                    {selectedEmployee?.id === "all" && hasSearched && (
                        <Box className="mt-6 space-y-6">
                            {employees
                                .filter((emp) => {
                                    const roleName = roles.find((r) => r.id === emp.role_id)?.name;
                                    return roleName !== "Super Admin";
                                })
                                .map((emp) => {
                                    const empIncentives = allIncentives.filter((item) => item.employee_id === emp.id);

                                    const monthsToShow =
                                        type === "Monthly"
                                            ? [months.indexOf(period) + 1]
                                            : type === "Quarterly"
                                              ? Array.from({ length: 3 }, (_, i) => (parseInt(period.replace("Q", "")) - 1) * 3 + i + 1)
                                              : type === "Half Yearly"
                                                ? Array.from({ length: 6 }, (_, i) => (parseInt(period.replace("H", "")) - 1) * 6 + i + 1)
                                                : [...Array(12).keys()].map((i) => i + 1);

                                    return (
                                        <div
                                            key={emp.id}
                                            className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg"
                                        >
                                            {/* Header */}
                                            <div className="mb-4 text-center">
                                                <h3 className="text-lg font-bold text-[#053054]">{formatEmployeeName(emp)}</h3>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Incentive Summary for{" "}
                                                    {type === "Quarterly"
                                                        ? quarters[parseInt(period.replace("Q", "")) - 1]
                                                        : type === "Monthly"
                                                          ? period
                                                          : type === "Half Yearly"
                                                            ? halfYears[parseInt(period.replace("H", "")) - 1]
                                                            : `Year ${new Date().getFullYear()}`}
                                                </p>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse overflow-hidden rounded-xl shadow">
                                                    <thead className="bg-[#053054] text-white">
                                                        <tr>
                                                            <th className="p-3 text-left text-sm font-semibold">Month</th>
                                                            <th className="p-3 text-center text-sm font-semibold">Total Incentive (₹)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white">
                                                        {monthsToShow.map((mNum) => {
                                                            const monthData = empIncentives.filter((i) => {
                                                                const im = i.month
                                                                    ? parseInt(i.month)
                                                                    : i.createdAt
                                                                      ? new Date(i.createdAt).getMonth() + 1
                                                                      : null;
                                                                return im === mNum;
                                                            });
                                                            const totalIncentive = monthData.reduce(
                                                                (sum, i) => sum + (i.calculated_incentive ?? 0),
                                                                0,
                                                            );

                                                            return (
                                                                <tr
                                                                    key={mNum}
                                                                    className="border-b border-gray-200 transition hover:bg-gray-100"
                                                                >
                                                                    <td className="p-3 font-medium text-[#053054]">
                                                                        For Month Of - 01-{String(mNum).padStart(2, "0")}-{new Date().getFullYear()}
                                                                    </td>
                                                                    <td className="p-3 text-center font-semibold text-gray-700">
                                                                        {totalIncentive > 0 ? (
                                                                            <span className="font-bold text-green-700">₹ {totalIncentive}</span>
                                                                        ) : (
                                                                            <span className="text-red-500">No Incentive Found</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                        </Box>
                    )}

                    {/* 🔹 Existing single-employee view */}
                    {selectedEmployee?.id !== "all" && hasSearched && (
                        <>
                            <Box className="mt-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    <div className="card bg-blue-200">
                                        <div className="card-header">
                                            <div className="w-fit rounded-lg bg-blue-900/15 p-2 text-blue-900 transition-colors">
                                                <Target size={26} />
                                            </div>
                                            <p className="card-title text-nowrap text-[#433C50] md:text-sm lg:text-base">Total Targeted Amount</p>
                                        </div>
                                        <div className="card-body bg-blue-900/15 transition-colors">
                                            <p className="py-5 text-center text-3xl font-bold text-[#433C50] transition-colors">
                                                ₹ {totals.targeted}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="card bg-red-200">
                                        <div className="card-header">
                                            <div className="rounded-lg bg-red-900/15 p-2 text-red-900 transition-colors">
                                                <PiTargetBold size={26} />
                                            </div>
                                            <p className="card-title text-nowrap text-[#433C50] md:text-sm lg:text-base">Total Eligible Amount</p>
                                        </div>
                                        <div className="card-body bg-red-900/15 transition-colors">
                                            <p className="py-5 text-center text-3xl font-bold text-[#433C50] transition-colors">
                                                ₹ {totals.eligible}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="card bg-green-200">
                                        <div className="card-header">
                                            <div className="rounded-lg bg-green-900/15 p-2 text-green-900 transition-colors">
                                                <Trophy size={26} />
                                            </div>
                                            <p className="card-title text-nowrap text-[#433C50] md:text-sm lg:text-base">Total Achieved Sales</p>
                                        </div>
                                        <div className="card-body bg-green-900/15 transition-colors">
                                            <p className="py-5 text-center text-3xl font-bold text-[#433C50] transition-colors">
                                                ₹ {totals.achieved}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="card bg-indigo-200">
                                        <div className="card-header">
                                            <div className="rounded-lg bg-indigo-900/15 p-2 text-indigo-900 transition-colors">
                                                <Users size={26} />
                                            </div>
                                            <p className="card-title text-[#433C50]">Employee</p>
                                        </div>
                                        <div className="card-body bg-indigo-900/15 transition-colors">
                                            <p className="py-5 text-center font-bold text-[#433C50] transition-colors md:py-7 md:text-sm lg:py-6 lg:text-lg">
                                                {totals.employeeName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Box>

                            {hasSearched && (
                                <Box className="mt-6 flex flex-col gap-6 lg:flex-row">
                                    {/* BOX 1 - Table Report */}
                                    <div className="flex-1 rounded-2xl border border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
                                        {/* Centered Heading */}
                                        <div className="mb-4 text-center">
                                            <h2 className="text-xl font-bold text-[#053054]">
                                                Target Vs Achievement For -{" "}
                                                {type === "Quarterly"
                                                    ? quarters[parseInt(period.replace("Q", "")) - 1]
                                                    : type === "Monthly"
                                                      ? period
                                                      : type === "Half Yearly"
                                                        ? halfYears[parseInt(period.replace("H", "")) - 1]
                                                        : `Year ${new Date().getFullYear()}`}
                                            </h2>
                                            <p className="mt-1 text-lg font-medium text-gray-600">
                                                Total Incentive - <span className="text-[#053054]">₹ {totals.totalIncentive || 0}</span>
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-gray-600">
                                                Employee Name - <span className="text-[#053054]">{totals.employeeName}</span>
                                            </p>
                                        </div>

                                        {/* Modern Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse overflow-hidden rounded-xl shadow">
                                                <thead className="bg-[#053054] text-white">
                                                    <tr>
                                                        <th className="p-3 text-left text-sm font-semibold">Description</th>
                                                        <th className="p-3 text-center text-sm font-semibold">Amount / Clients</th>
                                                        <th className="p-3 text-center text-sm font-semibold">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    {(() => {
                                                        const getMonthRange = () => {
                                                            if (!type || (type !== "Yearly" && !period)) return [];
                                                            if (type === "Monthly") return [months.indexOf(period)];
                                                            if (type === "Quarterly") {
                                                                const q = parseInt(period.replace("Q", "")) - 1;
                                                                return [q * 3, q * 3 + 1, q * 3 + 2];
                                                            }
                                                            if (type === "Half Yearly") {
                                                                const h = parseInt(period.replace("H", "")) - 1;
                                                                return [h * 6, h * 6 + 1, h * 6 + 2, h * 6 + 3, h * 6 + 4, h * 6 + 5];
                                                            }
                                                            if (type === "Yearly") return [...Array(12).keys()];
                                                            return [];
                                                        };

                                                        const monthRange = getMonthRange();

                                                        if (monthRange.length === 0) return null; // nothing to render

                                                        return monthRange.map((monthIdx) => {
                                                            const monthNumber = monthIdx + 1;
                                                            if (isNaN(monthNumber)) return null; // skip invalid

                                                            const monthHeader = `For Month Of - 01-${String(monthNumber).padStart(
                                                                2,
                                                                "0",
                                                            )}-${new Date().getFullYear()}`;

                                                            const monthData = incentives.filter((item) => {
                                                                const itemMonth = item.month
                                                                    ? parseInt(item.month)
                                                                    : item.createdAt
                                                                      ? new Date(item.createdAt).getMonth() + 1
                                                                      : null;
                                                                return itemMonth === monthNumber;
                                                            });

                                                            return (
                                                                <React.Fragment key={`month-${monthIdx}`}>
                                                                    {/* Month Header */}
                                                                    <tr>
                                                                        <td
                                                                            colSpan={3}
                                                                            className="bg-[#B0BAEB] p-2 font-bold text-[#053054]"
                                                                        >
                                                                            {monthHeader}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Data Rows or No Target Found */}
                                                                    {monthData.length === 0 ? (
                                                                        <tr>
                                                                            <td
                                                                                colSpan={3}
                                                                                className="p-3 text-center font-semibold text-red-600"
                                                                            >
                                                                                No Target Found
                                                                            </td>
                                                                        </tr>
                                                                    ) : (
                                                                        monthData.map((item, idx) => {
                                                                            const productName =
                                                                                item.selectedProductName ||
                                                                                item.assignedIncentive?.selectedProductName ||
                                                                                "-";
                                                                            const formulaName =
                                                                                item.assignedIncentive?.formula?.formula_type ||
                                                                                "Not Specified";
                                                                            const targeted =
                                                                                item.targeted_amount ??
                                                                                item.assignedIncentive?.targeted_amount ??
                                                                                "-";
                                                                            const eligible =
                                                                                item.eligible_amount ??
                                                                                item.assignedIncentive?.eligible_amount ??
                                                                                "-";
                                                                            const achieved = item.achieved_sales ?? "-";
                                                                            const incentiveRate = item.display_rate;
                                                                            const calculated = item.calculated_incentive ?? "-";

                                                                            return (
                                                                                <React.Fragment key={`month-${monthIdx}-item-${idx}`}>
                                                                                    <tr className="bg-[rgb(220,225,253)]">
                                                                                        <td
                                                                                            colSpan={3}
                                                                                            className="px-3 pt-3 pb-3 font-semibold text-[#053054]"
                                                                                        >
                                                                                            Product: {productName}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="bg-[rgb(220,225,253)]">
                                                                                        <td
                                                                                            colSpan={3}
                                                                                            className="px-3 pb-1 font-semibold text-[#053054]"
                                                                                        >
                                                                                            Formula Applied: {formulaName}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="bg-gray-50 transition hover:bg-gray-100">
                                                                                        <td className="p-3">Targeted Amount</td>
                                                                                        <td className="p-3 text-center">₹ {targeted}</td>
                                                                                        <td className="p-3 text-center">₹ {targeted}</td>
                                                                                    </tr>
                                                                                    <tr className="bg-gray-50 transition hover:bg-gray-100">
                                                                                        <td className="p-3">Eligible Amount</td>
                                                                                        <td className="p-3 text-center">₹ {eligible}</td>
                                                                                        <td className="p-3 text-center">₹ {eligible}</td>
                                                                                    </tr>
                                                                                    <tr className="bg-gray-50 transition hover:bg-gray-100">
                                                                                        <td className="p-3">Achieved Sales</td>
                                                                                        <td className="p-3 text-center">₹ {achieved}</td>
                                                                                        <td className="p-3 text-center">₹ {achieved}</td>
                                                                                    </tr>
                                                                                    <tr className="bg-green-100 transition">
                                                                                        <td className="p-3 font-semibold">Incentive</td>
                                                                                        <td className="p-3 text-center">{incentiveRate}</td>
                                                                                        <td className="p-3 text-center font-semibold text-green-700">
                                                                                            ₹ {calculated}
                                                                                        </td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            );
                                                                        })
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* BOX 2 - Pie Chart */}
                                    <div className="flex-1 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-lg">
                                        <div className="mb-4 text-center">
                                            <h2 className="text-xl font-bold text-emerald-800">Target vs Achievement</h2>
                                            <p className="mt-1 text-lg font-medium text-gray-600">
                                                Total Incentive - <span className="text-emerald-800">₹ {totals.totalIncentive || 0}</span>
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-gray-600">
                                                Visual Representation of <span className="text-emerald-800">{totals.employeeName}</span>
                                            </p>
                                        </div>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={320}
                                        >
                                            <PieChart>
                                                <Tooltip formatter={(value) => `₹${value}`} />
                                                <Pie
                                                    data={overviewData}
                                                    dataKey="total"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={110}
                                                    label={renderCustomLabel}
                                                    labelLine={false}
                                                >
                                                    {overviewData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={["#EBB0B0", "#B0BAEB"][index]}
                                                            stroke="#ffffff"
                                                            strokeWidth={2}
                                                        />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Legend */}
                                        <div className="mt-4 flex justify-center gap-6 text-sm text-black">
                                            <div className="flex items-center gap-2">
                                                <span className="h-3 w-3 rounded-full bg-[#EBB0B0]"></span> Targeted
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="h-3 w-3 rounded-full bg-[#B0BAEB]"></span> Achieved
                                            </div>
                                        </div>
                                    </div>
                                </Box>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Incentive;
