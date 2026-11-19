/*
 * Call key_defined() on strings that are bound, unbound, prefixes of bound
 * strings, and bound strings with more after them, and print what it returns.
 * The executable check behind the errata rows for key_defined(3X).
 * Built and run by key-check.sh.
 */
#include <curses.h>
#include <term.h>
#include <stdio.h>
#include <string.h>

static void show(const char *label, const char *str)
{
    char vis[64];
    size_t n = 0;
    const char *p;
    if (str == NULL) strcpy(vis, "NULL");
    else {
        vis[n++] = '"';
        for (p = str; *p && n < sizeof vis - 6; ++p) {
            if (*p == '\033') { strcpy(vis + n, "\\E"); n += 2; }
            else vis[n++] = *p;
        }
        vis[n++] = '"';
        vis[n] = '\0';
    }
    printf("%-42s key_defined(%s) = %d\n", label, vis, key_defined(str));
}

int main(void)
{
    FILE *out = fopen("/dev/null", "w");
    FILE *in = fopen("/dev/null", "r");
    SCREEN *sp;
    const char *f1;
    char buf[64];

    printf("%s\n\n", curses_version());
    show("before newterm", "\033OP");

    if ((sp = newterm("xterm", out, in)) == NULL) { printf("newterm failed\n"); return 1; }
    keypad(stdscr, TRUE);
    f1 = tigetstr("kf1");
    printf("xterm kf1 = \\E%s, KEY_F(1) = %d\n\n", f1 + 1, KEY_F(1));

    show("1. kf1's string", f1);
    show("2. a string bound by define_key", (define_key("\033[99~", 1000), "\033[99~"));
    show("3. an unbound string", "\033[98~");
    show("4. a prefix of bound strings", "\033[");
    show("5. the escape character alone", "\033");
    snprintf(buf, sizeof buf, "%sx", f1);
    show("6. kf1's string plus one char", buf);
    show("7. \\E[99~ plus one char", "\033[99~x");
    show("8. empty string", "");
    show("9. NULL", NULL);
    show("10. a string starting with an unused char", "zz");

    endwin();
    delscreen(sp);
    return 0;
}
