import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCustomers } from "../../redux/actions/customer";
import { getCountry } from "../../redux/actions/country";
import { getZones } from "../../redux/actions/zones";
import { getProductBrand } from "../../redux/actions/productBrand";
import { getProductCategory } from "../../redux/actions/productCategory";
import { getProductSubCategory } from "../../redux/actions/productSubCategory";
import { getProduct } from "../../redux/actions/product";
import { getOrders } from "../../redux/actions/order";
import { clearSnackbar } from "../../redux/actions/commonActions";
import { updateInvoice, getInvoices } from "../../redux/actions/invoice";
import { Alert, Box, FormControlLabel, Radio, RadioGroup, Snackbar, TextField, CircularProgress, Autocomplete, Checkbox } from "@mui/material";
import { Button } from "@material-tailwind/react";
import { Search } from "lucide-react";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { getPrefix } from "../../redux/actions/prefix";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getDefaultTAndCAndDec } from "../../redux/actions/tAndCAndDec";

const EditInvoice = ({ documentType = "final" }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isProforma = documentType === "proforma";
    const basePath = isProforma ? "/proforma-invoice" : "/invoice";
    const documentLabel = isProforma ? "Proforma Invoice" : "Invoice";
    const [form, setForm] = useState({
        selectedCompany: "",
        date: "",
        customerPerson: "",
        email: "",
        code: "",
        mobile: "",
        productBrand: "",
        productCategory: "",
        productSubCategory: "",
        product: "",
        hsnCode: "",
        quantity: "1",
        unit: "",
        description: "",
        pricePerUnit: "",
        subTotal: "",
        gstinType: "Intrastate",
        cgst: "",
        sgst: "",
        igst: "",
        cgstAmt: "",
        sgstAmt: "",
        igstAmt: "",
        discount: "",
        total: "",
        finalAmt: "",
        billingAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
            zone: "",
        },
        shippingAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
            zone: "",
        },
        termsAndConditions: "",
    });
    const [invoiceType, setInvoiceType] = useState("order");
    const [orderNo, setOrderNo] = useState("");
    const { customers } = useSelector((state) => state.customer);
    const { country } = useSelector((state) => state.country);
    const { zones } = useSelector((state) => state.zones);
    const { productBrand } = useSelector((state) => state.productBrand);
    const { productCategory } = useSelector((state) => state.productCategory);
    const { productSubCategory } = useSelector((state) => state.productSubCategory);
    const { product } = useSelector((state) => state.product);
    const { orders } = useSelector((state) => state.order);
    const [errors, setErrors] = useState({});
    const { invoices, snackbarMessage, snackbarSeverity } = useSelector((state) => state.invoice);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [filteredBillingZones, setFilteredBillingZones] = useState([]);
    const [filteredShippingZones, setFilteredShippingZones] = useState([]);
    const [manualCustomerDetails, setManualCustomerDetails] = useState({ email: "", code: "", mobile: "" });
    const [copyShippingSameAsBilling, setCopyShippingSameAsBilling] = useState(false);
    const [filteredPersons, setFilteredPersons] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [selectedCompanyOption, setSelectedCompanyOption] = useState(null);
    const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
    const [businessMode, setBusinessMode] = useState("B2B"); // "B2B" or "B2C"
    const [customerNameOptions, setCustomerNameOptions] = useState([]);
    const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
    const { prefix } = useSelector((state) => state.prefix);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(getCustomers()),
                    dispatch(getCountry()),
                    dispatch(getZones()),
                    dispatch(getProductBrand()),
                    dispatch(getProductCategory()),
                    dispatch(getProductSubCategory()),
                    dispatch(getProduct()),
                    dispatch(getOrders()),
                    dispatch(getPrefix()),
                    dispatch(getInvoices(documentType)),
                ]);
            } finally {
                setInitialLoad(false);
            }
        };

        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);

            // If it's a success message, trigger the button blur + loader
            if (snackbarSeverity === "success") {
                setIsSubmittingSuccessfully(true);
            }
        } else {
            // When snackbar is cleared (after navigation), reset the state
            setIsSubmittingSuccessfully(false);
        }
    }, [snackbarMessage, snackbarSeverity]);

    const { defaultEntries } = useSelector((state) => state.tAndCAndDec);

    useEffect(() => {
        dispatch(getDefaultTAndCAndDec("invoice_terms"));
    }, [dispatch]);

    useEffect(() => {
        if (!id && defaultEntries?.invoice_terms?.content && !form.termsAndConditions) {
            setForm((prev) => ({
                ...prev,
                termsAndConditions: defaultEntries.invoice_terms.content,
            }));
        }
    }, [defaultEntries, id]);

    useEffect(() => {
        if (id) {
            dispatch(getInvoices(documentType));
        }
    }, [id, dispatch]);

    // this useEffect to validate the order status when editing an existing invoice
    useEffect(() => {
        if (id && invoices.length > 0 && orders.length > 0) {
            const currentInvoice = invoices.find((inv) => String(inv.id) === String(id));
            if (!isProforma && currentInvoice && currentInvoice.orderId) {
                const associatedOrder = orders.find((order) => order.id === currentInvoice.orderId);
                if (associatedOrder && associatedOrder.status !== "Completed") {
                    setLocalSnackbarMessage(`Warning: Associated order is ${associatedOrder.status}. Invoice may not be editable.`);
                    setLocalSnackbarSeverity("warning");
                    setSnackbarOpen(true);
                }
            }
        }
    }, [id, invoices, orders]);

    useEffect(() => {
        if (copyShippingSameAsBilling) {
            setForm((prev) => ({
                ...prev,
                shippingAddress: { ...prev.billingAddress },
            }));
            setFilteredShippingZones([...filteredBillingZones]);
        }
    }, [copyShippingSameAsBilling, form.billingAddress, filteredBillingZones]);

    useEffect(() => {
        if (
            !id ||
            !Array.isArray(invoices) ||
            invoices.length === 0 ||
            customers.length === 0 ||
            country.length === 0 ||
            zones.length === 0 ||
            companyOptions.length === 0 ||
            customerNameOptions.length === 0
        )
            return;

        const invoiceData = invoices.find((inv) => String(inv.id) === String(id));
        if (!invoiceData) return;

        const savedCompanyName = invoiceData.selectedCompany?.trim() || "";
        const savedCustomerName = invoiceData.customerPerson?.trim() || "";

        // === 1. AUTO DETECT BUSINESS MODE (B2B vs B2C) ===
        let detectedMode = "B2B";

        if (savedCompanyName && savedCustomerName) {
            const matchingCustomerRecord = customers.find((cust) => {
                const companyMatch = cust.companyName?.trim() === savedCompanyName;
                if (!companyMatch) return false;

                const mainFullName = [cust.salutation || "", cust.firstName || "", cust.middleName || "", cust.lastName || ""]
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

                if (mainFullName === savedCustomerName) return true;

                return (cust.contacts || []).some((contact) => {
                    const full = [contact.salutation || "", contact.firstName || "", contact.middleName || "", contact.lastName || ""]
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();
                    return full === savedCustomerName;
                });
            });

            detectedMode = matchingCustomerRecord ? "B2B" : "B2C";
        } else if (savedCustomerName) {
            detectedMode = "B2C";
        }

        setBusinessMode(detectedMode);

        // === 2. MOBILE & EMAIL PARSING ===
        const rawMobile = invoiceData.mobile || "";
        const [code = "", ...mobileParts] = rawMobile.split(" ");
        const mobileNumber = mobileParts.join(" ");

        // === 3. ADDRESS ZONES ===
        const billingCountryId = country.find((c) => c.country === invoiceData.billingAddress?.country)?.id || "";
        const shippingCountryId = country.find((c) => c.country === invoiceData.shippingAddress?.country)?.id || "";

        const billingZones = zones.find((z) => z.countryId === billingCountryId)?.zones || [];
        const shippingZones = zones.find((z) => z.countryId === shippingCountryId)?.zones || [];

        setFilteredBillingZones(billingZones);
        setFilteredShippingZones(shippingZones);

        // === 4. PREFILL BASIC FORM FIELDS ===
        setForm((prev) => ({
            ...prev,
            selectedCompany: savedCompanyName,
            customerPerson: savedCustomerName,
            email: invoiceData.email || "",
            code,
            mobile: mobileNumber,
            date: invoiceData.date ? invoiceData.date.split("-").reverse().join("-") : "",
            gstinType: invoiceData.gstinType || "Intrastate",
            finalAmt: invoiceData.finalAmt || "",
            termsAndConditions: invoiceData.termsAndConditions || "",
            billingAddress: {
                street: invoiceData.billingAddress?.street || "",
                city: invoiceData.billingAddress?.city || "",
                state: invoiceData.billingAddress?.state || "",
                pincode: invoiceData.billingAddress?.pincode || "",
                country: billingCountryId,
                zone: invoiceData.billingAddress?.zone || "",
            },
            shippingAddress: {
                street: invoiceData.shippingAddress?.street || "",
                city: invoiceData.shippingAddress?.city || "",
                state: invoiceData.shippingAddress?.state || "",
                pincode: invoiceData.shippingAddress?.pincode || "",
                country: shippingCountryId,
                zone: invoiceData.shippingAddress?.zone || "",
            },
        }));

        // === 5. LOAD PRODUCT DETAILS ===
        const productDetails = invoiceData.productInvoiceDetails || { intrastate: [], interstate: [] };
        setIntrastateProducts(productDetails.intrastate || []);
        setInterstateProducts(productDetails.interstate || []);

        localStorage.setItem(
            "productInvoiceDetails",
            JSON.stringify({
                intrastate: productDetails.intrastate || [],
                interstate: productDetails.interstate || [],
            }),
        );

        // === 6. PREFILL B2B: COMPANY AUTOCOMPLETE ===
        if (detectedMode === "B2B" && savedCompanyName) {
            let matchingCompanyOption = null;

            // Prefer match where saved customer name is in contact list
            if (savedCustomerName) {
                matchingCompanyOption = companyOptions.find(
                    (opt) => opt.companyName === savedCompanyName && opt.contactList.some((name) => name.trim() === savedCustomerName),
                );
            }

            // Fallback: just match company name
            if (!matchingCompanyOption) {
                matchingCompanyOption = companyOptions.find((opt) => opt.companyName === savedCompanyName);
            }

            // Ultimate fallback if customer was deleted
            if (!matchingCompanyOption) {
                matchingCompanyOption = {
                    label: savedCompanyName,
                    value: null,
                    companyName: savedCompanyName,
                    industry: "",
                    mainContactName: savedCustomerName || "",
                    contactList: savedCustomerName ? [savedCustomerName] : [],
                    fullRecord: { companyName: savedCompanyName },
                };
            }

            setSelectedCompanyOption(matchingCompanyOption);
            setAvailableCustomerNames(matchingCompanyOption.contactList);

            // Ensure saved customer name shows even if slight mismatch
            if (savedCustomerName && !matchingCompanyOption.contactList.includes(savedCustomerName)) {
                setAvailableCustomerNames((prev) => [...new Set([...prev, savedCustomerName])]);
            }
        }
        // === 7. PREFILL B2C: CUSTOMER NAME AUTOCOMPLETE ===
        else if (detectedMode === "B2C" && savedCustomerName) {
            const matchingCustomerOption = customerNameOptions.find((opt) => opt.label.trim() === savedCustomerName);

            if (matchingCustomerOption) {
                setSelectedCustomerOption(matchingCustomerOption);
            } else {
                // Fallback: customer might have been deleted
                const tempOption = {
                    id: -1,
                    label: savedCustomerName,
                    value: savedCustomerName,
                    record: null,
                    contactPerson: null,
                    isMainContact: true,
                    mobile: rawMobile,
                    email: invoiceData.email || "",
                };
                setSelectedCustomerOption(tempOption);
            }
        } else {
            // No valid data → clear selections
            setSelectedCompanyOption(null);
            setSelectedCustomerOption(null);
            setAvailableCustomerNames([]);
        }
    }, [id, invoices, customers, country, zones, companyOptions, customerNameOptions]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        setForm((prev) => ({ ...prev, date: formattedDate }));
    }, []);

    useEffect(() => {
        // Remove stored productInvoiceDetails on page reload
        localStorage.removeItem("productInvoiceDetails");
    }, []);

    const [intrastateProducts, setIntrastateProducts] = useState([]);
    const [interstateProducts, setInterstateProducts] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("productInvoiceDetails"));
        if (saved) {
            setIntrastateProducts(saved.intrastate || []);
            setInterstateProducts(saved.interstate || []);
        }
    }, []);

    useEffect(() => {
        const quantity = parseFloat(form.quantity);
        const price = parseFloat(form.pricePerUnit);

        if (!isNaN(quantity) && !isNaN(price)) {
            const subTotal = quantity * price;
            setForm((prev) => ({ ...prev, subTotal: subTotal.toFixed(2) }));
        } else {
            setForm((prev) => ({ ...prev, subTotal: "" }));
        }
    }, [form.quantity, form.pricePerUnit]);

    useEffect(() => {
        const subTotal = parseFloat(form.subTotal) || 0;
        const cgst = parseFloat(form.cgst) || 0;
        const sgst = parseFloat(form.sgst) || 0;
        const igst = parseFloat(form.igst) || 0;
        const discount = parseFloat(form.discount) || 0;

        let totalBeforeDiscount = subTotal;

        if (form.gstinType === "Intrastate") {
            const cgstAmt = (subTotal * cgst) / 100;
            const sgstAmt = (subTotal * sgst) / 100;
            totalBeforeDiscount = subTotal + cgstAmt + sgstAmt;
            const discountedTotal = discount ? totalBeforeDiscount - (totalBeforeDiscount * discount) / 100 : totalBeforeDiscount;
            setForm((prev) => ({
                ...prev,
                cgstAmt: cgstAmt.toFixed(2),
                sgstAmt: sgstAmt.toFixed(2),
                total: discountedTotal.toFixed(2),
            }));
        } else if (form.gstinType === "Interstate") {
            const igstAmt = (subTotal * igst) / 100;
            totalBeforeDiscount = subTotal + igstAmt;
            const discountedTotal = discount ? totalBeforeDiscount - (totalBeforeDiscount * discount) / 100 : totalBeforeDiscount;
            setForm((prev) => ({
                ...prev,
                igstAmt: igstAmt.toFixed(2),
                total: discountedTotal.toFixed(2),
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                cgstAmt: "",
                sgstAmt: "",
                igstAmt: "",
                total: subTotal.toFixed(2),
            }));
        }
    }, [form.subTotal, form.cgst, form.sgst, form.igst, form.gstinType, form.discount]);

    useEffect(() => {
        const totalIntrastate = intrastateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        const totalInterstate = interstateProducts.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        const finalAmt = totalIntrastate + totalInterstate;

        setForm((prev) => ({
            ...prev,
            finalAmt: finalAmt.toFixed(2),
        }));
    }, [intrastateProducts, interstateProducts]);

    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const handleChange = (field) => (e) => {
        const value = e.target.value;

        setForm((prevForm) => {
            const updatedForm = { ...prevForm, [field]: value };

            if (field === "productBrand") {
                // Filter categories for selected brand
                const matchedBrand = productCategory.find((item) => item.brand === value);
                setFilteredCategories(matchedBrand?.categories || []);

                // Reset dependent fields
                updatedForm.productCategory = "";
                updatedForm.productSubCategory = "";
                updatedForm.product = "";
                updatedForm.hsnCode = "";
                setFilteredSubCategories([]);
                setFilteredProducts([]);
            }

            if (field === "productCategory") {
                // Filter subcategories for selected brand + category
                const matchedSubCat = productSubCategory.find((item) => item.brand === form.productBrand && item.productCategoryName === value);
                setFilteredSubCategories(matchedSubCat?.subCategories || []);

                updatedForm.productSubCategory = "";
                updatedForm.product = "";
                updatedForm.hsnCode = "";
                setFilteredProducts([]);
            }

            if (field === "productSubCategory") {
                // Filter products for selected brand + category + subcategory
                const matchedProducts = product.filter(
                    (item) =>
                        item.brand === form.productBrand &&
                        item.productCategoryName === form.productCategory &&
                        item.productSubCategoryName === value,
                );

                const formatted = matchedProducts.flatMap((prod) =>
                    Array.isArray(prod.product)
                        ? prod.product.map((pName) => ({
                              name: pName,
                              hsnCode: prod.hsnCode,
                              description: prod.description,
                              unit: prod.productUnitName,
                              productPrice: prod.productPrice,
                          }))
                        : [],
                );

                setFilteredProducts(formatted);
                updatedForm.product = "";
                updatedForm.hsnCode = "";
                updatedForm.description = "";
                updatedForm.unit = "";
            }

            if (field === "product") {
                const selected = filteredProducts.find((p) => p.name === value);
                updatedForm.hsnCode = selected?.hsnCode || "";
                updatedForm.description = selected?.description || "";
                updatedForm.unit = selected?.unit || "";
                updatedForm.pricePerUnit = selected?.productPrice || "";
            }

            return updatedForm;
        });

        setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    };

    const clearCustomerData = () => {
        setSelectedCompanyOption(null);
        setAvailableCustomerNames([]);
        setFilteredPersons([]);
        setForm((prev) => ({
            ...prev,
            selectedCompany: "",
            customerPerson: "",
            email: "",
            code: "",
            mobile: "",
            billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
        }));
        setManualCustomerDetails({ email: "", code: "", mobile: "" });
        setFilteredBillingZones([]);
        setFilteredShippingZones([]);
        setCopyShippingSameAsBilling(false);
    };

    useEffect(() => {
        if (customers.length > 0) {
            const options = customers
                .filter((cust) => {
                    // Only include customers who have a valid company name (for B2B)
                    return cust.companyName && cust.companyName.trim() !== "";
                })
                .map((cust) => {
                    const industryPart = cust.industry ? ` (${cust.industry})` : "";
                    const cleanLabel = `${cust.companyName.trim()}${industryPart}`;

                    // Collect all contact full names
                    const contactNames = new Set();
                    const mainFullName = [cust.salutation || "", cust.firstName || "", cust.middleName || "", cust.lastName || ""]
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (mainFullName) contactNames.add(mainFullName);

                    (cust.contacts || []).forEach((contact) => {
                        const full = [contact.salutation || "", contact.firstName || "", contact.middleName || "", contact.lastName || ""]
                            .join(" ")
                            .replace(/\s+/g, " ")
                            .trim();
                        if (full) contactNames.add(full);
                    });

                    return {
                        label: cleanLabel,
                        value: cust.id,
                        recordId: cust.id,
                        companyName: cust.companyName.trim(),
                        industry: cust.industry || "",
                        mainContactName: mainFullName,
                        contactList: Array.from(contactNames),
                        fullRecord: cust,
                    };
                });

            // Handle duplicates (same company name + industry)
            const seen = new Set();
            const uniqueOptions = [];
            const duplicateMap = {};

            options.forEach((opt) => {
                if (seen.has(opt.label)) {
                    duplicateMap[opt.label] = (duplicateMap[opt.label] || 0) + 1;
                } else {
                    seen.add(opt.label);
                }
                uniqueOptions.push(opt);
            });

            const finalOptions = uniqueOptions.map((opt) => {
                if (duplicateMap[opt.label] > 1) {
                    const count = options.filter((o) => o.label === opt.label).indexOf(opt) + 1;
                    return { ...opt, label: `${opt.label} (${count})` };
                }
                return opt;
            });

            finalOptions.sort((a, b) => a.label.localeCompare(b.label));
            setCompanyOptions(finalOptions);
        } else {
            setCompanyOptions([]);
        }
    }, [customers]);

    useEffect(() => {
        if (customers.length > 0) {
            const options = [];
            let optionIdCounter = 0;

            customers.forEach((cust) => {
                const addPerson = (person, isMain = false) => {
                    const fullName = [person.salutation || "", person.firstName || "", person.middleName || "", person.lastName || ""]
                        .join(" ")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (!fullName) return;

                    options.push({
                        id: optionIdCounter++, // unique id for Autocomplete comparison
                        label: fullName,
                        value: fullName,
                        record: cust, // full customer record
                        contactPerson: isMain ? null : person,
                        isMainContact: isMain,
                        mobile: isMain ? cust.mobile || "" : person.mobile || cust.mobile || "",
                        email: isMain ? cust.email || "" : person.email || cust.email || "",
                    });
                };

                // Main contact
                addPerson(cust, true);

                // Additional contacts
                (cust.contacts || []).forEach((contact) => {
                    addPerson(contact, false);
                });
            });

            options.sort((a, b) => a.label.localeCompare(b.label));
            setCustomerNameOptions(options);
        } else {
            setCustomerNameOptions([]);
        }
    }, [customers]);

    const handleCompanySelect = (newValue) => {
        if (!newValue) {
            // Clear everything
            setSelectedCompanyOption(null);
            setAvailableCustomerNames([]);
            setFilteredPersons([]);
            setForm((prev) => ({
                ...prev,
                selectedCompany: "",
                customerPerson: "",
                email: "",
                code: "",
                mobile: "",
                billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
                shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            }));
            setManualCustomerDetails({ email: "", code: "", mobile: "" });
            setFilteredBillingZones([]);
            setFilteredShippingZones([]);
            return;
        }

        const cust = newValue.fullRecord;
        setSelectedCompanyOption(newValue);
        setForm((prev) => ({ ...prev, selectedCompany: cust.companyName }));

        // Set available customer names
        setAvailableCustomerNames(newValue.contactList);

        // Find country IDs
        const getCountryId = (name) => country.find((c) => c.country === name)?.id || "";
        const billingCountryId = getCountryId(cust.billingCountry);
        const shippingCountryId = getCountryId(cust.shippingCountry);

        // Set zones
        const billingZoneData = zones.find((z) => z.countryId === billingCountryId);
        const shippingZoneData = zones.find((z) => z.countryId === shippingCountryId);
        setFilteredBillingZones(billingZoneData?.zones || []);
        setFilteredShippingZones(shippingZoneData?.zones || []);

        // Set addresses
        setForm((prev) => ({
            ...prev,
            billingAddress: {
                street: cust.billingStreet || "",
                city: cust.billingCity || "",
                state: cust.billingState || "",
                pincode: cust.billingPincode || "",
                country: billingCountryId,
                zone: cust.billingZone || "",
            },
            shippingAddress: {
                street: cust.shippingStreet || "",
                city: cust.shippingCity || "",
                state: cust.shippingState || "",
                pincode: cust.shippingPincode || "",
                country: shippingCountryId,
                zone: cust.shippingZone || "",
            },
        }));

        // Auto-select main contact if exists
        if (newValue.contactList.length > 0) {
            const defaultName = newValue.mainContactName || newValue.contactList[0];
            handleCustomerSelect(defaultName, cust); // We'll define this next
        }
    };

    const handleCustomerSelect = (customerName, companyRecord = selectedCompanyOption?.fullRecord) => {
        if (!customerName || !companyRecord) {
            setForm((prev) => ({ ...prev, customerPerson: "", email: "", code: "", mobile: "" }));
            setManualCustomerDetails({ email: "", code: "", mobile: "" });
            return;
        }

        let matchedContact = null;

        // First check main record
        const mainFullName = [
            companyRecord.salutation || "",
            companyRecord.firstName || "",
            companyRecord.middleName || "",
            companyRecord.lastName || "",
        ]
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        if (mainFullName === customerName) {
            matchedContact = companyRecord;
        } else {
            // Search in contacts array
            matchedContact = companyRecord.contacts?.find((contact) => {
                const full = [contact.salutation || "", contact.firstName || "", contact.middleName || "", contact.lastName || ""]
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();
                return full === customerName;
            });
            if (matchedContact) {
                // Use contact's own email/mobile if available, fallback to main
                matchedContact = {
                    ...matchedContact,
                    email: matchedContact.email || companyRecord.email || "",
                    mobile: matchedContact.mobile || companyRecord.mobile || "",
                };
            }
        }

        if (matchedContact) {
            const rawMobile = matchedContact.mobile || "";
            const [code = "", ...mobileParts] = rawMobile.split(" ");
            const mobileNumber = mobileParts.join(" ");

            setForm((prev) => ({
                ...prev,
                customerPerson: customerName,
                email: matchedContact.email || "",
                code,
                mobile: mobileNumber,
            }));

            setManualCustomerDetails({
                email: matchedContact.email || "",
                code,
                mobile: mobileNumber,
            });
        }

        setErrors((prev) => ({ ...prev, customerPerson: false }));
    };

    const orderPrefix = prefix?.orderPrefix || "";

    // // old
    // const handleOrderSearch = () => {
    //     if (!orderNo.trim()) {
    //         setErrors((prev) => ({ ...prev, orderNo: true }));
    //         setLocalSnackbarMessage("Order number is required");
    //         setLocalSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //         return;
    //     }

    //     const fullOrderNo = orderNo.trim().toUpperCase().split("-").pop();

    //     const orderData = orders.find((o) => o.orderNo === fullOrderNo);

    //     if (!orderData) {
    //         setLocalSnackbarMessage("Order not found!");
    //         setLocalSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //         return;
    //     }

    //     // Check if order is Canceled
    //     if (orderData.status === "Canceled" || orderData.status === "cancelled") {
    //         setLocalSnackbarMessage("This order is Canceled. Invoice cannot be generated.");
    //         setLocalSnackbarSeverity("warning");
    //         setSnackbarOpen(true);
    //         setOrderNo(""); // Optional: clear input
    //         return;
    //     }

    //     // Proceed only if order is NOT canceled
    //     const { productOrderDetails } = orderData || {};
    //     const intrastate = productOrderDetails?.intrastate || [];
    //     const interstate = productOrderDetails?.interstate || [];

    //     localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate, interstate }));
    //     setIntrastateProducts(intrastate);
    //     setInterstateProducts(interstate);

    //     // Split mobile into code and number
    //     const rawMobile = orderData.mobile || "";
    //     const [code, ...mobileParts] = rawMobile.split(" ");
    //     const mobileNumber = mobileParts.join(" ");

    //     const selectedBillingCountry = country.find((c) => c.country === orderData.billingAddress?.country);
    //     const selectedShippingCountry = country.find((c) => c.country === orderData.shippingAddress?.country);
    //     const billingZoneData = zones.find((z) => z.countryId === selectedBillingCountry?.id);
    //     const shippingZoneData = zones.find((z) => z.countryId === selectedShippingCountry?.id);

    //     setFilteredBillingZones(billingZoneData?.zones || []);
    //     setFilteredShippingZones(shippingZoneData?.zones || []);

    //     setForm((prevForm) => ({
    //         ...prevForm,
    //         selectedCompany: orderData.selectedCompany || "",
    //         date: prevForm.date || orderData.date || "",
    //         customerPerson: orderData.customerPerson || "",
    //         email: orderData.email || "",
    //         code: code || "",
    //         mobile: mobileNumber || "",
    //         billingAddress: {
    //             street: orderData.billingAddress?.street || "",
    //             city: orderData.billingAddress?.city || "",
    //             state: orderData.billingAddress?.state || "",
    //             pincode: orderData.billingAddress?.pincode || "",
    //             country: selectedBillingCountry?.id || "",
    //             zone: billingZoneData?.zones?.includes(orderData.billingAddress?.zone) ? orderData.billingAddress.zone : "",
    //         },
    //         shippingAddress: {
    //             street: orderData.shippingAddress?.street || "",
    //             city: orderData.shippingAddress?.city || "",
    //             state: orderData.shippingAddress?.state || "",
    //             pincode: orderData.shippingAddress?.pincode || "",
    //             country: selectedShippingCountry?.id || "",
    //             zone: shippingZoneData?.zones?.includes(orderData.shippingAddress?.zone) ? orderData.shippingAddress.zone : "",
    //         },
    //         productCategory: "",
    //         productSubCategory: "",
    //         product: "",
    //         quantity: "",
    //         pricePerUnit: "",
    //     }));

    //     setErrors({});
    //     setLocalSnackbarMessage("Order loaded successfully!");
    //     setLocalSnackbarSeverity("success");
    //     setSnackbarOpen(true);
    // };

    const handleOrderSearch = () => {
        if (!orderNo.trim()) {
            setErrors((prev) => ({ ...prev, orderNo: true }));
            setLocalSnackbarMessage("Order number is required");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const fullOrderNo = orderNo.trim().toUpperCase().split("-").pop();
        const orderData = orders.find((o) => o.orderNo === fullOrderNo);

        if (!orderData) {
            setLocalSnackbarMessage("Order not found!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // ✅ Check 1: Only allow if order status is "Completed"
        if (orderData.status !== "Completed") {
            setLocalSnackbarMessage(
                `This order is ${orderData.status}. Invoice cannot be generated/updated. Only "Completed" orders can have invoices.`,
            );
            setLocalSnackbarSeverity("warning");
            setSnackbarOpen(true);
            setOrderNo(`${orderPrefix}-`);
            return;
        }

        // ✅ Check 2: Check if invoice already exists for this order
        const existingInvoice = invoices.find((inv) => inv.orderId === orderData.id || (inv.orderNo && inv.orderNo === orderData.orderNo));

        if (!existingInvoice) {
            setLocalSnackbarMessage(`No invoice found for this order! Please generate an invoice first from the Generate Invoice page.`);
            setLocalSnackbarSeverity("warning");
            setSnackbarOpen(true);
            setOrderNo(`${orderPrefix}-`);
            return;
        }

        // ✅ Check 3: If editing, make sure we're editing the correct invoice
        // If current invoice ID doesn't match the found invoice, show error
        if (existingInvoice.id !== parseInt(id)) {
            setLocalSnackbarMessage(
                `This order has a different invoice (Invoice #${existingInvoice.invoiceNo}). You are currently editing a different invoice.`,
            );
            setLocalSnackbarSeverity("warning");
            setSnackbarOpen(true);
            setOrderNo(`${orderPrefix}-`);
            return;
        }

        // Proceed with loading order data for editing
        const { productOrderDetails } = orderData || {};
        const intrastate = productOrderDetails?.intrastate || [];
        const interstate = productOrderDetails?.interstate || [];

        localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate, interstate }));
        setIntrastateProducts(intrastate);
        setInterstateProducts(interstate);

        // Split mobile into code and number
        const rawMobile = orderData.mobile || "";
        const [code, ...mobileParts] = rawMobile.split(" ");
        const mobileNumber = mobileParts.join(" ");

        const selectedBillingCountry = country.find((c) => c.country === orderData.billingAddress?.country);
        const selectedShippingCountry = country.find((c) => c.country === orderData.shippingAddress?.country);
        const billingZoneData = zones.find((z) => z.countryId === selectedBillingCountry?.id);
        const shippingZoneData = zones.find((z) => z.countryId === selectedShippingCountry?.id);

        setFilteredBillingZones(billingZoneData?.zones || []);
        setFilteredShippingZones(shippingZoneData?.zones || []);

        setForm((prevForm) => ({
            ...prevForm,
            selectedCompany: orderData.selectedCompany || "",
            date: prevForm.date || orderData.date || "",
            customerPerson: orderData.customerPerson || "",
            email: orderData.email || "",
            code: code || "",
            mobile: mobileNumber || "",
            billingAddress: {
                street: orderData.billingAddress?.street || "",
                city: orderData.billingAddress?.city || "",
                state: orderData.billingAddress?.state || "",
                pincode: orderData.billingAddress?.pincode || "",
                country: selectedBillingCountry?.id || "",
                zone: billingZoneData?.zones?.includes(orderData.billingAddress?.zone) ? orderData.billingAddress.zone : "",
            },
            shippingAddress: {
                street: orderData.shippingAddress?.street || "",
                city: orderData.shippingAddress?.city || "",
                state: orderData.shippingAddress?.state || "",
                pincode: orderData.shippingAddress?.pincode || "",
                country: selectedShippingCountry?.id || "",
                zone: shippingZoneData?.zones?.includes(orderData.shippingAddress?.zone) ? orderData.shippingAddress.zone : "",
            },
            productCategory: "",
            productSubCategory: "",
            product: "",
            quantity: "",
            pricePerUnit: "",
        }));

        setErrors({});
        setLocalSnackbarMessage("Order loaded successfully for editing!");
        setLocalSnackbarSeverity("success");
        setSnackbarOpen(true);
    };

    useEffect(() => {
        setOrderNo(`${orderPrefix}-`);
    }, [orderPrefix]);

    const handleAddressChange = (type, field) => (e, value) => {
        if (field === "country") {
            const selectedCountry = value;
            const countryId = selectedCountry?.id;

            setForm((prev) => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: countryId,
                    zone: "", // reset zone when country changes
                },
            }));

            const zoneData = zones.find((z) => z.countryId === countryId);

            if (type === "billingAddress") {
                setFilteredBillingZones(zoneData ? zoneData.zones : []);
            } else {
                setFilteredShippingZones(zoneData ? zoneData.zones : []);
            }
        } else {
            const valueToUse = e?.target?.value || value;
            setForm((prev) => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: valueToUse,
                },
            }));
        }
    };

    const validateFieldsForAddHandler = () => {
        let tempErrors = {};
        let hasError = false;

        if (!form.productBrand) {
            tempErrors.productBrand = true;
            hasError = true;
        }
        if (!form.productCategory) {
            tempErrors.productCategory = true;
            hasError = true;
        }
        if (!form.productSubCategory) {
            tempErrors.productSubCategory = true;
            hasError = true;
        }
        if (!form.product) {
            tempErrors.product = true;
            hasError = true;
        }
        if (!form.quantity) {
            tempErrors.quantity = true;
            hasError = true;
        }
        if (!form.unit) {
            tempErrors.unit = true;
            hasError = true;
        }
        if (!form.pricePerUnit) {
            tempErrors.pricePerUnit = true;
            hasError = true;
        }
        if (form.gstinType === "Intrastate") {
            if (!form.cgst) {
                tempErrors.cgst = true;
                hasError = true;
            }
            if (!form.sgst) {
                tempErrors.sgst = true;
                hasError = true;
            }
        } else if (form.gstinType === "Interstate") {
            if (!form.igst) {
                tempErrors.igst = true;
                hasError = true;
            }
        }

        setErrors(tempErrors);
        return !hasError;
    };

    const [editProductDetailsIndex, setEditProductDetailsIndex] = useState(null);
    const [editProductDetailsType, setEditProductDetailsType] = useState("");

    const handleSaveProductDetails = () => {
        if (!validateFieldsForAddHandler()) return;

        const newEntry = {
            productBrand: form.productBrand,
            productCategory: form.productCategory,
            productSubCategory: form.productSubCategory,
            product: form.product,
            hsnCode: form.hsnCode,
            quantity: form.quantity,
            unit: form.unit,
            description: form.description,
            pricePerUnit: form.pricePerUnit,
            subTotal: form.subTotal,
            gstinType: form.gstinType,
            cgst: form.cgst,
            sgst: form.sgst,
            igst: form.igst,
            cgstAmt: form.cgstAmt,
            sgstAmt: form.sgstAmt,
            igstAmt: form.igstAmt,
            discount: form.discount,
            total: form.total,
        };

        if (editProductDetailsIndex !== null) {
            // Update logic
            if (editProductDetailsType === "Intrastate") {
                const updated = [...intrastateProducts];
                updated[editProductDetailsIndex] = newEntry;
                setIntrastateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts];
                updated[editProductDetailsIndex] = newEntry;
                setInterstateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
            }

            setEditProductDetailsIndex(null);
            setEditProductDetailsType("");
        } else {
            // Add logic
            if (form.gstinType === "Intrastate") {
                const updated = [...intrastateProducts, newEntry];
                setIntrastateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
            } else {
                const updated = [...interstateProducts, newEntry];
                setInterstateProducts(updated);
                localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
            }
        }

        // Reset fields after Add or Update
        setForm((prevForm) => ({
            ...prevForm,
            productBrand: "",
            productCategory: "",
            productSubCategory: "",
            product: "",
            hsnCode: "",
            quantity: "",
            unit: "",
            description: "",
            pricePerUnit: "",
            subTotal: "",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
            discount: "",
            total: "",
        }));
    };

    const handleResetProductDetails = () => {
        setForm((prevForm) => ({
            ...prevForm,
            productBrand: "",
            productCategory: "",
            productSubCategory: "",
            product: "",
            hsnCode: "",
            quantity: "",
            unit: "",
            description: "",
            pricePerUnit: "",
            subTotal: "",
            discount: "",
            total: "",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
        }));
        setEditProductDetailsIndex(null);
        setEditProductDetailsType("");
    };

    const handleEditProductDetails = (index, gstinType) => {
        const isIntrastate = gstinType === "Intrastate";
        const item = isIntrastate ? intrastateProducts[index] : interstateProducts[index];

        setEditProductDetailsIndex(index);
        setEditProductDetailsType(item.gstinType);

        // Step 1: Filter categories for the brand
        const matchedBrand = productCategory.find((cat) => cat.brand === item.productBrand);
        setFilteredCategories(matchedBrand?.categories || []);

        // Step 2: Filter subcategories for the brand + category
        const matchedSubCat = productSubCategory.find((sub) => sub.brand === item.productBrand && sub.productCategoryName === item.productCategory);
        setFilteredSubCategories(matchedSubCat?.subCategories || []);

        // Step 3: Filter products for brand + category + subcategory
        const matchedProducts = product.filter(
            (p) =>
                p.brand === item.productBrand &&
                p.productCategoryName === item.productCategory &&
                p.productSubCategoryName === item.productSubCategory,
        );

        const formattedProducts = matchedProducts.flatMap((prod) =>
            Array.isArray(prod.product) // 🔥 FIX → use `prod.product` (same as in handleChange)
                ? prod.product.map((pName) => ({
                      name: pName,
                      hsnCode: prod.hsnCode,
                      description: prod.description, // ✅ include description
                      unit: prod.productUnitName, // ✅ include unit
                      productPrice: prod.productPrice,
                  }))
                : [],
        );
        setFilteredProducts(formattedProducts);

        // Step 4: Find product details for the currently selected product
        const selectedProduct = formattedProducts.find((p) => p.name === item.product);

        // Step 5: Populate form
        setForm((prev) => ({
            ...prev,
            productBrand: item.productBrand,
            productCategory: item.productCategory,
            productSubCategory: item.productSubCategory,
            product: item.product, // ✅ product restored
            hsnCode: selectedProduct?.hsnCode || item.hsnCode || "",
            description: selectedProduct?.description || item.description || "",
            unit: selectedProduct?.unit || item.unit || "",
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            subTotal: item.subTotal,
            gstinType: item.gstinType,
            cgst: item.cgst,
            sgst: item.sgst,
            igst: item.igst,
            cgstAmt: item.cgstAmt,
            sgstAmt: item.sgstAmt,
            igstAmt: item.igstAmt,
            discount: item.discount,
            total: item.total,
        }));
    };

    const handleDeleteProductDetails = (index, gstinType) => {
        if (gstinType === "Intrastate") {
            const updated = intrastateProducts.filter((_, i) => i !== index);
            setIntrastateProducts(updated);
            localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: updated, interstate: interstateProducts }));
        } else {
            const updated = interstateProducts.filter((_, i) => i !== index);
            setInterstateProducts(updated);
            localStorage.setItem("productInvoiceDetails", JSON.stringify({ intrastate: intrastateProducts, interstate: updated }));
        }
    };

    const validateFields = () => {
        let tempErrors = {};
        let hasError = false;

        if (!form.customerPerson) {
            tempErrors.customerPerson = true;
            hasError = true;
        }
        if (!form.email || !form.code || !form.mobile) {
            tempErrors.email = !form.email;
            tempErrors.code = !form.code;
            tempErrors.mobile = !form.mobile;
            hasError = true;
        }

        // Only require company name in manual mode AND when B2B is selected
        if (invoiceType === "manual" && businessMode === "B2B" && !form.selectedCompany) {
            tempErrors.selectedCompany = true;
            hasError = true;
        }

        // Address validation...
        const addressFields = ["street", "city", "state", "pincode", "country", "zone"];
        addressFields.forEach((field) => {
            if (!form.billingAddress[field]) {
                tempErrors[`billingAddress.${field}`] = true;
                hasError = true;
            }
            if (!form.shippingAddress[field]) {
                tempErrors[`shippingAddress.${field}`] = true;
                hasError = true;
            }
        });

        setErrors(tempErrors);
        return !hasError;
    };

    const handleSubmit = () => {
        // First validate form fields
        if (!validateFields()) {
            setLocalSnackbarMessage("Please fill all required fields.");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // ✅ Get productInvoiceDetails from localStorage
        const productInvoiceDetails = JSON.parse(localStorage.getItem("productInvoiceDetails")) || {
            intrastate: [],
            interstate: [],
        };

        // ✅ Check if at least one product is added
        if (productInvoiceDetails.intrastate.length === 0 && productInvoiceDetails.interstate.length === 0) {
            setLocalSnackbarMessage("No product added yet, Please do add!");
            setLocalSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // ✅ Format date
        const [yyyy, mm, dd] = form.date.split("-");
        const formattedDisplayDate = `${dd}-${mm}-${yyyy}`;

        // Helper → Convert country id → country name
        const getCountryNameById = (id) => {
            const match = country.find((c) => c.id === id);
            return match?.country || "";
        };

        // ✅ Create invoice object (same as createInvoice)
        const invoice = {
            selectedCompany: form.selectedCompany,
            customerPerson: form.customerPerson,
            email: form.email,
            mobile: `${form.code} ${form.mobile}`.trim(),
            date: formattedDisplayDate,
            billingAddress: {
                ...form.billingAddress,
                country: getCountryNameById(form.billingAddress.country),
            },
            shippingAddress: {
                ...form.shippingAddress,
                country: getCountryNameById(form.shippingAddress.country),
            },
            productInvoiceDetails,
            finalAmt: form.finalAmt,
            termsAndConditions: form.termsAndConditions,
            invoiceType: documentType,
        };

        // ✅ Dispatch updateInvoice instead of createInvoice
        dispatch(updateInvoice(id, invoice));

        // ✅ Reset form after submission
        setForm({
            selectedCompany: "",
            date: "",
            customerPerson: "",
            email: "",
            code: "",
            mobile: "",
            productBrand: "",
            productCategory: "",
            productSubCategory: "",
            product: "",
            hsnCode: "",
            quantity: "",
            unit: "",
            pricePerUnit: "",
            subTotal: "",
            gstinType: "Intrastate",
            cgst: "",
            sgst: "",
            igst: "",
            cgstAmt: "",
            sgstAmt: "",
            igstAmt: "",
            total: "",
            finalAmt: "",
            billingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            shippingAddress: { street: "", city: "", state: "", pincode: "", country: "", zone: "" },
            termsAndConditions: "",
        });

        setManualCustomerDetails({ email: "", code: "", mobile: "" });

        // ✅ Clear localStorage
        localStorage.removeItem("productInvoiceDetails");

        // ✅ Navigate back to invoice list after short delay
        setTimeout(() => {
            navigate(basePath);
        }, 1000);
    };

    return (
        <>
            {initialLoad ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <div className="card space-y-1">
                    <div className="flex items-center justify-between text-nowrap">
                        <div className="text-base font-semibold text-[#433C50] md:text-lg">Update {documentLabel} :</div>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="gradient"
                            className="rounded-full bg-slate-300 px-4 py-1 text-base capitalize text-[#433C50]"
                        >
                            Back
                        </Button>
                    </div>
                    {/* search by order for Invoice Generate or manually Invoice Generate */}
                    <div>
                        <RadioGroup
                            value={invoiceType}
                            onChange={(e) => setInvoiceType(e.target.value)}
                        >
                            <div className="flex-none gap-0 space-y-3 md:flex-none md:gap-0 md:space-y-3 lg:flex lg:gap-20 lg:space-y-0">
                                <div className="flex-none items-center gap-2 space-y-1 md:flex-none md:space-y-1 lg:flex lg:space-y-0">
                                    <FormControlLabel
                                        value="order"
                                        control={<Radio size="small" />}
                                        label="Search by Order No :"
                                    />
                                    {invoiceType === "order" && (
                                        <div className="flex gap-5">
                                            {/* <TextField
                                                label="Order Number *"
                                                type="text"
                                                placeholder="Enter number (e.g. 1001)"
                                                size="small"
                                                value={orderNo}
                                                onChange={(e) => {
                                                    let inputValue = e.target.value.toUpperCase();
                                            
                                                    if (inputValue === "" || inputValue === "O") {
                                                        setOrderNo("O-");
                                                        return;
                                                    }
                                            
                                                    if (!inputValue.startsWith("O-")) {
                                                        inputValue = "O-" + inputValue.replace(/[^A-Z0-9-]/g, "");
                                                    } else {
                                                        const afterPrefix = inputValue.slice(2).replace(/[^A-Z0-9-]/g, "");
                                                        inputValue = "O-" + afterPrefix;
                                                    }
                                            
                                                    setOrderNo(inputValue);
                                                }}
                                                onKeyDown={(e) => {
                                                    const cursorPos = e.target.selectionStart;
                                                    if ((e.key === "Backspace" || e.key === "Delete") && cursorPos <= 2) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                error={errors.orderNo}
                                                className="w-56 md:w-72 lg:w-64"
                                                inputProps={{
                                                    style: { textTransform: "uppercase" },
                                                }}
                                            /> */}
                                            <TextField
                                                label="Order Number *"
                                                type="text"
                                                placeholder="Enter number (e.g. 1001)"
                                                size="small"
                                                value={orderNo}
                                                onChange={(e) => {
                                                    let value = e.target.value.toUpperCase();

                                                    // Always enforce prefix
                                                    if (!value.startsWith(`${orderPrefix}-`)) {
                                                        value = `${orderPrefix}-`;
                                                    }

                                                    // Extract only the number part
                                                    let numberPart = value.replace(`${orderPrefix}-`, "");
                                                    numberPart = numberPart.replace(/[^0-9]/g, "");

                                                    setOrderNo(`${orderPrefix}-${numberPart}`);
                                                }}
                                                onKeyDown={(e) => {
                                                    const cursorPos = e.target.selectionStart;

                                                    // Prevent deleting prefix
                                                    if ((e.key === "Backspace" || e.key === "Delete") && cursorPos <= `${orderPrefix}-`.length) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                error={errors.orderNo}
                                                className="w-56 md:w-72 lg:w-64"
                                                inputProps={{
                                                    style: { textTransform: "uppercase" },
                                                }}
                                            />
                                            <Button
                                                onClick={handleOrderSearch}
                                                className="bg-green-500 px-1.5 py-1.5 text-white md:px-2 md:py-0 lg:px-2 lg:py-0"
                                            >
                                                <Search size={20} />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* <div>
                                    <FormControlLabel
                                        value="manual"
                                        control={<Radio size="small" />}
                                        label="Manually Generate Invoice"
                                    />
                                </div> */}
                            </div>
                        </RadioGroup>
                    </div>
                    <div>
                        <TextField
                            type="date"
                            size="small"
                            label="Date"
                            value={form.date}
                            onChange={handleChange("date")}
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                    {invoiceType === "order" ? (
                        <div className="flex w-full flex-col gap-4 lg:flex-row">
                            <TextField
                                label="Company Name"
                                fullWidth
                                value={form.selectedCompany}
                                onChange={handleChange("selectedCompany")}
                                size="small"
                            />
                            <TextField
                                label="Customer Name *"
                                fullWidth
                                value={form.customerPerson}
                                error={!!errors.customerPerson}
                                onChange={handleChange("customerPerson")}
                                size="small"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center gap-12">
                                <FormControlLabel
                                    control={
                                        <Radio
                                            size="small"
                                            checked={businessMode === "B2B"}
                                            onChange={(e) => {
                                                setBusinessMode(e.target.value);
                                                clearCustomerData();
                                            }}
                                            value="B2B"
                                        />
                                    }
                                    label="B2B (Business to Business)"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            size="small"
                                            checked={businessMode === "B2C"}
                                            onChange={(e) => {
                                                setBusinessMode(e.target.value);
                                                clearCustomerData();
                                            }}
                                            value="B2C"
                                        />
                                    }
                                    label="B2C (Business to Consumer)"
                                />
                            </div>

                            {/* Customer / Company Fields */}
                            <div className="flex w-full flex-col gap-6 lg:flex-row">
                                {businessMode === "B2B" ? (
                                    <>
                                        <Autocomplete
                                            disablePortal
                                            options={companyOptions}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                            value={selectedCompanyOption || null}
                                            onChange={(e, newValue) => {
                                                handleCompanySelect(newValue);
                                                setErrors((prev) => ({ ...prev, selectedCompany: false }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Company Name *"
                                                    size="small"
                                                    error={!!errors.selectedCompany}
                                                    fullWidth
                                                    placeholder="Search company..."
                                                />
                                            )}
                                            className="flex-1"
                                        />
                                        <Autocomplete
                                            disablePortal
                                            options={availableCustomerNames}
                                            value={form.customerPerson || ""}
                                            onChange={(e, newValue) => {
                                                handleCustomerSelect(newValue);
                                            }}
                                            disabled={availableCustomerNames.length === 0}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Customer Name *"
                                                    size="small"
                                                    error={!!errors.customerPerson}
                                                    fullWidth
                                                    placeholder={availableCustomerNames.length === 0 ? "First select company" : "Select contact"}
                                                />
                                            )}
                                            className="flex-1"
                                        />
                                    </>
                                ) : (
                                    <>
                                        {/* B2C: Search by Customer Name */}
                                        {/* <Autocomplete
                                            disablePortal
                                            options={allCustomerNames}
                                            value={form.customerPerson || ""}
                                            onChange={(e, newValue) => {
                                                if (newValue) {
                                                    // Find matching customer record
                                                    let matchedCust = null;
                                                    let matchedContact = null;
                                                    let isMain = false;

                                                    for (const cust of customers) {
                                                        const mainFull = [
                                                            cust.salutation || "",
                                                            cust.firstName || "",
                                                            cust.middleName || "",
                                                            cust.lastName || "",
                                                        ]
                                                            .join(" ")
                                                            .replace(/\s+/g, " ")
                                                            .trim();
                                                        if (mainFull === newValue) {
                                                            matchedCust = cust;
                                                            isMain = true;
                                                            break;
                                                        }
                                                        matchedContact = cust.contacts?.find((c) => {
                                                            const full = [c.salutation || "", c.firstName || "", c.middleName || "", c.lastName || ""]
                                                                .join(" ")
                                                                .replace(/\s+/g, " ")
                                                                .trim();
                                                            return full === newValue;
                                                        });
                                                        if (matchedContact) {
                                                            matchedCust = cust;
                                                            break;
                                                        }
                                                    }

                                                    if (matchedCust) {
                                                        const getCountryId = (name) => country.find((c) => c.country === name)?.id || "";
                                                        const billingCountryId = getCountryId(matchedCust.billingCountry);
                                                        const shippingCountryId = getCountryId(matchedCust.shippingCountry);
                                                        const billingZones = zones.find((z) => z.countryId === billingCountryId)?.zones || [];
                                                        const shippingZones = zones.find((z) => z.countryId === shippingCountryId)?.zones || [];

                                                        setFilteredBillingZones(billingZones);
                                                        setFilteredShippingZones(shippingZones);

                                                        setForm((prev) => ({
                                                            ...prev,
                                                            customerPerson: newValue,
                                                            selectedCompany: matchedCust.companyName || "", // optional, pre-fill
                                                            billingAddress: {
                                                                street: matchedCust.billingStreet || "",
                                                                city: matchedCust.billingCity || "",
                                                                state: matchedCust.billingState || "",
                                                                pincode: matchedCust.billingPincode || "",
                                                                country: billingCountryId,
                                                                zone: matchedCust.billingZone || "",
                                                            },
                                                            shippingAddress: {
                                                                street: matchedCust.shippingStreet || "",
                                                                city: matchedCust.shippingState || "",
                                                                state: matchedCust.shippingState || "",
                                                                pincode: matchedCust.shippingPincode || "",
                                                                country: shippingCountryId,
                                                                zone: matchedCust.shippingZone || "",
                                                            },
                                                        }));

                                                        const mobileSource = matchedContact?.mobile || matchedCust.mobile || "";
                                                        const emailSource = matchedContact?.email || matchedCust.email || "";
                                                        const [code = "", ...mobileParts] = mobileSource.split(" ");
                                                        const mobileNumber = mobileParts.join(" ");

                                                        setForm((prev) => ({
                                                            ...prev,
                                                            email: emailSource,
                                                            code,
                                                            mobile: mobileNumber,
                                                        }));
                                                        setManualCustomerDetails({ email: emailSource, code, mobile: mobileNumber });
                                                    }
                                                } else {
                                                    clearCustomerData();
                                                    setForm((prev) => ({ ...prev, customerPerson: "" }));
                                                }
                                                setErrors((prev) => ({ ...prev, customerPerson: false }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Customer Name *"
                                                    size="small"
                                                    error={!!errors.customerPerson}
                                                    fullWidth
                                                    placeholder="Search customer name..."
                                                />
                                            )}
                                            className="flex-1"
                                        /> */}
                                        {/* Optional Company Name in B2C */}
                                        {/* <TextField
                                            label="Company Name"
                                            value={form.selectedCompany}
                                            onChange={handleChange("selectedCompany")}
                                            size="small"
                                            fullWidth
                                            className="flex-1"
                                        /> */}
                                        {/* B2C: Search by Customer Name */}
                                        <Autocomplete
                                            disablePortal
                                            options={customerNameOptions}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                            value={selectedCustomerOption || null}
                                            onChange={(e, newValue) => {
                                                if (newValue) {
                                                    setSelectedCustomerOption(newValue);
                                                    const cust = newValue.record;
                                                    const isMain = newValue.isMainContact;
                                                    const contactPerson = newValue.contactPerson;

                                                    // Set customer name
                                                    setForm((prev) => ({ ...prev, customerPerson: newValue.label }));

                                                    // Mobile & Email (prefer contact-specific, fallback to main)
                                                    const mobileSource = contactPerson?.mobile || cust.mobile || newValue.mobile || "";
                                                    const emailSource = contactPerson?.email || cust.email || newValue.email || "";
                                                    const [code = "", ...mobileParts] = mobileSource.split(" ");
                                                    const mobileNumber = mobileParts.join(" ");

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        email: emailSource,
                                                        code,
                                                        mobile: mobileNumber,
                                                    }));
                                                    setManualCustomerDetails({ email: emailSource, code, mobile: mobileNumber });

                                                    // Addresses & Zones
                                                    const getCountryId = (name) => country.find((c) => c.country === name)?.id || "";
                                                    const billingCountryId = getCountryId(cust.billingCountry);
                                                    const shippingCountryId = getCountryId(cust.shippingCountry);

                                                    const billingZones = zones.find((z) => z.countryId === billingCountryId)?.zones || [];
                                                    const shippingZones = zones.find((z) => z.countryId === shippingCountryId)?.zones || [];

                                                    setFilteredBillingZones(billingZones);
                                                    setFilteredShippingZones(shippingZones);

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        selectedCompany: cust.companyName || "", // pre-fill, still editable
                                                        billingAddress: {
                                                            street: cust.billingStreet || "",
                                                            city: cust.billingCity || "",
                                                            state: cust.billingState || "",
                                                            pincode: cust.billingPincode || "",
                                                            country: billingCountryId,
                                                            zone: cust.billingZone || "",
                                                        },
                                                        shippingAddress: {
                                                            street: cust.shippingStreet || "",
                                                            city: cust.shippingCity || "",
                                                            state: cust.shippingState || "",
                                                            pincode: cust.shippingPincode || "",
                                                            country: shippingCountryId,
                                                            zone: cust.shippingZone || "",
                                                        },
                                                    }));
                                                } else {
                                                    // Cleared selection
                                                    setSelectedCustomerOption(null);
                                                    clearCustomerData();
                                                    setForm((prev) => ({ ...prev, customerPerson: "" }));
                                                }
                                                setErrors((prev) => ({ ...prev, customerPerson: false }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Customer Name *"
                                                    size="small"
                                                    error={!!errors.customerPerson}
                                                    fullWidth
                                                    placeholder="Search customer name..."
                                                />
                                            )}
                                            className="flex-1"
                                        />

                                        {/* B2C: Company Name (optional, editable) */}
                                        <TextField
                                            label="Company Name"
                                            value={form.selectedCompany}
                                            onChange={handleChange("selectedCompany")}
                                            size="small"
                                            fullWidth
                                            className="flex-1"
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex w-full flex-col gap-4 lg:flex-row">
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <TextField
                                label="Email *"
                                fullWidth
                                value={form.email}
                                error={!!errors.email}
                                onChange={handleChange("email")}
                                size="small"
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                        {/* Code + Mobile group (always in a row) */}
                        <Box className="flex w-full flex-row gap-4 lg:flex-1">
                            <TextField
                                label="Code *"
                                value={form.code}
                                error={!!errors.code}
                                onChange={handleChange("code")}
                                size="small"
                                sx={{ flex: 0.4 }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Mobile *"
                                value={form.mobile}
                                error={!!errors.mobile}
                                onChange={handleChange("mobile")}
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                    </div>

                    {/* Product Details */}
                    {/* <div className="space-y-4">
                        <p className="font-semibold text-[#433C50]">Product Details</p>
                        <Box className="flex items-center gap-10 text-nowrap md:gap-5 lg:gap-5">
                            <span className="-mt-1 text-sm font-semibold text-[#433C50] md:-mt-1.5 lg:-mt-1.5">GSTIN Type :</span>
                            <RadioGroup
                                row
                                value={form.gstinType}
                                onChange={handleChange("gstinType")}
                            >
                                <FormControlLabel
                                    value="Intrastate"
                                    control={<Radio size="small" />}
                                    label="For Intrastate"
                                />
                                <FormControlLabel
                                    value="Interstate"
                                    control={<Radio size="small" />}
                                    label="For Interstate"
                                />
                            </RadioGroup>
                        </Box>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <Autocomplete
                                disablePortal
                                options={productBrand.map((brand) => brand.productBrand)}
                                value={form.productBrand || ""}
                                onChange={(e, newValue) => handleChange("productBrand")({ target: { value: newValue } })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Brand *"
                                        size="small"
                                        error={!!errors.productBrand}
                                    />
                                )}
                                className="flex-1"
                            />
                            <Autocomplete
                                disablePortal
                                options={filteredCategories || []}
                                value={form.productCategory || ""}
                                onChange={(e, newValue) => handleChange("productCategory")({ target: { value: newValue } })}
                                disabled={!form.productBrand}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Category *"
                                        size="small"
                                        error={!!errors.productCategory}
                                    />
                                )}
                                className="flex-1"
                            />
                            <Autocomplete
                                disablePortal
                                options={filteredSubCategories || []}
                                value={form.productSubCategory || ""}
                                onChange={(e, newValue) => handleChange("productSubCategory")({ target: { value: newValue } })}
                                disabled={!form.productCategory}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Subcategory *"
                                        size="small"
                                        error={!!errors.productSubCategory}
                                    />
                                )}
                                className="flex-1"
                            />
                            <Autocomplete
                                disablePortal
                                options={(filteredProducts || []).map((prod) => prod.name)}
                                value={form.product || ""}
                                onChange={(e, newValue) => handleChange("product")({ target: { value: newValue } })}
                                disabled={!form.productSubCategory}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product *"
                                        size="small"
                                        error={!!errors.product}
                                    />
                                )}
                                className="flex-1"
                            />

                            <TextField
                                label="HSN Code"
                                value={form.hsnCode}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>

                        <Box className="flex w-full flex-col gap-4 lg:flex-row">
                            <TextField
                                label="Quantity *"
                                placeholder="Quantity"
                                type="number"
                                value={form.quantity}
                                error={errors.quantity}
                                onChange={handleChange("quantity")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />

                            <TextField
                                label="Unit *"
                                placeholder="Unit"
                                value={form.unit}
                                error={errors.unit}
                                onChange={handleChange("unit")}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />

                            <TextField
                                label="Price Per Unit *"
                                placeholder="Price Per Unit"
                                type="number"
                                value={form.pricePerUnit}
                                error={errors.pricePerUnit}
                                onChange={handleChange("pricePerUnit")}
                                onWheel={(e) => e.target.blur()}
                                inputProps={{ min: 0 }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />

                            <TextField
                                label="Sub Total"
                                placeholder="Sub Total"
                                value={form.subTotal}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <Box>
                            <TextField
                                label="Description"
                                value={form.description}
                                fullWidth
                                size="small"
                                sx={{ flex: 1 }}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                        {form.gstinType === "Intrastate" && (
                            <div className="space-y-4">
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="CGST (%) *"
                                        placeholder="CGST (%)"
                                        type="number"
                                        value={form.cgst}
                                        onChange={handleChange("cgst")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0 }}
                                        error={errors.cgst}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="CGST Amt"
                                        placeholder="CGST Amount"
                                        value={form.cgstAmt}
                                        InputProps={{ readOnly: true }}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="SGST (%) *"
                                        placeholder="SGST (%)"
                                        type="number"
                                        value={form.sgst}
                                        onChange={handleChange("sgst")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0 }}
                                        error={errors.sgst}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="SGST Amt"
                                        placeholder="SGST Amount"
                                        value={form.sgstAmt}
                                        InputProps={{ readOnly: true }}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Discount (%)"
                                        placeholder="Discount (%)"
                                        type="number"
                                        value={form.discount}
                                        onChange={handleChange("discount")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0, max: 100 }}
                                        error={errors.discount}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Total"
                                        value={form.total}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>
                                <div className="flex gap-5">
                                    <Button
                                        variant="gradient"
                                        className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
                                        onClick={handleResetProductDetails}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        className={`rounded px-6 py-2 capitalize text-white md:text-base ${editProductDetailsIndex !== null ? "bg-green-500" : "bg-blue-500"}`}
                                        onClick={handleSaveProductDetails}
                                    >
                                        {editProductDetailsIndex !== null ? "Update" : "Add"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {form.gstinType === "Interstate" && (
                            <div className="space-y-4">
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="IGST (%) *"
                                        placeholder="IGST (%)"
                                        type="number"
                                        value={form.igst}
                                        onChange={handleChange("igst")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0 }}
                                        error={errors.igst}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="IGST Amt"
                                        placeholder="IGST Amount"
                                        value={form.igstAmt}
                                        InputProps={{ readOnly: true }}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                    <TextField
                                        label="Discount (%)"
                                        placeholder="Discount (%)"
                                        type="number"
                                        value={form.discount}
                                        onChange={handleChange("discount")}
                                        onWheel={(e) => e.target.blur()}
                                        inputProps={{ min: 0, max: 100 }}
                                        error={errors.discount}
                                        size="small"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Total"
                                        value={form.total}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>
                                <div className="flex gap-5">
                                    <Button
                                        variant="gradient"
                                        className="rounded bg-gray-500 px-6 py-2 capitalize text-white md:text-base"
                                        onClick={handleResetProductDetails}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        className={`rounded px-6 py-2 capitalize text-white md:text-base ${editProductDetailsIndex !== null ? "bg-green-500" : "bg-blue-500"}`}
                                        onClick={handleSaveProductDetails}
                                    >
                                        {editProductDetailsIndex !== null ? "Update" : "Add"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="card-body p-0">
                            <div className="relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                                <table className="table">
                                    <thead className="table-header text-nowrap bg-[#053054] text-white">
                                        <tr className="table-row">
                                            <th className="border border-gray-300 px-2 py-1">Sr No.</th>
                                            <th className="border border-gray-300 px-2 py-1">Product</th>
                                            <th className="border border-gray-300 px-2 py-1">HSN</th>
                                            <th className="border border-gray-300 px-2 py-1">Price</th>

                                            {form.gstinType === "Intrastate" ? (
                                                <>
                                                    <th className="border border-gray-300 px-2 py-1">CGST (%)</th>
                                                    <th className="border border-gray-300 px-2 py-1">CGST Amt</th>
                                                    <th className="border border-gray-300 px-2 py-1">SGST (%)</th>
                                                    <th className="border border-gray-300 px-2 py-1">SGST Amt</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="border border-gray-300 px-2 py-1">IGST (%)</th>
                                                    <th className="border border-gray-300 px-2 py-1">IGST Amt</th>
                                                </>
                                            )}

                                            <th className="border border-gray-300 px-2 py-1">Total</th>
                                            <th className="border border-gray-300 px-2 py-1">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).length > 0 ? (
                                            (form.gstinType === "Intrastate" ? intrastateProducts : interstateProducts).map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="text-center"
                                                >
                                                    <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                                                    <td className="text-nowrap border border-gray-300 px-2 py-1">{item.product}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.hsnCode}</td>
                                                    <td className="border border-gray-300 px-2 py-1">{item.pricePerUnit}</td>

                                                    {form.gstinType === "Intrastate" ? (
                                                        <>
                                                            <td className="border border-gray-300 px-2 py-1">{item.cgst}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.cgstAmt}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.sgst}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.sgstAmt}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="border border-gray-300 px-2 py-1">{item.igst}</td>
                                                            <td className="border border-gray-300 px-2 py-1">{item.igstAmt}</td>
                                                        </>
                                                    )}

                                                    <td className="border border-gray-300 px-2 py-1">{item.total}</td>
                                                    <td className="space-x-2 border border-gray-300 px-2 py-1">
                                                        <button
                                                            className="text-blue-500"
                                                            onClick={() => handleEditProductDetails(index, form.gstinType)}
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteProductDetails(index, form.gstinType)}
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={form.gstinType === "Intrastate" ? 11 : 9}
                                                    className="py-3 text-center text-gray-500"
                                                >
                                                    No product added yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <TextField
                            label="Final Amount"
                            value={form.finalAmt}
                            InputProps={{ readOnly: true }}
                            fullWidth
                            size="small"
                        />
                    </div> */}

                    {/* Address Info */}
                    <div className="flex-none gap-4 md:flex lg:flex">
                        {/* Billing Address */}
                        <div className="w-full space-y-4 md:w-1/2 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Billing Address</p>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.street}
                                    onChange={handleAddressChange("billingAddress", "street")}
                                    error={!!errors["billingAddress.street"]}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.city}
                                    onChange={handleAddressChange("billingAddress", "city")}
                                    error={!!errors["billingAddress.city"]}
                                />
                                <TextField
                                    label="State *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.state}
                                    onChange={handleAddressChange("billingAddress", "state")}
                                    error={!!errors["billingAddress.state"]}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode *"
                                    fullWidth
                                    size="small"
                                    value={form.billingAddress.pincode}
                                    onChange={handleAddressChange("billingAddress", "pincode")}
                                    error={!!errors["billingAddress.pincode"]}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option?.country || ""}
                                    value={country.find((c) => c.id === form.billingAddress.country) || null}
                                    onChange={handleAddressChange("billingAddress", "country")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country *"
                                            size="small"
                                            error={!!errors["billingAddress.country"]}
                                        />
                                    )}
                                    fullWidth
                                />

                                <Autocomplete
                                    options={filteredBillingZones}
                                    getOptionLabel={(option) => option || ""}
                                    value={form.billingAddress.zone || null}
                                    onChange={(e, value) => handleAddressChange("billingAddress", "zone")({ target: { value } })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Zone *"
                                            size="small"
                                            error={!!errors["billingAddress.zone"]}
                                        />
                                    )}
                                    fullWidth
                                />
                            </Box>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-3 w-full space-y-4 md:mt-0 md:w-1/2 lg:mt-0 lg:w-1/2">
                            <p className="-mb-1 font-semibold text-[#433C50]">Shipping Address</p>

                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Street *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.street}
                                    onChange={handleAddressChange("shippingAddress", "street")}
                                    error={!!errors["shippingAddress.street"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="City *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.city}
                                    onChange={handleAddressChange("shippingAddress", "city")}
                                    error={!!errors["shippingAddress.city"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                                <TextField
                                    label="State *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.state}
                                    onChange={handleAddressChange("shippingAddress", "state")}
                                    error={!!errors["shippingAddress.state"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                            </Box>
                            <Box className="flex w-full flex-col gap-4 lg:flex-row">
                                <TextField
                                    label="Pincode *"
                                    fullWidth
                                    size="small"
                                    value={form.shippingAddress.pincode}
                                    onChange={handleAddressChange("shippingAddress", "pincode")}
                                    error={!!errors["shippingAddress.pincode"]}
                                    disabled={copyShippingSameAsBilling}
                                />
                                <Autocomplete
                                    options={country}
                                    getOptionLabel={(option) => option?.country || ""}
                                    value={country.find((c) => c.id === form.shippingAddress.country) || null}
                                    onChange={handleAddressChange("shippingAddress", "country")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country *"
                                            size="small"
                                            error={!!errors["shippingAddress.country"]}
                                        />
                                    )}
                                    fullWidth
                                    disabled={copyShippingSameAsBilling}
                                />
                                <Autocomplete
                                    options={filteredShippingZones}
                                    getOptionLabel={(option) => option || ""}
                                    value={form.shippingAddress.zone || null}
                                    onChange={(e, value) => handleAddressChange("shippingAddress", "zone")({ target: { value } })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Zone *"
                                            size="small"
                                            error={!!errors["shippingAddress.zone"]}
                                        />
                                    )}
                                    fullWidth
                                    disabled={copyShippingSameAsBilling}
                                />
                            </Box>
                        </div>
                    </div>

                    {/* Checkbox to copy billing address */}
                    <div className="mt-4">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={copyShippingSameAsBilling}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCopyShippingSameAsBilling(checked);
                                        if (checked) {
                                            // Copy billing to shipping
                                            setCompanyDetails((prev) => ({
                                                ...prev,
                                                shippingAddress: { ...prev.billingAddress },
                                            }));
                                            // Copy zones too
                                            setFilteredShippingZones([...filteredBillingZones]);
                                        }
                                    }}
                                />
                            }
                            label="Shipping address is same as billing address"
                        />
                    </div>

                    {/* Terms And Conditions */}
                    <Box>
                        <div className="mb-2 text-sm font-medium text-gray-700">Terms and Conditions</div>
                        <ReactQuill
                            value={form.termsAndConditions}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, termsAndConditions: value }));
                            }}
                            theme="snow"
                            placeholder="Enter invoice terms and conditions..."
                            className={`bg-white`}
                        />
                    </Box>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        {/* <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            className="flex items-center gap-2 rounded bg-green-600 px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                        >
                            <LiaFileInvoiceSolid size={20} />
                            Update Invoice
                        </Button> */}
                        <Button
                            onClick={handleSubmit}
                            variant="gradient"
                            disabled={isSubmittingSuccessfully || initialLoad} // optional: also disable if globally loading
                            className={`flex items-center gap-2 rounded bg-green-600 px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base ${isSubmittingSuccessfully ? "cursor-not-allowed bg-green-600/70 opacity-70" : "bg-green-600 hover:bg-green-600/90"} transition-all`}
                        >
                            {isSubmittingSuccessfully ? (
                                <>
                                    <CircularProgress
                                        size={18}
                                        thickness={5}
                                        className="text-white"
                                    />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <LiaFileInvoiceSolid size={20} />
                                    Update Invoice
                                </>
                            )}
                        </Button>
                    </div>
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
                    severity={snackbarMessage ? snackbarSeverity : localSnackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage || localSnackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EditInvoice;
