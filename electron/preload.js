const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  loadKanbanData: () => ipcRenderer.invoke('load-kanban-data'),
  saveKanbanData: (data) => ipcRenderer.invoke('save-kanban-data', data),
  saveImage: (base64Data, filename) => ipcRenderer.invoke('save-image', base64Data, filename),
  loadImage: (filename) => ipcRenderer.invoke('load-image', filename),
  deleteImage: (filename) => ipcRenderer.invoke('delete-image', filename),
  loadNotesData: () => ipcRenderer.invoke('load-notes-data'),
  saveNotesData: (data) => ipcRenderer.invoke('save-notes-data', data),
  openFileWithSystemApp: (base64Data, filename) => ipcRenderer.invoke('open-file-with-system-app', base64Data, filename),
});
