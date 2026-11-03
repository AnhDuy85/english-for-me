# Checklist tự thử trên điện thoại thật (sau khi deploy)

Làm lần lượt. Mỗi mục có "Kỳ vọng"; nếu khác kỳ vọng, ghi lại máy, trình duyệt và mô tả lỗi.

## 1. Mở link
- Làm: mở link Netlify (https://...) bằng Chrome (Android) hoặc Safari (iPhone).
- Kỳ vọng: trang tải được, không cuộn ngang, thanh tab cố định ở đáy (Lộ trình, Từ vựng, Luyện nói, Hội thoại, Thêm). Chữ đọc rõ, nút bấm dễ chạm.

## 2. Cài vào màn hình chính
- Android Chrome: menu ⋮ rồi "Cài đặt ứng dụng" (hoặc bấm nút "Cài ứng dụng" trong banner).
- iPhone Safari: nút Chia sẻ rồi "Thêm vào Màn hình chính".
- Kỳ vọng: có biểu tượng trên màn hình chính. Mở từ biểu tượng thì chạy toàn màn hình, không có thanh địa chỉ, icon hiển thị đúng (không bị cắt xấu).

## 3. Thử offline
- Làm: mở app khi có mạng, chờ thông báo "Đã sẵn sàng học offline". Bật chế độ máy bay, đóng hẳn app rồi mở lại.
- Kỳ vọng: app vẫn mở. Chuyển được các tab, vào Từ vựng và mở một tuần chưa từng mở (ví dụ tuần 12) vẫn thấy từ. Hội thoại có kịch bản vẫn dùng được.
- Lưu ý: nhận diện giọng nói cần mạng nên khi offline có thể báo lỗi, đó là bình thường.

## 4. Thử mic (Android Chrome)
- Làm: có mạng, vào Luyện nói, bấm "Nghe mẫu", rồi bấm "Nói" và đọc câu. Cho phép quyền micro khi được hỏi.
- Kỳ vọng: trình duyệt hỏi quyền micro một lần, nút đổi sang trạng thái đang nghe, sau khi nói xong có điểm 0–100 và từng từ được đánh dấu đúng/thiếu/sai/thừa. Nếu từ chối quyền, trang báo rõ lý do, không treo.
- iPhone Safari: nút mic có thể bị ẩn (không hỗ trợ). Kỳ vọng: các phần khác vẫn dùng được.

## 5. Thử giọng đọc
- Làm: bấm "Nghe mẫu", "Nghe chậm" trong Luyện nói; bấm nút nghe phát âm ở thẻ từ vựng; phát một hội thoại.
- Kỳ vọng: nghe được giọng tiếng Anh sau khi bạn bấm (không tự phát). Nghe chậm thì chậm hơn. Nếu im lặng, kiểm tra âm lượng, chế độ im lặng của máy và cài đặt giọng đọc của hệ điều hành.

## 6. Thử lật thẻ và vuốt
- Làm: Từ vựng, "Bắt đầu phiên học". Chạm thẻ để lật; sau khi lật, vuốt trái và vuốt phải.
- Kỳ vọng: chạm thì lật thẻ. Vuốt phải/trái chuyển kết quả hoặc thẻ theo hướng dẫn trên màn hình, không làm cuộn trang ngoài ý muốn. Các nút bấm thay thế vẫn dùng được.

## 7. Thử xuất / nhập tiến độ
- Làm: tick vài việc và học vài từ. Vào Tiến độ, bấm "Xuất tiến độ (gộp)". Sau đó bấm "Đặt lại tiến độ" (xác nhận), rồi "Nhập tiến độ" chọn lại file vừa xuất.
- Kỳ vọng: tải được file JSON (hoặc dùng "Sao chép JSON" nếu máy không tải được). Sau khi nhập, các việc đã tick và tiến độ từ vựng quay lại như trước; file sai định dạng thì báo lỗi và không đổi gì.

## 8. Thử xoay ngang
- Làm: bật xoay màn hình, xoay ngang rồi xoay dọc lại ở vài tab (Lộ trình, Từ vựng, Luyện nói, Hội thoại).
- Kỳ vọng: bố cục co giãn, không cuộn ngang, thanh tab đáy không che nội dung cuối trang, không mất tiến độ hay trạng thái đang học.

## 9. Thử dark mode
- Làm: đổi chế độ sáng/tối của hệ điều hành hoặc dùng nút đổi giao diện trong app.
- Kỳ vọng: giao diện đổi theo, chữ vẫn đọc rõ ở cả hai chế độ, không có vùng chữ trắng trên nền sáng.

## 10. Thử cập nhật phiên bản (khi bạn sửa nội dung)
- Làm: tăng `VERSION` trong `sw.js`, kéo thả thư mục mới lên đúng site, mở lại app khi có mạng.
- Kỳ vọng: xuất hiện "Có bản cập nhật. Tải lại để dùng bản mới."; bấm tải lại thì thấy nội dung mới. Tiến độ cũ vẫn còn.
