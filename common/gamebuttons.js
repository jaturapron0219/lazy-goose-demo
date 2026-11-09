// =====================================================
// gamebuttons.js — ย้ายปุ่ม "ส่งคำตอบ" และ "ถัดไป" มาไว้ใต้ <body> โดยตรง
// เพื่อให้ตำแหน่งตาม gamebuttons.css ถูกต้องทุกหน้า
// (บางหน้ามีปุ่มอยู่ในกล่องที่ถูก transform ทำให้ position: fixed เพี้ยน)
// ปุ่มยังเป็นตัวเดิม event ที่ผูกไว้ในไฟล์เกมจึงทำงานเหมือนเดิม
// =====================================================

(function () {
    ["submitButton", "nextButton"].forEach(id => {
        const button = document.getElementById(id);
        if (button && button.parentElement !== document.body) {
            document.body.appendChild(button);
        }
    });

    // ป๊อปอัปเฉลยก็ย้ายมาไว้ใต้ <body> ด้วย เพื่อให้อยู่กลางจอเสมอ
    document.querySelectorAll(".feedback-overlay").forEach(overlay => {
        if (overlay.parentElement !== document.body) {
            document.body.appendChild(overlay);
        }
    });
})();

// =====================================================
// ดันกรอบโจทย์ลงมาให้อยู่ใต้ปุ่มฟันเฟือง (ไม่ทับกัน) ทุกขนาดจอ
// =====================================================
(function () {
    function fit() {
        const gear = document.getElementById("settingsButton");
        const box = document.querySelector(".ask-container, .ask-btn, .ask-btn1");
        if (!box) return;
        // สิ่งที่กรอบโจทย์ห้ามทับ: ปุ่มฟันเฟือง และแถบความคืบหน้า (ด่าน 1-5)
        // (บางหน้ามี div ที่ไม่ได้ปิด ทำให้กล่องแถบด่านครอบโจทย์ไว้ด้วย จึงข้ามตัวที่ครอบกรอบโจทย์)
        const obstacles = [gear, ...document.querySelectorAll(".progress-bar, .progress-info, .pb-track, .pb-goose")]
            .filter(o => o && !o.contains(box));
        box.style.removeProperty("margin-top");
        for (let i = 0; i < 4; i++) {
            const b = box.getBoundingClientRect();
            let gap = 0;
            obstacles.forEach(o => {
                const r = o.getBoundingClientRect();
                if (!r.width || b.right < r.left || b.left > r.right) return;
                if (r.top > b.bottom) return;
                gap = Math.max(gap, (r.bottom + 10) - b.top);
            });
            if (gap <= 0) break;
            const current = parseFloat(getComputedStyle(box).marginTop) || 0;
            box.style.setProperty("margin-top", (current + gap) + "px", "important");
        }
    }
    fit();
    window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();

// ไม่ให้อัตราส่วน เช่น "2 : 3" ถูกตัดขึ้นบรรทัดใหม่กลางตัวเลข
(function () {
    document.querySelectorAll(".ask-btn, .ask-btn1, .ask-btn2").forEach(box => {
        const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            node.nodeValue = node.nodeValue.replace(/(\d)\s*:\s*(?=\d)/g, "$1 : ");
        }
    });
})();

// =====================================================
// จัดระยะให้สมดุลทุกขนาดจอ:
//  - ช่องตัวเลข/ลูกศร ต้องอยู่ใต้กรอบโจทย์ (ไม่ทับ)
//  - และต้องอยู่เหนือปุ่มส่งคำตอบ ถ้าไม่พอจะลดขนาดตัวอักษรโจทย์ลงทีละนิด
// =====================================================
(function () {
    const GAP = 18;

    function balance() {
        const area = document.querySelector(".ratio-area, .balloon-area, .basket-area");
        const submit = document.getElementById("submitButton");
        const boxes = [...document.querySelectorAll(".ask-btn, .ask-btn1, .ask-btn2")];
        if (!area || !submit || !boxes.length) return;

        area.style.removeProperty("margin-top");
        area.style.removeProperty("transform");
        area.style.removeProperty("margin-bottom");
        boxes.forEach(b => b.style.removeProperty("font-size"));

        let fontSize = parseFloat(getComputedStyle(boxes[0]).fontSize) || 15;

        for (let i = 0; i < 8; i++) {
            const qBottom = Math.max(...boxes.map(b => b.getBoundingClientRect().bottom));
            const top = area.getBoundingClientRect().top;
            const need = qBottom + GAP - top;
            if (need > 0) {
                const current = parseFloat(getComputedStyle(area).marginTop) || 0;
                area.style.setProperty("margin-top", (current + need) + "px", "important");
            }
            const areaBottom = area.getBoundingClientRect().bottom;
            if (areaBottom <= submit.getBoundingClientRect().top - 12 || fontSize <= 14) break;
            // พื้นที่ไม่พอ → ลดตัวอักษรโจทย์ แล้วคำนวณใหม่
            fontSize -= 0.75;
            area.style.removeProperty("margin-top");
            boxes.forEach(b => b.style.setProperty("font-size", fontSize + "px", "important"));
        }

        // ขยายรูปตรงกลาง (ลูกโป่ง/ตะกร้า/ช่องตัวเลข) ให้ใหญ่ขึ้น ~1.3 เท่า
        // แต่ไม่เกินพื้นที่ระหว่างโจทย์กับปุ่มส่งคำตอบ และไม่เกินความกว้างจอ
        // ขยายเฉพาะเกมตะกร้าลูกบอล; เกมอื่นใช้ขนาดเดิม (ย่อเมื่อพื้นที่ไม่พอเท่านั้น)
        const BIG = area.classList.contains("basket-area") ? 1.3 : 1;
        const r = area.getBoundingClientRect();
        const room = submit.getBoundingClientRect().top - 16 - r.top;
        const widthRoom = (document.documentElement.clientWidth - 24) / r.width;
        let scale = Math.min(BIG, room / r.height, widthRoom);
        scale = Math.max(0.55, scale);
        if (room > 40 && Math.abs(scale - 1) > 0.01) {
            area.style.setProperty("transform", `scale(${scale})`, "important");
            area.style.setProperty("transform-origin", "top center", "important");
            area.style.setProperty("margin-bottom", `${r.height * (scale - 1)}px`, "important");
        }
    }

    balance();
    window.addEventListener("load", balance);
    window.addEventListener("resize", balance);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(balance);
})();

// เส้นเชือกลูกโป่งให้ตรงกับตำแหน่งลูกโป่งแบบเดียวกับแบบทดสอบรวมบท
(function () {
    const svg = document.querySelector(".balloon-area .strings");
    if (!svg) return;
    svg.setAttribute("viewBox", "0 0 300 260");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML =
        '<line x1="62" y1="140" x2="150" y2="245"/>' +
        '<line x1="150" y1="90" x2="150" y2="245"/>' +
        '<line x1="238" y1="150" x2="150" y2="245"/>' +
        '<circle cx="150" cy="245" r="6"/>';
})();

// จัดระยะครั้งแรกเสร็จแล้ว แสดงกรอบโจทย์และตัวเลือก
document.documentElement.classList.add("gb-ready");

// =====================================================
// จัดกรอบโจทย์และพื้นที่ตัวเลือกให้อยู่กึ่งกลางหน้าจอเสมอ ทุกขนาดจอ
// (บางหน้ากล่องที่ครอบอยู่ไม่ได้อยู่กลางจอ จึงเลื่อนชดเชยด้วย translate)
// =====================================================
(function () {
    const SEL = ".ask-container, body > .ask-btn, .ask-btn:not(.ask-container .ask-btn), .ratio-area, .balloon-area, .basket-area";
    function center() {
        const vw = document.documentElement.clientWidth;
        document.querySelectorAll(SEL).forEach(el => {
            if (el.closest(".ask-container") && el !== el.closest(".ask-container")) return;
            el.style.removeProperty("translate");
            const r = el.getBoundingClientRect();
            if (!r.width) return;
            const off = (r.left + r.right) / 2 - vw / 2;
            if (Math.abs(off) > 1) el.style.setProperty("translate", `${-off}px 0`, "important");
        });
    }
    center();
    window.addEventListener("load", center);
    window.addEventListener("resize", center);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(center);
    setTimeout(center, 300);
})();
