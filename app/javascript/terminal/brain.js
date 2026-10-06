// The "AI". It is a pile of regexes wearing a trench coat.
// Markup inside answer lines: [label](url) link, {cmd} runnable command, *text* highlight.

const pick = (list) => list[Math.floor(Math.random() * list.length)]

export const BANNER = [
  "██████╗  ██████╗ ███╗   ██╗ ██████╗███████╗",
  "██╔══██╗██╔═══██╗████╗  ██║██╔════╝██╔════╝",
  "██║  ██║██║   ██║██╔██╗ ██║██║     █████╗  ",
  "██║  ██║██║   ██║██║╚██╗██║██║     ██╔══╝  ",
  "██████╔╝╚██████╔╝██║ ╚████║╚██████╗███████╗",
  "╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚══════╝"
]

export const BOOT = [
  "[ OK ] mounting /dev/brain (read-only, as usual)",
  "[ OK ] loading tokyo-night.theme",
  "[ OK ] waking up agents: claude, codex",
  "[WARN] hand-written code module not found (deprecated 2026)",
  "[ OK ] releasing the snack goblin",
  "[ OK ] uplink established"
]

export const GREETING = [
  "hey, I'm the donce.dev terminal. ask me anything about *Donce*.",
  "or try {help}. and don't mind the green thing. it eats letters."
]

export const THINKING = [
  "thinking",
  "asking the robots nicely",
  "grepping brain",
  "bribing the monster",
  "consulting tokyo night",
  "reticulating splines",
  "pretending to be an LLM"
]

const FACTS = [
  "* works out more than he codes. finally 100% true.",
  "* always thinking about the next surf trip.",
  "* office you say? *Please, NO!*",
  "* started coding in 2008. still not a millionaire like DHH. maybe the agents will fix that.",
  "* still reading One Piece.",
  "* favorite anime: Mashle: Magic and Muscles. you know why.",
  "* neovim is still his favorite editor. mostly for reading what the robots wrote."
]

const ANSWERS = {
  help: [
    "commands (or just ask stuff like a normal human):",
    "  {whoami}    who is this guy",
    "  {work}      what he's cooking",
    "  {stack}     languages & tools (spoiler: whatever)",
    "  {contact}   where to find him",
    "  {fun}       useless but true facts",
    "  {blog}      posts from the hand-written-code era",
    "  {neofetch}  system flex",
    "  {feed}      feed the green thing",
    "  {clear}     wipe the screen"
  ],
  whoami: [
    "*Donatas Adomavicius*, aka Donce. agentic engineer from Vilnius.",
    "writing code since 2008. stopped typing it in 2026.",
    "now he describes software, robots type it, he reviews it and argues with them."
  ],
  work: [
    "currently cooking at [Breezit](https://justbreezit.com/).",
    "backend services, admin & vendor platforms, monitoring, prod debugging, internal AI tools.",
    "plus agent loops: Claude Code + Codex write the code, review loops and replay tests catch the dumb stuff before it ships."
  ],
  stack: [
    "languages: yes.",
    "PHP (2008, first love), JavaScript, TypeScript, Vue, Ruby, Node... honestly the robots pick now.",
    "daily drivers: *Claude Code*, *Codex*, Arch-based Linux, Neovim, Docker, Kamal,",
    "and a home server running on 40% uptime and 60% vibes."
  ],
  contact: [
    "[github/moonc4ke](https://github.com/moonc4ke)",
    "[linkedin/donatasadomavicius](https://www.linkedin.com/in/donatasadomavicius/)",
    "[x/donatas_adom](https://x.com/donatas_adom)",
    "[instagram/donatas_adom](https://www.instagram.com/donatas_adom)",
    "best odds: linkedin. worst odds: during a surf trip."
  ],
  fun: [ "useless facts, all verified:", ...FACTS ],
  neofetch: [
    "   ▄▄▄▄▄▄      *donce*@donce.dev",
    " ▄█▀▀▀▀▀▀█▄    -----------------",
    "██ ▄▀  ▄▀ ██   role:    agentic engineer",
    "██   ▀▀   ██   os:      Arch-based (btw)",
    " ▀█▄▄▄▄▄▄█▀    shell:   bash + herdr",
    "               editor:  neovim (read-only)",
    "               agents:  claude, codex",
    "               uptime:  since 2008",
    "               theme:   tokyo night",
    "               status:  probably at the gym"
  ],
  ls: [ "whoami.txt  work.txt  stack.txt  contact.txt  fun.txt  secrets/" ],
  exit: [ "there is no exit. only {clear}." ],
  cd: [ "you're already exactly where you need to be." ],
  vim: [ ":q!  (you're welcome. he only opens it to read robot code now)" ],
  rm: [ "permission denied. the monster already ate /." ],
  sudo: [ "nice try. this incident will be reported to the green thing." ],
  cv: [ "no CV. this terminal is the CV. try {work}." ],
  hire: [
    "requirements: async, remote, zero standup theatre. office? *Please, NO!*",
    "if that fits, see {contact}."
  ]
}

// Order matters: first match wins.
const INTENTS = [
  { re: /\b(labas|sveik|ačiū|aciu|kaip sekasi)/, answers: [ [ "labas! english works better here, the robots are lazy. try {help}." ] ] },
  { re: /^(hi|hello|hey|yo|sup|hola|ola|privet|gm)\b/, answers: [ [ "hey. ask me anything about Donce, or type {help}." ], [ "yo. the monster says hi too. it's hungry. try {whoami}." ] ] },
  { re: /\b(thanks|thank you|thx|ty|cool|nice|awesome|lol|lmao)\b/, answers: [ [ "anytime. the monster says nom." ], [ "glad to help. no tokens were harmed." ] ] },
  { re: /\b(monster|creature|green|blob|goblin|that thing|mooncake|chookity|eat|eating|ate)\b/, answers: [
    [ "that's the snack goblin. it eats letters.", "it's not a bug, it's a roommate. try {feed}." ],
    [ "a small green pixel blob. legally distinct. very hungry.", "it eats your typing and old answers. try {feed} to distract it." ]
  ] },
  { re: /\b(ai|agent|agents|agentic|claude|codex|gpt|chatgpt|llm|prompt|prompts|robot|robots|vibe|copilot|cursor|manually|by hand)\b/, answers: [
    [ "agentic engineer = he tells agents what to build, they write the code, he reviews it,", "and everyone blames the tests. hand-written code is for when the robot misfires." ],
    [ "DHH said pencils down. Donce had already put the pencils down and gone surfing.", "today: Claude Code + Codex, review loops, replay tests. language barely matters anymore." ]
  ] },
  { re: /\b(rails|ruby)\b/, answers: [ [ "used to be a Rails guy. now: whatever ships.", "Rails is still cool. DHH is still a cool dude. the robots don't care either way." ] ] },
  { re: /\b(stack|language|languages|typescript|javascript|js|ts|php|python|rust|go|golang|framework|react|vue|node|tech|tools)\b/, answers: [ ANSWERS.stack ] },
  { re: /\b(contact|reach|email|mail|linkedin|github|twitter|instagram|social|socials|dm|message|follow)\b/, answers: [ ANSWERS.contact ] },
  { re: /\b(hire|hiring|job offer|recruit|recruiter|freelance|available|open to)\b/, answers: [ ANSWERS.hire ] },
  { re: /\b(cv|resume|résumé|portfolio)\b/, answers: [ ANSWERS.cv ] },
  { re: /\b(work|job|breezit|doing|company|employ|career|projects?|build|building|cooking)\b|what (does|do) (he|you) do/, answers: [ ANSWERS.work ] },
  { re: /\b(surf|surfing|wave|waves|ocean|beach|board)\b/, answers: [ [ "always thinking about the next surf trip.", "the agents keep shipping while he waits for waves. perfect system." ] ] },
  { re: /\b(gym|workout|work out|lift|lifting|muscle|muscles|fit|fitness|protein|train)\b/, answers: [ [ "works out more than he codes.", "since 2026 that's not a joke, it's a metric." ] ] },
  { re: /\b(anime|manga|one ?piece|luffy|mashle|naruto|final space|cyberpunk)\b/, answers: [ [ "still reading One Piece. favorite anime: Mashle: Magic and Muscles.", "and yes, you know why." ] ] },
  { re: /\b(linux|arch|neovim|vim|nvim|editor|terminal|omarchy|hyprland|kde|os|herdr)\b/, answers: [ [ "Arch-based Linux, KDE, Neovim, terminals everywhere.", "neovim is mostly for reading what the robots wrote now. still counts." ] ] },
  { re: /\b(office|remote|standup|standups|meeting|meetings|hybrid|onsite|async)\b/, answers: [ [ "office you say? *Please, NO!*", "async, remote, ownership. meetings that could be a message stay a message." ] ] },
  { re: /\b(dhh|rails ?world|keynote|basecamp|37signals|hey\.com)\b/, answers: [ [ "DHH is a cool dude. still not a millionaire like him though.", "maybe the agents will fix that. 1000x programmer, 1000x salary, right? right??" ] ] },
  { re: /\b(since|experience|years|how long|2008|senior|junior|started)\b/, answers: [ [ "started in 2008, building websites in PHP.", "~18 years later he types less code than ever and ships more. funny how that works." ] ] },
  { re: /\b(where|location|live|lives|vilnius|lithuania|country|city|timezone)\b/, answers: [ [ "Vilnius, Lithuania. Europe/Vilnius time.", "remote-only. the server is somewhere else. the monster is everywhere." ] ] },
  { re: /\b(who|about|donatas|donce|yourself|introduce|name)\b/, answers: [ ANSWERS.whoami ] },
  { re: /\b(blog|post|posts|article|articles|writing)\b/, command: "blog" },
  { re: /\b(fun|fact|facts|hobby|hobbies|random)\b/, answers: [ ANSWERS.fun ] },
  { re: /\b(hack|hacking|password|root|exploit|inject|xss|sql|admin)\b/, answers: [ [ "lol. the only thing getting hacked here is the monster's diet." ] ] },
  { re: /\b(meaning|life|42|universe)\b/, answers: [ [ "42. next question." ] ] },
  { re: /\b(coffee|tea|caffeine|kava)\b/, answers: [ [ "coffee: yes. the robots run on electricity, he runs on caffeine and waves." ] ] }
]

const FALLBACKS = [
  [ "hmm. my knowledge base on that is mostly gym receipts. try {help}." ],
  [ "404: opinion not found. ask about {work}, {stack} or {fun}." ],
  [ "I asked the robots. they said \"great question!\" and then nothing. try {help}." ],
  [ "that's above my pay grade. I'm a regex in a trench coat." ],
  [ "the monster ate that answer. sorry. try {whoami}." ]
]

export const COMMANDS = [
  "help", "whoami", "work", "stack", "contact", "fun", "blog", "neofetch",
  "feed", "pet", "shoo", "clear", "history", "date", "echo", "ls", "cat", "hire", "exit"
]

const CAT_FILES = {
  "whoami.txt": "whoami", "work.txt": "work", "stack.txt": "stack",
  "contact.txt": "contact", "fun.txt": "fun"
}

// Returns { lines } to print, { command } for the UI to handle, or { lines, stream:false }.
export function respond(raw) {
  const input = raw.trim()
  const q = input.toLowerCase()
  const [ head, ...rest ] = q.split(/\s+/)
  const arg = rest.join(" ")

  switch (head) {
    case "help": case "?": case "man": return { lines: ANSWERS.help }
    case "whoami": case "about": return { lines: ANSWERS.whoami }
    case "work": return { lines: ANSWERS.work }
    case "stack": return { lines: ANSWERS.stack }
    case "contact": case "socials": return { lines: ANSWERS.contact }
    case "fun": case "facts": return { lines: ANSWERS.fun }
    case "neofetch": case "fastfetch": return { lines: ANSWERS.neofetch, stream: false }
    case "ls": case "dir": return { lines: ANSWERS.ls }
    case "exit": case "quit": case "logout": return { lines: ANSWERS.exit }
    case "cd": return { lines: ANSWERS.cd }
    case "vim": case "nvim": case "vi": case "nano": case "emacs": return { lines: ANSWERS.vim }
    case "rm": return { lines: ANSWERS.rm }
    case "sudo": case "su": return { lines: ANSWERS.sudo }
    case "hire": return { lines: ANSWERS.hire }
    case "cv": case "resume": return { lines: ANSWERS.cv }
    case "echo": return { lines: [ input.slice(5) || " " ], stream: false }
    case "date": return { lines: [ new Date().toLocaleString("en-GB", { timeZone: "Europe/Vilnius" }) + " (Vilnius)" ], stream: false }
    case "cat":
      if (CAT_FILES[arg]) return respond(CAT_FILES[arg])
      if (arg.startsWith("secrets")) return { lines: [ "cat: secrets/: Permission denied (the monster is sitting on it)" ] }
      return { lines: [ `cat: ${arg || "???"}: No such file. try {ls}.` ] }
    case "blog": case "clear": case "cls": case "history": case "feed": case "pet": case "shoo":
      return { command: head === "cls" ? "clear" : head }
  }

  for (const intent of INTENTS) {
    if (intent.re.test(q)) {
      return intent.command ? { command: intent.command } : { lines: pick(intent.answers) }
    }
  }
  return { lines: pick(FALLBACKS) }
}

export function thinkingLabel() {
  return pick(THINKING)
}

export { pick }
