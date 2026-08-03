/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/utils/api";
import {
    CheckCircle2,
    Clock3,
    FileText,
    Headphones,
    KeyRound,
    LogIn,
    Mail,
    MessageSquarePlus,
    Paperclip,
    Plus,
    ShieldCheck,
    Ticket,
    UserRound,
} from "lucide-react";

const portalApi = axios.create({ baseURL: API_BASE_URL });

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.response?.data?.msg || fallback;

const PortalShell = ({ children, title, subtitle }) => (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
        <section className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
            <div className="hidden bg-[#10253f] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3 text-lg font-bold">
                    <span className="grid h-10 w-10 place-items-center rounded bg-white/12">
                        <Headphones size={22} />
                    </span>
                    Customer Support Portal
                </div>
                <div className="max-w-lg">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-teal-200">Secure helpdesk access</p>
                    <h1 className="text-4xl font-black leading-tight">Track support from the same customer record your service team uses.</h1>
                    <p className="mt-5 text-base leading-7 text-slate-200">
                        Portal accounts are invitation-only and linked to CRM customers or contacts before activation.
                    </p>
                </div>
                <div className="flex gap-3 text-sm text-slate-200">
                    <ShieldCheck size={18} />
                    Separate customer identity, separate CRM access boundary.
                </div>
            </div>
            <div className="flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <div className="mb-4 grid h-11 w-11 place-items-center rounded bg-[#e9f7f3] text-[#14765f]">
                            <ShieldCheck size={22} />
                        </div>
                        <h2 className="text-2xl font-black">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </section>
    </main>
);

const TextInput = ({ label, type = "text", value, onChange, autoComplete }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
        <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete={autoComplete}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#14765f] focus:ring-2 focus:ring-[#14765f]/15"
        />
    </label>
);

const StatusMessage = ({ type, children }) => {
    if (!children) return null;
    const className =
        type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-700";
    return <div className={`rounded border px-3 py-2 text-sm ${className}`}>{children}</div>;
};

export const CustomerPortalLogin = () => {
    const { organizationKey } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await portalApi.post(`/customer-helpdesk/portal/${organizationKey}/login`, {
                email,
                password,
            });
            localStorage.setItem("portalToken", response.data.token);
            localStorage.setItem("portalUser", JSON.stringify(response.data.user));
            navigate(`/support/${organizationKey}/dashboard`, { replace: true });
        } catch (err) {
            setError(getErrorMessage(err, "Unable to sign in."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PortalShell
            title="Customer Login"
            subtitle="Use the email address invited by your support team."
        >
            <form
                className="space-y-4"
                onSubmit={submit}
            >
                <StatusMessage>{error}</StatusMessage>
                <TextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                />
                <TextInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded bg-[#10253f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                    <LogIn size={18} />
                    {loading ? "Signing in..." : "Sign in"}
                </button>
                <Link
                    to={`/support/${organizationKey}/forgot-password`}
                    className="block text-center text-sm font-semibold text-[#14765f]"
                >
                    Forgot password?
                </Link>
            </form>
        </PortalShell>
    );
};

export const CustomerPortalActivate = () => {
    const { organizationKey } = useParams();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [token, setToken] = useState(searchParams.get("token") || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            await portalApi.post(`/customer-helpdesk/portal/${organizationKey}/activate`, {
                email,
                token,
                password,
                confirmPassword,
            });
            setMessage("Your account is active. You can sign in now.");
        } catch (err) {
            setError(getErrorMessage(err, "Unable to activate account."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PortalShell
            title="Activate Account"
            subtitle="Set your password to finish portal activation."
        >
            <form
                className="space-y-4"
                onSubmit={submit}
            >
                <StatusMessage type="success">{message}</StatusMessage>
                <StatusMessage>{error}</StatusMessage>
                <TextInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <TextInput label="Invitation token" value={token} onChange={setToken} />
                <TextInput label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
                <TextInput label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-[#10253f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    <CheckCircle2 size={18} />
                    {loading ? "Activating..." : "Activate account"}
                </button>
                <Link to={`/support/${organizationKey}`} className="block text-center text-sm font-semibold text-[#14765f]">
                    Back to login
                </Link>
            </form>
        </PortalShell>
    );
};

export const CustomerPortalForgotPassword = () => {
    const { organizationKey } = useParams();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await portalApi.post(`/customer-helpdesk/portal/${organizationKey}/forgot-password`, { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(getErrorMessage(err, "Unable to request reset link."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PortalShell title="Reset Password" subtitle="Request a secure reset link for your portal account.">
            <form className="space-y-4" onSubmit={submit}>
                <StatusMessage type="success">{message}</StatusMessage>
                <StatusMessage>{error}</StatusMessage>
                <TextInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-[#10253f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    <Mail size={18} />
                    {loading ? "Sending..." : "Send reset link"}
                </button>
                <Link to={`/support/${organizationKey}`} className="block text-center text-sm font-semibold text-[#14765f]">
                    Back to login
                </Link>
            </form>
        </PortalShell>
    );
};

export const CustomerPortalResetPassword = () => {
    const { organizationKey } = useParams();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [token, setToken] = useState(searchParams.get("token") || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            await portalApi.post(`/customer-helpdesk/portal/${organizationKey}/reset-password`, {
                email,
                token,
                password,
                confirmPassword,
            });
            setMessage("Password updated. You can sign in now.");
        } catch (err) {
            setError(getErrorMessage(err, "Unable to reset password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PortalShell title="Set New Password" subtitle="Enter the reset token from your email and choose a new password.">
            <form className="space-y-4" onSubmit={submit}>
                <StatusMessage type="success">{message}</StatusMessage>
                <StatusMessage>{error}</StatusMessage>
                <TextInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <TextInput label="Reset token" value={token} onChange={setToken} />
                <TextInput label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
                <TextInput label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-[#10253f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    <KeyRound size={18} />
                    {loading ? "Saving..." : "Update password"}
                </button>
                <Link to={`/support/${organizationKey}`} className="block text-center text-sm font-semibold text-[#14765f]">
                    Back to login
                </Link>
            </form>
        </PortalShell>
    );
};

const attachmentUrl = (path) => {
    if (!path) return "#";
    return path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`;
};

const Badge = ({ children }) => (
    <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{children}</span>
);

const PortalButton = ({ children, onClick, type = "button", disabled = false, tone = "primary" }) => {
    const styles =
        tone === "outline"
            ? "border border-slate-300 bg-white text-slate-700"
            : "bg-[#10253f] text-white";
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-bold disabled:opacity-60 ${styles}`}
        >
            {children}
        </button>
    );
};

export const CustomerPortalDashboard = () => {
    const { organizationKey } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [ticketForm, setTicketForm] = useState({
        subject: "",
        description: "",
        priority: "Medium",
        category: "",
        attachments: [],
    });
    const [knowledgeSuggestions, setKnowledgeSuggestions] = useState([]);
    const [replyForm, setReplyForm] = useState({ message: "", attachments: [] });
    const [satisfactionForm, setSatisfactionForm] = useState({ rating: 5, comment: "" });
    const [profileForm, setProfileForm] = useState({ name: "", mobile: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const token = useMemo(() => localStorage.getItem("portalToken"), []);
    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const loadPortal = useCallback(async () => {
        const [meResponse, dashboardResponse, ticketsResponse] = await Promise.all([
            portalApi.get("/customer-helpdesk/portal/me", { headers: authHeaders }),
            portalApi.get("/customer-helpdesk/portal/dashboard", { headers: authHeaders }),
            portalApi.get("/customer-helpdesk/portal/tickets", { headers: authHeaders }),
        ]);
        setProfile(meResponse.data);
        setDashboard(dashboardResponse.data);
        setTickets(ticketsResponse.data);
        setProfileForm({
            name: meResponse.data.user?.name || "",
            mobile: meResponse.data.user?.mobile || "",
        });
    }, [authHeaders]);

    useEffect(() => {
        if (!token) {
            navigate(`/support/${organizationKey}`, { replace: true });
            return;
        }

        loadPortal()
            .catch((err) => setError(getErrorMessage(err, "Unable to load portal profile.")));
    }, [loadPortal, navigate, organizationKey, token]);

    useEffect(() => {
        if (!token || `${ticketForm.subject} ${ticketForm.description}`.trim().length < 8) {
            setKnowledgeSuggestions([]);
            return undefined;
        }

        const timerId = window.setTimeout(() => {
            portalApi
                .get("/customer-helpdesk/portal/knowledge-suggestions", {
                    headers: authHeaders,
                    params: {
                        subject: ticketForm.subject,
                        description: ticketForm.description,
                    },
                })
                .then((response) => setKnowledgeSuggestions(response.data || []))
                .catch(() => setKnowledgeSuggestions([]));
        }, 450);

        return () => window.clearTimeout(timerId);
    }, [authHeaders, ticketForm.description, ticketForm.subject, token]);

    const markDeflected = async (articleId) => {
        try {
            await portalApi.post(`/customer-helpdesk/portal/knowledge-articles/${articleId}/deflected`, {}, { headers: authHeaders });
            setMessage("Glad that helped. The support team will use this feedback to improve suggestions.");
        } catch {
            setMessage("Suggestion feedback noted.");
        }
    };

    const clearAlerts = () => {
        setError("");
        setMessage("");
    };

    const loadTicketDetails = async (ticketId) => {
        clearAlerts();
        setLoading(true);
        try {
            const response = await portalApi.get(`/customer-helpdesk/portal/tickets/${ticketId}`, {
                headers: authHeaders,
            });
            setSelectedTicket(response.data);
            setActiveTab("details");
        } catch (err) {
            setError(getErrorMessage(err, "Unable to load ticket details."));
        } finally {
            setLoading(false);
        }
    };

    const createTicket = async (event) => {
        event.preventDefault();
        clearAlerts();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("subject", ticketForm.subject);
            formData.append("description", ticketForm.description);
            formData.append("priority", ticketForm.priority);
            formData.append("category", ticketForm.category);
            Array.from(ticketForm.attachments || []).forEach((file) => formData.append("attachments", file));
            const response = await portalApi.post("/customer-helpdesk/portal/tickets", formData, {
                headers: authHeaders,
            });
            setMessage("Ticket created successfully.");
            setTicketForm({ subject: "", description: "", priority: "Medium", category: "", attachments: [] });
            await loadPortal();
            await loadTicketDetails(response.data.ticket.id);
        } catch (err) {
            setError(getErrorMessage(err, "Unable to create ticket."));
        } finally {
            setLoading(false);
        }
    };

    const addReply = async (event) => {
        event.preventDefault();
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("message", replyForm.message);
            Array.from(replyForm.attachments || []).forEach((file) => formData.append("attachments", file));
            await portalApi.post(`/customer-helpdesk/portal/tickets/${selectedTicket.id}/replies`, formData, {
                headers: authHeaders,
            });
            setReplyForm({ message: "", attachments: [] });
            setMessage("Reply added.");
            await loadTicketDetails(selectedTicket.id);
            await loadPortal();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to add reply."));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status) => {
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            await portalApi.patch(
                `/customer-helpdesk/portal/tickets/${selectedTicket.id}/status`,
                { status },
                { headers: authHeaders },
            );
            setMessage("Ticket status updated.");
            await loadTicketDetails(selectedTicket.id);
            await loadPortal();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to update status."));
        } finally {
            setLoading(false);
        }
    };

    const submitSatisfaction = async (event) => {
        event.preventDefault();
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            await portalApi.post(
                `/customer-helpdesk/portal/tickets/${selectedTicket.id}/satisfaction`,
                satisfactionForm,
                { headers: authHeaders },
            );
            setMessage("Thanks for the feedback.");
        } catch (err) {
            setError(getErrorMessage(err, "Unable to submit satisfaction."));
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (event) => {
        event.preventDefault();
        clearAlerts();
        setLoading(true);
        try {
            await portalApi.put("/customer-helpdesk/portal/profile", profileForm, {
                headers: authHeaders,
            });
            setMessage("Profile updated.");
            await loadPortal();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to update profile."));
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("portalToken");
        localStorage.removeItem("portalUser");
        navigate(`/support/${organizationKey}`, { replace: true });
    };

    const portal = profile?.portal || dashboard?.portal || {};
    const counts = dashboard?.counts || { total: 0, open: 0, waiting: 0, closed: 0 };
    const tabButton = (key, label, Icon) => (
        <button
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-bold ${
                activeTab === key ? "bg-[#10253f] text-white" : "bg-white text-slate-700"
            }`}
        >
            <Icon size={17} />
            {label}
        </button>
    );

    return (
        <main
            className="min-h-screen px-4 py-6 text-slate-900 sm:px-6"
            style={{ background: "#f7f8fb" }}
        >
            <div className="mx-auto max-w-7xl">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <p
                            className="text-sm font-semibold uppercase tracking-[0.14em]"
                            style={{ color: portal.accentColor || "#14765f" }}
                        >
                            {portal.organizationName || "Support Portal"}
                        </p>
                        <h1 className="mt-1 text-3xl font-black">Customer Portal</h1>
                    </div>
                    <PortalButton onClick={logout} tone="outline">Sign out</PortalButton>
                </header>
                <div className="mb-5 flex flex-wrap gap-2">
                    {tabButton("dashboard", "Dashboard", Clock3)}
                    {tabButton("tickets", "Tickets", Ticket)}
                    {tabButton("create", "Create", Plus)}
                    {tabButton("profile", "Profile", UserRound)}
                </div>
                <StatusMessage>{error}</StatusMessage>
                <StatusMessage type="success">{message}</StatusMessage>

                {activeTab === "dashboard" && (
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ["Total", counts.total],
                                ["Open", counts.open],
                                ["Waiting", counts.waiting],
                                ["Closed", counts.closed],
                            ].map(([label, value]) => (
                                <section key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="text-sm font-bold text-slate-500">{label}</p>
                                    <p className="mt-2 text-3xl font-black">{value}</p>
                                </section>
                            ))}
                        </div>
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-black">Recent Tickets</h2>
                                <PortalButton onClick={() => setActiveTab("create")}>
                                    <Plus size={17} /> New ticket
                                </PortalButton>
                            </div>
                            <div className="space-y-3">
                                {(dashboard?.recentTickets || []).map((ticket) => (
                                    <button
                                        key={ticket.id}
                                        onClick={() => loadTicketDetails(ticket.id)}
                                        className="w-full rounded border border-slate-200 p-4 text-left transition hover:border-slate-400"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="font-black">{ticket.subject}</span>
                                            <Badge>{ticket.status}</Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">{ticket.publicReference}</p>
                                    </button>
                                ))}
                                {!dashboard?.recentTickets?.length && <p className="text-sm text-slate-500">No tickets yet.</p>}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "tickets" && (
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-lg font-black">All Tickets</h2>
                        <div className="grid gap-3">
                            {tickets.map((ticket) => (
                                <button key={ticket.id} onClick={() => loadTicketDetails(ticket.id)} className="rounded border border-slate-200 p-4 text-left hover:border-slate-400">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-black">{ticket.subject}</p>
                                            <p className="mt-1 text-sm text-slate-500">{ticket.publicReference} · {ticket.priority || "Medium"}</p>
                                        </div>
                                        <Badge>{ticket.status}</Badge>
                                    </div>
                                </button>
                            ))}
                            {!tickets.length && <p className="text-sm text-slate-500">No tickets found.</p>}
                        </div>
                    </section>
                )}

                {activeTab === "create" && (
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-lg font-black">Create Ticket</h2>
                        <form className="grid gap-4" onSubmit={createTicket}>
                            <TextInput label="Subject" value={ticketForm.subject} onChange={(value) => setTicketForm((form) => ({ ...form, subject: value }))} />
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Description</span>
                                <textarea className="min-h-32 w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#14765f] focus:ring-2 focus:ring-[#14765f]/15" value={ticketForm.description} onChange={(event) => setTicketForm((form) => ({ ...form, description: event.target.value }))} />
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Priority</span>
                                    <select className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm" value={ticketForm.priority} onChange={(event) => setTicketForm((form) => ({ ...form, priority: event.target.value }))}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Urgent</option>
                                    </select>
                                </label>
                                <TextInput label="Category" value={ticketForm.category} onChange={(value) => setTicketForm((form) => ({ ...form, category: value }))} />
                            </div>
                            <label className="block rounded border border-dashed border-slate-300 p-4">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Paperclip size={16} /> Attachments</span>
                                <input type="file" multiple onChange={(event) => setTicketForm((form) => ({ ...form, attachments: event.target.files }))} className="text-sm" />
                            </label>
                            {!!knowledgeSuggestions.length && (
                                <div className="rounded border border-emerald-200 bg-emerald-50 p-4">
                                    <h3 className="text-sm font-black text-emerald-900">Suggested answers</h3>
                                    <div className="mt-3 space-y-2">
                                        {knowledgeSuggestions.map((article) => (
                                            <div key={article.id} className="rounded bg-white p-3">
                                                <p className="text-sm font-black text-slate-900">{article.title}</p>
                                                <p className="mt-1 text-sm text-slate-600">{article.summary || article.category || "Knowledge article"}</p>
                                                <button type="button" onClick={() => markDeflected(article.id)} className="mt-2 text-sm font-bold text-[#14765f]">
                                                    This solved my issue
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <PortalButton type="submit" disabled={loading}><Plus size={17} /> Create ticket</PortalButton>
                        </form>
                    </section>
                )}

                {activeTab === "details" && selectedTicket && (
                    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-500">{selectedTicket.publicReference}</p>
                                    <h2 className="mt-1 text-2xl font-black">{selectedTicket.subject}</h2>
                                </div>
                                <Badge>{selectedTicket.status}</Badge>
                            </div>
                            <p className="whitespace-pre-wrap rounded bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedTicket.description}</p>
                            {!!selectedTicket.attachments?.length && (
                                <div className="mt-4">
                                    <h3 className="mb-2 text-sm font-black">Attachments</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTicket.attachments.map((file) => (
                                            <a key={file.id} href={attachmentUrl(file.filePath)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                                                <FileText size={15} /> {file.originalName}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 space-y-3">
                                <h3 className="text-sm font-black">Conversation</h3>
                                {(selectedTicket.replies || []).map((reply) => (
                                    <div key={reply.id} className="rounded border border-slate-200 p-4">
                                        <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs font-bold text-slate-500">
                                            <span>{reply.authorType === "customer_portal" ? reply.portalUser?.name || "You" : "Support team"}</span>
                                            <span>{new Date(reply.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{reply.message}</p>
                                        {!!reply.attachments?.length && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {reply.attachments.map((file) => (
                                                    <a key={file.id} href={attachmentUrl(file.filePath)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                                                        <Paperclip size={13} /> {file.originalName}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <form className="mt-5 grid gap-3 border-t border-slate-200 pt-5" onSubmit={addReply}>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Reply</span>
                                    <textarea className="min-h-24 w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#14765f] focus:ring-2 focus:ring-[#14765f]/15" value={replyForm.message} onChange={(event) => setReplyForm((form) => ({ ...form, message: event.target.value }))} />
                                </label>
                                <input type="file" multiple onChange={(event) => setReplyForm((form) => ({ ...form, attachments: event.target.files }))} className="text-sm" />
                                <PortalButton type="submit" disabled={loading}><MessageSquarePlus size={17} /> Add reply</PortalButton>
                            </form>
                        </div>
                        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-lg font-black">Status Tracking</h3>
                            <div className="mt-4 space-y-3 text-sm">
                                <p><span className="font-bold">Priority:</span> {selectedTicket.priority || "Medium"}</p>
                                <p><span className="font-bold">Category:</span> {selectedTicket.category || "General"}</p>
                                <p><span className="font-bold">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                <p><span className="font-bold">Updated:</span> {new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                            </div>
                            <div className="mt-5 grid gap-2">
                                <PortalButton onClick={() => updateStatus("Resolved")} tone="outline" disabled={loading}>Mark resolved</PortalButton>
                                <PortalButton onClick={() => updateStatus("Closed")} tone="outline" disabled={loading}>Close ticket</PortalButton>
                            </div>
                            {["Resolved", "Closed"].includes(selectedTicket.status) && (
                                <form className="mt-5 border-t border-slate-200 pt-5" onSubmit={submitSatisfaction}>
                                    <h3 className="text-lg font-black">Satisfaction</h3>
                                    <label className="mt-3 block">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Rating</span>
                                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={satisfactionForm.rating} onChange={(event) => setSatisfactionForm((form) => ({ ...form, rating: Number(event.target.value) }))}>
                                            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                                        </select>
                                    </label>
                                    <label className="mt-3 block">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Comment</span>
                                        <textarea className="min-h-20 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={satisfactionForm.comment} onChange={(event) => setSatisfactionForm((form) => ({ ...form, comment: event.target.value }))} />
                                    </label>
                                    <div className="mt-3">
                                        <PortalButton type="submit" disabled={loading}>Submit feedback</PortalButton>
                                    </div>
                                </form>
                            )}
                        </aside>
                    </section>
                )}

                {activeTab === "profile" && profile && (
                    <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={updateProfile}>
                            <h2 className="mb-4 text-lg font-black">Profile</h2>
                            <div className="grid gap-4">
                                <TextInput label="Name" value={profileForm.name} onChange={(value) => setProfileForm((form) => ({ ...form, name: value }))} />
                                <TextInput label="Mobile" value={profileForm.mobile} onChange={(value) => setProfileForm((form) => ({ ...form, mobile: value }))} />
                                <PortalButton type="submit" disabled={loading}>Save profile</PortalButton>
                            </div>
                        </form>
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-black">Linked CRM Customer</h2>
                            <p className="mt-3 text-sm text-slate-600">{profile.customer?.companyName || profile.customer?.email || "Customer record linked"}</p>
                            <p className="text-sm text-slate-600">{profile.contact?.email || profile.contact?.mobile || "Primary customer account"}</p>
                        </section>
                    </section>
                )}
            </div>
        </main>
    );
};
