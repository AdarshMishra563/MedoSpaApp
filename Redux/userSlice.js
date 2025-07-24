import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    userToken: null,
    userInfo: {
      name: null,
      phoneNumber: null,
      email: null,
      picture: null
    },
    location: {
      coords: null,
      address: null,
      lastUpdated: null
    },
  },
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.userToken = action.payload.token;
      if (action.payload.userInfo) {
        state.userInfo = {
          ...state.userInfo,
          ...action.payload.userInfo
        };
      }
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userToken = null;
      state.userInfo = {
        name: null,
        phoneNumber: null,
        email: null,
        picture: null
      };
    },
    updateLocation(state, action) {
      state.location = {
        coords: action.payload.coords,
        address: action.payload.address,
        lastUpdated: Date.now()
      };
    },
    clearLocation(state) {
      state.location = {
        coords: null,
        address: null,
        lastUpdated: null
      };
    },
    updateUserInfo(state, action) {
      state.userInfo = {
        ...state.userInfo,
        ...action.payload
      };
    },
    clearUserInfo(state) {
      state.userInfo = {
        name: null,
        phoneNumber: null,
        email: null,
        picture: null
      };
    },
  }
});

export const { login, logout ,updateLocation, clearLocation,updateUserInfo,clearUserInfo} = userSlice.actions;
export default userSlice.reducer;
