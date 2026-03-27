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
function fmtN(n) {   // fmt without prefix
  if (n == null) return '—';
  const abs = Math.abs(n);
  if (abs >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (abs >= 1000)    return Math.round(n/1000) + 'K';
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
  renderMonthTrendChart();
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

  // ── Gauge helper ─────────────────────────────────────────────────────────
  function makeGauge({ name, actual, budget, color, overIsGood }) {
    const rawPct  = budget > 0 ? Math.round(actual / budget * 100) : 0;
    const fillPct = Math.min(rawPct, 100);
    const variance = actual - budget;

    // Is the result good?
    const good = overIsGood ? (actual >= budget) : (actual <= budget);
    const badgeBg  = good ? '#dcfce7' : '#fee2e2';
    const badgeFg  = good ? '#166534' : '#991b1b';
    const varColor = good ? '#166534' : '#991b1b';

    // Badge label
    let badgeText;
    if (!overIsGood) {
      // Expenses — lower % is better
      badgeText = rawPct + '% used' + (good ? ' ✓' : ' ✗');
    } else {
      badgeText = rawPct + '%' + (good ? ' ✓' : ' ✗');
    }

    // Variance text
    let varText;
    if (!overIsGood) {
      // Expenses
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
      </div>`;
  }

  document.getElementById('month-gauges').innerHTML =
    makeGauge({ name: 'Income',   actual: incAct, budget: incBud, color: '#2B9D92', overIsGood: true  }) +
    makeGauge({ name: 'Expenses', actual: expAct, budget: expBud, color: '#ef4444', overIsGood: false }) +
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

function renderMonthTrendChart() {
  const cf = D.cashflow;
  if (monthTrendChart) { monthTrendChart.destroy(); monthTrendChart = null; }
  monthTrendChart = new Chart(document.getElementById('chart-month-trend'), {
    type: 'bar',
    data: {
      labels: cf.months,
      datasets: [
        {
          label: 'Actual Net',
          data: cf.actual.map((v, i) => (cf.income_actual[i] !== 0 || cf.expense_actual[i] !== 0) ? v : null),
          backgroundColor: cf.actual.map(v => v >= 0 ? '#2B9D92CC' : '#ef4444CC'),
          borderRadius: 5, order: 1
        },
        {
          label: 'Budget Net',
          data: cf.budget,
          backgroundColor: 'rgba(8,61,76,0.10)',
          borderColor: '#083D4C',
          borderWidth: 1.5,
          borderRadius: 5, order: 2
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } },
        tooltip: { callbacks: { label: ctx => (ctx.raw != null ? fmtShort(ctx.raw) : '—') } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => fmtShort(v) } }
      }
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── TAB 2: NET WORTH ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function initNetWorth() {
  const nw = D.net_worth;

  // KPIs
  document.getElementById('kpi-nw').textContent    = fmtShort(nw.net_worth);
  document.getElementById('kpi-nw-date').textContent = 'as at ' + nw.as_at;
  document.getElementById('kpi-assets').textContent = fmtShort(nw.total_assets);
  const liabVal = Object.values(nw.liabilities).reduce((s,v) => s + (v||0), 0);
  document.getElementById('kpi-liab').textContent   = fmtShort(liabVal);

  // Asset breakdown
  let html = '<div class="nw-section-head">Assets</div>';
  for (const [k, v] of Object.entries(nw.assets)) {
    if (v) html += `<div class="nw-row">
      <span class="nw-label">${k}</span>
      <span class="nw-amount">${fmtShort(v)}</span>
    </div>`;
  }
  html += `<div class="nw-row" style="font-weight:700">
    <span>Total Assets</span>
    <span class="nw-amount">${fmtShort(nw.total_assets)}</span>
  </div>`;
  if (Object.keys(nw.liabilities).length) {
    html += '<div class="nw-section-head" style="margin-top:8px">Liabilities</div>';
    for (const [k, v] of Object.entries(nw.liabilities)) {
      if (v) html += `<div class="nw-row">
        <span class="nw-label">${k}</span>
        <span class="nw-amount" style="color:#991b1b">${fmtShort(v)}</span>
      </div>`;
    }
  }
  html += `<div class="nw-row" style="font-weight:700;border-top:2px solid #083D4C;margin-top:4px">
    <span>Net Worth</span>
    <span class="nw-amount" style="color:#083D4C;font-size:16px">${fmtShort(nw.net_worth)}</span>
  </div>`;
  document.getElementById('nw-breakdown').innerHTML = html;

  // YTD Summary
  const incTotal = nw.ytd_income.Total || 0;
  const expTotal = Math.abs(nw.ytd_expenses.Total || 0);
  const pnl      = nw.ytd_pnl || 0;
  const pnlGood  = pnl >= 0;
  let ytdHtml = `
    <div class="ytd-row">
      <span class="ytd-label">Total Income (YTD)</span>
      <span class="ytd-val positive">${fmtShort(incTotal)}</span>
    </div>
    <div class="ytd-row">
      <span class="ytd-label">Total Expenses (YTD)</span>
      <span class="ytd-val negative">${fmtShort(expTotal)}</span>
    </div>`;
  // Income line items
  for (const [k, v] of Object.entries(nw.ytd_income)) {
    if (k === 'Total' || !v) continue;
    ytdHtml += `<div class="ytd-row" style="padding-left:12px">
      <span class="ytd-label" style="font-size:13px;color:var(--muted)">${k}</span>
      <span class="ytd-val" style="font-size:13px;color:#166534">${fmtShort(v)}</span>
    </div>`;
  }
  ytdHtml += `<div class="ytd-row">
    <span class="ytd-label">Net P&amp;L (YTD)</span>
    <span class="ytd-val" style="color:${pnlGood?'#166534':'#991b1b'}">${pnl >= 0 ? '+' : ''}${fmtShort(pnl)}</span>
  </div>`;
  document.getElementById('ytd-summary').innerHTML = ytdHtml;

  // YTD Waterfall
  const inc = nw.ytd_income;
  const exp = nw.ytd_expenses;
  const reTotal = (inc['RE Rahba Hill']||0) + (inc['RE Other Oman']||0) + (inc['UAE RE']||0) + (inc['UK RE']||0);
  const wfItems = [
    { label: 'RE',        val:  reTotal,                      type: 'inc' },
    { label: 'WeMeet',    val:  inc['WeMeet']||0,             type: 'inc' },
    { label: 'Salary',    val:  inc['Salary']||0,             type: 'inc' },
    { label: 'Household', val: -(exp['Household']||0),        type: 'exp' },
    { label: 'Education', val: -(exp['Education']||0),        type: 'exp' },
    { label: 'Travel',    val: -(exp['Travel']||0),           type: 'exp' },
    { label: 'Personal',  val: -(exp['Personal & Other']||0), type: 'exp' },
    { label: 'Charity',   val: -(exp['Charity']||0),          type: 'exp' },
  ].filter(x => x.val !== 0);

  let running = 0;
  const wfData = [], wfColors = [];
  wfItems.forEach(item => {
    const start = running;
    running += item.val;
    wfData.push([Math.min(start, running), Math.max(start, running)]);
    wfColors.push(item.type === 'inc' ? '#2B9D92CC' : '#ef4444CC');
  });
  const netVal = nw.ytd_pnl || 0;
  wfData.push([Math.min(0, netVal), Math.max(0, netVal)]);
  wfColors.push(netVal >= 0 ? '#083D4CCC' : '#F59E0BCC');
  const wfLabels = [...wfItems.map(i => i.label), 'Net P&L'];

  new Chart(document.getElementById('chart-waterfall'), {
    type: 'bar',
    data: {
      labels: wfLabels,
      datasets: [{ data: wfData, backgroundColor: wfColors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => {
          const [lo, hi] = ctx.raw;
          const v = hi - lo;
          return (v >= 0 ? '+' : '') + fmtShort(v);
        }}}
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 35 } },
        y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => fmtShort(v) } }
      }
    }
  });
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
