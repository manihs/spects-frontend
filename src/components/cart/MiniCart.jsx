// components/cart/MiniCart.jsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function MiniCart({ onClose }) {
  const { 
    items, 
    removeItem, 
    getTotals,
    isLoading 
  } = useCartStore();
  
  // We use a local state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Format price to currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Show loading state until client-side hydration completes
  if (!mounted) {
    return (
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
          {onClose && (
            <button className="text-gray-400">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const { subtotal, itemCount } = getTotals();
  
  return (
    <div className="p-4 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">Cart ({itemCount})</h3>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6">
          <ShoppingBag size={40} className="text-gray-300 mb-2" />
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="py-3 flex items-start">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                  {item.image ? (
                    <img 
                      src={`${item.image}`} 
                      alt={item.name}
                      className="object-cover object-center"
                      // fill
                      sizes="64px"
                    />
                  ) : (
                    <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                      <ShoppingBag size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between text-sm font-medium text-gray-900">
                      <h3 className="truncate max-w-[150px]">
                        <Link 
                          href={`/product/${item.productId}`}
                          className="hover:text-blue-600"
                          onClick={onClose}
                        >
                          {item.name}
                        </Link>
                      </h3>
                      <p className="ml-2">{formatPrice(item.price)}</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 truncate max-w-[200px]">
                      {item.variantName}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-gray-500">Qty {item.quantity}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                      disabled={isLoading}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {items.length > 3 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              +{items.length - 3} more items
            </p>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm font-medium text-gray-900 mb-3">
              <p>Subtotal</p>
              <p>{formatPrice(subtotal)}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition text-sm text-center font-medium"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm text-center font-medium"
              >
                Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Usage Example:
// 
// 1. In your navbar or dropdown component:
// import MiniCart from '@/components/cart/MiniCart';
//
// 2. Then use it like this:
// <div className="relative">
//   <button onClick={() => setIsCartOpen(!isCartOpen)}>
//     <ShoppingCart />
//     <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
//       {itemCount}
//     </span>
//   </button>
//   
//   {isCartOpen && (
//     <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50">
//       <MiniCart onClose={() => setIsCartOpen(false)} />
//     </div>
//   )}
// </div>