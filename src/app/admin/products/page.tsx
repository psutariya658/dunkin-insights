'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PencilIcon, TrashIcon, PlusIcon, CurrencyDollarIcon, MagnifyingGlassIcon, SparklesIcon, RocketLaunchIcon, StarIcon } from '@heroicons/react/24/outline'
import { Spinner } from '@/components/ui/spinner'
import { CubeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  averageRating: number
}

type NewProduct = {
  name: string
  description: string
  price: string
  category: string
  imageFile: File | null
  imagePreview: string
  imageUrl: string
  useImageUrl: boolean
}

const ProductsPage = () => {
  const router = useRouter()
  const { status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: '',
    category: '',
    imageFile: null,
    imagePreview: '',
    imageUrl: '',
    useImageUrl: false,
  })
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Track mouse position for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data)
      } catch (err: unknown) {
        console.error('Error fetching products:', err)
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])
  
  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12 text-dunkin-red" />
      </div>
    )
  }
  
  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Redirecting to login...</p>
          <Spinner className="h-8 w-8 text-dunkin-red mx-auto" />
        </div>
      </div>
    )
  }

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProduct(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if image is provided (either file or URL)
    if (!newProduct.useImageUrl && !newProduct.imageFile && !isEditing) {
      alert('Please select an image or provide an image URL')
      return
    }

    if (newProduct.useImageUrl && !newProduct.imageUrl.trim() && !isEditing) {
      alert('Please provide an image URL')
      return
    }

    try {
      if (isEditing && editingProductId) {
        // Handle edit - update existing product
        let response
        
        if (newProduct.useImageUrl) {
          // Send JSON with image URL
          response = await fetch(`/api/products/${editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newProduct.name,
              description: newProduct.description,
              price: parseFloat(newProduct.price),
              category: newProduct.category,
              imageUrl: newProduct.imageUrl,
            }),
          })
        } else {
          // Send FormData with image file
          const formData = new FormData()
          formData.append('name', newProduct.name)
          formData.append('description', newProduct.description)
          formData.append('price', newProduct.price)
          formData.append('category', newProduct.category)
          if (newProduct.imageFile) {
            formData.append('image', newProduct.imageFile)
          }
          
          response = await fetch(`/api/products/${editingProductId}`, {
            method: 'PUT',
            body: formData,
          })
        }

        if (!response.ok) throw new Error('Failed to update product')

        const updatedProduct = await response.json()
        setProducts(prev => prev.map(prod => 
          prod.id === editingProductId ? updatedProduct : prod
        ))

        // Reset form and exit edit mode
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          imageFile: null,
          imagePreview: '',
          imageUrl: '',
          useImageUrl: false,
        })
        setIsEditing(false)
        setEditingProductId(null)
        setShowAddForm(false)
        alert('Product updated successfully')
      } else {
        // Handle add - create new product
        let response
        
        if (newProduct.useImageUrl) {
          // Send JSON with image URL
          response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newProduct.name,
              description: newProduct.description,
              price: parseFloat(newProduct.price),
              category: newProduct.category,
              imageUrl: newProduct.imageUrl,
            }),
          })
        } else {
          // Send FormData with image file
          const formData = new FormData()
          formData.append('name', newProduct.name)
          formData.append('description', newProduct.description)
          formData.append('price', newProduct.price)
          formData.append('category', newProduct.category)
          formData.append('image', newProduct.imageFile!)
          
          response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
          })
        }

        if (!response.ok) throw new Error('Failed to add product')

        // Refresh the product list
        const data = await response.json()
        setProducts(prev => [...prev, data])

        // Reset form
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          imageFile: null,
          imagePreview: '',
          imageUrl: '',
          useImageUrl: false,
        })

        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''

        setShowAddForm(false)
        alert('Product added successfully')
      }
    } catch (err: unknown) {
      console.error('Error saving product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product'
      alert(errorMessage)
    }
  }

  // Handle delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete product')
      
      setProducts(prev => prev.filter(prod => prod.id !== id))
      alert('Product deleted successfully')
    } catch (err: unknown) {
      console.error('Error deleting product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      alert(errorMessage)
    }
  }

  // Handle edit product
  const handleEdit = (product: Product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imagePreview: product.imageUrl || '',
      imageFile: null,
      imageUrl: product.imageUrl || '',
      useImageUrl: !!product.imageUrl,
    })
    setIsEditing(true)
    setEditingProductId(product.id)
    setShowAddForm(true)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      imageFile: null,
      imagePreview: '',
      imageUrl: '',
      useImageUrl: false,
    })
    setIsEditing(false)
    setEditingProductId(null)
    setShowAddForm(false)
    
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error loading products: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">Manage Products</h1>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-x-2 rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          New Product
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative w-full max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">
              <CubeIcon className="mx-auto h-12 w-12 mb-2 text-gray-200" />
              <p>No products found.</p>
            </div>
          )}
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="relative bg-gradient-to-br from-orange-50 to-pink-50 border border-gray-100 rounded-xl shadow hover:shadow-lg transition-shadow p-5 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-white"
                  />
                ) : (
                  <CubeIcon className="w-20 h-20 text-gray-200 bg-white rounded-lg border border-gray-200" />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700">{product.category}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 ml-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                      {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="inline-flex items-center gap-1 text-sm text-yellow-600 font-medium">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  {product.averageRating.toFixed(1)}
                </span>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold shadow-sm transition-colors"
                >
                  <TrashIcon className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
