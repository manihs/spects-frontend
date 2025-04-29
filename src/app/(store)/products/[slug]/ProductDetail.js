'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Heart, Share2, ChevronRight, Star, ArrowLeft, ArrowRight, Truck, RotateCcw, Shield, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';

// Simple safe JSON parse function
const safeJsonParse = (jsonString, fallback = []) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : (jsonString || fallback);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return fallback;
  }
};

export default function ProductDetail({ initialProduct, relatedProducts = [] }) {
  const { data: session, status } = useSession();
  const { addItem, addMultipleItems, error, clearError, setAuthToken } = useCartStore();
  
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState('success');
  const [message, setMessage] = useState('');
  
  // State for cart management
  const [variantQuantities, setVariantQuantities] = useState({});
  
  // Set auth token whenever session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
      console.log("✅ Token set from session.accessToken in ProductDetail");
    }
  }, [session, setAuthToken]);
  
  // Initialize product and variants
  useEffect(() => {
    if (!product) return;
    
    // Set default selected variant
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    
    // Initialize quantity map for all variants and add parent product as "main variant"
    const quantities = {
      // Add parent product with ID 'main'
      'main': 0
    };
    
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        if (variant && variant.id) {
          quantities[variant.id] = 0;
        }
      });
    }
    
    setVariantQuantities(quantities);
  }, [product]);
  
  // Show error message if there's an error in the cart store
  useEffect(() => {
    if (error) {
      setMessageType('error');
      setMessage(error);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        if (clearError) clearError();
      }, 3000);
    }
  }, [error, clearError]);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-4">Product not found</p>
          <Link href="/products" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Get variant-specific images or use main product images
  const productImages = useMemo(() => {
    if (selectedVariant && selectedVariant.id) {
      // Try to use variant-specific images if available
      if (selectedVariant.images) {
        let variantImages = selectedVariant.images;
        try {
          if (typeof variantImages === 'string') {
            variantImages = JSON.parse(variantImages);
          }
          
          if (Array.isArray(variantImages) && variantImages.length > 0) {
            // If variant has a feature image, prioritize it
            if (selectedVariant.featureImage) {
              const featureImageExists = variantImages.includes(selectedVariant.featureImage);
              if (!featureImageExists) {
                return [selectedVariant.featureImage, ...variantImages];
              }
            }
            return variantImages;
          }
        } catch (e) {
          console.error('Error parsing variant images:', e);
        }
      } else if (selectedVariant.featureImage) {
        // If variant has only a feature image but no other images
        return [selectedVariant.featureImage];
      }
    }
    
    // Fall back to product images
    if (!product.images) return [];
    
    let images = product.images;
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        console.error('Failed to parse product images JSON:', e);
        return [];
      }
    }
    
    // Ensure images is an array
    if (!Array.isArray(images)) return [];
    
    // If feature image exists and is not already in the array, add it at the start
    if (product.featureImage) {
      const featureImageExists = images.includes(product.featureImage);
      if (!featureImageExists) {
        return [product.featureImage, ...images];
      }
    }
    
    return images;
  }, [product.images, product.featureImage, selectedVariant]);
  
  // Calculate discount percentage
  const basePrice = parseFloat(selectedVariant?.price || product.basePrice) || 0;
  const offerPrice = parseFloat(selectedVariant?.offerPrice || product.offerPrice) || 0;
  const discountPercentage = offerPrice && basePrice && offerPrice < basePrice 
    ? Math.round((basePrice - offerPrice) / basePrice * 100) 
    : 0;
  
  // Handle quantity change for a specific variant
  const handleQuantityChange = (variantId, change) => {
    if (!variantId) return;
    
    setVariantQuantities(prev => {
      const newQuantity = Math.max(0, (prev[variantId] || 0) + change);
      return { ...prev, [variantId]: newQuantity };
    });
  };
  
  // Add selected variants to cart
  const handleAddToCart = async () => {
    if (status !== 'authenticated') {
      // Redirect to login page if user is not logged in
      window.location.href = '/account/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check if any selections have been made
      const totalQuantity = Object.values(variantQuantities).reduce((sum, qty) => sum + qty, 0);
      
      if (totalQuantity === 0) {
        setMessageType('error');
        setMessage('Please select at least one variant and quantity');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
        setIsLoading(false);
        return;
      }
      
      // Get variants with quantities > 0, including the main product if selected
      const variantsToAdd = [];
      
      // Check if main product is selected
      if (variantQuantities['main'] > 0) {
        // Add the main product
        variantsToAdd.push({
          variant: null, // null indicates it's the main product
          quantity: variantQuantities['main']
        });
      }
      
      // Add variant products
      Object.entries(variantQuantities)
        .filter(([variantId, qty]) => variantId !== 'main' && qty > 0)
        .forEach(([variantId, quantity]) => {
          // Find the variant in the product
          const variant = product.variants?.find(v => v.id === parseInt(variantId) || v.id === variantId);
          if (!variant) return;
          
          variantsToAdd.push({ variant, quantity });
        });
      
      if (variantsToAdd.length === 0) {
        setMessageType('error');
        setMessage('Unable to add selected variants to cart');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
        setIsLoading(false);
        return;
      }
      
      // Process main product and variants separately
      const promises = [];
      
      // Process main product
      const mainProduct = variantsToAdd.find(item => item.variant === null);
      if (mainProduct) {
        promises.push(addItem(product, null, mainProduct.quantity));
      }
      
      // Process variant products
      const variantProducts = variantsToAdd.filter(item => item.variant !== null);
      if (variantProducts.length > 0) {
        promises.push(addMultipleItems(product, variantProducts));
      }
      
      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      const success = results.every(result => result === true);
      
      if (success) {
        // Reset quantities after successful addition
        const resetQuantities = { main: 0 };
        Object.keys(variantQuantities)
          .filter(key => key !== 'main')
          .forEach(key => {
            resetQuantities[key] = 0;
          });
        setVariantQuantities(resetQuantities);
        
        setMessageType('success');
        setMessage('Items added to cart successfully!');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setMessageType('error');
      setMessage(err.message || 'Failed to add items to cart. Please try again.');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding a simple product to cart
  const handleAddSimpleProduct = async () => {
    if (status !== 'authenticated') {
      window.location.href = '/account/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For products without variants, we'll add the base product
      const success = await addItem(product, null, 1);
      
      if (success) {
        setMessageType('success');
        setMessage('Added to cart successfully!');
      } else {
        setMessageType('error');
        setMessage('Failed to add to cart. Please try again.');
      }
      
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setMessageType('error');
      setMessage(err.message || 'Failed to add to cart. Please try again.');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get image URL or placeholder
  const getImageUrl = (images, index = 0) => {
    if (!images || !Array.isArray(images) || images.length === 0) return null;
    return images[index];
  };
  
  // Check if product has variants
  const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
  
  return (
    <div className="bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white py-2 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={16} className="mx-1" />
            <Link href="/products" className="hover:text-blue-600">Products</Link>
            <ChevronRight size={16} className="mx-1" />
            {product.category && (
              <>
                <Link href={`/category/${product.category.slug}`} className="hover:text-blue-600">
                  {product.category.name.charAt(0).toUpperCase() + product.category.name.slice(1)}
                </Link>
                <ChevronRight size={16} className="mx-1" />
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>
      
      {/* Section 1: Product Detail */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row -mx-4">
            {/* Product Images */}
            <div className="lg:w-1/2 px-4 mb-8 lg:mb-0">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96 md:h-[600px]">
                <div className="relative h-full">
                  <img
                    src={`${getImageUrl(productImages, activeImage)}`}
                    alt={`${product.name} image ${activeImage + 1}`}
                    className="object-contain"
                    // fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  
                  {/* Image Navigation */}
                  {productImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                        aria-label="Previous image"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setActiveImage((prev) => (prev + 1) % productImages.length)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                        aria-label="Next image"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex mt-4 space-x-2 overflow-x-auto py-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                        activeImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <img 
                          src={`${img}`}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="object-cover"
                          // fill
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="lg:w-1/2 px-4">
              <div className="pb-4 mb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    {/* {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />
                    ))} */}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">4.0 (24 reviews)</span>
                </div>
                
                <div className="mt-4 flex items-baseline">
                  {offerPrice && offerPrice < basePrice ? (
                    <>
                      <span className="">₹{offerPrice}</span>
                      <span className="ml-2 text-lg text-gray-500 line-through">₹{basePrice}</span>
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                        SAVE {discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">₹{basePrice}</span>
                  )}
                </div>
              </div>
              
              {/* Product Description */}
              <div className="pb-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Product Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Product Specifications */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.attributes.map((attr) => (
                      <div key={attr.id} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{attr.attribute?.name || 'Attribute'}:</span>
                        <span className="text-gray-900 font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add to cart for simple products */}
              {!hasVariants && (
                <div className="mt-6">
                  {status !== 'authenticated' ? (
                    <Link 
                      href={`/account/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                      className="w-full py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Login to Add to Cart
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddSimpleProduct}
                      disabled={isLoading || product.stockStatus !== 'in_stock'}
                      className={`w-full py-3 rounded-md transition flex items-center justify-center gap-2 ${
                        isLoading || product.stockStatus !== 'in_stock'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart size={20} />
                      {isLoading ? 'Adding...' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              )}
              
              {/* Shipping Information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Truck size={24} className="text-gray-600 mr-2" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-gray-600">Orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <RotateCcw size={24} className="text-gray-600 mr-2" />
                  <div>
                    <p className="font-medium">30 Days Return</p>
                    <p className="text-sm text-gray-600">Hassle-free returns</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shield size={24} className="text-gray-600 mr-2" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section 2: Variants and Add to Cart */}
      {hasVariants && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Options</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Option
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Add the main product as the first option */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 relative">
                          <img
                            src={`${getImageUrl(safeJsonParse(product.images, []), 0)}`}
                            alt={product.name || 'Main product'}
                            // fill
                            className="object-cover rounded-md"
                            sizes="64px"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name} (Main)</div>
                        <div className="text-sm text-gray-500">Base product</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {status === 'authenticated' ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">₹{parseFloat(product.offerPrice || product.basePrice)}</div>
                            {product.offerPrice && product.basePrice && parseFloat(product.offerPrice) < parseFloat(product.basePrice) && (
                              <div className="text-xs text-gray-500 line-through">₹{parseFloat(product.basePrice)}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">Login to view price</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stockStatus === 'in_stock' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange('main', -1)}
                            disabled={variantQuantities['main'] <= 0 || product.stockStatus !== 'in_stock'}
                            className={`p-1 rounded-l border border-gray-300 ${
                              variantQuantities['main'] <= 0 || product.stockStatus !== 'in_stock'
                                ? 'bg-gray-100 text-gray-400'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <Minus size={16} />
                          </button>
                          <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                            {variantQuantities['main'] || 0}
                          </div>
                          <button
                            onClick={() => handleQuantityChange('main', 1)}
                            disabled={product.stockStatus !== 'in_stock'}
                            className={`p-1 rounded-r border border-gray-300 ${
                              product.stockStatus !== 'in_stock'
                                ? 'bg-gray-100 text-gray-400'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Then add all variants */}
                    {product.variants.map(variant => {
                      if (!variant || !variant.id) return null;
                      
                      const variantImages = safeJsonParse(variant.images, []);
                      const variantPrice = parseFloat(variant.offerPrice || variant.price) || 0;
                      const quantity = variantQuantities[variant.id] || 0;
                      
                      // Get variant attributes for display
                      let variantAttrs = '';
                      
                      if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
                        variantAttrs = variant.attributes
                          .map(attr => {
                            if (!attr || !attr.attribute) return '';
                            return `${attr.attribute.name || 'Attribute'}: ${attr.value || ''}`;
                          })
                          .filter(Boolean)
                          .join(', ');
                      } else {
                        variantAttrs = variant.name || '';
                      }
                      
                      return (
                        <tr key={variant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-16 relative">
                              <img
                                src={getImageUrl(variantImages, 0)}
                                alt={variant.name || 'Product variant'}
                                className="object-cover rounded-md"
                                sizes="64px"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{variant.name || 'Variant'}</div>
                            <div className="text-sm text-gray-500">{variantAttrs}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {variant.sku || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {status === 'authenticated' ? (
                              <>
                                <div className="text-sm font-medium text-gray-900">₹{variantPrice}</div>
                                {variant.offerPrice && variant.price && parseFloat(variant.offerPrice) < parseFloat(variant.price) && (
                                  <div className="text-xs text-gray-500 line-through">₹{parseFloat(variant.price)}</div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-gray-600">Login to view price</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              variant.stockStatus === 'in_stock' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {variant.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuantityChange(variant.id, -1)}
                                disabled={quantity <= 0 || variant.stockStatus !== 'in_stock'}
                                className={`p-1 rounded-l border border-gray-300 ${
                                  quantity <= 0 || variant.stockStatus !== 'in_stock'
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <Minus size={16} />
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                                {quantity}
                              </div>
                              <button
                                onClick={() => handleQuantityChange(variant.id, 1)}
                                disabled={variant.stockStatus !== 'in_stock'}
                                className={`p-1 rounded-r border border-gray-300 ${
                                  variant.stockStatus !== 'in_stock'
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* 9619298813 */}
              {/* Add to Cart Button */}
              <div className="mt-6 flex justify-end">
                {status !== 'authenticated' ? (
                  <Link 
                    href={`/account/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                    className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Login to Add to Cart
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    {isLoading ? 'Adding...' : 'Add Selected to Cart'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Section 3: Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => {
                if (!relatedProduct) return null;
                
                const productImages = safeJsonParse(relatedProduct.images, []);
                const price = parseFloat(relatedProduct.offerPrice || relatedProduct.basePrice) || 0;
                
                return (
                  <Link 
                    href={`/products/${relatedProduct.slug}`} 
                    key={relatedProduct.id}
                    className="group"
                  >
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 transition-shadow hover:shadow-md">
                      <div className="relative h-64 bg-gray-100">
                        <img
                          src={`${getImageUrl(productImages, 0)}`}
                          alt={relatedProduct.name || 'Related product'}
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="mt-1 text-gray-600 text-sm">
                          {relatedProduct.category?.name || 'Category'}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          {status === 'authenticated' ? (
                            <>
                              <span className="font-bold text-gray-900">₹{price}</span>
                              {relatedProduct.offerPrice && relatedProduct.basePrice && 
                               parseFloat(relatedProduct.offerPrice) < parseFloat(relatedProduct.basePrice) && (
                                <span className="text-xs font-semibold text-white bg-red-500 rounded px-2 py-1">
                                  SALE
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-600">Login to view price</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
      
      {/* Notification Message */}
      {showMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`
            ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'} 
            text-white py-3 px-4 rounded-lg shadow-lg text-sm flex items-center gap-2 max-w-md
          `}>
            {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message}
          </div>
        </div>
      )}
    </div>
  );
}