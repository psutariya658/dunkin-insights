'use client';

import { useState, useEffect } from 'react';
import { EmployeeCard } from '@/components/EmployeeCard';

type Employee = {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  averageRating: number | null;
  reviewCount: number | null;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D80F2B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#D80F2B] text-white rounded-md hover:bg-[#b30d24] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#D80F2B] mb-4">Our Amazing Team</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our dedicated team members who work hard to make your experience special.
            Click on a team member to see their reviews!
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                id={employee.id}
                name={employee.name}
                position={employee.position}
                imageUrl={employee.imageUrl}
                averageRating={employee.averageRating}
                reviewCount={employee.reviewCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
