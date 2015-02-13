'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');

function StringInput(opt={}) {

    Input.call(this, opt);

    if (opt.placeholder) {

        this._input.placeholder = opt.placeholder;
    }

    if (opt.suggestions) {

        this._prepareSuggestions(opt.suggestions);
    }

    this._refreshInput();
}

inherits(StringInput, Input);
var p = StringInput.prototype;
module.exports = StringInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v += '';

            if (v === this._value) return;

            this._value = v;

            this._refreshInput();

            this.emit('change', this._value);
        },
        get: function () {

            return this._value;
        }
    },
    color: {
        set: function (v) {
            this._input.style.color = v;
        },
        get: function () {
            return this._input.style.color;
        }
    }
});




p.setSuggestions = function (suggestions) {

    suggestions = suggestions.map(suggestion => {

        if (typeof suggestion !== 'object') {
            return {value: suggestion};
        }
        else {
            return suggestion;
        }
    });

    if (this._suggestionEngine) {

        this._suggestionEngine.clear();
        this._suggestionEngine.local = suggestions;
        this._suggestionEngine.initialize(true);
    }
    else {
        this._prepareSuggestions(suggestions);
    }
};







p._onChangeInput = function () {

    this.value = this._input.value;
};



p._refreshInput = function () {

    if (this._input.value !== this._value) {

        this._input.value = this._value;
    }
};




p._createInput = function () {

    this._input = amgui.createInput({
        parent: this.domElem,
        flex: 1,
        onChange: v => this._onChangeInput(v),
        value: this.value,
    });

    this.domElem.style.color = this._input.style.color;
    this._input.style.color = 'inherit';

    // this._input.style.textAlign =  'right';
    this._input.style.paddingRight =  '2px';
};

p._prepareSuggestions = function (suggestions) {

    this._suggestionEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // `states` is an array of state names defined in "The Basics"
        local: suggestions,
    });

    // kicks off the loading/processing of `local` and `prefetch`
    this._suggestionEngine.initialize();

    var template = `<div class="guess"
            style="padding: 2px;
                color:${amgui.color.textColor};
                background-color:${amgui.color.bg1};
            ">
          <span>{{{value}}}</span>
        </div>`

    amgui.callOnAdded(this._input, () => {

        $(this._input).typeahead({
                hint: true,
                highlight: true,
                minLength: 0,
            },{
                name: 'states',
                displayKey: 'value',
                // `ttAdapter` wraps the suggestion engine in an adapter that
                // is compatible with the typeahead jQuery plugin
                source: this._suggestionEngine.ttAdapter(),
                templates: {
                    suggestion: function (context) {
                        return Mustache.render(template, context);
                    }
                }
            })
            .on('typeahead:opened', () => this._onChangeInput())
            .on('typeahead:autocompleted', () => this._onChangeInput())
            .on('typeahead:selected', () => this._onChangeInput());
    });
};
