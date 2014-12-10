'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');

function StringInput(opt) {

    EventEmitter.call(this);

    this._onChangeInput = this._onChangeInput.bind(this);

    this._createBase();

    this._value = opt.value || '';
    this._defaultValue = opt.defaultValue || '';

    if (opt.placeholder) {

        this._input.placeholder = opt.placeholder;
    }

    if (opt.suggestions) {
        this._prepareSuggestions(opt.suggestions, opt.typeaheadOptions, opt.datasetOptions);
    };
    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(StringInput, EventEmitter);
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






p.reset = function () {

    this.value = this._defaultValue;
};







p._onChangeInput = function () {
console.log('_onChangeInput', this._input.value)
    this.value = this._input.value;
};



p._refreshInput = function () {

    if (this._input.value !== this._value) {
    
        this._input.value = this._value;
    }
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';

    this._input = amgui.createInput({
        parent: this.domElem,
        onChange: this._onChangeInput,
        flex: 1, 
    });

    // this._input.style.textAlign =  'right';
    this._input.style.paddingRight =  '2px';
};

p._prepareSuggestions = function (suggestions, typeaheadOptions, datasetOptions) {

    var states = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace(datasetOptions.displayKey),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // `states` is an array of state names defined in "The Basics"
        local: suggestions
    });

    // kicks off the loading/processing of `local` and `prefetch`
    states.initialize();

    amgui.callOnAdded(this._input, function () {

        $(this._input).typeahead(_.defaults(typeaheadOptions, {
                hint: true,
                highlight: true,
                minLength: 0
            }),
            _.defaults(datasetOptions, {
                name: 'states',
                displayKey: 'value',
                // `ttAdapter` wraps the suggestion engine in an adapter that
                // is compatible with the typeahead jQuery plugin
                source: states.ttAdapter(),
                templates: {
                    // suggestion: Handlebars.compile([
                    // '<div class="guess" style="box-shadow:-2px 2px 17px 2px rgba(50, 50, 50, 0.75);margin-bottom: 2px;width:290px;position:relative;left:-90px;font-size:10pt;background-color:#dadada; font-family: \'Open Sans\', \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif;">',
                    //   '<span><code style="font-size:16px;">{{{value}}}</code> – {{{type}}}</span>',
                    //   '<br><span>{{{description}}}</span>',
                    // '</div>'].join(''))
                }
            }))
            // .on('typeahead:autocompleted', function (e, obj, name) {
            //     console.log('autocompleted', e, obj, name)
            // })
            .on('typeahead:opened', function () {console.log('onOpened')})
            .on('typeahead:autocompleted', function () {console.log('onAutocompleted')})
            .on('typeahead:selected', function () {console.log('onSelected')})
    }, this)
/*
    var states = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: suggestions
    });

    states.initialize();

    $(this._input).typeahead(_.defaults(typeaheadOptions, {
            hint: true,
            highlight: true,
            minLength: 0
        }),
        _.defaults(datasetOptions, {
            name: 'states',
            displayKey: 'property',
            // `ttAdapter` wraps the suggestion engine in an adapter that
            // is compatible with the typeahead jQuery plugin
            source: states.ttAdapter(),
            templates: {
                // suggestion: Handlebars.compile([
                // '<div class="guess" style="box-shadow:-2px 2px 17px 2px rgba(50, 50, 50, 0.75);margin-bottom: 2px;width:290px;position:relative;left:-90px;font-size:10pt;background-color:#dadada; font-family: \'Open Sans\', \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif;">',
                //   '<span><code style="font-size:16px;">{{{value}}}</code> – {{{type}}}</span>',
                //   '<br><span>{{{description}}}</span>',
                // '</div>'].join(''))
            }
        }));
    };
    */
};


!(function ($) {

  'use strict';


}(jQuery));
