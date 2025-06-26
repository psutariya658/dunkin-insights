const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'parths123@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic Glazed Donut',
        description: 'Our signature donut with a perfect sweet glaze',
        price: 1.99,
        category: 'Donuts',
        imageUrl: 'https://example.com/glazed-donut.jpg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Boston Kreme Donut',
        description: 'Filled with vanilla cream and topped with chocolate',
        price: 2.49,
        category: 'Donuts',
        imageUrl: 'https://example.com/boston-kreme.jpg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Iced Coffee',
        description: 'Freshly brewed coffee served over ice',
        price: 3.49,
        category: 'Beverages',
        imageUrl: 'https://example.com/iced-coffee.jpg',
      },
    }),
  ])

  // Create sample employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'John Smith',
        position: 'Barista',
        imageUrl: 'https://example.com/john.jpg',
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Sarah Johnson',
        position: 'Store Manager',
        imageUrl: 'https://example.com/sarah.jpg',
      },
    }),
  ])

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customer = await prisma.user.create({
    data: {
      name: 'Test Customer',
      email: 'customer@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  })

  // Create sample reviews
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Best donuts in town!',
        userId: customer.id,
        productId: products[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Great service!',
        userId: customer.id,
        employeeId: employees[0].id,
      },
    }),
  ])

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
