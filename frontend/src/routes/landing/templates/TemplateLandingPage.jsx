import React, { useMemo, useState } from "react";
import axios from "axios";
import { ArrowRight, CalendarClock, CheckCircle2, Clock, Mail, MessageSquare, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/utils/api";
import assets from "@/assets/assets";
import { DEFAULT_TEMPLATE_CONFIG, getTemplate } from "./landingTemplateRegistry";

const initialForm = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    product: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
    consent: false,
};

const mergeConfig = (setup) => ({
    ...DEFAULT_TEMPLATE_CONFIG,
    ...(setup?.template_config || {}),
    formFields: {
        ...DEFAULT_TEMPLATE_CONFIG.formFields,
        ...(setup?.template_config?.formFields || {}),
    },
});

const Field = ({ label, children }) => (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
        <span>{label}</span>
        {children}
    </label>
);

const CompactEnquiryForm = ({ config, templateKey }) => {
    const { companySlug } = useParams();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const setValue = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const fields = config.formFields || DEFAULT_TEMPLATE_CONFIG.formFields;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await axios.post(`${API_BASE_URL}/landing-page-lead/create`, {
                name: form.name,
                mobile: form.mobile,
                email: form.email,
                companyName: form.companyName,
                description: [form.message, form.preferredDate ? `Preferred date: ${form.preferredDate}` : "", form.preferredTime ? `Preferred time: ${form.preferredTime}` : ""]
                    .filter(Boolean)
                    .join("\n"),
                leadSource: config.landingPageName || "Landing Page",
                companySlug,
                templateKey,
                landingPageName: config.landingPageName,
                interestedProduct: form.product,
                utm: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
            });

            setMessage(config.successMessage || DEFAULT_TEMPLATE_CONFIG.successMessage);
            setForm(initialForm);
            if (config.redirectUrl) window.location.href = config.redirectUrl;
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || "Could not submit enquiry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60"
        >
            <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Quick Enquiry</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Tell us what you need</h2>
            </div>

            <div className="grid gap-4">
                <Field label="Full Name *">
                    <input required value={form.name} onChange={(e) => setValue("name", e.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500" />
                </Field>
                <Field label="Mobile Number *">
                    <input required value={form.mobile} onChange={(e) => setValue("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500" />
                </Field>
                {fields.email?.visible && (
                    <Field label={`${fields.email.label || "Email Address"}${fields.email.required ? " *" : ""}`}>
                        <input required={!!fields.email.required} type="email" value={form.email} onChange={(e) => setValue("email", e.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500" />
                    </Field>
                )}
                {fields.companyName?.visible && (
                    <Field label={`${fields.companyName.label || "Company Name"}${fields.companyName.required ? " *" : ""}`}>
                        <input required={!!fields.companyName.required} value={form.companyName} onChange={(e) => setValue("companyName", e.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500" />
                    </Field>
                )}
                <Field label="Interested Product/Service *">
                    <select required value={form.product} onChange={(e) => setValue("product", e.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500">
                        <option value="">Select option</option>
                        {(config.productOptions || []).map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </Field>
                {templateKey === "book-demo" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={fields.preferredDate?.label || "Preferred Date"}>
                            <input type="date" value={form.preferredDate} onChange={(e) => setValue("preferredDate", e.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500" />
                        </Field>
                        <Field label={fields.preferredTime?.label || "Preferred Time"}>
                            <input type="time" value={form.preferredTime} onChange={(e) => setValue("preferredTime", e.target.value)} className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-indigo-500" />
                        </Field>
                    </div>
                )}
                {fields.message?.visible && (
                    <Field label={`${fields.message.label || "Message"}${fields.message.required ? " *" : ""}`}>
                        <textarea required={!!fields.message.required} rows={3} value={form.message} onChange={(e) => setValue("message", e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500" />
                    </Field>
                )}
                <label className="flex items-start gap-3 text-xs font-semibold leading-5 text-slate-600">
                    <input required checked={form.consent} onChange={(e) => setValue("consent", e.target.checked)} type="checkbox" className="mt-1" />
                    I agree to be contacted about this enquiry and accept the privacy policy.
                </label>
            </div>

            {message && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{message}</div>}
            {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>}

            <button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-70">
                {loading ? "Submitting..." : config.ctaText || "Submit Enquiry"}
                <ArrowRight size={17} />
            </button>
        </form>
    );
};

const TemplateLandingPage = ({ setup, companyData }) => {
    const queryTemplate = new URLSearchParams(window.location.search).get("template");
    const templateKey = queryTemplate || setup?.template_key || "classic";
    const template = getTemplate(templateKey);
    const config = useMemo(() => mergeConfig(setup), [setup]);
    const benefits = config.benefits?.length ? config.benefits : DEFAULT_TEMPLATE_CONFIG.benefits;
    const heroImage = setup?.hero_image ? `${IMAGE_BASE_URL}${setup.hero_image}` : assets.work_dashboard_management;
    const logo = companyData?.companyLogo ? `${IMAGE_BASE_URL}${companyData.companyLogo}` : assets.logo;
    const isMinimal = templateKey === "minimal-enquiry";
    const isCampaign = templateKey === "campaign-offer";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
                    <img src={logo} alt={companyData?.companyName || "Company"} className="h-12 w-auto object-contain" />
                    <a href="#enquiry-form" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white">Enquire Now</a>
                </div>
            </header>

            <main>
                <section className={`px-5 py-12 sm:px-8 lg:px-12 ${isMinimal ? "text-center" : ""}`}>
                    <div className={`mx-auto grid max-w-7xl items-center gap-10 ${isMinimal ? "max-w-3xl" : "lg:grid-cols-[1fr_440px]"}`}>
                        <div>
                            <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${template.accent} px-4 py-2 text-sm font-black text-white`}>
                                <Sparkles size={16} />
                                {template.bestUse}
                            </div>
                            {isCampaign && config.offerExpiryDate && (
                                <div className="mt-4 inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
                                    Offer valid till {new Date(config.offerExpiryDate).toLocaleDateString("en-IN")}
                                </div>
                            )}
                            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{config.headline}</h1>
                            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600">{config.subheading}</p>

                            <div className={`mt-8 grid gap-3 ${isMinimal ? "mx-auto max-w-xl" : "max-w-2xl"} sm:grid-cols-3`}>
                                {benefits.slice(0, 3).map((benefit) => (
                                    <div key={benefit} className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
                                        <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
                                        {benefit}
                                    </div>
                                ))}
                            </div>

                            {templateKey !== "modern-lead-capture" && templateKey !== "minimal-enquiry" && (
                                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                                    <img src={heroImage} alt="Landing page visual" loading="lazy" className="w-full rounded-xl object-cover" />
                                </div>
                            )}

                            {templateKey === "book-demo" && (
                                <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                    <h2 className="text-xl font-black">What you will see in the demo</h2>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        {["Lead workflow", "Follow-up automation", "Reports dashboard"].map((item) => (
                                            <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700"><ShieldCheck size={17} className="text-indigo-600" />{item}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div id="enquiry-form">
                            <CompactEnquiryForm config={config} templateKey={templateKey} />
                            <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500">
                                {config.contactPhone && <span className="flex items-center gap-2"><Phone size={15} />{config.contactPhone}</span>}
                                {config.contactEmail && <span className="flex items-center gap-2"><Mail size={15} />{config.contactEmail}</span>}
                                {config.whatsappEnabled && config.whatsappNumber && <a className="flex items-center gap-2 text-emerald-700" href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}><MessageSquare size={15} />Chat on WhatsApp</a>}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white px-5 py-14 sm:px-8 lg:px-12">
                    <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
                        {benefits.map((benefit, index) => (
                            <div key={benefit} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                                    {index % 2 === 0 ? <CalendarClock size={22} /> : <Clock size={22} />}
                                </div>
                                <h3 className="text-lg font-black">{benefit}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Designed to help your team respond faster and convert more enquiries.</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TemplateLandingPage;
