// Copy to run: a second copy button, under shell listings, that copies a paste-ready version of
// the steps. In bash a trailing "# comment" is harmless, but zsh (macOS's default shell) passes it
// to the command as arguments unless interactivecomments is set, so the plain copy of a commented
// listing fails when pasted. This plugin works out the paste text at build time and stores it on
// the block; src/components/run-copy.js adds the row with the button under the listing.
//
// The paste text keeps each step's own lines (a backslash continuation stays one step), drops
// comments and blank lines, ends each step but the last in "&&" and the last in "||", then echoes
// a failure message, so the first failed step stops the rest and says so. There is no subshell
// and no set -e: a reader who types the steps ends up in the directory a cd step moved to, and
// so does one who pastes them, and set -e would close the reader's terminal on a failure.
//
// A listing gets no button when the copy would not run or would not differ from the plain copy:
// one command without a comment, option fragments (lines starting with -), a here-document, its
// own control flow, or a placeholder the site can't fill (XXX, <dir>). An interactive step (su
// without -c, an editor, ssh) ends the chain: the steps before it are copied, and the feedback
// says where it stopped.
import { readFileSync } from 'node:fs';

const SHELLS = new Set(['sh', 'bash', 'shell']);

/** The message the pasted steps print when one fails. */
export const FAILED = 'echo "ncurses: stopped at a failed step (see above)" >&2';

/** A step that opens a session and waits for the reader, so the steps after it can't follow. */
export function isInteractive(words) {
  const [cmd, ...args] = words;
  if (cmd === 'su') return !args.includes('-c');
  if (cmd === 'sudo') return args.length === 0 || args[0] === '-i' || args[0] === '-s';
  if (['bash', 'sh', 'zsh'].includes(cmd)) return args.length === 0;
  return ['login', 'passwd', 'ssh', 'vi', 'vim', 'nano', 'emacs', 'less', 'more', 'man', 'top', 'newgrp', 'exec'].includes(cmd);
}

/**
 * One line without its comment. A # starts a comment only at the start of a word (line start, or
 * after a space, ;, &, | or open parenthesis) and outside quotes, so $#, ${#x}, '#', "#", \# and
 * a#b stay. `state.quote` carries an open quote to the next line.
 */
export function stripComment(line, state) {
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (state.quote === "'") {
      if (c === "'") state.quote = '';
      continue;
    }
    if (c === '\\') {
      i++;
      continue;
    }
    if (state.quote) {
      if (c === state.quote) state.quote = '';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      state.quote = c;
      continue;
    }
    if (c === '#' && (i === 0 || /[\s;&|(]/.test(line[i - 1]))) return { text: line.slice(0, i).trimEnd(), cut: true };
  }
  return { text: line.trimEnd(), cut: false };
}

/**
 * The paste-ready text of a shell listing: { text, steps, stopped, used }, or { refuse } with the
 * reason it gets no button. `placeholders` maps a placeholder such as <version> to its value;
 * `used` lists those filled in, as "<version> as 6.6".
 */
export function toRunnable(src, placeholders = {}) {
  if (/<<-?\s*['"]?\w/.test(src)) return { refuse: 'has a here-document' };
  const state = { quote: '' };
  let cut = false;
  const lines = [];
  for (const raw of src.split('\n')) {
    const r = stripComment(raw, state);
    cut ||= r.cut;
    if (r.text.trim()) lines.push(r.text);
  }
  const steps = [];
  for (const l of lines) {
    const prev = steps.at(-1);
    if (prev && /\\$/.test(prev.at(-1))) prev.push(l);
    else steps.push([l]);
  }
  if (!steps.length) return { refuse: 'has no commands' };
  if (steps.some((s) => /^\s*-/.test(s[0]))) return { refuse: 'is a list of options, not commands' };
  let stopped = null;
  const run = [];
  for (const s of steps) {
    const words = s.join(' ').trim().split(/\s+/);
    if (isInteractive(words)) {
      stopped = s.join(' ').trim();
      break;
    }
    if (/^(if|for|while|until|case|function)$/.test(words[0]) || /(&&|\|\||[|;&])$/.test(s.at(-1).trim()))
      return { refuse: 'has its own control flow' };
    run.push(s);
  }
  if (!run.length) return { refuse: 'starts with an interactive step' };
  let text = run
    .map((s, i) => {
      const t = s.slice();
      if (run.length > 1) t[t.length - 1] += i < run.length - 1 ? ' &&' : ' ||';
      return t.join('\n');
    })
    .join('\n');
  if (run.length > 1) text += `\n${FAILED}`;
  const used = [];
  for (const [k, v] of Object.entries(placeholders)) {
    if (!text.includes(k)) continue;
    text = text.split(k).join(v);
    used.push(`${k} as ${v}`);
  }
  if (/<[A-Za-z][\w-]*>|\bXXX\b/.test(text)) return { refuse: 'has a placeholder the site cannot fill' };
  if (run.length < 2 && !cut && !stopped) return { refuse: 'is one command, and the plain copy already runs' };
  return { text, steps: run.length, stopped, used };
}

/** What the live region adds after "Copied N steps": the version filled in, where it stopped. */
export function feedbackNote(result, placeholders = {}) {
  const parts = [];
  if (result.used.some((u) => u.startsWith('<version> '))) parts.push(`with version ${placeholders['<version>']}`);
  if (result.stopped) parts.push(`stops before ${result.stopped}`);
  return parts.join(', ');
}

/** The release in ../dist.mk, as the tarball names it: NCURSES_MAJOR.NCURSES_MINOR. */
function releaseVersion() {
  const dist = readFileSync(new URL('../dist.mk', import.meta.url), 'utf8');
  const ver = (k) => new RegExp(`^${k}\\s*=\\s*(\\S+)`, 'm').exec(dist)?.[1];
  return `${ver('NCURSES_MAJOR')}.${ver('NCURSES_MINOR')}`;
}

/**
 * The SHA-256 of a release's tarball, from data/release-checksums.json, or undefined for a
 * release not listed there. A listing that checks <sha256> then gets no Copy to run button, rather
 * than one that pastes a check that can't pass.
 */
export function releaseChecksum(version, table = JSON.parse(readFileSync(new URL('./data/release-checksums.json', import.meta.url), 'utf8'))) {
  return table[version]?.sha256;
}

const svg = (name) => readFileSync(new URL(`./src/icons/pixel/${name}.svg`, import.meta.url), 'utf8').replace(/\s*\n\s*/g, '');

export function codeRunCopy() {
  const version = releaseVersion();
  const placeholders = { '<version>': version };
  const sha256 = releaseChecksum(version);
  if (sha256) placeholders['<sha256>'] = sha256;
  // The page script, with the pixel styles' icons filled in from src/icons/pixel.
  const script = readFileSync(new URL('./src/components/run-copy.js', import.meta.url), 'utf8')
    .replace('__PIXEL_PROMPT__', JSON.stringify(svg('prompt')))
    .replace('__PIXEL_CHECK__', JSON.stringify(svg('check')));
  return {
    name: 'ncurses-run-copy',
    jsModules: [script],
    hooks: {
      postprocessRenderedBlock({ codeBlock, renderData }) {
        if (!SHELLS.has(codeBlock.language)) return;
        const r = toRunnable(codeBlock.code, placeholders);
        if (r.refuse) return;
        const props = (renderData.blockAst.properties ??= {});
        props.dataRunCode = r.text;
        props.dataRunSteps = String(r.steps);
        props.dataRunNote = feedbackNote(r, placeholders);
      },
    },
  };
}
