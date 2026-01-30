import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NoteEditor = ({ note, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const saveTimeoutRef = useRef(null);
  const quillRef = useRef(null);

  // Track if we are currently editing to avoid loop updates
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [note?.id]); // Only reset when note ID changes

  const debouncedSave = useCallback((updates) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(updates);
    }, 1000); // 1 second debounce
  }, [onUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    isEditingRef.current = true;
    debouncedSave({ title: newTitle });
  };

  const handleContentChange = (value, delta, source, editor) => {
    // Only save if the change came from 'user'
    if (source === 'user') {
      setContent(value);
      isEditingRef.current = true;
      debouncedSave({ content: value });
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'clean']
    ],
  };

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 bg-slate-800/20">
        <svg className="w-20 h-20 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <p className="text-lg font-medium mb-2">Editor Boş</p>
        <p className="text-sm text-center opacity-70">Düzenlemek için sol taraftan bir not seçin veya yeni oluşturun.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/30">
      {/* Title Input */}
      <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Başlık..."
          className="w-full text-3xl font-bold bg-transparent text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex flex-col note-editor-container relative">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          className="flex-1 flex flex-col h-full text-slate-200"
          ref={quillRef}
          placeholder="Notunuzu buraya yazın..."
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2 border-t border-slate-700/50 text-xs text-slate-500 flex items-center justify-between flex-shrink-0 bg-slate-900/30">
        <span>
          {note.updatedAt ? `Son güncelleme: ${new Date(note.updatedAt).toLocaleString('tr-TR')}` : ''}
        </span>
        <span className={saveTimeoutRef.current ? "text-yellow-500" : "text-green-500"}>
          {saveTimeoutRef.current ? "Kaydediliyor..." : "Kaydedildi"}
        </span>
      </div>
    </div>
  );
};

export default NoteEditor;
