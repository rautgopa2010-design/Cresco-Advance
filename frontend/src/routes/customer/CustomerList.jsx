// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import { CircularProgress } from "@mui/material";
// import { Button } from "@material-tailwind/react";
// import { getOrders } from "../../redux/actions/order";

// const CustomerList = () => {
//     const { companyName } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { orders, loading } = useSelector((state) => state.order);

//     // 🟢 Fetch orders again if store is empty
//     useEffect(() => {
//         if (!orders || orders.length === 0) {
//             dispatch(getOrders());
//         }
//     }, [dispatch, orders]);

//     const completedOrders = orders.filter((order) => order.status === "Completed" && order.selectedCompany === companyName);

//     if (loading) {
//         return (
//             <div className="flex h-screen w-full items-center justify-center">
//                 <CircularProgress />
//             </div>
//         );
//     }

//     return (
//         <div className="card">
//             <div className="mb-5 flex items-center justify-between">
//                 <h1 className="text-xs font-bold text-[#053054] md:text-xl lg:text-2xl">Completed Orders for {companyName}</h1>
//                 <Button
//                     onClick={() => navigate(-1)}
//                     variant="gradient"
//                     className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
//                 >
//                     Back
//                 </Button>
//             </div>
//             <div className="card-body p-0">
//                 <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                     <table className="table">
//                         <thead className="table-header text-nowrap bg-[#053054] text-white">
//                             <tr className="table-row">
//                                 <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
//                                 <th className="table-head border border-gray-300 capitalize">Date</th>
//                                 <th className="table-head border border-gray-300 capitalize">Customer Name</th>
//                                 <th className="table-head border border-gray-300 capitalize">Mobile No</th>
//                                 <th className="table-head border border-gray-300 capitalize">Email Id</th>
//                                 <th className="table-head border border-gray-300 capitalize">Products</th>
//                                 <th className="table-head border border-gray-300 capitalize">Quantity</th>
//                                 <th className="table-head border border-gray-300 capitalize">Total</th>
//                                 <th className="table-head border border-gray-300 capitalize">Final Amount</th>
//                             </tr>
//                         </thead>
//                         <tbody className="table-body text-[#433C50]">
//                             {completedOrders.length === 0 ? (
//                                 <tr>
//                                     <td
//                                         colSpan="9"
//                                         className="py-4 text-center text-gray-400"
//                                     >
//                                         No completed orders found for this company.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 completedOrders.map((order, index) => {
//                                     return (
//                                         <tr
//                                             key={order.id}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{order.date}</td>
//                                             <td className="table-cell border border-gray-300">{order.customerPerson}</td>
//                                             <td className="table-cell border border-gray-300">{order.mobile}</td>
//                                             <td className="table-cell border border-gray-300">{order.email}</td>
//                                             {(() => {
//                                                 const intrastateList = order.productOrderDetails?.intrastate || [];
//                                                 const interstateList = order.productOrderDetails?.interstate || [];
//                                                 const allProducts = [...intrastateList, ...interstateList];

//                                                 return (
//                                                     <>
//                                                         <td className="table-cell border border-gray-300">
//                                                             {allProducts.length > 0
//                                                                 ? allProducts.map((p, i) => (
//                                                                       <div key={i}>
//                                                                           {i + 1}) {p.product}
//                                                                       </div>
//                                                                   ))
//                                                                 : "-"}
//                                                         </td>

//                                                         <td className="table-cell border border-gray-300">
//                                                             {allProducts.length > 0
//                                                                 ? allProducts.map((p, i) => (
//                                                                       <div key={i}>
//                                                                           {i + 1}) {p.quantity}
//                                                                       </div>
//                                                                   ))
//                                                                 : "-"}
//                                                         </td>

//                                                         <td className="table-cell border border-gray-300">
//                                                             {allProducts.length > 0
//                                                                 ? allProducts.map((p, i) => (
//                                                                       <div key={i}>
//                                                                           {i + 1}) {p.total}
//                                                                       </div>
//                                                                   ))
//                                                                 : "-"}
//                                                         </td>
//                                                     </>
//                                                 );
//                                             })()}
//                                             <td className="table-cell border border-gray-300">{order.finalAmt}</td>
//                                         </tr>
//                                     );
//                                 })
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CustomerList;

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { getOrders } from "../../redux/actions/order";

const CustomerList = () => {
    const { companyName } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.order);

    // 🟢 Fetch orders again if store is empty
    useEffect(() => {
        if (!orders || orders.length === 0) {
            dispatch(getOrders());
        }
    }, [dispatch, orders]);

    const decodedCompanyName = decodeURIComponent(companyName);

    const completedOrders = orders.filter((order) => {
        if (order.status !== "Completed") return false;

        const company = order.selectedCompany?.trim();
        if (company) {
            return company === decodedCompanyName;
        }
        // No company → match by customer name
        return order.customerPerson?.trim() === decodedCompanyName;
    });

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="card">
            <div className="mb-5 flex items-center justify-between">
                <h1 className="text-xs font-bold text-[#053054] md:text-xl lg:text-2xl">Completed Orders for {decodedCompanyName}</h1>
                <Button
                    onClick={() => navigate(-1)}
                    variant="gradient"
                    className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                >
                    Back
                </Button>
            </div>
            <div className="card-body p-0">
                <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                    <table className="table">
                        <thead className="table-header text-nowrap bg-[#053054] text-white">
                            <tr className="table-row">
                                <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                <th className="table-head border border-gray-300 capitalize">Date</th>
                                <th className="table-head border border-gray-300 capitalize">Customer Name</th>
                                <th className="table-head border border-gray-300 capitalize">Mobile No</th>
                                <th className="table-head border border-gray-300 capitalize">Email Id</th>
                                <th className="table-head border border-gray-300 capitalize">Products</th>
                                <th className="table-head border border-gray-300 capitalize">Quantity</th>
                                <th className="table-head border border-gray-300 capitalize">Total</th>
                                <th className="table-head border border-gray-300 capitalize">Final Amount</th>
                            </tr>
                        </thead>
                        <tbody className="table-body text-[#433C50]">
                            {completedOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="py-4 text-center text-gray-400"
                                    >
                                        No completed orders found for this company.
                                    </td>
                                </tr>
                            ) : (
                                completedOrders.map((order, index) => {
                                    return (
                                        <tr
                                            key={order.id}
                                            className="table-row"
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{order.date}</td>
                                            <td className="table-cell border border-gray-300">{order.customerPerson}</td>
                                            <td className="table-cell border border-gray-300">{order.mobile}</td>
                                            <td className="table-cell border border-gray-300">{order.email}</td>
                                            {(() => {
                                                const intrastateList = order.productOrderDetails?.intrastate || [];
                                                const interstateList = order.productOrderDetails?.interstate || [];
                                                const allProducts = [...intrastateList, ...interstateList];

                                                return (
                                                    <>
                                                        <td className="table-cell border border-gray-300">
                                                            {allProducts.length > 0
                                                                ? allProducts.map((p, i) => (
                                                                      <div key={i}>
                                                                          {i + 1}) {p.product}
                                                                      </div>
                                                                  ))
                                                                : "-"}
                                                        </td>

                                                        <td className="table-cell border border-gray-300">
                                                            {allProducts.length > 0
                                                                ? allProducts.map((p, i) => (
                                                                      <div key={i}>
                                                                          {i + 1}) {p.quantity}
                                                                      </div>
                                                                  ))
                                                                : "-"}
                                                        </td>

                                                        <td className="table-cell border border-gray-300">
                                                            {allProducts.length > 0
                                                                ? allProducts.map((p, i) => (
                                                                      <div key={i}>
                                                                          {i + 1}) {p.total}
                                                                      </div>
                                                                  ))
                                                                : "-"}
                                                        </td>
                                                    </>
                                                );
                                            })()}
                                            <td className="table-cell border border-gray-300">{order.finalAmt}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
