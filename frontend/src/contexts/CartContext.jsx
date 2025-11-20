import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Check if an item with the same cartId already exists
      const existingItem = state.items.find(
        item => item.cartId === action.payload.cartId
      );

      if (existingItem) {
        // If same cartId exists, update quantity
        return {
          ...state,
          items: state.items.map(item =>
            item.cartId === action.payload.cartId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        // Add as new item
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.cartId !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartId === action.payload.cartId
            ? { ...item, quantity: action.payload.quantity, ...action.payload }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on initialization
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : { items: [] };
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return { items: [] };
    }
  };

  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  // Save cart to localStorage whenever state changes
  React.useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state]);

  const addToCart = (product, size = 'M', color = '', quantity = 1) => {
    // Handle both old format (product, size, color, quantity) and new format (cartItem object)
    let cartItem;
    
    if (typeof product === 'object' && product.id && product.name && product.price !== undefined) {
      // New format: product is already a cart item object
      cartItem = {
        cartId: `${product.id}-${product.size || size}-${product.color || color}-${Date.now()}`,
        ...product,
        price: parseFloat(product.price || 0),
        quantity: product.quantity || quantity,
        // Store product variants for cart editing
        sizes: product.sizes || [],
        colors: product.colors || [],
        variants: product.variants || []
      };
    } else {
      // Old format: separate parameters
      cartItem = {
        cartId: `${product.id}-${size}-${color}-${Date.now()}`,
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
        image: product.image,
        size,
        color,
        quantity,
        // Store product variants for cart editing
        sizes: product.sizes || [],
        colors: product.colors || [],
        variants: product.variants || []
      };
    }
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: cartItem,
    });
  };

  const removeFromCart = (cartId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: cartId,
    });
  };

  const updateQuantity = (cartId, quantity, additionalProps = {}) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { cartId, quantity, ...additionalProps },
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (parseFloat(item.price || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
