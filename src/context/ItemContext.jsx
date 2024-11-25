import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]); // Available products
  const [cart, setCart] = useState([]); // Items in the cart

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        setItems(response.data); // Update items state
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Add an item to the cart
  const addToCart = (product) => {
    if (!product || !product._id) return;

    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);

      if (existingProduct) {
        // Increment the quantity if product already exists in the cart
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add the product with quantity 1 if it's not in the cart
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Remove an item from the cart
  const removeFromCart = (product) => {
    if (!product || !product._id) return;

    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);

      if (existingProduct) {
        // Decrease quantity if more than 1, otherwise remove from cart
        if (existingProduct.quantity > 1) {
          return prevCart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        }
        return prevCart.filter((item) => item._id !== product._id);
      }
      return prevCart;
    });
  };

  // Calculate total items in cart
  const itemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price of items in cart
  const totalPrice = cart.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );

  return (
    <ItemContext.Provider
      value={{
        items,         // Available products
        cart,          // Cart contents
        addToCart,     // Add product to cart
        removeFromCart, // Remove product from cart
        itemsInCart,   // Total quantity of items in cart
        totalPrice,    // Total price of items in cart
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

// Hook to use the ItemContext
export const useItemContext = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItemContext must be used within an ItemProvider');
  }
  return context;
};

export default ItemContext;

