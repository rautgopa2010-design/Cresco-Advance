import { forwardRef, useImperativeHandle } from "react";
import { IMAGE_BASE_URL } from "@/utils/api";

const OrderPaymentPrint = forwardRef((props, ref) => {
    const { companyName = "", companyLogo = "", order = null, payment = null, prefix = null } = props;

    useImperativeHandle(ref, () => ({
        print: () => {
            if (!order || !payment) {
                alert("No payment selected to print!");
                return;
            }

            const formattedOrderNo = prefix?.orderPrefix 
                ? `${prefix.orderPrefix}-${order.orderNo}` 
                : order.orderNo || "-";
            const billing = order.billingAddress || {};
            const shipping = order.shippingAddress || {};

            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                alert("Please allow popups to print.");
                return;
            }

            printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Payment Receipt - ${payment.paymentId}</title>
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
            padding: 20px;
        }

        .card {
            background: white;
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.06);
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .receipt-header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(135deg, #053054, #0b5fa5);
            color: white;
            padding: 14px;
            border-radius: 10px;
            letter-spacing: 0.5px;
            margin-bottom: 20px;
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

        .payment-meta {
            text-align: right;
            font-size: 15px;
        }

        .payment-meta div {
            margin-bottom: 6px;
        }

        .payment-meta strong {
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

        .payment-details {
            margin: 30px 0;
        }

        .payment-details table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            font-size: 14px;
        }

        .payment-details th {
            background: linear-gradient(135deg, #053054, #0b5fa5);
            color: white;
            padding: 12px 10px;
            text-align: left;
        }

        .payment-details td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }

        .payment-details tr:last-child td {
            border-bottom: none;
        }

        .amount-box {
            background: #eaf3ff;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }

        .amount-box .label {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
        }

        .amount-box .amount {
            font-size: 32px;
            font-weight: bold;
            color: #053054;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }

        .status-paid { background: #d1f7c4; color: #0e6245; }
        .status-pending { background: #ffefc6; color: #b87d00; }

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

        .section-title {
            font-size: 19px;
            font-weight: bold;
            color: #053054;
            margin: 30px 0 15px;
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
                        <div class="receipt-header">
                            PAYMENT RECEIPT
                        </div>

                        <div class="customer-info-grid">
                            <div class="customer-to">
                                To,<br/>
                                ${order.selectedCompany ? `<span>Company Name: </span><strong>${order.selectedCompany}</strong><br/>` : ""}
                                <span>Customer Name: </span><strong>${order.customerPerson}</strong><br/>
                                📞 ${order.mobile} &nbsp; | &nbsp; ✉️ ${order.email}
                            </div>

                            <div class="payment-meta">
                                <div><strong>Order No:</strong> ${formattedOrderNo}</div>
                                <div><strong>Payment ID:</strong> ${payment.paymentId}</div>
                                <div><strong>Payment Date:</strong> ${payment.payDate}</div>
                                ${order.gstinNo ? `<div><strong>GSTIN:</strong> ${order.gstinNo}</div>` : ""}
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

                    <div class="section-title">Payment Information</div>
                    
                    <div class="payment-details">
                        <table>
                            <thead>
                                <tr>
                                    <th>Payment Mode</th>
                                    <th>Amount Paid</th>
                                    <th>Payment Date</th>
                                    <th>Transaction Ref</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${payment.payMode}</td>
                                    <td><strong>₹${payment.amount}</strong></td>
                                    <td>${payment.payDate}</td>
                                    <td>${payment.transactionRef || "-"}</td>
                                    <td>
                                        <span class="status-badge status-paid">Paid</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    ${
                        payment.payMode === "Cheque" && (payment.bankName || payment.chequeNo) ? `
                        <div class="payment-details">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bank Name</th>
                                        <th>Branch</th>
                                        <th>Cheque No.</th>
                                        <th>Cheque Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${payment.bankName || "-"}</td>
                                        <td>${payment.branch || "-"}</td>
                                        <td>${payment.chequeNo || "-"}</td>
                                        <td>${payment.chequeDate || "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        ` : ""
                    }

                    <div class="amount-box">
                        <div class="label">Total Amount Paid</div>
                        <div class="amount">₹ ${payment.amount}</div>
                    </div>

                    <div class="appreciation-box">
                        <strong>Thank you for your payment.</strong><br/>
                        This is a system generated receipt and does not require a signature.
                        Please keep this receipt for future reference.
                        <br/><br/>
                        <strong>For any queries regarding this payment, please contact our customer service team.</strong>
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

export default OrderPaymentPrint;