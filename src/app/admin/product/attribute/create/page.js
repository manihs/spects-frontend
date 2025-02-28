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
import { Loader2, ArrowLeft, Save, PlusCircle, X, Tag, ArrowUp, ArrowDown } from 'lucide-react';
import axios from '@/lib/axios';

export default function CreateAttributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attributeGroups, setAttributeGroups] = useState([]);
  
  // State for form data
  const [attributeData, setAttributeData] = useState({
    name: '',
    uniqueCode: '',
    description: '',
    type: 'text',
    attributeGroupId: '',
    status: true,
    options: []
  });
  
  // Fetch attribute groups for dropdown
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      try {
        const data = await axios.get('/api/attributes/group/list');
        
        if (data.success) {
          setAttributeGroups(data.data);
        }
      } catch (error) {
        console.error('Error fetching attribute groups:', error);
        toast.error("Failed to load attribute groups");
      }
    };
    
    fetchAttributeGroups();
  }, []);
  
  // Auto-generate uniqueCode based on name
  useEffect(() => {
    if (attributeData.name) {
      // Convert to lowercase, replace spaces with underscores, remove special chars
      const code = attributeData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      updateAttributeData('uniqueCode', code);
    }
  }, [attributeData.name]);
  
  // Helper to update attribute data
  const updateAttributeData = (key, value) => {
    setAttributeData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Options management
  const addOption = () => {
    setAttributeData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { id: `new-${Date.now()}`, value: '', displayOrder: prev.options.length }
      ]
    }));
  };
  
  const updateOption = (index, value) => {
    const newOptions = [...attributeData.options];
    newOptions[index].value = value;
    updateAttributeData('options', newOptions);
  };
  
  const removeOption = (index) => {
    const newOptions = [...attributeData.options];
    newOptions.splice(index, 1);
    // Update display order
    newOptions.forEach((option, i) => {
      option.displayOrder = i;
    });
    updateAttributeData('options', newOptions);
  };
  
  const moveOptionUp = (index) => {
    if (index === 0) return;
    
    const newOptions = [...attributeData.options];
    const temp = newOptions[index];
    newOptions[index] = newOptions[index - 1];
    newOptions[index - 1] = temp;
    
    // Update display order
    newOptions.forEach((option, i) => {
      option.displayOrder = i;
    });
    
    updateAttributeData('options', newOptions);
  };
  
  const moveOptionDown = (index) => {
    if (index === attributeData.options.length - 1) return;
    
    const newOptions = [...attributeData.options];
    const temp = newOptions[index];
    newOptions[index] = newOptions[index + 1];
    newOptions[index + 1] = temp;
    
    // Update display order
    newOptions.forEach((option, i) => {
      option.displayOrder = i;
    });
    
    updateAttributeData('options', newOptions);
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const data = await axios.post('/api/attributes', attributeData);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create attribute');
      }
      
      toast.success('Attribute created successfully');
      
      // Navigate back to attribute list
      router.push('/admin/product/attribute');
    } catch (error) {
      toast.error('Failed to create attribute', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to determine if options should be shown
  const showOptions = attributeData.type === 'options' || attributeData.type === 'multiple_select';
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push('/admin/product/attribute')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Create Attribute</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Attribute Details
            </CardTitle>
            <CardDescription>
              Create a new attribute to define product characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input 
                  value={attributeData.name}
                  onChange={(e) => updateAttributeData('name', e.target.value)}
                  placeholder="e.g. Size, Color, Material"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The display name for this attribute
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Unique Code *</label>
                <Input 
                  value={attributeData.uniqueCode}
                  onChange={(e) => updateAttributeData('uniqueCode', e.target.value)}
                  placeholder="e.g. size, color, material"
                  required
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A unique identifier for this attribute (auto-generated)
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Type *</label>
                <select 
                  value={attributeData.type}
                  onChange={(e) => updateAttributeData('type', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background mt-1"
                  required
                >
                  <option value="text">Text</option>
                  <option value="desc">Description</option>
                  <option value="options">Single Select</option>
                  <option value="multiple_select">Multiple Select</option>
                  <option value="custom_text_option">Custom Text Option</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Determines how this attribute will be used
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Attribute Group</label>
                <select 
                  value={attributeData.attributeGroupId}
                  onChange={(e) => updateAttributeData('attributeGroupId', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background mt-1"
                >
                  <option value="">None</option>
                  {attributeGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Group this attribute with related attributes
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={attributeData.description}
                  onChange={(e) => updateAttributeData('description', e.target.value)}
                  placeholder="Describe this attribute..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional description for this attribute
                </p>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Active Status</label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable this attribute
                    </p>
                  </div>
                  <Switch
                    checked={attributeData.status}
                    onCheckedChange={(checked) => updateAttributeData('status', checked)}
                  />
                </div>
              </div>
            </div>
            
            {/* Options Section - Only show for certain attribute types */}
            {showOptions && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Attribute Options</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                
                {attributeData.options.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground mb-2">No options added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Option
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attributeData.options.map((option, index) => (
                      <div 
                        key={option.id || index} 
                        className="flex items-center space-x-2 bg-background border rounded-md p-2"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Option value"
                            value={option.value}
                            onChange={(e) => updateOption(index, e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveOptionUp(index)}
                            disabled={index === 0}
                            className="h-8 w-8"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => moveOptionDown(index)}
                            disabled={index === attributeData.options.length - 1}
                            className="h-8 w-8"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="h-8 w-8 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mt-2">
                  Use the arrow buttons to reorder options
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/product/attribute')}
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
                    Save Attribute
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