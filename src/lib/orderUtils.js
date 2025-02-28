import { Package, Truck, CheckCircle, XCircle, RefreshCw, CreditCard } from 'lucide-react';

/**
 * Get the appropriate CSS classes for the order status badge
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-200 text-yellow-800';
    case 'processing':
      return 'bg-blue-200 text-blue-800';
    case 'confirmed':
      return 'bg-green-200 text-green-800';
    case 'shipped':
      return 'bg-indigo-200 text-indigo-800';
    case 'delivered':
      return 'bg-green-200 text-green-800';
    case 'cancelled':
      return 'bg-red-200 text-red-800';
    case 'refunded':
      return 'bg-purple-200 text-purple-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

/**
 * Get the appropriate icon for the order status
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return Package;
    case 'processing':
      return RefreshCw;
    case 'confirmed':
      return CreditCard;
    case 'shipped':
      return Truck;
    case 'delivered':
      return CheckCircle;
    case 'cancelled':
      return XCircle;
    case 'refunded':
      return RefreshCw;
    default:
      return Package;
  }
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount) => {
  // Handle case where amount might be a string
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return '$0.00';
  }
  
  return `$${numAmount.toFixed(2)}`;
};

/**
 * Check if an order is cancellable (based on its status)
 */
export const isOrderCancellable = (status) => {
  return ['pending', 'processing'].includes(status);
};

/**
 * Get payment method display text
 */
export const getPaymentMethodDisplay = (method) => {
  switch (method?.toLowerCase()) {
    case 'cod':
      return 'Cash on Delivery';
    case 'credit_card':
      return 'Credit Card';
    case 'paypal':
      return 'PayPal';
    case 'bank_transfer':
      return 'Bank Transfer';
    default:
      return method?.toUpperCase() || 'Unknown';
  }
};

/**
 * Get human-readable status text 
 */
export const getStatusDisplayText = (status) => {
  if (!status) return 'Unknown';
  
  // Capitalize first letter and replace underscores with spaces
  return status.charAt(0).toUpperCase() + 
    status.slice(1).replace(/_/g, ' ');
};