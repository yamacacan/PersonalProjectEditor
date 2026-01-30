import React, { useState, useEffect, useRef } from 'react';
import DatePicker from './DatePicker';
import ImageViewer from './ImageViewer';
import { saveImage, loadImage, deleteImage } from '../utils/storage';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Düşük', color: 'bg-slate-500' },
  { value: 'medium', label: 'Orta', color: 'bg-amber-500' },
  { value: 'high', label: 'Yüksek', color: 'bg-red-500' },
];

const TAG_COLORS = [
  { value: '#3b82f6', label: 'Mavi' },
  { value: '#22c55e', label: 'Yeşil' },
  { value: '#a855f7', label: 'Mor' },
  { value: '#f97316', label: 'Turuncu' },
  { value: '#14b8a6', label: 'Turkuaz' },
  { value: '#ef4444', label: 'Kırmızı' },
  { value: '#eab308', label: 'Sarı' },
  { value: '#64748b', label: 'Gri' },
];

const CardDetailModal = ({ card, isOpen, onClose, onSave, onDelete }) => {
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
  const [newTodo, setNewTodo] = useState('');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
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

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.some(t => t.text === newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, { text: newTag.trim(), color: newTagColor }]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const handleDelete = () => {
    if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
      onDelete(card.id);
      onClose();
    }
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
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Kart Detayları</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Kapak Resmi</label>
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
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Değiştir
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-600 hover:border-primary-500 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary-400 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Resim Yükle</span>
                <span className="text-xs text-slate-500">PNG, JPG, GIF (max 5MB)</span>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Kart ID</label>
              <input
                type="text"
                value={formData.cardId}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                placeholder="TASK-123"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Başlık *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Kart başlığı"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detaylı açıklama yazın..."
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Etiketler</label>
            
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
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Yeni etiket"
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
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
                onClick={handleAddTag}
                className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Assignee & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Atanan Kişi</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="İsim"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Öncelik</label>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className={`flex-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      formData.priority === option.value
                        ? `${option.color} text-white`
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date - Full Width at Bottom */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bitiş Tarihi</label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => setFormData({ ...formData, dueDate: date })}
              placeholder="Tarih seçin"
            />
          </div>

          {/* Todo List */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Yapılacaklar</label>
            
            {/* Existing Todos */}
            {formData.todos.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        todo.completed
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-slate-500 hover:border-primary-500'
                      }`}
                    >
                      {todo.completed && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm transition-all ${
                        todo.completed
                          ? 'text-slate-500 line-through'
                          : 'text-slate-200'
                      }`}
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
                placeholder="Yeni görev ekle..."
                className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 transition-colors"
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
                className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ekle
              </button>
            </div>

            {/* Progress Bar */}
            {formData.todos.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>İlerleme</span>
                  <span>
                    {formData.todos.filter((t) => t.completed).length} / {formData.todos.length}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                    style={{
                      width: `${
                        (formData.todos.filter((t) => t.completed).length / formData.todos.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Sil
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
            >
              Kaydet
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
    </div>
  );
};

export default CardDetailModal;
