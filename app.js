/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — app.js (MAIN LOGIC)
   Vanilla JavaScript (ES6+) — tanpa framework/library.
   ------------------------------------------------------------
   FASE 2 FINAL — Modular + Enhanced Backup
   - js/constants.js  (APP, K, MASTER_DEFAULT, SETTINGS_DEFAULT, KATEGORI, SHIFT_DEFAULT, etc.)
   - js/utils.js      (date helpers, debounce, isLate, compressImage, etc.)
   - js/backup.js     (poin 4: full backup/restore with merge/replace + Excel)
   ------------------------------------------------------------
   Backward compatible: works even without modular files.
   GitHub Pages friendly (single-file build still possible).
   ============================================================ */
'use strict';

/* ============================================================
   1. KONFIGURASI & DATA AWAL
   (Menggunakan modul js/constants.js jika tersedia)
   ============================================================ */

// Fallbacks jika modul constants.js belum / tidak dimuat
const APP = (typeof window !== 'undefined' && window.APP) || {
  nama: 'Agenda & Manajemen Kegiatan Bidan',
  versi: '1.2.0-fase2-final',
  tahun: 2026,
};

// Final version marker
if (typeof window !== 'undefined') {
  window.BIDAN_APP_VERSION = APP.versi;
}

// Prefer constants & utils from modular files if loaded (Fase 2)
// IMPORTANT: these are the ONLY declarations. If modules (constants.js) are loaded first,
// we use window.* values. No duplicate const declarations.
const K = (typeof window !== 'undefined' && window.K) || {
  s_settings: 'bidan_settings_v1',
  s_data: 'bidan_data_v1',
  s_theme: 'bidan_theme_v1',
  s_queue: 'bidan_queue_v1',
  s_notified: 'bidan_notified_v1',
  s_notifs: 'bidan_notifs_v1',
  s_demo: 'bidan_demo_db_v1',
  s_syncts: 'bidan_syncts_v1',
};

const HARI = (typeof window !== 'undefined' && window.HARI) || ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = (typeof window !== 'undefined' && window.BULAN) || ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const STATUS_LIST = (typeof window !== 'undefined' && window.STATUS_LIST) || ['Belum', 'Berlangsung', 'Selesai', 'Ditunda', 'Dibatalkan'];
const PRIORITAS_LIST = (typeof window !== 'undefined' && window.PRIORITAS_LIST) || ['Rendah', 'Sedang', 'Tinggi', 'Urgent'];
const KATEGORI = (typeof window !== 'undefined' && window.KATEGORI) || {
  'Pelayanan Kesehatan': '#0EA5E9',
  'Kegiatan Rutin': '#14B8A6',
  'Penyuluhan': '#F59E0B',
  'Kunjungan': '#8B5CF6',
  'Program': '#EC4899',
  'Administratif': '#64748B',
};
const SHIFT_DEFAULT = (typeof window !== 'undefined' && window.SHIFT_DEFAULT) || {
  pagi:   { label: 'Pagi',   start: '07:30', end: '14:00', warna: '#22C55E', ikon: '🟢' },
  siang:  { label: 'Siang',  start: '14:00', end: '21:00', warna: '#F59E0B', ikon: '🟠' },
  malam:  { label: 'Malam',  start: '21:00', end: '07:30', warna: '#3B82F6', ikon: '🔵' },
};

// FULL fallback (required for single-file / no-module compatibility)
const MASTER_DEFAULT = (typeof window !== 'undefined' && window.MASTER_DEFAULT) || [
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

const SETTINGS_DEFAULT = (typeof window !== 'undefined' && window.SETTINGS_DEFAULT) || {
  namaBidan: 'Bidan Dewi',
  namaPuskesmas: 'Puskesmas Purwokerto',
  namaDesa: 'Kedungwuluh',
  logo: '', fotoProfil: '', tema: 'system', password: 'bidan123',
  spreadsheetId: '1nQPoelyCvHHHvCm945DlLI2y4dDrKaFMJkdE-qmvof4',
  gasUrl: 'https://script.google.com/macros/s/AKfycbwiUG87Cxik3JT3aZ4JplsfCCq8aRt0z5aFRlx48Dg_06mm6XK_8owj8gTX8Z4J4JvGZg/exec',
  sheets: { agenda: 'Agenda', piket: 'JadwalPiket', master: 'MasterKegiatan', settings: 'Pengaturan', log: 'LogAktivitas' },
  telegram: { token: '', chatId: '', aktif: false, jenis: { hariIni: true, besok: true, piket: true, terlambat: true, jam1: false, jam30: false } },
  shifts: JSON.parse(JSON.stringify(SHIFT_DEFAULT)),
};

// Use utils module if available (backward compatible)
const U = (typeof window !== 'undefined' && window.BidanUtils) || {};

/* Koneksi bawaan (tetap untuk kompatibilitas lama) */
const DEFAULT_SPREADSHEET_ID = SETTINGS_DEFAULT.spreadsheetId;
const DEFAULT_GAS_URL = SETTINGS_DEFAULT.gasUrl;

/* ============================================================
   2. UTILITAS
   ============================================================ */

const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

function pad(n) { return String(n).padStart(2, '0'); }

/* Tanggal lokal (hindari toISOString agar tidak geser zona waktu) */
function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayKey() { return dateKey(new Date()); }
function parseKey(k) { const p = String(k).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function keyAddDays(k, n) { return dateKey(addDays(parseKey(k), n)); }
function namaHari(k) { return HARI[parseKey(k).getDay()]; }
function hariSingkat(k) { return HARI[parseKey(k).getDay()].slice(0, 3); }
function bulanTahun(d) { return BULAN[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtTanggal(k) { const d = parseKey(k); return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtTanggalPanjang(k) { return namaHari(k) + ', ' + fmtTanggal(k); }
function fmtHM(t) { return t ? String(t).slice(0, 5).replace(':', '.') : '—'; }
function nowHM() { const n = new Date(); return pad(n.getHours()) + ':' + pad(n.getMinutes()); }
function toMin(t) { const p = String(t || '00:00').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
function fromMin(m) { return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function debounce(fn, ms) { let t; return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }

function plural(n, satuan) { return n + ' ' + satuan; }

/* Sortir agenda: terdekat dahulu (tanggal, lalu jam) */
function sortAgenda(list) {
  return list.slice().sort((a, b) => (a.tanggal + ' ' + (a.jamMulai || '99:99')).localeCompare(b.tanggal + ' ' + (b.jamMulai || '99:99')));
}

/* Agenda dianggap terlambat: belum selesai & lewat waktu */
function isLate(a) {
  if (a.status === 'Selesai' || a.status === 'Dibatalkan') return false;
  const t = todayKey(), hm = nowHM();
  if (a.tanggal < t) return true;
  if (a.tanggal === t && (a.jamSelesai || a.jamMulai || '17:00') < hm) return true;
  return false;
}
function statusTampil(a) { return isLate(a) ? 'Terlambat' : a.status; }

function parseList(v) {
  try { const x = JSON.parse(v || '[]'); return Array.isArray(x) ? x : []; }
  catch (e) { return []; }
}
function checklistDone(c) { return c.filter(i => i.selesai).length; }

function compressImage(file, maxW, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      cb(cv.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => cb(null);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   3. STATE & PENYIMPANAN LOKAL
   ============================================================ */

const State = {
  settings: JSON.parse(JSON.stringify(SETTINGS_DEFAULT)),
  agenda: [],
  piket: [],
  master: [],
  log: [],
  user: null,
  unlocked: false,        // sesi terbuka setelah kata sandi benar (hanya di memori)
  _pwd: '',               // kata sandi sesi (tidak disimpan permanen)
  offline: false,
  demo: false,            // mode demo (belum ada koneksi GAS)
  currentView: 'dashboard',
  charts: {},             // referensi canvas untuk redraw
  notifs: [],
  calendar: { y: new Date().getFullYear(), m: new Date().getMonth(), selected: todayKey() },
  piketCal: { y: new Date().getFullYear(), m: new Date().getMonth() },
  laporanMonth: todayKey().slice(0, 7),
  agendaFilter: { range: 'all', cat: '', status: '', q: '' },
  piketFilter: 'all',
  masterFilter: { q: '', cat: '', aktif: 'all' },
  editAgendaId: null,
  lastSync: 0,            // stempel waktu sinkronisasi terakhir
  editMasterId: null,
  detailAgendaId: null,
  checklistDraft: [],
  _clockTimer: null,
  _remindTimer: null,
  _pull: { startY: 0, pulling: false },
};

function lsGet(key, def) { try { const v = localStorage.getItem(key); return v === null ? def : JSON.parse(v); } catch (e) { return def; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* penuh */ } }
function lsDel(key) { try { localStorage.removeItem(key); } catch (e) { /* abaikan */ } }

function cacheData() { lsSet(K.s_data, { ts: Date.now(), agenda: State.agenda, piket: State.piket, master: State.master }); }
function cacheSettings() { lsSet(K.s_settings, State.settings); }

function loadCache() {
  State.settings = { ...JSON.parse(JSON.stringify(SETTINGS_DEFAULT)), ...lsGet(K.s_settings, {}) };
  const d = lsGet(K.s_data, null);
  if (d) { State.agenda = d.agenda || []; State.piket = d.piket || []; State.master = d.master || []; }
}

/* Antrian operasi offline */
function queueAdd(op) { const q = lsGet(K.s_queue, []); q.push({ ...op, _qid: uid() }); lsSet(K.s_queue, q); }
function queueAll() { return lsGet(K.s_queue, []); }
function queueClear() { lsDel(K.s_queue); }

/* Kunci notifikasi agar tidak berulang (per hari) */
function wasNotified(key) { const m = lsGet(K.s_notified, {}); return !!m[key]; }
function markNotified(key) {
  const m = lsGet(K.s_notified, {});
  m[key] = Date.now();
  // simpan maks. 200 kunci
  const ks = Object.keys(m);
  if (ks.length > 200) { ks.sort((a, b) => m[a] - m[b]).slice(0, ks.length - 200).forEach(k => delete m[k]); }
  lsSet(K.s_notified, m);
}

/* Daftar notifikasi panel */
function addNotif(icon, msg) {
  State.notifs.unshift({ t: Date.now(), icon, msg });
  State.notifs = State.notifs.slice(0, 30);
  lsSet(K.s_notifs, State.notifs);
  const b = $('#notif-badge');
  if (b) b.classList.remove('hidden');
}

/* ============================================================
   4. LAPISAN DATA (Google Apps Script + Mode Demo)
   ============================================================ */

class ApiError extends Error {
  constructor(msg, code) { super(msg); this.code = code || 'err'; }
}

function isDemoMode() { return !String(State.settings.gasUrl || '').trim(); }

async function api(action, payload = {}) {
  const url = String(State.settings.gasUrl || '').trim();
  if (!url) throw new ApiError('URL Web App belum diatur di Pengaturan → Koneksi Database', 'no-url');
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action, sheets: State.settings.sheets, ...payload }),
    });
  } catch (e) {
    throw new ApiError('Tidak dapat menjangkau server (offline?)', 'net');
  }
  if (!res.ok) throw new ApiError('Server merespons status ' + res.status, 'http');
  let data;
  try { data = await res.json(); } catch (e) { throw new ApiError('Respons server bukan JSON', 'parse'); }
  if (!data || data.ok !== true) throw new ApiError((data && data.error) || 'Terjadi kesalahan pada server', 'server');
  return data;
}

/* ----- Database demo lokal (sementara, bila GAS belum diatur) ----- */
function seedDemo(db) {
  // Data contoh agar mode demo langsung bisa dieksplorasi
  const t = todayKey();
  const hm = nowHM();
  const anc = (t, s, e) => ({ id: uid(), tanggal: t, hari: namaHari(t), namaKegiatan: s, kategori: 'Pelayanan Kesehatan', jamMulai: '09:00', jamSelesai: '11:00', lokasi: 'Polindes', sasaran: 'Ibu hamil', keterangan: '', status: 'Belum', prioritas: 'Tinggi', foto: '', checklist: JSON.stringify([{ teks: 'Siapkan buku KIA', selesai: true }, { teks: 'Alat ANC', selesai: false }]), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  db.agenda = [
    { id: uid(), tanggal: t, hari: namaHari(t), namaKegiatan: 'Posyandu Balita', kategori: 'Kegiatan Rutin', jamMulai: '08:00', jamSelesai: '11:00', lokasi: 'Balai Desa', sasaran: 'Balita 0–5 tahun', keterangan: 'Penimbangan & imunisasi', status: 'Selesai', prioritas: 'Tinggi', foto: '', checklist: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), tanggal: t, hari: namaHari(t), namaKegiatan: 'Kelas Ibu Hamil', kategori: 'Penyuluhan', jamMulai: '13:00', jamSelesai: '15:00', lokasi: 'Balai Desa', sasaran: 'Ibu hamil', keterangan: 'Materi persiapan persalinan', status: (toMin('13:00') <= toMin(hm) && toMin(hm) < toMin('15:00')) ? 'Berlangsung' : (toMin(hm) < toMin('13:00') ? 'Belum' : 'Selesai'), prioritas: 'Sedang', foto: '', checklist: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    anc(keyAddDays(t, 1), 'Pemeriksaan Kehamilan (ANC)', '09:00'),
    { id: uid(), tanggal: keyAddDays(t, 3), hari: namaHari(keyAddDays(t, 3)), namaKegiatan: 'Kunjungan Rumah (Home Care)', kategori: 'Kunjungan', jamMulai: '15:00', jamSelesai: '16:00', lokasi: 'Rumah sasaran', sasaran: 'Ibu nifas', keterangan: 'Kunjungan nifas hari ke-3', status: 'Belum', prioritas: 'Tinggi', foto: '', checklist: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), tanggal: keyAddDays(t, 6), hari: namaHari(keyAddDays(t, 6)), namaKegiatan: 'Penyuluhan Kesehatan Masyarakat', kategori: 'Penyuluhan', jamMulai: '09:00', jamSelesai: '10:30', lokasi: 'Balai Desa', sasaran: 'Masyarakat', keterangan: 'PHBS & PSN', status: 'Belum', prioritas: 'Sedang', foto: '', checklist: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uid(), tanggal: keyAddDays(t, 9), hari: namaHari(keyAddDays(t, 9)), namaKegiatan: 'SDIDTK', kategori: 'Program', jamMulai: '08:00', jamSelesai: '10:00', lokasi: 'Posyandu', sasaran: 'Balita', keterangan: 'Deteksi tumbuh kembang', status: 'Belum', prioritas: 'Sedang', foto: '', checklist: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  const pk = (off, shift, cat) => ({ id: uid(), tanggal: keyAddDays(t, off), shift, catatan: cat, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  db.piket = [pk(1, 'Pagi', 'Jaga pagi'), pk(4, 'Siang', 'Jaga siang'), pk(8, 'Malam', 'Jaga malam')];
  db._seeded = true;
}

const Demo = {
  db() { return lsGet(K.s_demo, { agenda: [], piket: [], master: [], log: [], _seeded: false }); },
  save(db) { lsSet(K.s_demo, db); },
  async getAll() {
    const db = this.db();
    if (!db.master.length) { db.master = JSON.parse(JSON.stringify(MASTER_DEFAULT)); }
    if (!db._seeded) seedDemo(db);
    this.save(db);
    return { agenda: db.agenda, piket: db.piket, master: db.master, log: db.log };
  },
  async saveAgenda(it) { const db = this.db(); const i = db.agenda.findIndex(x => x.id === it.id); if (i >= 0) db.agenda[i] = it; else db.agenda.push(it); this.save(db); return it; },
  async deleteAgenda(id) { const db = this.db(); db.agenda = db.agenda.filter(x => x.id !== id); this.save(db); },
  async savePiket(it) { const db = this.db(); const i = db.piket.findIndex(x => x.id === it.id); if (i >= 0) db.piket[i] = it; else db.piket.push(it); this.save(db); return it; },
  async deletePiket(id) { const db = this.db(); db.piket = db.piket.filter(x => x.id !== id); this.save(db); },
  async saveMaster(it) { const db = this.db(); const i = db.master.findIndex(x => x.id === it.id); if (i >= 0) db.master[i] = it; else db.master.push(it); this.save(db); return it; },
  async deleteMaster(id) { const db = this.db(); db.master = db.master.filter(x => x.id !== id); this.save(db); },
  async saveSettings(s) { State.settings = { ...State.settings, ...s }; this.db(); return true; },
  async log(a, d) { const db = this.db(); db.log.unshift({ id: uid(), waktu: new Date().toISOString(), aktivitas: a, detail: d || '' }); db.log = db.log.slice(0, 200); this.save(db); },
  async telegram(text) { addNotif('🤖', 'Telegram (demo): ' + text); },
};

/* Antarmuka penyimpanan terpadu.
   Catatan: aksi sensitif (master, pengaturan, hapus data, telegram)
   menyertakan kata sandi sesi; aksi harian (agenda/piket) tidak. */
const Store = {
  isDemo: isDemoMode,
  async ping() { return isDemoMode() ? { ok: true, mode: 'demo' } : api('ping'); },
  async getAll() { return isDemoMode() ? Demo.getAll() : api('getAll'); },
  async saveAgenda(it) { return isDemoMode() ? Demo.saveAgenda(it) : api('saveAgenda', { item: it }); },
  async deleteAgenda(id) { return isDemoMode() ? Demo.deleteAgenda(id) : api('deleteAgenda', { id, password: State._pwd }); },
  async savePiket(it) { return isDemoMode() ? Demo.savePiket(it) : api('savePiket', { item: it }); },
  async deletePiket(id) { return isDemoMode() ? Demo.deletePiket(id) : api('deletePiket', { id, password: State._pwd }); },
  async saveMaster(it) { return isDemoMode() ? Demo.saveMaster(it) : api('saveMaster', { item: it, password: State._pwd }); },
  async deleteMaster(id) { return isDemoMode() ? Demo.deleteMaster(id) : api('deleteMaster', { id, password: State._pwd }); },
  async saveSettings(s) { return isDemoMode() ? Demo.saveSettings(s) : api('saveSettings', { settings: s, password: State._pwd }); },
  async log(a, d) {
    try {
      if (isDemoMode()) return await Demo.log(a, d);
      return await api('log', { aktivitas: a, detail: d || '' });
    } catch (e) { return null; }
  },
  async telegram(text) { return isDemoMode() ? Demo.telegram(text) : api('telegram', { text, password: State._pwd }); },
};

/* ============================================================
   5. KUNCI & KATA SANDI
   Aplikasi terbuka langsung TANPA login. Kata sandi hanya
   melindungi tab Pengaturan → Umum (profil, kata sandi, dan
   koneksi database) — hal yang tidak boleh sembarangan diubah.
   Perubahan DATA (agenda, piket, master kegiatan) TIDAK
   memerlukan kata sandi karena bersifat dinamis.
   ============================================================ */

/* Minta kata sandi (modal). Menyelesaikan dengan true bila benar. */
function requirePassword() {
  return new Promise(resolve => {
    if (State.unlocked) { resolve(true); return; }
    openModal(`
      <form id="form-unlock">
        <div class="field">
          <label>Kata Sandi</label>
          <div class="input-group">
            <span class="input-icon">🔑</span>
            <input type="password" class="input" id="u-pass" placeholder="Masukkan kata sandi" autocomplete="off">
            <button type="button" class="input-btn" data-action="unlock-toggle">👁️</button>
          </div>
        </div>
        <p class="login-error hidden" id="unlock-error"></p>
        <div class="modal-foot">
          <button type="button" class="btn btn-soft" data-action="modal-close">Batal</button>
          <button type="submit" class="btn btn-primary">🔓 Buka</button>
        </div>
      </form>`, { title: '🔒 Kata Sandi Diperlukan' });
    const inp = $('#u-pass');
    inp.focus();
    $('#form-unlock').addEventListener('submit', e => {
      e.preventDefault();
      e.stopPropagation(); // jangan sampai handler submit global ikut jalan
      if (inp.value === State.settings.password) {
        State.unlocked = true;
        State._pwd = inp.value;
        closeModal();
        toast('🔓 Terbuka — perubahan data diizinkan', 'success');
        resolve(true);
      } else {
        const er = $('#unlock-error');
        er.textContent = 'Kata sandi salah. Coba lagi.';
        er.classList.remove('hidden');
        inp.value = '';
        inp.focus();
      }
    });
  });
}

/* Kunci kembali aplikasi (tombol 🔒 di sidebar / menu Lainnya) */
function lockApp() {
  State.unlocked = false;
  State._pwd = '';
  closeMore(); closeFab(); closeModal();
  if (State.currentView === 'pengaturan') navigate('dashboard');
  toast('🔒 Aplikasi dikunci', 'info');
}

/* ============================================================
   6. TEMA
   ============================================================ */

function systemDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyTheme() {
  const t = State.settings.tema || 'light';
  const dark = t === 'dark' || (t === 'system' && systemDark());
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  $('#theme-quick').textContent = dark ? '☀️' : '🌙';
  const meta = $('#meta-theme');
  if (meta) meta.setAttribute('content', dark ? '#0B1220' : '#0F766E');
  lsSet(K.s_theme, t);
  redrawCharts();
}
function toggleThemeQuick() {
  const t = State.settings.tema || 'light';
  State.settings.tema = t === 'dark' ? 'light' : 'dark';
  applyTheme();
  const sel = $('#set-tema');
  if (sel) { if (sel.dataset && sel.dataset.ddId) DD.set('set-tema', State.settings.tema); else sel.value = State.settings.tema; }
  toast('Tema: ' + (State.settings.tema === 'dark' ? 'Gelap 🌙' : 'Terang ☀️'), 'info');
}

/* ============================================================
   7. UI KIT
   ============================================================ */

function toast(msg, type = 'info', dur = 3200) {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = msg;
  root.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, dur);
}

function openModal(html, opts = {}) {
  const root = $('#modal-root');
  root.innerHTML = '<div class="modal-overlay" data-action="modal-backdrop"><div class="modal" style="' + (opts.style || '') + '">' +
    '<div class="modal-head"><h3>' + opts.title + '</h3><button class="icon-btn" data-action="modal-close">✕</button></div>' +
    html + '</div></div>';
}
function closeModal() { $('#modal-root').innerHTML = ''; }

function confirmDialog(text, opt = {}) {
  return new Promise(resolve => {
    openModal(
      '<p style="font-size:14.5px">' + text + '</p>' +
      '<div class="modal-foot"><button class="btn btn-soft" data-action="modal-close">Batal</button>' +
      '<button class="btn ' + (opt.danger ? 'btn-danger' : 'btn-primary') + '" id="confirm-yes">' + (opt.yesText || 'Ya, lanjutkan') + '</button></div>',
      { title: opt.title || 'Konfirmasi' }
    );
    $('#confirm-yes').onclick = () => { closeModal(); resolve(true); };
  });
}

function skeletonCards(n) {
  let h = '';
  for (let i = 0; i < n; i++) h += '<div class="card skel-card"></div>';
  return h;
}
function emptyState(icon, title, sub) {
  return '<div class="empty"><div class="e-ico">' + icon + '</div><h4>' + title + '</h4><p>' + sub + '</p></div>';
}

/* ---------- Dropdown Kustom ----------
   Mengganti <select> bawaan agar tampilan modern & konsisten
   (bukan dialog hitam bawaan Android). Nilai tersimpan di
   data-dd-val; perubahan memicu event 'change' yang ber-gelembung. */
const DD = {
  meta: {}, // id -> array opsi (dengan data tambahan utk autofill)
  render(id, options, cur, placeholder) {
    const opts = options.map(o => (typeof o === 'string') ? { v: o, l: o } : o);
    DD.meta[id] = opts;
    const sel = opts.find(o => o.v === cur) || null;
    return `
    <div class="dd" id="${id}" data-dd data-dd-id="${id}" data-dd-val="${escapeHtml(sel ? sel.v : '')}">
      <button type="button" class="dd-btn" data-action="dd-toggle">
        <span class="dd-val">${sel ? escapeHtml(sel.l) : escapeHtml(placeholder || 'Pilih…')}</span>
        <span class="dd-caret">▾</span>
      </button>
      <div class="dd-panel hidden" data-dd-panel>
        ${opts.map(o => '<button type="button" class="dd-opt ' + (o.v === cur ? 'sel' : '') + '" data-action="dd-opt" data-dd-opt="' + escapeHtml(o.v) + '">' + escapeHtml(o.l) + '<span class="dd-check">✓</span></button>').join('')}
      </div>
    </div>`;
  },
  val(id) {
    const el = document.querySelector('[data-dd-id="' + id + '"]');
    return el ? el.dataset.ddVal : '';
  },
  set(id, v) {
    const el = document.querySelector('[data-dd-id="' + id + '"]');
    if (!el) return;
    el.dataset.ddVal = v;
    const meta = (DD.meta[id] || []).find(o => o.v === v);
    const lbl = el.querySelector('.dd-val');
    if (lbl) lbl.textContent = meta ? meta.l : v;
    el.querySelectorAll('.dd-opt').forEach(o => o.classList.toggle('sel', o.dataset.ddOpt === v));
  },
};
function closeAllDD() {
  document.querySelectorAll('.dd.open').forEach(d => {
    d.classList.remove('open');
    const p = d.querySelector('[data-dd-panel]');
    if (p) p.classList.add('hidden');
  });
}

let _progressEl = null;
function setProgress(pct, show) {
  if (!_progressEl) { _progressEl = document.createElement('div'); _progressEl.className = 'progress-top'; document.body.appendChild(_progressEl); }
  _progressEl.style.width = pct + '%';
  _progressEl.style.display = show === false ? 'none' : 'block';
  if (pct >= 100) setTimeout(() => { _progressEl.style.display = 'none'; _progressEl.style.width = '0%'; }, 600);
}

/* ============================================================
   8. GRAFIK CANVAS (murni, tanpa library)
   ============================================================ */

function prepCanvas(cv) {
  if (!cv || !cv.getContext) return null;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  const dpr = (window.devicePixelRatio || 1);
  const w = cv.clientWidth || 300, h = cv.clientHeight || 200;
  cv.width = w * dpr; cv.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawBarChart(cv, labels, values, opts = {}) {
  const p = prepCanvas(cv);
  if (!p) return;
  const { ctx, w, h } = p;
  const muted = cssVar('--text-muted') || '#64748B';
  const border = cssVar('--border') || '#E2E8F0';
  const color = opts.color || cssVar('--primary-2') || '#14B8A6';
  const max = Math.max(1, ...values);
  const bw = Math.min(34, (w - 40) / values.length * 0.55);
  const step = Math.ceil(max / 4);
  ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
  // garis horizontal
  for (let g = 0; g <= 4; g++) {
    const y = h - 22 - (h - 34) * (g / 4);
    ctx.strokeStyle = border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(w - 6, y); ctx.stroke();
    ctx.fillStyle = muted; ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(max * g / 4)), 18, y + 3);
  }
  values.forEach((v, i) => {
    const x = 34 + i * ((w - 40) / values.length) + ((w - 40) / values.length - bw) / 2;
    const bh = (h - 40) * (v / max);
    const y = h - 22 - bh;
    const g = ctx.createLinearGradient(0, y, 0, h - 22);
    g.addColorStop(0, color); g.addColorStop(1, color + '66');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, [6, 6, 0, 0]);
    ctx.fill();
    ctx.fillStyle = muted; ctx.textAlign = 'center';
    ctx.fillText(String(labels[i]), x + bw / 2, h - 8);
    if (v > 0) { ctx.fillStyle = cssVar('--text') || '#0F172A'; ctx.fillText(String(v), x + bw / 2, y - 4); }
  });
}

function drawDonut(cv, items, opts = {}) {
  const p = prepCanvas(cv);
  if (!p) return;
  const { ctx, w, h } = p;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 8;
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) { ctx.fillStyle = cssVar('--text-muted') || '#94A3B8'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Tidak ada data', cx, cy); return; }
  let a0 = -Math.PI / 2;
  items.forEach(it => {
    const a1 = a0 + (it.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = it.color;
    ctx.fill();
    a0 = a1;
  });
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = cssVar('--surface') || '#fff';
  ctx.fill();
  ctx.fillStyle = cssVar('--text') || '#0F172A';
  ctx.font = '700 ' + Math.round(r * 0.28) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(total), cx, cy + 4);
}

function drawRing(cv, pct, color) {
  const p = prepCanvas(cv);
  if (!p) return;
  const { ctx, w, h } = p;
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 6, lw = 11;
  ctx.lineWidth = lw;
  ctx.strokeStyle = cssVar('--gray-soft') || '#F1F5F9';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color || cssVar('--primary-2') || '#14B8A6';
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.min(100, Math.max(0, pct)) / 100) * Math.PI * 2); ctx.stroke();
}

function redrawCharts() {
  if (State.currentView === 'dashboard') renderDashCharts();
  else if (State.currentView === 'laporan') renderLaporanCharts();
}

/* ============================================================
   9. NAVIGASI & ROUTER
   ============================================================ */

const VIEWS = {
  dashboard: { render: renderDashboard, sub: () => 'Ringkasan hari Anda' },
  agenda: { render: renderAgenda, sub: () => 'Daftar kegiatan' },
  kalender: { render: renderKalender, sub: () => bulanTahun(new Date(State.calendar.y, State.calendar.m, 1)) },
  piket: { render: renderPiket, sub: () => bulanTahun(new Date(State.piketCal.y, State.piketCal.m, 1)) },
  laporan: { render: renderLaporan, sub: () => 'Rekap ' + State.laporanMonth.replace('-', ' ') },
  pengaturan: { render: renderPengaturan, sub: () => 'Konfigurasi aplikasi' },
  tentang: { render: renderTentang, sub: () => 'v' + APP.versi },
};

function navigate(view, silent) {
  if (!VIEWS[view]) view = 'dashboard';
  State.currentView = view;
  $$('.view').forEach(v => v.classList.remove('active'));
  const el = $('#view-' + view);
  if (el) { el.classList.add('active'); window.scrollTo({ top: 0 }); }
  $('#view-title').textContent = el ? el.dataset.title : view;
  const sub = VIEWS[view].sub();
  $('#view-subtitle').textContent = typeof sub === 'function' ? sub() : sub;
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === view));
  $$('.bn-item').forEach(n => n.classList.toggle('active', n.dataset.nav === view));
  closeSidebar(); closeFab(); closeMore(); closeNotifs();
  clearInterval(State._cdTimer);
  document.title = (el ? el.dataset.title : '') + ' — ' + APP.nama;
  if (!silent) VIEWS[view].render();
}

/* ============================================================
   10. VIEW: DASHBOARD
   ============================================================ */

function renderDashboard() {
  const el = $('#view-dashboard');
  const s = State.settings;
  const now = new Date();
  const tKey = todayKey();
  const agendaToday = sortAgenda(State.agenda.filter(a => a.tanggal === tKey));
  const agendaBesok = sortAgenda(State.agenda.filter(a => a.tanggal === keyAddDays(tKey, 1)));
  const bulanIni = tKey.slice(0, 7);
  const mAgenda = State.agenda.filter(a => a.tanggal.slice(0, 7) === bulanIni);
  const done = mAgenda.filter(a => a.status === 'Selesai').length;
  const pct = mAgenda.length ? Math.round((done / mAgenda.length) * 100) : 0;
  const total = State.agenda.length;
  const selesai = State.agenda.filter(a => a.status === 'Selesai').length;
  const belum = State.agenda.filter(a => ['Belum', 'Berlangsung'].includes(a.status)).length;
  const terlambat = State.agenda.filter(isLate).length;
  const piketHariIni = State.piket.filter(p => p.tanggal === tKey);
  // "Piket Berikutnya" harus tanggal SETELAH hari ini — kalau ikut menyertakan
  // piket hari ini yang belum mulai, kartu ini jadi duplikat "Jadwal Piket
  // Hari Ini" di atasnya (itu penyebab tampil 2x "Shift Siang" yang sama).
  const nextPiket = sortAgenda(State.piket.map(p => ({ ...p, jamMulai: SHIFT_JAM(p.shift) }))).find(p => p.tanggal > tKey);
  const info = shiftInfo(now);

  const foto = s.fotoProfil ? '<img class="avatar avatar-lg" src="' + s.fotoProfil + '" alt="Foto">' : '<div class="avatar avatar-lg" style="background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:30px">👩‍⚕️</div>';

  el.innerHTML = `
  <div class="hero">
    <div class="greet">${sapaan()},</div>
    <h1>${escapeHtml(s.namaBidan || 'Bidan')}</h1>
    <div class="hero-row">
      <div class="clock" id="hero-clock">${clockStr()}</div>
      <div class="hero-date">${fmtTanggalPanjang(tKey)}</div>
      ${foto}
    </div>
    <div class="small" style="opacity:.85;margin-top:10px">🔄 Terakhir sinkron: ${State.lastSync ? new Date(State.lastSync).toLocaleString('id-ID') : '—'} ${isDemoMode() ? '• Mode Demo (lokal)' : '• Spreadsheet'}</div>
  </div>

  ${isDemoMode() ? `<div class="card mb-16" style="border-left:5px solid var(--amber);background:var(--amber-soft)">
    <div class="small"><b>⚠️ Mode Demo aktif</b> — perangkat ini belum terhubung Google Spreadsheet (koneksi tersimpan per perangkat; mengisi di komputer tidak otomatis berlaku di HP). Data hanya tersimpan di perangkat ini.</div>
    <div class="flex flex-wrap mt-8">
      <button class="btn btn-primary btn-sm" data-action="go-koneksi">🔌 Hubungkan Database</button>
      <button class="btn btn-soft btn-sm" data-action="paste-koneksi">📥 Tempel Koneksi dari Perangkat Lain</button>
      <button class="btn btn-soft btn-sm" data-action="migrate-demo">📤 Pindahkan Data Demo → Spreadsheet</button>
    </div>
  </div>` : ''}

  <!-- FASE 1: Enhanced KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-icon" style="background:var(--primary-soft)">📋</div>
      <div class="kpi-content">
        <div class="kpi-value">${total}</div>
        <div class="kpi-label">Total Agenda</div>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon" style="background:var(--green-soft)">✅</div>
      <div class="kpi-content">
        <div class="kpi-value">${selesai}</div>
        <div class="kpi-label">Selesai</div>
        <div class="kpi-delta ${pct >= 70 ? 'up' : ''}">${pct}%</div>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon" style="background:var(--blue-soft)">📅</div>
      <div class="kpi-content">
        <div class="kpi-value">${agendaToday.length + agendaBesok.length}</div>
        <div class="kpi-label">Hari ini + Besok</div>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon" style="background:var(--red-soft)">🚨</div>
      <div class="kpi-content">
        <div class="kpi-value">${terlambat}</div>
        <div class="kpi-label">Terlambat</div>
      </div>
    </div>
  </div>

  <!-- FASE 1: Quick Templates from Master -->
  ${renderQuickTemplates()}

  <div class="dash-grid">
    <div class="card">
      <div class="card-title">📅 Kalender Mini <span class="grow"></span><span class="muted small">${bulanTahun(now)}</span></div>
      ${miniCalendar(tKey)}
    </div>

    <div class="card">
      <div class="card-title">📈 Kegiatan 7 Hari Terakhir</div>
      <canvas class="chart" id="dash-chart"></canvas>
    </div>

    <div class="card">
      <div class="card-title">📋 Agenda Hari Ini <span class="grow"></span><span class="badge" style="background:var(--primary-soft);color:var(--primary)">${agendaToday.length}</span></div>
      ${agendaToday.length ? agendaToday.slice(0, 4).map(agendaCard).join('') : '<p class="muted small">Tidak ada agenda hari ini 🎉</p>'}
      ${agendaToday.length > 4 ? '<button class="btn btn-soft btn-sm btn-block" data-action="go-agenda">Lihat semua →</button>' : ''}
    </div>

    <div class="card">
      <div class="card-title">📋 Agenda Besok <span class="grow"></span><span class="badge" style="background:var(--accent-soft);color:var(--accent)">${agendaBesok.length}</span></div>
      ${agendaBesok.length ? agendaBesok.slice(0, 4).map(agendaCard).join('') : '<p class="muted small">Tidak ada agenda besok.</p>'}
    </div>

    <div class="card">
      <div class="card-title">🕐 Jadwal Piket Hari Ini</div>
      ${piketHariIni.length ? piketHariIni.map(piketCard).join('') : '<p class="muted small">Tidak ada piket hari ini.</p>'}
      <div class="mt-8">
        <div class="card-title mb-8">🕐 Piket Berikutnya</div>
        ${nextPiket ? piketCard(nextPiket) : '<p class="muted small">Belum ada jadwal piket berikutnya.</p>'}
      </div>
      ${info.current ? '<div class="chip mt-8" style="background:var(--green-soft);color:var(--green)">● Shift ' + info.current.label + ' sedang berlangsung</div>' : ''}
    </div>

    <div class="card">
      <div class="card-title">🎯 Progress Bulanan</div>
      <div style="display:flex;align-items:center;gap:18px">
        <div style="position:relative;flex-shrink:0">
          <canvas class="ring" id="dash-ring"></canvas>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px">${pct}%</div>
        </div>
        <div class="small muted">
          <div><b style="color:var(--text)">${done}</b> dari <b style="color:var(--text)">${mAgenda.length}</b> agenda selesai</div>
          <div class="mt-8">Bulan: <b style="color:var(--text)">${BULAN[now.getMonth()]}</b></div>
        </div>
      </div>
    </div>

    <div class="card wide">
      <div class="card-title">🕓 Timeline Kegiatan</div>
      <div class="timeline">
        ${timelineHTML()}
      </div>
    </div>

    <div class="card wide">
      <div class="card-title">⚡ Menu Cepat</div>
      <div class="quick-grid">
        <button class="quick-item" data-action="go-agenda-form"><span>📋</span>Tambah Agenda</button>
        <button class="quick-item" data-action="go-piket-add"><span>🕐</span>Tambah Piket</button>
        <button class="quick-item" data-action="go-laporan"><span>📊</span>Laporan</button>
        <button class="quick-item" data-action="toggle-theme"><span>🎨</span>Ganti Tema</button>
      </div>
    </div>
  </div>`;

  State.charts.dashBar = $('#dash-chart');
  State.charts.dashRing = $('#dash-ring');
  renderDashCharts();
}

function renderDashCharts() {
  const cv = State.charts.dashBar;
  if (cv) {
    const labels = [], values = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const k = dateKey(d);
      labels.push(hariSingkat(k));
      values.push(State.agenda.filter(a => a.tanggal === k).length);
    }
    drawBarChart(cv, labels, values, { color: cssVar('--primary-2') });
  }
  const ring = State.charts.dashRing;
  if (ring) {
    const bulanIni = todayKey().slice(0, 7);
    const mAgenda = State.agenda.filter(a => a.tanggal.slice(0, 7) === bulanIni);
    const pct = mAgenda.length ? Math.round((mAgenda.filter(a => a.status === 'Selesai').length / mAgenda.length) * 100) : 0;
    drawRing(ring, pct);
  }
}

function sapaan() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi ☀️';
  if (h < 15) return 'Selamat siang 🌤️';
  if (h < 18) return 'Selamat sore 🌇';
  return 'Selamat malam 🌙';
}
function clockStr() {
  const n = new Date();
  return pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds());
}

function miniCalendar(selKey) {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth();
  const first = new Date(y, m, 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const has = {};
  State.agenda.forEach(a => { has[a.tanggal] = true; });
  let h = '<table class="mini-cal"><tr>' + ['S', 'S', 'R', 'K', 'J', 'S', 'M'].map(x => '<th>' + x + '</th>').join('') + '</tr>';
  for (let w = 0; w < 6; w++) {
    h += '<tr>';
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, w * 7 + i);
      const k = dateKey(day);
      const cls = ['day'];
      if (k === selKey) cls.push('today');
      if (day.getMonth() !== m) cls.push('other');
      if (has[k]) cls.push('has');
      h += '<td><span class="' + cls.join(' ') + '">' + day.getDate() + '</span></td>';
    }
    h += '</tr>';
  }
  return h + '</table>';
}

function timelineHTML() {
  const now = new Date();
  const tKey = todayKey();
  const upcoming = State.agenda
    .filter(a => (a.tanggal > tKey) || (a.tanggal === tKey && (a.jamMulai || '99:99') >= nowHM()))
    .filter(a => a.status !== 'Dibatalkan')
    .sort((a, b) => (a.tanggal + ' ' + a.jamMulai).localeCompare(b.tanggal + ' ' + b.jamMulai))
    .slice(0, 6);
  if (!upcoming.length) return '<p class="muted small">Tidak ada kegiatan mendatang.</p>';
  return upcoming.map(a => `
    <div class="tl-item ${a.status === 'Selesai' ? 'done' : ''} ${isLate(a) ? 'late' : ''}">
      <div class="tl-time">${a.tanggal === tKey ? 'Hari ini' : fmtTanggal(a.tanggal)} • ${fmtHM(a.jamMulai)}${a.jamSelesai ? '–' + fmtHM(a.jamSelesai) : ''}</div>
      <div class="tl-name">${a.ikon ? '' : ''}${escapeHtml(a.namaKegiatan)}</div>
      <div class="tl-meta">${escapeHtml(a.lokasi || '')} • ${escapeHtml(a.kategori || '')}</div>
    </div>`).join('');
}

/* ============================================================
   11. VIEW: AGENDA (+ form, detail, foto, checklist)
   ============================================================ */

function renderAgenda() {
  const el = $('#view-agenda');
  const f = State.agendaFilter;
  el.innerHTML = `
  <div class="filter-bar">
    <div class="chip-row" data-role="agenda-range">
      ${chipBtn('all', 'Semua', f.range)}${chipBtn('today', 'Hari Ini', f.range)}${chipBtn('tomorrow', 'Besok', f.range)}
      ${chipBtn('week', 'Minggu Ini', f.range)}${chipBtn('month', 'Bulan Ini', f.range)}
    </div>
    <div class="search-box"><span class="s-ico">🔍</span><input class="input" id="agenda-search" placeholder="Cari kegiatan, lokasi, keterangan…" value="${escapeHtml(f.q)}"></div>
    <div class="filter-selects">
      ${DD.render('agenda-cat', [{ v: '', l: 'Semua Kategori' }].concat(Object.keys(KATEGORI)), f.cat)}
      ${DD.render('agenda-status', [{ v: '', l: 'Semua Status' }].concat(STATUS_LIST), f.status)}
    </div>
  </div>
  <div id="agenda-list">${skeletonCards(4)}</div>`;

  // render daftar (setelah DOM siap)
  requestAnimationFrame(() => renderAgendaList());
}

function chipBtn(val, label, cur) {
  return '<button class="chip ' + (cur === val ? 'active' : '') + '" data-action="agenda-range" data-val="' + val + '">' + label + '</button>';
}

function getFilteredAgenda() {
  const f = State.agendaFilter;
  const t = todayKey();
  let list = State.agenda.slice();
  if (f.range === 'today') list = list.filter(a => a.tanggal === t);
  else if (f.range === 'tomorrow') list = list.filter(a => a.tanggal === keyAddDays(t, 1));
  else if (f.range === 'week') {
    const d = new Date();
    const start = addDays(d, -((d.getDay() + 6) % 7));
    const end = addDays(start, 6);
    list = list.filter(a => a.tanggal >= dateKey(start) && a.tanggal <= dateKey(end));
  } else if (f.range === 'month') list = list.filter(a => a.tanggal.slice(0, 7) === t.slice(0, 7));
  if (f.cat) list = list.filter(a => a.kategori === f.cat);
  if (f.status) list = list.filter(a => (f.status === 'Terlambat' ? isLate(a) : a.status === f.status));
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter(a => (a.namaKegiatan + ' ' + a.lokasi + ' ' + a.keterangan + ' ' + a.sasaran + ' ' + a.kategori).toLowerCase().includes(q));
  }
  return sortAgenda(list);
}

function renderAgendaList() {
  const wrap = $('#agenda-list');
  if (!wrap) return;
  const list = getFilteredAgenda();
  if (!list.length) {
    wrap.innerHTML = emptyState('🗓️', 'Tidak ada agenda', 'Coba ubah filter atau tambahkan agenda baru.');
    return;
  }
  wrap.innerHTML = list.map(agendaCard).join('');
}

function agendaCard(a) {
  const st = statusTampil(a);
  const done = checklistDone(parseList(a.checklist));
  const totalC = parseList(a.checklist).length;
  const prio = a.prioritas || 'Sedang';
  const lateness = isLate(a) ? '<span class="badge status-Terlambat">⚠️ Terlambat</span>' : '';
  return `
  <button class="card agenda-card" data-action="agenda-detail" data-id="${escapeHtml(a.id)}" style="--prio-color:${PRIO_COLOR[prio] || '#14B8A6'}">
    <div class="agenda-head">
      <span class="agenda-date">📅 ${fmtTanggal(a.tanggal)} • ${namaHari(a.tanggal)}</span>
      <span class="badge status-${st}">${st}</span>
      ${lateness}
      <span class="badge prio-${prio}">${escapeHtml(prio)}</span>
    </div>
    <div class="agenda-name">${escapeHtml(a.namaKegiatan || 'Tanpa nama')}</div>
    <div class="agenda-meta">
      <span>🕐 <b>${fmtHM(a.jamMulai)}${a.jamSelesai ? '–' + fmtHM(a.jamSelesai) : ''}</b></span>
      <span>🏷️ ${escapeHtml(a.kategori || '—')}</span>
      <span>📍 ${escapeHtml(a.lokasi || '—')}</span>
      ${a.sasaran ? '<span>🎯 ' + escapeHtml(a.sasaran) + '</span>' : ''}
    </div>
    <div class="agenda-foot">
      ${a.foto ? '<img src="' + a.foto + '" alt="foto" class="agenda-photo" loading="lazy">' : '<span></span>'}
      ${totalC ? '<span class="check-progress">✅ ' + done + '/' + totalC + '<span class="bar"><i style="width:' + Math.round(done / totalC * 100) + '%"></i></span></span>' : ''}
    </div>
  </button>`;
}

const PRIO_COLOR = (typeof window !== 'undefined' && window.PRIO_COLOR) || { Rendah: '#94A3B8', Sedang: '#3B82F6', Tinggi: '#F59E0B', Urgent: '#EF4444' };

/* ---------- Form tambah/edit agenda ---------- */
function openAgendaForm(id) {
  State.editAgendaId = id || null;
  State.checklistDraft = [];
  State._fotoDraft = undefined;
  const a = id ? State.agenda.find(x => x.id === id) : null;
  const today = todayKey();
  const aktif = State.master.filter(m => m.aktif);
  const opt = (a ? escapeHtml(a.namaKegiatan) : '') ;

  openModal(`
  <form id="form-agenda" data-edit="${id || ''}">
    <div class="form-grid">
      <div class="field"><label>Tanggal *</label><input type="date" class="input" id="a-tanggal" required value="${a ? a.tanggal : today}"></div>
      <div class="field"><label>Hari (otomatis)</label><input type="text" class="input" id="a-hari" readonly value="${a ? namaHari(a.tanggal) : namaHari(today)}" style="background:var(--gray-soft)"></div>
      <div class="field full"><label>Master Kegiatan (isi otomatis)</label>
        ${DD.render('a-master', [{ v: '', l: '— Pilih Master Kegiatan —' }].concat(aktif.map(m => ({ v: m.id, l: m.ikon + ' ' + m.nama, nama: m.nama, kat: m.kategori, lok: m.lokasiDefault, sas: m.sasaranDefault, dur: m.durasiDefault, ket: m.keteranganDefault }))), '', '— Pilih Master Kegiatan —')}
      </div>
      <div class="field full"><label>Nama Kegiatan *</label><input class="input" id="a-nama" required placeholder="cth: Posyandu Balita" value="${opt}"></div>
      <div class="field"><label>Kategori *</label>
        ${DD.render('a-kategori', Object.keys(KATEGORI), (a && a.kategori) || 'Pelayanan Kesehatan')}
      </div>
      <div class="field"><label>Prioritas</label>
        ${DD.render('a-prioritas', PRIORITAS_LIST, (a && a.prioritas) || 'Sedang')}
      </div>
      <div class="field"><label>Jam Mulai</label><input type="time" class="input" id="a-jam1" value="${a ? a.jamMulai : '08:00'}"></div>
      <div class="field"><label>Jam Selesai</label><input type="time" class="input" id="a-jam2" value="${a ? a.jamSelesai : ''}"></div>
      <div class="field full"><label>Lokasi</label><input class="input" id="a-lokasi" placeholder="cth: Balai Desa" value="${a ? escapeHtml(a.lokasi) : ''}"></div>
      <div class="field"><label>Sasaran</label><input class="input" id="a-sasaran" placeholder="cth: Ibu hamil" value="${a ? escapeHtml(a.sasaran) : ''}"></div>
      <div class="field"><label>Status</label>
        ${DD.render('a-status', STATUS_LIST, (a && a.status) || 'Belum')}
      </div>
      <div class="field full"><label>Keterangan</label><textarea class="input" id="a-ket" placeholder="Catatan kegiatan…">${a ? escapeHtml(a.keterangan) : ''}</textarea></div>

      <div class="field full">
        <label>Lampiran Foto</label>
        <div class="upload-box" data-action="pick-photo">
          <img id="a-foto-preview" src="${a && a.foto ? a.foto : ''}" alt="" style="${a && a.foto ? '' : 'display:none'}">
          <div id="a-foto-placeholder" class="muted small" ${a && a.foto ? 'style="display:none"' : ''}>📷 Ketuk untuk memilih foto</div>
        </div>
        <input type="file" id="a-foto" accept="image/*" class="hidden">
        <button type="button" class="btn btn-soft btn-sm mt-8 hidden" id="a-foto-hapus" data-action="remove-photo">🗑️ Hapus foto</button>
      </div>

      <div class="field full">
        <label>Checklist Kegiatan</label>
        <div id="checklist-box"></div>
        <div class="flex mt-8"><input class="input" id="ck-input" placeholder="Tambah item…"><button type="button" class="btn btn-soft" data-action="ck-add">+ Tambah</button></div>
      </div>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-soft" data-action="agenda-reset">↺ Reset</button>
      <button type="submit" class="btn btn-primary">💾 Simpan</button>
    </div>
  </form>`, { title: a ? '✏️ Edit Agenda' : '➕ Tambah Agenda' });

  // isi ulang checklist draft
  if (a) State.checklistDraft = parseList(a.checklist);
  renderChecklistDraft();

  $('#a-master').addEventListener('change', () => {
    const meta = DD.meta['a-master'] || [];
    const o = meta.find(x => x.v === DD.val('a-master'));
    if (!o || !o.nama) return;
    $('#a-nama').value = o.nama;
    DD.set('a-kategori', o.kat);
    $('#a-lokasi').value = o.lok || '';
    $('#a-sasaran').value = o.sas || '';
    $('#a-ket').value = o.ket || '';
    const dur = parseInt(o.dur || '0', 10);
    if (dur && $('#a-jam1').value) $('#a-jam2').value = fromMin(toMin($('#a-jam1').value) + dur);
  });
  $('#a-tanggal').addEventListener('change', e => { $('#a-hari').value = namaHari(e.target.value); });
  $('#a-foto').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    compressImage(f, 900, dataUrl => {
      if (dataUrl) {
        $('#a-foto-preview').src = dataUrl; $('#a-foto-preview').style.display = '';
        $('#a-foto-placeholder').style.display = 'none';
        $('#a-foto-hapus').classList.remove('hidden');
        State._fotoDraft = dataUrl;
      } else toast('Foto gagal diproses', 'error');
    });
  });
}

function renderChecklistDraft() {
  const box = $('#checklist-box');
  if (!box) return;
  box.innerHTML = State.checklistDraft.map((it, i) => `
    <div class="flex mb-8">
      <input type="checkbox" class="ck-done" data-i="${i}" ${it.selesai ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--primary)">
      <input class="input" value="${escapeHtml(it.teks)}" data-i="${i}" data-role="ck-teks" placeholder="Item checklist…">
      <button type="button" class="icon-btn" data-action="ck-del" data-i="${i}">🗑️</button>
    </div>`).join('') || '<p class="muted small">Belum ada item.</p>';
}

async function saveAgendaForm(e) {
  e.preventDefault();
  const id = State.editAgendaId || uid();
  const item = {
    id,
    tanggal: $('#a-tanggal').value,
    hari: namaHari($('#a-tanggal').value),
    namaKegiatan: $('#a-nama').value.trim(),
    kategori: DD.val('a-kategori'),
    jamMulai: $('#a-jam1').value || '',
    jamSelesai: $('#a-jam2').value || '',
    lokasi: $('#a-lokasi').value.trim(),
    sasaran: $('#a-sasaran').value.trim(),
    keterangan: $('#a-ket').value.trim(),
    status: DD.val('a-status'),
    prioritas: DD.val('a-prioritas'),
    foto: State._fotoDraft !== undefined ? State._fotoDraft : (State.agenda.find(x => x.id === id) || {}).foto || '',
    checklist: JSON.stringify(State.checklistDraft),
    updatedAt: new Date().toISOString(),
  };
  if (!item.tanggal || !item.namaKegiatan) { toast('Tanggal dan nama kegiatan wajib diisi', 'error'); return; }
  const lama = State.agenda.find(x => x.id === id);
  if (!lama) item.createdAt = new Date().toISOString();
  else item.createdAt = lama.createdAt;

  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  setProgress(20);
  try {
    await Store.saveAgenda(item);
    setProgress(70);
    const i = State.agenda.findIndex(x => x.id === id);
    if (i >= 0) State.agenda[i] = item; else State.agenda.push(item);
    cacheData(); setProgress(100);
    closeModal();
    toast(lama ? '✅ Agenda diperbarui' : '✅ Agenda disimpan', 'success');
    Store.log(lama ? 'Edit agenda' : 'Tambah agenda', item.namaKegiatan);
    renderCurrentView();
  } catch (err) {
    setProgress(0);
    queueAdd({ action: 'saveAgenda', item });
    toast('⚠️ Offline — agenda disimpan ke antrian lokal: ' + err.message, 'warn', 4200);
    const i = State.agenda.findIndex(x => x.id === id);
    if (i >= 0) State.agenda[i] = item; else State.agenda.push(item);
    cacheData(); closeModal(); renderCurrentView();
  } finally { btn.disabled = false; }
}

function openAgendaDetail(id) {
  const a = State.agenda.find(x => x.id === id);
  if (!a) return;
  State.detailAgendaId = id;
  const ck = parseList(a.checklist);
  const st = statusTampil(a);
  openModal(`
    <div class="agenda-head" style="margin-bottom:10px">
      <span class="badge status-${st}">${st}</span>
      <span class="badge prio-${a.prioritas || 'Sedang'}">${escapeHtml(a.prioritas || 'Sedang')}</span>
      <span class="badge" style="background:var(--primary-soft);color:var(--primary)">${escapeHtml(a.kategori || '')}</span>
    </div>
    <h3 style="font-size:18px;margin-bottom:6px">${escapeHtml(a.namaKegiatan)}</h3>
    <div class="agenda-meta" style="margin-bottom:10px">
      <span>📅 <b>${fmtTanggalPanjang(a.tanggal)}</b></span>
      <span>🕐 <b>${fmtHM(a.jamMulai)}${a.jamSelesai ? '–' + fmtHM(a.jamSelesai) : ''}</b></span>
      <span>📍 ${escapeHtml(a.lokasi || '—')}</span>
      <span>🎯 ${escapeHtml(a.sasaran || '—')}</span>
    </div>
    ${a.keterangan ? '<p class="small" style="white-space:pre-line;margin-bottom:12px">' + escapeHtml(a.keterangan) + '</p>' : ''}
    ${a.foto ? '<img src="' + a.foto + '" class="photo-thumb mb-12" data-action="lightbox" alt="Dokumentasi">' : ''}
    ${ck.length ? '<div class="card-title">✅ Checklist</div><div class="mb-12">' + ck.map((c, i) => `
      <label class="check" style="margin:4px 0"><input type="checkbox" data-action="ck-toggle" data-id="${escapeHtml(a.id)}" data-i="${i}" ${c.selesai ? 'checked' : ''}>
      <span style="${c.selesai ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${escapeHtml(c.teks)}</span></label>`).join('') + '</div>' : ''}
    <div class="card-title">⚡ Ubah Status</div>
    <div class="flex flex-wrap mb-12">
      ${STATUS_LIST.map(s => '<button class="chip ' + (a.status === s ? 'active' : '') + '" data-action="status-set" data-id="' + escapeHtml(a.id) + '" data-val="' + s + '">' + s + '</button>').join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-soft" data-action="agenda-edit" data-id="${escapeHtml(a.id)}">✏️ Edit</button>
      <button class="btn btn-danger" data-action="agenda-del" data-id="${escapeHtml(a.id)}">🗑️ Hapus</button>
    </div>`,
    { title: '📋 Detail Agenda' });
}

async function setAgendaStatus(id, status) {
  const a = State.agenda.find(x => x.id === id);
  if (!a) return;
  a.status = status;
  a.updatedAt = new Date().toISOString();
  try {
    await Store.saveAgenda(a);
    toast('Status: ' + status, 'success');
    Store.log('Ubah status agenda', a.namaKegiatan + ' → ' + status);
  } catch (e) {
    queueAdd({ action: 'saveAgenda', item: a });
    toast('⚠️ Offline — perubahan diantrekan', 'warn');
  }
  cacheData();
  renderCurrentView();
  if (State.detailAgendaId === id) openAgendaDetail(id);
}

async function toggleChecklist(id, i) {
  const a = State.agenda.find(x => x.id === id);
  if (!a) return;
  const ck = parseList(a.checklist);
  if (ck[i]) ck[i].selesai = !ck[i].selesai;
  a.checklist = JSON.stringify(ck);
  try { await Store.saveAgenda(a); } catch (e) { queueAdd({ action: 'saveAgenda', item: a }); }
  cacheData();
  renderCurrentView();
  if (State.detailAgendaId === id) openAgendaDetail(id);
}

async function deleteAgenda(id) {
  const a = State.agenda.find(x => x.id === id);
  const ok = await confirmDialog('Hapus agenda <b>' + escapeHtml(a ? a.namaKegiatan : '') + '</b>?', { danger: true, title: 'Hapus Agenda', yesText: 'Ya, hapus' });
  if (!ok) return;
  try {
    await Store.deleteAgenda(id);
    State.agenda = State.agenda.filter(x => x.id !== id);
    cacheData();
    toast('🗑️ Agenda dihapus', 'success');
    Store.log('Hapus agenda', a ? a.namaKegiatan : id);
  } catch (e) {
    queueAdd({ action: 'deleteAgenda', id });
    toast('⚠️ Offline — penghapusan diantrekan', 'warn');
    State.agenda = State.agenda.filter(x => x.id !== id);
    cacheData();
  }
  renderCurrentView();
}

/* ============================================================
   12. VIEW: KALENDER
   ============================================================ */

function renderKalender() {
  const el = $('#view-kalender');
  const c = State.calendar;
  const y = c.y, m = c.m;
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const today = todayKey();
  const agendaByDay = {};
  State.agenda.forEach(a => { (agendaByDay[a.tanggal] = agendaByDay[a.tanggal] || []).push(a); });

  let cells = '';
  for (let w = 0; w < 6; w++) {
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, w * 7 + i);
      const k = dateKey(day);
      const inMonth = day.getMonth() === m;
      const items = agendaByDay[k] || [];
      const cls = ['cal-cell'];
      if (!inMonth) cls.push('other');
      if (k === today) cls.push('today');
      if (k === c.selected) cls.push('selected');
      const dots = items.slice(0, 4).map(it => '<i style="background:' + (KATEGORI[it.kategori] || '#14B8A6') + '"></i>').join('');
      const cnt = items.length ? '<span class="small" style="position:absolute;top:3px;right:6px;font-size:9px;font-weight:800;opacity:.75">' + items.length + '</span>' : '';
      cells += `<button class="${cls.join(' ')}" data-action="cal-day" data-val="${k}">${cnt}${day.getDate()}<span class="dots">${dots}</span></button>`;
    }
  }

  const selItems = sortAgenda(agendaByDay[c.selected] || []);

  el.innerHTML = `
  <div class="kal-layout">
  <div class="card kal-card">
    <div class="cal-head">
      <button class="icon-btn" data-action="cal-prev">‹</button>
      <div class="cal-title">${BULAN[m]} ${y}</div>
      <button class="icon-btn" data-action="cal-next">›</button>
    </div>
    <div class="cal-grid">
      ${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => '<div class="cal-dow">' + d + '</div>').join('')}
      ${cells}
    </div>
    <div class="cal-legend">
      <span><i style="background:var(--primary)"></i>Hari ini</span>
      <span><i style="background:var(--green)"></i>Pelayanan</span>
      <span><i style="background:var(--amber)"></i>Penyuluhan</span>
      <span><i style="background:var(--primary-2)"></i>Rutin</span>
      <button class="btn btn-soft btn-sm" data-action="cal-today" style="margin-left:auto">Kembali ke hari ini</button>
    </div>
  </div>

  <div class="card kal-detail">
    <div class="card-title">📋 Agenda ${fmtTanggal(c.selected)} <span class="grow"></span>
      <button class="btn btn-primary btn-sm" data-action="cal-add-agenda" data-val="${c.selected}">+ Agenda</button>
    </div>
    ${selItems.length ? selItems.map(agendaCard).join('') : emptyState('🌤️', 'Tidak ada agenda', 'Ketuk tanggal lain atau tambah agenda.')}
  </div>
  </div>`;
}

function calShift(delta) {
  const c = State.calendar;
  c.m += delta;
  if (c.m < 0) { c.m = 11; c.y--; }
  if (c.m > 11) { c.m = 0; c.y++; }
  c.selected = dateKey(new Date(c.y, c.m, 1));
  renderKalender();
}

/* ============================================================
   13. VIEW: JADWAL PIKET (+ countdown shift)
   ============================================================ */

function SHIFT_JAM(s) {
  const S = State.settings.shifts;
  const key = s === 'Pagi' ? 'pagi' : s === 'Siang' ? 'siang' : 'malam';
  return S[key] ? S[key].start : '';
}
function SHIFT_META(s) {
  const S = State.settings.shifts;
  const key = s === 'Pagi' ? 'pagi' : s === 'Siang' ? 'siang' : 'malam';
  return S[key] || SHIFT_DEFAULT[key];
}

function shiftInfo(now) {
  const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const wins = [];
  for (const k of ['pagi', 'siang', 'malam']) {
    const s = State.settings.shifts[k];
    for (const off of [-1, 0, 1]) {
      const d = addDays(anchor, off);
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.end.split(':').map(Number);
      const st = new Date(d); st.setHours(sh, sm, 0, 0);
      const en = new Date(d); en.setHours(eh, em, 0, 0);
      if (en <= st) en.setDate(en.getDate() + 1);
      wins.push({ key: k, label: s.label, ikon: s.ikon, warna: s.warna, start: st, end: en });
    }
  }
  wins.sort((a, b) => a.start - b.start);
  const current = wins.find(w => now >= w.start && now < w.end);
  const next = wins.find(w => w.start > now) || null;
  return { current, next };
}

function countdownStr(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
}

function renderPiket() {
  const el = $('#view-piket');
  const c = State.piketCal;
  const y = c.y, m = c.m;
  const first = new Date(y, m, 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const today = todayKey();
  const piketByDay = {};
  State.piket.forEach(p => { piketByDay[p.tanggal] = p; });
  const info = shiftInfo(new Date());

  let cells = '';
  for (let w = 0; w < 6; w++) {
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, w * 7 + i);
      const k = dateKey(day);
      const p = piketByDay[k];
      const inMonth = day.getMonth() === m;
      const cls = ['cal-cell'];
      if (!inMonth) cls.push('other');
      if (k === today) cls.push('today');
      const meta = p ? SHIFT_META(p.shift) : null;
      cells += `<button class="${cls.join(' ')}" data-action="piket-day" data-val="${k}" title="${p ? 'Shift ' + p.shift : 'Kosong — ketuk untuk set shift'}"
        style="${p ? 'background:' + meta.warna + '22;border-color:' + meta.warna + ';color:var(--text)' : ''}">
        ${p ? meta.ikon : ''}${day.getDate()}
      </button>`;
    }
  }

  const filt = State.piketFilter;
  let list = State.piket
    .filter(p => p.tanggal.slice(0, 7) === y + '-' + pad(m + 1))
    .filter(p => filt === 'all' || p.shift === filt)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const cd = info.next;
  el.innerHTML = `
  <div class="card countdown-card mb-16">
    <div class="cd-lbl">${info.current ? '🕐 Shift ' + info.current.label + ' sedang berlangsung (selesai ' + fmtHM(hms(info.current.end)) + ')' : '⏳ Menuju Shift Berikutnya'}</div>
    <div class="cd-num" id="cd-num">${cd ? countdownStr(cd.start - new Date()) : '—'}</div>
    <div class="cd-unit"><span>Jam</span><span>Menit</span><span>Detik</span></div>
    <div class="cd-lbl" style="margin-top:2px">${cd ? cd.ikon + ' Shift <b>' + cd.label + '</b> • ' + fmtTanggal(dateKey(cd.start)) + ' ' + fmtHM(hms(cd.start)) + '–' + fmtHM(hms(cd.end)) : 'Tidak ada shift berikutnya'}</div>
  </div>

  <div class="kal-layout">
    <div class="card kal-card">
    <div class="cal-head">
      <button class="icon-btn" data-action="piket-prev">‹</button>
      <div class="cal-title">${BULAN[m]} ${y}</div>
      <button class="icon-btn" data-action="piket-next">›</button>
    </div>
    <div class="cal-grid">
      ${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => '<div class="cal-dow">' + d + '</div>').join('')}
      ${cells}
    </div>
    <div class="cal-legend">
      <span>🟢 Pagi ${fmtHM(State.settings.shifts.pagi.start)}–${fmtHM(State.settings.shifts.pagi.end)}</span>
      <span>🟠 Siang ${fmtHM(State.settings.shifts.siang.start)}–${fmtHM(State.settings.shifts.siang.end)}</span>
      <span>🔵 Malam ${fmtHM(State.settings.shifts.malam.start)}–${fmtHM(State.settings.shifts.malam.end)}</span>
    </div>
    </div>

    <div class="kal-side">
      <div class="chip-row mb-8">
        ${chipBtn2('all', 'Semua', filt)}${chipBtn2('Pagi', '🟢 Pagi', filt)}${chipBtn2('Siang', '🟠 Siang', filt)}${chipBtn2('Malam', '🔵 Malam', filt)}
      </div>
      <div class="section-h" style="margin-top:0">Timeline Piket Bulan Ini</div>
      <div id="piket-list">${list.length ? list.map(piketCard).join('') : emptyState('🕐', 'Tidak ada piket', 'Ketuk tanggal pada kalender untuk menambah jadwal piket.')}</div>
    </div>
  </div>`;

  // jalankan countdown tiap detik
  clearInterval(State._cdTimer);
  State._cdTimer = setInterval(() => {
    const elNum = $('#cd-num');
    if (!elNum) return;
    const inf = shiftInfo(new Date());
    if (inf.next) elNum.textContent = countdownStr(inf.next.start - new Date());
    else elNum.textContent = '—';
  }, 1000);
}

function chipBtn2(val, label, cur) {
  return '<button class="chip ' + (cur === val ? 'active' : '') + '" data-action="piket-filter" data-val="' + val + '">' + label + '</button>';
}
function hms(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

function piketCard(p) {
  const meta = SHIFT_META(p.shift);
  return `
  <button class="card agenda-card shift-card mb-12" data-action="piket-day" data-val="${p.tanggal}" style="--shift-color:${meta.warna};text-align:left">
    <div class="agenda-head">
      <span class="agenda-date">📅 ${fmtTanggal(p.tanggal)} • ${namaHari(p.tanggal)}</span>
      <span class="shift-chip" style="background:${meta.warna}">${meta.ikon} Shift ${meta.label}</span>
    </div>
    <div class="agenda-meta">
      <span>🕐 <b>${fmtHM(meta.start)} – ${fmtHM(meta.end)}</b></span>
      ${p.catatan ? '<span>📝 ' + escapeHtml(p.catatan) + '</span>' : ''}
    </div>
  </button>`;
}

function openPiketModal(tanggal) {
  const existing = State.piket.find(p => p.tanggal === tanggal);
  const meta = existing ? SHIFT_META(existing.shift) : null;
  openModal(`
    <form id="form-piket">
      <div class="field"><label>Tanggal</label><input type="date" class="input" id="p-tanggal" value="${tanggal || todayKey()}"></div>
      <div class="field"><label>Shift</label>
        ${DD.render('p-shift', ['Pagi', 'Siang', 'Malam'], (existing && existing.shift) || 'Pagi')}
      </div>
      <div class="field"><label>Catatan</label><input class="input" id="p-catatan" placeholder="cth: Jaga malam" value="${existing ? escapeHtml(existing.catatan || '') : ''}"></div>
      <div class="modal-foot">
        ${existing ? '<button type="button" class="btn btn-danger" data-action="piket-del" data-val="' + tanggal + '">🗑️ Hapus</button>' : ''}
        <button type="button" class="btn btn-soft" data-action="modal-close">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan</button>
      </div>
    </form>`, { title: existing ? '✏️ Edit Piket ' + fmtTanggal(tanggal) : '➕ Tambah Piket ' + fmtTanggal(tanggal) });
}

async function savePiketForm(e) {
  e.preventDefault();
  const tgl = $('#p-tanggal').value;
  const shift = DD.val('p-shift');
  const catatan = $('#p-catatan').value.trim();
  if (!tgl) { toast('Tanggal wajib diisi', 'error'); return; }
  const existing = State.piket.find(p => p.tanggal === tgl);
  const item = { id: existing ? existing.id : uid(), tanggal: tgl, shift, catatan, updatedAt: new Date().toISOString() };
  if (!existing) item.createdAt = new Date().toISOString();
  try {
    await Store.savePiket(item);
    const i = State.piket.findIndex(x => x.id === item.id);
    if (i >= 0) State.piket[i] = item; else State.piket.push(item);
    cacheData();
    closeModal();
    toast('✅ Piket disimpan: ' + shift, 'success');
    Store.log('Simpan jadwal piket', tgl + ' shift ' + shift);
  } catch (err) {
    queueAdd({ action: 'savePiket', item });
    toast('⚠️ Offline — piket diantrekan', 'warn');
    const i = State.piket.findIndex(x => x.id === item.id);
    if (i >= 0) State.piket[i] = item; else State.piket.push(item);
    cacheData(); closeModal();
  }
  renderCurrentView();
}

async function deletePiket(tgl) {
  const p = State.piket.find(x => x.tanggal === tgl);
  if (!p) return;
  const ok = await confirmDialog('Hapus jadwal piket ' + fmtTanggal(tgl) + ' (shift ' + p.shift + ')?', { danger: true, title: 'Hapus Piket', yesText: 'Ya, hapus' });
  if (!ok) return;
  try {
    await Store.deletePiket(p.id);
    State.piket = State.piket.filter(x => x.id !== p.id);
    cacheData();
    toast('🗑️ Piket dihapus', 'success');
  } catch (e) {
    queueAdd({ action: 'deletePiket', id: p.id });
    State.piket = State.piket.filter(x => x.id !== p.id);
    cacheData();
    toast('⚠️ Offline — penghapusan diantrekan', 'warn');
  }
  renderCurrentView();
}

/* ============================================================
   14. VIEW: MASTER KEGIATAN
   ============================================================ */

/* Master Kegiatan dikelola dari Pengaturan → Tab Master Data.
   renderMasterList() dipakai di tab tersebut (compact). */
function getFilteredMaster() {
  const f = State.masterFilter;
  let list = State.master.slice();
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(m => (m.nama + ' ' + m.kategori + ' ' + m.lokasiDefault).toLowerCase().includes(q)); }
  if (f.cat) list = list.filter(m => m.kategori === f.cat);
  if (f.aktif === 'aktif') list = list.filter(m => m.aktif);
  if (f.aktif === 'nonaktif') list = list.filter(m => !m.aktif);
  return list.sort((a, b) => a.nama.localeCompare(b.nama));
}

function renderMasterList(wrap, compact) {
  if (!wrap) return;
  const list = getFilteredMaster();
  if (!list.length) { wrap.innerHTML = emptyState('🗂️', 'Master kosong', 'Tambahkan master kegiatan baru.'); return; }
  wrap.innerHTML = list.map(m => `
    <div class="card mb-12 flex" style="align-items:flex-start">
      <div style="width:46px;height:46px;border-radius:14px;background:${m.warna}22;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:1px solid ${m.warna}44">${m.ikon}</div>
      <div class="grow" style="min-width:0">
        <div class="bold" style="font-size:14.5px">${escapeHtml(m.nama)} ${m.aktif ? '' : '<span class="badge status-Dibatalkan">Nonaktif</span>'}</div>
        <div class="small muted">${escapeHtml(m.kategori)} • ${escapeHtml(m.lokasiDefault || '—')}</div>
        <div class="small muted">🎯 ${escapeHtml(m.sasaranDefault || '—')} • ⏱ ${m.durasiDefault ? m.durasiDefault + ' mnt' : '—'}</div>
        ${compact ? '' : m.keteranganDefault ? '<div class="small muted mt-8">' + escapeHtml(m.keteranganDefault) + '</div>' : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <button class="btn btn-soft btn-sm" data-action="master-toggle" data-id="${escapeHtml(m.id)}">${m.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
        <div class="flex">
          <button class="btn btn-soft btn-sm" data-action="master-edit" data-id="${escapeHtml(m.id)}">✏️</button>
          <button class="btn btn-danger btn-sm" data-action="master-del" data-id="${escapeHtml(m.id)}">🗑️</button>
        </div>
      </div>
    </div>`).join('');
}

function openMasterForm(id) {
  State.editMasterId = id || null;
  const m = id ? State.master.find(x => x.id === id) : null;
  openModal(`
  <form id="form-master">
    <div class="form-grid">
      <div class="field full"><label>Nama Kegiatan *</label><input class="input" id="m-nama" required value="${m ? escapeHtml(m.nama) : ''}" placeholder="cth: Posyandu Balita"></div>
      <div class="field"><label>Kategori</label>
        ${DD.render('m-kategori', Object.keys(KATEGORI), (m && m.kategori) || 'Pelayanan Kesehatan')}
      </div>
      <div class="field"><label>Ikon (emoji)</label><input class="input" id="m-ikon" value="${m ? escapeHtml(m.ikon) : '📋'}" placeholder="cth: 👶"></div>
      <div class="field full"><label>Warna</label><input type="color" class="input" id="m-warna" value="${m ? m.warna : '#14B8A6'}" style="height:46px;padding:6px"></div>
      <div class="field"><label>Lokasi Default</label><input class="input" id="m-lokasi" value="${m ? escapeHtml(m.lokasiDefault) : ''}"></div>
      <div class="field"><label>Durasi Default (menit)</label><input type="number" min="0" class="input" id="m-durasi" value="${m ? m.durasiDefault : 60}"></div>
      <div class="field full"><label>Sasaran Default</label><input class="input" id="m-sasaran" value="${m ? escapeHtml(m.sasaranDefault) : ''}"></div>
      <div class="field full"><label>Keterangan Default</label><textarea class="input" id="m-ket">${m ? escapeHtml(m.keteranganDefault) : ''}</textarea></div>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-soft" data-action="modal-close">Batal</button>
      <button type="submit" class="btn btn-primary">💾 Simpan</button>
    </div>
  </form>`, { title: m ? '✏️ Edit Master Kegiatan' : '➕ Tambah Master Kegiatan' });
}

async function saveMasterForm(e) {
  e.preventDefault();
  const id = State.editMasterId || uid();
  const lama = State.master.find(x => x.id === id);
  const item = {
    id,
    nama: $('#m-nama').value.trim(),
    kategori: DD.val('m-kategori'),
    ikon: $('#m-ikon').value.trim() || '📋',
    warna: $('#m-warna').value || '#14B8A6',
    lokasiDefault: $('#m-lokasi').value.trim(),
    sasaranDefault: $('#m-sasaran').value.trim(),
    durasiDefault: parseInt($('#m-durasi').value || '60', 10),
    keteranganDefault: $('#m-ket').value.trim(),
    aktif: lama ? lama.aktif : true,
  };
  if (!item.nama) { toast('Nama kegiatan wajib diisi', 'error'); return; }
  try {
    await Store.saveMaster(item);
    const i = State.master.findIndex(x => x.id === id);
    if (i >= 0) State.master[i] = item; else State.master.push(item);
    cacheData(); closeModal();
    toast('✅ Master kegiatan disimpan', 'success');
    Store.log(lama ? 'Edit master' : 'Tambah master', item.nama);
  } catch (err) {
    queueAdd({ action: 'saveMaster', item });
    toast('⚠️ Offline — master diantrekan', 'warn');
    const i = State.master.findIndex(x => x.id === id);
    if (i >= 0) State.master[i] = item; else State.master.push(item);
    cacheData(); closeModal();
  }
  renderCurrentView();
}

async function toggleMaster(id) {
  const m = State.master.find(x => x.id === id);
  if (!m) return;
  m.aktif = !m.aktif;
  try { await Store.saveMaster(m); } catch (e) { queueAdd({ action: 'saveMaster', item: m }); }
  cacheData();
  toast(m.aktif ? '✅ Master diaktifkan' : '⏸️ Master dinonaktifkan', 'info');
  renderCurrentView();
}

async function deleteMaster(id) {
  const m = State.master.find(x => x.id === id);
  const ok = await confirmDialog('Hapus master kegiatan <b>' + escapeHtml(m ? m.nama : '') + '</b>?', { danger: true, title: 'Hapus Master', yesText: 'Ya, hapus' });
  if (!ok) return;
  try {
    await Store.deleteMaster(id);
    State.master = State.master.filter(x => x.id !== id);
    cacheData(); toast('🗑️ Master dihapus', 'success');
  } catch (e) {
    queueAdd({ action: 'deleteMaster', id });
    State.master = State.master.filter(x => x.id !== id);
    cacheData(); toast('⚠️ Offline — penghapusan diantrekan', 'warn');
  }
  renderCurrentView();
}

/* ============================================================
   15. VIEW: LAPORAN (+ export)
   ============================================================ */

function renderLaporan() {
  const el = $('#view-laporan');
  el.innerHTML = `
  <div class="card mb-16">
    <div class="flex flex-wrap">
      <div class="field grow" style="min-width:200px;margin:0"><label>Bulan Laporan</label>
        <input type="month" class="input" id="laporan-month" value="${State.laporanMonth}"></div>
      <div class="flex" style="align-items:flex-end;margin-left:auto;gap:8px">
        <button class="btn btn-soft" data-action="export-print">🖨️ Cetak / PDF</button>
        <button class="btn btn-primary" data-action="export-excel">📗 Excel</button>
      </div>
    </div>
  </div>
  <div class="stat-grid" id="laporan-stats"></div>
  <div class="dash-grid">
    <div class="card"><div class="card-title">📊 Kegiatan per Hari (${BULAN[+State.laporanMonth.slice(5, 7) - 1]})</div><canvas class="chart" id="lap-bar"></canvas></div>
    <div class="card"><div class="card-title">🍩 Kategori Kegiatan</div><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><canvas class="chart-sm" id="lap-donut-k" style="flex:1;min-width:150px"></canvas><div id="lap-legend-k" class="small muted" style="flex:1;min-width:140px"></div></div></div>
    <div class="card"><div class="card-title">🍩 Status Agenda</div><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><canvas class="chart-sm" id="lap-donut-s" style="flex:1;min-width:150px"></canvas><div id="lap-legend-s" class="small muted" style="flex:1;min-width:140px"></div></div></div>
    <div class="card"><div class="card-title">📈 Progress per Kategori</div><div id="lap-progress"></div></div>
    <div class="card wide"><div class="card-title">📋 Rincian Agenda Bulan Ini</div><div id="lap-table"></div></div>
  </div>`;
  renderLaporanStats();
  renderLaporanCharts();
  renderLaporanTable();
}

function monthAgenda() {
  const mm = State.laporanMonth;
  return sortAgenda(State.agenda.filter(a => a.tanggal.slice(0, 7) === mm));
}

function renderLaporanStats() {
  const list = monthAgenda();
  const mm = State.laporanMonth;
  const piket = State.piket.filter(p => p.tanggal.slice(0, 7) === mm).length;
  const done = list.filter(a => a.status === 'Selesai').length;
  const late = list.filter(isLate).length;
  const pending = list.filter(a => ['Belum', 'Berlangsung'].includes(a.status)).length;
  $('#laporan-stats').innerHTML = `
    <div class="card stat-card"><div class="stat-ico" style="background:var(--primary-soft)">📋</div><div><div class="stat-val">${list.length}</div><div class="stat-lbl">Kegiatan</div></div></div>
    <div class="card stat-card"><div class="stat-ico" style="background:var(--green-soft)">✅</div><div><div class="stat-val">${done}</div><div class="stat-lbl">Selesai</div></div></div>
    <div class="card stat-card"><div class="stat-ico" style="background:var(--red-soft)">🚨</div><div><div class="stat-val">${late}</div><div class="stat-lbl">Terlambat</div></div></div>
    <div class="card stat-card"><div class="stat-ico" style="background:var(--blue-soft)">🕐</div><div><div class="stat-val">${piket}</div><div class="stat-lbl">Piket</div></div></div>`;
}

function renderLaporanCharts() {
  const list = monthAgenda();
  const y = +State.laporanMonth.slice(0, 4), m = +State.laporanMonth.slice(5, 7) - 1;
  const days = new Date(y, m + 1, 0).getDate();
  const labels = [], values = [];
  for (let d = 1; d <= days; d++) {
    const k = dateKey(new Date(y, m, d));
    labels.push(String(d));
    values.push(State.agenda.filter(a => a.tanggal === k).length);
  }
  drawBarChart($('#lap-bar'), labels, values, { color: cssVar('--primary-2') });

  // donut kategori
  const catCount = {};
  list.forEach(a => { catCount[a.kategori] = (catCount[a.kategori] || 0) + 1; });
  const catItems = Object.entries(catCount).map(([k, v]) => ({ label: k, value: v, color: KATEGORI[k] || '#14B8A6' }));
  drawDonut($('#lap-donut-k'), catItems);
  $('#lap-legend-k').innerHTML = catItems.length ? catItems.map(c => '<div class="mb-8"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + c.color + ';margin-right:6px"></i>' + escapeHtml(c.label) + ': <b>' + c.value + '</b></div>').join('') : 'Tidak ada data';

  // donut status
  const stItems = STATUS_LIST.map(s => ({ label: s, value: list.filter(a => a.status === s).length, color: STATUS_COLOR[s] })).filter(i => i.value > 0);
  drawDonut($('#lap-donut-s'), stItems);
  $('#lap-legend-s').innerHTML = stItems.length ? stItems.map(c => '<div class="mb-8"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + c.color + ';margin-right:6px"></i>' + c.label + ': <b>' + c.value + '</b></div>').join('') : 'Tidak ada data';

  // progress per kategori
  const kat = {};
  list.forEach(a => { (kat[a.kategori] = kat[a.kategori] || { total: 0, done: 0 }); kat[a.kategori].total++; if (a.status === 'Selesai') kat[a.kategori].done++; });
  $('#lap-progress').innerHTML = Object.entries(kat).length ? Object.entries(kat).map(([k, v]) => `
    <div class="mb-12">
      <div class="flex" style="justify-content:space-between"><span class="small bold">${escapeHtml(k)}</span><span class="small muted">${v.done}/${v.total}</span></div>
      <div class="pbar"><i style="width:${Math.round(v.done / v.total * 100)}%"></i></div>
    </div>`).join('') : '<p class="muted small">Tidak ada data.</p>';
}

const STATUS_COLOR = (typeof window !== 'undefined' && window.STATUS_COLOR) || { Belum: '#94A3B8', Berlangsung: '#3B82F6', Selesai: '#22C55E', Ditunda: '#F59E0B', Dibatalkan: '#EF4444', Terlambat: '#EF4444' };

function renderLaporanTable() {
  const list = monthAgenda();
  $('#lap-table').innerHTML = list.length ? `
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th>Tanggal</th><th>Hari</th><th>Kegiatan</th><th>Kategori</th><th>Jam</th><th>Lokasi</th><th>Status</th></tr></thead>
      <tbody>${list.map(a => '<tr><td>' + fmtTanggal(a.tanggal) + '</td><td>' + namaHari(a.tanggal) + '</td><td>' + escapeHtml(a.namaKegiatan) + '</td><td>' + escapeHtml(a.kategori) + '</td><td>' + fmtHM(a.jamMulai) + '</td><td>' + escapeHtml(a.lokasi || '—') + '</td><td><span class="badge status-' + statusTampil(a) + '">' + statusTampil(a) + '</span></td></tr>').join('')}</tbody>
    </table></div>` : emptyState('📊', 'Tidak ada data', 'Pilih bulan lain atau tambah agenda.');
}

function laporanTableRows() {
  const list = monthAgenda();
  return list.map(a => [fmtTanggal(a.tanggal), namaHari(a.tanggal), a.namaKegiatan, a.kategori, fmtHM(a.jamMulai) + (a.jamSelesai ? '–' + fmtHM(a.jamSelesai) : ''), a.lokasi || '', a.status]);
}

function exportExcel() {
  const rows = laporanTableRows();
  if (!rows.length) { toast('Tidak ada data untuk diekspor', 'warn'); return; }
  const s = State.settings;
  const mm = State.laporanMonth.replace('-', ' ');
  const head = '<tr><th>Tanggal</th><th>Hari</th><th>Kegiatan</th><th>Kategori</th><th>Jam</th><th>Lokasi</th><th>Status</th></tr>';
  const body = rows.map(r => '<tr>' + r.map(c => '<td>' + escapeHtml(c) + '</td>').join('') + '</tr>').join('');
  const html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' +
    '<h3>Laporan Aktivitas Bidan — ' + escapeHtml(s.namaBidan || '') + ' (' + mm + ')</h3><table border="1">' + head + body + '</table></body></html>';
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  downloadBlob(blob, 'laporan-bidan-' + State.laporanMonth + '.xls');
  toast('📗 Laporan Excel diunduh', 'success');
  Store.log('Export Excel', 'Bulan ' + mm);
}

function exportPrint() {
  const rows = laporanTableRows();
  const s = State.settings;
  const mm = State.laporanMonth.replace('-', ' ');
  const list = monthAgenda();
  const done = list.filter(a => a.status === 'Selesai').length;
  const piket = State.piket.filter(p => p.tanggal.slice(0, 7) === State.laporanMonth).length;
  const head = '<tr><th>No</th><th>Tanggal</th><th>Hari</th><th>Kegiatan</th><th>Kategori</th><th>Jam</th><th>Lokasi</th><th>Status</th></tr>';
  const body = rows.map((r, i) => '<tr><td>' + (i + 1) + '</td>' + r.map(c => '<td>' + escapeHtml(c) + '</td>').join('') + '</tr>').join('');
  const pa = $('#print-area');
  pa.innerHTML = `
    <div class="p-hdr">
      <h1>LAPORAN AKTIVITAS BIDAN</h1>
      <p>Nama: <b>${escapeHtml(s.namaBidan || '—')}</b> &nbsp;|&nbsp; Puskesmas: <b>${escapeHtml(s.namaPuskesmas || '—')}</b> &nbsp;|&nbsp; Desa: <b>${escapeHtml(s.namaDesa || '—')}</b></p>
      <p>Periode: <b>${mm}</b> &nbsp;|&nbsp; Dicetak: ${new Date().toLocaleString('id-ID')}</p>
      <p>Total kegiatan: <b>${list.length}</b> &nbsp;•&nbsp; Selesai: <b>${done}</b> &nbsp;•&nbsp; Piket: <b>${piket}</b></p>
    </div>
    <h2>Rincian Kegiatan</h2>
    <table>${head}${body}</table>
    <p style="margin-top:20px">Mengetahui,<br><br><br>(${escapeHtml(s.namaBidan || 'Bidan')})</p>`;
  setTimeout(() => window.print(), 120);
  Store.log('Cetak laporan', 'Bulan ' + mm);
}

function downloadBlob(blob, nama) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ============================================================
   16. VIEW: PENGATURAN (6 tab)
   ============================================================ */

let _tabAktif = 'umum';

function renderPengaturan() {
  const el = $('#view-pengaturan');
  const s = State.settings;
  el.innerHTML = `
  <div class="tab-bar">
    ${[['umum', '👤 Umum'], ['telegram', '🤖 Telegram'], ['master', '🗂️ Master Data'], ['shift', '🕐 Shift'], ['sync', '🔄 Sinkronisasi']]
      .map(t => '<button class="tab-btn ' + (_tabAktif === t[0] ? 'active' : '') + '" data-action="tab-set" data-val="' + t[0] + '">' + t[1] + '</button>').join('')}
  </div>

  <div class="tab-pane ${_tabAktif === 'umum' ? 'active' : ''}" id="tab-umum">
    <div class="card mb-16">
      <div class="card-title">👤 Profil Bidan</div>
      <div class="form-grid">
        <div class="field"><label>Nama Bidan</label><input class="input" id="u-nama" value="${escapeHtml(s.namaBidan)}"></div>
        <div class="field"><label>Nama Puskesmas</label><input class="input" id="u-puskesmas" value="${escapeHtml(s.namaPuskesmas)}"></div>
        <div class="field"><label>Nama Desa</label><input class="input" id="u-desa" value="${escapeHtml(s.namaDesa)}"></div>
        <div class="field"><label>Tema</label>
          ${DD.render('set-tema', [{ v: 'light', l: 'Terang ☀️' }, { v: 'dark', l: 'Gelap 🌙' }, { v: 'system', l: 'Ikuti Sistem' }], s.tema)}
        </div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Foto Profil</label><div class="upload-box" data-action="pick-profile"><img id="u-foto" src="${s.fotoProfil || ''}" alt="" style="${s.fotoProfil ? '' : 'display:none'}"><div class="muted small" ${s.fotoProfil ? 'style="display:none"' : ''}>📷 Unggah foto profil</div></div><input type="file" id="u-foto-file" accept="image/*" class="hidden"></div>
        <div class="field"><label>Logo Aplikasi</label><div class="upload-box" data-action="pick-logo"><img id="u-logo" src="${s.logo || ''}" alt="" style="${s.logo ? '' : 'display:none'}"><div class="muted small" ${s.logo ? 'style="display:none"' : ''}>🖼️ Unggah logo</div></div><input type="file" id="u-logo-file" accept="image/*" class="hidden"></div>
      </div>
      <div class="field mt-8"><label>Notifikasi Browser</label>
        <button class="btn btn-soft btn-sm" id="btn-request-notif" data-action="request-notif">🔔 Aktifkan Notifikasi Browser</button>
        <span class="muted small" id="notif-perm-status"></span>
      </div>
      <button class="btn btn-primary mt-8" data-action="save-umum">💾 Simpan Pengaturan Umum</button>
    </div>

    ${!State.unlocked ? `
    <div class="card" style="text-align:center;padding:28px 20px">
      <div style="font-size:42px;margin-bottom:8px">🔒</div>
      <h4 class="mb-8">Kata Sandi & Koneksi Database Terkunci</h4>
      <p class="muted small mb-16" style="max-width:430px;margin:0 auto 14px">Kata sandi login dan koneksi database dilindungi kata sandi agar tidak sembarangan diubah. Profil, foto, logo, dan tab lain bebas diakses tanpa kata sandi.</p>
      <button class="btn btn-primary" data-action="unlock-umum">🔓 Buka dengan Kata Sandi</button>
    </div>
    ` : `
    <div class="card mb-16">
      <div class="card-title">🔐 Kata Sandi Login</div>
      <div class="field"><label>Kata Sandi Login</label><input class="input" id="u-password" value="${escapeHtml(s.password)}"></div>
    </div>

    <div class="card mb-16">
      <div class="card-title">🗄️ Koneksi Google Spreadsheet <span class="grow"></span><span class="conn-status ${s.gasUrl ? 'ok' : 'no'}" id="conn-status"><span class="dot"></span><span id="conn-text">${s.gasUrl ? 'Terhubung' : 'Tidak Terhubung'}</span></span></div>
      <div class="field"><label>Spreadsheet ID</label><input class="input" id="d-spreadsheet" value="${escapeHtml(s.spreadsheetId)}" placeholder="1AbCdEfGh... (dari URL Spreadsheet)"></div>
      <div class="field"><label>URL Google Apps Script Web App</label><input class="input" id="d-gas" value="${escapeHtml(s.gasUrl)}" placeholder="https://script.google.com/macros/s/.../exec"></div>
      <div class="form-grid">
        ${['agenda', 'piket', 'master', 'settings', 'log'].map(k => '<div class="field"><label>Sheet ' + k + '</label><input class="input" id="d-sheet-' + k + '" value="' + escapeHtml(s.sheets[k]) + '"></div>').join('')}
      </div>
      <p class="small muted mb-12">💡 Panduan lengkap koneksi: buka file <b>README.md</b> di repositori, atau file <b>gas/Code.gs</b> untuk skrip backend Google Apps Script.</p>
      <div class="flex flex-wrap">
        <button class="btn btn-primary" data-action="save-db">💾 Simpan Kata Sandi & Koneksi</button>
        <button class="btn btn-soft" data-action="conn-test">🔌 Uji Koneksi</button>
        <button class="btn btn-soft" data-action="db-reset">🗑️ Reset (hapus cache lokal)</button>
      </div>
      <div class="flex flex-wrap mt-8">
        <button class="btn btn-soft btn-sm" data-action="copy-koneksi">📋 Salin Pengaturan Koneksi</button>
        <button class="btn btn-soft btn-sm" data-action="paste-koneksi">📥 Tempel Pengaturan Koneksi</button>
      </div>
      <p class="small muted mt-8">💡 <b>Cara cepat pindah koneksi antar perangkat:</b> di perangkat yang sudah terhubung, klik <b>Salin Pengaturan Koneksi</b> → kirim teksnya ke HP lain (WhatsApp) → di HP klik <b>Tempel Pengaturan Koneksi</b> → Terapkan. Tidak perlu mengetik ulang.</p>
    </div>
    `}

  </div>

  <div class="tab-pane ${_tabAktif === 'telegram' ? 'active' : ''}" id="tab-telegram">
    <div class="card mb-16">
      <div class="card-title">🤖 Notifikasi Telegram</div>
      <div class="field"><label>Bot Token</label><input class="input" id="t-token" value="${escapeHtml(s.telegram.token)}" placeholder="123456:ABC-DEF..."></div>
      <div class="field"><label>Chat ID</label><input class="input" id="t-chatid" value="${escapeHtml(s.telegram.chatId)}" placeholder="cth: 123456789"></div>
      <div class="card-title mt-8">Jenis Notifikasi</div>
      ${[['hariIni', '📋 Agenda Hari Ini'], ['besok', '📅 Agenda Besok'], ['piket', '🕐 Jadwal Piket'], ['terlambat', '🚨 Kegiatan Terlambat'], ['jam1', '⏰ Pengingat 1 Jam Sebelum'], ['jam30', '⏳ Pengingat 30 Menit Sebelum']].map(([k, lbl]) =>
        '<label class="check"><input type="checkbox" id="t-j-' + k + '" ' + (s.telegram.jenis[k] ? 'checked' : '') + '> <span>' + lbl + '</span></label>').join('')}
      <label class="check"><input type="checkbox" id="t-aktif" ${s.telegram.aktif ? 'checked' : ''}> <span><b>Aktifkan Notifikasi Telegram</b></span></label>
      <div class="flex flex-wrap">
        <button class="btn btn-primary" data-action="save-tg">💾 Simpan</button>
        <button class="btn btn-soft" data-action="tg-test">📨 Tes Kirim Pesan</button>
      </div>
    </div>
  </div>

  <div class="tab-pane ${_tabAktif === 'master' ? 'active' : ''}" id="tab-master">
    <div class="card">
      <div class="card-title">🗂️ Kelola Master Kegiatan <span class="grow"></span><button class="btn btn-primary btn-sm" data-action="go-master-form">+ Tambah</button></div>
      <div class="search-box mb-8"><span class="s-ico">🔍</span><input class="input" id="master-search-2" placeholder="Cari master…" value="${escapeHtml(State.masterFilter.q)}"></div>
      <div id="master-list-compact"></div>
    </div>
  </div>

  <div class="tab-pane ${_tabAktif === 'shift' ? 'active' : ''}" id="tab-shift">
    <div class="card">
      <div class="card-title">🕐 Master Shift Dinas</div>
      ${['pagi', 'siang', 'malam'].map(k => `
        <div class="card mb-12" style="border-left:5px solid ${s.shifts[k].warna}">
          <div class="flex"><span style="font-size:22px">${s.shifts[k].ikon}</span><b>Shift ${s.shifts[k].label}</b></div>
          <div class="form-grid mt-8">
            <div class="field"><label>Jam Mulai</label><input type="time" class="input shift-time" data-shift="${k}" data-part="start" value="${s.shifts[k].start}"></div>
            <div class="field"><label>Jam Selesai</label><input type="time" class="input shift-time" data-shift="${k}" data-part="end" value="${s.shifts[k].end}"></div>
          </div>
        </div>`).join('')}
      <button class="btn btn-primary" data-action="save-shift">💾 Simpan Jam Shift</button>
    </div>
  </div>

  <div class="tab-pane ${_tabAktif === 'sync' ? 'active' : ''}" id="tab-sync">
    <div class="card mb-16">
      <div class="card-title">🔄 Sinkronisasi & Cadangan Data</div>
      <div class="flex flex-wrap">
        <button class="btn btn-primary" data-action="sync">📡 Sinkronkan Sekarang</button>
        <button class="btn btn-soft" data-action="sync-refresh">♻️ Refresh dari Spreadsheet</button>
        <button class="btn btn-soft" data-action="sync-backup">💾 Backup (JSON)</button>
        <button class="btn btn-soft" data-action="sync-export">📤 Export Agenda (JSON)</button>
        <button class="btn btn-soft" data-action="sync-restore">📥 Restore / Import JSON</button>
        <button class="btn btn-danger" data-action="sync-clear">🧹 Bersihkan Cache</button>
      </div>
      <input type="file" id="import-file" accept=".json,application/json" class="hidden">
      <p class="small muted mt-8">⏱ Sinkronisasi terakhir: <b id="sync-ts">${lsGet(K.s_syncts, '—')}</b> • Mode: <b id="sync-mode">${isDemoMode() ? 'Demo (lokal)' : 'Spreadsheet'}</b></p>
      <p class="small muted">📦 Antrian offline: <b id="queue-count">${queueAll().length}</b> operasi tertunda</p>
    </div>
  </div>`;

  // event khusus tab
  $$('.shift-time').forEach(inp => inp.addEventListener('change', () => { /* disimpan lewat tombol */ }));
  const ms2 = $('#master-search-2');
  if (ms2) ms2.addEventListener('input', debounce(e => { State.masterFilter.q = e.target.value; renderMasterList($('#master-list-compact'), true); }, 250));
  renderMasterList($('#master-list-compact'), true);
  renderNotifPermStatus();
}

function renderNotifPermStatus() {
  const el = $('#notif-perm-status');
  if (!el) return;
  if (!('Notification' in window)) { el.textContent = '(tidak didukung browser ini)'; return; }
  el.textContent = Notification.permission === 'granted' ? '✓ Diizinkan' : Notification.permission === 'denied' ? '✗ Diblokir — buka pengaturan browser' : '';
}

async function savePengaturanUmum() {
  const s = State.settings;
  s.namaBidan = $('#u-nama').value.trim() || 'Bidan';
  s.namaPuskesmas = $('#u-puskesmas').value.trim();
  s.namaDesa = $('#u-desa').value.trim();
  cacheSettings();
  try { await Store.saveSettings({ namaBidan: s.namaBidan, namaPuskesmas: s.namaPuskesmas, namaDesa: s.namaDesa }); }
  catch (e) { queueAdd({ action: 'saveSettings', settings: { namaBidan: s.namaBidan, namaPuskesmas: s.namaPuskesmas, namaDesa: s.namaDesa } }); }
  toast('✅ Pengaturan umum disimpan', 'success');
  Store.log('Ubah pengaturan umum', '');
  renderSidebarUser();
  renderDashboard();
}

async function saveKoneksiDb() {
  const s = State.settings;
  if ($('#u-password')) s.password = $('#u-password').value.trim() || 'bidan123';
  s.spreadsheetId = $('#d-spreadsheet').value.trim();
  s.gasUrl = $('#d-gas').value.trim();
  s.sheets = {
    agenda: $('#d-sheet-agenda').value.trim() || 'Agenda',
    piket: $('#d-sheet-piket').value.trim() || 'JadwalPiket',
    master: $('#d-sheet-master').value.trim() || 'MasterKegiatan',
    settings: $('#d-sheet-settings').value.trim() || 'Pengaturan',
    log: $('#d-sheet-log').value.trim() || 'LogAktivitas',
  };
  cacheSettings();
  if (!isDemoMode()) {
    try { await Store.saveSettings({ spreadsheetId: s.spreadsheetId, gasUrl: s.gasUrl, sheets: s.sheets, password: s.password }); }
    catch (e) { toast('⚠️ Simpan ke server gagal — tersimpan lokal', 'warn'); }
  }
  toast('✅ Kata sandi & koneksi database disimpan', 'success');
  renderPengaturan();
}

async function testKoneksi(btn) {
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Menguji…'; }
  try {
    if (!String(State.settings.gasUrl || '').trim()) throw new ApiError('URL belum diisi', 'no-url');
    const res = await Store.ping();
    toast('🔌 Terhubung! Mode: ' + (res.mode === 'demo' ? 'demo' : 'Spreadsheet'), 'success');
    $('#conn-status').className = 'conn-status ok';
    $('#conn-text').textContent = 'Terhubung';
    // langsung muat data dari Spreadsheet agar mode demo langsung hilang
    await syncAll({ silent: true });
    toast('📡 Data dari Spreadsheet dimuat — Mode Demo selesai', 'success');
  } catch (err) {
    toast('🔌 Gagal: ' + err.message, 'error', 4500);
    $('#conn-status').className = 'conn-status no';
    $('#conn-text').textContent = 'Tidak Terhubung';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔌 Uji Koneksi'; }
  }
}

/* Salin / tempel pengaturan koneksi antar perangkat (karena koneksi
   tersimpan per perangkat di localStorage) */
function koneksiConfig() {
  return {
    spreadsheetId: State.settings.spreadsheetId || '',
    gasUrl: State.settings.gasUrl || '',
    sheets: State.settings.sheets || {},
  };
}

function copyKoneksi() {
  // Jaga-jaga: di perangkat yang belum terhubung tidak ada yang bisa disalin
  if (!State.settings.gasUrl) {
    toast('ℹ️ Perangkat ini belum terhubung — tidak ada pengaturan untuk disalin. Gunakan "📥 Tempel Pengaturan Koneksi" dari perangkat yang sudah terhubung.', 'warn', 5000);
    return;
  }
  const txt = JSON.stringify(koneksiConfig());
  openModal(`
    <div class="field"><label><b>1.</b> Tampilkan QR ini di layar, lalu pindai dari HP lain (atau salin teks di bawah).</label>
    <div style="text-align:center;background:var(--surface-2);border-radius:14px;padding:14px;margin-bottom:10px">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(txt)}" alt="QR Pengaturan Koneksi" style="width:200px;height:200px;margin:0 auto;border-radius:12px">
      <div class="small muted mt-8">Di HP lain: Pengaturan → Umum → 📥 Tempel Pengaturan Koneksi → 📷 Scan QR</div>
    </div></div>
    <div class="field"><label><b>2.</b> Alternatif: salin teks di bawah (tekan lama pada teks → <b>Salin</b>):</label>
    <textarea class="input" id="cfg-copy" readonly style="min-height:110px;font-size:12px">${escapeHtml(txt)}</textarea></div>
    <div class="modal-foot">
      <button type="button" class="btn btn-soft" data-action="modal-close">Tutup</button>
      <button type="button" class="btn btn-primary" data-action="copy-cfg-btn">📋 Salin ke Clipboard</button>
    </div>`, { title: '📋 Salin Pengaturan Koneksi' });
  const ta = $('#cfg-copy');
  setTimeout(() => { try { ta.focus(); ta.select(); } catch (e) { /* abaikan */ } }, 150);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt)
      .then(() => toast('✅ Teks tersalin otomatis — tempel di perangkat lain', 'success'))
      .catch(() => toast('⚠️ Salin manual: tekan lama pada teks → Salin', 'warn'));
  } else {
    toast('💡 Pilih teks lalu salin, atau gunakan tombol Scan QR di perangkat lain', 'info');
  }
}

function pasteKoneksi() {
  openModal(`
    <div class="card mb-12" style="background:var(--surface-2);text-align:center;padding:12px">
      <div class="small muted mb-8">📷 <b>Paling mudah:</b> tampilkan QR "Salin Pengaturan Koneksi" di layar perangkat lain (komputer/HP yang sudah terhubung), lalu pindai di sini</div>
      <video id="qr-video" playsinline muted style="width:100%;max-height:170px;border-radius:12px;background:#000;display:none"></video>
      <div class="flex mt-8" style="justify-content:center;gap:8px">
        <button type="button" class="btn btn-primary btn-sm" data-action="qr-scan">📷 Scan QR</button>
        <button type="button" class="btn btn-soft btn-sm hidden" data-action="qr-stop">⏹ Hentikan</button>
      </div>
    </div>
    <div class="field"><label>Atau tempel teks pengaturan (tekan lama pada kotak → <b>Tempel</b>):</label>
    <textarea class="input" id="cfg-paste" placeholder='{"spreadsheetId":"...","gasUrl":"https://script.google.com/macros/s/.../exec"}' style="min-height:110px;font-size:12px"></textarea></div>
    <p class="login-error hidden" id="cfg-err"></p>
    <div class="modal-foot">
      <button type="button" class="btn btn-soft" data-action="modal-close">Batal</button>
      <button type="button" class="btn btn-primary" data-action="cfg-apply">✅ Terapkan</button>
    </div>`, { title: '📥 Tempel Pengaturan Koneksi' });
}

/* ----- Pindai QR pengaturan (Chrome Android: BarcodeDetector) ----- */
function stopQR() {
  const video = $('#qr-video');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
    video.style.display = 'none';
  }
  const stopBtn = $('[data-action="qr-stop"]');
  if (stopBtn) stopBtn.classList.add('hidden');
  const scanBtn = $('[data-action="qr-scan"]');
  if (scanBtn) scanBtn.classList.remove('hidden');
}

async function scanQR() {
  const er = $('#cfg-err');
  if (er) er.classList.add('hidden');
  if (!('BarcodeDetector' in window)) {
    if (er) { er.textContent = 'Browser ini tidak mendukung pemindai QR. Gunakan Chrome di Android, atau tempel teks secara manual.'; er.classList.remove('hidden'); }
    return;
  }
  const video = $('#qr-video');
  const stopBtn = $('[data-action="qr-stop"]');
  const scanBtn = $('[data-action="qr-scan"]');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    video.style.display = 'block';
    await video.play();
    if (scanBtn) scanBtn.classList.add('hidden');
    if (stopBtn) stopBtn.classList.remove('hidden');
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    for (let i = 0; i < 75; i++) { // ~30 detik
      try {
        const codes = await detector.detect(video);
        if (codes.length) {
          const txt = codes[0].rawValue;
          let cfg = null;
          try { cfg = JSON.parse(txt); } catch (e) {
            const m = txt.match(/https:\/\/script\.google\.com\/macros\/s\/[^\s"']+/);
            if (m) cfg = { gasUrl: m[0] };
          }
          if (cfg && cfg.gasUrl) {
            stopQR();
            const ta = $('#cfg-paste');
            if (ta) ta.value = JSON.stringify(cfg);
            toast('✅ QR terbaca — tekan "Terapkan"', 'success');
            return;
          }
        }
      } catch (e) { /* bingkai belum siap */ }
      await sleep(400);
    }
    stopQR();
    if (er) { er.textContent = 'QR tidak terdeteksi. Pastikan QR tampil utuh & cahaya cukup.'; er.classList.remove('hidden'); }
  } catch (err) {
    stopQR();
    if (er) { er.textContent = 'Kamera tidak dapat diakses: ' + (err.message || err) + '. Gunakan tempel teks manual.'; er.classList.remove('hidden'); }
  }
}

async function applyKoneksi() {
  const raw = (($('#cfg-paste') || {}).value || '').trim();
  const er = $('#cfg-err');
  let cfg = null;
  try { cfg = JSON.parse(raw); }
  catch (e) {
    // kemungkinan bukan JSON utuh — coba deteksi URL telanjang
    const m = raw.match(/https:\/\/script\.google\.com\/macros\/s\/[^\s"']+/);
    if (m) cfg = { gasUrl: m[0] };
  }
  if (!cfg || typeof cfg !== 'object') {
    if (er) { er.textContent = 'Teks tidak dikenali. Pastikan teks utuh mulai { sampai } (lihat panduan di menu Salin).'; er.classList.remove('hidden'); }
    return;
  }
  const gasUrl = String(cfg.gasUrl || '').trim();
  if (!gasUrl) {
    if (er) { er.textContent = 'URL Web App kosong. Periksa kembali teks yang disalin.'; er.classList.remove('hidden'); }
    return;
  }
  // terapkan
  State.settings.gasUrl = gasUrl;
  if (cfg.spreadsheetId) State.settings.spreadsheetId = String(cfg.spreadsheetId).trim();
  if (cfg.sheets && typeof cfg.sheets === 'object') State.settings.sheets = { ...State.settings.sheets, ...cfg.sheets };
  cacheSettings();
  closeModal();
  toast('✅ Pengaturan diterapkan — menyinkronkan…', 'success');
  try { await Store.saveSettings({ spreadsheetId: State.settings.spreadsheetId, gasUrl, sheets: State.settings.sheets }); } catch (e) { /* simpan lokal cukup */ }
  const ok = await syncAll({ silent: false });
  if (ok) toast('🎉 Terhubung! Data dari Spreadsheet dimuat', 'success');
  else toast('⚠️ Koneksi tersimpan, tetapi tidak bisa menjangkau server. Periksa URL Web App & internet.', 'warn', 5000);
}

function resetCacheLocal() {
  confirmDialog('Hapus seluruh cache & data lokal aplikasi? <b class="muted">(Data di Spreadsheet aman)</b>', { danger: true, title: 'Reset Cache', yesText: 'Ya, bersihkan' }).then(ok => {
    if (!ok) return;
    lsDel(K.s_data); lsDel(K.s_settings); lsDel(K.s_queue); lsDel(K.s_notified); lsDel(K.s_notifs); lsDel(K.s_demo); lsDel(K.s_syncts);
    State.agenda = []; State.piket = []; State.master = []; State.notifs = [];
    toast('🧹 Cache lokal dibersihkan', 'success');
    setTimeout(() => location.reload(), 700);
  });
}

async function saveTelegram() {
  const s = State.settings;
  s.telegram.token = $('#t-token').value.trim();
  s.telegram.chatId = $('#t-chatid').value.trim();
  s.telegram.aktif = $('#t-aktif').checked;
  s.telegram.jenis = {
    hariIni: $('#t-j-hariIni').checked, besok: $('#t-j-besok').checked, piket: $('#t-j-piket').checked,
    terlambat: $('#t-j-terlambat').checked, jam1: $('#t-j-jam1').checked, jam30: $('#t-j-jam30').checked,
  };
  cacheSettings();
  try { await Store.saveSettings({ telegram: s.telegram }); }
  catch (e) { queueAdd({ action: 'saveSettings', settings: { telegram: s.telegram } }); }
  toast('✅ Pengaturan Telegram disimpan', 'success');
}

async function testTelegram() {
  if (!State.settings.telegram.token || !State.settings.telegram.chatId) { toast('Isi dulu Bot Token & Chat ID', 'error'); return; }
  await saveTelegram();
  toast('📨 Mengirim pesan tes…', 'info');
  try {
    await Store.telegram('✅ Tes dari Agenda Bidan — ' + new Date().toLocaleString('id-ID'));
    toast('📨 Pesan tes terkirim!', 'success');
  } catch (err) {
    toast('❌ Gagal kirim: ' + err.message, 'error', 4500);
  }
}

async function saveShift() {
  const s = State.settings;
  for (const k of ['pagi', 'siang', 'malam']) {
    const st = $('.shift-time[data-shift="' + k + '"][data-part="start"]');
    const en = $('.shift-time[data-shift="' + k + '"][data-part="end"]');
    if (st && en) { s.shifts[k].start = st.value || s.shifts[k].start; s.shifts[k].end = en.value || s.shifts[k].end; }
  }
  cacheSettings();
  try { await Store.saveSettings({ shifts: s.shifts }); }
  catch (e) { queueAdd({ action: 'saveSettings', settings: { shifts: s.shifts } }); }
  toast('✅ Jam shift disimpan', 'success');
  Store.log('Ubah jam shift', '');
}

function backupJSON() {
  const data = { app: APP.nama, versi: APP.versi, tanggal: new Date().toISOString(), settings: State.settings, agenda: State.agenda, piket: State.piket, master: State.master, log: State.log };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'backup-bidan-' + todayKey() + '.json');
  toast('💾 Backup diunduh', 'success');
}

function exportAgendaJSON() {
  const data = { tanggal: new Date().toISOString(), agenda: State.agenda };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'export-agenda-' + todayKey() + '.json');
  toast('📤 Export agenda diunduh', 'success');
}

function importJSON() {
  $('#import-file').click();
}

async function handleImportFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    let n = 0;
    if (data.agenda && Array.isArray(data.agenda)) {
      for (const it of data.agenda) { if (it.id && it.tanggal) { try { await Store.saveAgenda(it); State.agenda = State.agenda.filter(x => x.id !== it.id); State.agenda.push(it); n++; } catch (err) { queueAdd({ action: 'saveAgenda', item: it }); } } }
    }
    if (data.piket && Array.isArray(data.piket)) {
      for (const it of data.piket) { if (it.id && it.tanggal) { try { await Store.savePiket(it); State.piket = State.piket.filter(x => x.id !== it.id); State.piket.push(it); } catch (err) { queueAdd({ action: 'savePiket', item: it }); } } }
    }
    if (data.master && Array.isArray(data.master)) {
      for (const it of data.master) { if (it.id && it.nama) { try { await Store.saveMaster(it); State.master = State.master.filter(x => x.id !== it.id); State.master.push(it); } catch (err) { queueAdd({ action: 'saveMaster', item: it }); } } }
    }
    if (data.settings) { State.settings = { ...State.settings, ...data.settings }; cacheSettings(); }
    cacheData();
    toast('✅ Import selesai (' + n + ' agenda)', 'success');
    renderCurrentView();
  } catch (err) {
    toast('❌ File tidak valid: ' + err.message, 'error', 4500);
  }
  e.target.value = '';
}

/* ============================================================
   17. VIEW: TENTANG
   ============================================================ */

function renderTentang() {
  const el = $('#view-tentang');
  el.innerHTML = `
  <div class="card mb-16" style="text-align:center;padding:32px 20px">
    <img src="./icon-192.png" alt="Logo" style="width:92px;height:92px;margin:0 auto 14px;border-radius:24px;box-shadow:var(--shadow)">
    <h2 style="font-size:19px">${APP.nama}</h2>
    <p class="muted small">Versi ${APP.versi} • ${APP.tahun}</p>
    <p class="small mt-8" style="max-width:480px;margin:10px auto 0">Aplikasi PWA untuk agenda kerja harian, agenda bulanan, jadwal piket, dokumentasi kegiatan, dan laporan aktivitas Bidan — tanpa framework, ringan, dan dapat diinstal di Android.</p>
  </div>
  <div class="card mb-16">
    <div class="card-title">✨ Fitur Utama</div>
    ${['📋 Agenda harian & bulanan dengan foto & checklist', '🕐 Pengingat jadwal piket + countdown shift', '📅 Kalender interaktif', '📊 Laporan & grafik (export PDF/Excel/Print)', '🗄️ Database Google Spreadsheet (Google Apps Script)', '📡 Mode offline & sinkronisasi otomatis', '🔔 Notifikasi browser & Telegram', '🌙 Dark mode, PWA installable'].map(f => '<div class="check" style="margin:6px 0"><span>✅</span><span>' + f + '</span></div>').join('')}
  </div>
  <div class="card mb-16">
    <div class="card-title">🛠️ Teknologi</div>
    <p class="small muted">HTML5 • CSS3 • JavaScript ES6 (Vanilla) • Progressive Web App • Google Apps Script • Google Spreadsheet</p>
  </div>
  <div class="card">
    <div class="card-title">📖 Panduan</div>
    <p class="small muted">Buka <b>README.md</b> untuk panduan lengkap: menyiapkan Google Spreadsheet, men-deploy Google Apps Script, mengunggah ke GitHub Pages, dan cara install di Android.</p>
  </div>`;
}

/* ============================================================
   18. NOTIFIKASI (Browser + Telegram + Pengingat)
   ============================================================ */

function notifSupported() { return 'Notification' in window; }

function requestNotif() {
  if (!notifSupported()) { toast('Browser tidak mendukung notifikasi', 'error'); return; }
  Notification.requestPermission().then(p => {
    renderNotifPermStatus();
    toast(p === 'granted' ? '🔔 Notifikasi diizinkan' : '🔕 Notifikasi ditolak', p === 'granted' ? 'success' : 'warn');
  });
}

async function browserNotif(title, body) {
  if (!notifSupported() || Notification.permission !== 'granted') return;
  addNotif('🔔', title + ' — ' + body);
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, { body, icon: './icon-192.png', badge: './favicon.png', tag: title, vibrate: [100, 50, 100] });
  } catch (e) {
    try { new Notification(title, { body, icon: './icon-192.png' }); } catch (e2) { /* abaikan */ }
  }
}

async function kirimTelegram(text) {
  const tg = State.settings.telegram;
  if (!tg.aktif || !tg.token || !tg.chatId) return;
  try { await Store.telegram(text); } catch (e) { /* diam-diam gagal */ }
}

/* Ringkasan harian via Telegram (sekali per hari per jenis) */
async function telegramDaily() {
  const tg = State.settings.telegram;
  if (!tg.aktif || !tg.token || !tg.chatId) return;
  const t = todayKey();
  const garis = '━━━━━━━━━━━';
  if (tg.jenis.hariIni && !wasNotified('tg-hariIni-' + t)) {
    const list = State.agenda.filter(a => a.tanggal === t && a.status !== 'Dibatalkan');
    const txt = list.length ? list.map(a => '• ' + (a.jamMulai || '—') + ' ' + a.namaKegiatan + (a.lokasi ? ' (' + a.lokasi + ')' : '')).join('\n') : 'Tidak ada agenda';
    await kirimTelegram('📋 *AGENDA HARI INI* (' + fmtTanggal(t) + ')\n' + garis + '\n' + txt);
    markNotified('tg-hariIni-' + t);
  }
  if (tg.jenis.besok && !wasNotified('tg-besok-' + t)) {
    const bk = keyAddDays(t, 1);
    const list = State.agenda.filter(a => a.tanggal === bk && a.status !== 'Dibatalkan');
    const txt = list.length ? list.map(a => '• ' + (a.jamMulai || '—') + ' ' + a.namaKegiatan).join('\n') : 'Tidak ada agenda';
    await kirimTelegram('📅 *AGENDA BESOK* (' + fmtTanggal(bk) + ')\n' + garis + '\n' + txt);
    markNotified('tg-besok-' + t);
  }
  if (tg.jenis.piket && !wasNotified('tg-piket-' + t)) {
    const p = State.piket.find(x => x.tanggal === t);
    await kirimTelegram('🕐 *PIKET HARI INI*\n' + garis + '\n' + (p ? 'Shift ' + p.shift + ' (' + fmtHM(SHIFT_META(p.shift).start) + '–' + fmtHM(SHIFT_META(p.shift).end) + ')' : 'Tidak ada piket'));
    markNotified('tg-piket-' + t);
  }
  if (tg.jenis.terlambat && !wasNotified('tg-late-' + t)) {
    const late = State.agenda.filter(isLate);
    if (late.length) {
      await kirimTelegram('🚨 *KEGIATAN TERLAMBAT*\n' + garis + '\n' + late.slice(0, 10).map(a => '• ' + a.namaKegiatan + ' (' + fmtTanggal(a.tanggal) + ')').join('\n'));
      markNotified('tg-late-' + t);
    }
  }
}

/* Pengingat berjalan (setiap 20 detik saat aplikasi terbuka) */
function reminderTick() {
  const now = new Date();
  const t = todayKey();
  const hm = nowHM();

  // piket mulai
  const info = shiftInfo(now);
  if (info.current && !wasNotified('shift-' + info.current.key + '-' + t)) {
    browserNotif('🕐 Shift ' + info.current.label + ' dimulai', 'Jaga piket ' + info.current.label + ' sampai ' + fmtHM(hms(info.current.end)));
    markNotified('shift-' + info.current.key + '-' + t);
  }

  // agenda: 1 jam & 30 menit sebelum, dan saat mulai
  State.agenda.forEach(a => {
    if (a.tanggal !== t || !a.jamMulai) return;
    if (a.status === 'Selesai' || a.status === 'Dibatalkan') return;
    const diff = toMin(a.jamMulai) - toMin(hm);
    if (diff > 0 && diff <= 60 && diff > 55) {
      const k = 'ag1-' + a.id + '-' + t;
      if (!wasNotified(k)) { browserNotif('⏰ Agenda dalam 1 jam', a.namaKegiatan + ' pukul ' + fmtHM(a.jamMulai)); kirimTelegram('⏰ ' + fmtHM(a.jamMulai) + ' • ' + a.namaKegiatan + ' — dalam 1 jam'); markNotified(k); }
    }
    if (diff > 0 && diff <= 30 && diff > 25) {
      const k = 'ag30-' + a.id + '-' + t;
      if (!wasNotified(k)) { browserNotif('⏳ Agenda dalam 30 menit', a.namaKegiatan + ' pukul ' + fmtHM(a.jamMulai)); kirimTelegram('⏳ ' + fmtHM(a.jamMulai) + ' • ' + a.namaKegiatan + ' — dalam 30 menit'); markNotified(k); }
    }
    if (diff <= 0 && diff > -15 && a.status === 'Belum') {
      const k = 'agnow-' + a.id + '-' + t;
      if (!wasNotified(k)) { browserNotif('🩺 Agenda dimulai sekarang', a.namaKegiatan + ' — jangan lupa tandai status!'); markNotified(k); }
    }
  });
}

/* ============================================================
   19. SINKRONISASI, OFFLINE, PULL-TO-REFRESH
   ============================================================ */

async function syncAll(opts = {}) {
  if (State._syncing) return;
  State._syncing = true;
  setProgress(15);
  try {
    const d = await Store.getAll();
    setProgress(60);
    if (d.settings && typeof d.settings === 'object') {
      // Foto profil & logo bersifat lokal per perangkat (base64-nya terlalu besar
      // untuk disimpan di sel Spreadsheet). Jangan biarkan hasil sync menimpanya
      // dengan nilai kosong dari server — itu penyebab foto profil "hilang" /
      // balik ke default tiap kali refresh atau sinkron ulang.
      const localFoto = State.settings.fotoProfil;
      const localLogo = State.settings.logo;
      State.settings = { ...State.settings, ...d.settings, sheets: { ...State.settings.sheets, ...(d.settings.sheets || {}) } };
      if (!d.settings.fotoProfil) State.settings.fotoProfil = localFoto;
      if (!d.settings.logo) State.settings.logo = localLogo;
      cacheSettings();
    }
    State.agenda = d.agenda || [];
    State.piket = d.piket || [];
    State.master = d.master || [];
    State.log = d.log || [];
    cacheData();
    State.lastSync = Date.now();
    lsSet(K.s_syncts, new Date().toLocaleString('id-ID'));
    State.offline = false;
    $('#offline-banner').classList.add('hidden');
    await flushQueue();
    setProgress(100);
    if (!opts.silent) toast('📡 Data tersinkron dari ' + (isDemoMode() ? 'cache lokal' : 'Spreadsheet'), 'success');
    renderCurrentView();
    telegramDaily();
  } catch (err) {
    setProgress(0);
    State.offline = true;
    $('#offline-banner').classList.remove('hidden');
    if (!opts.silent) toast('⚠️ Sinkron gagal — menampilkan cache: ' + err.message, 'warn', 4000);
    // pastikan ada data untuk demo pertama kali
    if (isDemoMode() && !State.master.length) {
      const db = await Demo.getAll();
      State.master = db.master;
      cacheData();
      renderCurrentView();
    }
  } finally {
    State._syncing = false;
  }
}

/* Kirim ulang operasi yang tertunda saat offline.
   Penting: operasi yang gagal (mis. sedang benar-benar offline, atau
   error server) TETAP disimpan di antrian dan dicoba lagi lain kali —
   sebelumnya queueClear() dipanggil tanpa syarat sehingga operasi yang
   gagal ikut terhapus permanen dan datanya tidak pernah sampai ke
   Spreadsheet meski tampilan lokal sudah menganggapnya selesai. */
async function flushQueue() {
  const q = queueAll();
  if (!q.length) return;
  setProgress(30);
  let ok = 0;
  const sisa = [];
  for (const op of q) {
    try {
      if (op.action === 'saveAgenda') await Store.saveAgenda(op.item);
      else if (op.action === 'deleteAgenda') await Store.deleteAgenda(op.id);
      else if (op.action === 'savePiket') await Store.savePiket(op.item);
      else if (op.action === 'deletePiket') await Store.deletePiket(op.id);
      else if (op.action === 'saveMaster') await Store.saveMaster(op.item);
      else if (op.action === 'deleteMaster') await Store.deleteMaster(op.id);
      else if (op.action === 'saveSettings') await Store.saveSettings(op.settings);
      ok++;
    } catch (e) { sisa.push(op); /* tetap di antrian, coba lagi lain kali */ }
  }
  if (sisa.length) lsSet(K.s_queue, sisa); else queueClear();
  if (ok) toast('📤 ' + ok + ' operasi offline berhasil dikirim', 'success');
  if (sisa.length) toast('⚠️ ' + sisa.length + ' operasi belum terkirim, akan dicoba lagi', 'warn');
}

/* Pindahkan data yang tersimpan di mode demo (perangkat) ke Spreadsheet */
async function migrateDemoData() {
  if (isDemoMode()) {
    toast('Isi dulu koneksi database di Pengaturan → Umum, lalu coba lagi', 'warn');
    _tabAktif = 'umum';
    navigate('pengaturan');
    return;
  }
  const nA = State.agenda.length, nP = State.piket.length, nM = State.master.length;
  if (!nA && !nP) { toast('Tidak ada data demo untuk dipindahkan', 'info'); return; }
  const ok = await confirmDialog(
    'Pindahkan data dari perangkat ini ke Spreadsheet?<br><b>' + nA + ' agenda, ' + nP + ' piket, ' + nM + ' master</b> akan disalin ke Spreadsheet.',
    { title: '📤 Pindahkan Data Demo', yesText: 'Ya, pindahkan' });
  if (!ok) return;
  setProgress(10);
  let n = 0;
  try {
    for (const it of State.agenda) { await Store.saveAgenda(it); n++; }
    for (const it of State.piket) { await Store.savePiket(it); n++; }
    for (const it of State.master) { await Store.saveMaster(it); n++; }
    setProgress(80);
    await syncAll({ silent: true });
    setProgress(100);
    toast('✅ ' + n + ' data berhasil dipindahkan ke Spreadsheet', 'success');
  } catch (err) {
    setProgress(0);
    toast('⚠️ Gagal memindahkan: ' + err.message, 'error', 4500);
  }
}

/* Tarik ke bawah untuk menyinkronkan (pull-to-refresh) */
function setupPullToRefresh() {
  const ind = $('#pull-indicator');
  let startY = 0, pulling = false, armed = false;
  window.addEventListener('touchstart', e => {
    if (window.scrollY <= 0) { startY = e.touches[0].clientY; pulling = true; armed = false; }
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!pulling || window.scrollY > 0) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      armed = dy > 80;
      ind.classList.add('show');
      ind.style.height = Math.min(64, dy * 0.55) + 'px';
      $('#pull-text').textContent = armed ? 'Lepaskan untuk sinkron' : 'Tarik untuk sinkron';
    }
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (!pulling) return;
    pulling = false;
    ind.classList.remove('show');
    ind.style.height = '';
    if (armed) {
      $('#pull-text').textContent = 'Menyinkronkan…';
      syncAll({ silent: false });
    } else {
      $('#pull-text').textContent = 'Tarik untuk sinkron';
    }
  });
}

/* ============================================================
   20. INISIALISASI & EVENT BINDING
   ============================================================ */

function renderCurrentView() {
  if (VIEWS[State.currentView]) VIEWS[State.currentView].render();
}

function renderSidebarUser() {
  const s = State.settings;
  const av = $('#side-avatar');
  if (s.fotoProfil) { av.src = s.fotoProfil; av.classList.remove('hidden'); }
  else av.classList.add('hidden');
  $('#side-name').textContent = s.namaBidan || 'Bidan';
  $('#side-place').textContent = (s.namaPuskesmas || 'Puskesmas') + ' • ' + (s.namaDesa || '');
  $('#sidebar-sub').textContent = isDemoMode() ? 'Mode Demo' : 'Manajemen Kegiatan';
}

function openNotifs() {
  const panel = $('#notif-panel');
  const list = $('#notif-list');
  list.innerHTML = State.notifs.length ? State.notifs.map(n => `
    <div class="flex mb-12" style="align-items:flex-start">
      <span style="font-size:18px">${n.icon}</span>
      <div class="grow"><div class="small">${escapeHtml(n.msg)}</div><div class="muted" style="font-size:10.5px">${new Date(n.t).toLocaleString('id-ID')}</div></div>
    </div>`).join('') : '<div class="empty"><div class="e-ico">🔕</div><h4>Belum ada notifikasi</h4></div>';
  panel.classList.remove('hidden');
  $('#notif-badge').classList.add('hidden');
}
function closeNotifs() { $('#notif-panel').classList.add('hidden'); }
function openMore() { $('#more-sheet').classList.remove('hidden'); }
function closeMore() { $('#more-sheet').classList.add('hidden'); }
function openSidebar() { document.body.classList.add('sidebar-mobile-open'); $('#sidebar').classList.add('open'); $('#sidebar-overlay').classList.remove('hidden'); }
function closeSidebar() { document.body.classList.remove('sidebar-mobile-open'); $('#sidebar').classList.remove('open'); $('#sidebar-overlay').classList.add('hidden'); }
function toggleFab() { const f = $('#fab-menu'); f.classList.toggle('hidden'); $('#fab').classList.toggle('open'); }
function closeFab() { $('#fab-menu').classList.add('hidden'); $('#fab').classList.remove('open'); }

/* Delegasi klik global */
function handleClick(e) {
  // Tutup panel dropdown bila klik di luar
  if (!e.target.closest('[data-dd]')) closeAllDD();

  const navEl = e.target.closest('[data-nav]');
  if (navEl) { e.preventDefault(); navigate(navEl.dataset.nav); return; }

  const el = e.target.closest('[data-action]');
  if (!el) return;
  const act = el.dataset.action;
  const id = el.dataset.id;
  const val = el.dataset.val;

  switch (act) {
    /* Dropdown kustom */
    case 'dd-toggle': {
      const dd = el.closest('[data-dd]');
      if (!dd) break;
      const panel = dd.querySelector('[data-dd-panel]');
      const wasOpen = !panel.classList.contains('hidden');
      closeAllDD();
      if (!wasOpen) {
        panel.classList.remove('hidden');
        dd.classList.add('open');
        // Atur posisi: buka ke atas bila ruang di bawah tidak cukup
        panel.style.top = 'calc(100% + 6px)';
        panel.style.bottom = 'auto';
        const r = panel.getBoundingClientRect();
        const spaceBelow = window.innerHeight - r.top;
        if (r.height > spaceBelow && r.top > r.height + 20) {
          panel.style.top = 'auto';
          panel.style.bottom = 'calc(100% + 6px)';
        }
        // Pastikan panel terlihat (modal bisa memotong bagian bawah)
        setTimeout(() => { try { panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* abaikan */ } }, 30);
      }
      break;
    }
    case 'dd-opt': {
      const dd = el.closest('[data-dd]');
      if (!dd) break;
      const did = dd.dataset.ddId;
      dd.dataset.ddVal = el.dataset.ddOpt;
      const meta = (DD.meta[did] || []).find(o => o.v === el.dataset.ddOpt);
      const lbl = dd.querySelector('.dd-val');
      if (lbl) lbl.textContent = meta ? meta.l : el.dataset.ddOpt;
      dd.querySelectorAll('.dd-opt').forEach(o => o.classList.toggle('sel', o === el));
      closeAllDD();
      dd.dispatchEvent(new Event('change', { bubbles: true }));
      break;
    }
    case 'unlock-toggle': {
      const inp = $('#u-pass');
      if (inp) {
        inp.type = inp.type === 'password' ? 'text' : 'password';
        el.textContent = inp.type === 'password' ? '👁️' : '🙈';
      }
      break;
    }
    case 'lock': lockApp(); break;
    case 'toggle-sidebar': ($('#sidebar').classList.contains('open') || document.body.classList.contains('sidebar-mobile-open')) ? closeSidebar() : openSidebar(); break;
    case 'open-notifs': openNotifs(); break;
    case 'close-notifs': closeNotifs(); break;
    case 'open-more': openMore(); break;
    case 'close-more': closeMore(); break;
    case 'toggle-theme': toggleThemeQuick(); break;
    case 'sync': syncAll({ silent: false }); break;
    case 'toggle-fab': toggleFab(); break;

    case 'go-agenda-form': closeFab(); openAgendaForm(null); break;
    case 'go-agenda': navigate('agenda'); break;
    case 'go-laporan': navigate('laporan'); break;
    case 'go-piket-add': closeFab(); openPiketModal(todayKey()); break;
    case 'go-master-form': closeFab(); openMasterForm(null); break;

    case 'agenda-range': State.agendaFilter.range = val; renderAgenda(); break;
    case 'agenda-detail': openAgendaDetail(id); break;
    case 'agenda-edit': closeModal(); openAgendaForm(id); break;
    case 'agenda-del': closeModal(); deleteAgenda(id); break;
    case 'status-set': setAgendaStatus(id, val); break;
    case 'ck-toggle': toggleChecklist(id, +val); break;
    case 'ck-del': State.checklistDraft.splice(+val, 1); renderChecklistDraft(); break;
    case 'ck-add': {
      const inp = $('#ck-input');
      const t = inp.value.trim();
      if (t) { State.checklistDraft.push({ teks: t, selesai: false }); inp.value = ''; renderChecklistDraft(); }
      break;
    }
    case 'pick-photo': $('#a-foto').click(); break;
    case 'remove-photo': State._fotoDraft = ''; $('#a-foto-preview').style.display = 'none'; $('#a-foto-placeholder').style.display = ''; $('#a-foto-hapus').classList.add('hidden'); break;
    case 'agenda-reset': State.checklistDraft = []; closeModal(); openAgendaForm(State.editAgendaId); break;
    case 'lightbox': {
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = '<img src="' + el.src + '" alt="">';
      lb.onclick = () => lb.remove();
      document.body.appendChild(lb);
      break;
    }
    case 'modal-close': closeModal(); break;
    case 'modal-backdrop': if (e.target === el) closeModal(); break;

    case 'cal-prev': calShift(-1); break;
    case 'cal-next': calShift(1); break;
    case 'cal-today': State.calendar = { y: new Date().getFullYear(), m: new Date().getMonth(), selected: todayKey() }; renderKalender(); break;
    case 'cal-day': State.calendar.selected = val; renderKalender(); break;
    case 'cal-add-agenda': {
      // buka form dengan tanggal pilihan
      openAgendaForm(null);
      const inp = $('#a-tanggal');
      if (inp) { inp.value = val; inp.dispatchEvent(new Event('change')); }
      break;
    }

    case 'piket-filter': State.piketFilter = val; renderPiket(); break;
    case 'piket-day': openPiketModal(val); break;
    case 'piket-prev': State.piketCal.m--; if (State.piketCal.m < 0) { State.piketCal.m = 11; State.piketCal.y--; } renderPiket(); break;
    case 'piket-next': State.piketCal.m++; if (State.piketCal.m > 11) { State.piketCal.m = 0; State.piketCal.y++; } renderPiket(); break;
    case 'piket-del': closeModal(); deletePiket(val); break;

    case 'master-toggle': toggleMaster(id); break;
    case 'master-edit': openMasterForm(id); break;
    case 'master-del': deleteMaster(id); break;
    case 'go-koneksi': _tabAktif = 'umum'; navigate('pengaturan'); break;
    case 'migrate-demo': migrateDemoData(); break;
    case 'copy-koneksi': copyKoneksi(); break;
    case 'paste-koneksi': pasteKoneksi(); break;
    case 'copy-cfg-btn': {
      const ta = $('#cfg-copy');
      if (ta) { ta.focus(); ta.select(); try { document.execCommand('copy'); toast('✅ Tersalin — tempel di HP lain', 'success'); } catch (e2) { toast('Salin manual: pilih teks, lalu salin', 'warn'); } }
      break;
    }
    case 'cfg-apply': applyKoneksi(); break;
    case 'unlock-umum': requirePassword().then(ok => { if (ok) renderPengaturan(); }); break;

    case 'tab-set':
      if (val === 'umum' && !State.unlocked) {
        requirePassword().then(ok => { if (ok) { _tabAktif = 'umum'; renderPengaturan(); } });
      } else { _tabAktif = val; renderPengaturan(); }
      break;
    case 'save-umum': savePengaturanUmum(); break;
    case 'save-db': saveKoneksiDb(); break;
    case 'conn-test': testKoneksi(el); break;
    case 'db-reset': resetCacheLocal(); break;
    case 'save-tg': saveTelegram(); break;
    case 'tg-test': testTelegram(); break;
    case 'save-shift': saveShift(); break;
    case 'request-notif': requestNotif(); break;
    case 'pick-profile': $('#u-foto-file').click(); break;
    case 'pick-logo': $('#u-logo-file').click(); break;

    case 'sync-refresh': syncAll({ silent: false }); break;
    case 'sync-backup': 
      if (window.BidanBackup && window.BidanBackup.showBackupOptions) {
        window.BidanBackup.showBackupOptions();
      } else {
        backupJSON(); 
      }
      break;
    case 'sync-export': exportAgendaJSON(); break;
    case 'sync-restore': 
      if (window.BidanBackup) window.BidanBackup.importJSON(); 
      else importJSON(); 
      break;

    /* ===== FASE 2 BACKUP HANDLERS ===== */
    case 'backup-all-json':
      closeModal();
      if (window.BidanBackup) window.BidanBackup.backupAllJSON();
      break;
    case 'backup-full-excel':
      closeModal();
      if (window.BidanBackup) window.BidanBackup.exportFullExcel();
      break;
    case 'export-agenda-json':
      closeModal();
      if (window.BidanBackup) window.BidanBackup.exportAgendaJSON();
      else exportAgendaJSON();
      break;
    case 'export-agenda-excel':
      closeModal();
      if (window.exportExcel) window.exportExcel();
      break;
    case 'import-merge':
      closeModal();
      if (window.BidanBackup) {
        const inp = document.getElementById('import-file');
        if (inp) {
          inp.onchange = (e) => window.BidanBackup.handleImportFile(e, 'merge');
          inp.click();
        }
      } else {
        importJSON();
      }
      break;
    case 'import-replace':
      closeModal();
      if (confirm('⚠️ GANTI SEMUA DATA? Data saat ini akan hilang dan diganti dengan data dari file backup.')) {
        if (window.BidanBackup) {
          const inp = document.getElementById('import-file');
          if (inp) {
            inp.onchange = (e) => window.BidanBackup.handleImportFile(e, 'replace');
            inp.click();
          }
        }
      }
      break;
    case 'sync-clear': resetCacheLocal(); break;
    case 'export-print': exportPrint(); break;
    case 'export-excel': exportExcel(); break;

    /* ===== FASE 1 NEW HANDLERS ===== */
    case 'quick-create-from-master':
      quickCreateFromMaster(id);
      break;

    case 'global-open-agenda':
      closeModal();
      openAgendaDetail(id);
      break;

    case 'global-open-piket':
      closeModal();
      openPiketModal(val);
      break;

    case 'global-create-from-master':
      closeModal();
      quickCreateFromMaster(id);
      break;
  }
}

/* Delegasi perubahan (dropdown kustom, checkbox, input) */
function handleChange(e) {
  const t = e.target;
  const isDD = !!(t.dataset && t.dataset.ddId);
  const id = isDD ? t.dataset.ddId : t.id;
  const val = isDD ? DD.val(id) : t.value;
  if (id === 'agenda-cat') { State.agendaFilter.cat = val; renderAgendaList(); }
  else if (id === 'agenda-status') { State.agendaFilter.status = val; renderAgendaList(); }
  else if (id === 'set-tema') { State.settings.tema = val; applyTheme(); }
  else if (id === 'laporan-month') { State.laporanMonth = val || State.laporanMonth; renderLaporan(); }
  else if (id === 'import-file') { handleImportFile(e); }
  else if (id === 'u-foto-file') {
    const f = t.files[0];
    if (f) compressImage(f, 400, d => { if (d) { State.settings.fotoProfil = d; $('#u-foto').src = d; $('#u-foto').style.display = ''; $('#u-foto').parentElement.querySelector('.muted').style.display = 'none'; cacheSettings(); } });
  } else if (t.id === 'u-logo-file') {
    const f = t.files[0];
    if (f) compressImage(f, 400, d => { if (d) { State.settings.logo = d; $('#u-logo').src = d; $('#u-logo').style.display = ''; $('#u-logo').parentElement.querySelector('.muted').style.display = 'none'; cacheSettings(); } });
  }
}

/* Delegasi input realtime */
function handleInput(e) {
  const t = e.target;
  if (t.id === 'agenda-search') { State.agendaFilter.q = t.value; debouncedAgendaList(); }
  if (t.id === 'global-search-input') { handleGlobalSearchInput(t.value); }
}
const debouncedAgendaList = debounce(renderAgendaList, 250);

/* ==================== FASE 1: GLOBAL SEARCH ==================== */
let _globalSearchTimeout = null;

function handleGlobalSearchInput(query) {
  clearTimeout(_globalSearchTimeout);
  _globalSearchTimeout = setTimeout(() => {
    if (!query || query.length < 2) return;
    performGlobalSearch(query.trim());
  }, 260);
}

function performGlobalSearch(query) {
  const q = query.toLowerCase();
  const results = { agenda: [], piket: [], master: [] };

  State.agenda.forEach(a => {
    const text = ((a.namaKegiatan||'') + ' ' + (a.lokasi||'') + ' ' + (a.keterangan||'') + ' ' + (a.sasaran||'') + ' ' + (a.kategori||'')).toLowerCase();
    if (text.includes(q)) results.agenda.push(a);
  });

  State.piket.forEach(p => {
    const text = (p.shift + ' ' + (p.catatan||'') + ' ' + fmtTanggal(p.tanggal)).toLowerCase();
    if (text.includes(q)) results.piket.push(p);
  });

  State.master.forEach(m => {
    const text = ((m.nama||'') + ' ' + (m.kategori||'') + ' ' + (m.lokasiDefault||'') + ' ' + (m.sasaranDefault||'')).toLowerCase();
    if (text.includes(q)) results.master.push(m);
  });

  showGlobalSearchResults(query, results);
}

function showGlobalSearchResults(query, results) {
  const total = results.agenda.length + results.piket.length + results.master.length;
  if (total === 0) {
    toast('Tidak ada hasil untuk "' + query + '"', 'info');
    const inp = $('#global-search-input'); if (inp) inp.value = '';
    return;
  }

  // Clear search input after showing results
  setTimeout(() => {
    const inp = $('#global-search-input');
    if (inp) inp.value = '';
  }, 600);

  let html = `<div class="global-results">`;

  if (results.agenda.length) {
    html += `<div class="global-result-group"><h5>📋 Agenda (${results.agenda.length})</h5>`;
    results.agenda.slice(0, 6).forEach(a => {
      html += `
        <div class="global-result-item" data-action="global-open-agenda" data-id="${a.id}">
          <div class="result-icon" style="background:${(KATEGORI[a.kategori]||'#14B8A6')}22">📅</div>
          <div class="result-text">
            <div class="result-title">${escapeHtml(a.namaKegiatan)}</div>
            <div class="result-meta">${fmtTanggal(a.tanggal)} • ${statusTampil(a)} • ${escapeHtml(a.lokasi||'')}</div>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  if (results.piket.length) {
    html += `<div class="global-result-group"><h5>🕐 Piket (${results.piket.length})</h5>`;
    results.piket.slice(0, 4).forEach(p => {
      const meta = SHIFT_META(p.shift);
      html += `
        <div class="global-result-item" data-action="global-open-piket" data-val="${p.tanggal}">
          <div class="result-icon" style="background:${meta.warna}22">${meta.ikon}</div>
          <div class="result-text">
            <div class="result-title">Shift ${meta.label} • ${fmtTanggal(p.tanggal)}</div>
            <div class="result-meta">${escapeHtml(p.catatan || 'Tidak ada catatan')}</div>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  if (results.master.length) {
    html += `<div class="global-result-group"><h5>🗂️ Master Kegiatan (${results.master.length})</h5>`;
    results.master.slice(0, 6).forEach(m => {
      html += `
        <div class="global-result-item" data-action="global-create-from-master" data-id="${m.id}">
          <div class="result-icon" style="background:${m.warna||'#14B8A6'}22">${m.ikon || '📋'}</div>
          <div class="result-text">
            <div class="result-title">${escapeHtml(m.nama)}</div>
            <div class="result-meta">${escapeHtml(m.kategori)} • ${escapeHtml(m.lokasiDefault || '')}</div>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;

  openModal(html, { 
    title: `🔍 Hasil pencarian: "${escapeHtml(query)}" (${total})`,
    style: 'max-width:520px'
  });
}

/* ==================== FASE 1: QUICK TEMPLATES ==================== */
function renderQuickTemplates() {
  const aktif = State.master.filter(m => m.aktif).slice(0, 6);
  if (!aktif.length) return '';

  return `
    <div class="quick-templates">
      <div class="section-h">⚡ Buat Cepat dari Template</div>
      <div class="template-grid">
        ${aktif.map(m => `
          <button class="template-card" data-action="quick-create-from-master" data-id="${m.id}">
            <span class="t-ico">${m.ikon || '📋'}</span>
            <span class="t-name">${escapeHtml(m.nama)}</span>
          </button>
        `).join('')}
      </div>
    </div>`;
}

async function quickCreateFromMaster(masterId) {
  const m = State.master.find(x => x.id === masterId);
  if (!m) return;

  // Close any open modal first
  closeModal();

  // Open agenda form prefilled
  State.editAgendaId = null;
  State.checklistDraft = [];
  State._fotoDraft = undefined;

  const today = todayKey();

  openModal(`
  <form id="form-agenda" data-edit="">
    <div class="form-grid">
      <div class="field"><label>Tanggal *</label><input type="date" class="input" id="a-tanggal" required value="${today}"></div>
      <div class="field"><label>Hari (otomatis)</label><input type="text" class="input" id="a-hari" readonly value="${namaHari(today)}" style="background:var(--gray-soft)"></div>
      
      <div class="field full"><label>Nama Kegiatan *</label><input class="input" id="a-nama" required value="${escapeHtml(m.nama)}"></div>
      
      <div class="field"><label>Kategori *</label>
        ${DD.render('a-kategori', Object.keys(KATEGORI), m.kategori || 'Pelayanan Kesehatan')}
      </div>
      <div class="field"><label>Prioritas</label>
        ${DD.render('a-prioritas', PRIORITAS_LIST, 'Sedang')}
      </div>
      
      <div class="field"><label>Jam Mulai</label><input type="time" class="input" id="a-jam1" value="08:00"></div>
      <div class="field"><label>Jam Selesai</label><input type="time" class="input" id="a-jam2" value="${m.durasiDefault ? fromMin(480 + (m.durasiDefault || 60)) : ''}"></div>
      
      <div class="field full"><label>Lokasi</label><input class="input" id="a-lokasi" value="${escapeHtml(m.lokasiDefault || '')}"></div>
      <div class="field"><label>Sasaran</label><input class="input" id="a-sasaran" value="${escapeHtml(m.sasaranDefault || '')}"></div>
      <div class="field"><label>Status</label>
        ${DD.render('a-status', STATUS_LIST, 'Belum')}
      </div>
      <div class="field full"><label>Keterangan</label><textarea class="input" id="a-ket">${escapeHtml(m.keteranganDefault || '')}</textarea></div>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-soft" data-action="modal-close">Batal</button>
      <button type="submit" class="btn btn-primary">💾 Simpan Agenda</button>
    </div>
  </form>`, { title: `➕ ${m.nama}` });

  // Auto-fill remaining fields
  setTimeout(() => {
    const dur = m.durasiDefault || 60;
    const jam1 = $('#a-jam1');
    if (jam1 && jam1.value) {
      const end = fromMin(toMin(jam1.value) + dur);
      const jam2 = $('#a-jam2');
      if (jam2) jam2.value = end;
    }
  }, 50);
}

/* Quick create handler will be added to handleClick */

/* Delegasi submit form */
async function handleSubmit(e) {
  const f = e.target;
  if (f.id === 'form-agenda') { saveAgendaForm(e); return; }
  if (f.id === 'form-piket') { savePiketForm(e); return; }
  if (f.id === 'form-master') { saveMasterForm(e); return; }
}

/* Jam realtime */
function updateClock() {
  const el = $('#hero-clock');
  if (el) el.textContent = clockStr();
}

/* Register service worker */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW gagal:', err));
  }
}

/* Peristiwa online/offline */
function setupOnline() {
  window.addEventListener('online', () => {
    State.offline = false;
    $('#offline-banner').classList.add('hidden');
    toast('📡 Kembali online — sinkronisasi…', 'success');
    syncAll({ silent: true });
  });
  window.addEventListener('offline', () => {
    State.offline = true;
    $('#offline-banner').classList.remove('hidden');
  });
}

/* Inisialisasi utama */
async function init() {
  loadCache();
  applyTheme();

  // bind semua event
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);
  document.addEventListener('submit', handleSubmit);

  State.notifs = lsGet(K.s_notifs, []);
  if (State.notifs.length) $('#notif-badge').classList.remove('hidden');

  registerSW();
  setupOnline();
  setupPullToRefresh();

  // jam realtime
  updateClock();
  setInterval(updateClock, 1000);

  // pengingat tiap 20 detik
  setInterval(reminderTick, 20000);

  // redraw chart saat ukuran berubah
  let rT;
  window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(redrawCharts, 250); });

  // saat kembali ke aplikasi: jam + pengingat + auto-sinkron (bila >2 menit)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateClock(); reminderTick();
      if (Date.now() - State.lastSync > 120000) syncAll({ silent: true });
    }
  });

  // Tanpa layar login — langsung masuk ke Dashboard
  $('#app-shell').classList.remove('hidden');
  renderSidebarUser();
  navigate('dashboard', true);
  syncAll({ silent: true });
}

document.addEventListener('DOMContentLoaded', init);

