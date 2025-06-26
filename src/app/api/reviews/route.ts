import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.userId || !data.rating || (!data.productId && !data.employeeId)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists, if not create a temporary user for anonymous reviews
    let user = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: data.userId,
            email: `${data.userId}@temp.com`,
            name: data.customerName || 'Anonymous Customer',
            role: 'CUSTOMER',
            password: 'temp-password', // Required field
            hashedPassword: 'temp-password', // This won't be used for login
          },
        })
      } catch (e) {
        // Ignore if user was created in a concurrent request
      }
    }

    // If review is for an employee, update their average rating
    if (data.employeeId) {
      const review = await prisma.$transaction(async (tx) => {
        const newReview = await tx.review.create({
          data: {
            rating: data.rating,
            comment: data.comment,
            customerName: data.customerName,
            userId: data.userId,
            employeeId: data.employeeId,
          },
        })

        const ratingAggregation = await tx.review.aggregate({
          _avg: { rating: true },
          _count: { rating: true },
          where: { employeeId: data.employeeId },
        })

        await tx.employee.update({
          where: { id: data.employeeId },
          data: {
            averageRating: ratingAggregation._avg.rating,
            reviewCount: ratingAggregation._count.rating,
          },
        })

        return newReview
      })

      const resultWithRelations = await prisma.review.findUnique({
        where: { id: review.id },
        include: {
          user: { select: { name: true } },
          employee: { select: { name: true } },
        },
      })

      return NextResponse.json(resultWithRelations)
    } else {
      // Handle product reviews
      const review = await prisma.review.create({
        data: {
          rating: data.rating,
          comment: data.comment,
          customerName: data.customerName,
          userId: data.userId,
          productId: data.productId,
        },
        include: {
          user: { select: { name: true } },
          product: { select: { name: true } },
        },
      })
      return NextResponse.json(review)
    }
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
