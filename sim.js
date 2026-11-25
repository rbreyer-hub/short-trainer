/* Simulator engine: synthetic small-cap intraday sessions with LULD halts, SSR, locates */
window.SimEngine = (() => {
  const BARS = 120; // 9:30 – 11:30, 1-minute bars
  let rng = Math.random;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = () => rng();
  const between = (a, b) => a + rand() * (b - a);
  const ri = (a, b) => Math.floor(between(a, b + 1));
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  function randn() {
    let u = 0, v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const tick = p => (p >= 1 ? Math.round(p * 100) / 100 : Math.round(p * 10000) / 10000);

  function luldBand(ref, barIdx, tier1) {
    let pct;
    if (ref > 3) pct = tier1 ? 0.05 : 0.10;
    else if (ref >= 0.75) pct = 0.20;
    else pct = Math.min(0.75, 0.15 / ref);
    if (barIdx < 15) pct *= 2; // doubled 9:30–9:45
    return pct;
  }

  const FLUFF = [
    'announces strategic partnership to explore AI-driven solutions',
    'issues letter to shareholders highlighting growth roadmap',
    'signs non-binding MOU with undisclosed partner',
    'announces entry into digital asset treasury strategy',
    'receives notice of allowance for new patent',
    'to present at upcoming investor conference',
    'no news — sympathy move with sector runner'
  ];
  const STRONG = [
    'receives FDA Breakthrough Therapy designation',
    'reports positive topline Phase 2 data, primary endpoint met',
    'wins $40M government contract (2x market cap)',
    'enters definitive merger agreement'
  ];

  const SCENARIOS = {
    pump_fade: {
      name: 'Pump & Fade', weight: 34,
      lesson: 'The classic backside fade. The best entries came after the stock lost VWAP and then failed on a bounce back into it.',
      build() {
        return {
          gap: between(0.4, 1.1), dayType: 'Day 1 runner',
          catalyst: pick(FLUFF), float: between(4, 25), si: between(2, 12),
          s3: rand() < 0.75, warrants: rand() < 0.5,
          borrow: rand() < 0.25 ? 'etb' : 'htb', locate: between(0.01, 0.06),
          phases: [
            { n: ri(4, 14), drift: between(0.008, 0.022), vol: 0.024 },
            { n: ri(3, 8), drift: 0, vol: 0.028 },
            { n: 999, drift: -between(0.003, 0.006), vol: 0.016, revert: 0.012 }
          ]
        };
      }
    },
    squeeze: {
      name: 'Short Squeeze', weight: 20,
      lesson: 'Low float, crowded short, a real-sounding catalyst, and it kept holding above VWAP. The early dip trapped shorts and the breakout over HOD squeezed them. Right move: stay flat, or take a small loss fast.',
      build() {
        return {
          gap: between(0.3, 0.9), dayType: 'Day 1 runner',
          catalyst: rand() < 0.7 ? pick(STRONG) : pick(FLUFF), float: between(0.8, 4), si: between(18, 45),
          s3: rand() < 0.2, warrants: rand() < 0.2,
          borrow: rand() < 0.15 ? 'none' : 'htb', locate: between(0.06, 0.2),
          phases: [
            { n: ri(8, 18), drift: -0.006, vol: 0.02 },
            { n: ri(5, 10), drift: 0.002, vol: 0.014 },
            { n: ri(15, 28), drift: between(0.01, 0.018), vol: 0.028 },
            { n: 999, drift: 0.001, vol: 0.02, revert: 0.004 }
          ]
        };
      }
    },
    frd: {
      name: 'First Red Day', weight: 20,
      lesson: 'Multi-day runner that could not make a new high. Once it lost the opening range and VWAP, every bounce was a short. FRDs often trend down all morning.',
      build() {
        return {
          gap: between(-0.04, 0.12), dayType: 'Day 2 — ran ' + ri(120, 300) + '% yesterday',
          catalyst: 'continuation after yesterday\'s run on ' + pick(FLUFF), float: between(6, 30), si: between(5, 15),
          s3: rand() < 0.8, warrants: rand() < 0.6,
          borrow: rand() < 0.3 ? 'etb' : 'htb', locate: between(0.01, 0.04),
          prevRun: true,
          phases: [
            { n: ri(3, 10), drift: 0.007, vol: 0.02 },
            { n: 999, drift: -0.004, vol: 0.014, revert: 0.01 }
          ]
        };
      }
    },
    chop: {
      name: 'VWAP Chop', weight: 14,
      lesson: 'No trend: the stock kept crossing VWAP. Shorts here mostly paid commissions and locates. When nothing lines up, the best trade is no trade.',
      build() {
        return {
          gap: between(0.25, 0.6), dayType: 'Day 1 runner',
          catalyst: pick(FLUFF), float: between(10, 40), si: between(3, 10),
          s3: rand() < 0.5, warrants: rand() < 0.4,
          borrow: rand() < 0.5 ? 'etb' : 'htb', locate: between(0.01, 0.03),
          phases: [{ n: 999, drift: 0, vol: 0.014, revert: 0.18 }]
        };
      }
    },
    offering: {
      name: 'Offering Dump', weight: 12,
      lesson: 'The company used the spike to sell stock, announcing a discounted registered direct offering. The S-3 shelf and warrants in the filings hinted at this.',
      build() {
        return {
          gap: between(0.5, 1.3), dayType: 'Day 1 runner',
          catalyst: pick(FLUFF), float: between(3, 15), si: between(3, 10),
          s3: true, warrants: rand() < 0.7,
          borrow: rand() < 0.2 ? 'etb' : 'htb', locate: between(0.02, 0.07),
          phases: [
            { n: ri(5, 14), drift: between(0.008, 0.016), vol: 0.024 },
            { n: ri(8, 20), drift: 0, vol: 0.02 },
            { n: 1, jump: -between(0.22, 0.38), vol: 0.01, news: 'offering' },
            { n: 999, drift: -0.0008, vol: 0.013, revert: 0.05 }
          ]
        };
      }
    }
  };

  /* ---- Large-cap, liquid names ---- */
  const DOWNGRADES = [
    'downgraded to Underperform at major bank, price target cut 20%',
    'downgraded to Sell on slowing demand checks',
    'cut to Neutral; analyst cites inventory build and pricing pressure'
  ];
  const SECTORS = ['Semiconductors', 'Software', 'Retail', 'Consumer Discretionary', 'Healthcare', 'Industrials', 'Communication Services'];
  const LARGE = {
    earnings_drop: {
      name: 'Earnings Gap-Down Continuation', weight: 28,
      lesson: 'A big-cap earnings miss with weak guidance. The opening bounce failed under VWAP, then the stock broke the opening-range low and trended down. Funds sell guide-downs over hours, so every VWAP retest was a chance to short.',
      build() {
        return {
          gap: -between(0.04, 0.10), dayType: 'Earnings reaction (reported last night)',
          catalyst: pick(['Q3 revenue misses, cuts full-year guidance', 'EPS beat but guides next quarter well below consensus', 'reports gross-margin compression; CFO to step down']),
          mkt: { gap: between(-0.003, 0.003), drift: between(-0.0001, 0.00015), vol: 0.0005 }, beta: 1.1,
          phases: [
            { n: ri(5, 15), drift: 0.0012, vol: 0.004 },
            { n: 999, drift: -between(0.0005, 0.001), vol: 0.0028, revert: 0.004 }
          ]
        };
      }
    },
    gap_fill: {
      name: 'Gap-Up Fade (Gap Fill)', weight: 22,
      lesson: 'It gapped up on a modest upgrade while the market was flat. It couldn\'t hold the opening range and drifted back toward yesterday\'s close. A common large-cap fade: short failed pops toward VWAP and target the prior close.',
      build() {
        return {
          gap: between(0.02, 0.05), dayType: 'Gap up, no earnings',
          catalyst: pick(['upgraded to Buy at mid-tier broker, price target raised', 'mentioned positively at industry conference', 'sympathy gap after a peer beat earnings']),
          mkt: { gap: between(-0.002, 0.003), drift: -0.00005, vol: 0.0005 }, beta: 1,
          phases: [
            { n: ri(3, 10), drift: 0.0008, vol: 0.003 },
            { n: 999, drift: -between(0.0003, 0.0006), vol: 0.0022, revert: 0.003 }
          ]
        };
      }
    },
    rel_weak: {
      name: 'Relative Weakness', weight: 20,
      lesson: 'SPY was green, but this stock kept making lower highs below VWAP. When a stock can\'t rally while the market does, sellers are in control. This is one of the cleanest large-cap short setups.',
      build() {
        return {
          gap: between(-0.02, 0.005), dayType: 'Normal session',
          catalyst: pick(DOWNGRADES.concat(['sector peer warns on demand', 'report says key customer is moving orders to a competitor'])),
          mkt: { gap: between(0, 0.004), drift: between(0.00004, 0.0001), vol: 0.0004 }, beta: 0.9,
          phases: [{ n: 999, drift: -between(0.0004, 0.0008), vol: 0.0022, revert: 0.004 }]
        };
      }
    },
    market_squeeze: {
      name: 'Market Rip (Short Trap)', weight: 16,
      lesson: 'The stock gapped down on a downgrade, but the whole market ripped after a macro headline and the stock reclaimed VWAP along with SPY. Large caps move with the market. A short against a strong tape needs a tight stop, or no trade at all.',
      build() {
        return {
          gap: -between(0.02, 0.04), dayType: 'Gap down, no earnings',
          catalyst: pick(DOWNGRADES),
          mkt: { gap: -between(0.002, 0.006), drift: -0.0001, vol: 0.0005, flipAt: ri(15, 35), drift2: between(0.00018, 0.0003),
                 news: 'MACRO: CPI comes in cooler than expected. Index futures rip.' }, beta: 1.3,
          phases: [{ n: 999, drift: 0.0001, vol: 0.0025, revert: 0.002 }]
        };
      }
    },
    chop_large: {
      name: 'Range Day', weight: 14,
      lesson: 'No catalyst and a flat market. The stock just rotated around VWAP. Large caps spend most days like this. Without a reason or relative weakness, there is no edge.',
      build() {
        return {
          gap: between(-0.012, 0.012), dayType: 'Normal session', catalyst: 'no company-specific news',
          mkt: { gap: between(-0.002, 0.002), drift: 0, vol: 0.0004 }, beta: 1,
          phases: [{ n: 999, drift: 0, vol: 0.0022, revert: 0.06 }]
        };
      }
    }
  };

  function pickScenario(SET) {
    const keys = Object.keys(SET);
    const total = keys.reduce((s, k) => s + SET[k].weight, 0);
    let r = rand() * total;
    for (const k of keys) { r -= SET[k].weight; if (r <= 0) return k; }
    return keys[0];
  }

  function symbol() {
    const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let s = '';
    const n = arguments[0] ? ri(2, 4) : (rand() < 0.7 ? 4 : 3);
    for (let i = 0; i < n; i++) s += L[Math.floor(rand() * 26)];
    return s;
  }

  function generate(seed, universe = 'small') {
    seed = seed ?? Math.floor(Math.random() * 2 ** 31);
    rng = mulberry32(seed);
    const large = universe === 'large';
    const SET = large ? LARGE : SCENARIOS;
    const key = pickScenario(SET);
    const cfg = SET[key].build();
    const prevClose = tick(large ? between(40, 400) : between(0.9, 6));
    const sym = symbol(large);
    let price = prevClose * (1 + cfg.gap);
    let floatM, baseVol, advM = null, mcapB = null, sector = null;
    if (large) {
      floatM = Math.round(between(300, 4000));
      advM = Math.round(between(4, 40) * 10) / 10;
      mcapB = Math.round(floatM * prevClose / 1000);
      sector = pick(SECTORS);
      const rvol = Math.abs(cfg.gap) > 0.03 ? between(2, 4) : between(0.8, 1.6);
      baseVol = advM * 1e6 / 390 * rvol;
      Object.assign(cfg, { si: between(1, 5), borrow: 'etb', locate: 0, s3: false, warrants: false });
    } else {
      floatM = Math.round(cfg.float * 10) / 10;
      baseVol = floatM * 1e6 * between(0.0015, 0.004);
    }
    // simulated broad market (SPY), as % change vs prior close
    const mk = cfg.mkt || { gap: between(-0.005, 0.005), drift: 0, vol: 0.0005 };
    const beta = cfg.beta || 0;
    let mkt = mk.gap;
    const spyBase = Math.round(between(560, 680) * 100) / 100;

    const bars = [];
    const news = [];
    let pi = 0, left = cfg.phases[0].n;
    let haltLeft = 0, pendingGap = 0;
    let cumPV = 0, cumV = 0, hod = 0, lod = Infinity;

    for (let i = 0; i < BARS; i++) {
      if (haltLeft > 0) {
        bars.push({ t: i, halt: true, mkt });
        haltLeft--;
        continue;
      }
      const ph = cfg.phases[pi];
      const mret = (mk.flipAt != null && i >= mk.flipAt ? mk.drift2 : mk.drift) + mk.vol * randn();
      if (i > 0) mkt += mret;
      if (mk.flipAt === i) news.push({ bar: i, text: mk.news });
      let o = Math.max(0.05, price * (1 + pendingGap + (i === 0 ? 0 : randn() * (large ? ph.vol * 0.1 : 0.002))));
      pendingGap = 0;
      let r;
      const vwapNow = cumV ? cumPV / cumV : o;
      if (ph.jump) {
        r = ph.jump;
        o = price;
      } else {
        const openBoost = i < 10 ? 1.35 : 1;
        r = ph.drift + ph.vol * randn() * openBoost + (i > 0 ? beta * mret : 0);
        if (ph.revert) r += ph.revert * (vwapNow - o) / o;
      }
      let c = Math.max(0.05, o * (1 + r));
      const wick = ph.vol * 0.55;
      let h = Math.max(o, c) * (1 + Math.abs(randn()) * wick);
      let l = Math.min(o, c) * (1 - Math.abs(randn()) * wick);
      if (ph.jump) { h = o * 1.01; l = c * 0.97; }

      // LULD check against 5-bar reference
      let halt = false;
      if (!ph.jump) {
        const recent = bars.filter(b => !b.halt).slice(-5);
        const ref = recent.length ? recent.reduce((s, b) => s + b.c, 0) / recent.length : o;
        const band = luldBand(ref, i, large);
        const up = ref * (1 + band), dn = ref * (1 - band);
        if (c > up) {
          pendingGap = (c / up - 1) * between(0.8, 2.2) + between(0, 0.06);
          c = up; h = Math.max(h, up); h = Math.min(h, up); halt = 'up';
        } else if (c < dn) {
          pendingGap = (c / dn - 1) * between(0.8, 1.8);
          c = dn; l = dn; halt = 'down';
        } else {
          h = Math.min(h, up); l = Math.max(l, dn);
        }
      }

      o = tick(o); c = tick(c); h = tick(Math.max(h, o, c)); l = tick(Math.max(0.01, Math.min(l, o, c)));
      const timeDecay = 0.35 + 1.6 * Math.exp(-i / 18);
      const v = Math.round(baseVol * timeDecay * (1 + 25 * Math.abs(c / o - 1)) * between(0.6, 1.4) * (ph.jump ? 6 : 1) / 100) * 100;
      cumPV += ((h + l + c) / 3) * v; cumV += v;
      hod = Math.max(hod, h); lod = Math.min(lod, l);
      bars.push({ t: i, o, h, l, c, v, vwap: cumPV / cumV, hod, lod, halt: false, haltNext: halt, mkt });

      if (ph.news === 'offering') {
        const amt = ri(4, 15);
        news.push({ bar: i, text: `${sym} announces $${amt}M registered direct offering priced at $${tick(c * 1.02).toFixed(2)}, plus warrants` });
      }
      if (halt) {
        haltLeft = 5;
        news.push({ bar: i, text: `LULD halt (${halt === 'up' ? 'limit up' : 'limit down'}) — 5-minute trading pause`, halt: true });
      }
      price = c;
      left--;
      if (left <= 0 && pi < cfg.phases.length - 1) { pi++; left = cfg.phases[pi].n; }
    }

    return {
      seed, universe, key, scenario: SET[key].name, lesson: SET[key].lesson,
      advM, mcapB, sector, beta, spyBase,
      sym, prevClose, floatM, si: Math.round(cfg.si), dayType: cfg.dayType,
      catalyst: cfg.catalyst, s3: cfg.s3, warrants: cfg.warrants,
      borrow: cfg.borrow, locateFee: Math.round(cfg.locate * 100) / 100 || 0.01,
      ssrPrice: tick(prevClose * 0.9),
      pmHigh: tick(bars[0].o * (1 + (large ? between(0.002, 0.012) : between(0.02, 0.15)))),
      bars, news
    };
  }

  return { generate, BARS, tick, luldBand };
})();
