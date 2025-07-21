import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import userReducer from './userSlice';
import { cartMiddleware } from '../pages/cartMiddleware';
import cartReducer from './cartSlice';
const persistConfig = {
  key: 'rootmedospa',
  storage: AsyncStorage,
 whitelist: ['user', 'cart'],
};

const rootReducer = combineReducers({
  user: userReducer,
  cart:cartReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false 
    }).concat(cartMiddleware)
});

export const persistor = persistStore(store);
