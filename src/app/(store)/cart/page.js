// src/app/(store)/cart/page.js

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Lock,
  Shield,
} from "lucide-react";

export default function CartPage() {
  const { data: session, status } = useSession();
  const {
    items,
    updateItemQuantity,
    removeItem,
    clearCart,
    getTotals,
    isLoading,
  } = useCartStore();
  const router = useRouter();

  console.log("items =>", items);

  useEffect(() => {
    // Only fetch cart items if the user is authenticated
    if (status === "unauthenticated") {
      // If not authenticated, redirect to login
      router.push("/account/login?callbackUrl=/cart");
    }
  }, [session, status, router]);

  // We use a local state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to access localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show loading skeleton while waiting for hydration
    return <CartSkeleton />;
  }

  const { subtotal, tax, shipping, total } = getTotals();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Your Cart
          </h1>
          <p className="text-black text-lg">
            Visha Optics Company is your trusted partner for all your eyewear
            needs.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-medium text-gray-700 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-8">
                Looks like you haven't added any products to your cart yet.
                Browse our catalog to find something you'll love!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition gap-2 font-medium"
              >
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Items ({items.length})</h2>
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={16} /> Clear Cart
                    </button>
                  </div>
                </div> */}

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 md:p-6 flex flex-col md:flex-row gap-4"
                    >
                      {/* Product Image */}
                      <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        {item.image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                            alt={item.name}
                            className="object-cover object-center"
                            fill
                            sizes="(max-width: 768px) 96px, 128px"
                          />
                        ) : (
                          <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                            <ShoppingBag size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link
                                href={`/product/${item.productId}`}
                                className="hover:text-blue-600"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.variantName}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              SKU: {item.sku}
                            </p>
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 px-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-3 py-1 text-gray-700">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 px-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                              <span className="hidden md:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <Link
                  href="/products"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-gray-100 rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-black mb-4">
                  Order Summary
                </h2>
                <p className="text-sm text-black mb-4">Items {items.length}</p>

                <div className="space-y-3 mb-6">
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <p>Subtotal (INR)</p>
                      <p>{formatPrice(subtotal)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-500">
                    Subtotal does not include applicable taxes
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>

                {/* <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                  <p className="flex items-center gap-1">
                    <RefreshCw size={14} /> 30-day easy returns
                  </p>
                  <p className="mt-2">Free shipping on orders over $100</p>
                </div> */}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                   <Lock size={18} className="me-1"/>
                    <span className="text-sm">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      height={25}
                      width={37}
                      alt="visa"
                      className="object-contain"
                      src="https://img6.wsimg.com/fos/react/icons/115/gd/sprite.svg#visa"
                    />
                    <img
                      height={25}
                      width={37}
                      alt="mastercard"
                      className="object-contain"
                      src="https://img6.wsimg.com/fos/react/icons/115/gd/sprite.svg#mastercard"
                    />
                    <img
                      height={25}
                      width={37}
                      alt="amex"
                      className="object-contain"
                      src="https://img6.wsimg.com/fos/react/icons/115/gd/sprite.svg#amex"
                    />
                    <img
                      height={25}
                      width={37}
                      alt="rupay"
                      className="object-contain"
                      src="https://img6.wsimg.com/fos/react/icons/115/gd/sprite.svg#rupay"
                    />
                    <img
                      height={25}
                      width={37}
                      alt="maestro"
                      className="object-contain"
                      src="https://img6.wsimg.com/fos/react/icons/115/gd/sprite.svg#maestro"
                    />
                  </div>
                
                </div>
              </div>
              <p className="text-sm text-green-500 text-center mt-5 flex items-center gap-1 justify-center">
                <Shield size={18} className="me-1"/>
                Quality You Can Trust
              </p>  
            </div>
          </div>
          
          </>
        )}
        
      </div>
      
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 flex gap-4 border-b animate-pulse">
                  <div className="h-32 w-32 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between mt-6">
                      <div className="h-8 w-32 bg-gray-200 rounded"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 w-36 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
