import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/delivery-partners/[id]/reject
 * Reject a delivery partner
 */
export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { rejectionReason } = await req.json();

    const deliveryPartner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'No reason provided',
      },
    });

    return Response.json(
      {
        message: 'Delivery partner rejected',
        deliveryPartner,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error rejecting delivery partner:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
