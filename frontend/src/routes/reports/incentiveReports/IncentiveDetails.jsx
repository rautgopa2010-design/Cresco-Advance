import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { TextField, Autocomplete, MenuItem, Box } from "@mui/material";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { getRoles } from "../../../redux/actions/rbac";
import { getEmployees } from "../../../redux/actions/employee";
import api from "../../../utils/api";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const quarters = ["First Quarter (Jan-Mar)", "Second Quarter (Apr-Jun)", "Third Quarter (Jul-Sep)", "Fourth Quarter (Oct-Dec)"];
const halfYears = ["First Half (Jan-Jun)", "Second Half (Jul-Dec)"];

const IncentiveDetails = forwardRef(({}, ref) => {
    const dispatch = useDispatch();
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [type, setType] = useState("");
    const [period, setPeriod] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getRoles());
        dispatch(getEmployees());
    }, [dispatch]);

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    const employeeOptions = employees
        ? [
              { id: "all", firstName: "All Employees" },
              ...employees.filter((emp) => {
                  const roleName = roles.find((r) => r.id === emp.role_id)?.name;
                  return roleName !== "Super Admin";
              }),
          ]
        : [];

    const handleSearch = async () => {
        setLoading(true);
        let result = [];

        if (selectedEmployee.id === "all") {
            const filteredEmps = employees.filter((emp) => {
                const roleName = roles.find((r) => r.id === emp.role_id)?.name;
                return roleName !== "Super Admin";
            });

            for (const emp of filteredEmps) {
                const params = new URLSearchParams();
                params.append("employee_id", emp.id);
                params.append("type", type.toLowerCase());
                params.append("period", type === "Yearly" ? new Date().getFullYear().toString() : period);

                try {
                    const res = await api.get(`/incentives?${params.toString()}`);
                    if (res.data && Array.isArray(res.data)) {
                        result = [...result, ...res.data.map((item) => ({ ...item, employee: emp }))];
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        } else {
            const params = new URLSearchParams();
            params.append("employee_id", selectedEmployee.id);
            params.append("type", type.toLowerCase());
            params.append("period", type === "Yearly" ? new Date().getFullYear().toString() : period);

            try {
                const res = await api.get(`/incentives?${params.toString()}`);
                if (res.data && Array.isArray(res.data)) {
                    result = res.data.map((item) => ({ ...item, employee: selectedEmployee }));
                }
            } catch (err) {
                console.error(err);
            }
        }

        setFilteredData(result);
        setLoading(false);
    };

    const handleReset = () => {
        setSelectedEmployee(null);
        setType("");
        setPeriod("");
        setFilteredData([]);
    };

    useImperativeHandle(ref, () => ({
        getFilteredData: () => filteredData,
    }));

    const getMonthRange = () => {
        if (!type || (type !== "Yearly" && !period)) return [];
        if (type === "Monthly") return [months.indexOf(period) + 1];
        if (type === "Quarterly") {
            const q = parseInt(period.replace("Q", "")) - 1;
            return [q * 3 + 1, q * 3 + 2, q * 3 + 3];
        }
        if (type === "Half Yearly") {
            const h = parseInt(period.replace("H", "")) - 1;
            return Array.from({ length: 6 }, (_, i) => h * 6 + i + 1);
        }
        return [...Array(12).keys()].map((i) => i + 1);
    };

    const monthRange = getMonthRange();

    return (
        <div className="space-y-6 p-4">
            {/* Filters */}
            <div className="rounded-xl border bg-white p-4 shadow md:w-max">
                <h2 className="mb-3 text-lg font-semibold text-[#053054]">🔎 Filters</h2>
                <Box className="flex flex-col flex-wrap gap-3 md:flex-row">
                    <Autocomplete
                        options={employeeOptions}
                        getOptionLabel={(option) => (option.id === "all" ? "All Employees" : formatEmployeeName(option))}
                        value={selectedEmployee}
                        onChange={(_, v) => setSelectedEmployee(v)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Employee"
                                size="small"
                            />
                        )}
                        className="md:w-80"
                    />
                    <TextField
                        select
                        label="Select Type"
                        size="small"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setPeriod("");
                        }}
                        className="md:w-48"
                    >
                        <MenuItem value="Monthly">Monthly</MenuItem>
                        <MenuItem value="Quarterly">Quarterly</MenuItem>
                        <MenuItem value="Half Yearly">Half Yearly</MenuItem>
                        <MenuItem value="Yearly">Yearly</MenuItem>
                    </TextField>
                    {type && type !== "Yearly" && (
                        <TextField
                            select
                            label="Select Period"
                            size="small"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="md:w-64"
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

            {/* Table */}
            {loading ? (
                <div className="py-10 text-center">Loading...</div>
            ) : filteredData.length === 0 ? (
                <div className="py-10 text-center text-gray-500">No data found. Please apply filters and search.</div>
            ) : (
                <div className="w-max rounded-xl border bg-white p-4 shadow">
                    <table
                        id="incentiveTable"
                        className="w-full border-collapse text-xs sm:text-sm lg:text-base"
                    >
                        <thead className="bg-[#053054] text-white">
                            <tr>
                                <th className="p-3 text-left">Employee</th>
                                <th className="p-3 text-left">Month</th>
                                <th className="p-3 text-left">Product</th>
                                <th className="p-3 text-center">Targeted (₹)</th>
                                <th className="p-3 text-center">Eligible (₹)</th>
                                <th className="p-3 text-center">Achieved (₹)</th>
                                <th className="p-3 text-center">Formula</th>
                                <th className="p-3 text-center">Incentive (%)</th>
                                <th className="p-3 text-center">Incentive (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData
                                .filter((item) => {
                                    const itemMonth = item.month ? parseInt(item.month) : new Date(item.createdAt).getMonth() + 1;
                                    return monthRange.includes(itemMonth);
                                })
                                .map((item, idx) => {
                                    const emp = item.employee;
                                    const empName = emp ? formatEmployeeName(emp) : "Unknown";
                                    const monthNum = item.month ? parseInt(item.month) : new Date(item.createdAt).getMonth() + 1;
                                    const monthName = months[monthNum - 1];
                                    const product = item.selectedProductName || item.assignedIncentive?.selectedProductName || "-";
                                    return (
                                        <tr
                                            key={idx}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap border px-4 py-2">{empName}</td>
                                            <td className="whitespace-nowrap border px-4 py-2">{monthName}</td>
                                            <td className="whitespace-nowrap border px-4 py-2">{product}</td>
                                            <td className="whitespace-nowrap border px-4 py-2">
                                                ₹{item.targeted_amount ?? item.assignedIncentive?.targeted_amount ?? 0}
                                            </td>
                                            <td className="whitespace-nowrap border px-4 py-2">
                                                ₹{item.eligible_amount ?? item.assignedIncentive?.eligible_amount ?? 0}
                                            </td>
                                            <td className="whitespace-nowrap border px-4 py-2">₹{item.achieved_sales ?? 0}</td>
                                            <td className="whitespace-nowrap border px-4 py-2">{item.assignedIncentive?.formula?.formula_type}</td>
                                            <td className="whitespace-nowrap border px-4 py-2 text-center font-semibold text-orange-700">
                                                {item.display_rate}
                                            </td>
                                            <td className="whitespace-nowrap border px-4 py-2 text-center font-semibold text-green-700">
                                                ₹{item.calculated_incentive ?? 0}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

export default IncentiveDetails;
