/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — js/constants.js (Fase 2)
   Semua konstanta & data default aplikasi.
   ------------------------------------------------------------
   PENTING: jangan pakai `const`/`let` top-level dengan nama
   yang sama seperti di app.js (APP, K, HARI, MASTER_DEFAULT,
   dst.) — akan memicu "Identifier has already been declared".
   Modul ini menulis langsung ke window.* di dalam IIFE; app.js
   membaca window.* dan menyediakan fallback bila file ini
   tidak dimuat (mode single-file tetap jalan).
   Load order WAJIB: constants → utils → backup → app.js
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  window.APP = {
    nama: 'Agenda & Manajemen Kegiatan Bidan',
    versi: '1.2.0-fase2-final',
    tahun: 2026,
  };

  /* Kunci localStorage */
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
    pagi:   { label: 'Pagi',   start: '07:30', end: '14:00', warna: '#22C55E', ikon: '🟢' },
    siang:  { label: 'Siang',  start: '14:00', end: '21:00', warna: '#F59E0B', ikon: '🟠' },
    malam:  { label: 'Malam',  start: '21:00', end: '07:30', warna: '#3B82F6', ikon: '🔵' },
  };

  /* 18 kegiatan baku bidan — data awal Master Kegiatan */
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

  window.PRIO_COLOR = { Rendah: '#94A3B8', Sedang: '#3B82F6', Tinggi: '#F59E0B', Urgent: '#EF4444' };
  window.STATUS_COLOR = { Belum: '#94A3B8', Berlangsung: '#3B82F6', Selesai: '#22C55E', Ditunda: '#F59E0B', Dibatalkan: '#EF4444', Terlambat: '#EF4444' };

  /* Hari libur nasional & cuti bersama — SKB 3 Menteri 2026
     (Nomor 1497/2/5 Tahun 2025). Kunci: 'YYYY-MM-DD'.
     Tanggal tetap (berulang tiap tahun) boleh ditambah di sini
     dengan kunci tahun aktual saat tahun baru dimulai. */
  window.LIBUR_NASIONAL = {
    '2026-01-01': 'Tahun Baru 2026 Masehi',
    '2026-01-16': "Isra Mikraj Nabi Muhammad SAW",
    '2026-02-16': 'Cuti Bersama Imlek 2577 Kongzili',
    '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
    '2026-03-18': 'Cuti Bersama Hari Suci Nyepi',
    '2026-03-19': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
    '2026-03-20': 'Cuti Bersama Idulfitri 1447 H',
    '2026-03-21': 'Idulfitri 1447 Hijriah',
    '2026-03-22': 'Idulfitri 1447 Hijriah',
    '2026-03-23': 'Cuti Bersama Idulfitri 1447 H',
    '2026-03-24': 'Cuti Bersama Idulfitri 1447 H',
    '2026-04-03': 'Wafat Yesus Kristus',
    '2026-04-05': 'Kebangkitan Yesus Kristus (Paskah)',
    '2026-05-01': 'Hari Buruh Internasional',
    '2026-05-14': 'Kenaikan Yesus Kristus',
    '2026-05-15': 'Cuti Bersama Kenaikan Yesus Kristus',
    '2026-05-27': 'Iduladha 1447 Hijriah',
    '2026-05-28': 'Cuti Bersama Iduladha 1447 H',
    '2026-05-31': 'Hari Raya Waisak 2570 BE',
    '2026-06-01': 'Hari Lahir Pancasila',
    '2026-06-16': '1 Muharam Tahun Baru Islam 1448 H',
    '2026-08-17': 'Proklamasi Kemerdekaan RI',
    '2026-08-25': 'Maulid Nabi Muhammad SAW',
    '2026-12-24': 'Cuti Bersama Natal',
    '2026-12-25': 'Kelahiran Yesus Kristus (Natal)',
  };
})();
