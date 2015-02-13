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

    // de.style.overflow = 'hidden';
    de.style.position = 'relative';
    // de.style.display = 'inline-block';
    de.style.whiteSpace = 'nowrap';

    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    de.addEventListener('click', function (e) {

        var crumb = getCrumbByDe(e.target);

        if (crumb) {

            if (crumb.onSelect) {
                crumb.onSelect();
            }

            de.dispatchEvent(new CustomEvent('select', {detail: {selection: crumb}}));
        }
    });

    if (opt.onSelect) {

        de.addEventListener('select', opt.onSelect);
    }

    de.setItems = function (_crumbs) {

        removeItems();

        _crumbs.forEach(function (crumb) {

            crumb.domElem = createCrumb(crumb.name, crumb.value);
            crumb.deSlash = createSlash();
            crumbs.push(crumb);

            crumb.domElem.addEventListener('click' , () => {

                if (crumb.onSelect) {
                    crumb.onSelect();
                }

                dispatchSelect(crumb);
            });
        });
    };

    return de;



    function dispatchSelect(crumb) {

        de.dispatchEvent(new CustomEvent('select', {detail: {selection: crumb}}));
    }

    function removeItems() {

        var crumb;

        while (crumbs.length) {

            crumb = crumbs.pop();

            crumb.domElem.parentNode.removeChild(crumb.domElem);
            crumb.deSlash.parentNode.removeChild(crumb.deSlash);
        }
    }

    function getCrumbByDe(deCrumb) {

        return crumbs.find(crumb => crumb.domElem === deCrumb);
    }

    function createCrumb(name, value) {

        var deChrumb = createLi(name);

        return deChrumb;
    }

    function createSlash() {

        var deSlash = createLi(' / ');
        deSlash.style.pointerEvents = 'none';

        return deSlash;
    }

    function createLi(content) {

        return amgui.createLabel({
            text: content,
            parent: de,
        });
    }
}
