/**
 * Implementasi algoritma KMeans untuk clustering warna
 */

class KMeans {
    constructor(k = 5, maxIterations = 10) {
        this.k = k; // Jumlah cluster (warna dominan)
        this.maxIterations = maxIterations;
    }

    /**
     * Ekstrak data piksel dari gambar
     * @param {ImageData} imageData - Data gambar dari canvas
     * @returns {Array} - Array piksel [r, g, b]
     */
    extractPixels(imageData) {
        const pixels = [];
        const data = imageData.data;
        
        // Sampel piksel untuk meningkatkan performa
        // Ambil 1 dari setiap 5 piksel untuk gambar besar
        const sampleRate = Math.max(1, Math.floor(Math.sqrt(imageData.width * imageData.height) / 100));
        
        for (let i = 0; i < data.length; i += 4 * sampleRate) {
            // Lewati piksel transparan
            if (data[i + 3] < 128) continue;
            
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        
        return pixels;
    }

    /**
     * Inisialisasi centroid secara acak
     * @param {Array} pixels - Array piksel
     * @returns {Array} - Array centroid
     */
    initCentroids(pixels) {
        const centroids = [];
        const pixelCount = pixels.length;
        
        // Gunakan metode k-means++ untuk inisialisasi yang lebih baik
        // Pilih centroid pertama secara acak
        const firstIndex = Math.floor(Math.random() * pixelCount);
        centroids.push(pixels[firstIndex]);
        
        // Pilih centroid lainnya berdasarkan probabilitas jarak
        for (let i = 1; i < this.k; i++) {
            const distances = pixels.map(pixel => {
                return Math.min(...centroids.map(centroid => this.distance(pixel, centroid)));
            });
            
            const sum = distances.reduce((a, b) => a + b, 0);
            const probabilities = distances.map(d => d / sum);
            
            let cumulativeProbability = 0;
            const random = Math.random();
            
            for (let j = 0; j < pixelCount; j++) {
                cumulativeProbability += probabilities[j];
                if (cumulativeProbability > random) {
                    centroids.push(pixels[j]);
                    break;
                }
            }
        }
        
        return centroids;
    }

    /**
     * Hitung jarak Euclidean antara dua warna
     * @param {Array} color1 - Warna pertama [r, g, b]
     * @param {Array} color2 - Warna kedua [r, g, b]
     * @returns {number} - Jarak
     */
    distance(color1, color2) {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    /**
     * Tetapkan piksel ke cluster terdekat
     * @param {Array} pixels - Array piksel
     * @param {Array} centroids - Array centroid
     * @returns {Array} - Array cluster
     */
    assignClusters(pixels, centroids) {
        return pixels.map(pixel => {
            const distances = centroids.map(centroid => this.distance(pixel, centroid));
            return distances.indexOf(Math.min(...distances));
        });
    }

    /**
     * Perbarui posisi centroid
     * @param {Array} pixels - Array piksel
     * @param {Array} clusters - Array cluster
     * @param {Array} centroids - Array centroid
     * @returns {Array} - Array centroid baru
     */
    updateCentroids(pixels, clusters, centroids) {
        const newCentroids = Array(this.k).fill().map(() => [0, 0, 0]);
        const counts = Array(this.k).fill(0);
        
        // Hitung jumlah dan total untuk setiap cluster
        for (let i = 0; i < pixels.length; i++) {
            const cluster = clusters[i];
            const pixel = pixels[i];
            
            newCentroids[cluster][0] += pixel[0];
            newCentroids[cluster][1] += pixel[1];
            newCentroids[cluster][2] += pixel[2];
            counts[cluster]++;
        }
        
        // Hitung rata-rata untuk setiap cluster
        for (let i = 0; i < this.k; i++) {
            if (counts[i] === 0) {
                // Jika cluster kosong, pertahankan centroid lama
                newCentroids[i] = centroids[i];
            } else {
                newCentroids[i][0] = Math.round(newCentroids[i][0] / counts[i]);
                newCentroids[i][1] = Math.round(newCentroids[i][1] / counts[i]);
                newCentroids[i][2] = Math.round(newCentroids[i][2] / counts[i]);
            }
        }
        
        return newCentroids;
    }

    /**
     * Hitung ukuran cluster
     * @param {Array} clusters - Array cluster
     * @returns {Array} - Array ukuran cluster
     */
    getClusterSizes(clusters) {
        const counts = Array(this.k).fill(0);
        
        for (let i = 0; i < clusters.length; i++) {
            counts[clusters[i]]++;
        }
        
        return counts;
    }

    /**
     * Jalankan algoritma KMeans
     * @param {ImageData} imageData - Data gambar dari canvas
     * @returns {Array} - Array warna dominan dengan ukuran cluster
     */
    run(imageData) {
        const pixels = this.extractPixels(imageData);
        
        if (pixels.length === 0) {
            return [];
        }
        
        // Jika jumlah piksel kurang dari k, kembalikan piksel yang ada
        if (pixels.length <= this.k) {
            return pixels.map(pixel => ({
                color: pixel,
                size: 1
            }));
        }
        
        let centroids = this.initCentroids(pixels);
        let clusters;
        
        // Iterasi algoritma KMeans
        for (let i = 0; i < this.maxIterations; i++) {
            clusters = this.assignClusters(pixels, centroids);
            const newCentroids = this.updateCentroids(pixels, clusters, centroids);
            
            // Periksa konvergensi
            let converged = true;
            for (let j = 0; j < this.k; j++) {
                if (this.distance(centroids[j], newCentroids[j]) > 1) {
                    converged = false;
                    break;
                }
            }
            
            centroids = newCentroids;
            
            if (converged) break;
        }
        
        // Hitung ukuran cluster
        const clusterSizes = this.getClusterSizes(clusters);
        
        // Buat hasil dengan warna dan ukuran
        const result = centroids.map((color, i) => ({
            color,
            size: clusterSizes[i]
        }));
        
        // Urutkan berdasarkan ukuran (dari terbesar ke terkecil)
        return result.sort((a, b) => b.size - a.size);
    }

    /**
     * Konversi RGB ke HEX
     * @param {Array} rgb - Warna RGB [r, g, b]
     * @returns {string} - Warna HEX
     */
    static rgbToHex(rgb) {
        return '#' + rgb.map(x => {
            const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Format RGB untuk tampilan
     * @param {Array} rgb - Warna RGB [r, g, b]
     * @returns {string} - String RGB
     */
    static formatRgb(rgb) {
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
}