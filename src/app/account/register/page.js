'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store, ArrowLeft, Glasses, CheckCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import axios from '@/lib/axios';
import { Alert, AlertDescription } from '@/components/ui/alert';

const steps = [
  { id: 'personal', title: 'Personal Details' },
  { id: 'business', title: 'Business Information' },
  { id: 'security', title: 'Security Setup' },
  { id: 'verification', title: 'Verification' }
];

export default function StepRegister() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    storeName: '',
    storeAddress: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          setError('Please fill in all personal details');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s+/g, ''))) {
          setError('Please enter a valid phone number');
          return false;
        }
        break;
      case 1:
        if (!formData.storeName || !formData.storeAddress) {
          setError('Please fill in all business information');
          return false;
        }
        if (formData.storeName.length < 3) {
          setError('Store name must be at least 3 characters long');
          return false;
        }
        if (formData.storeAddress.length < 10) {
          setError('Please enter a complete store address');
          return false;
        }
        break;
      case 2:
        if (!formData.password || !formData.confirmPassword) {
          setError('Please fill in all security fields');
          return false;
        }
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
        break;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        store: {
          name: formData.storeName,
          address: formData.storeAddress
        }
      };

      await axios.post('/api/customers/register', registrationData);

      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (signInResult.error) {
        throw new Error('Authentication failed after registration');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
      if (err.response?.data?.field) {
        const stepMapping = {
          email: 0,
          phone: 0,
          password: 2,
          storeName: 1,
          storeAddress: 1
        };
        setCurrentStep(stepMapping[err.response.data.field] || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Name</label>
              <input
                name="storeName"
                type="text"
                value={formData.storeName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="Optical Vision Center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Address</label>
              <textarea
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="123 Main Street, Suite 100&#10;City, State 12345"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  placeholder="••••••••"
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
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="••••••••"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{formData.firstName} {formData.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{formData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{formData.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Store Name</dt>
                  <dd className="text-sm text-gray-900">{formData.storeName}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Store Address</dt>
                  <dd className="text-sm text-gray-900 whitespace-pre-line">{formData.storeAddress}</dd>
                </div>
              </dl>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Column - Progress */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow text-white">
          <Glasses className="h-24 w-24 mb-8" />
          <h1 className="text-4xl font-bold mb-6">Join Our Network</h1>
          <div className="w-full max-w-md">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center mb-4">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 ${
                  index < currentStep ? 'bg-white text-blue-600 border-white' :
                  index === currentStep ? 'border-white text-white' :
                  'border-white/40 text-white/40'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <p className={`text-lg ${
                    index < currentStep ? 'text-white' :
                    index === currentStep ? 'text-white' :
                    'text-white/40'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/80 text-sm text-center">
          © 2025 OpticalConnect. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">{steps[currentStep].title}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === steps.length - 1) {
                handleSubmit(e);
              } else {
                handleNext(e);
              }
            }} 
            noValidate
          >
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            <div className="mt-6 flex justify-between">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
                  currentStep === 0 ? 'ml-auto' : ''
                }`}
              >
                {currentStep === steps.length - 1
                  ? (loading ? 'Creating Account...' : 'Create Account')
                  : 'Next'}
              </button>
            </div>

            {currentStep === 0 && (
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/account/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </a>
              </p>
            )}
          </form>
        </div>
      </div>
      
    </div>
  );
}
            