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

// Helper to safely parse image URL from various formats
const getImageUrl = (imageData) => {
  try {
    // If it's falsy, return null
    if (!imageData) return null;
    
    // If it's already an array, use the first item
    if (Array.isArray(imageData) && imageData.length > 0) {
      return imageData[0];
    }
    
    // If it's a JSON string array like '["/uploads/products/1740747853622.jpg"]'
    if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch {
        // If not JSON, but still a URL string, return it
        if (imageData.startsWith('/') || imageData.startsWith('http')) {
          return imageData;
        }
      }
    }
  } catch (e) {
    console.error('Error parsing image URL:', e);
  }
  
  return null;
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
  
  // New state variables for enhanced UI
  const [activeTab, setActiveTab] = useState('available');
  const [selectedAvailableProducts, setSelectedAvailableProducts] = useState([]);
  const [selectedCollectionProducts, setSelectedCollectionProducts] = useState([]);
  
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
        
        // Remove from selected available products if it was selected
        setSelectedAvailableProducts(prev => prev.filter(id => id !== product.id));
        
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
        
        // Clear from selected products if it was selected
        setSelectedCollectionProducts(prev => prev.filter(id => id !== productId));
        
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
  
  // Handle product selection for multi-select
  const handleProductSelect = (productId, type) => {
    if (type === 'available') {
      setSelectedAvailableProducts(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId) 
          : [...prev, productId]
      );
    } else {
      setSelectedCollectionProducts(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId) 
          : [...prev, productId]
      );
    }
  };
  
  // Add multiple products at once
  const handleAddSelectedProducts = async () => {
    if (selectedAvailableProducts.length === 0) return;
    
    setLoading(true);
    try {
      // Get the products from search results
      const productsToAdd = searchResults.filter(p => 
        selectedAvailableProducts.includes(p.id)
      );
      
      // Add each product
      const promises = productsToAdd.map(product => 
        axios.post('/api/collections/add-product', {
          collectionId,
          productId: product.id
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setCollectionData(prev => ({
        ...prev,
        products: [...prev.products, ...productsToAdd]
      }));
      
      // Update search results
      setSearchResults(prev => 
        prev.filter(p => !selectedAvailableProducts.includes(p.id))
      );
      
      // Clear selections
      setSelectedAvailableProducts([]);
      
      toast.success(`${productsToAdd.length} products added to collection`);
    } catch (error) {
      toast.error('Failed to add products', {
        description: error.message || 'An error occurred while adding products'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Remove multiple products at once
  const handleRemoveSelectedProducts = async () => {
    if (selectedCollectionProducts.length === 0) return;
    
    setLoading(true);
    try {
      // Remove each product
      const promises = selectedCollectionProducts.map(productId => 
        axios.post('/api/collections/remove-product', {
          collectionId,
          productId
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setCollectionData(prev => ({
        ...prev,
        products: prev.products.filter(p => !selectedCollectionProducts.includes(p.id))
      }));
      
      // Refresh search results
      if (searchQuery) {
        searchProducts();
      } else {
        fetchInitialProducts();
      }
      
      // Clear selections
      setSelectedCollectionProducts([]);
      
      toast.success(`${selectedCollectionProducts.length} products removed from collection`);
    } catch (error) {
      toast.error('Failed to remove products', {
        description: error.message || 'An error occurred while removing products'
      });
    } finally {
      setLoading(false);
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
            {/* Enhanced Product Search with Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, SKU or description..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select 
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  onChange={(e) => {
                    // We would implement category filtering here
                    // This is a placeholder for now
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="1">Category 1</option>
                  <option value="2">Category 2</option>
                </select>
              </div>
            </div>
            
            {/* Tabs to switch between Available and Collection Products */}
            <div className="border-b">
              <div className="flex space-x-4">
                <button 
                  className={`py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'available' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setActiveTab('available');
                    setSelectedAvailableProducts([]);
                    setSelectedCollectionProducts([]);
                  }}
                >
                  Available Products
                </button>
                <button 
                  className={`py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'collection' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setActiveTab('collection');
                    setSelectedAvailableProducts([]);
                    setSelectedCollectionProducts([]);
                  }}
                >
                  Collection Products ({collectionData.products?.length || 0})
                </button>
              </div>
            </div>
            
            {activeTab === 'available' ? (
              /* Available Products Grid */
              <div>
                {initialProductsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No products found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try adjusting your search or filter
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Bulk Actions */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        {selectedAvailableProducts.length > 0 && (
                          <Button 
                            size="sm" 
                            onClick={handleAddSelectedProducts}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Selected ({selectedAvailableProducts.length})
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {searchResults.length} products found
                      </div>
                    </div>
                    
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((product) => (
                        <div 
                          key={product.id} 
                          className={`border rounded-lg overflow-hidden transition-all ${
                            selectedAvailableProducts.includes(product.id) 
                              ? 'ring-2 ring-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="p-2 flex items-start">
                            <input
                              type="checkbox"
                              className="mr-2 mt-1"
                              checked={selectedAvailableProducts.includes(product.id)}
                              onChange={() => handleProductSelect(product.id, 'available')}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {(() => {
                                    const imageUrl = getImageUrl(product.images);
                                    return imageUrl ? (
                                      <img 
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
                                        alt={product.name || 'Product'} 
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                                        No image
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                                  <div className="flex flex-col mt-1">
                                    <span className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
                                    <span className="text-sm font-medium">{formatPrice(product.basePrice || product.price)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => addProductToCollection(product)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Simple Pagination */}
                    {searchResults.length > 0 && (
                      <div className="flex justify-center mt-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mx-1"
                          disabled 
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mx-1 bg-primary text-primary-foreground"
                        >
                          1
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mx-1"
                          disabled 
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Collection Products Grid */
              <div>
                {!collectionData.products || collectionData.products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No products in collection</h3>
                    <p className="text-muted-foreground mt-1">
                      Add products to your collection from the Available Products tab
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Bulk Actions */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        {selectedCollectionProducts.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={handleRemoveSelectedProducts}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Selected ({selectedCollectionProducts.length})
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {collectionData.products.length} products in collection
                      </div>
                    </div>
                    
                    {/* Collection Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collectionData.products.map((product) => (
                        <div 
                          key={product.id} 
                          className={`border rounded-lg overflow-hidden transition-all ${
                            selectedCollectionProducts.includes(product.id) 
                              ? 'ring-2 ring-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="p-2 flex items-start">
                            <input
                              type="checkbox"
                              className="mr-2 mt-1"
                              checked={selectedCollectionProducts.includes(product.id)}
                              onChange={() => handleProductSelect(product.id, 'collection')}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {(() => {
                                    const imageUrl = getImageUrl(product.images);
                                    return imageUrl ? (
                                      <img 
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
                                        alt={product.name || 'Product'} 
                                        className="w-16 h-16 object-cover rounded" 
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                                        No image
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                                  <div className="flex flex-col mt-1">
                                    <span className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
                                    <span className="text-sm font-medium">{formatPrice(product.basePrice || product.price)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end">
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="h-8 text-xs"
                                  onClick={() => removeProductFromCollection(product.id)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
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