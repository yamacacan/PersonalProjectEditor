import { app, BrowserWindow, ipcMain, nativeImage, Menu, shell } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// App name
app.setName('Kanban Board');

let mainWindow;

// Icon path
function getIconPath() {
  if (process.platform === 'win32') {
    return join(__dirname, '../build/icon.ico');
  } else if (process.platform === 'darwin') {
    return join(__dirname, '../build/icon.icns');
  } else {
    return join(__dirname, '../build/icon.png');
  }
}

const userDataPath = app.getPath('userData');
const dataDir = join(userDataPath, 'appData');
const dataFile = join(dataDir, 'kanban-data.json');
const notesFile = join(dataDir, 'notes-data.json');
const imagesDir = join(dataDir, 'images');

// Veri dosyasını oluştur
async function ensureDataFile() {
  try {
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }
    if (!existsSync(dataFile)) {
      await writeFile(dataFile, JSON.stringify({
        columns: {
          'todo': [],
          'doing': [],
          'done': []
        }
      }, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

// Veriyi yükle
async function loadData() {
  try {
    await ensureDataFile();
    const data = await readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      columns: {
        'todo': [],
        'doing': [],
        'done': []
      }
    };
  }
}

// Veriyi kaydet
async function saveData(data) {
  try {
    await ensureDataFile();
    await writeFile(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

// Resmi kaydet
async function saveImage(base64Data, filename) {
  try {
    await ensureDataFile();

    // Base64 prefix'i kaldır (data:image/png;base64,)
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    const imagePath = join(imagesDir, filename);
    await writeFile(imagePath, buffer);

    return filename; // Sadece dosya adını döndür
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

// Resmi yükle
async function loadImage(filename) {
  try {
    if (!filename) return null;

    const imagePath = join(imagesDir, filename);
    if (!existsSync(imagePath)) {
      console.warn('Image not found:', filename);
      return null;
    }

    const buffer = await readFile(imagePath);
    const base64 = buffer.toString('base64');

    // Dosya uzantısından MIME type'ı belirle
    const ext = filename.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
        ext === 'gif' ? 'image/gif' :
          ext === 'webp' ? 'image/webp' : 'image/png';

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

// Resmi sil
async function deleteImage(filename) {
  try {
    if (!filename) return true;

    const imagePath = join(imagesDir, filename);
    if (existsSync(imagePath)) {
      await unlink(imagePath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

function createWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Kanban Board',
    icon: existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0f172a',
    show: false, // Hazır olana kadar gösterme
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
    // Modern pencere stilleri
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: false,

  });

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  // Pencere başlığını ayarla
  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
  });
}

app.whenReady().then(() => {
  // Menüyü kaldır (sadece production'da)
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('load-kanban-data', async () => {
  return await loadData();
});

ipcMain.handle('save-kanban-data', async (event, data) => {
  return await saveData(data);
});

ipcMain.handle('save-image', async (event, base64Data, filename) => {
  return await saveImage(base64Data, filename);
});

ipcMain.handle('load-image', async (event, filename) => {
  return await loadImage(filename);
});

ipcMain.handle('delete-image', async (event, filename) => {
  return await deleteImage(filename);
});

// Notes IPC Handlers
ipcMain.handle('load-notes-data', async () => {
  try {
    await ensureDataFile();
    if (existsSync(notesFile)) {
      const data = await readFile(notesFile, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading notes data:', error);
    return null;
  }
});

ipcMain.handle('save-notes-data', async (event, data) => {
  try {
    await ensureDataFile();
    await writeFile(notesFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving notes data:', error);
    return false;
  }
});

// Dosyayı sistem varsayılan uygulamasıyla aç
ipcMain.handle('open-file-with-system-app', async (event, base64Data, filename) => {
  try {
    // Geçici dosya yolunu oluştur
    const tempDir = join(tmpdir(), 'kanban-temp-files');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Base64'ten buffer'a dönüştür
    const base64String = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    // Geçici dosyayı kaydet
    const tempFilePath = join(tempDir, filename);
    await writeFile(tempFilePath, buffer);

    // Sistem varsayılan uygulamasıyla aç
    await shell.openPath(tempFilePath);

    return true;
  } catch (error) {
    console.error('Error opening file with system app:', error);
    throw error;
  }
});

// Window Control IPC Handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

