# BÀN GIAO myNetwork — chốt phiên 23/09/2026 (**v0.9.2** `c069c25`, đã push) · trước đó v0.9.0 `ee93d55` · gốc 20/09 (v0.1.0 `dc03133`)

> **Phiên mới đọc khối 🚀 ngay dưới là đủ để bắt tay vào việc.** Cần sâu hơn: `README.md` (nhật ký từng bản, chi tiết nhất)
> → mục A0/A dưới file này (lịch sử 2 phiên thiết kế) → `KE HOACH XAY DUNG.md` (lý do từng quyết định).

## 🚀 BẮT ĐẦU PHIÊN SAU — thầy dừng tối 23/09/2026 (main = origin/main, cây sạch)

### Đang ở đâu
- **Giao diện xong cả 6 mảng** (bảng tin · cá nhân · tin nhắn · khám phá · đăng nhập · quản lý) và đã qua **2 đợt tinh chỉnh bảng tin** của thầy.
- **Vẫn CHƯA có một lượt ghi/đọc Firestore thật nào**: chưa dán luật, chưa tạo tài khoản, chưa em nào đăng nhập. Mọi thứ mới chạy ở **bàn thử**.
- 3 bản gần nhất: **v0.9.0** `ee93d55` (trang Quản lý) · **v0.9.1** `8f9f25f` (bàn thử đi lại được giữa các trang) · **v0.9.2** `c069c25` (đợt 23/09).
- ⬜ **Thầy chưa bấm tay** bản nào từ v0.5.0 trở đi trên kho thật (mới xem qua bàn thử).

### Phiên 23/09 làm gì (chi tiết từng thứ: README v0.9.1 + v0.9.2)
1. **v0.9.1 — bàn thử đi lại được**: mọi đường trong nhà tự mang theo `?thu=1`/`?thu=thay` (`NW.duong/NW.di/NW.thay` + bộ bắt cú bấm `<a>`
   trong `loi.js`, **chỉ chạy ở localhost có `?thu=`** ⇒ trên mạng không đổi gì). Vá 1 lỗi thật: `khampha.html` ép cứng `?thu=1` làm **vai THẦY
   rơi xuống vai học sinh** khi bấm ô một loại. ⇒ Giờ thầy chỉ cần mở **MỘT địa chỉ** rồi bấm đi khắp nơi.
2. **Ảnh màn đăng nhập mới**: `assets/dang-nhap-2.webp` (nén từ PNG 2,7 MB → **186 KB**). Ảnh cũ `dang-nhap.webp` **còn nguyên**, muốn quay lại chỉ sửa 1 dòng `index.html`.
3. **v0.9.2 — bảng tin đợt tinh chỉnh** (8 việc): bớt nhãn thẻ bài · gộp 2 hàng thành 1 (3 icon + số bên trái, cảm xúc bên phải **không số**) ·
   ô soạn bỏ icon ảnh · cột phải bỏ "Nếp của mạng" → khung **NGƯỜI LIÊN HỆ** (tìm + ⋯ Cài đặt đoạn chat) · danh bạ có cả bạn khác lớp ·
   **chặn tin nhắn** · **khung sinh nhật** · icon Bình luận + Chia sẻ vẽ lại theo Facebook.

### Thầy đã chốt trong phiên 23/09 — KHÔNG hỏi lại
- **Chặn tin nhắn = chặn ở giao diện CẢ HAI BÊN**: người chặn không thấy người kia trong danh bạ; người bị chặn **vẫn thấy tin cũ** nhưng có dải
  báo *"… đang hạn chế tin nhắn"* và **ô gõ bị đóng**. Không dùng cách chặn bằng luật kho (tốn 1 lượt đọc cho mỗi tin nhắn của cả mạng).
- **3 công tắc cài đặt (Âm thanh tin nhắn · Hiển thị danh bạ · Trạng thái hoạt động) lưu THEO MÁY** (localStorage), không lưu theo tài khoản.
- **"Hiển thị danh bạ" tắt** = khung vẫn còn nhưng **chỉ hiện Thầy Andrew**, không ai khác.
- **Giữ nhãn ĐÃ ẨN** trên thẻ bài (chỉ bỏ BẠN BÈ và CHỈ MÌNH TÔI).
- **Sinh nhật KHÔNG BAO GIỜ hiện của thầy** (bàn thử cố tình để thầy cũng sinh nhật "hôm nay" để luật này luôn được thử).

### Việc kế tiếp, theo thứ tự nên làm (hỏi thầy chọn bằng AskUserQuestion)
1. **Thầy bấm tay bàn thử** (cổng 8795 `mynetwork-web`): vai học sinh `bangtin.html?thu=1` · vai thầy `quanly.html?thu=thay` — bảng A4 bên dưới.
   ⚠ Lần đầu sau mỗi bản mới: thêm `&moi=<số>` vào địa chỉ, không thì trình duyệt cầm bản cũ.
   Chỗ nào chưa ưng → sửa thẳng trên kho (nếp phiên 23/09) hoặc làm mẫu vòng mới `mau-v29` (nếp cũ, cho mảng lớn).
2. **Nhập NGÀY SINH cho học sinh** (nếu thầy muốn khung Sinh nhật sống): xem mục ⚠ ngay dưới.
3. **Kỹ thuật để LIVE** (mục 5 + README "Việc thầy cần làm"): Claude soạn bản luật GỘP cho thầy tự dán → 6 chỉ mục → bật Email/Password +
   Authorized domain → thầy chạy `tools/tao-tai-khoan.mjs --dry` rồi thật → `tools/kiem-luat.mjs` ⚠ 28 ca viết cho v0.1.0, **phải thêm ca**:
   pham ban/minh · gan/camGiac · binhLuan anh/traLoi · nwChats tat/chuaDoc/anLuc + nhóm chỉ thầy tạo + `lop` · tin camXuc/traLoi · nwKhamPha ·
   noiBat · hoatDongLuc/soThich · nwBanBe · **`chanBoi` + `nwUsers/{uid}/rieng`** → thầy đăng nhập thật, bấm tay → domain `network.andrewclasses.com`.
   ⛔ Claude **không dán luật, không tạo tài khoản, không ghi dữ liệu thật** khi thầy chưa bảo.
4. **Gộp myLesson web vào myNetwork** (việc lớn, phiên riêng, **chỉ khi thầy nói** — học sinh đang dùng myLesson): xem mục 3 khối cũ bên dưới.

### ⚠ Khung SINH NHẬT chưa sống được — vì chưa có dữ liệu
Đã đo tận kho ngày 23/09: **myStudent `students.birthday` = 0/182 em** có dữ liệu · **`lop.json` `sinhNhat` = 0/162 em** có dữ liệu.
Code đã chạy đúng (bàn thử hiện đúng), nhưng **trên trang thật khung này sẽ không bao giờ hiện** cho tới khi có dữ liệu. Đường đi:
**myStudent (nhập ngày sinh) → bấm 🌐 xuất lại `lop.json` → chạy `tools/tao-tai-khoan.mjs`** (đã sửa sẵn để chép, cắt bỏ năm, chỉ giữ `dd/MM`).
Thầy có thể nhờ Claude viết tool đổ ngày sinh từ Excel vào myStudent cho nhanh — thầy chưa quyết.

### Còn nợ (ghi để không quên)
- ⬜ **Luật Firestore `tai-lieu/` CHƯA DÁN** — đã sửa thêm tới v0.9.2: `nwUsers/{uid}/rieng/{muc}` (chỉ chính chủ) · `nwChats.chanBoi`
  (mỗi em chỉ thêm/bỏ chính uid của mình) · và toàn bộ sửa đổi từ v0.4.0→v0.7.0 trước đó.
- ⬜ **Chặn tin nhắn mới làm ở hộp chat nổi**, chưa áp dụng cho trang `tinnhan.html`.
- ⬜ Em mới vào lớp **chưa tự vào nhóm chat lớp** (tool tạo tài khoản nên thêm).
- ⬜ Đồng nhất 7 cảm xúc sang chat lớp myLesson (phiên myLesson).
- ⬜ Nút "Thích" đang là **trái tim**; ảnh mẫu Facebook thầy gửi là **ngón tay cái** — thầy chưa quyết đổi hay không.
- ⬜ Mục A5.6 cũ: bài "Bạn bè" chỉ lọc ở giao diện (`Bai.xemDuoc`), luật đọc chưa chặn tuyệt đối.

### Bản đồ file mới thêm trong phiên 23/09
| File | Việc |
|---|---|
| `js/lienhe.js` **(mới)** | Khung NGƯỜI LIÊN HỆ + tìm + ⋯ Cài đặt đoạn chat + pop-up Danh sách chặn + **khung SINH NHẬT**. Dùng: `NW.LienHe.dung({hop, hopSinhNhat})` |
| `js/loi.js` | Thêm `NW.duong/di/thay` (bàn thử) · `NW.caiDat/datCaiDat` · `NW.chanTinh/datChan/dsChanUid/dsChan` · icon `chan`, `banh` · vẽ lại `binhLuan`, `chiaSe` |
| `js/chatnoi.js` | Nút chặn trên đầu hộp + dải báo + khoá ô gõ + nghe sự kiện `nw-chan` |
| `js/bai.js` | Nhãn thẻ bài · hàng nút gộp (`demHtml`, `cumCamXuc(cx, khongSo)`) · ô soạn bỏ icon ảnh |
| `tools/tao-tai-khoan.mjs` | Chép `sinhNhat` từ `lop.json` sang `nwUsers`, cắt còn `dd/MM` (hàm `ngayThang`) |
| `assets/dang-nhap-2.webp` | Ảnh màn đăng nhập mới (ảnh cũ `dang-nhap.webp` vẫn còn) |

### Nếp làm việc (giữ nguyên)
- Thầy yêu cầu **từng chỗ một**, Claude sửa thẳng trên kho rồi thầy xem ở bàn thử. Mảng lớn thì mới làm mẫu HTML riêng (`mau-vN`, cổng 8824+).
- Mỗi đợt: tăng `?v=` (đang **`?v=13`**) + `PHIEN_BAN` (đang **`0.9.2`**) + ghi README + commit + push ngay.
- Script vá viết ra file `.py` trong scratchpad (heredoc dài hay hỏng), chuỗi tìm chép **NGUYÊN VĂN**, in tiếng Việt bằng `.encode('ascii','backslashreplace')`.
- **Kiểm bằng BẤM CHUỘT THẬT + đo DOM**, đừng tin ảnh chụp: Browser pane có lúc **không vẽ lớp phủ `position:fixed`** (pop-up mở thật mà ảnh trống trơn)
  và có lúc chụp trước khi trang vẽ xong. Đo bằng `javascript_tool` mới chắc.
- Tối đa 5 server preview — tắt bớt trước khi mở mẫu mới.

### Bẫy đã trả giá trong phiên 23/09
- ⛔ **Không truy vấn `nwChats` theo `chanBoi` được**: luật đọc phòng đòi *em phải ở trong `thanhVien`*, mà Firestore chỉ cho **MỘT** `array-contains`
  mỗi truy vấn ⇒ cả truy vấn bị từ chối. Đã chuyển sang ô riêng `nwUsers/{em}/rieng/chan`. **Nếu không phát hiện, lên thật danh bạ sẽ lỗi câm.**
- ⛔ **Trình duyệt cầm file cũ** dù đã tăng `?v=`: sửa file `.js` sau khi đã bump thì URL không đổi ⇒ vẫn bản cũ. Chữa: `fetch(url,{cache:'reload'})` rồi `location.reload()`.
- ⛔ **Tên người trong bàn thử phải khớp nhau giữa các trang**: `hs_3` ở `canhan.html` là BẢO NAM, lúc đầu viết thành NGỌC ÁNH ⇒ bấm sang trang cá nhân thấy tên khác.
- ⛔ Ảnh chụp Browser pane **nói dối** (xem mục nếp làm việc ở trên).


## 🔵 22/09/2026 — **v0.9.1**: bàn thử ĐI LẠI ĐƯỢC giữa các trang (giữ để tra)
Thầy yêu cầu "cho các trang liên kết với nhau như khi mở trang thật để tôi dò lỗi". Đã làm: mọi đường trong nhà tự mang theo `?thu=1`/`?thu=thay`
(`NW.duong/NW.di/NW.thay` + bộ bắt cú bấm `<a>` trong `js/loi.js`, chỉ chạy ở localhost có `?thu=`), các chỗ nhảy trang bằng JS đổi sang `NW.di()`,
`index.html` trong bàn thử vào thẳng không gọi kho, Đăng xuất → đăng nhập lại thành vòng khép kín. **Vá 1 lỗi thật**: `khampha.html` ép cứng `?thu=1`
khi bấm ô một loại ⇒ đang xem vai THẦY bị rơi xuống vai học sinh. Chi tiết: README v0.9.1. ⇒ Bảng địa chỉ A4 bên dưới giờ chỉ cần mở MỘT địa chỉ
(`bangtin.html?thu=1` hoặc `quanly.html?thu=thay`) rồi bấm đi khắp nơi.

## 📗 (CŨ, giữ để tra) Khối bắt đầu phiên viết tối 22/09/2026 sau v0.9.0 `ee93d55`

**Đang ở đâu:** GIAO DIỆN ĐÃ XONG CẢ 6 MẢNG (bảng tin · cá nhân · tin nhắn · khám phá · đăng nhập · quản lý) — v0.5.0 → v0.9.0 đều push
cùng ngày 22/09. **Chưa có một lượt ghi/đọc Firestore thật nào** (chưa dán luật, chưa tạo tài khoản). Thầy **chưa bấm tay** bản nào từ v0.5.0.

**Hướng lớn thầy chốt 22/09 (KHÔNG hỏi lại):** `andrewclasses.com` sẽ **trở thành myNetwork** (đa chức năng); làm bài tập chỉ là MỘT phần;
trang lớp của HS nằm ở tab TRANG BÀI TẬP, thẻ bài vẫn mở trang bài như cũ; thầy không có bài tập nên tab đầu của thầy = QUẢN LÝ.
**CHƯA CHUYỂN NGAY** — HS đang dùng myLesson web; chỉ gộp khi thầy nói.

**Việc kế tiếp, theo thứ tự nên làm (hỏi thầy chọn bằng AskUserQuestion):**
1. **Thầy bấm tay bàn thử** (không cần tài khoản, cổng 8795 `mynetwork-web`): vai học sinh `?thu=1`, vai thầy `?thu=thay` — bảng A4 bên dưới.
   Chỗ nào chưa ưng → làm mẫu vòng mới (`mau-v29` trở đi, cổng 8824 trở đi, nếp mục A2/7).
2. **Kỹ thuật để LIVE** (mục 5 + README "Việc thầy cần làm"): (a) Claude chuẩn bị bản luật GỘP từ `tai-lieu/LUAT FIRESTORE CAN DAN` + Storage để
   thầy tự dán (⛔ Claude không dán, không tạo tài khoản, không ghi dữ liệu thật) → (b) 6 chỉ mục `firestore.indexes.json` → (c) bật Email/Password +
   Authorized domain → (d) `tools/tao-tai-khoan.mjs --dry` rồi thật (thầy chạy) → (e) `tools/kiem-luat.mjs` ⚠ 28 ca viết cho v0.1.0, PHẢI THÊM CA:
   pham ban/minh · gan/camGiac · binhLuan anh/traLoi · nwChats tat/chuaDoc/anLuc + nhóm chỉ thầy tạo + `lop` · tin camXuc/traLoi · nwKhamPha · noiBat ·
   hoatDongLuc/soThich · nwBanBe → (f) thầy đăng nhập thật, bấm tay → domain `network.andrewclasses.com`.
3. **Gộp myLesson web vào myNetwork** (việc lớn, phiên riêng, chỉ khi thầy nói): cùng repo/tên miền → `CFG.LINK_DASHBOARD` trỏ đường cùng nhà
   (mẫu v28 đã thử với `mau-v28/baitap/`, chạy ổn) → giấu đầu trang riêng của dashboard (sửa bên myLesson) → trang lớp HS vào tab TRANG BÀI TẬP
   → chuyển HS sang đăng nhập myNetwork. Trước đó bắt buộc xong bước 2.
4. Nhỏ, ghi để không quên: em mới vào lớp **chưa tự vào nhóm chat lớp** (tool tạo tài khoản nên thêm, chạy khoá quản trị) · đồng nhất 7 cảm xúc sang
   chat lớp myLesson (phiên myLesson) · mục A5.6 (lọc "Bạn bè" chỉ ở giao diện).

**Nếp làm việc đã quen (giữ nguyên):** mỗi tính năng = mẫu HTML (chép repo `css/ js/ assets/ config.js` + `mau-vN.html` vào
`D:\OTHERS\CLAUDE\myNetwork - thiet ke\mau-vN\`, `launch.json` `mynetwork-mauN`) → thầy duyệt bằng AskUserQuestion → chỉ khi "ok build" mới chép về
repo, tăng `?v=` (đang `?v=11`) + `PHIEN_BAN` (đang `0.9.0`), README, commit + push ngay. Script vá viết ra file `.py` trong scratchpad (heredoc dài
hay hỏng), chuỗi tìm chép NGUYÊN VĂN, in tiếng Việt bằng `.encode('ascii','backslashreplace')`. Tối đa 5 server preview — tắt mẫu cũ trước khi mở mới.

## A0. Phiên 22/09/2026 đợt 2 — thầy đổi ý: BUILD TIẾP BẢNG TIN (chưa làm tin nhắn) → v0.5.0

- Thầy chọn 4 mảng bảng tin (thẻ bài · cột phải · bình luận · ô soạn/pop-up) → mẫu **v13** (cổng 8808) → thầy gửi **12 điều chỉnh** → mẫu **v14** (8809) → **"ok build"** + 2 chốt thêm: *Thầy Andrew luôn đứng đầu danh sách lớp* · *chấm xanh online TRÊN avatar như Facebook, thầy không hiện dù trạng thái nào*.
- Mẫu v13/v14 là **bản chép repo có sửa** (`css/ js/ config.js + mau-vN.html`) trong `D:\OTHERS\CLAUDE\myNetwork - thiet ke\` — đợt sau muốn làm mẫu kiểu này: chép repo → sửa → thầy duyệt → chép về. Script vá nằm ở scratchpad phiên (`va_v13.py`, `va_v14.py`, `build_v050.py`) — mất cũng không sao, kết quả đã nằm trong repo.
- Chi tiết từng thứ đã làm: `README.md` mục v0.5.0. Chốt của thầy đợt này (KHÔNG hỏi lại): icon phạm vi đơn sắc · tích VÀNG thay chữ THẦY · không lớp cạnh tên, không nhãn LỚP trên bài · "TÊN ơi, em đang nghĩ gì thế?" · cảm xúc/hoạt động = huy hiệu 2D vẽ tay · ⋯ + ✕ ẩn bài, dịch vào · cột phải chỉ Lớp (đủ, thầy đầu) + Nếp · bấm tên = hộp chat nổi, bấm avatar = cá nhân · icon Bài tập theo Flaticon paper_10538038 · điện thoại giấu cột phải · lời mời kết bạn trong THÔNG BÁO · 10 ảnh/bài · chấm xanh online trên avatar (thầy không).
- **Bàn thử cho thầy bấm** (cổng 8795, `?thu=1`): `bangtin.html?thu=1` (chuông có lời mời kết bạn · bấm tên MINH ANH ở cột phải → hộp chat · bài "Speaking Test" mở bình luận có trả lời lồng · ô "BẠN THỬ ơi…" → pop-up gắn thẻ/cảm xúc/kéo ảnh) · `baidang.html?thu=1&id=m1` · `canhan.html?thu=1&uid=hs_1`.
- **v0.6.0 (cùng phiên)**: TRANG TIN NHẮN theo mẫu v15 (8810) + v16 (8811) — xem README v0.6.0. Chốt thêm của thầy: menu ⋯ từng cuộc chat 5 mục icon đen trắng · HS KHÔNG tạo nhóm, KHÔNG rời nhóm thầy lập · nhóm luôn đứng đầu danh sách.
- **v0.7.0 (cùng phiên)**: KHÁM PHÁ làm lại thành CỔNG HOẠT ĐỘNG (mẫu v17 bị thầy bác → thảo luận 4 câu → v18 → v19 "ok build") — xem README v0.7.0. Chốt của thầy: thầy tự đăng mục (nwKhamPha) · Nổi bật = bài thầy ghim từ menu ⋯ · nổi bật cuộn ngang ≥2,5 thẻ/màn, còn lại ô to · thông báo hiện đủ chữ · giải đấu vỏ trước.
- **v0.8.0 (cùng phiên)**: ĐĂNG NHẬP làm lại (mẫu v20→v27, cổng 8815–8822) — xem README v0.8.0. Thầy chốt: tiếng Việt hết, bỏ hướng dẫn, ô không icon, ID thầy → Google, hình minh hoạ + slogan xanh, mép slogan = mép thẻ.
- **v0.9.0 (cùng phiên, sau compact)**: TRANG QUẢN LÝ làm lại theo mẫu v28 (cổng 8823, thầy "ok build" vòng 1) — xem README v0.9.0. **Thầy chốt hướng lớn**: andrewclasses.com sẽ TRỞ THÀNH myNetwork, làm bài tập chỉ là một phần; trang lớp HS ở tab TRANG BÀI TẬP; thẻ bài mở trang bài như cũ; **chưa chuyển ngay**. Thầy chọn: cột trái danh mục (sau này thêm chức năng chung) · Bài tập = nhúng dashboard · tab đầu của thầy = QUẢN LÝ (thầy không có bài tập) · NETWORK đủ 4 nhóm mục + 5 mục cũ. Mẫu v28 có chép myLesson web vào `mau-v28/baitap/` để nhúng cùng nhà (đúng tình huống sau khi gộp).
- **GIAO DIỆN ĐÃ XONG CẢ 6 MẢNG** (bảng tin · cá nhân · tin nhắn · khám phá · đăng nhập · quản lý). **CÒN MỞ = KỸ THUẬT**: dán luật Firestore + Storage (`tai-lieu/`, đã sửa tới v0.7.0) → tạo 6 chỉ mục (`firestore.indexes.json`) → bật Email/Password + domain → `tools/tao-tai-khoan.mjs` → `tools/kiem-luat.mjs` (⚠ 28 ca viết cho v0.1.0, cần thêm ca: pham ban/minh · gan/camGiac · binhLuan anh/traLoi · nwChats tat/chuaDoc/anLuc · tin camXuc · nwKhamPha · noiBat · hoatDongLuc · nwBanBe) → thầy bấm tay → domain `network.andrewclasses.com` → gắn myLesson. Ngoài ra: đồng nhất 7 cảm xúc sang chat lớp myLesson; trang Quản lý ĐÃ xong v0.9.0; **gộp myLesson web vào myNetwork** (cùng repo/tên miền, `LINK_DASHBOARD` → đường cùng nhà, giấu đầu trang riêng của dashboard, trang lớp HS vào tab TRANG BÀI TẬP) là việc lớn kế tiếp — làm khi thầy nói, KHÔNG tự chuyển vì HS đang dùng. → kỹ thuật dán luật (⚠ luật `tai-lieu/` đã sửa thêm cho v0.5.0: `soThich`, `hoatDongLuc`, `gan`, `camGiac`, ảnh ≤10, `binhLuan.anh/traLoiCho`, `soBinhLuan` giảm N) → chỉ mục → tài khoản → `kiem-luat.mjs` (cần thêm ca mới) → domain → gắn myLesson.
- Bẫy đợt này: (1) `python -c` in tiếng Việt ra console cp1252 ⇒ `UnicodeEncodeError` — in bằng `.encode('ascii','backslashreplace')`; (2) chuỗi tìm trong script vá phải chép NGUYÊN VĂN từ file (đoán thiếu một dấu `"` là 0 kết quả); (3) mẫu dùng lớp `.bang` trùng với bảng `.bang` của nw.css ⇒ đặt tên riêng `.bang-mau`; (4) `input.files` phải chép ra mảng TRƯỚC khi `this.value=''`; (5) Browser pane có lúc `innerWidth=0` — `resize_window` cỡ cố định rồi mới đo/chụp.


## A. Phiên 22/09/2026 — PHIÊN THIẾT KẾ GIAO DIỆN, 4 bản đã push

Thầy chốt cuối phiên: **"Dừng ở đây… tôi sẽ tiếp tục trong phiên tiếp theo."** ⬜ Thầy CHƯA bấm tay bản thật nào — việc đầu phiên sau là
mở bàn thử cho thầy bấm (mục A4) rồi mới thiết kế tiếp.

### A1. Các bản đã push (main = origin/main)
| Bản | Commit | Nội dung |
|---|---|---|
| v0.2.0 | `3739472` | Thanh CHỈ ICON · avatar em + sao (= trang cá nhân) · ☰ sidebar TRƯỢT TỪ PHẢI · điện thoại cả thanh XUỐNG ĐÁY · ô soạn thu gọn · **vá 2 lỗi có từ v0.1.0** (`.phu` trùng tên ⇒ tấm phủ che cả trang, bấm gì cũng không ăn; `<a class="bai-goc">` lồng `<a>` ⇒ ruột bài gốc rơi ra ngoài) |
| v0.3.0 | `add71cf` | TRANG CÁ NHÂN theo mẫu v8 · **7 cảm xúc Facebook vẽ 2D** (`like·tim·cuoi·haha·ngac·khoc·gian`, bỏ gà con) · icon tin nhắn mới |
| v0.3.1 | `2baa58a` | Icon tin nhắn vẽ lại theo mẫu Flaticon thầy gửi (bong bóng tròn, đuôi nhọn, 3 chấm) |
| v0.3.2 | `ec25707` | Vá icon gửi bình luận bị cắt (`textarea{display:block}`) + `.ic{overflow:visible}` |
| **v0.4.0** | **`b6b4c6c`** | Thanh **6 icon mảnh** + **TÌM KIẾM** (`timkiem.html`) · **pop-up TẠO BÀI VIẾT** 4 phạm vi · **LUẬT BẠN BÈ + KHOÁ TRANG** · nút icon trắng trong bìa · chia sẻ link |

### A2. Mẫu thiết kế đã duyệt (mỗi vòng MỘT file; thầy duyệt bằng AskUserQuestion)
Thư mục `D:\OTHERS\CLAUDE\myNetwork - thiet ke\mau-vN\mau-vN.html`, cổng trong `D:\OTHERS\CLAUDE\.claude\launch.json` (`mynetwork-mauN`):
v1 8796 (3 phương án thanh) · v2 8797 (thanh icon + sidebar) · v3 8798 (cảm xúc 2D, sidebar phải) · **v4 8799 (chốt thanh)** · v5 8800 (cá nhân A/B) ·
v6 8801 · v7 8802 (7 cảm xúc) · **v8 8803 (chốt cá nhân)** · v9 8804 · v10 8805 (bạn bè, tìm kiếm) · v11 8806 (pop-up tạo bài) · **v12 8807 (chốt cuối)**.
Chạy tay: `python -m http.server 88xx --directory "D:/OTHERS/CLAUDE/myNetwork - thiet ke/mau-vN"`.

### A3. Chốt của thầy trong phiên (KHÔNG hỏi lại)
1. **Thanh**: chỉ icon, KHÔNG chữ; thứ tự *trang bài tập · khám phá · tin nhắn · bảng tin · thông báo · tìm kiếm (cuối)*; icon đang chọn **sáng lên** (nền tròn + quầng), **bỏ gạch chân**; bộ icon **mảnh, hiện đại** (nét 1.55).
   Trái = **avatar EM + huy hiệu sao** (chép y myLesson `.av.me`/`.sao-hieu`, sao = 0 vì chưa có kho) — **bấm = trang cá nhân**. Phải = **☰ tròn** mở **sidebar trượt từ phải** (ruột chép myLesson: ví sao · trang cá nhân · đổi mật khẩu · trang bài tập · quản lý (thầy) · đăng xuất). Bỏ chữ tên trang. **Điện thoại: CẢ thanh xuống đáy** (avatar · 6 icon · ☰), trên không còn thanh.
2. **Cảm xúc**: 7 kiểu đúng thứ tự Facebook — Thích · Yêu thích · **Cười (ra nước mắt, thay "Thương thương")** · Haha · Oa · Buồn · Phẫn nộ — **vẽ 2D phẳng** (thầy chê bản bóng khối). Thầy muốn **đồng nhất cả ô chat, kể cả chat lớp myLesson** (⬜ việc phiên myLesson).
3. **Icon tin nhắn**: theo mẫu Flaticon `writing_1310191` (bong bóng tròn, đuôi nhọn dưới trái, 3 chấm đậm) — vẽ lại SVG, không tải file (cần ghi nguồn).
4. **Trang cá nhân**: bìa rộng (240/160px) · avatar 128 chồng góc trái · **KHÔNG dải thành tích** · 3 tab **BÀI VIẾT · ẢNH · GIỚI THIỆU căn giữa** · "Tham gia m/yyyy" **chỉ trong tab GIỚI THIỆU** · em chỉ sửa **câu giới thiệu + sở thích** (lớp/ngày tham gia tự động).
   **MỌI nút = icon TRẮNG, KHÔNG nền, nét dày, nằm TRONG bìa**: mình → đổi bìa (góc trên phải), sửa giới thiệu + chia sẻ link (góc dưới phải); cùng lớp / đã bạn → nhắn tin + chia sẻ; khác lớp chưa bạn → kết bạn + chia sẻ. **Không dấu tích** "đã là bạn"; **chưa bạn thì KHÔNG có nhắn tin**.
5. **Bạn bè**: **cùng lớp = bạn sẵn** (không có kết bạn); **khác lớp phải kết bạn**; mỗi trang cá nhân là **link cố định** `canhan.html?uid=…` để chia sẻ; **chưa là bạn → chỉ thấy bìa + avatar + giới thiệu**, kết bạn xong mới thấy bài/ảnh/nhắn tin.
6. **Phạm vi bài** (pop-up "Tạo bài viết" mở khi bấm ô "Em đang nghĩ gì?"): 🌐 Công khai `mang` · 👥 Bạn bè `ban` (bạn + cùng lớp) · 🏫 Chỉ lớp `lop` (thầy cho giữ) · 🔒 Chỉ mình tôi `minh`. Bài Công khai vẫn hiện trên bảng tin cho cả mạng (thầy chọn cách này thay vì bảng tin "chỉ bạn bè").
7. **Ô soạn thu gọn** 1 dòng; **thẻ bài kiểu 1** (hàng đếm + hàng 3 nút) giữ nguyên.

### A4. Bàn thử cho thầy bấm (cổng 8795 `mynetwork-web`, thêm `?thu=1` = vai học sinh · `?thu=thay` = vai thầy, từ v0.9.0)
| Xem gì | Địa chỉ |
|---|---|
| **Trang QUẢN LÝ (v0.9.0)** — cột trái 10 mục, tạo nhóm, ghim/ẩn bài, kéo xếp Nổi bật, thêm mục Khám phá | `quanly.html?thu=thay` (thêm `&muc=nhom` … để mở thẳng mục) |
| Xem mọi trang với vai thầy (tab đầu = QUẢN LÝ, tích vàng, nút thêm mục Khám phá) | `bangtin.html?thu=thay` · `khampha.html?thu=thay` · `tinnhan.html?thu=thay` |
| Tin nhắn (v0.6.0): menu ⋯ từng cuộc, 7 cảm xúc, trả lời, ảnh, đã xem | `tinnhan.html?thu=1` |
| Khám phá = cổng hoạt động (v0.7.0): dải Nổi bật, 4 ô, trang từng loại | `khampha.html?thu=1` · `khampha.html?thu=1&loai=troChoi` |
| Đăng nhập (v0.8.0): gõ `ANDREW` → màn Google; `#doimk` = màn đặt mật khẩu | `index.html?vao=1` · `index.html#doimk` |
| Bảng tin + pop-up tạo bài + bảng chọn 7 cảm xúc (giữ nút Thích) | `http://localhost:8795/bangtin.html?thu=1` |
| Trang mình (đổi bìa/avatar/sửa giới thiệu) | `canhan.html?thu=1` |
| Trang bạn CÙNG LỚP (nhắn tin) | `canhan.html?thu=1&uid=hs_1` |
| Trang người LẠ khác lớp (KHOÁ, gửi lời mời) | `canhan.html?thu=1&uid=hs_2` |
| Trang bạn ĐÃ KẾT BẠN | `canhan.html?thu=1&uid=hs_3` |
| Bạn khác lớp MỜI EM (đồng ý → mở khoá) | `canhan.html?thu=1&uid=hs_4` |
| Tìm kiếm 3 loại | `timkiem.html?thu=1&q=minh` |
| Tin nhắn · Khám phá · Bài đăng (chưa thiết kế lại) | `tinnhan.html?thu=1` · `khampha.html?thu=1` · `baidang.html?thu=1&id=m1` |
Điện thoại: thu cửa sổ ≤ 640px (hoặc Viewport → Mobile trong Browser pane). Trình duyệt hay cầm bản cũ: thêm `&moi=<số>` vào địa chỉ để ép tải lại.

### A5. Việc CÒN MỞ (thứ tự thầy nói — mục 1–3 ĐÃ XONG v0.6.0/0.7.0/0.8.0, giữ để tra; việc thật xem khối 🚀 đầu file)
1. ✅ **Tin nhắn** — bong bóng, nhóm, 7 cảm xúc trong chat, điện thoại 1 cột (mẫu v13 trở đi).
2. ✅ **Khám phá** — (cũ) cân nhắc gộp vào Tìm kiếm (giờ Khám phá = tìm tên + chip lớp + lời mời kết bạn; Tìm kiếm = Mọi người/Bài/Nhóm).
3. ✅ **Đăng nhập** — (cũ) chữ Anh/Việt, câu nhắc mật khẩu lần đầu.
4. Kỹ thuật (sau thiết kế): dán luật Firestore + Storage (`tai-lieu/`, ĐÃ SỬA theo v0.4.0: `pham` 4 giá trị, bài `minh` chỉ tác giả/thầy đọc, kho `nwBanBe` bật) → chỉ mục → bật Email/Password → `tools/tao-tai-khoan.mjs` → `tools/kiem-luat.mjs` (⚠ 28 phép thử viết cho v0.1.0, cần thêm ca `pham:'ban'/'minh'` + bạn bè) → domain → gắn myLesson.
5. Đồng nhất 7 cảm xúc sang chat lớp myLesson (phiên myLesson).
6. Nhỏ: bài "Bạn bè" chỉ lọc ở giao diện (`Bai.xemDuoc`) — luật đọc chưa chặn tuyệt đối (muốn chặn phải `exists()` nwBanBe trong luật, tốn 1 đọc/bài); `tacGia.cacLop` chỉ có từ v0.4.0, bài cũ chỉ có `lop`.

### A6. Bẫy đã gặp trong phiên (đã trả giá, đừng lặp)
- **Chỉ đo DOM không đủ — phải BẤM CHUỘT THẬT**: v0.1.0 có 4 tấm phủ vô hình che cả trang (`.phu` trùng tên) mà phiên trước không thấy vì chỉ đo `getBoundingClientRect`. Kiểm bằng `document.elementFromPoint(x,y)` tại ô soạn/tab.
- **`<a>` lồng `<a>`**: trình duyệt tự đóng thẻ ngoài, ruột rơi ra — dùng `<div role="link">` + JS.
- **`backdrop-filter` tạo khung quy chiếu**: `.tabs` fixed `bottom:0` nằm trong `.thanh` có blur ⇒ neo vào đáy THANH TRÊN. Cách chữa đã chọn: điện thoại dời CẢ `.thanh` xuống đáy.
- **`textarea` inline hở 6px chân chữ** ⇒ nút gửi bình luận neo theo hộp bọc bị tụt, icon máy bay bị cắt → `textarea{display:block}`.
- **Trình duyệt cầm HTML cũ** dù `?v=` đã tăng: điều hướng tới địa chỉ có tham số mới (`&moi=…`) hoặc `fetch(url,{cache:'reload'})` rồi reload.
- **Browser pane không zoom được vùng** (`zoom` trả ảnh toàn trang) — muốn soi icon nhỏ thì `resize_window` hẹp lại rồi chụp scale 1.
- **Lệnh bash dài chứa dấu nháy** làm heredoc rối → ghi script ra file `.py` trong scratchpad rồi chạy (nếp "ghi file an toàn").
- **Tối đa 5 server preview** — phải `preview_stop` bớt trước khi mở mẫu mới.
- Mẫu HTML tự chứa: chép `assets/fonts.css` + `avatar-tron.jpg` vào thư mục mẫu; sprite cảm xúc + bộ icon đặt trong file mẫu.

---

> Phiên mới đọc file này TRƯỚC, rồi `KE HOACH XAY DUNG.md` (lý do từng quyết định), rồi `README.md`.
> Thầy chốt cuối phiên: **"thiết kế thêm trong phiên sau rồi sau đó mới gắn những chức năng thật"**
> ⇒ phiên sau là PHIÊN THIẾT KẾ GIAO DIỆN, chưa dán luật, chưa tạo tài khoản, chưa ghi kho thật.

---

## 0. Trạng thái một dòng

(Viết ở v0.1.0; tới v0.9.0: 8 trang + 6 module JS `loi thanh bai chat chatnoi khampha`, giao diện xong 6 mảng — xem khối 🚀.)
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
`tools/kiem-luat.mjs` (⚠ 28 ca viết cho v0.1.0 — THÊM CA cho v0.4.0→v0.9.0, danh sách ở khối 🚀 bước 2e; 4 chỉ mục nay là 6) → thầy bấm tay → domain `network.andrewclasses.com` → gắn vào myLesson (mục 7 `KE HOACH`).
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
