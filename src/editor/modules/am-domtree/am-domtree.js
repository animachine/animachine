'use strict';

var DomTreeTab = require('./DomTreeTab');

var domTreeTab;

exports.init = function () {

    domTreeTab = new DomTreeTab();

    am.on('selectDomElem', onSelectDomElem);

    am.workspace.fillTab('Dom Tree', domTreeTab.domElem);
};

function onSelectDomElem(de) {

    domTreeTab.focusElem(de);
}