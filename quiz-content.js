const tScenes = [

  /* ── Scene 0: Tangle intro card ─────────────────────────────────────────────── */
  { chapter: 'An Investor Story',
    render: () => `
      <div class="tg-intro-scene">
        <div class="tg-intro-card">

          <div class="tg-intro-logo-header">
            <div class="t-hero-logo" style="height:32px;margin:0">
              <img class="t-hero-oh" src="./TroveOh.png" alt="" style="width:20px;height:20px;top:5px">
              <img class="t-hero-word" src="./TroveLogo.png" alt="Trove" style="height:30px;opacity:1">
            </div>
          </div>

          <div class="tg-intro-illustration">
            <svg viewBox="0 0 300 170" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="300" height="170" fill="#3d4a2e"/>

              <!-- Lamp glow -->
              <circle cx="252" cy="46" r="62" fill="#f0c040" fill-opacity="0.10"/>
              <circle cx="252" cy="46" r="36" fill="#f0c040" fill-opacity="0.15"/>
              <circle cx="252" cy="46" r="16" fill="#f8e080" fill-opacity="0.22"/>

              <!-- Lamp stand -->
              <line x1="252" y1="54" x2="252" y2="118" stroke="#7a8a60" stroke-width="2" stroke-linecap="round"/>
              <line x1="237" y1="118" x2="267" y2="118" stroke="#7a8a60" stroke-width="2" stroke-linecap="round"/>
              <!-- Lamp shade (trapezoid) -->
              <path d="M236 22 L242 52 L262 52 L268 22 Z" fill="#c8a030" stroke="#a88020" stroke-width="0.5"/>
              <ellipse cx="252" cy="53" rx="10" ry="3.5" fill="#f8d060" fill-opacity="0.75"/>

              <!-- Table surface -->
              <rect x="18" y="118" width="218" height="9" rx="3" fill="#5c4a30"/>

              <!-- Laptop keyboard -->
              <rect x="44" y="108" width="95" height="11" rx="2" fill="#1e2a14"/>
              <!-- Laptop screen (half-open, leaning back) -->
              <path d="M44 108 L56 66 L137 66 L139 108 Z" fill="#1e2a14"/>
              <path d="M47 107 L58 70 L135 70 L137 107 Z" fill="#141e0c"/>
              <!-- Screen glow (blue) -->
              <path d="M50 105 L61 73 L132 73 L134 105 Z" fill="#5080a8" fill-opacity="0.20"/>
              <!-- Screen text lines -->
              <rect x="68" y="81" width="40" height="1.5" rx="0.75" fill="#88aac8" fill-opacity="0.55"/>
              <rect x="64" y="87" width="50" height="1.5" rx="0.75" fill="#88aac8" fill-opacity="0.38"/>
              <rect x="67" y="93" width="44" height="1.5" rx="0.75" fill="#88aac8" fill-opacity="0.28"/>
              <rect x="72" y="99" width="32" height="1.5" rx="0.75" fill="#88aac8" fill-opacity="0.18"/>

              <!-- Wine bottle -->
              <rect x="168" y="80" width="16" height="38" rx="3" fill="#2a4820"/>
              <rect x="172" y="70" width="8" height="12" rx="2" fill="#2a4820"/>
              <rect x="174" y="66" width="4" height="6" rx="1" fill="#1a3015"/>
              <!-- Label -->
              <rect x="170" y="94" width="12" height="16" rx="1" fill="white" fill-opacity="0.13"/>

              <!-- Wine glass 1 (with wine) -->
              <path d="M148 118 L151 104 L152 92 L155 80 L158 92 L159 104 L162 118" fill="none" stroke="#c0c09a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="150" y1="118" x2="160" y2="118" stroke="#c0c09a" stroke-width="1.5"/>
              <line x1="147" y1="122" x2="163" y2="122" stroke="#c0c09a" stroke-width="1.5"/>
              <!-- Wine fill -->
              <path d="M151 104 L152 92 L155 80 L158 92 L159 104 Z" fill="#9a3838" fill-opacity="0.42"/>

              <!-- Wine glass 2 (empty) -->
              <path d="M192 118 L195 104 L196 92 L199 80 L202 92 L203 104 L206 118" fill="none" stroke="#c0c09a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="194" y1="118" x2="204" y2="118" stroke="#c0c09a" stroke-width="1.5"/>
              <line x1="191" y1="122" x2="207" y2="122" stroke="#c0c09a" stroke-width="1.5"/>
            </svg>
          </div>

          <div class="tg-intro-body">
            <h1 class="tg-intro-title">Someone Thought of You</h1>
            <div class="tg-collectibles">
              <div class="tg-collectible tg-collectible--play">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M1 1l8 5-8 5V1z" fill="white"/></svg>
              </div>
              <div class="tg-collectible tg-collectible--locked">
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="1.5" y="5.5" width="8" height="6.5" rx="1.5" stroke="#1a1a2e" stroke-width="1.5"/><path d="M3.5 5.5V3.5a2 2 0 1 1 4 0v2" stroke="#1a1a2e" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
              <div class="tg-collectible tg-collectible--locked">
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="1.5" y="5.5" width="8" height="6.5" rx="1.5" stroke="#1a1a2e" stroke-width="1.5"/><path d="M3.5 5.5V3.5a2 2 0 1 1 4 0v2" stroke="#1a1a2e" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
            </div>

            <p class="tg-intro-tagline">They never explain why. They never have to.</p>
            <p class="tg-intro-text">You're taking on the role of someone who answers the door when Cass knocks.</p>
            <p class="tg-intro-subtext">That's already the first thing we learn about you.</p>
            <button class="tg-intro-continue" onclick="window.tNext()">Begin &#8594;</button>
          </div>

        </div>
      </div>`},

  /* ── Scene 1: Full game ──────────────────────────────────────────────────────── */
  { chapter: 'Game',
    render: () => `
      <div class="tg-game-scene">
        <div class="tg-scroll" id="tg-scroll"></div>
        <div class="tg-collect-toast" id="tg-toast"></div>
      </div>`,
    onShow: () => window.tgInitGame?.() },

];

export default tScenes;
