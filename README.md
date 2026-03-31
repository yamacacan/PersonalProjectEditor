<div align="center">

# 🎯 Personal Project Editor

<p align="center">
  <img src="build/icon.svg" width="120" alt="Personal Project Editor Logo" />
</p>

### A Modern, Elegant and Powerful Personal Project Management Tool

[![Electron](https://img.shields.io/badge/Electron-28.x-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <strong>Built with Electron + Vite + React + Tailwind CSS</strong>
</p>

---

</div>

## 📸 Screenshots

<div align="center">
  <img src="readmeassets/kanban.png" alt="Kanban Board" width="80%" />
  <p><em>📋 Kanban Board - Easily manage your tasks</em></p>
  
  <br/>
  
  <img src="readmeassets/noteeditör.png" alt="Note Editor" width="80%" />
  <p><em>📝 Rich Text Editor - Write your notes in style</em></p>
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📋 Kanban Board</h3>
      <ul>
        <li>Drag & Drop card management</li>
        <li>Colorful labels and categories</li>
        <li>Priority levels (Low, Medium, High)</li>
        <li>Card detail modal</li>
        <li>To-do lists</li>
        <li>Card image attachment</li>
        <li>🗑️ Trash bin drop zone</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📝 Notebook</h3>
      <ul>
        <li>Rich text editor (Quill)</li>
        <li>Heading, bold, italic formatting</li>
        <li>Bullet and numbered lists</li>
        <li>Code blocks</li>
        <li>Auto-save</li>
        <li>Elegant dark theme</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🏗️ Architecture Canvas</h3>
      <ul>
        <li>Shape insertion (Rectangle, Circle, etc.)</li>
        <li>Connection lines</li>
        <li>Drag & Drop editing</li>
        <li>Zoom and pan controls</li>
        <li>Copy & Paste</li>
        <li>Right-click context menu</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎨 Theme System</h3>
      <ul>
        <li>6 Different theme options</li>
        <li>8 Accent colors</li>
        <li>Dynamic frame colors</li>
        <li>Custom title bar</li>
        <li>Collapsible sidebar</li>
        <li>Persistent settings with LocalStorage</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yamacacan/PersonalProjectEditor.git

# Navigate to the project directory
cd PersonalProjectEditor

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

## 📦 Production Build

```bash
# Build for Windows
npm run electron:build:win

# Build for macOS
npm run electron:build:mac

# Build for Linux
npm run electron:build:linux
```

> 📁 Build files are generated in the `release/` folder.

---

## 🛠️ Technologies

<div align="center">

| Technology | Version | Description |
|:---------:|:--------:|:-----------|
| ![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white) | 28.x | Desktop application framework |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | 18.x | UI library |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 5.x | Build tool |
| ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 3.x | CSS framework |
| ![electron-builder](https://img.shields.io/badge/Builder-1B1F23?style=flat-square&logo=electron&logoColor=white) | 24.x | Packaging tool |

</div>

---

## 📁 Project Structure

```
PersonalProjectEditor/
├── 📁 build/               # Build resources and icons if you want to change them
├── 📁 electron/
│   ├── main.js            # Electron main process
│   └── preload.js         # IPC bridge
├── 📁 src/
│   ├── 📁 components/
│   │   ├── KanbanBoard.jsx    # Kanban board
│   │   ├── NoteEditor.jsx     # Note editor
│   │   ├── ProjectCanvas.jsx  # Architecture canvas
│   │   ├── Settings.jsx       # Settings page
│   │   ├── TitleBar.jsx       # Custom title bar
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   └── Trashhold.jsx      # Trash bin drop zone
│   ├── 📁 utils/
│   │   └── storage.js     # Data management
│   ├── App.jsx
│   └── index.css
├── 📁 readmeassets/       # README assets
└── 📄 README.md
```

---

## 💾 Data Storage

Data is safely stored in the user's `userData` directory:

| Platform | Location |
|----------|----------|
| 🪟 Windows | `%APPDATA%/kanban-app/appData/` |
| 🍎 macOS | `~/Library/Application Support/kanban-app/appData/` |
| 🐧 Linux | `~/.config/kanban-app/appData/` |

---

## 🎨 Theme Options

<div align="center">

| Theme | Appearance |
|:-----:|:----------:|
| 🌑 Dark | Slate tones, classic dark theme |
| 🌙 Night Blue | Indigo accent, night atmosphere |
| 🌊 Ocean | Cyan tones, refreshing ocean theme |
| 🌲 Forest | Green tones, natural forest theme |
| 🌅 Sunset | Red tones, warm sunset |
| 💜 Purple Dream | Purple tones, elegant and modern |

</div>

---

## 👤 Developer

<div align="center">
  
### Ahmet Can Yamaç

[![Email](https://img.shields.io/badge/Email-yamacahmetcan@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:yamacahmetcan@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-yamacacan-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yamacacan)

</div>


<div align="center">

### ⭐ Don't forget to star this project if you liked it!

<br/>

Organize your projects with **Personal Project Editor**! 🚀

<br/>

*© 2026 Ahmet Can Yamaç. All rights reserved.*

</div>
