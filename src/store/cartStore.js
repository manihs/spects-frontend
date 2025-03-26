import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axios';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isOpen: false,
      couponCode: null,
      discountAmount: 0,
      error: null,
      lastSyncTime: null,
      authToken: null, // Store the token here

      // Open/close cart sidebar
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Set auth token for requests
      getAuthHeaders: () => {
        // First try from our stored token
        const { authToken } = get();
        if (authToken) {
          return { 'Authorization': `Bearer ${authToken}` };
        }

        // Fallback to localStorage (less preferred)
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') 
          : null;
        return token ? { 'Authorization': `Bearer ${token}` } : {};
      },

      // Fetch cart from API
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();
          console.log("🔍 Fetching cart with headers:", authHeaders);

          // If we don't have auth, don't even try
          if (!authHeaders.Authorization) {
            console.log("⚠️ No auth token available for cart fetch");
            set({ 
              items: [], 
              isLoading: false, 
              lastSyncTime: new Date().toISOString() 
            });
            return true;
          }

          const response = await axiosInstance.get('/api/cart', { headers: authHeaders });
          const { data, success, message } = response;

          if (success) {
            const cartData = data;
            console.log("🔍 Cart data:", cartData);

            // Check if we actually have items
            if (!cartData.items || !Array.isArray(cartData.items)) {
              set({ 
                items: [], 
                isLoading: false, 
                lastSyncTime: new Date().toISOString() 
              });
              return true;
            }

            const parseImages = (imageString) => {
              try {
                const images = JSON.parse(imageString || "[]");
                return Array.isArray(images) && images.length > 0 ? images[0] : null;
              } catch {
                return null;
              }
            };

            // Transform API cart items to match our format
            const items = cartData.items.map(item => ({
              id: `${item.productId}-${item.variantId || 'default'}`,
              productId: item.productId,
              variantId: item.variantId || null,
              name: item.product?.name || 'Product',
              variantName: item.variant 
                ? `${item.product?.name} - ${item.variant.name}` 
                : item.product?.name || 'Product',
              price: parseFloat(item.price),
              image: parseImages(item.variant?.images) || parseImages(item.product?.images) || null,
              quantity: item.quantity,
              taxRate: parseFloat(item.taxRate || item.product?.tax?.rate || 0),
              taxAmount: parseFloat(item.taxAmount || 0),
              subtotal: parseFloat(item.subtotal || 0),
              total: parseFloat(item.total || 0),
              sku: item.variant?.sku || item.product?.sku,
              backendItemId: item.id // Store the backend ID for operations
            }));

            set({ 
              items, 
              couponCode: cartData.couponCode,
              discountAmount: parseFloat(cartData.discountAmount || 0),
              shippingAmount: parseFloat(cartData.shippingAmount || 0),
              taxAmount: parseFloat(cartData.taxAmount || 0),
              totalAmount: parseFloat(cartData.totalAmount || 0),
              isLoading: false, 
              lastSyncTime: new Date().toISOString() 
            });
            return true;
          } else {
            throw new Error(message || 'Failed to fetch cart');
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          set({ 
            error: typeof error === 'string' ? error : error.message || 'Failed to fetch cart', 
            isLoading: false 
          });
          return false;
        }
      },

      // Add item to cart
      addItem: async (product, variant, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();

          // Check if we have auth - need to be logged in to add to cart
          if (!authHeaders.Authorization) {
            throw new Error('You must be logged in to add items to cart');
          }

          // Handle non-variant products
          const isSimpleProduct = !variant;
          // For simple products without variants, the variantId should be null
          const variantId = isSimpleProduct ? null : variant?.id;
          const productId = product.id;

          // Sync with backend
          try {
            console.log(`Adding to cart: Product #${productId}, Variant: ${variantId || 'None'}, Qty: ${quantity}`);
            const response = await axiosInstance.post('/api/cart/items', {
              productId: productId,
              variantId: variantId, // This will be null for simple products
              quantity
            }, { headers: authHeaders });

            if (!response.success) {
              throw new Error(response.message || 'Failed to add item to cart');
            }

            // After successful API call, update the local state
            await get().fetchCart(); // Refresh the entire cart from the server
            return true;
          } catch (syncError) {
            console.warn('Failed to sync cart with backend:', syncError);
            throw syncError; // Re-throw to handle in the outer catch
          }
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          set({ 
            error: error.message || 'Failed to add item to cart', 
            isLoading: false 
          });
          return false;
        }
      },

      // Add multiple items to cart (for multi-variant selection)
      addMultipleItems: async (product, variantsWithQuantities) => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();

          // Check if we have auth
          if (!authHeaders.Authorization) {
            throw new Error('You must be logged in to add items to cart');
          }

          const addPromises = [];

          // Filter out variants with 0 quantity
          const validVariants = variantsWithQuantities.filter(
            ({ quantity }) => quantity > 0
          );

          if (validVariants.length === 0) {
            throw new Error('No valid items to add to cart');
          }

          // Sync with backend - collect promises but don't await yet
          validVariants.forEach(({ variant, quantity }) => {
            addPromises.push(
              axiosInstance.post('/api/cart/items', {
                productId: product.id,
                variantId: variant.id,
                quantity
              }, { headers: authHeaders }).catch(syncError => {
                console.warn(`Failed to sync variant ${variant.id} with backend:`, syncError);
                throw syncError; // Re-throw to handle failures
              })
            );
          });

          // Attempt to sync with backend in parallel
          const results = await Promise.allSettled(addPromises);

          // Check if any promises failed
          const failedResults = results.filter(r => r.status === 'rejected');
          if (failedResults.length > 0) {
            throw new Error(failedResults[0].reason.message || 'Failed to add some items to cart');
          }

          // After successful API calls, refresh the cart
          await get().fetchCart();
          return true;
        } catch (error) {
          console.error('Failed to add items to cart:', error);
          set({ 
            error: error.message || 'Failed to add items to cart', 
            isLoading: false 
          });
          return false;
        }
      },

      // Update item quantity
      updateItemQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const { items } = get();
          const authHeaders = get().getAuthHeaders();

          // Find the item to update
          const itemToUpdate = items.find(item => item.id === itemId);
          if (!itemToUpdate) {
            throw new Error('Item not found in cart');
          }

          const newQuantity = Math.max(1, quantity);

          // If we have the backend item ID directly (from fetchCart)
          if (itemToUpdate.backendItemId) {
            await axiosInstance.put(`/api/cart/items/${itemToUpdate.backendItemId}`, {
              quantity: newQuantity
            }, { headers: authHeaders });
          } else {
            // Fallback to searching for the backend item
            const { data, success } = await axiosInstance.get('/api/cart', { headers: authHeaders });
            if (success && data.items) {
              const backendItem = data.items.find(
                item => item.productId === itemToUpdate.productId && item.variantId === itemToUpdate.variantId
              );
              if (backendItem) {
                await axiosInstance.put(`/api/cart/items/${backendItem.id}`, {
                  quantity: newQuantity
                }, { headers: authHeaders });
              } else {
                throw new Error('Item not found in backend cart');
              }
            } else {
              throw new Error('Failed to fetch cart data');
            }
          }

          // Refresh cart after successful update
          await get().fetchCart();
          return true;
        } catch (error) {
          console.error('Failed to update item quantity:', error);
          set({ 
            error: error.message || 'Failed to update item quantity', 
            isLoading: false 
          });
          return false;
        }
      },

      // Remove item from cart
      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const { items } = get();
          const authHeaders = get().getAuthHeaders();

          // Find the item to remove
          const itemToRemove = items.find(item => item.id === itemId);
          if (!itemToRemove) {
            throw new Error('Item not found in cart');
          }

          // If we have the backend item ID directly
          if (itemToRemove.backendItemId) {
            await axiosInstance.delete(`/api/cart/items/${itemToRemove.backendItemId}`, {
              headers: authHeaders
            });
          } else {
            // Fallback to searching for the backend item
            const { data, success } = await axiosInstance.get('/api/cart', { headers: authHeaders });
            if (success && data.items) {
              const backendItem = data.items.find(
                item => item.productId === itemToRemove.productId && item.variantId === itemToRemove.variantId
              );
              if (backendItem) {
                await axiosInstance.delete(`/api/cart/items/${backendItem.id}`, {
                  headers: authHeaders
                });
              } else {
                throw new Error('Item not found in backend cart');
              }
            } else {
              throw new Error('Failed to fetch cart data');
            }
          }

          // Refresh cart after successful removal
          await get().fetchCart();
          return true;
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          set({ 
            error: error.message || 'Failed to remove item from cart', 
            isLoading: false 
          });
          return false;
        }
      },

      // Clear cart
      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();

          // Sync with backend
          await axiosInstance.delete('/api/cart/clear', { headers: authHeaders });

          // Update local state
          set({ 
            items: [], 
            couponCode: null, 
            discountAmount: 0,
            shippingAmount: 0,
            taxAmount: 0,
            totalAmount: 0, 
            isLoading: false, 
            lastSyncTime: new Date().toISOString() 
          });
          return true;
        } catch (error) {
          console.error('Failed to clear cart:', error);
          set({ 
            error: error.message || 'Failed to clear cart', 
            isLoading: false 
          });
          return false;
        }
      },

      // Apply coupon code
      applyCoupon: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();

          // Sync with backend
          const { data, success, message } = await axiosInstance.post('/api/cart/apply-coupon', {
            couponCode: code
          }, { headers: authHeaders });

          if (success) {
            // Refresh the cart data
            await get().fetchCart();
            return true;
          } else {
            throw new Error(message || 'Failed to apply coupon');
          }
        } catch (error) {
          console.error('Failed to apply coupon:', error);
          set({ 
            error: error.message || 'Failed to apply coupon', 
            isLoading: false 
          });
          return false;
        }
      },

      // Remove coupon code
      removeCoupon: async () => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();

          // Sync with backend
          const { success, message } = await axiosInstance.post('/api/cart/remove-coupon', {}, {
            headers: authHeaders
          });

          if (success) {
            // Refresh the cart data
            await get().fetchCart();
            return true;
          } else {
            throw new Error(message || 'Failed to remove coupon');
          }
        } catch (error) {
          console.error('Failed to remove coupon:', error);
          set({ 
            error: error.message || 'Failed to remove coupon', 
            isLoading: false 
          });
          return false;
        }
      },

      // Merge guest cart with customer cart on login
      mergeCart: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const authHeaders = get().getAuthHeaders();

          // Check if we have auth
          if (!authHeaders.Authorization) {
            throw new Error('Authentication required to merge carts');
          }

          // Sync with backend
          const { success, message } = await axiosInstance.post('/api/cart/merge', {
            sessionId
          }, { headers: authHeaders });

          if (success) {
            // Refresh cart data after merge
            await get().fetchCart();
            return true;
          } else {
            throw new Error(message || 'Failed to merge carts');
          }
        } catch (error) {
          console.error('Failed to merge carts:', error);
          set({ 
            error: error.message || 'Failed to merge carts', 
            isLoading: false 
          });
          return false;
        }
      },

      // Calculate cart totals with individual item taxes
      getTotals: () => {
        const { items, discountAmount, shippingAmount } = get();
        
        // Calculate subtotal from individual items
        const subtotal = items.reduce(
          (total, item) => total + item.price * item.quantity, 0
        );
        
        // Calculate total tax from individual items
        const tax = items.reduce(
          (total, item) => {
            const itemTax = (item.price * item.quantity) * (item.taxRate / 100);
            return total + itemTax;
          }, 0
        );
        
        
        // Get shipping amount from store or calculate based on subtotal
        const shipping = typeof shippingAmount !== 'undefined' 
          ? shippingAmount 
          : (subtotal > 100 ? 0 : 10); // Example: Free shipping over $100
        
        // Calculate total with discount
        const total = Math.max(0, subtotal + tax + shipping - discountAmount);
        
        // Count total items
        const itemCount = items.reduce((count, item) => count + item.quantity, 0);
        
        return {
          subtotal,
          tax,
          shipping,
          discountAmount,
          total,
          itemCount
        };
      },

      // Check if cart needs to be synced with backend
      needsSync: () => {
        const { lastSyncTime } = get();
        if (!lastSyncTime) return true;

        // Sync if last sync was more than 5 minutes ago
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        return new Date(lastSyncTime) < fiveMinutesAgo;
      },

      // Store auth token
      setAuthToken: (token) => {
        if (token) {
          console.log("✅ Setting auth token in store");
          set({ authToken: token });
          // Also store in localStorage for redundancy
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
          }
        }
      },

      // Clear auth token
      clearAuthToken: () => {
        set({ authToken: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      },

      // Clear error message
      clearError: () => set({ error: null })
    }),
    {
      name: 'cart-storage', // name of the item in localStorage
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discountAmount: state.discountAmount,
        shippingAmount: state.shippingAmount,
        lastSyncTime: state.lastSyncTime,
        authToken: state.authToken // Also persist the auth token
      }),
    }
  )
);