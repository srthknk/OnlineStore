import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/delivery-partners/assigned-orders
 * Get all orders assigned to the current delivery partner
 */
export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get delivery partner info
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId },
    });

    if (!deliveryPartner) {
      return Response.json(
        { success: false, message: 'Delivery partner profile not found' },
        { status: 404 }
      );
    }

    // Get all assigned orders
    const orders = await prisma.order.findMany({
      where: {
        deliveryPartnerId: deliveryPartner.id,
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
                price: true,
                images: true,
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      customer: {
        name: order.user?.name || 'Unknown',
        email: order.user?.email || 'N/A',
        phone: order.address?.phone || 'N/A',
      },
      address: {
        name: order.address?.name || 'N/A',
        house: order.address?.house || '',
        street: order.address?.address || order.address?.street || 'N/A',
        area: order.address?.area || 'N/A',
        city: order.address?.city || 'N/A',
        district: order.address?.district || '',
        state: order.address?.state || 'N/A',
        pin: order.address?.pin || '',
        zip: order.address?.zip || '',
        landmark: order.address?.landmark || '',
        country: order.address?.country || 'India',
        phone: order.address?.phone || 'N/A',
        full: `${order.address?.house || ''}, ${order.address?.area || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pin || ''}`,
      },
      delivery: {
        status: order.deliveryStatus || 'ASSIGNED',
        startedAt: order.deliveryStartedAt,
        completedAt: order.deliveryCompletedAt,
      },
      order: {
        status: order.status,
        total: order.total,
        deliveryCharges: order.deliveryCharges,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        createdAt: order.createdAt,
        items: order.orderItems.map(item => ({
          id: item.productId,
          name: item.product?.name || 'Unknown',
          quantity: item.quantity,
          price: item.price,
          image: item.product?.images?.[0] || '',
        })),
      },
      store: order.store,
    }));

    return Response.json({ 
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length,
    }, { status: 200 });

  } catch (error) {
    console.error('[API] Error fetching assigned orders:', error);
    return Response.json(
      { 
        success: false,
        message: 'Error fetching orders',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
