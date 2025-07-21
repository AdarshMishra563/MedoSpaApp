import { useDispatch, useSelector } from 'react-redux';
import { 
  addToCart, 
  removeFromCart, 
  clearCart,
  resetLastAdded,
  updateCartItems // Added this import
} from '../Redux/cartSlice';
import { 
  addCartItemToServer, 
  removeCartItemFromServer,
  syncCartWithServer
} from './cartApi';

export const useCart = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, userToken } = useSelector(state => state.user);
  const cartItems = useSelector(state => state.cart.items);
  const lastAdded = useSelector(state => state.cart.lastAdded);

  const handleAddToCart = async (item) => {
    console.log("add")
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      dispatch(addToCart(item)); // Triggers duplicate message
      return;
    }

    // Optimistically add to local cart
    const tempId = `temp-${Date.now()}`;
    dispatch(addToCart({ ...item, tempId }));
    
    if (isLoggedIn) {
      try {
        const result = await dispatch(
          addCartItemToServer({ item, userToken })
        ).unwrap();
        
        // Replace temp ID with server ID if successful
        if (result.id && result.tempId) {
          dispatch(updateCartItems(
            cartItems.map(item => 
              item.tempId === result.tempId ? { ...item, id: result.id } : item
            )
          ));
        }
      } catch (error) {
        console.error('Failed to add item to server cart:', error);
        // Remove the item if server sync fails
        dispatch(removeFromCart(tempId));
        throw error; // Re-throw to allow component to handle
      }
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    // Optimistically remove from local cart
    dispatch(removeFromCart(itemId));
    
    if (isLoggedIn) {
      try {
        await dispatch(removeCartItemFromServer({ itemId, userToken })).unwrap();
      } catch (error) {
        console.error('Failed to remove item from server cart:', error);
        // Re-add the item if server removal fails
        const item = cartItems.find(i => i.id === itemId);
        if (item) {
          dispatch(addToCart(item));
        }
        throw error;
      }
    }
  };

  const handleClearCart = async () => {
    const itemsToClear = [...cartItems];
    dispatch(clearCart());
    
    if (isLoggedIn) {
      try {
        // You might want to implement a clear cart API endpoint
        await Promise.all(
          itemsToClear.map(item => 
            dispatch(removeCartItemFromServer({ itemId: item.id, userToken }))
        ));
      } catch (error) {
        console.error('Failed to clear server cart:', error);
        // Restore items if server clear fails
        itemsToClear.forEach(item => dispatch(addToCart(item)));
        throw error;
      }
    }
  };

  const syncCart = async () => {
    if (isLoggedIn) {
      try {
        await dispatch(syncCartWithServer({ items: cartItems, userToken })).unwrap();
      } catch (error) {
        console.error('Failed to sync cart with server:', error);
        throw error;
      }
    }
  };

  const resetLastAddedNotification = () => {
    dispatch(resetLastAdded());
  };

  return {
    cartItems,
    lastAdded,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    clearCart: handleClearCart,
    syncCart,
    resetLastAddedNotification
  };
};