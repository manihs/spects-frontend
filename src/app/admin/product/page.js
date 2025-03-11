'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import {
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
  Clock,
  Tag,
  DollarSign,
  ListFilter,
  ShoppingCart,
  Layers
} from 'lucide-react';

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for filters and sorting
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    category: searchParams.get('category') || '',
    collection: searchParams.get('collection') || '',
    search: searchParams.get('search') || '',
    hasVariants: searchParams.get('hasVariants') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'DESC'
  });
  
  // State for filter UI
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load products
  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [filters.page, filters.limit, filters.sortBy, filters.order]);

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

  // Fetch products based on current filters
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value.toString());
        }
      });
      
      const response = await axiosInstance.get(`/api/product?${params.toString()}`);
      
      if (response.success) {
        setProducts(response.data.products);
        setTotalItems(response.data.record);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and collections for filters
  const fetchFilterOptions = async () => {
    try {
      const [categoriesResponse, collectionsResponse] = await Promise.all([
        axiosInstance.get('/api/categories'),
        axiosInstance.get('/api/collections')
      ]);
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories);
      }
      
      if (collectionsResponse.success) {
        setCollections(collectionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Apply filters and search
  const applyFilters = () => {
    setFilters({
      ...filters,
      page: 1 // Reset to first page when applying new filters
    });
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
      order: filters.sortBy === column && filters.order === 'ASC' ? 'DESC' : 'ASC'
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
      category: '',
      collection: '',
      search: '',
      hasVariants: '',
      sortBy: 'createdAt',
      order: 'DESC'
    });
  };

  // Handle product selection
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  // Delete selected products
  const deleteSelectedProducts = async () => {
    if (!selectedProducts.length) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await Promise.all(
        selectedProducts.map(id => axiosInstance.delete(`/api/product/${id}`))
      );
      
      toast.success(`${selectedProducts.length} product(s) deleted successfully`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('Failed to delete some products');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete a single product
  const deleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/api/product/${id}`);
      toast.success(`Product "${name}" deleted successfully`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product "${name}"`);
    }
  };

  // Calculate pagination info
  const startItem = (filters.page - 1) * filters.limit + 1;
  const endItem = Math.min(filters.page * filters.limit, totalItems);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-3 h-6 w-6 text-blue-600" />
            Products
          </h1>
          <div className="flex space-x-3">
            <Link
              href="/admin/product/variants"
              className="inline-flex items-center px-4 py-2 border border-purple-600 text-sm font-medium rounded-md shadow-sm text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Layers className="h-4 w-4 mr-2" />
              Manage All Variants
            </Link>
            <Link
              href="/admin/product/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
                  Collection
                </label>
                <select
                  id="collection"
                  name="collection"
                  value={filters.collection}
                  onChange={(e) => handleFilterChange('collection', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Collections</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.seoSlug}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="hasVariants" className="block text-sm font-medium text-gray-700">
                  Variants
                </label>
                <select
                  id="hasVariants"
                  name="hasVariants"
                  value={filters.hasVariants}
                  onChange={(e) => handleFilterChange('hasVariants', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Products</option>
                  <option value="true">With Variants</option>
                  <option value="false">Without Variants</option>
                </select>
              </div>

              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                  Products per page
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
                    placeholder="Search products by name, SKU, or description"
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

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div className="text-sm text-blue-700">
              <span className="font-medium">{selectedProducts.length}</span> product(s) selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedProducts([])}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Clear Selection
              </button>
              <button
                onClick={deleteSelectedProducts}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-lg text-gray-600">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <div className="flex space-x-3">
                <Link
                  href="/admin/product/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Link>
                <Link
                  href="/admin/product/variants/create"
                  className="inline-flex items-center px-4 py-2 border border-purple-600 text-sm font-medium rounded-md shadow-sm text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Add Product Variant
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="pl-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th scope="col" className="pl-3 pr-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('name')}
                      >
                        Product
                        {filters.sortBy === 'name' ? (
                          filters.order === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('basePrice')}
                      >
                        Price
                        {filters.sortBy === 'basePrice' ? (
                          filters.order === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('quantity')}
                      >
                        Stock
                        {filters.sortBy === 'quantity' ? (
                          filters.order === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-1 text-gray-400" />
                        Variants
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {filters.sortBy === 'status' ? (
                          filters.order === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
                        {filters.sortBy === 'createdAt' ? (
                          filters.order === 'ASC' ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-gray-400" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="relative px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="pl-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={`${process.env.NEXT_PUBLIC_API_URL}${JSON.parse(product.images)[0]}`}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            {product.hasVariants ? (
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                <Layers className="h-3 w-3 mr-1" />
                                {product.variants ? product.variants.length : 0} Variants
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 mt-1">No variants</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            ${parseFloat(product.basePrice).toFixed(2)}
                          </div>
                          {product.offerPrice && (
                            <div className="text-xs text-green-600">
                              Sale: ${parseFloat(product.offerPrice).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity || 0}</div>
                        <div className="text-xs text-gray-500">{product.stockStatus}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          {product.hasVariants ? (
                            <>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mr-2">
                                  {product.variants ? product.variants.length : 0}
                                </span>
                                <Link 
                                  href={`/admin/product/${product.id}/variants`}
                                  className="text-purple-600 hover:text-purple-900 font-medium flex items-center"
                                >
                                  <span>Manage</span>
                                </Link>
                              </div>
                              <Link
                                href={`/admin/product/${product.id}/variants/add`}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                + Add variant
                              </Link>
                            </>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500">No variants</span>
                              <Link
                                href={`/admin/product/${product.id}/variants/add`}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                + Add first variant
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {product.category ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/product/${product.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/product/${product.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/product/${product.id}/variants`}
                            className="text-purple-600 hover:text-purple-900"
                            title="Manage Variants"
                          >
                            <Layers className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
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
          {!isLoading && products.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> products
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