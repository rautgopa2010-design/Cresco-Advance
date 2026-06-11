// import React, { useEffect, useState } from "react";
// import { Trash, PencilLine } from "lucide-react";

// const FollowupModalTable = ({ leadNo }) => {
//     const [followupModals, setFollowupModals] = useState([]);

//     useEffect(() => {
//         if (!leadNo) return;

//         const storedFollowupModals = JSON.parse(localStorage.getItem(`followupModal_${leadNo}`)) || [];
//         setFollowupModals(storedFollowupModals);
//     }, [leadNo]);

//     const handleDelete = (indexToDelete) => {
//         const updatedFollowupModals = followupModals.filter((_, index) => index !== indexToDelete);
//         setFollowupModals(updatedFollowupModals);
//         localStorage.setItem(`followupModal_${leadNo}`, JSON.stringify(updatedFollowupModals));
//     };

//     return (
//         <div className="card-body mt-5 p-0">
//             <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                 <table className="table">
//                     <thead className="table-header text-nowrap bg-[#053054] text-white">
//                         <tr className="table-row">
//                             <th className="table-head border border-gray-300 capitalize">Followup No.</th>
//                             <th className="table-head border border-gray-300 capitalize">Followup Id</th>
//                             <th className="table-head border border-gray-300 capitalize">Follow up Date</th>
//                             <th className="table-head border border-gray-300 capitalize">Stages</th>
//                             <th className="table-head border border-gray-300 capitalize">Description</th>
//                             <th className="table-head border border-gray-300 capitalize">Status</th>
//                             <th className="table-head border border-gray-300 capitalize">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="table-body text-[#433C50]">
//                         {followupModals.length === 0 ? (
//                             <tr>
//                                 <td
//                                     colSpan="7"
//                                     className="py-4 text-center"
//                                 >
//                                     No Next Follow-Up Data Found
//                                 </td>
//                             </tr>
//                         ) : (
//                             followupModals.map((item, index) => (
//                                 <tr
//                                     key={index}
//                                     className="table-row hover:bg-gray-100"
//                                 >
//                                     <td className="table-cell border border-gray-300">{index + 1}</td>
//                                     <td className="table-cell border border-gray-300">{item.nextFollowUpDate}</td>
//                                     <td className="table-cell border border-gray-300">{item.leadStage}</td>
//                                     <td className="table-cell border border-gray-300">{item.description}</td>
//                                     <td className="table-cell border border-gray-300">{item.leadStatus}</td>
//                                     <td className="table-cell border border-gray-300">
//                                         <div className="flex items-center gap-x-4">
//                                             <button className="text-blue-500">
//                                                 <PencilLine size={20} />
//                                             </button>
//                                             <button
//                                                 className="text-red-500"
//                                                 onClick={() => handleDelete(index)}
//                                             >
//                                                 <Trash size={20} />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default FollowupModalTable;

import React, { useEffect, useState } from "react";
import { Trash, PencilLine, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getFollowupsByLead } from "../../redux/actions/leadAndFollowup";
import { CircularProgress, Modal, Box, Typography, IconButton, useMediaQuery } from "@mui/material";
import { Button } from "@material-tailwind/react";

const FollowupModalTable = ({ leadNo, onDeleteFollowup, onEditFollowup }) => {
    const dispatch = useDispatch();
    const { followups, followupLoading } = useSelector((state) => state.leadAndFollowup);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedFollowupId, setSelectedFollowupId] = useState(null);

    useEffect(() => {
        if (leadNo) dispatch(getFollowupsByLead(leadNo));
    }, [leadNo, dispatch]);

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
        setSelectedFollowupId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (onDeleteFollowup) onDeleteFollowup(selectedFollowupId);
        setDeleteConfirmOpen(false);
        setSelectedFollowupId(null);
    };

    return (
        <div className="card-body mt-5 p-0">
            <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                <table className="table">
                    <thead className="table-header text-nowrap bg-[#053054] text-white">
                        <tr className="table-row">
                            <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                            <th className="table-head border border-gray-300 capitalize">Followup Date</th>
                            <th className="table-head border border-gray-300 capitalize">Stages</th>
                            <th className="table-head border border-gray-300 capitalize">Description</th>
                            <th className="table-head border border-gray-300 capitalize">Communicated With</th>
                            <th className="table-head border border-gray-300 capitalize">Additional Products</th>
                            <th className="table-head border border-gray-300 capitalize">Assigned To</th>
                            <th className="table-head border border-gray-300 capitalize">Status</th>
                            <th className="table-head border border-gray-300 capitalize">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="table-body text-[#433C50]">
                        {followupLoading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="py-6 text-center"
                                >
                                    <CircularProgress
                                        size={28}
                                        thickness={5}
                                    />
                                </td>
                            </tr>
                        ) : followups.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="py-4 text-center"
                                >
                                    No Next Follow-Up Data Found
                                </td>
                            </tr>
                        ) : (
                            followups
                                .slice()
                                .reverse()
                                .map((item, index) => (
                                    <tr
                                        key={item.id || index}
                                        className="table-row hover:bg-gray-100"
                                    >
                                        <td className="table-cell border border-gray-300">{index + 1}</td>
                                        <td className="table-cell border border-gray-300">{item.nextFollowUpDate || item.followup_date || "-"}</td>
                                        <td className="table-cell border border-gray-300">{item.leadStage || "-"}</td>
                                        <td className="table-cell border border-gray-300">
                                            <div className="w-[300px] whitespace-normal break-words text-justify">{item.followup_desc || "-"}</div>
                                        </td>
                                        <td className="table-cell border border-gray-300">{item.communicatedWith || "-"}</td>
                                        <td className="table-cell border border-gray-300">{item.additionalProducts || "-"}</td>
                                        <td className="table-cell border border-gray-300">
                                            {Array.isArray(item.assignedTo)
                                                ? item.assignedTo.map((val, idx) => (
                                                      <div key={idx}>
                                                          {idx + 1}) {val}
                                                      </div>
                                                  ))
                                                : item.assignedTo || "-"}
                                        </td>
                                        <td className="table-cell border border-gray-300">{item.leadStatus || "-"}</td>
                                        <td className="table-cell border border-gray-300">
                                            <div className="flex items-center gap-x-4">
                                                <button
                                                    className="text-blue-500"
                                                    onClick={() => {
                                                        if (onEditFollowup) onEditFollowup(item);
                                                    }}
                                                >
                                                    <PencilLine size={20} />
                                                </button>

                                                <button
                                                    className="text-red-500"
                                                    onClick={() => handleDeleteClick(item.id)}
                                                >
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this follow-up?</Typography>

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
        </div>
    );
};

export default FollowupModalTable;
