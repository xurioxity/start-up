import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const seller = await prisma.user.upsert({
    where: { email: 'seller@demo.com' },
    update: {},
    create: {
      name: 'John Seller',
      email: 'seller@demo.com',
      password: null, // Demo account uses demo123
      role: 'SELLER'
    }
  })

  const manufacturer = await prisma.user.upsert({
    where: { email: 'manufacturer@demo.com' },
    update: {},
    create: {
      name: 'Mike Manufacturer',
      email: 'manufacturer@demo.com',
      password: null, // Demo account uses demo123
      role: 'MANUFACTURER'
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@demo.com',
      password: null, // Demo account uses demo123
      role: 'ADMIN'
    }
  })

  console.log('✅ Users created')

  // Create sample products
  const products = [
    {
      name: 'Custom Phone Case',
      description: 'Personalized phone case with your design',
      category: 'Electronics',
      material: 'PLA',
      price: 150
    },
    {
      name: 'Mechanical Gear',
      description: 'Precision mechanical gear for machinery',
      category: 'Mechanical Parts',
      material: 'ABS',
      price: 200
    },
    {
      name: 'Art Sculpture',
      description: 'Custom art sculpture based on your design',
      category: 'Art & Sculptures',
      material: 'PLA',
      price: 300
    },
    {
      name: 'Jewelry Ring',
      description: 'Custom 3D printed jewelry ring',
      category: 'Jewelry',
      material: 'PETG',
      price: 250
    },
    {
      name: 'Home Decor Vase',
      description: 'Decorative vase for home decoration',
      category: 'Home Decor',
      material: 'PLA',
      price: 180
    },
    {
      name: 'Prototype Housing',
      description: 'Prototype housing for electronic devices',
      category: 'Prototypes',
      material: 'ABS',
      price: 120
    }
  ]

for (const productData of products) {
  await prisma.product.create({
    data: productData
  })
}

  console.log('✅ Products created')

  // Create sample orders
  const product1 = await prisma.product.findFirst({ where: { name: 'Custom Phone Case' } })
  const product2 = await prisma.product.findFirst({ where: { name: 'Mechanical Gear' } })
  const product3 = await prisma.product.findFirst({ where: { name: 'Art Sculpture' } })

  if (product1 && product2 && product3) {
    // Create sample orders
    const order1 = await prisma.order.create({
      data: {
        userId: seller.id,
        status: 'PENDING',
        totalAmount: 300,
        notes: 'Please ensure high quality finish',
        orderItems: {
          create: {
            productId: product1.id,
            quantity: 2,
            price: 150,
            stlFile: 'phone_case_v2.stl',
            notes: 'Custom design for iPhone 14'
          }
        }
      }
    })

    const order2 = await prisma.order.create({
      data: {
        userId: seller.id,
        status: 'IN_PRODUCTION',
        totalAmount: 200,
        orderItems: {
          create: {
            productId: product2.id,
            quantity: 1,
            price: 200,
            stlFile: 'gear_assembly.stl'
          }
        }
      }
    })

    const order3 = await prisma.order.create({
      data: {
        userId: seller.id,
        status: 'DELIVERED',
        totalAmount: 300,
        orderItems: {
          create: {
            productId: product3.id,
            quantity: 1,
            price: 300,
            stlFile: 'sculpture_design.stl'
          }
        }
      }
    })

    // Create tracking entries
    await prisma.tracking.createMany({
      data: [
        {
          orderId: order1.id,
          status: 'Order Received',
          description: 'Your order has been received and is being reviewed'
        },
        {
          orderId: order2.id,
          status: 'Order Received',
          description: 'Your order has been received and is being reviewed'
        },
        {
          orderId: order2.id,
          status: 'In Production',
          description: 'Your order is now in production'
        },
        {
          orderId: order3.id,
          status: 'Order Received',
          description: 'Your order has been received and is being reviewed'
        },
        {
          orderId: order3.id,
          status: 'In Production',
          description: 'Your order is now in production'
        },
        {
          orderId: order3.id,
          status: 'Quality Check',
          description: 'Your order is undergoing quality check'
        },
        {
          orderId: order3.id,
          status: 'Shipped',
          description: 'Your order has been shipped'
        },
        {
          orderId: order3.id,
          status: 'Delivered',
          description: 'Your order has been delivered successfully'
        }
      ]
    })

    console.log('✅ Orders and tracking created')
  }

  console.log('🎉 Database seeded successfully!')
  console.log('\nDemo accounts created:')
  console.log('👤 Seller: seller@demo.com / demo123')
  console.log('🏭 Manufacturer: manufacturer@demo.com / demo123')
  console.log('👑 Admin: admin@demo.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
