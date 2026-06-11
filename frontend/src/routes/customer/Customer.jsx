// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getOrders } from "../../redux/actions/order";
// import { clearSnackbar } from "../../redux/actions/commonActions";
// import { useNavigate } from "react-router-dom";
// import { Alert, CircularProgress, Snackbar } from "@mui/material";

// const Customer = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { snackbarMessage, orders, loading } = useSelector((state) => state.order);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);

//     useEffect(() => {
//         dispatch(getOrders());
//         dispatch(clearSnackbar());
//     }, [dispatch]);

//     useEffect(() => {
//         if (snackbarMessage) setSnackbarOpen(true);
//     }, [snackbarMessage]);

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//         setTimeout(() => dispatch(clearSnackbar()), 100);
//     };

//     if (loading) {
//         return (
//             <div className="flex h-screen w-full items-center justify-center">
//                 <CircularProgress />
//             </div>
//         );
//     }

//     // Filter completed orders
//     const completedOrders = orders.filter((order) => order.status === "Completed");

//     // Group orders by company
//     const groupedCompanies = completedOrders.reduce((acc, order) => {
//         if (!acc[order.selectedCompany]) acc[order.selectedCompany] = [];
//         acc[order.selectedCompany].push(order);
//         return acc;
//     }, {});

//     return (
//         <div className="card">
//             <h1 className="text-base md:text-xl lg:text-2xl font-bold text-[#053054] mb-6">
//                 Customers List whose Orders are Completed
//             </h1>

//             {Object.keys(groupedCompanies).length === 0 ? (
//                 <div className="text-gray-500 text-center mt-10">
//                     No Completed Orders yet.
//                 </div>
//             ) : (
//                 <div className="grid gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
//                     {Object.entries(groupedCompanies).map(([company, companyOrders]) => (
//                         <div
//                             key={company}
//                             onClick={() => navigate(`/customer/${encodeURIComponent(company)}`)}
//                             className="relative cursor-pointer bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.03] p-5 overflow-hidden group"
//                         >
//                             {/* Decorative gradient overlay */}
//                             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

//                             <div className="relative z-10">
//                                 <div className="flex justify-between items-center mb-3">
//                                     <h2 className="text-lg md:text-xl font-semibold text-[#053054] group-hover:text-blue-700 transition-colors duration-300">
//                                         {company}
//                                     </h2>
//                                     <span className="text-xs sm:text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium shadow-sm">
//                                         {companyOrders.length} Completed
//                                     </span>
//                                 </div>

//                                 <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
//                                     View all completed orders from{" "}
//                                     <span className="font-medium text-[#053054] group-hover:text-blue-600 transition-colors duration-300">
//                                         {company}
//                                     </span>.
//                                 </p>

//                                 {/* Decorative underline animation */}
//                                 <div className="mt-3 h-[2px] w-0 bg-blue-600 rounded-full group-hover:w-full transition-all duration-500"></div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={2500}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     onClose={handleSnackbarClose}
//                     severity={snackbarMessage?.includes("successfully") ? "success" : "error"}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </div>
//     );
// };

// export default Customer;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../redux/actions/order";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { useNavigate } from "react-router-dom";
import { Alert, CircularProgress, Snackbar } from "@mui/material";

const Customer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { snackbarMessage, orders, loading } = useSelector((state) => state.order);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(getOrders());
        dispatch(clearSnackbar());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) setSnackbarOpen(true);
    }, [snackbarMessage]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => dispatch(clearSnackbar()), 100);
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    // Filter completed orders
    const completedOrders = orders.filter((order) => order.status === "Completed");

    // Determine the group key: company if available, otherwise customer name
    const getGroupKey = (order) => {
        const company = order.selectedCompany?.trim();
        return company || order.customerPerson?.trim() || "Unknown Customer";
    };

    // Group orders by company OR customer name
    const groupedOrders = completedOrders.reduce((acc, order) => {
        const key = getGroupKey(order);
        if (!acc[key]) acc[key] = [];
        acc[key].push(order);
        return acc;
    }, {});

    // Determine display name and type for each group
    const groupInfo = Object.entries(groupedOrders).map(([key, orders]) => {
        const sampleOrder = orders[0];
        const hasCompany = sampleOrder.selectedCompany?.trim();
        const displayName = hasCompany ? key : key; // key is already customer name if no company
        const isCompany = !!hasCompany;

        return { key, displayName, orders, isCompany };
    });

    return (
        <div className="card">
            <h1 className="mb-6 text-base font-bold text-[#053054] md:text-xl lg:text-2xl">Customers List whose Orders are Completed</h1>

            {groupInfo.length === 0 ? (
                <div className="mt-10 text-center text-gray-500">No Completed Orders yet.</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
                    {groupInfo.map(({ key, displayName, orders, isCompany }) => (
                        <div
                            key={key}
                            onClick={() => navigate(`/customer/${encodeURIComponent(key)}`)}
                            className="group relative transform cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-blue-50 to-blue-100 p-5 shadow-md transition-all duration-500 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl"
                        >
                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                            <div className="relative z-10">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-[#053054] transition-colors duration-300 group-hover:text-blue-700 md:text-xl">
                                        {displayName}
                                    </h2>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 shadow-sm sm:text-sm">
                                        {orders.length} Completed
                                    </span>
                                </div>

                                <p className="text-sm leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
                                    View all completed orders from{" "}
                                    <span className="font-medium text-[#053054] transition-colors duration-300 group-hover:text-blue-600">
                                        {isCompany ? displayName : `${displayName}`}
                                    </span>
                                    .
                                </p>

                                <div className="mt-3 h-[2px] w-0 rounded-full bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarMessage?.includes("successfully") ? "success" : "error"}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Customer;
