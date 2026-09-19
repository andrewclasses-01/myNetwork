# KẾ HOẠCH XÂY DỰNG myNetwork — mạng xã hội riêng của Andrew Classes

> Viết 20/09/2026, sau khi đọc trọn myLesson web (đăng nhập · `lop.json` · dashboard · trang lớp ·
> trang bài · chat lớp · ví sao · phiên thầy · 16 bản luật Firestore) và tra hạ tầng đang có
> (GitHub `andrewclasses-01`, Firebase `aword-70dae` gói Blaze, Storage, khoá quản trị).
> Ba điểm thầy chốt 20/09 qua AskUserQuestion: **My ID + mật khẩu riêng** · **bài hiện ngay, thầy ẩn/xoá
> sau** · **nhắn riêng cùng lớp + thầy trước, thiết kế sẵn phần kết bạn để mở toàn mạng sau**.

## 1. Hệ đang có — những gì mạng xã hội dựa vào

| Thứ | Đang thế nào | myNetwork dùng ra sao |
|---|---|---|
| **Mã học sinh (My ID)** | Thầy gõ tay trong myStudent, xuất ra `lop.json` công khai trên andrewclasses.com. 164 bản ghi / 160 mã (4 em học 2 nơi). Mỗi bản ghi có **mã số `id` duy nhất toàn hệ**. | Định danh mạng = **`hs_<mã số>`** (không đổi khi đổi tên/chuyển lớp — bài học "neo vào TÊN" 02/09). Em 2 nơi = 1 tài khoản, `cacLop` gồm cả 2. |
| **Đăng nhập myLesson** | Chỉ gõ mã, không mật khẩu, không Firebase Auth. Thầy: Google `namdaptrai01@gmail.com` hoặc custom token app ký (`laThay()`). | Học sinh: **Firebase Auth email/mật khẩu** — email GIẢ = băm mã (`sha256(mã)[0..24]@id.andrewclasses.com`), mật khẩu ban đầu = mã, ép đổi ngay lần đầu. Thầy: Google như cũ, cùng `laThay()`. |
| **Firestore `aword-70dae`** | Dùng chung 4 app, Blaze từ 28/08, Singapore, ngân sách báo 200k/tháng. Luật tính 1 lượt đọc/tài liệu. | Mọi kho mới tiền tố **`nw`** (`nwUsers` `nwPosts` `nwChats` `nwBanBe` `nwBaoCao` `nwCauHinh`) — không đụng kho cũ. Thiết kế đọc ít: cảm xúc + tác giả NHÚNG trong bài, phân trang 10, bình luận tải khi bấm. |
| **Storage** | Bucket khoá (403), chỉ myStudent ghi ảnh mặt bằng khoá quản trị. | Mở riêng thư mục `nw/<uid>/` — chủ mới ghi, ảnh <2 MB, đã nén JPEG ≤1600px trên máy em. |
| **GitHub Pages** | `myLesson` (andrewclasses.com) · `AWord` (aword.andrewclasses.com) đều repo PUBLIC, nhánh main gốc `/`. | Repo `myNetwork` public, Pages nhánh main. Domain đề nghị: **network.andrewclasses.com** (CNAME sau). |
| **Giao diện myLesson** | Montserrat nhúng, xanh ngọc `#0E7C6E`, nền `#F7FAF9`, bo 18, chat có 6 cảm xúc ❤️👍😆😮😢🐥. | Chép y bộ màu/chữ/cảm xúc để sau này gắn vào myLesson không "lệch tông". |
| **Khoá quản trị** | `%LOCALAPPDATA%\AndrewClasses\firebase-admin.json` (ngoài git/Drive). | `tools/tao-tai-khoan.mjs` dùng khoá này tạo 160 tài khoản; `tools/kiem-luat.mjs` kiểm luật. Khoá **chỉ đọc luật, không publish** ⇒ dán luật vẫn là việc của thầy. |

## 2. Kiến trúc (không máy chủ riêng — y hệt myLesson: trang tĩnh + Firebase)

```
Trình duyệt học sinh ──(Firebase Auth: My ID+mật khẩu)──► token có claim {hs, lop, lops}
        │
        ├── Firestore (luật kiểm "đúng người mới ghi")      nwUsers · nwPosts · nwChats · …
        ├── Storage  nw/<uid>/…  (ảnh đã nén JPEG)
        └── GitHub Pages (HTML/CSS/JS tĩnh, không build)
Máy thầy ── tools/tao-tai-khoan.mjs (khoá quản trị) ──► tạo tài khoản từ lop.json · đặt lại mật khẩu
```
**Vì sao không Cloud Functions ở bản đầu:** mọi việc "cần quyền quản trị" (tạo tài khoản, đặt lại mật khẩu)
gom vào MỘT công cụ chạy trên máy thầy — cùng nếp nút "Đẩy mã lên web" của myStudent; không có gì
phải deploy/trả tiền máy chủ. Khi muốn "em tự quên mật khẩu → tự đặt lại" thì mới cần Cloud Function.

## 3. Kho dữ liệu

| Kho | Ai ghi | Ghi chú |
|---|---|---|
| `nwUsers/{uid}` | công cụ (tạo) · chính em (anh, bia, gioiThieu, phaiDoiMk) · thầy (khoa) | `tenThuong` = tên bỏ dấu để tìm; `cacLop` mảng |
| `nwUsers/{uid}/thongBao/{id}` | người GÂY ra (like/bình luận/chia sẻ/nhóm), `tu` = chính họ | 20 tin gần nhất, chuông |
| `nwPosts/{id}` | tác giả · cảm xúc: ai cũng ghi NHƯNG chỉ ô `camXuc.<uid của mình>` · thầy: `an`/`ghim` | tác giả nhúng `tacGia{}`; chia sẻ = bài mới + `goc{}` chụp lại |
| `nwPosts/{id}/binhLuan/{cid}` | người bình luận | +1/−1 vào `soBinhLuan` |
| `nwChats/{id}` + `/tin` | thành viên phòng | phòng riêng id = `uidA__uidB` xếp thứ tự ⇒ không trùng |
| `nwBanBe/{uidA__uidB}` | người mời tạo `cho`, người được mời đổi `ok` | **sẵn cho tương lai**, bật `BAT_KET_BAN` |
| `nwBaoCao/{id}` | học sinh tạo, chỉ thầy đọc/xử lý | trang quản lý |
| `nwCauHinh/tuCam` · `/lop` | thầy / công cụ | từ cấm thêm · danh sách lớp |

**Chỉ mục ghép cần tạo** (4 cái, `firestore.indexes.json` + `tai-lieu/CHI MUC FIRESTORE.md`).

## 4. Ước lượng tiền (500 người, Blaze)

| Khoản | Ước | Ghi chú |
|---|---|---|
| Đọc Firestore | mỗi lần mở bảng tin ≈ 10 bài + 20 thông báo + 30 phòng ≈ 60 lượt; 500 người × 3 lượt/ngày ≈ **90.000 lượt/ngày** ≈ 2,7 triệu/tháng ≈ **~1,6 USD/tháng** (0,06 USD/100k) | Gói miễn phí Blaze vẫn tính 50k/ngày đầu miễn phí |
| Ghi Firestore | ~10.000/ngày | ~0,5 USD/tháng |
| Storage | ~12 GB sau 1 năm | ~0,3 USD/tháng |
| Băng thông | ảnh đã nén, 10 GB/tháng miễn phí | thường 0 |
| **Tổng** | | **~2–3 USD/tháng**, trong ngân sách 200k ₫ |

## 5. Bảo mật — hơn hẳn myLesson hiện tại, và giới hạn còn lại

Được: mọi kho `nw*` đòi đăng nhập; ai cũng chỉ ghi được bằng đúng uid của mình; mật khẩu do em đặt;
mã đăng nhập không còn nằm trong repo này (myNetwork **không chứa `lop.json`**); thầy khoá được
tài khoản; ảnh chỉ chủ mới tải lên thư mục của mình.
Còn lại (ghi trong `tai-lieu/LUAT FIRESTORE…`): bài "chỉ lớp" vẫn đọc được nếu gọi thẳng kho; nhóm chat
không kiểm được từng thành viên trong luật; xoá bài không xoá bình luận con. Mật khẩu ban đầu = mã
(mã đang công khai ở lop.json) ⇒ **khoảng thời gian em CHƯA đổi mật khẩu** là lúc dễ bị bạn vào trước;
trang ép đổi ngay lần đầu để rút ngắn khoảng này. Thầy muốn chặt hơn: đợt D (đổi quy ước mã) + App Check.

## 6. Lộ trình

| Pha | Việc | Ai | Trạng thái |
|---|---|---|---|
| **1. Dựng local** | 7 trang + lõi + luật + công cụ, bàn thử `?thu=1` | Claude | ✅ 20/09 |
| **2. Mở kho** | Dán luật Firestore (7 khối) + luật Storage + 4 chỉ mục; thêm Authorized domain `andrewclasses-01.github.io` (cho nút Google của thầy) | **Thầy** (Claude dán hộ qua Chrome, thầy Publish) | ⬜ |
| **3. Tạo tài khoản** | `cd tools && npm install && node tao-tai-khoan.mjs --dry` rồi chạy thật (160 em) | Thầy bấm / Claude chạy khi thầy nói | ⬜ |
| **4. Kiểm luật thật** | `node tools/kiem-luat.mjs` — 28 phép thử ghi có/không phiên, tự dọn ZTEST | Claude | ⬜ (đợi pha 2) |
| **5. Thầy bấm tay** | Đăng nhập 1 em thật, đặt mật khẩu, đăng bài có ảnh, thả cảm xúc, bình luận, chia sẻ, nhắn riêng, tạo nhóm, báo cáo, thầy ẩn bài | Thầy | ⬜ |
| **6. Domain** | `network.andrewclasses.com` → CNAME `andrewclasses-01.github.io` ở portal.inet.vn; thêm file `CNAME` vào repo; thêm Authorized domain | Thầy + Claude | ⬜ |
| **7. Gắn vào myLesson** | Xem mục 7 | Claude, chờ "ok build" | ⬜ |

## 7. Gắn vào myLesson (tương lai) — cách làm ít đụng nhất

1. **Một phiên chung:** myLesson web thêm bước "đăng nhập Firebase Auth" bằng cùng email giả + mật
   khẩu (chung `loi.js`); `lop.json` chỉ còn TÊN + MÃ SỐ, không còn mã đăng nhập ⇒ vá luôn lỗ bảo mật
   số 1 (lộ ngày sinh). Web myLesson đọc `request.auth.token.lops` để biết em ở lớp nào.
2. **Thanh 5 tab** (`js/thanh.js`) nhúng vào `lop.html` / `khoa.html` / `bai.html`: tab TRANG BÀI TẬP =
   chính trang đó, 4 tab kia trỏ sang myNetwork (cùng domain con hoặc gộp repo). Sidebar ví sao giữ nguyên.
3. **Chat lớp cũ** (`classChat`) → nhóm chat `nwChats` loại `lop` tạo sẵn cho mỗi lớp (thầy là thành viên),
   dashboard đọc cùng kho; lưu trữ & ghim làm như cũ.
4. **Ví sao** đọc `nwUsers` — có chỗ sẵn cho `sao` khi kho sao thật ra đời.
5. Khi ấy cân nhắc gộp 2 repo hoặc để myNetwork là thư mục con `network/` của myLesson web (Pages một domain).

## 8. Ràng buộc kỹ thuật đã theo (từ bộ nhớ bẫy)

- Không `initializeApp` hai lần (một `NW.fb()` duy nhất, các module dùng chung).
- Đọc ít: không `onSnapshot` cả bảng tin; đệm `sessionStorage`; chỉ đệm khi đọc được thật.
- Ảnh nén JPEG trên máy em trước khi gửi (máy yếu nhất/iPhone cũ vẫn mở được).
- `?v=` cho css/js; `config.js` một chỗ; phiên bản `PHIEN_BAN` in chân trang.
- Test không đầu độc kho: mọi dữ liệu thử tiền tố `ZTEST`, dọn xong mới thoát.
- Đo bằng `getBoundingClientRect`, không tin ảnh chụp Browser pane (20/09: pane từng rộng 0px làm ô soạn cao 260px giả).
