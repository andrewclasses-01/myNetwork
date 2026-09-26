// ═══════════════════════════════════════════════════════════════════════════
// kiem-luat.mjs — KIỂM LUẬT FIRESTORE myNetwork BẰNG PHÉP THỬ THẬT (sau khi thầy Publish)
//
// Tạo 2 tài khoản thử ZTEST (hs_ztest1 lớp ZTEST, hs_ztest2 lớp ZTEST, hs_ztest3 lớp ZTEST2) bằng
// khoá quản trị, lấy ID token thật qua REST Auth (signInWithPassword), rồi bắn các phép ghi/đọc
// bằng Firestore REST với token đó — đúng như trình duyệt sẽ làm. Cuối cùng DỌN SẠCH dữ liệu thử.
// (Nếp "test đầu độc CSDL thật": mọi mã thử bắt đầu bằng ZTEST/ztest, dọn xong mới thoát.)
//
//   cd tools && node kiem-luat.mjs
// ═══════════════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

const PROJECT = 'aword-70dae';
const API_KEY = 'AIzaSyAV_yoyAQM2fKKdOsJyuAxxf4AN7MsF7XY';
const DUOI = '@id.andrewclasses.com';
const KHOA = [path.join(process.env.LOCALAPPDATA || '', 'AndrewClasses', 'firebase-admin.json'), 'D:\\APP AND DATA\\mySpeaking-data\\data\\firebase-admin.json'].find((p) => p && fs.existsSync(p));
if (!KHOA) { console.error('⛔ Không thấy firebase-admin.json'); process.exit(2); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(KHOA, 'utf8'))) });
const auth = admin.auth(); const db = admin.firestore();
const GOC = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const emailTuMa = (ma) => crypto.createHash('sha256').update(ma).digest('hex').slice(0, 24) + DUOI;
const TK = [
  { uid: 'hs_ztest1', ma: 'ZTEST1', ten: 'ZTEST MỘT', lop: 'ZTEST' },
  { uid: 'hs_ztest2', ma: 'ZTEST2', ten: 'ZTEST HAI', lop: 'ZTEST' },
  { uid: 'hs_ztest3', ma: 'ZTEST3', ten: 'ZTEST BA', lop: 'ZTEST2' }
];
async function taoTk(t) {
  try { await auth.deleteUser(t.uid); } catch (e) { }
  await auth.createUser({ uid: t.uid, email: emailTuMa(t.ma), password: t.ma + 'mk' });
  await auth.setCustomUserClaims(t.uid, { hs: true, lop: t.lop, lops: t.lop, msId: 0 });
  await db.doc('nwUsers/' + t.uid).set({ uid: t.uid, ten: t.ten, tenThuong: t.ten.toLowerCase(), lop: t.lop, cacLop: [t.lop], vaiTro: 'hs', anh: '', bia: '', gioiThieu: '', phaiDoiMk: false, khoa: false, luc: Date.now(), capNhat: Date.now() });
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: emailTuMa(t.ma), password: t.ma + 'mk', returnSecureToken: true }) });
  const j = await r.json(); if (!j.idToken) throw new Error('không lấy được token ' + JSON.stringify(j));
  t.token = j.idToken; return t;
}
// Đổi JSON thường → Firestore REST value
function fv(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(fv) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fv(x)])) } };
}
async function goi(t, method, duong, body, query) {
  const r = await fetch(GOC + duong + (query || ''), { method, headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t.token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return r.status;
}
const KQ = []; function kiem(ten, duoc, mong) { const ok = duoc === mong; KQ.push(ok); console.log((ok ? '  ✅ ' : '  ❌ ') + ten + '  →  ' + duoc + (ok ? '' : '  (mong ' + mong + ')')); }

try {
  console.log('🔧 Tạo 3 tài khoản thử…');
  const [a, b, c] = await Promise.all(TK.map(taoTk));
  const doc = (o) => ({ fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fv(v)])) });
  const bai = { uid: a.uid, tacGia: { uid: a.uid, ten: a.ten, anh: '', lop: a.lop, vaiTro: 'hs' }, chu: 'ZTEST bài', anh: [], pham: 'mang', lop: a.lop, luc: Date.now(), an: false, ghim: false, camXuc: {}, soBinhLuan: 0, soChiaSe: 0, chiaSeTu: null, goc: null };

  console.log('\n📝 nwPosts');
  kiem('không phiên: đọc nwPosts', await goi(null, 'GET', '/nwPosts?pageSize=1'), 403);
  kiem('A tạo bài (đúng uid)', await goi(a, 'PATCH', '/nwPosts/ZTEST_bai', doc(bai)), 200);
  kiem('B tạo bài giả uid A', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai2', doc({ ...bai, uid: a.uid })), 403);
  kiem('B tạo bài ghim (không phải thầy)', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai3', doc({ ...bai, uid: b.uid, ghim: true })), 403);
  kiem('B thả cảm xúc ô của mình', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai', doc({ camXuc: { [b.uid]: 'tim' } }), '?updateMask.fieldPaths=camXuc.' + b.uid), 200);
  kiem('B thả cảm xúc GIẢ ô của A', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai', doc({ camXuc: { [a.uid]: 'tim' } }), '?updateMask.fieldPaths=camXuc.' + a.uid), 403);
  kiem('B sửa chữ bài của A', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai', doc({ chu: 'hack' }), '?updateMask.fieldPaths=chu'), 403);
  kiem('A sửa chữ bài của mình', await goi(a, 'PATCH', '/nwPosts/ZTEST_bai', doc({ chu: 'sửa' }), '?updateMask.fieldPaths=chu'), 200);
  kiem('B ẩn bài (không phải thầy)', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai', doc({ an: true }), '?updateMask.fieldPaths=an'), 403);
  kiem('B bình luận', await goi(b, 'PATCH', '/nwPosts/ZTEST_bai/binhLuan/ZTEST_bl', doc({ uid: b.uid, tacGia: { uid: b.uid, ten: b.ten, anh: '', lop: b.lop, vaiTro: 'hs' }, chu: 'hi', anh: '', luc: Date.now(), camXuc: {} })), 200);
  kiem('C xoá bình luận của B', await goi(c, 'DELETE', '/nwPosts/ZTEST_bai/binhLuan/ZTEST_bl'), 403);
  kiem('B xoá bài của A', await goi(b, 'DELETE', '/nwPosts/ZTEST_bai'), 403);

  console.log('\n💬 nwChats');
  const idAB = a.uid < b.uid ? a.uid + '__' + b.uid : b.uid + '__' + a.uid;
  const idAC = a.uid < c.uid ? a.uid + '__' + c.uid : c.uid + '__' + a.uid;
  const phong = (x, y, id) => ({ loai: 'rieng', ten: '', thanhVien: [x.uid, y.uid].sort(), tv: {}, taoBoi: x.uid, luc: Date.now(), capNhat: Date.now(), tinCuoi: null, docLuc: {} });
  kiem('A mở phòng với B (cùng lớp)', await goi(a, 'PATCH', '/nwChats/' + idAB, doc(phong(a, b))), 200);
  kiem('A mở phòng với C (KHÁC lớp)', await goi(a, 'PATCH', '/nwChats/' + idAC, doc(phong(a, c))), 403);
  kiem('A gửi tin vào phòng AB', await goi(a, 'PATCH', '/nwChats/' + idAB + '/tin/ZTEST_t1', doc({ uid: a.uid, ten: a.ten, anh: '', chu: 'hello', hinh: '', luc: Date.now() })), 200);
  kiem('C đọc tin phòng AB', await goi(c, 'GET', '/nwChats/' + idAB + '/tin/ZTEST_t1'), 403);
  kiem('C gửi tin vào phòng AB', await goi(c, 'PATCH', '/nwChats/' + idAB + '/tin/ZTEST_t2', doc({ uid: c.uid, ten: c.ten, anh: '', chu: 'xâm nhập', hinh: '', luc: Date.now() })), 403);
  kiem('B đọc phòng AB', await goi(b, 'GET', '/nwChats/' + idAB), 200);

  console.log('\n🔔 thông báo · hồ sơ · báo cáo');
  kiem('B gửi thông báo cho A (tu = B)', await goi(b, 'PATCH', '/nwUsers/' + a.uid + '/thongBao/ZTEST_tb', doc({ loai: 'camXuc', tu: b.uid, tuTen: b.ten, tuAnh: '', chu: '', link: '', luc: Date.now(), daDoc: false })), 200);
  kiem('B gửi thông báo giả tu = A', await goi(b, 'PATCH', '/nwUsers/' + a.uid + '/thongBao/ZTEST_tb2', doc({ loai: 'camXuc', tu: a.uid, tuTen: '', tuAnh: '', chu: '', link: '', luc: Date.now(), daDoc: false })), 403);
  kiem('B đọc thông báo của A', await goi(b, 'GET', '/nwUsers/' + a.uid + '/thongBao/ZTEST_tb'), 403);
  kiem('A sửa giới thiệu của mình', await goi(a, 'PATCH', '/nwUsers/' + a.uid, doc({ gioiThieu: 'xin chào' }), '?updateMask.fieldPaths=gioiThieu'), 200);
  kiem('A sửa TÊN của mình (cấm)', await goi(a, 'PATCH', '/nwUsers/' + a.uid, doc({ ten: 'HACK' }), '?updateMask.fieldPaths=ten'), 403);
  kiem('A tự khoá/mở khoá (cấm)', await goi(a, 'PATCH', '/nwUsers/' + a.uid, doc({ khoa: true }), '?updateMask.fieldPaths=khoa'), 403);
  kiem('B báo cáo bài', await goi(b, 'PATCH', '/nwBaoCao/ZTEST_bc', doc({ tu: b.uid, tuTen: b.ten, baiId: 'ZTEST_bai', uidBai: a.uid, tenBai: a.ten, lyDo: 'khac', chu: '', tomTat: '', luc: Date.now(), trangThai: 'moi' })), 200);
  kiem('B đọc kho báo cáo (chỉ thầy)', await goi(b, 'GET', '/nwBaoCao/ZTEST_bc'), 403);
  kiem('B ghi nwCauHinh (chỉ thầy)', await goi(b, 'PATCH', '/nwCauHinh/ZTEST', doc({ ds: [] })), 403);
} catch (e) { console.error('⛔ Lỗi chạy thử: ' + (e.stack || e)); }
finally {
  console.log('\n🧹 Dọn dữ liệu thử…');
  for (const t of TK) { try { await auth.deleteUser(t.uid); } catch (e) { } try { await db.doc('nwUsers/' + t.uid).delete(); } catch (e) { } }
  const xoaCay = async (ref) => { const s = await ref.listDocuments(); for (const d of s) { const sub = await d.listCollections(); for (const c of sub) await xoaCay(c); await d.delete(); } };
  for (const p of ['nwPosts/ZTEST_bai', 'nwPosts/ZTEST_bai2', 'nwPosts/ZTEST_bai3', 'nwBaoCao/ZTEST_bc', 'nwCauHinh/ZTEST']) { try { const d = db.doc(p); for (const c of await d.listCollections()) await xoaCay(c); await d.delete(); } catch (e) { } }
  for (const id of ['hs_ztest1__hs_ztest2', 'hs_ztest1__hs_ztest3']) { try { const d = db.doc('nwChats/' + id); for (const c of await d.listCollections()) await xoaCay(c); await d.delete(); } catch (e) { } }
  try { for (const c of await db.doc('nwUsers/hs_ztest1').listCollections()) await xoaCay(c); } catch (e) { }
  const dat = KQ.filter(Boolean).length;
  console.log('\n' + (dat === KQ.length ? '✅' : '❌') + ' ' + dat + '/' + KQ.length + ' phép thử đạt.');
  process.exit(dat === KQ.length ? 0 : 1);
}
