export const LANDING_TEMPLATES = [
    {
        key: "classic",
        name: "Existing Classic Template",
        description: "The current detailed landing page experience. Existing pages stay unchanged.",
        bestUse: "Full website landing page",
        accent: "from-slate-700 to-slate-950",
    },
    {
        key: "modern-lead-capture",
        name: "Modern Lead Capture",
        description: "Split-screen page with benefits and a compact lead form above the fold.",
        bestUse: "General lead generation",
        accent: "from-blue-600 to-indigo-700",
    },
    {
        key: "minimal-enquiry",
        name: "Minimal Enquiry",
        description: "Focused single-column page for quick mobile-friendly enquiries.",
        bestUse: "Fast enquiries",
        accent: "from-slate-900 to-blue-700",
    },
    {
        key: "showcase",
        name: "Product/Service Showcase",
        description: "Hero image, benefits, trust elements and a concise enquiry form.",
        bestUse: "CRM, HRMS and services",
        accent: "from-cyan-600 to-blue-700",
    },
    {
        key: "book-demo",
        name: "Book a Demo",
        description: "SaaS demo request page with demo agenda and preferred schedule fields.",
        bestUse: "CRM and HRMS demos",
        accent: "from-violet-600 to-indigo-700",
    },
    {
        key: "campaign-offer",
        name: "Campaign Offer",
        description: "Promotional landing page for limited-time offers and campaign capture.",
        bestUse: "Offers and campaigns",
        accent: "from-rose-500 to-orange-500",
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
    formFields: {
        email: { visible: true, required: false, label: "Email Address" },
        companyName: { visible: true, required: false, label: "Company Name" },
        message: { visible: true, required: false, label: "Message" },
        preferredDate: { visible: false, required: false, label: "Preferred Date" },
        preferredTime: { visible: false, required: false, label: "Preferred Time" },
    },
};

export const getTemplate = (key) => LANDING_TEMPLATES.find((template) => template.key === key) || LANDING_TEMPLATES[0];
