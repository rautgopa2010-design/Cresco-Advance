import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    getLandingPageSetup,
    updateLandingPageSetup,
    uploadHeroImage,
    removeHeroImage,
    uploadExpertiseImage,
    removeExpertiseImage,
    uploadAboutImage1,
    uploadAboutImage2,
    uploadAboutImage3,
    removeAboutImage,
    removeTrustedLogo,
    removeService,
    removeWork,
    removeTestimonial,
} from "../../../redux/actions/landingPageSetup";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { Box, TextField, Button, CircularProgress, Snackbar, Alert, IconButton, Typography } from "@mui/material";
import { MdOutlineSettingsAccessibility } from "react-icons/md";
import { CirclePlus, CircleMinus, Trash2 } from "lucide-react";
import { IMAGE_BASE_URL } from "../../../utils/api";

const UpdateLandingPageSetup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { landingPageSetup, snackbarMessage, snackbarSeverity, loading } = useSelector((state) => state.landingPageSetup || {});

    const [initialLoad, setInitialLoad] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [heroFile, setHeroFile] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);
    const [expertiseFile, setExpertiseFile] = useState(null);
    const [expertisePreview, setExpertisePreview] = useState(null);

    const [form, setForm] = useState({
        hero_headline: "",
        hero_subtext: "",
        hero_image: "",

        expertise_title: "",
        expertise_description: "",
        expertise_image: "",

        trusted_logos: [],
        newTrustedLogos: [],

        services_desc: "",
        services: [],

        about_hero_title: "",
        about_hero_desc: "",
        aboutImage1File: null,
        aboutImage1Preview: null,
        aboutImage2File: null,
        aboutImage2Preview: null,
        aboutImage3File: null,
        aboutImage3Preview: null,
        problems_title: "",
        problems_list: [],
        approach_steps: [],
        customer_notice_title: "",
        customer_notice_list: [],
        trust_title: "",
        trust_text: "",
        trust_points: [],
        about_cta_text: "",

        works_desc: "",
        works: [],

        testimonials_title: "",
        testimonials_subtext: "",
        testimonials: [],

        stats_satisfaction: 98,
        stats_worldwide: 50,
        stats_adoption: 3,
    });

    // Fetch data
    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getLandingPageSetup());
        setInitialLoad(false);
    }, [dispatch]);

    // Populate form when data arrives
    useEffect(() => {
        if (!landingPageSetup) return;

        if (landingPageSetup.about_image1) setForm((prev) => ({ ...prev, aboutImage1Preview: `${IMAGE_BASE_URL}${landingPageSetup.about_image1}` }));
        if (landingPageSetup.about_image2) setForm((prev) => ({ ...prev, aboutImage2Preview: `${IMAGE_BASE_URL}${landingPageSetup.about_image2}` }));
        if (landingPageSetup.about_image3) setForm((prev) => ({ ...prev, aboutImage3Preview: `${IMAGE_BASE_URL}${landingPageSetup.about_image3}` }));

        setForm({
            hero_headline: landingPageSetup.hero_headline || "",
            hero_subtext: landingPageSetup.hero_subtext || "",
            hero_image: landingPageSetup.hero_image || "",

            expertise_title: landingPageSetup.expertise_title || "",
            expertise_description: landingPageSetup.expertise_description || "",
            expertise_image: landingPageSetup.expertise_image || "",

            trusted_logos: landingPageSetup.trusted_logos || [],
            newTrustedLogos: [],

            services_desc: landingPageSetup.services_desc || "",
            services: (landingPageSetup.services || []).map((s) => ({
                title: s.title || s.name || "",
                description: s.description || "",
                icon: s.icon || "",
                newIcon: null,
            })),

            about_hero_title: landingPageSetup.about_hero_title || "",
            about_hero_desc: landingPageSetup.about_hero_desc || "",
            problems_title: landingPageSetup.problems_title || "",
            problems_list: landingPageSetup.problems_list || [],
            approach_steps: landingPageSetup.approach_steps || [],
            customer_notice_title: landingPageSetup.customer_notice_title || "",
            customer_notice_list: landingPageSetup.customer_notice_list || [],
            trust_title: landingPageSetup.trust_title || "",
            trust_text: landingPageSetup.trust_text || "",
            trust_points: landingPageSetup.trust_points || [],
            about_cta_text: landingPageSetup.about_cta_text || "",

            works_desc: landingPageSetup.works_desc || "",
            works: (landingPageSetup.works || []).map((w) => ({
                title: w.title || "",
                description: w.description || "",
                image: w.image || "",
                newImage: null,
            })),

            testimonials_title: landingPageSetup.testimonials_title || "",
            testimonials_subtext: landingPageSetup.testimonials_subtext || "",
            testimonials: (landingPageSetup.testimonials || []).map((t) => ({
                name: t.name || "",
                role: t.role || t.position || "",
                company: t.company || "",
                quote: t.quote || "",
                image: t.image || "",
                newImage: null,
            })),

            stats_satisfaction: landingPageSetup.stats_satisfaction || 98,
            stats_worldwide: landingPageSetup.stats_worldwide || 50,
            stats_adoption: landingPageSetup.stats_adoption || 3,
        });

        if (landingPageSetup.hero_image) {
            setHeroPreview(`${IMAGE_BASE_URL}${landingPageSetup.hero_image}`);
        }
    }, [landingPageSetup]);

    useEffect(() => {
        if (snackbarMessage) setSnackbarOpen(true);
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => dispatch(clearSnackbar()), 100);
    };

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setErrors({ ...errors, [field]: false });
    };

    const handleArrayChange = (arrayName, index, subField) => (e) => {
        const updated = [...form[arrayName]];
        updated[index][subField] = e.target.value;
        setForm({ ...form, [arrayName]: updated });
    };

    const addItem = (arrayName, defaultItem) => {
        const limits = {
            problems_list: 4,
            approach_steps: 4,
            works: 3,
            trust_points: 3,
        };
        if (limits[arrayName] && form[arrayName].length >= limits[arrayName]) return;

        setForm({ ...form, [arrayName]: [...form[arrayName], defaultItem] });
    };

    const removeItem = async (arrayName, index) => {
        const item = form[arrayName][index];

        // If it has an existing image in DB, delete it via API first
        if (arrayName === "services" && item.icon) {
            await dispatch(removeService(index));
        } else if (arrayName === "works" && item.image) {
            await dispatch(removeWork(index));
        } else if (arrayName === "testimonials" && item.image) {
            await dispatch(removeTestimonial(index));
        }

        // Then remove locally
        setForm({
            ...form,
            [arrayName]: form[arrayName].filter((_, i) => i !== index),
        });
    };

    const handleFileArray = (fieldName) => (e) => {
        const files = Array.from(e.target.files);
        setForm({ ...form, [fieldName]: [...form[fieldName], ...files] });
    };

    const removeNewFile = (fieldName, index) => {
        setForm({ ...form, [fieldName]: form[fieldName].filter((_, i) => i !== index) });
    };

    // Hero image validation (landscape only)
    const handleHeroImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;

        img.onload = () => {
            if (img.width <= img.height) {
                alert("Hero image must be landscape (wider than tall).");
                URL.revokeObjectURL(url);
                return;
            }
            setHeroFile(file);
            setHeroPreview(url);
        };
    };

    const handleUploadHero = async () => {
        if (!heroFile) return;
        await dispatch(uploadHeroImage(heroFile));
        setHeroFile(null);
    };

    const handleRemoveHero = async () => {
        await dispatch(removeHeroImage());
        setHeroPreview(null);
        setForm({ ...form, hero_image: "" });
    };

    const handleExpertiseImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setExpertiseFile(file);
        setExpertisePreview(URL.createObjectURL(file));
    };

    const handleUploadExpertise = async () => {
        if (!expertiseFile) return;
        await dispatch(uploadExpertiseImage(expertiseFile));
        setExpertiseFile(null);
    };

    const handleRemoveExpertise = async () => {
        await dispatch(removeExpertiseImage());
        setExpertisePreview(null);
        setForm((prev) => ({ ...prev, expertise_image: "" }));
    };

    const validateForm = () => {
        const temp = {};
        if (!form.hero_headline.trim()) temp.hero_headline = true;
        if (!form.hero_subtext.trim()) temp.hero_subtext = true;
        if (!form.expertise_title.trim()) temp.expertise_title = true;
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            alert("Please fill all required fields.");
            return;
        }

        const formData = new FormData();

        // Simple text/number fields
        const textFields = [
            "hero_headline",
            "hero_subtext",
            "expertise_title",
            "expertise_description",
            "services_desc",
            "about_hero_title",
            "about_hero_desc",
            "problems_title",
            "customer_notice_title",
            "trust_title",
            "trust_text",
            "about_cta_text",
            "works_desc",
            "testimonials_title",
            "testimonials_subtext",
            "stats_satisfaction",
            "stats_worldwide",
            "stats_adoption",
        ];
        textFields.forEach((key) => formData.append(key, form[key] ?? ""));

        // JSON arrays (full data – important!)
        formData.append("problems_list", JSON.stringify(form.problems_list));
        formData.append("approach_steps", JSON.stringify(form.approach_steps));
        formData.append("customer_notice_list", JSON.stringify(form.customer_notice_list));
        formData.append("trust_points", JSON.stringify(form.trust_points));

        // === FIXED: Send FULL latest text data for services, works, testimonials ===
        // Do NOT include old icon/image paths here — backend will preserve them if no new file uploaded
        formData.append(
            "services",
            JSON.stringify(
                form.services.map((s) => ({
                    title: s.title || s.name || "",
                    description: s.description || "",
                })),
            ),
        );

        formData.append(
            "works",
            JSON.stringify(
                form.works.map((w) => ({
                    title: w.title || "",
                    description: w.description || "",
                })),
            ),
        );

        formData.append(
            "testimonials",
            JSON.stringify(
                form.testimonials.map((t) => ({
                    name: t.name || "",
                    role: t.role || t.position || "",
                    company: t.company || "",
                    quote: t.quote || "",
                })),
            ),
        );

        // New files (trusted logos – append multiple)
        form.newTrustedLogos.forEach((file) => formData.append("trusted_logos", file));

        // New files for services, works, testimonials (indexed by position)
        form.services.forEach((s) => s.newIcon && formData.append("service_icon", s.newIcon));
        form.works.forEach((w) => w.newImage && formData.append("work_image", w.newImage));
        form.testimonials.forEach((t) => t.newImage && formData.append("testimonial_image", t.newImage));

        await dispatch(updateLandingPageSetup(formData));
        setTimeout(() => navigate(-1), 1500);
    };

    if (initialLoad || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-6">
            <div className="flex items-center justify-between">
                <Typography
                    variant="h5"
                    className="font-bold text-[#433C50]"
                >
                    Update Landing Page Setup
                </Typography>
                <Button
                    onClick={() => navigate(-1)}
                    variant="outlined"
                    className="rounded-full"
                >
                    Back
                </Button>
            </div>

            {/* ==================== HERO SECTION ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-blue-700"
                >
                    Hero Section
                </Typography>

                <TextField
                    label="Headline * (Supports gradient: wrap word in <span class='bg-gradient-to-r from-[#e54444] to-[#ea944d] bg-clip-text text-transparent'>word</span>)"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.hero_headline}
                    onChange={handleChange("hero_headline")}
                    error={!!errors.hero_headline}
                    helperText="Example: Converting effort into <span class='bg-gradient-to-r from-[#e54444] to-[#ea944d] bg-clip-text text-transparent'>extraordinary</span> outcomes."
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />
                <TextField
                    label="Subtext *"
                    fullWidth
                    multiline
                    rows={4}
                    value={form.hero_subtext}
                    onChange={handleChange("hero_subtext")}
                    error={!!errors.hero_subtext}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                <Typography className="pb-4 font-semibold">Upload Hero Image (Landscape only)</Typography>
                {heroPreview && (
                    <img
                        src={heroPreview}
                        alt="Hero"
                        className="max-h-96 w-full rounded-lg object-cover shadow"
                    />
                )}
                <div className="flex flex-wrap gap-4 pt-5">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageChange}
                    />
                    {heroFile && (
                        <Button
                            onClick={handleUploadHero}
                            variant="contained"
                            color="primary"
                        >
                            Upload Hero Image
                        </Button>
                    )}
                    {form.hero_image && (
                        <Button
                            onClick={handleRemoveHero}
                            variant="outlined"
                            color="error"
                        >
                            Remove Hero Image
                        </Button>
                    )}
                </div>
            </Box>

            {/* ==================== EXPERTISE ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-cyan-700"
                >
                    Expertise Section
                </Typography>
                <TextField
                    label="Title *"
                    fullWidth
                    value={form.expertise_title}
                    onChange={handleChange("expertise_title")}
                    error={!!errors.expertise_title}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />
                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={5}
                    value={form.expertise_description}
                    onChange={handleChange("expertise_description")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />
                <Typography className="pb-4 font-semibold">Upload Expertise Image (Landscape only)</Typography>
                {expertisePreview && (
                    <img
                        src={expertisePreview}
                        alt="Expertise"
                        className="max-h-96 w-full rounded-lg object-cover shadow"
                    />
                )}
                <div className="flex flex-wrap gap-4 pt-5">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleExpertiseImageChange}
                    />
                    {expertiseFile && (
                        <Button
                            onClick={handleUploadExpertise}
                            variant="contained"
                            color="primary"
                        >
                            Upload Expertise Image
                        </Button>
                    )}
                    {form.expertise_image && (
                        <Button
                            onClick={handleRemoveExpertise}
                            variant="outlined"
                            color="error"
                        >
                            Remove Expertise Image
                        </Button>
                    )}
                </div>
            </Box>

            {/* ==================== TRUSTED LOGOS ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-indigo-700"
                >
                    Trusted By Leading Companies (Logos)
                </Typography>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileArray("newTrustedLogos")}
                    className="mb-6"
                />

                <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
                    {/* Existing logos from DB */}
                    {form.trusted_logos.map((logo, i) => (
                        <div
                            key={`existing-${i}`}
                            className="relative"
                        >
                            <img
                                src={`${IMAGE_BASE_URL}${logo}`}
                                alt="logo"
                                className="h-24 rounded border object-contain"
                            />
                            <IconButton
                                size="small"
                                className="absolute -right-2 -top-2 bg-red-500 text-white hover:bg-red-700"
                                onClick={() => dispatch(removeTrustedLogo(i))}
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </div>
                    ))}

                    {/* Newly uploaded logos (not yet saved) */}
                    {form.newTrustedLogos.map((file, i) => (
                        <div
                            key={`new-${i}`}
                            className="relative"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt="new logo"
                                className="h-24 rounded border object-contain"
                            />
                            <IconButton
                                size="small"
                                className="absolute -right-2 -top-2 bg-red-500 text-white hover:bg-red-700"
                                onClick={() => removeNewFile("newTrustedLogos", i)}
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </div>
                    ))}
                </div>
            </Box>

            {/* ==================== SERVICES ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-purple-700"
                >
                    Services Section
                </Typography>
                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.services_desc}
                    onChange={handleChange("services_desc")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                {form.services.map((service, i) => (
                    <Box
                        key={i}
                        className="mb-8 rounded-lg border p-6"
                    >
                        <div className="flex items-center justify-between">
                            <Typography
                                variant="subtitle1"
                                className="font-semibold"
                            >
                                Service {i + 1}
                            </Typography>
                            <IconButton onClick={() => removeItem("services", i)}>
                                <CircleMinus className="text-red-600" />
                            </IconButton>
                        </div>

                        <TextField
                            label="Title"
                            fullWidth
                            value={service.name || service.title || ""}
                            onChange={handleArrayChange("services", i, "name")}
                            sx={{ mb: { xs: 0, sm: 1, md: 2, lg: 4 } }}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={service.description || ""}
                            onChange={handleArrayChange("services", i, "description")}
                            sx={{ mb: { xs: 0, sm: 1, md: 2, lg: 4 } }}
                        />

                        {/* Existing icon preview */}
                        {service.icon && !service.newIcon && (
                            <div className="relative mb-4 inline-block">
                                <img
                                    src={`${IMAGE_BASE_URL}${service.icon}`}
                                    alt="icon"
                                    className="h-24 w-24 rounded-full border object-cover"
                                />
                                <IconButton
                                    size="small"
                                    className="absolute -right-2 -top-2 bg-red-500 text-white"
                                    onClick={() => {
                                        // Set icon to null in current service
                                        const updated = [...form.services];
                                        updated[i].icon = null;
                                        setForm({ ...form, services: updated });
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        )}

                        {/* New uploaded icon preview with delete button */}
                        {service.newIcon && (
                            <div className="relative mb-4 inline-block">
                                <img
                                    src={URL.createObjectURL(service.newIcon)}
                                    alt="new icon preview"
                                    className="h-24 w-24 rounded-full border object-cover"
                                />
                                <IconButton
                                    size="small"
                                    className="absolute -right-2 -top-2 bg-red-500 text-white"
                                    onClick={() => {
                                        const updated = [...form.services];
                                        updated[i].newIcon = null;
                                        setForm({ ...form, services: updated });
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const updated = [...form.services];
                                    updated[i].newIcon = file;
                                    setForm({ ...form, services: updated });
                                }
                            }}
                        />
                    </Box>
                ))}

                <Button
                    onClick={() => addItem("services", { name: "", description: "", icon: "" })}
                    startIcon={<CirclePlus />}
                >
                    Add Service
                </Button>
            </Box>

            {/* ==================== ABOUT US ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-amber-700"
                >
                    About Us Section
                </Typography>

                <TextField
                    label="Hero Title (Supports underline: <span class='underline decoration-[#e54444]/40 underline-offset-8'>word</span>)"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.about_hero_title}
                    onChange={handleChange("about_hero_title")}
                    helperText="Example: Your platform should feel like an <span class='underline decoration-[#e54444]/40 underline-offset-8'>advantage</span>, not a burden."
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                <TextField
                    label="Hero Description"
                    fullWidth
                    multiline
                    rows={5}
                    value={form.about_hero_desc}
                    onChange={handleChange("about_hero_desc")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                <TextField
                    label="Problems Title"
                    fullWidth
                    value={form.problems_title}
                    onChange={handleChange("problems_title")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                {/* Problems List (max 4) */}
                <Typography
                    className="pb-4"
                    sx={{ fontWeight: "bold" }}
                >
                    Problems List (max 4)
                </Typography>
                {form.problems_list.map((item, i) => (
                    <Box
                        key={i}
                        className="mb-4 flex items-center gap-3"
                    >
                        <TextField
                            fullWidth
                            value={item}
                            onChange={(e) => {
                                const updated = [...form.problems_list];
                                updated[i] = e.target.value;
                                setForm({ ...form, problems_list: updated });
                            }}
                        />
                        <IconButton onClick={() => removeItem("problems_list", i)}>
                            <CircleMinus className="text-red-600" />
                        </IconButton>
                    </Box>
                ))}
                {form.problems_list.length < 4 && (
                    <Button
                        onClick={() => addItem("problems_list", "")}
                        startIcon={<CirclePlus />}
                    >
                        Add Problem
                    </Button>
                )}

                {/* Approach Steps (max 4) */}
                <Typography
                    className="pb-4"
                    sx={{ fontWeight: "bold" }}
                >
                    Our Approach Steps (max 4)
                </Typography>
                {form.approach_steps.map((step, i) => (
                    <Box
                        key={i}
                        className="mb-6 rounded border p-4"
                    >
                        <div className="mb-3 flex justify-between">
                            <Typography>Step {i + 1}</Typography>
                            <IconButton onClick={() => removeItem("approach_steps", i)}>
                                <CircleMinus className="text-red-600" />
                            </IconButton>
                        </div>
                        <TextField
                            label="Step Number (e.g., 01)"
                            value={step.step || ""}
                            onChange={handleArrayChange("approach_steps", i, "step")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        <TextField
                            label="Title"
                            fullWidth
                            value={step.title || ""}
                            onChange={handleArrayChange("approach_steps", i, "title")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={step.desc || step.description || ""}
                            onChange={handleArrayChange("approach_steps", i, "desc")}
                        />
                    </Box>
                ))}
                {form.approach_steps.length < 4 && (
                    <Button
                        onClick={() => addItem("approach_steps", { step: "01", title: "", desc: "" })}
                        startIcon={<CirclePlus />}
                    >
                        Add Step
                    </Button>
                )}

                {/* Customer Notice */}
                <Typography
                    className="pb-4"
                    sx={{ fontWeight: "bold" }}
                >
                    Customer Notice Title
                </Typography>
                <TextField
                    fullWidth
                    value={form.customer_notice_title}
                    onChange={handleChange("customer_notice_title")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                <Typography
                    className="pb-4"
                    sx={{ fontWeight: "bold" }}
                >
                    Customer Notice List (max 4)
                </Typography>
                {form.customer_notice_list.map((item, i) => (
                    <Box
                        key={i}
                        className="mb-4 flex items-center gap-3"
                    >
                        <TextField
                            fullWidth
                            value={item}
                            onChange={(e) => {
                                const updated = [...form.customer_notice_list];
                                updated[i] = e.target.value;
                                setForm({ ...form, customer_notice_list: updated });
                            }}
                        />
                        <IconButton onClick={() => removeItem("customer_notice_list", i)}>
                            <CircleMinus className="text-red-600" />
                        </IconButton>
                    </Box>
                ))}
                {form.customer_notice_list.length < 4 && (
                    <Button
                        onClick={() => addItem("customer_notice_list", "")}
                        startIcon={<CirclePlus />}
                    >
                        Add Notice
                    </Button>
                )}

                {/* Trust Section */}
                <Typography
                    className="pb-4"
                    sx={{ fontWeight: "bold" }}
                >
                    Trust Section
                </Typography>
                <TextField
                    label="Title"
                    fullWidth
                    value={form.trust_title}
                    onChange={handleChange("trust_title")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 1,
                            md: 2,
                            lg: 4,
                        },
                    }}
                />
                <TextField
                    label="Text"
                    fullWidth
                    multiline
                    rows={4}
                    value={form.trust_text}
                    onChange={handleChange("trust_text")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 1,
                            md: 2,
                            lg: 4,
                        },
                    }}
                />

                {/* Trust Points (max 3) */}
                <Typography
                    className="pb-4"
                    sx={{ fontWeight: "bold" }}
                >
                    Trust Points (max 3)
                </Typography>
                {form.trust_points.map((point, i) => (
                    <Box
                        key={i}
                        className="mb-4 flex items-center gap-3"
                    >
                        <TextField
                            fullWidth
                            value={point}
                            onChange={(e) => {
                                const updated = [...form.trust_points];
                                updated[i] = e.target.value;
                                setForm({ ...form, trust_points: updated });
                            }}
                        />
                        <IconButton onClick={() => removeItem("trust_points", i)}>
                            <CircleMinus className="text-red-600" />
                        </IconButton>
                    </Box>
                ))}
                {form.trust_points.length < 3 && (
                    <Button
                        onClick={() => addItem("trust_points", "")}
                        startIcon={<CirclePlus />}
                    >
                        Add Point
                    </Button>
                )}

                <TextField
                    label="CTA Text"
                    fullWidth
                    value={form.about_cta_text}
                    onChange={handleChange("about_cta_text")}
                    sx={{
                        mt: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />
                {/* ==================== ABOUT US IMAGES ==================== */}
                <Typography
                    variant="h6"
                    className="pb-4 pt-6 text-xl font-bold text-red-700"
                >
                    About Us Floating Images
                </Typography>

                {[1, 2, 3].map((num) => {
                    const fileKey = `aboutImage${num}File`;
                    const previewKey = `aboutImage${num}Preview`;
                    const existingImageKey = `about_image${num}`;

                    const preview =
                        form[previewKey] || (landingPageSetup?.[existingImageKey] ? `${IMAGE_BASE_URL}${landingPageSetup[existingImageKey]}` : null);

                    const hasExistingImage = !!landingPageSetup?.[existingImageKey];
                    const hasNewFile = !!form[fileKey];

                    // Map number to correct upload action
                    const uploadActions = {
                        1: uploadAboutImage1,
                        2: uploadAboutImage2,
                        3: uploadAboutImage3,
                    };

                    const uploadAction = uploadActions[num];

                    return (
                        <Box
                            key={num}
                            className="mb-8"
                        >
                            <Typography className="mb-2 font-semibold">About Image {num}</Typography>
                            {preview && (
                                <img
                                    src={preview}
                                    alt={`About ${num}`}
                                    className="mb-4 max-h-96 w-full rounded-lg object-cover shadow"
                                />
                            )}
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setForm({
                                                ...form,
                                                [fileKey]: file,
                                                [previewKey]: URL.createObjectURL(file),
                                            });
                                        }
                                    }}
                                />
                                {hasNewFile && (
                                    <Button
                                        onClick={() => dispatch(uploadAction(form[fileKey]))}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Upload Image {num}
                                    </Button>
                                )}
                                {hasExistingImage && (
                                    <Button
                                        onClick={() => dispatch(removeAboutImage(num))}
                                        variant="outlined"
                                        color="error"
                                    >
                                        Remove Image {num}
                                    </Button>
                                )}
                            </div>
                        </Box>
                    );
                })}
            </Box>

            {/* ==================== WORKS ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-indigo-700"
                >
                    Our Latest Work (max 3)
                </Typography>
                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.works_desc}
                    onChange={handleChange("works_desc")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                {form.works.map((work, i) => (
                    <Box
                        key={i}
                        className="mb-8 rounded-lg border p-6"
                    >
                        <div className="mb-4 flex justify-between">
                            <Typography variant="subtitle1">Work {i + 1}</Typography>
                            <IconButton onClick={() => removeItem("works", i)}>
                                <CircleMinus className="text-red-600" />
                            </IconButton>
                        </div>
                        <TextField
                            label="Title"
                            fullWidth
                            value={work.title || ""}
                            onChange={handleArrayChange("works", i, "title")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={work.description || ""}
                            onChange={handleArrayChange("works", i, "description")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        {work.image && !work.newImage && (
                            <div className="relative mb-4">
                                <img
                                    src={`${IMAGE_BASE_URL}${work.image}`}
                                    alt="work"
                                    className="h-64 w-full rounded object-cover"
                                />
                                <IconButton
                                    size="small"
                                    className="absolute -right-2 -top-2 bg-red-500 text-white"
                                    onClick={() => {
                                        const updated = [...form.works];
                                        updated[i].image = null;
                                        setForm({ ...form, works: updated });
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        )}

                        {work.newImage && (
                            <div className="relative mb-4">
                                <img
                                    src={URL.createObjectURL(work.newImage)}
                                    alt="new work preview"
                                    className="h-64 w-full rounded object-cover"
                                />
                                <IconButton
                                    size="small"
                                    className="absolute -right-2 -top-2 bg-red-500 text-white"
                                    onClick={() => {
                                        const updated = [...form.works];
                                        updated[i].newImage = null;
                                        setForm({ ...form, works: updated });
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const updated = [...form.works];
                                    updated[i].newImage = file;
                                    setForm({ ...form, works: updated });
                                }
                            }}
                        />
                    </Box>
                ))}

                {form.works.length < 3 && (
                    <Button
                        onClick={() => addItem("works", { title: "", description: "", image: "" })}
                        startIcon={<CirclePlus />}
                    >
                        Add Work
                    </Button>
                )}
            </Box>

            {/* ==================== TESTIMONIALS ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-pink-700"
                >
                    Testimonials
                </Typography>

                <TextField
                    label="Title (Supports gradient: wrap in <span class='bg-gradient-to-r from-[#e54444] to-[#ea944d] bg-clip-text text-transparent'>text</span>)"
                    fullWidth
                    multiline
                    rows={2}
                    value={form.testimonials_title}
                    onChange={handleChange("testimonials_title")}
                    helperText="Example: Built for leaders who believe in <span class='bg-gradient-to-r from-[#e54444] to-[#ea944d] bg-clip-text text-transparent'>real relationships</span>"
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                <TextField
                    label="Subtext"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.testimonials_subtext}
                    onChange={handleChange("testimonials_subtext")}
                    sx={{
                        mb: {
                            xs: 0,
                            sm: 2,
                            md: 3,
                            lg: 5,
                        },
                    }}
                />

                {form.testimonials.map((t, i) => (
                    <Box
                        key={i}
                        className="mb-8 rounded-lg border p-6"
                    >
                        <div className="mb-4 flex justify-between">
                            <Typography>Testimonial {i + 1}</Typography>
                            <IconButton onClick={() => removeItem("testimonials", i)}>
                                <CircleMinus className="text-red-600" />
                            </IconButton>
                        </div>
                        <TextField
                            label="Name"
                            fullWidth
                            value={t.name || ""}
                            onChange={handleArrayChange("testimonials", i, "name")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        <TextField
                            label="Role / Position"
                            fullWidth
                            value={t.role || t.position || ""}
                            onChange={handleArrayChange("testimonials", i, "role")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        <TextField
                            label="Company"
                            fullWidth
                            value={t.company || ""}
                            onChange={handleArrayChange("testimonials", i, "company")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        <TextField
                            label="Quote"
                            fullWidth
                            multiline
                            rows={4}
                            value={t.quote || ""}
                            onChange={handleArrayChange("testimonials", i, "quote")}
                            sx={{
                                mb: {
                                    xs: 0,
                                    sm: 1,
                                    md: 2,
                                    lg: 4,
                                },
                            }}
                        />
                        {t.image && !t.newImage && (
                            <div className="relative mb-4 inline-block">
                                <img
                                    src={`${IMAGE_BASE_URL}${t.image}`}
                                    alt={t.name}
                                    className="h-24 w-24 rounded-full border object-cover"
                                />
                                <IconButton
                                    size="small"
                                    className="absolute -right-2 -top-2 bg-red-500 text-white"
                                    onClick={() => {
                                        const updated = [...form.testimonials];
                                        updated[i].image = null;
                                        setForm({ ...form, testimonials: updated });
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        )}

                        {t.newImage && (
                            <div className="relative mb-4 inline-block">
                                <img
                                    src={URL.createObjectURL(t.newImage)}
                                    alt={`${t.name} preview`}
                                    className="h-24 w-24 rounded-full border object-cover"
                                />
                                <IconButton
                                    size="small"
                                    className="absolute -right-2 -top-2 bg-red-500 text-white"
                                    onClick={() => {
                                        const updated = [...form.testimonials];
                                        updated[i].newImage = null;
                                        setForm({ ...form, testimonials: updated });
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const updated = [...form.testimonials];
                                    updated[i].newImage = file;
                                    setForm({ ...form, testimonials: updated });
                                }
                            }}
                        />
                    </Box>
                ))}

                <Button
                    onClick={() => addItem("testimonials", { name: "", role: "", company: "", quote: "", image: "" })}
                    startIcon={<CirclePlus />}
                >
                    Add Testimonial
                </Button>
            </Box>

            {/* ==================== STATS ==================== */}
            <Box className="rounded-lg border bg-white p-8 shadow-lg">
                <Typography
                    variant="h6"
                    className="pb-6 text-xl font-bold text-green-700"
                >
                    Key Statistics
                </Typography>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <TextField
                        label="Customer Satisfaction (%)"
                        type="number"
                        value={form.stats_satisfaction}
                        onChange={handleChange("stats_satisfaction")}
                        inputProps={{ min: 0, max: 100 }}
                    />
                    <TextField
                        label="Worldwide Clients (K+)"
                        type="number"
                        value={form.stats_worldwide}
                        onChange={handleChange("stats_worldwide")}
                        inputProps={{ min: 0 }}
                    />
                    <TextField
                        label="Faster Adoption Rate (x)"
                        type="number"
                        value={form.stats_adoption}
                        onChange={handleChange("stats_adoption")}
                        inputProps={{ min: 0 }}
                    />
                </div>
            </Box>

            {/* ==================== SUBMIT ==================== */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    startIcon={<MdOutlineSettingsAccessibility />}
                >
                    {loading ? <CircularProgress size={24} /> : "Update Landing Page"}
                </Button>
            </div>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UpdateLandingPageSetup;
