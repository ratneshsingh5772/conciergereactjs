export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isSystem?: boolean; // Distinguish system vs user categories
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: Category[];
}
