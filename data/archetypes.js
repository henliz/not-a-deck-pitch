// the five investor archetypes — pure data, no logic
// scored passively as the investor makes choices; revealed at the end

export const ARCHETYPES = {
  cartographer: {
    name: 'The Cartographer',
    sub: 'you map before you move',
    desc: 'You don\'t back vibes — you back evidence of thinking. You want to see the model, the moat, and the reasoning behind both. You ask the questions other investors are embarrassed to ask. You\'re not slow. You\'re thorough. And the companies you back feel that difference.',
    together: 'You\'ll want the data room early. We\'ll send it. You\'ll push hard on the flywheel logic — <strong>good, that\'s exactly the right question for Trove.</strong>',
    implication: 'You\'ll want the data room early. You\'ll push on the flywheel. Good — that\'s exactly where Trove gets interesting.',
    traits: ['Evidence-First', 'Thorough', 'Precise'],
    insight: 'You asked about the data before anything else. That\'s the right question.',
    highlights: [
      { head: 'You went to the data first.', body: 'Most investors open with founder or market. You asked whether the signal could exist. That\'s evidence-first thinking.' },
      { head: 'You map before you commit.', body: 'You needed to understand the mechanism before you could trust the conclusion. That\'s thoroughness, not slowness.' },
      { head: 'You pushed on the moat.', body: 'The flywheel question is the right question. You found it before anyone pointed you there.' },
    ],
  },
  contrarian: {
    name: 'The Contrarian',
    sub: 'you were early on something everyone else passed on',
    desc: 'You back founders who can\'t be talked out of it, because conviction is the only thing that survives a hard year. You\'ve learned to trust the feeling of "this is weird but right" more than any spreadsheet. Your best investments didn\'t make sense to the room.',
    together: 'You already see it. The question is whether Helen\'s the kind of founder who gets more stubborn under pressure. <strong>She is.</strong>',
    implication: 'You already see it. The only question is whether the founder gets more stubborn under pressure. She does.',
    traits: ['Conviction', 'Pattern-Breaker', 'Early'],
    insight: 'You backed the founder before the product made sense to anyone else.',
    highlights: [
      { head: 'You bet on the builder first.', body: 'Before the product, before the market — you needed to know if Helen was the kind of founder who gets more stubborn under pressure.' },
      { head: 'You\'ve been early before.', body: 'You recognized something before the room did. That pattern is what makes you interesting to Trove.' },
      { head: 'You trust the weird feeling.', body: '"This is strange but right" is a data point for you, not a red flag. Your best investments didn\'t make sense to the room.' },
    ],
  },
  architect: {
    name: 'The Architect',
    sub: 'you think in infrastructure, not products',
    desc: 'You\'re not investing in what Trove is today. You\'re investing in what it makes inevitable — the behavioural layer that sits under hiring, dating, insurance, healthcare. You\'ve backed platforms before and you understand that the moat is the dataset, not the app.',
    together: 'You\'ll want to talk about the API strategy and B2B licensing before anyone else brings it up. <strong>We\'re ready for that conversation.</strong>',
    implication: 'You\'ll want to talk about API strategy before anyone else brings it up. We\'re ready for that conversation.',
    traits: ['Systems', 'Infrastructure', 'Platform'],
    insight: 'You think in what this makes inevitable — not what it is today.',
    highlights: [
      { head: 'You think in infrastructure.', body: 'You\'re not investing in Trove today. You\'re investing in what it makes inevitable — the behavioral layer under hiring, dating, healthcare.' },
      { head: 'You saw the dataset is the moat.', body: 'Not the app. Not the UX. The compounding behavioral data that a competitor can\'t shortcut with GPUs.' },
      { head: 'You asked about B2B before anyone mentioned it.', body: 'The API licensing question. You got there yourself. That\'s systems thinking.' },
    ],
  },
  operator: {
    name: 'The Operator',
    sub: 'you\'ve built something, and it shows',
    desc: 'You read the founder before you read the deck. You know what a person looks like when they\'re building from genuine obsession versus building to exit. You add more than capital — pattern recognition, intros, the three sentences that fix the pitch. Your portfolio companies call you on hard days.',
    together: 'You\'ll probably spot something in Helen\'s approach that she hasn\'t articulated yet. <strong>Tell her. She wants to hear it.</strong>',
    implication: 'You\'ll spot something in Helen\'s approach she hasn\'t named yet. Tell her. She wants to hear it.',
    traits: ['Builder', 'Pattern Recognition', 'Hands-On'],
    insight: 'You read founders. You knew what you were looking at before the deck ended.',
    highlights: [
      { head: 'You read the founder before the deck.', body: 'You know what obsession looks like vs. what exit-planning looks like. You spotted which one this was early.' },
      { head: 'You add more than capital.', body: 'Pattern recognition, intros, the three sentences that fix the pitch. Your portfolio companies call you on hard days.' },
      { head: 'You\'ll spot something Helen hasn\'t named yet.', body: 'And she wants to hear it. That\'s not flattery — it\'s how this kind of operator relationship works.' },
    ],
  },
  storyteller: {
    name: 'The Storyteller',
    sub: 'you back things people will talk about',
    desc: 'You understand that the best consumer products are also cultural moments — they spread because they mean something. You\'ve backed companies before the market understood them because you could see the narrative before the numbers justified it. Trove is a story about what it means to actually know someone.',
    together: 'You\'ll have opinions on the product voice, the community, the cultural positioning. <strong>Those opinions are valuable. Bring them.</strong>',
    implication: 'You\'ll have opinions on the voice, the community, the cultural positioning. Those opinions are valuable. Bring them.',
    traits: ['Cultural', 'Narrative', 'Contrarian'],
    insight: 'You see the story before the numbers justify it. That\'s the whole game.',
    highlights: [
      { head: 'You saw the cultural moment.', body: 'Before the numbers justified it, you could see the narrative. That\'s what makes you interesting to Trove.' },
      { head: 'You back things people talk about.', body: 'The best consumer products are also cultural events. You\'ve seen that before. You\'re seeing it again.' },
      { head: 'You have opinions on the voice.', body: 'The product copy, the community tone, the positioning. Those opinions are valuable. Bring them.' },
    ],
  },
};
