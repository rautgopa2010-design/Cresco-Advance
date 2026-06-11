// import React from "react";

// const RoleAccessTable = ({ roleList }) => {
//     const getRoleNameById = (id) => {
//         const role = roleList.find((r) => r.id === id);
//         return role ? role.name : "Unknown";
//     };

//     const getDescendants = (roleId) => {
//         const directChildren = roleList.filter((r) => r.parentRoleId === roleId);
//         const allDescendants = [];

//         directChildren.forEach((child) => {
//             allDescendants.push(child.id);
//             allDescendants.push(...getDescendants(child.id));
//         });

//         return allDescendants;
//     };

//     return (
//         <div className="card-body p-0">
//             <div className="mb-2 text-xl font-semibold text-[#433C50] md:text-2xl">Role Access Table (Derived from Hierarchy) :</div>
//             <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                 <table className="table w-full">
//                     <thead className="bg-[#053054] text-white">
//                         <tr>
//                             <th className="border border-gray-300 px-4 py-2 text-left">Role Name</th>
//                             <th className="border border-gray-300 px-4 py-2 text-left">Can Access Roles</th>
//                         </tr>
//                     </thead>
//                     <tbody className="text-[#433C50]">
//                         {roleList.map((role) => {
//                             const visibleIds = getDescendants(role.id);
//                             const visibleRoles = visibleIds.map(getRoleNameById).join(", ") || "None";
//                             return (
//                                 <tr key={role.id}>
//                                     <td className="border border-gray-300 px-4 py-2">{role.name}</td>
//                                     <td className="border border-gray-300 px-4 py-2">{visibleRoles}</td>
//                                 </tr>
//                             );
//                         })}
//                         {roleList.length === 0 && (
//                             <tr>
//                                 <td
//                                     colSpan={2}
//                                     className="py-4 text-center text-gray-400"
//                                 >
//                                     No Roles Available
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default RoleAccessTable;

import React from "react";
import { useSelector } from "react-redux";

const RoleAccessTable = () => {
    const { roles: roleList } = useSelector((state) => state.rbac);

    const getRoleNameById = (id) => {
        const role = roleList.find((r) => r.id === id);
        return role ? role.name : "Unknown";
    };

    const getDescendants = (roleId) => {
        const directChildren = roleList.filter((r) => r.parentRoleId === roleId);
        const allDescendants = [];

        directChildren.forEach((child) => {
            allDescendants.push(child.id);
            allDescendants.push(...getDescendants(child.id));
        });

        return allDescendants;
    };

    return (
        <div className="card-body p-0">
            <div className="mb-2 text-xl font-semibold text-[#433C50] md:text-2xl">Role Access Table (Derived from Hierarchy) :</div>
            <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                <table className="table w-full">
                    <thead className="bg-[#053054] text-white">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">Role Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Can Access Roles</th>
                        </tr>
                    </thead>
                    <tbody className="text-[#433C50]">
                        {[...roleList]
                            .sort((a, b) => a.id - b.id)
                            .map((role) => {
                                const visibleIds = getDescendants(role.id);
                                const visibleRoles = visibleIds.map(getRoleNameById).join(", ") || "None";
                                return (
                                    <tr key={role.id}>
                                        <td className="border border-gray-300 px-4 py-2">{role.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{visibleRoles}</td>
                                    </tr>
                                );
                            })}
                        {roleList.length === 0 && (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="py-4 text-center text-gray-400"
                                >
                                    No Roles Available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleAccessTable;
