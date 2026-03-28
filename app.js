/* ── MUSAB FINANCE PWA ──────────────────────────────────────────────────────── */

// ── PASSWORD GATE ─────────────────────────────────────────────────────────────
const PWD_HASH = '3c7573458a12e7b6eb4966aa505d0c0c3fb9f9f5808adafe437ab623fdf80969';
const AUTH_KEY = 'mf_auth';
const AUTH_TTL = 24 * 60 * 60 * 1000;

function sha256(str) {
  function rr(v,a){return(v>>>a)|(v<<(32-a));}
  const P=Math.pow,M=P(2,32);let h=[];const k=[];let pc=0;const ic={};
  for(let c=2;pc<64;c++){if(!ic[c]){for(let i=0;i<313;i+=c)ic[i]=c;
    h[pc]=(P(c,.5)*M)|0;k[pc++]=(P(c,1/3)*M)|0;}}
  let s=str+'\x80';while(s.length%64-56)s+='\x00';
  const w=[];for(let i=0;i<s.length;i++){if(s.charCodeAt(i)>>8)return'';w[i>>2]|=s.charCodeAt(i)<<((3-i%4)*8);}
  const bl=str.length*8;w[w.length]=(bl/M)|0;w[w.length]=bl;
  for(let j=0;j<w.length;){const ww=w.slice(j,j+=16);const oh=h.slice();h=h.slice(0,8);
    for(let i=0;i<64;i++){const w15=ww[i-15],w2=ww[i-2],a=h[0],e=h[4];
      const t1=h[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&h[5])^(~e&h[6]))+k[i]+(ww[i]=(i<16)?ww[i]:(ww[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+ww[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
      const t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&h[1])^(a&h[2])^(h[1]&h[2]));
      h=[(t1+t2)|0,...h];h[4]=(h[4]+t1)|0;h.length=8;}
    h=h.map((v,i)=>(v+oh[i])|0);}
  return h.map(v=>[3,2,1,0].map(j=>((v>>(j*8))&255).toString(16).padStart(2,'0')).join('')).join('');
}

function isAuthenticated() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const { ts, hash } = JSON.parse(raw);
    if (hash !== PWD_HASH) { localStorage.removeItem(AUTH_KEY); return false; }
    return (Date.now() - ts) < AUTH_TTL;
  } catch { return false; }
}

function unlock() {
  const input = document.getElementById('lock-input');
  const errEl = document.getElementById('lock-error');
  const pwd = input.value;
  if (!pwd) { errEl.textContent = 'Please enter your password.'; return; }
  errEl.textContent = '';
  const hash = sha256(pwd);
  if (hash === PWD_HASH) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ts: Date.now(), hash: PWD_HASH }));
    document.getElementById('lock-screen').classList.add('hidden');
    initApp();
  } else {
    errEl.textContent = 'Incorrect password. Please try again.';
    input.value = '';
    input.focus();
    input.style.borderColor = '#f87171';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
  }
}

function toggleEye() {
  const inp = document.getElementById('lock-input');
  const eye = document.getElementById('lock-eye');
  if (inp.type === 'password') { inp.type = 'text'; eye.textContent = '🙈'; }
  else { inp.type = 'password'; eye.textContent = '👁'; }
}

if (isAuthenticated()) {
  document.getElementById('lock-screen').classList.add('hidden');
  window.addEventListener('DOMContentLoaded', () => initApp(), { once: true });
} else {
  document.getElementById('lock-input').focus();
}

// ── DATA & CONSTANTS ──────────────────────────────────────────────────────────
const D = window.FINANCE_DATA;
const CAT_COLORS = {
  'Personal Expenses': '#028090',
  'Personal Travel':   '#2B9D92',
  'Family Travel':     '#8B5CF6',
  'Payment':           '#10b981',
};
const SUBCAT_COLORS = {
  'Dining & Food':           '#F59E0B',
  'Travel & Transport':      '#06B6D4',
  'Shopping & Retail':       '#A855F7',
  'Subscriptions & Digital': '#10B981',
  'Accommodation':           '#F97316',
  'Other / Fees':            '#9CA3AF',
  'Payment':                 '#10b981',
};
const SUBCAT_ICONS = {
  'Dining & Food':           '🍽',
  'Travel & Transport':      '✈️',
  'Shopping & Retail':       '🛍',
  'Subscriptions & Digital': '📱',
  'Accommodation':           '🏨',
  'Other / Fees':            '📋',
  'Payment':                 '💰',
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—';
  return 'OMR ' + Math.round(Number(n)).toLocaleString('en-GB');
}
function fmtN(n) {   // fmt without prefix, 2dp for K values
  if (n == null) return '—';
  const abs = Math.abs(n);
  if (abs >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (abs >= 1000)    return (n/1000).toFixed(2) + 'K';
  return Math.round(n).toLocaleString('en-GB');
}
function fmtShort(n) {
  if (n == null || n === 0) return 'OMR 0';
  const abs = Math.abs(n);
  if (abs >= 1000000) return 'OMR ' + (n/1000000).toFixed(1) + 'M';
  if (abs >= 1000)    return 'OMR ' + Math.round(n/1000) + 'K';
  return 'OMR ' + Math.round(n).toLocaleString('en-GB');
}
function pct(part, total) {
  if (!total) return '0%';
  return Math.round(Math.abs(part/total)*100) + '%';
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function showTab(id, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
  document.getElementById('content').scrollTop = 0;
}

// ── HEADER DATE ───────────────────────────────────────────────────────────────
document.getElementById('hdr-date').textContent =
  new Date().toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});


// ═══════════════════════════════════════════════════════════════════════════════
// ── TAB 1: MONTH ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let activeCFMonth = 2; // default to latest month with data (March = index 2)
let monthTrendChart = null;

function initMonth() {
  renderMonthPills();
  renderMonthContent();
  renderYTDWaterfall();
}

function renderMonthPills() {
  const cf = D.cashflow;
  // Only months with actual data
  const pillsEl = document.getElementById('cf-month-pills');
  const pills = cf.months
    .map((m, i) => ({ m, i, hasData: cf.income_actual[i] !== 0 || cf.expense_actual[i] !== 0 }))
    .filter(x => x.hasData);
  pillsEl.innerHTML = pills.map(x =>
    `<div class="month-pill${x.i === activeCFMonth ? ' active' : ''}" onclick="setMonthIdx(${x.i})">${x.m} 2026</div>`
  ).join('');
}

function setMonthIdx(i) {
  activeCFMonth = i;
  renderMonthPills();
  renderMonthContent();
}

function renderMonthContent() {
  const cf = D.cashflow;
  const i = activeCFMonth;
  const monthName = cf.months[i] + ' 2026';

  const incAct  = cf.income_actual[i]  || 0;
  const incBud  = cf.income_budget[i]  || 0;
  const expAct  = Math.abs(cf.expense_actual[i] || 0);
  const expBud  = Math.abs(cf.expense_budget[i] || 0);
  const netAct  = cf.actual[i] || 0;
  const netBud  = cf.budget[i] || 0;
  const netVar  = netAct - netBud;

  // ── Hero ──────────────────────────────────────────────────────────────────
  const netGood  = netVar >= 0;
  const netColor = netAct >= 0 ? '#4ade80' : '#f87171';
  const varColor = netGood ? '#4ade80' : '#f87171';
  document.getElementById('month-hero').innerHTML = `
    <div class="mh-meta">Monthly Dashboard</div>
    <div class="mh-name">${monthName}</div>
    <div class="mh-cols">
      <div>
        <div class="mh-col-label">Net Cash Flow</div>
        <div class="mh-net-val" style="color:${netColor}">${netAct >= 0 ? '+' : ''}${fmt(netAct)}</div>
        <div class="mh-net-vs">Budget: ${netBud >= 0 ? '+' : ''}${fmt(netBud)}</div>
      </div>
      <div>
        <div class="mh-col-label" style="text-align:right">vs Budget</div>
        <div class="mh-var-val" style="color:${varColor}">${netVar >= 0 ? '+' : ''}${fmtShort(netVar)}</div>
        <div class="mh-var-sub">${netGood ? '▲ above' : '▼ below'} budget</div>
      </div>
    </div>`;

  // ── Line-item breakdown table ─────────────────────────────────────────────
  const bd = (D.cashflow.monthly_breakdown || [])[i] || {};

  function makeBreakdown(items, isExpense) {
    const rows = [];
    for (const [label, v] of Object.entries(items)) {
      const b = isExpense ? Math.abs(v.budget || 0) : (v.budget || 0);
      const a = isExpense ? Math.abs(v.actual || 0) : (v.actual || 0);
      if (b === 0 && a === 0) continue;
      rows.push({ label, a, b, variance: a - b });
    }
    if (!rows.length) return '';

    const totalA   = rows.reduce((s, r) => s + r.a, 0);
    const totalB   = rows.reduce((s, r) => s + r.b, 0);
    const totalVar = totalA - totalB;

    function vs(v) {
      if (Math.abs(Math.round(v)) === 0) return '─';
      return (v > 0 ? '+' : '') + fmtN(v);
    }
    function vc(v, good) {
      if (Math.abs(Math.round(v)) === 0) return 'var(--muted)';
      return good ? '#166534' : '#991b1b';
    }

    let html = `<div class="g-breakdown">
      <div class="bk-hdr">
        <span class="bk-label"></span>
        <span class="bk-col">Act.</span>
        <span class="bk-col bk-bud">Bud.</span>
        <span class="bk-col">Var</span>
      </div>`;

    for (const row of rows) {
      const good  = isExpense ? (row.variance <= 0) : (row.variance >= 0);
      const isCCNet = row.label === 'CC Balance Δ';
      const displayLabel = isCCNet ? 'CC Net Movement' : row.label;
      html += `<div class="bk-row${isCCNet ? ' bk-muted-row' : ''}">
        <span class="bk-label">${displayLabel}</span>
        <span class="bk-col">${row.a > 0 ? fmtN(row.a) : '─'}</span>
        <span class="bk-col bk-bud">${row.b > 0 ? fmtN(row.b) : '─'}</span>
        <span class="bk-col" style="color:${vc(row.variance, good)}">${vs(row.variance)}</span>
      </div>`;
    }

    const totalGood = isExpense ? (totalVar <= 0) : (totalVar >= 0);
    html += `<div class="bk-row bk-total">
      <span class="bk-label">Total</span>
      <span class="bk-col">${fmtN(totalA)}</span>
      <span class="bk-col bk-bud">${fmtN(totalB)}</span>
      <span class="bk-col" style="color:${vc(totalVar, totalGood)}">${vs(totalVar)}</span>
    </div></div>`;

    return html;
  }

  // ── Gauge helper ─────────────────────────────────────────────────────────
  function makeGauge({ name, actual, budget, color, overIsGood, bullets }) {
    const rawPct  = budget > 0 ? Math.round(actual / budget * 100) : 0;
    const fillPct = Math.min(rawPct, 100);
    const variance = actual - budget;

    const good = overIsGood ? (actual >= budget) : (actual <= budget);
    const badgeBg  = good ? '#dcfce7' : '#fee2e2';
    const badgeFg  = good ? '#166534' : '#991b1b';
    const varColor = good ? '#166534' : '#991b1b';

    let badgeText;
    if (!overIsGood) {
      badgeText = rawPct + '% used' + (good ? ' ✓' : ' ✗');
    } else {
      badgeText = rawPct + '%' + (good ? ' ✓' : ' ✗');
    }

    let varText;
    if (!overIsGood) {
      varText = variance <= 0
        ? fmtShort(Math.abs(variance)) + ' saved'
        : '+' + fmtShort(variance) + ' over budget';
    } else {
      varText = (variance >= 0 ? '+' : '') + fmtShort(variance);
    }

    return `
      <div class="gauge-item">
        <div class="g-header">
          <span class="g-name">${name}</span>
          <span class="g-badge" style="background:${badgeBg};color:${badgeFg}">${badgeText}</span>
        </div>
        <div class="g-track">
          <div class="g-fill" style="width:${fillPct}%;background:${color}${rawPct > 100 ? ';background:#ef4444' : ''}"></div>
        </div>
        <div class="g-footer">
          <span class="g-actual">${fmt(actual)}</span>
          <div class="g-right">
            <div class="g-budget">Budget: ${fmt(budget)}</div>
            <div class="g-variance" style="color:${varColor}">${varText}</div>
          </div>
        </div>
        ${bullets || ''}
      </div>`;
  }

  document.getElementById('month-gauges').innerHTML =
    makeGauge({ name: 'Income',   actual: incAct, budget: incBud, color: '#2B9D92', overIsGood: true,  bullets: makeBreakdown(bd.income   || {}, false) }) +
    makeGauge({ name: 'Expenses', actual: expAct, budget: expBud, color: '#ef4444', overIsGood: false, bullets: makeBreakdown(bd.expenses || {}, true)  }) +
    `<div class="gauge-item" style="padding-bottom:4px">
      <div class="g-header">
        <span class="g-name">Net Cash Flow</span>
        <span class="g-badge" style="background:${netGood?'#dcfce7':'#fee2e2'};color:${netGood?'#166534':'#991b1b'}">
          ${netGood ? '▲' : '▼'} ${Math.abs(Math.round((netAct - netBud) / (Math.abs(netBud)||1) * 100))}% vs budget
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0">
        <div style="font-size:28px;font-weight:800;color:${netAct>=0?'#083D4C':'#991b1b'}">
          ${netAct >= 0 ? '+' : ''}${fmt(netAct)}
        </div>
      </div>
      <div class="g-footer">
        <span style="font-size:13px;color:var(--muted)">Budget: ${netBud >= 0 ? '+' : ''}${fmt(netBud)}</span>
        <div class="g-variance" style="color:${netGood?'#166534':'#991b1b'}">${netVar >= 0 ? '+' : ''}${fmtShort(netVar)}</div>
      </div>
    </div>`;
}

function renderYTDWaterfall() {
  const yw = D.ytd_waterfall;
  if (!yw) return;

  // Income + expense items only (exclude 'other': sale of assets, investments)
  const cfItems = yw.items.filter(it => it.type !== 'other');

  // Budget and actual net cashflow (sum of all cf items)
  const budgetNet = cfItems.reduce((s, it) => s + it.budget, 0);
  const actualNet = cfItems.reduce((s, it) => s + it.actual, 0);
  const totalVar  = actualNet - budgetNet;

  // Variance items — show all with non-zero variance, each contributes to the bridge
  const varItems = cfItems.filter(it => Math.abs(Math.round(it.actual - it.budget)) > 0);

  const SHORT = {
    'RE Cashflow':'RE Cashflow','WeMeet':'WeMeet','Salary':'Salary',
    'Household':'Household','Kids Education':'Kids Edu','Personal':'Personal',
    'Personal Travel':'Pers. Travel','Family Travel':'Fam. Travel','Charity':'Charity'
  };

  // ── Build bridge waterfall ─────────────────────────────────────────────────
  const wfLabels = [], wfData = [], wfColors = [], labelVals = [];

  // Bar 0: Budget Net Cashflow
  wfLabels.push('Budget');
  wfData.push([Math.min(0, budgetNet), Math.max(0, budgetNet)]);
  wfColors.push('#083D4CCC');
  labelVals.push(budgetNet);

  // Variance bars
  let running = budgetNet;
  for (const item of varItems) {
    const v = item.actual - item.budget;
    wfLabels.push(SHORT[item.label] || item.label);
    wfData.push([Math.min(running, running + v), Math.max(running, running + v)]);
    // cash-flow direction: positive variance = more cash = favourable
    wfColors.push(v >= 0 ? '#2B9D92CC' : '#ef4444CC');
    labelVals.push(v);
    running += v;
  }

  // Final bar: Actual Net Cashflow
  wfLabels.push('Actual');
  wfData.push([Math.min(0, actualNet), Math.max(0, actualNet)]);
  wfColors.push(actualNet >= 0 ? '#083D4CCC' : '#F59E0BCC');
  labelVals.push(actualNet);

  // ── KPI row ───────────────────────────────────────────────────────────────
  document.getElementById('ytd-wf-kpis').innerHTML = `
    <div class="ytd-kpi"><div class="ytd-kpi-label">Budget Net</div>
      <div class="ytd-kpi-val" style="color:${budgetNet>=0?'#166534':'#991b1b'}">${budgetNet>=0?'+':''}${fmtShort(budgetNet)}</div></div>
    <div class="ytd-kpi"><div class="ytd-kpi-label">Variance</div>
      <div class="ytd-kpi-val" style="color:${totalVar>=0?'#166534':'#991b1b'}">${totalVar>=0?'+':''}${fmtShort(totalVar)}</div></div>
    <div class="ytd-kpi"><div class="ytd-kpi-label">Actual Net</div>
      <div class="ytd-kpi-val" style="color:${actualNet>=0?'#166534':'#991b1b'}">${actualNet>=0?'+':''}${fmtShort(actualNet)}</div></div>`;

  // ── Chart ─────────────────────────────────────────────────────────────────
  if (monthTrendChart) { monthTrendChart.destroy(); monthTrendChart = null; }
  monthTrendChart = new Chart(document.getElementById('chart-ytd-waterfall'), {
    type: 'bar',
    plugins: [typeof ChartDataLabels !== 'undefined' ? ChartDataLabels : {}],
    data: {
      labels: wfLabels,
      datasets: [{ data: wfData, backgroundColor: wfColors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 22, bottom: 4 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          display: true,
          color: ctx => {
            const v = labelVals[ctx.dataIndex];
            if (ctx.dataIndex === 0 || ctx.dataIndex === wfLabels.length - 1) return '#083D4C';
            return v >= 0 ? '#166534' : '#991b1b';
          },
          font: { size: 10, weight: '700' },
          formatter: (val, ctx) => {
            const v = labelVals[ctx.dataIndex];
            const isEndBar = ctx.dataIndex === 0 || ctx.dataIndex === wfLabels.length - 1;
            return (isEndBar ? (v >= 0 ? '+' : '') : (v >= 0 ? '+' : '')) + fmtN(v);
          },
          // For positive-value bars: label above (anchor=end); for negative: label below (anchor=start)
          anchor: (ctx) => labelVals[ctx.dataIndex] >= 0 ? 'end' : 'start',
          align:  (ctx) => labelVals[ctx.dataIndex] >= 0 ? 'top'  : 'bottom',
          clamp: true,
          offset: 2
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = labelVals[ctx.dataIndex];
              const isEndBar = ctx.dataIndex === 0 || ctx.dataIndex === wfLabels.length - 1;
              return isEndBar ? 'Net: ' + fmtShort(v) : 'Variance: ' + (v >= 0 ? '+' : '') + fmtShort(v);
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 35 } },
        y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => fmtShort(v) } }
      }
    }
  });

  // ── Explanation notes ─────────────────────────────────────────────────────
  const noted = varItems.filter(it => it.note && it.note.trim() && it.note !== 'None');
  if (noted.length) {
    let html = '';
    for (const item of noted) {
      const v = item.actual - item.budget;
      const isGood = v >= 0; // positive variance = more cash = good
      const vc = isGood ? '#166534' : '#991b1b';
      html += `<div class="ytd-note-row">
        <span class="ytd-note-item">${item.label}</span>
        <span class="ytd-note-var" style="color:${vc}">${(v >= 0 ? '+' : '') + fmtN(v)}</span>
        <span class="ytd-note-text">${item.note}</span>
      </div>`;
    }
    document.getElementById('ytd-notes').innerHTML = html;
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── TAB 2: NET WORTH ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function initNetWorth() {
  const nw = D.net_worth;

  // KPIs
  document.getElementById('kpi-nw').textContent      = fmtShort(nw.net_worth);
  document.getElementById('kpi-nw-date').textContent = 'as at ' + nw.as_at;
  document.getElementById('kpi-assets').textContent  = fmtShort(nw.total_assets);
  const nashwaFund = nw.liabilities['Nashwa Fund'] || 0;
  document.getElementById('kpi-liab').textContent    = fmtShort(nashwaFund);

  // Asset donut chart — expand Real Estate into Oman/Dubai/Manchester
  const ASSET_COLORS = {
    'Cash in Bank':   '#028090',
    'WeMeet (20%)':   '#E85D04',
    'XOM (8.4%)':     '#7B2D8B',
    'RE Oman':        '#083D4C',
    'RE Dubai':       '#F59E0B',
    'RE Manchester':  '#EF4444',
    'Shares & Bonds': '#6366F1',
    'Receivable':     '#10B981',
  };
  const assetEntries = [];
  for (const [k, v] of Object.entries(nw.assets)) {
    if (!v || v === 0) continue;
    if (k === 'Real Estate' && nw.re_breakdown) {
      for (const [rk, rv] of Object.entries(nw.re_breakdown)) {
        if (rv > 0) assetEntries.push([rk, rv]);
      }
    } else {
      assetEntries.push([k, v]);
    }
  }
  const assetLabels = assetEntries.map(([k]) => k);
  const assetVals   = assetEntries.map(([,v]) => v);
  const assetColors = assetEntries.map(([k]) => ASSET_COLORS[k] || '#9CA3AF');

  new Chart(document.getElementById('chart-assets'), {
    type: 'doughnut',
    plugins: [typeof ChartDataLabels !== 'undefined' ? ChartDataLabels : {}],
    data: {
      labels: assetLabels,
      datasets: [{ data: assetVals, backgroundColor: assetColors, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '50%',
      layout: { padding: 24 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmt(ctx.raw) + '  (' + pct(ctx.raw, nw.total_assets) + ')' } },
        datalabels: {
          display: ctx => ctx.dataset.data[ctx.dataIndex] / nw.total_assets >= 0.03,
          color: '#fff',
          font: { size: 11, weight: '700' },
          textStrokeColor: 'rgba(0,0,0,0.5)',
          textStrokeWidth: 3,
          formatter: (val) => {
            const p = Math.round(val / nw.total_assets * 100);
            return p + '%';
          },
          anchor: 'center',
          align: 'center',
        }
      }
    }
  });

  // Legend below chart — two-column grid
  let legHtml = '<div class="nw-leg-grid">';
  assetEntries.forEach(([k, v], idx) => {
    const p = Math.round(v / nw.total_assets * 100);
    legHtml += `<div class="nw-leg-row">
      <div class="nw-leg-dot" style="background:${assetColors[idx]}"></div>
      <div class="nw-leg-label">${k}</div>
      <div class="nw-leg-val">${fmtShort(v)}</div>
    </div>`;
  });
  legHtml += '</div>';
  document.getElementById('nw-asset-legend').innerHTML = legHtml;

  // Liabilities + Net Worth below chart
  let liabHtml = '';
  if (Object.keys(nw.liabilities).length) {
    liabHtml += '<div class="nw-section-head" style="margin-top:12px">Liabilities</div>';
    for (const [k, v] of Object.entries(nw.liabilities)) {
      if (v) liabHtml += `<div class="nw-row">
        <span class="nw-label">${k}</span>
        <span class="nw-amount" style="color:#991b1b">${fmtShort(v)}</span>
      </div>`;
    }
  }
  liabHtml += `<div class="nw-row" style="font-weight:700;border-top:2px solid #083D4C;margin-top:4px">
    <span>Net Worth</span>
    <span class="nw-amount" style="color:#083D4C;font-size:16px">${fmtShort(nw.net_worth)}</span>
  </div>`;
  document.getElementById('nw-liab-section').innerHTML = liabHtml;

  // YTD Income vs Budget gauges
  const ivb = nw.ytd_income_vs_budget || [];
  if (ivb.length) {
    const totalBud = ivb.reduce((s, x) => s + x.budget, 0);
    const totalAct = ivb.reduce((s, x) => s + x.actual, 0);
    const totalVar = totalAct - totalBud;
    const totalGood = totalAct >= totalBud;

    let ghtml = '';
    for (const src of ivb) {
      const rawPct  = src.budget > 0 ? Math.round(src.actual / src.budget * 100) : 0;
      const fillPct = Math.min(rawPct, 100);
      const varVal  = src.actual - src.budget;
      const good    = varVal >= 0;
      const badgeBg = good ? '#dcfce7' : '#fee2e2';
      const badgeFg = good ? '#166534' : '#991b1b';
      const varColor = good ? '#166534' : '#991b1b';
      const barColor = src.type === 're' ? '#083D4C' : '#2B9D92';
      ghtml += `
        <div class="inc-gauge-item">
          <div class="g-header">
            <span class="g-name">${src.label}</span>
            <span class="g-badge" style="background:${badgeBg};color:${badgeFg}">${rawPct}%${good ? ' ✓' : ' ✗'}</span>
          </div>
          <div class="g-track">
            <div class="g-fill" style="width:${fillPct}%;background:${rawPct > 100 ? '#ef4444' : barColor}"></div>
          </div>
          <div class="g-footer">
            <span class="g-actual">${fmt(src.actual)}</span>
            <div class="g-right">
              <div class="g-budget">Budget: ${fmt(src.budget)}</div>
              <div class="g-variance" style="color:${varColor}">${(varVal >= 0 ? '+' : '') + fmtShort(varVal)}</div>
            </div>
          </div>
        </div>`;
    }
    // Total row
    const tvColor = totalGood ? '#166534' : '#991b1b';
    ghtml += `<div class="inc-gauge-total">
      <span>Total YTD Income</span>
      <span>${fmt(totalAct)} <span style="color:${tvColor};font-size:12px">(${totalGood ? '+' : ''}${fmtShort(totalVar)} vs budget)</span></span>
    </div>`;
    document.getElementById('ytd-income-gauges').innerHTML = ghtml;
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── TAB 3: CREDIT CARD ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let activeMonth = 'All';

function initCC() {
  const cc = D.cc;
  document.getElementById('cc-balance').textContent = fmt(cc.current_balance);

  new Chart(document.getElementById('chart-cc-monthly'), {
    type: 'bar',
    data: {
      labels: cc.monthly_summary.map(m => m.month),
      datasets: [{ label: 'Closing Balance', data: cc.monthly_summary.map(m => m.closing),
        backgroundColor: '#028090CC', borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => fmtShort(v) } }
      }
    }
  });

  const cats = cc.category_breakdown.filter(c => c.name !== 'Payment');
  const total = cats.reduce((s, c) => s + c.total, 0);
  new Chart(document.getElementById('chart-cc-donut'), {
    type: 'doughnut',
    data: {
      labels: cats.map(c => c.name),
      datasets: [{ data: cats.map(c => c.total), backgroundColor: cats.map(c => CAT_COLORS[c.name] || '#ccc'),
        borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } } }
    }
  });

  const grandTotal = cc.category_breakdown.reduce((s,c) => s + (c.name !== 'Payment' ? c.total : 0), 0);
  let chtml = '';
  cc.category_breakdown.forEach(c => {
    const color = CAT_COLORS[c.name] || '#9ca3af';
    const p = c.name !== 'Payment' ? pct(c.total, grandTotal) : '—';
    chtml += `<div class="cat-row">
      <div class="cat-dot" style="background:${color}"></div>
      <div class="cat-name" style="font-size:13px">${c.name}</div>
      <div style="text-align:right">
        <div class="cat-amount" style="font-size:13px">${fmtShort(c.total)}</div>
        <div class="cat-pct">${p}</div>
      </div>
    </div>`;
  });
  document.getElementById('cc-cat-list').innerHTML = chtml;

  const months = ['All', ...cc.monthly_summary.map(m => m.month)];
  document.getElementById('month-pills').innerHTML = months.map(m =>
    `<div class="month-pill${m === activeMonth ? ' active' : ''}" onclick="setMonth('${m}')">${m}</div>`
  ).join('');

  renderTxnList();
}

function setMonth(m) {
  activeMonth = m;
  document.querySelectorAll('#month-pills .month-pill').forEach(p =>
    p.classList.toggle('active', p.textContent === m));
  renderTxnList();
}

function renderTxnList() {
  const txns = D.cc.transactions.filter(t => activeMonth === 'All' || t.month === activeMonth);
  document.getElementById('txn-list').innerHTML = renderTxnItems(txns.slice(0, 50));
}

function renderTxnItems(txns) {
  if (!txns.length) return '<div class="empty">No transactions found</div>';
  return txns.map(t => {
    const icon  = SUBCAT_ICONS[t.subcat]  || '💳';
    const color = SUBCAT_COLORS[t.subcat] || '#e5e7eb';
    const isDR  = t.dr_cr === 'DR';
    return `<div class="txn-item">
      <div class="txn-icon" style="background:${color}22">${icon}</div>
      <div class="txn-body">
        <div class="txn-desc">${t.desc}</div>
        <div class="txn-meta">${t.subcat} · ${t.month}</div>
      </div>
      <div class="txn-right">
        <div class="txn-amount ${isDR ? 'dr' : 'cr'}">${isDR ? '-' : '+'}${fmt(t.omr)}</div>
        <div class="txn-date">${t.date}</div>
      </div>
    </div>`;
  }).join('');
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── TAB 4: SEARCH ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let activeFilter = 'All';
const FILTERS = ['All', 'Personal Expenses', 'Personal Travel', 'Family Travel', 'Payment'];

function initSearch() {
  document.getElementById('filter-chips').innerHTML = FILTERS.map(f =>
    `<div class="chip${f === activeFilter ? ' active' : ''}" onclick="setFilter('${f}')">${f}</div>`
  ).join('');
  renderSearch();
}

function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.textContent === f));
  renderSearch();
}

function renderSearch() {
  const query = (document.getElementById('search-input').value || '').toLowerCase().trim();
  let txns = D.cc.transactions;
  if (activeFilter !== 'All') txns = txns.filter(t => t.cat === activeFilter);
  if (query) txns = txns.filter(t =>
    t.desc.toLowerCase().includes(query) ||
    t.subcat.toLowerCase().includes(query) ||
    t.date.includes(query) ||
    t.month.toLowerCase().includes(query)
  );
  const countEl = document.getElementById('search-count');
  countEl.textContent = txns.length + ' transaction' + (txns.length !== 1 ? 's' : '') +
    (query ? ` matching "${query}"` : '');
  document.getElementById('search-results').innerHTML = renderTxnItems(txns.slice(0, 100));
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── INIT ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function initApp() {
  initMonth();
  initNetWorth();
  initCC();
  initSearch();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

if (isAuthenticated()) initApp();
