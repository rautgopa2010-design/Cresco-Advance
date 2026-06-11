import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLeads, deleteLeadFile } from "../../redux/actions/leadAndFollowup";
import { CircularProgress, IconButton, Divider, Card, CardContent } from "@mui/material";
import {
    ArrowLeft,
    Building2,
    User,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Layers,
    Flag,
    ClipboardList,
    IndianRupee,
    FileText,
    Eye,
    Trash,
    X,
} from "lucide-react";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { IMAGE_BASE_URL } from "../../utils/api";

const ViewLeads = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { leads, leadLoading } = useSelector((state) => state.leadAndFollowup);

    // Local states for file manager (previous files only)
    const [previousLeadFiles, setPreviousLeadFiles] = useState([]);
    const [selectedFileIndex, setSelectedFileIndex] = useState(null);
    // fileMenuOpen can be false or "old" (since we only support previous files here)
    const [fileMenuOpen, setFileMenuOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        dispatch(getLeads());
    }, [dispatch]);

    // find the lead
    const lead = leads.find((l) => String(l.id) === String(id));

    // initialize previousLeadFiles once lead is available
    useEffect(() => {
        if (lead?.uploadedFiles) {
            setPreviousLeadFiles(Array.isArray(lead.uploadedFiles) ? lead.uploadedFiles : []);
        }
    }, [lead]);

    // Delete handler for previous files
    const handleDeleteOldFile = async (index) => {
        if (!previousLeadFiles[index]) return;

        try {
            // Normalize and extract filename
            const filePath = previousLeadFiles[index];
            const normalizedPath = filePath.replace(/^\/+/, "").replace(/\\/g, "/");
            const fileName = normalizedPath.split("/").pop();

            // Dispatch action to backend to delete
            await dispatch(deleteLeadFile(id, fileName));

            // Remove locally from state
            const updatedFiles = previousLeadFiles.filter((_, i) => i !== index);
            setPreviousLeadFiles(updatedFiles);
        } catch (err) {
            console.error("Failed to delete old file:", err);
        }
    };

    // Renders fallback view for unknown file types (shows filename + download link)
    const renderFallback = (file) => {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="text-sm font-medium text-gray-700">{file.name}</div>
                <a
                    href={file.base64}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                >
                    Open / Download
                </a>
            </div>
        );
    };

    // Renders preview content based on file.type; expects { base64, type, name }
    const renderFilePreview = (file) => {
        if (!file) return null;
        const isMobile = window.innerWidth < 992;

        try {
            // Image
            if (file.type && file.type.startsWith("image/")) {
                return (
                    <img
                        src={file.base64}
                        alt={file.name}
                        className="h-full w-full rounded-lg object-contain"
                    />
                );
            }

            // PDF
            if (file.type === "application/pdf") {
                return !isMobile ? (
                    <iframe
                        src={file.base64}
                        title={file.name}
                        className="h-full w-full rounded-lg"
                    />
                ) : (
                    renderFallback(file)
                );
            }

            // Unsupported office types -> fallback
            const unsupported = [
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];

            if (unsupported.includes(file.type)) {
                return renderFallback(file);
            }

            // Any other unknown type -> fallback
            return renderFallback(file);
        } catch (err) {
            console.error("renderFilePreview error:", err);
            return renderFallback(file);
        }
    };

    if (leadLoading || !lead) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-white to-[#f7efff] px-3 py-6 md:px-6 lg:px-10">
            {/* HEADER */}
            <div className="mb-7 flex items-center gap-4">
                <IconButton
                    onClick={() => navigate(-1)}
                    className="rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:bg-gray-100"
                >
                    <ArrowLeft
                        size={22}
                        className="text-[#053054]"
                    />
                </IconButton>

                <h1 className="bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
                    Lead Details
                </h1>
            </div>

            {/* MAIN CARD */}
            <Card className="rounded-3xl border border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
                <CardContent>
                    {/* TOP GRID */}
                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <Calendar className="text-orange-700" />,
                                label: "Lead Date",
                                value: lead.date,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <Building2 className="text-green-700" />,
                                label: "Company Name",
                                value: lead.companyName,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <User className="text-sky-700" />,
                                label: "Customer Person",
                                value: lead.customerPerson,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },

                            {
                                icon: <ClipboardList className="text-orange-700" />,
                                label: "Lead Source",
                                value: lead.leadSource,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <Flag className="text-green-700" />,
                                label: "Lead Status",
                                value: lead.leadStatus,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <Layers className="text-sky-700" />,
                                label: "Lead Stage",
                                value: lead.leadStage,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },

                            {
                                icon: <IndianRupee className="text-purple-700" />,
                                label: "Expected Amount",
                                value: lead.expectedAmount,
                                gradient: "from-[#faf5ff] to-[#f3e8ff]",
                            },
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Expected Closing Date",
                                value: lead.expectedClosingDate,
                                gradient: "from-[#faf5ff] to-[#f3e8ff]",
                            },
                            {
                                icon: <FileText className="text-purple-700" />,
                                label: "GSTIN No",
                                value: lead.gstinNo,
                                gradient: "from-[#faf5ff] to-[#f3e8ff]",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border border-white/60 bg-gradient-to-br ${item.gradient} p-5 shadow-md backdrop-blur-xl transition-all hover:scale-[1.01] hover:shadow-2xl`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h2 className="text-[15px] font-semibold text-gray-800">{item.label}</h2>
                                </div>
                                <p className="mt-2 text-[15px] text-gray-700">{item.value || "-"}</p>
                            </div>
                        ))}
                    </div>

                    <Divider className="my-10" />

                    {/* CONTACT */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Contact Details
                    </h2>

                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#e0f2fe] to-[#f0f9ff] p-5 shadow-md backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <Phone className="text-sky-700" />
                                <h2 className="text-[15px] font-semibold text-gray-800">Mobile</h2>
                            </div>
                            <p className="mt-2 text-[15px] text-gray-700">{lead.mobile}</p>
                        </div>

                        <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] p-5 shadow-md backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <Mail className="text-blue-700" />
                                <h2 className="text-[15px] font-semibold text-gray-800">Email</h2>
                            </div>
                            <p className="mt-2 text-[15px] text-gray-700">{lead.email}</p>
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* Assigned To */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Assigned To
                    </h2>

                    <div className="rounded-xl border bg-gradient-to-r from-[#f3f4f6] to-[#e5e7eb] p-5 shadow-md backdrop-blur-xl transition-all hover:shadow-xl">
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(lead.assignedTo) ? (
                                lead.assignedTo.map((name, i) => (
                                    <span
                                        key={i}
                                        className="rounded-full bg-gradient-to-r from-[#053054] to-[#4a28ce] px-4 py-1 text-sm text-white shadow-md"
                                    >
                                        {name}
                                    </span>
                                ))
                            ) : (
                                <span className="rounded-full bg-gradient-to-r from-[#053054] to-[#4a28ce] px-4 py-1 text-sm text-white shadow-md">
                                    {lead.assignedTo}
                                </span>
                            )}
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* ADDRESS SECTION */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Address Details
                    </h2>

                    <div className="grid gap-7 md:grid-cols-2">
                        {/* Billing Address */}
                        <div className="rounded-2xl border bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-md transition-all hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-red-700" />
                                <h3 className="text-lg font-semibold text-red-900">Billing Address</h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {lead.billingStreet || "-"}, {lead.billingCity || "-"}, {lead.billingZone || "-"}, {lead.billingState || "-"},{" "}
                                {lead.billingCountry || "-"} – {lead.billingPincode || "-"}
                            </p>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-2xl border bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-md transition-all hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-green-700" />
                                <h3 className="text-lg font-semibold text-green-900">Shipping Address</h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {lead.shippingStreet || "-"}, {lead.shippingCity || "-"}, {lead.shippingZone || "-"}, {lead.shippingState || "-"},{" "}
                                {lead.shippingCountry || "-"} – {lead.shippingPincode || "-"}
                            </p>
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* PRODUCTS */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Products
                    </h2>

                    <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto overflow-y-hidden rounded-2xl border bg-white shadow-lg">
                        <table className="w-full whitespace-nowrap text-left">
                            <thead className="bg-[#eef2ff] text-gray-800">
                                <tr>
                                    <th className="whitespace-nowrap p-3">Product</th>
                                    <th className="whitespace-nowrap p-3">Brand</th>
                                    <th className="whitespace-nowrap p-3">Category</th>
                                    <th className="whitespace-nowrap p-3">Sub Category</th>
                                    <th className="whitespace-nowrap p-3">HSN</th>
                                    <th className="whitespace-nowrap p-3">Description</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lead.products?.length > 0 ? (
                                    lead.products.map((p, i) => (
                                        <tr
                                            key={i}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap p-3">{p.product}</td>
                                            <td className="whitespace-nowrap p-3">{p.productBrand}</td>
                                            <td className="whitespace-nowrap p-3">{p.productCategory}</td>
                                            <td className="whitespace-nowrap p-3">{p.productSubCategory}</td>
                                            <td className="whitespace-nowrap p-3">{p.hsnCode}</td>
                                            <td className="whitespace-nowrap p-3">{p.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-4 text-center text-gray-500"
                                        >
                                            No products
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Divider className="my-10" />

                    {/* FOLLOWUPS */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Follow Ups
                    </h2>

                    {lead.followups?.map((f, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] p-5 shadow-md backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="text-orange-700" />
                                <h2 className="text-[15px] font-semibold text-gray-800">Follow Up</h2>
                            </div>

                            <p className="mt-2 text-[15px] text-gray-700">
                                <strong>Date:</strong> {f.followup_date}
                            </p>

                            <p className="mt-1 text-[15px] text-gray-700">
                                <strong>Description:</strong> {f.followup_desc}
                            </p>
                        </div>
                    )) || <div className="text-gray-500">No follow ups</div>}

                    <Divider className="my-10" />

                    {/* ===== FILES (previousLeadFiles manager) ===== */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Uploaded Files
                    </h2>

                    {/* Previous files grid */}
                    {previousLeadFiles?.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {previousLeadFiles.map((file, i) => {
                                // Normalize path: remove any leading slash and replace backslashes with forward slashes
                                const normalizedPath = String(file).replace(/^\/+/, "").replace(/\\/g, "/");
                                const fileName = normalizedPath.split("/").pop();
                                // if file is already an absolute URL, use it directly
                                const fileUrl = /^(https?:)?\/\//i.test(file) ? file : `${IMAGE_BASE_URL}/${normalizedPath}`;

                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                                const isPdf = /\.pdf$/i.test(fileName);
                                const isExcel = /\.(xls|xlsx)$/i.test(fileName);

                                return (
                                    <div
                                        key={`old-${i}`}
                                        className="relative rounded-2xl border border-white/60 bg-white p-4 shadow-md transition-all hover:scale-[1.02]"
                                    >
                                        {isImage ? (
                                            <img
                                                src={fileUrl}
                                                alt={fileName}
                                                className="h-40 w-full rounded-xl object-cover shadow"
                                            />
                                        ) : isPdf ? (
                                            <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100">
                                                <FaFilePdf className="h-10 w-10 text-red-500" />
                                            </div>
                                        ) : isExcel ? (
                                            <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100">
                                                <FaFileExcel className="h-10 w-10 text-green-500" />
                                            </div>
                                        ) : (
                                            <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 px-2">
                                                <span className="break-all text-xs text-gray-700">{fileName}</span>
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block truncate text-blue-600 underline"
                                            >
                                                {fileName}
                                            </a>

                                            <div
                                                className="cursor-pointer rounded p-1 text-gray-600 hover:bg-gray-100"
                                                onClick={() => {
                                                    setSelectedFileIndex(i);
                                                    setFileMenuOpen("old");

                                                    setTimeout(() => {
                                                        const modal = document.querySelector(".fixed.inset-0.z-\\[999\\]");
                                                        if (modal) {
                                                            modal.scrollIntoView({ behavior: "smooth", block: "center" });
                                                        }
                                                    }, 100);
                                                }}
                                            >
                                                <span className="text-xl font-bold">⋮</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-gray-500">No files uploaded.</div>
                    )}

                    {/* File Menu Modal */}
                    {fileMenuOpen && selectedFileIndex !== null && (
                        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
                            <div className="relative w-full max-w-xs rounded bg-white p-4 shadow-lg">
                                <div
                                    className="absolute right-2 top-2 cursor-pointer"
                                    onClick={() => {
                                        setFileMenuOpen(false);
                                        setSelectedFileIndex(null);
                                    }}
                                >
                                    <X className="h-5 w-5" />
                                </div>
                                <h5 className="mb-3 font-semibold">File Options</h5>
                                <div className="flex justify-around">
                                    <button
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                            // Build preview object for previous file
                                            const raw = previousLeadFiles[selectedFileIndex];
                                            const normalizedPath = String(raw).replace(/^\/+/, "").replace(/\\/g, "/");
                                            const fileName = normalizedPath.split("/").pop();
                                            const fileUrl = /^(https?:)?\/\//i.test(raw) ? raw : `${IMAGE_BASE_URL}/${normalizedPath}`;

                                            // Detect type from extension
                                            let type = "application/octet-stream";
                                            if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
                                                type = "image/" + fileName.split(".").pop().toLowerCase();
                                            } else if (fileName.endsWith(".pdf")) {
                                                type = "application/pdf";
                                            } else if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
                                                type = "application/vnd.ms-excel";
                                            } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
                                                type = "application/msword";
                                            }

                                            setPreviewFile({ base64: fileUrl, type, name: fileName });
                                            setFileMenuOpen(false);
                                        }}
                                    >
                                        <Eye size={18} /> Preview
                                    </button>

                                    <button
                                        className="flex items-center gap-2 text-red-600 hover:text-red-800"
                                        onClick={() => {
                                            // Delete previous file
                                            handleDeleteOldFile(selectedFileIndex);
                                            setFileMenuOpen(false);
                                            setSelectedFileIndex(null);
                                        }}
                                    >
                                        <Trash size={18} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Modal */}
                    {previewFile && (
                        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
                            <div className="relative flex h-[85vh] w-[95vw] max-w-[1200px] flex-col overflow-hidden rounded-lg bg-white shadow-lg">
                                {/* Close Button */}
                                <button
                                    className="absolute right-3 top-3 z-20 rounded-full bg-gray-200 p-2 transition hover:bg-gray-300"
                                    onClick={() => setPreviewFile(null)}
                                >
                                    <X className="h-5 w-5 text-gray-700" />
                                </button>

                                {/* File Preview Content */}
                                <div className="flex h-full w-full items-center justify-center bg-gray-50 p-5">{renderFilePreview(previewFile)}</div>
                            </div>
                        </div>
                    )}

                    <Divider className="my-10" />

                    {/* DESCRIPTION */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Description
                    </h2>

                    <p className="rounded-2xl border border-white/60 bg-[#f9fafb] p-5 text-[15px] text-gray-700 shadow-md backdrop-blur-xl">
                        {lead.description || "No description available"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ViewLeads;
