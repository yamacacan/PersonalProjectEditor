import React, { useState } from 'react';

const Trashhold = ({ onCardDrop, isVisible }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragOver) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const cardId = e.dataTransfer.getData('cardId');
        if (cardId && onCardDrop) {
            onCardDrop(cardId);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                flex items-center justify-center gap-3
                px-8 py-4 rounded-2xl
                border-2 border-dashed
                transition-all duration-300 ease-out
                ${isDragOver
                    ? 'bg-red-500/30 border-red-400 scale-110 shadow-2xl shadow-red-500/50'
                    : 'bg-slate-900/90 border-slate-600 backdrop-blur-sm'
                }
            `}
        >
            {/* Trash Icon */}
            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${isDragOver
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-slate-700 text-slate-400'
                }
            `}>
                <svg
                    className={`w-6 h-6 transition-transform duration-300 ${isDragOver ? 'scale-125' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col">
                <span className={`
                    font-semibold text-sm transition-colors duration-300
                    ${isDragOver ? 'text-red-300' : 'text-slate-300'}
                `}>
                    {isDragOver ? 'Bırakarak Sil' : 'Silmek İçin Sürükle'}
                </span>
                <span className={`
                    text-xs transition-colors duration-300
                    ${isDragOver ? 'text-red-400' : 'text-slate-500'}
                `}>
                    {isDragOver ? 'Kartı buraya bırakın' : 'Kartları çöp kutusuna sürükleyin'}
                </span>
            </div>

            {/* Animated Ring when dragging over */}
            {isDragOver && (
                <div className="absolute inset-0 rounded-2xl animate-ping bg-red-500/20 pointer-events-none" />
            )}
        </div>
    );
};

export default Trashhold;