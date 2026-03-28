import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('🔍 Testing Prisma connection and Alert model...\n');
        
        // Test 1: Check database connection
        console.log('1️⃣ Testing database connection...');
        const result = await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection works!\n');
        
        // Test 2: Check if Alert table exists
        console.log('2️⃣ Checking Alert table existence...');
        const alerts = await prisma.alert.findMany({ take: 1 });
        console.log('✅ Alert table exists and is readable!\n');
        
        // Test 3: Create a test alert
        console.log('3️⃣ Creating a test alert...');
        const testAlert = await prisma.alert.create({
            data: {
                title: 'Test Alert from Prisma Direct',
                message: 'This is a test from direct Prisma client',
                type: 'INFO',
                bgColor: 'from-blue-600 to-cyan-600',
                textColor: 'text-white',
                icon: '🧪',
                priority: 10,
                isActive: true,
                createdBy: 'test-user'
            }
        });
        console.log('✅ Test alert created:', testAlert.id, '\n');
        
        // Test 4: Fetch all alerts
        console.log('4️⃣ Fetching all alerts...');
        const allAlerts = await prisma.alert.findMany({
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        console.log(`✅ Successfully fetched ${allAlerts.length} alert(s)\n`);
        
        allAlerts.forEach(alert => {
            console.log(`   - ${alert.title} (Priority: ${alert.priority}, Active: ${alert.isActive})`);
        });
        
        console.log('\n✨ All Prisma tests passed! Database is working correctly.');
        
    } catch (error) {
        console.error('❌ Error:');
        console.error('   Name:', error.name);
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('\nFull error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
