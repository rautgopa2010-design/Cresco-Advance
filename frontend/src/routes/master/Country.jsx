// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, X, Flag } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const Country = () => {
//     const [open, setOpen] = useState(false);
//     const [country, setCountry] = useState("");
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [countryList, setCountryList] = useState([]);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);

//     // Load from localStorage on first load
//     useEffect(() => {
//         const storedCountry = JSON.parse(localStorage.getItem("countryList")) || [];
//         setCountryList(storedCountry);
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
//         setCountry("");
//         setError(false);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (index) => {
//         const country = countryList[index];
//         setCountry(country.name);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleUpdate = () => {
//         const trimmedCountry = country.trim();
//         if (!trimmedCountry) {
//             setError(true);
//             setSnackbarMessage("Country is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const isDuplicate = countryList.some(
//             (item, index) =>
//                 item.name.toLowerCase() === trimmedCountry.toLowerCase() &&
//                 index !== editIndex
//         );

//         if (isDuplicate) {
//             setError(true);
//             setSnackbarMessage("Country already exists");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedCountry = [...countryList];
//         updatedCountry[editIndex] = {
//             ...updatedCountry[editIndex],
//             name: trimmedCountry,
//             date: getCurrentISTDateTime(),
//         };

//         setCountryList(updatedCountry);
//         localStorage.setItem("countryList", JSON.stringify(updatedCountry));

//         setSnackbarMessage("Country Updated Successfully");
//         setError(false);
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleDelete = (index) => {
//         const updatedCountry = countryList.filter((_, i) => i !== index);
//         setCountryList(updatedCountry);
//         localStorage.setItem("countryList", JSON.stringify(updatedCountry));
//     };

//     const handleAdd = () => {
//         const trimmedCountry = country.trim();
//         if (!trimmedCountry) {
//             setError(true);
//             setSnackbarMessage("Country is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const isDuplicate = countryList.some(
//             (item) => item.name.toLowerCase() === trimmedCountry.toLowerCase()
//         );

//         if (isDuplicate) {
//             setError(true);
//             setSnackbarMessage("Country already exists");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newCountry = {
//             id: countryList.length + 1,
//             name: trimmedCountry,
//             date: getCurrentISTDateTime(),
//         };

//         const updatedCountry = [...countryList, newCountry];
//         setCountryList(updatedCountry);
//         localStorage.setItem("countryList", JSON.stringify(updatedCountry));

//         setSnackbarMessage("Country Created Successfully");
//         setError(false);
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
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Generate Country :</div>
//                     <Button
//                         variant="gradient"
//                         className="flex items-center gap-2 text-sm rounded-full bg-[#053054] px-3 py-2 capitalize md:text-base lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <Flag size={20} />
//                         Create Country
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Country No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Country Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Country Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {countryList.map((country, index) => (
//                                     <tr
//                                         className="table-row"
//                                         key={index}
//                                     >
//                                         <td className="table-cell border border-gray-300">{index + 1}</td>
//                                         <td className="table-cell border border-gray-300">{index + 1}</td>
//                                         <td className="table-cell border border-gray-300">{country.name}</td>
//                                         <td className="table-cell border border-gray-300">{country.date}</td>
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
//                                 {countryList.length === 0 && (
//                                     <tr>
//                                         <td
//                                             colSpan="5"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Countries Added Yet.
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
//                             {isEditMode ? "Update Country" : "Add Country"}

//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <TextField
//                         fullWidth
//                         label="Country"
//                         placeholder="Enter Country"
//                         variant="outlined"
//                         error={error}
//                         value={country}
//                         onChange={(e) => {
//                             setCountry(e.target.value);
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

// export default Country;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, Flag, X } from "lucide-react";
import { countries } from "country-data";
import {
    Modal,
    Box,
    Autocomplete,
    Typography,
    IconButton,
    TextField,
    Snackbar,
    Alert,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import { getCountry, createCountry, updateCountry, deleteCountry } from "../../redux/actions/country";
import { clearSnackbar } from "../../redux/actions/commonActions";

const Country = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [country, setCountry] = useState("");
    const allCountries = countries.all.sort((a, b) => a.name.localeCompare(b.name));
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.country.loading);

    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.country);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const countryList = useSelector((state) => state.country.country);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getCountry());
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
        setCountry("");
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (country) => {
        setCountry(country.country);
        setEditId(country.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleAdd = async () => {
        if (!country.trim()) {
            setError(true);
            setLocalSnackbarMessage("Country is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            createCountry({
                country: country.trim(),
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleUpdate = async () => {
        if (!country.trim()) {
            setError(true);
            setLocalSnackbarMessage("Country is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        dispatch(
            updateCountry(editId, {
                country: country.trim(),
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
        dispatch(deleteCountry(selectedDeleteId));
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
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Generate Country :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <Flag size={20} />
                            Create Country
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Country Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {countryList.map((country, index) => (
                                        <tr
                                            className="table-row"
                                            key={index}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{country.country}</td>
                                            <td className="table-cell border border-gray-300">{country.date}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(country)}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => handleDeleteClick(country.id)}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {countryList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Countries Added Yet.
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
                            {isEditMode ? "Update Country" : "Add Country"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Autocomplete
                        options={allCountries}
                        getOptionLabel={(option) => option.name}
                        value={allCountries.find((c) => c.name === country) || null}
                        onChange={(_, newValue) => {
                            if (newValue) {
                                setCountry(newValue.name);
                                setError(false);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Country"
                                variant="outlined"
                                error={error}
                            />
                        )}
                        fullWidth
                        className="mb-4"
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this country?</Typography>

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

export default Country;
