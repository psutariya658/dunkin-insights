import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF6B00' }}>
              Dunkin' Feedback
            </h3>
            <p className="text-gray-400">
              Your feedback helps us improve our service and products. Thank you for taking the time to share your thoughts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/feedback/product" className="text-gray-300 hover:text-white">
                  Rate a Product
                </Link>
              </li>
              <li>
                <Link href="/feedback/employee" className="text-gray-300 hover:text-white">
                  Rate an Employee
                </Link>
              </li>
              <li>
                <Link href="/employees" className="text-gray-300 hover:text-white">
                  Our Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                {/* Placeholder for social icon */}
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24H12.82v-9.29h-3.128V11.41h3.128V8.825c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.29h-3.12V24h5.698C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
              {/* Add other social links similarly */}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <Link href="/admin" className="hover:text-white transition-colors cursor-pointer">
            <p>&copy; {new Date().getFullYear()} Dunkin' Feedback. All Rights Reserved.</p>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 