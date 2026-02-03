import React, { useState, useRef, useEffect } from 'react';

const AddColumnModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--panel-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Add New Column</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Column Name</label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., In Progress"
              className="w-full px-4 py-3 border rounded-xl placeholder-slate-400 focus:outline-none transition-colors"
              style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 text-white rounded-xl font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent-500)' }}
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnModal;
