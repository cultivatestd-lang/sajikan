
  # Recipe Search App Design

  This is a code bundle for Recipe Search App Design. The original project is available at https://www.figma.com/design/5tad2iqoYzfMAZWyxUeP5Z/Recipe-Search-App-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Mengimpor data resep Dapur Umami

1. Simpan file JSON line-delimited dari Dapur Umami ke `src/dapurumami-com-2025-11-26 (1).json` atau berikan pathnya saat menjalankan skrip.
2. Jalankan `npm run scrape:dapurumami` untuk mengubah data tersebut menjadi `src/data/recipes-scraped.ts`.
3. Jalankan ulang dev server bila sudah berjalan agar perubahan data termuat.

### Dokumentasi API scraper (`scripts/generate-dapurumami-recipes.cjs`)

| Endpoint | Deskripsi |
| --- | --- |
| `node scripts/generate-dapurumami-recipes.cjs [sumber.json] [target.ts]` | Membaca setiap baris JSON (hasil web scraper) dan menghasilkan array `scrapedRecipes` bertipe `Recipe`. Argumen bersifat opsional; jika tidak diisi, path default pada poin di atas dipakai. |

Detail proses:

1. **Pembacaan sumber** – Setiap baris pada file sumber diparsing sebagai JSON dan dikoleksi (lihat fungsi `readSource`).
2. **Transformasi** – `transformEntry` mendeteksi brand/kategori, membuat deskripsi singkat, mengestimasi waktu memasak, serta menulis langkah/ingredient placeholder agar konsisten.
3. **Penulisan target** – `writeTarget` menghasilkan file TypeScript dengan guard `"// Auto-generated ..."` yang kemudian diimpor oleh `src/data/recipes.ts`.

Output mengikuti bentuk `Recipe` (`src/types/recipe.ts`) sehingga langsung kompatibel dengan mesin pencari. Jalankan perintah ini kapan pun ingin memperbarui data Dapur Umami.

## Mesin pencarian (TF-IDF + Cosine dengan Sastrawi)

File utama: `src/lib/searchEngine.ts`. Pipeline lengkapnya:

1. **Normalisasi & Tokenisasi** – Fungsi `normalizeText` dan `tokenize` menghapus aksen, karakter non alfa-numerik, stopword Sastrawi (`src/lib/sastrawiStopwords.ts`), lalu melakukan stemming ala Sastrawi (helper `stemSastrawi`).
2. **Pembobotan Dokumen** – `getDocumentText` menyusun string gabungan (judul 3x, bahan 2x, deskripsi + langkah 1x) untuk memberi bobot ekstra pada informasi penting.
3. **Training TF-IDF** – Pada konstruktor, `train()` menghitung vocabulary, IDF (`log(N / (df + 1))`), dan vektor TF-IDF untuk tiap resep.
4. **Pencarian** – `search(query)`:
   - Mengubah kueri menjadi vektor TF-IDF.
   - Menghitung cosine similarity setiap dokumen via `calculateCosineSimilarity`.
   - Menyaring hasil dengan `pickPrimaryKeyword` agar hanya judul yang mengandung kata kunci utama yang ditampilkan.
   - Mengurutkan hasil secara desc dan menyertakan `score` (nilai cosine) agar UI bisa menampilkan ranking.

Skor similarity tertinggi juga ditampilkan sebagai badge melayang di UI (`App.tsx`). Jika menambah dependensi lain, jalankan `npm install` kembali sebelum `npm run dev`.
  # sajikan
