export const LANDING_TEMPLATES = [
    {
        key: "classic",
        name: "Existing Classic Template",
        description: "The current detailed landing page experience. Existing pages stay unchanged.",
        bestUse: "Full website landing page",
        accent: "from-slate-700 to-slate-950",
        theme: {
            primaryColor: "#334155",
            secondaryColor: "#0F172A",
            accentColor: "#475569",
            textColor: "#111827",
            backgroundColor: "#FFFFFF",
        },
    },
    {
        key: "modern-lead-capture",
        name: "Modern Lead Capture",
        description: "Split-screen page with benefits and a compact lead form above the fold.",
        bestUse: "General lead generation",
        accent: "from-blue-600 to-indigo-700",
        theme: {
            primaryColor: "#2563EB",
            secondaryColor: "#4338CA",
            accentColor: "#4F46E5",
            textColor: "#0F172A",
            backgroundColor: "#F8FAFC",
        },
    },
    {
        key: "minimal-enquiry",
        name: "Minimal Enquiry",
        description: "Focused single-column page for quick mobile-friendly enquiries.",
        bestUse: "Fast enquiries",
        accent: "from-slate-900 to-blue-700",
        theme: {
            primaryColor: "#1D4ED8",
            secondaryColor: "#111827",
            accentColor: "#2563EB",
            textColor: "#111827",
            backgroundColor: "#F8FAFC",
        },
    },
    {
        key: "showcase",
        name: "Product/Service Showcase",
        description: "Hero image, benefits, trust elements and a concise enquiry form.",
        bestUse: "CRM, HRMS and services",
        accent: "from-cyan-600 to-blue-700",
        theme: {
            primaryColor: "#0891B2",
            secondaryColor: "#1D4ED8",
            accentColor: "#0EA5E9",
            textColor: "#0F172A",
            backgroundColor: "#F0F9FF",
        },
    },
    {
        key: "book-demo",
        name: "Book a Demo",
        description: "SaaS demo request page with demo agenda and preferred schedule fields.",
        bestUse: "CRM and HRMS demos",
        accent: "from-violet-600 to-indigo-700",
        theme: {
            primaryColor: "#7C3AED",
            secondaryColor: "#4338CA",
            accentColor: "#8B5CF6",
            textColor: "#111827",
            backgroundColor: "#F5F3FF",
        },
    },
    {
        key: "campaign-offer",
        name: "Campaign Offer",
        description: "Promotional landing page for limited-time offers and campaign capture.",
        bestUse: "Offers and campaigns",
        accent: "from-rose-500 to-orange-500",
        theme: {
            primaryColor: "#DC2626",
            secondaryColor: "#EA580C",
            accentColor: "#F97316",
            textColor: "#111827",
            backgroundColor: "#FFF7ED",
        },
    },
];

export const DEFAULT_TEMPLATE_CONFIG = {
    landingPageName: "Main Landing Page",
    headline: "Grow your business with a smarter CRM workspace",
    subheading: "Capture enquiries, manage follow-ups and convert more opportunities with a connected Crescosoft CRM experience.",
    ctaText: "Submit Enquiry",
    successMessage: "Thank you. Our team will contact you shortly.",
    redirectUrl: "",
    privacyUrl: "/marketing-website/privacy-policy",
    whatsappEnabled: true,
    whatsappNumber: "",
    productOptions: ["CRM", "HRMS", "Sales Automation", "Customer Support"],
    benefits: ["Fast setup for your team", "Clear lead and customer tracking", "Secure role-based access"],
    contactEmail: "",
    contactPhone: "",
    offerExpiryDate: "",
    countdownEnabled: false,
    seoTitle: "",
    seoDescription: "",
    theme: {
        primaryColor: "#2563EB",
        secondaryColor: "#4338CA",
        accentColor: "#4F46E5",
        textColor: "#0F172A",
        backgroundColor: "#F8FAFC",
    },
    formFields: {
        email: { visible: true, required: false, label: "Email Address" },
        companyName: { visible: true, required: false, label: "Company Name" },
        message: { visible: true, required: false, label: "Message" },
        preferredDate: { visible: false, required: false, label: "Preferred Date" },
        preferredTime: { visible: false, required: false, label: "Preferred Time" },
    },
};

export const getTemplate = (key) => LANDING_TEMPLATES.find((template) => template.key === key) || LANDING_TEMPLATES[0];

export const getTemplateTheme = (key) => getTemplate(key).theme || DEFAULT_TEMPLATE_CONFIG.theme;

export const COLOUR_PRESETS = [
    { label: "Blue", value: "#2563EB" },
    { label: "Red", value: "#DC2626" },
    { label: "Green", value: "#16A34A" },
    { label: "Purple", value: "#7C3AED" },
    { label: "Orange", value: "#F97316" },
    { label: "Teal", value: "#0D9488" },
    { label: "Dark", value: "#111827" },
];
