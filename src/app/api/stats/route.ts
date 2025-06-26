import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all reviews to calculate statistics
    const reviews = await prisma.review.findMany({
      select: {
        rating: true,
        comment: true,
        userId: true,
      },
    })

    // Calculate total unique customers (based on unique userIds)
    const uniqueCustomers = new Set(reviews.map(review => review.userId)).size

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Calculate recommendation percentage (ratings 4-5 are considered recommendations)
    const recommendedReviews = reviews.filter(review => review.rating >= 4).length
    const recommendationPercentage = reviews.length > 0 
      ? Math.round((recommendedReviews / reviews.length) * 100) 
      : 0

    // Get total reviews count
    const totalReviews = reviews.length

    return NextResponse.json({
      happyCustomers: uniqueCustomers,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      wouldRecommend: recommendationPercentage,
      totalReviews,
    })
  } catch (error) {
    console.error('Error fetching main page stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 