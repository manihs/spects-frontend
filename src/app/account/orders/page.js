'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Filter, Search, BookmarkPlus } from 'lucide-react';
import axios from 'axios';
import React from 'react';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Load initial state from URL params
  useEffect(() => {
    if (searchParams) {
      const status = searchParams.get('status') || '';
      const paymentStatus = searchParams.get('payment') || '';
      const search = searchParams.get('search') || '';
      const page = Number(searchParams.get('page')) || 1;
      
      setFilters({
        status,
        paymentStatus,
        search
      });
      
      setPagination(prev => ({
        ...prev,
        currentPage: page
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/account/login?callbackUrl=/account/orders');
      return;
    }

    if (status === 'authenticated') {
      const page = Number(searchParams.get('page')) || 1;
      fetchOrders(page);
    }
  }, [status, session, searchParams]);

  useEffect(() => {
    if (orders.length) {
      applyFilters();
    }
  }, [filters, orders]);

  // Update URL when filters or pagination change
  useEffect(() => {
    if (status === 'authenticated') {
      updateUrl();
    }
  }, [filters, pagination.currentPage]);

  const updateUrl = () => {
    const params = new URLSearchParams();
    
    if (filters.status) params.set('status', filters.status);
    if (filters.paymentStatus) params.set('payment', filters.paymentStatus);
    if (filters.search) params.set('search', filters.search);
    if (pagination.currentPage > 1) params.set('page', pagination.currentPage.toString());
    
    const newUrl = `/account/orders${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  const copyCurrentUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard');
  };

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        params: { 
          page, 
          limit: 10,
          status: filters.status || undefined,
          paymentStatus: filters.paymentStatus || undefined,
          search: filters.search || undefined
        },
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setFilteredOrders(response.data.data.orders);
        setStatistics(response.data.data.statistics);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
      fetchOrders(newPage);
    }
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Filter by status
    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }
    
    // Filter by payment status
    if (filters.paymentStatus) {
      result = result.filter(order => order.paymentStatus === filters.paymentStatus);
    }
    
    // Filter by search term (order number)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredOrders(result);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    
    fetchOrders(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      search: ''
    });
    
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    
    fetchOrders(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_paid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  if (status === 'loading') {
    return <OrdersLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={copyCurrentUrl}
            title="Copy bookmarkable URL"
          >
            <BookmarkPlus size={16} />
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      {/* {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{statistics.summary.totalOrders}</p>
          </Card>
          <Card className="p-4 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(statistics.summary.totalSpent)}</p>
          </Card>
          <Card className="p-4 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Average Order</p>
            <p className="text-2xl font-bold">{formatCurrency(statistics.summary.averageOrderValue)}</p>
          </Card>
          <Card className="p-4 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Due Amount</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredOrders.length > 0 
                ? formatCurrency(filteredOrders.reduce((sum, order) => sum + parseFloat(order.balanceDue || 0), 0)) 
                : '₹0'}
            </p>
          </Card>
        </div>
      )} */}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filter Orders</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600">
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search by Order #</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Order number..."
                  className="pl-10"
                />
                {filters.search && (
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Order Status Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Order Status</Label>
              <RadioGroup 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="status-all" />
                  <Label htmlFor="status-all">All</Label>
                </div>
                {statistics?.statusDistribution?.map((item) => (
                  <div key={item.status} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.status} id={`status-${item.status}`} />
                    <Label htmlFor={`status-${item.status}`} className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="capitalize">{item.status}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Payment Status Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Payment Status</Label>
              <RadioGroup 
                value={filters.paymentStatus} 
                onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="payment-all" />
                  <Label htmlFor="payment-all">All</Label>
                </div>
                {statistics?.paymentStatusDistribution?.map((item) => (
                  <div key={item.paymentStatus} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.paymentStatus} id={`payment-${item.paymentStatus}`} />
                    <Label htmlFor={`payment-${item.paymentStatus}`} className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="capitalize">{item.paymentStatus.replace('_', ' ')}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <OrdersLoadingSkeleton />
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={fetchOrders} 
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {hasActiveFilters ? 'No orders match your filters' : 'You haven\'t placed any orders yet'}
          </h3>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>
          ) : (
            <Link 
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 mt-4"
            >
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus.replace('_', ' ').charAt(0).toUpperCase() + order.paymentStatus.replace('_', ' ').slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={order.balanceDue > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {formatCurrency(order.balanceDue || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium"
                    >
                      &laquo; Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.totalPages || 
                        Math.abs(page - pagination.currentPage) <= 1
                      )
                      .map((page, index, array) => {
                        const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                                ...
                              </span>
                            )}
                            <Button
                              variant={pagination.currentPage === page ? "default" : "outline"}
                              onClick={() => handlePageChange(page)}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium"
                    >
                      Next &raquo;
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/4 mb-6">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array(4).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 grid grid-cols-7 gap-4">
          {Array(7).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-7 gap-4 border-t border-gray-200">
            {Array(7).fill(null).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}