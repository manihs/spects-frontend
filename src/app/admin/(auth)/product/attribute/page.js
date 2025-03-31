'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { AlertCircle, Edit, Trash2, Plus, Filter, Tag, Search } from 'lucide-react';
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

export default function AttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and filtering states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  
  // Fetch attributes
  const fetchAttributes = async () => {
    setLoading(true);
    
    try {
      const data = await axios.get('/api/attributes', {
        params: {
          page,
          limit,
          sortBy,
          sortOrder,
          ...(search && { search })
        }
      });
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch attributes');
      }
      
      setAttributes(data.data || []);
      setTotalPages(Math.ceil((data.data?.length || 0) / limit));
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch attributes", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAttributes();
  }, [page, limit, sortBy, sortOrder]);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttributes();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);
  
  // Handle attribute deletion
  const handleDelete = async (id) => {
    try {
      const data = await axios.delete(`/api/attributes/${id}`);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete attribute');
      }
      
      toast.success("Attribute deleted successfully");
      
      // Refresh the attribute list
      fetchAttributes();
    } catch (err) {
      toast.error("Failed to delete attribute", {
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
  
  // Helper function to render attribute type badge
  const renderTypeBadge = (type) => {
    const typeColors = {
      'text': 'bg-blue-100 text-blue-800',
      'desc': 'bg-purple-100 text-purple-800',
      'options': 'bg-green-100 text-green-800',
      'multiple_select': 'bg-amber-100 text-amber-800',
      'custom_text_option': 'bg-rose-100 text-rose-800'
    };
    
    const typeLabels = {
      'text': 'Text',
      'desc': 'Description',
      'options': 'Single Select',
      'multiple_select': 'Multiple Select',
      'custom_text_option': 'Custom Text'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {typeLabels[type] || type}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Product Attributes</h1>
        <div className="flex space-x-2">
          <Button 
          className='bg-blue-500 hover:bg-blue-600'
          onClick={() => router.push('/admin/product/attribute/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Attribute
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/product/attribute-group')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Manage Groups
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Attribute Management
          </CardTitle>
          <CardDescription>
            Manage product attributes to define the characteristics and options of your products
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filtering and Search Tools */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-4">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Ascending</SelectItem>
                  <SelectItem value="DESC">Descending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Attributes Table */}
          {loading ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground animate-pulse" />
              <p className="mt-2">Loading attributes...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="mr-2" />
              {error}
            </div>
          ) : attributes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No attributes found. Create your first attribute.</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/admin/product/attribute/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Attribute
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributes.map((attribute) => (
                    <TableRow key={attribute.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{attribute.name}</TableCell>
                      <TableCell className="font-mono text-sm">{attribute.uniqueCode}</TableCell>
                      <TableCell>{renderTypeBadge(attribute.type)}</TableCell>
                      <TableCell>
                        {attribute.group ? attribute.group.name : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attribute.status ? "success" : "secondary"}>
                          {attribute.status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/admin/product/attribute/${attribute.id}`)}
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
                                  This will permanently delete the attribute "{attribute.name}".
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(attribute.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {attributes.length} of {limit} results
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