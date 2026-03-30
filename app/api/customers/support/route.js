/**
 * CUSTOMER SUPPORT & ISSUE REPORTING
 * 
 * Report issues and contact support:
 * - POST: Submit support ticket/issue
 * - GET: Fetch support tickets and conversations
 * - PUT: Update ticket status
 * - DELETE: Close ticket
 * 
 * POST /api/customers/orders/[orderId]/support
 * GET /api/customers/support/tickets
 * PUT /api/customers/support/tickets/[ticketId]
 * DELETE /api/customers/support/tickets/[ticketId]
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/customers/orders/{orderId}/support
 * Create support ticket for a delivery issue
 */
export async function POST(req, context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { orderId } = params;
    const body = await req.json();

    const {
      type, // MISSING_ITEMS, DAMAGED_ITEMS, INCORRECT_ITEMS, LATE_DELIVERY, QUALITY_ISSUE, OTHER
      subject,
      description,
      attachments,
    } = body;

    if (!type || !subject || !description) {
      return Response.json(
        { error: 'Type, subject, and description are required' },
        { status: 400 }
      );
    }

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: { name: true },
        },
      },
    });

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.customerId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        customerId: userId,
        orderId,
        type,
        subject,
        description,
        attachments: attachments || [],
        status: 'OPEN',
        priority: getPriorityFromType(type),
        metadata: {
          orderNumber: order.orderNumber,
          storeName: order.store.name,
          orderStatus: order.status,
        },
      },
    });

    // Create initial message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: userId,
        senderType: 'CUSTOMER',
        message: description,
        attachments: attachments || [],
      },
    });

    // Broadcast to support team (WebSocket/notification)
    // TODO: Implement in Phase 9 with team notifications

    return Response.json(
      {
        success: true,
        ticket: {
          id: ticket.id,
          ticketNumber: `SUP-${ticket.id.slice(0, 8).toUpperCase()}`,
          type,
          subject,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt,
          estimatedResolution: getEstimatedResolution(ticket.priority),
        },
        message: 'Support ticket created. Our team will respond shortly.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Support Ticket Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers/support/tickets
 * Fetch customer support tickets and conversations
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
    const status = searchParams.get('status') || 'all'; // open, closed, all
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      customerId: userId,
      ...(status !== 'all' && { status: status.toUpperCase() }),
    };

    const [tickets, openCount, closedCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              message: true,
              createdAt: true,
            },
          },
          order: {
            select: {
              orderId: true,
              orderNumber: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      prisma.supportTicket.count({
        where: { customerId: userId, status: 'OPEN' },
      }),
      prisma.supportTicket.count({
        where: { customerId: userId, status: 'CLOSED' },
      }),
    ]);

    const formatted = tickets.map((ticket) => {
      const priorityEmoji = {
        CRITICAL: '🚨',
        HIGH: '⚠️',
        MEDIUM: '📌',
        LOW: '💭',
      };

      return {
        id: ticket.id,
        ticketNumber: `SUP-${ticket.id.slice(0, 8).toUpperCase()}`,
        type: ticket.type,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        priorityEmoji: priorityEmoji[ticket.priority],
        orderId: ticket.orderId,
        orderNumber: ticket.order?.orderNumber,
        lastMessage: ticket.messages[0]
          ? {
              text: ticket.messages[0].message.substring(0, 100),
              timestamp: ticket.messages[0].createdAt,
            }
          : null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        timeElapsed: timeAgo(ticket.createdAt),
      };
    });

    return Response.json(
      {
        tickets: formatted,
        summary: {
          openTickets: openCount,
          closedTickets: closedCount,
          totalTickets: openCount + closedCount,
          averageResolutionTime: '2-4 hours',
        },
        filters: {
          status: ['open', 'closed', 'all'],
          currentStatus: status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Tickets Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to load support tickets' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/support/tickets/{ticketId}
 * Update ticket (add message or reopen)
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
    const ticketId = searchParams.get('id');
    const body = await req.json();

    const { message, attachments, action } = body; // action: ADD_MESSAGE, REOPEN

    if (!ticketId) {
      return Response.json(
        { error: 'Ticket ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return Response.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.customerId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (action === 'ADD_MESSAGE') {
      if (!message) {
        return Response.json(
          { error: 'Message required' },
          { status: 400 }
        );
      }

      const newMessage = await prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: userId,
          senderType: 'CUSTOMER',
          message,
          attachments: attachments || [],
        },
      });

      // Update ticket's updatedAt
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
      });

      return Response.json(
        {
          success: true,
          message: {
            id: newMessage.id,
            message: newMessage.message,
            createdAt: newMessage.createdAt,
          },
        },
        { status: 200 }
      );
    } else if (action === 'REOPEN') {
      // Can only reopen within 7 days of closure
      const closedAt = new Date(ticket.closedAt || ticket.updatedAt);
      const daysDiff = (new Date() - closedAt) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        return Response.json(
          { error: 'Cannot reopen ticket after 7 days' },
          { status: 400 }
        );
      }

      const reopened = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'OPEN',
          closedAt: null,
        },
      });

      return Response.json(
        {
          success: true,
          ticket: {
            id: reopened.id,
            status: reopened.status,
          },
        },
        { status: 200 }
      );
    }

    return Response.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Update Ticket Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/support/tickets/{ticketId}
 * Close support ticket
 */
export async function DELETE(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('id');

    if (!ticketId) {
      return Response.json(
        { error: 'Ticket ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return Response.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.customerId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Close ticket
    const closed = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return Response.json(
      {
        success: true,
        ticket: {
          id: closed.id,
          status: closed.status,
          closedAt: closed.closedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Close Ticket Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to close ticket' },
      { status: 500 }
    );
  }
}

// Helper functions
function getPriorityFromType(type) {
  const priorityMap = {
    MISSING_ITEMS: 'HIGH',
    DAMAGED_ITEMS: 'HIGH',
    INCORRECT_ITEMS: 'HIGH',
    LATE_DELIVERY: 'MEDIUM',
    QUALITY_ISSUE: 'MEDIUM',
    OTHER: 'LOW',
  };
  return priorityMap[type] || 'MEDIUM';
}

function getEstimatedResolution(priority) {
  const timeMap = {
    CRITICAL: '30 minutes',
    HIGH: '1 hour',
    MEDIUM: '2 hours',
    LOW: '4 hours',
  };
  return timeMap[priority] || '4 hours';
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}
