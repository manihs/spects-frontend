import { Eye, ShoppingCart, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const ProductCard = ({ product }) => {
  const { data: session } = useSession();
  
  // Parse images if they exist and are in string format
  const productImages = product.images ? 
    (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) 
    : [];

  // Get first image or placeholder
  const mainImage = productImages.length > 0 ? 
    process.env.NEXT_PUBLIC_API_URL + productImages[0] : 
    '/api/placeholder/300/300';

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (product.basePrice && product.offerPrice) {
      const discount = ((product.basePrice - product.offerPrice) / product.basePrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Discount Badge - Only show if user is authenticated */}
      {session && calculateDiscount() > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-sm px-2 py-1 rounded">
          -{calculateDiscount()}%
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
        {session && (
          <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <div className="text-sm text-gray-500 mb-1">
            {product.category.name.toUpperCase()}
          </div>
        )}

        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Product Attributes */}
        <div className="mt-2 flex flex-wrap gap-2">
          {product.attributes?.map(attr => (
            <div 
              key={attr.id} 
              className="text-sm bg-gray-100 px-2 py-1 rounded"
            >
              {attr.attribute.name}: {attr.value}
            </div>
          ))}
        </div>

        {/* Price Section - Only show if user is authenticated */}
        {session ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.offerPrice)}
            </span>
            {product.basePrice !== product.offerPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <Link 
              href="/account/login" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Login to view price
            </Link>
          </div>
        )}

        {/* Stock Status */}
        <div className="mt-2">
          {product.stockStatus === 'in_stock' ? (
            <span className="text-sm text-green-600">In Stock</span>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Button - Only show if user is authenticated */}
        {session ? (
          <button 
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={product.stockStatus !== 'in_stock'}
          >
            {product.hasVariants ? 'View Options' : 'Add to Cart'}
          </button>
        ) : (
          <Link
            href="/account/login"
            className="mt-4 w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition-colors text-center block"
          >
            Sign in to Purchase
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;