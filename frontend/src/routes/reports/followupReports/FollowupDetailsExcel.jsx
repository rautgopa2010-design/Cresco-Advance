import { forwardRef, useImperativeHandle } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IMAGE_BASE_URL } from "@/utils/api";

const FollowupDetailsExcel = forwardRef(({ companyName, companyLogo }, ref) => {
    useImperativeHandle(ref, () => ({
        exportExcel: async (rows) => {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Followup Report");
            let rowIndex = 1;

            const headers = [
                "Sr. No.",
                "Followup Date",
                "Company Name",
                "Stage",
                "Assigned To",
                "Status",
                "Description",
            ];
            const TOTAL_COLS = headers.length;

            // ========= FULL BORDER HELPERS =========
            const applyFullBorder = (ws, rowNumber, startCol = 1, endCol = TOTAL_COLS) => {
                for (let col = startCol; col <= endCol; col++) {
                    const cell = ws.getCell(`${String.fromCharCode(64 + col)}${rowIndex}`);
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

            // ---------- HEADER & SUBHEADER (unchanged) ----------
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            ws.getCell(`A${rowIndex}`).value = companyName || "Company Name";
            ws.getCell(`A${rowIndex}`).alignment = { vertical: "middle", horizontal: "center" };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
            ws.getCell(`A${rowIndex}`).font = { color: { argb: "FFFFFFFF" }, bold: true, size: 16 };
            rowIndex++;

            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            ws.getCell(`A${rowIndex}`).value = "Followup Details Report";
            ws.getCell(`A${rowIndex}`).alignment = { vertical: "middle", horizontal: "center" };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
            ws.getCell(`A${rowIndex}`).font = { color: { argb: "FFFFFFFF" }, bold: true, size: 14 };
            rowIndex++;

            // ---------- LOGO (centered - unchanged) ----------
            if (companyLogo) {
                try {
                    const logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;
                    const response = await fetch(logoUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    const base64data = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result.split(",")[1]);
                        reader.readAsDataURL(blob);
                    });
                    const extension = blob.type.includes("jpeg") ? "jpeg" : "png";
                    const imageId = wb.addImage({ base64: base64data, extension });

                    const centerCol = Math.floor(TOTAL_COLS / 1.5);
                    ws.addImage(imageId, {
                        tl: { col: centerCol - 1.5, row: rowIndex - 1 },
                        br: { col: centerCol + 1.5, row: rowIndex + 2 },
                        editAs: "oneCell",
                    });
                    rowIndex += 4;
                } catch (err) {
                    console.warn("Logo failed to load:", err);
                }
            }

            // ---------- TABLE HEADERS ----------
            ws.addRow(headers);
            const headerRow = ws.getRow(rowIndex);
            headerRow.font = { bold: true, color: { argb: "#053054" } };
            headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            headerRow.height = 30;
            headerRow.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1E9" } };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
            rowIndex++;

            // ---------- TABLE DATA ----------
            rows.forEach((fup, index) => {
                // ←←← NEW: Numbered list for Assigned To ←←←
                const assignedToList = Array.isArray(fup.assignedTo)
                    ? fup.assignedTo
                          .map((name, i) => `${i + 1}) ${name.trim()}`)
                          .join("\n")
                    : fup.assignedTo || "-";

                const row = ws.addRow([
                    index + 1,
                    fup.normalizedDate || "-",
                    fup.companyName || "Unknown",
                    fup.leadStage || "-",
                    assignedToList,           // ← changed here
                    fup.leadStatus || "-",
                    fup.followup_desc || "-",
                ]);

                row.alignment = { wrapText: true, vertical: "top", horizontal: "left" };
                row.height = 25;
                row.eachCell((cell) => {
                    cell.border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } };
                });
            });

            // ---------- AUTO COLUMN WIDTH ----------
            ws.columns.forEach((column, i) => {
                let maxLength = headers[i].length + 5;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const val = cell.value ? cell.value.toString() : "";
                    if (val.length > maxLength) maxLength = val.length + 5;
                });
                column.width = maxLength < 10 ? 15 : maxLength > 60 ? 60 : maxLength;
            });
            ws.getColumn(7).width = 50; // Description

            // =============== FOOTER WITH LOGO NEXT TO COMPANY NAME ===============
            rowIndex = ws.rowCount + 1;

            // Load footer logo once
            let footerImageId = null;
            if (companyLogo) {
                try {
                    const logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;
                    const blob = await fetch(logoUrl).then(r => r.blob());
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(",")[1]);
                        reader.readAsDataURL(blob);
                    });
                    footerImageId = wb.addImage({
                        base64,
                        extension: blob.type.includes("jpeg") ? "jpeg" : "png",
                    });
                } catch (err) {
                    console.warn("Footer logo failed:", err);
                }
            }

            // "Generated by" row
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            ws.getCell(`A${rowIndex}`).value = "Generated by";
            ws.getCell(`A${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
            ws.getCell(`A${rowIndex}`).font = { size: 11, bold: true, color: { argb: "#053054" } };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1E9" } };
            rowIndex++;

            // Company name + logo on the SAME row
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            const companyFooterCell = ws.getCell(`A${rowIndex}`);
            companyFooterCell.value = companyName || "Company";
            companyFooterCell.alignment = { horizontal: "center", vertical: "middle" };
            companyFooterCell.font = { bold: true, color: { argb: "#053054" }, size: 13 };
            companyFooterCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1E9" } };

            // Place logo on the right side of the same row
            if (footerImageId) {
                ws.addImage(footerImageId, {
                    tl: { col: TOTAL_COLS - 2, row: rowIndex - 1 },
                    ext: { width: 60, height: 30 },               
                    editAs: "oneCell",
                });
            }

            // ---------- DOWNLOAD ----------
            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Followup_Report.xlsx");
        },
    }));

    return null;
});

FollowupDetailsExcel.displayName = "FollowupDetailsExcel";
export default FollowupDetailsExcel;
