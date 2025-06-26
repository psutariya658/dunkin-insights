"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
};

const emojis = [
  { emoji: '😍', label: 'Love it!', value: 5 },
  { emoji: '😊', label: 'Great!', value: 4 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😕', label: 'Not great', value: 2 },
  { emoji: '😞', label: 'Disappointed', value: 1 }
];

export default function ProductFeedbackPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEmojiClick = (value: number) => {
    setSelectedEmoji(value);
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate a temporary user ID for anonymous feedback
      const tempUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUserId,
          productId: selectedProduct,
          rating: rating,
          comment: comment,
          customerName: customerName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle successful submission
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 relative"></div>
        </div>
        <p className="text-lg text-gray-600 mt-4">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-3xl font-bold text-purple-600 mb-4">Thank you for your feedback!</h1>
          <p className="text-lg text-gray-700 mb-8">We appreciate your review of our product.</p>
          <Link href="/" className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4 py-12">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Rate a Product</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No products available for rating at the moment.</p>
            <p className="text-sm text-gray-500">Please check back later!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-blue-400"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                required
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Emoji Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">How was it? 😊</label>
              <div className="flex justify-between items-center">
                {emojis.map(({ emoji, label, value }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => handleEmojiClick(value)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      selectedEmoji === value 
                        ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    aria-label={label}
                  >
                    <span className="text-2xl mb-1">{emoji}</span>
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Star Rating</label>
              <div className="flex space-x-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    type="button"
                    key={star}
                    className={`text-3xl transition-all duration-300 transform hover:scale-125 ${
                      star <= rating 
                        ? 'text-yellow-400 drop-shadow-lg' 
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2 animate-fade-in">
                  You rated this {rating} star{rating > 1 ? 's' : ''} ⭐
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tell us more (optional)</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 resize-none"
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What did you love? What could be better? Share your thoughts..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name (optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedProduct || rating === 0 || isSubmitting}
              className={`w-full font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                !selectedProduct || rating === 0 || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Review ✨'
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
} 