import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';

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
  const { addItem, items, error, clearError, setAuthToken } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Check if product is in cart
  const isInCart = items.some(item => 
    item.productId === product.id && (!item.variantId || item.variantId === null)
  );
  
  // Set auth token whenever session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session, setAuthToken]);

  // Parse images if they exist and are in string format
  const productImages = product.images ? 
    (typeof product.images === 'string' ? safeJsonParse(product.images, []) : product.images) 
    : [];

  // Get first image or placeholder
  const mainImage = productImages.length > 0 ? 
    `${productImages[0]}` : 
    '/api/placeholder/300/300';

  // Calculate discount percentage
  const basePrice = parseFloat(product.basePrice);
  const offerPrice = parseFloat(product.offerPrice);
  const discountPercentage = offerPrice && basePrice ? 
    Math.round((basePrice - offerPrice) / basePrice * 100) : 0;

  // Clear any cart error when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  const handleAddToCart = async () => {
    if (status !== 'authenticated') {
      window.location.href = '/account/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      setIsAdding(true);
      
      try {
        await addItem(product, null, 1);
      } catch (err) {
        console.error('Error adding to cart:', err);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercentage}% OFF
        </div>
      )}

      {/* Stock Status */}
      {product.stockStatus !== 'in_stock' && (
        <div className="absolute top-3 right-3 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
          Out of Stock
        </div>
      )}

      {/* Product Image with Hover Effect */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <h3 className="mt-2 text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price - only shown when logged in */}
        {status === 'authenticated' ? (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{offerPrice || basePrice}
            </span>
            {offerPrice != null && basePrice && offerPrice < basePrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{basePrice}
            </span>
          )}
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-600">
            Login to view price
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mt-4">
          {product.variants && product.variants.length > 0 ? (
            <Link
              href={`/products/${product.slug}`}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              View Product
            </Link>
          ) : (
            <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stockStatus !== 'in_stock' || status !== 'authenticated' || isInCart}
            className={`w-full py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 font-medium
              ${status !== 'authenticated'
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : isInCart
                  ? 'bg-blue-500 text-blue-100 cursor-not-allowed'
                  : isAdding || product.stockStatus !== 'in_stock'
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            <>
              {status !== 'authenticated' ? (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Login to Add
                </>
              ) : isInCart ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Added in Cart
                </>
              ) : isAdding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </>
          </button>
          
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;