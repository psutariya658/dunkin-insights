"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Employee = {
  id: string;
  name: string;
  position: string;
  imageUrl: string | null;
  averageRating: number | null;
  reviewCount: number | null;
  active?: boolean;
};

const emojis = [
  { emoji: '😍', label: 'Amazing!', value: 5 },
  { emoji: '😊', label: 'Great!', value: 4 },
  { emoji: '😐', label: 'Good', value: 3 },
  { emoji: '😕', label: 'Okay', value: 2 },
  { emoji: '😞', label: 'Poor', value: 1 }
];

export default function EmployeeFeedbackPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employees from API
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmojiClick = (value: number) => {
    setSelectedEmoji(value);
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // A temporary user ID for anonymous reviews
      const userId = `anonymous-${Date.now()}`;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          rating,
          comment,
          customerName: customerName.trim() || undefined,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setSubmitted(true);
      // Refresh employee data to show updated average rating and review count
      fetchEmployees(); 
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 relative"></div>
        </div>
        <p className="text-lg text-gray-600 mt-4">Loading employees...</p>
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
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
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
          <h1 className="text-3xl font-bold text-orange-600 mb-4">Thank you for your feedback!</h1>
          <p className="text-lg text-gray-700 mb-8">We appreciate your review of our team member.</p>
          <Link href="/" className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4 py-12">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Rate an Employee</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {employees.map(employee => (
              <div key={employee.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center hover-lift transition-all duration-300">
                {employee.imageUrl ? (
                  <img src={employee.imageUrl} alt={employee.name} className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-pink-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center mb-3 border-4 border-pink-200">
                    <span className="text-white font-bold text-lg">DD</span>
                  </div>
                )}
                <div className="font-bold text-lg text-gray-900">{employee.name}</div>
                <div className="text-sm text-gray-500 mb-1">{employee.position}</div>
                <div className="flex items-center gap-1">
                  <StarRating rating={employee.averageRating || 0} />
                  <span className="text-sm text-gray-600 ml-1">
                    ({employee.reviewCount || 0})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No employees available for rating at the moment.</p>
            <p className="text-sm text-gray-500">Please check back later!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200 hover:border-orange-400"
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                required
              >
                <option value="">Choose an employee...</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            {/* Emoji Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">How was your experience? 😊</label>
              <div className="flex justify-between items-center">
                {emojis.map(({ emoji, label, value }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => handleEmojiClick(value)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      selectedEmoji === value 
                        ? 'bg-gradient-to-r from-orange-100 to-pink-100 border-2 border-orange-300' 
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200 resize-none"
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What made your experience special? Any suggestions for improvement?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name (optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedEmployee || rating === 0 || isSubmitting}
              className={`w-full font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                !selectedEmployee || rating === 0 || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white'
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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
  </div>
); 