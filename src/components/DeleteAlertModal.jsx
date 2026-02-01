import React from 'react';

const DeleteAlertModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    message = "Are you sure you want to delete this item?",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger" // "danger" or "warning"
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    const iconColors = {
        danger: 'from-red-500 to-red-600',
        warning: 'from-amber-500 to-amber-600'
    };

    const buttonColors = {
        danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/25',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
    };

    return (
        <div className="themed-modal-overlay">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                {/* Header */}
                <div className="flex items-start gap-4 px-6 py-5">
                    <div className={`w-12 h-12 bg-gradient-to-br ${iconColors[type]} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        {type === 'danger' ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--panel-border)', backgroundColor: 'var(--frame-bg)' }}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-lg ${buttonColors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAlertModal;