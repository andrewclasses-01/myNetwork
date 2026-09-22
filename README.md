# myNetwork — mạng xã hội riêng của Andrew Classes

Trang web tĩnh (HTML/CSS/JS thuần, không build) cho ~500 học sinh Andrew Classes: **trang cá nhân ·
bảng tin · đăng bài/ảnh · cảm xúc · bình luận · chia sẻ · tin nhắn riêng · nhóm chat · khám phá**.
Dùng chung Firebase `aword-70dae` với AWord/myLesson/mySpeaking; sẽ gắn vào myLesson web
(andrewclasses.com) thành một hệ có 5 tab **TRANG BÀI TẬP · BẢNG TIN · TIN NHẮN · KHÁM PHÁ · CÁ NHÂN**.

Phiên mới đọc **`BAN GIAO.md`** trước (trạng thái + bản đồ file + việc còn mở), rồi **`KE HOACH XAY DUNG.md`** (lý do từng quyết định).

⭐ Thầy chốt 20/09: **phiên sau THIẾT KẾ THÊM giao diện trước, gắn chức năng thật sau** — chưa dán luật, chưa tạo tài khoản.

## Bản hiện tại — v0.3.0 (22/09/2026) · ⬜ CHƯA LIVE, chưa dán luật, chưa tạo tài khoản

### v0.3.0 — 22/09/2026: TRANG CÁ NHÂN theo mẫu v8 + 7 CẢM XÚC FACEBOOK 2D + icon tin nhắn mới
- **canhan.html**: bìa rộng 240px (điện thoại 160) · avatar 128px chồng góc trái + huy hiệu sao · tên · lớp (chip từng lớp) · "Tham gia m/yyyy" (từ `luc`)
  · câu giới thiệu; **trang mình**: nút "Đổi ảnh bìa" góc dưới phải bìa, nút máy ảnh trên avatar, "Sửa giới thiệu" (sửa được CÂU GIỚI THIỆU + SỞ THÍCH `soThich`,
  lớp/ngày tham gia tự động); **trang bạn**: 2 nút icon tròn **Nhắn tin** (+ **Kết bạn** khi bật cờ) ở **góc dưới phải bìa**; không dải thành tích (thầy bỏ).
  3 tab **căn giữa**: BÀI VIẾT · ẢNH (lưới 3 cột, gom ảnh từ bài đã tải — `dongBai({sauTai})` mới) · GIỚI THIỆU (lớp đang/cũng học · tham gia · sở thích · câu giới thiệu).
- **Cảm xúc**: đổi sang **7 kiểu đúng thứ tự Facebook, vẽ 2D phẳng** (thầy chê bản bóng khối): `like` Thích · `tim` Yêu thích · `cuoi` Cười (ra nước mắt) · `haha` · `ngac` Oa · `khoc` Buồn · `gian` Phẫn nộ.
  Bỏ `gaCon` (chưa có dữ liệu thật). Sprite trong `NW.napCamXuc()`.
- **Icon TIN NHẮN** đổi thành bong bóng tròn 3 chấm (`IC.tinNhan`) — dùng ở tab, nút nhắn tin, cột "Lớp của em".
- Đã thử `?thu=1`: canhan (mình + bạn), bangtin (bảng chọn 7, chọn Cười), 375px; console sạch.


### v0.2.0 — 22/09/2026: GIAO DIỆN THANH + CẢM XÚC theo mẫu thầy duyệt (mẫu v1→v4 ở `D:\OTHERS\CLAUDE\myNetwork - thiet ke\`)
- **Thanh trên**: TRÁI avatar EM + huy hiệu sao (chép y myLesson `.av.me` + `.sao-hieu`, sao = 0 vì chưa có kho) → bấm = **trang cá nhân**;
  GIỮA 5 **icon không chữ**, thứ tự thầy chốt *trang bài tập · khám phá · tin nhắn · bảng tin · thông báo*, icon đang chọn **sáng lên**
  (nền tròn + quầng, bỏ gạch chân), rê chuột hiện tên; PHẢI nút **☰ tròn** → **sidebar trượt từ phải** (đầu: avatar·tên·lớp · ô VÍ SAO · trang cá nhân · đổi mật khẩu · trang bài tập · quản lý (thầy) · đăng xuất).
  Chuông = icon trong 5 icon, bấm mở hộp thả ngay dưới. **Điện thoại: cả thanh xuống ĐÁY** (avatar · 5 icon · ☰), phía trên không còn thanh.
- **Bộ cảm xúc mới** thay emoji hệ thống: 6 huy hiệu tròn vẽ SVG (sprite `NW.napCamXuc()` trong `loi.js`, `NW.cxHtml(mã)`), giống nhau mọi máy —
  dùng ở cụm đếm (xếp chồng viền trắng), nút Thích (đổi màu theo loại + tên: Yêu/Thích/Haha/Wow/Buồn/Gà con), bảng chọn (giữ nút/rê chuột), bình luận, danh sách "ai thả".
  Chữ thông báo vẫn dùng ký tự emoji (`ky`) vì là văn bản.
- **Ô soạn thu gọn**: một dòng "Em đang nghĩ gì, TÊN?" + nút ảnh; bấm mới bung; phạm vi chọn bằng **menu thả** 2 mục có giải thích.
- ⛔ **Vá 2 lỗi có từ v0.1.0 (lộ ra khi bấm chuột thật trên bàn thử):** (1) lớp `.phu` dùng cho CẢ dòng giờ dưới tên lẫn tấm phủ toàn màn
  ⇒ mỗi thẻ bài thành một tấm phủ vô hình che cả trang, chữ giờ bị ném ra mép trái — đổi tấm phủ thành `.phu-nen` (nw.css + loi.js + thanh.js + bai.js);
  (2) khối bài gốc là `<a class="bai-goc">` chứa `<a>` tên tác giả ⇒ HTML cấm lồng, ruột rơi ra ngoài khung — đổi thành `<div role="link" data-goc>` + bấm bằng JS.
- Đã thử trên bàn thử `?thu=1` cả 5 trang (console sạch, bấm chuột thật: ☰, chuông, ô soạn, menu phạm vi, bảng cảm xúc, chọn Haha) + 375px không tràn.
- Bẫy khi build: `.tabs` fixed `bottom:0` nằm trong `.thanh` có `backdrop-filter` thì neo vào đáy THANH TRÊN ⇒ điện thoại dời CẢ `.thanh` xuống đáy.

### v0.1.0 — 20/09/2026: dựng khung 7 trang + lõi + luật + công cụ

| File | Việc |
|---|---|
| `index.html` | Đăng nhập My ID + mật khẩu · đặt mật khẩu lần đầu · nút Google cho thầy |
| `bangtin.html` | Ô soạn (chữ + tối đa 4 ảnh + phạm vi Mọi người/Chỉ lớp) + dòng bài phân trang + cột "Lớp của em" |
| `tinnhan.html` | Danh sách phòng · phòng chat · nhắn mới · tạo nhóm · gửi ảnh · thành viên/rời nhóm |
| `khampha.html` | Tìm theo tên (bỏ dấu) · lọc theo lớp · (lời mời kết bạn khi bật `BAT_KET_BAN`) |
| `canhan.html?uid=` | Bìa rộng · avatar+sao · giới thiệu/sở thích · tab BÀI VIẾT/ẢNH/GIỚI THIỆU · trang bạn: nút icon Nhắn tin/Kết bạn trong bìa |
| `baidang.html?id=` | Một bài + bình luận (đích của thông báo/chia sẻ) |
| `quanly.html` | Thầy: báo cáo · bài đã ẩn · từ cấm · khoá tài khoản · danh sách lớp |
| `js/loi.js` | Lõi: Firebase (một app), phiên, hồ sơ đệm, nén ảnh, toast/pop-up/menu, từ cấm, thông báo |
| `js/thanh.js` | Thanh: avatar+sao (= cá nhân) · 5 icon · ☰ sidebar phải + hộp thông báo + cửa vào trang + 2 kênh nghe dùng chung |
| `js/bai.js` | Ô soạn thu gọn, thẻ bài, cảm xúc huy hiệu SVG (giữ nút ra bảng 6 loại), bình luận, chia sẻ, báo cáo, sửa/xoá/ẩn/ghim |
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
