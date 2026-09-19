/* ============================================================
   bai.js — BÀI ĐĂNG (v0.1.0): ô soạn · thẻ bài · cảm xúc · bình luận · chia sẻ ·
   báo cáo · menu sửa/xoá/ẩn/ghim · dòng bài có phân trang.
   Dùng chung cho bangtin.html · canhan.html · baidang.html · quanly.html.

   KHO nwPosts/{id}:
     uid · tacGia{uid,ten,anh,lop,vaiTro} · chu · anh[] · pham 'mang'|'lop' · lop · luc · suaLuc
     · an · ghim · camXuc{uid: mã} · soBinhLuan · soChiaSe · chiaSeTu · goc{uid,tacGia,chu,anh,luc}
   nwPosts/{id}/binhLuan/{cid}: uid · tacGia · chu · luc · camXuc{}
   nwBaoCao/{id}: tu · tuTen · baiId · uidBai · lyDo · chu · luc · trangThai

   💸 Nếp đọc: dòng bài dùng getDocs + phân trang 10 bài (KHÔNG onSnapshot cả bảng tin);
   bình luận chỉ tải khi bấm mở; cảm xúc nằm NGAY trong tài liệu bài (không tốn lượt đọc).
   Tác giả được NHÚNG vào bài/bình luận nên hiện dòng bài không phải đọc thêm hồ sơ ai.
   ============================================================ */
(function () {
  'use strict';
  var NW = window.NW, CFG = NW.CFG, $ = NW.$, $$ = NW.$$, IC = NW.IC, an = NW.chuAnToan;
  var Bai = NW.Bai = {};
  var MOI_TRANG = 10;

  // ---------- ô soạn ----------
  // o = { hop, lopMacDinh, sauKhiDang(bai, id), ghim (thầy) }
  Bai.soan = function (o) {
    var toi = NW.toi;
    var hop = o.hop;
    hop.className = (hop.className + ' card soan').trim();
    hop.innerHTML =
      '<div class="soan-dau">' + NW.avHtml(toi) + '<div style="flex:1;min-width:0">' +
      '<textarea id="soanChu" rows="1" placeholder="' + (toi.laThay ? 'Thầy muốn nhắn gì cho cả mạng?' : 'Em đang nghĩ gì?') + '" maxlength="' + CFG.TOI_DA_CHU_BAI + '"></textarea>' +
      '<div class="soan-anh" id="soanAnh" hidden></div><div class="canh-cam" id="soanCam" hidden></div></div></div>' +
      '<div class="soan-chan">' +
      '<button class="btn soft nho" id="soanThemAnh" type="button">' + IC.anh + ' Ảnh</button>' +
      '<input type="file" id="soanFile" accept="image/*" multiple hidden>' +
      '<button class="chon-pham" id="soanPham" type="button" title="Ai xem được bài này?">' + IC.theGioi + '<span>MỌI NGƯỜI</span></button>' +
      (toi.laThay ? '<label class="chon-pham" style="cursor:pointer"><input type="checkbox" id="soanGhim" style="accent-color:var(--accent)"> GHIM</label>' : '') +
      '<span class="dem" id="soanDem"></span>' +
      '<button class="btn primary nho" id="soanDang" type="button" disabled>ĐĂNG</button></div>';

    var ta = $('#soanChu', hop), dem = $('#soanDem', hop), nutDang = $('#soanDang', hop), khuAnh = $('#soanAnh', hop), cam = $('#soanCam', hop);
    var anhDs = [];           // [{blob, url}]
    var pham = 'mang';
    var lopToi = o.lopMacDinh || toi.lop || '';
    NW.tuCao(ta, 260);

    function kiem() {
      var n = ta.value.trim().length;
      dem.textContent = n ? n + '/' + CFG.TOI_DA_CHU_BAI : '';
      dem.classList.toggle('qua', n > CFG.TOI_DA_CHU_BAI);
      nutDang.disabled = !(n || anhDs.length) || n > CFG.TOI_DA_CHU_BAI;
    }
    ta.addEventListener('input', function () {
      kiem();
      clearTimeout(ta._t); ta._t = setTimeout(async function () {
        var tu = await NW.kiemTuCam(ta.value);
        cam.hidden = !tu; if (tu) cam.textContent = 'Bài có từ không phù hợp ("' + tu + '"). Em sửa lại nhé.';
      }, 300);
    });

    $('#soanThemAnh', hop).onclick = function () { $('#soanFile', hop).click(); };
    $('#soanFile', hop).onchange = async function () {
      var files = Array.prototype.slice.call(this.files || []);
      this.value = '';
      for (var i = 0; i < files.length; i++) {
        if (anhDs.length >= CFG.TOI_DA_ANH_BAI) { NW.toast('Mỗi bài tối đa ' + CFG.TOI_DA_ANH_BAI + ' ảnh.', true); break; }
        try {
          var blob = await NW.nenAnh(files[i]);
          anhDs.push({ blob: blob, url: URL.createObjectURL(blob) });
        } catch (e) { NW.toast('Không đọc được ảnh ' + files[i].name, true); }
      }
      veAnh(); kiem();
    };
    function veAnh() {
      khuAnh.hidden = !anhDs.length;
      khuAnh.innerHTML = anhDs.map(function (a, i) {
        return '<div class="o-anh"><img src="' + a.url + '" alt=""><button class="bo" data-i="' + i + '" type="button" aria-label="Bỏ ảnh">' + IC.dong + '</button></div>';
      }).join('');
      $$('.bo', khuAnh).forEach(function (b) { b.onclick = function () { anhDs.splice(+b.getAttribute('data-i'), 1); veAnh(); kiem(); }; });
    }
    var nutPham = $('#soanPham', hop);
    nutPham.onclick = function () {
      if (toi.laThay || !lopToi) return;
      pham = pham === 'mang' ? 'lop' : 'mang';
      nutPham.classList.toggle('lop', pham === 'lop');
      nutPham.innerHTML = (pham === 'lop' ? IC.lopHoc + '<span>CHỈ LỚP ' + an(lopToi) + '</span>' : IC.theGioi + '<span>MỌI NGƯỜI</span>');
    };

    nutDang.onclick = async function () {
      var chu = ta.value.trim();
      var tu = await NW.kiemTuCam(chu);
      if (tu) { cam.hidden = false; cam.textContent = 'Bài có từ không phù hợp ("' + tu + '"). Em sửa lại nhé.'; return; }
      if (NW.laBanThu()) { NW.toast('Bàn thử: không ghi thật.'); return; }
      nutDang.disabled = true; nutDang.textContent = 'ĐANG ĐĂNG…';
      try {
        var urls = [];
        for (var i = 0; i < anhDs.length; i++) {
          nutDang.textContent = 'ẢNH ' + (i + 1) + '/' + anhDs.length + '…';
          urls.push(await NW.taiAnh(anhDs[i].blob, NW.tenAnhMoi('_b' + i)));
        }
        var f = await NW.fb();
        var bai = {
          uid: toi.uid, tacGia: NW.tomTat(toi), chu: chu, anh: urls, pham: toi.laThay ? 'mang' : pham,
          lop: toi.laThay ? 'GV' : lopToi, luc: Date.now(), an: false,
          ghim: !!(toi.laThay && $('#soanGhim', hop) && $('#soanGhim', hop).checked),
          camXuc: {}, soBinhLuan: 0, soChiaSe: 0, chiaSeTu: null, goc: null
        };
        var ref = await f.fs.addDoc(f.fs.collection(f.db, 'nwPosts'), bai);
        ta.value = ''; anhDs = []; veAnh(); NW.tuCao(ta, 260); kiem();
        NW.toast('Đã đăng bài.');
        if (o.sauKhiDang) o.sauKhiDang(bai, ref.id);
      } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
      nutDang.textContent = 'ĐĂNG'; kiem();
    };
  };

  // ---------- vẽ thẻ bài ----------
  function demCamXuc(cx) {
    var d = {}; var tong = 0;
    Object.keys(cx || {}).forEach(function (u) { var m = cx[u]; if (m) { d[m] = (d[m] || 0) + 1; tong++; } });
    return { d: d, tong: tong };
  }
  function cumCamXuc(cx) {
    var c = demCamXuc(cx);
    if (!c.tong) return '';
    var loai = NW.CAM_XUC.filter(function (x) { return c.d[x.ma]; }).slice(0, 3);
    return '<span class="cx-cum" data-cxai><span class="ky">' + loai.map(function (x) { return x.ky; }).join('') + '</span> ' + c.tong + '</span>';
  }
  function khuAnhHtml(anh, nho) {
    if (!anh || !anh.length) return '';
    var n = Math.min(4, anh.length);
    return '<div class="bai-anh n' + n + '">' + anh.slice(0, 4).map(function (u) {
      return '<button type="button" data-anh="' + an(u) + '"><img src="' + an(u) + '" alt="" loading="lazy"></button>';
    }).join('') + '</div>';
  }
  function dauBai(tg, luc, them) {
    tg = tg || {};
    return '<div class="bai-dau">' + NW.avHtml(tg) + '<div class="ai"><div class="ten"><a href="canhan.html?uid=' + an(tg.uid) + '">' + an(tg.ten || '?') + '</a>' +
      (tg.vaiTro === 'gv' ? '<span class="nhan-gv">THẦY</span>' : (tg.lop ? '<span class="tiny">· ' + an(tg.lop) + '</span>' : '')) + (them || '') +
      '</div><div class="phu"><span title="' + an(NW.chuGio(luc, 'day')) + '">' + an(NW.chuGio(luc)) + '</span></div></div></div>';
  }
  function chuBai(chu, gon) {
    if (!chu) return '';
    var dai = gon && chu.length > 600;
    return '<p class="bai-chu' + (dai ? ' dai' : '') + '">' + NW.chuCoLink(chu) + '</p>' + (dai ? '<button class="xem-them" data-xemthem type="button">Xem thêm</button>' : '');
  }

  // Trả phần tử .bai đã gắn đủ sự kiện. o = { moBinhLuan, gon }
  Bai.dung = function (bai, id, o) {
    o = o || {};
    var toi = NW.toi;
    var el = document.createElement('article');
    el.className = 'card bai' + (bai.an ? ' an' : '');
    el.setAttribute('data-id', id);
    var cuaToi = bai.uid === toi.uid;
    var nhan = (bai.ghim ? '<span class="nhan-ghim">GHIM</span>' : '') + (bai.pham === 'lop' ? '<span class="nhan-lop">LỚP ' + an(bai.lop) + '</span>' : '') +
               (bai.an ? '<span class="nhan-an">ĐÃ ẨN</span>' : '');
    var goc = '';
    if (bai.chiaSeTu) {
      goc = bai.goc ? '<a class="bai-goc" href="baidang.html?id=' + an(bai.chiaSeTu) + '" style="display:block;color:inherit">' +
        dauBai(bai.goc.tacGia, bai.goc.luc) + chuBai(bai.goc.chu, true) + khuAnhHtml(bai.goc.anh) + '</a>' :
        '<div class="bai-goc mat">Bài gốc không còn.</div>';
    }
    var cx = (bai.camXuc || {})[toi.uid] || '';
    el.innerHTML = dauBai(bai.tacGia, bai.luc, nhan) +
      '<button class="nut-tron bai-menu" data-menu type="button" aria-label="Menu bài" style="position:absolute;right:8px;top:10px">' + IC.baCham + '</button>' +
      chuBai(bai.chu, o.gon !== false) + (bai.chiaSeTu ? goc : khuAnhHtml(bai.anh)) +
      '<div class="bai-so">' + cumCamXuc(bai.camXuc) +
        '<span class="phai"><button data-mobl type="button">' + (bai.soBinhLuan || 0) + ' bình luận</button><span>' + (bai.soChiaSe || 0) + ' chia sẻ</span></span></div>' +
      '<div class="bai-nut">' +
        '<button data-cx type="button" class="' + (cx ? 'da' : '') + '">' + (cx ? '<span class="ky">' + NW.kyCamXuc(cx) + '</span>' : IC.tim) + '<span>' + (cx ? 'Đã thả' : 'Thích') + '</span></button>' +
        '<button data-mobl type="button">' + IC.binhLuan + '<span>Bình luận</span></button>' +
        '<button data-chiase type="button">' + IC.chiaSe + '<span>Chia sẻ</span></button>' +
      '</div><div class="bl-khu" data-blkhu hidden></div>';
    el.style.position = 'relative';

    // ảnh phóng to
    $$('[data-anh]', el).forEach(function (b) { b.onclick = function (e) { e.preventDefault(); NW.xemAnh(b.getAttribute('data-anh')); }; });
    var xt = $('[data-xemthem]', el); if (xt) xt.onclick = function () { $('.bai-chu', el).classList.remove('dai'); xt.remove(); };

    // ---- cảm xúc: bấm = ❤️ hoặc gỡ; giữ (450ms) / rê chuột = chọn loại ----
    var nutCx = $('[data-cx]', el);
    var giu = null, daGiu = false;
    function datCx(ma) {
      var cu = (bai.camXuc || {})[toi.uid] || '';
      var moi = ma === cu ? '' : ma;
      bai.camXuc = bai.camXuc || {};
      if (moi) bai.camXuc[toi.uid] = moi; else delete bai.camXuc[toi.uid];
      nutCx.className = moi ? 'da' : '';
      nutCx.innerHTML = moi ? '<span class="ky">' + NW.kyCamXuc(moi) + '</span><span>Đã thả</span>' : IC.tim + '<span>Thích</span>';
      var so = $('.bai-so', el); var cum = $('.cx-cum', so);
      var html = cumCamXuc(bai.camXuc);
      if (cum) cum.outerHTML = html; else so.insertAdjacentHTML('afterbegin', html);
      ganCxAi();
      if (NW.laBanThu()) return;
      NW.fb().then(function (f) {
        var patch = {}; patch['camXuc.' + toi.uid] = moi ? moi : f.fs.deleteField();
        return f.fs.updateDoc(f.fs.doc(f.db, 'nwPosts', id), patch);
      }).then(function () {
        if (moi && !cu && !cuaToi) NW.guiThongBao(bai.uid, { loai: 'camXuc', chu: NW.kyCamXuc(moi) + ' ' + (bai.chu || '').slice(0, 60), link: 'baidang.html?id=' + id });
      }).catch(function (e) { NW.toast(NW.chuLoiKho(e), true); });
    }
    function moMenuCx() {
      var m = $('#nwCxMenu');
      if (!m) { m = document.createElement('div'); m.id = 'nwCxMenu'; m.className = 'cx-menu'; document.body.appendChild(m); }
      m.innerHTML = NW.CAM_XUC.map(function (c) { return '<button type="button" data-ma="' + c.ma + '" title="' + c.ma + '">' + c.ky + '</button>'; }).join('') +
        ((bai.camXuc || {})[toi.uid] ? '<button type="button" class="bo" data-ma="">Gỡ</button>' : '');
      var r = nutCx.getBoundingClientRect();
      m.style.left = Math.max(8, Math.min(window.innerWidth - 300, r.left)) + 'px';
      m.style.top = (r.top - 52) + 'px';
      m.classList.add('mo');
      $$('button', m).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); datCx(b.getAttribute('data-ma')); dongMenuCx(); }; });
      var phu = document.createElement('div'); phu.className = 'phu'; phu.id = 'nwCxPhu'; phu.onclick = dongMenuCx; document.body.appendChild(phu);
    }
    function dongMenuCx() { var m = $('#nwCxMenu'); if (m) m.classList.remove('mo'); var p = $('#nwCxPhu'); if (p) p.remove(); }
    nutCx.addEventListener('pointerdown', function (e) {
      daGiu = false; clearTimeout(giu);
      giu = setTimeout(function () { daGiu = true; moMenuCx(); }, 450);
    });
    nutCx.addEventListener('pointerup', function () { clearTimeout(giu); });
    nutCx.addEventListener('pointerleave', function () { clearTimeout(giu); });
    nutCx.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    nutCx.onclick = function () { if (daGiu) { daGiu = false; return; } datCx('tim'); };
    nutCx.onmouseenter = function () { if (window.matchMedia('(hover:hover)').matches) { clearTimeout(nutCx._h); nutCx._h = setTimeout(moMenuCx, 650); } };
    nutCx.onmouseleave = function () { clearTimeout(nutCx._h); };

    // ai đã thả gì
    function ganCxAi() {
      var c = $('[data-cxai]', el); if (!c) return;
      c.onclick = async function () {
        var cx = bai.camXuc || {}; var uids = Object.keys(cx);
        var p = NW.popMo({ tieuDe: 'Cảm xúc', html: '<div class="ds-nguoi" id="cxDs"><div class="xoay"></div></div>' });
        var html = '';
        for (var i = 0; i < uids.length; i++) {
          var hs = NW.laBanThu() ? { ten: uids[i] } : (await NW.hoSo(uids[i]).catch(function () { return null; })) || { ten: '?' };
          html += '<a class="nguoi" href="canhan.html?uid=' + an(uids[i]) + '">' + NW.avHtml(hs, 'nho') + '<span><span class="ten">' + an(hs.ten) + '</span><br><span class="lop">' + an(hs.lop || '') + '</span></span><span class="cuoi" style="font-size:20px">' + NW.kyCamXuc(cx[uids[i]]) + '</span></a>';
        }
        $('#cxDs', p).innerHTML = html || '<div class="trong">Chưa ai thả.</div>';
      };
    }
    ganCxAi();

    // ---- bình luận ----
    var khuBl = $('[data-blkhu]', el);
    var blMo = false, blDs = [], blHet = false;
    async function moBl() {
      if (blMo) { khuBl.hidden = !khuBl.hidden; if (!khuBl.hidden) { var t = $('textarea', khuBl); if (t) t.focus(); } return; }
      blMo = true; khuBl.hidden = false;
      khuBl.innerHTML = '<div class="xoay"></div>';
      await taiBl();
    }
    async function taiBl(them) {
      if (NW.laBanThu()) { blDs = bai._blMau || []; blHet = true; veBl(); return; }
      try {
        var f = await NW.fb();
        var rang = [f.fs.orderBy('luc', 'desc'), f.fs.limit(10)];
        if (them && blDs.length) rang.push(f.fs.startAfter(blDs[0].luc));
        var q = f.fs.query.apply(null, [f.fs.collection(f.db, 'nwPosts', id, 'binhLuan')].concat(rang));
        var snap = await f.fs.getDocs(q);
        var ds = []; snap.forEach(function (d) { ds.push(Object.assign({ id: d.id }, d.data())); });
        blHet = ds.length < 10;
        ds.reverse();
        blDs = them ? ds.concat(blDs) : ds;
        veBl();
      } catch (e) { khuBl.innerHTML = '<div class="trong">' + an(NW.chuLoiKho(e)) + '</div>'; }
    }
    function veBl() {
      khuBl.innerHTML = (!blHet ? '<button class="bl-them" data-blthem type="button">Xem bình luận cũ hơn</button>' : '') +
        blDs.map(function (b) {
          var tg = b.tacGia || {};
          var cuaToiBl = b.uid === toi.uid;
          var cxb = (b.camXuc || {})[toi.uid];
          return '<div class="bl" data-bl="' + an(b.id) + '">' + NW.avHtml(tg, 'nho') + '<div style="min-width:0;max-width:100%"><div class="bong">' +
            '<div class="ten"><a href="canhan.html?uid=' + an(tg.uid) + '" style="color:inherit">' + an(tg.ten) + '</a>' + (tg.vaiTro === 'gv' ? '<span class="nhan-gv">THẦY</span>' : '') + '</div>' +
            '<div class="chu">' + NW.chuCoLink(b.chu) + '</div></div>' +
            '<div class="duoi"><span>' + an(NW.chuGio(b.luc)) + '</span>' +
            '<button data-blcx type="button" style="color:' + (cxb ? 'var(--accent)' : '') + '">' + (cxb ? 'Đã thích' : 'Thích') + '</button>' +
            cumCamXuc(b.camXuc) +
            ((cuaToiBl || toi.laThay) ? '<button data-blxoa type="button">Xoá</button>' : '') + '</div></div></div>';
        }).join('') +
        '<div class="bl-nhap">' + NW.avHtml(toi, 'nho') + '<div class="o"><textarea rows="1" placeholder="Viết bình luận…" maxlength="' + CFG.TOI_DA_CHU_BINH_LUAN + '"></textarea>' +
        '<button class="gui" data-blgui type="button" disabled aria-label="Gửi">' + IC.gui + '</button></div></div>';
      var ta = $('textarea', khuBl), gui = $('[data-blgui]', khuBl);
      NW.tuCao(ta, 140);
      ta.addEventListener('input', function () { gui.disabled = !ta.value.trim(); });
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!gui.disabled) gui.click(); } });
      gui.onclick = async function () {
        var chu = ta.value.trim(); if (!chu) return;
        var tu = await NW.kiemTuCam(chu); if (tu) { NW.toast('Bình luận có từ không phù hợp ("' + tu + '").', true); return; }
        if (NW.laBanThu()) { blDs.push({ id: 'm' + Date.now(), uid: toi.uid, tacGia: NW.tomTat(toi), chu: chu, luc: Date.now(), camXuc: {} }); veBl(); return; }
        gui.disabled = true;
        try {
          var f = await NW.fb();
          var b = { uid: toi.uid, tacGia: NW.tomTat(toi), chu: chu, luc: Date.now(), camXuc: {} };
          var ref = await f.fs.addDoc(f.fs.collection(f.db, 'nwPosts', id, 'binhLuan'), b);
          await f.fs.updateDoc(f.fs.doc(f.db, 'nwPosts', id), { soBinhLuan: f.fs.increment(1) });
          bai.soBinhLuan = (bai.soBinhLuan || 0) + 1;
          $$('[data-mobl]', el)[0].textContent = bai.soBinhLuan + ' bình luận';
          blDs.push(Object.assign({ id: ref.id }, b)); veBl(); $('textarea', khuBl).focus();
          if (!cuaToi) NW.guiThongBao(bai.uid, { loai: 'binhLuan', chu: chu.slice(0, 80), link: 'baidang.html?id=' + id });
        } catch (e) { NW.toast(NW.chuLoiKho(e), true); gui.disabled = false; }
      };
      var them = $('[data-blthem]', khuBl); if (them) them.onclick = function () { taiBl(true); };
      $$('[data-bl]', khuBl).forEach(function (row) {
        var bid = row.getAttribute('data-bl');
        var b = blDs.filter(function (x) { return x.id === bid; })[0];
        var xoa = $('[data-blxoa]', row);
        if (xoa) xoa.onclick = async function () {
          if (!(await NW.hoi('Xoá bình luận?', 'Bình luận này sẽ mất luôn.', { ok: 'Xoá', nguy: true }))) return;
          blDs = blDs.filter(function (x) { return x.id !== bid; }); veBl();
          if (NW.laBanThu()) return;
          try {
            var f = await NW.fb();
            await f.fs.deleteDoc(f.fs.doc(f.db, 'nwPosts', id, 'binhLuan', bid));
            await f.fs.updateDoc(f.fs.doc(f.db, 'nwPosts', id), { soBinhLuan: f.fs.increment(-1) });
            bai.soBinhLuan = Math.max(0, (bai.soBinhLuan || 0) - 1);
            $$('[data-mobl]', el)[0].textContent = bai.soBinhLuan + ' bình luận';
          } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
        };
        var cxNut = $('[data-blcx]', row);
        if (cxNut) cxNut.onclick = async function () {
          b.camXuc = b.camXuc || {};
          var moi = b.camXuc[toi.uid] ? '' : 'tim';
          if (moi) b.camXuc[toi.uid] = moi; else delete b.camXuc[toi.uid];
          veBl();
          if (NW.laBanThu()) return;
          try {
            var f = await NW.fb(); var patch = {}; patch['camXuc.' + toi.uid] = moi || f.fs.deleteField();
            await f.fs.updateDoc(f.fs.doc(f.db, 'nwPosts', id, 'binhLuan', bid), patch);
          } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
        };
      });
    }
    $$('[data-mobl]', el).forEach(function (b) { b.onclick = moBl; });
    if (o.moBinhLuan) moBl();

    // ---- chia sẻ ----
    $('[data-chiase]', el).onclick = function () {
      var gocId = bai.chiaSeTu || id;
      var gocBai = bai.chiaSeTu ? bai.goc : { uid: bai.uid, tacGia: bai.tacGia, chu: bai.chu, anh: bai.anh || [], luc: bai.luc };
      if (!gocBai) { NW.toast('Bài gốc không còn.', true); return; }
      var p = NW.popMo({ tieuDe: 'Chia sẻ về trang của em', html:
        '<textarea id="csChu" rows="2" placeholder="Nói gì đó về bài này (không bắt buộc)…" maxlength="' + CFG.TOI_DA_CHU_BAI + '"></textarea>' +
        '<div class="bai-goc" style="margin-top:10px">' + dauBai(gocBai.tacGia, gocBai.luc) + chuBai(gocBai.chu, true) + '</div>',
        chan: '<button class="btn soft" data-dong>Thôi</button><button class="btn primary" id="csOk">Chia sẻ</button>' });
      $('[data-dong]', p).onclick = NW.popDong;
      $('#csOk', p).onclick = async function () {
        var chu = $('#csChu', p).value.trim();
        var tu = await NW.kiemTuCam(chu); if (tu) { NW.toast('Có từ không phù hợp ("' + tu + '").', true); return; }
        if (NW.laBanThu()) { NW.popDong(); NW.toast('Bàn thử: không ghi thật.'); return; }
        this.disabled = true;
        try {
          var f = await NW.fb();
          var moi = { uid: toi.uid, tacGia: NW.tomTat(toi), chu: chu, anh: [], pham: 'mang', lop: toi.laThay ? 'GV' : (toi.lop || ''), luc: Date.now(),
            an: false, ghim: false, camXuc: {}, soBinhLuan: 0, soChiaSe: 0, chiaSeTu: gocId,
            goc: { uid: gocBai.uid, tacGia: gocBai.tacGia, chu: gocBai.chu || '', anh: gocBai.anh || [], luc: gocBai.luc } };
          await f.fs.addDoc(f.fs.collection(f.db, 'nwPosts'), moi);
          try { await f.fs.updateDoc(f.fs.doc(f.db, 'nwPosts', gocId), { soChiaSe: f.fs.increment(1) }); } catch (e) { }
          NW.popDong(); NW.toast('Đã chia sẻ về trang của em.');
          if (gocBai.uid !== toi.uid) NW.guiThongBao(gocBai.uid, { loai: 'chiaSe', chu: (gocBai.chu || '').slice(0, 60), link: 'canhan.html?uid=' + toi.uid });
        } catch (e) { NW.toast(NW.chuLoiKho(e), true); this.disabled = false; }
      };
    };

    // ---- menu ba chấm ----
    $('[data-menu]', el).onclick = function () {
      var nut = this; var items = [];
      items.push({ ic: IC.link, chu: 'Mở bài này', onclick: function () { location.href = 'baidang.html?id=' + id; } });
      if (cuaToi && !bai.chiaSeTu) items.push({ ic: IC.sua, chu: 'Sửa bài', onclick: suaBai });
      if (cuaToi || toi.laThay) items.push({ ic: IC.xoa, chu: 'Xoá bài', nguy: true, onclick: xoaBai });
      if (!cuaToi) items.push({ ic: IC.baoCao, chu: 'Báo cáo với thầy', onclick: baoCao });
      if (toi.laThay) {
        items.push({ ic: bai.an ? IC.hien : IC.an, chu: bai.an ? 'Hiện lại bài' : 'Ẩn bài (thầy)', onclick: function () { thayDoi({ an: !bai.an }); } });
        items.push({ ic: IC.ghim, chu: bai.ghim ? 'Bỏ ghim' : 'Ghim lên đầu', onclick: function () { thayDoi({ ghim: !bai.ghim }); } });
      }
      NW.menuNho(nut, items);
    };
    async function thayDoi(patch) {
      if (NW.laBanThu()) { NW.toast('Bàn thử: không ghi thật.'); return; }
      try {
        var f = await NW.fb();
        await f.fs.updateDoc(f.fs.doc(f.db, 'nwPosts', id), patch);
        Object.assign(bai, patch);
        var moi = Bai.dung(bai, id, o); el.replaceWith(moi);
        NW.toast('Đã cập nhật.');
      } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
    }
    function suaBai() {
      var p = NW.popMo({ tieuDe: 'Sửa bài', html: '<textarea id="suaChu" rows="5" maxlength="' + CFG.TOI_DA_CHU_BAI + '">' + an(bai.chu) + '</textarea>',
        chan: '<button class="btn soft" data-dong>Thôi</button><button class="btn primary" id="suaOk">Lưu</button>' });
      $('[data-dong]', p).onclick = NW.popDong;
      $('#suaOk', p).onclick = async function () {
        var chu = $('#suaChu', p).value.trim();
        var tu = await NW.kiemTuCam(chu); if (tu) { NW.toast('Có từ không phù hợp ("' + tu + '").', true); return; }
        NW.popDong(); thayDoi({ chu: chu, suaLuc: Date.now() });
      };
    }
    async function xoaBai() {
      if (!(await NW.hoi('Xoá bài này?', 'Bài và mọi bình luận trong đó sẽ mất luôn.', { ok: 'Xoá', nguy: true }))) return;
      if (NW.laBanThu()) { el.remove(); return; }
      try {
        var f = await NW.fb();
        await f.fs.deleteDoc(f.fs.doc(f.db, 'nwPosts', id));
        el.remove(); NW.toast('Đã xoá bài.');
      } catch (e) { NW.toast(NW.chuLoiKho(e), true); }
    }
    function baoCao() {
      var p = NW.popMo({ tieuDe: 'Báo cáo bài này với thầy', html:
        '<label class="lbl">Lý do</label><select id="bcLyDo" style="width:100%;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);font-weight:600">' +
        '<option value="khong-phu-hop">Nội dung không phù hợp</option><option value="bat-nat">Trêu chọc / bắt nạt bạn</option>' +
        '<option value="gia-mao">Giả mạo người khác</option><option value="khac">Khác</option></select>' +
        '<label class="lbl" style="margin-top:12px">Nói rõ hơn (không bắt buộc)</label><textarea id="bcChu" rows="3" maxlength="300"></textarea>',
        chan: '<button class="btn soft" data-dong>Thôi</button><button class="btn nguy" id="bcOk">Gửi báo cáo</button>' });
      $('[data-dong]', p).onclick = NW.popDong;
      $('#bcOk', p).onclick = async function () {
        if (NW.laBanThu()) { NW.popDong(); NW.toast('Bàn thử: không ghi thật.'); return; }
        this.disabled = true;
        try {
          var f = await NW.fb();
          await f.fs.addDoc(f.fs.collection(f.db, 'nwBaoCao'), { tu: toi.uid, tuTen: toi.ten, baiId: id, uidBai: bai.uid, tenBai: (bai.tacGia || {}).ten || '',
            lyDo: $('#bcLyDo', p).value, chu: $('#bcChu', p).value.trim().slice(0, 300), tomTat: (bai.chu || '').slice(0, 120), luc: Date.now(), trangThai: 'moi' });
          NW.popDong(); NW.toast('Đã gửi báo cáo tới thầy. Cảm ơn em.');
        } catch (e) { NW.toast(NW.chuLoiKho(e), true); this.disabled = false; }
      };
    }
    return el;
  };

  // ---------- dòng bài có phân trang ----------
  // o = { hop, loai:'bangTin'|'cuaNguoi'|'daAn', uid, lopCuaToi:[...] }
  Bai.dongBai = function (o) {
    var hop = o.hop, toi = NW.toi;
    var cuoi = null, het = false, dangTai = false;
    var lops = o.lopCuaToi || toi.cacLop || [];
    hop.innerHTML = '';
    var chan = document.createElement('div'); chan.className = 'tai-them';
    var nut = document.createElement('button'); nut.className = 'btn soft nho'; nut.textContent = 'Tải thêm'; nut.type = 'button';
    chan.appendChild(nut); hop.after(chan); chan.hidden = true;

    function hienDuoc(b) {
      if (toi.laThay) return true;
      if (o.loai === 'daAn') return true;
      if (b.an) return b.uid === toi.uid;
      if (b.pham === 'lop' && lops.indexOf(b.lop) < 0 && b.uid !== toi.uid) return false;
      return true;
    }
    async function tai() {
      if (dangTai || het) return;
      dangTai = true; nut.disabled = true; nut.textContent = 'Đang tải…'; chan.hidden = false;
      try {
        var ds = [];
        if (NW.laBanThu()) { ds = cuoi ? [] : Bai.mau(); het = true; }
        else {
          var f = await NW.fb();
          var rang = [];
          if (o.loai === 'cuaNguoi') rang.push(f.fs.where('uid', '==', o.uid));
          if (o.loai === 'daAn') rang.push(f.fs.where('an', '==', true));
          rang.push(f.fs.orderBy('luc', 'desc'));
          if (cuoi) rang.push(f.fs.startAfter(cuoi));
          rang.push(f.fs.limit(MOI_TRANG));
          var q = f.fs.query.apply(null, [f.fs.collection(f.db, 'nwPosts')].concat(rang));
          var snap = await f.fs.getDocs(q);
          snap.forEach(function (d) { ds.push({ id: d.id, bai: d.data() }); cuoi = d; });
          if (snap.size < MOI_TRANG) het = true;
        }
        var soHien = 0;
        ds.forEach(function (x) { if (hienDuoc(x.bai)) { hop.appendChild(Bai.dung(x.bai, x.id, { gon: true })); soHien++; } });
        if (!hop.children.length && het) hop.innerHTML = '<div class="card trong">' + IC.bangTin + '<br>' + an(o.chuTrong || 'Chưa có bài nào. Em đăng bài đầu tiên nhé!') + '</div>';
        // Trang toàn bài bị lọc (chỉ-lớp của lớp khác) thì tự tải tiếp cho đỡ trống.
        if (!soHien && !het && ds.length) { dangTai = false; return tai(); }
      } catch (e) {
        hop.insertAdjacentHTML('beforeend', '<div class="card trong">' + an(NW.chuLoiKho(e)) + '</div>');
        het = true;
      }
      dangTai = false; nut.disabled = false; nut.textContent = 'Tải thêm'; chan.hidden = het;
    }
    nut.onclick = tai;
    // tự tải khi cuộn gần đáy
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) { if (es[0].isIntersecting && !het) tai(); }, { rootMargin: '400px' }) : null;
    if (io) io.observe(chan);
    tai();
    return {
      chenDau: function (bai, id) {
        var t = $('.trong', hop); if (t && t.parentNode === hop) t.remove();
        hop.insertBefore(Bai.dung(bai, id, { gon: true }), hop.firstChild);
      },
      taiLai: function () { cuoi = null; het = false; hop.innerHTML = ''; tai(); }
    };
  };

  // ---------- một bài (baidang.html) ----------
  Bai.mot = async function (hop, id) {
    hop.innerHTML = '<div class="xoay"></div>';
    try {
      if (NW.laBanThu()) { var m = Bai.mau()[0]; hop.innerHTML = ''; hop.appendChild(Bai.dung(m.bai, m.id, { gon: false, moBinhLuan: true })); return; }
      var f = await NW.fb();
      var snap = await f.fs.getDoc(f.fs.doc(f.db, 'nwPosts', id));
      hop.innerHTML = '';
      if (!snap.exists()) { hop.innerHTML = '<div class="card trong">Bài này không còn.</div>'; return; }
      var bai = snap.data();
      if (bai.an && !NW.toi.laThay && bai.uid !== NW.toi.uid) { hop.innerHTML = '<div class="card trong">Bài này đang được thầy ẩn.</div>'; return; }
      hop.appendChild(Bai.dung(bai, id, { gon: false, moBinhLuan: true }));
    } catch (e) { hop.innerHTML = '<div class="card trong">' + an(NW.chuLoiKho(e)) + '</div>'; }
  };

  // ---------- dữ liệu mẫu cho bàn thử ----------
  Bai.mau = function () {
    var t = Date.now();
    var tg1 = { uid: 'hs_1', ten: 'MINH ANH', anh: '', lop: 'A1C', vaiTro: 'hs' };
    var tg2 = { uid: 'gv', ten: 'Thầy Andrew', anh: 'assets/avatar-tron.jpg', lop: 'GV', vaiTro: 'gv' };
    var tg3 = { uid: 'hs_2', ten: 'BẢO NAM', anh: '', lop: 'B2B', vaiTro: 'hs' };
    return [
      { id: 'm1', bai: { uid: 'gv', tacGia: tg2, chu: 'Chào cả mạng! Đây là bảng tin của Andrew Classes. Các em đăng bài lịch sự, thân thiện nhé. 😊', anh: [], pham: 'mang', lop: 'GV', luc: t - 3600e3, an: false, ghim: true, camXuc: { hs_1: 'tim', hs_2: 'like', hs_3: 'haha' }, soBinhLuan: 2, soChiaSe: 1, chiaSeTu: null, goc: null,
        _blMau: [{ id: 'b1', uid: 'hs_1', tacGia: tg1, chu: 'Dạ vâng ạ!', luc: t - 3000e3, camXuc: {} }, { id: 'b2', uid: 'hs_2', tacGia: tg3, chu: 'Em chào thầy 🙌', luc: t - 2000e3, camXuc: { hs_1: 'tim' } }] } },
      { id: 'm2', bai: { uid: 'hs_1', tacGia: tg1, chu: 'Hôm nay em làm xong hết bài WORDS 2 rồi, 100% luôn 🎉 Bạn nào chưa làm thì làm nhanh kẻo hết hạn nha https://andrewclasses.com', anh: [], pham: 'lop', lop: 'A1C', luc: t - 1800e3, an: false, ghim: false, camXuc: { hs_0: 'tim', hs_2: 'gaCon' }, soBinhLuan: 0, soChiaSe: 0, chiaSeTu: null, goc: null } },
      { id: 'm3', bai: { uid: 'hs_2', tacGia: tg3, chu: 'Chia sẻ lại bài của thầy cho lớp mình xem.', anh: [], pham: 'mang', lop: 'B2B', luc: t - 600e3, an: false, ghim: false, camXuc: {}, soBinhLuan: 0, soChiaSe: 0, chiaSeTu: 'm1', goc: { uid: 'gv', tacGia: tg2, chu: 'Chào cả mạng! Đây là bảng tin của Andrew Classes.', anh: [], luc: t - 3600e3 } } }
    ];
  };
})();
