// ═══════════════════════════════════════════════════════════════════════════
// tao-tai-khoan.mjs — TẠO/CẬP NHẬT TÀI KHOẢN HỌC SINH cho myNetwork (chạy trên máy thầy)
//
// Đọc danh sách lớp + mã đăng nhập từ `lop.json` của myLesson web (file myStudent xuất ra),
// rồi với MỖI EM:
//   · Firebase Auth: tạo user  uid = hs_<mã số myStudent>  ·  email giả = sha256(mã)[0..24]@id.andrewclasses.com
//                    mật khẩu BAN ĐẦU = chính mã đăng nhập (chỉ khi TẠO MỚI — không đụng mật khẩu em đã đổi)
//                    custom claims { hs:true, lop:'A1C', lops:'A1C,NNTNGK9', msId:123 }  (luật Firestore đọc)
//   · Firestore nwUsers/hs_<id>: hồ sơ (ten, tenThuong, lop, cacLop, vaiTro 'hs', phaiDoiMk:true khi mới)
//   · Firestore nwCauHinh/lop: danh sách lớp cho tab KHÁM PHÁ + trang quản lý.
// Em có mã ở HAI nơi (lớp thường + khoá) = MỘT tài khoản: uid theo bản ghi lớp thường đầu tiên,
// cacLop gồm cả hai. Em nào KHÔNG còn trong lop.json chỉ được LIỆT KÊ, không xoá (tự khoá tay nếu cần).
//
// Chạy:
//   cd tools && npm install            (một lần — cài firebase-admin, node_modules đã .gitignore)
//   node tao-tai-khoan.mjs --dry       xem sẽ làm gì, KHÔNG ghi
//   node tao-tai-khoan.mjs             tạo/cập nhật toàn bộ
//   node tao-tai-khoan.mjs --chi A1C   chỉ một lớp
//   node tao-tai-khoan.mjs --reset 123 đặt lại mật khẩu em mã số 123 về = mã đăng nhập + bắt đổi lại
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

const DUOI_EMAIL = '@id.andrewclasses.com';           // PHẢI khớp config.js DUOI_EMAIL
const LOP_JSON_MAC_DINH = 'E:\\LAP TRINH APP\\myLesson\\web\\data\\lop.json';
const KHOA_1 = path.join(process.env.LOCALAPPDATA || '', 'AndrewClasses', 'firebase-admin.json');
const KHOA_2 = 'D:\\APP AND DATA\\mySpeaking-data\\data\\firebase-admin.json';

const arg = process.argv.slice(2);
const co = (k) => arg.includes(k);
const lay = (k, mac) => { const i = arg.indexOf(k); return i >= 0 && arg[i + 1] ? arg[i + 1] : mac; };
const DRY = co('--dry');
const CHI_LOP = lay('--chi', '');
const RESET = lay('--reset', '');
const LOP_JSON = lay('--lop', LOP_JSON_MAC_DINH);

function chuanMa(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
function khongDau(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
function emailTuMa(ma) { return crypto.createHash('sha256').update(chuanMa(ma)).digest('hex').slice(0, 24) + DUOI_EMAIL; }

// ---- khoá quản trị ----
const KHOA = [KHOA_1, KHOA_2].find((p) => p && path.isAbsolute(p) && fs.existsSync(p));
if (!KHOA) { console.error('⛔ Không thấy firebase-admin.json ở:\n  ' + KHOA_1 + '\n  ' + KHOA_2); process.exit(2); }
let admin;
try { admin = require('firebase-admin'); }
catch (e) { console.error('⛔ Chưa cài firebase-admin. Chạy:  cd tools && npm install'); process.exit(2); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(KHOA, 'utf8'))) });
const auth = admin.auth();
const db = admin.firestore();
console.log('🔑 Khoá: ' + KHOA + (DRY ? '   (DRY — không ghi gì)' : ''));

// ---- đọc lop.json ----
if (!fs.existsSync(LOP_JSON)) { console.error('⛔ Không thấy ' + LOP_JSON); process.exit(2); }
const DL = JSON.parse(fs.readFileSync(LOP_JSON, 'utf8'));
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

// ---- --reset <mã số> ----
if (RESET) {
  const e = DS.find((x) => String(x.msId) === String(RESET) || x.uid === RESET);
  if (!e) { console.error('⛔ Không thấy mã số ' + RESET + ' trong lop.json'); process.exit(2); }
  console.log('🔁 Đặt lại mật khẩu ' + e.uid + ' (' + e.ten + ') về = mã đăng nhập + bắt đổi lại');
  if (!DRY) {
    await auth.updateUser(e.uid, { password: e.ma, email: emailTuMa(e.ma) });
    await db.doc('nwUsers/' + e.uid).set({ phaiDoiMk: true, capNhat: Date.now() }, { merge: true });
  }
  console.log('✅ Xong. Em vào lại bằng My ID + mật khẩu = My ID, rồi đặt mật khẩu mới.');
  process.exit(0);
}

// ---- tạo / cập nhật ----
let tao = 0, capNhat = 0, loi = 0;
for (const e of DS) {
  const email = emailTuMa(e.ma);
  const claims = { hs: true, lop: e.lop, lops: e.cacLop.join(','), msId: e.msId };
  let u = null;
  try { u = await auth.getUser(e.uid); } catch (err) { if (err.code !== 'auth/user-not-found') { console.error('  ⛔ ' + e.uid + ' ' + err.message); loi++; continue; } }
  try {
    if (!u) {
      console.log('  ➕ tạo ' + e.uid + '  ' + e.ten + '  [' + e.cacLop.join(',') + ']');
      if (!DRY) {
        await auth.createUser({ uid: e.uid, email, password: e.ma, displayName: e.ten, emailVerified: false });
        await auth.setCustomUserClaims(e.uid, claims);
        await db.doc('nwUsers/' + e.uid).set({
          uid: e.uid, ten: e.ten, tenThuong: khongDau(e.ten), lop: e.lop, cacLop: e.cacLop, vaiTro: 'hs', msId: e.msId,
          sinhNhat: e.sinhNhat,
          anh: '', bia: '', gioiThieu: '', phaiDoiMk: true, khoa: false, luc: Date.now(), capNhat: Date.now()
        }, { merge: true });
      }
      tao++;
    } else {
      const doiEmail = u.email !== email;      // thầy đổi mã đăng nhập của em ⇒ email giả đổi theo
      const cu = u.customClaims || {};
      const doiClaim = cu.lop !== claims.lop || cu.lops !== claims.lops || cu.hs !== true;
      const doiTen = u.displayName !== e.ten;
      if (doiEmail || doiClaim || doiTen) console.log('  ✏️ cập nhật ' + e.uid + '  ' + e.ten + (doiEmail ? ' [mã đổi]' : '') + (doiClaim ? ' [lớp đổi → ' + claims.lops + ']' : '') + (doiTen ? ' [tên đổi]' : ''));
      if (!DRY) {
        if (doiEmail || doiTen) await auth.updateUser(e.uid, { email, displayName: e.ten });
        if (doiClaim) await auth.setCustomUserClaims(e.uid, claims);
        // Hồ sơ: chỉ cập nhật các trường do myStudent quản (KHÔNG đụng anh/bia/gioiThieu/phaiDoiMk/khoa)
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
