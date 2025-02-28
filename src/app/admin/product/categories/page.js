'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import { 
  Loader2, Plus, Search, Filter, 
  ChevronDown, ChevronUp, MoreHorizontal, Trash2, 
  Edit, Eye, ArrowUpDown, Check, X, AlertTriangle 
} from 'lucide-react';

export default function CategoriesList() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isSearching, setIsSearching] = useState(false);
  
  // Bulk actions state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Fetch categories with pagination, search, and filters
  const fetchCategories = async (page = 1, resetSelection = true) => {
    if (resetSelection) {
      setSelectedCategories([]);
      setSelectAll(false);
    }
    
    setIsLoading(true);
    
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        sortBy,
        sortOrder
      };
      
      // Add search term if provided
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Add status filter if not 'all'
      if (filterStatus !== 'all') {
        params.status = filterStatus === 'active' ? 1 : 0;
      }
      
      const response = await axiosInstance.get('/api/categories', { params });
      
      if (response.success) {
        setCategories(response.data.categories);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Load categories on initial render and when sort or filter changes
  useEffect(() => {
    fetchCategories(pagination.currentPage, false);
  }, [sortBy, sortOrder, filterStatus]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    fetchCategories(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchCategories(newPage, false);
  };

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  // Handle individual item selection
  const handleSelectItem = (id) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(category => category.id));
    }
    setSelectAll(!selectAll);
  };

  // Effect to update selectAll state based on selection
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === categories.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
    
    // Toggle bulk actions visibility
    setShowBulkActions(selectedCategories.length > 0);
  }, [selectedCategories, categories]);

  // Handle single delete
  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/categories/${id}`);
      if (response.success) {
        toast.success('Category deleted successfully');
        fetchCategories(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    
    setIsBulkDeleting(true);
    
    try {
      const response = await axiosInstance.post('/api/categories/bulk-delete', {
        ids: selectedCategories
      });
      
      if (response.success) {
        toast.success(`Successfully deleted ${selectedCategories.length} categories`);
        setSelectedCategories([]);
        setSelectAll(false);
        fetchCategories(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete categories');
      console.error('Error deleting categories:', error);
    } finally {
      setIsBulkDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Get sort icon for column header
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortOrder === 'ASC' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <Link href="/admin/product/categories/create">
              <span className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Add New Category
              </span>
            </Link>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            Manage your store categories and subcategories
          </div>
        </div>

        {/* Bulk Delete Confirmation Dialog */}
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Categories</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete {selectedCategories.length} selected categories? This action cannot be undone. All associated data will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isBulkDeleting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete All'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter, and Bulk Actions */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
              
              {/* Filter dropdown */}
              <div className="sm:w-48">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-md">
                <div className="text-sm">
                  <span className="font-medium text-blue-700">{selectedCategories.length}</span>
                  <span className="text-blue-700"> categories selected</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Categories Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('id')}
                          className="group flex items-center font-medium focus:outline-none"
                        >
                          ID {getSortIcon('id')}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="group flex items-center font-medium focus:outline-none"
                        >
                          Name {getSortIcon('name')}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('status')}
                          className="group flex items-center font-medium focus:outline-none"
                        >
                          Status {getSortIcon('status')}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="group flex items-center font-medium focus:outline-none"
                        >
                          Created {getSortIcon('createdAt')}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <tr 
                          key={category.id} 
                          className={`hover:bg-gray-50 ${selectedCategories.includes(category.id) ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => handleSelectItem(category.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {category.image && (
                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${category.image}`} 
                                    alt={category.name} 
                                  />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-500">{category.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.parent ? (
                              <span className="px-2 py-1 text-xs bg-gray-100 rounded-md">{category.parent.name}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {category.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link href={`/admin/product/categories/${category.id}`}>
                                <span className="text-blue-600 hover:text-blue-900">
                                  <Edit className="h-4 w-4" />
                                </span>
                              </Link>
                              <Link href={`/category/${category.slug}`} target="_blank">
                                <span className="text-gray-600 hover:text-gray-900">
                                  <Eye className="h-4 w-4" />
                                </span>
                              </Link>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
                                    handleDelete(category.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                          {searchTerm ? (
                            <div className="flex flex-col items-center">
                              <Search className="h-8 w-8 text-gray-400 mb-2" />
                              <p>No categories matching "<strong>{searchTerm}</strong>"</p>
                              <button 
                                onClick={() => {
                                  setSearchTerm('');
                                  fetchCategories(1);
                                }}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <p className="mb-4">No categories found</p>
                              <Link href="/admin/product/categories/create">
                                <span className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                  Create your first category
                                </span>
                              </Link>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.totalItems}</span> categories
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">First</span>
                          <span>&laquo;</span>
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronDown className="h-5 w-5 rotate-90" />
                        </button>
                        
                        {/* Page Numbers */}
                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const pageNumber = i + 1;
                          
                          // Show current page, adjacent pages, first page, and last page
                          if (
                            pageNumber === 1 ||
                            pageNumber === pagination.totalPages ||
                            (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                aria-current={pagination.currentPage === pageNumber ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pagination.currentPage === pageNumber
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          
                          // Show ellipsis for page jumps
                          if (
                            (pageNumber === 2 && pagination.currentPage > 3) ||
                            (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronDown className="h-5 w-5 -rotate-90" />
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Last</span>
                          <span>&raquo;</span>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}