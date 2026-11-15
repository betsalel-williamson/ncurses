# Get ncurses

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

`ncurses` usually comes with your operating system. If you don't have the library, or want to compile it on your own, it can be obtained from

- the home page at <https://invisible-island.net/ncurses/>,
- <https://ftp.gnu.org/pub/gnu/ncurses/>, or
- any of the GNU mirror sites listed at <https://www.gnu.org/order/ftp.html>.

Read the `README` file and the [installation guide](../../contributor/install/index.md) for details on how to install it. It usually involves the following operations:

```sh
tar zxvf ncurses-<version>.tar.gz   # unzip and untar the archive
cd ncurses-<version>                # cd to the directory
./configure                         # configure the build for your system
make                                # make it
su root                             # become root
make install                        # install it
```

To build a program you also need the library's header files. Operating systems that split libraries into packages usually put them in a separate development package.
