import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * PUT /api/delivery-partners/orders/[orderId]/status
 * Update delivery status of an order
 */
export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = params.orderId;
    const { deliveryStatus } = await req.json();

    if (!deliveryStatus) {
      return Response.json(
        { message: 'Delivery status is required' },
        { status: 400 }
      );
    }

    // Get delivery partner info
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId },
    });

    if (!deliveryPartner) {
      return Response.json(
        { message: 'Delivery partner profile not found' },
        { status: 404 }
      );
    }

    // Get order and verify it's assigned to this delivery partner
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.deliveryPartnerId !== deliveryPartner.id) {
      return Response.json(
        { message: 'This order is not assigned to you' },
        { status: 403 }
      );
    }

    // Update order with new delivery status
    const updateData = {
      deliveryStatus,
    };

    // Set timestamps based on status
    if (deliveryStatus === 'PICKED_UP' && !order.deliveryStartedAt) {
      updateData.deliveryStartedAt = new Date();
    } else if (deliveryStatus === 'DELIVERED') {
      updateData.deliveryCompletedAt = new Date();
      // Update order status to DELIVERED
      updateData.status = 'DELIVERED';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: { name: true }
        },
        address: true,
      }
    });

    // If order is delivered, update delivery partner statistics
    if (deliveryStatus === 'DELIVERED') {
      await prisma.deliveryPartner.update({
        where: { id: deliveryPartner.id },
        data: {
          totalDeliveries: {
            increment: 1,
          },
          successfulDeliveries: {
            increment: 1,
          },
        },
      });
    }

    return Response.json(
      {
        message: 'Order status updated successfully',
        order: {
          id: updatedOrder.id,
          deliveryStatus: updatedOrder.deliveryStatus,
          status: updatedOrder.status,
          deliveryStartedAt: updatedOrder.deliveryStartedAt,
          deliveryCompletedAt: updatedOrder.deliveryCompletedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return Response.json(
      { message: 'Error updating order status' },
      { status: 500 }
    );
  }
}
