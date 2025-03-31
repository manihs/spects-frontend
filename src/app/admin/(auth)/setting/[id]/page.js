'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from "sonner";
import {
  Percent,
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Clock
} from 'lucide-react';

export default function TaxDetail({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [tax, setTax] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productCount, setProductCount] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    description: '',
    status: true
  });
  
  // Fetch tax details
  useEffect(() => {
    fetchTaxDetails();
  }, [id]);
  
  const fetchTaxDetails = async () => {
    setIsLoading(true);
    try {
      // In a real application, you would fetch from your API:
      // const response = await axios.get(`/api/taxes/${id}`);
      
      // For demo, we'll simulate a response with a delay
      setTimeout(() => {
        // Mock tax data
        const mockTax = {
          id: parseInt(id),
          name: parseInt(id) === 1 ? "No Tax" : 
                parseInt(id) === 2 ? "Standard GST" : 
                parseInt(id) === 3 ? "Reduced GST" : "Luxury Tax",
          rate: parseInt(id) === 1 ? 0 : 
                parseInt(id) === 2 ? 18 : 
                parseInt(id) === 3 ? 12 : 28,
          description: parseInt(id) === 1 ? "Products with no tax applied" : 
                       parseInt(id) === 2 ? "Standard GST rate for most products" : 
                       parseInt(id) === 3 ? "Reduced GST rate for essential goods" : 
                       "GST rate for luxury and premium goods",
          status: true,
          createdAt: "2023-08-15T10:30:00.000Z",
          updatedAt: "2023-08-15T10:30:00.000Z"
        };
        
        // Mock product count
        const mockProductCount = parseInt(id) === 1 ? 25 : 
                                 parseInt(id) === 2 ? 120 : 
                                 parseInt(id) === 3 ? 45 : 15;
        
        setTax(mockTax);
        setProductCount(mockProductCount);
        setFormData({
          name: mockTax.name,
          rate: mockTax.rate,
          description: mockTax.description || '',
          status: mockTax.status
        });
        
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching tax details:', error);
      toast.error('Failed to load tax details');
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real application, you would submit to your API:
      // await axios.put(`/api/taxes/${id}`, formData);
      
      // For demo, we'll simulate success after a delay
      setTimeout(() => {
        setTax({
          ...tax,
          ...formData,
          updatedAt: new Date().toISOString()
        });
        
        setIsSubmitting(false);
        toast.success('Tax updated successfully');
      }, 1000);
      
    } catch (error) {
      console.error('Error updating tax:', error);
      toast.error('Failed to update tax');
      setIsSubmitting(false);
    }
  };
  
  // Handle tax deletion
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real application, you would submit to your API:
      // await axios.delete(`/api/taxes/${id}`);
      
      // For demo, we'll simulate success after a delay
      setTimeout(() => {
        setIsSubmitting(false);
        setShowDeleteModal(false);
        toast.success('Tax deleted successfully');
        router.push('/admin/taxes');
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting tax:', error);
      toast.error('Failed to delete tax');
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading tax details...</span>
        </div>
      </div>
    );
  }
  
  if (!tax) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Not Found</h2>
          <p className="text-gray-500 mb-6">The tax you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/admin/taxes"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Taxes
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
                href="/admin/taxes"
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Tax Settings
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Percent className="mr-3 h-6 w-6 text-blue-600" />
              {tax.name}
            </h1>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Tax
            </button>
          </div>
        </div>
        
        {/* Tax Info Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tax Information
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tax.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {tax.status ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Inactive
                </>
              )}
            </span>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{tax.id}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Tax Rate</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{tax.rate}%</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created On</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(tax.createdAt)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(tax.updatedAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{tax.description || 'No description available'}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Usage Statistics */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5 text-gray-500" />
              Usage Statistics
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <span className="block text-sm font-medium text-gray-500">Products using this tax</span>
                <span className="text-3xl font-bold text-gray-900">{productCount}</span>
              </div>
              <Link 
                href={`/admin/products?taxId=${tax.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Products
              </Link>
            </div>
            {tax.name === 'No Tax' && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This is a system tax rate. Deleting or significantly modifying this tax may cause issues with existing products.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Edit Tax Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Edit Tax
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Tax Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                    Tax Rate (%)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                    <input
                      type="number"
                      name="rate"
                      id="rate"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.rate}
                      onChange={handleChange}
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="status"
                        name="status"
                        type="checkbox"
                        checked={formData.status}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="status" className="font-medium text-gray-700">Active</label>
                      <p className="text-gray-500">Inactive taxes won't be available for selection when creating or editing products</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  href="/admin/taxes"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowDeleteModal(false)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Tax
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the tax "{tax.name}"? This action cannot be undone.
                        </p>
                        {productCount > 0 && (
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                            <p className="text-sm text-yellow-800">
                              <strong>Warning:</strong> This tax is currently used by {productCount} products. Deleting it may cause pricing and tax calculation issues for these products.
                            </p>
                          </div>
                        )}
                        {tax.name === 'No Tax' && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
                            <p className="text-sm text-red-800 font-medium">
                              <strong>Warning:</strong> This is a system tax. Deleting it may cause serious issues with the application. It is recommended to keep this tax rate.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}