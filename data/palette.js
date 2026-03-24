// design system palette constants
// gold (#DBD59C), cool blue (#88ABE3), echo blue (#C3D9FF), light yellow (#FFFBCD)
// stat cards alternate through them, ring wipes cycle, burst particles pick randomly

export const RING_COLORS = ['#DBD59C', '#88ABE3', '#C3D9FF', '#FFFBCD'];

export const STAT_COLORS = [
  { bg: '#DBD59C', fg: '#88ABE3' },  // gold → cool blue text
  { bg: '#88ABE3', fg: '#FFFBCD' },  // cool blue → light yellow text
  { bg: '#C3D9FF', fg: '#222222' },  // echo blue → anchor text
  { bg: '#FFFBCD', fg: '#88ABE3' },  // light yellow → cool blue text
];

// each key maps to a vibe — used in assetBurst() calls throughout the branches
export const BURST_SETS = {
  celebrate: ['babystar.png', 'starhehe.png', 'flower.png', 'icecream.png', 'coin.png'],
  data:      ['id.png', 'camera.png', 'watch.png', 'apple.png', 'lightbulb.png'],
  viral:     ['banana.png', 'boomerand.png', 'bubbleblower.png', 'phone.png', 'headphones.png'],
  moat:      ['house.png', 'frog.png', 'bread.png', 'turtle.png', 'socks.png'],
  founder:   ['mic.png', 'gaming.png', 'caterpillar.png', 'flower.png', 'babystar.png'],
};
