import { forwardRef, useImperativeHandle } from "react";
import { IMAGE_BASE_URL } from "@/utils/api";

const InvoicePrint = forwardRef((props, ref) => {
    const {
        companyName = "",
        companyAddress = "",
        companyEmail = "",
        companyMobile = "",
        companyGstin = "",
        companyLogo = "",
        invoice = null,
        prefix = null,
        banks = [],
    } = props;
    console.log(props);

    const numberToWords = (num) => {
        const a = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];
        const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        const inWords = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
            if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
            if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
            if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
            return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
        };

        if (num === 0) return "Zero";

        const integerPart = Math.floor(num);
        const decimalPart = Math.round((num - integerPart) * 100);

        let words = inWords(integerPart) + " Rupees";

        if (decimalPart > 0) {
            words += " and " + inWords(decimalPart) + " Paise";
        }

        return words + " Only";
    };

    useImperativeHandle(ref, () => ({
        print: () => {
            if (!invoice) {
                alert("No invoice selected to print!");
                return;
            }

            const formattedInvoiceNo = prefix?.invoicePrefix ? `${prefix.invoicePrefix}-${invoice.invoiceNo}` : invoice.invoiceNo || "-";
            const intrastate = invoice.productInvoiceDetails?.intrastate || [];
            const interstate = invoice.productInvoiceDetails?.interstate || [];
            const billing = invoice.billingAddress || {};
            const shipping = invoice.shippingAddress || {};

            // Helper function to format currency
            const formatCurrency = (amount) => {
                return Number(amount || 0).toFixed(2);
            };

            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                alert("Please allow popups to print.");
                return;
            }

            const products = [...intrastate, ...interstate];

            let finalAmount = 0;

            const productCalculations = products.map((item) => {
                const taxable = Number(item.pricePerUnit || 0) * Number(item.quantity || 0);

                const cgst = Number(item.cgstAmt || 0);
                const sgst = Number(item.sgstAmt || 0);
                const igst = Number(item.igstAmt || 0);

                const tax = cgst + sgst + igst;

                const gross = taxable + tax;

                const discountPercent = Number(item.discount || 0);
                const discountAmount = (gross * discountPercent) / 100;

                const final = gross - discountAmount;

                finalAmount += final;

                return {
                    ...item,
                    taxable,
                    tax,
                    gross,
                    discountPercent,
                    discountAmount,
                    final,
                };
            });

            const primaryBank = banks.find((bank) => bank.isPrimary === true) || banks[0] || null;

            printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Tax Invoice - ${formattedInvoiceNo}</title>
  <meta charset="utf-8">
  <style>
    /* Header/Footer styles from first code */
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
      html, body { height: 100%; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
    }
    /* Header - repeats on every page */
    .print-header {
      width: 100%;
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0 15px;
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
    /* Footer - repeats on every page */
    .print-footer {
      width: 100%;
      text-align: center;
      padding: 20px 0 15px;
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
    
    /* YOUR ORIGINAL CONTENT STYLES - EXACTLY as second code */
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 13px;
      color: #000;
      line-height: 1.4;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 4px 6px; border: 1px solid #000; }
    .header { font-weight: bold; font-size: 16px; text-align: center; margin-bottom: 8px; }
    .company-logo img { max-height: 60px; }
    .company-name { font-size: 18px; font-weight: bold; color: #003087; }
    .amount-words { font-style: italic; margin: 10px 0 16px; font-size: 13.5px; }
    .invoice-title { font-size: 20px; font-weight: bold; text-transform: uppercase; text-align: center; margin: 12px 0; }
    .info-table td { border: none; padding: 3px 0; vertical-align: top; }
    .left { text-align: left; }
    .right { text-align: right; }
    .center { text-align: center; }
    .amount-in-words { font-style: italic; margin: 8px 0; }
    .gst-breakup th { background: #f0f0f0; }
    .total-row { font-weight: bold; background: #f8f8f8; }
    .terms { font-size: 12px; padding-top: 40px; }
    .bank-details { margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
    .signature { margin-top: 40px; text-align: right; }
    .text-small { font-size: 11px; color: #666; }
    .discount-info { color: #d32f2f; font-style: italic; }
    .terms-content p {
  margin: 4px 0;
}

.terms-content ul {
  padding-left: 16px;
  margin: 4px 0;
}

.terms-content li {
  margin-bottom: 4px;
}
  .bank-details {
      margin-top: 20px;
      font-size: 12px;
    }
    .bank-details p {
      margin: 3px 0;
    }
  </style>
</head>
<body>
<table style="width:100%; height:100%; table-layout:fixed; border-collapse: collapse;">
    <thead>
        <tr>
            <td style="padding: 20px 20px 0 20px;">
                <!-- HEADER from first code -->
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
            <td valign="top" style="padding: 0 20px;">
                <!-- YOUR ORIGINAL CONTENT - EXACTLY as second code -->
                
                <!-- Header -->
                <div class="invoice-title">TAX INVOICE</div>

                <!-- Bill From / Invoice Info -->
                <table class="info-table">
                  <tr>
                    <td width="50%">
                      <strong>Bill From:</strong><br>
                      ${companyName}<br>
                      ${companyAddress}<br>
                      ${companyEmail ? `Email: ${companyEmail}<br>` : ""}
                ${companyMobile ? `Mobile: ${companyMobile}<br>` : ""}
                ${companyGstin ? `GSTIN: ${companyGstin}<br>` : ""}
                    </td>
                    <td width="50%" class="right">
                      <table class="info-table">
                        <tr><td><strong>Invoice No.:</strong></td><td>${formattedInvoiceNo}</td></tr>
                        <tr><td><strong>Date:</strong></td><td>${invoice.date || "-"}</td></tr>
                        <tr><td><strong>Due Date:</strong></td><td>${invoice.date || "-"}</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <br>

                <!-- Bill To / Ship To -->
                <table>
                  <tr>
                    <td width="50%" style="vertical-align: top;">
                      <strong>Bill To:</strong><br>
                      ${invoice.selectedCompany ? `${invoice.selectedCompany}<br>` : ""}
                      ${invoice.customerPerson ? `Attn: ${invoice.customerPerson}<br>` : ""}
                      ${billing.street ? `${billing.street}<br>` : ""}
                      ${billing.city ? `${billing.city}, ${billing.zone || ""}<br>` : ""}
                      ${billing.state ? `${billing.state} - ${billing.pincode || "-"}<br>` : ""}
                      ${billing.country ? `${billing.country}<br>` : ""}
                      ${invoice.mobile ? `Mob: ${invoice.mobile}<br>` : ""}
                      ${invoice.email ? `Email: ${invoice.email}<br>` : ""}
                    </td>
                    <td width="50%" style="vertical-align: top;">
                      <strong>Ship To:</strong><br>
                      ${shipping.street ? `${shipping.street}<br>` : ""}
                      ${shipping.city ? `${shipping.city}, ${shipping.zone || ""}<br>` : ""}
                      ${shipping.state ? `${shipping.state} - ${shipping.pincode || "-"}<br>` : ""}
                      ${shipping.country ? `${shipping.country}<br>` : ""}
                      ${invoice.mobile ? `Mob: ${invoice.mobile}<br>` : ""}
                      ${invoice.email ? `Email: ${invoice.email}<br>` : ""}
                    </td>
                  </tr>
                </table>

                <br>

                <!-- Products Table -->
                ${
                    intrastate.length > 0 || interstate.length > 0
                        ? `
                <table>
                  <thead>
                    <tr style="background:#e0e0e0;">
                      <th class="center">S.No</th>
                      <th>Item Name / Description</th>
                      <th class="center">HSN</th>
                      <th class="center">UOM</th>
                      <th class="center">Qty</th>
                      <th class="center">Rate (₹)</th>
                      <th class="center">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productCalculations
                        .map(
                            (p, i) => `
<tr>
  <td class="center">${i + 1}</td>
  <td>
    ${p.product || "-"}<br>
    <small>${p.description || ""} (${p.productBrand || ""})</small>
  </td>
  <td class="center">${p.hsnCode || "-"}</td>
  <td class="center">${p.unit || "Per Unit"}</td>
  <td class="center">${p.quantity || 0}</td>
  <td class="center">${formatCurrency(p.pricePerUnit)}</td>
  <td class="center">${formatCurrency(p.final)}</td>
</tr>
`,
                        )
                        .join("")}
                  </tbody>
                </table>
                `
                        : "<p>No products found.</p>"
                }

                <!-- GST Summary (only intrastate shown - adapt if interstate exists) -->
                ${
                    intrastate.length > 0
                        ? `
                <table style="margin-top: 16px;">
                  <thead>
                    <tr style="background:#e0e0e0;">
                      <th>HSN</th>
                      <th>Taxable Amount</th>
                      <th>Tax Rate</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>Tax Total</th>
                      <th>Gross Total</th>
                      <th>Discount (%)</th>
                      <th>Final Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                   ${intrastate
                       .map((item) => {
                           const calc = productCalculations.find((p) => p.hsnCode === item.hsnCode && p.product === item.product);

                           return `
<tr>
  <td>${item.hsnCode || "-"}</td>
  <td class="right">₹${formatCurrency(calc.taxable)}</td>
  <td class="center">${item.cgst || 0}% + ${item.sgst || 0}%</td>
  <td class="right">${formatCurrency(item.cgstAmt)}</td>
  <td class="right">${formatCurrency(item.sgstAmt)}</td>
  <td class="right">0.00</td>
  <td class="right">${formatCurrency(calc.tax)}</td>
  <td class="right">${formatCurrency(calc.gross)}</td>
  <td class="right">${calc.discountPercent}%</td>
  <td class="right">${formatCurrency(calc.final)}</td>
</tr>
`;
                       })
                       .join("")}
                  </tbody>
                </table>
                `
                        : ""
                }

                <table style="margin-top: 20px; width: 50%; margin-left: auto;">
  <tr class="total-row">
    <td style="border:none;" class="right"><strong>TOTAL AMOUNT:</strong></td>
    <td style="border:none;" class="right"><strong>₹${formatCurrency(finalAmount)}</strong></td>
  </tr>
</table>

<div class="amount-words">
  Total Amount (in words): ${numberToWords(finalAmount)}
</div>

                <div width="45%" style="border:none; vertical-align:top;">
                <div class="bank-details">
                <strong>Bank Details</strong>
                    ${
                        primaryBank
                            ? `
                             <p><strong>Beneficiary Name:</strong> ${primaryBank.customerName || "_______________________"}</p>
                      ${primaryBank.bankName ? `<p><strong>Bank Name:</strong> ${primaryBank.bankName}</p>` : ""}
                      ${primaryBank.branchName ? `<p><strong>Branch:</strong> ${primaryBank.branchName}</p>` : ""}
                      ${primaryBank.accountNumber ? `<p><strong>A/c No:</strong> ${primaryBank.accountNumber}</p>` : ""}
                      ${primaryBank.ifsc ? `<p><strong>IFSC Code:</strong> ${primaryBank.ifsc}</p>` : ""}
                      ${primaryBank.beneficiaryName ? `<p><strong>Beneficiary Name:</strong> ${primaryBank.beneficiaryName}</p>` : ""}
                    `
                            : `
                      <p>Bank Name: _______________________</p>
                      <p>Beneficiary Name: ${companyName || "_______________________"}</p>
                      <p>A/c No: _______________________</p>
                      <p>IFSC Code: _______________________</p>
                    `
                    }
                  </div>
                </div>


                <div class="signature">
                   <div style="margin-top: 20px; text-align: right;">
              For ${companyName || "Company Name"}<br><br><br>
              Authorised Signatory<br>
              _______________________________
            </div>
                </div>

                <div class="terms">
  <strong>Terms & Conditions:</strong><br>
  <div class="terms-content">
    ${invoice.termsAndConditions || ""}
  </div>
</div>
            </td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td style="padding: 0 20px 20px 20px;">
                <!-- FOOTER from first code -->
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
                // printWindow.close(); // uncomment if you want auto-close after print
            }, 800);
        },
    }));

    return null;
});

export default InvoicePrint;
