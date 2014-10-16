var Predicty = require('../'),
    crel = require('crel'),
    defaultItems = [
        'bob down',
        'ben dover',
        'jill smith',
        'john smith'
    ];



var predicty = new Predicty();

predicty.items(defaultItems);
predicty.value('bo');



var itemsElement = crel('textarea');
itemsElement.value = defaultItems.join('\n');
itemsElement.addEventListener('keyup', function(){
    predicty.items(this.value.split('\n'));
});


window.addEventListener('load', function(){
    crel(document.body,
        predicty.element,
        itemsElement
    );
});