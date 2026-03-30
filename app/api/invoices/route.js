import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Helper function to generate unique invoice number
const generateInvoiceNumber = async () => {
    // Format: INV-YYYY-##### (e.g., INV-2026-00001)
    const date = new Date();
    const year = date.getFullYear();
    const count = await prisma.invoice.count();
    const number = String(count + 1).padStart(5, '0');
    return `INV-${year}-${number}`;
};

// Generate or get invoice for an order
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
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

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check authorization - either buyer or seller
        if (order.userId !== userId && order.store.userId !== userId) {
            return NextResponse.json({ error: 'Not authorized to access this invoice' }, { status: 401 });
        }

        // Check if invoice already exists
        let invoice = await prisma.invoice.findFirst({
            where: { orderId }
        });

        if (!invoice) {
            // Create new invoice
            const invoiceNumber = await generateInvoiceNumber();
            
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

            invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    orderId,
                    userId: order.userId,
                    storeId: order.storeId,
                    customerName: order.address.name,
                    customerEmail: order.user.email,
                    customerPhone: order.address.phone,
                    deliveryAddress: `${order.address.house}, ${order.address.area}, ${order.address.city}, ${order.address.state} - ${order.address.pin}`,
                    subtotal: subtotal,
                    deliveryCharges: deliveryCharges,
                    gst: 0,
                    gstAmount: 0,
                    total: total,
                    paymentMethod: order.paymentMethod,
                    isPaid: order.isPaid,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            });
        }

        // Get full invoice with order details
        const fullInvoice = await prisma.invoice.findUnique({
            where: { id: invoice.id },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            }
                        },
                        address: true
                    }
                },
                store: true,
                user: true
            }
        });

        return NextResponse.json({
            success: true,
            data: fullInvoice
        });
    } catch (error) {
        console.error('Invoice error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Get invoice by order ID
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const invoice = await prisma.invoice.findFirst({
            where: { orderId },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            }
                        },
                        address: true
                    }
                },
                store: true,
                user: true
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Check authorization
        if (invoice.userId !== userId && invoice.order.store.userId !== userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
