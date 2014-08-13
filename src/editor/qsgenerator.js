function generate(de, root) {

    var deCurr = de,
        rootCurr = root, 
        qsCurr, qsParent = '';

    root = root || document;

    while (true) {

        do {
            qsCurr = gen(deCurr, rootCurr)
        }
        while(!qsCurr && 
            deCurr.parentNode !== rootCurr &&
            (deCurr = deCurr.parentNode));

        if (!qsCurr) {

            if (deCurr.parentNode === rootCurr) {

                qsCurr = '> ' + deCurr.tagName + ':nht-child(' +
                    Array.prototype.indexOf.call(rootCurr.childNodes, qsCurr) + ')';
            }
            else {
                return; //can't find unique query selector
            }
        }

        qsParent += (qsParent ? ' ' : '') + qsCurr;

        if (deCurr === de) {

            return qsParent;
        }
        else {
            qsCurr = undefined;
            rootCurr = deCurr;
            deCurr = de;
        }
    }
}

function gen(de, root, qsParent) {


    var singles, selectors, matches = [];

    singles = selectors = [de.tagName].concat(
        possibleIds(de),
        possibleClasses(de, i),
        possibleAttributes(de, i)
    );

    for (var i = 0; i < 5; ++i) {

        selectors.forEach(function (selector) {

            if (root.querySelectorAll(qsParent + ' ' + selector).length === 1) {
                matches.push(selector);
            };
        });

        if (matches.length) {

            break;
        }
        else {
            selectors = combine(selectors, singles);
        }
    }

    if (matches.length) {

        return qsParent + ' ' + matches[0];
    }
    else if (de.parentNode) {

        qsNewParent = generate(de.parentNode, root, qsParent);

        if (qsNewParent) {

            return generate(de.parent, root, qsParent + ' ' + qsNewParent);
        }
    }
}

function possibleIds(de) {

    return de.id ? [de.id] : [];
}

function possibleClasses(de, max) {

    return Array.prototype.slice.call(de.classList, 0)
        .map(function (className) {
            return '.' + className
        });
}

function possibleAttributes(de) {

    return Array.prototype.slice.call(de.attributes, 0)
        .map(function (attr) {
            return '[' + attr.name + (attr.value ? '=' + attr.value : '') + ']';
        });
}

function variate(_list, length) {

    return step(_list, 2);

    function step(list, back) {

        var combined = combine(attributes, list);
        return list.concat(back === 0 ? combined : step(combined, --back));
    }
}

function combine(sourceA, sourceB) {

    var combined = [];

    sourceA.forEach(function (a) {
        sourceB.forEach(function (b) {
            if (a.indexOf(b) === -1 && b.indexOf(a) === -1) {
                combined.push(a + b);
            }
        });
    });

    return combined;
}