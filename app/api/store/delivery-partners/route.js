import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/store/delivery-partners
 * Get all delivery partners assigned to this store
 */
export async function GET(req) {
  try {
    console.log('[API] Fetching delivery partners...');
    
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

    // Get all approved delivery partners for this store
    console.log('[API] Fetching delivery partners for storeId:', store.id);
    
    const deliveryPartners = await prisma.deliveryPartner.findMany({
      where: {
        selectedStoreId: store.id,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[API] Found delivery partners:', deliveryPartners.length);

    // Format partners for frontend
    const formattedPartners = deliveryPartners.map(partner => ({
      id: partner.id,
      name: `${partner.firstName} ${partner.lastName}`,
      firstName: partner.firstName,
      lastName: partner.lastName,
      email: partner.email,
      phone: partner.phone,
      photo: partner.photoUrl,
      status: partner.status,
      stats: {
        totalDeliveries: partner.totalDeliveries || 0,
        successfulDeliveries: partner.successfulDeliveries || 0,
        rating: partner.averageRating || 5.0,
      },
      address: partner.address,
    }));

    console.log('[API] Returning formatted partners');

    return Response.json({
      success: true,
      deliveryPartners: formattedPartners,
      total: formattedPartners.length,
    });

  } catch (error) {
    console.error('[API] Error fetching delivery partners:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to fetch delivery partners',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
