# PROMPT REDESIGN UI/UX PROTOTYPE PROJECT MANJER

Bertindaklah sebagai Senior UI/UX Designer dan Senior Frontend Developer yang berpengalaman merancang aplikasi project management enterprise setara Jira.

Saya sedang membuat **prototype UI Project Manjer**, sebuah aplikasi project management untuk kebutuhan software house. Tugasmu adalah memperbaiki dan menstandarkan seluruh tampilan agar clean, rapi, proporsional, profesional, konsisten, dan nyaman digunakan.

## 1. Teknologi yang wajib digunakan

Gunakan hanya:

- HTML5.
- CSS3 native.
- Vanilla JavaScript.
- SVG untuk ikon jika diperlukan.

**Jangan gunakan React, Vue, Angular, jQuery, Bootstrap, Tailwind CSS, atau framework UI lainnya.** Jangan menambahkan backend, database, API, Laravel, atau teknologi lain yang tidak dibutuhkan untuk prototype.

Pertahankan struktur file dan cara kerja prototype yang sudah ada. Jangan membangun ulang dari nol jika kode saat ini masih dapat diperbaiki.

## 2. Referensi desain

Gunakan Jira sebagai referensi kualitas UI/UX, khususnya dalam hal:

- Hierarki informasi.
- Navigasi sidebar.
- Struktur halaman.
- Tabel dan data grid.
- Issue dan task detail.
- Agile board dan sprint.
- Filter dan toolbar.
- Konsistensi komponen.
- Kepadatan informasi.
- Kemudahan penggunaan untuk pekerjaan sehari-hari.

Jangan menyalin Jira secara persis. Bangun identitas visual Project Manjer sendiri dengan gaya enterprise yang modern dan minimalis.

## 3. Gaya visual

Terapkan tampilan yang:

- Clean dan profesional.
- Memiliki spacing yang konsisten.
- Menggunakan tipografi yang mudah dibaca.
- Memiliki proporsi sidebar, header, tabel, kartu, dan konten yang seimbang.
- Menggunakan warna netral dengan satu warna utama.
- Menghindari dekorasi yang tidak diperlukan.
- Tidak menggunakan terlalu banyak card, shadow, border, atau gradient.
- Memanfaatkan ruang layar secara efisien.
- Memprioritaskan informasi dan fungsi daripada dekorasi.

## 4. Ikon Flaticon, tanpa emoji

Jangan menggunakan emoji dalam bentuk apa pun sebagai ikon, status, navigasi, tombol, atau dekorasi.

Gunakan ikon Flaticon dengan gaya yang konsisten, utamakan SVG. Gunakan ukuran yang proporsional, umumnya 16–20 px untuk ikon kecil dan 20–24 px untuk navigasi.

Jangan mencampur ikon dengan gaya visual berbeda. Jangan mengklaim aset Flaticon sudah terpasang jika belum tersedia. Jika aset belum tersedia, buat daftar ikon yang dibutuhkan atau gunakan SVG yang sesuai dengan lisensinya.

## 5. Layout aplikasi

Standarkan layout utama yang terdiri dari:

**Sidebar**

- Logo dan nama Project Manjer.
- Navigasi berdasarkan kategori.
- Ikon yang konsisten.
- Active state yang jelas.
- Menu bertingkat jika diperlukan.
- Mode collapsed jika sesuai.

**Topbar**

- Breadcrumb atau konteks halaman.
- Search.
- Tombol Create.
- Notification.
- Profil pengguna.

**Main content**

- Page title.
- Deskripsi singkat jika diperlukan.
- Primary action.
- Toolbar, filter, atau tabs.
- Konten utama.
- Pagination jika diperlukan.

Jaga agar setiap halaman memiliki struktur yang konsisten, tetapi tetap menyesuaikan kebutuhan modulnya.

## 6. Standardisasi seluruh halaman

Audit semua halaman prototype yang sudah ada, kemudian rapikan:

- Dashboard.
- Project list dan project detail.
- Issue dan task management.
- Agile board dan sprint.
- Backlog.
- Timeline dan roadmap.
- Calendar.
- Reports dan analytics.
- Service Desk.
- People dan resource management.
- Settings dan administration.

Kerjakan hanya halaman yang benar-benar tersedia. Jangan membuat menu atau halaman baru yang tidak diminta.

Tabel harus mudah dipindai, board harus proporsional, form harus ringkas, dan detail issue harus memiliki hierarki informasi yang jelas.

## 7. Design system menggunakan CSS native

Buat atau rapikan CSS variables untuk:

- Warna.
- Spacing.
- Typography.
- Border radius.
- Border.
- Shadow.
- Ukuran sidebar.
- Tinggi topbar.
- Ukuran komponen.

Gunakan CSS Grid dan Flexbox. Hindari margin acak, inline styling yang berulang, selector global yang terlalu luas, dan CSS duplikat.

Buat komponen reusable menggunakan HTML, CSS, dan Vanilla JavaScript sesuai struktur proyek yang sudah ada.

## 8. Interaksi prototype

Gunakan Vanilla JavaScript untuk membuat interaksi prototype berfungsi, misalnya:

- Sidebar collapse.
- Dropdown.
- Tabs.
- Modal.
- Search dan filter sederhana.
- Sorting tabel.
- Toast notification.
- Drag-and-drop task jika diperlukan.
- Form validation.
- Navigasi antarhalaman.

Gunakan data dummy lokal apabila diperlukan. Tidak perlu membuat API atau database.

Pastikan setiap tombol dan kontrol memiliki fungsi yang sesuai dengan konteks prototype. Jangan membuat tombol dekoratif yang terlihat aktif tetapi tidak melakukan apa pun.

## 9. Responsive design

Pastikan tampilan bekerja dengan baik pada:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Gunakan media queries native. Sesuaikan navigasi, tabel, board, form, dan detail view berdasarkan ukuran layar. Hindari overflow horizontal yang tidak disengaja dan elemen yang saling bertumpuk.

## 10. Tahapan pengerjaan

1. Audit struktur file dan seluruh halaman yang ada.
2. Identifikasi masalah visual dan inkonsistensi komponen.
3. Rapikan design tokens dan CSS global.
4. Standarkan sidebar, topbar, dan layout utama.
5. Standarkan komponen reusable.
6. Terapkan redesign ke seluruh halaman yang tersedia.
7. Pastikan ikon tidak menggunakan emoji.
8. Periksa responsive layout dan interaksi JavaScript.
9. Periksa console error dan pastikan prototype tetap dapat dijalankan.

Jangan hanya memperbaiki dashboard. Terapkan standar desain secara konsisten pada semua halaman yang tersedia.

## 11. Kriteria hasil akhir

Prototype dinyatakan selesai apabila:

- Seluruh halaman memiliki desain yang konsisten.
- Layout bersih dan proporsional.
- Tidak ada emoji sebagai ikon.
- Ikon menggunakan Flaticon atau SVG yang sesuai.
- Spacing, typography, warna, dan komponen konsisten.
- Tabel, board, form, dan modal nyaman digunakan.
- Responsive layout bekerja dengan baik.
- Interaksi prototype berjalan.
- Tidak ada framework baru atau backend yang ditambahkan.
- Struktur kode tetap mudah dipelihara.

**Instruksi terakhir:** langsung audit dan perbaiki kode prototype yang ada. Fokus hanya pada UI/UX dan interaksi frontend.
