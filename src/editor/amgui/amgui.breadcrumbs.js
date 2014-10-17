'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createBreadcrumbs: createBreadcrumbs,
    };
};


function createBreadcrumbs(opt) {

    var de = document.createElement('div'),
        crumbs = [];

    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    de.addEventListener('click', function () {

        var crumb = getCrumbByDe(this);

        if (crumb) {

            if (crumb.onSelect) {
                crumb.onSelect();
            }

            de.dispatchEvent(new CustomEvent('select', {selection: crumb}));
        }
    });

    de.setItems = function (_crumbs) {

        removeItems();

        _crumbs.forEach(function (crumb) {
            
            crumb.domElem = createCrumb(crumb.name);
            crumb.deSlash = createSlash();
            crumbs.push(crumb);
        });
    };

    function removeItems() {

        var crumb;

        while (crumbs.length) {

            crumb = crumbs.pop();

            crumb.domElem.parentNode.removeChild(crumb.domElem);
            crumb.deSlash.parentNode.removeChild(crumb.deSlash);
        }
    }

    function getCrumbByDe(deCrumb) {

        var ret;

        crumbs.some(function (crumb) {

            if (crumb.domElem === deChrumb) {

                ret = deChrumb;
            }
        });

        return ret;
    }

    function createCrumb(name) {

        var deChrumb = createLi(name);

        return {
            domElem: deChrumb,
            value: value,
            deSlash: createSlash(),
        }
    }

    function createSlash() {

        var deSlash = createLi(' / ');
        deSlash.style.pointerEvents = 'none';

        return deSlash;
    }

    function createLi(content) {

        var li = document.createElement('span');
        li.textContent = content;

        de.appendChild(li);

        return li;
    }
}