/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — js/constants.js
   Konstanta & data default aplikasi.
   Dimuat SEBELUM app.js. app.js akan memakai nilai window.* di
   sini jika tersedia (lihat pola `window.X || {...}` di app.js);
   bila file ini tidak dimuat, app.js tetap jalan pakai fallback
   bawaannya sendiri — file ini hanya sumber kebenaran tunggal
   supaya tidak ada dua definisi yang bisa berbeda nilainya.
   ============================================================ */
'use strict';

window.APP = {
  nama: 'Agenda & Manajemen Kegiatan Bidan',
  versi: '1.2.0-fase2-final',
  tahun: 2026,
};

window.K = {
  s_settings: 'bidan_settings_v1',
  s_data: 'bidan_data_v1',
  s_theme: 'bidan_theme_v1',
  s_queue: 'bidan_queue_v1',
  s_notified: 'bidan_notified_v1',
  s_notifs: 'bidan_notifs_v1',
  s_demo: 'bidan_demo_db_v1',
  s_syncts: 'bidan_syncts_v1',
};

window.HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
window.BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
window.STATUS_LIST = ['Belum', 'Berlangsung', 'Selesai', 'Ditunda', 'Dibatalkan'];
window.PRIORITAS_LIST = ['Rendah', 'Sedang', 'Tinggi', 'Urgent'];

window.KATEGORI = {
  'Pelayanan Kesehatan': '#0EA5E9',
  'Kegiatan Rutin': '#14B8A6',
  'Penyuluhan': '#F59E0B',
  'Kunjungan': '#8B5CF6',
  'Program': '#EC4899',
  'Administratif': '#64748B',
};

window.SHIFT_DEFAULT = {
  pagi:  { label: 'Pagi',  start: '07:30', end: '14:00', warna: '#22C55E', ikon: '🟢' },
  siang: { label: 'Siang', start: '14:00', end: '21:00', warna: '#F59E0B', ikon: '🟠' },
  malam: { label: 'Malam', start: '21:00', end: '07:30', warna: '#3B82F6', ikon: '🔵' },
};

window.MASTER_DEFAULT = [
  { id: 'm1', nama: 'Posyandu Balita', kategori: 'Kegiatan Rutin', ikon: '👶', warna: '#14B8A6', lokasiDefault: 'Balai Desa', sasaranDefault: 'Balita 0–5 tahun', durasiDefault: 180, keteranganDefault: 'Penimbangan, imunisasi, PMT, penyuluhan', aktif: true },
  { id: 'm2', nama: 'Posyandu Lansia', kategori: 'Kegiatan Rutin', ikon: '👵', warna: '#F59E0B', lokasiDefault: 'Balai Desa', sasaranDefault: 'Lansia', durasiDefault: 150, keteranganDefault: 'Pemeriksaan tensi, gula darah, senam lansia', aktif: true },
  { id: 'm3', nama: 'Pemeriksaan Kehamilan (ANC)', kategori: 'Pelayanan Kesehatan', ikon: '🤰', warna: '#EC4899', lokasiDefault: 'Polindes', sasaranDefault: 'Ibu hamil', durasiDefault: 120, keteranganDefault: 'ANC, imunisasi TT, konseling gizi', aktif: true },
  { id: 'm4', nama: 'Pemeriksaan Nifas (KF)', kategori: 'Pelayanan Kesehatan', ikon: '🤱', warna: '#EC4899', lokasiDefault: 'Polindes', sasaranDefault: 'Ibu nifas & bayi baru lahir', durasiDefault: 90, keteranganDefault: 'KF 1–3, perawatan tali pusat, ASI', aktif: true },
  { id: 'm5', nama: 'Pelayanan KB', kategori: 'Pelayanan Kesehatan', ikon: '💊', warna: '#0EA5E9', lokasiDefault: 'Polindes', sasaranDefault: 'PUS / akseptor KB', durasiDefault: 120, keteranganDefault: 'Konseling & pelayanan kontrasepsi', aktif: true },
  { id: 'm6', nama: 'Imunisasi Dasar Bayi', kategori: 'Pelayanan Kesehatan', ikon: '💉', warna: '#0EA5E9', lokasiDefault: 'Posyandu / Polindes', sasaranDefault: 'Bayi 0–11 bulan', durasiDefault: 120, keteranganDefault: 'HB0, BCG, DPT, Polio, Campak', aktif: true },
  { id: 'm7', nama: 'Kunjungan Rumah (Home Care)', kategori: 'Kunjungan', ikon: '🏠', warna: '#8B5CF6', lokasiDefault: 'Rumah sasaran', sasaranDefault: 'Ibu hamil / nifas / bayi', durasiDefault: 60, keteranganDefault: 'Kunjungan nifas, neonatal, bumil risiko tinggi', aktif: true },
  { id: 'm8', nama: 'Kelas Ibu Hamil', kategori: 'Penyuluhan', ikon: '📚', warna: '#F59E0B', lokasiDefault: 'Balai Desa', sasaranDefault: 'Ibu hamil', durasiDefault: 120, keteranganDefault: 'Materi kehamilan, persalinan, nifas, KB', aktif: true },
  { id: 'm9', nama: 'Konseling & Inisiasi ASI', kategori: 'Penyuluhan', ikon: '🍼', warna: '#F59E0B', lokasiDefault: 'Polindes', sasaranDefault: 'Ibu hamil & menyusui', durasiDefault: 60, keteranganDefault: 'Konseling ASI eksklusif, IMD', aktif: true },
  { id: 'm10', nama: 'Penyuluhan Kesehatan Masyarakat', kategori: 'Penyuluhan', ikon: '📣', warna: '#F59E0B', lokasiDefault: 'Balai Desa', sasaranDefault: 'Masyarakat', durasiDefault: 90, keteranganDefault: 'PHBS, Gizi, PSN, kesehatan reproduksi', aktif: true },
  { id: 'm11', nama: 'Senam Hamil', kategori: 'Penyuluhan', ikon: '🤸', warna: '#F59E0B', lokasiDefault: 'Balai Desa', sasaranDefault: 'Ibu hamil', durasiDefault: 60, keteranganDefault: 'Senam hamil aman bersama bidan', aktif: true },
  { id: 'm12', nama: 'P4K (Perencanaan Persalinan)', kategori: 'Program', ikon: '🩺', warna: '#EC4899', lokasiDefault: 'Rumah sasaran', sasaranDefault: 'Ibu hamil trimester III', durasiDefault: 60, keteranganDefault: 'Stiker P4K, sosialisasi penolong & transport', aktif: true },
  { id: 'm13', nama: 'SDIDTK', kategori: 'Program', ikon: '🧒', warna: '#EC4899', lokasiDefault: 'Posyandu', sasaranDefault: 'Balita & anak prasekolah', durasiDefault: 120, keteranganDefault: 'Stimulasi, deteksi & intervensi dini tumbuh kembang', aktif: true },
  { id: 'm14', nama: 'Pemeriksaan Kesehatan Remaja / UKS', kategori: 'Pelayanan Kesehatan', ikon: '🎒', warna: '#0EA5E9', lokasiDefault: 'Sekolah', sasaranDefault: 'Remaja / siswa', durasiDefault: 120, keteranganDefault: 'Penjaringan kesehatan, penyuluhan remaja', aktif: true },
  { id: 'm15', nama: 'Puskesmas Jaga / Piket', kategori: 'Kegiatan Rutin', ikon: '🏥', warna: '#14B8A6', lokasiDefault: 'Puskesmas', sasaranDefault: 'Pasien umum', durasiDefault: 390, keteranganDefault: 'Jaga pelayanan di puskesmas', aktif: true },
  { id: 'm16', nama: 'Rapat / Lokakarya Mini', kategori: 'Administratif', ikon: '📋', warna: '#64748B', lokasiDefault: 'Puskesmas', sasaranDefault: 'Tim puskesmas', durasiDefault: 120, keteranganDefault: 'Lokmin bulanan, rapat koordinasi', aktif: true },
  { id: 'm17', nama: 'Pencatatan & Pelaporan', kategori: 'Administratif', ikon: '📊', warna: '#64748B', lokasiDefault: 'Polindes', sasaranDefault: 'Dokumentasi', durasiDefault: 90, keteranganDefault: 'Register kohort, laporan bulanan', aktif: true },
  { id: 'm18', nama: 'Persalinan (Pertolongan)', kategori: 'Pelayanan Kesehatan', ikon: '👶', warna: '#E11D48', lokasiDefault: 'Polindes / Rumah', sasaranDefault: 'Ibu bersalin', durasiDefault: 240, keteranganDefault: 'Pertolongan persalinan normal & perawatan bayi', aktif: true },
];

window.SETTINGS_DEFAULT = {
  namaBidan: 'Bidan Dewi',
  namaPuskesmas: 'Puskesmas Purwokerto',
  namaDesa: 'Kedungwuluh',
  logo: '', fotoProfil: '', tema: 'system', password: 'bidan123',
  spreadsheetId: '1nQPoelyCvHHHvCm945DlLI2y4dDrKaFMJkdE-qmvof4',
  gasUrl: 'https://script.google.com/macros/s/AKfycbwiUG87Cxik3JT3aZ4JplsfCCq8aRt0z5aFRlx48Dg_06mm6XK_8owj8gTX8Z4J4JvGZg/exec',
  sheets: { agenda: 'Agenda', piket: 'JadwalPiket', master: 'MasterKegiatan', settings: 'Pengaturan', log: 'LogAktivitas' },
  telegram: { token: '', chatId: '', aktif: false, jenis: { hariIni: true, besok: true, piket: true, terlambat: true, jam1: false, jam30: false } },
  shifts: JSON.parse(JSON.stringify(window.SHIFT_DEFAULT)),
};
