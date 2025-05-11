import { IClientUser } from '@interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: IClientUser | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<Partial<AuthState>>) {
      state.error = action.payload.error || null;
      state.isAuthenticated = action.payload.isAuthenticated || false;
      state.user = action.payload.user || null;
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const { clearError, setAuthState } = authSlice.actions;
export default authSlice.reducer;
