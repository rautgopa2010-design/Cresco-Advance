import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfile, uploadProfileImage, removeProfileImage } from "../../redux/actions/profile";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { CircularProgress, Typography, Snackbar, Alert, Modal, Box, IconButton, useMediaQuery } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaUserEdit } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { MdAssignment, MdInventory2 } from "react-icons/md";
import { X } from "lucide-react";
import { IMAGE_BASE_URL } from "../../utils/api";
import { getAssignedIncentives } from "../../redux/actions/assignedIncentives";
import { getIncentives } from "../../redux/actions/incentive";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { profile, snackbarMessage, snackbarSeverity } = useSelector((state) => state.profile);
    const [initialLoad, setInitialLoad] = useState(true);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const { assignedIncentives } = useSelector((state) => state.assignedIncentives);
    const { incentives } = useSelector((state) => state.incentive);

    // Hardcoded active package data (in a real app, fetch this from Redux/API)
    const activePackage = user?.packageDetails;

    const getMonthsCount = (durationType) => {
        if (!durationType) return 1;
        const match = durationType.trim().match(/^(\d+)\s*Months?$/i);
        return match ? parseInt(match[1], 10) : 1;
    };
    const months = getMonthsCount(activePackage?.durationType);

    const totalPkgCost = activePackage?.maxUsers * activePackage?.price * months;

    // Calculate days left and formatted dates
    const now = new Date();
    const startDate = new Date(user.packageStartDate);
    const expiryDate = new Date(user.packageExpiryDate);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    const formattedStartDate = startDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const formattedEndDate = expiryDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([dispatch(getProfile()), dispatch(getAssignedIncentives()), dispatch(getIncentives())]);
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
                setProfileImagePreview(null); // clear preview so it falls back to profile.profileImage
                if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                }

                // ✅ Fetch latest profile so trash icon appears immediately
                dispatch(getProfile());
            } else {
                setUploading(false);
            }
        }
    }, [snackbarMessage, snackbarSeverity, dispatch]);

    useEffect(() => {
        if (incentives && user?.id) {
            const userIncentives = incentives.filter((incentive) => incentive.employee_id === user.id);
        }
    }, [incentives, user]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => dispatch(clearSnackbar()), 100);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        const imageUrl = URL.createObjectURL(file);

        setProfileImagePreview(imageUrl);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        await dispatch(uploadProfileImage(selectedFile));
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
        dispatch(removeProfileImage(selectedDeleteId));
        setSnackbarOpen(true);
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const totalDays = Math.ceil((expiryDate - startDate) / (1000 * 60 * 60 * 24));

    let daysLeftColor = "text-green-600";
    if (daysLeft <= totalDays / 4) {
        daysLeftColor = "text-red-600";
    } else if (daysLeft <= totalDays / 2) {
        daysLeftColor = "text-orange-600";
    }

    if (initialLoad) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!profile) {
        return <div className="flex h-screen w-full items-center justify-center text-gray-500">No profile data found.</div>;
    }

    return (
        <div className="">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between text-nowrap">
                <Typography
                    variant="h6"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text !text-2xl !font-extrabold tracking-wide text-transparent"
                >
                    Profile
                </Typography>
                <Button
                    onClick={() => navigate(`/profile/edit-profile/${profile.id}`)}
                    variant="gradient"
                    className="rounded-full bg-green-200 px-4 py-2"
                >
                    <FaUserEdit
                        size={25}
                        className="text-green-700"
                    />
                </Button>
            </div>

            {/* Main Card */}
            <div className="space-y-8 rounded-2xl border border-gray-100 bg-white/80 shadow-2xl backdrop-blur-xl transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] md:p-10">
                <div className="flex flex-col items-center gap-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 px-6 pb-6 shadow-md">
                    {/* Logo */}
                    <div className="flex flex-col items-center lg:items-center">
                        {profileImagePreview ? (
                            <>
                                <img
                                    src={profileImagePreview}
                                    alt="Logo Preview"
                                    className="h-36 w-36 rounded-full border-2 border-[#053054] object-cover shadow-md"
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
                                                setProfileImagePreview(null);
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
                        ) : profile.profileImage ? (
                            <div className="relative inline-block">
                                <img
                                    src={`${IMAGE_BASE_URL}${profile.profileImage}`}
                                    alt="Company Logo"
                                    className="h-36 w-36 rounded-full border border-gray-200 object-cover shadow-md"
                                />

                                {/* Trash Icon */}
                                <button
                                    onClick={handleDeleteClick}
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white shadow-md hover:bg-red-600"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div
                                    className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border-2 border-[#053054] bg-gray-100 text-center font-bold text-[#053054]"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Click to add Profile
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="text-center">
                        <h2 className="flex items-center justify-center gap-2 text-base font-bold text-gray-800 md:text-lg lg:text-2xl">
                            <FaCircleUser className="text-blue-500" />
                            {[profile.salutation, profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ")}
                        </h2>
                        <p className="text-base font-bold text-gray-700">({user.role_name})</p>
                        <p className="mt-2 text-base font-bold text-gray-600">{profile.companyName}</p>

                        {profile.gstinNumber && profile.gstinNumber.trim() !== "" && (
                            <p className="mt-1 text-sm font-bold text-gray-500">GSTIN: {profile.gstinNumber}</p>
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
                            <span className="text-gray-700">{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                            <div className="rounded-full bg-green-500 p-3 text-white">
                                <FaPhone />
                            </div>
                            <span className="text-gray-700">{profile.mobile}</span>
                        </div>
                    </div>
                </div>

                {/* Current Active Package */}
                {activePackage && activePackage?.isActive && user.role_name === "Super Admin" && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-blue-500 pb-2 text-lg font-semibold text-gray-900">✨ Current Active Package</h3>

                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-cyan-600 to-teal-600 p-1 shadow-2xl transition-all hover:scale-[1.01]">
                            <div className="rounded-3xl bg-white/40 p-6 text-gray-900 backdrop-blur-xl md:p-8 lg:p-10">
                                <div className="flex flex-col gap-4 md:items-center md:justify-between lg:flex-row">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-lg backdrop-blur-md">
                                            <MdInventory2
                                                size={30}
                                                className="text-blue-700"
                                            />
                                        </div>

                                        <div>
                                            <h4 className="text-2xl font-bold tracking-wide text-gray-900">{activePackage?.packageName}</h4>
                                            <p className="text-lg text-gray-700">
                                                Status: <span className="font-semibold text-green-700">Active</span>
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => navigate("/choose-package", { state: { from: "expired" } })}
                                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 md:text-base"
                                    >
                                        Upgrade Package
                                    </Button>
                                </div>

                                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3">
                                    <div className="rounded-2xl bg-white p-4 shadow-md">
                                        <p className="text-sm text-gray-600">Max Users</p>
                                        <p className="mt-1 text-2xl font-bold text-gray-900">{activePackage?.maxUsers}</p>
                                    </div>

                                    <div className="blink-card rounded-2xl bg-white p-4 shadow-md">
                                        <p className="text-sm text-gray-600">Due Days</p>
                                        <p className={`mt-1 text-2xl font-bold ${daysLeftColor}`}>{daysLeft} Days</p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4 shadow-md">
                                        <p className="text-sm text-gray-600">Start Date</p>
                                        <p className="mt-1 text-xl font-semibold text-sky-600">{formattedStartDate}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4 shadow-md">
                                        <p className="text-sm text-gray-600">End Date</p>
                                        <p className="mt-1 text-xl font-semibold text-red-600">{formattedEndDate}</p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4 shadow-md lg:col-span-2">
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="mt-1 text-2xl font-bold text-green-700">
                                            {activePackage?.symbol}
                                            {totalPkgCost} {activePackage?.currency}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4 shadow-md lg:col-span-3">
                                        <p className="text-sm text-gray-600">Description</p>
                                        <p className="mt-1 font-medium text-gray-900">{activePackage?.description.replace(/<[^>]*>/g, "")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Permanent Address */}
                <div>
                    <h3 className="mb-4 border-b-2 border-red-500 pb-2 text-lg font-semibold text-gray-800">🏠 Permanent Address</h3>
                    <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
                        <div className="rounded-full bg-red-500 p-3 text-white">
                            <FaMapMarkerAlt />
                        </div>
                        <span className="text-gray-700">
                            {[
                                profile.permanantStreet,
                                profile.permanantCity,
                                profile.permanantState,
                                profile.permanantPincode,
                                profile.permanantCountry,
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
                                profile.alternateStreet,
                                profile.alternateCity,
                                profile.alternateState,
                                profile.alternatePincode,
                                profile.alternateCountry,
                            ]
                                .filter(Boolean)
                                .join(", ") || "No Alternate Address added"}
                        </span>
                    </div>
                </div>

                {/* Assigned Incentives */}
                {!(user?.user_type === "provider" || user?.role_name === "Super Admin") && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-green-500 pb-2 text-lg font-semibold text-gray-800">🎯 Assigned Incentives</h3>

                        {assignedIncentives && assignedIncentives.filter((a) => a.employee_id === profile.id).length > 0 ? (
                            <div className="space-y-4">
                                {assignedIncentives
                                    .filter((a) => a.employee_id === profile.id)
                                    .map((a) => (
                                        <div
                                            key={a.id}
                                            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gradient-to-r from-green-50 to-emerald-100 p-4 shadow-md transition hover:scale-[1.01] hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-green-500 p-2 text-white shadow">
                                                    <MdAssignment size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        Formula Type: <span className="text-green-700">{a.formula?.formula_type || "N/A"}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Assigned Month: <strong>{a.month}</strong> | Assigned Date: {a.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ml-10 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                                <span>
                                                    <strong>Product:</strong> {a.selectedProductName || a.product?.products || "N/A"}
                                                </span>
                                                <span>
                                                    <strong>Targeted Amount:</strong> ₹{a.targeted_amount}
                                                </span>
                                                <span>
                                                    <strong>Eligible Amount:</strong> ₹{a.eligible_amount}
                                                </span>
                                                {a.formula?.formula_config?.bonus && (
                                                    <span>
                                                        <strong>Bonus:</strong> ₹{a.formula.formula_config.bonus}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-xs italic text-gray-600">
                                                📌 You have been assigned this incentive for <b>{a.month}</b>. To qualify, complete the target of{" "}
                                                <b>₹{a.targeted_amount}</b> on <b>{a.selectedProductName}</b>. Currently, you are eligible for{" "}
                                                <b>₹{a.eligible_amount}</b>.
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-400 bg-gray-50 p-6 text-center text-gray-500">
                                <MdAssignment className="text-4xl text-gray-400" />
                                <p className="font-semibold text-gray-600">No Incentives Assigned Yet</p>
                                <p className="text-sm text-gray-400">
                                    Your Super Admin hasn’t assigned you any incentive plan. Once assigned, it will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Achieved Incentives */}
                {!(user?.user_type === "provider" || user?.role_name === "Super Admin") && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-blue-500 pb-2 text-lg font-semibold text-gray-800">🏆 Achieved Incentives</h3>

                        {incentives && incentives.filter((inc) => inc.employee_id === profile.id).length > 0 ? (
                            <div className="space-y-4">
                                {incentives
                                    .filter((inc) => inc.employee_id === profile.id)
                                    .map((inc) => (
                                        <div
                                            key={inc.id}
                                            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 to-blue-200 p-4 shadow-md transition hover:scale-[1.01] hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-blue-500 p-2 text-white shadow">
                                                    <MdAssignment size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        Formula Type:{" "}
                                                        <span className="text-blue-700">
                                                            {inc.assignedIncentive?.formula?.formula_type || inc.formula?.formula_type || "N/A"}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Assigned Month: <strong>{inc.assignedIncentive?.month || inc.month}</strong> | Assigned Date:{" "}
                                                        {inc.assignedIncentive?.date || inc.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ml-10 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                                <span>
                                                    <strong>Product:</strong>{" "}
                                                    {inc.assignedIncentive?.selectedProductName || inc.selectedProductName || "N/A"}
                                                </span>
                                                <span>
                                                    <strong>Targeted Amount:</strong> ₹
                                                    {inc.assignedIncentive?.targeted_amount || inc.targeted_amount || 0}
                                                </span>
                                                <span>
                                                    <strong>Eligible Amount:</strong> ₹
                                                    {inc.assignedIncentive?.eligible_amount || inc.eligible_amount || 0}
                                                </span>
                                                <span>
                                                    <strong>Achieved Sales:</strong> ₹{inc.achieved_sales || 0}
                                                </span>
                                                <span>
                                                    <strong>Display Rate:</strong> {inc.display_rate || "N/A"}
                                                </span>
                                                <span>
                                                    <strong>Status:</strong>{" "}
                                                    <span
                                                        className={`font-semibold ${
                                                            inc.status === "paid"
                                                                ? "text-green-600"
                                                                : inc.status === "partially-paid"
                                                                  ? "text-orange-600"
                                                                  : "text-red-600"
                                                        }`}
                                                    >
                                                        {inc.status === "paid"
                                                            ? "Paid"
                                                            : inc.status === "partially-paid"
                                                              ? "Partially Paid"
                                                              : "Pending"}
                                                    </span>
                                                </span>
                                                <span>
                                                    <strong>Calculated Incentive:</strong> ₹{inc.calculated_incentive || 0}
                                                </span>
                                                <span>
                                                    <strong>Paid Amount:</strong> ₹{inc.paid_amount || 0}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs italic text-gray-600">
                                                📌 For <b>{inc.assignedIncentive?.month || inc.month}</b>, you achieved <b>₹{inc.achieved_sales}</b>{" "}
                                                in sales, resulting in an incentive of <b>₹{inc.calculated_incentive}</b> at a rate of{" "}
                                                <b>{inc.display_rate}</b>.
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-400 bg-gray-50 p-6 text-center text-gray-500">
                                <MdAssignment className="text-4xl text-gray-400" />
                                <p className="font-semibold text-gray-600">No Achieved Incentives Yet</p>
                                <p className="text-sm text-gray-400">Once you achieve sales targets, your calculated incentives will appear here.</p>
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this profile image?</Typography>

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
                    severity={snackbarSeverity || "info"}
                    onClose={handleSnackbarClose}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Profile;
