import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { User, LoginCredentials, RegisterData, AuthResponse } from './types';
import * as authAPI from './authAPI';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Load initial state from storage (Local or Session)
const getStoredToken = (key: string) => localStorage.getItem(key) || sessionStorage.getItem(key);
const getStoredUser = () => {
  const storedUser = getStoredToken('user');
  if (!storedUser || storedUser === 'undefined') return null;
  try {
    return JSON.parse(storedUser);
  } catch (e) {
    console.error('Failed to parse user from storage', e);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    return null;
  }
};

const storedAccessToken = getStoredToken('accessToken');
const storedRefreshToken = getStoredToken('refreshToken');

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: !!storedAccessToken,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { credentials: LoginCredentials; rememberMe: boolean }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(payload.credentials);
      return { ...response, rememberMe: payload.rememberMe };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      return response;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors
    }
    // Clear all storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  }
);

// This thunk is mainly for the interceptor to dispatch to update the store
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (payload: { accessToken: string }) => {
    return payload;
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getProfile();
      return user;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserCurrency = createAsyncThunk(
  'auth/updateCurrency',
  async ({ userId, currencyCode }: { userId: string; currencyCode: string }, { rejectWithValue }) => {
    try {
      const user = await authAPI.updateCurrency(userId, currencyCode);
      return user;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || 'Failed to update currency');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse & { rememberMe: boolean }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        
        const storage = action.payload.rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', action.payload.accessToken);
        storage.setItem('refreshToken', action.payload.refreshToken);
        storage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        
        // Default to localStorage for registration
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        if (localStorage.getItem('refreshToken')) {
            localStorage.setItem('accessToken', action.payload.accessToken);
        } else {
            sessionStorage.setItem('accessToken', action.payload.accessToken);
        }
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        if (localStorage.getItem('user')) {
             localStorage.setItem('user', JSON.stringify(action.payload));
        } else {
             sessionStorage.setItem('user', JSON.stringify(action.payload));
        }
      })
      // Update Currency
      .addCase(updateUserCurrency.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserCurrency.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
            state.user.currencyCode = action.payload.currencyCode;
            // Update storage
            const newVal = JSON.stringify(state.user);
            if (localStorage.getItem('user')) {
                localStorage.setItem('user', newVal);
            } else {
                sessionStorage.setItem('user', newVal);
            }
        }
      })
      .addCase(updateUserCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
