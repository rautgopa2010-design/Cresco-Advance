import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLandingPageSetup } from "../../../redux/actions/landingPageSetup";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import { CircularProgress, Typography, Snackbar, Alert } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { FaEdit, FaQuoteLeft, FaStar, FaCheck } from "react-icons/fa";
import { IMAGE_BASE_URL } from "../../../utils/api";

const ViewLandingPageSetup = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { landingPageSetup, snackbarMessage, snackbarSeverity } = useSelector((state) => state.landingPageSetup || {});

    const [initialLoad, setInitialLoad] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(getLandingPageSetup(user?.org_id));
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchData();
    }, [dispatch, user?.org_id]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => dispatch(clearSnackbar()), 100);
    };

    if (initialLoad) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!landingPageSetup) {
        return (
            <div className="-mt-20 flex h-screen w-full items-center justify-center text-lg font-bold text-gray-500">
                No landing page setup found. Please update company setup for dummy data, then edit as per your requirement
            </div>
        );
    }

    const orgId = user?.org_id || "default";

    return (
        <div className="">
            {/* Header with Edit Button */}
            <div className="mb-6 flex items-center justify-between text-nowrap">
                <Typography
                    variant="h6"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text !text-2xl !font-extrabold tracking-wide text-transparent"
                >
                    Landing Page Setup
                </Typography>
                <Button
                    onClick={() => navigate(`/settings/landing-page-setup/edit-landing-page-setup/${orgId}`)}
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
            <div className="space-y-10 rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-2xl backdrop-blur-xl transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] md:p-10">
                {/* Hero Section */}
                <div>
                    <h3 className="mb-4 border-b-2 border-blue-500 pb-2 text-lg font-semibold text-gray-800">Hero Section</h3>
                    <div className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-6">
                            <p
                                className="text-3xl font-bold text-blue-800"
                                dangerouslySetInnerHTML={{
                                    __html: landingPageSetup?.hero_headline || "",
                                }}
                            />
                            <p className="mt-3 text-lg text-gray-700">{landingPageSetup?.hero_subtext || "No subtext set"}</p>
                        </div>
                        {landingPageSetup?.hero_image ? (
                            <img
                                src={`${IMAGE_BASE_URL}${landingPageSetup.hero_image}`}
                                alt="Hero"
                                className="max-h-96 w-full rounded-xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="flex h-80 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">
                                No hero image uploaded
                            </div>
                        )}
                    </div>
                </div>

                {/* Expertise Section */}
                {(landingPageSetup?.expertise_title || landingPageSetup?.expertise_description) && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-cyan-500 pb-2 text-lg font-semibold text-gray-800">Expertise Section</h3>
                        <div className="space-y-6">
                            {landingPageSetup?.expertise_image ? (
                                <img
                                    src={`${IMAGE_BASE_URL}${landingPageSetup.expertise_image}`}
                                    alt="Expertise"
                                    className="max-h-96 w-full rounded-xl object-cover shadow-lg"
                                />
                            ) : (
                                <div className="flex h-80 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">
                                    No expertise image uploaded
                                </div>
                            )}
                            <div className="rounded-xl bg-cyan-50 p-8 shadow-md">
                                <h4 className="text-2xl font-bold text-cyan-800">{landingPageSetup?.expertise_title}</h4>
                                <p className="mt-4 text-gray-700">{landingPageSetup?.expertise_description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trusted By */}
                <div>
                    <h3 className="mb-4 border-b-2 border-indigo-500 pb-2 text-lg font-semibold text-gray-800">
                        {landingPageSetup?.trusted_title || "Trusted By Leading Companies"}
                    </h3>
                    {landingPageSetup?.trusted_logos?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {landingPageSetup?.trusted_logos.map((logo, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-center rounded-lg bg-white p-6 shadow-md"
                                >
                                    <img
                                        src={`${IMAGE_BASE_URL}${logo}`}
                                        alt={`Trusted logo ${i + 1}`}
                                        className="max-h-20 max-w-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No trusted logos added yet.</p>
                    )}
                </div>

                {/* Services Section */}
                <div>
                    <h3 className="mb-4 border-b-2 border-purple-500 pb-2 text-lg font-semibold text-gray-800">
                        {landingPageSetup?.services_title || "How can we help?"}
                    </h3>
                    {landingPageSetup?.services_desc && <p className="mb-6 text-lg text-gray-700">{landingPageSetup?.services_desc}</p>}
                    {landingPageSetup?.services?.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {landingPageSetup?.services.map((service, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center rounded-xl bg-purple-50 p-8 text-center shadow-md"
                                >
                                    {service.icon ? (
                                        <img
                                            src={`${IMAGE_BASE_URL}${service.icon}`}
                                            alt={service.title}
                                            className="mb-6 h-20 w-20 rounded-full object-cover shadow"
                                        />
                                    ) : (
                                        <div className="mb-6 h-20 w-20 rounded-full bg-gray-200"></div>
                                    )}
                                    <h4 className="text-xl font-semibold text-purple-800">{service.title || service.name || "Untitled Service"}</h4>
                                    <p className="mt-3 text-gray-700">{service.description || "No description"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No services added yet.</p>
                    )}
                </div>

                {/* About Us Hero */}
                {(landingPageSetup?.about_hero_title || landingPageSetup?.about_hero_desc) && (
                    <>
                        <div>
                            <h3 className="mb-4 border-b-2 border-amber-500 pb-2 text-lg font-semibold text-gray-800">About Us Section</h3>
                            <div className="rounded-xl bg-amber-50 p-8 shadow-md">
                                <h4
                                    className="text-3xl font-bold text-amber-800"
                                    dangerouslySetInnerHTML={{
                                        __html: landingPageSetup?.about_hero_title || "",
                                    }}
                                />
                                <p className="mt-4 text-lg text-gray-700">{landingPageSetup?.about_hero_desc}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-4 border-b-2 border-amber-500 pb-2 text-lg font-semibold text-gray-800">
                                About Us Section - Floating Images
                            </h3>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((num) => {
                                    const imagePath = landingPageSetup?.[`about_image${num}`];
                                    return (
                                        <div
                                            key={num}
                                            className="rounded-xl bg-amber-50 p-6 text-center shadow-md"
                                        >
                                            <p className="mb-4 font-medium text-amber-800">Image {num}</p>
                                            {imagePath ? (
                                                <img
                                                    src={`${IMAGE_BASE_URL}${imagePath}`}
                                                    alt={`About floating image ${num}`}
                                                    className="mx-auto max-h-80 w-full rounded-lg object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div className="mx-auto flex h-80 w-full max-w-md items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-100 text-amber-600">
                                                    <p className="text-lg font-medium">No image uploaded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Problems Section */}
                {(landingPageSetup?.problems_title || landingPageSetup?.problems_list?.length > 0) && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-red-500 pb-2 text-lg font-semibold text-gray-800">
                            {landingPageSetup?.problems_title}
                        </h3>
                        <ul className="space-y-3">
                            {landingPageSetup?.problems_list?.map((problem, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 text-gray-700"
                                >
                                    <span className="mt-1.5 text-red-600">•</span>
                                    <span>{problem}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Our Approach */}
                {landingPageSetup?.approach_steps?.length > 0 && (
                    <div>
                        <h3 className="mb-6 border-b-2 border-orange-500 pb-2 text-xl font-semibold text-gray-800">Our Approach</h3>
                        <div className="grid gap-8 md:grid-cols-2">
                            {landingPageSetup?.approach_steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-5 rounded-xl bg-orange-50 p-6 shadow-md"
                                >
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-2xl font-bold text-white">
                                        {step.step || i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-orange-800">{step.title}</h4>
                                        <p className="mt-2 text-gray-700">{step.desc || step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Customer Notice */}
                {(landingPageSetup?.customer_notice_title || landingPageSetup?.customer_notice_list?.length > 0) && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-teal-500 pb-2 text-lg font-semibold text-gray-800">
                            {landingPageSetup?.customer_notice_title}
                        </h3>
                        <ul className="space-y-3">
                            {landingPageSetup?.customer_notice_list?.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-3 text-gray-700"
                                >
                                    <FaCheck className="text-teal-600" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Long-term Trust & CTA */}
                {(landingPageSetup?.trust_title || landingPageSetup?.trust_text || landingPageSetup?.trust_points?.length > 0) && (
                    <div>
                        <h3 className="mb-4 border-b-2 border-emerald-500 pb-2 text-lg font-semibold text-gray-800">
                            {landingPageSetup?.trust_title}
                        </h3>
                        <div className="rounded-xl bg-emerald-50 p-8 shadow-md">
                            <p className="text-lg text-gray-700">{landingPageSetup?.trust_text}</p>
                            {landingPageSetup?.trust_points?.length > 0 && (
                                <ul className="mt-6 space-y-3">
                                    {landingPageSetup?.trust_points.map((point, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-3 text-emerald-800"
                                        >
                                            <FaCheck className="text-emerald-600" />
                                            <span className="font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* About CTA */}
                        {(landingPageSetup.about_cta_text || landingPageSetup.about_cta_subtext) && (
                            <div className="mt-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-10 text-center text-white shadow-xl">
                                <h4 className="text-2xl font-bold">{landingPageSetup.about_cta_text}</h4>
                                <p className="mt-3 text-lg opacity-90">{landingPageSetup.about_cta_subtext}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Our Works / Portfolio */}
                <div>
                    <h3 className="mb-4 border-b-2 border-indigo-500 pb-2 text-lg font-semibold text-gray-800">
                        {landingPageSetup?.works_title || "Our Latest Work"}
                    </h3>
                    {landingPageSetup?.works_desc && <p className="mb-6 text-gray-700">{landingPageSetup?.works_desc}</p>}
                    {landingPageSetup?.works?.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {landingPageSetup?.works.map((work, i) => (
                                <div
                                    key={i}
                                    className="overflow-hidden rounded-xl bg-white shadow-lg"
                                >
                                    {work.image ? (
                                        <img
                                            src={`${IMAGE_BASE_URL}${work.image}`}
                                            alt={work.title}
                                            className="h-64 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-64 bg-gray-200"></div>
                                    )}
                                    <div className="p-6">
                                        <h4 className="text-xl font-semibold text-indigo-800">{work.title}</h4>
                                        <p className="mt-2 text-gray-600">{work.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No works added yet.</p>
                    )}
                </div>

                {/* Testimonials */}
                <div>
                    <h3
                        className="mb-4 border-b-2 border-pink-500 pb-2 text-lg font-semibold text-gray-800"
                        dangerouslySetInnerHTML={{
                            __html: landingPageSetup?.testimonials_title || "",
                        }}
                    />

                    {landingPageSetup?.testimonials_subtext && <p className="mb-6 text-gray-700">{landingPageSetup?.testimonials_subtext}</p>}
                    {landingPageSetup?.testimonials?.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {landingPageSetup?.testimonials.map((testimonial, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl bg-pink-50 p-8 shadow-md"
                                >
                                    <FaQuoteLeft className="mb-5 text-4xl text-pink-400 opacity-50" />
                                    <p className="italic text-gray-700">"{testimonial.quote}"</p>
                                    <div className="mt-8 flex items-center gap-4">
                                        {testimonial.image ? (
                                            <img
                                                src={`${IMAGE_BASE_URL}${testimonial.image}`}
                                                alt={testimonial.name}
                                                className="h-14 w-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-gray-300"></div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-pink-800">{testimonial.name}</p>
                                            <p className="text-sm text-gray-600">{testimonial.position || testimonial.role}</p>
                                            <div className="mt-2 flex text-yellow-500">
                                                {[...Array(5)].map((_, starIdx) => (
                                                    <FaStar
                                                        key={starIdx}
                                                        size={16}
                                                        className={starIdx < (testimonial.rating || 5) ? "text-yellow-500" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No testimonials added yet.</p>
                    )}
                </div>

                {/* Stats */}
                <div>
                    <h3 className="mb-6 border-b-2 border-green-500 pb-2 text-xl font-semibold text-gray-800">Key Statistics</h3>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="rounded-xl bg-green-50 p-8 text-center shadow-md">
                            <p className="text-4xl font-bold text-green-700">{landingPageSetup.stats_satisfaction}%</p>
                            <p className="mt-3 text-lg text-gray-600">Customer Satisfaction</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-8 text-center shadow-md">
                            <p className="text-4xl font-bold text-blue-700">{landingPageSetup.stats_worldwide}+</p>
                            <p className="mt-3 text-lg text-gray-600">Worldwide Clients</p>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-8 text-center shadow-md">
                            <p className="text-4xl font-bold text-purple-700">{landingPageSetup.stats_adoption}x</p>
                            <p className="mt-3 text-lg text-gray-600">Faster Adoption Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
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

export default ViewLandingPageSetup;
