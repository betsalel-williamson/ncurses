/**
 * How the examples' ncurses is configured, and what that build does about the terminal
 * database. build-examples.mjs configures ncurses with NCURSES_CONFIGURE and then writes
 * public/examples/terminfo.json from the build's own output, so the pretend shell can show
 * /usr/local/share/terminfo (or wherever that build points) as the build has it.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** The configure options for the WebAssembly ncurses build, after --host and --build. */
export const NCURSES_CONFIGURE = [
  '--with-build-cc=cc',
  '--without-shared', '--without-cxx', '--without-cxx-binding', '--without-ada',
  '--without-progs', '--without-tests', '--without-manpages', '--without-debug',
  '--disable-database', '--with-fallbacks=xterm-256color',
  '--disable-stripping', '--enable-widec', '--without-pthread',
];

/** The options that decide where ncurses looks for terminal descriptions, and which it has built in. */
export const terminfoOptions = (options) =>
  options.filter((o) => /^--(?:(?:en|dis)able-database|with(?:out)?-(?:fallbacks|terminfo-dirs|default-terminfo-dir|termpath)|prefix|datarootdir|datadir)\b/.test(o));

/** The terminals compiled in with --with-fallbacks, in order. */
export const fallbacks = (options) =>
  options.flatMap((o) => (o.startsWith('--with-fallbacks=') ? o.slice(17).split(',').filter(Boolean) : []));

/**
 * The variables a generated Makefile sets (`NAME = value`), each with the ${NAME} and $(NAME)
 * references in it expanded, as make expands them.
 */
export function makeVars(text) {
  const raw = new Map();
  for (const line of text.split('\n')) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !raw.has(m[1])) raw.set(m[1], m[2]);
  }
  const done = new Map();
  const value = (name, seen = new Set()) => {
    if (done.has(name)) return done.get(name);
    if (seen.has(name)) return '';
    seen.add(name);
    const v = (raw.get(name) ?? '').replace(/\$[{(]([A-Za-z_][A-Za-z0-9_]*)[})]/g, (_, n) => value(n, seen));
    done.set(name, v);
    return v;
  };
  return Object.fromEntries([...raw.keys()].map((k) => [k, value(k)]));
}

/**
 * The folder an entry is in under a terminfo directory: its first letter where the file system
 * tells names apart by case (MIXEDCASE_FILENAMES), else that letter's code in hex (78 for x).
 */
export const entryDir = (name, mixedCase) => (mixedCase ? name[0] : name.charCodeAt(0).toString(16).padStart(2, '0'));

/** Whether a generated ncurses_cfg.h says the file system is case-sensitive. */
export const mixedCase = (cfgHeader) => /^#define MIXEDCASE_FILENAMES 1\b/m.test(cfgHeader);

/**
 * infocmp's text for an entry, with its first comment, which names the scratch directory it
 * read, replaced by where the entry really came from.
 */
export function infocmpText(raw, name) {
  const lines = raw.replace(/\n+$/, '').split('\n');
  const body = lines[0]?.startsWith('#\tReconstructed via infocmp') ? lines.slice(1) : lines;
  return [
    `#\tReconstructed via infocmp from misc/terminfo.src: the entry`,
    `#\tcompiled into the library (--with-fallbacks=${name})`,
    ...body,
  ].join('\n');
}

/**
 * What the shell shows about the build's terminfo: the directory the build is configured for,
 * whether it reads a database there, the options that decided it, and each built-in entry with
 * its path under that directory, its compiled size and its source as infocmp prints it.
 * `compile(name)` gives { bytes, source } for an entry, or null when it can't.
 */
export function terminfoFacts({ options, makefile, cfgHeader, compile = () => null }) {
  const vars = makeVars(makefile);
  const mixed = mixedCase(cfgHeader);
  return {
    dir: vars.TERMINFO,
    database: !options.includes('--disable-database'),
    options: terminfoOptions(options),
    entries: fallbacks(options).map((name) => ({ name, path: `${entryDir(name, mixed)}/${name}`, ...(compile(name) ?? {}) })),
  };
}

/**
 * Compiles an entry from misc/terminfo.src with the tic and infocmp the build used
 * (MKfallback.sh does the same to make the library's fallback table), and returns its compiled
 * size and its text; null if either tool fails.
 */
export function compileEntry(name, { tic, infocmp, source }) {
  const tmp = mkdtempSync(join(tmpdir(), 'terminfo-'));
  try {
    execFileSync(tic, ['-x', '-o', tmp, '-e', name, source], { stdio: 'ignore' });
    const file = readdirSync(tmp).map((d) => join(tmp, d, name)).find((f) => statSync(f, { throwIfNoEntry: false }));
    const raw = execFileSync(infocmp, ['-x', '-A', tmp, name], { encoding: 'utf8' });
    return { bytes: file ? statSync(file).size : undefined, source: infocmpText(raw, name) };
  } catch {
    return null;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * The facts for a finished ncurses build in `build`, configured with `options`: the tools and
 * the terminfo.src its Makefile names, else the host's tools and `repo`'s misc/terminfo.src.
 */
export function buildFacts(build, options, repo) {
  const makefile = readFileSync(join(build, 'ncurses/Makefile'), 'utf8');
  const vars = makeVars(makefile);
  return terminfoFacts({
    options,
    makefile,
    cfgHeader: readFileSync(join(build, 'include/ncurses_cfg.h'), 'utf8'),
    compile: (name) =>
      compileEntry(name, {
        tic: vars.TIC_PATH || 'tic',
        infocmp: vars.INFOCMP_PATH || 'infocmp',
        source: vars.TERMINFO_SRC && existsSync(vars.TERMINFO_SRC) ? vars.TERMINFO_SRC : join(repo, 'misc/terminfo.src'),
      }),
  });
}
