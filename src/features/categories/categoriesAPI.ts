import api from '../../services/api';
import type { CreateCategoryRequest, CategoryResponse, CategoryListResponse } from './types';

export const getCategories = async (): Promise<CategoryListResponse> => {
  const response = await api.get<CategoryListResponse>('/categories');
  return response.data;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const response = await api.post<CategoryResponse>('/categories', data);
  return response.data;
};

export const updateCategory = async (id: number, data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const response = await api.put<CategoryResponse>(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/categories/${id}`);
  return response.data;
};
