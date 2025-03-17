'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Building, ArrowLeft, ShoppingBag } from 'lucide-react';
import { signIn } from 'next-auth/react';
import axios from '@/lib/axios';
import { Alert, AlertDescription } from '@/components/ui/alert';

const businessTypes = [
  { id: 'independent', name: 'Independent Store' },
  { id: 'chain', name: 'Chain Store' },
  { id: 'franchise', name: 'Franchise' },
  { id: 'online', name: 'Online Retailer' },
  { id: 'other', name: 'Other' }
];

export default function RetailerRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    taxId: '',
    businessType: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validate = () => {
    // Basic required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword',
      'companyName', 'taxId', 'businessType', 'address1', 'city', 'state', 
      'postalCode', 'country'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, and numbers');
      return false;
    }

    // Business validation
    if (formData.companyName.length < 2) {
      setError('Company name is too short');
      return false;
    }

    if (formData.taxId.length < 5) {
      setError('Please enter a valid Tax ID');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        companyName: formData.companyName,
        taxId: formData.taxId,
        businessType: formData.businessType,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      };

      const response = await axios.post('/api/customers/register-retailer', registrationData);

      if (response.data.success) {
        // Automatically sign in after successful registration
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password
        });

        if (signInResult.error) {
          throw new Error('Authentication failed after registration');
        }

        // Redirect to dashboard or a specific retailer page
        router.push('/dashboard/retailer');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Column - Branding (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-6 lg:p-12 flex-col justify-between fixed top-0 bottom-0 left-0">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow text-white overflow-y-auto">
          <ShoppingBag className="h-20 w-20 lg:h-24 lg:w-24 mb-6 lg:mb-8" />
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">Retailer Registration</h1>
          <p className="text-lg lg:text-xl mb-3 lg:mb-4 text-center">Join our network of authorized retailers</p>
          <p className="text-base lg:text-lg text-center max-w-md">
            Get access to wholesale pricing, exclusive products, and dedicated support for your business.
          </p>
          
          <div className="mt-8 lg:mt-12 bg-white/10 p-4 lg:p-6 rounded-lg">
            <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Benefits Include</h3>
            <ul className="space-y-2 lg:space-y-3">
              <li className="flex items-start">
                <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Competitive wholesale pricing</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Direct access to new products</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2 flex-shrink-0">✓</span>
                <span>Priority customer support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-white/80 text-sm text-center">
          © 2025 OpticalConnect. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form (Scrollable) */}
      <div className="flex-1 w-full lg:w-1/2 lg:ml-[50%] overflow-y-auto min-h-screen">
        <div className="max-w-xl mx-auto py-8 lg:py-12 px-4 sm:px-6">
          {/* Mobile header with back button */}
          <div className="flex lg:hidden items-center mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center mr-4 text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold">Retailer Registration</span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <Building className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Register as a Retailer</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fill out the form below to apply for a retailer account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">Tax ID / Business Number *</label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Business Type *</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Business Address</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Street Address *</label>
                  <input
                    type="text"
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                    Apartment, Suite, etc.
                  </label>
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Account Security</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">I agree to the terms and conditions *</label>
                  <p className="text-gray-500">
                    By creating an account, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/account/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </a>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Create Retailer Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}