import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import apiService from '../services/api';

const CartContext = createContext();

// Generate or retrieve session ID
const getSessionId = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.log('⚠️ Browser environment not ready');
    return null;
  }
  
  try {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cart_session_id', sessionId);
      console.log('🆕 Generated new session ID:', sessionId);
    } else {
      console.log('♻️ Retrieved existing session ID:', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error('❌ Error accessing localStorage:', error);
    return null;
  }
};

// Cart actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_TO_CART_SUCCESS: 'ADD_TO_CART_SUCCESS',
  UPDATE_QUANTITY_SUCCESS: 'UPDATE_QUANTITY_SUCCESS',
  REMOVE_FROM_CART_SUCCESS: 'REMOVE_FROM_CART_SUCCESS',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  SET_ERROR: 'SET_ERROR',
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case CART_ACTIONS.SET_CART:
      return { 
        ...state, 
        cart: action.payload.cart,
        items: action.payload.items || [],
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.ADD_TO_CART_SUCCESS:
      return { 
        ...state, 
        cart: action.payload.cart,
        items: action.payload.items || [],
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY_SUCCESS:
      return { 
        ...state, 
        cart: action.payload.cart,
        items: action.payload.items || [],
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.REMOVE_FROM_CART_SUCCESS:
      return { 
        ...state, 
        cart: action.payload.cart,
        items: action.payload.items || [],
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return { 
        ...state, 
        cart: null,
        items: [],
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  cart: null,
  items: [],
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cartJustCleared, setCartJustCleared] = useState(false);

  // Load cart on component mount (but not if cart was just cleared)
  useEffect(() => {
    // Don't auto-load if cart was just cleared (prevents reloading after order)
    if (cartJustCleared) {
      console.log('🔄 Cart was just cleared, skipping auto-load');
      setIsInitialized(true);
      // Reset the flag after a delay
      setTimeout(() => setCartJustCleared(false), 5000);
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLoadCart = async () => {
      try {
        const sessionId = getSessionId();
        if (!sessionId && retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retry ${retryCount}/${maxRetries} - waiting for session ID...`);
          setTimeout(attemptLoadCart, 500);
          return;
        }
        
        if (sessionId) {
          await loadCart();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing cart:', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite retries
      }
    };
    
    // Initial attempt with small delay
    setTimeout(attemptLoadCart, 100);
  }, [cartJustCleared]);

  // Load cart from backend
  const loadCart = async (forceReload = false) => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) {
        console.log('⚠️ No session ID available, skipping cart load');
        return;
      }
      
      console.log('🔄 Loading cart with session ID:', sessionId);
      console.log('🔍 localStorage cart_session_id:', localStorage.getItem('cart_session_id'));
      
      // If cart is already empty and we're not forcing a reload, don't overwrite empty state
      // This prevents reloading old cart data after it's been cleared
      if (!forceReload && state.items.length === 0 && !state.cart) {
        console.log('🔄 Cart state is already empty, skipping reload');
        return;
      }
      
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await apiService.get(`/cart?session_id=${sessionId}`);
      
      console.log('📦 Cart API response:', response);
      
      if (response.success) {
        console.log('✅ Cart loaded successfully, items:', response.data.items?.length || 0);
        console.log('📋 Cart data:', response.data.cart);
        
        // If cart is null or items are empty, ensure state is cleared
        const items = response.data.items || [];
        const cart = response.data.cart;
        
        if (!cart || !items || items.length === 0) {
          console.log('🔄 Cart is empty, clearing state');
          dispatch({
            type: CART_ACTIONS.CLEAR_CART_SUCCESS
          });
          return;
        }
        
        // Transform cart items to include proper image and stock data
        const transformedItems = items.map(item => ({
          ...item,
          id: item.id, // Backend cart item ID
          cartId: item.id, // For compatibility with frontend
          productId: item.variant?.product?.id || item.product_id, // Product ID for navigation
          product_id: item.variant?.product?.product_id || null, // User-entered Product ID
          name: item.variant?.product?.name || item.name,
          image: item.variant?.product?.images?.[0]?.image_path || item.image,
          price: item.variant?.sale_price || item.variant?.price || item.price,
          originalPrice: item.variant?.sale_price ? item.variant?.price : null,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          variants: item.variant?.product?.variants || [],
          variant: item.variant, // Include the variant object for SKU access
          stock_quantity: item.variant?.quantity || 0,
          current_stock: item.current_stock || {}
        }));

        console.log('🔄 Transformed items:', transformedItems);

        dispatch({
          type: CART_ACTIONS.SET_CART,
          payload: {
            cart: response.data.cart,
            items: transformedItems
          }
        });
      } else {
        console.log('❌ Cart loading failed:', response.message);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to load cart' });
    }
  };

  // Add item to cart with stock reservation
  const addToCart = async (productOrCartItem, size = null, color = null, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      let product, selectedSize, selectedColor, selectedQuantity;

      // Handle both calling patterns: addToCart(cartItem) and addToCart(product, size, color, quantity)
      if (typeof productOrCartItem === 'object' && productOrCartItem.id) {
        // Called with cartItem object (from ProductCard, CartSelectionModal, etc.)
        product = productOrCartItem;
        selectedSize = productOrCartItem.size || size;
        selectedColor = productOrCartItem.color || color;
        selectedQuantity = productOrCartItem.quantity || quantity;
      } else {
        // Called with separate parameters
        product = productOrCartItem;
        selectedSize = size;
        selectedColor = color;
        selectedQuantity = quantity;
      }

      // Find the variant ID
      let variantId = null;
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => 
          v.size === selectedSize && v.color === selectedColor
        );
        variantId = variant?.id;
      }

      if (!variantId) {
        console.error('Variant not found:', {
          productId: product.id,
          productName: product.name,
          selectedSize,
          selectedColor,
          availableVariants: product.variants?.map(v => ({ id: v.id, size: v.size, color: v.color }))
        });
        throw new Error('Variant not found for the selected size and color');
      }

      const response = await apiService.post('/cart/add', {
        product_id: product.id,
        variant_id: variantId,
        quantity: selectedQuantity,
        size: selectedSize,
        color: selectedColor,
        session_id: getSessionId(),
      });

      if (response.success) {
        console.log('✅ Add to cart response:', response);
        console.log('📦 Full response.data:', response.data);
        console.log('📦 Cart data:', response.data?.cart);
        console.log('📋 Cart items (direct):', response.data?.cart?.items);
        console.log('📋 Cart items (alternative):', response.data?.items);
        console.log('📋 Cart item (single):', response.data?.cart_item);
        
        // Get cart items from response - check multiple possible structures
        let cartItems = [];
        
        // Check if cart has items array
        if (response.data?.cart?.items && Array.isArray(response.data.cart.items) && response.data.cart.items.length > 0) {
          cartItems = response.data.cart.items;
          console.log('✅ Using cart.items array:', cartItems.length, 'items');
        }
        // Check if items are at data level
        else if (response.data?.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
          cartItems = response.data.items;
          console.log('✅ Using data.items array:', cartItems.length, 'items');
        }
        // Check if single cart_item was returned (newly added item)
        else if (response.data?.cart_item) {
          // If we have a single cart_item, we need to load the full cart
          console.log('⚠️ Only single cart_item returned, loading full cart');
          await loadCart(true); // Force reload
          return { success: true, message: response.message || 'Item added to cart successfully' };
        }
        // If cart exists but has no items, or items array is empty
        else if (response.data?.cart && (!response.data.cart.items || response.data.cart.items.length === 0)) {
          console.warn('⚠️ Cart exists but has no items, reloading cart from backend');
          await loadCart(true); // Force reload
          return { success: true, message: response.message || 'Item added to cart successfully' };
        }
        // No items found at all
        else {
          console.warn('⚠️ No items found in response, reloading cart from backend');
          await loadCart(true); // Force reload
          return { success: true, message: response.message || 'Item added to cart successfully' };
        }
        
        console.log('🔄 Processing', cartItems.length, 'cart items');
        
        // Transform cart items to include proper image and stock data
        const transformedItems = cartItems.map(item => {
          const transformed = {
            ...item,
            id: item.id, // Backend cart item ID
            cartId: item.id, // For compatibility with frontend
            productId: item.variant?.product?.id || item.product_id, // Product ID for navigation
            product_id: item.variant?.product?.product_id || null, // User-entered Product ID
            name: item.variant?.product?.name || item.name,
            image: item.variant?.product?.images?.[0]?.image_path || item.image,
            price: item.variant?.sale_price || item.variant?.price || item.price,
            originalPrice: item.variant?.sale_price ? item.variant?.price : null,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            variants: item.variant?.product?.variants || [],
            variant: item.variant, // Include the variant object for SKU access
            stock_quantity: item.variant?.quantity || 0,
            current_stock: item.current_stock || {}
          };
          console.log('🔄 Transformed item:', transformed.id, transformed.name);
          return transformed;
        });

        console.log('✅ Transformed', transformedItems.length, 'items:', transformedItems);

        dispatch({
          type: CART_ACTIONS.ADD_TO_CART_SUCCESS,
          payload: {
            cart: response.data.cart,
            items: transformedItems
          }
        });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Update cart item quantity
  const updateQuantity = async (cartItemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.put(`/cart/items/${cartItemId}`, {
        quantity: quantity,
        session_id: getSessionId(),
      });

      if (response.success) {
        // Transform cart items to include proper image and stock data
        const transformedItems = (response.data.cart?.items || []).map(item => ({
          ...item,
          id: item.id, // Backend cart item ID
          cartId: item.id, // For compatibility with frontend
          productId: item.variant?.product?.id || item.product_id, // Product ID for navigation
          product_id: item.variant?.product?.product_id || null, // User-entered Product ID
          name: item.variant?.product?.name || item.name,
          image: item.variant?.product?.images?.[0]?.image_path || item.image,
          price: item.variant?.sale_price || item.variant?.price || item.price,
          originalPrice: item.variant?.sale_price ? item.variant?.price : null,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          variants: item.variant?.product?.variants || [],
          variant: item.variant, // Include the variant object for SKU access
          stock_quantity: item.variant?.quantity || 0,
          current_stock: item.current_stock || {}
        }));

        dispatch({
          type: CART_ACTIONS.UPDATE_QUANTITY_SUCCESS,
          payload: {
            cart: response.data.cart,
            items: transformedItems
          }
        });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.delete(`/cart/items/${cartItemId}`, {
        data: { session_id: getSessionId() }
      });

      if (response.success) {
        // Transform cart items to include proper image and stock data
        const transformedItems = (response.data.cart?.items || []).map(item => ({
          ...item,
          id: item.id, // Backend cart item ID
          cartId: item.id, // For compatibility with frontend
          productId: item.variant?.product?.id || item.product_id, // Product ID for navigation
          product_id: item.variant?.product?.product_id || null, // User-entered Product ID
          name: item.variant?.product?.name || item.name,
          image: item.variant?.product?.images?.[0]?.image_path || item.image,
          price: item.variant?.sale_price || item.variant?.price || item.price,
          originalPrice: item.variant?.sale_price ? item.variant?.price : null,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          variants: item.variant?.product?.variants || [],
          variant: item.variant, // Include the variant object for SKU access
          stock_quantity: item.variant?.quantity || 0,
          current_stock: item.current_stock || {}
        }));

        dispatch({
          type: CART_ACTIONS.REMOVE_FROM_CART_SUCCESS,
          payload: {
            cart: response.data.cart,
            items: transformedItems
          }
        });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      console.log('🗑️ Clearing cart for session:', sessionId);
      
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // Set flag to prevent auto-reload after clearing
      setCartJustCleared(true);

      const response = await apiService.delete('/cart/clear', {
        data: { session_id: sessionId }
      });

      console.log('🗑️ Clear cart API response:', response);

      // Always clear the cart state, even if API call fails or cart is already empty
      // This ensures frontend state matches backend state
      dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
      console.log('✅ Cart state cleared in frontend');
      
      if (response.success) {
        console.log('✅ Cart cleared successfully on backend');
        return { success: true, message: response.message };
      } else {
        // Even if API returns error (e.g., cart already empty), we've cleared the state
        console.log('⚠️ Cart clear API returned non-success, but state is cleared');
        return { success: true, message: 'Cart cleared' };
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      // Even if API call fails, clear the frontend state
      dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
      setCartJustCleared(true);
      console.log('✅ Cart state cleared locally despite API error');
      return { success: true, message: 'Cart cleared locally' };
    }
  };

  // Get cart totals
  const getCartTotals = () => {
    if (!state.cart) {
      return { totalAmount: 0, itemCount: 0 };
    }
    
    return {
      totalAmount: parseFloat(state.cart.total_amount) || 0,
      itemCount: parseInt(state.cart.item_count) || 0
    };
  };

  // Check if item is in cart
  const isInCart = (productId, size, color) => {
    return state.items.some(item => 
      item.product_id === productId && 
      item.size === size && 
      item.color === color
    );
  };

  // Get item quantity in cart
  const getItemQuantity = (productId, size, color) => {
    const item = state.items.find(item => 
      item.product_id === productId && 
      item.size === size && 
      item.color === color
    );
    return item ? item.quantity : 0;
  };

  const value = {
    // State
    cart: state.cart,
    items: state.items,
    loading: state.loading,
    error: state.error,
    isInitialized,
    
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    
    // Helpers
    getCartTotals,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('useCart must be used within a CartProvider');
    // Return a fallback context to prevent crashes
    return {
      cart: null,
      items: [],
      loading: false,
      error: 'Cart context not available',
      isInitialized: false,
      addToCart: () => Promise.resolve({ success: false, message: 'Cart not available' }),
      updateQuantity: () => Promise.resolve({ success: false, message: 'Cart not available' }),
      removeFromCart: () => Promise.resolve({ success: false, message: 'Cart not available' }),
      clearCart: () => Promise.resolve({ success: false, message: 'Cart not available' }),
      loadCart: () => Promise.resolve(),
      getCartTotals: () => ({ totalAmount: 0, itemCount: 0 }),
      isInCart: () => false,
      getItemQuantity: () => 0,
    };
  }
  return context;
};
