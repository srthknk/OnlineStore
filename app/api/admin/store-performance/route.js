import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get Store Performance Data for Admin (sales, cancelled orders, revenue, stock)
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        // Get storeId from query parameters
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        if (!storeId) {
            return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
        }

        // Verify store exists
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Get all orders for this store (include cancelled)
        const allOrders = await prisma.order.findMany({
            where: { storeId },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Calculate performance metrics
        let totalOrders = 0;
        let cancelledOrders = 0;
        let totalRevenue = 0;
        let cancelledRevenue = 0;
        let totalItemsSold = 0;

        allOrders.forEach(order => {
            if (order.isCancelled) {
                cancelledOrders += 1;
                cancelledRevenue += order.total;
            } else {
                totalOrders += 1;
                totalRevenue += order.total;
            }

            // Count items sold
            order.orderItems.forEach(item => {
                if (!order.isCancelled) {
                    totalItemsSold += item.quantity;
                }
            });
        });

        // Get store products and stock information
        const products = await prisma.product.findMany({
            where: { storeId },
            include: {
                productVariants: true
            }
        });

        let totalStock = 0;
        let outOfStock = 0;
        let lowStock = 0; // Less than 10 units

        products.forEach(product => {
            if (product.productVariants && product.productVariants.length > 0) {
                // For variant products, sum up available units
                product.productVariants.forEach(variant => {
                    totalStock += variant.availableUnits || 0;
                    if (variant.availableUnits === 0) {
                        outOfStock += 1;
                    } else if (variant.availableUnits < 10) {
                        lowStock += 1;
                    }
                });
            } else {
                // For regular products
                totalStock += product.totalUnits || 0;
                if ((product.totalUnits || 0) === 0) {
                    outOfStock += 1;
                } else if ((product.totalUnits || 0) < 10) {
                    lowStock += 1;
                }
            }
        });

        // Get top performing products
        const productSales = {};
        allOrders.forEach(order => {
            if (!order.isCancelled) {
                order.orderItems.forEach(item => {
                    if (!productSales[item.product.name]) {
                        productSales[item.product.name] = {
                            name: item.product.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.product.name].quantity += item.quantity;
                    productSales[item.product.name].revenue += item.price * item.quantity;
                });
            }
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const performanceData = {
            store: {
                id: store.id,
                name: store.name,
                username: store.username
            },
            sales: {
                totalOrders,
                totalItemsSold,
                completedOrders: totalOrders
            },
            cancellations: {
                cancelledOrders,
                cancelledPercentage: totalOrders > 0 ? ((cancelledOrders / (totalOrders + cancelledOrders)) * 100).toFixed(2) : 0
            },
            revenue: {
                totalRevenue: totalRevenue.toFixed(2),
                cancelledRevenue: cancelledRevenue.toFixed(2),
                averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
            },
            inventory: {
                totalProducts: products.length,
                totalUnits: totalStock,
                outOfStock,
                lowStock,
                inStock: products.length - outOfStock
            },
            topProducts
        };

        return NextResponse.json({ success: true, data: performanceData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}
