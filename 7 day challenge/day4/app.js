/**
 * Color Snatcher - Aplikasi untuk mendeteksi warna dominan dari gambar
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const uploadArea = document.getElementById('upload-area');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const resultSection = document.getElementById('result-section');
    const previewImage = document.getElementById('preview-image');
    const colorPalette = document.getElementById('color-palette');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const savePaletteBtn = document.getElementById('save-palette-btn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');

    // Variabel untuk menyimpan warna dominan
    let dominantColors = [];

    // Event listeners untuk unggah gambar
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Event listener untuk drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload();
        }
    });
    
    uploadArea.addEventListener('click', () => fileInput.click());

    // Event listener untuk tombol salin semua warna
    copyAllBtn.addEventListener('click', copyAllColors);
    
    // Event listener untuk tombol simpan palet
    savePaletteBtn.addEventListener('click', savePalette);

    /**
     * Menangani unggahan file gambar
     */
    function handleFileUpload() {
        const file = fileInput.files[0];
        
        if (!file) return;
        
        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            showNotification('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau BMP.');
            return;
        }
        
        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Ukuran file terlalu besar. Maksimum 5MB.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Tampilkan gambar preview
            previewImage.src = e.target.result;
            
            // Proses gambar setelah dimuat
            previewImage.onload = () => {
                processImage(previewImage);
                resultSection.style.display = 'grid';
            };
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Memproses gambar untuk mendapatkan warna dominan
     * @param {HTMLImageElement} image - Elemen gambar
     */
    function processImage(image) {
        // Buat canvas untuk memproses gambar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Atur ukuran canvas
        // Batasi ukuran untuk performa yang lebih baik
        const maxDimension = 500;
        let width = image.width;
        let height = image.height;
        
        if (width > height && width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
        } else if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Gambar gambar ke canvas
        ctx.drawImage(image, 0, 0, width, height);
        
        // Dapatkan data piksel
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // Gunakan KMeans untuk mendapatkan warna dominan
        const kmeans = new KMeans(5, 10);
        dominantColors = kmeans.run(imageData);
        
        // Tampilkan palet warna
        displayColorPalette(dominantColors);
    }

    /**
     * Menampilkan palet warna dominan
     * @param {Array} colors - Array warna dominan
     */
    function displayColorPalette(colors) {
        // Kosongkan palet warna
        colorPalette.innerHTML = '';
        
        // Tampilkan setiap warna
        colors.forEach((item, index) => {
            const { color } = item;
            const rgb = color;
            const hex = KMeans.rgbToHex(rgb);
            const rgbStr = KMeans.formatRgb(rgb);
            
            // Buat elemen warna
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`;
            
            // Tambahkan swatch warna
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = rgbStr;
            
            // Tambahkan informasi warna
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            
            const colorValues = document.createElement('div');
            colorValues.className = 'color-values';
            
            const hexValue = document.createElement('div');
            hexValue.textContent = hex;
            hexValue.title = 'Klik untuk menyalin nilai HEX';
            hexValue.addEventListener('click', () => copyToClipboard(hex, 'Nilai HEX disalin!'));
            
            const rgbValue = document.createElement('div');
            rgbValue.textContent = rgbStr;
            rgbValue.title = 'Klik untuk menyalin nilai RGB';
            rgbValue.addEventListener('click', () => copyToClipboard(rgbStr, 'Nilai RGB disalin!'));
            
            colorValues.appendChild(hexValue);
            colorValues.appendChild(rgbValue);
            
            // Tambahkan ikon salin
            const copyIcon = document.createElement('i');
            copyIcon.className = 'fas fa-copy copy-icon';
            copyIcon.title = 'Salin warna';
            copyIcon.addEventListener('click', () => copyToClipboard(hex, 'Warna disalin!'));
            
            // Susun elemen
            colorInfo.appendChild(colorValues);
            colorItem.appendChild(colorSwatch);
            colorItem.appendChild(colorInfo);
            colorItem.appendChild(copyIcon);
            
            // Tambahkan ke palet
            colorPalette.appendChild(colorItem);
        });
    }

    /**
     * Menyalin teks ke clipboard
     * @param {string} text - Teks yang akan disalin
     * @param {string} message - Pesan notifikasi
     */
    function copyToClipboard(text, message) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification(message))
            .catch(() => showNotification('Gagal menyalin teks. Coba lagi.'));
    }

    /**
     * Menyalin semua warna ke clipboard
     */
    function copyAllColors() {
        if (dominantColors.length === 0) {
            showNotification('Tidak ada warna untuk disalin.');
            return;
        }
        
        // Format warna untuk disalin
        const hexColors = dominantColors.map(item => KMeans.rgbToHex(item.color));
        const rgbColors = dominantColors.map(item => KMeans.formatRgb(item.color));
        
        const text = [
            '/* Color Snatcher - Palet Warna */',
            'HEX:',
            ...hexColors,
            '',
            'RGB:',
            ...rgbColors
        ].join('\n');
        
        copyToClipboard(text, 'Semua warna disalin!');
    }

    /**
     * Menyimpan palet warna sebagai gambar
     */
    function savePalette() {
        if (dominantColors.length === 0) {
            showNotification('Tidak ada palet untuk disimpan.');
            return;
        }
        
        // Buat canvas untuk palet
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Atur ukuran canvas
        const width = 600;
        const height = 400;
        const swatchHeight = height / dominantColors.length;
        
        canvas.width = width;
        canvas.height = height;
        
        // Isi background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Gambar palet warna
        dominantColors.forEach((item, index) => {
            const { color } = item;
            const rgb = color;
            const hex = KMeans.rgbToHex(rgb);
            const y = index * swatchHeight;
            
            // Gambar swatch warna
            ctx.fillStyle = KMeans.formatRgb(rgb);
            ctx.fillRect(0, y, width, swatchHeight);
            
            // Tambahkan teks warna
            ctx.fillStyle = isLightColor(rgb) ? '#000000' : '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(hex, 20, y + swatchHeight / 2);
            
            // Tambahkan nilai RGB
            ctx.fillText(KMeans.formatRgb(rgb), width - 200, y + swatchHeight / 2);
        });
        
        // Konversi canvas ke gambar dan unduh
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `color-palette-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        
        showNotification('Palet warna disimpan!');
    }

    /**
     * Memeriksa apakah warna termasuk warna terang
     * @param {Array} rgb - Warna RGB [r, g, b]
     * @returns {boolean} - true jika warna terang
     */
    function isLightColor(rgb) {
        // Rumus untuk menghitung kecerahan warna
        // Sumber: https://www.w3.org/TR/AERT/#color-contrast
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        return brightness > 128;
    }

    /**
     * Menampilkan notifikasi
     * @param {string} message - Pesan notifikasi
     */
    function showNotification(message) {
        notificationText.textContent = message;
        notification.classList.add('show');
        
        // Sembunyikan notifikasi setelah 3 detik
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}); // End of DOMContentLoaded