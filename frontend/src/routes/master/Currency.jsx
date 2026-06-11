// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, X } from "lucide-react";
// import { MdCurrencyBitcoin } from "react-icons/md";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, MenuItem } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const Currency = () => {
//     const [open, setOpen] = useState(false);
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [country, setCountry] = useState("");
//     const [currency, setCurrency] = useState([""]);
//     const [countryError, setCountryError] = useState(false);
//     const [countryList, setCountryList] = useState([]);
//     const [currencyList, setCurrencyList] = useState([]);

//     useEffect(() => {
//         const storedCurrencies = JSON.parse(localStorage.getItem("currencyList")) || [];
//         const storedCountries = JSON.parse(localStorage.getItem("countryList")) || [];

//         setCurrencyList(storedCurrencies);
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
//         setCurrency([""]);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (index) => {
//         const item = currencyList[index];
//         setCountry(item.Country);
//         setCurrency(Array.isArray(item.currency) ? item.currency : [item.currency]);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//     };

//     const handleDelete = (index) => {
//         const updatedList = currencyList.filter((_, i) => i !== index);
//         setCurrencyList(updatedList);
//         localStorage.setItem("currencyList", JSON.stringify(updatedList));
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

//         if (currency.some((curr) => !curr.trim())) {
//             setError(true);
//             setSnackbarMessage("Currency is required");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedCountry = country.trim();
//         const countryExists = currencyList.some(
//             (entry) => entry.Country.toLowerCase() === trimmedCountry.toLowerCase()
//         );

//         if (countryExists) {
//             setSnackbarMessage("Country already exists");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newEntry = {
//             id: currencyList.length + 1,
//             Country: trimmedCountry,
//             currency: currency.map((curr) => curr.trim()),
//             date: getCurrentISTDateTime(),
//         };

//         const updatedList = [...currencyList, newEntry];
//         setCurrencyList(updatedList);
//         localStorage.setItem("currencyList", JSON.stringify(updatedList));

//         setSnackbarMessage("Currency added successfully");
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

//         if (currency.some((curr) => !curr.trim())) {
//             setError(true);
//             setSnackbarMessage("Currency is required");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const trimmedCountry = country.trim();
//         const trimmedCurrencies = currency.map((curr) => curr.trim());

//         const countryExists = currencyList.some(
//             (entry, index) => index !== editIndex && entry.Country.toLowerCase() === trimmedCountry.toLowerCase()
//         );

//         if (countryExists) {
//             setSnackbarMessage("Country already exists");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedList = [...currencyList];
//         updatedList[editIndex] = {
//             ...updatedList[editIndex],
//             Country: trimmedCountry,
//             currency: trimmedCurrencies,
//             date: getCurrentISTDateTime(),
//         };

//         setCurrencyList(updatedList);
//         localStorage.setItem("currencyList", JSON.stringify(updatedList));

//         setSnackbarMessage("Currency updated successfully");
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
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Currency Detail's :</div>
//                     <Button
//                         variant="gradient"
//                         className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <MdCurrencyBitcoin size={20} />
//                         Currency
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Currency No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Currency Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Country</th>
//                                     <th className="table-head border border-gray-300 capitalize">Currency</th>
//                                     <th className="table-head border border-gray-300 capitalize">Symbol</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {Array.isArray(currencyList) && currencyList.length > 0 ? (
//                                     currencyList.map((curr, index) => (
//                                         <tr
//                                             key={curr.id}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{curr.Country}</td>
//                                             <td className="table-cell border border-gray-300">{curr.currency}</td>
//                                             <td className="table-cell border border-gray-300">{curr.symbol}</td>
//                                             <td className="table-cell border border-gray-300">{curr.date}</td>
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
//                                             colSpan="7"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Currency Added Yet.
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
//                             {isEditMode ? "Update Currency" : "Add Currency"}
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
//                     {currency.map((curr, idx) => (
//                         <div
//                             key={idx}
//                             className="mt-4"
//                         >
//                             <TextField
//                                 fullWidth
//                                 label="Currency"
//                                 placeholder="Enter Currency"
//                                 variant="outlined"
//                                 error={error && !curr.trim()}
//                                 value={curr}
//                                 onChange={(e) => {
//                                     const updated = [...currency];
//                                     updated[idx] = e.target.value;
//                                     setCurrency(updated);
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

// export default Currency;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, X } from "lucide-react";
import { MdCurrencyBitcoin } from "react-icons/md";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress, Autocomplete } from "@mui/material";
import { countries, currencies } from "country-data";
import { getCurrency, createCurrency, updateCurrency, deleteCurrency } from "../../redux/actions/currency";
import { getCountry } from "../../redux/actions/country";
import { clearSnackbar } from "../../redux/actions/commonActions";

const Currency = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [country, setCountry] = useState("");
    const [currency, setCurrency] = useState([""]);
    const [countryError, setCountryError] = useState(false);
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.currency.loading);
    const { country: countryList } = useSelector((state) => state.country);
    const { currency: currencyList, snackbarMessage, snackbarSeverity } = useSelector((state) => state.currency);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(getCountry());
        dispatch(getCurrency());
        dispatch(clearSnackbar());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity(snackbarSeverity || "success");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage, snackbarSeverity]);

    const [symbol, setSymbol] = useState("");

    const handleCountryChange = (selectedCountry) => {
        const trimmedCountry = selectedCountry.trim();
        setCountry(trimmedCountry);
        setCountryError(false);

        try {
            const countryObj = countries.all.find((c) => c.name.toLowerCase() === trimmedCountry.toLowerCase());

            if (!countryObj || !countryObj.currencies?.length) {
                setCurrency([""]);
                setSymbol("");
                return;
            }

            const currencyCode = countryObj.currencies[0]; // e.g., 'INR', 'USD'
            const currencyData = currencies[currencyCode];

            const currencySymbol = currencyData?.symbol || "";

            setCurrency([currencyCode]);
            setSymbol(currencySymbol);
        } catch (err) {
            setCurrency([""]);
            setSymbol("");
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
        setSymbol("");
    };

    const handleClose = () => {
        setOpen(false);
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setCountry("");
        setCurrency([""]);
    };

    const handleEdit = (item) => {
        setCountry(item.country?.country || "");
        setCurrency([item.currencyCode || ""]);
        setSymbol(item.symbol || "");
        setEditId(item.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleAdd = () => {
        setCountryError(false);
        setError(false);

        if (!country.trim()) {
            setCountryError(true);
            setLocalSnackbarMessage("Country is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (currency.some((curr) => !curr.trim())) {
            setError(true);
            setLocalSnackbarMessage("Currency is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const trimmedCountry = country.trim();
        const currencyCode = currency[0].trim();

        // Check if already exists
        const exists = currencyList.some((entry) => entry.country?.country.toLowerCase() === trimmedCountry.toLowerCase());

        if (exists) {
            setLocalSnackbarMessage("Country already exists");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const newCurrency = {
            Country: trimmedCountry,
            currencyCode: currencyCode,
            symbol,
            date: getCurrentISTDateTime(),
        };

        dispatch(createCurrency(newCurrency));
        handleClose();
    };

    const handleUpdate = () => {
        setCountryError(false);
        setError(false);

        if (!country.trim()) {
            setCountryError(true);
            setLocalSnackbarMessage("Country is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (currency.some((curr) => !curr.trim())) {
            setError(true);
            setLocalSnackbarMessage("Currency is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const trimmedCountry = country.trim();
        const currencyCode = currency[0].trim();

        // Find index of edit item
        const editIndex = currencyList.findIndex((item) => item.id === editId);

        // Check for duplicate
        const exists = currencyList.some(
            (entry, index) => index !== editIndex && entry.country?.country.toLowerCase() === trimmedCountry.toLowerCase(),
        );

        if (exists) {
            setLocalSnackbarMessage("Country already exists");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const updatedCurrency = {
            Country: trimmedCountry,
            currencyCode: currencyCode,
            symbol,
            date: getCurrentISTDateTime(),
        };

        dispatch(updateCurrency(editId, updatedCurrency));
        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        dispatch(deleteCurrency(selectedDeleteId));
        setSnackbarOpen(true);
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

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    <div className="items-center justify-between text-nowrap md:flex lg:flex">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Currency Detail's :</div>
                        <Button
                            variant="gradient"
                            className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
                            onClick={handleOpen}
                        >
                            <MdCurrencyBitcoin size={20} />
                            Currency
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Country</th>
                                        <th className="table-head border border-gray-300 capitalize">Currency Code</th>
                                        <th className="table-head border border-gray-300 capitalize">Symbol</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {Array.isArray(currencyList) && currencyList.length > 0 ? (
                                        currencyList.map((curr, index) => (
                                            <tr
                                                key={index}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{curr.country?.country}</td>
                                                <td className="table-cell border border-gray-300">{curr.currencyCode}</td>
                                                <td className="table-cell border border-gray-300">{curr.symbol}</td>
                                                <td className="table-cell border border-gray-300">{curr.date}</td>
                                                <td className="table-cell border border-gray-300">
                                                    <div className="flex items-center gap-x-4">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEdit(curr)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(curr.id)}
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
                                                No Currency Added Yet.
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
                            {isEditMode ? "Update Currency" : "Add Currency"}
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

                    {currency.map((curr, idx) => (
                        <div
                            key={idx}
                            className="mt-4"
                        >
                            <TextField
                                fullWidth
                                label="Currency Code"
                                placeholder="Enter Currency Code"
                                variant="outlined"
                                error={error && !curr.trim()}
                                value={curr}
                                onChange={(e) => {
                                    const updated = [...currency];
                                    updated[idx] = e.target.value;
                                    setCurrency(updated);
                                    setError(false);
                                }}
                                size="small"
                            />
                        </div>
                    ))}

                    <div className="mt-4">
                        <TextField
                            fullWidth
                            label="Symbol"
                            placeholder="Auto-filled or Enter Symbol"
                            variant="outlined"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this currency?</Typography>

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
                autoHideDuration={1500}
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

export default Currency;
