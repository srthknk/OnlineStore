const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Load state/district data
const indiaStateDistricts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/indiaStateDistricts.json'), 'utf8')
);

const products = {
  'Grocery & Staples': [
    { name: 'Basmati Rice Premium', description: 'High-quality white basmati rice', mrp: 250, price: 199, category: 'Grocery & Staples', units: '1kg', images: ['https://images.unsplash.com/photo-1586985289688-cacf913bb4cb?w=500'], isOrganic: false, isVegan: true, manufacturer: 'Golden Basmati' },
    { name: 'Organic Turmeric Powder', description: 'Pure organic turmeric powder', mrp: 180, price: 149, category: 'Grocery & Staples', units: '500g', images: ['https://images.unsplash.com/photo-1596040299413-fa2626ef3dd0?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Organic Farms' },
    { name: 'Refined Sunflower Oil', description: 'Pure refined sunflower oil', mrp: 320, price: 259, category: 'Grocery & Staples', units: '1L', images: ['https://images.unsplash.com/photo-1587823014498-ab1eb70aee30?w=500'], isOrganic: false, isVegan: true, manufacturer: 'Pure Gold' },
    { name: 'Whole Wheat Flour', description: 'Natural whole wheat flour', mrp: 120, price: 89, category: 'Grocery & Staples', units: '1kg', images: ['https://images.unsplash.com/photo-1574080867398-a8d12ecbb6f9?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Wheat Mills Co' },
    { name: 'Chickpea Dal', description: 'Premium split chickpeas', mrp: 160, price: 129, category: 'Grocery & Staples', units: '500g', images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Dal Masters' }
  ],
  'Fruits & Vegetables': [
    { name: 'Fresh Tomatoes', description: 'Ripe, fresh red tomatoes', mrp: 80, price: 55, category: 'Fruits & Vegetables', units: '1kg', images: ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Local Farm' },
    { name: 'Organic Spinach', description: 'Fresh organic spinach leaves', mrp: 60, price: 42, category: 'Fruits & Vegetables', units: '500g', images: ['https://images.unsplash.com/photo-1597118212624-753a6238aff3?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Organic Greens' },
    { name: 'Carrots (Fresh)', description: 'Sweet orange carrots', mrp: 90, price: 65, category: 'Fruits & Vegetables', units: '1kg', images: ['https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Fresh Harvest' },
    { name: 'Bananas (Organic)', description: 'Yellow ripe organic bananas', mrp: 70, price: 49, category: 'Fruits & Vegetables', units: '1kg', images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Organic Orchards' },
    { name: 'Onions Red', description: 'Fresh red onions', mrp: 50, price: 35, category: 'Fruits & Vegetables', units: '1kg', images: ['https://images.unsplash.com/photo-1587049352032-92609ba28147?w=500'], isOrganic: false, isVegan: true, manufacturer: 'Farm Fresh' }
  ],
  'Dairy & Eggs': [
    { name: 'Cow Milk Fresh', description: 'Fresh pasteurized cow milk', mrp: 80, price: 65, category: 'Dairy & Eggs', units: '1L', images: ['https://images.unsplash.com/photo-1589985643521-14f7ceaa20b4?w=500'], isOrganic: false, isVegan: false, manufacturer: 'Dairy Fresh' },
    { name: 'Greek Yogurt', description: 'Creamy Greek yogurt', mrp: 120, price: 95, category: 'Dairy & Eggs', units: '500g', images: ['https://images.unsplash.com/photo-1488477181946-6e0b0a6ff033?w=500'], isOrganic: true, isVegan: false, manufacturer: 'Greek Creamery' },
    { name: 'Paneer', description: 'Fresh homemade paneer', mrp: 280, price: 229, category: 'Dairy & Eggs', units: '500g', images: ['https://images.unsplash.com/photo-1599599810688-51a35aac9507?w=500'], isOrganic: true, isVegan: false, manufacturer: 'Fresh Paneer House' },
    { name: 'Brown Eggs', description: 'Fresh organic brown eggs', mrp: 120, price: 95, category: 'Dairy & Eggs', units: '6 pieces', images: ['https://images.unsplash.com/photo-1585356395007-c5cf2a9f3c70?w=500'], isOrganic: true, isVegan: false, manufacturer: 'Organic Farms' },
    { name: 'Ghee', description: 'Pure ghee from cow milk', mrp: 450, price: 380, category: 'Dairy & Eggs', units: '500ml', images: ['https://images.unsplash.com/photo-1584980505006-121caf69a839?w=500'], isOrganic: true, isVegan: false, manufacturer: 'Pure Ghee Co' }
  ],
  'Beverages': [
    { name: 'Green Tea Premium', description: 'Pure organic green tea', mrp: 180, price: 145, category: 'Beverages', units: '100g', images: ['https://images.unsplash.com/photo-1597318286408-ddf0f0a5a609?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Tea Gardens' },
    { name: 'Assam Black Tea', description: 'Strong and bold Assam tea', mrp: 150, price: 119, category: 'Beverages', units: '100g', images: ['https://images.unsplash.com/photo-1599639957043-e6dab2e74b7b?w=500'], isOrganic: false, isVegan: true, manufacturer: 'Assam Tea Co' },
    { name: 'Instant Coffee', description: 'Pure instant coffee powder', mrp: 280, price: 229, category: 'Beverages', units: '200g', images: ['https://images.unsplash.com/photo-1559056169-641ef2588d5d?w=500'], isOrganic: false, isVegan: true, manufacturer: 'Coffee Blend' },
    { name: 'Organic Coffee Beans', description: 'Premium organic coffee beans', mrp: 450, price: 379, category: 'Beverages', units: '500g', images: ['https://images.unsplash.com/photo-1556742212-5b321f3c261d?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Premium Roasters' }
  ],
  'Snacks & Sweets': [
    { name: 'Masala Chips', description: 'Crispy masala flavored chips', mrp: 80, price: 59, category: 'Snacks & Sweets', units: '150g', images: ['https://images.unsplash.com/photo-1599599810694-f3ee39e00d94?w=500'], isOrganic: false, isVegan: true, manufacturer: 'Snack Masters' },
    { name: 'Whole Wheat Biscuits', description: 'Healthy whole wheat biscuits', mrp: 120, price: 89, category: 'Snacks & Sweets', units: '300g', images: ['https://images.unsplash.com/photo-1585707572537-92b9fa73d926?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Health Bakers' },
    { name: 'Mixed Dry Fruits', description: 'Premium mix of nuts and fruits', mrp: 450, price: 379, category: 'Snacks & Sweets', units: '500g', images: ['https://images.unsplash.com/photo-1585529271594-b16c3fbd1c3a?w=500'], isOrganic: true, isVegan: true, manufacturer: 'Dry Fruit House' },
    { name: 'Gulab Jamuns', description: 'Traditional Indian sweets', mrp: 200, price: 159, category: 'Snacks & Sweets', units: '400g', images: ['https://images.unsplash.com/photo-1585701572654-b5e14d302e1b?w=500'], isOrganic: false, isVegan: false, manufacturer: 'Sweet Delights' }
  ]
};

async function main() {
  try {
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Database cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const buyer = await prisma.user.create({
      data: {
        id: 'buyer_001',
        name: 'John Doe',
        email: 'buyer@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      },
    });

    const seller1 = await prisma.user.create({
      data: {
        id: 'seller_001',
        name: 'Sarah Store',
        email: 'seller@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    });

    const seller2 = await prisma.user.create({
      data: {
        id: 'seller_002',
        name: 'Mike Beverages',
        email: 'mike@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
    });
    console.log('✅ Created 3 users\n');

    // Create stores
    console.log('🏪 Creating stores...');
    const store1 = await prisma.store.create({
      data: {
        userId: seller1.id,
        name: "Sarah's Fresh Market",
        description: 'Fresh groceries, fruits, vegetables, and dairy',
        username: 'sarahs-market',
        address: 'Bangalore, Karnataka',
        status: 'approved',
        isActive: true,
        logo: 'https://images.unsplash.com/photo-1599599810694-f3ee39e00d94?w=200',
        email: 'seller@example.com',
        contact: '9876543210',
      },
    });

    const store2 = await prisma.store.create({
      data: {
        userId: seller2.id,
        name: "Mike's Beverages",
        description: 'Beverages, snacks, and sweets',
        username: 'mikes-beverages',
        address: 'Mumbai, Maharashtra',
        status: 'approved',
        isActive: true,
        logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
        email: 'mike@example.com',
        contact: '9876543211',
      },
    });
    console.log('✅ Created 2 stores\n');

    // Seed products
    console.log('📦 Seeding products...');
    let productCount = 0;

    for (const [category, items] of Object.entries(products)) {
      for (const product of items) {
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            mrp: product.mrp,
            price: product.price,
            category: product.category,
            units: product.units,
            images: product.images,
            isOrganic: product.isOrganic,
            isVegan: product.isVegan,
            manufacturer: product.manufacturer,
            storeId: category === 'Beverages' || category === 'Snacks & Sweets' ? store2.id : store1.id,
            inStock: true,
            totalUnits: Math.floor(Math.random() * 100) + 50,
          },
        });
        productCount++;
      }
    }
    console.log(`✅ Created ${productCount} products\n`);

    // Seed state/district data
    console.log('🗺️  Seeding state/district data...');
    let stateDistrictCount = 0;
    
    for (const stateData of indiaStateDistricts.states) {
      for (const district of stateData.districts) {
        await prisma.stateDistrict.upsert({
          where: {
            state_district: {
              state: stateData.state,
              district: district
            }
          },
          update: {},
          create: {
            state: stateData.state,
            district: district
          }
        });
        stateDistrictCount++;
      }
    }
    console.log(`✅ Seeded ${stateDistrictCount} state/district combinations\n`);

    // Create address
    console.log('📍 Creating address...');
    await prisma.address.create({
      data: {
        userId: buyer.id,
        name: 'John Doe',
        email: 'buyer@example.com',
        phone: '9876543210',
        house: '123, MG Road, Apt 501',
        area: 'Indiranagar, Bangalore',
        landmark: 'Near Cafe Coffee Day',
        city: 'Bangalore',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pin: '560001',
        country: 'India',
        addressType: 'Home',
        isDefault: true,
      },
    });
    console.log('✅ Created address\n');

    // Summary
    console.log('='.repeat(60));
    console.log('✨ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log('   ✓ Users: 3 (1 buyer, 2 sellers)');
    console.log('   ✓ Stores: 2 (active)');
    console.log(`   ✓ Products: ${productCount} items across categories`);
    console.log('   ✓ Addresses: 1\n');

    console.log('🔐 Demo Credentials:');
    console.log('   • Buyer: buyer@example.com');
    console.log('   • Seller 1: seller@example.com (Sarahs Fresh Market)');
    console.log('   • Seller 2: mike@example.com (Mikes Beverages)\n');

    console.log('📦 Product Distribution:');
    console.log('   • Store 1: Groceries, Fruits, Vegetables, Dairy');
    console.log('   • Store 2: Beverages, Snacks, Sweets\n');
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

