/* Entry point for a runnable example whose main() takes arguments: the page passes the ones
 * build-examples.mjs recorded (the listing's own source, embedded as example.c), and exit()
 * reports the status, as in main.c. */
#include <stdlib.h>

int example_main(int argc, char *argv[]);

int
main(int argc, char *argv[])
{
    exit(example_main(argc, argv));
}
