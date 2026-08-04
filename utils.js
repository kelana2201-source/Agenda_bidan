/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — js/utils.js
   Helper umum + sleep() global.
   Dimuat SEBELUM app.js (setelah constants.js).

   PENTING: window.sleep WAJIB ada — dipakai langsung oleh
   app.js di fitur scan QR (scanQR()) untuk jeda antar percobaan
   pembacaan kamera. Tanpa file ini, memindai QR akan error
   "sleep is not defined".
   ============================================================ */
'use strict';

// Dipakai langsung sebagai sleep(ms) oleh app.js (variabel global bersama
// antar-script klasik, bukan lewat window.sleep(...) eksplisit).
window.sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

window.BidanUtils = (function () {
  function pad(n) { return String(n).padStart(2, '0'); }

  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return dateKey(new Date()); }
  function parseKey(k) { const p = String(k).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function keyAddDays(k, n) { return dateKey(addDays(parseKey(k), n)); }

  const HARI_LOKAL = (window.HARI) || ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN_LOKAL = (window.BULAN) || ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function namaHari(k) { return HARI_LOKAL[parseKey(k).getDay()]; }
  function hariSingkat(k) { return HARI_LOKAL[parseKey(k).getDay()].slice(0, 3); }
  function bulanTahun(d) { return BULAN_LOKAL[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtTanggal(k) { const d = parseKey(k); return d.getDate() + ' ' + BULAN_LOKAL[d.getMonth()] + ' ' + d.getFullYear(); }
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

  function debounce(fn, ms) {
    let t;
    return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
  }

  // Agenda dianggap terlambat: belum selesai & sudah lewat waktu
  function isLate(a) {
    if (a.status === 'Selesai' || a.status === 'Dibatalkan') return false;
    const t = todayKey(), hm = nowHM();
    if (a.tanggal < t) return true;
    if (a.tanggal === t && (a.jamSelesai || a.jamMulai || '17:00') < hm) return true;
    return false;
  }

  function sortAgenda(list) {
    return list.slice().sort((a, b) =>
      (a.tanggal + ' ' + (a.jamMulai || '99:99')).localeCompare(b.tanggal + ' ' + (b.jamMulai || '99:99'))
    );
  }

  function parseList(v) {
    try { const x = JSON.parse(v || '[]'); return Array.isArray(x) ? x : []; }
    catch (e) { return []; }
  }
  function checklistDone(c) { return c.filter(i => i.selesai).length; }

  // Kompres gambar (foto profil/logo/dokumentasi) sebelum disimpan sebagai dataURL
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

  return {
    pad, dateKey, todayKey, parseKey, addDays, keyAddDays,
    namaHari, hariSingkat, bulanTahun, fmtTanggal, fmtTanggalPanjang, fmtHM,
    nowHM, toMin, fromMin, uid, escapeHtml, debounce, isLate, sortAgenda,
    parseList, checklistDone, compressImage, sleep: window.sleep
  };
})();
