import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    userToken: null,
     location: {
      coords: null,     
      address: null,      
      lastUpdated: null   
    }
  },
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.userToken = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userToken = null;
    }, updateLocation(state, action) {
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
    }
  }
});

export const { login, logout ,updateLocation, clearLocation} = userSlice.actions;
export default userSlice.reducer;
