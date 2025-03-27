'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, LayoutGrid, Trash2, Search, Plus, X } from 'lucide-react';
import axios from '@/lib/axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Image from 'next/image';

// Utility function to format price
const formatPrice = (price) => {
  const numPrice = Number(price);
  return isNaN(numPrice) ? '$0.00' : `$${numPrice.toFixed(2)}`;
};

export default function EditCollectionPage() {
  const params = useParams();
  const collectionId = params.id;
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Product search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialProductsLoading, setInitialProductsLoading] = useState(true);
  
  // State for form data
  const [collectionData, setCollectionData] = useState({
    name: '',
    uniqueCode: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    status: 'active',
    showProducts: true,
    storeMenu: true,
    products: []
  });
  
  // Fetch collection data
  const fetchCollection = useCallback(async () => {
    if (!collectionId) return;
    
    setFetchLoading(true);
    
    try {
      const response = await axios.get(`/api/collections/${collectionId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch collection');
      }
      
      const collection = response.data;
      
      // Update state values
      setCollectionData({
        name: collection.name || '',
        uniqueCode: collection.uniqueCode || '',
        seoTitle: collection.seoTitle || '',
        seoDescription: collection.seoDescription || '',
        seoKeywords: collection.seoKeywords || '',
        status: collection.status || 'active',
        showProducts: collection.showProducts ?? true,
        storeMenu: collection.storeMenu ?? true,
        products: collection.products || []
      });
    } catch (error) {
      toast.error('Failed to fetch collection', {
        description: error.message || 'Error loading collection details'
      });
    } finally {
      setFetchLoading(false);
    }
  }, [collectionId]);
  
  // Fetch initial products
  const fetchInitialProducts = useCallback(async () => {
    try {
      const response = await axios.get('/api/product', {
        params: { 
          limit: 10,
          sort: 'createdAt',
          order: 'desc'
        }
      });
      
      if (response.success) {
        // Filter out products already in the collection
        const existingProductIds = new Set(
          collectionData.products.map(p => p.id)
        );
        
        setSearchResults(
          response.data.products.filter(
            (product) => !existingProductIds.has(product.id)
          )
        );
      }
    } catch (error) {
      toast.error('Failed to load products', {
        description: error.message || 'Error loading products'
      });
    } finally {
      setInitialProductsLoading(false);
    }
  }, [collectionData.products]);
  
  // Initial data fetch
  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);
  
  // Fetch initial products after collection data is loaded
  useEffect(() => {
    if (!fetchLoading && collectionData.products) {
      fetchInitialProducts();
    }
  }, [fetchLoading, collectionData.products, fetchInitialProducts]);
  
  // Search products
  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      // If search is cleared, show initial products
      fetchInitialProducts();
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await axios.get('/api/product', {
        params: { 
          search: searchQuery,
          limit: 10,
          sort: 'createdAt',
          order: 'desc'
        }
      });
      
      if (response.success) {
        // Filter out products already in the collection
        const existingProductIds = new Set(
          collectionData.products.map(p => p.id)
        );
        
        setSearchResults(
          response.data.products.filter(
            (product) => !existingProductIds.has(product.id)
          )
        );
      } else {
        toast.error('Failed to search products', {
          description: response.message || 'Error searching products'
        });
      }
    } catch (error) {
      toast.error('Failed to search products', {
        description: error.message || 'An error occurred while searching'
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Add product to collection
  const addProductToCollection = async (product) => {
    try {
      const response = await axios.post('/api/collections/add-product', {
        collectionId,
        productId: product.id
      });
      
      if (response.success) {
        // Optimistically update local state
        setCollectionData(prev => ({
          ...prev,
          products: [...prev.products, product]
        }));
        
        // Update search results to remove the added product
        setSearchResults(prev => prev.filter(p => p.id !== product.id));
        
        toast.success('Product added to collection');
      } else {
        throw new Error(response.message || 'Failed to add product');
      }
    } catch (error) {
      toast.error('Failed to add product', {
        description: error.message || 'An error occurred while adding the product'
      });
    }
  };
  
  // Remove product from collection
  const removeProductFromCollection = async (productId) => {
    try {
      const response = await axios.post('/api/collections/remove-product', {
        collectionId,
        productId
      });
      
      if (response.success) {
        // Optimistically update local state
        setCollectionData(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));
        
        // Refresh search results to include the removed product
        if (searchQuery) {
          searchProducts();
        } else {
          fetchInitialProducts();
        }
        
        toast.success('Product removed from collection');
      } else {
        throw new Error(response.message || 'Failed to remove product');
      }
    } catch (error) {
      toast.error('Failed to remove product', {
        description: error.message || 'An error occurred while removing the product'
      });
    }
  };
  
  // Helper to update collection data
  const updateCollectionData = (key, value) => {
    setCollectionData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionId) return;
    
    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        name: collectionData.name,
        seoTitle: collectionData.seoTitle,
        seoDescription: collectionData.seoDescription,
        seoKeywords: collectionData.seoKeywords,
        status: collectionData.status,
        showProducts: collectionData.showProducts,
        storeMenu: collectionData.storeMenu
      };
      
      const response = await axios.put(`/api/collections/${collectionId}`, submitData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update collection');
      }
      
      toast.success('Collection updated successfully');
      
      // Navigate back to collection list
      // router.push('/admin/product/collections');
    } catch (error) {
      toast.error('Failed to update collection', {
        description: error.message || 'An error occurred while updating the collection'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle collection deletion
  const handleDelete = async () => {
    if (!collectionId) return;
    
    try {
      const response = await axios.delete(`/api/collections/${collectionId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete collection');
      }
      
      toast.success('Collection deleted successfully');
      
      // Navigate back to collection list
      router.push('/admin/product/collections');
    } catch (error) {
      toast.error('Failed to delete collection', {
        description: error.message || 'An error occurred while deleting the collection'
      });
    }
  };
  
  if (fetchLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/admin/product/collections')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Edit Collection</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Collection
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the collection and remove all associated products.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5" />
              Collection Details
            </CardTitle>
            <CardDescription>
              Edit collection information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input 
                  value={collectionData.name}
                  onChange={(e) => updateCollectionData('name', e.target.value)}
                  placeholder="e.g. Summer Collection, New Arrivals"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Unique Code *</label>
                <Input 
                  value={collectionData.uniqueCode}
                  readOnly
                  className="mt-1 font-mono bg-muted"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Status *</label>
                <select 
                  value={collectionData.status}
                  onChange={(e) => updateCollectionData('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background mt-1"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Show Products</label>
                    <p className="text-xs text-muted-foreground">
                      Show products from this collection on the collection page
                    </p>
                  </div>
                  <Switch
                    checked={collectionData.showProducts}
                    onCheckedChange={(checked) => updateCollectionData('showProducts', checked)}
                  />
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Store Menu</label>
                    <p className="text-xs text-muted-foreground">
                      Show this collection in store navigation menu
                    </p>
                  </div>
                  <Switch
                    checked={collectionData.storeMenu}
                    onCheckedChange={(checked) => updateCollectionData('storeMenu', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Products in Collection Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5" />
              Collection Products
            </CardTitle>
            <CardDescription>
              Manage products in this collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Search */}
            <div className="flex space-x-2">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products to add..."
                className="flex-grow"
              />
              {searchLoading && (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Search Results or Initial Products */}
            {(searchResults.length > 0 || initialProductsLoading) && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>
                    {searchQuery ? 'Search Results' : 'Available Products'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {initialProductsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name || 'Product Image'} 
                                  width={50} 
                                  height={50} 
                                  className="object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  No Image
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{product.name || 'Unnamed Product'}</TableCell>
                            <TableCell>{product.sku || 'N/A'}</TableCell>
                            <TableCell>{formatPrice(product.basePrice || product.price)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => addProductToCollection(product)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Current Collection Products */}
            {collectionData.products && collectionData.products.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Products in Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionData.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name || 'Product Image'} 
                                width={50} 
                                height={50} 
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                No Image
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{product.name || 'Unnamed Product'}</TableCell>
                          <TableCell>{product.sku || 'N/A'}</TableCell>
                          <TableCell>{formatPrice(product.basePrice || product.price)}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeProductFromCollection(product.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        
        {/* SEO Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Information</CardTitle>
            <CardDescription>
              Optimize your collection for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">SEO Title</label>
              <Input 
                value={collectionData.seoTitle}
                onChange={(e) => updateCollectionData('seoTitle', e.target.value)}
                placeholder="SEO optimized title"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 50-60 characters
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">SEO Keywords</label>
              <Input 
                value={collectionData.seoKeywords}
                onChange={(e) => updateCollectionData('seoKeywords', e.target.value)}
                placeholder="summer, new arrivals, sale items"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma separated keywords
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">SEO Description</label>
              <Textarea 
                value={collectionData.seoDescription}
                onChange={(e) => updateCollectionData('seoDescription', e.target.value)}
                placeholder="Brief description for search engines"
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 150-160 characters
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Form Footer */}
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/product/collections')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Collection
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}