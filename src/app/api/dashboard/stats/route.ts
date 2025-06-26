import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalEmployees, totalProducts, totalReviews] = await Promise.all([
      prisma.employee.count(),
      prisma.product.count(),
      prisma.review.count({
        where: {
          comment: {
            not: null,
          },
        },
      }),
    ])

    return NextResponse.json({
      totalEmployees,
      totalProducts,
      totalReviews,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 