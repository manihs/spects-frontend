'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import Link from 'next/link';
import {
  Loader2, ArrowLeft, Upload, Save, X, Check,
  Info, AlertTriangle, ChevronRight, Eye, Trash2
} from 'lucide-react';

export default function EditCategory() {
  const params = useParams();
  const categoryId = params.id;
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

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
    // Compare current formData with originalData to detect changes
    if (originalData) {
      const hasChanged = Object.keys(formData).some(key => {
        // Skip comparing image since it's a file object and needs special handling
        if (key === 'image') return false;
        return formData[key] !== originalData[key];
      });

      setHasChanges(hasChanged || formData.image !== undefined);
    }
  }, [formData, originalData]);

  // In the useEffect where we fetch the category data
  useEffect(() => {
    // Fetch parent categories and category data in parallel
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch both parent categories and category data concurrently
        const [categoriesResponse, categoryResponse] = await Promise.all([
          axiosInstance.get('/api/categories', { params: { limit: 100 } }),
          axiosInstance.get(`/api/categories/${categoryId}`)
        ]);

        // Process parent categories
        if (categoriesResponse.success) {
          setParentCategories(categoriesResponse.data.categories);
        }

        // Process category data
        if (categoryResponse.success) {
          const category = categoryResponse.data;

          // Set form data
          const initialData = {
            name: category.name || '',
            parentId: category.parentId || '',
            status: category.status ?? true,
            showProducts: category.showProducts ?? false,
            storeMenu: category.storeMenu ?? false,
            seoTitle: category.seoTitle || '',
            seoDescription: category.seoDescription || '',
            seoKeywords: category.seoKeywords || '',
          };

          setFormData(initialData);
          setOriginalData(initialData);

          // Set image preview if exists - Fix for image preview
          // Check for both image and bannerImage fields as some APIs may use different field names
          if (category.image) {
            // Make sure we have the full URL with the API base URL
            const imageUrl = category.image.startsWith('http')
              ? category.image
              : `${process.env.NEXT_PUBLIC_API_URL || ''}${category.image}`;

            setImagePreview(imageUrl);
            console.log('Setting image preview to:', imageUrl);
          } else if (category.bannerImage) {
            // Alternative field name for image
            const imageUrl = category.bannerImage.startsWith('http')
              ? category.bannerImage
              : `${process.env.NEXT_PUBLIC_API_URL || ''}${category.bannerImage}`;

            setImagePreview(imageUrl);
            console.log('Setting banner image preview to:', imageUrl);
          }
        }
      } catch (error) {
        toast.error('Failed to load category data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Clear error when field is being edited
    setFormErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

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

    // Prevent setting own parent
    if (formData.parentId && formData.parentId === categoryId) {
      errors.parentId = 'A category cannot be its own parent';
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

    setIsSaving(true);

    // Create FormData for file upload
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'parentId' && !formData[key]) return;
      if (key !== 'image' || (key === 'image' && formData[key])) {
        data.append(key, formData[key]);
      }
    });

    try {
      // Update category
      const response = await axiosInstance.put(`/api/categories/${categoryId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        toast.success('Category updated successfully!');

        // Update original data to reflect the current state
        setOriginalData({ ...formData });

        // Clear the image field since it's been uploaded
        if (formData.image) {
          setFormData(prev => ({ ...prev, image: undefined }));
        }

        setHasChanges(false);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      console.error('Error updating category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${formData.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.delete(`/api/categories/${categoryId}`);

      if (response.success) {
        toast.success('Category deleted successfully');
        router.push('/admin/product/categories');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
      console.error('Error deleting category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/admin/product/categories');
      }
    } else {
      router.push('/admin/product/categories');
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
                <span className="ml-2 font-medium text-blue-600">Edit Category</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {isLoading ? 'Loading Category...' : `Edit Category: ${formData.name}`}
              {(isLoading || isSaving) && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <div className="flex gap-3">
              <Link
                href={`/category/${originalData?.slug || ''}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Category
              </Link>
              <Link
                href="/admin/product/categories"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading category data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column: Basic Details and SEO */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Basic Details</h2>
                  <p className="mt-1 text-sm text-gray-500">Update the primary information for this category</p>
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
                      className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.parentId
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                        }`}
                    >
                      <option value="">None (Top Level)</option>
                      {parentCategories
                        .filter(category => category.id !== Number(categoryId))
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      }
                    </select>
                    {formErrors.parentId ? (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.parentId}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Select a parent category if this is a subcategory
                      </p>
                    )}
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
                    <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                      <span>SEO Title</span>
                      <span className={`text-xs ${formData.seoTitle.length > CHARACTER_LIMITS.seoTitle
                          ? 'text-red-500'
                          : 'text-gray-500'
                        }`}>
                        {formData.seoTitle.length}/{CHARACTER_LIMITS.seoTitle} characters
                      </span>
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
                    {formErrors.seoTitle && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.seoTitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                      <span>SEO Description</span>
                      <span className={`text-xs ${formData.seoDescription.length > CHARACTER_LIMITS.seoDescription
                          ? 'text-red-500'
                          : 'text-gray-500'
                        }`}>
                        {formData.seoDescription.length}/{CHARACTER_LIMITS.seoDescription} characters
                      </span>
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
                    {formErrors.seoDescription && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.seoDescription}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                      <span>SEO Keywords</span>
                      <span className={`text-xs ${formData.seoKeywords.length > CHARACTER_LIMITS.seoKeywords
                          ? 'text-red-500'
                          : 'text-gray-500'
                        }`}>
                        {formData.seoKeywords.length}/{CHARACTER_LIMITS.seoKeywords} characters
                      </span>
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
                    {formErrors.seoKeywords && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.seoKeywords}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Separate keywords with commas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Settings and Actions */}
            <div className="space-y-6">
              {/* Status & Actions Panel */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Status & Actions</h2>
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

                  <div className="py-3">
                    <div className={`rounded-md p-3 ${formData.status ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {formData.status ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <Info className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm ${formData.status ? 'text-green-700' : 'text-gray-700'}`}>
                            {formData.status
                              ? 'This category is active and visible to customers.'
                              : 'This category is inactive and hidden from customers.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSaving || (!hasChanges && !formData.image)}
                      className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="mt-3 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
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

              {/* Danger Zone */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                  <h2 className="text-lg font-medium text-red-700">Danger Zone</h2>
                </div>

                <div className="px-6 py-4">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Category
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    This will permanently delete this category. Products will not be deleted but will no longer be associated with this category.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}