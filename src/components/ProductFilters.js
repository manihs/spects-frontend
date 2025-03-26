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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

// URL Filter Parser Utility
function useUrlFilterParser() {
  const [filters, setFilters] = useState({});

  useEffect(() => {
    parseUrlFilters();
  }, []);

  const parseUrlFilters = () => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const parsedFilters = {};

    // Parse categories
    const categories = searchParams.getAll('categories[]');
    if (categories.length > 0) {
      parsedFilters['category'] = categories.join(',');
    }

    // Parse collections
    const collections = searchParams.getAll('collection[]');
    if (collections.length > 0) {
      parsedFilters['collection'] = collections.join(',');
    }

    // Parse attributes
    searchParams.forEach((value, key) => {
      const attributeMatch = key.match(/attribute\[\](\[(.+)\])?/);
      if (attributeMatch) {
        const attributeName = attributeMatch[2];
        if (attributeName) {
          const currentValue = parsedFilters[`attribute[${attributeName}]`];
          parsedFilters[`attribute[${attributeName}]`] = currentValue 
            ? `${currentValue},${value}` 
            : value;
        }
      }
    });

    // Parse sort
    const sort = searchParams.get('sort');
    if (sort) {
      parsedFilters['sort'] = sort;
    }

    setFilters(parsedFilters);
    return parsedFilters;
  };

  const updateUrlWithFilters = (newFilters) => {
    const url = new URL(window.location.href);
    
    // Clear existing filter params
    Array.from(url.searchParams.keys()).forEach(key => {
      if (
        key.startsWith('categories[]') || 
        key.startsWith('collection[]') || 
        key.startsWith('attribute[]') ||
        key === 'sort'
      ) {
        url.searchParams.delete(key);
      }
    });

    // Add categories
    if (newFilters['category'] && newFilters['category'] !== 'all') {
      newFilters['category'].split(',').forEach(category => {
        url.searchParams.append('categories[]', category);
      });
    }

    // Add collections
    if (newFilters['collection'] && newFilters['collection'] !== 'all') {
      newFilters['collection'].split(',').forEach(collection => {
        url.searchParams.append('collection[]', collection);
      });
    }

    // Add attributes
    Object.keys(newFilters).forEach(key => {
      const attributeMatch = key.match(/attribute\[(.+)\]/);
      if (attributeMatch && newFilters[key] !== 'all') {
        const attributeName = attributeMatch[1];
        newFilters[key].split(',').forEach(value => {
          url.searchParams.append(`attribute[][${attributeName}]`, value);
        });
      }
    });

    // Add sort
    if (newFilters['sort']) {
      url.searchParams.set('sort', newFilters['sort']);
    }

    // Update browser history
    window.history.pushState({}, '', url.toString());
  };

  return {
    filters,
    parseUrlFilters,
    updateUrlWithFilters
  };
}

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
  categories = [],
  collections = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterableAttributes, setFilterableAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL Filter Parser
  const { filters: urlFilters, updateUrlWithFilters } = useUrlFilterParser();

  // State to track selected filters
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState('updatedAt,DESC');

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (Object.keys(urlFilters).length > 0) {
      // Set filters from URL
      setSelectedFilters(prevFilters => ({
        ...prevFilters,
        ...urlFilters
      }));

      // Set sort if present in URL filters
      if (urlFilters['sort']) {
        setSelectedSort(urlFilters['sort']);
      }
    }
  }, [urlFilters]);

  useEffect(() => {
    const fetchFilterableAttributes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/attributes/filterable/list`);
        
        if (response.success) {
          const attributes = response.data || [];
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
    // Get current values as array
    const currentValues = selectedFilters[key] ? selectedFilters[key].split(',') : [];
    
    // Handle the new value
    let newValues;
    if (value === ALL_VALUE) {
      newValues = [ALL_VALUE];
    } else {
      // Remove ALL_VALUE if it exists
      const filteredValues = currentValues.filter(v => v !== ALL_VALUE);
      
      // Toggle the value
      if (filteredValues.includes(value)) {
        newValues = filteredValues.filter(v => v !== value);
      } else {
        newValues = [...filteredValues, value];
      }
      
      // If no values selected, set to ALL_VALUE
      if (newValues.length === 0) {
        newValues = [ALL_VALUE];
      }
    }
    
    // Join values with comma
    const newValue = newValues.join(',');
    
    // Update local state
    setSelectedFilters(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Update URL
    updateUrlWithFilters({
      ...selectedFilters,
      [key]: newValue
    });
  };

  const handleAttributeChange = (attributeId, value) => {
    // Use the same logic as handleFilterChange
    handleFilterChange(`attribute[${attributeId}]`, value);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    
    // Update URL
    updateUrlWithFilters({
      ...selectedFilters,
      'sort': sort
    });
  };

  const clearFilters = () => {
    // Reset to default state
    setSelectedFilters({});
    setSelectedSort('updatedAt,DESC');
    
    // Clear URL
    updateUrlWithFilters({});
  };

  // Helper function to get filter values as array
  const getFilterValues = (key) => {
    const value = selectedFilters[key];
    if (!value) return [ALL_VALUE];
    return value.split(',');
  };

  // Helper function to check if a value is selected
  const isValueSelected = (key, value) => {
    const values = getFilterValues(key);
    return values.includes(value);
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

  // Helper function to get selected count for a filter
  const getSelectedCount = (key) => {
    const values = getFilterValues(key);
    return values.filter(v => v !== ALL_VALUE).length;
  };

  // Helper function to get filter label with count
  const getFilterLabel = (name, key) => {
    const count = getSelectedCount(key);
    return count > 0 ? `${name} (${count})` : name;
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

          {/* Sort */}
          <div className="mb-4">
            <Label htmlFor="sort">Sort by</Label>
            <Select
              value={selectedSort}
              onValueChange={handleSortChange}
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
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="category">
              <AccordionTrigger>{getFilterLabel('Category', 'category')}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Checkbox
                    id="all-categories"
                    checked={isValueSelected('category', ALL_VALUE)}
                    onCheckedChange={(checked) => 
                      handleFilterChange('category', checked ? ALL_VALUE : '')
                    }
                  />
                  <Label htmlFor="all-categories" className="ml-2">All Categories</Label>
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={isValueSelected('category', category.slug)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('category', checked ? category.slug : '')
                        }
                      />
                      <Label htmlFor={`category-${category.id}`} className="ml-2">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Collection */}
            <AccordionItem value="collection">
              <AccordionTrigger>{getFilterLabel('Collection', 'collection')}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Checkbox
                    id="all-collections"
                    checked={isValueSelected('collection', ALL_VALUE)}
                    onCheckedChange={(checked) => 
                      handleFilterChange('collection', checked ? ALL_VALUE : '')
                    }
                  />
                  <Label htmlFor="all-collections" className="ml-2">All Collections</Label>
                  {collections.map(collection => (
                    <div key={collection.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`collection-${collection.id}`}
                        checked={isValueSelected('collection', collection.seoSlug)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('collection', checked ? collection.seoSlug : '')
                        }
                      />
                      <Label htmlFor={`collection-${collection.id}`} className="ml-2">
                        {collection.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

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
                  <AccordionItem key={attribute.id} value={`attribute-${attribute.id}`}>
                    <AccordionTrigger>
                      {getFilterLabel(attribute.name, `attribute[${attribute.id}]`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      {attribute.type === 'options' ? (
                        <div className="space-y-2">
                          <Checkbox
                            id={`all-${attribute.id}`}
                            checked={isValueSelected(`attribute[${attribute.id}]`, ALL_VALUE)}
                            onCheckedChange={(checked) => 
                              handleAttributeChange(attribute.id, checked ? ALL_VALUE : '')
                            }
                          />
                          <Label htmlFor={`all-${attribute.id}`} className="ml-2">
                            All {attribute.name}
                          </Label>
                          {attribute.options?.map(option => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${attribute.id}-${option.id}`}
                                checked={isValueSelected(`attribute[${attribute.id}]`, option.value)}
                                onCheckedChange={(checked) => 
                                  handleAttributeChange(attribute.id, checked ? option.value : '')
                                }
                              />
                              <Label htmlFor={`${attribute.id}-${option.id}`} className="ml-2">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Input
                          type="text"
                          placeholder={`Enter ${attribute.name}`}
                          value={getFilterValue(`attribute[${attribute.id}]`)}
                          onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                          className="mt-1"
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </ScrollArea>
          </Accordion>
        </div>
      </div>
    </div>
  );
}