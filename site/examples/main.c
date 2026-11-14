/* Entry point for a runnable example: the listing's main() is compiled as example_main(), and
 * exit() reports its status to the page. A plain return from main() is lost once Asyncify has
 * suspended the program, so the page would never learn that it ended. */
#include <stdlib.h>

int example_main(void);

int
main(void)
{
    exit(example_main());
}
