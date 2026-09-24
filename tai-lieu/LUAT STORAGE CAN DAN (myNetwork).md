# LUẬT STORAGE CẦN DÁN — myNetwork (20/09/2026)

> ✅ **ĐÃ DÁN + PUBLISH 24/09/2026 14:31.** Ghi chú cũ:
> ~~CHƯA DÁN.~~ Ảnh bài đăng / ảnh đại diện / ảnh bìa / ảnh trong tin nhắn tải lên Firebase Storage
> (bucket `aword-70dae.firebasestorage.app`, cùng project). Đo 02/09/2026: bucket này đang KHOÁ
> (403 với mọi đường) — đúng, vì chỉ myStudent ghi bằng khoá quản trị. Khối dưới **CHỈ mở thư mục
> `nw/`**, không đụng `mystudentAnhMat`/ảnh mặt.

## Làm

1. Firebase Console → project **aword-70dae** → Build → **Storage** → thẻ **Rules**.
2. Dán khối này vào trong `match /b/{bucket}/o { ... }` (cùng cấp các khối đang có, nếu có).
3. **Publish**.

```
    // ═══ myNetwork (20/09/2026) — ảnh do học sinh tải lên, mỗi em một thư mục nw/<uid>/ ═══
    match /nw/{uid}/{file} {
      // Đọc: ai đã đăng nhập (URL tải về có token riêng nên vẫn dán được vào bài).
      allow read: if request.auth != null;
      // Ghi: đúng chủ thư mục, ảnh JPEG/PNG/WebP, dưới 2 MB (trang đã nén JPEG ≤1600px trước khi gửi).
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null
        && (request.auth.uid == uid || request.auth.token.email == 'namdaptrai01@gmail.com');
    }
```

## Ước tiền (Blaze, vùng asia-southeast1)

- Ảnh bài đã nén ~150–300 KB; avatar ~30 KB. 500 người × 100 ảnh × 250 KB ≈ **12,5 GB** sau một
  năm ⇒ lưu trữ ~0,026 USD/GB/tháng ≈ **0,3 USD/tháng**. Băng thông tải về: 10 GB/tháng đầu miễn phí
  (gói Blaze không giới hạn, tính 0,12 USD/GB sau đó). Ngân sách cảnh báo hiện 200.000 ₫/tháng vẫn dư.
- Muốn giảm nữa: hạ `ANH.canhDai` trong `config.js` xuống 1280.
