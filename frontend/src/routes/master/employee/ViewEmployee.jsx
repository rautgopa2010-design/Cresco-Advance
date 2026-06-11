import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEmployees } from "../../../redux/actions/employee";
import { getRoles } from "../../../redux/actions/rbac";
import {
    CircularProgress,
    IconButton,
    Divider,
    Card,
    CardContent,
} from "@mui/material";
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Users,
    MapPin,
    Calendar,
    Building2,
    UserCheck,
} from "lucide-react";

const ViewEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { employees, loading } = useSelector((state) => state.employee);
    const { roles } = useSelector((state) => state.rbac);

    useEffect(() => {
        dispatch(getEmployees());
        dispatch(getRoles());
    }, [dispatch]);

    const employee = employees?.find((e) => String(e.id) === String(id));

    const getRoleNameById = (roleId) => {
        const role = roles?.find((r) => r.id === Number(roleId));
        return role ? role.name : "-";
    };

    const getEmployeeNameById = (empId) => {
        const e = employees?.find((emp) => emp.id === Number(empId));
        if (!e) return "-";

        return [e.salutation, e.firstName, e.middleName, e.lastName]
            .filter(Boolean)
            .join(" ");
    };

    if (loading || !employee) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <CircularProgress />
            </div>
        );
    }

    const fullName = `${employee.salutation || ""} ${employee.firstName || ""} ${
        employee.middleName || ""
    } ${employee.lastName || ""}`.trim();

    const roleName = getRoleNameById(employee.role_id);
    const reportToName = employee.reportTo ? getEmployeeNameById(employee.reportTo) : "Not Assigned";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8f1ff] via-white to-[#f0e8ff] px-4 lg:px-8">
            {/* HEADER */}
            <div className="mb-7 flex items-center gap-4 pt-6">
                <IconButton
                    onClick={() => navigate(-1)}
                    className="rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:bg-gray-100"
                >
                    <ArrowLeft size={22} className="text-[#053054]" />
                </IconButton>

                <h1 className="bg-gradient-to-r from-[#053054] to-[#5b2be3] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
                    Employee Details
                </h1>
            </div>

            {/* MAIN CARD */}
            <Card className="rounded-3xl border border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
                <CardContent>
                    {/* TOP GRID */}
                    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                        
                        {[
                            {
                                icon: <User className="text-purple-700" />,
                                label: "Full Name",
                                value: fullName,
                                gradient: "from-purple-50 to-purple-100",
                            },
                            {
                                icon: <Phone className="text-sky-700" />,
                                label: "Mobile",
                                value: employee.mobile,
                                gradient: "from-sky-50 to-sky-100",
                            },
                            {
                                icon: <Mail className="text-orange-700" />,
                                label: "Email",
                                value: employee.email,
                                gradient: "from-orange-50 to-orange-100",
                            },
                            {
                                icon: <UserCheck className="text-green-700" />,
                                label: "Reports To",
                                value: reportToName,
                                gradient: "from-green-50 to-green-100",
                            },
                            {
                                icon: <Users className="text-blue-700" />,
                                label: "Role",
                                value: roleName,
                                gradient: "from-blue-50 to-blue-100",
                            },
                            {
                                icon: <Building2 className="text-indigo-700" />,
                                label: "Organization ID",
                                value: employee.org_id,
                                gradient: "from-indigo-50 to-indigo-100",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border bg-gradient-to-br ${item.gradient} p-5 shadow-md backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-2xl`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h2 className="text-[15px] font-semibold text-gray-800">
                                        {item.label}
                                    </h2>
                                </div>
                                <p className="mt-2 text-[15px] text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <Divider className="my-10" />

                    {/* ADDRESS SECTION */}
                    <h2 className="mb-4 bg-gradient-to-r from-[#053054] to-[#6f2de4] bg-clip-text text-2xl font-bold text-transparent">
                        Address Details
                    </h2>

                    <div className="grid gap-7 md:grid-cols-2">
                        {/* Primary Address */}
                        <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-md hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-blue-700" />
                                <h3 className="text-lg font-semibold text-blue-900">
                                    Primary Address
                                </h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {employee.street}, {employee.city}, {employee.state},{" "}
                                {employee.country} - {employee.pincode}
                            </p>
                        </div>

                        {/* Alternate Address */}
                        <div className="rounded-2xl border bg-gradient-to-br from-lime-50 to-lime-100 p-6 shadow-md hover:scale-[1.01] hover:shadow-xl">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-lime-700" />
                                <h3 className="text-lg font-semibold text-lime-900">
                                    Alternate Address
                                </h3>
                            </div>

                            <p className="mt-4 leading-relaxed text-gray-700">
                                {employee.altStreet}, {employee.altCity}, {employee.altState},{" "}
                                {employee.altCountry} - {employee.altPincode}
                            </p>
                        </div>
                    </div>

                    <Divider className="my-10" />

                    {/* TIMESTAMPS */}
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                        {[
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Created At",
                                value: new Date(employee.createdAt).toLocaleString(),
                            },
                            {
                                icon: <Calendar className="text-purple-700" />,
                                label: "Updated At",
                                value: new Date(employee.updatedAt).toLocaleString(),
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-md hover:scale-[1.02] hover:shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <h3 className="text-lg font-semibold text-purple-800">
                                        {item.label}
                                    </h3>
                                </div>
                                <p className="mt-4 text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ViewEmployee;
