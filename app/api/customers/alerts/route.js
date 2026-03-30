/**
 * CUSTOMER DELIVERY ALERTS & NOTIFICATIONS
 * 
 * Manage customer delivery alerts:
 * - GET: Fetch all unread/alert notifications
 * - PUT: Mark alerts as read
 * - PATCH: Update notification preferences
 * 
 * GET /api/customers/alerts
 * PUT /api/customers/alerts/{notificationId}/read
 * PATCH /api/customers/alerts/preferences
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/customers/alerts
 * Fetch customer alerts and notifications
 */
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'unread'; // unread, all
    const limit = parseInt(searchParams.get('limit') || '30');

    // Fetch notifications
    const where = {
      customerId: userId,
      ...(status === 'unread' && { isRead: false }),
    };

    const [notifications, unreadCount, preferences] = await Promise.all([
      prisma.customerNotification.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.customerNotification.count({
        where: { customerId: userId, isRead: false },
      }),
      prisma.customerNotificationPreference.findUnique({
        where: { customerId: userId },
      }),
    ]);

    // Format notifications
    const formatted = notifications.map((notif) => {
      const priorityEmoji = {
        CRITICAL: '🚨',
        HIGH: '⚠️',
        MEDIUM: 'ℹ️',
        LOW: '💬',
        INFO: '📢',
      };

      return {
        id: notif.id,
        type: notif.type,
        message: notif.message,
        description: notif.description,
        priority: notif.priority,
        priorityEmoji: priorityEmoji[notif.priority] || '📢',
        isRead: notif.isRead,
        isActionable: notif.actionUrl ? true : false,
        actionUrl: notif.actionUrl,
        actionLabel: notif.actionLabel,
        order: notif.order,
        metadata: notif.metadata,
        createdAt: notif.createdAt,
        readAt: notif.readAt,
      };
    });

    // Group by priority
    const grouped = {
      CRITICAL: formatted.filter((n) => n.priority === 'CRITICAL'),
      HIGH: formatted.filter((n) => n.priority === 'HIGH'),
      MEDIUM: formatted.filter((n) => n.priority === 'MEDIUM'),
      LOW: formatted.filter((n) => n.priority === 'LOW'),
      INFO: formatted.filter((n) => n.priority === 'INFO'),
    };

    return Response.json(
      {
        notifications: formatted,
        grouped,
        summary: {
          unreadCount,
          totalNotifications: notifications.length,
          criticalAlerts: grouped.CRITICAL.length,
          highPriority: grouped.HIGH.length,
        },
        preferences: preferences
          ? {
              channels: preferences.channels || ['IN_APP'],
              quietHours: preferences.quietHours,
              mutedOrderIds: preferences.mutedOrderIds || [],
              enableSOS: preferences.enableSOS !== false,
              enableDeliveryUpdates: preferences.enableDeliveryUpdates !== false,
              enableDelayAlerts: preferences.enableDelayAlerts !== false,
            }
          : {
              channels: ['IN_APP'],
              quietHours: null,
              mutedOrderIds: [],
              enableSOS: true,
              enableDeliveryUpdates: true,
              enableDelayAlerts: true,
            },
        actions: {
          markAllRead: `/api/customers/alerts/mark-all-read`,
          updatePreferences: `/api/customers/alerts/preferences`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Alerts Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to load alerts' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/alerts/{notificationId}/read
 * Mark notification as read
 */
export async function PUT(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return Response.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const notification = await prisma.customerNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return Response.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.customerId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Mark as read
    const updated = await prisma.customerNotification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return Response.json(
      {
        success: true,
        notification: {
          id: updated.id,
          isRead: updated.isRead,
          readAt: updated.readAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Mark Read Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/alerts/preferences
 * Update notification preferences
 */
export async function PATCH(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      channels,
      quietHours,
      enableSOS,
      enableDeliveryUpdates,
      enableDelayAlerts,
      muteOrderId,
      unmuteOrderId,
    } = body;

    // Get or create preferences
    let preferences = await prisma.customerNotificationPreference.findUnique({
      where: { customerId: userId },
    });

    if (!preferences) {
      preferences = await prisma.customerNotificationPreference.create({
        data: {
          customerId: userId,
          channels: channels || ['IN_APP'],
        },
      });
    }

    // Update preferences
    const updated = await prisma.customerNotificationPreference.update({
      where: { customerId: userId },
      data: {
        ...(channels && { channels }),
        ...(quietHours && { quietHours }),
        ...(enableSOS !== undefined && { enableSOS }),
        ...(enableDeliveryUpdates !== undefined && { enableDeliveryUpdates }),
        ...(enableDelayAlerts !== undefined && { enableDelayAlerts }),
        ...(muteOrderId && {
          mutedOrderIds: {
            push: muteOrderId,
          },
        }),
        ...(unmuteOrderId && {
          mutedOrderIds: {
            set: (preferences.mutedOrderIds || []).filter(
              (id) => id !== unmuteOrderId
            ),
          },
        }),
      },
    });

    return Response.json(
      {
        success: true,
        preferences: {
          channels: updated.channels,
          quietHours: updated.quietHours,
          enableSOS: updated.enableSOS,
          enableDeliveryUpdates: updated.enableDeliveryUpdates,
          enableDelayAlerts: updated.enableDelayAlerts,
          mutedOrderIds: updated.mutedOrderIds || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Preferences Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
