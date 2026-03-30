import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/store/orders/unassigned
 * Get all unassigned orders for this store
 */
export async function GET(req) {
  try {
    console.log('[API] Fetching unassigned orders...');
    
    const { userId } = await auth();
    console.log('[API] User ID:', userId);
    
    if (!userId) {
      console.log('[API] No user ID found');
      return Response.json(
        { success: false, message: 'Unauthorized - no user found' },
        { status: 401 }
      );
    }

    // Get the store for this user
    console.log('[API] Looking for store with userId:', userId);
    const store = await prisma.store.findUnique({
      where: { userId },
    });

    console.log('[API] Store found:', { id: store?.id, status: store?.status });

    if (!store) {
      console.log('[API] No store found for user');
      return Response.json(
        { success: false, message: 'No store found for this user' },
        { status: 404 }
      );
    }

    if (store.status !== 'approved') {
      console.log('[API] Store not approved, status:', store.status);
      return Response.json(
        { success: false, message: `Store is not approved (status: ${store.status})` },
        { status: 403 }
      );
    }

    // Get unassigned orders
    console.log('[API] Fetching unassigned orders for storeId:', store.id);
    
    const orders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        deliveryPartnerId: null,
        isCancelled: false,
        status: { in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED'] },
      },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[API] Found orders:', orders.length);

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderId: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      total: order.total,
      deliveryCharges: order.deliveryCharges,
      createdAt: order.createdAt,
      customer: {
        name: order.user?.name || 'Unknown',
        email: order.user?.email || 'N/A',
        phone: order.address?.phone || 'N/A',
      },
      address: {
        full: `${order.address?.address || ''}, ${order.address?.area || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pin || ''}`,
        city: order.address?.city,
        state: order.address?.state,
      },
      items: {
        count: order.orderItems?.length || 0,
        list: (order.orderItems || []).map(item => ({
          name: item.product?.name || 'Unknown',
          quantity: item.quantity,
          price: item.price,
        })),
      },
    }));

    console.log('[API] Returning formatted orders');

    return Response.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length,
    });

  } catch (error) {
    console.error('[API] Error fetching orders:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to fetch unassigned orders',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
