/*
 * The name field of a compiled terminfo entry, as ncurses writes and reads it.
 *
 * term(5) says "the name field cannot exceed 128 bytes". This model encodes what the code does
 * with a name of L characters (L bytes before its terminating NUL), and asks the solver whether
 * 128 is the limit.
 *
 * Writer, ncurses/tinfo/write_entry.c:
 *   771  namelen = strlen(namelist) + 1;
 *   812  namelen = Min(namelen, MAX_NAME_SIZE + 1);      MAX_NAME_SIZE is 512 (include/tic.h:104)
 *   813  LITTLE_ENDIAN(buf + 2, namelen);                 the header's name_size
 *   822  Write(namelist, sizeof(char), namelen)
 *
 * Reader, ncurses/tinfo/read_entry.c (_nc_read_termtype):
 *   362  name_size < 0 rejects the entry                  (no other check on name_size)
 *   381  want = Min(MAX_NAME_SIZE, (unsigned) name_size);
 *   384  Read(ptr->term_names, want)                      consumes want bytes
 *   387  ptr->term_names[want] = '\0';
 *   390  if (have > MAX_NAME_SIZE) offset = ...           never true: have <= want <= 512
 *
 * A name survives the round trip when the reader consumes exactly the bytes the writer wrote
 * (otherwise every field after the name is read from the wrong place) and gets the whole name.
 *
 * Integers are 11 bits (-1024..1023), so names up to 1000 characters are covered exhaustively.
 */

let MAX_NAME_SIZE = 512

fun min[a, b: Int]: Int { a <= b implies a else b }

// The header's name_size, and the bytes written, for a name of len characters.
fun namelen[len: Int]: Int { min[plus[len, 1], plus[MAX_NAME_SIZE, 1]] }

// The bytes the reader consumes for that header.
fun want[len: Int]: Int { min[MAX_NAME_SIZE, namelen[len]] }

// The writer's bytes include the terminating NUL only when the whole name plus NUL fit.
pred nulWritten[len: Int] { plus[len, 1] <= namelen[len] }

// The name the reader ends up with: up to the NUL if it read one, else all want bytes.
fun nameRead[len: Int]: Int { (nulWritten[len] and len < want[len]) implies len else want[len] }

pred accepted[len: Int] { namelen[len] >= 0 }
pred aligned[len: Int] { want[len] = namelen[len] }
pred roundTrip[len: Int] { accepted[len] and aligned[len] and nameRead[len] = len }

pred inRange[len: Int] { len >= 0 and len <= 1000 }

// term(5)'s claim. A counterexample is a name longer than 128 bytes that ncurses writes and reads back.
assert NameNeverExceeds128 { all len: Int | inRange[len] and roundTrip[len] implies len <= 128 }
check NameNeverExceeds128 for 11 Int expect 1

// The actual limit: a name round-trips exactly when it has at most 511 characters,
// so with its NUL it fills at most MAX_NAME_SIZE (512) bytes.
assert LimitIs511 { all len: Int | inRange[len] implies (roundTrip[len] iff len <= 511) }
check LimitIs511 for 11 Int expect 0

// At 512 characters or more the writer stores 513 bytes but the reader takes 512, so the
// fields after the name are read one byte off.
assert LongerNamesMisalign { all len: Int | inRange[len] and len >= 512 implies not aligned[len] }
check LongerNamesMisalign for 11 Int expect 0

// A concrete witness against term(5): a 200-character name round-trips.
run Witness200 { roundTrip[200] } for 11 Int expect 1
