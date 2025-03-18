'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from '@/lib/axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

const sortOptions = [
  { label: 'Latest', value: 'updatedAt,DESC' },
  { label: 'Oldest', value: 'updatedAt,ASC' },
  { label: 'Price: Low to High', value: 'basePrice,ASC' },
  { label: 'Price: High to Low', value: 'basePrice,DESC' },
  { label: 'Name: A-Z', value: 'name,ASC' },
  { label: 'Name: Z-A', value: 'name,DESC' }
];

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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('updatedAt,DESC');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  
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
      const [sortBy, order] = selectedSort.split(',');
  
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy,
        order
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCollection) params.append('collection', selectedCollection);
      if (searchQuery) params.append('search', searchQuery);

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
    const category = searchParams.get('category') || '';
    const collection = searchParams.get('collection') || '';
    const sort = searchParams.get('sort') || 'updatedAt,DESC';
    
    console.log('[DEBUG] URL Params:', { page, category, collection, sort });

    setPagination(prev => ({ ...prev, currentPage: parseInt(page) }));
    setSelectedCategory(category);
    setSelectedCollection(collection);
    setSelectedSort(sort);
    
    fetchProducts();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-2" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {products.length > 0 ? (
              products.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        )}
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