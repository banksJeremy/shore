Shore
=====

Source: [github.com/jeremybanks/shore](http://github.com/jeremybanks/shore)  
Website/demo: [jeremybanks.github.com/shore](http://jeremybanks.github.com/)

About
-----

Shore is a math library implemented in CoffeeScript. A browser interface is
included, along with the compiled JavaScript, so it should be usable on its
own or as library "out-of-the-box".

Developed with Chrome, should work the same in Safari, a bit less polished in 
Firefox and Opera, and remain functional in IE.

The interface has a LaTeX-style output format that requires you download
MathJax to `dep/MathJax`. If you do not it will fall back to plain-text output,
but at least for the moment this isn't given much attention.

Using the library on its own requires only `shore.*`, but you'll
probably also want to include `shore.parser.*`.

It is intended that this will eventually be able to gracefully degrade in the
absence of JavaScript and allow the calculations to be performed server-side,
presumably using node.js. But not yet.

Modifying the parser requires node.js and Jison.

Credits
-------

Author: Jeremy Banks <<jeremy@jeremybanks.com>>

Shore makes use of the following:

  - [CoffeeScript](http://jashkenas.github.com/coffee-script/)
  - [Jison](http://zaach.github.com/jison/)
  - [jQuery](http://jquery.com/)
  - [MathJax](http://www.mathjax.org/)

See `LICENSE` file for copyright/license information.

Documentation
-------------

There'll be some once version 1.0 is finished.

TODO
----

### `v0.1`

  - Canonization of `shore.Sum`, `shore.Product`.
  - Merge `shore.Exponent` into `shore.Product`.
  - All defining attributes go onto `shore.Value().components`, which can
    typically be canonized without requiring class-specific code.
  - Support engineering notation in `shore.parser`.

### `v0.2`

  - Complete initial version of `shore.WithMarginOfError`.
  - Complete initial version of `shore.Derivative`.
  - Complete initial version of `shore.Integral`.
    - No support for anything difficult.
  - Pretty formatting for `shore.Number`?

### `v1.0`

  - Make the code decent
  - Write at least some basic documentation
  - Documentation!

### `v1.1`

  - `shore.Restricted`.
  - `shore.System`
    - Parsed from multiline input.
    - Can substitute value to solve simple systems.
    - Maybe add/remove restrictions where appropriate?

### The Future

  - Memoization.
  - Abstract away identifier values.
  - Support HTML5 offline cache?
