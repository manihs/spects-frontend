// src/app/(store)/checkout/page.jsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useUserContext } from '@/context/userContext';
import axios from 'axios';
import Select from 'react-select';
import { contries as countries } from '@/lib/locals/countries';
import { provinces } from '@/lib/locals/provinces';

import {
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  ChevronRight,
  DollarSign,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import RazorpayCheckout from '@/components/payment/RazorpayPayment';

// Loading fallback component
function CheckoutLoading() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading checkout...</h1>
        <p className="text-gray-600">Please wait while we prepare your checkout page.</p>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { userProfile } = useUserContext();
  const { items, getTotals, clearCart } = useCartStore();

  // Get URL parameters
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  // Customer addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Order and payment states
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentStep, setPaymentStep] = useState(!!orderId); // Start at payment step if orderId exists

  // Form states
  const [formData, setFormData] = useState({
    email: userProfile?.email || session?.user?.email || '',
    phone: userProfile?.phone || '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'razorpay', // Only Razorpay is allowed
    notes: '',
    useExistingAddress: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Add state for country and state options
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);

  // Initialize country options
  useEffect(() => {
    const formattedCountries = countries.map(country => ({
      value: country.code,
      label: country.name
    }));
    setCountryOptions(formattedCountries);
  }, []);

  // Update state options when country changes
  useEffect(() => {
    if (formData.country) {
      const countryProvinces = provinces.filter(province => province.countryCode === formData.country);
      const formattedProvinces = countryProvinces.map(province => ({
        value: province.code,
        label: province.name
      }));
      setStateOptions(formattedProvinces);
    } else {
      setStateOptions([]);
    }
  }, [formData.country]);

  // Fetch customer addresses when authenticated
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses`, {
            headers: { 'Authorization': `Bearer ${session.accessToken}` }
          });

          if (response.data.success) {
            setAddresses(response.data.data || []);

            // Find default shipping address
            const defaultAddress = response.data.data.find(addr => addr.isDefault && addr.type === 'shipping');
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

  // Prefill form with user data
  useEffect(() => {
    setMounted(true);

    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/account/login?callbackUrl=/checkout');
    }

    // Prefill form with user data
    if (session?.user || userProfile) {
      setFormData(prev => ({
        ...prev,
        email: userProfile?.email || session?.user?.email || prev.email,
        phone: userProfile?.phone || prev.phone,
        firstName: session?.user?.name?.split(' ')[0] || prev.firstName,
        lastName: session?.user?.name?.split(' ')[1] || prev.lastName,
      }));
    }
  }, [session, status, router, userProfile]);

  // Handle empty cart
  useEffect(() => {
    if (mounted && items.length === 0 && !createdOrder) {
      router.push('/cart');
    }
  }, [mounted, items, router, createdOrder]);

  // Handle partial payment
  useEffect(() => {
    if (orderId && amount) {
      setCreatedOrder({
        id: orderId,
        totalAmount: parseFloat(amount),
        orderNumber: 'Partial Payment'
      });
      setPaymentStep(true);
    }
  }, [orderId, amount]);

  if (!mounted || status === 'loading') {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const { subtotal, tax, shipping, total } = getTotals();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
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

          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/addresses`, addressData, {
            headers: { 'Authorization': `Bearer ${session.accessToken}` }
          });

          if (response.data.success && response.data.data) {
            shippingAddressId = response.data.data.id;
            billingAddressId = response.data.data.id; // Using same address for billing
          } else {
            throw new Error(response.data.message || 'Failed to create address');
          }
        } catch (error) {
          throw new Error(`Address error: ${error.response?.data?.message || error.message || 'Failed to save address'}`);
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

        console.log('Creating order with data:', orderData);

        const orderResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, orderData, {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });

        if (orderResponse.data.success) {
          console.log('Order created:', orderResponse.data.data);
          setCreatedOrder(orderResponse.data.data);

          if (formData.paymentMethod === 'cod') {
            // For cash on delivery, redirect to success page
            clearCart();
            setTimeout(() => {
              router.push(`/checkout/success?orderId=${orderResponse.data.data.id}`);
            }, 1500);
          } else if (formData.paymentMethod === 'razorpay') {
            // For Razorpay, proceed to payment step
            setPaymentStep(true);
          }
        } else {
          throw new Error(orderResponse.data.message || 'Failed to create order');
        }
      } else {
        throw new Error('Invalid address information');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Order processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setSuccess('Payment successful! Redirecting to order confirmation...');
    clearCart();

    // Redirect to success page
    setTimeout(() => {
      router.push(`/checkout/success?orderId=${createdOrder.id}`);
    }, 1500);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    console.error('Payment failed:', errorMessage);
    setError(`Payment failed: ${errorMessage}. Your order has been created, but you'll need to complete payment later.`);
  };

  // Get address by ID
  const getSelectedAddress = () => {
    if (!selectedAddressId) return null;
    return addresses.find(addr => addr.id === parseInt(selectedAddressId));
  };

  const selectedAddress = getSelectedAddress();

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          {!paymentStep && (
            <>
              <Link href="/cart" className="flex items-center text-blue-600">
                <ArrowLeft size={16} className="mr-1" /> Back to cart
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                {paymentStep ? 'Payment' : 'Checkout'}
              </h1>
              {paymentStep && (
                <p className="text-gray-600 mt-1">
                  {orderId ? 'Complete your partial payment' : 'Complete your purchase by processing the payment'}
                </p>
              )}
            </>
          )}

        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">


            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
                <Check className="mr-2 h-5 w-5 flex-shrink-0" />
                <div>{success}</div>
              </div>
            )}

            {!paymentStep && (
              <form onSubmit={handleSubmit}>
                {/* Contact Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-500">
                  <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
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
                        readOnly
                      />
                    </div>
                    <div className="md:col-span-1">
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
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-500">
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
                          <Select
                            value={addresses.find(addr => addr.id === parseInt(selectedAddressId))}
                            onChange={(option) => {
                              setSelectedAddressId(option.id);
                              setFormData(prev => ({
                                ...prev,
                                firstName: option.firstName,
                                lastName: option.lastName,
                                address1: option.address1,
                                address2: option.address2 || '',
                                city: option.city,
                                state: option.state,
                                postalCode: option.postalCode,
                                country: option.country,
                                phone: option.phone
                              }));
                            }}
                            options={addresses.map(addr => ({
                              id: addr.id,
                              value: addr.id,
                              label: `${addr.firstName} ${addr.lastName}, ${addr.address1}, ${addr.city}, ${addr.state}`,
                              ...addr
                            }))}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select a saved address"
                            isSearchable
                            noOptionsMessage={() => "No saved addresses found"}
                          />
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
                          Country
                        </label>
                        <Select
                          value={countryOptions.find(option => option.value === formData.country)}
                          onChange={(option) => handleChange({ target: { name: 'country', value: option.value } })}
                          options={countryOptions}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select country"
                          isSearchable
                          noOptionsMessage={() => "No countries found"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <Select
                          value={stateOptions.find(option => option.value === formData.state)}
                          onChange={(option) => handleChange({ target: { name: 'state', value: option.value } })}
                          options={stateOptions}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select state/province"
                          isSearchable
                          noOptionsMessage={() => "No states/provinces found"}
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
                          PIN Code
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

                    </div>
                  )}
                </div>

                {/* Order Notes */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-500">
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
                      Proceed to Payment <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {paymentStep && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mt-4">
                  {paymentStep ? 'Payment' : 'Checkout'}
                </h1>
                {paymentStep && (
                  <p className="text-gray-600 mt-1">
                    {orderId ? 'Complete your partial payment' : 'Complete your purchase by processing the payment'}
                  </p>
                )}

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-2xl mb-4">Shipping Address</h3>

                  <div className="bg-white py-4 border-gray-200">
                  
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="font-semibold text-gray-600 w-24">Name:</span>
                        <span className="text-gray-800">
                          {selectedAddress.firstName} {selectedAddress.lastName}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-gray-600 w-24">Street:</span>
                        <div>
                          <p className="text-gray-800">{selectedAddress.address1}</p>
                          {selectedAddress.address2 && (
                            <p className="text-gray-800">{selectedAddress.address2}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-gray-600 w-24">City:</span>
                        <span className="text-gray-800">
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-gray-600 w-24">Country:</span>
                        <span className="text-gray-800">{selectedAddress.country}</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-gray-600 w-24">Phone:</span>
                        <span className="text-gray-800">{selectedAddress.phone}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* Order Summary and Payment */}
          <div className="lg:w-1/3">
            <div className="bg-gray-100 shadow-sm p-6  lg:top-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="flex justify-between mb-4">
                <p>{items.length} Items</p>
                <Link href="/cart" className="text-blue-600 hover:underline underline">Edit Items</Link>
              </div>

              <div className="space-y-3 mb-4 border-t pt-4">
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
                    <p>Total (INR)</p>
                    <p>{formatPrice(total)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {paymentStep && createdOrder && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Payment</h3>
                  <div className="mb-4">

                    <RazorpayCheckout
                      session={session}
                      orderId={createdOrder.id}
                      orderAmount={createdOrder.totalAmount}
                      orderNumber={createdOrder.orderNumber}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      allowPartialPayment={userProfile?.allowPartialPayment}
                    />

                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="border-t pt-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Truck size={18} className="mr-2 text-gray-500" />
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield size={18} className="mr-2 text-gray-500" />
                  <span>Secure Razorpay checkout</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 shadow-sm p-6  lg:top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              {items.map((item) => (
                <div key={item.id} className="flex py-3">
                  <div className="h-16 w-16 flex-shrink-0 rounded-md border border-gray-200 relative">
                    {item.image ? (
                      <div className="h-full w-full relative">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
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
                    <h3 className="mb-1 font-medium text-gray-900">{item.name} ({item.variantName})</h3>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">Subtotal : {formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="mt-1 text-xs text-gray-500">Tax ({item.taxRate}%) : {formatPrice(item.taxAmount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add styles for React Select
const styles = `
  .react-select-container .react-select__control {
    border-color: #d1d5db;
    border-radius: 0.375rem;
    min-height: 42px;
  }
  .react-select-container .react-select__control:hover {
    border-color: #9ca3af;
  }
  .react-select-container .react-select__control--is-focused {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  .react-select-container .react-select__menu {
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .react-select-container .react-select__option {
    padding: 0.5rem 0.75rem;
  }
  .react-select-container .react-select__option--is-focused {
    background-color: #f3f4f6;
  }
  .react-select-container .react-select__option--is-selected {
    background-color: #3b82f6;
    color: white;
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Main component that wraps everything in a Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}