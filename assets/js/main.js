/**
 * Harshil Kaneria — portfolio interactions
 * Smooth scroll, intro, text reveals, cursor, attention map, training run, AI twin.
 * The 3D scenes live in scene.js and talk to this file through window events.
 */
(function () {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  const RESUME_URL = 'https://drive.google.com/drive/folders/13eFBkf4dUJCc2UqfdoVkQ5FfCR2Wn5Eg?usp=sharing';
  const EMAIL = 'harshilkaneriya26202@gmail.com';

  //--------------------------------------------------------------
  // Toast
  //--------------------------------------------------------------
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  }

  //--------------------------------------------------------------
  // Theme
  //--------------------------------------------------------------
  const themeBtn = $('#theme-toggle');
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    themeBtn.querySelector('i').className = t === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    $('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0a0a0c' : '#f6f6f3');
    window.dispatchEvent(new CustomEvent('hk:theme', { detail: t }));
  }
  function toggleTheme() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    store.set('hk-theme', next);
    applyTheme(next);
  }
  themeBtn.addEventListener('click', toggleTheme);
  applyTheme(html.getAttribute('data-theme') || 'dark');

  //--------------------------------------------------------------
  // Smooth scroll (Lenis) with a native fallback
  //--------------------------------------------------------------
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  function scrollToTarget(target) {
    const el = typeof target === 'string' ? (target === '#top' ? html : $(target)) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el === html ? 0 : el, { offset: el === html ? 0 : -8 });
    else if (el === html) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    const el = hash === '#top' ? html : $(hash);
    if (!el) return;
    e.preventDefault();
    setMenu(false);
    scrollToTarget(hash);
  });

  // Pause page scroll and the custom cursor while a dialog is open
  $$('dialog').forEach((d) => {
    d.addEventListener('close', () => {
      if (lenis) lenis.start();
      if (cursorOn) html.classList.add('has-cursor');
    });
  });
  function showDialog(d) {
    if (lenis) lenis.stop();
    html.classList.remove('has-cursor');
    d.showModal();
  }

  //--------------------------------------------------------------
  // Split headings into words for the mask reveal
  //--------------------------------------------------------------
  function splitWords(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--d', i++);
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
    el.setAttribute('aria-label', label);
    [...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
  }
  $$('[data-split]').forEach(splitWords);

  //--------------------------------------------------------------
  // Intro loader: counts while the 3D scene boots, never longer than ~2s
  //--------------------------------------------------------------
  function initLoader() {
    const loader = $('#loader');
    const countEl = $('#loader-count');
    const bar = $('#loader-bar');
    let sceneReady = false;
    window.addEventListener('hk:scene-ready', () => { sceneReady = true; }, { once: true });

    const finish = () => {
      window.__hkIntroDone = true;
      loader.classList.add('is-done');
      $('.hero-title').classList.add('in');
      window.dispatchEvent(new Event('hk:intro-done'));
      setTimeout(() => loader.remove(), 1200);
    };
    if (reduceMotion) { finish(); return; }

    const start = performance.now();
    let shown = 0;
    const tick = (now) => {
      const t = now - start;
      const target = sceneReady || t > 2000 ? 100 : Math.min(88, (t / 1100) * 88);
      shown += (target - shown) * (target === 100 ? 0.2 : 0.12);
      if (target === 100 && 100 - shown < 0.6) shown = 100;
      countEl.textContent = Math.round(shown);
      bar.style.transform = `scaleX(${shown / 100})`;
      if (shown >= 100 && t > 650) { setTimeout(finish, 120); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  //--------------------------------------------------------------
  // Custom cursor + magnetic buttons (fine pointers only)
  //--------------------------------------------------------------
  let cursorOn = false;
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    cursorOn = true;
    html.classList.add('has-cursor');
    const cur = $('.cursor');
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const label = $('.cursor-label');
    let x = -100, y = -100, rx = x, ry = y, robotHover = false, hoverLabel = null;

    window.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cur.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.add('is-hidden'));

    const update = () => {
      const text = robotHover ? 'Say hi' : hoverLabel;
      cur.classList.toggle('is-label', !!text);
      if (text) label.textContent = text;
    };
    document.addEventListener('pointerover', (e) => {
      const labelled = e.target.closest('[data-cursor]');
      hoverLabel = labelled ? labelled.dataset.cursor : null;
      cur.classList.toggle('is-link', !labelled && !!e.target.closest('a, button, [role="button"], label, summary, .cell, .ckpt, .run-log li'));
      update();
    });
    window.addEventListener('hk:robot-hover', (e) => { robotHover = e.detail; update(); });

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    $$('[data-magnetic], .icon-btn, .nav-ask').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  //--------------------------------------------------------------
  // Navigation: scrolled state, hide on scroll down, progress, menu
  //--------------------------------------------------------------
  const menuBtn = $('#menu-toggle');
  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  menuBtn.addEventListener('click', () => setMenu(!html.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  function initNav() {
    const nav = $('#nav');
    const progress = $('#nav-progress');
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('is-scrolled', y > 10);
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > window.innerHeight * 0.9 && !html.classList.contains('menu-open')) nav.classList.add('is-hidden');
      else if (goingUp || y < 40) nav.classList.remove('is-hidden');
      lastY = y;
      progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

    const links = $$('.nav-links a');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    $$('main > section').forEach((s) => io.observe(s));
  }

  // Left rail: ticks grow as you pass sections; the label flashes briefly when you arrive
  function initRail() {
    const rail = $('#rail');
    const links = $$('#rail a');
    const cur = $('#rail-cur');
    if (!links.length) return;
    const ids = links.map((a) => a.getAttribute('href').slice(1));
    let current = -1, flashTimer;
    const setActive = (idx, flash = true) => {
      if (idx === current || idx < 0) return;
      current = idx;
      links.forEach((a, i) => {
        a.classList.toggle('is-active', i === idx);
        a.classList.toggle('is-done', i < idx);
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      cur.textContent = String(idx).padStart(2, '0');
      if (!flash) return;
      rail.classList.add('is-flash');
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => rail.classList.remove('is-flash'), 1500);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(ids.indexOf(e.target.id)); });
    }, { rootMargin: '-45% 0px -54% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    setActive(0, false);
  }

  function initClock() {
    const el = $('#local-time');
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 20000);
  }

  //--------------------------------------------------------------
  // Reveal + counters
  //--------------------------------------------------------------
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
    const dur = 1400, start = performance.now();
    const step = (t) => {
      const p = clamp((t - start) / dur, 0, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 4))).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    $$('.reveal, [data-split]:not(.hero-title)').forEach((el) => io.observe(el));
  }

  //--------------------------------------------------------------
  // About: agent trace plays when it scrolls into view
  //--------------------------------------------------------------
  function initTrace() {
    const lines = $$('#trace-body li');
    const status = $('#trace-status');
    const tokEl = $('#trace-tokens');
    const msEl = $('#trace-ms');
    if (!lines.length) return null;
    const tokensOf = (li) => Math.round(li.textContent.trim().split(/\s+/).length * 1.35);
    let runId = 0;

    async function play() {
      const id = ++runId;
      lines.forEach((l) => l.classList.remove('on'));
      status.textContent = 'running';
      status.className = 'trace-status is-run';
      tokEl.textContent = '0';
      if (reduceMotion) {
        lines.forEach((l) => l.classList.add('on'));
        tokEl.textContent = lines.reduce((a, l) => a + tokensOf(l), 0);
        msEl.textContent = '1840';
        status.textContent = 'done';
        status.className = 'trace-status is-done';
        return;
      }
      const start = performance.now();
      const tick = () => { if (id !== runId) return; msEl.textContent = Math.round(performance.now() - start); if (!status.classList.contains('is-done')) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      let tokens = 0;
      for (const l of lines) {
        await new Promise((res) => setTimeout(res, l.dataset.kind === 'tool' ? 340 + Math.random() * 240 : 480 + Math.random() * 200));
        if (id !== runId) return;
        l.classList.add('on');
        tokens += tokensOf(l);
        tokEl.textContent = tokens;
      }
      status.textContent = 'done';
      status.className = 'trace-status is-done';
    }

    $('#trace-replay').addEventListener('click', play);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { play(); o.disconnect(); } }, { threshold: 0.4 }).observe($('.trace'));
    return play;
  }

  //--------------------------------------------------------------
  // Principles: step through the copy while the cube assembles
  //--------------------------------------------------------------
  function initPrinciples() {
    const section = $('#principles');
    const steps = $$('.step', section);
    const bar = $('#pin-bar');
    if (reduceMotion) { bar.style.transform = 'scaleX(1)'; return; }
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      const idx = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
      steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-past', i < idx); });
      bar.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  //--------------------------------------------------------------
  // Work: feature tilt, Nexus test-selection visual, detail sheet
  //--------------------------------------------------------------
  function initFeatures() {
    if (finePointer && !reduceMotion) {
      $$('.feature-visual').forEach((v) => {
        v.addEventListener('pointermove', (e) => {
          const r = v.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          v.style.setProperty('--mx', px * 100 + '%');
          v.style.setProperty('--my', py * 100 + '%');
          v.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 6}deg) rotateY(${(px - 0.5) * 8}deg)`;
        });
        v.addEventListener('pointerleave', () => { v.style.transform = ''; });
      });
    }

    // Nexus: the model scans 40 tests and keeps the relevant 13
    const grid = $('#nexus-tests');
    if (grid) {
      const N = 40;
      const selected = new Set([2, 5, 9, 12, 13, 18, 21, 24, 27, 30, 33, 36, 38]);
      const cells = Array.from({ length: N }, () => grid.appendChild(document.createElement('i')));
      if (reduceMotion) { cells.forEach((c, i) => c.classList.toggle('sel', selected.has(i))); return; }
      let k = 0, timer = null;
      const step = () => {
        cells.forEach((c) => c.classList.remove('scan'));
        if (k < N) {
          cells[k].classList.add('scan');
          if (selected.has(k)) cells[k].classList.add('sel');
          k++;
          timer = setTimeout(step, 70);
        } else {
          timer = setTimeout(() => { cells.forEach((c) => c.classList.remove('sel')); k = 0; step(); }, 2400);
        }
      };
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !timer) step();
        else if (!e.isIntersecting && timer) { clearTimeout(timer); timer = null; }
      }).observe(grid);
    }
  }

  // Project visuals animate only while they are on screen
  function initViz() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
    }, { rootMargin: '80px 0px' });
    $$('.viz').forEach((v) => io.observe(v));
  }

  // The real photo tilts toward the cursor, and the photo shifts the other way for depth
  function initRealPhoto() {
    const stage = $('.real-stage');
    if (!stage || !finePointer || reduceMotion) return;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      stage.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    stage.addEventListener('pointerleave', () => { stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0); });
  }

  function initDetail() {
    const dlg = $('#detail');
    const body = $('#detail-body');
    const foot = $('#detail-foot');

    function openDetail(el) {
      const d = el.dataset;
      const tpl = document.getElementById(d.detail);
      if (!tpl) return;
      $('#detail-kicker').textContent = d.kicker;
      $('#detail-title').textContent = d.name;
      body.innerHTML = '';
      const lede = document.createElement('p');
      lede.className = 'd-lede';
      lede.textContent = d.desc;
      body.append(lede);
      const viz = el.querySelector(':scope > .viz');
      if (viz) { const copy = viz.cloneNode(true); copy.classList.add('is-live'); body.append(copy); }
      body.append(tpl.content.cloneNode(true));
      foot.innerHTML = '';
      if (d.gh) {
        const a = document.createElement('a');
        a.className = 'btn btn-primary';
        a.href = d.gh; a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = '<i class="bi bi-github" aria-hidden="true"></i> View on GitHub';
        foot.appendChild(a);
      }
      const stack = document.createElement('span');
      stack.className = 'stack';
      stack.textContent = d.stack;
      foot.appendChild(stack);
      showDialog(dlg);
      body.scrollTop = 0;
    }

    $$('[data-open-detail]').forEach((b) => b.addEventListener('click', () => openDetail(b.closest('[data-project]'))));
    $$('.build[role="button"]').forEach((row) => {
      row.addEventListener('click', () => openDetail(row));
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(row); } });
    });
    $('#detail-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  //--------------------------------------------------------------
  // Skills: attention map
  //--------------------------------------------------------------
  function initAttention() {
    const table = $('#attn-table');
    if (!table) return;
    const cols = [
      ['Agentic scraping', 'prod'], ['RAG Q&A', 'prod'], ['NL → chart', 'prod'], ['Voice agents', 'prod'],
      ['Cascade', 'hack'], ['Nexus', 'hack'], ['Graph Chatbot', 'oss'], ['IPL Simulator', 'hack'],
      ['Wearable anomaly', 'oss'], ['Photo culling', 'oss'], ['AQI GNN', 'research']
    ];
    // 0 none · 1 used · 2 core · 3 built around it
    const rows = [
      ['LangGraph',            [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      ['LangChain',            [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      ['OpenAI / GPT-4o',      [0, 0, 3, 2, 3, 3, 0, 3, 0, 0, 0]],
      ['LLaMA · Gemini · HF',  [0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0]],
      ['Whisper · Twilio',     [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]],
      ['Vector DB (Chroma)',   [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      ['OCR · OpenCV',         [0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0]],
      ['PyTorch · DeepFace',   [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3]],
      ['sklearn · XGB · SHAP', [0, 0, 0, 0, 0, 2, 0, 0, 3, 0, 1]],
      ['FastAPI',              [0, 0, 0, 0, 2, 3, 3, 3, 0, 2, 0]],
      ['Celery · asyncio',     [2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0]],
      ['Playwright',           [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      ['Postgres · DuckDB',    [0, 0, 0, 0, 2, 0, 3, 0, 0, 0, 0]],
      ['React · Next.js',      [0, 0, 0, 0, 2, 2, 2, 2, 0, 2, 0]],
      ['WebSockets',           [0, 0, 0, 0, 0, 2, 0, 3, 0, 0, 0]],
      ['GNN · GRU',            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3]],
      ['Docker · OTel',        [0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0]]
    ];
    const label = ['none', 'used', 'core', 'built around it'];

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    hr.appendChild(document.createElement('td'));
    cols.forEach(([name, kind], c) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.dataset.c = c;
      th.innerHTML = `<span class="attn-col">${name}<small>${kind}</small></span>`;
      hr.appendChild(th);
    });
    thead.appendChild(hr);

    const tbody = document.createElement('tbody');
    let i = 0;
    rows.forEach(([name, ws], r) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.dataset.r = r;
      th.textContent = name;
      tr.appendChild(th);
      ws.forEach((w, c) => {
        const td = document.createElement('td');
        const s = document.createElement('span');
        s.className = 'cell';
        s.dataset.r = r; s.dataset.c = c;
        s.style.cssText = `--w:${(w / 3).toFixed(2)};--i:${i++}`;
        s.title = `${name} × ${cols[c][0]}: ${label[w]}`;
        s.setAttribute('aria-label', s.title);
        td.appendChild(s);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);

    const readout = $('#attn-readout');
    const defaultReadout = readout.innerHTML;
    const cells = $$('.cell', table);

    function highlight(r, c, focusCell) {
      table.classList.add('is-hovering');
      cells.forEach((cell) => {
        cell.classList.toggle('is-row', r !== null && +cell.dataset.r === r);
        cell.classList.toggle('is-col', c !== null && +cell.dataset.c === c);
        cell.classList.toggle('is-focus', cell === focusCell);
      });
      $$('th', table).forEach((th) => th.classList.toggle('is-hot',
        (th.dataset.r !== undefined && +th.dataset.r === r) || (th.dataset.c !== undefined && +th.dataset.c === c)));
    }
    function clear() {
      table.classList.remove('is-hovering');
      cells.forEach((cell) => cell.classList.remove('is-row', 'is-col', 'is-focus'));
      $$('th', table).forEach((th) => th.classList.remove('is-hot'));
      readout.innerHTML = defaultReadout;
    }

    table.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('.cell');
      const th = e.target.closest('th');
      if (cell) {
        const r = +cell.dataset.r, c = +cell.dataset.c, w = rows[r][1][c];
        highlight(r, c, cell);
        readout.innerHTML = `<b>${rows[r][0]}</b> × <b>${cols[c][0]}</b> · α = ${(w / 3).toFixed(2)} · ${label[w]}`;
      } else if (th && th.dataset.r !== undefined) {
        const r = +th.dataset.r;
        highlight(r, null, null);
        const used = rows[r][1].map((w, c) => (w ? cols[c][0] : null)).filter(Boolean);
        readout.innerHTML = `<b>${rows[r][0]}</b> attends to ${used.length} build${used.length === 1 ? '' : 's'}: ${used.join(', ')}`;
      } else if (th && th.dataset.c !== undefined) {
        const c = +th.dataset.c;
        highlight(null, c, null);
        const used = rows.filter((row) => row[1][c]).sort((a, b) => b[1][c] - a[1][c]).map((row) => row[0]);
        readout.innerHTML = `<b>${cols[c][0]}</b> ← ${used.join(', ')}`;
      }
    });
    table.addEventListener('mouseleave', clear);
  }

  //--------------------------------------------------------------
  // Experience: training-run chart
  //--------------------------------------------------------------
  function initTrainingRun() {
    const host = $('#run-chart');
    const log = $('#run-log');
    if (!host || !log) return;
    const items = $$('li', log).map((li) => ({ li, t: parseFloat(li.dataset.t), year: li.querySelector('time').textContent, text: li.querySelector('span').textContent }));
    const tip = document.createElement('div');
    tip.className = 'run-tip';
    host.appendChild(tip);

    const T0 = 2019.35, T1 = 2026.95;
    const loss = (t) => {
      const x = t - T0;
      // a smooth decay with a few step drops at the big checkpoints
      let v = 0.2 + 2.4 * Math.exp(-0.3 * x);
      items.forEach((it) => { if (t > it.t) v -= 0.045 * (1 - Math.exp(-(t - it.t) * 6)); });
      return Math.max(0.12, v);
    };
    let seed = 3;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    let drawn = false;

    function render() {
      const W = host.clientWidth, H = host.clientHeight;
      if (!W || !H) return;
      const m = { l: 44, r: 20, t: 48, b: 36 };
      const x = (t) => m.l + ((t - T0) / (T1 - T0)) * (W - m.l - m.r);
      const y = (v) => m.t + (1 - v / 3) * (H - m.t - m.b);

      seed = 3;
      const N = 220, raw = [], smooth = [];
      let ema = null;
      for (let i = 0; i <= N; i++) {
        const t = T0 + (i / N) * (T1 - T0);
        const base = loss(t);
        const v = Math.max(0.05, base + (rnd() - 0.5) * 0.32 * base);
        raw.push([x(t), y(v)]);
        ema = ema === null ? v : ema * 0.82 + v * 0.18;
        smooth.push([x(t), y(ema)]);
      }
      const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
      const area = path(smooth) + `L${x(T1).toFixed(1)} ${y(0)}L${x(T0).toFixed(1)} ${y(0)}Z`;
      const smoothAt = (t) => smooth[Math.round(((t - T0) / (T1 - T0)) * N)][1];

      let grid = '';
      for (let yr = 2020; yr <= 2026; yr++) {
        grid += `<line class="grid-line" x1="${x(yr)}" x2="${x(yr)}" y1="${m.t}" y2="${H - m.b}"/>`;
        grid += `<text class="axis-text" x="${x(yr)}" y="${H - m.b + 22}" text-anchor="middle">${W < 520 ? "'" + String(yr).slice(2) : yr}</text>`;
      }
      [0.5, 1, 1.5, 2, 2.5].forEach((v) => {
        grid += `<line class="grid-line" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke-dasharray="2 4"/>`;
        grid += `<text class="axis-text" x="${m.l - 10}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(1)}</text>`;
      });

      const ckpts = items.map((it, i) => {
        const cx = x(it.t), cy = smoothAt(it.t);
        return `<g class="ckpt" data-i="${i}" tabindex="0" role="img" aria-label="${it.year}: ${it.text.replace(/"/g, '&quot;')}">
          <line x1="${cx}" x2="${cx}" y1="${cy}" y2="${H - m.b}"/>
          <circle cx="${cx}" cy="${cy}" r="4.5"/>
        </g>`;
      }).join('');

      const old = host.querySelector('svg');
      if (old) old.remove();
      host.insertAdjacentHTML('afterbegin', `
        <svg viewBox="0 0 ${W} ${H}" focusable="false">
          <defs>
            <linearGradient id="lossFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--accent); stop-opacity: .22"/>
              <stop offset="100%" style="stop-color: var(--accent); stop-opacity: 0"/>
            </linearGradient>
          </defs>
          <text class="chart-title" x="${m.l}" y="26">Training loss</text>
          ${W < 560 ? '' : `<text class="chart-note" x="${W - m.r}" y="26" text-anchor="end">Illustrative. Lower means more skilled.</text>`}
          ${grid}
          <path class="loss-area" d="${area}"/>
          <path class="loss-raw" d="${path(raw)}"/>
          <path class="loss-line" d="${path(smooth)}"/>
          ${ckpts}
        </svg>`);

      const line = host.querySelector('.loss-line');
      if (!drawn && !reduceMotion) {
        const len = line.getTotalLength();
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        const go = () => { line.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.16,1,.3,1)'; line.style.strokeDashoffset = '0'; drawn = true; };
        new IntersectionObserver(([e], o) => { if (e.isIntersecting) { setTimeout(go, 200); o.disconnect(); } }, { threshold: 0.3 }).observe(host);
      }
    }

    function activate(i) {
      $$('.ckpt', host).forEach((g, j) => g.classList.toggle('is-on', j === i));
      items.forEach((it, j) => it.li.classList.toggle('is-on', j === i));
      if (i === null) { tip.classList.remove('is-on'); return; }
      const c = $$('.ckpt', host)[i].querySelector('circle');
      tip.style.left = clamp(+c.getAttribute('cx'), 120, host.clientWidth - 120) + 'px';
      tip.style.top = c.getAttribute('cy') + 'px';
      tip.innerHTML = `<b>checkpoint ${items[i].t.toFixed(2)}</b>${items[i].text}`;
      tip.classList.add('is-on');
    }

    host.addEventListener('mouseover', (e) => { const g = e.target.closest('.ckpt'); if (g) activate(+g.dataset.i); });
    host.addEventListener('focusin', (e) => { const g = e.target.closest('.ckpt'); if (g) activate(+g.dataset.i); });
    host.addEventListener('mouseleave', () => activate(null));
    host.addEventListener('focusout', () => activate(null));
    items.forEach((it, i) => {
      it.li.addEventListener('mouseenter', () => activate(i));
      it.li.addEventListener('mouseleave', () => activate(null));
    });

    render();
    if ('ResizeObserver' in window) {
      let last = host.clientWidth;
      new ResizeObserver(() => { if (host.clientWidth !== last) { last = host.clientWidth; render(); } }).observe(host);
    }
  }

  //--------------------------------------------------------------
  // AI twin — BM25 retrieval with citations, abstains below threshold
  //--------------------------------------------------------------
  function initTwin(replayTrace) {
    const dlg = $('#twin');
    const input = $('#twin-input');
    const form = $('#twin-form');
    const intro = $('#twin-intro');
    const answer = $('#twin-answer');
    const meta = $('#twin-meta');
    const cmdList = $('#twin-cmds');
    const KB = window.HK_KB || [];

    const STOP = new Set('a an and are as at be but by can do does for from has have he her him his how i if in is it its me my of on or so tell than that the their them there these they this to was what when where which who whom why will with you your about any get know show give please some much many there'.split(' '));
    const SYN = {
      hire: ['hiring', 'open', 'role'], job: ['role', 'experience', 'company'], work: ['experience', 'job'], stack: ['skills', 'tech', 'tools'],
      tech: ['stack', 'skills'], cv: ['resume'], email: ['contact'], reach: ['contact'], won: ['hackathon', 'award'], win: ['hackathon'],
      award: ['hackathon', 'won'], prize: ['hackathon'], college: ['education'], degree: ['education'], study: ['education'], based: ['location'],
      live: ['location'], llm: ['agents', 'openai'], ai: ['agents', 'llm'], rank: ['rating'], rating: ['rank'], best: ['shipped', 'production'],
      build: ['built', 'shipped'], built: ['shipped', 'production'], project: ['shipped', 'built'], intern: ['internship'], eval: ['evals', 'evaluation'],
      research: ['publication', 'paper', 'workshop', 'gnn'], publish: ['publication', 'paper', 'workshop'], published: ['publication', 'paper', 'workshop'], paper: ['publication', 'workshop'], title: ['role', 'analyst'], experience: ['years']
    };
    const stem = (w) => (w.length > 4 && w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
    const tokenize = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+#]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w)).map(stem);

    // BM25 index
    const docs = KB.map((d) => tokenize(`${d.title} ${d.keys} ${d.keys} ${d.answer}`));
    const avgdl = docs.reduce((a, d) => a + d.length, 0) / (docs.length || 1);
    const df = new Map();
    docs.forEach((d) => new Set(d).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
    const tfs = docs.map((d) => { const m = new Map(); d.forEach((w) => m.set(w, (m.get(w) || 0) + 1)); return m; });
    const k1 = 1.4, b = 0.75, THRESHOLD = 3.2;

    function search(q) {
      const terms = tokenize(q);
      const expanded = [];
      terms.forEach((t) => (SYN[t] || []).forEach((s) => expanded.push(stem(s))));
      const all = terms.map((t) => [t, 1]).concat(expanded.map((t) => [t, 0.5]));
      return KB.map((d, i) => {
        let s = 0;
        all.forEach(([t, wq]) => {
          const n = df.get(t);
          if (!n) return;
          const idf = Math.log(1 + (KB.length - n + 0.5) / (n + 0.5));
          const tf = tfs[i].get(t) || 0;
          s += wq * idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docs[i].length / avgdl));
        });
        return { d, s };
      }).sort((p, q2) => q2.s - p.s);
    }

    const commands = [
      { k: 'about', icon: 'bi-person', label: 'Go to About', run: () => go('#about') },
      { k: 'principles', icon: 'bi-box', label: 'Go to How I build', run: () => go('#principles') },
      { k: 'work', icon: 'bi-grid', label: 'Go to Work', run: () => go('#work') },
      { k: 'research', icon: 'bi-journal-text', label: 'Go to Research', run: () => go('#research') },
      { k: 'skills', icon: 'bi-grid-3x3', label: 'Go to the attention map', run: () => go('#skills') },
      { k: 'experience', icon: 'bi-graph-down', label: 'Go to the training run', run: () => go('#experience') },
      { k: 'recognition', icon: 'bi-trophy', label: 'Go to Recognition', run: () => go('#recognition') },
      { k: 'contact', icon: 'bi-send', label: 'Go to Contact', run: () => go('#contact') },
      { k: 'resume', icon: 'bi-file-earmark-person', label: 'Open résumé', run: () => window.open(RESUME_URL, '_blank', 'noopener') },
      { k: 'email', icon: 'bi-copy', label: 'Copy email address', run: () => copyEmail() },
      { k: 'theme', icon: 'bi-circle-half', label: 'Toggle light / dark', run: () => toggleTheme() },
      { k: 'github', icon: 'bi-github', label: 'Open GitHub', run: () => window.open('https://github.com/Harshil26202', '_blank', 'noopener') },
      { k: 'linkedin', icon: 'bi-linkedin', label: 'Open LinkedIn', run: () => window.open('https://www.linkedin.com/in/harshil-kaneria-3a498918b/', '_blank', 'noopener') },
      { k: 'replay', icon: 'bi-arrow-repeat', label: 'Replay the agent trace', run: () => { go('.trace'); if (replayTrace) setTimeout(replayTrace, 900); } }
    ];
    let visibleCmds = commands, sel = -1;

    function go(target) {
      dlg.close();
      setTimeout(() => scrollToTarget(target), 30);
    }

    function renderCmds(filter) {
      const f = (filter || '').replace(/^\//, '').toLowerCase();
      visibleCmds = commands.filter((c) => !f || c.k.includes(f) || c.label.toLowerCase().includes(f));
      sel = filter && filter.startsWith('/') && visibleCmds.length ? 0 : -1;
      cmdList.innerHTML = visibleCmds.map((c, i) =>
        `<li role="option" data-i="${i}" aria-selected="${i === sel}"><i class="bi ${c.icon}" aria-hidden="true"></i>${c.label}<code>/${c.k}</code></li>`
      ).join('') || '<li aria-disabled="true">No matching command</li>';
    }
    function markSel() { $$('li', cmdList).forEach((li, i) => li.setAttribute('aria-selected', String(i === sel))); }
    cmdList.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-i]');
      if (li) visibleCmds[+li.dataset.i].run();
    });

    function showIntro() {
      intro.hidden = false;
      answer.hidden = true;
      meta.textContent = `bm25 · ${KB.length} chunks`;
    }

    let streamId = 0;
    function ask(q) {
      q = q.trim();
      if (!q) return;
      const id = ++streamId;
      const t = performance.now();
      const results = search(q);
      const ms = (performance.now() - t).toFixed(1);
      const top = results[0];
      const picked = top && top.s >= THRESHOLD ? results.filter((r, i) => i < 2 && r.s >= Math.max(THRESHOLD, top.s * 0.72)) : [];
      const nTerms = tokenize(q).length;

      intro.hidden = true;
      answer.hidden = false;
      meta.textContent = `bm25 · ${KB.length} chunks · ${ms}ms · top ${top ? top.s.toFixed(2) : '0.00'}`;

      const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      answer.innerHTML = `
        <p class="ans-q">${esc(q)}</p>
        <div class="ans-steps">
          <span>→ <b>embed</b> query · ${nTerms} term${nTerms === 1 ? '' : 's'}</span>
          <span>→ <b>retrieve</b> top-3 of ${KB.length} chunks · best score ${top ? top.s.toFixed(2) : '0.00'}</span>
          <span>→ <b>${picked.length ? 'answer' : 'abstain'}</b> · threshold ${THRESHOLD.toFixed(1)}</span>
        </div>
        <p class="ans-text${picked.length ? '' : ' is-abstain'}"></p>
        <div class="ans-cites"></div>`;
      const textEl = $('.ans-text', answer);
      const citesEl = $('.ans-cites', answer);

      const parts = picked.length
        ? picked.map((r, i) => ({ text: r.d.answer, cite: i + 1 }))
        : [{ text: "I don't have evidence for that in my index, so I won't guess. Try asking about his projects, production work, stack, hackathons, education, or how to reach him.", cite: null }];

      const cursor = document.createElement('span');
      cursor.className = 'ans-cursor';
      textEl.appendChild(cursor);

      const words = [];
      parts.forEach((p, pi) => {
        p.text.split(' ').forEach((w) => words.push({ w: w + ' ' }));
        if (p.cite) words.push({ cite: p.cite, href: picked[pi].d.href });
      });

      let i = 0;
      const step = () => {
        if (id !== streamId) return;
        const chunk = reduceMotion ? words.length : 1 + Math.floor(Math.random() * 3);
        for (let n = 0; n < chunk && i < words.length; n++, i++) {
          const item = words[i];
          if (item.cite) {
            const sup = document.createElement('sup');
            sup.innerHTML = `<a href="${item.href}" data-href="${item.href}">${item.cite}</a>`;
            textEl.insertBefore(sup, cursor);
            textEl.insertBefore(document.createTextNode(' '), cursor);
          } else {
            textEl.insertBefore(document.createTextNode(item.w), cursor);
          }
        }
        if (i < words.length) setTimeout(step, 26);
        else {
          cursor.remove();
          citesEl.innerHTML = picked.map((r, n) =>
            `<a href="${r.d.href}" data-href="${r.d.href}"><code>[${n + 1}]</code>${esc(r.d.title)}<span class="score">${r.s.toFixed(2)}</span></a>`
          ).join('');
        }
      };
      step();
    }

    answer.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-href]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      go(a.dataset.href);
    });

    $$('#twin-suggest button').forEach((btn) => btn.addEventListener('click', () => {
      input.value = btn.textContent;
      ask(btn.textContent);
      input.focus();
    }));

    input.addEventListener('input', () => {
      const v = input.value;
      if (!v.trim()) { showIntro(); renderCmds(''); return; }
      if (v.startsWith('/')) { showIntro(); renderCmds(v); }
    });
    input.addEventListener('keydown', (e) => {
      const cmdMode = !intro.hidden && (input.value.startsWith('/') || !input.value);
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && cmdMode && visibleCmds.length) {
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + visibleCmds.length) % visibleCmds.length;
        markSel();
        const li = $$('li', cmdList)[sel];
        if (li) li.scrollIntoView({ block: 'nearest' });
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value;
      if ((v.startsWith('/') || !v.trim()) && sel >= 0 && visibleCmds[sel]) { visibleCmds[sel].run(); return; }
      if (v.startsWith('/')) { toast('Unknown command. Try /work'); return; }
      ask(v);
    });

    function open() {
      if (dlg.open) return;
      input.value = '';
      showIntro();
      renderCmds('');
      showDialog(dlg);
      input.focus();
    }
    $$('[data-open-twin]').forEach((b) => b.addEventListener('click', open));
    window.addEventListener('hk:robot-click', () => setTimeout(open, 700));
    $('#twin-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dlg.open ? dlg.close() : open();
      } else if (e.key === '/' && !dlg.open && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        open();
        input.value = '/';
        renderCmds('/');
      }
    });

    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
      $$('kbd').forEach((k) => { if (k.textContent === '⌘K') k.textContent = 'Ctrl K'; });
    }
  }

  //--------------------------------------------------------------
  // Robot hint bubble
  //--------------------------------------------------------------
  function initRobotHint() {
    const hint = $('#robot-hint');
    let shown = false;
    const hide = () => hint.classList.remove('is-on');
    window.addEventListener('hk:scene-ready', () => {
      const show = () => {
        if (shown) return;
        shown = true;
        setTimeout(() => { hint.classList.add('is-on'); setTimeout(hide, 6500); }, 1400);
      };
      if (window.__hkIntroDone) show();
      else window.addEventListener('hk:intro-done', show, { once: true });
    }, { once: true });
    window.addEventListener('hk:robot-click', hide);
  }

  //--------------------------------------------------------------
  // Contact: composer + copy email
  //--------------------------------------------------------------
  function copyEmail() {
    const done = () => {
      toast('Copied ' + EMAIL);
      const l = $('#copy-label');
      l.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Copied';
      setTimeout(() => { l.innerHTML = '<i class="bi bi-copy" aria-hidden="true"></i> Copy'; }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(EMAIL).then(done, () => window.prompt('Copy email:', EMAIL));
    } else {
      window.prompt('Copy email:', EMAIL);
    }
  }

  function initComposer() {
    const form = $('#composer');
    if (!form) return;
    const msg = form.elements.message;
    const tok = $('#tok-count');
    const err = $('#form-error');
    msg.addEventListener('input', () => {
      const n = Math.ceil(msg.value.length / 4);
      tok.textContent = n + ' token' + (n === 1 ? '' : 's');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.name, email = form.elements.email;
      const fields = [name, email, msg];
      fields.forEach((f) => f.closest('.field').classList.remove('is-invalid'));
      const bad = fields.filter((f) => !f.value.trim() || (f === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())));
      if (bad.length) {
        bad.forEach((f) => f.closest('.field').classList.add('is-invalid'));
        err.textContent = bad[0] === email && email.value.trim() ? 'That email looks off.' : 'Fill in every field so I can reply.';
        bad[0].focus();
        return;
      }
      err.textContent = '';
      const intent = form.elements.intent.value;
      const subject = `[${intent}] from ${name.value.trim()}`;
      const body = `${msg.value.trim()}\n\n${name.value.trim()}\n${email.value.trim()}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast('Opening your mail app…');
    });
    $('#copy-email').addEventListener('click', copyEmail);
  }

  //--------------------------------------------------------------
  // Boot
  //--------------------------------------------------------------
  initLoader();
  initCursor();
  initNav();
  initRail();
  initClock();
  initReveal();
  const replayTrace = initTrace();
  initPrinciples();
  initFeatures();
  initViz();
  initRealPhoto();
  initDetail();
  initAttention();
  initTrainingRun();
  initTwin(replayTrace);
  initRobotHint();
  initComposer();

  $('#year').textContent = new Date().getFullYear();
  window.addEventListener('load', () => {
    $('#infer-time').textContent = (performance.now() / 1000).toFixed(2);
  });
})();
