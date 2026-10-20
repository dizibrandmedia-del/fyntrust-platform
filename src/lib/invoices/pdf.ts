export interface InvoiceRenderData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  customerName: string;
  customerBusinessName?: string | null;
  customerGstNumber?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  customerState?: string | null;
  lineItems: {
    description: string;
    sacCode?: string;
    quantity: number;
    rate: number;
    taxableAmount: number;
    gstRate: number;
    taxAmount: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentRef?: string | null;
}

export function generateInvoiceHtml(data: InvoiceRenderData): string {
  const isInterstate = data.customerState && data.customerState.toLowerCase() !== "uttar pradesh";
  const cgst = isInterstate ? 0 : data.taxAmount / 2;
  const sgst = isInterstate ? 0 : data.taxAmount / 2;
  const igst = isInterstate ? data.taxAmount : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${data.invoiceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0F172A;
      margin: 0;
      padding: 30px;
      background: #FFFFFF;
      line-height: 1.5;
      font-size: 13px;
    }
    .invoice-box {
      max-width: 800px;
      margin: auto;
      border: 1px solid #E2E8F0;
      padding: 30px;
      border-radius: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #01574F;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #01574F;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
    }
    .company-details {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .bill-to-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #01574F;
      margin-bottom: 6px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    th {
      background: #F1F5F9;
      color: #01574F;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      font-size: 12px;
      border-top: 1px solid #CBD5E1;
      border-bottom: 1px solid #CBD5E1;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 12px;
    }
    .text-right {
      text-align: right;
    }
    .totals-table {
      width: 320px;
      margin-left: auto;
      margin-bottom: 25px;
    }
    .totals-table td {
      padding: 6px 12px;
    }
    .grand-total {
      font-size: 15px;
      font-weight: 800;
      color: #01574F;
      background: #E6F0EF;
      border-top: 2px solid #01574F;
      border-bottom: 2px solid #01574F;
    }
    .badge-paid {
      display: inline-block;
      padding: 4px 10px;
      background: #E6F7ED;
      color: #0E7C3A;
      font-weight: 700;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .footer-notes {
      border-top: 1px solid #E2E8F0;
      padding-top: 15px;
      font-size: 10px;
      color: #64748B;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .invoice-box { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <img src="/images/fyntrust-logo.png" alt="FynTrust" style="height: 44px; width: auto; object-fit: contain; display: block; margin-bottom: 6px;" />
        <div class="brand-sub">Finance • Tax • Advisory</div>
        <div style="margin-top: 8px;">
          <span class="badge-paid">TAX INVOICE (${data.paymentStatus})</span>
        </div>
      </div>
      <div class="company-details">
        <strong>Fyntrust Technologies Pvt. Ltd.</strong><br>
        1st Office: Alamapati, Ghazipur, UP - 233001<br>
        2nd Office: Gomtinagar Extension, Lucknow, UP - 226010<br>
        Email: team@fyntrust.in | Phone: +91 9118066449<br>
        GSTIN: 09AAFCF1234F1Z8 (Provisional)
      </div>
    </div>

    <div class="bill-to-grid">
      <div>
        <div class="section-title">Billed To (Client Details)</div>
        <strong>${data.customerName}</strong><br>
        ${data.customerBusinessName ? `<strong>${data.customerBusinessName}</strong><br>` : ""}
        ${data.customerAddress ? `${data.customerAddress}<br>` : ""}
        ${data.customerCity ? `${data.customerCity}, ` : ""}${data.customerState || "India"}<br>
        ${data.customerGstNumber ? `GSTIN: ${data.customerGstNumber}` : "Unregistered Client"}
      </div>

      <div style="text-align: right;">
        <div class="section-title" style="text-align: right;">Invoice Information</div>
        <strong>Invoice No:</strong> ${data.invoiceNumber}<br>
        <strong>Invoice Date:</strong> ${data.invoiceDate}<br>
        <strong>Order Ref:</strong> ${data.orderNumber}<br>
        <strong>Payment Method:</strong> ${data.paymentMethod || "Digital Gateway"}<br>
        ${data.paymentRef ? `<strong>Transaction ID:</strong> ${data.paymentRef}<br>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Service Description</th>
          <th>SAC Code</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Rate (₹)</th>
          <th class="text-right">Taxable (₹)</th>
          <th class="text-right">GST (18%)</th>
          <th class="text-right">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${data.lineItems
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${item.description}</strong></td>
            <td>${item.sacCode || "998231"}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${item.rate.toLocaleString("en-IN")}</td>
            <td class="text-right">${item.taxableAmount.toLocaleString("en-IN")}</td>
            <td class="text-right">${item.taxAmount.toLocaleString("en-IN")}</td>
            <td class="text-right"><strong>${item.total.toLocaleString("en-IN")}</strong></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <table class="totals-table">
      <tr>
        <td>Taxable Subtotal:</td>
        <td class="text-right">₹${data.subtotal.toLocaleString("en-IN")}</td>
      </tr>
      ${
        isInterstate
          ? `
        <tr>
          <td>Integrated GST (IGST 18%):</td>
          <td class="text-right">₹${igst.toLocaleString("en-IN")}</td>
        </tr>
      `
          : `
        <tr>
          <td>Central GST (CGST 9%):</td>
          <td class="text-right">₹${cgst.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td>State GST (SGST 9%):</td>
          <td class="text-right">₹${sgst.toLocaleString("en-IN")}</td>
        </tr>
      `
      }
      <tr class="grand-total">
        <td><strong>Total Amount Paid:</strong></td>
        <td class="text-right"><strong>₹${data.totalAmount.toLocaleString("en-IN")}</strong></td>
      </tr>
    </table>

    <div class="footer-notes">
      <p>This is a computer-generated tax invoice and requires no physical signature under Rule 48 of the CGST Rules, 2017.</p>
      <p>Thank you for partnering with Fyntrust. Professional services are executed by certified Chartered Accountants and Company Secretaries.</p>
    </div>
  </div>
</body>
</html>`;
}
