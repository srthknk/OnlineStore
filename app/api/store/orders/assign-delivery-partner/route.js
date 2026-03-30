import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/store/orders/assign-delivery-partner
 * Assign a delivery partner to an order
 */
export async function POST(req) {
  try {
    console.log('[API] Assigning delivery partner...');
    
    const { userId } = await auth();
    console.log('[API] User ID:', userId);
    
    if (!userId) {
      console.log('[API] No user ID');
      return Response.json(
        { success: false, message: 'Unauthorized - no user found' },
        { status: 401 }
      );
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: { userId },
    });

    console.log('[API] Store:', { id: store?.id, status: store?.status });

    if (!store) {
      console.log('[API] No store found');
      return Response.json(
        { success: false, message: 'No store found for this user' },
        { status: 404 }
      );
    }

    if (store.status !== 'approved') {
      console.log('[API] Store not approved');
      return Response.json(
        { success: false, message: 'Store is not approved' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { orderId, deliveryPartnerId } = body;

    console.log('[API] Request data:', { orderId, deliveryPartnerId });

    if (!orderId || !deliveryPartnerId) {
      console.log('[API] Missing required fields');
      return Response.json(
        { success: false, message: 'orderId and deliveryPartnerId are required' },
        { status: 400 }
      );
    }

    // Get and validate order
    console.log('[API] Fetching order:', orderId);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { deliveryPartner: true },
    });

    if (!order) {
      console.log('[API] Order not found');
      return Response.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('[API] Order found, storeId:', order.storeId, 'expected:', store.id);

    if (order.storeId !== store.id) {
      console.log('[API] Order does not belong to this store');
      return Response.json(
        { success: false, message: 'Order does not belong to your store' },
        { status: 403 }
      );
    }

    if (order.deliveryPartnerId) {
      console.log('[API] Order already has a delivery partner');
      return Response.json(
        { success: false, message: 'Order already assigned to a delivery partner' },
        { status: 400 }
      );
    }

    // Get and validate delivery partner
    console.log('[API] Fetching delivery partner:', deliveryPartnerId);
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { id: deliveryPartnerId },
    });

    if (!deliveryPartner) {
      console.log('[API] Delivery partner not found');
      return Response.json(
        { success: false, message: 'Delivery partner not found' },
        { status: 404 }
      );
    }

    console.log('[API] Partner found, selectedStoreId:', deliveryPartner.selectedStoreId, 'expected:', store.id);

    if (deliveryPartner.selectedStoreId !== store.id) {
      console.log('[API] Partner not assigned to this store');
      return Response.json(
        { success: false, message: 'Delivery partner is not assigned to your store' },
        { status: 403 }
      );
    }

    if (deliveryPartner.status !== 'APPROVED') {
      console.log('[API] Partner not approved, status:', deliveryPartner.status);
      return Response.json(
        { success: false, message: `Delivery partner is not approved (status: ${deliveryPartner.status})` },
        { status: 400 }
      );
    }

    // Assign delivery partner to order
    console.log('[API] Assigning partner to order...');
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId: deliveryPartner.id,
        deliveryStatus: 'ASSIGNED',
      },
    });

    console.log('[API] Successfully assigned partner');

    return Response.json({
      success: true,
      message: 'Delivery partner assigned successfully',
      order: {
        id: updatedOrder.id,
        deliveryPartnerId: updatedOrder.deliveryPartnerId,
        deliveryStatus: updatedOrder.deliveryStatus,
      },
    });

  } catch (error) {
    console.error('[API] Error assigning delivery partner:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to assign delivery partner',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
