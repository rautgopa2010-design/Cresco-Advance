import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSalutations } from "../../../redux/actions/salutation";
import { getRoles } from "../../../redux/actions/rbac";
import { updateEmployee, getEmployees } from "../../../redux/actions/employee";
import { getCountry } from "../../../redux/actions/country";
import { getCountryCode } from "../../../redux/actions/countryCode";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { Button } from "@material-tailwind/react";
import { Box, TextField, MenuItem, Snackbar, Alert, FormControlLabel, Checkbox, CircularProgress, Autocomplete } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { UserPlus } from "lucide-react";

const EditEmployee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { salutations } = useSelector((state) => state.salutation);
    const { roles } = useSelector((state) => state.rbac);
    const { employees } = useSelector((state) => state.employee);
    const { country } = useSelector((state) => state.country);
    const { countryCode } = useSelector((state) => state.countryCode);
    const [form, setForm] = useState({
        salutation: "",
        firstName: "",
        middleName: "",
        lastName: "",
        selectedPhoneCode: "",
        mobile: "",
        email: "",
        street: "",
        state: "",
        selectedCountryId: "",
        country: "",
        city: "",
        pincode: "",
        reportTo: "",
        targetAmount: "",
        role: {
            id: "",
            name: "",
        },
    });
    const [isSuperAdminEmployee, setIsSuperAdminEmployee] = useState(false);
    const [errors, setErrors] = useState({});
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const { loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.employee);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alternateAddress, setAlternateAddress] = useState({
        street: "",
        state: "",
        country: "",
        city: "",
        pincode: "",
        selectedCountryId: "",
    });

    const [isSameAddress, setIsSameAddress] = useState(false);

    useEffect(() => {
        dispatch(getSalutations());
        dispatch(getRoles());
        dispatch(getEmployees());
        dispatch(getCountry());
        dispatch(getCountryCode());
        dispatch(clearSnackbar());
    }, [dispatch]);

    // ✅ Prefill data once employees are fetched
    useEffect(() => {
        if (employees && employees.length > 0 && id) {
            const existingEmployee = employees.find((emp) => String(emp.id) === String(id));

            if (existingEmployee) {
                // Check Super Admin
                const roleObj = roles.find((r) => r.id === existingEmployee.role_id);
                const isSA = roleObj?.name === "Super Admin";
                setIsSuperAdminEmployee(isSA);

                const [phoneCode, phoneNumber] = existingEmployee.mobile?.includes(" ")
                    ? existingEmployee.mobile.split(" ")
                    : ["", existingEmployee.mobile];

                const reportToEmp = employees.find((e) => String(e.id) === String(existingEmployee.reportTo));

                setForm({
                    salutation: existingEmployee.salutation || "",
                    firstName: existingEmployee.firstName || "",
                    middleName: existingEmployee.middleName || "",
                    lastName: existingEmployee.lastName || "",
                    selectedPhoneCode: phoneCode || "",
                    mobile: phoneNumber || "",
                    email: existingEmployee.email || "",
                    street: existingEmployee.street || "",
                    city: existingEmployee.city || "",
                    state: existingEmployee.state || "",
                    pincode: existingEmployee.pincode || "",
                    country: existingEmployee.country || "",
                    selectedCountryId: country.find((c) => c.country === existingEmployee.country)?.id || "",
                    reportTo: isSA ? "" : reportToEmp?.id || "",
                    targetAmount: localStorage.getItem(`crm:employee-target:${String(existingEmployee.email || "").toLowerCase()}`) || "",
                    role: {
                        id: existingEmployee.role_id,
                        name: roleObj?.name || "",
                    },
                });

                setAlternateAddress({
                    street: existingEmployee.altStreet || "",
                    city: existingEmployee.altCity || "",
                    state: existingEmployee.altState || "",
                    pincode: existingEmployee.altPincode || "",
                    country: existingEmployee.altCountry || "",
                    selectedCountryId: country.find((c) => c.country === existingEmployee.altCountry)?.id || "",
                });
            }
        }
    }, [employees, id, roles, country]);

    useEffect(() => {
        if (justSubmitted && snackbarMessage) {
            if (snackbarMessage) {
                setSnackbarOpen(true);
            }
            if (snackbarSeverity === "success") {
                setForm({
                    salutation: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    selectedPhoneCode: "",
                    mobile: "",
                    email: "",
                    street: "",
                    state: "",
                    selectedCountryId: "",
                    country: "",
                    city: "",
                    pincode: "",
                    reportTo: "",
                    targetAmount: "",
                    role: {
                        id: "",
                        name: "",
                    },
                });
                setAlternateAddress({
                    street: "",
                    state: "",
                    country: "",
                    city: "",
                    pincode: "",
                });

                if (snackbarSeverity === "success") {
                    setTimeout(() => {
                        setJustSubmitted(false);
                        dispatch(clearSnackbar());
                        navigate("/settings/master/employee");
                    }, 800);
                }
            } else {
                setJustSubmitted(false);
            }
        }
    }, [snackbarMessage, snackbarSeverity, justSubmitted, navigate, dispatch]);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    const getRoleAncestors = (roleId, allRoles) => {
        let ancestors = [];
        let currentRole = allRoles.find((r) => r.id === roleId);

        while (currentRole && currentRole.parentRoleId) {
            const parent = allRoles.find((r) => r.id === currentRole.parentRoleId);
            if (parent) {
                ancestors.push(parent);
                currentRole = parent;
            } else {
                break;
            }
        }

        return ancestors;
    };

    const getReportToOptions = () => {
        const selectedRole = roles.find((r) => r.name === form.role?.name);
        if (!selectedRole) return [];

        const ancestors = getRoleAncestors(selectedRole.id, roles);

        // Get employees whose role is in any ancestor role
        return employees.filter((emp) => ancestors.some((a) => a.id === emp.role_id));
    };

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");

        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    const handleSameAddressToggle = (event) => {
        const checked = event.target.checked;
        setIsSameAddress(checked);

        if (checked) {
            setAlternateAddress({
                street: form.street,
                state: form.state,
                country: form.country,
                city: form.city,
                pincode: form.pincode,
                selectedCountryId: form.selectedCountryId,
            });
        } else {
            setAlternateAddress({
                street: "",
                state: "",
                country: "",
                city: "",
                pincode: "",
                selectedCountryId: "",
            });
        }
    };

    const validateFields = () => {
        const fieldNames = {
            salutation: "Salutation",
            firstName: "First Name",
            middleName: "Middle Name",
            lastName: "Last Name",
            mobile: "Mobile",
            email: "Email",
            street: "Street",
            city: "City",
            state: "State",
            pincode: "Pincode",
            country: "Country",
        };

        // ❌ DO NOT REQUIRE role & reportTo for Super Admin
        if (!isSuperAdminEmployee) {
            fieldNames.role = "Role";
            fieldNames.reportTo = "Report To";
        }

        let tempErrors = {};
        for (const field of Object.keys(fieldNames)) {
            const value = form[field];

            const isInvalid = value === undefined || value === null || value === "" || (typeof value === "object" && Object.keys(value).length === 0);

            if (isInvalid) {
                tempErrors[field] = true;
                setErrors(tempErrors);
                setLocalSnackbarMessage(`${fieldNames[field]} is required`);
                setLocalSnackbarSeverity("error");
                setSnackbarOpen(true);
                return false;
            }
        }

        // ---------- MOBILE VALIDATION ----------
        if (!/^[0-9]{10}$/.test(form.mobile)) {
            tempErrors.mobile = true;
            setErrors(tempErrors);
            setLocalSnackbarMessage("Mobile number must be exactly 10 digits");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        // ---------- EMAIL VALIDATION ----------
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
            tempErrors.email = true;
            setErrors(tempErrors);
            setLocalSnackbarMessage("Enter a valid email address");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateFields()) {
            setJustSubmitted(true);
            const employeeData = {
                salutation: form.salutation,
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                mobile: `${form.selectedPhoneCode} ${form.mobile}`.trim(),
                email: form.email,
                reportTo: form.reportTo,
                role: form.role,
                permanentAddress: {
                    street: form.street,
                    state: form.state,
                    country: form.country,
                    city: form.city,
                    pincode: form.pincode,
                },
                alternateAddress: { ...alternateAddress },
            };

            if (form.email) {
                localStorage.setItem(`crm:employee-target:${form.email.toLowerCase()}`, String(form.targetAmount || 0));
            }

            dispatch(updateEmployee(id, employeeData));
        }
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-4">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Update Employee :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>

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
                            sx={{
                                flex: 2,
                            }}
                        />
                        <TextField
                            label="Middle Name *"
                            placeholder="Middle Name"
                            value={form.middleName}
                            onChange={handleChange("middleName")}
                            error={errors.middleName}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                        <TextField
                            label="Last Name *"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange("lastName")}
                            error={errors.lastName}
                            fullWidth
                            size="small"
                            sx={{
                                flex: 2,
                            }}
                        />
                    </Box>
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        {/* Code + Mobile group (always in a row) */}
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <Autocomplete
                                options={countryCode.map((item) => item.phoneCode)}
                                value={form.selectedPhoneCode || ""}
                                onChange={(_, newValue) => {
                                    const selectedCode = countryCode.find((c) => c.phoneCode === newValue);
                                    const matchedCountry = country.find((c) => c.id === selectedCode?.countryId);

                                    setForm({
                                        ...form,
                                        selectedPhoneCode: newValue || "",
                                        selectedCountryId: matchedCountry?.id || "",
                                        country: matchedCountry?.country || "",
                                    });
                                    setErrors({ ...errors, country: false });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Code"
                                        size="small"
                                    />
                                )}
                                sx={{ flex: 0.4 }}
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

                        {/* Email group (stacked on mobile/md, side by side on lg) */}
                        <Box className="flex w-full flex-col gap-4 lg:flex-1 lg:flex-row">
                            <TextField
                                label="Email *"
                                placeholder="divyanshu@khodapesoftware.com"
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
                    </Box>

                    <div>
                        <div className="gap-4 md:flex lg:flex">
                            <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                                <p className="-mb-1 font-semibold text-[#433C50]">
                                    Permenant Address <span className="text-red-500">*</span>
                                </p>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Street *"
                                        placeholder="Street"
                                        value={form.street}
                                        onChange={handleChange("street")}
                                        error={errors.street}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="City *"
                                        placeholder="City"
                                        value={form.city}
                                        onChange={handleChange("city")}
                                        error={errors.city}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                    <TextField
                                        label="State *"
                                        placeholder="State"
                                        value={form.state}
                                        onChange={handleChange("state")}
                                        error={errors.state}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Pincode *"
                                        placeholder="Pincode"
                                        value={form.pincode}
                                        onChange={handleChange("pincode")}
                                        error={errors.pincode}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                    />
                                    <Autocomplete
                                        options={country}
                                        getOptionLabel={(option) => option.country}
                                        value={country.find((c) => c.id === form.selectedCountryId) || null}
                                        onChange={(_, newValue) => {
                                            if (!newValue) return;
                                            const matchedCode = countryCode.find((c) => c.countryId === newValue.id);
                                            setForm({
                                                ...form,
                                                selectedCountryId: newValue.id,
                                                country: newValue.country,
                                                selectedPhoneCode: matchedCode?.phoneCode || "",
                                            });
                                            setErrors({ ...errors, country: false });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Country *"
                                                size="small"
                                                error={errors.country}
                                            />
                                        )}
                                        sx={{ flex: 2 }}
                                    />
                                </Box>
                            </div>
                            <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                                <p className="-mb-1 mt-3 font-semibold text-[#433C50] md:mt-0 lg:mt-0">Alternate Address</p>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Street"
                                        placeholder="Street"
                                        value={alternateAddress.street}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, street: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="City"
                                        placeholder="City"
                                        value={alternateAddress.city}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, city: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                    <TextField
                                        label="State"
                                        placeholder="State"
                                        value={alternateAddress.state}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, state: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Pincode"
                                        placeholder="Pincode"
                                        value={alternateAddress.pincode}
                                        onChange={(e) => setAlternateAddress({ ...alternateAddress, pincode: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{
                                            flex: 2,
                                        }}
                                        disabled={isSameAddress}
                                    />
                                    <Autocomplete
                                        options={country}
                                        getOptionLabel={(option) => option.country}
                                        value={country.find((c) => c.id === alternateAddress.selectedCountryId) || null}
                                        onChange={(_, newValue) => {
                                            setAlternateAddress((prev) => ({
                                                ...prev,
                                                selectedCountryId: newValue?.id || "",
                                                country: newValue?.country || "",
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
                                        disabled={isSameAddress}
                                    />
                                </Box>
                            </div>
                        </div>
                        <div>
                            <div>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={isSameAddress}
                                            onChange={handleSameAddressToggle}
                                        />
                                    }
                                    label="Same as Permanant Address"
                                    sx={{ color: "#433C50" }}
                                />
                            </div>
                            <p className="text-xs text-[#87848d] md:text-sm lg:text-sm">
                                Check if your permanant address is same as your alternate address
                            </p>
                        </div>
                    </div>

                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <Autocomplete
                            disabled={isSuperAdminEmployee} // ⛔ DISABLED FOR SUPER ADMIN
                            options={roles.filter((r) => r.name !== "Super Admin")}
                            getOptionLabel={(option) => option.name}
                            value={roles.find((r) => r.name === form.role.name) || null}
                            onChange={(_, newValue) => {
                                if (isSuperAdminEmployee) {
                                    setLocalSnackbarMessage("Super Admin role cannot be edited.");
                                    setLocalSnackbarSeverity("error");
                                    setSnackbarOpen(true);
                                    return;
                                }
                                setForm({
                                    ...form,
                                    role: {
                                        id: newValue?.id || "",
                                        name: newValue?.name || "",
                                    },
                                });
                                setErrors({ ...errors, role: false });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Role *"
                                    size="small"
                                    error={!isSuperAdminEmployee && errors.role}
                                />
                            )}
                            sx={{ flex: 1 }}
                        />

                        <Autocomplete
                            disabled={isSuperAdminEmployee} // ⛔ DISABLED FOR SUPER ADMIN
                            options={isSuperAdminEmployee ? [] : getReportToOptions()}
                            getOptionLabel={(option) => formatEmployeeName(option)}
                            value={isSuperAdminEmployee ? null : getReportToOptions().find((emp) => emp.id === form.reportTo) || null}
                            onChange={(_, newValue) => {
                                if (isSuperAdminEmployee) return;
                                setForm({ ...form, reportTo: newValue?.id || "" });
                                setErrors({ ...errors, reportTo: false });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Report To *"
                                    size="small"
                                    error={!isSuperAdminEmployee && errors.reportTo}
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
                    </Box>
                    <Box className="flex w-full flex-col gap-4 lg:flex-row">
                        <TextField
                            label="Target Amount"
                            placeholder="Set employee target"
                            type="number"
                            value={form.targetAmount}
                            onChange={handleChange("targetAmount")}
                            fullWidth
                            size="small"
                            helperText="Target is used in Analytics target achievement."
                            sx={{ flex: 1 }}
                        />
                    </Box>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-green-600 px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <UserPlus size={20} />
                            Update Employee
                        </Button>
                    </div>
                </div>
            )}
            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {/* <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert> */}
                {(snackbarMessage || localSnackbarMessage) && (
                    <Alert
                        severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                        variant="filled"
                        onClose={handleSnackbarClose}
                    >
                        {snackbarMessage || localSnackbarMessage}
                    </Alert>
                )}
            </Snackbar>
        </>
    );
};

export default EditEmployee;
