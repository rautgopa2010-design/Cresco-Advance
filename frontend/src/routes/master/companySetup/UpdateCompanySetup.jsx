import { Button } from "@material-tailwind/react";
import { Box, Checkbox, FormControlLabel, TextField, MenuItem, Autocomplete, Snackbar, Alert, CircularProgress, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdOutlineSettingsAccessibility } from "react-icons/md";
import { CirclePlus, CircleMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoOrganization } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { getCompanySetup, updateCompanySetup } from "../../../redux/actions/companySetup";
import { getSalutations } from "../../../redux/actions/salutation";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { getCountry } from "../../../redux/actions/country";
import { getCountryCode } from "../../../redux/actions/countryCode";
import { IMAGE_BASE_URL } from "../../../utils/api";
import { getRoles } from "../../../redux/actions/rbac";

const UpdateCompanySetup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { salutations } = useSelector((state) => state.salutation);
    const { country } = useSelector((state) => state.country);
    const { countryCode } = useSelector((state) => state.countryCode);
    const { companySetup } = useSelector((state) => state.companySetup);
    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.companySetup);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [copyPermanantToAlternate, setCopyPermanantToAlternate] = useState(false);
    const [logo, setLogo] = useState(null);
    const [logoStyle, setLogoStyle] = useState({});
    const [form, setForm] = useState({
        companyName: "",
        gstinNumber: "",
        salutation: "",
        firstName: "",
        middleName: "",
        lastName: "",
        selectedPhoneCode: "+91",
        mobile: "",
        email: "",
        selectedSupportedPhoneCode: "+91",
        supportedMobile: "",
        supportedEmail: "",
        permanantStreet: "",
        permanantCity: "",
        permanantState: "",
        permanantPincode: "",
        permanantCountry: "",
        selectedPermanantCountryId: "",
        alternateStreet: "",
        alternateCity: "",
        alternateState: "",
        alternatePincode: "",
        alternateCountry: "",
        selectedAlternateCountryId: "",
        companyLogo: "",
        slabs: [{ min: "", max: "", rate: "" }],
        incentivePartition: {},
    });

    const [initialLoad, setInitialLoad] = useState(true);
    const [companyData, setCompanyData] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([dispatch(getSalutations()), dispatch(getCountry()), dispatch(getCountryCode())]);

                const data = await dispatch(getCompanySetup());
                setCompanyData(data); // store raw data
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    const { roles } = useSelector((state) => state.rbac);
    useEffect(() => {
        dispatch(getRoles()); // <-- create this API call to fetch org roles
    }, [dispatch]);

    const [rolesHierarchy, setRolesHierarchy] = useState([]);
    useEffect(() => {
        if (roles && roles.length > 0) {
            const roleMap = {};
            roles.forEach((r) => (roleMap[r.id] = r));

            const hierarchy = [];

            roles.forEach((role) => {
                if (role.name === "Super Admin") return; // skip Super Admin

                let current = role;
                const parents = [];

                while (current.parentRoleId && roleMap[current.parentRoleId]) {
                    const parentRole = roleMap[current.parentRoleId];
                    if (parentRole.name !== "Super Admin") parents.push(parentRole.name);
                    current = parentRole;
                }

                hierarchy.push({
                    assigned_role: role.name,
                    parents: parents.reverse(),
                });
            });

            setRolesHierarchy(hierarchy);
        }
    }, [roles]);

    useEffect(() => {
        if (companyData && country.length > 0) {
            const splitMobile = companyData.mobile ? companyData.mobile.split(" ") : ["", ""];
            const splitSupportedMobile = companyData.supportedMobile ? companyData.supportedMobile.split(" ") : ["", ""];

            const permanantCountryObj = country.find((c) => c.country === companyData.permanantCountry);
            const alternateCountryObj = country.find((c) => c.country === companyData.alternateCountry);

            // --- extract formulas ---
            let fixedRate = "";
            let slabs = [{ min: "", max: "", rate: "" }];
            let bonusAmount = "";
            let incentivePartitionData = {};

            if (companyData.formulas && Array.isArray(companyData.formulas)) {
                companyData.formulas.forEach((f) => {
                    if (f.formula_type === "fixed") {
                        fixedRate = f.formula_config?.rate ? f.formula_config.rate * 100 : "";
                    } else if (f.formula_type === "slab") {
                        slabs = (f.formula_config?.slabs || []).map((slab) => ({
                            ...slab,
                            rate: slab.rate ? slab.rate * 100 : "",
                        }));
                    } else if (f.formula_type === "bonus") {
                        bonusAmount = f.formula_config?.bonus || "";
                    } else if (f.formula_type === "partition") {
                        incentivePartitionData = f.formula_config || {};
                    }
                });
            }

            // ✅ Map incentive partition data to form structure
            const mappedPartition = {};
            rolesHierarchy.forEach((roleItem, rowIndex) => {
                const roleName = roleItem.assigned_role; // e.g., "Admin"
                mappedPartition[rowIndex] = {};

                if (incentivePartitionData[roleName]) {
                    Object.entries(incentivePartitionData[roleName]).forEach(([key, value]) => {
                        mappedPartition[rowIndex][key] = value;
                    });
                }
            });

            setForm((prev) => ({
                ...prev,
                companyName: companyData.companyName || "",
                gstinNumber: companyData.gstinNumber || "",
                salutation: companyData.salutation || "",
                firstName: companyData.firstName || "",
                middleName: companyData.middleName || "",
                lastName: companyData.lastName || "",
                selectedPhoneCode: splitMobile[0] || "",
                mobile: splitMobile[1] || "",
                email: companyData.email || "",
                selectedSupportedPhoneCode: splitSupportedMobile[0] || "",
                supportedMobile: splitSupportedMobile[1] || "",
                supportedEmail: companyData.supportedEmail || "",
                permanantStreet: companyData.permanantStreet || "",
                permanantCity: companyData.permanantCity || "",
                permanantState: companyData.permanantState || "",
                permanantPincode: companyData.permanantPincode || "",
                permanantCountry: permanantCountryObj?.country || "",
                selectedPermanantCountryId: permanantCountryObj?.id || "",
                alternateStreet: companyData.alternateStreet || "",
                alternateCity: companyData.alternateCity || "",
                alternateState: companyData.alternateState || "",
                alternatePincode: companyData.alternatePincode || "",
                alternateCountry: alternateCountryObj?.country || "",
                selectedAlternateCountryId: alternateCountryObj?.id || "",
                companyLogo: companyData.companyLogo || "",

                // ✅ prefill formulas
                fixedRate,
                slabs,
                bonusAmount,
                incentivePartition: mappedPartition,
            }));

            // ✅ logo preview
            if (companyData.companyLogo) {
                const fullLogoUrl = `${IMAGE_BASE_URL}${companyData.companyLogo}`;
                setLogoPreview(fullLogoUrl);
                setLogoStyle({
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "cover",
                    border: "2px solid #053054",
                    borderRadius: "8px",
                });
            }
        }
    }, [companyData, country, rolesHierarchy]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setForm({ ...form, [field]: value });
        setErrors({ ...errors, [field]: false });
    };

    const [logoPreview, setLogoPreview] = useState(null);
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLogo(file); // store actual file

        const imageUrl = URL.createObjectURL(file); // ✅ create preview URL
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

        setForm((prev) => ({
            ...prev,
            companyLogo: file.name, // ✅ store file name in form for display if needed
        }));

        setLogoPreview(imageUrl); // ✅ store preview URL
    };

    // Corrected handleChange for incentive partition
    const handlePartitionChange = (rowIndex, roleKey, value) => {
        setForm((prev) => {
            const updatedPartition = { ...prev.incentivePartition };

            // Ensure row exists
            if (!updatedPartition[rowIndex]) updatedPartition[rowIndex] = {};
            updatedPartition[rowIndex][roleKey] = value;

            return {
                ...prev,
                incentivePartition: updatedPartition,
            };
        });
    };

    // ✅ Modified validatePartition
    const validatePartition = () => {
        // Skip validation if user_type is provider
        if (user?.user_type === "provider") return true;

        const partitionRows = Object.values(form.incentivePartition); // array of row objects

        for (let i = 0; i < partitionRows.length; i++) {
            const row = partitionRows[i];
            const total = Object.values(row).reduce((acc, val) => acc + Number(val || 0), 0);
            if (total !== 100) {
                setLocalSnackbarMessage(`Partition entry ${i + 1} total must be 100%`);
                setLocalSnackbarSeverity("error");
                setSnackbarOpen(true);
                return false;
            }
        }
        return true;
    };

    const validateFields = () => {
        const tempErrors = {};
        let hasError = false;
        const specificErrors = []; // Only format/length errors
    
        // Step 1: Check required fields first
        const requiredFields = [
            "companyName",
            "salutation",
            "firstName",
            "lastName",
            "selectedPhoneCode",
            "mobile",
            "email",
            "selectedSupportedPhoneCode",
            "supportedMobile",
            "supportedEmail",
        ];
    
        let hasEmptyRequired = false;
    
        requiredFields.forEach((field) => {
            if (!form[field] || form[field].toString().trim() === "") {
                tempErrors[field] = true;
                hasEmptyRequired = true;
                hasError = true;
            }
        });
    
        // If any required field is empty → show generic message and stop
        if (hasEmptyRequired) {
            setErrors(tempErrors);
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }
    
        // Step 2: Only if all required are filled → check format rules
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    
        // Mobile: exactly 10 digits
        if (form.mobile && (form.mobile.length !== 10 || !/^\d+$/.test(form.mobile))) {
            tempErrors.mobile = true;
            specificErrors.push("Mobile number must be exactly 10 digits");
            hasError = true;
        }
    
        if (form.supportedMobile && (form.supportedMobile.length !== 10 || !/^\d+$/.test(form.supportedMobile))) {
            tempErrors.supportedMobile = true;
            specificErrors.push("Supported mobile number must be exactly 10 digits");
            hasError = true;
        }
    
        if (form.email && !emailRegex.test(form.email)) {
            tempErrors.email = true;
            specificErrors.push("Enter a valid email address");
            hasError = true;
        }
    
        if (form.supportedEmail && !emailRegex.test(form.supportedEmail)) {
            tempErrors.supportedEmail = true;
            specificErrors.push("Enter a valid supported email address");
            hasError = true;
        }
    
        // Step 3: Show specific message if format is wrong
        if (hasError && specificErrors.length > 0) {
            setErrors(tempErrors);
            setLocalSnackbarMessage(specificErrors.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }
    
        // All good!
        setErrors({});
        return true;
    };

    const handleSubmit = async () => {

        if (!validateFields()) {
            return; // stop submission
        }

        // ✅ Only validate partition if not a provider
        if (user?.user_type !== "provider" && !validatePartition()) return;

        try {
            const id = companySetup?.id || companySetup?.org_id;
            const formData = new FormData();

            // Append all fields as strings
            Object.entries({
                companyName: form.companyName,
                gstinNumber: form.gstinNumber,
                salutation: form.salutation,
                firstName: form.firstName,
                middleName: form.middleName || "",
                lastName: form.lastName,
                mobile: form.selectedPhoneCode && form.mobile ? `${form.selectedPhoneCode} ${form.mobile}`.trim() : "",
                email: form.email,
                supportedMobile:
                    form.selectedSupportedPhoneCode && form.supportedMobile
                        ? `${form.selectedSupportedPhoneCode} ${form.supportedMobile}`.trim()
                        : "",
                supportedEmail: form.supportedEmail,
                permanantStreet: form.permanantStreet,
                permanantCity: form.permanantCity,
                permanantState: form.permanantState,
                permanantPincode: form.permanantPincode,
                permanantCountry: form.permanantCountry,
                alternateStreet: form.alternateStreet,
                alternateCity: form.alternateCity,
                alternateState: form.alternateState,
                alternatePincode: form.alternatePincode,
                alternateCountry: form.alternateCountry,
            }).forEach(([key, value]) => formData.append(key, value));

            if (logo) formData.append("companyLogo", logo);

            formData.append("fixedRate", form.fixedRate || "");
            const normalizedSlabs = (form.slabs || []).map((slab) => ({
                ...slab,
                rate: slab.rate ? Number(slab.rate) / 100 : 0,
            }));
            formData.append("slabs", JSON.stringify(normalizedSlabs));
            formData.append("bonusAmount", form.bonusAmount || "");

            // Convert incentivePartition before sending
            const partitionByRole = {};
            rolesHierarchy.forEach((roleItem, rowIndex) => {
                const roleName = roleItem.assigned_role;
                partitionByRole[roleName] = form.incentivePartition[rowIndex] || {};
            });
            formData.append("incentivePartition", JSON.stringify(partitionByRole));

            await dispatch(updateCompanySetup(id, formData));

            if (companySetup?.companyLogo || form.companyLogo) {
                const orgId = user?.org_id || "default";
                const logoKey = `companyLogo_${orgId}`;
            
                // ✅ Always use the latest path from getCompanySetup API after update
                const updatedData = await dispatch(getCompanySetup());
                const updatedLogo = updatedData?.companyLogo || companySetup?.companyLogo || form.companyLogo;
            
                // ✅ Save full logo path (just like ViewCompanySetup)
                if (updatedLogo) {
                    localStorage.setItem(logoKey, updatedLogo);
            
                    // 🔔 Dispatch event so Sidebar updates immediately
                    window.dispatchEvent(
                        new CustomEvent("companyLogoUpdated", {
                            detail: { orgId, logo: updatedLogo },
                        })
                    );
                }
            }
            
            setTimeout(() => {
                navigate("/settings/company-setup");
            }, 1500);
        } catch (error) {
            console.error("Form Submit Error:", error);
            setLocalSnackbarMessage("Failed to update company setup");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    return (
        <>
            {initialLoad ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-2">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Update Company Setup :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>

                    {/* Company Name & GSTIN */}
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <TextField
                            label="Company Name *"
                            placeholder="Company Name"
                            value={form.companyName}
                            onChange={handleChange("companyName")}
                            error={errors.companyName}
                            fullWidth
                            size="small"
                            sx={{ flex: 2 }}
                        />
                        <TextField
                            label="GSTIN No"
                            placeholder="GSTIN Number"
                            value={form.gstinNumber}
                            onChange={handleChange("gstinNumber")}
                            fullWidth
                            size="small"
                            sx={{ flex: 2 }}
                        />
                    </Box>

                    {/* Contact Person */}
                    <div className="w-full">
                        <div className="mb-2 px-1 text-sm font-medium text-[#433C50] md:text-base">Contact Person Detail's</div>
                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <TextField
                                select
                                label="Salutation *"
                                value={form.salutation}
                                onChange={handleChange("salutation")}
                                error={errors.salutation}
                                size="small"
                                sx={{ flex: 1 }}
                            >
                                {salutations.map((option) => (
                                    <MenuItem
                                        key={option.id}
                                        value={option.salutation}
                                    >
                                        {option.salutation}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="First Name *"
                                placeholder="First Name"
                                value={form.firstName}
                                onChange={handleChange("firstName")}
                                error={errors.firstName}
                                fullWidth
                                size="small"
                                sx={{ flex: 2 }}
                            />
                            <TextField
                                label="Middle Name "
                                placeholder="Middle Name"
                                fullWidth
                                size="small"
                                sx={{ flex: 2 }}
                                value={form.middleName}
                                onChange={handleChange("middleName")}
                            />
                            <TextField
                                label="Last Name *"
                                placeholder="Last Name"
                                value={form.lastName}
                                onChange={handleChange("lastName")}
                                error={errors.lastName}
                                fullWidth
                                size="small"
                                sx={{ flex: 2 }}
                            />
                        </Box>
                    </div>

                    {/* Mobile & Email */}
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        {/* Code + Mobile group (always in a row) */}
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <Autocomplete
                                options={countryCode.map((c) => c.phoneCode)}
                                value={form.selectedPhoneCode || null}
                                onChange={(e, newValue) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        selectedPhoneCode: newValue,
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        selectedPhoneCode: false,
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Code *"
                                        error={errors.selectedPhoneCode}
                                        size="small"
                                    />
                                )}
                                sx={{ flex: 0.5 }}
                            />

                            <TextField
                                label="Mobile *"
                                placeholder="7385363401"
                                value={form.mobile}
                                onChange={handleChange("mobile")}
                                error={errors.mobile}
                                fullWidth
                                size="small"
                                sx={{
                                    flex: 1,
                                }}
                            />
                        </Box>
                        <TextField
                            label="Email *"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange("email")}
                            error={errors.email}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 1,
                            }}
                        />
                    </Box>

                    {/* Mobile & Email (Supported) */}
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        {/* Code + Mobile group (always in a row) */}
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <Autocomplete
                                options={countryCode.map((c) => c.phoneCode)}
                                value={form.selectedSupportedPhoneCode || null}
                                onChange={(e, newValue) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        selectedSupportedPhoneCode: newValue,
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        selectedSupportedPhoneCode: false,
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Sup Code *"
                                        error={errors.selectedSupportedPhoneCode}
                                        size="small"
                                    />
                                )}
                                sx={{ flex: 0.5 }}
                            />
                            <TextField
                                label="Supported Mobile *"
                                placeholder="Supported Mobile"
                                value={form.supportedMobile}
                                onChange={handleChange("supportedMobile")}
                                error={errors.supportedMobile}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <TextField
                            label="Supported Email *"
                            placeholder="Supported Email"
                            value={form.supportedEmail}
                            onChange={handleChange("supportedEmail")}
                            error={errors.supportedEmail}
                            fullWidth
                            size="small"
                            sx={{ flex: 1 }}
                        />
                    </Box>

                    {/* Address Section */}
                    <div className="gap-4 md:flex lg:flex">
                        <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Permanant Address</p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street"
                                    placeholder="Street"
                                    value={form.permanantStreet}
                                    onChange={handleChange("permanantStreet")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City"
                                    placeholder="City"
                                    value={form.permanantCity}
                                    onChange={handleChange("permanantCity")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                                <TextField
                                    label="State"
                                    placeholder="State"
                                    value={form.permanantState}
                                    onChange={handleChange("permanantState")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode"
                                    placeholder="Pincode"
                                    value={form.permanantPincode}
                                    onChange={handleChange("permanantPincode")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option.country}
                                    value={country.find((c) => c.id === form.selectedPermanantCountryId) || null}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            selectedPermanantCountryId: newValue?.id || "",
                                            permanantCountry: newValue?.country || "",
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country"
                                            size="small"
                                        />
                                    )}
                                    sx={{ flex: 2 }}
                                />
                            </Box>
                        </div>
                        <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Alternate Address</p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street"
                                    placeholder="Street"
                                    value={form.alternateStreet}
                                    onChange={handleChange("alternateStreet")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City"
                                    placeholder="City"
                                    value={form.alternateCity}
                                    onChange={handleChange("alternateCity")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                                <TextField
                                    label="State"
                                    placeholder="State"
                                    value={form.alternateState}
                                    onChange={handleChange("alternateState")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode"
                                    placeholder="Pincode"
                                    value={form.alternatePincode}
                                    onChange={handleChange("alternatePincode")}
                                    fullWidth
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option.country}
                                    value={country.find((c) => c.id === form.selectedAlternateCountryId) || null}
                                    onChange={(e, newValue) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            selectedAlternateCountryId: newValue?.id || "",
                                            alternateCountry: newValue?.country || "",
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country"
                                            size="small"
                                        />
                                    )}
                                    sx={{ flex: 2 }}
                                    disabled={copyPermanantToAlternate}
                                />
                            </Box>
                        </div>
                    </div>
                    <span>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={copyPermanantToAlternate}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCopyPermanantToAlternate(checked);

                                        if (checked) {
                                            const selectedPermanantCountry = country.find((c) => c.id === Number(form.selectedPermanantCountryId));

                                            setForm((prev) => ({
                                                ...prev,
                                                alternateStreet: prev.permanantStreet,
                                                alternateCity: prev.permanantCity,
                                                alternateState: prev.permanantState,
                                                alternatePincode: prev.permanantPincode,
                                                selectedAlternateCountryId: prev.selectedPermanantCountryId,
                                                alternateCountry: selectedPermanantCountry?.country || "",
                                            }));
                                        } else {
                                            setForm((prev) => ({
                                                ...prev,
                                                alternateStreet: "",
                                                alternateCity: "",
                                                alternateState: "",
                                                alternatePincode: "",
                                                selectedAlternateCountryId: "",
                                                alternateCountry: "",
                                            }));
                                        }
                                    }}
                                />
                            }
                            label="alternate address is same as permanant address"
                        />
                    </span>

                    <div className="w-full">
                        <div className="text-sm font-medium text-[#433C50] md:text-base">Company Logo</div>
                        <div className="flex flex-col items-center gap-4">
                            {/* Preview or Default Placeholder */}
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company Logo Preview"
                                    style={logoStyle}
                                    className="shadow-md"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-[#053054] bg-gray-200 text-center font-bold text-[#053054]">
                                    Choose Logo
                                </div>
                            )}

                            {/* Choose Button */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="absolute inset-0 h-full w-full opacity-0 file:cursor-pointer"
                                />
                                <Button
                                    variant="gradient"
                                    className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                                >
                                    <GoOrganization size={20} />
                                    Choose Logo
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Incentive Formulas Section - Only for Super Admin */}
                    {user?.role_name === "Super Admin" && (
                        <div className="mt-6 space-y-6 border-t pt-4">
                            <div className="text-lg font-bold text-[#433C50]">Incentive Formulas</div>

                            {/* Fixed Formula */}
                            <div className="space-y-2">
                                <div className="text-base font-semibold text-[#053054]">
                                    1) Fixed Formula : <span className="text-sm">(Incentive = Sales Amount x Commission Rate)</span>
                                </div>
                                <Box>
                                    <TextField
                                        label="Fixed Commission Rate (%)"
                                        type="number"
                                        size="small"
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{
                                            min: 0,
                                            onKeyDown: (e) => {
                                                if (e.key === "-" || e.key === "e") e.preventDefault();
                                            },
                                        }}
                                        value={form.fixedRate || ""}
                                        onChange={handleChange("fixedRate")}
                                        className="w-full md:w-60"
                                    />
                                </Box>
                            </div>

                            {/* Slab Formula */}
                            <div className="space-y-2">
                                <div className="text-base font-semibold text-[#053054]">
                                    2) Slab Formula :{" "}
                                    <span className="text-sm">(Incentive = (Rate1 x Sales in Slab1) + (Rate2 x Sales in Slab2) + ...)</span>
                                </div>
                                <Box className="flex flex-col gap-3">
                                    {form.slabs?.map((slab, index) => {
                                        const isFirst = index === 0;
                                        const isLast = index === form.slabs.length - 1;

                                        return (
                                            <Box
                                                key={index}
                                                className="flex items-center gap-3"
                                            >
                                                <TextField
                                                    label="Min"
                                                    type="number"
                                                    size="small"
                                                    value={slab.min}
                                                    onChange={(e) => {
                                                        const updated = [...form.slabs];
                                                        updated[index].min = e.target.value;
                                                        setForm({ ...form, slabs: updated });
                                                    }}
                                                    onWheel={(e) => e.target.blur()}
                                                    inputProps={{
                                                        min: 0,
                                                        onKeyDown: (e) => {
                                                            if (e.key === "-" || e.key === "e") e.preventDefault();
                                                        },
                                                    }}
                                                    className="w-full md:w-60"
                                                />
                                                <TextField
                                                    label="Max"
                                                    type="number"
                                                    size="small"
                                                    value={slab.max}
                                                    onChange={(e) => {
                                                        const updated = [...form.slabs];
                                                        updated[index].max = e.target.value;
                                                        setForm({ ...form, slabs: updated });
                                                    }}
                                                    onWheel={(e) => e.target.blur()}
                                                    inputProps={{
                                                        min: 0,
                                                        onKeyDown: (e) => {
                                                            if (e.key === "-" || e.key === "e") e.preventDefault();
                                                        },
                                                    }}
                                                    className="w-full md:w-60"
                                                />
                                                <TextField
                                                    label="Rate (%)"
                                                    type="number"
                                                    size="small"
                                                    value={slab.rate}
                                                    onChange={(e) => {
                                                        const updated = [...form.slabs];
                                                        updated[index].rate = e.target.value;
                                                        setForm({ ...form, slabs: updated });
                                                    }}
                                                    onWheel={(e) => e.target.blur()}
                                                    inputProps={{
                                                        min: 0,
                                                        onKeyDown: (e) => {
                                                            if (e.key === "-" || e.key === "e") e.preventDefault();
                                                        },
                                                    }}
                                                    className="w-full md:w-60"
                                                />

                                                {/* Action Buttons */}
                                                <Box className="flex items-center gap-2">
                                                    {/* Show - if not the first row */}
                                                    {(!isFirst || form.slabs.length > 1) && (
                                                        <IconButton
                                                            onClick={() => {
                                                                const updated = [...form.slabs];
                                                                updated.splice(index, 1);
                                                                setForm({ ...form, slabs: updated });
                                                            }}
                                                        >
                                                            <CircleMinus
                                                                size={25}
                                                                className="text-red-500"
                                                            />
                                                        </IconButton>
                                                    )}

                                                    {/* Show + only for last row */}
                                                    {isLast && (
                                                        <IconButton
                                                            onClick={() =>
                                                                setForm({
                                                                    ...form,
                                                                    slabs: [...form.slabs, { min: "", max: "", rate: "" }],
                                                                })
                                                            }
                                                        >
                                                            <CirclePlus
                                                                size={25}
                                                                className="text-blue-500"
                                                            />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </div>

                            {/* Bonus Formula */}
                            <div className="space-y-2">
                                <div className="text-base font-semibold text-[#053054]">
                                    3) Bonus Formula : <span className="text-sm">(Incentive = Fixed Bonus if (Sales ≥ Target))</span>
                                </div>
                                <Box>
                                    <TextField
                                        label="Bonus Amount"
                                        type="number"
                                        size="small"
                                        value={form.bonusAmount || ""}
                                        onChange={handleChange("bonusAmount")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{
                                            min: 0,
                                            onKeyDown: (e) => {
                                                if (e.key === "-" || e.key === "e") e.preventDefault();
                                            },
                                        }}
                                        className="w-full md:w-60"
                                    />
                                </Box>
                            </div>

                            {/* Incentive Partition Formula */}
                            <div className="space-y-2">
                                <div className="text-base font-semibold text-[#053054]">
                                    4) Incentive Partition : <span className="text-sm">(Distribute incentive % among roles)</span>
                                </div>

                                <Box className="flex flex-col gap-3">
                                    {rolesHierarchy.map((roleItem, rowIndex) => {
                                        const { assigned_role, parents } = roleItem;
                                        const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][rowIndex] || rowIndex + 1;
                                        const keyName = `assigned_${assigned_role.toLowerCase()}`;

                                        return (
                                            <Box
                                                key={assigned_role}
                                                className="flex flex-col gap-1 rounded-md border bg-gray-50 p-2"
                                            >
                                                <div className="font-medium text-gray-700">{`${roman}) If Assigned to ${assigned_role}`}</div>

                                                <Box className="mt-1 flex flex-wrap gap-3">
                                                    {[keyName, ...parents].map((roleKey) => (
                                                        <TextField
                                                            key={`${rowIndex}_${roleKey}`} // ✅ unique key for each input
                                                            label={`${roleKey
                                                                .replace(/^assigned_/, "")
                                                                .replace(/_/g, " ")
                                                                .replace(/\b\w/g, (c) => c.toUpperCase())} (%)`}
                                                            type="number"
                                                            size="small"
                                                            value={form.incentivePartition[rowIndex]?.[roleKey] || 0}
                                                            onChange={(e) => handlePartitionChange(rowIndex, roleKey, e.target.value)}
                                                            onWheel={(e) => e.target.blur()}
                                                            inputProps={{
                                                                min: 0,
                                                                max: 100,
                                                                onKeyDown: (e) => {
                                                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                                                },
                                                            }}
                                                            className="w-32"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <MdOutlineSettingsAccessibility size={20} />
                            Update
                        </Button>
                    </div>
                </div>
            )}
            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UpdateCompanySetup;
