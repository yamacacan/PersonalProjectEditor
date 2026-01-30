# 🗂️ Kanban Board

Modern, şık ve kullanımı kolay bir masaüstü Kanban uygulaması.

**Electron + Vite + React + Tailwind CSS** ile geliştirilmiştir.

![Kanban Board](build/icon.svg)

## ✨ Özellikler

- 📋 **Sürükle & Bırak**: Kartları kolonlar arasında kolayca taşıyın
- 🏷️ **Renkli Etiketler**: Kartlarınızı kategorilere ayırın
- 👤 **Kişi Atama**: Görevleri takım üyelerine atayın
- 🎯 **Öncelik Seviyeleri**: Düşük, Orta, Yüksek öncelik
- 📅 **Tarih Seçici**: Güzel tasarlanmış tarih seçici
- 💾 **Otomatik Kayıt**: Veriler JSON dosyasında saklanır
- 🌙 **Koyu Tema**: Göz yormayan modern tasarım
- 📱 **Responsive**: Her ekran boyutuna uyumlu

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run electron:dev
```

## 📦 Production Build

### 1. İkon Hazırlığı

Önce uygulama ikonunu hazırlayın:

1. `build/icon.svg` dosyasını açın
2. [CloudConvert](https://cloudconvert.com/svg-to-png) ile 512x512 PNG'ye dönüştürün
3. PNG'yi şu formatlara dönüştürün:
   - **Windows**: [ICO Converter](https://www.icoconverter.com/) → `build/icon.ico`
   - **macOS**: [iConvert](https://iconverticons.com/online/) → `build/icon.icns`
   - **Linux**: PNG dosyasını `build/icon.png` olarak kaydedin

### 2. Build Komutları

```bash
# Tüm platformlar için build
npm run electron:build

# Sadece Windows için
npm run electron:build:win

# Sadece macOS için
npm run electron:build:mac

# Sadece Linux için
npm run electron:build:linux
```

Build dosyaları `release/` klasöründe oluşturulur:
- **Windows**: `.exe` (installer) ve portable `.exe`
- **macOS**: `.dmg` ve `.zip`
- **Linux**: `.AppImage` ve `.deb`

## 📁 Proje Yapısı

```
kanban/
├── build/                  # Build kaynakları ve ikonlar
│   ├── icon.svg           # Kaynak ikon
│   ├── icon.ico           # Windows ikonu
│   ├── icon.icns          # macOS ikonu
│   └── icon.png           # Linux ikonu
├── electron/
│   ├── main.js            # Electron ana süreç
│   └── preload.js         # IPC köprüsü
├── src/
│   ├── components/
│   │   ├── AddColumnModal.jsx
│   │   ├── Card.jsx
│   │   ├── CardDetailModal.jsx
│   │   ├── Column.jsx
│   │   └── DatePicker.jsx
│   ├── utils/
│   │   └── storage.js     # Veri yönetimi
│   ├── App.jsx
│   ├── index.css          # Tailwind CSS
│   └── main.jsx
├── release/               # Build çıktıları
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🛠️ Teknolojiler

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Electron | 28.x | Masaüstü uygulama framework'ü |
| React | 18.x | UI kütüphanesi |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | CSS framework |
| electron-builder | 24.x | Paketleme aracı |

## 💾 Veri Saklama

Veriler kullanıcının `userData` dizininde saklanır:

- **Windows**: `%APPDATA%/kanban-app/appData/kanban-data.json`
- **macOS**: `~/Library/Application Support/kanban-app/appData/kanban-data.json`
- **Linux**: `~/.config/kanban-app/appData/kanban-data.json`

## 📝 Lisans

MIT License - Dilediğiniz gibi kullanabilirsiniz.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

**Kanban Board** ile görevlerinizi organize edin! 🚀
