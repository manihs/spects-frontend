import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle } from 'lucide-react';

// Simple safe JSON parse function
const safeJsonParse = (jsonString, fallback = []) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return fallback;
  }
};

const ProductCard = ({ product }) => {
  const { data: session, status } = useSession();
  const { addItem, error, clearError, setAuthToken } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState('success');
  const [message, setMessage] = useState('');
  
  // Set auth token whenever session changes
  useEffect(() => {
    // Check if session exists and has an accessToken
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
      console.log("✅ Token set from session.accessToken");
    }
  }, [session, setAuthToken]);

  // Parse images if they exist and are in string format
  const productImages = product.images ? 
    (typeof product.images === 'string' ? safeJsonParse(product.images, []) : product.images) 
    : [];

  // Get first image or placeholder
  const mainImage = productImages.length > 0 ? 
    `${process.env.NEXT_PUBLIC_API_URL}${productImages[0]}` : 
    '/api/placeholder/300/300';

  // Calculate discount percentage
  const basePrice = parseFloat(product.basePrice);
  const offerPrice = parseFloat(product.offerPrice);
  const discountPercentage = offerPrice && basePrice ? 
    Math.round((basePrice - offerPrice) / basePrice * 100) : 0;

  // Clear any cart error when component unmounts or when displaying new messages
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

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

  const handleAddToCart = async () => {
    if (status !== 'authenticated') {
      // Redirect to login page if user is not logged in
      window.location.href = '/account/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    // For products without variants
    if (!product.variants || product.variants.length === 0) {
      setIsAdding(true);
      
      try {
        console.log("🔍 Adding simple product to cart with session token");
        
        // For non-variant products, we'll just use the product data directly
        const success = await addItem(
          product, 
          // Instead of creating a variant object, just pass product ID as null
          null, 
          1
        );
        
        if (success) {
          setMessageType('success');
          setMessage('Added to cart successfully!');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
        setMessageType('error');
        setMessage(err.message || 'Failed to add item to cart. Please try again.');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 relative">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{discountPercentage}% OFF
        </div>
      )}

      {/* Stock Status */}
      {product.stockStatus !== 'in_stock' && (
        <div className="absolute top-3 right-3 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          Out of Stock
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link 
            href={`/category/${product.category.slug}`}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium uppercase tracking-wide"
          >
            {product.category.name}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price - only shown when logged in */}
        {status === 'authenticated' ? (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${offerPrice || basePrice}
            </span>
            {offerPrice && basePrice && offerPrice < basePrice && (
              <span className="text-sm text-gray-500 line-through">
                ${basePrice}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-600">
            Sign in to view price
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mt-4">
          {product.variants && product.variants.length > 0 ? (
            <Link
              href={`/products/${product.slug}`}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              View Options
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stockStatus !== 'in_stock' || status !== 'authenticated'}
              className={`w-full py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 
                ${status !== 'authenticated'
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : isAdding || product.stockStatus !== 'in_stock'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {status !== 'authenticated'
                ? 'Login to Add' 
                : isAdding 
                  ? 'Adding...' 
                  : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>

      {/* Notification Message */}
      {showMessage && (
        <div className="absolute bottom-2 left-2 right-2 z-20">
          <div className={`
            ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'} 
            text-white py-2 px-4 rounded-lg text-center text-sm flex items-center justify-center gap-2
          `}>
            {messageType === 'success' && <CheckCircle className="w-4 h-4" />}
            {message}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;