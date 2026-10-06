// Wake Lord Beerus five times and this happens: the site turns to purple dust
// and he floats around, furious, until somebody refreshes.

import { PALETTE, paintRows } from "terminal/beerus"

const WIDTH = 34
const HEIGHT = 46

const FLOAT = [
  "..................................",
  "...o..........................o...",
  "..opo........................opo..",
  "..oqpo......................opqo..",
  "...oPpo....................opqo...",
  "...oPQpoo................oopQqo...",
  "...oqPQppo..............oppQPqo...",
  "....oPQQPpo............opPQQYYo...",
  "....oqPQQPpoo........oopPQQPyyo...",
  ".....oPQQQQppo......oppQQQQqoo....",
  ".....oPPQQQQPpoooooopPQQQQPqo.....",
  ".....oqPQQQQQPppppppPQQQQQPqo.....",
  "......oPPQQQQPPPPPPPPQQQQPqo......",
  "......oqPQkQPPPPPPPPPPQQkPqo......",
  ".......oPPQkkPPPPPPPPPkkPqo.......",
  ".......oqPPYYkkPPPPPkkYYPqo.......",
  "........oqPYYkPPPPPPPkYYqo........",
  ".........oPPPPPPPPPPPPPqo.........",
  ".........oqPPPPPPPPPPPPqqo........",
  "..........oqPPPPPkPPPPqqo.........",
  ".o.........oqPPPkPkPPqoo..........",
  "opo.........oPPkPkPkqo............",
  "oqpo.......omMPwPPPwnoo...........",
  ".oPpo.....omMMMMMMMMMmmo..........",
  ".oPqo...oomMMMMMMMMMMMMmo.........",
  ".oPqo..ommMMMMMMMMMMMMMMmo........",
  ".oPqo..oMMMmmmmmmmmmmmmMMmo.......",
  "opPqooommmmMMMMMMMMMMPPPmmmoo.....",
  "oPqooNmMMMPPPMMMMMMMMPPPMMMmNo....",
  "oPqo.oNNMMPPPMMMMMMMMPPqMMNNo.....",
  "oPqo..oMNNNNqNNNNNNNNNNNNNno......",
  "oPqo..oMMMMMMMMMMMMMMMMMMMno......",
  "oPqo..oMMMMMMMMMMMMMMMMMMMno......",
  "oqPpo.oMMMMMMMMMMMMMMMMMMMno......",
  ".oPqo.oMMMMMMMMMnMMMMMMMMMno......",
  ".oqPpomMMMMMMMMMnMMMMMMMMMMmo.....",
  "..oqPpMMMMMMMMMMMnMMMMMMMMMno.....",
  "...oqqMMMMMMMMMMMnMMMMMMMMMno.....",
  "....ooMMMMMMMMMMMMMMMMMMMMMno.....",
  ".....onnnnnnMMMnnnnMMMnnnnnno.....",
  "......oooooopPqoooopPqoooooo......",
  "...........oPPqo..oPPqo...........",
  "...........oPPqo..oPPqo...........",
  "...........oqqqo..oqqqo...........",
  "............ooo....ooo............",
  ".................................."
]

// Drawn over FLOAT. A space keeps the pixel underneath, a dot clears it.
const FLOAT_PATCHES = {
  tailRight: { x: 0, y: 20, rows: [
    " .                              o ",
    "...                            opo",
    "....                          opqo",
    " ....                        opqo ",
    " ....                        oPqo ",
    " ....                        oPqo ",
    " ....                        oPqo ",
    ".....                        oqPpo",
    "....                          oPqo",
    "....                          oPqo",
    "....                          oPqo",
    "....                          oPqo",
    "....                          oPqo",
    ".....                        opPqo",
    " ....                        oPqo ",
    " ....                        pPqo ",
    "  ...o                     MpPqo  ",
    "   ..o                     Mqqo   ",
    "    .                        o    "
  ] },
  shout: { x: 14, y: 20, rows: [
    "kwdddwk",
    " drrrd ",
    " kkkkk "
  ] }
}

const RANTS = [
  "hakai.",
  "who woke me?!",
  "I was SLEEPING.",
  "refresh. now.",
  "this website is gone. deal with it.",
  "five more minutes. was that so hard?",
  "...where's my pudding?"
]
const MOTE_COLORS = [ "#bb9af7", "#c4a2e6", "#ff007c", "#ffffff", "#7dcfff" ]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

export class AngryBeerus {
  // `from` is where the sleeping Beerus was, so he rises from his nap spot.
  constructor(layer, from) {
    this.layer = layer
    this.reducedMotion = reducedMotion()
    this.scale = window.innerWidth < 640 ? 2 : 3
    this.size = { w: WIDTH * this.scale, h: HEIGHT * this.scale }

    this.el = document.createElement("div")
    this.el.className = "angry-beerus angry-beerus--rise"
    this.canvas = document.createElement("canvas")
    this.canvas.width = WIDTH
    this.canvas.height = HEIGHT
    this.canvas.style.width = `${this.size.w}px`
    this.canvas.title = "Lord Beerus (awake. very awake.)"
    this.ctx = this.canvas.getContext("2d")
    this.el.appendChild(this.canvas)
    this.el.addEventListener("click", () => this.yell())
    this.layer.appendChild(this.el)

    this.x = Math.min(window.innerWidth - this.size.w - 8, Math.max(8, from.left + from.width / 2 - this.size.w / 2))
    this.y = Math.min(window.innerHeight - this.size.h - 8, Math.max(8, from.bottom - this.size.h))
    this.dir = 1
    this.tail = -1
    this.shouting = true
    this.roaming = false
    this.timers = new Set()

    this.draw()
    this.say("HAKAI!!", 2200)
    this.goal = { x: this.x, y: Math.max(16, this.y - 90) }

    this.tick = this.tick.bind(this)
    this.lastT = performance.now()
    this.raf = requestAnimationFrame(this.tick)
    if (!this.reducedMotion) this.every(380, () => this.swish())
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.timers.forEach((id) => { clearTimeout(id); clearInterval(id) })
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
  }

  draw() {
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
    paintRows(this.ctx, FLOAT, 0, 0, true)
    if (this.tail > 0) paintRows(this.ctx, FLOAT_PATCHES.tailRight.rows, FLOAT_PATCHES.tailRight.x, FLOAT_PATCHES.tailRight.y)
    if (this.shouting) paintRows(this.ctx, FLOAT_PATCHES.shout.rows, FLOAT_PATCHES.shout.x, FLOAT_PATCHES.shout.y)
  }

  swish() {
    this.tail = -this.tail
    this.draw()
  }

  // Called once the site is gone: from now on he roams and rants.
  roam() {
    this.roaming = true
    this.shouting = false
    this.el.classList.remove("angry-beerus--rise")
    this.draw()
    this.rantLater()
    if (!this.reducedMotion) this.every(260, () => this.spark())
  }

  rantLater() {
    this.later(rand(4500, 8000), () => {
      this.shout(pick(RANTS))
      this.rantLater()
    })
  }

  shout(text, ms = 2000) {
    this.shouting = true
    this.draw()
    this.say(text, ms)
    this.later(700, () => {
      this.shouting = false
      this.draw()
    })
  }

  yell() {
    this.shout(pick([ "YOU AGAIN?!", "don't. touch. me.", "HAKAI. (you're lucky I'm tired)" ]))
    document.body.classList.remove("hakai-shake")
    void document.body.offsetWidth
    document.body.classList.add("hakai-shake")
  }

  say(text, ms = 2000) {
    this.layer.querySelectorAll(".angry-beerus__say").forEach((old) => old.remove())
    const bubble = document.createElement("div")
    bubble.className = "angry-beerus__say"
    bubble.textContent = text
    this.bubble = bubble
    this.layer.appendChild(bubble)
    this.placeBubble()
    this.later(ms, () => bubble.remove())
  }

  // Keep the speech bubble over his head, but never off-screen.
  placeBubble() {
    if (!this.bubble?.isConnected) return
    const half = this.bubble.offsetWidth / 2
    const center = this.x + this.size.w / 2
    this.bubble.style.left = `${Math.min(window.innerWidth - half - 4, Math.max(half + 4, center))}px`
    this.bubble.style.top = `${Math.max(this.bubble.offsetHeight + 4, this.y - 6)}px`
  }

  spark() {
    const mote = document.createElement("div")
    mote.className = "hakai-mote"
    mote.style.color = pick(MOTE_COLORS)
    mote.style.left = `${this.x + rand(0.2, 0.8) * this.size.w}px`
    mote.style.top = `${this.y + rand(0.15, 0.9) * this.size.h}px`
    mote.style.setProperty("--dx", `${rand(-24, 24)}px`)
    mote.style.setProperty("--dy", `${rand(-60, -20)}px`)
    this.layer.appendChild(mote)
    this.later(1500, () => mote.remove())
  }

  tick(t) {
    const dt = Math.min(0.05, (t - this.lastT) / 1000)
    this.lastT = t

    if (this.roaming && !this.reducedMotion && (!this.goal || this.arrived)) {
      const margin = 12
      this.goal = {
        x: rand(margin, Math.max(margin, window.innerWidth - this.size.w - margin)),
        y: rand(margin, Math.max(margin, window.innerHeight - this.size.h - margin))
      }
      this.arrived = false
    }
    if (this.goal && !this.arrived) this.step(dt, this.roaming ? 70 : 140)

    const bob = this.reducedMotion ? 0 : Math.sin(t / 260) * 4
    this.el.style.transform = `translate(${this.x}px, ${this.y + bob}px) scaleX(${this.dir})`
    this.placeBubble()
    this.raf = requestAnimationFrame(this.tick)
  }

  step(dt, speed) {
    if (this.reducedMotion) {
      this.x = this.goal.x
      this.y = this.goal.y
      this.arrived = true
      return
    }
    const dx = this.goal.x - this.x
    const dy = this.goal.y - this.y
    const dist = Math.hypot(dx, dy)
    if (Math.abs(dx) > 2) this.dir = dx < 0 ? -1 : 1
    const move = speed * dt
    if (dist <= move) {
      this.x = this.goal.x
      this.y = this.goal.y
      this.arrived = true
      return
    }
    this.x += (dx / dist) * move
    this.y += (dy / dist) * move
  }
}

// Turns every visible piece of `target` into purple dust, then fades the rest of the scene.
export async function hakaiSite({ root, target, layer }) {
  const quick = reducedMotion()
  document.title = "hakai'd // donce.dev"

  const flash = document.createElement("div")
  flash.className = "hakai-flash"
  root.appendChild(flash)
  if (!quick) target.classList.add("hakai-shake")
  await sleep(quick ? 0 : 650)

  target.classList.add("hakai-aura")
  await sleep(quick ? 0 : 600)

  const pieces = [ ...target.querySelectorAll(".term__bar, .term__banner, .term__log .term__line, .term__input-line, .term__chip") ]
  const visible = pieces.filter((el) => {
    const r = el.getBoundingClientRect()
    return r.width && r.height && r.bottom > 0 && r.top < window.innerHeight
  })
  const totalArea = visible.reduce((sum, el) => {
    const r = el.getBoundingClientRect()
    return sum + r.width * r.height
  }, 0)
  const budget = quick ? 0 : (window.innerWidth < 640 ? 260 : 560)

  pieces.forEach((el) => {
    if (!visible.includes(el)) {
      el.style.visibility = "hidden"
      return
    }
    const r = el.getBoundingClientRect()
    const motes = Math.max(2, Math.round(budget * (r.width * r.height) / totalArea))
    setTimeout(() => crumble(el, r, layer, quick ? 0 : motes), quick ? 0 : rand(0, 1300))
  })
  target.querySelectorAll(".term__answer, .term__chips").forEach((el) => el.classList.add("hakai-fade"))

  await sleep(quick ? 0 : 1700)
  target.classList.add("hakai-gone")
  root.classList.add("term--erased")
  await sleep(quick ? 0 : 1000)
  target.style.visibility = "hidden"
  flash.remove()
  showVoid(root)
}

function crumble(el, rect, layer, motes) {
  for (let i = 0; i < motes; i++) {
    const mote = document.createElement("div")
    mote.className = "hakai-mote"
    mote.style.color = pick(MOTE_COLORS)
    mote.style.left = `${rect.left + Math.random() * rect.width}px`
    mote.style.top = `${rect.top + Math.random() * rect.height}px`
    mote.style.setProperty("--dx", `${rand(-40, 40)}px`)
    mote.style.setProperty("--dy", `${rand(-150, -40)}px`)
    mote.style.animationDuration = `${rand(0.9, 1.8).toFixed(2)}s`
    layer.appendChild(mote)
    setTimeout(() => mote.remove(), 2000)
  }
  el.classList.add("hakai-crumble")
}

function showVoid(root) {
  const message = document.createElement("div")
  message.className = "term__void"
  message.setAttribute("role", "status")
  message.innerHTML = `
    <p>donce.dev was erased by Lord Beerus.</p>
    <p><button type="button" class="term__void-button">refresh</button> to restore</p>
  `
  message.querySelector("button").addEventListener("click", () => window.location.reload())
  root.appendChild(message)
}
