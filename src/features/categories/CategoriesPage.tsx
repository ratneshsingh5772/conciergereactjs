import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, AlertCircle, LayoutGrid, List as ListIcon, X } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, clearError } from './categoriesSlice';
import CategoryModal from './CategoryModal';
import type { Category, CreateCategoryRequest } from './types';

const CategoryIcon = ({ icon, color = '#3b82f6', className }: { icon?: string, color?: string, className: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--category-bg', `${color}15`);
      ref.current.style.setProperty('--category-color', color);
    }
  }, [color]);

  return (
    <div 
      ref={ref}
      className={`flex items-center justify-center bg-(--category-bg) text-(--category-color) ${className}`}
    >
      {icon || '🏷️'}
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, operationLoading } = useAppSelector((state) => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (globalThis.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      await dispatch(deleteCategory(id));
    }
  };

  const handleSubmit = async (data: CreateCategoryRequest) => {
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, data })).unwrap();
      } else {
        await dispatch(createCategory(data)).unwrap();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Link to="/dashboard" className="p-2 bg-white hover:bg-slate-100 rounded-full shadow-sm border border-slate-200 transition-all">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
             </Link>
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                <p className="text-slate-500 text-sm">Manage expense categories</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                   onClick={() => setViewMode('list')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                   aria-label="List view"
                >
                  <ListIcon className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => dispatch(clearError())} className="ml-auto text-red-400 hover:text-red-700" aria-label="Dismiss error">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((category) => (
              <div 
                key={category.id} 
                className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-white/0 to-slate-50 opacity-50 rounded-bl-full pointer-events-none"
                ></div>
                
                <div className="flex justify-between items-start mb-4">
                  <CategoryIcon 
                    icon={category.icon} 
                    color={category.color}
                    className="w-12 h-12 rounded-xl text-2xl shadow-sm transition-transform group-hover:scale-110"
                  />
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!category.isSystem && (
                      <>
                        <button 
                          onClick={() => handleOpenEdit(category)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {category.isSystem && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        System
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg mb-1 truncate" title={category.name}>
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 min-h-10">
                  {category.description || 'No description provided'}
                </p>
              </div>
            ))}
            
            {/* Empty State Add Button */}
            {items.length === 0 && (
              <button 
                onClick={handleOpenCreate}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group min-h-50"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <p className="font-medium text-slate-500 group-hover:text-indigo-600">Create your first category</p>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Icon</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                         <CategoryIcon
                            icon={category.icon}
                            color={category.color}
                            className="w-10 h-10 rounded-lg text-xl"
                          />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {category.isSystem ? (
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                              Default
                            </span>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleOpenEdit(category)}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(category.id)}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                     <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                           No categories found. <button onClick={handleOpenCreate} className="text-indigo-600 hover:underline font-medium">Create one</button>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <CategoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            initialData={editingCategory}
            isLoading={operationLoading}
          />
        )}
      </div>
    </div>
  );
};


export default CategoriesPage;
