const tScenes = [

  /* ── Scene 0: Pitch ─────────────────────────────────────────────────────────── */
  { chapter: 'The Hook',
    render: () => `
      <div class="tg-pitch-scene">
        <div class="tg-pitch-scroll" id="tg-pitch"></div>
        <div class="tg-collect-toast" id="tg-toast"></div>
      </div>`,
    onShow: () => window.tgInitGame?.() },

];

export default tScenes;
