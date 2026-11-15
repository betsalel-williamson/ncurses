// Finds what a C listing defines for itself, so code-links.mjs can link each use to its
// definition: functions, macros, types, file-scope variables, and each function's parameters and
// local variables. It reads the listing as text, not through a compiler, because most listings
// are fragments that don't compile on their own. It aims to be right for the curses examples, not
// for all of C: a name it misses stays plain.

const KEYWORDS = new Set(
  ('auto break case char const continue default do double else enum extern float for goto if ' +
    'inline int long register restrict return short signed sizeof static struct switch typedef ' +
    'union unsigned void volatile while bool _Bool').split(' '),
);
// Words that start a declaration of a local variable, besides the listing's own types.
const TYPES = new Set(
  ('char int long short float double void signed unsigned bool _Bool const static register ' +
    'struct enum union size_t ssize_t wchar_t wint_t FILE time_t WINDOW SCREEN MEVENT chtype ' +
    'attr_t cchar_t mmask_t PANEL MENU ITEM FIELD FORM FIELDTYPE TERMINAL NCURSES_COLOR_T ' +
    'NCURSES_PAIRS_T').split(' '),
);
const ID = /[A-Za-z_]\w*/g;

/**
 * The listing with comments, strings and character literals blanked out to spaces, so that a name
 * inside one isn't read as code. Offsets and line breaks stay where they were.
 */
export function mask(code) {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];
    if (c === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      const stop = end < 0 ? code.length : end + 2;
      out += code.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else if (c === '/' && next === '/') {
      const end = code.indexOf('\n', i);
      const stop = end < 0 ? code.length : end;
      out += ' '.repeat(stop - i);
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== c && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1;
      const stop = Math.min(j + 1, code.length);
      out += c + code.slice(i + 1, stop - 1).replace(/[^\n]/g, ' ') + (code[stop - 1] === c ? c : ' ');
      i = stop;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

/** The names a list of declarators declares: `*a, b[3] = {0}, c` gives a, b and c. */
function declarators(text) {
  const names = [];
  let depth = 0;
  let part = '';
  for (const ch of text + ',') {
    if ('([{'.includes(ch)) depth += 1;
    if (')]}'.includes(ch)) depth -= 1;
    if (ch === ',' && depth === 0) {
      const m = /^[\s*&]*([A-Za-z_]\w*)\s*(?:\[[^\]]*\]\s*)*(?:=|$)/.exec(part.trim() + ' ');
      if (m && !KEYWORDS.has(m[1])) names.push(m[1]);
      part = '';
    } else part += ch;
  }
  return names;
}

/** Where a name sits on its line, given the text after which it should be found. */
function column(line, name, from = 0) {
  const re = new RegExp(`\\b${name}\\b`, 'g');
  re.lastIndex = from;
  const m = re.exec(line);
  return m ? m.index : -1;
}

/**
 * Each definition in a listing: its name, the 0-based line and column of the name where it is
 * defined, the lines it can be used on (scope), the kind, the code to show for it, and the
 * function it belongs to for a parameter or a local.
 */
export function definitions(code) {
  const lines = code.split('\n');
  const masked = mask(code).split('\n');
  const last = lines.length - 1;
  const defs = [];
  const types = new Set(TYPES);
  const add = (name, line, col, kind, extra = {}) => {
    if (col < 0 || KEYWORDS.has(name)) return;
    if (defs.some((d) => d.line === line && d.col === col)) return;
    defs.push({ name, line, col, kind, text: lines[line].trim(), from: 0, to: last, ...extra });
  };

  // Macros and the listing's own type names first, so that locals of those types are found.
  masked.forEach((m, n) => {
    const def = /^\s*#\s*define\s+([A-Za-z_]\w*)/.exec(lines[n]);
    if (def) add(def[1], n, column(lines[n], def[1], lines[n].indexOf('define') + 6), 'macro');
    const typedef = /^typedef\b.*?\b([A-Za-z_]\w*)\s*(?:\[[^\]]*\])?;\s*$/.exec(m);
    if (typedef && !/\(/.test(m)) types.add(typedef[1]);
    const close = /^\}\s*([A-Za-z_]\w*)\s*;/.exec(m); // the name after a typedef'd struct body
    if (close) {
      types.add(close[1]);
      add(close[1], n, m.indexOf(close[1]), 'type');
    }
  });

  // Walk the braces to find each function body and the depth of every line. At file scope,
  // a declaration can span lines (a return type on its own line, parameters wrapped), so the
  // lines up to its ; or { are read as one piece.
  let depth = 0;
  let fn; // the function whose body we are in
  let skip = -1; // the last line of the file-scope piece already read
  for (let n = 0; n <= last; n += 1) {
    const m = masked[n];
    if (depth === 0 && n > skip && !/^\s*#/.test(m) && /^[A-Za-z_]/.test(m)) {
      let k = n;
      while (k < last && k - n < 8 && !/[;{]\s*$/.test(masked[k]) && !/^\s*\{/.test(masked[k + 1])) k += 1;
      skip = k;
      const piece = masked.slice(n, k + 1).join('\n');
      const real = lines.slice(n, k + 1).join('\n');
      // The line and column of an offset in the piece.
      const at = (offset) => {
        const before = piece.slice(0, offset).split('\n');
        return [n + before.length - 1, before.at(-1).length];
      };
      const find = (name, from = 0) => {
        const re = new RegExp(`\\b${name}\\b`, 'g');
        re.lastIndex = from;
        const r = re.exec(piece);
        return r ? at(r.index) : [n, -1];
      };
      const text = real.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s*\{\s*$/, '').trim();
      const header = /^([A-Za-z_][\w\s*]*?)\b([A-Za-z_]\w*)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*(\{?)\s*$/.exec(piece);
      const opens = header && (header[4] || /^\s*\{/.test(masked[k + 1] ?? ''));
      if (header && opens && !KEYWORDS.has(header[2])) {
        const name = header[2];
        fn = { name, header: n, open: header[4] ? k : k + 1, text };
        add(name, ...find(name, header[1].length), 'function', { text });
        for (const param of header[3].split(',')) {
          const p = /([A-Za-z_]\w*)\s*(?:\[[^\]]*\]\s*)*$/.exec(param.trim());
          if (p && !KEYWORDS.has(p[1]) && /[\s*]/.test(param.trim()))
            fn.params = [...(fn.params ?? []), { name: p[1], text: param.replace(/\s+/g, ' ').trim(), at: find(p[1], piece.indexOf('(')) }];
        }
      } else if (header) {
        // A prototype: not a definition, but its parameter names are not uses either.
      } else if (/^typedef\b/.test(piece)) {
        const t = /\b([A-Za-z_]\w*)\s*(?:\[[^\]]*\])?;\s*$/.exec(piece);
        if (t && !/\(/.test(piece)) add(t[1], ...at(piece.lastIndexOf(t[1])), 'type');
        const s = /^typedef\s+(?:struct|union|enum)\s+([A-Za-z_]\w*)/.exec(piece);
        if (s) add(s[1], ...find(s[1], 7), 'type');
      } else if (/^(?:struct|union|enum)\s+([A-Za-z_]\w*)\s*\{?\s*$/.test(piece)) {
        const s = /^(?:struct|union|enum)\s+([A-Za-z_]\w*)/.exec(piece);
        add(s[1], ...find(s[1]), 'type');
      } else if (!/\(/.test(piece.split('=')[0])) {
        // A file-scope variable: a type, then declarators, ending in ; or opening an initializer.
        const v = /^((?:(?:static|const|extern|unsigned|signed|volatile|struct|enum)\s+)*[A-Za-z_]\w*[\s*]+)([\s\S]*?)(?:;|=\s*\{?)?\s*$/.exec(piece);
        if (v && !KEYWORDS.has(v[2].split(/\W/)[0]) && v[1].trim() !== 'return') {
          for (const name of declarators(v[2].replace(/=[\s\S]*$/, '')))
            add(name, ...find(name, v[1].length), 'variable');
        }
      }
    } else if (fn && depth >= 1) {
      // A local declaration: a known type word starts the statement.
      const local = /^\s*((?:(?:static|const|register|unsigned|signed|volatile|struct|enum)\s+)*([A-Za-z_]\w*)[\s*]+)([^;()]*(?:\([^;]*\))?[^;]*);/.exec(m);
      const forInit = /\bfor\s*\(\s*([A-Za-z_]\w*)[\s*]+([A-Za-z_]\w*)\s*=/.exec(m);
      if (local && (types.has(local[2]) || /^(?:struct|enum)\b/.test(local[1].trim()))) {
        for (const name of declarators(local[3]))
          add(name, n, column(lines[n], name, local[1].length), 'local', { owner: fn.name, local: true });
      } else if (forInit && types.has(forInit[1])) {
        add(forInit[2], n, column(lines[n], forInit[2], forInit.index), 'local', { owner: fn.name, local: true });
      }
    }
    for (const ch of m) {
      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;
    }
    if (fn && depth === 0 && n >= fn.open) {
      // The function's body ends here: scope its parameters and locals to it.
      for (const p of fn.params ?? []) add(p.name, ...p.at, 'parameter', { owner: fn.name, text: p.text, from: fn.header, to: n });
      for (const d of defs) if (d.local && d.owner === fn.name && d.to === last && d.line >= fn.header) Object.assign(d, { from: fn.header, to: n });
      fn = undefined;
    }
    if (depth < 0) depth = 0;
  }
  return defs;
}

/**
 * The definition a use of `name` at line `n` refers to: among the definitions in scope there, the
 * innermost one, and for a local only from its own line on.
 */
export function resolve(defs, name, n) {
  let best;
  for (const d of defs) {
    if (d.name !== name || n < d.from || n > d.to) continue;
    if (d.kind === 'local' && n < d.line) continue;
    if (!best || d.from > best.from || (d.from === best.from && d.line > best.line && d.kind === 'local'))
      best = d;
  }
  return best;
}

/** Each name in a masked line that could be a use, with its column; not after `.` or `->`. */
export function uses(maskedLine) {
  return [...maskedLine.matchAll(ID)].filter((m) => !/(?:\.|->)\s*$/.test(maskedLine.slice(0, m.index)));
}
