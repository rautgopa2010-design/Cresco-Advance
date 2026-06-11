// import React, { useState, useEffect } from "react";
// import { Button } from "@material-tailwind/react";
// import { PencilLine, Trash, CirclePlus, CircleMinus, UserPlus, X } from "lucide-react";
// import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, MenuItem } from "@mui/material";
// import { useMediaQuery } from "@mui/material";

// const Product = () => {
//     const [open, setOpen] = useState(false);
//     const [hsnCode, setHsnCode] = useState("");
//     const [products, setProducts] = useState([""]);
//     const [error, setError] = useState(false);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const [productsList, setProductsList] = useState([]);
//     const isMobile = useMediaQuery("(max-width:600px)");
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editIndex, setEditIndex] = useState(null);
//     const [productCategory, setProductCategory] = useState("");
//     const [CategoryError, setCategoryError] = useState(false);
//     const [productCategoryList, setProductCategoryList] = useState([]);
//     const [subCategories, setSubCategories] = useState([]);
//     const [productSubCategoryList, setProductSubCategoryList] = useState([]);
//     const [productSubCategory, setProductSubCategory] = useState("");
//     const [subCategoryError, setSubCategoryError] = useState(false);

//     // Load from localStorage on first load
//     useEffect(() => {
//         const storedProducts = JSON.parse(localStorage.getItem("productsList")) || [];
//         setProductsList(storedProducts);
//         console.log(storedProducts);
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
//         const storedProductSubCategories = JSON.parse(localStorage.getItem("productsSubCategoryList")) || [];
//         setProductSubCategoryList(storedProductSubCategories);
//         setProductCategoryList(storedProductSubCategories.map((item) => item.Category));
//         setOpen(true);
//         setError(false);
//     };

//     const handleClose = () => {
//         setOpen(false);
//         setProductCategory("");
//         setHsnCode("");
//         setProducts([""]);
//         setError(false);
//         setIsEditMode(false);
//         setEditIndex(null);
//     };

//     const handleEdit = (categoryIndex, subIndex) => {
//         const categoryItem = productsList[categoryIndex];
//         const subItem = categoryItem.Products[subIndex];

//         const storedProductCategories = JSON.parse(localStorage.getItem("productsSubCategoryList")) || [];

//         setProductSubCategoryList(storedProductCategories);
//         setProductCategoryList(storedProductCategories.map((item) => item.Category));

//         setProductCategory(categoryItem.Category || "");
//         setProductSubCategory(subItem.SubCategory || "");
//         setHsnCode(subItem.hsnCode || "");
//         setProducts(subItem.Items.map((item) => item.name));

//         const selectedCategory = storedProductCategories.find((item) => item.Category === categoryItem.Category);
//         setSubCategories(selectedCategory ? selectedCategory.subCategories : []);

//         setEditIndex({ categoryIndex, subIndex }); // store both indices
//         setIsEditMode(true);
//         setOpen(true);
//         setError(false);
//     };

//     const handleUpdate = () => {
//         let messages = [];

//         if (!productCategory.trim()) {
//             setCategoryError(true);
//             messages.push("Product Category is required");
//         }

//         if (!productSubCategory.trim()) {
//             setSubCategoryError(true);
//             messages.push("Product Subcategory is required");
//         }

//         if (!hsnCode.trim()) {
//             setError(true);
//             messages.push("HSN Code is required");
//         }

//         if (products.some((p) => !p.trim())) {
//             setError(true);
//             messages.push("All Product fields must be filled");
//         }

//         if (messages.length > 0) {
//             setSnackbarMessage(messages.join(" | "));
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const updatedProductsList = [...productsList];
//         const { categoryIndex, subIndex } = editIndex;

//         const updatedSubcategory = {
//             SubCategory: productSubCategory.trim(),
//             hsnCode: hsnCode.trim(),
//             date: getCurrentISTDateTime(),
//             Items: products.map((p, idx) => ({
//                 id: Date.now() + idx,
//                 name: p.trim(),
//             })),
//         };

//         // Update existing subcategory
//         updatedProductsList[categoryIndex].Products[subIndex] = updatedSubcategory;

//         // Also update SubCategory array in case the name changed
//         updatedProductsList[categoryIndex].SubCategory[subIndex] = productSubCategory.trim();

//         setProductsList(updatedProductsList);
//         localStorage.setItem("productsList", JSON.stringify(updatedProductsList));

//         setSnackbarMessage("Product updated successfully");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         handleClose();
//     };

//     const handleDelete = (categoryIndex, subIndex) => {
//         const updatedList = [...productsList];

//         // Access category's Products array
//         const category = updatedList[categoryIndex];
//         if (!category) return; // safety check

//         // Remove the subcategory (product) at subIndex
//         category.Products.splice(subIndex, 1);

//         // Also remove the SubCategory string from category.SubCategory array at same index
//         // Find subcategory name to remove from SubCategory array:
//         // But SubCategory array and Products array order might be the same? Assuming yes:
//         category.SubCategory.splice(subIndex, 1);

//         // If after deletion, no subcategories left, optionally remove entire category
//         if (category.Products.length === 0) {
//             updatedList.splice(categoryIndex, 1);
//         }

//         setProductsList(updatedList);
//         localStorage.setItem("productsList", JSON.stringify(updatedList));
//     };

//     const handleAdd = () => {
//         let messages = [];

//         if (!productCategory.trim()) {
//             setCategoryError(true);
//             messages.push("Product Category is required");
//         }

//         if (!productSubCategory.trim()) {
//             setSubCategoryError(true);
//             messages.push("Product Subcategory is required");
//         }

//         if (!hsnCode.trim()) {
//             setError(true);
//             messages.push("HSN Code is required");
//         }

//         if (products.some((p) => !p.trim())) {
//             setError(true);
//             messages.push("All Product fields must be filled");
//         }

//         const updatedList = [...productsList];
//         const existingCategoryIndex = updatedList.findIndex((item) => item.Category === productCategory);

//         if (existingCategoryIndex !== -1) {
//             const categoryItem = updatedList[existingCategoryIndex];

//             const subIndex = categoryItem.Products.findIndex((sub) => sub.SubCategory.toLowerCase() === productSubCategory.toLowerCase());

//             if (subIndex !== -1) {
//                 // 🔴 Subcategory already exists in this category — show error
//                 setSnackbarMessage("Sub Category already added, you can add product for it from edit");
//                 setSnackbarSeverity("error");
//                 setSnackbarOpen(true);
//                 return;
//             }
//         }

//         if (messages.length > 0) {
//             setSnackbarMessage(messages.join(" | "));
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const newProducts = products.map((p, idx) => ({
//             id: Date.now() + idx,
//             name: p.trim(),
//         }));

//         if (existingCategoryIndex !== -1) {
//             const categoryItem = updatedList[existingCategoryIndex];
//             categoryItem.SubCategory.push(productSubCategory);
//             categoryItem.Products.push({
//                 SubCategory: productSubCategory,
//                 hsnCode: hsnCode.trim(),
//                 date: getCurrentISTDateTime(),
//                 Items: [...newProducts],
//             });
//         } else {
//             updatedList.push({
//                 Category: productCategory,
//                 SubCategory: [productSubCategory],
//                 Products: [
//                     {
//                         SubCategory: productSubCategory,
//                         hsnCode: hsnCode.trim(),
//                         date: getCurrentISTDateTime(),
//                         Items: [...newProducts],
//                     },
//                 ],
//             });
//         }

//         setProductsList(updatedList);
//         localStorage.setItem("productsList", JSON.stringify(updatedList));
//         setSnackbarMessage("Products added Successfully");
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
//                 <div className="flex items-center justify-between text-nowrap">
//                     <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Product :</div>
//                     <Button
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
//                         onClick={handleOpen}
//                     >
//                         <UserPlus size={20} />
//                         Create Product
//                     </Button>
//                 </div>

//                 <div className="card-body p-0">
//                     <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header text-nowrap bg-[#053054] text-white">
//                                 <tr className="table-row">
//                                     <th className="table-head border border-gray-300 capitalize">Product No.</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product Id</th>
//                                     <th className="table-head border border-gray-300 capitalize">Product Categories</th>
//                                     <th className="table-head border border-gray-300 capitalize">Sub-Categories</th>
//                                     <th className="table-head border border-gray-300 capitalize">HSN Code</th>
//                                     <th className="table-head border border-gray-300 capitalize">Products </th>
//                                     <th className="table-head border border-gray-300 capitalize">Date</th>
//                                     <th className="table-head border border-gray-300 capitalize">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body text-[#433C50]">
//                                 {Array.isArray(productsList) && productsList.length > 0 ? (
//                                     productsList.map((categoryItem, categoryIndex) =>
//                                         categoryItem.Products.map((subItem, subIndex) => (
//                                             <tr
//                                                 key={`${categoryIndex}-${subIndex}`}
//                                                 className="table-row"
//                                             >
//                                                 <td className="table-cell border border-gray-300">{categoryIndex + subIndex + 1}</td>
//                                                 <td className="table-cell border border-gray-300">{categoryIndex + subIndex + 1}</td>
//                                                 <td className="table-cell border border-gray-300">{categoryItem.Category}</td>
//                                                 <td className="table-cell border border-gray-300">{subItem.SubCategory}</td>
//                                                 <td className="table-cell border border-gray-300">{subItem.hsnCode}</td>
//                                                 <td className="table-cell border border-gray-300">{subItem.Items.map((item) => item.name).join(", ")}</td>
//                                                 <td className="table-cell border border-gray-300">{subItem.date}</td>
//                                                 <td className="table-cell border border-gray-300">
//                                                     <div className="flex items-center gap-x-4">
//                                                         <button
//                                                             className="text-blue-500"
//                                                             onClick={() => handleEdit(categoryIndex, subIndex)}
//                                                         >
//                                                             <PencilLine size={20} />
//                                                         </button>
//                                                         <button
//                                                             className="text-red-500"
//                                                             onClick={() => handleDelete(categoryIndex, subIndex)}
//                                                         >
//                                                             <Trash size={20} />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )),
//                                     )
//                                 ) : (
//                                     <tr>
//                                         <td
//                                             colSpan="8"
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
//                                 const selectedCategory = e.target.value;
//                                 setProductCategory(selectedCategory);
//                                 setCategoryError(false);
//                                 setProductSubCategory(""); // reset subcategory
//                                 const selected = productSubCategoryList.find((item) => item.Category === selectedCategory);
//                                 setProductCategoryList(productSubCategoryList.map((item) => item.Category));
//                                 setSubCategories(selected ? selected.subCategories : []);
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
//                             {productCategoryList.map((category, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={category}
//                                 >
//                                     {category}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </div>
//                     <div className="mt-5">
//                         <TextField
//                             select
//                             fullWidth
//                             label="Product Subcategory"
//                             placeholder="Choose Subcategory"
//                             value={productSubCategory}
//                             onChange={(e) => {
//                                 setProductSubCategory(e.target.value);
//                                 setSubCategoryError(false);
//                             }}
//                             error={subCategoryError}
//                             size="small"
//                             className="mt-4"
//                         >
//                             <MenuItem
//                                 value=""
//                                 disabled
//                             >
//                                 Choose Subcategory
//                             </MenuItem>
//                             {subCategories.map((subCat, index) => (
//                                 <MenuItem
//                                     key={index}
//                                     value={subCat}
//                                 >
//                                     {subCat}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </div>
//                     <TextField
//                         fullWidth
//                         label="HSN Code "
//                         placeholder="Enter HSN Code "
//                         variant="outlined"
//                         error={error}
//                         value={hsnCode}
//                         onChange={(e) => {
//                             setHsnCode(e.target.value);
//                             setError(false);
//                         }}
//                         sx={{ marginTop: "20px" }}
//                         size="small"
//                     />
//                     {products.map((prod, idx) => (
//                         <div
//                             key={idx}
//                             className="gap- mt-5 flex items-center"
//                         >
//                             <TextField
//                                 fullWidth
//                                 label={`Product ${idx + 1}`}
//                                 placeholder="Enter Product"
//                                 variant="outlined"
//                                 error={error && !prod.trim()}
//                                 value={prod}
//                                 onChange={(e) => {
//                                     const updated = [...products];
//                                     updated[idx] = e.target.value;
//                                     setProducts(updated);
//                                     setError(false);
//                                 }}
//                                 size="small"
//                             />

//                             {/* Show minus icon when there are more than 1 products */}
//                             {products.length > 1 && (
//                                 <IconButton
//                                     onClick={() => {
//                                         const updated = products.filter((_, i) => i !== idx);
//                                         setProducts(updated);
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

//                             {/* Show plus icon only for the last product field */}
//                             {idx === products.length - 1 && (
//                                 <IconButton
//                                     onClick={() => setProducts([...products, ""])}
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

// export default Product;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProduct, createProduct, updateProduct, deleteProduct, importProducts } from "../../redux/actions/product";
import { Button } from "@material-tailwind/react";
import { getProductBrand } from "../../redux/actions/productBrand";
import { getProductCategory } from "../../redux/actions/productCategory";
import { getProductSubCategory } from "../../redux/actions/productSubCategory";
import { getProductUnit } from "../../redux/actions/productUnit";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { Modal, Box, Typography, IconButton, TextField, Snackbar, Alert, MenuItem, useMediaQuery, CircularProgress } from "@mui/material";
import { File, PencilLine, Trash, UserPlus, X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as XLSX from "xlsx";
import { PRODUCT_ERROR } from "../../redux/types";

const Product = () => {
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [open, setOpen] = useState(false);
    const [productBrand, setProductBrand] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productSubCategory, setProductSubCategory] = useState("");
    const [productUnit, setProductUnit] = useState("");
    const [hsnCode, setHsnCode] = useState("");
    const [product, setProduct] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [description, setDescription] = useState("");
    const [editId, setEditId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [brandError, setBrandError] = useState(false);
    const [categoryError, setCategoryError] = useState(false);
    const [subCategoryError, setSubCategoryError] = useState(false);
    const [error, setError] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const loading = useSelector((state) => state.product.loading);
    const { product: productList, snackbarMessage, snackbarSeverity } = useSelector((state) => state.product);
    const { productUnit: productUnitList } = useSelector((state) => state.productUnit);
    const { productSubCategory: productSubCategoryList } = useSelector((state) => state.productSubCategory);
    const { productCategory: productCategoryList } = useSelector((state) => state.productCategory);
    const { productBrand: productBrandList } = useSelector((state) => state.productBrand);

    useEffect(() => {
        dispatch(clearSnackbar());
        dispatch(getProductBrand());
        dispatch(getProductCategory());
        dispatch(getProductSubCategory());
        dispatch(getProductUnit());
        dispatch(getProduct());
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage && snackbarMessage.trim() !== "") {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

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
        setProductSubCategory("");
        setProductUnit("");
        setHsnCode("");
        setProduct("");
        setProductPrice("");
        setDescription("");
    };

    // Download Template
    const handleDownloadProductTemplate = () => {
        const template = [
            // Row 1 = instruction row (will be skipped)
            {
                "Brand *": "Example Brand (will be created if not exists)",
                "Category *": "Main Category",
                "Sub-Category *": "Sub Cat under above category",
                "Unit *": "PCS / KG / LTR / BOX etc.",
                "HSN Code *": "8471",
                "Product Name *": "Laptop XYZ",
                "Price *": "45999.00",
                Description: "High performance laptop...",
            },
            // Row 2 = empty – user starts here
            {
                "Brand *": "",
                "Category *": "",
                "Sub-Category *": "",
                "Unit *": "",
                "HSN Code *": "",
                "Product Name *": "",
                "Price *": "",
                Description: "",
            },
        ];

        const ws = XLSX.utils.json_to_sheet(template);

        // Style header row
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = XLSX.utils.encode_cell({ c: C, r: 0 });
            if (!ws[cell]) continue;
            ws[cell].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E0F2FE" } },
            };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");

        ws["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 35 }, { wch: 14 }, { wch: 40 }];

        XLSX.writeFile(wb, "Product_Import_Template.xlsx");
    };

    // Handle File Upload & Parse
    const handleProductFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            dispatch({ type: PRODUCT_ERROR, payload: "Please upload .xlsx or .xls file only" });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    defval: "",
                    blankrows: false,
                });

                if (rows.length <= 1) {
                    dispatch({ type: PRODUCT_ERROR, payload: "Excel file is empty or has no data rows" });
                    return;
                }

                // Skip header/instruction row
                const dataRows = rows.slice(1);

                // Filter out sample/example row and completely empty rows
                const filteredDataRows = dataRows.filter((row) => {
                    if (row.length < 8) return false;

                    const brand = (row[0] || "").toString().trim();
                    const productName = (row[5] || "").toString().trim();
                    const description = (row[7] || "").toString().trim();

                    const isLikelySample =
                        brand === "Example Brand (will be created if not exists)" ||
                        productName === "Laptop XYZ" ||
                        description.includes("High performance laptop");

                    const allEmpty = row.every((cell) => (cell || "").toString().trim() === "");

                    return !isLikelySample && !allEmpty;
                });

                if (filteredDataRows.length === 0) {
                    dispatch({
                        type: PRODUCT_ERROR,
                        payload: "No valid data rows found (only sample/example row detected)",
                    });
                    return;
                }

                const products = filteredDataRows
                    .map((row, idx) => {
                        const obj = {
                            brand: (row[0] || "").trim(),
                            category: (row[1] || "").trim(),
                            subCategory: (row[2] || "").trim(),
                            unit: (row[3] || "").trim(),
                            hsnCode: (row[4] || "").trim(),
                            product: (row[5] || "").trim(),
                            productPrice: (row[6] || "").toString().trim(),
                            description: (row[7] || "").trim(),
                        };

                        // Client-side required field and price validation
                        if (
                            !obj.brand ||
                            !obj.category ||
                            !obj.subCategory ||
                            !obj.unit ||
                            !obj.hsnCode ||
                            !obj.product ||
                            !obj.productPrice ||
                            isNaN(parseFloat(obj.productPrice)) ||
                            parseFloat(obj.productPrice) <= 0
                        ) {
                            return null;
                        }

                        return obj;
                    })
                    .filter(Boolean);

                if (products.length === 0) {
                    dispatch({
                        type: PRODUCT_ERROR,
                        payload: "No valid product rows found. Please fill all required fields and ensure price > 0.",
                    });
                    return;
                }

                // Dispatch bulk import
                dispatch(importProducts(products));
            } catch (err) {
                console.error(err);
                dispatch({ type: PRODUCT_ERROR, payload: "Failed to read Excel file" });
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleEdit = (productItem) => {
        setProductBrand(productItem.productBrandId || "");
        setProductCategory(productItem.productCategoryName || "");
        setProductSubCategory(productItem.productSubCategoryName || "");
        setProductUnit(productItem.productUnitId || "");
        setHsnCode(productItem.hsnCode || "");
        setProduct(productItem.product || "");
        setProductPrice(productItem.productPrice || "");
        setDescription(productItem.description || "");
        setEditId(productItem.id);
        setIsEditMode(true);
        setOpen(true);
    };

    const handleAdd = () => {
        submitProduct();
    };

    const handleUpdate = () => {
        submitProduct();
    };

    const submitProduct = () => {
        setCategoryError(false);
        setSubCategoryError(false);
        setError(false);

        const selectedBrand = productBrandList.find((b) => b.id === productBrand);
        const selectedCategory = productCategoryList.find((cat) => cat.productBrandId === productBrand && cat.categories.includes(productCategory));
        const selectedSubCategory = productSubCategoryList.find(
            (sub) =>
                sub.productBrandId === productBrand && sub.productCategoryName === productCategory && sub.subCategories.includes(productSubCategory),
        );
        const selectedUnit = productUnitList.find((u) => u.id === productUnit);

        let hasError = false;

        if (!selectedBrand) {
            setBrandError(true);
            hasError = true;
        }

        if (!selectedCategory) {
            setCategoryError(true);
            hasError = true;
        }

        if (!selectedSubCategory) {
            setSubCategoryError(true);
            hasError = true;
        }

        if (!hsnCode.trim()) {
            setError(true);
            hasError = true;
        }

        if (!productUnit) {
            setError(true);
            hasError = true;
        }

        if (!product) {
            setError(true);
            hasError = true;
        }

        if (hasError) {
            setLocalSnackbarMessage("Please Fill All Required Fields");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const payload = {
            productBrandId: selectedBrand?.id,
            productCategoryId: selectedCategory?.id,
            productSubCategoryId: selectedSubCategory?.id,
            productUnitId: selectedUnit?.id,
            productUnitName: selectedUnit?.productUnit,
            productCategoryName: productCategory,
            productSubCategoryName: productSubCategory,
            hsnCode,
            product: (Array.isArray(product) ? product[0] : product).trim(),
            productPrice: parseFloat(productPrice),
            description,
            date: getCurrentISTDateTime(),
        };

        if (isEditMode) {
            dispatch(updateProduct(editId, payload));
        } else {
            dispatch(createProduct(payload));
        }

        handleClose();
    };

    const handleDeleteClick = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteProduct(selectedDeleteId));
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

    return (
        <>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg lg:text-lg">Product :</div>
                        <Button
                            variant="gradient"
                            className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                            onClick={handleOpen}
                        >
                            <UserPlus size={20} />
                            Create Product
                        </Button>
                    </div>

                    <div className="mt-4 rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 p-6 text-center">
                        <div className="mb-4 text-lg font-medium text-gray-700">Import Products from Excel</div>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {/* Download Template */}
                            <button
                                onClick={handleDownloadProductTemplate}
                                className="flex items-center gap-2 text-nowrap rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm text-blue-700 hover:bg-blue-50 md:text-sm lg:text-base"
                            >
                                <File size={18} />
                                Download Sample Excel
                            </button>

                            {/* Upload File */}
                            <label className="flex cursor-pointer items-center gap-2 text-nowrap rounded-lg bg-[#053054] px-5 py-2.5 text-sm text-white hover:bg-[#04243f] md:text-sm lg:text-base">
                                <File size={18} />
                                Import Excel File
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleProductFileUpload}
                                />
                            </label>
                        </div>

                        <p className="mt-3 text-sm text-gray-500">Supported format: .xlsx, .xls • Max size: 5MB</p>
                    </div>

                    <div className="card-body p-0">
                        <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header text-nowrap bg-[#053054] text-white">
                                    <tr className="table-row">
                                        <th className="table-head border border-gray-300 capitalize">Sr. No.</th>
                                        <th className="table-head border border-gray-300 capitalize">Brand</th>
                                        <th className="table-head border border-gray-300 capitalize">Category</th>
                                        <th className="table-head border border-gray-300 capitalize">Sub-Category</th>
                                        <th className="table-head border border-gray-300 capitalize">Unit</th>
                                        <th className="table-head border border-gray-300 capitalize">HSN Code</th>
                                        <th className="table-head border border-gray-300 capitalize">Product</th>
                                        <th className="table-head border border-gray-300 capitalize">Price</th>
                                        <th className="table-head border border-gray-300 capitalize">Description</th>
                                        <th className="table-head border border-gray-300 capitalize">Date</th>
                                        <th className="table-head border border-gray-300 capitalize">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body text-[#433C50]">
                                    {Array.isArray(productList) && productList.length > 0 ? (
                                        productList.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="table-row"
                                            >
                                                <td className="table-cell border border-gray-300">{index + 1}</td>
                                                <td className="table-cell border border-gray-300">{item.brand}</td>
                                                <td className="table-cell border border-gray-300">{item.productCategoryName}</td>
                                                <td className="table-cell border border-gray-300">{item.productSubCategoryName}</td>
                                                <td className="table-cell border border-gray-300">{item.productUnitName}</td>
                                                <td className="table-cell border border-gray-300">{item.hsnCode}</td>
                                                <td className="table-cell border border-gray-300">{item.product}</td>
                                                <td className="table-cell border border-gray-300">{item.productPrice}</td>
                                                <td className="table-cell border border-gray-300">
                                                    <div className="w-[300px] whitespace-normal break-words text-justify">{item.description}</div>
                                                </td>
                                                <td className="table-cell border border-gray-300">{item.date}</td>
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="py-4 text-center text-gray-400"
                                            >
                                                No Products Added Yet.
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
                            {isEditMode ? "Update Product" : "Add Product"}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <X size={20} />
                        </IconButton>
                    </div>
                    <div>
                        <TextField
                            select
                            fullWidth
                            label="Product Brand *"
                            placeholder="Choose Product Brand"
                            value={productBrand}
                            onChange={(e) => {
                                setProductBrand(e.target.value);
                                setProductCategory("");
                                setProductSubCategory("");
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
                            {productBrandList.map((brand) => (
                                <MenuItem
                                    key={brand.id}
                                    value={brand.id}
                                >
                                    {brand.productBrand}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    <div className="mt-4">
                        <TextField
                            select
                            fullWidth
                            label="Product Category *"
                            placeholder="Choose Product Category"
                            value={productCategory}
                            onChange={(e) => {
                                setProductCategory(e.target.value);
                                setProductSubCategory("");
                                setCategoryError(false);
                            }}
                            error={categoryError}
                            size="small"
                            className="mt-4"
                        >
                            <MenuItem
                                value=""
                                disabled
                            >
                                Choose Product Category
                            </MenuItem>
                            {productCategoryList
                                .filter((cat) => cat.productBrandId === productBrand)
                                .flatMap((cat) =>
                                    (cat.categories || []).map((categoryName, index) => (
                                        <MenuItem
                                            key={`${cat.id}-${index}`}
                                            value={categoryName}
                                        >
                                            {categoryName}
                                        </MenuItem>
                                    )),
                                )}
                        </TextField>
                    </div>
                    <div className="mt-4">
                        <TextField
                            select
                            fullWidth
                            label="Product Subcategory *"
                            placeholder="Choose Subcategory"
                            value={productSubCategory}
                            onChange={(e) => {
                                setProductSubCategory(e.target.value);
                                setSubCategoryError(false);
                            }}
                            error={subCategoryError}
                            size="small"
                            className="mt-4"
                        >
                            <MenuItem
                                value=""
                                disabled
                            >
                                Choose Subcategory
                            </MenuItem>
                            {productSubCategoryList
                                .filter((sub) => sub.productBrandId === productBrand && sub.productCategoryName === productCategory)
                                .flatMap((sub) =>
                                    (sub.subCategories || []).map((subCatName, index) => (
                                        <MenuItem
                                            key={`${sub.id}-${index}`}
                                            value={subCatName}
                                        >
                                            {subCatName}
                                        </MenuItem>
                                    )),
                                )}
                        </TextField>
                    </div>
                    <div className="mt-4">
                        <TextField
                            select
                            fullWidth
                            label="Product Unit *"
                            placeholder="Choose Unit"
                            value={productUnit}
                            onChange={(e) => setProductUnit(e.target.value)}
                            error={error && !productUnit}
                            size="small"
                            className="mt-4"
                        >
                            <MenuItem
                                value=""
                                disabled
                            >
                                Choose Unit
                            </MenuItem>

                            {productUnitList.map((unit) => (
                                <MenuItem
                                    key={unit.id}
                                    value={unit.id}
                                >
                                    {unit.productUnit}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    <TextField
                        fullWidth
                        label="HSN Code *"
                        placeholder="Enter HSN Code "
                        variant="outlined"
                        error={error && !hsnCode.trim()}
                        value={hsnCode}
                        onChange={(e) => {
                            setHsnCode(e.target.value);
                            setError(false);
                        }}
                        sx={{ marginTop: "16px" }}
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Product Name *"
                        placeholder="Enter Product"
                        variant="outlined"
                        error={error && !product.trim()}
                        value={product}
                        onChange={(e) => {
                            setProduct(e.target.value);
                            setError(false);
                        }}
                        size="small"
                        sx={{ marginTop: "16px" }}
                    />

                    <TextField
                        fullWidth
                        label="Product Price *"
                        placeholder="Enter Product Price"
                        variant="outlined"
                        type="number"
                        error={error && (!productPrice || parseFloat(productPrice) <= 0)}
                        value={productPrice}
                        onChange={(e) => {
                            setProductPrice(e.target.value);
                            setError(false);
                        }}
                        onWheel={(e) => e.target.blur()}
                        inputProps={{
                            min: 0,
                            step: "0.01",
                            onKeyDown: (e) => {
                                if (e.key === "-" || e.key === "e") e.preventDefault();
                            },
                        }}
                        sx={{ marginTop: "16px" }}
                        size="small"
                    />

                    <Box sx={{ marginTop: "16px" }}>
                        <div className="mb-2 text-sm font-medium text-gray-700">Description</div>
                        <ReactQuill
                            value={description}
                            onChange={(value) => setDescription(value)}
                            theme="snow"
                            placeholder="Enter product description..."
                            className="bg-white"
                        />
                    </Box>

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

                    <Typography className="mb-6 justify-self-center text-[#433C50]">Are you sure, You want to delete this product?</Typography>

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

export default Product;
