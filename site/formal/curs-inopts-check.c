/*
 * Check the claims in curs_inopts(3X) against the library: what the input
 * options return after setupterm alone and after newterm, halfdelay's range,
 * what wgetch returns for an invalid escape sequence, and which key code wins
 * when two standard key capabilities have the same string. The executable
 * check behind the errata rows for curs_inopts(3X). Built and run by
 * key-check.sh, which compiles xterm, and the dupkeys entry this program
 * expects, into a temporary database.
 */
#define _XOPEN_SOURCE 600
#include <curses.h>
#include <term.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define RC(e) ((e) == OK ? "OK" : (e) == ERR ? "ERR" : "other")

static void show(const char *label, int rc)
{
    printf("    %-24s = %s\n", label, RC(rc));
}

static void flags(void)
{
    printf("    is_cbreak() = %d, is_echo() = %d, is_nl() = %d, is_raw() = %d\n",
           is_cbreak(), is_echo(), is_nl(), is_raw());
}

static void options(void)
{
    show("cbreak()", cbreak());
    show("nocbreak()", nocbreak());
    show("echo()", echo());
    show("noecho()", noecho());
    show("nl()", nl());
    show("nonl()", nonl());
    show("raw()", raw());
    show("noraw()", noraw());
    show("halfdelay(5)", halfdelay(5));
    show("intrflush(NULL, TRUE)", intrflush(NULL, TRUE));
    show("meta(NULL, TRUE)", meta(NULL, TRUE));
    show("typeahead(-1)", typeahead(-1));
}

static void reads(const char *label, int n)
{
    int k;
    printf("    wgetch on %s:", label);
    for (k = 0; k < n; ++k) {
        int c = wgetch(stdscr);
        if (c == 033) printf(" ESC");
        else if (c > 32 && c < 127) printf(" '%c'", c);
        else printf(" %d (%s)", c, c == ERR ? "ERR" : keyname(c));
    }
    printf("\n");
}

static FILE *input(const char *text)
{
    FILE *in = tmpfile();
    fputs(text, in);
    rewind(in);
    return in;
}

int main(void)
{
    int master, err;
    FILE *out = fopen("/dev/null", "w");
    FILE *in;
    SCREEN *sp;

    printf("%s\n\n", curses_version());

    /* A pseudo-terminal, so that the terminal-mode calls have a real terminal to change. */
    master = posix_openpt(O_RDWR | O_NOCTTY);
    if (master < 0 || grantpt(master) || unlockpt(master)) { printf("no pty\n"); return 1; }
    {
        int slave = open(ptsname(master), O_RDWR | O_NOCTTY);
        printf("1. before setupterm\n");
        flags();
        printf("2. after setupterm(\"xterm\") on a pseudo-terminal, with no screen\n");
        if (setupterm("xterm", slave, &err) != OK) { printf("setupterm failed\n"); return 1; }
        flags();
        options();
        flags();
        del_curterm(cur_term);
        close(slave);
    }

    printf("3. after newterm(\"xterm\") on a file, so the terminal-mode calls have no terminal\n");
    in = input("");
    if ((sp = newterm("xterm", out, in)) == NULL) { printf("newterm failed\n"); return 1; }
    flags();
    options();
    printf("4. halfdelay's range, after newterm\n");
    show("halfdelay(0)", halfdelay(0));
    show("halfdelay(1)", halfdelay(1));
    show("halfdelay(255)", halfdelay(255));
    show("halfdelay(256)", halfdelay(256));
    show("halfdelay(-1)", halfdelay(-1));
    printf("5. NULL windows\n");
    show("keypad(NULL, TRUE)", keypad(NULL, TRUE));
    show("nodelay(NULL, TRUE)", nodelay(NULL, TRUE));
    show("notimeout(NULL, TRUE)", notimeout(NULL, TRUE));
    endwin();
    delscreen(sp);
    fclose(in);

    printf("6. keypad on, xterm, an invalid sequence: \\E[zzq, then \\EOzq\n");
    in = input("\033[zzq" "\033Ozq");
    sp = newterm("xterm", out, in);
    keypad(stdscr, TRUE);
    reads("\\E[zzq", 5);
    reads("\\EOzq", 4);
    endwin();
    delscreen(sp);
    fclose(in);

    printf("7. keypad on, dupkeys: kbs and ka1 are both \\E[x, khome and kc1 are both \\E[y\n");
    printf("    strfnames order: kbs (%d) before ka1, khome before kc1\n", KEY_BACKSPACE);
    in = input("\033[x" "\033[y");
    sp = newterm("dupkeys", out, in);
    keypad(stdscr, TRUE);
    reads("\\E[x \\E[y", 2);
    endwin();
    delscreen(sp);
    fclose(in);
    return 0;
}
