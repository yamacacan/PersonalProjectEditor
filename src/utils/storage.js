// Storage utility - IPC ile Electron main process ile iletişim kurar

export const loadKanbanData = async () => {
  if (window.electronAPI) {
    try {
      const data = await window.electronAPI.loadKanbanData();
      return data;
    } catch (error) {
      console.error('Error loading kanban data:', error);
      return {
        columns: {
          todo: [],
          doing: [],
          done: []
        }
      };
    }
  }
  // Fallback for browser testing
  const saved = localStorage.getItem('kanban-data');
  return saved ? JSON.parse(saved) : {
    columns: {
      todo: [],
      doing: [],
      done: []
    }
  };
};

export const saveKanbanData = async (data) => {
  if (window.electronAPI) {
    try {
      await window.electronAPI.saveKanbanData(data);
      return true;
    } catch (error) {
      console.error('Error saving kanban data:', error);
      return false;
    }
  }
  // Fallback for browser testing
  try {
    localStorage.setItem('kanban-data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const saveImage = async (base64Data, filename) => {
  if (window.electronAPI) {
    try {
      const savedFilename = await window.electronAPI.saveImage(base64Data, filename);
      return savedFilename;
    } catch (error) {
      console.error('Error saving image:', error);
      return null;
    }
  }
  // Fallback for browser - base64 olarak döndür
  return base64Data;
};

export const loadImage = async (filename) => {
  if (window.electronAPI) {
    try {
      const base64Data = await window.electronAPI.loadImage(filename);
      return base64Data;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }
  // Fallback for browser - filename zaten base64 string
  return filename;
};

export const deleteImage = async (filename) => {
  if (window.electronAPI) {
    try {
      await window.electronAPI.deleteImage(filename);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
  return true;
};

export const loadNotesData = async () => {
  if (window.electronAPI) {
    try {
      const data = await window.electronAPI.loadNotesData();
      return data;
    } catch (error) {
      console.error('Error loading notes data:', error);
      return null;
    }
  }
  // Fallback for browser testing
  const saved = localStorage.getItem('notes-data');
  return saved ? JSON.parse(saved) : null;
};

export const saveNotesData = async (data) => {
  if (window.electronAPI) {
    try {
      await window.electronAPI.saveNotesData(data);
      return true;
    } catch (error) {
      console.error('Error saving notes data:', error);
      return false;
    }
  }
  // Fallback for browser testing
  try {
    localStorage.setItem('notes-data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadProjectManagementData = async () => {
  if (window.electronAPI && window.electronAPI.loadProjectManagementData) {
    try {
      return await window.electronAPI.loadProjectManagementData();
    } catch (error) {
      console.error('Error loading project management data:', error);
      return null;
    }
  }
  const saved = localStorage.getItem('project-management-data');
  return saved ? JSON.parse(saved) : null;
};

export const saveProjectManagementData = async (data) => {
  if (window.electronAPI && window.electronAPI.saveProjectManagementData) {
    try {
      await window.electronAPI.saveProjectManagementData(data);
      return true;
    } catch (error) {
      console.error('Error saving project management data:', error);
      return false;
    }
  }
  try {
    localStorage.setItem('project-management-data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};
