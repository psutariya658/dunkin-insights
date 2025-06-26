'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Define types for your data
interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
  };
}

interface Employee {
  id: string;
  name: string;
  position: string;
  imageUrl: string | null;
  averageRating: number | null;
  reviews: Review[];
}

// Star component for displaying ratings
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${
            index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
};

export default function EmployeeReviewsPage() {
  const params = useParams();
  const { id } = params;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchEmployeeReviews = async () => {
        try {
          const res = await fetch(`/api/employees/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch employee reviews');
          }
          const data = await res.json();
          setEmployee(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeReviews();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!employee) {
    return <div className="text-center mt-10">Employee not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48"
              src={employee.imageUrl || '/default-avatar.png'}
              alt={`Photo of ${employee.name}`}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {employee.position}
            </div>
            <h1 className="block mt-1 text-4xl leading-tight font-bold text-black">
              {employee.name}
            </h1>
            <div className="mt-4 flex items-center">
              <StarRating rating={employee.averageRating || 0} />
              <span className="ml-2 text-gray-600">
                ({employee.reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">Customer Reviews</h2>
      <div className="space-y-6">
        {employee.reviews.length > 0 ? (
          employee.reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="font-bold text-lg text-gray-800">
                  {review.user?.name || 'Anonymous'}
                </div>
                <div className="ml-auto">
                  <StarRating rating={review.rating} />
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <div className="text-right text-sm text-gray-400 mt-4">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No reviews for this employee yet.
          </p>
        )}
      </div>
    </div>
  );
}