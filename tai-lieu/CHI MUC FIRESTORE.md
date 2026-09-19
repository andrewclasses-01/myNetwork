# CHỈ MỤC (INDEX) FIRESTORE CẦN TẠO — myNetwork

Firestore tự có chỉ mục cho truy vấn MỘT trường. Bốn truy vấn dưới ghép HAI trường nên phải tạo
chỉ mục ghép một lần (mỗi cái ~1–5 phút để dựng). Bản máy đọc được: `firestore.indexes.json` ở gốc repo.

| # | Kho | Trường | Dùng ở đâu | Chưa có thì sao |
|---|---|---|---|---|
| 1 | `nwChats` | `thanhVien` (Array contains) + `capNhat` (Descending) | Danh sách phòng chat + chấm đỏ tab TIN NHẮN (mọi trang) | Tab TIN NHẮN trống, toast "Kho thiếu chỉ mục" |
| 2 | `nwPosts` | `uid` (Ascending) + `luc` (Descending) | Bài trên trang CÁ NHÂN | Trang cá nhân không hiện bài |
| 3 | `nwPosts` | `an` (Ascending) + `luc` (Descending) | Thẻ "Bài đã ẩn" trang quản lý (thầy) | Thẻ đó báo lỗi |
| 4 | `nwBanBe` | `thanhVien` (Array contains) + `trangThai` (Ascending) | Kết bạn (chỉ khi bật `BAT_KET_BAN`) | Chưa cần ngay |

## Cách tạo — 2 đường

**Đường 1 (dễ nhất): bấm link trong lỗi.** Mở trang bị lỗi, F12 → Console: Firestore in ra dòng
`The query requires an index. You can create it here: https://console.firebase.google.com/...`
— bấm link đó, Console đã điền sẵn, chỉ việc bấm **Create**.

**Đường 2: tạo tay.** Console → Firestore Database → thẻ **Indexes** → **Create index** → điền
Collection ID + hai trường đúng như bảng (Query scope: Collection).

**Đường 3 (nếu có Firebase CLI + đăng nhập):**
```
npx firebase-tools deploy --only firestore:indexes --project aword-70dae
```
(chưa cài CLI trên máy này; khoá quản trị hiện chỉ đọc luật nên đường này cần thầy đăng nhập Google.)
