/* ============================================================
 * ipa.js — Từ điển IPA nhỏ (chuẩn Mỹ, gần đúng) cho các từ trong kho câu luyện nói.
 * Ý tưởng lấy từ english-daily/js/ipa.js nhưng chép riêng, không liên kết chéo.
 * Từ KHÔNG có trong từ điển trả về null: không đoán IPA, không bịa.
 * Đăng ký vào window.RM.ipa.
 * ============================================================ */
(function () {
  "use strict";
  window.RM = window.RM || {};

  const DICT = {
    // chào hỏi
    hi: "haɪ", hello: "həˈloʊ", how: "haʊ", are: "ɑːr", you: "juː", doing: "ˈduːɪŋ", today: "təˈdeɪ",
    "i'm": "aɪm", great: "ɡreɪt", thanks: "θæŋks", thank: "θæŋk", and: "ænd", pretty: "ˈprɪti",
    good: "ɡʊd", nice: "naɪs", to: "tuː", see: "siː", again: "əˈɡɛn", meet: "miːt",
    my: "maɪ", name: "neɪm", is: "ɪz", where: "wɛr", from: "frʌm", could: "kʊd", say: "seɪ",
    that: "ðæt", please: "pliːz", "it's": "ɪts", been: "bɪn", a: "ə", while: "waɪl",
    "let's": "lɛts", catch: "kætʃ", up: "ʌp", over: "ˈoʊvər", coffee: "ˈkɔːfi", sometime: "ˈsʌmtaɪm",
    time: "taɪm", no: "noʊ", long: "lɔːŋ", take: "teɪk", care: "kɛr", new: "nuː", not: "nɑːt",
    much: "mʌtʃ", keep: "kiːp", in: "ɪn", touch: "tʌtʃ", yes: "jɛs", i: "aɪ", the: "ðə", of: "ʌv",
    // gia đình, thói quen
    have: "hæv", two: "tuː", three: "θriː", brothers: "ˈbrʌðərz", sister: "ˈsɪstər", family: "ˈfæməli",
    usually: "ˈjuːʒuəli", get: "ɡɛt", what: "wʌt", do: "duː", many: "ˈmɛni", mother: "ˈmʌðər",
    father: "ˈfɑːðər", live: "lɪv", with: "wɪð", parents: "ˈpɛrənts", wake: "weɪk", every: "ˈɛvri",
    morning: "ˈmɔːrnɪŋ", at: "æt", six: "sɪks", seven: "ˈsɛvən", ten: "tɛn", five: "faɪv",
    // nhà hàng
    table: "ˈteɪbəl", for: "fɔːr", menu: "ˈmɛnjuː", recommend: "ˌrɛkəˈmɛnd", grilled: "ɡrɪld",
    salmon: "ˈsæmən", very: "ˈvɛri", popular: "ˈpɑːpjələr", sounds: "saʊndz", "i'll": "aɪl",
    bill: "bɪl", order: "ˈɔːrdər", here: "hɪr", go: "ɡoʊ", split: "splɪt", "i'd": "aɪd", like: "laɪk",
    allergic: "əˈlɜːrdʒɪk", we: "wi", water: "ˈwɔːtər", without: "wɪˈðaʊt", ice: "aɪs",
    // mua sắm
    excuse: "ɪkˈskjuːz", me: "miː", shirt: "ʃɜːrt", twenty: "ˈtwɛnti", dollars: "ˈdɑːlərz",
    larger: "ˈlɑːrdʒər", size: "saɪz", this: "ðɪs", pay: "peɪ", by: "baɪ", card: "kɑːrd", can: "kæn",
    sale: "seɪl", receipt: "rɪˈsiːt", try: "traɪ", it: "ɪt", on: "ɑːn", room: "ruːm",
    discount: "ˈdɪskaʊnt", just: "dʒʌst", looking: "ˈlʊkɪŋ", cash: "kæʃ", price: "praɪs",
    // đường đi
    station: "ˈsteɪʃən", straight: "streɪt", turn: "tɜːrn", left: "lɛft", right: "raɪt", corner: "ˈkɔːrnər",
    far: "fɑːr", about: "əˈbaʊt", minute: "ˈmɪnɪt", minutes: "ˈmɪnɪts", walk: "wɔːk", it: "ɪt",
    street: "striːt", next: "nɛkst", bank: "bæŋk", does: "dʌz", way: "weɪ", across: "əˈkrɔːs", around: "əˈraʊnd",
    // điện thoại, công việc
    speak: "spiːk", speaking: "ˈspiːkɪŋ", slowly: "ˈsloʊli", more: "mɔːr", message: "ˈmɛsɪdʒ", leave: "liːv",
    meeting: "ˈmiːtɪŋ", tomorrow: "təˈmɑːroʊ", sure: "ʃʊr", works: "wɜːrks", send: "sɛnd",
    deadline: "ˈdɛdlaɪn", back: "bæk", same: "seɪm", page: "peɪdʒ", help: "hɛlp", with: "wɪð",
    work: "wɜːrk", call: "kɔːl", available: "əˈveɪləbəl", hold: "hoʊld", afternoon: "ˌæftərˈnuːn",
    // sức khỏe
    headache: "ˈhɛdeɪk", sore: "sɔːr", throat: "θroʊt", fever: "ˈfiːvər", doctor: "ˈdɑːktər",
    appointment: "əˈpɔɪntmənt", medicine: "ˈmɛdɪsɪn", twice: "twaɪs", day: "deɪ", days: "deɪz",
    felt: "fɛlt", should: "ʃʊd", some: "sʌm", rest: "rɛst", need: "niːd", make: "meɪk", feel: "fiːl",
    // thời tiết, sở thích
    weather: "ˈwɛðər", cloudy: "ˈklaʊdi", rain: "reɪn", later: "ˈleɪtər", bring: "brɪŋ", umbrella: "ʌmˈbrɛlə",
    hot: "hɑːt", sunny: "ˈsʌni", weekend: "ˈwiːkɛnd", free: "friː", enjoy: "ɪnˈdʒɔɪ", playing: "ˈpleɪɪŋ",
    guitar: "ɡɪˈtɑːr", reading: "ˈriːdɪŋ", would: "wʊd", play: "pleɪ", together: "təˈɡɛðər",
    // quá khứ
    last: "læst", was: "wʌz", were: "wɜːr", then: "ðɛn", after: "ˈæftər", first: "fɜːrst",
    happened: "ˈhæpənd", really: "ˈrɪəli", went: "wɛnt", saw: "sɔː", yesterday: "ˈjɛstərdeɪ",
    // du lịch, khách sạn
    reservation: "ˌrɛzərˈveɪʃən", under: "ˈʌndər", breakfast: "ˈbrɛkfəst", included: "ɪnˈkluːdɪd",
    flight: "flaɪt", gate: "ɡeɪt", boarding: "ˈbɔːrdɪŋ", pass: "pæs", luggage: "ˈlʌɡɪdʒ", window: "ˈwɪndoʊ",
    seat: "siːt", delayed: "dɪˈleɪd", key: "kiː", problem: "ˈprɑːbləm", there: "ðɛr", check: "tʃɛk",
    // tổng ôn
    think: "θɪŋk", second: "ˈsɛkənd", mean: "miːn", question: "ˈkwɛstʃən", example: "ɪɡˈzæmpəl",
    give: "ɡɪv", let: "lɛt", an: "æn", so: "soʊ", but: "bʌt", because: "bɪˈkɔːz", want: "wɑːnt",
    know: "noʊ", your: "jɔːr", they: "ðeɪ", he: "hi", she: "ʃi", will: "wɪl", would: "wʊd"
  };

  /** IPA của một từ trong từ điển, hoặc null nếu không có. */
  function word(w) {
    const key = String(w).toLowerCase().replace(/[^a-z']/g, "");
    if (Object.prototype.hasOwnProperty.call(DICT, key)) return DICT[key];
    return Object.prototype.hasOwnProperty.call(EXTRA, key) ? EXTRA[key] : null;
  }
  /** Từ điển phụ do tab Từ vựng nạp (bản nháp, chỉ khi người dùng bật). DICT luôn được ưu tiên. */
  const EXTRA = Object.create(null);
  function clearExtra() { Object.keys(EXTRA).forEach(function (k) { delete EXTRA[k]; }); }
  function setExtra(map) {
    clearExtra();
    Object.keys(map || {}).forEach(function (k) {
      if (/^[a-z']{1,40}$/.test(k) && typeof map[k] === "string" && map[k]) EXTRA[k] = map[k];
    });
  }

  function clean(ipa) { return ipa.replace(/[ˈˌː\s]/g, ""); }

  /** Levenshtein cho hai mảng/chuỗi bất kỳ. */
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    let prev = [], cur = [];
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur = [i];
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      prev = cur;
    }
    return prev[n];
  }

  /** Độ giống (0..100) của hai từ theo IPA; null nếu thiếu IPA của một trong hai. */
  function similarity(w1, w2) {
    const a = word(w1), b = word(w2);
    if (a == null || b == null) return null;
    const x = clean(a), y = clean(b);
    const len = Math.max(x.length, y.length);
    if (!len) return null;
    return Math.max(0, Math.round(100 - (levenshtein(x, y) / len) * 100));
  }

  /** Phiên âm cả cụm; từ nào không có trong từ điển hiển thị "?" (không đoán). */
  function phrase(words) {
    return words.map(function (w) { const p = word(w); return p == null ? "?" : p; }).join(" ");
  }

  window.RM.ipa = { word: word, similarity: similarity, phrase: phrase, levenshtein: levenshtein, setExtra: setExtra, clearExtra: clearExtra, size: Object.keys(DICT).length };
  if (typeof module !== "undefined" && module.exports) module.exports = window.RM.ipa;
})();
