'use strict';

var DomTreeTab = require('./DomTreeTab');

var domTreeTab;

exports.init = function () {

    domTreeTab = new DomTreeTab();

    am.on('selectDomElement', onSelectDomElement);

    am.workspace.fillTab('Dom Tree', domTreeTab.domElem)
};

function onSelectDomElement(de) {

    if (de) {
        domTreeTab.focusElem(de);
    }
}