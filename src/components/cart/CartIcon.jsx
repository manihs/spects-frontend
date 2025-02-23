// components/cart/CartIcon.jsx

'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartIcon() {
  const { openCart, getTotals } = useCartStore();
  const { itemCount } = getTotals();
  
  return (
    <button 
      onClick={openCart}
      className="relative p-2 text-gray-800 hover:text-blue-600 transition"
      aria-label="Open cart"
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}