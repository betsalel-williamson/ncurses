/* sleep() and usleep() for the test programs the pretend shell runs (build-examples.mjs).
 * Emscripten's own spin until the time is up, and the page can't draw meanwhile. napms()
 * waits in poll(), which examples/pty.js suspends with Asyncify, so the page keeps drawing. */
#include <curses.h>
#include <unistd.h>

unsigned
sleep(unsigned seconds)
{
    napms((int) seconds * 1000);
    return 0;
}

int
usleep(useconds_t usec)
{
    napms((int) (usec / 1000));
    return 0;
}
