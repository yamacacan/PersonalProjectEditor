import React, { useState, useEffect, useMemo } from 'react';
import Column from './Column';
import CardDetailModal from './CardDetailModal';
import AddColumnModal from './AddColumnModal';
import DeleteAlertModal from './DeleteAlertModal';
import Trashhold from './Trashhold';
import { loadKanbanData, saveKanbanData, deleteImage } from '../utils/storage';

function KanbanBoard() {
  const [boards, setBoards] = useState({});
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [isRenamingBoard, setIsRenamingBoard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [createBoardName, setCreateBoardName] = useState('');
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const fileInputRef = React.useRef(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Memoized available tags across all cards in all boards (to provide suggestions even if board changes)
  const availableTags = useMemo(() => {
    const tagsMap = new Map();
    Object.values(boards).forEach(board => {
      if (!board.columns) return;
      Object.values(board.columns).forEach(cards => {
        cards.forEach(card => {
          card.tags?.forEach(tag => {
            const key = `${tag.text.toLowerCase()}-${tag.color}`;
            if (!tagsMap.has(key)) {
              tagsMap.set(key, tag);
            }
          });
        });
      });
    });
    return Array.from(tagsMap.values());
  }, [boards]);

  // Initial Data Load & Migration
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadKanbanData();

        // Scenario 1: New Data Format (Multiple Boards)
        if (data && data.boards) {
          setBoards(data.boards);
          setActiveBoardId(data.activeBoardId || Object.keys(data.boards)[0]);
        }
        // Scenario 2: Legacy Data Format (Single Board Migration)
        else if (data && (data.columns || data.columnOrder)) {
          const defaultBoardId = 'board-main';
          const defaultBoard = {
            id: defaultBoardId,
            title: 'Main Board',
            columns: data.columns || {},
            columnOrder: data.columnOrder || Object.keys(data.columns || {}),
            columnTitles: data.columnTitles || {}
          };

          const newBoards = { [defaultBoardId]: defaultBoard };
          setBoards(newBoards);
          setActiveBoardId(defaultBoardId);
          await saveData(newBoards, defaultBoardId);
        }
        // Scenario 3: No Data (Fresh Start)
        else {
          createDefaultBoard();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        createDefaultBoard();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const createDefaultBoard = async () => {
    const boardId = 'board-' + Date.now();
    const defaultBoard = {
      id: boardId,
      title: 'Work Board',
      columns: {
        'todo': [],
        'in-progress': [],
        'review': [],
        'done': [],
      },
      columnOrder: ['todo', 'in-progress', 'review', 'done'],
      columnTitles: {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'review': 'Review',
        'done': 'Done'
      }
    };

    const newBoards = { ...boards, [boardId]: defaultBoard };
    // If it's the first board, make it active
    const nextActiveId = activeBoardId || boardId;

    setBoards(newBoards);
    setActiveBoardId(nextActiveId);
    await saveData(newBoards, nextActiveId);
  };

  const saveData = async (currentBoards, currentActiveId) => {
    try {
      const dataToSave = {
        boards: currentBoards,
        activeBoardId: currentActiveId,
      };
      await saveKanbanData(dataToSave);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Helper to get current board
  const getCurrentBoard = () => {
    return boards[activeBoardId] || null;
  };

  // --- Board Management ---

  const handleCreateBoard = async () => {
    if (!createBoardName.trim()) return;

    const boardId = 'board-' + Date.now();
    const newBoard = {
      id: boardId,
      title: createBoardName,
      columns: {
        'todo': [],
        'in-progress': [],
        'done': [],
      },
      columnOrder: ['todo', 'in-progress', 'done'],
      columnTitles: {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'done': 'Done'
      }
    };

    const newBoards = { ...boards, [boardId]: newBoard };
    setBoards(newBoards);
    setActiveBoardId(boardId);
    setCreateBoardName('');
    setIsCreatingBoard(false);
    await saveData(newBoards, boardId);
  };

  const handleDeleteBoard = async () => {
    if (Object.keys(boards).length <= 1) {
      setDeleteModal({
        isOpen: true,
        title: 'Cannot Delete',
        message: 'At least one board must remain!',
        onConfirm: null
      });
      return;
    }

    setDeleteModal({
      isOpen: true,
      title: 'Delete Board',
      message: `Are you sure you want to delete "${boards[activeBoardId].title}" board? This action cannot be undone.`,
      onConfirm: async () => {
        const newBoards = { ...boards };
        delete newBoards[activeBoardId];

        const remainingIds = Object.keys(newBoards);
        const nextActiveId = remainingIds[0];

        setBoards(newBoards);
        setActiveBoardId(nextActiveId);
        await saveData(newBoards, nextActiveId);
      }
    });
  };

  const handleRenameBoardStart = () => {
    setNewBoardName(boards[activeBoardId].title);
    setIsRenamingBoard(true);
  };

  const handleRenameBoardSave = async () => {
    if (!newBoardName.trim()) {
      setIsRenamingBoard(false);
      return;
    }

    const newBoards = {
      ...boards,
      [activeBoardId]: {
        ...boards[activeBoardId],
        title: newBoardName
      }
    };

    setBoards(newBoards);
    setIsRenamingBoard(false);
    await saveData(newBoards, activeBoardId);
  };

  const handleExportData = () => {
    const dataToExport = {
      boards: boards,
      activeBoardId: activeBoardId,
      version: '1.0',
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Basic validation
        if (importedData && importedData.boards && typeof importedData.boards === 'object') {
          // Check if any board has columns
          const hasBoards = Object.keys(importedData.boards).length > 0;
          if (!hasBoards) throw new Error('No boards found');

          setBoards(importedData.boards);
          const firstBoardId = Object.keys(importedData.boards)[0];
          setActiveBoardId(importedData.activeBoardId || firstBoardId);
          await saveData(importedData.boards, importedData.activeBoardId || firstBoardId);

          setDeleteModal({
            isOpen: true,
            title: 'Import Successful',
            message: 'Your Kanban data has been successfully imported.',
            onConfirm: null
          });
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        setDeleteModal({
          isOpen: true,
          title: 'Import Failed',
          message: 'The selected file is not a valid Kanban backup.',
          onConfirm: null
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // --- Column & Card Management (Scoped to Active Board) ---

  const updateCurrentBoard = (updates) => {
    if (!activeBoardId) return;

    setBoards(prevBoards => {
      const currentBoard = prevBoards[activeBoardId];
      const updatedBoard = { ...currentBoard, ...updates };
      const newBoards = { ...prevBoards, [activeBoardId]: updatedBoard };

      saveData(newBoards, activeBoardId);
      return newBoards;
    });
  };

  const handleCardMove = (cardId, targetColumnId) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    let card = null;
    const newColumns = { ...currentBoard.columns };

    // Find and remove card
    for (const [colId, cards] of Object.entries(newColumns)) {
      const cardIndex = cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        card = cards[cardIndex];
        newColumns[colId] = cards.filter((c) => c.id !== cardId);
        break;
      }
    }

    // Add to target
    if (card) {
      newColumns[targetColumnId] = [...newColumns[targetColumnId], card];
      updateCurrentBoard({ columns: newColumns });
    }
  };

  const handleCardEdit = (cardId, updates) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    const newColumns = { ...currentBoard.columns };

    for (const [colId, cards] of Object.entries(newColumns)) {
      const cardIndex = cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        newColumns[colId] = cards.map((c) =>
          c.id === cardId ? { ...c, ...updates } : c
        );
        updateCurrentBoard({ columns: newColumns });
        break;
      }
    }
  };

  const handleCardDelete = async (cardId) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    let cardToDelete = null;
    for (const cards of Object.values(currentBoard.columns)) {
      cardToDelete = cards.find((c) => c.id === cardId);
      if (cardToDelete) break;
    }

    if (cardToDelete?.image) {
      await deleteImage(cardToDelete.image);
    }

    const newColumns = { ...currentBoard.columns };
    for (const [colId, cards] of Object.entries(newColumns)) {
      const cardIndex = cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        newColumns[colId] = cards.filter((c) => c.id !== cardId);
        updateCurrentBoard({ columns: newColumns });
        break;
      }
    }
  };

  // Trash drop handler - silently delete without confirmation
  const handleTrashDrop = async (cardId) => {
    await handleCardDelete(cardId);
    setIsDraggingCard(false);
  };

  // Drag state handlers
  const handleCardDragStart = () => {
    setIsDraggingCard(true);
  };

  const handleCardDragEnd = () => {
    setIsDraggingCard(false);
  };

  const handleAddCard = (columnId, newCard) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    const newColumns = {
      ...currentBoard.columns,
      [columnId]: [...currentBoard.columns[columnId], newCard],
    };
    updateCurrentBoard({ columns: newColumns });
  };

  const handleCardViewDetail = (card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleAddColumn = (title) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    const columnId = title.toLowerCase().replace(/\s+/g, '-');
    const newColumns = {
      ...currentBoard.columns,
      [columnId]: [],
    };
    const newOrder = [...currentBoard.columnOrder, columnId];

    updateCurrentBoard({
      columns: newColumns,
      columnOrder: newOrder
    });
  };

  const handleDeleteColumn = (columnId) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    const columnTitle = currentBoard.columnTitles?.[columnId] || columnId;
    const cardCount = (currentBoard.columns[columnId] || []).length;

    setDeleteModal({
      isOpen: true,
      title: 'Delete Column',
      message: `Are you sure you want to delete "${columnTitle}" column?${cardCount > 0 ? ` This column has ${cardCount} cards and all will be deleted.` : ''}`,
      onConfirm: () => {
        const newColumns = { ...currentBoard.columns };
        delete newColumns[columnId];

        const newTitles = { ...currentBoard.columnTitles };
        delete newTitles[columnId];

        const newOrder = currentBoard.columnOrder.filter((id) => id !== columnId);

        updateCurrentBoard({
          columns: newColumns,
          columnOrder: newOrder,
          columnTitles: newTitles
        });
      }
    });
  };

  const handleEditColumn = (columnId, newTitle) => {
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    const newTitles = { ...currentBoard.columnTitles, [columnId]: newTitle };
    updateCurrentBoard({ columnTitles: newTitles });
  };

  const handleColumnReorder = (draggedColumnId, targetColumnId) => {
    if (draggedColumnId === targetColumnId) return;
    const currentBoard = getCurrentBoard();
    if (!currentBoard) return;

    const newOrder = [...currentBoard.columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumnId);
    const targetIndex = newOrder.indexOf(targetColumnId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumnId);

    updateCurrentBoard({ columnOrder: newOrder });
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

  const currentBoard = getCurrentBoard();
  if (!currentBoard) return null;

  // Render Helpers
  const getColumnTitle = (columnId) => {
    if (currentBoard.columnTitles && currentBoard.columnTitles[columnId]) {
      return currentBoard.columnTitles[columnId];
    }
    const defaultTitles = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'review': 'In Review',
      'done': 'Done',
    };
    return defaultTitles[columnId] || columnId
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getColumnColor = (columnId) => {
    const colors = {
      'todo': 'from-slate-500 to-slate-600',
      'in-progress': 'from-blue-500 to-blue-600',
      'review': 'from-amber-500 to-amber-600',
      'done': 'from-emerald-500 to-emerald-600',
    };
    return colors[columnId] || 'from-purple-500 to-purple-600';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-none backdrop-blur-xl border-b z-20 sticky top-0" style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--frame-border)' }}>
        <div className="px-6 py-4 max-w-[2000px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Section: Board Selector & Actions */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button
                  onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm border transition-all group"
                  style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  {isRenamingBoard ? (
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      onBlur={handleRenameBoardSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameBoardSave()}
                      autoFocus
                      className="bg-transparent text-lg font-bold text-white outline-none min-w-[120px]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-lg font-bold group-hover:text-primary-400 transition-colors" style={{ color: 'var(--text-main)' }}>
                      {currentBoard.title}
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isBoardDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isBoardDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => {
                        setIsBoardDropdownOpen(false);
                        setIsCreatingBoard(false);
                        setCreateBoardName('');
                      }}
                    ></div>
                    <div className="absolute top-full left-0 mt-3 w-72 backdrop-blur-xl border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                      <div className="p-4 border-b bg-white/5" style={{ borderColor: 'var(--panel-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>My Boards</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {Object.values(boards).map(board => (
                          <button
                            key={board.id}
                            onClick={() => {
                              setActiveBoardId(board.id);
                              setIsBoardDropdownOpen(false);
                              setIsCreatingBoard(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all flex items-center justify-between group ${activeBoardId === board.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
                            style={{ color: activeBoardId === board.id ? 'var(--accent-500)' : 'var(--text-main)' }}
                          >
                            <span className="font-medium truncate">{board.title}</span>
                            {activeBoardId === board.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
                          </button>
                        ))}
                      </div>

                      {/* Create New Board Section */}
                      <div className="p-3 border-t bg-black/20" style={{ borderColor: 'var(--panel-border)' }}>
                        {isCreatingBoard ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={createBoardName}
                              onChange={(e) => setCreateBoardName(e.target.value)}
                              placeholder="Board name..."
                              autoFocus
                              className="w-full px-3 py-2 bg-black/20 border rounded-lg text-sm focus:outline-none focus:border-primary-500/50"
                              style={{ color: 'var(--text-main)', borderColor: 'var(--panel-border)' }}
                              onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => { setIsCreatingBoard(false); setCreateBoardName(''); }} className="px-3 py-1.5 text-xs hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                              <button onClick={handleCreateBoard} disabled={!createBoardName.trim()} className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all">Create</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setIsCreatingBoard(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Create New Board
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Board Actions */}
              <div className="flex items-center gap-1 rounded-xl border p-1" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                <button
                  onClick={handleRenameBoardStart}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  title="Rename Board"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  title="Delete Board"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Middle Section: Search */}
            <div className="flex-1 max-w-lg hidden lg:block">
              <div className="relative group/search">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500 group-focus-within/search:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all cards..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 focus:bg-white/10 transition-all text-sm backdrop-blur-sm"
                  style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />

              <div className="flex items-center gap-1 rounded-xl border p-1" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2"
                  style={{ color: 'var(--text-muted)' }}
                  title="Import JSON"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs font-bold hidden sm:inline">Import</span>
                </button>
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button
                  onClick={handleExportData}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2"
                  style={{ color: 'var(--text-muted)' }}
                  title="Export JSON"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-xs font-bold hidden sm:inline">Export</span>
                </button>
              </div>

              <button
                onClick={() => setIsReorderMode(!isReorderMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border ${isReorderMode
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'hover:bg-white/5'
                  }`}
                style={{
                  backgroundColor: isReorderMode ? undefined : 'var(--panel-bg)',
                  borderColor: isReorderMode ? undefined : 'var(--panel-border)',
                  color: isReorderMode ? undefined : 'var(--text-main)'
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>{isReorderMode ? 'Done' : 'Reorder'}</span>
              </button>

              <div className="lg:hidden flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-primary-500/50"
                  style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
                />
              </div>

              <button
                onClick={() => setIsAddColumnModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 border border-white/10 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Column</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-5 h-full min-w-max">
          {currentBoard.columnOrder && currentBoard.columnOrder.map((columnId) => {
            const cards = currentBoard.columns[columnId] || [];
            const filteredCards = cards.filter(card =>
              card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.tags?.some(tag => tag.text.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            return (
              <Column
                key={columnId}
                title={getColumnTitle(columnId)}
                columnId={columnId}
                cards={filteredCards}
                colorClass={getColumnColor(columnId)}
                onCardMove={handleCardMove}
                onCardEdit={handleCardEdit}
                onCardDelete={handleCardDelete}
                onAddCard={handleAddCard}
                onCardViewDetail={handleCardViewDetail}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={handleEditColumn}
                onColumnReorder={isReorderMode ? handleColumnReorder : null}
                isReorderMode={isReorderMode}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
              />
            );
          })}
        </div>
      </main >

      {/* Modals */}
      {
        selectedCard && (
          <CardDetailModal
            card={selectedCard}
            availableTags={availableTags}
            isOpen={isCardModalOpen}
            onClose={() => {
              setIsCardModalOpen(false);
              setSelectedCard(null);
            }}
            onSave={(cardId, updates) => handleCardEdit(cardId, updates)}
            onDelete={handleCardDelete}
          />
        )
      }

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAdd={handleAddColumn}
      />

      <DeleteAlertModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
      />

      {/* Trash Drop Zone */}
      <Trashhold
        onCardDrop={handleTrashDrop}
        isVisible={isDraggingCard}
      />
    </div >
  );
}

export default KanbanBoard;

