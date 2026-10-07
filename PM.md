# Forge PM — Flow, Perubahan Fitur, dan Integrasi

## 1. Flow
```
CRM: Deal WON ──► Inbox "Deal WON siap dibuat project" (Forge PM)
  └► Project Baru: pilih deal (client & nilai terbaca dari CRM) + PM + anggota + template fase + tanggal
       └► otomatis: milestone dari template, event Kickoff, log aktivitas
            └► Stage: Kickoff → Development → UAT → Handover → Maintenance
                 ├ Task: dibuat manual / convert tiket / laporan bug; assignee hanya PM + anggota + AI; terhubung ke milestone & deadline
                 ├ Bug: agen AI → PR → approval (Hard = 2 approver) → merge manual → deploy → monitoring
                 └ Progress & health dihitung dari task + milestone vs waktu terpakai
            └► Handover (WON → Garansi) ──► Finance: invoice
```

## 2. Perubahan fitur
| Status | Fitur |
|---|---|
| Dipertahankan | Kanban + drag-and-drop, approval bug (double approval Hard), agen AI, tiket, task_events, timer task, Handover CRM, Events |
| Diubah | Project Baru (dari deal CRM, wajib PM + anggota + template fase); Overview (KPI dihitung, bukan angka tetap); Timeline (milestone nyata, bukan bar statis); Dashboard (health, tindakan, beban tim dihitung); Team Workload (peran per project, beban dari task); Timesheets (jam dari timer task, baca-saja); Invoices (baca-saja dari Finance) |
| Ditambah | Inbox deal WON; PM & anggota per project; tab Tim; milestone (tambah/ubah status/hapus); stage project; health otomatis (On track / Perlu perhatian / Terlambat); activity feed gabungan (log project + task_events); event Kickoff otomatis; kolom milestone & deadline di task |
| Dihapus / dipindah | Halaman Clients dan total invoice → tautan ke CRM/Finance; status Cuti & manajemen anggota workspace → HR; persetujuan timesheet → HR/Finance; Task Selesai Bulan Ini & Project Health dummy |

## 3. Aturan hitung
- **Progress** = rata-rata (task selesai ÷ total task) dan (milestone selesai ÷ total milestone).
- **Health**: *Terlambat* bila lewat deadline dan progress < 100%; *Perlu perhatian* bila ada task lewat deadline atau progress tertinggal >15 poin dari waktu terpakai; selain itu *On track*.
- Anggota yang masih punya task terbuka di project tidak bisa dikeluarkan.

## 4. Batas dengan modul lain
| Modul | Pemilik data | Di Forge PM |
|---|---|---|
| CRM | Client, deal, nilai kontrak | Referensi `client_id`, `deal_id`; nilai tampil baca-saja |
| Finance | Invoice, pembayaran, penagihan | Tab Invoices baca-saja; invoice dibuat di Finance saat Handover stage ≥ 4 |
| HR | Cuti, absensi, gaji, persetujuan timesheet | Hanya jam tercatat dari timer task |
| Platform | User, role, integrasi | Role dipakai untuk memilih PM; pengaturan di modul Settings |

## 5. Belum dikerjakan (untuk review)
Tab Files dan Comments masih statis; deal CRM, invoice, dan anggota masih data dummy lokal (belum API); RBAC belum ditegakkan; Handover belum terhubung ke stage project.