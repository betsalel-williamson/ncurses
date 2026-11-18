/*
 * Disable and re-enable function keys with keyok(), including a key with
 * several bindings, and print what keyok() returns, what keybound() and
 * has_key() report, and what wgetch() reads. The executable check behind the
 * errata rows for keyok(3X). Built and run by key-check.sh.
 */
#include <curses.h>
#include <term.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void vis(const char *str, char *buf, size_t size)
{
    size_t n = 0;
    if (str == NULL) { snprintf(buf, size, "NULL"); return; }
    buf[n++] = '"';
    for (; *str && n < size - 6; ++str) {
        if (*str == '\033') { strcpy(buf + n, "\\E"); n += 2; }
        else buf[n++] = *str;
    }
    buf[n++] = '"';
    buf[n] = '\0';
}

static void ok(const char *label, int code, int flag)
{
    int rc = keyok(code, flag);
    printf("%-44s keyok(%d, %s) = %s\n", label, code, flag ? "TRUE" : "FALSE", rc == OK ? "OK" : rc == ERR ? "ERR" : "other");
}

static void bindings(int code)
{
    char buf[64];
    int k;
    char *s;
    printf("    has_key(%d) = %d; keybound:", code, has_key(code));
    for (k = 0; (s = keybound(code, k)) != NULL; ++k) {
        vis(s, buf, sizeof buf);
        printf(" %s", buf);
        free(s);
    }
    printf("%s\n", k ? "" : " none");
}

static void reads(const char *label, int n)
{
    int k;
    printf("    wgetch %s:", label);
    for (k = 0; k < n; ++k) {
        int c = wgetch(stdscr);
        if (c == 033) printf(" ESC");
        else if (c > 32 && c < 127) printf(" '%c'", c);
        else printf(" %d", c);
    }
    printf("\n");
}

int main(void)
{
    FILE *out = fopen("/dev/null", "w");
    FILE *in = tmpfile();
    SCREEN *sp;

    /* read by wgetch: F1 while disabled, then F1 and \E[zz1 after re-enabling */
    fputs("\033OP" "\033OP\033[zz1", in);
    rewind(in);
    fflush(in);

    printf("%s\n\n", curses_version());
    ok("before newterm", 265, FALSE);

    if ((sp = newterm("xterm", out, in)) == NULL) { printf("newterm failed\n"); return 1; }
    keypad(stdscr, TRUE);
    printf("xterm kf1 = \\E%s, KEY_F(1) = %d, KEY_F(2) = %d\n\n", tigetstr("kf1") + 1, KEY_F(1), KEY_F(2));

    ok("1. enable a key that is enabled", KEY_F(2), TRUE);
    ok("2. key code 0", 0, FALSE);
    ok("3. negative key code", -1, FALSE);
    ok("4. a key code with no binding", 1500, FALSE);

    printf("\nBind \\E[zz1 to KEY_F(1) too: define_key = %s\n", define_key("\033[zz1", KEY_F(1)) == OK ? "OK" : "ERR");
    bindings(KEY_F(1));
    ok("5. disable KEY_F(1)", KEY_F(1), FALSE);
    bindings(KEY_F(1));
    reads("on \\EOP while disabled", 3);
    ok("6. disable it again", KEY_F(1), FALSE);
    ok("7. enable it", KEY_F(1), TRUE);
    bindings(KEY_F(1));
    reads("on \\EOP \\E[zz1 after enabling", 2);
    ok("8. enable it again", KEY_F(1), TRUE);

    endwin();
    delscreen(sp);
    return 0;
}
