function possibleIds(de) {

    return de.id ? de.id : [];
}

function possibleClasses(de) {

    var classes = Array.prototype.slice.call(de.className, 0)
        .map(function (className) {return '.' + className});

    return step(classes, 2);

    function step(list, back) {

        var combined = combine(classes, list);
        return list.concat(back === 0 ? combined : step(combined, --back));
    }
}

function possibleClass(de) {

    return Array.from(de.className);
}


function combine(sourceA, sourceB) {

    var combined = [];

    sourceA.forEach(function (a) {
        sourceB.forEach(function (b) {
            combined.push(a + b);
        });
    });

    return combined;
}