'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from "sonner";
import {
  User,
  Save,
  ArrowLeft,
  Loader2,
  Building,
  Mail,
  Phone,
  Tag,
  Bookmark,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function EditRetailer() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { data: session, status } = useSession()
  
  const [retailer, setRetailer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    businessType: '',
    taxId: ''
  });
  
  // Fetch retailer data
  useEffect(() => {
    fetchRetailer();
  }, [id], session?.accessToken);

  const getAuthToken = () => {
    return session?.accessToken;
  };
  
  const fetchRetailer = async () => {
    setIsLoading(true);
    try {
      // In a real application, you would fetch from your API:
      // const response = await axios.get(`/api/admin/retailers/${id}`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });

      const { retailer } = response.data.data;
      
      setRetailer(retailer);
      setFormData({
        firstName: retailer.firstName,
        lastName: retailer.lastName,
        email: retailer.email,
        phone: retailer.phone,  
        companyName: retailer.companyName,
        businessType: retailer.businessType,
        taxId: retailer.taxId
      });
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error fetching retailer:', error);
      toast.error('Failed to load retailer details');
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real application, you would submit to your API:
      // await axios.put(`/api/admin/retailers/${id}`, formData);
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.data.success) {
        // Update the retailer details in local state
        setRetailer(prev => ({
          ...prev,
          ...formData
        }));
        
        toast.success('Retailer details updated successfully');
        router.push(`/admin/customers/${id}`);
      } else {
        toast.error('Failed to update retailer details');
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating retailer:', error);
      toast.error('Failed to update retailer details: ' + (error.response?.data?.message || error.message));
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading retailer details...</span>
        </div>
      </div>
    );
  }
  
  if (!retailer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Retailer Not Found</h2>
          <p className="text-gray-500 mb-6">The retailer you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/admin/customers"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Retailers
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header and Actions */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center mb-2">
              <Link 
                href={`/admin/customers/${id}`}
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Retailer Details
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="mr-3 h-6 w-6 text-blue-600" />
              Edit Retailer
            </h1>
          </div>
        </div>
        
        {/* Edit Form */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Edit Retailer Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Update the information for {retailer.firstName} {retailer.lastName}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-500" />
                Personal Information
              </h4>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Mail className="mr-1 h-4 w-4 text-gray-500" />
                      Email Address
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Phone className="mr-1 h-4 w-4 text-gray-500" />
                      Phone Number
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Information */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-gray-500" />
                Business Information
              </h4>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Tag className="mr-1 h-4 w-4 text-gray-500" />
                      Tax ID
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="taxId"
                      id="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Bookmark className="mr-1 h-4 w-4 text-gray-500" />
                      Business Type
                    </div>
                  </label>
                  <div className="mt-1">
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select Business Type</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-5 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/admin/customers/${id}`}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="mt-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This form only updates basic retailer information. To manage approval status and payment settings, please return to the retailer details page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}