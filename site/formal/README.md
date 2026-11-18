# Formal checks behind the errata

Some errata rows rest on a claim about what the code does that is easier to prove than to argue.
Each claim here has a model and an executable check, and the errata row names both.

## term(5): the name field of a compiled entry

`term-name-field.als` is an Alloy model of how ncurses writes and reads the name field of a
compiled terminfo entry. Each line of the model cites the code it encodes, in
`ncurses/tinfo/write_entry.c` and `ncurses/tinfo/read_entry.c`. It checks every name length from 0
to 1000:

| Command | Expected | Meaning |
| --- | --- | --- |
| `NameNeverExceeds128` | counterexample | term(5)'s former "cannot exceed 128 bytes" is false |
| `LimitIs511` | no counterexample | a name round-trips exactly when it has at most 511 characters, 512 bytes with its NUL |
| `LongerNamesMisalign` | no counterexample | at 512 characters or more, the reader takes one byte less than the writer wrote |
| `Witness200` | instance | a 200-character name round-trips |

Run it with Java 17 or later and Alloy 6.2.0, the version Merlon Docs pins:

```sh
curl -sSfLo alloy.jar https://repo1.maven.org/maven2/org/alloytools/org.alloytools.alloy.dist/6.2.0/org.alloytools.alloy.dist-6.2.0.jar
sha256sum alloy.jar   # 6037cbeee0e8423c1c468447ed10f5fcf2f2743a2ffc39cb1c81f2905c0fdb9d
java -jar alloy.jar exec -f -c '*' -t text -o /tmp/term-name site/formal/term-name-field.als
```

`term-name-field-roundtrip.sh` checks the same thing with the real programs. It compiles entries
with names of the given lengths, reads them back with infocmp, and reports what survives. Build
this tree and install the programs first:

```sh
mkdir /tmp/nc && cd /tmp/nc
/path/to/ncurses/configure --prefix=/tmp/nc/inst --without-ada --without-cxx-binding --without-manpages --without-tests --disable-db-install
make && make install.progs install.libs
/path/to/ncurses/site/formal/term-name-field-roundtrip.sh /tmp/nc/inst/bin
```

With ncurses 6.6.20261107, names of up to 511 characters read back whole with every capability.
At 512 characters or more, tic writes an entry without complaint, but infocmp reports "corrupt
data found in convert_strings" and `tput -T` reports an unknown terminal.

## tput(1), clear(1) and tabs(1)

`utilities-check.sh` runs tput, clear and tabs built from this tree against what their pages
say, and prints each command's exit status, output and errors. It compiles the entries it needs
from `misc/terminfo.src`, so the system's terminal database plays no part. Build the programs as
above, then:

```sh
/path/to/ncurses/site/formal/utilities-check.sh /tmp/nc/inst/bin
```

`evidence/tput-clear-tabs/` holds its output with ncurses 6.6.20261107, and a table of each claim,
its result and the code behind it.

## define_key(3X)

`define-key-check.c` calls define_key in each case its page covers, and some it does not, and
prints what it returns and what key_defined, has_key and wgetch report after. `key-check.sh`
builds it against an install of this tree, which also needs `make install.includes`, and runs it
with an xterm entry compiled from `misc/terminfo.src`:

```sh
/path/to/ncurses/site/formal/key-check.sh /tmp/nc/inst define-key
```

`evidence/define-key/` holds its output with ncurses 6.6.20261107.

## key_defined(3X)

`key-defined-check.c` asks key_defined about bound strings, unbound ones, prefixes of bound
strings, and bound strings with more after them. Run it with the same runner:

```sh
/path/to/ncurses/site/formal/key-check.sh /tmp/nc/inst key-defined
```

`evidence/key-defined/` holds its output with ncurses 6.6.20261107.
