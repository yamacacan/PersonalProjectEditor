import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import NotesApp from './components/Notes/NotesApp';
import ProjectCanvas from './components/ProjectManagement/ProjectCanvas';
import Settings from './components/Settings';

// Theme definitions
const themes = {
  light: 'from-slate-100 via-slate-50 to-white',
  dark: 'from-slate-900 via-slate-800 to-slate-900',
  midnight: 'from-slate-950 via-indigo-950 to-slate-950',
  ocean: 'from-slate-900 via-cyan-950 to-slate-900',
  forest: 'from-slate-900 via-emerald-950 to-slate-900',
  sunset: 'from-slate-900 via-rose-950 to-slate-900',
  purple: 'from-slate-900 via-purple-950 to-slate-900',
  pitchblack: 'from-black via-zinc-950 to-black',
};

function App() {
  const [activeView, setActiveView] = useState('kanban');
  const [themeSettings, setThemeSettings] = useState(() => {
    const saved = localStorage.getItem('kanban-theme');
    return saved ? JSON.parse(saved) : { theme: 'dark', accent: 'indigo' };
  });

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('kanban-theme', JSON.stringify(themeSettings));

    // Update CSS variables
    const root = document.documentElement;

    // Accent colors
    const accentColors = {
      indigo: { 500: '#6366f1', 600: '#4f46e5' },
      blue: { 500: '#3b82f6', 600: '#2563eb' },
      cyan: { 500: '#06b6d4', 600: '#0891b2' },
      emerald: { 500: '#10b981', 600: '#059669' },
      amber: { 500: '#f59e0b', 600: '#d97706' },
      rose: { 500: '#f43f5e', 600: '#e11d48' },
      purple: { 500: '#a855f7', 600: '#9333ea' },
      pink: { 500: '#ec4899', 600: '#db2777' },
    };

    // Frame colors for each theme
    const frameColors = {
      light: {
        bg: 'rgba(248, 250, 252, 0.95)',
        border: 'rgba(226, 232, 240, 0.8)',
        panel: 'rgba(255, 255, 255, 0.95)',
        panelBorder: 'rgba(226, 232, 240, 0.8)',
        canvasBg: '#f8fafc',
        canvasDot: '#e2e8f0',
        textMain: '#1e293b',
        textMuted: '#64748b'
      },
      dark: {
        bg: 'rgba(15, 23, 42, 0.95)',
        border: 'rgba(51, 65, 85, 0.5)',
        panel: 'rgba(30, 41, 59, 0.95)',
        panelBorder: 'rgba(51, 65, 85, 0.5)',
        canvasBg: '#0f172a',
        canvasDot: '#334155',
        textMain: '#ffffff',
        textMuted: '#94a3b8'
      },
      midnight: {
        bg: 'rgba(15, 23, 42, 0.95)',
        border: 'rgba(67, 56, 202, 0.3)',
        panel: 'rgba(30, 27, 75, 0.95)',
        panelBorder: 'rgba(67, 56, 202, 0.3)',
        canvasBg: '#0f0a2e',
        canvasDot: '#312e81',
        textMain: '#ffffff',
        textMuted: '#94a3b8'
      },
      ocean: {
        bg: 'rgba(8, 51, 68, 0.95)',
        border: 'rgba(6, 182, 212, 0.2)',
        panel: 'rgba(14, 65, 82, 0.95)',
        panelBorder: 'rgba(6, 182, 212, 0.2)',
        canvasBg: '#083344',
        canvasDot: '#155e75',
        textMain: '#ffffff',
        textMuted: '#94a3b8'
      },
      forest: {
        bg: 'rgba(2, 44, 34, 0.95)',
        border: 'rgba(16, 185, 129, 0.2)',
        panel: 'rgba(6, 60, 46, 0.95)',
        panelBorder: 'rgba(16, 185, 129, 0.2)',
        canvasBg: '#022c22',
        canvasDot: '#065f46',
        textMain: '#ffffff',
        textMuted: '#94a3b8'
      },
      sunset: {
        bg: 'rgba(76, 5, 25, 0.95)',
        border: 'rgba(244, 63, 94, 0.2)',
        panel: 'rgba(88, 17, 34, 0.95)',
        panelBorder: 'rgba(244, 63, 94, 0.2)',
        canvasBg: '#4c0519',
        canvasDot: '#9f1239',
        textMain: '#ffffff',
        textMuted: '#94a3b8'
      },
      purple: {
        bg: 'rgba(59, 7, 100, 0.95)',
        border: 'rgba(168, 85, 247, 0.2)',
        panel: 'rgba(76, 17, 118, 0.95)',
        panelBorder: 'rgba(168, 85, 247, 0.2)',
        canvasBg: '#3b0764',
        canvasDot: '#7e22ce',
        textMain: '#ffffff',
        textMuted: '#94a3b8'
      },
      pitchblack: {
        bg: 'rgba(0, 0, 0, 0.95)',
        border: 'rgba(38, 38, 38, 0.5)',
        panel: 'rgba(10, 10, 10, 0.95)',
        panelBorder: 'rgba(38, 38, 38, 0.5)',
        canvasBg: '#000000',
        canvasDot: '#262626',
        textMain: '#ffffff',
        textMuted: '#a3a3a3'
      },
    };

    const accent = accentColors[themeSettings.accent] || accentColors.indigo;
    const frame = frameColors[themeSettings.theme] || frameColors.dark;

    root.style.setProperty('--accent-500', accent[500]);
    root.style.setProperty('--accent-600', accent[600]);
    root.style.setProperty('--frame-bg', frame.bg);
    root.style.setProperty('--frame-border', frame.border);
    root.style.setProperty('--panel-bg', frame.panel);
    root.style.setProperty('--panel-border', frame.panelBorder);
    root.style.setProperty('--canvas-bg', frame.canvasBg);
    root.style.setProperty('--canvas-dot', frame.canvasDot);
    root.style.setProperty('--text-main', frame.textMain || '#ffffff');
    root.style.setProperty('--text-muted', frame.textMuted || '#94a3b8');
  }, [themeSettings]);

  const currentTheme = themes[themeSettings.theme] || themes.dark;

  return (
    <div className={`h-screen w-screen flex flex-col bg-gradient-to-br ${currentTheme} overflow-hidden`}>
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {activeView === 'kanban' && <KanbanBoard />}
          {activeView === 'notes' && <NotesApp />}
          {activeView === 'projects' && <ProjectCanvas />}
          {activeView === 'settings' && (
            <Settings
              currentTheme={themeSettings}
              onThemeChange={setThemeSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
