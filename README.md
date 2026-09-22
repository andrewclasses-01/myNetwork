# myNetwork — mạng xã hội riêng của Andrew Classes

Trang web tĩnh (HTML/CSS/JS thuần, không build) cho ~500 học sinh Andrew Classes: **trang cá nhân ·
bảng tin · đăng bài/ảnh · cảm xúc · bình luận · chia sẻ · tin nhắn riêng · nhóm chat · khám phá**.
Dùng chung Firebase `aword-70dae` với AWord/myLesson/mySpeaking; sẽ gắn vào myLesson web
(andrewclasses.com) thành một hệ có 5 tab **TRANG BÀI TẬP · BẢNG TIN · TIN NHẮN · KHÁM PHÁ · CÁ NHÂN**.

Phiên mới đọc **`BAN GIAO.md`** trước (trạng thái + bản đồ file + việc còn mở), rồi **`KE HOACH XAY DUNG.md`** (lý do từng quyết định).

⭐ Thầy chốt 20/09: **phiên sau THIẾT KẾ THÊM giao diện trước, gắn chức năng thật sau** — chưa dán luật, chưa tạo tài khoản.

## Bản hiện tại — v0.1.0 (20/09/2026) · ⬜ CHƯA LIVE, chưa dán luật, chưa tạo tài khoản

| File | Việc |
|---|---|
| `index.html` | Đăng nhập My ID + mật khẩu · đặt mật khẩu lần đầu · nút Google cho thầy |
| `bangtin.html` | Ô soạn (chữ + tối đa 4 ảnh + phạm vi Mọi người/Chỉ lớp) + dòng bài phân trang + cột "Lớp của em" |
| `tinnhan.html` | Danh sách phòng · phòng chat · nhắn mới · tạo nhóm · gửi ảnh · thành viên/rời nhóm |
| `khampha.html` | Tìm theo tên (bỏ dấu) · lọc theo lớp · (lời mời kết bạn khi bật `BAT_KET_BAN`) |
| `canhan.html?uid=` | Ảnh bìa · avatar · giới thiệu · bài của người đó · nút Nhắn tin |
| `baidang.html?id=` | Một bài + bình luận (đích của thông báo/chia sẻ) |
| `quanly.html` | Thầy: báo cáo · bài đã ẩn · từ cấm · khoá tài khoản · danh sách lớp |
| `js/loi.js` | Lõi: Firebase (một app), phiên, hồ sơ đệm, nén ảnh, toast/pop-up/menu, từ cấm, thông báo |
| `js/thanh.js` | Thanh 5 tab + chuông + avatar + cửa vào trang + 2 kênh nghe dùng chung |
| `js/bai.js` | Thẻ bài, cảm xúc (giữ nút ra bảng 6 loại), bình luận, chia sẻ, báo cáo, sửa/xoá/ẩn/ghim |
| `js/chat.js` | Tin nhắn riêng + nhóm |
| `tai-lieu/` | Luật Firestore (7 khối) · luật Storage · chỉ mục |
| `tools/` | `tao-tai-khoan.mjs` (tạo/cập nhật/đặt lại mật khẩu) · `kiem-luat.mjs` (28 phép thử thật, tự dọn) |

## Chạy thử trên máy

```bash
python -m http.server 8795 --directory "E:/LAP TRINH APP/myNetwork"
```
Mở `http://localhost:8795/`. Muốn xem giao diện KHÔNG cần tài khoản: thêm `?thu=1`
(`bangtin.html?thu=1`, `tinnhan.html?thu=1`, `canhan.html?thu=1&uid=hs_1`, `baidang.html?thu=1&id=m1`)
— dữ liệu mẫu, không ghi gì. Cửa này chỉ mở trên localhost.

## Việc thầy cần làm trước khi học sinh vào được (theo thứ tự)

1. **Dán luật Firestore** — `tai-lieu/LUAT FIRESTORE CAN DAN (myNetwork).md` (7 khối, chỉ THÊM).
2. **Dán luật Storage** — `tai-lieu/LUAT STORAGE CAN DAN (myNetwork).md`.
3. **Tạo 4 chỉ mục** — `tai-lieu/CHI MUC FIRESTORE.md` (hoặc bấm link trong lỗi console).
4. **Authentication → Sign-in method → bật Email/Password** (Google đã bật từ AWord).
   Authentication → Settings → Authorized domains: thêm `andrewclasses-01.github.io` (và domain riêng sau).
5. **Tạo tài khoản học sinh** (máy có khoá quản trị):
   ```bash
   cd "E:/LAP TRINH APP/myNetwork/tools" && npm install && node tao-tai-khoan.mjs --dry
   ```
   xem ổn rồi bỏ `--dry`. Em vào lần đầu bằng **My ID + mật khẩu = My ID**, trang ép đặt mật khẩu mới.
   Quên mật khẩu: `node tao-tai-khoan.mjs --reset <mã số>`.
6. Sau đó Claude chạy `node kiem-luat.mjs` để kiểm luật bằng phép thử thật rồi mời thầy bấm tay.

## Luật riêng của repo này

- **Đọc Firestore là tiền** — thêm phép đọc nào cũng nhẩm "× 500 người × 3 lượt/ngày".
- Mọi kho tiền tố `nw`; không đụng kho AWord/myLesson/mySpeaking.
- Sửa css/js ⇒ tăng `?v=` ở 7 trang + bump `PHIEN_BAN` trong `config.js`.
- Không bao giờ commit `firebase-admin.json`, `lop.json`.
- Test với dữ liệu tiền tố `ZTEST`, dọn xong mới thoát.
