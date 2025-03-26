'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from '@/lib/axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Create a loading fallback component
function ProductsLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500 text-lg">Loading products...</p>
      </div>
    </div>
  );
}

// Content component that uses useSearchParams
function ProductsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Get all URL parameters
      const params = new URLSearchParams();
      
      // Add pagination params
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.itemsPerPage);
      
      // Add sort params if present
      const sort = searchParams.get('sort') || 'updatedAt,DESC';
      const [sortBy, order] = sort.split(',');
      params.append('sortBy', sortBy);
      params.append('order', order);
      
      // Add filter params if present
      const category = searchParams.get('category');
      const collection = searchParams.get('collection');
      const search = searchParams.get('search');
      
      if (category) params.append('category', category);
      if (collection) params.append('collection', collection);
      if (search) params.append('search', search);
      
      // Add attribute filters if present
      Array.from(searchParams.entries()).forEach(([key, value]) => {
        if (key.startsWith('attribute_')) {
          const attributeId = key.replace('attribute_', '');
          params.append(`attribute[${attributeId}]`, value);
        }
      });

      // Debug: Log API request
      console.log(`[DEBUG] Fetching products with params: ${params.toString()}`);

      const response = await axios.get(`/api/product?${params.toString()}&t=${new Date().getTime()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      // Debug: Log API response
      console.log('[DEBUG] API Response:', response.data);

      if (response.success) {
        const { products: productsData, pagination: paginationData } = response.data;
        setProducts(productsData);
        setPagination({
          currentPage: paginationData.currentPage,
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          itemsPerPage: paginationData.itemsPerPage
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('[ERROR] Failed to fetch products:', err.message);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page') || 1;
    setPagination(prev => ({ ...prev, currentPage: parseInt(page) }));
    fetchProducts();
  }, [searchParams]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage.toString());
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-2" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.length > 0 ? (
                  products.map(product => <ProductCard key={product.id} product={product} />)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No products found</p>
                    <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {products.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        pagination.currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        pagination.currentPage === pagination.totalPages ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component that wraps ProductsListContent in a Suspense boundary
export default function ProductsListPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ProductsListContent />
    </Suspense>
  );
}