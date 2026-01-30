import React from 'react';

const Navigation = ({ activeView, onViewChange }) => {
  const views = [
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    },
    {
      id: 'notes',
      label: 'Not Defteri',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
  ];

  return (
    <nav className="flex items-center gap-2 px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200
            ${activeView === view.id
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }
          `}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
