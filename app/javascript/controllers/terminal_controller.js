import { Controller } from "@hotwired/stimulus"
import { BANNER, BOOT, GREETING, COMMANDS, respond, thinkingLabel } from "terminal/brain"
import { Mooncake } from "terminal/mooncake"

const SPINNER = [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ]
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default class extends Controller {
  static targets = [ "log", "input", "typed", "caret", "clock", "critters" ]
  static values = { posts: Array }

  connect() {
    this.history = []
    this.historyIndex = 0
    this.queue = []
    this.running = false
    this.fastForward = false

    this.monster = new Mooncake(this.crittersTarget, {
      inputPoint: () => this.inputPoint(),
      eatInputChar: () => this.eatInputChar()
    })

    this.updateClock()
    this.clockTimer = setInterval(() => this.updateClock(), 15000)
    this.focusOnKey = (event) => {
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && document.activeElement !== this.inputTarget) this.focus()
    }
    document.addEventListener("keydown", this.focusOnKey)

    // Mobile keyboards shrink the visual viewport; keep the input above them.
    this.fitViewport = () => {
      const height = window.visualViewport?.height ?? window.innerHeight
      this.element.style.setProperty("--app-height", `${height}px`)
      this.scrollDown()
    }
    this.fitViewport()
    window.visualViewport?.addEventListener("resize", this.fitViewport)
    window.addEventListener("resize", this.fitViewport)

    this.boot()
  }

  disconnect() {
    clearInterval(this.clockTimer)
    document.removeEventListener("keydown", this.focusOnKey)
    window.visualViewport?.removeEventListener("resize", this.fitViewport)
    window.removeEventListener("resize", this.fitViewport)
    this.monster.destroy()
  }

  // ---- boot ----

  async boot() {
    this.running = true
    const quick = this.reducedMotion
    for (const line of BOOT) {
      const el = this.addLine("boot")
      const tag = line.match(/^\[(.*?)\]/)[0]
      el.innerHTML = `<span class="${tag.includes("WARN") ? "warn" : "ok"}">${tag}</span>${escapeHtml(line.slice(tag.length))}`
      if (!quick) await sleep(90 + Math.random() * 140)
    }

    const banner = document.createElement("pre")
    banner.className = "term__banner"
    banner.setAttribute("aria-label", "donce")
    banner.textContent = BANNER.join("\n")
    this.logTarget.appendChild(banner)
    this.addLine("dim").textContent = "agentic engineer // vilnius // est. 2008 // robots type, I review"

    const greeting = await this.printAnswer(GREETING)
    this.monster.scheduleSnack(greeting)
    this.running = false
    this.focus()
    this.drain()
  }

  // ---- input ----

  focus() {
    if (window.getSelection().toString()) return
    this.inputTarget.focus({ preventScroll: true })
  }

  onInput() {
    this.renderTyped()
    this.monster.maybeEatInput(this.inputTarget.value.length)
  }

  onKey(event) {
    const input = this.inputTarget
    switch (event.key) {
      case "Enter":
        event.preventDefault()
        this.submit(input.value)
        break
      case "ArrowUp":
        event.preventDefault()
        this.browseHistory(-1)
        break
      case "ArrowDown":
        event.preventDefault()
        this.browseHistory(1)
        break
      case "Tab":
        event.preventDefault()
        this.complete()
        break
      case "ArrowLeft": case "Home":
        event.preventDefault()
        break
      default:
        if (event.ctrlKey && event.key === "l") {
          event.preventDefault()
          this.clear()
        } else if (event.ctrlKey && event.key === "c") {
          event.preventDefault()
          this.addLine("user").textContent = `guest@donce.dev:~$ ${input.value}^C`
          this.setInput("")
          this.fastForward = true
        }
    }
  }

  chip(event) {
    this.submit(event.currentTarget.dataset.cmd)
  }

  run(event) {
    event.preventDefault()
    this.submit(event.currentTarget.dataset.cmd)
  }

  submit(value) {
    const text = value.trim()
    this.setInput("")
    if (!text) {
      this.addLine("user").textContent = "guest@donce.dev:~$"
      this.scrollDown()
      return
    }
    this.history.push(text)
    this.historyIndex = this.history.length
    this.queue.push(text)
    if (this.running) this.fastForward = true
    this.drain()
    this.focus()
  }

  async drain() {
    if (this.running) return
    this.running = true
    while (this.queue.length) {
      this.fastForward = false
      await this.execute(this.queue.shift())
    }
    this.running = false
  }

  async execute(text) {
    const userLine = this.addLine("user")
    userLine.innerHTML = `<span class="term__prompt">guest@donce.dev:~$</span> `
    userLine.append(text)
    this.scrollDown()

    const result = respond(text)

    if (result.command) return this.runCommand(result.command)

    const answer = await this.printAnswer(result.lines, { stream: result.stream !== false })
    this.monster.scheduleSnack(answer)
  }

  async runCommand(command) {
    switch (command) {
      case "clear":
        this.clear()
        return
      case "history":
        await this.printAnswer(this.history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`), { stream: false })
        return
      case "feed": {
        const fed = this.monster.feed()
        await this.printAnswer([ "you toss a snack into the void. something green noticed." ])
        if (!(await fed)) await this.printAnswer([ "it's busy eating something else. patience." ])
        return
      }
      case "pet":
        this.monster.pet()
        await this.printAnswer([ "it purrs in 8-bit." ])
        return
      case "shoo":
        this.monster.shoo()
        await this.printAnswer([ "the goblin takes a 60s nap. your letters are safe. for now." ])
        return
      case "blog": {
        const posts = this.postsValue
        const lines = posts.length
          ? [ "posts from the hand-written-code era:", ...posts.map((p) => `  ${p.date}  [${p.title.replace(/[\[\]()]/g, "")}](${p.url})`) ]
          : [ "no posts. the robots haven't written any yet." ]
        const answer = await this.printAnswer(lines)
        this.monster.scheduleSnack(answer)
      }
    }
  }

  // ---- output ----

  addLine(kind) {
    const line = document.createElement("div")
    line.className = `term__line term__line--${kind}`
    this.logTarget.appendChild(line)
    return line
  }

  async printAnswer(lines, { stream = true } = {}) {
    const block = document.createElement("div")
    block.className = "term__answer"

    if (stream && !this.reducedMotion && !this.fastForward) await this.think()

    this.logTarget.appendChild(block)
    for (const line of lines) {
      const lineEl = document.createElement("div")
      lineEl.className = "term__line"
      block.appendChild(lineEl)
      for (const token of tokenize(line)) {
        const el = this.tokenElement(token)
        lineEl.appendChild(el)
        const target = token.type === "text" ? el : el.firstChild
        if (stream && !this.reducedMotion) {
          await this.typeInto(target, token.text)
        } else {
          target.data = token.text
        }
      }
      if (!line) lineEl.textContent = " "
      this.scrollDown()
    }
    return block
  }

  tokenElement(token) {
    if (token.type === "text") return document.createTextNode("")
    let el
    if (token.type === "link") {
      el = document.createElement("a")
      el.href = token.href
      if (/^https?:/.test(token.href)) {
        el.target = "_blank"
        el.rel = "noopener"
      }
    } else if (token.type === "cmd") {
      el = document.createElement("a")
      el.href = "#"
      el.className = "term__cmd"
      el.dataset.cmd = token.text
      el.dataset.action = "terminal#run"
    } else {
      el = document.createElement("span")
      el.className = "term__hl"
    }
    el.appendChild(document.createTextNode(""))
    return el
  }

  async typeInto(node, text) {
    let i = 0
    while (i < text.length) {
      if (this.fastForward) {
        node.data = text
        return
      }
      const chunk = 1 + Math.floor(Math.random() * 3)
      node.data = text.slice(0, i + chunk)
      i += chunk
      const last = text[i - 1]
      await sleep(/[.,!?:]/.test(last) ? 70 : 10 + Math.random() * 14)
      this.scrollDown()
    }
  }

  async think() {
    const el = this.addLine("thinking")
    const label = thinkingLabel()
    let frame = 0
    const spin = setInterval(() => {
      el.textContent = `${SPINNER[frame++ % SPINNER.length]} ${label}...`
    }, 80)
    el.textContent = `${SPINNER[0]} ${label}...`
    this.scrollDown()
    const end = performance.now() + 450 + Math.random() * 800
    while (performance.now() < end && !this.fastForward) await sleep(40)
    clearInterval(spin)
    el.remove()
  }

  clear() {
    this.logTarget.innerHTML = ""
  }

  scrollDown() {
    this.logTarget.scrollTop = this.logTarget.scrollHeight
  }

  // ---- typed line ----

  setInput(value) {
    this.inputTarget.value = value
    this.renderTyped()
  }

  renderTyped() {
    const input = this.inputTarget
    this.typedTarget.textContent = input.value
    input.setSelectionRange(input.value.length, input.value.length)
  }

  inputPoint() {
    const rect = this.caretTarget.getBoundingClientRect()
    if (!this.inputTarget.value.length) return null
    return { x: rect.left - 4, y: rect.top + rect.height / 2 }
  }

  eatInputChar() {
    const value = this.inputTarget.value
    if (!value.length) return false
    this.setInput(value.slice(0, -1))
    return true
  }

  browseHistory(step) {
    if (!this.history.length) return
    this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + step))
    this.setInput(this.history[this.historyIndex] ?? "")
  }

  complete() {
    const value = this.inputTarget.value.toLowerCase()
    if (!value) return
    const matches = COMMANDS.filter((c) => c.startsWith(value))
    if (matches.length === 1) {
      this.setInput(matches[0])
    } else if (matches.length > 1) {
      this.addLine("dim").textContent = matches.join("  ")
      this.scrollDown()
    }
  }

  updateClock() {
    this.clockTarget.textContent = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Europe/Vilnius", hour: "2-digit", minute: "2-digit"
    })
  }

  get reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }
}

function tokenize(line) {
  const tokens = []
  const re = /\[([^\]]+)\]\(([^)]+)\)|\{([a-z]+)\}|\*([^*]+)\*/g
  let last = 0
  let match
  while ((match = re.exec(line))) {
    if (match.index > last) tokens.push({ type: "text", text: line.slice(last, match.index) })
    if (match[1]) tokens.push({ type: "link", text: match[1], href: match[2] })
    else if (match[3]) tokens.push({ type: "cmd", text: match[3] })
    else tokens.push({ type: "hl", text: match[4] })
    last = re.lastIndex
  }
  if (last < line.length) tokens.push({ type: "text", text: line.slice(last) })
  return tokens
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c])
}
