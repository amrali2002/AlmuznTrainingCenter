/* ==== الإعدادات: عدّل البيانات هنا فقط ==== */
const CONFIG = {
  name: "المُزن لخدمات التدريب",
  license: "0000000",
  licenseBody: "وزارة / الجهة المانحة للترخيص",
  whatsapp: "96878570379",        // بصيغة دولية بدون + أو أصفار
  phone: "96878570379",            // بصيغة دولية بدون + أو أصفار
  phoneShow: "+968 7857 0379",
  address: "المدينة، الحي، الشارع، رقم المبنى",
  hours: [
    ["الأحد – الخميس", "٨:٠٠ ص – ٤:٠٠ م"],
    ["الجمعة – السبت", "مغلق"]
  ],
  paymentLink: "",                 // رابط بوابة الدفع (اتركه فارغًا لإخفاء الزر)
  bank: { bank: "اسم البنك", holder: "اسم صاحب الحساب", iban: "SA00 0000 0000 0000 0000 0000" },
  waMessage: "مرحبًا، أرغب في معرفة المزيد عن خدماتكم وتحديد الخطوة المناسبة لطفلي."
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

/* تعبئة البيانات */
$$("[data-cfg]").forEach(el => { el.textContent = CONFIG[el.dataset.cfg] ?? el.textContent; });
$$("[data-wa]").forEach(a => a.href = waUrl(CONFIG.waMessage));
$$("[data-tel]").forEach(a => a.href = `tel:+${CONFIG.phone}`);
$("#hours").innerHTML = CONFIG.hours.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join("");
$("#yr").textContent = new Date().getFullYear();

/* قائمة الموبايل */
const burger = $("#burger"), nav = $("#nav");
const closeNav = () => { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); };
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
});
$$("a", nav).forEach(a => a.addEventListener("click", closeNav));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });

/* طرق الدفع */
const B = CONFIG.bank;
const PAY = {
  card: `<p>الدفع الإلكتروني الآمن بالبطاقة.</p><ol><li>اضغطوا «ادفعوا الآن».</li><li>أدخلوا بيانات البطاقة في صفحة الدفع.</li><li>يصلكم إيصال التأكيد وتُحجز جلستكم.</li></ol>`,
  transfer: `<p>حوّلوا المبلغ إلى الحساب التالي:</p><p><b>${B.bank}</b><br>${B.holder}<br><bdi dir="ltr">${B.iban}</bdi></p><p>أرسلوا صورة الإيصال عبر واتساب لتأكيد الحجز.</p>`,
  cash: `<p>يمكنكم الدفع عند الحضور في المركز، نقدًا أو بالبطاقة، قبل بدء الجلسة.</p>`
};
const payBtn = $("#payBtn");
function setPay(m) {
  $$(".pay__opt").forEach(b => {
    const on = b.dataset.m === m;
    b.classList.toggle("is-on", on);
    b.setAttribute("aria-checked", String(on));
  });
  $("#payPanel").innerHTML = PAY[m];
  if (m === "card" && CONFIG.paymentLink) { payBtn.hidden = false; payBtn.href = CONFIG.paymentLink; }
  else if (m === "transfer") { payBtn.hidden = false; payBtn.textContent = "أرسلوا الإيصال عبر واتساب"; payBtn.href = waUrl("مرحبًا، هذا إيصال التحويل البنكي."); return; }
  else payBtn.hidden = true;
  payBtn.textContent = "ادفعوا الآن";
}
$$(".pay__opt").forEach(b => b.addEventListener("click", () => setPay(b.dataset.m)));
setPay("card");

/* النموذج: تحقق ثم إرسال عبر واتساب */
const form = $("#form");
const setErr = (input, msg) => {
  const box = input.closest("label").querySelector(".err");
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  if (box) box.textContent = msg;
  return !msg;
};
const toEn = s => s.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
form.addEventListener("submit", e => {
  e.preventDefault();
  const f = form.elements;
  const phone = toEn(f.phone.value).replace(/[\s\-()]/g, "");
  const results = [
    setErr(f.name, f.name.value.trim().length < 2 ? "اكتبوا اسم ولي الأمر." : ""),
    setErr(f.phone, /^\+?\d{8,15}$/.test(phone) ? "" : "اكتبوا رقم جوال صحيحًا."),
    setErr(f.age, f.age.value ? "" : "اختاروا الفئة العمرية.")
  ];
  const agreeOk = f.agree.checked;
  $("#agreeErr").textContent = agreeOk ? "" : "نحتاج موافقتكم للتواصل معكم.";
  if (!results.every(Boolean) || !agreeOk) { const bad = $("[aria-invalid=true]", form); if (bad) bad.focus(); return; }

  const msg = [
    "طلب تواصل جديد",
    `ولي الأمر: ${f.name.value.trim()}`,
    `الجوال: ${phone}`,
    `عمر الطفل: ${f.age.value}`,
    `الاهتمام: ${f.topic.value}`,
    `الوقت المفضل: ${f.time.value}`
  ].join("\n");
  window.open(waUrl(msg), "_blank", "noopener");
  $("#ok").hidden = false;
  form.reset();
});
$$("input,select", form).forEach(el => el.addEventListener("input", () => el.type !== "checkbox" && el.type !== "radio" && setErr(el, "")));
