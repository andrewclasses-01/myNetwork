# BÀN GIAO myNetwork — phiên 20/09/2026 (v0.1.0 `dc03133`)

> Phiên mới đọc file này TRƯỚC, rồi `KE HOACH XAY DUNG.md` (lý do từng quyết định), rồi `README.md`.
> Thầy chốt cuối phiên: **"thiết kế thêm trong phiên sau rồi sau đó mới gắn những chức năng thật"**
> ⇒ phiên sau là PHIÊN THIẾT KẾ GIAO DIỆN, chưa dán luật, chưa tạo tài khoản, chưa ghi kho thật.

---

## 0. Trạng thái một dòng

Khung mạng xã hội đã dựng xong ở mức "chạy được với dữ liệu mẫu": 7 trang + 4 module JS + CSS +
luật + công cụ, đã push GitHub public `andrewclasses-01/myNetwork`, Pages sống ở
`https://andrewclasses-01.github.io/myNetwork/` (mới chỉ hiện màn đăng nhập; không đăng nhập được
vì kho chưa mở). **Chưa có một lượt ghi/đọc Firestore thật nào.** Mọi kiểm tra là: cú pháp JS, bàn
thử `?thu=1` trên localhost, đo DOM 800 px + 375 px.

## 1. Bản đồ file (ai làm gì)

| File | Việc | Ghi chú cho phiên thiết kế |
|---|---|---|
| `config.js` | Tên site, phiên bản, Firebase, giới hạn chữ/ảnh, `BAT_KET_BAN`, từ cấm, cỡ nén ảnh | Đổi số ở đây, đừng gõ số cứng trong trang |
| `css/nw.css` | TOÀN BỘ giao diện: token màu/chữ, thanh tab, bố cục 2 cột, bài đăng, bình luận, chat, cá nhân, khám phá, đăng nhập, quản lý, pop-up/toast/menu | Bộ màu chép từ myLesson (`--accent #0E7C6E`, nền `#F7FAF9`, Montserrat nhúng `assets/fonts.css`) |
| `js/loi.js` | Lõi: `window.NW` — Firebase một app, đăng nhập/đổi mật khẩu/thoát, hồ sơ + đệm, icon SVG `NW.IC`, 6 cảm xúc `NW.CAM_XUC`, giờ, escape, avatar (`NW.avHtml`), toast/pop-up/hỏi/menu nhỏ, nén ảnh JPEG, tải Storage, từ cấm, gửi thông báo, `NW.laBanThu()` | Không đụng khi thiết kế, trừ thêm icon |
| `js/thanh.js` | `NW.dungThanh({tab})`: kiểm phiên → vẽ thanh 5 tab + chuông + avatar menu → mở 2 kênh nghe (thông báo, phòng chat) | Thanh tab vẽ bằng JS (`veThanh`), đổi hình thanh là sửa ở đây + CSS `.thanh/.tab` |
| `js/bai.js` | `NW.Bai.soan` (ô soạn), `NW.Bai.dung` (một thẻ bài + mọi sự kiện), `NW.Bai.dongBai` (dòng bài phân trang), `NW.Bai.mot`, `NW.Bai.mau` (3 bài mẫu bàn thử) | HTML thẻ bài sinh trong `Bai.dung` — đổi bố cục thẻ = sửa chuỗi HTML đó + CSS `.bai*` |
| `js/chat.js` | `NW.Chat.dung(hop)`: hai cột danh sách/phòng, nhắn mới, tạo nhóm, gửi ảnh, thành viên/rời nhóm; `Chat.moRieng`, `Chat.nguoiNhanDuoc` | Bàn thử có 2 phòng mẫu + 3 tin |
| `index.html` | Đăng nhập (3 màn: vào · đặt mật khẩu lần đầu · đang kiểm) | Script inline |
| `bangtin.html` | Ô soạn + dòng bài + cột phải (Lớp của em · Thầy · Nếp của mạng) | |
| `tinnhan.html` | Chỉ gọi `NW.Chat.dung` | |
| `khampha.html` | Tìm tên (tiền tố, bỏ dấu) · chip lớp · lưới người · (lời mời kết bạn khi bật cờ) | |
| `canhan.html?uid=` | Bìa · avatar (đổi được) · giới thiệu · nút Nhắn tin/Kết bạn · ô soạn (của mình) · bài của người đó | |
| `baidang.html?id=` | Một bài + bình luận mở sẵn | Đích của thông báo/chia sẻ |
| `quanly.html` | Thầy: Báo cáo · Bài đã ẩn · Từ cấm · Tài khoản (khoá) · Lớp | Không có bàn thử (cần phiên thầy) |
| `tai-lieu/LUAT FIRESTORE CAN DAN (myNetwork).md` | 7 khối luật + hàm phụ, chỉ THÊM vào bộ luật đang có | ⬜ chưa dán |
| `tai-lieu/LUAT STORAGE CAN DAN (myNetwork).md` | Mở thư mục `nw/<uid>/` | ⬜ chưa dán |
| `tai-lieu/CHI MUC FIRESTORE.md` + `firestore.indexes.json` | 4 chỉ mục ghép | ⬜ chưa tạo |
| `tools/tao-tai-khoan.mjs` | Tạo/cập nhật tài khoản Auth + `nwUsers` từ `lop.json`; `--dry` · `--chi LOP` · `--reset <mã số>` | Cần `npm install` trong `tools/` (firebase-admin) + khoá `%LOCALAPPDATA%\AndrewClasses\firebase-admin.json` |
| `tools/kiem-luat.mjs` | 28 phép thử ghi/đọc thật bằng 3 tài khoản `ZTEST`, tự dọn | Chạy SAU khi dán luật |

Cổng bàn thử đã khai trong `.claude/launch.json` của phiên Claude (thư mục `D:\OTHERS\CLAUDE`):
tên `mynetwork-web`, cổng **8795**, trỏ `E:/LAP TRINH APP/myNetwork`. Tay: `python -m http.server 8795 --directory "E:/LAP TRINH APP/myNetwork"`.

## 2. Cách xem giao diện không cần tài khoản (dùng cho phiên thiết kế)

Thêm `?thu=1` (chỉ ăn trên localhost/127.0.0.1): người dùng giả `BẠN THỬ` lớp A1C, dữ liệu mẫu, mọi
nút ghi chỉ báo "Bàn thử: không ghi thật".

| Trang | Địa chỉ |
|---|---|
| Bảng tin (3 bài mẫu: thầy ghim · bài chỉ lớp · bài chia sẻ) | `http://localhost:8795/bangtin.html?thu=1` |
| Tin nhắn (2 phòng, bấm phòng đầu ra 3 tin) | `http://localhost:8795/tinnhan.html?thu=1` |
| Khám phá | `http://localhost:8795/khampha.html?thu=1` |
| Cá nhân người khác / của mình | `canhan.html?thu=1&uid=hs_1` / `canhan.html?thu=1` |
| Một bài + bình luận | `baidang.html?thu=1&id=m1` |
| Đăng nhập | `index.html` (không cần `thu`; nút SIGN IN sẽ báo lỗi mạng/tài khoản vì chưa có tài khoản) |

Muốn thêm dữ liệu mẫu: `NW.Bai.mau()` trong `js/bai.js`; phòng chat mẫu ở cuối `NW.Chat.dung` (`if (NW.laBanThu())`);
người mẫu ở `NW.Chat.nguoiNhanDuoc` và `bangtin.html` nhánh `ph.banThu`.

## 3. Đã chốt (không hỏi lại)

1. Đăng nhập My ID + mật khẩu riêng; Firebase Auth email/mật khẩu; email giả = `sha256(mã)[0..24]@id.andrewclasses.com`;
   uid = `hs_<mã số myStudent>`; mật khẩu ban đầu = mã, ép đổi lần đầu; thầy Google `namdaptrai01@gmail.com`.
2. Bài hiện ngay, thầy ẩn/xoá/ghim sau; học sinh báo cáo; từ cấm chặn ở ô soạn.
3. Nhắn riêng: cùng lớp + thầy. Kết bạn toàn mạng = tương lai (`BAT_KET_BAN:false`, kho `nwBanBe` + luật + UI đã có sẵn).
4. Mọi kho Firestore tiền tố `nw`, không đụng AWord/myLesson/mySpeaking. Repo không chứa `lop.json`, không chứa khoá.
5. Giao diện cùng "họ" myLesson (màu, chữ, 6 cảm xúc ❤️👍😆😮😢🐥).
6. Thanh trên cùng 5 tab: TRANG BÀI TẬP · BẢNG TIN · TIN NHẮN · KHÁM PHÁ · CÁ NHÂN (tab đầu trỏ andrewclasses.com).

## 4. Việc thiết kế còn MỞ (gợi ý cho phiên sau — hỏi thầy bằng AskUserQuestion, làm mẫu HTML từng vòng như nếp myLesson)

- **Thanh tab**: hình icon, có cần nền màu/logo chữ trên máy tính không, chấm đỏ đặt ở đâu; điện thoại: giữ trên
  hay dời xuống đáy (hiện luôn ở trên, ≤420 px ẩn logo để 5 tab vừa khít).
- **Thẻ bài**: bố cục đầu thẻ (avatar · tên · lớp · giờ), khối ảnh 1–4 tấm, hàng số (cảm xúc/bình luận/chia sẻ),
  hàng 3 nút; bài chia sẻ hiện "bài gốc" kiểu khung lồng — thầy duyệt hay đổi.
- **Ô soạn**: có cần chọn "Chỉ lớp" bằng nút đổi qua lại như hiện tại, hay menu; vị trí nút Ảnh/ĐĂNG.
- **Trang cá nhân**: ảnh bìa cao bao nhiêu, có mục "thành tích/sao" từ myLesson không (ví sao chưa có kho thật).
- **Khám phá**: ngoài tìm bạn theo lớp có cần "bài nổi bật", "lớp của em", "thầy" không.
- **Tin nhắn**: bong bóng, avatar, nhóm; điện thoại đã tách 1 cột (danh sách ↔ phòng, nút lùi).
- **Đăng nhập**: chữ tiếng Anh "SIGN IN"/"My ID" như myLesson hay tiếng Việt; câu nhắc "mật khẩu lần đầu = My ID".
- **Thông báo (chuông)**: hiện đang là hộp thả từ chuông, 20 tin gần nhất.
- **Trang quản lý**: 5 thẻ dạng bảng đơn giản — có thể làm sau khi gắn thật.
- Chưa có: chế độ tối, bảng "ai đang online", sticker/GIF, tìm bài theo chữ, tag @tên (thông báo `nhac` đã dự trù).

## 5. Việc kỹ thuật còn chờ (sau khi thiết kế xong)

Theo `README.md` mục "Việc thầy cần làm": dán luật Firestore + Storage → 4 chỉ mục → bật Email/Password +
Authorized domain `andrewclasses-01.github.io` → `tools/tao-tai-khoan.mjs --dry` rồi thật → Claude chạy
`tools/kiem-luat.mjs` → thầy bấm tay → domain `network.andrewclasses.com` → gắn vào myLesson (mục 7 `KE HOACH`).
⚠ Sửa CSS/JS xong nhớ tăng `?v=` ở 7 trang + `PHIEN_BAN` trong `config.js`. Bản mới = số bản mới, ghi vào README.

## 6. Bẫy đã gặp trong phiên này

- **Browser pane rộng 0 px**: một lượt đo trả `innerWidth=0`, ô soạn cao 260 px GIẢ, ảnh chụp méo/timeout.
  Luôn in `innerWidth` cùng số đo; ảnh chụp không tin được (cùng họ bẫy "ảnh chụp bàn thử nói dối").
- **Không có Java trên máy** ⇒ không dùng được Firestore emulator; muốn test ghi thật phải dán luật trước.
- **Khoá quản trị chỉ ĐỌC luật, không publish** ⇒ dán luật là việc thầy (Claude dán hộ qua Chrome, CodeMirror `view.dispatch`).
- **`launch.json` của preview nằm ở thư mục phiên Claude (`D:\OTHERS\CLAUDE\.claude\`)**, không phải trong repo.
- **Thẻ `<a>` lồng `<a>`** (danh sách người có nút nhắn tin) là HTML sai — đã đổi bọc ngoài thành `<div class="nguoi">`.
- Bàn thử `?thu=1` không có phiên thầy ⇒ `quanly.html?thu=1` tự đá về `bangtin.html` rồi về `index.html` (đúng ý).

## 7. Cách gửi bản thiết kế cho thầy (nếp đã quen bên myLesson)

Dựng mẫu HTML chạy được (mỗi vòng MỘT file mới: `mau-v1.html`, `mau-v2.html`… trong thư mục
`D:\OTHERS\CLAUDE\myNetwork - thiet ke\` hoặc ngay trong repo `mau/`), phục vụ bằng cổng riêng, thầy xem
rồi góp ý, tới khi "ok build" mới sửa vào trang thật. Đo bằng `getBoundingClientRect` ở 3 mốc (ngay · rAF ·
`document.fonts.ready`), kiểm 375 px, console sạch.
