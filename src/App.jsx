import React, { useState } from 'react';
import Navigation from './components/Navigation';
import KanbanBoard from './components/KanbanBoard';
import NotesApp from './components/Notes/NotesApp';
import ProjectCanvas from './components/ProjectManagement/ProjectCanvas';

function App() {
  const [activeView, setActiveView] = useState('kanban');

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Navigation */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'kanban' && <KanbanBoard />}
        {activeView === 'notes' && <NotesApp />}
        {activeView === 'projects' && <ProjectCanvas />}
      </div>
    </div>
  );
}

export default App;
