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

  const VerifyViz = { renderGauge, renderComponentBars, destroy };

  if (typeof window !== 'undefined') window.VerifyViz = VerifyViz;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifyViz;
})(typeof globalThis !== 'undefined' ? globalThis : this);
