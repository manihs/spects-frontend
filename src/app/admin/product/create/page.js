'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ImagePlus
} from 'lucide-react';
import axios from '@/lib/axios';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State for dropdowns
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);

  // Product base data
  const [productData, setProductData] = useState({
    name: '',
    sku: '',
    basePrice: '',
    offerPrice: '',
    description: '',
    categoryId: '',
    collections: [],
    status: 'active',
    visibility: 'visible',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: '',
  });

  // Dynamic attributes
  const [selectedAttributeGroup, setSelectedAttributeGroup] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [productAttributes, setProductAttributes] = useState([]);

  // Variants
  const [variants, setVariants] = useState([]);

  // Image upload
  const [imageFiles, setImageFiles] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('/api/categories');
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.categories);
        }

        // Fetch collections
        const collectionsResponse = await axios.get('/api/collections');
        if (collectionsResponse.success) {
          setCollections(collectionsResponse.data);
        }

        // Fetch attribute groups
        const attributeGroupsResponse = await axios.get('/api/attributes/group/list');
        if (attributeGroupsResponse.success) {
          setAttributeGroups(attributeGroupsResponse.data);
        }
      } catch (error) {
        toast.error('Failed to load initial data', {
          description: error.message
        });
      }
    };

    fetchInitialData();
  }, []);

  // Fetch attributes when attribute group changes
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!selectedAttributeGroup) {
        setAttributes([]);
        return;
      }

      try {
        const response = await axios.get(`/api/attributes?groupId=${selectedAttributeGroup}`);

        if (response.success) {
          setAttributes(response.data);

          // Reset product attributes when group changes
          setProductAttributes(
            response.data.map(attr => ({
              attributeId: attr.id,
              name: attr.name,
              type: attr.type,
              value: attr.type === 'multiple_select' ? '[]' : '',
              options: attr.options || []
            }))
          );
        } else {
          throw new Error(response.message || 'Failed to fetch attributes');
        }
      } catch (error) {
        toast.error('Error fetching attributes', {
          description: error.message
        });
      }
    };

    fetchAttributes();
  }, [selectedAttributeGroup]);

  // Generate SKU
  const generateSKU = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `PRD-${timestamp.toUpperCase()}-${randomStr.toUpperCase()}`;
  };

  // Update product data
  const updateProductData = (key, value) => {
    setProductData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.slice(0, 5 - imageFiles.length);
    setImageFiles(prev => [...prev, ...newFiles]);
  };

  // Remove image
  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  // Add attribute to product
  const addProductAttribute = () => {
    setProductAttributes(prev => [...prev, {
      attributeGroupId: selectedAttributeGroup,
      attributeId: null,
      value: ''
    }]);
  };

  // Update product attribute
  const updateProductAttribute = (index, key, value) => {
    const newAttributes = [...productAttributes];
    newAttributes[index] = {
      ...newAttributes[index],
      [key]: value
    };
    setProductAttributes(newAttributes);
  };

  // Remove product attribute
  const removeProductAttribute = (index) => {
    const newAttributes = [...productAttributes];
    newAttributes.splice(index, 1);
    setProductAttributes(newAttributes);
  };

  // Render attribute input
  const renderAttributeInput = (attribute, index) => {
    switch (attribute.type) {
      case 'text':
        return (
          <Input
            value={attribute.value}
            onChange={(e) => updateAttributeValue(index, e.target.value)}
            placeholder={`Enter ${attribute.name}`}
          />
        );

      case 'options':
        return (
          <Select
            value={attribute.value}
            onValueChange={(value) => updateAttributeValue(index, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attribute.name}`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.options.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.value}
                >
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiple_select':
        return (
          <div className="space-y-2">
            {attribute.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id={`attr-${attribute.attributeId}-${option.id}`}
                  checked={
                    attribute.value
                      ? JSON.parse(attribute.value).includes(option.value)
                      : false
                  }
                  onChange={(e) => {
                    const currentValues = attribute.value
                      ? JSON.parse(attribute.value)
                      : [];

                    let newValues;
                    if (e.target.checked) {
                      newValues = [...currentValues, option.value];
                    } else {
                      newValues = currentValues.filter(v => v !== option.value);
                    }

                    updateAttributeValue(
                      index,
                      JSON.stringify(newValues)
                    );
                  }}
                  className="mr-2"
                />
                <label htmlFor={`attr-${attribute.attributeId}-${option.id}`}>
                  {option.value}
                </label>
              </div>
            ))}
          </div>
        );

      case 'desc':
        return (
          <Textarea
            value={attribute.value}
            onChange={(e) => updateAttributeValue(index, e.target.value)}
            placeholder={`Enter ${attribute.name}`}
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  // Update attribute value
  const updateAttributeValue = (index, value) => {
    const newAttributes = [...productAttributes];
    newAttributes[index].value = value;
    setProductAttributes(newAttributes);
  };


  const addVariant = () => {
    setVariants(prev => [...prev, {
      name: '',
      sku: generateSKU(),
      price: '',
      quantity: 1,
      attributes: []
    }]);
  };

  // Update variant
  const updateVariant = (index, key, value) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [key]: value
    };
    setVariants(newVariants);
  };

  // Remove variant
  const removeVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data
      const formData = new FormData();

      // Append images
      imageFiles.forEach((file) => {
        formData.append(`images`, file);
      });

      // Prepare product payload
      const productPayload = {
        ...productData,
        sku: productData.sku || generateSKU(),
        basePrice: parseFloat(productData.basePrice),
        offerPrice: productData.offerPrice ? parseFloat(productData.offerPrice) : null,
        attributes: productAttributes,
        collections: productData.collections
      };

      // Convert to JSON string for backend parsing
      formData.append('productData', JSON.stringify(productPayload));

      // Append variants
      if (variants.length > 0) {
        const processedVariants = variants.map(variant => ({
          ...variant,
          price: parseFloat(variant.price),
          sku: variant.sku || generateSKU()
        }));
        formData.append('variants', JSON.stringify(processedVariants));
      }

      // Send request
      const response = await axios.post('/api/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        toast.success('Product created successfully');
        router.push('/admin/product/list');
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      toast.error('Failed to create product', {
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
            onClick={() => router.push('/admin/product/list')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Create New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Enter basic information for your product
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Product Name *</label>
              <Input
                value={productData.name}
                onChange={(e) => updateProductData('name', e.target.value)}
                placeholder="Enter product name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">SKU</label>
              <Input
                value={productData.sku}
                onChange={(e) => updateProductData('sku', e.target.value)}
                placeholder={generateSKU()}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to auto-generate
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Base Price *</label>
              <Input
                type="number"
                step="0.01"
                value={productData.basePrice}
                onChange={(e) => updateProductData('basePrice', e.target.value)}
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Offer Price</label>
              <Input
                type="number"
                step="0.01"
                value={productData.offerPrice}
                onChange={(e) => updateProductData('offerPrice', e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={productData.description}
                onChange={(e) => updateProductData('description', e.target.value)}
                placeholder="Product description"
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={productData.categoryId}
                onValueChange={(value) => updateProductData('categoryId', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Collections</label>
              <Select
                value={productData.collections}
                onValueChange={(value) => updateProductData('collections', value)}
                multiple
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Collections" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem
                      key={collection.id}
                      value={collection.id.toString()}
                    >
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload up to 5 product images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Product Image ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                <label className="border-2 border-dashed rounded-lg flex items-center justify-center h-40 cursor-pointer hover:bg-muted">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div className="text-center">
                    <ImagePlus className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Add Images</p>
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attribute Group and Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Product Attributes</CardTitle>
            <CardDescription>
              Select attribute group and configure attributes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Attribute Group Selection */}
            <div>
              <label className="text-sm font-medium">Attribute Group</label>
              <Select
                value={selectedAttributeGroup ? selectedAttributeGroup.toString() : undefined}
                onValueChange={(value) => setSelectedAttributeGroup(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Attribute Group" />
                </SelectTrigger>
                <SelectContent>
                  {attributeGroups.map((group) => (
                    <SelectItem
                      key={group.id}
                      value={group.id.toString()}
                    >
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamically Rendered Attributes */}
            {selectedAttributeGroup && productAttributes.length > 0 && (
              <div className="space-y-4">
                {productAttributes.map((attribute, index) => (
                  <div
                    key={attribute.attributeId}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">
                        {attribute.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({attribute.type})
                        </span>
                      </label>
                    </div>

                    {/* Render Attribute Input */}
                    <div>
                      {renderAttributeInput(attribute, index)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Add product variants if applicable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>

            {variants.map((variant, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Variant {index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Variant Name</label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="e.g. Red, Large"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder={generateSKU()}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      value={variant.quantity}
                      onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                      placeholder="1"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Product Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
            <CardDescription>
              Configure product visibility and status
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={productData.status}
                onValueChange={(value) => updateProductData('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Visibility</label>
              <Select
                value={productData.visibility}
                onValueChange={(value) => updateProductData('visibility', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SEO Information */}
        <Card>
          
          <CardHeader>
            <CardTitle>SEO Information</CardTitle>
            <CardDescription>
              Optimize your product for search engines
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">SEO Title</label>
              <Input
                value={productData.seoTitle}
                onChange={(e) => updateProductData('seoTitle', e.target.value)}
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
                value={productData.seoKeywords}
                onChange={(e) => updateProductData('seoKeywords', e.target.value)}
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
                value={productData.seoDescription}
                onChange={(e) => updateProductData('seoDescription', e.target.value)}
                placeholder="Brief description for search engines"
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 150-160 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">slug</label>
              <Input
                value={productData.slug}
                onChange={(e) => updateProductData('slug', e.target.value)}
                placeholder="slug"
                className="mt-1"
              />
            </div>

          </CardContent>

        </Card>

        {/* Form Footer */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/product/list')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}