/**
 * ORDER TRACKING API
 * 
 * Real-time tracking for customers
 * - Order status and progress
 * - Delivery partner information
 * - Delivery address
 * 
 * GET /api/customers/orders/{orderId}/track
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;
    if (!orderId) {
      return Response.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Fetch order with tracking details
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        userId 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        address: {
          select: {
            address: true,
            area: true,
            city: true,
            state: true,
            pin: true,
            phone: true,
          },
        },
        deliveryPartner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            averageRating: true,
            photoUrl: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate progress based on OrderStatus enum
    const progressMap = {
      ORDER_PLACED: 25,
      PROCESSING: 50,
      SHIPPED: 75,
      DELIVERED: 100,
      CANCELLED: 0,
    };

    const statusLabels = {
      ORDER_PLACED: 'Order Placed',
      PROCESSING: 'Processing',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
    };

    const deliveryStatusLabels = {
      ASSIGNED: 'Assigned to Delivery Partner',
      PICKED_UP: 'Picked Up',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      FAILED: 'Delivery Failed',
    };

    const progress = progressMap[order.status] || 0;

    // Build timeline
    const timeline = [];
    timeline.push({
      step: 'Order Placed',
      completed: true,
      date: order.createdAt,
      icon: '📋',
    });
    
    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      timeline.push({
        step: 'Processing',
        completed: true,
        date: order.createdAt,
        icon: '⏳',
      });
    }
    
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      timeline.push({
        step: 'Shipped',
        completed: true,
        date: order.deliveryStartedAt || order.createdAt,
        icon: '🚚',
      });
    }
    
    if (order.status === 'DELIVERED') {
      timeline.push({
        step: 'Delivered',
        completed: true,
        date: order.deliveryCompletedAt || order.updatedAt,
        icon: '✅',
      });
    }

    // If cancelled
    if (order.isCancelled) {
      timeline.push({
        step: 'Cancelled',
        completed: true,
        date: order.cancelledAt,
        icon: '❌',
        reason: order.cancellationReason,
      });
    }

    const tracking = {
      success: true,
      order: {
        id: order.id,
        status: order.status,
        statusLabel: statusLabels[order.status] || order.status,
        deliveryStatus: order.deliveryStatus,
        deliveryStatusLabel: order.deliveryStatus ? deliveryStatusLabels[order.deliveryStatus] : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        total: order.total,
        deliveryCharges: order.deliveryCharges,
        isCancelled: order.isCancelled,
        cancellationReason: order.cancellationReason,
      },

      progress: {
        percentage: progress,
        status: statusLabels[order.status] || order.status,
      },

      store: {
        id: order.store.id,
        name: order.store.name,
      },

      deliveryAddress: {
        name: order.address?.address || 'Unknown',
        area: order.address?.area,
        city: order.address?.city,
        state: order.address?.state,
        pin: order.address?.pin,
        phone: order.address?.phone,
        fullAddress: `${order.address?.address}, ${order.address?.area}, ${order.address?.city}, ${order.address?.state} ${order.address?.pin}`,
      },

      deliveryPartner: order.deliveryPartner
        ? {
            id: order.deliveryPartner.id,
            name: `${order.deliveryPartner.firstName} ${order.deliveryPartner.lastName}`,
            phone: order.deliveryPartner.phone,
            rating: order.deliveryPartner.averageRating,
            photo: order.deliveryPartner.photoUrl,
          }
        : null,

      items: order.orderItems.map((item) => ({
        quantity: item.quantity,
        name: item.product?.name,
        image: item.product?.images?.[0],
      })),

      timeline,
    };

    return Response.json(tracking, { status: 200 });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch tracking information',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
