'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import {
    ShoppingBag,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    DollarSign,
    Package,
    Truck,
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Send,
    Loader2,
    RefreshCw,
    Tag
} from 'lucide-react';

export default function OrderDetail() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAddingActivity, setIsAddingActivity] = useState(false);

    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');

    const [newActivity, setNewActivity] = useState('');
    const [activityStatus, setActivityStatus] = useState('');
    const [activityNote, setActivityNote] = useState('');

    // Load order details
    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    // Fetch order details
    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(`/api/orders/admin/orders/${orderId}`);

            if (response.success) {
                setOrder(response.data);
                // Set initial value for status update
                setNewStatus(response.data.status);
            } else {
                toast.error('Failed to load order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Error loading order details');
        } finally {
            setIsLoading(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (e) => {
        e.preventDefault();
        setIsUpdatingStatus(true);

        try {
            const response = await axiosInstance.put(`/api/orders/admin/orders/${orderId}/status`, {
                status: newStatus,
                note: statusNote
            });

            if (response.success) {
                toast.success('Order status updated successfully');
                setOrder(response.data);
                setStatusNote('');
            } else {
                toast.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Add order activity
    const addOrderActivity = async (e) => {
        e.preventDefault();
        setIsAddingActivity(true);

        try {
            const response = await axiosInstance.post(`/api/orders/admin/orders/${orderId}/activity`, {
                activity: newActivity,
                status: activityStatus,
                note: activityNote
            });

            if (response.success) {
                toast.success('Activity added successfully');
                // Refresh order details to show new activity
                fetchOrderDetails();
                // Reset form
                setNewActivity('');
                setActivityStatus('');
                setActivityNote('');
            } else {
                toast.error('Failed to add activity');
            }
        } catch (error) {
            console.error('Error adding order activity:', error);
            toast.error('Error adding activity');
        } finally {
            setIsAddingActivity(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'confirmed':
                return 'bg-indigo-100 text-indigo-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate payment status badge color
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-lg text-gray-600">Loading order details...</span>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href="/admin/orders"
                                className="mr-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-500" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <ShoppingBag className="mr-3 h-6 w-6 text-blue-600" />
                                Order Details
                            </h1>
                        </div>
                        <div>
                            <button
                                onClick={fetchOrderDetails}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Order Number:</span>
                            <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                        </div>
                        <span className="hidden sm:block mx-3 text-gray-300">|</span>
                        <div className="flex items-center mt-1 sm:mt-0">
                            <span className="text-sm text-gray-500 mr-2">Date Placed:</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                        </div>
                        <span className="hidden sm:block mx-3 text-gray-300">|</span>
                        <div className="flex items-center mt-1 sm:mt-0">
                            <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Summary and Customer Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-gray-500" />
                                    Order Summary
                                </h3>
                            </div>
                            <div className="px-6 py-5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-900">Order Status</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-900">Payment Method</span>
                                    <div className="flex items-center">
                                        <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                                        <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-900">Payment Status</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                {order.couponCode && (
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-900">Coupon Code</span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {order.couponCode}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-5 border-t border-gray-200">
                                <h4 className="text-base font-medium text-gray-900 mb-4">Price Details</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Subtotal</span>
                                        <span className="text-sm text-gray-900">₹{parseFloat(order.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Shipping</span>
                                        <span className="text-sm text-gray-900">₹{parseFloat(order.shippingAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Tax</span>
                                        <span className="text-sm text-gray-900">₹{parseFloat(order.taxAmount).toFixed(2)}</span>
                                    </div>
                                    {parseFloat(order.discountAmount) > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Discount</span>
                                            <span className="text-sm text-green-600">-${parseFloat(order.discountAmount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-900">Total</span>
                                        <span className="text-base font-medium text-gray-900">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-gray-500" />
                                    Customer Information
                                </h3>
                            </div>
                            <div className="px-6 py-5">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-1/2">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-600">
                                                    {order.customer.firstName} {order.customer.lastName}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-600">{order.customer.email}</span>
                                            </div>
                                            {order.customer.phone && (
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-600">{order.customer.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping and Billing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Address */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Truck className="h-5 w-5 mr-2 text-gray-500" />
                                        Shipping Address
                                    </h3>
                                </div>
                                <div className="px-6 py-5">
                                    <div className="flex items-start">
                                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{order.shippingAddress.address1}</p>
                                            {order.shippingAddress.address2 && (
                                                <p className="text-sm text-gray-600">{order.shippingAddress.address2}</p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                            </p>
                                            <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                                            {order.shippingAddress.phone && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                                        Billing Address
                                    </h3>
                                </div>
                                <div className="px-6 py-5">
                                    <div className="flex items-start">
                                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.billingAddress.firstName} {order.billingAddress.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{order.billingAddress.address1}</p>
                                            {order.billingAddress.address2 && (
                                                <p className="text-sm text-gray-600">{order.billingAddress.address2}</p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                                {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                                            </p>
                                            <p className="text-sm text-gray-600">{order.billingAddress.country}</p>
                                            {order.billingAddress.phone && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Phone:</span> {order.billingAddress.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-gray-500" />
                                    Order Items ({order.items.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                            {item.variantId && (
                                                                <div className="text-xs text-blue-600 mt-0.5">Variant</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.sku}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    ${parseFloat(item.price).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                    ${parseFloat(item.subtotal).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Order Activities and Status Update */}
                    <div className="space-y-6">
                        {/* Update Order Status */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <RefreshCw className="h-5 w-5 mr-2 text-gray-500" />
                                    Update Order Status
                                </h3>
                            </div>
                            <div className="px-6 py-5">
                                <form onSubmit={updateOrderStatus}>
                                    <div className="mb-4">
                                        <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            id="newStatus"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                            required
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="statusNote" className="block text-sm font-medium text-gray-700 mb-1">
                                            Note
                                        </label>
                                        <textarea
                                            id="statusNote"
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                            rows={3}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Add a note about this status change"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isUpdatingStatus || newStatus === order.status}
                                            className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(isUpdatingStatus || newStatus === order.status) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isUpdatingStatus ? (
                                                <>
                                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                                                    Update Status
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Add Order Activity */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Send className="h-5 w-5 mr-2 text-gray-500" />
                                    Add Activity
                                </h3>
                            </div>
                            <div className="px-6 py-5">
                                <form onSubmit={addOrderActivity}>
                                    <div className="mb-4">
                                        <label htmlFor="newActivity" className="block text-sm font-medium text-gray-700 mb-1">
                                            Activity
                                        </label>
                                        <input
                                            type="text"
                                            id="newActivity"
                                            value={newActivity}
                                            onChange={(e) => setNewActivity(e.target.value)}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Enter activity description"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="activityStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            id="activityStatus"
                                            value={activityStatus}
                                            onChange={(e) => setActivityStatus(e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                            <option value="info">Information</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="activityNote" className="block text-sm font-medium text-gray-700 mb-1">
                                            Note
                                        </label>
                                        <textarea
                                            id="activityNote"
                                            value={activityNote}
                                            onChange={(e) => setActivityNote(e.target.value)}
                                            rows={3}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Add additional details"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isAddingActivity}
                                            className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isAddingActivity ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isAddingActivity ? (
                                                <>
                                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="-ml-1 mr-2 h-4 w-4" />
                                                    Add Activity
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Order Activity Timeline */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                                    Order Timeline
                                </h3>
                            </div>
                            <div className="px-6 py-5">
                                {order.activities && order.activities.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {order.activities.map((activity, activityIdx) => (
                                                <li key={activity.id}>
                                                    <div className="relative pb-8">
                                                        {activityIdx !== order.activities.length - 1 ? (
                                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                        ) : null}
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${getStatusColor(activity.status)}`}>
                                                                    {activity.status === 'delivered' ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-800" />
                                                                    ) : activity.status === 'cancelled' ? (
                                                                        <AlertTriangle className="h-4 w-4 text-red-800" />
                                                                    ) : (
                                                                        <Clock className="h-4 w-4 text-gray-600" />
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-900 font-medium">{activity.activity}</p>
                                                                    {activity.note && (
                                                                        <p className="mt-1 text-sm text-gray-500">{activity.note}</p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                    {formatDate(activity.createdAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No activities recorded for this order yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Notes */}
                {order.notes && (
                    <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                                Customer Notes
                            </h3>
                        </div>
                        <div className="px-6 py-5">

                            <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}