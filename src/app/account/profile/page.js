'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/userContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Tag,
  CalendarDays,
  Clock,
  Edit,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Home,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Address form component
const AddressForm = ({ address = {}, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    id: address?.id || null,
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    address1: address?.address1 || '',
    address2: address?.address2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'India',
    phone: address?.phone || '',
    type: address?.type || 'shipping',
    isDefault: address?.isDefault || false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address1">Address Line 1</Label>
        <Input 
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="address2">Address Line 2 (Optional)</Label>
        <Input 
          id="address2"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input 
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input 
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input 
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <Label className="block mb-2">Address Type</Label>
        <RadioGroup 
          value={formData.type} 
          onValueChange={(value) => setFormData({...formData, type: value})}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="shipping" id="shipping" />
            <Label htmlFor="shipping">Shipping Address</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="billing" id="billing" />
            <Label htmlFor="billing">Billing Address</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="isDefault">Set as default {formData.type} address</Label>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Address
        </Button>
      </div>
    </form>
  );
};

// Address card component
const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const getAddressTypeLabel = (type) => {
    switch(type) {
      case 'shipping': return 'Shipping Address';
      case 'billing': return 'Billing Address';
      default: return 'Address';
    }
  };

  return (
    <Card className="mb-4 border hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium flex items-center">
            {getAddressTypeLabel(address.type)}
            {address.isDefault && (
              <Badge className={`ml-2 ${address.type === 'shipping' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}>
                Default {address.type === 'shipping' ? 'Shipping' : 'Billing'}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-sm space-y-1">
          <p className="font-medium">{address.firstName} {address.lastName}</p>
          <p>{address.address1}</p>
          {address.address2 && <p>{address.address2}</p>}
          <p>{address.city}, {address.state} {address.postalCode}</p>
          <p>{address.country}</p>
          <p className="text-gray-500">{address.phone}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(address)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(address.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* For shipping addresses */}
          {!address.isDefault && address.type === 'shipping' && (
            <Button variant="outline" size="sm" onClick={() => onSetDefault(address.id, 'shipping')}>
              <Home className="h-4 w-4 mr-1" />
              Set as Default Shipping
            </Button>
          )}
          
          {/* For billing addresses */}
          {!address.isDefault && address.type === 'billing' && (
            <Button variant="outline" size="sm" onClick={() => onSetDefault(address.id, 'billing')}>
              <CreditCard className="h-4 w-4 mr-1" />
              Set as Default Billing
            </Button>
          )}
          
          {/* Allow setting a shipping address as a billing address */}
          {address.type === 'shipping' && (
            <Button variant="ghost" size="sm" onClick={() => onSetDefault(address.id, 'billing')}>
              <CreditCard className="h-4 w-4 mr-1" />
              Use for Billing
            </Button>
          )}
          
          {/* Allow setting a billing address as a shipping address */}
          {address.type === 'billing' && (
            <Button variant="ghost" size="sm" onClick={() => onSetDefault(address.id, 'shipping')}>
              <Home className="h-4 w-4 mr-1" />
              Use for Shipping
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { userProfile, setUserProfile } = useUserContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    businessType: '',
    taxId: ''
  });

  // Address management
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [defaultAddresses, setDefaultAddresses] = useState({
    shipping: null,
    billing: null
  });

  // Fetch initial data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account/login?callbackUrl=/account/profile');
      return;
    }

    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        companyName: userProfile.companyName || '',
        businessType: userProfile.businessType || '',
        taxId: userProfile.taxId || ''
      });

      // Fetch addresses
      if (status === 'authenticated' && session?.accessToken) {
        fetchAddresses();
      }
    }
  }, [status, userProfile, router, session]);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        }
      );

      if (response.data.success) {
        // Update the addresses state with the response data
        setAddresses(response.data.data || []);
        
        // Find default shipping and billing addresses
        const defaultShipping = response.data.data.find(addr => addr.type === 'shipping' && addr.isDefault);
        const defaultBilling = response.data.data.find(addr => addr.type === 'billing' && addr.isDefault);
        
        setDefaultAddresses({
          shipping: defaultShipping?.id || null,
          billing: defaultBilling?.id || null
        });
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      toast.error('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        }
      );

      if (response.data.success) {
        setUserProfile(response.data.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Address handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddingAddress(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setAddressLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      } else {
        throw new Error(response.data.message || 'Failed to delete address');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error(err.response?.data?.message || 'Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId, newType) => {
    try {
      setAddressLoading(true);
      
      // Get the address object
      const address = addresses.find(addr => addr.id === addressId);
      if (!address) return;
      
      // Create the updated address object
      const updatedAddress = {
        ...address,
        isDefault: true
      };
      
      // If we're changing the type (shipping ↔ billing)
      if (address.type !== newType) {
        updatedAddress.type = newType;
      }
      
      // Update the address
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses/${addressId}`,
        updatedAddress,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        }
      );

      if (response.data.success) {
        // Show appropriate success message
        if (address.type !== newType) {
          toast.success(`Address converted to ${newType} address and set as default`);
        } else {
          toast.success(`Default ${newType} address updated successfully`);
        }
        fetchAddresses();
      } else {
        throw new Error(response.data.message || `Failed to update address`);
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error(err.response?.data?.message || `Failed to update address`);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setAddressLoading(true);
      let response;
      
      if (addressData.id) {
        // Update existing address
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses/${addressData.id}`,
          addressData,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`
            }
          }
        );
      } else {
        // Create new address
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses`,
          addressData,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`
            }
          }
        );
      }

      if (response.data.success) {
        toast.success(addressData.id ? 'Address updated successfully' : 'Address added successfully');
        setIsAddingAddress(false);
        fetchAddresses();
      } else {
        throw new Error(response.data.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCancelAddress = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  const getDefaultStatus = (address) => {
    if (address.isDefault) {
      return address.type; // Return 'shipping' or 'billing'
    }
    return null;
  };

  if (status === 'loading' || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Manage your profile and addresses</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <div>{success}</div>
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Manage Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
                      <User className="mr-2 h-5 w-5 text-gray-500" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
                      <Building className="mr-2 h-5 w-5 text-gray-500" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <input
                          type="text"
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                        <input
                          type="text"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
                      <CalendarDays className="mr-2 h-5 w-5 text-gray-500" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start">
                        <CalendarDays className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Member Since</span>
                          <span className="text-sm text-gray-900">
                            {new Date(userProfile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 block">Last Login</span>
                          <span className="text-sm text-gray-900">
                            {userProfile.lastLogin ? new Date(userProfile.lastLogin).toLocaleString() : 'Never logged in'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  {isEditing && (
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: userProfile.firstName || '',
                            lastName: userProfile.lastName || '',
                            email: userProfile.email || '',
                            phone: userProfile.phone || '',
                            companyName: userProfile.companyName || '',
                            businessType: userProfile.businessType || '',
                            taxId: userProfile.taxId || ''
                          });
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Addresses</h3>
                  <Button 
                    onClick={handleAddAddress}
                    className="flex items-center"
                    disabled={isAddingAddress}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                  </Button>
                </div>

                {/* Address Form */}
                {isAddingAddress && (
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <h4 className="text-md font-medium mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h4>
                    <AddressForm 
                      address={editingAddress}
                      onSubmit={handleSaveAddress}
                      onCancel={handleCancelAddress}
                      isLoading={addressLoading}
                    />
                  </div>
                )}

                {/* Addresses List */}
                {addressLoading && !addresses.length ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="text-gray-500">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No addresses found</h3>
                    <p className="text-gray-500 mb-4">Add a shipping or billing address to get started</p>
                    <Button onClick={handleAddAddress}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={handleEditAddress}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefaultAddress}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 