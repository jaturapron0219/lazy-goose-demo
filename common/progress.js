/* =====================================================
   progress.js — จัดแถบด่าน 1-5 ใหม่
   ย้ายวงกลมและเส้นไปไว้ในแถบที่กว้างเต็มจอ เพิ่มเส้นหัว-ท้าย
   และวางรูปห่านไว้ใต้วงกลมของด่านปัจจุบัน
===================================================== */
(function () {
    const container = document.querySelector(".progress-container");
    const steps = [...document.querySelectorAll(".progress-step")];
    if (!container || !steps.length) return;

    const lines = [...document.querySelectorAll(".progress-line")];
    const track = document.createElement("div");
    track.className = "pb-track";

    const lead = document.createElement("div");
    lead.className = "pb-edge completed";
    const tail = document.createElement("div");
    tail.className = "pb-edge";

    track.appendChild(lead);
    steps.forEach((step, i) => {
        track.appendChild(step);
        if (lines[i]) track.appendChild(lines[i]);
    });
    track.appendChild(tail);

    const info = container.querySelector(".progress-info");
    if (info && info.nextSibling) container.insertBefore(track, info.nextSibling);
    else container.insertBefore(track, container.firstChild);

    // แถบกว้างเต็มจอ (ขอบซ้ายถึงขอบขวา)
    // วงกลมยังอยู่ในช่วงความกว้างเดิมของแถบ ส่วนเส้นหัว-ท้ายยืดออกไปถึงขอบจอ
    function stretch() {
        track.style.width = "";
        track.style.marginLeft = "0px";
        lead.style.flexBasis = tail.style.flexBasis = "0px";
        const c = container.getBoundingClientRect();
        const w = document.documentElement.clientWidth;
        const side = Math.max(8, c.left);
        track.style.width = w + "px";
        track.style.marginLeft = (-c.left) + "px";
        lead.style.flexBasis = side + "px";
        tail.style.flexBasis = Math.max(8, w - c.right) + "px";
    }

    // หน้าคะแนนมีรูปห่านใหญ่อยู่แล้ว จึงวางห่านเฉพาะหน้าเกม
    const showGoose = !/score\.html/i.test(location.pathname);
    const goose = document.createElement("img");
    goose.className = "pb-goose";
    goose.src = "../pics/goose.svg";
    goose.alt = "";

    function update() {
        const circles = steps.map(s => s.querySelector(".step-circle"));
        const last = circles[circles.length - 1];
        tail.classList.toggle("completed", !!last && last.classList.contains("completed"));
        if (!showGoose) return;
        let target = circles.findIndex(c => c && c.classList.contains("active"));
        if (target < 0) {
            const done = circles.filter(c => c && c.classList.contains("completed")).length;
            target = Math.min(done, circles.length - 1);
        }
        if (goose.parentElement !== steps[target]) steps[target].appendChild(goose);
        // ด่านสุดท้าย: ขยับห่านไปทางซ้ายเล็กน้อย ไม่ให้ซ้อนกับปุ่มฟันเฟือง
        goose.classList.toggle("at-end", target === circles.length - 1);
    }

    update();
    stretch();
    container.classList.add("pb-ready");
    new MutationObserver(update).observe(track, { subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", stretch);
    window.addEventListener("load", stretch);
})();
