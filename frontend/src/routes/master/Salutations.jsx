// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, UserPlus, X } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert } from "@mui/material";
// import { purple, red } from "@mui/material/colors";
// import { useMediaQuery, CircularProgress } from "@mui/material";
// import config from "../../config.json";

// const Salutations = () => {
//     const [open, setOpen] = useState(false);
//     const [salutations, setSalutations] = useState("");
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [salutationsList, setSalutationsList] = useState([]);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editId, setEditId] = useState(null);
//     const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//     const [selectedDeleteId, setSelectedDeleteId] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const API_URL = `${config.serverUrl}/api/salutations`;

//     useEffect(() => {
//         fetchSalutations();
//     }, []);

//     const fetchSalutations = async () => {
//         try {
//             const response = await axios.get(`${API_URL}`);
//             const sortedData = response.data.sort((a, b) => b.id - a.id);
//             setSalutationsList(sortedData);
//         } catch (error) {
//             console.error("Error fetching salutations:", error);
//         }
//         setIsLoading(false);
//     };

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
//         setSalutations("");
//         setError(false);
//         setIsEditMode(false);
//         setEditId(null);
//     };

//     const handleEdit = (salutation) => {
//         setSalutations(salutation.salutation);
//         setEditId(salutation.id);
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleUpdate = async () => {
//         if (!salutations.trim()) {
//             setError(true);
//             setSnackbarMessage("Salutation is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         try {
//             await axios.put(`${API_URL}/edit/${editId}`, {
//                 salutation: salutations.trim(),
//                 date: getCurrentISTDateTime(),
//             });

//             setSnackbarMessage("Salutation Updated Successfully");
//             fetchSalutations();
//             handleClose();
//         } catch (error) {
//             const message = error.response?.data?.message || error.message || "Failed to update salutation";
//             setSnackbarMessage(message);
//             setError(true);
//         }

//         setSnackbarOpen(true);
//     };

//     const handleDeleteClick = (id) => {
//         setSelectedDeleteId(id);
//         setDeleteConfirmOpen(true);
//     };

//     const confirmDelete = async () => {
//         try {
//             await axios.delete(`${API_URL}/${selectedDeleteId}`);
//             setSnackbarMessage("Salutation Deleted Successfully");
//             fetchSalutations();
//         } catch (error) {
//             console.error("Error deleting salutation:", error);
//             setSnackbarMessage("Failed to delete salutation");
//         }
//         setSnackbarOpen(true);
//         setDeleteConfirmOpen(false);
//         setSelectedDeleteId(null);
//     };

//     const handleAdd = async () => {
//         if (!salutations.trim()) {
//             setError(true);
//             setSnackbarMessage("Salutation is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         try {
//             await axios.post(`${API_URL}/create`, {
//                 salutation: salutations.trim(),
//                 date: getCurrentISTDateTime(),
//             });

//             setSnackbarMessage("Salutation Created Successfully");
//             fetchSalutations();
//             handleClose();
//         } catch (error) {
//             const message = error.response?.data?.message || error.message || "Failed to add salutation";
//             setSnackbarMessage(message);
//             setError(true);
//         }

//         setSnackbarOpen(true);
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     return (
//         <>
//             {isLoading ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="card">
//                     <div className="flex items-center justify-between text-nowrap">
//                         <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Salutations :</div>
//                         <Button
//                             variant="gradient"
//                             className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
//                             onClick={handleOpen}
//                         >
//                             <UserPlus size={20} />
//                             Create Salutation
//                         </Button>
//                     </div>

//                     <div className="card-body p-0">
//                         <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                             <table className="table">
//                                 <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                     <tr className="table-row">
//                                         <th className="table-head border border-gray-300 capitalize">Salutations No.</th>
//                                         <th className="table-head border border-gray-300 capitalize">Salutations Id</th>
//                                         <th className="table-head border border-gray-300 capitalize">Salutation</th>
//                                         <th className="table-head border border-gray-300 capitalize">Date</th>
//                                         <th className="table-head border border-gray-300 capitalize">Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="table-body text-[#433C50]">
//                                     {salutationsList.map((salutations, index) => (
//                                         <tr
//                                             className="table-row"
//                                             key={salutations.id}
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{salutations.id}</td>
//                                             <td className="table-cell border border-gray-300">{salutations.salutation}</td>
//                                             <td className="table-cell border border-gray-300">{salutations.date}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         className="text-blue-500"
//                                                         onClick={() => handleEdit(salutations)}
//                                                     >
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDeleteClick(salutations.id)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                     {salutationsList.length === 0 && (
//                                         <tr>
//                                             <td
//                                                 colSpan="5"
//                                                 className="py-4 text-center text-gray-400"
//                                             >
//                                                 No Salutations Added Yet.
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             )}
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
//                             {isEditMode ? "Update Salutation" : "Add Salutation"}
//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <TextField
//                         fullWidth
//                         label="Salutation"
//                         placeholder="Enter Salutation"
//                         variant="outlined"
//                         error={error}
//                         value={salutations}
//                         onChange={(e) => {
//                             setSalutations(e.target.value);
//                             setError(false);
//                         }}
//                         sx={{
//                             "& label.Mui-focused": {
//                                 color: error ? red[500] : purple[500],
//                             },
//                             "& .MuiOutlinedInput-root": {
//                                 "& fieldset": {
//                                     borderColor: error ? red[500] : purple[100],
//                                 },
//                                 "&:hover fieldset": {
//                                     borderColor: error ? red[500] : purple[100],
//                                 },
//                                 "&.Mui-focused fieldset": {
//                                     borderColor: error ? red[500] : purple[500],
//                                 },
//                             },
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

//             {/* Delete Modal */}
//             <Modal
//                 open={deleteConfirmOpen}
//                 onClose={() => setDeleteConfirmOpen(false)}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             Confirm Delete
//                         </Typography>
//                         <IconButton
//                             onClick={() => setDeleteConfirmOpen(false)}
//                             className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
//                         >
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this salutation?</Typography>

//                     <div className="mt-4 flex justify-center gap-4">
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-red-700 px-4 py-2 capitalize text-white"
//                             onClick={confirmDelete}
//                         >
//                             Yes
//                         </Button>
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
//                             onClick={() => setDeleteConfirmOpen(false)}
//                         >
//                             No
//                         </Button>
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

// export default Salutations;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, UserPlus, X } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import { getSalutations, createSalutation, updateSalutation, deleteSalutation } from "../../redux/actions/salutation";
import { clearSnackbar } from "../../redux/actions/commonActions";

const Salutations = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [salutations, setSalutations] = useState("");
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.salutation.loading);

    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.salutation);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const salutationsList = useSelector((state) => state.salutation.salutations);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getSalutations());
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
        setSalutations("");
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (salutation) => {
        setSalutations(salutation.salutation);
        setEditId(salutation.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleUpdate = () => {
        if (!salutations.trim()) {
            setError(true);
            setLocalSnackbarMessage("Salutation is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            updateSalutation(editId, {
                salutation: salutations.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleAdd = () => {
        if (!salutations.trim()) {
            setError(true);
            setLocalSnackbarMessage("Salutation is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            createSalutation({
                salutation: salutations.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteSalutation(selectedDeleteId));
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
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Salutations :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create Salutation
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Salutation</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {salutationsList.map((salutations, index) => (
                                        <tr
                                            className="table-row"
                                            key={salutations.id}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{salutations.salutation}</td>
                                            <td className="table-cell border border-gray-300">{salutations.date}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(salutations)}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => handleDeleteClick(salutations.id)}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {salutationsList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Salutations Added Yet.
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
                            {isEditMode ? "Update Salutation" : "Add Salutation"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <TextField
                        fullWidth
                        label="Salutation"
                        placeholder="Enter Salutation"
                        variant="outlined"
                        error={error}
                        value={salutations}
                        onChange={(e) => {
                            setSalutations(e.target.value);
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this salutation?</Typography>

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

export default Salutations;
