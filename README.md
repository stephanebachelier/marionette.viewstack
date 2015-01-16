# Marionette.Viewstack

[![Build Status](https://secure.travis-ci.org/stephanebachelier/marionette.viewstack.png?branch=master)](http://travis-ci.org/stephanebachelier/marionette.viewstack)

A view stack implementation for Marionette

## Installation

Probably the best option is to use bower to install Marionette.ViewStack
```
$ bower install --save marionette.viewstack
```

or if you want to use with node:
```
$ npm install --save-dev marionette.viewstack
```

## Documentation

`Marionette.Viewstack` is a library to ease view stacking management. It provides basic stack operations in a view context, such as `pop`, `push`, `swap` to add or remove a view on the current stack.

## Alternative

* (backbone.viewstack)[https://github.com/Creative-Licence-Digital/backbone.viewstack]
* (backbone.viewstack.js)[https://github.com/Creative-Licence-Digital/backbone.viewstack]

`backbone.viewstack.js` seems the more advanced and with a great demo but it does not cover my needs, where I don't need a view stack defined as a view.

So I decided to create my own one based on the follow features:
* push a view
* pop a view
* pop some views
* swap views
* view animation agnostic
* enable to manipulate the stack with an history

## Usage

## API

### push(view, options)

Push a view on top of any existing view.

### popAll()

Remove all the views on the stack

### pop(view)

Pop off the given view from the stack, or by default the current view which is the one of the top.

### popUntil(view)

If `view` is defined it will pop all the views from the top of the stack until the view is found. If the view is not found it will act as a `pop()` operation, which is to remove the view on the top of the stack.

### swap(view, options)

Swap the given view to place it at the top of the stack.

## License

MIT
