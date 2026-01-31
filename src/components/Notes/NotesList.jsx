import React, { useState } from 'react';
import DeleteAlertModal from '../DeleteAlertModal';

const NotesList = ({ categoryId, notes, selectedNoteId, onSelect, onAdd, onDelete }) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    noteId: null,
    noteTitle: ''
  });

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-sm text-center">Bir kategori seçin</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getPreview = (content) => {
    if (!content) return 'Not boş...';
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  const handleDeleteClick = (e, note) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      noteId: note.id,
      noteTitle: note.title || 'Başlıksız'
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.noteId) {
      onDelete(deleteModal.noteId);
    }
    setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-white font-semibold">Notlar</h3>
          <button
            onClick={onAdd}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Yeni not"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-center mb-3">Bu kategoride henüz not yok</p>
              <button
                onClick={onAdd}
                className="text-sm text-primary-400 hover:text-primary-300 font-medium"
              >
                İlk notu oluştur
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelect(note.id)}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-all
                    ${selectedNoteId === note.id
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'bg-slate-800/30 border border-transparent hover:bg-slate-700/30 hover:border-slate-600/30'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`
                      text-sm font-semibold truncate flex-1
                      ${selectedNoteId === note.id ? 'text-primary-300' : 'text-white'}
                    `}>
                      {note.title || 'Başlıksız'}
                    </h4>
                    <button
                      onClick={(e) => handleDeleteClick(e, note)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      title="Notu sil"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {getPreview(note.content)}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteAlertModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Notu Sil"
        message={`"${deleteModal.noteTitle}" notunu silmek istediğinize emin misiniz?`}
      />
    </>
  );
};

export default NotesList;
