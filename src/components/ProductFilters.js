import { useState, useEffect } from 'react';
import { Sliders, X } from 'lucide-react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

const sortOptions = [
  { label: 'Latest', value: 'updatedAt,DESC' },
  { label: 'Oldest', value: 'updatedAt,ASC' },
  { label: 'Price: Low to High', value: 'basePrice,ASC' },
  { label: 'Price: High to Low', value: 'basePrice,DESC' },
  { label: 'Name: A-Z', value: 'name,ASC' },
  { label: 'Name: Z-A', value: 'name,DESC' }
];

// Special value for "All" options
const ALL_VALUE = 'all';

export default function ProductFilters({ 
  onFilterChange, 
  selectedFilters = {}, 
  selectedSort = 'updatedAt,DESC',
  onSortChange,
  categories = [],
  collections = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterableAttributes, setFilterableAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilterableAttributes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/attributes/filterable/list`);
        console.log('API Response:', response); // Debug log
        
        if (response.success) {
          const attributes = response.data || [];
          console.log('Filterable Attributes:', attributes); // Debug log
          setFilterableAttributes(attributes);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch attributes');
        }
      } catch (error) {
        console.error('Error fetching filterable attributes:', error);
        setError(error.message || 'Failed to load filters');
        setFilterableAttributes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterableAttributes();
  }, []);

  const handleFilterChange = (key, value) => {
    // Convert 'all' value to empty string for API
    const apiValue = value === ALL_VALUE ? '' : value;
    onFilterChange(key, apiValue);
  };

  const handleAttributeChange = (attributeId, value) => {
    // Convert 'all' value to empty string for API
    const apiValue = value === ALL_VALUE ? '' : value;
    onFilterChange(`attribute_${attributeId}`, apiValue);
  };

  const clearFilters = () => {
    Object.keys(selectedFilters).forEach(key => {
      onFilterChange(key, '');
    });
  };

  // Helper function to get filter value safely
  const getFilterValue = (key) => {
    const value = selectedFilters[key];
    return value === '' ? ALL_VALUE : (value || ALL_VALUE);
  };

  // Helper function to check if there are any filterable attributes
  const hasFilterableAttributes = () => {
    return filterableAttributes && filterableAttributes.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 border-b">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <Sliders className="h-4 w-4 mr-2" />
            Filters
          </div>
          <span className="text-sm text-gray-500">
            {Object.keys(selectedFilters).filter(key => selectedFilters[key] && selectedFilters[key] !== ALL_VALUE).length} active
          </span>
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search products..."
              value={getFilterValue('search')}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Sort */}
          <div className="mb-4">
            <Label htmlFor="sort">Sort by</Label>
            <Select
              value={selectedSort}
              onValueChange={onSortChange}
              defaultValue={selectedSort}
            >
              <SelectTrigger id="sort" className="mt-1">
                <SelectValue placeholder="Select sorting" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="mb-4">
            <Label htmlFor="category">Category</Label>
            <Select
              value={getFilterValue('category')}
              onValueChange={(value) => handleFilterChange('category', value)}
              defaultValue={ALL_VALUE}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collection */}
          <div className="mb-4">
            <Label htmlFor="collection">Collection</Label>
            <Select
              value={getFilterValue('collection')}
              onValueChange={(value) => handleFilterChange('collection', value)}
              defaultValue={ALL_VALUE}
            >
              <SelectTrigger id="collection" className="mt-1">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Collections</SelectItem>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.seoSlug}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Attribute Filters */}
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading filters...</div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !hasFilterableAttributes() ? (
              <div className="text-center py-4 text-gray-500">No filters available</div>
            ) : (
              filterableAttributes.map(attribute => (
                <div key={attribute.id} className="mb-4">
                  <Label>{attribute.name}</Label>
                  {attribute.type === 'options' ? (
                    <Select
                      value={getFilterValue(`attribute_${attribute.id}`)}
                      onValueChange={(value) => handleAttributeChange(attribute.id, value)}
                      defaultValue={ALL_VALUE}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={`Select ${attribute.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>All {attribute.name}</SelectItem>
                        {attribute.options?.map(option => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      placeholder={`Enter ${attribute.name}`}
                      value={getFilterValue(`attribute_${attribute.id}`)}
                      onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                      className="mt-1"
                    />
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 