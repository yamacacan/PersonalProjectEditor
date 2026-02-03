import React, { useState, useEffect, useRef } from 'react';

const AddCategoryModal = ({ isOpen, onClose, onAdd, parentName = null }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const inputRef = useRef(null);

  const icons = ['📁', '📂', '📝', '📄', '📋', '📊', '💡', '⭐', '🔥', '🎯', '📌', '🔖', '📚', '📖', '📗', '📘', '📙', '📕'];

  useEffect(() => {
    if (isOpen) {
      setName('');
      setIcon('📁');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        id: parentName ? `${parentName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` : `cat-${Date.now()}`,
        name: name.trim(),
        icon,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-slide-up"
        style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--panel-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            {parentName ? `Add category under "${parentName}"` : 'New Category'}
          </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`
                    w-10 h-10 text-2xl rounded-lg transition-all
                    ${icon === ic
                      ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-slate-800 scale-110'
                      : 'hover:bg-white/10 hover:scale-105'
                    }
                  `}
                  style={{
                    backgroundColor: icon === ic ? 'var(--accent-500)' : 'var(--frame-bg)'
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Category Name *</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name..."
              className="w-full px-4 py-2.5 border rounded-xl placeholder-slate-400 focus:outline-none transition-colors"
              style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              style={{ backgroundColor: name.trim() ? 'var(--accent-500)' : 'var(--panel-border)' }}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;

