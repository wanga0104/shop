const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('开始插入示例商品...')

  const products = [
    {
      id: 'prod_1',
      name: 'Premium T-Shirt',
      description: 'High-quality cotton t-shirt with custom design',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      stock: 100,
      category: 'clothing',
    },
    {
      id: 'prod_2',
      name: 'Wireless Headphones',
      description: 'Noise-cancelling wireless headphones with 20h battery',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      stock: 50,
      category: 'electronics',
    },
    {
      id: 'prod_3',
      name: 'Canvas Backpack',
      description: 'Durable canvas backpack with laptop compartment',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      stock: 75,
      category: 'accessories',
    },
    {
      id: 'prod_4',
      name: 'Smart Watch',
      description: 'Fitness tracking smartwatch with heart rate monitor',
      price: 199.99,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      stock: 30,
      category: 'electronics',
    },
    {
      id: 'prod_5',
      name: 'Coffee Mug',
      description: 'Ceramic coffee mug with ergonomic handle',
      price: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
      stock: 200,
      category: 'home',
    },
    {
      id: 'prod_6',
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat with carrying strap',
      price: 34.99,
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
      stock: 60,
      category: 'sports',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    })
    console.log(`✓ ${product.name} 已插入`)
  }

  console.log('✅ 所有示例商品插入完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })