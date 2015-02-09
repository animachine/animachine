'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');

function StringInput(opt={}) {

    Input.call(this, opt);

    this._createBase();

    this._defaultValue = opt.defaultValue || '';
    this._value = opt.value || this._defaultValue;

    if (opt.placeholder) {

        this._input.placeholder = opt.placeholder;
    }

    if (opt.suggestions) {
        this._prepareSuggestions(opt.suggestions, opt.typeaheadOptions, opt.datasetOptions);
    };

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
});




p.setSuggestions = function (suggestions) {

    suggestions = suggestions.map((suggestion, idx) => {

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

    var template = [
        '<div class="guess" style="padding: 2px;color:'+amgui.color.textColor+';background-color:'+amgui.color.bg1+';">',
          '<span>{{{value}}}</span>',
        '</div>'].join('');

    amgui.callOnAdded(this._input, function () {

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
            .on('typeahead:opened', function () {console.log('onOpened')})
            .on('typeahead:autocompleted', function () {console.log('onAutocompleted')})
            .on('typeahead:selected', function () {console.log('onSelected')});
    }, this);
};
