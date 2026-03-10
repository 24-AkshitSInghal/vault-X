import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  loginId: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  loginId: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ loginId: string }>) => {
      state.loginId = action.payload.loginId;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.loginId = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
