"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ServiceFeedbackPage() {
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tempUserId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUserId,
          rating: 5,
          comment: comment,
          customerName: customerName.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting service feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Thank you for your feedback!</h1>
        <p className="text-lg text-gray-700 mb-8">We appreciate your comment about our service.</p>
        <Link href="/" className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors">Back to Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4 py-12">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-orange-400 bg-clip-text text-transparent">Comment on Service</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name (optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white transition-all duration-200"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white"
              rows={5}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your visit, our service, or anything else..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!comment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>
    </main>
  );
} 