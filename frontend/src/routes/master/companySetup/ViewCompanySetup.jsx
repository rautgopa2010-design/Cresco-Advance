import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCompanySetup, uploadCompanyLogo, removeCompanyLogo } from "../../../redux/actions/companySetup";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { CircularProgress, Typography, Snackbar, Alert, Modal, Box, IconButton, useMediaQuery } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaTrash, FaEdit } from "react-icons/fa";
import { X } from "lucide-react";
import { IMAGE_BASE_URL } from "../../../utils/api";

const ViewCompanySetup = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const { companySetup, snackbarMessage, snackbarSeverity } = useSelector((state) => state.companySetup);
    const [initialLoad, setInitialLoad] = useState(true);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoStyle, setLogoStyle] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([dispatch(getCompanySetup())]);
            } finally {
                setInitialLoad(false);
            }
        };
        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);

            if (snackbarSeverity === "success") {
                setUploading(false);
                setSelectedFile(null);
                setLogoPreview(null); // clear preview so it falls back to companySetup.companyLogo
                if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                }

                if (companySetup?.companyLogo) {
                    // Use org_id specific key
                    const orgId = user?.org_id || "default";
                    const logoKey = `companyLogo_${orgId}`;
                    localStorage.setItem(logoKey, companySetup.companyLogo);
                
                    // 🔔 Dispatch custom event for Sidebar
                    window.dispatchEvent(new CustomEvent("companyLogoUpdated", { 
                        detail: { orgId, logo: companySetup.companyLogo } 
                    }));
                }                

                // ✅ Fetch latest company setup so trash icon appears immediately
                dispatch(getCompanySetup());
            } else {
                setUploading(false);
            }
        }
    }, [snackbarMessage, snackbarSeverity, dispatch]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => dispatch(clearSnackbar()), 100);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        const imageUrl = URL.createObjectURL(file);
        let style = {
            maxWidth: "200px",
            maxHeight: "200px",
            objectFit: "cover",
            border: "2px solid #053054",
        };

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            if (img.width === img.height) style.borderRadius = "50%";
            else style.borderRadius = "8px";
            setLogoStyle(style);
        };

        setLogoPreview(imageUrl);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        await dispatch(uploadCompanyLogo(selectedFile));
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

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        const orgId = user?.org_id || "default";
        const logoKey = `companyLogo_${orgId}`;
        dispatch(removeCompanyLogo(selectedDeleteId));
        localStorage.removeItem(logoKey);
    
        // 🔔 Notify sidebar that logo was removed
        window.dispatchEvent(new CustomEvent("companyLogoUpdated", { 
            detail: { orgId, logo: null } 
        }));
    
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };    

    if (initialLoad) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!companySetup) {
        return <div className="flex h-screen w-full items-center justify-center text-gray-500">No company setup data found.</div>;
    }

    return (
        <div className="">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between text-nowrap">
                <Typography
                    variant="h6"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text !text-2xl !font-extrabold tracking-wide text-transparent"
                >
                    Company Setup
                </Typography>
                <Button
                    onClick={() => navigate(`/settings/company-setup/edit-company-setup/${companySetup.id}`)}
                    variant="gradient"
                    className="rounded-full bg-green-200 px-4 py-2"
                >
                    <FaEdit
                        size={25}
                        className="text-green-700"
                    />
                </Button>
            </div>

            {/* Main Card */}
            <div className="space-y-8 rounded-2xl border border-gray-100 bg-white/80 shadow-2xl backdrop-blur-xl transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] md:p-10">
                <div className="flex flex-col items-center gap-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-md lg:flex-row lg:items-start lg:gap-10">
                    {/* Logo */}
                    <div className="flex flex-col items-center lg:items-center">
                        {logoPreview ? (
                            <>
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    style={logoStyle}
                                />

                                {selectedFile && (
                                    <div className="mt-3 flex gap-3">
                                        {/* Upload Button */}
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="flex items-center justify-center rounded-md border-2 border-[#053054] px-3 py-1 text-sm font-semibold text-[#053054] transition hover:bg-[#053054] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <CircularProgress
                                                    size={16}
                                                    color="inherit"
                                                />
                                            ) : (
                                                "Upload"
                                            )}
                                        </button>

                                        {/* Cancel Button */}
                                        <button
                                            onClick={() => {
                                                setLogoPreview(null);
                                                setLogoStyle({});
                                                setSelectedFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = null;
                                                }
                                            }}
                                            disabled={uploading}
                                            className="rounded-md border-2 border-red-500 px-3 py-1 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : companySetup.companyLogo ? (
                            <div className="relative inline-block">
                                <img
                                    src={`${IMAGE_BASE_URL}${companySetup.companyLogo}`}
                                    alt="Company Logo"
                                    className="h-32 w-auto rounded-xl border border-gray-200 object-cover shadow-md"
                                />

                                {/* Trash Icon (Delete Button) */}
                                <button
                                    onClick={handleDeleteClick}
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white shadow-md hover:bg-red-600"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ) : (
                            <div>
                                {/* Placeholder Box */}
                                <div
                                    className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-md border-2 border-[#053054] bg-gray-100 text-center font-bold text-[#053054]"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Click to add Logo
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {/* Company Info */}
                    <div className="text-center lg:text-left">
                        <h2 className="flex items-center justify-center gap-2 text-base font-bold text-gray-800 md:text-lg lg:justify-start lg:text-2xl">
                            <FaBuilding className="text-blue-500" />
                            {companySetup.companyName}
                        </h2>
                        <p className="mt-2 text-base font-bold text-gray-600">
                            {[companySetup.salutation, companySetup.firstName, companySetup.middleName, companySetup.lastName]
                                .filter(Boolean)
                                .join(" ")}
                        </p>

                        {companySetup.gstinNumber && companySetup.gstinNumber.trim() !== "" && (
                            <p className="mt-1 text-sm font-bold text-gray-500">GSTIN: {companySetup.gstinNumber}</p>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="mb-4 border-b-2 border-blue-500 pb-2 text-lg font-semibold text-gray-800">📞 Contact Information</h3>
                    <div className="grid gap-4 md:grid lg:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                            <div className="rounded-full bg-blue-500 p-3 text-white">
                                <FaEnvelope />
                            </div>
                            <span className="text-gray-700">{companySetup.email}</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                            <div className="rounded-full bg-green-500 p-3 text-white">
                                <FaPhone />
                            </div>
                            <span className="text-gray-700">{companySetup.mobile}</span>
                        </div>
                    </div>
                </div>

                {/* Permanent Address */}
                <div>
                    <h3 className="mb-4 border-b-2 border-red-500 pb-2 text-lg font-semibold text-gray-800">🏠 Permanent Address</h3>
                    <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                        <div className="rounded-full bg-red-500 p-3 text-white">
                            <FaMapMarkerAlt />
                        </div>
                        <span className="text-gray-700">
                            {[
                                companySetup.permanantStreet,
                                companySetup.permanantCity,
                                companySetup.permanantState,
                                companySetup.permanantPincode,
                                companySetup.permanantCountry,
                            ]
                                .filter(Boolean)
                                .join(", ") || "No Permanent Address added"}
                        </span>
                    </div>
                </div>

                {/* Alternate Address */}
                <div>
                    <h3 className="mb-4 border-b-2 border-purple-500 pb-2 text-lg font-semibold text-gray-800">📍 Alternate Address</h3>
                    <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                        <div className="rounded-full bg-purple-500 p-3 text-white">
                            <FaMapMarkerAlt />
                        </div>
                        <span className="text-gray-700">
                            {[
                                companySetup.alternateStreet,
                                companySetup.alternateCity,
                                companySetup.alternateState,
                                companySetup.alternatePincode,
                                companySetup.alternateCountry,
                            ]
                                .filter(Boolean)
                                .join(", ") || "No Alternate Address added"}
                        </span>
                    </div>
                </div>

                {/* Support Info */}
                <div>
                    <h3 className="mb-4 border-b-2 border-orange-500 pb-2 text-lg font-semibold text-gray-800">💡 Support</h3>
                    <div className="grid gap-4 md:grid lg:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg bg-indigo-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                            <div className="rounded-full bg-indigo-500 p-3 text-white">
                                <FaGlobe />
                            </div>
                            <span className="text-gray-700">{companySetup.supportedEmail || "No supported email added"}</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-pink-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                            <div className="rounded-full bg-pink-500 p-3 text-white">
                                <FaPhone />
                            </div>
                            <span className="text-gray-700">{companySetup.supportedMobile || "No supported mobile added"}</span>
                        </div>
                    </div>
                </div>

                {/* Incentive Formulas Section */}
                {user?.role_name === "Super Admin" && (
                    <div className="mt-10">
                        <h3 className="mb-4 border-b-2 border-blue-500 pb-2 text-lg font-semibold text-gray-800">🎯 Incentive Formulas</h3>

                        {companySetup?.formulas && companySetup.formulas.length > 0 ? (
                            <div className="space-y-8">
                                {/* Fixed Formula */}
                                {companySetup.formulas.some((f) => f.formula_type === "fixed") && (
                                    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
                                        <h4 className="mb-3 text-base font-bold text-blue-800">1️⃣ Fixed Formula</h4>
                                        <p className="mb-3 text-sm text-gray-600">Incentive = Sales Amount × Commission Rate</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">Commission Rate:</span>
                                            <span className="font-semibold text-blue-700">
                                                {companySetup.formulas.find((f) => f.formula_type === "fixed")?.formula_config?.rate
                                                    ? companySetup.formulas.find((f) => f.formula_type === "fixed").formula_config.rate * 100
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Slab Formula */}
                                {companySetup.formulas.some((f) => f.formula_type === "slab") && (
                                    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
                                        <h4 className="mb-3 text-base font-bold text-purple-800">2️⃣ Slab Formula</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Incentive = (Rate₁ × Sales in Slab₁) + (Rate₂ × Sales in Slab₂) + ...
                                        </p>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse rounded-lg bg-white text-sm shadow-md">
                                                <thead>
                                                    <tr className="bg-purple-200 font-semibold text-purple-800">
                                                        <th className="p-2 text-left">Min</th>
                                                        <th className="p-2 text-left">Max</th>
                                                        <th className="p-2 text-left">Rate (%)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {companySetup.formulas
                                                        .find((f) => f.formula_type === "slab")
                                                        ?.formula_config?.slabs?.map((slab, i) => (
                                                            <tr
                                                                key={i}
                                                                className="border-t transition hover:bg-purple-50"
                                                            >
                                                                <td className="p-2">{slab.min}</td>
                                                                <td className="p-2">{slab.max}</td>
                                                                <td className="p-2">{slab.rate * 100}%</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Bonus Formula */}
                                {companySetup.formulas.some((f) => f.formula_type === "bonus") && (
                                    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
                                        <h4 className="mb-3 text-base font-bold text-green-800">3️⃣ Bonus Formula</h4>
                                        <p className="mb-3 text-sm text-gray-600">Incentive = Fixed Bonus (if Sales ≥ Target)</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">Bonus Amount:</span>
                                            <span className="font-semibold text-green-700">
                                                ₹{companySetup.formulas.find((f) => f.formula_type === "bonus")?.formula_config?.bonus || 0}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Incentive Partition */}
                                {companySetup.formulas.some((f) => f.formula_type === "partition") && (
                                    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md">
                                        <h4 className="mb-3 text-base font-bold text-orange-800">4️⃣ Incentive Partition</h4>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Distribution of incentive (%) among different roles (applied only to Fixed and Slab formulas)
                                        </p>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse rounded-lg bg-white text-sm shadow-md">
                                                <thead>
                                                    <tr className="bg-orange-200 font-semibold text-orange-800">
                                                        <th className="p-2 text-left">Role</th>
                                                        <th className="p-2 text-left">Distribution (%)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(
                                                        companySetup.formulas.find((f) => f.formula_type === "partition")?.formula_config || {},
                                                    ).map(([role, values], i) => (
                                                        <tr
                                                            key={i}
                                                            className="border-t transition hover:bg-orange-50"
                                                        >
                                                            <td className="p-2 font-medium text-gray-700">{role}</td>
                                                            <td className="p-2 text-gray-600">
                                                                {Object.entries(values)
                                                                    .map(([r, v]) => `${r}: ${v}%`)
                                                                    .join(", ")}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // 🚀 Attractive placeholder message if no formulas exist
                            <div className="mt-6 rounded-xl border border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-100 p-8 text-center shadow-inner">
                                <h4 className="mb-2 text-xl font-bold text-blue-700">No Incentive Setup Found 💡</h4>
                                <p className="mb-4 text-gray-600">
                                    You haven’t configured your incentive formulas yet. Set up custom formulas to automate incentive calculations for
                                    your team.
                                </p>
                                <Button
                                    onClick={() => navigate(`/settings/company-setup/edit-company-setup/${companySetup.id}`)}
                                    variant="gradient"
                                    className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2 text-white shadow-md transition hover:scale-105 hover:shadow-lg"
                                >
                                    Set Incentive Setup
                                </Button>
                            </div>
                        )}
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this logo?</Typography>

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
                    severity={snackbarSeverity}
                    onClose={handleSnackbarClose}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ViewCompanySetup;
