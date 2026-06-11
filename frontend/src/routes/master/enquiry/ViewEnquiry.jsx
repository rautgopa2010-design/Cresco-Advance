import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCustomers, deleteCustomerContact, updateCustomerContact } from "../../../redux/actions/customer";
import {
    CircularProgress,
    IconButton,
    Divider,
    Card,
    CardContent,
    Modal,
    Box,
    Typography,
    TextField,
    Autocomplete,
    Snackbar,
    Alert,
    useMediaQuery,
} from "@mui/material";
import { ArrowLeft, User, Building2, Phone, Mail, Calendar, Users, MapPin, PencilLine, Trash, X } from "lucide-react";
import { Button } from "@material-tailwind/react";

const ViewEnquiry = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { customers, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.customer);
    const { salutations } = useSelector((state) => state.salutation);
    const { countryCode } = useSelector((state) => state.countryCode);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localMessage, setLocalMessage] = useState("");
    const [localSeverity, setLocalSeverity] = useState("error");

    // Modals state
    const [editContactOpen, setEditContactOpen] = useState(false);
    const [deleteContactOpen, setDeleteContactOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Edit form state
    const [contactForm, setContactForm] = useState({
        salutation: "",
        firstName: "",
        middleName: "",
        lastName: "",
        selectedPhoneCode: "",
        mobile: "",
        email: "",
        tag: "",
        designation: "",
    });

    const [contactErrors, setContactErrors] = useState({});

    useEffect(() => {
        dispatch(getCustomers());
    }, [dispatch]);

    const enquiry = customers.find((c) => String(c.id) === String(id));

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
    
            // Close modal ONLY on success for contact addition
            if (
                snackbarSeverity === "success" &&
                snackbarMessage.includes("Contact updated successfully")
            ) {
                setEditContactOpen(false);
                // Reset form on success
                setContactForm({
                    salutation: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    selectedPhoneCode: "",
                    mobile: "",
                    email: "",
                    tag: "",
                    designation: "",
                });
                setContactErrors({});
            }
        }
    }, [snackbarMessage, snackbarSeverity]);

    if (loading || !enquiry) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <CircularProgress />
            </div>
        );
    }

    const fullName = `${enquiry.salutation || ""} ${enquiry.firstName || ""} ${enquiry.middleName || ""} ${enquiry.lastName || ""}`.trim();
    const contacts = enquiry?.contacts || [];

    // === Edit Contact ===
    const handleEditContact = (contact) => {
        const [code, mobileNum] = contact.mobile?.split(" ") || ["", ""];
        setSelectedContact(contact);
        setContactForm({
            salutation: contact.salutation || "",
            firstName: contact.firstName || "",
            middleName: contact.middleName || "",
            lastName: contact.lastName || "",
            selectedPhoneCode: code || "",
            mobile: mobileNum || "",
            email: contact.email || "",
            tag: contact.tag || "",
            designation: contact.designation || "",
        });
        setContactErrors({});
        setEditContactOpen(true);
    };

    const handleContactChange = (field) => (e) => {
        const value = e.target.value;
        setContactForm((prev) => ({ ...prev, [field]: value }));
        setContactErrors((prev) => ({ ...prev, [field]: false }));
    };

    const validateContact = () => {
        let tempErrors = {};
        let hasError = false;

        const required = {
            salutation: "Salutation",
            firstName: "First Name",
            lastName: "Last Name",
            selectedPhoneCode: "Phone Code",
            mobile: "Mobile",
            email: "Email",
        };

        for (const [key, label] of Object.entries(required)) {
            if (!contactForm[key]?.trim()) {
                tempErrors[key] = true;
                hasError = true;
            }
        }

        if (hasError) {
            setContactErrors(tempErrors);
            setLocalMessage("Please fill all required fields.");
            setLocalSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        if (!/^[0-9]{10}$/.test(contactForm.mobile)) {
            tempErrors.mobile = true;
            setContactErrors(tempErrors);
            setLocalMessage("Mobile number must be exactly 10 digits");
            setLocalSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contactForm.email)) {
            tempErrors.email = true;
            setContactErrors(tempErrors);
            setLocalMessage("Enter a valid email address");
            setLocalSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        return true;
    };

    const handleUpdateContact = () => {
        if (!validateContact()) return;

        const data = {
            salutation: contactForm.salutation,
            firstName: contactForm.firstName,
            middleName: contactForm.middleName,
            lastName: contactForm.lastName,
            mobile: `${contactForm.selectedPhoneCode} ${contactForm.mobile}`.trim(),
            email: contactForm.email,
            tag: contactForm.tag,
            designation: contactForm.designation,
        };

        dispatch(updateCustomerContact(enquiry.id, selectedContact.id, data));
    };

    // === Delete Contact ===
    const handleDeleteContactClick = (contact) => {
        setSelectedContact(contact);
        setDeleteContactOpen(true);
    };

    const confirmDeleteContact = () => {
        dispatch(deleteCustomerContact(enquiry.id, selectedContact.id));
        setDeleteContactOpen(false);
        setSelectedContact(null);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8f1ff] via-white to-[#f0e8ff] px-0 md:px-0 lg:px-8">
            {/* HEADER */}
            <div className="mb-7 flex items-center gap-4 pt-6">
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
                    Enquiry Details
                </h1>
            </div>

            {/* MAIN CARD */}
            <Card className="rounded-3xl border border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
                <CardContent>
                    {/* TOP GRID */}
                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <Building2 className="text-orange-700" />,
                                label: "Company",
                                value: enquiry.companyName,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <User className="text-green-700" />,
                                label: "Customer Name",
                                value: fullName,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <Phone className="text-sky-700" />,
                                label: "Mobile",
                                value: enquiry.mobile,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },
                            {
                                icon: <Mail className="text-orange-700" />,
                                label: "Email",
                                value: enquiry.email,
                                gradient: "from-[#fff7ed] to-[#ffedd5]",
                            },
                            {
                                icon: <Users className="text-green-700" />,
                                label: "Category",
                                value: enquiry.customerCategory,
                                gradient: "from-[#f0fdf4] to-[#dcfce7]",
                            },
                            {
                                icon: <Building2 className="text-sky-700" />,
                                label: "Industry",
                                value: enquiry.industry,
                                gradient: "from-[#f0f9ff] to-[#e0f2fe]",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border border-white/60 bg-gradient-to-br ${item.gradient} p-5 shadow-md backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-2xl`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h2 className="text-[15px] font-semibold text-gray-800">{item.label}</h2>
                                </div>
                                <p className="mt-2 text-[15px] text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <Divider className="my-10" />

                    {/* ADDRESS SECTION */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Address Details
                    </h2>

                    <div className="grid gap-7 md:grid-cols-2">
                        {/* Billing */}
                        <div className="rounded-2xl border bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-md transition-all hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-red-700" />
                                <h3 className="text-lg font-semibold text-red-900">Billing Address</h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {enquiry.billingStreet}, {enquiry.billingCity}, {enquiry.billingState}, {enquiry.billingCountry} -{" "}
                                {enquiry.billingPincode}
                            </p>
                        </div>

                        {/* Shipping */}
                        <div className="rounded-2xl border bg-gradient-to-br from-lime-50 to-lime-100 p-6 shadow-md transition-all hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-lime-700" />
                                <h3 className="text-lg font-semibold text-lime-900">Shipping Address</h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {enquiry.shippingStreet}, {enquiry.shippingCity}, {enquiry.shippingState}, {enquiry.shippingCountry} -{" "}
                                {enquiry.shippingPincode}
                            </p>
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* Assigned To */}
                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#5b2be3] to-[#053054] bg-clip-text text-2xl font-bold text-transparent">
                        Assigned To
                    </h2>

                    <div className="rounded-xl border bg-gradient-to-r from-[#f3f4f6] to-[#e5e7eb] p-5 shadow-md backdrop-blur-xl transition-all hover:shadow-xl">
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(enquiry.assignedTo) ? (
                                enquiry.assignedTo.map((name, i) => (
                                    <span
                                        key={i}
                                        className="rounded-full bg-gradient-to-r from-[#053054] to-[#4a28ce] px-4 py-1 text-sm text-white shadow-md"
                                    >
                                        {name}
                                    </span>
                                ))
                            ) : (
                                <span className="rounded-full bg-gradient-to-r from-[#053054] to-[#4a28ce] px-4 py-1 text-sm text-white shadow-md">
                                    {enquiry.assignedTo}
                                </span>
                            )}
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* TIMESTAMP SECTION */}
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                        {[
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Created At",
                                value: new Date(enquiry.createdAt).toLocaleString(),
                            },
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Updated At",
                                value: new Date(enquiry.updatedAt).toLocaleString(),
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-md backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h3 className="text-lg font-semibold text-purple-800">{item.label}</h3>
                                </div>
                                <p className="mt-4 text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <Divider className="my-10" />

                    <h2 className="mb-4 mt-5 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Customer Contacts
                    </h2>
                    <div className="card-body p-0">
                        {/* Table */}
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Customer Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Mobile</th>
                                        <th className="table-head border border-gray-300 capitalize">Email</th>
                                        <th className="table-head border border-gray-300 capitalize">Tag</th>
                                        <th className="table-head border border-gray-300 capitalize">Designation</th>
                                        <th className="table-head border border-gray-300 capitalize">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {contacts.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No contacts data added yet for this customer.
                                            </td>
                                        </tr>
                                    ) : (
                                        contacts.map((con, index) => {
                                            const fullName =
                                                `${con.salutation || ""} ${con.firstName || ""} ${con.middleName || ""} ${con.lastName || ""}`.trim();
                                            return (
                                                <tr
                                                    key={con.id}
                                                    className="table-row"
                                                >
                                                    <td className="table-cell border border-gray-300">{index + 1}</td>
                                                    <td className="table-cell border border-gray-300">{fullName}</td>
                                                    <td className="table-cell border border-gray-300">{con.mobile}</td>
                                                    <td className="table-cell border border-gray-300">{con.email}</td>
                                                    <td className="table-cell border border-gray-300">{con.tag || "-"}</td>
                                                    <td className="table-cell border border-gray-300">{con.designation || "-"}</td>
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-x-4">
                                                            <button
                                                                className="text-blue-500"
                                                                onClick={() => handleEditContact(con)}
                                                            >
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button
                                                                className="text-red-500"
                                                                onClick={() => handleDeleteContactClick(con)}
                                                            >
                                                                <Trash size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ==================== Edit Contact Modal ==================== */}
            <Modal
                open={editContactOpen}
                onClose={() => setEditContactOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Edit Contact
                        </Typography>
                        <IconButton
                            onClick={() => setEditContactOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Autocomplete
                            options={salutations.map((s) => s.salutation)}
                            value={contactForm.salutation || null}
                            onChange={(e, val) => {
                                setContactForm((prev) => ({ ...prev, salutation: val || "" }));
                                setContactErrors((prev) => ({ ...prev, salutation: false }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Salutation *"
                                    error={contactErrors.salutation}
                                    size="small"
                                />
                            )}
                        />

                        <TextField
                            label="First Name *"
                            value={contactForm.firstName}
                            onChange={handleContactChange("firstName")}
                            error={contactErrors.firstName}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Middle Name"
                            value={contactForm.middleName}
                            onChange={handleContactChange("middleName")}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Last Name *"
                            value={contactForm.lastName}
                            onChange={handleContactChange("lastName")}
                            error={contactErrors.lastName}
                            size="small"
                            fullWidth
                        />

                        <Autocomplete
                            options={countryCode.map((c) => c.phoneCode)}
                            value={contactForm.selectedPhoneCode || null}
                            onChange={(e, val) => {
                                setContactForm((prev) => ({ ...prev, selectedPhoneCode: val || "" }));
                                setContactErrors((prev) => ({ ...prev, selectedPhoneCode: false }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Code *"
                                    error={contactErrors.selectedPhoneCode}
                                    size="small"
                                />
                            )}
                        />

                        <TextField
                            label="Mobile *"
                            placeholder="7385363401"
                            value={contactForm.mobile}
                            onChange={handleContactChange("mobile")}
                            error={contactErrors.mobile}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Email *"
                            value={contactForm.email}
                            onChange={handleContactChange("email")}
                            error={contactErrors.email}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Tag"
                            value={contactForm.tag}
                            onChange={handleContactChange("tag")}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Designation"
                            value={contactForm.designation}
                            onChange={handleContactChange("designation")}
                            size="small"
                            fullWidth
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setEditContactOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                            onClick={handleUpdateContact}
                        >
                            Update Contact
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* ==================== Delete Contact Modal ==================== */}
            <Modal
                open={deleteContactOpen}
                onClose={() => setDeleteContactOpen(false)}
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
                            onClick={() => setDeleteContactOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure you want to delete this contact?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={confirmDeleteContact}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setDeleteContactOpen(false)}
                        >
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : localSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage || localMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ViewEnquiry;
