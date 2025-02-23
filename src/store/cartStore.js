// src/store/cartStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            isOpen: false,

            // Open/close cart sidebar
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            // Add item to cart
            addItem: async (product, variant, quantity = 1) => {
                set({ isLoading: true });

                try {
                    const { items } = get();
                    const existingItemIndex = items.findIndex(
                        (item) => item.variantId === variant.id
                    );

                    let newItems;

                    if (existingItemIndex > -1) {
                        // Update quantity if item exists
                        newItems = [...items];
                        newItems[existingItemIndex].quantity += quantity;
                    } else {
                        // Add new item
                        newItems = [
                            ...items,
                            {
                                id: `${product.id}-${variant.id}`,
                                productId: product.id,
                                variantId: variant.id,
                                name: product.name,
                                variantName: `${product.name} - ${variant.attributes.map(a => a.value).join(', ')}`,
                                price: parseFloat(variant.offerPrice || variant.price),
                                image: JSON.parse(variant.images || '[]')[0] || JSON.parse(product.images || '[]')[0] || null,
                                quantity,
                                sku: variant.sku
                            },
                        ];
                    }

                    // Optional API call to sync with backend
                    // await axios.post('/api/cart/update', { items: newItems });

                    set({ items: newItems, isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Failed to add item to cart:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            // Add multiple items to cart (for multi-variant selection)
            addMultipleItems: async (product, variantsWithQuantities) => {
                set({ isLoading: true });

                try {
                    const { items } = get();
                    let newItems = [...items];

                    variantsWithQuantities.forEach(({ variant, quantity }) => {
                        if (quantity <= 0) return;

                        const existingItemIndex = newItems.findIndex(
                            (item) => item.variantId === variant.id
                        );

                        if (existingItemIndex > -1) {
                            // Update quantity if item exists
                            newItems[existingItemIndex].quantity += quantity;
                        } else {
                            // Add new item
                            newItems.push({
                                id: `${product.id}-${variant.id}`,
                                productId: product.id,
                                variantId: variant.id,
                                name: product.name,
                                variantName: `${product.name} - ${variant.attributes.map(a => a.value).join(', ')}`,
                                price: parseFloat(variant.offerPrice || variant.price),
                                image: JSON.parse(variant.images || '[]')[0] || JSON.parse(product.images || '[]')[0] || null,
                                quantity,
                                sku: variant.sku
                            });
                        }
                    });

                    // Optional API call to sync with backend
                    // await axios.post('/api/cart/update', { items: newItems });

                    set({ items: newItems, isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Failed to add items to cart:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            // Update item quantity
            updateItemQuantity: async (itemId, quantity) => {
                set({ isLoading: true });

                try {
                    const { items } = get();
                    const newItems = items.map((item) => {
                        if (item.id === itemId) {
                            return { ...item, quantity: Math.max(1, quantity) };
                        }
                        return item;
                    });

                    // Optional API call to sync with backend
                    // await axios.post('/api/cart/update', { items: newItems });

                    set({ items: newItems, isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Failed to update item quantity:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            // Remove item from cart
            removeItem: async (itemId) => {
                set({ isLoading: true });

                try {
                    const { items } = get();
                    const newItems = items.filter((item) => item.id !== itemId);

                    // Optional API call to sync with backend
                    // await axios.post('/api/cart/update', { items: newItems });

                    set({ items: newItems, isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Failed to remove item from cart:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            // Clear cart
            clearCart: async () => {
                set({ isLoading: true });

                try {
                    // Optional API call to sync with backend
                    // await axios.post('/api/cart/clear');

                    set({ items: [], isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Failed to clear cart:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            // Calculate cart totals
            getTotals: () => {
                const { items } = get();

                const subtotal = items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );

                // You can add tax and shipping calculations here
                const tax = subtotal * 0.1; // Example: 10% tax
                const shipping = subtotal > 100 ? 0 : 10; // Example: Free shipping over $100
                const total = subtotal + tax + shipping;

                return {
                    subtotal,
                    tax,
                    shipping,
                    total,
                    itemCount: items.reduce((count, item) => count + item.quantity, 0),
                };
            },
        }),
        {
            name: 'cart-storage', // name of the item in localStorage
            partialize: (state) => ({ items: state.items }), // only persist items
        }
    )
);