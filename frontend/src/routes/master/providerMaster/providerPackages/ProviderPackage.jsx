// import React, { useEffect, useState } from "react";
// import { Button } from "@material-tailwind/react";
// import { TbPackages } from "react-icons/tb";
// import { PencilLine, Trash } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const ProviderPackage = () => {
//     const navigate = useNavigate();
//     const [packageList, setPackageList] = useState([]);

//     // Load from localStorage on mount
//     useEffect(() => {
//         const storedPackages = JSON.parse(localStorage.getItem("packageData")) || [];
//         setPackageList(storedPackages);
//     }, []);

//     // Navigate to create-package page
//     const handleCreateClick = () => {
//         navigate("/provider/settings/master/package/create-package");
//     };

//     // Delete package
//     const handleDelete = (index) => {
//         const updatedPackages = packageList.filter((_, i) => i !== index);
//         setPackageList(updatedPackages);
//         localStorage.setItem("packageData", JSON.stringify(updatedPackages));
//     };

//     return (
//         <div className="card rounded-md border p-4 shadow-md">
//             {/* Header */}
//             <div className="flex items-center justify-between text-nowrap">
//                 <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">
//                     Package Detail's :
//                 </div>
//                 <Button
//                     variant="gradient"
//                     className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
//                     onClick={handleCreateClick}
//                 >
//                     <TbPackages size={20} />
//                     Add Package
//                 </Button>
//             </div>

//             {/* Package Cards */}
//             {packageList.length === 0 ? (
//                 <div className="mt-4 text-center text-gray-500">No packages added.</div>
//             ) : (
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
//                     {packageList.map((pkg, index) => (
//                         <div
//                             key={index}
//                             className="rounded-xl bg-gradient-to-r from-[#053054] via-[#1b537b] to-[#053054] p-5 text-white shadow-lg"
//                         >
//                             <div className="mb-4 flex justify-between">
//                                 <h2 className="text-base font-bold md:text-lg lg:text-lg">
//                                     {pkg.packageName}
//                                 </h2>
//                                 <div className="flex items-center gap-x-4">
//                                     <button>
//                                         <PencilLine size={20} />
//                                     </button>
//                                     <button onClick={() => handleDelete(index)}>
//                                         <Trash size={20} />
//                                     </button>
//                                 </div>
//                             </div>
//                             <p><strong>Description:</strong> <span dangerouslySetInnerHTML={{ __html: pkg.description }} /></p>
//                             <p><strong>Users:</strong> {pkg.maxUsers}</p>
//                             <p><strong>Duration:</strong> {pkg.durationType} ({pkg.durationValue} days)</p>
//                             <p><strong>Price:</strong> {pkg.symbol}{pkg.price} {pkg.currency}</p>
//                             <p><strong>Status:</strong> {pkg.isActive ? "Active ✅" : "Inactive ❌"}</p>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProviderPackage;

import React, { useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { TbPackages } from "react-icons/tb";
import { PencilLine, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPackages, deletePackage } from "../../../../redux/actions/package";
import { CircularProgress } from "@mui/material";

const ProviderPackage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { packages, loading } = useSelector((state) => state.package);

    useEffect(() => {
        dispatch(getPackages());
    }, [dispatch]);

    const handleCreateClick = () => {
        navigate("/provider/settings/master/package/create-package");
    };

    const handleDelete = (id) => {
        dispatch(deletePackage(id));
    };

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card rounded-md border bg-white p-6 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-semibold text-[#053054]">Package Details</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-4 py-2 text-white"
                            onClick={handleCreateClick}
                        >
                            <TbPackages size={20} />
                            Add Package
                        </Button>
                    </div>

                    {/* Packages */}
                    {packages.length === 0 ? (
                        <div className="mt-4 text-center text-gray-500">No packages added.</div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="transform rounded-xl bg-gradient-to-br from-[#053054] via-[#0d3f62] to-[#1a5a85] p-5 text-white shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl"
                                >
                                    {/* Header Row */}
                                    <div className="mb-3 flex items-start justify-between">
                                        <h2 className="text-lg font-bold">{pkg.packageName}</h2>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/provider/settings/master/package/edit-package/${pkg.id}`)}
                                                className="hover:text-yellow-300"
                                            >
                                                <PencilLine size={20} />
                                            </button>
                                            {/* <button
                                                onClick={() => handleDelete(pkg.id)}
                                                className="hover:text-red-300"
                                            >
                                                <Trash size={20} />
                                            </button> */}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="mb-2">
                                        <strong>Description:</strong>{" "}
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: pkg.description,
                                            }}
                                        ></span>
                                    </p>

                                    <p>
                                        <strong>Users:</strong> {pkg.maxUsers}
                                    </p>
                                    <p>
                                        <strong>Duration:</strong> {pkg.durationType} ({pkg.durationValue} days)
                                    </p>
                                    <p>
                                        <strong>Price:</strong> {pkg.symbol}
                                        {pkg.price} {pkg.currency}
                                    </p>
                                    <p className="mt-3">
                                        {pkg.modules && pkg.modules.length > 0 && (
                                            <>
                                                <strong className="text-sm">Modules Included:</strong>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {pkg.modules.map((m) => (
                                                        <span
                                                            key={m.id}
                                                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#053054] shadow"
                                                        >
                                                            {m.module}
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </p>
                                    <p className="mt-3">
                                        <strong>Status:</strong>{" "}
                                        {pkg.isActive ? (
                                            <span className="text-green-300">Active ✅</span>
                                        ) : (
                                            <span className="text-red-300">Inactive ❌</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ProviderPackage;
