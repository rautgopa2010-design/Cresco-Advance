// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, X, CirclePlus, CircleMinus } from "lucide-react";
// import { IoEarthSharp } from "react-icons/io5";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, MenuItem } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const Zone = () => {
//     const [open, setOpen] = useState(false);
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [country, setCountry] = useState("");
//     const [zone, setZone] = useState([""]);
//     const [countryError, setCountryError] = useState(false);
//     const [countryList, setCountryList] = useState([]);
//     const [zoneList, setZoneList] = useState([]);

//     useEffect(() => {
//         const storedZones = JSON.parse(localStorage.getItem("zoneList")) || [];
//         const storedCountries = JSON.parse(localStorage.getItem("countryList")) || [];

//         setZoneList(storedZones);
//         setCountryList(storedCountries);
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
//         const storedCountries = JSON.parse(localStorage.getItem("countryList")) || [];
//         setCountryList(storedCountries);

//         setOpen(true);
//         setError(false);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setCountry("");
//         setZone([""]);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (index) => {
//         const item = zoneList[index];
//         setCountry(item.Country);
//         setZone(Array.isArray(item.zone) ? item.zone : [item.zone]);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//     };

//     const handleDelete = (index) => {
//         const updatedList = zoneList.filter((_, i) => i !== index);
//         setZoneList(updatedList);
//         localStorage.setItem("zoneList", JSON.stringify(updatedList));
//     };

//     const handleAdd = () => {
//         setCountryError(false);
//         setError(false);

//         if (!country.trim()) {
//             setCountryError(true);
//             setSnackbarMessage("Country is required");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedZones = zone.map((zon) => zon.trim());

//         if (trimmedZones.some((zon) => !zon)) {
//             setError(true);
//             setSnackbarMessage("All Zones must be filled");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const hasDuplicate = new Set(trimmedZones.map((s) => s.toLowerCase())).size !== trimmedZones.length;
//         if (hasDuplicate) {
//             setError(true);
//             setSnackbarMessage("Zone must be unique");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedCountry = country.trim();
//         const countryExists = zoneList.some((entry) => entry.Country.toLowerCase() === trimmedCountry.toLowerCase());

//         if (countryExists) {
//             setSnackbarMessage("Country already exists");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newEntry = {
//             id: zoneList.length + 1,
//             Country: trimmedCountry,
//             zone: trimmedZones,
//             date: getCurrentISTDateTime(),
//         };

//         const updatedList = [...zoneList, newEntry];
//         setZoneList(updatedList);
//         localStorage.setItem("zoneList", JSON.stringify(updatedList));

//         setSnackbarMessage("Zone added successfully");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleUpdate = () => {
//         setCountryError(false);
//         setError(false);

//         if (!country.trim()) {
//             setCountryError(true);
//             setSnackbarMessage("Country is required");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedZones = zone.map((zon) => zon.trim());

//         if (trimmedZones.some((zon) => !zon)) {
//             setError(true);
//             setSnackbarMessage("All Zones must be filled");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const hasDuplicate = new Set(trimmedZones.map((s) => s.toLowerCase())).size !== trimmedZones.length;
//         if (hasDuplicate) {
//             setError(true);
//             setSnackbarMessage("Zone must be unique");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedCountry = country.trim();
//         const countryExists = zoneList.some(
//             (entry, index) =>
//                 index !== editIndex && entry.Country.toLowerCase() === trimmedCountry.toLowerCase()
//         );

//         if (countryExists) {
//             setSnackbarMessage("Country already exists");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedList = [...zoneList];
//         updatedList[editIndex] = {
//             ...updatedList[editIndex],
//             Country: trimmedCountry,
//             zone: trimmedZones,
//             date: getCurrentISTDateTime(),
//         };

//         setZoneList(updatedList);
//         localStorage.setItem("zoneList", JSON.stringify(updatedList));

//         setSnackbarMessage("Zone updated successfully");
//         setSnackbarSeverity("success");
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
//                 <div className="items-center justify-between text-nowrap md:flex lg:flex">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Zone Detail's :</div>
//                     <Button
//                         variant="gradient"
//                         className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <IoEarthSharp size={20} />
//                         Zone
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Zone No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Zone Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Countries</th>
//                                     <th className="table-head border border-gray-300 capitalize">Zone</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {Array.isArray(zoneList) && zoneList.length > 0 ? (
//                                     zoneList.map((zon, index) => (
//                                         <tr
//                                             key={zon.id}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{zon.id}</td>
//                                             <td className="table-cell border border-gray-300">{zon.Country}</td>
//                                             <td className="table-cell border border-gray-300">{zon.zone}</td>
//                                             <td className="table-cell border border-gray-300">{zon.date}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         className="text-blue-500"
//                                                         onClick={() => handleEdit(index)}
//                                                     >
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDelete(index)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             colSpan="6"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Zones Added Yet.
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
//                             {isEditMode ? "Update Zone" : "Add Zone"}
//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>
//                     <div>
//                         <TextField
//                             select
//                             fullWidth
//                             label="Country"
//                             value={country}
//                             onChange={(e) => {
//                                 setCountry(e.target.value);
//                                 setCountryError(false);
//                             }}
//                             error={countryError}
//                             size="small"
//                         >
//                             <MenuItem
//                                 value=""
//                                 disabled
//                             >
//                                 Choose Country
//                             </MenuItem>
//                             {countryList.map((c, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={c.name}
//                                 >
//                                     {c.name}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </div>
//                     {zone.map((zon, idx) => (
//                         <div
//                             key={idx}
//                             className="mt-4 flex items-center gap-2"
//                         >
//                             <TextField
//                                 fullWidth
//                                 label={`Zone ${idx + 1}`}
//                                 placeholder="Enter Zone"
//                                 variant="outlined"
//                                 error={error && !zon.trim()}
//                                 value={zon}
//                                 onChange={(e) => {
//                                     const updated = [...zone];
//                                     updated[idx] = e.target.value;
//                                     setZone(updated);
//                                     setError(false);
//                                 }}
//                                 size="small"
//                             />
//                             {zone.length > 1 && (
//                                 <IconButton
//                                     onClick={() => {
//                                         const updated = zone.filter((_, i) => i !== idx);
//                                         setZone(updated);
//                                     }}
//                                     size="small"
//                                     className="border"
//                                 >
//                                     <CircleMinus
//                                         size={16}
//                                         className="text-red-500"
//                                     />
//                                 </IconButton>
//                             )}
//                             {idx === zone.length - 1 && (
//                                 <IconButton
//                                     onClick={() => setZone([...zone, ""])}
//                                     size="small"
//                                     className="border"
//                                 >
//                                     <CirclePlus
//                                         size={16}
//                                         className="text-blue-500"
//                                     />
//                                 </IconButton>
//                             )}
//                         </div>
//                     ))}

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
//                     severity={snackbarSeverity}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default Zone;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, X, CirclePlus, CircleMinus } from "lucide-react";
import { IoEarthSharp } from "react-icons/io5";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress, Autocomplete } from "@mui/material";
import { getZones, createZones, updateZones, deleteZones } from "../../redux/actions/zones";
import { getCountry } from "../../redux/actions/country";
import { clearSnackbar } from "../../redux/actions/commonActions";

const Zone = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [country, setCountry] = useState("");
    const [zones, setZones] = useState([""]);
    const [countryError, setCountryError] = useState(false);
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.zones.loading);
    const { country: countryList } = useSelector((state) => state.country);
    const { zones: zonesList, snackbarMessage, snackbarSeverity } = useSelector((state) => state.zones);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    
    useEffect(() => {
        dispatch(getCountry());
        dispatch(getZones());
        dispatch(clearSnackbar());
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
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setCountry("");
        setZones([""]);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (item) => {
        setCountry(item.Country || "");
        if (Array.isArray(item.zones)) {
            setZones(item.zones);
        } else if (typeof item.zones === "string") {
            setZones(item.zones.split(",").map((z) => z.trim()));
        } else {
            setZones([""]);
        }
        setEditId(item.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleAdd = async () => {
        let messages = [];

        setCountryError(false);
        setError(false);

        const selectedCountry = countryList.find((c) => c.country === country);
        if (!selectedCountry) {
            setCountryError(true);
            messages.push("Country is required");
        }

        const trimmedZones = zones.map((z) => z.trim());
        if (trimmedZones.some((z) => !z)) {
            setError(true);
            messages.push("All Zones must be filled");
        }

        const hasDuplicate = new Set(trimmedZones.map((z) => z.toLowerCase())).size !== trimmedZones.length;
        if (hasDuplicate) {
            messages.push("Zones must be unique");
        }

        if (messages.length > 0) {
            setLocalSnackbarMessage(messages.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            createZones({
                countryId: selectedCountry.id,
                zones: trimmedZones,
                date: getCurrentISTDateTime(),
            }),
        );

        handleClose();
    };

    const handleUpdate = async () => {
        let messages = [];

        setCountryError(false);
        setError(false);

        const selectedCountry = countryList.find((c) => c.country === country);
        if (!selectedCountry) {
            setCountryError(true);
            messages.push("Country is required");
        }

        const trimmedZones = zones.map((z) => z.trim());
        if (trimmedZones.some((z) => !z)) {
            setError(true);
            messages.push("All Zones must be filled");
        }

        const hasDuplicate = new Set(trimmedZones.map((z) => z.toLowerCase())).size !== trimmedZones.length;
        if (hasDuplicate) {
            messages.push("Zones must be unique");
        }

        if (messages.length > 0) {
            setLocalSnackbarMessage(messages.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            updateZones(editId, {
                countryId: selectedCountry.id,
                zones: trimmedZones,
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
        dispatch(deleteZones(selectedDeleteId));
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
                    <div className="items-center justify-between text-nowrap md:flex lg:flex">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Zones Detail's :</div>
                        <Button
                            variant="gradient"
                            className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
                            onClick={handleOpen}
                        >
                            <IoEarthSharp size={20} />
                            Add Zones
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Country</th>
                                        <th className="table-head border border-gray-300 capitalize">Zones</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {Array.isArray(zonesList) && zonesList.length > 0 ? (
                                        zonesList.map((zon, index) => (
                                            <tr
                                                key={index}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{zon.Country}</td>
                                                <td className="table-cell border border-gray-300">
                                                    {Array.isArray(zon.zones) ? zon.zones.join(", ") : ""}
                                                </td>
                                                <td className="table-cell border border-gray-300">{zon.date}</td>
                                                <td className="table-cell border border-gray-300">
                                                    <div className="flex items-center gap-x-4">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEdit(zon)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(zon.id)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Zones Added Yet.
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
                            {isEditMode ? "Update Zone" : "Add Zone"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>
                    <div>
                        <Autocomplete
                            fullWidth
                            options={countryList.map((c) => c.country)}
                            value={country || null}
                            onChange={(_, newValue) => {
                                setCountry(newValue || "");
                                setCountryError(false);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Country"
                                    error={countryError}
                                    size="small"
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                        />
                    </div>

                    {zones.map((zone, idx) => (
                        <div
                            key={idx}
                            className="mt-4 flex items-center gap-2"
                        >
                            <TextField
                                fullWidth
                                label={`Zone ${idx + 1}`}
                                placeholder="Enter Zone"
                                variant="outlined"
                                error={error && !zone.trim()}
                                value={zone}
                                onChange={(e) => {
                                    const updated = [...zones];
                                    updated[idx] = e.target.value;
                                    setZones(updated);
                                    setError(false);
                                }}
                                size="small"
                            />
                            {zones.length > 1 && (
                                <IconButton
                                    onClick={() => {
                                        const updated = zones.filter((_, i) => i !== idx);
                                        setZones(updated);
                                    }}
                                    size="small"
                                    className="border"
                                >
                                    <CircleMinus
                                        size={16}
                                        className="text-red-500"
                                    />
                                </IconButton>
                            )}
                            {idx === zones.length - 1 && (
                                <IconButton
                                    onClick={() => setZones([...zones, ""])}
                                    size="small"
                                    className="border"
                                >
                                    <CirclePlus
                                        size={16}
                                        className="text-blue-500"
                                    />
                                </IconButton>
                            )}
                        </div>
                    ))}

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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this Zones?</Typography>

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

export default Zone;
