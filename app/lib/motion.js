/**
 * Shared motion variants.
 *
 * Every animated element in the dashboard uses these, so the whole page moves
 * with one vocabulary instead of each section inventing its own timing.
 *
 * Variants propagate through React context: a group sets the rhythm and any
 * `rise` descendant picks it up, which is why list items animate without the
 * organisms having to pass anything down.
 *
 * These are plain constants on purpose. Deriving them from a reduced-motion
 * hook made the rendered markup depend on a media query the server cannot
 * read — a reduced-motion visitor got translateY from the server and none on
 * the client, which is a hydration mismatch. Reduced motion is handled once
 * instead, by <MotionConfig reducedMotion="user"> in Stagger, which drops
 * transforms at the animation layer and leaves the markup identical.
 *
 * Everything animates `opacity`, `transform` and `box-shadow` only. Those are
 * composited on the GPU, so the page holds 60fps while a dozen elements move
 * at once — animating height, top or margin instead would force layout on
 * every frame and judder.
 */

/**
 * The house spring. Tuned to settle without a visible bounce: high enough
 * damping that nothing wobbles, low enough stiffness that it glides rather
 * than snaps. Springs read smoother than a fixed duration because their
 * velocity carries over when a hover interrupts an entrance mid-flight.
 */
export const spring = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.9,
};

/**
 * A slower, softer spring for the project timeline. The stepper is the one
 * place people watch rather than glance at — progress is the story the card
 * is telling — so its nodes take their time settling instead of snapping.
 */
export const springSlow = {
  type: 'spring',
  stiffness: 120,
  damping: 24,
  mass: 1.1,
};

/** A quicker spring for touch feedback, which has to feel immediate. */
export const springFast = {
  type: 'spring',
  stiffness: 420,
  damping: 26,
  mass: 0.7,
};

/**
 * One section arriving: rises and fades.
 *
 * No scale, deliberately — the same reasoning `journeyItem` already records,
 * but it bites harder here. A section is a whole row, and the widest of them
 * carries a 36px-blur purple shadow. Scaling that resamples the blur on every
 * frame, which banded into a visible seam along the hero's bottom edge as the
 * row settled. Translation moves the shadow as one piece and leaves it crisp.
 */
export const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring },
};

/**
 * `rise` with a delay it can carry through `custom`. Same distance and same
 * spring, so a card that waits its turn travels exactly like one that does
 * not — only its start time differs.
 *
 * Needed because cards sitting side by side in a grid all cross the viewport
 * threshold on the same frame: without a per-card offset, `whileInView` fires
 * them simultaneously and the row arrives as one block.
 */
export const riseDelayed = {
  hidden: { opacity: 0, y: 14 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring, delay },
  }),
};

/**
 * A container that releases its children in sequence. Sections use the
 * default; lists inside a card run tighter, so a card's contents finish
 * settling at about the same time as the card itself.
 */
export const group = (stagger = 0.07) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: 0.04 } },
});

/**
 * Hover and press for a card-sized target. Lives here rather than in CSS
 * because Motion writes inline transforms, which a Tailwind `hover:-translate`
 * cannot override.
 */
export const liftCard = {
  whileHover: { y: -4, scale: 1.012, transition: spring },
  whileTap: { scale: 0.985, transition: springFast },
};

/** The same idea at chip scale, where a 4px lift would be too much. */
/**
 * The stage callout: a wide, low panel, so it lifts less than a card would —
 * a 4px rise on something this broad reads as the whole band detaching.
 * Children opt in by declaring their own `hover` variant.
 *
 * Translation only, deliberately. Scale grows a panel from its centre, so the
 * text inside creeps away from the edges instead of travelling with them —
 * on something this wide that reads as the label sliding on its own rather
 * than the whole chip moving. It also resamples the text every frame, which
 * softens it. A rigid lift keeps the panel one object and the type crisp.
 */
/** The callout's arrow, pulled along when the panel is hovered. */
export const nudgeArrow = {
  hover: { x: 4, transition: spring },
};

/**
 * A timeline node. `show` is a function so each dot can carry its own delay
 * through the parent's `custom` prop — the row builds left to right, and a
 * single shared variant could not express six different start times.
 *
 * The lift lives here rather than in CSS because Motion owns this element's
 * inline `transform` for the entrance; a Tailwind hover:-translate would be
 * written and then immediately overwritten.
 */
export const stepNode = {
  hidden: { scale: 0.5, opacity: 0 },
  show: (delay = 0) => ({
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { ...springSlow, delay },
  }),
  hover: { y: -4, scale: 1.1, transition: spring },
};

/**
 * The checkmark on a completed node, stroked on rather than popped in. Timed
 * to land just after its dot arrives, so the tick draws at the moment the eye
 * is already on that node.
 *
 * No `hover` key on purpose: the step wrapper broadcasts "hover" to every
 * descendant, and a tick that redrew itself on every pass of the mouse would
 * be noise. Leaving it out means Motion holds the drawn state.
 */
export const tickDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (delay = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeOut', delay: delay + 0.22 },
      opacity: { duration: 0.01, delay: delay + 0.22 },
    },
  }),
};

/**
 * The pathway journey: one stage arriving. `show` is a function so each stage
 * carries its own delay through the parent's `custom` prop, which is what
 * turns seven independent fades into a route being traced.
 *
 * The item only fades and rises — it holds the stage title and description,
 * and scaling type resamples it every frame. The disc is the piece that
 * scales, because it carries an icon and nothing else.
 */
export const journeyItem = {
  hidden: { opacity: 0, y: 10 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...springSlow, delay },
  }),
};

export const journeyDisc = {
  hidden: { scale: 0.4, opacity: 0 },
  show: (delay = 0) => ({
    scale: 1,
    opacity: 1,
    transition: { ...springSlow, delay: delay + 0.04 },
  }),
  // Hover stays on the quick spring: a pointer response has to feel immediate
  // even when the entrance around it is deliberately slow.
  hover: { y: -5, scale: 1.12, transition: spring },
};

/** The connector between two stages, stroked on once the stage has landed. */
export const journeyArrow = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (delay = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut', delay: delay + 0.18 },
      opacity: { duration: 0.01, delay: delay + 0.18 },
    },
  }),
};

/**
 * The journey's vertical connector, used once the column is too narrow
 * for the row and the stages stack. Grows from the top so it reads as the
 * route continuing downward, matching the way the horizontal arrows stroke
 * left to right — the same top-to-bottom draw on load and on tab switch.
 */
export const journeyRail = {
  hidden: { scaleY: 0, opacity: 0 },
  show: (delay = 0) => ({
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: delay + 0.18 },
  }),
};

/**
 * The journey's vertical connector, used once the row collapses to a single
 * column and the horizontal arrows no longer apply. Grows from the top so it
 * reads as the route continuing downward, matching the way the horizontal
 * arrows stroke left to right.
 */
/**
 * The role screen — the app's front door.
 *
 * `gate` fades the whole screen back as a role is chosen, so picking one
 * hands off to the dashboard instead of hard-cutting to it. The exit is
 * quicker than the entrance on purpose: arriving should feel unhurried,
 * leaving should feel like the app responding.
 */
export const gate = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.28, ease: 'easeIn' } },
};

/**
 * The front door's running order.
 *
 * Every element carries its own delay through `custom` rather than leaning on
 * staggerChildren. Nested staggers did not survive the trip down this tree —
 * the buttons sit two containers below the gate, and they rendered at full
 * opacity from the first frame while the prompt never started at all. An
 * explicit delay per element is the same pattern the stepper and the journey
 * already use, and it cannot silently skip a level.
 *
 * Tweens, not springs: a spring's opacity trails its position for over a
 * second, so elements overlapped instead of arriving one at a time.
 */
export const GATE_TIMES = {
  logo: 0.15,
  prompt: 0.55,
  firstButton: 0.95,
  // Tighter than the gap above it. The logo and the prompt are read, so they
  // get room; the buttons are one decision presented three ways, so they
  // arrive briskly as a set once the prompt has asked the question.
  betweenButtons: 0.16,
};

export const gateItem = {
  hidden: { opacity: 0, y: 14 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export const gateButton = {
  hidden: { opacity: 0, y: 12, scale: 0.94 },
  // Quicker than gateItem's 0.34s: these snap in rather than settle.
  // backgroundColor is declared here so hover has a defined colour to return
  // to — without it Motion animates away from the Tailwind class and has
  // nothing to come back to on mouse-out.
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    backgroundColor: '#7c3aed',
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1], delay },
  }),
  // The fill has to answer, not just the shadow. Lifting a solid button
  // without darkening it reads as unresponsive — the pointer is over the
  // thing and the thing looks unchanged. purple -> purple-700 is the same
  // step the dashboard's primary button takes, so the two agree.
  //
  // Tight and low on the shadow, not a halo: a wide, saturated purple glow on
  // a white card reads as a smudge under the button rather than the button
  // sitting above it.
  hover: {
    y: -2,
    backgroundColor: '#5b21b6',
    boxShadow: '0 8px 18px rgba(124,58,237,0.3)',
    transition: spring,
  },
  tap: { y: -1, scale: 0.98, transition: springFast },

  /**
   * The resting state once the entrance is over.
   *
   * `show` carries the entrance delay, and whileHover returns to whatever
   * `animate` points at — so with `show` as the resting state the button
   * waited out its own 0.95s delay before dropping back after the pointer
   * left. Identical values, no delay: the return is immediate.
   */
  rest: {
    opacity: 1,
    y: 0,
    scale: 1,
    backgroundColor: '#7c3aed',
    boxShadow: '0 3px 8px rgba(124,58,237,0.22)',
    transition: spring,
  },
};

/**
 * The sidebar rail introducing itself. Explicit delays again rather than
 * staggerChildren — the rail's children sit behind a `display: contents`
 * drawer on desktop, and a stagger cannot see through that.
 */
export const railItem = {
  hidden: { opacity: 0, x: -10 },
  show: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

/** Seconds between one nav row arriving and the next. */
export const RAIL_TIMES = { logo: 0.05, firstItem: 0.14, betweenItems: 0.06 };

/** The icon leads the label by a couple of pixels on hover. */
export const navIcon = { hover: { x: 2, transition: spring } };

/**
 * An element arriving on its own clock.
 *
 * Same shape as `journeyItem`, kept separate because it is the generic case:
 * anywhere a handful of elements inside one block should land in sequence,
 * they take this and carry their delay through `custom`. Used by the hero
 * header and the top bar.
 *
 * Explicit delays rather than staggerChildren, for the reason the rail and
 * the gate already document — these sit several containers below whatever
 * drives the page's entrance, and a stagger does not reach that far down.
 */
export const delayedRise = {
  hidden: { opacity: 0, y: 10 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring, delay },
  }),
};

/**
 * The hero header's running order. The eyebrow and title are one thought, so
 * they arrive together; the badge is a separate fact about the pathway, so it
 * waits and lands after the name it qualifies.
 */
export const HERO_TIMES = {
  eyebrow: 0.04,
  title: 0.1,
  badge: 0.26,
  description: 0.34,
};

/**
 * The hero artwork drifting under the pointer.
 *
 * Scale only, and only on the image layer — the wash and the scrim hold still
 * so the heading's contrast never changes mid-hover. 1.02 over a band this
 * wide is a few pixels of travel: enough to register as alive, small enough
 * that the mic does not visibly crop against the band's edge.
 *
 * Slower than the house spring on purpose. This is the largest surface on the
 * page; at card speed a full-bleed image reads as lurching.
 */
/** The top bar's running order: greeting, its line, then the date. */
export const TOPBAR_TIMES = { title: 0.02, subtitle: 0.1, date: 0.18 };

/**
 * Switching tabs. The outgoing view leaves before the incoming one starts —
 * AnimatePresence `mode="wait"` — so the two never overlap in the same space.
 *
 * Leaving is quicker than arriving and moves the opposite way: content lifts
 * out and the next view rises in, which reads as one view replacing another
 * rather than both fading in place.
 */
export const view = {
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};
