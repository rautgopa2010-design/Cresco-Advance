// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, UserPlus, X, CirclePlus, CircleMinus } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, MenuItem } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const ProductSubCategory = () => {
//     const [open, setOpen] = useState(false);
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [productCategory, setProductCategory] = useState("");
//     const [productSubCategories, setProductSubCategories] = useState([""]);
//     const [CategoryError, setCategoryError] = useState(false);
//     const [productCategoryList, setProductCategoryList] = useState([]);
//     const [productSubCategoryList, setProductSubCategoryList] = useState([]);

//     useEffect(() => {
//         const storedSubCategories = JSON.parse(localStorage.getItem("productsSubCategoryList")) || [];
//         const storedProductCategories = JSON.parse(localStorage.getItem("productCategoryList")) || [];

//         setProductSubCategoryList(storedSubCategories);
//         setProductCategoryList(storedProductCategories);
//     }, []);

//     const modalStyle = {
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: isMobile ? 330 : 500,
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         borderRadius: "12px",
//         p: 3,
//     };

//     const getCurrentISTDateTime = () => {
//         const now = new Date();
//         const options = {
//             timeZone: "Asia/Kolkata",
//             year: "numeric",
//             month: "2-digit",
//             day: "2-digit",
//             hour: "2-digit",
//             minute: "2-digit",
//             second: "2-digit",
//             hour12: false,
//         };
//         const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
//         return formatted.replace(/\//g, "-").replace(",", "");
//     };

//     const handleOpen = () => {
//         const storedProductCategories = JSON.parse(localStorage.getItem("productCategoryList")) || [];
//         setProductCategoryList(storedProductCategories);

//         setOpen(true);
//         setError(false);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setError(false);
//         setIsEditMode(false);
//         setEditIndex(null);
//         setProductCategory("");
//         setProductSubCategories([""]);
//     };

//     const handleEdit = (index) => {
//         const item = productSubCategoryList[index];
//         setProductCategory(item.Category || "");
//         setProductSubCategories(Array.isArray(item.subCategories) ? item.subCategories : [item.subCategory]);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleDelete = (index) => {
//         const updatedList = productSubCategoryList.filter((_, i) => i !== index);
//         setProductSubCategoryList(updatedList);
//         localStorage.setItem("productsSubCategoryList", JSON.stringify(updatedList));
//     };

//     const handleAdd = () => {
//         let messages = [];

//         setCategoryError(false);
//         setError(false);

//         if (!productCategory.trim()) {
//             setCategoryError(true);
//             messages.push("Product Category is required");
//         }

//         const trimmedCategory = productCategory.trim();
//         const trimmedSubCategories = productSubCategories.map((sub) => sub.trim());

//         const emptySubCategories = trimmedSubCategories.some((sub) => !sub);
//         if (emptySubCategories) {
//             setError(true);
//             messages.push("All Product Sub Categories must be filled");
//         }

//         // Check if category already exists
//         const categoryExists = productSubCategoryList.some((entry) => entry.Category.toLowerCase() === trimmedCategory.toLowerCase());
//         if (categoryExists) {
//             messages.push("Category already exists");
//         }

//         // Check for duplicate subcategories in input
//         const subCatSet = new Set();
//         const hasDuplicateSubCategories = trimmedSubCategories.some((sub) => {
//             if (subCatSet.has(sub.toLowerCase())) return true;
//             subCatSet.add(sub.toLowerCase());
//             return false;
//         });
//         if (hasDuplicateSubCategories) {
//             messages.push("Sub Categories should be unique");
//         }

//         if (messages.length > 0) {
//             setSnackbarMessage(messages.join(" | "));
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newEntry = {
//             id: productSubCategoryList.length + 1,
//             subCategories: trimmedSubCategories,
//             Category: trimmedCategory,
//             date: getCurrentISTDateTime(),
//         };

//         const updatedList = [...productSubCategoryList, newEntry];
//         setProductSubCategoryList(updatedList);
//         localStorage.setItem("productsSubCategoryList", JSON.stringify(updatedList));

//         setSnackbarMessage("Product Sub-Categories added successfully");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleUpdate = () => {
//         let messages = [];

//         setCategoryError(false);
//         setError(false);

//         if (!productCategory.trim()) {
//             setCategoryError(true);
//             messages.push("Product Category is required");
//         }

//         const trimmedCategory = productCategory.trim();
//         const trimmedSubCategories = productSubCategories.map((sub) => sub.trim());

//         const emptySubCategories = trimmedSubCategories.some((sub) => !sub);
//         if (emptySubCategories) {
//             setError(true);
//             messages.push("All Product Sub Categories must be filled");
//         }

//         // Check if new category already exists elsewhere
//         const categoryExists = productSubCategoryList.some(
//             (entry, index) => index !== editIndex && entry.Category.toLowerCase() === trimmedCategory.toLowerCase(),
//         );
//         if (categoryExists) {
//             messages.push("Category already exists");
//         }

//         // Check for duplicate subcategories in input
//         const subCatSet = new Set();
//         const hasDuplicateSubCategories = trimmedSubCategories.some((sub) => {
//             if (subCatSet.has(sub.toLowerCase())) return true;
//             subCatSet.add(sub.toLowerCase());
//             return false;
//         });
//         if (hasDuplicateSubCategories) {
//             messages.push("Sub Categories should be unique");
//         }

//         // Check if any of the new subcategories already exist in other entries for the same category
//         const subCategoryAlreadyExists = productSubCategoryList.some((entry, index) => {
//             if (index === editIndex) return false;
//             return (
//                 entry.Category.toLowerCase() === trimmedCategory.toLowerCase() &&
//                 entry.subCategories.some((sub) => trimmedSubCategories.includes(sub.trim()))
//             );
//         });

//         if (subCategoryAlreadyExists) {
//             messages.push("Some Sub Categories already exist for this Category");
//         }

//         if (messages.length > 0) {
//             setSnackbarMessage(messages.join(" | "));
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updated = [...productSubCategoryList];
//         updated[editIndex] = {
//             ...updated[editIndex],
//             subCategories: trimmedSubCategories,
//             Category: trimmedCategory,
//             date: getCurrentISTDateTime(),
//         };

//         setProductSubCategoryList(updated);
//         localStorage.setItem("productsSubCategoryList", JSON.stringify(updated));

//         setSnackbarMessage("Product Sub-Categories updated successfully");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleSnackbarClose = (_, reason) => {
//         if (reason === "clickaway") return;
//         setSnackbarOpen(false);
//     };

//     return (
//         <>
//             <div className="card">
//                 <div className="items-center justify-between text-nowrap md:flex lg:flex">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Product Sub-Category :</div>
//                     <Button
//                         variant="gradient"
//                         className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <UserPlus size={20} />
//                         Create Sub-Category
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Sub-Categories No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Sub-Categories Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product Categories</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product Sub-Categories</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {Array.isArray(productSubCategoryList) && productSubCategoryList.length > 0 ? (
//                                     productSubCategoryList.map((product, index) => (
//                                         <tr
//                                             key={product.id}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell border border-gray-300">{index + 1}</td>
//                                             <td className="table-cell border border-gray-300">{product.id}</td>
//                                             <td className="table-cell border border-gray-300">{product.Category}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 {Array.isArray(product.subCategories) ? product.subCategories.join(", ") : ""}
//                                             </td>
//                                             <td className="table-cell border border-gray-300">{product.date}</td>
//                                             <td className="table-cell border border-gray-300">
//                                                 <div className="flex items-center gap-x-4">
//                                                     <button
//                                                         className="text-blue-500"
//                                                         onClick={() => handleEdit(index)}
//                                                     >
//                                                         <PencilLine size={20} />
//                                                     </button>
//                                                     <button
//                                                         className="text-red-500"
//                                                         onClick={() => handleDelete(index)}
//                                                     >
//                                                         <Trash size={20} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             colSpan="6"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Products Added Yet.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>

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
//                             {isEditMode ? "Update Product" : "Add Product"}
//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>
//                     <div>
//                         <TextField
//                             select
//                             fullWidth
//                             label="Product Category"
//                             placeholder="Choose Product Category"
//                             value={productCategory}
//                             onChange={(e) => {
//                                 setProductCategory(e.target.value);
//                                 setCategoryError(false);
//                             }}
//                             error={CategoryError}
//                             size="small"
//                         >
//                             <MenuItem
//                                 value=""
//                                 disabled
//                             >
//                                 Choose Product Category
//                             </MenuItem>
//                             {productCategoryList.map((CategoryItem, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={CategoryItem.name}
//                                 >
//                                     {CategoryItem.name}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </div>
//                     {productSubCategories.map((subCat, idx) => (
//                         <div
//                             key={idx}
//                             className="mt-4 flex items-center gap-2"
//                         >
//                             <TextField
//                                 fullWidth
//                                 label={`Sub-Category ${idx + 1}`}
//                                 placeholder="Enter Product Sub Category"
//                                 variant="outlined"
//                                 error={error && !subCat.trim()}
//                                 value={subCat}
//                                 onChange={(e) => {
//                                     const updated = [...productSubCategories];
//                                     updated[idx] = e.target.value;
//                                     setProductSubCategories(updated);
//                                     setError(false);
//                                 }}
//                                 size="small"
//                             />
//                             {productSubCategories.length > 1 && (
//                                 <IconButton
//                                     onClick={() => {
//                                         const updated = productSubCategories.filter((_, i) => i !== idx);
//                                         setProductSubCategories(updated);
//                                     }}
//                                     size="small"
//                                     className="border"
//                                 >
//                                     <CircleMinus
//                                         size={16}
//                                         className="text-red-500"
//                                     />
//                                 </IconButton>
//                             )}
//                             {idx === productSubCategories.length - 1 && (
//                                 <IconButton
//                                     onClick={() => setProductSubCategories([...productSubCategories, ""])}
//                                     size="small"
//                                     className="border"
//                                 >
//                                     <CirclePlus
//                                         size={16}
//                                         className="text-blue-500"
//                                     />
//                                 </IconButton>
//                             )}
//                         </div>
//                     ))}

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

//             {/* Snackbar */}
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//                 <Alert
//                     severity={snackbarSeverity}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default ProductSubCategory;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, UserPlus, X, CirclePlus, CircleMinus } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, MenuItem, Alert, useMediaQuery, CircularProgress } from "@mui/material";
import {
    getProductSubCategory,
    createProductSubCategory,
    updateProductSubCategory,
    deleteProductSubCategory,
} from "../../redux/actions/productSubCategory";
import { getProductBrand } from "../../redux/actions/productBrand";
import { getProductCategory } from "../../redux/actions/productCategory";
import { clearSnackbar } from "../../redux/actions/commonActions";

const ProductSubCategory = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [productBrand, setProductBrand] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productSubCategories, setProductSubCategories] = useState([""]);
    const [brandError, setBrandError] = useState(false);
    const [categoryError, setCategoryError] = useState(false);
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.productSubCategory.loading);
    const { productBrand: productBrandList } = useSelector((state) => state.productBrand);
    const { productCategory: productCategoryList } = useSelector((state) => state.productCategory);
    const { productSubCategory: productSubCategoryList, snackbarMessage, snackbarSeverity } = useSelector((state) => state.productSubCategory);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getProductBrand());
        dispatch(getProductCategory());
        dispatch(getProductSubCategory());
    }, [dispatch]);

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

    const getCurrentISTDateTime = () => {
        const now = new Date();
        const options = {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        };
        const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
        return formatted.replace(/\//g, "-").replace(",", "");
    };

    const handleOpen = () => {
        setOpen(true);
        setError(false);
    };

    const handleClose = () => {
        setOpen(false);
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setProductBrand("");
        setProductCategory("");
        setProductSubCategories([""]);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (item) => {
        setProductBrand(item.productBrandId || "");
        setProductCategory(item.productCategoryName || "");
        setProductSubCategories(item.subCategories || [""]);
        setEditId(item.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleAdd = async () => {
        let messages = [];

        setCategoryError(false);
        setError(false);

        const selectedBrand = productBrandList.find((bran) => bran.id === productBrand);
        if (!selectedBrand) {
            setBrandError(true);
            messages.push("Product Brand is required");
        }

        const selectedCategory = productCategoryList.find((cat) => cat.productBrandId === productBrand && cat.categories.includes(productCategory));

        if (!selectedCategory) {
            setCategoryError(true);
            messages.push("Product Category is required");
        }

        const trimmedSubCategories = productSubCategories.map((sub) => sub.trim());
        if (trimmedSubCategories.some((sub) => !sub)) {
            setError(true);
            messages.push("All Sub Categories must be filled");
        }

        const hasDuplicate = new Set(trimmedSubCategories.map((s) => s.toLowerCase())).size !== trimmedSubCategories.length;
        if (hasDuplicate) {
            messages.push("Sub Categories must be unique");
        }

        if (messages.length > 0) {
            setLocalSnackbarMessage(messages.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            createProductSubCategory({
                productBrandId: selectedBrand.id,
                productCategoryId: selectedCategory?.id,
                productCategoryName: productCategory,
                productSubCategories: trimmedSubCategories,
                date: getCurrentISTDateTime(),
            }),
        );

        handleClose();
    };

    const handleUpdate = async () => {
        let messages = [];

        setCategoryError(false);
        setError(false);

        const selectedBrand = productBrandList.find((bran) => bran.id === productBrand);
        if (!selectedBrand) {
            setBrandError(true);
            messages.push("Product Brand is required");
        }

        const selectedCategory = productCategoryList.find((cat) => cat.productBrandId === productBrand && cat.categories.includes(productCategory));

        if (!selectedCategory) {
            setCategoryError(true);
            messages.push("Product Category is required");
        }

        const trimmedSubCategories = productSubCategories.map((sub) => sub.trim());
        if (trimmedSubCategories.some((sub) => !sub)) {
            setError(true);
            messages.push("All Sub Categories must be filled");
        }

        const hasDuplicate = new Set(trimmedSubCategories.map((s) => s.toLowerCase())).size !== trimmedSubCategories.length;
        if (hasDuplicate) {
            messages.push("Sub Categories must be unique");
        }

        if (messages.length > 0) {
            setLocalSnackbarMessage(messages.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            updateProductSubCategory(editId, {
                productBrandId: selectedBrand.id,
                productCategoryId: selectedCategory?.id,
                productCategoryName: productCategory,
                productSubCategories: trimmedSubCategories,
                date: getCurrentISTDateTime(),
            }),
        );

        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        dispatch(deleteProductSubCategory(selectedDeleteId));
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

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    <div className="items-center justify-between text-nowrap md:flex lg:flex">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Product Sub-Category :</div>
                        <Button
                            variant="gradient"
                            className="jusse mt-3 flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:mt-0 md:px-3 md:text-base lg:mt-0 lg:px-3 lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create Sub-Category
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative w-full flex-shrink-0 overflow-auto">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Product Brand</th>
                                        <th className="table-head border border-gray-300 capitalize">Product Category</th>
                                        <th className="table-head border border-gray-300 capitalize">Product Sub-Categories</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {Array.isArray(productSubCategoryList) && productSubCategoryList.length > 0 ? (
                                        productSubCategoryList.map((product, index) => (
                                            <tr
                                                key={product.id}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{product.brand}</td>
                                                <td className="table-cell border border-gray-300">{product.productCategoryName}</td>
                                                <td className="table-cell border border-gray-300">
                                                    {Array.isArray(product.subCategories) ? product.subCategories.join(", ") : ""}
                                                </td>
                                                <td className="table-cell border border-gray-300">{product.date}</td>
                                                <td className="table-cell border border-gray-300">
                                                    <div className="flex items-center gap-x-4">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEdit(product)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteClick(product.id)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Product Sub Categories Added Yet.
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
                            {isEditMode ? "Update Sub-Category" : "Add Sub-Category"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>
                    <div>
                        <TextField
                            select
                            fullWidth
                            label="Product Brand"
                            placeholder="Choose Product Brand"
                            value={productBrand}
                            onChange={(e) => {
                                setProductBrand(e.target.value);
                                setBrandError(false);
                            }}
                            error={brandError}
                            size="small"
                        >
                            <MenuItem
                                value=""
                                disabled
                            >
                                Choose Product Brand
                            </MenuItem>
                            {productBrandList.map((BrandItem, index) => (
                                <MenuItem
                                    key={index}
                                    value={BrandItem.id}
                                >
                                    {BrandItem.productBrand}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="mt-4">
                        <TextField
                            select
                            fullWidth
                            label="Product Category"
                            placeholder="Choose Product Category"
                            value={productCategory}
                            onChange={(e) => {
                                setProductCategory(e.target.value);
                                setCategoryError(false);
                            }}
                            error={categoryError}
                            size="small"
                        >
                            <MenuItem
                                value=""
                                disabled
                            >
                                Choose Product Category
                            </MenuItem>
                            {(productCategoryList.find((cat) => cat.productBrandId === productBrand)?.categories || []).map((categoryName, index) => (
                                <MenuItem
                                    key={index}
                                    value={categoryName}
                                >
                                    {categoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    {productSubCategories.map((subCat, idx) => (
                        <div
                            key={idx}
                            className="mt-4 flex items-center gap-2"
                        >
                            <TextField
                                fullWidth
                                label={`Sub-Category ${idx + 1}`}
                                placeholder="Enter Product Sub Category"
                                variant="outlined"
                                error={error && !subCat.trim()}
                                value={subCat}
                                onChange={(e) => {
                                    const updated = [...productSubCategories];
                                    updated[idx] = e.target.value;
                                    setProductSubCategories(updated);
                                    setError(false);
                                }}
                                size="small"
                            />
                            {productSubCategories.length > 1 && (
                                <IconButton
                                    onClick={() => {
                                        const updated = productSubCategories.filter((_, i) => i !== idx);
                                        setProductSubCategories(updated);
                                    }}
                                    size="small"
                                    className="border"
                                >
                                    <CircleMinus
                                        size={16}
                                        className="text-red-500"
                                    />
                                </IconButton>
                            )}
                            {idx === productSubCategories.length - 1 && (
                                <IconButton
                                    onClick={() => setProductSubCategories([...productSubCategories, ""])}
                                    size="small"
                                    className="border"
                                >
                                    <CirclePlus
                                        size={16}
                                        className="text-blue-500"
                                    />
                                </IconButton>
                            )}
                        </div>
                    ))}

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
                        Are you sure, You want to delete this product sub category?
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
                autoHideDuration={2000}
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

export default ProductSubCategory;
