// Interactive figures for "AI Fundamentals: Neural Networks".
// Plain JavaScript, no libraries. All labels are real SVG/HTML text, and colours
// come from the site's CSS variables, so the figures follow light and dark mode.
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  // Numbers with a true minus sign, as in the essay's figures
  function fmt(x, d) {
    var s = Math.abs(x).toFixed(d);
    return (x < 0 && Number(s) !== 0 ? '−' : '') + s;
  }
  function svgPoint(svg, evt) {
    var p = svg.createSVGPoint();
    p.x = evt.clientX; p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  /* ---------------------------------------------------------- Fig. 3: pixels */
  document.querySelectorAll('[data-pixels]').forEach(function (root) {
    var cells = root.querySelectorAll('.px');
    var items = root.querySelectorAll('.pixel-list li');
    var initial = Array.prototype.map.call(cells, function (c) { return Number(c.dataset.v); });
    var steps = [0, 0.1, 0.4, 0.7, 1];
    function set(i, v) {
      var g = Math.round(v * 255);
      var style = 'rgb(' + g + ',' + g + ',' + g + ')';
      var fg = v > 0.55 ? '#141413' : '#f1eee6';
      var label = v.toFixed(1);
      cells[i].dataset.v = label;
      cells[i].textContent = label;
      cells[i].style.background = style; cells[i].style.color = fg;
      cells[i].setAttribute('aria-label', 'Row ' + (Math.floor(i / 5) + 1) + ', column ' + (i % 5 + 1) + ': brightness ' + label);
      items[i].textContent = label;
      items[i].style.background = style; items[i].style.color = fg;
    }
    cells.forEach(function (c, i) {
      c.addEventListener('click', function () {
        var v = Number(c.dataset.v);
        var next = steps.filter(function (s) { return s > v + 1e-9; })[0];
        set(i, next === undefined ? 0 : next);
      });
    });
    root.querySelector('[data-act="clear"]').addEventListener('click', function () {
      cells.forEach(function (c, i) { set(i, 0); });
    });
    root.querySelector('[data-act="reset"]').addEventListener('click', function () {
      initial.forEach(function (v, i) { set(i, v); });
    });
  });

  /* ---------------------------------------------------------- Fig. 4: network + neuron */
  document.querySelectorAll('[data-network]').forEach(function (svg) {
    var fig = svg.closest('figure');
    var ins = svg.querySelectorAll('.node.in');
    var hl = svg.querySelector('[data-hl]');
    var label = svg.querySelector('[data-sel-label]');
    var wl = svg.querySelectorAll('[data-w]');
    svg.appendChild(label);
    function select(node) {
      svg.querySelectorAll('.node.h1').forEach(function (n) { n.classList.remove('sel'); });
      node.classList.add('sel');
      var hx = Number(node.getAttribute('cx')), hy = Number(node.getAttribute('cy'));
      var d = '';
      ins.forEach(function (n) { d += 'M' + n.getAttribute('cx') + ',' + n.getAttribute('cy') + 'L' + hx + ',' + hy; });
      hl.setAttribute('d', d);
      wl.forEach(function (t) {
        var n = ins[Number(t.dataset.w)], f = Number(t.dataset.t);
        var x0 = Number(n.getAttribute('cx')), y0 = Number(n.getAttribute('cy'));
        t.setAttribute('x', (x0 + (hx - x0) * f).toFixed(1));
        t.setAttribute('y', (y0 + (hy - y0) * f - 4).toFixed(1));
      });
      label.setAttribute('x', hx + 15);
      label.setAttribute('y', hy + 4);
      label.querySelector('.sub').textContent = node.dataset.j;
      fig.querySelectorAll('[data-j]').forEach(function (s) { if (s.tagName !== 'circle') s.textContent = node.dataset.j; });
    }
    svg.querySelectorAll('.node.h1').forEach(function (n) {
      n.addEventListener('click', function () { select(n); });
      n.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n); }
      });
    });
  });

  document.querySelectorAll('[data-neuron-lab]').forEach(function (lab) {
    var inputs = lab.querySelectorAll('input[type="range"]');
    var math = lab.querySelector('[data-math]');
    var plot = lab.querySelector('[data-plot]');
    // Activation plot: z from -4 to 4, output from -4 to 4
    var X = function (z) { return 20 + (z + 4) / 8 * 190; };
    var Y = function (v) { return 65 - v / 4 * 55; };
    el('line', { x1: 20, y1: Y(0), x2: 210, y2: Y(0), class: 'axis' }, plot);
    el('line', { x1: X(0), y1: 8, x2: X(0), y2: 122, class: 'axis' }, plot);
    el('text', { x: 212, y: Y(0) + 14, 'text-anchor': 'end', class: 'muted small' }, plot, 'z');
    var curve = el('path', { class: 'curve' }, plot);
    var dot = el('circle', { r: 4.5, class: 'ink-fill' }, plot);
    var name = el('text', { x: 24, y: 18, class: 'small' }, plot);
    function update() {
      var v = {};
      inputs.forEach(function (i) {
        v[i.dataset.k] = Number(i.value);
        lab.querySelector('[data-o="' + i.dataset.k + '"]').textContent = fmt(Number(i.value), 2);
      });
      var relu = lab.querySelector('input[name="act"]:checked').value === 'relu';
      var z = v.w1 * v.a1 + v.w2 * v.a2 + v.w3 * v.a3 + v.b;
      var out = relu ? Math.max(0, z) : z;
      math.innerHTML = 'z = w₁a₁ + w₂a₂ + w₃a₃ + b<br>&nbsp;&nbsp;= ' +
        fmt(v.w1, 2) + '×' + fmt(v.a1, 2) + ' + ' + fmt(v.w2, 2) + '×' + fmt(v.a2, 2) + ' + ' +
        fmt(v.w3, 2) + '×' + fmt(v.a3, 2) + ' + ' + fmt(v.b, 2) + ' = ' + fmt(z, 2) +
        '<br>output = ' + (relu ? 'ReLU(z)' : 'z') + ' = <strong>' + fmt(out, 2) + '</strong>';
      curve.setAttribute('d', relu
        ? 'M' + X(-4) + ',' + Y(0) + 'L' + X(0) + ',' + Y(0) + 'L' + X(4) + ',' + Y(4)
        : 'M' + X(-4) + ',' + Y(-4) + 'L' + X(4) + ',' + Y(4));
      var zc = Math.max(-4, Math.min(4, z));
      dot.setAttribute('cx', X(zc));
      dot.setAttribute('cy', Y(relu ? Math.max(0, zc) : zc));
      name.textContent = relu ? 'ReLU' : 'no activation';
    }
    lab.addEventListener('input', update);
    lab.addEventListener('change', update);
    update();
  });

  /* ---------------------------------------------------------- Fig. 5: softmax + loss */
  document.querySelectorAll('[data-softmax]').forEach(function (box) {
    var START = [-1.2, 0.3, 1.1, 2.0, -0.5, 0.8, -2.1, 4.2, 1.5, 0.6];
    var z = START.slice(), correct = 7;
    box.innerHTML = '';
    var scroller = document.createElement('div');
    scroller.className = 'nn-scroll';
    box.appendChild(scroller);
    var svg = el('svg', { class: 'nn-svg softmax', viewBox: '0 0 640 600', role: 'img', 'aria-labelledby': 'fig5-cap' }, scroller);
    var hint = document.createElement('p');
    hint.className = 'nn-hint';
    hint.textContent = 'Scroll sideways to see all ten digits \u2192';
    box.appendChild(hint);
    var W = 640, L = 60, R = 620, col = (R - L) / 10, bw = col * 0.62;
    var cx = function (i) { return L + col * (i + 0.5); };
    var panels = [
      { top: 30, h: 150, title: '1. Raw outputs from the 10 output neurons, z (any real number)' },
      { top: 230, h: 130, title: '2. Exponentiate each value: e^z (now all positive)' },
      { top: 410, h: 130, title: '3. Divide each by the sum: e^zᵢ / Σⱼ e^zⱼ' }
    ];
    var Z0 = -3, Z1 = 5;
    var zy = function (v) { return panels[0].top + (Z1 - v) / (Z1 - Z0) * panels[0].h; };
    panels.forEach(function (p, k) {
      el('text', { x: L - 50, y: p.top - 12, class: 'title' }, svg, p.title);
      el('line', { x1: L, y1: k === 0 ? zy(0) : p.top + p.h, x2: R, y2: k === 0 ? zy(0) : p.top + p.h, class: 'axis' }, svg);
      for (var i = 0; i < 10; i++) {
        el('text', { x: cx(i), y: p.top + p.h + 18, 'text-anchor': 'middle', class: 'digit' }, svg, String(i));
      }
    });
    el('text', { x: (L + R) / 2, y: 588, 'text-anchor': 'middle' }, svg, 'Digit');
    var sumE = el('text', { x: R, y: panels[1].top + 4, 'text-anchor': 'end' }, svg);
    el('text', { x: R, y: panels[2].top + 4, 'text-anchor': 'end' }, svg, 'sum = 1');
    var bars = [[], [], []], vals = [[], [], []];
    for (var i = 0; i < 10; i++) {
      for (var k = 0; k < 3; k++) {
        bars[k].push(el('rect', { x: cx(i) - bw / 2, width: bw, class: 'bar' }, svg));
        vals[k].push(el('text', { x: cx(i), 'text-anchor': 'middle', class: 'val' }, svg));
      }
      var b = bars[0][i];
      b.setAttribute('tabindex', '0');
      b.setAttribute('role', 'slider');
      b.setAttribute('aria-label', 'Raw output for digit ' + i);
      b.setAttribute('aria-valuemin', Z0);
      b.setAttribute('aria-valuemax', Z1);
      b.classList.add('drag');
    }
    // Wide invisible hit areas make the top bars easy to drag
    var hits = [];
    for (var j = 0; j < 10; j++) {
      hits.push(el('rect', { x: cx(j) - col / 2, y: panels[0].top, width: col, height: panels[0].h, class: 'hit', 'data-i': j }, svg));
    }

    var controls = document.createElement('div');
    controls.className = 'nn-controls';
    controls.innerHTML = '<label>Correct digit <select data-correct></select></label>' +
      '<span class="nn-readout" aria-live="polite" data-loss></span>' +
      '<button type="button" class="nn-btn" data-reset>Reset</button>';
    box.appendChild(controls);
    var sel = controls.querySelector('[data-correct]');
    for (var d = 0; d < 10; d++) {
      var o = document.createElement('option'); o.value = d; o.textContent = d;
      if (d === correct) o.selected = true;
      sel.appendChild(o);
    }
    var lossOut = controls.querySelector('[data-loss]');

    function draw() {
      var e = z.map(Math.exp), sum = e.reduce(function (a, b) { return a + b; }, 0);
      var p = e.map(function (v) { return v / sum; });
      var emax = Math.max(80, Math.max.apply(null, e) * 1.1);
      for (var i = 0; i < 10; i++) {
        var y0 = zy(0), y1 = zy(z[i]);
        bars[0][i].setAttribute('y', Math.min(y0, y1));
        bars[0][i].setAttribute('height', Math.max(1, Math.abs(y1 - y0)));
        bars[0][i].setAttribute('aria-valuenow', z[i].toFixed(1));
        vals[0][i].setAttribute('y', z[i] >= 0 ? y1 - 6 : y1 + 15);
        vals[0][i].textContent = fmt(z[i], 1);
        var h1 = e[i] / emax * panels[1].h, base1 = panels[1].top + panels[1].h;
        bars[1][i].setAttribute('y', base1 - h1); bars[1][i].setAttribute('height', Math.max(0.5, h1));
        vals[1][i].setAttribute('y', base1 - h1 - 6);
        vals[1][i].textContent = e[i] < 1 ? e[i].toFixed(2) : e[i] < 10 ? e[i].toFixed(1) : e[i].toFixed(1);
        var h2 = p[i] * panels[2].h * 1.25, base2 = panels[2].top + panels[2].h;
        h2 = Math.min(h2, panels[2].h + 20);
        bars[2][i].setAttribute('y', base2 - h2); bars[2][i].setAttribute('height', Math.max(0.5, h2));
        vals[2][i].setAttribute('y', base2 - h2 - 6);
        vals[2][i].textContent = p[i] < 0.01 ? '<0.01' : p[i].toFixed(2);
        for (var k = 0; k < 3; k++) bars[k][i].classList.toggle('on', i === correct);
      }
      sumE.textContent = 'sum = ' + sum.toFixed(1);
      var pc = p[correct], loss = -Math.log(pc);
      lossOut.innerHTML = 'Cross-entropy loss = −ln(p<sub>' + correct + '</sub>) = −ln(' +
        (pc < 0.001 ? pc.toExponential(2) : pc.toFixed(3)) + ') = <strong>' + loss.toFixed(2) + '</strong>';
    }

    var drag = null;
    function setFromEvent(i, evt) {
      var pt = svgPoint(svg, evt);
      var v = Z1 - (pt.y - panels[0].top) / panels[0].h * (Z1 - Z0);
      z[i] = Math.round(Math.max(Z0, Math.min(Z1, v)) * 10) / 10;
      draw();
    }
    hits.forEach(function (h) {
      h.addEventListener('pointerdown', function (evt) {
        drag = Number(h.dataset.i);
        h.setPointerCapture(evt.pointerId);
        setFromEvent(drag, evt);
        evt.preventDefault();
      });
      h.addEventListener('pointermove', function (evt) { if (drag !== null) setFromEvent(drag, evt); });
      h.addEventListener('pointerup', function () { drag = null; });
      h.addEventListener('pointercancel', function () { drag = null; });
    });
    bars[0].forEach(function (b, i) {
      b.addEventListener('keydown', function (e) {
        var step = { ArrowUp: 0.1, ArrowRight: 0.1, ArrowDown: -0.1, ArrowLeft: -0.1, PageUp: 1, PageDown: -1 }[e.key];
        if (step === undefined) return;
        e.preventDefault();
        z[i] = Math.round(Math.max(Z0, Math.min(Z1, z[i] + step)) * 10) / 10;
        draw();
      });
    });
    sel.addEventListener('change', function () { correct = Number(sel.value); draw(); });
    controls.querySelector('[data-reset]').addEventListener('click', function () { z = START.slice(); draw(); });
    draw();
  });

  /* ---------------------------------------------------------- Fig. 7: gradient descent */
  document.querySelectorAll('[data-gd]').forEach(function (box) {
    box.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'gd-panels';
    box.appendChild(wrap);

    // (a) One weight: an asymmetric bowl with its minimum at w = 3
    var f1 = function (w) { var u = w - 3; return 0.5 * u * u - 0.06 * u * u * u; };
    var g1 = function (w) { var u = w - 3; return u - 0.18 * u * u; };
    // (b) Two weights: a tilted elliptical bowl centred on (0.62, 0.56)
    var C = [0.62, 0.56], ang = 40 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), L1 = 1, L2 = 7;
    function rot(x, y) { var dx = x - C[0], dy = y - C[1]; return [dx * ca + dy * sa, -dx * sa + dy * ca]; }
    var f2 = function (x, y) { var r = rot(x, y); return 0.5 * (L1 * r[0] * r[0] + L2 * r[1] * r[1]); };
    var g2 = function (x, y) {
      var r = rot(x, y), gu = L1 * r[0], gv = L2 * r[1];
      return [gu * ca - gv * sa, gu * sa + gv * ca];
    };

    var A = panel('(a) One weight: find the slope, step downhill, repeat', 'value of one weight, w', 'loss');
    var B = panel('(b) Two weights: the loss landscape seen from above', 'weight w₁', 'weight w₂');
    function panel(title, xl, yl) {
      var p = document.createElement('div');
      p.className = 'gd-panel';
      p.innerHTML = '<p class="gd-title">' + title + '</p>';
      wrap.appendChild(p);
      var svg = el('svg', { class: 'nn-svg gd', viewBox: '0 0 320 270' }, p);
      el('text', { x: 175, y: 266, 'text-anchor': 'middle' }, svg, xl);
      el('text', { x: 12, y: 125, 'text-anchor': 'middle', transform: 'rotate(-90 12 125)' }, svg, yl);
      return svg;
    }
    var ax = { x0: 30, x1: 315, y0: 8, y1: 245 };
    // Panel (a) scales: w in [0, 5.6], loss in [0, 6.5]
    var ax1 = function (w) { return ax.x0 + w / 5.6 * (ax.x1 - ax.x0); };
    var ay1 = function (v) { return ax.y1 - v / 6.5 * (ax.y1 - ax.y0); };
    el('path', { d: 'M' + ax.x0 + ',' + ax.y0 + 'V' + ax.y1 + 'H' + ax.x1, class: 'axis' }, A);
    var d = '';
    for (var w = 0; w <= 5.6; w += 0.05) d += (d ? 'L' : 'M') + ax1(w).toFixed(1) + ',' + ay1(f1(w)).toFixed(1);
    el('path', { d: d, class: 'curve' }, A);
    el('text', { x: ax1(3), y: ay1(0) - 8, 'text-anchor': 'middle', class: 'muted' }, A, 'minimum');
    var defsA = el('defs', {}, A);
    var cpA = el('clipPath', { id: 'gdclipA' }, defsA);
    el('rect', { x: ax.x0 - 7, y: ax.y0 - 7, width: ax.x1 - ax.x0 + 14, height: ax.y1 - ax.y0 + 14 }, cpA);
    var plotA = el('g', { 'clip-path': 'url(#gdclipA)' }, A);
    var tangent = el('line', { class: 'tangent' }, plotA);
    var pathA = el('path', { class: 'gd-path' }, plotA);
    var dotsA = el('g', {}, plotA);

    // Panel (b) scales: unit square
    var bx = function (x) { return ax.x0 + x * (ax.x1 - ax.x0); };
    var by = function (y) { return ax.y1 - y * (ax.y1 - ax.y0); };
    var sx = (ax.x1 - ax.x0), sy = (ax.y1 - ax.y0);
    var clipId = 'gdclip';
    var defs = el('defs', {}, B);
    var cp = el('clipPath', { id: clipId }, defs);
    el('rect', { x: ax.x0, y: ax.y0, width: sx, height: sy }, cp);
    var land = el('g', { 'clip-path': 'url(#' + clipId + ')' }, B);
    el('rect', { x: ax.x0, y: ax.y0, width: sx, height: sy, class: 'land-bg' }, land);
    // Contours of a quadratic are ellipses: semi-axes sqrt(2c / lambda)
    [1.4, 0.9, 0.55, 0.32, 0.17, 0.08, 0.03, 0.008].forEach(function (c) {
      el('ellipse', {
        cx: bx(C[0]), cy: by(C[1]), rx: Math.sqrt(2 * c / L1) * sx, ry: Math.sqrt(2 * c / L2) * sy,
        transform: 'rotate(' + (-40) + ' ' + bx(C[0]) + ' ' + by(C[1]) + ')', class: 'contour'
      }, land);
    });
    el('rect', { x: ax.x0, y: ax.y0, width: sx, height: sy, class: 'frame' }, B);
    el('text', { x: bx(C[0]) - 6, y: by(C[1]) + 5, class: 'cross', 'text-anchor': 'middle' }, B, '×');
    el('text', { x: bx(C[0]) + 10, y: by(C[1]) + 34, class: 'muted' }, B, 'minimum');
    var plotB = el('g', { 'clip-path': 'url(#' + clipId + ')' }, B);
    var gdLine = el('path', { class: 'gd-path' }, plotB);
    var sgdLine = el('path', { class: 'sgd-path' }, plotB);
    var startB_dot = el('circle', { r: 6, class: 'pt start' }, plotB);
    var startB_lbl = el('text', { class: 'small halo' }, plotB, 'start');
    var nowB = el('circle', { r: 4.5, class: 'pt' }, plotB);
    var nowS = el('circle', { r: 3.5, class: 'pt sgd' }, plotB);

    var controls = document.createElement('div');
    controls.className = 'nn-controls';
    controls.innerHTML =
      '<label>Learning rate <input type="range" min="0.05" max="1.2" step="0.05" value="0.3" data-lr></label>' +
      '<output data-lr-out>0.30</output>' +
      '<button type="button" class="nn-btn" data-step>Step</button>' +
      '<button type="button" class="nn-btn" data-run>Run</button>' +
      '<button type="button" class="nn-btn" data-reset>Reset</button>' +
      '<label><input type="checkbox" data-sgd checked> Stochastic (small random batches)</label>';
    box.appendChild(controls);
    var legend = document.createElement('p');
    legend.className = 'gd-legend';
    legend.innerHTML = '<span class="key key-gd"></span> gradient descent (whole dataset) ' +
      '<span class="key key-sgd"></span> stochastic gradient descent (small random batches)';
    box.appendChild(legend);
    var readout = document.createElement('p');
    readout.className = 'nn-readout';
    readout.setAttribute('aria-live', 'polite');
    box.appendChild(readout);
    var note = document.createElement('p');
    note.className = 'gd-note muted';
    note.textContent = 'In (b), contour lines join points of equal loss; darker shading means higher loss. ' +
      'The real network has 13,002 weights and biases, so its landscape has 13,002 dimensions and can’t be drawn, ' +
      'but every step works the same way.';
    box.appendChild(note);

    var lrIn = controls.querySelector('[data-lr]'), lrOut = controls.querySelector('[data-lr-out]');
    var sgdIn = controls.querySelector('[data-sgd]');
    var startA = 0.6, startB = [0.06, 0.78];
    var wA, histA, pB, histB, pS, histS, n, halted, timer = null, seed = 7;
    function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function gauss() { var u = 1 - rand(), v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function reset() {
      stop();
      wA = startA; histA = [wA]; pB = startB.slice(); histB = [pB.slice()]; pS = startB.slice(); histS = [pS.slice()];
      n = 0; seed = 7; halted = false; draw();
    }
    // The learning-rate range (up to 1.2) and panel (b)'s scale (lr / 5) were chosen
    // so both panels always stay on their charts while still showing overshoot.
    function step() {
      if (halted) return;
      var lr = Number(lrIn.value);
      wA = wA - lr * g1(wA);
      histA.push(wA);
      var lr2 = lr / 5, g = g2(pB[0], pB[1]);
      pB = [pB[0] - lr2 * g[0], pB[1] - lr2 * g[1]];
      histB.push(pB.slice());
      var gs = g2(pS[0], pS[1]);
      pS = [pS[0] - lr2 * (gs[0] + 0.45 * gauss()), pS[1] - lr2 * (gs[1] + 0.45 * gauss())];
      histS.push(pS.slice());
      n++;
      // Safety stop: if a step ever leaves a chart, stop rather than draw wild lines
      if (!isFinite(wA) || wA < -0.3 || wA > 5.9 || !isFinite(pB[0]) || !isFinite(pB[1]) ||
          Math.abs(pB[0] - 0.5) > 0.75 || Math.abs(pB[1] - 0.5) > 0.75) {
        halted = true;
        stop();
      }
      draw();
    }
    function clampA(w) { return isFinite(w) ? Math.max(-0.3, Math.min(5.9, w)) : (w > 0 ? 5.9 : -0.3); }
    function fmtLoss(v) { return !isFinite(v) || v > 999 ? '> 999' : fmt(v, 3); }
    function draw() {
      // (a) path along the curve, with the tangent at the current point
      while (dotsA.firstChild) dotsA.removeChild(dotsA.firstChild);
      var d = '';
      histA.forEach(function (w, i) {
        var x = ax1(clampA(w)), y = ay1(Math.min(6.4, f1(clampA(w))));
        d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
        el('circle', { cx: x, cy: y, r: i === histA.length - 1 ? 6 : 4, class: i === 0 ? 'pt start' : 'pt' }, dotsA);
      });
      pathA.setAttribute('d', d);
      var w = clampA(wA), s = Math.max(-8, Math.min(8, g1(w))), x0 = ax1(w - 0.8), x1 = ax1(w + 0.8);
      tangent.setAttribute('x1', x0); tangent.setAttribute('y1', ay1(f1(w) - 0.8 * s));
      tangent.setAttribute('x2', x1); tangent.setAttribute('y2', ay1(f1(w) + 0.8 * s));
      // (b) both paths
      var cv = function (v) { return isFinite(v) ? Math.max(-0.5, Math.min(1.5, v)) : (v > 0 ? 1.5 : -0.5); };
      var toD = function (h) {
        return h.map(function (p, i) { return (i ? 'L' : 'M') + bx(cv(p[0])).toFixed(1) + ',' + by(cv(p[1])).toFixed(1); }).join('');
      };
      gdLine.setAttribute('d', toD(histB));
      sgdLine.setAttribute('d', sgdIn.checked ? toD(histS) : '');
      var cl = function (v) { return Math.max(-0.05, Math.min(1.05, v)); };
      startB_dot.setAttribute('cx', bx(histB[0][0])); startB_dot.setAttribute('cy', by(histB[0][1]));
      startB_lbl.setAttribute('x', bx(histB[0][0]) + 9); startB_lbl.setAttribute('y', by(histB[0][1]) - 9);
      nowB.setAttribute('cx', bx(cl(pB[0]))); nowB.setAttribute('cy', by(cl(pB[1])));
      nowB.style.display = n ? '' : 'none';
      nowS.setAttribute('cx', bx(cl(pS[0]))); nowS.setAttribute('cy', by(cl(pS[1])));
      nowS.style.display = n && sgdIn.checked ? '' : 'none';
      // Overshooting: the last step jumped past the minimum in (a)
      var k = histA.length;
      var overshot = k > 1 && (histA[k - 1] - 3) * (histA[k - 2] - 3) < 0;
      readout.innerHTML = 'Step ' + n + ' · (a) w = ' + (Math.abs(wA) > 999 ? '> 999' : fmt(wA, 2)) + ', loss = ' + fmtLoss(f1(wA)) +
        ' · (b) loss = ' + fmtLoss(f2(pB[0], pB[1])) +
        (halted ? ' · <strong>the steps left the chart: lower the learning rate and press Reset</strong>'
          : overshot ? ' · <strong>that step overshot the minimum</strong>' : '');
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    controls.querySelector('[data-step]').addEventListener('click', function () { stop(); step(); });
    controls.querySelector('[data-run]').addEventListener('click', function () {
      stop();
      var k = 0;
      timer = setInterval(function () { step(); if (++k >= 25) stop(); }, 120);
    });
    controls.querySelector('[data-reset]').addEventListener('click', reset);
    lrIn.addEventListener('input', function () { lrOut.textContent = Number(lrIn.value).toFixed(2); });
    sgdIn.addEventListener('change', draw);
    A.addEventListener('click', function (evt) {
      var p = svgPoint(A, evt);
      startA = Math.max(0, Math.min(5.6, (p.x - ax.x0) / (ax.x1 - ax.x0) * 5.6));
      reset();
    });
    B.addEventListener('click', function (evt) {
      var p = svgPoint(B, evt);
      startB = [Math.max(0, Math.min(1, (p.x - ax.x0) / sx)), Math.max(0, Math.min(1, (ax.y1 - p.y) / sy))];
      reset();
    });
    reset();
  });
})();
