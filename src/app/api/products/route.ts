import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// GET all products with average rating
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const productsWithAvgRating = products.map(product => {
        const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
        const { reviews, ...productData } = product;
        return {
          ...productData,
          averageRating
        }
      });
  
      return NextResponse.json(productsWithAvgRating);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST a new product
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const file = formData.get('image') as File | null;

    if (!name || !category || !description || !price) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    let imageUrl = '';
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uploadPath = path.join(uploadsDir, filename);
      fs.writeFileSync(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        description,
        price: parseFloat(price),
        imageUrl,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// PUT (update) a product
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, category, description, price, imageUrl } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required for an update.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        description,
        price,
        imageUrl,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(request: Request) {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
  
      if (!id) {
        return NextResponse.json(
          { error: 'Product ID is required' },
          { status: 400 }
        )
      }
  
      const product = await prisma.product.findUnique({ where: { id } });
  
      if (product?.imageUrl) {
        const imagePath = path.join(process.cwd(), 'public', product.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await prisma.review.deleteMany({
        where: { productId: id },
      });
  
      await prisma.product.delete({
        where: { id },
      });
  
      return NextResponse.json({ success: true });
    } catch (error)
    {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
}