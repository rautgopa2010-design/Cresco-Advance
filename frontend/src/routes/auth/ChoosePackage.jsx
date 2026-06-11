import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { getPackages } from "@/redux/actions/package";
import { selectPackage } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";
import { assignFreePackageByProvider } from "@/redux/actions/auth";
import { Snackbar, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from "@mui/material";
import logo from "@/assets/logo.jpg";
import { IoArrowBackCircle } from "react-icons/io5";

// Convert durationValue (days) → months
const getMonthsFromDurationValue = (durationValue) => {
    if (!durationValue || isNaN(durationValue)) return 1;
    const months = durationValue / 30;
    return Math.round(months * 100) / 100;
};

// Calculate remaining full months with 15-day pro-ration rule
const getRemainingMonthsForUpgrade = (expiryDateStr) => {
    const now = new Date();
    const expiry = new Date(expiryDateStr);
    if (expiry <= now) return 0;
    let months = 0;
    let temp = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    while (temp <= expiry) {
        months++;
        temp.setMonth(temp.getMonth() + 1);
    }
    if (now.getDate() >= 15) {
        months = Math.max(0, months - 1);
    }
    return months;
};

const ChoosePackage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        targetOrgId,
        targetOrg,
        mode = "normal", // 'assign' | 'renew' | 'normal'
    } = location.state || {};

    console.log("customer whoes package neeto to add or renew by provider: ", targetOrg);
    console.log("customer id whoes package neeto to add or renew by provider: ", targetOrgId);

    const isProviderMode = !!targetOrgId;
    const isAssignMode = mode === "assign";
    const isRenewMode = mode === "renew";
    const cameFromRenewOrUpgrade = location.state?.from === "expired" || location.state?.from === "upgrade";

    const { packages, loading: packagesLoading } = useSelector((state) => state.package);
    const { snackbarMessage, snackbarSeverity } = useSelector((state) => state.auth);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const selectedPackageId = user.packageId;
    const packageExpiryDate = user.packageExpiryDate;
    const currentUserCount = user?.packageDetails?.maxUsers || 0;
    const isPackageExpired = packageExpiryDate ? new Date(packageExpiryDate) < new Date() : true;

    const MAX_ALLOWED_AMOUNT = 500000;

    // Current package of target org (for provider mode)
    const targetOrgCurrentPackageId = useMemo(() => {
        if (!isProviderMode || !targetOrg) return null;
        return targetOrg.packageId || null;
    }, [isProviderMode, targetOrg]);

    const effectiveSelectedPackageId = isProviderMode ? targetOrgCurrentPackageId : selectedPackageId;
    const effectiveExpiryDate = isProviderMode ? targetOrg?.packageExpiryDate || targetOrg?.expiryDate : packageExpiryDate;
    const effectiveIsExpired = effectiveExpiryDate ? new Date(effectiveExpiryDate) < new Date() : true;

    const currentPackage = packages.find((p) => p.id === effectiveSelectedPackageId);
    const hasActivePaidPackage = currentPackage && !currentPackage.isFree && !effectiveIsExpired;

    const hasUsedFreePackage = isProviderMode ? targetOrg?.isFree === true : user.isFree === true;

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPkgForPayment, setSelectedPkgForPayment] = useState(null);
    const [numUsersInput, setNumUsersInput] = useState("");
    const [totalCost, setTotalCost] = useState(0);
    const [error, setError] = useState("");
    const [isUpgradeFlow, setIsUpgradeFlow] = useState(false);

    useEffect(() => {
        if (!packages || packages.length === 0) {
            dispatch(getPackages());
        }
    }, [dispatch, packages]);

    useEffect(() => {
        if (snackbarMessage) {
            setSnackbarOpen(true);
        }
    }, [snackbarMessage]);

    const handleChoose = async (pkg) => {
        if (isProviderMode) {
            setSelectedPkgForPayment(pkg);

            // FREE PACKAGE – assign immediately
            if (pkg.price === 0 || pkg.isFree) {
                setLocalLoading(true);
                const result = await dispatch(assignFreePackageByProvider(targetOrgId, pkg.id));
                setLocalLoading(false);

                if (result?.success) {
                    setTimeout(() => {
                        navigate("/provider/registered-customers");
                    }, 1500);
                }
                return;
            }

            // PAID PACKAGE
            // Determine if this is an upgrade (same package) or full new purchase (different package)
            const isSamePackage = pkg.id === effectiveSelectedPackageId;
            const isTrueUpgrade = isRenewMode && isSamePackage && hasActivePaidPackage;

            setIsUpgradeFlow(isTrueUpgrade);

            setOpenDialog(true);
            setNumUsersInput("");
            setTotalCost(0);
            setError("");

            if (isTrueUpgrade) {
                // Pro-rated additional users only
                calculateUpgradeCost(0, pkg);
            } else {
                // Full new package purchase (even if renewing but switching package)
                calculateTotalCost(0, pkg);
            }
            return;
        }

        // // NORMAL USER FLOW
        // if (pkg.price === 0 || pkg.isFree) {
        //     setLocalLoading(true);
        //     try {
        //         const success = await dispatch(selectPackage(pkg.id));
        //         if (success) {
        //             const updatedUser = { ...user, packageId: pkg.id };
        //             localStorage.setItem("user", JSON.stringify(updatedUser));
        //             setSnackbarOpen(true);
        //             setTimeout(() => navigate("/", { replace: true }), 2000);
        //         }
        //     } catch (err) {
        //         console.error("Free package selection failed:", err);
        //     } finally {
        //         setLocalLoading(false);
        //     }
        //     return;
        // }
        
        // NORMAL USER FLOW
        if (pkg.price === 0 || pkg.isFree) {
            setLocalLoading(true);
            try {
                // ✅ Now selectPackage returns updated user data with permissions
                const result = await dispatch(selectPackage(pkg.id));

                if (result?.success) {
                    // ✅ User data is already updated in localStorage via the action
                    setSnackbarOpen(true);
                    setTimeout(() => navigate("/", { replace: true }), 2000);
                }
            } catch (err) {
                console.error("Free package selection failed:", err);
            } finally {
                setLocalLoading(false);
            }
            return;
        }

        // Normal user paid flow
        const isUserUpgrade = hasActivePaidPackage && pkg.id === selectedPackageId;
        setIsUpgradeFlow(isUserUpgrade);
        setSelectedPkgForPayment(pkg);
        setNumUsersInput("");
        setTotalCost(0);
        setError("");
        setOpenDialog(true);

        if (isUserUpgrade) {
            calculateUpgradeCost(0, pkg);
        } else {
            calculateTotalCost(0, pkg);
        }
    };

    const calculateTotalCost = (extraUsers = 0, pkg = selectedPkgForPayment) => {
        if (!pkg) return;
        const months = getMonthsFromDurationValue(pkg.durationValue);
        const monthlyBase = Number(pkg.total_package_amount) || 0;
        const monthlyPerUser = Number(pkg.price) || 0;
        if (months <= 0) {
            setTotalCost(0);
            return;
        }
        const baseTotal = monthlyBase * months;
        const extraCost = extraUsers * monthlyPerUser * months;
        setTotalCost(Math.round(baseTotal + extraCost));
    };

    const calculateUpgradeCost = (additionalUsers, pkg = selectedPkgForPayment) => {
        if (!pkg || !effectiveExpiryDate || effectiveIsExpired) {
            setTotalCost(0);
            return;
        }
        const remainingMonths = getRemainingMonthsForUpgrade(effectiveExpiryDate);
        if (remainingMonths <= 0) {
            setTotalCost(0);
            return;
        }
        const usersToAdd = parseInt(additionalUsers, 10) || 0;
        if (usersToAdd <= 0) {
            setTotalCost(0);
            return;
        }
        const perUserPerMonth = Number(pkg.price) || 0;
        const cost = usersToAdd * perUserPerMonth * remainingMonths;
        setTotalCost(Math.round(cost));
    };

    const handleNumUsersChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue === "") {
            setNumUsersInput("");
            setError("");
            isUpgradeFlow ? setTotalCost(0) : calculateTotalCost(0);
            return;
        }
        const value = Number(inputValue);
        if (isNaN(value) || value < 0) {
            setNumUsersInput(inputValue);
            return;
        }
        setNumUsersInput(value.toString());
        if (isUpgradeFlow) {
            if (value === 0) {
                setTotalCost(0);
                setError("Enter at least 1 user to add");
            } else {
                setError("");
                calculateUpgradeCost(value);
            }
        } else {
            setError("");
            calculateTotalCost(value);
        }
    };

    const handleProceedToPayment = () => {
        let finalNumUsers;
        let extraUsers = 0;

        if (isUpgradeFlow) {
            extraUsers = parseInt(numUsersInput, 10) || 0;
            if (extraUsers < 1) {
                setError("Please enter at least 1 user to add");
                return;
            }
            finalNumUsers = (isProviderMode ? targetOrg?.pkgUsers || 0 : currentUserCount) + extraUsers;
        } else {
            extraUsers = numUsersInput === "" ? 0 : parseInt(numUsersInput, 10);
            if (isNaN(extraUsers) || extraUsers < 0) {
                setError("Invalid number");
                return;
            }
            finalNumUsers = selectedPkgForPayment.maxUsers + extraUsers;
        }

        if (totalCost > MAX_ALLOWED_AMOUNT) {
            setError(`Maximum allowed payment is ₹${MAX_ALLOWED_AMOUNT.toLocaleString()}. Please contact support.`);
            return;
        }

        if (totalCost <= 0 && !(selectedPkgForPayment?.isFree || selectedPkgForPayment?.price === 0)) {
            setError("Invalid total cost.");
            return;
        }

        setError("");

        const commonState = {
            packageId: selectedPkgForPayment.id,
            numUsers: finalNumUsers,
            totalAmount: Math.round(totalCost),
            packageName: selectedPkgForPayment.packageName,
            durationMonths: isUpgradeFlow
                ? getRemainingMonthsForUpgrade(effectiveExpiryDate)
                : getMonthsFromDurationValue(selectedPkgForPayment.durationValue),
            isUpgrade: isUpgradeFlow,
            expiryDate: effectiveExpiryDate,
            additionalUsersOnly: extraUsers,
        };

        if (isProviderMode && selectedPkgForPayment?.price > 0 && !selectedPkgForPayment?.isFree) {
            navigate("/payment", {
                state: {
                    ...commonState,
                    targetOrgId,
                    from: "provider",
                },
            });
        } else {
            navigate("/payment", { state: commonState });
        }
        setOpenDialog(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        dispatch(clearSnackbar());
    };

    if ((packagesLoading || localLoading) && !snackbarOpen) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            {cameFromRenewOrUpgrade && (
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-2 top-10 z-10 flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-gray-700 shadow-lg transition-all hover:scale-105 hover:bg-gray-50 hover:text-gray-900 hover:shadow-xl md:left-10 md:top-16 md:gap-2 md:px-4 md:py-3 lg:left-72 lg:top-12"
                >
                    <IoArrowBackCircle size={24} />
                    Back
                </button>
            )}
            <div className="w-[1000px] rounded-xl bg-white p-10 text-center shadow-lg">
                <img
                    src={logo}
                    alt="Logo"
                    className="mx-auto -mt-5 w-44 md:w-60"
                />
                <h1 className="mb-4 text-2xl font-bold">
                    {isProviderMode ? (isAssignMode ? "Assign Package to Customer" : "Renew / Upgrade Customer Package") : "Choose Your Package"}
                </h1>
                <p className="mb-6 text-gray-600">
                    {isProviderMode
                        ? isAssignMode
                            ? "Select a package to assign the customer organization."
                            : "Select a package to assign or upgrade for the customer organization."
                        : "To continue, please select a package for your company."}
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => {
                        const isFreePackage = pkg.price === 0 || pkg.isFree;
                        const isCurrentlySelected = pkg.id === effectiveSelectedPackageId;
                        const months = getMonthsFromDurationValue(pkg.durationValue);
                        const totalBasePrice = Number(pkg.total_package_amount || 0) * months;
                        const perUserPerMonth = Number(pkg.price || 0);

                        let buttonText = isFreePackage ? "Select Free Package" : "Select Package";
                        let buttonDisabled = !pkg.isActive;
                        let buttonClass = !pkg.isActive ? "cursor-not-allowed bg-gray-500" : "bg-green-500 hover:bg-green-600";

                        if (isFreePackage && hasUsedFreePackage) {
                            buttonText = "Expired - Upgrade Denied";
                            buttonDisabled = true;
                            buttonClass = "bg-red-600 cursor-not-allowed";
                        } else if (isCurrentlySelected && effectiveIsExpired) {
                            buttonText = "Expired - Renew";
                            buttonDisabled = false;
                            buttonClass = "bg-orange-600 hover:bg-orange-700";
                        } else if (isCurrentlySelected && hasActivePaidPackage) {
                            buttonText = "Upgrade";
                            buttonDisabled = false;
                            buttonClass = "bg-orange-600 hover:bg-orange-700";
                        } else if (isCurrentlySelected) {
                            buttonText = "Currently Selected";
                            buttonDisabled = true;
                            buttonClass = "bg-blue-600 cursor-not-allowed";
                        }

                        return (
                            <div
                                key={pkg.id}
                                className="relative flex flex-col justify-between rounded-xl bg-gradient-to-r from-[#053054] via-[#1b537b] to-[#053054] p-6 text-white shadow-lg"
                            >
                                {isCurrentlySelected && !effectiveIsExpired && (
                                    <div className="absolute right-2 top-2 rounded bg-white px-2 py-1 text-xs font-bold text-green-600">Selected</div>
                                )}
                                {isCurrentlySelected && effectiveIsExpired && (
                                    <div className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">Expired</div>
                                )}
                                <h2 className="mb-2 text-lg font-bold">{pkg.packageName}</h2>
                                <p className="mb-2 text-sm">
                                    <strong>Users:</strong> Up to {pkg.maxUsers} included
                                </p>
                                <p className="mb-2 text-sm">
                                    <strong>Duration:</strong> {pkg.durationType} ({pkg.durationValue} days)
                                </p>
                                {!isFreePackage && (
                                    <>
                                        <p className="mb-1 text-sm">
                                            <strong>Monthly Base:</strong> {pkg.symbol}
                                            {Number(pkg.total_package_amount).toFixed(0)} {pkg.currency}
                                        </p>
                                        <p className="mb-1 text-sm font-bold">
                                            <strong>Total Base ({months} mo):</strong> {pkg.symbol}
                                            {totalBasePrice.toFixed(0)} {pkg.currency}
                                        </p>
                                        <p className="mb-2 text-sm">
                                            <strong>Per Extra User/Month:</strong> {pkg.symbol}
                                            {perUserPerMonth.toFixed(2)} {pkg.currency}
                                        </p>
                                    </>
                                )}
                                {isFreePackage && (
                                    <p className="mb-2 text-sm">
                                        <strong>Price:</strong> Free Forever
                                    </p>
                                )}
                                <div className="mb-2 text-center">
                                    {pkg.modules && pkg.modules.length > 0 && (
                                        <>
                                            <strong className="mb-2 block text-sm">Modules Included:</strong>
                                            <div className="flex flex-wrap items-center justify-center gap-2">
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
                                </div>
                                <p className="mb-4 text-sm">
                                    <strong>Status:</strong> {pkg.isActive ? "Active" : "Inactive"}
                                </p>
                                <Button
                                    className={`mt-auto rounded-lg px-4 py-2 text-white transition ${buttonClass}`}
                                    disabled={buttonDisabled}
                                    onClick={() => !buttonDisabled && handleChoose(pkg)}
                                >
                                    {buttonText}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="bg-gradient-to-r from-[#053054] to-[#1b537b] text-white">
                    <Typography
                        variant="h6"
                        className="font-bold"
                    >
                        {isUpgradeFlow ? "Upgrade/Renew Package (Pro-rated)" : "Select Number of Users"}
                    </Typography>
                </DialogTitle>
                <DialogContent className="p-6">
                    {selectedPkgForPayment && (
                        <>
                            <div className="mb-4 rounded-lg bg-blue-50 p-4">
                                <Typography
                                    variant="body1"
                                    className="mb-2 font-semibold"
                                >
                                    Package: {selectedPkgForPayment.packageName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-gray-600"
                                >
                                    Duration:{" "}
                                    <strong>
                                        {isUpgradeFlow
                                            ? `Until ${new Date(effectiveExpiryDate).toLocaleDateString()} (pro-rated)`
                                            : selectedPkgForPayment.durationType}
                                    </strong>
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-gray-600"
                                >
                                    {isUpgradeFlow ? (
                                        <>
                                            Current Users: <strong>{isProviderMode ? targetOrg?.pkgUsers || 0 : currentUserCount}</strong> → Enter
                                            additional users
                                        </>
                                    ) : (
                                        <>
                                            Base price includes <strong>{selectedPkgForPayment.maxUsers}</strong> users
                                        </>
                                    )}
                                </Typography>
                                {!isUpgradeFlow && !(selectedPkgForPayment?.isFree || selectedPkgForPayment?.price === 0) && (
                                    <>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Monthly Base Price: {selectedPkgForPayment.symbol}{" "}
                                            {Number(selectedPkgForPayment.total_package_amount).toFixed(0)} {selectedPkgForPayment.currency}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Per Extra User (per month): {selectedPkgForPayment.symbol}{" "}
                                            {Number(selectedPkgForPayment.price).toFixed(2)} {selectedPkgForPayment.currency}
                                        </Typography>
                                    </>
                                )}
                            </div>
                            <TextField
                                type="number"
                                label={isUpgradeFlow ? "Number of Additional Users" : "Number of Extra Users (Optional)"}
                                value={numUsersInput}
                                onChange={handleNumUsersChange}
                                inputProps={{ min: 0, step: 1 }}
                                placeholder={isUpgradeFlow ? "e.g. 5, 10..." : "Leave empty for included users only"}
                                error={!!error}
                                helperText={
                                    error ||
                                    (isUpgradeFlow
                                        ? "Enter how many extra users you want to add"
                                        : `Base price covers ${selectedPkgForPayment.maxUsers} users. Add more if needed.`)
                                }
                                fullWidth
                                variant="outlined"
                                autoFocus
                            />
                            {totalCost > 0 && (
                                <div className="mt-6 rounded-xl border-2 border-green-200 bg-green-50 p-5">
                                    <Typography
                                        variant="h5"
                                        className="font-bold text-green-800"
                                    >
                                        Total Amount: {selectedPkgForPayment.symbol} {Math.round(totalCost).toLocaleString()}{" "}
                                        {selectedPkgForPayment.currency}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        className="mt-3 text-green-700"
                                    >
                                        {isUpgradeFlow
                                            ? "Pro-rated cost for additional users only"
                                            : numUsersInput === "" || parseInt(numUsersInput) === 0
                                              ? `Base package cost (includes ${selectedPkgForPayment.maxUsers} users)`
                                              : `Base + cost for ${numUsersInput} extra user${parseInt(numUsersInput) > 1 ? "s" : ""}`}
                                    </Typography>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions className="bg-gray-50 p-4">
                    <Button
                        onClick={() => setOpenDialog(false)}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleProceedToPayment}
                        disabled={!!error || totalCost === 0 || localLoading}
                        className="rounded-lg bg-gradient-to-r from-[#053054] to-[#1b537b] text-white"
                    >
                        {isProviderMode ? "Make Payment" : isUpgradeFlow ? "Pay & Add Users" : "Proceed to Payment"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity || "success"}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ChoosePackage;
