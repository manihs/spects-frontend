'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Layers,
  DollarSign,
  Tag,
  ChevronRight,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

// Simple safe JSON parse function
const safeJsonParse = (input, fallback = []) => {
  // If input is already an array, return it
  if (Array.isArray(input)) {
    return input;
  }
  
  // If input is null or undefined, return fallback
  if (input == null) {
    return fallback;
  }
  
  // If input is a string, try to parse it
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return fallback;
    }
  }
  
  // For any other type, return fallback
  return fallback;
};

export default function ProductVariantsManager() {
  const params = useParams();
  const productId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch product and variants
  useEffect(() => {
    const fetchProductAndVariants = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/product/${productId}`);
        
        if (response.success && response.data) {
          setProduct(response.data);
          
          // Extract variants from the product data
          if (response.data.variants && Array.isArray(response.data.variants)) {
            setVariants(response.data.variants);
          }
        } else {
          toast.error('Failed to load product data');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        toast.error('Error loading product data');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductAndVariants();
    }
  }, [productId]);

  // Handle variant deletion
  const deleteVariant = async (variantId) => {
    try {
      setIsDeleting(true);
      const response = await axiosInstance.delete(`/api/productVariant/${variantId}`);
      
      if (response.success) {
        toast.success('Variant deleted successfully');
        // Update variants list
        setVariants(variants.filter(variant => variant.id !== variantId));
        
        // If this was the last variant, update product hasVariants flag
        if (variants.length <= 1) {
          // Refresh product data
          const productResponse = await axiosInstance.get(`/api/product/${productId}`);
          if (productResponse.success) {
            setProduct(productResponse.data);
          }
        }
      } else {
        toast.error('Failed to delete variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Error deleting variant');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedVariant(null);
    }
  };

  // Get variant attributes display
  const getVariantAttributesDisplay = (variant) => {
    if (!variant.attributes || variant.attributes.length === 0) {
      return 'No attributes';
    }
    
    return variant.attributes
      .map(attr => `${attr.attribute?.name || 'Attribute'}: ${attr.value}`)
      .join(', ');
  };

  // Delete confirmation modal
  const DeleteModal = () => (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Variant</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this variant? This action cannot be undone.
                  </p>
                  {selectedVariant && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900">{selectedVariant.name}</p>
                      <p className="text-xs text-gray-500">SKU: {selectedVariant.sku}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getVariantAttributesDisplay(selectedVariant)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => selectedVariant && deleteVariant(selectedVariant.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                <span className="ml-2 font-medium text-blue-600">
                  {isLoading ? 'Product Variants' : product?.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Layers className="h-6 w-6 text-blue-600" />
              {isLoading ? 'Loading...' : `${product?.name} - Variants`}
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <div className="flex space-x-3">
              <Link
                href="/admin/product"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
              <Link
                href={`/admin/product/${productId}/variants/add`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Link>
            </div>
          </div>
        </div>

        {/* Product Info Card */}
        {!isLoading && product && (
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="mr-2 h-5 w-5 text-blue-600" />
                Product Information
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-16 w-16">
                      {product.images && safeJsonParse(product.images).length > 0 ? (
                        <img
                          className="h-16 w-16 rounded-md object-cover"
                          src={safeJsonParse(product.images)[0]}
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      <div className="mt-2 flex items-center">
                      ₹
                        <span className="text-sm font-medium text-gray-900">
                          {parseFloat(product.basePrice).toFixed(2)}
                        </span>
                        {product.offerPrice && (
                          <span className="ml-2 text-sm text-green-600">
                            Sale: ${parseFloat(product.offerPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col h-full justify-center">
                    <div className="flex items-center mb-2">
                      <ShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Stock: {product.quantity} units
                      </span>
                    </div>
                    {product.category && (
                      <div className="flex items-center mb-2">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          Category: {product.category.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Variants: {variants.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/admin/product/edit/${productId}`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="mr-1.5 h-4 w-4" />
                  Edit Product
                </Link>
                <Link
                  href={`/admin/product/${productId}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  View Product
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Variants List */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-blue-600" />
              Product Variants
            </h2>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-lg text-gray-600">Loading variants...</span>
            </div>
          ) : variants.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Variants Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                This product doesn't have any variants yet. Add variants to offer different options like sizes, colors, or materials.
              </p>
              <Link
                href={`/admin/product/${productId}/variants/add`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Variant
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attributes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {variant.images && safeJsonParse(variant.images).length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={safeJsonParse(variant.images)[0]}
                                alt={variant.name}
                              />
                            ) : variant.featureImage ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={variant.featureImage}
                                alt={variant.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                            <div className="text-sm text-gray-500">SKU: {variant.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getVariantAttributesDisplay(variant)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                        ₹ {parseFloat(variant.basePrice).toFixed(2)}
                        </div>
                        {variant.offerPrice && (
                          <div className="text-xs text-green-600">
                            Sale: ${parseFloat(variant.offerPrice).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{variant.quantity || 0}</div>
                        <div className="text-xs text-gray-500">{variant.stockStatus}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          variant.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {variant.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/product/${productId}/variants/${variant.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/admin/product/${productId}/variants/${variant.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedVariant(variant);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
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

        {/* Render delete confirmation modal when needed */}
        {showDeleteModal && <DeleteModal />}
      </div>
    </div>
  );
}