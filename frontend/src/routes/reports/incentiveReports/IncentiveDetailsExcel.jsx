import { forwardRef, useImperativeHandle } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IMAGE_BASE_URL } from "@/utils/api";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const IncentiveDetailsExcel = forwardRef(({ companyName, companyLogo }, ref) => {
    useImperativeHandle(ref, () => ({
        exportExcel: async (rows) => {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Incentive Report");

            let rowIndex = 1;

            // ---------- TABLE HEADERS ----------
            const headers = [
                "Employee",
                "Month",
                "Product",
                "Targeted (₹)",
                "Eligible (₹)",
                "Achieved (₹)",
                "Formula",
                "Incentive (%)",
                "Incentive (₹)",
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
            subHeaderCell.value = "Incentive Details";
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
                let base64Data;
                try {
                    const response = await fetch(logoUrl);
                    const blob = await response.blob();
                    base64Data = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result.split(",")[1];
                            const type = blob.type;
                            resolve({ base64, type });
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn("Logo fetch failed:", err);
                }

                if (base64Data) {
                    let extension = "png";
                    if (base64Data.type.includes("jpeg")) extension = "jpeg";
                    else if (base64Data.type.includes("png")) extension = "png";

                    const imageId = wb.addImage({
                        base64: base64Data.base64,
                        extension,
                    });

                    const startRow = rowIndex;
                    const endRow = rowIndex + 3;

                    // Border around logo area
                    for (let col = 1; col <= TOTAL_COLS; col++) {
                        ws.getCell(startRow, col).border = { top: { style: "thin" } };
                        ws.getCell(endRow, col).border = { bottom: { style: "thin" } };
                    }
                    for (let row = startRow + 1; row < endRow; row++) {
                        ws.getCell(row, 1).border = { left: { style: "thin" } };
                        ws.getCell(row, TOTAL_COLS).border = { right: { style: "thin" } };
                    }

                    const centerCol = Math.floor(TOTAL_COLS / 2);
                    ws.addImage(imageId, {
                        tl: { col: centerCol - 1, row: rowIndex - 1 },
                        br: { col: centerCol + 1, row: rowIndex + 2 },
                        editAs: "oneCell",
                    });

                    rowIndex += 4;
                }
            }

            // ---------- TABLE HEADERS ----------
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

            // ---------- TABLE DATA ----------
            rows.forEach((item) => {
                const emp = item.employee;
                const empName = emp
                    ? [emp.salutation, emp.firstName, emp.middleName, emp.lastName]
                          .filter(Boolean)
                          .join(" ")
                          .trim() || "Unknown Employee"
                    : "Unknown Employee";

                const monthNum = item.month ? parseInt(item.month) : new Date(item.createdAt).getMonth() + 1;
                const monthName = months[monthNum - 1] || "Unknown";

                const product = item.selectedProductName || item.assignedIncentive?.selectedProductName || "-";

                const targeted = item.targeted_amount ?? item.assignedIncentive?.targeted_amount ?? 0;
                const eligible = item.eligible_amount ?? item.assignedIncentive?.eligible_amount ?? 0;
                const achieved = item.achieved_sales ?? 0;
                const formula = item.assignedIncentive?.formula?.formula_type || "-";
                const incentivePercent = item.display_rate || "-";
                const incentiveAmount = item.calculated_incentive ?? 0;

                const dataRow = ws.addRow([
                    empName,
                    monthName,
                    product,
                    `₹${targeted}`,
                    `₹${eligible}`,
                    `₹${achieved}`,
                    formula,
                    incentivePercent,
                    `₹${incentiveAmount}`,
                ]);

                dataRow.alignment = { wrapText: true, vertical: "middle", horizontal: "left" };
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
                column.width = maxLength;
            });

            // =============== FOOTER ===============
            let footerImageBase64 = null;
            if (companyLogo) {
                try {
                    const logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;
                    const response = await fetch(logoUrl);
                    const blob = await response.blob();
                    footerImageBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(",")[1]);
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn("Footer logo load failed:", err);
                }
            }

            const footerImageId = footerImageBase64 && wb.addImage({ base64: footerImageBase64, extension: "jpeg" });

            // First footer row - "Generated by"
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

            // Second footer row - Company Name + Logo
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const copyrightCell = ws.getCell(`A${rowIndex}`);
            copyrightCell.value = companyName || "Company Name";
            copyrightCell.alignment = { horizontal: "center", vertical: "middle" };
            copyrightCell.font = { bold: true, color: { argb: "#053054" }, size: 13 };
            copyrightCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1E9" },
            };

            if (footerImageId) {
                ws.addImage(footerImageId, {
                    tl: { col: TOTAL_COLS - 4, row: rowIndex - 1 },
                    ext: { width: 50, height: 25 },
                    editAs: "oneCell",
                });
            }

            // ---------- DOWNLOAD ----------
            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Incentive_Report.xlsx");
        },
    }));

    return null;
});

export default IncentiveDetailsExcel;