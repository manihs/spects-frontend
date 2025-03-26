'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios'; // Using axios directly instead of a custom instance
import { useSession, signIn, signOut } from "next-auth/react"
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sliders,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  Eye,
  Edit
} from 'lucide-react';

// Create a component that uses useSearchParams
function RetailerListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession()
  
  // State for retailers and pagination
  const [retailers, setRetailers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for filters and sorting
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'DESC'
  });

  // Get auth token from session
  const getAuthToken = () => {
    return session?.accessToken;
  };
  
  // State for filter UI
  const [showFilters, setShowFilters] = useState(false);

  // Load retailers
  useEffect(() => {
    fetchRetailers();
  }, [filters.page, filters.limit, filters.status, filters.sortBy, filters.sortOrder, session?.accessToken]);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });
    
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }, [filters]);

  // Fetch retailers based on current filters
  const fetchRetailers = async () => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value.toString());
        }
      });
      
      // Make API request
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/retailers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.data.success) {
        setRetailers(response.data.data.retailers);
        setTotalItems(response.data.data.pagination.totalItems);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        toast.error('Failed to load retailers');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching retailers:', error);
      toast.error('Error loading retailers: ' + (error.response?.data?.message || error.message));
      setIsLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = () => {
    setFilters({
      ...filters,
      page: 1 // Reset to first page when applying new filters
    });
    fetchRetailers();
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Toggle sort order
  const handleSort = (column) => {
    setFilters({
      ...filters,
      sortBy: column,
      sortOrder: filters.sortBy === column && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({
        ...filters,
        page: newPage
      });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
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
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="mr-1 h-3 w-3" />;
      case 'approved':
        return <CheckCircle className="mr-1 h-3 w-3" />;
      case 'rejected':
        return <XCircle className="mr-1 h-3 w-3" />;
      default:
        return null;
    }
  };

  // Calculate pagination info
  const startItem = (filters.page - 1) * filters.limit + 1;
  const endItem = Math.min(filters.page * filters.limit, totalItems);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-6 w-6 text-blue-600" />
            Retailers
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              Filters & Search
            </h3>
            <div className="flex items-center">
              <button
                onClick={resetFilters}
                className="ml-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Sliders className="h-3.5 w-3.5 mr-1.5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          <div className={`px-4 py-5 sm:p-6 ${showFilters ? 'block' : 'hidden'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Retailer Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                  Retailers per page
                </label>
                <select
                  id="limit"
                  name="limit"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="createdAt">Date Registered</option>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                  <option value="companyName">Company Name</option>
                  <option value="retailerStatus">Status</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex">
              <div className="flex-grow">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by name, email, or company"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={applyFilters}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Retailers Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-lg text-gray-600">Loading retailers...</span>
            </div>
          ) : retailers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No retailers found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('firstName')}
                      >
                        Retailer
                        {filters.sortBy === 'firstName' ? (
                          filters.sortOrder === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('companyName')}
                      >
                        Company
                        {filters.sortBy === 'companyName' ? (
                          filters.sortOrder === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Settings
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('retailerStatus')}
                      >
                        Status
                        {filters.sortBy === 'retailerStatus' ? (
                          filters.sortOrder === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('createdAt')}
                      >
                        Registered
                        {filters.sortBy === 'createdAt' ? (
                          filters.sortOrder === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {retailers.map((retailer) => (
                    <tr key={retailer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                            <Link
                            href={`/admin/customers/${retailer.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                              {retailer.firstName} {retailer.lastName}
                            </Link>
                            </div>
                            <div className="text-sm text-gray-500">{retailer.email}</div>
                            {retailer.phone && (
                              <div className="text-xs text-gray-500">{retailer.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {retailer.companyName || 'Not specified'}
                            </div>
                            {retailer.businessType && (
                              <div className="text-xs text-gray-500">{retailer.businessType}</div>
                            )}
                            {retailer.taxId && (
                              <div className="text-xs text-gray-500">Tax ID: {retailer.taxId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-900">
                              {retailer.allowPartialPayment ? 'Partial payment allowed' : 'Full payment only'}
                            </span>
                          </div>
                          {retailer.retailerStatus === 'approved' && (
                            <div className="mt-1 flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-900">
                                Credit Limit: ${parseFloat(retailer.creditLimit || 0).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(retailer.retailerStatus)}`}>
                          {getStatusIcon(retailer.retailerStatus)}
                          {retailer.retailerStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(retailer.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-3 justify-end">
                          <Link
                            href={`/admin/customers/${retailer.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <Link
                            href={`/admin/customers/${retailer.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && retailers.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> retailers
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        filters.page === 1 ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around the current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (filters.page <= 3) {
                        pageNum = i + 1;
                      } else if (filters.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = filters.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            filters.page === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        filters.page === totalPages ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>

              {/* Mobile pagination */}
              <div className="flex sm:hidden items-center justify-between w-full">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 ${
                    filters.page === 1 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  Previous
                </button>
                <p className="text-sm text-gray-700">
                  Page {filters.page} of {totalPages}
                </p>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 ${
                    filters.page === totalPages ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create a loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="flex items-center space-x-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-lg text-gray-600">Loading retailers...</span>
      </div>
    </div>
  );
}

// Main component that wraps RetailerListContent in a Suspense boundary
export default function RetailerList() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RetailerListContent />
    </Suspense>
  );
}