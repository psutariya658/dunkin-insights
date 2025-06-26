import { prisma } from '@/lib/prisma'

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  })

  return products.map(product => ({
    ...product,
    averageRating: product.reviews.length
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : null,
  }))
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <main className="py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">Our Products</h1>
        <p className="text-lg text-gray-600">Rate your favorite Dunkin&apos; treats!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {product.imageUrl && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-48"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-semibold">
                  ${product.price.toFixed(2)}
                </span>
                {product.averageRating && (
                  <span className="text-gray-600">
                    Rating: {product.averageRating.toFixed(1)}⭐
                  </span>
                )}
              </div>
              <button
                className="mt-4 w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                onClick={() => {/* We'll add rating functionality later */}}
              >
                Rate this Product
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
