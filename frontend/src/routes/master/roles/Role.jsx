// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { TextField, Snackbar, Alert, MenuItem } from "@mui/material";
// import PermissionTable from "./PermissionTable";
// import RolesTable from "./RolesTable";
// import RoleAccessTable from "./RoleAccessTable";

// const defaultPermissions = ["view", "create", "edit", "delete", "print"];

// const Role = () => {
//     const [role, setRole] = useState("");
//     const [roleList, setRoleList] = useState([]);
//     const [moduleName, setModuleName] = useState("");
//     const [moduleList, setModuleList] = useState([]);
//     const [permissions, setPermissions] = useState({});
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const [isEditModuleMode, setIsEditModuleMode] = useState(false);
//     const [editModuleId, setEditModuleId] = useState(null);
//     const [moduleError, setModuleError] = useState(false);
//     const [roleError, setRoleError] = useState(false);
//     const [isEditRoleMode, setIsEditRoleMode] = useState(false);
//     const [editRoleId, setEditRoleId] = useState(null);
//     const [parentRoleId, setParentRoleId] = useState("");
//     const [inheritPermissions, setInheritPermissions] = useState(false);
//     const [parentRoleError, setParentRoleError] = useState(false);

//     useEffect(() => {
//         const storedRoles = JSON.parse(localStorage.getItem("roleList")) || [];
//         const storedModules = JSON.parse(localStorage.getItem("moduleList")) || [];
//         const storedPermissions = JSON.parse(localStorage.getItem("permissions")) || {};

//         setModuleList(storedModules);
//         setPermissions(storedPermissions);

//         if (storedRoles.length === 0) {
//             const superAdminPerms = {};
//             storedModules.forEach((mod) => {
//                 superAdminPerms[mod.id] = {};
//                 defaultPermissions.forEach((perm) => {
//                     superAdminPerms[mod.id][perm] = true;
//                 });
//             });

//             const superAdminRole = {
//                 id: 1,
//                 name: "Super Admin",
//                 date: new Date().toLocaleString("en-GB"),
//                 permissions: superAdminPerms,
//                 parentRoleId: null,
//                 inheritPermissions: false,
//             };

//             localStorage.setItem("roleList", JSON.stringify([superAdminRole]));
//             setRoleList([superAdminRole]);
//         } else {
//             setRoleList(storedRoles);
//         }
//     }, []);

//     const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     const handleResetModuleEdit = () => {
//         setIsEditModuleMode(false);
//         setModuleName("");
//         setEditModuleId(null);
//         setModuleError(false);
//     };

//     const handleAddOrUpdateModule = () => {
//         if (!moduleName.trim()) {
//             setModuleError(true);
//             setSnackbarSeverity("error");
//             setSnackbarMessage("Module Name is required");
//             setSnackbarOpen(true);
//             return;
//         }
//         setModuleError(false);

//         if (isEditModuleMode) {
//             const updatedModules = moduleList.map((mod) => (mod.id === editModuleId ? { ...mod, name: moduleName.trim() } : mod));
//             setModuleList(updatedModules);
//             saveToLocalStorage("moduleList", updatedModules);
//             setSnackbarMessage("Module Updated");
//         } else {
//             const newId = moduleList.length > 0 ? moduleList[moduleList.length - 1].id + 1 : 1;
//             const newModule = { id: newId, name: moduleName.trim() };

//             const updatedModules = [...moduleList, newModule];
//             const updatedPermissions = {
//                 ...permissions,
//                 [newId]: defaultPermissions.reduce((acc, perm) => {
//                     acc[perm] = false;
//                     return acc;
//                 }, {}),
//             };

//             const updatedRoleList = roleList.map((role) => {
//                 if (role.name === "Super Admin") {
//                     return {
//                         ...role,
//                         permissions: {
//                             ...role.permissions,
//                             [newId]: defaultPermissions.reduce((acc, perm) => {
//                                 acc[perm] = true;
//                                 return acc;
//                             }, {}),
//                         },
//                     };
//                 }
//                 return role;
//             });

//             setModuleList(updatedModules);
//             setPermissions(updatedPermissions);
//             setRoleList(updatedRoleList);
//             saveToLocalStorage("moduleList", updatedModules);
//             saveToLocalStorage("permissions", updatedPermissions);
//             saveToLocalStorage("roleList", updatedRoleList);
//             setSnackbarMessage("Module Added");
//         }

//         handleResetModuleEdit();
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//     };

//     const handleEditModule = (id) => {
//         const module = moduleList.find((m) => m.id === id);
//         if (module) {
//             setModuleName(module.name);
//             setIsEditModuleMode(true);
//             setEditModuleId(id);
//         }
//     };

//     const handleDeleteModule = (id) => {
//         const updatedModules = moduleList.filter((mod) => mod.id !== id);
//         const updatedPermissions = { ...permissions };
//         delete updatedPermissions[id];
//         setModuleList(updatedModules);
//         setPermissions(updatedPermissions);
//         saveToLocalStorage("moduleList", updatedModules);
//         saveToLocalStorage("permissions", updatedPermissions);
//     };

//     const handleEditRole = (role) => {
//         setRole(role.name);
//         setIsEditRoleMode(true);
//         setEditRoleId(role.id);
//         setPermissions(JSON.parse(JSON.stringify(role.permissions)));
//         setParentRoleId(role.parentRoleId || "");
//         setInheritPermissions(role.inheritPermissions || false);
//     };

//     const handleResetRoleEdit = () => {
//         setIsEditRoleMode(false);
//         setRole("");
//         setEditRoleId(null);
//         setRoleError(false);
//         setParentRoleId("");
//         setInheritPermissions(false);

//         const clearedPermissions = {};
//         moduleList.forEach((mod) => {
//             clearedPermissions[mod.id] = {};
//             defaultPermissions.forEach((perm) => {
//                 clearedPermissions[mod.id][perm] = false;
//             });
//         });
//         setPermissions(clearedPermissions);
//         saveToLocalStorage("permissions", clearedPermissions);
//     };

//     const handleAddRole = () => {
//         if (parseInt(parentRoleId) === editRoleId) {
//             setSnackbarSeverity("error");
//             setSnackbarMessage("A role cannot be its own parent.");
//             setSnackbarOpen(true);
//             return;
//         }
//         if (!role.trim()) {
//             setRoleError(true);
//             setSnackbarSeverity("error");
//             setSnackbarMessage("Role Name is required");
//             setSnackbarOpen(true);
//             return;
//         }
//         if (!parentRoleId) {
//             setParentRoleError(true);
//             setSnackbarSeverity("error");
//             setSnackbarMessage("Please select Parent Role of this role");
//             setSnackbarOpen(true);
//             return;
//         } else {
//             setParentRoleError(false);
//         }

//         let finalPermissions = JSON.parse(JSON.stringify(permissions));
//         if (inheritPermissions && parentRoleId) {
//             const parentRole = roleList.find((r) => r.id === parseInt(parentRoleId));
//             if (parentRole) {
//                 finalPermissions = JSON.parse(JSON.stringify(parentRole.permissions));
//             }
//         }

//         const hasPermissions = moduleList.some((mod) => defaultPermissions.some((perm) => finalPermissions[mod.id]?.[perm]));
//         if (!hasPermissions) {
//             setSnackbarSeverity("error");
//             setSnackbarMessage("Please choose at least one permission");
//             setSnackbarOpen(true);
//             return;
//         }

//         if (isEditRoleMode) {
//             const updatedRoles = roleList.map((r) =>
//                 r.id === editRoleId
//                     ? {
//                           ...r,
//                           name: role.trim(),
//                           permissions: finalPermissions,
//                           parentRoleId: parentRoleId || null,
//                           inheritPermissions: inheritPermissions,
//                           date: new Date().toLocaleString("en-GB"),
//                       }
//                     : r,
//             );
//             setRoleList(updatedRoles);
//             saveToLocalStorage("roleList", updatedRoles);
//             setSnackbarMessage("Role Updated");
//         } else {
//             const newRole = {
//                 id: roleList.length > 0 ? roleList[roleList.length - 1].id + 1 : 1,
//                 name: role.trim(),
//                 date: new Date().toLocaleString("en-GB"),
//                 permissions: finalPermissions,
//                 parentRoleId: parentRoleId || null,
//                 inheritPermissions: inheritPermissions,
//             };
//             const updatedRoles = [...roleList, newRole];
//             setRoleList(updatedRoles);
//             saveToLocalStorage("roleList", updatedRoles);
//             setSnackbarMessage("Role Created");
//         }

//         handleResetRoleEdit();
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//     };

//     const handleDeleteRole = (index) => {
//         const updated = roleList.filter((_, i) => i !== index);
//         setRoleList(updated);
//         saveToLocalStorage("roleList", updated);
//     };

//     const togglePermission = (id, perm) => {
//         const updated = {
//             ...permissions,
//             [id]: {
//                 ...permissions[id],
//                 [perm]: !permissions[id][perm],
//             },
//         };
//         setPermissions(updated);
//         saveToLocalStorage("permissions", updated);
//     };

//     const toggleModuleRow = (id) => {
//         const allChecked = defaultPermissions.every((perm) => permissions[id]?.[perm]);
//         const updatedPerms = defaultPermissions.reduce((acc, perm) => {
//             acc[perm] = !allChecked;
//             return acc;
//         }, {});
//         setPermissions({ ...permissions, [id]: updatedPerms });
//         saveToLocalStorage("permissions", { ...permissions, [id]: updatedPerms });
//     };

//     const togglePermissionColumn = (perm) => {
//         const allChecked = moduleList.every((mod) => permissions[mod.id]?.[perm]);
//         const updated = { ...permissions };
//         moduleList.forEach((mod) => {
//             if (!updated[mod.id]) updated[mod.id] = {};
//             updated[mod.id][perm] = !allChecked;
//         });
//         setPermissions(updated);
//         saveToLocalStorage("permissions", updated);
//     };

//     return (
//         <div className="card space-y-6">
//             <div className="mb-2 text-xl font-semibold text-[#433C50] md:mb-4 md:text-2xl">Roles & Permissions :</div>

//             {/* Module Input */}
//             <div className="flex flex-col gap-3 md:flex-row md:items-center">
//                 <TextField
//                     size="small"
//                     label="Module Name *"
//                     placeholder="Enter Module Name"
//                     value={moduleName}
//                     onChange={(e) => setModuleName(e.target.value)}
//                     error={moduleError}
//                     className="w-full md:w-56"
//                 />
//                 <div className="flex gap-3">
//                     <Button
//                         variant="gradient"
//                         className={`rounded px-4 py-2 text-sm capitalize text-white ${isEditModuleMode ? "bg-green-900" : "bg-[#053054]"}`}
//                         onClick={handleAddOrUpdateModule}
//                     >
//                         {isEditModuleMode ? "Update Module" : "Create Module"}
//                     </Button>
//                     {isEditModuleMode && (
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-gray-500 px-4 py-2 text-sm capitalize text-white"
//                             onClick={handleResetModuleEdit}
//                         >
//                             Reset
//                         </Button>
//                     )}
//                 </div>
//             </div>

//             {/* Role Inputs */}
//             <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:flex lg:flex-row">
//                 <TextField
//                     size="small"
//                     label="Role *"
//                     placeholder="Enter Role Name"
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                     error={roleError}
//                     className="w-full md:w-56 lg:w-56"
//                 />
//                 <TextField
//                     select
//                     size="small"
//                     label="Parent Role"
//                     value={parentRoleId}
//                     onChange={(e) => setParentRoleId(e.target.value)}
//                     error={parentRoleError}
//                     className="w-full md:w-56 lg:w-56"
//                 >
//                     <MenuItem value="" disabled>Choose Role</MenuItem>
//                     {roleList
//                         .filter((r) => !isEditRoleMode || r.id !== editRoleId)
//                         .map((r) => (
//                             <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
//                         ))}
//                 </TextField>

//                 <div className="flex items-center space-x-2 md:col-span-2 md:mt-0 lg:col-span-1 lg:mt-0">
//                     <input type="checkbox" checked={inheritPermissions} onChange={() => setInheritPermissions(!inheritPermissions)} />
//                     <span>Inherit Permissions</span>
//                 </div>
//             </div>

//             <PermissionTable
//                 moduleList={moduleList}
//                 permissions={permissions}
//                 togglePermission={togglePermission}
//                 toggleModuleRow={toggleModuleRow}
//                 togglePermissionColumn={togglePermissionColumn}
//                 handleEditModule={handleEditModule}
//                 handleDeleteModule={handleDeleteModule}
//                 defaultPermissions={defaultPermissions}
//             />

//             <div className="flex justify-end gap-3">
//                 <Button
//                     variant="gradient"
//                     className={`rounded px-4 py-2 text-sm capitalize text-white ${isEditRoleMode ? "bg-green-900" : "bg-[#053054]"}`}
//                     onClick={handleAddRole}
//                 >
//                     {isEditRoleMode ? "Update Role" : "Create Role"}
//                 </Button>
//                 {isEditRoleMode && (
//                     <Button
//                         variant="gradient"
//                         className="rounded bg-gray-500 px-4 py-2 text-sm capitalize text-white"
//                         onClick={handleResetRoleEdit}
//                     >
//                         Reset
//                     </Button>
//                 )}
//             </div>

//             <RolesTable
//                 roleList={roleList}
//                 handleEditRole={handleEditRole}
//                 handleDeleteRole={handleDeleteRole}
//                 moduleList={moduleList}
//                 defaultPermissions={defaultPermissions}
//             />

//             {/* ✅ Role Access Table */}
//             <RoleAccessTable roleList={roleList} />

//             <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
//                 <Alert severity={snackbarSeverity} variant="filled" onClose={handleSnackbarClose}>
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </div>
//     );
// };

// export default Role;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { TextField, Snackbar, Alert, MenuItem, CircularProgress, Checkbox } from "@mui/material";
import { getModules, createModule, getPermissions, getRoles, addRole, updateRole, updateModule } from "../../../redux/actions/rbac";
import { clearSnackbar } from "../../../redux/actions/commonActions";
import PermissionTable from "./PermissionTable";
import RolesTable from "./RolesTable";
import RoleAccessTable from "./RoleAccessTable";

const defaultPermissions = ["view", "create", "edit", "delete", "print"];

const Role = () => {
    const dispatch = useDispatch();
    const { modules, roles, permissions, loading, snackbarMessage, snackbarSeverity } = useSelector((state) => state.rbac);

    // ✅ State declarations
    const [moduleName, setModuleName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [parentRoleId, setParentRoleId] = useState("");
    const [isModuleError, setIsModuleError] = useState(false);
    const [isRoleError, setIsRoleError] = useState(false);
    const [isParentRoleError, setIsParentRoleError] = useState(false);
    const [inheritPermissions, setInheritPermissions] = useState(false);
    const [editRoleId, setEditRoleId] = useState(null);
    const [editModuleId, setEditModuleId] = useState(null);
    const [isEditModuleMode, setIsEditModuleMode] = useState(false);
    const [isEditRoleMode, setIsEditRoleMode] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarLocalMessage, setSnackbarLocalMessage] = useState("");
    const [snackbarLocalSeverity, setSnackbarLocalSeverity] = useState("error");

    // ✅ Load data on mount
    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getModules());
        dispatch(getRoles());
        dispatch(getPermissions());
    }, [dispatch]);

    const getEmptyPermissions = () => {
        const clearedPermissions = {};
        modules.forEach((mod) => {
            clearedPermissions[mod.id] = {};
            defaultPermissions.forEach((perm) => {
                clearedPermissions[mod.id][perm] = false;
            });
        });
        return clearedPermissions;
    };

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarLocalMessage(snackbarMessage);
            setSnackbarLocalSeverity(snackbarSeverity || "success");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage, snackbarSeverity]);

    // ✅ Handle create/update module
    const handleAddOrUpdateModule = () => {
        if (!moduleName.trim()) {
            setIsModuleError(true);
            setSnackbarLocalMessage("Module Name is required");
            setSnackbarOpen(true);
            return;
        }

        setIsModuleError(false);

        if (isEditModuleMode) {
            // Update mode
            dispatch(updateModule(editModuleId, moduleName.trim())).then(() => {
                dispatch(getModules());
                dispatch(getRoles());
            });
        } else {
            // Create mode
            dispatch(createModule(moduleName.trim())).then(() => {
                dispatch(getModules());
                dispatch(getRoles());
            });
        }

        // Reset state
        setModuleName("");
        setEditModuleId(null);
        setIsEditModuleMode(false);
    };

    const handleResetModuleEdit = () => {
        setIsEditModuleMode(false);
        setModuleName("");
        setEditModuleId(null);
        setIsModuleError(false);
    };

    const handleEditModule = (mod) => {
        setIsEditModuleMode(true);
        setEditModuleId(mod.id);
        setModuleName(mod.module_name);
    };

    // ✅ Handle create/update role
    const handleAddOrUpdateRole = () => {
        // Prevent self as parent role
        if (parseInt(parentRoleId) === editRoleId) {
            setSnackbarLocalSeverity("error");
            setSnackbarLocalMessage("A role cannot be its own parent.");
            setSnackbarOpen(true);
            return;
        }

        // Validate empty role name
        if (!roleName.trim()) {
            setIsRoleError(true);
            setSnackbarLocalSeverity("error");
            setSnackbarLocalMessage("Role Name is required");
            setSnackbarOpen(true);
            return;
        } else {
            setIsRoleError(false);
        }

        // Validate parent role (optional)
        if (!parentRoleId) {
            setIsParentRoleError(true);
            setSnackbarLocalSeverity("error");
            setSnackbarLocalMessage("Please select Parent Role of this role");
            setSnackbarOpen(true);
            return;
        } else {
            setIsParentRoleError(false);
        }

        // Clone current permissions
        let finalPermissions = JSON.parse(JSON.stringify(permissions));

        // Inherit parent's permissions
        if (inheritPermissions && parentRoleId) {
            const parentRole = roles.find((r) => r.id === parseInt(parentRoleId));
            if (parentRole && parentRole.permissions) {
                finalPermissions = JSON.parse(JSON.stringify(parentRole.permissions));
            }
        }

        // ✅ Skip validation if inheritPermissions is true
        if (!inheritPermissions) {
            const hasPermissions = modules.some((mod) => permissions[mod.id] && Object.values(permissions[mod.id]).some((val) => val === true));

            if (!hasPermissions) {
                setSnackbarLocalSeverity("error");
                setSnackbarLocalMessage("Please choose at least one permission");
                setSnackbarOpen(true);
                return;
            }
        }

        // ✅ Build correct object for backend
        const data = {
            role_id: editRoleId,
            role_name: roleName.trim(),
            parent_role_id: parseInt(parentRoleId),
            inherit_permissions: inheritPermissions,
            permissions: finalPermissions,
        };

        if (isEditRoleMode) {
            dispatch(updateRole(data)).then(() => {
                dispatch(getRoles());
                dispatch({
                    type: "RESET_PERMISSIONS",
                    payload: getEmptyPermissions(),
                });
            });
        } else {
            dispatch(addRole(data)).then(() => {
                dispatch(getRoles());
                dispatch({
                    type: "RESET_PERMISSIONS",
                    payload: getEmptyPermissions(),
                });
            });
        }

        // Reset form
        setRoleName("");
        setParentRoleId("");
        setInheritPermissions(false);
        setIsEditRoleMode(false);
    };

    const handleResetRoleEdit = () => {
        setIsEditRoleMode(false);
        setRoleName("");
        setEditRoleId(null);
        setIsRoleError(false);
        setParentRoleId("");
        setInheritPermissions(false);
        dispatch({
            type: "RESET_PERMISSIONS",
            payload: getEmptyPermissions(),
        });
    };

    const handleEditRole = (role) => {
        setIsEditRoleMode(true);
        setRoleName(role.name || "");
        setParentRoleId(role.parentRoleId ? String(role.parentRoleId) : "");
        setEditRoleId(role.id);
        setInheritPermissions(role.inheritPermissions || false);

        if (role.permissions) {
            dispatch({
                type: "RESET_PERMISSIONS",
                payload: role.permissions,
            });
        }
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setSnackbarLocalMessage("");
        dispatch(clearSnackbar());
    };

    const scrollToTop = () => {
        const container = document.querySelector(".card");
        if (container) {
            container.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };          

    return (
        <div className="card">
            {loading && (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            )}

            <div className="text-xl font-semibold text-[#433C50] md:mb-4 md:text-2xl">Roles & Permissions :</div>

            {/* Module Input */}
            {/* <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <TextField
                    size="small"
                    label="Module Name *"
                    placeholder="Enter Module Name"
                    value={moduleName}
                    onChange={(e) => {
                        setModuleName(e.target.value);
                        if (isModuleError) setIsModuleError(false);
                    }}
                    error={isModuleError}
                    className="w-full md:w-56"
                />

                <div className="flex gap-3">
                    <Button
                        variant="gradient"
                        className={`rounded px-4 py-2 text-sm capitalize text-white ${isEditModuleMode ? "bg-green-900" : "bg-[#053054]"}`}
                        onClick={handleAddOrUpdateModule}
                    >
                        {isEditModuleMode ? "Update Module" : "Create Module"}
                    </Button>
                    {isEditModuleMode && (
                        <Button
                            variant="gradient"
                            className="rounded bg-gray-500 px-4 py-2 text-sm capitalize text-white"
                            onClick={handleResetModuleEdit}
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div> */}

            {/* Role Input */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:flex lg:flex-row">
                <TextField
                    size="small"
                    label="Role *"
                    placeholder="Enter Role Name"
                    value={roleName}
                    onChange={(e) => {
                        setRoleName(e.target.value);
                        if (isRoleError) setIsRoleError(false);
                    }}
                    error={isRoleError}
                    className="w-full md:w-56 lg:w-56"
                />

                <TextField
                    select
                    size="small"
                    label="Parent Role"
                    value={parentRoleId}
                    onChange={(e) => {
                        setParentRoleId(e.target.value);
                        if (isParentRoleError) setIsParentRoleError(false);
                    }}
                    error={isParentRoleError}
                    className="w-full md:w-56 lg:w-56"
                >
                    <MenuItem
                        value=""
                        disabled
                    >
                        Choose Role
                    </MenuItem>
                    {roles.map((r) => (
                        <MenuItem
                            key={r.id}
                            value={r.id}
                        >
                            {r.name}
                        </MenuItem>
                    ))}
                </TextField>

                <div className="flex items-center md:col-span-2 lg:col-span-1">
                    <Checkbox
                        checked={inheritPermissions}
                        size="small"
                        onChange={() => setInheritPermissions(!inheritPermissions)}
                    />
                    <span>Inherit Permissions</span>
                </div>
            </div>

            <PermissionTable
                defaultPermissions={defaultPermissions}
                onEditModule={handleEditModule}
            />

            <div className="flex justify-end gap-3">
                <Button
                    variant="gradient"
                    className={`rounded px-4 py-2 text-sm capitalize text-white ${isEditRoleMode ? "bg-green-900" : "bg-[#053054]"}`}
                    onClick={handleAddOrUpdateRole}
                >
                    {isEditRoleMode ? "Update Role" : "Create Role"}
                </Button>
                {isEditRoleMode && (
                    <Button
                        variant="gradient"
                        className="rounded bg-gray-500 px-4 py-2 text-sm capitalize text-white"
                        onClick={handleResetRoleEdit}
                    >
                        Reset
                    </Button>
                )}
            </div>

            <RolesTable
                onEditRole={handleEditRole}
                defaultPermissions={defaultPermissions}
                scrollToTop={scrollToTop}
            />

            <RoleAccessTable />

            {/* ✅ Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarLocalSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarLocalMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Role;
