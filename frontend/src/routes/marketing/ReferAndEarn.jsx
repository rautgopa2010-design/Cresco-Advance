import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Award,
    BadgeIndianRupee,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Handshake,
    MailCheck,
    Megaphone,
    MousePointerClick,
    Phone,
    ShieldCheck,
    Sparkles,
    UserPlus,
    UsersRound,
} from "lucide-react";

const steps = [
    { title: "Submit referral", text: "Share your details and the company you want to refer.", icon: ClipboardCheck },
    { title: "We qualify the lead", text: "Our team connects with your referee and maps the requirement.", icon: Handshake },
    { title: "Demo is scheduled", text: "The prospect gets a guided CRM walkthrough from Crescosoft.", icon: MailCheck },
    { title: "Customer subscribes", text: "When the referee purchases a paid plan, your reward is confirmed.", icon: MousePointerClick },
    { title: "Reward is processed", text: "You receive payout confirmation and the next steps by email.", icon: BadgeIndianRupee },
];

const benefits = [
    { title: "Join for free", text: "No joining fee or subscription needed to refer.", icon: UserPlus },
    { title: "Earn for paid clients", text: "Rewards apply when your referred company becomes a paid customer.", icon: Award },
    { title: "No hard limit", text: "Refer multiple businesses and keep increasing your earning potential.", icon: Sparkles },
    { title: "No minimum sales", text: "Send quality referrals without monthly sales pressure.", icon: ShieldCheck },
    { title: "Simple tracking", text: "Every referral is reviewed and attributed to your contact details.", icon: CheckCircle2 },
    { title: "Flexible payout", text: "Our team coordinates payout details once the referral is eligible.", icon: BadgeIndianRupee },
];

const faqs = [
    {
        question: "Who can I refer?",
        answer: "You can refer any business that wants to manage leads, customers, follow-ups, quotations, orders, or sales reporting through CRM.",
    },
    {
        question: "When is the referral reward eligible?",
        answer: "The reward becomes eligible after the referred company purchases an active paid Crescosoft CRM subscription.",
    },
    {
        question: "Is there a limit on referrals?",
        answer: "No. You can refer as many businesses as you want. Each qualified paid customer can be considered for a reward.",
    },
    {
        question: "How will Crescosoft contact me?",
        answer: "We use the email and phone number submitted in the referral form to confirm attribution and payout details.",
    },
];

const initialForm = {
    name: "",
    phone: "",
    email: "",
    friendName: "",
    friendEmail: "",
    friendPhone: "",
    company: "",
};

const ReferAndEarn = () => {
    const [form, setForm] = useState(initialForm);
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const handleChange = (field) => (event) => {
        const value = field.toLowerCase().includes("phone") ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);
        setForm(initialForm);
    };

    return (
        <div className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
            <section className="overflow-hidden bg-[linear-gradient(135deg,_#eff6ff_0%,_#dbeafe_48%,_#eef2ff_100%)] dark:bg-[linear-gradient(135deg,_#0f172a_0%,_#111827_50%,_#172554_100%)]">
                <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-20">
                    <div className="flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
                                <Award className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                Referral rewards for paid CRM customers
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                                Native CRM program
                                <Sparkles className="h-4 w-4" />
                            </div>
                        </div>

                        <h1 className="mt-9 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                            Help your network grow with{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Crescosoft CRM.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-700 dark:text-slate-300">
                            Refer companies that need a modern sales CRM. When your referral becomes a paid customer, our team confirms your reward and payout details.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <a
                                href="#refer-form"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:shadow-none"
                            >
                                Refer a business
                                <ArrowRight size={18} />
                            </a>
                            <Link
                                to="/marketing-website/contact-us"
                                state={{ scrollTo: "contact-us" }}
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-400 dark:border-white/15 dark:bg-white/10 dark:text-white"
                            >
                                Schedule a demo
                            </Link>
                        </div>

                        <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
                            {["Free to join", "Tracked referrals", "Reward on paid conversion"].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-white/80 bg-white/75 px-4 py-4 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                                >
                                    <CheckCircle2 className="mb-2 h-5 w-5 text-blue-600" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        id="refer-form"
                        className="relative"
                    >
                        <div className="absolute -inset-4 rounded-[34px] border-2 border-blue-400/70" />
                        <form
                            onSubmit={handleSubmit}
                            className="relative rounded-3xl border border-white/80 bg-white p-6 shadow-[0_28px_90px_rgba(37,99,235,0.18)] dark:border-white/10 dark:bg-slate-900 sm:p-8"
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-black">Refer a business</h2>
                                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">
                                    Share your contact details and your referee information.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <input
                                    required
                                    value={form.name}
                                    onChange={handleChange("name")}
                                    placeholder="Your name"
                                    className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                />
                                <div className="grid gap-4 sm:grid-cols-[130px_1fr]">
                                    <div className="flex h-[52px] items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold dark:border-white/10 dark:bg-slate-950">
                                        <span>+91</span>
                                    </div>
                                    <input
                                        required
                                        value={form.phone}
                                        onChange={handleChange("phone")}
                                        placeholder="Your phone"
                                        inputMode="numeric"
                                        className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                    />
                                </div>
                                <input
                                    required
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    placeholder="Your email"
                                    type="email"
                                    className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                />
                                <input
                                    required
                                    value={form.friendName}
                                    onChange={handleChange("friendName")}
                                    placeholder="Friend's name"
                                    className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                />
                                <input
                                    required
                                    value={form.friendEmail}
                                    onChange={handleChange("friendEmail")}
                                    placeholder="Friend's email"
                                    type="email"
                                    className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                />
                                <div className="grid gap-4 sm:grid-cols-[130px_1fr]">
                                    <div className="flex h-[52px] items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold dark:border-white/10 dark:bg-slate-950">
                                        <span>+91</span>
                                    </div>
                                    <input
                                        required
                                        value={form.friendPhone}
                                        onChange={handleChange("friendPhone")}
                                        placeholder="Friend's phone"
                                        inputMode="numeric"
                                        className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                    />
                                </div>
                                <input
                                    value={form.company}
                                    onChange={handleChange("company")}
                                    placeholder="Company name (optional)"
                                    className="h-[52px] rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950"
                                />
                            </div>

                            {submitted && (
                                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                                    Referral captured. Our team will connect with you shortly.
                                </div>
                            )}

                            <button
                                type="submit"
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 dark:shadow-none"
                            >
                                Submit referral
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="px-5 py-20 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[1440px] text-center">
                    <h2 className="text-4xl font-black tracking-tight sm:text-5xl">How does it work?</h2>
                    <div className="mt-12 grid gap-6 md:grid-cols-5">
                        {steps.map((step, index) => (
                            <div
                                key={step.title}
                                className="relative rounded-3xl bg-white p-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-white/10"
                            >
                                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none">
                                    <step.icon size={34} />
                                </div>
                                <div className="mt-6 text-3xl font-black">{String(index + 1).padStart(2, "0")}</div>
                                <h3 className="mt-3 text-lg font-black">{step.title}</h3>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-blue-50 px-5 py-20 dark:bg-slate-900 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className="text-center text-4xl font-black tracking-tight sm:text-5xl">Program benefits</h2>
                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="flex gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-blue-100 dark:bg-slate-950 dark:ring-white/10"
                            >
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                    <benefit.icon size={26} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">{benefit.title}</h3>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">{benefit.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-20 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center text-4xl font-black tracking-tight sm:text-5xl">FAQs</h2>
                    <div className="mt-10 grid gap-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <button
                                    key={faq.question}
                                    type="button"
                                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                    className="rounded-2xl bg-slate-50 p-5 text-left ring-1 ring-slate-100 transition hover:bg-slate-100 dark:bg-slate-900 dark:ring-white/10"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-lg font-black">{faq.question}</span>
                                        <ChevronDown className={`h-5 w-5 flex-shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                    {isOpen && <p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="px-5 pb-20 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-[0_32px_80px_rgba(37,99,235,0.28)] md:flex-row md:items-center md:p-10">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-blue-100">
                            <Megaphone size={18} />
                            Ready to refer?
                        </div>
                        <h2 className="mt-3 text-3xl font-black">Share Crescosoft CRM with your network.</h2>
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-blue-100">
                            Send one quality referral today and our sales team will handle the conversation from there.
                        </p>
                    </div>
                    <a
                        href="#refer-form"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-0.5"
                    >
                        Refer now
                        <Phone size={18} />
                    </a>
                </div>
            </section>
        </div>
    );
};

export default ReferAndEarn;
