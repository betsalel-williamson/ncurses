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
sudo make install                   # install it as root
```

Before you unpack a release, you can check that it isn't damaged or altered. The SHA-256 of `ncurses-6.6.tar.gz` is `355b4cbbed880b0381a04c46617b7656e362585d52e9cf84a67e2009b749ff11`; compare it with your system's checksum tool. The release is also signed: the GNU site has `ncurses-<version>.tar.gz.sig` and the home page has `ncurses-<version>.tar.gz.asc`. Check either with `gpg --verify` against Thomas E. Dickey's key, whose fingerprint is `1988 2D92 DDA4 C400 C22C 0D56 CC2A F447 2167 BE03`.

To build a program you also need the library's header files. Operating systems that split libraries into packages usually put them in a separate development package.
