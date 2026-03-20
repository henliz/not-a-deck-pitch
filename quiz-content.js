const tScenes = [
  { chapter: 'An Investor Story',
    render: () => `
      <div class="t-chapter-label">An Investor Story</div>
      <div class="t-hero-logo">
        <img class="t-hero-oh" src="./TroveOh.png" alt="">
        <img class="t-hero-word" src="./TroveLogo.png" alt="Trove">
      </div>
      <div class="t-scene-text" style="font-size:12px;font-weight:400;color:#6a6a5a;font-style:italic;margin-bottom:10px">The world's first behavioural identity layer.</div>
      <div class="t-scene-text">You're about to experience a tangle.<br><br>Not as a user — as an investor.<br><br><em style="color:#6a6a5a;font-style:italic">Every choice will reveal something. About the opportunity. About you.</em></div>
      <div class="t-choices">
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>I've seen a thousand pitch decks. Show me something different.</button>
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>I'm sceptical. Convince me.</button>
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>I like behavioural science. You have my attention.</button>
      </div>`},

  { chapter: 'Chapter 01 — The World',
    render: () => `
      <div class="t-chapter-label">Chapter 01 — The World</div>
      <div class="t-scene-text">It's a Tuesday morning. You're reviewing candidates for a key hire.<br><br>Three people made it to final round. Polished CVs. Sharp interviews. One of them tanked a $2M project at their last company. <strong>You won't find out until six months after you hire them.</strong></div>
      <div class="t-choices">
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>This happens to every company. It's just the cost of hiring.</button>
        <button class="t-choice-btn" onclick="window.tNext(1)"><span class="t-choice-icon">→</span>There has to be a better signal than a CV and a good interview.</button>
      </div>`},

  { chapter: 'Chapter 02 — The Problem',
    render: (c) => `
      <div class="t-chapter-label">Chapter 02 — The Problem</div>
      <div class="t-scene-text">${c===1?'<em style="color:#6a6a5a">That instinct is right.</em> The hiring example is just the surface.<br><br>':'It is — and it\'s a $25B problem in hiring alone.<br><br>'}Our most important decisions are based on <strong>what people say about themselves</strong>. Not how they actually behave.</div>
      <div class="t-reveal-list">
        <div class="t-reveal-item" style="animation-delay:.1s"><span class="t-reveal-marker">01</span>Resumes. Profiles. LinkedIn. Self-reported.</div>
        <div class="t-reveal-item" style="animation-delay:.25s"><span class="t-reveal-marker">02</span>Interviews. Assessment centres. Personality tests. Self-reported.</div>
        <div class="t-reveal-item" style="animation-delay:.4s"><span class="t-reveal-marker">03</span>Dating profiles. Reference checks. Pitch decks. <em>All self-reported.</em></div>
      </div>
      <div class="t-scene-text" style="margin-top:8px">And now? AI can generate any of those in seconds. <strong>Self-reporting is dead.</strong></div>
      <button class="t-continue-btn" onclick="window.tNext()">Continue →</button>`},

  { chapter: 'Chapter 03 — The Question',
    render: () => `
      <div class="t-chapter-label">Chapter 03 — The Question</div>
      <div class="t-scene-text">If you couldn't ask someone to describe themselves — <em style="color:#6a6a5a">if that signal was gone</em> — how would you actually understand who they are?</div>
      <div class="t-pull-quote">"What if you were measured by your actions and not just your answers?"</div>
      <div class="t-choices">
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>You'd watch them under pressure. See how they behave when stakes are real.</button>
        <button class="t-choice-btn" onclick="window.tNext(1)"><span class="t-choice-icon">→</span>You'd give them a real scenario. Something emotionally charged, hard to fake.</button>
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>You'd look at their history of actual decisions, not their narrative about them.</button>
      </div>`},

  { chapter: 'Chapter 04 — The Solution',
    render: (c) => `
      <div class="t-chapter-label">Chapter 04 — The Solution</div>
      <div class="t-scene-text">${c===1?'<em style="color:#6a6a5a">Exactly.</em> Emotionally charged. Hard to fake.':'<em style="color:#6a6a5a">Yes.</em> That\'s the insight.'}</div>
      <div class="t-scene-text">Trove builds <strong>tangles</strong> — interactive, story-based micro-simulations that put you inside high-stakes moments. A first date. A workplace conflict. A creative crisis at 2am.<br><br>You make choices. Real ones. <em style="color:#6a6a5a">The kind you can't game.</em><br><br>And our behavioural science engine reads what those choices actually mean.</div>
      <div class="t-pull-quote">Fun to play. Hard to game. Impossible to fake.</div>
      <button class="t-continue-btn" onclick="window.tNext()">Continue →</button>`},

  { chapter: 'Chapter 05 — You Just Did It',
    render: () => `
      <div class="t-chapter-label">Chapter 05 — You Just Did It</div>
      <div class="t-scene-text">The choices you've been making since you opened this?</div>
      <div class="t-reveal-list">
        <div class="t-reveal-item" style="animation-delay:.1s"><span class="t-reveal-marker">→</span>How fast you read before clicking.</div>
        <div class="t-reveal-item" style="animation-delay:.3s"><span class="t-reveal-marker">→</span>Whether you picked the sceptical or curious option.</div>
        <div class="t-reveal-item" style="animation-delay:.5s"><span class="t-reveal-marker">→</span>Which framing of the problem resonated.</div>
        <div class="t-reveal-item" style="animation-delay:.7s"><span class="t-reveal-marker">→</span>The language that made you lean forward.</div>
      </div>
      <div class="t-scene-text" style="margin-top:8px"><strong>That's a tangle.</strong> You just experienced the product.<br><br><em style="color:#6a6a5a">Now imagine 24,000 data points from 2,100 people doing this across two weeks.</em></div>
      <button class="t-continue-btn" onclick="window.tNext()">Show me the numbers →</button>`},

  { chapter: 'Chapter 06 — Traction',
    render: () => `
      <div class="t-chapter-label">Chapter 06 — Traction</div>
      <div class="t-scene-text">Two weeks. Valentine's Day. <strong>$0 spend.</strong> 500 emails. No paid ads.</div>
      <div class="t-stat-row">
        <div class="t-stat-cell"><span class="t-stat-num">8×</span><div class="t-stat-label">organic amplification</div></div>
        <div class="t-stat-cell"><span class="t-stat-num">78%</span><div class="t-stat-label">multi-day return rate</div></div>
        <div class="t-stat-cell"><span class="t-stat-num">7 min</span><div class="t-stat-label">median session</div></div>
        <div class="t-stat-cell"><span class="t-stat-num">3</span><div class="t-stat-label">unsolicited B2B inbounds</div></div>
      </div>
      <div class="t-scene-text">People came back. Unprompted. <em style="color:#6a6a5a">Three companies asked about using it for recruiting. We hadn't pitched a single one.</em></div>
      <div class="t-choices">
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>Impressive. Tell me about the business model.</button>
        <button class="t-choice-btn" onclick="window.tNext(1)"><span class="t-choice-icon">→</span>That B2B signal is interesting. Who are these companies?</button>
      </div>`},

  { chapter: 'Chapter 07 — The Model',
    render: (c) => `
      <div class="t-chapter-label">Chapter 07 — The Model</div>
      <div class="t-scene-text">${c===1?'The B2B signal came from <em style="color:#6a6a5a">recruiting teams</em>. Companies want behavioural data on candidates that isn\'t a personality test. That\'s the enterprise play.<br><br>But the flywheel starts with B2C.':'Two revenue streams. One compounding moat.'}</div>
      <div class="t-ask-row">
        <div class="t-ask-cell"><div class="t-ask-label">B2C</div><div class="t-ask-val">Free → Premium</div><div class="t-ask-sub">$0.10/play → profile worth $5</div></div>
        <div class="t-ask-cell"><div class="t-ask-label">B2B</div><div class="t-ask-val">"Sign in with Trove"</div><div class="t-ask-sub">Profile worth $50–200 to enterprise</div></div>
      </div>
      <div class="t-pull-quote">Not a ChatGPT wrapper. The dataset compounds with every play. You can't shortcut this with GPUs.</div>
      <button class="t-continue-btn" onclick="window.tNext()">Who's building this? →</button>`},

  { chapter: 'Chapter 08 — The Team',
    render: () => `
      <div class="t-chapter-label">Chapter 08 — The Team</div>
      <div class="t-scene-text">Second-time founders who know what they don't know.</div>
      <div class="t-team-list">
        <div class="t-team-card"><div class="t-team-name">Helen Huang</div><div class="t-team-bio">Founder. Ex-Microsoft & Zynga PM. Bootstrapped a profitable edtech startup to 7-figures. Forbes 30 Under 30. 30K+ tech audience.</div></div>
        <div class="t-team-card"><div class="t-team-name">David Potgieter</div><div class="t-team-bio">Founding Engineer. 20 years shipping game-like interactive experiences for Ogilvy & Nokia.</div></div>
        <div class="t-team-card"><div class="t-team-name">Designer</div><div class="t-team-bio">Ex-founder. $1.5M ARR design studio. Founding team at Abdoe.</div></div>
      </div>
      <button class="t-continue-btn" onclick="window.tNext()">The market →</button>`},

  { chapter: 'Chapter 09 — The Market',
    render: () => `
      <div class="t-chapter-label">Chapter 09 — The Market</div>
      <div class="t-scene-text"><strong>$65B+</strong> spent every year trying to figure people out.</div>
      <div class="t-stat-row">
        <div class="t-stat-cell"><span class="t-stat-num">$25B</span><div class="t-stat-label">Hiring & Assessment</div></div>
        <div class="t-stat-cell"><span class="t-stat-num">$10B</span><div class="t-stat-label">Dating Platforms</div></div>
        <div class="t-stat-cell"><span class="t-stat-num">$15B</span><div class="t-stat-label">Learning & Admissions</div></div>
        <div class="t-stat-cell"><span class="t-stat-num">$15B</span><div class="t-stat-label">Team & Therapy</div></div>
      </div>
      <div class="t-scene-text"><em style="color:#6a6a5a">Every single one of these markets is built on self-report.</em><br><br>Trove is the infrastructure layer that sits underneath all of them.</div>
      <button class="t-continue-btn" onclick="window.tNext()">The ask →</button>`},

  { chapter: 'Chapter 10 — The Ask',
    render: () => `
      <div class="t-chapter-label">Chapter 10 — The Ask</div>
      <div class="t-scene-text">Raising <strong>$1.5M</strong>.</div>
      <div class="t-ask-row">
        <div class="t-ask-cell"><div class="t-ask-label">Already in</div><div class="t-ask-val">$525K</div><div class="t-ask-sub">Betaworks, True Ventures, Slack Fund</div></div>
        <div class="t-ask-cell"><div class="t-ask-label">Raising now</div><div class="t-ask-val">$1.5M</div><div class="t-ask-sub">SAFEs · 7 people · 18–25 months</div></div>
      </div>
      <div class="t-reveal-list">
        <div class="t-reveal-item" style="animation-delay:.1s"><span class="t-reveal-marker">01</span>Full product built out</div>
        <div class="t-reveal-item" style="animation-delay:.25s"><span class="t-reveal-marker">02</span>100K active behavioural profiles</div>
        <div class="t-reveal-item" style="animation-delay:.4s"><span class="t-reveal-marker">03</span>B2B model validated</div>
      </div>
      <div class="t-choices">
        <button class="t-choice-btn" onclick="window.tNext(0)"><span class="t-choice-icon">→</span>Tell me what kind of investor Trove is looking for.</button>
        <button class="t-choice-btn" onclick="window.tNext(1)"><span class="t-choice-icon">→</span>Show me the results of my tangle first.</button>
      </div>`},

  { chapter: 'Chapter 11 — Who We\'re Looking For',
    render: (c) => `
      <div class="t-chapter-label">Chapter 11 — Who We're Looking For</div>
      <div class="t-scene-text">${c===1?'Your profile is coming. But first — a question.<br><br>':''}Trove is looking for investors who understand that <strong>behavioural data is the last unfakeable signal</strong>.<br><br>Who have backed consumer-to-enterprise plays before. Who are patient enough to let a dataset compound.</div>
      <div class="t-inv-tags">
        <span class="t-inv-tag">Consumer → Enterprise</span>
        <span class="t-inv-tag">Data Infrastructure</span>
        <span class="t-inv-tag">Future of Work</span>
        <span class="t-inv-tag">AI-Native Behaviour</span>
        <span class="t-inv-tag active">You?</span>
      </div>
      <button class="t-continue-btn" onclick="window.tNext()">Reveal my investor profile →</button>`},

  { chapter: 'Chapter 12 — Your Behavioural Profile',
    render: () => `
      <div class="t-chapter-label">Chapter 12 — Your Behavioural Profile</div>
      <div class="t-scene-text">Based on the choices you made — <em style="color:#6a6a5a">how you read, what you clicked, what you needed to hear</em> — here's what we see.</div>
      <div class="t-profile-reveal">
        <div class="t-profile-title">Your investor archetype</div>
        <div class="t-profile-type">The Pattern Recogniser</div>
        <div class="t-profile-desc">You don't need to be sold the vision — you've already connected the dots. You're looking for proof that the team can execute, and a model that compounds. You'll push hard on the moat. That's exactly the right question.</div>
      </div>
      <div class="t-scene-text" style="font-size:11px;color:#8a8a7a;font-style:italic">In a real Trove profile, this gets richer with every tangle you complete. Across contexts. Over time. That's the compounding dataset.</div>
      <button class="t-continue-btn" onclick="window.tNext()">The close →</button>`},

  { chapter: 'Chapter 13 — The Close',
    render: () => `
      <div class="t-chapter-label">Chapter 13 — The Close</div>
      <div class="t-scene-text" style="color:#7a7a6a;font-style:italic;font-weight:400">In a world where AI can copy our words, our faces, our voices —</div>
      <div class="t-scene-text" style="font-size:18px;font-weight:800;margin:10px 0;line-height:1.3">the only thing that remains irreducibly human<br>is your character.</div>
      <div style="width:36px;height:3px;background:#d4f54a;margin:12px 0;border-radius:2px"></div>
      <div class="t-scene-text" style="color:#5a6a5a;font-style:italic;font-weight:400">Trove is how the world finally captures that.<br>And we're just getting started.</div>
      <div class="t-contact">
        <div class="t-contact-name">Helen Huang · Founder</div>
        <div><a href="mailto:helen@trove.garden">helen@trove.garden</a> &nbsp;·&nbsp; <a href="https://trove.is" target="_blank">trove.is</a></div>
      </div>
      <button class="t-continue-btn" onclick="window.tRestart()" style="background:rgba(26,26,46,0.12);color:#3a3a2a;margin-top:10px;font-size:12px">↺ Play again with different choices</button>`}
];

export default tScenes;
