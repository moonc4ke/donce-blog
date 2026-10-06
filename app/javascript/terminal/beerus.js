// Lord Beerus, god of destruction, napping in the corner in his pyjamas.
// Hand-placed pixels. Do not wake him. Definitely not five times.

export const PALETTE = {
  o: "#1b1226", P: "#a37ccb", p: "#c4a2e6", q: "#7b56a6", Q: "#5a3a82",
  M: "#b3e4df", m: "#d8f6f1", n: "#80bfba", N: "#5b9b98",
  Y: "#e8bd45", y: "#a57a1d", k: "#26142f", w: "#ffffff", r: "#e886b1", d: "#3b0d1e",
  b: "#bfefff", c: "rgba(191, 239, 255, 0.28)"
}

// Paints char rows onto a canvas. A space keeps the pixel underneath; a dot clears it,
// unless skipEmpty is set, then dots are left alone too.
export function paintRows(ctx, rows, ox, oy, skipEmpty = false) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === " " || (skipEmpty && ch === ".")) continue
      if (ch === ".") {
        ctx.clearRect(ox + x, oy + y, 1, 1)
        continue
      }
      ctx.fillStyle = PALETTE[ch]
      ctx.fillRect(ox + x, oy + y, 1, 1)
    }
  })
}

const WIDTH = 54
const HEIGHT = 30

const BASE = [
  "......................................................",
  "........................o..........................o..",
  ".......................opo........................opo.",
  ".......................oqpo......................opqo.",
  "........................oPpo....................opqo..",
  "........................oPQpoo................oopQqo..",
  "........................oqPQppo..............oppQPqo..",
  ".........................oPQQPpo............opPQQYYo..",
  "......oo.................oqPQQPpoo........oopPQQPyyo..",
  "....ooppo.................oPQQQQppo......oppQQQQqoo...",
  "...oppPqpo................oPPQQQQPpoooooopPQQQQPqo....",
  "..opPqqoPpo...............oqPQQQQQPppppppPQQQQQPqo....",
  "..oPqoooqqo................oPPQQQQPPPPPPPPQQQQPqo.....",
  ".opPqo..oqo................oqPQQQPPPPPPPPPPQQQPqo.....",
  ".oPqo....o..................oPPQPPPPPPPPPPPPQPqo......",
  ".oPqo.......................oqPkQQQPPPPPPPQQQkqo......",
  ".oPqo....................oooooqPkPPkPPPPPkPPkqo.......",
  ".oqqo.................ooommmmooPPkkPPPPPPPkkqo........",
  "..oPpo........oooo...ommmMMMMmmqPPPPPPPPPPPPqqo.......",
  "..oPqoo...oooommmmooomMMMMMMMMMMqPPPPqkqPPPqqo........",
  "..oqqppooommmmMMMMmmmMMMMMMMMMMMMPPPPPkPPPqoo.........",
  "...ooqPpmmMMMMMMMMMMMMnMMMMMMMMMMMPPPkPkPqo...........",
  ".....oPMMMMMMMMMMMMMMMMnMMMMMnMMMMMqPPPwqqo...........",
  "...ooomMMMMMMMnMMMMMMMMnMMMMMMnMMMMMMMMMMmmoooo.......",
  "..oppmMMMMMMMMMnMMMMMMMnMMMMMMMPPPPPMMMMPPPppmmo......",
  ".opPMMMMMMMMMMMnMMMMMMMMMMMMMMMPqPqPMMMMPPqPqMMmo.....",
  "..oPMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMno.....",
  "...ooooooooooooooooooooooooooooooooooooooooooooo......",
  "......................................................",
  "......................................................"
]

// Drawn over BASE. A space keeps the pixel underneath, a dot clears it.
const PATCHES = {
  inhale: { x: 5, y: 15, rows: [
    "                    ooo   ",
    "                  oommmm P",
    "         oooo   o mmMMMMmM",
    "     oooommmmooom MM    MM",
    "   oommmmMMMMmmmM         ",
    "   mmMMMM    MMM          ",
    "  mMM                     ",
    " m                        ",
    "mM                        ",
    "M                         "
  ] },
  tailLeft: { x: 1, y: 8, rows: [
    "    o .   ",
    "  o p o.  ",
    " op Pqpo. ",
    "  Pq oPpo.",
    "opqo  q o.",
    " Pqo. oqo.",
    "       o. "
  ] },
  tailRight: { x: 1, y: 8, rows: [
    "     . o   ",
    "   . o po  ",
    "  .o pPqpo ",
    " .opP qoPpo",
    "  pPq  o qo",
    ".o     .oqo",
    ".oPqo   .o ",
    " p         "
  ] },
  twitch: { x: 23, y: 1, rows: [
    " .         ",
    "...        ",
    "....       ",
    " ..o       ",
    " .op  .    ",
    " .oq  o    ",
    "  .oP p    ",
    "  .o      .",
    "    qP  P o",
    "   .o     p",
    "   .o      ",
    "     q     ",
    "    .o     "
  ] },
  awake: { x: 41, y: 15, rows: [
    "Q     ",
    " YYYk ",
    "kY Yko",
    "   P  "
  ] },
  furious: { x: 31, y: 15, rows: [
    "    Q     Q     ",
    "kYYY       YYYk ",
    "kY Yk     kY Yko",
    "             P  "
  ] }
}

// Snot bubble sizes, then the pop. Anchored just right of the nose.
const BUBBLES = [
  [
    ".b.",
    "bcb",
    ".b."
  ],
  [
    ".bbb.",
    "bwccb",
    "bcccb",
    "bcccb",
    ".bbb."
  ],
  [
    "..bbb..",
    ".bwccb.",
    "bwccccb",
    "bcccccb",
    "bcccccb",
    ".bcccb.",
    "..bbb.."
  ],
  [
    "..bbbbb..",
    ".bwwcccb.",
    "bwccccccb",
    "bcccccccb",
    "bcccccccb",
    "bcccccccb",
    "bcccccccb",
    ".bcccccb.",
    "..bbbbb.."
  ]
]
const POP = [
  "b...b",
  ".b.b.",
  ".....",
  ".b.b.",
  "b...b"
]
const NOSE = { x: 39, y: 18 }

const TICK = 340
const RAGE_AT = 5
const GRUMBLES = [
  [ "...hakai.", "who dares.", "five more minutes. hakai." ],
  [ "I said five more minutes.", "again?!", "do you have a death wish?" ],
  [ "I'm warning you, mortal.", "my patience is NOT infinite." ],
  [ "one more time and this website is GONE.", "last warning." ]
]

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

export class Beerus {
  constructor({ onHakai, onRage }) {
    this.onHakai = onHakai
    this.onRage = onRage
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    this.el = document.createElement("div")
    this.el.className = "beerus"
    this.canvas = document.createElement("canvas")
    this.canvas.width = WIDTH
    this.canvas.height = HEIGHT
    this.canvas.title = "Lord Beerus (sleeping)"
    this.ctx = this.canvas.getContext("2d")
    this.el.appendChild(this.canvas)
    this.el.addEventListener("click", (event) => {
      event.stopPropagation()
      this.wake()
    })

    this.state = { inhale: false, tail: 0, twitch: false, awake: false, furious: false, bubble: 1 }
    this.phase = 0
    this.bubbleOff = false
    this.anger = 0
    this.timers = new Set()

    this.draw()
    if (!this.reducedMotion) {
      this.every(TICK, () => this.breathe())
      this.every(2300, () => this.snore())
      this.twitchLater()
    }
  }

  destroy() {
    this.timers.forEach((id) => { clearTimeout(id); clearInterval(id) })
    this.timers.clear()
    this.el.remove()
  }

  every(ms, fn) {
    this.timers.add(setInterval(fn, ms))
  }

  later(ms, fn) {
    const id = setTimeout(() => {
      this.timers.delete(id)
      fn()
    }, ms)
    this.timers.add(id)
    return id
  }

  cancel(id) {
    clearTimeout(id)
    this.timers.delete(id)
  }

  // ---- rendering ----

  draw() {
    const { inhale, tail, twitch, awake, furious, bubble } = this.state
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
    paintRows(this.ctx, BASE, 0, 0, true)
    if (inhale) this.paintPatch(PATCHES.inhale)
    if (tail < 0) this.paintPatch(PATCHES.tailLeft)
    if (tail > 0) this.paintPatch(PATCHES.tailRight)
    if (twitch) this.paintPatch(PATCHES.twitch)
    if (awake) this.paintPatch(PATCHES.awake)
    if (furious) this.paintPatch(PATCHES.furious)
    if (bubble === "pop") paintRows(this.ctx, POP, NOSE.x, NOSE.y, true)
    else if (bubble > 0) paintRows(this.ctx, BUBBLES[bubble - 1], NOSE.x, NOSE.y, true)
  }

  paintPatch({ x, y, rows }) {
    paintRows(this.ctx, rows, x, y)
  }

  // ---- sleeping ----

  // Eight ticks per breath: exhale inflates the bubble, inhale lifts the back and shrinks it.
  breathe() {
    if (this.state.awake) return
    const phase = this.phase = (this.phase + 1) % 8
    const exhaling = phase < 4

    this.state.inhale = !exhaling

    // After a pop the bubble stays gone until the next breath starts.
    if (this.state.bubble === "pop") this.bubbleOff = true
    if (this.bubbleOff && phase === 0) this.bubbleOff = false

    if (this.bubbleOff) this.state.bubble = 0
    else if (phase === 3 && Math.random() < 0.18) this.state.bubble = "pop"
    else this.state.bubble = exhaling ? phase + 1 : 8 - phase

    if (Math.random() < 0.14) {
      const tail = this.state.tail
      this.state.tail = tail === 0 ? pick([ -1, 1 ]) : 0
    }
    this.draw()
  }

  snore() {
    if (this.state.awake || document.hidden) return
    const z = document.createElement("span")
    z.className = "beerus__z"
    z.textContent = Math.random() < 0.6 ? "z" : "Z"
    z.style.left = `${rand(64, 76)}%`
    z.style.fontSize = `${rand(0.8, 1.35).toFixed(2)}em`
    this.el.appendChild(z)
    this.later(2600, () => z.remove())
  }

  twitchLater() {
    this.later(rand(5000, 11000), () => {
      if (!this.state.awake) this.flick(4)
      this.twitchLater()
    })
  }

  flick(times) {
    if (!times || this.state.awake) {
      this.state.twitch = false
      this.draw()
      return
    }
    this.state.twitch = !this.state.twitch
    this.draw()
    this.later(90, () => this.flick(times - 1))
  }

  // ---- do not wake ----

  // Every wake makes him angrier. The fifth one erases the website.
  // Returns the anger level so callers can react to it.
  wake() {
    if (this.raging) return this.anger
    this.anger++
    if (this.anger >= RAGE_AT) {
      this.rage()
      return this.anger
    }

    const wasAwake = this.state.awake
    this.state = {
      inhale: false, tail: 0, twitch: false, awake: true,
      furious: this.anger > 1,
      bubble: !wasAwake && this.state.bubble ? "pop" : 0
    }
    this.el.classList.toggle("beerus--annoyed", this.anger >= 3)
    this.draw()
    this.say(pick(GRUMBLES[this.anger - 1]))
    this.later(500, () => this.onHakai?.())
    if (!wasAwake) {
      this.later(180, () => {
        this.state.bubble = 0
        this.draw()
      })
    }

    this.cancel(this.sleepTimer)
    this.sleepTimer = this.later(2000 + this.anger * 500, () => this.fallAsleep())
    return this.anger
  }

  fallAsleep() {
    this.state.awake = false
    this.state.furious = false
    this.bubbleOff = true
    this.el.classList.remove("beerus--annoyed")
    this.draw()
    this.snore()
  }

  rage() {
    this.raging = true
    this.timers.forEach((id) => { clearTimeout(id); clearInterval(id) })
    this.timers.clear()
    this.state = { inhale: false, tail: 0, twitch: false, awake: true, furious: true, bubble: 0 }
    this.el.classList.add("beerus--annoyed")
    this.draw()
    this.say("HAKAI!!")
    this.onRage?.(this.el.getBoundingClientRect())
  }

  say(text) {
    this.el.querySelectorAll(".beerus__say").forEach((old) => old.remove())
    const bubble = document.createElement("div")
    bubble.className = "beerus__say"
    bubble.textContent = text
    this.el.appendChild(bubble)
    this.later(2000, () => bubble.remove())
  }
}
