// A tiny green pixel goblin that floats around and eats letters.

const PALETTE = {
  o: "#13261a", g: "#9ece6a", G: "#6a9a3e", l: "#d2f5a0",
  w: "#ffffff", k: "#0d0f1a", p: "#f7768e", m: "#3b0d1e", a: "#e0af68"
}

const BASE = [
  ".......oo.......",
  "......oaao......",
  ".......oo.......",
  "........o.......",
  "....oooooooo....",
  "..oolllgggggoo..",
  ".olllgggggggggo.",
  ".olgwkkggwkkggo.",
  ".oggkkkggkkkggo.",
  ".oggkkkggkkkggo.",
  "oggpggggggggpggo",
  "ogggggmmmmgggggo",
  "oGggggggggggggGo",
  ".oGGggggggggGGo.",
  "..ooGGGGGGGGoo..",
  "....oooooooo...."
]

const frame = (patches) => BASE.map((row, i) => patches[i] ?? row)

const FRAMES = {
  idle: BASE,
  blink: frame({
    7: ".olgggggggggggo.",
    8: ".oggkkkggkkkggo.",
    9: ".oggggggggggggo."
  }),
  chomp: frame({
    11: "oggggmmmmmmggggo",
    12: "oGgggmppppmgggGo",
    13: ".oGGggmmmmggGGo."
  }),
  happy: frame({
    7: ".olggkggggkgggo.",
    8: ".oggkgkggkgkggo.",
    9: ".oggggggggggggo."
  })
}

// Pixel scale and mouth position (in CSS pixels) depend on screen size.
const spriteMetrics = () => {
  const scale = window.innerWidth < 640 ? 3 : window.innerWidth > 1400 ? 5 : 4
  return { scale, size: 16 * scale, mouth: { x: 7.5 * scale, y: 11.5 * scale } }
}

const SNACK_LINES = [ "nom.", "*burp*", "chookity!", "crunchy.", "mmm vowels", "pok pok", "needs more salt" ]
const PET_LINES = [ "hi :3", "chookity!", "pok?", "feed me letters", "i'm not a bug", "<3" ]
const FOOD = [ ";", "{}", "λ", "</>", "$", "#", "&&", "=>" ]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

export class Mooncake {
  constructor(layer, hooks) {
    this.layer = layer
    this.hooks = hooks
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    this.el = document.createElement("div")
    this.el.className = "critter"
    this.el.title = "the snack goblin"
    this.canvas = document.createElement("canvas")
    this.canvas.width = 16
    this.canvas.height = 16
    this.ctx = this.canvas.getContext("2d")
    this.el.appendChild(this.canvas)
    this.resize = () => {
      this.metrics = spriteMetrics()
      this.canvas.style.width = this.canvas.style.height = `${this.metrics.size}px`
    }
    this.resize()
    window.addEventListener("resize", this.resize)
    this.layer.appendChild(this.el)
    this.el.addEventListener("click", () => this.pet())

    this.x = window.innerWidth - this.metrics.size - 24
    this.y = window.innerHeight * 0.25
    this.dir = -1
    this.busy = false
    this.erased = false
    this.asleepUntil = 0
    this.lastInputSnack = 0
    this.wanderTarget = null
    this.nextWanderAt = 0
    this.currentFrame = null
    this.frameOverride = null

    this.draw("idle")
    this.blinkLoop()
    this.tick = this.tick.bind(this)
    this.lastT = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    clearTimeout(this.snackTimer)
    clearTimeout(this.blinkTimer)
    window.removeEventListener("resize", this.resize)
    this.el.remove()
  }

  // ---- rendering ----

  draw(name) {
    if (this.currentFrame === name) return
    this.currentFrame = name
    const rows = FRAMES[name]
    this.ctx.clearRect(0, 0, 16, 16)
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const color = PALETTE[row[x]]
        if (!color) continue
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, 1, 1)
      }
    })
  }

  setFrame(name) {
    this.frameOverride = name
    this.draw(name)
  }

  blinkLoop() {
    this.blinkTimer = setTimeout(async () => {
      if (!this.frameOverride) {
        this.draw("blink")
        await sleep(130)
        if (!this.frameOverride) this.draw("idle")
      }
      this.blinkLoop()
    }, rand(2500, 5500))
  }

  tick(t) {
    const dt = Math.min(0.05, (t - this.lastT) / 1000)
    this.lastT = t

    if (!this.busy && !this.erased && !this.reducedMotion && t > this.asleepUntil) this.wander(t, dt)
    if (this.moveGoal) this.stepToward(dt)

    const bob = this.reducedMotion ? 0 : Math.sin(t / 320) * 3
    this.el.style.transform = `translate(${this.x}px, ${this.y + bob}px) scaleX(${this.dir})`
    this.raf = requestAnimationFrame(this.tick)
  }

  wander(t, dt) {
    if (!this.wanderTarget || t > this.nextWanderAt) {
      const margin = 24
      this.wanderTarget = {
        x: rand(margin, Math.max(margin, window.innerWidth - this.metrics.size - margin)),
        y: rand(margin + 40, window.innerHeight * 0.7)
      }
      this.nextWanderAt = t + rand(3000, 7000)
    }
    this.moveStep(this.wanderTarget, 38, dt)
  }

  moveStep(goal, speed, dt) {
    const dx = goal.x - this.x
    const dy = goal.y - this.y
    const dist = Math.hypot(dx, dy)
    if (Math.abs(dx) > 2) this.dir = dx < 0 ? 1 : -1
    const step = speed * dt
    if (dist <= step) {
      this.x = goal.x
      this.y = goal.y
      return true
    }
    this.x += (dx / dist) * step
    this.y += (dy / dist) * step
    return false
  }

  stepToward(dt) {
    const g = this.moveGoal
    if (this.moveStep(g, g.speed, dt)) {
      this.moveGoal = null
      g.resolve()
    }
  }

  // Fly so the mouth lands on a viewport point.
  flyTo(point, speed = 240) {
    return new Promise((resolve) => {
      if (this.moveGoal) this.moveGoal.resolve()
      const goal = { x: point.x - this.metrics.mouth.x, y: point.y - this.metrics.mouth.y }
      if (this.reducedMotion) {
        this.x = goal.x
        this.y = goal.y
        resolve()
        return
      }
      this.moveGoal = { ...goal, speed, resolve }
    })
  }

  say(text, ms = 1600) {
    const bubble = document.createElement("div")
    bubble.className = "critter__bubble"
    bubble.textContent = text
    bubble.style.left = `${this.x + this.metrics.size / 2}px`
    bubble.style.top = `${this.y - 12}px`
    this.layer.appendChild(bubble)
    setTimeout(() => bubble.remove(), ms)
  }

  crumbs(point, count = 3) {
    for (let i = 0; i < count; i++) {
      const crumb = document.createElement("div")
      crumb.className = "critter__crumb"
      crumb.style.left = `${point.x + rand(-6, 6)}px`
      crumb.style.top = `${point.y + rand(-4, 4)}px`
      crumb.style.setProperty("--drift", `${rand(-18, 18)}px`)
      this.layer.appendChild(crumb)
      setTimeout(() => crumb.remove(), 800)
    }
  }

  hearts() {
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement("div")
      heart.className = "critter__heart"
      heart.textContent = "♥"
      heart.style.left = `${this.x + this.metrics.size / 2 + rand(-20, 20)}px`
      heart.style.top = `${this.y}px`
      heart.style.animationDelay = `${i * 120}ms`
      this.layer.appendChild(heart)
      setTimeout(() => heart.remove(), 1400)
    }
  }

  get available() {
    return !this.busy && !this.erased && !this.reducedMotion && performance.now() > this.asleepUntil
  }

  async chomp() {
    this.setFrame("chomp")
    await sleep(90)
    this.setFrame("idle")
    await sleep(60)
  }

  done() {
    this.frameOverride = null
    this.draw("idle")
    this.busy = false
  }

  // ---- behaviours ----

  // Eat a run of letters from an answer 10-15s after it finished printing.
  scheduleSnack(element) {
    clearTimeout(this.snackTimer)
    this.snackTimer = setTimeout(() => this.snackOn(element), rand(10000, 15000))
  }

  async snackOn(element) {
    if (!element.isConnected) return
    if (!this.available) {
      this.scheduleSnack(element)
      return
    }

    const letters = collectLetters(element)
    const starts = letters.filter((l) => l.wordStart)
    if (!starts.length) return

    this.busy = true
    let index = letters.indexOf(pick(starts))
    const runLength = Math.floor(rand(6, 16))
    let eaten = 0

    while (eaten < runLength && index < letters.length && !this.erased) {
      const letter = letters[index++]
      if (!letter.node.isConnected) break
      const rect = letterRect(letter)
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) break

      const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      await this.flyTo(point, eaten === 0 ? 260 : 160)
      if (this.erased || !letter.node.isConnected) break
      replaceChar(letter)
      this.crumbs(point, 2)
      await this.chomp()
      eaten++
    }

    if (eaten && !this.erased) this.say(pick(SNACK_LINES))
    this.done()
  }

  // Called while the visitor types. Sometimes steals the last few characters.
  async maybeEatInput(length) {
    const now = performance.now()
    if (!this.available || length < 4 || now - this.lastInputSnack < 18000) return
    if (Math.random() > 0.22) return

    this.busy = true
    this.lastInputSnack = now
    const bites = Math.floor(rand(1, 4))

    for (let i = 0; i < bites; i++) {
      const point = this.hooks.inputPoint()
      if (!point) break
      await this.flyTo(point, i === 0 ? 300 : 120)
      if (this.erased || !this.hooks.eatInputChar()) break
      this.crumbs(point, 2)
      await this.chomp()
    }

    if (!this.erased) this.say(pick([ "nom.", "typo removed :)", "you weren't using those", "crunchy." ]))
    this.done()
  }

  async feed() {
    if (this.busy || this.erased) return false
    this.busy = true
    this.asleepUntil = 0

    const food = document.createElement("div")
    food.className = "critter__food"
    food.textContent = pick(FOOD)
    const point = {
      x: Math.min(window.innerWidth - 40, Math.max(40, this.x + rand(-160, 160))),
      y: Math.min(window.innerHeight - 120, Math.max(60, this.y + rand(-60, 120)))
    }
    food.style.left = `${point.x}px`
    food.style.top = `${point.y}px`
    this.layer.appendChild(food)

    await sleep(400)
    await this.flyTo(point, 280)
    food.remove()
    if (this.erased) {
      this.done()
      return false
    }
    this.crumbs(point, 6)
    await this.chomp()
    await this.chomp()
    this.setFrame("happy")
    this.hearts()
    this.say(pick([ "yum!", "chookity!", "more.", "5 stars" ]))
    await sleep(1200)
    this.done()
    return true
  }

  async pet() {
    if (this.busy || this.erased) return
    this.busy = true
    this.setFrame("happy")
    this.hearts()
    this.say(pick(PET_LINES))
    await sleep(1200)
    this.done()
  }

  shoo() {
    this.asleepUntil = performance.now() + 60000
    this.say("zzz", 2400)
  }

  // Lord Beerus has spoken: turn to purple dust, come back a few seconds later.
  async hakai() {
    if (this.erased) return
    this.erased = true
    if (this.moveGoal) {
      this.moveGoal.resolve()
      this.moveGoal = null
    }
    this.dust()
    this.el.classList.add("critter--erased")
    await sleep(rand(4500, 6500))

    const { size } = this.metrics
    this.x = rand(24, Math.max(24, window.innerWidth - size - 24))
    this.y = rand(60, Math.max(60, window.innerHeight * 0.45))
    this.wanderTarget = null
    this.el.classList.remove("critter--erased")
    this.el.classList.add("critter--respawn")
    setTimeout(() => this.el.classList.remove("critter--respawn"), 500)
    this.erased = false
    this.done()
    this.say(pick([ "...pok?", "i'm back.", "rude.", "chookity?" ]))
  }

  dust() {
    const { size } = this.metrics
    for (let i = 0; i < 14; i++) {
      const mote = document.createElement("div")
      mote.className = "critter__dust"
      mote.style.left = `${this.x + rand(size * 0.15, size * 0.85)}px`
      mote.style.top = `${this.y + rand(size * 0.2, size * 0.9)}px`
      mote.style.setProperty("--drift", `${rand(-24, 24)}px`)
      mote.style.animationDelay = `${Math.floor(rand(0, 400))}ms`
      this.layer.appendChild(mote)
      setTimeout(() => mote.remove(), 1700)
    }
  }
}

// ---- text helpers ----

function collectLetters(root) {
  const letters = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let prevWasLetter = false
  while (walker.nextNode()) {
    const node = walker.currentNode
    for (let i = 0; i < node.data.length; i++) {
      const isLetter = /[a-z0-9]/i.test(node.data[i])
      if (isLetter) letters.push({ node, index: i, wordStart: !prevWasLetter })
      prevWasLetter = isLetter
    }
  }
  return letters
}

function letterRect({ node, index }) {
  if (index >= node.data.length) return null
  const range = document.createRange()
  range.setStart(node, index)
  range.setEnd(node, index + 1)
  const rect = range.getBoundingClientRect()
  return rect.width ? rect : null
}

function replaceChar({ node, index }) {
  // Same length replacement keeps every other letter's index valid.
  node.data = node.data.slice(0, index) + " " + node.data.slice(index + 1)
}
