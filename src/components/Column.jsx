import React, { useState } from 'react';
import Card from './Card';

const Column = ({
  title,
  columnId,
  cards,
  colorClass,
  onCardMove,
  onCardEdit,
  onCardDelete,
  onAddCard,
  onCardViewDetail,
  onDeleteColumn,
  onEditColumn,
  onColumnReorder,
  isReorderMode,
  onCardDragStart,
  onCardDragEnd
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    const dragType = e.dataTransfer.types.includes('columnid') ? 'column' : 'card';

    if (dragType === 'card' && !isReorderMode) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    } else if (dragType === 'column' && isReorderMode && onColumnReorder) {
      e.dataTransfer.dropEffect = 'move';
      setIsColumnDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setIsColumnDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsColumnDragOver(false);

    const cardId = e.dataTransfer.getData('cardId');
    const draggedColumnId = e.dataTransfer.getData('columnId');

    if (cardId) {
      onCardMove(cardId, columnId);
    } else if (draggedColumnId && onColumnReorder) {
      onColumnReorder(draggedColumnId, columnId);
    }
  };

  const handleColumnDragStart = (e) => {
    e.dataTransfer.setData('columnId', columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleColumnDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setIsColumnDragOver(false);
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      const newCard = {
        id: Date.now().toString(),
        title: newCardTitle.trim(),
        description: '',
        tags: [],
        priority: 'medium',
        cardId: `TASK-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        image: null,
      };
      onAddCard(columnId, newCard);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleCancelAdd = () => {
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const handleTitleDoubleClick = () => {
    setEditedTitle(title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && onEditColumn) {
      onEditColumn(columnId, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(title);
    setIsEditingTitle(false);
  };

  return (
    <div
      draggable={isReorderMode && onColumnReorder ? true : false}
      onDragStart={isReorderMode ? handleColumnDragStart : undefined}
      onDragEnd={isReorderMode ? handleColumnDragEnd : undefined}
      className={`
        flex flex-col w-80 flex-shrink-0 rounded-2xl
        backdrop-blur-sm border
        transition-all duration-300 ease-out
        ${isDragOver ? 'ring-2 ring-primary-500 ring-opacity-50 scale-[1.02]' : ''}
        ${isColumnDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''}
        ${isReorderMode && onColumnReorder ? 'cursor-move' : ''}
      `}
      style={{
        backgroundColor: isDragOver ? 'var(--frame-bg)' : 'var(--panel-bg)',
        borderColor: 'var(--panel-border)'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          {isReorderMode && onColumnReorder && (
            <div
              className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing transition-colors animate-fade-in"
              title="Drag to move column"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
              </svg>
            </div>
          )}
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass} flex-shrink-0`}></div>

          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') handleTitleCancel();
              }}
              className="flex-1 min-w-0 px-2 py-1 rounded-lg text-sm font-semibold focus:outline-none focus:border-primary-500"
              style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
              autoFocus
            />
          ) : (
            <h2
              className="font-semibold truncate cursor-pointer hover:text-primary-400 transition-colors"
              style={{ color: 'var(--text-main)' }}
              onDoubleClick={handleTitleDoubleClick}
              title="Double-click to edit"
            >
              {title}
            </h2>
          )}

          <span className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--frame-bg)', color: 'var(--text-muted)' }}>
            {cards.length}
          </span>
        </div>
        {!isReorderMode && (
          <div className="flex items-center gap-1">
            {onEditColumn && (
              <button
                onClick={handleTitleDoubleClick}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                title="Edit Column"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsAddingCard(true)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Add Card"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {onDeleteColumn && (
              <button
                onClick={() => onDeleteColumn(columnId)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Column"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
        {isReorderMode && (
          <div className="text-xs italic px-2" style={{ color: 'var(--text-muted)' }}>Drag & Drop</div>
        )}
      </div>

      {/* Cards Container */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px] ${isReorderMode ? 'pointer-events-none opacity-50' : ''}`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onViewDetail={onCardViewDetail}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
          />
        ))}

        {isAddingCard && (
          <div className="animate-slide-up">
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)' }}>
              <input
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Enter card title..."
                className="w-full px-3 py-2 border rounded-lg placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-main)' }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCard();
                  } else if (e.key === 'Escape') {
                    handleCancelAdd();
                  }
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddCard}
                  className="flex-1 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="px-3 py-1.5 hover:text-white rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Card Button */}
      {!isAddingCard && !isReorderMode && (
        <button
          onClick={() => setIsAddingCard(true)}
          className="m-3 mt-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed hover:border-slate-500 transition-all duration-200"
          style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Add Card</span>
        </button>
      )}
    </div>
  );
};

export default Column;
