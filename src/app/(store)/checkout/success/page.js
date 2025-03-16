// src/app/(store)/checkout/success/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { CheckCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/account/login?callbackUrl=/checkout/success');
      return;
    }

    if (status === 'authenticated' && orderId) {
      fetchOrderDetails();
    } else if (status === 'authenticated' && !orderId) {
      // No order ID in URL - redirect to orders page
      router.push('/orders');
    }
  }, [status, session, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      
      if (response.success) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading order details...</h1>
          <p className="text-gray-600">Please wait while we retrieve your order information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/orders"
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 w-full text-center"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. We've sent a confirmation email with all the details.
          </p>
        </div>

        {order && (
          <div className="border-t border-b border-gray-200 py-4 my-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Payment Status</span>
              <span className={`font-medium ${
                order.paymentStatus === 'paid' 
                  ? 'text-green-600' 
                  : order.paymentStatus === 'partially_paid' 
                    ? 'text-yellow-600' 
                    : 'text-gray-700'
              }`}>
                {order.paymentStatus === 'paid' 
                  ? 'Paid' 
                  : order.paymentStatus === 'partially_paid' 
                    ? 'Partially Paid' 
                    : order.paymentMethod === 'cod' 
                      ? 'Cash on Delivery' 
                      : 'Pending'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="font-medium">
                ₹{parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href={`/orders/${orderId}`}
            className="bg-white text-blue-600 border border-blue-600 py-3 rounded-md hover:bg-blue-50 text-center font-medium"
          >
            View Order Details
          </Link>
          
          <Link
            href="/orders"
            className="bg-white text-gray-700 border border-gray-300 py-3 rounded-md hover:bg-gray-50 text-center font-medium"
          >
            My Orders
          </Link>
          
          <Link
            href="/products"
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 text-center font-medium flex items-center justify-center"
          >
            Continue Shopping <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}