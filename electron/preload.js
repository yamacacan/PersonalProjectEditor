import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  loadKanbanData: () => ipcRenderer.invoke('load-kanban-data'),
  saveKanbanData: (data) => ipcRenderer.invoke('save-kanban-data', data),
  saveImage: (base64Data, filename) => ipcRenderer.invoke('save-image', base64Data, filename),
  loadImage: (filename) => ipcRenderer.invoke('load-image', filename),
  deleteImage: (filename) => ipcRenderer.invoke('delete-image', filename),
  loadNotesData: () => ipcRenderer.invoke('load-notes-data'),
  saveNotesData: (data) => ipcRenderer.invoke('save-notes-data', data),
});

