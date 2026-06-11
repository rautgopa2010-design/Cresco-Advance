// import { Button } from "@material-tailwind/react";
// import { File, PencilLine, Trash, UserPlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Employee = () => {
//     const navigate = useNavigate();
//     const [employees, setEmployees] = useState([]);

//     useEffect(() => {
//         const storedEmployees = JSON.parse(localStorage.getItem("employee")) || [];
//         setEmployees(storedEmployees);
//     }, []);

//     const handleCreateClick = () => {
//         navigate("/settings/master/employee/create-employee");
//     };

//     const handleDelete = (index) => {
//         const updatedEmployees = employees.filter((_, i) => i !== index);
//         setEmployees(updatedEmployees);
//         localStorage.setItem("employee", JSON.stringify(updatedEmployees));
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Employee Detail's :</div>
//                     <Button
//                         onClick={handleCreateClick}
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                     >
//                         <UserPlus size={20} />
//                         Create New Employee
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Employees No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Employees Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Employee Name</th>
//                                     <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                     <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Street</th>
//                                     <th className="table-head border border-gray-300 capitalize">Country</th>
//                                     <th className="table-head border border-gray-300 capitalize">State</th>
//                                     <th className="table-head border border-gray-300 capitalize">City</th>
//                                     <th className="table-head border border-gray-300 capitalize">Pincode</th>
//                                     <th className="table-head border border-gray-300 capitalize">Report To</th>
//                                     <th className="table-head border border-gray-300 capitalize">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {employees.length === 0 ? (
//                                     <tr>
//                                         <td
//                                             colSpan="12"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No employee data added yet.
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     employees.map((emp, index) => (
//                                         <tr
//                                             key={index}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {`${emp.salutation} ${emp.firstName} ${emp.middleName} ${emp.lastName}`.trim()}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{emp.mobile}</td>
//                                             <td className="table-cell border border-gray-300">{emp.email}</td>
//                                             <td className="table-cell border border-gray-300">{emp.permanentAddress.street}</td>
//                                             <td className="table-cell border border-gray-300">{emp.permanentAddress.country}</td>
//                                             <td className="table-cell border border-gray-300">{emp.permanentAddress.state}</td>
//                                             <td className="table-cell border border-gray-300">{emp.permanentAddress.city}</td>
//                                             <td className="table-cell border border-gray-300">{emp.permanentAddress.pincode}</td>
//                                             <td className="table-cell border border-gray-300">{emp.reportTo}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button className="text-blue-500">
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDelete(index)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                     <button className="text-purple-500">
//                                                         <File size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Employee;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../../../redux/actions/employee";
import { getRoles } from "../../../redux/actions/rbac";
import { Button } from "@material-tailwind/react";
import { Alert, Box, CircularProgress, IconButton, Modal, Snackbar, Typography, useMediaQuery } from "@mui/material";
import { File, PencilLine, Trash, UserPlus, X } from "lucide-react";
import { clearSnackbar } from "../../../redux/actions/commonActions";

const Employee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { employees, loading } = useSelector((state) => state.employee);
    const { roles } = useSelector((state) => state.rbac);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.employee);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(getEmployees());
        dispatch(getRoles());
    }, [dispatch]);

    const getRoleNameById = (roleId) => {
        const role = roles.find((r) => r.id === Number(roleId));
        return role ? role.name : "-";
    };

    const handleCreateClick = () => {
        navigate("/settings/master/employee/create-employee");
    };

    const handleEditClick = (id) => {
        navigate(`/settings/master/employee/edit-employee/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/settings/master/employee/view-employee/${id}`);
    };

    const getEmployeeNameById = (id) => {
        const found = employees.find((emp) => emp.id === Number(id));
        if (!found) return "-";

        const parts = [found.salutation, found.firstName, found.middleName, found.lastName];
        return parts.filter((part) => part && part.trim()).join(" ");
    };

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 330 : 500,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteEmployee(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);

        setTimeout(() => {
            dispatch(clearSnackbar());
        }, 100);
    };

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);    

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Employee Detail's :</div>
                        <Button
                            onClick={handleCreateClick}
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <UserPlus size={20} />
                            Create New Employee
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Mobile</th>
                                        <th className="table-head border border-gray-300 capitalize">Email</th>
                                        <th className="table-head border border-gray-300 capitalize">Role</th>
                                        <th className="table-head border border-gray-300 capitalize">Report To</th>
                                        <th className="table-head border border-gray-300 capitalize">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No employee data added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp, index) => {
                                            const fullName =
                                                `${emp.salutation || ""} ${emp.firstName || ""} ${emp.middleName || ""} ${emp.lastName || ""}`.trim();

                                            const roleName = getRoleNameById(emp.role_id);

                                            return (
                                                <tr
                                                    key={emp.id}
                                                    className="table-row"
                                                >
                                                    <td className="table-cell border border-gray-300">{index + 1}</td>
                                                    <td className="table-cell border border-gray-300">{fullName}</td>
                                                    <td className="table-cell border border-gray-300">{emp.mobile}</td>
                                                    <td className="table-cell border border-gray-300">{emp.email}</td>
                                                    <td className="table-cell border border-gray-300">{roleName}</td>
                                                    <td className="table-cell border border-gray-300">
                                                        {emp.reportTo ? getEmployeeNameById(emp.reportTo) : "-"}
                                                    </td>
                                                    <td className="table-cell border border-gray-300">
                                                        <div className="flex items-center gap-x-4">
                                                            <button
                                                                className="text-blue-500"
                                                                onClick={() => handleEditClick(emp.id)}
                                                            >
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button
                                                                className="text-red-500"
                                                                onClick={() => handleDeleteClick(emp.id)}
                                                            >
                                                                <Trash size={20} />
                                                            </button>
                                                            <button
                                                                className="text-purple-500"
                                                                onClick={() => handleViewClick(emp.id)}
                                                            >
                                                                <File size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            Confirm Delete
                        </Typography>
                        <IconButton
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
                        >
                            <X size={20} />
                        </IconButton>
                    </div>

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this employee?</Typography>

                    <div className="mt-4 flex justify-center gap-4">
                        <Button
                            variant="gradient"
                            className="rounded bg-red-700 px-4 py-2 capitalize text-white"
                            onClick={confirmDelete}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            No
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : "error"}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Employee;
