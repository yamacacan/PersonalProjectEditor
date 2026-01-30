import React, { useState, useEffect } from 'react';
import Column from './Column';
import CardDetailModal from './CardDetailModal';
import AddColumnModal from './AddColumnModal';
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
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [createBoardName, setCreateBoardName] = useState('');

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
            title: 'Ana Pano',
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
      title: 'İş Panosu',
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
        'todo': 'Yapılacaklar',
        'in-progress': 'Devam Edenler',
        'done': 'Tamamlananlar'
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
      alert('En az bir pano kalmalıdır!');
      return;
    }

    if (!window.confirm(`"${boards[activeBoardId].title}" panosunu silmek istediğinize emin misiniz?`)) {
      return;
    }

    const newBoards = { ...boards };
    delete newBoards[activeBoardId];

    const remainingIds = Object.keys(newBoards);
    const nextActiveId = remainingIds[0];

    setBoards(newBoards);
    setActiveBoardId(nextActiveId);
    await saveData(newBoards, nextActiveId);
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
    if (window.confirm('Bu kolonu silmek istediğinize emin misiniz? Tüm kartlar silinecektir.')) {
      const currentBoard = getCurrentBoard();
      if (!currentBoard) return;

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
          <span className="text-slate-400 font-medium">Yükleniyor...</span>
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
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Board Selector & Title */}
            <div className="relative group">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
              >
                {isRenamingBoard ? (
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onBlur={handleRenameBoardSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameBoardSave()}
                    autoFocus
                    className="bg-slate-800 text-xl font-bold text-white px-2 py-1 rounded border border-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h1 className="text-xl font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                    {currentBoard.title}
                    <svg className={`w-5 h-5 transition-transform ${isBoardDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </h1>
                )}
              </div>

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
                  <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-slate-700">
                      <p className="text-xs text-slate-400 font-medium px-2 py-1">PANOLARIM</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {Object.values(boards).map(board => (
                        <button
                          key={board.id}
                          onClick={() => {
                            setActiveBoardId(board.id);
                            setIsBoardDropdownOpen(false);
                            setIsCreatingBoard(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center justify-between ${activeBoardId === board.id ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'
                            }`}
                        >
                          <span className="font-medium truncate">{board.title}</span>
                          {activeBoardId === board.id && (
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Create New Board Section */}
                    <div className="p-2 border-t border-slate-700 bg-slate-800/50">
                      {isCreatingBoard ? (
                        <div className="p-2 space-y-2">
                          <input
                            type="text"
                            value={createBoardName}
                            onChange={(e) => setCreateBoardName(e.target.value)}
                            placeholder="Pano adı..."
                            autoFocus
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setIsCreatingBoard(false);
                                setCreateBoardName('');
                              }}
                              className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              onClick={handleCreateBoard}
                              disabled={!createBoardName.trim()}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                            >
                              Oluştur
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCreatingBoard(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Yeni Pano Oluştur
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Board Actions */}
            <div className="flex items-center gap-1 border-l border-slate-700 pl-4 ml-2">
              <button
                onClick={handleRenameBoardStart}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Panoyu Yeniden Adlandır"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteBoard}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Panoyu Sil"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReorderMode(!isReorderMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isReorderMode
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">{isReorderMode ? 'Düzenlemeyi Bitir' : 'Sıralamayı Düzenle'}</span>
            </button>
            <button
              onClick={() => setIsAddColumnModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Kolon Ekle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-5 h-full min-w-max">
          {currentBoard.columnOrder && currentBoard.columnOrder.map((columnId) => (
            <Column
              key={columnId}
              title={getColumnTitle(columnId)}
              columnId={columnId}
              cards={currentBoard.columns[columnId] || []}
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
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={isCardModalOpen}
          onClose={() => {
            setIsCardModalOpen(false);
            setSelectedCard(null);
          }}
          onSave={(cardId, updates) => handleCardEdit(cardId, updates)}
          onDelete={handleCardDelete}
        />
      )}

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onAdd={handleAddColumn}
      />
    </div>
  );
}

export default KanbanBoard;

