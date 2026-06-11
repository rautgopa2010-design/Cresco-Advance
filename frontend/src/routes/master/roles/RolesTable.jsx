// import React from "react";
// import { Trash, Pencil } from "lucide-react";

// const RolesTable = ({ roleList, handleEditRole, handleDeleteRole, moduleList, defaultPermissions }) => {
//     const getRoleNameById = (id) => {
//         if (!id) return "N/A";
//         const role = roleList.find((r) => r.id === parseInt(id));
//         return role ? role.name : "N/A";
//     };

//     const renderRolePermissions = (rolePerms) => {
//         return moduleList
//             .filter((mod) => rolePerms[mod.id])
//             .map((mod) => {
//                 const perms = defaultPermissions.filter((p) => rolePerms[mod.id][p]).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
//                 if (perms.length === 0) return null;
//                 return (
//                     <div key={mod.id}>
//                         <strong>{mod.name}:</strong> {perms.join(", ")}
//                     </div>
//                 );
//             });
//     };

//     return (
//         <div className="card-body p-0">
//             <div className="text-xl font-semibold text-[#433C50] md:text-2xl">Roles Table :</div>
//             <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                 <table className="table">
//                     <thead className="table-header text-nowrap bg-[#053054] text-white">
//                         <tr className="table-row">
//                             <th className="table-head border border-gray-300">Role No.</th>
//                             <th className="table-head border border-gray-300">Role Id</th>
//                             <th className="table-head border border-gray-300">Roles</th>
//                             <th className="table-head border border-gray-300">Parent Role</th>
//                             <th className="table-head border border-gray-300">Inherits From</th>
//                             <th className="table-head border border-gray-300">Permissions</th>
//                             <th className="table-head border border-gray-300">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="table-body text-[#433C50]">
//                         {roleList.map((role, index) => (
//                             <tr
//                                 key={index}
//                                 className="table-row"
//                             >
//                                 <td className="table-cell border border-gray-300 py-3">{index + 1}</td>
//                                 <td className="table-cell border border-gray-300 py-3">{role.id}</td>
//                                 <td className="table-cell border border-gray-300 py-3">{role.name}</td>
//                                 <td className="table-cell border border-gray-300 py-3">{getRoleNameById(role.parentRoleId) || "None"}</td>
//                                 <td className="table-cell border border-gray-300 py-3">
//                                     {!role.parentRoleId ? "N/A" : role.inheritPermissions ? getRoleNameById(role.parentRoleId) : "Custom"}
//                                 </td>
//                                 <td className="table-cell border border-gray-300 py-3">{renderRolePermissions(role.permissions)}</td>
//                                 <td className="table-cell border border-gray-300 py-3">
//                                     <div className="flex justify-center gap-3">
//                                         {role.name !== "Super Admin" && (
//                                             <>
//                                                 <button
//                                                     className="text-blue-500"
//                                                     onClick={() => handleEditRole(role)}
//                                                 >
//                                                     <Pencil size={18} />
//                                                 </button>
//                                                 <button
//                                                     className="text-red-500"
//                                                     onClick={() => handleDeleteRole(index)}
//                                                 >
//                                                     <Trash size={18} />
//                                                 </button>
//                                             </>
//                                         )}
//                                         {role.name === "Super Admin" && <span className="text-gray-400">Locked</span>}
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                         {roleList.length === 0 && (
//                             <tr>
//                                 <td
//                                     colSpan={7}
//                                     className="py-4 text-center text-gray-400"
//                                 >
//                                     No Roles Added Yet.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default RolesTable;

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Box, Typography, IconButton, useMediaQuery } from "@mui/material";
import { Trash, Pencil, X } from "lucide-react";
import { deleteRole } from "../../../redux/actions/rbac";
import { Button } from "@material-tailwind/react";

const RolesTable = ({ onEditRole, defaultPermissions, scrollToTop }) => {
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const { roles: roleList, modules: moduleList } = useSelector((state) => state.rbac);

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
        dispatch(deleteRole(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleEditRoleClick = (role) => {
        onEditRole(role);
    
        // Wait a moment for DOM update, then scroll
        setTimeout(() => {
            if (scrollToTop) scrollToTop();
        }, 100);
    };      

    const getRoleNameById = (id) => {
        if (!id) return "N/A";
        const role = roleList.find((r) => r.id === parseInt(id));
        return role ? role.name : "N/A";
    };

    const renderRolePermissions = (rolePerms = {}) => {
        if (!rolePerms || typeof rolePerms !== "object") return <span className="text-gray-400">No Permissions</span>;

        return moduleList
            .filter((mod) => rolePerms[mod.id])
            .map((mod) => {
                const modPerms = rolePerms[mod.id] || {};
                const perms = defaultPermissions.filter((p) => modPerms[p]).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
                if (perms.length === 0) return null;

                return (
                    <div key={mod.id}>
                        <strong>{mod.module_name || mod.name || "Unnamed Module"}:</strong> {perms.join(", ")}
                    </div>
                );
            });
    };

    return (
        <>
            <div className="card-body p-0">
                <div className="text-xl font-semibold text-[#433C50] md:text-2xl">Roles Table :</div>
                <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                    <table className="table">
                        <thead className="table-header text-nowrap bg-[#053054] text-white">
                            <tr className="table-row">
                                <th className="table-head border border-gray-300">Sr. No.</th>
                                <th className="table-head border border-gray-300">Roles</th>
                                <th className="table-head border border-gray-300">Parent Role</th>
                                <th className="table-head border border-gray-300">Inherits From</th>
                                <th className="table-head border border-gray-300">Permissions</th>
                                <th className="table-head border border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body text-[#433C50]">
                            {[...roleList]
                                .sort((a, b) => a.id - b.id)
                                .map((role, index) => (
                                    <tr
                                        key={role.id}
                                        className="table-row"
                                    >
                                        <td className="table-cell border border-gray-300 py-3">{index + 1}</td>
                                        <td className="table-cell border border-gray-300 py-3">{role.name}</td>
                                        <td className="table-cell border border-gray-300 py-3">{getRoleNameById(role.parentRoleId) || "None"}</td>
                                        <td className="table-cell border border-gray-300 py-3">
                                            {!role.parentRoleId ? "N/A" : role.inheritPermissions ? getRoleNameById(role.parentRoleId) : "Custom"}
                                        </td>
                                        <td className="table-cell border border-gray-300 py-3">{renderRolePermissions(role.permissions)}</td>
                                        <td className="table-cell border border-gray-300 py-3">
                                            <div className="flex justify-center gap-3">
                                                {role.name !== "Super Admin" ? (
                                                    <>
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEditRoleClick(role)}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(role.id)}
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">Locked</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {roleList.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-4 text-center text-gray-400"
                                    >
                                        No Roles Added Yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this role?</Typography>

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
        </>
    );
};

export default RolesTable;
