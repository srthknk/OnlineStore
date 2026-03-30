/**
 * CUSTOMER DELIVERY RATING & REVIEW
 * 
 * Rate delivery partner and delivery experience:
 * - POST: Submit delivery rating and review
 * - GET: Fetch existing rating
 * - PUT: Update rating
 * 
 * POST /api/customers/orders/[orderId]/rate
 * GET /api/customers/orders/[orderId]/rate
 * PUT /api/customers/orders/[orderId]/rate
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/customers/orders/{orderId}/rate
 * Fetch existing rating or form to submit new one
 */
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

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryRating: true,
        deliveryTask: {
          include: {
            deliveryPartner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rating: true,
                phoneNumber: true,
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

    if (order.customerId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if order is delivered
    if (order.status !== 'DELIVERED') {
      return Response.json(
        { error: 'Order not yet delivered' },
        { status: 400 }
      );
    }

    // Return existing rating or form
    return Response.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        delivered: true,
        existingRating: order.deliveryRating
          ? {
              id: order.deliveryRating.id,
              rating: order.deliveryRating.rating,
              comment: order.deliveryRating.comment,
              cleanliness: order.deliveryRating.metadata?.cleanliness || 0,
              behavior: order.deliveryRating.metadata?.behavior || 0,
              punctuality: order.deliveryRating.metadata?.punctuality || 0,
              packaging: order.deliveryRating.metadata?.packaging || 0,
              canModify: false,
            }
          : null,
        ratingForm: {
          partnerName: `${order.deliveryTask?.deliveryPartner?.firstName} ${order.deliveryTask?.deliveryPartner?.lastName}`,
          partnerRating: order.deliveryTask?.deliveryPartner?.rating,
          categories: [
            {
              name: 'Overall Experience',
              field: 'rating',
              type: 'star',
              scale: 5,
              required: true,
            },
            {
              name: 'Cleanliness & Presentation',
              field: 'cleanliness',
              type: 'star',
              scale: 5,
              hint: 'Was the delivery package clean and presentable?',
            },
            {
              name: 'Partner Behavior',
              field: 'behavior',
              type: 'star',
              scale: 5,
              hint: 'Was the partner courteous and professional?',
            },
            {
              name: 'Punctuality',
              field: 'punctuality',
              type: 'star',
              scale: 5,
              hint: 'Was the delivery on time?',
            },
            {
              name: 'Product Packaging',
              field: 'packaging',
              type: 'star',
              scale: 5,
              hint: 'Were items properly packed?',
            },
          ],
          comment: {
            label: 'Your Feedback (Optional)',
            placeholder: 'Share your delivery experience...',
            maxLength: 500,
          },
          issues: [
            { value: 'DAMAGED_ITEMS', label: 'Damaged items received' },
            { value: 'INCORRECT_ITEMS', label: 'Incorrect items' },
            { value: 'MISSING_ITEMS', label: 'Missing items' },
            { value: 'LATE_DELIVERY', label: 'Delivery was late' },
            { value: 'RUDE_BEHAVIOR', label: 'Rude behavior' },
            { value: 'OTHER', label: 'Other issue' },
          ],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Rating Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to load rating form' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers/orders/{orderId}/rate
 * Submit delivery rating and review
 */
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;
    const body = await req.json();

    const {
      rating,
      comment,
      cleanliness,
      behavior,
      punctuality,
      packaging,
      issues,
    } = body;

    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify order ownership and status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryRating: true,
        deliveryTask: {
          select: { deliveryPartnerId: true },
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

    if (order.status !== 'DELIVERED') {
      return Response.json(
        { error: 'Order not yet delivered' },
        { status: 400 }
      );
    }

    if (order.deliveryRating) {
      return Response.json(
        { error: 'Rating already submitted for this order' },
        { status: 400 }
      );
    }

    // Create rating
    const deliveryRating = await prisma.deliveryRating.create({
      data: {
        orderId,
        rating,
        comment: comment || null,
        metadata: {
          cleanliness: cleanliness || 0,
          behavior: behavior || 0,
          punctuality: punctuality || 0,
          packaging: packaging || 0,
          issues: issues || [],
        },
      },
    });

    // Update delivery partner overall rating (average)
    if (order.deliveryTask?.deliveryPartnerId) {
      const ratings = await prisma.deliveryRating.findMany({
        where: {
          deliveryTask: {
            deliveryPartnerId: order.deliveryTask.deliveryPartnerId,
          },
        },
      });

      if (ratings.length > 0) {
        const avgRating =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        await prisma.deliveryPartner.update({
          where: { id: order.deliveryTask.deliveryPartnerId },
          data: {
            rating: Math.round(avgRating * 10) / 10,
          },
        });
      }
    }

    return Response.json(
      {
        success: true,
        rating: {
          id: deliveryRating.id,
          rating: deliveryRating.rating,
          comment: deliveryRating.comment,
          submittedAt: deliveryRating.createdAt,
        },
        message: 'Thank you for your feedback!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Submit Rating Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/orders/{orderId}/rate
 * Update existing rating
 */
export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { orderId } = params;
    const body = await req.json();

    const { rating, comment, cleanliness, behavior, punctuality, packaging } =
      body;

    // Verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryRating: true,
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

    if (!order.deliveryRating) {
      return Response.json(
        { error: 'No rating found for this order' },
        { status: 404 }
      );
    }

    // Disallow updates after 24 hours
    const createdAt = new Date(order.deliveryRating.createdAt);
    const hoursDiff = (new Date() - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return Response.json(
        { error: 'Cannot update rating after 24 hours' },
        { status: 400 }
      );
    }

    // Update rating
    const updated = await prisma.deliveryRating.update({
      where: { id: order.deliveryRating.id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
        ...(cleanliness !== undefined || behavior !== undefined || punctuality !== undefined || packaging !== undefined) && {
          metadata: {
            ...order.deliveryRating.metadata,
            ...(cleanliness !== undefined && { cleanliness }),
            ...(behavior !== undefined && { behavior }),
            ...(punctuality !== undefined && { punctuality }),
            ...(packaging !== undefined && { packaging }),
          },
        },
      },
    });

    return Response.json(
      {
        success: true,
        rating: {
          id: updated.id,
          rating: updated.rating,
          comment: updated.comment,
          updatedAt: updated.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Update Rating Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to update rating' },
      { status: 500 }
    );
  }
}
