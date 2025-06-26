import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { employeeId, rating } = await request.json();

    // Validate input
    if (!employeeId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating data. Please provide a valid employee ID and rating (1-5).' },
        { status: 400 }
      );
    }

    // Get the current user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to submit a rating' },
        { status: 401 }
      );
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get or create the user based on session email
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || 'Anonymous',
      },
    });

    // Create new rating
    await prisma.review.create({
      data: {
        rating,
        employee: { connect: { id: employeeId } },
        user: { connect: { id: user.id } },
      },
    });

    // Calculate new average rating
    const reviews = await prisma.review.findMany({
      where: { employeeId },
      select: { rating: true },
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      newAverageRating: averageRating,
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Get the 10 most recent reviews
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      averageRating,
      totalRatings: reviews.length,
      recentRatings: reviews,
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
