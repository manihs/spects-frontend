// components/ProductSection.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductCard = React.memo(({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const parseImages = (imagesData) => {
    try {
      if (typeof imagesData === 'string') {
        const parsed = JSON.parse(imagesData);
        return parsed.map(path => 
          path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`
        );
      }
      return [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  };

  const images = parseImages(product.images);
  const defaultImage = 'https://dummyimage.com/400X400';
  
  // Preload images
  useEffect(() => {
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  const currentImage = images[currentImageIndex] || defaultImage;

  return (
    <div 
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />
        {parseFloat(product.offerPrice) < parseFloat(product.basePrice) && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">
            SALE
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            {parseFloat(product.offerPrice) < parseFloat(product.basePrice) ? (
              <>
                <span className="text-sm font-medium text-gray-900">
                  ${parseFloat(product.offerPrice).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${parseFloat(product.basePrice).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                ${parseFloat(product.basePrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

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
        const cacheKey = `${apiUrl}?${queryString}`;
        if (cachedProducts[cacheKey]) {
          setProducts(cachedProducts[cacheKey]);
          setLoading(false);
          return;
        }
        
        const response = await axiosInstance.get(`${apiUrl}?${queryString}`);
        
        if (response.success) {
          setProducts(response.data.products);
          // Cache the response
          setCachedProducts(prev => ({
            ...prev,
            [cacheKey]: response.data.products
          }));
        } else {
          throw new Error(response.message || 'Failed to fetch products');
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
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              View All 
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          navigation
          pagination={{ clickable: true }}
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
              <Link href={`/products/${product.slug}`}>
                <ProductCard product={product} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductSection;