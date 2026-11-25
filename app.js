/* Short Side Trainer — UI */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const fmt$ = (n, d = 2) => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtP = p => p == null || isNaN(p) ? '—' : (p >= 1 ? p.toFixed(2) : p.toFixed(4));
const signCls = n => n > 0 ? 'pos' : n < 0 ? 'neg' : '';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = id => parseFloat($('#' + id).value);

/* ---------------- Tabs ---------------- */
function showTab(name) {
  $$('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + name));
  $$('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  store.set('ss_tab', name);
  if (name === 'sim') requestAnimationFrame(drawChart);
  if (name === 'journal') renderJournal();
}
$('#tabs').addEventListener('click', e => { if (e.target.dataset.tab) showTab(e.target.dataset.tab); });

/* ---------------- Modal ---------------- */
function openModal(html) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; }
$('#modalClose').onclick = () => { $('#modal').hidden = true; };
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').hidden = true; });

/* ---------------- Learn ---------------- */
let learnState = store.get('ss_learn', { read: [], current: 'basics', quizBest: null });
function renderLessonList() {
  const list = $('#lessonList');
  list.innerHTML = LESSONS.map((l, i) => `<li data-id="${l.id}" class="${learnState.current === l.id ? 'active' : ''}">
    <span class="check">${learnState.read.includes(l.id) ? '✓' : (i + 1)}</span>${esc(l.title)}</li>`).join('') +
    `<li data-id="quiz" class="${learnState.current === 'quiz' ? 'active' : ''}"><span class="check">${learnState.quizBest != null ? '✓' : '?'}</span>Quiz${learnState.quizBest != null ? ` (best ${learnState.quizBest}/${QUIZ.length})` : ''}</li>`;
  const pct = Math.round(learnState.read.length / LESSONS.length * 100);
  $('#learnProgress').style.width = pct + '%';
  $('#learnProgressLabel').textContent = `${learnState.read.length} of ${LESSONS.length} lessons complete`;
}
function showLesson(id) {
  learnState.current = id;
  store.set('ss_learn', learnState);
  if (id === 'quiz') { renderQuiz(); renderLessonList(); return; }
  const idx = LESSONS.findIndex(l => l.id === id);
  const l = LESSONS[idx];
  const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  $('#lessonBody').innerHTML = l.body + `<div class="lesson-footer">
    ${prev ? `<button class="btn ghost" data-go="${prev.id}">← ${esc(prev.title)}</button>` : '<span></span>'}
    <button class="btn" data-done="${l.id}">${next ? 'Mark complete & next →' : 'Mark complete → Quiz'}</button></div>`;
  renderLessonList();
}
$('#lessonList').addEventListener('click', e => { const li = e.target.closest('li'); if (li) showLesson(li.dataset.id); });
$('#lessonBody').addEventListener('click', e => {
  const go = e.target.dataset.go, done = e.target.dataset.done;
  if (go) showLesson(go);
  if (done) {
    if (!learnState.read.includes(done)) learnState.read.push(done);
    const idx = LESSONS.findIndex(l => l.id === done);
    showLesson(LESSONS[idx + 1] ? LESSONS[idx + 1].id : 'quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
$('#quizBtn').onclick = () => showLesson('quiz');

function renderQuiz() {
  const answers = {};
  const body = $('#lessonBody');
  body.innerHTML = `<h2>Quiz</h2><p class="muted">${QUIZ.length} questions. Click an answer to see the explanation.</p>` +
    QUIZ.map((q, i) => `<div class="quiz-q" data-q="${i}"><b>${i + 1}. ${esc(q.q)}</b>
      <div class="opts">${q.opts.map((o, j) => `<button class="opt" data-q="${i}" data-o="${j}">${esc(o)}</button>`).join('')}</div>
      <div class="explain" hidden></div></div>`).join('') +
    `<div class="callout" id="quizScore">Score: 0 / ${QUIZ.length}</div>`;
  body.onclick = e => {
    const b = e.target.closest('.opt');
    if (!b) return;
    const qi = +b.dataset.q, oi = +b.dataset.o;
    if (answers[qi] != null) return;
    answers[qi] = oi;
    const q = QUIZ[qi], wrap = body.querySelector(`.quiz-q[data-q="${qi}"]`);
    wrap.querySelectorAll('.opt').forEach((x, j) => { if (j === q.a) x.classList.add('right'); else if (j === oi) x.classList.add('wrong'); });
    const ex = wrap.querySelector('.explain'); ex.hidden = false; ex.textContent = (oi === q.a ? '✓ Correct. ' : '✗ ') + q.why;
    const score = Object.entries(answers).filter(([k, v]) => QUIZ[k].a === v).length;
    const done = Object.keys(answers).length === QUIZ.length;
    $('#quizScore').innerHTML = `Score: ${score} / ${QUIZ.length}` + (done ? (score >= Math.ceil(QUIZ.length * 0.8) ? ' — Nice work. Go practice in the Simulator.' : ' — Review the lessons for the ones you missed, then try again.') : '');
    if (done) {
      learnState.quizBest = Math.max(learnState.quizBest ?? 0, score);
      store.set('ss_learn', learnState);
      renderLessonList();
    }
  };
}

/* ---------------- Simulator ---------------- */
const SIM_START_EQUITY = 30000;
const COMMISSION = 1; // per order
const BP_MULT = { small: 2, large: 4 }; // max position value = equity × mult (simplified)
let G, S, timer = null;
let universe = store.get('ss_univ', 'small');
const isLarge = () => G && G.universe === 'large';
let simAccount = store.get('ss_simacct', { equity: SIM_START_EQUITY, rounds: 0 });

function spreadAt(p) { return isLarge() ? 0.01 + Math.round(p * 0.00003 * 100) / 100 : Math.max(0.01, p * 0.003); }

function newSim(seed, uni = universe) {
  stopPlay();
  G = SimEngine.generate(seed, uni);
  S = {
    i: 0, shares: 0, avg: 0, realized: 0, fees: 0, locates: 0, locatedQty: 0,
    stop: null, initRisk: null, firstEntry: null, entries: [], covers: [],
    minUnreal: 0, flags: new Set(), done: false, log: []
  };
  $('#stopInput').value = '';
  $('#orderMsg').textContent = '';
  logLine(`Session start. ${G.sym} opens ${fmtP(G.bars[0].o)} (${pct(G.bars[0].o / G.prevClose - 1)} vs prior close).`);
  renderTicker();
  renderSim();
}
const pct = x => (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%';
const cur = () => G.bars[S.i];
function lastTradeBar(i = S.i) { for (let k = i; k >= 0; k--) if (!G.bars[k].halt) return G.bars[k]; return G.bars[0]; }
function isHalted() { return cur().halt; }
function ssrOn() { return G.bars.slice(0, S.i + 1).some(b => !b.halt && b.l <= G.ssrPrice); }
function clock(i) { const m = 30 + i, h = 9 + Math.floor(m / 60); return `${h}:${String(m % 60).padStart(2, '0')}`; }

function renderTicker() {
  if (isLarge()) {
    $('#tickerCard').innerHTML = `
    <div class="sym">${G.sym}</div>
    <div class="kv"><span>Prior close</span>${fmtP(G.prevClose)}</div>
    <div class="kv"><span>PM high</span>${fmtP(G.pmHigh)}</div>
    <div class="kv"><span>Mkt cap</span>$${G.mcapB.toLocaleString()}B</div>
    <div class="kv"><span>Avg vol</span>${G.advM}M/day</div>
    <div class="kv"><span>Sector</span>${esc(G.sector)}</div>
    <div class="kv"><span>Beta</span>${G.beta.toFixed(1)}</div>
    <div class="kv"><span>Day</span>${esc(G.dayType)}</div>
    <div class="kv"><span>Borrow</span><span class="badge green">ETB</span></div>
    <div class="kv"><span>LULD</span>Tier 1 · 5%</div>
    <div class="kv"><span>SSR price</span>${fmtP(G.ssrPrice)} <span id="ssrBadge"></span></div>
    <div class="headline">📰 ${G.sym} ${esc(G.catalyst)}</div>`;
    return;
  }
  const borrow = G.borrow === 'etb' ? '<span class="badge green">ETB</span>' :
    G.borrow === 'htb' ? `<span class="badge orange">HTB · locate $${G.locateFee.toFixed(2)}/sh</span>` : '<span class="badge red">NO BORROW</span>';
  $('#tickerCard').innerHTML = `
    <div class="sym">${G.sym}</div>
    <div class="kv"><span>Prior close</span>${fmtP(G.prevClose)}</div>
    <div class="kv"><span>PM high</span>${fmtP(G.pmHigh)}</div>
    <div class="kv"><span>Float</span>${G.floatM}M</div>
    <div class="kv"><span>SI</span>${G.si}%</div>
    <div class="kv"><span>Day</span>${esc(G.dayType)}</div>
    <div class="kv"><span>Borrow</span>${borrow}</div>
    <div class="kv"><span>S-3</span>${G.s3 ? '<span class="badge orange">Effective</span>' : '<span class="badge gray">None</span>'}</div>
    <div class="kv"><span>Warrants</span>${G.warrants ? '<span class="badge orange">Yes</span>' : '<span class="badge gray">No</span>'}</div>
    <div class="kv"><span>SSR price</span>${fmtP(G.ssrPrice)} <span id="ssrBadge"></span></div>
    <div class="headline">📰 ${G.sym} ${esc(G.catalyst)}</div>`;
}

function unreal(price) { return S.shares ? (S.avg - price) * S.shares : 0; }
function equityNow() { if (S.done) return simAccount.equity; const b = lastTradeBar(); return simAccount.equity + S.realized - S.fees - S.locates + unreal(b.c); }

function renderSim() {
  const b = lastTradeBar();
  const u = unreal(b.c);
  const net = S.realized - S.fees - S.locates + u;
  const stats = [
    ['Last', fmtP(b.c), ''], ['VWAP', fmtP(b.vwap), b.c < b.vwap ? 'neg' : 'pos'],
    ['HOD', fmtP(b.hod), ''], ['Change', pct(b.c / G.prevClose - 1), ''],
    ['Position', S.shares ? `−${S.shares.toLocaleString()} @ ${fmtP(S.avg)}` : 'Flat', S.shares ? 'neg' : ''],
    ['Unrealized', fmt$(u), signCls(u)],
    ['Net P&L (today)', fmt$(net), signCls(net)], ['Equity', fmt$(equityNow(), 0), ''],
    ['Fees + locates', fmt$(S.fees + S.locates), ''], ['Rounds played', simAccount.rounds, ''],
    ['SPY', `${fmtP(G.spyBase * (1 + b.mkt))} <small>${pct(b.mkt)}</small>`, signCls(b.mkt)],
    ['Rel. strength vs SPY', pct((b.c / G.prevClose - 1) - b.mkt), signCls((b.c / G.prevClose - 1) - b.mkt)]
  ];
  $('#simStats').innerHTML = stats.map(([l, v, c]) => `<div class="s"><div class="l">${l}</div><div class="v ${c}">${v}</div></div>`).join('');
  $('#simClock').textContent = clock(S.i);
  const ssr = ssrOn();
  const sb = $('#ssrBadge'); if (sb) sb.innerHTML = ssr ? '<span class="badge red">SSR ON</span>' : '';
  // locate row
  const lr = $('#locateRow');
  lr.style.display = G.borrow === 'htb' ? 'flex' : 'none';
  $('#locateInfo').textContent = G.borrow === 'htb' ? `Located: ${S.locatedQty.toLocaleString()} sh (paid ${fmt$(S.locates)})` : '';
  // banners
  const banners = [];
  if (isHalted()) banners.push('<div class="b halt">⏸ HALTED: LULD trading pause</div>');
  const n = G.news.filter(x => !x.halt && x.bar <= S.i && x.bar >= S.i - 6);
  n.forEach(x => banners.push(`<div class="b news">📰 ${esc(x.text)}</div>`));
  $('#chartBanner').innerHTML = banners.join('');
  const dis = S.done || isHalted();
  ['#shortBtn', '#coverBtn', '#coverHalfBtn', '#locateBtn'].forEach(s => $(s).disabled = dis);
  $('#playBtn').disabled = S.done; $('#stepBtn').disabled = S.done;
  drawChart();
}

function logLine(text) {
  S.log.unshift(`${clock(S.i)}  ${text}`);
  $('#simLog').innerHTML = S.log.slice(0, 80).map(l => `<li>${esc(l)}</li>`).join('');
}
function msg(text, kind = 'err') { const m = $('#orderMsg'); m.textContent = text; m.className = 'msg ' + kind; }

function readStop() {
  const v = parseFloat($('#stopInput').value);
  return isNaN(v) ? null : v;
}

function doLocate() {
  const qty = parseInt($('#qtyInput').value, 10);
  if (!(qty > 0)) return msg('Enter a share quantity.');
  const cost = qty * G.locateFee;
  S.locates += cost; S.locatedQty += qty;
  logLine(`LOCATE ${qty} sh @ $${G.locateFee.toFixed(2)} = ${fmt$(cost)} (non-refundable)`);
  msg(`Located ${qty} shares for ${fmt$(cost)}.`, 'ok');
  renderSim();
}

function doShort() {
  if (S.done || isHalted()) return;
  const qty = parseInt($('#qtyInput').value, 10);
  if (!(qty > 0)) return msg('Enter a share quantity.');
  const b = cur();
  if (G.borrow === 'none') return msg('No shares available to borrow. You cannot short this stock.');
  if (G.borrow === 'htb' && S.shares + qty > S.locatedQty) return msg(`Need a locate: you have ${S.locatedQty - S.shares} located shares free. Click "Locate shares".`);
  const maxVal = equityNow() * BP_MULT[G.universe];
  if ((S.shares + qty) * b.c > maxVal) return msg(`Exceeds buying power (max position ≈ ${fmt$(maxVal, 0)}).`);
  const ssr = ssrOn();
  const sp = spreadAt(b.c);
  let fill;
  if (ssr) {
    if (b.c <= b.o) return msg('SSR is on: you can\'t hit the bid. Wait for an uptick (a green bar) and offer into it.');
    fill = SimEngine.tick(b.c + sp / 2);
  } else fill = SimEngine.tick(b.c - sp / 2);

  // coaching flags
  const prev5 = lastTradeBar(Math.max(0, S.i - 5));
  if (b.c > b.vwap && b.c > prev5.c * (isLarge() ? 1.01 : 1.04)) S.flags.add('frontside');
  if (isLarge() && b.mkt - lastTradeBar(Math.max(0, S.i - 10)).mkt > 0.002 && b.c > b.vwap) S.flags.add('againstTape');
  if (S.shares && unreal(b.c) < 0) S.flags.add('addLoser');
  const newHaltUp = G.news.some(x => x.halt && x.bar >= S.i - 3 && x.bar <= S.i && /up/.test(x.text));
  if (newHaltUp) S.flags.add('shortHaltUp');

  const stop = readStop();
  if (!S.shares) {
    S.firstEntry = { i: S.i, price: fill };
    S.stop = stop;
    if (stop && stop > fill) S.initRisk = (stop - fill) * qty;
    else { S.initRisk = null; S.flags.add('noStop'); if (stop) logLine('Stop is below entry: for a short, the stop goes ABOVE.'); }
  } else if (S.initRisk != null && S.stop) {
    S.initRisk = Math.max(S.initRisk, (S.stop - ((S.avg * S.shares + fill * qty) / (S.shares + qty))) * (S.shares + qty));
  }
  S.avg = (S.avg * S.shares + fill * qty) / (S.shares + qty);
  S.shares += qty;
  S.fees += COMMISSION;
  S.entries.push({ i: S.i, price: fill, qty });
  logLine(`SHORT ${qty} @ ${fmtP(fill)}${ssr ? ' (SSR, filled on uptick)' : ''}`);
  msg(`Shorted ${qty} @ ${fmtP(fill)}${S.stop ? '' : ' — no stop set!'}`, S.stop ? 'ok' : 'err');
  renderSim();
}

function doCover(qty, reason, priceOverride) {
  if (!S.shares) return msg('No position to cover.');
  qty = Math.min(qty ?? S.shares, S.shares);
  const b = lastTradeBar();
  const fill = priceOverride ?? SimEngine.tick(b.c + spreadAt(b.c) / 2);
  const pnl = (S.avg - fill) * qty;
  S.realized += pnl;
  S.fees += COMMISSION;
  S.shares -= qty;
  S.covers.push({ i: S.i, price: fill, qty });
  logLine(`${reason || 'COVER'} ${qty} @ ${fmtP(fill)}  (${pnl >= 0 ? '+' : ''}${fmt$(pnl)})`);
  if (!S.shares) {
    S.avg = 0;
    if (!reason) msg(`Covered. Realized ${fmt$(pnl)}.`, pnl >= 0 ? 'ok' : 'err');
    S.lastClosed = S.i;
  }
  renderSim();
}

function setStopFromInput() {
  const v = readStop();
  if (S.shares && S.stop && v && v > S.stop) { S.flags.add('widened'); logLine(`Stop moved UP ${fmtP(S.stop)} → ${fmtP(v)} (widened)`); }
  else if (S.shares && v !== S.stop) logLine(v ? `Stop set ${fmtP(v)}` : 'Stop removed');
  if (S.shares && !v) S.flags.add('noStop');
  S.stop = v;
  drawChart();
}
$('#stopInput').addEventListener('change', setStopFromInput);

function step() {
  if (S.done) return;
  if (S.i >= G.bars.length - 1) return endSession();
  S.i++;
  const b = cur();
  if (!b.halt) {
    // stop check
    if (S.shares && S.stop && b.h >= S.stop) {
      const gapped = b.o > S.stop;
      const fill = SimEngine.tick(Math.max(S.stop, b.o) + spreadAt(b.c) / 2);
      if (gapped) S.flags.add('gapped');
      doCover(S.shares, gapped ? 'STOP (GAPPED through)' : 'STOP hit', fill);
      msg(gapped ? `Stop gapped: opened at ${fmtP(b.o)}, above your ${fmtP(S.stop)} stop.` : `Stopped out at ${fmtP(fill)}.`, 'err');
    }
    const u = unreal(b.h);
    if (S.shares) S.minUnreal = Math.min(S.minUnreal, u);
  }
  const hn = G.news.filter(x => x.bar === S.i);
  hn.forEach(x => logLine(x.halt ? '⏸ ' + x.text : '📰 ' + x.text));
  if (G.bars[S.i - 1]?.halt && !b.halt) logLine(`▶ Resumed at ${fmtP(b.o)}`);
  if (S.i >= G.bars.length - 1) { renderSim(); return endSession(); }
  renderSim();
}

function play() {
  if (timer) return stopPlay();
  $('#playBtn').textContent = '⏸ Pause';
  const tickFn = () => { step(); if (S.done) stopPlay(); else timer = setTimeout(tickFn, +$('#speedSel').value); };
  timer = setTimeout(tickFn, +$('#speedSel').value);
}
function stopPlay() { clearTimeout(timer); timer = null; $('#playBtn').textContent = '▶ Play'; }

function endSession() {
  stopPlay();
  if (S.done) return;
  if (S.shares) doCover(S.shares, 'EOD auto-cover');
  S.done = true;
  const net = S.realized - S.fees - S.locates;
  const traded = S.entries.length > 0;
  const R = traded && S.initRisk ? (S.realized - S.fees - S.locates) / S.initRisk : null;
  simAccount.equity += net;
  simAccount.rounds++;
  store.set('ss_simacct', simAccount);

  const coach = [];
  if (S.flags.has('frontside')) coach.push(`You shorted on the <b>front side</b>: price was above VWAP and up ${isLarge() ? '1' : '4'}%+ in 5 minutes. Wait for the stock to lose VWAP or fail at a lower high.`);
  if (S.flags.has('againstTape')) coach.push('You shorted a stock holding above VWAP <b>while SPY was rallying</b>. In large caps, short names that are weaker than the market, not ones moving up with it.');
  if (S.flags.has('noStop')) coach.push('You entered with <b>no stop</b>. In a real small cap, one halt-up can erase weeks of gains.');
  if (S.flags.has('widened')) coach.push('You <b>moved your stop higher</b>. That turns a planned loss into an unplanned one.');
  if (S.flags.has('addLoser')) coach.push('You <b>added to a losing short</b>. Only add if it was planned and stays inside your original max risk.');
  if (S.flags.has('gapped')) coach.push('Your stop was <b>gapped through</b> after a halt or gap. This is why you size for a halt, not just for your stop.');
  if (S.flags.has('shortHaltUp')) coach.push('You shorted right after a <b>halt up</b>. Momentum is strongest there.');
  if (traded && !coach.length) coach.push('Clean execution: stop set, no front-side entries, no averaging up. 👍');
  if (!traded) coach.push(['squeeze', 'chop', 'market_squeeze', 'chop_large'].includes(G.key) ? 'You stayed flat. On this chart that was the right call.' : 'You stayed flat. Replay a few more to practice spotting the moment VWAP is lost.');

  const ddRisk = S.minUnreal;
  openModal(`<h2>Session over: ${G.sym}</h2>
    <p>Scenario: <b>${G.scenario}</b></p>
    <div class="callout">${G.lesson}</div>
    <table class="out-table">
      <tr><td>Net P&amp;L (after fees + locates)</td><td class="${signCls(net)}">${fmt$(net)}</td></tr>
      <tr><td>R-multiple</td><td>${R == null ? (traded ? 'n/a (no stop at entry)' : '—') : (R >= 0 ? '+' : '') + R.toFixed(2) + 'R'}</td></tr>
      <tr><td>Fees + locates</td><td>${fmt$(S.fees + S.locates)}</td></tr>
      <tr><td>Worst open drawdown</td><td class="${signCls(ddRisk)}">${fmt$(ddRisk)}</td></tr>
      <tr><td>Sim account equity</td><td>${fmt$(simAccount.equity, 0)}</td></tr>
    </table>
    <h3 style="margin-top:14px">Coach notes</h3><ul>${coach.map(c => `<li>${c}</li>`).join('')}</ul>
    <p class="muted tiny">Seed ${G.seed}. ${traded ? 'Trade saved to your Journal (Sim).' : ''}</p>
    <button class="btn ghost" id="replayBtn">Replay this chart</button>
    <button class="btn ghost" id="nextBtn">Next stock ↻</button>`);
  $('#replayBtn').onclick = () => { $('#modal').hidden = true; replay(G.seed); };
  $('#nextBtn').onclick = () => { $('#modal').hidden = true; newSim(); };

  if (traded) {
    const sh = S.entries.reduce((s, e) => s + e.qty, 0);
    const avgIn = S.entries.reduce((s, e) => s + e.price * e.qty, 0) / sh;
    const avgOut = S.covers.reduce((s, e) => s + e.price * e.qty, 0) / S.covers.reduce((s, e) => s + e.qty, 0);
    addTrade({
      id: Date.now(), date: new Date().toISOString().slice(0, 10), ticker: G.sym,
      setup: 'SIM · ' + G.scenario, entry: +avgIn.toFixed(4), exit: +avgOut.toFixed(4), shares: sh,
      stop: S.firstEntry && S.initRisk ? +(S.initRisk / sh + avgIn).toFixed(4) : null,
      fees: +(S.fees + S.locates).toFixed(2), plan: !S.flags.size || (S.flags.size === 1 && S.flags.has('gapped')),
      notes: [...S.flags].join(', '), source: 'sim'
    });
  }
  renderSim();
}

function replay(seed) { newSim(seed, G.universe); logLine(`Replaying seed ${seed}.`); }

/* chart */
function drawChart() {
  const cv = $('#simChart');
  if (!cv || !G || !cv.offsetParent) return;
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const padR = 62, padT = 10, volH = Math.round(H * 0.17), timeH = 18;
  const priceH = H - volH - timeH - padT - 6;
  const plotW = W - padR - 6;
  const n = G.bars.length;
  const bw = plotW / n;
  const vis = G.bars.slice(0, S.i + 1);
  const tb = vis.filter(b => !b.halt);
  let lo = Math.min(...tb.map(b => b.l)), hi = Math.max(...tb.map(b => b.h));
  [S.stop, S.shares ? S.avg : null].forEach(p => { if (p) { lo = Math.min(lo, p); hi = Math.max(hi, p); } });
  if (G.ssrPrice > lo * 0.9 && G.ssrPrice < hi) lo = Math.min(lo, G.ssrPrice);
  const pad = (hi - lo) * 0.08 || hi * 0.05;
  lo -= pad; hi += pad;
  const y = p => padT + (hi - p) / (hi - lo) * priceH;
  const x = i => 4 + i * bw + bw / 2;
  const css = getComputedStyle(document.documentElement);
  const C = { grid: '#222a34', text: css.getPropertyValue('--muted').trim(), green: '#26a69a', red: '#ef5350', vwap: '#f0a030', blue: '#58a6ff' };

  // grid + labels
  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  for (let k = 0; k <= 5; k++) {
    const p = lo + (hi - lo) * k / 5, yy = y(p);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(plotW + 4, yy); ctx.stroke();
    ctx.fillStyle = C.text; ctx.fillText(fmtP(p), plotW + 10, yy);
  }
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < n; i += 15) { ctx.fillStyle = C.text; ctx.fillText(clock(i), x(i) - 12, H - 4); }

  // halt shading
  vis.forEach(b => { if (b.halt) { ctx.fillStyle = 'rgba(239,83,80,0.10)'; ctx.fillRect(x(b.t) - bw / 2, padT, bw, priceH); } });

  // SSR line
  if (G.ssrPrice > lo && G.ssrPrice < hi) {
    ctx.setLineDash([2, 4]); ctx.strokeStyle = '#a371f7'; ctx.beginPath(); ctx.moveTo(0, y(G.ssrPrice)); ctx.lineTo(plotW, y(G.ssrPrice)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#a371f7'; ctx.fillText('SSR ' + fmtP(G.ssrPrice), 6, y(G.ssrPrice) - 4);
  }
  // HOD
  const last = lastTradeBar();
  ctx.setLineDash([4, 4]); ctx.strokeStyle = '#555f6b'; ctx.beginPath(); ctx.moveTo(0, y(last.hod)); ctx.lineTo(plotW, y(last.hod)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = C.text; ctx.fillText('HOD', 6, y(last.hod) - 4);

  // volume
  const maxV = Math.max(...tb.map(b => b.v), 1);
  const vTop = padT + priceH + 6;
  tb.forEach(b => {
    const hgt = b.v / maxV * (volH - 4);
    ctx.fillStyle = b.c >= b.o ? 'rgba(38,166,154,.45)' : 'rgba(239,83,80,.45)';
    ctx.fillRect(x(b.t) - bw * 0.35, vTop + volH - hgt, Math.max(1, bw * 0.7), hgt);
  });

  // candles
  tb.forEach(b => {
    const up = b.c >= b.o, col = up ? C.green : C.red;
    ctx.strokeStyle = col; ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x(b.t), y(b.h)); ctx.lineTo(x(b.t), y(b.l)); ctx.stroke();
    const top = y(Math.max(b.o, b.c)), bot = y(Math.min(b.o, b.c));
    ctx.fillRect(x(b.t) - bw * 0.35, top, Math.max(1, bw * 0.7), Math.max(1, bot - top));
  });

  // VWAP
  ctx.strokeStyle = C.vwap; ctx.lineWidth = 1.5; ctx.beginPath();
  let started = false;
  tb.forEach(b => { const xx = x(b.t), yy = y(b.vwap); if (!started) { ctx.moveTo(xx, yy); started = true; } else ctx.lineTo(xx, yy); });
  ctx.stroke(); ctx.lineWidth = 1;

  // entries / covers markers
  S.entries.forEach(e => { ctx.fillStyle = C.red; tri(ctx, x(e.i), y(e.price) - 8, 5, true); });
  S.covers.forEach(e => { ctx.fillStyle = C.green; tri(ctx, x(e.i), y(e.price) + 8, 5, false); });

  // position + stop lines
  const lineLabel = (p, col, label, dash) => {
    ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(0, y(p)); ctx.lineTo(plotW, y(p)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = col; ctx.fillRect(plotW + 4, y(p) - 8, padR - 6, 16);
    ctx.fillStyle = '#0d1117'; ctx.textBaseline = 'middle'; ctx.fillText(label, plotW + 7, y(p)); ctx.textBaseline = 'alphabetic';
  };
  if (S.shares) lineLabel(S.avg, C.blue, 'AVG ' + fmtP(S.avg));
  if (S.stop) lineLabel(S.stop, C.red, 'STP ' + fmtP(S.stop), [6, 3]);
  // last price tag
  ctx.fillStyle = last.c >= last.o ? C.green : C.red;
  ctx.fillRect(plotW + 4, y(last.c) - 8, padR - 6, 16);
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(fmtP(last.c), plotW + 8, y(last.c)); ctx.textBaseline = 'alphabetic';
  // legend
  ctx.fillStyle = C.vwap; ctx.fillText('— VWAP', plotW - 60, padT + 12);
}
function tri(ctx, cx, cy, s, down) {
  ctx.beginPath();
  if (down) { ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy - s); ctx.lineTo(cx, cy + s); }
  else { ctx.moveTo(cx - s, cy + s); ctx.lineTo(cx + s, cy + s); ctx.lineTo(cx, cy - s); }
  ctx.fill();
}

$('#playBtn').onclick = play;
$('#stepBtn').onclick = () => { stopPlay(); step(); };
$('#newSimBtn').onclick = () => { if (S && S.shares && !S.done && !confirm('You have an open position. Abandon this session?')) return; newSim(); };
$('#shortBtn').onclick = doShort;
$('#coverBtn').onclick = () => doCover();
$('#coverHalfBtn').onclick = () => doCover(Math.max(1, Math.floor(S.shares / 2)));
$('#locateBtn').onclick = doLocate;
$('#stopHodBtn').onclick = () => { const b = lastTradeBar(); $('#stopInput').value = SimEngine.tick(b.hod * (isLarge() ? 1.002 : 1.01)); setStopFromInput(); };
$('#univSel').value = universe;
$('#univSel').onchange = e => {
  if (S && S.shares && !S.done && !confirm('You have an open position. Abandon this session?')) { e.target.value = G.universe; return; }
  universe = e.target.value; store.set('ss_univ', universe);
  $('#qtyInput').value = universe === 'large' ? 100 : 1000;
  newSim();
};
$('#stopClearBtn').onclick = () => { $('#stopInput').value = ''; setStopFromInput(); };
$('#sizeBtn').onclick = () => {
  const stop = readStop(), b = lastTradeBar();
  if (!stop || stop <= b.c) return msg('Set a stop above the current price first.');
  const riskPerShare = stop - b.c + spreadAt(b.c);
  const lot = isLarge() ? 10 : 100;
  let qty = Math.floor(equityNow() * 0.01 / riskPerShare / lot) * lot;
  if (qty < lot) qty = Math.floor(equityNow() * 0.01 / riskPerShare);
  $('#qtyInput').value = Math.max(1, qty);
  msg(`Sized ${qty} sh: a stop-out at ${fmtP(stop)} risks about ${fmt$(qty * riskPerShare, 0)} (1%).`, 'ok');
};
document.addEventListener('keydown', e => {
  if (!$('#tab-sim').classList.contains('active') || !$('#modal').hidden) return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.code === 'Space') { e.preventDefault(); play(); }
  else if (e.code === 'ArrowRight') { e.preventDefault(); stopPlay(); step(); }
  else if (e.key === 's' || e.key === 'S') doShort();
  else if (e.key === 'c' || e.key === 'C') doCover();
});
window.addEventListener('resize', () => drawChart());

/* ---------------- Calculator ---------------- */
function calc() {
  const eq = num('cEquity'), rp = num('cRiskPct') / 100, en = num('cEntry'), st = num('cStop');
  const loc = num('cLocate') || 0, comm = num('cComm') || 0, pc = num('cPrevClose'), gap = (num('cGap') || 0) / 100;
  const out = $('#calcOut');
  if (!(eq > 0 && en > 0 && st > 0)) { out.innerHTML = '<p class="muted">Enter account, entry and stop.</p>'; return; }
  if (st <= en) { out.innerHTML = '<p class="neg"><b>For a short, the stop must be ABOVE the entry.</b></p>'; return; }
  const riskD = eq * rp, rps = st - en;
  const costPerShare = loc; // locate per share; commission handled per order
  const shares = Math.max(0, Math.floor((riskD - comm * 2) / (rps + costPerShare)));
  const posVal = shares * en;
  const reqUnder5 = en < 5 ? Math.max(2.5 * shares, posVal) : Math.max(5 * shares, posVal * 0.3);
  const lossAtStop = shares * (rps + costPerShare) + comm * 2;
  const gapFill = st * (1 + gap);
  const gapLoss = shares * (gapFill - en + costPerShare) + comm * 2;
  const ssr = pc > 0 ? pc * 0.9 : null;
  const t = k => en - rps * k;
  const be = en - costPerShare - (comm * 2) / Math.max(shares, 1);
  const locPct = loc / en * 100;
  out.innerHTML = `
    <div class="muted">Max shares</div>
    <div class="big-num">${shares.toLocaleString()}</div>
    <table class="out-table">
      <tr><td>Dollar risk (${(rp * 100).toFixed(2)}%)</td><td>${fmt$(riskD)}</td></tr>
      <tr><td>Risk per share</td><td>${fmt$(rps, 4)} (${(rps / en * 100).toFixed(1)}%)</td></tr>
      <tr><td>Position value</td><td>${fmt$(posVal, 0)}</td></tr>
      <tr><td>Est. maintenance margin ${en < 5 ? '(&lt;$5: max $2.50/sh or 100%)' : '(max $5/sh or 30%)'}</td><td>${fmt$(reqUnder5, 0)}</td></tr>
      <tr><td>Locate cost</td><td>${fmt$(shares * loc)} <span class="muted">(${locPct.toFixed(1)}% of price)</span></td></tr>
      <tr><td>Break-even cover price</td><td>${fmtP(be)}</td></tr>
      <tr><td>Loss if stopped at ${fmtP(st)}</td><td class="neg">${fmt$(-lossAtStop)}</td></tr>
      <tr><td><b>Halt stress:</b> reopens ${(gap * 100).toFixed(0)}% over stop (${fmtP(gapFill)})</td><td class="neg">${fmt$(-gapLoss)} <span class="muted">(${(gapLoss / eq * 100).toFixed(1)}% of acct)</span></td></tr>
    </table>
    <h3 style="margin-top:14px">Targets</h3>
    <table class="out-table">
      <tr><td>1R</td><td>${fmtP(t(1))} <span class="muted">+${fmt$(shares * rps, 0)}</span></td></tr>
      <tr><td>2R</td><td>${fmtP(t(2))} <span class="muted">+${fmt$(shares * rps * 2, 0)}</span></td></tr>
      <tr><td>3R</td><td>${fmtP(t(3))} <span class="muted">+${fmt$(shares * rps * 3, 0)}</span></td></tr>
      ${ssr ? `<tr><td>SSR trigger (prior close × 0.90)</td><td>${fmtP(ssr)}${en <= ssr ? ' <span class="badge red">SSR likely ON</span>' : ''}</td></tr>` : ''}
    </table>
    ${locPct > 3 ? '<div class="callout red">The locate costs more than 3% of the price. That eats most of a normal fade.</div>' : ''}
    ${gapLoss / eq > 0.05 ? '<div class="callout red">A halt gap would cost more than 5% of your account. Consider cutting size.</div>' : ''}
    ${t(3) <= 0 ? '<div class="callout">Your stop is very wide compared with the price. 3R would be below $0.</div>' : ''}`;
  store.set('ss_calc', ['cEquity', 'cRiskPct', 'cEntry', 'cStop', 'cLocate', 'cComm', 'cPrevClose', 'cGap'].reduce((o, k) => (o[k] = $('#' + k).value, o), {}));
}
const savedCalc = store.get('ss_calc', null);
if (savedCalc) Object.entries(savedCalc).forEach(([k, v]) => { if ($('#' + k)) $('#' + k).value = v; });
$('#calcForm').addEventListener('input', calc);

/* ---------------- Grader ---------------- */
function syncGradeMode() {
  const large = $('#gUni').value === 'large';
  $$('.small-only').forEach(el => el.hidden = large);
  $$('.large-only').forEach(el => el.hidden = !large);
  store.set('ss_gUni', $('#gUni').value);
}
function gradeLarge() {
  let score = 50; const reasons = [], blockers = [];
  const add = (p, t) => { score += p; reasons.push([p, t]); };
  const pa = $('#gPA').value, tm = $('#gTime').value, rvol = num('lRvol');
  ({ guide: () => add(12, 'Earnings miss / guidance cut: funds sell for days'),
     down: () => add(7, 'Analyst downgrade'), sector: () => add(5, 'Negative sector or peer news'),
     none: () => add(-5, 'No catalyst: no reason for sellers to keep selling'),
     fade: () => add(3, 'Gap up on modest news that is fading'),
     good: () => { add(-14, 'Good news that is holding up'); } })[$('#lCat').value]();
  ({ down: () => add(10, 'SPY/QQQ red and trending down'), flat: () => add(0, 'Market flat or choppy'),
     up: () => add(-10, 'Market green and trending up'),
     rip: () => { add(-18, 'Market ripping on macro news'); blockers.push('Don\'t short single names into a broad market rip. Wait for it to stall.'); } })[$('#lMkt').value]();
  ({ much: () => add(12, 'Much weaker than SPY (red while SPY is green)'), some: () => add(5, 'Slightly weaker than SPY'),
     same: () => add(-3, 'Moving in line with SPY: no relative edge'), strong: () => add(-15, 'Stronger than SPY') })[$('#lRS').value]();
  ({ weak: () => add(5, 'Sector ETF weak'), flat: () => add(0, 'Sector ETF neutral'), strong: () => add(-6, 'Sector ETF strong') })[$('#lSector').value]();
  ({ below: () => add(8, 'Below prior-day low / opening-range low'), resist: () => add(5, 'Rejecting resistance (VWAP, prior close, gap fill)'),
     mid: () => add(-2, 'Middle of the range'), breakout: () => add(-12, 'Breaking out above prior-day high') })[$('#lLevel').value]();
  if (!isNaN(rvol)) {
    if (rvol >= 3) add(8, `Relative volume ${rvol}×: heavy participation`);
    else if (rvol >= 1.5) add(4, `Relative volume ${rvol}×`);
    else if (rvol < 1) add(-8, `Relative volume ${rvol}×: nobody cares today`);
  }
  ({ belowvwap: () => add(10, 'Below VWAP, failing to reclaim'), lowerhigh: () => add(8, 'Lower high under HOD'),
     abovevwap: () => add(-12, 'Above VWAP making higher highs'), parabolic: () => add(-6, 'Extended move up: wait for a confirmed top'),
     haltingup: () => { add(-30, 'Halting up'); blockers.push('Never short into halts up.'); } })[pa]();
  ({ pm: () => add(-4, 'Pre-market: thin vs regular hours'), open: () => add(-3, 'First 15 min: let the opening range form'),
     morning: () => add(4, 'Morning session: trend days set up here'), mid: () => add(-2, 'Midday: large caps often chop'),
     late: () => add(2, 'Afternoon: trends often resume into the close') })[tm]();
  const trig = {
    belowvwap: 'Short a failed retest of VWAP or the opening-range low. Stop above the retest high (often 0.3–0.6× ATR). Target prior-day low, then the measured move.',
    lowerhigh: 'Short the break of the pullback low after the lower high. Stop above the lower high.',
    abovevwap: 'No trigger yet. Wait for a break of VWAP while SPY stalls.',
    parabolic: 'Wait for a lower high and a VWAP loss. Large caps rarely reverse on one candle.',
    haltingup: 'Stay flat.'
  }[pa];
  renderGrade(score, reasons, blockers, trig, 'Large-cap heuristic score. Check SPY and the sector ETF before every entry.');
}
function grade() {
  syncGradeMode();
  if ($('#gUni').value === 'large') return gradeLarge();
  const run = num('gRun') || 0, flt = num('gFloat'), si = num('gSI') || 0;
  const day = $('#gDay').value, cat = $('#gCat').value, pa = $('#gPA').value, bor = $('#gBorrow').value, tm = $('#gTime').value;
  let score = 50; const reasons = []; const blockers = [];
  const add = (p, t) => { score += p; reasons.push([p, t]); };

  if (run >= 100) add(8, `Up ${run}%: very extended`);
  else if (run >= 50) add(5, `Up ${run}%: extended`);
  else if (run >= 25) add(0, `Up ${run}%: moderate move`);
  else add(-8, `Only up ${run}%: not much to fade`);

  if (!isNaN(flt)) {
    if (flt < 2) add(-15, `Float ${flt}M: tiny float, extreme squeeze risk`);
    else if (flt < 5) add(-8, `Float ${flt}M: low float, squeeze-prone`);
    else if (flt < 20) add(3, `Float ${flt}M: tradeable supply`);
    else add(6, `Float ${flt}M: plenty of supply to sell into`);
  }
  if (si >= 30) add(-12, `Short interest ${si}%: very crowded`);
  else if (si >= 15) add(-6, `Short interest ${si}%: crowded`);

  ({ d1: () => add(-4, 'Day 1: no failed-high confirmation yet'), frd: () => add(12, 'First red day after a multi-day run'), d2up: () => add(-12, 'Day 2+ still making higher highs (front side)') })[day]();
  ({ none: () => add(10, 'No real news'), fluff: () => add(8, 'Fluff PR'), moderate: () => add(-6, 'Moderate news: some real buyers'),
     strong: () => { add(-25, 'Strong catalyst'); blockers.push('Real catalyst. The move may be justified.'); } })[cat]();
  ({ belowvwap: () => add(12, 'Below VWAP and failing to reclaim'), lowerhigh: () => add(10, 'Lower high under HOD'),
     abovevwap: () => add(-15, 'Above VWAP making higher highs (front side)'), parabolic: () => add(-6, 'Parabolic: wait for a confirmed top'),
     haltingup: () => { add(-30, 'Halting up'); blockers.push('Never short into halts up.'); } })[pa]();
  ({ etb: () => add(4, 'Easy to borrow'), htbcheap: () => add(0, 'Cheap locate'), htbexp: () => add(-8, 'Expensive locate: crowded, eats your edge'),
     none: () => { add(-50, 'No borrow'); blockers.push('No shares to borrow. You cannot short this stock.'); } })[bor]();
  ({ pm: () => add(-6, 'Pre-market: thin liquidity, wide spreads'), open: () => add(-5, 'First 15 min: doubled halt bands, violent'), morning: () => add(4, 'Morning session: best liquidity for fades'), mid: () => add(0, 'Midday: slower, cleaner'), late: () => add(-2, 'Late day: possible squeezes into the close') })[tm]();

  const dil = [['gS3', 7, 'Effective S-3 / ATM: company can sell into strength'], ['gWarrants', 5, 'Warrants or converts in the money'], ['gRecent', 4, 'Has a history of offerings'], ['gCash', 5, 'Needs cash'], ['gRS', 3, 'Recent reverse split']];
  dil.forEach(([id, p, t]) => { if ($('#' + id).checked) add(p, t); });
  if (!dil.some(([id]) => $('#' + id).checked)) add(-6, 'No visible dilution path');

  const trig = {
    belowvwap: 'Short a failed bounce into VWAP (red rejection candle). Stop a few cents above VWAP.',
    lowerhigh: 'Short the break of the pullback low after the lower high. Stop above the lower high.',
    abovevwap: 'No trigger yet. Wait for VWAP to break and a bounce to fail.',
    parabolic: 'Wait for a topping tail, then the first lower high breaking the prior candle\'s low. Small size: the stop is far.',
    haltingup: 'Stay flat.'
  }[pa];

  renderGrade(score, reasons, blockers, trig, 'Heuristic score for practice. It isn\'t a prediction. Size the trade in the Size Calc tab.');
}
function renderGrade(score, reasons, blockers, trig, note) {
  score = Math.max(0, Math.min(100, Math.round(score)));
  let verdict, color;
  if (blockers.length) { verdict = 'DO NOT SHORT'; color = 'var(--red)'; }
  else if (score >= 75) { verdict = 'A setup: wait for your trigger'; color = 'var(--green)'; }
  else if (score >= 60) { verdict = 'B setup: reduced size, needs confirmation'; color = 'var(--yellow)'; }
  else { verdict = 'Pass: edge is not there'; color = 'var(--red)'; }
  reasons.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]));
  const tk = $('#gTicker').value.trim().toUpperCase();
  $('#gradeOut').innerHTML = `
    <div class="score-ring"><div class="score" style="border-color:${color};color:${color}">${blockers.length ? '✕' : score}</div>
      <div><div class="muted">${tk ? esc(tk) + ' · ' : ''}Verdict</div><div style="font-size:1.2rem;font-weight:700;color:${color}">${verdict}</div></div></div>
    ${blockers.map(b => `<div class="callout red">${b}</div>`).join('')}
    ${!blockers.length ? `<div class="callout green"><b>Trigger:</b> ${trig}</div>` : ''}
    <ul class="reasons">${reasons.map(([p, t]) => `<li><span class="pts ${signCls(p)}">${p > 0 ? '+' : ''}${p}</span><span>${t}</span></li>`).join('')}</ul>
    <p class="muted tiny">${note}</p>`;
}
$('#gUni').value = store.get('ss_gUni', 'small');
$('#gradeForm').addEventListener('input', grade);
$('#gradeForm').addEventListener('change', grade);

/* ---------------- Journal ---------------- */
let trades = store.get('ss_trades', []);
function saveTrades() { store.set('ss_trades', trades); }
function addTrade(t) { trades.push(t); saveTrades(); }
const tPnl = t => (t.entry - t.exit) * t.shares - (t.fees || 0);
const tR = t => t.stop && t.stop > t.entry ? tPnl(t) / ((t.stop - t.entry) * t.shares) : null;

function renderJournal() {
  const f = $('#jFilter').value;
  const list = trades.filter(t => f === 'all' || (f === 'sim' ? t.source === 'sim' : t.source !== 'sim'))
    .sort((a, b) => (a.date + a.id).localeCompare(b.date + b.id));
  const pnls = list.map(tPnl), Rs = list.map(tR).filter(r => r != null);
  const wins = pnls.filter(p => p > 0), losses = pnls.filter(p => p <= 0);
  const sum = a => a.reduce((s, x) => s + x, 0);
  const avg = a => a.length ? sum(a) / a.length : 0;
  const pf = sum(losses) ? sum(wins) / -sum(losses) : (wins.length ? Infinity : 0);
  const planRate = list.length ? list.filter(t => t.plan).length / list.length : 0;
  const stats = [
    ['Trades', list.length], ['Net P&L', `<span class="${signCls(sum(pnls))}">${fmt$(sum(pnls))}</span>`],
    ['Win rate', list.length ? (wins.length / list.length * 100).toFixed(0) + '%' : '—'],
    ['Expectancy', Rs.length ? `<span class="${signCls(avg(Rs))}">${avg(Rs) >= 0 ? '+' : ''}${avg(Rs).toFixed(2)}R</span>` : '—'],
    ['Avg win / loss', list.length ? `${wins.length ? fmt$(avg(wins), 0) : '—'} / ${losses.length ? fmt$(avg(losses), 0) : '—'}` : '—'],
    ['Profit factor', list.length ? (pf === Infinity ? '∞' : pf.toFixed(2)) : '—'],
    ['Followed plan', list.length ? (planRate * 100).toFixed(0) + '%' : '—'],
    ['Largest loss', losses.length ? `<span class="neg">${fmt$(Math.min(...losses), 0)}</span>` : '—']
  ];
  $('#jStats').innerHTML = stats.map(([l, v]) => `<div class="s"><div class="l">${l}</div><div class="v">${v}</div></div>`).join('');

  // by setup
  const by = {};
  list.forEach(t => { const k = t.setup; (by[k] ||= []).push(t); });
  const rows = Object.entries(by).map(([k, ts]) => {
    const p = ts.map(tPnl), r = ts.map(tR).filter(x => x != null);
    return `<tr><td>${esc(k)}</td><td>${ts.length}</td><td>${(p.filter(x => x > 0).length / ts.length * 100).toFixed(0)}%</td><td>${r.length ? avg(r).toFixed(2) + 'R' : '—'}</td><td class="${signCls(sum(p))}">${fmt$(sum(p), 0)}</td></tr>`;
  }).join('');
  $('#jBySetup').innerHTML = list.length ? `<table class="mini"><tr><th>Setup</th><th>#</th><th>Win%</th><th>Avg R</th><th>P&amp;L</th></tr>${rows}</table>` : '<p class="muted">No trades yet. Log one, or finish a simulator round.</p>';

  // table (newest first)
  $('#jTable').innerHTML = `<tr><th>Date</th><th>Ticker</th><th>Setup</th><th>Shares</th><th>Entry</th><th>Cover</th><th>Stop</th><th>P&amp;L</th><th>R</th><th>Plan</th><th>Notes</th><th></th></tr>` +
    [...list].reverse().map(t => {
      const p = tPnl(t), r = tR(t);
      return `<tr><td>${esc(t.date)}</td><td><b>${esc(t.ticker)}</b>${t.source === 'sim' ? ' <span class="badge gray">SIM</span>' : ''}</td><td>${esc(t.setup)}</td><td>${t.shares.toLocaleString()}</td>
        <td>${fmtP(t.entry)}</td><td>${fmtP(t.exit)}</td><td>${t.stop ? fmtP(t.stop) : '—'}</td><td class="${signCls(p)}">${fmt$(p)}</td>
        <td>${r == null ? '—' : (r >= 0 ? '+' : '') + r.toFixed(2)}</td><td>${t.plan ? '✓' : '✗'}</td><td class="notes">${esc(t.notes)}</td>
        <td><button class="del" data-del="${t.id}" title="Delete">✕</button></td></tr>`;
    }).join('');

  drawEquity(pnls);
}
function drawEquity(pnls) {
  const cv = $('#equityChart');
  if (!cv.offsetParent) return;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = 160;
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const pts = [0]; pnls.forEach(p => pts.push(pts[pts.length - 1] + p));
  if (pts.length < 2) { ctx.fillStyle = '#8b949e'; ctx.font = '12px system-ui'; ctx.fillText('Equity curve appears after your first trade', 10, H / 2); return; }
  const lo = Math.min(...pts), hi = Math.max(...pts), rng = hi - lo || 1;
  const xx = i => 50 + i / (pts.length - 1) * (W - 60), yy = v => 10 + (hi - v) / rng * (H - 20);
  ctx.strokeStyle = '#2a323d'; ctx.beginPath(); ctx.moveTo(50, yy(0)); ctx.lineTo(W - 10, yy(0)); ctx.stroke();
  ctx.fillStyle = '#8b949e'; ctx.font = '11px system-ui';
  ctx.fillText(fmt$(hi, 0), 2, yy(hi) + 4); ctx.fillText(fmt$(lo, 0), 2, yy(lo));
  ctx.strokeStyle = pts[pts.length - 1] >= 0 ? '#26a69a' : '#ef5350'; ctx.lineWidth = 2; ctx.beginPath();
  pts.forEach((v, i) => i ? ctx.lineTo(xx(i), yy(v)) : ctx.moveTo(xx(i), yy(v)));
  ctx.stroke(); ctx.lineWidth = 1;
}
$('#jFilter').onchange = renderJournal;
$('#jTable').addEventListener('click', e => {
  const id = e.target.dataset.del;
  if (id && confirm('Delete this trade?')) { trades = trades.filter(t => String(t.id) !== id); saveTrades(); renderJournal(); }
});
$('#jForm').addEventListener('submit', e => {
  e.preventDefault();
  const entry = num('jEntry'), exit = num('jExit'), shares = parseInt($('#jShares').value, 10), stop = num('jStop');
  if (!(entry > 0 && exit > 0 && shares > 0)) return;
  addTrade({ id: Date.now(), date: $('#jDate').value, ticker: $('#jTicker').value.trim().toUpperCase(), setup: $('#jSetup').value,
    entry, exit, shares, stop: stop > 0 ? stop : null, fees: num('jFees') || 0, plan: $('#jPlan').checked, notes: $('#jNotes').value.trim(), source: 'live' });
  ['jTicker', 'jEntry', 'jExit', 'jShares', 'jStop', 'jNotes'].forEach(id => $('#' + id).value = '');
  $('#jFees').value = 0;
  renderJournal();
});
$('#jExport').onclick = () => {
  const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'short-journal.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#jImport').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!Array.isArray(data)) throw new Error('not an array');
    const ids = new Set(trades.map(t => String(t.id)));
    const added = data.filter(t => t && t.id && !ids.has(String(t.id)) && t.entry && t.exit && t.shares);
    trades = trades.concat(added); saveTrades(); renderJournal();
    alert(`Imported ${added.length} trades.`);
  } catch (err) { alert('Could not import: ' + err.message); }
  e.target.value = '';
};
window.addEventListener('resize', () => { if ($('#tab-journal').classList.contains('active')) renderJournal(); });

/* ---------------- Init ---------------- */
$('#jDate').value = new Date().toISOString().slice(0, 10);
if (universe === 'large') $('#qtyInput').value = 100;
renderLessonList();
showLesson(learnState.current || 'basics');
calc();
grade();
newSim();
showTab(store.get('ss_tab', 'learn'));
})();
