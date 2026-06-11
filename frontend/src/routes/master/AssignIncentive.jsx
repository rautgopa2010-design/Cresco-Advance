// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, X } from "lucide-react";
// import { CgAssign } from "react-icons/cg";
// import {
//     Modal,
//     Box,
//     Typography,
//     IconButton,
//     TextField,
//     Snackbar,
//     Alert,
//     useMediaQuery,
//     CircularProgress,
//     MenuItem,
//     Autocomplete,
// } from "@mui/material";
// import {
//     getAssignedIncentives,
//     createAssignedIncentive,
//     updateAssignedIncentive,
//     deleteAssignedIncentive,
// } from "../../redux/actions/assignedIncentives";
// import { getCompanySetup } from "../../redux/actions/companySetup";
// import { getProduct } from "../../redux/actions/product";
// import { getRoles } from "../../redux/actions/rbac";
// import { getEmployees } from "../../redux/actions/employee";
// import { clearSnackbar } from "../../redux/actions/commonActions";

// const AssignIncentive = () => {
//     const dispatch = useDispatch();
//     const [open, setOpen] = useState(false);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const { companySetup } = useSelector((state) => state.companySetup);
//     const { product: productList } = useSelector((state) => state.product);
//     const [selectedProduct, setSelectedProduct] = useState("");

//     const allProducts = productList.flatMap((p) =>
//         (p.product || []).map((prodName) => ({
//             id: p.id,
//             brand: p.brand,
//             category: p.category,
//             subCategory: p.productSubCategoryName,
//             name: prodName,
//         })),
//     );

//     const { roles } = useSelector((state) => state.rbac);
//     const { employees: employees } = useSelector((state) => state.employee);
//     const [selectedEmployee, setSelectedEmployee] = useState("");

//     const formatEmployeeName = (emp) => {
//         const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
//         const fullName = parts.filter((part) => part && part.trim()).join(" ");

//         const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
//         return `${fullName} (${roleName})`;
//     };

//     const formatEmployeeNameForTable = (emp) => {
//         if (!emp) return "Unknown Employee"; // fallback
//         const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
//         const fullName = parts.filter((part) => part && part.trim()).join(" ");
//         return fullName || "Unnamed Employee";
//     };

//     const superAdminRoleId = roles.find((r) => r.name === "Super Admin")?.id;
//     const filteredEmployees = employees.filter((emp) => emp.role_id !== superAdminRoleId);

//     // Form states
//     const [formulaType, setFormulaType] = useState("");
//     const [date, setDate] = useState();

//     const [month, setMonth] = useState();
//     const [targetedAmount, setTargetedAmount] = useState();
//     const [elligibleAmount, setElligibleAmount] = useState();
//     const [error, setError] = useState(false);

//     const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
//     const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
//     const [editId, setEditId] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//     const [selectedDeleteId, setSelectedDeleteId] = useState(null);

//     const loading = useSelector((state) => state.assignedIncentives.loading);
//     const { snackbarMessage, snackbarSeverity, assignedIncentives } = useSelector((state) => state.assignedIncentives);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);

//     // Helper: format yyyy-mm-dd for input
//     const formatDateForInput = (date) => {
//         const d = new Date(date);
//         const year = d.getFullYear();
//         const month = String(d.getMonth() + 1).padStart(2, "0");
//         const day = String(d.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };

//     // Helper: convert yyyy-mm-dd -> dd-mm-yyyy
//     const formatDateForBackend = (dateStr) => {
//         if (!dateStr) return "";
//         const [year, month, day] = dateStr.split("-");
//         return `${day}-${month}-${year}`;
//     };

//     useEffect(() => {
//         dispatch(clearSnackbar());
//         dispatch(getCompanySetup());
//         dispatch(getProduct());
//         dispatch(getRoles());
//         dispatch(getEmployees());
//         dispatch(getAssignedIncentives());
//     }, [dispatch]);

//     const modalStyle = {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: isMobile ? 330 : 600,
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         borderRadius: "12px",
//         p: 3,
//     };

//     const handleOpen = () => {
//         setOpen(true);
//         setError(false);
//         const today = formatDateForInput(new Date());
//         setDate(today);
//     };

//     const resetForm = () => {
//         setFormulaType("");
//         setDate(formatDateForInput(new Date()));
//         setSelectedProduct("");
//         setSelectedEmployee("");
//         setMonth("");
//         setTargetedAmount("");
//         setElligibleAmount("");
//         setError(false);
//         setEditId(null);
//         setIsEditMode(false);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setError(false);
//         setIsEditMode(false);
//         setEditId(null);
//         resetForm();
//         setLocalSnackbarMessage("");
//     };

//     const handleEdit = (assigned) => {
//         // Prefill formula
//         setFormulaType(assigned.formula_id || "");

//         // Prefill date (dd-mm-yyyy -> yyyy-mm-dd)
//         if (assigned.date) {
//             const [d, m, y] = assigned.date.split("-");
//             setDate(`${y}-${m}-${d}`);
//         }

//         // Prefill product
//         if (assigned.product) {
//             setSelectedProduct({
//                 id: assigned.product_id,
//                 name: assigned.selectedProductName,
//                 brand: assigned.product.brand,
//                 category: assigned.product.category,
//                 subCategory: assigned.product.productSubCategoryName,
//             });
//         }

//         // Prefill employee
//         if (assigned.employee) setSelectedEmployee(assigned.employee.id);

//         // Prefill month
//         setMonth(assigned.month || "");

//         // Prefill targeted and eligible amounts
//         setTargetedAmount(assigned.targeted_amount || "");
//         setElligibleAmount(assigned.eligible_amount || "");

//         // Edit mode
//         setEditId(assigned.id);
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleUpdate = () => {
//         if (!formulaType || !date || !selectedProduct || !selectedEmployee || !month || !targetedAmount || !elligibleAmount) {
//             setError(true);
//             setLocalSnackbarMessage("All fields are required");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const payload = {
//             formulaId: formulaType, // ✅ backend wants formulaId
//             date: formatDateForBackend(date), // ✅ dd-mm-yyyy
//             product: {
//                 id: selectedProduct.id, // ✅ full object (id + name)
//                 name: selectedProduct.name,
//             },
//             employeeId: selectedEmployee, // ✅ employee id
//             month,
//             targeted_amount: targetedAmount,
//             eligible_amount: elligibleAmount,
//         };

//         // dispatch(updateAssignedIncentive(editId, payload));
//         dispatch(updateAssignedIncentive(editId, payload)).then(() => {
//             dispatch(getAssignedIncentives()); // ✅ refresh table
//         });
//         handleClose();
//     };

//     const handleAdd = () => {
//         if (!formulaType || !date || !selectedProduct || !selectedEmployee || !month || !targetedAmount || !elligibleAmount) {
//             setError(true);
//             setLocalSnackbarMessage("All fields are required");
//             setLocalSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const payload = {
//             formulaId: formulaType,
//             date: formatDateForBackend(date),
//             product: {
//                 id: selectedProduct.id,
//                 name: selectedProduct.name,
//             },
//             employeeId: selectedEmployee,
//             month,
//             targetedAmount,
//             elligibleAmount,
//         };

//         dispatch(createAssignedIncentive(payload));
//         handleClose();
//     };

//     const handleDeleteClick = (id) => {
//         setSelectedDeleteId(id);
//         setDeleteConfirmOpen(true);
//     };

//     const confirmDelete = () => {
//         dispatch(deleteAssignedIncentive(selectedDeleteId));
//         setDeleteConfirmOpen(false);
//         setSelectedDeleteId(null);
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//         setTimeout(() => {
//             setLocalSnackbarMessage("");
//             dispatch(clearSnackbar());
//         }, 100);
//     };

//     useEffect(() => {
//         if (snackbarMessage) {
//             setLocalSnackbarMessage("");
//             setSnackbarOpen(true);
//         }
//     }, [snackbarMessage]);

//     return (
//         <>
//             {loading ? (
//                 <div className="flex h-screen w-full items-center justify-center">
//                     <CircularProgress />
//                 </div>
//             ) : (
//                 <div className="card">
//                     <div className="flex items-center justify-between text-nowrap">
//                         <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Incentive Assignment :</div>
//                         <Button
//                             variant="gradient"
//                             className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
//                             onClick={handleOpen}
//                         >
//                             <CgAssign size={20} />
//                             Assign
//                         </Button>
//                     </div>

//                     <div className="card-body p-0">
//                         <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                             <table className="table">
//                                 <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                     <tr className="table-row">
//                                         <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
//                                         <th className="table-head border border-gray-300 capitalize">Employee Name</th>
//                                         <th className="table-head border border-gray-300 capitalize">Product</th>
//                                         <th className="table-head border border-gray-300 capitalize">Month</th>
//                                         <th className="table-head border border-gray-300 capitalize">Assigned Date</th>
//                                         <th className="table-head border border-gray-300 capitalize">Targeted Amount</th>
//                                         <th className="table-head border border-gray-300 capitalize">Eligible Amount</th>
//                                         <th className="table-head border border-gray-300 capitalize">Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="table-body text-[#433C50]">
//                                     {assignedIncentives.map((item, index) => (
//                                         <tr
//                                             className="table-row"
//                                             key={item.id}
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {item.employee ? formatEmployeeNameForTable(item.employee) : "Unknown Employee"}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{item.selectedProductName}</td>
//                                             <td className="table-cell border border-gray-300">{item.month}</td>
//                                             <td className="table-cell border border-gray-300">{item.date}</td>
//                                             <td className="table-cell border border-gray-300">{item.targeted_amount}</td>
//                                             <td className="table-cell border border-gray-300">{item.eligible_amount}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         className="text-blue-500"
//                                                         onClick={() => handleEdit(item)}
//                                                     >
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDeleteClick(item.id)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                     {assignedIncentives.length === 0 && (
//                                         <tr>
//                                             <td
//                                                 colSpan="8"
//                                                 className="py-4 text-center text-gray-400"
//                                             >
//                                                 No Incentives Assigned Yet.
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal */}
//             <Modal
//                 open={open}
//                 onClose={handleClose}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             {isEditMode ? "Update Incentive To Employee" : "Add Incentive To Employee"}
//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>
//                     <div className="mb-4 flex flex-col items-center gap-4 md:flex-row">
//                         <TextField
//                             select
//                             fullWidth
//                             label="Formula Type*"
//                             placeholder="Choose Formula Type"
//                             value={formulaType}
//                             onChange={(e) => setFormulaType(e.target.value)}
//                             error={error && !formulaType}
//                             size="small"
//                         >
//                             <MenuItem
//                                 value=""
//                                 disabled
//                             >
//                                 Choose Formula Type
//                             </MenuItem>
//                             {companySetup?.formulas
//                                 ?.filter((formula) => !formula.formula_type?.toLowerCase().includes("partition"))
//                                 .map((formula, index) => (
//                                     <MenuItem
//                                         key={index}
//                                         value={formula.id}
//                                     >
//                                         {formula.formula_type}
//                                     </MenuItem>
//                                 ))}
//                         </TextField>
//                         <TextField
//                             fullWidth
//                             type="date"
//                             label="Date*"
//                             variant="outlined"
//                             value={date}
//                             onChange={(e) => setDate(e.target.value)}
//                             size="small"
//                             InputLabelProps={{ shrink: true }}
//                         />
//                     </div>
//                     <div className="mb-4">
//                         <Autocomplete
//                             options={allProducts}
//                             getOptionLabel={(option) => option.name}
//                             value={selectedProduct || null}
//                             onChange={(_, newValue) => {
//                                 setSelectedProduct(newValue || "");
//                                 setError(false);
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Product *"
//                                     size="small"
//                                     error={error && !selectedProduct}
//                                 />
//                             )}
//                         />
//                     </div>
//                     <div className="mb-4 flex flex-col items-center gap-4 md:flex-row">
//                         <Autocomplete
//                             // options={employees}
//                             options={filteredEmployees}
//                             getOptionLabel={(option) => formatEmployeeName(option)}
//                             // value={employees.find((emp) => emp.id === selectedEmployee) || null}
//                             value={filteredEmployees.find((emp) => emp.id === selectedEmployee) || null}
//                             onChange={(_, newValue) => {
//                                 setSelectedEmployee(newValue?.id || "");
//                                 setError(false);
//                             }}
//                             renderInput={(params) => (
//                                 <TextField
//                                     {...params}
//                                     label="Employee *"
//                                     size="small"
//                                     error={error && !selectedEmployee}
//                                 />
//                             )}
//                             sx={{ flex: 8 }}
//                         />

//                         <TextField
//                             select
//                             fullWidth
//                             label="Month *"
//                             value={month || ""}
//                             onChange={(e) => setMonth(e.target.value)}
//                             error={error && !month}
//                             size="small"
//                             sx={{ flex: 4 }}
//                         >
//                             <MenuItem
//                                 value=""
//                                 disabled
//                             >
//                                 Choose Month
//                             </MenuItem>
//                             {[
//                                 "January",
//                                 "February",
//                                 "March",
//                                 "April",
//                                 "May",
//                                 "June",
//                                 "July",
//                                 "August",
//                                 "September",
//                                 "October",
//                                 "November",
//                                 "December",
//                             ].map((m, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={m}
//                                 >
//                                     {m}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </div>
//                     <div className="flex flex-col items-center gap-4 md:flex-row">
//                         <TextField
//                             fullWidth
//                             type="number"
//                             label="Targeted Amount*"
//                             placeholder="Enter Targeted Amount"
//                             variant="outlined"
//                             error={error && !targetedAmount}
//                             value={targetedAmount}
//                             onChange={(e) => {
//                                 setTargetedAmount(e.target.value);
//                                 setError(false);
//                             }}
//                             onWheel={(e) => e.target.blur()}
//                             inputProps={{
//                                 min: 0,
//                                 onKeyDown: (e) => {
//                                     if (e.key === "-" || e.key === "e") e.preventDefault();
//                                 },
//                             }}
//                             size="small"
//                         />
//                         <TextField
//                             fullWidth
//                             type="number"
//                             label="Elligible Amount*"
//                             placeholder="Enter Elligible Amount"
//                             variant="outlined"
//                             error={error && !elligibleAmount}
//                             value={elligibleAmount}
//                             onChange={(e) => {
//                                 setElligibleAmount(e.target.value);
//                                 setError(false);
//                             }}
//                             onWheel={(e) => e.target.blur()}
//                             inputProps={{
//                                 min: 0,
//                                 onKeyDown: (e) => {
//                                     if (e.key === "-" || e.key === "e") e.preventDefault();
//                                 },
//                             }}
//                             size="small"
//                         />
//                     </div>
//                     <div className="mt-4 flex justify-end gap-2">
//                         <Button
//                             variant="outlined"
//                             className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
//                             onClick={handleClose}
//                         >
//                             Close
//                         </Button>
//                         {isEditMode ? (
//                             <Button
//                                 className="rounded bg-green-900 px-4 py-2 capitalize text-white"
//                                 onClick={handleUpdate}
//                             >
//                                 Update
//                             </Button>
//                         ) : (
//                             <Button
//                                 className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
//                                 onClick={handleAdd}
//                             >
//                                 Add
//                             </Button>
//                         )}
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Delete Modal */}
//             <Modal
//                 open={deleteConfirmOpen}
//                 onClose={() => setDeleteConfirmOpen(false)}
//             >
//                 <Box sx={modalStyle}>
//                     <div className="mb-4 flex items-center justify-between">
//                         <Typography
//                             variant="h6"
//                             className="font-semibold"
//                         >
//                             Confirm Delete
//                         </Typography>
//                         <IconButton
//                             onClick={() => setDeleteConfirmOpen(false)}
//                             className="delay-300 duration-300 hover:scale-105 hover:text-red-500"
//                         >
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <Typography className="mb-6 justify-self-center text-[#433C50]">
//                         Are you sure, You want to delete this assigned incentive?
//                     </Typography>

//                     <div className="mt-4 flex justify-center gap-4">
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-red-700 px-4 py-2 capitalize text-white"
//                             onClick={confirmDelete}
//                         >
//                             Yes
//                         </Button>
//                         <Button
//                             variant="gradient"
//                             className="rounded bg-gray-500 px-4 py-2 capitalize text-white"
//                             onClick={() => setDeleteConfirmOpen(false)}
//                         >
//                             No
//                         </Button>
//                     </div>
//                 </Box>
//             </Modal>

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={1000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage || localSnackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default AssignIncentive;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, X } from "lucide-react";
import { CgAssign } from "react-icons/cg";
import {
    Modal,
    Box,
    Typography,
    IconButton,
    TextField,
    Snackbar,
    Alert,
    useMediaQuery,
    CircularProgress,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import {
    getAssignedIncentives,
    createAssignedIncentive,
    updateAssignedIncentive,
    deleteAssignedIncentive,
} from "../../redux/actions/assignedIncentives";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getProduct } from "../../redux/actions/product";
import { getRoles } from "../../redux/actions/rbac";
import { getEmployees } from "../../redux/actions/employee";
import { clearSnackbar } from "../../redux/actions/commonActions";

const AssignIncentive = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const { companySetup } = useSelector((state) => state.companySetup);
    const { product: productList } = useSelector((state) => state.product);
    const [selectedProduct, setSelectedProduct] = useState("");

    const allProducts = productList.flatMap((p) =>
        (p.product || []).map((prodName) => ({
            id: p.id,
            brand: p.brand,
            category: p.category,
            subCategory: p.productSubCategoryName,
            name: prodName,
        })),
    );

    const { roles } = useSelector((state) => state.rbac);
    const { employees: employees } = useSelector((state) => state.employee);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const formatEmployeeName = (emp) => {
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");

        const roleName = roles.find((r) => r.id === emp.role_id)?.name || "Unknown Role";
        return `${fullName} (${roleName})`;
    };

    const formatEmployeeNameForTable = (emp) => {
        if (!emp) return "Unknown Employee"; // fallback
        const parts = [emp.salutation, emp.firstName, emp.middleName, emp.lastName];
        const fullName = parts.filter((part) => part && part.trim()).join(" ");
        return fullName || "Unnamed Employee";
    };

    const superAdminRoleId = roles.find((r) => r.name === "Super Admin")?.id;
    const filteredEmployees = employees.filter((emp) => emp.role_id !== superAdminRoleId);

    // Form states
    const [formulaType, setFormulaType] = useState("");
    const [date, setDate] = useState();

    const [month, setMonth] = useState("");
    const [targetedAmount, setTargetedAmount] = useState();
    const [elligibleAmount, setElligibleAmount] = useState();
    const [error, setError] = useState(false);

    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const loading = useSelector((state) => state.assignedIncentives.loading);
    const { snackbarMessage, snackbarSeverity, assignedIncentives } = useSelector((state) => state.assignedIncentives);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Helper: format yyyy-mm-dd for input
    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Helper: convert yyyy-mm-dd -> dd-mm-yyyy
    const formatDateForBackend = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getCompanySetup());
        dispatch(getProduct());
        dispatch(getRoles());
        dispatch(getEmployees());
        dispatch(getAssignedIncentives());
    }, [dispatch]);

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 330 : 600,
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: "12px",
        p: 3,
    };

    const handleOpen = () => {
        setOpen(true);
        setError(false);
        const today = formatDateForInput(new Date());
        setDate(today);
    };

    const resetForm = () => {
        setFormulaType("");
        setDate(formatDateForInput(new Date()));
        setSelectedProduct("");
        setSelectedEmployee("");
        setMonth("");
        setTargetedAmount("");
        setElligibleAmount("");
        setError(false);
        setEditId(null);
        setIsEditMode(false);
    };

    const handleClose = () => {
        setOpen(false);
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        resetForm();
        setLocalSnackbarMessage("");
    };

    const handleEdit = (assigned) => {
        // Prefill formula
        setFormulaType(assigned.formula_id || "");

        // Prefill date (dd-mm-yyyy -> yyyy-mm-dd)
        if (assigned.date) {
            const [d, m, y] = assigned.date.split("-");
            setDate(`${y}-${m}-${d}`);
        }

        // Prefill product
        if (assigned.product) {
            setSelectedProduct({
                id: assigned.product_id,
                name: assigned.selectedProductName,
                brand: assigned.product.brand,
                category: assigned.product.category,
                subCategory: assigned.product.productSubCategoryName,
            });
        }

        // Prefill employee
        if (assigned.employee) setSelectedEmployee(assigned.employee.id);

        // Prefill month - handle "All Months"
        setMonth(assigned.month || "");

        // Prefill targeted and eligible amounts
        setTargetedAmount(assigned.targeted_amount || "");
        setElligibleAmount(assigned.eligible_amount || "");

        // Edit mode
        setEditId(assigned.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleUpdate = () => {
        if (!formulaType || !date || !selectedProduct || !selectedEmployee || !month || !targetedAmount || !elligibleAmount) {
            setError(true);
            setLocalSnackbarMessage("All fields are required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const payload = {
            formulaId: formulaType,
            date: formatDateForBackend(date),
            product: {
                id: selectedProduct.id,
                name: selectedProduct.name,
            },
            employeeId: selectedEmployee,
            month,
            targeted_amount: targetedAmount,
            eligible_amount: elligibleAmount,
        };

        dispatch(updateAssignedIncentive(editId, payload)).then(() => {
            dispatch(getAssignedIncentives());
        });
        handleClose();
    };

    const handleAdd = () => {
        if (!formulaType || !date || !selectedProduct || !selectedEmployee || !month || !targetedAmount || !elligibleAmount) {
            setError(true);
            setLocalSnackbarMessage("All fields are required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const payload = {
            formulaId: formulaType,
            date: formatDateForBackend(date),
            product: {
                id: selectedProduct.id,
                name: selectedProduct.name,
            },
            employeeId: selectedEmployee,
            month,
            targetedAmount,
            elligibleAmount,
        };

        dispatch(createAssignedIncentive(payload));
        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteAssignedIncentive(selectedDeleteId));
        setDeleteConfirmOpen(false);
        setSelectedDeleteId(null);
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    useEffect(() => {
        if (snackbarMessage) {
            setLocalSnackbarMessage("");
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const monthOptions = [
        "All Months",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Incentive Assignment :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <CgAssign size={20} />
                            Assign
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Employee Name</th>
                                        <th className="table-head border border-gray-300 capitalize">Product</th>
                                        <th className="table-head border border-gray-300 capitalize">Month</th>
                                        <th className="table-head border border-gray-300 capitalize">Assigned Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Targeted Amount</th>
                                        <th className="table-head border border-gray-300 capitalize">Eligible Amount</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {assignedIncentives.map((item, index) => (
                                        <tr
                                            className="table-row"
                                            key={item.id}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">
                                                {item.employee ? formatEmployeeNameForTable(item.employee) : "Unknown Employee"}
                                            </td>
                                            <td className="table-cell border border-gray-300">{item.selectedProductName}</td>
                                            <td className="table-cell border border-gray-300">{item.month}</td>
                                            <td className="table-cell border border-gray-300">{item.date}</td>
                                            <td className="table-cell border border-gray-300">{item.targeted_amount}</td>
                                            <td className="table-cell border border-gray-300">{item.eligible_amount}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(item)}
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
                                    ))}
                                    {assignedIncentives.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Incentives Assigned Yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={modalStyle}>
                    <div className="mb-4 flex items-center justify-between">
                        <Typography
                            variant="h6"
                            className="font-semibold"
                        >
                            {isEditMode ? "Update Incentive To Employee" : "Add Incentive To Employee"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>
                    <div className="mb-4 flex flex-col items-center gap-4 md:flex-row">
                        <TextField
                            select
                            fullWidth
                            label="Formula Type*"
                            placeholder="Choose Formula Type"
                            value={formulaType}
                            onChange={(e) => setFormulaType(e.target.value)}
                            error={error && !formulaType}
                            size="small"
                        >
                            <MenuItem
                                value=""
                                disabled
                            >
                                Choose Formula Type
                            </MenuItem>
                            {companySetup?.formulas
                                ?.filter((formula) => !formula.formula_type?.toLowerCase().includes("partition"))
                                .map((formula, index) => (
                                    <MenuItem
                                        key={index}
                                        value={formula.id}
                                    >
                                        {formula.formula_type}
                                    </MenuItem>
                                ))}
                        </TextField>
                        <TextField
                            fullWidth
                            type="date"
                            label="Date*"
                            variant="outlined"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                    <div className="mb-4">
                        <Autocomplete
                            options={allProducts}
                            getOptionLabel={(option) => option.name}
                            value={selectedProduct || null}
                            onChange={(_, newValue) => {
                                setSelectedProduct(newValue || "");
                                setError(false);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Product *"
                                    size="small"
                                    error={error && !selectedProduct}
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4 flex flex-col items-center gap-4 md:flex-row">
                        <Autocomplete
                            options={filteredEmployees}
                            getOptionLabel={(option) => formatEmployeeName(option)}
                            value={filteredEmployees.find((emp) => emp.id === selectedEmployee) || null}
                            onChange={(_, newValue) => {
                                setSelectedEmployee(newValue?.id || "");
                                setError(false);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Employee *"
                                    size="small"
                                    error={error && !selectedEmployee}
                                />
                            )}
                            sx={{ flex: 8 }}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Month *"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            error={error && !month}
                            size="small"
                            sx={{ flex: 4 }}
                        >
                            {monthOptions.map((m, index) => (
                                <MenuItem
                                    key={index}
                                    value={m}
                                >
                                    {m}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <TextField
                            fullWidth
                            type="number"
                            label="Targeted Amount*"
                            placeholder="Enter Targeted Amount"
                            variant="outlined"
                            error={error && !targetedAmount}
                            value={targetedAmount}
                            onChange={(e) => {
                                setTargetedAmount(e.target.value);
                                setError(false);
                            }}
                            onWheel={(e) => e.target.blur()}
                            inputProps={{
                                min: 0,
                                onKeyDown: (e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                },
                            }}
                            size="small"
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Eligible Amount*"
                            placeholder="Enter Eligible Amount"
                            variant="outlined"
                            error={error && !elligibleAmount}
                            value={elligibleAmount}
                            onChange={(e) => {
                                setElligibleAmount(e.target.value);
                                setError(false);
                            }}
                            onWheel={(e) => e.target.blur()}
                            inputProps={{
                                min: 0,
                                onKeyDown: (e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                },
                            }}
                            size="small"
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outlined"
                            className="rounded border border-[#433C50] px-4 py-2 capitalize text-[#433C50]"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        {isEditMode ? (
                            <Button
                                className="rounded bg-green-900 px-4 py-2 capitalize text-white"
                                onClick={handleUpdate}
                            >
                                Update
                            </Button>
                        ) : (
                            <Button
                                className="rounded bg-[#053054] px-4 py-2 capitalize text-white"
                                onClick={handleAdd}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                </Box>
            </Modal>

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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">
                        Are you sure, You want to delete this assigned incentive?
                    </Typography>

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
                autoHideDuration={1000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                    onClose={handleSnackbarClose}
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AssignIncentive;
