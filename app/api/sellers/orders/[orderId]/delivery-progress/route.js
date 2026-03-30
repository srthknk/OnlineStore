/**
 * GET /api/sellers/orders/[orderId]/delivery-progress
 * 
 * Track delivery progress of a single order
 * Shows current task status, partner info, and ETA
 * 
 * Response:
 * {
 *   orderId: "order_123",
 *   deliveryTask: {
 *     taskId: "task_789",
 *     status: "IN_TRANSIT",
 *     progress: 80%,
 *     partner: { name, phone, rating },
 *     eta: ISO datetime,
 *     createdAt, acceptedAt, arrivedAt, pickedUpAt
 *   },
 *   timeline: [
 *     { event: "ASSIGNED", timestamp, description },
 *     { event: "ACCEPTED", timestamp, description }
 *   ],
 *   nextAction: "Delivery expected soon"
 * }
 */

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { orderId } = params;

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Fetch order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                store: {
                    select: { userId: true },
                },
                deliveryTask: {
                    include: {
                        deliveryPartner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                                avgRating: true,
                                totalRatings: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify seller owns this order
        if (order.store.userId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // If no delivery task, order is pending assignment
        if (!order.deliveryTask) {
            return NextResponse.json({
                orderId,
                status: 'PENDING_ASSIGNMENT',
                message:
                    'Order is pending delivery partner assignment',
                expectedAssignmentTime: '5-10 minutes',
            });
        }

        const task = order.deliveryTask;

        // Calculate progress percentage
        const statusProgress = {
            PENDING: 0,
            ASSIGNED: 15,
            ACCEPTED: 30,
            ARRIVED: 50,
            PICKED_UP: 70,
            IN_TRANSIT: 85,
            DELIVERED: 100,
            FAILED: 0,
        };

        const progress = statusProgress[task.status] || 0;

        // Build timeline
        const timeline = [];

        if (task.createdAt) {
            timeline.push({
                event: 'ASSIGNMENT_REQUESTED',
                timestamp: task.createdAt,
                description: 'Delivery partner search initiated',
            });
        }

        if (task.assignedAt) {
            timeline.push({
                event: 'ASSIGNED',
                timestamp: task.assignedAt,
                description: `Assigned to ${task.deliveryPartner?.firstName}`,
            });
        }

        if (task.acceptedAt) {
            timeline.push({
                event: 'ACCEPTED',
                timestamp: task.acceptedAt,
                description: 'Partner accepted the delivery',
            });
        }

        if (task.arrivedAt) {
            timeline.push({
                event: 'ARRIVED_AT_STORE',
                timestamp: task.arrivedAt,
                description: 'Partner arrived at store for pickup',
            });
        }

        if (task.pickedUpAt) {
            timeline.push({
                event: 'PICKED_UP',
                timestamp: task.pickedUpAt,
                description: 'Order picked up from store',
            });
        }

        if (task.deliveredAt) {
            timeline.push({
                event: 'DELIVERED',
                timestamp: task.deliveredAt,
                description: 'Order delivered to customer',
            });
        }

        if (task.failureReason) {
            timeline.push({
                event: 'DELIVERY_FAILED',
                timestamp: task.failedAt || new Date(),
                description: `Delivery failed: ${task.failureReason}`,
            });
        }

        // Determine next action
        let nextAction = 'Delivery in progress';
        if (task.status === 'ASSIGNED') {
            nextAction = 'Waiting for partner acceptance';
        } else if (task.status === 'ACCEPTED') {
            nextAction = 'Partner on the way to store';
        } else if (task.status === 'ARRIVED') {
            nextAction = 'Partner picking up order';
        } else if (task.status === 'PICKED_UP') {
            nextAction = 'Partner in transit to customer';
        } else if (task.status === 'IN_TRANSIT') {
            nextAction = 'Expected delivery soon';
        } else if (task.status === 'DELIVERED') {
            nextAction = 'Delivery complete!';
        }

        return NextResponse.json({
            orderId,
            deliveryTask: {
                taskId: task.id,
                status: task.status,
                progress,
                partner: {
                    id: task.deliveryPartner?.id,
                    name: `${task.deliveryPartner?.firstName} ${task.deliveryPartner?.lastName}`.trim(),
                    phone: task.deliveryPartner?.phone,
                    rating: task.deliveryPartner?.avgRating,
                    ratingCount: task.deliveryPartner?.totalRatings,
                },
                eta: task.estimatedDeliveryTime,
                timestamps: {
                    createdAt: task.createdAt,
                    assignedAt: task.assignedAt,
                    acceptedAt: task.acceptedAt,
                    arrivedAt: task.arrivedAt,
                    pickedUpAt: task.pickedUpAt,
                    deliveredAt: task.deliveredAt,
                },
            },
            timeline,
            nextAction,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Delivery progress error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch delivery progress' },
            { status: 500 }
        );
    }
}
