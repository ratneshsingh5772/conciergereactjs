import api from '../../services/api';
import type { CreateCategoryRequest, CategoryResponse, CategoryListResponse } from './types';

export const getCategories = async (userId: string): Promise<CategoryListResponse> => {
  const response = await api.get<CategoryListResponse>(`/users/${userId}/categories`);
  return response.data;
};

export const createCategory = async (userId: string, data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const response = await api.post<CategoryResponse>(`/users/${userId}/categories`, data);
  return response.data;
};

export const updateCategory = async (userId: string, id: number, data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const response = await api.put<CategoryResponse>(`/users/${userId}/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (userId: string, id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/users/${userId}/categories/${id}`);
  return response.data;
};
