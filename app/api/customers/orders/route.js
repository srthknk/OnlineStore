/**
 * CUSTOMER MY ORDERS & DELIVERY HISTORY
 * 
 * Shows customer's all orders with delivery status
 * Includes: active deliveries, completed, cancelled
 * 
 * GET /api/customers/orders
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'all'; // all, active, completed, cancelled
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build status filter based on OrderStatus enum
    let statusFilter = {};
    if (tab === 'active') {
      statusFilter = {
        status: { in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED'] },
      };
    } else if (tab === 'completed') {
      statusFilter = { status: 'DELIVERED' };
    } else if (tab === 'cancelled') {
      statusFilter = { isCancelled: true };
    }

    // Fetch orders
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
          ...statusFilter,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          orderItems: {
            select: {
              productId: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
          deliveryPartner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              averageRating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({
        where: {
          userId,
          ...statusFilter,
        },
      }),
    ]);

    // Format orders for display
    const formattedOrders = orders.map((order) => {
      const statusMap = {
        ORDER_PLACED: { label: 'Order Placed', icon: '📋', progress: 10 },
        PROCESSING: { label: 'Processing', icon: '⏳', progress: 40 },
        SHIPPED: { label: 'Shipped', icon: '🚚', progress: 70 },
        DELIVERED: { label: 'Delivered', icon: '✅', progress: 100 },
      };

      const mapping = statusMap[order.status] || { label: order.status, icon: '📦', progress: 0 };
      
      const isDelivering = ['PROCESSING', 'SHIPPED'].includes(order.status);
      const canCancel = ['ORDER_PLACED', 'PROCESSING'].includes(order.status) && !order.isCancelled;
      const canRate = order.status === 'DELIVERED' && !order.isCancelled;

      return {
        id: order.id,
        status: order.status,
        statusLabel: mapping.label,
        statusIcon: mapping.icon,
        progress: mapping.progress,
        isDelivering,

        store: {
          id: order.storeId,
          name: order.store?.name || 'Unknown Store',
        },

        items: {
          count: order.orderItems.length,
          list: order.orderItems.map((item) => ({
            productId: item.productId,
            name: item.product?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price,
            image: item.product?.images?.[0] || '',
          })),
        },

        delivery: order.deliveryPartner && order.deliveryStatus
          ? {
              partnerId: order.deliveryPartner.id,
              partnerName: `${order.deliveryPartner.firstName} ${order.deliveryPartner.lastName}`,
              partnerRating: order.deliveryPartner.averageRating || 5.0,
              status: order.deliveryStatus,
              startedAt: order.deliveryStartedAt,
              completedAt: order.deliveryCompletedAt,
            }
          : null,

        amount: {
          total: order.total,
          deliveryCharges: order.deliveryCharges,
          currency: 'INR',
        },

        timeline: {
          ordered: order.createdAt,
          updated: order.updatedAt,
          deliveryStarted: order.deliveryStartedAt,
          deliveryCompleted: order.deliveryCompletedAt,
        },

        actions: {
          track: {
            available: isDelivering || order.deliveryStatus,
            url: `/track/${order.id}`,
            label: 'Track',
          },
          rate: {
            available: canRate,
            url: `/rate/${order.id}`,
            label: 'Rate Delivery',
          },
          cancel: {
            available: canCancel,
            url: `/api/customers/orders/${order.id}/cancel`,
            label: 'Cancel Order',
          },
          reorder: {
            available: order.status === 'DELIVERED',
            url: `/reorder/${order.id}`,
            label: 'Reorder',
          },
        },
      };
    });

    // Get summary stats
    const [activeCount, completedCount] = await Promise.all([
      prisma.order.count({
        where: {
          userId,
          status: { in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED'] },
          isCancelled: false,
        },
      }),
      prisma.order.count({
        where: {
          userId,
          status: 'DELIVERED',
        },
      }),
    ]);

    return Response.json(
      {
        success: true,
        orders: formattedOrders,
        stats: {
          total,
          active: activeCount,
          completed: completedCount,
          cancelled: total - activeCount - completedCount,
        },
        pagination: {
          total,
          limit,
          offset,
          page: Math.floor(offset / limit) + 1,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return Response.json(
      {
        error: 'Failed to fetch orders',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
