'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useUserContext } from '@/context/userContext';

import { 
  getStatusColor, 
  getStatusIcon, 
  formatCurrency, 
  isOrderCancellable,
  getPaymentMethodDisplay,
  getStatusDisplayText
} from '@/lib/orderUtils';
import RazorpayCheckout from '@/components/payment/RazorpayPayment';

export default function OrderDetailPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { orderId } = unwrappedParams;
  
  const { data: session, status } = useSession();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { userProfile } = useUserContext();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/account/login?callbackUrl=/orders/' + orderId);
      return;
    }

    if (status === 'authenticated') {
      fetchOrderDetails();
    }
  }, [status, session, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      
      // Configure axios headers with auth token
      const config = {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      };
      
      const data = await axiosInstance.get(`/api/orders/${orderId}`, config);
      
      if (data.success) {
        setOrder(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setSuccess('Payment successful! Redirecting to order confirmation...');
    clearCart();

    // Redirect to success page
    setTimeout(() => {
      router.push(`/checkout/success?orderId=${createdOrder.id}`);
    }, 1500);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    console.error('Payment failed:', errorMessage);
    setError(`Payment failed: ${errorMessage}. Your order has been created, but you'll need to complete payment later.`);
  };
  
  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Configure axios headers with auth token
      const config = {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      };
      
      const data = await axiosInstance.post(
        `/api/orders/${orderId}/cancel`, 
        { reason: 'Customer requested cancellation' },
        config
      );
      
      if (data.success) {
        // Refetch the order details to show updated status
        fetchOrderDetails();
      } else {
        throw new Error(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/orders" className="flex items-center text-blue-600 mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
        </Link>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={fetchOrderDetails} 
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/orders" className="flex items-center text-blue-600 mb-4 hover:underline">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Order Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <Badge className={`${getStatusColor(order.status)} mr-2 text-sm`}>
                {getStatusDisplayText(order.status)}
              </Badge>
              {isOrderCancellable(order.status) && (
                <button 
                  onClick={handleCancelOrder}
                  className="ml-2 text-red-600 hover:text-red-800 text-sm"
                  disabled={isLoading}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Content */}
        <div className="p-6">
          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">Shipping Address</h3>
              <address className="not-italic text-gray-600">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </address>
            </div>

            {/* Billing Address */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">Billing Address</h3>
              <address className="not-italic text-gray-600">
                <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                <p>{order.billingAddress.address1}</p>
                {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && <p>Phone: {order.billingAddress.phone}</p>}
              </address>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">Payment Information</h3>
              <div className="text-gray-600">
                <p>Method: {getPaymentMethodDisplay(order.paymentMethod)}</p>
                <p className="capitalize">Status: {order.paymentStatus}</p>
                
                {/* Payment Details */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-medium text-green-600">{formatCurrency(order.amountPaid || 0)}</span>
                  </div>
                  {order.paymentStatus === 'partially_paid' && (
                    <>
                      <div className="flex justify-between">
                        <span>Remaining Amount:</span>
                        <span className="font-medium text-red-600">{formatCurrency(order.balanceDue || 0)}</span>
                      </div>
                      <div className="mt-4">
                      <RazorpayCheckout
                        session={session}
                        orderId={order.id}
                        orderAmount={order.balanceDue}
                        orderNumber={order.orderNumber}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        allowPartialPayment={userProfile?.allowPartialPayment}
                      />
                        {/* <Link 
                          href={`/orders/${order.id}/pay/`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Pay Remaining Amount
                        </Link> */}
                      </div>
                    </>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium">Order Notes:</h4>
                    <p>{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Totals */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">{formatCurrency(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">{formatCurrency(order.taxAmount)}</span>
                </div>
                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-red-600">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          {order.activities && order.activities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <ul className="space-y-4">
                  {order.activities.map((activity, index) => (
                    <li key={activity.id} className="relative pl-10">
                      <div className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                        {React.createElement(getStatusIcon(activity.status), { 
                          className: `h-5 w-5 ${activity.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`
                        })}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.activity}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.createdAt), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                        {activity.note && (
                          <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="h-6 w-32">
        <Skeleton className="h-full w-full" />
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="mt-4 md:mt-0">
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="overflow-x-auto">
              <div className="grid grid-cols-5 gap-4 mb-4">
                {Array(5).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 mb-4">
                  {Array(5).fill(null).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <Skeleton className="h-5 w-40 mb-2" />
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="relative pl-10">
                  <Skeleton className="h-8 w-8 rounded-full absolute left-0 top-1" />
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}