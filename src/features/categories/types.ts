export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

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
