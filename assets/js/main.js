/* ANCS Corp — interactions
   Signal spine · fiber canvas · rack patch-panel · live hours · counters · form */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");
  addEventListener("load", () => document.body.classList.add("is-loaded"));
  setTimeout(() => document.body.classList.add("is-loaded"), 1200); // safety

  /* ---------------------------------------------------------------
     Only add REAL, verified client reviews here.
     { quote: "", name: "", role: "", stars: 5 }
  --------------------------------------------------------------- */
  const REVIEWS = [];

  /* ---------------- Optional media (graceful fallbacks) ---------------- */
  $$("img[data-optional-media]").forEach((img) => {
    const miss = () => img.classList.add("is-missing");
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener("error", miss);
  });
  $$("video[data-optional-media]").forEach((v) => {
    const ready = () => v.classList.add("is-ready");
    v.addEventListener("canplay", ready, { once: true });
    if (v.readyState >= 3) ready();
    if (reduce) v.pause();
  });

  /* Lazy-load gallery videos only when near the viewport */
  const lazyVids = $$("video[data-lazy-video]");
  if (lazyVids.length && !reduce) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (en.isIntersecting) {
          const s = v.querySelector("source[data-src]");
          if (s) { s.src = s.dataset.src; s.removeAttribute("data-src"); v.load(); }
          v.play().catch(() => {});
        } else v.pause();
      });
    }, { rootMargin: "200px" });
    lazyVids.forEach((v) => vio.observe(v));
  }

  /* ---------------- Header ---------------- */
  const hdr = $(".hdr");
  const burger = $("[data-burger]");
  const nav = $(".nav");
  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", () => {
    burger?.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }));

  /* ---------------- Spine + scroll state ---------------- */
  const root = document.documentElement;
  const navLinks = $$(".nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
    hdr.classList.toggle("is-stuck", scrollY > 20);
    let cur = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s; });
    navLinks.forEach((a) => a.classList.toggle("is-current", cur && a.getAttribute("href") === "#" + cur.id));
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------------- Reveal / nodes / counters ---------------- */
  const countUp = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const to = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = to + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("is-in", "is-lit");
      $$("[data-count]", el).forEach(countUp);
      if (el.matches("[data-count]")) countUp(el);
      const m = el.matches("[data-meter]") ? el : $("[data-meter]", el);
      if (m) { m.style.setProperty("--v", +m.dataset.meter / 100); m.classList.add("is-on"); }
      if (!el.matches("[data-node]")) io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, [data-node], .statrack, [data-meter]").forEach((el) => io.observe(el));

  /* ---------------- Live hours (America/New_York) ---------------- */
  // [day]: [openHour, closeHour] ; null = by appointment
  const HOURS = { 0: null, 1: [7, 18], 2: [7, 18], 3: [7, 18], 4: [7, 20], 5: [7, 18], 6: null };
  const updateStatus = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const h = (+get("hour") % 24) + (+get("minute")) / 60;
    const slot = HOURS[day];
    const open = slot && h >= slot[0] && h < slot[1];
    let text;
    if (open) {
      const close = slot[1] > 12 ? `${slot[1] - 12} PM` : `${slot[1]} AM`;
      text = `Open now · until ${close}`;
    } else if (!slot) {
      text = "By appointment today";
    } else {
      text = "After-hours service available";
    }
    $$("[data-status]").forEach((s) => {
      s.classList.toggle("is-open", !!open);
      s.classList.toggle("is-after", !open);
      $(".status__text", s).textContent = text;
    });
    $$("[data-hours] [data-day]").forEach((d) => d.classList.toggle("is-today", +d.dataset.day === day));
  };
  updateStatus();
  setInterval(updateStatus, 60_000);

  /* ---------------- Rack: tabs + patch cable ---------------- */
  const rack = $("[data-rack]");
  if (rack) {
    const units = $$(".unit", rack);
    const panels = $$(".spec", rack);
    const cable = $("[data-cable]", rack);
    const svg = $(".rack__cable", rack);

    const drawCable = (animate) => {
      const active = $(".unit.is-active", rack);
      const panel = $(".spec.is-active", rack);
      if (!active || !panel || getComputedStyle(svg).display === "none") return;
      const R = rack.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${R.width} ${R.height}`);
      const x1 = a.right - R.left - 6, y1 = a.top - R.top + a.height / 2;
      const x2 = p.left - R.left, y2 = Math.min(Math.max(y1, p.top - R.top + 40), p.bottom - R.top - 40);
      const mx = (x1 + x2) / 2;
      cable.setAttribute("d", `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      cable.style.setProperty("--cable", getComputedStyle(active).getPropertyValue("--c"));
      if (animate && !reduce) {
        cable.classList.remove("is-drawing");
        void cable.getBoundingClientRect();
        cable.classList.add("is-drawing");
      }
    };

    const select = (unit, focus) => {
      units.forEach((u) => {
        const on = u === unit;
        u.classList.toggle("is-active", on);
        u.setAttribute("aria-selected", String(on));
        u.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === unit.getAttribute("aria-controls");
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
      if (focus) unit.focus();
      requestAnimationFrame(() => drawCable(true));
      // On mobile, bring the spec into view
      if (matchMedia("(max-width: 980px)").matches && focus !== "init") {
        $(".spec.is-active", rack)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    };

    units.forEach((u, i) => {
      u.addEventListener("click", () => select(u));
      u.addEventListener("keydown", (e) => {
        const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === "Home") { e.preventDefault(); select(units[0], true); }
        else if (e.key === "End") { e.preventDefault(); select(units[units.length - 1], true); }
        else if (dir) { e.preventDefault(); select(units[(i + dir + units.length) % units.length], true); }
      });
      u.tabIndex = u.classList.contains("is-active") ? 0 : -1;
    });

    addEventListener("resize", () => drawCable(false));
    addEventListener("scroll", () => requestAnimationFrame(() => drawCable(false)), { passive: true });
    new IntersectionObserver(([en]) => { if (en.isIntersecting) drawCable(true); }, { threshold: 0.3 }).observe(rack);
  }

  /* ---------------- Fiber canvas (hero) ---------------- */
  const cv = $("[data-fiber]");
  if (cv) {
    const ctx = cv.getContext("2d");
    const COLORS = ["56,225,255", "56,225,255", "56,225,255", "255,179,64", "61,255,149"];
    let W, H, DPR, strands = [], raf, running = true;

    const build = () => {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.round(Math.min(46, Math.max(18, W / 34)));
      strands = Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        // strands fan in from the right edge and converge to a bundle point
        const sy = H * (-0.1 + t * 1.2);
        const ex = W * 0.42, ey = H * 0.52 + (t - 0.5) * H * 0.12;
        return {
          p0: [W + 40, sy],
          p1: [W * (0.8 - Math.random() * 0.1), sy + (Math.random() - 0.5) * 120],
          p2: [W * (0.6 + Math.random() * 0.05), ey + (Math.random() - 0.5) * 60],
          p3: [ex, ey],
          c: COLORS[(Math.random() * COLORS.length) | 0],
          pulses: Array.from({ length: 1 + (Math.random() * 2 | 0) }, () => ({ t: Math.random(), v: 0.0015 + Math.random() * 0.004 })),
          w: 0.6 + Math.random() * 0.9,
        };
      });
    };

    const bez = (s, t) => {
      const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      return [a * s.p0[0] + b * s.p1[0] + c * s.p2[0] + d * s.p3[0], a * s.p0[1] + b * s.p1[1] + c * s.p2[1] + d * s.p3[1]];
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const s of strands) {
        ctx.beginPath();
        ctx.moveTo(...s.p0);
        ctx.bezierCurveTo(...s.p1, ...s.p2, ...s.p3);
        ctx.strokeStyle = `rgba(${s.c},0.07)`;
        ctx.lineWidth = s.w;
        ctx.stroke();
        for (const p of s.pulses) {
          p.t += p.v;
          if (p.t > 1) { p.t = 0; p.v = 0.0015 + Math.random() * 0.004; }
          // comet tail
          for (let k = 0; k < 14; k++) {
            const tt = p.t - k * 0.006;
            if (tt < 0) break;
            const [x, y] = bez(s, tt);
            const a = (1 - k / 14) * 0.9;
            ctx.beginPath();
            ctx.arc(x, y, (k === 0 ? 2.2 : 1.4) * s.w, 0, 6.283);
            ctx.fillStyle = `rgba(${s.c},${a})`;
            ctx.fill();
          }
        }
      }
      // bundle core glow
      const cx = W * 0.42, cy = H * 0.52;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160);
      g.addColorStop(0, "rgba(56,225,255,.28)");
      g.addColorStop(1, "rgba(56,225,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - 160, cy - 160, 320, 320);
      ctx.globalCompositeOperation = "source-over";
      if (running) raf = requestAnimationFrame(frame);
    };

    build();
    if (reduce) { running = false; frame(); }
    else frame();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    // pause when hero offscreen
    new IntersectionObserver(([en]) => {
      if (reduce) return;
      if (en.isIntersecting && !running) { running = true; frame(); }
      else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }).observe(cv);
  }

  /* ---------------- Industries: light ports one by one ---------------- */
  const ports = $$(".port");
  if (ports.length) {
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      ports.forEach((p, i) => setTimeout(() => p.classList.add("is-in"), reduce ? 0 : 160 * i));
      obs.disconnect();
    }, { threshold: 0.3 }).observe($(".ports"));
  }

  /* ---------------- Reviews ---------------- */
  const rv = $("[data-reviews]");
  if (rv && REVIEWS.length) {
    rv.innerHTML = REVIEWS.map((r) => `
      <figure class="mod reveal is-in">
        <div class="review__stars" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}</div>
        <blockquote><p>${r.quote}</p></blockquote>
        <figcaption class="review__who">${r.name}${r.role ? " · " + r.role : ""}</figcaption>
      </figure>`).join("");
  }

  /* ---------------- Contact form ---------------- */
  const form = $("[data-form]");
  if (form) {
    const status = $("[data-form-status]", form);
    const email = $("#f-email", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.classList.remove("is-error");
      if (!email.value || !email.checkValidity()) {
        email.setAttribute("aria-invalid", "true");
        status.textContent = "Please enter a valid email so we can reach you.";
        status.classList.add("is-error");
        email.focus();
        return;
      }
      email.removeAttribute("aria-invalid");
      const data = new FormData(form);
      const endpoint = form.dataset.endpoint;
      status.textContent = "Transmitting…";
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(res.status);
        } else {
          await new Promise((r) => setTimeout(r, 700)); // demo mode (no backend configured)
        }
        form.reset();
        status.textContent = "✓ Signal received. ANCS will be in touch shortly.";
      } catch {
        status.textContent = "Couldn't send right now. Please call 786-400-7445.";
        status.classList.add("is-error");
      }
    });
  }

  $$("[data-year]").forEach((y) => (y.textContent = new Date().getFullYear()));
})();
