'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Save,
  Upload,
  DollarSign,
  Trash2,
  Tag,
  Package,
  ShoppingCart,
  Settings,
  ImageIcon,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AddProductVariant() {
  const params = useParams();
  const productId = params.id;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Parent product data
  const [parentProduct, setParentProduct] = useState(null);
  
  // Variant attributes from parent product
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [optionAttributes, setOptionAttributes] = useState([]);

  // Product images state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [featureImage, setFeatureImage] = useState(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);

  // Variant form data
  const [formData, setFormData] = useState({
    name: '',
    productId: productId,
    sku: '',
    basePrice: '',
    offerPrice: '',
    quantity: '0',
    weight: '',
    description: '',
    status: 'active',
    visibility: 'visible',
    stockStatus: 'in_stock',
    slug: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  // Variant attributes state
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const fileInputRef = useRef(null);

  // Fetch parent product data including attributes
  useEffect(() => {
    const fetchParentProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/product/${productId}`);
        
        if (response.success && response.data) {
          setParentProduct(response.data);
          
          // Initialize variant form with some parent product data
          setFormData(prev => ({
            ...prev,
            name: response.data.name,
            basePrice: response.data.basePrice,
            offerPrice: response.data.offerPrice || '',
            weight: response.data.weight || '',
            description: response.data.description || '',
            sku: `${response.data.sku}-V${Date.now().toString().slice(-4)}`,
            slug: `${response.data.slug}-variant-${Date.now().toString().slice(-4)}`
          }));
          
          // Process product attributes for variants
          if (response.data.attributes && response.data.attributes.length > 0) {
            const allAttributes = response.data.attributes.map(attr => ({
              attributeId: attr.attribute.id,
              name: attr.attribute.name,
              type: attr.attribute.type,
              options: attr.attribute.options || [],
              value: attr.value
            }));
            
            // Filter only attributes that have options (for variants)
            const variantAttrTypes = ['options', 'multiple_select'];
            const attrWithOptions = allAttributes.filter(attr => 
              variantAttrTypes.includes(attr.type) && attr.options && attr.options.length > 0
            );
            
            setAvailableAttributes(allAttributes);
            setOptionAttributes(attrWithOptions);
            
            // Initialize with first attribute if available
            if (attrWithOptions.length > 0) {
              const initialAttribute = {
                attributeId: attrWithOptions[0].attributeId,
                name: attrWithOptions[0].name,
                value: attrWithOptions[0].options[0]?.value || '',
                options: attrWithOptions[0].options
              };
              
              setSelectedAttributes([initialAttribute]);
            }
          }
        } else {
          toast.error('Failed to load parent product data');
          router.push('/admin/product');
        }
      } catch (error) {
        console.error('Error fetching parent product:', error);
        toast.error('Error loading parent product data');
        router.push('/admin/product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchParentProduct();
    }
  }, [productId, router]);

  // Auto-populate SEO title if empty when product name changes
  useEffect(() => {
    if (formData.name && !formData.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoTitle: prev.name
      }));
    }
    
    // Auto-generate slug
    if (formData.name && !formData.slug) {
      const baseSlug = parentProduct?.slug || '';
      
      let variantSpecificPart = '';
      if (selectedAttributes.length > 0) {
        variantSpecificPart = selectedAttributes
          .map(attr => attr.value.toLowerCase().replace(/\s+/g, '-'))
          .join('-');
      }
      
      const uniqueSuffix = Date.now().toString().slice(-4);
      
      setFormData(prev => ({
        ...prev,
        slug: `${baseSlug}-${variantSpecificPart || 'variant'}-${uniqueSuffix}`.replace(/--+/g, '-')
      }));
    }
    
    // Auto-generate SKU
    if (formData.name && parentProduct && parentProduct.sku) {
      let variantPart = '';
      if (selectedAttributes.length > 0) {
        variantPart = selectedAttributes
          .map(attr => attr.value.replace(/\s+/g, '').substring(0, 3).toUpperCase())
          .join('-');
      }
      
      setFormData(prev => ({
        ...prev,
        sku: `${parentProduct.sku}-${variantPart || 'V'}${Date.now().toString().slice(-3)}`
      }));
    }
  }, [formData.name, selectedAttributes, parentProduct]);

  // Handle attribute selection change
  const handleAttributeChange = (index, attributeId, value) => {
    setSelectedAttributes(prev => {
      const updated = [...prev];
      
      // Find the attribute in the options array
      const attribute = optionAttributes.find(attr => attr.attributeId === attributeId);
      
      if (attribute) {
        updated[index] = {
          attributeId: attribute.attributeId,
          name: attribute.name,
          value: value,
          options: attribute.options
        };
      }
      
      return updated;
    });
  };

  // Add a new attribute to the variant
  const addAttribute = (attributeId) => {
    // Find the attribute in available options
    const attribute = optionAttributes.find(attr => attr.attributeId === attributeId);
    
    if (!attribute) return;
    
    // Check if already selected
    const isAlreadySelected = selectedAttributes.some(attr => attr.attributeId === attributeId);
    
    if (isAlreadySelected) {
      toast.info(`Attribute "${attribute.name}" is already selected`);
      return;
    }
    
    // Add with default first value
    setSelectedAttributes(prev => [
      ...prev,
      {
        attributeId: attribute.attributeId,
        name: attribute.name,
        value: attribute.options[0]?.value || '',
        options: attribute.options
      }
    ]);
  };

  // Remove an attribute from the variant
  const removeAttribute = (index) => {
    setSelectedAttributes(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form input change
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if adding these images would exceed the limit of 4
    const totalImagesAfterUpload = images.length + files.length;
    if (totalImagesAfterUpload > 4) {
      toast.error(`You can upload a maximum of 4 images. You already have ${images.length} images.`);
      return;
    }

    // Validate file sizes
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit

    if (validFiles.length < files.length) {
      toast.error('Some files exceeded the 5MB size limit and were excluded');
    }

    if (validFiles.length === 0) return;

    // Add new files to existing ones
    setImages([...images, ...validFiles]);

    // Generate and set image previews
    const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newImagePreviews]);
  };

  // Handle feature image upload
  const handleFeatureImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeded the 5MB size limit');
      return;
    }

    // Revoke previous object URL to prevent memory leaks
    if (featureImagePreview) {
      URL.revokeObjectURL(featureImagePreview);
    }

    setFeatureImage(file);
    setFeatureImagePreview(URL.createObjectURL(file));
  };

  // Remove feature image
  const removeFeatureImage = () => {
    if (featureImagePreview) {
      URL.revokeObjectURL(featureImagePreview);
    }
    setFeatureImage(null);
    setFeatureImagePreview(null);
  };

  // Remove image preview
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    URL.revokeObjectURL(newPreviews[index]); // Free up memory
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Variant name is required';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required';
    }

    if (!formData.basePrice) {
      errors.basePrice = 'Price is required';
    } else if (isNaN(formData.basePrice) || parseFloat(formData.basePrice) < 0) {
      errors.basePrice = 'Price must be a positive number';
    }

    if (formData.offerPrice && (isNaN(formData.offerPrice) || parseFloat(formData.offerPrice) < 0)) {
      errors.offerPrice = 'Offer price must be a positive number';
    }

    if (formData.offerPrice && parseFloat(formData.offerPrice) >= parseFloat(formData.basePrice)) {
      errors.offerPrice = 'Offer price must be less than regular price';
    }

    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) < 0)) {
      errors.weight = 'Weight must be a positive number';
    }

    if (formData.quantity && (isNaN(formData.quantity) || parseInt(formData.quantity) < 0)) {
      errors.quantity = 'Quantity must be a non-negative integer';
    }

    if (selectedAttributes.length === 0) {
      errors.attributes = 'At least one attribute must be selected for a variant';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const data = new FormData();

      // Add variant data
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Add attributes
      if (selectedAttributes.length > 0) {
        const formattedAttributes = selectedAttributes.map(attr => ({
          attributeId: attr.attributeId,
          value: attr.value
        }));

        data.append('attributes', JSON.stringify(formattedAttributes));
      }

      // Add images
      images.forEach(image => {
        data.append('images', image);
      });

      // Add feature image if exists
      if (featureImage) {
        data.append('featureImage', featureImage);
      }

      // Create variant
      const response = await axiosInstance.post('/api/productVariant', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Variant created successfully!');
      router.push(`/admin/product/${productId}/variants`);
    } catch (error) {
      toast.error(error.message || 'An error occurred while creating the variant');
      console.error('Error creating variant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/admin" className="hover:text-gray-700">Dashboard</Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link href="/admin/product" className="ml-2 hover:text-gray-700">Products</Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link href={`/admin/product/${productId}`} className="ml-2 hover:text-gray-700">
                  {isLoading ? 'Product' : parentProduct?.name}
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link href={`/admin/product/${productId}/variants`} className="ml-2 hover:text-gray-700">
                  Variants
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="ml-2 font-medium text-blue-600">Add Variant</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Layers className="h-6 w-6 text-blue-600" />
              {isLoading ? 'Loading...' : `Add Variant to ${parentProduct?.name}`}
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <Link
              href={`/admin/product/${productId}/variants`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Variants
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg text-gray-600">Loading product data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Tag className="mr-2 h-5 w-5 text-blue-600" />
                      Variant Information
                    </h2>
                  </div>

                  <div className="px-6 py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Variant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.name
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                            }`}
                          placeholder="Enter variant name"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="sku"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          required
                          className={`block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.sku
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                            }`}
                          placeholder="Enter variant SKU"
                        />
                        {formErrors.sku && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            {formErrors.sku}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Unique identifier for this variant</p>
                      </div>

                      <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                          URL Slug
                        </label>
                        <input
                          type="text"
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                          placeholder="variant-url-slug"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Auto-generated from variant attributes if left empty
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                          placeholder="Enter variant-specific description (optional)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variant Attributes Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Layers className="mr-2 h-5 w-5 text-blue-600" />
                      Variant Attributes
                    </h2>
                  </div>

                  <div className="px-6 py-4 space-y-6">
                    {formErrors.attributes && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex items-center">
                          <X className="h-5 w-5 text-red-400 mr-2" />
                          <p className="text-sm text-red-600">{formErrors.attributes}</p>
                        </div>
                      </div>
                    )}

                    {optionAttributes.length === 0 ? (
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <p className="text-sm text-yellow-700">
                          No attributes with options found in the parent product. 
                          Add option-type attributes to the product first before creating variants.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="border-b border-gray-200 pb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Add Attribute to Variant
                          </label>
                          <div className="flex flex-wrap gap-4 items-end mt-3">
                            <div className="w-full md:w-64">
                              <select
                                id="attributeToAdd"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm"
                                onChange={(e) => addAttribute(e.target.value)}
                                value=""
                              >
                                <option value="" disabled>Select an attribute to add</option>
                                {optionAttributes.map(attr => (
                                  <option key={attr.attributeId} value={attr.attributeId} disabled={selectedAttributes.some(a => a.attributeId === attr.attributeId)}>
                                    {attr.name} {selectedAttributes.some(a => a.attributeId === attr.attributeId) ? '(Added)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {selectedAttributes.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Selected Attributes</h3>
                            <div className="space-y-4">
                              {selectedAttributes.map((attr, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:border-blue-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                      <h4 className="text-sm font-medium text-gray-900">{attr.name}</h4>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeAttribute(index)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                      title="Remove attribute"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="mt-2">
                                    <select
                                      value={attr.value || ''}
                                      onChange={(e) => handleAttributeChange(index, attr.attributeId, e.target.value)}
                                      className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm"
                                    >
                                      <option value="" disabled>Select {attr.name}</option>
                                      {attr.options.map(option => (
                                        <option key={option.id} value={option.value}>
                                          {option.value}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Feature Image Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5 text-blue-600" />
                            Feature Image
                        </h2>
                    </div>

                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Feature Image
                                </label>
                                <div className="mt-1 flex items-center">
                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Select Feature Image
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleFeatureImageUpload}
                                        />
                                    </label>
                                    <p className="ml-3 text-xs text-gray-500">
                                        This will be displayed as the main product image (max 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Show feature image preview */}
                            {featureImagePreview && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Feature Image</h3>
                                    <div className="relative group max-w-md">
                                        <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-md bg-gray-200 transition-all border border-gray-200 group-hover:border-blue-400">
                                            <img
                                                src={featureImagePreview}
                                                alt="Feature image preview"
                                                className="h-full w-full object-cover object-center"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={removeFeatureImage}
                                                    className="opacity-0 group-hover:opacity-100 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white p-1 text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <span className="sr-only">Remove feature image</span>
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5 text-blue-600" />
                            Product Images
                        </h2>
                    </div>

                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Images
                                </label>
                                <div className="mt-1 flex items-center">
                                    <label className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Select Images
                                        <input
                                            type="file"
                                            className="sr-only"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            ref={fileInputRef}
                                            disabled={images.length >= 4}
                                        />
                                    </label>
                                    <p className="ml-3 text-xs text-gray-500">
                                        Upload product images (max 4 images, 5MB each)
                                    </p>
                                </div>
                            </div>

                            {/* Image previews */}
                            {imagePreviews.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Images ({imagePreviews.length}/4)</h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 transition-all border border-gray-200 group-hover:border-blue-400">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index}`}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="opacity-0 group-hover:opacity-100 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white p-1 text-gray-400 hover:text-red-500 transition-all"
                                                        >
                                                            <span className="sr-only">Remove image</span>
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-6">
                {/* Pricing Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                      Pricing
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Variant Price <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          id="basePrice"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className={`block w-full rounded-lg border pl-10 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.basePrice
                           
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                            }`}
                          placeholder="0.00"
                        />
                      </div>
                      {formErrors.basePrice && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {formErrors.basePrice}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          id="offerPrice"
                          name="offerPrice"
                          value={formData.offerPrice}
                          onChange={handleInputChange}
                          min="0"
                          className={`block w-full rounded-lg border pl-10 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.offerPrice
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                            }`}
                          placeholder="0.00"
                        />
                      </div>
                      {formErrors.offerPrice && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {formErrors.offerPrice}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Leave empty if no special offer price</p>
                    </div>
                  </div>
                </div>

                {/* Inventory Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
                      Inventory
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.quantity
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                          }`}
                      />
                      {formErrors.quantity && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {formErrors.quantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Status
                      </label>
                      <select
                        id="stockStatus"
                        name="stockStatus"
                        value={formData.stockStatus}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="backorder">Backorder</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="0"
                        className={`block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.weight
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                          }`}
                        placeholder="0.00"
                      />
                      {formErrors.weight && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {formErrors.weight}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Settings className="mr-2 h-5 w-5 text-blue-600" />
                      Variant Status
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      >
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                            Creating Variant...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-5 w-5" />
                            Create Variant
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Parent Product Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Package className="mr-2 h-5 w-5 text-blue-600" />
                      Parent Product
                    </h2>
                  </div>
                  {parentProduct && (
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0">
                          {parentProduct.images && parentProduct.images.length > 0 ? (
                            <img
                              className="h-16 w-16 rounded-md object-cover"
                              src={parentProduct.images[0]}
                              alt={parentProduct.name}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{parentProduct.name}</h3>
                          <p className="text-sm text-gray-500">SKU: {parentProduct.sku}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Base Price: ${parseFloat(parentProduct.basePrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      {parentProduct.variants && parentProduct.variants.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Existing Variants: {parentProduct.variants.length}
                          </h4>
                          <div className="mt-1 text-sm text-gray-600">
                            This product already has {parentProduct.variants.length} variant(s).
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}