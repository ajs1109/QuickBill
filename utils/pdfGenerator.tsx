import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Invoice } from '../types';
import type { CompanyInfo } from '../types/settings';

export const generateInvoicePDF = async (
  invoice: Invoice,
  companyInfo: CompanyInfo
) => {
  // Load company logo asset
  const imageAsset = Asset.fromModule(require('../assets/images/logos/GSE.png'));
  await imageAsset.downloadAsync();
  const base64Logo = await FileSystem.readAsStringAsync(imageAsset.localUri!, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Generate HTML with dynamic invoice and company info
  const htmlContent = generateInvoiceHTML(invoice, companyInfo, base64Logo);

  // Generate PDF
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    base64: false,
  });

  // More meaningful filename
  const fileName = `invoice_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${invoice.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const newUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.moveAsync({
    from: uri,
    to: newUri,
  });

  // Share PDF if available
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(newUri);
  }

  return newUri;
};

const generateInvoiceHTML = (
  invoice: Invoice,
  companyInfo: CompanyInfo,
  base64Logo?: string
): string => {
  const itemsHTML = invoice.items
    .map(
      (item) => `
        <tr>
          <td class="td br">${item.name}</td>
          <td class="td br">${item.quantity} ${item.quantity > 1 ? 'Brass' : 'Brass'}</td>
          <td class="td br">${item.price.toFixed(2)}</td>
          <td class="td">${(item.quantity * item.price).toFixed(2)}/-</td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      color: #111;
      background: #fff;
      font-size: 16px;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      width: 700px;
      margin: 60px auto;
      background: #fff;
      box-sizing: border-box;
      padding: 32px 38px 36px 38px;
      box-shadow: 0 0 12px #eee;
      border-radius: 12px;
      display: block;
    }
    .header {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
      margin-bottom: 18px;
      position: relative;
      min-height: 95px;
    }
    .company-right {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }
    .company-info{
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .logo-img {
      width: 68px;
      height: 68px;
      object-fit: contain;
      border-radius: 50%;
      margin-bottom: 6px;
      box-shadow: 0 0 4px #eee;
      border: 2px solid #f5f5f5;
      display: block;
      flex-shrink: 0;
      position: relative;
    }
    .company-name {
      font-size: 23px;
      font-weight: bold;
      text-align: right;
      line-height: 1.18;
      color: #111;
      letter-spacing: 0.5px;
    }
    .company-contact {
      font-size: 15px;
      font-weight: normal;
      color: #444;
      margin-top: 2px;
    }
    .company-address {
      font-size: 13px;
      font-weight: normal;
      color: #444;
      margin-top: 2px;
      text-align: right;
    }
    hr {
      border: none;
      border-top: 1.8px solid #dadada;
      margin: 17px 0 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .invoice-to {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .client-name {
      font-size: 21px;
      font-weight: bold;
      margin-bottom: 4px;
      color: #111;
      letter-spacing: 0.2px;
    }
    .client-details {
      font-size: 15px;
      color: #222;
      line-height: 1.6;
      margin-bottom: 4px;
    }
    .date-section {
      font-size: 16px;
      color: #222;
      margin-bottom: 18px;
      text-align: right;
      font-weight: 500;
    }
    .big-table-wrapper {
      margin-top: 30px;
      margin-bottom: 25px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #111;
      background: #fff;
    }
    .table thead th {
      background: #111;
      color: #fff;
      padding: 13px 7px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      border-right: 1px solid #fff;
      border-bottom: 2px solid #111;
    }
    .table thead th:last-child {
      border-right: none;
    }
    .td {
      padding: 10px 7px;
      font-size: 16px;
      font-weight: 500;
      background: #fcfcfc;
      text-align: center;
      border-bottom: 1.2px solid #eee;
      border-right: 1px solid #eee;
    }
    .td:last-child {
      border-right: none;
    }
    .br {
      border-right: 1px solid #eee;
    }
    .table tbody tr:last-child td {
      border-bottom: 2.5px solid #111;
    }
    .bottom {
      display: flex;
      flex-direction: row;
      gap: 25px;
      margin-top: 18px;
    }
    .left-details {
      width: 56%;
    }
    .pay-label,
    .vehicle-label {
      font-size: 16px;
      font-weight: bold;
      margin-top: 12px;
      margin-bottom: 3px;
      color: #222;
      letter-spacing: 0.1px;
    }
    .pay-value {
      font-size: 16px;
      margin-bottom: 24px;
      font-weight: normal;
      color: #333;
    }
    .vehicle-value {
      font-size: 16px;
      margin-bottom: 8px;
      font-weight: normal;
      color: #222;
    }
    .right-totalbox {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .totals-box {
      min-width: 210px;
      border: 2px solid #111;
      background: #fff;
      padding: 5px 0 7px 0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 7px 17px;
      font-size: 16px;
      border-bottom: 1.3px solid #eee;
      background: #faf9fa;
    }
    .final-total {
      display: flex;
      justify-content: space-between;
      background-color: #111;
      color: #fff;
      font-weight: bold;
      font-size: 18px;
      padding: 13px 17px 11px 17px;
      border-bottom-left-radius: 3px;
      border-bottom-right-radius: 3px;
      margin-top: 2px;
    }
    .thankyou {
      margin-top: 45px;
      font-size: 18px;
      font-weight: bold;
      color: #222;
    }
    .signature-section {
      text-align: right;
      margin-top: 48px;
    }
    .signature-line {
      border-bottom: 2px solid #777;
      width: 210px;
      margin-left: auto;
    }
    @media print {
      body {
        padding: 8px;
        margin: 0;
        max-width: none;
        background: #fff;
      }
      .container {
        margin: 0;
        padding: 12px 20px 16px 20px;
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-right">
        <div class="company-info">
          <div class="company-name">${companyInfo.name || "Company Name"}</div>
          <div class="company-contact">
            ${companyInfo.phone || ""}
            ${companyInfo.email ? " | " + companyInfo.email : ""}
          </div>
          ${companyInfo.address ? `<div class="company-address">${companyInfo.address}</div>` : ""}
        </div>
        <img
          src="data:image/png;base64,${base64Logo || ''}"
          alt="Company Logo"
          class="logo-img"
        />
      </div>
    </div>
    <hr />
    <div class="info-row">
      <div>
        <div class="invoice-to">INVOICE TO :</div>
        <div class="client-name">${invoice.clientName.toUpperCase()}</div>
        <div class="client-details">
          ${invoice.clientPhone ? `P : ${invoice.clientPhone}<br/>` : ''}
          ${invoice.clientAddress ? `A : ${invoice.clientAddress}` : ''}
        </div>
      </div>
      <div class="date-section">
        Date : ${invoice.date}
      </div>
    </div>
    <div class="big-table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>MATERIALS</th>
            <th>QTY</th>
            <th>PRICE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
    </div>
    <div class="bottom">
      <div class="left-details">
        <div class="pay-label">Payment Method :</div>
        <div class="pay-value">CASH</div>
        <div class="vehicle-label">Vehicle No :</div>
        <div class="vehicle-value">${invoice.vehicleNo || ''}</div>
      </div>
      <div class="right-totalbox">
        <div class="totals-box">
          <div class="totals-row">
            <span>Transport :</span>
            <span>-</span>
          </div>
          <div class="totals-row">
            <span>Paid :</span>
            <span>${invoice.paidAmount > 0 ? `₹${invoice.paidAmount.toFixed(2)}/-` : 'On Delivery'}</span>
          </div>
          ${(invoice.total - invoice.paidAmount) > 0
            ? `<div class="totals-row">
                <span>Pending :</span>
                <span>₹${(invoice.total - invoice.paidAmount).toFixed(2)}/-</span>
               </div>`
            : ''
          }
          <div class="final-total">
            <span>Total :</span>
            <span>₹${invoice.total.toFixed(2)}/-</span>
          </div>
        </div>
      </div>
    </div>
    <div class="thankyou">Thank you for Business!</div>
    <div class="signature-section"><div class="signature-line"></div></div>
  </div>
</body>
</html>
  `;
};
