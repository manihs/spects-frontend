'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, CheckCircle, Clock, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegistrationSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Column - Branding (Fixed) */}
      <div className='relative'>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="hidden lg:flex lg:w-1/2 p-6 lg:p-12 flex-col justify-between fixed top-0 bottom-0 left-0"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/register.webp')",
            opacity: 0.8,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-grow text-white overflow-y-auto">
            <CheckCircle className="h-20 w-20 lg:h-24 lg:w-24 mb-6 lg:mb-8 text-green-400" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">Registration Submitted</h1>
            <p className="text-lg lg:text-xl mb-3 lg:mb-4 text-center">Your business application is under review</p>
            <p className="text-base lg:text-lg text-center max-w-md">
              We're verifying your business details to ensure the best experience for all our partners.
            </p>
            
            <div className="mt-8 lg:mt-12 bg-white/10 p-4 lg:p-6 rounded-lg">
              <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">What Happens Next?</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li className="flex items-start">
                  <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                  <span>We verify your business information (1-2 business days)</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                  <span>Account approval notification via email</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                  <span>Access to wholesale pricing and products</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                  <span>Dedicated account manager assignment</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-white/80 text-sm text-center">
            © 2025 OpticalConnect. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column - Success Content (Scrollable) */}
      <div className="flex-1 w-full lg:w-1/2 lg:ml-[50%] overflow-y-auto min-h-screen">
        <div className="max-w-xl mx-auto py-8 lg:py-12 px-4 sm:px-6">
          {/* Mobile header with back button */}
          <div className="flex lg:hidden items-center mb-6">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center mr-4 text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold">Registration Success</span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Application Submitted Successfully!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for your interest in joining our business partner network
            </p>
          </div>

          {/* Success Alert */}
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your business registration has been received and is currently under review.
            </AlertDescription>
          </Alert>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Account Verification in Progress</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Our team is currently reviewing your business information and documentation. This process typically takes 1-2 business days.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Important Note:</h4>
              <p className="text-sm text-yellow-700">
                You will not be able to access wholesale pricing or place orders until your account has been verified and approved.
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Document Verification</h4>
                  <p className="text-sm text-gray-600">We'll verify your business registration and tax information</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Account Approval</h4>
                  <p className="text-sm text-gray-600">You'll receive an email notification once approved</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Start Shopping</h4>
                  <p className="text-sm text-gray-600">Access wholesale prices and place your first order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your application or need to update your information, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Email Support</p>
                  <a href="mailto:business@opticalconnect.com" className="text-blue-600 hover:underline">
                    business@opticalconnect.com
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Phone Support</p>
                  <a href="tel:+1-800-OPTICAL" className="text-blue-600 hover:underline">
                    +1 (800) OPTICAL
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Products
            </button>
            <button
              onClick={() => router.push('/account/login')}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In to Account
            </button>
          </div>

          {/* Timeline */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Estimated verification time: <span className="font-medium">1-2 business days</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Applications submitted on weekends will be processed on the next business day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}