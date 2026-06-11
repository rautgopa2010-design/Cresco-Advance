// import { forwardRef, useImperativeHandle } from "react";
// import { IMAGE_BASE_URL } from "@/utils/api";

// const QuotationPrint = forwardRef((props, ref) => {
//     const {
//         companyName = "",
//         companyAddress = "",
//         companyEmail = "",
//         companyMobile = "",
//         companyGstin = "",
//         companyLogo = "",
//         quotation = null,
//         prefix = null,
//         banks = [],
//     } = props;
//     console.log(props);

//     const numberToWords = (num) => {
//         const a = [
//             "",
//             "One",
//             "Two",
//             "Three",
//             "Four",
//             "Five",
//             "Six",
//             "Seven",
//             "Eight",
//             "Nine",
//             "Ten",
//             "Eleven",
//             "Twelve",
//             "Thirteen",
//             "Fourteen",
//             "Fifteen",
//             "Sixteen",
//             "Seventeen",
//             "Eighteen",
//             "Nineteen",
//         ];
//         const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

//         const inWords = (n) => {
//             if (n < 20) return a[n];
//             if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
//             if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
//             if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
//             if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
//             return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
//         };

//         if (num === 0) return "Zero";

//         const integerPart = Math.floor(num);
//         const decimalPart = Math.round((num - integerPart) * 100);

//         let words = inWords(integerPart) + " Rupees";

//         if (decimalPart > 0) {
//             words += " and " + inWords(decimalPart) + " Paise";
//         }

//         return words + " Only";
//     };

//     useImperativeHandle(ref, () => ({
//         print: () => {
//             if (!quotation) {
//                 alert("No quotation selected to print!");
//                 return;
//             }

//             const formattedQuotationNo = prefix?.quotationPrefix
//                 ? `${prefix.quotationPrefix}-${quotation.quotationNo}`
//                 : quotation.quotationNo || "-";
//             const intrastate = quotation.productQuotationDetails?.intrastate || [];
//             const interstate = quotation.productQuotationDetails?.interstate || [];
//             const products = [...intrastate, ...interstate];
//             const billing = quotation.billingAddress || {};
//             const shipping = quotation.shippingAddress || {};

//             // Helper function to format currency
//             const formatCurrency = (amount) => {
//                 return Number(amount || 0).toFixed(2);
//             };

//             let finalAmount = 0;

//             const productCalculations = products.map((item) => {
//                 const taxable = Number(item.subTotal || item.pricePerUnit * item.quantity || 0);

//                 const cgst = Number(item.cgstAmt || 0);
//                 const sgst = Number(item.sgstAmt || 0);
//                 const igst = Number(item.igstAmt || 0);

//                 const tax = cgst + sgst + igst;

//                 const gross = taxable + tax;

//                 const discountPercent = Number(item.discount || 0);
//                 const discountAmount = (gross * discountPercent) / 100;

//                 const final = gross - discountAmount;

//                 finalAmount += final;

//                 return {
//                     ...item,
//                     taxable,
//                     tax,
//                     gross,
//                     discountPercent,
//                     discountAmount,
//                     final,
//                 };
//             });

//             const primaryBank = banks.find((bank) => bank.isPrimary === true) || banks[0] || null;

//             const printWindow = window.open("", "_blank");
//             if (!printWindow) {
//                 alert("Please allow popups to print.");
//                 return;
//             }

//             printWindow.document.write(`
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Quotation - ${formattedQuotationNo}</title>
//   <meta charset="utf-8">
//   <style>
//     body {
//       font-family: Arial, Helvetica, sans-serif;
//       margin: 0;
//       padding: 0;
//       color: #000;
//       font-size: 13px;
//       line-height: 1.4;
//     }
//     @page {
//       size: A4;
//       margin: 0;
//     }
//     @media print {
//       html, body { height: 100%; }
//       thead { display: table-header-group; }
//       tfoot { display: table-footer-group; }
//     }
//     table { border-collapse: collapse; width: 100%; }
//     th, td { padding: 5px 6px; border: 1px solid #000; vertical-align: top; }
//     .center { text-align: center; }
//     .right { text-align: right; }
//     .amount-words { font-style: italic; margin: 10px 0 16px; font-size: 13.5px; }
//     .total-row { font-weight: bold; background: #f8f8f8; }
//     .small { font-size: 11px; }
//     .gst-summary th { background: #f0f0f0; }
    
//     /* Header - repeating */
//     .print-header {
//       width: 100%;
//       display: flex;
//       flex-direction: row-reverse;
//       justify-content: space-between;
//       align-items: center;
//       padding: 20px 20px 10px 20px;
//       border-bottom: 1px solid #ccc;
//       background: white;
//     }
//     .company-name {
//       font-size: 22px;
//       font-weight: bold;
//       color: #053054;
//       margin-right: 20px;
//     }
//     .logo-box img {
//       width: 130px;
//       margin-top: 10px;
//     }
    
//     /* Footer - repeating */
//     .print-footer {
//       width: 100%;
//       text-align: center;
//       padding: 20px 20px 10px 20px;
//       border-top: 1px solid #ccc;
//       font-size: 12px;
//       background: white;
//     }
//     .footer-logo {
//       width: 60px;
//       margin-top: 5px;
//     }
//     .company {
//       font-weight: bold;
//       color: #053054;
//     }
    
//     /* Content styles */
//     .quotation-title {
//       font-size: 20px;
//       font-weight: bold;
//       text-transform: uppercase;
//       text-align: center;
//       margin: 12px 0 16px;
//     }
//     .info-row { margin: 4px 0; }
//     .description-content p {
//   margin: 4px 0;
// }

// .description-content ul {
//   padding-left: 16px;
//   margin: 4px 0;
// }

// .description-content li {
//   margin-bottom: 4px;
// }
//     .terms { font-size: 12px; padding-top: 40px; }
//     .terms-content p {
//   margin: 4px 0;
// }

// .terms-content ul {
//   padding-left: 16px;
//   margin: 4px 0;
// }

// .terms-content li {
//   margin-bottom: 4px;
// }
//   .bank-details {
//       margin-top: 20px;
//       font-size: 12px;
//     }
//     .bank-details p {
//       margin: 3px 0;
//     }
//   </style>
// </head>
// <body>

// <table style="width:100%; height:100%; table-layout:fixed; border-collapse: collapse;">
//   <thead>
//       <tr>
//         <td style="padding: 0 20px;">
//           <div class="print-header">
//             <div class="company-name">${companyName || "Company Name"}</div>
//             <div class="logo-box">
//               ${companyLogo ? `<img src="${IMAGE_BASE_URL}${companyLogo}" alt="Company Logo" />` : ""}
//             </div>
//           </div>
//         </td>
//       </tr>
//   </thead>

//   <tbody>
//       <tr>
//         <td valign="top" style="padding: 0 20px;">

//           <div class="quotation-title">QUOTATION</div>

//           <!-- Seller Info + Quotation No/Date -->
//           <table style="margin-bottom: 16px;">
//             <tr>
//               <td width="60%" style="border:none; vertical-align:top;">
//                 <strong>${companyName || "Company Name"}</strong><br>
//                 ${companyAddress ? `${companyAddress}<br>` : ""}
//                 ${companyEmail ? `Email: ${companyEmail}<br>` : ""}
//                 ${companyMobile ? `Mobile: ${companyMobile}<br>` : ""}
//                 ${companyGstin ? `GSTIN: ${companyGstin}<br>` : ""}
//               </td>
//               <td width="40%" style="border:none; vertical-align:top;" class="right">
//                 <div class="info-row"><strong>Quotation No.:</strong> ${formattedQuotationNo}</div>
//                 <div class="info-row"><strong>Date:</strong> ${quotation.date || "-"}</div>
//               </td>
//             </tr>
//           </table>

//           <!-- Bill To / Ship To -->
//           <table style="margin: 16px 0 24px;">
//             <tr>
//               <td width="50%" style="border:none; vertical-align:top;">
//                 <strong>BILL TO</strong><br>
//                 ${quotation.companyName ? `${quotation.companyName}<br>` : ""}
//                 ${quotation.customerPerson ? `Attn: ${quotation.customerPerson}<br>` : ""}
//                 ${billing.street || ""}${billing.zone ? ", " + billing.zone : ""}${billing.city ? ", " + billing.city : ""}<br>
//                 ${billing.state || ""}${billing.pincode ? " - " + billing.pincode : ""}<br>
//                 ${billing.country || ""}<br>
//                 ${quotation.mobile || ""}<br>
//                 ${quotation.email || ""}<br>
//                 GSTIN: ${quotation.gstinNo || "-"}<br>
//                 Place of Supply: ${billing.state || "Maharashtra"}
//               </td>
//               <td width="50%" style="border:none; vertical-align:top;">
//                 <strong>SHIP TO</strong><br>
//                 ${quotation.companyName ? `${quotation.companyName}<br>` : ""}
//                 ${shipping.street || billing.street || ""}${shipping.zone ? ", " + shipping.zone : ""}${shipping.city || billing.city ? ", " + (shipping.city || billing.city) : ""}<br>
//                 ${shipping.state || billing.state || ""}${shipping.pincode || billing.pincode ? " - " + (shipping.pincode || billing.pincode) : ""}<br>
//                 ${shipping.country || ""}<br>
//                 ${quotation.mobile || ""}<br>
//                 ${quotation.email || ""}<br>
//               </td>
//             </tr>
//           </table>

//           <!-- Items Table -->
//           <table>
//             <thead style="background:#e8e8e8;">
//               <tr>
//                 <th class="center">S.NO.</th>
//                 <th>ITEMS NAME / DESCRIPTION</th>
//                 <th class="center">HSN</th>
//                 <th class="center">QTY.</th>
//                 <th class="center">RATE</th>
//                 <th class="center">AMOUNT</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                   products.length > 0
//                       ? products
//                             .map(
//                                 (item, i) => `
//                   <tr>
//                     <td class="center">${i + 1}</td>
//                     <td>
//                       ${item.product || item.description || "-"}<br>
//                       <span class="small">${item.productBrand || ""}${item.description ? " - " + item.description : ""}</span>
//                     </td>
//                     <td class="center">${item.hsnCode || "-"}</td>
//                     <td class="center">${item.quantity || "1"} ${item.unit || "PCS"}</td>
//                     <td class="center">₹${formatCurrency(item.pricePerUnit) || "-"}</td>
//                     <td class="center">₹${formatCurrency(item.total || (item.pricePerUnit || 0) * (item.quantity || 1))}</td>
//                   </tr>
//                 `,
//                             )
//                             .join("")
//                       : '<tr><td colspan="6" class="center">No items found</td></tr>'
//               }
//             </tbody>
//           </table>

//           <!-- GST Summary - Intrastate -->
//           ${
//               intrastate.length > 0
//                   ? `
//           <table style="margin: 20px 0;">
//             <thead class="gst-summary">
//               <tr>
//                 <th>HSN/SAC</th>
//                 <th>Taxable Value</th>
//                 <th colspan="2">CGST</th>
//                 <th colspan="2">SGST</th>
//                 <th>Total Tax Amount</th>
//                 <th>Gross Total</th>
//                 <th>Discount (%)</th>
//                 <th>Final Amt</th>
//               </tr>
//               <tr style="background:#f8f8f8; font-size:11px;">
//                 <th></th><th></th>
//                 <th class="center">Rate</th><th class="right">Amount</th>
//                 <th class="center">Rate</th><th class="right">Amount</th>
//                 <th></th><th></th><th></th><th></th>
//               </tr>
//             </thead>
//             <tbody>
//              ${intrastate
//                  .map((item, index) => {
//                      const calc = productCalculations.find((p) => p.hsnCode === item.hsnCode && p.product === item.product);

//                      return `
//     <tr>
//         <td>${item.hsnCode || "-"}</td>
//         <td class="right">₹${formatCurrency(calc.taxable)}</td>
//         <td class="center">${item.cgst || 0}%</td>
//         <td class="right">₹${formatCurrency(item.cgstAmt)}</td>
//         <td class="center">${item.sgst || 0}%</td>
//         <td class="right">₹${formatCurrency(item.sgstAmt)}</td>
//         <td class="right">₹${formatCurrency(calc.tax)}</td>
//         <td class="right">₹${formatCurrency(calc.gross)}</td>
//         <td class="right">${calc.discountPercent} %</td>
//                 <td class="right">₹${formatCurrency(calc.final)}</td>
//     </tr>
//     `;
//                  })
//                  .join("")}
//             </tbody>
//           </table>
//           `
//                   : ""
//           }

//           <!-- Interstate GST Summary -->
//           ${
//               interstate.length > 0
//                   ? `
//           <table style="margin: 20px 0;">
//             <thead class="gst-summary">
//               <tr>
//                 <th>HSN/SAC</th>
//                 <th>Taxable Value</th>
//                 <th colspan="2">IGST</th>
//                 <th>Total Tax Amount</th>
//                 <th>Gross Total</th>
//                 <th>Discount (%)</th>
//                 <th>Final Amt</th>
//               </tr>
//               <tr style="background:#f8f8f8; font-size:11px;">
//                 <th></th><th></th>
//                 <th class="center">Rate</th><th class="right">Amount</th>
//                 <th></th><th></th><th></th><th></th>
//               </tr>
//             </thead>
//             <tbody>
//               ${interstate
//                   .map((item) => {
//                       const calc = productCalculations.find((p) => p.hsnCode === item.hsnCode && p.product === item.product);

//                       return `
//     <tr>
//         <td>${item.hsnCode || "-"}</td>
//         <td class="right">₹${formatCurrency(calc.taxable)}</td>
//         <td class="center">${item.igst || 0}%</td>
//         <td class="right">₹${formatCurrency(item.igstAmt)}</td>
//         <td class="right">₹${formatCurrency(calc.tax)}</td>
//         <td class="right">₹${formatCurrency(calc.gross)}</td>
//         <td class="right">${calc.discountPercent} %</td>
//         <td class="right">₹${formatCurrency(calc.final)}</td>
//     </tr>
//     `;
//                   })
//                   .join("")}
//             </tbody>
//           </table>
//           `
//                   : ""
//           }

//           <!-- Total Summary with Discount -->
//           <table style="margin: 20px 0; width: 50%; margin-left: auto;">
//             <tr class="total-row">
//   <td style="border: none;" class="right"><strong>TOTAL AMOUNT:</strong></td>
//   <td style="border: none;" class="right"><strong>₹${formatCurrency(finalAmount)}</strong></td>
// </tr>
//           </table>

//           <div class="amount-words">
//   Total Amount (in words): ${numberToWords(finalAmount)}
// </div>

//           <!-- Bank Details + Terms + Signature -->
//           <div style="margin-top: 48px; border-top: 1px solid #000; padding-top: 16px;">
//             <table style="border:none; width:100%;">
//               <tr>
//                     <td width="45%" style="border:none; vertical-align:top;">
//                   <strong>Bank Details</strong>
//                   <div class="bank-details">
//                     ${
//                         primaryBank
//                             ? `
//                              <p><strong>Beneficiary Name:</strong> ${primaryBank.customerName || "_______________________"}</p>
//                       ${primaryBank.bankName ? `<p><strong>Bank Name:</strong> ${primaryBank.bankName}</p>` : ""}
//                       ${primaryBank.branchName ? `<p><strong>Branch:</strong> ${primaryBank.branchName}</p>` : ""}
//                       ${primaryBank.accountNumber ? `<p><strong>A/c No:</strong> ${primaryBank.accountNumber}</p>` : ""}
//                       ${primaryBank.ifsc ? `<p><strong>IFSC Code:</strong> ${primaryBank.ifsc}</p>` : ""}
//                       ${primaryBank.beneficiaryName ? `<p><strong>Beneficiary Name:</strong> ${primaryBank.beneficiaryName}</p>` : ""}
//                     `
//                             : `
//                       <p>Bank Name: _______________________</p>
//                       <p>Beneficiary Name: ${primaryBank?.customerName || "_______________________"}</p>
//                       <p>A/c No: _______________________</p>
//                       <p>IFSC Code: _______________________</p>
//                     `
//                     }
//                   </div>
//                 </td>
//               </tr>
//             </table>

//             <div style="margin-top: 20px; text-align: right;">
//               For ${companyName || "Company Name"}<br><br><br>
//               Authorised Signatory<br>
//               _______________________________
//             </div>
//           </div>

//                           <div class="terms">
//   <strong>Description</strong><br>
//   <div class="terms-content">
//     ${quotation.description || ""}
//   </div>

//                           <div class="terms">
//   <strong>Terms & Conditions:</strong><br>
//   <div class="terms-content">
//     ${quotation.termsAndConditions || ""}
//   </div>

//         </td>
//       </tr>
//   </tbody>

//   <tfoot>
//       <tr>
//         <td style="padding: 0 20px 20px 20px;">
//           <div class="print-footer">
//             <div class="company">Generated by ${companyName || "Company Name"}</div>
//             ${companyLogo ? `<img src="${IMAGE_BASE_URL}${companyLogo}" class="footer-logo" alt="Footer Logo" />` : ""}
//           </div>
//         </td>
//       </tr>
//   </tfoot>
// </table>

// </body>
// </html>
//       `);

//             printWindow.document.close();
//             setTimeout(() => {
//                 printWindow.focus();
//                 printWindow.print();
//             }, 700);
//         },
//     }));

//     return null;
// });

// export default QuotationPrint;


import { forwardRef, useImperativeHandle } from "react";
import { IMAGE_BASE_URL } from "@/utils/api";

const QuotationPrint = forwardRef((props, ref) => {
    const {
        companyName = "",
        companyAddress = "",
        companyEmail = "",
        companyMobile = "",
        companyGstin = "",
        companyLogo = "",
        quotation = null,
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
            if (!quotation) {
                alert("No quotation selected to print!");
                return;
            }

            const formattedQuotationNo = prefix?.quotationPrefix
                ? `${prefix.quotationPrefix}-${quotation.quotationNo}`
                : quotation.quotationNo || "-";
            const intrastate = quotation.productQuotationDetails?.intrastate || [];
            const interstate = quotation.productQuotationDetails?.interstate || [];
            const products = [...intrastate, ...interstate];
            const billing = quotation.billingAddress || {};
            const shipping = quotation.shippingAddress || {};

            // Helper function to format currency
            const formatCurrency = (amount) => {
                return Number(amount || 0).toFixed(2);
            };

            let finalAmount = 0;

            const productCalculations = products.map((item) => {
                const taxable = Number(item.subTotal || item.pricePerUnit * item.quantity || 0);

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

            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                alert("Please allow popups to print.");
                return;
            }

            printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Quotation - ${formattedQuotationNo}</title>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      color: #000;
      font-size: 13px;
      line-height: 1.4;
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
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 5px 6px; border: 1px solid #000; vertical-align: top; }
    .center { text-align: center; }
    .right { text-align: right; }
    .amount-words { font-style: italic; margin: 10px 0 16px; font-size: 13.5px; }
    .total-row { font-weight: bold; background: #f8f8f8; }
    .small { font-size: 11px; }
    .gst-summary th { background: #f0f0f0; }
    
    /* Header - repeating */
    .print-header {
      width: 100%;
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 10px 20px;
      border-bottom: 1px solid #ccc;
      background: white;
    }
    .company-name {
      font-size: 22px;
      font-weight: bold;
      color: #053054;
      margin-right: 20px;
    }
    .logo-box img {
      width: 130px;
      margin-top: 10px;
    }
    
    /* Footer - repeating */
    .print-footer {
      width: 100%;
      text-align: center;
      padding: 20px 20px 10px 20px;
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
    
    /* Content styles */
    .quotation-title {
      font-size: 20px;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      margin: 12px 0 16px;
    }
    .info-row { margin: 4px 0; }
    .description-content p {
  margin: 4px 0;
}

.description-content ul {
  padding-left: 16px;
  margin: 4px 0;
}

.description-content li {
  margin-bottom: 4px;
}
    .terms { font-size: 12px; padding-top: 40px; }
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
        <td style="padding: 0 20px;">
          <div class="print-header">
            <div class="company-name">${companyName || "Company Name"}</div>
            <div class="logo-box">
              ${companyLogo ? `<img src="${IMAGE_BASE_URL}${companyLogo}" alt="Company Logo" />` : ""}
            </div>
          </div>
        </td>
      </tr>
  </thead>

  <tbody>
      <tr>
        <td valign="top" style="padding: 0 20px;">

          <div class="quotation-title">QUOTATION</div>

          <!-- Seller Info + Quotation No/Date -->
          <table style="margin-bottom: 16px;">
            <tr>
              <td width="60%" style="border:none; vertical-align:top;">
                <strong>${companyName || "Company Name"}</strong><br>
                ${companyAddress ? `${companyAddress}<br>` : ""}
                ${companyEmail ? `Email: ${companyEmail}<br>` : ""}
                ${companyMobile ? `Mobile: ${companyMobile}<br>` : ""}
                ${companyGstin ? `GSTIN: ${companyGstin}<br>` : ""}
              </td>
              <td width="40%" style="border:none; vertical-align:top;" class="right">
                <div class="info-row"><strong>Quotation No.:</strong> ${formattedQuotationNo}</div>
                <div class="info-row"><strong>Date:</strong> ${quotation.date || "-"}</div>
              </td>
            </tr>
          </table>

          <!-- Bill To / Ship To -->
          <table style="margin: 16px 0 24px;">
            <tr>
              <td width="50%" style="border:none; vertical-align:top;">
                <strong>BILL TO</strong><br>
                ${quotation.companyName ? `${quotation.companyName}<br>` : ""}
                ${quotation.customerPerson ? `Attn: ${quotation.customerPerson}<br>` : ""}
                ${billing.street || ""}${billing.zone ? ", " + billing.zone : ""}${billing.city ? ", " + billing.city : ""}<br>
                ${billing.state || ""}${billing.pincode ? " - " + billing.pincode : ""}<br>
                ${billing.country || ""}<br>
                ${quotation.mobile || ""}<br>
                ${quotation.email || ""}<br>
                GSTIN: ${quotation.gstinNo || "-"}<br>
                Place of Supply: ${billing.state || "Maharashtra"}
              </td>
              <td width="50%" style="border:none; vertical-align:top;">
                <strong>SHIP TO</strong><br>
                ${quotation.companyName ? `${quotation.companyName}<br>` : ""}
                ${shipping.street || billing.street || ""}${shipping.zone ? ", " + shipping.zone : ""}${shipping.city || billing.city ? ", " + (shipping.city || billing.city) : ""}<br>
                ${shipping.state || billing.state || ""}${shipping.pincode || billing.pincode ? " - " + (shipping.pincode || billing.pincode) : ""}<br>
                ${shipping.country || ""}<br>
                ${quotation.mobile || ""}<br>
                ${quotation.email || ""}<br>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table>
            <thead style="background:#e8e8e8;">
              <tr>
                <th class="center">S.NO.</th>
                <th>ITEMS NAME / DESCRIPTION</th>
                <th class="center">HSN</th>
                <th class="center">QTY.</th>
                <th class="center">RATE</th>
                <th class="center">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${
                  products.length > 0
                      ? products
                            .map(
                                (item, i) => `
                  <tr>
                    <td class="center">${i + 1}</td>
                    <td>
                      ${item.product || item.description || "-"}<br>
                      <span class="small">${item.productBrand || ""}${item.description ? " - " + item.description : ""}</span>
                    </td>
                    <td class="center">${item.hsnCode || "-"}</td>
                    <td class="center">${item.quantity || "1"} ${item.unit || "PCS"}</td>
                    <td class="center">₹${formatCurrency(item.pricePerUnit) || "-"}</td>
                    <td class="center">₹${formatCurrency(item.total || (item.pricePerUnit || 0) * (item.quantity || 1))}</td>
                  </tr>
                `,
                            )
                            .join("")
                      : '<tr><td colspan="6" class="center">No items found</td></tr>'
              }
            </tbody>
          </table>

          <!-- GST Summary - Intrastate -->
          ${
              intrastate.length > 0
                  ? `
          <table style="margin: 20px 0;">
            <thead class="gst-summary">
              <tr>
                <th>HSN/SAC</th>
                <th>Taxable Value</th>
                <th colspan="2">CGST</th>
                <th colspan="2">SGST</th>
                <th>Total Tax Amount</th>
                <th>Gross Total</th>
                <th>Discount (%)</th>
                <th>Final Amt</th>
              </tr>
              <tr style="background:#f8f8f8; font-size:11px;">
                <th></th><th></th>
                <th class="center">Rate</th><th class="right">Amount</th>
                <th class="center">Rate</th><th class="right">Amount</th>
                <th></th><th></th><th></th><th></th>
              </tr>
            </thead>
            <tbody>
             ${intrastate
                 .map((item, index) => {
                     const calc = productCalculations.find((p) => p.hsnCode === item.hsnCode && p.product === item.product);

                     return `
    <tr>
        <td>${item.hsnCode || "-"}</td>
        <td class="right">₹${formatCurrency(calc.taxable)}</td>
        <td class="center">${item.cgst || 0}%</td>
        <td class="right">₹${formatCurrency(item.cgstAmt)}</td>
        <td class="center">${item.sgst || 0}%</td>
        <td class="right">₹${formatCurrency(item.sgstAmt)}</td>
        <td class="right">₹${formatCurrency(calc.tax)}</td>
        <td class="right">₹${formatCurrency(calc.gross)}</td>
        <td class="right">${calc.discountPercent} %</td>
                <td class="right">₹${formatCurrency(calc.final)}</td>
    </tr>
    `;
                 })
                 .join("")}
            </tbody>
          </table>
          `
                  : ""
          }

          <!-- Interstate GST Summary -->
          ${
              interstate.length > 0
                  ? `
          <table style="margin: 20px 0;">
            <thead class="gst-summary">
              <tr>
                <th>HSN/SAC</th>
                <th>Taxable Value</th>
                <th colspan="2">IGST</th>
                <th>Total Tax Amount</th>
                <th>Gross Total</th>
                <th>Discount (%)</th>
                <th>Final Amt</th>
              </tr>
              <tr style="background:#f8f8f8; font-size:11px;">
                <th></th><th></th>
                <th class="center">Rate</th><th class="right">Amount</th>
                <th></th><th></th><th></th><th></th>
              </tr>
            </thead>
            <tbody>
              ${interstate
                  .map((item) => {
                      const calc = productCalculations.find((p) => p.hsnCode === item.hsnCode && p.product === item.product);

                      return `
    <tr>
        <td>${item.hsnCode || "-"}</td>
        <td class="right">₹${formatCurrency(calc.taxable)}</td>
        <td class="center">${item.igst || 0}%</td>
        <td class="right">₹${formatCurrency(item.igstAmt)}</td>
        <td class="right">₹${formatCurrency(calc.tax)}</td>
        <td class="right">₹${formatCurrency(calc.gross)}</td>
        <td class="right">${calc.discountPercent} %</td>
        <td class="right">₹${formatCurrency(calc.final)}</td>
    </tr>
    `;
                  })
                  .join("")}
            </tbody>
          </table>
          `
                  : ""
          }

          <!-- Total Summary with Discount -->
          <table style="margin: 20px 0; width: 50%; margin-left: auto;">
            <tr class="total-row">
  <td style="border: none;" class="right"><strong>TOTAL AMOUNT:</strong></td>
  <td style="border: none;" class="right"><strong>₹${formatCurrency(finalAmount)}</strong></td>
</tr>
          </table>

          <div class="amount-words">
  Total Amount (in words): ${numberToWords(finalAmount)}
</div>

          <!-- Bank Details + Terms + Signature -->
          <div style="margin-top: 48px; border-top: 1px solid #000; padding-top: 16px;">
            <table style="border:none; width:100%;">
              <tr>
                    <td width="45%" style="border:none; vertical-align:top;">
                  <strong>Bank Details</strong>
                  <div class="bank-details">
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
                      <p>Beneficiary Name: ${primaryBank?.customerName || "_______________________"}</p>
                      <p>A/c No: _______________________</p>
                      <p>IFSC Code: _______________________</p>
                    `
                    }
                  </div>
                </td>
              </tr>
            </table>

            <div style="margin-top: 20px; text-align: right;">
              For ${companyName || "Company Name"}<br><br><br>
              Authorised Signatory<br>
              _______________________________
            </div>
          </div>

                          <div class="terms">
  <strong>Description</strong><br>
  <div class="terms-content">
    ${quotation.description || ""}
  </div>

                          <div class="terms">
  <strong>Terms & Conditions:</strong><br>
  <div class="terms-content">
    ${quotation.termsAndConditions || ""}
  </div>

        </td>
      </tr>
  </tbody>

  <tfoot>
      <tr>
        <td style="padding: 0 20px 20px 20px;">
          <div class="print-footer">
            <div class="company">Generated by ${companyName || "Company Name"}</div>
            ${companyLogo ? `<img src="${IMAGE_BASE_URL}${companyLogo}" class="footer-logo" alt="Footer Logo" />` : ""}
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
            }, 700);
        },
    }));

    return null;
});

export default QuotationPrint;
