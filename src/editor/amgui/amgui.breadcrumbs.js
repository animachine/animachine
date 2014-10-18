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

    de.style.overflow ='hidden';

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
            
            crumb.domElem = createCrumb(crumb.name, crumb.value);
            crumb.deSlash = createSlash();
            crumbs.push(crumb);
        });
    };

    return de;





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

    function createCrumb(name, value) {

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
        li.style.float = 'left';

        de.appendChild(li);

        return li;
    }
}