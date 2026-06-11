import { forwardRef, useImperativeHandle } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IMAGE_BASE_URL } from "@/utils/api";

const QuotationDetailsExcel = forwardRef(({ companyName, companyLogo }, ref) => {
    useImperativeHandle(ref, () => ({
        exportExcel: async (rows) => {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Quotation Report");
            let rowIndex = 1;

            // ---------- TABLE HEADERS ----------
            const headers = [
                "Date",
                "Company Name",
                "GSTIN Number",
                "Customer Person",
                "Mobile",
                "Email",
                "Billing Address",
                "Shipping Address",
                "Product Quotation Details (Name | Qty | Unit | Total)",
                "Final Amount",
                "Terms and Condition",
                "Assign To"
            ];

            const TOTAL_COLS = headers.length;

            // ========= FULL BORDER FUNCTIONS =========
            const applyFullBorder = (ws, rowNumber, startCol = 1, endCol = TOTAL_COLS) => {
                for (let col = startCol; col <= endCol; col++) {
                    const cell = ws.getCell(`${String.fromCharCode(64 + col)}${rowNumber}`);
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                }
            };

            const fullMergeBorder = (ws, row, startCol, endCol) => {
                ws.mergeCells(row, startCol, row, endCol);
                applyFullBorder(ws, row, startCol, endCol);
            };

            // ---------- HEADER ----------
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const headerCell = ws.getCell(`A${rowIndex}`);
            headerCell.value = companyName || "Company Name";
            headerCell.alignment = { vertical: "middle", horizontal: "center" };
            headerCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF4F81BD" },
            };
            headerCell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 16 };
            rowIndex++;

            // ---------- SUBHEADER ----------
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const subHeaderCell = ws.getCell(`A${rowIndex}`);
            subHeaderCell.value = "Quotation Details Report";
            subHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
            subHeaderCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF92D050" },
            };
            subHeaderCell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 14 };
            rowIndex++;

            // ---------- LOGO (CENTERED) ----------
            if (companyLogo) {
                const logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;
                const base64 = await fetch(logoUrl)
                    .then((res) => res.blob())
                    .then(
                        (blob) =>
                            new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () =>
                                    resolve({
                                        base64: reader.result.split(",")[1],
                                        type: blob.type,
                                    });
                                reader.readAsDataURL(blob);
                            })
                    );

                let extension = "png";
                if (base64.type) {
                    if (base64.type.includes("jpeg")) extension = "jpeg";
                    else if (base64.type.includes("png")) extension = "png";
                    else if (base64.type.includes("gif")) extension = "gif";
                    else if (base64.type.includes("bmp")) extension = "bmp";
                }

                const imageId = wb.addImage({ base64: base64.base64, extension });

                const startRow = rowIndex;
                const endRow = rowIndex + 3;
                const startCol = 1;
                const endCol = TOTAL_COLS;

                for (let col = startCol; col <= endCol; col++) {
                    ws.getCell(startRow, col).border = {
                        top: { style: "thin" },
                        left: col === startCol ? { style: "thin" } : undefined,
                        right: col === endCol ? { style: "thin" } : undefined,
                    };
                }

                for (let col = startCol; col <= endCol; col++) {
                    ws.getCell(endRow, col).border = {
                        bottom: { style: "thin" },
                        left: col === startCol ? { style: "thin" } : undefined,
                        right: col === endCol ? { style: "thin" } : undefined,
                    };
                }

                for (let row = startRow + 1; row < endRow; row++) {
                    ws.getCell(row, startCol).border = { left: { style: "thin" } };
                    ws.getCell(row, endCol).border = { right: { style: "thin" } };
                }

                const centerCol = (startCol + endCol) / 1.8;
                ws.addImage(imageId, {
                    tl: { col: centerCol - 1, row: rowIndex - 1 },
                    br: { col: centerCol + 1, row: rowIndex + 2 },
                    editAs: "oneCell",
                });
                rowIndex += 4;
            }

            // ---------- COLUMN HEADERS ----------
            ws.addRow(headers);
            const headerRow = ws.getRow(rowIndex);
            headerRow.font = { bold: true, color: { argb: "#053054" } };
            headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            headerRow.height = 40;
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFD9E1E9" },
                };
                cell.border = {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
            });
            rowIndex++;

            // ---------- TABLE DATA ----------
            rows.forEach((q) => {
                const formatAddress = (addr) => {
                    if (typeof addr === "string") {
                        try {
                            const parsed = JSON.parse(addr);
                            return `${parsed.street || ""}, ${parsed.city || ""}, ${parsed.state || ""} - ${parsed.pincode || ""}`;
                        } catch {
                            return addr;
                        }
                    }
                    if (typeof addr === "object" && addr !== null) {
                        return `${addr.street || ""}, ${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`;
                    }
                    return "";
                };

                const billingAddr = formatAddress(q.billingAddress);
                const shippingAddr = formatAddress(q.shippingAddress);

                const productDetails = (() => {
                    const intra = q.productQuotationDetails?.intrastate || [];
                    const inter = q.productQuotationDetails?.interstate || [];
                    const all = [...intra, ...inter];
                    if (all.length === 0) return "No products";
                    return all
                        .map((p, i) => `${i + 1}. ${p.product} (${p.quantity} ${p.unit}) - ₹${p.total}`)
                        .join("\n");
                })();

                const terms = q.termsAndConditions
                    ? q.termsAndConditions.replace(/<[^>]*>/g, "").trim()
                    : "";

                const assignedTo = Array.isArray(q.assignedTo)
                    ? q.assignedTo.join(", ")
                    : q.assignedTo || "";

                const dataRow = ws.addRow([
                    q.date || new Date(q.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-"),
                    q.companyName || "",
                    q.gstinNo || "",
                    q.customerPerson || "",
                    q.mobile || "",
                    q.email || "",
                    billingAddr,
                    shippingAddr,
                    productDetails,
                    q.finalAmt || 0,
                    terms,
                    assignedTo
                ]);

                dataRow.alignment = { wrapText: true, vertical: "top", horizontal: "left" };
                dataRow.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" },
                        bottom: { style: "thin" },
                    };
                });
                rowIndex++;
            });

            // ---------- AUTO COLUMN WIDTH ----------
            ws.columns.forEach((column) => {
                let maxLength = 15;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellValue = cell.value ? cell.value.toString() : "";
                    maxLength = Math.max(maxLength, cellValue.length + 5);
                });
                column.width = maxLength > 80 ? 80 : maxLength;
            });

            // =============== FOOTER ===============
            let footerImageBase64 = null;
            if (companyLogo) {
                try {
                    const logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;
                    footerImageBase64 = await fetch(logoUrl)
                        .then((res) => res.blob())
                        .then(
                            (blob) =>
                                new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result.split(",")[1]);
                                    reader.readAsDataURL(blob);
                                })
                        );
                } catch (err) {
                    console.warn("Footer logo load failed:", err);
                }
            }

            const footerImageId =
                footerImageBase64 && wb.addImage({ base64: footerImageBase64, extension: "jpeg" });

            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const generatedByCell = ws.getCell(`A${rowIndex}`);
            generatedByCell.value = "Generated by ";
            generatedByCell.alignment = { horizontal: "center", vertical: "middle" };
            generatedByCell.font = { size: 11, bold: true, color: { argb: "#053054" } };
            generatedByCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1E9" },
            };
            rowIndex++;

            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const copyrightCell = ws.getCell(`A${rowIndex}`);
            copyrightCell.value = companyName || "Your Company";
            copyrightCell.alignment = { horizontal: "center", vertical: "middle" };
            copyrightCell.font = { bold: true, color: { argb: "#053054" }, size: 13 };
            copyrightCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1E9" },
            };

            if (footerImageId) {
                ws.addImage(footerImageId, {
                    tl: { col: TOTAL_COLS - 4.1, row: rowIndex - 1 },
                    ext: { width: 60, height: 30 },
                    editAs: "oneCell",
                });
            }

            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Quotation_Report.xlsx");
        },
    }));

    return null;
});

export default QuotationDetailsExcel;
