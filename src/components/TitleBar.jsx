import React, { useState, useEffect } from 'react';

const TitleBar = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    const handleMinimize = () => {
        console.log('Minimize clicked', window.electronAPI);
        if (window.electronAPI) {
            window.electronAPI.minimizeWindow();
        }
    };

    const handleMaximize = () => {
        console.log('Maximize clicked', window.electronAPI);
        if (window.electronAPI) {
            window.electronAPI.maximizeWindow();
            setIsMaximized(!isMaximized);
        }
    };

    const handleClose = () => {
        console.log('Close clicked', window.electronAPI);
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    };

    return (
        <div className="title-bar select-none">
            <div className="title-bar-drag flex items-center h-9">
                {/* App Logo & Title */}
                <div className="title-bar-no-drag flex items-center gap-2.5 pl-3">
                    <div className="app-logo-small">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-slate-400">Kanban Board</span>
                </div>

                {/* Spacer - Draggable */}
                <div className="flex-1" />

                {/* Window Controls */}
                <div className="title-bar-no-drag flex items-center h-full">
                    {/* Minimize Button */}
                    <button
                        onClick={handleMinimize}
                        className="window-control w-12 h-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700/80 transition-all duration-150"
                        aria-label="Minimize"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M5 12h14" />
                        </svg>
                    </button>

                    {/* Maximize/Restore Button */}
                    <button
                        onClick={handleMaximize}
                        className="window-control w-12 h-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700/80 transition-all duration-150"
                        aria-label={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        {isMaximized ? (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path d="M8 4h12v12M4 8h12v12H4z" />
                            </svg>
                        ) : (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <rect x="4" y="4" width="16" height="16" rx="1" />
                            </svg>
                        )}
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="window-control w-12 h-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500 transition-all duration-150"
                        aria-label="Close"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TitleBar;
