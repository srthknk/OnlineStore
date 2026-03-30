import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/orders/assign-delivery-partner
 * Assign order to a delivery partner (admin only)
 */
export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!adminUser) {
      return Response.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderId, deliveryPartnerId } = await req.json();

    if (!orderId || !deliveryPartnerId) {
      return Response.json(
        { message: 'Order ID and Delivery Partner ID are required' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify delivery partner exists and is approved
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { id: deliveryPartnerId },
    });

    if (!deliveryPartner) {
      return Response.json(
        { message: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    if (deliveryPartner.status !== 'APPROVED' && deliveryPartner.status !== 'ACTIVE') {
      return Response.json(
        { message: 'Delivery partner is not approved or active' },
        { status: 400 }
      );
    }

    // Assign order to delivery partner
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId,
        deliveryStatus: 'ASSIGNED',
      },
      include: {
        user: { select: { name: true } },
        deliveryPartner: { select: { firstName: true, lastName: true } },
      }
    });

    return Response.json(
      {
        message: 'Order assigned to delivery partner successfully',
        order: {
          id: updatedOrder.id,
          deliveryPartnerId: updatedOrder.deliveryPartnerId,
          deliveryStatus: updatedOrder.deliveryStatus,
          deliveryPartner: updatedOrder.deliveryPartner,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning order:', error);
    return Response.json(
      { message: 'Error assigning order' },
      { status: 500 }
    );
  }
}
