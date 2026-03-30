import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/orders/unassigned
 * Get all unassigned orders waiting for delivery partner assignment (admin only)
 */
export async function GET(req) {
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

    // Get unassigned orders that are shipped but not assigned to delivery partner
    const unassignedOrders = await prisma.order.findMany({
      where: {
        status: 'SHIPPED',
        deliveryPartnerId: null,
        isCancelled: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        address: true,
        store: {
          select: {
            id: true,
            name: true,
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const formattedOrders = unassignedOrders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      buyerName: order.user.name,
      buyerEmail: order.user.email,
      deliveryAddress: order.address?.address || 'N/A',
      totalAmount: order.total,
      deliveryCharges: order.deliveryCharges,
      createdAt: order.createdAt,
      itemCount: order.orderItems.length,
      store: order.store,
    }));

    return Response.json(
      {
        orders: formattedOrders,
        total: formattedOrders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching unassigned orders:', error);
    return Response.json(
      { message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}
