import { forwardRef, useImperativeHandle } from "react";
import { IMAGE_BASE_URL } from "@/utils/api";

const OrderPrint = forwardRef((props, ref) => {
    const { companyName = "", companyLogo = "", order = null, prefix = null } = props;

    useImperativeHandle(ref, () => ({
        print: () => {
            if (!order) {
                alert("No order selected to print!");
                return;
            }

            const formattedOrderNo = prefix?.orderPrefix 
                ? `${prefix.orderPrefix}-${order.orderNo}` 
                : order.orderNo || "-";
            const intrastate = order.productOrderDetails?.intrastate || [];
            const interstate = order.productOrderDetails?.interstate || [];
            const billing = order.billingAddress || {};
            const shipping = order.shippingAddress || {};
            const paymentDetails = order.orderPaymentDetails || [];
            const totalDueAmount = paymentDetails.reduce((sum, payment) => sum + (Number(payment.dueAmount) || 0), 0);
            const totalReceivedAmount = paymentDetails.reduce((sum, payment) => sum + (Number(payment.receivedAmount) || 0), 0);
            const balanceAmount = totalDueAmount - totalReceivedAmount;

            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                alert("Please allow popups to print.");
                return;
            }

            printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Order Print</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        @page {
            size: A4;
            margin: 0;
        }

        @media print {
            html, body {
                height: 100%;
            }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
        }

        /* ================= HEADER (repeats on every page) ================= */
        .print-header {
            width: 100%;
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0px 15px;
            border-bottom: 1px solid #ccc;
            background: white;
        }

        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #053054;
        }

        .logo-box img {
            width: 130px;
            margin-top: 10px;
        }

        /* ================= FOOTER (repeats on every page) ================= */
        .print-footer {
            width: 100%;
            text-align: center;
            padding: 20px 0px 15px;
            border-top: 1px solid #ccc;
            font-size: 12px;
            background: white;
        }
                                  
        .footer-logo {
            width: 60px;
            margin-top: 5px;
        }

        .company {
            font-weight: bold;
            color: #053054;
        }

        /* ================= MAIN CONTENT ================= */
        .content-container {
            background: #f5f7fb;
        }

        .card {
            background: white;
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.06);
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .order-info {
            text-align: center;
            font-size: 17px;
            font-weight: bold;
            background: linear-gradient(135deg, #053054, #0b5fa5);
            color: white;
            padding: 14px;
            border-radius: 10px;
            letter-spacing: 0.5px;
        }

        .customer-info-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 20px;
            font-size: 15px;
            line-height: 1.8;
        }

        .customer-to {
            text-align: left;
        }

        .customer-to strong {
            color: #053054;
        }

        .order-meta {
            text-align: right;
            font-size: 15px;
        }

        .order-meta div {
            margin-bottom: 6px;
        }

        .order-meta strong {
            color: #053054;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 20px;
        }

        .address-box {
            background: #f9fbff;
            border-left: 5px solid #053054;
            padding: 18px;
            border-radius: 12px;
            page-break-inside: avoid;
        }

        .address-box h3 {
            margin: 0 0 10px;
            font-size: 16px;
            color: #053054;
        }

        .section-title {
            font-size: 19px;
            font-weight: bold;
            color: #053054;
            margin: 40px 0 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            page-break-after: avoid;
        }

        .section-title::before {
            content: "";
            width: 6px;
            height: 22px;
            background: #053054;
            border-radius: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            font-size: 14px;
            margin-bottom: 30px;
        }

        th {
            background: linear-gradient(135deg, #053054, #0b5fa5);
            color: white;
            padding: 12px 10px;
            text-align: left;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .final-amount {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            color: #053054;
            background: #eaf3ff;
            padding: 15px;
            border-radius: 10px;
            margin: 40px 0 30px;
            page-break-inside: avoid;
            page-break-before: avoid;
        }

        .payment-summary {
            background: #f9f9f9;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            border: 1px solid #ddd;
            page-break-inside: avoid;
        }

        .payment-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .payment-summary-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #053054;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .payment-summary-item strong {
            display: block;
            color: #053054;
            margin-bottom: 5px;
        }

        .appreciation-box {
            background: linear-gradient(135deg, #eaf3ff, #f9fbff);
            border-left: 6px solid #053054;
            padding: 20px;
            border-radius: 12px;
            margin-top: 35px;
            font-size: 15px;
            line-height: 1.8;
            page-break-inside: avoid;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            margin-left: 10px;
        }

        .status-pending { background: #ffefc6; color: #b87d00; }
        .status-completed { background: #d1f7c4; color: #0e6245; }
        .status-partially-paid { background: #ffd5d5; color: #c41e3a; }
        .status-canceled { background: #ffd5d5; color: #c41e3a; }
    </style>
</head>
<body>

<table style="width:100%; height:100%; table-layout:fixed; border-collapse: collapse;">
    <thead>
        <tr>
            <td style="padding-top: 20px;">
                <div class="print-header">
                    <div class="company-name">${companyName}</div>
                    <div class="logo-box">
                        <img src="${IMAGE_BASE_URL}${companyLogo}" alt="Company Logo" />
                    </div>
                </div>
            </td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td valign="top">
                <div class="content-container">

                    <div class="card">
                        <div class="order-info">
                            Order Details
                        </div>

                        <div class="customer-info-grid">
                            <div class="customer-to">
                                To,<br/>
                                ${order.selectedCompany ? `<span>Company Name: </span><strong>${order.selectedCompany}</strong><br/>` : ""}
                                <span>Customer Name: </span><strong>${order.customerPerson}</strong><br/>
                                📞 ${order.mobile} &nbsp; | &nbsp; ✉️ ${order.email}
                            </div>

                            <div class="order-meta">
                                <div><strong>Order No:</strong> ${formattedOrderNo}</div>
                                <div><strong>Date:</strong> ${order.date}</div>
                                ${order.gstinNo ? `<div><strong>GSTIN:</strong> ${order.gstinNo}</div>` : ""}
                                <span class="status-badge status-${order.status?.toLowerCase()}">
                                Status: ${order.status || "Pending"}
                            </span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="details-grid">
                            <div class="address-box">
                                <h3>Billing Address</h3>
                                ${billing.street || ""}<br/>
                                ${billing.city ? `${billing.city}, ` : ""}${billing.zone || ""}<br/>
                                ${billing.state || ""}, ${billing.country || ""} - ${billing.pincode || "-"}
                            </div>

                            <div class="address-box">
                                <h3>Shipping Address</h3>
                                ${shipping.street || ""}<br/>
                                ${shipping.city ? `${shipping.city}, ` : ""}${shipping.zone || ""}<br/>
                                ${shipping.state || ""}, ${shipping.country || ""} - ${shipping.pincode || "-"}
                            </div>
                        </div>
                    </div>

                    ${
                        intrastate.length > 0
                            ? `
                    <div class="section-title">Intrastate Products</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>HSN</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>Price/Unit</th>
                                <th>GST (C+S)</th>
                                <th>Subtotal</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${intrastate
                                .map(
                                    (p, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${p.product}</td>
                                <td>${p.productBrand || "-"}</td>
                                <td>${p.hsnCode}</td>
                                <td>${p.quantity}</td>
                                <td>${p.unit}</td>
                                <td>₹${p.pricePerUnit}</td>
                                <td>${p.cgst}% + ${p.sgst}%</td>
                                <td>₹${p.subTotal}</td>
                                <td>₹${p.total}</td>
                            </tr>`,
                                )
                                .join("")}
                        </tbody>
                    </table>`
                            : ""
                    }

                    ${
                        interstate.length > 0
                            ? `
                    <div class="section-title">Interstate Products</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>HSN</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>Price/Unit</th>
                                <th>IGST</th>
                                <th>Subtotal</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${interstate
                                .map(
                                    (p, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${p.product}</td>
                                <td>${p.productBrand || "-"}</td>
                                <td>${p.hsnCode}</td>
                                <td>${p.quantity}</td>
                                <td>${p.unit}</td>
                                <td>₹${p.pricePerUnit}</td>
                                <td>${p.igst}%</td>
                                <td>₹${p.subTotal}</td>
                                <td>₹${p.total}</td>
                            </tr>`,
                                )
                                .join("")}
                        </tbody>
                    </table>`
                            : ""
                    }

                    <div class="final-amount">
                        Final Amount: ₹ ${order.finalAmt}
                    </div>

                    ${
                        paymentDetails.length > 0
                            ? `
                    <div class="section-title">Payment Details</div>
                    <div class="payment-summary">
                        <div class="payment-summary-grid">
                            <div class="payment-summary-item">
                                <strong>Total Due Amount</strong>
                                ₹ ${totalDueAmount.toFixed(2)}
                            </div>
                            <div class="payment-summary-item">
                                <strong>Total Received</strong>
                                ₹ ${totalReceivedAmount.toFixed(2)}
                            </div>
                            <div class="payment-summary-item">
                                <strong>Balance Amount</strong>
                                ₹ ${balanceAmount.toFixed(2)}
                            </div>
                        </div>
                        
                        <div class="section-title" style="margin-top: 30px; font-size: 16px;">Payment Schedule</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Due Date</th>
                                    <th>Due Amount</th>
                                    <th>Received Amount</th>
                                    <th>Payment %</th>
                                    <th>Status</th>
                                    <th>Narration</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paymentDetails
                                    .map(
                                        (payment, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${payment.dueDate}</td>
                                    <td>₹${payment.dueAmount}</td>
                                    <td>₹${payment.receivedAmount}</td>
                                    <td>${payment.paymentPercent}%</td>
                                    <td>
                                        <span class="status-badge status-${(payment.status || "Pending").toLowerCase().replace(/\s+/g, "-")}">
    ${payment.status || "Pending"}
</span>
                                    </td>
                                    <td>${payment.narration || "-"}</td>
                                </tr>`,
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                    </div>`
                            : `
                    <div class="payment-summary">
                        <div class="payment-summary-item" style="text-align: center; width: 100%;">
                            <strong>No Payment Details Available</strong>
                        </div>
                    </div>`
                    }

                    <div class="appreciation-box">
                        <strong>Thank you for your order.</strong><br/>
                        We are committed to providing you with the best service and quality products. 
                        Your satisfaction is our top priority, and we look forward to serving you again in the future.
                        <br/><br/>
                        <strong>For any queries or support, please contact our customer service team.</strong>
                    </div>

                </div>
            </td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td style="padding-bottom: 20px;">
                <div class="print-footer">
                    <div class="company">Generated by ${companyName}</div>
                    <img src="${IMAGE_BASE_URL}${companyLogo}" class="footer-logo" alt="Footer Logo" />
                </div>
            </td>
        </tr>
    </tfoot>
</table>

</body>
</html>
            `);

            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 600);
        },
    }));

    return null;
});

export default OrderPrint;
