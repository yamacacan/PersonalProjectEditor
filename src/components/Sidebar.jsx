import React, { useState } from 'react';

const Sidebar = ({ activeView, onViewChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const views = [
        {
            id: 'kanban',
            label: 'Kanban Board',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
            )
        },
        {
            id: 'notes',
            label: 'Not Defteri',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            id: 'projects',
            label: 'Proje Kanvası',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            )
        },
    ];

    return (
        <aside
            className={`sidebar ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                </div>
                <span className={`sidebar-logo-text ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Kanban
                </span>
            </div>

            {/* Divider */}
            <div className="sidebar-divider" />

            {/* Navigation Items */}
            <nav className="sidebar-nav">
                {views.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={`sidebar-item ${activeView === view.id ? 'sidebar-item-active' : ''}`}
                        title={!isExpanded ? view.label : ''}
                    >
                        <div className="sidebar-item-icon">
                            {view.icon}
                        </div>
                        <span className={`sidebar-item-label ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            {view.label}
                        </span>
                        {activeView === view.id && (
                            <div className="sidebar-item-indicator" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto">
                <div className="sidebar-divider" />

                {/* Settings */}
                <div className="sidebar-bottom">
                    <button
                        onClick={() => onViewChange('settings')}
                        className={`sidebar-item w-full ${activeView === 'settings' ? 'sidebar-item-active' : 'sidebar-item-muted'}`}
                        title={!isExpanded ? 'Ayarlar' : ''}
                    >
                        <div className="sidebar-item-icon">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className={`sidebar-item-label ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            Ayarlar
                        </span>
                        {activeView === 'settings' && (
                            <div className="sidebar-item-indicator" />
                        )}
                    </button>
                </div>
            </div>

            {/* Expand Indicator */}
            <div className={`sidebar-expand-indicator ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
                <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </aside>
    );
};

export default Sidebar;
