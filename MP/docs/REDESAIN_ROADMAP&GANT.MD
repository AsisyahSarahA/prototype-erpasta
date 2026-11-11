# ASTACODE PM — GANTT & ROADMAP VISUAL REDESIGN

Lakukan redesign halaman Roadmap & Gantt ASTACODE PM menggunakan screenshot referensi terbaru sebagai acuan utama.

**Tujuan:** Menghasilkan tampilan Gantt Chart yang secara struktur dan visual mendekati screenshot referensi, tetapi menggunakan identitas desain ASTACODE PM dan sistem warna status yang sudah ditentukan.

Teknologi wajib:
- HTML5
- CSS3
- Vanilla JavaScript ES6+
- SVG untuk dependency lines jika diperlukan.
- Lucide Icons untuk ikon.

Tidak menggunakan framework frontend, backend, database, atau API. Gunakan data simulasi dan localStorage.

## 1. STRUKTUR LAYOUT UTAMA

Pertahankan layout Gantt seperti gambar referensi dengan dua panel utama.

**A. LEFT PANEL — WORK ITEM LIST**

Panel kiri berisi:
- Nama Epic.
- Kode Epic.
- Flat icon untuk tipe pekerjaan.
- Expand / Collapse.
- Progress indicator di bawah nama Epic.
- Child Task jika Epic dibuka.
- Status pekerjaan.
- Tombol Create Epic di bagian bawah.

Gunakan lebar panel yang konsisten sekitar 300–340px pada desktop.

Nama Epic yang terlalu panjang harus menggunakan text truncation dengan tooltip.

**B. RIGHT PANEL — TIMELINE CANVAS**

Panel kanan berisi:
- Header kalender berdasarkan bulan dan tahun.
- Baris Sprint.
- Baris Releases.
- Gantt bars.
- Dependency lines.
- Today indicator.

Panel timeline harus memiliki horizontal scrolling sendiri.

Left panel dan right panel harus memiliki vertical scroll yang tersinkronisasi.

Header kalender tetap sticky ketika pengguna melakukan vertical scrolling.

## 2. SPRINT & RELEASE ROWS

Tempatkan dua baris khusus di atas daftar Epic:

**SPRINTS**
- Menampilkan nama Sprint.
- Start date.
- End date.
- Status Sprint.
- Sprint aktif menggunakan indikator kecil bertuliskan ACTIVE.
- Sprint ditampilkan sebagai horizontal timeline bar.

**RELEASES**
- Menampilkan milestone seperti Official Release, Beta Release, dan UAT.
- Milestone ditampilkan sebagai marker pada tanggal tertentu.
- Klik marker untuk membuka detail Release.
- Gunakan ikon flat dan label sederhana.

Sprint dan Releases harus memiliki posisi yang sesuai dengan tanggal pada timeline.

## 3. GANTT BARS

Tampilkan setiap pekerjaan sebagai horizontal bar seperti screenshot referensi.

Setiap bar memiliki:
- Nama Epic atau Task.
- Start date.
- End date.
- Progress percentage.
- Status.
- Tooltip detail.

Posisi horizontal dan panjang bar wajib dihitung secara dinamis berdasarkan tanggal mulai dan selesai.

Jangan menggunakan posisi statis atau random.

Jika Epic memiliki child Task, tampilkan child Task ketika Epic di-expand.

Progress indicator kecil di bawah nama Epic harus menggambarkan progres aktual pekerjaan.

## 4. STATUS COLOR SYSTEM

WAJIB menggunakan sistem warna berikut.

Jangan menggunakan warna ungu untuk seluruh Gantt bars.

| Status | Bar Color | Soft Background |
|---|---|---|
| Backlog | #94A3B8 | #F1F5F9 |
| To Do | #3B82F6 | #EFF6FF |
| In Progress | #F59E0B | #FFFBEB |
| In Review | #8B5CF6 | #F5F3FF |
| Testing / QA | #06B6D4 | #ECFEFF |
| Blocked | #EF4444 | #FEF2F2 |
| On Hold | #64748B | #F1F5F9 |
| Reopened | #F97316 | #FFF7ED |
| Done | #22C55E | #F0FDF4 |
| Cancelled | #6B7280 | #F3F4F6 |

Ketentuan visual:
- Bar menggunakan warna utama sesuai status.
- Progress fill menggunakan warna status yang sama dengan intensitas berbeda.
- Teks di dalam bar harus memiliki kontras yang baik.
- Gunakan border radius kecil sekitar 5–6px.
- Jangan menggunakan gradient.
- Status badge pada panel kiri harus menggunakan warna yang sama.
- Tambahkan warning indicator pada pekerjaan yang terlambat atau Blocked.

Warna ungu #4F46E5 hanya digunakan sebagai identitas brand dan elemen navigasi aktif ASTACODE PM.

## 5. DEPENDENCY LINES

Ini merupakan bagian penting yang harus menyerupai screenshot.

Gunakan SVG untuk menggambar garis dependency berbentuk curved connector.

Ketentuan:
- Garis menghubungkan pekerjaan yang saling bergantung.
- Gunakan warna #94A3B8.
- Ketebalan garis sekitar 1.5–2px.
- Gunakan rounded line caps.
- Garis tidak boleh menutupi teks atau Gantt bars.
- Posisi garis harus mengikuti koordinat bar secara dinamis.
- Garis diperbarui ketika timeline di-zoom, di-scroll, atau data pekerjaan berubah.

Jenis dependency:
- Finish to Start.
- Start to Start.
- Finish to Finish.
- Start to Finish.

Saat pekerjaan dipilih, highlight dependency yang berkaitan dan redupkan garis lainnya.

## 6. TIMELINE CONTROLS

Tempatkan toolbar timeline di kanan bawah seperti screenshot referensi.

Kontrol:
- Previous Period.
- Next Period.
- Today.
- Weeks.
- Months.
- Quarters.
- Zoom In.
- Zoom Out.

Default tampilan adalah Months.

Perubahan skala harus mengubah ukuran kolom waktu dan posisi Gantt bars secara otomatis.

Today harus memindahkan viewport ke tanggal hari ini dan menampilkan vertical indicator pada tanggal tersebut.

## 7. HEADER & KPI

Pertahankan header dan navigasi ASTACODE PM yang sudah ada.

Pertahankan empat KPI:
- Progress Penyelesaian.
- Aktif Dikerjakan.
- Alokasi Estimasi Waktu.
- Target Delivery & UAT.

Gunakan desain minimalis, jangan mengambil terlalu banyak tinggi layar.

Prioritaskan ruang untuk Gantt Chart.

## 8. INTERAKSI PROTOTYPE

Semua fitur harus berjalan menggunakan Vanilla JavaScript.

Implementasikan:
- Expand / Collapse Epic.
- Expand / Collapse Child Task.
- Create Epic.
- Edit Epic.
- Delete Epic.
- Edit tanggal pekerjaan.
- Filter berdasarkan status.
- Search Epic dan Task.
- Tooltip.
- Klik Gantt bar untuk membuka detail.
- Navigasi timeline.
- Zoom timeline.
- Expand dependency.
- Drag and Drop Gantt bar untuk mengubah tanggal jika memungkinkan.
- localStorage untuk menyimpan perubahan.

Semua perubahan harus memperbarui Gantt Chart, progress indicator, KPI, dan dependency secara konsisten.

## 9. VISUAL DESIGN

Gunakan gaya enterprise project management yang clean.

Palet dasar:
- Primary: #4F46E5
- Background: #F8FAFC
- Surface: #FFFFFF
- Border: #E2E8F0
- Text: #0F172A
- Secondary Text: #64748B

Ketentuan:
- Gunakan flat icons.
- Tidak menggunakan emoji.
- Tidak menggunakan ilustrasi dekoratif.
- Tidak menggunakan gradient.
- Tidak menggunakan glassmorphism.
- Hindari terlalu banyak card.
- Hindari rounded corner berlebihan.
- Gunakan garis pemisah tipis.
- Gunakan typography yang mudah dibaca.
- Pertahankan whitespace yang proporsional.

Gantt Chart harus menjadi elemen visual utama.

## 10. RESPONSIVE & TECHNICAL

Desktop:
- Panel kiri dan kanan berdampingan.
- Timeline horizontal scroll.
- Header kalender sticky.
- Vertical scrolling sinkron.

Tablet:
- Lebar panel dapat disesuaikan.
- Timeline tetap dapat digunakan.

Mobile:
- Daftar pekerjaan dan timeline ditampilkan secara adaptif.
- Timeline tetap bisa digeser horizontal.

Gunakan struktur kode yang modular:
- HTML untuk struktur.
- CSS untuk styling.
- JavaScript untuk data dan interaksi.
- SVG untuk dependency connectors.

Jangan mengganti keseluruhan project tanpa menganalisis kode yang sudah ada.

## 11. FINAL VALIDATION

Setelah implementasi, pastikan:
1. Layout Gantt sesuai dengan gambar referensi.
2. Semua Epic berada pada baris yang benar.
3. Posisi dan durasi bar sesuai tanggal.
4. Sprint dan Releases berada pada baris terpisah.
5. Dependency lines terhubung dengan benar.
6. Status bars menggunakan warna yang disepakati.
7. Expand / Collapse berfungsi.
8. Timeline navigation berfungsi.
9. Search dan filter berfungsi.
10. Create, Edit, Delete berfungsi.
11. localStorage berjalan.
12. Tidak ada error JavaScript.

**FINAL RESULT:**

Saya ingin hasil akhir menyerupai struktur visual screenshot referensi kedua, dengan desain ASTACODE PM yang clean, profesional, dan mudah dipahami.

Jangan membuat Gantt Chart generik. Ikuti struktur visual referensi: Work Item List di kiri, Sprint dan Releases di atas, Timeline di kanan, serta curved dependency connectors antarpekerjaan.

Implementasikan langsung pada project yang sudah ada.