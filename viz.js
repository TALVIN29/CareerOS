// Signal Path Verify — D3 v7 visualizations for the Job Integrity Score.
// Pure rendering helpers: no state, no Alpine, no localStorage.
// window.VerifyViz.{renderGauge, renderComponentBars, destroy}

(function (root) {
  const WEIGHTS = { approvalEvidence: 35, completeness: 20, requirementRealism: 20, internalConsistency: 15, marketComparison: 10 };
  const LABELS = { approvalEvidence: 'Approval evidence', completeness: 'Posting completeness', requirementRealism: 'Requirement realism', internalConsistency: 'Internal consistency', marketComparison: 'Market comparison' };

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

  // Horizontal factor bars for the five transparent integrity factors.
  function renderComponentBars(elId, components) {
    const el = document.getElementById(elId);
    if (!el || typeof d3 === 'undefined') return;
    el.innerHTML = '';

    const keys = Object.keys(WEIGHTS);
    const rows = d3.select(el).selectAll('.jis-bar-row')
      .data(keys)
      .enter()
      .append('div')
      .attr('class', 'jis-bar-row');

    rows.append('div')
      .attr('class', 'jis-bar-label')
      .html(k => `<strong>${LABELS[k]}</strong> <small>· ${WEIGHTS[k]} points</small>`);

    const track = rows.append('div')
      .attr('class', 'jis-bar-track');

    track.append('div')
      .attr('class', 'jis-bar-fill')
      .style('width', '0%')
      .style('background', k => scoreColor(components[k] || 0))
      .transition().duration(800).ease(d3.easeCubicOut)
      .style('width', k => `${Math.max(0, Math.min(100, components[k] || 0))}%`);

    rows.append('div')
      .attr('class', 'jis-bar-value')
      .text(k => Math.round(components[k] || 0));

    rows.append('div')
      .attr('class', 'jis-bar-points')
      .text(k => `${((components[k] || 0) * WEIGHTS[k] / 100).toFixed(1)}pt`);
  }


  // Advertised vs hired, per skill. Same bar structure as the divergence
  // chart, but the second bar is an external outcome rather than our own
  // verification coverage.
  function renderRealisedDemand(elId, demand) {
    const el = document.getElementById(elId);
    if (!el || typeof d3 === 'undefined' || !demand) return;
    el.innerHTML = '';
    const rows = demand.rows.slice(0, 8);
    const max = d3.max(rows, row => row.advertised) || 1;
    const root = d3.select(el);
    const legend = root.append('div').attr('class', 'divergence-legend');
    legend.append('span').attr('class', 'legend-all').text('Advertised in postings');
    legend.append('span').attr('class', 'legend-verified').text('Present in postings that hired');

    const row = root.selectAll('.divergence-row').data(rows).enter().append('div').attr('class', 'divergence-row');
    row.append('div').attr('class', 'divergence-skill').html(item => `<strong>${item.skill}</strong><small>${item.conversion}% of postings led to a hire</small>`);
    const bars = row.append('div').attr('class', 'divergence-bars');
    bars.append('div').attr('class', 'divergence-track').append('div').attr('class', 'divergence-fill divergence-all').style('width', '0%').transition().duration(700).style('width', item => `${item.advertised / max * 100}%`);
    bars.append('div').attr('class', 'divergence-track').append('div').attr('class', 'divergence-fill divergence-verified').style('width', '0%').transition().duration(700).style('width', item => `${item.hired / max * 100}%`);
    row.append('div').attr('class', 'divergence-count').html(item => `<strong>${item.advertised}</strong><small>${item.hired} hired</small>`);
  }

  // Kaplan-Meier step function. Flat until an event, then a vertical drop.
  // The 50% line is drawn so "median not reached" is visible rather than stated.
  function renderSurvival(elId, curve) {
    const el = document.getElementById(elId);
    if (!el || typeof d3 === 'undefined' || !curve) return;
    el.innerHTML = '';
    if (!curve.sufficient || curve.points.length < 2) {
      d3.select(el).append('p').attr('class', 'muted-copy').text(`Insufficient evidence — ${curve.sampleSize} comparable requisitions.`);
      return;
    }
    const width = Math.max(el.clientWidth || 460, 320);
    const height = 200;
    const margin = { top: 12, right: 14, bottom: 28, left: 40 };
    const maxDay = curve.points[curve.points.length - 1].day || 1;
    const x = d3.scaleLinear().domain([0, maxDay]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%');

    svg.append('line').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(0.5)).attr('y2', y(0.5))
      .attr('stroke', 'rgba(148,163,184,.45)').attr('stroke-dasharray', '4 4');
    svg.append('path').datum(curve.points)
      .attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2)
      .attr('d', d3.line().curve(d3.curveStepAfter).x(point => x(point.day)).y(point => y(point.survival)));
    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(6).tickFormat(day => `${day}d`));
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(3).tickFormat(d3.format('.0%')));
    if (curve.medianDays != null) {
      svg.append('line').attr('x1', x(curve.medianDays)).attr('x2', x(curve.medianDays)).attr('y1', y(0.5)).attr('y2', height - margin.bottom)
        .attr('stroke', '#ef4444').attr('stroke-dasharray', '3 3');
    }
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

  const VerifyViz = { renderGauge, renderComponentBars, renderRealisedDemand, renderSurvival, destroy, initSignalField, destroySignalField };

  if (typeof window !== 'undefined') window.VerifyViz = VerifyViz;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifyViz;
})(typeof globalThis !== 'undefined' ? globalThis : this);
