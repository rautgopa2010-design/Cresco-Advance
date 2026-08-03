/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquarePlus, Paperclip, Plus, UsersRound } from "lucide-react";
import api, { IMAGE_BASE_URL } from "@/utils/api";

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.response?.data?.msg || fallback;

const fileUrl = (path) => (path?.startsWith("http") ? path : `${IMAGE_BASE_URL}${path || ""}`);

const Badge = ({ children }) => (
    <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{children}</span>
);

const Field = ({ label, children }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
        {children}
    </label>
);

const Input = (props) => (
    <input
        {...props}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#053054] focus:ring-2 focus:ring-[#053054]/15"
    />
);

const Button = ({ children, type = "button", onClick, disabled, tone = "primary" }) => {
    const style = tone === "outline" ? "border border-slate-300 bg-white text-slate-700" : "bg-[#053054] text-white";
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-bold disabled:opacity-60 ${style}`}>
            {children}
        </button>
    );
};

const emptyMaster = { name: "", description: "" };

const CustomerHelpdeskWorkspace = () => {
    const [workspace, setWorkspace] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [resources, setResources] = useState({
        employees: [],
        teams: [],
        categories: [],
        priorities: [],
        slaPolicies: [],
        assignmentRules: [],
        knowledgeArticles: [],
        customers: [],
        portalUsers: [],
    });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reports, setReports] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [activeQueue, setActiveQueue] = useState("all");
    const [replyMode, setReplyMode] = useState("public");
    const [replyForm, setReplyForm] = useState({ message: "", attachments: [] });
    const [assignment, setAssignment] = useState({ employeeIds: [], supportTeamId: "" });
    const [categoryForm, setCategoryForm] = useState(emptyMaster);
    const [priorityForm, setPriorityForm] = useState({ name: "", color: "#64748b", sortOrder: 0 });
    const [teamForm, setTeamForm] = useState({ name: "", description: "", memberEmployeeIds: [], leadEmployeeId: "" });
    const [slaForm, setSlaForm] = useState({ name: "", priority: "", category: "", firstResponseMinutes: 240, resolutionMinutes: 1440, escalationMinutes: 720, escalationTeamId: "" });
    const [ruleForm, setRuleForm] = useState({ name: "", priority: 0, conditionPriority: "", conditionCategory: "", supportTeamId: "", assignEmployeeIds: [] });
    const [articleForm, setArticleForm] = useState({ title: "", summary: "", content: "", category: "", keywords: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const query = useMemo(() => {
        if (activeQueue === "unassigned") return "?unassigned=true";
        if (activeQueue === "urgent") return "?priority=Urgent";
        if (activeQueue !== "all") return `?status=${encodeURIComponent(activeQueue)}`;
        return "";
    }, [activeQueue]);

    const loadWorkspace = useCallback(async () => {
        const [workspaceResponse, resourcesResponse, ticketResponse] = await Promise.all([
            api.get("/customer-helpdesk/agent/workspace"),
            api.get("/customer-helpdesk/agent/resources"),
            api.get(`/customer-helpdesk/agent/tickets${query}`),
        ]);
        setWorkspace(workspaceResponse.data);
        setResources(resourcesResponse.data);
        setTickets(ticketResponse.data);
    }, [query]);

    const loadReports = async () => {
        const [reportResponse, auditResponse] = await Promise.all([
            api.get("/customer-helpdesk/agent/reports"),
            api.get("/customer-helpdesk/agent/audit-logs?limit=25"),
        ]);
        setReports(reportResponse.data);
        setAuditLogs(auditResponse.data);
    };

    useEffect(() => {
        loadWorkspace().catch((err) => setError(getErrorMessage(err, "Unable to load customer helpdesk workspace.")));
    }, [loadWorkspace]);

    useEffect(() => {
        loadReports().catch(() => {
            setReports(null);
            setAuditLogs([]);
        });
    }, []);

    const clearAlerts = () => {
        setError("");
        setMessage("");
    };

    const loadTicket = async (ticketId) => {
        clearAlerts();
        setLoading(true);
        try {
            const response = await api.get(`/customer-helpdesk/agent/tickets/${ticketId}`);
            setSelectedTicket(response.data);
            setAssignment({
                employeeIds: (response.data.assignedTo || []).map((item) => String(item.employeeId)),
                supportTeamId: response.data.supportTeamId ? String(response.data.supportTeamId) : "",
            });
        } catch (err) {
            setError(getErrorMessage(err, "Unable to load ticket."));
        } finally {
            setLoading(false);
        }
    };

    const submitReply = async (event) => {
        event.preventDefault();
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("message", replyForm.message);
            Array.from(replyForm.attachments || []).forEach((file) => formData.append("attachments", file));
            const path = replyMode === "internal" ? "internal-notes" : "public-replies";
            await api.post(`/customer-helpdesk/agent/tickets/${selectedTicket.id}/${path}`, formData);
            setReplyForm({ message: "", attachments: [] });
            setMessage(replyMode === "internal" ? "Internal note added." : "Public reply sent.");
            await loadTicket(selectedTicket.id);
            await loadWorkspace();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to add message."));
        } finally {
            setLoading(false);
        }
    };

    const saveAssignment = async () => {
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            await api.patch(`/customer-helpdesk/agent/tickets/${selectedTicket.id}/assignment`, {
                employeeIds: assignment.employeeIds.map(Number),
                supportTeamId: assignment.supportTeamId ? Number(assignment.supportTeamId) : null,
            });
            setMessage("Assignment updated.");
            await loadTicket(selectedTicket.id);
            await loadWorkspace();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to assign ticket."));
        } finally {
            setLoading(false);
        }
    };

    const updateTicket = async (patch) => {
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            await api.patch(`/customer-helpdesk/agent/tickets/${selectedTicket.id}`, patch);
            setMessage("Ticket updated.");
            await loadTicket(selectedTicket.id);
            await loadWorkspace();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to update ticket."));
        } finally {
            setLoading(false);
        }
    };

    const escalateToCresco = async () => {
        if (!selectedTicket) return;
        clearAlerts();
        setLoading(true);
        try {
            await api.post(`/customer-helpdesk/agent/tickets/${selectedTicket.id}/escalate-to-cresco`, {
                reason: "Escalated from organization Customer Helpdesk",
            });
            setMessage("Ticket escalated to Crescosoft Support.");
            await loadTicket(selectedTicket.id);
            await loadWorkspace();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to escalate ticket."));
        } finally {
            setLoading(false);
        }
    };

    const saveCategory = async (event) => {
        event.preventDefault();
        await api.post("/customer-helpdesk/agent/categories", categoryForm);
        setCategoryForm(emptyMaster);
        setMessage("Category saved.");
        await loadWorkspace();
    };

    const savePriority = async (event) => {
        event.preventDefault();
        await api.post("/customer-helpdesk/agent/priorities", priorityForm);
        setPriorityForm({ name: "", color: "#64748b", sortOrder: 0 });
        setMessage("Priority saved.");
        await loadWorkspace();
    };

    const saveTeam = async (event) => {
        event.preventDefault();
        await api.post("/customer-helpdesk/agent/teams", teamForm);
        setTeamForm({ name: "", description: "", memberEmployeeIds: [], leadEmployeeId: "" });
        setMessage("Support team saved.");
        await loadWorkspace();
    };

    const saveSla = async (event) => {
        event.preventDefault();
        await api.post("/customer-helpdesk/agent/sla-policies", {
            ...slaForm,
            priority: slaForm.priority || null,
            category: slaForm.category || null,
            escalationTeamId: slaForm.escalationTeamId ? Number(slaForm.escalationTeamId) : null,
        });
        setSlaForm({ name: "", priority: "", category: "", firstResponseMinutes: 240, resolutionMinutes: 1440, escalationMinutes: 720, escalationTeamId: "" });
        setMessage("SLA policy saved.");
        await loadWorkspace();
    };

    const saveRule = async (event) => {
        event.preventDefault();
        await api.post("/customer-helpdesk/agent/assignment-rules", {
            name: ruleForm.name,
            priority: Number(ruleForm.priority),
            conditions: {
                ...(ruleForm.conditionPriority && { priority: ruleForm.conditionPriority }),
                ...(ruleForm.conditionCategory && { category: ruleForm.conditionCategory }),
            },
            supportTeamId: ruleForm.supportTeamId ? Number(ruleForm.supportTeamId) : null,
            assignEmployeeIds: ruleForm.assignEmployeeIds.map(Number),
        });
        setRuleForm({ name: "", priority: 0, conditionPriority: "", conditionCategory: "", supportTeamId: "", assignEmployeeIds: [] });
        setMessage("Assignment rule saved.");
        await loadWorkspace();
    };

    const saveArticle = async (event) => {
        event.preventDefault();
        await api.post("/customer-helpdesk/agent/knowledge-articles", {
            ...articleForm,
            keywords: articleForm.keywords.split(",").map((item) => item.trim()).filter(Boolean),
        });
        setArticleForm({ title: "", summary: "", content: "", category: "", keywords: "" });
        setMessage("Knowledge article saved.");
        await loadWorkspace();
    };

    const runEscalationScan = async () => {
        clearAlerts();
        setLoading(true);
        try {
            const response = await api.post("/customer-helpdesk/agent/sla-escalation-scan");
            setMessage(response.data.message);
            await loadWorkspace();
        } catch (err) {
            setError(getErrorMessage(err, "Unable to run SLA escalation scan."));
        } finally {
            setLoading(false);
        }
    };

    const queueCards = [
        ["all", "All", workspace?.counts?.total || 0],
        ["unassigned", "Unassigned", workspace?.counts?.unassigned || 0],
        ["urgent", "Urgent", workspace?.counts?.urgent || 0],
        ["New", "New", workspace?.counts?.byStatus?.New || 0],
        ["Support Replied", "Replied", workspace?.counts?.byStatus?.["Support Replied"] || 0],
    ];

    return (
        <main className="space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#053054]">Customer Helpdesk</p>
                    <h1 className="text-3xl font-black text-slate-950">Agent Workspace</h1>
                </div>
            </header>

            {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {queueCards.map(([key, label, count]) => (
                    <button key={key} onClick={() => setActiveQueue(key)} className={`rounded-lg border p-4 text-left shadow-sm ${activeQueue === key ? "border-[#053054] bg-[#eef6fb]" : "border-slate-200 bg-white"}`}>
                        <p className="text-sm font-bold text-slate-500">{label}</p>
                        <p className="mt-2 text-3xl font-black text-slate-950">{count}</p>
                    </button>
                ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-lg font-black">Ticket Queue</h2>
                    <div className="space-y-2">
                        {tickets.map((ticket) => (
                            <button key={ticket.id} onClick={() => loadTicket(ticket.id)} className={`w-full rounded border p-3 text-left ${selectedTicket?.id === ticket.id ? "border-[#053054]" : "border-slate-200"}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-black text-slate-900">{ticket.subject}</p>
                                    <Badge>{ticket.status}</Badge>
                                </div>
                                <p className="mt-1 text-xs font-bold text-slate-500">{ticket.publicReference}</p>
                                <p className="mt-1 text-sm text-slate-500">{ticket.customer?.companyName || ticket.customer?.email || "Customer"}</p>
                            </button>
                        ))}
                        {!tickets.length && <p className="text-sm text-slate-500">No tickets in this queue.</p>}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    {!selectedTicket ? (
                        <div className="py-12 text-center text-sm font-semibold text-slate-500">Select a ticket to view details.</div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                            <section>
                                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">{selectedTicket.publicReference}</p>
                                        <h2 className="text-2xl font-black text-slate-950">{selectedTicket.subject}</h2>
                                    </div>
                                    <Badge>{selectedTicket.status}</Badge>
                                </div>
                                <p className="whitespace-pre-wrap rounded bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedTicket.description}</p>
                                {!!selectedTicket.attachments?.length && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedTicket.attachments.map((file) => (
                                            <a key={file.id} href={fileUrl(file.filePath)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                                                <Paperclip size={13} /> {file.originalName}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-6 space-y-3">
                                    <h3 className="font-black">Conversation & Notes</h3>
                                    {(selectedTicket.replies || []).map((reply) => (
                                        <div key={reply.id} className={`rounded border p-4 ${reply.visibility === "internal" ? "border-amber-200 bg-amber-50" : "border-slate-200"}`}>
                                            <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs font-bold text-slate-500">
                                                <span>{reply.visibility === "internal" ? "Internal note" : "Public reply"} · {reply.portalUser?.name || reply.employeeUser?.email || "Agent"}</span>
                                                <span>{new Date(reply.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{reply.message}</p>
                                        </div>
                                    ))}
                                </div>
                                <form className="mt-5 grid gap-3 border-t border-slate-200 pt-5" onSubmit={submitReply}>
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" tone={replyMode === "public" ? "primary" : "outline"} onClick={() => setReplyMode("public")}>Public reply</Button>
                                        <Button type="button" tone={replyMode === "internal" ? "primary" : "outline"} onClick={() => setReplyMode("internal")}>Internal note</Button>
                                    </div>
                                    <textarea className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#053054]" value={replyForm.message} onChange={(event) => setReplyForm((form) => ({ ...form, message: event.target.value }))} />
                                    <input type="file" multiple onChange={(event) => setReplyForm((form) => ({ ...form, attachments: event.target.files }))} className="text-sm" />
                                    <Button type="submit" disabled={loading}><MessageSquarePlus size={17} /> Add message</Button>
                                </form>
                            </section>

                            <aside className="space-y-4">
                                <section className="rounded border border-slate-200 p-4">
                                    <h3 className="mb-3 font-black">Assignment</h3>
                                    <Field label="Support team">
                                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={assignment.supportTeamId} onChange={(event) => setAssignment((form) => ({ ...form, supportTeamId: event.target.value }))}>
                                            <option value="">No team</option>
                                            {resources.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Agents">
                                        <select multiple className="min-h-32 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={assignment.employeeIds} onChange={(event) => setAssignment((form) => ({ ...form, employeeIds: Array.from(event.target.selectedOptions).map((option) => option.value) }))}>
                                            {resources.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                                        </select>
                                    </Field>
                                    <Button onClick={saveAssignment} disabled={loading}><UsersRound size={17} /> Save assignment</Button>
                                </section>
                                <section className="rounded border border-slate-200 p-4">
                                    <h3 className="mb-3 font-black">Ticket Fields</h3>
                                    <Field label="Status">
                                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={selectedTicket.status} onChange={(event) => updateTicket({ status: event.target.value })}>
                                            {["New", "Assigned", "Support Replied", "Customer Replied", "Resolved", "Closed"].map((status) => <option key={status}>{status}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Priority">
                                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={selectedTicket.priority || ""} onChange={(event) => updateTicket({ priority: event.target.value })}>
                                            <option value="">None</option>
                                            {["Low", "Medium", "High", "Urgent", ...resources.priorities.map((priority) => priority.name)].map((priority) => <option key={priority}>{priority}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Category">
                                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={selectedTicket.category || ""} onChange={(event) => updateTicket({ category: event.target.value })}>
                                            <option value="">General</option>
                                            {resources.categories.map((category) => <option key={category.id}>{category.name}</option>)}
                                        </select>
                                    </Field>
                                    <div className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-600">
                                        <p><span className="font-bold">First response due:</span> {selectedTicket.firstResponseDueAt ? new Date(selectedTicket.firstResponseDueAt).toLocaleString() : "Not set"}</p>
                                        <p className="mt-1"><span className="font-bold">Resolution due:</span> {selectedTicket.resolutionDueAt ? new Date(selectedTicket.resolutionDueAt).toLocaleString() : "Not set"}</p>
                                        <p className="mt-1"><span className="font-bold">Escalation level:</span> {selectedTicket.escalationLevel || 0}</p>
                                        <p className="mt-1"><span className="font-bold">Crescosoft ticket:</span> {selectedTicket.crescoSupportTicketId || "Not escalated"}</p>
                                    </div>
                                    <div className="mt-3">
                                        <Button type="button" tone="outline" onClick={escalateToCresco} disabled={loading || selectedTicket.crescoSupportTicketId}>
                                            Escalate to Crescosoft
                                        </Button>
                                    </div>
                                </section>
                            </aside>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
                <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveCategory}>
                    <h2 className="mb-3 font-black">Categories</h2>
                    <div className="mb-3 flex flex-wrap gap-2">{resources.categories.map((item) => <Badge key={item.id}>{item.name}</Badge>)}</div>
                    <Field label="Name"><Input value={categoryForm.name} onChange={(event) => setCategoryForm((form) => ({ ...form, name: event.target.value }))} /></Field>
                    <Field label="Description"><Input value={categoryForm.description} onChange={(event) => setCategoryForm((form) => ({ ...form, description: event.target.value }))} /></Field>
                    <Button type="submit"><Plus size={17} /> Save category</Button>
                </form>
                <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={savePriority}>
                    <h2 className="mb-3 font-black">Priorities</h2>
                    <div className="mb-3 flex flex-wrap gap-2">{resources.priorities.map((item) => <Badge key={item.id}>{item.name}</Badge>)}</div>
                    <Field label="Name"><Input value={priorityForm.name} onChange={(event) => setPriorityForm((form) => ({ ...form, name: event.target.value }))} /></Field>
                    <Field label="Color"><Input type="color" value={priorityForm.color} onChange={(event) => setPriorityForm((form) => ({ ...form, color: event.target.value }))} /></Field>
                    <Field label="Sort order"><Input type="number" value={priorityForm.sortOrder} onChange={(event) => setPriorityForm((form) => ({ ...form, sortOrder: Number(event.target.value) }))} /></Field>
                    <Button type="submit"><Plus size={17} /> Save priority</Button>
                </form>
                <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveTeam}>
                    <h2 className="mb-3 font-black">Support Teams</h2>
                    <div className="mb-3 flex flex-wrap gap-2">{resources.teams.map((item) => <Badge key={item.id}>{item.name}</Badge>)}</div>
                    <Field label="Name"><Input value={teamForm.name} onChange={(event) => setTeamForm((form) => ({ ...form, name: event.target.value }))} /></Field>
                    <Field label="Members">
                        <select multiple className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={teamForm.memberEmployeeIds} onChange={(event) => setTeamForm((form) => ({ ...form, memberEmployeeIds: Array.from(event.target.selectedOptions).map((option) => Number(option.value)) }))}>
                            {resources.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                        </select>
                    </Field>
                    <Button type="submit"><Plus size={17} /> Save team</Button>
                </form>
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
                <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveSla}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="font-black">SLA Policies</h2>
                        <Button type="button" tone="outline" disabled={loading} onClick={runEscalationScan}>Run scan</Button>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">{resources.slaPolicies.map((item) => <Badge key={item.id}>{item.name}</Badge>)}</div>
                    <Field label="Name"><Input value={slaForm.name} onChange={(event) => setSlaForm((form) => ({ ...form, name: event.target.value }))} /></Field>
                    <Field label="Priority"><Input value={slaForm.priority} onChange={(event) => setSlaForm((form) => ({ ...form, priority: event.target.value }))} /></Field>
                    <Field label="Category"><Input value={slaForm.category} onChange={(event) => setSlaForm((form) => ({ ...form, category: event.target.value }))} /></Field>
                    <Field label="First response minutes"><Input type="number" value={slaForm.firstResponseMinutes} onChange={(event) => setSlaForm((form) => ({ ...form, firstResponseMinutes: Number(event.target.value) }))} /></Field>
                    <Field label="Resolution minutes"><Input type="number" value={slaForm.resolutionMinutes} onChange={(event) => setSlaForm((form) => ({ ...form, resolutionMinutes: Number(event.target.value) }))} /></Field>
                    <Field label="Escalation team">
                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={slaForm.escalationTeamId} onChange={(event) => setSlaForm((form) => ({ ...form, escalationTeamId: event.target.value }))}>
                            <option value="">None</option>
                            {resources.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </Field>
                    <Button type="submit"><Plus size={17} /> Save SLA</Button>
                </form>
                <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveRule}>
                    <h2 className="mb-3 font-black">Assignment Rules</h2>
                    <div className="mb-3 flex flex-wrap gap-2">{resources.assignmentRules.map((item) => <Badge key={item.id}>{item.name}</Badge>)}</div>
                    <Field label="Name"><Input value={ruleForm.name} onChange={(event) => setRuleForm((form) => ({ ...form, name: event.target.value }))} /></Field>
                    <Field label="Rule priority"><Input type="number" value={ruleForm.priority} onChange={(event) => setRuleForm((form) => ({ ...form, priority: Number(event.target.value) }))} /></Field>
                    <Field label="Match priority"><Input value={ruleForm.conditionPriority} onChange={(event) => setRuleForm((form) => ({ ...form, conditionPriority: event.target.value }))} /></Field>
                    <Field label="Match category"><Input value={ruleForm.conditionCategory} onChange={(event) => setRuleForm((form) => ({ ...form, conditionCategory: event.target.value }))} /></Field>
                    <Field label="Assign team">
                        <select className="w-full rounded border border-slate-300 px-3 py-2 text-sm" value={ruleForm.supportTeamId} onChange={(event) => setRuleForm((form) => ({ ...form, supportTeamId: event.target.value }))}>
                            <option value="">No team</option>
                            {resources.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Assign agents">
                        <select multiple className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm" value={ruleForm.assignEmployeeIds} onChange={(event) => setRuleForm((form) => ({ ...form, assignEmployeeIds: Array.from(event.target.selectedOptions).map((option) => option.value) }))}>
                            {resources.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                        </select>
                    </Field>
                    <Button type="submit"><Plus size={17} /> Save rule</Button>
                </form>
                <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveArticle}>
                    <h2 className="mb-3 font-black">Knowledge Suggestions</h2>
                    <div className="mb-3 flex flex-wrap gap-2">{resources.knowledgeArticles.map((item) => <Badge key={item.id}>{item.title}</Badge>)}</div>
                    <Field label="Title"><Input value={articleForm.title} onChange={(event) => setArticleForm((form) => ({ ...form, title: event.target.value }))} /></Field>
                    <Field label="Summary"><Input value={articleForm.summary} onChange={(event) => setArticleForm((form) => ({ ...form, summary: event.target.value }))} /></Field>
                    <Field label="Category"><Input value={articleForm.category} onChange={(event) => setArticleForm((form) => ({ ...form, category: event.target.value }))} /></Field>
                    <Field label="Keywords"><Input value={articleForm.keywords} onChange={(event) => setArticleForm((form) => ({ ...form, keywords: event.target.value }))} /></Field>
                    <Field label="Content">
                        <textarea className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#053054]" value={articleForm.content} onChange={(event) => setArticleForm((form) => ({ ...form, content: event.target.value }))} />
                    </Field>
                    <Button type="submit"><Plus size={17} /> Save article</Button>
                </form>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="font-black">Reports</h2>
                        <Button type="button" tone="outline" onClick={loadReports}>Refresh</Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded bg-slate-50 p-3">
                            <p className="text-xs font-bold text-slate-500">Tickets</p>
                            <p className="mt-1 text-2xl font-black">{reports?.totalTickets || 0}</p>
                        </div>
                        <div className="rounded bg-slate-50 p-3">
                            <p className="text-xs font-bold text-slate-500">CSAT Avg</p>
                            <p className="mt-1 text-2xl font-black">{reports?.satisfaction?.average || "-"}</p>
                        </div>
                        <div className="rounded bg-slate-50 p-3">
                            <p className="text-xs font-bold text-slate-500">Resolution SLA</p>
                            <p className="mt-1 text-2xl font-black">{reports?.resolutionSlaPercent ?? "-"}%</p>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-black">Status</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(reports?.byStatus || {}).map(([label, value]) => <Badge key={label}>{label}: {value}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black">Deflection</h3>
                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                                {(reports?.topDeflectionArticles || []).map((article) => (
                                    <p key={article.id}>{article.title}: {article.deflectionCount}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 font-black">Audit Log</h2>
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="rounded border border-slate-200 p-3 text-sm">
                                <p className="font-bold text-slate-900">{log.action}</p>
                                <p className="text-slate-500">{log.entityType} #{log.entityId || "-"} · {new Date(log.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                        {!auditLogs.length && <p className="text-sm text-slate-500">No audit events yet.</p>}
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 font-black">Customer Management</h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {resources.portalUsers.map((user) => (
                        <div key={user.id} className="rounded border border-slate-200 p-3">
                            <p className="font-black">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <div className="mt-2 flex gap-2"><Badge>{user.portalStatus}</Badge><Badge>{user.activationStatus}</Badge></div>
                        </div>
                    ))}
                </div>
                {!resources.portalUsers.length && <p className="text-sm text-slate-500">No portal customers yet.</p>}
            </section>
        </main>
    );
};

export default CustomerHelpdeskWorkspace;
