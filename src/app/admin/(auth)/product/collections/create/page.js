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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, LayoutGrid } from 'lucide-react';
import axios from '@/lib/axios';

export default function CreateCollectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State for form data
  const [collectionData, setCollectionData] = useState({
    name: '',
    uniqueCode: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    status: 'active',
    showProducts: true,
    storeMenu: true
  });
  
  // Auto-generate uniqueCode based on name
  useEffect(() => {
    if (collectionData.name) {
      // Convert to lowercase, replace spaces with underscores, remove special chars
      const code = collectionData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      updateCollectionData('uniqueCode', code);
    }
  }, [collectionData.name]);
  
  // Auto-populate SEO title with name if empty
  useEffect(() => {
    if (collectionData.name && !collectionData.seoTitle) {
      updateCollectionData('seoTitle', collectionData.name);
    }
  }, [collectionData.name, collectionData.seoTitle]);
  
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
    
    setLoading(true);
    try {
      const data = await axios.post('/api/collections', collectionData);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create collection');
      }
      
      toast.success('Collection created successfully');
      
      // Navigate back to collection list
      router.push('/admin/product/collections');
    } catch (error) {
      toast.error('Failed to create collection', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
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
          <h1 className="text-2xl font-semibold">Create Collection</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5" />
              Collection Details
            </CardTitle>
            <CardDescription>
              Create a new collection to group related products together
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
                <p className="text-xs text-muted-foreground mt-1">
                  The display name for this collection
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Unique Code *</label>
                <Input 
                  value={collectionData.uniqueCode}
                  onChange={(e) => updateCollectionData('uniqueCode', e.target.value)}
                  placeholder="e.g. summer_collection"
                  required
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A unique identifier for this collection (auto-generated)
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Set the visibility status of this collection
                </p>
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
              
              <div className="md:col-span-2 border-t pt-4">
                <h3 className="text-lg font-medium mb-4">SEO Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <div className="md:col-span-2">
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
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <div className="flex gap-3">
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
                    Save Collection
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}