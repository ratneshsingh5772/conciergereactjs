import api from '../../services/api';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from './types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  return response.data.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const updateCurrency = async (userId: string, currencyCode: string): Promise<User> => {
  // In a real app, this would be an API call
  // const response = await api.put<ApiResponse<User>>(`/users/${userId}/currency`, { currencyCode });
  // return response.data.data;

  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { id: userId, email: '', username: '', firstName: '', lastName: '' };
        const updatedUser = { ...user, currencyCode };
        // Update local storage to simulate backend persistence
        localStorage.setItem('user', JSON.stringify(updatedUser));
        resolve(updatedUser);
    }, 500);
  });
};
