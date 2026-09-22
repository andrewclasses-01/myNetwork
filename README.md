# myNetwork — mạng xã hội riêng của Andrew Classes

Trang web tĩnh (HTML/CSS/JS thuần, không build) cho ~500 học sinh Andrew Classes: **trang cá nhân ·
bảng tin · đăng bài/ảnh · cảm xúc · bình luận · chia sẻ · tin nhắn riêng · nhóm chat · khám phá**.
Dùng chung Firebase `aword-70dae` với AWord/myLesson/mySpeaking; sẽ gắn vào myLesson web
(andrewclasses.com) thành một hệ có 5 tab **TRANG BÀI TẬP · BẢNG TIN · TIN NHẮN · KHÁM PHÁ · CÁ NHÂN**.

Phiên mới đọc **`BAN GIAO.md`** trước (trạng thái + bản đồ file + việc còn mở), rồi **`KE HOACH XAY DUNG.md`** (lý do từng quyết định).

⭐ 22/09: phiên thiết kế đợt 1 đã build v0.2.0→v0.4.0 (xem `BAN GIAO.md` mục A). Thầy dừng cuối phiên, ⬜ chưa bấm tay; còn mở: tin nhắn · khám phá · đăng nhập. Vẫn chưa dán luật, chưa tạo tài khoản.

## Bản hiện tại — v0.7.0 (22/09/2026) · ⬜ CHƯA LIVE, chưa dán luật, chưa tạo tài khoản

### v0.7.0 — 22/09/2026: KHÁM PHÁ = cổng hoạt động của trung tâm (mẫu v17 → thảo luận → v18 → v19, thầy "ok build") — `?v=9`
Thầy chốt: Khám phá không phải "bài hay/ảnh mới" nữa mà là nơi gắn **trò chơi tiếng Anh · giải đấu online · khoá học · chương trình trung tâm · thông báo quan trọng**; nội dung **thầy tự đăng** (kho `nwKhamPha`); **Nổi bật = bài thầy ghim**; bố cục phối hợp (nổi bật cuộn ngang, còn lại là ô to); giải đấu **làm vỏ trước**.
- `khampha.html` viết lại: **Thông báo quan trọng** (dải đỏ = mức cao / vàng = thường, hiện ĐỦ chữ, tự ẩn khi hết hạn, bấm mở pop-up) → **Nổi bật** (dải cuộn ngang thẻ NHỎ: máy tính 3,5 thẻ / điện thoại đúng 2,5 thẻ; chỉ bài `noiBat:true`, thầy có ✕ gỡ) → **4 ô to** gradient (Trò chơi · Giải đấu · Khoá học · Chương trình, đếm mục, "N đang diễn ra") → bấm ô = **trang một loại** (`?loai=`): đầu trang cùng màu + ← về, lưới thẻ có ảnh bìa 16:9, nút hành động (link mở tab mới; không link thì mở pop-up), thẻ giải đấu có trạng thái + top 3, khoá học có số bài + thanh tiến độ.
- **Thầy quản lý ngay trên trang**: nút *+ Thêm mục* (đầu trang / trong loại) và ✎ trên thẻ → pop-up: loại · tiêu đề · mô tả · link · chữ nút · bắt đầu/kết thúc · ô riêng theo loại (mức thông báo / trạng thái + top 3 / số bài + tiến độ) · ảnh bìa (nén 1280, Storage `_kp`) · ghim · thứ tự; nút **Ẩn mục** (`an:true`). Ghi `nwKhamPha` thật (`addDoc`/`updateDoc`).
- `bai.js`: menu ⋯ của bài có thêm (chỉ thầy) **"Ghim vào Nổi bật (Khám phá)" / "Gỡ khỏi Nổi bật"** (`noiBat`, `noiBatLuc`); bài ghim mang nhãn ★ NỔI BẬT; bàn thử `thayDoi` đổi tại chỗ.
- **Luật** (`tai-lieu/`, ⬜ chưa dán): khối 5b `nwKhamPha` (đọc: đã đăng nhập; ghi: chỉ thầy); `nwPosts` thầy sửa thêm `noiBat`,`noiBatLuc`. **Chỉ mục** thêm 2: `nwPosts(noiBat, noiBatLuc desc)` · `nwKhamPha(an, thuTu)` — `firestore.indexes.json` + `CHI MUC FIRESTORE.md`.
- CSS gộp v17/v18/v19 (`.kp-*`, `.tt`, `.tien-do`, `.kp-top`, `.chon-o`); phần `.goi-y`/`.the-nguoi` cũ giữ nguyên cho timkiem.
- Bàn thử: `khampha.html?thu=1` (dữ liệu mẫu 9 mục + 3 bài nổi bật); mẫu v19 có nút "Xem như thầy" ở `D:\OTHERS\CLAUDE\myNetwork - thiet ke\mau-v19\mau-v19.html?thu=1&thay=1` (cổng 8814). ⬜ Thầy chưa bấm tay.

## Bản trước — v0.6.0 (22/09/2026)

### v0.6.0 — 22/09/2026: TRANG TIN NHẮN theo mẫu v15 + v16 thầy chốt ("ok build" 22/09) — `?v=8`
Mẫu: `D:\OTHERS\CLAUDE\myNetwork - thiet ke\mau-v15\` (8810) → `mau-v16\` (8811), bản chép repo v0.5.0; chép về `js/chat.js` `js/loi.js` `css/nw.css`. `Chat.dung` viết lại (khối menu phòng / chọn người giữ nguyên).
- **Cột trái**: ô tìm "Tìm trong tin nhắn" · avatar 52 + chấm online · tên (thầy tích vàng) · "Em: … · giờ ngắn" (12:05 / T3 / 18/8) · chưa đọc đậm + chấm · **nhóm luôn đứng đầu** (`xepPhong`) · cuộc em đã xoá (`anLuc[uid] >= capNhat`) giấu tới khi có tin mới · **menu ⋯ từng cuộc** (rê chuột hiện ⋯; điện thoại giữ 450 ms): Đánh dấu chưa đọc/đã đọc (`chuaDoc[uid]` + `docLuc`) · Tắt/Bật thông báo (`tat[uid]`, icon chuông gạch cạnh tên) · Xem trang cá nhân (nhóm: Xem thành viên) · Xoá đoạn chat (`anLuc[uid]`, không có với nhóm) · Báo cáo (`nwBaoCao` loai `chat`).
- **HS không tạo nhóm** (nút chỉ hiện với thầy) · **HS không rời nhóm** (bảng thông tin ghi "Nhóm do thầy lập — em ở trong nhóm này"); thầy vẫn thêm/đổi tên/rời.
- **Khung chat**: cụm tin theo người < 5 phút (bo góc đầu/giữa/cuối, avatar ở tin cuối cụm) · ngăn ngày · rê chuột hiện 😊 ↩ ⋯ cạnh tin (điện thoại: giữ tin = bảng 7 cảm xúc) · **cảm xúc** `tin.camXuc{uid:mã}`, cụm góc bong bóng, bấm → ai thả · **trả lời** `tin.traLoi{id,uid,ten,chu,hinh}`: trích tin gốc dính trên bong bóng (bấm → cuộn tới + nháy), dải "Đang trả lời X ✕" (Esc thôi) · **đã xem** = avatar 15 px dưới tin cuối mỗi người đọc tới (`docLuc[uid] >= luc`) · tin chỉ ❤️ vẽ tim to · ảnh bong bóng không viền, bấm xem cả bộ ảnh của cuộc, gửi nhiều ảnh · menu ⋯: sao chép / trả lời / **thu hồi** (của mình hoặc thầy) · ô nhập "Aa" + ảnh + gửi/❤️.
- **Nút ⓘ → bảng thông tin** (cột 3 khi ≥ 1000 px, phủ phải khi hẹp, phủ toàn màn ≤ 640): avatar to, Trang cá nhân / Thành viên, Ảnh đã gửi (lưới 3), nhóm: thêm thành viên · đổi tên · (thầy) rời.
- Icon mới `IC.thongTin · chuongTat · chuongBat · chuaDoc · daDoc`. `Chat.danhDauDoc` nay xoá luôn cờ `chuaDoc`.
- **Luật Firestore** (`tai-lieu/`, ⬜ chưa dán): `nwChats` create nhóm CHỈ thầy; update thêm `tat/chuaDoc/anLuc` (chỉ ô mình), `thanhVien/tv/ten/anh` CHỈ thầy; `tin` create thêm `camXuc`,`traLoi`; update `camXuc` ô mình; delete = tác giả hoặc thầy.
- Kiểm: bàn thử `tinnhan.html?thu=1` (5 cuộc mẫu, MINH ANH đủ kiểu tin), console sạch, 375 px không tràn, bấm thật menu ⋯ / đánh dấu chưa đọc / trả lời / ⓘ. ⬜ Thầy chưa bấm tay.

## Bản trước — v0.5.0 (22/09/2026)

### v0.5.0 — 22/09/2026: BẢNG TIN đợt 2 theo mẫu v13 + v14 thầy chốt ("ok build" 22/09) — `?v=7`
Mẫu: `D:\OTHERS\CLAUDE\myNetwork - thiet ke\mau-v13\` (cổng 8808) và `mau-v14\` (8809) — là BẢN CHÉP repo có sửa, nên đợt này chép thẳng `js/bai.js` `js/loi.js` `js/thanh.js` `css/nw.css` `config.js` + `mau-v14.html` → `bangtin.html` về, rồi gắn phần thật.
- **Thẻ bài**: dòng tên có *"đang cảm thấy [icon] vui"* (`camGiac{ma,ky,chu,loai}`) và *"— cùng với MINH ANH và N người khác"* (`gan[{uid,ten}]`, bấm "N người khác" → danh sách); **bỏ lớp cạnh tên · bỏ chữ THẦY → tích VÀNG** `NW.tichHtml()` · **bỏ nhãn LỚP** · phạm vi = **icon đơn sắc** `NW.PHAM[].ic` cạnh giờ · bài **>4 ảnh** → ô thứ 4 phủ "+N" (tối đa **10 ảnh/bài**) · bấm ảnh → **xem cả bộ** (‹ › + "2 / 6" + phím ← →, `NW.xemAnh(url, ds)`) · cụm **⋯ + ✕** góc phải dịch vào 14px, ✕ = ẩn bài khỏi bảng tin CỦA EM (`localStorage nwAnBai_<uid>`, có Hoàn tác).
- **Bình luận**: **trả lời 1 cấp** (`traLoiCho` = id gốc; "↳ Xem N câu trả lời" khi >2; trả lời một câu trả lời tự điền `@TÊN`) · **7 cảm xúc** cho bình luận (giữ/rê nút Thích, helper chung `NW.ganCamXuc(nut, {hienTai, chon})` — bài cũng dùng) · cụm cảm xúc góc dưới phải bong bóng · **gửi ảnh** trong bình luận (`anh` = url, nén 1200px, tên `_c`) · xoá bình luận gốc xoá luôn trả lời (đếm trừ N).
- **Pop-up tạo bài**: câu gợi ý *"TÊN ơi, em đang nghĩ gì thế?"* · **kéo-thả / Ctrl+V dán ảnh** · xem trước **lưới như thẻ bài** (+ dải ảnh nhỏ khi >4) · hàng "Thêm vào bài viết" 3 nút màu: Ảnh · **Gắn thẻ bạn** (bảng trượt: tìm tên, tick; nguồn `NW.dsNguoiGanDuoc()` = cùng lớp + bạn đã kết; gửi thông báo `nhac`) · **Cảm xúc/hoạt động** (20 huy hiệu **2D vẽ tay** sprite `#cg-<ma>`, `NW.CAM_GIAC` · `NW.cgHtml`) · bàn thử bấm ĐĂNG thì bài hiện ngay đầu trang.
- **Cột phải** chỉ còn **Lớp của em** (đủ cả lớp, thầy đứng đầu có tích vàng, không nhãn lớp, không icon tin nhắn; bấm AVATAR → trang cá nhân, bấm TÊN → **hộp chat nổi**) + Nếp của mạng. Điện thoại/tablet ≤900px **giấu hẳn cột phải**.
- **Hộp chat nổi** `js/chatnoi.js` (`NW.ChatNoi.mo(nguoi)`, kiểu Facebook, tối đa 3 hộp, nút — thu nhỏ thành avatar tròn): kho thật = phòng riêng `nwChats/{uidA__uidB}` qua `NW.Chat.moRieng`, nghe 30 tin mới nhất, gửi qua **`NW.Chat.guiTin(phongId, tin)`** + `NW.Chat.danhDauDoc` (tách từ `chat.js` để dùng chung; bangtin.html nay nạp `js/chat.js`). ≤640px → chuyển `tinnhan.html?voi=`.
- **Chấm xanh online** trên avatar như Facebook (`.av .on`, `NW.dangOnline(hs)`): học sinh có `hoatDongLuc` trong 5 phút; thanh.js ghi nhịp `hoatDongLuc` vào hồ sơ mình **3 phút/lần** khi tab mở (`nhipOnline`); cột phải đọc lại danh sách lớp (đệm 2 phút, `NW.nguoiTheoLop(lop, tuoiToiDa)`) 3 phút/lần. **Thầy KHÔNG có chấm dù trạng thái nào** (đã bỏ luôn chấm cam `.av.gv::after`).
- **Lời mời kết bạn nằm trong hộp THÔNG BÁO** (máy tính + điện thoại): mục `loai:'ketBan'` có nút **Đồng ý / Xoá** ngay trong mục (`xuLyKetBan`: cập nhật `nwBanBe/{uidA__uidB}` trangThai ok hoặc xoá, ghi `xuLy` + `daDoc` vào thông báo, gửi `dongY`).
- **Icon Bài tập** vẽ lại theo mẫu Flaticon `paper_10538038` thầy gửi (giấy gấp góc + 3 dòng + bút chì; vẽ lại SVG, không tải file).
- **Luật Firestore** (`tai-lieu/`, ⬜ vẫn chưa dán) sửa theo: `nwUsers` tự sửa thêm `soThich` (thiếu từ v0.3.0!) + `hoatDongLuc`; `nwPosts` create thêm `gan`, `camGiac`, ảnh ≤10; `soBinhLuan` cho phép giảm N; `binhLuan` create thêm `anh`, `traLoiCho`, chữ HOẶC ảnh.
- Kiểm: bàn thử `?thu=1` 5 trang console sạch, bấm thật (bình luận/trả lời/cảm xúc/gắn thẻ/cảm giác/đăng/xem bộ ảnh/chat nổi/lời mời), 375px không tràn. ⬜ Thầy chưa bấm tay; ⚠ chưa có lượt ghi thật nào (chưa dán luật).

## Bản trước — v0.4.0 (22/09/2026)

### v0.4.0 — 22/09/2026: theo mẫu v10→v12 thầy chốt (BẠN BÈ · KHOÁ TRANG · TÌM KIẾM · POP-UP TẠO BÀI · ICON MẢNH)
- **Thanh**: bộ icon MẢNH (nét 1.55; sách mở · la bàn · bong bóng 3 chấm · ngôi nhà · chuông · **kính lúp CUỐI**) → `timkiem.html` mới.
- **Tìm kiếm** (`timkiem.html`): Mọi người (tiền tố tên thường) · Bài đăng (60 bài mới nhất, lọc chữ ở máy, chỉ bài em xem được) · Nhóm (nhóm em đang ở).
- **Tạo bài viết** = pop-up kiểu Facebook (bấm "Em đang nghĩ gì?" hoặc nút ảnh): 4 phạm vi `NW.PHAM` 🌐 Công khai `mang` · 👥 Bạn bè `ban` · 🏫 Chỉ lớp `lop` · 🔒 Chỉ mình tôi `minh`; nhãn + ký hiệu phạm vi trên thẻ bài.
- **Bạn bè** (`BAT_KET_BAN:true`): cùng lớp = bạn sẵn; khác lớp phải kết bạn (kho `nwBanBe`); `NW.quanHe()` → minh/thay/cunglop/ban/choToi/choHo/la; `NW.dsBanUid()` đệm bạn bè để lọc bài "Bạn bè" (`Bai.xemDuoc`).
- **Trang cá nhân**: mọi nút = icon TRẮNG không nền nét dày trong bìa (mình: đổi bìa trên phải · sửa + chia sẻ dưới phải; cùng lớp/bạn: nhắn tin + chia sẻ; lạ: kết bạn + chia sẻ; đã mời: đồng hồ; bạn mời em: đồng ý). Chưa là bạn → **KHOÁ**: chỉ bìa/avatar/giới thiệu + thẻ 🔒 "Kết bạn để xem thêm". "Tham gia" chỉ còn ở tab GIỚI THIỆU. Chia sẻ link = sao chép `canhan.html?uid=…`.
- `tacGia` nhúng thêm `cacLop`. Luật Firestore (tai-lieu): `pham` 4 giá trị; bài `minh` chỉ tác giả/thầy đọc. ⬜ chưa dán.
- Bàn thử `?thu=1`: `canhan.html?uid=hs_1` cùng lớp · `hs_2` lạ (khoá) · `hs_3` đã bạn · `hs_4` bạn mời em.


### v0.3.2 — 22/09/2026: vá icon gửi bình luận bị cắt (`textarea{display:block}` — khoảng hở inline làm nút gửi tụt đè viền) + `.ic{overflow:visible}`; `?v=5`.

### v0.3.1 — 22/09/2026: icon TIN NHẮN vẽ lại theo mẫu Flaticon thầy gửi (bong bóng tròn, đuôi nhọn dưới trái, 3 chấm đậm); `?v=4`.

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
| `khampha.html` | Tìm theo tên (bỏ dấu) · lọc theo lớp · lời mời kết bạn |
| `timkiem.html` | Tìm Mọi người · Bài đăng · Nhóm (v0.4.0) |
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
