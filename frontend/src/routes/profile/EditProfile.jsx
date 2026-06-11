import { Button } from "@material-tailwind/react";
import { Box, Checkbox, FormControlLabel, TextField, MenuItem, Autocomplete, Snackbar, Alert, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaUser, FaUserCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, updateProfile } from "../../redux/actions/profile";
import { getSalutations } from "../../redux/actions/salutation";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { getCountry } from "../../redux/actions/country";
import { getCountryCode } from "../../redux/actions/countryCode";
import { IMAGE_BASE_URL } from "../../utils/api";

const EditProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isCompanyEditable = 
    user?.role_name === "Super Admin" || user?.role_name === "Super Provider Admin";
    const { salutations } = useSelector((state) => state.salutation);
    const { country } = useSelector((state) => state.country);
    const { countryCode } = useSelector((state) => state.countryCode);
    const { profile } = useSelector((state) => state.profile);
    const [errors, setErrors] = useState({});
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.profile);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [copyPermanantToAlternate, setCopyPermanantToAlternate] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
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
        profileImage: "",
    });

    const [initialLoad, setInitialLoad] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([dispatch(getSalutations()), dispatch(getCountry()), dispatch(getCountryCode())]);

                const data = await dispatch(getProfile());
                setProfileData(data); // store raw data
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    useEffect(() => {
        if (profileData && country.length > 0) {
            const splitMobile = profileData.mobile ? profileData.mobile.split(" ") : ["", ""];
            const permanantCountryObj = country.find((c) => c.country === profileData.permanantCountry);
            const alternateCountryObj = country.find((c) => c.country === profileData.alternateCountry);

            setForm((prev) => ({
                ...prev,
                companyName: profileData.companyName || "",
                gstinNumber: profileData.gstinNumber || "",
                salutation: profileData.salutation || "",
                firstName: profileData.firstName || "",
                middleName: profileData.middleName || "",
                lastName: profileData.lastName || "",
                selectedPhoneCode: splitMobile[0] || "",
                mobile: splitMobile[1] || "",
                email: profileData.email || "",
                permanantStreet: profileData.permanantStreet || "",
                permanantCity: profileData.permanantCity || "",
                permanantState: profileData.permanantState || "",
                permanantPincode: profileData.permanantPincode || "",
                permanantCountry: permanantCountryObj?.country || "",
                selectedPermanantCountryId: permanantCountryObj?.id || "",
                alternateStreet: profileData.alternateStreet || "",
                alternateCity: profileData.alternateCity || "",
                alternateState: profileData.alternateState || "",
                alternatePincode: profileData.alternatePincode || "",
                alternateCountry: alternateCountryObj?.country || "",
                selectedAlternateCountryId: alternateCountryObj?.id || "",
                profileImage: profileData.profileImage || "",
            }));

            // ✅ If backend has logo, set preview
            if (profileData.profileImage) {
                const fullLogoUrl = `${IMAGE_BASE_URL}${profileData.profileImage}`;
                setProfileImagePreview(fullLogoUrl);
            }
        }
    }, [profileData, country]);

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

    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfileImage(file); // store actual file

        const imageUrl = URL.createObjectURL(file); // ✅ create preview URL

        setForm((prev) => ({
            ...prev,
            profileImage: file.name, // ✅ store file name in form for display if needed
        }));

        setProfileImagePreview(imageUrl); // ✅ store preview URL
    };

    const validateFields = () => {
        let tempErrors = {};
        let hasError = false;

        // Required fields
        const requiredFields = ["companyName", "salutation", "firstName", "lastName", "selectedPhoneCode", "mobile", "email"];

        requiredFields.forEach((field) => {
            if (!form[field] || form[field].toString().trim() === "") {
                tempErrors[field] = true;
                hasError = true;
            }
        });

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            const id = profile?.id || profile?.org_id;

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

            // Append profileImage file if exists
            if (profileImage) formData.append("profileImage", profileImage);

            // Debug: log all FormData entries
            for (let pair of formData.entries()) {
                console.log(pair[0], ":", pair[1]);
            }

            await dispatch(updateProfile(id, formData));

            setTimeout(() => {
                navigate(`/profile/${profile.id}`);
            }, 1500);
        } catch (error) {
            console.error("Form Submit Error:", error);
            setLocalSnackbarMessage("Failed to update profile");
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
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Update Profile :</div>
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
                            disabled={!isCompanyEditable}
                        />
                        <TextField
                            label="GSTIN No"
                            placeholder="GSTIN Number"
                            value={form.gstinNumber}
                            onChange={handleChange("gstinNumber")}
                            fullWidth
                            size="small"
                            sx={{ flex: 2 }}
                            disabled={!isCompanyEditable}
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
                        <div className="text-sm font-medium text-[#433C50] md:text-base">Profile Image</div>
                        <div className="flex flex-col items-center gap-4">
                            {/* Preview or Default Placeholder */}
                            {profileImagePreview ? (
                                <img
                                    src={profileImagePreview}
                                    alt="Profile Preview"
                                    className="h-36 w-36 rounded-full border-2 border-[#053054] object-cover shadow-md"
                                />
                            ) : (
                                <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-[#053054] bg-gray-200 text-center font-bold text-[#053054]">
                                    Choose Profile Image
                                </div>
                            )}

                            {/* Choose Button */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    className="absolute inset-0 h-full w-full opacity-0 file:cursor-pointer"
                                />
                                <Button
                                    variant="gradient"
                                    className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                                >
                                    <FaUserCog size={20} />
                                    Choose Profile Image
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <FaUser size={20} />
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

export default EditProfile;
