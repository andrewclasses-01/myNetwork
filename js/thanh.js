/* ============================================================
   thanh.js — THANH TRÊN CÙNG + CỬA VÀO TRANG (v0.1.0)

   Mọi trang (trừ index.html) gọi:
       NW.dungThanh({ tab: 'bangTin' }).then(function (phien) { ... })
   Hàm này:
     1. Kiểm phiên: chưa đăng nhập → về index.html · chưa đặt mật khẩu → index.html#doimk
        · tài khoản bị khoá → màn báo · thiếu hồ sơ → màn báo.
     2. Vẽ thanh 5 tab thầy chốt: TRANG BÀI TẬP · BẢNG TIN · TIN NHẮN · KHÁM PHÁ · CÁ NHÂN
        + chuông thông báo + avatar (menu: trang cá nhân · đổi mật khẩu · quản lý · đăng xuất).
     3. Mở HAI kênh nghe dùng chung cho cả trang (mỗi trang chỉ MỘT lần, nơi khác đăng ký
        nhận qua NW.ngheThongBao / NW.nghePhong — không mở kênh trùng, tiền đọc Firestore):
          · nwUsers/{uid}/thongBao  (20 tin gần nhất)  → chấm đỏ chuông
          · nwChats where thanhVien ∋ uid (30 phòng)   → chấm đỏ tab TIN NHẮN
   ============================================================ */
(function () {
  'use strict';
  var NW = window.NW, CFG = NW.CFG, $ = NW.$, $$ = NW.$$, IC = NW.IC, an = NW.chuAnToan;

  var TABS = [
    { ma: 'baiTap', chu: 'TRANG BÀI TẬP', ic: IC.baiTap, href: CFG.LINK_BAI_TAP, ngoai: true },
    { ma: 'bangTin', chu: 'BẢNG TIN', ic: IC.bangTin, href: 'bangtin.html' },
    { ma: 'tinNhan', chu: 'TIN NHẮN', ic: IC.tinNhan, href: 'tinnhan.html' },
    { ma: 'khamPha', chu: 'KHÁM PHÁ', ic: IC.khamPha, href: 'khampha.html' },
    { ma: 'caNhan', chu: 'CÁ NHÂN', ic: IC.caNhan, href: 'canhan.html' }
  ];

  var TB_DS = [];            // thông báo đang có
  var PHONG_DS = [];         // phòng chat đang có (xếp mới → cũ)
  var ngheTB = [], nghePhong = [];
  NW.ngheThongBao = function (cb) { ngheTB.push(cb); cb(TB_DS); return function () { ngheTB = ngheTB.filter(function (x) { return x !== cb; }); }; };
  NW.nghePhong = function (cb) { nghePhong.push(cb); cb(PHONG_DS); return function () { nghePhong = nghePhong.filter(function (x) { return x !== cb; }); }; };

  function soChuaDoc(ds) { return ds.filter(function (t) { return !t.daDoc; }).length; }
  function soPhongChua(ds) {
    var toi = NW.toi ? NW.toi.uid : '';
    return ds.filter(function (p) {
      var tc = p.tinCuoi || {};
      return tc.luc && tc.uid !== toi && tc.luc > ((p.docLuc || {})[toi] || 0);
    }).length;
  }
  NW.soPhongChua = soPhongChua;

  function veThanh(tab) {
    var hop = $('#nwThanh');
    if (!hop) { hop = document.createElement('header'); hop.id = 'nwThanh'; document.body.insertBefore(hop, document.body.firstChild); }
    hop.className = 'thanh';
    hop.innerHTML = '<div class="thanh-in">' +
      '<a class="logo" href="bangtin.html"><img src="assets/avatar-tron.jpg" alt=""><b>Andrew Classes</b></a>' +
      '<nav class="tabs">' + TABS.map(function (t) {
        return '<a class="tab' + (t.ma === tab ? ' chon' : '') + '" data-tab="' + t.ma + '" href="' + an(t.href) + '"' +
          (t.ngoai ? '' : '') + '>' + t.ic + '<span class="chu">' + t.chu + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="phai">' +
        '<button class="nut-tron" id="nutChuong" title="Thông báo" aria-label="Thông báo">' + IC.chuong + '</button>' +
        '<button class="nut-tron nut-av" id="nutAv" title="Menu của em" aria-label="Menu">' + NW.avHtml(NW.toi) + '</button>' +
      '</div></div>';
    $('#nutChuong').onclick = moChuong;
    $('#nutAv').onclick = moMenuAv;
  }

  function datCham(nut, so) {
    if (!nut) return;
    var c = nut.querySelector('.cham');
    if (!so) { if (c) c.remove(); return; }
    if (!c) { c = document.createElement('span'); c.className = 'cham'; nut.appendChild(c); }
    c.textContent = so > 99 ? '99+' : String(so);
  }
  function capNhatCham() {
    datCham($('#nutChuong'), soChuaDoc(TB_DS));
    datCham($('.tab[data-tab="tinNhan"]'), soPhongChua(PHONG_DS));
  }

  // ---------- chuông ----------
  var _thaMo = null;
  function dongTha() { if (_thaMo) { _thaMo.tha.remove(); _thaMo.phu.remove(); _thaMo = null; } }
  function moTha(html) {
    dongTha();
    var tha = document.createElement('div'); tha.className = 'tha'; tha.innerHTML = html;
    var phu = document.createElement('div'); phu.className = 'phu'; phu.onclick = dongTha;
    document.body.appendChild(phu); document.body.appendChild(tha);
    requestAnimationFrame(function () { tha.classList.add('mo'); });
    _thaMo = { tha: tha, phu: phu };
    return tha;
  }
  var CHU_LOAI = { camXuc: 'đã thả cảm xúc vào bài của em', binhLuan: 'đã bình luận vào bài của em', chiaSe: 'đã chia sẻ bài của em',
                   ketBan: 'muốn kết bạn với em', dongY: 'đã đồng ý kết bạn', nhac: 'đã nhắc tới em', nhom: 'đã thêm em vào nhóm', chung: '' };
  function moChuong() {
    var ds = TB_DS;
    var html = '<div class="tha-head"><span>Thông báo</span>' +
      (soChuaDoc(ds) ? '<button class="tiny" id="tbDocHet" style="color:var(--accent)">Đánh dấu đã đọc</button>' : '') + '</div><div class="tha-ds">' +
      (ds.length ? ds.map(function (t) {
        return '<button class="tha-muc' + (t.daDoc ? '' : ' chua') + '" data-id="' + an(t.id) + '">' +
          NW.avHtml({ ten: t.tuTen, anh: t.tuAnh }, 'nho') +
          '<span class="chu"><b>' + an(t.tuTen) + '</b> ' + an(CHU_LOAI[t.loai] || t.loai) +
          (t.chu ? '<small>' + an(t.chu) + '</small>' : '') + '<small>' + an(NW.chuGio(t.luc)) + '</small></span></button>';
      }).join('') : '<div class="tha-trong">Chưa có thông báo nào.</div>') + '</div>';
    var tha = moTha(html);
    $$('.tha-muc', tha).forEach(function (b) {
      b.onclick = function () {
        var t = ds.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
        dongTha();
        if (!t) return;
        if (!t.daDoc) danhDauDoc([t.id]);
        if (t.link) location.href = t.link;
      };
    });
    var het = $('#tbDocHet', tha);
    if (het) het.onclick = function () { danhDauDoc(ds.filter(function (t) { return !t.daDoc; }).map(function (t) { return t.id; })); dongTha(); };
  }
  async function danhDauDoc(ids) {
    if (!ids.length || NW.laBanThu()) return;
    var f = await NW.fb();
    var b = f.fs.writeBatch(f.db);
    ids.forEach(function (id) { b.update(f.fs.doc(f.db, 'nwUsers', NW.toi.uid, 'thongBao', id), { daDoc: true }); });
    try { await b.commit(); } catch (e) { console.warn(e); }
  }

  // ---------- menu avatar ----------
  function moMenuAv() {
    var items = [
      { ic: IC.caNhan, chu: 'Trang cá nhân của em', onclick: function () { location.href = 'canhan.html'; } },
      { ic: IC.khoa, chu: 'Đổi mật khẩu', onclick: moDoiMk }
    ];
    if (NW.toi && NW.toi.laThay) items.push({ ic: IC.caiDat, chu: 'Trang quản lý', onclick: function () { location.href = 'quanly.html'; } });
    items.push({ ic: IC.thoat, chu: 'Đăng xuất', nguy: true, onclick: function () {
      NW.thoat().then(function () { location.replace('index.html?vao=1'); });
    } });
    NW.menuNho($('#nutAv'), items);
  }
  function moDoiMk() {
    var p = NW.popMo({ tieuDe: 'Đổi mật khẩu', html:
      '<label class="lbl">Mật khẩu hiện tại</label><input type="password" id="mkCu" autocomplete="current-password">' +
      '<label class="lbl" style="margin-top:12px">Mật khẩu mới (ít nhất 6 ký tự)</label><input type="password" id="mkMoi" autocomplete="new-password">' +
      '<label class="lbl" style="margin-top:12px">Gõ lại mật khẩu mới</label><input type="password" id="mkMoi2" autocomplete="new-password">' +
      '<p class="tiny" id="mkLoi" style="color:var(--do);margin:10px 0 0" hidden></p>',
      chan: '<button class="btn soft" data-dong>Thôi</button><button class="btn primary" id="mkOk">Đổi mật khẩu</button>' });
    $('[data-dong]', p).onclick = NW.popDong;
    $('#mkOk', p).onclick = async function () {
      var cu = $('#mkCu', p).value, moi = $('#mkMoi', p).value, moi2 = $('#mkMoi2', p).value, loi = $('#mkLoi', p);
      loi.hidden = true;
      if (moi.length < 6) { loi.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.'; loi.hidden = false; return; }
      if (moi !== moi2) { loi.textContent = 'Hai lần gõ mật khẩu mới chưa giống nhau.'; loi.hidden = false; return; }
      this.disabled = true;
      try { await NW.doiMatKhau(cu, moi); NW.popDong(); NW.toast('Đã đổi mật khẩu.'); }
      catch (e) { loi.textContent = NW.chuLoiAuth(e); loi.hidden = false; this.disabled = false; }
    };
  }

  // ---------- kênh nghe ----------
  async function moKenh() {
    if (NW.laBanThu()) return;
    var f = await NW.fb();
    var uid = NW.toi.uid;
    f.fs.onSnapshot(
      f.fs.query(f.fs.collection(f.db, 'nwUsers', uid, 'thongBao'), f.fs.orderBy('luc', 'desc'), f.fs.limit(20)),
      function (snap) {
        var ds = []; snap.forEach(function (d) { ds.push(Object.assign({ id: d.id }, d.data())); });
        TB_DS = ds; capNhatCham(); ngheTB.forEach(function (cb) { cb(ds); });
      }, function (e) { console.warn('[nw] thông báo', e); });
    f.fs.onSnapshot(
      f.fs.query(f.fs.collection(f.db, 'nwChats'), f.fs.where('thanhVien', 'array-contains', uid), f.fs.orderBy('capNhat', 'desc'), f.fs.limit(30)),
      function (snap) {
        var ds = []; snap.forEach(function (d) { ds.push(Object.assign({ id: d.id }, d.data())); });
        PHONG_DS = ds; capNhatCham(); nghePhong.forEach(function (cb) { cb(ds); });
      }, function (e) {
        console.warn('[nw] phòng chat', e);
        if (String(e && e.message).indexOf('index') >= 0) NW.toast('Kho thiếu chỉ mục cho tin nhắn — thầy xem tai-lieu/CHI MUC FIRESTORE.md', true);
      });
  }

  function manBao(tieuDe, chu, nut) {
    document.body.innerHTML = '<div class="login-bg"></div><div class="login-wrap"><div class="card login-card">' +
      '<div class="brand"><img src="assets/avatar-tron.jpg" alt=""><h1>Andrew Classes<small>NETWORK</small></h1></div>' +
      '<h2 style="margin:0 0 8px;font-size:17px">' + an(tieuDe) + '</h2><p class="tiny" style="text-align:left;margin:0 0 16px">' + an(chu) + '</p>' +
      (nut || '<a class="btn primary wide" href="index.html?vao=1">Về màn đăng nhập</a>') + '</div></div>';
  }

  // Dữ liệu giả cho bàn thử `?thu=1` (chỉ localhost).
  function toiBanThu() {
    return { uid: 'hs_0', ten: 'BẠN THỬ', lop: 'A1C', cacLop: ['A1C'], vaiTro: 'hs', anh: '', bia: '', gioiThieu: 'Tài khoản bàn thử', laThay: false, phaiDoiMk: false, khoa: false };
  }

  NW.dungThanh = async function (o) {
    o = o || {};
    if (NW.laBanThu()) { NW.toi = toiBanThu(); veThanh(o.tab); return { user: null, hoSo: NW.toi, laThay: false, banThu: true }; }
    var ph = await NW.phien();
    if (!ph) { location.replace('index.html'); return new Promise(function () { }); }
    if (ph.thieuHoSo) {
      manBao('Tài khoản chưa có hồ sơ', 'Tài khoản này đã đăng nhập được nhưng chưa có hồ sơ trên mạng. Thầy Andrew cần chạy công cụ tạo tài khoản (tools/tao-tai-khoan.mjs) rồi em vào lại nhé.');
      return new Promise(function () { });
    }
    if (ph.hoSo.khoa && !ph.laThay) {
      manBao('Tài khoản đang bị khoá', 'Thầy Andrew đã tạm khoá tài khoản này. Em gặp thầy để được mở lại nhé.');
      return new Promise(function () { });
    }
    if (ph.hoSo.phaiDoiMk && !ph.laThay) { location.replace('index.html#doimk'); return new Promise(function () { }); }
    veThanh(o.tab);
    moKenh();
    return ph;
  };
})();
