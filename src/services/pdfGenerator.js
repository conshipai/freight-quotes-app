// src/services/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotePDF = (quote) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('FREIGHT QUOTE', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Quote #: ${quote.quoteNumber}`, 20, 35);
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 20, 42);
  doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 20, 49);
  
  // Customer Info
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Customer Information', 20, 65);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Company: ${quote.customer?.company}`, 20, 73);
  doc.text(`Contact: ${quote.customer?.name}`, 20, 80);
  doc.text(`Email: ${quote.customer?.email}`, 20, 87);
  doc.text(`Phone: ${quote.customer?.phone}`, 20, 94);
  
  // Route Information
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Route Information', 20, 110);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Origin: ${quote.origin?.airport} - ${quote.origin?.city}, ${quote.origin?.country}`, 20, 118);
  doc.text(`Destination: ${quote.destination?.airport} - ${quote.destination?.city}, ${quote.destination?.country}`, 20, 125);
  doc.text(`Service Type: ${quote.serviceType || 'Export Air'}`, 20, 132);
  doc.text(`Incoterm: ${quote.incoterm}`, 20, 139);
  
  // Cargo Details
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Cargo Details', 20, 155);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Total Pieces: ${quote.cargo?.totalPieces}`, 20, 163);
  doc.text(`Total Weight: ${quote.cargo?.totalWeight} kg`, 20, 170);
  doc.text(`Total Volume: ${quote.cargo?.totalVolume} m³`, 20, 177);
  
  // Carrier Rates Table
  if (quote.carrierQuotes && quote.carrierQuotes.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Carrier Rates', 20, 195);
    
    const tableData = quote.carrierQuotes.map(carrier => [
      carrier.carrier,
      carrier.routing,
      `${carrier.transitTime?.general || carrier.transitTime} days`,
      `$${carrier.rates?.general?.total || carrier.rate || 0}`,
      carrier.space
    ]);
    
    doc.autoTable({
      startY: 200,
      head: [['Carrier', 'Routing', 'Transit', 'Rate (USD)', 'Space']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`Quote-${quote.quoteNumber}.pdf`);
};

export const generateBookingPDF = (bookingData) => {
  const { bookingNumber, quote, selectedCarrier, rateType, pickupDate, deliveryDate } = bookingData;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('BOOKING CONFIRMATION', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Booking #: ${bookingNumber}`, 20, 35);
  doc.setFont(undefined, 'normal');
  doc.text(`Quote Reference: ${quote?.quoteNumber}`, 20, 42);
  doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 20, 49);
  
  // Carrier Information
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Carrier Information', 20, 65);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Carrier: ${selectedCarrier?.carrier}`, 20, 73);
  doc.text(`Service Level: ${rateType === 'express' ? 'Express Service' : 'General Service'}`, 20, 80);
  doc.text(`Routing: ${selectedCarrier?.routing}`, 20, 87);
  doc.text(`Transit Time: ${selectedCarrier?.transitTime?.[rateType]} days`, 20, 94);
  
  // Schedule
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Schedule', 20, 110);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Pickup Date: ${pickupDate ? new Date(pickupDate).toLocaleDateString() : 'TBD'}`, 20, 118);
  doc.text(`Delivery Date: ${deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'TBD'}`, 20, 125);
  
  // Cost Breakdown
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Cost Breakdown', 20, 141);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const rate = selectedCarrier?.rates?.[rateType] || selectedCarrier?.rate || {};
  doc.text(`Ground Transportation: $${rate.ground?.toLocaleString() || 0}`, 20, 149);
  doc.text(`Air Freight: $${rate.air?.toLocaleString() || 0}`, 20, 156);
  doc.text(`Fees & Surcharges: $${rate.fees?.toLocaleString() || 0}`, 20, 163);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: $${rate.total?.toLocaleString() || 0} USD`, 20, 170);
  
  // Special Handling (if applicable)
  if (quote?.hasBatteries || quote?.hasDG) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Special Handling Requirements', 20, 186);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    let yPos = 194;
    if (quote.hasBatteries) {
      doc.text('• Battery Shipment', 20, yPos);
      yPos += 7;
    }
    if (quote.hasDG) {
      doc.text('• Dangerous Goods', 20, yPos);
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text(
    'This is an electronic confirmation. Please retain for your records.',
    105,
    doc.internal.pageSize.height - 20,
    { align: 'center' }
  );
  
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    105,
    doc.internal.pageSize.height - 15,
    { align: 'center' }
  );
  
  // Save the PDF
  doc.save(`Booking-${bookingNumber}.pdf`);
};
