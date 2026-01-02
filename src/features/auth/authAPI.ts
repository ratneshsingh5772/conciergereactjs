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
