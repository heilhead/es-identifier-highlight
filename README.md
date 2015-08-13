# ES Identifier Highlight

Identifier highlight for JS/ES6/JSX heavily inspired by WebStorm's code highlight and inspection.

![A screenshot](http://i.imgur.com/18avdoZ.gif)

### Current Features
* Proper scope inspection
* Global variables detection
* ES6 support
* JSX support

### Future Plans
* Support for properties
* Support for `this`
* Highlight literals

### Issues
Currently code is parsed in strict mode, meaning that if there's an error in the code, it won't be parsed and highlighted. I'm not convinced that parsing needs to be done in "loose" mode and would advise to use [eslint](https://atom.io/packages/linter-eslint) instead to spot and fix errors.

Please report any issues.

### Contributions
Pull requests are welcome!

### License
MIT
