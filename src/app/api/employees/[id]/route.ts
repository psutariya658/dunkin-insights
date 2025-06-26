import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true, // to show something for anonymous users
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error(`Error fetching employee ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const position = formData.get('position') as string;
    const file = formData.get('image') as File | null;

    // Validate required fields
    if (!name || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current employee to check if we need to update image
    const currentEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    });

    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    let imageUrl = currentEmployee.imageUrl; // Keep existing image by default

    // Handle file upload if present
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        name,
        position,
        imageUrl,
      },
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 