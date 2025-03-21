'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import Link from 'next/link';
import { Loader2, ArrowLeft, Upload, X, Check, Info, AlertTriangle } from 'lucide-react';

export default function CreateCategory() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    status: true,
    showProducts: false,
    storeMenu: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  // Character limits
  const CHARACTER_LIMITS = {
    seoTitle: 60,
    seoDescription: 160,
    seoKeywords: 200
  };

  useEffect(() => {
    // Fetch parent categories
    const fetchParentCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/api/categories', {
          params: { limit: 100 }
        });
        if (response.success) {
          setParentCategories(response.data.categories);
        }
      } catch (error) {
        toast.error('Failed to fetch categories');
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentCategories();
  }, []);

  // Auto-populate SEO title if empty when name changes
  useEffect(() => {
    if (formData.name && !formData.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoTitle: prev.name
      }));
    }
  }, [formData.name]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Clear error when field is being edited
    setFormErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        image: file
      });

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous error
      setFormErrors(prev => ({
        ...prev,
        image: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (formData.seoTitle && formData.seoTitle.length > CHARACTER_LIMITS.seoTitle) {
      errors.seoTitle = `SEO title must not exceed ${CHARACTER_LIMITS.seoTitle} characters`;
    }

    if (formData.seoDescription && formData.seoDescription.length > CHARACTER_LIMITS.seoDescription) {
      errors.seoDescription = `SEO description must not exceed ${CHARACTER_LIMITS.seoDescription} characters`;
    }

    if (formData.seoKeywords && formData.seoKeywords.length > CHARACTER_LIMITS.seoKeywords) {
      errors.seoKeywords = `SEO keywords must not exceed ${CHARACTER_LIMITS.seoKeywords} characters`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    // Create FormData for file upload
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'parentId' && !formData[key]) return;
      if (key !== 'image' || (key === 'image' && formData[key])) {
        data.append(key, formData[key]);
      }
    });

    try {
      // Create new category
      const response = await axiosInstance.post('/api/categories', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Category created successfully!');
      router.push('/admin/product/categories');
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with breadcrumb navigation */}
        <div className="mb-8">
          <nav className="flex mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/admin" className="hover:text-gray-700">Dashboard</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/admin/product/categories" className="ml-2 hover:text-gray-700">Categories</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 font-medium text-blue-600">Create New</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Create New Category
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <Link href="/admin/product/categories" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </div>
        </div>

        {/* Main content */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Basic Details and SEO */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Basic Details</h2>
                <p className="mt-1 text-sm text-gray-500">Set the main information for this category</p>
              </div>

              <div className="px-6 py-4 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`block w-full rounded-lg border px-4 py-2 text-sm mt-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                      }`}
                    placeholder="Enter category name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:border-blue-400 transition-all duration-200"
                  >
                    <option value="">None (Top Level)</option>
                    {parentCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a parent category if this is a subcategory
                  </p>
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Current image preview */}
                    {imagePreview ? (
                      <div className="relative w-24 h-24 overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: null });
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        <span className="block text-center">
                          <Upload className="mx-auto h-8 w-8" />
                          <span className="mt-1 text-xs">No image</span>
                        </span>
                      </div>
                    )}

                    {/* Upload button */}
                    <div className="flex-1">
                      <label htmlFor="image-upload" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </label>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recommended size: 1200 x 800px. Max size: 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">SEO Information</h2>
                <p className="mt-1 text-sm text-gray-500">Optimize this category for search engines</p>
              </div>

              <div className="px-6 py-4 space-y-6">
                <div>
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border px-4 py-2 text-sm mt-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.seoTitle
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                      }`}
                    placeholder="Optimized title for search engines"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <span className={`text-xs ${formData.seoTitle.length > CHARACTER_LIMITS.seoTitle ? 'text-red-500' : 'text-gray-500'
                      }`}>
                      {formData.seoTitle.length}/{CHARACTER_LIMITS.seoTitle} characters
                    </span>
                    {formErrors.seoTitle && (
                      <span className="text-xs text-red-600">{formErrors.seoTitle}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    rows="3"
                    className={`block w-full rounded-lg border px-4 py-2 text-sm my-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.seoDescription
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                      }`}
                    placeholder="Brief description of this category for search results"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <span className={`text-xs ${formData.seoDescription.length > CHARACTER_LIMITS.seoDescription ? 'text-red-500' : 'text-gray-500'
                      }`}>
                      {formData.seoDescription.length}/{CHARACTER_LIMITS.seoDescription} characters
                    </span>
                    {formErrors.seoDescription && (
                      <span className="text-xs text-red-600">{formErrors.seoDescription}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    id="seoKeywords"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border px-4 py-2 text-sm my-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.seoKeywords
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                      }`}
                    placeholder="e.g. electronics, smartphones, accessories"
                  />
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Separate keywords with commas
                    </span>
                    {formErrors.seoKeywords && (
                      <span className="text-xs text-red-600">{formErrors.seoKeywords}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Settings and Preview */}
          <div className="space-y-6">
            {/* Publish Panel */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Publish</h2>
              </div>

              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="status"
                      id="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="status"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${formData.status ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${formData.status ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Create Category
                      </>
                    )}
                  </button>

                  <Link href="/admin/product/categories" className="mt-3 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Display Settings</h2>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="showProducts"
                      name="showProducts"
                      type="checkbox"
                      checked={formData.showProducts}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="showProducts" className="font-medium text-gray-700">
                      Show Products
                    </label>
                    <p className="text-gray-500">
                      Display products from this category on its page
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="storeMenu"
                      name="storeMenu"
                      type="checkbox"
                      checked={formData.storeMenu}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="storeMenu" className="font-medium text-gray-700">
                      Show in Store Menu
                    </label>
                    <p className="text-gray-500">
                      Add this category to the main navigation menu
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Preview</h2>
              </div>

              <div className="p-6">
                <div className="border rounded-lg overflow-hidden">
                  {/* Category header with image */}
                  <div className="relative bg-gray-100 h-32">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Category banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-sm">No image uploaded</span>
                      </div>
                    )}

                    {/* Category name overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end">
                      <h3 className="p-4 text-lg font-semibold text-white">
                        {formData.name || 'Category Name'}
                      </h3>
                    </div>
                  </div>

                  {/* Category details */}
                  <div className="p-4 bg-white border-t border-gray-200 space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formData.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {formData.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {formData.parentId && (
                      <div>
                        <span className="font-medium mr-2">Parent:</span>
                        <span className="text-gray-600">
                          {parentCategories.find(c => c.id === Number(formData.parentId))?.name || 'Loading...'}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="font-medium mr-2">Display:</span>
                      <span className="text-gray-600">
                        {formData.showProducts ? 'Shows products' : 'No products shown'}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium mr-2">Navigation:</span>
                      <span className="text-gray-600">
                        {formData.storeMenu ? 'In main menu' : 'Not in menu'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview info */}
                <div className="mt-4 flex items-start text-xs">
                  <Info className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-500">
                    This is a preview of how the category might appear on your site. The actual appearance may vary depending on your theme.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}