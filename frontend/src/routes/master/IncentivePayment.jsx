import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmployees } from "../../redux/actions/employee";
import { getIncentives, payIncentive } from "../../redux/actions/incentive";
import {
    Box,
    CircularProgress,
    Autocomplete,
    TextField,
    MenuItem,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Slider,
    Snackbar,
    Alert,
} from "@mui/material";
import { Trophy, IndianRupee, Calendar } from "lucide-react";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { Button } from "@material-tailwind/react";

const OrDivider = () => (
    <div className="my-8 flex items-center">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-sm font-medium uppercase tracking-wider text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300" />
    </div>
);

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const IncentivePayment = () => {
    const dispatch = useDispatch();
    const { employees = [], loading: empLoading } = useSelector((state) => state.employee);
    const { incentives = [], loading: incLoading } = useSelector((state) => state.incentive);
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.incentive);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [filteredIncentives, setFilteredIncentives] = useState([]);
    const [selectedIncentive, setSelectedIncentive] = useState(null);
    const [payPercentage, setPayPercentage] = useState(100);
    const [customAmount, setCustomAmount] = useState("");
    const [paying, setPaying] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getEmployees());
        dispatch(getIncentives());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    // Get months for selected employee
    const getEmployeeMonths = () => {
        if (!selectedEmployee) return [];
        const empIncs = incentives.filter((i) => i.employee_id === selectedEmployee.id);
        return [...new Set(empIncs.map((i) => i.assignedIncentive?.month || months[new Date(i.createdAt).getMonth()]))];
    };

    // Filter when employee/month changes
    useEffect(() => {
        if (selectedEmployee && selectedMonth) {
            const matched = incentives.filter(
                (i) =>
                    i.employee_id === selectedEmployee.id &&
                    (i.assignedIncentive?.month === selectedMonth || months[new Date(i.createdAt).getMonth()] === selectedMonth),
            );
            setFilteredIncentives(matched);
        } else {
            setFilteredIncentives([]);
        }
        setSelectedIncentive(null);
        setPayPercentage(100);
        setCustomAmount("");
    }, [selectedEmployee, selectedMonth, incentives]);

    const handlePay = async () => {
        if (!selectedIncentive) return;

        const total = selectedIncentive.calculated_incentive || 0;
        const alreadyPaid = selectedIncentive.paid_amount || 0;
        const remaining = total - alreadyPaid;

        let payAmount = 0;

        // Determine pay amount: custom takes priority
        if (customAmount && customAmount.trim() !== "") {
            payAmount = parseFloat(customAmount);
            if (isNaN(payAmount) || payAmount <= 0) {
                setLocalSnackbarMessage("Please enter a valid positive amount");
                setLocalSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
        } else {
            // Use percentage of remaining
            payAmount = (payPercentage / 100) * remaining;
            if (payAmount <= 0) {
                setLocalSnackbarMessage("No remaining amount to pay");
                setLocalSnackbarSeverity("warning");
                setSnackbarOpen(true);
                return;
            }
        }

        // Critical validation: cannot pay more than remaining
        if (payAmount > remaining) {
            setLocalSnackbarMessage("Amount exceeds remaining incentive");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // Clear any previous local message before API call
        setLocalSnackbarMessage("");
        setPaying(true);

        try {
            await dispatch(payIncentive(selectedIncentive.id, payAmount.toFixed(2)));

            // On success: Redux will set snackbarMessage (e.g. "Payment recorded successfully")
            // We don't need to do anything here — it will show automatically via useEffect

            // Reset form controls
            setPayPercentage(100);
            setCustomAmount("");
        } catch (err) {
            // If API fails, Redux action already dispatches INCENTIVE_ERROR with message
            // It will appear via snackbarMessage
        } finally {
            setPaying(false);
        }
    };

    const formatName = (emp) => [emp.salutation, emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ");

    const getStatusColor = (status) => {
        if (status === "paid") return "text-green-600 bg-green-100";
        if (status === "partially-paid") return "text-orange-600 bg-orange-100";
        return "text-gray-600 bg-gray-100";
    };

    const getStatusText = (status) => (status === "partially-paid" ? "Partially Paid" : status === "paid" ? "Paid" : "Pending");

    if (empLoading || incLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="space-y-8 md:p-6">
            <Typography
                variant="h5"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                sx={{ fontWeight: "bold" }}
            >
                Incentive Payment Dashboard
            </Typography>

            {/* Selection */}
            <Card className="shadow-xl">
                <CardContent className="p-8">
                    <Box className="grid gap-6 lg:grid-cols-2">
                        <Autocomplete
                            options={employees.filter((e) => incentives.some((i) => i.employee_id === e.id && i.calculated_incentive > 0))}
                            getOptionLabel={formatName}
                            value={selectedEmployee}
                            onChange={(_, v) => {
                                setSelectedEmployee(v);
                                setSelectedMonth("");
                            }}
                            renderInput={(p) => (
                                <TextField
                                    {...p}
                                    label="Select Employee"
                                />
                            )}
                            size="small"
                        />
                        <TextField
                            select
                            label="Select Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            disabled={!selectedEmployee}
                            fullWidth
                            size="small"
                        >
                            {getEmployeeMonths().map((m) => (
                                <MenuItem
                                    key={m}
                                    value={m}
                                >
                                    {m}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </CardContent>
            </Card>

            {/* Incentive Cards */}
            {filteredIncentives.length > 0 && (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    {filteredIncentives.map((inc) => {
                        const total = inc.calculated_incentive || 0;
                        const paid = inc.paid_amount || 0;
                        const remaining = total - paid;
                        const progress = total ? (paid / total) * 100 : 0;

                        return (
                            <Card
                                key={inc.id}
                                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${selectedIncentive?.id === inc.id ? "ring-4 ring-purple-500" : ""}`}
                                onClick={() => {
                                    setSelectedIncentive(inc);
                                    setPayPercentage(100);
                                    setCustomAmount("");
                                }}
                            >
                                <CardContent className="space-y-4 p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-purple-100 p-3">
                                            <Trophy
                                                className="text-purple-600"
                                                size={28}
                                            />
                                        </div>
                                        <div>
                                            <Typography
                                                variant="h6"
                                                className="font-bold"
                                            >
                                                {inc.assignedIncentive?.selectedProductName || "General Incentive"}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                className="text-gray-600"
                                            >
                                                {inc.assignedIncentive?.month || months[new Date(inc.createdAt).getMonth()]}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Incentive</span>
                                            <span className="font-bold">₹{total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Paid Amount</span>
                                            <span className="font-semibold text-green-600">₹{paid.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Remaining</span>
                                            <span className="font-bold text-orange-600">₹{remaining.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        className="h-4 rounded-full"
                                    />

                                    <div className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${getStatusColor(inc.status)}`}>
                                        {getStatusText(inc.status)}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Payment Panel */}
            {selectedIncentive && (
                <Card className="shadow-2xl">
                    <CardContent className="space-y-8 p-8">
                        <Typography
                            variant="h6"
                            className="font-bold text-purple-700"
                        >
                            Process Payment for {formatName(selectedEmployee)}
                        </Typography>

                        <div className="grid gap-8 px-3 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <IndianRupee
                                        className="text-green-600"
                                        size={32}
                                    />
                                    <div>
                                        <p className="text-gray-600">Total Earned Incentive</p>
                                        <p className="text-3xl font-bold">₹{selectedIncentive.calculated_incentive.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Calendar
                                        className="text-blue-600"
                                        size={32}
                                    />
                                    <div>
                                        <p className="text-gray-600">Already Paid</p>
                                        <p className="text-2xl font-semibold text-green-600">₹{(selectedIncentive.paid_amount || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Typography
                                        gutterBottom
                                        className="font-medium"
                                    >
                                        Pay {payPercentage}% of Remaining
                                    </Typography>
                                    <Slider
                                        value={payPercentage}
                                        onChange={(_, v) => {
                                            setPayPercentage(v);
                                            setCustomAmount("");
                                        }}
                                        marks={[25, 50, 75, 100].map((v) => ({ value: v, label: `${v}%` }))}
                                        step={10}
                                        valueLabelDisplay="auto"
                                    />
                                </div>

                                <OrDivider />

                                <TextField
                                    fullWidth
                                    label="Enter Custom Amount (₹)"
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => {
                                        setCustomAmount(e.target.value);
                                        setPayPercentage(0);
                                    }}
                                    onWheel={(e) => e.target.blur()}
                                    size="small"
                                    placeholder={`Max: ₹${(selectedIncentive.calculated_incentive - (selectedIncentive.paid_amount || 0)).toFixed(2)}`}
                                />

                                <Button
                                    variant="gra"
                                    size="small"
                                    fullWidth
                                    disabled={paying}
                                    onClick={handlePay}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-lg capitalize text-white shadow-lg hover:shadow-xl"
                                >
                                    {paying ? (
                                        <CircularProgress
                                            size={28}
                                            color="inherit"
                                        />
                                    ) : (
                                        "Confirm & Pay Incentive"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default IncentivePayment;
