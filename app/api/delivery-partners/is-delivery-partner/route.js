import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/delivery-partners/is-delivery-partner
 * Check if the current user is a delivery partner
 * Returns { isDeliveryPartner: boolean, deliveryPartnerId: string | null, status: string }
 */
export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { 
          isDeliveryPartner: false, 
          deliveryPartnerId: null,
          status: null
        },
        { status: 200 }
      );
    }

    // Check if user has delivery partner profile
    const deliveryPartner = await prisma.deliveryPartner.findUnique({
      where: { userId },
      include: {
        selectedStore: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!deliveryPartner) {
      return Response.json(
        { 
          isDeliveryPartner: false, 
          deliveryPartnerId: null,
          status: null
        },
        { status: 200 }
      );
    }

    // Return delivery partner info - checking if APPROVED status
    const isApproved = deliveryPartner.status === 'APPROVED' || 
                       deliveryPartner.status === 'ACTIVE';

    return Response.json(
      {
        isDeliveryPartner: isApproved,
        deliveryPartnerId: deliveryPartner.id,
        status: deliveryPartner.status,
        firstName: deliveryPartner.firstName,
        lastName: deliveryPartner.lastName,
        selectedStore: deliveryPartner.selectedStore,
        totalDeliveries: deliveryPartner.totalDeliveries,
        successfulDeliveries: deliveryPartner.successfulDeliveries,
        averageRating: deliveryPartner.averageRating
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking delivery partner status:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
