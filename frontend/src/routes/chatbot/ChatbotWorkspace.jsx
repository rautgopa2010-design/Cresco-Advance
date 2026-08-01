import React, { useEffect, useState } from "react";
import { BarChart3, Bot, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";

const getError = (error, fallback) => error?.response?.data?.errors?.[0]?.msg || fallback;

const ChatbotWorkspace = () => {
    const [summary, setSummary] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/chatbot/summary");
                setSummary(res.data);
                setErrorMessage("");
                await api.post("/chatbot/audit-access");
            } catch (error) {
                const message = getError(error, "Could not load Website AI Chatbot.");
                setErrorMessage(message);
                toast.error(message);
            }
        };
        load();
    }, []);

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
                    <h1 className="text-2xl font-black text-amber-950">Upgrade Required</h1>
                    <p className="mt-2 max-w-2xl text-sm font-semibold text-amber-800">{errorMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
                    <Bot size={14} /> Phase 2 Foundation
                </div>
                <h1 className="mt-3 text-3xl font-black">Website AI Chatbot</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-100">Your organization is entitled for the chatbot module. Configuration, knowledge base and widget setup will be added in the next phases.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><MessageSquare className="mb-3 text-blue-600" /><p className="text-sm font-semibold text-slate-500">Conversations used</p><p className="text-2xl font-black">{summary?.usage?.conversation || 0} / {summary?.limits?.conversation || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Bot className="mb-3 text-violet-600" /><p className="text-sm font-semibold text-slate-500">AI messages used</p><p className="text-2xl font-black">{summary?.usage?.ai_message || 0} / {summary?.limits?.ai_message || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><FileText className="mb-3 text-emerald-600" /><p className="text-sm font-semibold text-slate-500">Knowledge sources</p><p className="text-2xl font-black">{summary?.usage?.knowledge_source || 0} / {summary?.limits?.knowledge_source || 0}</p></div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><ShieldCheck className="mb-3 text-rose-600" /><p className="text-sm font-semibold text-slate-500">Status</p><p className="text-2xl font-black capitalize">{summary?.status || "loading"}</p></div>
            </div>

            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950"><BarChart3 size={18} /> Enabled Tabs</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {["Dashboard", "Knowledge Base", "FAQs", "Appearance", "Lead Form", "Conversations", "Human Handover", "Install Widget", "Analytics", "Settings"].map((label) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">{label}</div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ChatbotWorkspace;
