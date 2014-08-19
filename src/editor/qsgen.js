// document.body.addEventListener('click', function(e){
//     console.log(generate(e.target));
// });

function generate(de, root) {

    root = root || document;

    var deCurr = de,
        rootCurr = root, 
        qsCurr, qsParent = '';

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

function gen(de, root) {


    var singles, selectors, matches = [];

    singles = selectors = [de.tagName].concat(
        possibleIds(de),
        possibleClasses(de, i),
        possibleAttributes(de, i)
    );

    for (var i = 0; i < 5; ++i) {

        selectors.forEach(function (selector) {

            if (root.querySelectorAll(selector).length === 1) {
                matches.push(selector);
            };
        });

        if (matches.length) {

            return matches[0];
        }
        else {
            selectors = combine(selectors, singles);
        }
    }
}

function possibleIds(de) {

    return de.id ? ['#' + CSS.escape(de.id)] : [];
}

function possibleClasses(de, max) {

    return Array.prototype.slice.call(de.classList, 0)
        .map(function (className) {
            return '.' + CSS.escape(className)
        });
}

function possibleAttributes(de) {

    return Array.prototype.slice.call(de.attributes, 0)
        .filter(function(attr) {
            return attr.name !== 'id' && attr.name !== 'class';
        })
        .map(function (attr) {
            return '[' + CSS.escape(attr.name) + (attr.value ? '="' + attr.value : '') + '"]';
        });
}

// function variate(_list, length) {

//     return step(_list, 2);

//     function step(list, back) {

//         var combined = combine(attributes, list);
//         return list.concat(back === 0 ? combined : step(combined, --back));
//     }
// }

function combine(sourceA, sourceB) {

    var combined = [];

    sourceA.forEach(function (a) {
        sourceB.forEach(function (b) {
            if (a.indexOf(b) === -1 && b.indexOf(a) === -1 &&
                '#.[:'.indexOf(b.charAt(0)) !== -1) 
            {
                combined.push(a + b);
            }
        });
    });

    return combined;
}

module.exports = generate;
