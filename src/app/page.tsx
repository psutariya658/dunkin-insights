'use client';

import { useRouter } from 'next/navigation'
import Link from 'next/link';
import ReviewSlideshow from '@/components/ReviewSlideshow';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const router = useRouter()
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-cover bg-center text-white" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            Your Feedback Matters
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Help us make your Dunkin' experience even better. Share your thoughts on our products and service.
          </p>
          <Link href="#feedback-options" className="bg-pink-600 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-700 transition-transform duration-300 hover:scale-105 text-lg">
            Give Feedback
          </Link>
        </div>
      </section>

      {/* Feedback Options Section */}
      <section id="feedback-options" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How can we help?</h2>
            <p className="text-gray-600 mt-2">Choose an option below to get started.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Rate a Product */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-orange-600">Rate a Product</h3>
                <p className="text-gray-600 mb-6">Did you love our new donut? Or have a thought on our coffee? Let us know.</p>
                <Link href="/feedback/product" className="font-bold text-pink-600 hover:text-pink-700 flex items-center">
                  <span>Rate Now</span>
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </div>
            {/* Rate an Employee */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-orange-600">Rate an Employee</h3>
                <p className="text-gray-600 mb-6">Did someone on our team make your day? Give them a shout-out!</p>
                <Link href="/feedback/employee" className="font-bold text-pink-600 hover:text-pink-700 flex items-center">
                  <span>Rate Now</span>
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </div>
            {/* Service Feedback */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-orange-600">Service Feedback</h3>
                <p className="text-gray-600 mb-6">Share your thoughts about our overall service and experience.</p>
                <Link href="/feedback/service" className="font-bold text-pink-600 hover:text-pink-700 flex items-center">
                  <span>Share Feedback</span>
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </div>
            {/* See Team Reviews */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-orange-600">See Team Reviews</h3>
                <p className="text-gray-600 mb-6">Check out what other customers are saying about our amazing team.</p>
                <Link href="/employees" className="font-bold text-pink-600 hover:text-pink-700 flex items-center">
                  <span>View All</span>
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Review Slideshow Section */}
      <ReviewSlideshowSection />
    </>
  )
}

// I'm extracting the ReviewSlideshow into its own component here to keep the main page clean.
function ReviewSlideshowSection() {
  return (
    <div className="w-full">
      <ReviewSlideshow />
    </div>
  );
}
