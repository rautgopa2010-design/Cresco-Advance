// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, X, Flag } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, MenuItem } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const CountryCode = () => {
//     const [open, setOpen] = useState(false);
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [country, setCountry] = useState("");
//     const [countryCode, setCountryCode] = useState([""]);
//     const [countryError, setCountryError] = useState(false);
//     const [countryList, setCountryList] = useState([]);
//     const [countryCodeList, setCountryCodeList] = useState([]);

//     useEffect(() => {
//         const storedCountryCodes = JSON.parse(localStorage.getItem("countryCodeList")) || [];
//         const storedCountries = JSON.parse(localStorage.getItem("countryList")) || [];

//         setCountryCodeList(storedCountryCodes);
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
//         setCountryCode([""]);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (index) => {
//         const item = countryCodeList[index];
//         setCountry(item.Country);
//         setCountryCode(Array.isArray(item.countryCode) ? item.countryCode : [item.countryCode]);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//     };

//     const handleDelete = (index) => {
//         const updatedList = countryCodeList.filter((_, i) => i !== index);
//         setCountryCodeList(updatedList);
//         localStorage.setItem("countryCodeList", JSON.stringify(updatedList));
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

//         if (countryCode.some((code) => !code.trim())) {
//             setError(true);
//             setSnackbarMessage("Country Code is required");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedCountry = country.trim();
//         const countryExists = countryCodeList.some(
//             (entry) => entry.Country.toLowerCase() === trimmedCountry.toLowerCase()
//         );

//         if (countryExists) {
//             setSnackbarMessage("Country already exists");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newEntry = {
//             id: countryCodeList.length + 1,
//             Country: trimmedCountry,
//             countryCode: countryCode.map((code) => code.trim()),
//             date: getCurrentISTDateTime(),
//         };

//         const updatedList = [...countryCodeList, newEntry];
//         setCountryCodeList(updatedList);
//         localStorage.setItem("countryCodeList", JSON.stringify(updatedList));

//         setSnackbarMessage("Country Code added successfully");
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

//         if (countryCode.some((code) => !code.trim())) {
//             setError(true);
//             setSnackbarMessage("Country Code is required");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedCountry = country.trim();
//         const trimmedCountryCodes = countryCode.map((code) => code.trim());

//         const countryExists = countryCodeList.some(
//             (entry, index) => index !== editIndex && entry.Country.toLowerCase() === trimmedCountry.toLowerCase()
//         );

//         if (countryExists) {
//             setSnackbarMessage("Country already exists");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedList = [...countryCodeList];
//         updatedList[editIndex] = {
//             ...updatedList[editIndex],
//             Country: trimmedCountry,
//             countryCode: trimmedCountryCodes,
//             date: getCurrentISTDateTime(),
//         };

//         setCountryCodeList(updatedList);
//         localStorage.setItem("countryCodeList", JSON.stringify(updatedList));

//         setSnackbarMessage("Country Code updated successfully");
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
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Country Code Detail's :</div>
//                     <Button
//                         variant="gradient"
//                         className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <Flag size={20} />
//                         Country Code
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Countries</th>
//                                     <th className="table-head border border-gray-300 capitalize">Country Code</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {Array.isArray(countryCodeList) && countryCodeList.length > 0 ? (
//                                     countryCodeList.map((con, index) => (
//                                         <tr
//                                             key={con.id}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{con.Country}</td>
//                                             <td className="table-cell border border-gray-300">{con.countryCode}</td>
//                                             <td className="table-cell border border-gray-300">{con.date}</td>
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
//                                             colSpan="5"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Country Code Added Yet.
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
//                             {isEditMode ? "Update Country Code" : "Add Country Code"}
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
//                     {countryCode.map((code, idx) => (
//                         <div
//                             key={idx}
//                             className="mt-4"
//                         >
//                             <TextField
//                                 fullWidth
//                                 label="Country Code"
//                                 placeholder="Enter Country Code"
//                                 variant="outlined"
//                                 error={error && !code.trim()}
//                                 value={code}
//                                 onChange={(e) => {
//                                     const updated = [...countryCode];
//                                     updated[idx] = e.target.value;
//                                     setCountryCode(updated);
//                                     setError(false);
//                                 }}
//                                 size="small"
//                             />
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

// export default CountryCode;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, X, Flag } from "lucide-react";
import { countries } from "country-data";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress, Autocomplete } from "@mui/material";
import { getCountryCode, createCountryCode, updateCountryCode, deleteCountryCode } from "../../redux/actions/countryCode";
import { getCountry } from "../../redux/actions/country";
import { clearSnackbar } from "../../redux/actions/commonActions";

const CountryCode = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [country, setCountry] = useState("");
    const [countryCode, setCountryCode] = useState([""]);
    const [countryError, setCountryError] = useState(false);
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.countryCode.loading);
    const { country: countryList } = useSelector((state) => state.country);
    const { countryCode: countryCodeList, snackbarMessage, snackbarSeverity } = useSelector((state) => state.countryCode);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(getCountry());
        dispatch(getCountryCode());
        dispatch(clearSnackbar());
    }, [dispatch]);

    const [phoneCode, setPhoneCode] = useState([""]);

    const handleCountryChange = (selectedCountry) => {
        const trimmedCountry = selectedCountry.trim();
        setCountry(trimmedCountry);
        setCountryError(false);

        try {
            const countryObj = countries.all.find((c) => c.name.toLowerCase() === trimmedCountry.toLowerCase());

            if (!countryObj) {
                setCountryCode([""]);
                setPhoneCode([""]);
                return;
            }

            const callingCode = countryObj.countryCallingCodes?.[0] || "";
            const countryAlpha2 = countryObj.alpha2;

            setCountryCode([countryAlpha2]);
            setPhoneCode(callingCode);
        } catch (error) {
            setCountryCode([""]);
            setPhoneCode([""]);
        }
    };

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
        setPhoneCode("");
    };

    const handleClose = () => {
        setOpen(false);
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setCountry("");
        setCountryCode([""]);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (item) => {
        setCountry(item.country?.country || "");
        setCountryCode([item.countryCode || ""]);
        setPhoneCode([item.phoneCode || ""]);
        setEditId(item.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleAdd = async () => {
        setCountryError(false);
        setError(false);

        const trimmedCountry = country.trim();
        const trimmedCode = countryCode[0].trim();

        if (!trimmedCountry) {
            setCountryError(true);
            setLocalSnackbarMessage("Country is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!trimmedCode) {
            setError(true);
            setLocalSnackbarMessage("Country Code is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            createCountryCode({
                Country: trimmedCountry,
                countryCode: trimmedCode,
                phoneCode: phoneCode.trim() || "",
                date: getCurrentISTDateTime(),
            }),
        );
        handleClose();
    };

    const handleUpdate = async () => {
        setCountryError(false);
        setError(false);

        const trimmedCountry = country.trim();
        const trimmedCode = countryCode[0].trim();

        if (!trimmedCountry) {
            setCountryError(true);
            setLocalSnackbarMessage("Country is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!trimmedCode) {
            setError(true);
            setLocalSnackbarMessage("Country Code is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            updateCountryCode(editId, {
                Country: trimmedCountry,
                countryCode: trimmedCode,
                phoneCode: phoneCode.trim() || "",
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
        dispatch(deleteCountryCode(selectedDeleteId));
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
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Country Code Detail's :</div>
                        <Button
                            variant="gradient"
                            className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
                            onClick={handleOpen}
                        >
                            <Flag size={20} />
                            Country Code
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Country</th>
                                        <th className="table-head border border-gray-300 capitalize">Country Code</th>
                                        <th className="table-head border border-gray-300 capitalize">Phone Code</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {Array.isArray(countryCodeList) && countryCodeList.length > 0 ? (
                                        countryCodeList.map((con, index) => (
                                            <tr
                                                key={index}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{con.country?.country}</td>
                                                <td className="table-cell border border-gray-300">{con.countryCode}</td>
                                                <td className="table-cell border border-gray-300">{con.phoneCode}</td>
                                                <td className="table-cell border border-gray-300">{con.date}</td>
                                                <td className="table-cell border border-gray-300">
                                                    <div className="flex items-center gap-x-4">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEdit(con)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(con.id)}
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
                                                colSpan="6"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Country Code Added Yet.
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
                            {isEditMode ? "Update Country Code" : "Add Country Code"}
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
                            onChange={(_, newValue) => handleCountryChange(newValue || "")}
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

                    {countryCode.map((code, idx) => (
                        <div
                            key={idx}
                            className="mt-4"
                        >
                            <TextField
                                fullWidth
                                label="Country Code"
                                placeholder="Enter Country Code"
                                variant="outlined"
                                error={error && !code.trim()}
                                value={code}
                                onChange={(e) => {
                                    const updated = [...countryCode];
                                    updated[idx] = e.target.value;
                                    setCountryCode(updated);
                                    setError(false);
                                }}
                                size="small"
                            />
                        </div>
                    ))}

                    <div className="mt-4">
                        <TextField
                            fullWidth
                            label="Phone Code"
                            placeholder="Auto-filled or Enter Phone Code"
                            variant="outlined"
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            size="small"
                        />
                    </div>

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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this country code?</Typography>

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

export default CountryCode;
