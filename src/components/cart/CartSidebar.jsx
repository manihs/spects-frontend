// components/cart/CartSidebar.jsx

'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateItemQuantity, 
    removeItem, 
    getTotals 
  } = useCartStore();
  
  const { subtotal, tax, shipping, total, itemCount } = getTotals();
  const overlayRef = useRef(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleOverlayClick = (e) => {
      if (overlayRef.current === e.target) {
        closeCart();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOverlayClick);
      // Prevent scrolling on body when cart is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOverlayClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, closeCart]);
  
  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeCart]);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
      ref={overlayRef}
    >
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-center">
                      {/* Product Image */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        {item.featureImage || item.image ? (
                          <Image 
                            src={item.featureImage || item.image} 
                            alt={item.name}
                            className="object-cover object-center"
                            fill
                            sizes="80px"
                          />
                        ) : (
                          <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                            <ShoppingBag size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link 
                                href={`/products/${item.productId}`} 
                                onClick={closeCart}
                                className="hover:text-blue-600"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.variantName}</p>
                          <p className="mt-1 text-xs text-gray-400">SKU: {item.sku}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              className="p-1 px-2 text-gray-600 hover:text-gray-800"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-2 py-1 text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              className="p-1 px-2 text-gray-600 hover:text-gray-800"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Subtotal</p>
                  <p>{formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Tax</p>
                  <p>{formatPrice(tax)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Shipping</p>
                  <p>{shipping === 0 ? 'Free' : formatPrice(shipping)}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                  <p>Total</p>
                  <p>{formatPrice(total)}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition text-center font-medium"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




