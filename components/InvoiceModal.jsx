import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPrint, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const InvoiceModal = ({ invoice, onClose, storeName, websiteName, autoDownload = false }) => {
    const invoiceRef = useRef();
    const [isDownloading, setIsDownloading] = useState(false);

    if (!invoice) return null;

    const {
        invoiceNumber,
        invoiceDate,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        subtotal,
        deliveryCharges,
        total,
        paymentMethod,
        isPaid,
        order,
        store,
        dueDate
    } = invoice;

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            const doc = new jsPDF();
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            let yPosition = 12;
            const margin = 12;
            const contentWidth = pageWidth - 2 * margin;

            // ==================== HEADER SECTION ====================
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(26);
            doc.setTextColor(37, 99, 235);
            doc.text(websiteName || 'E-Commerce Store', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('PROFESSIONAL INVOICE', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 6;

            // Decorative line
            doc.setDrawColor(37, 99, 235);
            doc.setLineWidth(0.8);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;

            // ==================== SELLER & INVOICE INFO ====================
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(37, 99, 235);
            doc.text('SELLER INFORMATION', margin, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(store?.storeName || 'Store', margin, yPosition);
            yPosition += 5;

            if (store?.description) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(store.description, margin, yPosition);
                yPosition += 4;
            }

            // Invoice Details Box - Right Side
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(37, 99, 235);
            doc.text('Invoice #:', pageWidth - margin - 50, yPosition - 6);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(invoiceNumber, pageWidth - margin - 50, yPosition);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(37, 99, 235);
            doc.text('Date:', pageWidth - margin - 50, yPosition + 6);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(new Date(invoiceDate).toLocaleDateString('en-IN'), pageWidth - margin - 50, yPosition + 10);

            yPosition += 18;

            // ==================== CUSTOMER SECTION ====================
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(37, 99, 235);
            doc.text('BILL TO', margin, yPosition);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(customerName, margin, yPosition + 5);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(customerEmail, margin, yPosition + 9);
            doc.text(`📞 ${customerPhone}`, margin, yPosition + 13);

            // Delivery Address
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(37, 99, 235);
            doc.text('DELIVER TO', pageWidth / 2, yPosition);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            const addressLines = doc.splitTextToSize(deliveryAddress, contentWidth / 2 - 5);
            doc.text(addressLines, pageWidth / 2, yPosition + 5);

            yPosition += 20;

            // ==================== ITEMS TABLE ====================
            // Table Header Background
            doc.setFillColor(37, 99, 235);
            doc.rect(margin, yPosition, contentWidth, 7, 'F');

            // Table Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text('PRODUCT', margin + 2, yPosition + 4.5);
            doc.text('QTY', pageWidth / 2, yPosition + 4.5);
            doc.text('UNIT PRICE', pageWidth - 90, yPosition + 4.5);
            doc.text('AMOUNT', pageWidth - margin - 20, yPosition + 4.5);
            yPosition += 8;

            // Table Items
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);

            if (order?.orderItems) {
                order.orderItems.forEach((item, index) => {
                    const itemTotal = item.price * item.quantity;
                    const productName = item.product?.name || item.productName;
                    const lines = doc.splitTextToSize(productName, 60);

                    // Alternate row colors
                    if (index % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(margin, yPosition - 2, contentWidth, lines.length * 4 + 2, 'F');
                    }

                    doc.text(lines, margin + 2, yPosition);
                    doc.text(String(item.quantity), pageWidth / 2, yPosition);
                    doc.text(`₹${item.price.toFixed(2)}`, pageWidth - 90, yPosition);
                    doc.text(`₹${itemTotal.toFixed(2)}`, pageWidth - margin - 20, yPosition);
                    yPosition += lines.length * 4 + 3;
                });
            }

            yPosition += 2;

            // ==================== TOTALS SECTION ====================
            doc.setDrawColor(37, 99, 235);
            doc.setLineWidth(0.5);
            doc.line(pageWidth - 85, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;

            // Subtotal
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text('Subtotal:', pageWidth - 85, yPosition);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin - 20, yPosition);
            yPosition += 6;

            // Delivery Charges
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text('Delivery Charges:', pageWidth - 85, yPosition);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            // Set green color for FREE, black for charges
            if (deliveryCharges === 0) {
                doc.setTextColor(34, 197, 94); // Green
            } else {
                doc.setTextColor(0, 0, 0); // Black
            }
            doc.text(deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges.toFixed(2)}`, pageWidth - margin - 20, yPosition);
            yPosition += 8;

            // Total - Big and Prominent
            doc.setFillColor(37, 99, 235);
            doc.rect(pageWidth - 85, yPosition - 2, 73, 10, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(255, 255, 255);
            doc.text('TOTAL:', pageWidth - 83, yPosition + 4.5);
            doc.setFontSize(14);
            doc.text(`₹${total.toFixed(2)}`, pageWidth - margin - 20, yPosition + 4.5, { align: 'right' });

            yPosition += 14;

            // ==================== PAYMENT SECTION ====================
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Payment Method: ${paymentMethod || 'Not specified'}  |  Status: ${isPaid ? '✓ Paid' : 'Pending'}`, margin, yPosition + 2);

            yPosition += 8;

            // ==================== FOOTER ====================
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
            doc.text('This is a computer-generated invoice. No signature is required.', pageWidth / 2, yPosition + 4, { align: 'center' });

            doc.save(`${invoiceNumber}.pdf`);
            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('PDF download error:', error);
            toast.error('Failed to download invoice. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Auto-download if requested
    useEffect(() => {
        if (autoDownload && invoiceRef.current) {
            const timer = setTimeout(() => {
                handleDownloadPDF();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoDownload, invoiceNumber]);

    const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center print:hidden">
                    <h2 className="text-2xl font-bold">Invoice</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Print"
                        >
                            <FontAwesomeIcon icon={faPrint} size="lg" />
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Download PDF"
                        >
                            <FontAwesomeIcon icon={faDownload} size="lg" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div ref={invoiceRef} className="p-6 md:p-8 bg-white">
                    {/* Header Section */}
                    <div className="mb-8 pb-6 border-b-2 border-gray-300">
                        <div className="text-center mb-6">
                            <p className="text-3xl font-bold text-blue-600">{websiteName || 'E-Commerce Store'}</p>
                            <p className="text-gray-600 mt-1">Professional Invoice</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Store Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">SOLD BY:</h3>
                                <p className="text-lg font-bold text-gray-900">{store?.storeName || 'Store'}</p>
                                <p className="text-sm text-gray-600 mt-1">{store?.description || ''}</p>
                            </div>

                            {/* Invoice Info */}
                            <div className="text-right">
                                <div className="mb-3">
                                    <p className="text-xs text-gray-600">INVOICE NO.</p>
                                    <p className="text-xl font-bold text-gray-900">{invoiceNumber}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-xs text-gray-600">INVOICE DATE</p>
                                    <p className="text-sm text-gray-900">{formatDate(invoiceDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">DUE DATE</p>
                                    <p className="text-sm text-gray-900">{formatDate(dueDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Bill To */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Bill To:</h3>
                            <p className="font-semibold text-gray-900">{customerName}</p>
                            <p className="text-sm text-gray-600">{customerEmail}</p>
                            <p className="text-sm text-gray-600">{customerPhone}</p>
                        </div>

                        {/* Ship To */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Ship To:</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{deliveryAddress}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Qty</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.orderItems?.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-200">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <p className="font-medium">{item.product?.name || item.productName}</p>
                                            {item.size && <p className="text-xs text-gray-600">Size: {item.size}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                            {formatCurrency(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-8">
                        <div className="w-full md:w-96">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-gray-700">Delivery Charges:</span>
                                    <span className={`font-semibold ${deliveryCharges === 0 ? 'text-green-700' : 'text-gray-900'}`}>
                                        {deliveryCharges === 0 ? 'FREE' : formatCurrency(deliveryCharges)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 bg-blue-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                                    <span className="font-bold text-gray-900 text-lg">Total Amount:</span>
                                    <span className="font-bold text-blue-600 text-lg">{formatCurrency(total)}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium text-gray-900">{paymentMethod || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Status:</span>
                                    <span className={`font-medium px-2 py-1 rounded ${
                                        isPaid
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-6 text-center text-xs text-gray-600">
                        <p>Thank you for your business!</p>
                        <p className="mt-2">
                            This is a computer-generated invoice. No signature is required.
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .fixed {
                        position: static !important;
                    }
                    .bg-black\\/50,
                    [class*="bg-black"] {
                        background: white !important;
                    }
                    .backdrop-blur-sm {
                        backdrop-filter: none !important;
                    }
                    .rounded-lg {
                        border-radius: 0 !important;
                    }
                    .border {
                        border: none !important;
                    }
                    .max-h-\\[90vh\\],
                    .overflow-y-auto {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    .shadow-2xl,
                    .shadow-md {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceModal;
