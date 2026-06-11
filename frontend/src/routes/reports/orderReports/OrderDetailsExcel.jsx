import { forwardRef, useImperativeHandle } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IMAGE_BASE_URL } from "@/utils/api";

const OrderDetailsExcel = forwardRef(({ companyName, companyLogo }, ref) => {
    useImperativeHandle(ref, () => ({
        exportExcel: async (rows) => {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Order Report");
            let rowIndex = 1;

            // ---------- TABLE HEADERS ----------
            const headers = [
                "Date",
                "Company Name",
                "Customer Name",
                "Mobile No",
                "Email Id",
                "Billing Address",
                "Shipping Address",
                "Order Products (Name | Qty | Unit | Total | GST Type)",
                "Payment Details",
                "Final Amount",
                "Status",
            ];
            const TOTAL_COLS = headers.length;

            // ========= FULL BORDER HELPERS =========
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
            ws.getCell(`A${rowIndex}`).value = companyName || "Company Name";
            ws.getCell(`A${rowIndex}`).alignment = { vertical: "middle", horizontal: "center" };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
            ws.getCell(`A${rowIndex}`).font = { color: { argb: "FFFFFFFF" }, bold: true, size: 16 };
            rowIndex++;

            // ---------- SUBHEADER ----------
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            ws.getCell(`A${rowIndex}`).value = "Order Details Report";
            ws.getCell(`A${rowIndex}`).alignment = { vertical: "middle", horizontal: "center" };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
            ws.getCell(`A${rowIndex}`).font = { color: { argb: "FFFFFFFF" }, bold: true, size: 14 };
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
                    tl: { col: centerCol - 0.6, row: rowIndex - 1 },
                    br: { col: centerCol + 0.6, row: rowIndex + 2 },
                    editAs: "oneCell",
                });
                rowIndex += 4;
            }

            // ---------- COLUMN HEADERS ----------
            ws.addRow(headers);
            const headerRow = ws.getRow(rowIndex);
            headerRow.font = { bold: true, color: { argb: "#053054" } };
            headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            headerRow.height = 45;
            headerRow.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1E9" } };
                cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
            });
            rowIndex++;

            // ---------- HELPER FORMATTERS ----------
            const formatAddress = (addr) => {
                if (!addr) return "";
                if (typeof addr === "string") {
                    try { addr = JSON.parse(addr); } catch { }
                }
                if (typeof addr === "object" && addr !== null) {
                    return `${addr.street || ""}, ${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`.trim();
                }
                return "";
            };

            const formatProducts = (order) => {
                const intra = order.productOrderDetails?.intrastate || [];
                const inter = order.productOrderDetails?.interstate || [];
                const all = [...intra, ...inter];

                if (all.length === 0) return "No products";

                return all
                    .map((p, i) => {
                        const gstType = p.gstinType === "Interstate" ? "IGST" : "CGST+SGST";
                        return `${i + 1}. ${p.product} | ${p.quantity} ${p.unit} | ₹${p.total} | ${gstType}`;
                    })
                    .join("\n");
            };

            const formatPayments = (payments) => {
                if (!payments || payments.length === 0) return "No payment details";
                return payments
                    .map((pay) => `₹${pay.receivedAmount} (${pay.paymentPercent}%)${pay.status ? " - " + pay.status : ""}`)
                    .join("\n");
            };

            // ---------- TABLE DATA ----------
            rows.forEach((order) => {
                const billing = formatAddress(order.billingAddress);
                const shipping = formatAddress(order.shippingAddress);
                const products = formatProducts(order);
                const payments = formatPayments(order.orderPaymentDetails);

                const dataRow = ws.addRow([
                    order.date || new Date(order.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-"),
                    order.selectedCompany || "",
                    order.customerPerson || "",
                    order.mobile || "",
                    order.email || "",
                    billing,
                    shipping,
                    products,
                    payments,
                    order.finalAmt || "0",
                    order.status || "",
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
                    const val = cell.value ? cell.value.toString() : "";
                    maxLength = Math.max(maxLength, val.length + 5);
                });
                column.width = maxLength > 80 ? 80 : maxLength;
            });

            // =============== FOOTER ===============
            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            ws.getCell(`A${rowIndex}`).value = "Generated by ";
            ws.getCell(`A${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
            ws.getCell(`A${rowIndex}`).font = { size: 11, bold: true, color: { argb: "#053054" } };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1E9" } };
            rowIndex++;

            fullMergeBorder(ws, rowIndex, 1, TOTAL_COLS);
            ws.getCell(`A${rowIndex}`).value = companyName || "Your Company";
            ws.getCell(`A${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
            ws.getCell(`A${rowIndex}`).font = { bold: true, color: { argb: "#053054" }, size: 13 };
            ws.getCell(`A${rowIndex}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1E9" } };

            // Footer logo (optional)
            if (companyLogo) {
                try {
                    const logoUrl = `${IMAGE_BASE_URL}${companyLogo}`;
                    const res = await fetch(logoUrl);
                    const blob = await res.blob();
                    const reader = new FileReader();
                    const base64 = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result.split(",")[1]);
                        reader.readAsDataURL(blob);
                    });
                    const ext = blob.type.includes("jpeg") ? "jpeg" : "png";
                    const imgId = wb.addImage({ base64, extension: ext });
                    ws.addImage(imgId, {
                        tl: { col: TOTAL_COLS - 4, row: rowIndex - 1 },
                        ext: { width: 60, height: 30 },
                    });
                } catch (e) { /* ignore */ }
            }

            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Order_Report.xlsx");
        },
    }));

    // Component renders nothing in DOM
    return null;
});

OrderDetailsExcel.displayName = "OrderDetailsExcel";
export default OrderDetailsExcel;