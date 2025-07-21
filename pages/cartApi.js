import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://your-api-endpoint.com/api';

export const syncCartWithServer = createAsyncThunk(
  'cart/syncCart',
  async ({ items, userToken }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ items })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync cart with server');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCartItemToServer = createAsyncThunk(
  'cart/addItemToServer',
  async ({ item, userToken }, { rejectWithValue, getState }) => {
    try {
     
      const tempId = `temp-${Date.now()}`;
      const itemWithTempId = { ...item, tempId };
      
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to server cart');
      }
      
      const responseData = await response.json();
      return { ...responseData, tempId };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        tempId: item.tempId
      });
    }
  }
);

export const removeCartItemFromServer = createAsyncThunk(
  'cart/removeItemFromServer',
  async ({ itemId, userToken }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from server cart');
      }
      
      return { itemId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);