# ES Identifier Highlight
[![Build Status](https://travis-ci.org/heilhead/es-identifier-highlight.svg?branch=master)](https://travis-ci.org/heilhead/es-identifier-highlight)
[![Code Climate](https://codeclimate.com/github/heilhead/es-identifier-highlight/badges/gpa.svg)](https://codeclimate.com/github/heilhead/es-identifier-highlight)

Atom plugin for JS/ES6/JSX identifier highlighting. Heavily inspired by WebStorm's code highlight and inspection.

![A screenshot](http://i.imgur.com/18avdoZ.gif)

### Current Features
* Uses [babylon](https://github.com/babel/babylon) which brings support for (almost) all of [babel](https://github.com/babel/babel) features
* Proper scope inspection
* Global variables detection
* Shows variable definition
* Shows properties, class methods and literals usages
* ES6 support
* JSX support
* Hashbang/shell script support
* Light theme support (see Settings)
* Jumping between symbol instances (shift+alt+left and shift+alt+right)
* Jump to declaration (shift+alt+up)
* Rename symbol (alt+r alt+r)

### Issues
Currently code is parsed in strict mode, meaning that if there's an error in the code, it won't be parsed and highlighted. I'm not convinced that parsing should to be done in loose mode and would advise to use [eslint](https://atom.io/packages/linter-eslint) instead to spot and fix errors.

Please report any issues.

### Contributions
Pull requests are welcome!

### License
MIT
