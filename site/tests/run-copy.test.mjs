// Copy to run's rules (code-run-copy.mjs), on shell text written for each case.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FAILED, feedbackNote, stripComment, toRunnable } from '../code-run-copy.mjs';

const strip = (line) => stripComment(line, { quote: '' }).text;

test('a # at the start of a word starts a comment', () => {
  assert.equal(strip('make   # build it'), 'make');
  assert.equal(strip('# a whole line'), '');
  assert.equal(strip('true;# after a semicolon'), 'true;');
});

test('a # inside a word, a parameter expansion, quotes or after a backslash stays', () => {
  for (const line of ['echo $#', 'echo ${#PATH}', "echo '# not a comment'", 'echo "#"', 'echo \\#', 'git log --format=%h#%s']) {
    assert.equal(strip(line), line);
  }
});

test('a quote left open carries to the next line', () => {
  const state = { quote: '' };
  assert.equal(stripComment('echo "one', state).text, 'echo "one');
  assert.equal(stripComment('# still in the string"  # now a comment', state).text, '# still in the string"');
});

test('commented steps are joined with && and end in a failure message', () => {
  const r = toRunnable('cd src      # go there\n\nmake        # build\nmake check  # test');
  assert.equal(r.text, `cd src &&\nmake &&\nmake check ||\n${FAILED}`);
  assert.equal(r.steps, 3);
  assert.equal(r.stopped, null);
});

test('a backslash continuation stays one step, with its lines', () => {
  const r = toRunnable('cd tree\nrun.sh \\\n\t--one \\\n\t--two >out.c');
  assert.equal(r.text, `cd tree &&\nrun.sh \\\n\t--one \\\n\t--two >out.c ||\n${FAILED}`);
  assert.equal(r.steps, 2);
});

test('a placeholder the site knows is filled in and reported', () => {
  const r = toRunnable('tar xf pkg-<version>.tgz  # unpack\ncd pkg-<version>', { '<version>': '9.1' });
  assert.equal(r.text, `tar xf pkg-9.1.tgz &&\ncd pkg-9.1 ||\n${FAILED}`);
  assert.deepEqual(r.used, ['<version> as 9.1']);
  assert.equal(feedbackNote(r, { '<version>': '9.1' }), 'with version 9.1');
});

test('an unknown placeholder means no button', () => {
  assert.match(toRunnable('make install DESTDIR=XXX  # where').refuse, /placeholder/);
  assert.match(toRunnable('cd <dir>\nmake').refuse, /placeholder/);
});

test('an interactive step ends the chain before it', () => {
  const r = toRunnable('make     # build\nmake check\nsu root  # become root\nmake install');
  assert.equal(r.text, `make &&\nmake check ||\n${FAILED}`);
  assert.equal(r.stopped, 'su root');
  assert.equal(feedbackNote(r), 'stops before su root');
  assert.equal(toRunnable('make\nsu -c "make install"').stopped, null);
});

test('one command with no comment gets no button; with a comment it does', () => {
  assert.match(toRunnable('cc prog.c -lcurses').refuse, /one command/);
  const r = toRunnable('cc prog.c -lcurses   # build');
  assert.equal(r.text, 'cc prog.c -lcurses');
  assert.equal(r.steps, 1);
});

test('here-documents, option fragments and control flow get no button', () => {
  assert.match(toRunnable("cat <<'EOF' >x\nhi\nEOF").refuse, /here-document/);
  assert.match(toRunnable('--with-a=1\n--with-b=2').refuse, /options/);
  assert.match(toRunnable('for f in *; do\n  echo $f\ndone').refuse, /control flow/);
  assert.match(toRunnable('make ||\n  echo failed').refuse, /control flow/);
});
