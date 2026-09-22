/* ============================================================
   chat.js — TIN NHẮN RIÊNG + NHÓM CHAT (v0.1.0)

   KHO nwChats/{id}:
     loai 'rieng'|'nhom' · ten (nhóm) · thanhVien[uid] · tv{uid:{ten,anh,lop,vaiTro}} · taoBoi
     · luc · capNhat · tinCuoi{chu,uid,ten,luc} · docLuc{uid: mốc đã đọc}
   nwChats/{id}/tin/{mid}: uid · ten · anh · chu · hinh · luc
   Mã phòng RIÊNG = hai uid xếp theo bảng chữ cái nối '__' ⇒ hai em nhắn nhau chỉ có MỘT phòng.

   AI NHẮN ĐƯỢC VỚI AI (thầy chốt 20/09/2026): cùng lớp + thầy. Khi bật CFG.BAT_KET_BAN thì
   thêm bạn bè đã kết bạn (kho nwBanBe) — luật Firestore đã có sẵn nhánh này.

   💸 Danh sách phòng dùng kênh chung của thanh.js (NW.nghePhong) — không mở kênh thứ hai.
   Phòng đang mở: onSnapshot 30 tin gần nhất; tin cũ hơn tải MỘT LẦN khi bấm "Xem tin cũ hơn".
   ============================================================ */
(function () {
  'use strict';
  var NW = window.NW, CFG = NW.CFG, $ = NW.$, $$ = NW.$$, IC = NW.IC, an = NW.chuAnToan;
  var Chat = NW.Chat = {};

  Chat.maRieng = function (a, b) { return a < b ? a + '__' + b : b + '__' + a; };

  // Người mà em được nhắn: cùng lớp (mọi lớp em học) + thầy + bạn bè (nếu bật).
  Chat.nguoiNhanDuoc = async function () {
    var toi = NW.toi; var ds = []; var co = {};
    var them = function (n) { if (n.uid !== toi.uid && !co[n.uid]) { co[n.uid] = 1; ds.push(n); } };
    if (NW.laBanThu()) {
      [{ uid: 'hs_1', ten: 'MINH ANH', lop: 'A1C', vaiTro: 'hs' }, { uid: 'hs_2', ten: 'BẢO NAM', lop: 'A1C', vaiTro: 'hs' }, { uid: 'gv', ten: 'Thầy Andrew', lop: 'GV', vaiTro: 'gv', anh: 'assets/avatar-tron.jpg' }].forEach(them);
      return ds;
    }
    (await NW.dsThay().catch(function () { return []; })).forEach(them);
    if (toi.laThay) {
      // Thầy: mọi lớp trong kho cấu hình (nếu có) — hoặc chỉ tìm theo tên ở màn nhắn mới.
      var cf = await Chat.dsLop();
      for (var i = 0; i < cf.length; i++) (await NW.nguoiTheoLop(cf[i].ma).catch(function () { return []; })).forEach(them);
    } else {
      var lops = toi.cacLop || [toi.lop];
      for (var j = 0; j < lops.length; j++) (await NW.nguoiTheoLop(lops[j]).catch(function () { return []; })).forEach(them);
    }
    if (CFG.BAT_KET_BAN) (await Chat.banBe().catch(function () { return []; })).forEach(them);
    return ds;
  };
  Chat.dsLop = async function () {
    try {
      var o = JSON.parse(sessionStorage.getItem('nwDsLop') || 'null');
      if (o && (Date.now() - o.luc) < 30 * 60 * 1000) return o.ds;
      var f = await NW.fb();
      var snap = await f.fs.getDoc(f.fs.doc(f.db, 'nwCauHinh', 'lop'));
      var ds = snap.exists() ? (snap.data().ds || []) : [];
      try { sessionStorage.setItem('nwDsLop', JSON.stringify({ luc: Date.now(), ds: ds })); } catch (e) { }
      return ds;
    } catch (e) { return []; }
  };
  // Bạn bè đã đồng ý (kho nwBanBe, sẵn cho tương lai).
  Chat.banBe = async function () {
    var f = await NW.fb();
    var q = f.fs.query(f.fs.collection(f.db, 'nwBanBe'), f.fs.where('thanhVien', 'array-contains', NW.toi.uid), f.fs.where('trangThai', '==', 'ok'), f.fs.limit(200));
    var snap = await f.fs.getDocs(q); var ds = [];
    snap.forEach(function (d) { var x = d.data(); var k = x.thanhVien[0] === NW.toi.uid ? x.thanhVien[1] : x.thanhVien[0]; ds.push(Object.assign({ uid: k }, (x.tv || {})[k] || { ten: '?' })); });
    return ds;
  };

  // Mở (tạo nếu chưa có) phòng riêng với một người → trả id phòng.
  Chat.moRieng = async function (nguoi) {
    var toi = NW.toi; var id = Chat.maRieng(toi.uid, nguoi.uid);
    if (NW.laBanThu()) return id;
    var f = await NW.fb();
    var ref = f.fs.doc(f.db, 'nwChats', id);
    var snap = await f.fs.getDoc(ref);
    if (!snap.exists()) {
      var tv = {}; tv[toi.uid] = NW.tomTat(toi); tv[nguoi.uid] = NW.tomTat(nguoi);
      var doc = { loai: 'rieng', ten: '', thanhVien: [toi.uid, nguoi.uid].sort(), tv: tv, taoBoi: toi.uid, luc: Date.now(), capNhat: Date.now(), tinCuoi: null, docLuc: {} };
      await f.fs.setDoc(ref, doc);
    }
    return id;
  };

  // v0.5.0 — dùng chung cho trang tin nhắn + hộp chat nổi (chatnoi.js)
  Chat.danhDauDoc = async function (phongId) {
    if (NW.laBanThu()) return;
    try { var f = await NW.fb(); var patch = {}; patch['docLuc.' + NW.toi.uid] = Date.now(); await f.fs.updateDoc(f.fs.doc(f.db, 'nwChats', phongId), patch); } catch (e) { }
  };
  // Gửi một tin vào phòng: tin = {chu} | {hinh}. Trả tin đã dựng (bàn thử: không ghi, trả để hiện tại chỗ); null nếu bị chặn từ cấm.
  Chat.guiTin = async function (phongId, tin) {
    var toi = NW.toi;
    if (tin.chu) { var tu = await NW.kiemTuCam(tin.chu); if (tu) { NW.toast('Tin có từ không phù hợp ("' + tu + '").', true); return null; } }
    var t = { uid: toi.uid, ten: toi.ten, anh: toi.anh || '', chu: String(tin.chu || '').slice(0, CFG.TOI_DA_CHU_TIN), hinh: tin.hinh || '', luc: Date.now() };
    if (NW.laBanThu()) return t;
    try {
      var f = await NW.fb();
      await f.fs.addDoc(f.fs.collection(f.db, 'nwChats', phongId, 'tin'), t);
      var patch = { tinCuoi: { chu: t.chu ? t.chu.slice(0, 80) : '', hinh: !!t.hinh, uid: toi.uid, ten: toi.ten, luc: t.luc }, capNhat: t.luc };
      patch['docLuc.' + toi.uid] = t.luc;
      await f.fs.updateDoc(f.fs.doc(f.db, 'nwChats', phongId), patch);
      return t;
    } catch (e) { NW.toast(NW.chuLoiKho(e), true); return null; }
  };

  // ---------- giao diện hai cột ----------
  Chat.dung = function (hop) {
    var toi = NW.toi;
    var PHONG = [], chon = '', dungNghe = null, TIN = [], hetCu = false, nguoiHienTai = null;
    hop.className = 'card tn';
    hop.innerHTML =
      '<div class="tn-ds"><div class="tn-ds-dau"><h2>Tin nhắn</h2>' +
        '<button class="nut-tron" id="tnMoi" title="Nhắn tin mới">' + IC.sua + '</button>' +
        '<button class="nut-tron" id="tnNhom" title="Tạo nhóm chat">' + IC.nhom + '</button></div>' +
        '<div class="tn-ds-cuon" id="tnDs"><div class="tn-trong">Đang tải…</div></div></div>' +
      '<div class="tn-phong" id="tnPhong"><div class="tn-trong">' + IC.tinNhan + 'Chọn một cuộc trò chuyện, hoặc bấm ' + IC.sua + ' để nhắn cho bạn.</div></div>';
    var khuDs = $('#tnDs', hop), khuPhong = $('#tnPhong', hop);

    function tenPhong(p) {
      if (p.loai === 'nhom') return p.ten || 'Nhóm';
      var k = (p.thanhVien || []).filter(function (u) { return u !== toi.uid; })[0] || toi.uid;
      return ((p.tv || {})[k] || {}).ten || '?';
    }
    function avPhong(p) {
      if (p.loai === 'nhom') {
        var khac = (p.thanhVien || []).filter(function (u) { return u !== toi.uid; });
        var tvs = khac.concat([toi.uid]).slice(0, 2).map(function (u) { return u === toi.uid ? toi : ((p.tv || {})[u] || { ten: '?' }); });
        return '<span class="av-nhom">' + tvs.map(function (t) { return NW.avHtml(t); }).join('') + '</span>';
      }
      var k = (p.thanhVien || []).filter(function (u) { return u !== toi.uid; })[0] || toi.uid;
      return NW.avHtml((p.tv || {})[k] || { ten: '?' });
    }
    function chuaDoc(p) { var tc = p.tinCuoi || {}; return !!(tc.luc && tc.uid !== toi.uid && tc.luc > ((p.docLuc || {})[toi.uid] || 0)); }

    function veDs() {
      if (!PHONG.length) { khuDs.innerHTML = '<div class="tn-trong">Chưa có cuộc trò chuyện nào.<br>Bấm ✎ để nhắn cho bạn cùng lớp hoặc thầy.</div>'; return; }
      khuDs.innerHTML = PHONG.map(function (p) {
        var tc = p.tinCuoi || {};
        var cuoi = tc.luc ? ((tc.uid === toi.uid ? 'Em: ' : (p.loai === 'nhom' ? (tc.ten || '') + ': ' : '')) + (tc.chu || (tc.hinh ? '📷 Ảnh' : ''))) : 'Bắt đầu trò chuyện';
        return '<button class="tn-muc' + (p.id === chon ? ' chon' : '') + (chuaDoc(p) ? ' chua' : '') + '" data-id="' + an(p.id) + '">' + avPhong(p) +
          '<span class="tt"><span class="ten">' + an(tenPhong(p)) + '</span><span class="cuoi">' + an(cuoi) + '</span></span>' +
          '<span class="gio">' + an(NW.chuGio(tc.luc || p.capNhat)) + '</span>' + (chuaDoc(p) ? '<span class="cham"></span>' : '') + '</button>';
      }).join('');
      $$('.tn-muc', khuDs).forEach(function (b) { b.onclick = function () { moPhong(b.getAttribute('data-id')); }; });
    }

    // ---------- phòng ----------
    function veKhungPhong(p) {
      var tvSo = (p.thanhVien || []).length;
      khuPhong.innerHTML =
        '<div class="tn-phong-dau"><button class="nut-tron lui" id="tnLui" aria-label="Quay lại">' + IC.lui + '</button>' + avPhong(p) +
        '<div style="flex:1;min-width:0"><div class="ten">' + an(tenPhong(p)) + '</div><div class="phu">' +
        (p.loai === 'nhom' ? tvSo + ' thành viên' : an((((p.tv || {})[(p.thanhVien || []).filter(function (u) { return u !== toi.uid; })[0]] || {}).lop) || '')) + '</div></div>' +
        '<button class="nut-tron" id="tnMenu" aria-label="Menu phòng">' + IC.baCham + '</button></div>' +
        '<div class="tn-cuon" id="tnCuon"></div>' +
        '<div class="tn-nhap"><button class="anh" id="tnAnh" title="Gửi ảnh">' + IC.anh + '</button><input type="file" id="tnFile" accept="image/*" hidden>' +
        '<textarea id="tnChu" rows="1" placeholder="Nhắn gì đó…" maxlength="' + CFG.TOI_DA_CHU_TIN + '"></textarea>' +
        '<button class="gui" id="tnGui" disabled aria-label="Gửi">' + IC.gui + '</button></div>';
      hop.classList.add('mo-phong');
      $('#tnLui', khuPhong).onclick = function () { hop.classList.remove('mo-phong'); chon = ''; veDs(); };
      var ta = $('#tnChu', khuPhong), gui = $('#tnGui', khuPhong);
      NW.tuCao(ta, 140);
      ta.addEventListener('input', function () { gui.disabled = !ta.value.trim(); });
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!gui.disabled) gui.click(); } });
      gui.onclick = function () { var chu = ta.value.trim(); if (!chu) return; ta.value = ''; ta.style.height = 'auto'; gui.disabled = true; guiTin(p, { chu: chu }); };
      $('#tnAnh', khuPhong).onclick = function () { $('#tnFile', khuPhong).click(); };
      $('#tnFile', khuPhong).onchange = async function () {
        var file = this.files && this.files[0]; this.value = ''; if (!file) return;
        try {
          NW.toast('Đang gửi ảnh…');
          var blob = await NW.nenAnh(file, { canhDai: 1280 });
          var url = NW.laBanThu() ? URL.createObjectURL(blob) : await NW.taiAnh(blob, NW.tenAnhMoi('_t'));
          guiTin(p, { hinh: url });
        } catch (e) { NW.toast('Không gửi được ảnh: ' + (e.message || e), true); }
      };
      $('#tnMenu', khuPhong).onclick = function () { menuPhong(this, p); };
    }
    function veTin() {
      var cuon = $('#tnCuon', khuPhong); if (!cuon) return;
      var gan = cuon.scrollHeight - cuon.scrollTop - cuon.clientHeight < 80;
      var html = (!hetCu && TIN.length >= 30 ? '<button class="bl-them" id="tnCu" style="align-self:center;padding:6px 12px">Xem tin cũ hơn</button>' : '');
      var ngayTruoc = '', uidTruoc = '';
      TIN.forEach(function (t) {
        var ngay = NW.chuNgay(t.luc);
        if (ngay !== ngayTruoc) { html += '<div class="tin-ngay">' + an(ngay) + '</div>'; ngayTruoc = ngay; uidTruoc = ''; }
        var cuaToi = t.uid === toi.uid;
        if (!cuaToi && t.uid !== uidTruoc && nguoiHienTai && nguoiHienTai.loai === 'nhom') html += '<div class="ai">' + an(t.ten) + '</div>';
        html += '<div class="tin' + (cuaToi ? ' toi' : '') + '">' + NW.avHtml({ ten: t.ten, anh: t.anh }) +
          '<div class="bong">' + (t.chu ? NW.chuCoLink(t.chu) : '') + (t.hinh ? '<img src="' + an(t.hinh) + '" alt="" data-anh="' + an(t.hinh) + '" loading="lazy">' : '') + '</div>' +
          '<span class="gio">' + an(NW.chuGio(t.luc)) + '</span></div>';
        uidTruoc = t.uid;
      });
      if (!TIN.length) html += '<div class="tn-trong">Chưa có tin nào. Nhắn câu đầu tiên đi!</div>';
      cuon.innerHTML = html;
      $$('[data-anh]', cuon).forEach(function (im) { im.onclick = function () { NW.xemAnh(im.getAttribute('data-anh')); }; });
      var cu = $('#tnCu', cuon); if (cu) cu.onclick = taiCu;
      if (gan || !cuon._daCuon) { cuon.scrollTop = cuon.scrollHeight; cuon._daCuon = true; }
    }
    async function moPhong(id, pTruoc) {
      chon = id; veDs();
      var p = PHONG.filter(function (x) { return x.id === id; })[0] || pTruoc;
      if (!p) return;
      nguoiHienTai = p; TIN = []; hetCu = false;
      if (dungNghe) { try { dungNghe(); } catch (e) { } dungNghe = null; }
      veKhungPhong(p);
      if (NW.laBanThu()) {
        TIN = [{ uid: 'hs_1', ten: 'MINH ANH', chu: 'Chào bạn! Bài WORDS 2 bạn làm chưa?', luc: Date.now() - 86400e3 * 1.2 }, { uid: toi.uid, ten: toi.ten, chu: 'Mình làm rồi, dễ lắm 😄', luc: Date.now() - 86400e3 * 1.19 }, { uid: 'hs_1', ten: 'MINH ANH', chu: 'Cảm ơn bạn nha', luc: Date.now() - 200e3 }];
        veTin(); return;
      }
      var f = await NW.fb();
      var q = f.fs.query(f.fs.collection(f.db, 'nwChats', id, 'tin'), f.fs.orderBy('luc', 'desc'), f.fs.limit(30));
      dungNghe = f.fs.onSnapshot(q, function (snap) {
        if (chon !== id) return;
        var moi = []; snap.forEach(function (d) { moi.push(Object.assign({ id: d.id }, d.data())); });
        moi.reverse();
        // ghép với tin cũ đã tải thêm (những tin có luc nhỏ hơn tin đầu của cửa sổ 30)
        var mocDau = moi.length ? moi[0].luc : Infinity;
        var cu = TIN.filter(function (t) { return t.luc < mocDau && t._cu; });
        TIN = cu.concat(moi);
        if (snap.size < 30) hetCu = true;
        veTin(); danhDauDoc(p);
      }, function (e) { $('#tnCuon', khuPhong).innerHTML = '<div class="tn-trong">' + an(NW.chuLoiKho(e)) + '</div>'; });
    }
    async function taiCu() {
      if (!TIN.length) return;
      var f = await NW.fb();
      var q = f.fs.query(f.fs.collection(f.db, 'nwChats', chon, 'tin'), f.fs.orderBy('luc', 'desc'), f.fs.where('luc', '<', TIN[0].luc), f.fs.limit(30));
      var snap = await f.fs.getDocs(q); var ds = [];
      snap.forEach(function (d) { ds.push(Object.assign({ id: d.id, _cu: true }, d.data())); });
      if (ds.length < 30) hetCu = true;
      ds.reverse(); TIN = ds.concat(TIN);
      var cuon = $('#tnCuon', khuPhong); var h = cuon.scrollHeight;
      veTin(); cuon.scrollTop = cuon.scrollHeight - h;
    }
    async function danhDauDoc(p) {
      if (!chuaDoc(p) && (p.docLuc || {})[toi.uid]) return;
      Chat.danhDauDoc(p.id);
    }
    async function guiTin(p, tin) {
      var t = await Chat.guiTin(p.id, tin);
      if (t && NW.laBanThu()) { TIN.push(t); veTin(); }
    }

    // ---------- menu phòng ----------
    function menuPhong(nut, p) {
      var items = [];
      if (p.loai === 'nhom') {
        items.push({ ic: IC.nhom, chu: 'Thành viên (' + (p.thanhVien || []).length + ')', onclick: function () { xemThanhVien(p); } });
        if (p.taoBoi === toi.uid || toi.laThay) {
          items.push({ ic: IC.them, chu: 'Thêm thành viên', onclick: function () { themThanhVien(p); } });
          items.push({ ic: IC.sua, chu: 'Đổi tên nhóm', onclick: function () { doiTenNhom(p); } });
        }
        items.push({ ic: IC.thoat, chu: 'Rời nhóm', nguy: true, onclick: function () { roiNhom(p); } });
      } else {
        var k = (p.thanhVien || []).filter(function (u) { return u !== toi.uid; })[0];
        items.push({ ic: IC.caNhan, chu: 'Xem trang cá nhân', onclick: function () { location.href = 'canhan.html?uid=' + k; } });
      }
      NW.menuNho(nut, items);
    }
    function xemThanhVien(p) {
      NW.popMo({ tieuDe: 'Thành viên nhóm', html: '<div class="ds-nguoi">' + (p.thanhVien || []).map(function (u) {
        var t = (p.tv || {})[u] || { ten: '?' };
        return '<a class="nguoi" href="canhan.html?uid=' + an(u) + '">' + NW.avHtml(t, 'nho') + '<span><span class="ten">' + an(t.ten) + '</span><br><span class="lop">' + an(t.lop || '') + (u === p.taoBoi ? ' · người tạo' : '') + '</span></span></a>';
      }).join('') + '</div>' });
    }
    async function themThanhVien(p) {
      var ds = (await Chat.nguoiNhanDuoc()).filter(function (n) { return (p.thanhVien || []).indexOf(n.uid) < 0; });
      chonNguoi('Thêm vào nhóm', ds, true, async function (chonDs) {
        if (!chonDs.length) return;
        if ((p.thanhVien || []).length + chonDs.length > CFG.TOI_DA_THANH_VIEN_NHOM) { NW.toast('Nhóm tối đa ' + CFG.TOI_DA_THANH_VIEN_NHOM + ' người.', true); return; }
        if (NW.laBanThu()) return;
        try {
          var f = await NW.fb(); var patch = { thanhVien: f.fs.arrayUnion.apply(null, chonDs.map(function (n) { return n.uid; })) };
          chonDs.forEach(function (n) { patch['tv.' + n.uid] = NW.tomTat(n); });
          await f.fs.updateDoc(f.fs.doc(f.db, 'nwChats', p.id), patch);
          chonDs.forEach(function (n) { NW.guiThongBao(n.uid, { loai: 'nhom', chu: p.ten || 'Nhóm', link: 'tinnhan.html?phong=' + p.id }); });
          NW.toast('Đã thêm ' + chonDs.length + ' bạn.');
        } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
      });
    }
    function doiTenNhom(p) {
      var pop = NW.popMo({ tieuDe: 'Đổi tên nhóm', html: '<input type="text" id="tenNhom" maxlength="60" value="' + an(p.ten || '') + '">',
        chan: '<button class="btn soft" data-dong>Thôi</button><button class="btn primary" id="tenOk">Lưu</button>' });
      $('[data-dong]', pop).onclick = NW.popDong;
      $('#tenOk', pop).onclick = async function () {
        var ten = $('#tenNhom', pop).value.trim(); if (!ten) return;
        NW.popDong(); if (NW.laBanThu()) return;
        try { var f = await NW.fb(); await f.fs.updateDoc(f.fs.doc(f.db, 'nwChats', p.id), { ten: ten }); } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
      };
    }
    async function roiNhom(p) {
      if (!(await NW.hoi('Rời nhóm?', 'Em sẽ không nhận tin của nhóm này nữa.', { ok: 'Rời nhóm', nguy: true }))) return;
      if (NW.laBanThu()) return;
      try {
        var f = await NW.fb(); var patch = { thanhVien: f.fs.arrayRemove(toi.uid) }; patch['tv.' + toi.uid] = f.fs.deleteField();
        await f.fs.updateDoc(f.fs.doc(f.db, 'nwChats', p.id), patch);
        hop.classList.remove('mo-phong'); chon = ''; khuPhong.innerHTML = '<div class="tn-trong">Đã rời nhóm.</div>';
      } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
    }

    // ---------- chọn người (nhắn mới / tạo nhóm) ----------
    function chonNguoi(tieuDe, ds, nhieu, xong, themHtml) {
      var pop = NW.popMo({ tieuDe: tieuDe, html: (themHtml || '') +
        '<div class="tim-o">' + IC.timKiem + '<input type="search" id="cnTim" placeholder="Tìm theo tên…"></div>' +
        '<div class="chon-nguoi" id="cnDs"></div>',
        chan: nhieu ? '<button class="btn soft" data-dong>Thôi</button><button class="btn primary" id="cnOk">Xong</button>' : '' });
      var khu = $('#cnDs', pop), tim = $('#cnTim', pop);
      var daChon = {};
      function ve() {
        var q = NW.khongDau(tim.value);
        var loc = ds.filter(function (n) { return !q || NW.khongDau(n.ten).indexOf(q) >= 0; });
        khu.innerHTML = loc.length ? loc.map(function (n) {
          return '<label>' + (nhieu ? '<input type="checkbox" data-uid="' + an(n.uid) + '"' + (daChon[n.uid] ? ' checked' : '') + '>' : '') +
            NW.avHtml(n, 'nho') + '<span class="ten">' + an(n.ten) + '</span><span class="lop">' + an(n.vaiTro === 'gv' ? 'THẦY' : (n.lop || '')) + '</span></label>';
        }).join('') : '<div class="trong">Không thấy ai.</div>';
        if (nhieu) $$('input[type=checkbox]', khu).forEach(function (c) { c.onchange = function () { daChon[c.getAttribute('data-uid')] = c.checked; }; });
        else $$('label', khu).forEach(function (l, i) { l.onclick = function () { NW.popDong(); xong([loc[i]]); }; });
      }
      tim.oninput = ve; ve();
      if (nhieu) { $('[data-dong]', pop).onclick = NW.popDong; $('#cnOk', pop).onclick = function () { NW.popDong(); xong(ds.filter(function (n) { return daChon[n.uid]; })); }; }
      return pop;
    }
    $('#tnMoi', hop).onclick = async function () {
      var ds = await Chat.nguoiNhanDuoc();
      chonNguoi('Nhắn tin cho ai?', ds, false, async function (c) {
        var n = c[0]; if (!n) return;
        try { var id = await Chat.moRieng(n); var pMoi = { id: id, loai: 'rieng', thanhVien: [toi.uid, n.uid], tv: {}, tinCuoi: null, docLuc: {} }; pMoi.tv[n.uid] = NW.tomTat(n); pMoi.tv[toi.uid] = NW.tomTat(toi); moPhong(id, pMoi); }
        catch (e) { NW.toast(NW.chuLoiKho(e), true); }
      });
    };
    $('#tnNhom', hop).onclick = async function () {
      var ds = await Chat.nguoiNhanDuoc();
      var pop = chonNguoi('Tạo nhóm chat', ds, true, async function (chonDs) {
        var ten = ($('#nhomTen') ? $('#nhomTen').value.trim() : '') || tenTam;
        if (!chonDs.length) { NW.toast('Chọn ít nhất một bạn.', true); return; }
        if (chonDs.length + 1 > CFG.TOI_DA_THANH_VIEN_NHOM) { NW.toast('Nhóm tối đa ' + CFG.TOI_DA_THANH_VIEN_NHOM + ' người.', true); return; }
        if (NW.laBanThu()) { NW.toast('Bàn thử: không ghi thật.'); return; }
        try {
          var f = await NW.fb();
          var tv = {}; tv[toi.uid] = NW.tomTat(toi); chonDs.forEach(function (n) { tv[n.uid] = NW.tomTat(n); });
          var doc = { loai: 'nhom', ten: ten, thanhVien: [toi.uid].concat(chonDs.map(function (n) { return n.uid; })), tv: tv, taoBoi: toi.uid,
                      luc: Date.now(), capNhat: Date.now(), tinCuoi: null, docLuc: {} };
          var ref = await f.fs.addDoc(f.fs.collection(f.db, 'nwChats'), doc);
          chonDs.forEach(function (n) { NW.guiThongBao(n.uid, { loai: 'nhom', chu: ten, link: 'tinnhan.html?phong=' + ref.id }); });
          moPhong(ref.id, Object.assign({ id: ref.id }, doc));
        } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
      }, '<label class="lbl">Tên nhóm</label><input type="text" id="nhomTen" maxlength="60" placeholder="VD: Nhóm ôn WORDS lớp A1C" style="margin-bottom:12px">');
      var tenTam = 'Nhóm của ' + toi.ten;
    };

    // ---------- nhận danh sách phòng từ kênh chung ----------
    var lanDau = true;
    NW.nghePhong(function (ds) {
      PHONG = ds;
      if (chon) { var p = ds.filter(function (x) { return x.id === chon; })[0]; if (p) { nguoiHienTai = p; var ten = $('.tn-phong-dau .ten', khuPhong); if (ten) ten.textContent = tenPhong(p); } }
      veDs();
      if (lanDau) {
        lanDau = false;
        var voi = NW.thamSo('voi'), phong = NW.thamSo('phong');
        if (phong) moPhong(phong);
        else if (voi) NW.hoSo(voi).then(function (hs) { if (hs) return Chat.moRieng(Object.assign({ uid: voi }, hs)).then(function (id) { var pMoi = { id: id, loai: 'rieng', thanhVien: [toi.uid, voi], tv: {}, tinCuoi: null, docLuc: {} }; pMoi.tv[voi] = NW.tomTat(Object.assign({ uid: voi }, hs)); moPhong(id, pMoi); }); }).catch(function (e) { NW.toast(NW.chuLoiKho(e), true); });
      }
    });
    if (NW.laBanThu()) {
      PHONG = [{ id: 'hs_0__hs_1', loai: 'rieng', thanhVien: ['hs_0', 'hs_1'], tv: { hs_1: { ten: 'MINH ANH', lop: 'A1C', vaiTro: 'hs' } }, tinCuoi: { chu: 'Cảm ơn bạn nha', uid: 'hs_1', luc: Date.now() - 200e3 }, docLuc: {} },
               { id: 'n1', loai: 'nhom', ten: 'Nhóm ôn WORDS A1C', thanhVien: ['hs_0', 'hs_1', 'hs_2'], tv: { hs_1: { ten: 'MINH ANH' }, hs_2: { ten: 'BẢO NAM' } }, taoBoi: 'hs_0', tinCuoi: { chu: 'Mai thi nha mọi người', uid: 'hs_2', ten: 'BẢO NAM', luc: Date.now() - 5000e3 }, docLuc: { hs_0: Date.now() } }];
      veDs();
    }
  };
})();
