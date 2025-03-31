'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserContext } from '@/context/userContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingBag, User, Clock, Loader2, CreditCard, BarChart4 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const { userProfile } = useUserContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== 'authenticated' || !session?.accessToken) return;
      
      try {
        setLoading(true);
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/customer-dashboard/`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        setDashboardData(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Unable to load your dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [session, status]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {dashboardData?.customer?.name || userProfile?.name || session?.user?.name || 'valued customer'}!
        </p>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.orderStats?.totalOrders || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              <Link href="/account/orders" className="text-blue-600 hover:underline">
                View all orders
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{parseFloat(dashboardData?.orderStats?.totalDueAmount || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {dashboardData?.customer?.retailerStatus || userProfile?.status || 'Active'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <Link href="/account/profile" className="text-blue-600 hover:underline">
                Update profile
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-4">
          {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dashboardData.recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.orderNumber}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ₹{parseFloat(order.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">You don't have any orders yet.</p>
              <Link href="/products" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                Start shopping
              </Link>
            </div>
          )}

          {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 && (
            <div className="mt-4 text-center">
              <Link 
                href="/account/orders" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all orders
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
        </div>
        <div className="p-4">
          {dashboardData?.recentPayments && dashboardData.recentPayments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dashboardData.recentPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Payment for {payment.order?.orderNumber || 'Order'}
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ₹{parseFloat(payment.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent payments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {dashboardData?.customer?.name || userProfile?.name || session?.user?.name || 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Company Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {dashboardData?.customer?.companyName || 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Retailer Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {dashboardData?.customer?.retailerStatus 
                  ? dashboardData.customer.retailerStatus.charAt(0).toUpperCase() + dashboardData.customer.retailerStatus.slice(1)
                  : 'Not applicable'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Credit Utilization</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {dashboardData?.retailerData?.creditData?.creditUtilization
                  ? `${dashboardData.retailerData.creditData.creditUtilization.toFixed(2)}%`
                  : '0%'}
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <Link 
              href="/account/profile" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 