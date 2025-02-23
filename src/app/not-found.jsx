'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* SVG Illustration */}
        <div className="w-full max-w-lg mx-auto mb-8">
          <svg
            className="w-full"
            viewBox="0 0 480 360"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            
            {/* Background Elements */}
            <circle
              cx="240"
              cy="180"
              r="120"
              fill="url(#gradient)"
              fillOpacity="0.1"
            />
            <circle
              cx="240"
              cy="180"
              r="80"
              fill="url(#gradient)"
              fillOpacity="0.2"
            />
            
            {/* 404 Text */}
            <text
              x="240"
              y="180"
              textAnchor="middle"
              className="text-8xl font-bold"
              fill="url(#gradient)"
              style={{
                fontSize: '120px',
                fontWeight: 'bold'
              }}
            >
              404
            </text>
            
            {/* Decorative Elements */}
            <g transform="translate(160, 120)">
              <circle cx="0" cy="0" r="4" fill="#4F46E5" />
              <circle cx="160" cy="120" r="4" fill="#7C3AED" />
              <circle cx="80" cy="-40" r="4" fill="#4F46E5" />
              <circle cx="-40" cy="80" r="4" fill="#7C3AED" />
            </g>
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>

          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="w-5 h-5 mr-2" />
            Home Page
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          If you believe this is a mistake, please contact support
        </div>
      </div>
    </div>
  );
}