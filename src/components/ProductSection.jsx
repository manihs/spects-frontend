// components/ProductSection.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import ProductCard from './ProductCard';
import axios from 'axios';

const ProductSection = ({
  title,
  apiUrl,
  queryParams = {},
  productsToShow = 8,
  viewAllLink,
  className = ''
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedProducts, setCachedProducts] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryString = new URLSearchParams({
          ...queryParams,
          limit: productsToShow,
        }).toString();

        // Check if we have cached data for this query
        const cacheKey = `${process.env.NEXT_PUBLIC_API_URL}${apiUrl}`;
        if (cachedProducts[cacheKey]) {
          setProducts(cachedProducts[cacheKey]);
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${apiUrl}`);
        
        if (response.data.success) {
          setProducts(response.data.data.products);
          // Cache the response
          setCachedProducts(prev => ({
            ...prev,
            [cacheKey]: response.data.data.products
          }));
        } else {
          throw new Error(response.data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl, queryParams, productsToShow, cachedProducts]);

  if (loading) {
    return (
      <section className={`relative overflow-hidden py-12 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`relative overflow-hidden py-12 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="mb-4 text-red-500">
              <svg 
                className="w-12 h-12 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Products
            </h3>
            <p className="text-gray-600 max-w-md">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden py-12 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="flex items-center text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View All 
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { slidesPerView: 1.2, spaceBetween: 16 },
            480: { slidesPerView: 2.2, spaceBetween: 16 },
            768: { slidesPerView: 3.2, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="product-swiper !overflow-visible"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductSection;