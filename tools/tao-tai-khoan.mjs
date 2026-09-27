// ═══════════════════════════════════════════════════════════════════════════
// tao-tai-khoan.mjs — TÀI KHOẢN HỌC SINH (Firebase Auth) cho myLesson + myNetwork (chạy trên máy thầy)
//
// Đọc danh sách lớp + mã đăng nhập từ `lop.json` của myLesson web (file myStudent xuất ra),
// rồi với MỖI EM:
//   · Firebase Auth: user  uid = hs_<mã số myStudent>  ·  email giả = sha256(mã)[0..24]@id.andrewclasses.com
//                    custom claims { hs:true, ma:'<MÃ>', lop:'A1C', lops:'A1C,NNTNGK9', msId:123 }
//                    (luật Firestore đọc: `ma` = người gửi chat phải đúng mã của chính em — 27/09/2026)
//   · Firestore nwUsers/hs_<id>: hồ sơ (ten, tenThuong, lop, cacLop, vaiTro 'hs', phaiDoiMk, mkLopLuc)
//   · Firestore nwCauHinh/lop: danh sách lớp cho tab KHÁM PHÁ + trang quản lý.
// Em có mã ở HAI nơi (lớp thường + khoá) = MỘT tài khoản: uid theo bản ghi lớp thường đầu tiên,
// cacLop gồm cả hai. Em nào KHÔNG còn trong lop.json chỉ được LIỆT KÊ, không xoá (tự khoá tay nếu cần).
//
// ⭐⭐ 27/09/2026 (sau tấn công Tr0ngX, thầy chốt) — MẬT KHẨU CHUNG THEO LỚP:
//   `<mã lớp thường, chữ thường>andrewclasses-<5 ký tự ngẫu nhiên>`  (vd a1aandrewclasses-k7m2x)
//   do máy sinh, cất ở MAT_KHAU_FILE (ngoài git, ngoài Drive). Em vào lần đầu bằng ID + mật khẩu lớp,
//   web BẮT đặt mật khẩu riêng (≥ 8 ký tự). Quá HAN_NGAY ngày chưa đổi ⇒ `--khoa-qua-han` khoá tài khoản.
//   ⛔ MẬT KHẨU KHÔNG BAO GIỜ = MÃ (mã HS đã công khai — H1 trong HO SO BAO MAT.md). Bản cũ tạo mới
//   bằng `password: e.ma`, đó là lỗ H1 — đừng quay lại.
//
// Chạy:
//   cd tools && npm install              (một lần — cài firebase-admin, node_modules đã .gitignore)
//   node tao-tai-khoan.mjs --dry         xem sẽ làm gì, KHÔNG ghi
//   node tao-tai-khoan.mjs               tạo/cập nhật hồ sơ + claims (KHÔNG đổi mật khẩu em đã có)
//   node tao-tai-khoan.mjs --chi A1C     chỉ một lớp
//   node tao-tai-khoan.mjs --mat-khau-lop [--moi]
//        ĐẶT LẠI mật khẩu MỌI em (hoặc --chi) = mật khẩu lớp, MỞ khoá, bắt đổi lần đầu, đăng xuất mọi máy.
//        Chưa có mật khẩu lớp thì tự sinh; `--moi` = sinh bộ MỚI (bộ cũ hết hiệu lực). In bảng để phát.
//   node tao-tai-khoan.mjs --reset 123   đặt lại MỘT em (mã số myStudent 123) = mật khẩu lớp + bắt đổi lại
//   node tao-tai-khoan.mjs --khoa-qua-han [--ngay 7]
//        khoá các em còn phaiDoiMk quá N ngày kể từ lúc phát mật khẩu lớp (chuông báo động gọi 1 lần/ngày)
//   node tao-tai-khoan.mjs --trang-thai  bảng ai đã / chưa đặt mật khẩu riêng (giờ đổi lấy từ MÁY CHỦ Auth)
//   node tao-tai-khoan.mjs --lop "E:\...\lop.json"   đọc file khác
//
// Khoá quản trị: %LOCALAPPDATA%\AndrewClasses\firebase-admin.json (ngoài git, ngoài Drive) —
// đường lùi: D:\APP AND DATA\mySpeaking-data\data\firebase-admin.json. Thiếu thì báo rõ, không đoán.
// ═══════════════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const DUOI_EMAIL = '@id.andrewclasses.com';           // PHẢI khớp config.js DUOI_EMAIL + web js/nw-phien.js
// lop.json: máy ANDREWHOME để web ở myLesson\web, máy khác ở "myLesson Web" — DÒ, không trỏ cứng một chỗ.
const LOP_JSON_UNG_VIEN = ['E:\\LAP TRINH APP\\myLesson\\web\\data\\lop.json', 'E:\\LAP TRINH APP\\myLesson Web\\data\\lop.json'];
const THU_MUC_RIENG = path.join(process.env.LOCALAPPDATA || '', 'AndrewClasses');
const KHOA_1 = path.join(THU_MUC_RIENG, 'firebase-admin.json');
const KHOA_2 = 'D:\\APP AND DATA\\mySpeaking-data\\data\\firebase-admin.json';
// ⛔ Mật khẩu lớp: CHỈ ở máy này, cạnh khoá quản trị (ngoài git, ngoài Drive). Máy khác không có ⇒ --reset báo rõ.
const MAT_KHAU_FILE = path.join(THU_MUC_RIENG, 'mat-khau-lop.json');
const BANG_IN = 'E:\\LAP TRINH APP\\myLesson-data\\MAT KHAU LOP - PHAT CHO HOC SINH (BI MAT).txt';
const HAN_NGAY_MAC_DINH = 7;
const MK_TOI_THIEU = 8;                                // PHẢI khớp web js/nw-dangnhap.js

const arg = process.argv.slice(2);
const co = (k) => arg.includes(k);
const lay = (k, mac) => { const i = arg.indexOf(k); return i >= 0 && arg[i + 1] ? arg[i + 1] : mac; };
const DRY = co('--dry');
const CHI_LOP = lay('--chi', '');
const RESET = lay('--reset', '');
const LOP_JSON = lay('--lop', LOP_JSON_UNG_VIEN.find((p) => fs.existsSync(p)) || LOP_JSON_UNG_VIEN[0]);

function chuanMa(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
function khongDau(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
function emailTuMa(ma) { return crypto.createHash('sha256').update(chuanMa(ma)).digest('hex').slice(0, 24) + DUOI_EMAIL; }

// Ký tự dễ đọc: bỏ 0/o, 1/l/i — em gõ trên điện thoại không nhầm.
const BANG_KY_TU = 'abcdefghjkmnpqrstuvwxyz23456789';
function chuoiNgauNhien(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += BANG_KY_TU[crypto.randomInt(BANG_KY_TU.length)];
  return s;
}
function sinhMatKhauLop(maLop) { return String(maLop).toLowerCase().replace(/[^a-z0-9]/g, '') + 'andrewclasses-' + chuoiNgauNhien(5); }

// ---- khoá quản trị ----
const KHOA = [KHOA_1, KHOA_2].find((p) => p && path.isAbsolute(p) && fs.existsSync(p));
if (!KHOA) { console.error('⛔ Không thấy firebase-admin.json ở:\n  ' + KHOA_1 + '\n  ' + KHOA_2); process.exit(2); }
let admin;
try { admin = require('firebase-admin'); }
catch (e) { console.error('⛔ Chưa cài firebase-admin. Chạy:  cd tools && npm install'); process.exit(2); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(KHOA, 'utf8').replace(/^\uFEFF/, ''))) });
const auth = admin.auth();
const db = admin.firestore();
console.log('🔑 Khoá: ' + KHOA + (DRY ? '   (DRY — không ghi gì)' : ''));

// ---- kho mật khẩu lớp (máy này) ----
function docMatKhau() {
  try { return JSON.parse(fs.readFileSync(MAT_KHAU_FILE, 'utf8').replace(/^\uFEFF/, '')); } catch (e) { return null; }
}
function ghiAtomic(p, noiDung) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p + '.tmp', noiDung, 'utf8');
  fs.renameSync(p + '.tmp', p);
}

// ---- đọc lop.json ----
if (!fs.existsSync(LOP_JSON)) { console.error('⛔ Không thấy ' + LOP_JSON); process.exit(2); }
const DL = JSON.parse(fs.readFileSync(LOP_JSON, 'utf8').replace(/^\uFEFF/, ''));
const NOI = [...(DL.lop || []).map((l) => ({ ...l, loai: 'lop' })), ...(DL.khoa || []).map((l) => ({ ...l, loai: 'khoa' }))];
console.log('📄 ' + LOP_JSON + ' — cập nhật ' + DL.capNhat + ' · ' + (DL.lop || []).length + ' lớp + ' + (DL.khoa || []).length + ' khoá');

// v0.9.2 — sinh nhật: lop.json cho cả ngày/tháng/năm, nhưng nwUsers CHỈ giữ 'dd/MM'
// (mạng chỉ cần biết hôm nay ai sinh nhật; không đưa năm sinh lên mạng cho cả trường đọc).
function ngayThang(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/);
  if (!m) return '';
  const d = +m[1], t = +m[2];
  if (d < 1 || d > 31 || t < 1 || t > 12) return '';
  return ('0' + d).slice(-2) + '/' + ('0' + t).slice(-2);
}

// Gom theo MÃ đăng nhập: một em có thể ở 2 nơi ⇒ một tài khoản.
const theoMa = new Map();
for (const noi of NOI) {
  for (const h of noi.hocSinh || []) {
    const ma = chuanMa(h.ma);
    if (!ma || !h.id) continue;
    if (!theoMa.has(ma)) theoMa.set(ma, { ma, ten: h.ten, ids: [], noi: [], sinhNhat: '' });
    const e = theoMa.get(ma);
    if (!e.sinhNhat) e.sinhNhat = ngayThang(h.sinhNhat);   // v0.9.2: chỉ giữ NGÀY/THÁNG
    e.ids.push({ id: h.id, loai: noi.loai, maLop: noi.maLop });
    e.noi.push({ maLop: noi.maLop, tenGoc: noi.tenGoc, loai: noi.loai });
  }
}
const DS = [...theoMa.values()].map((e) => {
  const chinh = e.ids.find((x) => x.loai === 'lop') || e.ids[0];
  return {
    uid: 'hs_' + chinh.id, msId: chinh.id, ma: e.ma, ten: String(e.ten || '').trim(),
    lop: chinh.maLop, cacLop: [...new Set(e.noi.map((n) => n.maLop))], sinhNhat: e.sinhNhat
  };
}).filter((e) => !CHI_LOP || e.cacLop.includes(CHI_LOP));
console.log('👥 ' + DS.length + ' tài khoản' + (CHI_LOP ? ' (lớp ' + CHI_LOP + ')' : ''));

function claimsCua(e) { return { hs: true, ma: e.ma, lop: e.lop, lops: e.cacLop.join(','), msId: e.msId }; }
function claimsLech(cu, moi) { return Object.keys(moi).some((k) => cu[k] !== moi[k]) || Object.keys(cu).length !== Object.keys(moi).length; }

// ⭐ 27/09/2026 — GIẢI PHÓNG EMAIL TRÙNG. myStudent từng ĐÁNH LẠI mã số (id) cả lớp khoá NNTNGK9/NNTNG4 ⇒
// uid (= hs_<id>) so le dây chuyền với em thật: email giả (theo MÃ) của em A đang nằm ở tài khoản hs_X cũ.
// updateUser/createUser báo "email already in use" (27/09: 22 em). Cách gỡ: dời email của tài khoản đang
// giữ nhầm sang email TẠM (`tam-<uid>@…`, không ai đăng nhập được), rồi lượt chính gán đúng email cho từng em.
// (Đã kiểm 27/09: các tài khoản so le chưa có ảnh/giới thiệu/bài đăng, chưa từng đăng nhập ⇒ dời an toàn.)
async function giaiPhongEmail(ds) {
  let doi = 0;
  for (const e of ds) {
    let giu = null;
    try { giu = await auth.getUserByEmail(emailTuMa(e.ma)); } catch (err) { if (err.code !== 'auth/user-not-found') throw err; continue; }
    if (giu.uid === e.uid) continue;
    console.log('  🔀 email của ' + e.uid + ' (' + e.ten + ') đang ở ' + giu.uid + ' (' + (giu.displayName || '?') + ') ⇒ dời ' + giu.uid + ' sang email tạm');
    if (!DRY) await auth.updateUser(giu.uid, { email: 'tam-' + giu.uid + DUOI_EMAIL });
    doi++;
  }
  if (doi) console.log('  → đã dời ' + doi + ' email trùng');
}

// passwordUpdatedAt theo MÁY CHỦ Auth (Admin SDK không trả trường này ⇒ REST accounts:lookup).
// ⛔ Chính lúc công cụ ĐẶT mật khẩu lớp cũng làm mốc này nhảy ⇒ "em đã đổi chưa" phải so với mốc máy chủ
// GHI LẠI ngay sau khi đặt (nwUsers.mkLopPwAt), KHÔNG so với đồng hồ máy thầy (lệch giờ + đặt sau mốc bắt đầu).
async function layMocDoiMk(uids) {
  const tk = (await admin.app().options.credential.getAccessToken()).access_token;
  const pid = admin.app().options.credential.projectId || 'aword-70dae';
  const ra = {}, khoa = {};
  for (let i = 0; i < uids.length; i += 100) {
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/projects/' + pid + '/accounts:lookup', {
      method: 'POST', headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId: uids.slice(i, i + 100) })
    });
    const j = await r.json();
    if (!r.ok) throw new Error('accounts:lookup ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
    for (const u of j.users || []) { ra[u.localId] = Number(u.passwordUpdatedAt) || 0; khoa[u.localId] = !!u.disabled; }
  }
  return { moc: ra, khoa };
}
async function ghiMocMkLop(uids) {
  if (DRY || !uids.length) return;
  const { moc } = await layMocDoiMk(uids);
  for (const uid of uids) await db.doc('nwUsers/' + uid).set({ mkLopPwAt: moc[uid] || 0 }, { merge: true });
}

// Mật khẩu lớp của em (theo lớp CHÍNH = uid). Không có ⇒ null.
function mkLopCua(bang, e) { return (bang && bang.lop && bang.lop[e.lop]) || null; }

// Mở lại + đặt mật khẩu lớp + bắt đổi + đăng xuất mọi máy — DÙNG CHUNG cho --mat-khau-lop và --reset.
async function datVeMatKhauLop(e, mk, luc) {
  await auth.updateUser(e.uid, { password: mk, email: emailTuMa(e.ma), displayName: e.ten, disabled: false });
  await auth.setCustomUserClaims(e.uid, claimsCua(e));
  await auth.revokeRefreshTokens(e.uid);            // máy nào đang giữ phiên cũ (kể cả kẻ lạ) ⇒ phải đăng nhập lại
  await db.doc('nwUsers/' + e.uid).set({ phaiDoiMk: true, mkLopLuc: luc, quaHanMk: false, capNhat: luc }, { merge: true });
}

// ═════════ --reset <mã số> ═════════
if (RESET) {
  const e = DS.find((x) => String(x.msId) === String(RESET) || x.uid === RESET);
  if (!e) { console.error('⛔ Không thấy mã số ' + RESET + ' trong lop.json'); process.exit(2); }
  const mk = mkLopCua(docMatKhau(), e);
  if (!mk) { console.error('⛔ Máy này chưa có mật khẩu lớp ' + e.lop + ' (' + MAT_KHAU_FILE + '). Chạy --mat-khau-lop trên máy đã phát mật khẩu.'); process.exit(2); }
  console.log('🔁 Đặt lại ' + e.uid + ' (' + e.ten + ', lớp ' + e.lop + ') về mật khẩu lớp + bắt đổi lại + mở khoá');
  if (!DRY) { await datVeMatKhauLop(e, mk, Date.now()); await ghiMocMkLop([e.uid]); }
  console.log('✅ Xong. Em vào bằng ID + mật khẩu lớp ' + e.lop + ', rồi đặt mật khẩu riêng.');
  process.exit(0);
}

// ═════════ --mat-khau-lop [--moi] ═════════
if (co('--mat-khau-lop')) {
  const cu = docMatKhau();
  const bang = { taoLuc: (cu && cu.taoLuc) || Date.now(), lop: Object.assign({}, (cu && cu.lop) || {}) };
  const cacLopCan = [...new Set(DS.map((e) => e.lop))];
  for (const l of cacLopCan) {
    if (co('--moi') || !bang.lop[l]) bang.lop[l] = sinhMatKhauLop(l);
  }
  if (co('--moi')) bang.taoLuc = Date.now();
  if (!DRY) ghiAtomic(MAT_KHAU_FILE, JSON.stringify(bang, null, 2));
  await giaiPhongEmail(DS);
  const luc = Date.now();
  let ok = 0, loi = 0, tao = 0;
  const xong = [];
  for (const e of DS) {
    const mk = bang.lop[e.lop];
    try {
      let u = null;
      try { u = await auth.getUser(e.uid); } catch (err) { if (err.code !== 'auth/user-not-found') throw err; }
      if (!u) {
        console.log('  ➕ tạo ' + e.uid + '  ' + e.ten + '  [' + e.cacLop.join(',') + ']');
        if (!DRY) {
          await auth.createUser({ uid: e.uid, email: emailTuMa(e.ma), password: mk, displayName: e.ten, emailVerified: false });
          await db.doc('nwUsers/' + e.uid).set({
            uid: e.uid, ten: e.ten, tenThuong: khongDau(e.ten), lop: e.lop, cacLop: e.cacLop, vaiTro: 'hs', msId: e.msId,
            sinhNhat: e.sinhNhat, anh: '', bia: '', gioiThieu: '', khoa: false, luc, capNhat: luc
          }, { merge: true });
        }
        tao++;
      } else if (!DRY) {
        await db.doc('nwUsers/' + e.uid).set({ uid: e.uid, ten: e.ten, tenThuong: khongDau(e.ten), lop: e.lop, cacLop: e.cacLop, vaiTro: 'hs', msId: e.msId, sinhNhat: e.sinhNhat }, { merge: true });
      }
      if (!DRY) await datVeMatKhauLop(e, mk, luc);
      xong.push(e.uid);
      ok++;
    } catch (err) { console.error('  ⛔ ' + e.uid + ' ' + (err.message || err)); loi++; }
  }
  await ghiMocMkLop(xong);
  // Bảng để thầy phát (file ngoài git; KHÔNG in mật khẩu ra màn hình — nhật ký Claude/terminal có thể bị lưu lại).
  const dong = ['MẬT KHẨU LỚP — PHÁT CHO HỌC SINH (BÍ MẬT, đừng đăng lên nhóm chung)',
    'Tạo lúc: ' + new Date(luc).toLocaleString('vi-VN') + ' · hết hạn sau ' + HAN_NGAY_MAC_DINH + ' ngày nếu em chưa đổi',
    'Cách vào: andrewclasses.com → gõ ID của em + mật khẩu lớp → đặt mật khẩu riêng (ít nhất ' + MK_TOI_THIEU + ' ký tự).', ''];
  for (const l of cacLopCan) {
    const soEm = DS.filter((e) => e.lop === l).length;
    dong.push(l.padEnd(10) + bang.lop[l] + '    (' + soEm + ' em)');
  }
  if (!DRY) ghiAtomic(BANG_IN, '\uFEFF' + dong.join('\r\n') + '\r\n');
  console.log('\n✅ Mật khẩu lớp: ' + ok + ' em (tạo mới ' + tao + ') · lỗi ' + loi + (DRY ? '   (DRY — chưa ghi gì)' : ''));
  console.log('   Bảng phát cho HS: ' + BANG_IN);
  console.log('   Kho mật khẩu lớp: ' + MAT_KHAU_FILE);
  process.exit(loi ? 1 : 0);
}

// ═════════ --khoa-qua-han [--ngay N] ═════════
if (co('--khoa-qua-han')) {
  const ngay = Number(lay('--ngay', HAN_NGAY_MAC_DINH)) || HAN_NGAY_MAC_DINH;
  const moc = Date.now() - ngay * 86400000;
  // Một điều kiện bằng ⇒ không cần chỉ mục ghép; lọc mốc giờ ở máy.
  const snap = await db.collection('nwUsers').where('phaiDoiMk', '==', true).get();
  let khoa = 0;
  for (const d of snap.docs) {
    const x = d.data();
    if (x.vaiTro !== 'hs' || x.quaHanMk === true) continue;
    if (!(Number(x.mkLopLuc) > 0 && Number(x.mkLopLuc) < moc)) continue;
    console.log('  🔒 quá hạn ' + d.id + '  ' + (x.ten || '?') + '  [' + (x.lop || '') + ']');
    if (!DRY) {
      await auth.updateUser(d.id, { disabled: true });
      await auth.revokeRefreshTokens(d.id);
      await d.ref.set({ quaHanMk: true, capNhat: Date.now() }, { merge: true });
    }
    khoa++;
  }
  console.log('✅ Khoá quá hạn (' + ngay + ' ngày): ' + khoa + ' em' + (DRY ? '   (DRY)' : '') + '. Mở lại một em: --reset <mã số>');
  process.exit(0);
}

// ═════════ --trang-thai ═════════
if (co('--trang-thai')) {
  // Giờ đổi lấy ở MÁY CHỦ (passwordUpdatedAt), không tin cờ phía web. Đã đổi ⇔ mốc máy chủ ≠ mốc lúc
  // công cụ đặt mật khẩu lớp (nwUsers.mkLopPwAt) — xem layMocDoiMk.
  const { moc: doiLuc, khoa: khoaAu } = await layMocDoiMk(DS.map((e) => e.uid));
  const hs = {};
  const snap = await db.collection('nwUsers').where('vaiTro', '==', 'hs').get();
  snap.docs.forEach((d) => { hs[d.id] = d.data(); });
  const gio = (ms) => ms ? new Date(ms).toLocaleString('vi-VN', { hour12: false }) : '—';
  let da = 0, chua = 0;
  for (const l of [...new Set(DS.map((e) => e.lop))]) {
    console.log('\n== ' + l);
    for (const e of DS.filter((x) => x.lop === l)) {
      const h = hs[e.uid] || {};
      const daDoi = h.mkLopPwAt ? doiLuc[e.uid] > Number(h.mkLopPwAt) : false;
      daDoi ? da++ : chua++;
      console.log('  ' + (khoaAu[e.uid] ? '🔒' : daDoi ? '✅' : '⬜') + ' ' + e.ten.padEnd(24) + (daDoi ? 'đổi lúc ' + gio(doiLuc[e.uid]) : 'chưa đổi') +
        (h.quaHanMk ? ' · QUÁ HẠN' : '') + (khoaAu[e.uid] && !h.quaHanMk ? ' · đang khoá' : ''));
    }
  }
  console.log('\nTổng: ' + da + ' em đã đặt mật khẩu riêng · ' + chua + ' em chưa');
  process.exit(0);
}

// ═════════ tạo / cập nhật (mặc định) ═════════
// ⛔ KHÔNG đổi mật khẩu em đã có. Em MỚI: mật khẩu lớp nếu máy này có, không thì chuỗi ngẫu nhiên + KHOÁ
// (thầy chạy --reset <mã số> khi phát mật khẩu). Không bao giờ dùng mã làm mật khẩu.
const BANG_MK = docMatKhau();
if (!CHI_LOP) await giaiPhongEmail(DS);     // --chi một lớp: không dời email lớp khác
let tao = 0, capNhat = 0, loi = 0;
for (const e of DS) {
  const email = emailTuMa(e.ma);
  const claims = claimsCua(e);
  let u = null;
  try { u = await auth.getUser(e.uid); } catch (err) { if (err.code !== 'auth/user-not-found') { console.error('  ⛔ ' + e.uid + ' ' + err.message); loi++; continue; } }
  try {
    if (!u) {
      const mk = mkLopCua(BANG_MK, e);
      console.log('  ➕ tạo ' + e.uid + '  ' + e.ten + '  [' + e.cacLop.join(',') + ']' + (mk ? '' : '  (KHOÁ — chưa có mật khẩu lớp ' + e.lop + ')'));
      if (!DRY) {
        const luc = Date.now();
        await auth.createUser({ uid: e.uid, email, password: mk || chuoiNgauNhien(24), displayName: e.ten, emailVerified: false, disabled: !mk });
        await auth.setCustomUserClaims(e.uid, claims);
        await db.doc('nwUsers/' + e.uid).set({
          uid: e.uid, ten: e.ten, tenThuong: khongDau(e.ten), lop: e.lop, cacLop: e.cacLop, vaiTro: 'hs', msId: e.msId,
          sinhNhat: e.sinhNhat,
          anh: '', bia: '', gioiThieu: '', phaiDoiMk: true, mkLopLuc: mk ? luc : 0, khoa: false, luc, capNhat: luc
        }, { merge: true });
      }
      tao++;
    } else {
      const doiEmail = u.email !== email;      // thầy đổi mã đăng nhập của em ⇒ email giả đổi theo
      const doiClaim = claimsLech(u.customClaims || {}, claims);
      const doiTen = u.displayName !== e.ten;
      if (doiEmail || doiClaim || doiTen) console.log('  ✏️ cập nhật ' + e.uid + '  ' + e.ten + (doiEmail ? ' [mã đổi]' : '') + (doiClaim ? ' [claims → ' + claims.lops + ']' : '') + (doiTen ? ' [tên đổi]' : ''));
      if (!DRY) {
        if (doiEmail || doiTen) await auth.updateUser(e.uid, { email, displayName: e.ten });
        if (doiClaim) await auth.setCustomUserClaims(e.uid, claims);
        // Hồ sơ: chỉ cập nhật các trường do myStudent quản (KHÔNG đụng anh/bia/gioiThieu/phaiDoiMk/khoa/mkLopLuc)
        await db.doc('nwUsers/' + e.uid).set({ uid: e.uid, ten: e.ten, tenThuong: khongDau(e.ten), lop: e.lop, cacLop: e.cacLop, vaiTro: 'hs', msId: e.msId, sinhNhat: e.sinhNhat, capNhat: Date.now() }, { merge: true });
      }
      capNhat++;
    }
  } catch (err) { console.error('  ⛔ ' + e.uid + ' ' + (err.message || err)); loi++; }
}

// ---- danh sách lớp cho tab KHÁM PHÁ ----
const dsLop = NOI.map((n) => ({ ma: n.maLop, ten: n.loai === 'khoa' ? 'KHÓA ' + (n.tenGoc || n.maLop) : (n.tenGoc || n.maLop) }));
if (!DRY) await db.doc('nwCauHinh/lop').set({ ds: dsLop, luc: Date.now() });

// ---- ai trên mạng mà không còn trong lop.json? ----
if (!CHI_LOP) {
  const snap = await db.collection('nwUsers').where('vaiTro', '==', 'hs').get();
  const con = new Set(DS.map((e) => e.uid));
  const mat = snap.docs.filter((d) => !con.has(d.id)).map((d) => d.id + ' (' + (d.data().ten || '?') + ')');
  if (mat.length) console.log('⚠️ ' + mat.length + ' tài khoản trên mạng KHÔNG còn trong lop.json (không tự xoá): ' + mat.join(', '));
}
console.log('\n✅ Xong: tạo ' + tao + ' · cập nhật ' + capNhat + ' · lỗi ' + loi + ' · ' + dsLop.length + ' lớp' + (DRY ? '   (DRY — chưa ghi gì)' : ''));
process.exit(loi ? 1 : 0);
