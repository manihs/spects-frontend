'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react"
import axios from 'axios';
import { toast } from "sonner";
import {
  Percent,
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
  DollarSign,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Create a component that uses useSearchParams
function TaxSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession()
  
  // State for taxes and pagination
  const [taxes, setTaxes] = useState([]);
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
  
  // State for filter UI
  const [showFilters, setShowFilters] = useState(false);
  
  // State for tax CRUD operations
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [taxForm, setTaxForm] = useState({
    name: '',
    rate: 0,
    description: '',
    status: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState(null);
  
  // Get auth token from session
  const getAuthToken = () => {
    return session?.accessToken;
  };

  // Load taxes
  useEffect(() => {
    if (status !== "loading") {
      fetchTaxes();
    }
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

  // Fetch taxes based on current filters
  const fetchTaxes = async () => {
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/taxes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.data.success) {
        setTaxes(response.data.data.taxes);
        setTotalItems(response.data.data.pagination.totalItems);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        toast.error('Failed to load taxes');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching taxes:', error);
      toast.error('Error loading taxes: ' + (error.response?.data?.message || error.message));
      setIsLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = () => {
    setFilters({
      ...filters,
      page: 1 // Reset to first page when applying new filters
    });
    fetchTaxes();
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
  
  // Open tax modal for adding a new tax
  const handleAddTax = () => {
    setEditingTax(null);
    setTaxForm({
      name: '',
      rate: 0,
      description: '',
      status: true
    });
    setShowTaxModal(true);
  };
  
  // Open tax modal for editing an existing tax
  const handleEditTax = (tax) => {
    setEditingTax(tax);
    setTaxForm({
      name: tax.name,
      rate: parseFloat(tax.rate),
      description: tax.description || '',
      status: tax.status
    });
    setShowTaxModal(true);
  };
  
  // Open delete confirmation modal
  const handleDeleteTax = (tax) => {
    setTaxToDelete(tax);
    setShowDeleteModal(true);
  };
  
  // Handle input changes in tax form
  const handleTaxFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaxForm({
      ...taxForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Submit tax form (create or update)
  const handleTaxSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingTax) {
        // Update existing tax
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/taxes/${editingTax.id}`, taxForm, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (response.data.success) {
          // Update the tax in the local state
          const updatedTaxes = taxes.map(tax => {
            if (tax.id === editingTax.id) {
              return response.data.data;
            }
            return tax;
          });
          
          setTaxes(updatedTaxes);
          setShowTaxModal(false);
          toast.success('Tax updated successfully');
        } else {
          toast.error('Failed to update tax: ' + response.data.message);
        }
      } else {
        // Create new tax
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/taxes`, taxForm, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (response.data.success) {
          // Add the new tax to the local state
          setTaxes([...taxes, response.data.data]);
          setShowTaxModal(false);
          toast.success('Tax created successfully');
        } else {
          toast.error('Failed to create tax: ' + response.data.message);
        }
      }
    } catch (error) {
      console.error('Error saving tax:', error);
      toast.error(editingTax ? 
        'Failed to update tax: ' + (error.response?.data?.message || error.message) : 
        'Failed to create tax: ' + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Confirm tax deletion
  const confirmDeleteTax = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/taxes/${taxToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.data.success) {
        // Remove the tax from the local state
        const updatedTaxes = taxes.filter(tax => tax.id !== taxToDelete.id);
        
        setTaxes(updatedTaxes);
        setShowDeleteModal(false);
        setTaxToDelete(null);
        toast.success('Tax deleted successfully');
      } else {
        toast.error('Failed to delete tax: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting tax:', error);
      toast.error('Failed to delete tax: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate pagination info
  const startItem = (filters.page - 1) * filters.limit + 1;
  const endItem = Math.min(filters.page * filters.limit, totalItems);

  // You can check the loading state
  if (status === "loading") {
    return <div>Loading...</div>
  }

  // Check if user is not authenticated
  if (status === "unauthenticated") {
    return <div>Access Denied</div>
  }

  // Access session data
  console.log("User email:", session?.user?.email)
  console.log("User name:", session?.user?.name)
  console.log("Full session data:", session)

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Percent className="mr-3 h-6 w-6 text-blue-600" />
            Tax Settings
          </h1>
          <button
            type="button"
            onClick={handleAddTax}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Tax
          </button>
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
                  Tax Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                  Items per page
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
                  <option value="name">Name</option>
                  <option value="rate">Rate</option>
                  <option value="createdAt">Date Created</option>
                  <option value="updatedAt">Date Updated</option>
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
                    placeholder="Search by name or description"
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

        {/* Taxes Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-lg text-gray-600">Loading taxes...</span>
            </div>
          ) : taxes.length === 0 ? (
            <div className="p-8 text-center">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No taxes found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button
                type="button"
                onClick={handleAddTax}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Tax
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('name')}
                      >
                        Name
                        {filters.sortBy === 'name' ? (
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
                        onClick={() => handleSort('rate')}
                      >
                        Rate (%)
                        {filters.sortBy === 'rate' ? (
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
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('updatedAt')}
                      >
                        Last Updated
                        {filters.sortBy === 'updatedAt' ? (
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
                  {taxes.map((tax) => (
                    <tr key={tax.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Percent className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{tax.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {parseFloat(tax.rate).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">{tax.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tax.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tax.status ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tax.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-3 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditTax(tax)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTax(tax)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && taxes.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> taxes
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
        
        {/* Tax Form Modal */}
        {showTaxModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowTaxModal(false)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleTaxSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4"><div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <Percent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {editingTax ? 'Edit Tax' : 'Add New Tax'}
                        </h3>
                        
                        <div className="mt-4 space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Tax Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={taxForm.name}
                                onChange={handleTaxFormChange}
                                placeholder="e.g. Standard Tax, GST, VAT"
                                required
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                              Tax Rate (%)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">%</span>
                              </div>
                              <input
                                type="number"
                                name="rate"
                                id="rate"
                                min="0"
                                max="100"
                                step="0.01"
                                value={taxForm.rate}
                                onChange={handleTaxFormChange}
                                placeholder="e.g. 18"
                                required
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                name="description"
                                rows="3"
                                value={taxForm.description}
                                onChange={handleTaxFormChange}
                                placeholder="Optional tax description"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                disabled={isSubmitting}
                              ></textarea>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              id="status"
                              name="status"
                              type="checkbox"
                              checked={taxForm.status}
                              onChange={handleTaxFormChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={isSubmitting}
                            />
                            <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                              Active
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          {editingTax ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {editingTax ? 'Update Tax' : 'Create Tax'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowTaxModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSubmitting && setShowDeleteModal(false)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Tax
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the tax "{taxToDelete?.name}"? This action cannot be undone.
                        </p>
                        {taxToDelete?.name === 'No Tax' && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                            <p className="text-sm text-yellow-800 font-medium">
                              Warning: Deleting the "No Tax" option may cause issues with products that don't require taxation.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={confirmDeleteTax}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        Delete
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
}

// Create a loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="flex items-center space-x-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-lg text-gray-600">Loading tax settings...</span>
      </div>
    </div>
  );
}

// Main component that wraps TaxSettingsContent in a Suspense boundary
export default function TaxSettings() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TaxSettingsContent />
    </Suspense>
  );
}