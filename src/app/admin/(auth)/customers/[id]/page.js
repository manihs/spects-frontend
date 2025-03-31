'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from "sonner";
import {
  User,
  Building,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  FileText,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  ChevronRight,
  CalendarDays,
  Bookmark,
  Tag,
  Coins,
  Check,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
export default function RetailerDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { data: session, status } = useSession()
  
  const [retailer, setRetailer] = useState(null);
  const [orderStats, setOrderStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    allowPartialPayment: false,
    creditLimit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for rejection modal
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // State for payment settings modal
  const [showPaymentSettingsModal, setShowPaymentSettingsModal] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    allowPartialPayment: false,
    creditLimit: 0,
    trusted: false
  });

  // Add suspend state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const getAuthToken = () => {
    return session?.accessToken;
  };

  // Fetch retailer data
  useEffect(() => {
    if (status !== "loading") {
      fetchRetailerDetails();
    }
  }, [id, session?.accessToken, status]);

  // For demonstration purposes, we'll use mock data
  const fetchRetailerDetails = async () => {
    setIsLoading(true);
    try {
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      
      const { retailer, orderStats, recentOrders, recentPayments } = response.data.data;

      setRetailer(retailer);
      setOrderStats(orderStats);
      setRecentOrders(recentOrders);
      setRecentPayments(recentPayments);

      setApprovalData({
        allowPartialPayment: retailer.allowPartialPayment,
        creditLimit: retailer.creditLimit
      });
      
      setPaymentSettings({
        allowPartialPayment: retailer.allowPartialPayment,
        creditLimit: retailer.creditLimit,
        trusted: retailer.trusted || false
      });
    
      setIsLoading(false);
      
      
    } catch (error) {
      console.error('Error fetching retailer details:', error);
      toast.error('Failed to load retailer details');
      setIsLoading(false);
    }
  };

  // Handle retailer approval
  const handleApproveRetailer = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}/approve`, {
        allowPartialPayment: approvalData.allowPartialPayment,
        creditLimit: approvalData.creditLimit
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.data.success) {
        // Update the retailer status in local state
        setRetailer(prev => ({
          ...prev,
          retailerStatus: 'approved',
          allowPartialPayment: approvalData.allowPartialPayment,
          creditLimit: approvalData.creditLimit
        }));
        
        toast.success('Retailer approved successfully');
        setShowApprovalModal(false);
      } else {
        toast.error('Failed to approve retailer: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error approving retailer:', error);
      toast.error('Failed to approve retailer: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retailer rejection
  const handleRejectRetailer = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}/reject`, {
        reason: rejectionReason
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.data.success) {
        // Update the retailer status in local state
        setRetailer(prev => ({
          ...prev,
          retailerStatus: 'rejected',
          allowPartialPayment: false
        }));
        
        toast.success('Retailer application rejected');
        setShowRejectionModal(false);
        setRejectionReason('');
      } else {
        toast.error('Failed to reject retailer: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting retailer:', error);
      toast.error('Failed to reject retailer: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update payment settings
  const handleUpdatePaymentSettings = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}/partial-payment`, {
        allowPartialPayment: paymentSettings.allowPartialPayment,
        creditLimit: paymentSettings.creditLimit,
        trusted: paymentSettings.trusted
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.data.success) {
        // Update the retailer settings in local state
        setRetailer(prev => ({
          ...prev,
          allowPartialPayment: paymentSettings.allowPartialPayment,
          creditLimit: paymentSettings.creditLimit,
          trusted: paymentSettings.trusted
        }));
        
        toast.success('Payment settings updated successfully');
        setShowPaymentSettingsModal(false);
      } else {
        toast.error('Failed to update payment settings: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast.error('Failed to update payment settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retailer suspension
  const handleSuspendRetailer = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers/${id}/suspend`, {
        reason: suspendReason
      }, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.data.success) {
        // Update the retailer status in local state
        setRetailer(prev => ({
          ...prev,
          status: 'inactive'
        }));
        
        toast.success('Retailer suspended successfully');
        setShowSuspendModal(false);
        setSuspendReason('');
      } else {
        toast.error('Failed to suspend retailer: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error suspending retailer:', error);
      toast.error('Failed to suspend retailer: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
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
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get order status color
  const getOrderStatusColor = (status) => {
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color and text
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800',
          text: 'Paid'
        };
      case 'partially_paid':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Partially Paid'
        };
      case 'not_paid':
        return {
          color: 'bg-red-100 text-red-800',
          text: 'Not Paid'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: status
        };
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading retailer details...</span>
        </div>
      </div>
    );
  }

  if (!retailer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Retailer Not Found</h2>
          <p className="text-gray-500 mb-6">The retailer you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/admin/customers"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Retailers
          </Link>
        </div>
      </div>
    );
  }

  // Calculate totals from order stats
  const totalOrders = orderStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalOrderAmount = orderStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const totalAmountPaid = orderStats.reduce((sum, stat) => sum + stat.amountPaid, 0);
  const totalBalanceDue = orderStats.reduce((sum, stat) => sum + stat.balanceDue, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs and Actions */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center mb-2">
              <Link 
                href="/admin/customers"
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Retailers List
              </Link>
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              <span className="text-gray-500">{retailer.firstName} {retailer.lastName}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="mr-3 h-6 w-6 text-blue-600" />
              Retailer Details
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {retailer.retailerStatus === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Retailer
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Retailer
                </button>
              </>
            )}
            
            {retailer.retailerStatus === 'rejected' && (
              <button
                type="button"
                onClick={() => setShowApprovalModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Retailer
              </button>
            )}
            
            {(retailer.retailerStatus === 'approved' && retailer.status === 'active') && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Suspend Retailer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSettings({
                      allowPartialPayment: retailer.allowPartialPayment,
                      creditLimit: retailer.creditLimit,
                      trusted: retailer.trusted || false
                    });
                    setShowPaymentSettingsModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Settings
                </button>
              </>
            )}
            
            {(retailer.retailerStatus === 'approved' && retailer.status === 'inactive') && (
              <button
                type="button"
                onClick={() => setShowApprovalModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Reactivate Retailer
              </button>
            )}
            
            <Link
              href={`/admin/customers/${retailer.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Retailer
            </Link>
          </div>
        </div>
        
        {/* Retailer Status Banner */}
        <div className={`mb-6 rounded-lg border px-4 py-3 flex items-center justify-between ${
          retailer.retailerStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
          retailer.retailerStatus === 'approved' && retailer.status === 'active' ? 'bg-green-50 border-green-200' : 
          retailer.retailerStatus === 'approved' && retailer.status === 'inactive' ? 'bg-yellow-50 border-yellow-200' : 
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {retailer.retailerStatus === 'pending' ? (
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            ) : retailer.retailerStatus === 'approved' && retailer.status === 'active' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : retailer.retailerStatus === 'approved' && retailer.status === 'inactive' ? (
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            
            <span className={`text-sm font-medium ${
              retailer.retailerStatus === 'pending' ? 'text-yellow-800' : 
              retailer.retailerStatus === 'approved' && retailer.status === 'active' ? 'text-green-800' : 
              retailer.retailerStatus === 'approved' && retailer.status === 'inactive' ? 'text-yellow-800' : 
              'text-red-800'
            }`}>
              {retailer.retailerStatus === 'pending' ? 'Pending Approval' : 
               retailer.retailerStatus === 'approved' && retailer.status === 'active' ? 'Active Retailer' : 
               retailer.retailerStatus === 'approved' && retailer.status === 'inactive' ? 'Inactive Retailer' : 
               'Rejected Application'}
            </span>
          </div>
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(retailer.retailerStatus)}`}>
            {retailer.retailerStatus}
          </span>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Retailer Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <User className="mr-2 h-5 w-5 text-gray-500" />
                  Retailer Profile
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium text-gray-900">
                      {retailer.firstName} {retailer.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Customer ID: {retailer.id}
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Email</span>
                      <span className="text-sm text-gray-900">{retailer.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Phone</span>
                      <span className="text-sm text-gray-900">{retailer.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Company</span>
                      <span className="text-sm text-gray-900">{retailer.companyName || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Bookmark className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Business Type</span>
                      <span className="text-sm text-gray-900">{retailer.businessType || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Tax ID</span>
                      <span className="text-sm text-gray-900">{retailer.taxId || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CalendarDays className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Registered On</span>
                      <span className="text-sm text-gray-900">{formatDate(retailer.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Last Login</span>
                      <span className="text-sm text-gray-900">
                        {retailer.lastLogin ? formatDate(retailer.lastLogin) : 'Never logged in'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Settings Card */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
                  Payment Settings
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Partial Payment</span>
                      <span className="text-sm text-gray-500">Allow partial payments for orders</span>
                    </div>
                    <div className="flex items-center">
                      {retailer.allowPartialPayment ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="mr-1 h-3 w-3" />
                          Not Allowed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Trusted Customer</span>
                      <span className="text-sm text-gray-500">Mark customer as trusted for order processing</span>
                    </div>
                    <div className="flex items-center">
                      {retailer.trusted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          Trusted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="mr-1 h-3 w-3" />
                          Not Trusted
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Credit Limit</span>
                      <span className="text-sm text-gray-500">Maximum outstanding balance allowed</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(retailer.creditLimit || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {retailer.retailerStatus === 'approved' && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentSettings({
                          allowPartialPayment: retailer.allowPartialPayment,
                          creditLimit: retailer.creditLimit,
                          trusted: retailer.trusted || false
                        });
                        setShowPaymentSettingsModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 w-full justify-center border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Update Payment Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Orders and Payment Info */}
          <div className="lg:col-span-2">
            {/* Order Statistics */}
            <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-gray-500" />
                  Order Statistics
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-2 gap-5 mb-6 sm:grid-cols-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs font-medium text-gray-500 block">Total Orders</span>
                    <span className="text-xl font-semibold text-gray-900">{totalOrders}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs font-medium text-gray-500 block">Order Value</span>
                    <span className="text-xl font-semibold text-gray-900">{formatCurrency(totalOrderAmount)}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs font-medium text-gray-500 block">Amount Paid</span>
                    <span className="text-xl font-semibold text-green-600">{formatCurrency(totalAmountPaid)}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs font-medium text-gray-500 block">Balance Due</span>
                    <span className="text-xl font-semibold text-red-600">{formatCurrency(totalBalanceDue)}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Order Status Breakdown</h4>
                  <div className="space-y-3">
                    {orderStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusInfo(stat.paymentStatus).color}`}>
                            {getPaymentStatusInfo(stat.paymentStatus).text}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">{stat.count} orders</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(stat.totalAmount)}
                          {stat.balanceDue > 0 && (
                            <span className="ml-2 text-xs text-red-600">
                              ({formatCurrency(stat.balanceDue)} due)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-gray-500" />
                  Recent Orders
                </h3>
                <Link
                  href={`/admin/orders?customerId=${retailer.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View All
                  </Link>
              </div>
              <div className="overflow-x-auto">
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">This retailer hasn't placed any orders yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{formatCurrency(order.totalAmount)}</div>
                            <div className={`text-xs ${
                              order.paymentStatus === 'paid' ? 'text-green-600' : 
                              order.paymentStatus === 'partially_paid' ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {getPaymentStatusInfo(order.paymentStatus).text}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            
            {/* Recent Payments */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-gray-500" />
                  Recent Payments
                </h3>
                <Link
                  href={`/admin/customers/${retailer.id}/payments`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                {recentPayments.length === 0 ? (
                  <div className="p-6 text-center">
                    <Coins className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900">No payments yet</h3>
                    <p className="mt-1 text-sm text-gray-500">This retailer hasn't made any payments yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            #{payment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-900">
                            <Link href={`/admin/orders/${payment.orderId}`}>
                              {payment.order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowApprovalModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Approve Retailer
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to approve this retailer? This will allow them to place orders and access the platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handleApproveRetailer}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Approving...
                    </>
                  ) : (
                    'Approve Retailer'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowRejectionModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Retailer Application
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to reject the retailer application from {retailer.firstName} {retailer.lastName}. Please provide a reason for the rejection.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                        Rejection Reason
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="rejectionReason"
                          name="rejectionReason"
                          rows="3"
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This reason will be shared with the retailer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRejectRetailer}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting || !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting || !rejectionReason.trim()}
                >
                  {isSubmitting ? 
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" /> : 
                    <XCircle className="-ml-1 mr-2 h-4 w-4 text-white" />
                  }
                  {isSubmitting ? 'Processing...' : 'Reject Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Settings Modal */}
      {showPaymentSettingsModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowPaymentSettingsModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Update Payment Settings
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Update payment settings for {retailer.firstName} {retailer.lastName}.
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="paymentSettingsAllowPartial" className="block text-sm font-medium text-gray-700">
                            Allow Partial Payment
                          </label>
                          <div className="flex items-center h-5">
                            <input
                              id="paymentSettingsAllowPartial"
                              name="paymentSettingsAllowPartial"
                              type="checkbox"
                              checked={paymentSettings.allowPartialPayment}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                allowPartialPayment: e.target.checked
                              })}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Allow the retailer to make partial payments on orders
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="paymentSettingsTrusted" className="block text-sm font-medium text-gray-700">
                            Mark as Trusted Customer
                          </label>
                          <div className="flex items-center h-5">
                            <input
                              id="paymentSettingsTrusted"
                              name="paymentSettingsTrusted"
                              type="checkbox"
                              checked={paymentSettings.trusted}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                trusted: e.target.checked
                              })}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Trusted customers can place orders without immediate payment
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="paymentSettingsCreditLimit" className="block text-sm font-medium text-gray-700">
                          Credit Limit
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="paymentSettingsCreditLimit"
                            id="paymentSettingsCreditLimit"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            value={paymentSettings.creditLimit}
                            onChange={(e) => setPaymentSettings({
                              ...paymentSettings,
                              creditLimit: parseFloat(e.target.value) || 0
                            })}
                            min="0"
                            step="100"
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum outstanding balance allowed (0 for no credit)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdatePaymentSettings}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" /> : 
                    <Check className="-ml-1 mr-2 h-4 w-4 text-white" />
                  }
                  {isSubmitting ? 'Updating...' : 'Update Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentSettingsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowSuspendModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Suspend Retailer
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to suspend {retailer.firstName} {retailer.lastName}. Please provide a reason for the suspension.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="suspendReason" className="block text-sm font-medium text-gray-700">
                        Suspension Reason
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="suspendReason"
                          name="suspendReason"
                          rows="3"
                          className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter reason for suspension..."
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This reason will be shared with the retailer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSuspendRetailer}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting || !suspendReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting || !suspendReason.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Suspending...
                    </>
                  ) : (
                    'Suspend Retailer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}