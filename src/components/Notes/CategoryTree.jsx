import React, { useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import DeleteAlertModal from '../DeleteAlertModal';

const CategoryItem = ({ category, level = 0, selectedId, onSelect, onAdd, onDelete, onDeleteRequest }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const hasChildren = category.children && Array.isArray(category.children) && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleAddSubCategory = (newCategory) => {
    onAdd(category.id, newCategory);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteRequest(category);
  };

  return (
    <div>
      <div
        className={`
          group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
          ${isSelected ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/5'}
        `}
        style={{
          paddingLeft: `${level * 16 + 12}px`,
          color: isSelected ? 'var(--accent-500)' : 'var(--text-main)'
        }}
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
            className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
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
              className="p-1 hover:bg-white/10 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Add subcategory"
            >

              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {level >= 0 && (
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                title="Delete category"
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
              onDeleteRequest={onDeleteRequest}
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
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null
  });

  const handleAddRootCategory = (newCategory) => {
    onAdd(null, newCategory);
  };

  const handleDeleteRequest = (category) => {
    setDeleteModal({
      isOpen: true,
      category
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.category) {
      onDelete(deleteModal.category.id);
    }
    setDeleteModal({ isOpen: false, category: null });
  };

  return (
    <>
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
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </div>

        {/* Add Root Category Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="mx-3 mb-3 w-[calc(100%-24px)] flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed transition-all duration-200"
          style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Add Category</span>
        </button>

        {/* Add Root Category Modal */}
        <AddCategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRootCategory}
        />
      </div>

      {/* Delete Category Modal */}
      <DeleteAlertModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={deleteModal.category
          ? `Are you sure you want to delete the category "${deleteModal.category.name}" and all its subcategories?`
          : ''
        }
      />
    </>
  );
};

export default CategoryTree;
