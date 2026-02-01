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
        <p className="text-lg font-medium mb-2">Editor is empty</p>
        <p className="text-sm text-center opacity-70">Select a note from the left or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--panel-bg)' }}>
      {/* Title Input */}
      <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--panel-border)' }}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Title..."
          className="w-full text-3xl font-bold bg-transparent focus:outline-none"
          style={{ color: 'var(--text-main)' }}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex flex-col note-editor-container relative">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          className="flex-1 flex flex-col h-full"
          ref={quillRef}
          placeholder="Write your note here..."
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2 border-t text-xs flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--panel-border)', backgroundColor: 'var(--frame-bg)', color: 'var(--text-muted)' }}>
        <span>
          {note.updatedAt ? `Last updated: ${new Date(note.updatedAt).toLocaleString('en-US')}` : ''}
        </span>
        <span className={saveTimeoutRef.current ? "text-yellow-500" : "text-green-500"}>
          {saveTimeoutRef.current ? "Saving..." : "Saved"}
        </span>
      </div>
    </div>
  );
};

export default NoteEditor;
