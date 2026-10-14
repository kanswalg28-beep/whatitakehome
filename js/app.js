class Interactive3DPie {
  constructor(canvas, tooltip, wrapper) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tooltip = tooltip;
    this.wrapper = wrapper;

    this.slices = [
      { id: 'net', name: 'Net Take-Home', amount: 0, percent: 0.7, grossPct: 70, color: '#1C5946', sideColor: '#10382B', hoverOffset: 0, targetOffset: 0 },
      { id: 'fed', name: 'Federal Income Tax', amount: 0, percent: 0.15, grossPct: 15, color: '#B44335', sideColor: '#78251B', hoverOffset: 0, targetOffset: 0 },
      { id: 'state', name: 'State & Local Tax', amount: 0, percent: 0.08, grossPct: 8, color: '#D07B43', sideColor: '#8E481F', hoverOffset: 0, targetOffset: 0 },
      { id: 'fica', name: 'FICA (SS & Medicare)', amount: 0, percent: 0.07, grossPct: 7, color: '#4F7E66', sideColor: '#2F5241', hoverOffset: 0, targetOffset: 0 }
    ];

    this.logicalWidth = 760;
    this.logicalHeight = 540;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.logicalWidth * this.dpr;
    this.canvas.height = this.logicalHeight * this.dpr;

    this.rotation = -0.65;
    this.tilt = 0.54;
    this.depth = 44;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartRot = 0;
    this.velocity = 0;
    this.lastX = 0;
    this.lastTime = 0;
    this.hoveredIndex = -1;
    this.total = 0;
    this.isHourly = false;
    this.centerTextAmount = '$0';
    this.centerTextPct = '0%';
    this.isVisible = true;
    this.rafId = null;

    this.bindEvents();
    this.observeVisibility();
    this.render();
  }

  observeVisibility() {
    if ('IntersectionObserver' in window && this.canvas) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const wasVisible = this.isVisible;
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !wasVisible && !this.rafId) {
            this.render();
          }
        });
      }, { threshold: 0.05 });
      obs.observe(this.canvas);
    }
  }

  setData(takeHome, fed, stateTax, fica, grossTotal, takeHomeDisplay, isHourly = false) {
    this.isHourly = isHourly;
    this.centerTextAmount = takeHomeDisplay;
    const pieSum = Math.max(0, takeHome + fed + stateTax + fica);
    const grossDenom = Math.max(0, grossTotal);
    this.total = pieSum;

    if (pieSum <= 0 || grossDenom <= 0) {
      this.slices.forEach((s, i) => {
        s.amount = 0;
        s.percent = i === 0 ? 1 : 0;
        s.grossPct = 0;
      });
      this.centerTextPct = '0.0%';
    } else {
      // Geometry uses share of post-deduction pie so the 360-degree ring stays closed;
      // Labels and tooltips display exact % of Gross Income to match the Legend.
      this.slices[0].amount = takeHome;
      this.slices[0].percent = Math.max(0, takeHome / pieSum);
      this.slices[0].grossPct = (takeHome / grossDenom) * 100;

      this.slices[1].amount = fed;
      this.slices[1].percent = Math.max(0, fed / pieSum);
      this.slices[1].grossPct = (fed / grossDenom) * 100;

      this.slices[2].amount = stateTax;
      this.slices[2].percent = Math.max(0, stateTax / pieSum);
      this.slices[2].grossPct = (stateTax / grossDenom) * 100;

      this.slices[3].amount = fica;
      this.slices[3].percent = Math.max(0, fica / pieSum);
      this.slices[3].grossPct = (fica / grossDenom) * 100;

      this.centerTextPct = `${this.slices[0].grossPct.toFixed(1)}%`;
    }
  }

  bindEvents() {
    const onStart = (clientX) => {
      this.isDragging = true;
      this.dragStartX = clientX;
      this.dragStartRot = this.rotation;
      this.lastX = clientX;
      this.lastTime = performance.now();
      this.velocity = 0;
      this.canvas.style.cursor = 'grabbing';
    };

    const onMove = (clientX, clientY) => {
      if (this.isDragging) {
        const now = performance.now();
        const dt = Math.max(1, now - this.lastTime);
        const dxInstant = clientX - this.lastX;
        this.velocity = (dxInstant / dt) * 0.14;
        this.lastX = clientX;
        this.lastTime = now;

        const dx = clientX - this.dragStartX;
        this.rotation = this.dragStartRot + dx * 0.015;
      }
      this.hitTest(clientX, clientY);
    };

    const onEnd = () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    };

    this.canvas.addEventListener('mousedown', (e) => onStart(e.clientX));
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) onMove(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) onMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredIndex = -1;
      this.slices.forEach(s => s.targetOffset = 0);
      if (this.tooltip) this.tooltip.classList.remove('active');
    });

    // Touch Handling for Mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', onEnd);
  }

  hitTest(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.logicalWidth / rect.width;
    const scaleY = this.logicalHeight / rect.height;
    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;

    const cx = this.logicalWidth / 2;
    const cy = (this.logicalHeight / 2) - 25;
    const rx = 240;
    const innerRx = 105;

    const dx = mx - cx;
    const dy = (my - cy) / this.tilt;
    const dist = Math.hypot(dx, dy);

    if (dist >= innerRx && dist <= rx + 30) {
      let angle = Math.atan2(dy, dx) - this.rotation;
      while (angle < 0) angle += Math.PI * 2;
      while (angle >= Math.PI * 2) angle -= Math.PI * 2;

      let acc = 0;
      let hit = -1;
      for (let i = 0; i < this.slices.length; i++) {
        const span = this.slices[i].percent * Math.PI * 2;
        if (angle >= acc && angle < acc + span) {
          hit = i;
          break;
        }
        acc += span;
      }

      this.hoveredIndex = hit;
      this.slices.forEach((s, idx) => {
        s.targetOffset = (idx === hit) ? 16 : 0;
      });

      if (hit !== -1 && this.tooltip) {
        const s = this.slices[hit];
        const pct = s.grossPct.toFixed(1);
        const formattedAmt = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: this.isHourly ? 2 : 0,
          minimumFractionDigits: this.isHourly ? 2 : 0
        }).format(s.amount) + (this.isHourly ? '/hr' : '');
        this.tooltip.innerHTML = `<strong>${s.name}</strong><br>${formattedAmt} (${pct}% of Gross)`;
        this.tooltip.style.left = `${clientX - rect.left}px`;
        this.tooltip.style.top = `${clientY - rect.top}px`;
        this.tooltip.classList.add('active');
      }
    } else {
      this.hoveredIndex = -1;
      this.slices.forEach(s => s.targetOffset = 0);
      if (this.tooltip) this.tooltip.classList.remove('active');
    }
  }

  render() {
    if (!this.isVisible && !this.isDragging) {
      this.rafId = null;
      return;
    }

    // Gyroscope inertia friction decay & subtle resting orbital drift
    if (!this.isDragging) {
      if (Math.abs(this.velocity) > 0.0001) {
        this.rotation += this.velocity;
        this.velocity *= 0.94;
      } else if (this.hoveredIndex === -1) {
        this.rotation += 0.0008;
      }
    }

    this.slices.forEach(s => {
      s.hoverOffset += (s.targetOffset - s.hoverOffset) * 0.22;
    });

    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = (h / 2) - 25;
    const rx = 240;
    const ry = rx * this.tilt;
    const innerRx = 105;
    const innerRy = innerRx * this.tilt;
    const depth = this.depth;

    // Ambient Base Drop Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + depth + 14, rx * 1.06, ry * 1.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(26, 52, 56, 0.08)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.restore();

    let currentAngle = this.rotation;
    const sliceAngles = [];
    for (let i = 0; i < this.slices.length; i++) {
      const span = this.slices[i].percent * Math.PI * 2;
      sliceAngles.push({
        index: i,
        start: currentAngle,
        end: currentAngle + span,
        mid: currentAngle + (span / 2),
        span
      });
      currentAngle += span;
    }

    // Painter's Algorithm: Sort slices back-to-front by vertical screen depth (sin(mid))
    const sortedOrder = [...sliceAngles].sort((a, b) => Math.sin(a.mid) - Math.sin(b.mid));

    // 1. Draw 3D Side Walls (Extrusions) in back-to-front order
    for (const ang of sortedOrder) {
      const s = this.slices[ang.index];
      if (s.percent <= 0.005) continue;
      const ox = Math.cos(ang.mid) * s.hoverOffset;
      const oy = Math.sin(ang.mid) * s.hoverOffset * this.tilt;
      const scx = cx + ox;
      const scy = cy + oy;

      const steps = 30;
      const stepAngle = ang.span / steps;
      for (let j = 0; j < steps; j++) {
        const a1 = ang.start + j * stepAngle;
        const a2 = a1 + stepAngle;
        const midA = (a1 + a2) / 2;

        if (Math.sin(midA) > -0.05) {
          const x1 = scx + Math.cos(a1) * rx;
          const y1 = scy + Math.sin(a1) * ry;
          const x2 = scx + Math.cos(a2) * rx;
          const y2 = scy + Math.sin(a2) * ry;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2, y2 + depth);
          ctx.lineTo(x1, y1 + depth);
          ctx.closePath();

          ctx.fillStyle = s.sideColor;
          ctx.fill();
        }
      }

      // Start Radial Cut Face
      const cosA1 = Math.cos(ang.start);
      const sinA1 = Math.sin(ang.start);
      if (sinA1 > 0 || (s.hoverOffset > 1 && sinA1 > -0.5)) {
        const ix = scx + cosA1 * innerRx;
        const iy = scy + sinA1 * innerRy;
        const outX = scx + cosA1 * rx;
        const outY = scy + sinA1 * ry;

        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(outX, outY);
        ctx.lineTo(outX, outY + depth);
        ctx.lineTo(ix, iy + depth);
        ctx.closePath();
        ctx.fillStyle = s.sideColor;
        ctx.fill();
      }

      // End Radial Cut Face
      const cosA2 = Math.cos(ang.end);
      const sinA2 = Math.sin(ang.end);
      if (sinA2 < 0 || (s.hoverOffset > 1 && sinA2 > -0.5)) {
        const ix = scx + cosA2 * innerRx;
        const iy = scy + sinA2 * innerRy;
        const outX = scx + cosA2 * rx;
        const outY = scy + sinA2 * ry;

        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(outX, outY);
        ctx.lineTo(outX, outY + depth);
        ctx.lineTo(ix, iy + depth);
        ctx.closePath();
        ctx.fillStyle = s.sideColor;
        ctx.fill();
      }
    }

    // 2. Draw Top Faces in back-to-front order
    for (const ang of sortedOrder) {
      const s = this.slices[ang.index];
      if (s.percent <= 0.005) continue;
      const ox = Math.cos(ang.mid) * s.hoverOffset;
      const oy = Math.sin(ang.mid) * s.hoverOffset * this.tilt;
      const scx = cx + ox;
      const scy = cy + oy;

      ctx.beginPath();
      ctx.ellipse(scx, scy, rx, ry, 0, ang.start, ang.end, false);
      ctx.lineTo(scx + Math.cos(ang.end) * innerRx, scy + Math.sin(ang.end) * innerRy);
      ctx.ellipse(scx, scy, innerRx, innerRy, 0, ang.end, ang.start, true);
      ctx.closePath();

      const grad = ctx.createLinearGradient(scx - rx, scy - ry, scx + rx, scy + ry);
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, s.sideColor);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 3. Center Donut Cylinder Display
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, innerRx, innerRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F2EDE4';
    ctx.fill();
    ctx.strokeStyle = '#E2DACD';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#53797D';
    ctx.font = '700 12px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText('NET TAKE-HOME', cx, cy - 30);

    ctx.fillStyle = '#1C5946';
    const textLen = (this.centerTextAmount || '').length;
    const fontPx = textLen > 9 ? 23 : (textLen > 7 ? 27 : 32);
    ctx.font = `700 ${fontPx}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(this.centerTextAmount, cx, cy + 2);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '700 16px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(this.centerTextPct, cx, cy + 33);
    ctx.restore();

    ctx.restore();
    this.rafId = requestAnimationFrame(() => this.render());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const engine = new TaxEngine(TaxData);

  // DOM Elements
  const els = {
    income: document.getElementById('income-input'),
    incomeSlider: document.getElementById('income-slider'),
    state: document.getElementById('state-select'),
    localCont: document.getElementById('local-tax-container'),
    local: document.getElementById('local-select'),
    year: document.getElementById('year-select'),
    filing: document.getElementById('filing-select'),
    freqTabs: document.querySelectorAll('.freq-tab'),

    // Compare Mode
    compareToggle: document.getElementById('compare-toggle'),
    compareCont: document.getElementById('compare-state-container'),
    compareSelect: document.getElementById('compare-state-select'),
    arbitrageBanner: document.getElementById('arbitrage-banner'),
    arbitrageTitle: document.getElementById('arbitrage-title'),
    arbitrageDelta: document.getElementById('arbitrage-delta'),
    arbitrageDesc: document.getElementById('arbitrage-desc'),
    colStateOrig: document.getElementById('col-state-orig'),
    colValOrig: document.getElementById('col-val-orig'),
    colStateTarget: document.getElementById('col-state-target'),
    colValTarget: document.getElementById('col-val-target'),

    // Deductions
    accHeader: document.querySelector('.accordion-header'),
    accContainer: document.getElementById('advanced-accordion'),
    deduct401k: document.getElementById('deduct-401k'),
    hint401k: document.getElementById('hint-401k'),
    deductIra: document.getElementById('deduct-ira'),
    deductHealth: document.getElementById('deduct-health'),

    // Outputs
    takeHome: document.getElementById('out-take-home'),
    totalTax: document.getElementById('out-total-tax'),
    effectiveRate: document.getElementById('out-effective-rate'),
    marginalRate: document.getElementById('out-marginal-rate'),

    // Table Rows
    grossVal: document.getElementById('break-gross'),
    deductVal: document.getElementById('break-deductions'),
    stdDedVal: document.getElementById('break-std-ded'),
    taxableBaseVal: document.getElementById('break-taxable-base'),
    fedVal: document.getElementById('break-fed'),
    stateVal: document.getElementById('break-state'),
    rowLocal: document.getElementById('row-local'),
    localVal: document.getElementById('break-local'),
    ficaVal: document.getElementById('break-fica'),
    netVal: document.getElementById('break-net'),

    // Visuals & Telemetry
    ladderContainer: document.getElementById('tax-ladder'),
    pieCanvas: document.getElementById('pie-3d-canvas'),
    pieTooltip: document.getElementById('pie-3d-tooltip'),
    pieWrapper: document.getElementById('pie-3d-wrapper'),
    legNet: document.getElementById('leg-net'),
    legFed: document.getElementById('leg-fed'),
    legState: document.getElementById('leg-state'),
    legFica: document.getElementById('leg-fica'),
    legendItems: document.querySelectorAll('.legend-item'),

    // Actions & Modal
    cmdKModal: document.getElementById('cmd-k-modal'),
    cmdKInput: document.getElementById('cmd-k-input'),
    shareBtn: document.getElementById('share-btn'),
    copySummaryBtn: document.getElementById('copy-summary-btn'),
    presetChips: document.querySelectorAll('.preset-chip')
  };

  let currentFreq = 1; // 1=Annual, 12=Monthly, 26=Bi-weekly, 52=Weekly, 2080=Hourly
  let latestResults = null;
  const pie3d = new Interactive3DPie(els.pieCanvas, els.pieTooltip, els.pieWrapper);

  // Legend Hover Interactions
  els.legendItems.forEach(item => {
    const sliceIdx = parseInt(item.dataset.slice, 10);
    item.addEventListener('mouseenter', () => {
      pie3d.hoveredIndex = sliceIdx;
      pie3d.slices.forEach((s, idx) => {
        s.targetOffset = (idx === sliceIdx) ? 18 : 0;
      });
    });
    item.addEventListener('mouseleave', () => {
      pie3d.hoveredIndex = -1;
      pie3d.slices.forEach(s => s.targetOffset = 0);
    });
  });

  // Initialize State Dropdowns
  const stateKeys = Object.keys(TaxData.states).sort();
  stateKeys.forEach(code => {
    const opt1 = document.createElement('option');
    opt1.value = code;
    opt1.textContent = TaxData.states[code].name;
    els.state.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = code;
    opt2.textContent = TaxData.states[code].name;
    els.compareSelect.appendChild(opt2);
  });

  // Default state & compare values
  els.state.value = "CA";
  els.compareSelect.value = "TX";

  const defaultState = els.state.getAttribute('data-default');
  if (defaultState && TaxData.states[defaultState]) {
    els.state.value = defaultState;
    els.compareSelect.value = (defaultState === "TX" || defaultState === "FL") ? "CA" : "TX";
  }

  function updateLocalDropdown() {
    const code = els.state.value;
    els.local.innerHTML = '<option value="none">None</option>';
    if (TaxData.states[code] && TaxData.states[code].locals) {
      els.localCont.style.display = 'block';
      for (const loc in TaxData.states[code].locals) {
        const opt = document.createElement('option');
        opt.value = loc;
        opt.textContent = TaxData.states[code].locals[loc].name;
        els.local.appendChild(opt);
      }
    } else {
      els.localCont.style.display = 'none';
      els.local.value = 'none';
    }
  }

  // Formatters
  function formatCurrency(val, isHourly = false) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: isHourly ? 2 : 0,
      minimumFractionDigits: isHourly ? 2 : 0
    }).format(val);
  }

  function formatPercent(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(val);
  }

  function formatRawNumber(val) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
  }

  // Smooth Value Interpolator (RAF Count-Up Ticker)
  const activeAnimators = new Map();
  function animateValue(el, targetVal, formatFn, duration = 240) {
    if (!el) return;
    const existing = activeAnimators.get(el);
    const startVal = (existing && existing.current !== undefined) ? existing.current : targetVal;
    if (existing && existing.rafId) {
      cancelAnimationFrame(existing.rafId);
    }

    if (Math.abs(targetVal - startVal) < 0.001) {
      el.textContent = formatFn(targetVal);
      activeAnimators.set(el, { current: targetVal, rafId: null });
      return;
    }

    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;
      el.textContent = formatFn(current);

      if (progress < 1) {
        const rafId = requestAnimationFrame(step);
        activeAnimators.set(el, { current, rafId });
      } else {
        el.textContent = formatFn(targetVal);
        activeAnimators.set(el, { current: targetVal, rafId: null });
      }
    }
    const rafId = requestAnimationFrame(step);
    activeAnimators.set(el, { current: startVal, rafId });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Robust Currency & Numeric Parser
  function parseCurrencyInput(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // URL Sync
  function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('income', parseCurrencyInput(els.income.value));
    url.searchParams.set('state', els.state.value);
    if (els.year) url.searchParams.set('year', els.year.value);
    if (els.local.value !== 'none') url.searchParams.set('local', els.local.value); else url.searchParams.delete('local');
    url.searchParams.set('filing', els.filing.value);
    if (els.compareToggle.checked) {
      url.searchParams.set('compare', els.compareSelect.value);
    } else {
      url.searchParams.delete('compare');
    }
    const d401k = parseCurrencyInput(els.deduct401k.value);
    const dira = parseCurrencyInput(els.deductIra.value);
    const dhealth = parseCurrencyInput(els.deductHealth.value);
    if (d401k > 0) url.searchParams.set('d401k', d401k); else url.searchParams.delete('d401k');
    if (dira > 0) url.searchParams.set('dira', dira); else url.searchParams.delete('dira');
    if (dhealth > 0) url.searchParams.set('dhealth', dhealth); else url.searchParams.delete('dhealth');
    window.history.replaceState({}, '', url);
  }

  // Restore from URL
  const params = new URLSearchParams(window.location.search);
  if (params.has('year') && els.year && TaxData.years[params.get('year')]) {
    els.year.value = params.get('year');
  }
  if (params.has('income')) {
    const incVal = parseCurrencyInput(params.get('income'));
    els.income.value = incVal > 0 ? incVal.toLocaleString('en-US') : '0';
    els.incomeSlider.value = Math.min(500000, incVal);
  }
  if (params.has('state') && TaxData.states[params.get('state')]) {
    els.state.value = params.get('state');
  }
  updateLocalDropdown();
  if (params.has('local')) els.local.value = params.get('local');
  if (params.has('filing')) els.filing.value = params.get('filing');
  if (params.has('compare') && TaxData.states[params.get('compare')]) {
    els.compareToggle.checked = true;
    els.compareCont.style.display = 'block';
    els.compareSelect.value = params.get('compare');
  }
  if (params.has('d401k')) {
    const v = parseCurrencyInput(params.get('d401k'));
    els.deduct401k.value = v > 0 ? v.toLocaleString('en-US') : '0';
    els.accContainer.classList.add('open');
  }
  if (params.has('dira')) {
    const v = parseCurrencyInput(params.get('dira'));
    els.deductIra.value = v > 0 ? v.toLocaleString('en-US') : '0';
    els.accContainer.classList.add('open');
  }
  if (params.has('dhealth')) {
    const v = parseCurrencyInput(params.get('dhealth'));
    els.deductHealth.value = v > 0 ? v.toLocaleString('en-US') : '0';
    els.accContainer.classList.add('open');
  }

  // Interactive Bracket Ladder
  function buildLadder(brackets, breakdown, taxableIncome) {
    els.ladderContainer.innerHTML = '';
    const maxVisual = (brackets[brackets.length - 2]?.upTo || 250000) * 1.25;

    breakdown.forEach((b) => {
      const segment = document.createElement('div');
      segment.className = 'ladder-segment';

      let width = 0;
      if (b.to === Infinity) {
        width = 18;
      } else {
        const size = b.to - b.from;
        width = (size / maxVisual) * 100;
      }
      segment.style.flex = `1 1 ${Math.min(Math.max(width, 6), 100)}%`;
      segment.style.minWidth = '0';

      if (b.active) segment.classList.add('active');
      if (b.isCurrent) segment.classList.add('current');

      const tooltip = document.createElement('div');
      tooltip.className = 'ladder-tooltip';
      const rangeStr = b.to === Infinity
        ? `Over $${formatRawNumber(b.from)}`
        : `$${formatRawNumber(b.from)} - $${formatRawNumber(b.to)}`;
      tooltip.innerHTML = `<strong>${(b.rate * 100).toFixed(0)}% Tier</strong> (${rangeStr})<br>` +
                          `Taxed in tier: $${formatRawNumber(b.taxableAmount)} | Tax: $${formatRawNumber(b.taxPaid)}`;
      segment.appendChild(tooltip);

      els.ladderContainer.appendChild(segment);
    });

    const needle = document.createElement('div');
    needle.className = 'ladder-needle';
    const needlePos = (taxableIncome > maxVisual) ? 98 : (taxableIncome / maxVisual) * 100;
    needle.style.left = `${Math.min(Math.max(needlePos, 1), 99)}%`;
    els.ladderContainer.appendChild(needle);
  }

  // Core Recalculate Loop
  function recalculate() {
    const gross = parseCurrencyInput(els.income.value);
    const filing = els.filing.value;
    const state = els.state.value;
    const local = els.local.value;
    const year = els.year ? els.year.value : TaxData.activeYear;

    const raw401k = parseCurrencyInput(els.deduct401k.value);
    const rawIra = parseCurrencyInput(els.deductIra.value);
    const rawHealth = parseCurrencyInput(els.deductHealth.value);

    const preTax = {
      retirement: raw401k + rawIra,
      health: rawHealth
    };

    const res = engine.calculate(gross, filing, state, local, preTax, year);
    latestResults = { ...res, stateCode: state, localCode: local, filingStatus: filing, taxYear: year };

    if (els.hint401k) {
      if (raw401k > res.retirement401kMax) {
        els.hint401k.textContent = `Note: $${formatRawNumber(raw401k)} exceeds the standard ${year} employee deferral limit of $${formatRawNumber(res.retirement401kMax)} (unless eligible for catch-up/mega backdoor).`;
      } else {
        els.hint401k.textContent = `Reduces Federal & State income tax. Max $${formatRawNumber(res.retirement401kMax)} for ${year} (employee deferral limit).`;
      }
    }

    const d = currentFreq;
    const isHourly = (currentFreq === 2080);
    const hourlySuffix = isHourly ? '/hr' : '';

    animateValue(els.takeHome, res.takeHome / d, v => formatCurrency(v, isHourly) + hourlySuffix);
    animateValue(els.totalTax, res.totalTax / d, v => formatCurrency(v, isHourly) + hourlySuffix);
    animateValue(els.effectiveRate, res.effectiveTaxRate, v => formatPercent(v));
    animateValue(els.marginalRate, res.marginalTaxRate, v => formatPercent(v));

    // Breakdown Table
    els.grossVal.textContent = formatCurrency(res.grossIncome / d, isHourly) + hourlySuffix;
    els.deductVal.textContent = res.totalPreTax > 0
      ? `-${formatCurrency(res.totalPreTax / d, isHourly)}${hourlySuffix}`
      : `$0${hourlySuffix}`;
    els.stdDedVal.textContent = res.federalStandardDeduction > 0
      ? `-${formatCurrency(res.federalStandardDeduction / d, isHourly)}${hourlySuffix}`
      : `$0${hourlySuffix}`;
    els.taxableBaseVal.textContent = formatCurrency(res.taxableFederalIncome / d, isHourly) + hourlySuffix;

    els.fedVal.innerHTML = `<span class="indicator ind-fed"></span>${formatCurrency(res.federalTax / d, isHourly)}${hourlySuffix}`;
    els.stateVal.innerHTML = `<span class="indicator ind-state"></span>${formatCurrency(res.stateTax / d, isHourly)}${hourlySuffix}`;

    if (res.localTax > 0) {
      els.rowLocal.style.display = 'table-row';
      els.localVal.innerHTML = `<span class="indicator ind-state"></span>${formatCurrency(res.localTax / d, isHourly)}${hourlySuffix}`;
    } else {
      els.rowLocal.style.display = 'none';
    }

    els.ficaVal.innerHTML = `<span class="indicator ind-fica"></span>${formatCurrency(res.totalFica / d, isHourly)}${hourlySuffix}`;
    animateValue(els.netVal, res.takeHome / d, v => formatCurrency(v, isHourly) + hourlySuffix);

    // Interactive 3D Pie & Legend (synchronized frequency values & gross percentages)
    pie3d.setData(
      res.takeHome / d,
      res.federalTax / d,
      (res.stateTax + res.localTax) / d,
      res.totalFica / d,
      res.grossIncome / d,
      formatCurrency(res.takeHome / d, isHourly) + hourlySuffix,
      isHourly
    );

    if (els.legNet) {
      const netPct = gross > 0 ? (res.takeHome / gross) * 100 : 0;
      const fedPct = gross > 0 ? (res.federalTax / gross) * 100 : 0;
      const statePct = gross > 0 ? ((res.stateTax + res.localTax) / gross) * 100 : 0;
      const ficaPct = gross > 0 ? (res.totalFica / gross) * 100 : 0;

      els.legNet.textContent = `${formatCurrency(res.takeHome / d, isHourly)}${hourlySuffix} (${netPct.toFixed(1)}%)`;
      els.legFed.textContent = `${formatCurrency(res.federalTax / d, isHourly)}${hourlySuffix} (${fedPct.toFixed(1)}%)`;
      els.legState.textContent = `${formatCurrency((res.stateTax + res.localTax) / d, isHourly)}${hourlySuffix} (${statePct.toFixed(1)}%)`;
      els.legFica.textContent = `${formatCurrency(res.totalFica / d, isHourly)}${hourlySuffix} (${ficaPct.toFixed(1)}%)`;
    }

    buildLadder(res.federalBrackets, res.bracketBreakdown, res.taxableFederalIncome);

    // Relocation Arbitrage Duel
    if (els.compareToggle.checked) {
      const targetState = els.compareSelect.value;
      const targetRes = engine.calculate(gross, filing, targetState, 'none', preTax, year);
      const deltaAnnual = targetRes.takeHome - res.takeHome;
      const origName = TaxData.states[state]?.name || state;
      const targetName = TaxData.states[targetState]?.name || targetState;

      els.arbitrageBanner.classList.add('active');
      if (deltaAnnual >= 0) {
        els.arbitrageBanner.classList.remove('negative');
        els.arbitrageTitle.textContent = `Relocation Arbitrage Advantage (${targetName})`;
        els.arbitrageDelta.textContent = `+${formatCurrency(deltaAnnual)} / yr`;
        els.arbitrageDesc.textContent = `Moving from ${origName} to ${targetName} puts an extra ${formatCurrency(deltaAnnual / 12)} / month in your pocket.`;
      } else {
        els.arbitrageBanner.classList.add('negative');
        els.arbitrageTitle.textContent = `Relocation Tax Drag (${targetName})`;
        els.arbitrageDelta.textContent = `-${formatCurrency(Math.abs(deltaAnnual))} / yr`;
        els.arbitrageDesc.textContent = `Moving from ${origName} to ${targetName} decreases your take-home pay by ${formatCurrency(Math.abs(deltaAnnual) / 12)} / month.`;
      }

      els.colStateOrig.textContent = origName;
      els.colValOrig.textContent = `${formatCurrency(res.takeHome)}/yr (${formatPercent(res.effectiveTaxRate)} tax)`;
      els.colStateTarget.textContent = targetName;
      els.colValTarget.textContent = `${formatCurrency(targetRes.takeHome)}/yr (${formatPercent(targetRes.effectiveTaxRate)} tax)`;
    } else {
      els.arbitrageBanner.classList.remove('active');
    }

    const note = document.getElementById('state-data-note');
    if (note) note.textContent = TaxData.stateDataNote;

    updateURL();
    updateMatrixHighlight();
  }

  // Dual Slider Synchronization & Comma Formatting
  els.income.addEventListener('input', () => {
    const val = parseCurrencyInput(els.income.value);
    els.incomeSlider.value = Math.min(500000, Math.max(10000, val));
    recalculate();
  });

  els.income.addEventListener('blur', () => {
    const val = parseCurrencyInput(els.income.value);
    els.income.value = val > 0 ? val.toLocaleString('en-US') : '0';
  });

  els.incomeSlider.addEventListener('input', () => {
    const val = parseFloat(els.incomeSlider.value) || 0;
    els.income.value = val.toLocaleString('en-US');
    recalculate();
  });

  // Keyboard Nudges on Input
  els.income.addEventListener('keydown', (e) => {
    let val = parseCurrencyInput(els.income.value) || 0;
    const step = e.shiftKey ? 10000 : 1000;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      val += step;
      els.income.value = val.toLocaleString('en-US');
      els.incomeSlider.value = Math.min(500000, val);
      recalculate();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      val = Math.max(0, val - step);
      els.income.value = val.toLocaleString('en-US');
      els.incomeSlider.value = Math.min(500000, Math.max(10000, val));
      recalculate();
    }
  });

  // State & Compare Changes
  els.state.addEventListener('change', () => {
    updateLocalDropdown();
    recalculate();
  });

  els.compareToggle.addEventListener('change', () => {
    els.compareCont.style.display = els.compareToggle.checked ? 'block' : 'none';
    recalculate();
  });

  els.compareSelect.addEventListener('change', recalculate);

  // Accordion Toggle (Mouse + Keyboard)
  const toggleAccordion = () => {
    const isOpen = els.accContainer.classList.toggle('open');
    els.accHeader.setAttribute('aria-expanded', String(isOpen));
  };
  els.accHeader.addEventListener('click', toggleAccordion);
  els.accHeader.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAccordion();
    }
  });

  // Other Inputs
  [els.year, els.local, els.filing, els.deduct401k, els.deductIra, els.deductHealth].filter(Boolean).forEach(el => {
    el.addEventListener('input', recalculate);
    el.addEventListener('change', recalculate);
  });

  [els.deduct401k, els.deductIra, els.deductHealth].forEach(el => {
    el.addEventListener('blur', () => {
      const val = parseCurrencyInput(el.value);
      el.value = val > 0 ? val.toLocaleString('en-US') : '0';
    });
  });

  // 5-Tier Frequency Switcher
  els.freqTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      els.freqTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFreq = parseFloat(tab.dataset.div);
      recalculate();
    });
  });

  // Presets Quick Archetypes (resets IRA & Health so prior inputs don't leak)
  els.presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const inc = parseFloat(chip.dataset.income) || 0;
      const st = chip.dataset.state;
      const loc = chip.dataset.local || 'none';
      const fil = chip.dataset.filing;
      const d401k = parseFloat(chip.dataset['401k']) || 0;

      els.income.value = inc.toLocaleString('en-US');
      els.incomeSlider.value = Math.min(500000, inc);
      els.state.value = st;
      updateLocalDropdown();
      els.local.value = loc;
      els.filing.value = fil;
      els.deduct401k.value = d401k > 0 ? d401k.toLocaleString('en-US') : '0';
      els.deductIra.value = '0';
      els.deductHealth.value = '0';
      if (d401k > 0) {
        els.accContainer.classList.add('open');
        els.accHeader.setAttribute('aria-expanded', 'true');
      }

      recalculate();
      showToast(`Applied Preset: ${chip.textContent.trim()}`);
    });
  });

  // Cmd+K Palette
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      els.cmdKModal.classList.add('active');
      els.cmdKInput.focus();
    }
    if (e.key === 'Escape') {
      els.cmdKModal.classList.remove('active');
    }
  });

  els.cmdKModal.addEventListener('click', (e) => {
    if (e.target === els.cmdKModal) els.cmdKModal.classList.remove('active');
  });

  els.cmdKInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const raw = els.cmdKInput.value.trim();
      const t = raw.toLowerCase();

      // 1. Parse income (supports commas and decimals like 150,000 or 150.5k)
      const incMatch = t.replace(/,/g, '').match(/\b(\d+(?:\.\d+)?)\s*(k|m)?\b/);
      if (incMatch) {
        let val = parseFloat(incMatch[1]);
        if (incMatch[2] === 'k') val *= 1000;
        if (incMatch[2] === 'm') val *= 1000000;
        els.income.value = Math.round(val).toLocaleString('en-US');
        els.incomeSlider.value = Math.min(500000, Math.round(val));
      }

      // 2. Parse filing status
      if (t.includes('head of household') || /\bhoh\b/.test(t)) els.filing.value = 'hoh';
      else if (/\bsingle\b/.test(t)) els.filing.value = 'single';
      else if (/\b(married|joint|mfj)\b/.test(t)) els.filing.value = 'married';

      // 3. Check NYC / Yonkers shortcuts first
      if (/\b(nyc|new york city)\b/.test(t)) {
        els.state.value = 'NY';
        updateLocalDropdown();
        els.local.value = 'NYC';
      } else if (/\byonkers\b/.test(t)) {
        els.state.value = 'NY';
        updateLocalDropdown();
        els.local.value = 'YONKERS';
      } else {
        let matchedState = null;
        for (const code in TaxData.states) {
          const stateName = TaxData.states[code].name.toLowerCase();
          if (t.includes(stateName)) {
            matchedState = code;
            break;
          }
        }
        if (!matchedState) {
          const tokens = raw.split(/\s+/);
          for (const token of tokens) {
            const clean = token.replace(/[^a-zA-Z]/g, '').toUpperCase();
            if (clean.length === 2 && TaxData.states[clean] && !['IN', 'OR', 'ME', 'HI', 'OK'].includes(clean)) {
              matchedState = clean;
              break;
            } else if (clean.length === 2 && TaxData.states[clean] && token === clean) {
              matchedState = clean;
              break;
            }
          }
        }
        if (matchedState) {
          els.state.value = matchedState;
          updateLocalDropdown();
        }
      }

      recalculate();
      els.cmdKModal.classList.remove('active');
      els.cmdKInput.value = '';
      showToast('Calculated from quick input!');
    }
  });

  // Copy Summary Markdown (for Reddit/Notion/Slack)
  els.copySummaryBtn.addEventListener('click', () => {
    if (!latestResults) return;
    const stName = TaxData.states[latestResults.stateCode]?.name || latestResults.stateCode;
    const summary =
`💼 WhatITakeHome Paycheck Summary (${latestResults.taxYear} Tax Year • $${formatRawNumber(latestResults.grossIncome)} • ${({ single: 'SINGLE', married: 'MARRIED FILING JOINTLY', hoh: 'HEAD OF HOUSEHOLD' })[latestResults.filingStatus] || latestResults.filingStatus.toUpperCase()} • ${stName})
────────────────────────────────────────────
• Net Take-Home:   ${formatCurrency(latestResults.takeHome)} / yr  (${formatCurrency(latestResults.takeHome / 12)} / mo | ${formatCurrency(latestResults.takeHome / 2080, true)} / hr)
• Federal Tax:     ${formatCurrency(latestResults.federalTax)} (${formatPercent(latestResults.grossIncome > 0 ? latestResults.federalTax / latestResults.grossIncome : 0)})
• State Tax:       ${formatCurrency(latestResults.stateTax + latestResults.localTax)} (${formatPercent(latestResults.grossIncome > 0 ? (latestResults.stateTax + latestResults.localTax) / latestResults.grossIncome : 0)})
• FICA (SS+Med):   ${formatCurrency(latestResults.totalFica)} (${formatPercent(latestResults.grossIncome > 0 ? latestResults.totalFica / latestResults.grossIncome : 0)})
• Effective Rate:  ${formatPercent(latestResults.effectiveTaxRate)}  |  Marginal Rate: ${formatPercent(latestResults.marginalTaxRate)}
• IRS Baseline:    ${latestResults.irsNotice}
🔗 Calculated with WhatITakeHome: ${window.location.href}`;

    navigator.clipboard.writeText(summary).then(() => {
      showToast('Markdown summary copied for Reddit / Notion / Slack!');
    });
  });

  // Share URL
  els.shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Scenario URL link copied to clipboard!');
    });
  });

  // FAQ Accordion (Mouse + Keyboard)
  document.querySelectorAll('.faq-question').forEach(q => {
    const toggleFaq = () => {
      const parent = q.closest('.faq-item');
      if (parent) {
        const isOpen = parent.classList.toggle('open');
        q.setAttribute('aria-expanded', String(isOpen));
      }
    };
    q.addEventListener('click', toggleFaq);
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFaq();
      }
    });
  });

  // 50-State Benchmarking Matrix Highlight
  function updateMatrixHighlight() {
    const selectedState = els.state.value;
    document.querySelectorAll('.matrix-table tbody tr').forEach(row => {
      const rowState = row.getAttribute('data-state');
      const badge = row.querySelector('.active-state-badge');
      if (rowState === selectedState) {
        row.classList.add('active-state-row');
        if (!badge) {
          const firstTd = row.querySelector('td:first-child');
          if (firstTd) {
            const span = document.createElement('span');
            span.className = 'active-state-badge';
            span.textContent = 'Selected';
            firstTd.appendChild(span);
          }
        }
      } else {
        row.classList.remove('active-state-row');
        if (badge) badge.remove();
      }
    });
  }

  // Interactive Click on Matrix Rows
  document.querySelectorAll('.matrix-table tbody tr').forEach(row => {
    row.addEventListener('click', () => {
      const rowState = row.getAttribute('data-state');
      if (rowState && TaxData.states[rowState]) {
        els.state.value = rowState;
        updateLocalDropdown();
        recalculate();
        showToast(`Benchmarked to ${TaxData.states[rowState].name}`);
      }
    });
  });

  // Cmd+K Quick Button Trigger in Header
  const cmdKTrigger = document.getElementById('cmd-k-trigger-btn');
  if (cmdKTrigger) {
    cmdKTrigger.addEventListener('click', () => {
      els.cmdKModal.classList.add('active');
      els.cmdKInput.focus();
    });
  }

  // Scroll-Spy for Header Navigation Links
  const navLinks = document.querySelectorAll('.header-nav .nav-link');
  const sectionsToObserve = ['calculator', 'visualizer', 'ladder', 'matrix', 'education', 'faq'];

  if ('IntersectionObserver' in window && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0.05 });

    sectionsToObserve.forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  // Initial Calculation
  recalculate();
});