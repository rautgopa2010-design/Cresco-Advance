// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, UserPlus, X } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const LeadSource = () => {
//     const [open, setOpen] = useState(false);
//     const [leadSource, setLeadSource] = useState("");
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [leadList, setLeadList] = useState([]);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);

//     // Load from localStorage on first load
//     useEffect(() => {
//         const storedLeads = JSON.parse(localStorage.getItem("leadSourceList")) || [];
//         setLeadList(storedLeads);
//     }, []);

//     const modalStyle = {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: isMobile ? 330 : 500,
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         borderRadius: "12px",
//         p: 3,
//     };

//     const getCurrentISTDateTime = () => {
//         const now = new Date();
//         const options = {
//             timeZone: "Asia/Kolkata",
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false,
//         };
//         const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
//         return formatted.replace(/\//g, "-").replace(",", "");
//     };

//     const handleOpen = () => {
//         setOpen(true);
//         setError(false);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setLeadSource("");
//         setError(false);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (index) => {
//         const lead = leadList[index];
//         setLeadSource(lead.name);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleUpdate = () => {
//         if (!leadSource.trim()) {
//             setError(true);
//             setSnackbarMessage("Lead Source is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedLeads = [...leadList];
//         updatedLeads[editIndex] = {
//             ...updatedLeads[editIndex],
//             name: leadSource.trim(),
//             date: getCurrentISTDateTime(), // optionally update timestamp
//         };

//         setLeadList(updatedLeads);
//         localStorage.setItem("leadSourceList", JSON.stringify(updatedLeads));

//         setSnackbarMessage("Lead Source Updated Successfully");
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleDelete = (index) => {
//         const updatedLeads = leadList.filter((_, i) => i !== index);
//         setLeadList(updatedLeads);
//         localStorage.setItem("leadSourceList", JSON.stringify(updatedLeads));
//     };

//     const handleAdd = () => {
//         if (!leadSource.trim()) {
//             setError(true);
//             setSnackbarMessage("Lead Source is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newLead = {
//             id: leadList.length + 1,
//             name: leadSource.trim(),
//             date: getCurrentISTDateTime(),
//         };

//         const updatedLeads = [...leadList, newLead];
//         setLeadList(updatedLeads);
//         localStorage.setItem("leadSourceList", JSON.stringify(updatedLeads));

//         setSnackbarMessage("Lead Source Created Successfully");
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Lead Source :</div>
//                     <Button
//                         variant="gradient"
//                         className="flex items-center gap-2 text-sm rounded-full bg-[#053054] px-3 py-2 capitalize md:text-base lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <UserPlus size={20} />
//                         Create Lead Source
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Lead Source No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Lead Source Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Lead Source</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {leadList.map((lead, index) => (
//                                     <tr
//                                         className="table-row"
//                                         key={index}
//                                     >
//                                         <td className="table-cell border border-gray-300">{index + 1}</td>
//                                         <td className="table-cell border border-gray-300">{index + 1}</td>
//                                         <td className="table-cell border border-gray-300">{lead.name}</td>
//                                         <td className="table-cell border border-gray-300">{lead.date}</td>
//                                         <td className="table-cell border border-gray-300">
//                                             <div className="flex items-center gap-x-4">
//                                                 <button
//                                                     className="text-blue-500"
//                                                     onClick={() => handleEdit(index)}
//                                                 >
//                                                     <PencilLine size={20} />
//                                                 </button>
//                                                 <button
//                                                     className="text-red-500"
//                                                     onClick={() => handleDelete(index)}
//                                                 >
//                                                     <Trash size={20} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                                 {leadList.length === 0 && (
//                                     <tr>
//                                         <td
//                                             colSpan="5"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Lead Source Added Yet.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

//             {/* Modal */}
//             <Modal
//                 open={open}
//                 onClose={handleClose}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             {isEditMode ? "Update Lead Source" : "Add Lead Source"}

//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <TextField
//                         fullWidth
//                         label="Lead Source"
//                         placeholder="Enter Lead Source"
//                         variant="outlined"
//                         error={error}
//                         value={leadSource}
//                         onChange={(e) => {
//                             setLeadSource(e.target.value);
//                             setError(false);
//                         }}
//                     />

//                     <div className="mt-4 flex justify-end gap-2">
//                         <Button
//                             variant="outlined"
//                             className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
//                             onClick={handleClose}
//                         >
//                             Close
//                         </Button>
//                         {isEditMode ? (
//                             <Button
//                                 className="rounded bg-green-900 px-4 py-2 capitalize text-white"
//                                 onClick={handleUpdate}
//                             >
//                                 Update
//                             </Button>
//                         ) : (
//                             <Button
//                                 className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
//                                 onClick={handleAdd}
//                             >
//                                 Add
//                             </Button>
//                         )}
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={error ? "error" : "success"}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default LeadSource;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, UserPlus, X } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import { getLeadSource, createLeadSource, updateLeadSource, deleteLeadSource } from "../../redux/actions/leadSource";
import { clearSnackbar } from "../../redux/actions/commonActions";

const LeadSource = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [leadSource, setLeadSource] = useState("");
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.leadSource.loading);

    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.leadSource);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const leadSourceList = useSelector((state) => state.leadSource.leadSource);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getLeadSource());
    }, [dispatch]);

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 330 : 500,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
    };

    const getCurrentISTDateTime = () => {
        const now = new Date();
        const options = {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        };
        const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
        return formatted.replace(/\//g, "-").replace(",", "");
    };

    const handleOpen = () => {
        setOpen(true);
        setError(false);
    };

    const handleClose = () => {
        setOpen(false);
        setLeadSource("");
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (leadSource) => {
        setLeadSource(leadSource.leadSource);
        setEditId(leadSource.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleUpdate = async () => {
        if (!leadSource.trim()) {
            setError(true);
            setLocalSnackbarMessage("Lead Source is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            updateLeadSource(editId, {
                leadSource: leadSource.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleAdd = async () => {
        if (!leadSource.trim()) {
            setError(true);
            setLocalSnackbarMessage("Lead Source is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
       dispatch(
            createLeadSource({
                leadSource: leadSource.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        dispatch(deleteLeadSource(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    useEffect(() => {
        if (snackbarMessage) {
            setLocalSnackbarMessage("");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Lead Source :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create Lead Source
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Lead Source</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {leadSourceList.map((leadSource, index) => (
                                        <tr
                                            className="table-row"
                                            key={index}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{leadSource.leadSource}</td>
                                            <td className="table-cell border border-gray-300">{leadSource.date}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(leadSource)}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => handleDeleteClick(leadSource.id)}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leadSourceList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Lead Source Added Yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal */}
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            {isEditMode ? "Update Lead Source" : "Add Lead Source"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <TextField
                        fullWidth
                        label="Lead Source"
                        placeholder="Enter Lead Source"
                        variant="outlined"
                        error={error}
                        value={leadSource}
                        onChange={(e) => {
                            setLeadSource(e.target.value);
                            setError(false);
                        }}
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outlined"
                            className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        {isEditMode ? (
                            <Button
                                className="rounded bg-green-900 px-4 py-2 capitalize text-white"
                                onClick={handleUpdate}
                            >
                                Update
                            </Button>
                        ) : (
                            <Button
                                className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                                onClick={handleAdd}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                </Box>
            </Modal>

            {/* Delete Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Confirm Delete
                        </Typography>
                        <IconButton
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this lead source?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={confirmDelete}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={1000}
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
        </>
    );
};

export default LeadSource;
