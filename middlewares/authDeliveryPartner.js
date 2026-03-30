import prisma from '@/lib/prisma';

/**
 * Authentication middleware for Delivery Partners
 * Verifies that the user has an active DeliveryPartner account
 * Returns partnerId if authenticated, false otherwise
 */
const authDeliveryPartner = async (userId) => {
    try {
        if (!userId) {
            return false;
        }

        // Find delivery partner by userId
        const partner = await prisma.deliveryPartner.findUnique({
            where: { userId },
            select: {
                id: true,
                userId: true,
                isActive: true,
                isApproved: true,
                status: true,
            },
        });

        if (!partner) {
            return false;
        }

        // Check if partner is approved and active
        if (partner.isApproved && partner.isActive) {
            return partner.id;
        }

        return false;
    } catch (error) {
        console.error('[authDeliveryPartner] Error:', error.message);
        return false;
    }
};

export default authDeliveryPartner;
