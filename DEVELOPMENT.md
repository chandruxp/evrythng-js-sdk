# [Evrythng](https://www.evrythng.com) JavaScript SDK For Developers

Evrythng's JavaScript library is built using AMD modules and using RequireJS while
in dev, but then building a file for distribution that does not require an AMD loader.
It is compatible with the UMD pattern, meaning it can easily be used everywhere using
AMD and CommonJS-like (Node.js) script loaders, falling back to browser globals.


When the EvrythngJS library is built, it includes:

- [Almond](https://github.com/jrburke/almond): The built library also does not include 
require.js in the file, but instead uses *Almond*, a small AMD API implementation, that 
allows the built file's internal modules to work. These internal modules and this version 
of almond are not visible outside the built file, just used internally by the built file 
for code organization and referencing.

- [RSVP](https://github.com/tildeio/rsvp.js): a lightweight Promises/A+ (1.1)-compliant
library used while native Promises don't get implemented in all browsers. This library 
has the same ES6 Promise interface for easy future update. However, this might change in 
the future for an even lighter ES6-Promise shim.


## File structure

- **dist/evrythng.*.js**: the built library suitable for distribution 
(uncompress and minified versions).
- **dist/evrythng.min.map**: source maps for the minified version. This allows the 
developer to open the Developer Tools in the browser and debug the minified code as if
was the development version.
* **lib**: contains dependencies or bundled scripts. RSVP.js for now.
* **test**: the Jasmine-based Unit tests. All tests in 'test/spec/all' refer to unit
testing using Karma and RequireJS. The file 'test/spec/evrythngDistSpec.js' defines
a small test suite used to test UMD (Karma + RequireJS, Karma + browser globals and 
Node Jasmine) and cross-browser compatibility in Sauce Labs.
* **tools**: the helper tools/scripts used to build the output file.
* **src**: holds the source code in the form of sub-modules used by the main 
`src/evrythng.js`.
* **karma.conf*.js**: Karma test configurations.

## How to develop

- Modify `evrythng.js` and its submodules in the `src` directory.
- Add new unit tests for the added functionality
- Build, which will take care of the build process, versioning and testing process:

```
grunt build
```
  
- You can also run tests using any of the Grunt test tasks:

```
grunt test // unit testing with Karma + PhantomJS    
```

```
grunt test:dist // test UMD in Chrome (AMD + browser globals) and Node
```

```
grunt test:sauce // browser globals test in multiple browsers in SauceLabs
```

## How to build

Simply run:

    grunt build

To generate the built files in `dist/evrythng.*`.

## Documentation

Documentation uses Groc, which depends on Node.js and Pygments. Install 
Pygments by:

    sudo easy_install pip
    sudo pip install Pygments
    
After you have this, run:

    grunt doc
    
By default Groc will try to update the Documentation in the `gh-pages` branch.
This needs a clean repo (no uncommited changes) and a following push to the 
remote (Github).

If you want to view the generated documentation before deploying, uncomment the
following lines in the **grunt groc task options**:

    out: "docs/",
    //github: true,
    