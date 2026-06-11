import { forwardRef, useImperativeHandle } from "react";
import { IMAGE_BASE_URL } from "../../../../utils/api";

const ProviderPaymentReceiptPrint = forwardRef((props, ref) => {
    const { companyName = "", companyLogo = "", receipt = null } = props;

    useImperativeHandle(ref, () => ({
        print: () => {
            if (!receipt) {
                alert("No payment receipt data available!");
                return;
            }

            const {
                company,     // provider / your company
                customer,    // organization / client
                payment,
            } = receipt;

            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                alert("Please allow popups to print the receipt.");
                return;
            }

            // Format date nicely
            const formatDate = (dateStr) => {
                if (!dateStr) return "—";
                return new Date(dateStr).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            };

            const receiptNo = payment.paymentId || payment.orderId || "—";

            printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Payment Receipt - ${receiptNo}</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #222;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

                @page {
            size: A4;
            margin: 0;
        }

        @media print {
            .no-print { display: none !important; }
        }

        .receipt-container {
            max-width: 210mm;
            margin: 0 auto;
        }

        /* Header - repeats on every page if multi-page */
        .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #053054;
            margin-bottom: 20px;
        }

        .company-info h1 {
            margin: 0;
            font-size: 22px;
            color: #053054;
            font-weight: 700;
        }

        .company-info p {
            margin: 4px 0 0;
            font-size: 13px;
            color: #444;
        }

        .logo img {
            max-height: 70px;
            max-width: 180px;
            object-fit: contain;
        }

        /* Title */
        .receipt-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #053054;
            margin: 20px 0 8px;
            letter-spacing: 0.5px;
        }

        .receipt-subtitle {
            text-align: center;
            color: #555;
            font-size: 15px;
            margin-bottom: 28px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
        }

        .party-box {
            background: #f8fbff;
            border: 1px solid #d0e0ff;
            border-radius: 8px;
            padding: 18px;
        }

        .party-box h3 {
            margin: 0 0 12px;
            color: #053054;
            font-size: 16px;
            border-bottom: 1px solid #053054;
            padding-bottom: 6px;
        }

        .party-detail {
            margin: 6px 0;
            font-size: 14px;
        }

        .party-detail strong {
            display: inline-block;
            width: 110px;
            color: #053054;
        }

        /* Payment Details */
        .payment-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            margin: 28px 0;
        }

        .amount-highlight {
            font-size: 32px;
            font-weight: bold;
            color: #006400;
            text-align: center;
            margin: 20px 0;
            padding: 16px;
            background: #f0fff0;
            border-radius: 12px;
            border: 2px dashed #8bc34a;
        }

        table.payment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14.5px;
        }

        .payment-table th,
        .payment-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }

        .payment-table th {
            background: #053054;
            color: white;
            font-weight: 600;
        }

        .payment-table .label {
            font-weight: 600;
            color: #053054;
            width: 160px;
        }

        .status-completed {
            background: #d4edda;
            color: #155724;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
        }

        .status-created {
            background: #fff3cd;
            color: #856404;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
        }

        .status-failed, .status-cancelled {
            background: #f8d7da;
            color: #721c24;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
        }

        .thank-you {
            text-align: center;
            margin: 40px 0 20px;
            font-size: 15px;
            color: #444;
            font-style: italic;
        }

        .signature {
            margin-top: 50px;
            text-align: right;
            font-size: 14px;
        }

        .signature-line {
            width: 220px;
            border-top: 1px solid #333;
            margin: 40px 0 8px auto;
        }

        /* Footer */
        .print-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>

<div class="receipt-container">

    <div class="print-header">
        <div class="company-info">
            <h1>${company.name || "Your Company"}</h1>
            ${company.providerName ? `<p>Name: ${company.providerName}</p>` : ""}
            ${company.email ? `<p>Email: ${company.email}</p>` : ""}
            ${company.mobile ? `<p>Mobile: ${company.mobile}</p>` : ""}
        </div>
        <div class="logo">
            ${
                company.logo
                    ? `<img src="${IMAGE_BASE_URL}${company.logo}" alt="Company Logo" />`
                    : "<p>No Logo</p>"
            }
        </div>
    </div>

    <div class="receipt-title">PAYMENT RECEIPT</div>
    <div class="receipt-subtitle">Receipt No: ${receiptNo}</div>

    <div class="info-grid">
        <div class="party-box">
            <h3>Received From</h3>
            <div class="party-detail"><strong>Company:</strong> ${customer.companyName || "—"}</div>
            <div class="party-detail"><strong>Name:</strong> ${customer.fullName || "—"}</div>
            ${customer.email ? `<div class="party-detail"><strong>Email:</strong> ${customer.email}</div>` : ""}
            ${customer.mobile ? `<div class="party-detail"><strong>Mobile:</strong> ${customer.mobile}</div>` : ""}
        </div>

        <div class="party-box">
            <h3>Payment Details</h3>
            <div class="party-detail"><strong>Date:</strong> ${formatDate(payment.createdAt)}</div>
            <div class="party-detail"><strong>Order ID:</strong> ${payment.orderId || "—"}</div>
            <div class="party-detail"><strong>Payment ID:</strong> ${payment.paymentId || "Not Completed"}</div>
            <div class="party-detail">
                <strong>Status:</strong>
                <span class="status-${payment.status?.toLowerCase() || 'created'}">
                    ${(payment.status || "Created").toUpperCase()}
                </span>
            </div>
        </div>
    </div>

    <div class="payment-card">
        <div class="amount-highlight">
            ${payment.currency || "₹"} ${Number(payment.amount || 0).toLocaleString("en-IN")}
        </div>

        <table class="payment-table">
            <tr>
                <td class="label">Transaction Amount</td>
                <td><strong>${payment.currency || "₹"} ${Number(payment.amount || 0).toLocaleString("en-IN")}</strong></td>
            </tr>
            <tr>
                <td class="label">Payment Date</td>
                <td>${formatDate(payment.createdAt)}</td>
            </tr>
            <tr>
                <td class="label">Payment Reference</td>
                <td>${payment.paymentId || payment.orderId || "—"}</td>
            </tr>
            <tr>
                <td class="label">Payment Status</td>
                <td>
                    <span class="status-${payment.status?.toLowerCase() || 'created'}">
                        ${(payment.status || "Created").toUpperCase()}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <div class="thank-you">
        Thank you for your payment.<br/>
        We appreciate your business and look forward to serving you again.
    </div>

    <div class="signature">
        <div class="signature-line"></div>
        <div>Authorised Signatory</div>
    </div>

    <div class="print-footer">
        This is a computer-generated receipt — no signature required.
        Generated on ${new Date().toLocaleDateString("en-IN")}
    </div>

</div>

</body>
</html>
            `);

            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                // printWindow.close();   ← comment if you want user to review before closing
            }, 800);
        },
    }));

    return null; // This component renders nothing — it only exposes .print()
});

export default ProviderPaymentReceiptPrint;