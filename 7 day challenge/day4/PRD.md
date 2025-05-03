# Product Requirements Document (PRD): Color Snatcher

## Ringkasan Produk
Color Snatcher adalah aplikasi web yang memungkinkan pengguna untuk mendeteksi dan mengekstrak 5 warna dominan dari gambar yang diunggah. Aplikasi ini akan menampilkan palet warna beserta nilai RGB dan HEX dari masing-masing warna, memungkinkan pengguna untuk menyalin nilai warna ke clipboard, dan menyimpan palet warna sebagai gambar.

## Tujuan
- Membantu desainer, seniman, dan pengembang web untuk mengekstrak warna dominan dari gambar referensi
- Menyediakan alat yang mudah digunakan untuk analisis warna dalam gambar
- Memfasilitasi penggunaan warna yang konsisten dalam proyek desain

## Fitur Utama

### 1. Unggah Gambar
- Pengguna dapat mengunggah gambar dari perangkat mereka
- Format yang didukung: JPG, PNG, GIF, BMP
- Ukuran maksimum file: 5MB

### 2. Deteksi Warna Dominan
- Menggunakan algoritma KMeans clustering untuk mengidentifikasi 5 warna paling dominan dalam gambar
- Menampilkan warna dalam bentuk palet visual
- Menampilkan nilai RGB dan HEX untuk setiap warna

### 3. Interaksi dengan Warna
- Pengguna dapat mengklik warna untuk menyalin nilai HEX atau RGB ke clipboard
- Notifikasi visual ketika warna berhasil disalin
- Opsi untuk menyalin semua warna sekaligus dalam format yang dapat digunakan (CSS, JSON, dll)

### 4. Simpan Palet Warna
- Pengguna dapat menyimpan palet warna sebagai gambar PNG
- Opsi untuk menyertakan atau tidak menyertakan nilai warna dalam gambar yang disimpan
- Nama file default: "color-palette-[timestamp].png"

## Antarmuka Pengguna

### Tata Letak
- Header dengan judul aplikasi dan informasi singkat
- Area unggah gambar di bagian atas
- Tampilan gambar yang diunggah di sebelah kiri
- Palet warna dominan di sebelah kanan dengan nilai RGB dan HEX
- Tombol untuk menyalin warna dan menyimpan palet di bawah palet warna

### Responsivitas
- Desain responsif yang bekerja dengan baik di desktop dan perangkat mobile
- Tata letak yang menyesuaikan untuk layar yang lebih kecil (palet warna di bawah gambar pada tampilan mobile)

## Persyaratan Teknis

### Frontend
- HTML5, CSS3, dan JavaScript vanilla
- Penggunaan Canvas API untuk manipulasi gambar
- Implementasi algoritma KMeans untuk clustering warna

### Performa
- Waktu pemrosesan gambar yang cepat (< 3 detik untuk gambar ukuran standar)
- Pengoptimalan untuk mengurangi penggunaan memori saat memproses gambar besar

### Kompatibilitas
- Kompatibel dengan browser modern (Chrome, Firefox, Safari, Edge)
- Tidak memerlukan plugin tambahan

## Metrik Keberhasilan
- Akurasi deteksi warna dominan
- Kecepatan pemrosesan gambar
- Kemudahan penggunaan (diukur melalui umpan balik pengguna)

## Batasan dan Pertimbangan
- Aplikasi berjalan sepenuhnya di sisi klien (tidak memerlukan server backend)
- Privasi pengguna: gambar tidak dikirim ke server mana pun
- Keterbatasan browser dalam memproses gambar yang sangat besar

## Timeline Pengembangan
- Implementasi dasar (unggah gambar, deteksi warna): 1 hari
- Implementasi fitur interaksi (salin ke clipboard): 1 hari
- Implementasi fitur simpan palet: 1 hari
- Pengujian dan penyempurnaan: 1 hari