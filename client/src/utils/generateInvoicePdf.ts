import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  orderNumber: string;
  orderDate?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod: string;
  items: {
    title: string;
    category?: string;
    quantity: number;
    price: number;
    materials?: string;
  }[];
  totalAmount: number;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background warm sand linen tint
  doc.setFillColor(250, 247, 238);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header banner in soft butter yellow
  doc.setFillColor(246, 229, 141);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent separator bar
  doc.setFillColor(184, 142, 40);
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Studio Branding text
  doc.setTextColor(28, 25, 23);
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text('THE SHEFALIS SPACE', 18, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 95, 45);
  doc.text('DESIGN STUDIO · HANDMADE · ART · LIVING', 18, 24);
  doc.text('Studio Jaipur, Rajasthan 302001 · studio@theshefalisspace.com · +91 98765 43210', 18, 30);

  // Invoice Title badge on right
  doc.setFillColor(28, 25, 23);
  doc.roundedRect(pageWidth - 68, 12, 50, 22, 2, 2, 'F');
  doc.setTextColor(250, 247, 238);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TAX INVOICE', pageWidth - 43, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.orderNumber, pageWidth - 43, 27, { align: 'center' });

  // Invoice & Customer Info Grid
  const dateStr = data.orderDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Left Box: Billed To
  doc.setTextColor(28, 25, 23);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('BILLED & SHIPPED TO:', 18, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.customerName || 'Valued Collector', 18, 61);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(87, 83, 78);
  doc.text(`Email: ${data.customerEmail}`, 18, 67);
  if (data.customerPhone) {
    doc.text(`Phone: ${data.customerPhone}`, 18, 72);
  }
  if (data.shippingAddress) {
    const splitAddress = doc.splitTextToSize(`Address: ${data.shippingAddress}`, 85);
    doc.text(splitAddress, 18, data.customerPhone ? 77 : 72);
  }

  // Right Box: Order Metadata
  doc.setTextColor(28, 25, 23);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('ORDER DETAILS:', pageWidth - 85, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(87, 83, 78);
  doc.text(`Invoice No: ${data.orderNumber}`, pageWidth - 85, 61);
  doc.text(`Date of Issue: ${dateStr}`, pageWidth - 85, 67);
  doc.text(`Payment Gateway: ${data.paymentMethod}`, pageWidth - 85, 73);
  doc.text(`Payment Status: Verified & Paid`, pageWidth - 85, 79);

  // Table of Items
  const tableRows = data.items.map((item, index) => {
    const subtotal = item.price * item.quantity;
    return [
      (index + 1).toString(),
      item.title + (item.materials ? `\n(${item.materials})` : ''),
      item.category || 'Studio Piece',
      item.quantity.toString(),
      `INR ${item.price.toLocaleString('en-IN')}`,
      `INR ${subtotal.toLocaleString('en-IN')}`
    ];
  });

  const startY = data.shippingAddress ? 94 : 88;

  autoTable(doc, {
    startY: startY,
    head: [['#', 'Piece & Description', 'Category', 'Qty', 'Unit Price', 'Amount']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [28, 25, 23],
      textColor: [250, 247, 238],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3.5
    },
    bodyStyles: {
      fillColor: [253, 251, 247],
      textColor: [28, 25, 23],
      fontSize: 8.5,
      cellPadding: 3.5,
      lineColor: [231, 227, 212],
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [247, 243, 231]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 32, halign: 'right' }
    },
    margin: { left: 18, right: 18 }
  });

  // Calculate totals positioning
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Calculation Breakdown
  const subtotal = data.totalAmount;
  const taxableAmount = Math.round(subtotal / 1.18);
  const gstAmount = subtotal - taxableAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  doc.setFillColor(253, 251, 247);
  doc.setDrawColor(231, 227, 212);
  doc.roundedRect(pageWidth - 92, finalY, 74, 46, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(87, 83, 78);
  doc.text('Taxable Value:', pageWidth - 88, finalY + 7);
  doc.text(`INR ${taxableAmount.toLocaleString('en-IN')}`, pageWidth - 22, finalY + 7, { align: 'right' });

  doc.text('CGST (9%):', pageWidth - 88, finalY + 14);
  doc.text(`INR ${cgst.toLocaleString('en-IN')}`, pageWidth - 22, finalY + 14, { align: 'right' });

  doc.text('SGST (9%):', pageWidth - 88, finalY + 21);
  doc.text(`INR ${sgst.toLocaleString('en-IN')}`, pageWidth - 22, finalY + 21, { align: 'right' });

  doc.text('Insured Shipping:', pageWidth - 88, finalY + 28);
  doc.text('FREE', pageWidth - 22, finalY + 28, { align: 'right' });

  // Grand Total Line
  doc.setFillColor(246, 229, 141);
  doc.rect(pageWidth - 92, finalY + 33, 74, 13, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(28, 25, 23);
  doc.text('Grand Total:', pageWidth - 88, finalY + 41.5);
  doc.text(`INR ${subtotal.toLocaleString('en-IN')}`, pageWidth - 22, finalY + 41.5, { align: 'right' });

  // Authenticity Seal on Bottom Left
  doc.setDrawColor(184, 142, 40);
  doc.setLineWidth(0.6);
  doc.roundedRect(18, finalY + 2, 75, 42, 2, 2, 'D');

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text('STUDIO PROVENANCE GUARANTEE', 22, finalY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(87, 83, 78);
  const sealText = 'Each piece in this order was handcrafted with soul, passion & meditation. Accompanied by original certificate of provenance.';
  doc.text(doc.splitTextToSize(sealText, 68), 22, finalY + 17);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(184, 142, 40);
  doc.text('Authorized Signature · The Shefalis Space', 22, finalY + 38);

  // Bottom Footer
  doc.setFillColor(28, 25, 23);
  doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
  doc.setTextColor(246, 229, 141);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Thank you for welcoming our handcrafted studio creations into your home and sacred spaces.', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Save the PDF
  const cleanOrderNum = data.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`THE_SHEFALIS_SPACE_Invoice_${cleanOrderNum}.pdf`);
};
