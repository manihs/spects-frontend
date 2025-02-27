'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import axiosInstance from '@/lib/axios';
import { 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Shield, 
  ArrowLeft,
  ChevronRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getTotals, clearCart, setAuthToken } = useCartStore();
  
  // Customer addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    paymentMethod: 'cod', // Default to cash on delivery
    notes: '',
    useExistingAddress: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Set auth token for API requests
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session, setAuthToken]);
  
  // Fetch customer addresses when authenticated
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        try {
          const response = await axiosInstance.get('/api/customers/addresses', {
            headers: { 'Authorization': `Bearer ${session.accessToken}` }
          });
          
          if (response.success) {
            setAddresses(response.data || []);
            
            // Find default shipping address
            const defaultAddress = response.data.find(addr => addr.isDefault && addr.type === 'shipping');
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setFormData(prev => ({ ...prev, useExistingAddress: true }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
        }
      }
    };
    
    fetchAddresses();
  }, [status, session]);
  
  // Wait for component to mount
  useEffect(() => {
    setMounted(true);
    
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/account/login?callbackUrl=/checkout');
    }
    
    // Prefill form with user data
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user.email || prev.email,
        firstName: session.user.name?.split(' ')[0] || prev.firstName,
        lastName: session.user.name?.split(' ')[1] || prev.lastName,
      }));
    }
  }, [session, status, router]);
  
  // Handle empty cart
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items, router]);
  
  if (!mounted || status === 'loading') {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  const { subtotal, tax, shipping, total } = getTotals();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // When selecting an address from dropdown
    if (name === 'addressId') {
      setSelectedAddressId(value);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare shipping and billing address data
      let shippingAddressId = null;
      let billingAddressId = null;
      
      // If using existing address
      if (formData.useExistingAddress && selectedAddressId) {
        shippingAddressId = parseInt(selectedAddressId);
        billingAddressId = parseInt(selectedAddressId); // Using same address for billing
      } else {
        // Create a new address
        try {
          const addressData = {
            type: 'shipping',
            firstName: formData.firstName,
            lastName: formData.lastName,
            address1: formData.address1,
            address2: formData.address2 || '',
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            isDefault: false // Don't set as default for now
          };
          
          const response = await axiosInstance.post('/api/customers/addresses', addressData, {
            headers: { 'Authorization': `Bearer ${session.accessToken}` }
          });
          
          if (response.success && response.data) {
            shippingAddressId = response.data.id;
            billingAddressId = response.data.id; // Using same address for billing
          } else {
            throw new Error(response.message || 'Failed to create address');
          }
        } catch (error) {
          throw new Error(`Address error: ${error.message || 'Failed to save address'}`);
        }
      }
      
      // Create the order
      if (shippingAddressId && billingAddressId) {
        const orderData = {
          shippingAddressId,
          billingAddressId,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        };
        
        const orderResponse = await axiosInstance.post('/api/orders', orderData, {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        
        if (orderResponse.success) {
          setSuccess('Order placed successfully!');
          clearCart();
          
          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push(`/checkout/success?orderId=${orderResponse.data.id}`);
          }, 1500);
        } else {
          throw new Error(orderResponse.message || 'Failed to create order');
        }
      } else {
        throw new Error('Invalid address information');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get address by ID
  const getSelectedAddress = () => {
    if (!selectedAddressId) return null;
    return addresses.find(addr => addr.id === parseInt(selectedAddressId));
  };
  
  const selectedAddress = getSelectedAddress();
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <Link href="/cart" className="flex items-center text-blue-600">
                <ArrowLeft size={16} className="mr-1" /> Back to cart
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Checkout</h1>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Contact Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                
                {/* Existing Addresses */}
                {addresses.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="useExistingAddress"
                        name="useExistingAddress"
                        checked={formData.useExistingAddress}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="useExistingAddress" className="ml-2 text-sm font-medium text-gray-700">
                        Use one of my saved addresses
                      </label>
                    </div>
                    
                    {formData.useExistingAddress && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Address
                        </label>
                        <select
                          name="addressId"
                          value={selectedAddressId || ''}
                          onChange={handleChange}
                          required={formData.useExistingAddress}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select an address</option>
                          {addresses.map(address => (
                            <option key={address.id} value={address.id}>
                              {address.firstName} {address.lastName}, {address.address1}, {address.city}, {address.state}
                            </option>
                          ))}
                        </select>
                        
                        {selectedAddress && (
                          <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                            <p><span className="font-medium">Name:</span> {selectedAddress.firstName} {selectedAddress.lastName}</p>
                            <p><span className="font-medium">Address:</span> {selectedAddress.address1}</p>
                            {selectedAddress.address2 && <p>{selectedAddress.address2}</p>}
                            <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
                            <p>{selectedAddress.country}</p>
                            {selectedAddress.phone && <p><span className="font-medium">Phone:</span> {selectedAddress.phone}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* New Address Form Fields */}
                {!formData.useExistingAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required={!formData.useExistingAddress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Payment Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <label className="flex items-center p-3 border rounded-md cursor-pointer bg-gray-50 border-blue-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                    <DollarSign size={20} className="text-gray-500" />
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === 'credit-card'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">All major cards accepted</p>
                    </div>
                    <CreditCard size={20} className="text-gray-500" />
                  </label>
                </div>
                
                {formData.paymentMethod === 'credit-card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Order Notes */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Special instructions for delivery or any other notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Order <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="max-h-80 overflow-y-auto mb-4 divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex py-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="64px"
                        />
                      ) : (
                        <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                          <ShoppingBag size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {item.quantity}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-xs text-gray-500">{item.variantName}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <p>Subtotal</p>
                  <p>{formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Shipping</p>
                  <p>{shipping === 0 ? 'Free' : formatPrice(shipping)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Tax</p>
                  <p>{formatPrice(tax)}</p>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between font-semibold">
                    <p>Total</p>
                    <p>{formatPrice(total)}</p>
                  </div>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="border-t pt-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Truck size={18} className="mr-2 text-gray-500" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Shield size={18} className="mr-2 text-gray-500" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign size={18} className="mr-2 text-gray-500" />
                  <span>Cash on Delivery available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}