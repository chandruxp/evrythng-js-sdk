# [Evrythng](https://www.evrythng.com) JavaScript SDK For Developers

Evrythng's JavaScript library is built using AMD modules and using RequireJS while
in dev, but then building a file for distribution that does not require an AMD loader.
It is compatible with the UMD pattern, meaning it can easily be used everywhere using
AMD and CommonJS-like (Node.js) script loaders, falling back to browser globals.


The library also depends on two other libraries:

* jQuery, which registers as an AMD library.
* underscore, which does not register as an AMD library. So the
[requirejs shim config](http://requirejs.org/docs/api.html#config-shim) is used
when loading underscore in an AMD setting.

When the library is built, it **excludes** jQuery and underscore from the
built library. Consumers of the built library will  provide a jQuery and
underscore for the library. If the consumer uses an AMD loader, then the built
file will ask for 'jquery' and 'underscore' as AMD dependencies. If the consumer
just uses browser globals and script tags, the library will grab the `$` and
`_` global variables and use them for the jQuery and underscore dependencies.

The built library also does not include require.js in the file, but instead
uses [almond](https://github.com/jrburke/almond), a small AMD API
implementation, that allows the built file's internal modules to work. These
internal modules and this version of almond are not visible outside the built
file, just used internally by the built file for code organization and
referencing.

When building the r.js optimiser is used in grunt to compiler all the requirejs
file into a single distributable file with almond.


## File structure

* **dist/evrythng.js**: the built library suitable for distribution.
* **lib**: contains lib scripts used during dev and testing.
* **tests**: the QUnit-based tests.
* **tools**: the helper tools/scripts used to build the output file.
* **evrythng**: holds the sub-modules used by the main `evrythng.js` module
to help implement the library's functionality.
* **evrythng.js**: the main module entry point for the source-form of the
library.

## How to develop

* Modify `evrythng.js` and its submodules in the `evrythng` directory.
* Create tests for the functionality in the `tests` directory. It is currently
using QUnit for unit testing.
* Load `tests/index.html` to run the tests or run:
    grunt test

** **tests/index-dist-amd.html**: For testing the dist version of the library
with an AMD loader.
** **tests/index-dist-global.html**: For testing the dist version of the library
in a "browser globals and script tags" environment.

## How to build

Simply run:

    grunt build

To generate the built file in `dist/evrythng.js`.

## Documentation

Documentation uses Groc, which depends on Node.js and Pygments. Install Pygments by:

    sudo easy_install pip
    sudo pip install Pygments
