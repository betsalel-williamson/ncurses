/*
 * Bind several strings to one key code with define_key(), in a known order,
 * and print what keybound() returns for each count, to test what keybound(3X)
 * says about the order of the bindings. The executable check behind the errata
 * rows for keybound(3X). Built and run by key-check.sh.
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

static void bound(const char *label, int code, int count)
{
    char buf[64];
    char *s = keybound(code, count);
    vis(s, buf, sizeof buf);
    printf("%-36s keybound(%d, %d) = %s\n", label, code, count, buf);
    free(s);
}

static void define(const char *str, int code)
{
    char buf[64];
    vis(str, buf, sizeof buf);
    printf("define_key(%s, %d) = %s\n", buf, code, define_key(str, code) == OK ? "OK" : "ERR");
}

int main(void)
{
    FILE *out = fopen("/dev/null", "w");
    FILE *in = tmpfile();
    SCREEN *sp;
    int k;

    fputs("\033[aa2\033Oz3\033[zz1\033OP", in);   /* read by wgetch below */
    rewind(in);
    fflush(in);

    printf("%s\n\n", curses_version());
    bound("before newterm", 265, 0);

    if ((sp = newterm("xterm", out, in)) == NULL) { printf("newterm failed\n"); return 1; }
    keypad(stdscr, TRUE);
    printf("xterm kf1 = \\E%s, KEY_F(1) = %d\n\n", tigetstr("kf1") + 1, KEY_F(1));

    for (k = 0; k < 2; ++k) bound("terminfo only", KEY_F(1), k);

    printf("\nBind three more strings to KEY_F(1), in this order:\n");
    define("\033[zz1", KEY_F(1));
    define("\033[aa2", KEY_F(1));
    define("\033Oz3", KEY_F(1));
    for (k = 0; k < 5; ++k) bound("after the three", KEY_F(1), k);

    printf("\nInput \\E[aa2 \\EOz3 \\E[zz1 \\EOP; wgetch returns:");
    for (k = 0; k < 4; ++k) printf(" %d", wgetch(stdscr));
    printf("\n");

    printf("\nThen remove the one defined last:\n");
    define("\033Oz3", 0);
    for (k = 0; k < 4; ++k) bound("after removing \\EOz3", KEY_F(1), k);

    printf("\n");
    bound("negative count", KEY_F(1), -1);
    bound("key code 0", 0, 0);
    bound("negative key code", -1, 0);
    bound("unbound key code", 1500, 0);

    endwin();
    delscreen(sp);
    return 0;
}
