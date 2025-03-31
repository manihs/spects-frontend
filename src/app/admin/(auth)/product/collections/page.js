'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { 
  Loader2, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  ArrowUpDown,
  Package,
  Eye,
  EyeOff,
  Menu
} from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from '@/components/ui/skeleton';

// Helper to safely parse image URL
const getImageUrl = (imageData) => {
  try {
    if (!imageData) return null;
    
    if (Array.isArray(imageData) && imageData.length > 0) {
      return imageData[0];
    }
    
    if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch {
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

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalProducts: 0
  });
  
  // Pagination and filtering states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Fetch collections
  const fetchCollections = async () => {
    setLoading(true);
    
    try {
      const data = await axios.get('/api/collections', {
        params: {
          page,
          limit,
          sortBy,
          sortOrder,
          ...(search && { search }),
          ...(statusFilter !== 'all' && { status: statusFilter })
        }
      });
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch collections');
      }
      
      setCollections(data.data || []);
      setTotalPages(Math.ceil((data.data?.length || 0) / limit));
      
      // Calculate stats
      const collectionData = data.data || [];
      setStats({
        total: collectionData.length,
        active: collectionData.filter(c => c.status === 'active').length,
        inactive: collectionData.filter(c => c.status === 'inactive').length,
        totalProducts: collectionData.reduce((sum, c) => sum + (c.products?.length || 0), 0)
      });
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch collections", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCollections();
  }, [page, limit, sortBy, sortOrder, statusFilter]);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCollections();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);
  
  // Handle collection deletion
  const handleDelete = async (id) => {
    try {
      const data = await axios.delete(`/api/collections/${id}`);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete collection');
      }
      
      toast.success("Collection deleted successfully");
      
      // Refresh the collection list
      fetchCollections();
    } catch (err) {
      toast.error("Failed to delete collection", {
        description: err.message
      });
    }
  };

  // Generate pagination links
  const renderPagination = () => {
    const items = [];
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => setPage(Math.max(1, page - 1))} 
          disabled={page === 1}
        />
      </PaginationItem>
    );
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setPage(i)} 
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => setPage(Math.min(totalPages, page + 1))} 
          disabled={page === totalPages}
        />
      </PaginationItem>
    );
    
    return <PaginationContent>{items}</PaginationContent>;
  };
  
  // Loading skeleton for Grid view
  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-40 bg-muted rounded-t-lg relative">
            <Skeleton className="h-full w-full" />
          </div>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render collections in grid view
  const renderCollectionsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <Card 
          key={collection.id} 
          className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/admin/product/collections/${collection.id}`)}
        >
          <div className="h-40 bg-muted relative flex items-center justify-center">
            {collection.image ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}${getImageUrl(collection.image)}`}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Package className="h-10 w-10 mb-2" />
                <span className="text-xs">No image</span>
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              <Badge variant={collection.status === 'active' ? "success" : "secondary"} className="px-2 py-1 opacity-90">
                {collection.status === 'active' ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{collection.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{collection.uniqueCode}</span>
              </div>
              <div className="flex gap-1 mt-1">
                {collection.showProducts ? (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                )}
                
                {collection.storeMenu && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                    <Menu className="h-3 w-3 mr-1" />
                    Menu
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex mt-4 gap-2 justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {collection.products?.length || 0} products
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/product/collections/${collection.id}`);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the collection "{collection.name}".
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(collection.id);
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Enhanced empty state
  const renderEmptyState = () => (
    <div className="text-center py-12 px-4">
      <div className="bg-muted inline-flex rounded-full p-4 mb-4">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No collections found</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Collections help you organize your products into meaningful groups that make it easier for customers to find what they're looking for.
      </p>
      <Button 
        size="lg"
        onClick={() => router.push('/admin/product/collections/create')}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Collection
      </Button>
    </div>
  );
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Product Collections</h1>
          <p className="text-muted-foreground">Organize your products into meaningful collections</p>
        </div>
        <Button onClick={() => router.push('/admin/product/collections/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Collection
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Collections</p>
                <h2 className="text-3xl font-bold">{stats.total}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Collections</p>
                <h2 className="text-3xl font-bold">{stats.active}</h2>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Inactive Collections</p>
                <h2 className="text-3xl font-bold">{stats.inactive}</h2>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <EyeOff className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Products</p>
                <h2 className="text-3xl font-bold">{stats.totalProducts}</h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LayoutGrid className="mr-2 h-5 w-5" />
            Collection Management
          </CardTitle>
          <CardDescription>
            Manage product collections to group and categorize your products for easy discovery
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filtering and Search Tools */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className={`px-3 flex items-center ${statusFilter === 'all' ? 'bg-muted' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`px-3 flex items-center ${statusFilter === 'active' ? 'bg-muted' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`px-3 flex items-center ${statusFilter === 'inactive' ? 'bg-muted' : ''}`}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterOpen(!filterOpen)}
                className="ml-auto"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === 'grid' ? 'bg-muted' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === 'table' ? 'bg-muted' : ''}
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {filterOpen && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort By</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Date Updated</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Order</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={`flex-1 justify-center ${sortOrder === 'ASC' ? 'bg-muted' : ''}`}
                      onClick={() => setSortOrder('ASC')}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      Ascending
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex-1 justify-center ${sortOrder === 'DESC' ? 'bg-muted' : ''}`}
                      onClick={() => setSortOrder('DESC')}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1 rotate-180" />
                      Descending
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Items Per Page</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Collections Display */}
          {loading ? (
            viewMode === 'grid' ? (
              renderGridSkeleton()
            ) : (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
                <p className="mt-2">Loading collections...</p>
              </div>
            )
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="mr-2" />
              {error}
            </div>
          ) : collections.length === 0 ? (
            renderEmptyState()
          ) : (
            viewMode === 'grid' ? (
              renderCollectionsGrid()
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Code</th>
                      <th className="text-left py-3 px-4 font-medium">Slug</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Visibility</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((collection) => (
                      <tr key={collection.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center">
                            <span className="bg-muted rounded-full p-1 mr-2">
                              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                            </span>
                            {collection.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{collection.uniqueCode}</td>
                        <td className="py-3 px-4 text-sm">{collection.seoSlug}</td>
                        <td className="py-3 px-4">
                          <Badge variant={collection.status === 'active' ? "success" : "secondary"}>
                            {collection.status === 'active' ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            {collection.showProducts && (
                              <span className="text-xs bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full inline-block">
                                <Eye className="h-3 w-3 inline-block mr-1" />
                                Show Products
                              </span>
                            )}
                            {collection.storeMenu && (
                              <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full inline-block">
                                <Menu className="h-3 w-3 inline-block mr-1" />
                                Menu Visible
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/product/collections/${collection.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the collection "{collection.name}".
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(collection.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {collections.length} of {stats.total} collections
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              {renderPagination()}
            </Pagination>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}