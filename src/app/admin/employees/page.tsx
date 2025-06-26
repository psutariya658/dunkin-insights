'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PencilIcon, TrashIcon, StarIcon, PlusIcon, MagnifyingGlassIcon, UsersIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { EmployeeAvatar } from '@/components/EmployeeAvatar';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

type Employee = {
  id: string;
  name: string;
  position: string;
  imageUrl: string | null;
  averageRating: number | null;
  active?: boolean;
  email: string;
};

type NewEmployee = {
  name: string;
  position: string;
  imageFile: File | null;
  imagePreview: string;
};

export default function AdminEmployees() {
  const router = useRouter();
  const { status } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: '',
    position: '',
    imageFile: null,
    imagePreview: ''
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Track mouse position for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
      } catch (err: unknown) {
        console.error('Error fetching employees:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);
  
  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <Spinner className="relative h-12 w-12 text-orange-500" />
        </div>
      </div>
    );
  }
  
  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Redirecting to login...</p>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Spinner className="relative h-8 w-8 text-orange-500 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewEmployee(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newEmployee.imageFile && !isEditing) {
      alert('Please select an image');
      return;
    }

    try {
      if (isEditing && editingEmployeeId) {
        // Handle edit - update existing employee
        const formData = new FormData();
        formData.append('name', newEmployee.name);
        formData.append('position', newEmployee.position);
        if (newEmployee.imageFile) {
          formData.append('image', newEmployee.imageFile);
        }

        const response = await fetch(`/api/employees/${editingEmployeeId}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to update employee');

        const updatedEmployee = await response.json();
        setEmployees(prev => prev.map(emp => 
          emp.id === editingEmployeeId ? updatedEmployee : emp
        ));

        // Reset form and exit edit mode
        setNewEmployee({
          name: '',
          position: '',
          imageFile: null,
          imagePreview: ''
        });
        setIsEditing(false);
        setEditingEmployeeId(null);
        setShowAddForm(false);
        alert('Employee updated successfully');
      } else {
        // Handle add - create new employee
        const formData = new FormData();
        formData.append('name', newEmployee.name);
        formData.append('position', newEmployee.position);
        formData.append('image', newEmployee.imageFile!);

        const response = await fetch('/api/employees', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to add employee');

        // Refresh the employee list
        const data = await response.json();
        setEmployees(prev => [...prev, data]);

        // Reset form
        setNewEmployee({
          name: '',
          position: '',
          imageFile: null,
          imagePreview: ''
        });

        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setShowAddForm(false);
        alert('Employee added successfully');
      }
    } catch (err: unknown) {
      console.error('Error saving employee:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save employee';
      alert(errorMessage);
    }
  };

  // Handle delete employee
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete employee');
      
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert('Employee deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting employee:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete employee';
      alert(errorMessage);
    }
  };

  // Handle edit employee
  const handleEdit = (employee: Employee) => {
    setNewEmployee({
      name: employee.name,
      position: employee.position,
      imagePreview: employee.imageUrl || '',
      imageFile: null
    });
    setIsEditing(true);
    setEditingEmployeeId(employee.id);
    setShowAddForm(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setNewEmployee({
      name: '',
      position: '',
      imageFile: null,
      imagePreview: ''
    });
    setIsEditing(false);
    setEditingEmployeeId(null);
    setShowAddForm(false);
    
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      (employee.position && employee.position.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 relative"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="text-red-500 text-center">
          <p>Error loading employees: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">Manage Employees</h1>
        <Link
          href="/admin/employees/create"
          className="inline-flex items-center gap-x-2 rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          New Employee
        </Link>
      </div>

      {isLoading && <p>Loading employees...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!isLoading && !error && (
        <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Avg. Rating</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{employee.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.position}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.averageRating ? employee.averageRating.toFixed(1) : 'N/A'}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
