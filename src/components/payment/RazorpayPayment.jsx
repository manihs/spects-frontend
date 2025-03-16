// src/components/RazorpayCheckout.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Check } from 'lucide-react';

const RazorpayCheckout = ({ 
  session, 
  orderId, 
  orderAmount,
  orderNumber, 
  onSuccess, 
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    const initRazorpay = async () => {
      const result = await loadRazorpayScript();
      setRazorpayReady(result);
    };

    initRazorpay();
  }, []);

  const handlePayment = async () => {
    if (!razorpayReady) {
      setError('Payment gateway is not ready. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure proper number formatting
      const amount = parseFloat(parseFloat(orderAmount).toFixed(2));
      
      console.log('Creating Razorpay order for:', {
        orderId,
        amount
      });

      // First create Razorpay order via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-razorpay-order`, 
        {
          orderId,
          amount
        },
        {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        }
      );

      console.log('Payment order creation response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment order');
      }

      const paymentData = response.data.data;

      console.log('Opening Razorpay with data:', {
        orderId: paymentData.razorpayOrderId,
        amount: paymentData.amount,
        amountInPaisa: Math.round(paymentData.amount * 100)
      });

      // Open Razorpay checkout
      const options = {
        key: paymentData.key,
        amount: Math.round(paymentData.amount * 100), // Convert to paisa
        currency: paymentData.currency || 'INR',
        name: 'Your Store',
        description: `Order #${orderNumber || paymentData.notes.orderNumber}`,
        order_id: paymentData.razorpayOrderId,
        prefill: paymentData.prefillData,
        notes: paymentData.notes,
        theme: {
          color: '#3399cc'
        },
        handler: function(response) {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      
      // Extract and display appropriate error message
      let errorMessage = 'Failed to initialize payment';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handlePaymentSuccess = async (response) => {
    console.log('Payment success response:', response);
    
    try {
      setSuccess('Verifying payment...');
      
      const verifyResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`,
        {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        },
        {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        }
      );

      console.log('Payment verification response:', verifyResponse.data);

      if (verifyResponse.data.success) {
        setSuccess('Payment successful!');
        
        if (onSuccess) {
          onSuccess(verifyResponse.data.data);
        }
      } else {
        throw new Error(verifyResponse.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      
      let errorMessage = 'Payment verification failed';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
          <Check className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="text-sm">{success}</div>
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={isLoading || !razorpayReady}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:bg-blue-400"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            {success ? 'Processing...' : 'Connecting to payment gateway...'}
          </>
        ) : (
          'Pay ₹' + parseFloat(orderAmount).toFixed(2) + ' with Razorpay'
        )}
      </button>
      
      {!isLoading && (
        <p className="text-xs text-gray-500 text-center mt-2">
          You'll be redirected to Razorpay's secure payment gateway
        </p>
      )}
    </div>
  );
};

export default RazorpayCheckout;