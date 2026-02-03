import React, { useState, useEffect } from 'react';
import { loadImage } from '../utils/storage';

const PRIORITY_CONFIG = {
  low: { color: 'bg-slate-500', label: 'Low' },
  medium: { color: 'bg-amber-500', label: 'Medium' },
  high: { color: 'bg-red-500', label: 'High' },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Card = ({ card, onViewDetail, onDragStart, onDragEnd }) => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleClick = () => {
    onViewDetail(card);
  };

  const priority = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.medium;

  useEffect(() => {
    if (card.image) {
      loadImage(card.image).then(base64 => {
        setImagePreview(base64);
      });
    } else {
      setImagePreview(null);
    }
  }, [card.image]);

  return (
    <div
      className="group rounded-xl cursor-pointer border transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 animate-fade-in overflow-hidden"
      style={{
        backgroundColor: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)'
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('cardId', card.id);
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart();
      }}
      onDragEnd={(e) => {
        if (onDragEnd) onDragEnd();
      }}
      onClick={handleClick}
    >
      {/* Card Image */}
      {imagePreview && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={imagePreview}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.text}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-600 text-slate-300 rounded-md">
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2">
          {card.title}
        </h3>

        {/* Description */}
        {card.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {card.description}
          </p>
        )}

        {/* Todo Progress */}
        {card.todos && card.todos.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-[11px] text-slate-400">
                {card.todos.filter((t) => t.completed).length}/{card.todos.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--text-muted), transparent 80%)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  backgroundColor: 'var(--accent-500)',
                  width: `${card.todos.length > 0
                    ? (card.todos.filter((t) => t.completed).length / card.todos.length) * 100
                    : 0
                    }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
          <div className="flex items-center gap-3">
            {/* Card ID */}
            {card.cardId && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-500)' }}>
                  <circle cx="10" cy="10" r="4" />
                </svg>
                {card.cardId}
              </span>
            )}

            {/* Priority */}
            <span className={`w-2 h-2 rounded-full ${priority.color}`} title={priority.label}></span>

            {/* Has Image Indicator */}
            {card.image && (
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}

            {/* Due Date */}
            {card.dueDate && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(card.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          {/* Assignee */}
          {card.assignedTo && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shadow-md"
              style={{ background: 'linear-gradient(to bottom right, var(--accent-500), var(--accent-600))' }}
              title={card.assignedTo}
            >
              {getInitials(card.assignedTo)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
