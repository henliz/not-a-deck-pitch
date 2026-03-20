import { WebHaptics } from 'web-haptics';

/* ── haptics ──────────────────────────────────────────────────────────────────────
   setDebug(true)      → enables Web Audio click simulation (the sound you hear on
                         iOS — this is NOT just for testing, it IS the iOS haptic path)
   setShowSwitch(false) → hides the debug toggle UI so nothing visible appears
   navigator.vibrate   → Android physical buzz, fired alongside for dual coverage   */
export const haptics = new WebHaptics();
haptics.setDebug(true);
haptics.setShowSwitch(false);

export const vibe = (p) => navigator.vibrate?.(p);

export const HAPTIC = {
  tap:     () => { vibe(10);            haptics.trigger('selection'); },
  notif:   () => { vibe([35, 80, 25]);  haptics.trigger([{ duration: 40, intensity: 0.8 }, { delay: 100, duration: 40, intensity: 0.6 }]); },
  burst:   () => { vibe(15);            haptics.trigger([{ duration: 20, intensity: 1.0 }]); },
  shatter: () => { vibe([8,50,8,50,8]); haptics.trigger([{ duration: 8 }, { delay: 60, duration: 8 }, { delay: 60, duration: 8 }], { intensity: 0.5 }); },
  begin:   () => { vibe(8);             haptics.trigger([{ duration: 8 }], { intensity: 0.3 }); },
  card:    () => { vibe([55, 60, 25]);  haptics.trigger([{ duration: 80, intensity: 0.8 }, { delay: 80, duration: 50, intensity: 0.3 }]); },
};
