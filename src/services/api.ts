import axios from 'axios';
import type { AsyncThunk } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '../app/store';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setupInterceptors = (
  store: { getState: () => RootState; dispatch: AppDispatch },
  { logout, refreshTokenFulfilled }: {
    logout: AsyncThunk<void, void, { state: RootState }>;
    refreshTokenFulfilled: AsyncThunk<{ accessToken: string }, { accessToken: string }, { state: RootState }>;
  }
) => {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      throw error;
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = response.data.data?.accessToken || response.data.accessToken;

          if (!newAccessToken) {
              throw new Error('Failed to refresh token');
          }

          // Update the store with the new token
          store.dispatch(refreshTokenFulfilled({ accessToken: newAccessToken }));

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());
          throw refreshError;
        }
      }
      throw error;
    }
  );
};

export default api;
