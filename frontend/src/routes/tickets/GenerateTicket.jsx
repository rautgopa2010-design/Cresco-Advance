// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { Button } from "@material-tailwind/react";
// import { Alert, Box, MenuItem, Snackbar, TextField } from "@mui/material";
// import { IoTicket } from "react-icons/io5";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// const GenerateTicket = () => {
//     const navigate = useNavigate();

//     // ✅ Get user from redux store
//     const user = useSelector((state) => state.auth.user);
//     const isSuperAdmin = user?.role_name === "Super Admin";

//     // Helper function to format date
//     const formatDate = (dateObj) => {
//         const dd = String(dateObj.getDate()).padStart(2, "0");
//         const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
//         const yyyy = dateObj.getFullYear();
//         return { forInput: `${yyyy}-${mm}-${dd}`, forSubmit: `${dd}-${mm}-${yyyy}` };
//     };

//     // Default today date
//     const today = formatDate(new Date());

//     const [form, setForm] = useState({
//         date: today.forInput,
//         service: "",
//         ticketName: "",
//         priority: "",
//         ticketDeadline: today.forInput,
//         description: "",
//     });

//     const [errors, setErrors] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     // Handle change for all fields
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm((prev) => ({ ...prev, [name]: value }));
//     };

//     // Submit handler
//     const handleSubmit = () => {
//         const newErrors = {};
//         if (!form.ticketName) newErrors.ticketName = true;
//         if (!form.service) newErrors.service = true;
//         if (!form.priority) newErrors.priority = true;
//         if (!form.description) newErrors.description = true;

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             setSnackbarMessage("Please fill all required fields!");
//             setSnackbarOpen(true);
//             return;
//         }

//         // Convert dates for submission
//         const formattedDate = formatDate(new Date(form.date)).forSubmit;
//         const formattedDeadline = formatDate(new Date(form.ticketDeadline)).forSubmit;

//         // 🟢 Strip HTML tags from description
//         const plainDescription = form.description.replace(/<[^>]+>/g, "").trim();

//         // ✅ Build ticket object
//         const submissionData = {
//             createdDate: formattedDate,
//             dueDate: formattedDeadline,
//             delay: 0, // default delay
//             title: form.ticketName,
//             assignedTo: user?.sa_role_name || "Super Admin",
//             assignedToId: user?.sa_role_id || null,
//             priority: form.priority,
//             status: "Pending", // ✅ Default status
//             description: plainDescription,
//         };

//         console.log("Ticket Submitted:", submissionData);

//         // ✅ Store in localStorage
//         const existingTickets = JSON.parse(localStorage.getItem("ticketList")) || [];
//         existingTickets.push(submissionData);
//         localStorage.setItem("ticketList", JSON.stringify(existingTickets));

//         // ✅ Show success
//         setSnackbarMessage("Ticket generated successfully!");
//         setSnackbarOpen(true);
//         setErrors({});

//         // ✅ Reset form to default values
//         setForm({
//             date: today.forInput,
//             service: "",
//             ticketName: "",
//             priority: "",
//             ticketDeadline: today.forInput,
//             description: "",
//         });

//         // ✅ Navigate after 1000ms
//         setTimeout(() => {
//             navigate("/tickets");
//         }, 1000);
//     };

//     return (
//         <>
//             <div className="card space-y-4">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg">Create New Ticket :</div>
//                     <Button
//                         onClick={() => navigate(-1)}
//                         variant="gradient"
//                         className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                     >
//                         Back
//                     </Button>
//                 </div>

//                 <div className="space-y-4">
//                     <p className="font-semibold text-[#433C50]">Ticket Details</p>

//                     <div>
//                         {/* Date Field */}
//                         <TextField
//                             type="date"
//                             size="small"
//                             label="Date"
//                             name="date"
//                             value={form.date}
//                             onChange={handleChange}
//                         />
//                     </div>

//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             select
//                             label="Select Service *"
//                             name="service"
//                             value={form.service}
//                             onChange={handleChange}
//                             error={errors.service}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 2 }}
//                         >
//                             <MenuItem value="installation">Installation</MenuItem>
//                             <MenuItem value="maintenance">Maintenance</MenuItem>
//                         </TextField>
//                         <TextField
//                             label="Ticket Name *"
//                             name="ticketName"
//                             value={form.ticketName}
//                             onChange={handleChange}
//                             error={errors.ticketName}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 2 }}
//                         />
//                     </Box>

//                     <Box className="flex w-full flex-col gap-4 lg:flex-row">
//                         <TextField
//                             select
//                             label="Select Priority *"
//                             name="priority"
//                             value={form.priority}
//                             onChange={handleChange}
//                             error={errors.priority}
//                             fullWidth
//                             size="small"
//                             sx={{ flex: 2 }}
//                         >
//                             <MenuItem value="low">Low</MenuItem>
//                             <MenuItem value="medium">Medium</MenuItem>
//                             <MenuItem value="high">High</MenuItem>
//                         </TextField>
//                         <TextField
//                             type="date"
//                             size="small"
//                             label="Ticket Deadline"
//                             name="ticketDeadline"
//                             value={form.ticketDeadline}
//                             onChange={handleChange}
//                             sx={{ flex: 2 }}
//                         />
//                     </Box>

//                     <Box>
//                         <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
//                         <ReactQuill
//                             theme="snow"
//                             value={form.description}
//                             onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
//                             className={`rounded-md border ${errors.description ? "border-red-500" : "border-gray-200"}`}
//                             modules={{
//                                 toolbar: [
//                                     [{ header: [1, 2, false] }],
//                                     ["bold", "italic", "underline", "strike"],
//                                     [{ list: "ordered" }, { list: "bullet" }],
//                                     ["link"],
//                                     ["clean"],
//                                 ],
//                             }}
//                         />
//                     </Box>

//                     <div className="flex justify-end">
//                         <Button
//                             onClick={handleSubmit}
//                             variant="gradient"
//                             className="flex items-center gap-2 rounded bg-[#053054] px-2 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                         >
//                             <IoTicket size={20} />
//                             Generate Ticket
//                         </Button>
//                     </div>
//                 </div>
//             </div>

//             {/* Snackbar for success/error */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     onClose={handleSnackbarClose}
//                     severity={snackbarMessage.includes("successfully") ? "success" : "error"}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default GenerateTicket;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTicketService } from "../../redux/actions/ticketService";
import { getTicketPriority } from "../../redux/actions/ticketPriority";
import { getEmployees } from "../../redux/actions/employee";
import { getRoles } from "../../redux/actions/rbac";
import { getOrders } from "../../redux/actions/order";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { Button } from "@material-tailwind/react";
import { Alert, Autocomplete, Box, Chip, CircularProgress, Snackbar, TextField } from "@mui/material";
import { IoTicket } from "react-icons/io5";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createTicket } from "../../redux/actions/ticket";

const GenerateTicket = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Helper function to format date
    const formatDate = (dateObj) => {
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = dateObj.getFullYear();
        return { forInput: `${yyyy}-${mm}-${dd}`, forSubmit: `${dd}-${mm}-${yyyy}` };
    };
    // Default today date
    const today = formatDate(new Date());
    const [form, setForm] = useState({
        date: today.forInput,
        assignedTo: user?.id ? [user] : [],
        service: "",
        ticketName: "",
        priority: "",
        ticketDeadline: today.forInput,
        description: "",
        orderId: null,
    });
    const { ticketService } = useSelector((state) => state.ticketService);
    const { ticketPriority } = useSelector((state) => state.ticketPriority);
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);
    const { orders = [] } = useSelector((state) => state.order);
    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.ticket);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(getTicketService()),
                    dispatch(getTicketPriority()),
                    dispatch(getEmployees()),
                    dispatch(getRoles()),
                    dispatch(getOrders()),
                ]);
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    // useEffect(() => {
    //     if (snackbarMessage) {
    //         setSnackbarOpen(true);
    //     }
    // }, [snackbarMessage]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);

            // If it's a success message, trigger the button blur + loader
            if (snackbarSeverity === "success") {
                setIsSubmittingSuccessfully(true);
            }
        } else {
            // When snackbar is cleared (after navigation), reset the state
            setIsSubmittingSuccessfully(false);
        }
    }, [snackbarMessage, snackbarSeverity]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    // Handle change for all fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Submit handler
    const handleSubmit = () => {
        const newErrors = {};
        if (!form.assignedTo || form.assignedTo.length === 0) newErrors.assignedTo = true;
        if (!form.ticketName) newErrors.ticketName = true;
        if (!form.service) newErrors.service = true;
        if (!form.priority) newErrors.priority = true;
        if (!form.description) newErrors.description = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLocalSnackbarMessage("Please fill all required fields");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // Convert dates for submission
        const formattedDate = formatDate(new Date(form.date)).forSubmit;
        const formattedDeadline = formatDate(new Date(form.ticketDeadline)).forSubmit;

        // Strip HTML tags from description
        const plainDescription = form.description.replace(/<[^>]+>/g, "").trim();

        // Build ticket object (⚡ removed status since backend defaults to Pending)
        const submissionData = {
            createdDate: formattedDate,
            dueDate: formattedDeadline,
            title: form.ticketName,
            assignedTo: form.assignedTo.map((emp) => emp.id),
            service: form.service,
            priority: form.priority,
            description: plainDescription,
            orderId: form.orderId,
        };

        console.log("Ticket Submitted:", submissionData);

        // 🚀 Dispatch Redux action instead of localStorage
        dispatch(createTicket(submissionData));

        setErrors({});

        // Reset form to default values
        setForm({
            date: today.forInput,
            assignedTo: [],
            service: "",
            ticketName: "",
            priority: "",
            ticketDeadline: today.forInput,
            description: "",
        });

        // Navigate after 1000ms
        setTimeout(() => {
            navigate("/tickets");
        }, 1000);
    };

    return (
        <>
            {initialLoad ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-4">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg">Create New Ticket :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <p className="font-semibold text-[#433C50]">Ticket Details</p>
                        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                            <div>
                                {/* Date Field */}
                                <TextField
                                    type="date"
                                    size="small"
                                    label="Date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                />
                            </div>

                            <Box className="flex w-full flex-col gap-4 md:w-full lg:w-[27.5%] lg:flex-row">
                                {/* <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    options={employees}
                                    getOptionLabel={(option) => formatEmployeeName(option)}
                                    value={form.assignedTo}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            assignedTo: newValue,
                                        }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            assignedTo: false,
                                        }));
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const label = formatEmployeeName(option);
                                            const { key, ...tagProps } = getTagProps({ index });

                                            return (
                                                <Chip
                                                    key={key}
                                                    variant="outlined"
                                                    label={label}
                                                    {...tagProps}
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Assigned To *"
                                            error={errors.assignedTo}
                                            size="small"
                                        />
                                    )}
                                    className="w-full"
                                /> */}
                                <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    options={employees.filter((emp) => !form.assignedTo.some((selected) => selected.id === emp.id))}
                                    getOptionLabel={(option) => formatEmployeeName(option)}
                                    value={form.assignedTo}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            assignedTo: newValue || [], // newValue can be null sometimes
                                        }));
                                        setErrors((prev) => ({
                                            ...prev,
                                            assignedTo: false,
                                        }));
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => {
                                            const label = formatEmployeeName(option);
                                            const { key, ...tagProps } = getTagProps({ index });
                                            return (
                                                <Chip
                                                    key={key}
                                                    variant="outlined"
                                                    label={label}
                                                    {...tagProps}
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Assigned To *"
                                            error={!!errors.assignedTo}
                                            size="small"
                                        />
                                    )}
                                    className="w-full md:w-64 lg:w-96"
                                    loading={loading} // optional: if employees are loading
                                    LoadingIndicator={
                                        <CircularProgress
                                            color="inherit"
                                            size={20}
                                        />
                                    }
                                />
                            </Box>
                        </div>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <Autocomplete
                                options={ticketService.map((s) => s.ticketService)}
                                value={form.service}
                                onChange={(e, newValue) => setForm((prev) => ({ ...prev, service: newValue || "" }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Service *"
                                        size="small"
                                        error={errors.service}
                                        helperTextField
                                    />
                                )}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Ticket Name *"
                                name="ticketName"
                                value={form.ticketName}
                                onChange={handleChange}
                                error={errors.ticketName}
                                fullWidth
                                size="small"
                                sx={{ flex: 2 }}
                            />
                        </Box>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <Autocomplete
                                options={ticketPriority.map((p) => p.ticketPriority)}
                                value={form.priority}
                                onChange={(e, newValue) => setForm((prev) => ({ ...prev, priority: newValue || "" }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Priority *"
                                        size="small"
                                        error={errors.priority}
                                    />
                                )}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                type="date"
                                size="small"
                                label="Ticket Deadline"
                                name="ticketDeadline"
                                value={form.ticketDeadline}
                                onChange={handleChange}
                                sx={{ flex: 1 }}
                            />
                            <Autocomplete
                                options={orders}
                                getOptionLabel={(option) => `Order Id ${option.id} - ${option.selectedCompany || "Unknown Company"} (${option.date})`}
                                value={orders.find((o) => o.id === form.orderId) || null}
                                onChange={(e, newValue) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        orderId: newValue ? newValue.id : null,
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Link to Order (Optional)"
                                        size="small"
                                        placeholder="Search by Order ID or Company"
                                    />
                                )}
                                sx={{ flex: 1 }}
                            />
                        </Box>

                        <Box>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
                            <ReactQuill
                                theme="snow"
                                value={form.description}
                                onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                                className={`rounded-md border ${errors.description ? "border-red-500" : "border-gray-200"}`}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ["bold", "italic", "underline", "strike"],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ["link"],
                                        ["clean"],
                                    ],
                                }}
                            />
                        </Box>

                        <div className="flex justify-end">
                            {/* <Button
                                onClick={handleSubmit}
                                variant="gradient"
                                className="flex items-center gap-2 rounded bg-[#053054] px-2 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                            >
                                <IoTicket size={20} />
                                Generate Ticket
                            </Button> */}
                                                    <Button
                                onClick={handleSubmit}
                                variant="gradient"
                                disabled={isSubmittingSuccessfully || loading} // optional: also disable if globally loading
                                className={`flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base
                                    ${isSubmittingSuccessfully ? 'bg-[#053054]/70 opacity-70 cursor-not-allowed' : 'bg-[#053054] hover:bg-[#053054]/90'} transition-all`}
                            >
                                {isSubmittingSuccessfully ? (
                                    <>
                                        <CircularProgress size={18} thickness={5} className="text-white" />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <IoTicket size={20} />
                                        Generate Ticket
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default GenerateTicket;