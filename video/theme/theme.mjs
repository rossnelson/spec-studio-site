// Critter: the Spec Studio site's paper, ink and serif, with the critter from
// the logo in a pose for each card. A scene names its pose with
// `card: { critter: 'plan' }` (critters/plan.webp). The project sets
// `options.base`, the URL of this folder on the page it records.
export default {
  name: 'critter',
  description: 'The Spec Studio site: warm paper, Source Serif, and the crayon critter in a pose for each card.',
  colors: {
    bg: '#f6f1e6',      // the site's paper
    text: '#1b1c20',    // ink
    muted: '#4d4a45',   // ink-soft
    accent: '#b37a3a',  // tan
    sky: '#2f6f95',     // sky-ink, the step number
    rule: 'rgba(27, 28, 32, 0.55)',
  },
  fonts: {
    serif: '"Source Serif 4 Critter", "Iowan Old Style", Georgia, serif',
    mono: '"IBM Plex Mono Critter", "SF Mono", Menlo, monospace',
  },
  pad: '#f6f1e6',
  // The cards animate from one card to the next themselves (demo-video-tool's
  // handover): the words and the critter change, the paper stays.
  handover: true,
  options: { base: '' },
};
