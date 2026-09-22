# LUẬT FIRESTORE CẦN DÁN — myNetwork (20/09/2026)

> ⬜ **CHƯA DÁN.** Chưa dán thì trang mạng xã hội mở được, đăng nhập được (Auth), nhưng MỌI phép
> đọc/ghi kho đều báo *"Kho từ chối"* (permission-denied). Không ảnh hưởng gì tới AWord/myLesson/
> mySpeaking — mọi khối mới đều bắt đầu bằng `nw`, không đụng khối cũ.
>
> ⛔ Claude **không tự publish luật được** — khoá quản trị chỉ đọc được luật. Cách dán an toàn bằng
> Claude in Chrome đã ghi ở bộ nhớ `bay-sua-luat-firebase-console` (CodeMirror `view.dispatch`).
> Khung soạn luật: **KHÔNG Ctrl+F / Ctrl+Z / Ctrl+A**; lỡ tay thì Discard.

## Làm theo 5 bước

1. https://console.firebase.google.com → project **aword-70dae** → Build → **Firestore Database** → thẻ **Rules**.
2. Tìm hàm `function laThay() { ... }` (gói bảo mật C, 02/09/2026 — **giữ nguyên**, các khối dưới dùng lại nó).
3. Dán **Khối 0** (hàm phụ) ngay DƯỚI `laThay()`.
4. Dán **Khối 1 → 7** vào trong `match /databases/{database}/documents { ... }`, cùng cấp với `classChat`, `lessonHan`…
   ⛔ Chỉ THÊM, không xoá khối nào đang có.
5. **Publish**. Sau đó Claude chạy `node tools/kiem-luat.mjs` để kiểm 12 phép thử (ghi có/không phiên).

---

## Khối 0 — HÀM PHỤ (đặt dưới `laThay()`)

```
    // ═══ myNetwork (20/09/2026) — mạng xã hội riêng. Mọi kho bắt đầu bằng `nw`. ═══
    function nwVao() { return request.auth != null; }
    function nwToi() { return request.auth.uid; }
    // Các lớp của em — claim `lops` = "A1C,NNTNGK9" do tools/tao-tai-khoan.mjs ký vào token.
    function nwLops() {
      return ('lops' in request.auth.token) ? request.auth.token.lops.split(',') : [];
    }
    function nwHoSo(u) { return get(/databases/$(database)/documents/nwUsers/$(u)).data; }
    function nwCungLop(u) { return nwHoSo(u).cacLop.hasAny(nwLops()); }
    function nwLaGv(u) { return nwHoSo(u).vaiTro == 'gv'; }
    function nwMaCap(a, b) { return a < b ? a + '__' + b : b + '__' + a; }
    // Bạn bè đã đồng ý (kho nwBanBe) — sẵn cho tương lai khi bật kết bạn toàn mạng.
    function nwBanBe(u) {
      return exists(/databases/$(database)/documents/nwBanBe/$(nwMaCap(nwToi(), u)))
        && get(/databases/$(database)/documents/nwBanBe/$(nwMaCap(nwToi(), u))).data.trangThai == 'ok';
    }
    // Ai nhắn riêng được với ai: thầy ↔ mọi người · cùng lớp · bạn bè.
    function nwNhanDuoc(u) { return laThay() || nwLaGv(u) || nwCungLop(u) || nwBanBe(u); }
```

## Khối 1 — HỒ SƠ `nwUsers` (+ hộp thông báo)

```
    match /nwUsers/{uid} {
      allow read: if nwVao();
      // Học sinh do công cụ (khoá quản trị) tạo; chỉ THẦY tự tạo hồ sơ của mình khi vào lần đầu.
      allow create: if laThay() && uid == nwToi() && request.resource.data.vaiTro == 'gv';
      allow update: if nwVao() && (
           (uid == nwToi() && request.resource.data.diff(resource.data).affectedKeys()
               .hasOnly(['anh', 'bia', 'gioiThieu', 'soThich', 'phaiDoiMk', 'capNhat', 'hoatDongLuc'])   // v0.5.0: hoatDongLuc = nhịp online
             && request.resource.data.gioiThieu.size() <= 300)
        || (laThay() && request.resource.data.diff(resource.data).affectedKeys()
               .hasOnly(['khoa', 'canhBao', 'capNhat', 'ten', 'anh', 'bia', 'gioiThieu'])));
      allow delete: if false;

      match /thongBao/{id} {
        allow read, update, delete: if nwVao() && uid == nwToi();
        allow create: if nwVao() && request.resource.data.tu == nwToi()
          && request.resource.data.keys().hasOnly(['loai', 'tu', 'tuTen', 'tuAnh', 'chu', 'link', 'luc', 'daDoc'])
          && request.resource.data.chu is string && request.resource.data.chu.size() <= 200
          && request.resource.data.luc is number;
      }
    }
```

## Khối 2 — BÀI ĐĂNG `nwPosts` (+ bình luận)

```
    match /nwPosts/{id} {
      // v0.4.0: bài "Chỉ mình tôi" chỉ tác giả + thầy đọc được; các phạm vi khác lọc ở giao diện (Bai.xemDuoc)
      allow read: if nwVao() && (resource.data.pham != 'minh' || resource.data.uid == nwToi() || laThay());
      allow create: if nwVao() && request.resource.data.uid == nwToi()
        && request.resource.data.keys().hasOnly(['uid', 'tacGia', 'chu', 'anh', 'pham', 'lop', 'luc',
             'an', 'ghim', 'camXuc', 'soBinhLuan', 'soChiaSe', 'chiaSeTu', 'goc', 'gan', 'camGiac'])   // v0.5.0: gan (gắn thẻ) + camGiac
        && request.resource.data.chu is string && request.resource.data.chu.size() <= 2000
        && request.resource.data.anh is list && request.resource.data.anh.size() <= 10                // v0.5.0: 10 ảnh
        && (!('gan' in request.resource.data) || (request.resource.data.gan is list && request.resource.data.gan.size() <= 20))
        && request.resource.data.pham in ['mang', 'ban', 'lop', 'minh']   // v0.4.0: 4 phạm vi
        && request.resource.data.an == false
        && (request.resource.data.ghim == false || laThay())
        && request.resource.data.camXuc.size() == 0
        && request.resource.data.soBinhLuan == 0 && request.resource.data.soChiaSe == 0
        && request.resource.data.luc is number;
      allow update: if nwVao() && (
           // tác giả sửa chữ / ảnh / phạm vi
           (resource.data.uid == nwToi()
             && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['chu', 'anh', 'pham', 'suaLuc'])
             && request.resource.data.chu.size() <= 2000)
           // ai cũng thả/gỡ cảm xúc — nhưng CHỈ ô của chính mình trong map camXuc
        || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['camXuc'])
             && request.resource.data.camXuc.diff(resource.data.camXuc).affectedKeys().hasOnly([nwToi()]))
           // đếm bình luận: chỉ ±1 · đếm chia sẻ: chỉ +1
        || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['soBinhLuan'])
             && (request.resource.data.soBinhLuan - resource.data.soBinhLuan == 1
                 || (request.resource.data.soBinhLuan < resource.data.soBinhLuan && request.resource.data.soBinhLuan >= 0)))   // v0.5.0: xoá bình luận gốc kéo theo N trả lời
        || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['soChiaSe'])
             && request.resource.data.soChiaSe == resource.data.soChiaSe + 1)
           // thầy: ẩn / hiện / ghim
        || (laThay() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['an', 'ghim', 'lyDoAn'])));
      allow delete: if nwVao() && (resource.data.uid == nwToi() || laThay());

      match /binhLuan/{cid} {
        allow read: if nwVao();
        allow create: if nwVao() && request.resource.data.uid == nwToi()
          && request.resource.data.keys().hasOnly(['uid', 'tacGia', 'chu', 'luc', 'camXuc', 'anh', 'traLoiCho'])   // v0.5.0: ảnh + trả lời 1 cấp
          && request.resource.data.chu is string && request.resource.data.chu.size() <= 500
          && request.resource.data.anh is string && request.resource.data.anh.size() <= 500
          && (request.resource.data.chu.size() > 0 || request.resource.data.anh.size() > 0)
          && request.resource.data.luc is number;
        allow update: if nwVao() && (
             (resource.data.uid == nwToi()
               && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['chu', 'suaLuc']))
          || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['camXuc'])
               && request.resource.data.camXuc.diff(resource.data.camXuc).affectedKeys().hasOnly([nwToi()])));
        allow delete: if nwVao() && (resource.data.uid == nwToi() || laThay()
          || get(/databases/$(database)/documents/nwPosts/$(id)).data.uid == nwToi());
      }
    }
```

## Khối 3 — BÁO CÁO `nwBaoCao`

```
    match /nwBaoCao/{id} {
      allow read, update, delete: if laThay();
      allow create: if nwVao() && request.resource.data.tu == nwToi()
        && request.resource.data.keys().hasOnly(['tu', 'tuTen', 'baiId', 'uidBai', 'tenBai', 'lyDo', 'chu', 'tomTat', 'luc', 'trangThai'])
        && request.resource.data.chu.size() <= 300 && request.resource.data.trangThai == 'moi';
    }
```

## Khối 4 — PHÒNG CHAT `nwChats` (+ tin)

```
    match /nwChats/{id} {
      allow read: if nwVao() && (nwToi() in resource.data.thanhVien || laThay());
      allow create: if nwVao()
        && nwToi() in request.resource.data.thanhVien
        && request.resource.data.taoBoi == nwToi()
        && request.resource.data.loai in ['rieng', 'nhom']
        && (request.resource.data.loai == 'rieng' || laThay())   // v0.6.0: CHỈ THẦY tạo nhóm
        && request.resource.data.thanhVien.size() >= 2
        && request.resource.data.thanhVien.size() <= 30
        && (request.resource.data.loai == 'nhom'
            || (request.resource.data.thanhVien.size() == 2
                && id == request.resource.data.thanhVien[0] + '__' + request.resource.data.thanhVien[1]
                && nwNhanDuoc(request.resource.data.thanhVien[0] == nwToi()
                                ? request.resource.data.thanhVien[1] : request.resource.data.thanhVien[0])));
      // Thành viên: cập nhật tin cuối / mốc đã đọc / cờ riêng từng em (tat · chuaDoc · anLuc — v0.6.0);
      // nhóm: CHỈ THẦY đổi tên, thêm/bớt thành viên (v0.6.0: học sinh không rời nhóm thầy lập).
      allow update: if nwVao() && (nwToi() in resource.data.thanhVien || laThay())
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['tinCuoi', 'capNhat', 'docLuc', 'ten', 'thanhVien', 'tv', 'anh', 'tat', 'chuaDoc', 'anLuc'])
        && (laThay()
            || !request.resource.data.diff(resource.data).affectedKeys().hasAny(['thanhVien', 'tv', 'ten', 'anh']))
        // cờ riêng: chỉ sửa ô của chính mình trong 3 map
        && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['tat', 'chuaDoc', 'anLuc'])
            || (request.resource.data.get('tat', {}).diff(resource.data.get('tat', {})).affectedKeys().hasOnly([nwToi()])
                && request.resource.data.get('chuaDoc', {}).diff(resource.data.get('chuaDoc', {})).affectedKeys().hasOnly([nwToi()])
                && request.resource.data.get('anLuc', {}).diff(resource.data.get('anLuc', {})).affectedKeys().hasOnly([nwToi()])));
      allow delete: if laThay();

      match /tin/{mid} {
        allow read: if nwVao()
          && (nwToi() in get(/databases/$(database)/documents/nwChats/$(id)).data.thanhVien || laThay());
        allow create: if nwVao()
          && nwToi() in get(/databases/$(database)/documents/nwChats/$(id)).data.thanhVien
          && request.resource.data.uid == nwToi()
          && request.resource.data.keys().hasOnly(['uid', 'ten', 'anh', 'chu', 'hinh', 'luc', 'camXuc', 'traLoi'])   // v0.6.0: cảm xúc + trả lời
          && request.resource.data.chu is string && request.resource.data.chu.size() <= 1000
          && (request.resource.data.chu.size() > 0 || request.resource.data.hinh.size() > 0)
          && request.resource.data.luc is number;
        // v0.6.0: ai trong phòng cũng thả/gỡ cảm xúc — CHỈ ô của mình trong map camXuc
        allow update: if nwVao()
          && nwToi() in get(/databases/$(database)/documents/nwChats/$(id)).data.thanhVien
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['camXuc'])
          && request.resource.data.get('camXuc', {}).diff(resource.data.get('camXuc', {})).affectedKeys().hasOnly([nwToi()]);
        // v0.6.0: thu hồi tin = tác giả hoặc thầy
        allow delete: if nwVao() && (resource.data.uid == nwToi() || laThay());
      }
    }
```

## Khối 5 — BẠN BÈ `nwBanBe` — v0.4.0 ĐÃ BẬT (`BAT_KET_BAN:true`): cùng lớp = bạn sẵn, khác lớp phải kết bạn

```
    match /nwBanBe/{id} {
      allow read: if nwVao() && (nwToi() in resource.data.thanhVien || laThay());
      allow create: if nwVao() && request.resource.data.tu == nwToi()
        && nwToi() in request.resource.data.thanhVien
        && request.resource.data.thanhVien.size() == 2
        && id == request.resource.data.thanhVien[0] + '__' + request.resource.data.thanhVien[1]
        && request.resource.data.trangThai == 'cho';
      // Người ĐƯỢC mời mới được đổi sang 'ok'.
      allow update: if nwVao() && nwToi() in resource.data.thanhVien && resource.data.tu != nwToi()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['trangThai', 'luc'])
        && request.resource.data.trangThai == 'ok';
      allow delete: if nwVao() && (nwToi() in resource.data.thanhVien || laThay());
    }
```

## Khối 6 — CẤU HÌNH `nwCauHinh` (từ cấm · danh sách lớp)

```
    match /nwCauHinh/{doc} {
      allow read: if nwVao();
      allow write: if laThay();
    }
```

---

## Mấy điều nên biết

- **Mọi kho `nw*` đòi đăng nhập** (`nwVao()`), khác hẳn `classChat` cũ (ai cũng đọc). Người lạ không
  đọc được bài/tin nhắn của các em.
- **Đúng người mới ghi**: bài chỉ tác giả sửa/xoá; cảm xúc chỉ đổi được ô của mình; tin nhắn phải
  là thành viên phòng; thông báo phải ký `tu` = chính mình.
- **Giới hạn đã biết** (chấp nhận ở bản đầu, ghi để sau này nâng):
  1. Bài "chỉ lớp" (`pham:'lop'`) vẫn ĐỌC được nếu em lớp khác tự gọi thẳng Firestore — trang chỉ lọc
     ở giao diện. Muốn chặt thì bảng tin phải tách 2 truy vấn + 2 chỉ mục (ghi ở KE HOACH).
  2. Nhóm chat: luật không kiểm được từng thành viên có "cùng lớp" không (rules không lặp mảng) —
     chỉ kiểm người tạo ở trong nhóm + ≤30 người. Trang chỉ cho chọn người cùng lớp/thầy.
  3. Xoá bài KHÔNG tự xoá bình luận con (Firestore không xoá đệ quy) — bình luận mồ côi không hiện
     ở đâu, chỉ chiếm chỗ; dọn định kỳ bằng công cụ nếu cần.
- `get()` trong luật tính 1 lượt đọc: mỗi tin nhắn gửi = +1 (đọc phòng), mở phòng riêng lần đầu = +1..2.
