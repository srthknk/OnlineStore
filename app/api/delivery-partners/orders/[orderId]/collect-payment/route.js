import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/delivery-partners/orders/[orderId]/collect-payment
 * Mark COD payment as collected by delivery partner
 */
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    const { orderId } = params;

    if (!userId) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get delivery partner
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId },
    });

    if (!deliveryPartner) {
      return Response.json(
        { success: false, message: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    // Get order and verify it's assigned to this partner
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.deliveryPartnerId !== deliveryPartner.id) {
      return Response.json(
        { success: false, message: 'This order is not assigned to you' },
        { status: 403 }
      );
    }

    if (order.paymentMethod !== 'COD') {
      return Response.json(
        { success: false, message: 'This order is not COD' },
        { status: 400 }
      );
    }

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCESS',
        isPaid: true,
        deliveryStatus: 'DELIVERED',
        deliveryCompletedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      message: 'Payment collected successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id.slice(0, 8).toUpperCase(),
        paymentStatus: updatedOrder.paymentStatus,
        isPaid: updatedOrder.isPaid,
        deliveryStatus: updatedOrder.deliveryStatus,
      },
    });

  } catch (error) {
    console.error('[API] Error collecting payment:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to collect payment',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
