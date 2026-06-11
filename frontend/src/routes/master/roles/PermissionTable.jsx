// import React from "react";
// import { Checkbox } from "@mui/material";
// import { Trash, Pencil } from "lucide-react";

// const PermissionTable = ({
//     moduleList,
//     permissions,
//     togglePermission,
//     toggleModuleRow,
//     togglePermissionColumn,
//     handleEditModule,
//     handleDeleteModule,
//     defaultPermissions,
// }) => {
//     return (
//         <div className="card-body p-0">
//             <div className="text-xl font-semibold text-[#433C50] md:text-2xl">Permission's Table :</div>
//             <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                 <table className="table">
//                     <thead className="table-header text-nowrap bg-[#053054] text-white">
//                         <tr className="table-row">
//                             <th className="table-head border border-gray-300">Module No.</th>
//                             <th className="table-head border border-gray-300">Module Id</th>
//                             <th className="table-head border border-gray-300">Modules</th>
//                             {defaultPermissions.map((perm) => (
//                                 <th
//                                     key={perm}
//                                     className="table-head border border-gray-300 capitalize"
//                                 >
//                                     <div className="flex items-center justify-center gap-2">
//                                         <Checkbox
//                                             onChange={() => togglePermissionColumn(perm)}
//                                             checked={moduleList.every((mod) => permissions[mod.id]?.[perm])}
//                                             sx={{ color: "#E0E0EC" }}
//                                             size="small"
//                                         />
//                                         {perm}
//                                     </div>
//                                 </th>
//                             ))}
//                             <th className="table-head border border-gray-300">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="table-body text-[#433C50]">
//                         {moduleList.map((mod, index) => (
//                             <tr
//                                 key={mod.id}
//                                 className="table-row"
//                             >
//                                 <td className="table-cell border border-gray-300 py-1">{index + 1}</td>
//                                 <td className="table-cell border border-gray-300 py-1">{mod.id}</td>
//                                 <td className="table-cell border border-gray-300 py-1">
//                                     <div className="flex items-center gap-2">
//                                         <Checkbox
//                                             checked={defaultPermissions.every((perm) => permissions[mod.id]?.[perm])}
//                                             onChange={() => toggleModuleRow(mod.id)}
//                                             size="small"
//                                         />
//                                         {mod.name}
//                                     </div>
//                                 </td>
//                                 {defaultPermissions.map((perm) => (
//                                     <td
//                                         key={perm}
//                                         className="table-cell border border-gray-300 py-1 text-center"
//                                     >
//                                         <Checkbox
//                                             checked={permissions[mod.id]?.[perm] || false}
//                                             onChange={() => togglePermission(mod.id, perm)}
//                                             size="small"
//                                         />
//                                     </td>
//                                 ))}
//                                 <td className="table-cell border border-gray-300 py-1">
//                                     <div className="flex justify-center gap-3">
//                                         <button
//                                             className="text-blue-500"
//                                             onClick={() => handleEditModule(mod.id)}
//                                         >
//                                             <Pencil size={18} />
//                                         </button>
//                                         <button
//                                             className="text-red-500"
//                                             onClick={() => handleDeleteModule(mod.id)}
//                                         >
//                                             <Trash size={18} />
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                         {moduleList.length === 0 && (
//                             <tr>
//                                 <td
//                                     colSpan={defaultPermissions.length + 4}
//                                     className="py-4 text-center text-gray-400"
//                                 >
//                                     No Modules Added Yet.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default PermissionTable;

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Box, Typography, IconButton, useMediaQuery, Checkbox } from "@mui/material";
import { Trash, Pencil, X } from "lucide-react";
import { deleteModule } from "../../../redux/actions/rbac";
import { Button } from "@material-tailwind/react";

const PermissionTable = ({ defaultPermissions, onEditModule }) => {
    const DEFAULT_MODULES = ["Enquiry", "Leads", "API Leads", "Followup", "Quotations", "Orders", "Customer", "Invoice", "Reports", "Incentive", "Master", "Tickets"];
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const { modules: moduleList, permissions } = useSelector((state) => state.rbac);

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

    // Toggle all permissions in a column
    const togglePermissionColumn = (perm) => {
        moduleList.forEach((mod) => {
            dispatch({
                type: "TOGGLE_PERMISSION",
                payload: { moduleId: mod.id, permission: perm },
            });
        });
    };

    // Toggle all permissions for a module
    const toggleModuleRow = (moduleId) => {
        defaultPermissions.forEach((perm) => {
            dispatch({
                type: "TOGGLE_PERMISSION",
                payload: { moduleId, permission: perm },
            });
        });
    };

    // Toggle individual permission
    const togglePermission = (moduleId, permission) => {
        dispatch({
            type: "TOGGLE_PERMISSION",
            payload: { moduleId, permission },
        });
    };

    const handleEditModule = (moduleId) => {
        const moduleToEdit = moduleList.find((mod) => mod.id === moduleId);
        if (moduleToEdit) {
            onEditModule(moduleToEdit);
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteModule(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    return (
        <>
            <div className="card-body p-0">
                <div className="text-xl font-semibold text-[#433C50] md:text-2xl">Permission's Table :</div>
                <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                    <table className="table">
                        <thead className="table-header text-nowrap bg-[#053054] text-white">
                            <tr className="table-row">
                                <th className="table-head border border-gray-300">Sr. No.</th>
                                <th className="table-head border border-gray-300">Modules</th>
                                {defaultPermissions.map((perm) => (
                                    <th
                                        key={perm}
                                        className="table-head border border-gray-300 capitalize"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Checkbox
                                                onChange={() => togglePermissionColumn(perm)}
                                                checked={moduleList.every((mod) => permissions[mod.id]?.[perm])}
                                                sx={{ color: "#E0E0EC" }}
                                                size="small"
                                            />
                                            {perm}
                                        </div>
                                    </th>
                                ))}
                                <th className="table-head border border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body text-[#433C50]">
                            {[...moduleList]
                                .sort((a, b) => a.id - b.id)
                                .map((mod, index) => (
                                    <tr
                                        key={mod.id}
                                        className="table-row"
                                    >
                                        <td className="table-cell border border-gray-300 py-1">{index + 1}</td>
                                        <td className="table-cell border border-gray-300 py-1">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={defaultPermissions.every((perm) => permissions[mod.id]?.[perm])}
                                                    onChange={() => toggleModuleRow(mod.id)}
                                                    size="small"
                                                />
                                                {mod.module_name}
                                            </div>
                                        </td>
                                        {defaultPermissions.map((perm) => (
                                            <td
                                                key={perm}
                                                className="table-cell border border-gray-300 py-1 text-center"
                                            >
                                                <Checkbox
                                                    checked={permissions[mod.id]?.[perm] || false}
                                                    onChange={() => togglePermission(mod.id, perm)}
                                                    size="small"
                                                />
                                            </td>
                                        ))}
                                        <td className="table-cell border border-gray-300 py-1">
                                            <div className="flex justify-center gap-3">
                                                {DEFAULT_MODULES.includes(mod.module_name) ? (
                                                    <span className="text-gray-400">Locked</span>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEditModule(mod.id)}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(mod.id)}
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {moduleList.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={defaultPermissions.length + 4}
                                        className="py-4 text-center text-gray-400"
                                    >
                                        No Modules Added Yet.
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this module?</Typography>

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

export default PermissionTable;
