// src/app/(store)/products/[slug]/page.js
import ProductDetail from './ProductDetail';
import axios from 'axios';

// This is the page component that Next.js App Router will render
export default async function ProductPage({ params }) {
  const { slug } = params;
  
  // Fetch product data server-side
  const product = await getProductBySlug(slug);
  const relatedProducts = await getRelatedProducts(product);
  
  return <ProductDetail initialProduct={product} relatedProducts={relatedProducts} />;
}

// Server-side data fetching function with axios
async function getProductBySlug(slug) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/slug/${slug}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Get related products based on category
async function getRelatedProducts(product) {
  if (!product) return [];
  
  try {
    // Use the existing product API endpoint with category filter
    // This approach is more reliable since we confirmed this endpoint exists
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product`, {
      params: {
        categoryId: product.categoryId,
        limit: 4, // Number of related products to fetch
        excludeProductId: product.id // You may need to add this parameter to your API
      },
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    // Get products and filter out the current one if needed
    let relatedProducts = response.data.success ? (response.data.data?.products || []) : [];
    
    // Ensure we don't show the current product in related products
    relatedProducts = relatedProducts.filter(p => p.id !== product.id);
    
    // Limit to 4 products
    return relatedProducts.slice(0, 4);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

// This generates metadata for the page
export async function generateMetadata({ params }) {
  const { slug } = params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }
  
  return {
    title: product.seoTitle || `${product.name} | Your Store`,
    description: product.seoDescription || `Shop ${product.name} and more products at our store.`,
    keywords: product.seoKeywords || `${product.name}, ${product.category?.name || 'products'}, shop, store`,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || `Shop ${product.name} at our store`,
      images: product.images ? 
        [
          {
            url: typeof product.images === 'string' ? 
              JSON.parse(product.images)[0] || '/api/placeholder/800/600' : 
              product.images[0] || '/api/placeholder/800/600',
            width: 800,
            height: 600,
            alt: product.name
          }
        ] : [{ url: '/api/placeholder/800/600', width: 800, height: 600, alt: product.name }]
    }
  };
}