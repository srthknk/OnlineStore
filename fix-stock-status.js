const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔍 Checking grocery products stock status...\n');
    
    // Check current status
    const products = await prisma.product.findMany({
      where: {
        store: { name: 'Fresh Grocery Store' }
      },
      select: {
        id: true,
        name: true,
        inStock: true,
        category: true
      },
      orderBy: { category: 'asc' }
    });

    console.log(`Total grocery products: ${products.length}\n`);
    
    const outOfStock = products.filter(p => !p.inStock).length;
    const inStock = products.filter(p => p.inStock).length;
    
    console.log(`✅ In Stock: ${inStock}`);
    console.log(`❌ Out of Stock: ${outOfStock}\n`);

    if (outOfStock > 0) {
      console.log('🔄 Updating all products to IN STOCK...\n');
      
      const updated = await prisma.product.updateMany({
        where: {
          store: { name: 'Fresh Grocery Store' }
        },
        data: {
          inStock: true
        }
      });

      console.log(`✅ Updated ${updated.count} products to IN STOCK!\n`);
      
      // Verify update
      const updated_products = await prisma.product.findMany({
        where: {
          store: { name: 'Fresh Grocery Store' }
        },
        select: { name: true, inStock: true }
      });

      console.log('Updated products:');
      updated_products.forEach(p => {
        console.log(`  ${p.inStock ? '✅' : '❌'} ${p.name}`);
      });
    } else {
      console.log('✅ All products are already IN STOCK!\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
