import { createSlice } from '@reduxjs/toolkit';

// Get user from localStorage
const userInfo = localStorage.getItem('userInfo');
const user = userInfo ? JSON.parse(userInfo) : null;

const initialState = {
  user: user,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      console.log('Redux logout action dispatched. Clearing user state.');
      state.user = null;
    },
  },
});

export const { login, logout } = userSlice.actions;

export const selectUser = (state) => state.user.user;

export default userSlice.reducer;