import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { active: true },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    })

    // Calculate average rating for each employee
    const employeesWithRating = employees.map(employee => {
      const ratings = employee.reviews.map(r => r.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      // Remove reviews from the response as we've calculated the average
      const { reviews, ...employeeData } = employee;
      
      return {
        ...employeeData,
        averageRating,
      };
    });

    return NextResponse.json(employeesWithRating)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const position = formData.get('position') as string;
    const file = formData.get('image') as File | null;

    let imageUrl = '';
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
      await fs.promises.writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    if (!name || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: { name, position, imageUrl },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.update({
      where: { id: data.id },
      data: {
        name: data.name,
        position: data.position,
        imageUrl: data.imageUrl,
        active: data.active,
      },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error updating employee:', error)
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
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    await prisma.employee.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
