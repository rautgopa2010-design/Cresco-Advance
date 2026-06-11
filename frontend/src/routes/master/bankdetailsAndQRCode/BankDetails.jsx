// import { Button } from "@material-tailwind/react";
// import React, { useEffect, useState } from "react";
// import { PencilLine, Trash } from "lucide-react";
// import { AiOutlineBank } from "react-icons/ai";
// import { useNavigate } from "react-router-dom";

// const BankDetails = () => {
//     const navigate = useNavigate();
//     const [bankList, setBankList] = useState([]);

//     useEffect(() => {
//         const storedBanks = JSON.parse(localStorage.getItem("bankList")) || [];
//         setBankList(storedBanks);
//     }, []);

//     const handleCreateClick = () => {
//         navigate("/settings/bank-setup/add-bank");
//     };

//     const handleDelete = (index) => {
//         const updatedBanks = bankList.filter((_, i) => i !== index);
//         setBankList(updatedBanks);
//         localStorage.setItem("bankList", JSON.stringify(updatedBanks));
//     };

//     return (
//         <div className="card rounded-md border p-4 shadow-md">
//             <div className="flex items-center justify-between text-nowrap">
//                 <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">
//                     Bank Detail's :
//                 </div>
//                 <Button
//                     variant="gradient"
//                     className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
//                     onClick={handleCreateClick}
//                 >
//                     <AiOutlineBank size={20} />
//                     Add Bank
//                 </Button>
//             </div>

//             {bankList.length === 0 ? (
//                 <div className="mt-4 text-center text-gray-500">
//                     No bank accounts added.
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3">
//                     {bankList.map((bank, index) => (
//                         <div
//                             key={index}
//                             className="rounded-xl bg-gradient-to-r from-[#053054] via-[#1b537b] to-[#053054] p-5 text-white shadow-lg"
//                         >
//                             <div className="mb-4 flex justify-between">
//                                 <h2 className="text-base font-bold md:text-lg lg:text-lg">
//                                     {bank.bankName}
//                                 </h2>
//                                 <div className="flex items-center gap-x-4">
//                                     <button>
//                                         <PencilLine size={20} />
//                                     </button>
//                                     <button onClick={() => handleDelete(index)}>
//                                         <Trash size={20} />
//                                     </button>
//                                 </div>
//                             </div>

//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>Branch:</strong> {bank.branchName}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>Customer:</strong> {bank.customerName}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>Account No:</strong> {bank.accountNumber}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>IFSC:</strong> {bank.ifsc}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>CIF NO:</strong> {bank.cifNumber}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>MICR:</strong> {bank.micr}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>Account Type:</strong> {bank.accountType}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>Customer PAN:</strong> {bank.customerPan}
//                             </p>
//                             <p className="text-sm md:text-base lg:text-base">
//                                 <strong>Address:</strong> {bank.address}
//                             </p>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BankDetails;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, X } from "lucide-react";
import { AiOutlineBank } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { Modal, Box, Typography, IconButton, Snackbar, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import { getBanks, deleteBank, clearBankSuccess } from "../../../redux/actions/bankDetails";

const BankDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    
    const { banks, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.bankDetails);

    useEffect(() => {
        dispatch(getBanks());
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
            dispatch(clearBankSuccess());
        }, 100);
    };

    const handleCreateClick = () => {
        navigate("/settings/bank-setup/add-bank");
    };

    const handleEdit = (bank) => {
        navigate(`/settings/bank-setup/edit-bank/${bank.id}`, { state: { bank } });
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        const result = await dispatch(deleteBank(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
        if (result.success) {
            dispatch(getBanks());
        }
    };

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 330 : 450,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
    };

    if (loading && banks.length === 0) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <div className="card rounded-md border p-4 shadow-md">
                <div className="flex items-center justify-between text-nowrap">
                    <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">
                        Bank Detail's :
                    </div>
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                        onClick={handleCreateClick}
                    >
                        <AiOutlineBank size={20} />
                        Add Bank
                    </Button>
                </div>

                {banks.length === 0 ? (
                    <div className="mt-4 text-center text-gray-500">
                        No bank accounts added.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3">
                        {banks.map((bank) => (
                            <div
                                key={bank.id}
                                className="rounded-xl bg-gradient-to-r from-[#053054] via-[#1b537b] to-[#053054] p-5 text-white shadow-lg"
                            >
                                <div className="mb-4 flex justify-between">
                                    <h2 className="text-base font-bold md:text-lg lg:text-lg">
                                        {bank.bankName}
                                    </h2>
                                    <div className="flex items-center gap-x-4">
                                        <button onClick={() => handleEdit(bank)}>
                                            <PencilLine size={20} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(bank.id)}>
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm md:text-base lg:text-base">
                                    <strong>Branch:</strong> {bank.branchName}
                                </p>
                                <p className="text-sm md:text-base lg:text-base">
                                    <strong>Customer:</strong> {bank.customerName}
                                </p>
                                <p className="text-sm md:text-base lg:text-base">
                                    <strong>Account No:</strong> {bank.accountNumber}
                                </p>
                                <p className="text-sm md:text-base lg:text-base">
                                    <strong>IFSC:</strong> {bank.ifsc}
                                </p>
                                {bank.cifNumber && (
                                    <p className="text-sm md:text-base lg:text-base">
                                        <strong>CIF NO:</strong> {bank.cifNumber}
                                    </p>
                                )}
                                {bank.micr && (
                                    <p className="text-sm md:text-base lg:text-base">
                                        <strong>MICR:</strong> {bank.micr}
                                    </p>
                                )}
                                <p className="text-sm md:text-base lg:text-base">
                                    <strong>Account Type:</strong> {bank.accountType}
                                </p>
                                {bank.customerPan && (
                                    <p className="text-sm md:text-base lg:text-base">
                                        <strong>Customer PAN:</strong> {bank.customerPan}
                                    </p>
                                )}
                                <p className="text-sm md:text-base lg:text-base">
                                    <strong>Address:</strong> {bank.address}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography variant="h6" className="font-semibold">
                            Confirm Delete
                        </Typography>
                        <IconButton
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">
                        Are you sure you want to delete this bank account?
                    </Typography>

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
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarSeverity || "success"}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default BankDetails;