'use strict';

var amgui = require('../../amgui');
var Branch = require('./Branch');

function DomTreeTab() {

    this._branches = [];
    this._buffBranch = [];

    this._createBase();

    this._onSelectBranch = this._onSelectBranch.bind(this);
    this._onSelectCrumb = this._onSelectCrumb.bind(this);
}

var p = DomTreeTab.prototype;
module.exports = DomTreeTab;

p._addBranch = function (opt) {

    var branch = this._buffBranch.pop() || new Branch();
    this._branches.push(branch);

    branch.setup(opt);

    branch.on('select', this._onSelectBranch);

    this._scrollCont.appendChild(branch.domElem);
}

p._removeBranch = function (branch) {

    var idx = this._branches.indexOf(branch);
    
    if (branch !== -1) {

        this._branches.splice(idx, 1);

        if (branch.domElem.parentNode) {

            branch.domElem.parentNode.removeChild(branch.domElem);
        }

        this._buffBranch.push(branch);
    }

    branch.removeListener('select', this._onSelectBranch);
}

p.focusElem = function (de) {

    var path = [], deStep = de, maxDeep = 3;

    while (this._branches.lenght) {

        this._removeBranch(this._branches[0]);
    }

    while (deStep.parentNode && deStep.nodeName !== 'HTML') {

        var deStep = deStep.parentNode;

        path.unshift({
            name: deStep.nodeName,
            value: deStep
        });
    }

    this._breadcrumbs.setItems(path);

    var step = function (de, deep) {

        this._addBranch({
            domElem: de,
            indent: deep
        });

        if (deep < maxDeep) {

            var childNodes = de.childNodes;

            for (var i = 0, l = childNodes.length; i < l; ++i) {

                step(childNodes[i], deep + 1);
            }
        }
    }.bind(this);

    step(de, 0);
};






p._onSelectBranch = function (branch) {

    am.selectDomElem(branch.domElem);
};

p._onSelectCrumb = function (e) {

    am.selectDomElem(e.detail.selection.value);
};






p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;

    this._scrollCont = document.createElement('div');
    this._scrollCont.style.width = '100%';
    this.domElem.appendChild(this._scrollCont);

    amgui.makeScrollable({
        deCont: this.domElem,
        deTarget: this._scrollCont
    });

    this._breadcrumbs = amgui.createBreadcrumbs({
        parent: this._scrollCont,
        onSelect: this._onSelectCrumb
    });
    this._breadcrumbs.style.height = '22px';
}