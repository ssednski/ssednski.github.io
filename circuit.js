// Draws a faint circuit-board texture behind the page, with pulses looping along the traces.
(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CELL = 40;            // grid spacing in px
  const PULSE_LENGTH = 18;    // length of a glowing pulse in px
  const PULSE_SPEED = 90;     // px per second
  const DIRECTIONS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const random = (min, max) => min + Math.random() * (max - min);

  const board = document.createElementNS(SVG_NS, 'svg');
  board.setAttribute('class', 'circuit');
  board.setAttribute('aria-hidden', 'true');
  document.body.prepend(board);

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  }

  // Walk random traces across a grid, turning by 45 degrees now and then,
  // never reusing a grid point so traces don't overlap.
  function makeTraces(cols, rows) {
    const used = new Set();
    const key = (x, y) => x + ',' + y;
    const traces = [];
    const attempts = Math.round(cols * rows / 5);

    for (let i = 0; i < attempts; i++) {
      let x = Math.floor(Math.random() * cols);
      let y = Math.floor(Math.random() * rows);
      if (used.has(key(x, y))) continue;

      let dir = Math.floor(Math.random() * 8);
      const points = [[x, y]];
      const steps = Math.floor(random(3, 12));

      for (let s = 0; s < steps; s++) {
        if (Math.random() < 0.3) dir = (dir + (Math.random() < 0.5 ? 1 : 7)) % 8;
        const nx = x + DIRECTIONS[dir][0];
        const ny = y + DIRECTIONS[dir][1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) break;
        if (used.has(key(nx, ny)) || points.some(([px, py]) => px === nx && py === ny)) break;
        x = nx;
        y = ny;
        points.push([x, y]);
      }

      if (points.length < 3) continue;
      points.forEach(([px, py]) => used.add(key(px, py)));
      traces.push(points);
    }
    return traces;
  }

  function pathLength(points) {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]) * CELL;
    }
    return length;
  }

  function draw() {
    board.replaceChildren();
    const width = window.innerWidth;
    const height = window.innerHeight;
    board.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const cols = Math.ceil(width / CELL) + 1;
    const rows = Math.ceil(height / CELL) + 1;
    const traceLayer = el('g', { class: 'circuit-traces' });
    const pulseLayer = el('g', { class: 'circuit-pulses' });

    for (const points of makeTraces(cols, rows)) {
      const d = points.map(([x, y], i) => (i ? 'L' : 'M') + (x * CELL + CELL / 2) + ' ' + (y * CELL + CELL / 2)).join(' ');
      traceLayer.appendChild(el('path', { d }));

      // Solder pads at both ends
      for (const [x, y] of [points[0], points[points.length - 1]]) {
        traceLayer.appendChild(el('circle', { cx: x * CELL + CELL / 2, cy: y * CELL + CELL / 2, r: 3 }));
      }

      // Some traces carry a pulse that loops forever, with a pause between runs
      if (reduceMotion.matches || Math.random() > 0.45) continue;
      const length = pathLength(points);
      const period = length + PULSE_LENGTH + random(200, 900);
      const pulse = el('path', { d, 'stroke-dasharray': `${PULSE_LENGTH} ${period - PULSE_LENGTH}` });
      pulseLayer.appendChild(pulse);

      const duration = (period / PULSE_SPEED) * 1000;
      pulse.animate(
        [{ strokeDashoffset: PULSE_LENGTH }, { strokeDashoffset: PULSE_LENGTH - period }],
        { duration, iterations: Infinity, delay: -random(0, duration) }
      );
    }

    board.append(traceLayer, pulseLayer);
  }

  // Redraw when the window size changes meaningfully (ignores mobile toolbar jitter)
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth !== lastWidth || Math.abs(window.innerHeight - lastHeight) > 120) {
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
        draw();
      }
    }, 200);
  });

  reduceMotion.addEventListener('change', draw);
  draw();
})();
