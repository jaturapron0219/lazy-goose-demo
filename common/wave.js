/* wave.js — ถ้าเต่าทองฝั่งซ้ายไปบังเนื้อหา ให้ย้ายไปฝั่งขวา (ตรวจทุกครั้งที่ขนาดจอเปลี่ยน) */
(function () {
    const bug = document.querySelector(".lg-ladybug");
    if (!bug) return;

    // นับเฉพาะสิ่งที่มองเห็นจริง: มีตัวหนังสือ รูป ปุ่ม พื้นสี หรือเส้นขอบ
    function paints(el) {
        if (/^(IMG|SVG|BUTTON|INPUT|CANVAS|path|circle|rect|line|polygon|text)$/i.test(el.tagName)) return true;
        for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
        const cs = getComputedStyle(el);
        if (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") return true;
        if (cs.backgroundImage !== "none") return true;
        if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) return true;
        return false;
    }

    function blocked() {
        const r = bug.getBoundingClientRect();
        if (!r.width) return false;
        const vw = innerWidth, vh = innerHeight;
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                const x = r.left + r.width * i / 4, y = r.top + r.height * j / 4;
                for (const el of document.elementsFromPoint(x, y)) {
                    if (el === bug || el.closest(".lg-wave")) continue;
                    if (el === document.body || el === document.documentElement) continue;
                    const b = el.getBoundingClientRect();
                    if (b.width * b.height > vw * vh * 0.35) continue;   // กล่องพื้นหลังใหญ่ ๆ ไม่นับ
                    if (paints(el)) return true;
                }
            }
        }
        return false;
    }

    function place() {
        bug.classList.remove("on-right");
        if (blocked()) bug.classList.add("on-right");
        bug.classList.add("placed");
    }

    place();   // เลือกฝั่งทันทีก่อนหน้าแสดงครั้งแรก
    window.addEventListener("resize", place);
})();
