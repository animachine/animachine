'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogScriptEditor () {

    EventEmitter.call(this);

    this._name = '';
    this._selectors = [];

    this._onClickOk = this._onClickOk.bind(this); 
    this._onChangeScript = this._onChangeScript.bind(this);
}

inherits(DialogScriptEditor, EventEmitter);
var p = DialogScriptEditor.prototype;



Object.defineProperties(p, {

    script: {
        set: function (v) {

            v = v || '';

            if (this._script === v) {
                return;
            }

            if (this._cm && this._cm.getValue() !== v) {
                this._cm.setValue(v);
            }

            this._script = v;
            this.emit('changeScript', v);
        },
        get: function () {

            return this._script;
        }
    }
});

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    if ('script' in opt) this.script = opt.script;

    this.domElem.showModal();

    if ('onChangeScript' in opt) this.on('changeScript', opt.onChangeScript);
};

p.hide = function () {

    this.domElem.close();

    this.removeAllListeners('changeScript');
};

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        title: 'Script',
        content: this._deContent,
        parent: am.deDialogCont,
        buttons: ['ok'],
    });

    this.domElem.addEventListener('click_ok', this._onClickOk);
};

p._onClickOk = function () {

    this.hide();
};

p._onChangeScript = function (e) {

    this.script = this._cm.getValue();
};


p._createContent = function () {

    this._deContent = document.createElement('div');
    this._deContent.style.width = '480px';
    this._deContent.style.height = '330px';
    this._deContent.style.padding = '30px 12px';

    this._textarea = document.createElement('textarea');
    this._deContent.appendChild(this._textarea);

    amgui.callOnAdded(this._textarea, function () {

        this._cm = new CodeMirror.fromTextArea(this._textarea, {
            lineNumbers: true,
            theme: 'pastel-on-dark',
            mode: 'javascript'
        });
        this._cm.setValue(this.script);
        this._cm.on('change', this._onChangeScript);
    }, this)
};

module.exports = new DialogScriptEditor();
