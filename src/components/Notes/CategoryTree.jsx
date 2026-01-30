import React, { useState } from 'react';
import AddCategoryModal from './AddCategoryModal';

const CategoryItem = ({ category, level = 0, selectedId, onSelect, onAdd, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const hasChildren = category.children && Array.isArray(category.children) && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleAddSubCategory = (newCategory) => {
    onAdd(category.id, newCategory);
  };

  const handleDelete = () => {
    if (window.confirm(`"${category.name}" kategorisini ve tüm alt kategorilerini silmek istediğinize emin misiniz?`)) {
      onDelete(category.id);
    }
  };

  return (
    <div>
      <div
        className={`
          group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
          ${isSelected ? 'bg-primary-500/20 text-primary-400' : 'text-slate-300 hover:bg-slate-700/30'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(category.id)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-slate-600/50 rounded transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Icon */}
        <span className="text-lg flex-shrink-0">{category.icon}</span>

        {/* Name */}
        <span className="flex-1 text-sm font-medium truncate">{category.name}</span>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddModal(true);
              }}
              className="p-1 hover:bg-slate-600/50 rounded transition-colors"
              title="Alt kategori ekle"
            >

              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {level > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                title="Kategoriyi sil"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubCategory}
        parentName={category.name}
      />
    </div>
  );
};

const CategoryTree = ({ categories, selectedId, onSelect, onAdd, onDelete }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddRootCategory = (newCategory) => {
    onAdd(null, newCategory);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-2">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            selectedId={selectedId}
            onSelect={onSelect}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Add Root Category Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="mx-3 mb-3 w-[calc(100%-24px)] flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-dashed border-slate-600/50 hover:border-slate-500 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm font-medium">Kategori Ekle</span>
      </button>

      {/* Add Root Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRootCategory}
      />
    </div>
  );
};

export default CategoryTree;

