/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — js/backup.js
   Modul Backup & Restore (Fase 2, poin 4).
   Dimuat SEBELUM app.js. Fungsi-fungsi di sini baru benar-benar
   dipanggil setelah user menekan tombol (setelah app.js selesai
   berjalan), sehingga aman memakai variabel global dari app.js
   seperti State, Store, APP, todayKey(), dst — di script klasik
   (non-module) semua file berbagi satu scope global yang sama.
   ============================================================ */
'use strict';

window.BidanBackup = (function () {

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

  function dl(blob, nama) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  // ===== MODAL PILIHAN BACKUP/RESTORE =====
  function showBackupOptions() {
    const html = `
      <div class="backup-menu" style="display:flex;flex-direction:column;gap:8px">
        <p class="muted" style="font-size:13px;margin-bottom:4px">Simpan cadangan data atau pulihkan dari file cadangan.</p>
        <button class="btn btn-primary btn-block" data-action="backup-all-json">💾 Backup Lengkap (JSON)</button>
        <button class="btn btn-soft btn-block" data-action="backup-full-excel">📗 Export Excel Lengkap (Agenda + Piket + Master)</button>
        <button class="btn btn-soft btn-block" data-action="export-agenda-json">📤 Export Agenda saja (JSON)</button>
        <button class="btn btn-soft btn-block" data-action="export-agenda-excel">📊 Export Agenda saja (Excel)</button>
        <hr style="border:none;border-top:1px solid var(--border,#e2e8f0);margin:6px 0">
        <button class="btn btn-soft btn-block" data-action="import-merge">📥 Pulihkan — Gabung (Merge)</button>
        <button class="btn btn-danger btn-block" data-action="import-replace">⚠️ Pulihkan — Ganti Semua (Replace)</button>
        <input type="file" id="import-file" accept="application/json" class="hidden" style="display:none">
      </div>`;
    if (typeof openModal === 'function') {
      openModal(html, { title: '💾 Backup & Restore' });
    }
  }

  // ===== BACKUP JSON LENGKAP =====
  function backupAllJSON() {
    const data = {
      app: (window.APP && window.APP.nama) || 'Agenda & Manajemen Kegiatan Bidan',
      versi: (window.APP && window.APP.versi) || '',
      tanggal: new Date().toISOString(),
      settings: State.settings,
      agenda: State.agenda,
      piket: State.piket,
      master: State.master,
      log: State.log
    };
    dl(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'backup-lengkap-bidan-' + todayKey() + '.json');
    if (typeof toast === 'function') toast('💾 Backup lengkap diunduh', 'success');
    if (typeof Store !== 'undefined' && Store.log) Store.log('Backup lengkap (JSON)', State.agenda.length + ' agenda, ' + State.piket.length + ' piket, ' + State.master.length + ' master');
  }

  // ===== EXPORT AGENDA SAJA (JSON) =====
  function exportAgendaJSON() {
    const data = { tanggal: new Date().toISOString(), agenda: State.agenda };
    dl(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'export-agenda-' + todayKey() + '.json');
    if (typeof toast === 'function') toast('📤 Export agenda diunduh', 'success');
  }

  // ===== EXPORT EXCEL LENGKAP (multi-sheet: Agenda, Piket, Master) =====
  // Memakai format SpreadsheetML (XML Excel 2003) — dibuka native oleh
  // Excel dengan 3 tab terpisah, tanpa perlu library eksternal (SheetJS dst).
  function sheetXml(name, headers, rows) {
    const headRow = '<Row>' + headers.map(h => '<Cell><Data ss:Type="String">' + esc(h) + '</Data></Cell>').join('') + '</Row>';
    const bodyRows = rows.map(r => '<Row>' + r.map(c => {
      const isNum = typeof c === 'number';
      return '<Cell><Data ss:Type="' + (isNum ? 'Number' : 'String') + '">' + esc(c == null ? '' : c) + '</Data></Cell>';
    }).join('') + '</Row>').join('');
    return '<Worksheet ss:Name="' + esc(name) + '"><Table>' + headRow + bodyRows + '</Table></Worksheet>';
  }

  function exportFullExcel() {
    const s = State.settings || {};

    const agendaHeaders = ['Tanggal', 'Hari', 'Kegiatan', 'Kategori', 'Jam Mulai', 'Jam Selesai', 'Lokasi', 'Sasaran', 'Status', 'Prioritas', 'Keterangan'];
    const agendaRows = (State.agenda || []).map(a => [
      a.tanggal || '', a.hari || '', a.namaKegiatan || '', a.kategori || '',
      a.jamMulai || '', a.jamSelesai || '', a.lokasi || '', a.sasaran || '',
      a.status || '', a.prioritas || '', a.keterangan || ''
    ]);

    const piketHeaders = ['Tanggal', 'Shift', 'Catatan'];
    const piketRows = (State.piket || []).map(p => [p.tanggal || '', p.shift || '', p.catatan || '']);

    const masterHeaders = ['Nama Kegiatan', 'Kategori', 'Lokasi Default', 'Sasaran Default', 'Durasi (menit)', 'Keterangan Default', 'Aktif'];
    const masterRows = (State.master || []).map(m => [
      m.nama || '', m.kategori || '', m.lokasiDefault || '', m.sasaranDefault || '',
      m.durasiDefault || 0, m.keteranganDefault || '', m.aktif ? 'Ya' : 'Tidak'
    ]);

    if (!agendaRows.length && !piketRows.length && !masterRows.length) {
      if (typeof toast === 'function') toast('Tidak ada data untuk diekspor', 'warn');
      return;
    }

    const xml = '<?xml version="1.0"?>' +
      '<?mso-application progid="Excel.Sheet"?>' +
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
      '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>Laporan Bidan - ' + esc(s.namaBidan || '') + '</Title></DocumentProperties>' +
      sheetXml('Agenda', agendaHeaders, agendaRows) +
      sheetXml('Jadwal Piket', piketHeaders, piketRows) +
      sheetXml('Master Kegiatan', masterHeaders, masterRows) +
      '</Workbook>';

    dl(new Blob([xml], { type: 'application/vnd.ms-excel' }), 'laporan-lengkap-bidan-' + todayKey() + '.xls');
    if (typeof toast === 'function') toast('📗 Excel lengkap diunduh (3 sheet)', 'success');
    if (typeof Store !== 'undefined' && Store.log) Store.log('Export Excel lengkap', 'Agenda+Piket+Master');
  }

  // ===== IMPORT (RESTORE) =====
  function importJSON() {
    const inp = document.getElementById('import-file');
    if (inp) { inp.onchange = (e) => handleImportFile(e, 'merge'); inp.click(); }
  }

  async function handleImportFile(e, mode) {
    mode = mode || 'merge';
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      let nAgenda = 0, nPiket = 0, nMaster = 0;

      if (mode === 'replace') {
        State.agenda = [];
        State.piket = [];
        State.master = [];
      }

      if (data.agenda && Array.isArray(data.agenda)) {
        for (const it of data.agenda) {
          if (!it.id || !it.tanggal) continue;
          try { await Store.saveAgenda(it); } catch (err) { if (typeof queueAdd === 'function') queueAdd({ action: 'saveAgenda', item: it }); }
          State.agenda = State.agenda.filter(x => x.id !== it.id);
          State.agenda.push(it);
          nAgenda++;
        }
      }
      if (data.piket && Array.isArray(data.piket)) {
        for (const it of data.piket) {
          if (!it.id || !it.tanggal) continue;
          try { await Store.savePiket(it); } catch (err) { if (typeof queueAdd === 'function') queueAdd({ action: 'savePiket', item: it }); }
          State.piket = State.piket.filter(x => x.id !== it.id);
          State.piket.push(it);
          nPiket++;
        }
      }
      if (data.master && Array.isArray(data.master)) {
        for (const it of data.master) {
          if (!it.id || !it.nama) continue;
          try { await Store.saveMaster(it); } catch (err) { if (typeof queueAdd === 'function') queueAdd({ action: 'saveMaster', item: it }); }
          State.master = State.master.filter(x => x.id !== it.id);
          State.master.push(it);
          nMaster++;
        }
      }
      if (mode === 'replace' && data.settings) {
        State.settings = { ...State.settings, ...data.settings };
      } else if (data.settings) {
        State.settings = { ...State.settings, ...data.settings };
      }

      if (typeof cacheSettings === 'function') cacheSettings();
      if (typeof cacheData === 'function') cacheData();

      const label = mode === 'replace' ? 'Ganti semua' : 'Gabung';
      if (typeof toast === 'function') toast('✅ Pulihkan (' + label + ') selesai — ' + nAgenda + ' agenda, ' + nPiket + ' piket, ' + nMaster + ' master', 'success', 4200);
      if (typeof Store !== 'undefined' && Store.log) Store.log('Restore data (' + label + ')', nAgenda + ' agenda, ' + nPiket + ' piket, ' + nMaster + ' master');
      if (typeof closeModal === 'function') closeModal();
      if (typeof renderCurrentView === 'function') renderCurrentView();
    } catch (err) {
      if (typeof toast === 'function') toast('❌ File tidak valid: ' + err.message, 'error', 4500);
    }
    e.target.value = '';
  }

  return {
    showBackupOptions,
    backupAllJSON,
    exportFullExcel,
    exportAgendaJSON,
    importJSON,
    handleImportFile
  };
})();
