'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function ProductsListPage() {
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

        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <p className="text-gray-500 text-lg text-center py-12">No products found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
