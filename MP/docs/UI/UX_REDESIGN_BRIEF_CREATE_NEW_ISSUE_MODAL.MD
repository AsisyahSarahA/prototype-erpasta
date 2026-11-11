# UI/UX REDESIGN BRIEF — CREATE NEW ISSUE MODAL

## ROLE

Bertindak sebagai Senior Product Designer, Lead UI/UX Designer, dan Senior Frontend Engineer dengan pengalaman lebih dari 15 tahun dalam merancang enterprise software, project management tools, dan SaaS applications.

Tugas Anda adalah melakukan evaluasi dan redesign terhadap modal **"Buat Issue Baru"** berdasarkan screenshot yang diberikan.

Hasil desain harus memiliki kualitas visual dan pengalaman pengguna setara dengan produk software house profesional, bukan sekadar tampilan yang terlihat modern.

## 1. DESIGN OBJECTIVE

Lakukan redesign menyeluruh terhadap layout dan pengalaman pengguna dengan prinsip:

- Clean, minimal, professional, dan functional.
- Strong visual hierarchy.
- Consistent spacing dan alignment.
- Clear information architecture.
- Efficient form interaction.
- Reduced cognitive load.
- Accessible dan responsive.
- Enterprise-grade UI quality.

Hindari desain yang terlihat seperti hasil generatif AI (AI Slop).

Jangan menambahkan dekorasi visual yang tidak memiliki fungsi.

## 2. EVALUASI DESAIN SAAT INI

Identifikasi dan perbaiki masalah berikut:

1. Distribusi ruang antara area form utama dan panel atribut belum optimal.
2. Terlalu banyak informasi yang tampil dalam satu viewport.
3. Beberapa elemen memiliki kepadatan visual yang kurang nyaman.
4. Hierarki antara label, deskripsi, input, dan informasi tambahan belum konsisten.
5. Area checklist subtasks memiliki ruang kosong yang terlalu besar ketika belum terdapat data.
6. Panel atribut dan penjadwalan perlu memiliki pengelompokan informasi yang lebih jelas.
7. Footer action harus tetap mudah dijangkau tanpa mengganggu area form.
8. Pastikan scrolling berjalan pada area yang tepat, bukan menyebabkan keseluruhan modal terasa tidak stabil.

Jangan menghilangkan fitur hanya untuk membuat tampilan lebih sederhana.

## 3. LAYOUT ARCHITECTURE

Rancang ulang modal menggunakan pendekatan berikut:

### A. Modal Header
- Judul: Buat Issue Baru.
- Subtitle singkat yang menjelaskan fungsi modal.
- Informasi project ditampilkan sebagai contextual metadata.
- Tombol close berada pada posisi konsisten.
- Gunakan header yang ringkas dan tidak terlalu tinggi.

### B. Issue Classification
Pertahankan lima kategori:
- Task Teknis
- Fitur Baru
- Bug / Error
- Revisi (CR)
- Maintenance

Redesign menjadi segmented selection yang intuitif.

Ketentuan:
- Selected state harus langsung terlihat.
- Unselected state tetap memiliki kontras yang cukup.
- Gunakan ikon secara konsisten.
- Hindari penggunaan warna berlebihan.
- Pastikan area klik nyaman.

### C. Main Form Area

Pertahankan seluruh input berikut:

1. Ringkasan / Judul Issue.
2. Deskripsi dan Acceptance Criteria.
3. Markdown toolbar.
4. Checklist Subtask Awal.
5. Tombol tambah subtask.

Atur urutan berdasarkan alur berpikir pengguna.

Judul issue harus menjadi fokus utama setelah pemilihan kategori.

Deskripsi menggunakan editor sederhana dengan toolbar minimal dan fungsional.

Subtask harus memiliki empty state yang informatif, bukan menyisakan area kosong yang tidak memiliki tujuan.

### D. Attributes & Scheduling Panel

Pertahankan seluruh atribut yang tersedia:

1. Project Target.
2. Tingkat Prioritas:
   - Hotfix
   - Tinggi
   - Sedang
   - Rendah
3. Penanggung Jawab (PIC).
4. Tautkan ke Epik Modul.
5. Estimasi Beban.
6. Tenggat (Due Date).
7. Penempatan Sprint.
8. Visibilitas.

Kelompokkan berdasarkan konteks:

- Project & Ownership.
- Priority & Scheduling.
- Workload & Visibility.

Jangan membuat semua field terlihat seperti komponen yang berdiri sendiri tanpa hubungan.

Gunakan label yang jelas, jarak konsisten, dan ukuran input proporsional.

### E. Sticky Footer

Pertahankan:
- Checkbox Buat issue lain setelah ini.
- Tombol Batal.
- Tombol utama Buat Tiket.

Ketentuan:
- Footer selalu terlihat ketika konten modal di-scroll.
- Gunakan pemisah visual yang subtle.
- Tombol utama memiliki visual hierarchy paling tinggi.
- Berikan loading, disabled, dan success state apabila diperlukan.

## 4. VISUAL DESIGN SYSTEM

Gunakan visual language enterprise SaaS dengan pendekatan Clean Minimal dan Swiss Modernist.

Arah desain:

- Background dominan putih atau neutral surface.
- Surface sekunder menggunakan abu-abu sangat lembut.
- Border tipis dan subtle.
- Radius konsisten, jangan terlalu rounded.
- Typography profesional dan mudah dibaca.
- Icon menggunakan satu library dan satu gaya.
- Shadow hanya jika memiliki fungsi pemisahan layer.

Pertahankan identitas warna indigo/ungu pada desain referensi sebagai warna utama.

Gunakan warna semantik secara konsisten:

- Hotfix: Red.
- Tinggi: Amber / Orange.
- Sedang: Indigo.
- Rendah: Neutral / Gray.

Warna status tidak boleh digunakan sebagai dekorasi. Warna harus membantu pengguna memahami informasi.

Jangan mengganti identitas visual utama tanpa alasan UX yang kuat.

## 5. UX PRINCIPLES

Implementasikan prinsip berikut:

- Recognition over recall.
- Progressive disclosure.
- Clear affordance.
- Consistent interaction patterns.
- Error prevention.
- Meaningful empty states.
- Immediate interaction feedback.
- Accessible contrast and focus states.

Pastikan setiap field memiliki label yang jelas.

Jangan hanya mengandalkan placeholder untuk menjelaskan fungsi input.

Berikan validasi yang mudah dipahami dan tampilkan pesan error dekat dengan field terkait.

## 6. RESPONSIVE BEHAVIOR

Desktop:
- Gunakan modal dengan lebar proporsional terhadap viewport.
- Gunakan dua kolom apabila ruang mencukupi.
- Form utama mendapatkan ruang lebih besar.
- Panel atribut tidak boleh terlalu sempit.
- Batasi tinggi modal agar tetap berada dalam viewport.

Tablet:
- Sesuaikan proporsi kolom.
- Hindari input yang terlalu kecil.

Mobile:
- Ubah menjadi satu kolom.
- Atribut dan penjadwalan dapat ditempatkan setelah form utama.
- Footer action tetap mudah dijangkau.
- Hindari horizontal scrolling.

## 7. TECHNICAL CONSTRAINTS

Implementasikan prototype menggunakan HTML, CSS, dan Vanilla JavaScript.

Ketentuan teknis:

- Jangan menggunakan React, Next.js, Vue, atau framework frontend lainnya.
- Pisahkan struktur HTML, styling CSS, dan interaksi JavaScript apabila struktur project mendukungnya.
- Gunakan komponen dan class yang reusable.
- Jangan membuat interaksi palsu pada tombol.
- Pertahankan seluruh field, kategori, opsi, dan informasi dari desain asli.
- Jangan mengubah business logic yang sudah tersedia.
- Pertahankan ID, name, dan selector yang dibutuhkan JavaScript existing.
- Jika terdapat struktur atau fungsi yang sudah bekerja, lakukan refactor secara hati-hati.
- Jangan menghapus fitur existing hanya karena ingin menyederhanakan layout.

## 8. STRICT DESIGN RULES — AVOID AI SLOP

DILARANG:

- Menggunakan gradient secara berlebihan.
- Glassmorphism tanpa alasan fungsional.
- Menggunakan shadow besar pada setiap card.
- Membuat semua elemen menjadi pill-shaped.
- Menggunakan terlalu banyak warna aksen.
- Menambahkan badge pada setiap informasi.
- Menggunakan ikon hanya sebagai dekorasi.
- Menampilkan terlalu banyak border dan card bersarang.
- Menggunakan typography yang tidak konsisten.
- Membuat layout dengan banyak ruang kosong yang tidak terencana.
- Mengubah desain menjadi dashboard generik.

Utamakan struktur, konsistensi, proporsi, dan keterbacaan daripada efek visual.

## 9. EXPECTED RESULT

Hasil akhir harus terasa seperti fitur issue management dari produk SaaS profesional.

Desain harus:
- Mudah dipahami dalam sekali lihat.
- Memiliki alur pengisian yang natural.
- Tidak terasa padat meskipun memiliki banyak field.
- Memiliki visual hierarchy yang jelas.
- Konsisten dari header sampai footer.
- Tetap mempertahankan seluruh fungsionalitas existing.

**IMPORTANT:** Jangan sekadar mempercantik tampilan lama. Evaluasi struktur, temukan masalah UX, kemudian lakukan redesign secara menyeluruh dengan tetap mempertahankan kebutuhan fungsional yang sudah ada.

Prioritaskan kualitas pengalaman pengguna dan kualitas implementasi, bukan sekadar membuat tampilan terlihat keren.