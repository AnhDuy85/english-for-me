/* Hoi thoai co kich ban: 2 nguoi, 6-10 cau, song ngu EN/VI.
   window.RM.dialogs = [ { id, week, topic, title, level, lines:[{speaker, en, vi, level}] } ] */
(function () {
  "use strict";
  window.RM = window.RM || {};

  var list = [];
  // d(id, week, topic, title, level, [[speaker, en, vi], ...])
  function d(id, week, topic, title, level, rows) {
    list.push({
      id: id, week: week, topic: topic, title: title, level: level,
      lines: rows.map(function (r) {
        return { speaker: r[0], en: r[1], vi: r[2], level: level };
      })
    });
  }

  // ===== Tuan 1: Phat am co ban va chao hoi =====
  d("d01", 1, "Chào hỏi", "Meeting for the first time", "A1", [
    ["A", "Hello! My name is Linh. What's your name?", "Xin chào! Tên tôi là Linh. Bạn tên là gì?"],
    ["B", "Hi, Linh. I'm Mark. Nice to meet you.", "Chào Linh. Tôi là Mark. Rất vui được gặp bạn."],
    ["A", "Nice to meet you too. Where are you from?", "Tôi cũng rất vui được gặp bạn. Bạn đến từ đâu?"],
    ["B", "I'm from Canada. And you?", "Tôi đến từ Canada. Còn bạn?"],
    ["A", "I'm from Vietnam. I live in Hanoi.", "Tôi đến từ Việt Nam. Tôi sống ở Hà Nội."],
    ["B", "Hanoi is a beautiful city.", "Hà Nội là một thành phố đẹp."],
    ["A", "Thank you. How are you today?", "Cảm ơn bạn. Hôm nay bạn thế nào?"],
    ["B", "I'm fine, thanks. See you later!", "Tôi khỏe, cảm ơn. Hẹn gặp lại nhé!"]
  ]);
  d("d02", 1, "Chào hỏi", "Spelling a name on the phone", "A1", [
    ["A", "Good morning. Can I have your name, please?", "Chào buổi sáng. Cho tôi xin tên của bạn được không?"],
    ["B", "Sure. My name is Anna Brown.", "Được ạ. Tên tôi là Anna Brown."],
    ["A", "Sorry, how do you spell Brown?", "Xin lỗi, chữ Brown đánh vần thế nào?"],
    ["B", "B, R, O, W, N.", "B, R, O, W, N."],
    ["A", "Thank you. And what's your phone number?", "Cảm ơn bạn. Số điện thoại của bạn là gì?"],
    ["B", "It's zero nine one, two three four, five six seven.", "Số là không chín một, hai ba bốn, năm sáu bảy."],
    ["A", "Great. I have it now. Have a nice day!", "Tốt rồi. Tôi đã ghi lại. Chúc bạn một ngày tốt lành!"]
  ]);

  // ===== Tuan 2: Phu am kho, am cuoi, gia dinh =====
  d("d03", 2, "Gia đình", "Talking about my family", "A1", [
    ["A", "Is this your family?", "Đây là gia đình của bạn à?"],
    ["B", "Yes. This is my father and this is my mother.", "Vâng. Đây là bố tôi và đây là mẹ tôi."],
    ["A", "Do you have any brothers or sisters?", "Bạn có anh chị em không?"],
    ["B", "I have one brother and two sisters.", "Tôi có một anh trai và hai chị gái."],
    ["A", "How old is your brother?", "Anh trai bạn bao nhiêu tuổi?"],
    ["B", "He is twenty-five. He works in a bank.", "Anh ấy hai mươi lăm tuổi. Anh ấy làm việc ở ngân hàng."],
    ["A", "You have a big family!", "Gia đình bạn đông người quá!"],
    ["B", "Yes, we are very close.", "Vâng, chúng tôi rất gắn bó."]
  ]);
  d("d04", 2, "Gia đình", "Weekend with grandparents", "A1", [
    ["A", "What do you do on weekends?", "Bạn làm gì vào cuối tuần?"],
    ["B", "I visit my grandparents. They live near the park.", "Tôi thăm ông bà. Ông bà sống gần công viên."],
    ["A", "That sounds nice. What do you do there?", "Nghe hay đấy. Bạn làm gì ở đó?"],
    ["B", "We cook lunch together. My grandmother makes soup.", "Chúng tôi cùng nấu bữa trưa. Bà tôi nấu món canh."],
    ["A", "Is it good?", "Nó có ngon không?"],
    ["B", "It's the best soup in the world!", "Đó là món canh ngon nhất thế giới!"],
    ["A", "I want to try it one day.", "Một ngày nào đó tôi muốn thử nó."]
  ]);

  // ===== Tuan 3: Mua sam va tien bac =====
  d("d05", 3, "Mua sắm", "Buying a T-shirt", "A1", [
    ["A", "Excuse me. How much is this T-shirt?", "Xin lỗi. Cái áo thun này giá bao nhiêu?"],
    ["B", "It's twenty dollars.", "Nó giá hai mươi đô la."],
    ["A", "Do you have a bigger size?", "Bạn có cỡ lớn hơn không?"],
    ["B", "Yes, we do. Here is a large one.", "Có ạ. Đây là cỡ lớn."],
    ["A", "Can I try it on?", "Tôi có thể mặc thử không?"],
    ["B", "Of course. The fitting room is over there.", "Tất nhiên rồi. Phòng thử đồ ở đằng kia."],
    ["A", "It fits well. I'll take it.", "Nó vừa lắm. Tôi sẽ lấy cái này."],
    ["B", "Great. Would you like to pay by cash or card?", "Tuyệt. Bạn muốn trả bằng tiền mặt hay thẻ?"]
  ]);
  d("d06", 3, "Mua sắm", "Asking for a discount", "A2", [
    ["A", "These shoes are nice, but they're a bit expensive.", "Đôi giày này đẹp, nhưng hơi đắt một chút."],
    ["B", "They are on sale today. You get ten percent off.", "Hôm nay chúng đang giảm giá. Bạn được giảm mười phần trăm."],
    ["A", "Can you give me a better price?", "Bạn có thể giảm giá nhiều hơn không?"],
    ["B", "I'm sorry, that's already the lowest price.", "Rất tiếc, đó đã là giá thấp nhất rồi."],
    ["A", "Okay. Do you accept credit cards?", "Được rồi. Bạn có nhận thẻ tín dụng không?"],
    ["B", "Yes, we do. Please enter your PIN here.", "Có ạ. Vui lòng nhập mã PIN ở đây."],
    ["A", "Could I have a receipt, please?", "Cho tôi xin hóa đơn được không?"],
    ["B", "Sure. Here you are. Thank you for shopping with us.", "Được ạ. Của bạn đây. Cảm ơn bạn đã mua sắm ở cửa hàng chúng tôi."]
  ]);

  // ===== Tuan 4: Nha hang, do an va on thang 1 =====
  d("d07", 4, "Nhà hàng", "Ordering dinner", "A1", [
    ["A", "Good evening. Are you ready to order?", "Chào buổi tối. Quý khách đã sẵn sàng gọi món chưa ạ?"],
    ["B", "Yes. I'd like the chicken rice, please.", "Rồi ạ. Cho tôi món cơm gà."],
    ["A", "Would you like something to drink?", "Quý khách muốn uống gì không ạ?"],
    ["B", "A glass of orange juice, please.", "Cho tôi một ly nước cam."],
    ["A", "Anything else?", "Còn gì nữa không ạ?"],
    ["B", "No, that's all. Thank you.", "Không, vậy là đủ rồi. Cảm ơn bạn."],
    ["A", "Your food will be ready in ten minutes.", "Món ăn của quý khách sẽ có trong mười phút nữa."]
  ]);
  d("d08", 4, "Nhà hàng", "Paying the bill", "A2", [
    ["A", "Excuse me, could we have the bill, please?", "Xin lỗi, cho chúng tôi xin hóa đơn được không?"],
    ["B", "Certainly. Is everything okay with your meal?", "Tất nhiên ạ. Món ăn của quý khách có ổn không?"],
    ["A", "Yes, it was delicious, especially the fish.", "Có, rất ngon, nhất là món cá."],
    ["B", "I'm glad you liked it. The total is forty-five dollars.", "Tôi rất vui vì quý khách thích. Tổng cộng là bốn mươi lăm đô la."],
    ["A", "Can we split the bill?", "Chúng tôi chia hóa đơn được không?"],
    ["B", "Of course. I'll bring two separate checks.", "Được ạ. Tôi sẽ mang hai hóa đơn riêng."],
    ["A", "Thank you. Keep the change.", "Cảm ơn bạn. Bạn giữ lại tiền thừa nhé."],
    ["B", "Thank you very much. Please come again!", "Cảm ơn quý khách rất nhiều. Mời quý khách quay lại!"]
  ]);

  // ===== Tuan 5: Hoi duong va di lai =====
  d("d09", 5, "Hỏi đường", "Finding the train station", "A2", [
    ["A", "Excuse me. Could you tell me how to get to the train station?", "Xin lỗi. Bạn có thể chỉ tôi cách đến ga tàu không?"],
    ["B", "Sure. Go straight for two blocks.", "Được chứ. Đi thẳng hai dãy nhà."],
    ["A", "And then?", "Rồi sao nữa?"],
    ["B", "Turn left at the traffic light. You will see a big bank.", "Rẽ trái ở đèn giao thông. Bạn sẽ thấy một ngân hàng lớn."],
    ["A", "Is it far from here?", "Chỗ đó có xa đây không?"],
    ["B", "No, it's about a ten-minute walk.", "Không, đi bộ khoảng mười phút."],
    ["A", "Thank you so much for your help.", "Cảm ơn bạn rất nhiều vì đã giúp đỡ."],
    ["B", "You're welcome. Have a safe trip!", "Không có gì. Chúc bạn đi đường an toàn!"]
  ]);
  d("d10", 5, "Đi lại", "Taking a taxi", "A2", [
    ["A", "Hello. Where to, please?", "Xin chào. Quý khách đi đâu ạ?"],
    ["B", "To the airport, please. How long will it take?", "Cho tôi ra sân bay. Mất bao lâu vậy?"],
    ["A", "About thirty minutes if there isn't much traffic.", "Khoảng ba mươi phút nếu không kẹt xe."],
    ["B", "My flight is at six. Can we go a bit faster?", "Chuyến bay của tôi lúc sáu giờ. Mình đi nhanh hơn một chút được không?"],
    ["A", "I'll do my best. Which terminal?", "Tôi sẽ cố hết sức. Nhà ga nào ạ?"],
    ["B", "Terminal two, please.", "Nhà ga số hai ạ."],
    ["A", "Here we are. That's twenty-five dollars.", "Đến nơi rồi. Hai mươi lăm đô la ạ."],
    ["B", "Here you go. Thanks for the ride.", "Của bạn đây. Cảm ơn bạn đã chở tôi."]
  ]);

  // ===== Tuan 6: Dien thoai va hen gap =====
  d("d11", 6, "Điện thoại", "Calling to make an appointment", "A2", [
    ["A", "Hello, Sunrise Dental. How can I help you?", "Xin chào, nha khoa Sunrise nghe đây. Tôi có thể giúp gì cho bạn?"],
    ["B", "Hi, I'd like to make an appointment for next week.", "Chào bạn, tôi muốn đặt lịch hẹn vào tuần sau."],
    ["A", "Sure. Is Tuesday at ten o'clock okay for you?", "Được ạ. Thứ Ba lúc mười giờ có được không?"],
    ["B", "I'm afraid I have a meeting then. How about Wednesday?", "Tiếc là lúc đó tôi có cuộc họp. Thứ Tư thì sao?"],
    ["A", "Wednesday at two in the afternoon is free.", "Thứ Tư lúc hai giờ chiều còn trống."],
    ["B", "Perfect. I'll take that one.", "Tuyệt. Tôi chọn lịch đó."],
    ["A", "May I have your name and phone number?", "Cho tôi xin tên và số điện thoại của bạn được không?"],
    ["B", "It's Tom Lee, zero nine eight, one two three, four five six.", "Tôi là Tom Lee, số không chín tám, một hai ba, bốn năm sáu."]
  ]);
  d("d12", 6, "Hẹn gặp", "Meeting a friend after work", "A2", [
    ["A", "Hi, Sam. Are you free this Friday evening?", "Chào Sam. Tối thứ Sáu này bạn có rảnh không?"],
    ["B", "I think so. What's the plan?", "Chắc là có. Bạn định làm gì?"],
    ["A", "Let's have dinner and then see a movie.", "Mình đi ăn tối rồi xem phim nhé."],
    ["B", "That sounds great. Where should we meet?", "Nghe tuyệt đấy. Mình gặp nhau ở đâu?"],
    ["A", "How about in front of the cinema at six thirty?", "Trước rạp chiếu phim lúc sáu giờ rưỡi thì sao?"],
    ["B", "Okay. I might be a few minutes late.", "Được. Có thể tôi sẽ đến trễ vài phút."],
    ["A", "No problem. Just call me when you arrive.", "Không sao. Đến nơi thì gọi cho tôi nhé."],
    ["B", "Will do. See you on Friday!", "Được thôi. Hẹn gặp bạn vào thứ Sáu!"]
  ]);

  // ===== Tuan 7: Suc khoe va benh vien =====
  d("d13", 7, "Sức khỏe", "At the doctor's office", "A2", [
    ["A", "Good morning. What seems to be the problem?", "Chào buổi sáng. Bạn gặp vấn đề gì vậy?"],
    ["B", "I have a headache and a sore throat.", "Tôi bị đau đầu và đau họng."],
    ["A", "How long have you felt like this?", "Bạn cảm thấy như vậy được bao lâu rồi?"],
    ["B", "Since Monday. I also have a slight fever.", "Từ hôm thứ Hai. Tôi cũng bị sốt nhẹ."],
    ["A", "Let me check your temperature. Please open your mouth.", "Để tôi đo nhiệt độ cho bạn. Xin hãy há miệng ra."],
    ["B", "Is it serious, doctor?", "Có nghiêm trọng không bác sĩ?"],
    ["A", "No, it's just a cold. Drink a lot of water and rest.", "Không, chỉ là cảm lạnh thôi. Hãy uống nhiều nước và nghỉ ngơi."],
    ["B", "Thank you, doctor.", "Cảm ơn bác sĩ."]
  ]);
  d("d14", 7, "Sức khỏe", "Buying medicine", "A2", [
    ["A", "Hello. Can I help you?", "Xin chào. Tôi có thể giúp gì cho bạn?"],
    ["B", "Yes, I need something for a cough.", "Vâng, tôi cần thuốc trị ho."],
    ["A", "Do you have any allergies to medicine?", "Bạn có bị dị ứng với loại thuốc nào không?"],
    ["B", "I'm allergic to penicillin.", "Tôi bị dị ứng với penicillin."],
    ["A", "Then this syrup is safe for you.", "Vậy loại siro này an toàn cho bạn."],
    ["B", "How often should I take it?", "Tôi nên uống bao lâu một lần?"],
    ["A", "Take one spoon three times a day after meals.", "Uống một muỗng, ba lần một ngày, sau bữa ăn."],
    ["B", "Got it. Thanks for your advice.", "Tôi hiểu rồi. Cảm ơn lời khuyên của bạn."]
  ]);

  // ===== Tuan 8: Thoi tiet, ke hoach va so thich =====
  d("d15", 8, "Thời tiết", "Talking about the weather", "A2", [
    ["A", "What's the weather like today?", "Hôm nay thời tiết thế nào?"],
    ["B", "It's cloudy, and it might rain this afternoon.", "Trời nhiều mây, và chiều nay có thể mưa."],
    ["A", "Oh no. I planned to go to the beach.", "Ôi không. Tôi đã định đi biển."],
    ["B", "Maybe you should go tomorrow. It will be sunny.", "Có lẽ bạn nên đi vào ngày mai. Trời sẽ nắng."],
    ["A", "Good idea. Is it going to be hot?", "Ý hay đấy. Trời sẽ nóng chứ?"],
    ["B", "Yes, about thirty-five degrees.", "Vâng, khoảng ba mươi lăm độ."],
    ["A", "I'll bring a hat and some sunscreen.", "Tôi sẽ mang theo mũ và kem chống nắng."]
  ]);
  d("d16", 8, "Sở thích", "Hobbies and weekend plans", "A2", [
    ["A", "What do you like to do in your free time?", "Bạn thích làm gì vào thời gian rảnh?"],
    ["B", "I love playing the guitar. What about you?", "Tôi thích chơi đàn guitar. Còn bạn?"],
    ["A", "I enjoy hiking and taking photos.", "Tôi thích đi bộ đường dài và chụp ảnh."],
    ["B", "Are you doing anything this weekend?", "Cuối tuần này bạn có dự định gì không?"],
    ["A", "I'm going to climb a mountain with some friends.", "Tôi sẽ leo núi cùng vài người bạn."],
    ["B", "That sounds exciting. Can I join you?", "Nghe thú vị quá. Tôi tham gia cùng được không?"],
    ["A", "Of course! We are leaving at six in the morning.", "Tất nhiên rồi! Chúng tôi sẽ xuất phát lúc sáu giờ sáng."],
    ["B", "Great. I'll set my alarm.", "Tuyệt. Tôi sẽ đặt báo thức."]
  ]);

  // ===== Tuan 9: Ke chuyen qua khu =====
  d("d17", 9, "Kể chuyện quá khứ", "Last summer vacation", "A2", [
    ["A", "How was your summer vacation?", "Kỳ nghỉ hè của bạn thế nào?"],
    ["B", "It was wonderful. I went to Da Nang with my family.", "Rất tuyệt vời. Tôi đã đi Đà Nẵng cùng gia đình."],
    ["A", "What did you do there?", "Bạn đã làm gì ở đó?"],
    ["B", "We swam in the sea and ate a lot of seafood.", "Chúng tôi bơi ở biển và ăn rất nhiều hải sản."],
    ["A", "Did you visit any famous places?", "Bạn có đến thăm nơi nổi tiếng nào không?"],
    ["B", "Yes, we visited the Golden Bridge. The view was amazing.", "Có, chúng tôi đã đến Cầu Vàng. Cảnh đẹp tuyệt vời."],
    ["A", "I wish I had gone with you.", "Phải chi tôi đã đi cùng bạn."],
    ["B", "Next time, you should come!", "Lần sau bạn nên đi cùng nhé!"]
  ]);
  d("d18", 9, "Kể chuyện quá khứ", "A bad day", "B1", [
    ["A", "You look tired. What happened?", "Trông bạn mệt quá. Có chuyện gì vậy?"],
    ["B", "I missed the bus this morning, so I was late for work.", "Sáng nay tôi lỡ xe buýt nên đi làm trễ."],
    ["A", "Oh no. Did your boss say anything?", "Ôi không. Sếp của bạn có nói gì không?"],
    ["B", "Yes, he was angry because we had an important meeting.", "Có, ông ấy đã tức giận vì chúng tôi có một cuộc họp quan trọng."],
    ["A", "That's unlucky. Then what did you do?", "Thật xui xẻo. Rồi bạn đã làm gì?"],
    ["B", "I apologized and explained the situation. He understood in the end.", "Tôi đã xin lỗi và giải thích tình hình. Cuối cùng ông ấy đã thông cảm."],
    ["A", "At least the day is almost over.", "Ít nhất thì ngày hôm nay cũng sắp kết thúc rồi."],
    ["B", "True. I just want to go home and sleep.", "Đúng vậy. Tôi chỉ muốn về nhà và ngủ thôi."]
  ]);

  // ===== Tuan 10: Cong so va cong viec =====
  d("d19", 10, "Công sở", "A job interview", "B1", [
    ["A", "Thank you for coming. Could you tell me about yourself?", "Cảm ơn bạn đã đến. Bạn có thể giới thiệu về bản thân không?"],
    ["B", "Of course. I have three years of experience in marketing.", "Tất nhiên ạ. Tôi có ba năm kinh nghiệm làm marketing."],
    ["A", "Why do you want to work for our company?", "Vì sao bạn muốn làm việc cho công ty chúng tôi?"],
    ["B", "I admire your products, and I'd like to grow with your team.", "Tôi ngưỡng mộ các sản phẩm của công ty, và tôi muốn phát triển cùng đội ngũ của các bạn."],
    ["A", "What is your greatest strength?", "Điểm mạnh lớn nhất của bạn là gì?"],
    ["B", "I'm well organized, and I communicate clearly with others.", "Tôi làm việc có tổ chức và giao tiếp rõ ràng với mọi người."],
    ["A", "Do you have any questions for us?", "Bạn có câu hỏi nào dành cho chúng tôi không?"],
    ["B", "Yes. What would my daily responsibilities be?", "Có ạ. Trách nhiệm hằng ngày của tôi sẽ là gì?"]
  ]);
  d("d20", 10, "Công việc", "Scheduling a team meeting", "B1", [
    ["A", "Do you have a minute? I need to schedule a team meeting.", "Bạn có rảnh một chút không? Tôi cần sắp xếp một cuộc họp nhóm."],
    ["B", "Sure. What is it about?", "Được chứ. Cuộc họp về vấn đề gì vậy?"],
    ["A", "We need to discuss the project deadline.", "Chúng ta cần bàn về hạn chót của dự án."],
    ["B", "I'm available tomorrow morning, but I have a client call at eleven.", "Sáng mai tôi rảnh, nhưng tôi có cuộc gọi với khách hàng lúc mười một giờ."],
    ["A", "Then let's meet at nine. It should take about an hour.", "Vậy mình họp lúc chín giờ. Chắc mất khoảng một tiếng."],
    ["B", "Should I prepare anything?", "Tôi có cần chuẩn bị gì không?"],
    ["A", "Please send me the progress report before the meeting.", "Hãy gửi cho tôi báo cáo tiến độ trước cuộc họp."],
    ["B", "No problem. I'll send it this afternoon.", "Không vấn đề gì. Chiều nay tôi sẽ gửi."]
  ]);

  // ===== Tuan 11: Du lich va khach san =====
  d("d21", 11, "Khách sạn", "Checking in at a hotel", "B1", [
    ["A", "Good afternoon. Welcome to the Grand Hotel.", "Chào buổi chiều. Chào mừng quý khách đến khách sạn Grand."],
    ["B", "Hello. I have a reservation under the name Nguyen.", "Xin chào. Tôi đã đặt phòng dưới tên Nguyễn."],
    ["A", "Let me check. Yes, a double room for three nights.", "Để tôi kiểm tra. Vâng, một phòng đôi trong ba đêm."],
    ["B", "That's right. Does the room include breakfast?", "Đúng rồi. Phòng có bao gồm bữa sáng không?"],
    ["A", "Yes, breakfast is served from six to ten on the second floor.", "Có ạ, bữa sáng phục vụ từ sáu đến mười giờ ở tầng hai."],
    ["B", "Could I have a room with a view of the sea?", "Tôi có thể có phòng nhìn ra biển không?"],
    ["A", "Certainly. Here is your key. Your room is on the fifth floor.", "Tất nhiên ạ. Đây là chìa khóa của quý khách. Phòng ở tầng năm."],
    ["B", "Thank you. Could you send my luggage up, please?", "Cảm ơn bạn. Bạn có thể mang hành lý lên giúp tôi không?"]
  ]);
  d("d22", 11, "Du lịch", "Booking a city tour", "B1", [
    ["A", "Hi, I'm interested in a city tour. What do you offer?", "Xin chào, tôi quan tâm đến tour tham quan thành phố. Bên bạn có những gì?"],
    ["B", "We have a half-day tour and a full-day tour.", "Chúng tôi có tour nửa ngày và tour cả ngày."],
    ["A", "What does the full-day tour include?", "Tour cả ngày bao gồm những gì?"],
    ["B", "It includes lunch, entrance tickets, and an English-speaking guide.", "Tour bao gồm bữa trưa, vé vào cổng và hướng dẫn viên nói tiếng Anh."],
    ["A", "How much is it per person?", "Giá mỗi người là bao nhiêu?"],
    ["B", "It's sixty dollars. Children under five are free.", "Là sáu mươi đô la. Trẻ em dưới năm tuổi được miễn phí."],
    ["A", "We'd like to book it for tomorrow for four people.", "Chúng tôi muốn đặt tour vào ngày mai cho bốn người."],
    ["B", "Wonderful. The bus leaves from the hotel lobby at eight thirty.", "Tuyệt vời. Xe sẽ khởi hành từ sảnh khách sạn lúc tám giờ rưỡi."]
  ]);

  // ===== Tuan 12: Tong on va hoi thoai tu do =====
  d("d23", 12, "Hội thoại tự do", "Sharing opinions about learning English", "B1", [
    ["A", "How long have you been learning English?", "Bạn học tiếng Anh được bao lâu rồi?"],
    ["B", "For about three months. I practice every day.", "Khoảng ba tháng rồi. Tôi luyện tập mỗi ngày."],
    ["A", "What is the hardest part for you?", "Phần nào khó nhất với bạn?"],
    ["B", "Speaking. I often feel nervous when I talk to foreigners.", "Là phần nói. Tôi thường thấy hồi hộp khi nói chuyện với người nước ngoài."],
    ["A", "I felt the same at first. Making mistakes is part of learning.", "Lúc đầu tôi cũng vậy. Mắc lỗi là một phần của việc học."],
    ["B", "Do you have any tips?", "Bạn có mẹo nào không?"],
    ["A", "Try to speak for ten minutes every day, even to yourself.", "Hãy cố gắng nói mười phút mỗi ngày, kể cả nói một mình."],
    ["B", "That's a good idea. I'll start today.", "Ý hay đấy. Tôi sẽ bắt đầu từ hôm nay."]
  ]);
  d("d24", 12, "Hội thoại tự do", "Plans for the future", "B1", [
    ["A", "Now that the course is finished, what are your plans?", "Giờ khóa học đã kết thúc, bạn có kế hoạch gì?"],
    ["B", "I want to keep studying and take an English test next year.", "Tôi muốn tiếp tục học và thi một kỳ thi tiếng Anh vào năm sau."],
    ["A", "That's a great goal. Why do you need it?", "Đó là mục tiêu tuyệt vời. Vì sao bạn cần nó?"],
    ["B", "I'd like to work for an international company one day.", "Một ngày nào đó tôi muốn làm việc cho một công ty quốc tế."],
    ["A", "I'm sure you can do it if you keep practicing.", "Tôi chắc là bạn làm được nếu cứ tiếp tục luyện tập."],
    ["B", "Thank you. Your support means a lot to me.", "Cảm ơn bạn. Sự ủng hộ của bạn rất có ý nghĩa với tôi."],
    ["A", "Let's practice together once a week.", "Chúng ta hãy luyện tập cùng nhau mỗi tuần một lần nhé."],
    ["B", "Deal! Let's start next Monday.", "Đồng ý! Mình bắt đầu từ thứ Hai tuần sau nhé."]
  ]);

  window.RM.dialogs = list;
})();
