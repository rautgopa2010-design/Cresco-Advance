// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, UserPlus, X } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const ProductCategory = () => {
//     const [open, setOpen] = useState(false);
//     const [productCategory, setProductCategory] = useState("");
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [productCategoryList, setProductCategoryList] = useState([]);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);

//     // Load from localStorage on first load
//     useEffect(() => {
//         const storedProductsCategory = JSON.parse(localStorage.getItem("productCategoryList")) || [];
//         setProductCategoryList(storedProductsCategory);
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
//         setOpen(true);
//         setError(false);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setProductCategory("");
//         setError(false);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (index) => {
//         const productCategory = productCategoryList[index];
//         setProductCategory(productCategory.name);
//         setEditIndex(index);
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleUpdate = () => {
//         const trimmedCategory = productCategory.trim();
//         if (!trimmedCategory) {
//             setError(true);
//             setSnackbarMessage("Product Category is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const isDuplicate = productCategoryList.some(
//             (item, index) =>
//                 item.name.toLowerCase() === trimmedCategory.toLowerCase() &&
//                 index !== editIndex
//         );

//         if (isDuplicate) {
//             setError(true);
//             setSnackbarMessage("Category already exists");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedProductsCategory = [...productCategoryList];
//         updatedProductsCategory[editIndex] = {
//             ...updatedProductsCategory[editIndex],
//             name: trimmedCategory,
//             date: getCurrentISTDateTime(),
//         };

//         setProductCategoryList(updatedProductsCategory);
//         localStorage.setItem("productCategoryList", JSON.stringify(updatedProductsCategory));

//         setSnackbarMessage("Product Updated Successfully");
//         setError(false);
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleDelete = (index) => {
//         const updatedProductsCategory = productCategoryList.filter((_, i) => i !== index);
//         setProductCategoryList(updatedProductsCategory);
//         localStorage.setItem("productCategoryList", JSON.stringify(updatedProductsCategory));
//     };

//     const handleAdd = () => {
//         const trimmedCategory = productCategory.trim();
//         if (!trimmedCategory) {
//             setError(true);
//             setSnackbarMessage("Product Category is required");
//             setSnackbarOpen(true);
//             return;
//         }

//         const isDuplicate = productCategoryList.some(
//             (item) => item.name.toLowerCase() === trimmedCategory.toLowerCase()
//         );

//         if (isDuplicate) {
//             setError(true);
//             setSnackbarMessage("Category already exists");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newProductCategory = {
//             id: productCategoryList.length + 1,
//             name: trimmedCategory,
//             date: getCurrentISTDateTime(),
//         };

//         const updatedProductsCategory = [...productCategoryList, newProductCategory];
//         setProductCategoryList(updatedProductsCategory);
//         localStorage.setItem("productCategoryList", JSON.stringify(updatedProductsCategory));

//         setSnackbarMessage("Product Category Created Successfully");
//         setError(false);
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
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Product Category :</div>
//                     <Button
//                         variant="gradient"
//                         className="flex items-center gap-2 text-sm rounded-full bg-[#053054] px-3 py-2 capitalize md:text-base lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <UserPlus size={20} />
//                         Create Category
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Categories No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Categories Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product Categories</th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {productCategoryList.map((productCategory, index) => (
//                                     <tr
//                                         className="table-row"
//                                         key={index}
//                                     >
//                                         <td className="table-cell border border-gray-300">{index + 1}</td>
//                                         <td className="table-cell border border-gray-300">{index + 1}</td>
//                                         <td className="table-cell border border-gray-300">{productCategory.name}</td>
//                                         <td className="table-cell border border-gray-300">{productCategory.date}</td>
//                                         <td className="table-cell border border-gray-300">
//                                             <div className="flex items-center gap-x-4">
//                                                 <button
//                                                     className="text-blue-500"
//                                                     onClick={() => handleEdit(index)}
//                                                 >
//                                                     <PencilLine size={20} />
//                                                 </button>
//                                                 <button
//                                                     className="text-red-500"
//                                                     onClick={() => handleDelete(index)}
//                                                 >
//                                                     <Trash size={20} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                                 {productCategoryList.length === 0 && (
//                                     <tr>
//                                         <td
//                                             colSpan="5"
//                                             className="py-4 text-center text-gray-400"
//                                         >
//                                             No Product categories Added Yet.
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
//                             {isEditMode ? "Update Product Category" : "Add Product Category"}

//                         </Typography>
//                         <IconButton onClick={handleClose}>
//                             <X size={20} />
//                         </IconButton>
//                     </div>

//                     <TextField
//                         fullWidth
//                         label="Product Category"
//                         placeholder="Enter Product Category"
//                         variant="outlined"
//                         error={error}
//                         value={productCategory}
//                         onChange={(e) => {
//                             setProductCategory(e.target.value);
//                             setError(false);
//                         }}
//                     />

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
//                     severity={error ? "error" : "success"}
//                     variant="filled"
//                     onClose={handleSnackbarClose}
//                 >
//                     {snackbarMessage}
//                 </Alert>
//             </Snackbar>
//         </>
//     );
// };

// export default ProductCategory;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { PencilLine, Trash, UserPlus, X, CirclePlus, CircleMinus } from "lucide-react";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, useMediaQuery, CircularProgress, MenuItem } from "@mui/material";
import { getProductCategory, createProductCategory, updateProductCategory, deleteProductCategory } from "../../redux/actions/productCategory";
import { getProductBrand } from "../../redux/actions/productBrand";
import { clearSnackbar } from "../../redux/actions/commonActions";

const ProductCategory = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const [productBrand, setProductBrand] = useState("");
    const [productCategories, setProductCategories] = useState([""]);
    const [brandError, setBrandError] = useState(false);
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const loading = useSelector((state) => state.productCategory.loading);
    const { productBrand: productBrandList } = useSelector((state) => state.productBrand);
    const { productCategory: productCategoryList, snackbarMessage, snackbarSeverity } = useSelector((state) => state.productCategory);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getProductBrand());
        dispatch(getProductCategory());
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
        setProductBrand("");
        setProductCategories([""]);
        setError(false);
        setIsEditMode(false);
        setEditId(null);
        setLocalSnackbarMessage("");
    };

    const handleEdit = (item) => {
        setProductBrand(item.productBrandId || "");
        setProductCategories(Array.isArray(item.categories) ? item.categories : [item.categories]);
        setEditId(item.id);
        setIsEditMode(true);
        setOpen(true);
        setError(false);
    };

    const handleAdd = async () => {
        let messages = [];

        setBrandError(false);
        setError(false);

        const selectedBrand = productBrandList.find((bran) => bran.id === productBrand);
        if (!selectedBrand) {
            setBrandError(true);
            messages.push("Product Brand is required");
        }

        const trimmedCategories = productCategories.map((cat) => cat.trim());
        if (trimmedCategories.some((cat) => !cat)) {
            setError(true);
            messages.push("All Categories must be filled");
        }

        const hasDuplicate = new Set(trimmedCategories.map((c) => c.toLowerCase())).size !== trimmedCategories.length;
        if (hasDuplicate) {
            messages.push("Categories must be unique");
        }

        if (messages.length > 0) {
            setLocalSnackbarMessage(messages.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            createProductCategory({
                productBrandId: selectedBrand.id,
                productCategory: trimmedCategories,
                date: getCurrentISTDateTime(),
            }),
        );

        handleClose();
    };

    const handleUpdate = async () => {
        let messages = [];

        setBrandError(false);
        setError(false);

        const selectedBrand = productBrandList.find((bran) => bran.id === productBrand);
        if (!selectedBrand) {
            setBrandError(true);
            messages.push("Product Brand is required");
        }

        const trimmedCategories = productCategories.map((cat) => cat.trim());
        if (trimmedCategories.some((cat) => !cat)) {
            setError(true);
            messages.push("All Categories must be filled");
        }

        const hasDuplicate = new Set(trimmedCategories.map((c) => c.toLowerCase())).size !== trimmedCategories.length;
        if (hasDuplicate) {
            messages.push("Categories must be unique");
        }

        if (messages.length > 0) {
            setLocalSnackbarMessage(messages.join(" | "));
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        dispatch(
            updateProductCategory(editId, {
                productBrandId: selectedBrand.id,
                productCategory: trimmedCategories,
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
        dispatch(deleteProductCategory(selectedDeleteId));
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
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Product Category :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-3 py-2 text-sm capitalize md:text-base lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create Category
                        </Button>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Product Brand</th>
                                        <th className="table-head border border-gray-300 capitalize">Product Categories</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {productCategoryList.map((productCategory, index) => (
                                        <tr
                                            className="table-row"
                                            key={index}
                                        >
                                            <td className="table-cell border border-gray-300">{index + 1}</td>
                                            <td className="table-cell border border-gray-300">{productCategory.brand}</td>
                                            <td className="table-cell border border-gray-300">
                                                {Array.isArray(productCategory.categories)
                                                    ? productCategory.categories.join(", ")
                                                    : productCategory.categories}
                                            </td>
                                            <td className="table-cell border border-gray-300">{productCategory.date}</td>
                                            <td className="table-cell border border-gray-300">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        className="text-blue-500"
                                                        onClick={() => handleEdit(productCategory)}
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        className="text-red-500"
                                                        onClick={() => handleDeleteClick(productCategory.id)}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {productCategoryList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Product categories Added Yet.
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
                            {isEditMode ? "Update Category" : "Add Category"}
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

                    {productCategories.map((cat, idx) => (
                        <div
                            key={idx}
                            className="mt-4 flex items-center gap-2"
                        >
                            <TextField
                                fullWidth
                                label={`Category ${idx + 1}`}
                                placeholder="Enter Product Category"
                                variant="outlined"
                                error={error && !cat.trim()}
                                value={cat}
                                onChange={(e) => {
                                    const updated = [...productCategories];
                                    updated[idx] = e.target.value;
                                    setProductCategories(updated);
                                    setError(false);
                                }}
                                size="small"
                            />
                            {productCategories.length > 1 && (
                                <IconButton
                                    onClick={() => {
                                        const updated = productCategories.filter((_, i) => i !== idx);
                                        setProductCategories(updated);
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
                            {idx === productCategories.length - 1 && (
                                <IconButton
                                    onClick={() => setProductCategories([...productCategories, ""])}
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
                        Are you sure, You want to delete this product category?
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

export default ProductCategory;
