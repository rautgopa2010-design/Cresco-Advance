import { forwardRef, useImperativeHandle } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IMAGE_BASE_URL } from "@/utils/api";

const RegisteredCustomersDetailsExcel = forwardRef(({ companyName, companyLogo }, ref) => {
    useImperativeHandle(ref, () => ({
        exportExcel: async (rows) => {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Registered Customers Report");

            let rowIndex = 1;

            // ---------- TABLE HEADERS ----------
            const headers = [
                "Company Name",
                "Customer Name",
                "Email",
                "Mobile",
                "Package",
                "Payment Status",
                "Status",
                "Registration Date",
                "Expiry Date",
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
            subHeaderCell.value = "Registered Customers Details";
            subHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
            subHeaderCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF92D050" },
            };
            subHeaderCell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 14 };
            rowIndex++;

            // ---------- LOGO (PERFECT CENTER ALIGNMENT) ----------
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
                            }),
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

                // Apply top border
                for (let col = startCol; col <= endCol; col++) {
                    ws.getCell(startRow, col).border = {
                        top: { style: "thin" },
                        left: col === startCol ? { style: "thin" } : undefined,
                        right: col === endCol ? { style: "thin" } : undefined,
                    };
                }

                // Apply bottom border
                for (let col = startCol; col <= endCol; col++) {
                    ws.getCell(endRow, col).border = {
                        bottom: { style: "thin" },
                        left: col === startCol ? { style: "thin" } : undefined,
                        right: col === endCol ? { style: "thin" } : undefined,
                    };
                }

                // Apply left border
                for (let row = startRow + 1; row < endRow; row++) {
                    ws.getCell(row, startCol).border = { left: { style: "thin" } };
                }

                // Apply right border
                for (let row = startRow + 1; row < endRow; row++) {
                    ws.getCell(row, endCol).border = { right: { style: "thin" } };
                }

                const centerCol = (startCol + endCol) / 1.6;

                ws.addImage(imageId, {
                    tl: { col: centerCol - 1, row: rowIndex - 1 },
                    br: { col: centerCol + 1, row: rowIndex + 2 },
                    editAs: "oneCell",
                });

                rowIndex += 4;
            }

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
            rows.forEach((c) => {
                const dataRow = ws.addRow([
                    c.company || "",
                    c.customerName || "",
                    c.email || "",
                    c.mobile || "",
                    c.package || "N/A",
                    c.paymentStatus || "N/A",
                    c.status || "N/A",
                    c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "N/A",
                    c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-GB") : "N/A",
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
                column.width = maxLength;
            });

            // =============== FOOTER LOGO ===============
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
                                }),
                        );
                } catch (err) {
                    console.warn("Footer logo load failed:", err);
                }
            }

            const footerImageId =
                footerImageBase64 &&
                wb.addImage({ base64: footerImageBase64, extension: "jpeg" });

            // First footer row
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

            // Second footer row
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);

            const copyrightCell = ws.getCell(`A${rowIndex}`);
            copyrightCell.value = companyName;
            copyrightCell.alignment = { horizontal: "center", vertical: "middle" };
            copyrightCell.font = { bold: true, color: { argb: "#053054" }, size: 13 };
            copyrightCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1E9" },
            };

            if (footerImageId) {
                ws.addImage(footerImageId, {
                    tl: { col: TOTAL_COLS - 3, row: rowIndex - 1 },
                    ext: { width: 50, height: 30 },
                    editAs: "oneCell",
                });
            }

            // ---------- DOWNLOAD ----------
            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Registered_Customers_Report.xlsx");
        },
    }));

    return null;
});

export default RegisteredCustomersDetailsExcel;