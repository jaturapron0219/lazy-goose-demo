// fontload.js — สั่งโหลดฟอนต์ทุกแบบตั้งแต่ต้นหน้า (อยู่ใน <head>)
// ปุ่ม/หัวข้อที่ใช้ตัวหนาหรือตัวเอียงจะมีฟอนต์พร้อมตอนแสดงครั้งแรก ไม่เห็นตัวหนังสือหายแวบ
(function () {
    if (!document.fonts || !document.fonts.load) return;
    ["400 1em Kimchi", "700 1em Kimchi", "italic 400 1em Kimchi", "italic 700 1em Kimchi"].forEach(f => document.fonts.load(f, "กa1").catch(() => {}));
})();
