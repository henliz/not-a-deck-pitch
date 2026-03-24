import { ARCHETYPES } from './data/archetypes.js';

// createScoring(ctx) — returns scoring state + methods, merged onto ctx by game.js
// first move gets 1.5x weight because it's the most unguarded reaction
// getArchetype() reads it at the end — ties default to storyteller

export function createScoring() {
  const scores = { cartographer: 0, contrarian: 0, architect: 0, operator: 0, storyteller: 0 };
  let moveCount   = 0;
  let choiceCount = 0;
  const branchPath = [];
  let firstChoice          = null;
  let usedFounderPath      = false;
  let pushedBackOnData     = false;
  let wentDeepOnMoat       = false;
  let wentStraightToAsk    = false;
  let pushedOnFounder      = false;
  let wentB2B              = false;
  let wentDataset          = false;
  let firstBranchTimestamp = null;
  let choiceTimings        = [];
  let lastChoiceTime       = null;

  function score(wts) {
    const keys = ['cartographer', 'contrarian', 'architect', 'operator', 'storyteller'];
    const mult = moveCount === 0 ? 1.5 : 1;
    keys.forEach((key, i) => { scores[key] += (wts[i] || 0) * mult; });
    moveCount++;
  }

  function getArchetype() {
    const e = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = e[0][1];
    if (top === 0) return 'storyteller';
    const tied = e.filter(([, v]) => v === top);
    return tied.length >= 2 ? 'storyteller' : e[0][0];
  }

  function buildRecapData(id) {
    const arch = ARCHETYPES[id];
    const firstChoiceLabels = ['signal skeptic', 'pattern matcher', 'team reader'];
    const traitLines = {
      cartographer: ['you mapped the unknown before committing', 'you ask "does this data exist?" — not "does this matter?"'],
      contrarian:   ['you challenged the premise first', 'you needed to know what failed before you could trust what works'],
      architect:    ['you went straight for structural defensibility', 'you think in systems, not features'],
      operator:     ['you needed to know who built it', 'for you, the team is the thesis'],
      storyteller:  ['you followed the narrative thread', 'you understand that the product is the proof'],
    };
    const avgChoiceGap = choiceTimings.length
      ? Math.round(choiceTimings.reduce((a, b) => a + b, 0) / choiceTimings.length / 1000)
      : null;
    const readerSpeed = choiceTimings.length && choiceTimings[0] > 0
      ? (choiceTimings[0] < 8000 ? 'fast reader' : choiceTimings[0] < 20000 ? 'deliberate reader' : 'deep reader')
      : null;

    const allSignals = [];
    if (firstChoice !== null) allSignals.push(`came in as a ${firstChoiceLabels[firstChoice]}`);
    if (wentDeepOnMoat)    allSignals.push('stayed for the flywheel');
    if (wentStraightToAsk) allSignals.push('cut straight to the ask');
    if (usedFounderPath)   allSignals.push('led with the founder');
    if (pushedBackOnData)  allSignals.push('pushed back on the data');
    if (pushedOnFounder)   allSignals.push('dug into the conviction');
    if (wentB2B)           allSignals.push('went deep on B2B model');
    if (wentDataset)       allSignals.push('challenged data ownership');
    if (readerSpeed)       allSignals.push(readerSpeed);

    const exitMove =
      wentDeepOnMoat    ? 'stayed for the flywheel' :
      wentStraightToAsk ? 'cut to the ask' :
      usedFounderPath   ? 'led with founder' :
      pushedBackOnData  ? 'pushed back' : 'followed the signal';

    return {
      id, arch,
      pathLength: branchPath.length,
      choiceCount,
      firstChoiceLabel: firstChoice !== null ? firstChoiceLabels[firstChoice] : 'curious',
      traits: traitLines[id] || [],
      wentDeepOnMoat, wentStraightToAsk, usedFounderPath, pushedBackOnData,
      pushedOnFounder, wentB2B, wentDataset,
      allSignals,
      exitMove,
      avgChoiceGap,
      readerSpeed,
    };
  }

  return {
    scores, branchPath,
    // getters/setters for flags (so scene modules can mutate them)
    getChoiceCount:    ()    => choiceCount,
    setChoiceCount:    (v)   => { choiceCount = v; },
    getFirstChoice:    ()    => firstChoice,
    setFirstChoice:    (v)   => { firstChoice = v; },
    getFirstBranchTs:  ()    => firstBranchTimestamp,
    setFirstBranchTs:  (v)   => { firstBranchTimestamp = v; },
    getLastChoiceTime: ()    => lastChoiceTime,
    setLastChoiceTime: (v)   => { lastChoiceTime = v; },
    pushChoiceTiming:  (v)   => { choiceTimings.push(v); },
    setFlag: (name, val = true) => {
      if (name === 'usedFounderPath')   usedFounderPath   = val;
      if (name === 'pushedBackOnData')  pushedBackOnData  = val;
      if (name === 'wentDeepOnMoat')    wentDeepOnMoat    = val;
      if (name === 'wentStraightToAsk') wentStraightToAsk = val;
      if (name === 'pushedOnFounder')   pushedOnFounder   = val;
      if (name === 'wentB2B')           wentB2B           = val;
      if (name === 'wentDataset')       wentDataset       = val;
    },
    score,
    getArchetype,
    buildRecapData,
  };
}
