// import React, { useState } from "react";
// import assets from "../../assets/assets";
// import { countries } from "country-data";
// import { Alert, Autocomplete, Snackbar, TextField, createFilterOptions } from "@mui/material";
// import axios from "axios";
// import { API_BASE_URL } from "../../utils/api";
// import { usePublicCompany } from "../../context/PublicCompanyContext";

// const countryOptions = countries.all
//     .filter((country) => country.countryCallingCodes.length > 0)
//     .map((country) => ({
//         label: `${country.name} ${country.alpha2} ${country.countryCallingCodes[0]}`,
//         code: country.countryCallingCodes[0],
//         name: country.name,
//         alpha2: country.alpha2,
//     }));

// // Exact filter from your Signup code
// const filter = createFilterOptions({
//     stringify: (option) => `${option.name} ${option.alpha2} ${option.code}`,
//     trim: true,
//     matchFrom: "any",
// });

// const EnquiryNow = () => {
//     const { companyData } = usePublicCompany();
//     const [mobileCodeObj, setMobileCodeObj] = useState(countryOptions.find((opt) => opt.code === "+91") || null);
//     const [phoneCodeObj, setPhoneCodeObj] = useState(countryOptions.find((opt) => opt.code === "+91") || null);

//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("error");

//     const [form, setForm] = useState({
//         name: "",
//         companyName: "",
//         mobile: "",
//         phone: "",
//         email: "",
//         leadSource: "",
//         address: "",
//         description: "",
//     });

//     const handleChange = (field) => (e) => {
//         setForm({ ...form, [field]: e.target.value });
//     };

//     const validateFields = () => {
//         const requiredFields = {
//             name: "Your Name",
//             companyName: "Company Name",
//             mobile: "Mobile",
//             email: "Email Id",
//             leadSource: "Lead Source",
//         };

//         for (const field in requiredFields) {
//             if (!form[field]?.trim()) {
//                 setSnackbarMessage(`${requiredFields[field]} is required`);
//                 setSnackbarSeverity("error");
//                 setSnackbarOpen(true);
//                 return false;
//             }
//         }

//         if (!/^\d{10}$/.test(form.mobile)) {
//             setSnackbarMessage("Mobile number must be exactly 10 digits");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         if (form.phone && !/^\d{10}$/.test(form.phone)) {
//             setSnackbarMessage("Phone number must be exactly 10 digits");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//             setSnackbarMessage("Enter a valid email address");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return false;
//         }

//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateFields()) return;

//         if (!companyData || !companyData.id || !companyData.companySlug) {
//             setSnackbarMessage("Company information not loaded. Please try again.");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         try {
//             // Add space after country code for readability
//             const fullMobile = mobileCodeObj?.code ? mobileCodeObj.code + " " + form.mobile.trim() : "+91 " + form.mobile.trim();

//             const fullPhone = form.phone ? (phoneCodeObj?.code ? phoneCodeObj.code + " " + form.phone.trim() : "+91 " + form.phone.trim()) : null;

//             await axios.post(`${API_BASE_URL}/landing-page-lead/create`, {
//                 name: form.name.trim(),
//                 companyName: form.companyName.trim(),
//                 mobile: fullMobile,
//                 phone: fullPhone,
//                 email: form.email.trim(),
//                 leadSource: form.leadSource,
//                 address: form.address?.trim() || null,
//                 description: form.description?.trim() || null,
//                 companySlug: companyData.companySlug,
//                 org_id: companyData.id,
//             });

//             setSnackbarMessage("Enquiry submitted successfully!");
//             setSnackbarSeverity("success");
//             setSnackbarOpen(true);

//             // Reset form
//             setForm({
//                 name: "",
//                 companyName: "",
//                 mobile: "",
//                 phone: "",
//                 email: "",
//                 leadSource: "",
//                 address: "",
//                 description: "",
//             });
//         } catch (err) {
//             console.error("Enquiry submission error:", err);
//             setSnackbarMessage(err.response?.data?.message || "Failed to submit enquiry. Please try again.");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//         }
//     };

//     return (
//         <div className="px-4 pt-12 md:px-20 md:pt-16 lg:px-28 lg:pt-20">
//             <div className="flex flex-col items-center gap-7 text-gray-700 dark:text-white">
//                 <div className="text-3xl md:text-5xl">Get Enquiry With Us</div>
//                 <div className="text-center text-sm md:text-lg">
//                     Our system automates your Business and Support you to increase your Sales Revenue
//                 </div>

//                 <form
//                     onSubmit={handleSubmit}
//                     className="grid w-full max-w-2xl gap-3 md:grid-cols-2"
//                 >
//                     {/* Your Name */}
//                     <div>
//                         <p className="mb-2 text-sm font-medium">
//                             Your Name <span className="text-red-500">*</span>
//                         </p>
//                         <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
//                             <img
//                                 src={assets.person_icon}
//                                 alt=""
//                                 className="h-auto w-5"
//                             />
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={form.name}
//                                 onChange={handleChange("name")}
//                                 placeholder="Enter your name"
//                                 className="w-full bg-transparent p-3 text-sm outline-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Company Name */}
//                     <div>
//                         <p className="mb-2 text-sm font-medium">
//                             Company Name <span className="text-red-500">*</span>
//                         </p>
//                         <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
//                             <img
//                                 src={assets.company_icon}
//                                 alt=""
//                                 className="h-auto w-4"
//                             />
//                             <input
//                                 type="text"
//                                 name="companyName"
//                                 value={form.companyName}
//                                 onChange={handleChange("companyName")}
//                                 placeholder="Enter your company name"
//                                 className="w-full bg-transparent p-3 text-sm outline-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Mobile - Exact Autocomplete from Signup */}
//                     <div>
//                         <p className="mb-2 text-sm font-medium">
//                             Mobile <span className="text-red-500">*</span>
//                         </p>
//                         <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
//                             <Autocomplete
//                                 size="small"
//                                 options={countryOptions}
//                                 filterOptions={(options, state) =>
//                                     filter(options, state).filter((opt, index, self) => index === self.findIndex((o) => o.code === opt.code))
//                                 }
//                                 getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
//                                 value={mobileCodeObj}
//                                 onChange={(e, newValue) => {
//                                     setMobileCodeObj(newValue);
//                                 }}
//                                 renderOption={(props, option) => <li {...props}>{option.code}</li>}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         placeholder="+91"
//                                         variant="standard"
//                                         InputProps={{
//                                             ...params.InputProps,
//                                             disableUnderline: true,
//                                         }}
//                                         sx={{
//                                             width: "110px",
//                                             "& .MuiInputBase-root": {
//                                                 fontSize: "0.875rem",
//                                                 padding: "12px 8px",
//                                             },
//                                         }}
//                                     />
//                                 )}
//                                 isOptionEqualToValue={(option, value) => option.code === value?.code}
//                                 sx={{ flex: "0 0 auto" }}
//                             />
//                             <div className="mx-2 border-r border-gray-300 dark:border-gray-600" />
//                             <img
//                                 src={assets.mobile_icon}
//                                 alt=""
//                                 className="h-auto w-4"
//                             />
//                             <input
//                                 type="text"
//                                 name="mobile"
//                                 value={form.mobile}
//                                 onChange={handleChange("mobile")}
//                                 placeholder="Enter mobile number"
//                                 className="w-full bg-transparent p-3 text-sm outline-none"
//                             />

//                             {/* Hidden input to submit the code */}
//                             <input
//                                 type="hidden"
//                                 name="mobileCode"
//                                 value={mobileCodeObj?.code || ""}
//                             />
//                         </div>
//                     </div>

//                     {/* Phone - Same Exact Autocomplete */}
//                     <div>
//                         <p className="mb-2 text-sm font-medium">Phone</p>
//                         <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
//                             <Autocomplete
//                                 size="small"
//                                 options={countryOptions}
//                                 filterOptions={(options, state) =>
//                                     filter(options, state).filter((opt, index, self) => index === self.findIndex((o) => o.code === opt.code))
//                                 }
//                                 getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
//                                 value={phoneCodeObj}
//                                 onChange={(e, newValue) => {
//                                     setPhoneCodeObj(newValue);
//                                 }}
//                                 renderOption={(props, option) => <li {...props}>{option.code}</li>}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         placeholder="+91"
//                                         variant="standard"
//                                         InputProps={{
//                                             ...params.InputProps,
//                                             disableUnderline: true,
//                                         }}
//                                         sx={{
//                                             width: "110px",
//                                             "& .MuiInputBase-root": {
//                                                 fontSize: "0.875rem",
//                                                 padding: "12px 8px",
//                                             },
//                                         }}
//                                     />
//                                 )}
//                                 isOptionEqualToValue={(option, value) => option.code === value?.code}
//                                 sx={{ flex: "0 0 auto" }}
//                             />
//                             <div className="mx-2 border-r border-gray-300 dark:border-gray-600" />
//                             <img
//                                 src={assets.phone_icon}
//                                 alt=""
//                                 className="h-auto w-4"
//                             />
//                             <input
//                                 type="text"
//                                 name="phone"
//                                 value={form.phone}
//                                 onChange={handleChange("phone")}
//                                 placeholder="Enter phone number"
//                                 className="w-full bg-transparent p-3 text-sm outline-none"
//                             />

//                             {/* Hidden input to submit the code */}
//                             <input
//                                 type="hidden"
//                                 name="phoneCode"
//                                 value={phoneCodeObj?.code || ""}
//                             />
//                         </div>
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <p className="mb-2 text-sm font-medium">
//                             Email Id <span className="text-red-500">*</span>
//                         </p>
//                         <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
//                             <img
//                                 src={assets.email_icon}
//                                 alt=""
//                                 className="h-auto w-5"
//                             />
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={form.email}
//                                 onChange={handleChange("email")}
//                                 placeholder="Enter your email"
//                                 className="w-full bg-transparent p-3 text-sm outline-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Lead Source */}
//                     <div>
//                         <p className="mb-2 text-sm font-medium">
//                             Lead Source <span className="text-red-500">*</span>
//                         </p>
//                         <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
//                             <img
//                                 src={assets.lead_icon}
//                                 alt=""
//                                 className="h-auto w-4"
//                             />
//                             <select
//                                 name="leadSource"
//                                 value={form.leadSource}
//                                 onChange={handleChange("leadSource")}
//                                 className="w-full bg-transparent p-3 text-sm outline-none"
//                             >
//                                 <option
//                                     value=""
//                                     disabled
//                                 >
//                                     Select lead source
//                                 </option>
//                                 <option value="Social Media">Social Media</option>
//                                 <option value="Google">Google</option>
//                                 <option value="Website">Website</option>
//                                 <option value="Self Generated">Self Generated</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Address & Description */}
//                     <div className="sm:col-span-2">
//                         <p className="mb-2 text-sm font-medium">Address</p>
//                         <textarea
//                             name="address"
//                             value={form.address}
//                             onChange={handleChange("address")}
//                             placeholder="Enter address"
//                             rows={1}
//                             className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none dark:border-gray-600"
//                         />
//                     </div>

//                     <div className="sm:col-span-2">
//                         <p className="mb-2 text-sm font-medium">Description</p>
//                         <textarea
//                             name="description"
//                             value={form.description}
//                             onChange={handleChange("description")}
//                             placeholder="Describe your requirement"
//                             rows={2}
//                             className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none dark:border-gray-600"
//                         />
//                     </div>

//                     {/* Submit */}
//                     <button
//                         type="submit"
//                         className="flex w-max cursor-pointer gap-2 rounded-full bg-gradient-to-r from-[#40403f] to-[#000000] dark:from-[#000000] dark:to-[#40403f] px-10 py-3 text-sm text-white transition-all hover:scale-105"
//                     >
//                         Submit{" "}
//                         <img
//                             src={assets.arrow_icon}
//                             alt=""
//                             className="w-4"
//                         />
//                     </button>
//                 </form>
//             </div>
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={() => setSnackbarOpen(false)}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     onClose={() => setSnackbarOpen(false)}
//                     severity={snackbarSeverity}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </div>
//     );
// };

// export default EnquiryNow;

import React, { useState } from "react";
import assets from "../../assets/assets";
import { countries } from "country-data";
import { Alert, Autocomplete, Snackbar, TextField, createFilterOptions } from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";
import { usePublicCompany } from "../../context/PublicCompanyContext";

const countryOptions = countries.all
    .filter((country) => country.countryCallingCodes.length > 0)
    .map((country) => ({
        label: `${country.name} ${country.alpha2} ${country.countryCallingCodes[0]}`,
        code: country.countryCallingCodes[0],
        name: country.name,
        alpha2: country.alpha2,
    }));

// Exact filter from your Signup code
const filter = createFilterOptions({
    stringify: (option) => `${option.name} ${option.alpha2} ${option.code}`,
    trim: true,
    matchFrom: "any",
});

const EnquiryNow = () => {
    const { companyData } = usePublicCompany();
    const [mobileCodeObj, setMobileCodeObj] = useState(countryOptions.find((opt) => opt.code === "+91") || null);
    const [phoneCodeObj, setPhoneCodeObj] = useState(countryOptions.find((opt) => opt.code === "+91") || null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const [form, setForm] = useState({
        name: "",
        companyName: "",
        mobile: "",
        phone: "",
        email: "",
        leadSource: "",
        address: "",
        description: "",
    });

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const validateFields = () => {
        const requiredFields = {
            name: "Your Name",
            mobile: "Mobile",
            email: "Email Id",
        };

        for (const field in requiredFields) {
            if (!form[field]?.trim()) {
                setSnackbarMessage(`${requiredFields[field]} is required`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return false;
            }
        }

        if (!/^\d{10}$/.test(form.mobile)) {
            setSnackbarMessage("Mobile number must be exactly 10 digits");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        if (form.phone && !/^\d{10}$/.test(form.phone)) {
            setSnackbarMessage("Phone number must be exactly 10 digits");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setSnackbarMessage("Enter a valid email address");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFields()) return;

        if (!companyData || !companyData.id || !companyData.companySlug) {
            setSnackbarMessage("Company information not loaded. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            // Add space after country code for readability
            const fullMobile = mobileCodeObj?.code ? mobileCodeObj.code + " " + form.mobile.trim() : "+91 " + form.mobile.trim();

            const fullPhone = form.phone ? (phoneCodeObj?.code ? phoneCodeObj.code + " " + form.phone.trim() : "+91 " + form.phone.trim()) : null;

            await axios.post(`${API_BASE_URL}/landing-page-lead/create`, {
                name: form.name.trim(),
                companyName: form.companyName.trim() || null,
                mobile: fullMobile,
                phone: fullPhone,
                email: form.email.trim(),
                leadSource: form.leadSource || null,
                address: form.address?.trim() || null,
                description: form.description?.trim() || null,
                companySlug: companyData.companySlug,
                org_id: companyData.id,
            });

            setSnackbarMessage("Enquiry submitted successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            // Reset form
            setForm({
                name: "",
                companyName: "",
                mobile: "",
                phone: "",
                email: "",
                leadSource: "",
                address: "",
                description: "",
            });
        } catch (err) {
            console.error("Enquiry submission error:", err);
            setSnackbarMessage(err.response?.data?.message || "Failed to submit enquiry. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-20 dark:bg-gray-900 md:px-8 lg:px-20 xl:px-28">
            <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* ================= IMAGE (LG+) ================= */}
                    <div className="relative hidden md:block lg:hidden">
                        <div className="sticky top-24">
                            <img
                                src={assets.enquiry_hero}
                                alt="Enquiry"
                                className="h-[300px] w-full rounded-2xl object-cover shadow-2xl"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 lg:max-w-xl">
                        <div>
                            <div className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Get Enquiry With Us</div>
                            <div className="mb-4 text-gray-600 dark:text-gray-300">
                                Our system automates your Business and Support you to increase your Sales Revenue
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="grid w-full max-w-2xl gap-3 md:grid-cols-2"
                            >
                                {/* Your Name */}
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Your Name <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
                                        <img
                                            src={assets.person_icon}
                                            alt=""
                                            className="h-auto w-5"
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange("name")}
                                            placeholder="Enter your name"
                                            className="w-full bg-transparent p-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Company Name */}
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Company Name
                                    </p>
                                    <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
                                        <img
                                            src={assets.company_icon}
                                            alt=""
                                            className="h-auto w-4"
                                        />
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={form.companyName}
                                            onChange={handleChange("companyName")}
                                            placeholder="Enter your company name"
                                            className="w-full bg-transparent p-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Mobile - Exact Autocomplete from Signup */}
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Mobile <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                                        <Autocomplete
                                            size="small"
                                            options={countryOptions}
                                            filterOptions={(options, state) =>
                                                filter(options, state).filter(
                                                    (opt, index, self) => index === self.findIndex((o) => o.code === opt.code),
                                                )
                                            }
                                            getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
                                            value={mobileCodeObj}
                                            onChange={(e, newValue) => {
                                                setMobileCodeObj(newValue);
                                            }}
                                            renderOption={(props, option) => <li {...props}>{option.code}</li>}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="+91"
                                                    variant="standard"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        disableUnderline: true,
                                                    }}
                                                    sx={{
                                                        width: "110px",
                                                        "& .MuiInputBase-root": {
                                                            fontSize: "0.875rem",
                                                            padding: "12px 8px",
                                                        },
                                                    }}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.code === value?.code}
                                            sx={{ flex: "0 0 auto" }}
                                        />
                                        <div className="mx-2 border-r border-gray-300 dark:border-gray-600" />
                                        <img
                                            src={assets.mobile_icon}
                                            alt=""
                                            className="h-auto w-4"
                                        />
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={form.mobile}
                                            onChange={handleChange("mobile")}
                                            placeholder="Enter mobile number"
                                            className="w-full bg-transparent p-3 text-sm outline-none"
                                        />

                                        {/* Hidden input to submit the code */}
                                        <input
                                            type="hidden"
                                            name="mobileCode"
                                            value={mobileCodeObj?.code || ""}
                                        />
                                    </div>
                                </div>

                                {/* Phone - Same Exact Autocomplete */}
                                <div>
                                    <p className="mb-2 text-sm font-medium">Phone</p>
                                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                                        <Autocomplete
                                            size="small"
                                            options={countryOptions}
                                            filterOptions={(options, state) =>
                                                filter(options, state).filter(
                                                    (opt, index, self) => index === self.findIndex((o) => o.code === opt.code),
                                                )
                                            }
                                            getOptionLabel={(option) => (typeof option === "string" ? option : option.code)}
                                            value={phoneCodeObj}
                                            onChange={(e, newValue) => {
                                                setPhoneCodeObj(newValue);
                                            }}
                                            renderOption={(props, option) => <li {...props}>{option.code}</li>}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="+91"
                                                    variant="standard"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        disableUnderline: true,
                                                    }}
                                                    sx={{
                                                        width: "110px",
                                                        "& .MuiInputBase-root": {
                                                            fontSize: "0.875rem",
                                                            padding: "12px 8px",
                                                        },
                                                    }}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.code === value?.code}
                                            sx={{ flex: "0 0 auto" }}
                                        />
                                        <div className="mx-2 border-r border-gray-300 dark:border-gray-600" />
                                        <img
                                            src={assets.phone_icon}
                                            alt=""
                                            className="h-auto w-4"
                                        />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange("phone")}
                                            placeholder="Enter phone number"
                                            className="w-full bg-transparent p-3 text-sm outline-none"
                                        />

                                        {/* Hidden input to submit the code */}
                                        <input
                                            type="hidden"
                                            name="phoneCode"
                                            value={phoneCodeObj?.code || ""}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Email Id <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
                                        <img
                                            src={assets.email_icon}
                                            alt=""
                                            className="h-auto w-5"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange("email")}
                                            placeholder="Enter your email"
                                            className="w-full bg-transparent p-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Lead Source */}
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Lead Source
                                    </p>
                                    <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
                                        <img
                                            src={assets.lead_icon}
                                            alt=""
                                            className="h-auto w-4"
                                        />
                                        <select
                                            name="leadSource"
                                            value={form.leadSource}
                                            onChange={handleChange("leadSource")}
                                            className="w-full bg-transparent p-3 text-sm outline-none"
                                        >
                                            <option
                                                value=""
                                                disabled
                                            >
                                                Select lead source
                                            </option>
                                            <option value="Social Media">Social Media</option>
                                            <option value="Google">Google</option>
                                            <option value="Website">Website</option>
                                            <option value="Self Generated">Self Generated</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Address & Description */}
                                <div className="sm:col-span-2">
                                    <p className="mb-2 text-sm font-medium">Address</p>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange("address")}
                                        placeholder="Enter address"
                                        rows={1}
                                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none dark:border-gray-600"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="mb-2 text-sm font-medium">Description</p>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange("description")}
                                        placeholder="Describe your requirement"
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none dark:border-gray-600"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="flex w-max cursor-pointer gap-2 rounded-full bg-gradient-to-r from-[#40403f] to-[#000000] px-10 py-3 text-sm text-white transition-all hover:scale-105 dark:from-[#000000] dark:to-[#40403f]"
                                >
                                    Submit{" "}
                                    <img
                                        src={assets.arrow_icon}
                                        alt=""
                                        className="w-4"
                                    />
                                </button>
                            </form>
                        </div>
                    </div>
                    {/* ================= IMAGE (LG+) ================= */}
                    <div className="relative hidden lg:block">
                        <div className="sticky top-24">
                            <img
                                src={assets.enquiry_hero}
                                alt="Enquiry"
                                className="h-[700px] w-full rounded-2xl object-cover shadow-2xl"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </section>
    );
};

export default EnquiryNow;
