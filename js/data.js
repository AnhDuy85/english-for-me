/* ============================================================
 * data.js — Toàn bộ dữ liệu nội dung (sửa file này để đổi nội dung)
 * Không chứa logic. app.js đọc đối tượng ROADMAP_DATA bên dưới.
 * ============================================================ */
const ROADMAP_DATA = {
  // ---- 3 giai đoạn ----
  phases: [
    {
      id: 1,
      name: "Tháng 1 · Nền tảng",
      weeks: "Tuần 1–4",
      icon: "🧱",
      summary: "Làm quen âm tiếng Anh và xây vốn câu sống còn.",
      points: [
        "Phát âm IPA cơ bản: nguyên âm, phụ âm khó với người Việt, âm cuối.",
        "Học khoảng 300–500 câu/mẫu câu sống còn (chào hỏi, hỏi đáp, nhờ giúp đỡ).",
        "Nghe – lặp lại từng câu ngắn, ghi âm giọng mình để so sánh."
      ],
      expectation: "Kỳ vọng thực tế: hiểu và nói được các câu ngắn, chậm trong tình huống quen thuộc; còn ngập ngừng nhiều."
    },
    {
      id: 2,
      name: "Tháng 2 · Phản xạ",
      weeks: "Tuần 5–8",
      icon: "⚡",
      summary: "Biến mẫu câu thành phản xạ qua hội thoại tình huống.",
      points: [
        "Hội thoại tình huống hằng ngày: hỏi đường, điện thoại, sức khỏe, kế hoạch.",
        "Luyện nghe hiểu: nghe ý chính trước, nghe chi tiết sau.",
        "Nói 10–15 phút mỗi ngày (shadowing, tự nói, đóng vai)."
      ],
      expectation: "Kỳ vọng thực tế: trả lời được câu hỏi quen thuộc không cần dịch trong đầu quá lâu; vẫn mắc lỗi ngữ pháp và cần người nói chậm."
    },
    {
      id: 3,
      name: "Tháng 3 · Tự tin",
      weeks: "Tuần 9–12",
      icon: "🚀",
      summary: "Nói tự nhiên hơn, kể chuyện, xử lý tình huống công việc và du lịch.",
      points: [
        "Kể chuyện ngắn về bản thân, quá khứ, kế hoạch.",
        "Tình huống công việc và du lịch: họp ngắn, email nói miệng, đặt phòng, nhờ hỗ trợ.",
        "Luyện với người thật hoặc trợ lý AI; chấp nhận sai và sửa dần."
      ],
      expectation: "Kỳ vọng thực tế: giao tiếp cơ bản (khoảng A2–B1 tùy điểm xuất phát). Chưa phải nói lưu loát; 3 tháng là bước đầu, cần duy trì sau đó."
    }
  ],

  // ---- Thời lượng mỗi ngày: phút cho từng việc ----
  durations: {
    30: { label: "30 phút · Nhẹ", listen: 8, speak: 8, vocab: 6, grammar: 4, review: 4, talk10: 5 },
    60: { label: "60 phút · Vừa", listen: 15, speak: 15, vocab: 12, grammar: 10, review: 8, talk10: 8 },
    90: { label: "90 phút · Chuyên sâu", listen: 22, speak: 25, vocab: 18, grammar: 13, review: 12, talk10: 10 }
  },

  // ---- 5 loại việc mỗi ngày ----
  taskTypes: [
    { key: "listen", icon: "🎧", label: "Nghe" },
    { key: "speak", icon: "🗣", label: "Nói / Shadowing" },
    { key: "vocab", icon: "🧠", label: "Từ vựng (cụm từ)" },
    { key: "grammar", icon: "🧩", label: "Mẫu câu / Ngữ pháp" },
    { key: "review", icon: "🔁", label: "Ôn tập" },
    { key: "talk10", icon: "🎤", label: "Nói 10 câu" }
  ],

  // ---- Việc cuối tuần (ngày 7) ----
  weekendTasks: [
    { key: "test", icon: "📝", label: "Làm bài kiểm tra cuối tuần" },
    { key: "fix", icon: "🛠", label: "Ghi 3 lỗi hay mắc và câu sửa đúng" }
  ],

  // ---- Mô tả việc "Nói 10 câu" (liên kết sang tab Luyện nói) ----
  talk10Desc: "Mở tab Luyện nói, chọn câu của tuần này và nói đủ 10 câu. Điểm chỉ là so khớp văn bản nhận diện được, dùng để theo dõi tiến bộ chứ không phải chấm phát âm.",
  // ---- Lời nhắc ôn tập theo giai đoạn ----
  reviewByPhase: {
    1: "Ôn bằng flashcard cụm từ của 2–3 ngày trước và nghe lại bản ghi âm của chính bạn.",
    2: "Ôn cụm từ cũ theo lịch lặp lại ngắt quãng, rồi nói lại đoạn hội thoại hôm qua không nhìn chữ.",
    3: "Ôn lỗi sai đã ghi, kể lại nội dung hôm nay bằng 3–5 câu và ghi âm lại."
  },

  // ---- 12 tuần ----
  weeks: [
    {
      n: 1, phase: 1,
      title: "Phát âm cơ bản và chào hỏi",
      goal: "Đọc được bảng nguyên âm IPA cơ bản, chào hỏi và giới thiệu bản thân bằng câu ngắn.",
      topics: ["Chào hỏi", "Giới thiệu bản thân", "Hỏi tên, quê quán", "Số đếm và tuổi", "Nghề nghiệp", "Cảm ơn, xin lỗi, tạm biệt"],
      patterns: ["Hi, I'm ... / My name is ...", "Nice to meet you.", "Where are you from?", "Could you say that again, please?"],
      listen: "Nghe 3–5 đoạn chào hỏi rất ngắn, nghe 2–3 lần, chép lại từng từ nghe được.",
      speak: "Lặp lại từng câu sau bản ghi, chú ý nguyên âm dài/ngắn (ship – sheep). Ghi âm 5 câu giới thiệu bản thân.",
      vocab: "Học 8–10 câu/cụm sống còn trong chủ đề của ngày, kèm cách đọc IPA.",
      grammar: "Luyện mẫu câu to be (I am / You are / He is) bằng cách thay từ trong 1 câu mẫu.",
      test: "Tự giới thiệu 30–45 giây (tên, quê, nghề, 1 sở thích), ghi âm và nghe lại; chép 10 câu đã học không nhìn sách."
    },
    {
      n: 2, phase: 1,
      title: "Phụ âm khó, âm cuối, gia đình",
      goal: "Phát âm rõ âm cuối (-s, -ed, -t) và nói về gia đình, thói quen đơn giản.",
      topics: ["Gia đình", "Bạn bè", "Một ngày của tôi", "Giờ giấc", "Công việc hằng ngày", "Việc nhà"],
      patterns: ["I have two brothers.", "I usually get up at ...", "What time do you ...?", "How many ... do you have?"],
      listen: "Nghe đoạn mô tả gia đình/thói quen, gạch các từ có âm cuối -s, -ed mà bạn nghe được.",
      speak: "Shadowing câu ngắn, đọc chậm trước rồi tăng tốc. Tập riêng các âm khó: th, r, l, sh, ch, âm cuối.",
      vocab: "Học 8–10 cụm về thói quen và gia đình; đọc to cả cụm, không học từ rời.",
      grammar: "Thì hiện tại đơn: khẳng định, phủ định (don't/doesn't), câu hỏi (Do/Does).",
      test: "Nói 1 phút về một ngày của bạn; đọc to 10 từ có âm cuối khó và ghi âm kiểm tra."
    },
    {
      n: 3, phase: 1,
      title: "Mua sắm và tiền bạc",
      goal: "Hỏi giá, chọn size/màu, thanh toán và mặc cả lịch sự bằng câu cơ bản.",
      topics: ["Hỏi giá", "Chọn size và màu", "Thử đồ", "Thanh toán", "Đổi trả hàng", "Siêu thị"],
      patterns: ["How much is this?", "Do you have this in a larger size?", "Can I pay by card?", "I'm just looking, thanks."],
      listen: "Nghe đoạn hội thoại mua hàng ngắn, trả lời: mua gì, giá bao nhiêu, thanh toán thế nào.",
      speak: "Đóng vai người mua và người bán, đọc cả hai vế. Nhấn trọng âm câu hỏi giá.",
      vocab: "Học cụm về giá, số lượng, thanh toán (receipt, discount, cash, card...).",
      grammar: "Can/Could cho yêu cầu lịch sự; this/that/these/those; how much / how many.",
      test: "Đóng vai mua một món đồ trong 1 phút (hỏi giá, size, thanh toán) và ghi âm."
    },
    {
      n: 4, phase: 1,
      title: "Nhà hàng, đồ ăn và ôn tháng 1",
      goal: "Gọi món, hỏi về món ăn, phàn nàn lịch sự; tổng ôn toàn bộ tháng 1.",
      topics: ["Đặt bàn", "Gọi món", "Hỏi về món ăn", "Dị ứng và sở thích ăn", "Tính tiền", "Ôn tháng 1"],
      patterns: ["I'd like the ..., please.", "What do you recommend?", "Could we have the bill, please?", "I'm allergic to ..."],
      listen: "Nghe hội thoại gọi món, ghi lại món và yêu cầu đặc biệt của khách.",
      speak: "Shadowing hội thoại nhà hàng, sau đó thay món ăn bằng món của bạn.",
      vocab: "Học cụm về món ăn, vị (spicy, sweet...), cách gọi món lịch sự.",
      grammar: "I'd like / Can I have; đếm được và không đếm được (some, any, a lot of).",
      test: "Bài ôn tháng 1: nói 2 phút gồm giới thiệu, thói quen, mua sắm và gọi món; tự chấm theo bảng: rõ âm, đủ ý, ít ngập ngừng."
    },
    {
      n: 5, phase: 2,
      title: "Hỏi đường và đi lại",
      goal: "Hỏi và chỉ đường, dùng phương tiện công cộng, hiểu thông báo đơn giản.",
      topics: ["Hỏi đường", "Chỉ đường", "Taxi và xe công nghệ", "Xe buýt và tàu", "Sân bay cơ bản", "Bị lạc"],
      patterns: ["Excuse me, how do I get to ...?", "Turn left at the corner.", "How long does it take?", "Is it far from here?"],
      listen: "Nghe lời chỉ đường, vẽ lại sơ đồ đơn giản theo những gì nghe được rồi đối chiếu bản chép.",
      speak: "Nói to lời chỉ đường theo bản đồ tự vẽ; shadowing hội thoại có tốc độ gần tự nhiên.",
      vocab: "Học giới từ chỉ nơi chốn và cụm chỉ hướng (next to, across from, straight ahead).",
      grammar: "Câu mệnh lệnh để chỉ đường; giới từ nơi chốn; câu hỏi lịch sự gián tiếp (Could you tell me ...?).",
      test: "Nghe một đoạn chỉ đường mới và nói lại lộ trình; đóng vai hỏi đường 1 phút."
    },
    {
      n: 6, phase: 2,
      title: "Điện thoại và hẹn gặp",
      goal: "Nghe và nói qua điện thoại cơ bản, hẹn giờ, xin nhắc lại khi nghe không rõ.",
      topics: ["Nhấc máy và giới thiệu", "Hẹn giờ gặp", "Đổi lịch", "Để lại lời nhắn", "Nghe không rõ", "Gọi đặt chỗ"],
      patterns: ["Hello, this is ... speaking.", "Can we meet at ...?", "Sorry, could you speak more slowly?", "Can I leave a message?"],
      listen: "Nghe đoạn thoại điện thoại không có hình; chỉ dựa vào giọng, ghi lại giờ, ngày, tên.",
      speak: "Gọi giả định cho một người bạn tưởng tượng; luyện câu xin nhắc lại và xác nhận thông tin.",
      vocab: "Học cụm về ngày giờ, lịch hẹn, và cụm xử lý khi nghe không rõ.",
      grammar: "Thì tương lai gần: be going to; will cho quyết định tức thời; giới từ thời gian (at, on, in).",
      test: "Đóng vai cuộc gọi hẹn gặp (có đổi giờ) trong 1–2 phút, ghi âm, kiểm tra bạn có xác nhận lại giờ không."
    },
    {
      n: 7, phase: 2,
      title: "Sức khỏe và bệnh viện",
      goal: "Mô tả triệu chứng đơn giản, nói chuyện với bác sĩ/dược sĩ ở mức cơ bản.",
      topics: ["Bộ phận cơ thể", "Mô tả triệu chứng", "Đặt lịch khám", "Hiệu thuốc", "Lời khuyên sức khỏe", "Thói quen lành mạnh"],
      patterns: ["I have a headache.", "How long have you felt like this?", "You should get some rest.", "I need to make an appointment."],
      listen: "Nghe hội thoại khám bệnh, ghi triệu chứng, thời gian, lời khuyên.",
      speak: "Đóng vai bệnh nhân và bác sĩ; shadowing cả hai vế, chú ý ngữ điệu câu hỏi.",
      vocab: "Học cụm triệu chứng và lời khuyên thông dụng; nhóm theo chủ đề, không học rời.",
      grammar: "should / shouldn't cho lời khuyên; have + danh từ cho triệu chứng; since/for ở mức nhận biết.",
      test: "Đóng vai khám bệnh 2 phút: mô tả triệu chứng và hiểu lời khuyên; chép 5 lời khuyên nghe được từ bản nghe mới."
    },
    {
      n: 8, phase: 2,
      title: "Thời tiết, kế hoạch và sở thích",
      goal: "Nói về thời tiết, kế hoạch cuối tuần và sở thích để duy trì cuộc trò chuyện ngắn.",
      topics: ["Thời tiết hôm nay", "Mùa và khí hậu", "Kế hoạch cuối tuần", "Sở thích", "Rủ bạn đi chơi", "Ôn tháng 2"],
      patterns: ["It's pretty hot today.", "What are you doing this weekend?", "I'm into ...", "Would you like to ...?"],
      listen: "Nghe bản tin thời tiết hoặc cuộc nói chuyện làm kế hoạch; nghe ý chính trước, chi tiết sau.",
      speak: "Tự nói 3 phút về kế hoạch và sở thích (không cần đúng hoàn toàn), ghi âm và nghe lại.",
      vocab: "Học cụm về thời tiết, hoạt động giải trí, cách rủ và từ chối khéo.",
      grammar: "Hiện tại tiếp diễn cho kế hoạch gần; like/love/enjoy + V-ing; Would you like to ...?",
      test: "Bài ôn tháng 2: một cuộc trò chuyện 3 phút gồm chào hỏi, kế hoạch, hỏi đường hoặc hẹn giờ với bạn luyện hoặc AI."
    },
    {
      n: 9, phase: 3,
      title: "Kể chuyện quá khứ",
      goal: "Kể một sự việc đã xảy ra theo trình tự với 5–8 câu rõ ràng.",
      topics: ["Cuối tuần vừa rồi", "Chuyến đi gần đây", "Một ngày khó quên", "Kể về tuổi thơ", "Kể một sự cố nhỏ", "Kể phim hoặc sách"],
      patterns: ["Last weekend I ...", "First, ... Then, ... After that, ...", "It was really ...", "What happened next?"],
      listen: "Nghe một câu chuyện ngắn 1–2 phút, ghi các động từ quá khứ nghe được và thứ tự sự việc.",
      speak: "Kể lại câu chuyện vừa nghe bằng lời của bạn, rồi kể chuyện của chính bạn; ghi âm.",
      vocab: "Học cụm nối trình tự và các động từ quá khứ bất quy tắc thường gặp theo cụm câu.",
      grammar: "Quá khứ đơn (động từ thường và bất quy tắc), từ nối trình tự (first, then, after that).",
      test: "Kể một câu chuyện 2 phút về một chuyến đi hoặc sự kiện; tự kiểm tra: đúng trình tự, dùng quá khứ, ít dừng quá 3 giây."
    },
    {
      n: 10, phase: 3,
      title: "Công sở và công việc",
      goal: "Giới thiệu công việc, trao đổi ngắn ở công sở, họp đơn giản và nhờ hỗ trợ.",
      topics: ["Giới thiệu công việc", "Chào đồng nghiệp", "Báo cáo tiến độ ngắn", "Họp ngắn", "Nhờ hỗ trợ và xin phép", "Trao đổi qua email nói miệng"],
      patterns: ["I work in ... as a ...", "Could you help me with ...?", "I'll get back to you by ...", "Let me summarize."],
      listen: "Nghe đoạn họp hoặc trao đổi công sở ngắn; ghi quyết định và việc cần làm.",
      speak: "Báo cáo tiến độ công việc 1 phút theo khung: việc đã làm – việc đang làm – vướng mắc.",
      vocab: "Học cụm công sở thường gặp theo chức năng: đề xuất, đồng ý, từ chối lịch sự, hẹn hạn chót.",
      grammar: "Present perfect ở mức cơ bản cho báo cáo (I've finished ...); modal lịch sự (could, would, may).",
      test: "Đóng vai họp ngắn 3 phút: báo cáo, đặt câu hỏi, nhờ hỗ trợ; nhờ người khác hoặc AI phản hồi."
    },
    {
      n: 11, phase: 3,
      title: "Du lịch và khách sạn",
      goal: "Xử lý các tình huống du lịch: đặt phòng, check-in, gọi dịch vụ, giải quyết sự cố.",
      topics: ["Đặt phòng", "Check-in và check-out", "Nhờ dịch vụ phòng", "Tham quan", "Giải quyết sự cố", "Hỏi gợi ý địa điểm"],
      patterns: ["I have a reservation under ...", "Is breakfast included?", "There's a problem with ...", "Could you recommend ...?"],
      listen: "Nghe thông báo và hội thoại ở khách sạn/sân bay, ghi các thông tin chính xác (giờ, số phòng).",
      speak: "Đóng vai du khách xử lý một sự cố (mất đồ, phòng ồn); luyện giữ bình tĩnh và nói chậm.",
      vocab: "Học cụm du lịch theo tình huống; thêm cụm xin giúp đỡ khi không biết từ.",
      grammar: "Câu điều kiện loại 1 (If ..., I will ...), so sánh hơn/nhất khi chọn dịch vụ.",
      test: "Đóng vai đặt phòng và xử lý sự cố 3 phút với bạn hoặc AI, ghi âm lại và nghe lại."
    },
    {
      n: 12, phase: 3,
      title: "Tổng ôn và hội thoại tự do",
      goal: "Duy trì một cuộc trò chuyện tự do 5–10 phút và lên kế hoạch học tiếp sau 3 tháng.",
      topics: ["Ôn tháng 1 (nền tảng)", "Ôn tháng 2 (phản xạ)", "Chủ đề tự chọn 1", "Chủ đề tự chọn 2", "Luyện với người thật hoặc AI", "Đánh giá và lập kế hoạch tiếp"],
      patterns: ["Let me think for a second.", "What I mean is ...", "That's a good question.", "Can you give me an example?"],
      listen: "Nghe nội dung bạn thích (podcast chậm, video có phụ đề) và tóm tắt lại bằng miệng.",
      speak: "Nói tự do 10 phút về chủ đề bất kỳ; nhờ người luyện cùng hoặc AI đặt câu hỏi nối tiếp.",
      vocab: "Ôn các cụm hay quên nhất; học cụm kéo dài thời gian suy nghĩ (filler lịch sự).",
      grammar: "Ôn các lỗi bạn hay mắc nhất đã ghi trong sổ lỗi; không học thêm mẫu mới nặng.",
      test: "Bài tổng kết: hội thoại tự do 5–10 phút, ghi âm. So sánh với bản ghi tuần 1 để tự thấy khác biệt, rồi viết kế hoạch 3 tháng tiếp theo."
    }
  ],

  // ---- Thời khóa biểu mẫu trong ngày ----
  schedules: {
    30: {
      label: "30 phút / ngày",
      note: "Dành cho người bận. Học thành 2 lần ngắn sẽ dễ duy trì hơn học dồn một lần.",
      slots: [
        { when: "Sáng", time: "14 phút", what: "Nghe (8) + Từ vựng/cụm từ (6): nghe lúc đi đường hoặc ăn sáng." },
        { when: "Trưa", time: "0 phút", what: "Không bắt buộc; có thể nghe thụ động khi nghỉ." },
        { when: "Tối", time: "16 phút", what: "Nói/Shadowing (8) + Mẫu câu (4) + Ôn tập (4)." }
      ]
    },
    60: {
      label: "60 phút / ngày",
      note: "Mức cân bằng cho người đi làm hoặc đi học.",
      slots: [
        { when: "Sáng", time: "20 phút", what: "Nghe (15) + Ôn tập (5): xem lại cụm từ hôm qua." },
        { when: "Trưa", time: "12 phút", what: "Từ vựng/cụm từ (12): học và ôn flashcard." },
        { when: "Tối", time: "28 phút", what: "Nói/Shadowing (15) + Mẫu câu (10) + Ôn tập (3)." }
      ]
    },
    90: {
      label: "90 phút / ngày",
      note: "Dành cho người có nhiều thời gian. Nghỉ giữa các phần để tránh mệt.",
      slots: [
        { when: "Sáng", time: "30 phút", what: "Nghe (22) + Từ vựng/cụm từ (8) lúc đầu óc còn tỉnh." },
        { when: "Trưa", time: "20 phút", what: "Từ vựng/cụm từ (10) + Ôn tập (10): ôn lại bằng flashcard." },
        { when: "Tối", time: "40 phút", what: "Nói/Shadowing (25) + Mẫu câu (13) + Ôn tập (2): ghi âm tổng kết." }
      ]
    }
  },

  // ---- Phương pháp ----
  methods: [
    {
      title: "Shadowing",
      body: [
        "Nghe một câu ngắn, rồi nói lặp lại ngay sau (hoặc gần như cùng lúc) bắt chước ngữ điệu, nhịp và trọng âm.",
        "Cách làm: chọn đoạn 20–40 giây có phụ đề. Nghe 2 lần, đọc theo chữ 2 lần, rồi nhại không nhìn chữ. Ghi âm và so với bản gốc.",
        "Chọn tài liệu chậm vừa sức; nếu không theo kịp nửa câu thì đoạn đó đang quá khó."
      ]
    },
    {
      title: "Lặp lại ngắt quãng (Spaced repetition)",
      body: [
        "Ôn lại một cụm từ ở các mốc cách xa dần (ví dụ hôm sau, 3 ngày, 1 tuần, 2 tuần) thay vì ôn dồn.",
        "Có thể dùng ứng dụng flashcard hoặc tự làm hộp thẻ giấy. Quan trọng là tự nhớ lại trước khi lật thẻ.",
        "Học 10 cụm mới mỗi ngày mà không ôn sẽ quên nhiều; ưu tiên ôn cụm cũ trước khi thêm cụm mới."
      ]
    },
    {
      title: "Chunking (học theo cụm từ)",
      body: [
        "Học cả cụm như \"How long does it take?\" thay vì từng từ rời. Cụm sẵn có giúp bạn nói nhanh hơn vì không phải ghép từng từ.",
        "Ghi thẻ bằng cả câu ví dụ trong tình huống. Sau đó thay một thành phần để tạo câu mới (I'd like a coffee → I'd like a table for two)."
      ]
    },
    {
      title: "Nghe chủ động và nghe bị động",
      body: [
        "Nghe chủ động: tập trung, có mục tiêu (ghi ý chính, chép lại, nghe lại chỗ khó). Đây là phần giúp tiến bộ rõ nhất.",
        "Nghe bị động: bật nền khi đi lại, nấu ăn để quen âm thanh và nhịp. Hữu ích như bổ trợ, không thay thế nghe chủ động.",
        "Quy trình gợi ý: nghe ý chính → nghe lại chép chi tiết → đối chiếu bản gốc → nghe lại không nhìn chữ."
      ]
    },
    {
      title: "Sửa lỗi phát âm",
      body: [
        "Ghi âm chính mình và so với bản mẫu. Chọn 1–2 âm sai nhiều nhất để sửa mỗi tuần, đừng cố sửa tất cả.",
        "Người Việt thường gặp: bỏ âm cuối (-s, -t, -d), nhầm nguyên âm dài/ngắn, khó với /θ/, /ð/, /r/. Luyện cặp từ tối thiểu như ship – sheep, think – sink.",
        "Phát âm là kỹ năng cơ, cần lặp lại nhiều lần đều đặn; tiến bộ thường chậm và không đều."
      ]
    },
    {
      title: "Cách không sợ nói sai",
      body: [
        "Mục tiêu của giao tiếp là được hiểu, không phải đúng hoàn hảo. Người bản ngữ và người học khác đều thường mắc lỗi khi nói.",
        "Bắt đầu nói với chính mình hoặc với AI để bớt áp lực, rồi chuyển sang người thật.",
        "Ghi lỗi vào sổ, sửa mỗi tuần một ít thay vì dừng nói để sửa trong lúc nói. Học cụm cứu nguy như \"Sorry, let me say that again\" để có cách thoát khi bí."
      ]
    }
  ],

  mistakes: [
    { mistake: "Chỉ nghe và đọc, ít nói thành tiếng", fix: "Đặt giờ nói cố định mỗi ngày; nếu không có người, tự nói và ghi âm." },
    { mistake: "Học từ đơn lẻ rồi không nhớ cách dùng", fix: "Học theo cụm và câu ví dụ, ôn lại theo lịch ngắt quãng." },
    { mistake: "Bỏ qua âm cuối khi phát âm", fix: "Luyện riêng âm cuối, ghi âm và nghe lại; đọc chậm có nhấn âm cuối." },
    { mistake: "Dịch từng chữ từ tiếng Việt sang tiếng Anh", fix: "Học câu nguyên khối trong tình huống, dùng câu mẫu thay vì tự dịch." },
    { mistake: "Học dồn vài tiếng một ngày rồi nghỉ nhiều ngày", fix: "Chia nhỏ, học ngắn mỗi ngày; đặt mức tối thiểu 15 phút cho ngày bận." },
    { mistake: "Chờ \"đủ giỏi\" mới nói với người khác", fix: "Bắt đầu từ tuần 5 trở đi: hẹn luyện nói định kỳ với bạn học hoặc AI." },
    { mistake: "Đổi tài liệu liên tục", fix: "Chọn một bộ nguồn chính cho 4 tuần, chỉ thêm tài liệu phụ khi cần." },
    { mistake: "Nghe tài liệu quá khó nên nản", fix: "Chọn tài liệu hiểu được khoảng 70–80% nội dung, tăng độ khó dần." }
  ],

  // ---- Tài nguyên: chỉ loại và tiêu chí, không URL ngoài ----
  resources: [
    {
      type: "Podcast / bản nghe tốc độ chậm",
      criteria: ["Có bản ghi chép (transcript) để đối chiếu.", "Mỗi tập ngắn 5–15 phút.", "Tốc độ nói rõ, phù hợp trình độ hiện tại."]
    },
    {
      type: "Phim, video có phụ đề song ngữ",
      criteria: ["Hội thoại đời thường, ít từ chuyên ngành.", "Có thể tạm dừng và nghe lại từng câu.", "Phụ đề chính xác; dần chuyển sang phụ đề tiếng Anh."]
    },
    {
      type: "Ứng dụng flashcard lặp lại ngắt quãng",
      criteria: ["Cho tự tạo thẻ bằng cả cụm/câu.", "Có lịch ôn tự động theo khoảng cách tăng dần.", "Hoạt động tốt khi dùng ngoại tuyến."]
    },
    {
      type: "Nhóm hoặc câu lạc bộ hội thoại",
      criteria: ["Quy mô nhỏ để mỗi người nói được nhiều.", "Có chủ đề và khung giờ cố định.", "Không khí khuyến khích, không chê lỗi sai."]
    },
    {
      type: "Bạn luyện cùng hoặc gia sư",
      criteria: ["Sửa lỗi có chọn lọc, không ngắt lời liên tục.", "Có mục tiêu theo buổi (ví dụ đóng vai tình huống tuần này).", "Cho phản hồi cụ thể về phát âm và câu."]
    },
    {
      type: "Trợ lý hội thoại AI",
      criteria: ["Cho đóng vai theo tình huống của tuần.", "Nhờ AI nói chậm và sửa lỗi sau khi bạn nói xong.", "Không phải lúc nào AI cũng đúng; kiểm tra lại với tài liệu uy tín khi nghi ngờ."]
    },
    {
      type: "Từ điển có phiên âm và giọng đọc",
      criteria: ["Có IPA và âm thanh cho từng từ.", "Có câu ví dụ.", "Ưu tiên bản ngoại tuyến nếu cần."]
    }
  ],

  // ---- FAQ ----
  faq: [
    {
      q: "Học bao lâu thì nói được?",
      a: "Phụ thuộc điểm xuất phát, thời gian học mỗi ngày và mức độ luyện nói thực tế. Sau 12 tuần học đều, nhiều người có thể giao tiếp cơ bản trong tình huống quen thuộc (khoảng A2–B1), nhưng chưa thể nói lưu loát. Tiến bộ mỗi người khác nhau."
    },
    {
      q: "Không có người nói cùng thì sao?",
      a: "Bạn vẫn luyện được: shadowing, tự nói về một chủ đề và ghi âm, đóng vai hai bên trong hội thoại, hoặc luyện với trợ lý AI. Khi có điều kiện, tìm một bạn luyện hoặc nhóm hội thoại để thêm áp lực tự nhiên."
    },
    {
      q: "Nên học ngữ pháp trước hay nói trước?",
      a: "Nên làm song song. Học ngữ pháp qua mẫu câu bạn dùng ngay để nói, không học lý thuyết dài trước khi nói. Lộ trình này mỗi ngày dành thời gian cho mẫu câu và thời gian nói riêng."
    },
    {
      q: "Nếu bỏ lỡ vài ngày thì sao?",
      a: "Quay lại ngay, làm tiếp từ chỗ dừng; không cần học bù hết. Chuỗi ngày có thể đứt nhưng việc học vẫn tính. Nếu nghỉ hơn một tuần, nên ôn lại tuần gần nhất trước khi học tiếp."
    },
    {
      q: "Dữ liệu tiến độ lưu ở đâu?",
      a: "Lưu trong trình duyệt của bạn (localStorage) trên máy này. Xóa dữ liệu trình duyệt hoặc đổi máy sẽ mất; hãy dùng nút Xuất tiến độ để sao lưu ra file JSON."
    }
  ],

  // ---- Bài tự đánh giá đầu vào: 10 câu, độ khó tăng dần ----
  assessment: {
    levels: [
      { id: "A1", min: 0, max: 3, title: "Mức A1 · Bắt đầu", pace: "Nên chọn 60 phút/ngày nếu có thể (hoặc 90 phút nếu rảnh). Nếu chỉ có 30 phút, đi chậm và lặp lại tuần 1–2 khi cần. Tập trung phát âm và câu ngắn.", suggest: 60 },
      { id: "A2", min: 4, max: 7, title: "Mức A2 · Cơ bản", pace: "60 phút/ngày là hợp lý. Có thể đi nhanh tuần 1–2 và dành nhiều thời gian hơn cho hội thoại, nghe hiểu.", suggest: 60 },
      { id: "B1", min: 8, max: 10, title: "Mức B1 · Trung cấp", pace: "30–60 phút/ngày có thể đủ. Rút ngắn phần nền tảng, dành nhiều thời gian cho nói và kể chuyện từ tuần 5 trở đi.", suggest: 30 }
    ],
    disclaimer: "Đây là bài tự đánh giá nhanh để gợi ý tốc độ, không phải bài thi chuẩn hóa. Kết quả có thể lệch; hãy điều chỉnh theo cảm nhận của bạn.",
    questions: [
      { q: "Chọn câu đúng: \"She ___ a student.\"", options: ["am", "is", "are", "be"], answer: 1 },
      { q: "\"How are you?\" — Câu trả lời phù hợp nhất là:", options: ["I'm fine, thank you.", "I'm Linh.", "At home.", "Yes, I do."], answer: 0 },
      { q: "Chọn câu đúng: \"I ___ to school every day.\"", options: ["goes", "going", "go", "gone"], answer: 2 },
      { q: "\"What time is it?\" hỏi về điều gì?", options: ["Thời tiết", "Giờ giấc", "Giá tiền", "Địa điểm"], answer: 1 },
      { q: "Chọn câu đúng: \"There ___ two books on the table.\"", options: ["is", "am", "are", "be"], answer: 2 },
      { q: "Chọn từ phù hợp: \"Could you ___ me the way to the station?\"", options: ["say", "tell", "speak", "talk"], answer: 1 },
      { q: "Chọn câu đúng: \"Yesterday I ___ to the market.\"", options: ["go", "goes", "went", "going"], answer: 2 },
      { q: "Chọn câu đúng: \"If it rains tomorrow, we ___ at home.\"", options: ["stay", "will stay", "stayed", "would stayed"], answer: 1 },
      { q: "\"I've lived here ___ 2020.\"", options: ["for", "since", "from", "during"], answer: 1 },
      { q: "Chọn câu có nghĩa gần nhất với \"I'm not sure I can make it.\"", options: ["Tôi chắc chắn sẽ đến.", "Tôi chưa chắc có thể đến.", "Tôi chắc chắn không đến.", "Tôi đã đến rồi."], answer: 1 }
    ]
  }
};
