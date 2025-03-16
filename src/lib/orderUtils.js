// src/lib/orderUtils.js

import { 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  ShoppingBag, 
  AlertCircle, 
  X 
} from 'lucide-react';

/**
 * Get the color class for an order status badge
 * @param {string} status - The order status
 * @returns {string} - Tailwind color classes for the badge
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get the payment status color class
 * @param {string} paymentStatus - The payment status
 * @returns {string} - Tailwind color classes
 */
export const getPaymentStatusColor = (paymentStatus) => {
  switch (paymentStatus) {
    case 'paid':
      return 'text-green-600';
    case 'partially_paid':
      return 'text-yellow-600';
    case 'refunded':
      return 'text-red-600';
    case 'not_paid':
    default:
      return 'text-gray-600';
  }
};

/**
 * Get user-friendly display text for order status
 * @param {string} status - The order status
 * @returns {string} - Formatted status text
 */
export const getStatusDisplayText = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'confirmed':
      return 'Confirmed';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'refunded':
      return 'Refunded';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Get payment method display text
 * @param {string} method - The payment method
 * @returns {string} - Formatted payment method text
 */
export const getPaymentMethodDisplay = (method) => {
  switch (method) {
    case 'cod':
      return 'Cash on Delivery';
    case 'razorpay':
      return 'Credit/Debit Card (Razorpay)';
    case 'credit-card':
      return 'Credit/Debit Card';
    default:
      return method;
  }
};

/**
 * Get the icon component for an order status
 * @param {string} status - The order status
 * @returns {Component} - Lucide icon component
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return Clock;
    case 'processing':
    case 'confirmed':
      return ShoppingBag;
    case 'shipped':
      return Truck;
    case 'delivered':
      return CheckCircle;
    case 'cancelled':
      return X;
    case 'refunded':
      return AlertCircle;
    default:
      return Package;
  }
};

/**
 * Format currency value
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Check if an order is cancellable
 * @param {string} status - The order status
 * @returns {boolean} - Whether the order can be cancelled
 */
export const isOrderCancellable = (status) => {
  return ['pending', 'processing', 'confirmed'].includes(status);
};

/**
 * Format payment status for display
 * @param {string} status - The payment status
 * @returns {string} - Formatted payment status
 */
export const formatPaymentStatus = (status) => {
  switch (status) {
    case 'not_paid':
      return 'Not Paid';
    case 'partially_paid':
      return 'Partially Paid';
    case 'paid':
      return 'Paid';
    case 'refunded':
      return 'Refunded';
    default:
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};