<div align="center">

# 🎯 Personal Project Editor

<p align="center">
  <img src="build/icon.svg" width="120" alt="Personal Project Editor Logo" />
</p>

### Modern, Şık ve Güçlü Bir Kişisel Proje Yönetim Aracı

[![Electron](https://img.shields.io/badge/Electron-28.x-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <strong>Electron + Vite + React + Tailwind CSS</strong> ile geliştirilmiştir.
</p>

---

</div>

## 📸 Ekran Görüntüleri

<div align="center">
  <img src="readmeassets/kanban.png" alt="Kanban Board" width="80%" />
  <p><em>📋 Kanban Board - Görevlerinizi kolayca yönetin</em></p>
  
  <br/>
  
  <img src="readmeassets/noteeditör.png" alt="Not Editörü" width="80%" />
  <p><em>📝 Zengin Metin Editörü - Notlarınızı şık bir şekilde yazın</em></p>
</div>

---

## ✨ Özellikler

<table>
  <tr>
    <td width="50%">
      <h3>� Kanban Board</h3>
      <ul>
        <li>Sürükle & Bırak ile kart yönetimi</li>
        <li>Renkli etiketler ve kategoriler</li>
        <li>Öncelik seviyeleri (Düşük, Orta, Yüksek)</li>
        <li>Kart detay modalı</li>
        <li>Yapılacaklar listesi</li>
        <li>Kart resim ekleme</li>
        <li>🗑️ Çöp kutusu drop zone</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📝 Not Defteri</h3>
      <ul>
        <li>Zengin metin editörü (Quill)</li>
        <li>Başlık, kalın, italik formatlar</li>
        <li>Listeler ve numaralı listeler</li>
        <li>Kod blokları</li>
        <li>Otomatik kaydetme</li>
        <li>Şık karanlık tema</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🏗️ Mimari Kanvas</h3>
      <ul>
        <li>Şekil ekleme (Dikdörtgen, Daire, vb.)</li>
        <li>Bağlantı çizgileri</li>
        <li>Sürükle & Bırak düzenleme</li>
        <li>Zoom ve pan kontrolü</li>
        <li>Kopyala & Yapıştır</li>
        <li>Sağ tık menüsü</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎨 Tema Sistemi</h3>
      <ul>
        <li>6 Farklı tema seçeneği</li>
        <li>8 Vurgu rengi</li>
        <li>Dinamik frame renkleri</li>
        <li>Custom title bar</li>
        <li>Collapsible sidebar</li>
        <li>LocalStorage ile kalıcı ayarlar</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/yamacacan/PersonalProjectEditor.git

# Proje dizinine gidin
cd PersonalProjectEditor

# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run electron:dev
```

## 📦 Production Build

```bash
# Windows için build
npm run electron:build:win

# macOS için build
npm run electron:build:mac

# Linux için build
npm run electron:build:linux
```

> 📁 Build dosyaları `release/` klasöründe oluşturulur.

---

## 🛠️ Teknolojiler

<div align="center">

| Teknoloji | Versiyon | Açıklama |
|:---------:|:--------:|:---------|
| ![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white) | 28.x | Masaüstü uygulama framework'ü |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | 18.x | UI kütüphanesi |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 5.x | Build tool |
| ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 3.x | CSS framework |
| ![electron-builder](https://img.shields.io/badge/Builder-1B1F23?style=flat-square&logo=electron&logoColor=white) | 24.x | Paketleme aracı |

</div>

---

## 📁 Proje Yapısı

```
PersonalProjectEditor/
├── 📁 build/               # Build kaynakları ve ikonlar
├── 📁 electron/
│   ├── main.js            # Electron ana süreç
│   └── preload.js         # IPC köprüsü
├── 📁 src/
│   ├── 📁 components/
│   │   ├── KanbanBoard.jsx    # Kanban panosu
│   │   ├── NoteEditor.jsx     # Not editörü
│   │   ├── ProjectCanvas.jsx  # Mimari kanvas
│   │   ├── Settings.jsx       # Ayarlar sayfası
│   │   ├── TitleBar.jsx       # Custom title bar
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   └── Trashhold.jsx      # Çöp kutusu drop zone
│   ├── 📁 utils/
│   │   └── storage.js     # Veri yönetimi
│   ├── App.jsx
│   └── index.css
├── 📁 readmeassets/       # README görselleri
└── 📄 README.md
```

---

## 💾 Veri Saklama

Veriler kullanıcının `userData` dizininde güvenle saklanır:

| Platform | Konum |
|----------|-------|
| 🪟 Windows | `%APPDATA%/kanban-app/appData/` |
| 🍎 macOS | `~/Library/Application Support/kanban-app/appData/` |
| 🐧 Linux | `~/.config/kanban-app/appData/` |

---

## 🎨 Tema Seçenekleri

<div align="center">

| Tema | Görünüm |
|:----:|:-------:|
| 🌑 Koyu | Slate tonları, klasik karanlık tema |
| 🌙 Gece Mavisi | İndigo vurgulu, gece havası |
| 🌊 Okyanus | Cyan tonları, ferah okyanus teması |
| 🌲 Orman | Yeşil tonlar, doğal orman teması |
| 🌅 Gün Batımı | Kırmızı tonlar, sıcak gün batımı |
| 💜 Mor Rüya | Mor tonları, şık ve modern |

</div>

---

## 👤 Geliştirici

<div align="center">
  
### Ahmet Can Yamaç

[![Email](https://img.shields.io/badge/Email-yamacahmetcan@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:yamacahmetcan@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-yamacacan-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yamacacan)

</div>

---

## 📝 Lisans

Bu proje **MIT License** altında lisanslanmıştır.

---

<div align="center">

### ⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

<br/>

**Personal Project Editor** ile projelerinizi organize edin! 🚀

<br/>

*© 2026 Ahmet Can Yamaç. Tüm hakları saklıdır.*

</div>
