# Widget libraries and tools

> Adapted from *NCURSES Programming HOWTO*, by Pradeep Padala.

Once you've seen what ncurses and its companion libraries can do, you may be ready for a project that works the screen hard. Complex widgets can be hard to write and maintain in plain ncurses, even with the [panels](../../glossary/panel.md), menus and forms libraries. Ready-made tools and widget libraries can stand in for widgets of your own. Use them, take ideas from their code, or extend them.

## CDK, the Curses Development Kit

In its author's words, "CDK stands for 'Curses Development Kit' and it currently contains 21 ready to use widgets which facilitate the speedy development of full screen curses programs."

The widgets can be used in your programs directly. The kit is well written and well documented, and the programs in its `examples` directory are a good place for a beginner to start. Thomas Dickey maintains CDK and has changed some of its widgets. Download it from [invisible-island.net/cdk](https://invisible-island.net/cdk/) and follow the instructions in its `README` file to install it.

### Widgets

| Widget              | What it does                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Alphalist           | Lets the user select from a list of words, narrowing the list by typing the first few characters of the word.                |
| Buttonbox           | A widget of several buttons.                                                                                                 |
| Calendar            | A small calendar.                                                                                                            |
| Dialog              | Shows the user a message, with buttons to pick an answer from.                                                               |
| Entry               | Lets the user enter various kinds of information.                                                                            |
| File Selector       | A file selector built from CDK's base widgets, as an example of building more complicated widgets with the library.          |
| Graph               | Draws a graph.                                                                                                               |
| Histogram           | Draws a histogram.                                                                                                           |
| Item List           | A pop-up field for choosing one of several values in a small space, such as days of the week or names of months.             |
| Label               | Shows messages in a pop-up box, or as part of the screen.                                                                    |
| Marquee             | Shows a message in a scrolling marquee.                                                                                      |
| Matrix              | A complex matrix with many options.                                                                                          |
| Menu                | A pull-down menu.                                                                                                            |
| Multiple Line Entry | An entry field of several lines, for long fields such as a description.                                                      |
| Radio List          | A list of radio buttons.                                                                                                     |
| Scale               | A numeric scale, for picking a number within a range.                                                                        |
| Scrolling List      | A scrolling list or menu.                                                                                                    |
| Scrolling Window    | A scrolling viewer, such as for a log file, that can take more lines while it runs. Useful for showing progress.             |
| Selection List      | A list for selecting several options.                                                                                        |
| Slider              | Like the scale, but shows the value as a sliding bar.                                                                        |
| Template            | An entry field with positions for particular characters, for formatted values such as dates and phone numbers.               |
| Viewer              | A viewer for a file or other information. Useful for showing a lot of text.                                                  |

### Formatted strings

Besides the widgets, CDK solves a frustrating problem: printing strings in several colors, or justified. You can embed formatting tags in the strings you pass to CDK functions. For example, given this string, `newCDKLabel()` prints the line in yellow on blue:

```c
"</B/1>This line should have a yellow foreground and a blue background.<!1>"
```

Other tags justify strings, embed special drawing characters, and more. The `cdk_display(3)` manual page, which comes with CDK, explains them with examples.

All in all, CDK is a well-written set of widgets that, used well, makes a strong framework for complex interfaces.

## dialog

In September 1994, Jeff Tranter wrote an [article on dialog](https://www.linuxjournal.com/article/2807) in *Linux Journal*. It begins:

> Linux is based on the Unix operating system, but also features a number of unique and useful kernel features and application programs that often go beyond what is available under Unix. One little-known gem is "dialog", a utility for creating professional-looking dialog boxes from within shell scripts. This article presents a tutorial introduction to the dialog utility, and shows examples of how and where it can be used.

dialog makes professional-looking dialog boxes, menus, checklists and more with ease. Many systems install it by default. If yours doesn't, download it from [Thomas Dickey's site](https://invisible-island.net/dialog/). The article gives a good overview of its uses, and the manual page has the details. One well-known use is configuring the Linux kernel in text mode, which uses a modified version of dialog.

dialog was designed for shell scripts. To use it from a C program, use its library, libdialog. Its documentation is sparse, and the definitive reference is the `dialog.h` header that comes with it. You may need to adjust things to get the output you want, but the source is easy to customize.

## Perl modules: Curses and Curses::Widgets

The Perl modules Curses, Curses::Form and Curses::Widgets give Perl access to curses. With curses and Perl installed, get them from CPAN: [Curses](https://metacpan.org/dist/Curses), [Curses::Form](https://metacpan.org/pod/Curses::Form) and [Curses::Widgets](https://metacpan.org/dist/Curses-Widgets). Once installed, use them from Perl scripts like any other module. The `perlmod` manual page explains Perl modules. These modules come with good documentation and demonstration scripts. The widgets are basic, but the modules give Perl good access to the curses library.

Anuradha Ratnaweera converted some of the HOWTO's examples to Perl. They're in the `perl` directory of the HOWTO's [example archive](https://invisible-island.net/ncurses/howto/ncurses_programs.tar.gz).

The manual pages `Curses(3)`, `Curses::Form(3)` and `Curses::Widgets(3)` have more. They're installed with the modules.
