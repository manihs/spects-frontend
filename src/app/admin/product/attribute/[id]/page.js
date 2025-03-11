'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import Link from 'next/link';
import { 
  Loader2, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  Plus, 
  X,
  Save,
  Trash2,
  FolderPlus,
  Eye
} from 'lucide-react';

export default function EditAttribute() {
  const params = useParams();
  const attributeId = params.id;
  const router = useRouter();
  const closeGroupModalRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [options, setOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    status: true
  });

  const [formData, setFormData] = useState({
    name: '',
    uniqueCode: '',
    description: '',
    type: 'text',
    attributeGroupId: '',
    status: true
  });

  // Detect changes to enable/disable save button
  useEffect(() => {
    if (originalData) {
      // Compare basic fields
      const basicFieldsChanged = Object.keys(formData).some(key => {
        return formData[key] !== originalData[key];
      });
      
      // Compare options if applicable
      let optionsChanged = false;
      if (originalData.options && (formData.type === 'options' || formData.type === 'multiple_select')) {
        // Check if options length has changed
        if (options.length !== originalData.options.length) {
          optionsChanged = true;
        } else {
          // Check if any option values have changed
          optionsChanged = options.some((option, index) => {
            return option.value !== originalData.options[index]?.value || 
                   option.displayOrder !== originalData.options[index]?.displayOrder;
          });
        }
      }
      
      setHasChanges(basicFieldsChanged || optionsChanged);
    }
  }, [formData, options, originalData]);

  const fetchAttributeGroups = async () => {
    try {
      const response = await axiosInstance.get('/api/attributes/group/list');
      if (response.success) {
        setAttributeGroups(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attribute groups');
      console.error('Error fetching attribute groups:', error);
    }
  };

  // Load attribute data and attribute groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch both attribute groups and attribute data concurrently
        const [groupsResponse, attributeResponse] = await Promise.all([
          axiosInstance.get('/api/attributes/group/list'),
          axiosInstance.get(`/api/attributes/${attributeId}`)
        ]);
        
        // Process attribute groups
        if (groupsResponse.success) {
          setAttributeGroups(groupsResponse.data);
        }
        
        // Process attribute data
        if (attributeResponse.success) {
          const attribute = attributeResponse.data;
          
          // Set form data
          const initialData = {
            name: attribute.name || '',
            uniqueCode: attribute.uniqueCode || '',
            description: attribute.description || '',
            type: attribute.type || 'text',
            attributeGroupId: attribute.attributeGroupId || '',
            status: attribute.status ?? true
          };
          
          setFormData(initialData);
          
          // Set options if they exist
          if (attribute.options && attribute.options.length > 0) {
            // Map to our options format
            const attributeOptions = attribute.options.map(option => ({
              id: option.id,
              value: option.value,
              displayOrder: option.displayOrder || 0
            }));
            setOptions(attributeOptions);
          } else {
            // Initialize with an empty option
            setOptions([{ value: '', displayOrder: 0 }]);
          }
          
          // Store original data for change detection
          setOriginalData({
            ...initialData,
            options: attribute.options || []
          });
        }
      } catch (error) {
        toast.error('Failed to load attribute data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [attributeId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Clear error when field is being edited
    setFormErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // If type changes, handle options
    if (name === 'type') {
      if (value !== 'options' && value !== 'multiple_select') {
        // Reset options if changing away from option types
        setOptions([{ value: '', displayOrder: 0 }]);
      } else if (options.length === 0) {
        // Ensure we have at least one option if changing to option types
        setOptions([{ value: '', displayOrder: 0 }]);
      }
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { value: '', displayOrder: options.length }]);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      // Update display order for remaining options
      const updatedOptions = newOptions.map((option, i) => ({
        ...option,
        displayOrder: i
      }));
      setOptions(updatedOptions);
    }
  };
  
  // Handle group modal input changes
  const handleGroupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setNewGroupData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Create a new attribute group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroupData.name) {
      toast.error('Group name is required');
      return;
    }
    
    setIsCreatingGroup(true);
    
    try {
      const response = await axiosInstance.post('/api/attributes/group', newGroupData);
      
      if (response.success) {
        toast.success('Attribute group created successfully');
        
        // Add new group to the list and select it
        const newGroup = response.data;
        setAttributeGroups(prev => [...prev, newGroup]);
        setFormData(prev => ({
          ...prev,
          attributeGroupId: newGroup.id
        }));
        
        // Close modal and reset form
        setShowGroupModal(false);
        setNewGroupData({
          name: '',
          description: '',
          status: true
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create attribute group');
      console.error('Error creating attribute group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'Attribute name is required';
    }

    if (!formData.uniqueCode.trim()) {
      errors.uniqueCode = 'Unique code is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.uniqueCode)) {
      errors.uniqueCode = 'Unique code can only contain lowercase letters, numbers, and underscores';
    }

    if (!formData.attributeGroupId) {
      errors.attributeGroupId = 'Attribute group is required';
    }

    // Validate options if type is options or multiple_select
    if ((formData.type === 'options' || formData.type === 'multiple_select') && 
        (!options.length || options.some(option => !option.value.trim()))) {
      errors.options = 'All options must have a value';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data including options if needed
      const attributeData = { ...formData };
      
      if (formData.type === 'options' || formData.type === 'multiple_select') {
        attributeData.options = options;
      }

      // Update attribute
      const response = await axiosInstance.put(`/api/attributes/${attributeId}`, attributeData);

      if (response.success) {
        toast.success('Attribute updated successfully!');
        
        // Update original data to reflect current state
        setOriginalData({
          ...formData,
          options: [...options]
        });
        
        setHasChanges(false);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      console.error('Error updating attribute:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${formData.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.delete(`/api/attributes/${attributeId}`);
      
      if (response.success) {
        toast.success('Attribute deleted successfully');
        router.push('/admin/product/attribute');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete attribute');
      console.error('Error deleting attribute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/admin/product/attribute');
      }
    } else {
      router.push('/admin/product/attribute');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Create Attribute Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowGroupModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateGroup}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Attribute Group</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="group-name"
                        name="name"
                        value={newGroupData.name}
                        onChange={handleGroupInputChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm"
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="group-description"
                        name="description"
                        value={newGroupData.description}
                        onChange={handleGroupInputChange}
                        rows="3"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm"
                        placeholder="Enter group description"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="group-status"
                        name="status"
                        checked={newGroupData.status}
                        onChange={handleGroupInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="group-status" className="ml-2 block text-sm text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isCreatingGroup}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isCreatingGroup ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Creating...
                      </>
                    ) : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    ref={closeGroupModalRef}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with breadcrumb navigation */}
        <div className="mb-8">
          <nav className="flex mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/admin" className="hover:text-gray-700">Dashboard</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/admin/product/attribute" className="ml-2 hover:text-gray-700">Attributes</Link>
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 font-medium text-blue-600">Edit Attribute</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {isLoading ? 'Loading Attribute...' : `Edit Attribute: ${formData.name}`}
              {(isLoading || isSaving) && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </h1>
            <div className="flex gap-3">
              <Link 
                href="/admin/product/attribute" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Attributes
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading attribute data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column: Basic Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Basic Details</h2>
                  <p className="mt-1 text-sm text-gray-500">Update the main information for this attribute</p>
                </div>

                <div className="px-6 py-4 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Attribute Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`block w-full rounded-lg border px-4 py-2 text-sm mt-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                        }`}
                      placeholder="Enter attribute name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Unique Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="uniqueCode"
                      name="uniqueCode"
                      value={formData.uniqueCode}
                      onChange={handleInputChange}
                      required
                      className={`block w-full rounded-lg border px-4 py-2 text-sm mt-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.uniqueCode
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                        }`}
                      placeholder="e.g. color, size, material"
                    />
                    {formErrors.uniqueCode ? (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.uniqueCode}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Unique identifier used in code. Use lowercase letters, numbers, and underscores only.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="attributeGroupId" className="block text-sm font-medium text-gray-700 mb-1">
                      Attribute Group <span className="text-red-500">*</span>
                    </label>
                    <div className="flex mt-3 gap-2">
                      <select
                        id="attributeGroupId"
                        name="attributeGroupId"
                        value={formData.attributeGroupId}
                        onChange={handleInputChange}
                        required
                        className={`block w-full rounded-lg border px-4 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.attributeGroupId
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                          }`}
                      >
                        <option value="">Select Attribute Group</option>
                        {attributeGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowGroupModal(true)}
                        className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {formErrors.attributeGroupId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formErrors.attributeGroupId}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Select an existing group or create a new one using the + button
                    </p>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Attribute Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mt-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                    >
                      <option value="text">Text (Single Line)</option>
                      <option value="desc">Description (Multi Line)</option>
                      <option value="options">Options (Dropdown)</option>
                      <option value="multiple_select">Multiple Select</option>
                      <option value="custom_text_option">Custom Text</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      <span className={formData.type !== originalData?.type ? 'text-yellow-600 font-semibold' : ''}>
                        {formData.type !== originalData?.type 
                          ? 'Warning: Changing the attribute type may affect existing products.' 
                          : 'Select how this attribute will be displayed and used in the product form.'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mt-3 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>

              {/* Options Section - Only visible for option types */}
              {(formData.type === 'options' || formData.type === 'multiple_select') && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Attribute Options</h2>
                    <p className="mt-1 text-sm text-gray-500">Define the available options for this attribute</p>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    {formErrors.options && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{formErrors.options}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-grow">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                            />
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              value={option.displayOrder}
                              onChange={(e) => handleOptionChange(index, 'displayOrder', parseInt(e.target.value))}
                              placeholder="Order"
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 hover:border-gray-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            disabled={options.length === 1}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Settings and Actions */}
            <div className="space-y-6">
              {/* Status & Actions Panel */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Status & Actions</h2>
                </div>
                
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="status"
                        id="status"
                        checked={formData.status}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="status"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${formData.status ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${formData.status ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="py-3">
                    <div className={`rounded-md p-3 ${formData.status ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {formData.status ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm ${formData.status ? 'text-green-700' : 'text-gray-700'}`}>
                            {formData.status 
                              ? 'This attribute is active and available for product assignment.' 
                              : 'This attribute is inactive and hidden from product forms.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSaving || !hasChanges}
                      className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        hasChanges && !isSaving
                          ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="mt-3 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Preview Panel */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                </div>

                <div className="p-6">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-white border-t border-gray-200 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Name:</span>
                        <span className="text-gray-700">{formData.name || 'Not set'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium">Code:</span>
                        <span className="text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {formData.uniqueCode || 'not_set'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium">Group:</span>
                        <span className="text-gray-700">
                          {formData.attributeGroupId 
                            ? attributeGroups.find(g => g.id === parseInt(formData.attributeGroupId))?.name || 'Loading...'
                            : 'Not assigned'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <span className="text-gray-700">
                          {formData.type === 'text' && 'Text (Single Line)'}
                          {formData.type === 'desc' && 'Description (Multi Line)'}
                          {formData.type === 'options' && 'Options (Dropdown)'}
                          {formData.type === 'multiple_select' && 'Multiple Select'}
                          {formData.type === 'custom_text_option' && 'Custom Text'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formData.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {formData.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {(formData.type === 'options' || formData.type === 'multiple_select') && options.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium block mb-2">Options:</span>
                          <div className="flex flex-wrap gap-2">
                            {options.filter(opt => opt.value).map((option, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {option.value}
                              </span>
                            ))}
                            {!options.some(opt => opt.value) && (
                              <span className="text-gray-500 italic">No options defined</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                  <h2 className="text-lg font-medium text-red-700">Danger Zone</h2>
                </div>
                
                <div className="px-6 py-4">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Attribute
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    This will permanently delete this attribute. Products using this attribute may be affected.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}