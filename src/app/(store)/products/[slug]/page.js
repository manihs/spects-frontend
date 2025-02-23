// app/product/[slug]/page.js
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

// Get related products based on category or collection
async function getRelatedProducts(product) {
  if (!product) return [];
  
  try {
    // You can modify this to use category ID, collection ID, or tags
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/related`, {
      params: {
        categoryId: product.categoryId,
        productId: product.id, // Exclude current product
        limit: 4 // Number of related products to fetch
      }
    });
    
    return response.data.success ? response.data.data : [];
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
    description: product.seoDescription,
    keywords: product.seoKeywords,
  };
}
