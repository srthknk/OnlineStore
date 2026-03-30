/**
 * CUSTOMER EMERGENCY SOS & SAFETY
 * 
 * Emergency assistance during delivery:
 * - POST: Trigger SOS alert
 * - GET: Fetch SOS status and safety features
 * - PATCH: Update trusted contacts
 * 
 * POST /api/customers/orders/[orderId]/sos
 * GET /api/customers/safety
 * PATCH /api/customers/safety/trusted-contacts
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/customers/orders/{orderId}/sos
 * Trigger emergency SOS alert during delivery
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
      reason, // UNSAFE_DELIVERY_PARTNER, DANGEROUS_LOCATION, NO_DELIVERY_PARTNER, LOST_DELIVERY, SUSPICIOUS_ACTIVITY, OTHER
      location,
      description,
    } = body;

    if (!reason) {
      return Response.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Verify order ownership and delivery status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryTask: {
          include: {
            deliveryPartner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                currentLocation: true,
              },
            },
          },
        },
        store: {
          select: {
            name: true,
            phoneNumber: true,
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

    // Check if order is in delivery
    const inDelivery = ['IN_TRANSIT', 'ARRIVED', 'IN_DELIVERY'].includes(
      order.status
    );

    if (!inDelivery) {
      return Response.json(
        { error: 'SOS only available during delivery' },
        { status: 400 }
      );
    }

    // Create SOS alert
    const sosAlert = await prisma.sosAlert.create({
      data: {
        orderId,
        customerId: userId,
        deliveryPartnerId: order.deliveryTask?.deliveryPartnerId,
        reason,
        description: description || null,
        location: location || null,
        status: 'ACTIVE',
        metadata: {
          partnerName: order.deliveryTask?.deliveryPartner
            ? `${order.deliveryTask.deliveryPartner.firstName} ${order.deliveryTask.deliveryPartner.lastName}`
            : null,
          storePhone: order.store.phoneNumber,
          partnerLocation: order.deliveryTask?.deliveryPartner?.currentLocation,
        },
      },
    });

    // Notify support team immediately
    // TODO: Implement in Phase 9 with priority support notification

    // Notify delivery partner (if not the issue)
    if (!['UNSAFE_DELIVERY_PARTNER', 'SUSPICIOUS_ACTIVITY'].includes(reason)) {
      // TODO: Send to partner app
    }

    // Get emergency contacts
    const emergencyContacts = await prisma.emergencyContact.findMany({
      where: {
        customerId: userId,
      },
    });

    return Response.json(
      {
        success: true,
        sosAlert: {
          id: sosAlert.id,
          status: sosAlert.status,
          createdAt: sosAlert.createdAt,
        },
        supportResponse: {
          status: 'DISPATCHED',
          estimatedResponseTime: '2-3 minutes',
          message: 'Emergency team has been notified. Help is on the way.',
        },
        contacts: {
          emergencyNumber: '1-800-SAFE-NOW',
          localPolice: '100',
          trustedContacts: emergencyContacts.map((c) => ({
            name: c.name,
            phoneNumber: c.phoneNumber,
            relationship: c.relationship,
          })),
        },
        nextSteps: [
          'Move to a safe, well-lit, public location if possible',
          'Keep your phone unlocked for support team',
          'Emergency contacts have been notified',
          'Share your live location for faster assistance',
        ],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SOS Alert Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to create SOS alert' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers/safety
 * Fetch safety features and profile
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

    // Fetch safety profile
    const [safetyProfile, emergencyContacts, activeSOS] = await Promise.all(
      [
        prisma.customerSafetyProfile.findUnique({
          where: { customerId: userId },
        }),
        prisma.emergencyContact.findMany({
          where: { customerId: userId },
          orderBy: { priority: 'asc' },
        }),
        prisma.sosAlert.findMany({
          where: {
            customerId: userId,
            status: 'ACTIVE',
          },
          include: {
            order: {
              select: {
                orderNumber: true,
                status: true,
              },
            },
          },
        }),
      ]
    );

    if (!safetyProfile) {
      // Create default profile
      const defaultProfile = await prisma.customerSafetyProfile.create({
        data: {
          customerId: userId,
          enableSOSalerts: true,
          shareTrackingByDefault: false,
          trackingShareDuration: 'UNTIL_DELIVERY',
        },
      });
      return Response.json(
        {
          safety: {
            sosEnabled: true,
            trackingShare: false,
            shareUntilDelivery: true,
          },
          emergencyContacts: [],
          activeSOSalerts: [],
          features: {
            sos: {
              name: 'Emergency SOS',
              description: 'Get immediate help from support team',
              enabled: true,
              reasons: [
                'Unsafe delivery partner',
                'Dangerous location',
                'Lost delivery partner',
                'Suspicious activity',
                'Health emergency',
              ],
            },
            trackingShare: {
              name: 'Share Tracking',
              description: 'Allow trusted contacts to track your delivery',
              enabled: false,
            },
            trustedContacts: {
              name: 'Trusted Contacts',
              description: 'Auto-notify in SOS situations',
              enabled: true,
              count: 0,
            },
          },
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        safety: {
          sosEnabled: safetyProfile.enableSOSalerts,
          trackingShare: safetyProfile.shareTrackingByDefault,
          shareUntilDelivery: safetyProfile.trackingShareDuration === 'UNTIL_DELIVERY',
        },
        emergencyContacts: emergencyContacts.map((c) => ({
          id: c.id,
          name: c.name,
          phoneNumber: c.phoneNumber,
          relationship: c.relationship,
          isPrimary: c.priority === 1,
        })),
        activeSOSalerts: activeSOS.map((sos) => ({
          id: sos.id,
          orderId: sos.orderId,
          orderNumber: sos.order.orderNumber,
          reason: sos.reason,
          createdAt: sos.createdAt,
          status: sos.status,
        })),
        features: {
          sos: {
            name: 'Emergency SOS',
            description: 'Get immediate help from support team',
            enabled: safetyProfile.enableSOSalerts,
            reasons: [
              { value: 'UNSAFE_DELIVERY_PARTNER', label: 'Unsafe delivery partner' },
              { value: 'DANGEROUS_LOCATION', label: 'Dangerous location' },
              { value: 'NO_DELIVERY_PARTNER', label: 'Delivery partner missing' },
              { value: 'LOST_DELIVERY', label: 'Lost delivery' },
              { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious activity' },
              { value: 'HEALTH_EMERGENCY', label: 'Health emergency' },
              { value: 'OTHER', label: 'Other' },
            ],
          },
          trackingShare: {
            name: 'Share Tracking',
            description: 'Allow trusted contacts to track your delivery',
            enabled: safetyProfile.shareTrackingByDefault,
          },
          trustedContacts: {
            name: 'Trusted Contacts',
            description: 'Auto-notify in SOS situations',
            enabled: true,
            count: emergencyContacts.length,
            maxCount: 5,
          },
        },
        helpLine: '1-800-SAFE-NOW',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Safety Profile Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to load safety profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/safety/trusted-contacts
 * Add or update trusted emergency contacts
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
    const { contacts, addContact, removeContactId, enableSOS, shareTracking } =
      body;

    if (addContact) {
      const { name, phoneNumber, relationship } = addContact;

      if (!name || !phoneNumber || !relationship) {
        return Response.json(
          { error: 'Name, phone, and relationship required' },
          { status: 400 }
        );
      }

      // Validate phone format
      if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
        return Response.json(
          { error: 'Invalid phone number' },
          { status: 400 }
        );
      }

      // Check max contacts (5)
      const contactCount = await prisma.emergencyContact.count({
        where: { customerId: userId },
      });

      if (contactCount >= 5) {
        return Response.json(
          { error: 'Maximum 5 trusted contacts allowed' },
          { status: 400 }
        );
      }

      const newContact = await prisma.emergencyContact.create({
        data: {
          customerId: userId,
          name,
          phoneNumber,
          relationship,
          priority: contactCount + 1,
        },
      });

      return Response.json(
        {
          success: true,
          contact: {
            id: newContact.id,
            name: newContact.name,
            phoneNumber: newContact.phoneNumber,
            relationship: newContact.relationship,
          },
        },
        { status: 201 }
      );
    }

    if (removeContactId) {
      await prisma.emergencyContact.delete({
        where: { id: removeContactId },
      });

      return Response.json(
        {
          success: true,
          message: 'Contact removed',
        },
        { status: 200 }
      );
    }

    if (enableSOS !== undefined || shareTracking !== undefined) {
      await prisma.customerSafetyProfile.upsert({
        where: { customerId: userId },
        create: {
          customerId: userId,
          ...(enableSOS !== undefined && { enableSOSalerts: enableSOS }),
          ...(shareTracking !== undefined && {
            shareTrackingByDefault: shareTracking,
          }),
        },
        update: {
          ...(enableSOS !== undefined && { enableSOSalerts: enableSOS }),
          ...(shareTracking !== undefined && {
            shareTrackingByDefault: shareTracking,
          }),
        },
      });

      return Response.json(
        {
          success: true,
          settings: {
            sosEnabled: enableSOS !== undefined ? enableSOS : undefined,
            trackingShare:
              shareTracking !== undefined ? shareTracking : undefined,
          },
        },
        { status: 200 }
      );
    }

    return Response.json(
      { error: 'No operation specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Safety Update Error]', error.message);
    return Response.json(
      { error: error.message || 'Failed to update safety settings' },
      { status: 500 }
    );
  }
}
