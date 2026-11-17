/**
 * The editors the pretend shell answers vi, nano and emacs with (page-shell.js). A web page has
 * no real editor, so each is a few dozen lines that look the part: you can type, move with the
 * arrows, and leave the way the real one is left, which is the joke for vi. Nothing is saved.
 */

/** The editors, by the names the shell knows them by. */
export const EDITORS = { vi: 'vi', vim: 'vi', view: 'vi', nvim: 'vi', nano: 'nano', pico: 'nano', emacs: 'emacs' };

const ESC = '\x1b';
const at = (r, c = 1) => `${ESC}[${r};${c}H`;
const inverse = (t) => `${ESC}[7m${t}${ESC}[0m`;
const clip = (t, n) => (t.length > n ? t.slice(0, n) : t);

/**
 * Runs one editor until the reader leaves it. `key()` resolves with the next key: a character,
 * or 'up', 'down', 'left', 'right', 'esc', 'M-x' and so on for keys that send a sequence.
 * Resolves with the exit status, 0.
 */
export async function runEditor(kind, { write, key, rows, cols }) {
  const R = rows(), C = cols();
  const lines = [''];
  let row = 0, col = 0, modified = false;
  const insert = (ch) => {
    const l = lines[row];
    lines[row] = l.slice(0, col) + ch + l.slice(col);
    col++;
    modified = true;
  };
  const newline = () => {
    const l = lines[row];
    lines.splice(row + 1, 0, l.slice(col));
    lines[row] = l.slice(0, col);
    row++;
    col = 0;
    modified = true;
  };
  const backspace = () => {
    if (col > 0) {
      const l = lines[row];
      lines[row] = l.slice(0, col - 1) + l.slice(col);
      col--;
    } else if (row > 0) {
      col = lines[row - 1].length;
      lines[row - 1] += lines[row];
      lines.splice(row, 1);
      row--;
    } else return;
    modified = true;
  };
  const move = (k) => {
    if (k === 'up' && row > 0) row--;
    else if (k === 'down' && row < lines.length - 1) row++;
    else if (k === 'left' && col > 0) col--;
    else if (k === 'right' && col < lines[row].length) col++;
    else return false;
    col = Math.min(col, lines[row].length);
    return true;
  };
  /** Draws the text in rows top..top+height-1, scrolled so the cursor's line shows. */
  const text = (top, height, filler = '') => {
    const first = Math.max(0, row - height + 1);
    let s = '';
    for (let i = 0; i < height; i++) {
      const l = lines[first + i];
      s += `${at(top + i)}${ESC}[2K${l === undefined ? filler : clip(l, C)}`;
    }
    return { s, cursor: at(top + row - first, Math.min(col, C - 1) + 1) };
  };
  const done = () => {
    write(`${ESC}[0m${ESC}[H${ESC}[2J${ESC}[?25h`);
    return 0;
  };
  write(`${ESC}[0m${ESC}[H${ESC}[2J${ESC}[?25h`);

  if (kind === 'vi') {
    // The splash shows until the first change, as vim's does.
    const splash = [
      'PRETEND VI',
      '',
      'a web page has no real editor',
      '',
      'type  :q<Enter>   to exit',
      'type  i           to insert text',
      'type  <Esc>       to stop inserting',
    ];
    let mode = 'normal', message = '', pending = '';
    const draw = () => {
      const t = text(1, R - 1, `${ESC}[34m~${ESC}[0m`);
      let s = t.s;
      if (!modified && lines.length === 1 && !lines[0]) {
        const top = Math.max(2, Math.floor((R - splash.length) / 2));
        splash.forEach((l, i) => (s += at(top + i, Math.max(1, Math.floor((C - l.length) / 2) + 1)) + l));
      }
      const status = mode === 'insert' ? `${ESC}[1m-- INSERT --${ESC}[0m` : message;
      write(`${s}${at(R)}${ESC}[2K${status}${t.cursor}`);
    };
    draw();
    for (;;) {
      const k = await key();
      message = '';
      if (mode === 'insert') {
        if (k === 'esc') {
          mode = 'normal';
          col = Math.max(0, col - 1);
        } else if (k === '\r') newline();
        else if (k === '\x7f' || k === '\b') backspace();
        else if (move(k)) {
          // moved
        } else if (k.length === 1 && k >= ' ') insert(k);
        draw();
        continue;
      }
      if (pending === 'Z') {
        pending = '';
        if (k === 'Q') return done();
        if (k === 'Z') {
          if (!modified) return done();
          message = 'E32: No file name';
        }
        draw();
        continue;
      }
      if (k === ':') {
        write(`${at(R)}${ESC}[2K:`);
        let cmd = '';
        for (;;) {
          const c = await key();
          if (c === '\r') break;
          if (c === 'esc' || c === '\x03') {
            cmd = null;
            break;
          }
          if (c === '\x7f' || c === '\b') {
            if (!cmd) {
              cmd = null;
              break;
            }
            cmd = cmd.slice(0, -1);
            write('\b \b');
          } else if (c.length === 1 && c >= ' ') {
            cmd += c;
            write(c);
          }
        }
        if (cmd === null) {
          draw();
          continue;
        }
        const c = cmd.trim();
        if (/^(q|qa|quit)!$/.test(c) || ((c === 'q' || c === 'qa' || c === 'quit') && !modified)) return done();
        if (c === 'q' || c === 'qa' || c === 'quit') message = 'E37: No write since last change (add ! to override)';
        else if (/^(w|wq|x|wq!|x!|w!)$/.test(c)) message = 'E32: No file name';
        else if (c === 'help' || c === 'h') message = 'This pretend vi knows i, a, o, x, hjkl, :q and :q!';
        else if (c) message = `E492: Not an editor command: ${c}`;
        draw();
        continue;
      }
      if (k === 'i') mode = 'insert';
      else if (k === 'a') {
        mode = 'insert';
        col = Math.min(col + 1, lines[row].length);
      } else if (k === 'o') {
        lines.splice(row + 1, 0, '');
        row++;
        col = 0;
        mode = 'insert';
        modified = true;
      } else if (k === 'x' && lines[row]) {
        lines[row] = lines[row].slice(0, col) + lines[row].slice(col + 1);
        col = Math.min(col, Math.max(0, lines[row].length - 1));
        modified = true;
      } else if (k === 'Z') pending = 'Z';
      else if (k === '\x03') message = 'Type  :qa!  and press <Enter> to abandon all changes and exit Vim';
      else if (!move({ h: 'left', j: 'down', k: 'up', l: 'right' }[k] ?? k)) write('\x07');
      draw();
    }
  }

  if (kind === 'nano') {
    const title = 'pretend nano';
    const keys = [
      [['^G', 'Help'], ['^O', 'Write Out'], ['^W', 'Where Is'], ['^K', 'Cut']],
      [['^X', 'Exit'], ['^R', 'Read File'], ['^\\', 'Replace'], ['^U', 'Paste']],
    ];
    let status = '';
    const bar = (pairs) => {
      const w = Math.floor(C / pairs.length);
      return pairs.map(([k, label]) => clip(`${inverse(k)} ${label}`.padEnd(w + 8), w + 8)).join('');
    };
    const draw = () => {
      const head = `  ${title}`;
      const name = modified ? 'New Buffer  Modified' : 'New Buffer';
      const left = Math.max(head.length + 2, Math.floor((C - name.length) / 2));
      const top = clip(head.padEnd(left) + name, C).padEnd(C);
      const t = text(2, R - 4);
      const st = status ? `${at(R - 2, Math.max(1, Math.floor((C - status.length - 4) / 2)))}${inverse(`[ ${status} ]`)}` : '';
      write(`${at(1)}${inverse(top)}${t.s}${at(R - 2)}${ESC}[2K${st}${at(R - 1)}${ESC}[2K${bar(keys[0])}${at(R)}${ESC}[2K${bar(keys[1])}${t.cursor}`);
    };
    draw();
    for (;;) {
      const k = await key();
      status = '';
      if (k === '\x18') {
        if (!modified) return done();
        // ^X on a changed buffer asks first.
        write(`${at(R - 2)}${ESC}[2K${inverse(clip('Save modified buffer?', C).padEnd(C))}${at(R - 1)}${ESC}[2K ${inverse('Y')} Yes${at(R)}${ESC}[2K ${inverse('N')} No    ${inverse('^C')} Cancel`);
        let answer;
        do answer = await key();
        while (!['y', 'Y', 'n', 'N', '\x03'].includes(answer));
        if (answer === 'n' || answer === 'N') return done();
        if (answer === 'y' || answer === 'Y') {
          status = 'Nothing written: a web page has no disk';
          draw();
          await new Promise((resolve) => setTimeout(resolve, 1200));
          return done();
        }
        status = 'Cancelled';
      } else if (k === '\r') newline();
      else if (k === '\x7f' || k === '\b') backspace();
      else if (move(k)) {
        // moved
      } else if (k.length === 1 && k >= ' ') insert(k);
      else if (k.length === 1) status = 'This pretend nano knows typing, the arrows and ^X';
      draw();
    }
  }

  // emacs
  lines.splice(0, 1, ';; A pretend emacs, since a web page has no real one.', ';; C-x C-c quits. C-g cancels.', '', '');
  row = 3;
  let echo = '';
  const draw = () => {
    const t = text(1, R - 2);
    const mode = clip(`-UUU:${modified ? '**' : '--'}-  *scratch*    All L${row + 1}    (Pretend Interaction)`.padEnd(C, '-'), C);
    write(`${t.s}${at(R - 1)}${inverse(mode)}${at(R)}${ESC}[2K${clip(echo, C)}${t.cursor}`);
  };
  draw();
  for (;;) {
    const k = await key();
    echo = '';
    if (k === '\x18') {
      echo = 'C-x-';
      write(`${at(R)}${ESC}[2K${echo}`);
      const k2 = await key();
      if (k2 === '\x03') return done();
      echo = k2 === '\x07' ? 'Quit' : `C-x ${k2.length === 1 && k2 < ' ' ? `C-${String.fromCharCode(k2.charCodeAt(0) + 96)}` : k2} is undefined`;
    } else if (k === '\x07') {
      echo = 'Quit';
      write('\x07');
    } else if (k === 'M-x') {
      write(`${at(R)}${ESC}[2KM-x `);
      let cmd = '';
      for (;;) {
        const c = await key();
        if (c === '\r' || c === '\x07') {
          if (c === '\x07') cmd = null;
          break;
        }
        if (c === '\x7f' || c === '\b') {
          if (cmd) {
            cmd = cmd.slice(0, -1);
            write('\b \b');
          }
        } else if (c.length === 1 && c >= ' ') {
          cmd += c;
          write(c);
        }
      }
      if (cmd === null) echo = 'Quit';
      else if (/^(kill-emacs|save-buffers-kill-(terminal|emacs))$/.test(cmd.trim())) return done();
      else if (cmd.trim()) echo = `[No match] (try C-x C-c)`;
    } else if (k === '\r') newline();
    else if (k === '\x7f' || k === '\b') backspace();
    else if (k === '\x10') move('up');
    else if (k === '\x0e') move('down');
    else if (k === '\x02') move('left');
    else if (k === '\x06') move('right');
    else if (move(k)) {
      // moved
    } else if (k.length === 1 && k >= ' ') insert(k);
    draw();
  }
}
