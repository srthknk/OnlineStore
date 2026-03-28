import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper function to generate unique invoice number
const generateInvoiceNumber = async (index) => {
    const date = new Date();
    const year = date.getFullYear();
    const number = String(index + 1).padStart(5, '0');
    return `INV-${year}-${number}`;
};

// Generate invoices for all orders that don't have one
export async function POST(request) {
    try {
        // Get all orders that don't have an invoice
        const ordersWithoutInvoice = await prisma.order.findMany({
            where: {
                invoice: null
            },
            include: {
                user: true,
                store: true,
                address: true,
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        console.log(`Found ${ordersWithoutInvoice.length} orders without invoices`);

        let generatedCount = 0;
        const errors = [];

        // Generate invoice for each order
        for (let i = 0; i < ordersWithoutInvoice.length; i++) {
            try {
                const order = ordersWithoutInvoice[i];
                const invoiceNumber = await generateInvoiceNumber(i);
                
                // Calculate subtotal from order items only
                const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                // Get order settings to calculate delivery charges
                let orderSettings = await prisma.orderSettings.findFirst();
                if (!orderSettings) {
                    orderSettings = await prisma.orderSettings.create({
                        data: {
                            minimumAmountForFreeDelivery: 500,
                            deliveryCharges: 50,
                            freeDeliveryMessage: "Yay! You unlocked free delivery"
                        }
                    });
                }
                
                // Calculate delivery charges
                const deliveryCharges = subtotal >= orderSettings.minimumAmountForFreeDelivery ? 0 : orderSettings.deliveryCharges;
                const total = subtotal + deliveryCharges;

                await prisma.invoice.create({
                    data: {
                        invoiceNumber,
                        orderId: order.id,
                        userId: order.userId,
                        storeId: order.storeId,
                        customerName: order.address.name,
                        customerEmail: order.user.email,
                        customerPhone: order.address.phone,
                        deliveryAddress: `${order.address.house || ''}, ${order.address.area || ''}, ${order.address.city}, ${order.address.state} - ${order.address.pin}`.replace(/^,\s+/, ''),
                        subtotal: subtotal,
                        deliveryCharges: deliveryCharges,
                        gst: 0,
                        gstAmount: 0,
                        total: total,
                        paymentMethod: order.paymentMethod,
                        isPaid: order.isPaid,
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                        invoiceDate: order.createdAt
                    }
                });

                generatedCount++;
                console.log(`✓ Generated invoice ${invoiceNumber} for order ${order.id}`);
            } catch (error) {
                const message = `Error generating invoice for order ${ordersWithoutInvoice[i].id}: ${error.message}`;
                console.error(message);
                errors.push(message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Bulk invoice generation completed`,
            generated: generatedCount,
            total: ordersWithoutInvoice.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Bulk generate invoices error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// GET endpoint to check invoice generation status
export async function GET(request) {
    try {
        const totalOrders = await prisma.order.count();
        const ordersWithInvoice = await prisma.order.count({
            where: {
                invoice: {
                    isNot: null
                }
            }
        });
        const ordersWithoutInvoice = totalOrders - ordersWithInvoice;

        return NextResponse.json({
            success: true,
            totalOrders,
            ordersWithInvoice,
            ordersWithoutInvoice,
            progress: totalOrders > 0 ? `${Math.round((ordersWithInvoice / totalOrders) * 100)}%` : '0%'
        });
    } catch (error) {
        console.error('Get status error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
