import { createSlice } from '@reduxjs/toolkit';
import { syncCartWithServer, addCartItemToServer } from '../pages/cartApi';
import { act } from 'react';

const initialState = {
  items: [],
  status: 'idle', 
  error: null,
  lastAdded: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
        console.log(action)
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        state.lastAdded = { ...action.payload, isDuplicate: true };
      } else {
        state.items.push(action.payload);
        state.lastAdded = { ...action.payload, isDuplicate: false };
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.lastAdded = null;
    },
    resetLastAdded: (state) => {
      state.lastAdded = null;
    },
    syncCartWithUser: (state, action) => {
      if (action.payload === 'logout') {
        state.items = [];
        state.lastAdded = null;
      } else if (action.payload === 'login' && action.cartItems) {
       
        state.items = action.cartItems;
      }
    },
    
    updateCartItems: (state, action) => {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(syncCartWithServer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
       
        state.items = action.payload.items || [];
        state.error = null;
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
   
      .addCase(addCartItemToServer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCartItemToServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.tempId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], id: updatedItem.id };
        }
        state.error = null;
      })
      .addCase(addCartItemToServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
       
        if (action.meta.arg?.item?.tempId) {
          state.items = state.items.filter(item => item.tempId !== action.meta.arg.item.tempId);
        }
      });
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  clearCart, 
  resetLastAdded,
  syncCartWithUser,
  updateCartItems
} = cartSlice.actions;

export default cartSlice.reducer;


export const selectCartItems = (state) => state.cart.items;
export const selectLastAdded = (state) => state.cart.lastAdded;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;