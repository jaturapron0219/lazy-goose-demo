// =====================================================
// calculator.js — เครื่องคิดเลขสำหรับหน้าแบบทดสอบ/เกมท้ายบท
// คำนวณเอง (ไม่ใช้ eval): + − × ÷ วงเล็บไม่มี, ลำดับการคำนวณ ×÷ ก่อน +−
// =====================================================
(function () {
    const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="2.5" width="15" height="19" rx="2.5"/><rect x="7.5" y="5.5" width="9" height="4" rx="1"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/></svg>';

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-button calc-toggle";
    btn.setAttribute("aria-label", "เครื่องคิดเลข");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = ICON;

    const panel = document.createElement("div");
    panel.className = "calc-panel";
    panel.hidden = true;
    panel.innerHTML = `
        <div class="calc-head"><span>เครื่องคิดเลข</span><button type="button" class="calc-close" aria-label="ปิด">✕</button></div>
        <div class="calc-display"><div class="calc-expr"></div><div class="calc-result">0</div></div>
        <div class="calc-keys">
            <button type="button" class="clear" data-k="C">C</button>
            <button type="button" class="clear" data-k="back">⌫</button>
            <button type="button" class="op" data-k="%">%</button>
            <button type="button" class="op" data-k="÷">÷</button>
            <button type="button" data-k="7">7</button><button type="button" data-k="8">8</button><button type="button" data-k="9">9</button>
            <button type="button" class="op" data-k="×">×</button>
            <button type="button" data-k="4">4</button><button type="button" data-k="5">5</button><button type="button" data-k="6">6</button>
            <button type="button" class="op" data-k="−">−</button>
            <button type="button" data-k="1">1</button><button type="button" data-k="2">2</button><button type="button" data-k="3">3</button>
            <button type="button" class="op" data-k="+">+</button>
            <button type="button" data-k="0">0</button><button type="button" data-k=".">.</button>
            <button type="button" class="equals" data-k="=">=</button>
        </div>`;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    const exprEl = panel.querySelector(".calc-expr");
    const resEl = panel.querySelector(".calc-result");
    const OPS = "+−×÷";
    let expr = "";
    let justDone = false;

    function fmt(n) {
        if (!isFinite(n)) return "หารด้วย 0 ไม่ได้";
        const r = Math.round(n * 1e10) / 1e10;
        return String(r);
    }

    function evaluate(s) {
        // แยกตัวเลข/เครื่องหมาย
        const t = s.match(/\d*\.?\d+%?|[+−×÷]/g);
        if (!t) return NaN;
        const nums = [], ops = [];
        let expectNum = true;
        for (const x of t) {
            if (OPS.includes(x)) {
                if (expectNum) { if (x === "−") { nums.push(0); ops.push("−"); continue; } return NaN; }
                ops.push(x); expectNum = true;
            } else {
                nums.push(x.endsWith("%") ? parseFloat(x) / 100 : parseFloat(x));
                expectNum = false;
            }
        }
        if (expectNum) ops.pop();
        // × ÷ ก่อน
        const n2 = [nums[0]], o2 = [];
        ops.forEach((o, i) => {
            const b = nums[i + 1];
            if (o === "×") n2.push(n2.pop() * b);
            else if (o === "÷") n2.push(n2.pop() / b);
            else { o2.push(o); n2.push(b); }
        });
        return o2.reduce((acc, o, i) => o === "+" ? acc + n2[i + 1] : acc - n2[i + 1], n2[0]);
    }

    function render() {
        exprEl.textContent = expr;
        if (!justDone) {
            const v = evaluate(expr);
            resEl.textContent = expr === "" ? "0" : (isNaN(v) ? resEl.textContent : fmt(v));
        }
    }

    function press(k) {
        const last = expr.slice(-1);
        if (k === "C") { expr = ""; justDone = false; resEl.textContent = "0"; }
        else if (k === "back") { expr = expr.slice(0, -1); justDone = false; }
        else if (k === "=") {
            const v = evaluate(expr);
            if (!isNaN(v)) { resEl.textContent = fmt(v); expr = isFinite(v) ? fmt(v) : ""; justDone = true; exprEl.textContent = ""; return; }
        }
        else if (OPS.includes(k)) {
            justDone = false;
            if (expr === "" && k !== "−") return;
            expr = OPS.includes(last) ? expr.slice(0, -1) + k : expr + k;
        }
        else if (k === "%") {
            if (/\d$/.test(expr)) expr += "%";
        }
        else if (k === ".") {
            if (justDone) { expr = ""; justDone = false; }
            const cur = expr.split(/[+−×÷]/).pop();
            if (!cur.includes(".")) expr += (cur === "" ? "0." : ".");
        }
        else {
            if (justDone) { expr = ""; justDone = false; }
            if (last === "%") return;
            expr += k;
        }
        render();
    }

    panel.querySelectorAll(".calc-keys button").forEach(b => b.addEventListener("click", () => press(b.dataset.k)));

    function toggle(open) {
        panel.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
    }
    btn.addEventListener("click", e => { e.stopPropagation(); toggle(panel.hidden); });
    panel.querySelector(".calc-close").addEventListener("click", () => toggle(false));
    document.addEventListener("keydown", e => {
        if (panel.hidden) return;
        const map = { "*": "×", "/": "÷", "-": "−", "+": "+", Enter: "=", "=": "=", Backspace: "back", Escape: "close", Delete: "C", "%": "%", ".": "." };
        const k = /^\d$/.test(e.key) ? e.key : map[e.key];
        if (!k) return;
        e.preventDefault();
        if (k === "close") toggle(false); else press(k);
    });
})();
