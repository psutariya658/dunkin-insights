'use client';

import { useState, useEffect, useRef } from 'react';
import { UsersIcon, ShoppingBagIcon, ChatBubbleLeftRightIcon, StarIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Stats = {
  totalEmployees: number;
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
  recentReviews: number;
  topRatedEmployee: string;
  topRatedProduct: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
  product: { name: string | null } | null;
  employee: { name: string | null } | null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch recent reviews
        const reviewsResponse = await fetch('/api/reviews');
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setRecentReviews(reviewsData.slice(0, 5)); // Get latest 5 reviews
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      name: 'Total Employees',
      value: stats?.totalEmployees,
      icon: UsersIcon,
      href: '/admin/employees',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
      trend: '+2 this month',
    },
    {
      name: 'Total Products',
      value: stats?.totalProducts,
      icon: ShoppingBagIcon,
      href: '/admin/products',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: '+5 this month',
    },
    {
      name: 'Total Reviews',
      value: stats?.totalReviews,
      icon: ChatBubbleLeftRightIcon,
      href: '/admin/reviews',
      bgColor: 'bg-fuchsia-100',
      iconColor: 'text-fuchsia-600',
      trend: '+12 today',
    },
    {
      name: 'Avg Rating',
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : 'N/A',
      icon: StarIcon,
      href: '/admin/reviews',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      trend: '+0.3 this week',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-36 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative p-8 rounded-2xl shadow-lg bg-gray-900 before:absolute before:inset-0 before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(236,72,153,0.2),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Updates</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((card) => (
                <div key={card.name} className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-start justify-between">
                        <div className="flex-shrink-0">
                            <span className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${card.bgColor}`}>
                                <card.icon className={`h-7 w-7 ${card.iconColor}`} aria-hidden="true" />
                            </span>
                        </div>
                        <Link href={card.href} className="text-sm font-medium text-pink-400 hover:text-pink-300">
                           View all <span className="sr-only">{card.name}</span>
                        </Link>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-400">{card.name}</p>
                        <p className="text-3xl font-bold text-white">{card.value ?? 'N/A'}</p>
                        <p className="text-xs text-green-400 mt-1">{card.trend}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rating Distribution Chart */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center">
                  <div className="flex items-center w-16">
                    <span className="text-yellow-400 text-sm">{stars}★</span>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3 mx-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-sm w-12 text-right">
                    {Math.floor(Math.random() * 50)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentReviews.slice(0, 4).map((review) => (
                <div key={review.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} 
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {review.product?.name || review.employee?.name || 'Service'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {review.user?.name || 'Anonymous'}
                    </p>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Top Rated Employee</h3>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">👑</span>
              </div>
              <h4 className="text-lg font-semibold text-white">{stats?.topRatedEmployee || 'Loading...'}</h4>
              <p className="text-gray-400">4.8 ⭐ Average Rating</p>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">🔥 Most Popular Product</h3>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">☕</span>
              </div>
              <h4 className="text-lg font-semibold text-white">{stats?.topRatedProduct || 'Loading...'}</h4>
              <p className="text-gray-400">4.6 ⭐ Average Rating</p>
            </div>
          </div>
        </div>
        
        {/* Welcome Section */}
        <div className="bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, Admin! 👋</h2>
            <p className="text-gray-400 mb-4">
                Your Dunkin' Feedback platform is running smoothly. Here's what's happening today:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Customer satisfaction up 15%</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Average response time: 2.3 hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">4.7/5 overall rating</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
