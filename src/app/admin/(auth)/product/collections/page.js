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
import { Loader2, AlertCircle, Edit, Trash2, Plus, Search, LayoutGrid } from 'lucide-react';
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

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and filtering states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  
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
          ...(search && { search })
        }
      });
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch collections');
      }
      
      setCollections(data.data || []);
      setTotalPages(Math.ceil((data.data?.length || 0) / limit));
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
  }, [page, limit, sortBy, sortOrder]);
  
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
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Product Collections</h1>
        <div className="flex space-x-2">
          <Button onClick={() => router.push('/admin/product/collections/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Created</option>
                <option value="updatedAt">Sort by Updated</option>
              </select>
              
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
              
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
          
          {/* Collections Table */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
              <p className="mt-2">Loading collections...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="mr-2" />
              {error}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No collections found. Create your first collection.</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/admin/product/collections/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Collection
              </Button>
            </div>
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
                      <td className="py-3 px-4 font-medium">{collection.name}</td>
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
                              Show Products
                            </span>
                          )}
                          {collection.storeMenu && (
                            <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full inline-block">
                              Menu Visible
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/product/collections/${collection.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
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
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {collections.length} of {limit} results
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