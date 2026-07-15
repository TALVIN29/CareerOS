// Signal Path Verify — D3 v7 visualizations for the Job Integrity Score.
// Pure rendering helpers: no state, no Alpine, no localStorage.
// window.VerifyViz.{renderGauge, renderComponentBars, destroy}

(function (root) {
  const WEIGHTS = { A: 30, V: 20, R: 20, M: 15, C: 10, Q: 5 };
  const LABELS = { A: 'Authorisation', V: 'Verification', R: 'Realism', M: 'Market Fit', C: 'Compensation Fit', Q: 'Quality' };

  function scoreColor(score) {
    if (score < 60) return '#ef4444';
    if (score < 80) return '#f59e0b';
    return '#10b981';
  }

  function destroy(elId) {
    const el = document.getElementById(elId);
    if (el) el.innerHTML = '';
  }

  // Radial arc gauge, 0-100, animated sweep, color band by score threshold.
  function renderGauge(elId, score) {
    const el = document.getElementById(elId);
    if (!el || typeof d3 === 'undefined') return;
    el.innerHTML = '';

    const size = Math.max(120, Math.min(el.clientWidth || 180, 200));
    const thickness = size * 0.14;
    const radius = size / 2 - thickness;
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const clamped = Math.max(0, Math.min(100, score));
    const color = scoreColor(clamped);

    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('width', '100%')
      .attr('height', size);

    const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`);

    g.append('path')
      .attr('d', d3.arc().innerRadius(radius).outerRadius(radius + thickness).startAngle(startAngle).endAngle(endAngle))
      .attr('fill', 'rgba(220,38,38,0.12)');

    const fgArc = d3.arc().innerRadius(radius).outerRadius(radius + thickness).startAngle(startAngle);
    const targetEndAngle = startAngle + (endAngle - startAngle) * (clamped / 100);

    g.append('path')
      .datum({ endAngle: startAngle })
      .attr('fill', color)
      .transition().duration(900).ease(d3.easeCubicOut)
      .attrTween('d', function (d) {
        const interp = d3.interpolate(d.endAngle, targetEndAngle);
        return function (t) {
          d.endAngle = interp(t);
          return fgArc(d);
        };
      });
  }

  // Horizontal component breakdown bars, A/V/R/M/C/Q with weight labels and
  // weighted-contribution shown. `components` is engine's scoreComponents()
  // output ({A,V,R,M,C,Q,P}) — P (penalty) is excluded, it isn't weighted.
  function renderComponentBars(elId, components) {
    const el = document.getElementById(elId);
    if (!el || typeof d3 === 'undefined') return;
    el.innerHTML = '';

    const keys = ['A', 'V', 'R', 'M', 'C', 'Q'];
    const rows = d3.select(el).selectAll('.jis-bar-row')
      .data(keys)
      .enter()
      .append('div')
      .attr('class', 'jis-bar-row flex items-center gap-2 text-xs');

    rows.append('div')
      .attr('class', 'w-32 shrink-0 text-slate-400')
      .html(k => `<span class="text-slate-200 font-semibold">${k}</span> ${LABELS[k]} <span class="text-slate-600">· ${WEIGHTS[k]}%</span>`);

    const track = rows.append('div')
      .attr('class', 'flex-1 h-2 rounded-full bg-black/40 overflow-hidden');

    track.append('div')
      .attr('class', 'h-full rounded-full')
      .style('width', '0%')
      .style('background', k => scoreColor(components[k] || 0))
      .transition().duration(800).ease(d3.easeCubicOut)
      .style('width', k => `${Math.max(0, Math.min(100, components[k] || 0))}%`);

    rows.append('div')
      .attr('class', 'w-10 shrink-0 text-right text-slate-300 font-medium')
      .text(k => Math.round(components[k] || 0));

    rows.append('div')
      .attr('class', 'w-14 shrink-0 text-right text-slate-600')
      .text(k => `${((components[k] || 0) * WEIGHTS[k] / 100).toFixed(1)}pt`);
  }

  // ── Hero signal field (three.js) ──────────────────────────────────────
  // Dark field of drifting nodes connected by faint lines, with an
  // occasional red pulse traveling along one edge — jobs flowing through
  // checkpoints. Subtle background only: low opacity, no bloom, capped
  // pixel ratio, paused while the browser tab is hidden.
  let _signalField = null;

  function initSignalField(containerId) {
    if (_signalField) return; // already running
    const el = document.getElementById(containerId);
    if (!el || typeof THREE === 'undefined') return;
    if (window.innerWidth < 768) return; // ponytail: skip below 768px, not worth the GPU cost on mobile

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = el.clientWidth || window.innerWidth;
    const height = el.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    el.innerHTML = '';
    el.appendChild(renderer.domElement);

    const NODE_COUNT = 60;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10),
        drift: new THREE.Vector3((Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.004),
      });
    }

    const pointGeo = new THREE.BufferGeometry();
    const pointPositions = new Float32Array(NODE_COUNT * 3);
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    const points = new THREE.Points(pointGeo, new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.18, transparent: true, opacity: 0.45 }));
    scene.add(points);

    // Edges connect nodes within a distance threshold. Computed once from
    // initial positions — drift is small enough that the field never looks
    // wrong, and recomputing every frame isn't worth it for a background.
    const edgePairs = [];
    const THRESH = 7.5;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < THRESH) edgePairs.push([i, j]);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(edgePairs.length * 2 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x7f1d1d, transparent: true, opacity: 0.12 }));
    scene.add(lines);

    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 });
    const pulseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), pulseMat);
    scene.add(pulseMesh);
    let pulse = null;

    function spawnPulse() {
      if (!edgePairs.length) return;
      pulse = { edge: edgePairs[Math.floor(Math.random() * edgePairs.length)], t: 0, speed: 0.006 + Math.random() * 0.004 };
    }

    function updateScene() {
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        n.pos.add(n.drift);
        const limits = { x: 15, y: 8, z: 5 };
        ['x', 'y', 'z'].forEach(axis => {
          if (n.pos[axis] > limits[axis] || n.pos[axis] < -limits[axis]) n.drift[axis] *= -1;
        });
        pointPositions[i * 3] = n.pos.x;
        pointPositions[i * 3 + 1] = n.pos.y;
        pointPositions[i * 3 + 2] = n.pos.z;
      }
      pointGeo.attributes.position.needsUpdate = true;

      edgePairs.forEach(([a, b], idx) => {
        const pa = nodes[a].pos, pb = nodes[b].pos;
        linePositions[idx * 6] = pa.x; linePositions[idx * 6 + 1] = pa.y; linePositions[idx * 6 + 2] = pa.z;
        linePositions[idx * 6 + 3] = pb.x; linePositions[idx * 6 + 4] = pb.y; linePositions[idx * 6 + 5] = pb.z;
      });
      lineGeo.attributes.position.needsUpdate = true;

      if (pulse) {
        pulse.t += pulse.speed;
        const pa = nodes[pulse.edge[0]].pos, pb = nodes[pulse.edge[1]].pos;
        pulseMesh.position.lerpVectors(pa, pb, Math.min(pulse.t, 1));
        pulseMat.opacity = Math.sin(Math.min(pulse.t, 1) * Math.PI) * 0.9;
        if (pulse.t >= 1) pulse = null;
      } else if (Math.random() < 0.01) {
        spawnPulse();
      }
    }

    let raf = null;
    function frame() {
      updateScene();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      renderer.render(scene, camera); // static frame, no RAF loop
    } else {
      frame();
    }

    function onResize() {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    function onVisibility() {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else if (!reduced && !raf) {
        frame();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    _signalField = {
      stop() { if (raf) cancelAnimationFrame(raf); raf = null; },
      renderer, onResize, onVisibility,
    };
  }

  function destroySignalField() {
    if (!_signalField) return;
    _signalField.stop();
    window.removeEventListener('resize', _signalField.onResize);
    document.removeEventListener('visibilitychange', _signalField.onVisibility);
    _signalField.renderer.dispose();
    _signalField = null;
  }

  const VerifyViz = { renderGauge, renderComponentBars, destroy, initSignalField, destroySignalField };

  if (typeof window !== 'undefined') window.VerifyViz = VerifyViz;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifyViz;
})(typeof globalThis !== 'undefined' ? globalThis : this);
