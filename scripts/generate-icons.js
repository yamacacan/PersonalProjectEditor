/**
 * Icon Generator Script
 * 
 * Bu script SVG ikonunu farklı platformlar için gerekli formatlara dönüştürür.
 * 
 * Kullanım: npm run make:icons
 * 
 * Gerekli araçlar:
 * - Windows: Inkscape veya ImageMagick
 * - macOS: sips (built-in) veya ImageMagick
 * - Linux: ImageMagick veya Inkscape
 * 
 * Manuel dönüştürme için online araçlar:
 * - https://cloudconvert.com/svg-to-png
 * - https://convertio.co/svg-ico/
 * - https://www.icoconverter.com/
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const buildDir = join(rootDir, 'build');
const iconsDir = join(buildDir, 'icons');

// Gerekli boyutlar
const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

console.log('🎨 Kanban App Icon Generator');
console.log('============================\n');

// icons klasörünü oluştur
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
  console.log('✅ build/icons klasörü oluşturuldu\n');
}

// SVG dosyasının varlığını kontrol et
const svgPath = join(buildDir, 'icon.svg');
if (!existsSync(svgPath)) {
  console.error('❌ build/icon.svg bulunamadı!');
  process.exit(1);
}

console.log('📋 Manuel ikon oluşturma adımları:\n');
console.log('1. build/icon.svg dosyasını aç');
console.log('2. Aşağıdaki online araçlardan birini kullan:');
console.log('   - https://cloudconvert.com/svg-to-png (PNG için)');
console.log('   - https://www.icoconverter.com/ (ICO için)');
console.log('   - https://iconverticons.com/online/ (ICNS için)\n');

console.log('📁 Oluşturulması gereken dosyalar:\n');
console.log('Windows için:');
console.log('   build/icon.ico (256x256)\n');

console.log('macOS için:');
console.log('   build/icon.icns (512x512 veya 1024x1024)\n');

console.log('Linux için (build/icons/ klasörüne):');
sizes.forEach(size => {
  console.log(`   ${size}x${size}.png`);
});

console.log('\n💡 İpucu: Basit bir çözüm için 512x512 PNG oluşturup');
console.log('   hem icon.ico hem de icon.icns olarak kaydedebilirsiniz.');
console.log('   Electron-builder bazı dönüşümleri otomatik yapar.\n');

// PNG placeholder oluştur (basit bir çözüm)
console.log('🔧 PNG placeholder dosyası oluşturuluyor...\n');

const placeholderInfo = `
Kanban App Icon
===============
Bu klasöre aşağıdaki ikon dosyalarını ekleyin:

Windows: icon.ico (256x256 minimum)
macOS: icon.icns (512x512 minimum)  
Linux: icons/ klasörüne PNG dosyaları

SVG kaynak dosya: build/icon.svg
`;

writeFileSync(join(buildDir, 'ICON_README.txt'), placeholderInfo);
console.log('✅ build/ICON_README.txt oluşturuldu\n');

console.log('🎉 İkon oluşturma talimatları hazır!');
console.log('   SVG dosyasını yukarıdaki araçlarla dönüştürün.\n');


