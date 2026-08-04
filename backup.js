/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — js/backup.js (Fase 2)
   Poin 4: Backup / Restore yang lebih baik.
   ------------------------------------------------------------
   window.BidanBackup:
     showBackupOptions()  → modal pilihan backup/import
     backupAllJSON()      → backup lengkap (semua data) ke JSON
     exportFullExcel()    → export Excel (Agenda + Piket + Master)
     exportAgendaJSON()   → export agenda saja ke JSON
     importJSON()         → dialog pilih mode lalu pilih file
     handleImportFile(e, mode) → proses file; mode 'merge' | 'replace'
   ------------------------------------------------------------
   Modul ini dimuat SEBELUM app.js. Semua referensi ke fungsi/
   state milik app.js (State, Store, toast, openModal, dll.)
   hanya dipakai SAAT DIPANGGIL (call-time), bukan saat load,
   sehingga aman. Jika app.js tidak ada, modul gagal dengan
   pesan yang jelas — tidak merusak halaman.
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  /* ---- helper defensif ke API app.js (dipanggil saat runtime) ---- */
  function _toast(msg, type, dur) { if (typeof toast === 'function') toast(msg, type, dur); else console.log('[backup]', msg); }
  function _esc(s) {
    if (typeof escapeHtml === 'function') return escapeHtml(s);
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function _todayKey() {
    if (typeof todayKey === 'function') return todayKey();
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function _fmtT(k) { return (typeof fmtTanggal === 'function') ? fmtTanggal(k) : k; }
  function _fmtHM(t) { return (typeof fmtHM === 'function') ? fmtHM(t) : (t || '—'); }

  function _download(blob, nama) {
    if (typeof downloadBlob === 'function') { downloadBlob(blob, nama); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function _ready() { return typeof State !== 'undefined' && typeof Store !== 'undefined'; }

  /* ============================================================
     MODAL PILIHAN BACKUP
     ============================================================ */
  function showBackupOptions() {
    if (typeof openModal !== 'function') { _toast('Modul UI belum siap', 'error'); return; }
    const nA = State.agenda.length, nP = State.piket.length, nM = State.master.length;
    openModal(`
      <p class="small muted" style="margin-bottom:12px">
        Data saat ini: <b>${nA} agenda</b> • <b>${nP} piket</b> • <b>${nM} master kegiatan</b>.
        File backup bisa dipindahkan ke perangkat lain lalu di-import kembali (digabung atau ganti semua).
      </p>
      <div class="card-title">📤 Backup / Export</div>
      <div class="flex flex-wrap mb-16" style="gap:8px">
        <button class="btn btn-primary btn-sm" data-action="backup-all-json">💾 Backup Lengkap (JSON)</button>
        <button class="btn btn-soft btn-sm" data-action="backup-full-excel">📗 Semua Data (Excel)</button>
        <button class="btn btn-soft btn-sm" data-action="export-agenda-json">📤 Agenda Saja (JSON)</button>
      </div>
      <div class="card-title">📥 Restore / Import</div>
      <div class="flex flex-wrap" style="gap:8px">
        <button class="btn btn-soft btn-sm" data-action="import-merge">📥 Import — Gabung (merge)</button>
        <button class="btn btn-danger btn-sm" data-action="import-replace">⚠️ Import — Ganti Semua (replace)</button>
      </div>
      <p class="small muted" style="margin-top:12px">
        <b>Merge</b>: data dari file ditambahkan / diperbarui, data lain tetap ada.<br>
        <b>Replace</b>: seluruh data diganti isi file backup (diminta konfirmasi dulu).
      </p>`, { title: '💾 Backup & Restore Data' });
  }

  /* ============================================================
     BACKUP / EXPORT
     ============================================================ */
  function backupAllJSON() {
    if (!_ready()) return;
    const data = {
      app: (typeof APP !== 'undefined' ? APP.nama : 'Agenda Bidan'),
      versi: (typeof APP !== 'undefined' ? APP.versi : ''),
      tanggal: new Date().toISOString(),
      settings: State.settings,
      agenda: State.agenda,
      piket: State.piket,
      master: State.master,
      log: State.log || [],
    };
    _download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'backup-bidan-' + _todayKey() + '.json');
    _toast('💾 Backup lengkap diunduh (' + State.agenda.length + ' agenda, ' + State.piket.length + ' piket, ' + State.master.length + ' master)', 'success');
    try { Store.log('Backup lengkap JSON', ''); } catch (e) { /* abaikan */ }
  }

  function exportAgendaJSON() {
    if (!_ready()) return;
    const data = { tanggal: new Date().toISOString(), agenda: State.agenda };
    _download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'export-agenda-' + _todayKey() + '.json');
    _toast('📤 Export agenda diunduh', 'success');
  }

  function exportFullExcel() {
    if (!_ready()) return;
    if (!State.agenda.length && !State.piket.length && !State.master.length) { _toast('Tidak ada data untuk diekspor', 'warn'); return; }
    const s = State.settings || {};

    const tAgenda = '<h3>Agenda</h3><table border="1"><tr><th>Tanggal</th><th>Hari</th><th>Kegiatan</th><th>Kategori</th><th>Jam</th><th>Lokasi</th><th>Sasaran</th><th>Status</th><th>Prioritas</th><th>Keterangan</th></tr>' +
      State.agenda.map(a => '<tr><td>' + _esc(a.tanggal) + '</td><td>' + _esc(a.hari || '') + '</td><td>' + _esc(a.namaKegiatan) + '</td><td>' + _esc(a.kategori) + '</td><td>' + _esc(_fmtHM(a.jamMulai) + (a.jamSelesai ? '–' + _fmtHM(a.jamSelesai) : '')) + '</td><td>' + _esc(a.lokasi || '') + '</td><td>' + _esc(a.sasaran || '') + '</td><td>' + _esc(a.status) + '</td><td>' + _esc(a.prioritas || '') + '</td><td>' + _esc(a.keterangan || '') + '</td></tr>').join('') + '</table>';

    const tPiket = '<h3>Jadwal Piket</h3><table border="1"><tr><th>Tanggal</th><th>Shift</th><th>Catatan</th></tr>' +
      State.piket.map(p => '<tr><td>' + _esc(p.tanggal) + '</td><td>' + _esc(p.shift) + '</td><td>' + _esc(p.catatan || '') + '</td></tr>').join('') + '</table>';

    const tMaster = '<h3>Master Kegiatan</h3><table border="1"><tr><th>Nama</th><th>Kategori</th><th>Lokasi</th><th>Sasaran</th><th>Durasi (mnt)</th><th>Aktif</th><th>Keterangan</th></tr>' +
      State.master.map(m => '<tr><td>' + _esc(m.nama) + '</td><td>' + _esc(m.kategori) + '</td><td>' + _esc(m.lokasiDefault || '') + '</td><td>' + _esc(m.sasaranDefault || '') + '</td><td>' + _esc(m.durasiDefault || '') + '</td><td>' + (m.aktif ? 'Ya' : 'Tidak') + '</td><td>' + _esc(m.keteranganDefault || '') + '</td></tr>').join('') + '</table>';

    const html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' +
      '<h2>Backup Data — ' + _esc(s.namaBidan || 'Bidan') + ' (' + new Date().toLocaleDateString('id-ID') + ')</h2>' +
      tAgenda + '<br>' + tPiket + '<br>' + tMaster + '</body></html>';
    _download(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' }), 'backup-lengkap-' + _todayKey() + '.xls');
    _toast('📗 Backup Excel lengkap diunduh', 'success');
    try { Store.log('Export Excel lengkap', ''); } catch (e) { /* abaikan */ }
  }

  /* ============================================================
     IMPORT / RESTORE
     ============================================================ */
  function importJSON() {
    // Dialog mode dulu (merge aman / replace berbahaya) — tombolnya
    // memakai data-action yang sudah ditangani app.js.
    if (typeof openModal === 'function') {
      openModal(`
        <p class="small muted" style="margin-bottom:12px">Pilih cara menggabungkan isi file backup dengan data saat ini:</p>
        <div class="flex" style="gap:8px;flex-direction:column">
          <button class="btn btn-primary" data-action="import-merge">📥 <b>Gabung (merge)</b> — tambah/perbarui, data lain aman</button>
          <button class="btn btn-danger" data-action="import-replace">⚠️ <b>Ganti Semua (replace)</b> — data saat ini dihapus dulu</button>
        </div>
        <div class="modal-foot"><button class="btn btn-soft" data-action="modal-close">Batal</button></div>`,
        { title: '📥 Restore / Import JSON' });
    } else {
      _pickFile('merge');
    }
  }

  function _pickFile(mode) {
    const inp = document.getElementById('import-file');
    if (!inp) { _toast('Input file tidak ditemukan', 'error'); return; }
    inp.onchange = (e) => {
      try { e.stopPropagation(); } catch (_) { /* abaikan */ }
      inp.onchange = null;
      handleImportFile(e, mode);
    };
    inp.value = '';
    inp.click();
  }

  function _validAgenda(it) { return it && it.id && it.tanggal; }
  function _validPiket(it) { return it && it.id && it.tanggal; }
  function _validMaster(it) { return it && it.id && it.nama; }

  async function _save(kind, it) {
    try {
      if (kind === 'agenda') await Store.saveAgenda(it);
      else if (kind === 'piket') await Store.savePiket(it);
      else await Store.saveMaster(it);
      return true;
    } catch (e) {
      try { queueAdd({ action: 'save' + (kind === 'agenda' ? 'Agenda' : kind === 'piket' ? 'Piket' : 'Master'), item: it }); } catch (_) { /* abaikan */ }
      return false;
    }
  }

  async function _delete(kind, id) {
    try {
      if (kind === 'agenda') await Store.deleteAgenda(id);
      else if (kind === 'piket') await Store.deletePiket(id);
      else await Store.deleteMaster(id);
    } catch (e) {
      try { queueAdd({ action: 'delete' + (kind === 'agenda' ? 'Agenda' : kind === 'piket' ? 'Piket' : 'Master'), id }); } catch (_) { /* abaikan */ }
    }
  }

  async function handleImportFile(e, mode) {
    // Cegah pemrosesan ganda: delegasi change global app.js juga
    // memantau #import-file — hentikan bubbling di sini.
    try { e.stopPropagation(); } catch (_) { /* abaikan */ }
    mode = mode || 'merge';
    if (!_ready()) { _toast('Aplikasi belum siap', 'error'); return; }

    const f = e.target && e.target.files && e.target.files[0];
    if (e.target) e.target.value = '';
    if (!f) return;

    let data;
    try { data = JSON.parse(await f.text()); }
    catch (err) { _toast('❌ File tidak valid: ' + err.message, 'error', 4500); return; }
    if (!data || typeof data !== 'object') { _toast('❌ Struktur file tidak dikenali', 'error'); return; }

    if (typeof setProgress === 'function') setProgress(15);
    const res = { agenda: 0, piket: 0, master: 0, settings: false, dihapus: 0, antre: 0 };

    /* REPLACE: hapus dulu koleksi yang digantikan oleh file */
    if (mode === 'replace') {
      const agendaBaru = Array.isArray(data.agenda) ? data.agenda : null;
      const piketBaru = Array.isArray(data.piket) ? data.piket : null;
      const masterBaru = Array.isArray(data.master) ? data.master : null;
      if (agendaBaru) { for (const it of State.agenda.slice()) { await _delete('agenda', it.id); res.dihapus++; } State.agenda = []; }
      if (piketBaru) { for (const it of State.piket.slice()) { await _delete('piket', it.id); res.dihapus++; } State.piket = []; }
      if (masterBaru) { for (const it of State.master.slice()) { await _delete('master', it.id); res.dihapus++; } State.master = []; }
    }

    /* Simpan (upsert) item dari file + perbarui state lokal */
    if (Array.isArray(data.agenda)) {
      for (const it of data.agenda) {
        if (!_validAgenda(it)) continue;
        if (!(await _save('agenda', it))) res.antre++;
        const i = State.agenda.findIndex(x => x.id === it.id);
        if (i >= 0) State.agenda[i] = it; else State.agenda.push(it);
        res.agenda++;
      }
    }
    if (Array.isArray(data.piket)) {
      for (const it of data.piket) {
        if (!_validPiket(it)) continue;
        if (!(await _save('piket', it))) res.antre++;
        const i = State.piket.findIndex(x => x.id === it.id);
        if (i >= 0) State.piket[i] = it; else State.piket.push(it);
        res.piket++;
      }
    }
    if (Array.isArray(data.master)) {
      for (const it of data.master) {
        if (!_validMaster(it)) continue;
        if (!(await _save('master', it))) res.antre++;
        const i = State.master.findIndex(x => x.id === it.id);
        if (i >= 0) State.master[i] = it; else State.master.push(it);
        res.master++;
      }
    }
    if (data.settings && typeof data.settings === 'object') {
      State.settings = { ...State.settings, ...data.settings };
      res.settings = true;
      try { if (typeof cacheSettings === 'function') cacheSettings(); } catch (_) { /* abaikan */ }
    }

    try { if (typeof cacheData === 'function') cacheData(); } catch (_) { /* abaikan */ }
    if (typeof setProgress === 'function') setProgress(100);

    const ringkas = res.agenda + ' agenda, ' + res.piket + ' piket, ' + res.master + ' master' +
      (mode === 'replace' ? ' • ' + res.dihapus + ' data lama dihapus' : '') +
      (res.antre ? ' • ' + res.antre + ' masuk antrian offline' : '');
    _toast('✅ Import ' + (mode === 'replace' ? '(ganti semua) ' : '(gabung) ') + 'selesai: ' + ringkas, 'success', 5000);
    try { Store.log('Import ' + mode, ringkas); } catch (_) { /* abaikan */ }
    if (typeof renderCurrentView === 'function') renderCurrentView();
  }

  window.BidanBackup = {
    showBackupOptions, backupAllJSON, exportFullExcel, exportAgendaJSON,
    importJSON, pickFile: _pickFile, handleImportFile,
  };
})();
