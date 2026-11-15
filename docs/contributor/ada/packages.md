# Packages

The binding's packages form one hierarchy under `Terminal_Interface`. Each name links to its specification in the source tree. Specifications under `Ada95/gen` are m4 templates, which the build turns into `.ads` files; the rest are under `Ada95/src`.

- [Terminal_Interface](../../../Ada95/src/terminal_interface.ads)
  - [Curses](../../../Ada95/gen/terminal_interface-curses.ads.m4)
    - [Aux](../../../Ada95/gen/terminal_interface-curses-aux.ads.m4)
    - [Mouse](../../../Ada95/gen/terminal_interface-curses-mouse.ads.m4)
    - [Panels](../../../Ada95/gen/terminal_interface-curses-panels.ads.m4)
      - [User_Data](../../../Ada95/gen/terminal_interface-curses-panels-user_data.ads.m4)
    - [Menus](../../../Ada95/gen/terminal_interface-curses-menus.ads.m4)
      - [Menu_User_Data](../../../Ada95/gen/terminal_interface-curses-menus-menu_user_data.ads.m4)
      - [Item_User_Data](../../../Ada95/gen/terminal_interface-curses-menus-item_user_data.ads.m4)
    - [Forms](../../../Ada95/gen/terminal_interface-curses-forms.ads.m4)
      - [Form_User_Data](../../../Ada95/gen/terminal_interface-curses-forms-form_user_data.ads.m4)
      - [Field_User_Data](../../../Ada95/gen/terminal_interface-curses-forms-field_user_data.ads.m4)
      - [Field_Types](../../../Ada95/gen/terminal_interface-curses-forms-field_types.ads.m4)
        - [Alpha](../../../Ada95/src/terminal_interface-curses-forms-field_types-alpha.ads)
        - [AlphaNumeric](../../../Ada95/src/terminal_interface-curses-forms-field_types-alphanumeric.ads)
        - [IntField](../../../Ada95/src/terminal_interface-curses-forms-field_types-intfield.ads)
        - [Numeric](../../../Ada95/src/terminal_interface-curses-forms-field_types-numeric.ads)
        - [RegExp](../../../Ada95/src/terminal_interface-curses-forms-field_types-regexp.ads)
        - [IPV4_Address](../../../Ada95/src/terminal_interface-curses-forms-field_types-ipv4_address.ads)
        - [Enumeration](../../../Ada95/src/terminal_interface-curses-forms-field_types-enumeration.ads)
          - [Ada](../../../Ada95/src/terminal_interface-curses-forms-field_types-enumeration-ada.ads)
        - [User](../../../Ada95/src/terminal_interface-curses-forms-field_types-user.ads)
          - [Choice](../../../Ada95/src/terminal_interface-curses-forms-field_types-user-choice.ads)
    - [PutWin](../../../Ada95/src/terminal_interface-curses-putwin.ads)
    - [Termcap](../../../Ada95/src/terminal_interface-curses-termcap.ads)
    - [Terminfo](../../../Ada95/src/terminal_interface-curses-terminfo.ads)
    - [Text_IO](../../../Ada95/src/terminal_interface-curses-text_io.ads)
      - [Integer_IO](../../../Ada95/src/terminal_interface-curses-text_io-integer_io.ads)
      - [Float_IO](../../../Ada95/src/terminal_interface-curses-text_io-float_io.ads)
      - [Fixed_IO](../../../Ada95/src/terminal_interface-curses-text_io-fixed_io.ads)
      - [Decimal_IO](../../../Ada95/src/terminal_interface-curses-text_io-decimal_io.ads)
      - [Modular_IO](../../../Ada95/src/terminal_interface-curses-text_io-modular_io.ads)
      - [Enumeration_IO](../../../Ada95/src/terminal_interface-curses-text_io-enumeration_io.ads)
      - [Complex_IO](../../../Ada95/src/terminal_interface-curses-text_io-complex_io.ads)
    - [Trace](../../../Ada95/gen/terminal_interface-curses-trace.ads.m4)

`Terminal_Interface.Curses.Text_IO.Aux` is a private child package, used only by the `Text_IO` packages.

## Generated HTML pages

The pages in `doc/html/ada` are generated, and they stay generated: `make html` in `Ada95/gen` runs gnathtml over the specifications to make a browsable, cross-referenced copy of each one, and builds the [name table](../../../doc/html/ada/table.html) from the `ANCHOR` comments in the m4 templates. Because they're made from the source, this guide links to the specifications themselves rather than migrating the generated copies.
