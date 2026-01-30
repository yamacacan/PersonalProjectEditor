import React, { useState, useEffect } from 'react';
import CategoryTree from './CategoryTree';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import { loadNotesData, saveNotesData } from '../../utils/storage';

const NotesApp = () => {
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadNotesData();
      if (data) {
        setCategories(data.categories || []);
        setNotes(data.notes || {});
      } else {
        // Varsayılan kategoriler
        const defaultCategories = [
          {
            id: 'personal',
            name: 'Kişisel',
            icon: '👤',
            children: [
              { id: 'personal-diary', name: 'Günlük', icon: '📔', children: [] },
              { id: 'personal-ideas', name: 'Fikirler', icon: '💡', children: [] },
            ]
          },
          {
            id: 'work',
            name: 'İş',
            icon: '💼',
            children: [
              { id: 'work-projects', name: 'Projeler', icon: '📊', children: [] },
              { id: 'work-meetings', name: 'Toplantılar', icon: '🤝', children: [] },
            ]
          },
        ];
        setCategories(defaultCategories);
        saveData({ categories: defaultCategories, notes: {} });
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
      };
      await saveNotesData(dataToSave);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

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

    // İlgili notları sil
    const newNotes = { ...notes };
    delete newNotes[categoryId];
    setNotes(newNotes);

    saveData({ categories: newCategories, notes: newNotes });

    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setSelectedNoteId(null);
    }
  };

  const handleAddNote = (categoryId) => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Yeni Not',
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

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sol Panel - Kategoriler */}
      <div className="w-64 border-r border-slate-700/50 bg-slate-900/30 flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Kategoriler
          </h2>
        </div>
        <CategoryTree
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
        />
      </div>

      {/* Orta Panel - Notlar Listesi */}
      <div className="w-80 border-r border-slate-700/50 bg-slate-900/20 flex flex-col">
        <NotesList
          categoryId={selectedCategoryId}
          notes={notes[selectedCategoryId] || []}
          selectedNoteId={selectedNoteId}
          onSelect={setSelectedNoteId}
          onAdd={() => handleAddNote(selectedCategoryId)}
          onDelete={(noteId) => handleDeleteNote(selectedCategoryId, noteId)}
        />
      </div>

      {/* Sağ Panel - Not Editörü */}
      <div className="flex-1 bg-slate-800/30">
        <NoteEditor
          key={selectedNoteId}
          note={getSelectedNote()}
          onUpdate={(updates) => handleUpdateNote(selectedCategoryId, selectedNoteId, updates)}
        />
      </div>
    </div>
  );
};

export default NotesApp;

