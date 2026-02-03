import React, { useState, useEffect, useRef, useCallback } from 'react';
import CategoryTree from './CategoryTree';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import DeleteAlertModal from '../DeleteAlertModal';
import { loadNotesData, saveNotesData } from '../../utils/storage';

// Icons and colors for file types
const FILE_TYPES = {
  pdf: { icon: '📄', color: 'text-red-400', bg: 'bg-red-500/20' },
  doc: { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  docx: { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  xls: { icon: '📊', color: 'text-green-400', bg: 'bg-green-500/20' },
  xlsx: { icon: '📊', color: 'text-green-400', bg: 'bg-green-500/20' },
  ppt: { icon: '📽️', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  pptx: { icon: '📽️', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  txt: { icon: '📃', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  zip: { icon: '🗜️', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  rar: { icon: '🗜️', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  png: { icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  jpg: { icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  jpeg: { icon: '🖼️', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  gif: { icon: '🖼️', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  svg: { icon: '🖼️', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  mp3: { icon: '🎵', color: 'text-teal-400', bg: 'bg-teal-500/20' },
  mp4: { icon: '🎬', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  default: { icon: '📁', color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_TYPES[ext] || FILE_TYPES.default;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const NotesApp = () => {
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState({});
  const [files, setFiles] = useState({}); // categoryId: [file1, file2...]
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'files'
  const [isDragging, setIsDragging] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadNotesData();
      if (data) {
        setCategories(data.categories || []);
        setNotes(data.notes || {});
        setFiles(data.files || {});
      } else {
        const defaultCategories = [
          {
            id: 'personal',
            name: 'Personal',
            icon: '👤',
            children: [
              { id: 'personal-diary', name: 'Diary', icon: '📔', children: [] },
              { id: 'personal-ideas', name: 'Ideas', icon: '💡', children: [] },
            ]
          },
          {
            id: 'work',
            name: 'Work',
            icon: '💼',
            children: [
              { id: 'work-projects', name: 'Projects', icon: '📊', children: [] },
              { id: 'work-meetings', name: 'Meetings', icon: '🤝', children: [] },
            ]
          },
        ];
        setCategories(defaultCategories);
        saveData({ categories: defaultCategories, notes: {}, files: {} });
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data) => {
    try {
      const dataToSave = {
        categories: data.categories || categories,
        notes: data.notes || notes,
        files: data.files || files,
      };
      await saveNotesData(dataToSave);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // File Handlers - Category-based
  const handleAddFiles = (categoryId, newFiles) => {
    const categoryFiles = files[categoryId] || [];
    const updatedFiles = {
      ...files,
      [categoryId]: [...categoryFiles, ...newFiles]
    };
    setFiles(updatedFiles);
    saveData({ files: updatedFiles });
  };

  const handleDeleteFile = (categoryId, fileId) => {
    const updatedFiles = {
      ...files,
      [categoryId]: (files[categoryId] || []).filter(f => f.id !== fileId)
    };
    setFiles(updatedFiles);
    saveData({ files: updatedFiles });
    if (selectedFileId === fileId) {
      setSelectedFileId(null);
    }
  };

  const handleOpenFile = async (file) => {
    if (!file.base64) return;

    // Determine file type
    const ext = file.name.split('.').pop().toLowerCase();
    const isImage = file.type && file.type.startsWith('image/');
    const isPdf = ext === 'pdf' || file.type === 'application/pdf';
    const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);

    // Open images in browser
    if (isImage) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1e293b; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${file.base64}" alt="${file.name}" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
      return;
    }

    // PDF viewer
    if (isPdf) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body, html { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                
                .container { display: flex; flex-direction: column; height: 100%; background: #1e293b; }
                
                .toolbar {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 12px 20px;
                  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                  border-bottom: 1px solid #334155;
                  flex-shrink: 0;
                }
                
                .toolbar-left {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                
                .pdf-icon {
                  width: 36px;
                  height: 36px;
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 18px;
                  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                
                .file-info h1 {
                  font-size: 16px;
                  font-weight: 600;
                  color: #f1f5f9;
                  margin-bottom: 2px;
                }
                
                .file-info p {
                  font-size: 12px;
                  color: #94a3b8;
                }
                
                .toolbar-actions {
                  display: flex;
                  gap: 8px;
                }
                
                .btn {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  padding: 8px 16px;
                  border: none;
                  border-radius: 8px;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                
                .btn-secondary {
                  background: #334155;
                  color: #e2e8f0;
                }
                
                .btn-secondary:hover {
                  background: #475569;
                }
                
                .btn-primary {
                  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                  color: white;
                  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                
                .btn-primary:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
                }
                
                .pdf-viewer {
                  flex: 1;
                  background: #0f172a;
                }
                
                .pdf-viewer iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                }
                
                .pdf-viewer embed {
                  width: 100%;
                  height: 100%;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="toolbar">
                  <div class="toolbar-left">
                    <div class="pdf-icon">📄</div>
                    <div class="file-info">
                      <h1>${file.name}</h1>
                      <p>PDF Document</p>
                    </div>
                  </div>
                  <div class="toolbar-actions">
                    <a href="${file.base64}" download="${file.name}" class="btn btn-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </a>
                    <button onclick="window.print()" class="btn btn-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 6 2 18 2 18 9"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
                <div class="pdf-viewer">
                  <embed src="${file.base64}" type="application/pdf" />
                </div>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
      return;
    }

    // Open office files and others with system app
    if (isOfficeDoc || true) {
      try {
        const { openFileWithSystemApp } = await import('../../utils/storage');
        await openFileWithSystemApp(file.base64, file.name);
      } catch (error) {
        console.error('Error opening file:', error);
        // Fallback: Download
        const link = document.createElement('a');
        link.href = file.base64;
        link.download = file.name;
        link.click();
      }
    }
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedCategoryId) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [selectedCategoryId, files]);

  const handleFileSelect = (e) => {
    if (!selectedCategoryId) return;
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = async (fileList) => {
    const processedFiles = await Promise.all(
      fileList.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64,
          createdAt: new Date().toISOString(),
        };
      })
    );
    handleAddFiles(selectedCategoryId, processedFiles);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const isImageFile = (file) => {
    return file.type && file.type.startsWith('image/');
  };

  const getSelectedFile = () => {
    if (!selectedCategoryId || !selectedFileId) return null;
    const categoryFiles = files[selectedCategoryId] || [];
    return categoryFiles.find(f => f.id === selectedFileId);
  };

  // Category Handlers
  const handleAddCategory = (parentId, newCategory) => {
    const addToTree = (items) => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), { ...newCategory, children: [] }]
          };
        }
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          return {
            ...item,
            children: addToTree(item.children)
          };
        }
        return item;
      });
    };

    const newCategories = parentId
      ? addToTree(categories)
      : [...categories, { ...newCategory, children: [] }];

    setCategories(newCategories);
    saveData({ categories: newCategories });
  };

  const handleDeleteCategory = (categoryId) => {
    const deleteFromTree = (items) => {
      return items.filter(item => item.id !== categoryId).map(item => ({
        ...item,
        children: deleteFromTree(item.children)
      }));
    };

    const newCategories = deleteFromTree(categories);
    setCategories(newCategories);

    const newNotes = { ...notes };
    delete newNotes[categoryId];
    setNotes(newNotes);

    const newFiles = { ...files };
    delete newFiles[categoryId];
    setFiles(newFiles);

    saveData({ categories: newCategories, notes: newNotes, files: newFiles });

    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setSelectedNoteId(null);
      setSelectedFileId(null);
    }
  };

  // Note Handlers
  const handleAddNote = (categoryId) => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const categoryNotes = notes[categoryId] || [];
    const newNotes = {
      ...notes,
      [categoryId]: [...categoryNotes, newNote]
    };

    setNotes(newNotes);
    setSelectedNoteId(newNote.id);
    saveData({ notes: newNotes });
  };

  const handleUpdateNote = (categoryId, noteId, updates) => {
    const newNotes = {
      ...notes,
      [categoryId]: notes[categoryId].map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    };

    setNotes(newNotes);
    saveData({ notes: newNotes });
  };

  const handleDeleteNote = (categoryId, noteId) => {
    const newNotes = {
      ...notes,
      [categoryId]: notes[categoryId].filter(note => note.id !== noteId)
    };

    setNotes(newNotes);
    saveData({ notes: newNotes });

    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const getSelectedNote = () => {
    if (!selectedCategoryId || !selectedNoteId) return null;
    const categoryNotes = notes[selectedCategoryId] || [];
    return categoryNotes.find(note => note.id === selectedNoteId);
  };

  // Clear selection when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'notes') {
      setSelectedFileId(null);
    } else {
      setSelectedNoteId(null);
    }
  };

  const getCategoryFiles = () => {
    return files[selectedCategoryId] || [];
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Categories */}
      <div className="w-64 border-r flex flex-col" style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--frame-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--frame-border)' }}>
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Categories
          </h2>
        </div>
        <CategoryTree
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={(id) => {
            setSelectedCategoryId(id);
            setSelectedNoteId(null);
            setSelectedFileId(null);
          }}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
        />
      </div>

      {/* Middle Panel - Notes/Files List (with Tab) */}
      <div className="w-80 border-r flex flex-col" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--frame-border)' }}>
        {selectedCategoryId ? (
          <>
            {/* Tab Header */}
            <div className="flex border-b" style={{ borderColor: 'var(--frame-border)' }}>
              <button
                onClick={() => handleTabChange('notes')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${activeTab === 'notes'
                  ? 'bg-white/5 border-b-2'
                  : 'hover:text-white hover:bg-white/5'
                  }`}
                style={{
                  color: activeTab === 'notes' ? 'var(--accent-500)' : 'var(--text-muted)',
                  borderBottomColor: activeTab === 'notes' ? 'var(--accent-500)' : 'transparent'
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes
                {(notes[selectedCategoryId] || []).length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'var(--frame-bg)', color: 'var(--text-muted)' }}>
                    {(notes[selectedCategoryId] || []).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('files')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${activeTab === 'files'
                  ? 'bg-white/5 border-b-2'
                  : 'hover:text-white hover:bg-white/5'
                  }`}
                style={{
                  color: activeTab === 'files' ? 'var(--accent-500)' : 'var(--text-muted)',
                  borderBottomColor: activeTab === 'files' ? 'var(--accent-500)' : 'transparent'
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                Files
                {getCategoryFiles().length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'var(--frame-bg)', color: 'var(--text-muted)' }}>
                    {getCategoryFiles().length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'notes' ? (
              <NotesList
                categoryId={selectedCategoryId}
                notes={notes[selectedCategoryId] || []}
                selectedNoteId={selectedNoteId}
                onSelect={setSelectedNoteId}
                onAdd={() => handleAddNote(selectedCategoryId)}
                onDelete={(noteId) => handleDeleteNote(selectedCategoryId, noteId)}
              />
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`m-3 p-4 border-2 border-dashed rounded-xl transition-all ${isDragging
                    ? 'border-white/50 bg-white/5'
                    : 'hover:border-white/30'
                    }`}
                  style={{
                    backgroundColor: isDragging ? undefined : 'var(--frame-bg)',
                    borderColor: isDragging ? 'var(--accent-500)' : 'var(--panel-border)'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isDragging ? 'bg-primary-500/20' : ''}`}
                      style={{ backgroundColor: isDragging ? undefined : 'var(--panel-bg)' }}>
                      <svg className={`w-5 h-5`} style={{ color: isDragging ? 'var(--accent-500)' : 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      Drag files here or
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs text-white rounded-lg transition-all"
                      style={{ backgroundColor: 'var(--accent-500)' }}
                    >
                      Select File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg,.gif,.svg,.mp3,.mp4"
                    />
                  </div>
                </div>

                {/* Files List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  {getCategoryFiles().length > 0 ? (
                    <div className="space-y-1">
                      {getCategoryFiles().map((file) => {
                        const fileType = getFileType(file.name);
                        const isSelected = selectedFileId === file.id;
                        return (
                          <div
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${isSelected
                              ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                              : 'border-transparent hover:bg-white/5 hover:border-white/10'
                              }`}
                            style={{
                              backgroundColor: isSelected ? 'color-mix(in srgb, var(--accent-500), transparent 85%)' : 'var(--frame-bg)',
                              borderColor: isSelected ? 'var(--accent-500)' : 'transparent',
                              color: isSelected ? 'var(--accent-500)' : 'var(--text-main)'
                            }}
                          >
                            <div className={`w-8 h-8 rounded-lg ${fileType.bg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                              {isImageFile(file) && file.base64 ? (
                                <img src={file.base64} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm">{fileType.icon}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({
                                  isOpen: true,
                                  title: 'Delete File',
                                  message: `Are you sure you want to delete "${file.name}"?`,
                                  onConfirm: () => handleDeleteFile(selectedCategoryId, file.id)
                                });
                              }}
                              className="p-1.5 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center px-4" style={{ color: 'var(--text-muted)' }}>
                      <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">No files in this category</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Select a category</p>
            <p className="text-sm mt-1 text-center">Select a category from the left panel to view notes and files</p>
          </div>
        )}
      </div>

      {/* Right Panel - Note/File Preview */}
      <div className="flex-1" style={{ backgroundColor: 'var(--panel-bg)' }}>
        {activeTab === 'notes' ? (
          <NoteEditor
            key={selectedNoteId}
            note={getSelectedNote()}
            onUpdate={(updates) => handleUpdateNote(selectedCategoryId, selectedNoteId, updates)}
          />
        ) : (
          /* File Preview */
          <div className="h-full flex items-center justify-center">
            {getSelectedFile() ? (
              <div className="w-full h-full flex flex-col">
                {/* File Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--frame-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${getFileType(getSelectedFile().name).bg} flex items-center justify-center`}>
                      <span className="text-xl">{getFileType(getSelectedFile().name).icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>{getSelectedFile().name}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatFileSize(getSelectedFile().size)} • {new Date(getSelectedFile().createdAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenFile(getSelectedFile())}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all"
                      style={{ backgroundColor: 'var(--accent-500)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </button>
                    <button
                      onClick={() => {
                        const file = getSelectedFile();
                        const link = document.createElement('a');
                        link.href = file.base64;
                        link.download = file.name;
                        link.click();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>

                {/* File Preview */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                  {isImageFile(getSelectedFile()) ? (
                    <img
                      src={getSelectedFile().base64}
                      alt={getSelectedFile().name}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                  ) : getSelectedFile().type === 'application/pdf' ? (
                    <iframe
                      src={getSelectedFile().base64}
                      className="w-full h-full rounded-xl"
                      title={getSelectedFile().name}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-32 h-32 rounded-3xl ${getFileType(getSelectedFile().name).bg} flex items-center justify-center mb-6`}>
                        <span className="text-6xl">{getFileType(getSelectedFile().name).icon}</span>
                      </div>
                      <p className="text-xl font-semibold text-white mb-2">{getSelectedFile().name}</p>
                      <p className="text-slate-400 mb-6">This file type cannot be previewed</p>
                      <button
                        onClick={() => handleOpenFile(getSelectedFile())}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No file selected</p>
                <p className="text-sm mt-1">Select a file from the list to preview</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteAlertModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
      />
    </div>
  );
};

export default NotesApp;
