/* Lesson content + quiz for Short Side Trainer */
window.LESSONS = [
{
  id: 'basics',
  title: 'Shorting 101',
  body: `
<h2>Shorting 101</h2>
<p>When you short, you <b>borrow shares and sell them now</b>, hoping to <b>buy them back cheaper later</b> and return them. You profit when the price falls.</p>
<div class="callout">Short 1,000 shares at $4.00 → you receive $4,000.<br>Cover (buy back) at $3.40 → you pay $3,400.<br><b>Profit = ($4.00 − $3.40) × 1,000 = $600</b>, minus fees and locate cost.</div>
<h3>The risk is lopsided</h3>
<ul>
  <li><b>Most you can make:</b> 100%. The stock can only go to $0.</li>
  <li><b>Most you can lose:</b> no limit. A $4 stock can go to $8, $12, or $40.</li>
  <li>Small caps can move 50–300% in one day, so the risk is real. A single bad trade can wipe out months of gains.</li>
</ul>
<div class="callout red"><b>Rule #1 of shorting small caps:</b> every trade has a stop decided <i>before</i> you enter, and the position is sized so that stop is a small, survivable loss.</div>
<h3>Why short small caps at all?</h3>
<p>Many low-priced, low-float stocks spike on weak or no news. Most of these companies lose money and pay their bills by selling new shares. After the hype fades, many of them give back most of the move. Short sellers trade that fade.</p>
<p>Shorting works only when you also respect the stocks that <i>don't</i> fade. Those are the squeezes.</p>
<h3>Words you'll see</h3>
<table class="mini">
<tr><td><b>Cover</b></td><td>Buy back shares to close a short.</td></tr>
<tr><td><b>Front side</b></td><td>The stock is still making higher highs, holding above VWAP, with buyers in control. Don't short here.</td></tr>
<tr><td><b>Backside</b></td><td>The stock has topped and is making lower highs below VWAP. This is where shorts work best.</td></tr>
<tr><td><b>Squeeze</b></td><td>Shorts are forced to buy back, which pushes the price up further, which forces more shorts to buy back.</td></tr>
<tr><td><b>Float</b></td><td>Shares available to trade publicly. A low float (under ~10M) can move violently.</td></tr>
<tr><td><b>VWAP</b></td><td>Volume-weighted average price for the day: the average price everyone has paid. It's the key intraday line.</td></tr>
<tr><td><b>HOD</b></td><td>High of day.</td></tr>
</table>`
},
{
  id: 'borrow',
  title: 'Locates, borrow & margin',
  body: `
<h2>Locates, borrow & margin</h2>
<p>You can't short shares you can't borrow. Under <b>Reg SHO Rule 203(b)</b>, your broker must <b>locate</b> shares to borrow before you sell short.</p>
<h3>Easy-to-borrow vs hard-to-borrow</h3>
<ul>
  <li><b>ETB (easy to borrow):</b> plenty of shares and you can short right away. Larger, steadier stocks usually fall in this group.</li>
  <li><b>HTB (hard to borrow):</b> few shares, so you have to request a <b>locate</b> and usually pay a fee per share. Most hot small caps are HTB.</li>
  <li><b>No borrow:</b> no shares at all. You can't short it, no matter how good the setup looks.</li>
</ul>
<h3>Locate fees</h3>
<p>Locates are usually priced per share (e.g. $0.02–$0.20/share on hot names) and are typically <b>non-refundable</b>. You pay even if you never take the trade. On a $2 stock, a $0.10 locate is 5% of the price, so the stock has to drop 5% before you break even.</p>
<div class="callout">Before you locate, check that the locate fee is small compared with your expected move. If you expect a $0.30 fade and the locate costs $0.12, the trade probably isn't worth it.</div>
<h3>Overnight borrow fees</h3>
<p>If you hold a short overnight, you pay an annualized borrow rate, charged daily. Hot small caps can carry rates of 50–500%+ per year. Shares can also be <b>recalled</b>, which forces you to cover (a "buy-in"), sometimes at the worst possible time. Most small-cap short sellers trade intraday only for this reason.</p>
<h3>Margin</h3>
<ul>
  <li>Short selling requires a <b>margin account</b>.</li>
  <li>Reg T initial requirement for shorts is 150% of the position value: the sale proceeds plus 50% of your own equity.</li>
  <li>FINRA maintenance for shorts under $5 is the greater of <b>$2.50/share or 100%</b> of market value. Brokers often require more on volatile names. A short in a low-priced stock uses up much more buying power than you'd expect.</li>
</ul>
<h3>Pattern day trader rule</h3>
<p>In US margin accounts, the PDT rule historically required $25,000 of equity to make 4+ day trades in 5 business days. FINRA has been working on changes to this rule, so <b>check your broker's current requirements</b>.</p>`
},
{
  id: 'rules',
  title: 'Rules that bite: SSR & halts',
  body: `
<h2>Rules that bite: SSR & halts</h2>
<h3>SSR — Short Sale Restriction (Rule 201)</h3>
<ul>
  <li>Triggered when a stock falls <b>10% or more below the prior day's close</b>.</li>
  <li>Once triggered, it stays on for <b>the rest of that day and all of the next day</b>.</li>
  <li>While SSR is on, short sales must be priced <b>above the current best bid</b>, so you can't hit the bid to get in. You have to offer on the ask and wait for a buyer to lift you, which usually happens on upticks/bounces.</li>
</ul>
<div class="callout">SSR usually makes entries harder, not impossible. Plan to short into <b>bounces</b> (green candles toward VWAP or a lower high), not into flushes. The simulator enforces this: under SSR you can only get filled on a green bar.</div>
<h3>LULD halts (Limit Up–Limit Down)</h3>
<p>Each stock has price bands around its average price over the last 5 minutes. If price pushes outside the band and stays there briefly, trading <b>pauses for 5 minutes</b>.</p>
<table class="mini">
<tr><th>Price (Tier 2 stocks)</th><th>Band</th></tr>
<tr><td>Above $3.00</td><td>10%</td></tr>
<tr><td>$0.75 – $3.00</td><td>20%</td></tr>
<tr><td>Below $0.75</td><td>Lesser of $0.15 or 75%</td></tr>
</table>
<p>Bands are <b>doubled</b> during the open (9:30–9:45) and the close (3:35–4:00).</p>
<div class="callout red"><b>Why halts are dangerous for shorts:</b> while a stock is halted, your stop can't fill. If it halts up and reopens 20% higher, your stop fills at the reopen price, far above where you set it. Size every small-cap short assuming a halt could gap you past your stop.</div>
<h3>Other things that can halt or move a stock</h3>
<ul>
  <li><b>News pending</b> (T1) halts: the exchange stops trading until news comes out.</li>
  <li><b>Offering announcements</b> often hit after hours or premarket and can gap the stock down 20–50%.</li>
  <li><b>SEC trading suspensions</b>: rare, but they can lock you in a position for days.</li>
</ul>`
},
{
  id: 'why',
  title: 'Why small caps fade (and squeeze)',
  body: `
<h2>Why small caps fade (and why some squeeze)</h2>
<h3>The fade</h3>
<ol>
  <li><b>No real value behind the move.</b> A fluffy press release (an "AI partnership", an "MOU", a "letter to shareholders") doesn't change a cash-burning company's future.</li>
  <li><b>Dilution.</b> Many small caps keep a shelf registration ready and sell stock into any spike. When the price runs, the company and its financing partners start selling.</li>
  <li><b>Holders take profits.</b> Bagholders from higher prices finally get a chance to sell at breakeven.</li>
  <li><b>Momentum traders leave.</b> The dip buyers who pushed it up are the first ones out when it stalls.</li>
</ol>
<h3>Learn to read dilution</h3>
<table class="mini">
<tr><td><b>S-3 shelf</b></td><td>Pre-registers securities so the company can sell stock quickly. An <i>effective</i> S-3 means they can sell into strength.</td></tr>
<tr><td><b>Baby shelf rule</b></td><td>If the public float is under $75M, S-3 sales are limited to 1/3 of the public float value per 12 months. A spike in price raises how much they're allowed to sell.</td></tr>
<tr><td><b>ATM offering</b></td><td>"At-the-market": the company drips shares into the market at current prices, which caps rallies.</td></tr>
<tr><td><b>Registered direct / 424B5</b></td><td>Shares sold to an investor at a fixed, usually discounted price. Often causes a sharp drop.</td></tr>
<tr><td><b>Warrants / converts</b></td><td>Holders can create new shares at a strike price. If the stock trades above the strike, expect selling.</td></tr>
</table>
<p>You can find these filings on <a href="https://www.sec.gov/edgar/search/" target="_blank" rel="noopener">SEC EDGAR</a>. Look at the most recent 10-Q for the cash balance and burn rate.</p>
<h3>The squeeze (what kills shorts)</h3>
<ul>
  <li><b>Very low float</b> (under ~5M shares) with <b>no near-term dilution</b>.</li>
  <li><b>A real catalyst:</b> a buyout, a major FDA approval, a large contract. If the company is actually worth more, don't fight it.</li>
  <li><b>High short interest</b> plus a high borrow fee means a crowded short. Everyone has to buy back at once.</li>
  <li><b>Halts up</b> and a stock that holds VWAP on every pullback.</li>
</ul>
<div class="callout red">A stock being "up too much" is <b>not</b> a reason to short it. Stocks that are up 100% can go up another 300%. Short weakness, not strength.</div>`
},
{
  id: 'setups',
  title: 'Core short setups',
  body: `
<h2>Core short setups</h2>
<p>Every setup has the same structure: <b>context</b> (why this stock), <b>trigger</b> (when exactly to enter), <b>stop</b> (where you're wrong), and <b>target</b> (where you take profits).</p>

<div class="setup-box"><b>1. Gap & fade / backside fade</b>
<dl>
<dt>Context</dt><dd>Gapped up big on weak news, spiked early, and has now lost VWAP.</dd>
<dt>Trigger</dt><dd>Bounce up to VWAP or a prior support level that fails (a red candle rejecting it). Or the break of a lower-high consolidation.</dd>
<dt>Stop</dt><dd>Just above the lower high / above VWAP (not the HOD if it's far away; just above the level that proves you wrong).</dd>
<dt>Target</dt><dd>Prior lows, round numbers, premarket support. Cover partials into flushes.</dd>
</dl></div>

<div class="setup-box"><b>2. First red day (FRD)</b>
<dl>
<dt>Context</dt><dd>Multi-day runner (Day 2–4) that has only gone up. Today it fails to make a new high and turns red.</dd>
<dt>Trigger</dt><dd>Failed push at the open, then losing the opening range low or VWAP. Short pops into VWAP afterward.</dd>
<dt>Stop</dt><dd>Above the morning high.</dd>
<dt>Target</dt><dd>Prior day's VWAP / mid-range. FRDs can trend down all day, so trail with lower highs.</dd>
</dl></div>

<div class="setup-box"><b>3. VWAP rejection</b>
<dl>
<dt>Context</dt><dd>Stock is below VWAP and trending lower.</dd>
<dt>Trigger</dt><dd>Price rallies up to VWAP, can't close above it, and prints a red rejection candle.</dd>
<dt>Stop</dt><dd>A few cents above VWAP or above the rejection candle's high.</dd>
<dt>Target</dt><dd>Low of day. Clean risk:reward because your stop is tight.</dd>
</dl></div>

<div class="setup-box"><b>4. Failed HOD break / lower high</b>
<dl>
<dt>Context</dt><dd>Stock tries to break the high of day, fails, and pulls back.</dd>
<dt>Trigger</dt><dd>A lower high forms under HOD and the next candle breaks the pullback low.</dd>
<dt>Stop</dt><dd>Above the lower high (tight) or above HOD (wider, smaller size).</dd>
<dt>Target</dt><dd>VWAP first, then lower.</dd>
</dl></div>

<div class="setup-box"><b>5. Parabolic exhaustion (advanced)</b>
<dl>
<dt>Context</dt><dd>Vertical move, huge volume, candles getting bigger. It looks like a top, but it hasn't confirmed one.</dd>
<dt>Trigger</dt><dd>Wait for proof: a big topping tail, a volume climax, then the first candle that makes a lower high and breaks the prior candle's low. Never short the vertical move itself.</dd>
<dt>Stop</dt><dd>Above the high. It will be far away, so use <b>small size</b>.</dd>
<dt>Target</dt><dd>VWAP is often far below, so these give the biggest wins and the biggest blowups.</dd>
</dl></div>

<div class="setup-box"><b>6. Offering / dilution dump</b>
<dl>
<dt>Context</dt><dd>The company announces a priced offering (often at a discount). The stock drops toward the offering price.</dd>
<dt>Trigger</dt><dd>Bounces that fail below the pre-news level. Stocks often pin near the offering price.</dd>
<dt>Stop</dt><dd>Above the bounce high.</dd>
<dt>Target</dt><dd>The offering price. Be careful below it: shorts cover there.</dd>
</dl></div>
<div class="callout green">Practice each setup in the simulator. Look for the moment the stock <b>stops making higher highs</b> and starts <b>failing at VWAP</b>.</div>`
},
{
  id: 'avoid',
  title: 'What NOT to short',
  body: `
<h2>What NOT to short</h2>
<ul>
  <li><b>The front side.</b> The stock is making higher highs and holding VWAP. You're betting against momentum at its strongest.</li>
  <li><b>Halting up.</b> Never short into a stock that is halting up. You can't see the reopen price, and it may not trade again until it's far above your stop.</li>
  <li><b>Real catalysts.</b> Buyouts at a fixed price, big FDA approvals, large contracts relative to market cap.</li>
  <li><b>No borrow or a crazy locate.</b> If the locate costs more than ~2–3% of the price, the trade is crowded and expensive.</li>
  <li><b>Ultra-low float with no dilution path.</b> These are squeeze candidates, not fade candidates.</li>
  <li><b>Into flushes under SSR.</b> You won't get filled at good prices. Wait for the bounce.</li>
  <li><b>Revenge trades.</b> You got stopped out, so you short again bigger. This pattern blows up more small-cap short sellers than any setup.</li>
</ul>
<div class="callout red"><b>Never average up into a losing short</b> unless the add was part of the plan, inside your original max risk. "It's too high, I'll add more" is how a $500 loss becomes $15,000.</div>`
},
{
  id: 'risk',
  title: 'Risk management',
  body: `
<h2>Risk management</h2>
<h3>Size from the stop, not from conviction</h3>
<p><b>Shares = (Account × Risk %) ÷ (Stop − Entry)</b></p>
<div class="callout">$30,000 account, 1% risk = $300.<br>Short at $4.20, stop at $4.55 → $0.35 risk/share.<br>$300 ÷ $0.35 = <b>857 shares</b> (round down to 800).</div>
<h3>Then run the halt stress test</h3>
<p>Ask yourself: <i>"If it halts up 25% past my stop, can I live with the loss?"</i> With 800 shares, a reopen at $5.69 (25% over a $4.55 stop) costs ~$1,190, about 4% of the account. If that's too much, cut size. The <b>Size Calc</b> tab does this for you.</p>
<h3>Daily guardrails</h3>
<ul>
  <li><b>Max daily loss</b> (e.g. 2–3% of account). Hit it and stop trading for the day.</li>
  <li><b>Max trades per day</b>. Overtrading usually comes from tilt.</li>
  <li><b>Hard stops.</b> Use real stop orders or alerts you actually obey. Mental stops fail when the stock is squeezing.</li>
  <li><b>Never widen a stop.</b> You can tighten it, but moving it up means you're taking on more risk than you planned.</li>
</ul>
<h3>Taking profits</h3>
<ul>
  <li>Cover partials (⅓ to ½) into big flushes and long red candles. Shorts make their money on fast drops.</li>
  <li>Once in profit, move your stop to breakeven, then trail it above each new lower high.</li>
  <li>Watch for a <b>reclaim of VWAP</b> on volume. That usually ends the backside trade.</li>
</ul>
<h3>Track R-multiples</h3>
<p>R = profit ÷ initial risk. A +2R trade made twice what you risked. Aim for winners that average ≥ 1.5R and keep losers at −1R. The Journal tab calculates your <b>expectancy</b>: average R per trade. If it's positive and stays positive over many trades, you have an edge.</p>`
},
{
  id: 'routine',
  title: 'Daily routine & checklist',
  body: `
<h2>Daily routine & checklist</h2>
<h3>Pre-market (7:00–9:25 ET)</h3>
<ol>
  <li><b>Scan top gappers:</b> up 30%+, real volume, price $1–$20.</li>
  <li><b>Check the news:</b> is it real or fluff? Recycled PRs are a red flag for the bulls.</li>
  <li><b>Check filings:</b> S-3/ATM, warrants, recent offerings, cash runway.</li>
  <li><b>Check borrow and locate cost</b> before you fall in love with a setup.</li>
  <li><b>Mark levels:</b> premarket high/low, prior day high and close, round numbers, and the SSR trigger price (prior close × 0.90).</li>
  <li><b>Write the plan:</b> "If X fails VWAP after 9:45, short the bounce. Stop above lower high. Target PM low."</li>
</ol>
<h3>During the session</h3>
<ul>
  <li>Let the open play out. The first 5–15 minutes are the most violent, and halt bands are doubled.</li>
  <li>Wait for the stock to show weakness. Don't predict it.</li>
  <li>Use the <b>Setup Grader</b> before you click short.</li>
</ul>
<h3>After the close</h3>
<ul>
  <li>Log every trade in the <b>Journal</b>, including "followed plan: yes/no".</li>
  <li>Screenshot the chart and mark your entry and exit.</li>
  <li>Review weekly: which setups pay you? Which ones cost you? Stop trading the losers.</li>
</ul>
<div class="callout green"><b>Suggested path:</b> learn the lessons → pass the quiz → play 50+ simulator rounds with positive expectancy → paper trade live → trade live with tiny size.</div>`
},
{
  id: 'largecap',
  title: 'Large caps: how they differ',
  body: `
<h2>Large caps: how they differ</h2>
<p>Liquid large caps (big S&amp;P 500 and Nasdaq-100 names that trade millions of shares a day) are a different game from small caps. The moves are smaller, but they're cleaner. Fills are better, borrowing is easy, and a halt that gaps you is far less likely.</p>
<table class="mini">
<tr><th></th><th>Small caps</th><th>Liquid large caps</th></tr>
<tr><td>Typical day range</td><td>20–100%+</td><td>1–3% (5–10% on earnings)</td></tr>
<tr><td>Borrow</td><td>Often HTB, locate fees</td><td>Almost always ETB, no locate</td></tr>
<tr><td>Spread</td><td>Several cents to dimes</td><td>Usually a penny or two</td></tr>
<tr><td>LULD band (&gt;$3)</td><td>10% (Tier 2)</td><td>5% (Tier 1), so halts are rare</td></tr>
<tr><td>What moves it</td><td>Hype, low float, dilution</td><td>Earnings, guidance, analysts, sector, <b>the overall market</b></td></tr>
<tr><td>Squeeze risk</td><td>Extreme</td><td>Low, but a market-wide rally can run you over</td></tr>
<tr><td>Position size</td><td>Small: risk is in halts</td><td>Larger share counts, tighter stops in % terms</td></tr>
</table>
<h3>The market is your biggest variable</h3>
<p>Most large caps move <i>with</i> SPY and QQQ much of the time (that's what <b>beta</b> measures). Before shorting a large cap, check three things:</p>
<ol>
  <li><b>The index (SPY / QQQ):</b> is the market red, flat, or rallying?</li>
  <li><b>The sector ETF</b> (e.g. SMH for semis, XLF for banks, XRT for retail): is the group weak?</li>
  <li><b>Relative strength:</b> is the stock doing <i>worse</i> than the market? A stock that's red while SPY is green is showing real selling.</li>
</ol>
<div class="callout green">The best large-cap shorts are <b>weak stocks on a weak or flat market day</b>. The worst are decent stocks on a day the whole market rips.</div>
<h3>What makes large caps fall</h3>
<ul>
  <li><b>Earnings misses and guidance cuts.</b> Funds that own millions of shares can't exit in one minute. They sell for hours or days, which creates trend days.</li>
  <li><b>Downgrades</b> from major analysts, especially with big price-target cuts.</li>
  <li><b>Sector or peer news:</b> a competitor warns, a regulation hits the industry, a key customer leaves.</li>
  <li><b>Macro:</b> rates, CPI, Fed days. These lift or sink everything at once.</li>
</ul>
<h3>Sizing with ATR</h3>
<p>Large caps move in smaller percentages, so you size bigger in shares, but the formula is the same: <b>Shares = Dollar risk ÷ (Stop − Entry)</b>. Use <b>ATR</b> (average true range) to sanity-check your stop. An intraday stop of about 0.3–0.6× the daily ATR above entry is common. A stop much tighter than that gets hit by normal noise.</p>
<div class="callout">$30,000 account, 1% = $300 risk. Short a $180 stock with a $1.20 stop → 250 shares (~$45,000 position). That's why large-cap day trading usually needs margin buying power. The rules still apply: SSR, PDT, and margin.</div>
<h3>Rules still apply</h3>
<ul>
  <li><b>SSR</b> applies to every stock: a 10% drop from the prior close triggers it. Big earnings gap-downs often open with SSR on.</li>
  <li>Large caps still gap overnight. An earnings report or a headline can move a stock 10–20% while it's closed.</li>
  <li>Meme events (heavily shorted large caps that suddenly squeeze) are rare, but they do happen. Check short interest.</li>
</ul>`
},
{
  id: 'largesetups',
  title: 'Large-cap short setups',
  body: `
<h2>Large-cap short setups</h2>
<p>Practice these in the Simulator by switching it to <b>Large caps (liquid)</b>. Watch the SPY and <b>Rel. strength</b> tiles.</p>

<div class="setup-box"><b>1. Earnings gap-down continuation</b>
<dl>
<dt>Context</dt><dd>Gapped down 4–10% on a miss or a guidance cut. Volume 2–5× normal.</dd>
<dt>Trigger</dt><dd>The opening bounce stalls under VWAP or the premarket high, then the opening-range low breaks. Short the break or the first failed retest.</dd>
<dt>Stop</dt><dd>Above the bounce high or above VWAP.</dd>
<dt>Target</dt><dd>Premarket low, then the next daily support level. These often trend all day, so trail your stop above lower highs.</dd>
</dl></div>

<div class="setup-box"><b>2. Opening-range breakdown (ORB)</b>
<dl>
<dt>Context</dt><dd>Stock in play (catalyst, high relative volume), and the market is flat or weak.</dd>
<dt>Trigger</dt><dd>Mark the high and low of the first 5 or 15 minutes. Short a clean break of the low while price is below VWAP.</dd>
<dt>Stop</dt><dd>Back inside the range: above the range midpoint or VWAP.</dd>
<dt>Target</dt><dd>1–2× the opening-range height, or prior-day low.</dd>
</dl></div>

<div class="setup-box"><b>3. Relative weakness / VWAP rejection</b>
<dl>
<dt>Context</dt><dd>SPY is green or flat but the stock is red, below VWAP, making lower highs. Often there's a downgrade or sector news behind it.</dd>
<dt>Trigger</dt><dd>The stock pops toward VWAP when SPY pushes up, then fails. The rejection candle is the entry.</dd>
<dt>Stop</dt><dd>Just above VWAP or the rejection high.</dd>
<dt>Target</dt><dd>Low of day, then prior-day low. If SPY rolls over, the move speeds up.</dd>
</dl></div>

<div class="setup-box"><b>4. Gap-up fade (gap fill)</b>
<dl>
<dt>Context</dt><dd>Gapped up 2–5% on modest news (an upgrade, a conference comment, a peer's earnings), not its own blowout earnings.</dd>
<dt>Trigger</dt><dd>It fails to break the premarket high, then loses VWAP. Short the first lower high.</dd>
<dt>Stop</dt><dd>Above the high of day.</dd>
<dt>Target</dt><dd>Yesterday's close (the gap fill).</dd>
</dl></div>

<div class="setup-box"><b>5. Failed prior-day-high breakout</b>
<dl>
<dt>Context</dt><dd>The stock pushes above yesterday's high but there's no follow-through and volume is fading.</dd>
<dt>Trigger</dt><dd>It falls back below prior-day high and VWAP. The breakout buyers are now trapped.</dd>
<dt>Stop</dt><dd>Above the failed breakout high.</dd>
<dt>Target</dt><dd>VWAP, then the mid-range.</dd>
</dl></div>

<div class="callout red"><b>Don't fight the tape.</b> If SPY breaks out on a macro headline (CPI, the Fed), even weak stocks get lifted. Cut size or step aside until the market stalls. The simulator includes a "market rip" scenario to teach exactly this.</div>`
}
];

window.QUIZ = [
  { q: 'You short 2,000 shares at $3.00 and cover at $2.70. Ignoring fees, what is your P&L?',
    opts: ['+$600', '−$600', '+$300', '+$6,000'], a: 0,
    why: '($3.00 − $2.70) × 2,000 = +$600. Shorts profit when price falls.' },
  { q: 'A stock closed yesterday at $5.00. At what price does SSR trigger today?',
    opts: ['$5.50', '$4.75', '$4.50', '$4.00'], a: 2,
    why: 'Rule 201 triggers at a 10% decline from the prior close: $5.00 × 0.90 = $4.50.' },
  { q: 'Once SSR triggers on Tuesday, how long does it last?',
    opts: ['15 minutes', 'Rest of Tuesday only', 'Rest of Tuesday and all of Wednesday', 'Until the price recovers'], a: 2,
    why: 'SSR stays on for the rest of the trigger day and the entire next trading day.' },
  { q: 'Under SSR, how can you enter a short?',
    opts: ['You cannot short at all', 'Only on a price above the current best bid (e.g. on upticks)', 'Only with a market order', 'Only after 2pm'], a: 1,
    why: 'You can still short, but not at or below the national best bid. Shorting into bounces works best.' },
  { q: 'Which is the strongest reason NOT to short?',
    opts: ['Stock is up 120% on a "strategic AI partnership" PR', 'Stock lost VWAP and is making lower highs', 'Company announced a definitive buyout at $8; stock is at $7.60', 'Company has an effective S-3 shelf'], a: 2,
    why: 'A fixed-price buyout is a real catalyst that anchors the price. The other three are actually bearish clues.' },
  { q: '$20,000 account, 1% risk. Short at $2.50, stop at $2.70. Max shares?',
    opts: ['500', '1,000', '2,000', '8,000'], a: 1,
    why: 'Risk = $200. Risk per share = $0.20. $200 ÷ $0.20 = 1,000 shares.' },
  { q: 'Why can a halt cause a loss much bigger than your stop?',
    opts: ['Stops are cancelled during halts', 'The stock can reopen far above your stop, and you fill at the reopen price', 'Brokers charge a halt fee', 'It cannot; stops are guaranteed'], a: 1,
    why: 'No trades happen during the halt. If it reopens 20% higher, your stop fills there. Stops are not guaranteed prices.' },
  { q: 'What does "front side" mean?',
    opts: ['The stock is still making higher highs above VWAP', 'The stock has topped and is fading', 'The first 5 minutes of the day', 'Premarket trading'], a: 0,
    why: 'The front side is the strong part of the move. Small-cap shorts work on the backside.' },
  { q: 'A locate costs $0.12/share on a $1.80 stock. What does that mean for the trade?',
    opts: ['Nothing, it is refunded', 'The stock must fall ~6.7% just to cover the locate', 'You can only hold it overnight', 'It means it is easy to borrow'], a: 1,
    why: '$0.12 ÷ $1.80 ≈ 6.7%. Locates are usually non-refundable, so they come straight out of your edge.' },
  { q: 'You\'re short and the stock is going against you, approaching your stop. Best move?',
    opts: ['Move the stop higher to give it room', 'Add more shares to improve your average', 'Let the stop execute as planned', 'Turn off the stop and watch'], a: 2,
    why: 'Widening stops and averaging up into a loser are how small losses turn into account-ending losses.' },
  { q: 'Which combination is the classic squeeze setup?',
    opts: ['High float, no news, below VWAP', 'Low float, high short interest, real catalyst, holding VWAP', 'Recent offering, lower highs', 'Effective S-3 with ATM'], a: 1,
    why: 'A low float, a crowded short, and a real reason to own the stock are what feed a squeeze.' },
  { q: 'Your journal shows 40% win rate, avg win +2.2R, avg loss −1R. Expectancy?',
    opts: ['−0.12R', '+0.28R', '+0.88R', '+1.2R'], a: 1,
    why: '0.40 × 2.2 − 0.60 × 1 = 0.88 − 0.60 = +0.28R per trade. That is a positive edge even with a sub-50% win rate.' },
  { q: 'You want to short a large cap. Which context is best?',
    opts: ['Stock red and below VWAP while SPY is green', 'Stock up in line with a rallying SPY', 'Stock breaking above its prior-day high', 'SPY ripping after a cool CPI print'], a: 0,
    why: 'Relative weakness: a stock falling while the market rises shows real sellers. The other three are moving with buyers.' },
  { q: 'What is the LULD band for a Tier 1 (S&P 500) stock above $3 during normal hours?',
    opts: ['5%', '10%', '20%', 'No band'], a: 0,
    why: 'Tier 1 stocks above $3 have 5% bands (doubled at the open and close). Large caps rarely move fast enough to hit them.' },
  { q: '$30,000 account risking 1%. Short a $200 stock with a $1.50 stop. Shares?',
    opts: ['20', '150', '200', '1,500'], a: 2,
    why: '$300 ÷ $1.50 = 200 shares, a $40,000 position. Large-cap shorts usually need margin buying power for that.' }
];
