/* ============================================================
   loi.js — LÕI DÙNG CHUNG của myNetwork (v0.1.0)

   Mọi trang nạp file này SAU config.js. Cung cấp `window.NW`:
     · Firebase (app · Auth · Firestore · Storage) nạp LƯỜI từ CDN, MỘT app duy nhất
       (bẫy duplicate-app đã cắn myLesson v1.17.0 — ai đến trước tạo app, ai đến sau dùng chung)
     · Đăng nhập học sinh = My ID + mật khẩu (Firebase Auth email/password, email GIẢ = băm mã)
     · Đăng nhập thầy = Google (namdaptrai01@gmail.com), khớp laThay() trong luật
     · Hồ sơ người dùng `nwUsers/{uid}` + bộ đệm (đọc Firestore là TIỀN — luật 8 của cụm)
     · Tiện ích: chuAnToan · chuTat · itMau · avatar · giờ · toast · pop-up · menu nhỏ
     · Nén ảnh JPEG trước khi tải lên Storage (nếp "nén media trước khi lưu")
     · Từ cấm · thông báo

   QUY ƯỚC MÃ SỐ:
     uid học sinh = 'hs_' + mã số myStudent (không đổi kể cả đổi tên/chuyển lớp — bài học
     "neo tài nguyên vào TÊN" 02/09/2026). Email Auth = sha256(mã đăng nhập)[0..24] + DUOI_EMAIL.
     Mật khẩu ban đầu = chính mã đăng nhập (đúng mức tin cậy myLesson đang có) và cờ
     `phaiDoiMk:true` bắt em tự đặt mật khẩu riêng ngay lần đầu vào.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.NW_CONFIG || {};
  var SDK = 'https://www.gstatic.com/firebasejs/12.9.0';
  var NW = window.NW = window.NW || {};
  NW.CFG = CFG;

  // ---------- tiện ích DOM / chuỗi ----------
  var $ = function (s, g) { return (g || document).querySelector(s); };
  var $$ = function (s, g) { return Array.prototype.slice.call((g || document).querySelectorAll(s)); };
  NW.$ = $; NW.$$ = $$;

  function chuAnToan(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Bỏ khoảng trắng + viết hoa — PHẢI giống `chuanMa` bên myLesson và `chuan_hoa_ma()` myStudent.
  function chuanMa(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
  // Tên thường: bỏ dấu + thường hoá, để tìm kiếm "khong dau".
  function khongDau(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  }
  var MAU_BONG = ['#0E7C6E', '#B3541E', '#5B8DEF', '#8CC63F', '#E36B5C', '#9C6ADE', '#F2A93B'];
  function chuTat(ten) {
    var tu = String(ten || '').trim().split(/\s+/).filter(Boolean);
    if (!tu.length) return '?';
    if (tu.length === 1) return tu[0].slice(0, 2).toUpperCase();
    return (tu[tu.length - 2].charAt(0) + tu[tu.length - 1].charAt(0)).toUpperCase();
  }
  function itMau(ten) {
    var s = 0, t = String(ten || '');
    for (var i = 0; i < t.length; i++) s += t.charCodeAt(i);
    return MAU_BONG[s % MAU_BONG.length];
  }
  // HTML một avatar: nền màu + chữ tắt, ảnh đè lên khi tải xong (ảnh hỏng thì tự gỡ).
  function avHtml(nguoi, lop) {
    nguoi = nguoi || {};
    var ten = nguoi.ten || '?';
    var gv = nguoi.vaiTro === 'gv' ? ' gv' : '';
    return '<span class="av' + (lop ? ' ' + lop : '') + gv + '" style="background:' + itMau(ten) + '" title="' + chuAnToan(ten) + '">' +
      chuAnToan(chuTat(ten)) +
      (nguoi.anh ? '<img src="' + chuAnToan(nguoi.anh) + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
      '</span>';
  }
  NW.chuAnToan = chuAnToan; NW.chuanMa = chuanMa; NW.khongDau = khongDau;
  NW.chuTat = chuTat; NW.itMau = itMau; NW.avHtml = avHtml;

  // "vừa xong" / "5 phút" / "Hôm nay 16:02" / "Hôm qua 20:15" / "18/8 20:15" / "18/8/2025"
  function chuGio(ms, kieu) {
    ms = Number(ms) || 0;
    if (!ms) return '';
    var d = new Date(ms), nay = new Date();
    var hai = function (n) { return (n < 10 ? '0' : '') + n; };
    var gio = d.getHours() + ':' + hai(d.getMinutes());
    var lech = nay - d;
    if (kieu !== 'day' && lech >= 0 && lech < 60 * 1000) return 'vừa xong';
    if (kieu !== 'day' && lech >= 0 && lech < 3600 * 1000) return Math.floor(lech / 60000) + ' phút';
    var cung = function (a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
    if (cung(d, nay)) return (kieu === 'day' ? 'Hôm nay ' : '') + gio;
    var homQua = new Date(nay.getFullYear(), nay.getMonth(), nay.getDate() - 1);
    if (cung(d, homQua)) return 'Hôm qua ' + gio;
    var s = d.getDate() + '/' + (d.getMonth() + 1);
    if (d.getFullYear() !== nay.getFullYear()) s += '/' + d.getFullYear();
    return s + ' ' + gio;
  }
  function chuNgay(ms) {
    var d = new Date(Number(ms) || 0), nay = new Date();
    var cung = function (a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
    if (cung(d, nay)) return 'Hôm nay';
    var homQua = new Date(nay.getFullYear(), nay.getMonth(), nay.getDate() - 1);
    if (cung(d, homQua)) return 'Hôm qua';
    return d.getDate() + '/' + (d.getMonth() + 1) + (d.getFullYear() !== nay.getFullYear() ? '/' + d.getFullYear() : '');
  }
  NW.chuGio = chuGio; NW.chuNgay = chuNgay;

  // Chữ có link: biến http(s)://… thành thẻ <a> (sau khi đã escape).
  function chuCoLink(s) {
    return chuAnToan(s).replace(/(https?:\/\/[^\s<]+)/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>';
    });
  }
  NW.chuCoLink = chuCoLink;

  // ---------- ICON (Lucide-style, stroke) ----------
  var P = function (d) { return '<svg class="ic" viewBox="0 0 24 24">' + d + '</svg>'; };
  NW.IC = {
    baiTap: P('<path d="M2.5 4h5.5a3.5 3.5 0 0 1 3.5 3.5V20a2.5 2.5 0 0 0-2.5-2.5h-6.5z"/><path d="M21.5 4H16a3.5 3.5 0 0 0-3.5 3.5V20a2.5 2.5 0 0 1 2.5-2.5h6.5z"/>'),  // v0.4.0 sách mở
    bangTin: P('<path d="M3 10.8 12 3.5l9 7.3"/><path d="M5.5 9.3V20.5h13V9.3"/><path d="M10 20.5v-5.5h4v5.5"/>'),  // v0.4.0 ngôi nhà (bảng tin)
    tinNhan: P('<path d="M12.5 2.5a8.5 8.5 0 1 1-4.6 15.6L3 21.5l1.6-5.2A8.5 8.5 0 0 1 12.5 2.5z"/><circle cx="8.8" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="12.5" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="16.2" cy="11" r="1.2" fill="currentColor" stroke="none"/>'),  // v0.3.1 theo mẫu Flaticon thầy gửi
    khamPha: P('<circle cx="12" cy="12" r="9.5"/><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4z"/>'),
    caNhan: P('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    chuong: P('<path d="M6.2 8.5a5.8 5.8 0 0 1 11.6 0c0 6.5 2.7 8.3 2.7 8.3H3.5s2.7-1.8 2.7-8.3"/><path d="M10.4 20.5a1.8 1.8 0 0 0 3.2 0"/>'),
    tim: P('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>'),
    binhLuan: P('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    chiaSe: P('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>'),
    anh: P('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
    gui: P('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
    baCham: P('<circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="12" r="1.6"/>'),
    xoa: P('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    sua: P('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>'),
    an: P('<path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a20 20 0 0 1 5.1-6"/><path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a20 20 0 0 1-2.2 3.2"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><line x1="1" y1="1" x2="23" y2="23"/>'),
    hien: P('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    baoCao: P('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
    timKiem: P('<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.6-4.6"/>'),
    them: P('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    lui: P('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'),
    dong: P('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    khoa: P('<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>'),
    nhom: P('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
    thoat: P('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
    ghim: P('<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.8a1 1 0 0 0-.4-.8L16 12V6h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v6l-2.6 2.4a1 1 0 0 0-.4.8z"/>'),
    tick: P('<polyline points="20 6 9 17 4 12"/>'),
    camera: P('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    lopHoc: P('<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/>'),
    theGioi: P('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
    link: P('<path d="M10 13.5a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 0 0-6.4-6.4L11.5 6"/><path d="M14 10.5a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 0 0 6.4 6.4L12.5 18"/>'),
    dongHo: P('<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.2 2"/>'),
    caiDat: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    ketBan: P('<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>'),
    menu3: P('<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>'),
    sao: P('<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>'),
    tinMoi: P('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>')
  };

  // Cảm xúc — cùng bộ với chat lớp bên myLesson (lop.html CAM_XUC)
  // `ky` = chữ emoji dự phòng (dùng trong CHỮ thông báo); HÌNH hiện trên trang là huy hiệu SVG (NW.cxHtml) —
  // v0.2.0 thầy chốt 22/09: bỏ emoji hệ thống (mỗi máy vẽ một kiểu), dùng bộ vẽ tay giống nhau mọi máy.
  // v0.3.0 (thầy chốt 22/09): 7 cảm xúc ĐÚNG THỨ TỰ Facebook — Thích · Yêu thích · Cười (ra nước mắt) · Haha · Oa · Buồn · Phẫn nộ.
  // (bộ 6 cũ có "gà con" đã bỏ; chưa có dữ liệu thật nên không phải chuyển đổi)
  NW.CAM_XUC = [
    { ma: 'like', ky: '👍', nh: 'Thích' }, { ma: 'tim', ky: '❤️', nh: 'Yêu thích' }, { ma: 'cuoi', ky: '😂', nh: 'Cười' },
    { ma: 'haha', ky: '😆', nh: 'Haha' }, { ma: 'ngac', ky: '😮', nh: 'Oa' }, { ma: 'khoc', ky: '😢', nh: 'Buồn' }, { ma: 'gian', ky: '😡', nh: 'Phẫn nộ' }
  ];
  NW.tenCamXuc = function (ma) {
    for (var i = 0; i < NW.CAM_XUC.length; i++) if (NW.CAM_XUC[i].ma === ma) return NW.CAM_XUC[i].nh;
    return '';
  };
  // Một huy hiệu cảm xúc: <svg class="cx [lop]"><use href="#cx-<mã>"></svg> — hình nằm trong sprite napCamXuc().
  NW.cxHtml = function (ma, lop) {
    var co = NW.CAM_XUC.some(function (c) { return c.ma === ma; });
    if (!co) return '';
    return '<svg class="cx' + (lop ? ' ' + lop : '') + '" aria-label="' + chuAnToan(NW.tenCamXuc(ma)) + '"><use href="#cx-' + ma + '"/></svg>';
  };
  // Sprite 7 huy hiệu Facebook vẽ 2D phẳng (thầy chốt 22/09: 2D, không bóng khối) — chèn MỘT lần vào đầu <body>.
  NW.napCamXuc = function () {
    if (document.getElementById('nwCxSprite')) return;
    var TIM = 'M16 27.2S4.6 20.2 4.6 12.6c0-3.6 2.8-6.3 6.2-6.3 2.2 0 4.1 1.2 5.2 3 1.1-1.8 3-3 5.2-3 3.4 0 6.2 2.7 6.2 6.3 0 7.6-11.4 14.6-11.4 14.6z';
    var html = '<svg id="nwCxSprite" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      '<linearGradient id="gLike" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D94FF"/><stop offset="1" stop-color="#1467D8"/></linearGradient>' +
      '<linearGradient id="gTim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6B84"/><stop offset="1" stop-color="#E5203F"/></linearGradient>' +
      '<linearGradient id="gVang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE178"/><stop offset="1" stop-color="#F5B21D"/></linearGradient>' +
      '<linearGradient id="gGian" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFA24A"/><stop offset="1" stop-color="#E8432A"/></linearGradient></defs>' +
      '<symbol id="cx-like" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gLike)"/>' +
        '<g transform="translate(16 16) scale(.72) translate(-16 -16)" fill="#fff"><path d="M5 14.5h4.2v12H5a1.6 1.6 0 0 1-1.6-1.6v-8.8A1.6 1.6 0 0 1 5 14.5z"/>' +
        '<path d="M10.4 26.5V14.7l4.6-8.6c.5-1 1.6-1.4 2.6-1 1.3.5 2 1.9 1.7 3.3l-1 4.6h6.8c1.6 0 2.7 1.4 2.3 2.9l-2.1 8.3c-.3 1.3-1.4 2.3-2.8 2.3z"/></g></symbol>' +
      '<symbol id="cx-tim" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gTim)"/><path transform="translate(16 16) scale(.74) translate(-16 -16)" fill="#fff" d="' + TIM + '"/></symbol>' +
      '<symbol id="cx-cuoi" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gVang)"/>' +
        '<path d="M8.2 13.2q3-3.6 6 0M17.8 13.2q3-3.6 6 0" fill="none" stroke="#5B3A0A" stroke-width="2.1" stroke-linecap="round"/>' +
        '<path d="M7.6 17.6h16.8c0 5.4-3.8 8.8-8.4 8.8s-8.4-3.4-8.4-8.8z" fill="#5B3A0A"/><path d="M9.2 18.4h13.6v1.1q0 1-1 1H10.2q-1 0-1-1z" fill="#fff"/>' +
        '<ellipse cx="16" cy="24.2" rx="4.2" ry="2.1" fill="#F0284A"/>' +
        '<path d="M5.2 13.2c0 0-2.6 3.4-2.6 5.2a2.6 2.6 0 0 0 5.2 0c0-1.8-2.6-5.2-2.6-5.2z" fill="#4A90F5"/><path d="M26.8 13.2c0 0-2.6 3.4-2.6 5.2a2.6 2.6 0 0 0 5.2 0c0-1.8-2.6-5.2-2.6-5.2z" fill="#4A90F5"/></symbol>' +
      '<symbol id="cx-haha" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gVang)"/>' +
        '<path d="M7.5 12.2q3.2-3.4 6.4 0M18.1 12.2q3.2-3.4 6.4 0" fill="none" stroke="#5B3A0A" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M7.2 17.2h17.6c0 5.6-3.9 9.1-8.8 9.1s-8.8-3.5-8.8-9.1z" fill="#5B3A0A"/><ellipse cx="16" cy="24" rx="4.6" ry="2.4" fill="#F0284A"/></symbol>' +
      '<symbol id="cx-ngac" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gVang)"/>' +
        '<path d="M7.6 9.4q3.2-2.6 6.4-.2M18 9.2q3.2-2.4 6.4.2" fill="none" stroke="#5B3A0A" stroke-width="1.9" stroke-linecap="round"/>' +
        '<ellipse cx="10.9" cy="14.2" rx="2.1" ry="2.9" fill="#5B3A0A"/><ellipse cx="21.1" cy="14.2" rx="2.1" ry="2.9" fill="#5B3A0A"/><ellipse cx="16" cy="23.2" rx="3.6" ry="4.6" fill="#5B3A0A"/></symbol>' +
      '<symbol id="cx-khoc" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gVang)"/>' +
        '<path d="M7 11.6q3.6-2.8 7-1.2M18 10.4q3.4-1.6 7 1.2" fill="none" stroke="#5B3A0A" stroke-width="1.9" stroke-linecap="round"/>' +
        '<ellipse cx="11.2" cy="15.6" rx="1.9" ry="2.5" fill="#5B3A0A"/><ellipse cx="20.8" cy="15.6" rx="1.9" ry="2.5" fill="#5B3A0A"/>' +
        '<path d="M11 24.6q5-4.2 10 0" fill="none" stroke="#5B3A0A" stroke-width="2.1" stroke-linecap="round"/>' +
        '<path d="M24.6 17.4c0 0-3.2 4.3-3.2 6.4a3.2 3.2 0 0 0 6.4 0c0-2.1-3.2-6.4-3.2-6.4z" fill="#4A90F5"/></symbol>' +
      '<symbol id="cx-gian" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(#gGian)"/>' +
        '<path d="M7.4 11.8l6.2 2.6M24.6 11.8l-6.2 2.6" fill="none" stroke="#4A1E0A" stroke-width="2.2" stroke-linecap="round"/>' +
        '<ellipse cx="11.4" cy="16.6" rx="1.7" ry="2" fill="#4A1E0A"/><ellipse cx="20.6" cy="16.6" rx="1.7" ry="2" fill="#4A1E0A"/>' +
        '<path d="M10.8 24.2q5.2-2.6 10.4 0" fill="none" stroke="#4A1E0A" stroke-width="2.2" stroke-linecap="round"/></symbol>' +
      '</svg>';
    var hop = document.createElement('div'); hop.innerHTML = html;
    document.body.insertBefore(hop.firstChild, document.body.firstChild);
  };
  if (document.body) NW.napCamXuc(); else document.addEventListener('DOMContentLoaded', NW.napCamXuc);
  NW.kyCamXuc = function (ma) {
    for (var i = 0; i < NW.CAM_XUC.length; i++) if (NW.CAM_XUC[i].ma === ma) return NW.CAM_XUC[i].ky;
    return '';
  };

  // ---------- Firebase (nạp lười, một app) ----------
  var _fb = null;
  function fb() {
    if (!_fb) {
      _fb = (async function () {
        var appMod = await import(SDK + '/firebase-app.js');
        var au = await import(SDK + '/firebase-auth.js');
        var fs = await import(SDK + '/firebase-firestore.js');
        var app = (appMod.getApps && appMod.getApps().length) ? appMod.getApp() : appMod.initializeApp(CFG.FIREBASE);
        var auth = au.getAuth(app);
        try { await au.setPersistence(auth, au.browserLocalPersistence); } catch (e) { }
        return { app: app, appMod: appMod, au: au, auth: auth, fs: fs, db: fs.getFirestore(app) };
      })();
    }
    return _fb;
  }
  var _st = null;
  function storage() {
    if (!_st) {
      _st = fb().then(async function (f) {
        var stMod = await import(SDK + '/firebase-storage.js');
        return { st: stMod.getStorage(f.app), stMod: stMod };
      });
    }
    return _st;
  }
  NW.fb = fb; NW.storage = storage;

  // ---------- băm mã → email giả ----------
  async function sha256Hex(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  async function emailTuMa(ma) {
    var h = await sha256Hex(chuanMa(ma));
    return h.slice(0, 24) + CFG.DUOI_EMAIL;      // PHẢI khớp tools/tao-tai-khoan.mjs
  }
  NW.sha256Hex = sha256Hex; NW.emailTuMa = emailTuMa;

  // ---------- phiên ----------
  NW.toi = null;          // hồ sơ người đang đăng nhập (nwUsers/{uid} + laThay)
  var _phienP = null;

  function laThayUser(u) {
    if (!u) return false;
    if (u.uid === 'thay') return true;
    return !!(u.email && u.email === CFG.EMAIL_THAY && u.emailVerified);
  }

  // Đợi Firebase khôi phục phiên rồi mới trả (không nháy "chưa đăng nhập" lúc mở trang).
  function userHienTai() {
    return fb().then(function (f) {
      if (f.auth.currentUser) return f.auth.currentUser;
      return new Promise(function (res) {
        var stop = f.au.onAuthStateChanged(f.auth, function (u) { stop(); res(u || null); });
      });
    });
  }

  // Trả {user, hoSo} hoặc null. Hồ sơ đọc 1 lần từ Firestore rồi giữ trong RAM +
  // sessionStorage (đổi avatar/tên thì các hàm ghi tự cập nhật bản đệm).
  function phien(epMoi) {
    if (_phienP && !epMoi) return _phienP;
    _phienP = (async function () {
      var f = await fb();
      var u = await userHienTai();
      if (!u) { NW.toi = null; return null; }
      var laThay = laThayUser(u);
      var hs = null;
      try {
        var snap = await f.fs.getDoc(f.fs.doc(f.db, 'nwUsers', u.uid));
        if (snap.exists()) hs = snap.data();
      } catch (e) { console.warn('[nw] đọc hồ sơ lỗi', e); }
      if (!hs && laThay) {
        // Thầy vào lần đầu: tự tạo hồ sơ (luật cho phép vì laThay()).
        hs = { uid: u.uid, ten: 'Thầy Andrew', tenThuong: 'thay andrew', lop: 'GV', cacLop: [],
               vaiTro: 'gv', anh: '', bia: '', gioiThieu: '', phaiDoiMk: false, khoa: false,
               luc: Date.now(), capNhat: Date.now() };
        try { await f.fs.setDoc(f.fs.doc(f.db, 'nwUsers', u.uid), hs); }
        catch (e) { console.warn('[nw] tạo hồ sơ thầy lỗi', e); }
      }
      if (!hs) {
        // Có tài khoản Auth nhưng chưa có hồ sơ (chưa chạy tools/tao-tai-khoan.mjs đủ) — coi như chưa vào.
        NW.toi = null;
        return { user: u, hoSo: null, laThay: laThay, thieuHoSo: true };
      }
      NW.toi = Object.assign({}, hs, { uid: u.uid, laThay: laThay || hs.vaiTro === 'gv', user: u });
      return { user: u, hoSo: hs, laThay: NW.toi.laThay };
    })();
    return _phienP;
  }
  NW.phien = phien;

  // Học sinh: My ID + mật khẩu.
  async function dangNhap(ma, mk) {
    var f = await fb();
    var email = await emailTuMa(ma);
    var r = await f.au.signInWithEmailAndPassword(f.auth, email, mk);
    _phienP = null;
    return r.user;
  }
  // Thầy: Google.
  async function dangNhapThay() {
    var f = await fb();
    var p = new f.au.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    var r = await f.au.signInWithPopup(f.auth, p);
    if (!laThayUser(r.user)) {
      var email = (r.user && r.user.email) || '?';
      await f.au.signOut(f.auth);
      throw new Error('Tài khoản ' + email + ' không phải của thầy.');
    }
    _phienP = null;
    return r.user;
  }
  async function datMatKhau(mkMoi) {
    var f = await fb();
    var u = f.auth.currentUser;
    if (!u) throw new Error('Chưa đăng nhập');
    await f.au.updatePassword(u, mkMoi);
    try { await f.fs.updateDoc(f.fs.doc(f.db, 'nwUsers', u.uid), { phaiDoiMk: false, capNhat: Date.now() }); } catch (e) { }
    if (NW.toi) NW.toi.phaiDoiMk = false;
  }
  // Đổi mật khẩu khi đã biết mật khẩu cũ (menu avatar).
  async function doiMatKhau(mkCu, mkMoi) {
    var f = await fb();
    var u = f.auth.currentUser;
    if (!u) throw new Error('Chưa đăng nhập');
    var cred = f.au.EmailAuthProvider.credential(u.email, mkCu);
    await f.au.reauthenticateWithCredential(u, cred);
    await f.au.updatePassword(u, mkMoi);
  }
  async function thoat() {
    var f = await fb();
    await f.au.signOut(f.auth);
    _phienP = null; NW.toi = null;
    try { sessionStorage.clear(); } catch (e) { }
  }
  NW.dangNhap = dangNhap; NW.dangNhapThay = dangNhapThay; NW.datMatKhau = datMatKhau;
  NW.doiMatKhau = doiMatKhau; NW.thoat = thoat;

  // Lời báo lỗi Auth cho học sinh đọc được.
  NW.chuLoiAuth = function (e) {
    var ma = String((e && (e.code || e.message)) || '');
    if (/user-not-found|invalid-credential|wrong-password|invalid-login-credentials/.test(ma))
      return 'Mã hoặc mật khẩu chưa đúng. Kiểm tra lại, hoặc hỏi thầy Andrew nhé.';
    if (/too-many-requests/.test(ma)) return 'Thử sai nhiều lần quá — chờ vài phút rồi thử lại.';
    if (/network-request-failed/.test(ma)) return 'Không nối được mạng. Kiểm tra wifi/4G rồi thử lại.';
    if (/weak-password/.test(ma)) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (/requires-recent-login/.test(ma)) return 'Em đăng xuất rồi đăng nhập lại, sau đó đổi mật khẩu nhé.';
    if (/user-disabled/.test(ma)) return 'Tài khoản này đang bị khoá. Hỏi thầy Andrew nhé.';
    return 'Có lỗi: ' + ma;
  };
  NW.chuLoiKho = function (e) {
    var ma = String((e && (e.code || e.message)) || '');
    if (ma.indexOf('permission-denied') >= 0) return 'Kho từ chối (luật Firestore chưa dán hoặc em không có quyền).';
    if (ma.indexOf('failed-precondition') >= 0 && ma.indexOf('index') >= 0) return 'Kho thiếu chỉ mục (index) — thầy xem tai-lieu/CHI MUC FIRESTORE.md.';
    if (ma.indexOf('resource-exhausted') >= 0) return 'Kho tạm hết hạn mức. Thử lại sau nhé.';
    return 'Có lỗi: ' + ma;
  };

  // ---------- hồ sơ người khác (đệm) ----------
  var HS_RAM = {};
  var KHOA_HS = 'nwHoSo:';
  var HS_HAN = 6 * 3600 * 1000;
  async function hoSo(uid, epMoi) {
    if (!uid) return null;
    if (!epMoi && HS_RAM[uid]) return HS_RAM[uid];
    if (!epMoi) {
      try {
        var o = JSON.parse(sessionStorage.getItem(KHOA_HS + uid) || 'null');
        if (o && (Date.now() - o.luc) < HS_HAN) { HS_RAM[uid] = o.hs; return o.hs; }
      } catch (e) { }
    }
    var f = await fb();
    var snap = await f.fs.getDoc(f.fs.doc(f.db, 'nwUsers', uid));
    var hs = snap.exists() ? snap.data() : null;
    if (hs) {
      HS_RAM[uid] = hs;
      try { sessionStorage.setItem(KHOA_HS + uid, JSON.stringify({ luc: Date.now(), hs: hs })); } catch (e) { }
    }
    return hs;
  }
  NW.hoSo = hoSo;
  // Bản rút gọn của một người để NHÚNG vào bài/bình luận/tin (khỏi đọc thêm tài liệu khi hiện).
  NW.tomTat = function (hs) {
    hs = hs || NW.toi || {};
    // v0.4.0 thêm cacLop để lọc bài "Bạn bè" (cùng lớp = bạn) không phải đọc thêm hồ sơ tác giả
    return { uid: hs.uid || '', ten: hs.ten || '?', anh: hs.anh || '', lop: hs.lop || '', vaiTro: hs.vaiTro || 'hs', cacLop: (hs.cacLop || [hs.lop]).filter(Boolean) };
  };

  // ---------- v0.4.0 — PHẠM VI BÀI (thầy chốt 22/09, kiểu Facebook + Chỉ lớp) ----------
  NW.PHAM = [
    { ma: 'mang', ky: '🌐', nh: 'Công khai', mo: 'Cả mạng Andrew Classes đều thấy' },
    { ma: 'ban', ky: '👥', nh: 'Bạn bè', mo: 'Bạn bè và bạn cùng lớp em' },
    { ma: 'lop', ky: '🏫', nh: 'Chỉ lớp', mo: 'Chỉ lớp của em và thầy' },
    { ma: 'minh', ky: '🔒', nh: 'Chỉ mình tôi', mo: 'Chỉ em xem được (nháp, kỷ niệm riêng)' }
  ];
  NW.phamCua = function (ma) { for (var i = 0; i < NW.PHAM.length; i++) if (NW.PHAM[i].ma === ma) return NW.PHAM[i]; return NW.PHAM[0]; };

  // ---------- v0.4.0 — BẠN BÈ: cùng lớp = bạn sẵn · khác lớp phải kết bạn (kho nwBanBe) ----------
  var _banUid = null;
  // Promise<Set uid bạn bè đã đồng ý> — đệm một lần mỗi trang (≤ 300 bạn = 1 truy vấn)
  NW.dsBanUid = function () {
    if (_banUid) return _banUid;
    _banUid = (async function () {
      var set = new Set();
      if (NW.laBanThu()) { set.add('hs_3'); return set; }
      try {
        var f = await NW.fb(); var uid = NW.toi.uid;
        var snap = await f.fs.getDocs(f.fs.query(f.fs.collection(f.db, 'nwBanBe'), f.fs.where('thanhVien', 'array-contains', uid), f.fs.where('trangThai', '==', 'ok'), f.fs.limit(300)));
        snap.forEach(function (d) { var tv = d.data().thanhVien || []; set.add(tv[0] === uid ? tv[1] : tv[0]); });
      } catch (e) { console.warn('[nw] bạn bè', e); }
      return set;
    })();
    return _banUid;
  };
  NW.xoaDemBan = function () { _banUid = null; };
  // Quan hệ của em với một người: minh · thay · cunglop · ban · choToi (em đã mời) · choHo (bạn mời em) · la (người lạ)
  NW.quanHe = async function (hs) {
    var toi = NW.toi;
    if (!hs || hs.uid === toi.uid) return { loai: 'minh' };
    if (hs.vaiTro === 'gv' || toi.laThay) return { loai: 'thay' };
    var lops = toi.cacLop || [toi.lop];
    if ((hs.cacLop || [hs.lop]).some(function (l) { return l && lops.indexOf(l) >= 0; })) return { loai: 'cunglop' };
    var id = toi.uid < hs.uid ? toi.uid + '__' + hs.uid : hs.uid + '__' + toi.uid;
    try {
      var f = await NW.fb();
      var snap = await f.fs.getDoc(f.fs.doc(f.db, 'nwBanBe', id));
      if (!snap.exists()) return { loai: 'la', id: id };
      var x = snap.data();
      if (x.trangThai === 'ok') return { loai: 'ban', id: id };
      return { loai: x.tu === toi.uid ? 'choToi' : 'choHo', id: id };
    } catch (e) { console.warn('[nw] quan hệ', e); return { loai: 'la', id: id }; }
  };
  // Sao chép link (chia sẻ trang cá nhân) — có dự phòng cho máy không cho clipboard
  NW.chepLink = function (url) {
    var xong = function () { NW.toast('Đã sao chép link — dán gửi cho bạn là được.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(xong, function () { window.prompt('Sao chép link này:', url); });
    else window.prompt('Sao chép link này:', url);
  };

  // Danh sách người theo lớp — 1 lượt đọc mỗi tài liệu (lớp ~20 em) + đệm 10 phút.
  var DS_LOP = {};
  async function nguoiTheoLop(lop) {
    var khoa = 'nwLop:' + lop;
    try {
      var o = JSON.parse(sessionStorage.getItem(khoa) || 'null');
      if (o && (Date.now() - o.luc) < 10 * 60 * 1000) return o.ds;
    } catch (e) { }
    var f = await fb();
    var q = f.fs.query(f.fs.collection(f.db, 'nwUsers'), f.fs.where('cacLop', 'array-contains', lop), f.fs.limit(60));
    var snap = await f.fs.getDocs(q);
    var ds = [];
    snap.forEach(function (d) { var x = d.data(); ds.push({ uid: d.id, ten: x.ten, anh: x.anh || '', lop: x.lop, cacLop: x.cacLop || [], vaiTro: x.vaiTro }); });
    ds.sort(function (a, b) { return khongDau(a.ten).localeCompare(khongDau(b.ten)); });
    try { sessionStorage.setItem(khoa, JSON.stringify({ luc: Date.now(), ds: ds })); } catch (e) { }
    ds.forEach(function (n) { if (!HS_RAM[n.uid]) HS_RAM[n.uid] = n; });
    return ds;
  }
  NW.nguoiTheoLop = nguoiTheoLop;

  // Thầy (những tài khoản vaiTro 'gv') — để học sinh nhắn cho thầy.
  async function dsThay() {
    try {
      var o = JSON.parse(sessionStorage.getItem('nwThay') || 'null');
      if (o && (Date.now() - o.luc) < 30 * 60 * 1000) return o.ds;
    } catch (e) { }
    var f = await fb();
    var q = f.fs.query(f.fs.collection(f.db, 'nwUsers'), f.fs.where('vaiTro', '==', 'gv'), f.fs.limit(5));
    var snap = await f.fs.getDocs(q);
    var ds = [];
    snap.forEach(function (d) { var x = d.data(); ds.push({ uid: d.id, ten: x.ten, anh: x.anh || '', lop: 'GV', cacLop: [], vaiTro: 'gv' }); });
    try { sessionStorage.setItem('nwThay', JSON.stringify({ luc: Date.now(), ds: ds })); } catch (e) { }
    return ds;
  }
  NW.dsThay = dsThay;

  // ---------- từ cấm ----------
  var _tuCam = null;
  async function dsTuCam() {
    if (_tuCam) return _tuCam;
    var ds = (CFG.TU_CAM || []).slice();
    try {
      var o = JSON.parse(sessionStorage.getItem('nwTuCam') || 'null');
      if (o && (Date.now() - o.luc) < 30 * 60 * 1000) { _tuCam = ds.concat(o.ds); return _tuCam; }
      var f = await fb();
      var snap = await f.fs.getDoc(f.fs.doc(f.db, 'nwCauHinh', 'tuCam'));
      var them = snap.exists() ? (snap.data().ds || []) : [];
      try { sessionStorage.setItem('nwTuCam', JSON.stringify({ luc: Date.now(), ds: them })); } catch (e) { }
      _tuCam = ds.concat(them);
    } catch (e) { _tuCam = ds; }
    return _tuCam;
  }
  // Trả từ cấm đầu tiên tìm thấy (so theo TỪ, không so giữa chuỗi: "cc" không bắt "success").
  NW.kiemTuCam = async function (chu) {
    var ds = await dsTuCam();
    var t = ' ' + khongDau(chu).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
    for (var i = 0; i < ds.length; i++) {
      var w = ' ' + khongDau(ds[i]).replace(/\s+/g, ' ') + ' ';
      if (w.trim() && t.indexOf(w) >= 0) return ds[i];
    }
    return null;
  };
  NW.dsTuCam = dsTuCam;

  // ---------- thông báo ----------
  // Ghi vào hộp thông báo của NGƯỜI NHẬN (luật: ai đăng nhập cũng ghi được nhưng `tu` phải là mình).
  NW.guiThongBao = async function (uidNhan, tb) {
    if (!uidNhan || !NW.toi || uidNhan === NW.toi.uid) return;
    var f = await fb();
    var goc = {
      loai: String(tb.loai || 'chung'), tu: NW.toi.uid, tuTen: NW.toi.ten || '?', tuAnh: NW.toi.anh || '',
      chu: String(tb.chu || '').slice(0, 200), link: String(tb.link || '').slice(0, 300),
      luc: Date.now(), daDoc: false
    };
    try { await f.fs.addDoc(f.fs.collection(f.db, 'nwUsers', uidNhan, 'thongBao'), goc); }
    catch (e) { console.warn('[nw] gửi thông báo lỗi', e); }
  };

  // ---------- ảnh: nén JPEG + tải lên Storage ----------
  async function docAnh(file) {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { }
    }
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file);
      var im = new Image();
      im.onload = function () { URL.revokeObjectURL(url); res(im); };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Không đọc được ảnh')); };
      im.src = url;
    });
  }
  // Trả Blob JPEG. `canhDai` = cạnh dài tối đa; `vuong` = cắt vuông (avatar).
  NW.nenAnh = async function (file, tuyChon) {
    tuyChon = tuyChon || {};
    var canhDai = tuyChon.canhDai || CFG.ANH.canhDai;
    var chatLuong = tuyChon.chatLuong || CFG.ANH.chatLuong;
    var im = await docAnh(file);
    var w = im.width || im.naturalWidth, h = im.height || im.naturalHeight;
    var sx = 0, sy = 0, sw = w, sh = h;
    if (tuyChon.vuong) { var c = Math.min(w, h); sx = (w - c) / 2; sy = (h - c) / 2; sw = sh = c; }
    var ty = Math.min(1, canhDai / Math.max(sw, sh));
    var cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(sw * ty)); cv.height = Math.max(1, Math.round(sh * ty));
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);   // PNG trong suốt → nền trắng
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
    if (im.close) try { im.close(); } catch (e) { }
    var blob = await new Promise(function (res) { cv.toBlob(res, 'image/jpeg', chatLuong); });
    if (!blob) throw new Error('Không nén được ảnh');
    // Còn nặng quá thì hạ chất lượng thêm một nấc.
    if (blob.size > CFG.ANH.toiDaByte && chatLuong > 0.6) {
      blob = await new Promise(function (res) { cv.toBlob(res, 'image/jpeg', 0.6); });
    }
    return blob;
  };
  // Tải một blob lên `nw/{uid}/{ten}` → URL tải về.
  NW.taiAnh = async function (blob, ten, tienTrinh) {
    var s = await storage();
    var duong = 'nw/' + NW.toi.uid + '/' + ten;
    var r = s.stMod.ref(s.st, duong);
    var meta = { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000' };
    await new Promise(function (res, rej) {
      var task = s.stMod.uploadBytesResumable(r, blob, meta);
      task.on('state_changed', function (sn) {
        if (tienTrinh) tienTrinh(sn.totalBytes ? sn.bytesTransferred / sn.totalBytes : 0);
      }, rej, res);
    });
    return s.stMod.getDownloadURL(r);
  };
  NW.tenAnhMoi = function (duoi) { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + (duoi || '') + '.jpg'; };

  // ---------- toast / pop-up / menu ----------
  var _toastT = null;
  NW.toast = function (chu, loi) {
    var t = $('#nwToast');
    if (!t) { t = document.createElement('div'); t.id = 'nwToast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = chu; t.classList.toggle('loi', !!loi);
    t.classList.add('mo');
    clearTimeout(_toastT); _toastT = setTimeout(function () { t.classList.remove('mo'); }, loi ? 4200 : 2600);
  };

  function popNen() {
    var n = $('#nwPop');
    if (!n) {
      n = document.createElement('div'); n.id = 'nwPop'; n.className = 'pop-nen';
      n.innerHTML = '<div class="pop" role="dialog"></div>';
      n.addEventListener('click', function (e) { if (e.target === n) NW.popDong(); });
      document.body.appendChild(n);
    }
    return n;
  }
  // Mở pop-up với ruột HTML. Trả phần tử .pop để trang gắn sự kiện.
  NW.popMo = function (o) {
    o = o || {};
    var n = popNen(); var p = $('.pop', n);
    p.className = 'pop' + (o.lop ? ' ' + o.lop : '');
    p.innerHTML = (o.tieuDe ? '<div class="pop-head"><h2>' + chuAnToan(o.tieuDe) + '</h2>' +
      '<button class="dong" data-dong="1" aria-label="Đóng">' + NW.IC.dong + '</button></div>' : '') +
      '<div class="pop-body">' + (o.html || '') + '</div>' +
      (o.chan ? '<div class="pop-chan">' + o.chan + '</div>' : '');
    $$('[data-dong]', p).forEach(function (b) { b.onclick = NW.popDong; });
    requestAnimationFrame(function () { n.classList.add('mo'); });
    document.body.style.overflow = 'hidden';
    return p;
  };
  NW.popDong = function () {
    var n = $('#nwPop'); if (!n) return;
    n.classList.remove('mo'); document.body.style.overflow = '';
    if (NW._popDong) { var cb = NW._popDong; NW._popDong = null; cb(); }
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { NW.popDong(); NW.menuDong(); } });
  // Hộp hỏi Có/Không → Promise<bool>
  NW.hoi = function (tieuDe, chu, nhan) {
    nhan = nhan || {};
    return new Promise(function (res) {
      var p = NW.popMo({ tieuDe: tieuDe, html: '<p style="margin:0;font-size:14px;line-height:1.55">' + chuAnToan(chu) + '</p>',
        chan: '<button class="btn soft" data-huy>' + chuAnToan(nhan.huy || 'Thôi') + '</button>' +
              '<button class="btn ' + (nhan.nguy ? 'nguy' : 'primary') + '" data-ok>' + chuAnToan(nhan.ok || 'Đồng ý') + '</button>' });
      NW._popDong = function () { res(false); };
      $('[data-huy]', p).onclick = function () { NW.popDong(); };
      $('[data-ok]', p).onclick = function () { NW._popDong = null; NW.popDong(); res(true); };
    });
  };
  NW.xemAnh = function (url) {
    NW.popMo({ lop: 'anh', html: '<img src="' + chuAnToan(url) + '" alt="">' });
    var p = $('#nwPop .pop'); p.querySelector('.pop-body').style.padding = '0';
    p.onclick = NW.popDong;
  };

  // Menu nhỏ neo dưới một nút: items = [{ic, chu, nguy, onclick}]
  var _menu = null, _menuPhu = null;
  NW.menuNho = function (nut, items) {
    NW.menuDong();
    var m = document.createElement('div'); m.className = 'menu-nho';
    m.innerHTML = items.map(function (it, i) {
      return '<button data-i="' + i + '"' + (it.nguy ? ' class="nguy"' : '') + '>' + (it.ic || '') + '<span>' + chuAnToan(it.chu) + '</span></button>';
    }).join('');
    document.body.appendChild(m);
    var r = nut.getBoundingClientRect();
    var w = 200;
    var left = Math.min(window.innerWidth - w - 8, Math.max(8, r.right - w));
    var top = r.bottom + 6;
    if (top + items.length * 40 + 12 > window.innerHeight) top = Math.max(8, r.top - items.length * 40 - 14);
    m.style.left = left + 'px'; m.style.top = top + 'px';
    $$('button', m).forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); var it = items[+b.getAttribute('data-i')]; NW.menuDong(); if (it.onclick) it.onclick(); };
    });
    var phu = document.createElement('div'); phu.className = 'phu-nen'; phu.onclick = NW.menuDong;
    document.body.appendChild(phu);
    _menu = m; _menuPhu = phu;
    requestAnimationFrame(function () { m.classList.add('mo'); });
  };
  NW.menuDong = function () {
    if (_menu) { _menu.remove(); _menu = null; }
    if (_menuPhu) { _menuPhu.remove(); _menuPhu = null; }
  };

  // Textarea tự cao theo nội dung.
  NW.tuCao = function (ta, toiDa) {
    var chay = function () { ta.style.height = 'auto'; ta.style.height = Math.min(toiDa || 200, ta.scrollHeight) + 'px'; };
    ta.addEventListener('input', chay); chay();
    return chay;
  };

  // Tham số URL
  NW.thamSo = function (ten) { return new URLSearchParams(location.search).get(ten); };
  // Cửa bàn thử: `?thu=1` cho phép xem giao diện với dữ liệu mẫu, KHÔNG ghi gì.
  NW.laBanThu = function () { return NW.thamSo('thu') === '1' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname); };
})();
