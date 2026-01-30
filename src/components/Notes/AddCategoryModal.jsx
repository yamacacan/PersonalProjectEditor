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
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            {parentName ? `"${parentName}" altına kategori ekle` : 'Yeni Kategori'}
          </h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İkon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`
                    w-10 h-10 text-2xl rounded-lg transition-all
                    ${icon === ic 
                      ? 'bg-primary-500 ring-2 ring-primary-400 ring-offset-2 ring-offset-slate-800 scale-110' 
                      : 'bg-slate-700/50 hover:bg-slate-700 hover:scale-105'
                    }
                  `}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Kategori Adı *</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kategori adını girin..."
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;

