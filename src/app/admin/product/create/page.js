'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import Link from 'next/link';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Save,
  Upload,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Trash2,
  Tag,
  Settings,
  ImageIcon,
  FileText,
  Package,
  Layers,
  ShoppingCart,
  Search,
  ListFilter,
  Sliders,
  MoreHorizontal,
  Copy
} from 'lucide-react';

export default function CreateProduct() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [attributesForGroups, setAttributesForGroups] = useState({});
  const [selectedAttributeGroup, setSelectedAttributeGroup] = useState('');
  const [productAttributes, setProductAttributes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Product variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [currentVariant, setCurrentVariant] = useState({
    sku: '',
    price: '',
    offerPrice: '',
    quantity: '',
    weight: '',
    attributes: []
  });

  // Basic form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    description: '',
    basePrice: '',
    offerPrice: '',
    weight: '',
    quantity: '0',
    status: 'active',
    visibility: 'visible',
    stockStatus: 'in_stock',
    slug: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch categories, attribute groups
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesResponse, attributeGroupsResponse] = await Promise.all([
          axiosInstance.get('/api/categories'),
          axiosInstance.get('/api/attributes/group/list')
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.categories);
        }

        if (attributeGroupsResponse.success) {
          setAttributeGroups(attributeGroupsResponse.data);
        }
      } catch (error) {
        toast.error('Failed to fetch initial data');
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-populate SEO title if empty when product name changes
  useEffect(() => {
    if (formData.name && !formData.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoTitle: prev.name
      }));
    }
    
    // Auto-populate slug if empty when product name changes
    if (formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  }, [formData.name]);

  // Handle attribute group selection and automatically add all attributes from the group
  const handleAttributeGroupChange = async (e) => {
    const groupId = e.target.value;
    setSelectedAttributeGroup(groupId);

    if (!groupId) {
      return;
    }

    // If we already fetched the attributes for this group, use them
    if (attributesForGroups[groupId]) {
      const attributes = attributesForGroups[groupId];
      replaceAttributesWithGroup(attributes);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/api/attributes/group/${groupId}`);

      if (response.success) {
        // Store attributes for this group
        setAttributesForGroups(prev => ({
          ...prev,
          [groupId]: response.data.attributes
        }));

        // Replace existing attributes with the new group's attributes
        replaceAttributesWithGroup(response.data.attributes);
      }
    } catch (error) {
      toast.error('Failed to fetch attributes for group');
      console.error('Error fetching attributes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to replace existing attributes with new ones from the group
  const replaceAttributesWithGroup = (attributes) => {
    const newAttributes = attributes.map(attribute => {
      let defaultValue = '';
      if (attribute.type === 'options' && attribute.options && attribute.options.length > 0) {
        defaultValue = attribute.options[0].value;
      } else if (attribute.type === 'multiple_select' && attribute.options && attribute.options.length > 0) {
        defaultValue = [attribute.options[0].value];
      }

      return {
        attributeId: attribute.id,
        name: attribute.name,
        type: attribute.type,
        value: defaultValue,
        options: attribute.options || []
      };
    });

    // Replace all existing attributes with the new ones
    setProductAttributes(newAttributes);
  };

  // Add a specific attribute to the variant attributes list
  const addAttributeToVariants = (attribute) => {
    if (!attribute || !attribute.attributeId) return;
    
    // Check if already in variant attributes
    if (variantAttributes.some(attr => attr.attributeId === attribute.attributeId)) {
      toast.info(`Attribute "${attribute.name}" is already a variant attribute`);
      return;
    }
    
    setVariantAttributes(prev => [...prev, attribute]);
    
    // Generate initial variants if this is the first variant attribute
    if (variantAttributes.length === 0 && attribute.options && attribute.options.length > 0) {
      const initialVariants = attribute.options.map(option => {
        const defaultSku = `${formData.sku}-${option.value.toLowerCase().replace(/\s+/g, '-')}`;
        
        return {
          sku: defaultSku,
          price: formData.basePrice,
          offerPrice: formData.offerPrice || '',
          quantity: formData.quantity || '0',
          weight: formData.weight || '',
          attributes: [{
            attributeId: attribute.attributeId,
            name: attribute.name,
            value: option.value
          }]
        };
      });
      
      setVariants(initialVariants);
    } else if (attribute.options && attribute.options.length > 0) {
      // Generate combinations with existing variants
      const newVariants = [];
      
      variants.forEach(variant => {
        attribute.options.forEach(option => {
          const newVariant = { ...variant };
          const newAttributes = [...newVariant.attributes];
          
          // Add the new attribute value
          newAttributes.push({
            attributeId: attribute.attributeId,
            name: attribute.name,
            value: option.value
          });
          
          // Create a new variant with combined attributes
          const combinedSku = `${formData.sku}-${newAttributes.map(attr => attr.value.toLowerCase().replace(/\s+/g, '-')).join('-')}`;
          
          newVariants.push({
            ...newVariant,
            sku: combinedSku,
            attributes: newAttributes
          });
        });
      });
      
      setVariants(newVariants);
    }
    
    // Enable variants mode
    setHasVariants(true);
  };

  // Remove attribute from variant attributes
  const removeVariantAttribute = (attributeId) => {
    setVariantAttributes(prev => prev.filter(attr => attr.attributeId !== attributeId));
    
    // Reset variants if no variant attributes remain
    if (variantAttributes.length <= 1) {
      setVariants([]);
      setHasVariants(false);
    } else {
      // Remove this attribute from all variants
      setVariants(prev => 
        prev.map(variant => ({
          ...variant,
          attributes: variant.attributes.filter(attr => attr.attributeId !== attributeId)
        }))
      );
      
      // Deduplicate variants after removing the attribute
      const uniqueVariants = [];
      const skuMap = new Map();
      
      variants.forEach(variant => {
        // Create a key based on remaining attributes
        const key = variant.attributes
          .filter(attr => attr.attributeId !== attributeId)
          .map(attr => `${attr.attributeId}:${attr.value}`)
          .sort()
          .join('|');
        
        if (!skuMap.has(key)) {
          skuMap.set(key, true);
          uniqueVariants.push({
            ...variant,
            attributes: variant.attributes.filter(attr => attr.attributeId !== attributeId)
          });
        }
      });
      
      setVariants(uniqueVariants);
    }
  };

  // Handle variant input change
  const handleVariantChange = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Remove a variant
  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Update attribute value
  const updateAttributeValue = (attributeId, value) => {
    setProductAttributes(productAttributes.map(attr => {
      if (attr.attributeId === attributeId) {
        return { ...attr, value };
      }
      return attr;
    }));
  };

  // Remove an attribute from the product
  const removeAttribute = (attributeId) => {
    setProductAttributes(productAttributes.filter(attr => attr.attributeId !== attributeId));
  };

  // Handle form input changes
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

  // Handle description change via React Quill
  const handleDescriptionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

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
      errors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required';
    }

    if (!formData.basePrice) {
      errors.basePrice = 'Base price is required';
    } else if (isNaN(formData.basePrice) || parseFloat(formData.basePrice) < 0) {
      errors.basePrice = 'Base price must be a positive number';
    }

    if (formData.offerPrice && (isNaN(formData.offerPrice) || parseFloat(formData.offerPrice) < 0)) {
      errors.offerPrice = 'Offer price must be a positive number';
    }

    if (formData.offerPrice && parseFloat(formData.offerPrice) >= parseFloat(formData.basePrice)) {
      errors.offerPrice = 'Offer price must be less than base price';
    }

    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) < 0)) {
      errors.weight = 'Weight must be a positive number';
    }

    if (formData.quantity && (isNaN(formData.quantity) || parseInt(formData.quantity) < 0)) {
      errors.quantity = 'Quantity must be a non-negative integer';
    }

    // Variant validation
    if (hasVariants && variants.length === 0) {
      errors.variants = 'At least one variant is required';
    }

    if (hasVariants) {
      variants.forEach((variant, index) => {
        if (!variant.sku) {
          errors[`variant_${index}_sku`] = 'Variant SKU is required';
        }
        if (!variant.price) {
          errors[`variant_${index}_price`] = 'Variant price is required';
        } else if (isNaN(variant.price) || parseFloat(variant.price) < 0) {
          errors[`variant_${index}_price`] = 'Variant price must be a positive number';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit for creating a product
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

      // Add product data
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Set hasVariants flag
      data.append('hasVariants', hasVariants);

      // Add attributes
      if (productAttributes.length > 0) {
        const formattedAttributes = productAttributes.map(attr => {
          // Format multiple_select type correctly
          let value = attr.value;
          if (attr.type === 'multiple_select' && Array.isArray(attr.value)) {
            value = JSON.stringify(attr.value);
          }

          return {
            attributeId: attr.attributeId,
            value: value
          };
        });

        data.append('attributes', JSON.stringify(formattedAttributes));
      }

      // Add variants if using them
      if (hasVariants && variants.length > 0) {
        const formattedVariants = variants.map(variant => {
          const variantAttributes = variant.attributes.map(attr => ({
            attributeId: attr.attributeId,
            value: attr.value
          }));

          return {
            sku: variant.sku,
            price: variant.price,
            offerPrice: variant.offerPrice || null,
            quantity: variant.quantity || 0,
            weight: variant.weight || null,
            attributes: variantAttributes
          };
        });

        data.append('variants', JSON.stringify(formattedVariants));
      }

      // Add images
      images.forEach(image => {
        data.append('images', image);
      });

      // Create product
      const response = await axiosInstance.post('/api/product', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Product created successfully!');
      router.push('/admin/product');
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render attribute input based on type
  const renderAttributeInput = (attribute) => {
    switch (attribute.type) {
      case 'text':
        return (
          <input
            type="text"
            value={attribute.value || ''}
            onChange={(e) => updateAttributeValue(attribute.attributeId, e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mt-3 shadow-sm"
          />
        );
      case 'desc':
        return (
          <textarea
            value={attribute.value || ''}
            onChange={(e) => updateAttributeValue(attribute.attributeId, e.target.value)}
            rows="3"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mt-3 shadow-sm"
          />
        );
      case 'options':
        return (
          <select
            value={attribute.value || ''}
            onChange={(e) => updateAttributeValue(attribute.attributeId, e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mt-3 shadow-sm"
          >
            <option value="">Select an option</option>
            {attribute.options.map(option => (
              <option key={option.id} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        );
      case 'multiple_select':
        return (
          <div className="mt-3 space-y-2">
            {attribute.options.map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`option-${option.id}`}
                  checked={(attribute.value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(attribute.value) ? [...attribute.value] : [];
                    if (e.target.checked) {
                      updateAttributeValue(attribute.attributeId, [...currentValues, option.value]);
                    } else {
                      updateAttributeValue(
                        attribute.attributeId,
                        currentValues.filter(v => v !== option.value)
                      );
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor={`option-${option.id}`} className="ml-2 block text-sm text-gray-700">
                  {option.value}
                </label>
              </div>
            ))}
          </div>
        );
      case 'custom_text_option':
        return (
          <input
            type="text"
            value={attribute.value || ''}
            onChange={(e) => updateAttributeValue(attribute.attributeId, e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mt-3 shadow-sm"
            placeholder="Enter custom value"
          />
        );
      default:
        return null;
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
                <Link href="/admin/product" className="ml-2 hover:text-gray-700">Products</Link>
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
              <Package className="h-6 w-6 text-blue-600" />
              Create New Product
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <Link href="/admin/product" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </div>

        {/* Two Column Product Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Tag className="mr-2 h-5 w-5 text-blue-600" />
                    Basic Information
                  </h2>
                </div>

                <div className="px-6 py-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name <span className="text-red-500">*</span>
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
                        placeholder="Enter product name"
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
                        placeholder="Enter product SKU"
                      />
                      {formErrors.sku && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {formErrors.sku}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Unique identifier for this product</p>
                    </div>

                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      >
                        <option value="">Select a Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="mt-1">
                      {/* Placeholder for ReactQuill */}
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange(e)}
                        rows="5"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                        placeholder="Enter product description"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                    Pricing
                  </h2>
                  {hasVariants && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">Variant pricing enabled</span>
                  )}
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Base Price <span className="text-red-500">*</span>
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
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Upload className="mr-2 h-4 w-4" />
                          Select Images
                          <input
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="ml-3 text-xs text-gray-500">
                          Upload product images (max 5MB each)
                        </p>
                      </div>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Images ({imagePreviews.length})</h3>
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

              {/* Attributes Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-blue-600" />
                    Product Attributes
                  </h2>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Attribute Group
                      </label>
                      <div className="flex flex-wrap gap-4 items-end mt-3">
                        <div className="w-full md:w-64">
                          <select
                            id="attributeGroup"
                            value={selectedAttributeGroup}
                            onChange={handleAttributeGroupChange}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm"
                          >
                            <option value="">Select Attribute Group</option>
                            {attributeGroups.map(group => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {productAttributes.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-semibold text-gray-700">Selected Attributes</h3>
                          
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setHasVariants(!hasVariants)}
                              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                                hasVariants 
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } transition-colors mr-2`}
                            >
                              {hasVariants ? 'Variants Enabled' : 'Enable Variants'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {productAttributes.map(attribute => (
                            <div key={attribute.attributeId} className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:border-blue-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900">{attribute.name}</h4>
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {attribute.type === 'text' && 'Text'}
                                    {attribute.type === 'desc' && 'Description'}
                                    {attribute.type === 'options' && 'Options'}
                                    {attribute.type === 'multiple_select' && 'Multiple Select'}
                                    {attribute.type === 'custom_text_option' && 'Custom Text'}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  {(attribute.type === 'options' || attribute.type === 'multiple_select') && (
                                    <button
                                      type="button"
                                      onClick={() => addAttributeToVariants(attribute)}
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                      title="Use as variant"
                                    >
                                      <ListFilter className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeAttribute(attribute.attributeId)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove attribute"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2">
                                {renderAttributeInput(attribute)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Variants Section - Only visible when variants are enabled */}
              {hasVariants && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Sliders className="mr-2 h-5 w-5 text-blue-600" />
                      Product Variants
                    </h2>
                    <span className="text-xs text-gray-500">
                      {variants.length} variant{variants.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="px-6 py-4">
                    {variantAttributes.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">
                          To create variants, click the <ListFilter className="h-4 w-4 inline" /> icon next to an attribute with options
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {variantAttributes.map(attr => (
                            <div key={attr.attributeId} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                              {attr.name}
                              <button
                                type="button"
                                onClick={() => removeVariantAttribute(attr.attributeId)}
                                className="ml-1.5 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {variants.length > 0 && (
                          <div className="mt-4 border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {variantAttributes.map(attr => (
                                    <th key={attr.attributeId} scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {attr.name}
                                    </th>
                                  ))}
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SKU
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sale Price
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                  </th>
                                  <th scope="col" className="relative px-3 py-2">
                                    <span className="sr-only">Actions</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {variants.map((variant, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    {/* Variant attribute values */}
                                    {variantAttributes.map(attr => {
                                      const attrValue = variant.attributes.find(a => a.attributeId === attr.attributeId);
                                      return (
                                        <td key={attr.attributeId} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                          {attrValue?.value || '-'}
                                        </td>
                                      );
                                    })}
                                    
                                    {/* SKU */}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <input
                                        type="text"
                                        value={variant.sku || ''}
                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                        className={`block w-full border px-2 py-1 text-xs rounded transition-all ${
                                          formErrors[`variant_${index}_sku`] 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        placeholder="SKU"
                                      />
                                    </td>
                                    
                                    {/* Price */}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={variant.price || ''}
                                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        className={`block w-full border px-2 py-1 text-xs rounded transition-all ${
                                          formErrors[`variant_${index}_price`] 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        placeholder="0.00"
                                      />
                                    </td>
                                    
                                    {/* Sale Price */}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={variant.offerPrice || ''}
                                        onChange={(e) => handleVariantChange(index, 'offerPrice', e.target.value)}
                                        className="block w-full border border-gray-300 px-2 py-1 text-xs rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                      />
                                    </td>
                                    
                                    {/* Stock */}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <input
                                        type="number"
                                        value={variant.quantity || ''}
                                        onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                        className="block w-full border border-gray-300 px-2 py-1 text-xs rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                      />
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        <button
                                          type="button"
                                          onClick={() => removeVariant(index)}
                                          className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Product Status Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-blue-600" />
                    Product Status
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Create Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Management Card */}
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

              {/* SEO Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Search className="mr-2 h-5 w-5 text-blue-600" />
                    SEO Settings
                  </h2>
                </div>
                <div className="p-6 space-y-4">
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
                      placeholder="product-url-slug"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated from name if left empty
                    </p>
                  </div>

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
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      placeholder="SEO Title"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      placeholder="SEO Description"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      id="seoKeywords"
                      name="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      placeholder="e.g. shirts, men's clothing, fashion"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate keywords with commas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}