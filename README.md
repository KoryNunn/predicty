# predicty

A super light-weight auto-complete component.

Desgined to be easily inherited from and extended.

# usage

## Quick example:

```shell
npm install predicty
```


```javascript

var Predicty = require('predicty');

var autocomplete = new Predicty();

autocomplete.items(['abc','def','hij']);

autocomplete.value('a');

```

# API:

## .value(newValue)

call without arguments to get the value, call with a value to set it.

## .items(newItems)

call without arguments to get the items, call with an array to set it.

## Events

'value' Emitted whenever the value changes, passes value to the handler

'items' Emitted whenever the items change, passes items to the handler

'accept' Emitted whenever a suggestion is accepted, passes the suggestion to the handler