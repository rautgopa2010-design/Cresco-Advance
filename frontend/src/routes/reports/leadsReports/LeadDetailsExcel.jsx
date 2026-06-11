import { forwardRef, useImperativeHandle } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IMAGE_BASE_URL } from "@/utils/api";

const LeadDetailsExcel = forwardRef(({ companyName, companyLogo }, ref) => {
    useImperativeHandle(ref, () => ({
        exportExcel: async (rows) => {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Lead Report");

            let rowIndex = 1;

            const headers = [
                "Date",
                "Company Name",
                "GSTIN Number",
                "Customer",
                "Mobile",
                "Email",
                "Description",
                "Billing Address",
                "Shipping Address",
                "Expected Amount",
                "Expected Closing Date",
                "Assigned To",
                "Lead Source",
                "Lead Stage",
                "Lead Status",
                "Followup Date",
                "Products",
            ];

            const TOTAL_COLS = headers.length;

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

            // ================= HEADER ===================
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

            // ================= SUBHEADER ==================
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const subHeaderCell = ws.getCell(`A${rowIndex}`);
            subHeaderCell.value = "Lead Details";
            subHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
            subHeaderCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF92D050" },
            };
            subHeaderCell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 14 };
            rowIndex++;

            // =============== COMPANY LOGO (HEADER) ===============
            let logoUrl = null;
            if (companyLogo) logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;

            if (logoUrl) {
                try {
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
                    if (base64.type.includes("jpeg")) extension = "jpeg";
                    else if (base64.type.includes("png")) extension = "png";

                    const imageId = wb.addImage({ base64: base64.base64, extension });

                    const startRow = rowIndex;
                    const endRow = rowIndex + 3;

                    // Borders around logo block
                    for (let col = 1; col <= TOTAL_COLS; col++) {
                        ws.getCell(startRow, col).border = {
                            top: { style: "thin" },
                            left: col === 1 ? { style: "thin" } : undefined,
                            right: col === TOTAL_COLS ? { style: "thin" } : undefined,
                        };
                        ws.getCell(endRow, col).border = {
                            bottom: { style: "thin" },
                            left: col === 1 ? { style: "thin" } : undefined,
                            right: col === TOTAL_COLS ? { style: "thin" } : undefined,
                        };
                    }

                    for (let row = startRow + 1; row < endRow; row++) {
                        ws.getCell(row, 1).border = { left: { style: "thin" } };
                        ws.getCell(row, TOTAL_COLS).border = { right: { style: "thin" } };
                    }

                    const centerCol = TOTAL_COLS / 1.8;

                    ws.addImage(imageId, {
                        tl: { col: centerCol - 1, row: rowIndex - 1 },
                        br: { col: centerCol + 1, row: rowIndex + 2 },
                    });

                    rowIndex += 4;
                } catch (err) {
                    console.warn("Header logo load failed:", err);
                }
            }

            // ================= TABLE HEADER ==================
            ws.addRow(headers);
            const headerRow = ws.getRow(rowIndex);
            headerRow.font = { bold: true, color: { argb: "#053054" } };
            headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            headerRow.height = 30;

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

            // ================= DATA ROWS ===================
            (rows || []).forEach((c) => {
                let dateVal = c.date || "";
                if (!dateVal && c.createdAt) {
                    try {
                        const d = new Date(c.createdAt);
                        const dd = String(d.getDate()).padStart(2, "0");
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const yyyy = d.getFullYear();
                        dateVal = `${dd}-${mm}-${yyyy}`;
                    } catch {
                        dateVal = c.createdAt;
                    }
                }

                const billingAddress =
                    `${c.billingStreet || ""}, ${c.billingCity || ""}, ${c.billingState || ""}, ${c.billingPincode || ""}, ${c.billingCountry || ""}`.replace(
                        /,\s*,/g,
                        ","
                    );

                const shippingAddress =
                    `${c.shippingStreet || ""}, ${c.shippingCity || ""}, ${c.shippingState || ""}, ${c.shippingPincode || ""}, ${c.shippingCountry || ""}`.replace(
                        /,\s*,/g,
                        ","
                    );

                const assignedToNames = Array.isArray(c.assignedTo)
                    ? c.assignedTo.join(", ")
                    : c.assignedTo || "";

                let followupDate = "";
                if (Array.isArray(c.followups) && c.followups.length > 0) {
                    followupDate = c.followups[0].followup_date || "";
                }

                let productList = "";
                if (Array.isArray(c.products) && c.products.length > 0) {
                    productList = c.products
                        .map((p) => p.product || p.productName || p.description || "")
                        .filter(Boolean)
                        .join(", ");
                }

                const dataRow = ws.addRow([
                    dateVal,
                    c.companyName || "",
                    c.gstinNo || "",
                    c.customerPerson || "",
                    c.mobile || "",
                    c.email || "",
                    c.description || "",
                    billingAddress,
                    shippingAddress,
                    c.expectedAmount || "",
                    c.expectedClosingDate || "",
                    assignedToNames,
                    c.leadSource || "",
                    c.leadStage || "",
                    c.leadStatus || "",
                    followupDate,
                    productList,
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

            // ================= AUTO COLUMN WIDTH =================
            ws.columns.forEach((column) => {
                let maxLength = 15;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const val = cell.value ? cell.value.toString() : "";
                    maxLength = Math.max(maxLength, val.length + 5);
                });
                column.width = maxLength;
            });

            // ================= FOOTER LOGO (same as header logo) =================
            let footerBase64 = null;

            if (logoUrl) {
                try {
                    footerBase64 = await fetch(logoUrl)
                        .then((res) => res.blob())
                        .then(
                            (blob) =>
                                new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result.split(",")[1]);
                                    reader.readAsDataURL(blob);
                                })
                        );
                } catch (e) {
                    console.warn("Footer logo load failed:", e);
                }
            }

            // First footer row
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const generatedByCell = ws.getCell(`A${rowIndex}`);
            generatedByCell.value = "Generated by";
            generatedByCell.alignment = { horizontal: "center", vertical: "middle" };
            generatedByCell.font = { size: 14, bold: true, color: { argb: "#053054" } };
            generatedByCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1E9" },
            };
            rowIndex++;

            // Second footer row
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const footerCell = ws.getCell(`A${rowIndex}`);
            footerCell.value = companyName || "";
            footerCell.alignment = { horizontal: "center", vertical: "middle" };
            footerCell.font = { bold: true, color: { argb: "#053054" }, size: 13 };
            footerCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1E9" },
            };

            if (footerBase64) {
                const footerImgId = wb.addImage({
                    base64: footerBase64,
                    extension: "jpeg",
                });

                ws.addImage(footerImgId, {
                    tl: { col: TOTAL_COLS - 8, row: rowIndex - 1 },
                    ext: { width: 60, height: 30 },
                });
            }

            // ================= DOWNLOAD =================
            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Lead_Report.xlsx");
        },
    }));

    return null;
});

export default LeadDetailsExcel;
