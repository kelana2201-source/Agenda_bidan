# 🩺 Agenda & Manajemen Kegiatan Bidan

**Progressive Web App (PWA)** untuk agenda kerja harian, agenda bulanan, jadwal piket, dokumentasi kegiatan, dan laporan aktivitas Bidan — dibangun murni dengan **HTML5, CSS3, dan JavaScript ES6 (Vanilla)**, tanpa framework apa pun.

✅ Ringan • ✅ Responsif (mobile-first) • ✅ Bisa diinstal di Android • ✅ Offline-ready • ✅ Siap GitHub Pages

---

## 1. Ringkasan Fitur

| Modul | Fitur |
|---|---|
| **🔑 Kata Sandi** | Masuk langsung **tanpa login**. Kata sandi **hanya melindungi Pengaturan → Tab Umum** (profil, kata sandi, koneksi database). **Master Kegiatan & semua perubahan data bebas tanpa sandi** (data bersifat dinamis). Tombol 🔒 untuk mengunci kembali. Default: `bidan123` |
| **🏠 Dashboard** | Sapaan, hari/tanggal, jam realtime, kalender mini, agenda hari ini & besok, piket hari ini & berikutnya, progress bulanan (ring), statistik agenda, timeline, grafik 7 hari, quick menu, notifikasi |
| **📋 Agenda** | Card agenda (tanggal, hari, kegiatan, kategori, jam, lokasi, sasaran, keterangan, status, prioritas, foto, checklist), filter realtime (hari ini/besok/minggu/bulan, kategori, status), pencarian realtime, status: Belum/Berlangsung/Selesai/Ditunda/Dibatalkan + deteksi Terlambat otomatis |
| **📅 Kalender** | Kalender bulanan interaktif, indikator warna per kategori, klik tanggal → agenda hari itu, tambah agenda langsung dari tanggal |
| **🕐 Jadwal Piket** | Pengingat dinas pribadi, 3 shift (🟢 Pagi 07.30–14.00, 🟠 Siang 14.00–21.00, 🔵 Malam 21.00–07.30), kalender shift berwarna, card shift, timeline bulanan, **countdown menuju shift berikutnya**, filter shift, jam shift bisa diubah |
| **🗂️ Master Kegiatan** | 18 kegiatan baku bidan sebagai data awal, tambah/edit/hapus/aktif-nonaktif, memilih master saat isi agenda → data terisi otomatis (lokasi, sasaran, durasi, keterangan). **Dikelola dari Pengaturan → Tab Master Data** (tidak ada menu terpisah) |
| **📊 Laporan** | Statistik bulanan (kegiatan, selesai, terlambat, piket), grafik batang per hari, donut kategori & status, progress per kategori, tabel rincian, **export Excel (.xls), Cetak/PDF, Print** |
| **⚙️ Pengaturan** | 5 tab: **Umum** (profil, logo, foto, tema light/dark/system, password **+ Koneksi Database**: Spreadsheet ID, URL Web App, nama 5 sheet, uji koneksi, status — tab ini terkunci kata sandi), Telegram Bot, **Master Data** (bebas tanpa sandi), Master Shift, Sinkronisasi |
| **📡 Offline** | Service worker (app shell), cache data sementara di localStorage, antrian operasi offline yang dikirim ulang saat online, pull-to-refresh, banner offline |
| **🔔 Notifikasi** | Notifikasi browser (agenda dimulai, 1 jam/30 menit sebelum, shift mulai) + notifikasi Telegram otomatis |

---

## 2. Analisis Kebutuhan & Arsitektur

**Kebutuhan utama:** Bidan bekerja di lapangan (sinyal tidak stabil) dan di puskesmas → aplikasi harus **cepat, sederhana, dan bisa dipakai offline**, dengan satu sumber data yang mudah diakses: **Google Spreadsheet** (gratis, familiar, bisa dibuka dari HP).

**Keputusan desain:**
- **Tanpa framework/library** → file kecil, cepat dimuat, tidak ada dependensi yang bisa rusak, sesuai spesifikasi.
- **SPA (single page)** dengan 8 view + router JS murni → navigasi instan ala aplikasi Android.
- **Grafik digambar manual di Canvas** (bar, donut, ring) → tanpa library chart.
- **Backend = Google Apps Script Web App** → REST API sederhana (`action` + `payload` JSON via POST) yang membaca/menulis sheet.
- **Penyimpanan lokal dibatasi** (sesuai spesifikasi): tema, pengaturan, cache sementara, antrian offline — *bukan* database utama.
- **Login ringan:** password dicek oleh backend; token sesi disimpan 7 hari; mode *demo* tersedia sebelum koneksi diatur agar aplikasi langsung bisa dicoba.

**Alur data:** `UI (app.js)` → `Store` (lapisan data terpadu) → `Google Apps Script Web App` → `Google Spreadsheet (5 sheet)`. Saat offline: tulis ke antrian lokal → dikirim ulang otomatis saat online.

---

## 3. Struktur File

```
├── index.html            # Kerangka aplikasi (login, shell, semua view, modal)
├── style.css             # Seluruh gaya (light/dark, mobile-first, animasi)
├── app.js                # Seluruh logika aplikasi (20 bagian, ES6 modular)
├── js/
│   ├── constants.js      # Konstanta & data default (Fase 2)
│   ├── utils.js          # Helper umum + sleep() global (Fase 2)
│   └── backup.js         # Backup/Restore merge & replace (Fase 2)
├── manifest.webmanifest  # Manifest PWA (nama, ikon, tema)
├── sw.js                 # Service worker (offline cache + notifikasi)
├── favicon.png           # Ikon tab (128px)
├── icon-192.png          # Ikon PWA 192px
├── icon-512.png          # Ikon PWA 512px
├── gas/Code.gs           # Backend Google Apps Script (disalin ke Apps Script)
├── make_icons.py         # Generator ikon (opsional, untuk regenerasi ikon)
└── README.md             # Dokumentasi ini
```

---

## 4. Menjalankan (Cepat — Mode Demo)

1. Unduh/clone folder ini, buka `index.html` di browser (atau jalankan server lokal: `python -m http.server 8000` lalu buka `http://localhost:8000`).
2. Aplikasi **langsung masuk ke Dashboard tanpa login** — dalam **Mode Demo** data tersimpan sementara di browser.
3. Kata sandi (default: **`bidan123`**) hanya diminta saat membuka **Pengaturan → Tab Umum** (profil, kata sandi & koneksi database). **Master Kegiatan, agenda, dan piket bebas diubah tanpa sandi** — data bersifat dinamis. Bisa dikunci kembali lewat tombol **🔒 Kunci Aplikasi**.
4. Jelajahi semua menu. Untuk pemakaian sungguhan, sambungkan Spreadsheet (bagian 5).
5. **Sinkronisasi data:** tombol 🔄 di bilah atas, **tarik ke bawah (pull-to-refresh)**, atau otomatis saat aplikasi dibuka kembali. Status "Terakhir sinkron" tampil di Dashboard — jika masih **Mode Demo**, perubahan di HP lain/Spreadsheet tidak akan tampil sampai koneksi diatur.

> ⚠️ Mode demo **bukan** database utama — hanya untuk mencoba. Setelah koneksi diatur, data tersimpan di Spreadsheet Anda.

---

## 5. Menyiapkan Database Google Spreadsheet

### 5.1 Buat Spreadsheet
1. Buka [sheets.new](https://sheets.new) → beri nama, mis. **"Database Agenda Bidan"**.
2. Salin **Spreadsheet ID** dari URL: `https://docs.google.com/spreadsheets/d/` **`1AbC...xyz`** `/edit`.

### 5.2 Deploy Google Apps Script (backend)
1. Buka [script.google.com](https://script.google.com) → **New project**.
2. Hapus kode bawaan, salin seluruh isi **`gas/Code.gs`** (skrip lengkap ada juga pada bagian 9 di bawah).
3. Simpan (Ctrl+S), lalu jalankan fungsi **`setup()`** sekali. Izinkan akses saat diminta (akan muncul layar persetujuan Google — pilih akun → *Advanced → Go to project (unsafe)* → *Allow*).
   - `setup()` otomatis membuat 5 sheet: **Agenda, JadwalPiket, MasterKegiatan, Pengaturan, LogAktivitas**, mengisi 18 master kegiatan, dan nilai default.
4. Klik **Deploy → New deployment** → pilih jenis **Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` (atau `Anyone with Google account` — aplikasi tetap bisa dipakai)
5. Klik **Deploy**, salin **Web app URL** (berakhiran `/exec`).

### 5.3 Hubungkan aplikasi
1. Buka aplikasi → **Pengaturan → Tab "Umum" → Koneksi Database** (tab Umum terkunci kata sandi; buka dengan kata sandi Anda).
2. Isi **Spreadsheet ID** dan **URL Web App**, atur nama sheet bila perlu (default sesuai spesifikasi).
3. Klik **💾 Simpan**, lalu **🔌 Uji Koneksi** → status harus **"Terhubung"**.
4. Klik **Sinkronkan** — data dari Spreadsheet akan dimuat.
5. Kata sandi aplikasi dibaca dari sheet **Pengaturan** (baris `password`). Ubah kata sandi lewat **Pengaturan → Umum → Kata Sandi Login**.

> Nama sheet dapat diubah kapan saja di tab ini; perubahan langsung dipakai oleh semua menu.

---

## 5.5 ❓ Kenapa Selalu "Mode Demo"? (Troubleshooting)

**"Mode Demo" bukan berarti file Anda lama.** Ini adalah *status koneksi*:
selama aplikasi belum dihubungkan ke Google Spreadsheet (URL Web App kosong),
aplikasi sengaja berjalan dalam Mode Demo — datanya disimpan **hanya di
perangkat itu** (localStorage), bukan di Spreadsheet.

Jadi: mengunggah file baru ke GitHub Pages **tidak akan menghilangkan
Mode Demo**. Yang menghilangkan Mode Demo hanya **mengisi koneksi**:

1. Buat Spreadsheet + deploy backend (bagian 5.1 & 5.2 di atas).
2. Buka aplikasi → **Pengaturan → Tab Umum** (masukkan kata sandi) →
   isi **Spreadsheet ID** & **URL Web App** → **💾 Simpan**.
3. Klik **🔌 Uji Koneksi** → status menjadi **Terhubung** → data dari
   Spreadsheet langsung dimuat, Mode Demo hilang.
4. Jika Anda sudah mengisi data saat Mode Demo, pakai tombol
   **📤 Pindahkan Data Demo → Spreadsheet** di Dashboard untuk
   menyalinnya ke Spreadsheet.
5. Setting koneksi tersimpan **per perangkat** (localStorage). Cara
   termudah untuk HP kedua: di perangkat yang sudah terhubung buka
   **Pengaturan → Umum → Koneksi Database → 📋 Salin Pengaturan
   Koneksi** → kirim teksnya via WhatsApp → di HP buka aplikasi →
   **Pengaturan → Umum → 📥 Tempel Pengaturan Koneksi** → Terapkan.
   Tidak perlu mengetik ulang. Semua perangkat lalu melihat data yang
   sama dari Spreadsheet.

> Tip: setelah upload versi baru ke GitHub Pages, buka aplikasi di HP
> dan **tarik ke bawah** (pull-to-refresh) atau tutup-buka aplikasi
> sekali, agar service worker memuat versi terbaru.

---

## 6. Mengunggah ke GitHub Pages

**Cara A — branch `gh-pages`:**
```bash
git init
git add .
git commit -m "Agenda Bidan PWA v1.0"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
git checkout --orphan gh-pages
git add .
git commit -m "Publish PWA"
git push origin gh-pages
```
Lalu di GitHub: **Settings → Pages → Branch: `gh-pages`** → aplikasi tayang di `https://<username>.github.io/<repo>/`.

**Cara B — folder `docs`:** salin seluruh file ke folder `docs/`, push ke `main`, lalu set Pages → **Deploy from branch → main → /docs**.

> Karena semua path relatif (`./`), aplikasi langsung berfungsi di subfolder GitHub Pages.
> Jangan lupa setelah tayang: buka `https://<username>.github.io/<repo>/` → **Pengaturan → Koneksi Database** → isi URL Web App.

---

## 7. Install PWA di Android & Offline

1. Buka aplikasi di **Chrome Android** → menu ⋮ → **"Tambahkan ke layar utama" / "Install app"** (atau ikuti banner install).
2. Ikon aplikasi muncul di layar utama — terbuka fullscreen seperti aplikasi native.
3. Setelah dibuka sekali saat online, aplikasi **bisa dibuka saat offline** (shell + data cache).
4. Operasi saat offline (tambah/edit/hapus) **diantrekan** dan dikirim ulang otomatis saat koneksi pulih (lihat jumlah antrian di Pengaturan → Sinkronisasi).
5. **Pull-to-refresh**: tarik halaman ke bawah dari posisi atas untuk sinkron.

---

## 8. Notifikasi

### Notifikasi Browser
- Klik **🔔** di bilah atas, atau **Pengaturan → Umum → "Aktifkan Notifikasi Browser"**, lalu izinkan.
- Pengingat berjalan selama aplikasi terbuka: agenda dimulai, 1 jam sebelum, 30 menit sebelum, shift piket dimulai.

### Notifikasi Telegram
1. Buat bot: chat **@BotFather** di Telegram → `/newbot` → salin **Bot Token**.
2. Dapatkan **Chat ID**: chat bot Anda, lalu buka `https://api.telegram.org/bot<TOKEN>/getUpdates` → ambil `chat.id`.
3. Isi keduanya di **Pengaturan → Tab Telegram**, centang jenis notifikasi, aktifkan, klik **Tes Kirim Pesan**.
4. Ringkasan harian (agenda hari ini, agenda besok, piket, kegiatan terlambat) dikirim **sekali per hari** otomatis saat aplikasi dibuka.

---

## 9. Skrip Backend Google Apps Script

Skrip lengkap: **`gas/Code.gs`** — salin seluruh isinya ke editor Apps Script (lihat bagian 5.2).

<details>
<summary>📄 Lihat isi Code.gs (klik untuk membuka)</summary>

```javascript
/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — Backend
   Google Apps Script (Web App REST API untuk Google Spreadsheet)
   ------------------------------------------------------------
   CARA PAKAI:
   1. Buka https://script.google.com → New project
   2. Salin seluruh kode ini ke editor (hapus template default)
   3. Jalankan fungsi `setup()` sekali (izinkan akses Spreadsheet)
   4. Deploy → New deployment → Web app
      - Execute as: Me
      - Who has access: Anyone
   5. Salin URL Web App ke: Pengaturan → Koneksi Database → URL
   ============================================================ */

/* ---- Konfigurasi default (ubah sesuai kebutuhan) ---- */
var DEFAULT_SHEETS = { agenda: 'Agenda', piket: 'JadwalPiket', master: 'MasterKegiatan', settings: 'Pengaturan', log: 'LogAktivitas' };
var PASSWORD_DEFAULT = 'bidan123';
var SHIFT_DEFAULT = {
  pagi:  { label: 'Pagi',  start: '07:30', end: '14:00', warna: '#22C55E', ikon: '🟢' },
  siang: { label: 'Siang', start: '14:00', end: '21:00', warna: '#F59E0B', ikon: '🟠' },
  malam: { label: 'Malam', start: '21:00', end: '07:30', warna: '#3B82F6', ikon: '🔵' }
};

/* Header kolom tiap sheet */
var HEADERS = {
  agenda:  ['id','tanggal','hari','namaKegiatan','kategori','jamMulai','jamSelesai','lokasi','sasaran','keterangan','status','prioritas','foto','checklist','createdAt','updatedAt'],
  piket:   ['id','tanggal','shift','catatan','createdAt','updatedAt'],
  master:  ['id','nama','kategori','ikon','warna','lokasiDefault','sasaranDefault','durasiDefault','keteranganDefault','aktif'],
  log:     ['id','waktu','aktivitas','detail']
};
var SETTINGS_KEYS = ['namaBidan','namaPuskesmas','namaDesa','logo','fotoProfil','tema','password','spreadsheetId','gasUrl','sheets','telegram','shifts'];

/* ---- Data awal Master Kegiatan (18 kegiatan baku) ---- */
var MASTER_SEED = [
  ['m1','Posyandu Balita','Kegiatan Rutin','👶','#14B8A6','Balai Desa','Balita 0–5 tahun',180,'Penimbangan, imunisasi, PMT, penyuluhan',true],
  ['m2','Posyandu Lansia','Kegiatan Rutin','👵','#F59E0B','Balai Desa','Lansia',150,'Pemeriksaan tensi, gula darah, senam lansia',true],
  ['m3','Pemeriksaan Kehamilan (ANC)','Pelayanan Kesehatan','🤰','#EC4899','Polindes','Ibu hamil',120,'ANC, imunisasi TT, konseling gizi',true],
  ['m4','Pemeriksaan Nifas (KF)','Pelayanan Kesehatan','🤱','#EC4899','Polindes','Ibu nifas & bayi baru lahir',90,'KF 1–3, perawatan tali pusat, ASI',true],
  ['m5','Pelayanan KB','Pelayanan Kesehatan','💊','#0EA5E9','Polindes','PUS / akseptor KB',120,'Konseling & pelayanan kontrasepsi',true],
  ['m6','Imunisasi Dasar Bayi','Pelayanan Kesehatan','💉','#0EA5E9','Posyandu / Polindes','Bayi 0–11 bulan',120,'HB0, BCG, DPT, Polio, Campak',true],
  ['m7','Kunjungan Rumah (Home Care)','Kunjungan','🏠','#8B5CF6','Rumah sasaran','Ibu hamil / nifas / bayi',60,'Kunjungan nifas, neonatal, bumil risiko tinggi',true],
  ['m8','Kelas Ibu Hamil','Penyuluhan','📚','#F59E0B','Balai Desa','Ibu hamil',120,'Materi kehamilan, persalinan, nifas, KB',true],
  ['m9','Konseling & Inisiasi ASI','Penyuluhan','🍼','#F59E0B','Polindes','Ibu hamil & menyusui',60,'Konseling ASI eksklusif, IMD',true],
  ['m10','Penyuluhan Kesehatan Masyarakat','Penyuluhan','📣','#F59E0B','Balai Desa','Masyarakat',90,'PHBS, gizi, PSN, kesehatan reproduksi',true],
  ['m11','Senam Hamil','Penyuluhan','🤸','#F59E0B','Balai Desa','Ibu hamil',60,'Senam hamil aman bersama bidan',true],
  ['m12','P4K (Perencanaan Persalinan)','Program','🩺','#EC4899','Rumah sasaran','Ibu hamil trimester III',60,'Stiker P4K, sosialisasi penolong & transport',true],
  ['m13','SDIDTK','Program','🧒','#EC4899','Posyandu','Balita & anak prasekolah',120,'Stimulasi, deteksi & intervensi dini tumbuh kembang',true],
  ['m14','Pemeriksaan Kesehatan Remaja / UKS','Pelayanan Kesehatan','🎒','#0EA5E9','Sekolah','Remaja / siswa',120,'Penjaringan kesehatan, penyuluhan remaja',true],
  ['m15','Puskesmas Jaga / Piket','Kegiatan Rutin','🏥','#14B8A6','Puskesmas','Pasien umum',390,'Jaga pelayanan di puskesmas',true],
  ['m16','Rapat / Lokakarya Mini','Administratif','📋','#64748B','Puskesmas','Tim puskesmas',120,'Lokmin bulanan, rapat koordinasi',true],
  ['m17','Pencatatan & Pelaporan','Administratif','📊','#64748B','Polindes','Dokumentasi',90,'Register kohort, laporan bulanan',true],
  ['m18','Persalinan (Pertolongan)','Pelayanan Kesehatan','👶','#E11D48','Polindes / Rumah','Ibu bersalin',240,'Pertolongan persalinan normal & perawatan bayi',true]
];

/* ============================================================
   SETUP SATU KALI (jalankan dari editor Apps Script)
   ============================================================ */
function setup() {
  var ss = getSpreadsheet_();
  var sheets = DEFAULT_SHEETS;

  // Buat sheet + header bila belum ada
  Object.keys(sheets).forEach(function (key) {
    var sh = ss.getSheetByName(sheets[key]);
    if (!sh) sh = ss.insertSheet(sheets[key]);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS[key] || ['key', 'value']);
    }
  });

  // Seed Master Kegiatan
  var mSh = ss.getSheetByName(sheets.master);
  if (mSh.getLastRow() <= 1) {
    MASTER_SEED.forEach(function (r) { mSh.appendRow(r); });
  }

  // Seed Pengaturan (key-value)
  var pSh = ss.getSheetByName(sheets.settings);
  if (!pSh.getDataRange().getValues().some(function (r) { return r[0] === 'password'; })) {
    [
      ['namaBidan', 'Bidan Dewi'],
      ['namaPuskesmas', 'Puskesmas Purwokerto'],
      ['namaDesa', 'Kedungwuluh'],
      ['password', PASSWORD_DEFAULT],
      ['logo', ''],
      ['fotoProfil', ''],
      ['tema', 'light'],
      ['spreadsheetId', ss.getId()],
      ['gasUrl', ''],
      ['sheets', JSON.stringify(DEFAULT_SHEETS)],
      ['telegram', JSON.stringify({ token: '', chatId: '', aktif: false, jenis: { hariIni: true, besok: true, piket: true, terlambat: true, jam1: false, jam30: false } })],
      ['shifts', JSON.stringify(SHIFT_DEFAULT)]
    ].forEach(function (r) { pSh.appendRow(r); });
  }

  Logger.log('Setup selesai! Spreadsheet ID: ' + ss.getId());
}

/* ============================================================
   ENTRY POINT WEB APP
   ============================================================ */
function doGet(e)  { return handle_(e, false); }
function doPost(e) { return handle_(e, true); }

function handle_(e, isPost) {
  try {
    var p = isPost ? JSON.parse(e.postData.contents) : e.parameter;
    var action = p.action || '';
    var sheets = getSheets_(p);

    // Hanya saveSettings (Pengaturan → Umum: profil, kata sandi,
    // koneksi database) yang butuh kata sandi. Agenda, piket,
    // Master Kegiatan, dan Telegram sengaja bebas tanpa sandi
    // (lihat bagian 10 — data bersifat dinamis / notifikasi
    // otomatis harus tetap jalan tanpa sesi terbuka).
    var needPass = ['saveSettings'].indexOf(action) !== -1;
    if (needPass && !checkPass_(p)) return err_('Kata sandi salah');

    switch (action) {
      case 'ping':          return ok_({ mode: 'gas', waktu: new Date().toISOString(), sheet: sheets.agenda });
      case 'getAll':        return getAll_(sheets);
      case 'saveAgenda':    return saveItem_(sheets.agenda, p.item, 'agenda');
      case 'deleteAgenda':  return deleteItem_(sheets.agenda, p.id);
      case 'savePiket':     return saveItem_(sheets.piket, p.item, 'piket');
      case 'deletePiket':   return deleteItem_(sheets.piket, p.id);
      case 'saveMaster':    return saveItem_(sheets.master, p.item, 'master');
      case 'deleteMaster':  return deleteItem_(sheets.master, p.id);
      case 'saveSettings':  return saveSettings_(p.settings);
      case 'log':           return log_(p.aktivitas, p.detail);
      case 'telegram':      return telegram_(p.text);
      default: return err_('Aksi tidak dikenal: ' + action);
    }
  } catch (ex) {
    return err_(String(ex));
  }
}

/* ============================================================
   AUTH (kata sandi — tanpa sesi/token)
   Kata sandi dibandingkan dengan nilai di sheet Pengaturan.
   ============================================================ */
function checkPass_(p) {
  var password = getSetting_('password') || PASSWORD_DEFAULT;
  return String(p.password || '') === String(password);
}

/* ============================================================
   BACA DATA (getAll)
   ============================================================ */
function getAll_(sheets) {
  var agenda = readRows_(sheets.agenda);
  var piket = readRows_(sheets.piket);
  var master = readRows_(sheets.master).map(function (m) {
    m.aktif = m.aktif === true || m.aktif === 'true' || m.aktif === 'TRUE' || m.aktif === 'True';
    return m;
  });
  var log = readRows_(sheets.log);
  var settings = getAllSettings_();
  return ok_({ agenda: agenda, piket: piket, master: master, log: log, settings: settings });
}

/* ============================================================
   TULIS DATA (upsert + hapus)
   ============================================================ */
function saveItem_(sheetName, item, type) {
  if (!item || !item.id) return err_('Data tidak lengkap');
  var sh = getSheet_(sheetName);
  var headers = HEADERS[type] || getHeaders_(sh);
  var values = sh.getDataRange().getValues();
  var idx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(item.id)) { idx = i + 1; break; } // baris sheet (1-based)
  }
  var row = headers.map(function (h) {
    var v = item[h];
    return (typeof v === 'boolean') ? String(v) : (v === undefined || v === null ? '' : v);
  });
  if (idx === -1) {
    sh.appendRow(row);
  } else {
    sh.getRange(idx, 1, 1, headers.length).setValues([row]);
  }
  return ok_({ id: item.id });
}

function deleteItem_(sheetName, id) {
  if (!id) return err_('ID kosong');
  var sh = getSheet_(sheetName);
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) { sh.deleteRow(i + 1); return ok_({ id: id }); }
  }
  return err_('Data tidak ditemukan');
}

/* ============================================================
   PENGATURAN (sheet key-value)
   ============================================================ */
function getSheet_(name) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name] || ['key', 'value']);
  }
  return sh;
}

function getSheets_(p) {
  var saved = getAllSettings_().sheets || {};
  var out = {};
  Object.keys(DEFAULT_SHEETS).forEach(function (k) {
    var v = (p && p.sheets && p.sheets[k]) || saved[k] || DEFAULT_SHEETS[k];
    out[k] = v;
  });
  return out;
}

function getSetting_(key) {
  var sh = getSheet_(DEFAULT_SHEETS.settings);
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === key) return values[i][1];
  }
  return null;
}

function getAllSettings_() {
  var sh = getSheet_(DEFAULT_SHEETS.settings);
  var values = sh.getDataRange().getValues();
  var s = {
    namaBidan: 'Bidan', namaPuskesmas: '', namaDesa: '', logo: '', fotoProfil: '',
    tema: 'light', password: PASSWORD_DEFAULT, spreadsheetId: '', gasUrl: '',
    sheets: DEFAULT_SHEETS, telegram: { token: '', chatId: '', aktif: false, jenis: { hariIni: true, besok: true, piket: true, terlambat: true, jam1: false, jam30: false } },
    shifts: SHIFT_DEFAULT
  };
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || '');
    var val = values[i][1];
    if (!key || val === undefined) continue;
    if (key === 'sheets' || key === 'telegram' || key === 'shifts') {
      try { s[key] = JSON.parse(val); } catch (e) { /* abaikan */ }
    } else {
      s[key] = val;
    }
  }
  return s;
}

function saveSettings_(settings) {
  if (!settings || typeof settings !== 'object') return err_('Data tidak valid');
  var sh = getSheet_(DEFAULT_SHEETS.settings);
  var values = sh.getDataRange().getValues();
  var rows = {};
  for (var i = 1; i < values.length; i++) rows[String(values[i][0])] = i + 1;
  Object.keys(settings).forEach(function (key) {
    if (SETTINGS_KEYS.indexOf(key) === -1) return;
    var v = settings[key];
    var val = (typeof v === 'object') ? JSON.stringify(v) : String(v);
    if (rows[key]) {
      sh.getRange(rows[key], 2).setValue(val);
    } else {
      sh.appendRow([key, val]);
      rows[key] = sh.getLastRow();
    }
  });
  return ok_({});
}

/* ============================================================
   LOG AKTIVITAS & TELEGRAM
   ============================================================ */
function log_(aktivitas, detail) {
  var sh = getSheet_(DEFAULT_SHEETS.log);
  var headers = getHeaders_(sh) || HEADERS.log;
  var row = [Utilities.getUuid(), new Date().toISOString(), aktivitas || '', detail || ''];
  if (headers.length === 4) {
    sh.appendRow(row);
  } else {
    var obj = { id: row[0], waktu: row[1], aktivitas: row[2], detail: row[3] };
    sh.appendRow(headers.map(function (h) { return obj[h] || ''; }));
  }
  return ok_({});
}

function telegram_(text) {
  var s = getAllSettings_();
  var token = s.telegram.token, chatId = s.telegram.chatId;
  if (!token || !chatId) return err_('Bot Token / Chat ID belum diatur');
  var payload = { chat_id: String(chatId), text: String(text || ''), parse_mode: 'Markdown' };
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var data = JSON.parse(res.getContentText());
  if (data.ok) return ok_({});
  return err_('Telegram: ' + (data.description || 'gagal kirim'));
}

/* ============================================================
   UTILITAS SHEET
   ============================================================ */
function getSpreadsheet_() {
  if (SS_ID) return SpreadsheetApp.openById(SS_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getHeaders_(sh) {
  if (sh.getLastRow() === 0) return [];
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h); });
}

function readRows_(sheetName) {
  var sh = getSheet_(sheetName);
  if (sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var headers = values[0].map(function (h) { return String(h); });
  var out = [];
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0] || '') === '') continue; // lewati baris kosong
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    out.push(obj);
  }
  return out;
}

/* ---- helper respons JSON ---- */
function ok_(data) {
  var out = { ok: true };
  Object.keys(data || {}).forEach(function (k) { out[k] = data[k]; });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function err_(msg) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(msg) })).setMimeType(ContentService.MimeType.JSON);
}

/* Ganti SS_ID bila Spreadsheet berbeda dari yang aktif saat deploy */
var SS_ID = '';
```
</details>

---

## 10. Catatan Keamanan & Batasan

- **Aplikasi terbuka langsung tanpa login.** Kata sandi (disimpan di sheet *Pengaturan*, baris `password`) **hanya melindungi Pengaturan → Tab Umum** (profil, kata sandi & koneksi database). Semua perubahan data (agenda, piket, master kegiatan) bebas tanpa sandi. **Segera ganti dari nilai default** `bidan123` lewat Pengaturan → Umum.
- Kata sandi hanya dikirim ke server saat menyimpan perubahan dari tab Umum; aksi harian (simpan agenda/piket/master) tidak mengirim kata sandi.
- Tombol **🔒 Kunci Aplikasi** di sidebar / menu Lainnya untuk mengunci kembali sesi (kata sandi tidak disimpan permanen di perangkat).
- Saat *deploy* Web App, pilih **"Execute as: Me"** agar hanya akun Anda yang punya akses tulis ke Spreadsheet.
- **Foto agenda** disimpan sebagai *data URL* di sel Spreadsheet (dikompres otomatis ~≤900px). Untuk kapasitas besar, sebaiknya upload foto ke Google Drive/Photos dan tempel URL-nya di keterangan.
- Notifikasi *tepat waktu* (1 jam/30 menit sebelum) hanya aktif **saat aplikasi terbuka** — batasan wajar PWA tanpa server; ringkasan harian Telegram tetap terkirim saat aplikasi dibuka.

---

## 11. Kustomisasi

| Yang ingin diubah | Di mana |
|---|---|
| Daftar master kegiatan awal | `MASTER_DEFAULT` di `app.js` (dan `MASTER_SEED` di `gas/Code.gs`) |
| Jam & nama shift | Pengaturan → Tab Shift (atau `SHIFT_DEFAULT` di kedua file) |
| Warna tema | Variabel CSS `:root` di `style.css` |
| Nama sheet database | Pengaturan → Koneksi Database |
| Ikon aplikasi | `make_icons.py` (butuh Python + Pillow) |

---

## 12. Roadmap Pengembangan

- [ ] Notifikasi terjadwal server-side (Google Apps Script trigger per jam)
- [ ] Mode multi-petugas / multi-bidan dengan piket bersama
- [ ] Upload foto ke Google Drive (ID file, bukan base64)
- [ ] Ekspor PDF server-side (Apps Script → file ke Drive)
- [ ] Statistik tahunan & target program

---

Dibuat dengan ❤️ untuk Bidan Indonesia. Semoga memudahkan pekerjaan di lapangan! 🩺
