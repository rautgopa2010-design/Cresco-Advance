import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@material-tailwind/react";
import { TextField } from "@mui/material";
import { PencilLine, Trash } from "lucide-react";

const STORAGE_KEY = "crm:vendors";

const emptyForm = {
    vendorName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    address: "",
};

const VendorManager = ({ mode = "list" }) => {
    const [vendors, setVendors] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editIndex, setEditIndex] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setVendors(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    }, []);

    const saveVendors = (nextVendors) => {
        setVendors(nextVendors);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVendors));
    };

    const filteredVendors = useMemo(() => {
        const text = search.toLowerCase();
        return vendors.filter((vendor) => [vendor.vendorName, vendor.contactPerson, vendor.mobile, vendor.email].join(" ").toLowerCase().includes(text));
    }, [search, vendors]);

    const handleSubmit = () => {
        if (!form.vendorName.trim()) return;
        const payload = { ...form, id: form.id || Date.now() };
        const nextVendors = editIndex !== null ? vendors.map((vendor, index) => (index === editIndex ? payload : vendor)) : [payload, ...vendors];
        saveVendors(nextVendors);
        setForm(emptyForm);
        setEditIndex(null);
    };

    const handleEdit = (vendor) => {
        const index = vendors.findIndex((item) => item.id === vendor.id);
        setForm(vendor);
        setEditIndex(index);
    };

    const handleDelete = (vendorId) => {
        saveVendors(vendors.filter((vendor) => vendor.id !== vendorId));
    };

    return (
        <div className="space-y-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-500">Vendor Master</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">{mode === "add" ? "Add Vendor" : "Vendor List"}</h1>
                <p className="mt-1 text-sm text-slate-500">Maintain vendor names for purchase cost and product sourcing reference.</p>
            </div>

            {mode === "add" && (
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <TextField label="Vendor Name *" size="small" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />
                        <TextField label="Contact Person" size="small" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                        <TextField label="Mobile" size="small" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                        <TextField label="Email" size="small" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <TextField label="Address" size="small" multiline minRows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="md:col-span-2" />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button className="rounded bg-[#053054] px-5 py-2 capitalize text-white" onClick={handleSubmit}>
                            {editIndex !== null ? "Update Vendor" : "Add Vendor"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Vendors</h2>
                    <TextField label="Search Vendor" size="small" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="overflow-auto">
                    <table className="table">
                        <thead className="table-header bg-[#053054] text-white">
                            <tr>
                                <th className="table-head">Vendor</th>
                                <th className="table-head">Contact</th>
                                <th className="table-head">Mobile</th>
                                <th className="table-head">Email</th>
                                <th className="table-head">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.length ? (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="table-row">
                                        <td className="table-cell">{vendor.vendorName}</td>
                                        <td className="table-cell">{vendor.contactPerson || "-"}</td>
                                        <td className="table-cell">{vendor.mobile || "-"}</td>
                                        <td className="table-cell">{vendor.email || "-"}</td>
                                        <td className="table-cell">
                                            <button className="mr-3 text-blue-600" onClick={() => handleEdit(vendor)}><PencilLine size={18} /></button>
                                            <button className="text-slate-500" onClick={() => handleDelete(vendor.id)}><Trash size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="py-5 text-center text-slate-500">No vendors found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorManager;
