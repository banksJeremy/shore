Shore
=====

Source: [github.com/jeremybanks/shore](http://github.com/jeremybanks/shore)  
Demo: [jeremybanks.github.com/shore](http://jeremybanks.github.com/shore/)

About
-----

Shore is a math library implemented in CoffeeScript. A browser interface is
included.

Developed with Chrome, should work the same in Safari, a bit less polished in 
Firefox and Opera, and remain functional in IE.

Compiled copies of all files are included. Recommendedly after downloading
MathJax you just need to open main.html and you're off.

Dependencies
------------

### To Use Library

- *Your Imagination*

### To Use Interface

- Web browser
- [MathJax](http://www.mathjax.org/) in `dep/mathjax-1.0.1` (recommended, a
  plain-text fallback is available for use without but it's not very good)

### To Build Shore (Excluding Parser)

- [CoffeeScript](http://jashkenas.github.com/coffee-script/)

### To Build Parser

- [Jison](http://zaach.github.com/jison/)
- [node.js](http://nodejs.org/)

### To Build Stylesheet

- [Sass](http://sass-lang.com/)

Credits
-------

Shore is developed by Jeremy Banks <<jeremy@jeremybanks.com>>. Please see
`LICENSE` file for complete credits and copyright/license information.

Documentation
-------------

There'll be some once version 1.0 is finished.

TODO
----

### `v0.1`

  - Merge `shore.Exponent` with `shore.Product`.
  - Implement all simple canonizations.

### `v0.2`

  - `shore.System`
    - Parsed from multiline input.
    - Can substitute value to solve simple systems.

### `v0.3`

  - Organize canonizations better.
  - Support engineering notation in `shore.parser`.
  - Complete initial version of `shore.WithMarginOfError`.
  - Pretty formatting for `shore.Number`?

### `v1.0`

  - x ~ ~ t for double integral, etc.
  - Make the code decent.
  - Documentation!

### `v1.1`

- `shore.Inequality`
  - Just ≠ for now.
- `shore.Restricted`
  - Implications of potential division by zero, and such.

### Non-concrete Future Thinkings

  - Abstract away identifier values.
  - Support HTML5 offline cache?
  - Make nice on iPod touch/iPhone.
  - Maybe allow more conventional functions via subscripts:  
    `fib_n = fib_(n-1) + fib_(n-2); fib_0 = fib_1 = 1`
  - A node.js server script that allows for graceful degradation to
    performing calculations server-side in the absence of enabled JavaScript.
