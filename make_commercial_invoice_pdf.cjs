const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'invoice_INV-2026-GOLD-99.pdf');
const publicPdfPath = path.join(__dirname, 'public', 'invoice_INV-2026-GOLD-99.pdf');

function generateInvoicePdf(destPath) {
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const stream = fs.createWriteStream(destPath);
  doc.pipe(stream);

  // Palette
  const NAVY = '#0a192f';
  const BLUE_HEADER = '#1e3a8a';
  const LIGHT_GRAY = '#f8fafc';
  const BORDER_COLOR = '#cbd5e1';
  const TEXT_DARK = '#0f172a';
  const TEXT_MUTED = '#475569';

  // 1. Top Header Banner / Letterhead
  doc.rect(36, 36, 523, 60).fill(BLUE_HEADER);
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('COMMERCIAL INVOICE', 50, 48);
  doc.fontSize(9).font('Helvetica').text('INTERNATIONAL TRADE FINANCE & EXPORT DOCUMENTATION', 50, 70);
  doc.fontSize(10).font('Helvetica-Bold').text('ORIGINAL FOR RECIPIENT', 380, 58, { align: 'right', width: 165 });

  // 2. Exporter Company Header
  doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold').text('AURUM AGRI & METALS PVT LTD', 36, 110);
  doc.fillColor(TEXT_MUTED).fontSize(8.5).font('Helvetica')
     .text('Registered Office: 104 Nariman Point, Marine Drive, Mumbai - 400021, Maharashtra, India', 36, 126)
     .text('IEC: IEC123456789 | PAN: ABCDE1234F | GSTIN: 27AAACA1234F1Z5 | Tel: +91 (22) 5599-0100', 36, 138)
     .text('Email: trade-finance@aurummetals.in | Web: www.aurummetals.in', 36, 150);

  doc.moveTo(36, 165).lineTo(559, 165).strokeColor(BORDER_COLOR).lineWidth(1).stroke();

  // 3. Two-Column Metadata Block
  const metaY = 175;
  doc.rect(36, metaY, 255, 120).fillAndStroke(LIGHT_GRAY, BORDER_COLOR);
  doc.fillColor(BLUE_HEADER).fontSize(9).font('Helvetica-Bold').text('INVOICE & TRANSPORT DETAILS', 46, metaY + 8);
  
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica-Bold');
  doc.text('Invoice No:', 46, metaY + 24).text('INV-2026-GOLD-99', 130, metaY + 24);
  doc.text('Invoice Date:', 46, metaY + 38).text('2026-07-01', 130, metaY + 38);
  doc.text('LC Number:', 46, metaY + 52).text('LC-GLD-8821 (dt: 2026-06-25)', 130, metaY + 52);
  doc.text('Shipping Bill No:', 46, metaY + 66).text('SB-AU-22109 (dt: 2026-07-03)', 130, metaY + 66);
  doc.text('AD Bank Code:', 46, metaY + 80).text('HDFC0000213 (HDFC Bank)', 130, metaY + 80);
  doc.text('Incoterms:', 46, metaY + 94).text('FOB (Free On Board)', 130, metaY + 94);

  // Right Column: Consignee / Buyer Details
  doc.rect(304, metaY, 255, 120).fillAndStroke(LIGHT_GRAY, BORDER_COLOR);
  doc.fillColor(BLUE_HEADER).fontSize(9).font('Helvetica-Bold').text('BUYER / CONSIGNEE (IMPORTER)', 314, metaY + 8);
  
  doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold').text('VALUABLE METALS GMBH', 314, metaY + 24);
  doc.fillColor(TEXT_MUTED).fontSize(8.5).font('Helvetica')
     .text('Bahnhofstrasse 45, 8001 Zurich, Switzerland', 314, metaY + 38)
     .text('Country of Destination: CHE (Switzerland)', 314, metaY + 52)
     .text('Port of Loading: INBOM1 (Mumbai Port)', 314, metaY + 66)
     .text('Port of Discharge: CHZRH (Zurich Hub)', 314, metaY + 80)
     .text('Country of Origin of Goods: India (IND)', 314, metaY + 94);

  // 4. Line Items Table Header
  const tableY = 310;
  doc.rect(36, tableY, 523, 22).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('SR', 44, tableY + 6);
  doc.text('HS CODE', 70, tableY + 6);
  doc.text('DESCRIPTION OF GOODS', 140, tableY + 6);
  doc.text('QUANTITY', 340, tableY + 6);
  doc.text('RATE (USD)', 420, tableY + 6);
  doc.text('AMOUNT (USD)', 480, tableY + 6, { width: 70, align: 'right' });

  // Line Item Row 1
  const r1 = tableY + 22;
  doc.rect(36, r1, 523, 40).fillAndStroke('#ffffff', BORDER_COLOR);
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text('01', 44, r1 + 12);
  doc.font('Helvetica-Bold').text('710812', 70, r1 + 12);
  doc.font('Helvetica').text('99.99% Pure Gold Bullion Bars (Unwrought Ingot Bars)', 140, r1 + 12, { width: 195 });
  doc.text('500.00 oz', 340, r1 + 12);
  doc.text('$2,950.00', 420, r1 + 12);
  doc.font('Helvetica-Bold').text('$1,475,000.00', 480, r1 + 12, { width: 70, align: 'right' });

  // Subtotal & Total Block
  const totY = r1 + 40;
  doc.rect(36, totY, 523, 28).fillAndStroke('#f1f5f9', BORDER_COLOR);
  doc.fillColor(NAVY).fontSize(9.5).font('Helvetica-Bold');
  doc.text('TOTAL DECLARED INVOICE VALUE (FOB):', 210, totY + 8);
  doc.text('$1,475,000.00 USD', 450, totY + 8, { width: 100, align: 'right' });

  // Amount in Words Box
  const wordsY = totY + 36;
  doc.rect(36, wordsY, 523, 24).fillAndStroke(LIGHT_GRAY, BORDER_COLOR);
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica-Bold').text('AMOUNT IN WORDS:', 46, wordsY + 7);
  doc.font('Helvetica').text('SAY US DOLLARS ONE MILLION FOUR HUNDRED SEVENTY-FIVE THOUSAND ONLY.', 150, wordsY + 7);

  // Statutory Declaration & Signature Section
  const declY = wordsY + 36;
  doc.rect(36, declY, 320, 110).fillAndStroke(LIGHT_GRAY, BORDER_COLOR);
  doc.fillColor(BLUE_HEADER).fontSize(8.5).font('Helvetica-Bold').text('STATUTORY EXPORT DECLARATION (FEMA 2026)', 46, declY + 8);
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica')
     .text('We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Export proceeds for this transaction will be realized through authorized banking channels within the statutory timeframe mandated under FEMA 2026 guidelines.', 46, declY + 22, { width: 300, align: 'justify' })
     .text('AD Category-I Bank EDPMS Monitoring Reference: HDFC-EDPMS-2026-99120', 46, declY + 82);

  // Authorized Signatory Box
  doc.rect(368, declY, 191, 110).fillAndStroke(LIGHT_GRAY, BORDER_COLOR);
  doc.fillColor(NAVY).fontSize(8.5).font('Helvetica-Bold').text('FOR AURUM AGRI & METALS PVT LTD', 376, declY + 8, { width: 175, align: 'center' });

  // Stamp Box Graphic
  doc.rect(415, declY + 26, 95, 45).fillAndStroke('#eff6ff', '#bfdbfe');
  doc.fillColor('#1d4ed8').fontSize(7.5).font('Helvetica-Bold')
     .text('AURUM AGRI & METALS', 420, declY + 33, { align: 'center', width: 85 })
     .text('EXPORT DIVISION', 420, declY + 45, { align: 'center', width: 85 })
     .text('★ MUMBAI ★', 420, declY + 57, { align: 'center', width: 85 });

  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica-Bold').text('AUTHORIZED SIGNATORY', 376, declY + 92, { width: 175, align: 'center' });

  // Footer
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
     .text('THIS IS A COMPUTER GENERATED COMMERCIAL EXPORT INVOICE ISSUED UNDER INDIA TRADE REGULATIONS.', 36, 760, { align: 'center', width: 523 });

  doc.end();
}

generateInvoicePdf(pdfPath);
generateInvoicePdf(publicPdfPath);
console.log('Authentic Commercial Invoice PDF generated successfully!');
