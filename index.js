var EventEmitter = require('events').EventEmitter,
    crel = require('crel'),
    DefaultStyle = require('default-style');

new DefaultStyle('.predicty{display:inline-block;position:relative;height: 25px;width:200px;}.predictyPrediction{opacity:0.2;pointer-events:none;position:absolute; top:0;left:0;right:0;bottom:0;height:0;margin:auto 0;}.predicty *{font: inherit;}.predictyInput{position:absolute;top:0;left:0;bottom:0;right:0;width:100%;}.predictySuggestion, .predictyMask{position:relative; z-index:1;vertical-align:middle; line-height:0;}.predictyMask{opacity:0;padding-right:2px;}');

function Predicty(){
    this._render();
    this._bindEvents();
    this._update();
}
Predicty.prototype = Object.create(EventEmitter.prototype);
Predicty.prototype.constructor = Predicty;
Predicty.prototype._value = '';
Predicty.prototype.value = function(value){
    if(!arguments.length){
        return this._value;
    }

    if(value == this._value){
        return;
    }

    this._value = ''+value;
    this._update();
    this.emit('value', this._value);
};
Predicty.prototype._items = [];
Predicty.prototype.items = function(items){
    if(!arguments.length){
        return this._items;
    }

    if(!Array.isArray(items)){
        return;
    }

    this._items = items.slice();
    this._update();
    this.emit('value', items);
};
Predicty.prototype._acceptPredition = function(){
    if(this._suggestion != null){
        this.value(this._suggestion);
        this.emit('accept', this._suggestion);
    }
};
Predicty.prototype._matchItem = function(value, item){
    return value && item.toLowerCase().indexOf(value.toLowerCase()) === 0;
};
Predicty.prototype._match = function(value){
    var items = this.items();
    for(var i = 0; i < items.length; i++){
        if(this._matchItem(value, items[i])){
            return items[i];
        }
    }
};
Predicty.prototype._updateValue = function(value){
    this.inputElement.value = value;
};
Predicty.prototype._updateSuggestion = function(value, suggestion){
    this.maskElement.textContent = value;
    this.suggestionElement.textContent = suggestion;
};
Predicty.prototype._update = function(){
    var value = this.value();

    this._suggestion = this._match(value);

    this._updateValue(value);

    if(!this._suggestion){
        this._updateSuggestion(value);
        return;
    }
    this._updateSuggestion(value, this._suggestion.slice(value.length));
};
Predicty.prototype._bindEvents = function(){
    var predicty = this;

    this._inputListener = function(event){
        predicty.value(this.value);
    };

    this._tabListener = function(event){
        if(event.which === 9){
            event.preventDefault();
            predicty._acceptPredition();
        }
    };

    this.inputElement.addEventListener('keyup', this._inputListener);
    this.inputElement.addEventListener('keydown', this._tabListener);
};
Predicty.prototype._render = function(){
    this.element = crel('span', {'class':'predicty'},
        this.inputElement = crel('input', {'class':'predictyInput'}),
        this.predictionElement = crel('div', {'class':'predictyPrediction'},
            this.maskElement = crel('span', {'class':'predictyMask'}),
            this.suggestionElement = crel('span', {'class':'predictySuggestion'})
        )
    );
};
Predicty._debind = function(){
    if(this._inputListener){
        this.inputElement.removeEventListener('keyup', this._inputListener);
        this._inputListener = null;
    }
    if(this._tabListener){
        this.inputElement.removeEventListener('keydown', this._tabListener);
        this._tabListener = null;
    }
};

module.exports = Predicty;