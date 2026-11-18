/*
 * Call define_key() in each case its manual page covers, and some it does not,
 * and print what it returns and what key_defined() and has_key() report after.
 * The executable check behind the errata rows for define_key(3X).
 * Built and run by define-key-check.sh.
 */
#include <curses.h>
#include <term.h>
#include <stdio.h>
#include <string.h>

static const char *rc(int code) { return code == OK ? "OK" : code == ERR ? "ERR" : "other"; }

static void show(const char *label, const char *str, int code)
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
    printf("%-42s define_key(%s, %d) = ", label, vis, code);
}

#define CALL(label, str, code) do { \
    show(label, str, code); \
    printf("%s\n", rc(define_key(str, code))); } while (0)
#define DEFINED(str) printf("    key_defined(%s) = %d\n", #str, key_defined(str))
#define HAS(code) printf("    has_key(%s) = %d\n", #code, has_key(code))

int main(void)
{
    FILE *out = fopen("/dev/null", "w");
    FILE *in = tmpfile();
    const char *f1;
    char longer[64];

    fputs("\033[97~", in);   /* read by wgetch in case 14 */
    rewind(in);
    fflush(in);

    printf("%s\n\n", curses_version());

    CALL("before newterm", "\033[99~", 1000);

    SCREEN *sp;

    if ((sp = newterm("xterm", out, in)) == NULL) { printf("newterm failed\n"); return 1; }
    keypad(stdscr, TRUE);
    f1 = tigetstr("kf1");
    printf("xterm kf1 = \\E%s, KEY_F(1) = %d, KEY_F(2) = %d\n\n", f1 + 1, KEY_F(1), KEY_F(2));

    CALL("1. new string, new code", "\033[99~", 1000);
    DEFINED("\033[99~");
    CALL("2. same string, same code again", "\033[99~", 1000);
    DEFINED("\033[99~");
    CALL("3. same string, another code", "\033[99~", 1001);
    DEFINED("\033[99~");
    CALL("4. NULL, a code that is bound", NULL, 1001);
    DEFINED("\033[99~");
    CALL("5. NULL, a code never bound", NULL, 1002);
    CALL("6. unbound string, code 0", "\033[98~", 0);
    CALL("7a. bind a string", "\033[98~", 1003);
    CALL("7b. the bound string, code 0", "\033[98~", 0);
    DEFINED("\033[98~");
    CALL("7c. bind it again", "\033[98~", 1003);
    CALL("7d. the bound string, code -5", "\033[98~", -5);
    DEFINED("\033[98~");
    CALL("8. NULL, code 0", NULL, 0);
    CALL("9. a prefix of bound strings", "\033[", 1004);
    snprintf(longer, sizeof longer, "%sx", f1);
    CALL("10. a bound string (kf1) plus one char", longer, 1005);
    CALL("11. empty string", "", 1006);
    CALL("12. kf1's string, a new code", f1, 1007);
    DEFINED(f1);
    HAS(KEY_F(1));
    CALL("13. NULL, KEY_F(2) (bound by terminfo)", NULL, KEY_F(2));
    HAS(KEY_F(2));
    CALL("14. a code above 65535", "\033[97~", 65536 + 1003);
    DEFINED("\033[97~");
    printf("    wgetch() after the input \\E[97~ = %d\n", wgetch(stdscr));

    endwin();
    delscreen(sp);
    return 0;
}
