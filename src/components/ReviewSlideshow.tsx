'use client';

import { useState, useEffect } from 'react';
import { ShareIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  comment: string | null;
  rating: number;
  user: {
    name: string | null;
  };
  product: {
    name: string | null;
  } | null;
  employee: {
    name: string | null;
  } | null;
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

const ReviewCard = ({ review }: { review: Review }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 5);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleShare = async () => {
    const serviceName = review.product?.name || review.employee?.name || 'Dunkin service';
    const text = `"${review.comment}" - ${review.user?.name || 'Anonymous'} on ${serviceName}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amazing Dunkin\' Review',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert('Review copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 w-80 flex-shrink-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
          {review.user?.name?.charAt(0) || 'A'}
        </div>
        <div className="ml-4 flex-1">
          <p className="font-bold text-gray-800">{review.user?.name || 'Anonymous'}</p>
          <p className="text-sm text-gray-500">
            Reviewed {review.product?.name || review.employee?.name || 'a service'}
          </p>
        </div>
        {review.rating >= 4 && (
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
            ⭐ Top Review
          </div>
        )}
      </div>
      
      <StarRating rating={review.rating} />
      
      <p className="text-gray-600 mt-4 italic text-sm leading-relaxed">"{review.comment}"</p>
      
      {/* Social Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <HeartIcon className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{Math.floor(Math.random() * 10) + 1}</span>
          </button>
        </div>
        
        <button
          onClick={handleShare}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default function ReviewSlideshow() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredReview, setFeaturedReview] = useState<Review | null>(null);
  const [stats, setStats] = useState({
    happyCustomers: 0,
    averageRating: 0,
    wouldRecommend: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reviews and stats in parallel
        const [reviewsRes, statsRes] = await Promise.all([
          fetch('/api/reviews'),
          fetch('/api/stats')
        ]);

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          // Filter out reviews with no comments and duplicate for a seamless loop
          const filteredReviews = reviewsData.filter((r: Review) => r.comment);
          
          // Set featured review (highest rated with comment)
          const featured = filteredReviews
            .filter((r: Review) => r.rating >= 4)
            .sort((a: Review, b: Review) => b.rating - a.rating)[0];
          
          setFeaturedReview(featured || null);
          setReviews([...filteredReviews, ...filteredReviews]);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading amazing reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-pink-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600 mb-2">Real feedback from our valued customers.</p>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold">{stats.averageRating}/5 Average Rating</span>
            <span className="text-2xl">⭐</span>
          </div>
        </div>

        {/* Featured Review */}
        {featuredReview && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-3xl p-8 text-white text-center">
              <div className="mb-4">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Featured Review of the Week</h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-2xl mr-4">
                    {featuredReview.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{featuredReview.user?.name || 'Anonymous'}</p>
                    <p className="text-pink-100">
                      {featuredReview.product?.name || featuredReview.employee?.name || 'Service'}
                    </p>
                  </div>
                </div>
                <StarRating rating={featuredReview.rating} />
                <p className="text-lg italic mt-4">"{featuredReview.comment}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Slideshow */}
        <div className="w-full overflow-hidden">
          <div className="flex animate-scroll group">
            {reviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">{stats.happyCustomers}+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">{stats.averageRating}⭐</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.wouldRecommend}%</div>
            <div className="text-gray-600">Would Recommend</div>
          </div>
        </div>
      </div>
    </div>
  );
} 