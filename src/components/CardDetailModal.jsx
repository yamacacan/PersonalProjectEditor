import React, { useState, useEffect, useRef } from 'react';
import DatePicker from './DatePicker';
import ImageViewer from './ImageViewer';
import DeleteAlertModal from './DeleteAlertModal';
import { saveImage, loadImage, deleteImage } from '../utils/storage';


const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

const TAG_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
];

const CardDetailModal = ({ card, isOpen, onClose, onSave, onDelete, availableTags = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    cardId: '',
    image: null,
    todos: [],
  });

  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        tags: card.tags || [],
        assignedTo: card.assignedTo || '',
        priority: card.priority || 'medium',
        dueDate: card.dueDate || '',
        cardId: card.cardId || card.id || '',
        image: card.image || null,
        todos: card.todos || [],
      });
      setImageChanged(false);

      // Eğer resim varsa, yükle
      if (card.image) {
        loadImage(card.image).then(base64 => {
          setImagePreview(base64);
        });
      } else {
        setImagePreview(null);
      }
    }
  }, [card]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (formData.title.trim()) {
      const dataToSave = { ...formData };

      // Eğer resim değiştiyse, kaydet
      if (imageChanged && imagePreview) {
        // Unique filename oluştur
        const timestamp = Date.now();
        const ext = imagePreview.match(/data:image\/(\w+);/)?.[1] || 'png';
        const filename = `card-${card.id}-${timestamp}.${ext}`;

        // Eski resmi sil
        if (card.image) {
          await deleteImage(card.image);
        }

        // Yeni resmi kaydet
        const savedFilename = await saveImage(imagePreview, filename);
        dataToSave.image = savedFilename;
      } else if (!imagePreview && card.image) {
        // Resim kaldırıldıysa
        await deleteImage(card.image);
        dataToSave.image = null;
      }

      onSave(card.id, dataToSave);
      onClose();
    }
  };

  const handleAddTag = (tagToAdd = null) => {
    const text = tagToAdd ? tagToAdd.text : newTag.trim();
    const color = tagToAdd ? tagToAdd.color : newTagColor;

    if (text && !formData.tags.some(t => t.text === text)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, { text, color }]
      });
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const handleDelete = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Card',
      message: 'Are you sure you want to delete this card?',
      onConfirm: () => {
        onDelete(card.id);
        onClose();
        setDeleteModal({ isOpen: false });
      }
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setFormData({
        ...formData,
        todos: [
          ...formData.todos,
          {
            id: Date.now().toString(),
            text: newTodo.trim(),
            completed: false,
          },
        ],
      });
      setNewTodo('');
    }
  };

  const handleToggleTodo = (todoId) => {
    setFormData({
      ...formData,
      todos: formData.todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  };

  const handleRemoveTodo = (todoId) => {
    setFormData({
      ...formData,
      todos: formData.todos.filter((todo) => todo.id !== todoId),
    });
  };

  return (
    <div
      className="themed-modal-overlay animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-2xl themed-modal rounded-2xl shadow-2xl border overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--panel-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Card Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Cover Image</label>
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Card cover"
                  className="w-full h-48 object-cover rounded-xl border border-slate-600 cursor-pointer"
                  onClick={() => setIsImageViewerOpen(true)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsImageViewerOpen(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--accent-500)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-600)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-500)'}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Upload Image</span>
                <span className="text-xs opacity-60">PNG, JPG, GIF (max 5MB)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Card ID & Title Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Card ID</label>
              <input
                type="text"
                value={formData.cardId}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                placeholder="TASK-123"
                className="w-full px-4 py-2.5 border rounded-xl placeholder-slate-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Card title"
                className="w-full px-4 py-2.5 border rounded-xl placeholder-slate-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Write detailed description..."
              rows="3"
              className="w-full px-4 py-2.5 border rounded-xl placeholder-slate-400 resize-none focus:outline-none transition-colors"
              style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Tags</label>

            {/* Existing Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.text}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Tag */}
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="New tag..."
                  className="w-full px-4 py-2 border rounded-lg placeholder-slate-400 text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                    {availableTags
                      .filter(tag =>
                        tag.text.toLowerCase().includes(newTag.toLowerCase()) &&
                        !formData.tags.some(t => t.text === tag.text)
                      )
                      .map((tag, i) => (
                        <button
                          key={`${tag.text}-${i}`}
                          onClick={() => handleAddTag(tag)}
                          className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{tag.text}</span>
                        </button>
                      ))}
                    {newTag && !availableTags.some(t => t.text.toLowerCase() === newTag.toLowerCase()) && (
                      <div className="px-3 py-2 text-xs opacity-50 italic">
                        Press Enter to create new "{newTag}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-1 items-center">
                {TAG_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-6 h-6 rounded-full transition-transform ${newTagColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--accent-500)' }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Assignee & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Assignee</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-2.5 border rounded-xl placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
                style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Priority</label>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className={`flex-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${formData.priority === option.value
                      ? `${option.color} text-white`
                      : 'hover:text-white'
                      }`}
                    style={{
                      backgroundColor: formData.priority === option.value ? undefined : 'var(--frame-bg)',
                      color: formData.priority === option.value ? undefined : 'var(--text-muted)'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date - Full Width at Bottom */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Due Date</label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => setFormData({ ...formData, dueDate: date })}
              placeholder="Select date"
            />
          </div>

          {/* Todo List */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Todos</label>

            {/* Existing Todos */}
            {formData.todos.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border transition-colors group"
                    style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${todo.completed
                        ? 'border-transparent'
                        : 'border-transparent'
                        }`}
                      style={{
                        backgroundColor: todo.completed ? 'var(--accent-500)' : 'transparent',
                        borderColor: todo.completed ? 'var(--accent-500)' : 'var(--panel-border)'
                      }}
                    >
                      {todo.completed && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span
                      className="flex-1 text-sm transition-all"
                      style={{
                        color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                        textDecoration: todo.completed ? 'line-through' : 'none'
                      }}
                    >
                      {todo.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTodo(todo.id)}
                      className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Todo */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new task..."
                className="flex-1 px-4 py-2.5 border rounded-xl placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTodo();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTodo}
                className="px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                style={{ backgroundColor: 'var(--accent-500)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>

            {/* Progress Bar */}
            {formData.todos.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>Progress</span>
                  <span>
                    {formData.todos.filter((t) => t.completed).length} / {formData.todos.length}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--frame-bg)' }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--accent-500)',
                      width: `${(formData.todos.filter((t) => t.completed).length / formData.todos.length) * 100
                        }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--panel-border)', backgroundColor: 'var(--frame-bg)' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-white rounded-xl font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent-500)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-600)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-500)'}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        image={imagePreview}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />

      {/* Delete Modal */}
      <DeleteAlertModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
      />
    </div >
  );
};

export default CardDetailModal;
