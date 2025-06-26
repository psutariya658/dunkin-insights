import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs';
import path from 'path';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Get current product to check if we need to update image
    const currentProduct = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let name: string;
    let description: string;
    let price: number;
    let category: string;
    let imageUrl = currentProduct.imageUrl; // Keep existing image by default

    if (contentType?.includes('application/json')) {
      // Handle JSON request (image URL)
      const body = await request.json();
      name = body.name;
      description = body.description;
      price = body.price;
      category = body.category;
      imageUrl = body.imageUrl || currentProduct.imageUrl;
    } else {
      // Handle FormData request (image upload)
      const formData = await request.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      price = parseFloat(formData.get('price') as string);
      category = formData.get('category') as string;
      const file = formData.get('image') as File | null;

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
    }

    // Validate required fields
    if (!name || !description || !category || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 