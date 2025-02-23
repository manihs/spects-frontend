// app/product/[slug]/ProductDetail.js (Client component)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { ShoppingCart, Heart, Share2, ChevronRight, Star, ArrowLeft, ArrowRight, Truck, RotateCcw, Shield, Plus, Minus } from 'lucide-react';

export default function ProductDetail({ initialProduct, relatedProducts = [] }) {
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  
  // State for cart management
  const [variantQuantities, setVariantQuantities] = useState({});
  const [cartItems, setCartItems] = useState([]);
  
  // Initialize product and variants
  useEffect(() => {
    if (!product) return;
    
    // Set default selected variant
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    
    // Initialize quantity map for all variants
    if (product.variants) {
      const quantities = {};
      product.variants.forEach(variant => {
        quantities[variant.id] = 0;
      });
      setVariantQuantities(quantities);
    }
  }, [product]);
  
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
  
  // Parse the images or use placeholders
  const productImages = selectedVariant 
    ? JSON.parse(selectedVariant.images || '[]') 
    : JSON.parse(product.images || '[]');
  
  // Calculate discount percentage
  const basePrice = parseFloat(selectedVariant?.price || product.basePrice);
  const offerPrice = parseFloat(selectedVariant?.offerPrice || product.offerPrice);
  const discountPercentage = offerPrice && basePrice ? Math.round((basePrice - offerPrice) / basePrice * 100) : 0;
  
  // Handle quantity change for a specific variant
  const handleQuantityChange = (variantId, change) => {
    setVariantQuantities(prev => {
      const newQuantity = Math.max(0, (prev[variantId] || 0) + change);
      return { ...prev, [variantId]: newQuantity };
    });
  };
  
  // Add selected variants to cart
  const handleAddToCart = async () => {
    try {
      const itemsToAdd = Object.entries(variantQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([variantId, quantity]) => {
          const variant = product.variants.find(v => v.id === parseInt(variantId));
          return {
            productId: product.id,
            variantId: parseInt(variantId),
            quantity,
            price: variant?.offerPrice || variant?.price
          };
        });
      
      if (itemsToAdd.length === 0) {
        alert('Please select at least one variant and quantity');
        return;
      }
      
      // Example API call to add multiple items to cart
      const response = await axios.post('/api/cart/add-multiple', { items: itemsToAdd });
      
      if (response.data.success) {
        setCartItems([...cartItems, ...itemsToAdd]);
        
        // Reset quantities
        const resetQuantities = {};
        Object.keys(variantQuantities).forEach(key => {
          resetQuantities[key] = 0;
        });
        setVariantQuantities(resetQuantities);
        
        alert('Products added to cart successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add products to cart. Please try again.');
    }
  };
  
  // Helper function to get image URL or placeholder
  const getImageUrl = (imageArray, index = 0) => {
    if (!imageArray || imageArray.length === 0) {
      // Return placeholder
      return `/api/placeholder/400/400`;
    }
    return imageArray[index];
  };
  
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
            <Link href={`/category/${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name.charAt(0).toUpperCase() + product.category.name.slice(1)}
            </Link>
            <ChevronRight size={16} className="mx-1" />
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
                  <Image
                    src={getImageUrl(productImages, activeImage)}
                    alt={`${product.name} image ${activeImage + 1}`}
                    className="object-contain"
                    fill
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
                        <Image 
                          src={img || `/api/placeholder/80/80`}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="object-cover"
                          fill
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
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">4.0 (24 reviews)</span>
                </div>
                
                <div className="mt-4 flex items-baseline">
                  {offerPrice && offerPrice < basePrice ? (
                    <>
                      <span className="text-2xl font-bold text-gray-900">${offerPrice}</span>
                      <span className="ml-2 text-lg text-gray-500 line-through">${basePrice}</span>
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                        SAVE {discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">${basePrice}</span>
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
                        <span className="text-gray-600 capitalize">{attr.attribute.name}:</span>
                        <span className="text-gray-900 font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
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
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Variants</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            {product.variants && product.variants.length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variant
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
                      {product.variants.map(variant => {
                        const variantImages = JSON.parse(variant.images || '[]');
                        const variantPrice = variant.offerPrice || variant.price;
                        const quantity = variantQuantities[variant.id] || 0;
                        
                        // Get variant attributes for display
                        const variantAttrs = variant.attributes
                          .map(attr => `${attr.attribute.name}: ${attr.value}`)
                          .join(', ');
                        
                        return (
                          <tr key={variant.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-16 h-16 relative">
                                <Image
                                  src={getImageUrl(variantImages, 0)}
                                  alt={variant.name}
                                  fill
                                  className="object-cover rounded-md"
                                  sizes="64px"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                              <div className="text-sm text-gray-500">{variantAttrs}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {variant.sku}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">${variantPrice}</div>
                              {variant.offerPrice && variant.price && variant.offerPrice < variant.price && (
                                <div className="text-xs text-gray-500 line-through">${variant.price}</div>
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
                
                {/* Add to Cart Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Add Selected to Cart
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No variants available for this product.</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Section 3: Related Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => {
                const productImages = JSON.parse(relatedProduct.images || '[]');
                const price = relatedProduct.offerPrice || relatedProduct.basePrice;
                
                return (
                  <Link 
                    href={`/product/${relatedProduct.slug}`} 
                    key={relatedProduct.id}
                    className="group"
                  >
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 transition-shadow hover:shadow-md">
                      <div className="relative h-64 bg-gray-100">
                        <Image
                          src={getImageUrl(productImages, 0)}
                          alt={relatedProduct.name}
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="mt-1 text-gray-600 text-sm">{relatedProduct.category.name}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-bold text-gray-900">${price}</span>
                          {relatedProduct.offerPrice && relatedProduct.basePrice && relatedProduct.offerPrice < relatedProduct.basePrice && (
                            <span className="text-xs font-semibold text-white bg-red-500 rounded px-2 py-1">
                              SALE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No related products available.</p>
          )}
        </div>
      </section>
    </div>
  );
}