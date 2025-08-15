import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Invoice } from '../types';

export const generateInvoicePDF = async (invoice: Invoice) => {
  const htmlContent = generateInvoiceHTML(invoice);

  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    base64: false,
  });

  // Create a more meaningful filename
  const fileName = `invoice_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${invoice.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const newUri = `${FileSystem.documentDirectory}${fileName}`;
  
  await FileSystem.moveAsync({
    from: uri,
    to: newUri,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(newUri);
  }

  return newUri;
};

const generateInvoiceHTML = (invoice: Invoice): string => {
  const itemsHTML = invoice.items
    .map(
      (item, index) => `
    <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const statusColor = 
    invoice.status === 'paid' ? '#10b981' : 
    invoice.status === 'partial' ? '#f59e0b' : 
    invoice.status === 'overdue' ? '#ef4444' : '#6b7280';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
        }
        .company-info h1 {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }
        .company-info p {
          margin: 4px 0;
          color: #6b7280;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          background-color: ${statusColor};
        }
        .client-section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .client-info {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .items-table th {
          background-color: #3b82f6;
          color: white;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
        }
        .items-table th:nth-child(2),
        .items-table th:nth-child(3),
        .items-table th:nth-child(4) {
          text-align: right;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .totals {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
        }
        .totals-box {
          background-color: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          min-width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 4px 0;
        }
        .total-row.main {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          border-top: 2px solid #e5e7eb;
          margin-top: 12px;
          padding-top: 12px;
        }
        .pending-amount {
          color: #ef4444;
          font-weight: 600;
        }
        .paid-amount {
          color: #10b981;
          font-weight: 600;
        }
        .notes {
          margin-top: 32px;
          padding: 20px;
          background-color: #fefce8;
          border: 1px solid #fde047;
          border-radius: 8px;
        }
        .footer {
          margin-top: 48px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          padding-top: 24px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>INVOICE</h1>
          <p><strong>Your Company Name</strong></p>
          <p>Your Address</p>
          <p>City, State, ZIP</p>
          <p>Phone: Your Phone</p>
          <p>Email: your.email@company.com</p>
        </div>
        <div class="invoice-details">
          <div class="invoice-number">${invoice.invoiceNumber}</div>
          <div class="status-badge">${invoice.status}</div>
          <p><strong>Date:</strong> ${invoice.date}</p>
          ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${invoice.dueDate}</p>` : ''}
        </div>
      </div>

      <div class="client-section">
        <h2 class="section-title">Bill To</h2>
        <div class="client-info">
          <p><strong>${invoice.clientName}</strong></p>
          ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
          ${invoice.clientAddress ? `<p style="white-space: pre-line;">${invoice.clientAddress}</p>` : ''}
        </div>
      </div>

      <h2 class="section-title">Items</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${invoice.taxRate}%):</span>
            <span>$${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div class="total-row main">
            <span>Total:</span>
            <span>$${invoice.total.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Paid:</span>
            <span class="paid-amount">$${invoice.paidAmount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Pending:</span>
            <span class="pending-amount">$${(invoice.total - invoice.paidAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <h3 style="margin: 0 0 12px 0; color: #92400e;">Notes</h3>
          <p style="margin: 0; white-space: pre-line;">${invoice.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
};