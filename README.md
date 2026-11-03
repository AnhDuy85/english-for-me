# Lộ trình học tiếng Anh giao tiếp trong 3 tháng
Website tĩnh, thuần HTML/CSS/JS, không framework, không build, không tải gì từ mạng. Có 3 tính năng luyện tập: Luyện nói, Từ vựng (~3000 từ), Hội thoại & Video song ngữ.

## Cách mở
- Cách nhanh: mở file `index.html` bằng trình duyệt (nhấp đúp). Không cần cài đặt.
- Cách khuyên dùng cho Luyện nói: chạy máy chủ cục bộ trong thư mục dự án rồi vào `http://localhost:8000`:
  ```
  cd english-roadmap
  python -m http.server 8000
  ```
  Lý do: khi mở bằng `file://`, một số trình duyệt hỏi lại hoặc chặn quyền micro.
- Nút "Mở English Daily" ở mục Tài nguyên dùng link tương đối `../english-daily/index.html`. Nút mặc định ẩn và chỉ hiện khi trang chạy cục bộ (`file:` hoặc `localhost`/`127.0.0.1`); cần thư mục `english-daily` nằm cạnh. Trên link Netlify nút không hiện.

## Cấu trúc thư mục
```
english-roadmap/
├── index.html            # khung trang, 11 tab và vùng hiển thị
├── vocab-template.csv    # file CSV mẫu để nhập từ vựng riêng
├── css/style.css         # giao diện (tối mặc định, có chế độ sáng)
├── samples/
│   └── sample-dialog.vtt # phụ đề song ngữ mẫu (không kèm video)
└── js/
    ├── data.js           # TOÀN BỘ nội dung lộ trình (sửa ở đây)
    ├── storage.js        # localStorage khóa englishRoadmap.v1 + xuất/nhập JSON cũ
    ├── ipa.js            # từ điển IPA dùng cho chấm điểm nói
    ├── speech.js         # Luyện nói: nhận diện, chấm điểm, lịch sử, biểu đồ
    ├── vocab.js          # Từ vựng: flashcard, Leitner, CSV/JSON
    ├── vocab/week01.js … week12.js  # ~3000 từ, nạp theo tuần khi cần
    ├── dialogs.js        # kịch bản hội thoại (mỗi tuần có đoạn riêng)
    ├── subtitles.js      # đọc phụ đề .vtt/.srt
    ├── player.js         # tab Hội thoại & Video
    ├── backup.js         # xuất/nhập tiến độ gộp 3 khóa
    └── app.js            # điều hướng, hiển thị, checklist, tự đánh giá
```
Thứ tự nạp script trong `index.html`: data, storage, ipa, speech, vocab, dialogs, subtitles, player, backup, app. File `js/vocab/weekNN.js` được nạp động.

## Cách dùng 3 tính năng
Có thể vào từ tab riêng hoặc từ tab Lộ trình tuần: mỗi tuần có 3 nút nhanh "Luyện nói tuần N", "Từ vựng tuần N (~250 từ)", "Hội thoại tuần N".

### Việc mỗi ngày "Nói 10 câu"
Mỗi ngày học có thêm việc 🎤 "Nói 10 câu" (5/8/10 phút theo mức 30/60/90), kèm nút mở Luyện nói. Bạn tự tick khi xong; ứng dụng không tự tick. Tab Luyện nói hiển thị số câu đã nói hôm nay.

### Luyện nói
1. Chọn tuần, chọn câu gợi ý hoặc tự gõ câu tiếng Anh.
2. Bấm "Nghe mẫu" (hoặc "Nghe chậm"), rồi bấm "Nói" và đọc câu.
3. Xem điểm 0–100 và từng từ: đúng, thiếu, sai, thừa (có chữ và biểu tượng, không chỉ màu). Lịch sử và biểu đồ điểm trung bình 8 tuần ở phía dưới.

### Từ vựng
- Chọn tuần (khoảng 250 từ/tuần) hoặc "Tất cả", lọc theo chủ đề, loại từ, trạng thái, tìm kiếm.
- Học bằng flashcard: Space/Enter lật thẻ, `1` chưa nhớ, `2` nhớ, `3` đã thuộc, `P` nghe phát âm.
- Ôn tập Leitner 5 hộp: nhớ đúng thì lên hộp, ôn thưa dần; chưa nhớ thì về hộp 1.
- Nhập/xuất CSV hoặc JSON, xem mục dưới.

### Hội thoại & Video
- Hội thoại có kịch bản: chọn tuần và đoạn, phát bằng giọng đọc của trình duyệt, phụ đề song ngữ, ẩn Anh/Việt, chế độ điền từ khóa, "Nói lại" có chấm điểm.
- Video của bạn: chọn file video (`.mp4`/`.webm`) và phụ đề (`.vtt`/`.srt`). Bấm vào câu để nhảy tới đoạn, lặp đoạn, nói lại câu đang chọn.

## Định dạng CSV từ vựng
File UTF-8 (có BOM hoặc không), dòng đầu là tiêu đề. Cột:
```
w,ipa,pos,vi,ex,exVi,topic,week
```
- `w`: từ hoặc cụm tiếng Anh (bắt buộc). `vi`: nghĩa tiếng Việt (bắt buộc).
- `ipa`: phiên âm. `pos`: loại từ. `ex`/`exVi`: câu ví dụ Anh/Việt. `topic`: chủ đề. `week`: số tuần 1–12 (có thể bỏ trống).
- Ô có dấu phẩy hoặc xuống dòng thì đặt trong dấu ngoặc kép.
- Khi nhập có hai chế độ: bổ sung vào kho (bỏ qua từ trùng) hoặc thay toàn bộ kho. Báo cáo nhập cho biết số dòng thêm, trùng và lỗi.
- Xem `vocab-template.csv`. Nút "Xuất kho ra CSV" dùng đúng các cột này.

## Làm phụ đề .vtt / .srt song ngữ
Tạo file văn bản UTF-8. Mỗi khối gồm dòng thời gian, dòng 1 tiếng Anh, dòng 2 tiếng Việt; các khối cách nhau một dòng trống.
```
WEBVTT

00:00:01.000 --> 00:00:03.500
Hello! My name is Linh.
Xin chào! Tên tôi là Linh.
```
- `.srt`: mỗi khối có thêm số thứ tự ở đầu và dùng dấu phẩy ở mili giây (`00:00:01,000`), không có dòng `WEBVTT`.
- Có thể tách thành hai file (Anh, Việt) cùng mốc thời gian rồi chọn vào hai ô phụ đề; ứng dụng ghép theo thời gian.
- Mẫu: `samples/sample-dialog.vtt`.

## Lưu trữ tiến độ (3 khóa độc lập)
| Khóa localStorage | Nội dung |
|---|---|
| `englishRoadmap.v1` | checklist, chuỗi ngày, cài đặt (giữ nguyên, không đổi định dạng) |
| `englishRoadmap.speaking.v1` | lịch sử luyện nói (tối đa 500 bản ghi) |
| `englishRoadmap.vocab.v1` | hộp Leitner, từ nhập riêng, cài đặt từ vựng |

(Khác khóa `englishDaily.v1` của app english-daily.)
- Tab Tiến độ: "Xuất tiến độ (gộp)" tạo một file JSON chứa cả 3 phần (`schema: englishRoadmap.bundle`).
- "Nhập tiến độ" kiểm tra toàn bộ file trước, chỉ ghi khi mọi phần hợp lệ; sai định dạng hoặc phiên bản mới hơn thì báo lỗi rõ ràng và không thay đổi gì. Nhập được cả file tiến độ cũ (chỉ phần lộ trình) và file riêng của luyện nói hoặc từ vựng.
- "Đặt lại tiến độ" xóa cả 3 phần (có xác nhận). Nên xuất file sao lưu trước.
- Xóa dữ liệu trình duyệt hoặc đổi máy sẽ mất tiến độ nếu chưa xuất file.

## Sửa nội dung trong `js/data.js`
Mọi nội dung lộ trình nằm trong đối tượng `ROADMAP_DATA`:
- `phases`: 3 giai đoạn ở trang chủ.
- `durations`: số phút mỗi việc theo mức 30/60/90.
- `taskTypes`: 6 việc mỗi ngày (nghe, nói, từ vựng, mẫu câu, ôn tập, nói 10 câu). Mô tả việc "Nói 10 câu" là `talk10Desc`.
- `weeks`: 12 tuần. Mỗi tuần cần đủ: `n`, `phase` (1–3), `title`, `goal`, `topics` (đúng 6 chủ đề), `patterns`, `listen`, `speak`, `vocab`, `grammar`, `test`.
- `schedules`, `methods`, `mistakes`, `resources`, `faq`, `assessment`: các mục nội dung còn lại.

Lưu ý tương thích: mã việc có dạng `w{tuần}d{ngày}t{loại}`. Việc mới `talk10` dùng mã như `w3d2ttalk10`, các tick cũ vẫn giữ nguyên. Tổng số việc mỗi tuần tăng từ 32 lên 38 nên phần trăm hiển thị của dữ liệu đã lưu sẽ giảm nhẹ cho tới khi bạn tick việc mới.

## Học trên điện thoại (PWA, offline)
- Giao diện ưu tiên điện thoại: thanh tab cố định ở cuối màn hình (Lộ trình, Từ vựng, Luyện nói, Hội thoại, Thêm), nút lớn, flashcard chạm để lật và vuốt trái/phải.
- Lấy link: kéo thả cả thư mục `english-roadmap-deploy` vào Netlify Drop (HTTPS). Service worker và cài đặt ứng dụng chỉ hoạt động trên HTTPS hoặc `localhost`; mở bằng `file://` thì trang vẫn chạy bình thường nhưng không có chế độ offline.
- Cài ứng dụng: iPhone dùng Safari, bấm Chia sẻ rồi “Thêm vào màn hình chính”. Android: menu trình duyệt rồi “Cài đặt ứng dụng”. Trang có banner nhắc, ẩn được.
- Offline: lần mở đầu (có mạng) tải sẵn toàn bộ trang, 12 file từ vựng, hội thoại và icon (~0,77 MiB). Khi xong trang báo “Đã sẵn sàng học offline”.
- Cập nhật phiên bản: khi sửa bất kỳ file nào, hãy TĂNG `VERSION` trong `sw.js` (ví dụ `english-roadmap-v2`) rồi tải lại thư mục lên. Người dùng sẽ thấy “Có bản cập nhật. Tải lại để dùng bản mới.”. File `_headers` (Netlify) đặt `no-cache` cho `index.html`, `sw.js` và manifest.
- Trước khi tải lên Netlify: mở `sw.js`, xác nhận `VERSION` đã khác bản đang chạy (nếu có sửa file). Quên tăng thì người dùng cũ vẫn thấy bản cũ vì tài nguyên được cache-first.
- Cần mạng: nhận diện giọng nói (Chrome/Edge trên Android). iPhone Safari có thể không hỗ trợ nhận diện giọng nói, khi đó nút mic được ẩn, các phần khác vẫn dùng được.
- Tiến độ lưu riêng theo thiết bị, trình duyệt và tên miền. Dùng Xuất/Nhập (hoặc Sao chép JSON rồi dán) ở mục Tiến độ để chuyển giữa điện thoại và máy tính.
- Nút “Mở English Daily” chỉ hiện khi chạy cục bộ (`file:`, `localhost`, `127.0.0.1`) và `english-daily` nằm cạnh; trên link Netlify nút bị ẩn.
## Deploy lên Netlify Drop và thử cục bộ
Dùng thư mục sạch `english-roadmap-deploy` (chỉ chứa file cần để chạy). Không deploy thư mục nguồn nếu nó có file ghi chú nội bộ.
1. Vào Netlify Drop (app.netlify.com/drop), kéo thả cả thư mục `english-roadmap-deploy` vào trang. Bạn nhận một link HTTPS ngay.
2. Đăng ký/đăng nhập tài khoản Netlify để site thuộc về bạn. Site tạo ẩn danh có thể bị xóa sau một thời gian nếu không nhận về tài khoản.
3. Cập nhật: vào dashboard của chính site đó, mục Deploys, kéo thả thư mục mới vào ô tải lên. Cách này giữ nguyên link. Kéo vào trang Drop chung sẽ tạo site mới với link khác.
4. Thử cục bộ: service worker không chạy trên `file://`. Chạy `python -m http.server 8000` trong thư mục cần thử rồi mở `http://localhost:8000`.
5. Tăng cache khi sửa nội dung: mở `sw.js`, đổi `VERSION` (ví dụ `english-roadmap-v1` thành `english-roadmap-v2`) trước khi tải lên. Nếu quên, người dùng cũ vẫn thấy bản cũ vì tài nguyên được cache-first.
6. Sau khi deploy, làm theo `MOBILE-TEST-CHECKLIST.md` trên điện thoại thật.
Lưu ý: nút "Mở English Daily" tự ẩn trên link Netlify (chỉ hiện khi chạy cục bộ).

### Quan hệ hai thư mục và tạo lại gói deploy
- `english-roadmap`: thư mục làm việc (nguồn), có thêm file nội bộ như `VERIFICATION.md`, `.agents`.
- `english-roadmap-deploy`: bản sao để kéo thả lên Netlify. Sau khi sửa nguồn, tạo lại bằng cách sao chép `index.html`, `sw.js`, `manifest.webmanifest`, `_headers`, `vocab-template.csv`, `README.md`, `MOBILE-TEST-CHECKLIST.md` và các thư mục `css/`, `js/`, `icons/`, `samples/`. Không sao chép `VERIFICATION.md`, `.agents` và file ghi chú nội bộ khác. Hai bản phải giống nhau về nội dung.

## Nếu không thấy bản mới sau khi cập nhật
- Tăng `VERSION` trong `sw.js` rồi tải lại thư mục deploy.
- Tải lại cứng (hard refresh): Ctrl+Shift+R trên máy tính; trên điện thoại đóng hẳn tab/ứng dụng rồi mở lại.
- Gỡ service worker: trong cài đặt trình duyệt, xóa dữ liệu trang (Site settings > Clear data) hoặc DevTools > Application > Service Workers > Unregister.
- File `_headers` chưa thử trên Netlify. Nếu cập nhật mà vẫn không thấy bản mới thì kiểm tra tab Deploys > Headers.
## Giới hạn cần biết
- Điểm nói là mức khớp văn bản mà trình duyệt nhận diện được so với câu mẫu. Đây KHÔNG phải chấm phát âm theo từng âm.
- Nhận diện giọng nói của Chrome/Edge cần kết nối mạng và quyền micro (trình duyệt gửi âm thanh tới dịch vụ của hãng). Firefox không hỗ trợ nhận diện, khi đó trang hiện thông báo và vẫn cho nghe mẫu, học từ, xem hội thoại.
- Kho từ vựng (~3000 từ) là bản nháp, chưa được người rà soát. Nghĩa tiếng Việt và IPA sinh tự động có thể sai, hãy đối chiếu từ điển uy tín.
- Dự án không kèm video thật. Bạn tự cung cấp video hợp pháp (video của bạn hoặc được phép dùng). Video chỉ xử lý trên máy bạn, không tải lên và không được lưu lại.
- Giọng đọc mẫu và hội thoại dùng giọng của trình duyệt/hệ điều hành, chất lượng khác nhau giữa các máy.
- Kết quả học phụ thuộc điểm xuất phát, thời gian dành ra và mức luyện nói thực tế.

## Truy cập
Có liên kết bỏ qua điều hướng. Thanh tab dùng được bằng phím mũi tên trái/phải, Home, End. Có chế độ sáng/tối, vùng trạng thái đọc được bằng trình đọc màn hình. Việc kiểm tra bằng trình đọc màn hình và nhiều trình duyệt cần làm thủ công.
